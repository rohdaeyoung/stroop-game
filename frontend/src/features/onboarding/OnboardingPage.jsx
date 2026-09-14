// 👤 담당: 최복순
// 할 일: 시작 화면, 게임 설명, 예시 문제 보여주기, 닉네임 입력
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../design/components/Button.jsx'
import ExampleQuestion from './ExampleQuestion.jsx'
import NicknameInput from './NicknameInput.jsx'
import { GUIDE_TEXT } from './guideText.js'
import { saveNickname } from './nicknameStorage.js'
import { STROOP_COLORS } from '../../shared/constants/colors.js'
import likelionLogo from './assets/likelion-logo.png'
import './Onboarding.css'

const STEP = {
  START: 'start',
  GUIDE: 'guide',
  NICKNAME: 'nickname',
}

// 타이틀을 스트루프 게임처럼 알록달록하게 보여주기 위한 색 배정
const TITLE_WORDS = GUIDE_TEXT.title.split(' ').map((word, i) => ({
  word,
  color: STROOP_COLORS[i % STROOP_COLORS.length].css,
}))

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(STEP.START)

  function handleNicknameConfirm(nickname) {
    saveNickname(nickname)
    navigate('/game')
  }

  return (
    <div
      className={`onboarding${step === STEP.START ? ' onboarding--start' : ''}`}
      onClick={step === STEP.START ? () => setStep(STEP.GUIDE) : undefined}
    >
      {step === STEP.START && (
        <div className="onboarding__start">
          <img className="onboarding__mascot" src={likelionLogo} alt="" aria-hidden="true" />

          <p className="onboarding__brand">{GUIDE_TEXT.brand}</p>

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
              setStep(STEP.GUIDE)
            }}
          >
            {GUIDE_TEXT.startCta} →
          </button>

          <p className="onboarding__meta">{GUIDE_TEXT.meta}</p>
          <p className="onboarding__event-note">{GUIDE_TEXT.eventNote}</p>

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
      )}

      {step === STEP.GUIDE && (
        <>
          <h1 className="onboarding__title">{GUIDE_TEXT.guideTitle}</h1>
          <p className="onboarding__desc">{GUIDE_TEXT.guideDesc}</p>

          <ExampleQuestion />

          <ul className="onboarding__tips">
            {GUIDE_TEXT.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>

          <div className="onboarding__actions">
            <Button onClick={() => setStep(STEP.NICKNAME)}>{GUIDE_TEXT.nextCta}</Button>
          </div>
        </>
      )}

      {step === STEP.NICKNAME && <NicknameInput onConfirm={handleNicknameConfirm} />}
    </div>
  )
}
