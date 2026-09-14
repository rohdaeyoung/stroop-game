// 👤 담당: 고은우 — docs/API.md 와 필드명이 정확히 일치해야 합니다.
package com.stroop.api.photo;

import java.time.Instant;

/**
 * @param token            다운로드 주소 {@code GET /api/photos/{token}} 에 쓰는 값
 * @param expiresAt        만료 시각 (UTC, ISO-8601)
 * @param expiresInSeconds 만료까지 남은 초. 태블릿 시계가 틀려도 카운트다운이 맞도록 함께 준다
 */
public record PhotoUploadResponse(String token, Instant expiresAt, long expiresInSeconds) {}
