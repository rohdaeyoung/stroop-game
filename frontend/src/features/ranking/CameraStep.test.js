import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const cameraSource = readFileSync(new URL('./CameraStep.jsx', import.meta.url), 'utf8')
const rankingCss = readFileSync(new URL('./Ranking.css', import.meta.url), 'utf8')

test('새 Figma 프레임 설정만 사용한다', () => {
  assert.match(cameraSource, /import \{ CAMERA_FRAMES, composeFrame, getCameraFrame \} from ['"]\.\/cameraFrames\.js['"]/)
  assert.match(cameraSource, /useState\(['"]photomatic['"]\)/)
  assert.match(cameraSource, /CAMERA_FRAMES\.map/)
  assert.doesNotMatch(cameraSource, /camera-(?:frame|mask|preview)-(?:basic|dots|denim|stamp)/)
})

test('셔터는 한 번만 누르고 필요한 사진을 자동으로 연속 촬영한다', () => {
  assert.match(cameraSource, /const \[shots, setShots\] = useState\(\[\]\)/)
  assert.match(cameraSource, /selectedFrame\.slots\.length/)
  assert.match(cameraSource, /setCount\(COUNTDOWN_SECONDS\)/)
  assert.match(cameraSource, /setPhase\(['"]countdown['"]\)/)
  assert.match(cameraSource, /composeFrame\(canvas, selectedFrame, nextShots\)/)
  assert.equal((cameraSource.match(/onClick=\{startCountdown\}/g) ?? []).length, 1)
})

test('촬영 진행 장수와 남은 카운트다운을 안내한다', () => {
  assert.match(cameraSource, /촬영 중/)
  assert.match(cameraSource, /shots\.length \+ 1/)
  assert.match(cameraSource, /selectedFrame\.slots\.length/)
})

test('재촬영은 결과와 연속 촬영 상태를 모두 초기화한다', () => {
  assert.match(cameraSource, /setShots\(\[\]\)/)
  assert.match(cameraSource, /setPhoto\(null\)/)
  assert.match(cameraSource, /setCount\(COUNTDOWN_SECONDS\)/)
})

test('세 프레임용 다중 슬롯 미리보기와 CSS를 사용한다', () => {
  assert.match(cameraSource, /selectedFrame\.slots\.map/)
  assert.match(cameraSource, /camera__frame-slot/)
  assert.match(rankingCss, /\.camera__frame-canvas/)
  assert.match(rankingCss, /\.camera__frame-slot/)
  assert.doesNotMatch(rankingCss, /camera__frame-preview--denim/)
  assert.doesNotMatch(rankingCss, /--camera-mask/)
  assert.match(cameraSource, /transformOrigin:/)
})

test('프레임을 바꾸면 새 video 요소에 카메라 스트림을 다시 연결한다', () => {
  assert.match(cameraSource, /videoRef\.current\.srcObject = streamRef\.current/)
  assert.match(cameraSource, /phase !== ['"]live['"] && phase !== ['"]countdown['"]/)
  assert.match(cameraSource, /\[phase, shots\.length, frame\]/)
})

test('정상 촬영 상태에는 건너뛰기 버튼을 표시하지 않는다', () => {
  assert.match(cameraSource, /phase === ['"]error['"]\s*&&/)
  assert.match(cameraSource, />\s*건너뛰기\s*</)
})

test('최종 JPEG만 기존 다음 단계로 전달한다', () => {
  assert.match(cameraSource, /onNext\(photo\)/)
  assert.match(cameraSource, /촬영한 사진은 결과 화면과 함께 저장돼요/)
})

test('촬영 전후 프레임 비율과 크기를 동일하게 유지한다', () => {
  const photoRule = rankingCss.match(/\.camera__photo\s*\{[^}]+\}/s)?.[0] ?? ''
  assert.match(photoRule, /object-fit:\s*contain/)
  assert.match(photoRule, /background:\s*transparent/)
})

test('촬영 완료 후 프레임 선택을 숨기고 변경할 수 없게 한다', () => {
  assert.match(cameraSource, /camera__screen--captured/)
  assert.match(cameraSource, /aria-hidden=\{phase === ['"]captured['"]\}/)
  assert.match(cameraSource, /disabled=\{phase !== ['"]live['"]\}/)
})

test('촬영 완료 후 사자가 손을 흔들며 축제 인사를 한다', () => {
  assert.match(cameraSource, /celebration-lion\.png/)
  assert.match(cameraSource, /celebration-hands\.png/)
  assert.match(cameraSource, /phase === ['"]captured['"]\s*&&/)
  assert.match(cameraSource, /즐거운 축제 되세요~!/)
})

test('완성 사진은 선택 영역까지만 왼쪽으로 이동하고 사자는 원래 사진 자리에 나타난다', () => {
  assert.match(rankingCss, /--captured-shift-x:/)
  const capturedPhotoRule = rankingCss.match(/\.camera__screen--captured \.camera__polaroid\s*\{[^}]*\}/s)?.[0] ?? ''
  assert.match(capturedPhotoRule, /animation:\s*none/)
  assert.match(capturedPhotoRule, /translateX\(calc\(-1 \* var\(--captured-shift-x\)\)\)/)
  assert.match(rankingCss, /\.camera__screen--captured \.camera__frame-selector\s*\{[^}]*translateX\(-/s)
  assert.match(rankingCss, /\.camera__celebration/)
})

test('완료 버튼은 화면 중앙에 그대로 유지한다', () => {
  assert.doesNotMatch(rankingCss, /\.camera__screen--captured \.camera__actions\s*\{[^}]*translateX/s)
})

test('사자는 빈 오른쪽 영역 중앙에 있고 손은 얼굴 가까이 내려온다', () => {
  const celebrationRule = rankingCss.match(/\.camera__celebration\s*\{[^}]*\}/s)?.[0] ?? ''
  const handsRule = rankingCss.match(/\.camera__celebration-hands\s*\{[^}]*\}/s)?.[0] ?? ''
  assert.match(celebrationRule, /left:\s*1060px/)
  assert.match(handsRule, /top:\s*92px/)
})

test('사자 손 흔들기는 모션 감소 설정을 존중한다', () => {
  assert.match(rankingCss, /@keyframes camera-hands-wave/)
  assert.match(rankingCss, /@media \(prefers-reduced-motion: reduce\)/)
})

test('사진과 프레임 선택칸은 같은 속도로 왼쪽 이동한다', () => {
  const selectorRule = rankingCss.match(/\.camera__frame-selector\s*\{[^}]*\}/s)?.[0] ?? ''
  assert.match(selectorRule, /transform 0\.65s cubic-bezier\(0\.22, 1, 0\.36, 1\)/)
  assert.match(selectorRule, /opacity 0\.65s cubic-bezier\(0\.22, 1, 0\.36, 1\)/)
  assert.match(rankingCss, /transition-delay:\s*0s, 0s, 0\.65s/)
})

test('촬영 완료 버튼은 중앙에서 85px 위로 이동한다', () => {
  const actionsRule = rankingCss.match(/\.camera__screen--captured \.camera__actions\s*\{[^}]*\}/s)?.[0] ?? ''
  assert.match(actionsRule, /transform:\s*translateY\(-85px\)/)
  assert.doesNotMatch(actionsRule, /translateX/)
})

test('주요 버튼은 누를 때 흰색 글로우와 눌림 피드백을 준다', () => {
  assert.match(rankingCss, /\.ranking__cta:active[\s\S]*?scale\(0\.94\)[\s\S]*?rgba\(255,\s*255,\s*255/)
  assert.match(rankingCss, /\.camera__cta:active[\s\S]*?scale\(0\.94\)[\s\S]*?rgba\(255,\s*255,\s*255/)
  assert.match(rankingCss, /\.ranking__cta:focus-visible/)
  assert.match(rankingCss, /\.camera__cta:focus-visible/)
})

test('사자는 사진 이동이 거의 끝난 뒤 짧은 거리에서 등장한다', () => {
  const rule = rankingCss.match(/\.camera__celebration\s*\{[^}]*\}/s)?.[0] ?? ''
  assert.match(rule, /top:\s*210px/)
  assert.match(rule, /translateX\(30px\)/)
  assert.match(rule, /0\.65s 0\.52s/)
})

test('완료 버튼과 손 흔들기 배치를 영상 기준으로 정돈한다', () => {
  assert.match(rankingCss, /\.camera__screen--captured \.camera__actions\s*\{[^}]*translateY\(-85px\)/s)
  assert.match(rankingCss, /camera-hands-wave 1\.1s/)
  assert.match(rankingCss, /rotate\(-3deg\) translateY\(3px\)/)
  assert.match(rankingCss, /rotate\(3deg\) translateY\(-3px\)/)
})
