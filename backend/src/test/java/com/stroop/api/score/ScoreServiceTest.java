// 👤 담당: 고은우
package com.stroop.api.score;

import com.stroop.domain.score.Score;
import com.stroop.domain.score.ScoreRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.then;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ScoreServiceTest {

    @Mock
    ScoreRepository scoreRepository;

    @InjectMocks
    ScoreService scoreService;

    private static ScoreSubmitRequest request(int score) {
        return new ScoreSubmitRequest("대영", score, 17, 42, 2, 60000L);
    }

    private void 저장은_그대로_돌려준다() {
        given(scoreRepository.save(any(Score.class))).willAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("같은 닉네임의 이전 최고점보다 높으면 신기록이다")
    void 신기록() {
        given(scoreRepository.findBestScoreByNickname("대영")).willReturn(1000);
        저장은_그대로_돌려준다();

        ScoreSubmitResponse response = scoreService.submit(request(1250));

        assertThat(response.isNewRecord()).isTrue();
    }

    @Test
    @DisplayName("이전 최고점보다 낮거나 같으면 신기록이 아니다")
    void 신기록_아님() {
        given(scoreRepository.findBestScoreByNickname("대영")).willReturn(1250);
        저장은_그대로_돌려준다();

        ScoreSubmitResponse response = scoreService.submit(request(1250));

        assertThat(response.isNewRecord()).isFalse();
    }

    @Test
    @DisplayName("내 점수보다 높은 기록 수 + 1 이 순위다")
    void 순위() {
        given(scoreRepository.findBestScoreByNickname("대영")).willReturn(0);
        저장은_그대로_돌려준다();
        given(scoreRepository.countHigherRankThan(eq(1250), any(), any())).willReturn(3L);

        ScoreSubmitResponse response = scoreService.submit(request(1250));

        assertThat(response.rank()).isEqualTo(4);
    }

    @Test
    @DisplayName("순위는 점수만이 아니라 저장된 기록의 등록 시각까지 넘겨 계산한다 (동점자 구분)")
    void 순위_계산에_등록시각_전달() {
        LocalDateTime savedAt = LocalDateTime.of(2026, 9, 14, 13, 0, 0);
        given(scoreRepository.findBestScoreByNickname("대영")).willReturn(0);
        given(scoreRepository.save(any(Score.class))).willReturn(Score.builder()
                .nickname("대영").score(1250).maxCombo(17)
                .correctCount(42).wrongCount(2).playTimeMs(60000L)
                .createdAt(savedAt)
                .build());

        scoreService.submit(request(1250));

        then(scoreRepository).should().countHigherRankThan(eq(1250), eq(savedAt), any());
    }
}
