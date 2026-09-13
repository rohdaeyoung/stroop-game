// 👤 담당: 이혜원
// 할 일: 상위 랭킹 목록 불러와서 표시
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../design/components/Button.jsx'
import { api, getApiErrorMessage } from '../../shared/api/client.js'
import RankingRow from './RankingRow.jsx'
import './Ranking.css'

export default function RankingPage() {
  const navigate = useNavigate()
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadRankings = useCallback(() => {
    setLoading(true)
    setError(null)
    api.getRankings(10)
      .then((res) => setRankings(res.rankings))
      .catch((e) => setError(e))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadRankings() }, [loadRankings])

  return (
    <div className="ranking">
      <h2 className="ranking__title">🏆 랭킹 TOP 10</h2>

      {loading && (
        <p className="ranking__empty">서버를 깨우는 중이에요... (최대 1분)</p>
      )}
      {error && (
        <div className="ranking__error">
          <p className="ranking__empty">{getApiErrorMessage(error)}</p>
          <Button variant="ghost" onClick={loadRankings}>다시 시도</Button>
        </div>
      )}
      {!loading && !error && rankings.length === 0 && (
        <p className="ranking__empty">아직 기록이 없습니다.</p>
      )}

      <ol className="ranking__list">
        {rankings.map((row) => (
          <RankingRow key={row.rank} {...row} />
        ))}
      </ol>

      <Button variant="ghost" onClick={() => navigate('/')}>처음으로</Button>
    </div>
  )
}
