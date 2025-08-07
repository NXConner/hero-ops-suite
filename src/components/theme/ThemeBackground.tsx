import React from 'react';
import { useAdvancedTheme } from '@/contexts/AdvancedThemeContext';
import ParticleSystem from '@/components/effects/ParticleSystem';

export function ThemeBackground() {
  const { currentTheme, isLoading } = useAdvancedTheme();

  if (isLoading || !currentTheme) {
    return null;
  }

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
      {currentTheme.wallpaper.type === 'video' && currentTheme.wallpaper.source && (
        <video
          className="fixed inset-0 w-full h-full object-cover -z-10 opacity-30"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={currentTheme.wallpaper.source} type="video/mp4" />
        </video>
      )}
      
      {/* Custom CSS Styles */}
      {currentTheme.customCSS && (
        <style
          dangerouslySetInnerHTML={{
            __html: currentTheme.customCSS
          }}
        />
      )}
    </>
  );
}

export default ThemeBackground;