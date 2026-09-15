// 👤 담당: 이혜원
const RANK_ACCENT = { 1: '#ffc93d', 2: '#c7d1e0', 3: '#d98c52' }

export default function RankingRow({ rank, nickname, score, isMe }) {
  const accent = RANK_ACCENT[rank]

  return (
    <li className={`ranking__row${isMe ? ' ranking__row--me' : ''}`}>
      <div className="ranking__row-left">
        <span className="ranking__rank" style={accent ? { color: accent } : undefined}>
          {rank}
        </span>
        <span
          className="ranking__avatar"
          style={accent ? { background: `${accent}40` } : undefined}
        >
          {nickname ? nickname[0] : '?'}
        </span>
        <span className="ranking__nickname">
          {nickname}
          {isMe ? ' (나)' : ''}
        </span>
      </div>
      <span className="ranking__score">{Number(score ?? 0).toLocaleString()}점</span>
    </li>
  )
}
