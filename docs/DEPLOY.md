# 배포 가이드 (Render + TiDB Cloud)

부스에서는 **아이패드로 링크만 열면** 바로 게임이 돌아가야 합니다.
로컬에서 서버를 켜둘 필요가 없도록 아래 순서로 한 번만 배포해두면 됩니다.

```
 [ 아이패드 브라우저 ]
         │  https://stroop-game.onrender.com
         ▼
 ┌─────────────────────┐
 │ Render Static Site  │  stroop-game   (프론트, 빌드된 정적 파일)
 └──────────┬──────────┘
            │  https://stroop-api.onrender.com/api
            ▼
 ┌─────────────────────┐
 │ Render Web Service  │  stroop-api    (Spring Boot, Docker)
 └──────────┬──────────┘
            │  MySQL 프로토콜 + TLS
            ▼
 ┌─────────────────────┐
 │  TiDB Cloud         │  랭킹 기록 저장
 └─────────────────────┘
```

---

## 1. TiDB Cloud — DB 만들기

1. https://tidbcloud.com 가입 (GitHub 계정으로 가능)
2. **Create Cluster → Serverless** 선택 (무료)
3. 리전은 **Singapore** 권장 (한국에서 가장 가까움)
4. 클러스터가 만들어지면 **Connect** 버튼 클릭
5. `Connect With` 를 **General** 로 두고 접속 정보를 복사해둡니다

   - Host: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
   - Port: `4000`
   - User: `xxxxxxx.root`
   - Password: (생성 시 한 번만 보여줍니다 — 꼭 저장)

6. **SQL Editor** 에서 스키마를 만듭니다

   `backend/src/main/resources/db/schema.sql` 의 내용을 붙여넣고 실행하세요.
   (`CREATE DATABASE` 줄은 TiDB 에서 필요 없을 수 있습니다. 실패하면 그 줄만 빼고 실행)

> ⚠️ TiDB 는 `id` 가 1,2,3 으로 연속되지 않습니다. 순위는 점수·등록시각 기준으로만 계산하므로 문제없습니다. (`db/schema.sql` 주석 참고)

---

## 2. Render — 서비스 두 개 만들기

1. https://render.com 가입 (GitHub 계정 연결)
2. **New → Blueprint** 선택
3. `rohdaeyoung/stroop-game` 레포 선택
4. `render.yaml` 을 자동으로 읽어 **stroop-api** 와 **stroop-game** 두 개를 만듭니다
5. 이때 값을 물어보는 항목들을 아래처럼 채웁니다

### stroop-api (백엔드) 환경변수

| 키 | 값 |
|---|---|
| `DB_URL` | `jdbc:mysql://<TiDB호스트>:4000/stroop?useSSL=true&requireSSL=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8` |
| `DB_USERNAME` | TiDB 의 User (예: `1a2b3c4d.root`) |
| `DB_PASSWORD` | TiDB 비밀번호 |
| `CORS_ORIGIN` | 프론트 주소 (예: `https://stroop-game.onrender.com`) — **3번에서 확정** |

### stroop-game (프론트) 환경변수

| 키 | 값 |
|---|---|
| `VITE_API_BASE_URL` | 백엔드 주소 + `/api` (예: `https://stroop-api.onrender.com/api`) |

---

## 3. 서로의 주소를 알려주기

두 서비스는 **만들어진 뒤에야 주소가 정해집니다.** 그래서 순서가 이렇게 됩니다.

1. 배포가 끝나면 Render 대시보드에서 각 서비스의 주소를 확인합니다
2. `stroop-api` 의 `CORS_ORIGIN` 에 **프론트 주소**를 넣습니다
3. `stroop-game` 의 `VITE_API_BASE_URL` 에 **백엔드 주소 + /api** 를 넣습니다
4. 두 서비스를 각각 **Manual Deploy → Deploy latest commit** 으로 다시 배포합니다

> 프론트는 빌드 시점에 환경변수가 박히므로, `VITE_API_BASE_URL` 을 바꾸면 **반드시 다시 배포**해야 합니다.

---

## 4. 확인

```bash
# 백엔드가 살아있는지
curl https://stroop-api.onrender.com/api/health

# 랭킹 조회가 되는지
curl https://stroop-api.onrender.com/api/rankings
```

그다음 아이패드에서 프론트 주소를 열어 **온보딩 → 게임 → 결과 → 랭킹**까지 한 바퀴 돌려봅니다.

---

## ⚠️ 부스 운영 전에 꼭 읽어주세요 — 콜드 스타트

**Render 무료 플랜은 15분 동안 요청이 없으면 백엔드가 잠듭니다.** 다시 깨는 데 **30~50초** 걸립니다.

부스에서 이런 일이 생깁니다.

- 아침에 부스를 열고 첫 참가자가 게임을 끝냈는데 **점수 제출이 30초 넘게 걸림**
- 점심시간처럼 한동안 사람이 없다가 다시 올 때도 마찬가지

### 대응

**대응 1 — 부스 열기 전에 미리 깨우기 (무료)**

운영 시작 10분 전에 브라우저로 한 번 열어두면 됩니다.

```bash
curl https://stroop-api.onrender.com/api/health
```

사람이 계속 오는 동안에는 잠들지 않습니다.

**대응 2 — 유료 플랜 ($7/월)**

Render 백엔드를 Starter 플랜으로 올리면 잠들지 않습니다.
**부스 당일만 쓰고 내리면 하루치만 나갑니다.** 행사 하루짜리라면 이 방법이 가장 확실합니다.

**대응 3 — 주기적으로 깨우기 (자동, 적용됨)**

`.github/workflows/keep-warm.yml` 이 GitHub Actions 스케줄로 10분마다 `/api/health` 를 호출합니다.
UptimeRobot 같은 외부 서비스 가입 없이 저장소 안에서 바로 동작합니다.

> ⚠️ **한 달 내내 켜두면 Render 무료 플랜의 월 750시간 한도를 거의 다 씁니다**
> (24시간 × 31일 ≈ 744시간). 평소엔 참가자가 없어 자연스럽게 잠들며 아끼던 시간을
> 계속 깨어있게 만들어서 다 써버리는 것이므로, **행사 끝나면 워크플로우를 끄거나
> 지우세요** — GitHub 저장소의 Actions 탭에서 이 워크플로우를 Disable 하면 됩니다.

> 프론트(Static Site)는 콜드 스타트가 없습니다. **잠드는 건 백엔드뿐**이라 화면은 항상 즉시 뜹니다.

---

## 아이패드에서 쓸 때

- **Safari 로 주소를 연 뒤 공유 → 홈 화면에 추가** 하면 주소창 없이 전체화면으로 뜹니다
- 화면이 1920x1080 기준이라 아이패드 비율에서는 위아래 여백이 생깁니다 (잘리지는 않습니다)
- **자동 잠금 끄기**: 설정 → 디스플레이 및 밝기 → 자동 잠금 → 안 함
- **인증샷 기능은 카메라 권한**이 필요합니다. 처음 한 번 "허용" 을 눌러주세요
