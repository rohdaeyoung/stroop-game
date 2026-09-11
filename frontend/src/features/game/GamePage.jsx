// 👤 담당: 김민서
// 할 일: 게임 화면 전체 조립. 로직은 useStroopGame 훅에 있습니다.
import { useNavigate } from 'react-router-dom'
import { useStroopGame } from './useStroopGame.js'
import './Game.css'

export default function GamePage() {
  const navigate = useNavigate()
  const game = useStroopGame({
    onGameOver: (result) => navigate('/result', { state: result }),
  })

  return (
    <div className="game">
      <header className="game__hud">
        <span className="game__score">{game.score}점</span>
        <span className="game__combo">{game.combo} COMBO</span>
        <span className="game__lives">{'♥'.repeat(game.lives)}</span>
      </header>

      <div className="game__timer">
        <div
          className="game__timer-bar"
          style={{ width: `${game.timeRatio * 100}%` }}
        />
      </div>

      <p className="game__question">{game.questionText}</p>

      <div className="game__word" style={{ color: game.quiz.inkColor.css }}>
        {game.quiz.word.label}
      </div>

      <div className="game__choices">
        {game.quiz.choices.map((choice) => (
          <button
            key={choice.key}
            className="game__choice"
            onPointerDown={() => game.answer(choice.key)}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  )
}
