// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAdvancedTheme } from '@/contexts/AdvancedThemeContext';
import { Theme, ThemeColor, ParticleEffect } from '@/types/theme';
import { 
  hslToString, 
  adjustHue, 
  adjustSaturation, 
  adjustLightness,
  generateColorScheme,
  generateThemeCSS,
  generateWallpaperCSS
} from '@/lib/theme-utils';
import ParticleSystem from '@/components/effects/ParticleSystem';
import { 
  Palette, 
  Sparkles, 
  Settings, 
  Eye, 
  Download, 
  Upload, 
  Wand2,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Gauge,
  Accessibility,
  Target,
  Check
} from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

interface ColorPickerProps {
  color: ThemeColor;
  onChange: (color: ThemeColor) => void;
  label: string;
}

function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-4 gap-2">
        <div>
          <Label className="text-xs">H</Label>
          <Slider
            value={[color.h]}
            onValueChange={([h]) => onChange({ ...color, h })}
            max={360}
            step={1}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground">{color.h}°</span>
        </div>
        <div>
          <Label className="text-xs">S</Label>
          <Slider
            value={[color.s]}
            onValueChange={([s]) => onChange({ ...color, s })}
            max={100}
            step={1}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground">{color.s}%</span>
        </div>
        <div>
          <Label className="text-xs">L</Label>
          <Slider
            value={[color.l]}
            onValueChange={([l]) => onChange({ ...color, l })}
            max={100}
            step={1}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground">{color.l}%</span>
        </div>
        <div className="flex items-end">
          <div 
            className="w-8 h-8 rounded border border-border"
            style={{ backgroundColor: hslToString(color) }}
          />
        </div>
      </div>
    </div>
  );
}

interface ParticleControlsProps {
  particles: ParticleEffect;
  onChange: (particles: ParticleEffect) => void;
}

function ParticleControls({ particles, onChange }: ParticleControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Enable Particles</Label>
        <Switch 
          checked={particles.enabled}
          onCheckedChange={(enabled) => onChange({ ...particles, enabled })}
        />
      </div>
      
      {particles.enabled && (
        <>
          <div>
            <Label>Particle Type</Label>
            <Select 
              value={particles.type}
              onValueChange={(type: any) => onChange({ ...particles, type })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="snow">Snow</SelectItem>
                <SelectItem value="rain">Rain</SelectItem>
                <SelectItem value="dust">Dust</SelectItem>
                <SelectItem value="sparks">Sparks</SelectItem>
                <SelectItem value="geometric">Geometric</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Count: {particles.count}</Label>
            <Slider
              value={[particles.count]}
              onValueChange={([count]) => onChange({ ...particles, count })}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div>
            <Label>Speed: {particles.speed.toFixed(1)}</Label>
            <Slider
              value={[particles.speed]}
              onValueChange={([speed]) => onChange({ ...particles, speed })}
              min={0}
              max={3}
              step={0.1}
            />
          </div>

          <div>
            <Label>Direction: {particles.direction}°</Label>
            <Slider
              value={[particles.direction]}
              onValueChange={([direction]) => onChange({ ...particles, direction })}
              min={0}
              max={360}
              step={15}
            />
          </div>

          <ColorPicker
            color={particles.color}
            onChange={(color) => onChange({ ...particles, color })}
            label="Particle Color"
          />
        </>
      )}
    </div>
  );
}

