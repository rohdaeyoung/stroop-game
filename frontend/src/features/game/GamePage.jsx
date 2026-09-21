// 👤 담당: 김민서 (레이아웃은 통합 시점에 Figma 1920x1080 키오스크 기준으로 맞춤)
// 게임 화면 조립. 로직은 useStroopGame 훅에 있습니다.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStroopGame } from './useStroopGame.js'
import { useKioskScale } from '../../shared/hooks/useKioskScale.js'
import mascotHype from './assets/mascot-hype.png'
import './Game.css'

// 콤보/스피드/오답 배지가 화면에 떠 있는 시간 (Game.css 의 game-badge-pop 애니메이션
// 길이와 맞춰야 합니다)
const BADGE_VISIBLE_MS = 1100

export default function GamePage() {
  const navigate = useNavigate()
  const { scale } = useKioskScale()
  const game = useStroopGame({
    onGameOver: (result) => navigate('/result', { state: result }),
  })

  const [comboBadge, setComboBadge] = useState(null)
  const [speedBadge, setSpeedBadge] = useState(null)
  const [missBadge, setMissBadge] = useState(null)

  useEffect(() => {
    if (!game.lastGain) return
    setSpeedBadge(game.lastGain)
    const speedTimer = setTimeout(() => setSpeedBadge(null), BADGE_VISIBLE_MS)

    if (game.lastGain.combo >= 2) {
      setComboBadge(game.lastGain)
      const comboTimer = setTimeout(() => setComboBadge(null), BADGE_VISIBLE_MS)
      return () => {
        clearTimeout(speedTimer)
        clearTimeout(comboTimer)
      }
    }
    return () => clearTimeout(speedTimer)
  }, [game.lastGain])

  useEffect(() => {
    if (!game.lastMiss) return
    setMissBadge(game.lastMiss)
    const timer = setTimeout(() => setMissBadge(null), BADGE_VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [game.lastMiss])

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

          {/* ── 중앙 상단: 모드 + 질문 + 문제 번호 (모드 인트로가 떠 있는 동안은 숨깁니다 —
              Figma 05_플레이 — 모드강조 시안3 에서도 인트로 아래 요소들은 hidden 처리돼 있습니다) */}
          {game.phase === 'question' && (
            <div className="game__head">
              <p className="game__question">
                <span className="game__mode-tag">{game.modeLabel}</span>
                {game.questionText}
              </p>
              <h1 className="game__counter">{game.questionNumber}번째 문제</h1>
              <p className="game__hint">째깍째깍 시간이 가고 있어요!</p>
            </div>
          )}

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

          {/* ── 모드 인트로: 문제가 바뀔 때마다 잠깐 떠서 "이번 문제는 색/뜻이에요!" 를
              알려줍니다 (Figma 05_플레이 — 모드강조 시안3, node 420:342/420:395).
              단어·색 중 뭘 봐야 하는지 헷갈린다는 피드백으로 나연님이 새로 만든 화면입니다. */}
          {game.phase === 'intro' ? (
            <div className={`game__mode-intro game__mode-intro--${game.isColorMode ? 'color' : 'word'}`}>
              <p className="game__mode-intro-watermark">{game.isColorMode ? 'COLOR' : 'Meaning'}</p>
              <h2 className="game__mode-intro-headline">
                이번 문제는 <em>{game.isColorMode ? '색' : '뜻'}</em>이에요!
              </h2>
              <p className="game__mode-intro-sub">
                글자의 &quot;{game.isColorMode ? '색' : '뜻'}&quot;을 고르세요
              </p>
            </div>
          ) : (
            <>
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
            </>
          )}

          {/* ── 콤보 / 스피드 / 오답 배지 + 마스코트 (Figma 170:155/170:159/170:161,
              마스코트는 170:153/170:154 — 오답 쪽은 같은 애셋을 재사용합니다) */}
          {comboBadge && (
            <div key={`combo-${comboBadge.seq}`} className="game__badge-pop">
              <img className="game__badge-mascot game__badge-mascot--combo" src={mascotHype} alt="" aria-hidden="true" />
              <div className="game__combo-badge">COMBO ×{comboBadge.combo}</div>
            </div>
          )}
          {speedBadge && (
            <div key={`speed-${speedBadge.seq}`} className="game__badge-pop">
              <img className="game__badge-mascot game__badge-mascot--speed" src={mascotHype} alt="" aria-hidden="true" />
              <div className="game__speed-badge">SPEED +{speedBadge.speedBonus}</div>
            </div>
          )}
          {missBadge && (
            <div key={`miss-${missBadge.seq}`} className="game__badge-pop">
              <img className="game__badge-mascot game__badge-mascot--miss" src={mascotHype} alt="" aria-hidden="true" />
              <div className="game__miss-badge">MISS -{missBadge.penalty}</div>
            </div>
          )}

          {/* ── 선택지 */}
          {game.phase === 'question' && (
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
          )}
        </div>
      </div>
    </div>
  )
}
