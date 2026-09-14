// 👤 담당: 고은우
package com.stroop.api.photo;

import com.stroop.global.ApiException;
import com.stroop.global.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Arrays;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PhotoService {

    /** Spring 의 기본 업로드 한도(1MB)와 같다. 늘리려면 application.yml 의 multipart 설정도 함께 바꿔야 한다 */
    static final long MAX_BYTES = 1024 * 1024;

    private static final byte[] JPEG_SIGNATURE = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] PNG_SIGNATURE = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n'};

    private final PhotoStore photoStore;

    public PhotoUploadResponse upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ApiException(ErrorCode.PHOTO_TOO_LARGE);
        }

        byte[] bytes = readBytes(file);
        String contentType = detectContentType(bytes)
                .orElseThrow(() -> new ApiException(ErrorCode.UNSUPPORTED_PHOTO_TYPE));

        StoredPhoto saved = photoStore.save(bytes, contentType);
        return new PhotoUploadResponse(saved.token(), saved.expiresAt(), PhotoStore.TTL.toSeconds());
    }

    public StoredPhoto download(String token) {
        return photoStore.find(token)
                .orElseThrow(() -> new ApiException(ErrorCode.PHOTO_NOT_FOUND));
    }

    /**
     * 파일 앞 바이트로 형식을 판별한다.
     * 클라이언트가 보낸 Content-Type 이나 파일 이름은 쉽게 바꿀 수 있어서 믿지 않는다.
     */
    static Optional<String> detectContentType(byte[] bytes) {
        if (startsWith(bytes, JPEG_SIGNATURE)) {
            return Optional.of("image/jpeg");
        }
        if (startsWith(bytes, PNG_SIGNATURE)) {
            return Optional.of("image/png");
        }
        return Optional.empty();
    }

    private static boolean startsWith(byte[] bytes, byte[] signature) {
        return bytes.length >= signature.length
                && Arrays.equals(bytes, 0, signature.length, signature, 0, signature.length);
    }

    private static byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException("업로드된 사진을 읽지 못했습니다", e);
        }
    }
}
