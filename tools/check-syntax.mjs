/*! 내 집 예산 계산기 · © 2026 티쳐무 · 모든 권리 보유 */
// 소스 전수 검사 — 시험이 탭 파일(DOM)을 부르지 않으므로 문법은 여기서 본다.
// 함께 지키는 것: 저작권 머리 주석 · 브라우저 기본 대화상자 금지 · 화면 수명 규칙 · 규정값 박아 넣기 금지.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const 뿌리 = 'src';
const 틀림 = [];
const 파일들 = [];

(function 모으기(여기) {
  for (const 이름 of readdirSync(여기)) {
    const p = path.join(여기, 이름);
    if (statSync(p).isDirectory()) 모으기(p);
    else if (이름.endsWith('.js')) 파일들.push(p);
  }
}(뿌리));

for (const p of 파일들) {
  const 글 = readFileSync(p, 'utf8');
  const 이름 = p.replace(/\\/g, '/');

  // ① 문법
  try {
    execFileSync(process.execPath, ['--check', p], { stdio: 'pipe' });
  } catch (e) {
    틀림.push(`${이름} — 문법 오류\n    ${String(e.stderr || e.message).split('\n').slice(0, 3).join(' ')}`);
  }

  // ② 저작권 머리 주석 (`/*!` 로 시작해야 압축 뒤에도 남는다)
  if (!글.startsWith('/*!') || !글.slice(0, 200).includes('티쳐무')) {
    틀림.push(`${이름} — 첫 줄에 /*! … 티쳐무 … */ 머리 주석이 없습니다`);
  }

  // ③ 브라우저 기본 대화상자
  for (const 금지 of ['alert(', 'confirm(', 'prompt(']) {
    const 쓴곳 = 글.split('\n').findIndex((줄) => 줄.includes(금지) && !줄.trim().startsWith('//') && !줄.includes('ui.js'));
    if (쓴곳 >= 0 && !이름.endsWith('lib/ui.js')) {
      틀림.push(`${이름}:${쓴곳 + 1} — 브라우저 기본 ${금지.slice(0, -1)} 을 쓰면 안 됩니다 (ui.js 의 say·ask·modal)`);
    }
  }

  // ④ 화면 수명 — resize·setInterval 은 ui.js 에서만
  if (!이름.endsWith('lib/ui.js')) {
    if (/addEventListener\(\s*['"]resize/.test(글)) 틀림.push(`${이름} — resize 는 ui.js 의 onResize() 를 쓸 것`);
    if (/setInterval\(/.test(글)) 틀림.push(`${이름} — setInterval 은 ui.js 의 screenTimer() 를 쓸 것`);
  }

  // ⑤ 규정값을 계산 코드에 박아 넣지 않았나 (engine 안의 수상한 숫자)
  //    주석과 글자(문자열) 안의 숫자는 설명이지 계산이 아니므로 걷어 내고 본다.
  //    셈에만 쓰는 숫자(탐색 범위·하한 같은 것)는 그 줄에 「셈용」이라고 적어 두면 봐준다.
  if (이름.startsWith('src/engine/')) {
    const 봐주기 = new Set(['10000', '100000', '12000']);   // 만원↔원 환산, 월·연 환산
    // ⚠ 윈도우에서 받은 파일은 줄 끝에 `\r` 이 붙는다. 자바스크립트 정규식에서 `.` 는 `\r` 을
    //   건너뛰지 못해, 떼지 않으면 `// 주석` 이 안 지워지고 주석 속 숫자가 걸린다(실제로 겪었다).
    const 줄들 = 글.split('\n').map((t) => t.replace(/\r$/, ''));
    줄들.forEach((줄, i) => {
      if (줄.includes('셈용') || (줄들[i - 1] || '').includes('셈용')) return;
      const 벗긴줄 = 줄
        .replace(/\/\/.*$/, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/'[^']*'|"[^"]*"|`[^`]*`/g, "''");
      const 걸린것 = (벗긴줄.match(/(?<![\w.])(0\.0?[1-9]\d*|[1-9]\d{4,})(?![\w.])/g) || [])
        .filter((n) => !봐주기.has(n));
      if (걸린것.length > 0) {
        틀림.push(`${이름}:${i + 1} — 규정값으로 보이는 숫자가 박혀 있습니다(rules.js 로 옮기거나 「셈용」이라고 적을 것): ${걸린것.join(', ')}`);
      }
    });
  }
}

// ⑥ 규정표에 기준일과 출처가 있는가
const 규정 = readFileSync('src/rules.js', 'utf8');
if (!/기준일 = '20\d\d-\d\d-\d\d'/.test(규정)) 틀림.push('rules.js — 기준일이 없습니다');
if ((규정.match(/주소: 'https?:\/\//g) || []).length < 8) 틀림.push('rules.js — 출처 링크가 너무 적습니다');

if (틀림.length) {
  console.error(`✗ ${틀림.length}가지가 걸렸습니다 (파일 ${파일들.length}개)`);
  for (const t of 틀림) console.error('  · ' + t);
  process.exit(1);
}
console.log(`✓ 소스 ${파일들.length}개 — 문법·저작권·금지 습관·규정값 분리 모두 통과`);
