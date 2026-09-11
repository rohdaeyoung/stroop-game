// 👤 담당: 고은우 — docs/API.md 와 필드명이 정확히 일치해야 합니다.
package com.stroop.api.score;

import jakarta.validation.constraints.*;

public record ScoreSubmitRequest(
        @NotBlank @Size(min = 1, max = 10) String nickname,
        @PositiveOrZero int score,
        @PositiveOrZero int maxCombo,
        @PositiveOrZero int correctCount,
        @PositiveOrZero int wrongCount,
        @PositiveOrZero long playTimeMs
) {}
