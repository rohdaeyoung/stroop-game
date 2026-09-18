// 👤 담당: 이혜원
// 09_인증샷 촬영 — 프레임 선택 + 한 번의 셔터로 2~3장 연속 촬영
import { useEffect, useMemo, useRef, useState } from 'react'
import celebrationHands from './assets/celebration-hands.png'
import celebrationLion from './assets/celebration-lion.png'
import shutterArrows from './assets/shutter-arrows.png'
import { CAMERA_FRAMES, composeFrame, getCameraFrame } from './cameraFrames.js'

const COUNTDOWN_SECONDS = 3

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
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [frame, setFrame] = useState('photomatic')
  const [phase, setPhase] = useState('starting') // starting | live | countdown | captured | error
  const [count, setCount] = useState(COUNTDOWN_SECONDS)
  const [shots, setShots] = useState([])
  const [photo, setPhoto] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const selectedFrame = useMemo(() => getCameraFrame(frame), [frame])

  async function attachStream(stream) {
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      await videoRef.current.play()
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
  }, [phase, shots.length, frame])

  function capture() {
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

    const result = composeFrame(canvas, selectedFrame, nextShots)
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
        <p className="camera__frame-selector-title">프레임 선택</p>
        {CAMERA_FRAMES.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`camera__frame-option${frame === option.key ? ' camera__frame-option--selected' : ''}`}
            onClick={() => setFrame(option.key)}
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

      <div className="camera__badge">&quot;어흥~샷 찍고 가기&quot;</div>
      <h1 className="camera__title">부스 인증샷을 남겨보세요!</h1>
      <p className="camera__subtitle">
        {phase === 'countdown' && `촬영 중 ${shots.length + 1}/${selectedFrame.slots.length} · ${count}초 후 자동 촬영`}
        {phase === 'error' && errorMessage}
        {phase === 'starting' && '카메라를 준비하고 있어요...'}
        {phase === 'live' && `셔터를 한 번 누르면 ${selectedFrame.slots.length}장이 자동으로 촬영돼요!`}
        {phase === 'captured' && '어흥샷 완성! 마음에 들어요?'}
      </p>

      {phase === 'live' && <img className="camera__shutter-arrows" src={shutterArrows} alt="" aria-hidden="true" />}

      <div className="camera__polaroid">
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
      />

      {phase === 'captured' && (
        <div className="camera__celebration" aria-live="polite">
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
      <p className="camera__hint">촬영한 사진은 결과 화면과 함께 저장돼요</p>
    </div>
  )
}
