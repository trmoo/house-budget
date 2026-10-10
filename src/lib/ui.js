/*! 내 집 예산 계산기 · © 2026 티쳐무 · 모든 권리 보유 */
// 화면을 만드는 연장들.
//
// ⚠ 화면 파일에서 `window.addEventListener('resize', …)` 나 `setInterval` 을 직접 쓰지 말 것 —
//   탭을 옮겨도 살아남아 쌓인다. 여기의 `onResize()`·`screenTimer()` 를 쓴다.
// ⚠ 브라우저 기본 `alert`·`confirm`·`prompt` 를 쓰지 말 것 — 크롬이 주소를 함께 보여 준다.
//   `say()`·`ask()`·`modal()` 을 쓴다.
// ⚠ `h()` 의 자식 자리에 HTML 태그를 글자로 넣지 말 것 — 글자 그대로 보인다. `{html: …}` 를 쓴다.

import { 숫자, 숫자읽기 } from './fmt.js';

/* ────────── DOM 만들기 ────────── */

export function h(태그, 속성, ...자식들) {
  const el = document.createElement(태그);
  const p = 속성 || {};
  for (const [k, v] of Object.entries(p)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class' || k === 'className') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'on') for (const [이름, fn] of Object.entries(v)) el.addEventListener(이름, fn);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'value') el.value = v;
    else if (k === 'checked' || k === 'disabled' || k === 'open') el[k] = !!v;
    else el.setAttribute(k, v);
  }
  붙이기(el, 자식들);
  return el;
}

