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

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private Score(String nickname, int score, int maxCombo,
                  int correctCount, int wrongCount, long playTimeMs) {
        this.nickname = nickname;
        this.score = score;
        this.maxCombo = maxCombo;
        this.correctCount = correctCount;
        this.wrongCount = wrongCount;
        this.playTimeMs = playTimeMs;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
