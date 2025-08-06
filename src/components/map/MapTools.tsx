import React, { useState, useRef, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pentagon, 
  Move, 
  Ruler, 
  Square, 
  Circle, 
  Play, 
  Trash2, 
  Download, 
  Upload,
  Save,
  X,
  Check
} from 'lucide-react';
import L from 'leaflet';

interface DrawingState {
  isActive: boolean;
  mode: 'polygon' | 'polyline' | 'rectangle' | 'circle' | 'marker';
  currentPoints: L.LatLng[];
  measurements: Measurement[];
}

interface Measurement {
  id: string;
  type: 'distance' | 'area' | 'perimeter';
  value: number;
  unit: string;
  coordinates: L.LatLng[];
  label?: string;
}

interface MapToolsProps {
  isDrawingMode: boolean;
  isMeasurementMode: boolean;
  onDrawingComplete: (feature: any) => void;
  onMeasurementComplete: (measurement: Measurement) => void;
  terminologyMode: 'military' | 'civilian' | 'both';
}

const MapTools: React.FC<MapToolsProps> = ({
  isDrawingMode,
  isMeasurementMode,
  onDrawingComplete,
  onMeasurementComplete,
  terminologyMode
}) => {
  const map = useMap();
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isActive: false,
    mode: 'polygon',
    currentPoints: [],
    measurements: []
  });
  const [activeDrawings, setActiveDrawings] = useState<L.Layer[]>([]);
  const [activeMeasurements, setActiveMeasurements] = useState<Measurement[]>([]);
  const [showToolPanel, setShowToolPanel] = useState(false);

  const drawingLayerRef = useRef<L.LayerGroup | null>(null);
  const measurementLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!drawingLayerRef.current) {
      drawingLayerRef.current = new L.LayerGroup().addTo(map);
    }
    if (!measurementLayerRef.current) {
      measurementLayerRef.current = new L.LayerGroup().addTo(map);
    }

    return () => {
      if (drawingLayerRef.current) {
        map.removeLayer(drawingLayerRef.current);
      }
      if (measurementLayerRef.current) {
        map.removeLayer(measurementLayerRef.current);
      }
    };
  }, [map]);

  const getTerminology = (military: string, civilian: string) => {
    switch (terminologyMode) {
      case 'military': return military;
      case 'civilian': return civilian;
      case 'both': return `${military} / ${civilian}`;
      default: return military;
    }
  };

  const calculateDistance = (points: L.LatLng[]): number => {
    if (points.length < 2) return 0;
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      totalDistance += points[i - 1].distanceTo(points[i]);
    }
    return totalDistance;
  };

  const calculateArea = (points: L.LatLng[]): number => {
    if (points.length < 3) return 0;
    // Using Shoelace formula for polygon area calculation
    let area = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].lat * points[j].lng;
      area -= points[j].lat * points[i].lng;
    }
    return Math.abs(area / 2) * 111320 * 111320; // Convert to square meters approximately
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(2)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatArea = (squareMeters: number): string => {
    if (squareMeters < 10000) {
      return `${squareMeters.toFixed(2)} m²`;
    }
    const acres = squareMeters * 0.000247105;
    return `${acres.toFixed(2)} acres`;
  };

  const startDrawing = (mode: DrawingState['mode']) => {
    setDrawingState({
      isActive: true,
      mode,
      currentPoints: [],
      measurements: []
    });
    
    map.getContainer().style.cursor = 'crosshair';
  };

  const finishDrawing = () => {
    const { mode, currentPoints } = drawingState;
    
    if (currentPoints.length > 0) {
      let layer: L.Layer | null = null;
      
      switch (mode) {
        case 'polygon':
          if (currentPoints.length >= 3) {
            layer = L.polygon(currentPoints, {
              color: '#06b6d4',
              fillColor: '#06b6d4',
              fillOpacity: 0.2,
              weight: 2
            });
          }
          break;
        case 'polyline':
          if (currentPoints.length >= 2) {
            layer = L.polyline(currentPoints, {
              color: '#f97316',
              weight: 3
            });
          }
          break;
        case 'rectangle':
          if (currentPoints.length >= 2) {
            const bounds = L.latLngBounds(currentPoints);
            layer = L.rectangle(bounds, {
              color: '#06b6d4',
              fillColor: '#06b6d4',
              fillOpacity: 0.2,
              weight: 2
            });
          }
          break;
      }
      
      if (layer && drawingLayerRef.current) {
        drawingLayerRef.current.addLayer(layer);
        setActiveDrawings(prev => [...prev, layer!]);
        
        // Calculate measurements
        const distance = calculateDistance(currentPoints);
        const area = mode === 'polygon' ? calculateArea(currentPoints) : 0;
        
        onDrawingComplete({
          type: mode,
          coordinates: currentPoints,
          distance,
          area,
          layer
        });
      }
    }
    
    setDrawingState({
      isActive: false,
      mode: 'polygon',
      currentPoints: [],
      measurements: []
    });
    
    map.getContainer().style.cursor = '';
  };

  const addMeasurement = (points: L.LatLng[], type: 'distance' | 'area') => {
    const value = type === 'distance' ? calculateDistance(points) : calculateArea(points);
    const unit = type === 'distance' ? 'm' : 'm²';
    
    const measurement: Measurement = {
      id: Date.now().toString(),
      type,
      value,
      unit,
      coordinates: points
    };
    
    // Add measurement display to map
    if (measurementLayerRef.current && points.length > 0) {
      const center = type === 'area' 
        ? L.polygon(points).getBounds().getCenter()
        : points[Math.floor(points.length / 2)];
      
      const label = type === 'distance' ? formatDistance(value) : formatArea(value);
      
      const marker = L.marker(center, {
        icon: L.divIcon({
          className: 'measurement-label',
          html: `<div class="bg-slate-900 text-cyan-400 px-2 py-1 rounded text-xs font-mono border border-cyan-500">${label}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        })
      });
      
      measurementLayerRef.current.addLayer(marker);
    }
    
    setActiveMeasurements(prev => [...prev, measurement]);
    onMeasurementComplete(measurement);
  };

  const clearAll = () => {
    if (drawingLayerRef.current) {
      drawingLayerRef.current.clearLayers();
    }
    if (measurementLayerRef.current) {
      measurementLayerRef.current.clearLayers();
    }
    setActiveDrawings([]);
    setActiveMeasurements([]);
  };

  const exportData = () => {
    const data = {
      drawings: activeDrawings.map((layer, index) => ({
        id: index,
        type: 'feature',
        // Add more layer data here
      })),
      measurements: activeMeasurements
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overwatch-${getTerminology('mission', 'project')}-data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Map click handler
  useEffect(() => {
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isDrawingMode && drawingState.isActive) {
        const newPoints = [...drawingState.currentPoints, e.latlng];
        setDrawingState(prev => ({
          ...prev,
          currentPoints: newPoints
        }));
      }
      
      if (isMeasurementMode) {
        // Add point for measurement
        const newPoints = [...drawingState.currentPoints, e.latlng];
        setDrawingState(prev => ({
          ...prev,
          currentPoints: newPoints
        }));
        
        if (newPoints.length >= 2) {
          addMeasurement(newPoints, 'distance');
          setDrawingState(prev => ({
            ...prev,
            currentPoints: []
          }));
        }
      }
    };

    const handleMapDoubleClick = () => {
      if (isDrawingMode && drawingState.isActive) {
        finishDrawing();
      }
    };

    map.on('click', handleMapClick);
    map.on('dblclick', handleMapDoubleClick);
    
    return () => {
      map.off('click', handleMapClick);
      map.off('dblclick', handleMapDoubleClick);
    };
  }, [map, isDrawingMode, isMeasurementMode, drawingState]);

  if (!isDrawingMode && !isMeasurementMode && !showToolPanel) {
    return (
      <Button
        onClick={() => setShowToolPanel(true)}
        className="absolute top-20 left-4 z-[1000] bg-slate-900/95 border-cyan-500/30 text-cyan-400"
        size="sm"
      >
        <Move className="w-4 h-4 mr-2" />
        Tools
      </Button>
    );
  }

  return (
    <Card className="absolute top-20 left-4 w-80 z-[1000] bg-slate-900/95 border-cyan-500/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
            <Move className="w-4 h-4" />
            {getTerminology('Tactical Tools', 'Map Tools')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowToolPanel(false)}
            className="text-slate-400 hover:text-cyan-400 p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="drawing" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="drawing" className="text-xs">
              {getTerminology('Draw AOI', 'Drawing')}
            </TabsTrigger>
            <TabsTrigger value="measurement" className="text-xs">
              Measurement
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="drawing" className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={drawingState.mode === 'polygon' ? "default" : "outline"}
                size="sm"
                onClick={() => startDrawing('polygon')}
                className="text-xs"
              >
                <Pentagon className="w-3 h-3 mr-1" />
                Polygon
              </Button>
              <Button
                variant={drawingState.mode === 'polyline' ? "default" : "outline"}
                size="sm"
                onClick={() => startDrawing('polyline')}
                className="text-xs"
              >
                <Move className="w-3 h-3 mr-1" />
                Line
              </Button>
              <Button
                variant={drawingState.mode === 'rectangle' ? "default" : "outline"}
                size="sm"
                onClick={() => startDrawing('rectangle')}
                className="text-xs"
              >
                <Square className="w-3 h-3 mr-1" />
                Rectangle
              </Button>
              <Button
                variant={drawingState.mode === 'circle' ? "default" : "outline"}
                size="sm"
                onClick={() => startDrawing('circle')}
                className="text-xs"
              >
                <Circle className="w-3 h-3 mr-1" />
                Circle
              </Button>
            </div>
            
            {drawingState.isActive && (
              <div className="bg-slate-800 p-2 rounded border border-cyan-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-cyan-400">
                    Drawing {drawingState.mode}...
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {drawingState.currentPoints.length} points
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={finishDrawing}
                    className="text-xs bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Finish
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDrawingState(prev => ({ ...prev, isActive: false, currentPoints: [] }))}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="measurement" className="space-y-3">
            <div className="text-xs text-slate-300">
              Click two points to measure distance, or create a polygon for area measurement.
            </div>
            
            {activeMeasurements.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-cyan-400">Active Measurements:</Label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {activeMeasurements.map((measurement) => (
                    <div key={measurement.id} className="bg-slate-800 p-2 rounded text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">
                          {measurement.type === 'distance' ? 'Distance' : 'Area'}
                        </span>
                        <span className="text-cyan-400 font-mono">
                          {measurement.type === 'distance' 
                            ? formatDistance(measurement.value)
                            : formatArea(measurement.value)
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Separator className="my-3 bg-slate-600" />
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={clearAll}
            className="text-xs flex-1"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={exportData}
            className="text-xs flex-1"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
        
        <div className="mt-3 text-xs text-slate-400">
          • Double-click to finish drawing
          • Single-click for measurement points
          • {getTerminology('Right-click for context menu', 'Use tools above for actions')}
        </div>
      </CardContent>
    </Card>
  );
};

export default MapTools;