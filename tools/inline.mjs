/*! 내 집 예산 계산기 · © 2026 티쳐무 · 모든 권리 보유 */
// 빌드 결과를 `dist/index.html` 한 파일로 합친다 (더블클릭으로 열리게).
// 플러그인을 따로 설치하지 않으려고 직접 만들었다.

import { readFileSync, writeFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const 집 = path.join(dist, 'index.html');
if (!existsSync(집)) {
  console.error('dist/index.html 이 없습니다. `vite build` 가 먼저 돌아야 합니다.');
  process.exit(1);
}

let html = readFileSync(집, 'utf8');
const 자원 = path.join(dist, 'assets');
const 담긴것 = [];

if (existsSync(자원)) {
  for (const 이름 of readdirSync(자원)) {
    const 글 = readFileSync(path.join(자원, 이름), 'utf8');
    if (이름.endsWith('.js')) {
      html = html.replace(new RegExp(`<script[^>]*src="[^"]*${이름}"[^>]*></script>`),
        () => `<script>\n${글}\n</script>`);
      담긴것.push(이름);
    } else if (이름.endsWith('.css')) {
      html = html.replace(new RegExp(`<link[^>]*href="[^"]*${이름}"[^>]*>`),
        () => `<style>\n${글}\n</style>`);
      담긴것.push(이름);
    }
  }
  rmSync(자원, { recursive: true, force: true });
}

writeFileSync(집, html, 'utf8');
console.log(`한 파일로 합쳤습니다 — ${담긴것.join(', ') || '합칠 것이 없었습니다'}`);
