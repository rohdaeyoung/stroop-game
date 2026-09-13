-- 👤 담당: 노대영
-- 참고용 DDL. 실제 테이블은 JPA(ddl-auto)가 생성하지만,
-- TiDB Cloud 콘솔에서 직접 만들 때는 이 파일을 쓴다.
--
-- ⚠️ 이 파일은 db/ 하위에 둔다. classpath 루트에 schema.sql 이 있으면
--    Spring Boot 가 기동/테스트 시 자동 실행해서 H2 테스트가 깨진다.
--
-- ⚠️ 인덱스는 Score.java 의 @Index 정의와 반드시 같아야 한다.
--    한쪽만 바꾸면 로컬과 운영의 쿼리 성능이 달라진다.

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
    -- 동점자 순위를 가르는 기준. 초 단위면 같은 초 제출을 구분할 수 없다.
    created_at    DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),

    -- 랭킹 조회용 복합 인덱스.
    -- 정렬이 "점수 내림차순 → 등록 빠른 순" 이므로 컬럼 순서가 중요하다.
    INDEX idx_score_ranking (score DESC, created_at ASC),

    -- 신기록 판정(같은 닉네임의 최고 점수)용
    INDEX idx_score_nickname (nickname)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
-- TiDB Cloud 사용 시 주의 (배포 담당자가 읽을 것)
-- ─────────────────────────────────────────────────────────────
--
-- 1. id 가 1,2,3 으로 연속되지 않는다.
--    TiDB 는 노드별로 AUTO_INCREMENT 구간을 미리 나눠 갖기 때문에 값이 크게 튄다.
--    → id 를 "몇 번째 기록인지" 세는 용도로 쓰면 안 된다.
--      순위는 score / created_at 기준으로 계산한다. (ScoreRepository 참고)
--      id 는 "점수도 시각도 완전히 같을 때" 순서를 확정하기 위한 최종 기준으로만 쓴다.
--      이 경우 어느 쪽이 앞서든 무방하며, 목록 정렬과 순위 계산이 같은 기준을
--      쓰는 것만이 중요하다.
--
-- 2. ENGINE = InnoDB 는 무시된다.
--    TiDB 가 구문만 받아들이고 실제로는 자체 스토리지를 쓴다. 오류는 나지 않는다.
--
-- 3. 연결에 TLS 가 필수다.
--    JDBC URL 에 useSSL=true&requireSSL=true 가 없으면 접속이 거부된다.
--
-- 4. FOREIGN KEY 지원이 제한적이다.
--    지금은 테이블이 score 하나뿐이라 무관하지만,
--    나중에 테이블을 추가할 때는 제약 동작을 먼저 확인할 것.
