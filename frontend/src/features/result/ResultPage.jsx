// 👤 담당: 이혜원
// 할 일: 게임 종료 → 닉네임 입력 → 점수 공개, 3단계를 한 라우트(/result) 안에서 처리합니다.
// (피그마상 05b_게임종료 / 06_닉네임입력 / 07_결과는 별도 프레임이지만,
//  App.jsx 라우팅은 공용 파일이라 새 라우트를 추가하지 않고 내부 단계로 구현했습니다.)
//
// 디자인 미리보기: 실제로 게임을 플레이하지 않고도 화면을 보고 싶으면 주소 끝에
// ?demo=wrong (오답3회) / noanswer (미응답) / timeup (총시간경과) / nickname / reveal (결과공개)
// 을 붙여서 열면 아래 더미 데이터로 곧장 그 화면을 보여줍니다. 실제 서비스 동작에는 영향 없어요.
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api, getApiErrorMessage } from '../../shared/api/client.js'
import GameOverStep from './GameOverStep.jsx'
import NicknameStep from './NicknameStep.jsx'
import ScoreRevealStep from './ScoreRevealStep.jsx'
import { detectEndReason } from './resultFlow.js'
import { useKioskScale } from '../../shared/hooks/useKioskScale.js'
import './Result.css'

const DEMO_STATE = { score: 2480, correctCount: 24, wrongCount: 1, maxCombo: 9, playTimeMs: 24000 }

const DEMO_PRESETS = {
  wrong: { step: 'gameover', state: { ...DEMO_STATE, score: 890, wrongCount: 3, playTimeMs: 15000 } },
  noanswer: { step: 'gameover', state: { ...DEMO_STATE, score: 890, wrongCount: 1, playTimeMs: 8000 } },
  timeup: { step: 'gameover', state: { ...DEMO_STATE, wrongCount: 1, playTimeMs: 30000 } },
  nickname: { step: 'nickname', state: DEMO_STATE },
  reveal: { step: 'reveal', state: DEMO_STATE, submitted: { rank: 3 } },
}

export default function ResultPage() {
  const navigate = useNavigate()
  const { state: routeState, search } = useLocation()
  const { scale } = useKioskScale()

  const demo = DEMO_PRESETS[new URLSearchParams(search).get('demo')] ?? null
  const state = demo ? demo.state : routeState

  const [step, setStep] = useState(demo ? demo.step : 'gameover') // 'gameover' | 'nickname' | 'reveal'
  const [nickname, setNickname] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(demo?.submitted ?? null)

  // 게임을 거치지 않고 직접 들어온 경우 (미리보기 모드 제외)
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
            correctCount={state.correctCount}
            wrongCount={state.wrongCount}
            maxCombo={state.maxCombo}
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
