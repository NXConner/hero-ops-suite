import { describe, it, expect } from 'vitest';
import { generateThemeCSS } from '@/lib/theme-utils';

const baseTheme: any = {
  id: 'test',
  colors: {
    background: { h: 220, s: 10, l: 10 },
    foreground: { h: 0, s: 0, l: 100 },
    primary: { h: 200, s: 80, l: 50 },
    primaryForeground: { h: 0, s: 0, l: 100 },
    secondary: { h: 180, s: 50, l: 40 },
    secondaryForeground: { h: 0, s: 0, l: 100 },
    accent: { h: 260, s: 60, l: 50 },
    accentForeground: { h: 0, s: 0, l: 100 },
    destructive: { h: 0, s: 80, l: 50 },
    destructiveForeground: { h: 0, s: 0, l: 100 },
    success: { h: 130, s: 60, l: 40 },
    successForeground: { h: 0, s: 0, l: 100 },
    warning: { h: 40, s: 90, l: 55 },
    warningForeground: { h: 0, s: 0, l: 0 },
    info: { h: 200, s: 80, l: 50 },
    infoForeground: { h: 0, s: 0, l: 100 },
    muted: { h: 220, s: 10, l: 20 },
    mutedForeground: { h: 0, s: 0, l: 80 },
    border: { h: 220, s: 10, l: 25 },
    input: { h: 220, s: 10, l: 25 },
    ring: { h: 200, s: 80, l: 50 },
    card: { h: 220, s: 10, l: 14 },
    cardForeground: { h: 0, s: 0, l: 100 },
    popover: { h: 220, s: 10, l: 16 },
    popoverForeground: { h: 0, s: 0, l: 100 },
    sidebar: { h: 220, s: 10, l: 12 },
    sidebarForeground: { h: 0, s: 0, l: 100 },
    sidebarPrimary: { h: 200, s: 80, l: 50 },
    sidebarPrimaryForeground: { h: 0, s: 0, l: 100 },
    sidebarAccent: { h: 260, s: 60, l: 50 },
    sidebarAccentForeground: { h: 0, s: 0, l: 100 },
    sidebarBorder: { h: 220, s: 10, l: 25 },
    sidebarRing: { h: 200, s: 80, l: 50 },
  },
  effects: {
    shadows: {
      sm: { type: 'drop', x: 0, y: 1, blur: 2, color: { h: 0, s: 0, l: 0, a: 0.3 }, intensity: 0.3 },
      md: { type: 'drop', x: 0, y: 4, blur: 6, color: { h: 0, s: 0, l: 0, a: 0.3 }, intensity: 0.3 },
      lg: { type: 'drop', x: 0, y: 10, blur: 15, color: { h: 0, s: 0, l: 0, a: 0.3 }, intensity: 0.3 },
      xl: { type: 'drop', x: 0, y: 20, blur: 30, color: { h: 0, s: 0, l: 0, a: 0.3 }, intensity: 0.3 },
      glow: { type: 'glow', x: 0, y: 0, blur: 12, spread: 0, color: { h: 200, s: 80, l: 50, a: 1 }, intensity: 0.4 },
      inner: { type: 'inner', x: 0, y: 0, blur: 6, spread: 0, color: { h: 0, s: 0, l: 0, a: 0.2 }, intensity: 0.2 },
    },
    blur: {
      background: { enabled: true, radius: 6, saturation: 100, brightness: 100 },
      overlay: { enabled: false, radius: 0, saturation: 100, brightness: 100 },
      card: { enabled: false, radius: 0, saturation: 100, brightness: 100 },
    },
    particles: { enabled: false, type: 'dust', count: 0, speed: 0, size: { min: 1, max: 2 }, color: { h: 0, s: 0, l: 100 }, opacity: { min: 0.1, max: 0.2 }, direction: 0, wind: 0 },
    animations: {
      fadeIn: { name: 'fade-in', duration: 200, easing: 'ease', iterations: 1, direction: 'normal' },
      slideIn: { name: 'slide-in', duration: 200, easing: 'ease', iterations: 1, direction: 'normal' },
      bounce: { name: 'bounce', duration: 200, easing: 'ease', iterations: 1, direction: 'normal' },
      pulse: { name: 'pulse', duration: 200, easing: 'ease', iterations: 1, direction: 'normal' },
      rotate: { name: 'rotate', duration: 200, easing: 'linear', iterations: 1, direction: 'normal' },
      scale: { name: 'scale', duration: 200, easing: 'ease', iterations: 1, direction: 'normal' },
      glow: { name: 'glow', duration: 200, easing: 'ease', iterations: 1, direction: 'normal' },
    },
    gradients: {
      primary: { type: 'linear', angle: 135, stops: [{ color: { h: 200, s: 80, l: 50 }, position: 0 }, { color: { h: 260, s: 60, l: 50 }, position: 100 }] },
      secondary: { type: 'linear', angle: 135, stops: [{ color: { h: 180, s: 50, l: 40 }, position: 0 }, { color: { h: 200, s: 80, l: 50 }, position: 100 }] },
      hero: { type: 'linear', angle: 135, stops: [{ color: { h: 220, s: 10, l: 10 }, position: 0 }, { color: { h: 260, s: 60, l: 50 }, position: 100 }] },
      card: { type: 'linear', angle: 135, stops: [{ color: { h: 220, s: 10, l: 14 }, position: 0 }, { color: { h: 220, s: 10, l: 16 }, position: 100 }] },
      button: { type: 'linear', angle: 135, stops: [{ color: { h: 200, s: 80, l: 50 }, position: 0 }, { color: { h: 180, s: 50, l: 40 }, position: 100 }] },
      border: { type: 'linear', angle: 135, stops: [{ color: { h: 220, s: 10, l: 25 }, position: 0 }, { color: { h: 220, s: 10, l: 20 }, position: 100 }] },
    },
  },
  wallpaper: { type: 'color', color: { h: 220, s: 10, l: 10 } },
  typography: {},
  performance: { enableAnimations: true, enableParticles: false, enableBlur: true, enableShadows: true, enableGradients: true, quality: 'high' },
  accessibility: { highContrast: false, reducedMotion: false, largeText: false, focusVisible: true },
};

describe('generateThemeCSS UI tokens', () => {
  it('emits UI token CSS variables', () => {
    const theme = {
      ...baseTheme,
      ui: {
        radius: {
          card: '8px', button: '8px', input: '8px', menu: '6px', popover: '6px', toast: '8px', dialog: '10px', tabs: '6px'
        },
        borders: { width: '1px', focusRingWidth: '2px', focusRingOffset: '2px' }
      }
    };
    const css = generateThemeCSS(theme as any);
    expect(css).toContain('--radius-card: 8px');
    expect(css).toContain('--radius-button: 8px');
    expect(css).toContain('--radius-input: 8px');
    expect(css).toContain('--radius-menu: 6px');
    expect(css).toContain('--radius-popover: 6px');
    expect(css).toContain('--radius-toast: 8px');
    expect(css).toContain('--radius-dialog: 10px');
    expect(css).toContain('--radius-tabs: 6px');
    expect(css).toContain('--border-width: 1px');
    expect(css).toContain('--ring-width: 2px');
    expect(css).toContain('--ring-offset: 2px');
  });
});