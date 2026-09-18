import assert from 'node:assert/strict'
import test from 'node:test'

import { CAMERA_FRAMES, composeFrame, drawCover, getCameraFrame } from './cameraFrames.js'

test('새 Figma 프레임 3종만 제공한다', () => {
  assert.deepEqual(CAMERA_FRAMES.map(({ key }) => key), ['photomatic', 'polaroid', 'film'])
  assert.deepEqual(CAMERA_FRAMES.map(({ label }) => label), ['포토매틱', '폴라로이드', '스토리 필름'])
  assert.doesNotMatch(JSON.stringify(CAMERA_FRAMES), /basic|dots|denim|stamp/)
})

test('프레임별로 서로 다른 사진 2장, 2장, 3장을 촬영한다', () => {
  assert.deepEqual(CAMERA_FRAMES.map(({ slots }) => slots.length), [2, 2, 3])
})

test('폴라로이드 사진 칸은 카드와 같은 중심을 기준으로 회전한다', () => {
  const { slots } = getCameraFrame('polaroid')
  assert.deepEqual(slots.map(({ rotationOrigin }) => rotationOrigin), [
    { x: 285.094, y: 207.3215 },
    { x: 293.4835, y: 515.81 },
  ])
})

test('폴라로이드 프레임은 Figma 17:2의 실측 좌표와 왜곡값을 사용한다', () => {
  const { slots } = getCameraFrame('polaroid')
  assert.deepEqual(slots, [
    {
      x: 62.6755,
      y: 76.1955,
      width: 387,
      height: 261.383,
      rotation: 6.88,
      skewX: 1.66,
      rotationOrigin: { x: 285.094, y: 207.3215 },
      bleed: 0,
    },
    {
      x: 71.297,
      y: 384.574,
      width: 387,
      height: 263.488,
      rotation: -4.59,
      skewX: -1.11,
      rotationOrigin: { x: 293.4835, y: 515.81 },
      bleed: 0,
    },
  ])
})

test('폴라로이드 미리보기와 합성 모두 Figma skew를 적용한다', () => {
  assert.match(drawCover.toString(), /slot\.skewX/)
})

test('폴라로이드 사진은 회전 테두리 아래까지 겹쳐 검은 틈을 남기지 않는다', () => {
  const { slots } = getCameraFrame('polaroid')
  assert.deepEqual(slots.map(({ bleed }) => bleed), [0, 0])
})

test('알 수 없는 프레임 키는 첫 번째 프레임으로 안전하게 대체한다', () => {
  assert.equal(getCameraFrame('missing').key, 'photomatic')
})

test('사진을 슬롯 비율에 맞게 중앙 크롭한다', () => {
  const calls = []
  const ctx = {
    save() {},
    restore() {},
    drawImage(...args) { calls.push(args) },
  }

  drawCover(ctx, { width: 1600, height: 900 }, { x: 10, y: 20, width: 100, height: 100, rotation: 0 })

  assert.deepEqual(calls[0], [{ width: 1600, height: 900 }, 350, 0, 900, 900, 10, 20, 100, 100])
})

test('합성 결과는 슬롯 수만큼 사진을 그리고 JPEG 한 장을 만든다', () => {
  const draws = []
  const gradient = { addColorStop() {} }
  const ctx = {
    save() {}, restore() {}, translate() {}, rotate() {},
    fillRect() {}, fillText() {},
    createRadialGradient() { return gradient },
    drawImage(image) { draws.push(image) },
  }
  const canvas = {
    getContext: () => ctx,
    toDataURL(type, quality) {
      assert.equal(type, 'image/jpeg')
      assert.equal(quality, 0.85)
      return 'data:image/jpeg;base64,result'
    },
  }
  const images = [{ width: 640, height: 480 }, { width: 640, height: 480 }, { width: 640, height: 480 }]

  const result = composeFrame(canvas, getCameraFrame('film'), images)

  assert.equal(draws.length, 3)
  assert.equal(result, 'data:image/jpeg;base64,result')
})
