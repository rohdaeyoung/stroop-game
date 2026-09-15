// 👤 담당: 고은우 — 5분 보관, 만료 후 삭제, 보관 개수 상한을 검증한다
package com.stroop.api.photo;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class PhotoStoreTest {

    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 1, 2, 3};

    /** 테스트에서 시간을 직접 움직이기 위한 시계 */
    static final class MovableClock extends Clock {
        private Instant now = Instant.parse("2026-10-01T12:00:00Z");

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public Instant instant() {
            return now;
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }
    }

    private MovableClock clock;
    private PhotoStore store;

    @BeforeEach
    void setUp() {
        clock = new MovableClock();
        store = new PhotoStore(clock);
    }

    @Test
    @DisplayName("저장한 사진을 토큰으로 다시 찾는다")
    void 저장_조회() {
        StoredPhoto saved = store.save(JPEG, "image/jpeg");

        assertThat(store.find(saved.token())).hasValueSatisfying(photo -> {
            assertThat(photo.bytes()).isEqualTo(JPEG);
            assertThat(photo.contentType()).isEqualTo("image/jpeg");
        });
    }

    @Test
    @DisplayName("만료 시각은 저장 시각 + 5분이다")
    void 만료_시각() {
        StoredPhoto saved = store.save(JPEG, "image/jpeg");

        assertThat(saved.expiresAt()).isEqualTo(clock.instant().plus(Duration.ofMinutes(5)));
    }

    @Test
    @DisplayName("4분 59초까지는 조회되고, 정확히 5분이 되면 조회되지 않는다")
    void 만료_경계() {
        StoredPhoto saved = store.save(JPEG, "image/jpeg");

        clock.advance(Duration.ofMinutes(4).plusSeconds(59));
        assertThat(store.find(saved.token())).isPresent();

        clock.advance(Duration.ofSeconds(1));
        assertThat(store.find(saved.token())).isEmpty();
    }

    @Test
    @DisplayName("조회가 없어도 주기 작업이 만료된 사진을 메모리에서 지운다")
    void 주기적_삭제() {
        store.save(JPEG, "image/jpeg");
        store.save(JPEG, "image/jpeg");

        clock.advance(Duration.ofMinutes(5));
        store.purgeExpired();

        assertThat(store.size()).isZero();
    }

    @Test
    @DisplayName("보관 개수 상한을 넘으면 가장 오래된 사진부터 지운다")
    void 상한_초과() {
        StoredPhoto oldest = store.save(JPEG, "image/jpeg");
        for (int i = 1; i < PhotoStore.MAX_PHOTOS; i++) {
            store.save(JPEG, "image/jpeg");
        }

        StoredPhoto newest = store.save(JPEG, "image/jpeg");

        assertThat(store.size()).isEqualTo(PhotoStore.MAX_PHOTOS);
        assertThat(store.find(oldest.token())).isEmpty();
        assertThat(store.find(newest.token())).isPresent();
    }

    @Test
    @DisplayName("토큰은 매번 다르다 — 순번이면 남의 사진을 받아갈 수 있다")
    void 토큰_중복_없음() {
        StoredPhoto first = store.save(JPEG, "image/jpeg");
        StoredPhoto second = store.save(JPEG, "image/jpeg");

        assertThat(first.token()).isNotEqualTo(second.token()).hasSize(36);
    }

    @Test
    @DisplayName("저장 후 원본 배열을 바꿔도 보관 중인 사진은 바뀌지 않는다")
    void 원본_변경_차단() {
        byte[] original = JPEG.clone();
        StoredPhoto saved = store.save(original, "image/jpeg");

        original[3] = 99;

        assertThat(store.find(saved.token()).orElseThrow().bytes()).isEqualTo(JPEG);
    }
}
