// 👤 담당: 고은우 — docs/GAME_RULES.md 의 "서버 검증" 표와 같은 값을 유지합니다.
package com.stroop.api.score;

/**
 * 점수 제출 요청의 허용 범위.
 * 조작 방지가 아니라 앱 버그로 이상한 값이 저장되는 것을 막는 안전망이다.
 * 값을 바꾸면 docs/GAME_RULES.md 와 ScoreControllerTest 의 검증 케이스도 같은 PR 에서 바꾼다.
 */
final class ScoreRules {

    /**
     * 닉네임은 한글·영문·숫자만. 공백·특수문자·이모지는 거부한다. (Figma 06 닉네임 입력)
     * 공개 랭킹에 그대로 노출되는 값이다. 자음·모음만 쓴 닉네임(ㅋㅋ)은 받지 않는다.
     * FE 닉네임 입력(features/onboarding/nicknameStorage.js)과 같은 규칙이어야 한다.
     */
    static final String NICKNAME_PATTERN = "^[가-힣a-zA-Z0-9]+$";

    /** 비정상 점수 차단 */
    static final long MAX_SCORE = 300_000;

    /** 오답 3회에서 게임 오버 */
    static final long MAX_WRONG_COUNT = 3;

    /** 30초 게임 + 여유 10초 */
    static final long MAX_PLAY_TIME_MS = 40_000;

    private ScoreRules() {
    }
}
