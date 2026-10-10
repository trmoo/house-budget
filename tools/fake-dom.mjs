/*! 내 집 예산 계산기 · © 2026 티쳐무 · 모든 권리 보유 */
// 아주 작은 가짜 DOM — 빌드본을 node 에서 **실제로 돌려 보기** 위한 것.
//
// 왜 필요한가: 글자 검사만으로는 「빌드본이 안 돌아간다」를 못 잡는다.
// 2026-10-10 에 배포본이 흰 화면이었는데, 크기·저작권·바깥 자원 검사는 모두 통과했었다.

class Node {
  constructor() { this.childNodes = []; this.parentElement = null; }
  get children() { return this.childNodes.filter((c) => c instanceof Element); }
  get firstChild() { return this.childNodes[0] || null; }
  appendChild(c) { c.parentElement = this; this.childNodes.push(c); return c; }
  removeChild(c) {
    const i = this.childNodes.indexOf(c);
    if (i >= 0) this.childNodes.splice(i, 1);
    c.parentElement = null;
    return c;
  }
  remove() { if (this.parentElement) this.parentElement.removeChild(this); }
  get textContent() { return this.childNodes.map((c) => c.textContent).join(''); }
  set textContent(v) { this.childNodes = []; if (v !== '') this.appendChild(new Text(String(v))); }
}

class Text extends Node {
  constructor(글) { super(); this.글 = 글; }
  get textContent() { return this.글; }
  set textContent(v) { this.글 = String(v); }
}

class Element extends Node {
  constructor(태그) {
    super();
    this.tagName = String(태그).toUpperCase();
    this.attrs = {};
    this.className = '';
    this.id = '';
    this.style = {};
    this.value = '';
    this.checked = false;
    this.disabled = false;
    this.듣는이 = {};
    this.innerHTMLText = '';
    const 나 = this;
    this.classList = {
      add(...c) { 나.className = [...new Set([...나.className.split(' ').filter(Boolean), ...c])].join(' '); },
      remove(...c) { 나.className = 나.className.split(' ').filter((x) => x && !c.includes(x)).join(' '); },
      toggle(c, 켤까) { 켤까 ? this.add(c) : this.remove(c); },
      contains(c) { return 나.className.split(' ').includes(c); },
    };
  }
  setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'id') this.id = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  set innerHTML(v) { this.innerHTMLText = String(v); }
  get innerHTML() { return this.innerHTMLText; }
  addEventListener(t, fn) { (this.듣는이[t] = this.듣는이[t] || []).push(fn); }
  removeEventListener(t, fn) { this.듣는이[t] = (this.듣는이[t] || []).filter((f) => f !== fn); }
  /** 시험에서 손으로 사건을 일으킨다 */
  fire(t, ev = {}) { for (const fn of this.듣는이[t] || []) fn({ target: this, ...ev }); }
  focus() { 문서.activeElement = this; }
  select() {}
  setSelectionRange() {}
  closest(sel) {
    let p = this;
    while (p) { if (맞나(p, sel)) return p; p = p.parentElement; }
    return null;
  }
  querySelector(sel) { return 훑기(this).find((e) => 맞나(e, sel)) || null; }
  querySelectorAll(sel) { return 훑기(this).filter((e) => 맞나(e, sel)); }
}

function 훑기(뿌리) {
  const 모음 = [];
  for (const c of 뿌리.childNodes) {
    if (c instanceof Element) { 모음.push(c); 모음.push(...훑기(c)); }
  }
  return 모음;
}

function 맞나(el, sel) {
  if (!(el instanceof Element)) return false;
  return String(sel).split(',').map((s) => s.trim()).some((s) => {
    if (s.startsWith('.')) return el.classList.contains(s.slice(1));
    if (s.startsWith('#')) return el.id === s.slice(1);
    return el.tagName === s.toUpperCase();
  });
}

const 문서 = new Element('html');
문서.body = new Element('body');
문서.appendChild(문서.body);
문서.activeElement = null;
문서.readyState = 'loading';
문서.createElement = (t) => new Element(t);
문서.createTextNode = (t) => new Text(String(t));
문서.getElementById = (id) => 훑기(문서).find((e) => e.id === id) || null;
문서.querySelector = (s) => 문서.querySelector === undefined ? null : 훑기(문서).find((e) => 맞나(e, s)) || null;
문서.querySelectorAll = (s) => 훑기(문서).filter((e) => 맞나(e, s));
문서.documentElement = 문서;

/** 빌드본을 돌릴 때 쓸 전역들 */
export function 가짜세상() {
  const 저장소 = {};
  const 창 = {
    scrollY: 0,
    innerWidth: 1024,
    scrollTo() {},
    addEventListener() {},
    removeEventListener() {},
    location: { hash: '' },
    localStorage: {
      getItem: (k) => (k in 저장소 ? 저장소[k] : null),
      setItem: (k, v) => { 저장소[k] = String(v); },
      removeItem: (k) => { delete 저장소[k]; },
    },
    setTimeout: (fn) => { fn(); return 0; },
    clearTimeout() {},
    setInterval: () => 0,
    clearInterval() {},
  };
  const 앱 = new Element('div');
  앱.setAttribute('id', 'app');
  문서.body.childNodes = [];
  문서.body.appendChild(앱);
  문서.activeElement = null;
  // vite 가 넣는 모듈 미리읽기 폴리필이 쓰는 것들 (가짜로 둔다)
  class MutationObserver {
    observe() {}
    disconnect() {}
  }
  return {
    document: 문서, window: 창, Node, Element, Text, MutationObserver,
    fetch: () => Promise.resolve({}),
    location: 창.location, localStorage: 창.localStorage,
    setTimeout: 창.setTimeout, clearTimeout: 창.clearTimeout,
    setInterval: 창.setInterval, clearInterval: 창.clearInterval,
    console, 앱, 훑기, 맞나,
  };
}
