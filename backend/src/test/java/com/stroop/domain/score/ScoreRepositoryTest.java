// 👤 담당: 노대영 — 랭킹 쿼리가 정렬 규칙과 일치하는지 검증
//
// 등록 시각을 명시적으로 지정한다.
// LocalDateTime.now() 에 맡기면 실행 속도에 따라 시각이 같아지거나 달라져
// 테스트 결과가 환경마다 달라진다. (실제로 CI 에서 깨졌다)
package com.stroop.domain.score;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ScoreRepositoryTest {

    private static final LocalDateTime BASE =
            LocalDateTime.of(2026, 9, 13, 12, 0, 0);

    @Autowired
    private ScoreRepository scoreRepository;

    /** 등록 시각을 직접 지정해 저장한다. */
    private Score save(String nickname, int score, LocalDateTime createdAt) {
        return scoreRepository.saveAndFlush(Score.builder()
                .nickname(nickname)
                .score(score)
                .maxCombo(10)
                .correctCount(20)
                .wrongCount(1)
                .playTimeMs(60_000)
                .createdAt(createdAt)
                .build());
    }

    /** 내 순위 = 나보다 위에 있는 기록 수 + 1 */
    private long rankOf(Score s) {
        return scoreRepository.countHigherRankThan(s.getScore(), s.getCreatedAt(), s.getId()) + 1;
    }

    @Test
    @DisplayName("등록 시각을 지정하지 않으면 서버 시각으로 채워진다")
    void 등록시각_기본값() {
        LocalDateTime before = LocalDateTime.now();

        Score saved = scoreRepository.saveAndFlush(Score.builder()
                .nickname("대영").score(1000).maxCombo(5)
                .correctCount(10).wrongCount(0).playTimeMs(30_000)
                .build());

        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getCreatedAt()).isAfterOrEqualTo(before);
    }

    @Test
    @DisplayName("랭킹 목록은 점수 내림차순으로 정렬된다")
    void 랭킹_정렬() {
        save("민서", 1000, BASE);
        save("혜원", 3000, BASE.plusSeconds(1));
        save("복순", 2000, BASE.plusSeconds(2));

        List<Score> result = scoreRepository.findTopRankings(PageRequest.of(0, 10));

        assertThat(result).extracting(Score::getNickname)
                .containsExactly("혜원", "복순", "민서");
    }

    @Test
    @DisplayName("동점이면 먼저 등록한 사람이 위에 온다")
    void 동점_정렬() {
        save("나중", 1000, BASE.plusSeconds(10));
        save("먼저", 1000, BASE);

        List<Score> result = scoreRepository.findTopRankings(PageRequest.of(0, 10));

        assertThat(result).extracting(Score::getNickname)
                .containsExactly("먼저", "나중");
    }

    @Test
    @DisplayName("동점자의 순위가 서로 달라야 한다 — 랭킹 목록의 순서와 일치")
    void 동점_순위_계산() {
        Score first = save("먼저", 1000, BASE);
        Score later = save("나중", 1000, BASE.plusSeconds(10));
        save("아래", 500, BASE.plusSeconds(20));

        assertThat(rankOf(first)).isEqualTo(1);
        assertThat(rankOf(later)).isEqualTo(2);
    }

    @Test
    @DisplayName("등록 시각이 완전히 같아도 순위가 겹치지 않는다")
    void 동일시각_순위_계산() {
        // 같은 초에 동시에 제출되면 실제로 이런 값이 저장된다.
        save("A", 1000, BASE);
        save("B", 1000, BASE);
        save("C", 1000, BASE);

        List<Score> list = scoreRepository.findTopRankings(PageRequest.of(0, 10));

        assertThat(list.stream().map(this::rankOf))
                .containsExactly(1L, 2L, 3L);
    }

    @Test
    @DisplayName("순위 계산 결과가 랭킹 목록의 실제 순서와 항상 일치한다")
    void 순위와_목록_일치() {
        save("A", 1000, BASE);                  // 동점 + 동일 시각
        save("B", 1000, BASE);
        save("C", 1000, BASE.plusSeconds(5));   // 동점 + 다른 시각
        save("D", 2000, BASE.plusSeconds(9));   // 최고점
        save("E", 500, BASE);                   // 최저점

        List<Score> list = scoreRepository.findTopRankings(PageRequest.of(0, 10));

        for (int i = 0; i < list.size(); i++) {
            Score s = list.get(i);
            assertThat(rankOf(s))
                    .as("%s 는 목록에서 %d번째", s.getNickname(), i + 1)
                    .isEqualTo(i + 1);
        }
    }

    @Test
    @DisplayName("신기록 판정 — 기록이 없으면 0을 반환한다")
    void 최고점수_조회() {
        save("대영", 1000, BASE);
        save("대영", 2500, BASE.plusSeconds(1));
        save("은우", 9999, BASE.plusSeconds(2));

        assertThat(scoreRepository.findBestScoreByNickname("대영")).isEqualTo(2500);
        assertThat(scoreRepository.findBestScoreByNickname("없는사람")).isZero();
    }
}
