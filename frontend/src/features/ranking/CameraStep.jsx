// 👤 담당: 이혜원
// 09_인증샷 촬영 (Camera) — 실시간 카메라 + 3초 카운트다운 자동 촬영 + 프레임 선택
// ⚠️ 사진을 서버로 보내는 기능(QR 발송)은 백엔드 업로드 API가 없어서 아직 못 만들어요.
//    이 단계는 "촬영까지만" 실제로 동작하고, 결과는 화면 밖으로 나가지 않아요(저장/업로드 없음).
// ⚠️ 카메라 접근은 브라우저 보안 정책상 HTTPS 또는 localhost 에서만 동작해요.
//    같은 와이파이 IP(http://192.168.x.x:5173)로 열면 카메라 권한 자체가 안 뜰 수 있어요.
import { useEffect, useRef, useState } from 'react'
import shutterArrows from './assets/shutter-arrows.png'

const FRAME_OPTIONS = [
  { key: 'basic', label: '기본 프레임' },
  { key: 'dots', label: '땡땡이 프레임' },
  { key: 'denim', label: '데님 프레임' },
  { key: 'stamp', label: '우표 프레임' },
]

const COUNTDOWN_SECONDS = 3

// camera__polaroid--* 의 CSS 프레임 장식과 같은 색을 씁니다 (Ranking.css 참고).
const FRAME_COLORS = {
  dots: '#ff2e78',
  denimDark: '#1e4079',
  denimLight: '#2c5aa0',
  stamp: '#ff5252',
}

function todayLabel() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

async function openCamera() {
  return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
}

function drawDotsBackground(ctx, width, height) {
  const spacing = Math.max(14, Math.round(width * 0.02))
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = FRAME_COLORS.dots
  for (let y = spacing / 2; y < height; y += spacing) {
    for (let x = spacing / 2; x < width; x += spacing) {
      ctx.beginPath()
      ctx.arc(x, y, spacing * 0.22, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

// repeating-linear-gradient(45deg, ...) 와 같은 결 — 컨텍스트를 45도 돌려놓고 줄무늬를 그립니다.
function drawDenimBackground(ctx, width, height) {
  const stripe = Math.max(10, Math.round(width * 0.015))
  ctx.fillStyle = FRAME_COLORS.denimDark
  ctx.fillRect(0, 0, width, height)
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, width, height)
  ctx.clip()
  ctx.translate(width / 2, height / 2)
  ctx.rotate((45 * Math.PI) / 180)
  ctx.translate(-width / 2, -height / 2)
  const diag = Math.sqrt(width * width + height * height)
  ctx.fillStyle = FRAME_COLORS.denimLight
  for (let x = -diag; x < diag; x += stripe * 2) {
    ctx.fillRect(x, -diag, stripe, diag * 3)
  }
  ctx.restore()
}

function drawStampBackground(ctx, width, height) {
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, width, height)

  const borderWidth = Math.max(4, Math.round(width * 0.007))
  ctx.strokeStyle = FRAME_COLORS.stamp
  ctx.lineWidth = borderWidth
  ctx.setLineDash([borderWidth * 1.6, borderWidth * 1.2])
  ctx.strokeRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth)
  ctx.setLineDash([])
}

function drawFrameBackground(ctx, frameKey, width, height) {
  if (frameKey === 'dots') return drawDotsBackground(ctx, width, height)
  if (frameKey === 'denim') return drawDenimBackground(ctx, width, height)
  if (frameKey === 'stamp') return drawStampBackground(ctx, width, height)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, width, height)
}

// 우표 탭 장식(camera__polaroid--stamp::before 참고)은 사진 위에 걸쳐 보여야 해서,
// 사진을 다 그린 뒤(드로우 순서상 맨 위 레이어로) 따로 그립니다 — 배경에 넣으면 사진에 가려집니다.
function drawFrameForeground(ctx, frameKey, padding) {
  if (frameKey !== 'stamp') return
  const tabWidth = padding * 3.6
  const tabHeight = padding * 1.1
  ctx.save()
  ctx.translate(padding * 0.2, padding * 0.9)
  ctx.rotate((-35 * Math.PI) / 180)
  ctx.fillStyle = FRAME_COLORS.stamp
  ctx.fillRect(0, 0, tabWidth, tabHeight)
  ctx.restore()
}

function drawDateLabel(ctx, text, x, baselineY, frameKey) {
  ctx.fillStyle = frameKey === 'denim' ? '#fff' : '#111'
  ctx.font = "700 22px 'Noto Sans KR', sans-serif"
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(text, x, baselineY)
}

