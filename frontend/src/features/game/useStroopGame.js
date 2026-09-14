// 👤 담당: 김민서
// 게임 엔진의 심장. 상태 관리 + 타이머 + 판정을 모두 여기서 처리합니다.
import { useState, useEffect, useRef, useCallback } from 'react'
import { MODE } from '../../shared/constants/colors.js'
import { createQuiz } from './stroopEngine.js'
import { getDifficulty } from './difficulty.js'
import { calcScore } from './scoreCalculator.js'

const MAX_LIVES = 3
const TOTAL_PLAY_MS = 60_000
const MAX_SERVER_PLAY_TIME_MS = 70_000

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
    questionStartedAt.current = Date.now()
    answeredRef.current = false
  }, [])

  const answer = useCallback((choiceKey) => {
    if (endedRef.current || answeredRef.current) return

    const now = Date.now()
    const totalElapsed = now - startedAt.current
    const elapsed = now - questionStartedAt.current

    // 전역 60초 또는 현재 문제 제한시간이 지나면 입력을 받지 않습니다.
    if (totalElapsed >= TOTAL_PLAY_MS || elapsed >= difficulty.limitMs) {
      endGame()
      return
    }

    answeredRef.current = true

    const answerKey =
      quiz.mode === MODE.COLOR ? quiz.inkColor.key : quiz.word.key
    const isCorrect = choiceKey === answerKey

    if (isCorrect) {
      const gained = calcScore({
        combo: comboRef.current,
        remainMs: difficulty.limitMs - elapsed,
      })
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
      nextQuestion(nextCorrectCount)
    } else {
      const nextScore = Math.max(0, scoreRef.current - 50)
      const nextWrongCount = wrongCountRef.current + 1
      const nextLives = livesRef.current - 1

      scoreRef.current = nextScore
      comboRef.current = 0
      livesRef.current = nextLives
      wrongCountRef.current = nextWrongCount

      setScore(nextScore)
      setCombo(0)
      setWrongCount(nextWrongCount)
      setLives(nextLives)

      if (nextWrongCount >= MAX_LIVES) {
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
  }, [quiz, difficulty, endGame, nextQuestion])

  // 문제별 카운트다운
  useEffect(() => {
    if (timeLeft <= 0) {
      endGame()
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 100), 100)
    return () => clearTimeout(id)
  }, [timeLeft, quiz, endGame])

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
