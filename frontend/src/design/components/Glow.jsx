// 👤 담당: 나연
// 화면 네 귀퉁이를 떠다니는 배경 글로우 이펙트. 온보딩 대기화면 연출을
// 다른 화면(게임 진행 화면 등)에서도 쓸 수 있도록 재사용 컴포넌트로 분리했습니다.
// 부모가 position:relative(또는 fixed) + overflow:hidden 컨테이너를 잡아주면
// 그 안을 꽉 채우는 절대배치 레이어로 렌더링됩니다.
import './Glow.css'

const DEFAULT_COLORS = ['#2ec770', '#3b7afa', '#ff4759', '#ffc93d']

export default function Glow({ colors = DEFAULT_COLORS }) {
  return (
    <div className="ds-glow" aria-hidden="true">
      {colors.slice(0, 4).map((color, i) => (
        <span
          key={i}
          className={`ds-glow__blob ds-glow__blob--${i + 1}`}
          style={{ '--glow-color': color }}
        />
      ))}
    </div>
  )
}
