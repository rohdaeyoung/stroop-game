-- 👤 담당: 노대영 — 참고용 DDL (실제로는 JPA ddl-auto가 생성)
CREATE DATABASE IF NOT EXISTS stroop
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE stroop;

CREATE TABLE IF NOT EXISTS score (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    nickname      VARCHAR(10)  NOT NULL,
    score         INT          NOT NULL,
    max_combo     INT          NOT NULL,
    correct_count INT          NOT NULL,
    wrong_count   INT          NOT NULL,
    play_time_ms  BIGINT       NOT NULL,
    created_at    DATETIME     NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_score_desc (score DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
