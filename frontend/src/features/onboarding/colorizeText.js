// 👤 담당: 최복순 — 타이틀을 스트루프 게임처럼 알록달록하게 보여주는 헬퍼
// Figma Dev Mode 실측 색상입니다 (2026-09-16, fileKey Xo6T5hGaYMFlSXiLDzv8je).

// 01_대기화면 타이틀 ("어흥! 색에 속지 마") — 공백을 건너뛰고 글자 단위로 4색 순환
const TITLE_CYCLE = ['#ff4759', '#ffc93d', '#3b7afa', '#2ec770']

export function colorizeChars(text) {
  let colorIndex = 0
  return [...text].map((char) => {
    if (char === ' ') return { char, color: null }
    const color = TITLE_CYCLE[colorIndex % TITLE_CYCLE.length]
    colorIndex += 1
    return { char, color }
  })
}

// 03c_연습문제(정답) 타이틀 색상 — 규칙적인 순환이 아니라 피그마에서 낱개로 지정된
// 값이라 그대로 하드코딩했습니다. guideText.js 의 correctTitle 과 같은 문장이어야 합니다.
export const CORRECT_TITLE_SPANS = [
  { text: '어', color: '#ff4759' },
  { text: '흥', color: '#ff8c33' },
  { text: '이', color: '#ffc93d' },
  { text: '가', color: '#ff8c33' },
  { text: ' ', color: null },
  { text: '인', color: '#2ec770' },
  { text: '정', color: '#3b7afa' },
  { text: '!', color: '#9e5cf5' },
  { text: '!', color: '#ff4759' },
  { text: ' ', color: null },
  { text: '완', color: '#ff8c33' },
  { text: '벽', color: '#ffc93d' },
  { text: '해', color: '#2ec770' },
  { text: '요 ^0^', color: '#3b7afa' },
]
