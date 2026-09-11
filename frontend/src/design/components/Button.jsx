// 👤 담당: 나연
// 모든 화면에서 쓰는 공용 버튼. 다른 팀원은 import만 하세요.
import './Button.css'

export default function Button({ children, variant = 'primary', onClick, disabled }) {
  return (
    <button
      className={`ds-button ds-button--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
