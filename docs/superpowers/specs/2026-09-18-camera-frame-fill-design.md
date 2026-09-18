# Camera Frame Full-Bleed Design

## Goal

Remove the date from the camera frame and eliminate visible gaps or layout shifts when switching among camera frames.

## Approved Design

All camera states use one fixed `889px × 667px` canvas. The live video, captured photo, and error fallback fill that canvas with `width: 100%`, `height: 100%`, and `object-fit: cover`. Frame PNGs remain same-size overlays above the media.

Per-frame `clip-path` windows are removed. The camera image therefore continues underneath opaque frame artwork and remains visible across every transparent part of each frame, preventing blank strips caused by mismatched transparent openings.

The rendered date, its formatting helper, and `.camera__date` styling are removed completely.

## Files

- `frontend/src/features/ranking/CameraStep.jsx`: remove date rendering and unused date formatter.
- `frontend/src/features/ranking/Ranking.css`: remove per-frame camera-window variables, clipping, and date styles; retain the shared fixed canvas dimensions.
- `frontend/src/features/ranking/CameraStep.test.js`: replace clipping/date expectations with full-bleed and no-date assertions.

## Verification

- Camera tests confirm no date markup or CSS remains.
- Camera tests confirm all media fills the shared `889px × 667px` canvas without `clip-path`.
- Camera tests confirm no frame variant overrides width or height.
- Frontend production build succeeds.

## Scope

No frame image changes, backend changes, API changes, capture-flow changes, or ranking-flow changes.
