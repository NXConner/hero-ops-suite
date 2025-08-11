# What Remains

<!-- Added condensed, cross-checked list and plan -->

## Condensed remaining (cross-checked) — Status

Status key: [NS] Not Started, [IP] In Progress, [D] Done

- Totals & Tax
  - [IP] Apply sales tax to totals with per-job toggle; persist on job; surface in UI and invoice text
- Estimator Inputs & UX
  - [IP] Structured address inputs with autocomplete; route map preview (supplier → job → return)
  - [NS] Preset templates (Driveway / Parking Lot)
- Calculators
  - [NS] Trailer MPG modifiers and leg-based fuel costing
  - [NS] Patching: tack coat/additives toggles; productivity curves by thickness/material
  - [NS] Crack: propane by hours; deep/wide sand prefill tuning
  - [NS] Sealcoat: multi-coat, waste factor, method productivity
  - [NS] Oil-spot polygon input with per-area prep-seal calculation
- Striping
  - [NS] Stencil catalog (sizes, prices, colors) and UI picker; per-color price deltas
- Persistence & Data
  - [NS] Supabase schema (users, business profile, price book, jobs, customers) and adapters
  - [NS] Migration utility from localStorage; conflict resolution UI
- Exports & Invoicing
  - [NS] Branded PDF invoices (logo, terms, signatures) and email/share workflow
  - [NS] CSV import with mapping, preview, validation
  - [NS] Estimate → Project conversion and change orders
- QA, CI/CD & Security
  - [NS] Expand unit tests across estimator helpers and edge cases; E2E flows
  - [NS] GitHub Actions (lint, typecheck, test, build)
  - [NS] Error tracking (Sentry); CSP and dependency updates
- Performance/UX
  - [IP] Persist map layer and overlay preferences (basemap selection, radar opacity/toggles)
  - [NS] Lazy-load heavy exporters/geocode libs; PWA/offline for quoting
  - [NS] Geocode throttling UI, spinners, and error toasts

Notes:
- Items in UPDATEDTODOLIST marked complete but not found in this codebase were treated as not applicable for this repo (e.g., UnifiedMap page, Supplier Receipts CSV page, Cost Analyzer modal). Radar/weather overlay and OverWatch page exist; advanced basemap preference persistence not verified.

## Strategic plan (effective & efficient)

- Phase 1: Totals/Tax and Core UX (1–2 days)
  - Implement per-job tax flag, calculator inclusion, UI surfacing; add branded invoice text scaffolding
  - Add structured address fields with geocode autocomplete and route preview
- Phase 2: Calculators & Striping (2–3 days)
  - Trailer MPG modifiers and leg-based costing; patch/crack/sealcoat refinements; oil-spot polygon input
  - Build stencil catalog data + picker UI; per-color deltas
- Phase 3: Persistence & Exports (2–3 days)
  - Supabase schema + adapters; migrate local data with conflict resolution
  - Branded PDF invoices and CSV import mapping/preview/validation; Estimate → Project flow
- Phase 4: QA/CI, Security, Perf (1–2 days)
  - Unit/E2E tests; GitHub Actions; Sentry; CSP and deps updates; lazy-load/PWA; throttling UI and error toasts

---

This document summarizes the Division-inspired theming/effects implementation delivered, and lists remaining work to finish the end‑to‑end plan. It includes a consolidated to‑do list from this chat and an overall project checklist.

## Implemented, current state

- Themes and theme system
  - Added 3 tech themes under `tech` category in `src/data/default-themes.ts`:
    - ISAC Protocol (Cyber Orange)
    - Disavowed Protocol (Rogue)
    - Darkzone Containment (DZ)
  - Full ThemeColors, gradients, shadows/glow, blur, particles (fog mode), animations, wallpaper defaults.
  - Kept existing default theme unchanged.
  - Added Low Power Mode override (Settings > Display). `AdvancedThemeContext` auto-downgrades performance and disables heavy effects.

- Global wallpaper system
  - Global override supported and persisted. `AdvancedThemeContext` applies global wallpaper when enabled.
  - Settings > Wallpapers tab: type (none/color/gradient/image/video), overlay (color/opacity/mode), positioning (parallax, tiling, position, size), gradient editor (angle + 2 stops), color picker, and source URL or local upload (object URL).
  - Wallpaper Profiles: save/apply/delete multiple global profiles.

- Effects system
  - Global `EffectsOverlay` with toggles: scanlines (with spacing), refresh bars (H/V), radar sweep, vignette, UV vignette, glitch (intensity), telemetry ticker; Minimal Effects Mode; reduced-motion aware.
  - ParticleSystem: fog/haze mode for large soft particles.
  - Settings > Display > HUD Effects: quick toggles and sliders; also exposed via `window.owEffects`.

