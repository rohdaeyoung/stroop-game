// 👤 담당: 이혜원
// 할 일: 상위 랭킹 목록 불러와서 표시
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../design/components/Button.jsx'
import { api } from '../../shared/api/client.js'
import RankingRow from './RankingRow.jsx'
import './Ranking.css'

export default function RankingPage() {
  const navigate = useNavigate()
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getRankings(10)
      .then((res) => setRankings(res.rankings))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="ranking">
      <h2 className="ranking__title">🏆 랭킹 TOP 10</h2>

      {loading && <p className="ranking__empty">불러오는 중...</p>}
      {error && <p className="ranking__empty">{error}</p>}
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
