// 👤 담당: 고은우 — 응답 형식과 에러 코드가 docs/API.md 와 일치하는지 검증한다
package com.stroop.api.photo;

import com.stroop.global.ApiException;
import com.stroop.global.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Clock;
import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.containsString;

@WebMvcTest(PhotoController.class)
class PhotoControllerTest {

    private static final String TOKEN = "3f1c2a9e-7b1d-4c55-9a0e-2b8f6d1e4a70";
    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 1, 2, 3};

    @Autowired
    MockMvc mockMvc;

    @MockBean
    PhotoService photoService;

    @MockBean
    Clock clock;

    private static MockMultipartFile photoPart() {
        return new MockMultipartFile("photo", "shot.jpg", "image/jpeg", JPEG);
    }

    @Test
    @DisplayName("업로드하면 201 과 token, expiresAt, expiresInSeconds 를 돌려준다")
    void 업로드() throws Exception {
        given(photoService.upload(any())).willReturn(
                new PhotoUploadResponse(TOKEN, Instant.parse("2026-10-01T12:05:00Z"), 300));

        mockMvc.perform(multipart("/api/photos").file(photoPart()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value(TOKEN))
                .andExpect(jsonPath("$.expiresAt").value("2026-10-01T12:05:00Z"))
                .andExpect(jsonPath("$.expiresInSeconds").value(300));
    }

    @Test
    @DisplayName("photo 파트가 없으면 INVALID_REQUEST")
    void 파트_누락() throws Exception {
        mockMvc.perform(multipart("/api/photos"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }

    @Test
    @DisplayName("multipart 가 아닌 요청은 500 이 아니라 INVALID_REQUEST")
    void multipart_아님() throws Exception {
        mockMvc.perform(post("/api/photos").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }

    @Test
    @DisplayName("형식이 틀리면 415 UNSUPPORTED_PHOTO_TYPE")
    void 형식_오류() throws Exception {
        given(photoService.upload(any())).willThrow(new ApiException(ErrorCode.UNSUPPORTED_PHOTO_TYPE));

        mockMvc.perform(multipart("/api/photos").file(photoPart()))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.code").value("UNSUPPORTED_PHOTO_TYPE"));
    }

    @Test
    @DisplayName("Spring 업로드 한도를 넘으면 500 이 아니라 413 PHOTO_TOO_LARGE")
    void 업로드_한도_초과() throws Exception {
        given(photoService.upload(any())).willThrow(new MaxUploadSizeExceededException(1024 * 1024));

        mockMvc.perform(multipart("/api/photos").file(photoPart()))
                .andExpect(status().isPayloadTooLarge())
                .andExpect(jsonPath("$.code").value("PHOTO_TOO_LARGE"));
    }

    @Test
    @DisplayName("다운로드하면 이미지 바이트와 inline·no-store 헤더를 돌려준다")
    void 다운로드() throws Exception {
        given(photoService.download(TOKEN)).willReturn(
                new StoredPhoto(TOKEN, JPEG, "image/jpeg", Instant.parse("2026-10-01T12:05:00Z")));

        mockMvc.perform(get("/api/photos/" + TOKEN))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/jpeg"))
                .andExpect(content().bytes(JPEG))
                .andExpect(header().string("Content-Disposition", "inline; filename=\"eoheung-shot.jpg\""))
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"));
    }

    @Test
    @DisplayName("만료됐거나 없는 토큰이면 404 PHOTO_NOT_FOUND")
    void 다운로드_없음() throws Exception {
        given(photoService.download(TOKEN)).willThrow(new ApiException(ErrorCode.PHOTO_NOT_FOUND));

        mockMvc.perform(get("/api/photos/" + TOKEN))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PHOTO_NOT_FOUND"));
    }

    @Test
    @DisplayName("QR 로 연 화면은 이미지 src 와 남은 시간이 담긴 HTML 을 돌려준다")
    void 화면_보기() throws Exception {
        Instant now = Instant.parse("2026-10-01T12:00:00Z");
        given(clock.instant()).willReturn(now);
        given(photoService.download(TOKEN)).willReturn(
                new StoredPhoto(TOKEN, JPEG, "image/jpeg", now.plusSeconds(300)));

        mockMvc.perform(get("/api/photos/" + TOKEN + "/view"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(content().string(containsString("/api/photos/" + TOKEN)))
                .andExpect(content().string(containsString("5:00")));
    }

    @Test
    @DisplayName("QR 로 연 화면도 만료·없는 토큰이면 404 와 함께 안내 HTML 을 돌려준다")
    void 화면_보기_없음() throws Exception {
        given(photoService.download(TOKEN)).willThrow(new ApiException(ErrorCode.PHOTO_NOT_FOUND));

        mockMvc.perform(get("/api/photos/" + TOKEN + "/view"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
                .andExpect(content().string(containsString("보관 시간이 끝났어요")));
    }
}
