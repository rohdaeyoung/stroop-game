// 👤 담당: 최복순
// 온보딩에서 입력받은 닉네임을 다음 화면(게임/결과)에서도 쓸 수 있게 저장합니다.
// 서버에는 결과 화면에서 제출합니다 (docs/API.md 의 POST /api/scores).
const STORAGE_KEY = 'stroop.nickname'

export function saveNickname(nickname) {
  sessionStorage.setItem(STORAGE_KEY, nickname)
}

export function loadNickname() {
  return sessionStorage.getItem(STORAGE_KEY) ?? ''
}

export const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]{1,10}$/
