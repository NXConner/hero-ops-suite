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

  // Load themes from storage
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
    } catch (err) {
      console.error('Failed to load theme config:', err);
    }
  }, [storageKey]);

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
        
        // Import default themes
        const { getDefaultThemes } = await import('@/data/default-themes');
        const defaultThemes = getDefaultThemes();
        
        setAvailableThemes(defaultThemes);
        
        // Set initial theme
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
      
      // Validate theme
      const errors = validateTheme(theme);
      if (errors.length > 0) {
        throw new Error(`Invalid theme: ${errors.join(', ')}`);
      }

      // Auto-adjust performance based on device
      const performanceLevel = getPerformanceLevel();
      const deviceType = getDeviceType();
      const timeVariant = getCurrentTimeVariant();

      // Apply responsive variant if available
      let activeTheme = { ...theme } as Theme;
      if (theme.variants && theme.variants[deviceType]) {
        activeTheme = mergeThemes(activeTheme, theme.variants[deviceType]);
      }

      // Apply time-based variant if available
      if (theme.timeVariants && theme.timeVariants[timeVariant]) {
        activeTheme = mergeThemes(activeTheme, theme.timeVariants[timeVariant]);
      }

      // Adjust performance settings
      activeTheme.performance = {
        ...activeTheme.performance,
        quality: performanceLevel,
        enableParticles: activeTheme.performance.enableParticles && performanceLevel !== 'low',
        enableBlur: activeTheme.performance.enableBlur && performanceLevel !== 'low',
        enableShadows: activeTheme.performance.enableShadows && performanceLevel !== 'low'
      };

      // Apply global wallpaper override if enabled
      const effectiveTheme: Theme = isGlobalWallpaperEnabled && globalWallpaperOverride
        ? { ...activeTheme, wallpaper: globalWallpaperOverride }
        : activeTheme;

      // Generate and inject CSS
      const themeCSS = generateThemeCSS(effectiveTheme);
      const wallpaperCSS = generateWallpaperCSS(effectiveTheme);
      
      // Remove existing theme styles
      const existingStyle = document.getElementById('advanced-theme-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Inject new theme styles
      const styleElement = document.createElement('style');
      styleElement.id = 'advanced-theme-styles';
      styleElement.textContent = `
        ${themeCSS}
        
        body {
          ${wallpaperCSS}
        }
        
        ${effectiveTheme.customCSS || ''}
      `;
      document.head.appendChild(styleElement);

      // Set theme data attribute
      document.documentElement.setAttribute('data-theme', effectiveTheme.id);
      document.documentElement.setAttribute('data-performance', effectiveTheme.performance.quality);
      
      // Apply accessibility settings
      if (effectiveTheme.accessibility.reducedMotion) {
        document.documentElement.style.setProperty('--animation-duration', '0.01ms');
      }
      
      if (effectiveTheme.accessibility.highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }

      setCurrentTheme(effectiveTheme);
      
      // Save current theme to localStorage
      localStorage.setItem('current-theme-id', effectiveTheme.id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply theme');
      console.error('Theme application error:', err);
    }
  }, [globalWallpaperOverride, isGlobalWallpaperEnabled]);

  // Theme management functions
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
    setIsGlobalWallpaperEnabled
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
    setIsGlobalWallpaperEnabled
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