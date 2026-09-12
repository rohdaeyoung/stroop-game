# AGENTS.md — 어흥! 색에 속지 마

> 이 파일은 사람과 AI 코딩 도구(Claude Code, Cursor, Codex 등) **모두**가 따르는 규칙입니다.
> `CLAUDE.md` 는 `@AGENTS.md` 한 줄만 두면 Claude Code 도 이 파일을 읽습니다.

## 0. 작업 전에 읽는 순서

1. `README.md` — 게임 소개, 역할 분담, 충돌 방지 원칙
2. `docs/GAME_RULES.md` — 점수·난이도·종료 조건 (게임 숫자의 기준)
3. `docs/API.md` — FE ↔ BE 계약
4. `docs/CONVENTIONS.md` — 커밋 메시지, 파일 이름, CSS 규칙
5. 내게 할당된 이슈

## 1. 절대 규칙

1. **공용 파일은 임의로 고치지 않습니다.**
   아래 파일을 바꿔야 할 것 같으면 **코드를 짜지 말고 멈춰서 "이 파일을 바꿔야 합니다: <이유>" 라고 사람에게 보고**합니다.
   - `docs/API.md`, `docs/GAME_RULES.md`
   - `frontend/src/shared/**`, `frontend/src/App.jsx`, `frontend/src/main.jsx`
   - `.github/**`, `backend/build.gradle`, `frontend/package.json`

   변경이 정말 필요하면 사람이 PR 제목에 `[shared]` 를 붙이고 팀에 공유합니다.

2. **내 파트 폴더 밖은 수정하지 않습니다.** (아래 소유권 표)
   다른 폴더를 고쳐야 하면 코드에 TODO 를 남기지 말고 **이슈나 PR 코멘트로 담당자에게 요청**합니다.

3. **게임 숫자를 코드에 흩어 쓰지 않습니다.**
   제한시간, 점수 공식, 콤보 배수, 난이도 구간은 `docs/GAME_RULES.md` 가 기준입니다.
   FE 는 `features/game/difficulty.js`, `features/game/scoreCalculator.js` 에 모으고,
   BE 는 검증 상수를 한곳에 모읍니다. 문서를 바꾸면 양쪽 코드를 **같은 PR** 에서 바꿉니다.

4. **의존성을 추가하면 PR 에 이유를 씁니다.** `package.json`, `build.gradle` 변경은 팀 확인이 필요합니다.

5. **비밀값은 커밋하지 않습니다.** DB 비밀번호는 `backend/src/main/resources/application-local.yml`
   (gitignore 대상) 과 배포 플랫폼 환경변수에만 둡니다.

6. **`main` 에 직접 push 하지 않습니다.** 브랜치 → PR → 리뷰 1명 승인 → 머지.

## 2. 소유권 — 경계는 폴더, 안쪽은 자유

이 표가 정하는 것은 **폴더 경계와 계약뿐**입니다.
자기 폴더 안에서 파일을 어떻게 쪼개든, 컴포넌트·훅을 어떻게 나누든, 상태 관리와 CSS 를 어떤 방식으로 하든
**담당자가 정합니다.** 남의 폴더를 건드리지 않고 계약만 지키면 됩니다.

| 경로 | 담당 |
|---|---|
| `frontend/src/design/**` | 나연 (디자인) |
| `frontend/src/features/onboarding/**` | 최복순 (온보딩) |
| `frontend/src/features/game/**` | 김민서 (게임 엔진) |
| `frontend/src/features/result/**`, `features/ranking/**` | 이혜원 (결과·랭킹) |
| `backend/src/main/java/com/stroop/domain/**`, `backend/src/main/resources/**` | 노대영 (DB·도메인) |
| `backend/src/main/java/com/stroop/api/**`, `com/stroop/global/**` | 고은우 (서버) |
| `docs/DEPLOY.md`, 배포 설정 | 노대영 (배포) |
| `docs/API.md`, `frontend/src/shared/**`, `App.jsx`, `main.jsx` | **공용 — 팀 합의** |

## 3. 명령어

```bash
# frontend
cd frontend
npm install
npm run dev      # http://localhost:5173, /api 는 localhost:8080 으로 프록시

# backend  (Windows 는 gradlew.bat)
cd backend
./gradlew bootRun
./gradlew test
```

백엔드를 실행하려면 `backend/src/main/resources/application-local.yml` 이 필요합니다.
`application-local.yml.example` 을 복사해서 본인 MySQL 정보로 채우세요.

## 4. 이슈 · 브랜치 · 커밋 · PR

**1 이슈 = 1 브랜치 = 1 PR** 을 지킵니다.

```
이슈 #13  →  브랜치 fix/server/error-handling  →  PR  →  머지
```

- 브랜치: `<타입>/<파트>/<기능>` (예: `feat/game/timer`, `fix/ranking/sort-order`)
  - 파트: `design` `onboarding` `game` `result` `ranking` `domain` `server`
- 커밋: `<타입>(<파트>): <한글로 뭘 했는지>` — `docs/CONVENTIONS.md` 참고
  - 커밋 본문 마지막에 `관련: #13` 을 적으면 이슈 타임라인에 자동으로 붙습니다
- PR 본문에 `Closes #13` — 머지되면 이슈가 자동으로 닫힙니다
- 작업 시작 전에 항상 `git checkout main && git pull origin main`

커밋은 **되돌릴 수 있는 단위**로 나눕니다. 줄 수가 기준이 아닙니다.
(예: 기능 코드 커밋 1개 + 문서 수정 커밋 1개)

## 5. 완료 기준

- [ ] 로컬에서 실행해봤고 에러가 없다 (FE: `npm run dev`, BE: `./gradlew test`)
- [ ] 내 파트 폴더 밖을 건드리지 않았다 (건드렸다면 PR 에 이유를 썼다)
- [ ] 게임 숫자를 바꿨다면 `docs/GAME_RULES.md` 도 같은 PR 에서 바꿨다
- [ ] `console.log`, 주석 처리된 코드가 남아 있지 않다
- [ ] 화면 작업이면 PR 에 스크린샷을 붙였다
