// 👤 담당: 고은우 — docs/GAME_RULES.md "검증 케이스 > 서버 검증" 표를 그대로 옮긴 테스트입니다.
package com.stroop.api.score;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
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

    private String body(String nickname, int score, int wrongCount, long playTimeMs) throws Exception {
        return objectMapper.writeValueAsString(
                new ScoreSubmitRequest(nickname, score, 17, 42, wrongCount, playTimeMs));
    }

    @ParameterizedTest(name = "score={0}, wrongCount={1}, playTimeMs={2} → 201")
    @CsvSource({
            "12500, 2, 30000",   // 일반적인 기록
            "0,     3, 0",       // 모든 하한 경계값
            "300000, 3, 40000"   // 모든 상한 경계값
    })
    @DisplayName("허용 범위 안이면 저장한다")
    void 허용_범위(int score, int wrongCount, long playTimeMs) throws Exception {
        given(scoreService.submit(any())).willReturn(new ScoreSubmitResponse(12L, 4L, true));

        mockMvc.perform(post("/api/scores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("대영", score, wrongCount, playTimeMs)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.scoreId").value(12))
                .andExpect(jsonPath("$.rank").value(4))
                .andExpect(jsonPath("$.isNewRecord").value(true));
    }

    @ParameterizedTest(name = "score={0}, wrongCount={1}, playTimeMs={2} → INVALID_SCORE")
    @CsvSource({
            "300001, 2, 30000",  // 점수 상한 초과
            "-1,     2, 30000",  // 음수 점수
            "12500,  4, 30000",  // 오답 3회 초과
            "12500,  2, 40001"   // 플레이 시간 상한 초과
    })
    @DisplayName("허용 범위를 벗어나면 INVALID_SCORE 로 거부한다")
    void 범위_밖(int score, int wrongCount, long playTimeMs) throws Exception {
        mockMvc.perform(post("/api/scores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("대영", score, wrongCount, playTimeMs)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_SCORE"));
    }

    @ParameterizedTest(name = "nickname=\"{0}\" → INVALID_NICKNAME")
    @ValueSource(strings = {
            "", "   ", "열한글자닉네임입니다요",       // 비었거나 10자 초과
            "대영!", "대영_", "<script>",             // 특수문자
            "tiger king", "대 영",                    // 공백
            "대영😀",                                 // 이모지
            "ㅋㅋ", "대ㅎ"                            // 자음·모음 (FE 규칙과 동일하게 제외)
    })
    @DisplayName("닉네임이 비었거나, 10자를 넘거나, 한글·영문·숫자 외 문자가 있으면 INVALID_NICKNAME 으로 거부한다")
    void 닉네임_오류(String nickname) throws Exception {
        mockMvc.perform(post("/api/scores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(nickname, 12500, 2, 30000)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_NICKNAME"));
    }

    @ParameterizedTest(name = "nickname=\"{0}\" → 201")
    @ValueSource(strings = {"대영", "Tiger123", "가나다라마바사아자차"})
    @DisplayName("한글·영문·숫자 조합의 1~10자 닉네임은 허용한다")
    void 닉네임_허용(String nickname) throws Exception {
        given(scoreService.submit(any())).willReturn(new ScoreSubmitResponse(12L, 4L, true));

        mockMvc.perform(post("/api/scores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(nickname, 12500, 2, 30000)))
                .andExpect(status().isCreated());
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
