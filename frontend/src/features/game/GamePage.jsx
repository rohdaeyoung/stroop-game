// 👤 담당: 김민서 (레이아웃은 통합 시점에 Figma 1920x1080 키오스크 기준으로 맞춤)
// 게임 화면 조립. 로직은 useStroopGame 훅에 있습니다.
import { useNavigate } from 'react-router-dom'
import { useStroopGame } from './useStroopGame.js'
import { useKioskScale } from '../../shared/hooks/useKioskScale.js'
import './Game.css'

export default function GamePage() {
  const navigate = useNavigate()
  const { scale } = useKioskScale()
  const game = useStroopGame({
    onGameOver: (result) => navigate('/result', { state: result }),
  })

  return (
    <div className="game-kiosk">
      <div
        className="game-kiosk__canvas"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <div className="game">
          {/* ── 좌상단: 점수 + 목숨 */}
          <div className="game__score-box">
            <div className="game__score">
              {game.score.toLocaleString()}<span className="game__score-unit">점</span>
            </div>
            <div className="game__lives">
              <span className="game__lives-label">목숨</span>
              {Array.from({ length: game.maxLives }, (_, i) => (
                <span
                  key={i}
                  className={`game__life ${i < game.lives ? 'is-on' : 'is-off'}`}
                />
              ))}
            </div>
          </div>

          {/* ── 중앙 상단: 모드 + 질문 + 문제 번호 */}
          <div className="game__head">
            <p className="game__question">
              <span className="game__mode-tag">{game.modeLabel}</span>
              {game.questionText}
            </p>
            <h1 className="game__counter">{game.questionNumber}번째 문제</h1>
            <p className="game__hint">째깍째깍 시간이 가고 있어요!</p>
          </div>

          {/* ── 우상단: 전체 시간 */}
          <div className="game__total-time">
            <div className="game__total-time-row">
              <span className="game__total-time-label">전체 시간</span>
              <span className="game__total-time-value">{game.totalTimeText}</span>
            </div>
            <div className="game__total-time-track">
              <div
                className="game__total-time-bar"
                style={{ width: `${game.totalTimeRatio * 100}%` }}
              />
            </div>
          </div>

          {/* ── 문제별 제한시간 */}
          <div className="game__timer">
            <div
              className="game__timer-bar"
              style={{ width: `${game.timeRatio * 100}%` }}
            />
          </div>

          {/* ── 단어 카드 */}
          <div className="game__card">
            <span className="game__word" style={{ color: game.quiz.inkColor.css }}>
              {game.quiz.word.label}
            </span>
          </div>

          {/* ── 선택지 */}
          <div className="game__choices">
            {game.quiz.choices.map((choice) => (
              <button
                key={choice.key}
                className="game__choice"
                style={{ background: choice.css }}
                onPointerDown={() => game.answer(choice.key)}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
