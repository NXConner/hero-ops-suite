// @ts-nocheck
import React, { useEffect } from 'react';

function throttle(fn: (...args: any[]) => void, ms: number) {
  let last = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - last > ms) {
      last = now;
      fn(...args);
    }
  };
}

export default function UiSoundBindings() {
  useEffect(() => {
    const onMouseOver = throttle((e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (target.closest('button, [role="button"], a, .link')) {
        (window as any).owSounds?.ui.hover?.();
      }
    }, 120);

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (target.closest('button, [role="button"], a, .link')) {
        (window as any).owSounds?.ui.select?.();
      }
    };

    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return null;
}