// 👤 담당: 최복순
// 할 일: "이런 문제가 나와요" 예시를 직접 눌러보게 하기 (연습용, 점수 없음)
import { useState } from 'react'
import { STROOP_COLORS } from '../../shared/constants/colors.js'
import { GUIDE_TEXT } from './guideText.js'

// 예시: '빨강'이라고 써있지만 글자색은 파랑 → 정답은 '파랑'
const WORD_COLOR = STROOP_COLORS[0] // 빨강
const INK_COLOR = STROOP_COLORS[1] // 파랑
const CHOICES = [STROOP_COLORS[0], STROOP_COLORS[1], STROOP_COLORS[3], STROOP_COLORS[2]] // 빨강 파랑 노랑 초록

export default function ExampleQuestion() {
  const [picked, setPicked] = useState(null)

  const isCorrect = picked?.key === INK_COLOR.key

  function handlePick(color) {
    setPicked(color)
  }

  return (
    <div className="onboarding__example">
      <p className="onboarding__example-label">{GUIDE_TEXT.exampleLabel}</p>
      <p className="onboarding__example-question">글자의 <b>색</b>을 고르세요</p>

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
              className={`onboarding__example-choice${isPicked ? ' onboarding__example-choice--picked' : ''}${isAnswer ? ' onboarding__example-choice--answer' : ''}`}
              style={{ background: color.css }}
              onClick={() => handlePick(color)}
              disabled={Boolean(picked)}
            >
              {color.label}
            </button>
          )
        })}
      </div>

      {!picked && <p className="onboarding__example-hint">{GUIDE_TEXT.exampleHint}</p>}

      {picked && (
        <div className={`onboarding__example-feedback${isCorrect ? ' onboarding__example-feedback--correct' : ' onboarding__example-feedback--wrong'}`}>
          <p className="onboarding__example-feedback-title">
            {isCorrect ? GUIDE_TEXT.correctFeedbackTitle : GUIDE_TEXT.wrongFeedbackTitle}
          </p>
          <p className="onboarding__example-answer">
            정답은 단어 뜻이 아니라 실제 색깔인{' '}
            <b style={{ color: INK_COLOR.css }}>{INK_COLOR.label}</b>이에요!
          </p>
          <button type="button" className="onboarding__example-retry" onClick={() => setPicked(null)}>
            다시 해보기
          </button>
        </div>
      )}
    </div>
  )
}