export default function CameraStep({ onNext, onSkip }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [frame, setFrame] = useState('basic')
  const [phase, setPhase] = useState('starting') // starting | live | countdown | captured | error
  const [count, setCount] = useState(COUNTDOWN_SECONDS)
  const [photo, setPhoto] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMessage('이 브라우저에서는 카메라를 사용할 수 없어요.')
        setPhase('error')
        return
      }
      try {
        const stream = await openCamera()
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setPhase('live')
      } catch (e) {
        setErrorMessage(
          e?.name === 'NotAllowedError'
            ? '카메라 권한이 필요해요. 브라우저 설정에서 허용해주세요.'
            : '카메라를 켤 수 없어요. HTTPS 주소이거나 카메라가 있는 기기인지 확인해주세요.',
        )
        setPhase('error')
      }
    }

    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  // 셔터를 눌러야 3초 카운트다운이 시작됩니다 (카메라 준비만 되면 자동으로 시작되던 것에서 변경)
  function startCountdown() {
    if (phase !== 'live') return
    setCount(COUNTDOWN_SECONDS)
    setPhase('countdown')
  }

  useEffect(() => {
    if (phase !== 'countdown') return
    if (count <= 0) {
      capture()
      return
    }
    const id = setTimeout(() => setCount((c) => c - 1), 1000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, count])

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const rawWidth = video.videoWidth || 720
    const rawHeight = video.videoHeight || 960
    canvas.width = rawWidth
    canvas.height = rawHeight
    const rawCtx = canvas.getContext('2d')
    rawCtx.translate(canvas.width, 0)
    rawCtx.scale(-1, 1) // 셀피처럼 좌우 반전해서 저장
    rawCtx.drawImage(video, 0, 0, rawWidth, rawHeight)

    // 프레임은 화면 장식이 아니라 QR 로 나가는 사진에 실제로 합성해서 저장합니다.
    const padding = Math.round(rawWidth * 0.025)
    const dateStrip = Math.round(rawWidth * 0.08)
    const framed = document.createElement('canvas')
    framed.width = rawWidth + padding * 2
    framed.height = rawHeight + padding * 2 + dateStrip
    const framedCtx = framed.getContext('2d')

    drawFrameBackground(framedCtx, frame, framed.width, framed.height)
    framedCtx.drawImage(canvas, padding, padding)
    drawFrameForeground(framedCtx, frame, padding)
    drawDateLabel(framedCtx, todayLabel(), padding, padding + rawHeight + Math.round(dateStrip * 0.62), frame)

    // 서버 보관 용량이 1장당 1MB 라 PNG 대신 JPEG 로 저장합니다. (docs/API.md 인증샷 업로드)
    setPhoto(framed.toDataURL('image/jpeg', 0.85))
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setPhase('captured')
  }

  async function retake() {
    setPhoto(null)
    setPhase('starting')
    try {
      const stream = await openCamera()
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setPhase('live')
    } catch {
      setErrorMessage('카메라를 다시 시작하지 못했어요.')
      setPhase('error')
    }
  }

  return (
    <div className="camera__screen">
      <aside className="camera__frame-selector">
        <p className="camera__frame-selector-title">프레임 선택</p>
        {FRAME_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={`camera__frame-option${frame === opt.key ? ' camera__frame-option--selected' : ''}`}
            onClick={() => setFrame(opt.key)}
          >
            <span className={`camera__frame-preview camera__frame-preview--${opt.key}`} />
            <span>{opt.label}</span>
            {frame === opt.key && (
              <span className="camera__frame-check" aria-hidden="true">✓</span>
            )}
          </button>
        ))}
      </aside>

      <div className="camera__badge">&quot;어흥~샷 찍고 가기&quot;</div>
      <h1 className="camera__title">부스 인증샷을 남겨보세요!</h1>
      <p className="camera__subtitle">
        {phase === 'countdown' && `${count}초 후 자동으로 촬영돼요. 카메라를 봐주세욧!`}
        {phase === 'error' && errorMessage}
        {phase === 'starting' && '카메라를 준비하고 있어요...'}
        {phase === 'live' && '아래 셔터를 눌러 촬영을 시작해주세요!'}
        {phase === 'captured' && '어흥샷 완성! 마음에 들어요?'}
      </p>

      {/* 피그마에 있던 손그림 화살표 — 셔터를 누르라고 가리키는 장식. 사진 카드보다 먼저 그려서
          피그마처럼 사진 카드 가장자리에 살짝 가려지게 합니다. 누를 수 있는 동안만 보여줍니다 */}
      {phase === 'live' && (
        <img className="camera__shutter-arrows" src={shutterArrows} alt="" aria-hidden="true" />
      )}

      {photo ? (
        // 프레임이 이미 사진 픽셀에 합성돼 있어서, 여기서는 CSS 프레임을 다시 씌우지 않습니다
        // (그러면 프레임 안에 프레임이 또 생겨요).
        <div className="camera__result-card">
          <img className="camera__result-photo" src={photo} alt="촬영된 인증샷 (프레임 포함)" />
        </div>
      ) : (
        <div className={`camera__polaroid camera__polaroid--${frame}`}>
          {phase === 'error' ? (
            <div className="camera__error-box">📷</div>
          ) : (
            <video className="camera__video" ref={videoRef} muted playsInline />
          )}
          {phase === 'countdown' && <div className="camera__countdown">{count}</div>}
          <p className="camera__date">{todayLabel()}</p>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 피그마의 원형 셔터(shutter_box) — 이 버튼을 눌러야 3초 카운트다운이 시작되고 자동 촬영됩니다 */}
      <button
        type="button"
        className={`camera__shutter-dot${phase === 'live' ? ' camera__shutter-dot--pulse' : ''}`}
        onClick={startCountdown}
        disabled={phase !== 'live'}
        aria-label="촬영 시작"
      />

      <div className="camera__actions">
        {phase === 'captured' ? (
          <>
            <button type="button" className="camera__cta camera__cta--ghost" onClick={retake}>
              다시 찍기
            </button>
            <button type="button" className="camera__cta" onClick={() => onNext(photo)}>
              다음 <span aria-hidden="true">→</span>
            </button>
          </>
        ) : (
          <button type="button" className="camera__cta camera__cta--ghost" onClick={onSkip}>
            {phase === 'error' ? '건너뛰기' : '촬영 건너뛰기'}
          </button>
        )}
      </div>
      <p className="camera__hint">촬영한 사진은 이 화면에서만 보여요 (서버에 저장되지 않아요)</p>
    </div>
  )
}
