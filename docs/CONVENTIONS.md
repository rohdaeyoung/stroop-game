# 컨벤션

## 커밋 메시지
```
<타입>(<파트>): <한글로 뭘 했는지>

예)
feat(game): 콤보 보너스 점수 계산 추가
fix(ranking): 동점일 때 정렬 순서 깨지는 문제 수정
style(design): 버튼 hover 색상 토큰으로 교체
docs(api): 점수 제출 응답에 rank 필드 추가
```

타입: `feat` `fix` `style` `refactor` `docs` `chore`

## 파일 이름
- FE 컴포넌트: `PascalCase.jsx` (예: `GameBoard.jsx`)
- FE CSS: 컴포넌트와 같은 이름 `GameBoard.css`
- FE 일반 함수 파일: `camelCase.js` (예: `scoreCalculator.js`)
- BE 클래스: `PascalCase.java`

## CSS 규칙
- 색/폰트/간격은 **직접 값 쓰지 말고** `design/tokens/tokens.css`의 CSS 변수 사용
  - ❌ `color: #FF3B30;`
  - ✅ `color: var(--color-danger);`
- 클래스 이름은 `기능명-요소` 형태로: `.game-board`, `.game-board__timer`
  → 다른 사람 CSS와 충돌 안 나게 **자기 파트 접두사**를 꼭 붙이세요.
