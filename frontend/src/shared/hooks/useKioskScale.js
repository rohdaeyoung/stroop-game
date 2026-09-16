// ⚠️ [공용] 부스 키오스크 화면 비율 맞춤
//
// 원작성: 이혜원 (features/result, features/ranking 에 각각 두었던 것을
// 통합 시점에 game 까지 함께 쓰도록 공용으로 옮겼습니다)
//
// 피그마 디자인은 1920x1080 부스 키오스크 화면 기준입니다.
// 실제 화면 크기가 달라도 디자인이 잘리지 않도록 비율을 유지한 채 화면 안에
// 맞추는 방식(contain)입니다. 실제 키오스크(1920x1080)에서는 꽉 차 보이고,
// 비율이 다른 화면(아이패드 등)에서는 잘리는 대신 위아래/좌우에 여백이 생깁니다.
import { useEffect, useState } from 'react'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

export function useKioskScale() {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    function updateScale() {
      const next = Math.min(
        window.innerWidth / DESIGN_WIDTH,
        window.innerHeight / DESIGN_HEIGHT,
      )
      setScale(next)
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  return { scale, width: DESIGN_WIDTH, height: DESIGN_HEIGHT }
}
