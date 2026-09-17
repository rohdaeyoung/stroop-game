# Camera Frame Asset Replacement Design

## Goal

Keep the existing dotted camera frame unchanged and replace the other three camera frames with the three approved PNG assets.

## Approved Mapping

- `basic` -> image 1, neon jewels and tiger mascot
- `denim` -> image 2, colorful arcade buttons and tiger mascot
- `stamp` -> image 3, crystal trophy frame
- `dots` -> unchanged

## Implementation

Preserve the existing frame keys and component behavior. Replace the three full-size PNG files in place so existing imports remain valid. Update the corresponding selector preview assets to show the same new artwork. Do not modify the dotted frame or its preview.

The source PNGs have transparent centers and will remain PNG assets. If their aspect ratios differ from the current camera canvas, use the existing overlay sizing behavior and adjust only per-frame camera-window clipping values when visual verification shows that the live camera image extends under opaque artwork or leaves unintended gaps.

## Verification

- Confirm the dotted frame files are byte-for-byte unchanged.
- Confirm all four frame assets load in the selector and camera overlay.
- Confirm the three replaced selector previews match their full-size frames.
- Run the frontend tests and production build.
- Inspect the camera demo at the target viewport for frame alignment.

## Scope

No changes to capture behavior, backend APIs, ranking flow, or unrelated visual assets.
