// 👤 담당: 최복순
// 할 일: 시작 화면, 게임 설명, 예시 문제 보여주기, 닉네임 입력
import { useNavigate } from 'react-router-dom'
import Button from '../../design/components/Button.jsx'
import ExampleQuestion from './ExampleQuestion.jsx'
import { GUIDE_TEXT } from './guideText.js'
import './Onboarding.css'

export default function OnboardingPage() {
  const navigate = useNavigate()

  return (
    <div className="onboarding">
      <h1 className="onboarding__title">{GUIDE_TEXT.title}</h1>
      <p className="onboarding__desc">{GUIDE_TEXT.description}</p>

      <ExampleQuestion />

      <div className="onboarding__actions">
        <Button onClick={() => navigate('/game')}>게임 시작</Button>
        <Button variant="ghost" onClick={() => navigate('/ranking')}>
          랭킹 보기
        </Button>
      </div>
    </div>
  )
}
