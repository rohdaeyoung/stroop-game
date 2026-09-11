// 👤 담당: 고은우
package com.stroop.api.ranking;

import com.stroop.domain.score.Score;
import com.stroop.domain.score.ScoreRepository;
import com.stroop.global.ApiException;
import com.stroop.global.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RankingService {

    private final ScoreRepository scoreRepository;

    public RankingListResponse getTopRankings(int limit) {
        List<Score> scores = scoreRepository.findTopRankings(PageRequest.of(0, Math.min(limit, 100)));

        List<RankingItem> items = IntStream.range(0, scores.size())
                .mapToObj(i -> {
                    Score s = scores.get(i);
                    return new RankingItem(i + 1, s.getNickname(), s.getScore(),
                            s.getMaxCombo(), s.getCreatedAt());
                })
                .toList();

        return new RankingListResponse(items);
    }

    public MyRankResponse getMyRank(Long scoreId) {
        Score score = scoreRepository.findById(scoreId)
                .orElseThrow(() -> new ApiException(ErrorCode.SCORE_NOT_FOUND));

        long rank = scoreRepository.countHigherThan(score.getScore()) + 1;
        long total = scoreRepository.count();
        double percentile = total == 0 ? 100.0 : Math.round(rank * 1000.0 / total) / 10.0;

        return new MyRankResponse(rank, total, percentile);
    }
}
