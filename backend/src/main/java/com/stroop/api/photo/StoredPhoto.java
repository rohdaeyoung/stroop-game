// 👤 담당: 고은우
package com.stroop.api.photo;

import java.time.Instant;

/**
 * 임시 보관 중인 사진 한 장.
 *
 * @param token       다운로드 주소에 쓰는 추측 불가능한 값
 * @param bytes       이미지 원본 (JPEG 또는 PNG)
 * @param contentType 파일 앞 바이트로 판별한 형식. 클라이언트가 보낸 값은 믿지 않는다
 * @param expiresAt   이 시각부터는 조회되지 않는다
 */
public record StoredPhoto(String token, byte[] bytes, String contentType, Instant expiresAt) {

    public StoredPhoto {
        // 밖에서 넘긴 배열을 나중에 고쳐도 보관 중인 사진이 바뀌지 않게 복사해 둔다
        bytes = bytes.clone();
    }

    boolean isExpiredAt(Instant now) {
        return !now.isBefore(expiresAt);
    }
}
