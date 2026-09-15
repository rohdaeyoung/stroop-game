// 👤 담당: 이혜원
// 07_결과 (Result) — 점수 공개 + 랭킹 미리보기
import { formatAccuracy } from './resultFlow.js'

export default function ScoreRevealStep({ score, correctCount, wrongCount, maxCombo, rank, onNext }) {
  const accuracy = formatAccuracy(correctCount, wrongCount)

  return (
    <div className="result__screen result__screen--reveal">
      <p className="result__reveal-eyebrow">게임이 종료되었습니다!</p>
      <h1 className="result__reveal-title">이야~ 멋쟁이 점수인데요?</h1>

      {/* 피그마의 메달 그래픽 에셋은 도구 접근 제한으로 가져오지 못해 이모지로 대체했습니다.
          실제 에셋 파일을 전달받으면 이미지로 교체하면 됩니다. */}
      <div className="result__medal" aria-hidden="true">🏅</div>

      <p className="result__reveal-score">
        {score.toLocaleString()}
        <span className="result__reveal-score-unit">점</span>
      </p>

      {typeof rank === 'number' && (
        <div className="result__rank-preview">🏆 현재 랭킹 {rank}위에 올랐어요!</div>
      )}

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
        랭킹 보러 가기 <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}
