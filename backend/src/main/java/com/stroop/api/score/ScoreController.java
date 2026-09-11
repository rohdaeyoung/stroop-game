// 👤 담당: 고은우
package com.stroop.api.score;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService scoreService;

    @PostMapping
    public ResponseEntity<ScoreSubmitResponse> submit(@Valid @RequestBody ScoreSubmitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scoreService.submit(request));
    }
}
