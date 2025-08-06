import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sidebar } from '@/components/Sidebar';
import { Radar, Map, Layers, Navigation, Crosshair, Ruler, Camera, Users, Truck, Cloud, Thermometer, Eye, Settings, Target, RadioIcon as Radio, Activity, AlertTriangle, Zap } from 'lucide-react';
import MapTools from '@/components/map/MapTools';
import FleetTracking from '@/components/map/FleetTracking';
import DraggableWidgets from '@/components/map/DraggableWidgets';
import WeatherOverlay from '@/components/map/WeatherOverlay';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapService {
  id: string;
  name: string;
  url: string;
  attribution: string;
  icon: React.ReactNode;
}

const mapServices: MapService[] = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    icon: <Map className="w-4 h-4" />
  },
  {
    id: 'satellite',
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    icon: <Eye className="w-4 h-4" />
  },
  {
    id: 'terrain',
    name: 'Terrain',
    url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
    attribution: '© Stamen Design',
    icon: <Layers className="w-4 h-4" />
  },
  {
    id: 'topo',
    name: 'Topographic',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    icon: <Target className="w-4 h-4" />
  }
];

interface WidgetConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
}

const OverWatch: React.FC = () => {
  const [selectedMapService, setSelectedMapService] = useState('osm');
  const [terminologyMode, setTerminologyMode] = useState<'military' | 'civilian' | 'both'>('military');
  const [activeOverlays, setActiveOverlays] = useState<string[]>(['fleet', 'weather']);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isMeasurementMode, setIsMeasurementMode] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // NYC default
  const [mapZoom, setMapZoom] = useState(13);
  const [drawings, setDrawings] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [showWidgets, setShowWidgets] = useState(true);
  const [weatherRecommendations, setWeatherRecommendations] = useState<string[]>([]);

  const currentService = mapServices.find(service => service.id === selectedMapService) || mapServices[0];

  const getTerminology = (military: string, civilian: string) => {
    switch (terminologyMode) {
      case 'military': return military;
      case 'civilian': return civilian;
      case 'both': return `${military} / ${civilian}`;
      default: return military;
    }
  };

  const toggleOverlay = (overlayId: string) => {
    setActiveOverlays(prev => 
      prev.includes(overlayId) 
        ? prev.filter(id => id !== overlayId)
        : [...prev, overlayId]
    );
  };

  const MapControls = () => {
    const map = useMap();
    
    useMapEvents({
      click: (e) => {
        if (isDrawingMode) {
          console.log('Drawing mode click:', e.latlng);
        }
        if (isMeasurementMode) {
          console.log('Measurement mode click:', e.latlng);
        }
      },
      moveend: () => {
        setMapCenter([map.getCenter().lat, map.getCenter().lng]);
        setMapZoom(map.getZoom());
      }
    });

    return null;
  };

  const handleDrawingComplete = (feature: any) => {
    setDrawings(prev => [...prev, feature]);
    console.log('Drawing completed:', feature);
  };

  const handleMeasurementComplete = (measurement: any) => {
    setMeasurements(prev => [...prev, measurement]);
    console.log('Measurement completed:', measurement);
  };

  const FleetTrackingWidget = () => (
    <Card className="h-full bg-slate-900/95 border-cyan-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
          <Users className="w-4 h-4" />
          {getTerminology('Asset Tracking', 'Fleet Tracking')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">Active {getTerminology('Units', 'Vehicles')}</span>
          <Badge variant="outline" className="text-cyan-400 border-cyan-400">12</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">{getTerminology('Personnel', 'Employees')}</span>
          <Badge variant="outline" className="text-orange-400 border-orange-400">24</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">Alerts</span>
          <Badge variant="destructive">2</Badge>
        </div>
      </CardContent>
    </Card>
  );

  const WeatherWidget = () => (
    <Card className="h-full bg-slate-900/95 border-cyan-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
          <Cloud className="w-4 h-4" />
          {getTerminology('Environmental Intel', 'Weather Conditions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">Temperature</span>
          <span className="text-orange-400 font-mono">72°F</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">Humidity</span>
          <span className="text-cyan-400 font-mono">65%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">Wind</span>
          <span className="text-slate-300 font-mono">8 mph NE</span>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer className="w-3 h-3 text-orange-400" />
          <span className="text-xs text-green-400">Optimal for Operations</span>
        </div>
      </CardContent>
    </Card>
  );

  const PavementScanWidget = () => (
    <Card className="h-full bg-slate-900/95 border-cyan-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />
          {getTerminology('Surface Intel', 'Pavement Analysis')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">Scanned Areas</span>
          <Badge variant="outline" className="text-cyan-400 border-cyan-400">8</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">Defects Found</span>
          <Badge variant="outline" className="text-orange-400 border-orange-400">23</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">Critical Issues</span>
          <Badge variant="destructive">3</Badge>
        </div>
      </CardContent>
    </Card>
  );

  const MissionStatusWidget = () => (
    <Card className="h-full bg-slate-900/95 border-cyan-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
          <Target className="w-4 h-4" />
          {getTerminology('Mission Status', 'Project Status')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">Active {getTerminology('Operations', 'Projects')}</span>
          <Badge variant="outline" className="text-green-400 border-green-400">5</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">Completion Rate</span>
          <span className="text-cyan-400 font-mono">78%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">ETA</span>
          <span className="text-orange-400 font-mono">14:30</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative">
        {/* Header Controls */}
        <div className="bg-slate-900/95 border-b border-cyan-500/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Radar className="w-6 h-6 text-cyan-400" />
                <h1 className="text-xl font-bold text-cyan-400">
                  {getTerminology('OverWatch Command Center', 'OverWatch Control Hub')}
                </h1>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {getTerminology('OPERATIONAL', 'ACTIVE')}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              {/* Terminology Toggle */}
              <div className="flex items-center gap-2">
                <Label htmlFor="terminology" className="text-xs text-slate-300">
                  Terminology:
                </Label>
                <Select value={terminologyMode} onValueChange={(value: any) => setTerminologyMode(value)}>
                  <SelectTrigger className="w-32 h-8 text-xs bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="military">Military</SelectItem>
                    <SelectItem value="civilian">Civilian</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Map Service Selection */}
              <div className="flex items-center gap-2">
                <Label htmlFor="map-service" className="text-xs text-slate-300">
                  Map Service:
                </Label>
                <Select value={selectedMapService} onValueChange={setSelectedMapService}>
                  <SelectTrigger className="w-40 h-8 text-xs bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {mapServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex items-center gap-2">
                          {service.icon}
                          {service.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tool Bar */}
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant={isDrawingMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsDrawingMode(!isDrawingMode)}
              className="bg-slate-800 border-slate-600 text-cyan-400"
            >
              <Crosshair className="w-4 h-4 mr-2" />
              {getTerminology('Draw AOI', 'Draw Area')}
            </Button>
            <Button
              variant={isMeasurementMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsMeasurementMode(!isMeasurementMode)}
              className="bg-slate-800 border-slate-600 text-cyan-400"
            >
              <Ruler className="w-4 h-4 mr-2" />
              Measure
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-600 text-cyan-400"
            >
              <Camera className="w-4 h-4 mr-2" />
              Snap Picture
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-600 text-cyan-400"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Navigate
            </Button>

            <Separator orientation="vertical" className="h-8 bg-slate-600" />

            {/* Overlay Toggles */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">Overlays:</span>
              {[
                { id: 'fleet', label: getTerminology('Assets', 'Fleet'), icon: Truck },
                { id: 'weather', label: 'Weather', icon: Cloud },
                { id: 'pavement', label: getTerminology('Surface Intel', 'Pavement'), icon: Activity },
                { id: 'alerts', label: 'Alerts', icon: AlertTriangle }
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={activeOverlays.includes(id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleOverlay(id)}
                  className="bg-slate-800 border-slate-600 text-xs"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {label}
                </Button>
              ))}
              
              <Separator orientation="vertical" className="h-8 bg-slate-600" />
              
              <Button
                variant={showWidgets ? "default" : "outline"}
                size="sm"
                onClick={() => setShowWidgets(!showWidgets)}
                className="bg-slate-800 border-slate-600 text-xs"
              >
                <Settings className="w-3 h-3 mr-1" />
                Widgets
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative">
          {/* Map Container */}
          <div className="absolute inset-0">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              className="h-full w-full"
              zoomControl={false}
            >
              <TileLayer
                url={currentService.url}
                attribution={currentService.attribution}
              />
              <MapControls />
              <FleetTracking 
                terminologyMode={terminologyMode}
                isVisible={activeOverlays.includes('fleet')}
              />
              <WeatherOverlay 
                terminologyMode={terminologyMode}
                isVisible={activeOverlays.includes('weather')}
                onRecommendationChange={setWeatherRecommendations}
              />
              <MapTools
                isDrawingMode={isDrawingMode}
                isMeasurementMode={isMeasurementMode}
                onDrawingComplete={handleDrawingComplete}
                onMeasurementComplete={handleMeasurementComplete}
                terminologyMode={terminologyMode}
              />
            </MapContainer>
          </div>

          {/* Draggable Widgets System */}
          <DraggableWidgets 
            terminologyMode={terminologyMode}
            isVisible={showWidgets}
            onLayoutChange={(layout) => console.log('Layout changed:', layout)}
          />

          {/* Bottom Status Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 border-t border-cyan-500/30 p-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-4">
                <span>Center: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}</span>
                <span>Zoom: {mapZoom}</span>
                <span>Service: {currentService.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Real-time Data Active</span>
                </div>
                {weatherRecommendations.length > 0 && (
                  <div className="text-xs text-orange-400 max-w-xs truncate">
                    {weatherRecommendations[0]}
                  </div>
                )}
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverWatch;