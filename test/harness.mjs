/*! 내 집 예산 계산기 · © 2026 티쳐무 · 모든 권리 보유 */
// 아주 작은 시험 도구. (`node test/run.mjs` 가 모아 돌린다)

let 묶음이름 = '';
export const 결과 = { 통과: 0, 실패: [] };

export function 묶음(이름) { 묶음이름 = 이름; }

export function 시험(이름, fn) {
  try {
    fn();
    결과.통과 += 1;
  } catch (e) {
    결과.실패.push(`${묶음이름} › ${이름}\n    ${e.message}`);
  }
}

export function 같나(실제, 바람, 쪽지 = '') {
  if (실제 !== 바람) {
    throw new Error(`${쪽지 ? 쪽지 + ': ' : ''}${JSON.stringify(실제)} 가 나왔는데 ${JSON.stringify(바람)} 이어야 합니다`);
  }
}

export function 가까운가(실제, 바람, 허용 = 1, 쪽지 = '') {
  if (!(Math.abs(실제 - 바람) <= 허용)) {
    throw new Error(`${쪽지 ? 쪽지 + ': ' : ''}${실제} 가 나왔는데 ${바람} ±${허용} 이어야 합니다`);
  }
}

export function 참인가(값, 쪽지 = '') {
  if (!값) throw new Error(`${쪽지 || '참이어야 합니다'} — ${JSON.stringify(값)}`);
}

export function 거짓인가(값, 쪽지 = '') {
  if (값) throw new Error(`${쪽지 || '거짓이어야 합니다'} — ${JSON.stringify(값)}`);
}

export function 들었나(글, 토막, 쪽지 = '') {
  if (!String(글).includes(토막)) {
    throw new Error(`${쪽지 ? 쪽지 + ': ' : ''}「${토막}」 이 들어 있어야 하는데 없습니다 — ${String(글).slice(0, 120)}`);
  }
}
