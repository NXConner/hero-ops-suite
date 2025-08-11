// @ts-nocheck
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Theme, ThemeContext, ThemePreset, ThemeWallpaper } from '@/types/theme';
import { 
  generateThemeCSS, 
  generateWallpaperCSS, 
  validateTheme, 
  mergeThemes,
  getPerformanceLevel,
  getDeviceType,
  getCurrentTimeVariant
} from '@/lib/theme-utils';

const AdvancedThemeContext = createContext<ThemeContext | undefined>(undefined);

interface AdvancedThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export function AdvancedThemeProvider({ 
  children, 
  defaultTheme = 'military-tactical',
  storageKey = 'advanced-theme-config'
}: AdvancedThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([]);
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Global wallpaper override
  const [globalWallpaperOverride, setGlobalWallpaperOverrideState] = useState<ThemeWallpaper | null>(null);
  const [isGlobalWallpaperEnabled, setIsGlobalWallpaperEnabledState] = useState<boolean>(false);
  const [wallpaperProfiles, setWallpaperProfiles] = useState<{ name: string; wallpaper: ThemeWallpaper }[]>([]);

  // Low power override
  const [lowPowerMode, setLowPowerMode] = useState<boolean>(() => {
    try { return localStorage.getItem('low-power-mode') === '1'; } catch { return false; }
  });

  // Load themes and wallpaper settings from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const config = JSON.parse(stored);
        setCustomThemes(config.customThemes || []);
        setPresets(config.presets || []);
      }

      const globalWpStr = localStorage.getItem('global-wallpaper-config');
      if (globalWpStr) {
        const parsed = JSON.parse(globalWpStr);
        setGlobalWallpaperOverrideState(parsed.wallpaper || null);
        setIsGlobalWallpaperEnabledState(!!parsed.enabled);
      }

      const profilesStr = localStorage.getItem('global-wallpaper-profiles');
      if (profilesStr) {
        setWallpaperProfiles(JSON.parse(profilesStr));
      }
    } catch (err) {
      console.error('Failed to load theme config:', err);
    }
  }, [storageKey]);

  const persistProfiles = useCallback((profiles: { name: string; wallpaper: ThemeWallpaper }[]) => {
    try { localStorage.setItem('global-wallpaper-profiles', JSON.stringify(profiles)); } catch { /* ignore */ }
  }, []);

  // Save themes to storage
  const saveToStorage = useCallback((themes: Theme[], presetsData: ThemePreset[]) => {
    try {
      const config = {
        customThemes: themes,
        presets: presetsData,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(config));
    } catch (err) {
      console.error('Failed to save theme config:', err);
    }
  }, [storageKey]);

  const saveGlobalWallpaper = useCallback((wallpaper: ThemeWallpaper | null, enabled: boolean) => {
    try {
      localStorage.setItem('global-wallpaper-config', JSON.stringify({ wallpaper, enabled }));
    } catch (err) {
      console.error('Failed to save global wallpaper:', err);
    }
  }, []);

  // Initialize with default themes
  useEffect(() => {
    const initializeThemes = async () => {
      try {
        setIsLoading(true);
        const { getDefaultThemes } = await import('@/data/default-themes');
        const defaultThemes = getDefaultThemes();
        setAvailableThemes(defaultThemes);
        const initialTheme = defaultThemes.find(t => t.id === defaultTheme) || defaultThemes[0];
        if (initialTheme) {
          await applyTheme(initialTheme);
        }
        setIsLoading(false);
      } catch (err) {
        setError('Failed to initialize themes');
        setIsLoading(false);
        console.error(err);
      }
    };
    initializeThemes();
  }, [defaultTheme]);

  // Apply theme with performance optimizations
  const applyTheme = useCallback(async (theme: Theme) => {
    try {
      setError(null);
      const errors = validateTheme(theme);
      if (errors.length > 0) {
        throw new Error(`Invalid theme: ${errors.join(', ')}`);
      }

      const performanceLevel = getPerformanceLevel();
      const deviceType = getDeviceType();
      const timeVariant = getCurrentTimeVariant();

      let activeTheme = { ...theme } as Theme;
      if (theme.variants && theme.variants[deviceType]) {
        activeTheme = mergeThemes(activeTheme, theme.variants[deviceType]);
      }
      if (theme.timeVariants && theme.timeVariants[timeVariant]) {
        activeTheme = mergeThemes(activeTheme, theme.timeVariants[timeVariant]);
      }

      // Adjust performance settings and apply low-power override
      const derived = {
        ...activeTheme.performance,
        quality: performanceLevel,
        enableParticles: activeTheme.performance.enableParticles && performanceLevel !== 'low',
        enableBlur: activeTheme.performance.enableBlur && performanceLevel !== 'low',
        enableShadows: activeTheme.performance.enableShadows && performanceLevel !== 'low'
      };
      if (lowPowerMode) {
        derived.quality = 'low';
        derived.enableParticles = false;
        derived.enableBlur = false;
        derived.enableShadows = false;
      }
      activeTheme.performance = derived;

      const effectiveTheme: Theme = isGlobalWallpaperEnabled && globalWallpaperOverride
        ? { ...activeTheme, wallpaper: globalWallpaperOverride }
        : activeTheme;

      const themeCSS = generateThemeCSS(effectiveTheme);
      const wallpaperCSS = generateWallpaperCSS(effectiveTheme);

      const existingStyle = document.getElementById('advanced-theme-styles');
      if (existingStyle) existingStyle.remove();

      const styleElement = document.createElement('style');
      styleElement.id = 'advanced-theme-styles';
      styleElement.textContent = `
        ${themeCSS}
        body { ${wallpaperCSS} }
        ${effectiveTheme.customCSS || ''}
      `;
      document.head.appendChild(styleElement);

      document.documentElement.setAttribute('data-theme', effectiveTheme.id);
      document.documentElement.setAttribute('data-performance', effectiveTheme.performance.quality);

      if (effectiveTheme.accessibility.reducedMotion) {
        document.documentElement.style.setProperty('--animation-duration', '0.01ms');
      }
      if (effectiveTheme.accessibility.highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }

      setCurrentTheme(effectiveTheme);
      localStorage.setItem('current-theme-id', effectiveTheme.id);

      try {
        const preset = effectiveTheme.id.includes('isac')
          ? 'isac'
          : effectiveTheme.id.includes('disavowed')
          ? 'disavowed'
          : effectiveTheme.id.includes('darkzone')
          ? 'darkzone'
          : 'none';
        (window as any).owSounds?.setPreset?.(preset);
      } catch { /* ignore */ }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply theme');
      console.error('Theme application error:', err);
    }
  }, [globalWallpaperOverride, isGlobalWallpaperEnabled, lowPowerMode]);

  const setTheme = useCallback((themeId: string) => {
    const theme = [...availableThemes, ...customThemes].find(t => t.id === themeId);
    if (theme) {
      applyTheme(theme);
    }
  }, [availableThemes, customThemes, applyTheme]);

  const createTheme = useCallback((themeData: Partial<Theme>) => {
    try {
      const newTheme: Theme = {
        id: `custom-${Date.now()}`,
        name: 'Custom Theme',
        description: 'A custom theme',
        category: 'custom',
        author: 'User',
        version: '1.0.0',
        baseMode: 'dark',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        featured: false,
        public: false,
        ...themeData
      } as Theme;

      const errors = validateTheme(newTheme);
      if (errors.length > 0) {
        throw new Error(`Invalid theme: ${errors.join(', ')}`);
      }

      const updatedCustomThemes = [...customThemes, newTheme];
      setCustomThemes(updatedCustomThemes);
      saveToStorage(updatedCustomThemes, presets);
      
      return newTheme;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create theme');
      console.error('Theme creation error:', err);
      return null;
    }
  }, [customThemes, presets, saveToStorage]);

  const updateTheme = useCallback((themeId: string, updates: Partial<Theme>) => {
    try {
      const themeIndex = customThemes.findIndex(t => t.id === themeId);
      if (themeIndex === -1) {
        throw new Error('Theme not found');
      }

      const updatedTheme = {
        ...customThemes[themeIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const errors = validateTheme(updatedTheme);
      if (errors.length > 0) {
        throw new Error(`Invalid theme: ${errors.join(', ')}`);
      }

      const updatedCustomThemes = [...customThemes];
      updatedCustomThemes[themeIndex] = updatedTheme;
      setCustomThemes(updatedCustomThemes);
      saveToStorage(updatedCustomThemes, presets);

      // If this is the current theme, reapply it
      if (currentTheme?.id === themeId) {
        applyTheme(updatedTheme);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update theme');
      console.error('Theme update error:', err);
    }
  }, [customThemes, presets, currentTheme, saveToStorage, applyTheme]);

  const deleteTheme = useCallback((themeId: string) => {
    try {
      const updatedCustomThemes = customThemes.filter(t => t.id !== themeId);
      setCustomThemes(updatedCustomThemes);
      saveToStorage(updatedCustomThemes, presets);

      // If this was the current theme, switch to default
      if (currentTheme?.id === themeId) {
        const defaultThemeObj = availableThemes[0];
        if (defaultThemeObj) {
          applyTheme(defaultThemeObj);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete theme');
      console.error('Theme deletion error:', err);
    }
  }, [customThemes, presets, currentTheme, availableThemes, saveToStorage, applyTheme]);

  const exportTheme = useCallback((themeId: string): string => {
    const theme = [...availableThemes, ...customThemes].find(t => t.id === themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }
    return JSON.stringify(theme, null, 2);
  }, [availableThemes, customThemes]);

  const importTheme = useCallback((themeData: string) => {
    try {
      const theme = JSON.parse(themeData) as Theme;
      const errors = validateTheme(theme);
      if (errors.length > 0) {
        throw new Error(`Invalid theme: ${errors.join(', ')}`);
      }

      // Ensure unique ID
      theme.id = `imported-${Date.now()}`;
      theme.createdAt = new Date().toISOString();
      theme.updatedAt = new Date().toISOString();

      const updatedCustomThemes = [...customThemes, theme];
      setCustomThemes(updatedCustomThemes);
      saveToStorage(updatedCustomThemes, presets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import theme');
      console.error('Theme import error:', err);
    }
  }, [customThemes, presets, saveToStorage]);

  const resetTheme = useCallback(() => {
    if (availableThemes.length > 0) {
      applyTheme(availableThemes[0]);
    }
  }, [availableThemes, applyTheme]);

  const applyPreset = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset && preset.themes.length > 0) {
      const defaultThemeId = preset.defaultTheme || preset.themes[0].id;
      const theme = preset.themes.find(t => t.id === defaultThemeId) || preset.themes[0];
      applyTheme(theme);
    }
  }, [presets, applyTheme]);

  // Global wallpaper API (exposed)
  const setGlobalWallpaperOverride = useCallback((wallpaper: ThemeWallpaper | null) => {
    setGlobalWallpaperOverrideState(wallpaper);
    saveGlobalWallpaper(wallpaper, isGlobalWallpaperEnabled);
    if (currentTheme) applyTheme(currentTheme);
  }, [isGlobalWallpaperEnabled, currentTheme, applyTheme, saveGlobalWallpaper]);

  const setIsGlobalWallpaperEnabled = useCallback((enabled: boolean) => {
    setIsGlobalWallpaperEnabledState(enabled);
    saveGlobalWallpaper(globalWallpaperOverride, enabled);
    if (currentTheme) applyTheme(currentTheme);
  }, [globalWallpaperOverride, currentTheme, applyTheme, saveGlobalWallpaper]);

  // Wallpaper profiles API
  const saveWallpaperProfile = useCallback((name: string, wallpaper?: ThemeWallpaper | null) => {
    const wp = wallpaper ?? globalWallpaperOverride;
    if (!wp) return;
    const updated = [...wallpaperProfiles.filter(p => p.name !== name), { name, wallpaper: wp }];
    setWallpaperProfiles(updated);
    persistProfiles(updated);
  }, [globalWallpaperOverride, wallpaperProfiles, persistProfiles]);

  const applyWallpaperProfile = useCallback((name: string) => {
    const profile = wallpaperProfiles.find(p => p.name === name);
    if (profile) {
      setGlobalWallpaperOverride(profile.wallpaper);
      setIsGlobalWallpaperEnabled(true);
    }
  }, [wallpaperProfiles, setGlobalWallpaperOverride, setIsGlobalWallpaperEnabled]);

  const deleteWallpaperProfile = useCallback((name: string) => {
    const updated = wallpaperProfiles.filter(p => p.name !== name);
    setWallpaperProfiles(updated);
    persistProfiles(updated);
  }, [wallpaperProfiles, persistProfiles]);

  // Handle window resize for responsive themes
  useEffect(() => {
    const handleResize = () => {
      if (currentTheme) {
        applyTheme(currentTheme);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentTheme, applyTheme]);

  // Handle time-based theme changes
  useEffect(() => {
    const handleTimeChange = () => {
      if (currentTheme && currentTheme.timeVariants) {
        applyTheme(currentTheme);
      }
    };

    // Check every hour for time-based changes
    const interval = setInterval(handleTimeChange, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentTheme, applyTheme]);

  const setLowPower = useCallback((enabled: boolean) => {
    setLowPowerMode(enabled);
    try { localStorage.setItem('low-power-mode', enabled ? '1' : '0'); } catch { /* ignore */ }
    if (currentTheme) applyTheme(currentTheme);
  }, [currentTheme, applyTheme]);

  const contextValue = useMemo(() => ({
    currentTheme: currentTheme!,
    availableThemes,
    presets,
    customThemes,
    setTheme,
    createTheme,
    updateTheme,
    deleteTheme,
    exportTheme,
    importTheme,
    resetTheme,
    applyPreset,
    isLoading,
    error,
    // Global wallpaper
    globalWallpaperOverride,
    isGlobalWallpaperEnabled,
    setGlobalWallpaperOverride,
    setIsGlobalWallpaperEnabled,
    // Profiles
    wallpaperProfiles,
    saveWallpaperProfile,
    applyWallpaperProfile,
    deleteWallpaperProfile,
    // Low power
    setLowPower,
    lowPowerMode
  }), [
    currentTheme,
    availableThemes,
    presets,
    customThemes,
    setTheme,
    createTheme,
    updateTheme,
    deleteTheme,
    exportTheme,
    importTheme,
    resetTheme,
    applyPreset,
    isLoading,
    error,
    globalWallpaperOverride,
    isGlobalWallpaperEnabled,
    setGlobalWallpaperOverride,
    setIsGlobalWallpaperEnabled,
    wallpaperProfiles,
    saveWallpaperProfile,
    applyWallpaperProfile,
    deleteWallpaperProfile,
    setLowPower,
    lowPowerMode
  ]);

  return (
    <AdvancedThemeContext.Provider value={contextValue}>
      {children}
    </AdvancedThemeContext.Provider>
  );
}

export function useAdvancedTheme() {
  const context = useContext(AdvancedThemeContext);
  if (context === undefined) {
    throw new Error('useAdvancedTheme must be used within an AdvancedThemeProvider');
  }
  return context;
}