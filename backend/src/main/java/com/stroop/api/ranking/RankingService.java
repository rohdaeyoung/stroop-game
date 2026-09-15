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

    /** 한 번에 내려줄 수 있는 최대 개수. docs/API.md 참고 */
    private static final int MAX_LIMIT = 100;

    private final ScoreRepository scoreRepository;

    public RankingListResponse getTopRankings(int limit) {
        // limit=0 이면 PageRequest 가 예외를 던져 500 이 나간다. 잘못된 요청은 400 으로 알려준다.
        if (limit < 1 || limit > MAX_LIMIT) {
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        List<Score> scores = scoreRepository.findTopRankings(PageRequest.of(0, limit));

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

        // 랭킹 목록과 같은 기준(점수 → 먼저 등록 → id)으로 세야 동점자 순위가 목록과 일치한다
        long rank = scoreRepository.countHigherRankThan(
                score.getScore(), score.getCreatedAt(), score.getId()) + 1;
        long total = scoreRepository.count();
        double percentile = total == 0 ? 100.0 : Math.round(rank * 1000.0 / total) / 10.0;

        return new MyRankResponse(rank, total, percentile);
    }
}
