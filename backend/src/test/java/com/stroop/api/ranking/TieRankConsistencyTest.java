// 👤 담당: 고은우 — 동점자 순위가 "제출 응답 · 내 순위 · 랭킹 목록" 세 곳에서 모두 같은지 검증한다 (#37)
//
// 서비스 단위 테스트는 저장소를 mock 하므로 실제 쿼리의 정렬 기준을 확인할 수 없다.
// 여기서는 H2 에 실제로 저장한 뒤, 세 API 가 같은 순서를 내놓는지 끝까지 확인한다.
package com.stroop.api.ranking;

import com.stroop.api.score.ScoreService;
import com.stroop.api.score.ScoreSubmitRequest;
import com.stroop.api.score.ScoreSubmitResponse;
import com.stroop.domain.score.Score;
import com.stroop.domain.score.ScoreRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import({ScoreService.class, RankingService.class})
class TieRankConsistencyTest {

    /** 테스트 실행 시각보다 항상 과거여야 서비스가 방금 저장한 기록이 뒤에 선다 */
    private static final LocalDateTime PAST = LocalDateTime.of(2020, 1, 1, 12, 0, 0);

    @Autowired
    ScoreRepository scoreRepository;

    @Autowired
    ScoreService scoreService;

    @Autowired
    RankingService rankingService;

    private Score saveAt(String nickname, int score, LocalDateTime createdAt) {
        return scoreRepository.saveAndFlush(Score.builder()
                .nickname(nickname).score(score).maxCombo(10)
                .correctCount(20).wrongCount(1).playTimeMs(60_000)
                .createdAt(createdAt)
                .build());
    }

    @Test
    @DisplayName("같은 점수 3명의 순위가 서로 다르고, 제출 응답·내 순위·랭킹 목록이 모두 일치한다")
    void 동점자_순위_일치() {
        Score first = saveAt("먼저", 1000, PAST);
        Score second = saveAt("다음", 1000, PAST.plusSeconds(1));

        ScoreSubmitResponse submitted = scoreService.submit(
                new ScoreSubmitRequest("나중", 1000, 10, 20, 1, 60_000L));

        List<RankingItem> rankings = rankingService.getTopRankings(10).rankings();

        // 랭킹 목록: 먼저 등록한 사람이 위
        assertThat(rankings).extracting(RankingItem::nickname)
                .containsExactly("먼저", "다음", "나중");

        // 제출 응답의 순위 = 목록 위치 (예전에는 셋 다 1위였다)
        assertThat(submitted.rank()).isEqualTo(3);

        // 내 순위 조회도 목록과 같다
        assertThat(rankingService.getMyRank(first.getId()).rank()).isEqualTo(1);
        assertThat(rankingService.getMyRank(second.getId()).rank()).isEqualTo(2);
        assertThat(rankingService.getMyRank(submitted.scoreId()).rank()).isEqualTo(3);
    }

    @Test
    @DisplayName("점수가 높으면 늦게 등록해도 위에 선다")
    void 점수_우선() {
        saveAt("낮은점수", 900, PAST);

        ScoreSubmitResponse submitted = scoreService.submit(
                new ScoreSubmitRequest("높은점수", 1500, 10, 20, 1, 60_000L));

        assertThat(submitted.rank()).isEqualTo(1);
        assertThat(rankingService.getTopRankings(10).rankings())
                .extracting(RankingItem::nickname)
                .containsExactly("높은점수", "낮은점수");
    }
}
