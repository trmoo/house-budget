/*! 내 집 예산 계산기 · © 2026 티쳐무 · 모든 권리 보유 */
// 직접 만든 SHA-256 이 node 의 crypto 와 같은 값을 내는지 본다.
// (브라우저의 crypto.subtle 은 비동기라 쓰지 않았다 — file:// 로 열어도 돌아가야 한다)
import { createHash } from 'node:crypto';
import { 묶음, 시험, 같나, 거짓인가 } from './harness.mjs';

// gate.js 는 window 를 쓰는 ui.js 를 불러오므로, 해시 함수만 떼어 읽는다.
import { readFileSync } from 'node:fs';
const 글 = readFileSync(new URL('../src/gate.js', import.meta.url), 'utf8');
const 떼낸것 = 글.slice(글.indexOf('const K = ['), 글.indexOf('/* ────────── 가림막'))
  .replace(/^export /gm, '');
const { sha256 } = await import(`data:text/javascript;base64,${Buffer.from(떼낸것 + '\nexport { sha256 };', 'utf8').toString('base64')}`);

묶음('SHA-256 직접 구현');
for (const 글자 of ['', 'abc', '202610', 'house-budget:202610', '내 집 예산 계산기', 'a'.repeat(100)]) {
  시험(`node 와 같은 값 — ${JSON.stringify(글자.slice(0, 24))}`, () => {
    같나(sha256(글자), createHash('sha256').update(글자, 'utf8').digest('hex'));
  });
}

묶음('가림막');
const 정답해시 = 글.match(/정답해시 = '([0-9a-f]{64})'/)[1];
시험('해시가 비밀번호와 맞는다', () => 같나(sha256('house-budget:202610'), 정답해시));
시험('소스에 비밀번호가 글자로 들어 있지 않다', () => 거짓인가(글.includes('202610'), '소스에 비밀번호가 그대로 적혀 있다'));
