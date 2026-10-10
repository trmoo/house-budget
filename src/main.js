/*! 내 집 예산 계산기 · © 2026 티쳐무 · 모든 권리 보유 */
// 화면을 조립한다 — 가림막 → (머리말 · 탭 · 요약 줄 · 본문)

import './style.css';
import { 열렸나, 가림막화면 } from './gate.js';
import { 상태, 불러오기, 그리기등록, 요약등록, 다시그리기 } from './lib/store.js';
import { h, 비우기, beginScreen, 상자 } from './lib/ui.js';
import { 돈, 억짧게 } from './lib/fmt.js';
import { 계산, 최대매수가 } from './engine/all.js';
import { 기준일 } from './rules.js';
import * as 내상황 from './tabs/t1-me.js';
import * as 집지역 from './tabs/t2-house.js';
import * as 결과 from './tabs/t3-result.js';
import * as 근거 from './tabs/t4-rules.js';

const 탭들 = [
  { 키: 'me', 글자: '① 내 상황', 그리기: 내상황.그리기 },
  { 키: 'house', 글자: '② 집·지역', 그리기: 집지역.그리기 },
  { 키: 'result', 글자: '③ 결과', 그리기: 결과.그리기 },
  { 키: 'rules', 글자: '④ 근거', 그리기: 근거.그리기 },
];

let 바탕 = null;
let 요약막 = null;

function 지금탭() {
  const 해시 = location.hash.replace('#', '');
  return 탭들.find((t) => t.키 === 해시) || 탭들[0];
}

/** 머리말 아래 요약 줄 — 입력하는 동안 이것만 다시 쓴다 */
function 요약쓰기() {
  if (!요약막) return;
  const c = 계산(상태);
  const 최대 = 최대매수가(상태);
  const 추천 = c.추천;
  const 모자람 = 추천 ? 추천.차이 : -1;
  비우기(요약막);
  요약막.appendChild(h('div', { class: 'summary-in' },
    칸하나('살 수 있는 값', 억짧게(최대.값)),
    칸하나('대출', 추천 && 추천.가능 ? 억짧게(추천.대출) : '—'),
    칸하나(모자람 >= 0 ? '남는 돈' : '모자란 돈', 추천 ? 억짧게(Math.abs(모자람)) : '—',
      모자람 >= 0 ? 'good' : 'bad'),
    칸하나('월 상환', 추천 && 추천.가능 ? `${Math.round(추천.월상환원 / 10000)}만원` : '—')));
}

function 칸하나(이름, 값, 색) {
  return h('div', { class: 'sum' },
    h('div', { class: 'sum-name' }, 이름),
    h('div', { class: `sum-val ${색 || ''}` }, 값));
}

function 전체쓰기() {
  beginScreen();
  비우기(바탕);
  const 탭 = 지금탭();

  바탕.appendChild(h('header', { class: 'top' },
    h('div', { class: 'top-in' },
      h('span', { class: 'top-title' }, '🏠 내 집 예산 계산기'),
      h('span', { class: 'top-sub' }, `${기준일} 규정`))));

  바탕.appendChild(h('nav', { class: 'tabs' },
    h('div', { class: 'tabs-in' },
      탭들.map((t) => h('button', {
        class: `tab ${t.키 === 탭.키 ? 'on' : ''}`,
        onclick: () => { location.hash = t.키; },
      }, t.글자)))));

  요약막 = h('div', { class: 'summary' });
  바탕.appendChild(요약막);
  요약쓰기();

  const 통 = h('main', { class: 'wrap' });
  바탕.appendChild(통);
  탭.그리기(통);

  바탕.appendChild(h('footer', { class: 'foot' },
    h('b', {}, '© 2026 티쳐무 · 모든 권리 보유'),
    ' — 공개된 규정으로 셈한 추정입니다. 은행의 심사 결과가 아니고, 금융·세무 상담을 대신할 수 없습니다. ',
    '적어 넣은 값은 이 브라우저에만 남습니다.'));
}

function 시작() {
  비우기(바탕);
  불러오기();
  그리기등록(전체쓰기);
  요약등록(요약쓰기);
  if (!location.hash) location.hash = 'me';
  window.addEventListener('hashchange', () => 전체쓰기());
  전체쓰기();
}

function 켜기() {
  바탕 = document.getElementById('app');
  if (!바탕) return;
  if (열렸나()) 시작();
  else 바탕.appendChild(가림막화면(() => 시작()));
}

// ⚠ 빌드본에서는 이 코드가 **평범한 `<script>`** 로 들어간다(모듈이 아니다).
//    그러니 DOM 이 다 그려진 뒤에 시작해야 한다 — 안 그러면 `#app` 을 못 찾아 흰 화면이 된다.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', 켜기);
} else {
  켜기();
}
