// 👤 담당: 고은우 — 업로드 검증(크기·형식)과 다운로드 조회를 검증한다
package com.stroop.api.photo;

import com.stroop.global.ApiException;
import com.stroop.global.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PhotoServiceTest {

    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 16};
    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n', 0, 0};
    private static final byte[] GIF = "GIF89a....".getBytes(StandardCharsets.US_ASCII);

    private PhotoService photoService;

    @BeforeEach
    void setUp() {
        Clock fixed = Clock.fixed(Instant.parse("2026-10-01T12:00:00Z"), ZoneOffset.UTC);
        photoService = new PhotoService(new PhotoStore(fixed));
    }

    private static MockMultipartFile file(byte[] content, String declaredType) {
        return new MockMultipartFile("photo", "shot", declaredType, content);
    }

    private static void assertErrorCode(Runnable action, ErrorCode expected) {
        assertThatThrownBy(action::run)
                .isInstanceOf(ApiException.class)
                .extracting(e -> ((ApiException) e).getErrorCode())
                .isEqualTo(expected);
    }

    @Test
    @DisplayName("JPEG 를 올리면 토큰과 5분 뒤 만료 시각을 돌려준다")
    void JPEG_업로드() {
        PhotoUploadResponse response = photoService.upload(file(JPEG, "image/jpeg"));

        assertThat(response.token()).hasSize(36);
        assertThat(response.expiresAt()).isEqualTo(Instant.parse("2026-10-01T12:05:00Z"));
        assertThat(response.expiresInSeconds()).isEqualTo(300);
        assertThat(photoService.download(response.token()).contentType()).isEqualTo("image/jpeg");
    }

    @Test
    @DisplayName("PNG 도 허용한다")
    void PNG_업로드() {
        PhotoUploadResponse response = photoService.upload(file(PNG, "image/png"));

        assertThat(photoService.download(response.token()).contentType()).isEqualTo("image/png");
    }

    @Test
    @DisplayName("형식은 파일 앞 바이트로 판단한다 — Content-Type 을 image/jpeg 로 속여도 GIF 는 거부한다")
    void 형식_위장_거부() {
        assertErrorCode(() -> photoService.upload(file(GIF, "image/jpeg")), ErrorCode.UNSUPPORTED_PHOTO_TYPE);
    }

    @Test
    @DisplayName("이미지가 아닌 파일은 거부한다")
    void 텍스트_거부() {
        byte[] text = "hello".getBytes(StandardCharsets.UTF_8);

        assertErrorCode(() -> photoService.upload(file(text, "image/png")), ErrorCode.UNSUPPORTED_PHOTO_TYPE);
    }

    @Test
    @DisplayName("1MB 를 넘으면 PHOTO_TOO_LARGE")
    void 크기_초과() {
        byte[] tooLarge = new byte[(int) PhotoService.MAX_BYTES + 1];
        System.arraycopy(JPEG, 0, tooLarge, 0, JPEG.length);

        assertErrorCode(() -> photoService.upload(file(tooLarge, "image/jpeg")), ErrorCode.PHOTO_TOO_LARGE);
    }

    @Test
    @DisplayName("정확히 1MB 는 허용한다")
    void 크기_경계() {
        byte[] exactly = new byte[(int) PhotoService.MAX_BYTES];
        System.arraycopy(JPEG, 0, exactly, 0, JPEG.length);

        assertThat(photoService.upload(file(exactly, "image/jpeg")).token()).isNotBlank();
    }

    @Test
    @DisplayName("빈 파일은 INVALID_REQUEST")
    void 빈_파일() {
        assertErrorCode(() -> photoService.upload(file(new byte[0], "image/jpeg")), ErrorCode.INVALID_REQUEST);
    }

    @Test
    @DisplayName("없는 토큰으로 받으면 PHOTO_NOT_FOUND")
    void 없는_토큰() {
        assertErrorCode(() -> photoService.download("no-such-token"), ErrorCode.PHOTO_NOT_FOUND);
    }
}
