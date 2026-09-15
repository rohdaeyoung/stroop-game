// 👤 담당: 최복순
// 할 일: 시작 화면, 모드 설명, 예시 문제, 카운트다운
// (닉네임은 결과 화면(features/result)에서 자체적으로 받으므로 여기서는 다루지 않습니다)
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModeIntro from './ModeIntro.jsx'
import ExampleQuestion from './ExampleQuestion.jsx'
import Countdown from './Countdown.jsx'
import { GUIDE_TEXT } from './guideText.js'
import { STROOP_COLORS } from '../../shared/constants/colors.js'
import likelionLogo from './assets/likelion-logo.png'
import './Onboarding.css'

const STEP = {
  START: 'start',
  MODE_INTRO: 'mode-intro',
  PRACTICE: 'practice',
  COUNTDOWN: 'countdown',
}

// 타이틀을 스트루프 게임처럼 알록달록하게 보여주기 위한 색 배정
const TITLE_WORDS = GUIDE_TEXT.title.split(' ').map((word, i) => ({
  word,
  color: STROOP_COLORS[i % STROOP_COLORS.length].css,
}))

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(STEP.START)

  return (
    <div
      className={`onboarding${step === STEP.START ? ' onboarding--start' : ''}`}
      onClick={step === STEP.START ? () => setStep(STEP.MODE_INTRO) : undefined}
    >
      {step === STEP.START && (
        <div className="onboarding__start">
          <p className="onboarding__brand">{GUIDE_TEXT.brand}</p>

          <img className="onboarding__mascot" src={likelionLogo} alt="" aria-hidden="true" />

          <h1 className="onboarding__title onboarding__title--stroop">
            {TITLE_WORDS.map(({ word, color }, i) => (
              <span key={i} style={{ color }}>
                {word}
                {i < TITLE_WORDS.length - 1 ? ' ' : ''}
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

          <p className="onboarding__event-note">{GUIDE_TEXT.eventNote}</p>
        </div>
      )}

      {step === STEP.MODE_INTRO && <ModeIntro onStart={() => setStep(STEP.PRACTICE)} />}

      {step === STEP.PRACTICE && <ExampleQuestion onAdvance={() => setStep(STEP.COUNTDOWN)} />}

      {step === STEP.COUNTDOWN && <Countdown onDone={() => navigate('/game')} />}
    </div>
  )
}
