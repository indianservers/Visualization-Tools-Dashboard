# Icon animation verification

Verification date: 17 October 2026 (Asia/Calcutta).

The original 3D PNG artwork remains visible throughout playback. Movable internal
components reuse cropped pixels from the same original artwork; animated SVG lights,
traces, signals and text sit over it. Playback no longer crossfades to a flat diagram.
The original PNG assets are unchanged.

## Browser coverage

- Chromium desktop: 1440 × 1000 CSS pixels.
- Chromium mobile emulation: Pixel 7, Android 14 user agent, 412 × 839 CSS pixels,
  device scale factor 2.625, touch enabled.
- Additional layout checks: 360, 768 and 840 CSS pixels wide.
- Every icon is captured at rest and at 600, 1600 and 2400 ms during playback.
  Cards are centered before capture, and four points inside each icon are checked
  for obstruction by the sticky header or fixed mobile navigation.

## Verification matrix

Each row covers asset loading, original-art visibility, internal animation playback,
unchanged card bounds, desktop hover, keyboard focus, mobile touch event handling,
reduced motion, and screenshots at all four sampled states. Native touch release is
also tested for all 25 in an isolated card harness, avoiding external navigation.

| Icon | Internal demonstration | Desktop | Mobile |
|---|---|---|---|
| Maths | Blue light draws π over the original 3D symbol; tiny symbols appear | Pass | Pass |
| Physics | Three elliptical electron trajectories; stationary nucleus | Pass | Pass |
| Biology | Original shaded base-pair components twist within the helix | Pass | Pass |
| Chemistry | Electron orbits, nucleus illumination and a brief bond inside the flask | Pass | Pass |
| Deep Learning | Three successive neural connection layers illuminate | Pass | Pass |
| Machine Learning Algorithms | Original glossy nodes rearrange; learned edges illuminate | Pass | Pass |
| Computer Organization | Binary instructions and data bus signals on the original monitor | Pass | Pass |
| AI Algorithms | Original eye components blink and look around, then illuminate | Pass | Pass |
| DAA | Traversal path draws through successively activated graph nodes | Pass | Pass |
| Data Structures | A shaded record enters, one layer lights, and a record exits | Pass | Pass |
| Computer Vision | Horizontal scan, object detection and locking brackets inside the eye | Pass | Pass |
| VLSI | Chip pin signals and core illumination over the original chip | Pass | Pass |
| Digital Logic | AND inputs activate before the output; the third original input is held high | Pass | Pass |
| Electronics Labs | PCB current trace and sequential LED illumination | Pass | Pass |
| IQ Labs | Filament stroke, progressive heat and a restrained idea glow | Pass | Pass |
| NLP | Chat dots illuminate in order; a waveform changes into token elements | Pass | Pass |
| Cryptography | Original shackle opens/closes, keyhole flashes and cipher bits appear | Pass | Pass |
| Probability & Statistics | Original shaded bar components grow; a trend line draws | Pass | Pass |
| Business Intelligence | Column illumination rises; the lens scans and a bar is selected | Pass | Pass |
| Database Management | Packet input, record selection and result retrieval | Pass | Pass |
| Operating Systems | Original silver gear rotates within a fixed window; process lights sequence | Pass | Pass |
| Circuits Simulator app | Current passes through the circuit before LED activation | Pass | Pass |
| Maths app | Numbers become an equation in the calculator display; the answer lights | Pass | Pass |
| Biology app | Original base-pair surfaces turn in perspective and illuminate in order | Pass | Pass |
| Chemistry app | Two shaded components approach and bond inside the original blue flask | Pass | Pass |

## Issues fixed during browser review

1. Removed the original-art fade and full replacement SVG diagram.
2. Reused the original image materials for moving nodes, eye components, DNA base
   pairs, lock shackle, chart bars, gear and app bonding components.
3. Corrected chart crop boundaries and the common bar baseline, eliminating fixed
   rims and cutout gaps. Business Intelligence uses rising light inside its original
   columns so the magnifier and the chart remain intact.
4. Aligned the eye crops, blink pivot, lock shackle and gear silhouette/pivot.
5. Made subject SVGs fill their actual tile at mobile and tablet breakpoints,
   eliminating the former 108px-tall SVG inside 98px/84px tiles.
6. Added a 180ms transition back to idle on pointer/focus exit, retaining focused
   playback when the pointer leaves and retaining touch playback after release.
7. Interaction checks viewport geometry immediately, avoiding reliance on a delayed
   IntersectionObserver callback after focus scrolls a card into view.
8. Corrected the browser test's Science & Maths count to five.
9. Corrected screenshot positioning and added an obstruction assertion so fixed
   mobile navigation cannot conceal part of an icon in a passing visual capture.

## Shared behavior and performance checks

The subject registry contains 21 unique identifiers; the app registry contains four
separate identifiers. The featured IQ Lab and three Learning Tools links also use
the corresponding animated component, giving 29 rendered icon instances.

All sequences are finite and finish within four seconds, without loops. Visible
introductions are staggered; viewport exit cancels playback. Pointer entry, focus
and touch start the corresponding lesson. Pointer/focus exit returns to rest;
reduced-motion preference changes cancel playback. Hiding the document and removing
rendered SVGs are covered by lifecycle unit tests. Native browser tests verify
that all 29 icon instances release animation work when the page settles to idle.

Card widths/heights, icon proportions and existing destination URLs are checked.
Search and category filtering still work. No animation dependency is shipped to the
browser; Playwright is a development-only dependency.

## Commands and evidence

- `npm test`: 34 tests pass.
- `npm run test:browser`: 10 tests pass, 2 intentionally skipped (native touch is
  mobile-only; the additional width sweep runs in the desktop project).
- After strengthening the screenshot obstruction check, the two all-icon visual
  tests are rerun for desktop and mobile. Final result: 2 pass; no failures.
- `node --check dist/icon-motion.js`, `node --check dist/app-v2.js`: pass.
- `git diff --check` for the changed tracked implementation files: pass.
- Build and lint scripts are absent. `npm run build --if-present` and
  `npm run lint --if-present` complete without an applicable command.

The browser suite writes evidence under `browser-tests/results/` (ignored by Git):

- `desktop-idle.png`, `desktop-early.png`, `desktop-middle.png`, `desktop-late.png`.
- `mobile-idle.png`, `mobile-early.png`, `mobile-middle.png`, `mobile-late.png`.
- `desktop-page.png`, `mobile-page.png`: complete dashboard layouts.
- `desktop-matrix.json`, `mobile-matrix.json`: all 25 animation IDs and measured bounds.
- `desktop-idle.json`, `mobile-idle.json`: zero active animations for 29 idle icons.
- `interaction-report.json`: full 12-case suite result before the screenshot-only rerun.
- `report.json`: strengthened desktop/mobile visual rerun result.

## Verification boundary

This is real Chromium browser execution with desktop and mobile emulation, plus
visual review of the captured states. Physical Android/iOS devices, Safari, Android
WebView, and sustained frame-rate measurements on ordinary device hardware have not
been tested. Existing external platform destinations and authentication services
were not exercised. No deployment was performed.
