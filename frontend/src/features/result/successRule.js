// 👤 담당: 이혜원 — 성공 / 실패 판정
//
// docs/GAME_RULES.md 의 "성공 / 실패" 표와 같은 값을 유지합니다.
// 결과 화면에서만 쓰며 서버에는 보내지 않습니다.

/**
 * 성공 기준 점수.
 *
 * 전체 플레이가 30초라 실수 없이 문제당 1초 안에 답해야 겨우 넘던 10,000점 대신,
 * "잘함" 수준(8문제마다 한 번 틀리는 정도)이면 성공하는 5,000점으로 정했습니다. (#56)
 */
export const SUCCESS_SCORE = 5_000

/** 최종 점수가 성공 기준을 넘었는지 */
export function isSuccess(score) {
  return score >= SUCCESS_SCORE
}
