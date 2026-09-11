# 🐯 어흥! 색에 속지 마

> 눈은 '빨강'을 읽고, 뇌는 파랑을 봐야 한다.

색깔 단어의 **뜻**과 글자의 **색**이 서로 다른 **스트루프 효과(Stroop Effect)** 를 게임으로 만든 프로젝트입니다.
당신의 뇌가 얼마나 쉽게 속는지, 60초 안에 확인해보세요.

```
        "빨강"  ← 이 글자는 파란색입니다.
                  글자의 '색'을 고르라면? 정답은 파랑.
                  근데 손가락은 자꾸 '빨강'으로 갑니다. 그게 스트루프 효과입니다.
```

**한 줄 소개** — 속도, 콤보, 점점 짧아지는 제한시간. 색에 속지 않고 몇 점까지 갈 수 있나요?

---

## 🎮 어떻게 하는 게임인가요?

1. 화면에 색깔 단어가 뜹니다. **단어의 뜻과 글자색은 항상 다릅니다.**
2. 위에 뜬 질문을 잘 보세요 — `글자의 색을 고르세요` 일 때도, `단어의 뜻을 고르세요` 일 때도 있습니다.
3. 제한시간 안에 정답을 터치합니다.
4. 연속으로 맞추면 **콤보 보너스**, 빨리 누르면 **속도 보너스**.
5. 진행할수록 **제한시간은 짧아지고 선택지는 늘어납니다.**
6. 오답 3회 또는 60초 경과 시 게임 오버 → 랭킹 등록!

---

## 👥 역할 분담

### Frontend (React + JavaScript + Vite + CSS)

| 담당자 | 파트 | 작업 폴더 (여기만 건드리세요) |
|---|---|---|
| **나연** | 디자인 시스템 (색/타이포/공용 컴포넌트) | `frontend/src/design/**` |
| **최복순** | 시작·온보딩 화면, 예시 문제, 안내 문구 | `frontend/src/features/onboarding/**` |
| **김민서** | 게임 플레이 엔진 (스트루프 로직, 터치 판정, 타이머, 콤보·난이도 가속) | `frontend/src/features/game/**` |
| **이혜원** | 결과 화면(점수/성공·실패), 랭킹 화면 | `frontend/src/features/result/**`, `frontend/src/features/ranking/**` |

### Backend (Spring Boot + JPA + MySQL)

| 담당자 | 파트 | 작업 폴더 |
|---|---|---|
| **노대영** | DB 설계, 도메인 (Entity / Repository) | `backend/src/main/java/com/stroop/domain/**`, `backend/src/main/resources/**` |
| **고은우** | 서버 (Controller / Service / DTO / 예외처리) | `backend/src/main/java/com/stroop/api/**`, `backend/src/main/java/com/stroop/global/**` |

---

## 🚧 충돌 방지 3원칙

1. **내 폴더만 수정한다.** 남의 폴더 파일을 고쳐야 하면 → 직접 고치지 말고 그 사람에게 요청(이슈/댓글).
2. **공용 구역(`frontend/src/shared/**`, `App.jsx`, `main.jsx`, `docs/API.md`)은 반드시 팀 합의 후 수정.** PR 제목에 `[shared]` 붙이기.
3. **`main`에 직접 push 금지.** 무조건 브랜치 → PR → 리뷰 1명 승인 → merge.

> 왜? 같은 파일을 두 명이 동시에 고치면 merge conflict가 납니다. 폴더를 아예 나눠두면 conflict가 구조적으로 발생하지 않습니다.

---

## 🌿 브랜치 규칙

```
feat/<파트>/<기능>     예: feat/game/timer, feat/onboarding/tutorial
fix/<파트>/<내용>      예: fix/ranking/sort-order
```

파트 이름: `design` `onboarding` `game` `result` `ranking` `domain` `server`

---

## 🔄 작업 흐름 (매번 이 순서대로)

```bash
git checkout main
git pull origin main          # 1. 최신 main 받아오기 (제일 중요!)
git checkout -b feat/game/timer

# ... 작업 ...

git add .
git commit -m "feat(game): 타이머 카운트다운 구현"
git push -u origin feat/game/timer
# 2. GitHub에서 PR 생성 → 리뷰 요청 → 승인받고 merge
```

**작업 시작 전 `git pull origin main`을 습관화하세요.** 이거 안 하면 나중에 충돌 폭탄 맞습니다.

---

## 🏃 실행 방법

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
./gradlew bootRun
```
MySQL이 먼저 떠 있어야 합니다. `backend/src/main/resources/application-local.yml` 참고.

---

## 📄 문서

- [API 명세](docs/API.md) — FE ↔ BE 계약. **여기 바뀌면 양쪽 다 영향** 받으니 반드시 합의 후 수정.
- [게임 규칙](docs/GAME_RULES.md) — 점수 계산, 난이도 곡선
- [컨벤션](docs/CONVENTIONS.md) — 커밋 메시지, 코드 스타일
