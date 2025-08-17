import { describe, it, expect } from 'vitest'

// Smoke test mirroring OperationsSuite iframe src resolution for weather app
// In DEV, it should point to /suite/weather/index.html

function computeIframeSrc(path: string, isDev: boolean) {
  if (!isDev) return path;
  return path.endsWith('/') ? `${path}index.html` : `${path}/index.html`;
}

describe('OperationsSuite iframe: weather app path', () => {
  it('computes DEV iframe src for /suite/weather/', () => {
    const src = computeIframeSrc('/suite/weather/', true);
    expect(src).toBe('/suite/weather/index.html');
  });
  it('computes DEV iframe src for /suite/weather (no trailing slash)', () => {
    const src = computeIframeSrc('/suite/weather', true);
    expect(src).toBe('/suite/weather/index.html');
  });
  it('passes through PROD path unchanged', () => {
    const src = computeIframeSrc('/suite/weather/', false);
    expect(src).toBe('/suite/weather/');
  });
});