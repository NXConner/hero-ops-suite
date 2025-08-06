import React, { useState, useEffect, useRef } from 'react';
import { TileLayer, ImageOverlay, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Wind, 
  Thermometer, 
  Eye, 
  Droplets, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
  conditions: 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'foggy';
  precipitation: number;
  timestamp: Date;
}

interface WeatherAlert {
  id: string;
  type: 'severe-weather' | 'temperature' | 'wind' | 'precipitation';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  message: string;
  recommendation: string;
  validUntil: Date;
}

interface RadarFrame {
  timestamp: Date;
  imageUrl: string;
  precipitationLevel: number;
}

interface WeatherOverlayProps {
  isVisible: boolean;
  terminologyMode: 'military' | 'civilian' | 'both';
  onRecommendationChange?: (recommendations: string[]) => void;
}

const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ 
  isVisible, 
  terminologyMode, 
  onRecommendationChange 
}) => {
  const map = useMap();
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [currentRadarFrame, setCurrentRadarFrame] = useState(0);
  const [isRadarPlaying, setIsRadarPlaying] = useState(false);
  const [radarOpacity, setRadarOpacity] = useState(70);
  const [showTemperatureOverlay, setShowTemperatureOverlay] = useState(false);
  const [showWindOverlay, setShowWindOverlay] = useState(false);
  const [forecastHours, setForecastHours] = useState(12);

  const radarIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getTerminology = (military: string, civilian: string) => {
    switch (terminologyMode) {
      case 'military': return military;
      case 'civilian': return civilian;
      case 'both': return `${military} / ${civilian}`;
      default: return military;
    }
  };

  // Mock weather data
  useEffect(() => {
    const generateMockWeatherData = (): WeatherData => ({
      temperature: 72,
      humidity: 65,
      windSpeed: 8,
      windDirection: 45,
      pressure: 1013.2,
      uvIndex: 6,
      visibility: 10,
      conditions: 'cloudy',
      precipitation: 0.1,
      timestamp: new Date()
    });

    const generateMockAlerts = (): WeatherAlert[] => [
      {
        id: 'w1',
        type: 'precipitation',
        severity: 'medium',
        message: 'Light rain expected in next 2 hours',
        recommendation: 'Delay sealcoating operations until conditions improve',
        validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000)
      },
      {
        id: 'w2',
        type: 'wind',
        severity: 'low',
        message: 'Wind speed increasing to 12-15 mph',
        recommendation: 'Monitor dust control measures during paving operations',
        validUntil: new Date(Date.now() + 4 * 60 * 60 * 1000)
      }
    ];

    const generateMockRadarFrames = (): RadarFrame[] => {
      const frames: RadarFrame[] = [];
      const baseTime = new Date();
      
      for (let i = 0; i < 8; i++) {
        frames.push({
          timestamp: new Date(baseTime.getTime() - (7 - i) * 15 * 60 * 1000),
          imageUrl: `https://example.com/radar/frame_${i}.png`,
          precipitationLevel: Math.random() * 0.5
        });
      }
      
      return frames;
    };

    setCurrentWeather(generateMockWeatherData());
    setWeatherAlerts(generateMockAlerts());
    setRadarFrames(generateMockRadarFrames());

    // Update weather data every 5 minutes
    const weatherInterval = setInterval(() => {
      setCurrentWeather(generateMockWeatherData());
    }, 5 * 60 * 1000);

    return () => clearInterval(weatherInterval);
  }, []);

  // Radar animation
  useEffect(() => {
    if (isRadarPlaying && radarFrames.length > 0) {
      radarIntervalRef.current = setInterval(() => {
        setCurrentRadarFrame(prev => (prev + 1) % radarFrames.length);
      }, 500);
    } else if (radarIntervalRef.current) {
      clearInterval(radarIntervalRef.current);
    }

    return () => {
      if (radarIntervalRef.current) {
        clearInterval(radarIntervalRef.current);
      }
    };
  }, [isRadarPlaying, radarFrames.length]);

  // Generate operational recommendations
  useEffect(() => {
    if (!currentWeather) return;

    const recommendations: string[] = [];

    if (currentWeather.precipitation > 0.05) {
      recommendations.push('⚠️ Avoid sealcoating operations due to precipitation');
    }

    if (currentWeather.temperature < 50) {
      recommendations.push('❄️ Cold weather may affect asphalt workability');
    }

    if (currentWeather.temperature > 95) {
      recommendations.push('🔥 High temperature - monitor crew hydration');
    }

    if (currentWeather.windSpeed > 15) {
      recommendations.push('💨 High winds - implement dust control measures');
    }

    if (currentWeather.uvIndex > 7) {
      recommendations.push('☀️ High UV - ensure crew sun protection');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Weather conditions optimal for operations');
    }

    onRecommendationChange?.(recommendations);
  }, [currentWeather, onRecommendationChange]);

  const getConditionIcon = (condition: WeatherData['conditions']) => {
    switch (condition) {
      case 'clear': return <Sun className="w-5 h-5 text-yellow-400" />;
      case 'cloudy': return <Cloud className="w-5 h-5 text-slate-400" />;
      case 'rainy': return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'stormy': return <Zap className="w-5 h-5 text-purple-400" />;
      case 'foggy': return <Cloud className="w-5 h-5 text-gray-400" />;
      default: return <Cloud className="w-5 h-5 text-slate-400" />;
    }
  };

  const getAlertSeverityColor = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'low': return 'text-blue-400 border-blue-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'high': return 'text-orange-400 border-orange-400';
      case 'extreme': return 'text-red-400 border-red-400';
      default: return 'text-slate-400 border-slate-400';
    }
  };

  const toggleRadarPlayback = () => {
    setIsRadarPlaying(!isRadarPlaying);
  };

  const resetRadar = () => {
    setIsRadarPlaying(false);
    setCurrentRadarFrame(0);
  };

  if (!isVisible || !currentWeather) return null;

  return (
    <>
      {/* Weather Control Panel */}
      <Card className="absolute top-4 left-[420px] w-80 z-[600] bg-slate-900/95 border-cyan-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            {getTerminology('Environmental Intel', 'Weather Center')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="current" className="text-xs">Current</TabsTrigger>
              <TabsTrigger value="radar" className="text-xs">Radar</TabsTrigger>
              <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getConditionIcon(currentWeather.conditions)}
                  <span className="text-lg font-mono text-cyan-400">
                    {currentWeather.temperature}°F
                  </span>
                </div>
                <Badge variant="outline" className="text-green-400 border-green-400 capitalize">
                  {currentWeather.conditions}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span className="text-slate-300">Humidity</span>
                  </div>
                  <span className="text-cyan-400 font-mono">{currentWeather.humidity}%</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-slate-300" />
                    <span className="text-slate-300">Wind</span>
                  </div>
                  <span className="text-slate-300 font-mono">
                    {currentWeather.windSpeed} mph {currentWeather.windDirection}°
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-300" />
                    <span className="text-slate-300">Visibility</span>
                  </div>
                  <span className="text-slate-300 font-mono">{currentWeather.visibility} mi</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Sun className="w-3 h-3 text-yellow-400" />
                    <span className="text-slate-300">UV Index</span>
                  </div>
                  <span className="text-yellow-400 font-mono">{currentWeather.uvIndex}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-slate-300">Temperature Overlay</Label>
                  <Switch
                    checked={showTemperatureOverlay}
                    onCheckedChange={setShowTemperatureOverlay}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-slate-300">Wind Overlay</Label>
                  <Switch
                    checked={showWindOverlay}
                    onCheckedChange={setShowWindOverlay}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="radar" className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-cyan-400">
                  Rain Radar ({forecastHours}h forecast)
                </Label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleRadarPlayback}
                    className="p-1"
                  >
                    {isRadarPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetRadar}
                    className="p-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Opacity</span>
                  <span className="text-cyan-400 font-mono">{radarOpacity}%</span>
                </div>
                <Slider
                  value={[radarOpacity]}
                  onValueChange={(value) => setRadarOpacity(value[0])}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Forecast Hours</span>
                  <span className="text-cyan-400 font-mono">{forecastHours}h</span>
                </div>
                <Slider
                  value={[forecastHours]}
                  onValueChange={(value) => setForecastHours(value[0])}
                  min={1}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>

              {radarFrames.length > 0 && (
                <div className="bg-slate-800 p-2 rounded text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300">Frame {currentRadarFrame + 1} of {radarFrames.length}</span>
                    <span className="text-cyan-400 font-mono">
                      {radarFrames[currentRadarFrame]?.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-slate-400">
                    Precipitation: {(radarFrames[currentRadarFrame]?.precipitationLevel * 100 || 0).toFixed(1)}%
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="space-y-3">
              {weatherAlerts.length > 0 ? (
                <div className="space-y-2">
                  {weatherAlerts.map((alert) => (
                    <div key={alert.id} className="bg-slate-800 border border-slate-600 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className={`text-xs ${getAlertSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {alert.type.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mb-1">{alert.message}</div>
                      <div className="text-xs text-cyan-400">{alert.recommendation}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Valid until: {alert.validUntil.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 text-xs py-4">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  No weather alerts
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Radar Overlay on Map */}
      {radarFrames.length > 0 && radarFrames[currentRadarFrame] && (
        <div style={{ opacity: radarOpacity / 100 }}>
          {/* Simulated radar overlay - in production this would use real radar tiles */}
          <div className="absolute inset-0 pointer-events-none" style={{ 
            background: `radial-gradient(circle at 40.7128% 25.994%, rgba(59, 130, 246, 0.${radarFrames[currentRadarFrame].precipitationLevel * 100}) 0%, transparent 70%)`,
            zIndex: 100
          }} />
        </div>
      )}
    </>
  );
};

export default WeatherOverlay;