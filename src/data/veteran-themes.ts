import { Theme, ThemeColor } from "@/types/theme";

// Helper to create a ThemeColor
const color = (h: number, s: number, l: number, a?: number): ThemeColor => ({ h, s, l, a });

// Common animations and shadows kept simple to fit existing schema
const commonAnimations = {
  fadeIn: { name: "fadeIn", duration: 150, easing: "ease-out", iterations: 1, direction: "normal" },
  slideIn: {
    name: "slideInRight",
    duration: 300,
    easing: "ease-out",
    iterations: 1,
    direction: "normal",
  },
  bounce: {
    name: "bounce",
    duration: 1000,
    easing: "ease-in-out",
    iterations: "infinite",
    direction: "normal",
  },
  pulse: {
    name: "pulse",
    duration: 2000,
    easing: "ease-in-out",
    iterations: "infinite",
    direction: "alternate",
  },
  rotate: {
    name: "rotate",
    duration: 20000,
    easing: "linear",
    iterations: "infinite",
    direction: "normal",
  },
  scale: { name: "scale", duration: 200, easing: "ease-out", iterations: 1, direction: "normal" },
  glow: {
    name: "glow",
    duration: 3000,
    easing: "ease-in-out",
    iterations: "infinite",
    direction: "alternate",
  },
};

const commonShadows = {
  sm: { type: "drop" as const, x: 0, y: 1, blur: 2, color: color(0, 0, 0), intensity: 0.1 },
  md: { type: "drop" as const, x: 0, y: 4, blur: 6, color: color(0, 0, 0), intensity: 0.1 },
  lg: { type: "drop" as const, x: 0, y: 10, blur: 15, color: color(0, 0, 0), intensity: 0.12 },
  xl: { type: "drop" as const, x: 0, y: 20, blur: 25, color: color(0, 0, 0), intensity: 0.2 },
  glow: { type: "glow" as const, x: 0, y: 0, blur: 20, color: color(210, 100, 55), intensity: 0.4 },
  inner: { type: "inner" as const, x: 0, y: 2, blur: 4, color: color(0, 0, 0), intensity: 0.06 },
};

