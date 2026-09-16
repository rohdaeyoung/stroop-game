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

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { scale } = useKioskScale()
  const [step, setStep] = useState(STEP.START)

  return (
    <div className="onboarding-kiosk">
      <div className="onboarding-kiosk__canvas" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <div
          className={`onboarding${step === STEP.START ? ' onboarding--start' : ''}`}
          onClick={step === STEP.START ? () => setStep(STEP.MODE_INTRO) : undefined}
        >
          {(step === STEP.START || step === STEP.MODE_INTRO) && (
            <div className="onboarding__brand">
              <img src={likelionWordmark} alt="LIKELION SKU" />
            </div>
          )}

          {step === STEP.START && (
            <>
              <img className="onboarding__watermark" src={likelionLogo} alt="" aria-hidden="true" />
              <div className="onboarding__start">
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
                    setStep(STEP.MODE_INTRO)
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

              <p className="onboarding__event-note">{GUIDE_TEXT.eventNote}</p>
            </>
          )}

          {step === STEP.MODE_INTRO && <ModeIntro onStart={() => setStep(STEP.PRACTICE)} />}

          {step === STEP.PRACTICE && <ExampleQuestion onAdvance={() => setStep(STEP.COUNTDOWN)} />}

          {step === STEP.COUNTDOWN && <Countdown onDone={() => navigate('/game')} />}
        </div>
      </div>
    </div>
  )
}
