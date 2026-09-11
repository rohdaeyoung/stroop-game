// 👤 담당: 김민서 — 점수 계산 (순수 함수)
const BASE = 100

/**
 * @param {{ combo: number, remainMs: number }} params
 * @returns {number} 이번 문제로 얻은 점수
 */
export function calcScore({ combo, remainMs }) {
  const comboBonus = BASE * (1 + combo * 0.1)
  const speedBonus = Math.max(0, remainMs) / 10
  return Math.round(comboBonus + speedBonus)
}
