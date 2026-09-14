// 👤 담당: 최복순
// 할 일: 닉네임 입력 받기 (1~10자, 특수문자 제외)
import { useState } from 'react'
import Button from '../../design/components/Button.jsx'
import { GUIDE_TEXT } from './guideText.js'
import { NICKNAME_PATTERN } from './nicknameStorage.js'

export default function NicknameInput({ onConfirm }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleChange(event) {
    setValue(event.target.value.slice(0, 10))
    if (error) setError('')
  }

  function handleSubmit() {
    const nickname = value.trim()
    if (!nickname) {
      setError(GUIDE_TEXT.nicknameErrorEmpty)
      return
    }
    if (!NICKNAME_PATTERN.test(nickname)) {
      setError(GUIDE_TEXT.nicknameErrorInvalid)
      return
    }
    onConfirm(nickname)
  }

  return (
    <div className="onboarding__nickname">
      <h1 className="onboarding__title">{GUIDE_TEXT.nicknameTitle}</h1>
      <p className="onboarding__desc">{GUIDE_TEXT.nicknameDesc}</p>

      <div className={`onboarding__nickname-field${error ? ' onboarding__nickname-field--error' : ''}`}>
        <input
          className="onboarding__nickname-input"
          value={value}
          onChange={handleChange}
          placeholder={GUIDE_TEXT.nicknamePlaceholder}
          maxLength={10}
          autoFocus
          onKeyDown={(event) => event.key === 'Enter' && handleSubmit()}
        />
        <span className="onboarding__nickname-count">{value.length} / 10</span>
      </div>

      <p className="onboarding__nickname-hint">{error || GUIDE_TEXT.nicknameHint}</p>

      <Button onClick={handleSubmit}>{GUIDE_TEXT.nicknameConfirm}</Button>
    </div>
  )
}
