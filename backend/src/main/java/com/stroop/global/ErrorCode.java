// 👤 담당: 고은우 — docs/API.md 의 에러 표와 동기화 유지
package com.stroop.global;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    INVALID_NICKNAME(HttpStatus.BAD_REQUEST, "닉네임은 1~10자여야 합니다."),
    INVALID_SCORE(HttpStatus.BAD_REQUEST, "점수가 올바르지 않습니다."),
    SCORE_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 기록을 찾을 수 없습니다."),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String message;
}
