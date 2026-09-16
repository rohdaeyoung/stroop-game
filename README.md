# 🐯 어흥! 색에 속지 마

> 눈은 '빨강'을 읽고, 뇌는 파랑을 봐야 한다.

색깔 단어의 **뜻**과 글자의 **색**이 서로 다른 **스트루프 효과(Stroop Effect)** 를 게임으로 만든 프로젝트입니다.
당신의 뇌가 얼마나 쉽게 속는지, 30초 안에 확인해보세요.

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
6. 오답·미응답 합쳐 3회 또는 30초 경과 시 게임 오버 → 랭킹 등록!

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

## 🏃 로컬에서 개발할 때

> 부스 운영에는 필요 없습니다. 아래는 **코드를 고칠 때만** 쓰는 방법입니다.
> 게임을 해보기만 할 거라면 https://stroop-game.onrender.com 를 열면 됩니다.

**터미널 두 개**가 필요합니다. 둘 다 켜둔 채로 두세요.

### ① 백엔드 — DB 설치가 필요 없습니다

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=dev'
```

`dev` 프로필은 **메모리 안에서 도는 H2 데이터베이스**를 씁니다. MySQL 을 따로 설치하지 않아도 바로 실행됩니다.

> ⚠️ 메모리라서 **서버를 끄면 그동안 저장한 랭킹이 사라집니다.** 개발용이라 그렇고, 배포된 서비스는 TiDB 에 저장되므로 지워지지 않습니다.

잘 떴는지 확인:
```bash
curl http://localhost:8080/api/health
```

### ② 프론트

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 http://localhost:5173 (포트가 쓰이고 있으면 5174, 5175...)

### 자주 겪는 문제

**"서버에 문제가 생겼습니다"가 뜬다**
→ 백엔드가 안 켜져 있습니다. ①번 터미널을 확인하세요. 프론트만 켜면 점수 제출이 안 됩니다.

**403 / CORS 오류가 뜬다**
→ 프론트가 5176 이상 포트로 떴을 수 있습니다. `application-dev.yml` 의 `CORS_ORIGIN` 에 해당 포트를 추가하세요.

**진짜 MySQL 로 붙여보고 싶다면**
→ `application-local.yml.example` 을 `application-local.yml` 로 복사해 접속 정보를 채우고, `--args='--spring.profiles.active=local'` 로 실행하세요.

---

## 🌐 배포 완료 — 링크만 열면 됩니다

**2026-09-16 배포 완료.** 부스에서는 아래 주소만 열면 게임이 돌아갑니다. 로컬에서 서버를 켤 필요가 없습니다.

| | 주소 |
|---|---|
| 🎮 **게임 (부스에서 여는 주소)** | **https://stroop-game.onrender.com** |
| 서버 API | https://stroop-api.onrender.com |

```
 아이패드 브라우저
      │  https://stroop-game.onrender.com
      ▼
 Render Static Site (stroop-game)      프론트 · CDN · 항상 즉시 응답
      │  https://stroop-api.onrender.com/api
      ▼
 Render Web Service (stroop-api)       Spring Boot · Docker · 싱가포르
      │  MySQL 프로토콜 + TLS
      ▼
 TiDB Cloud Serverless (stroop)        랭킹 기록 저장 · 싱가포르
