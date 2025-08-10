# What Remains

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
  - App builds cleanly after all changes.

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

## Consolidated to‑do list (from chat + project‑wide)

- Customizer
  - [ ] Add tokens for borders, detailed radii, state tokens (hover/active/focus), text shadows.
  - [ ] Targets for charts, tables (header/cell/stripe), inputs, tabs, sidebar active/hover.
  - [ ] Persist preview border radius and other component tokens into theme schema.

- Effects
  - [ ] Implement additional HUD effects: hex mesh overlay, telemetry columns, button hover ripple, tab underline scanner, pixel sort glitch, RF interference, bloom tuning by theme.
  - [ ] Theme-based effect presets (ISAC/Disavowed/DZ) and one-tap “Minimal Effects Mode” shortcut.
  - [ ] Add performance smart scaling for effect densities.

- Wallpapers
  - [ ] Add curated video overlays to `public/`; presets and file size checks.
  - [ ] Add parallax strength slider and color filter controls for image/video.

- Builder
  - [ ] Add dedicated “Edit Layout” toggle on OverWatch header and role/view scoping.
  - [ ] Per-widget settings (title/icon/badge); library categories and search.
  - [ ] Optional server sync of layouts per user/role.

- Navigation
  - [ ] Replace indent/outdent buttons with nested drag-and-drop.
  - [ ] Optional Supabase sync for multi-device persistence.

- Audio
  - [ ] Replace tones with real assets; lazy load by category.
  - [ ] Wire more app events; add “ISAC voice” optional lines and mapping.

- A11y/Perf
  - [ ] Add high-contrast variants and verify overlays.
  - [ ] Add low-power quick toggle to header or quick settings.

- Tests/Docs
  - [ ] Add smoke tests for builder, customizer, nav editor, effects toggles.
  - [ ] Update README and short HOWTOs.

## Notes

- All features default to performant settings; heavy effects are gated by performance detection and Low Power Mode.
- Global controls are accessible in Settings; `window.owEffects` and `window.owSounds` provide scripting hooks for rapid iteration.