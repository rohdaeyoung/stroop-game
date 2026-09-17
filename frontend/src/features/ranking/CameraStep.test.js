import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const cameraSource = readFileSync(new URL('./CameraStep.jsx', import.meta.url), 'utf8')
const rankingCss = readFileSync(new URL('./Ranking.css', import.meta.url), 'utf8')

test('네 프레임 모두 Figma 원본 에셋을 사용한다', () => {
  for (const asset of ['basic', 'dots', 'denim', 'stamp']) {
    assert.match(cameraSource, new RegExp(`camera-frame-${asset}\\.png`))
    assert.match(cameraSource, new RegExp(`${asset}:\\s*cameraFrame`, 'm'))
  }
  assert.match(cameraSource, /className=['"]camera__frame-overlay['"]/) 
  assert.match(cameraSource, /src=\{FRAME_ASSETS\[frame\]\}/)
})

test('프레임 선택 썸네일도 Figma 전용 미리보기 에셋을 사용한다', () => {
  for (const asset of ['basic', 'dots', 'denim', 'stamp']) {
    assert.match(cameraSource, new RegExp(`camera-preview-${asset}`))
    assert.match(cameraSource, new RegExp(`${asset}:\\s*cameraPreview`, 'm'))
  }
  assert.match(cameraSource, /src=\{FRAME_PREVIEWS\[opt\.key\]\}/)
})

test('카메라 영상은 프레임 캔버스 안에서 잘린다', () => {
  const polaroidRule = rankingCss.match(/\.camera__polaroid\s*\{[^}]+\}/s)?.[0] ?? ''
  assert.match(polaroidRule, /padding:\s*0/)
  assert.match(polaroidRule, /overflow:\s*hidden/)
  assert.match(polaroidRule, /width:\s*var\(--camera-frame-width\)/)
  assert.match(polaroidRule, /height:\s*var\(--camera-frame-height\)/)
  assert.match(polaroidRule, /--camera-window:\s*inset\(9% 8% 15% 8%\)/)
  assert.match(polaroidRule, /background:\s*transparent/)

  const mediaRule = rankingCss.match(/\.camera__video,[\s\S]*?\.camera__error-box\s*\{[^}]+\}/)?.[0] ?? ''
  assert.match(mediaRule, /clip-path:\s*var\(--camera-window\)/)
})

test('날짜는 프레임 바깥으로 튀어나오지 않고 하단 안쪽에 표시된다', () => {
  const dateRule = rankingCss.match(/\.camera__date\s*\{[^}]+\}/s)?.[0] ?? ''
  assert.match(dateRule, /position:\s*absolute/)
  assert.match(dateRule, /left:\s*40px/)
  assert.match(dateRule, /bottom:\s*20px/)
  assert.match(dateRule, /margin:\s*0/)
})

test('우표 프레임도 4대3 캔버스에서 회전 없이 표시한다', () => {
  const stampRule = rankingCss.match(/\.camera__polaroid--stamp\s*\{[^}]+\}/s)?.[0] ?? ''
  assert.doesNotMatch(stampRule, /--camera-frame-(?:width|height)/)
  assert.doesNotMatch(rankingCss, /\.camera__polaroid--stamp \.camera__frame-overlay/)
})

test('네 프레임 전환 시 캔버스와 선택 카드 크기가 변하지 않는다', () => {
  const polaroidRule = rankingCss.match(/\.camera__polaroid\s*\{[^}]+\}/s)?.[0] ?? ''
  assert.match(polaroidRule, /--camera-frame-width:\s*889px/)
  assert.match(polaroidRule, /--camera-frame-height:\s*667px/)
  assert.doesNotMatch(rankingCss, /\.camera__polaroid--(?:dots|denim|stamp)\s*\{[^}]*--camera-frame-(?:width|height)/s)

  const optionRule = rankingCss.match(/\.camera__frame-option\s*\{[^}]+\}/s)?.[0] ?? ''
  assert.match(optionRule, /box-sizing:\s*border-box/)
  assert.match(optionRule, /width:\s*148px/)
  assert.match(optionRule, /height:\s*180px/)

  const previewRule = rankingCss.match(/\.camera__frame-preview\s*\{[^}]+\}/s)?.[0] ?? ''
  assert.match(previewRule, /width:\s*120px/)
  assert.match(previewRule, /height:\s*90px/)
})

test('카운트다운 암막은 카메라와 프레임 전체를 덮는다', () => {
  const countdownRule = rankingCss.match(/\.camera__countdown\s*\{[^}]+\}/s)?.[0] ?? ''
  assert.match(countdownRule, /inset:\s*0/)
  assert.match(countdownRule, /z-index:\s*4/)
  assert.doesNotMatch(countdownRule, /height:\s*571px/)
  assert.doesNotMatch(countdownRule, /top:\s*18px/)
})

test('셔터 버튼은 Figma의 120x121px 이중 링 에셋을 사용한다', () => {
  const shutterRule = rankingCss.match(/\.camera__shutter-dot\s*\{[^}]+\}/s)?.[0] ?? ''

  assert.match(shutterRule, /width:\s*120px/)
  assert.match(shutterRule, /height:\s*121px/)
  assert.match(shutterRule, /url\(['"]\.\/assets\/shutter-button\.svg['"]\)/)
})

test('정상 촬영 상태에는 건너뛰기 버튼을 표시하지 않는다', () => {
  assert.doesNotMatch(cameraSource, /촬영 건너뛰기/)
  assert.match(cameraSource, /phase === ['"]error['"]\s*&&/)
  assert.match(cameraSource, />\s*건너뛰기\s*</)
})

test('사진 저장 안내 문구는 Figma 문구와 일치한다', () => {
  assert.match(cameraSource, /촬영한 사진은 결과 화면과 함께 저장돼요/)
  assert.doesNotMatch(cameraSource, /서버에 저장되지 않아요/)
})
