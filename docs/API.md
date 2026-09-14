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

## 4. 인증샷 임시 보관 (QR 다운로드용)

> 사진은 **서버 메모리에 5분만** 보관하고 지웁니다. DB 에 저장하지 않고 랭킹에도 노출하지 않습니다.
> 흐름: 태블릿이 촬영·합성한 사진을 올림 → 받은 토큰으로 QR 표시 → 참가자 휴대폰이 QR 로 사진을 받음

### 4-1. 사진 올리기

`POST /api/photos` — `multipart/form-data`, 파일 필드 이름은 **`photo`**

| 조건 | 값 |
|---|---|
| 형식 | JPEG 또는 PNG — 파일 앞 바이트로 판별 (Content-Type 은 믿지 않음) |
| 크기 | **1MB 이하** — 1920×1080 을 JPEG 품질 0.8 정도로 저장하면 충분합니다 |

**Response** `201 Created`
```json
{
  "token": "3f1c2a9e-7b1d-4c55-9a0e-2b8f6d1e4a70",
  "expiresAt": "2026-10-01T12:05:00Z",
  "expiresInSeconds": 300
}
```

- **QR 에 넣을 주소**: `{API 주소}/api/photos/{token}` — 예: `https://stroop-api.onrender.com/api/photos/3f1c2a9e-...`
- 화면의 만료 카운트다운은 **`expiresInSeconds` 기준**으로 세세요. 태블릿 시계가 틀려도 맞습니다
- 토큰은 추측할 수 없는 값이라 남의 사진을 받아갈 수 없습니다

### 4-2. 사진 받기

`GET /api/photos/{token}` — 참가자 휴대폰이 QR 로 여는 주소

**Response** `200 OK` — 이미지 파일 (`image/jpeg` 또는 `image/png`)
- 휴대폰 브라우저에서 사진이 바로 열리고, 길게 눌러 저장할 수 있습니다 (`inline`)
- 브라우저·중간 캐시에 남기지 않습니다 (`Cache-Control: no-store`)
- 5분 안에는 여러 번 받을 수 있습니다
- 만료됐거나 없는 토큰이면 `404 PHOTO_NOT_FOUND`

---

## 공통 에러 포맷

```json
{ "code": "INVALID_NICKNAME", "message": "닉네임은 1~10자여야 합니다." }
```

| HTTP | code | 상황 |
|---|---|---|
| 400 | `INVALID_REQUEST` | 파라미터 타입 오류(`?scoreId=abc`), 필수 파라미터 누락, 깨진 JSON, `limit` 범위 밖, 사진 파일 누락·빈 파일 |
| 400 | `INVALID_NICKNAME` | 닉네임 길이/문자 오류 |
| 400 | `INVALID_SCORE` | 점수가 음수이거나 비정상 |
| 404 | `SCORE_NOT_FOUND` | scoreId 없음 |
| 404 | `PHOTO_NOT_FOUND` | 사진 토큰이 없거나 보관 시간(5분)이 지남 |
| 413 | `PHOTO_TOO_LARGE` | 사진이 1MB 초과 |
| 415 | `UNSUPPORTED_PHOTO_TYPE` | JPEG·PNG 가 아님 |
| 500 | `INTERNAL_ERROR` | 서버 오류 |
