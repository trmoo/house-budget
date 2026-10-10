/*! 내 집 예산 계산기 · © 2026 티쳐무 · 모든 권리 보유 */
// 시험을 모아 돌린다. `npm test`
//
// ⚠ 시험은 `src/engine/`·`src/lib/`·`src/rules.js` 만 부른다(DOM 이 없는 것들).
//   탭 파일은 DOM 을 쓰므로 `npm run check:syntax` 가 문법만 전수 검사한다.

import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { 결과 } from './harness.mjs';

const 이폴더 = path.dirname(fileURLToPath(import.meta.url));
const 파일들 = readdirSync(이폴더).filter((f) => f.endsWith('.test.mjs')).sort();

for (const f of 파일들) {
  await import(pathToFileURL(path.join(이폴더, f)).href);
}

const 전체 = 결과.통과 + 결과.실패.length;
if (결과.실패.length) {
  console.log(`\n✗ ${결과.실패.length} 가지가 깨졌습니다 (전체 ${전체})\n`);
  for (const m of 결과.실패) console.log('  ✗ ' + m);
  console.log('');
  process.exit(1);
}
console.log(`✓ ${결과.통과} 가지 모두 통과 (파일 ${파일들.length}개)`);
