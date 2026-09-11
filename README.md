# 🎨 Stroop Game

색깔 단어와 글자색이 다른 **스트루프 테스트**를 게임화한 프로젝트.

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
