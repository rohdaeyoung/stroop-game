// 👤 담당: 김민서
// 게임 엔진의 심장. 상태 관리 + 타이머 + 판정을 모두 여기서 처리합니다.
import { useState, useEffect, useRef, useCallback } from 'react'
import { MODE } from '../../shared/constants/colors.js'
import { createQuiz } from './stroopEngine.js'
import { getDifficulty } from './difficulty.js'
import { calcScore } from './scoreCalculator.js'
import { applyMiss, MAX_LIVES } from './lifeRule.js'

const TOTAL_PLAY_MS = 30_000
// BE 의 ScoreRules.MAX_PLAY_TIME_MS 와 같은 값을 유지합니다. (30초 + 여유 10초)
const MAX_SERVER_PLAY_TIME_MS = 40_000

// 문제가 바뀔 때마다 "이번 문제는 색/뜻이에요!" 인트로를 잠깐 보여주는 시간입니다
// (Figma 05_플레이 — 모드강조 시안3). 단어·색이 헷갈린다는 피드백 때문에 추가했습니다.
// 이 시간 동안은 제한시간 카운트다운이 멈춰있어서, 참가자가 손해를 보지 않습니다.
// 650ms → 1400ms 로 늘렸다가 "1.4초는 너무 길다"는 피드백을 받아 1000ms 로 조정했습니다.
const MODE_INTRO_MS = 1000

