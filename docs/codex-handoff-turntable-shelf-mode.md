# Codex Handoff: Shelf Mode Turntable UI

## 0. Current status

Repository: `kumakitiho/Spotify-Brawser`

Production URL:

```text
https://kumakitiho.github.io/Spotify-Brawser/
```

The app was rolled back to the last known usable application state before the recent failed experimentation around:

- right-side fader as volume control
- outer-ring playback progress
- squarer deck proportions
- headshell restyling
- `index.html` cache-busting loader attempt

The stable application baseline is:

```text
10e0049050bb71740ff4db27e14df2331a09edbc
```

This handoff document is added after that rollback. Treat the parent application state as the baseline, and do not assume later experimental commits are active.

## 1. User goal

The user wants the Shelf Mode / record-player UI to feel like a realistic top-down Technics-style turntable while remaining functional.

The current stable direction is:

- Keep the current record-player visual direction.
- Preserve working Spotify login and playback.
- Preserve jacket-cover tap playback.
- Remove or avoid broken drag-and-drop behavior.
- Improve the right-side fader only after the current stable view is protected.
- Avoid broad visual rewrites without screenshots or incremental validation.

## 2. Most important warning

Do not make large, multi-file visual changes in one pass.

A previous attempt became unstable because changes were spread across many after-load files, cache versions, and generated Pages config. It became hard to tell which layer was actually affecting production.

Use small PRs or commits with one purpose each:

1. Baseline verification.
2. One visual adjustment.
3. One behavior adjustment.
4. Cache/build wiring.
5. Manual verification.

## 3. Current known-good behavior

The last known good state includes these fixes:

- Jacket tap playback works again.
- `turntable-physics.js` no longer intercepts `.shelf-track` cover taps.
- Play/pause button still has tonearm cue animation.
- Drag/drop ghost cleanup exists, but the shelf should mainly behave as tap-to-play.
- The over-ambitious photo-finish overlay has been removed from runtime.

Stable rollback target:

```text
10e0049050bb71740ff4db27e14df2331a09edbc
```

## 4. Files involved in Shelf Mode turntable UI

### Main app shell

- `index.html`
  - Main app UI and Spotify player logic.
  - Avoid replacing the whole file unless absolutely necessary.
  - Do not reintroduce a runtime HTML loader that fetches raw GitHub HTML.

- `config.js`
  - Runtime config.
  - Loads Shelf Mode CSS/JS after page load.
  - Must stay in sync with `build.js` generated config.

- `build.js`
  - Generates `dist/config.js` for GitHub Pages workflows/builds.
  - If any Shelf Mode asset is added or removed, update `SHELF_MODE_ASSETS` and the generated `configContent` asset list.

### Shelf Mode visual/behavior layers

- `turntable-realism.css`
  - Base turntable skin.
  - Contains broad visual styling for deck/platter/disc.
  - Some older decorative ideas may still be present but overridden later.

- `turntable-cover-boost.css`
  - Enlarges/adjusts center jacket art.

- `turntable-physics.css`
  - Tonearm animation classes, fixed highlights, SVG arm layering.

- `turntable-physics.js`
  - Injects SVG tonearm.
  - Controls play/pause button cue animation.
  - Important: should not intercept shelf cover taps.

- `turntable-arm-detail.js`
  - Adds static arm-base and headshell details.
  - Also contains older strobe-ring helper logic that has caused alignment issues before.

- `turntable-polish.js`
  - Hides earlier headshell variants and injects the black headshell polish.
  - Be careful: changing this can quickly make the headshell look toy-like.

- `turntable-reference-match.css`
  - Final layout/visual alignment layer.
  - Good place for small visual nudges.
  - Avoid big aspect-ratio changes without screenshots.

- `turntable-reference-match.js`
  - Adds small decorative reference details.

- `turntable-no-drag.js`
  - Disables broken drag/drop affordance without blocking cover taps.
  - Important: do not stop `pointerdown`, `pointerup`, or `click` for shelf covers unless you fully verify playback.

- `turntable-state-guard.js`
  - Keeps decorative tonearm class state synced with actual playing state.
  - Should observe state, not initiate Spotify playback.

### Experimental file to treat carefully

- `turntable-live-controls.js`
  - Was created during the failed fader/progress-ring exploration.
  - It is not part of the stable runtime baseline.
  - Do not wire it into production without review and testing.

## 5. Recently failed direction and lessons

### Failed direction: squarer deck proportions

The user asked to make the deck less horizontally rectangular and closer to square.

A later attempt changed the deck too aggressively:

- `aspect-ratio` moved toward `1.07 / 1`.
- Right fader moved too far inward.
- Record and arm felt cramped.
- The headshell looked cheap/toy-like.

Lesson:

- If trying again, use very small steps.
- Target around `1.13 / 1` to `1.16 / 1` first, not near-square immediately.
- Capture screenshots after each step.

### Failed direction: headshell restyling

The black headshell replacement became visually worse after layout changes.

Lesson:

- Do not restyle the headshell unless there is a specific visual defect.
- If needed, adjust only transform/scale/position first.
- Avoid adding many decorative details or strong logo text.

### Failed direction: `index.html` runtime loader

An attempted workaround replaced `index.html` with a loader that fetched raw GitHub HTML and rewrote config loading.

This is not acceptable.

Do not use:

```js
fetch('https://raw.githubusercontent.com/.../index.html')
document.write(html)
```

