// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function RouteSound() {
  const location = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    (window as any).owSounds?.ui.select?.();
  }, [location.pathname]);

  return null;
}