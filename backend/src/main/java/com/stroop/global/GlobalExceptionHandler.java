// 👤 담당: 고은우
package com.stroop.global;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    public record ErrorResponse(String code, String message) {}

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApi(ApiException e) {
        ErrorCode code = e.getErrorCode();
        log.warn("요청 처리 실패: code={}", code.name());
        return toResponse(code);
    }

    /**
     * 요청 본문 검증 실패. 어떤 필드가 틀렸는지에 따라 코드가 달라진다.
     * 전부 INVALID_SCORE 로 내보내면 FE 가 닉네임 오류와 점수 오류를 구분할 수 없다.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        String field = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getField)
                .orElse("");
        ErrorCode code = "nickname".equals(field) ? ErrorCode.INVALID_NICKNAME : ErrorCode.INVALID_SCORE;
        log.warn("요청 본문 검증 실패: field={}, code={}", field, code.name());
        return toResponse(code);
    }

    /** 파라미터 타입 불일치, 필수 파라미터 누락, 깨진 JSON — 클라이언트 잘못이므로 400 */
    @ExceptionHandler({
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class,
            HttpMessageNotReadableException.class
    })
    public ResponseEntity<ErrorResponse> handleBadRequest(Exception e) {
        log.warn("잘못된 요청: {}", e.getMessage());
        return toResponse(ErrorCode.INVALID_REQUEST);
    }

    /** 예상 못 한 예외. 로그를 남기지 않으면 장애 원인을 추적할 수 없다. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnknown(Exception e) {
        log.error("처리되지 않은 예외", e);
        return toResponse(ErrorCode.INTERNAL_ERROR);
    }

    private static ResponseEntity<ErrorResponse> toResponse(ErrorCode code) {
        return ResponseEntity.status(code.getStatus())
                .body(new ErrorResponse(code.name(), code.getMessage()));
    }
}
