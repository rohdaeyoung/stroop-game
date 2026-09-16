// 👤 담당: 최복순
// 할 일: 시작 화면, 모드 설명, 예시 문제, 카운트다운
// (닉네임은 결과 화면(features/result)에서 자체적으로 받으므로 여기서는 다루지 않습니다)
// 레이아웃은 game/result/ranking 과 같은 패턴으로 1920x1080 고정 캔버스를
// useKioskScale 로 축소/확대합니다 (Figma 원본이 1920x1080 부스 키오스크 기준).
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModeIntro from './ModeIntro.jsx'
import ExampleQuestion from './ExampleQuestion.jsx'
import Countdown from './Countdown.jsx'
import { GUIDE_TEXT } from './guideText.js'
import { colorizeChars } from './colorizeText.js'
import { useKioskScale } from '../../shared/hooks/useKioskScale.js'
import likelionWordmark from './assets/likelion-wordmark.png'
import likelionLogo from './assets/likelion-logo.png'
import './Onboarding.css'

const STEP = {
  START: 'start',
  MODE_INTRO: 'mode-intro',
  PRACTICE: 'practice',
  COUNTDOWN: 'countdown',
}

const TITLE_CHARS = colorizeChars(GUIDE_TEXT.title)

// 대기화면에서 다음 화면으로 넘어갈 때 뚝 끊기지 않도록, 먼저 살짝 페이드아웃 시킨
// 다음에 실제로 step 을 바꿉니다 (이 시간과 Onboarding.css 의 --leaving 트랜지션
// 지속시간을 맞춰야 합니다).
const LEAVE_TRANSITION_MS = 220

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { scale } = useKioskScale()
  const [step, setStep] = useState(STEP.START)
  const [isLeaving, setIsLeaving] = useState(false)

  // 어떤 단계에서 다음 단계로 넘어가든 (버튼을 눌러서 넘어가는 화면 전환은 전부)
  // 항상 같은 속도로 페이드아웃 → 전환 → 페이드인 되도록 하나의 함수로 통일합니다.
  function advanceStep(next) {
    setIsLeaving(true)
    setTimeout(() => {
      next()
      setIsLeaving(false)
    }, LEAVE_TRANSITION_MS)
  }

  function goToModeIntro() {
    advanceStep(() => setStep(STEP.MODE_INTRO))
  }

  return (
    <div className="onboarding-kiosk">
      <div className="onboarding-kiosk__canvas" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <div className="onboarding" onClick={step === STEP.START && !isLeaving ? goToModeIntro : undefined}>
          {/* 화면이 바뀌어도 같은 DOM 엘리먼트가 유지되어야 애니메이션(색상/이동)이
              끊기지 않아서, step 조건문 밖에 항상 렌더링합니다. */}
          <div className="onboarding__glow onboarding__glow--1" aria-hidden="true" />
          <div className="onboarding__glow onboarding__glow--2" aria-hidden="true" />
          <div className="onboarding__glow onboarding__glow--3" aria-hidden="true" />
          <div className="onboarding__glow onboarding__glow--4" aria-hidden="true" />

          {(step === STEP.START || step === STEP.MODE_INTRO) && (
            <div className="onboarding__brand">
              <img src={likelionWordmark} alt="LIKELION SKU" />
            </div>
          )}

          {step === STEP.START && (
            <>
              <img
                className={`onboarding__watermark${isLeaving ? ' onboarding__watermark--leaving' : ''}`}
                src={likelionLogo}
                alt=""
                aria-hidden="true"
              />
              <div className={`onboarding__start${isLeaving ? ' onboarding__start--leaving' : ''}`}>
                <h1 className="onboarding__title onboarding__title--stroop onboarding__display">
                  {TITLE_CHARS.map(({ char, color }, i) => (
                    <span key={i} style={color ? { color } : undefined}>
                      {char}
                    </span>
                  ))}
                </h1>

                <p className="onboarding__tagline">{GUIDE_TEXT.tagline}</p>

                <button
                  type="button"
                  className="onboarding__start-cta"
                  onClick={(event) => {
                    event.stopPropagation()
                    goToModeIntro()
                  }}
                >
                  {GUIDE_TEXT.startCta} →
                </button>

                <p className="onboarding__meta">{GUIDE_TEXT.meta}</p>

                <button
                  type="button"
                  className="onboarding__ranking-link"
                  onClick={(event) => {
                    event.stopPropagation()
                    navigate('/ranking')
                  }}
                >
                  {GUIDE_TEXT.rankingCta}
                </button>
              </div>

              <p className={`onboarding__event-note${isLeaving ? ' onboarding__event-note--leaving' : ''}`}>
                {GUIDE_TEXT.eventNote}
              </p>
            </>
          )}

          {step === STEP.MODE_INTRO && (
            <ModeIntro isLeaving={isLeaving} onStart={() => advanceStep(() => setStep(STEP.PRACTICE))} />
          )}

          {step === STEP.PRACTICE && (
            <ExampleQuestion isLeaving={isLeaving} onAdvance={() => advanceStep(() => setStep(STEP.COUNTDOWN))} />
          )}

          {step === STEP.COUNTDOWN && (
            <Countdown isLeaving={isLeaving} onDone={() => advanceStep(() => navigate('/game'))} />
          )}
        </div>
      </div>
    </div>
  )
}
