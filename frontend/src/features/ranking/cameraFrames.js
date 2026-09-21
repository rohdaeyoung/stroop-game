// '호잇' 디자인(Figma node 452:2)의 배경 패턴. composeFrame()은 동기 함수라
// 캡처 시점에 로드를 기다릴 수 없으므로, 처음 그릴 때 로드를 시작해두고
// 이후 호출부터는 캐시된 이미지를 재사용합니다. 촬영은 카운트다운 + 셔터를
// 거치므로 실제로 그릴 때쯤엔 거의 항상 로드가 끝나 있습니다.
// new URL(..., import.meta.url) 을 쓰는 이유: 일반 정적 import 는 이 파일을
// 직접 실행하는 Node 테스트 러너(번들러 없음, .png 확장자를 모름)에서
// 바로 터집니다. Image 생성 자체도 지연 평가(호출 시점)로 미뤄서 window 가
// 없는 환경에서 이 모듈을 import 하는 것만으로는 문제가 없게 합니다.
const lionPatternBgSrc = new URL('./assets/lion-pattern-bg.png', import.meta.url).href
let lionPatternImage = null
function getLionPatternImage() {
  if (!lionPatternImage) {
    lionPatternImage = new Image()
    lionPatternImage.src = lionPatternBgSrc
  }
  return lionPatternImage
}

export const CAMERA_FRAMES = [
  {
    key: 'photomatic',
    label: '포토매틱',
    width: 736,
    height: 467,
    slots: [
      { x: 52, y: 60, width: 313, height: 324, rotation: 0 },
      { x: 371, y: 60, width: 313, height: 324, rotation: 0 },
    ],
  },
  {
    key: 'polaroid',
    label: '폴라로이드',
    width: 600,
    height: 670,
    slots: [
      { x: 62.6755, y: 76.1955, width: 387, height: 261.383, rotation: 6.88, skewX: 1.66, rotationOrigin: { x: 285.094, y: 207.3215 }, bleed: 0 },
      { x: 71.297, y: 384.574, width: 387, height: 263.488, rotation: -4.59, skewX: -1.11, rotationOrigin: { x: 293.4835, y: 515.81 }, bleed: 0 },
    ],
  },
  {
    key: 'film',
    label: '스토리 필름',
    width: 420,
    height: 560,
    slots: [
      { x: 16, y: 40, width: 388, height: 237, rotation: 0 },
      { x: 16, y: 288, width: 190, height: 226, rotation: 0 },
      { x: 214, y: 288, width: 190, height: 226, rotation: 0 },
    ],
  },
]

export function getCameraFrame(key) {
  return CAMERA_FRAMES.find((frame) => frame.key === key) ?? CAMERA_FRAMES[0]
}

export function drawCover(ctx, image, slot) {
  const bleed = slot.bleed ?? 0
  const target = {
    x: slot.x - bleed,
    y: slot.y - bleed,
    width: slot.width + bleed * 2,
    height: slot.height + bleed * 2,
  }
  const sourceWidth = image.videoWidth || image.naturalWidth || image.width
  const sourceHeight = image.videoHeight || image.naturalHeight || image.height
  if (!sourceWidth || !sourceHeight) return

  const sourceRatio = sourceWidth / sourceHeight
  const targetRatio = target.width / target.height
  let sx = 0
  let sy = 0
  let sw = sourceWidth
  let sh = sourceHeight

  if (sourceRatio > targetRatio) {
    sw = sourceHeight * targetRatio
    sx = (sourceWidth - sw) / 2
  } else {
    sh = sourceWidth / targetRatio
    sy = (sourceHeight - sh) / 2
  }

  ctx.save()
  if (slot.rotation || slot.skewX) {
    const originX = slot.rotationOrigin?.x ?? target.x + target.width / 2
    const originY = slot.rotationOrigin?.y ?? target.y + target.height / 2
    ctx.translate(originX, originY)
    ctx.rotate((slot.rotation * Math.PI) / 180)
    ctx.transform(1, 0, Math.tan(((slot.skewX ?? 0) * Math.PI) / 180), 1, 0, 0)
    ctx.drawImage(image, sx, sy, sw, sh, target.x - originX, target.y - originY, target.width, target.height)
  } else {
    ctx.drawImage(image, sx, sy, sw, sh, target.x, target.y, target.width, target.height)
  }
  ctx.restore()
}

function drawGlow(ctx, x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
}

function drawLabel(ctx, text, x, y, size, align = 'left', color = '#fff') {
  ctx.fillStyle = color
  ctx.font = `700 ${size}px Inter, Arial, sans-serif`
  ctx.textAlign = align
  ctx.textBaseline = 'top'
  ctx.fillText(text, x, y)
}

