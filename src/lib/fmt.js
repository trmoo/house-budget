/*! 내 집 예산 계산기 · © 2026 티쳐무 · 모든 권리 보유 */
// 돈을 사람이 읽는 글자로 바꾼다.
//
// ⚠ 여기서 가장 중요한 것은 `돈()` 이다. 검토했던 다른 계산기는 나머지를 천 단위로
//   반올림해서 1억 9,600만원을 「1억 10천만원」으로, 1억 400만원을 「1억만원」으로
//   보여 주었다(글자 그대로 읽으면 1조 원이다). 그래서 여기서는 반올림을 만원 자리에서
//   한 번만 하고, 억과 만원을 따로 적는다. 시험이 이 규칙을 지킨다.

/** 숫자에 천 단위 쉼표 (소수는 버린다) */
export function 숫자(n) {
  return Math.round(Number(n) || 0).toLocaleString('ko-KR');
}

/** 만원 단위 값을 「3억 2,500만원」처럼 */
export function 돈(만원값) {
  const v = Math.round(Number(만원값) || 0);
  const 부호 = v < 0 ? '−' : '';
  const n = Math.abs(v);
  const 억 = Math.floor(n / 10000);
  const 만 = n % 10000;
  if (억 > 0 && 만 > 0) return `${부호}${숫자(억)}억 ${숫자(만)}만원`;
  if (억 > 0) return `${부호}${숫자(억)}억원`;
  if (만 > 0) return `${부호}${숫자(만)}만원`;
  return '0원';
}

/** 좁은 칸에 쓰는 짧은 표기 — 「3.25억」 (1억 미만은 만원으로) */
export function 억짧게(만원값) {
  const v = Math.round(Number(만원값) || 0);
  if (Math.abs(v) < 10000) return `${숫자(v)}만원`;
  const 억 = v / 10000;
  // 소수 둘째 자리까지, 끝의 0 은 떼어 낸다 (3.20억 → 3.2억)
  return `${Number(억.toFixed(2))}억`;
}

/** 원 단위 값을 「1,401,387원」처럼 */
export function 원(원값) {
  return `${숫자(원값)}원`;
}

/** 만원 단위 값을 원으로 */
export function 만원을원으로(만원값) {
  return (Number(만원값) || 0) * 10000;
}

/** 원을 만원으로 */
export function 원을만원으로(원값) {
  return (Number(원값) || 0) / 10000;
}

/** 비율(0.4) 을 「40%」로 */
export function 율(비율, 자리 = 0) {
  return `${Number((((Number(비율) || 0) * 100)).toFixed(자리))}%`;
}

/** 이미 퍼센트인 값(4.25) 을 「4.25%」로 */
export function 퍼센트(값, 자리 = 2) {
  const n = Number(값) || 0;
  // 끝의 0 은 떼어 낸다 (4.00% → 4%)
  return `${Number(n.toFixed(자리))}%`;
}

/** 글자에서 숫자만 뽑는다 (쉼표·단위·공백을 지운다. 소수점과 앞의 − 는 남긴다) */
export function 숫자읽기(글자) {
  const s = String(글자 ?? '').replace(/[^0-9.\-]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}
