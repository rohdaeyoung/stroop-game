# API 명세 (FE ↔ BE 계약)

> ⚠️ 이 문서는 **FE 4명 + BE 2명 전원에게 영향**을 줍니다.
> 바꾸려면 팀 합의 후 PR 제목에 `[shared]`를 붙이세요.

Base URL: `http://localhost:8080` (로컬) / 배포 주소는 README 배포 계획 참고

> 배포 환경에서 프론트 주소가 다르면 서버 환경변수 **`CORS_ORIGIN`** 에 프론트 주소를 넣어야 호출됩니다.
> 쉼표로 여러 개를 넣을 수 있고, 설정하지 않으면 `http://localhost:5173` 만 허용합니다.

---

## 0. 서버 상태 확인

`GET /api/health`

**Response** `200 OK`
```json
{ "status": "UP" }
```

- Render 헬스 체크 경로로 지정합니다
- **부스 운영 전에 한 번 호출해서 잠든 서버를 깨우는 용도**로도 씁니다 (콜드 스타트 30~50초)
- DB 연결은 확인하지 않습니다 — 서버 프로세스가 떠 있는지만 봅니다

---

## 1. 점수 제출

`POST /api/scores`

**Request**
```json
{
  "nickname": "대영",
  "score": 1250,
  "maxCombo": 17,
  "correctCount": 42,
  "wrongCount": 3,
  "playTimeMs": 61000
}
```

**Response** `201 Created`
```json
{
  "scoreId": 12,
  "rank": 4,
  "isNewRecord": true
}
```

---

## 2. 랭킹 조회

`GET /api/rankings?limit=10`

`limit` 은 **1~100** (생략하면 10). 범위를 벗어나면 `400 INVALID_REQUEST`.

**Response** `200 OK`
```json
{
  "rankings": [
    { "rank": 1, "nickname": "민서", "score": 2100, "maxCombo": 28, "createdAt": "2026-09-11T14:00:00" }
  ]
}
```

---

## 3. 내 순위 조회

`GET /api/rankings/me?scoreId=12`

**Response** `200 OK`
```json
{ "rank": 4, "total": 137, "percentile": 2.9 }
```

---

## 공통 에러 포맷

```json
{ "code": "INVALID_NICKNAME", "message": "닉네임은 1~10자여야 합니다." }
```

| HTTP | code | 상황 |
|---|---|---|
| 400 | `INVALID_REQUEST` | 파라미터 타입 오류(`?scoreId=abc`), 필수 파라미터 누락, 깨진 JSON, `limit` 범위 밖 |
| 400 | `INVALID_NICKNAME` | 닉네임 길이/문자 오류 |
| 400 | `INVALID_SCORE` | 점수가 음수이거나 비정상 |
| 404 | `SCORE_NOT_FOUND` | scoreId 없음 |
| 500 | `INTERNAL_ERROR` | 서버 오류 |
