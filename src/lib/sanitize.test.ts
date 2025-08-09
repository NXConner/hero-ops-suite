import { describe, it, expect } from 'vitest';
import { escapeHtml, safeHtml } from './sanitize';

describe('sanitize', () => {
  it('escapes basic HTML characters', () => {
    expect(escapeHtml('<script>alert(1)</script>'))
      .toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('sanitizes template values', () => {
    const name = '<img src=x onerror=alert(1)>';
    const html = safeHtml`Hello ${name}!`;
    expect(html).toBe('Hello &lt;img src=x onerror=alert(1)&gt;!');
  });
});