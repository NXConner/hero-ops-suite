import React, { useState, useRef, useEffect } from 'react';
// Removed react-leaflet dependency - using placeholder
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Sidebar from '@/components/Sidebar';
import { Radar, Map, Layers, Navigation, Crosshair, Ruler, Camera, Users, Truck, Cloud, Thermometer, Eye, Settings, Target, RadioIcon as Radio, Activity, AlertTriangle, Zap } from 'lucide-react';
import html2canvas from 'html2canvas';
import MapTools from '@/components/map/MapTools';
import FleetTracking from '@/components/map/FleetTracking';
import DraggableWidgets from '@/components/map/DraggableWidgets';
import WeatherOverlay from '@/components/map/WeatherOverlay';
import PavementScan3D from '@/components/pavement/PavementScan3D';
import VoiceCommandInterface from '@/components/ai/VoiceCommandInterface';
// Removed leaflet imports

// Placeholder Map Component (replaces MapContainer)
const MapPlaceholder: React.FC<{ 
  center: [number, number]; 
  zoom: number; 
  children?: React.ReactNode; 
  className?: string;
}> = ({ center, zoom, children, className }) => {
  return (
    <div className={`w-full h-full bg-slate-800 relative ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <Map className="w-16 h-16 mx-auto mb-4" />
          <div className="text-xl mb-2">OverWatch Map Interface</div>
          <div className="text-sm">Leaflet dependencies removed for compatibility</div>
          <div className="text-xs mt-4 space-y-1">
            <div>Center: {center[0].toFixed(4)}, {center[1].toFixed(4)}</div>
            <div>Zoom Level: {zoom}</div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

// Placeholder TileLayer Component
const TileLayerPlaceholder: React.FC<{ url: string; attribution?: string }> = ({ url, attribution }) => {
  return <div className="hidden" />;
};

// Removed leaflet icon configuration

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
  },
  {
    id: 'google-satellite',
    name: 'Google Satellite',
    url: process.env.REACT_APP_GOOGLE_MAPS_API_KEY 
      ? `https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© Google',
    icon: <Eye className="w-4 h-4" />
  },
  {
    id: 'google-roads',
    name: 'Google Roads',
    url: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
      ? `https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© Google',
    icon: <Navigation className="w-4 h-4" />
  },
  {
    id: 'mapbox-streets',
    name: 'Mapbox Streets',
    url: process.env.REACT_APP_MAPBOX_API_KEY
      ? `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_API_KEY}`
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© Mapbox',
    icon: <Map className="w-4 h-4" />
  },
  {
    id: 'mapbox-satellite',
    name: 'Mapbox Satellite',
    url: process.env.REACT_APP_MAPBOX_API_KEY
      ? `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_API_KEY}`
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Mapbox',
    icon: <Eye className="w-4 h-4" />
  },
  {
    id: 'carto-dark',
    name: 'Dark Theme',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    attribution: '© CARTO',
    icon: <Target className="w-4 h-4" />
  },
  {
    id: 'qgis-local',
    name: 'QGIS Local Server',
    url: process.env.REACT_APP_QGIS_SERVER_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© Local QGIS Server',
    icon: <Layers className="w-4 h-4" />
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
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);

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
    // const map = useMap(); // Removed useMap
    
    // useMapEvents({ // Removed useMapEvents
    //   click: (e) => {
    //     if (isDrawingMode) {
    //       console.log('Drawing mode click:', e.latlng);
    //     }
    //     if (isMeasurementMode) {
    //       console.log('Measurement mode click:', e.latlng);
    //     }
    //   },
    //   moveend: () => {
    //     setMapCenter([map.getCenter().lat, map.getCenter().lng]);
    //     setMapZoom(map.getZoom());
    //   }
    // });

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

  const handleVoiceCommand = (command: any) => {
    console.log('Voice command received:', command);
    
    // Execute the command based on its action
    switch (command.action) {
      case 'show_weather_overlay':
        if (!activeOverlays.includes('weather')) {
          setActiveOverlays(prev => [...prev, 'weather']);
        }
        break;
      case 'hide_weather_overlay':
        setActiveOverlays(prev => prev.filter(id => id !== 'weather'));
        break;
      case 'show_fleet_tracking':
        if (!activeOverlays.includes('fleet')) {
          setActiveOverlays(prev => [...prev, 'fleet']);
        }
        break;
      case 'hide_fleet_tracking':
        setActiveOverlays(prev => prev.filter(id => id !== 'fleet'));
        break;
      case 'show_defects':
        if (!activeOverlays.includes('pavement')) {
          setActiveOverlays(prev => [...prev, 'pavement']);
        }
        break;
      case 'hide_defects':
        setActiveOverlays(prev => prev.filter(id => id !== 'pavement'));
        break;
      case 'switch_map_service':
        if (command.parameters?.service) {
          setSelectedMapService(command.parameters.service);
        }
        break;
      case 'start_measuring':
        setIsMeasurementMode(true);
        break;
      case 'stop_measuring':
        setIsMeasurementMode(false);
        break;
      case 'take_screenshot':
        // Implement screenshot functionality
        html2canvas(document.body).then(canvas => {
          const link = document.createElement('a');
          link.download = `overwatch-screenshot-${Date.now()}.png`;
          link.href = canvas.toDataURL();
          link.click();
        });
        break;
      default:
        console.log('Unhandled voice command:', command.action);
    }
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
              
              <Button
                variant={showVoiceInterface ? "default" : "outline"}
                size="sm"
                onClick={() => setShowVoiceInterface(!showVoiceInterface)}
                className="bg-slate-800 border-slate-600 text-xs"
              >
                <Radio className="w-3 h-3 mr-1" />
                Voice
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative">
          {/* Map Container */}
          <div className="absolute inset-0">
            <MapPlaceholder
              center={mapCenter}
              zoom={mapZoom}
              className="h-full w-full"
            >
              <TileLayerPlaceholder
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
              <PavementScan3D
                terminologyMode={terminologyMode}
                isVisible={activeOverlays.includes('pavement')}
                onDefectSelect={(defect) => console.log('Defect selected:', defect)}
                onAnalysisComplete={(analysis) => console.log('Analysis complete:', analysis)}
              />
              <MapTools
                isDrawingMode={isDrawingMode}
                isMeasurementMode={isMeasurementMode}
                onDrawingComplete={handleDrawingComplete}
                onMeasurementComplete={handleMeasurementComplete}
                terminologyMode={terminologyMode}
              />
            </MapPlaceholder>
          </div>

          {/* Draggable Widgets System */}
          <DraggableWidgets 
            terminologyMode={terminologyMode}
            isVisible={showWidgets}
            onLayoutChange={(layout) => console.log('Layout changed:', layout)}
          />

          {/* Voice Command Interface */}
          <VoiceCommandInterface
            isVisible={showVoiceInterface}
            terminologyMode={terminologyMode}
            onCommand={handleVoiceCommand}
            onClose={() => setShowVoiceInterface(false)}
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