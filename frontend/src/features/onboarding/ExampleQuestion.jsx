// 👤 담당: 최복순
// 할 일: "이런 문제가 나와요" 예시를 직접 눌러보게 하기 (연습용, 점수 없음)
import { useState } from 'react'
import { STROOP_COLORS } from '../../shared/constants/colors.js'
import { GUIDE_TEXT } from './guideText.js'
import mascotWrong from './assets/mascot-wrong.png'
import mascotCorrect from './assets/mascot-correct.png'

// 예시: '빨강'이라고 써있지만 글자색은 파랑 → 정답은 '파랑'
const WORD_COLOR = STROOP_COLORS[0] // 빨강
const INK_COLOR = STROOP_COLORS[1] // 파랑
const CHOICES = [STROOP_COLORS[0], STROOP_COLORS[1], STROOP_COLORS[3], STROOP_COLORS[2]] // 빨강 파랑 노랑 초록

export default function ExampleQuestion({ onAdvance }) {
  const [picked, setPicked] = useState(null)

  const isCorrect = picked?.key === INK_COLOR.key

  function handlePick(color) {
    setPicked(color)
  }

  const title = !picked ? GUIDE_TEXT.practiceTitle : isCorrect ? GUIDE_TEXT.correctTitle : GUIDE_TEXT.wrongTitle
  const desc = !picked
    ? GUIDE_TEXT.practiceDesc
    : isCorrect
      ? GUIDE_TEXT.correctDesc
      : GUIDE_TEXT.wrongDescTemplate(WORD_COLOR.label, INK_COLOR.label)

  return (
    <>
      <div className={`onboarding__banner${isCorrect ? ' onboarding__banner--correct' : picked ? ' onboarding__banner--wrong' : ''}`}>
        <span className="onboarding__badge onboarding__badge--a">{GUIDE_TEXT.modeALabel}</span>
        <span className="onboarding__banner-text">{isCorrect ? GUIDE_TEXT.correctBanner : GUIDE_TEXT.practiceBanner}</span>
      </div>

      <div className="onboarding__example">
        <h1 className="onboarding__title">{title}</h1>
        <p className="onboarding__desc">{desc}</p>

        <div className="onboarding__example-word" style={{ color: INK_COLOR.css }}>
          {WORD_COLOR.label}
        </div>

        <div className="onboarding__example-choices">
          {CHOICES.map((color) => {
            const isPicked = picked?.key === color.key
            const isAnswer = picked && color.key === INK_COLOR.key
            return (
              <button
                key={color.key}
                type="button"
                className={`onboarding__choice${isPicked && !isAnswer ? ' onboarding__choice--wrong' : ''}${isAnswer ? ' onboarding__choice--highlight' : ''}${picked && !isPicked && !isAnswer ? ' onboarding__choice--muted' : ''}`}
                style={{ background: color.css }}
                onClick={() => handlePick(color)}
                disabled={Boolean(picked)}
              >
                {isAnswer && <img className="onboarding__choice-badge" src={mascotCorrect} alt="" aria-hidden="true" />}
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
          <button type="button" className="onboarding__example-link onboarding__example-link--primary" onClick={onAdvance}>
            {GUIDE_TEXT.correctAdvanceCta} →
          </button>
        )}
      </div>
    </>
  )
}
