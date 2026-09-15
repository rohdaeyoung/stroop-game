// 👤 담당: 고은우 — docs/API.md 의 에러 표와 동기화 유지
package com.stroop.global;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "요청 형식이 올바르지 않습니다."),
    INVALID_NICKNAME(HttpStatus.BAD_REQUEST, "닉네임은 한글·영문·숫자 1~10자여야 합니다."),
    INVALID_SCORE(HttpStatus.BAD_REQUEST, "점수가 올바르지 않습니다."),
    SCORE_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 기록을 찾을 수 없습니다."),
    PHOTO_NOT_FOUND(HttpStatus.NOT_FOUND, "사진을 찾을 수 없거나 보관 시간(5분)이 지났습니다."),
    PHOTO_TOO_LARGE(HttpStatus.PAYLOAD_TOO_LARGE, "사진은 1MB 이하만 올릴 수 있습니다."),
    UNSUPPORTED_PHOTO_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "JPEG 또는 PNG 사진만 올릴 수 있습니다."),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String message;
}
