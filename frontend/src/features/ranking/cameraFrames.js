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
      { x: 66, y: 66, width: 391, height: 263, rotation: 6.88, rotationOrigin: { x: 288.5, y: 197 } },
      { x: 75, y: 385, width: 391, height: 267, rotation: -4.59, rotationOrigin: { x: 297, y: 516 } },
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
  const sourceWidth = image.videoWidth || image.naturalWidth || image.width
  const sourceHeight = image.videoHeight || image.naturalHeight || image.height
  if (!sourceWidth || !sourceHeight) return

  const sourceRatio = sourceWidth / sourceHeight
  const targetRatio = slot.width / slot.height
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
  if (slot.rotation) {
    const originX = slot.rotationOrigin?.x ?? slot.x + slot.width / 2
    const originY = slot.rotationOrigin?.y ?? slot.y + slot.height / 2
    ctx.translate(originX, originY)
    ctx.rotate((slot.rotation * Math.PI) / 180)
    ctx.drawImage(image, sx, sy, sw, sh, slot.x - originX, slot.y - originY, slot.width, slot.height)
  } else {
    ctx.drawImage(image, sx, sy, sw, sh, slot.x, slot.y, slot.width, slot.height)
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
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 736, 467)
  drawGlow(ctx, 0, 0, 190, 'rgba(255,55,82,.95)')
  drawGlow(ctx, 736, 0, 190, 'rgba(31,80,255,.75)')
  drawGlow(ctx, 0, 467, 190, 'rgba(0,124,67,.68)')
  drawGlow(ctx, 736, 467, 190, 'rgba(255,193,38,.76)')
  drawLabel(ctx, 'TAKE YOUR MEMORY', 52, 20, 13)
  drawLabel(ctx, '2026.09.22', 368, 20, 13, 'center')
  drawLabel(ctx, 'PHOTOMATIC', 684, 20, 13, 'right')
  drawLabel(ctx, 'LIKELION SKU', 368, 407, 26, 'center')
}

function drawPolaroidCard(ctx, { x, y, width, height, rotation, date, logo }) {
  ctx.save()
  ctx.translate(x + width / 2, y + height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.shadowColor = 'rgba(0,0,0,.3)'
  ctx.shadowBlur = 11
  ctx.shadowOffsetY = 10
  ctx.fillStyle = '#fafaf7'
  ctx.fillRect(-width / 2, -height / 2, width, height)
  ctx.shadowColor = 'transparent'
  ctx.fillStyle = '#d9d9d6'
  ctx.fillRect(width / 2 - 70, -height / 2 + 12, 2, height - 24)
  ctx.translate(width / 2 - 42, 0)
  ctx.rotate(-Math.PI / 2)
  drawLabel(ctx, date || logo, 0, -7, 13, 'center', logo ? '#2675ff' : '#000')
  ctx.restore()
}

function drawPolaroidBorder(ctx, { x, y, width, height, rotation, date, logo }) {
  ctx.save()
  ctx.translate(x + width / 2, y + height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.fillStyle = '#fafaf7'
  const left = -width / 2
  const top = -height / 2
  ctx.fillRect(left, top, width, 18)
  ctx.fillRect(left, top + height - 19, width, 19)
  ctx.fillRect(left, top, 18, height)
  ctx.fillRect(left + width - 76, top, 76, height)
  ctx.fillStyle = '#d9d9d6'
  ctx.fillRect(left + width - 70, top + 12, 2, height - 24)
  ctx.translate(width / 2 - 42, 0)
  ctx.rotate(-Math.PI / 2)
  drawLabel(ctx, date || logo, 0, -7, 13, 'center', logo ? '#2675ff' : '#000')
  ctx.restore()
}

function drawPolaroid(ctx) {
  ctx.fillStyle = '#202020'
  ctx.fillRect(0, 0, 600, 670)
  drawPolaroidCard(ctx, { x: 48, y: 48, width: 481, height: 298, rotation: 6.88, date: '2026.09.22' })
  drawPolaroidCard(ctx, { x: 57, y: 367, width: 480, height: 298, rotation: -4.59, logo: 'LIKELION SKU' })
}

function drawFilm(ctx) {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 420, 560)
  drawGlow(ctx, 0, 0, 150, 'rgba(255,55,82,.95)')
  drawGlow(ctx, 420, 0, 150, 'rgba(31,80,255,.75)')
  drawGlow(ctx, 0, 560, 150, 'rgba(0,124,67,.68)')
  drawGlow(ctx, 420, 330, 150, 'rgba(255,193,38,.76)')
  drawLabel(ctx, 'STORY OF YOUR FILM', 16, 15, 10)
  drawLabel(ctx, '▶ ▶  45', 404, 15, 10, 'right')
  drawLabel(ctx, 'LIKELION SKU', 210, 532, 10, 'center')
  drawLabel(ctx, '▶ ▶  45', 404, 535, 10, 'right')
}

export function composeFrame(canvas, frame, images) {
  canvas.width = frame.width
  canvas.height = frame.height
  const ctx = canvas.getContext('2d')

  if (frame.key === 'photomatic') drawPhotomatic(ctx)
  if (frame.key === 'polaroid') drawPolaroid(ctx)
  if (frame.key === 'film') drawFilm(ctx)

  frame.slots.forEach((slot, index) => drawCover(ctx, images[index], slot))

  // Frame labels and borders must remain above the photos.
  if (frame.key === 'photomatic') drawPhotomaticOverlay(ctx)
  if (frame.key === 'polaroid') drawPolaroidOverlay(ctx)
  if (frame.key === 'film') drawFilmOverlay(ctx)

  return canvas.toDataURL('image/jpeg', 0.85)
}

function drawPhotomaticOverlay(ctx) {
  ctx.fillStyle = '#000'
  ctx.fillRect(365, 60, 6, 324)
  drawLabel(ctx, 'TAKE YOUR MEMORY', 52, 20, 13)
  drawLabel(ctx, '2026.09.22', 368, 20, 13, 'center')
  drawLabel(ctx, 'PHOTOMATIC', 684, 20, 13, 'right')
  drawLabel(ctx, 'LIKELION SKU', 368, 407, 26, 'center')
}

function drawPolaroidOverlay(ctx) {
  drawPolaroidBorder(ctx, { x: 48, y: 48, width: 481, height: 298, rotation: 6.88, date: '2026.09.22' })
  drawPolaroidBorder(ctx, { x: 57, y: 367, width: 480, height: 298, rotation: -4.59, logo: 'LIKELION SKU' })
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
