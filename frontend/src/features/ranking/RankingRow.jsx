// 👤 담당: 이혜원
const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function RankingRow({ rank, nickname, score, maxCombo }) {
  return (
    <li className="ranking__row">
      <span className="ranking__rank">{MEDALS[rank] ?? rank}</span>
      <span className="ranking__nickname">{nickname}</span>
      <span className="ranking__combo">{maxCombo} COMBO</span>
      <span className="ranking__score">{score}점</span>
    </li>
  )
}
