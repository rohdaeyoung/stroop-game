// 👤 담당: 이혜원
// useStroopGame(김민서 담당, features/game/**)은 게임이 끝난 '이유'를 따로 넘겨주지 않고
// { score, maxCombo, correctCount, wrongCount, playTimeMs } 만 넘겨줍니다.
// 그래서 결과 화면에서 이 수치로 종료 사유를 추정합니다 — 완전히 정확하지는 않을 수 있어요.
// (제한시간 내 미응답 vs 총 시간 경과는 수치만으로는 100% 구분이 안 됩니다.
//  게임 엔진 쪽에서 endReason 을 직접 넘겨주면 더 정확해질 수 있어 이슈로 남겨두었습니다.)
//
// 총 플레이시간 기준(TOTAL_PLAY_MS)은 docs/GAME_RULES.md 의 종료 조건을 따릅니다.
// 문서의 숫자가 바뀌면 이 값도 같이 바꿔주세요.
const MAX_WRONG_COUNT = 3
const TOTAL_PLAY_MS = 30_000

export const END_REASON = {
  WRONG_LIMIT: 'WRONG_LIMIT',
  TOTAL_TIME_UP: 'TOTAL_TIME_UP',
  NO_ANSWER: 'NO_ANSWER',
}

export function detectEndReason({ wrongCount = 0, playTimeMs = 0 }) {
  if (wrongCount >= MAX_WRONG_COUNT) return END_REASON.WRONG_LIMIT
  if (playTimeMs >= TOTAL_PLAY_MS - 1000) return END_REASON.TOTAL_TIME_UP
  return END_REASON.NO_ANSWER
}

export function formatAccuracy(correctCount = 0, wrongCount = 0) {
  const total = correctCount + wrongCount
  if (total === 0) return 0
  return Math.round((correctCount / total) * 100)
}

export function formatElapsedSeconds(playTimeMs = 0) {
  return Math.round(playTimeMs / 1000)
}
