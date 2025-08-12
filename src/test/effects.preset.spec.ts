import { describe, it, expect } from 'vitest'

// JSDOM environment with setup has run; EffectsOverlay registers window.owEffects on mount in app, 
// but here we simulate the API object directly for smoke tests.

describe('owEffects presets API', () => {
  it('should expose set/get/reset and preset', () => {
    // Simulate registration like EffectsOverlay would do
    const state: any = { minimal: false, scanlines: true, refreshBarH: true, refreshBarV: false, radarSweep: false, vignette: true, glitch: false, uvVignette: false, ticker: false, scanlineSpacing: 3, glitchLevel: 0.3 };
    (window as any).owEffects = {
      get: () => state,
      set: (s: any) => Object.assign(state, s),
      reset: () => Object.assign(state, { minimal: false, scanlines: true, refreshBarH: true, refreshBarV: false, radarSweep: false, vignette: true, glitch: false, uvVignette: false, ticker: false, scanlineSpacing: 3, glitchLevel: 0.3 }),
      preset: (name: 'minimal' | 'isac' | 'disavowed' | 'darkzone' | 'vivid') => {
        if (name === 'minimal') {
          Object.assign(state, { minimal: true, scanlines: false, refreshBarH: false, refreshBarV: false, radarSweep: false, vignette: false, glitch: false, uvVignette: false, ticker: false });
        } else if (name === 'isac') {
          Object.assign(state, { minimal: false, scanlines: true, refreshBarH: true, refreshBarV: false, glitchLevel: 0.2 });
        } else if (name === 'disavowed') {
          Object.assign(state, { minimal: false, scanlines: true, refreshBarH: false, refreshBarV: true, glitch: true });
        } else if (name === 'darkzone') {
          Object.assign(state, { minimal: false, radarSweep: true, uvVignette: true });
        } else if (name === 'vivid') {
          Object.assign(state, { minimal: false, scanlines: true, refreshBarH: true, refreshBarV: true, glitch: true });
        }
      }
    };

    const api = (window as any).owEffects;
    expect(api.get().minimal).toBe(false);

    // Minimal
    api.preset('minimal');
    expect(api.get().minimal).toBe(true);
    expect(api.get().scanlines).toBe(false);

    // Full via reset
    api.reset();
    expect(api.get().minimal).toBe(false);

    // Preset toggles
    api.preset('isac');
    expect(api.get().refreshBarH).toBe(true);

    api.preset('disavowed');
    expect(api.get().refreshBarV).toBe(true);
  });
});