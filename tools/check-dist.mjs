/*! 내 집 예산 계산기 · © 2026 티쳐무 · 모든 권리 보유 */
// 빌드 결과를 검사한다. 하나라도 어긋나면 빌드를 실패시킨다.

import { readFileSync, existsSync, statSync } from 'node:fs';
import vm from 'node:vm';
import { 가짜세상 } from './fake-dom.mjs';

const 집 = process.argv[2] || 'dist/index.html';
const 틀림 = [];

if (!existsSync(집)) {
  console.error('✗ dist/index.html 이 없습니다.');
  process.exit(1);
}

const 글 = readFileSync(집, 'utf8');
const 크기 = statSync(집).size;
const 세기 = (토막) => (글.match(new RegExp(토막, 'g')) || []).length;

if (크기 < 60000) 틀림.push(`파일이 너무 작습니다 (${크기} 바이트) — 합치기가 안 된 것 같습니다`);
if (크기 > 1500000) 틀림.push(`파일이 너무 큽니다 (${크기} 바이트)`);

// 바깥 자원을 하나도 보지 않아야 한다 (인터넷 없이 더블클릭으로 열린다)
if (/<script[^>]+src=/.test(글)) 틀림.push('바깥 스크립트를 부르고 있습니다');
if (/<link[^>]+stylesheet/.test(글)) 틀림.push('바깥 스타일시트를 부르고 있습니다');
if (글.includes('./assets/') || 글.includes('/assets/')) 틀림.push('assets 경로가 남아 있습니다');

// ★ 스크립트가 `#app` 보다 **뒤에** 있어야 한다.
//   합쳐 넣은 스크립트는 모듈이 아니라서 미뤄지지 않는다 — <head> 에 있으면 `#app` 을 못 찾아
//   흰 화면이 된다(2026-10-10 배포본에서 실제로 겪었다. 글자 검사만으로는 안 잡혔다).
const 앱자리 = 글.indexOf('id="app"');
const 스크립트자리 = 글.indexOf('<script');
if (앱자리 < 0) 틀림.push('#app 이 없습니다');
else if (스크립트자리 >= 0 && 스크립트자리 < 앱자리) {
  틀림.push('스크립트가 #app 보다 앞에 있습니다 — DOM 이 없는 상태로 돌아 흰 화면이 됩니다');
}

// ★ 합쳐 넣은 스크립트가 **진짜로 파싱되는가**. 글자 검사만으로는 깨진 번들을 못 잡는다.
//   (`replace` 가 `$&` 를 바꿔치기해 번들이 깨진 적이 있다 — 2026-10-10)
const 스크립트 = 글.slice(글.indexOf('<script>') + 8, 글.lastIndexOf('</script>'));
if (스크립트.length < 10000) 틀림.push('합쳐 넣은 스크립트가 너무 짧습니다');
try {
  // eslint-disable-next-line no-new-func
  new Function(스크립트);
} catch (e) {
  틀림.push(`합쳐 넣은 스크립트가 파싱되지 않습니다 — ${e.message}`);
}

// 저작권 표시 — HTML 주석 · /*! 배너 · 화면 푸터
const 저작권 = 세기('티쳐무');
if (저작권 < 3) 틀림.push(`저작권 표시가 ${저작권}곳뿐입니다 (3곳 이상이어야 합니다)`);

// 가림막
if (!글.includes('6bb6139d1d16df29f25b1ac6dba5871ef6884aa461bb152b6e00ef175d675695')) {
  틀림.push('비밀번호 해시가 없습니다');
}
if (글.includes('202610')) 틀림.push('비밀번호가 글자 그대로 들어 있습니다');

// 규정 기준일과 「모른다」를 밝히는 문구
if (!글.includes('2026-10-10')) 틀림.push('규정 기준일이 없습니다');
if (!글.includes('심사 결과가 아니')) 틀림.push('「은행 심사 결과가 아니다」라는 문구가 없습니다');

/* ★★ 가장 중요한 검사 — 빌드본을 **실제로 돌려 본다**.
      글자 검사는 다 통과하는데 화면은 흰 채로 나오는 일이 2026-10-10 에 실제로 있었다
      (① 스크립트가 `#app` 보다 앞에 놓임 ② `replace` 가 번들의 `$&` 를 바꿔치기). */
try {
  const 세상 = 가짜세상();
  const ctx = vm.createContext(세상);
  vm.runInContext(스크립트, ctx, { filename: 'dist-bundle.js' });
  // 진짜 브라우저에서 `</body>` 앞의 스크립트가 돌 때처럼 readyState 는 아직 'loading' 이다.
  // 그 뒤에 오는 DOMContentLoaded 를 일으켜 준다.
  세상.document.fire('DOMContentLoaded');

  if (세상.앱.children.length === 0) {
    틀림.push('빌드본을 돌렸더니 화면에 아무것도 그려지지 않았습니다 (흰 화면)');
  } else {
    const 첫화면 = 세상.앱.textContent;
    if (!첫화면.includes('내 집 예산 계산기')) 틀림.push(`첫 화면에 제목이 없습니다 — ${첫화면.slice(0, 40)}`);

    // 비밀번호를 넣어 열어 본다
    const 칸 = 세상.훑기(세상.앱).find((e) => e.attrs.type === 'password');
    const 단추 = 세상.훑기(세상.앱).find((e) => e.textContent === '들어가기');
    if (!칸 || !단추) {
      틀림.push('비밀번호 칸이나 들어가기 단추가 없습니다');
    } else {
      칸.value = '202610';
      단추.fire('click');
      const 속 = 세상.앱.textContent;
      for (const 있어야할 of ['내 상황', '집·지역', '결과', '근거', '살 수 있는 값']) {
        if (!속.includes(있어야할)) 틀림.push(`비밀번호를 넣었는데 「${있어야할}」 이 안 보입니다`);
      }
    }
  }
} catch (e) {
  틀림.push(`빌드본을 돌리다가 터졌습니다 — ${e.message}`);
}

if (틀림.length) {
  console.error('✗ 빌드 결과 점검 실패');
  for (const t of 틀림) console.error('  · ' + t);
  process.exit(1);
}
console.log(`✓ dist/index.html ${크기.toLocaleString()}바이트 · 저작권 ${저작권}곳 · 바깥 자원 0개`);
