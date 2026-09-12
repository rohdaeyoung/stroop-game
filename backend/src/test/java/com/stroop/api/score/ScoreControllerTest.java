// 👤 담당: 고은우 — 에러 응답이 docs/API.md 의 코드와 일치하는지 검증한다
package com.stroop.api.score;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ScoreController.class)
class ScoreControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    ScoreService scoreService;

    private String json(String nickname, int score) throws Exception {
        return objectMapper.writeValueAsString(
                new ScoreSubmitRequest(nickname, score, 17, 42, 3, 61000L));
    }

    @Test
    @DisplayName("정상 제출이면 201 과 scoreId, rank, isNewRecord 를 돌려준다")
    void 정상_제출() throws Exception {
        given(scoreService.submit(any())).willReturn(new ScoreSubmitResponse(12L, 4L, true));

        mockMvc.perform(post("/api/scores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("대영", 1250)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.scoreId").value(12))
                .andExpect(jsonPath("$.rank").value(4))
                .andExpect(jsonPath("$.isNewRecord").value(true));
    }

    @Test
    @DisplayName("닉네임이 비어 있으면 INVALID_NICKNAME 으로 응답한다")
    void 닉네임_오류() throws Exception {
        mockMvc.perform(post("/api/scores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("   ", 1250)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_NICKNAME"));
    }

    @Test
    @DisplayName("점수가 음수면 INVALID_SCORE 로 응답한다")
    void 점수_오류() throws Exception {
        mockMvc.perform(post("/api/scores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("대영", -10)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_SCORE"));
    }

    @Test
    @DisplayName("JSON 이 깨져 있으면 500 이 아니라 INVALID_REQUEST 로 응답한다")
    void 깨진_본문() throws Exception {
        mockMvc.perform(post("/api/scores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ this is not json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }
}
