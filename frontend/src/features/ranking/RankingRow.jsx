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
          {/* 피그마 36:5(1위 avatar_box)는 2~10위와 달리 이니셜 대신 사진 에셋이 들어가는데,
              원본 에셋은 다운로드 권한 문제로 가져오지 못해 왕관 이모지로 대체했습니다
              (07 결과 화면의 🏅 메달과 같은 방식). 실제 에셋을 받으면 이미지로 교체하면 됩니다. */}
          {rank === 1 ? '👑' : nickname ? nickname[0] : '?'}
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
