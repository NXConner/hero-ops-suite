// @ts-nocheck
import React, { useState, useMemo } from 'react';
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
  generateColorScheme 
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
  Accessibility
} from 'lucide-react';

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
  const { currentTheme, updateTheme, createTheme, exportTheme, importTheme } = useAdvancedTheme();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [customTheme, setCustomTheme] = useState<Theme>(currentTheme);
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'tablet' | 'desktop' | 'tv'>('desktop');

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
                variant={isPreviewMode ? "default" : "outline"}
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {isPreviewMode ? "Exit Preview" : "Preview Mode"}
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

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Blur Effects</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Background Blur</Label>
                        <Switch 
                          checked={customTheme.effects.blur.background.enabled}
                          onCheckedChange={(enabled) => 
                            setCustomTheme({
                              ...customTheme,
                              effects: {
                                ...customTheme.effects,
                                blur: {
                                  ...customTheme.effects.blur,
                                  background: { ...customTheme.effects.blur.background, enabled }
                                }
                              }
                            })
                          }
                        />
                      </div>
                      {customTheme.effects.blur.background.enabled && (
                        <div>
                          <Label className="text-xs">Radius: {customTheme.effects.blur.background.radius}px</Label>
                          <Slider
                            value={[customTheme.effects.blur.background.radius]}
                            onValueChange={([radius]) => 
                              setCustomTheme({
                                ...customTheme,
                                effects: {
                                  ...customTheme.effects,
                                  blur: {
                                    ...customTheme.effects.blur,
                                    background: { ...customTheme.effects.blur.background, radius }
                                  }
                                }
                              })
                            }
                            min={0}
                            max={20}
                            step={1}
                          />
                        </div>
                      )}
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

        {/* Live Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See your changes in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theme info */}
              <div>
                <div className="text-lg font-semibold">{customTheme.name}</div>
                <div className="text-sm text-muted-foreground">{customTheme.description}</div>
                <div className="flex gap-1 mt-2">
                  {customTheme.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Color swatches */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Color Palette</Label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(customTheme.colors).slice(0, 8).map(([name, color]) => (
                    <div key={name} className="text-center">
                      <div 
                        className="w-full h-12 rounded border border-border mb-1"
                        style={{ backgroundColor: hslToString(color) }}
                      />
                      <div className="text-xs text-muted-foreground capitalize">
                        {name.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview components */}
              <div className="space-y-2">
                <Button className="w-full">Primary Button</Button>
                <Button variant="secondary" className="w-full">Secondary Button</Button>
                <Card className="p-4">
                  <div className="text-sm font-medium">Preview Card</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    This shows how cards will look with your theme.
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Particle Preview */}
          {customTheme.effects.particles.enabled && (
            <Card className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="text-sm">Particle Preview</CardTitle>
              </CardHeader>
              <CardContent className="relative h-32">
                <ParticleSystem
                  effect={customTheme.effects.particles}
                  containerWidth={300}
                  containerHeight={128}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdvancedThemeCustomizer;