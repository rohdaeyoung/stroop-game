# Three-Frame Burst Camera Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four legacy camera frames with three Figma-derived multi-shot frames that capture two or three distinct photos from one shutter press.

**Architecture:** Put immutable frame metadata and canvas composition in a focused `cameraFrames.js` module. `CameraStep.jsx` owns camera lifecycle and a small `live → countdown → captured` state flow, repeatedly captures one mirrored still per configured slot, and renders the composed result returned by the helper. The existing QR upload receives one final JPEG, so the backend remains unchanged.

**Tech Stack:** React 18, JavaScript modules, Canvas 2D, CSS, Node test runner, Vite

## Global Constraints

- Available frames are exactly `photomatic`, `polaroid`, and `film`.
- `photomatic` and `polaroid` capture two distinct photos; `film` captures three.
- The user presses the shutter only once; every shot uses a fresh `3 → 2 → 1` countdown.
- Preserve the existing `onNext(finalJpegDataUrl)` and `onSkip()` component contract.
- Upload only one final JPEG through the existing `POST /api/photos` flow.
- Do not modify backend code, API documentation, shared frontend files, or package dependencies.
- Remove all tracked legacy `basic`, `dots`, `denim`, and `stamp` frame/mask/preview assets after references are removed.

---

### Task 1: Define the three frame layouts and composition helper

**Files:**
- Create: `frontend/src/features/ranking/cameraFrames.js`
- Create: `frontend/src/features/ranking/cameraFrames.test.js`

**Interfaces:**
- Produces: `CAMERA_FRAMES`, an ordered array of `{ key, label, width, height, slots }` objects.
- Produces: `getCameraFrame(key)`, returning the matching frame or the first frame.
- Produces: `drawCover(ctx, image, slot)`, drawing an image with center-cropped cover behavior.
- Produces: `composeFrame(canvas, frame, images)`, returning a JPEG data URL after drawing photos and Figma-derived decoration.

- [ ] **Step 1: Write failing metadata tests**

Add Node tests asserting that keys equal `['photomatic', 'polaroid', 'film']`, labels are user-facing Korean strings, and slot counts equal `[2, 2, 3]`. Assert no serialized frame data contains `basic`, `dots`, `denim`, or `stamp`.

- [ ] **Step 2: Run the metadata tests and verify RED**

Run: `npm test -- src/features/ranking/cameraFrames.test.js`

Expected: FAIL because `cameraFrames.js` does not exist.

- [ ] **Step 3: Implement exact Figma geometry**

Define the frames with these source dimensions and photo slots:

```js
export const CAMERA_FRAMES = [
  {
    key: 'photomatic', label: '포토매틱', width: 736, height: 467,
    slots: [
      { x: 52, y: 60, width: 313, height: 324, rotation: 0 },
      { x: 371, y: 60, width: 313, height: 324, rotation: 0 },
    ],
  },
  {
    key: 'polaroid', label: '폴라로이드', width: 600, height: 670,
    slots: [
      { x: 63, y: 71, width: 387, height: 261, rotation: 6.88 },
      { x: 79, y: 390, width: 387, height: 263, rotation: -4.59 },
    ],
  },
  {
    key: 'film', label: '스토리 필름', width: 420, height: 560,
    slots: [
      { x: 16, y: 40, width: 388, height: 237, rotation: 0 },
      { x: 16, y: 288, width: 190, height: 226, rotation: 0 },
      { x: 214, y: 288, width: 190, height: 226, rotation: 0 },
    ],
  },
]
```

Add `getCameraFrame` with a first-frame fallback.

- [ ] **Step 4: Verify metadata tests GREEN**

Run: `npm test -- src/features/ranking/cameraFrames.test.js`

Expected: metadata tests PASS.

- [ ] **Step 5: Write failing cover/composition tests**

Use a recording canvas context to assert `drawCover` crops landscape and portrait images centrally, wraps rotated slots in `save/translate/rotate/restore`, and `composeFrame` draws exactly the frame's slot count before requesting `canvas.toDataURL('image/jpeg', 0.85)`.

- [ ] **Step 6: Run composition tests and verify RED**

Run: `npm test -- src/features/ranking/cameraFrames.test.js`

Expected: FAIL because `drawCover` and `composeFrame` are not implemented.

- [ ] **Step 7: Implement canvas composition**

Implement `drawCover` using `scale = Math.max(slot.width / image.width, slot.height / image.height)` and centered source cropping. Implement frame decoration using Canvas 2D fills, gradients, shadows, transforms, and text matching the Figma context. Draw photo slots first and decoration second so every output is a single self-contained JPEG.

- [ ] **Step 8: Verify Task 1 GREEN and commit**

Run: `npm test -- src/features/ranking/cameraFrames.test.js`

Expected: all Task 1 tests PASS.

Commit only the two Task 1 files with `feat(ranking): add three camera frame layouts`.

### Task 2: Convert CameraStep to one-press sequential capture

**Files:**
- Modify: `frontend/src/features/ranking/CameraStep.jsx`
- Modify: `frontend/src/features/ranking/CameraStep.test.js`

**Interfaces:**
- Consumes: `CAMERA_FRAMES`, `getCameraFrame`, and `composeFrame` from Task 1.
- Preserves: `CameraStep({ onNext, onSkip })` and `onNext(finalJpegDataUrl)`.

- [ ] **Step 1: Replace legacy source assertions with failing burst-flow assertions**

