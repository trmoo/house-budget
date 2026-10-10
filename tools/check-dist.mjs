/*! 내 집 예산 계산기 · © 2026 티쳐무 · 모든 권리 보유 */
// 빌드 결과를 검사한다. 하나라도 어긋나면 빌드를 실패시킨다.

import { readFileSync, existsSync, statSync } from 'node:fs';

const 집 = 'dist/index.html';
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

// 저작권 표시 — HTML 주석 · /*! 배너 · 화면 푸터
const 저작권 = 세기('티쳐무');
if (저작권 < 3) 틀림.push(`저작권 표시가 ${저작권}곳뿐입니다 (3곳 이상이어야 합니다)`);

// 가림막
if (!글.includes('6bb6139d1d16df29f25b1ac6dba5871ef6884aa461bb152b6e00ef175d675695')) {
  틀림.push('비밀번호 해시가 없습니다');
}
if (글.includes('202610')) 틀림.push('비밀번호가 글자 그대로 들어 있습니다');
if (!글.includes('가림막')) 틀림.push('「가림막」이라고 밝히는 문구가 없습니다');

// 규정 기준일과 「모른다」를 밝히는 문구
if (!글.includes('2026-10-10')) 틀림.push('규정 기준일이 없습니다');
if (!글.includes('심사 결과가 아니')) 틀림.push('「은행 심사 결과가 아니다」라는 문구가 없습니다');

if (틀림.length) {
  console.error('✗ 빌드 결과 점검 실패');
  for (const t of 틀림) console.error('  · ' + t);
  process.exit(1);
}
console.log(`✓ dist/index.html ${크기.toLocaleString()}바이트 · 저작권 ${저작권}곳 · 바깥 자원 0개`);
