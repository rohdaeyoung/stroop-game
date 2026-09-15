// 👤 담당: 이혜원
// 05b_게임 종료 (Game Over) — 피그마 종료 사유 3종(오답3회/미응답/총시간경과)에 대응
import mascot from './assets/mascot.png'
import { END_REASON, formatElapsedSeconds } from './resultFlow.js'

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

export default function GameOverStep({ reason, score, playTimeMs, onNext }) {
  const content =
    reason === END_REASON.TOTAL_TIME_UP
      ? {
          badge: `⏱ 총 ${formatElapsedSeconds(playTimeMs)}초 경과`,
          lines: [
            `정해진 ${formatElapsedSeconds(playTimeMs)}초가 모두 지나갔어요.`,
            '오늘 도전은 여기까지! 결과를 확인해볼까요?',
          ],
        }
      : STATIC_CONTENT[reason]

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

      <button type="button" className="result__cta" onClick={onNext}>
        결과 확인하러 가기 <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}
