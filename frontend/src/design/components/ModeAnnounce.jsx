// 👤 담당: 나연
// 문제 시작 전 모드를 알려주는 인터스티셜 팝업 (05_플레이 모드강조 시안3).
// 부모가 잡아준 영역을 꽉 채우고, 아래→위로 뿅 올라왔다가 다시 뿅 내려가며
// 사라지는 연출까지 총 1.5초 (타이밍은 ModeAnnounce.css 의 keyframes 참고).
// 문제가 바뀔 때마다 announceKey 를 바꿔 리마운트시키면 애니메이션이 다시 재생됩니다.
import './ModeAnnounce.css'

const MODE_COPY = {
  color: { tag: 'COLOR', word: '색', hint: '글자의 "색"을 고르세요' },
  word: { tag: 'Meaning', word: '뜻', hint: '글자의 "뜻"을 고르세요' },
}

export default function ModeAnnounce({ mode, announceKey, onDone }) {
  const copy = MODE_COPY[mode]
  if (!copy) return null

  return (
    <div
      key={announceKey}
      className={`ds-mode-announce ds-mode-announce--${mode}`}
      onAnimationEnd={onDone}
    >
      <span className="ds-mode-announce__tag">{copy.tag}</span>
      <p className="ds-mode-announce__title">
        이번 문제는{' '}
        <span className="ds-mode-announce__highlight">{copy.word}</span>이에요!
      </p>
      <p className="ds-mode-announce__hint">{copy.hint}</p>
    </div>
  )
}
