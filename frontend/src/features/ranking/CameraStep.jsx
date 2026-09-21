// 👤 담당: 이혜원
// 09_인증샷 촬영 — 프레임 선택 + 한 번의 셔터로 2~3장 연속 촬영
import { useEffect, useMemo, useRef, useState } from 'react'
import celebrationHands from './assets/celebration-hands.png'
import celebrationLion from './assets/celebration-lion.png'
import shutterArrows from './assets/shutter-arrows.png'
import { CAMERA_FRAMES, composeFrame, getCameraFrame } from './cameraFrames.js'

const COUNTDOWN_SECONDS = 3

// Figma 실측: 프레임마다 사진 폭이 달라서 손 흔드는 사자와 안 겹치게 하려면
// 촬영 후 좌측 이동량과 사자 그룹 위치를 프레임별로 다르게 잡아야 함
const CAPTURED_SHIFT_X = { photomatic: 356, lion: 356, polaroid: 278, film: 324 }
const CAPTURED_CELEBRATION_LEFT = { photomatic: 1150, lion: 1150, polaroid: 990, film: 974 }

// 촬영 중(라이브)에는 프레임 박스를 실제 비율대로 작게 줄여서 좌측에 놓고,
// 그 옆에 확대경을 배치함 (피그마 재구성 반영) - 캔버스 기준 1920x1080.
// 포토매틱은 확대경이 없어서(가로로 넓어 이미 잘 보임) 그만큼 프레임 자체를
// 더 키움 - 위아래 글씨/셔터 버튼과 안 겹치는 선에서 최대치로 잡은 값.
const LIVE_FRAME_HEIGHT_BY_TYPE = { photomatic: 686, lion: 686, polaroid: 540, film: 540 }
// 포토매틱은 제목 바로 아래에 빈 공간이 남지 않도록 여백을 최소로 줄이고
// (다른 타입은 확대경과 나란히 놓여야 해서 기존 28px 그대로 둠) 그만큼을
// 전부 프레임 높이 쪽으로 돌림
const LIVE_FRAME_MARGIN_TOP_BY_TYPE = { photomatic: -4, lion: -4, polaroid: 28, film: 28 }
// 포토매틱은 확대경이 없어 프레임을 키울 공간이 더 필요함 - 셔터 버튼 자체의
// 위쪽 여백을 줄여서 그만큼 프레임에 더 배정함. 폴라로이드/필름은 반대로 -
// 프레임 자체는 그대로 두고, 셔터 버튼 여백을 늘려 버튼을 밀어내려서 그만큼
// 옆 확대경이 커질 세로 공간을 확보함
const SHUTTER_DOT_MARGIN_TOP_BY_TYPE = { photomatic: 8, lion: 8, polaroid: 132, film: 132 }
// 프레임 박스(+셔터 버튼 자체 여백)가 커지면 그 아래 셔터 버튼도 같이
// 밀려 내려감(변화량의 절반만큼) - 화살표는 절대 위치라 버튼을 따라가지
// 않으니 같은 공식으로 계산해서 항상 버튼 옆에 붙어있게 함.
// 902/540/28/24는 폴라로이드/필름 기준 실측값.
const SHUTTER_ARROWS_BASE_TOP = 902
const SHUTTER_ARROWS_BASE_SLOT = 540 + 28 + 24 // height + frame margin-top + dot margin-top
const LIVE_FRAME_LEFT = 40
const LIVE_MAGNIFIER_GAP = 60
const LIVE_MAGNIFIER_MAX_WIDTH = 1020
// CSS max-width/max-height on the <video> alone don't work here: with
// width/height:auto, a replaced element sizes to its OWN intrinsic
// dimensions (the camera's native capture resolution) whenever that's
// already smaller than the max-* caps, and only shrinks when it exceeds
// them. A real camera stream is very often smaller than these caps, so it
// never grows to fill them. Computing an explicit width/height in JS
// (below) - the same box-fitting math as object-fit:contain - sizes it
// correctly regardless of the stream's native resolution.
const LIVE_MAGNIFIER_MAX_HEIGHT = 685
// 폴라로이드/필름 슬롯 비율이 서로 달라서(1.48 vs 1.64) 확대경 박스 크기가
// 프레임을 바꿀 때마다 달라져 단차가 생겼음 - 스토리 필름 첫 슬롯 비율로
// 통일해서 두 프레임 다 항상 같은 확대경 크기(1020x623)를 쓰게 함
const LIVE_MAGNIFIER_RATIO = 388 / 237
// 프레임 전환 시 우측에서 밀려 들어오는 느낌을 주는 초기 오프셋 (슬라이드 킥)
const SLIDE_KICK_PX = 160
const LIVE_SELECTOR_RESERVED = 280

