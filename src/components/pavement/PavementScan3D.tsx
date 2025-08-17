// @ts-nocheck
import React, { useState, useEffect, useRef, Suspense } from 'react';
// Removed React Three.js dependencies - using real 3D implementation
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Real3DPavementViewer from './Real3DPavementViewer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Scan, 
  Eye, 
  EyeOff, 
  Download, 
  Upload, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Layers,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Maximize,
  Minimize,
  Save,
  FileImage,
  Ruler,
  Target
} from 'lucide-react';
import { useTerminology } from '@/contexts/TerminologyContext';

// Placeholder types to replace Three.js
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface DefectData {
  id: string;
  type: 'crack' | 'pothole' | 'alligator' | 'rutting' | 'bleeding' | 'raveling' | 'patching';
  severity: 'low' | 'medium' | 'high' | 'critical';
  position: Vector3;
  area: number; // square feet
  length?: number; // for linear defects
  depth?: number;
  description: string;
  timestamp: Date;
  repairCost: number;
  priority: number;
}

interface ScanData {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  scanDate: Date;
  area: number;
  defects: DefectData[];
  meshData: {
    vertices: Float32Array;
    indices: Uint32Array;
    normals: Float32Array;
    colors: Float32Array;
  };
  surfaceConditionIndex: number; // 0-100
  averageRoughness: number;
  estimatedLifespan: number; // years
}

interface PavementScan3DProps {
  isVisible: boolean;
  scanData?: ScanData;
  onDefectSelect?: (defect: DefectData) => void;
  onAnalysisComplete?: (analysis: any) => void;
  terminologyMode?: 'military' | 'civilian' | 'both';
}

// Analysis moved to Real3DPavementViewer component

