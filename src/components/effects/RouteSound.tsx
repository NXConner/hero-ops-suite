// @ts-nocheck
import React, { useEffect, useRef } from "react";

export default function RouteSound() {
  const first = useRef(true);

  useEffect(() => {
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;

    const onNav = () => {
      if (first.current) {
        first.current = false;
        return;
      }
      (window as any).owSounds?.ui?.select?.();
    };

    // Patch history methods to dispatch a custom event
    history.pushState = function (...args: any[]) {
      const ret = originalPush.apply(history, args as any);
      window.dispatchEvent(new Event("navigation"));
      return ret;
    } as any;

    history.replaceState = function (...args: any[]) {
      const ret = originalReplace.apply(history, args as any);
      window.dispatchEvent(new Event("navigation"));
      return ret;
    } as any;

    window.addEventListener("popstate", onNav);
    window.addEventListener("navigation", onNav);

    return () => {
      history.pushState = originalPush;
      history.replaceState = originalReplace;
      window.removeEventListener("popstate", onNav);
      window.removeEventListener("navigation", onNav);
    };
  }, []);

  return null;
}
