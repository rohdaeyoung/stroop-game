# Camera Completion Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 영상에서 확인된 촬영 완료 전환의 겹침과 최종 배치 불균형을 제거한다.

**Architecture:** 기존 완료 상태 CSS만 조정하고 React 상태 및 촬영 데이터 흐름은 유지한다. 정적 CSS 회귀 테스트로 타이밍과 배치 수치를 먼저 고정한다.

**Tech Stack:** React, CSS, Node.js built-in test runner, Vite

## Global Constraints

- 사진과 선택칸 이동은 `0.65초`를 유지한다.
- 사자는 `0.52초` 뒤 등장하며 오른쪽에서 `30px`만 이동한다.
- 사자는 현재보다 `60px`, 버튼은 기존보다 `35px` 더 위로 이동한다.
- 손 흔들기는 `1.1초`, `-3°~3°`, 세로 `3px` 범위로 제한한다.
- 촬영 로직, 프레임 합성, API와 백엔드는 변경하지 않는다.

---

### Task 1: 완료 모션과 배치 조정

**Files:**
- Modify: `frontend/src/features/ranking/CameraStep.test.js`
- Modify: `frontend/src/features/ranking/Ranking.css`

**Interfaces:**
- Consumes: `.camera__celebration`, `.camera__screen--captured .camera__actions`, `.camera__celebration-hands`
- Produces: 순차 등장 타이밍과 정렬된 완료 화면

- [ ] **Step 1: Write failing CSS regression tests**

```js
test('사자는 사진 이동이 거의 끝난 뒤 짧은 거리에서 등장한다', () => {
  const rule = rankingCss.match(/\.camera__celebration\s*\{[^}]*\}/s)?.[0] ?? ''
  assert.match(rule, /top:\s*210px/)
  assert.match(rule, /translateX\(30px\)/)
  assert.match(rule, /0\.65s 0\.52s/)
})

test('완료 버튼과 손 흔들기 배치를 영상 기준으로 정돈한다', () => {
  assert.match(rankingCss, /\.camera__screen--captured \.camera__actions\s*\{[^}]*translateY\(-85px\)/s)
  assert.match(rankingCss, /camera-hands-wave 1\.1s/)
  assert.match(rankingCss, /rotate\(-3deg\) translateY\(3px\)/)
  assert.match(rankingCss, /rotate\(3deg\) translateY\(-3px\)/)
})
```

- [ ] **Step 2: Verify RED**

Run: `cd frontend && node --test src/features/ranking/CameraStep.test.js`

Expected: FAIL because the current values are `top: 270px`, `48px`, delay `0.28s`, button `-50px`, and hand animation `0.75s` with `5deg/6px`.

- [ ] **Step 3: Implement the minimal CSS values**

```css
.camera__screen--captured .camera__actions { transform: translateY(-85px); }
.camera__celebration {
  top: 210px;
  transform: translateX(30px);
  animation: camera-celebration-enter 0.65s 0.52s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.camera__celebration-hands {
  animation: camera-hands-wave 1.1s ease-in-out infinite alternate;
}
@keyframes camera-hands-wave {
  from { transform: translateX(-50%) rotate(-3deg) translateY(3px); }
  to { transform: translateX(-50%) rotate(3deg) translateY(-3px); }
}
```

- [ ] **Step 4: Verify focused tests GREEN**

Run: `cd frontend && node --test src/features/ranking/CameraStep.test.js`

Expected: all focused tests PASS.

- [ ] **Step 5: Verify the complete frontend**

Run: `cd frontend && $testFiles = Get-ChildItem -Path 'src' -Recurse -Filter '*.test.js' | ForEach-Object { $_.FullName }; node --test $testFiles`

Expected: all frontend tests PASS.

Run: `cd frontend && npm run build`

Expected: Vite build exits with code 0.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/ranking/CameraStep.test.js frontend/src/features/ranking/Ranking.css docs/superpowers/plans/2026-09-18-camera-completion-motion.md
git commit -m "fix(ranking): smooth camera completion motion"
```
