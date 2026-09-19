import assert from 'node:assert/strict'
import test from 'node:test'

// composeFrame() reads window.devicePixelRatio (lazily, at call time) to
// pick a render scale - stub it so the Node test runner (no real `window`)
// can call composeFrame() directly.
globalThis.window ??= { devicePixelRatio: 1 }

import { CAMERA_FRAMES, compressForUpload, composeFrame, drawCover, getCameraFrame } from './cameraFrames.js'

/** compressForUpload()가 쓰는 Image/document.createElement('canvas')를
 * 브라우저 없이 흉내냄. 실제 인코더 대신 "픽셀 수 x 품질"에 비례하는
 * 가짜 파일 크기를 계산해서, 반복 압축 로직이 정말 목표 용량 아래로
 * 수렴하는지 확인한다. */
function stubImageAndCanvas({ naturalWidth, naturalHeight, bytesAtFullSize }) {
  class FakeImage {
    set src(value) {
      this._src = value
      queueMicrotask(() => this.onload?.())
    }
    get naturalWidth() { return naturalWidth }
    get naturalHeight() { return naturalHeight }
  }
  globalThis.Image = FakeImage
  globalThis.document = {
    createElement: () => {
      const canvas = {
        width: 0,
        height: 0,
        getContext: () => ({ drawImage() {} }),
        toBlob(callback, type, quality) {
          const pixelRatio = (canvas.width * canvas.height) / (naturalWidth * naturalHeight)
          const qualityRatio = type === 'image/png' ? 1 : quality
          callback({ size: Math.round(bytesAtFullSize * pixelRatio * qualityRatio) })
        },
      }
      return canvas
    },
  }
}

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
    save() {}, restore() {}, translate() {}, rotate() {}, scale() {},
    fillRect() {}, fillText() {},
    createRadialGradient() { return gradient },
    drawImage(image) { draws.push(image) },
  }
  const canvas = {
    getContext: () => ctx,
    toDataURL(type, quality) {
      assert.equal(type, 'image/jpeg')
      assert.equal(quality, 0.95)
      return 'data:image/jpeg;base64,result'
    },
  }
  const images = [{ width: 640, height: 480 }, { width: 640, height: 480 }, { width: 640, height: 480 }]

  const result = composeFrame(canvas, getCameraFrame('film'), images)

  assert.equal(draws.length, 3)
  assert.equal(result, 'data:image/jpeg;base64,result')
})

test('촬영된 폴라로이드는 카드 바깥 배경 없이 투명 PNG로 만든다', () => {
  const fills = []
  const gradient = { addColorStop() {} }
  const ctx = {
    fillStyle: '',
    save() {}, restore() {}, translate() {}, rotate() {}, transform() {}, scale() {},
    beginPath() {}, roundRect() {}, fill() {}, clip() {},
    fillRect(...args) { fills.push({ color: this.fillStyle, args }) },
    fillText() {}, drawImage() {},
    createRadialGradient() { return gradient },
  }
  const canvas = {
    getContext: () => ctx,
    toDataURL(type) {
      assert.equal(type, 'image/png')
      return 'data:image/png;base64,result'
    },
  }

  const result = composeFrame(canvas, getCameraFrame('polaroid'), [
    { width: 640, height: 480 },
    { width: 640, height: 480 },
  ])

  assert.equal(result, 'data:image/png;base64,result')
  assert.equal(fills.some(({ color, args }) => color === '#202020' && args.join(',') === '0,0,600,670'), false)
})

test('업로드 용량이 이미 상한 이내면 첫 시도(해상도 100%) 그대로 반환한다', async () => {
  stubImageAndCanvas({ naturalWidth: 1000, naturalHeight: 1000, bytesAtFullSize: 500 * 1024 })

  const blob = await compressForUpload('data:image/jpeg;base64,x', 950 * 1024)

  // 첫 시도는 항상 원본 해상도(scale=1)로 인코딩함 - 품질(0.92)만 적용된
  // 크기라 원본의 정확히 100%는 아니지만, 상한 이내이므로 더 줄이지 않아야 함
  assert.ok(blob.size <= 950 * 1024)
  assert.ok(blob.size > 400 * 1024, `해상도까지 줄어든 것으로 보임: ${blob.size}`)
})

test('JPEG는 해상도를 유지한 채 품질부터 낮춰서 상한 이내로 맞춘다', async () => {
  // 최초(품질 0.92) 시도는 950KB 상한을 넘고, 품질을 몇 단계 낮추면 맞음
  stubImageAndCanvas({ naturalWidth: 1000, naturalHeight: 1000, bytesAtFullSize: 1200 * 1024 })

  const blob = await compressForUpload('data:image/jpeg;base64,x', 950 * 1024)

  assert.ok(blob.size <= 950 * 1024, `상한을 넘김: ${blob.size}`)
})

test('폴라로이드(PNG)는 품질 조절이 안 되니 해상도를 줄여서 상한 이내로 맞춘다', async () => {
  stubImageAndCanvas({ naturalWidth: 2000, naturalHeight: 2000, bytesAtFullSize: 3000 * 1024 })

  const blob = await compressForUpload('data:image/png;base64,x', 950 * 1024)

  assert.ok(blob.size <= 950 * 1024, `상한을 넘김: ${blob.size}`)
})

test('8번 시도로도 상한을 못 맞추면 마지막 결과라도 반환한다(무한 루프 방지)', async () => {
  // bytesAtFullSize를 상한보다 압도적으로 크게 잡아 8번 반복 안에 못 맞추게 함
  stubImageAndCanvas({ naturalWidth: 1000, naturalHeight: 1000, bytesAtFullSize: 100 * 1024 * 1024 })

  const blob = await compressForUpload('data:image/jpeg;base64,x', 950 * 1024)

  assert.ok(blob, '마지막 시도 결과가 반환되어야 함(undefined/null 아님)')
})
