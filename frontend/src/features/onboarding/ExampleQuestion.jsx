// 👤 담당: 최복순
// 할 일: "이런 문제가 나와요" 예시를 애니메이션으로 보여주기
import { STROOP_COLORS } from '../../shared/constants/colors.js'

export default function ExampleQuestion() {
  // 예시: '빨강'이라고 써있지만 글자색은 파랑 → 정답은 '파랑'
  const word = STROOP_COLORS[0] // 빨강
  const inkColor = STROOP_COLORS[1] // 파랑

  return (
    <div className="onboarding__example">
      <p className="onboarding__example-label">글자의 <b>색</b>을 고르세요</p>
      <div className="onboarding__example-word" style={{ color: inkColor.css }}>
        {word.label}
      </div>
      <p className="onboarding__example-answer">
        정답: <b style={{ color: inkColor.css }}>{inkColor.label}</b>
      </p>
    </div>
  )
}