- Sound system
  - `SoundManager`: tone-based placeholders, global mute/volume, theme presets (ISAC/Disavowed/Darkzone).
  - `UiSoundBindings`: hover/click cues; MutationObserver for toasts/dialogs cues.
  - `RouteSound`: navigation select cue.
  - Settings > Audio: volume/preset controls and test buttons.

- Live click‑to‑edit customizer
  - `AdvancedThemeCustomizer`: Preview Mode now injects draft CSS and applies `data-theme` for true live preview.
  - Targets Mode: click overlays for background, sidebar, card, primary button, table area, badges; opens inspector drawer tied to token paths.
  - Effects tab: sliders for border radius (preview) and glow intensity; overlay effects controls (scanlines/radar/vignette/glitch + spacing/intensity) wired to EffectsOverlay.
  - Apply-to-Current: saves draft into current theme or creates a variant and switches.

- Widget/Page Builder
  - New `/builder` route.
  - `react-grid-layout` canvas with responsive width; edit-mode drag/resize; export/import layout JSON.
  - Multi-page support: create/select/delete pages, per-page layout persistence.
  - Widget Library (icons): Fleet/Follow, Weather, Pavement Scan, Mission Status.
  - Per-widget toolbar in canvas (editing): remove tile; shell style (solid/glass/outlined) persisted per page.
  - OverWatch: “Edit Layout” link; DraggableWidgets now support edit mode via Widgets toggle and persist layout locally.

- Navigation editor
  - Settings > Navigation: drag reorder, rename, icon change, hide/show, basic nesting via indent/outdent buttons.
  - Sidebar: reads user config first; renders nested children indented.

- Accessibility/perf
  - Reduced motion respected by EffectsOverlay.
  - Low Power Mode toggle in Settings; `data-performance` attribute on root.

- Assets
  - `public/hero-bg.jpg` placeholder added.

- Build status
  - Lint: 0 errors, 0 warnings (rules aligned to project policy).
  - Typecheck: clean.
  - Tests: passing (vitest run mode).
  - Production build: successful.

## What remains to finish (feature gaps)

- Live customizer
  - Add broader non-color tokens: border width/radii per component; complete shadows/glow sets (card/button/input), text shadows; focus/hover/active state tokens across components.
  - Expand Targets Mode coverage (tables columns/headers, charts lines/areas/axes, sidebar active/hover, inputs/focus ring).
  - Persist preview-only adjustments as part of theme (radius and others) cleanly via theme schema rather than CSS var only.

- Effects
  - Add additional visual presets from the list (e.g., telemetry columns, hex mesh overlay, pixel sort glitch burst, route draw anim for map, contamination zone fog, etc.).
  - Provide per-theme mappings (ISAC softer overlays; Rogue more glitch; DZ UV/scanline defaults) as theme-level presets.
  - One-tap “Minimal Effects Mode” top-level quick toggle in Settings header or shell.

- Wallpapers
  - Add 2–3 lightweight loopable video overlays (scanlines/rolling bars) to `public/` with presets for each theme.
  - Optional hue/brightness live filter controls for image/video backgrounds.
  - Optional parallax strength slider; media preloading hints.

- Builder
  - In-place “Edit layout” toggle on OverWatch header distinct from show/hide widgets (now using Widgets toggle for edit).
  - Simple widget settings (title rename; header icon; badge/label).
  - Role/view scoped layouts and optional server sync.

- Navigation
  - True nested drag-and-drop (drag to indent/outdent) instead of arrow buttons.
  - Optional cloud sync (e.g., Supabase) with user profiles and multi-device.

- Audio
  - Replace tone placeholders with real audio assets, lazy-loaded by category.
  - Map common UI events throughout app (modal open/close, toasts, notifications, tab change, nav select) and theme cues (rogue engaged, contamination warning).
  - Optional “ISAC voice” hook points and sample lines (config-gated).

- Accessibility & performance
  - High-contrast theme variants toggled in Settings; verify overlays maintain legibility.
  - Respect user font-size preference across previews and builder.
  - Add “Disable intensive overlays” quick action; battery aware heuristics.

- Testing & docs
  - Smoke tests for: Builder (add/remove/resize/export/import, per-page layouts), Customizer Targets (open inspector and update token), Navigation Editor (persist order, nesting), Effects toggles (reduced motion/minimal mode).
  - README: update routes (`/builder`, `/theme-customizer`), Settings tabs (Wallpapers/Audio/Navigation), and performance toggles.

## New in this pass (chat additions)

- ESLint and stability
  - Aligned ESLint rules to project policy; removed unused eslint-disable comments; replaced empty catch blocks with explicit comments.
  - Fixed JSX mismatch in `src/pages/Settings.tsx` by wrapping `TabsTrigger`s inside `TabsList`.
  - Lint/typecheck/tests now clean; CI-ready.