The app shell should remain normal static HTML.

## 6. Next recommended work plan

### Phase 1: verify baseline

Before changing anything, verify:

- Spotify login works.
- Shelf Mode opens.
- Jacket tap starts playback.
- Next cue button still plays.
- Play/pause button still works.
- Tonearm does not prevent playback.
- No drag ghost remains visible after tapping.

### Phase 2: clean architecture before new features

The Shelf Mode implementation has too many layered files. Consider consolidating only after baseline is confirmed.

Candidate future consolidation:

- CSS bundle:
  - `turntable-realism.css`
  - `turntable-cover-boost.css`
  - `turntable-physics.css`
  - `turntable-reference-match.css`

  into something like:

  ```text
  turntable-shelf-mode.css
  ```

- JS bundle:
  - `turntable-physics.js`
  - `turntable-arm-detail.js`
  - `turntable-polish.js`
  - `turntable-reference-match.js`
  - `turntable-no-drag.js`
  - `turntable-state-guard.js`

  into something like:

  ```text
  turntable-shelf-mode.js
  ```

Do not delete old files until the bundled version has been visually and functionally verified.

### Phase 3: right-side fader feature

The user liked this concept:

- right vertical fader = volume control
- outer record ring = playback progress display
- existing lower progress bar = precise seek

Recommended implementation approach:

1. Do not start with layout changes.
2. First make the existing fader interactive as volume only.
3. Then add a subtle `VOL` label or accessible `aria-label`.
4. Only after volume works, add outer-ring progress.
5. Keep outer-ring progress display-only at first; do not make it a seek target.

Important Spotify note:

- The app uses Spotify Web Playback SDK.
- Volume should use the SDK player instance if accessible.
- If the player instance is scoped inside `index.html`, expose a minimal safe bridge rather than monkey-patching many events.

Recommended bridge shape:

```js
window.shelfPlayerControls = {
  setVolume: async (volume0to1) => { /* call player.setVolume */ },
  getState: () => ({ positionMs, durationMs, isPlaying })
};
```

Then fader UI code can depend on `window.shelfPlayerControls` instead of patching `Spotify.Player` constructor.

### Phase 4: outer ring playback progress

The outer ring should be subtle.

Avoid turning the strobe dots into a thick green gaming-style progress ring.

Better direction:

- keep strobe dots visible
- add a faint thin progress accent
- opacity low
- progress display only
- no interaction initially

Acceptance criteria:

- Progress is visible but does not dominate the realistic turntable look.
- Ring remains centered with platter and record disc on mobile and desktop.
- No fixed-coordinate SVG ring that drifts from CSS-positioned platter.

## 7. Specific implementation cautions

### Do not block cover taps

Avoid this on shelf covers:

```js
event.preventDefault();
event.stopImmediatePropagation();
```

Especially for:

- `pointerdown`
- `pointerup`
- `click`

This previously broke jacket tap playback.

### Do not replay pointer events for playback

A previous attempt intercepted a cover tap, animated the tonearm, then redispatched a synthetic event. This broke playback in some cases.

Preferred behavior:

- Let the original user event reach the app.
- Sync the decorative tonearm after state changes.
- Only gate the explicit play/pause button if necessary.

### Cache/build sync is mandatory

Whenever adding or versioning runtime assets, update both:

- `config.js`
- `build.js`

If adding a new runtime asset, also add it to:

```js
SHELF_MODE_ASSETS
```

in `build.js`.

### Screenshots are mandatory for visual work

Visual changes should be evaluated by screenshot, not assumptions.

The user noticed subtle visual regressions quickly. Keep diffs small.

## 8. Known good commit timeline

Important commits:

```text
10e0049050bb71740ff4db27e14df2331a09edbc
```

Meaning:

- last restored main application baseline
- cover tap playback restored
- before the fader/progress/squarer-deck experiment

The following experimental work should not be considered trusted:

- `turntable-live-controls.js` wiring attempts
- strong deck aspect-ratio changes
- headshell proportion rewrites
- raw-GitHub `index.html` loader workaround

## 9. Recommended Codex task statement

Use this as the Codex prompt:

```text
You are working in kumakitiho/Spotify-Brawser. The current main branch has been rolled back to the last known usable Shelf Mode turntable UI baseline. Do not reintroduce the failed experimental changes. First inspect the existing Shelf Mode files and verify the current asset loading path. Then propose a minimal implementation plan for making the right-side vertical fader a volume control and the outer record ring a subtle playback progress indicator. Preserve jacket-cover tap playback, Spotify login, play/pause behavior, and the current realistic turntable look. Avoid broad layout changes. Any new runtime asset must be wired in both config.js and build.js. Prefer a small bridge from index.html to expose player.setVolume/getState instead of monkey-patching Spotify.Player. Make changes in small commits and include manual verification steps.
```

## 10. Acceptance criteria for next PR

A next PR should pass:

- Spotify login still works.
- Shelf Mode loads.
- Jacket tap starts selected track.
- Next cue still works.
- Play/pause still works.
- Tonearm visual state does not block playback.
- Right fader changes Spotify playback volume.
- Volume setting persists only if implemented intentionally.
- Outer ring shows playback progress subtly.
- No large visual regression in platter, headshell, or arm-base.
- `config.js` and `build.js` asset lists are consistent.
- Mobile Safari and desktop browser both render acceptably.
