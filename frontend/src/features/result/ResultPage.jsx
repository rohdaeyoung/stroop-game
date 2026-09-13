// 👤 담당: 이혜원
// 할 일: 게임 종료 후 점수 보여주기, 닉네임 받아서 서버에 제출, 내 순위 표시
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../design/components/Button.jsx'
import Card from '../../design/components/Card.jsx'
import { api, getApiErrorMessage } from '../../shared/api/client.js'
import './Result.css'

export default function ResultPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [nickname, setNickname] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // 게임을 거치지 않고 직접 들어온 경우
  if (!state) {
    return (
      <div className="result">
        <p>게임 기록이 없습니다.</p>
        <Button onClick={() => navigate('/')}>처음으로</Button>
      </div>
    )
  }

  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    try {
      const res = await api.submitScore({ nickname, ...state })
      setSubmitted(res)
    } catch (e) {
      setError(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="result">
      <h2 className="result__title">게임 종료!</h2>

      <Card>
        <div className="result__score">{state.score}점</div>
        <dl className="result__stats">
          <div><dt>최고 콤보</dt><dd>{state.maxCombo}</dd></div>
          <div><dt>정답</dt><dd>{state.correctCount}개</dd></div>
          <div><dt>오답</dt><dd>{state.wrongCount}개</dd></div>
        </dl>
      </Card>

      {submitted ? (
        <p className="result__rank">
          전체 <b>{submitted.rank}위</b>
          {submitted.isNewRecord && ' 🎉 신기록!'}
        </p>
      ) : (
        <div className="result__submit">
          <input
            className="result__input"
            placeholder="닉네임 (1~10자)"
            maxLength={10}
            value={nickname}
            disabled={submitting}
            onChange={(e) => setNickname(e.target.value)}
          />
          <Button
            onClick={handleSubmit}
            disabled={nickname.trim().length === 0 || submitting}
          >
            {submitting ? '서버를 깨우는 중...' : '랭킹 등록'}
          </Button>
          {submitting && (
            <p className="result__pending">서버를 깨우는 중이에요... (최대 1분)</p>
          )}
          {error && <p className="result__error">{getApiErrorMessage(error)}</p>}
        </div>
      )}

      <Button variant="ghost" onClick={() => navigate('/ranking')}>랭킹 보기</Button>
      <Button variant="ghost" onClick={() => navigate('/game')}>다시 하기</Button>
    </div>
  )
}