async function openCamera() {
  return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
}

function FrameArtwork({ frameKey, compact = false }) {
  if (frameKey === 'photomatic') {
    return (
      <div className={`camera-art camera-art--photomatic${compact ? ' camera-art--compact' : ''}`} aria-hidden="true">
        <span className="camera-art__top camera-art__top--left">TAKE YOUR MEMORY</span>
        <span className="camera-art__top camera-art__top--center">2026.09.22</span>
        <span className="camera-art__top camera-art__top--right">PHOTOMATIC</span>
        <strong className="camera-art__brand">LIKELION SKU</strong>
      </div>
    )
  }
  if (frameKey === 'lion') {
    return (
      <div className={`camera-art camera-art--lion${compact ? ' camera-art--compact' : ''}`} aria-hidden="true">
        <span className="camera-art__top camera-art__top--left">TAKE YOUR MEMORY</span>
        <span className="camera-art__top camera-art__top--center">2026.09.22</span>
        <span className="camera-art__top camera-art__top--right">LIKELION</span>
        <strong className="camera-art__brand">LIKELION SKU</strong>
      </div>
    )
  }
  if (frameKey === 'film') {
    return (
      <div className={`camera-art camera-art--film${compact ? ' camera-art--compact' : ''}`} aria-hidden="true">
        <span className="camera-art__top camera-art__top--left">STORY OF YOUR FILM</span>
        <span className="camera-art__top camera-art__top--right">▶ ▶ 45</span>
        <strong className="camera-art__brand">LIKELION SKU</strong>
        <span className="camera-art__film-mark">▶ ▶ 45</span>
      </div>
    )
  }
  return (
    <div className={`camera-art camera-art--polaroid${compact ? ' camera-art--compact' : ''}`} aria-hidden="true">
      <span className="camera-art__polaroid-label camera-art__polaroid-label--date">2026.09.22</span>
      <span className="camera-art__polaroid-label camera-art__polaroid-label--brand">LIKELION SKU</span>
    </div>
  )
}

