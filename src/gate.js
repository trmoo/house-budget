/*! 내 집 예산 계산기 · © 2026 티쳐무 · 모든 권리 보유 */
// 비밀번호 가림막.
//
// ⚠ 이것은 「잠금」이 아니라 「가림막」이다. 여섯 자리 숫자는 경우의 수가 100만 가지뿐이어서,
//   해시로 저장해도 작정하고 달려들면 몇 분 안에 풀린다. 그래서 이 화면이 막아 주는 것은
//   「주소를 우연히 알게 된 사람이 그냥 들어오는 것」까지다.
//   대신 계산기 안에는 가려야 할 내용이 없다 — 규정과 계산식뿐이고, 입력한 금액·소득은
//   서버로 보내지 않고 그 브라우저에만 남는다. 그래서 이 수준으로 둔다.
//   (진짜로 막아야 할 내용이 생기면 긴 바탕말로 내용을 암호화하거나 서버가 확인하게 해야 한다.)

import { h } from './lib/ui.js';

// SHA-256('house-budget:' + 비밀번호)
const 정답해시 = '6bb6139d1d16df29f25b1ac6dba5871ef6884aa461bb152b6e00ef175d675695';
const 소금 = 'house-budget:';
const 열쇠 = 'house-budget-gate-v1';

/* ────────── SHA-256 (직접 구현) ──────────
   `crypto.subtle` 은 비동기이고 보안 컨텍스트가 필요하다. 이 앱은 `dist/index.html` 을
   더블클릭해서(file://) 열 수 있어야 하므로 짧게 직접 만들어 쓴다. 시험이 node 의
   crypto 결과와 맞대어 본다. */

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function 돌리기(x, n) { return (x >>> n) | (x << (32 - n)); }

function utf8바이트(글자) {
  const out = [];
  for (const ch of String(글자)) {
    let c = ch.codePointAt(0);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return out;
}

export function sha256(글자) {
  const 바이트 = utf8바이트(글자);
  const 길이비트 = 바이트.length * 8;
  바이트.push(0x80);
  while (바이트.length % 64 !== 56) 바이트.push(0);
  // 길이는 64비트지만 여기 들어오는 글은 짧으니 아래 32비트만 쓴다
  바이트.push(0, 0, 0, 0,
    (길이비트 >>> 24) & 255, (길이비트 >>> 16) & 255, (길이비트 >>> 8) & 255, 길이비트 & 255);

  let [h0, h1, h2, h3, h4, h5, h6, h7] =
    [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Array(64);

  for (let i = 0; i < 바이트.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = (바이트[i + t * 4] << 24) | (바이트[i + t * 4 + 1] << 16)
        | (바이트[i + t * 4 + 2] << 8) | 바이트[i + t * 4 + 3];
    }
    for (let t = 16; t < 64; t++) {
      const s0 = 돌리기(w[t - 15], 7) ^ 돌리기(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = 돌리기(w[t - 2], 17) ^ 돌리기(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, hh] = [h0, h1, h2, h3, h4, h5, h6, h7];
    for (let t = 0; t < 64; t++) {
      const S1 = 돌리기(e, 6) ^ 돌리기(e, 11) ^ 돌리기(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K[t] + w[t]) | 0;
      const S0 = 돌리기(a, 2) ^ 돌리기(a, 13) ^ 돌리기(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0;
      d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + hh) | 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

/* ────────── 가림막 ────────── */

export function 맞나(비밀번호) {
  return sha256(소금 + String(비밀번호 ?? '').trim()) === 정답해시;
}

export function 열렸나() {
  try { return localStorage.getItem(열쇠) === 정답해시; } catch (e) { return false; }
}

export function 기억하기() {
  try { localStorage.setItem(열쇠, 정답해시); } catch (e) { /* 무시 */ }
}

export function 잠그기() {
  try { localStorage.removeItem(열쇠); } catch (e) { /* 무시 */ }
}

/** 비밀번호 화면을 그린다. 맞히면 `열렸을때()` 를 부른다. */
export function 가림막화면(열렸을때) {
  const 알림 = h('div', { class: 'gate-msg' });
  const 기억 = h('input', { type: 'checkbox', id: 'gate-keep', checked: true });

  const 칸 = h('input', {
    type: 'password', inputmode: 'numeric', id: 'gate-pw', class: 'gate-input',
    placeholder: '비밀번호', autocomplete: 'current-password',
    onkeydown: (e) => { if (e.key === 'Enter') 눌림(); },
  });

  function 눌림() {
    if (맞나(칸.value)) {
      if (기억.checked) 기억하기();
      열렸을때();
      return;
    }
    알림.textContent = '비밀번호가 맞지 않습니다.';
    칸.value = '';
    칸.focus();
  }

  const 화면 = h('div', { class: 'gate' },
    h('div', { class: 'gate-card' },
      h('div', { class: 'gate-emoji' }, '🏠'),
      h('h1', { class: 'gate-title' }, '내 집 예산 계산기'),
      h('p', { class: 'gate-sub' }, '2026년 10월 규정으로 셈합니다'),
      칸,
      h('button', { class: 'btn btn-main gate-btn', onclick: 눌림 }, '들어가기'),
      알림,
      h('label', { class: 'gate-keep' }, 기억, ' 이 브라우저에서 기억하기'),
      h('p', { class: 'gate-foot' }, '© 2026 티쳐무 · 모든 권리 보유')));

  setTimeout(() => 칸.focus(), 0);
  return 화면;
}
