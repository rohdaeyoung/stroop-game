// 👤 담당: 최복순
// 할 일: "이런 문제가 나와요" 예시를 직접 눌러보게 하기 (연습용, 점수 없음)
import { useState } from 'react'
import { STROOP_COLORS } from '../../shared/constants/colors.js'
import { GUIDE_TEXT } from './guideText.js'
import { CORRECT_TITLE_SPANS } from './colorizeText.js'
import mascotWrong from './assets/mascot-wrong.png'
import mascotCorrect from './assets/mascot-correct.png'
import likelionLogo from './assets/likelion-logo.png'

// 예시: '빨강'이라고 써있지만 글자색은 파랑 → 정답은 '파랑'
const WORD_COLOR = STROOP_COLORS[0] // 빨강
const INK_COLOR = STROOP_COLORS[1] // 파랑

// Figma 실측 — 선택지 기본 상태의 컬러 글로우 (색상별 그림자, 0.35 알파)
const CHOICE_SHADOW = {
  red: 'rgba(255, 71, 89, 0.35)',
  blue: 'rgba(59, 122, 250, 0.35)',
  yellow: 'rgba(255, 201, 61, 0.35)',
  green: 'rgba(46, 199, 112, 0.35)',
}

export default function ExampleQuestion({ onAdvance }) {
  const [picked, setPicked] = useState(null)

  const isCorrect = picked?.key === INK_COLOR.key

  function handlePick(color) {
    setPicked(color)
  }

  const desc = !picked
    ? GUIDE_TEXT.practiceDesc
    : isCorrect
      ? GUIDE_TEXT.correctDesc
      : GUIDE_TEXT.wrongDescTemplate(WORD_COLOR.label, INK_COLOR.label)

  return (
    <>
      <div className="onboarding__banner">
        <span className="onboarding__badge onboarding__badge--a">{GUIDE_TEXT.modeALabel}</span>
        <span className="onboarding__banner-text">{isCorrect ? GUIDE_TEXT.correctBanner : GUIDE_TEXT.practiceBanner}</span>
      </div>

      <div className="onboarding__example">
        {isCorrect ? (
          <h1 className="onboarding__title onboarding__display">
            {CORRECT_TITLE_SPANS.map(({ text, color }, i) => (
              <span key={i} style={color ? { color } : undefined}>
                {text}
              </span>
            ))}
          </h1>
        ) : (
          <h1 className="onboarding__title onboarding__display">{!picked ? GUIDE_TEXT.practiceTitle : GUIDE_TEXT.wrongTitle}</h1>
        )}

        <p className="onboarding__desc">{desc}</p>

        <div className="onboarding__example-word-card">
          <div className="onboarding__example-word onboarding__display" style={{ color: INK_COLOR.css }}>
            {WORD_COLOR.label}
          </div>
        </div>

        <div className="onboarding__example-choices">
          {[STROOP_COLORS[0], STROOP_COLORS[1], STROOP_COLORS[3], STROOP_COLORS[2]].map((color) => {
            const isPicked = picked?.key === color.key
            const isAnswer = picked && color.key === INK_COLOR.key
            return (
              <button
                key={color.key}
                type="button"
                className={`onboarding__choice${isPicked && !isAnswer ? ' onboarding__choice--wrong' : ''}${isAnswer ? ' onboarding__choice--highlight' : ''}${picked && !isPicked && !isAnswer ? ' onboarding__choice--dim' : ''}`}
                style={{ background: color.css, '--choice-shadow': CHOICE_SHADOW[color.key] }}
                onClick={() => handlePick(color)}
                disabled={Boolean(picked)}
              >
                {isAnswer && (
                  <img
                    className="onboarding__choice-badge"
                    src={isCorrect ? likelionLogo : mascotCorrect}
                    alt=""
                    aria-hidden="true"
                  />
                )}
                {isPicked && !isAnswer && <img className="onboarding__choice-badge" src={mascotWrong} alt="" aria-hidden="true" />}
                {color.label}
              </button>
            )
          })}
        </div>

        {!picked && <p className="onboarding__example-hint">{GUIDE_TEXT.practiceHint}</p>}

        {picked && !isCorrect && (
          <button type="button" className="onboarding__example-link" onClick={onAdvance}>
            {GUIDE_TEXT.wrongAdvanceCta} →
          </button>
        )}

        {picked && isCorrect && (
          <button type="button" className="onboarding__example-link" onClick={onAdvance}>
            {GUIDE_TEXT.correctAdvanceCta} →
          </button>
        )}
      </div>
    </>
  )
}
