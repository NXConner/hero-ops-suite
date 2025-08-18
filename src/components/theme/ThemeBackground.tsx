import React from "react";
import { useAdvancedTheme } from "@/contexts/AdvancedThemeContext";
import ParticleSystem from "@/components/effects/ParticleSystem";

export function ThemeBackground() {
  const { currentTheme, isLoading, globalWallpaperOverride, isGlobalWallpaperEnabled } =
    useAdvancedTheme();

  if (isLoading || !currentTheme) {
    return null;
  }

  const effectiveWallpaper =
    isGlobalWallpaperEnabled && globalWallpaperOverride
      ? globalWallpaperOverride
      : currentTheme.wallpaper;

  return (
    <>
      {/* Particle Effects */}
      {currentTheme.effects.particles.enabled && currentTheme.performance.enableParticles && (
        <ParticleSystem
          effect={currentTheme.effects.particles}
          containerWidth={window.innerWidth}
          containerHeight={window.innerHeight}
        />
      )}

      {/* Dynamic Background */}
      {effectiveWallpaper.type === "video" && effectiveWallpaper.source && (
        <video
          className="fixed inset-0 w-full h-full object-cover -z-10 opacity-30"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={effectiveWallpaper.source} type="video/mp4" />
        </video>
      )}

      {/* Custom CSS Styles */}
      {currentTheme.customCSS && (
        <style
          dangerouslySetInnerHTML={{
            __html: currentTheme.customCSS,
          }}
        />
      )}
    </>
  );
}

export default ThemeBackground;