export default function CameraStep({ onNext, onSkip }) {
  const videoRef = useRef(null)
  const magnifierVideoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [frame, setFrame] = useState('photomatic')
  const [slideKick, setSlideKick] = useState(0)
  const [phase, setPhase] = useState('starting') // starting | live | countdown | captured | error
  const [count, setCount] = useState(COUNTDOWN_SECONDS)
  const [shots, setShots] = useState([])
  const [photo, setPhoto] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const selectedFrame = useMemo(() => getCameraFrame(frame), [frame])
  // 프레임 타입을 바꾸면 작은 프레임 폭/확대경 위치가 즉시 스냅되던 걸,
  // "새 프레임이 우측에서 밀려 들어오는" 느낌으로 바꿔줌 - frame과
  // slideKick을 같은 클릭 핸들러에서 함께 바꿔서 한 번에 커밋시키면, 박스가
  // (이전 위치) → (새 위치 + kick, 우측으로 훅 밀린 위치)로 먼저 트랜지션되고,
  // 그 다음 프레임에서 kick만 0으로 되돌리면 (새 위치 + kick) → (새 위치)로
  // 다시 트랜지션됨 - 두 단계가 이어져서 우측에서 미끄러져 들어오는 것처럼 보임
  function selectFrame(key) {
    setFrame(key)
    setSlideKick(SLIDE_KICK_PX)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setSlideKick(0))
    })
  }
  // 라이브 화면 프레임 박스 폭은 고정 높이(타입별 LIVE_FRAME_HEIGHT_BY_TYPE)에
  // 프레임 실제 비율을 곱해서 구함 - 프레임마다 폭이 달라지고, 그만큼 좌측
  // 이동량과 확대경 시작 위치도 같이 움직여야 함
  const liveFrameHeight = LIVE_FRAME_HEIGHT_BY_TYPE[frame]
  const liveFrameMarginTop = LIVE_FRAME_MARGIN_TOP_BY_TYPE[frame]
  const shutterDotMarginTop = SHUTTER_DOT_MARGIN_TOP_BY_TYPE[frame]
  const liveFrameWidth = liveFrameHeight * (selectedFrame.width / selectedFrame.height)
  // 셔터 버튼은 프레임 박스 다음 순서라 프레임의 세로 공간(margin-top+height)과
  // 버튼 자체 여백이 커지면 그만큼(변화량의 절반) 같이 밀려 내려감 - 화살표는
  // 절대 위치라 버튼을 따라가지 않으니 같은 공식으로 계산해서 항상 버튼 옆에
  // 붙어있게 함
  const shutterArrowsTop =
    SHUTTER_ARROWS_BASE_TOP +
    (liveFrameMarginTop + liveFrameHeight + shutterDotMarginTop - SHUTTER_ARROWS_BASE_SLOT) / 2
  // 포토매틱은 이미 가로로 넓어서 확대경 없이도 잘 보임 - 확대경은 세로로
  // 작게 찍히는 폴라로이드/필름에만 붙임
  const showMagnifier = frame !== 'photomatic' && frame !== 'lion'
  const liveShiftX = showMagnifier ? (1920 - liveFrameWidth) / 2 - LIVE_FRAME_LEFT : 0
  const liveMagnifierX = LIVE_FRAME_LEFT + liveFrameWidth + LIVE_MAGNIFIER_GAP
  // 우측 프레임 선택 칸과 겹치지 않게 남는 공간만큼만 확대경을 줄임
  const liveMagnifierWidth = Math.min(LIVE_MAGNIFIER_MAX_WIDTH, 1920 - LIVE_SELECTOR_RESERVED - liveMagnifierX)

  async function attachStream(stream) {
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      await videoRef.current.play()
    }
    if (magnifierVideoRef.current) {
      magnifierVideoRef.current.srcObject = stream
      await magnifierVideoRef.current.play().catch(() => {})
    }
  }

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
        if (cancelled) return stream.getTracks().forEach((track) => track.stop())
        await attachStream(stream)
        setPhase('live')
      } catch (error) {
        setErrorMessage(error?.name === 'NotAllowedError'
          ? '카메라 권한이 필요해요. 브라우저 설정에서 허용해주세요.'
          : '카메라를 켤 수 없어요. HTTPS 주소이거나 카메라가 있는 기기인지 확인해주세요.')
        setPhase('error')
      }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  function startCountdown() {
    if (phase !== 'live') return
    setShots([])
    setPhoto(null)
    setCount(COUNTDOWN_SECONDS)
    setPhase('countdown')
  }

  useEffect(() => {
    if (phase !== 'countdown') return undefined
    if (count <= 0) {
      capture()
      return undefined
    }
    const id = setTimeout(() => setCount((value) => value - 1), 1000)
    return () => clearTimeout(id)
    // capture intentionally reads the latest render's shots and selected frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, count])

  useEffect(() => {
    if ((phase !== 'live' && phase !== 'countdown') || !videoRef.current || !streamRef.current) return
    videoRef.current.srcObject = streamRef.current
    videoRef.current.play().catch(() => {})
    if (magnifierVideoRef.current) {
      magnifierVideoRef.current.srcObject = streamRef.current
      magnifierVideoRef.current.play().catch(() => {})
    }
  }, [phase, shots.length, frame])

  async function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const still = document.createElement('canvas')
    still.width = video.videoWidth || 720
    still.height = video.videoHeight || 960
    const context = still.getContext('2d')
    context.translate(still.width, 0)
    context.scale(-1, 1)
    context.drawImage(video, 0, 0, still.width, still.height)

    const nextShots = [...shots, still]
    setShots(nextShots)
    if (nextShots.length < selectedFrame.slots.length) {
      setCount(COUNTDOWN_SECONDS)
      return
    }

    const result = await composeFrame(canvas, selectedFrame, nextShots)
    setPhoto(result)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    setPhase('captured')
  }

  async function retake() {
    setShots([])
    setPhoto(null)
    setCount(COUNTDOWN_SECONDS)
    setPhase('starting')
    try {
      await attachStream(await openCamera())
      setPhase('live')
    } catch {
      setErrorMessage('카메라를 다시 시작하지 못했어요.')
      setPhase('error')
    }
  }

  return (
    <div className={`camera__screen${phase === 'captured' ? ' camera__screen--captured' : ''}`}>
      <aside className="camera__frame-selector" aria-hidden={phase === 'captured'}>
        <p className="camera__frame-selector-title">프레임 선택!</p>
        {CAMERA_FRAMES.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`camera__frame-option${frame === option.key ? ' camera__frame-option--selected' : ''}`}
            onClick={() => selectFrame(option.key)}
            disabled={phase !== 'live'}
          >
            <span className={`camera__frame-preview camera__frame-preview--${option.key}`}>
              <FrameArtwork frameKey={option.key} compact />
            </span>
            <span>{option.label}</span>
            {frame === option.key && <span className="camera__frame-check" aria-hidden="true">✓</span>}
          </button>
        ))}
      </aside>

      {phase !== 'captured' && <p className="camera__pose-hint">어흥~ 포즈 취해보기</p>}
      <h1 className="camera__title">{phase === 'captured' ? '멋있는 사진이네요!' : '부스 인증샷을 남겨보세요!'}</h1>
      <p className="camera__subtitle">
        {phase === 'countdown' && `촬영 중 ${shots.length + 1}/${selectedFrame.slots.length} · ${count}초 후 자동 촬영`}
        {phase === 'error' && errorMessage}
        {phase === 'starting' && '카메라를 준비하고 있어요...'}
        {phase === 'captured' && '다음 버튼을 누르면 QR코드가 나와요'}
      </p>

      {phase === 'live' && (
        <img
          className="camera__shutter-arrows"
          src={shutterArrows}
          alt=""
          aria-hidden="true"
          style={{ top: `${shutterArrowsTop}px` }}
        />
      )}

      {showMagnifier && (phase === 'live' || phase === 'countdown') && (() => {
        // fit-within-box math (like object-fit:contain) computed explicitly
        // in JS - see LIVE_MAGNIFIER_MAX_HEIGHT above for why this can't be
        // left to the <video>'s own CSS width/height:auto sizing. Uses the
        // shared LIVE_MAGNIFIER_RATIO (not the active slot's own ratio) so
        // the box is the same size for every frame type - object-fit:cover
        // still crops each stream to fill it.
        let magnifierVideoWidth = liveMagnifierWidth
        let magnifierVideoHeight = magnifierVideoWidth / LIVE_MAGNIFIER_RATIO
        if (magnifierVideoHeight > LIVE_MAGNIFIER_MAX_HEIGHT) {
          magnifierVideoHeight = LIVE_MAGNIFIER_MAX_HEIGHT
          magnifierVideoWidth = magnifierVideoHeight * LIVE_MAGNIFIER_RATIO
        }
        return (
          <div
            className="camera__magnifier"
            aria-hidden="true"
            style={{ left: `${liveMagnifierX + slideKick}px`, width: `${liveMagnifierWidth}px` }}
          >
            <video
              className="camera__magnifier-video"
              ref={magnifierVideoRef}
              style={{ width: `${magnifierVideoWidth}px`, height: `${magnifierVideoHeight}px` }}
              muted
              playsInline
              autoPlay
            />
          </div>
        )
      })()}

      <div
        className="camera__polaroid"
        style={{
          '--captured-shift-x': `${CAPTURED_SHIFT_X[frame]}px`,
          '--live-shift-x': `${liveShiftX}px`,
          '--live-frame-width': `${liveFrameWidth}px`,
          '--live-frame-height': `${liveFrameHeight}px`,
          '--live-frame-margin-top': `${liveFrameMarginTop}px`,
          '--slide-kick': `${slideKick}px`,
        }}
      >
        {photo ? (
          <img className="camera__photo" src={photo} alt="촬영된 인증샷" />
        ) : phase === 'error' ? (
          <div className="camera__error-box">📷</div>
        ) : (
          <div
            className={`camera__frame-canvas camera__frame-canvas--${frame}`}
            style={{ '--frame-ratio': `${selectedFrame.width} / ${selectedFrame.height}` }}
          >
            {selectedFrame.slots.map((slot, index) => (
              (() => {
                const bleed = slot.bleed ?? 0
                const slotX = slot.x - bleed
                const slotY = slot.y - bleed
                const slotWidth = slot.width + bleed * 2
                const slotHeight = slot.height + bleed * 2
                return (
              <div
                key={`${frame}-${index}`}
                className="camera__frame-slot"
                style={{
                  left: `${(slotX / selectedFrame.width) * 100}%`,
                  top: `${(slotY / selectedFrame.height) * 100}%`,
                  width: `${(slotWidth / selectedFrame.width) * 100}%`,
                  height: `${(slotHeight / selectedFrame.height) * 100}%`,
                  transform: slot.rotation || slot.skewX
                    ? `rotate(${slot.rotation ?? 0}deg) skewX(${slot.skewX ?? 0}deg)`
                    : undefined,
                  transformOrigin: slot.rotationOrigin
                    ? `${((slot.rotationOrigin.x - slotX) / slotWidth) * 100}% ${((slot.rotationOrigin.y - slotY) / slotHeight) * 100}%`
                    : undefined,
                }}
              >
                {shots[index] ? (
                  <img src={shots[index].toDataURL('image/jpeg', 0.82)} alt={`${index + 1}번째 촬영`} />
                ) : index === shots.length ? (
                  <video className="camera__video" ref={videoRef} muted playsInline autoPlay />
                ) : (
                  <div className="camera__slot-waiting">{index + 1}</div>
                )}
              </div>
                )
              })()
            ))}
            <FrameArtwork frameKey={frame} />
          </div>
        )}
        {phase === 'countdown' && <div className="camera__countdown">{count}</div>}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <button
        type="button"
        className={`camera__shutter-dot${phase === 'live' ? ' camera__shutter-dot--pulse' : ''}`}
        onClick={startCountdown}
        disabled={phase !== 'live'}
        aria-label="촬영 시작"
        style={{ marginTop: `${shutterDotMarginTop}px` }}
      />

      {phase === 'captured' && (
        <div className="camera__celebration" aria-live="polite" style={{ left: `${CAPTURED_CELEBRATION_LEFT[frame]}px` }}>
          <p className="camera__celebration-message">즐거운 축제 되세요~!</p>
          <div className="camera__celebration-character" aria-hidden="true">
            <img className="camera__celebration-lion" src={celebrationLion} alt="" />
            <img className="camera__celebration-hands" src={celebrationHands} alt="" />
          </div>
        </div>
      )}

      {phase === 'captured' && (
        <div className="camera__actions">
          <button type="button" className="camera__cta camera__cta--ghost" onClick={retake}>다시 찍기</button>
          <button type="button" className="camera__cta" onClick={() => onNext(photo)}>다음 <span aria-hidden="true">→</span></button>
        </div>
      )}
      {phase === 'error' && (
        <div className="camera__actions">
          <button type="button" className="camera__cta camera__cta--ghost" onClick={onSkip}>건너뛰기</button>
        </div>
      )}
    </div>
  )
}
