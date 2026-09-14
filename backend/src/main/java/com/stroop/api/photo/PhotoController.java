// 👤 담당: 고은우
package com.stroop.api.photo;

import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 인증샷 임시 보관.
 * 태블릿이 사진을 올리고, 참가자는 QR 로 연 주소에서 휴대폰으로 받아간다.
 */
@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;

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
}