Update `CameraStep.test.js` to assert imports from `cameraFrames.js`, initial frame `photomatic`, selection from `CAMERA_FRAMES`, an array of captured stills, a single shutter start, automatic reset to `COUNTDOWN_SECONDS` while the collected count is below `frame.slots.length`, and composition only at completion. Assert the source contains none of the eight legacy frame/mask imports.

- [ ] **Step 2: Run the component source tests and verify RED**

Run: `npm test -- src/features/ranking/CameraStep.test.js`

Expected: FAIL because the component still uses four legacy frames and one-shot capture.

- [ ] **Step 3: Implement one-press burst capture**

Replace the legacy asset maps with `CAMERA_FRAMES`. Keep the camera stream open across shots. On shutter press, clear prior stills and start the first three-second countdown. At zero, copy the mirrored video frame to an offscreen canvas and store an `Image`/data URL. If more slots remain, reset count to three while staying in `countdown`; otherwise call `composeFrame`, set the final photo, stop the stream, and enter `captured`.

- [ ] **Step 4: Add progress and lock frame selection during capture**

Show `촬영 중 1/2 · 3초 후 자동 촬영` (with live indices/count) and disable frame buttons whenever phase is not `live`. Render a shared frame preview component with one live video duplicated into the frame's slots before capture; after completion render the composed JPEG. Keep one visible shutter button, enabled only in `live`.

- [ ] **Step 5: Reset the whole sequence on retake**

`retake()` clears captured stills, final JPEG, shot index, and countdown, reopens the camera, and retains the chosen frame.

- [ ] **Step 6: Run Task 2 tests and commit**

Run: `npm test -- src/features/ranking/CameraStep.test.js src/features/ranking/cameraFrames.test.js`

Expected: all ranking camera tests PASS.

Commit Task 2 files with `feat(ranking): capture frame photos in sequence`.

### Task 3: Match the selector and preview layout to the three new frames

**Files:**
- Modify: `frontend/src/features/ranking/Ranking.css`
- Modify: `frontend/src/features/ranking/CameraStep.test.js`

**Interfaces:**
- Consumes: frame modifier classes `camera__frame--photomatic`, `camera__frame--polaroid`, and `camera__frame--film` rendered by Task 2.
- Produces: consistent 889×667 stage sizing with each source aspect ratio contained inside it.

- [ ] **Step 1: Add failing CSS assertions**

Assert the selector has three cards, old denim/stamp selectors are absent, preview photos use `object-fit: cover`, and each new modifier defines the correct source aspect ratio through CSS custom properties.

- [ ] **Step 2: Run CSS assertions and verify RED**

Run: `npm test -- src/features/ranking/CameraStep.test.js`

Expected: FAIL on missing new modifiers and remaining legacy CSS.

- [ ] **Step 3: Implement new frame CSS**

Remove mask-based full-canvas media rules and legacy modifiers. Center a `.camera__frame-canvas` inside the existing stage and size it with source ratios `736/467`, `600/670`, and `420/560`. Style `.camera__frame-slot` as clipped absolute regions and counter-rotate/crop media where required. Preserve countdown overlay, shutter, actions, and responsive kiosk scaling.

- [ ] **Step 4: Run Task 3 tests and commit**

Run: `npm test -- src/features/ranking/CameraStep.test.js src/features/ranking/cameraFrames.test.js`

Expected: all tests PASS.

Commit with `style(ranking): match three Figma camera frames`.

### Task 4: Remove legacy tracked assets and verify the complete frontend

**Files:**
- Delete: `frontend/src/features/ranking/assets/camera-frame-basic.png`
- Delete: `frontend/src/features/ranking/assets/camera-frame-dots.png`
- Delete: `frontend/src/features/ranking/assets/camera-frame-denim.png`
- Delete: `frontend/src/features/ranking/assets/camera-frame-stamp.png`
- Delete: `frontend/src/features/ranking/assets/camera-mask-basic.png`
- Delete: `frontend/src/features/ranking/assets/camera-mask-dots.png`
- Delete: `frontend/src/features/ranking/assets/camera-mask-denim.png`
- Delete: `frontend/src/features/ranking/assets/camera-mask-stamp.png`
- Delete: `frontend/src/features/ranking/assets/camera-preview-basic.svg`
- Delete: `frontend/src/features/ranking/assets/camera-preview-denim.png`
- Delete: `frontend/src/features/ranking/assets/camera-preview-dots.svg`
- Delete: `frontend/src/features/ranking/assets/camera-preview-stamp.svg`

**Interfaces:**
- Preserves: `QrStep` receives one JPEG data URL and calls the existing photo upload API.

- [ ] **Step 1: Confirm no production or test references remain**

Run: `rg -n "camera-(frame|mask|preview)-(basic|dots|denim|stamp)|camera__.*(basic|dots|denim|stamp)" frontend/src`

Expected: no matches.

- [ ] **Step 2: Delete only the tracked legacy assets**

Delete the twelve listed files. Do not delete the user's untracked `camera-basic-frame.png`.

- [ ] **Step 3: Run complete verification**

Run: `npm test`

Expected: all frontend tests PASS.

Run: `npm run build`

Expected: Vite production build succeeds with no unresolved assets.

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 4: Smoke-test the existing server**

Open `http://localhost:5173/ranking`, select each frame, and verify one shutter press yields 2, 2, and 3 captures respectively. Confirm retake restarts the sequence and confirmation reaches the QR screen.

- [ ] **Step 5: Commit cleanup**

Commit only the twelve tracked deletions and any final test correction with `chore(ranking): remove legacy camera frames`.
