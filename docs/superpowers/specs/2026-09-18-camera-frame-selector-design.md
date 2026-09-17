# Camera Frame Selector Refresh Design

## Goal

Make the frame selector names and thumbnails match the four camera frames currently used by the capture screen.

## Approved Labels

- `basic`: `네온 보석 프레임`
- `dots`: `땡땡이 프레임`
- `denim`: `컬러 버튼 프레임`
- `stamp`: `트로피 프레임`

Internal frame keys remain unchanged to avoid affecting capture state or stored behavior.

## Thumbnail Design

Every selector card displays the same image used by its full-size frame overlay. Remove the denim-only generated stripe preview and its pseudo-element so the colorful button artwork is visible. All thumbnails retain the shared `120px × 90px` viewport and `object-fit: cover` sizing, preventing card-size changes.

## Files

- `frontend/src/features/ranking/CameraStep.jsx`: update user-visible labels.
- `frontend/src/features/ranking/Ranking.css`: remove obsolete denim preview replacement styling.
- `frontend/src/features/ranking/CameraStep.test.js`: assert the approved labels and real-image previews.

## Verification

- All four approved labels are present.
- All four preview mappings use the displayed frame artwork.
- No denim-only image hiding or generated stripe overlay remains.
- Camera tests and the frontend production build pass.

## Scope

No frame image, mask, camera, backend, API, or ranking-flow changes.