export function AdvancedThemeCustomizer() {
  const { currentTheme, updateTheme, createTheme, exportTheme, importTheme, setTheme } = useAdvancedTheme();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [customTheme, setCustomTheme] = useState<Theme>(currentTheme);
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'tablet' | 'desktop' | 'tv'>('desktop');
  const [isTargetsMode, setIsTargetsMode] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorPath, setInspectorPath] = useState<string>('colors.card');

  // Inject/remove preview CSS
  useEffect(() => {
    if (!isPreviewMode) {
      const prev = document.getElementById('preview-theme-styles');
      if (prev) prev.remove();
      document.documentElement.setAttribute('data-theme', currentTheme.id);
      return;
    }
    try {
      const css = generateThemeCSS(customTheme);
      const wp = generateWallpaperCSS(customTheme);
      const style = document.createElement('style');
      style.id = 'preview-theme-styles';
      style.textContent = `
        ${css}
        body { ${wp} }
      `;
      // remove existing first
      const prev = document.getElementById('preview-theme-styles');
      if (prev) prev.remove();
      document.head.appendChild(style);
      document.documentElement.setAttribute('data-theme', customTheme.id);
        } catch (e) { /* ignore */ }
   }, [isPreviewMode, customTheme, currentTheme]);

  // Real-time preview theme
  const previewTheme = useMemo(() => {
    if (!isPreviewMode) return currentTheme;
    return customTheme;
  }, [isPreviewMode, customTheme, currentTheme]);

  const updateColor = (path: string, color: ThemeColor) => {
    const updatedTheme = { ...customTheme };
    const pathParts = path.split('.');
    let current: any = updatedTheme;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = color;
    
    setCustomTheme(updatedTheme);
  };

  const openInspector = (path: string) => {
    setInspectorPath(path);
    setInspectorOpen(true);
  };

  const handleApplyToCurrent = () => {
    // If current theme is custom, try update; otherwise save a new theme and switch
    try {
      updateTheme(currentTheme.id, customTheme);
    } catch {
      const newTheme = createTheme({ ...customTheme, name: `${currentTheme.name} Variant` });
      if (newTheme) setTheme(newTheme.id);
    }
  };

  const generateScheme = (baseColor: ThemeColor, type: 'monochromatic' | 'complementary' | 'triadic' | 'analogous') => {
    const colors = generateColorScheme(baseColor, type);
    const updatedTheme = { ...customTheme };
    
    // Apply generated colors to theme
    if (colors.length >= 2) {
      updatedTheme.colors.primary = colors[0];
      updatedTheme.colors.secondary = colors[1];
    }
    if (colors.length >= 3) {
      updatedTheme.colors.accent = colors[2];
    }
    
    setCustomTheme(updatedTheme);
  };

  const handleSaveTheme = () => {
    const newTheme = createTheme(customTheme);
    if (newTheme) {
      setCustomTheme(newTheme);
    }
  };

  const handleExportTheme = () => {
    const themeData = exportTheme(customTheme.id);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customTheme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const themeData = e.target?.result as string;
          importTheme(themeData);
        } catch (error) {
          console.error('Failed to import theme:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Preview Mode Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Advanced Theme Customizer
              </CardTitle>
              <CardDescription>
                Create and customize themes with real-time preview
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isTargetsMode ? "default" : "outline"}
                onClick={() => setIsTargetsMode(!isTargetsMode)}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                {isTargetsMode ? "Targets On" : "Targets Mode"}
              </Button>
              <Button
                variant={isPreviewMode ? "default" : "outline"}
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {isPreviewMode ? "Exit Preview" : "Preview Mode"}
              </Button>
              <Button onClick={handleApplyToCurrent} variant="outline" className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Apply to Current
              </Button>
              <Button onClick={handleSaveTheme} className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Save Theme
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customization Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="effects">Effects</TabsTrigger>
              <TabsTrigger value="wallpaper">Wallpaper</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="responsive">Responsive</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Color Scheme</CardTitle>
                  <CardDescription>
                    Customize the color palette for your theme
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quick Color Scheme Generation */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Quick Schemes</Label>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generateScheme(customTheme.colors.primary, 'monochromatic')}
                      >
                        Monochromatic
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generateScheme(customTheme.colors.primary, 'complementary')}
                      >
                        Complementary
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generateScheme(customTheme.colors.primary, 'triadic')}
                      >
                        Triadic
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generateScheme(customTheme.colors.primary, 'analogous')}
                      >
                        Analogous
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Core Colors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                      color={customTheme.colors.background}
                      onChange={(color) => updateColor('colors.background', color)}
                      label="Background"
                    />
                    <ColorPicker
                      color={customTheme.colors.foreground}
                      onChange={(color) => updateColor('colors.foreground', color)}
                      label="Foreground"
                    />
                    <ColorPicker
                      color={customTheme.colors.primary}
                      onChange={(color) => updateColor('colors.primary', color)}
                      label="Primary"
                    />
                    <ColorPicker
                      color={customTheme.colors.secondary}
                      onChange={(color) => updateColor('colors.secondary', color)}
                      label="Secondary"
                    />
                    <ColorPicker
                      color={customTheme.colors.accent}
                      onChange={(color) => updateColor('colors.accent', color)}
                      label="Accent"
                    />
                    <ColorPicker
                      color={customTheme.colors.muted}
                      onChange={(color) => updateColor('colors.muted', color)}
                      label="Muted"
                    />
                  </div>

                  {/* Industry Colors */}
                  {(customTheme.colors.asphalt || customTheme.colors.concrete) && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Industry Colors</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {customTheme.colors.asphalt && (
                            <ColorPicker
                              color={customTheme.colors.asphalt}
                              onChange={(color) => updateColor('colors.asphalt', color)}
                              label="Asphalt"
                            />
                          )}
                          {customTheme.colors.concrete && (
                            <ColorPicker
                              color={customTheme.colors.concrete}
                              onChange={(color) => updateColor('colors.concrete', color)}
                              label="Concrete"
                            />
                          )}
                          {customTheme.colors.machinery && (
                            <ColorPicker
                              color={customTheme.colors.machinery}
                              onChange={(color) => updateColor('colors.machinery', color)}
                              label="Machinery"
                            />
                          )}
                          {customTheme.colors.safety && (
                            <ColorPicker
                              color={customTheme.colors.safety}
                              onChange={(color) => updateColor('colors.safety', color)}
                              label="Safety"
                            />
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="effects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Visual Effects
                  </CardTitle>
                  <CardDescription>
                    Configure shadows, particles, animations, and other effects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Particles (existing) */}
                  <ParticleControls
                    particles={customTheme.effects.particles}
                    onChange={(particles) => 
                      setCustomTheme({
                        ...customTheme,
                        effects: { ...customTheme.effects, particles }
                      })
                    }
                  />

                  <Separator />

                  {/* Border radius and glow */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Border Radius</Label>
                      <Slider
                        value={[parseInt(getComputedStyle(document.documentElement).getPropertyValue('--border-radius') || '8', 10)]}
                        min={0}
                        max={24}
                        step={1}
                        onValueChange={([v]) => {
                          const s = document.getElementById('preview-theme-styles');
                          const style = s || document.createElement('style');
                          style.id = 'preview-theme-styles';
                          style.textContent = `:root{ --border-radius: ${v}px; }`;
                          if (!s) document.head.appendChild(style);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Glow Intensity</Label>
                      <Slider
                        value={[Math.round((customTheme.effects.shadows.glow.intensity || 0.3) * 100)]}
                        min={0}
                        max={100}
                        step={5}
                        onValueChange={([v]) => {
                          const updated = { ...customTheme } as any;
                          updated.effects = { ...customTheme.effects, shadows: { ...customTheme.effects.shadows, glow: { ...customTheme.effects.shadows.glow, intensity: v/100 } } } as any;
                          setCustomTheme(updated);
                        }}
                      />
                    </div>
                  </div>

                  {/* UI Tokens */}
                  <Separator />
                  <div className="space-y-4">
                    <div className="text-sm font-medium">UI Tokens</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Card Radius</Label>
                        <Slider min={0} max={24} step={1} value={[parseInt(((customTheme as any).ui?.radius?.card || '8px').toString(), 10)]}
                          onValueChange={([v]) => {
                            const updated = { ...customTheme } as any;
                            updated.ui = { ...(updated.ui || {}), radius: { ...(updated.ui?.radius || {}), card: `${v}px` } };
                            setCustomTheme(updated);
                            const s = document.getElementById('preview-theme-styles');
                            const style = s || document.createElement('style');
                            style.id = 'preview-theme-styles';
                            const prev = style.textContent || '';
                            style.textContent = `${prev}\n:root{ --radius-card: ${v}px; }`;
                            if (!s) document.head.appendChild(style);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Button Radius</Label>
                        <Slider min={0} max={24} step={1} value={[parseInt(((customTheme as any).ui?.radius?.button || '8px').toString(), 10)]}
                          onValueChange={([v]) => {
                            const updated = { ...customTheme } as any;
                            updated.ui = { ...(updated.ui || {}), radius: { ...(updated.ui?.radius || {}), button: `${v}px` } };
                            setCustomTheme(updated);
                            const s = document.getElementById('preview-theme-styles');
                            const style = s || document.createElement('style');
                            style.id = 'preview-theme-styles';
                            const prev = style.textContent || '';
                            style.textContent = `${prev}\n:root{ --radius-button: ${v}px; }`;
                            if (!s) document.head.appendChild(style);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Input/Select Radius</Label>
                        <Slider min={0} max={24} step={1} value={[parseInt(((customTheme as any).ui?.radius?.input || '8px').toString(), 10)]}
                          onValueChange={([v]) => {
                            const updated = { ...customTheme } as any;
                            updated.ui = { ...(updated.ui || {}), radius: { ...(updated.ui?.radius || {}), input: `${v}px` } };
                            setCustomTheme(updated);
                            const s = document.getElementById('preview-theme-styles');
                            const style = s || document.createElement('style');
                            style.id = 'preview-theme-styles';
                            const prev = style.textContent || '';
                            style.textContent = `${prev}\n:root{ --radius-input: ${v}px; }`;
                            if (!s) document.head.appendChild(style);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Menu Radius</Label>
                        <Slider min={0} max={24} step={1} value={[parseInt(((customTheme as any).ui?.radius?.menu || '6px').toString(), 10)]}
                          onValueChange={([v]) => {
                            const updated = { ...customTheme } as any;
                            updated.ui = { ...(updated.ui || {}), radius: { ...(updated.ui?.radius || {}), menu: `${v}px` } };
                            setCustomTheme(updated);
                            const s = document.getElementById('preview-theme-styles');
                            const style = s || document.createElement('style');
                            style.id = 'preview-theme-styles';
                            const prev = style.textContent || '';
                            style.textContent = `${prev}\n:root{ --radius-menu: ${v}px; }`;
                            if (!s) document.head.appendChild(style);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Popover/Dropdown Radius</Label>
                        <Slider min={0} max={24} step={1} value={[parseInt(((customTheme as any).ui?.radius?.popover || '6px').toString(), 10)]}
                          onValueChange={([v]) => {
                            const updated = { ...customTheme } as any;
                            updated.ui = { ...(updated.ui || {}), radius: { ...(updated.ui?.radius || {}), popover: `${v}px` } };
                            setCustomTheme(updated);
                            const s = document.getElementById('preview-theme-styles');
                            const style = s || document.createElement('style');
                            style.id = 'preview-theme-styles';
                            const prev = style.textContent || '';
                            style.textContent = `${prev}\n:root{ --radius-popover: ${v}px; }`;
                            if (!s) document.head.appendChild(style);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Toast Radius</Label>
                        <Slider min={0} max={24} step={1} value={[parseInt(((customTheme as any).ui?.radius?.toast || '8px').toString(), 10)]}
                          onValueChange={([v]) => {
                            const updated = { ...customTheme } as any;
                            updated.ui = { ...(updated.ui || {}), radius: { ...(updated.ui?.radius || {}), toast: `${v}px` } };
                            setCustomTheme(updated);
                            const s = document.getElementById('preview-theme-styles');
                            const style = s || document.createElement('style');
                            style.id = 'preview-theme-styles';
                            const prev = style.textContent || '';
                            style.textContent = `${prev}\n:root{ --radius-toast: ${v}px; }`;
                            if (!s) document.head.appendChild(style);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Dialog Radius</Label>
                        <Slider min={0} max={32} step={1} value={[parseInt(((customTheme as any).ui?.radius?.dialog || '8px').toString(), 10)]}
                          onValueChange={([v]) => {
                            const updated = { ...customTheme } as any;
                            updated.ui = { ...(updated.ui || {}), radius: { ...(updated.ui?.radius || {}), dialog: `${v}px` } };
                            setCustomTheme(updated);
                            const s = document.getElementById('preview-theme-styles');
                            const style = s || document.createElement('style');
                            style.id = 'preview-theme-styles';
                            const prev = style.textContent || '';
                            style.textContent = `${prev}\n:root{ --radius-dialog: ${v}px; }`;
                            if (!s) document.head.appendChild(style);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Tabs Radius</Label>
                        <Slider min={0} max={16} step={1} value={[parseInt(((customTheme as any).ui?.radius?.tabs || '6px').toString(), 10)]}
                          onValueChange={([v]) => {
                            const updated = { ...customTheme } as any;
                            updated.ui = { ...(updated.ui || {}), radius: { ...(updated.ui?.radius || {}), tabs: `${v}px` } };
                            setCustomTheme(updated);
                            const s = document.getElementById('preview-theme-styles');
                            const style = s || document.createElement('style');
                            style.id = 'preview-theme-styles';
                            const prev = style.textContent || '';
                            style.textContent = `${prev}\n:root{ --radius-tabs: ${v}px; }`;
                            if (!s) document.head.appendChild(style);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Border Width</Label>
                        <Slider min={0} max={4} step={1} value={[parseInt(((customTheme as any).ui?.borders?.width || '1px').toString(), 10)]}
                          onValueChange={([v]) => {
                            const updated = { ...customTheme } as any;
                            updated.ui = { ...(updated.ui || {}), borders: { ...(updated.ui?.borders || {}), width: `${v}px` } };
                            setCustomTheme(updated);
                            const s = document.getElementById('preview-theme-styles');
                            const style = s || document.createElement('style');
                            style.id = 'preview-theme-styles';
                            const prev = style.textContent || '';
                            style.textContent = `${prev}\n:root{ --border-width: ${v}px; }`;
                            if (!s) document.head.appendChild(style);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Focus Ring Width</Label>
                        <Slider min={0} max={6} step={1} value={[parseInt(((customTheme as any).ui?.borders?.focusRingWidth || '2px').toString(), 10)]}
                          onValueChange={([v]) => {
                            const updated = { ...customTheme } as any;
                            updated.ui = { ...(updated.ui || {}), borders: { ...(updated.ui?.borders || {}), focusRingWidth: `${v}px` } };
                            setCustomTheme(updated);
                            const s = document.getElementById('preview-theme-styles');
                            const style = s || document.createElement('style');
                            style.id = 'preview-theme-styles';
                            const prev = style.textContent || '';
                            style.textContent = `${prev}\n:root{ --ring-width: ${v}px; }`;
                            if (!s) document.head.appendChild(style);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Focus Ring Offset</Label>
                        <Slider min={0} max={6} step={1} value={[parseInt(((customTheme as any).ui?.borders?.focusRingOffset || '2px').toString(), 10)]}
                          onValueChange={([v]) => {
                            const updated = { ...customTheme } as any;
                            updated.ui = { ...(updated.ui || {}), borders: { ...(updated.ui?.borders || {}), focusRingOffset: `${v}px` } };
                            setCustomTheme(updated);
                            const s = document.getElementById('preview-theme-styles');
                            const style = s || document.createElement('style');
                            style.id = 'preview-theme-styles';
                            const prev = style.textContent || '';
                            style.textContent = `${prev}\n:root{ --ring-offset: ${v}px; }`;
                            if (!s) document.head.appendChild(style);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Overlay Effects (live) */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Overlay Effects (Preview)</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Button variant="outline" size="sm" onClick={() => (window as any).owEffects?.preset?.('minimal')}>Preset: Minimal</Button>
                      <Button variant="outline" size="sm" onClick={() => (window as any).owEffects?.preset?.('isac')}>Preset: ISAC</Button>
                      <Button variant="outline" size="sm" onClick={() => (window as any).owEffects?.preset?.('disavowed')}>Preset: Disavowed</Button>
                      <Button variant="outline" size="sm" onClick={() => (window as any).owEffects?.preset?.('darkzone')}>Preset: Darkzone</Button>
                      <Button variant="outline" size="sm" onClick={() => (window as any).owEffects?.preset?.('vivid')}>Preset: Vivid</Button>
                      <Button variant="outline" size="sm" onClick={() => (window as any).owEffects?.set({ scanlines: true })}>Scanlines On</Button>
                      <Button variant="outline" size="sm" onClick={() => (window as any).owEffects?.set({ scanlines: false })}>Scanlines Off</Button>
                      <Button variant="outline" size="sm" onClick={() => (window as any).owEffects?.set({ radarSweep: true })}>Radar</Button>
                      <Button variant="outline" size="sm" onClick={() => (window as any).owEffects?.set({ vignette: true })}>Vignette</Button>
                      <Button variant="outline" size="sm" onClick={() => (window as any).owEffects?.set({ glitch: true })}>Glitch</Button>
                      <Button variant="outline" size="sm" onClick={() => (window as any).owEffects?.reset?.()}>Reset</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Scanline Spacing</Label>
                        <Slider min={2} max={10} step={1} value={[3]} onValueChange={([v]) => (window as any).owEffects?.set?.({ scanlineSpacing: v })} />
                      </div>
                      <div>
                        <Label>Glitch Intensity</Label>
                        <Slider min={0} max={1} step={0.05} value={[0.3]} onValueChange={([v]) => (window as any).owEffects?.set?.({ glitchLevel: v })} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wallpaper" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Wallpaper & Background</CardTitle>
                  <CardDescription>
                    Configure background images, gradients, and overlays
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Wallpaper Type</Label>
                    <Select 
                      value={customTheme.wallpaper.type}
                      onValueChange={(type: any) => 
                        setCustomTheme({
                          ...customTheme,
                          wallpaper: { ...customTheme.wallpaper, type }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="color">Solid Color</SelectItem>
                        <SelectItem value="gradient">Gradient</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {customTheme.wallpaper.type === 'color' && customTheme.wallpaper.color && (
                    <ColorPicker
                      color={customTheme.wallpaper.color}
                      onChange={(color) => 
                        setCustomTheme({
                          ...customTheme,
                          wallpaper: { ...customTheme.wallpaper, color }
                        })
                      }
                      label="Background Color"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Typography</CardTitle>
                  <CardDescription>
                    Customize fonts, weights, and text styling
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Heading Font Family</Label>
                    <Select 
                      value={customTheme.typography.heading.fontFamily}
                      onValueChange={(fontFamily) => 
                        setCustomTheme({
                          ...customTheme,
                          typography: {
                            ...customTheme.typography,
                            heading: { ...customTheme.typography.heading, fontFamily }
                          }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Heading Weight: {customTheme.typography.heading.fontWeight}</Label>
                    <Slider
                      value={[customTheme.typography.heading.fontWeight]}
                      onValueChange={([fontWeight]) => 
                        setCustomTheme({
                          ...customTheme,
                          typography: {
                            ...customTheme.typography,
                            heading: { ...customTheme.typography.heading, fontWeight }
                          }
                        })
                      }
                      min={100}
                      max={900}
                      step={100}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="responsive" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Responsive Variants</CardTitle>
                  <CardDescription>
                    Configure theme variations for different screen sizes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant={selectedDevice === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDevice('mobile')}
                    >
                      <Smartphone className="h-4 w-4 mr-1" />
                      Mobile
                    </Button>
                    <Button
                      variant={selectedDevice === 'tablet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDevice('tablet')}
                    >
                      <Tablet className="h-4 w-4 mr-1" />
                      Tablet
                    </Button>
                    <Button
                      variant={selectedDevice === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDevice('desktop')}
                    >
                      <Monitor className="h-4 w-4 mr-1" />
                      Desktop
                    </Button>
                    <Button
                      variant={selectedDevice === 'tv' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDevice('tv')}
                    >
                      <Tv className="h-4 w-4 mr-1" />
                      TV
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Device-specific customizations will be available in a future update.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Performance & Accessibility
                  </CardTitle>
                  <CardDescription>
                    Configure performance settings and accessibility options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Performance Quality</Label>
                    <Select 
                      value={customTheme.performance.quality}
                      onValueChange={(quality: any) => 
                        setCustomTheme({
                          ...customTheme,
                          performance: { ...customTheme.performance, quality }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="ultra">Ultra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Animations</Label>
                      <Switch 
                        checked={customTheme.performance.enableAnimations}
                        onCheckedChange={(enableAnimations) => 
                          setCustomTheme({
                            ...customTheme,
                            performance: { ...customTheme.performance, enableAnimations }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Particles</Label>
                      <Switch 
                        checked={customTheme.performance.enableParticles}
                        onCheckedChange={(enableParticles) => 
                          setCustomTheme({
                            ...customTheme,
                            performance: { ...customTheme.performance, enableParticles }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Blur Effects</Label>
                      <Switch 
                        checked={customTheme.performance.enableBlur}
                        onCheckedChange={(enableBlur) => 
                          setCustomTheme({
                            ...customTheme,
                            performance: { ...customTheme.performance, enableBlur }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Shadows</Label>
                      <Switch 
                        checked={customTheme.performance.enableShadows}
                        onCheckedChange={(enableShadows) => 
                          setCustomTheme({
                            ...customTheme,
                            performance: { ...customTheme.performance, enableShadows }
                          })
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Accessibility className="h-4 w-4" />
                      Accessibility
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">High Contrast</Label>
                        <Switch 
                          checked={customTheme.accessibility.highContrast}
                          onCheckedChange={(highContrast) => 
                            setCustomTheme({
                              ...customTheme,
                              accessibility: { ...customTheme.accessibility, highContrast }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Reduced Motion</Label>
                        <Switch 
                          checked={customTheme.accessibility.reducedMotion}
                          onCheckedChange={(reducedMotion) => 
                            setCustomTheme({
                              ...customTheme,
                              accessibility: { ...customTheme.accessibility, reducedMotion }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Large Text</Label>
                        <Switch 
                          checked={customTheme.accessibility.largeText}
                          onCheckedChange={(largeText) => 
                            setCustomTheme({
                              ...customTheme,
                              accessibility: { ...customTheme.accessibility, largeText }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Focus Visible</Label>
                        <Switch 
                          checked={customTheme.accessibility.focusVisible}
                          onCheckedChange={(focusVisible) => 
                            setCustomTheme({
                              ...customTheme,
                              accessibility: { ...customTheme.accessibility, focusVisible }
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Import/Export */}
          <Card>
            <CardHeader>
              <CardTitle>Import / Export</CardTitle>
              <CardDescription>
                Save and share your custom themes
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button onClick={handleExportTheme} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Theme
              </Button>
              <div>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImportTheme}
                  className="hidden"
                  id="import-theme"
                />
                <Label htmlFor="import-theme">
                  <Button variant="outline" className="flex items-center gap-2" asChild>
                    <span>
                      <Upload className="h-4 w-4" />
                      Import Theme
                    </span>
                  </Button>
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Pane with Targets */}
        <div className="lg:col-span-1">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Live Preview</CardTitle>
              <CardDescription>Click targets to edit their tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-md border border-border p-4 bg-card">
                <div className="space-y-3">
                  <Button className="bg-primary text-primary-foreground">Primary Button</Button>
                  <Button variant="outline">Secondary Button</Button>
                  <div className="rounded-md p-4 border border-border bg-card">Card</div>
                  <div className="border rounded">
                    <div className="px-3 py-2 text-xs text-muted-foreground">Table</div>
                    <div className="px-3 py-2 border-t border-border/50 text-sm">Row A</div>
                    <div className="px-3 py-2 border-t border-border/50 text-sm">Row B</div>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Badge>Badge</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                  </div>
                </div>

                {isTargetsMode && (
                  <>
                    {/* Card */}
                    <button onClick={() => openInspector('colors.card')} className="absolute inset-x-4 top-[140px] h-14 rounded-md ring-2 ring-accent/60 bg-accent/10" />
                    {/* Primary Button */}
                    <button onClick={() => openInspector('colors.primary')} className="absolute left-4 top-4 h-10 w-40 rounded ring-2 ring-primary/60 bg-primary/10" />
                    {/* Input/Table (use muted/border) */}
                    <button onClick={() => openInspector('colors.muted')} className="absolute left-4 top-[200px] h-24 w-[calc(100%-2rem)] rounded ring-2 ring-foreground/40" />
                    {/* Header (use background) */}
                    <button onClick={() => openInspector('colors.background')} className="absolute inset-x-0 -top-3 h-8 ring-2 ring-secondary/50" />
                    {/* Sidebar/nav (use sidebar color) */}
                    <button onClick={() => openInspector('colors.sidebar')} className="absolute -left-3 inset-y-8 w-3 ring-2 ring-sidebar/50" />
                    {/* Badge (use accent) */}
                    <button onClick={() => openInspector('colors.accent')} className="absolute right-6 bottom-20 h-6 w-24 rounded ring-2 ring-accent/60" />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Drawer open={inspectorOpen} onOpenChange={setInspectorOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Inspector: {inspectorPath}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <ColorPicker
              color={customTheme.colors[(inspectorPath.split('.')[1]) as keyof typeof customTheme.colors] || customTheme.colors.card}
              onChange={(color) => updateColor(inspectorPath, color)}
              label={inspectorPath}
            />
            <div className="mt-4 flex items-center gap-2">
              <Button variant="outline" onClick={() => setInspectorOpen(false)}>Close</Button>
              <Button onClick={() => setIsPreviewMode(true)}>Preview Changes</Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default AdvancedThemeCustomizer;