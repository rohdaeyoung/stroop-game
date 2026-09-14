# API 명세 (FE ↔ BE 계약)

> ⚠️ 이 문서는 **FE 4명 + BE 2명 전원에게 영향**을 줍니다.
> 바꾸려면 팀 합의 후 PR 제목에 `[shared]`를 붙이세요.

Base URL: `http://localhost:8080`

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
{ "code": "INVALID_NICKNAME", "message": "닉네임은 한글·영문·숫자 1~10자여야 합니다." }
```

| HTTP | code | 상황 |
|---|---|---|
| 400 | `INVALID_REQUEST` | 파라미터 타입 오류(`?scoreId=abc`), 필수 파라미터 누락, 깨진 JSON, `limit` 범위 밖 |
| 400 | `INVALID_NICKNAME` | 닉네임이 1~10자가 아니거나, 한글·영문·숫자 외 문자(공백·특수문자·이모지) 포함 — [GAME_RULES.md](GAME_RULES.md) 서버 검증 참고 |
| 400 | `INVALID_SCORE` | 점수가 음수이거나 비정상 |
| 404 | `SCORE_NOT_FOUND` | scoreId 없음 |
| 500 | `INTERNAL_ERROR` | 서버 오류 |
