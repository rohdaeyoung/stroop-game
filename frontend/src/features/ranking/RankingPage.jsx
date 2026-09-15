// 👤 담당: 이혜원
// 할 일: 상위 랭킹 목록 불러와서 표시. 결과 화면에서 넘어오면(state) 내 순위를 하이라이트하거나
// 순위권 밖이면 하단에 고정 카드로 보여줍니다. /ranking 으로 바로 들어오면(state 없음) 그냥 목록만 보여줍니다.
// "어흥샷 찍으러 가기"를 누르면 같은 라우트 안에서 카메라(09) → QR(10) 단계로 이어집니다.
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api, getApiErrorMessage } from '../../shared/api/client.js'
import RankingRow from './RankingRow.jsx'
import CameraStep from './CameraStep.jsx'
import QrStep from './QrStep.jsx'
import { useKioskScale } from './useKioskScale.js'
import './Ranking.css'

export default function RankingPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { scale } = useKioskScale()

  const myRank = state?.myRank ?? null
  const myNickname = state?.myNickname ?? null
  const myScore = state?.myScore ?? null

  const [step, setStep] = useState('list') // 'list' | 'camera' | 'qr'
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadRankings = useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .getRankings(10)
      .then((res) => setRankings(res.rankings))
      .catch((e) => setError(e))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadRankings()
  }, [loadRankings])

  const isInTop = myRank != null && rankings.some((row) => row.rank === myRank)
  const showPinned = myRank != null && !isInTop

  return (
    <div className="ranking-kiosk">
      <div
        className="ranking-kiosk__canvas"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {step === 'list' && (
          <div className="ranking__screen">
            <div className="ranking__badge">실시간 랭킹</div>
            <h1 className="ranking__title">명예의 전당</h1>

            {loading && <p className="ranking__status">서버를 깨우는 중이에요... (최대 1분)</p>}

            {error && (
              <div className="ranking__status-block">
                <p className="ranking__status">{getApiErrorMessage(error)}</p>
                <button type="button" className="ranking__retry" onClick={loadRankings}>
                  다시 시도
                </button>
              </div>
            )}

            {!loading && !error && rankings.length === 0 && (
              <p className="ranking__status">아직 기록이 없습니다.</p>
            )}

            {!loading && !error && rankings.length > 0 && (
              <>
                <ol className="ranking__list">
                  {rankings.map((row) => (
                    <RankingRow key={row.rank} {...row} isMe={row.rank === myRank} />
                  ))}
                </ol>

                {showPinned && (
                  <>
                    <p className="ranking__ellipsis" aria-hidden="true">⋮</p>
                    <ol className="ranking__list ranking__list--pinned">
                      <RankingRow rank={myRank} nickname={myNickname} score={myScore} isMe />
                    </ol>
                  </>
                )}
              </>
            )}

            <div className="ranking__cta-row">
              <button type="button" className="ranking__cta" onClick={() => navigate('/')}>
                사진은 괜찮아요! <span aria-hidden="true">→</span>
              </button>
              <button type="button" className="ranking__cta" onClick={() => setStep('camera')}>
                어흥샷 찍으러 가기 <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}

        {step === 'camera' && (
          <CameraStep onNext={() => setStep('qr')} onSkip={() => navigate('/')} />
        )}

        {step === 'qr' && <QrStep onHome={() => navigate('/')} />}
      </div>
    </div>
  )
}
