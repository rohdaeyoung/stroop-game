// 👤 담당: 김민서 — 스트루프 문제를 만드는 순수 함수 (React 의존성 없음 = 테스트 쉬움)
import { STROOP_COLORS, MODE } from '../../shared/constants/colors.js'

// 게임 규칙의 모드 출제 비율은 이곳을 기준으로 관리합니다.
export const MODE_PROBABILITY = Object.freeze({
  [MODE.COLOR]: 0.7,
  [MODE.WORD]: 0.3,
})

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * 스트루프 문제 하나를 생성합니다.
 * @param {number} choiceCount 선택지 개수
 * @returns {{ mode, word, inkColor, choices }}
 */
export function createQuiz(choiceCount) {
  const mode =
    Math.random() < MODE_PROBABILITY[MODE.COLOR] ? MODE.COLOR : MODE.WORD
  const word = pickRandom(STROOP_COLORS)

  // 단어 뜻과 글자색이 반드시 다르도록 (= 진짜 스트루프 간섭)
  const inkCandidates = STROOP_COLORS.filter((c) => c.key !== word.key)
  const inkColor = pickRandom(inkCandidates)

  const answer = mode === MODE.COLOR ? inkColor : word
  const distractors = shuffle(
    STROOP_COLORS.filter((c) => c.key !== answer.key)
  ).slice(0, choiceCount - 1)

  return { mode, word, inkColor, choices: shuffle([answer, ...distractors]) }
}