```

---

## 🔌 "DB 서버를 켠다"는 작업은 없습니다

자주 오해하는 부분이라 정리합니다.

**TiDB Cloud 와 Render 는 24시간 켜져 있습니다.** 누가 켜고 끄는 것이 아닙니다.

| | 상태 |
|---|---|
| TiDB Cloud (DB) | **항상 켜져 있음.** 끄는 기능 자체가 없습니다 |
| Render 프론트 | **항상 켜져 있음.** 정적 파일이라 잠들지 않습니다 |
| Render 백엔드 | **15분간 아무도 안 쓰면 잠듭니다** ← 유일하게 신경 쓸 부분 |

### 백엔드가 잠들면 어떻게 되나

무료 플랜이라 15분 동안 요청이 없으면 백엔드가 절전에 들어갑니다. 그 뒤 첫 요청은 **1~2분** 걸립니다.

> 실제로 재보니 **114초** 걸렸습니다 (2026-09-16 측정). Render 안내는 50초 이상이라고만 되어 있는데, 그보다 오래 걸릴 수 있습니다.

- 게임 화면은 **바로 뜹니다** (프론트는 안 잠듦)
- 점수 제출이나 랭킹 조회에서만 기다리게 됩니다

### 깨우는 방법 — 누구나 할 수 있습니다

부스 열기 **10분 전에 브라우저로 이 주소를 한 번 열기만** 하면 됩니다. 화면이 하얗게 멈춰 있어도 **2분까지는 기다려주세요.** 깨어나는 중입니다.

```
https://stroop-api.onrender.com/api/health
```

화면에 `{"status":"UP"}` 같은 응답이 뜨면 깨어난 것입니다. 처음에는 50초쯤 걸리니 기다려주세요.

터미널이 편하면 이것도 같습니다.

```bash
curl https://stroop-api.onrender.com/api/health
```

**사람이 계속 게임을 하는 동안에는 잠들지 않습니다.** 점심시간처럼 한동안 비는 경우에만 다시 깨워주면 됩니다.

> 💡 행사 당일만 Render 백엔드를 Starter 플랜($7/월)으로 올리면 절전 자체가 없어집니다. 하루만 쓰고 내리면 하루치만 청구됩니다. 가장 확실한 방법입니다.

---

## 👥 누가 무엇을 할 수 있나

**결론부터: 부스 운영에 필요한 일은 팀원 누구나 할 수 있습니다.**

| 하는 일 | 누가 | 필요한 것 |
|---|---|---|
| 게임 실행 | **누구나** (팀원 아니어도) | 링크만 |
| 잠든 백엔드 깨우기 | **누구나** | 링크만 |
| 코드 고쳐서 반영하기 | **팀원 전원** | GitHub 계정 |
| DB 기록 조회 · 초기화 | **노대영 · 고은우** | TiDB Cloud 계정 |
| 서버 로그 보기 · 환경변수 변경 | 노대영 | Render 계정 |

고은우(@Gonu19)님은 TiDB Cloud 에 `Organization Member` + `stroop` 인스턴스
`Instance Manager` 로 초대되어 있습니다. 랭킹 조회와 기록 삭제를 할 수 있고,
클러스터 자체를 지울 권한은 없습니다.

### 코드 수정은 이미 전원 가능합니다

`main` 에 머지되면 **Render 가 자동으로 다시 배포합니다.** (`render.yaml` 의 `autoDeploy: true`)

```
브랜치 작업 → PR → 승인 1명 → main 머지 → 2~8분 뒤 자동 반영
```

Render 계정이 없어도 됩니다. **평소 하던 GitHub 작업 그대로 하면 배포까지 이어집니다.**

### 노대영만 할 수 있는 일을 팀원에게 열어주려면

부스 당일 문제가 생겼을 때 다른 사람도 대응할 수 있게 하려면 아래처럼 초대하면 됩니다.

**TiDB Cloud** — 랭킹 기록 조회, 초기화 *(고은우님 초대 완료)*
1. https://tidbcloud.com → `Organization Settings` → `Users` → `Invite`
2. 이메일 입력
3. 권한은 이렇게 줍니다

| 항목 | 값 | 이유 |
|---|---|---|
| Organization Access | `Organization Member` | Owner 는 결제·멤버 관리까지 열려 과합니다 |
| Instance Access | `Instance Manager` + `stroop` | 조회·삭제에 필요한 최소 권한 |

> ⚠️ `Organization Owner` 로 주면 **클러스터를 통째로 지울 수 있습니다.** 랭킹 데이터가 날아가므로 `Member` + `Instance Manager` 조합을 쓰세요.

**Render** — 로그 확인, 환경변수 변경, 수동 재배포
1. https://dashboard.render.com → 좌측 상단 워크스페이스 이름 → `Settings`
2. `Members` → `Invite` → 이메일 입력

> Render 는 아직 `TrashMap` 워크스페이스에 들어 있습니다. 멤버를 초대하면 그 워크스페이스의 다른 서비스도 함께 보입니다. **분리하려면 새 워크스페이스를 만들고 `Transfer Service` 로 옮기면 되는데, 이때 서비스 주소가 바뀔 수 있어 `CORS_ORIGIN` 과 `VITE_API_BASE_URL` 을 다시 잡아야 합니다.** 행사가 끝난 뒤에 하는 편이 안전합니다.

초대는 계정 소유자(노대영)만 보낼 수 있습니다.

---

## 🗄️ 랭킹 기록 관리 (TiDB Cloud)

부스 시작 전에 테스트 기록을 지우거나, 중간에 데이터를 확인할 때 씁니다.

1. https://tidbcloud.com 접속 → `stroop` 클러스터 선택
2. 왼쪽 `SQL Editor` 클릭
3. 아래 SQL 을 실행

**기록 확인**
```sql
SELECT id, nickname, score, max_combo, created_at
FROM stroop.score
ORDER BY score DESC, created_at ASC
LIMIT 20;
```

**몇 명이 참여했는지**
```sql
SELECT COUNT(*) AS 참여수, MAX(score) AS 최고점 FROM stroop.score;
```

**⚠️ 전체 기록 삭제 (부스 시작 전에만)**
```sql
DELETE FROM stroop.score;
```

> `DELETE` 는 되돌릴 수 없습니다. 부스가 끝난 뒤 기록을 남기고 싶다면 먼저 위의 조회 결과를 복사해두세요.

---

## 🧯 부스에서 문제가 생기면

| 증상 | 원인 | 대처 |
|---|---|---|
| 점수 제출이 1~2분 걸림 | 백엔드 절전 | 정상입니다. 한 번 깨면 그 뒤로는 1초 안에 끝납니다 |
| "서버에 문제가 생겼습니다" | 백엔드 절전 또는 장애 | `/api/health` 를 열어 깨우고 다시 시도 |
| 랭킹이 비어 보임 | 아직 기록이 없음 | 정상 |
| 카메라가 안 켜짐 | 브라우저 권한 거부 | 주소창 옆 자물쇠 → 카메라 허용 |
| QR 을 찍어도 사진이 안 열림 | 5분이 지나 만료됨 | 정상입니다. 다시 촬영하면 됩니다 |
| 화면이 전혀 안 뜸 | Render 장애 | https://status.render.com 확인 |

**백엔드가 살아있는지 확인하는 가장 빠른 방법**

```
https://stroop-api.onrender.com/api/health
```

---

## 📱 아이패드 설정 (부스 준비)

- **Safari 로 게임 주소를 연 뒤 공유 → 홈 화면에 추가** — 주소창 없이 전체화면으로 뜹니다
- **자동 잠금 끄기**: 설정 → 디스플레이 및 밝기 → 자동 잠금 → **안 함**
- **저전력 모드 끄기** (화면이 어두워집니다)
- 인증샷을 쓸 거라면 **카메라 권한을 미리 허용**해두세요
- 화면이 1920×1080 기준이라 아이패드 비율에서는 위아래 여백이 생깁니다 (잘리지는 않습니다)

---

## 📄 문서

- [API 명세](docs/API.md) — FE ↔ BE 계약. **여기 바뀌면 양쪽 다 영향** 받으니 반드시 합의 후 수정.
- [게임 규칙](docs/GAME_RULES.md) — 점수 계산, 난이도 곡선
- [컨벤션](docs/CONVENTIONS.md) — 커밋 메시지, 코드 스타일
