// 👤 담당: 김민서
// 게임 엔진의 심장. 상태 관리 + 타이머 + 판정을 모두 여기서 처리합니다.
import { useState, useEffect, useRef, useCallback } from 'react'
import { MODE } from '../../shared/constants/colors.js'
import { createQuiz } from './stroopEngine.js'
import { getDifficulty } from './difficulty.js'
import { calcScore } from './scoreCalculator.js'

const MAX_LIVES = 3
const TOTAL_PLAY_MS = 60_000

export function useStroopGame({ onGameOver }) {
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [lives, setLives] = useState(MAX_LIVES)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)

  const difficulty = getDifficulty(correctCount)
  const [quiz, setQuiz] = useState(() => createQuiz(difficulty.choiceCount))
  const [timeLeft, setTimeLeft] = useState(difficulty.limitMs)

  const startedAt = useRef(Date.now())
  const questionStartedAt = useRef(Date.now())

  const endGame = useCallback(() => {
    onGameOver({
      score, maxCombo, correctCount, wrongCount,
      playTimeMs: Date.now() - startedAt.current,
    })
  }, [score, maxCombo, correctCount, wrongCount, onGameOver])

  // TODO(민서): 다음 문제로 넘어가는 함수
  const nextQuestion = useCallback(() => {
    const next = getDifficulty(correctCount + 1)
    setQuiz(createQuiz(next.choiceCount))
    setTimeLeft(next.limitMs)
    questionStartedAt.current = Date.now()
  }, [correctCount])

  // TODO(민서): 터치 판정
  const answer = useCallback((choiceKey) => {
    const answerKey =
      quiz.mode === MODE.COLOR ? quiz.inkColor.key : quiz.word.key
    const isCorrect = choiceKey === answerKey
    const elapsed = Date.now() - questionStartedAt.current

    if (isCorrect) {
      const gained = calcScore({ combo, remainMs: difficulty.limitMs - elapsed })
      setScore((s) => s + gained)
      setCombo((c) => {
        const next = c + 1
        setMaxCombo((m) => Math.max(m, next))
        return next
      })
      setCorrectCount((c) => c + 1)
      nextQuestion()
    } else {
      setScore((s) => Math.max(0, s - 50))
      setCombo(0)
      setWrongCount((w) => w + 1)
      setLives((l) => l - 1)
      nextQuestion()
    }
  }, [quiz, combo, difficulty, nextQuestion])

  // 문제별 카운트다운
  useEffect(() => {
    if (timeLeft <= 0) {
      setLives((l) => l - 1)
      nextQuestion()
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 100), 100)
    return () => clearTimeout(id)
  }, [timeLeft, nextQuestion])

  // 종료 조건: 목숨 소진
  useEffect(() => {
    if (lives <= 0) endGame()
  }, [lives, endGame])

  // 종료 조건: 총 플레이 시간
  useEffect(() => {
    const id = setTimeout(endGame, TOTAL_PLAY_MS)
    return () => clearTimeout(id)
  }, [endGame])

  return {
    score, combo, lives, quiz, answer,
    timeRatio: Math.max(0, timeLeft / difficulty.limitMs),
    questionText:
      quiz.mode === MODE.COLOR ? '글자의 색을 고르세요' : '단어의 뜻을 고르세요',
  }
}
