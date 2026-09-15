// 👤 담당: 고은우
package com.stroop.api.photo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * 인증샷을 서버 메모리에 잠깐 보관한다.
 *
 * <p>DB 에 저장하지 않는다. 참가자가 QR 로 휴대폰에 받아갈 시간(5분)만 보관하고 지운다.
 * 서버가 재시작되면 보관 중이던 사진도 사라지는데, 5분짜리 임시 보관이라 괜찮다고 판단했다.
 *
 * <p>Render 무료 플랜의 메모리가 512MB 라 동시에 보관하는 개수에 상한을 둔다.
 * 부스에서는 1~2분에 한 명꼴이라 5분 동안 몇 장 쌓이지 않는다.
 */
@Component
public class PhotoStore {

    private static final Logger log = LoggerFactory.getLogger(PhotoStore.class);

    /** QR 화면의 "5분 후 자동으로 만료" 와 같아야 한다 */
    static final Duration TTL = Duration.ofMinutes(5);

    /** 사진 한 장 최대 1MB 기준 최대 약 30MB */
    static final int MAX_PHOTOS = 30;

    private final Clock clock;

    /** 넣은 순서를 유지해 상한을 넘으면 가장 오래된 사진부터 지운다 */
    private final LinkedHashMap<String, StoredPhoto> photos = new LinkedHashMap<>();

    public PhotoStore(Clock clock) {
        this.clock = clock;
    }

    public synchronized StoredPhoto save(byte[] bytes, String contentType) {
        purgeExpired();
        evictOldestIfFull();

        StoredPhoto photo = new StoredPhoto(
                UUID.randomUUID().toString(), bytes, contentType, clock.instant().plus(TTL));
        photos.put(photo.token(), photo);
        return photo;
    }

    public synchronized Optional<StoredPhoto> find(String token) {
        StoredPhoto photo = photos.get(token);
        if (photo == null) {
            return Optional.empty();
        }
        if (photo.isExpiredAt(clock.instant())) {
            photos.remove(token);
            return Optional.empty();
        }
        return Optional.of(photo);
    }

    /** 만료된 사진을 실제로 메모리에서 지운다. 조회가 없어도 5분 뒤에는 사라지게 하기 위함 */
    @Scheduled(fixedDelay = 30_000)
    public synchronized void purgeExpired() {
        Instant now = clock.instant();
        photos.values().removeIf(photo -> photo.isExpiredAt(now));
    }

    synchronized int size() {
        return photos.size();
    }

    private void evictOldestIfFull() {
        while (photos.size() >= MAX_PHOTOS) {
            Map.Entry<String, StoredPhoto> oldest = photos.entrySet().iterator().next();
            photos.remove(oldest.getKey());
            log.warn("사진 보관 개수 상한({}) 도달 — 만료 전 사진을 지웠습니다", MAX_PHOTOS);
        }
    }
}
