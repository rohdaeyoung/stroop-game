// 👤 담당: 노대영 — 점수 엔티티
package com.stroop.domain.score;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "score",
        indexes = {
                // 랭킹 조회 전용 복합 인덱스.
                // findTopRankings / countHigherRankThan 이 쓰는 정렬(점수 내림차순 → 등록 빠른 순)과
                // 컬럼 순서가 같아야 인덱스를 탄다.
                @Index(name = "idx_score_ranking", columnList = "score DESC, created_at ASC"),
                // findBestScoreByNickname (신기록 판정) 용
                @Index(name = "idx_score_nickname", columnList = "nickname")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String nickname;

    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private int maxCombo;

    @Column(nullable = false)
    private int correctCount;

    @Column(nullable = false)
    private int wrongCount;

    @Column(nullable = false)
    private long playTimeMs;

    /**
     * 동점자 순위를 가르는 기준이라 정밀도가 중요하다.
     * 초 단위면 같은 초에 제출한 기록들의 순서를 가릴 수 없으므로
     * DB 컬럼은 DATETIME(6) 으로 둔다. (db/schema.sql 참고)
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private Score(String nickname, int score, int maxCombo,
                  int correctCount, int wrongCount, long playTimeMs,
                  LocalDateTime createdAt) {
        this.nickname = nickname;
        this.score = score;
        this.maxCombo = maxCombo;
        this.correctCount = correctCount;
        this.wrongCount = wrongCount;
        this.playTimeMs = playTimeMs;
        this.createdAt = createdAt;
    }

    /**
     * 등록 시각은 서버가 정한다.
     * 다만 순위 계산 테스트가 실행 속도에 좌우되면 안 되므로,
     * 값이 미리 지정된 경우에는 그대로 둔다. (테스트에서만 사용)
     */
    @PrePersist
    void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
