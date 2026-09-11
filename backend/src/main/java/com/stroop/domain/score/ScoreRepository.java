// 👤 담당: 노대영 — 점수 조회/집계 쿼리
package com.stroop.domain.score;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {

    /** 상위 랭킹 (점수 내림차순, 동점이면 먼저 등록한 사람이 위) */
    @Query("SELECT s FROM Score s ORDER BY s.score DESC, s.createdAt ASC")
    List<Score> findTopRankings(Pageable pageable);

    /** 해당 점수보다 높은 기록의 수 → +1 하면 내 순위 */
    @Query("SELECT COUNT(s) FROM Score s WHERE s.score > :score")
    long countHigherThan(@Param("score") int score);

    /** 같은 닉네임의 최고 점수 (신기록 판정용) */
    @Query("SELECT COALESCE(MAX(s.score), 0) FROM Score s WHERE s.nickname = :nickname")
    int findBestScoreByNickname(@Param("nickname") String nickname);
}
