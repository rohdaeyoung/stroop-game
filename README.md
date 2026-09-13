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

## 🚀 배포 계획 (Render + TiDB Cloud)

> ⚠️ **아직 배포 전입니다.** 프론트·백엔드 개발이 끝나면 아래 구조로 합칩니다.
> 담당: 노대영 · 고은우 / 지금은 각자 로컬 개발에 집중하세요.

### 구조

```
 [ 사용자 브라우저 ]
         │
         ▼
 ┌─────────────────────┐
 │  Render Static Site │   frontend/  (Vite 빌드 결과물)
 │  어흥-색에-속지-마     │
 └──────────┬──────────┘
            │  /api/* 호출
            ▼
 ┌─────────────────────┐
 │  Render Web Service │   backend/  (Spring Boot, Docker 또는 Gradle)
 │  stroop-api         │
 └──────────┬──────────┘
            │  MySQL 프로토콜 + TLS
            ▼
 ┌─────────────────────┐
 │   TiDB Cloud        │   MySQL 호환 서버리스 DB
 │   Serverless        │
 └─────────────────────┘
```

| 레이어 | 서비스 | 비고 |
|---|---|---|
| Frontend | Render **Static Site** | Vite 빌드 → 정적 호스팅. 무료 플랜에 콜드 스타트 없음 |
| Backend | Render **Web Service** | Spring Boot. 무료 플랜은 **콜드 스타트 있음** (아래 주의사항) |
| Database | **TiDB Cloud Serverless** | MySQL 8.0 호환. 무료 티어 제공 |

---

### 🔴 반드시 알아야 할 주의사항

#### 1. Render 무료 플랜 콜드 스타트 (제일 중요)

15분간 요청이 없으면 서버가 잠듭니다. 다음 요청은 **30~50초** 걸립니다.

랭킹 화면에서 이게 그대로 터집니다:

- ❌ 사용자 입장: "랭킹이 안 뜨네? 고장났나?" → 이탈
- ❌ fetch 타임아웃이 짧으면 **에러로 오인** → "서버 오류" 문구 노출

**대응 (이혜원 · 고은우 확인 필요)**
- [x] 랭킹/결과 화면 로딩 문구를 정직하게: `"서버를 깨우는 중이에요... (최대 1분)"`
- [x] fetch 타임아웃을 **60초 이상**으로 (짧으면 멀쩡한 응답을 실패로 처리함)
- [x] **연결 실패**와 **진짜 에러**를 구분해서 처리 — 잠든 서버를 "기록 없음"으로 표시하면 안 됨
- [ ] 온보딩 화면 진입 시 백그라운드로 `GET /api/rankings` 한 번 찔러서 미리 깨우기 (워밍업)

> 💡 워밍업 팁: 사용자가 온보딩 화면을 읽고 게임을 1분 플레이하는 동안 서버가 깨어납니다.
> 결과 화면에 도달할 때쯤이면 이미 준비 완료 상태가 됩니다.

#### 2. TiDB Cloud는 MySQL "호환"이지 MySQL이 아님

로컬 MySQL에서 되던 게 TiDB에서 안 될 수 있습니다.

- [ ] **TLS 연결 필수** — JDBC URL에 `useSSL=true&requireSSL=true` 필요
- [ ] **FOREIGN KEY 제약이 제한적** — 지금은 테이블이 `score` 하나라 문제없지만, 나중에 테이블 추가 시 주의
- [ ] **AUTO_INCREMENT가 연속이 아님** — id가 1,2,3이 아니라 튈 수 있음. **id를 순위 계산에 쓰지 말 것** (현재 코드는 `score` 컬럼 기준이라 OK)
- [ ] 배포 전에 **TiDB에 한 번 붙여서 전체 기능 테스트** 필수

#### 3. 환경변수 (절대 코드에 하드코딩 금지)

Render 대시보드의 Environment에 등록합니다.

**Backend (Web Service)**
```
SPRING_PROFILES_ACTIVE = prod
DB_URL      = jdbc:mysql://<TiDB호스트>:4000/stroop?useSSL=true&requireSSL=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
DB_USERNAME = <TiDB 사용자명>
DB_PASSWORD = <TiDB 비밀번호>
CORS_ORIGIN = https://<프론트주소>.onrender.com
```

**Frontend (Static Site)**
```
VITE_API_BASE_URL = https://stroop-api.onrender.com
```

> 로컬 개발용 `application-local.yml` 은 `.gitignore` 처리되어 있습니다. **DB 비밀번호를 커밋하지 마세요.**
> public 레포라서 한 번 올라가면 누구나 볼 수 있습니다.

---

### 배포 전 체크리스트

**공통**
- [ ] `main` 브랜치에 모든 기능이 머지 완료
- [ ] 로컬에서 프론트-백 연동 전체 플로우 테스트 (온보딩 → 게임 → 결과 제출 → 랭킹)

**Backend (고은우 · 노대영)**
- [ ] `application-prod.yml` 작성 (환경변수 주입 방식)
- [ ] `ddl-auto: update` → **`validate`** 로 변경 (운영 DB 스키마 사고 방지)
- [ ] CORS 허용 주소를 배포된 프론트 주소로 변경 (현재 `localhost:5173` 하드코딩)
- [ ] TiDB Cloud에 스키마 생성 (`backend/src/main/resources/schema.sql`)
- [ ] Health check 엔드포인트 추가 (Render가 서버 상태 확인용)

**Frontend (전원)**
- [ ] API 주소를 환경변수로 분리 (현재 `shared/api/client.js` 의 `/api` 프록시는 개발 전용)
- [ ] `npm run build` 성공 확인
- [ ] 모바일 실기기에서 터치 반응 테스트
- [ ] 콜드 스타트 로딩 UI 적용 (위 1번 항목)

---

## 📄 문서

- [API 명세](docs/API.md) — FE ↔ BE 계약. **여기 바뀌면 양쪽 다 영향** 받으니 반드시 합의 후 수정.
- [게임 규칙](docs/GAME_RULES.md) — 점수 계산, 난이도 곡선
- [컨벤션](docs/CONVENTIONS.md) — 커밋 메시지, 코드 스타일