function baseTheme(partial: Partial<Theme>): Theme {
  const now = new Date().toISOString();
  return {
    id: "veteran-base",
    name: "Veteran Base",
    description: "",
    category: "military",
    author: "OverWatch Systems",
    version: "1.0.0",
    baseMode: "dark",
    colors: {
      background: color(220, 30, 8),
      foreground: color(0, 0, 98),
      primary: color(210, 100, 60),
      primaryForeground: color(0, 0, 100),
      secondary: color(0, 0, 85),
      secondaryForeground: color(220, 30, 10),
      accent: color(210, 100, 55),
      accentForeground: color(0, 0, 100),
      destructive: color(0, 85, 55),
      destructiveForeground: color(0, 0, 100),
      success: color(120, 85, 45),
      successForeground: color(0, 0, 100),
      warning: color(45, 100, 55),
      warningForeground: color(0, 0, 100),
      info: color(210, 100, 55),
      infoForeground: color(0, 0, 100),
      muted: color(220, 10, 25),
      mutedForeground: color(0, 0, 85),
      border: color(220, 12, 18),
      input: color(220, 12, 18),
      ring: color(213, 27, 70),
      card: color(220, 30, 8),
      cardForeground: color(0, 0, 95),
      popover: color(220, 30, 8),
      popoverForeground: color(0, 0, 95),
      sidebar: color(220, 18, 12),
      sidebarForeground: color(0, 0, 98),
      sidebarPrimary: color(210, 95, 58),
      sidebarPrimaryForeground: color(0, 0, 100),
      sidebarAccent: color(220, 10, 20),
      sidebarAccentForeground: color(0, 0, 96),
      sidebarBorder: color(220, 10, 20),
      sidebarRing: color(213, 27, 70),
    },
    effects: {
      shadows: commonShadows,
      blur: {
        background: { enabled: true, radius: 8, saturation: 120, brightness: 85 },
        overlay: { enabled: true, radius: 4, saturation: 100, brightness: 90 },
        card: { enabled: true, radius: 2, saturation: 110, brightness: 95 },
      },
      particles: {
        enabled: true,
        type: "geometric",
        count: 30,
        speed: 0.5,
        size: { min: 1, max: 3 },
        color: color(210, 100, 60),
        opacity: { min: 0.08, max: 0.22 },
        direction: 45,
        wind: 0.1,
      },
      animations: commonAnimations,
      gradients: {
        primary: {
          type: "linear",
          angle: 135,
          stops: [
            { color: color(210, 95, 58), position: 0 },
            { color: color(350, 90, 55), position: 100 },
          ],
        },
        secondary: {
          type: "linear",
          angle: 90,
          stops: [
            { color: color(0, 0, 85), position: 0 },
            { color: color(0, 0, 92), position: 100 },
          ],
        },
        hero: {
          type: "linear",
          angle: 180,
          stops: [
            { color: color(220, 25, 12), position: 0 },
            { color: color(220, 15, 18), position: 100 },
          ],
        },
        card: {
          type: "linear",
          angle: 145,
          stops: [
            { color: color(220, 30, 10), position: 0 },
            { color: color(220, 18, 12), position: 100 },
          ],
        },
        button: {
          type: "linear",
          angle: 90,
          stops: [
            { color: color(210, 100, 60), position: 0 },
            { color: color(210, 100, 50), position: 100 },
          ],
        },
        border: {
          type: "linear",
          angle: 0,
          stops: [
            { color: color(210, 95, 58, 0.35), position: 0 },
            { color: color(350, 90, 55, 0.35), position: 100 },
          ],
        },
      },
    },
    wallpaper: {
      type: "gradient",
      gradient: {
        type: "linear",
        angle: 135,
        stops: [
          { color: color(350, 90, 40), position: 0 },
          { color: color(210, 85, 35), position: 100 },
        ],
      },
      overlay: { color: color(0, 0, 0), opacity: 0.4, blendMode: "multiply" },
    },
    typography: {
      heading: { fontFamily: "Inter", fontWeight: 700, letterSpacing: -0.025, lineHeight: 1.2 },
      body: { fontFamily: "Inter", fontWeight: 400, letterSpacing: 0, lineHeight: 1.6 },
      caption: { fontFamily: "Inter", fontWeight: 500, letterSpacing: 0.025, lineHeight: 1.4 },
      code: { fontFamily: "Monaco", fontWeight: 400, letterSpacing: 0, lineHeight: 1.5 },
      label: { fontFamily: "Inter", fontWeight: 500, letterSpacing: 0.015, lineHeight: 1.3 },
    },
    performance: {
      enableAnimations: true,
      enableParticles: true,
      enableBlur: true,
      enableShadows: true,
      enableGradients: true,
      quality: "high",
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      focusVisible: true,
    },
    createdAt: now,
    updatedAt: now,
    tags: ["veteran"],
    featured: true,
    public: true,
    ...(partial as any),
  } as Theme;
}

function patrioticTheme(): Theme {
  return baseTheme({
    id: "veteran-patriot",
    name: "Patriot (Veteran)",
    description: "Red, white, and blue with star accents for U.S. Veterans",
    effects: {
      ...baseTheme({}).effects,
      particles: {
        enabled: true,
        type: "geometric",
        count: 60,
        speed: 0.6,
        size: { min: 1, max: 2 },
        color: color(0, 0, 100),
        opacity: { min: 0.1, max: 0.25 },
        direction: 0,
        wind: 0,
      },
      gradients: {
        primary: {
          type: "linear",
          angle: 135,
          stops: [
            { color: color(350, 90, 55), position: 0 },
            { color: color(210, 95, 58), position: 100 },
          ],
        },
        secondary: {
          type: "linear",
          angle: 90,
          stops: [
            { color: color(0, 0, 98), position: 0 },
            { color: color(0, 0, 90), position: 100 },
          ],
        },
        hero: {
          type: "linear",
          angle: 180,
          stops: [
            { color: color(350, 90, 45), position: 0 },
            { color: color(210, 85, 45), position: 100 },
          ],
        },
        card: {
          type: "linear",
          angle: 145,
          stops: [
            { color: color(220, 25, 12), position: 0 },
            { color: color(210, 25, 18), position: 100 },
          ],
        },
        button: {
          type: "linear",
          angle: 90,
          stops: [
            { color: color(350, 90, 55), position: 0 },
            { color: color(210, 95, 58), position: 100 },
          ],
        },
        border: {
          type: "linear",
          angle: 0,
          stops: [
            { color: color(350, 90, 55, 0.35), position: 0 },
            { color: color(210, 95, 58, 0.35), position: 100 },
          ],
        },
      },
    },
    wallpaper: {
      type: "gradient",
      gradient: {
        type: "linear",
        angle: 135,
        stops: [
          { color: color(350, 90, 35), position: 0 },
          { color: color(0, 0, 96), position: 50 },
          { color: color(210, 95, 35), position: 100 },
        ],
      },
      overlay: { color: color(0, 0, 0), opacity: 0.35, blendMode: "multiply" },
    },
    tags: ["veteran", "patriot", "usa"],
    featured: true,
    public: true,
    // @ts-ignore
    requiresVeteran: true,
  });
}

