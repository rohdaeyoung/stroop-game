// 👤 담당: 고은우
package com.stroop.global;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 서버가 떠 있는지만 알려준다. Render 헬스 체크와, 부스 운영 전에 잠든 서버를 깨울 때 쓴다.
 *
 * <p>DB 연결은 확인하지 않는다. TiDB Serverless 는 유휴 연결을 끊기 때문에
 * 헬스 체크가 DB 에 의존하면 잠깐의 연결 끊김에도 Render 가 서버를 재시작시킬 수 있다.
 */
@RestController
public class HealthController {

    public record HealthResponse(String status) {}

    private static final HealthResponse UP = new HealthResponse("UP");

    @GetMapping("/api/health")
    public HealthResponse health() {
        return UP;
    }
}
