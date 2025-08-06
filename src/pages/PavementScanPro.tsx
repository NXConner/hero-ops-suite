import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Camera, 
  Scan, 
  Cube, 
  Download, 
  Share, 
  AlertTriangle, 
  Activity,
  Ruler,
  MapPin,
  Zap,
  Eye,
  Settings,
  Play,
  Pause,
  Square,
  RotateCcw,
  Grid
} from "lucide-react";
import CameraInterface from "@/components/pavement-scan/CameraInterface";
import DefectDetection from "@/components/pavement-scan/DefectDetection";
import ModelViewer3D from "@/components/pavement-scan/ModelViewer3D";
import ReportGeneration from "@/components/pavement-scan/ReportGeneration";
import SystemIntegration from "@/components/pavement-scan/SystemIntegration";
import MarketplaceIntegration from "@/components/pavement-scan/MarketplaceIntegration";

export interface DefectData {
  id: string;
  type: 'crack' | 'pothole' | 'alligator' | 'water_pooling' | 'gatoring' | 'broken_area' | 'weak_area' | 'subsurface';
  location: { x: number; y: number; z?: number };
  measurements: {
    length?: number;
    width?: number;
    depth?: number;
    area?: number;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timestamp: Date;
  coordinates?: { lat: number; lng: number };
}

export interface ScanData {
  id: string;
  timestamp: Date;
  area: number; // square feet
  perimeter: number; // feet
  defects: DefectData[];
  model3D?: any; // 3D model data
  images: string[]; // base64 encoded images
  location?: { lat: number; lng: number };
}

const PavementScanPro = () => {
  const [scanningMode, setScanningMode] = useState<'perimeter' | 'interior' | 'complete'>('perimeter');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentScan, setCurrentScan] = useState<ScanData | null>(null);
  const [detectedDefects, setDetectedDefects] = useState<DefectData[]>([]);
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [scanCoverage, setScanCoverage] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScanning = useCallback(() => {
    setIsScanning(true);
    setScanProgress(0);
    setScanCoverage(0);
    setDetectedDefects([]);
    setCapturedFrames([]);
    
    // Initialize new scan
    const newScan: ScanData = {
      id: `scan_${Date.now()}`,
      timestamp: new Date(),
      area: 0,
      perimeter: 0,
      defects: [],
      images: [],
    };
    setCurrentScan(newScan);
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    setScanProgress(100);
  }, []);

  const resetScan = useCallback(() => {
    setIsScanning(false);
    setScanProgress(0);
    setScanCoverage(0);
    setCurrentScan(null);
    setDetectedDefects([]);
    setCapturedFrames([]);
    setScanningMode('perimeter');
  }, []);

