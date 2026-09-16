// 👤 담당: 최복순
// 할 일: 실제 게임에 두 가지 질문 모드(색/뜻)가 섞여 나온다는 것을 미리 보여주기
import { STROOP_COLORS } from '../../shared/constants/colors.js'
import { GUIDE_TEXT } from './guideText.js'

// 예시: '빨강'이라고 써있지만 글자색은 파랑
const WORD_COLOR = STROOP_COLORS[0] // 빨강
const INK_COLOR = STROOP_COLORS[1] // 파랑

function ModeCard({ badgeClassName, badgeLabel, question, correctColor, wrongColor }) {
  return (
    <div className="onboarding__mode-card">
      <span className={`onboarding__badge ${badgeClassName}`}>{badgeLabel}</span>
      <p className="onboarding__mode-card-question">{question}</p>
      <div className="onboarding__mode-card-word onboarding__display" style={{ color: INK_COLOR.css }}>
        {WORD_COLOR.label}
      </div>
      <div className="onboarding__mode-card-choices">
        <span className="onboarding__choice onboarding__choice--sm onboarding__choice--highlight-sm" style={{ background: correctColor.css }}>
          {correctColor.label}
        </span>
        <span className="onboarding__choice onboarding__choice--sm onboarding__choice--muted" style={{ background: wrongColor.css }}>
          {wrongColor.label}
        </span>
      </div>
    </div>
  )
}

export default function ModeIntro({ isLeaving, onStart }) {
  return (
    <div className={`onboarding__mode-intro${isLeaving ? ' onboarding__mode-intro--leaving' : ''}`}>
      <h1 className="onboarding__title onboarding__display">{GUIDE_TEXT.modeIntroTitle}</h1>
      <p className="onboarding__desc">{GUIDE_TEXT.modeIntroDesc}</p>

      <div className="onboarding__mode-cards">
        <ModeCard
          badgeClassName="onboarding__badge--a"
          badgeLabel={GUIDE_TEXT.modeALabel}
          question={GUIDE_TEXT.modeAQuestion}
          correctColor={INK_COLOR}
          wrongColor={WORD_COLOR}
        />
        <ModeCard
          badgeClassName="onboarding__badge--b"
          badgeLabel={GUIDE_TEXT.modeBLabel}
          question={GUIDE_TEXT.modeBQuestion}
          correctColor={WORD_COLOR}
          wrongColor={INK_COLOR}
        />
      </div>

      <button type="button" className="onboarding__start-cta" onClick={onStart}>
        {GUIDE_TEXT.modeIntroCta} →
      </button>
    </div>
  )
}