/** 남은 밀리초를 0:24 형태로 */
function formatTime(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export function useStroopGame({ onGameOver }) {
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [lives, setLives] = useState(MAX_LIVES)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)

  // 화면에 잠깐 떴다 사라지는 콤보/스피드/오답 배지용 — seq 는 같은 콤보 수가
  // 반복되더라도 화면 쪽에서 다시 팝업 애니메이션을 재생시키기 위한 값입니다.
  const [lastGain, setLastGain] = useState(null) // { combo, speedBonus, seq }
  const [lastMiss, setLastMiss] = useState(null) // { penalty, seq }
  const badgeSeqRef = useRef(0)

  const difficulty = getDifficulty(correctCount)
  const [quiz, setQuiz] = useState(() => createQuiz(difficulty.choiceCount))
  const [timeLeft, setTimeLeft] = useState(difficulty.limitMs)
  // 'intro' = 모드 안내 시트가 떠 있는 중 (아직 문제 안 보임)
  // 'question' = 단어 + 선택지가 보이고 실제로 답을 고를 수 있는 중
  const [phase, setPhase] = useState('intro')

  // HUD 의 전체 시간 게이지용. 화면 표시 전용이라 게임 판정에는 쓰지 않습니다.
  const [totalLeftMs, setTotalLeftMs] = useState(TOTAL_PLAY_MS)

  const startedAt = useRef(Date.now())
  const questionStartedAt = useRef(Date.now())
  const answeredRef = useRef(false)
  const endedRef = useRef(false)
  const onGameOverRef = useRef(onGameOver)

  // 종료 시점에 최신 상태를 사용하기 위한 refs입니다.
  const scoreRef = useRef(0)
  const comboRef = useRef(0)
  const maxComboRef = useRef(0)
  const livesRef = useRef(MAX_LIVES)
  const correctCountRef = useRef(0)
  const wrongCountRef = useRef(0)

  onGameOverRef.current = onGameOver

  const endGame = useCallback((result = {}) => {
    if (endedRef.current) return
    endedRef.current = true

    onGameOverRef.current({
      score: scoreRef.current,
      maxCombo: maxComboRef.current,
      correctCount: correctCountRef.current,
      wrongCount: wrongCountRef.current,
      // 백그라운드 복귀 등으로 타이머 콜백이 늦어져도 BE 상한을 넘기지 않습니다.
      playTimeMs: Math.min(
        Date.now() - startedAt.current,
        MAX_SERVER_PLAY_TIME_MS,
      ),
      ...result,
    })
  }, [])

  const nextQuestion = useCallback((nextCorrectCount) => {
    const next = getDifficulty(nextCorrectCount)
    setQuiz(createQuiz(next.choiceCount))
    setTimeLeft(next.limitMs)
    setPhase('intro')
    answeredRef.current = false
    // questionStartedAt 은 인트로가 끝나는 시점(아래 effect)에 찍습니다 —
    // 여기서 바로 찍으면 인트로가 떠 있는 동안 제한시간이 같이 줄어듭니다.
  }, [])

  /**
   * 제한시간 안에 못 고른 경우.
   *
   * 예전에는 한 번만 놓쳐도 바로 게임이 끝났는데, 초반 제한시간이 3초라
   * 처음 해보는 참가자는 문제를 읽다가 그대로 종료됐습니다.
   * 오답과 같이 목숨 1개만 차감하고 다음 문제로 넘어갑니다. (누적 3회면 종료)
   *
   * 다만 점수는 깎지 않습니다 — 찍어서 틀린 것과 아예 못 고른 것을
   * 같게 벌하지는 않기로 했습니다.
   */
  const missQuestion = useCallback(() => {
    if (endedRef.current || answeredRef.current) return
    answeredRef.current = true

    const next = applyMiss({
      score: scoreRef.current,
      lives: livesRef.current,
      wrongCount: wrongCountRef.current,
      isMiss: true,
    })
    const nextWrongCount = next.wrongCount

    comboRef.current = 0
    livesRef.current = next.lives
    wrongCountRef.current = nextWrongCount

    setCombo(0)
    setWrongCount(nextWrongCount)
    setLives(next.lives)

    if (next.isGameOver) {
      endGame({
        score: scoreRef.current,
        maxCombo: maxComboRef.current,
        correctCount: correctCountRef.current,
        wrongCount: nextWrongCount,
      })
    } else {
      nextQuestion(correctCountRef.current)
    }
  }, [endGame, nextQuestion])

  const answer = useCallback((choiceKey) => {
    if (endedRef.current || answeredRef.current || phase !== 'question') return

    const now = Date.now()
    const totalElapsed = now - startedAt.current
    const elapsed = now - questionStartedAt.current

    // 전역 30초가 지났으면 게임이 끝난 것입니다.
    if (totalElapsed >= TOTAL_PLAY_MS) {
      endGame()
      return
    }

    // 현재 문제의 제한시간이 지난 뒤 눌린 입력은 미응답으로 처리합니다.
    // (카운트다운 effect 와 겹쳐 들어와도 answeredRef 로 한 번만 반영됩니다)
    if (elapsed >= difficulty.limitMs) {
      missQuestion()
      return
    }

    answeredRef.current = true

    const answerKey =
      quiz.mode === MODE.COLOR ? quiz.inkColor.key : quiz.word.key
    const isCorrect = choiceKey === answerKey

    if (isCorrect) {
      const remainMs = difficulty.limitMs - elapsed
      const gained = calcScore({
        combo: comboRef.current,
        remainMs,
      })
      const speedBonus = Math.round(Math.max(0, remainMs) / 10)
      const nextScore = scoreRef.current + gained
      const nextCombo = comboRef.current + 1
      const nextCorrectCount = correctCountRef.current + 1
      const nextMaxCombo = Math.max(maxComboRef.current, nextCombo)

      scoreRef.current = nextScore
      comboRef.current = nextCombo
      maxComboRef.current = nextMaxCombo
      correctCountRef.current = nextCorrectCount

      setScore(nextScore)
      setCombo(nextCombo)
      setMaxCombo(nextMaxCombo)
      setCorrectCount(nextCorrectCount)
      badgeSeqRef.current += 1
      setLastGain({ combo: nextCombo, speedBonus, seq: badgeSeqRef.current })
      nextQuestion(nextCorrectCount)
    } else {
      const next = applyMiss({
        score: scoreRef.current,
        lives: livesRef.current,
        wrongCount: wrongCountRef.current,
        isMiss: false,
      })
      const nextScore = next.score
      const nextWrongCount = next.wrongCount
      const penalty = scoreRef.current - nextScore

      scoreRef.current = nextScore
      comboRef.current = 0
      livesRef.current = next.lives
      wrongCountRef.current = nextWrongCount

      setScore(nextScore)
      setCombo(0)
      setWrongCount(nextWrongCount)
      setLives(next.lives)
      badgeSeqRef.current += 1
      setLastMiss({ penalty, seq: badgeSeqRef.current })

      if (next.isGameOver) {
        endGame({
          score: nextScore,
          maxCombo: maxComboRef.current,
          correctCount: correctCountRef.current,
          wrongCount: nextWrongCount,
        })
      } else {
        nextQuestion(correctCountRef.current)
      }
    }
  }, [quiz, difficulty, phase, endGame, nextQuestion])

  // 모드 인트로 → 실제 문제 전환. 인트로가 끝나야 제한시간이 흐르기 시작합니다.
  useEffect(() => {
    const id = setTimeout(() => {
      questionStartedAt.current = Date.now()
      setPhase('question')
    }, MODE_INTRO_MS)
    return () => clearTimeout(id)
  }, [quiz])

  // 문제별 카운트다운 (인트로가 떠 있는 동안에는 멈춰 있습니다)
  useEffect(() => {
    if (phase !== 'question') return
    if (timeLeft <= 0) {
      missQuestion()
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 100), 100)
    return () => clearTimeout(id)
  }, [timeLeft, quiz, phase, missQuestion])

  // 종료 조건: 목숨 소진
  useEffect(() => {
    if (lives <= 0) endGame()
  }, [lives, endGame])

  // 종료 조건: 총 플레이 시간
  useEffect(() => {
    const id = setTimeout(endGame, TOTAL_PLAY_MS)
    return () => clearTimeout(id)
  }, [endGame])

  // HUD 의 전체 시간 게이지. 표시 전용이며 종료 판정은 위 setTimeout 이 합니다.
  useEffect(() => {
    const id = setInterval(() => {
      setTotalLeftMs(Math.max(0, TOTAL_PLAY_MS - (Date.now() - startedAt.current)))
    }, 200)
    return () => clearInterval(id)
  }, [])

  const isColorMode = quiz.mode === MODE.COLOR

  return {
    score, combo, lives, quiz, answer,
    lastGain, lastMiss,
    /** 'intro' = 모드 안내 시트, 'question' = 실제 문제 (선택지 클릭 가능) */
    phase,
    isColorMode,
    timeRatio: Math.max(0, timeLeft / difficulty.limitMs),
    questionText:
      quiz.mode === MODE.COLOR ? '글자의 색을 고르세요' : '단어의 뜻을 고르세요',

    // ── 화면 표시용 (Figma 게임 화면 HUD)
    /** 모드 태그: A = 글자의 색, B = 단어의 뜻 */
    modeLabel: quiz.mode === MODE.COLOR ? '모드 A' : '모드 B',
    /** 지금이 몇 번째 문제인지 (맞힌 수 + 틀린 수 + 1) */
    questionNumber: correctCount + wrongCount + 1,
    /** 전체 30초 중 남은 비율 */
    totalTimeRatio: Math.max(0, totalLeftMs / TOTAL_PLAY_MS),
    /** 전체 남은 시간 표기 (0:24 형태) */
    totalTimeText: formatTime(totalLeftMs),
    maxLives: MAX_LIVES,
  }
}
