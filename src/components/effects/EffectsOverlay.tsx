// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { useAdvancedTheme } from '@/contexts/AdvancedThemeContext';

interface EffectSettings {
  scanlines: boolean;
  refreshBarH: boolean;
  radarSweep: boolean;
  vignette: boolean;
}

const defaultSettings: EffectSettings = {
  scanlines: true,
  refreshBarH: true,
  radarSweep: false,
  vignette: true,
};

function useEffectSettings() {
  const [settings, setSettings] = useState<EffectSettings>(() => {
    try {
      const raw = localStorage.getItem('effects-settings');
      return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('effects-settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  return { settings, setSettings } as const;
}

export default function EffectsOverlay() {
  const { currentTheme } = useAdvancedTheme();
  const { settings } = useEffectSettings();

  const isLowPower = currentTheme?.performance.quality === 'low';
  const enableVisuals = currentTheme?.performance.enableAnimations !== false && !isLowPower;

  if (!enableVisuals) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[5]">
      {/* Scanlines */}
      {settings.scanlines && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(rgba(0,0,0,0.08) 1px, rgba(0,0,0,0) 2px)` ,
            backgroundSize: '100% 3px',
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {/* Horizontal refresh bar */}
      {settings.refreshBarH && (
        <div
          aria-hidden
          className="absolute inset-x-0 h-16 opacity-20"
          style={{
            top: '-64px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0) 100%)',
            animation: 'ow-refresh-bar 6s linear infinite'
          }}
        />
      )}

      {/* Radar sweep */}
      {settings.radarSweep && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative" style={{ width: '80vmin', height: '80vmin' }}>
            <div className="absolute inset-0 rounded-full border border-cyan-400/20" />
            <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg, rgba(40,216,255,0.25), rgba(40,216,255,0) 45deg)' , animation: 'ow-radar-sweep 10s linear infinite' }} />
          </div>
        </div>
      )}

      {/* Vignette */}
      {settings.vignette && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            boxShadow: 'inset 0 0 200px rgba(0,0,0,0.6)'
          }}
        />
      )}

      {/* keyframes */}
      <style>{`
        @keyframes ow-refresh-bar {
          0% { transform: translateY(0); }
          100% { transform: translateY(110vh); }
        }
        @keyframes ow-radar-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}