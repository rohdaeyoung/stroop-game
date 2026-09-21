// 👤 담당: 김민서 (레이아웃은 통합 시점에 Figma 1920x1080 키오스크 기준으로 맞춤)
// 게임 화면 조립. 로직은 useStroopGame 훅에 있습니다.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStroopGame, BADGE_VISIBLE_MS } from './useStroopGame.js'
import { useKioskScale } from '../../shared/hooks/useKioskScale.js'
import Glow from '../../design/components/Glow.jsx'
import mascotHype from './assets/mascot-hype.png'
import './Game.css'

// 온보딩 대기화면 네 모서리와 같은 색 배치(빨강→파랑→초록→노랑)를 그대로 씁니다.
const GAME_GLOW_COLORS = ['#ff5363', '#3b7afa', '#2ec770', '#ffc93d']

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
          <Glow colors={GAME_GLOW_COLORS} />

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

          {/* ── 중앙 상단: 모드 + 질문 + 문제 번호 (모드 인트로가 떠 있는 동안만 숨깁니다 —
              Figma 05_플레이 — 모드강조 시안3 에서도 인트로 아래 요소들은 hidden 처리돼 있습니다.
              feedback 단계에서는 단어 카드처럼 이것도 그대로 남아있어야 합니다.) */}
          {game.phase !== 'intro' && (
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
              단어·색 중 뭘 봐야 하는지 헷갈린다는 피드백으로 나연님이 새로 만든 화면입니다.
              답을 고른 직후에는 'feedback' 단계라 이 인트로는 아직 안 뜨고, 방금 보던 단어
              카드 위에 콤보/오답 배지 + 마스코트만 잠깐 얹혀서 보였다가 그다음에야 이
              인트로가 화면을 덮습니다 (예전엔 인트로가 배지와 동시에 떠서 서로 가리는
              문제가 있었습니다). */}
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

              {/* ── 단어 카드 (feedback 단계에서는 방금 답한 단어가 그대로 남아있습니다) */}
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

          {/* ── 선택지 (feedback 단계에서도 방금 고른 선택지가 그대로 보이도록 남겨두고,
              대신 answeredRef 가드로 이미 막히는 클릭을 disabled 로도 표시합니다) */}
          {game.phase !== 'intro' && (
            <div className="game__choices">
              {game.quiz.choices.map((choice) => (
                <button
                  key={choice.key}
                  className="game__choice"
                  style={{ background: choice.css }}
                  disabled={game.phase !== 'question'}
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
