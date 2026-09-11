// ⚠️ [공용] 게임 색상 정의. 민서님(엔진)과 나연님(디자인)이 함께 쓰는 파일입니다.
export const STROOP_COLORS = [
  { key: 'red',    label: '빨강', css: 'var(--stroop-red)' },
  { key: 'blue',   label: '파랑', css: 'var(--stroop-blue)' },
  { key: 'green',  label: '초록', css: 'var(--stroop-green)' },
  { key: 'yellow', label: '노랑', css: 'var(--stroop-yellow)' },
  { key: 'purple', label: '보라', css: 'var(--stroop-purple)' },
]

// 질문 모드
export const MODE = {
  COLOR: 'COLOR', // "글자의 색을 고르세요"
  WORD: 'WORD',   // "단어의 뜻을 고르세요"
}
