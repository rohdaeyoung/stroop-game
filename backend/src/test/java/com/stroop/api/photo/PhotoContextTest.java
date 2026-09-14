// 👤 담당: 고은우 — 앱 전체를 띄웠을 때 사진 보관 기능이 제대로 조립되는지 확인한다
//
// 컨트롤러·서비스 테스트는 일부만 띄워서, Clock 빈이나 스케줄링 설정이 빠져도 통과한다.
// 이 테스트는 실제 애플리케이션 컨텍스트 전체를 띄워 그런 누락을 잡는다.
package com.stroop.api.photo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class PhotoContextTest {

    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 1, 2, 3};

    @Autowired
    PhotoService photoService;

    @Test
    @DisplayName("앱 전체 컨텍스트에서 업로드한 사진을 다시 받을 수 있다")
    void 전체_조립() {
        PhotoUploadResponse uploaded = photoService.upload(
                new MockMultipartFile("photo", "shot.jpg", "image/jpeg", JPEG));

        assertThat(uploaded.expiresAt()).isAfter(Instant.now());
        assertThat(photoService.download(uploaded.token()).bytes()).isEqualTo(JPEG);
    }
}
