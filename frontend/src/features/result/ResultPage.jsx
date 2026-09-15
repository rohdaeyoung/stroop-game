// 👤 담당: 이혜원
// 할 일: 게임 종료 → 닉네임 입력 → 점수 공개, 3단계를 한 라우트(/result) 안에서 처리합니다.
// (피그마상 05b_게임종료 / 06_닉네임입력 / 07_결과는 별도 프레임이지만,
//  App.jsx 라우팅은 공용 파일이라 새 라우트를 추가하지 않고 내부 단계로 구현했습니다.)
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api, getApiErrorMessage } from '../../shared/api/client.js'
import GameOverStep from './GameOverStep.jsx'
import NicknameStep from './NicknameStep.jsx'
import ScoreRevealStep from './ScoreRevealStep.jsx'
import { detectEndReason } from './resultFlow.js'
import { useKioskScale } from './useKioskScale.js'
import './Result.css'

export default function ResultPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { scale } = useKioskScale()

  const [step, setStep] = useState('gameover') // 'gameover' | 'nickname' | 'reveal'
  const [nickname, setNickname] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(null)

  // 게임을 거치지 않고 직접 들어온 경우
  if (!state) {
    return (
      <div className="result-kiosk">
        <div className="result__screen result__screen--empty">
          <p className="result__empty-text">게임 기록이 없습니다.</p>
          <button type="button" className="result__cta" onClick={() => navigate('/')}>
            처음으로
          </button>
        </div>
      </div>
    )
  }

  async function handleSubmitNickname(value) {
    setNickname(value)
    setError(null)
    setSubmitting(true)
    try {
      const res = await api.submitScore({ nickname: value, ...state })
      setSubmitted(res)
      setStep('reveal')
    } catch (e) {
      setError(getApiErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  function handleGoRanking() {
    navigate('/ranking', {
      state: {
        myRank: submitted?.rank ?? null,
        myNickname: nickname,
        myScore: state.score,
      },
    })
  }

  return (
    <div className="result-kiosk">
      <div
        className="result-kiosk__canvas"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {step === 'gameover' && (
          <GameOverStep
            reason={detectEndReason(state)}
            score={state.score}
            playTimeMs={state.playTimeMs}
            onNext={() => setStep('nickname')}
          />
        )}

        {step === 'nickname' && (
          <NicknameStep submitting={submitting} error={error} onSubmit={handleSubmitNickname} />
        )}

        {step === 'reveal' && submitted && (
          <ScoreRevealStep
            score={state.score}
            correctCount={state.correctCount}
            wrongCount={state.wrongCount}
            maxCombo={state.maxCombo}
            rank={submitted.rank}
            onNext={handleGoRanking}
          />
        )}
      </div>
    </div>
  )
}
