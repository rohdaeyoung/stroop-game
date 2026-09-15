// 👤 담당: 이혜원
// 10_QR 코드 발송 (QR Code)
// ⚠️ 실제 사진 업로드/다운로드 백엔드가 없어서 진짜 QR은 아직 못 만들어요.
//    피그마 디자인대로 화면은 배치하되, "준비 중" 상태로 대체해뒀습니다.
export default function QrStep({ onHome }) {
  return (
    <div className="qr__screen">
      <h1 className="qr__title">큐알코드를 스캔하고 사진을 받아가세요!</h1>
      <p className="qr__subtitle">카메라로 큐알코드를 비추면 사진을 다운로드할 수 있어요</p>

      <div className="qr__card">
        <p className="qr__placeholder">
          🚧
          <br />
          큐알 발송 기능은
          <br />
          준비 중이에요
        </p>
      </div>

      <p className="qr__caption">사진을 서버로 보내는 기능은 백엔드 업로드 API가 준비되면 연결할게요</p>

      <button type="button" className="qr__cta" onClick={onHome}>
        처음 화면으로 돌아가기
      </button>
    </div>
  )
}
