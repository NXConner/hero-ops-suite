// @ts-nocheck
import React, { useEffect } from "react";

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

    // Observe DOM for toasts/dialogs
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length > 0) {
          (m.addedNodes as any).forEach((node: any) => {
            if (!(node instanceof HTMLElement)) return;
            if (node.matches("[data-sonner-toaster], .sonner, .toast")) {
              (window as any).owSounds?.ui.notification?.();
            }
            if (node.matches('[role="dialog"], dialog, .radix-dialog-content')) {
              (window as any).owSounds?.ui.confirm?.();
            }
          });
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("click", onClick);
    return () => {
      observer.disconnect();
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
