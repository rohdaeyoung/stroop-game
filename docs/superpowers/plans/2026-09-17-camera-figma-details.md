# Camera Figma Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the Figma camera screen's basic-frame tiger decoration and 120 × 121 px double-ring shutter.

**Architecture:** Keep the existing `CameraStep` behavior and add two local Figma-exported presentation assets. JSX controls the basic-frame-only mascot, while existing ranking CSS controls exact placement and shutter sizing.

**Tech Stack:** React 18, plain CSS, Node test runner, Vite

## Global Constraints

- Do not alter camera capture behavior or navigation.
- Display the tiger decoration only for the `basic` frame.
- Keep Figma assets local; do not use expiring remote URLs at runtime.

---

### Task 1: Camera Figma visual details

**Files:**
- Create: `frontend/src/features/ranking/CameraStep.test.js`
- Create: `frontend/src/features/ranking/assets/camera-basic-frame.png`
- Create: `frontend/src/features/ranking/assets/shutter-button.svg`
- Modify: `frontend/src/features/ranking/CameraStep.jsx`
- Modify: `frontend/src/features/ranking/Ranking.css`

**Interfaces:**
- Consumes: existing `frame` state and `startCountdown` handler.
- Produces: decorative `.camera__mascot` image for the basic frame and Figma-backed `.camera__shutter-dot` rendering.

- [ ] **Step 1: Write failing source-level regression tests**

Assert that `CameraStep.jsx` conditionally renders the basic-frame asset and that `Ranking.css` declares a 120 × 121 px shutter using the exported SVG.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/features/ranking/CameraStep.test.js`

Expected: FAIL because the asset imports, conditional mascot, and 120 px shutter rules do not exist.

- [ ] **Step 3: Add the exact Figma assets and minimal JSX/CSS**

Download the Figma frame composite and shutter SVG, render the transparent frame overlay only for `frame === 'basic'`, and size the shutter to 120 × 121 px.

- [ ] **Step 4: Verify GREEN and build**

Run: `npm test` and `npm run build`.

Expected: all tests pass and Vite production build exits successfully.

- [ ] **Step 5: Verify the live camera route**

Open the running local screen and confirm the basic frame shows the tiger while other frames do not, and the shutter matches the Figma size and rings.
