// 👤 담당: 노대영 — 랭킹 쿼리가 정렬 규칙과 일치하는지 검증
package com.stroop.domain.score;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ScoreRepositoryTest {

    @Autowired
    private ScoreRepository scoreRepository;

    private Score save(String nickname, int score) {
        return scoreRepository.saveAndFlush(Score.builder()
                .nickname(nickname)
                .score(score)
                .maxCombo(10)
                .correctCount(20)
                .wrongCount(1)
                .playTimeMs(60_000)
                .build());
    }

    @Test
    @DisplayName("랭킹 목록은 점수 내림차순으로 정렬된다")
    void 랭킹_정렬() {
        save("민서", 1000);
        save("혜원", 3000);
        save("복순", 2000);

        List<Score> result = scoreRepository.findTopRankings(PageRequest.of(0, 10));

        assertThat(result).extracting(Score::getNickname)
                .containsExactly("혜원", "복순", "민서");
    }

    @Test
    @DisplayName("동점이면 먼저 등록한 사람이 위에 온다")
    void 동점_정렬() {
        Score first = save("먼저", 1000);
        Score later = save("나중", 1000);

        List<Score> result = scoreRepository.findTopRankings(PageRequest.of(0, 10));

        assertThat(result).extracting(Score::getNickname)
                .containsExactly("먼저", "나중");
        assertThat(first.getCreatedAt()).isBeforeOrEqualTo(later.getCreatedAt());
    }

    @Test
    @DisplayName("동점자의 순위가 서로 달라야 한다 — 랭킹 목록의 순서와 일치")
    void 동점_순위_계산() {
        Score first = save("먼저", 1000);
        Score later = save("나중", 1000);
        save("아래", 500);

        long firstRank = scoreRepository.countHigherRankThan(first.getScore(), first.getCreatedAt()) + 1;
        long laterRank = scoreRepository.countHigherRankThan(later.getScore(), later.getCreatedAt()) + 1;

        // 목록에서 1위, 2위로 보이므로 순위도 1, 2 여야 한다
        assertThat(firstRank).isEqualTo(1);
        assertThat(laterRank).isEqualTo(2);
    }

    @Test
    @DisplayName("순위 계산 결과가 랭킹 목록의 실제 순서와 어긋나지 않는다")
    void 순위와_목록_일치() {
        save("A", 1000);
        save("B", 1000);
        save("C", 1000);
        save("D", 2000);

        List<Score> list = scoreRepository.findTopRankings(PageRequest.of(0, 10));

        for (int i = 0; i < list.size(); i++) {
            Score s = list.get(i);
            long rank = scoreRepository.countHigherRankThan(s.getScore(), s.getCreatedAt()) + 1;
            assertThat(rank)
                    .as("%s 는 목록에서 %d번째인데 계산된 순위는 %d", s.getNickname(), i + 1, rank)
                    .isEqualTo(i + 1);
        }
    }

    @Test
    @DisplayName("신기록 판정 — 기록이 없으면 0을 반환한다")
    void 최고점수_조회() {
        save("대영", 1000);
        save("대영", 2500);
        save("은우", 9999);

        assertThat(scoreRepository.findBestScoreByNickname("대영")).isEqualTo(2500);
        assertThat(scoreRepository.findBestScoreByNickname("없는사람")).isZero();
    }
}