function branchTheme(
  id: string,
  name: string,
  primaryHue: number,
  accentHue: number,
  description: string,
  branchTag: string,
): Theme {
  return baseTheme({
    id,
    name,
    description,
    effects: {
      ...baseTheme({}).effects,
      particles: {
        enabled: true,
        type: "geometric",
        count: 40,
        speed: 0.5,
        size: { min: 1, max: 3 },
        color: color(primaryHue, 90, 55),
        opacity: { min: 0.08, max: 0.2 },
        direction: 30,
        wind: 0.05,
      },
      gradients: {
        primary: {
          type: "linear",
          angle: 135,
          stops: [
            { color: color(primaryHue, 90, 58), position: 0 },
            { color: color(accentHue, 90, 52), position: 100 },
          ],
        },
        secondary: {
          type: "linear",
          angle: 90,
          stops: [
            { color: color(0, 0, 85), position: 0 },
            { color: color(0, 0, 92), position: 100 },
          ],
        },
        hero: {
          type: "linear",
          angle: 180,
          stops: [
            { color: color(primaryHue, 80, 45), position: 0 },
            { color: color(accentHue, 80, 40), position: 100 },
          ],
        },
        card: {
          type: "linear",
          angle: 145,
          stops: [
            { color: color(220, 25, 12), position: 0 },
            { color: color(220, 15, 18), position: 100 },
          ],
        },
        button: {
          type: "linear",
          angle: 90,
          stops: [
            { color: color(primaryHue, 90, 58), position: 0 },
            { color: color(primaryHue, 90, 50), position: 100 },
          ],
        },
        border: {
          type: "linear",
          angle: 0,
          stops: [
            { color: color(primaryHue, 90, 58, 0.35), position: 0 },
            { color: color(accentHue, 90, 52, 0.35), position: 100 },
          ],
        },
      },
    },
    wallpaper: {
      type: "gradient",
      gradient: {
        type: "linear",
        angle: 135,
        stops: [
          { color: color(primaryHue, 70, 35), position: 0 },
          { color: color(accentHue, 70, 30), position: 100 },
        ],
      },
      overlay: { color: color(0, 0, 0), opacity: 0.35, blendMode: "multiply" },
    },
    tags: ["veteran", branchTag],
    featured: true,
    public: true,
    // @ts-ignore
    requiresVeteran: true,
  });
}

export const getVeteranThemes = (): Theme[] => {
  return [
    patrioticTheme(),
    branchTheme("branch-army", "U.S. Army", 90, 45, "Olive drab and gold accents", "branch:army"),
    branchTheme("branch-navy", "U.S. Navy", 220, 50, "Navy blue and gold", "branch:navy"),
    branchTheme(
      "branch-airforce",
      "U.S. Air Force",
      210,
      0,
      "Air superiority blue with silver",
      "branch:airforce",
    ),
    branchTheme(
      "branch-marines",
      "U.S. Marine Corps",
      350,
      45,
      "Scarlet and gold",
      "branch:marines",
    ),
    branchTheme(
      "branch-coastguard",
      "U.S. Coast Guard",
      200,
      10,
      "Coast Guard blue with white/red accents",
      "branch:coastguard",
    ),
    branchTheme(
      "branch-spaceforce",
      "U.S. Space Force",
      250,
      210,
      "Starlit black with space blue",
      "branch:spaceforce",
    ),
  ];
};
