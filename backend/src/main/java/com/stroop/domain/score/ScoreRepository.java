// 👤 담당: 노대영 — 점수 조회/집계 쿼리
package com.stroop.domain.score;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {

    /**
     * 상위 랭킹.
     * 정렬 기준: 점수 내림차순 → 동점이면 먼저 등록한 사람이 위.
     * 이 정렬 규칙은 {@link #countHigherRankThan} 과 반드시 같아야 한다.
     */
    @Query("SELECT s FROM Score s ORDER BY s.score DESC, s.createdAt ASC")
    List<Score> findTopRankings(Pageable pageable);

    /**
     * 나보다 상위에 있는 기록의 수. +1 하면 내 순위.
     *
     * <p>동점자는 먼저 등록한 사람이 위이므로,
     * "더 높은 점수" + "같은 점수 중 나보다 먼저 등록된 것" 을 함께 센다.
     * {@link #findTopRankings} 의 정렬과 동일한 규칙이다.
     */
    @Query("""
            SELECT COUNT(s) FROM Score s
            WHERE s.score > :score
               OR (s.score = :score AND s.createdAt < :createdAt)
            """)
    long countHigherRankThan(@Param("score") int score,
                             @Param("createdAt") LocalDateTime createdAt);

    /**
     * 같은 닉네임의 최고 점수 (신기록 판정용).
     * 기록이 없으면 0.
     */
    @Query("SELECT COALESCE(MAX(s.score), 0) FROM Score s WHERE s.nickname = :nickname")
    int findBestScoreByNickname(@Param("nickname") String nickname);

    /**
     * 해당 점수보다 높은 기록의 수.
     *
     * @deprecated 동점 처리가 빠져 있어 랭킹 목록의 순위와 어긋난다.
     *             (같은 점수인 사람들이 모두 같은 순위를 받는다)
     *             {@link #countHigherRankThan} 를 사용할 것.
     *             기존 호출부 전환이 끝나면 제거한다. → 이슈 참고
     */
    @Deprecated(forRemoval = true)
    @Query("SELECT COUNT(s) FROM Score s WHERE s.score > :score")
    long countHigherThan(@Param("score") int score);
}
