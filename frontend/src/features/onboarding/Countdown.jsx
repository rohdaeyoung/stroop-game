// 👤 담당: 최복순
// 할 일: 연습 문제를 다 풀고 나서 실제 게임 시작 전 3초 카운트다운 보여주기
import { useEffect, useRef, useState } from 'react'
import { GUIDE_TEXT } from './guideText.js'

const START_SECONDS = 3

export default function Countdown({ isLeaving, onDone }) {
  const [secondsLeft, setSecondsLeft] = useState(START_SECONDS)
  // 링이 뚝뚝 끊기지 않고 한 바퀴씩 부드럽게 돌도록, 실제 렌더링에 쓰는 진행률은
  // 별도 state 로 한 프레임 늦게 반영합니다 (마운트 직후 0 → 1/3 도 애니메이션 걸리게).
  const [ringProgress, setRingProgress] = useState(0)

  // onDone 은 부모가 렌더될 때마다 새로 만들어지는 함수라, effect 의존성에 그대로
  // 넣으면 부모가 리렌더될 때마다(예: isLeaving 토글) 중복 호출됩니다. ref 로 최신
  // 값만 참조합니다.
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setRingProgress((START_SECONDS - secondsLeft + 1) / START_SECONDS)
    })
    return () => cancelAnimationFrame(frame)
  }, [secondsLeft])

  useEffect(() => {
    if (secondsLeft <= 0) {
      onDoneRef.current()
      return
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  return (
    <div className={`onboarding__countdown${isLeaving ? ' onboarding__countdown--leaving' : ''}`}>
      <div className="onboarding__banner">
        <span className="onboarding__badge onboarding__badge--a">{GUIDE_TEXT.modeALabel}</span>
        <span className="onboarding__banner-text">{GUIDE_TEXT.countdownBanner}</span>
      </div>

      <div
        className="onboarding__countdown-ring"
        style={{ '--progress': `${ringProgress * 360}deg` }}
      >
        <span className="onboarding__countdown-number onboarding__display">{secondsLeft}</span>
      </div>

      <h1 className="onboarding__title">{GUIDE_TEXT.countdownTitle}</h1>
      <p className="onboarding__desc">{GUIDE_TEXT.countdownDesc}</p>
    </div>
  )
}
