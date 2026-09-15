// 👤 담당: 고은우 — docs/API.md 와 필드명이 정확히 일치해야 합니다.
package com.stroop.api.score;

import jakarta.validation.constraints.*;

/** 허용 범위는 docs/GAME_RULES.md "서버 검증" 참고. 벗어나면 400 */
public record ScoreSubmitRequest(
        @NotBlank @Size(min = 1, max = 10) @Pattern(regexp = ScoreRules.NICKNAME_PATTERN) String nickname,
        @PositiveOrZero @Max(ScoreRules.MAX_SCORE) int score,
        @PositiveOrZero int maxCombo,
        @PositiveOrZero int correctCount,
        @PositiveOrZero @Max(ScoreRules.MAX_WRONG_COUNT) int wrongCount,
        @PositiveOrZero @Max(ScoreRules.MAX_PLAY_TIME_MS) long playTimeMs
) {}
