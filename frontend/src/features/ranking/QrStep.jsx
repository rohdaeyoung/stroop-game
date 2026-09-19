// 👤 담당: 이혜원
// 10_QR 코드 발송 (QR Code)
//
// 찍은 사진을 서버에 올리고(5분 보관), 그 주소를 QR 로 만들어 보여줍니다.
// 참가자가 휴대폰으로 스캔하면 사진이 열리고, 길게 눌러 저장할 수 있습니다.
import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { api, apiOrigin, getApiErrorMessage } from '../../shared/api/client.js'

/** 남은 시간을 "4:37" 형태로 */
function formatRemain(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function QrStep({ photo, onHome }) {
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState('uploading') // uploading | ready | error
  const [error, setError] = useState('')
  const [remain, setRemain] = useState(0)

  // 사진 업로드 → QR 생성
  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!photo) {
        setError('사진이 없어요. 다시 촬영해 주세요.')
        setPhase('error')
        return
      }

      try {
        // dataURL → Blob (서버는 multipart 로 받습니다)
        const blob = await (await fetch(photo)).blob()
        const res = await api.uploadPhoto(blob)
        if (cancelled) return

        const url = `${apiOrigin()}/photos/${res.token}`
        await QRCode.toCanvas(canvasRef.current, url, {
          width: 320,
          margin: 1,
          color: { dark: '#0b0b19', light: '#ffffff' },
        })
        if (cancelled) return

        setRemain(res.expiresInSeconds ?? 300)
        setPhase('ready')
      } catch (e) {
        if (cancelled) return
        setError(getApiErrorMessage(e))
        setPhase('error')
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [photo])

  // 남은 보관 시간 카운트다운
  useEffect(() => {
    if (phase !== 'ready' || remain <= 0) return
    const id = setTimeout(() => setRemain((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [phase, remain])

  const expired = phase === 'ready' && remain <= 0

  return (
    <div className="qr__screen">
      <h1 className="qr__title">큐알코드를 스캔하고 사진을 받아가세요!</h1>
      <p className="qr__subtitle">어흥~사진 챙기는거 잊지 마세요!</p>

      <div className="qr__card">
        {phase === 'uploading' && <p className="qr__placeholder">사진을 올리는 중이에요...</p>}

        {phase === 'error' && (
          <p className="qr__placeholder qr__placeholder--error">
            사진을 보내지 못했어요
            <br />
            <span className="qr__error-detail">{error}</span>
          </p>
        )}

        {expired && (
          <p className="qr__placeholder">
            보관 시간이 끝났어요
            <br />
            <span className="qr__error-detail">사진은 안전하게 지워졌습니다</span>
          </p>
        )}

        {/* 캔버스는 항상 두고 보이기만 전환합니다 — QRCode.toCanvas 가 ref 를 필요로 합니다 */}
        <canvas
          ref={canvasRef}
          className="qr__canvas"
          style={{ display: phase === 'ready' && !expired ? 'block' : 'none' }}
        />
      </div>

      {phase === 'ready' && !expired && (
        <p className="qr__timer">{formatRemain(remain)} 뒤에 사라져요</p>
      )}

      <p className="qr__caption">사진은 5분 뒤 서버에서 자동으로 지워집니다</p>

      <button type="button" className="qr__cta" onClick={onHome}>
        처음 화면으로 돌아가기
      </button>
    </div>
  )
}
