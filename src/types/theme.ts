export interface ThemeColor {
  h: number; // Hue (0-360)
  s: number; // Saturation (0-100)
  l: number; // Lightness (0-100)
  a?: number; // Alpha (0-1)
}

export interface GradientStop {
  color: ThemeColor;
  position: number; // 0-100
}

export interface Gradient {
  type: 'linear' | 'radial' | 'conic';
  angle?: number; // For linear gradients
  stops: GradientStop[];
}

export interface Shadow {
  type: 'drop' | 'inner' | 'glow' | 'text';
  x: number;
  y: number;
  blur: number;
  spread?: number;
  color: ThemeColor;
  intensity: number; // 0-1
}

export interface Animation {
  name: string;
  duration: number; // ms
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | string;
  iterations: number | 'infinite';
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  delay?: number;
}

export interface ParticleEffect {
  enabled: boolean;
  type: 'snow' | 'rain' | 'dust' | 'sparks' | 'geometric' | 'custom' | 'fog';
  count: number;
  speed: number;
  size: { min: number; max: number };
  color: ThemeColor;
  opacity: { min: number; max: number };
  direction: number; // degrees
  wind: number; // -1 to 1
}

export interface BlurEffect {
  enabled: boolean;
  radius: number; // 0-50px
  saturation: number; // 0-200%
  brightness: number; // 0-200%
}

export interface Typography {
  fontFamily: string;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
  textShadow?: Shadow;
}

export interface ThemeColors {
  // Base colors
  background: ThemeColor;
  foreground: ThemeColor;
  
  // Interactive colors
  primary: ThemeColor;
  primaryForeground: ThemeColor;
  secondary: ThemeColor;
  secondaryForeground: ThemeColor;
  accent: ThemeColor;
  accentForeground: ThemeColor;
  
  // Status colors
  destructive: ThemeColor;
  destructiveForeground: ThemeColor;
  success: ThemeColor;
  successForeground: ThemeColor;
  warning: ThemeColor;
  warningForeground: ThemeColor;
  info: ThemeColor;
  infoForeground: ThemeColor;
  
  // UI colors
  muted: ThemeColor;
  mutedForeground: ThemeColor;
  border: ThemeColor;
  input: ThemeColor;
  ring: ThemeColor;
  card: ThemeColor;
  cardForeground: ThemeColor;
  popover: ThemeColor;
  popoverForeground: ThemeColor;
  
  // Sidebar colors
  sidebar: ThemeColor;
  sidebarForeground: ThemeColor;
  sidebarPrimary: ThemeColor;
  sidebarPrimaryForeground: ThemeColor;
  sidebarAccent: ThemeColor;
  sidebarAccentForeground: ThemeColor;
  sidebarBorder: ThemeColor;
  sidebarRing: ThemeColor;
  
  // Industry-specific colors
  asphalt?: ThemeColor;
  concrete?: ThemeColor;
  machinery?: ThemeColor;
  safety?: ThemeColor;
}

export interface ThemeEffects {
  shadows: {
    sm: Shadow;
    md: Shadow;
    lg: Shadow;
    xl: Shadow;
    glow: Shadow;
    inner: Shadow;
  };
  
  blur: {
    background: BlurEffect;
    overlay: BlurEffect;
    card: BlurEffect;
  };
  
  particles: ParticleEffect;
  
  animations: {
    fadeIn: Animation;
    slideIn: Animation;
    bounce: Animation;
    pulse: Animation;
    rotate: Animation;
    scale: Animation;
    glow: Animation;
    custom?: Animation[];
  };
  
  gradients: {
    primary: Gradient;
    secondary: Gradient;
    hero: Gradient;
    card: Gradient;
    button: Gradient;
    border: Gradient;
  };
}

