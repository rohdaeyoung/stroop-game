// 👤 담당: 고은우
package com.stroop.api.score;

import com.stroop.domain.score.Score;
import com.stroop.domain.score.ScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ScoreService {

    private final ScoreRepository scoreRepository;

    @Transactional
    public ScoreSubmitResponse submit(ScoreSubmitRequest request) {
        int previousBest = scoreRepository.findBestScoreByNickname(request.nickname());

        Score saved = scoreRepository.save(Score.builder()
                .nickname(request.nickname())
                .score(request.score())
                .maxCombo(request.maxCombo())
                .correctCount(request.correctCount())
                .wrongCount(request.wrongCount())
                .playTimeMs(request.playTimeMs())
                .build());

        // 랭킹 목록과 같은 기준(점수 → 먼저 등록 → id)으로 세야 동점자 순위가 목록과 일치한다
        long rank = scoreRepository.countHigherRankThan(
                saved.getScore(), saved.getCreatedAt(), saved.getId()) + 1;

        return new ScoreSubmitResponse(saved.getId(), rank, request.score() > previousBest);
    }
}