  // Simulate scanning progress
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress >= 100) {
            setIsScanning(false);
            return 100;
          }
          return newProgress;
        });
        setScanCoverage(prev => Math.min(prev + 0.5, 100));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const getScanningModeDescription = () => {
    switch (scanningMode) {
      case 'perimeter':
        return "Walk around the perimeter of the area to establish boundaries";
      case 'interior':
        return "Scan the interior surface for detailed defect analysis";
      case 'complete':
        return "Comprehensive scan combining perimeter and interior data";
      default:
        return "";
    }
  };

  const getDefectStats = () => {
    const stats = {
      total: detectedDefects.length,
      critical: detectedDefects.filter(d => d.severity === 'critical').length,
      high: detectedDefects.filter(d => d.severity === 'high').length,
      medium: detectedDefects.filter(d => d.severity === 'medium').length,
      low: detectedDefects.filter(d => d.severity === 'low').length,
    };
    return stats;
  };

  const defectStats = getDefectStats();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Scan className="h-8 w-8 text-primary" />
              PavementScan Pro
            </h1>
            <p className="text-muted-foreground mt-1">
              Advanced AI-Powered Pavement Intelligence & 3D Modeling
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50">
              <Activity className="h-3 w-3 mr-1" />
              Module Active
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>

        {/* Real-time Status Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                  <span className="font-medium">
                    {isScanning ? 'Scanning Active' : 'Ready to Scan'}
                  </span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="text-sm text-muted-foreground">
                  Mode: <span className="font-medium capitalize">{scanningMode.replace('_', ' ')}</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="text-sm text-muted-foreground">
                  Coverage: <span className="font-medium">{scanCoverage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={scanProgress} className="w-32" />
                <span className="text-sm font-medium">{scanProgress.toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Camera & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Camera Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Live Camera Feed
                </CardTitle>
                <CardDescription>
                  {getScanningModeDescription()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CameraInterface
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  isScanning={isScanning}
                  scanningMode={scanningMode}
                  onFrameCapture={(frame) => setCapturedFrames(prev => [...prev, frame])}
                  onDefectDetected={(defect) => setDetectedDefects(prev => [...prev, defect])}
                />
              </CardContent>
            </Card>

            {/* Scanning Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Scan Controls</CardTitle>
                <CardDescription>
                  Control the scanning process and mode selection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={scanningMode === 'perimeter' ? 'default' : 'outline'}
                    onClick={() => setScanningMode('perimeter')}
                    disabled={isScanning}
                  >
                    <Grid className="h-4 w-4 mr-1" />
                    Perimeter
                  </Button>
                  <Button
                    variant={scanningMode === 'interior' ? 'default' : 'outline'}
                    onClick={() => setScanningMode('interior')}
                    disabled={isScanning}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Interior
                  </Button>
                  <Button
                    variant={scanningMode === 'complete' ? 'default' : 'outline'}
                    onClick={() => setScanningMode('complete')}
                    disabled={isScanning}
                  >
                    <Cube className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex gap-2">
                  {!isScanning ? (
                    <Button onClick={startScanning} className="flex-1">
                      <Play className="h-4 w-4 mr-1" />
                      Start Scanning
                    </Button>
                  ) : (
                    <Button onClick={stopScanning} variant="destructive" className="flex-1">
                      <Pause className="h-4 w-4 mr-1" />
                      Stop Scanning
                    </Button>
                  )}
                  <Button onClick={resetScan} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>

                {isScanning && (
                  <Alert>
                    <Activity className="h-4 w-4" />
                    <AlertDescription>
                      Keep the device steady and maintain consistent scanning speed for optimal results.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Statistics & Results */}
          <div className="space-y-6">
            {/* Defect Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Defect Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <Badge variant="outline">{defectStats.total}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical:</span>
                    <Badge variant="destructive">{defectStats.critical}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>High:</span>
                    <Badge variant="secondary" className="bg-orange-100">{defectStats.high}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Medium:</span>
                    <Badge variant="secondary" className="bg-yellow-100">{defectStats.medium}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Low:</span>
                    <Badge variant="secondary" className="bg-green-100">{defectStats.low}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Measurements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Measurements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Area:</span>
                  <span className="font-medium">{currentScan?.area.toFixed(1) || '0.0'} sq ft</span>
                </div>
                <div className="flex justify-between">
                  <span>Perimeter:</span>
                  <span className="font-medium">{currentScan?.perimeter.toFixed(1) || '0.0'} ft</span>
                </div>
                <div className="flex justify-between">
                  <span>Frames Captured:</span>
                  <span className="font-medium">{capturedFrames.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Cube className="h-4 w-4 mr-1" />
                  View 3D Model
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-1" />
                  Generate Report
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Share className="h-4 w-4 mr-1" />
                  Share Results
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <MapPin className="h-4 w-4 mr-1" />
                  Send to OverWatch
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Results Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="defects" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="defects">Defect Analysis</TabsTrigger>
                <TabsTrigger value="model3d">3D Model</TabsTrigger>
                <TabsTrigger value="report">Report</TabsTrigger>
                <TabsTrigger value="integration">System Integration</TabsTrigger>
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>
              
              <TabsContent value="defects" className="mt-6">
                <DefectDetection 
                  defects={detectedDefects}
                  onDefectUpdate={(updatedDefects) => setDetectedDefects(updatedDefects)}
                />
              </TabsContent>
              
              <TabsContent value="model3d" className="mt-6">
                <ModelViewer3D 
                  scanData={currentScan}
                  defects={detectedDefects}
                />
              </TabsContent>
              
              <TabsContent value="report" className="mt-6">
                <ReportGeneration 
                  scanData={currentScan}
                  defects={detectedDefects}
                />
              </TabsContent>
              
              <TabsContent value="integration" className="mt-6">
                <SystemIntegration 
                  scanData={currentScan}
                  defects={detectedDefects}
                />
              </TabsContent>
              
              <TabsContent value="marketplace" className="mt-6">
                <MarketplaceIntegration />
              </TabsContent>
              
              <TabsContent value="export" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Export Options</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      PDF Report
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      DXF Model
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      GeoJSON
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Raw Data
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PavementScanPro;