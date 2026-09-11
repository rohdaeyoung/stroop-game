// 👤 담당: 고은우
package com.stroop.api.ranking;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @GetMapping
    public RankingListResponse getRankings(@RequestParam(defaultValue = "10") int limit) {
        return rankingService.getTopRankings(limit);
    }

    @GetMapping("/me")
    public MyRankResponse getMyRank(@RequestParam Long scoreId) {
        return rankingService.getMyRank(scoreId);
    }
}
