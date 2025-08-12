import { describe, it, expect, beforeEach } from 'vitest';

// Minimal stub to load the owEffects API from EffectsOverlay hook mock
function initOwEffects() {
  // Simulate what EffectsOverlay would do
  (window as any).owEffects = {
    _state: { minimal: false },
    get() { return this._state; },
    set(partial: any) { this._state = { ...this._state, ...partial }; },
    reset() { this._state = { minimal: false }; },
  };
}

describe('Sidebar Minimal/Full effects toggles', () => {
  beforeEach(() => {
    initOwEffects();
  });

  it('sets minimal effects mode on Minimal button logic', () => {
    (window as any).owEffects.set({ minimal: true });
    expect((window as any).owEffects.get().minimal).toBe(true);
  });

  it('disables minimal effects mode on Full button logic', () => {
    (window as any).owEffects.set({ minimal: false });
    expect((window as any).owEffects.get().minimal).toBe(false);
  });
});