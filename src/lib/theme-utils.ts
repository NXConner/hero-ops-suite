// @ts-nocheck
import { ThemeColor, Theme, Gradient, Shadow, Animation, ParticleEffect } from "@/types/theme";

// Color utilities
export function hslToString(color: ThemeColor): string {
  const alpha = color.a !== undefined ? ` / ${color.a}` : "";
  return `hsl(${color.h} ${color.s}% ${color.l}%${alpha})`;
}

export function stringToHsl(colorString: string): ThemeColor {
  const hslMatch = colorString.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%(?:\s*\/\s*([\d.]+))?\)/);
  if (!hslMatch) {
    throw new Error("Invalid HSL color string");
  }

  return {
    h: parseInt(hslMatch[1]),
    s: parseInt(hslMatch[2]),
    l: parseInt(hslMatch[3]),
    a: hslMatch[4] ? parseFloat(hslMatch[4]) : undefined,
  };
}

export function adjustHue(color: ThemeColor, amount: number): ThemeColor {
  return {
    ...color,
    h: (color.h + amount) % 360,
  };
}

export function adjustSaturation(color: ThemeColor, amount: number): ThemeColor {
  return {
    ...color,
    s: Math.max(0, Math.min(100, color.s + amount)),
  };
}

export function adjustLightness(color: ThemeColor, amount: number): ThemeColor {
  return {
    ...color,
    l: Math.max(0, Math.min(100, color.l + amount)),
  };
}

export function adjustAlpha(color: ThemeColor, alpha: number): ThemeColor {
  return {
    ...color,
    a: Math.max(0, Math.min(1, alpha)),
  };
}

export function complementaryColor(color: ThemeColor): ThemeColor {
  return adjustHue(color, 180);
}

export function triadicColors(color: ThemeColor): [ThemeColor, ThemeColor] {
  return [adjustHue(color, 120), adjustHue(color, 240)];
}

export function analogousColors(color: ThemeColor): [ThemeColor, ThemeColor] {
  return [adjustHue(color, 30), adjustHue(color, -30)];
}

export function generateColorScheme(
  baseColor: ThemeColor,
  type: "monochromatic" | "complementary" | "triadic" | "analogous",
): ThemeColor[] {
  switch (type) {
    case "monochromatic":
      return [
        adjustLightness(baseColor, 40),
        adjustLightness(baseColor, 20),
        baseColor,
        adjustLightness(baseColor, -20),
        adjustLightness(baseColor, -40),
      ];
    case "complementary":
      return [baseColor, complementaryColor(baseColor)];
    case "triadic":
      return [baseColor, ...triadicColors(baseColor)];
    case "analogous":
      return [baseColor, ...analogousColors(baseColor)];
    default:
      return [baseColor];
  }
}

// Gradient utilities
export function gradientToCSS(gradient: Gradient): string {
  const stops = gradient.stops
    .sort((a, b) => a.position - b.position)
    .map((stop) => `${hslToString(stop.color)} ${stop.position}%`)
    .join(", ");

  switch (gradient.type) {
    case "linear":
      const angle = gradient.angle || 0;
      return `linear-gradient(${angle}deg, ${stops})`;
    case "radial":
      return `radial-gradient(circle, ${stops})`;
    case "conic":
      const startAngle = gradient.angle || 0;
      return `conic-gradient(from ${startAngle}deg, ${stops})`;
    default:
      return `linear-gradient(${stops})`;
  }
}

