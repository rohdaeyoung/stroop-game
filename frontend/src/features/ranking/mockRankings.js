// 👤 담당: 이혜원
// 디자인 미리보기 전용 더미 데이터 — 백엔드에 실제 제출 기록이 없어도
// /ranking?demo=in 또는 /ranking?demo=out 으로 들어오면 이 데이터로 화면을 채워서 보여줍니다.
// (실제 서비스 동작에는 전혀 관여하지 않음 — 이 쿼리스트링을 직접 붙이지 않는 한 항상 실제 API를 씁니다.)

export const MOCK_TOP10_WITH_ME = [
  { rank: 1, nickname: '컬러킹', score: 3120 },
  { rank: 2, nickname: '무지개소녀', score: 2890 },
  { rank: 3, nickname: '타이거짱 (나)', score: 2480 },
  { rank: 4, nickname: '속지마요', score: 2110 },
  { rank: 5, nickname: '빠른손', score: 1940 },
  { rank: 6, nickname: '눈치백단', score: 1780 },
  { rank: 7, nickname: '색깔요정', score: 1620 },
  { rank: 8, nickname: '정신줄건강', score: 1450 },
  { rank: 9, nickname: '색약아님', score: 1290 },
  { rank: 10, nickname: '그냥해봄', score: 1050 },
]

export const MOCK_TOP10_WITHOUT_ME = [
  { rank: 1, nickname: '컬러킹', score: 3120 },
  { rank: 2, nickname: '무지개소녀', score: 2890 },
  { rank: 3, nickname: '컬러의신', score: 2480 },
  { rank: 4, nickname: '속지마요', score: 2110 },
  { rank: 5, nickname: '빠른손', score: 1940 },
  { rank: 6, nickname: '눈치백단', score: 1780 },
  { rank: 7, nickname: '색깔요정', score: 1620 },
  { rank: 8, nickname: '정신줄건강', score: 1450 },
  { rank: 9, nickname: '색약아님', score: 1290 },
  { rank: 10, nickname: '그냥해봄', score: 1050 },
]

export const MOCK_MY_PINNED = { rank: 47, nickname: '타이거짱 (나)', score: 320 }
