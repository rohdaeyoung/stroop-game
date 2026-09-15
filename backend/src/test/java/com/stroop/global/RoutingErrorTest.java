// 👤 담당: 고은우 — 없는 주소·허용하지 않는 메서드가 500 이 아니라 404·405 로 나가는지 검증한다 (#57)
package com.stroop.global;

import com.stroop.api.ranking.RankingController;
import com.stroop.api.ranking.RankingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RankingController.class)
class RoutingErrorTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    RankingService rankingService;

    @Test
    @DisplayName("없는 API 주소는 404 NOT_FOUND")
    void 없는_API_주소() throws Exception {
        mockMvc.perform(get("/api/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    @DisplayName("봇이 두드리는 주소(/robots.txt)도 500 이 아니라 404")
    void 봇_주소() throws Exception {
        mockMvc.perform(get("/robots.txt"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    @DisplayName("주소는 있지만 허용하지 않는 메서드는 405 METHOD_NOT_ALLOWED")
    void 메서드_불일치() throws Exception {
        mockMvc.perform(delete("/api/rankings"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.code").value("METHOD_NOT_ALLOWED"));
    }
}
