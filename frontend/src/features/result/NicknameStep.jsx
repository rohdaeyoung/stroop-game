// 👤 담당: 이혜원
// 06_닉네임 입력 (Nickname) — docs/GAME_RULES.md 의 닉네임 정규식과 동일하게 검증
import { useState } from 'react'

// docs/GAME_RULES.md "닉네임 문자 규칙" / backend ScoreRules.NICKNAME_PATTERN 과 동일
const NICKNAME_PATTERN = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]{1,10}$/

export default function NicknameStep({ submitting, error, onSubmit }) {
  const [nickname, setNickname] = useState('')
  const [touched, setTouched] = useState(false)

  const isValid = NICKNAME_PATTERN.test(nickname)
  const showFormatError = touched && nickname.length > 0 && !isValid

  function handleConfirm() {
    setTouched(true)
    if (!isValid || submitting) return
    onSubmit(nickname)
  }

  return (
    <div className="result__screen result__screen--nickname">
      <h1 className="result__nickname-title">게임에서 사용할 닉네임을 입력해주세요</h1>
      <p className="result__nickname-subtitle">랭킹에 표시될 이름이에요. 신중하게 골라보세요!</p>

      <div
        className={`result__nickname-field${showFormatError ? ' result__nickname-field--error' : ''}`}
      >
        <input
          className="result__nickname-input"
          value={nickname}
          maxLength={10}
          placeholder="닉네임"
          disabled={submitting}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm()
          }}
        />
        <span className="result__nickname-count">{nickname.length} / 10</span>
      </div>

      <p className="result__nickname-hint">한글·영문·숫자 1~10자 (특수문자 제외)</p>
      {showFormatError && (
        <p className="result__nickname-error">닉네임은 한글·영문·숫자 1~10자로 입력해 주세요.</p>
      )}
      {error && <p className="result__nickname-error">{error}</p>}

      <button
        type="button"
        className="result__cta result__cta--nickname"
        disabled={submitting}
        onClick={handleConfirm}
      >
        {submitting ? '서버를 깨우는 중...' : '확인'}
      </button>
      {submitting && (
        <p className="result__nickname-pending">서버를 깨우는 중이에요... (최대 1분)</p>
      )}
    </div>
  )
}