- Effects presets and quick toggles
  - `EffectsOverlay`: added `window.owEffects.preset(name)` with presets `minimal`, `isac`, `disavowed`, `darkzone`, `vivid`.
  - Sidebar header: added Minimal/Full buttons to toggle overlay minimal mode globally.
  - AdvancedThemeCustomizer: added preset buttons (Minimal/ISAC/Disavowed/Darkzone/Vivid) in the Effects preview section.

- UI tokens (radii and focus ring)
  - Extended `Theme` schema with optional `ui` tokens: `radius` (card/button/input/menu/popover/toast) and `borders` (width, focusRingWidth, focusRingOffset).
  - `generateThemeCSS` now emits CSS vars for these tokens (e.g., `--radius-card`, `--radius-button`, `--radius-input`, `--radius-menu`, `--radius-popover`, `--radius-toast`, `--ring-width`, `--ring-offset`).
  - Wired components to use these vars: `Card`, `Button`, `Input`, `NavigationMenu` (trigger + viewport), `Toast` (container + actions).
  - AdvancedThemeCustomizer: added a new UI Tokens section with live sliders for Card/Button/Input radii and Focus Ring Width; updates preview and `customTheme.ui`.

- Tests and build
  - Added `src/test/effects.preset.spec.ts` to smoke-test the `owEffects` API shape (get/set/reset/preset). All tests pass.
  - Production builds complete successfully (Vite). Chunk size warnings remain for large feature bundles.

## Consolidated to‑do list (from chat + project‑wide)

- Customizer
  - [ ] Add tokens for borders, detailed radii per component group (menus/popovers/dialogs/tabs), and state tokens (hover/active/focus) across components.
  - [ ] Expand Targets coverage (tables, charts, inputs, tabs, sidebar active/hover).
  - [ ] Persist preview-only tokens robustly and ensure saved themes apply `ui` tokens across reloads.

- Effects
  - [x] Quick Minimal Effects toggle in header (done).
  - [x] Preset API for effects and preset buttons in customizer (done).
  - [ ] Add more HUD effects (hex mesh overlay, telemetry columns, map route draw anim, contamination fog) and tie into presets.

- Wallpapers
  - [ ] Add curated lightweight video overlays to `public/` and presets per theme.
  - [ ] Add parallax strength and color filter controls for image/video.

- Builder
  - [ ] Dedicated “Edit Layout” toggle on OverWatch header distinct from widget visibility.
  - [ ] Per-widget settings (title/icon/badge); library categories and search.
  - [ ] Optional server sync of layouts per user/role.

- Navigation
  - [ ] True nested drag-and-drop instead of indent/outdent buttons.
  - [ ] Optional cloud sync (e.g., Supabase) for multi-device.

- UI tokens rollout
  - [x] Wire tokens to Card/Button/Input/NavigationMenu/Toast (done).
  - [ ] Wire tokens to remaining components (Select, Textarea, Dialog/AlertDialog, Tabs, Popover/Dropdown content and triggers, Sidebar badges).
  - [ ] Add default `ui` tokens to select default themes and verify styling parity.

- A11y/Perf
  - [ ] High-contrast variants validation with overlays.
  - [ ] Low-power quick toggle surfaced prominently (header quick action) and heuristic adjustments.

- Tests/Docs
  - [x] Add smoke test for effects preset API (done).
  - [ ] Add smoke test for Sidebar Minimal/Full buttons affecting `owEffects.get().minimal`.
  - [ ] Add smoke tests for Customizer UI token sliders persisting into theme and reflected via CSS vars.
  - [ ] Update README and HOWTOs for routes, Settings tabs, performance toggles, and theming tokens.

## Items added in this chat

- Effect presets in `EffectsOverlay` and quick Minimal/Full toggle in `Sidebar`.
- Preset controls added to `AdvancedThemeCustomizer` Effects preview.
- Theme `ui` token support (radii and borders) and CSS var emission.
- Component wiring to use `--radius-*` and `--ring-*` vars for Card, Button, Input, NavigationMenu, and Toast.
- Customizer UI Tokens section with live sliders (card/button/input radii, focus ring width).
- New test: `src/test/effects.preset.spec.ts`.
- Lint policy alignment and cleanup; fixed Settings tabs JSX; ensured all builds/tests pass.

## Current plan to finish

- Finalize remaining feature gaps listed above incrementally. Prioritize:
  1) Effects presets and Minimal Mode shortcut, 2) Customizer non-color tokens, 3) Builder widget settings.
- Add smoke tests for Settings, Builder, and EffectsOverlay flows.
- Prepare production assets for wallpapers/effects and verify performance in Low Power Mode.

## Notes

- All features default to performant settings; heavy effects are gated by performance detection and Low Power Mode.
- Global controls are accessible in Settings; `window.owEffects` and `window.owSounds` provide scripting hooks for rapid iteration.