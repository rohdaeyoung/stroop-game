// 👤 담당: 고은우
package com.stroop.api.ranking;

import java.time.LocalDateTime;

public record RankingItem(int rank, String nickname, int score,
                          int maxCombo, LocalDateTime createdAt) {}
