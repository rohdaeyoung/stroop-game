# 👤 담당: 노대영 — Render Web Service 배포용
#
# 빌드와 실행을 분리해 최종 이미지를 가볍게 유지합니다.

# ── 1단계: 빌드
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# 의존성 먼저 받아두면 소스만 바뀔 때 이 층을 재사용합니다
COPY gradle gradle
COPY gradlew build.gradle settings.gradle ./
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true

COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# ── 2단계: 실행
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

# Render 가 PORT 환경변수로 포트를 지정합니다
ENV PORT=8080
EXPOSE 8080

# 컨테이너 메모리에 맞춰 힙을 잡습니다 (Render 무료 플랜 512MB)
ENTRYPOINT ["sh", "-c", "java -XX:MaxRAMPercentage=70 -Dserver.port=${PORT} -jar app.jar"]
