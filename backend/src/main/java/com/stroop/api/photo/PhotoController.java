// 👤 담당: 고은우
package com.stroop.api.photo;

import com.stroop.global.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Clock;
import java.time.Duration;

/**
 * 인증샷 임시 보관.
 * 태블릿이 사진을 올리고, 참가자는 QR 로 연 주소에서 휴대폰으로 받아간다.
 */
@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;
    private final Clock clock;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoUploadResponse> upload(@RequestParam("photo") MultipartFile photo) {
        return ResponseEntity.status(HttpStatus.CREATED).body(photoService.upload(photo));
    }

    @GetMapping("/{token}")
    public ResponseEntity<byte[]> download(@PathVariable String token) {
        StoredPhoto photo = photoService.download(token);
        String extension = "image/png".equals(photo.contentType()) ? "png" : "jpg";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(photo.contentType()))
                // 휴대폰 브라우저에서 사진이 바로 열리고, 길게 눌러 저장할 수 있게 inline 으로 보낸다
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename("eoheung-shot." + extension).build().toString())
                // 얼굴 사진이라 중간 캐시나 브라우저 캐시에 남기지 않는다
                .cacheControl(CacheControl.noStore())
                .header("X-Content-Type-Options", "nosniff")
                .body(photo.bytes());
    }

    /**
     * QR 이 여는 주소를 이 엔드포인트로 바꾸면, 참가자 휴대폰에 이미지 파일 하나만 뜨는 대신
     * "사진 저장하기" 안내가 있는 꾸며진 화면이 뜬다. {@link #download} 는 이 화면의
     * {@code <img>} src 로 그대로 쓰인다 — 원본 이미지 응답은 계속 필요하다.
     */
    @GetMapping(value = "/{token}/view", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> view(@PathVariable String token) {
        try {
            StoredPhoto photo = photoService.download(token);
            long remainSeconds = Math.max(0, Duration.between(clock.instant(), photo.expiresAt()).getSeconds());
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.noStore())
                    .body(PhotoViewPage.success(token, remainSeconds));
        } catch (ApiException e) {
            return ResponseEntity.status(e.getErrorCode().getStatus())
                    .cacheControl(CacheControl.noStore())
                    .body(PhotoViewPage.expired());
        }
    }
}
