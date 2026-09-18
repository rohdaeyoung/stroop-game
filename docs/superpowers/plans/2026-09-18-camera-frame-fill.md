# Camera Frame Full-Bleed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the camera-frame date and make every frame use one gap-free, fixed-size camera canvas without layout shifts.

**Architecture:** Keep the shared `889px × 667px` camera container and overlay every frame PNG at `100% × 100%`. Let live video, captured photos, and error fallback fill the entire shared canvas with `object-fit: cover`; remove per-frame clipping so opaque artwork masks the media naturally.

**Tech Stack:** React 18, CSS, Vite 5, Node test runner

## Global Constraints

- No frame image changes.
- No backend, API, capture-flow, or ranking-flow changes.
- All frame variants retain the same `889px × 667px` canvas.
- Add no dependencies.

---

### Task 1: Define full-bleed and no-date behavior in tests

**Files:**
- Modify: `frontend/src/features/ranking/CameraStep.test.js`

**Interfaces:**
- Consumes: `CameraStep.jsx` source and `Ranking.css` source
- Produces: assertions for absent date markup/CSS, absent clipping, and fixed shared dimensions

- [ ] **Step 1: Replace obsolete clipping assertions**

Assert that `.camera__video`, `.camera__photo`, and `.camera__error-box` use `inset: 0`, `width: 100%`, `height: 100%`, and `object-fit: cover`, and do not contain `clip-path`.

- [ ] **Step 2: Replace obsolete date assertions**

Assert that `CameraStep.jsx` does not contain `camera__date` or `todayLabel`, and `Ranking.css` does not contain `.camera__date`.

- [ ] **Step 3: Assert a single shared frame size**

Assert that `.camera__polaroid` contains `--camera-frame-width: 889px` and `--camera-frame-height: 667px`, while no `--dots`, `--denim`, or `--stamp` modifier overrides width or height.

- [ ] **Step 4: Verify the tests fail for the expected old behavior**

Run: `node --test src/features/ranking/CameraStep.test.js`

Expected: failures identify `clip-path`, `camera__date`, and `todayLabel` still present.

### Task 2: Implement the shared full-bleed canvas

**Files:**
- Modify: `frontend/src/features/ranking/CameraStep.jsx`
- Modify: `frontend/src/features/ranking/Ranking.css`
- Test: `frontend/src/features/ranking/CameraStep.test.js`

**Interfaces:**
- Consumes: the existing `camera__polaroid`, media, and frame-overlay elements
- Produces: one stable full-bleed camera canvas for all four frame keys

- [ ] **Step 1: Remove date code**

Delete the `todayLabel` helper and `<p className="camera__date">...</p>` element.

- [ ] **Step 2: Remove clipping code**

Delete `--camera-window` from `.camera__polaroid`, delete the denim/stamp window override rules, and delete `clip-path` from the shared media rule.

- [ ] **Step 3: Remove date styling**

Delete the complete `.camera__date` CSS rule.

- [ ] **Step 4: Verify focused tests pass**

Run: `node --test src/features/ranking/CameraStep.test.js`

Expected: all camera tests pass with zero failures.

- [ ] **Step 5: Verify production build**

Run: `npm run build`

Expected: Vite exits successfully and emits the four camera frame assets.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/ranking/CameraStep.jsx frontend/src/features/ranking/CameraStep.test.js frontend/src/features/ranking/Ranking.css
git commit -m "fix(ranking): fill camera frames without layout gaps"
```
