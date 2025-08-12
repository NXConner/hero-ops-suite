// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { useAdvancedTheme } from '@/contexts/AdvancedThemeContext';

interface EffectSettings {
  scanlines: boolean;
  refreshBarH: boolean;
  refreshBarV: boolean;
  radarSweep: boolean;
  vignette: boolean;
  glitch: boolean;
  uvVignette?: boolean;
  ticker?: boolean;
  minimal?: boolean;
  scanlineSpacing?: number; // px
  glitchLevel?: number; // 0-1
}

const defaultSettings: EffectSettings = {
  scanlines: true,
  refreshBarH: true,
  refreshBarV: false,
  radarSweep: false,
  vignette: true,
  glitch: false,
  uvVignette: false,
  ticker: false,
  minimal: false,
  scanlineSpacing: 3,
  glitchLevel: 0.3,
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
    } catch { /* ignore */ }
  }, [settings]);

  useEffect(() => {
    (window as any).owEffects = {
      get: () => settings,
      set: (s: Partial<EffectSettings>) => setSettings(prev => ({ ...prev, ...s })),
      reset: () => setSettings(defaultSettings),
      preset: (name: 'isac' | 'disavowed' | 'darkzone' | 'minimal' | 'vivid') => {
        switch (name) {
          case 'minimal':
            setSettings({ ...defaultSettings, scanlines: false, refreshBarH: false, refreshBarV: false, radarSweep: false, vignette: false, glitch: false, uvVignette: false, ticker: false, minimal: true });
            break;
          case 'isac':
            setSettings(prev => ({ ...prev, minimal: false, scanlines: true, refreshBarH: true, refreshBarV: false, radarSweep: false, vignette: true, glitch: false, uvVignette: false, ticker: false, scanlineSpacing: 3, glitchLevel: 0.2 }));
            break;
          case 'disavowed':
            setSettings(prev => ({ ...prev, minimal: false, scanlines: true, refreshBarH: false, refreshBarV: true, radarSweep: false, vignette: true, glitch: true, uvVignette: false, ticker: true, scanlineSpacing: 2, glitchLevel: 0.5 }));
            break;
          case 'darkzone':
            setSettings(prev => ({ ...prev, minimal: false, scanlines: true, refreshBarH: false, refreshBarV: false, radarSweep: true, vignette: true, glitch: true, uvVignette: true, ticker: true, scanlineSpacing: 3, glitchLevel: 0.4 }));
            break;
          case 'vivid':
            setSettings(prev => ({ ...prev, minimal: false, scanlines: true, refreshBarH: true, refreshBarV: true, radarSweep: true, vignette: true, glitch: true, uvVignette: true, ticker: true, scanlineSpacing: 2, glitchLevel: 0.6 }));
            break;
        }
      }
    };
    return () => { delete (window as any).owEffects; };
  }, [settings]);

  return { settings, setSettings } as const;
}

export default function EffectsOverlay() {
  const { currentTheme } = useAdvancedTheme();
  const { settings } = useEffectSettings();

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  // If theme is not yet available, do not render overlay
  if (!currentTheme) return null;

  const isLowPower = currentTheme?.performance?.quality === 'low';
  const enableVisuals = !!currentTheme?.performance?.enableAnimations && !isLowPower && !reducedMotion;

  if (!enableVisuals || settings.minimal) return null;

  const spacing = Math.max(2, Math.min(10, settings.scanlineSpacing || 3));
  const glitchDur = 2500 - Math.floor((settings.glitchLevel || 0) * 2000);

  return (
    <div className="pointer-events-none fixed inset-0 z-[5]">
      {/* Scanlines */}
      {settings.scanlines && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(rgba(0,0,0,0.08) 1px, rgba(0,0,0,0) ${spacing-1}px)` ,
            backgroundSize: `100% ${spacing}px`,
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

      {/* Vertical refresh bar */}
      {settings.refreshBarV && (
        <div
          aria-hidden
          className="absolute inset-y-0 w-12 opacity-10"
          style={{
            left: '-48px',
            background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0) 100%)',
            animation: 'ow-refresh-bar-v 8s linear infinite'
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
        <div aria-hidden className="absolute inset-0" style={{ boxShadow: 'inset 0 0 200px rgba(0,0,0,0.6)' }} />
      )}

      {/* UV Vignette */}
      {settings.uvVignette && (
        <div aria-hidden className="absolute inset-0" style={{ boxShadow: 'inset 0 0 260px rgba(122,0,255,0.35)' }} />
      )}

      {/* Simple glitch */}
      {settings.glitch && (
        <div aria-hidden className="absolute inset-0 mix-blend-screen" style={{ animation: `ow-glitch ${glitchDur}ms steps(1,end) infinite` }} />
      )}

      {/* Telemetry ticker */}
      {settings.ticker && (
        <div aria-hidden className="absolute bottom-0 left-0 right-0 text-[10px] text-cyan-300/80 tracking-wider">
          <div className="whitespace-nowrap" style={{ animation: 'ow-ticker 20s linear infinite' }}>
            ▷ ISAC SYSTEM ONLINE ▷ LINK STABLE ▷ TELEMETRY: OK ▷ SCANLNS: ON ▷ RADAR: STBY ▷ EFFECTS: OPT ▷ 
          </div>
        </div>
      )}

      <style>{`
        @keyframes ow-refresh-bar { 0% { transform: translateY(0);} 100% { transform: translateY(110vh);} }
        @keyframes ow-refresh-bar-v { 0% { transform: translateX(0);} 100% { transform: translateX(110vw);} }
        @keyframes ow-radar-sweep { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
        @keyframes ow-glitch {
          0%, 97%, 100% { filter: none; }
          5% { filter: url('#'); }
          20% { clip-path: inset(10% 0 82% 0); transform: translateX(1px); }
          25% { clip-path: inset(80% 0 5% 0); transform: translateX(-1px); }
          35% { clip-path: inset(50% 0 40% 0); transform: translateX(2px); }
        }
        @keyframes ow-ticker { 0% { transform: translateX(100%);} 100% { transform: translateX(-100%);} }
      `}</style>
    </div>
  );
}