// 👤 담당: 고은우 — 배포 환경의 CORS_ORIGIN 설정이 실제로 적용되는지 검증한다
package com.stroop.global;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// 운영에서 흔한 실수를 일부러 넣었다: 끝에 "/" 가 붙은 주소, 쉼표 뒤 공백
@WebMvcTest(HealthController.class)
@TestPropertySource(properties = "CORS_ORIGIN=https://stroop.onrender.com/, http://localhost:5173")
class CorsConfigTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    @DisplayName("CORS_ORIGIN 에 넣은 배포 주소를 허용한다 — 끝의 / 가 붙어 있어도 된다")
    void 배포_주소_허용() throws Exception {
        mockMvc.perform(options("/api/health")
                        .header("Origin", "https://stroop.onrender.com")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://stroop.onrender.com"))
                .andExpect(header().string("Access-Control-Max-Age", "3600"));
    }

    @Test
    @DisplayName("쉼표로 여러 주소를 줄 수 있다")
    void 여러_주소() throws Exception {
        mockMvc.perform(options("/api/health")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    @DisplayName("목록에 없는 주소는 거부한다")
    void 허용_안_된_주소() throws Exception {
        mockMvc.perform(options("/api/health")
                        .header("Origin", "https://evil.example.com")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("값이 비어 있으면 로컬 개발 주소로 되돌린다")
    void 빈_값() {
        assertThat(CorsConfig.parseOrigins(" , ")).containsExactly(CorsConfig.DEFAULT_ORIGIN);
        assertThat(CorsConfig.parseOrigins(null)).containsExactly(CorsConfig.DEFAULT_ORIGIN);
    }

    @Test
    @DisplayName("주소 앞뒤 공백과 끝의 / 를 정리한다")
    void 주소_정리() {
        assertThat(CorsConfig.parseOrigins(" https://a.onrender.com/ ,https://b.onrender.com"))
                .isEqualTo(List.of("https://a.onrender.com", "https://b.onrender.com"));
    }
}
