// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";

interface SoundSettings {
  muted: boolean;
  volume: number; // 0-1
  themePreset: "isac" | "disavowed" | "darkzone" | "none";
}

const defaultSettings: SoundSettings = {
  muted: false,
  volume: 0.5,
  themePreset: "none",
};

export default function SoundManager() {
  const [settings, setSettings] = useState<SoundSettings>(() => {
    try {
      const raw = localStorage.getItem("sound-settings");
      return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sound-settings", JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  // Expose a simple window API for triggering sounds
  useEffect(() => {
    function playTone(frequency = 440, durationMs = 120, type: OscillatorType = "sine") {
      if (settings.muted) return;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      // Adjust by preset
      let f = frequency;
      if (settings.themePreset === "isac") f *= 1.0;
      if (settings.themePreset === "disavowed") f *= 0.9;
      if (settings.themePreset === "darkzone") f *= 0.75;
      osc.frequency.value = f;
      gain.gain.value = settings.volume * 0.2;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, durationMs);
    }

    (window as any).owSounds = {
      ui: {
        hover: () => playTone(880, 40, "sine"),
        select: () => playTone(660, 80, "triangle"),
        confirm: () => playTone(520, 120, "sawtooth"),
        error: () => playTone(220, 180, "square"),
        back: () => playTone(400, 80, "sine"),
        notification: () => playTone(1040, 140, "sine"),
      },
      scanner: {
        ping: () => playTone(1200, 80, "sine"),
        sweep: () => playTone(900, 200, "sawtooth"),
        lock: () => playTone(1400, 100, "triangle"),
      },
      rogue: {
        engaged: () => playTone(180, 250, "square"),
        alert: () => playTone(240, 250, "square"),
      },
      dz: {
        contamination: () => playTone(110, 400, "sine"),
        extract: () => playTone(700, 250, "triangle"),
      },
      setMuted: (muted: boolean) => setSettings((prev) => ({ ...prev, muted })),
      setVolume: (volume: number) => setSettings((prev) => ({ ...prev, volume })),
      setPreset: (themePreset: SoundSettings["themePreset"]) =>
        setSettings((prev) => ({ ...prev, themePreset })),
    };

    return () => {
      delete (window as any).owSounds;
    };
  }, [settings.muted, settings.volume, settings.themePreset]);

  return null;
}
