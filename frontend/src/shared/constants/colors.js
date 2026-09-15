// ⚠️ [공용] 게임 색상 정의. 민서님(엔진)과 나연님(디자인)이 함께 쓰는 파일입니다.
// Figma 확정 시안 기준 4색입니다. 색을 늘리거나 줄이면 difficulty.js 의
// choiceCount 상한도 함께 맞춰야 합니다.
export const STROOP_COLORS = [
  { key: 'red',    label: '빨강', css: 'var(--stroop-red)' },
  { key: 'blue',   label: '파랑', css: 'var(--stroop-blue)' },
  { key: 'yellow', label: '노랑', css: 'var(--stroop-yellow)' },
  { key: 'green',  label: '초록', css: 'var(--stroop-green)' },
]

// 질문 모드
export const MODE = {
  COLOR: 'COLOR', // "글자의 색을 고르세요"
  WORD: 'WORD',   // "단어의 뜻을 고르세요"
}
