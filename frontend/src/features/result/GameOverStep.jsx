// 👤 담당: 이혜원
// 05b_게임 종료 (Game Over) — 피그마 종료 사유 3종(오답3회/미응답/총시간경과)에 대응
// 총시간경과(TOTAL_TIME_UP)만 피그마 14:2(07_결과) 디자인을 그대로 써달라는 피드백을 받아서
// 나머지 2종(오답3회/미응답)과 다른 레이아웃으로 분기합니다. 다음 단계(닉네임 입력)로 넘어가는
// 흐름 자체는 그대로라 버튼은 여전히 onNext 하나만 씁니다.
import mascot from './assets/mascot.png'
import { END_REASON, formatAccuracy } from './resultFlow.js'

const STATIC_CONTENT = {
  [END_REASON.WRONG_LIMIT]: {
    badge: '❌ 오답 3회 누적',
    lines: [
      '오답이 3번 쌓이면 이번 도전은 여기까지예요.',
      '그래도 여기까지 온 당신! 멋쟁이 인정~',
    ],
  },
  [END_REASON.NO_ANSWER]: {
    badge: '⌛ 제한시간 내 미응답',
    lines: [
      '문제 제한 시간 안에 답을 고르지 못했어요.',
      '다음엔 조금 더 빠르게 도전해봐요!',
    ],
  },
}

export default function GameOverStep({
  reason,
  score,
  correctCount,
  wrongCount,
  maxCombo,
  onNext,
}) {
  // 총시간경과는 피그마 14:2(07_결과) 디자인 그대로 — 통계 카드까지 미리 보여주고
  // "결과 확인하러 가기"를 누르면 지금처럼 닉네임 입력으로 넘어갑니다 (순위는 아직 제출 전이라 미표시)
  if (reason === END_REASON.TOTAL_TIME_UP) {
    const accuracy = formatAccuracy(correctCount, wrongCount)
    return (
      <div className="result__screen result__screen--reveal">
        <p className="result__reveal-eyebrow">게임이 종료되었습니다!</p>
        <h1 className="result__reveal-title">이야~ 멋쟁이 점수인데요?</h1>

        {/* 피그마의 메달 그래픽 에셋은 도구 접근 제한으로 가져오지 못해 이모지로 대체했습니다 */}
        <div className="result__medal" aria-hidden="true">🏅</div>

        <p className="result__reveal-score">
          {score.toLocaleString()}
          <span className="result__reveal-score-unit">점</span>
        </p>

        <div className="result__stats-row">
          <div className="result__stat-card result__stat-card--correct">
            <p className="result__stat-value">{correctCount}개</p>
            <p className="result__stat-label">정답 개수</p>
          </div>
          <div className="result__stat-card result__stat-card--combo">
            <p className="result__stat-value">×{maxCombo}</p>
            <p className="result__stat-label">최고 콤보</p>
          </div>
          <div className="result__stat-card result__stat-card--accuracy">
            <p className="result__stat-value">{accuracy}%</p>
            <p className="result__stat-label">정확도</p>
          </div>
        </div>

        <button type="button" className="result__cta result__cta--reveal" onClick={onNext}>
          결과 확인하러 가기 <span aria-hidden="true">→</span>
        </button>
      </div>
    )
  }

  const content = STATIC_CONTENT[reason]

  return (
    <div className="result__screen result__screen--gameover">
      <img className="result__mascot" src={mascot} alt="" aria-hidden="true" />

      <div className="result__badge result__badge--danger">{content.badge}</div>
      <h1 className="result__gameover-title">게임 종료!</h1>
      <p className="result__gameover-body">
        {content.lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>

      <p className="result__gameover-label">지금까지 획득한 점수</p>
      <p className="result__gameover-score">{score.toLocaleString()}점</p>

      <button type="button" className="result__cta result__cta--gameover" onClick={onNext}>
        결과 확인하러 가기 <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}
