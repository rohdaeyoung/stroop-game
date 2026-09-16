// 👤 담당: 김민서 — 난이도 곡선 (docs/GAME_RULES.md 표와 동일하게 유지)
//
// choiceCount 는 STROOP_COLORS 개수(4)를 넘을 수 없습니다.
// Figma 확정 시안이 4색이라 최대 4로 둡니다.
const TABLE = [
  { from: 40, limitMs: 1100, choiceCount: 4 },
  { from: 30, limitMs: 1400, choiceCount: 4 },
  { from: 20, limitMs: 1800, choiceCount: 4 },
  { from: 10, limitMs: 2400, choiceCount: 4 },
  { from: 0,  limitMs: 3000, choiceCount: 3 },
]

export function getDifficulty(correctCount) {
  return TABLE.find((row) => correctCount >= row.from)
}
