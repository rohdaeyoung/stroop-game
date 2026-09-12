// 👤 담당: 고은우 — 잘못된 파라미터가 500 이 아니라 400 으로 나가는지 검증한다
package com.stroop.api.ranking;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RankingController.class)
class RankingControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    RankingService rankingService;

    @Test
    @DisplayName("랭킹 목록을 내려준다")
    void 랭킹_조회() throws Exception {
        given(rankingService.getTopRankings(anyInt())).willReturn(new RankingListResponse(
                List.of(new RankingItem(1, "민서", 2100, 28, LocalDateTime.of(2026, 9, 11, 14, 0)))));

        mockMvc.perform(get("/api/rankings?limit=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rankings[0].rank").value(1))
                .andExpect(jsonPath("$.rankings[0].nickname").value("민서"));
    }

    @Test
    @DisplayName("scoreId 가 숫자가 아니면 INVALID_REQUEST 로 응답한다")
    void scoreId_타입_오류() throws Exception {
        mockMvc.perform(get("/api/rankings/me?scoreId=abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }

    @Test
    @DisplayName("scoreId 가 빠지면 INVALID_REQUEST 로 응답한다")
    void scoreId_누락() throws Exception {
        mockMvc.perform(get("/api/rankings/me"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }
}
