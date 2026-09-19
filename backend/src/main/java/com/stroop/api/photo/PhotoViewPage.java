// 👤 담당: 고은우
package com.stroop.api.photo;

/**
 * 참가자가 QR 을 스캔했을 때 뜨는 사진 확인 화면.
 *
 * <p>프론트 배포 없이 백엔드가 바로 HTML 을 렌더링한다. 프론트의 색·폰트·글로우 배경을
 * (frontend/src/design/tokens/tokens.css, features/ranking/Ranking.css) 그대로 하드코딩해서
 * 맞췄다 — 두 저장소가 CSS 변수를 공유하지 않으니, 프론트 테마가 바뀌면 여기도 손으로 맞춰야 한다.
 */
final class PhotoViewPage {

    private PhotoViewPage() {}

    static String success(String token, long remainSeconds) {
        String imageUrl = "/api/photos/" + token;
        String body = """
                <main class="wrap">
                  <p class="brand">LIKELION SKU</p>
                  <h1>어흥샷이 도착했어요!</h1>
                  <p class="sub">사진을 길게 눌러서 저장하세요</p>

                  <div class="card" id="card">
                    <img src="__IMAGE_URL__" alt="촬영된 인증샷" />
                  </div>

                  <a class="cta" id="cta" href="__IMAGE_URL__" download="eoheung-shot.jpg">사진 저장하기 ↓</a>

                  <p class="timer" id="timer">__REMAIN_LABEL__ 뒤에 사라져요</p>
                  <p class="caption">사진은 5분 뒤 서버에서 자동으로 지워집니다</p>
                </main>
                <script>
                  (function () {
                    var remain = __REMAIN_SECONDS__;
                    var timerEl = document.getElementById('timer');
                    function fmt(total) {
                      var m = Math.floor(total / 60);
                      var s = total - m * 60;
                      return m + ':' + (s < 10 ? '0' + s : s);
                    }
                    var timerId = setInterval(function () {
                      remain -= 1;
                      if (remain <= 0) {
                        clearInterval(timerId);
                        document.getElementById('card').innerHTML =
                          '<p class="placeholder">보관 시간이 끝났어요<br><span>사진은 안전하게 지워졌습니다</span></p>';
                        document.getElementById('cta').remove();
                        timerEl.remove();
                        return;
                      }
                      timerEl.textContent = fmt(remain) + ' 뒤에 사라져요';
                    }, 1000);
                  })();
                </script>
                """
                .replace("__IMAGE_URL__", imageUrl)
                .replace("__REMAIN_LABEL__", formatRemain(remainSeconds))
                .replace("__REMAIN_SECONDS__", String.valueOf(remainSeconds));

        return page("어흥샷이 도착했어요", body);
    }

    static String expired() {
        String body = """
                <main class="wrap">
                  <p class="brand">LIKELION SKU</p>
                  <h1>사진을 찾을 수 없어요</h1>
                  <p class="sub">보관 시간(5분)이 지났거나 잘못된 주소예요</p>

                  <div class="card">
                    <p class="placeholder">보관 시간이 끝났어요<br><span>사진은 안전하게 지워졌습니다</span></p>
                  </div>
                </main>
                """;
        return page("사진을 찾을 수 없어요", body);
    }

    private static String formatRemain(long totalSeconds) {
        long m = totalSeconds / 60;
        long s = totalSeconds % 60;
        return m + ":" + (s < 10 ? "0" + s : String.valueOf(s));
    }

    private static String page(String title, String body) {
        return """
                <!doctype html>
                <html lang="ko">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>__TITLE__ · 어흥! 색에 속지 마</title>
                <style>__CSS__</style>
                </head>
                __BODY__
                </html>
                """
                .replace("__TITLE__", title)
                .replace("__CSS__", CSS)
                .replace("__BODY__", "<body>" + body + "</body>");
    }

    // frontend/src/design/tokens/tokens.css · features/ranking/Ranking.css 의 qr__screen 과 같은 배경/카드/CTA
    private static final String CSS = """
            @import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@400;500;700;900&display=swap');
            * { box-sizing: border-box; }
            html, body { margin: 0; }
            body {
              min-height: 100vh;
              background: #0b0b19;
              color: #fff;
              font-family: 'Noto Sans KR', -apple-system, system-ui, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 32px 20px 48px;
              position: relative;
              overflow-x: hidden;
              text-align: center;
            }
            body::before, body::after {
              content: '';
              position: fixed;
              width: 60vw;
              height: 60vw;
              max-width: 420px;
              max-height: 420px;
              border-radius: 50%;
              filter: blur(60px);
              opacity: 0.55;
              pointer-events: none;
              z-index: 0;
            }
            body::before { left: -18vw; top: -18vw; background: radial-gradient(circle, #2ec770, transparent 72%); }
            body::after { right: -18vw; bottom: -18vw; background: radial-gradient(circle, #ff2e78, transparent 72%); }
            .wrap { position: relative; z-index: 1; max-width: 420px; width: 100%; }
            .brand { margin: 0 0 4px; color: #3b7afa; font-weight: 800; letter-spacing: 0.04em; font-size: 15px; }
            h1 {
              margin: 0 0 8px;
              font-family: 'Black Han Sans', 'Noto Sans KR', sans-serif;
              font-weight: 400;
              font-size: 30px;
            }
            .sub { margin: 0 0 24px; color: rgba(255, 255, 255, 0.6); font-size: 15px; }
            .card {
              background: #fff;
              border-radius: 20px;
              box-shadow: 0 16px 60px 0 rgba(0, 0, 0, 0.35);
              overflow: hidden;
              min-height: 120px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .card img { display: block; width: 100%; height: auto; }
            .placeholder { margin: 0; padding: 32px 20px; color: #0b0b19; font-weight: 700; font-size: 16px; line-height: 1.6; }
            .placeholder span { display: block; margin-top: 6px; font-size: 13px; font-weight: 600; color: #6b6b78; }
            .cta {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              margin-top: 20px;
              padding: 16px 32px;
              border-radius: 999px;
              background: #ff2e78;
              box-shadow: 0 8px 30px 0 rgba(255, 46, 120, 0.45);
              color: #fff;
              font-weight: 700;
              font-size: 17px;
              text-decoration: none;
            }
            .timer { margin: 16px 0 0; font-size: 15px; font-weight: 800; color: #ffc93d; }
            .caption { margin: 8px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.45); }
            """;
}
