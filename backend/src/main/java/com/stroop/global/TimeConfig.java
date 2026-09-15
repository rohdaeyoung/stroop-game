// 👤 담당: 고은우
package com.stroop.global;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.Clock;

/**
 * 시각과 주기 작업 설정.
 * 만료 시각을 다루는 코드는 LocalDateTime.now() 대신 이 Clock 을 주입받는다.
 * 테스트에서 시간을 직접 움직여 "5분 뒤" 를 기다리지 않고 확인할 수 있다.
 */
@Configuration
@EnableScheduling
public class TimeConfig {

    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }
}