export interface ThemeWallpaper {
  type: 'color' | 'gradient' | 'image' | 'video' | 'canvas';
  source?: string; // URL for image/video
  gradient?: Gradient;
  color?: ThemeColor;
  overlay?: {
    color: ThemeColor;
    opacity: number;
    blendMode: string;
  };
  animation?: Animation;
  parallax?: boolean;
  tiling?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';
  position?: string;
  size?: string;
}

export interface ThemeTypography {
  heading: Typography;
  body: Typography;
  caption: Typography;
  code: Typography;
  label: Typography;
}

export interface ThemeVariant {
  id: string;
  name: string;
  colors: Partial<ThemeColors>;
  effects?: Partial<ThemeEffects>;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: 'military' | 'asphalt' | 'construction' | 'nature' | 'tech' | 'abstract' | 'corporate' | 'custom';
  author: string;
  version: string;
  baseMode: 'light' | 'dark' | 'auto';
  
  // Core theme data
  colors: ThemeColors;
  effects: ThemeEffects;
  wallpaper: ThemeWallpaper;
  typography: ThemeTypography;
  
  // Responsive variants
  variants?: {
    mobile?: ThemeVariant;
    tablet?: ThemeVariant;
    desktop?: ThemeVariant;
    tv?: ThemeVariant;
  };
  
  // Time-based variants
  timeVariants?: {
    morning?: ThemeVariant;
    day?: ThemeVariant;
    evening?: ThemeVariant;
    night?: ThemeVariant;
  };
  
  // Custom CSS
  customCSS?: string;
  
  // Performance settings
  performance: {
    enableAnimations: boolean;
    enableParticles: boolean;
    enableBlur: boolean;
    enableShadows: boolean;
    enableGradients: boolean;
    quality: 'low' | 'medium' | 'high' | 'ultra';
  };
  
  // Accessibility
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    focusVisible: boolean;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  tags: string[];
  featured: boolean;
  public: boolean;
}

export interface ThemePreset {
  id: string;
  name: string;
  themes: Theme[];
  defaultTheme: string;
}

// Optional UI token extensions for per-component radii, borders, and focus rings
export interface ThemeUIRadius {
  card?: string;      // e.g., '0.5rem'
  button?: string;    // e.g., '0.5rem'
  input?: string;     // e.g., '0.5rem'
  menu?: string;      // e.g., '0.375rem'
  popover?: string;   // e.g., '0.375rem'
  toast?: string;     // e.g., '0.5rem'
}

export interface ThemeUIBorders {
  width?: string;       // e.g., '1px'
  focusRingWidth?: string;   // e.g., '2px'
  focusRingOffset?: string;  // e.g., '2px'
}

export interface ThemeUI {
  radius?: ThemeUIRadius;
  borders?: ThemeUIBorders;
}

export interface ThemeContext {
  currentTheme: Theme;
  availableThemes: Theme[];
  presets: ThemePreset[];
  customThemes: Theme[];
  setTheme: (themeId: string) => void;
  createTheme: (theme: Partial<Theme>) => void;
  updateTheme: (themeId: string, updates: Partial<Theme>) => void;
  deleteTheme: (themeId: string) => void;
  exportTheme: (themeId: string) => string;
  importTheme: (themeData: string) => void;
  resetTheme: () => void;
  applyPreset: (presetId: string) => void;
  isLoading: boolean;
  error: string | null;
  // Global wallpaper override API
  globalWallpaperOverride: ThemeWallpaper | null;
  isGlobalWallpaperEnabled: boolean;
  setGlobalWallpaperOverride: (wallpaper: ThemeWallpaper | null) => void;
  setIsGlobalWallpaperEnabled: (enabled: boolean) => void;
  // Wallpaper profiles
  wallpaperProfiles: { name: string; wallpaper: ThemeWallpaper }[];
  saveWallpaperProfile: (name: string, wallpaper?: ThemeWallpaper | null) => void;
  applyWallpaperProfile: (name: string) => void;
  deleteWallpaperProfile: (name: string) => void;
  
}