function drawPhotomatic(ctx) {
  const bg = getLionPatternImage()
  if (bg.complete && bg.naturalWidth) {
    drawCover(ctx, bg, { x: 0, y: 0, width: 736, height: 467 })
  } else {
    // 패턴 이미지가 아직 로드되기 전이면(드물게 촬영이 아주 빠른 경우)
    // 눈에 띄는 빈 공간 대신 무난한 회색으로 대체합니다.
    ctx.fillStyle = '#8a8a8a'
    ctx.fillRect(0, 0, 736, 467)
  }
  ctx.fillStyle = 'rgba(0, 0, 0, .22)'
  ctx.fillRect(0, 0, 736, 467)
  ctx.fillStyle = '#d9d9d9'
  ctx.fillRect(52, 60, 313, 324)
  ctx.fillRect(371, 60, 313, 324)
  drawLabel(ctx, 'TAKE YOUR MEMORY', 52, 20, 13)
  drawLabel(ctx, '2026.09.22', 368, 20, 13, 'center')
  drawLabel(ctx, 'LIKELION', 684, 20, 13, 'right')
  drawLabel(ctx, 'LIKELION SKU', 368, 407, 26, 'center')
}

// Figma's "Polaroid Card" shape is rounded 3px; the divider ("Flap Seam")
// line next to the label runs a fixed length per card, not a fraction of
// the card height.
const POLAROID_CORNER_RADIUS = 3

function drawPolaroidCard(ctx, { x, y, width, height, rotation, skewX, flapHeight, date, logo }) {
  ctx.save()
  ctx.translate(x + width / 2, y + height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.transform(1, 0, Math.tan((skewX * Math.PI) / 180), 1, 0, 0)
  ctx.shadowColor = 'rgba(0,0,0,.3)'
  ctx.shadowBlur = 11
  ctx.shadowOffsetY = 10
  ctx.fillStyle = '#fafaf7'
  ctx.beginPath()
  ctx.roundRect(-width / 2, -height / 2, width, height, POLAROID_CORNER_RADIUS)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.fillStyle = '#d9d9d6'
  ctx.fillRect(width / 2 - 70, -height / 2 + 12, 2, flapHeight)
  ctx.translate(width / 2 - 42, 0)
  ctx.rotate(-Math.PI / 2)
  drawLabel(ctx, date || logo, 0, -7, 13, 'center', logo ? '#2675ff' : '#000')
  ctx.restore()
}

function drawPolaroidBorder(ctx, { x, y, width, height, rotation, skewX, flapHeight, date, logo }) {
  ctx.save()
  ctx.translate(x + width / 2, y + height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.transform(1, 0, Math.tan((skewX * Math.PI) / 180), 1, 0, 0)
  const left = -width / 2
  const top = -height / 2
  // Clip to the card's own rounded outline so the 4 border strips below
  // don't square off the corners the card background already rounded.
  ctx.beginPath()
  ctx.roundRect(left, top, width, height, POLAROID_CORNER_RADIUS)
  ctx.clip()
  ctx.fillStyle = '#fafaf7'
  ctx.fillRect(left, top, width, 18)
  ctx.fillRect(left, top + height - 19, width, 19)
  ctx.fillRect(left, top, 18, height)
  ctx.fillRect(left + width - 76, top, 76, height)
  ctx.fillStyle = '#d9d9d6'
  ctx.fillRect(left + width - 70, top + 12, 2, flapHeight)
  ctx.translate(width / 2 - 42, 0)
  ctx.rotate(-Math.PI / 2)
  drawLabel(ctx, date || logo, 0, -7, 13, 'center', logo ? '#2675ff' : '#000')
  ctx.restore()
}

function drawPolaroid(ctx) {
  drawPolaroidCard(ctx, { x: 44.6755, y: 58.1955, width: 480.837, height: 298.252, rotation: 6.88, skewX: 1.66, flapHeight: 261.784, date: '2026.09.22' })
  drawPolaroidCard(ctx, { x: 53.297, y: 366.574, width: 480.373, height: 298.472, rotation: -4.59, skewX: -1.11, flapHeight: 266.808, logo: 'LIKELION SKU' })
}

function drawFilm(ctx) {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 420, 560)
  const glowRadius = 0.27 * Math.hypot(420, 560)
  drawGlow(ctx, 0, 0, glowRadius, 'rgba(255,55,82,.95)')
  drawGlow(ctx, 420, 0, glowRadius, 'rgba(31,80,255,.75)')
  drawGlow(ctx, 0, 560, glowRadius, 'rgba(0,124,67,.68)')
  drawGlow(ctx, 420, 560, glowRadius, 'rgba(255,193,38,.76)')
  drawLabel(ctx, 'STORY OF YOUR FILM', 16, 15, 10)
  drawLabel(ctx, '▶ ▶  45', 404, 15, 10, 'right')
  drawLabel(ctx, 'LIKELION SKU', 210, 532, 10, 'center')
  drawLabel(ctx, '▶ ▶  45', 404, 535, 10, 'right')
}

// Pre-capture preview is CSS, which stays crisp at any size. The composed
// photo is a raster, so it needs extra pixel density to look as sharp once
// displayed at the same size as that preview. The polaroid frame's photos
// are drawn through a rotate+skew transform (unlike photomatic/film, which
// are axis-aligned), and that resampling softens detail more than a plain
// scale-up does - so it needs the most headroom.
// Read lazily (not at module scope) so importing this file under a
// non-browser test runner (no `window`) doesn't crash.
function getRenderScale() {
  return Math.min(window.devicePixelRatio || 1, 2) * 3
}

export function composeFrame(canvas, frame, images) {
  const RENDER_SCALE = getRenderScale()
  canvas.width = frame.width * RENDER_SCALE
  canvas.height = frame.height * RENDER_SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(RENDER_SCALE, RENDER_SCALE)
  ctx.imageSmoothingQuality = 'high'

  if (frame.key === 'photomatic') drawPhotomatic(ctx)
  if (frame.key === 'polaroid') drawPolaroid(ctx)
  if (frame.key === 'film') drawFilm(ctx)

  frame.slots.forEach((slot, index) => drawCover(ctx, images[index], slot))

  // Frame labels and borders must remain above the photos.
  if (frame.key === 'photomatic') drawPhotomaticOverlay(ctx)
  if (frame.key === 'polaroid') drawPolaroidOverlay(ctx)
  if (frame.key === 'film') drawFilmOverlay(ctx)

  return frame.key === 'polaroid'
    ? canvas.toDataURL('image/png')
    : canvas.toDataURL('image/jpeg', 0.95)
}

/** 백엔드 업로드 상한(PhotoService.MAX_BYTES, 1MB)에 맞춰 필요할 때만
 * 재압축함. composeFrame()의 RENDER_SCALE이 화면 미리보기용으로 이미
 * 고해상도라, 특히 아이패드처럼 devicePixelRatio가 높은 기기에서는
 * 원본이 상한을 몇 배씩 넘길 수 있음 - JPEG는 품질을 낮춰서, PNG(폴라로이드,
 * 알파 채널 유지 필요)는 해상도를 줄여서 목표 용량 안에 맞춤. */
export async function compressForUpload(dataUrl, maxBytes = 950 * 1024) {
  const isPng = dataUrl.startsWith('data:image/png')

  const image = new Image()
  const loaded = new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = () => reject(new Error('이미지를 불러오지 못했습니다'))
  })
  image.src = dataUrl
  await loaded

  const toBlob = (scale, quality) =>
    new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(resolve, isPng ? 'image/png' : 'image/jpeg', isPng ? undefined : quality)
    })

  let scale = 1
  let quality = 0.92
  let lastBlob = null

  for (let attempt = 0; attempt < 12; attempt++) {
    lastBlob = await toBlob(scale, quality)
    if (lastBlob && lastBlob.size <= maxBytes) return lastBlob

    // PNG has no quality dial - only resolution helps. JPEG tries quality
    // first (keeps full resolution longer) and falls back to resolution
    // once quality bottoms out. Either way, jump straight toward the scale
    // that SHOULD hit the target from the size just measured (file size
    // roughly tracks pixel count) instead of always nibbling a fixed 15%
    // off - a polaroid PNG starting several MB over target (devicePixelRatio
    // 2 iPads routinely produce 8-9MB originals) needed more than the fixed
    // step could deliver within a bounded attempt count.
    if (isPng || quality <= 0.5) {
      const ratio = maxBytes / lastBlob.size
      scale *= Math.min(0.85, Math.sqrt(ratio) * 0.9)
    } else {
      quality -= 0.12
    }
  }

  return lastBlob
}

