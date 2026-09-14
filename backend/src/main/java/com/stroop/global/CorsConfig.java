// 👤 담당: 고은우
package com.stroop.global;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

/**
 * 프론트 주소에서 API 를 호출할 수 있게 허용한다.
 *
 * <p>허용 주소는 환경변수 {@code CORS_ORIGIN} 으로 받는다. 쉼표로 여러 개를 줄 수 있다.
 * 설정하지 않으면 로컬 개발 주소(http://localhost:5173)만 허용한다.
 *
 * <pre>
 * CORS_ORIGIN = https://stroop.onrender.com
 * CORS_ORIGIN = https://stroop.onrender.com,http://localhost:5173
 * </pre>
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(CorsConfig.class);

    static final String DEFAULT_ORIGIN = "http://localhost:5173";

    /** 브라우저가 사전 요청(OPTIONS) 결과를 기억하는 시간. 콜드 스타트 중 요청 수를 줄인다 */
    private static final long PREFLIGHT_CACHE_SECONDS = 3600;

    private final List<String> allowedOrigins;

    public CorsConfig(@Value("${CORS_ORIGIN:" + DEFAULT_ORIGIN + "}") String corsOrigin) {
        this.allowedOrigins = parseOrigins(corsOrigin);
        log.info("CORS 허용 주소: {}", allowedOrigins);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .maxAge(PREFLIGHT_CACHE_SECONDS);
    }

    /**
     * 쉼표로 구분된 주소 목록을 정리한다.
     * 끝의 "/" 는 지운다 — 브라우저가 보내는 Origin 에는 "/" 가 없어서, 붙어 있으면 절대 일치하지 않는다.
     */
    static List<String> parseOrigins(String raw) {
        List<String> origins = Arrays.stream(raw == null ? new String[0] : raw.split(","))
                .map(String::trim)
                .map(origin -> origin.endsWith("/") ? origin.substring(0, origin.length() - 1) : origin)
                .filter(origin -> !origin.isEmpty())
                .toList();
        return origins.isEmpty() ? List.of(DEFAULT_ORIGIN) : origins;
    }
}