const PavementScan3D: React.FC<PavementScan3DProps> = ({
  isVisible,
  scanData,
  onDefectSelect,
  onAnalysisComplete,
  terminologyMode
}) => {
  const [is3DMode, setIs3DMode] = useState(false);
  const [showDefects, setShowDefects] = useState(true);
  const [selectedDefectTypes, setSelectedDefectTypes] = useState<string[]>([
    'crack', 'pothole', 'alligator', 'rutting', 'bleeding', 'raveling', 'patching'
  ]);
  const [meshOpacity, setMeshOpacity] = useState(80);
  const [showGrid, setShowGrid] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [viewMode, setViewMode] = useState<'top' | 'perspective' | 'side'>('perspective');
  const { terminologyMode: globalMode } = useTerminology();
  const mode = terminologyMode || globalMode;

  const getTerminology = (military: string, civilian: string) => {
    switch (mode) {
      case 'military': return military;
      case 'civilian': return civilian;
      case 'both': return `${military} / ${civilian}`;
      default: return military;
    }
  };

  // Generate mock scan data if none provided
  const mockScanData: ScanData = scanData || {
    id: 'scan-001',
    name: 'Highway 101 Section A',
    location: { lat: 40.7128, lng: -74.0060 },
    scanDate: new Date(),
    area: 5280, // square feet
    surfaceConditionIndex: 68,
    averageRoughness: 2.4,
    estimatedLifespan: 8.5,
    defects: [
      {
        id: 'd1',
        type: 'crack',
        severity: 'medium',
        position: { x: 2, y: 0.1, z: 1 },
        area: 15.5,
        length: 24,
        description: 'Longitudinal crack extending 24 feet',
        timestamp: new Date(),
        repairCost: 850,
        priority: 3
      },
      {
        id: 'd2',
        type: 'pothole',
        severity: 'critical',
        position: { x: -1, y: 0.2, z: -2 },
        area: 8.2,
        depth: 3.5,
        description: 'Deep pothole requiring immediate attention',
        timestamp: new Date(),
        repairCost: 1200,
        priority: 1
      },
      {
        id: 'd3',
        type: 'alligator',
        severity: 'high',
        position: { x: 0, y: 0.05, z: 3 },
        area: 45.8,
        description: 'Alligator cracking pattern indicating structural failure',
        timestamp: new Date(),
        repairCost: 3400,
        priority: 2
      }
    ],
    meshData: {
      vertices: new Float32Array([
        -5, 0, -5,  5, 0, -5,  5, 0, 5,  -5, 0, 5,
        -3, 0.1, -3,  3, 0.1, -3,  3, 0.1, 3,  -3, 0.1, 3
      ]),
      indices: new Uint32Array([
        0, 1, 2,  0, 2, 3,  4, 5, 6,  4, 6, 7
      ]),
      normals: new Float32Array([
        0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
        0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0
      ]),
      colors: new Float32Array([
        0.3, 0.3, 0.3,  0.4, 0.4, 0.4,  0.3, 0.3, 0.3,  0.4, 0.4, 0.4,
        0.2, 0.2, 0.2,  0.3, 0.3, 0.3,  0.2, 0.2, 0.2,  0.3, 0.3, 0.3
      ])
    }
  };

  const toggleDefectType = (type: string) => {
    setSelectedDefectTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const exportAnalysis = () => {
    const analysis = {
      scanId: mockScanData.id,
      totalDefects: mockScanData.defects.length,
      criticalDefects: mockScanData.defects.filter(d => d.severity === 'critical').length,
      totalRepairCost: mockScanData.defects.reduce((sum, d) => sum + d.repairCost, 0),
      surfaceConditionIndex: mockScanData.surfaceConditionIndex,
      estimatedLifespan: mockScanData.estimatedLifespan,
      recommendations: generateRecommendations(mockScanData)
    };

    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pavement-analysis-${mockScanData.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateRecommendations = (data: ScanData): string[] => {
    const recommendations: string[] = [];
    
    if (data.surfaceConditionIndex < 50) {
      recommendations.push('Major rehabilitation required - consider full reconstruction');
    } else if (data.surfaceConditionIndex < 70) {
      recommendations.push('Preventive maintenance recommended within 6 months');
    } else {
      recommendations.push('Surface in good condition - monitor annually');
    }

    const criticalDefects = data.defects.filter(d => d.severity === 'critical').length;
    if (criticalDefects > 0) {
      recommendations.push(`${criticalDefects} critical defects require immediate attention`);
    }

    return recommendations;
  };

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-[700]">
      {/* 3D Viewer */}
      {is3DMode && (
        <div className="absolute inset-0 bg-slate-950">
          <Real3DPavementViewer
            scanData={mockScanData}
            showDefects={showDefects}
            selectedDefectTypes={selectedDefectTypes}
            opacity={meshOpacity}
            showGrid={showGrid}
            showAnalysis={showAnalysis}
          />
          
          {/* 3D Mode Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIs3DMode(false)}
            className="absolute top-4 right-4 z-10 bg-slate-900/80 text-cyan-400"
          >
            <Minimize className="w-4 h-4 mr-2" />
            Exit 3D View
          </Button>
        </div>
      )}

      {/* PavementScan Control Panel */}
      <Card className="absolute top-4 left-[820px] w-80 z-[600] bg-slate-900/95 border-cyan-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
              <Scan className="w-4 h-4" />
              {getTerminology('Surface Intel Analysis', 'PavementScan Pro')}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIs3DMode(!is3DMode)}
              className="text-cyan-400 p-1"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="defects" className="text-xs">Defects</TabsTrigger>
              <TabsTrigger value="analysis" className="text-xs">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-300">Scan Area</span>
                  <span className="text-cyan-400 font-mono block">
                    {mockScanData.area.toLocaleString()} sq ft
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-300">Condition Index</span>
                  <span className="text-orange-400 font-mono block">
                    {mockScanData.surfaceConditionIndex}/100
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-300">Roughness (IRI)</span>
                  <span className="text-slate-300 font-mono block">
                    {mockScanData.averageRoughness}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-300">Est. Lifespan</span>
                  <span className="text-green-400 font-mono block">
                    {mockScanData.estimatedLifespan} years
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-slate-300">Show 3D Defects</Label>
                  <Switch checked={showDefects} onCheckedChange={setShowDefects} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-slate-300">Show Grid</Label>
                  <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-slate-300">Show Analysis</Label>
                  <Switch checked={showAnalysis} onCheckedChange={setShowAnalysis} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Surface Opacity</span>
                  <span className="text-cyan-400 font-mono">{meshOpacity}%</span>
                </div>
                <Slider
                  value={[meshOpacity]}
                  onValueChange={(value) => setMeshOpacity(value[0])}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>
            </TabsContent>

            <TabsContent value="defects" className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-cyan-400">Defect Types:</Label>
                <div className="grid grid-cols-2 gap-1">
                  {['crack', 'pothole', 'alligator', 'rutting', 'bleeding', 'raveling', 'patching'].map(type => (
                    <Button
                      key={type}
                      variant={selectedDefectTypes.includes(type) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDefectType(type)}
                      className="text-xs h-7 justify-start"
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        type === 'crack' ? 'bg-yellow-400' :
                        type === 'pothole' ? 'bg-red-400' :
                        type === 'alligator' ? 'bg-purple-400' :
                        type === 'rutting' ? 'bg-green-400' :
                        type === 'bleeding' ? 'bg-pink-400' :
                        type === 'raveling' ? 'bg-blue-400' :
                        'bg-gray-400'
                      }`} />
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-cyan-400">Detected Defects:</Label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {mockScanData.defects.map(defect => (
                    <div key={defect.id} className="bg-slate-800 p-2 rounded text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 capitalize">{defect.type}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            defect.severity === 'critical' ? 'text-red-400 border-red-400' :
                            defect.severity === 'high' ? 'text-orange-400 border-orange-400' :
                            defect.severity === 'medium' ? 'text-yellow-400 border-yellow-400' :
                            'text-blue-400 border-blue-400'
                          }`}
                        >
                          {defect.severity}
                        </Badge>
                      </div>
                      <div className="text-slate-400">{defect.area.toFixed(1)} sq ft</div>
                      <div className="text-orange-400 font-mono">${defect.repairCost.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-3">
              <div className="bg-slate-800 p-3 rounded">
                <div className="text-xs text-cyan-400 mb-2">
                  {getTerminology('Tactical Assessment', 'Analysis Summary')}
                </div>
                <div className="space-y-2 text-xs">
                  {generateRecommendations(mockScanData).map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-orange-400 rounded-full mt-1.5" />
                      <span className="text-slate-300">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center bg-slate-800 p-2 rounded">
                  <div className="text-lg font-mono text-red-400">
                    {mockScanData.defects.filter(d => d.severity === 'critical').length}
                  </div>
                  <div className="text-slate-300">Critical</div>
                </div>
                <div className="text-center bg-slate-800 p-2 rounded">
                  <div className="text-lg font-mono text-orange-400">
                    ${mockScanData.defects.reduce((sum, d) => sum + d.repairCost, 0).toLocaleString()}
                  </div>
                  <div className="text-slate-300">Repair Cost</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={exportAnalysis}
                  className="flex-1 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAnalysisComplete?.(mockScanData)}
                  className="flex-1 text-xs"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PavementScan3D;