// 👤 담당: 최복순
// 할 일: 연습 문제를 다 풀고 나서 실제 게임 시작 전 3초 카운트다운 보여주기
import { useEffect, useState } from 'react'
import { GUIDE_TEXT } from './guideText.js'

const START_SECONDS = 3

export default function Countdown({ onDone }) {
  const [secondsLeft, setSecondsLeft] = useState(START_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) {
      onDone()
      return
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, onDone])

  const progress = (START_SECONDS - secondsLeft + 1) / START_SECONDS

  return (
    <div className="onboarding__countdown">
      <div className="onboarding__banner">
        <span className="onboarding__badge onboarding__badge--a">{GUIDE_TEXT.modeALabel}</span>
        <span className="onboarding__banner-text">{GUIDE_TEXT.countdownBanner}</span>
      </div>

      <div
        className="onboarding__countdown-ring"
        style={{ background: `conic-gradient(var(--onboarding-accent) ${progress * 360}deg, var(--color-surface) 0deg)` }}
      >
        <span className="onboarding__countdown-number">{secondsLeft}</span>
      </div>

      <h1 className="onboarding__title">{GUIDE_TEXT.countdownTitle}</h1>
      <p className="onboarding__desc">{GUIDE_TEXT.countdownDesc}</p>
    </div>
  )
}
