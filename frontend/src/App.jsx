// ⚠️ [공용] 라우팅 파일. 화면을 추가할 때만 건드리고, PR 제목에 [shared] 붙이세요.
import { Routes, Route } from 'react-router-dom'
import OnboardingPage from './features/onboarding/OnboardingPage.jsx'
import GamePage from './features/game/GamePage.jsx'
import ResultPage from './features/result/ResultPage.jsx'
import RankingPage from './features/ranking/RankingPage.jsx'

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/ranking" element={<RankingPage />} />
      </Routes>
    </div>
  )
}