// Shadow utilities
export function shadowToCSS(shadow: Shadow): string {
  const color = hslToString(adjustAlpha(shadow.color, shadow.intensity));

  switch (shadow.type) {
    case "drop":
      return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread || 0}px ${color}`;
    case "inner":
      return `inset ${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread || 0}px ${color}`;
    case "glow":
      return `0 0 ${shadow.blur}px ${shadow.spread || 0}px ${color}`;
    case "text":
      return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${color}`;
    default:
      return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${color}`;
  }
}

// Animation utilities
export function animationToCSS(animation: Animation): string {
  const iterations =
    animation.iterations === "infinite" ? "infinite" : animation.iterations.toString();
  const delay = animation.delay ? `${animation.delay}ms` : "0ms";

  return `${animation.name} ${animation.duration}ms ${animation.easing} ${delay} ${iterations} ${animation.direction}`;
}

// Performance utilities
export function getPerformanceLevel(): "low" | "medium" | "high" | "ultra" {
  if (typeof window === "undefined") return "medium";

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  if (!gl) return "low";

  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "";

  // Basic performance detection based on GPU
  if (renderer.includes("RTX") || renderer.includes("RX 6") || renderer.includes("RX 7")) {
    return "ultra";
  } else if (renderer.includes("GTX") || renderer.includes("RX 5")) {
    return "high";
  } else if (renderer.includes("Intel") && renderer.includes("Iris")) {
    return "medium";
  } else {
    return "low";
  }
}

export function shouldEnableEffect(
  effect: string,
  performance: "low" | "medium" | "high" | "ultra",
): boolean {
  const effectLevels = {
    particles: ["high", "ultra"],
    blur: ["medium", "high", "ultra"],
    shadows: ["medium", "high", "ultra"],
    animations: ["low", "medium", "high", "ultra"],
    gradients: ["low", "medium", "high", "ultra"],
  };

  return effectLevels[effect as keyof typeof effectLevels]?.includes(performance) || false;
}

// CSS Generation
export function generateThemeCSS(theme: Theme): string {
  const colors = Object.entries(theme.colors)
    .map(([key, color]) => {
      const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `--${cssVar}: ${color.h} ${color.s}% ${color.l}%;`;
    })
    .join("\n    ");

  const gradients = Object.entries(theme.effects.gradients)
    .map(([key, gradient]) => {
      const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `--gradient-${cssVar}: ${gradientToCSS(gradient)};`;
    })
    .join("\n    ");

  const shadows = Object.entries(theme.effects.shadows)
    .map(([key, shadow]) => {
      const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `--shadow-${cssVar}: ${shadowToCSS(shadow)};`;
    })
    .join("\n    ");

  const animations = Object.entries(theme.effects.animations)
    .filter(([_, anim]) => anim)
    .map(([key, animation]) => {
      const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `--animation-${cssVar}: ${animationToCSS(animation)};`;
    })
    .join("\n    ");

  const uiTokens = (() => {
    const vars: string[] = [];
    const ui = (theme as any).ui as { radius?: any; borders?: any } | undefined;
    if (ui?.radius) {
      if (ui.radius.card) vars.push(`--radius-card: ${ui.radius.card};`);
      if (ui.radius.button) vars.push(`--radius-button: ${ui.radius.button};`);
      if (ui.radius.input) vars.push(`--radius-input: ${ui.radius.input};`);
      if (ui.radius.menu) vars.push(`--radius-menu: ${ui.radius.menu};`);
      if (ui.radius.popover) vars.push(`--radius-popover: ${ui.radius.popover};`);
      if (ui.radius.toast) vars.push(`--radius-toast: ${ui.radius.toast};`);
      if (ui.radius.dialog) vars.push(`--radius-dialog: ${ui.radius.dialog};`);
      if (ui.radius.tabs) vars.push(`--radius-tabs: ${ui.radius.tabs};`);
    }
    if (ui?.borders) {
      if (ui.borders.width) vars.push(`--border-width: ${ui.borders.width};`);
      if (ui.borders.focusRingWidth) vars.push(`--ring-width: ${ui.borders.focusRingWidth};`);
      if (ui.borders.focusRingOffset) vars.push(`--ring-offset: ${ui.borders.focusRingOffset};`);
    }
    return vars.join("\n    ");
  })();

  return `:root[data-theme="${theme.id}"] {
    ${colors}
    ${gradients}
    ${shadows}
    ${animations}
    --border-radius: 0.5rem;
    ${uiTokens}
  }`;
}

// Wallpaper utilities
export function generateWallpaperCSS(theme: Theme): string {
  const { wallpaper } = theme;
  let backgroundCSS = "";

  switch (wallpaper.type) {
    case "color":
      backgroundCSS = `background: ${hslToString(wallpaper.color!)};`;
      break;
    case "gradient":
      backgroundCSS = `background: ${gradientToCSS(wallpaper.gradient!)};`;
      break;
    case "image":
      backgroundCSS = `
        background-image: url('${wallpaper.source}');
        background-size: ${wallpaper.size || "cover"};
        background-position: ${wallpaper.position || "center"};
        background-repeat: ${wallpaper.tiling || "no-repeat"};
      `;
      break;
    case "video":
      // Video backgrounds need special handling
      backgroundCSS = `background: ${hslToString({ h: 0, s: 0, l: 0 })};`;
      break;
  }

  // Filters
  const filters = (wallpaper as any).filters as { hue?: number; brightness?: number } | undefined;
  if (filters && (typeof filters.hue === "number" || typeof filters.brightness === "number")) {
    const hue = typeof filters.hue === "number" ? filters.hue : 0;
    const brightness = typeof filters.brightness === "number" ? filters.brightness : 100;
    backgroundCSS += `\nfilter: hue-rotate(${hue}deg) brightness(${brightness}%);`;
  }

  // Parallax strength/attachment
  if (wallpaper.parallax) {
    backgroundCSS += `\nbackground-attachment: fixed;`;
  }

  if ((wallpaper as any).parallaxStrength) {
    // Expose as CSS var for potential JS parallax drivers
    backgroundCSS += `\n--parallax-strength: ${(wallpaper as any).parallaxStrength};`;
  }

  if (wallpaper.overlay) {
    const overlayColor = hslToString(
      adjustAlpha(wallpaper.overlay.color, wallpaper.overlay.opacity),
    );
    backgroundCSS += `\nbackground-blend-mode: ${wallpaper.overlay.blendMode};\nposition: relative;`;
    // Note: pseudo-element cannot be injected via inline style string here; handled by theme CSS elsewhere if needed
  }

  return backgroundCSS;
}

// Theme validation
export function validateTheme(theme: Partial<Theme>): string[] {
  const errors: string[] = [];

  if (!theme.id) errors.push("Theme ID is required");
  if (!theme.name) errors.push("Theme name is required");
  if (!theme.colors) errors.push("Theme colors are required");

  if (theme.colors) {
    const requiredColors = ["background", "foreground", "primary", "secondary", "accent"];
    for (const color of requiredColors) {
      if (!theme.colors[color as keyof typeof theme.colors]) {
        errors.push(`Color '${color}' is required`);
      }
    }
  }

  return errors;
}

// Theme manipulation
export function mergeThemes(baseTheme: Theme, overrides: Partial<Theme>): Theme {
  return {
    ...baseTheme,
    ...overrides,
    colors: { ...baseTheme.colors, ...overrides.colors },
    effects: { ...baseTheme.effects, ...overrides.effects },
    performance: { ...baseTheme.performance, ...overrides.performance },
    accessibility: { ...baseTheme.accessibility, ...overrides.accessibility },
  };
}

export function createThemeVariant(baseTheme: Theme, colorAdjustments: Partial<ThemeColor>): Theme {
  const adjustedColors = Object.entries(baseTheme.colors).reduce(
    (acc, [key, color]) => {
      acc[key as keyof typeof baseTheme.colors] = {
        h: colorAdjustments.h !== undefined ? (color.h + colorAdjustments.h) % 360 : color.h,
        s:
          colorAdjustments.s !== undefined
            ? Math.max(0, Math.min(100, color.s + colorAdjustments.s))
            : color.s,
        l:
          colorAdjustments.l !== undefined
            ? Math.max(0, Math.min(100, color.l + colorAdjustments.l))
            : color.l,
        a: colorAdjustments.a !== undefined ? colorAdjustments.a : color.a,
      };
      return acc;
    },
    {} as typeof baseTheme.colors,
  );

  return {
    ...baseTheme,
    id: `${baseTheme.id}-variant-${Date.now()}`,
    name: `${baseTheme.name} Variant`,
    colors: adjustedColors,
  };
}

// Device detection
export function getDeviceType(): "mobile" | "tablet" | "desktop" | "tv" {
  if (typeof window === "undefined") return "desktop";

  const width = window.innerWidth;
  const height = window.innerHeight;

  if (width >= 1920 && height >= 1080) return "tv";
  if (width >= 1024) return "desktop";
  if (width >= 768) return "tablet";
  return "mobile";
}

// Time-based theming
export function getCurrentTimeVariant(): "morning" | "day" | "evening" | "night" {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "day";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}
