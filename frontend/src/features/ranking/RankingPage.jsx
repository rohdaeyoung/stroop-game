// 👤 담당: 이혜원
// 할 일: 상위 랭킹 목록 불러와서 표시. 결과 화면에서 넘어오면(state) 내 순위를 하이라이트하거나
// 순위권 밖이면 하단에 고정 카드로 보여줍니다. /ranking 으로 바로 들어오면(state 없음) 그냥 목록만 보여줍니다.
// "어흥샷 찍으러 가기"를 누르면 같은 라우트 안에서 카메라(09) → QR(10) 단계로 이어집니다.
//
// 디자인 미리보기: 아직 실제 제출 기록이 없어서 목록이 비어있을 때, 화면이 채워진 모습을
// 보고 싶으면 주소 끝에 ?demo=in (순위권 안) 또는 ?demo=out (순위권 밖 고정 카드)을 붙여서
// 열면 mockRankings.js 의 더미 데이터로 보여줍니다. 실제 서비스 동작에는 영향 없어요.
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api, getApiErrorMessage } from '../../shared/api/client.js'
import RankingRow from './RankingRow.jsx'
import CameraStep from './CameraStep.jsx'
import QrStep from './QrStep.jsx'
import { useKioskScale } from './useKioskScale.js'
import { MOCK_TOP10_WITH_ME, MOCK_TOP10_WITHOUT_ME, MOCK_MY_PINNED } from './mockRankings.js'
import './Ranking.css'

export default function RankingPage() {
  const navigate = useNavigate()
  const { state, search } = useLocation()
  const { scale } = useKioskScale()

  const demoMode = new URLSearchParams(search).get('demo') // 'in' | 'out' | null

  const myRank = demoMode === 'out' ? MOCK_MY_PINNED.rank : demoMode === 'in' ? 3 : state?.myRank ?? null
  const myNickname =
    demoMode === 'out' ? MOCK_MY_PINNED.nickname : demoMode === 'in' ? '타이거짱 (나)' : state?.myNickname ?? null
  const myScore = demoMode === 'out' ? MOCK_MY_PINNED.score : demoMode === 'in' ? 2480 : state?.myScore ?? null

  const [step, setStep] = useState('list') // 'list' | 'camera' | 'qr'
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(!demoMode)
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
    if (demoMode) return // 미리보기 모드에선 실제 API를 부르지 않습니다
    loadRankings()
  }, [loadRankings, demoMode])

  const displayedRankings = demoMode === 'out' ? MOCK_TOP10_WITHOUT_ME : demoMode === 'in' ? MOCK_TOP10_WITH_ME : rankings

  const isInTop = myRank != null && displayedRankings.some((row) => row.rank === myRank)
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

            {!loading && !error && displayedRankings.length === 0 && (
              <p className="ranking__status">아직 기록이 없습니다.</p>
            )}

            {!loading && !error && displayedRankings.length > 0 && (
              <>
                <ol className="ranking__list">
                  {displayedRankings.map((row) => (
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
