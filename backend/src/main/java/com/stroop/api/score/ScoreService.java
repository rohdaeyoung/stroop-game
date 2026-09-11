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

        long rank = scoreRepository.countHigherThan(saved.getScore()) + 1;

        return new ScoreSubmitResponse(saved.getId(), rank, request.score() > previousBest);
    }
}
