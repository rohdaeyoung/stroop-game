// 👤 담당: 최복순 — 안내 문구는 전부 여기 모아둡니다.
export const GUIDE_TEXT = {
  // 시작 화면
  brand: 'LIKELION SKU',
  title: '어흥! 색에 속지 마',
  tagline: '"단어냐 색이냐, 헷갈리면 지는 거예요!"',
  startCta: '화면을 터치해서 시작하기',
  meta: '소요시간 20~30초 · 1인 참여',
  eventNote: '2026 성결대학교 동아리 페스티벌 · [멋쟁이 사자처럼] 부스',

  // 모드 설명 화면
  modeIntroTitle: '두 가지 모드가 무작위로 섞여 나와요!',
  modeIntroDesc: '문제마다 모드 A, 모드 B 중 하나가 랜덤으로 나와요',
  modeALabel: '모드 A',
  modeBLabel: '모드 B',
  modeAQuestion: '글자의 "색"을 고르세요',
  modeBQuestion: '단어의 "뜻"을 고르세요',
  modeIntroCta: '연습 모드 시작하기',

  // 연습 문제 — 플레이 중
  practiceBanner: '연습 문제 플레이 중이에요!',
  practiceTitle: '글자의 "색"을 골라보세요!',
  practiceDesc: "예를 들어 '빨강'이라는 단어가 파란색으로 표시되면, 모드 A 규칙대로 실제 색깔인 파랑을 선택하세요.",
  practiceHint: '아자아자 할 수 있따!',

  // 연습 문제 — 오답
  wrongTitle: '확신의 오답입니다~!',
  wrongDescTemplate: (wordLabel, inkLabel) =>
    `"${wordLabel}"은 ${inkLabel}색으로 쓰여 있었는데, 정답은 ${inkLabel}이었습니다. 본 게임으로 만회 고고링~`,
  wrongAdvanceCta: '본 게임에서 본때를 보여주기',

  // 연습 문제 — 정답
  correctBanner: '이번 문제 모드: 글자의 "색"을 고르세요',
  correctTitle: '어흥이가 인정!! 완벽해요 ^0^',
  correctDesc: '실제 색깔을 정확히 골라냈어요. 이제 진짜 게임을 시작해볼까요?',
  correctAdvanceCta: '여기를 누르면 진짜 게임이 시작돼요!',

  // 카운트다운
  countdownBanner: '곧 시작해요! 글자의 "색"을 고르세요',
  countdownTitle: '준비하세요!',
  countdownDesc: '문제마다 모드가 바뀌니 매번 확인하세요!',

  rankingCta: '랭킹 보기',
}
