// 👤 담당: 고은우
package com.stroop.api.ranking;

import com.stroop.domain.score.Score;
import com.stroop.domain.score.ScoreRepository;
import com.stroop.global.ApiException;
import com.stroop.global.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class RankingServiceTest {

    @Mock
    ScoreRepository scoreRepository;

    @InjectMocks
    RankingService rankingService;

    private static Score score(String nickname, int value) {
        return Score.builder()
                .nickname(nickname)
                .score(value)
                .maxCombo(10)
                .correctCount(20)
                .wrongCount(1)
                .playTimeMs(61000L)
                .build();
    }

    @ParameterizedTest(name = "limit={0} 이면 INVALID_REQUEST")
    @ValueSource(ints = {0, -1, 101})
    @DisplayName("limit 이 범위를 벗어나면 400 으로 막는다 (전에는 500 이 나갔다)")
    void limit_범위_검증(int limit) {
        assertThatThrownBy(() -> rankingService.getTopRankings(limit))
                .isInstanceOf(ApiException.class)
                .extracting(e -> ((ApiException) e).getErrorCode())
                .isEqualTo(ErrorCode.INVALID_REQUEST);
    }

    @Test
    @DisplayName("조회한 순서대로 1위부터 번호를 매긴다")
    void 랭킹_순번() {
        given(scoreRepository.findTopRankings(any(Pageable.class)))
                .willReturn(List.of(score("민서", 2100), score("대영", 1250)));

        List<RankingItem> items = rankingService.getTopRankings(10).rankings();

        assertThat(items).hasSize(2);
        assertThat(items.get(0).rank()).isEqualTo(1);
        assertThat(items.get(0).nickname()).isEqualTo("민서");
        assertThat(items.get(1).rank()).isEqualTo(2);
    }

    @Test
    @DisplayName("없는 scoreId 면 SCORE_NOT_FOUND")
    void 내_순위_없음() {
        given(scoreRepository.findById(99L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> rankingService.getMyRank(99L))
                .isInstanceOf(ApiException.class)
                .extracting(e -> ((ApiException) e).getErrorCode())
                .isEqualTo(ErrorCode.SCORE_NOT_FOUND);
    }

    @Test
    @DisplayName("내 순위와 백분위를 계산한다")
    void 내_순위_계산() {
        given(scoreRepository.findById(12L)).willReturn(Optional.of(score("대영", 1250)));
        given(scoreRepository.countHigherThan(1250)).willReturn(3L);
        given(scoreRepository.count()).willReturn(137L);

        MyRankResponse response = rankingService.getMyRank(12L);

        assertThat(response.rank()).isEqualTo(4);
        assertThat(response.total()).isEqualTo(137);
        assertThat(response.percentile()).isEqualTo(2.9);
    }
}
