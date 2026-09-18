# Camera Figma Details Design

## Scope

Match the Figma camera screen for the two requested visual details only:

- Show the exact Figma tiger decoration on the basic photo frame only.
- Render the shutter at its Figma-exported 120 × 121 px size with the double-ring artwork.

Frame selection, camera capture behavior, copy, skip actions, and other layout differences remain unchanged.

## Implementation

- Store the exported Figma assets locally under `frontend/src/features/ranking/assets/` so the UI does not depend on expiring URLs.
- Add the tiger as a decorative, non-interactive image inside the polaroid and conditionally render it only when `frame === 'basic'`.
- Replace the CSS-drawn 72 px shutter appearance with the exported 120 × 121 px Figma shutter asset while retaining the existing button, click handler, disabled state, and pulse behavior.

## Verification

- Add source-level regression tests for conditional mascot rendering and the shutter dimensions/artwork.
- Run the complete frontend test suite and production build.
- Check the camera screen in the running development server.
