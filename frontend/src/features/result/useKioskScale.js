// 👤 담당: 이혜원
// 피그마 디자인은 1920x1080 부스 키오스크 화면 기준입니다.
// 실제 화면 크기가 달라도 비율을 유지한 채 꽉 차게 보여주기 위한 스케일 훅입니다.
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
