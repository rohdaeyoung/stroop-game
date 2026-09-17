# Camera Frame Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the basic, denim, and stamp camera frames with the three approved PNGs while preserving the dotted frame.

**Architecture:** Keep the existing `basic`, `dots`, `denim`, and `stamp` frame keys. Replace only three full-size PNG assets in place, then make the selector previews reuse the same full-size assets so preview and capture overlay cannot drift apart.

**Tech Stack:** React 18, Vite 5, PNG assets, Node test runner

## Global Constraints

- `dots` frame and preview remain byte-for-byte unchanged.
- Mapping: basic=image 1, denim=image 2, stamp=image 3.
- Do not modify backend code, APIs, database behavior, capture flow, or ranking flow.
- Add no dependencies.

---

### Task 1: Replace the three full-size frame assets

**Files:**
- Modify: `frontend/src/features/ranking/assets/camera-frame-basic.png`
- Modify: `frontend/src/features/ranking/assets/camera-frame-denim.png`
- Modify: `frontend/src/features/ranking/assets/camera-frame-stamp.png`
- Preserve: `frontend/src/features/ranking/assets/camera-frame-dots.png`

**Interfaces:**
- Consumes: the three approved source PNG files from `C:/Users/김나연/OneDrive/Desktop/ahung_최종/`
- Produces: transparent PNG overlays loaded by `FRAME_ASSETS`

- [ ] **Step 1: Record the dotted frame hash and inspect all source dimensions**

Run: `Get-FileHash frontend/src/features/ranking/assets/camera-frame-dots.png; inspect PNG width and height`

Expected: a saved SHA-256 value for later comparison and readable dimensions for all three inputs.

- [ ] **Step 2: Copy the approved images into the mapped full-size asset paths**

Mapping:

```text
ChatGPT Image ...01_01_19 (1).png -> camera-frame-basic.png
ChatGPT Image ...01_01_20 (2).png -> camera-frame-denim.png
ChatGPT Image ...01_01_20 (3).png -> camera-frame-stamp.png
```

- [ ] **Step 3: Verify file identity and dotted-frame preservation**

Run: `Get-FileHash` on each source/destination pair and on the dotted frame.

Expected: each source hash equals its mapped destination hash; the dotted frame hash is unchanged.

### Task 2: Synchronize selector previews

**Files:**
- Modify: `frontend/src/features/ranking/CameraStep.jsx:12-29`

**Interfaces:**
- Consumes: `FRAME_ASSETS`, an object mapping frame keys to imported PNG URLs
- Produces: `PREVIEW_ASSETS`, using the same URL for each frame key

- [ ] **Step 1: Update preview mapping**

Use the already-imported full-size frame assets for `basic`, `denim`, and `stamp`; preserve the existing dotted preview SVG:

```js
const PREVIEW_ASSETS = {
  basic: cameraFrameBasic,
  dots: cameraPreviewDots,
  denim: cameraFrameDenim,
  stamp: cameraFrameStamp,
}
```

Remove imports that become unused.

- [ ] **Step 2: Run focused tests**

Run: `npm test`

Expected: all Node tests pass with zero failures.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: Vite build exits successfully and emits the three PNG assets.

### Task 3: Verify the running camera UI

**Files:**
- Inspect: `frontend/src/features/ranking/CameraStep.jsx`
- Inspect: `frontend/src/features/ranking/Ranking.css:319-453`

**Interfaces:**
- Consumes: the running Vite page and the four frame selector options
- Produces: visual confirmation that selector previews and overlays match

- [ ] **Step 1: Confirm the development server serves all mapped assets**

Run HTTP requests for the camera page and generated asset URLs.

Expected: HTTP 200 for the page and each image.

- [ ] **Step 2: Inspect the camera screen at the target viewport**

Expected: dots unchanged; basic, denim, and stamp show their approved replacements; transparent camera areas are not covered by opaque pixels.

- [ ] **Step 3: Review the final Git diff**

Run: `git status --short` and `git diff --stat`.

Expected: only the plan, three mapped PNGs, and `CameraStep.jsx` are part of this implementation; pre-existing untracked files remain untouched.
