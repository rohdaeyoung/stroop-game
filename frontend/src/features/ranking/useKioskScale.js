// 👤 담당: 이혜원
// 피그마 디자인은 1920x1080 부스 키오스크 화면 기준입니다.
// 실제 화면(키오스크 모니터든, 테스트용 아이패드/노트북이든) 비율이 달라도
// 화면을 항상 꽉 채우도록(cover) 스케일합니다 — 비율이 다르면 위아래/좌우가
// 화면 밖으로 살짝 잘릴 수 있지만, 실제 키오스크(1920x1080)에서는 자르는 부분 없이
// 지금과 동일하게 꽉 찹니다.
// (features/result/useKioskScale.js 와 동일 — 폴더별로 독립적으로 유지합니다.)
import { useEffect, useState } from 'react'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

export function useKioskScale() {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    function updateScale() {
      const next = Math.max(
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
