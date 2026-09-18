# Camera Celebration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Animate the captured photo left, retire the frame picker, and reveal a waving festival lion in the vacated photo area.

**Architecture:** `CameraStep` derives all visual state from its existing `phase`; no new workflow state is introduced. A captured-state modifier controls selector/photo transitions, while a small celebration subtree composes the provided face and hands PNGs with CSS animation. Assets remain local and the existing `onNext`/`retake` flow is unchanged.

**Tech Stack:** React 18, JavaScript, CSS animations, PNG assets, Node test runner, Vite

## Global Constraints

- Frame buttons are enabled only during `live`.
- On `captured`, the selector exits left and becomes inaccessible.
- On `captured`, the photo and actions shift left only as far as the former selector area.
- The photo remains fully visible.
- The provided face and hands PNGs render only during `captured` with `즐거운 축제 되세요~!`.
- Retake restores the original layout and preserves the chosen frame.
- Respect `prefers-reduced-motion`.
- Do not modify backend code, API documentation, shared frontend files, or package dependencies.

---

### Task 1: Add captured-state behavior tests and local assets

**Files:**
- Create: `frontend/src/features/ranking/assets/celebration-lion.png`
- Create: `frontend/src/features/ranking/assets/celebration-hands.png`
- Modify: `frontend/src/features/ranking/CameraStep.test.js`

**Interfaces:**
- Produces local imports `celebrationLion` and `celebrationHands` for `CameraStep.jsx`.

- [ ] Add source tests asserting `camera__screen--captured`, selector `aria-hidden`, phase-gated lion/hands images, the exact festival message, and that buttons remain disabled outside `live`.
- [ ] Add CSS tests asserting selector exit, photo-stage left translation, celebration entrance, hand waving keyframes, and reduced-motion handling.
- [ ] Run `node --test src/features/ranking/CameraStep.test.js` and verify failures are caused by missing celebration behavior.
- [ ] Copy the exact two user-provided PNG files to the listed local asset names without modifying their bytes.

### Task 2: Implement the captured celebration layout

**Files:**
- Modify: `frontend/src/features/ranking/CameraStep.jsx`
- Modify: `frontend/src/features/ranking/Ranking.css`
- Test: `frontend/src/features/ranking/CameraStep.test.js`

**Interfaces:**
- Preserves `CameraStep({ onNext, onSkip })`, `onNext(photo)`, and `retake()`.
- Adds no server calls and no persistent state.

- [ ] Import both celebration assets and apply `camera__screen--captured` only when `phase === 'captured'`.
- [ ] Set selector `aria-hidden={phase === 'captured'}` and keep every option disabled unless `phase === 'live'`.
- [ ] Wrap the photo stage, shutter/actions, and celebration in stable layout classes; render celebration markup only during `captured`.
- [ ] Add CSS custom property `--captured-shift-x` and translate the photo/actions left by that fixed amount without changing their size.
- [ ] Animate the selector left with opacity and visibility/pointer-event removal.
- [ ] Position the lion in the vacated right area and animate the hands with a gentle alternating rotation; disable repeated movement under reduced-motion preference.
- [ ] Run `node --test src/features/ranking/CameraStep.test.js` and verify all camera tests pass.

### Task 3: Verify and commit

**Files:**
- Verify all frontend files changed by Tasks 1–2.

**Interfaces:**
- Confirms backend and API documentation remain untouched.

- [ ] Run all frontend tests by expanding `src/**/*.test.js` in PowerShell and passing the file list to `node --test`; expect zero failures.
- [ ] Run `npm run build`; expect Vite to complete without unresolved assets.
- [ ] Run `git diff --check`; expect no whitespace errors.
- [ ] Run `git diff --name-only -- backend docs/API.md`; expect no output.
- [ ] Commit only the plan, two assets, camera component, CSS, and tests with `feat(ranking): add captured photo celebration`.
