// 👤 담당: 노대영 — 점수 엔티티
package com.stroop.domain.score;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "score", indexes = @Index(name = "idx_score_desc", columnList = "score DESC"))
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
