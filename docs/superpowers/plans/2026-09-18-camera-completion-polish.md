# Camera Completion Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 촬영 완료 화면의 전환, 폴라로이드 배경, 버튼 위치와 클릭 피드백을 승인된 디자인대로 다듬는다.

**Architecture:** 기존 `Ranking.css`의 상태 선택자만 확장하며 JSX와 데이터 흐름은 유지한다. 정적 CSS 회귀 테스트로 각 상태의 필수 속성을 고정한 뒤 최소 CSS 변경으로 통과시킨다.

**Tech Stack:** React, Vite, CSS, Node.js built-in test runner

## Global Constraints

- 프론트엔드 CSS와 회귀 테스트만 수정한다.
- JSX 동작, 라우팅, API 및 백엔드는 변경하지 않는다.
- 이동 지속시간은 `0.65초`, easing은 `cubic-bezier(0.22, 1, 0.36, 1)`로 통일한다.
- 완료 버튼은 `50px` 위로 이동하고 화면 가로 중앙을 유지한다.
- 클릭 시 `scale(0.94)`와 흰색 외곽·내부 글로우를 적용한다.

---

### Task 1: 완료 화면 전환과 폴라로이드 배경

**Files:**
- Modify: `frontend/src/features/ranking/CameraStep.test.js`
- Modify: `frontend/src/features/ranking/Ranking.css`

**Interfaces:**
- Consumes: `.camera__screen--captured`, `.camera__frame-selector`, `.camera__polaroid`, `.camera__frame-canvas--polaroid`
- Produces: 동기화된 완료 전환과 투명한 폴라로이드 외곽 배경

- [ ] **Step 1: Write the failing tests**

```js
test('사진과 프레임 선택칸은 같은 속도로 왼쪽 이동한다', () => {
  const selectorRule = rankingCss.match(/\.camera__frame-selector\s*\{[^}]*\}/s)?.[0] ?? ''
  assert.match(selectorRule, /transform 0\.65s cubic-bezier\(0\.22, 1, 0\.36, 1\)/)
  assert.match(selectorRule, /opacity 0\.65s cubic-bezier\(0\.22, 1, 0\.36, 1\)/)
  assert.match(rankingCss, /transition-delay:\s*0s, 0s, 0\.65s/)
})

test('촬영 완료 폴라로이드의 바깥 검은 배경은 투명하다', () => {
  assert.match(rankingCss, /\.camera__screen--captured[\s\S]*\.camera__frame-canvas--polaroid\s*\{[^}]*background:\s*transparent/)
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `cd frontend && node --test src/features/ranking/CameraStep.test.js`

Expected: FAIL because selector opacity is `0.35s`, visibility delay is `0.55s`, and no captured polaroid transparency rule exists.

- [ ] **Step 3: Implement the minimal CSS**

```css
.camera__frame-selector {
  transition:
    transform 0.65s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
    visibility 0s linear 0s;
}
.camera__screen--captured .camera__frame-selector {
  transition-delay: 0s, 0s, 0.65s;
}
.camera__screen--captured .camera__frame-canvas--polaroid {
  background: transparent;
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `cd frontend && node --test src/features/ranking/CameraStep.test.js`

Expected: all `CameraStep.test.js` tests PASS.

### Task 2: 완료 버튼 위치와 전체 CTA 클릭 피드백

**Files:**
- Modify: `frontend/src/features/ranking/CameraStep.test.js`
- Modify: `frontend/src/features/ranking/Ranking.css`

**Interfaces:**
- Consumes: `.ranking__cta`, `.camera__actions`, `.camera__cta`
- Produces: 중앙을 유지한 상향 배치와 공통 눌림·화이트 글로우 피드백

- [ ] **Step 1: Write the failing tests**

```js
test('촬영 완료 버튼은 중앙에서 50px 위로 이동한다', () => {
  const actionsRule = rankingCss.match(/\.camera__screen--captured \.camera__actions\s*\{[^}]*\}/s)?.[0] ?? ''
  assert.match(actionsRule, /transform:\s*translateY\(-50px\)/)
  assert.doesNotMatch(actionsRule, /translateX/)
})

test('주요 버튼은 누를 때 흰색 글로우와 눌림 피드백을 준다', () => {
  const activeRules = rankingCss.match(/:(?:active)[^{]*\{[^}]*\}/g)?.join('\n') ?? ''
  assert.match(activeRules, /scale\(0\.94\)/)
  assert.match(activeRules, /rgba\(255,\s*255,\s*255/)
  assert.match(rankingCss, /\.ranking__cta:focus-visible/)
  assert.match(rankingCss, /\.camera__cta:focus-visible/)
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `cd frontend && node --test src/features/ranking/CameraStep.test.js`

Expected: FAIL because the completed action offset and white press glow do not exist.

- [ ] **Step 3: Implement the minimal CSS**

```css
.ranking__cta,
.camera__cta {
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
}
.ranking__cta:active,
.camera__cta:active {
  transform: scale(0.94);
  box-shadow: 0 0 18px 5px rgba(255, 255, 255, 0.85), inset 0 0 16px rgba(255, 255, 255, 0.55);
}
.ranking__cta:focus-visible,
.camera__cta:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 5px;
}
.camera__screen--captured .camera__actions {
  transform: translateY(-50px);
}
```

- [ ] **Step 4: Preserve reduced motion behavior**

Add `.ranking__cta` and `.camera__cta` to the reduced-motion transition-duration rule so the press transition becomes `0.01ms` while the pressed state remains visible.

- [ ] **Step 5: Run focused and full verification**

Run: `cd frontend && node --test src/features/ranking/CameraStep.test.js`

Expected: focused tests PASS.

Run: `cd frontend && $testFiles = Get-ChildItem -Path 'src' -Recurse -Filter '*.test.js' | ForEach-Object { $_.FullName }; node --test $testFiles`

Expected: all frontend tests PASS.

Run: `cd frontend && npm run build`

Expected: Vite production build exits with code 0.

Run: `git diff --check && git diff --name-only`

Expected: no whitespace errors; only the planned frontend test/CSS files and this plan are changed, with no backend paths.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/ranking/CameraStep.test.js frontend/src/features/ranking/Ranking.css docs/superpowers/plans/2026-09-18-camera-completion-polish.md
git commit -m "fix(ranking): polish camera completion interactions"
```
