// 👤 담당: 김민서
// 목숨 차감과 게임 오버 판정. useStroopGame 에서 쓰고, 테스트하기 쉽게 분리했습니다.
//
// docs/GAME_RULES.md 의 "종료 조건" 과 같은 값을 유지합니다.

/** 오답과 미응답을 합쳐 이 횟수가 되면 게임 오버 */
export const MAX_LIVES = 3

/**
 * 한 문제를 놓쳤을 때(오답 또는 미응답) 다음 상태를 계산합니다.
 *
 * @param {object} p
 * @param {number} p.score       현재 점수
 * @param {number} p.lives       남은 목숨
 * @param {number} p.wrongCount  지금까지 놓친 횟수
 * @param {boolean} p.isMiss     true 면 미응답(시간 초과), false 면 오답
 * @returns {{ score, lives, wrongCount, isGameOver }}
 */
export function applyMiss({ score, lives, wrongCount, isMiss }) {
  const nextWrongCount = wrongCount + 1
  return {
    // 미응답은 점수를 깎지 않습니다.
    // 찍어서 틀린 것과 아예 못 고른 것을 같게 벌하지 않기로 했습니다.
    score: isMiss ? score : Math.max(0, score - 50),
    lives: lives - 1,
    wrongCount: nextWrongCount,
    isGameOver: nextWrongCount >= MAX_LIVES,
  }
}