function drawPhotomaticOverlay(ctx) {
  // 패널 사이 divider 선은 그리지 않습니다 - 라이브 미리보기(CSS)에도 선이
  // 없어서 최종 사진과 미리보기 모양을 맞췄고, 호잇 배경 패턴이 그 틈으로
  // 그대로 비쳐 보입니다. (예전 검정 배경일 땐 6px 통짜 사각형이어도 안
  // 보였는데, 호잇 배경으로 바뀌면서 두꺼운 검정 줄로 도드라졌습니다.)
  drawLabel(ctx, 'TAKE YOUR MEMORY', 52, 20, 13)
  drawLabel(ctx, '2026.09.22', 368, 20, 13, 'center')
  drawLabel(ctx, 'LIKELION', 684, 20, 13, 'right')
  drawLabel(ctx, 'LIKELION SKU', 368, 407, 26, 'center')
}

function drawPolaroidOverlay(ctx) {
  drawPolaroidBorder(ctx, { x: 44.6755, y: 58.1955, width: 480.837, height: 298.252, rotation: 6.88, skewX: 1.66, flapHeight: 261.784, date: '2026.09.22' })
  drawPolaroidBorder(ctx, { x: 53.297, y: 366.574, width: 480.373, height: 298.472, rotation: -4.59, skewX: -1.11, flapHeight: 266.808, logo: 'LIKELION SKU' })
}

function drawFilmOverlay(ctx) {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 277, 420, 11)
  ctx.fillRect(206, 288, 8, 226)
  drawLabel(ctx, 'STORY OF YOUR FILM', 16, 15, 10)
  drawLabel(ctx, '▶ ▶  45', 404, 15, 10, 'right')
  drawLabel(ctx, 'LIKELION SKU', 210, 532, 10, 'center')
  drawLabel(ctx, '▶ ▶  45', 404, 535, 10, 'right')
}