function 붙이기(el, 자식들) {
  for (const c of 자식들.flat(4)) {
    if (c === null || c === undefined || c === false || c === true) continue;
    /* ★ `rules.js` 의 글에는 `**굵게**` 표시가 섞여 있다. 쓰는 쪽에서 `굵게()` 를 빠뜨리면
       화면에 별표가 그대로 찍힌다(2026-10-10 검토에서 다섯 곳이 걸렸다).
       부르는 곳마다 챙기게 하지 않고 **여기 한 곳에서** 바꾼다. */
    if (typeof c === 'string' && c.includes('**')) { 붙이기(el, [굵게(c)]); continue; }
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

/** 자식을 모두 지운다 */
export function 비우기(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

/* ────────── 화면 수명 ────────── */

let 수명 = { resize: [], timer: [] };

window.addEventListener('resize', () => {
  for (const fn of 수명.resize) {
    try { fn(); } catch (e) { console.error(e); }
  }
});

/** 새 화면을 그리기 직전에 부른다 — 앞 화면이 걸어 둔 것을 걷어 낸다 */
export function beginScreen() {
  for (const id of 수명.timer) clearInterval(id);
  수명 = { resize: [], timer: [] };
}

export function onResize(fn) { 수명.resize.push(fn); }

export function screenTimer(fn, ms) {
  const id = setInterval(fn, ms);
  수명.timer.push(id);
  return id;
}

/* ────────── 대화상자 (브라우저 기본 창을 쓰지 않는다) ────────── */

export function modal({ 제목, 본문 = [], 단추들 = [{ 글자: '확인', 값: true }] }) {
  return new Promise((resolve) => {
    let 끝났나 = false;
    const 닫기 = (값) => {
      if (끝났나) return;
      끝났나 = true;
      document.body.classList.remove('modal-open');
      막.remove();
      document.removeEventListener('keydown', 키);
      resolve(값);
    };
    const 키 = (e) => { if (e.key === 'Escape') 닫기(null); };
    const 상자 = h('div', { class: 'modal-box', role: 'dialog', 'aria-modal': 'true' },
      제목 ? h('h3', { class: 'modal-title' }, 제목) : null,
      h('div', { class: 'modal-body' }, 본문.map((n) => (n instanceof Node ? n : h('p', {}, n)))),
      h('div', { class: 'modal-foot' }, 단추들.map((b) =>
        h('button', { class: `btn ${b.약하게 ? 'btn-weak' : 'btn-main'}`, onclick: () => 닫기(b.값) }, b.글자)))
    );
    const 막 = h('div', { class: 'modal-back', onclick: (e) => { if (e.target === 막) 닫기(null); } }, 상자);
    document.body.classList.add('modal-open');
    document.body.appendChild(막);
    document.addEventListener('keydown', 키);
    const 첫단추 = 상자.querySelector('.btn-main') || 상자.querySelector('button');
    if (첫단추) 첫단추.focus();
  });
}

export const say = (글, 제목 = '알림') => modal({ 제목, 본문: Array.isArray(글) ? 글 : [글] });

export const ask = (글, 제목 = '확인') => modal({
  제목,
  본문: Array.isArray(글) ? 글 : [글],
  단추들: [{ 글자: '취소', 값: false, 약하게: true }, { 글자: '그렇게 할게요', 값: true }],
});

/* ────────── 모양 틀 ────────── */

/** 제목이 붙은 카드 */
export function 카드(제목, ...내용) {
  return h('section', { class: 'card' },
    제목 ? h('h3', { class: 'card-title' }, 제목) : null,
    ...내용);
}

/** 자료에 적어 둔 `**굵게**` 를 살려서 넣는다 (h() 자식 자리에 쓸 수 있는 조각들로) */
export function 굵게(글) {
  return String(글).split(/\*\*(.+?)\*\*/g).map((t, i) => (i % 2 === 1 ? h('b', {}, t) : t));
}

/** 안내·경고·주의 상자. 종류: 'info' | 'warn' | 'bad' | 'good' */
export function 상자(종류, ...내용) {
  return h('div', { class: `note note-${종류}` }, ...내용);
}

/** 이름 ─ 값 한 줄 */
export function 줄(이름, 값, 뒷말) {
  return h('div', { class: 'row' },
    h('span', { class: 'row-name' }, 이름),
    h('span', { class: 'row-val' }, 값, 뒷말 ? h('span', { class: 'row-sub' }, ' ', 뒷말) : null));
}

/** 큰 숫자를 보여 주는 칸 */
export function 수칸(이름, 값, 밑말, 강조) {
  return h('div', { class: `stat ${강조 ? 'stat-hi' : ''}` },
    h('div', { class: 'stat-name' }, 이름),
    h('div', { class: 'stat-val' }, 값),
    밑말 ? h('div', { class: 'stat-sub' }, 밑말) : null);
}

/** 표. 머리는 글자 배열, 줄들은 칸 배열의 배열 (칸은 글자나 Node) */
export function 표(머리, 줄들, 반) {
  return h('div', { class: 'table-wrap' },
    h('table', { class: `tbl ${반 || ''}` },
      머리 ? h('thead', {}, h('tr', {}, 머리.map((c) => h('th', {}, c)))) : null,
      h('tbody', {}, 줄들.map((r) =>
        h('tr', { class: r.강조 ? 'hi' : '' }, (r.칸 || r).map((c) => h('td', {}, c)))))));
}

/** 접었다 펴는 상자. 펼친 상태는 아이디로 기억한다(다시 그려도 열려 있다) */
const 펼친것 = new Set();
export function 접이(제목, ...내용) {
  const 키 = String(제목);
  const d = h('details', { class: 'fold', open: 펼친것.has(키) },
    h('summary', {}, 제목), ...내용);
  d.addEventListener('toggle', () => { d.open ? 펼친것.add(키) : 펼친것.delete(키); });
  return d;
}

/* ────────── 입력 칸 ────────── */

/**
 * 돈 넣는 칸. 만원 단위.
 * ⚠ 글자를 칠 때마다 칸을 다시 쓰면 커서가 끝으로 튄다 — 그래서 쉼표는 손을 뗄 때(change)만 넣는다.
 */
export function 돈입력({ 값, 단위 = '만원', onInput, onChange, 작게, 넓게, id }) {
  const inp = h('input', {
    type: 'text', inputmode: 'numeric', class: 'num', id,
    value: 숫자(값),
    oninput: (e) => { if (onInput) onInput(숫자읽기(e.target.value)); },
    onchange: (e) => {
      const v = 숫자읽기(e.target.value);
      e.target.value = 숫자(v);
      if (onChange) onChange(v);
    },
    onfocus: (e) => e.target.select(),
  });
  return h('div', { class: `inp ${작게 ? 'inp-sm' : ''} ${넓게 ? 'inp-wide' : ''}` },
    inp, h('span', { class: 'unit' }, 단위));
}

/** 소수를 넣는 칸(금리·면적). ⚠ 쓰던 글자를 건드리지 않는다 — 3.85 가 「4」로 바뀌면 안 된다 */
export function 수입력({ 값, 단위, onInput, onChange, 작게, id }) {
  const inp = h('input', {
    type: 'text', inputmode: 'decimal', class: 'num', id,
    value: String(값 ?? ''),
    oninput: (e) => { if (onInput) onInput(숫자읽기(e.target.value)); },
    onchange: (e) => { if (onChange) onChange(숫자읽기(e.target.value)); },
    onfocus: (e) => e.target.select(),
  });
  return h('div', { class: `inp ${작게 ? 'inp-sm' : ''}` },
    inp, 단위 ? h('span', { class: 'unit' }, 단위) : null);
}

/** 한 칸 묶음: 이름 + 도움말 + 입력 */
export function 칸(이름, 도움말, ...내용) {
  return h('div', { class: 'field' },
    h('label', { class: 'field-name' }, 이름),
    도움말 ? h('span', { class: 'field-hint' }, 도움말) : null,
    ...내용);
}

/**
 * 고르기 단추들. ⚠ 기본으로 골라진 것이 없게 할 수 있다(값이 undefined 면 아무것도 안 골라짐).
 * 항목: [{값, 글자, 설명}]
 */
export function 고르기({ 항목들, 값, onPick, 칸수 }) {
  return h('div', { class: `opts cols-${칸수 || 항목들.length}` },
    항목들.map((o) => h('button', {
      type: 'button',
      class: `opt ${o.값 === 값 ? 'on' : ''}`,
      onclick: () => onPick(o.값),
    },
    h('span', { class: 'opt-title' }, o.글자),
    o.설명 ? h('span', { class: 'opt-desc' }, o.설명) : null)));
}

/** 켜고 끄는 스위치 */
export function 스위치({ 켜짐, 글자, 설명, onToggle }) {
  return h('button', {
    type: 'button', class: `sw ${켜짐 ? 'on' : ''}`, 'aria-pressed': 켜짐 ? 'true' : 'false',
    onclick: () => onToggle(!켜짐),
  },
  h('span', { class: 'sw-box' }, 켜짐 ? '✓' : ''),
  h('span', { class: 'sw-text' },
    h('span', { class: 'sw-title' }, 글자),
    설명 ? h('span', { class: 'sw-desc' }, 설명) : null));
}
