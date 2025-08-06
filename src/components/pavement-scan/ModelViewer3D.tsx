import { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Box, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Cube, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Ruler,
  Eye,
  EyeOff,
  Download,
  Share,
  Settings,
  Layers,
  Grid3X3,
  Maximize2
} from "lucide-react";
import { DefectData, ScanData } from '@/pages/PavementScanPro';

interface ModelViewer3DProps {
  scanData: ScanData | null;
  defects: DefectData[];
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  color?: string;
  intensity?: number;
}

// Mock 3D point cloud generator
const generatePointCloud = (width: number = 100, height: number = 100): Point3D[] => {
  const points: Point3D[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      // Create realistic pavement surface with some variation
      const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const baseHeight = Math.sin(distanceFromCenter * 0.1) * 0.5;
      const noise = (Math.random() - 0.5) * 0.2;
      const z = baseHeight + noise;
      
      // Add some intensity variation for realism
      const intensity = Math.random() * 0.3 + 0.7;
      
      points.push({
        x: x - centerX,
        y: z,
        z: y - centerY,
        color: `hsl(${200 + Math.random() * 20}, 20%, ${intensity * 100}%)`,
        intensity
      });
    }
  }
  
  return points;
};

// Defect visualization component
const DefectMarkers: React.FC<{ defects: DefectData[]; showDefects: boolean }> = ({ defects, showDefects }) => {
  if (!showDefects) return null;
  
  return (
    <>
      {defects.map((defect) => {
        const color = {
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#22c55e'
        }[defect.severity];
        
        const size = {
          critical: 2,
          high: 1.5,
          medium: 1.2,
          low: 1
        }[defect.severity];
        
        // Convert defect location to 3D coordinates
        const x = (defect.location.x - 960) / 10; // Normalize from image coordinates
        const z = (defect.location.y - 540) / 10;
        const y = Math.random() * 2; // Random height for demo
        
        return (
          <group key={defect.id} position={[x, y, z]}>
            {/* Defect marker sphere */}
            <Sphere args={[size, 16, 16]} position={[0, 0, 0]}>
              <meshStandardMaterial color={color} transparent opacity={0.8} />
            </Sphere>
            
            {/* Defect label */}
            <Text
              position={[0, size + 1, 0]}
              fontSize={1}
              color={color}
              anchorX="center"
              anchorY="middle"
            >
              {defect.type.toUpperCase()}
            </Text>
            
            {/* Measurement indicators */}
            {defect.measurements.area && (
              <Box args={[
                Math.sqrt(defect.measurements.area) / 5,
                0.1,
                Math.sqrt(defect.measurements.area) / 5
              ]} position={[0, -0.1, 0]}>
                <meshStandardMaterial color={color} transparent opacity={0.3} />
              </Box>
            )}
          </group>
        );
      })}
    </>
  );
};

// Point cloud visualization component
const PointCloud: React.FC<{ 
  points: Point3D[]; 
  pointSize: number; 
  showPointCloud: boolean;
  colorMode: string;
}> = ({ points, pointSize, showPointCloud, colorMode }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  useEffect(() => {
    if (!meshRef.current || !showPointCloud) return;
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);
    
    points.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
      
      let color = new THREE.Color();
      switch (colorMode) {
        case 'height':
          color.setHSL(0.6 - (point.y + 1) * 0.3, 1, 0.5);
          break;
        case 'intensity':
          const intensity = point.intensity || 0.7;
          color.setRGB(intensity, intensity, intensity);
          break;
        default:
          color.set(point.color || '#888888');
      }
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    meshRef.current.geometry = geometry;
  }, [points, pointSize, showPointCloud, colorMode]);
  
  if (!showPointCloud) return null;
  
  return (
    <points ref={meshRef}>
      <bufferGeometry />
      <pointsMaterial size={pointSize} vertexColors sizeAttenuation={false} />
    </points>
  );
};

// Surface mesh component
const SurfaceMesh: React.FC<{ 
  points: Point3D[]; 
  showSurface: boolean;
  wireframe: boolean;
}> = ({ points, showSurface, wireframe }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (!meshRef.current || !showSurface) return;
    
    // Create a simplified mesh from points
    const geometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Apply height variations from point cloud
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      // Find nearest point in cloud
      const nearestPoint = points.reduce((nearest, point) => {
        const dist = Math.sqrt((point.x - x) ** 2 + (point.z - z) ** 2);
        return dist < nearest.distance ? { point, distance: dist } : nearest;
      }, { point: points[0], distance: Infinity });
      
      positions[i + 1] = nearestPoint.point.y;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    meshRef.current.geometry = geometry;
  }, [points, showSurface]);
  
  if (!showSurface) return null;
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100, 50, 50]} />
      <meshStandardMaterial 
        color="#666666" 
        wireframe={wireframe}
        transparent 
        opacity={wireframe ? 1 : 0.8}
      />
    </mesh>
  );
};

// Camera controller component
const CameraController: React.FC<{ resetTrigger: number }> = ({ resetTrigger }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(50, 30, 50);
    camera.lookAt(0, 0, 0);
  }, [resetTrigger, camera]);
  
  return null;
};

const ModelViewer3D: React.FC<ModelViewer3DProps> = ({ scanData, defects }) => {
  const [pointCloud] = useState<Point3D[]>(() => generatePointCloud());
  const [showPointCloud, setShowPointCloud] = useState(true);
  const [showSurface, setShowSurface] = useState(false);
  const [showDefects, setShowDefects] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [pointSize, setPointSize] = useState([3]);
  const [wireframe, setWireframe] = useState(false);
  const [colorMode, setColorMode] = useState('default');
  const [resetTrigger, setResetTrigger] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  
  const handleResetView = () => {
    setResetTrigger(prev => prev + 1);
  };
  
  const handleExport = (format: string) => {
    // Mock export functionality
    console.log(`Exporting 3D model as ${format}`);
  };
  
  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Cube className="h-5 w-5" />
                3D Model Viewer
              </CardTitle>
              <CardDescription>
                Interactive 3D visualization of scanned pavement with defect overlays
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleResetView}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFullscreen(!fullscreen)}
              >
                <Maximize2 className="h-4 w-4 mr-1" />
                {fullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="display" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="defects">Defects</TabsTrigger>
              <TabsTrigger value="measurements">Measurements</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
            
            <TabsContent value="display" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="point-cloud" 
                    checked={showPointCloud}
                    onCheckedChange={setShowPointCloud}
                  />
                  <Label htmlFor="point-cloud">Point Cloud</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="surface" 
                    checked={showSurface}
                    onCheckedChange={setShowSurface}
                  />
                  <Label htmlFor="surface">Surface Mesh</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="defects" 
                    checked={showDefects}
                    onCheckedChange={setShowDefects}
                  />
                  <Label htmlFor="defects">Defects</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="grid" 
                    checked={showGrid}
                    onCheckedChange={setShowGrid}
                  />
                  <Label htmlFor="grid">Grid</Label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="point-size">Point Size: {pointSize[0]}</Label>
                  <Slider
                    id="point-size"
                    min={1}
                    max={10}
                    step={0.5}
                    value={pointSize}
                    onValueChange={setPointSize}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="color-mode">Color Mode</Label>
                  <Select value={colorMode} onValueChange={setColorMode}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="height">Height</SelectItem>
                      <SelectItem value="intensity">Intensity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 mt-6">
                  <Switch 
                    id="wireframe" 
                    checked={wireframe}
                    onCheckedChange={setWireframe}
                  />
                  <Label htmlFor="wireframe">Wireframe</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="defects" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {defects.length > 0 ? (
                  defects.map((defect) => (
                    <div key={defect.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{defect.type}</p>
                        <p className="text-xs text-muted-foreground">{defect.severity}</p>
                      </div>
                      <Badge variant="outline">
                        {(defect.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full text-center py-4">
                    No defects detected in current scan
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="measurements" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{scanData?.area.toFixed(1) || '0.0'}</p>
                      <p className="text-sm text-muted-foreground">sq ft</p>
                      <p className="text-xs">Total Area</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{scanData?.perimeter.toFixed(1) || '0.0'}</p>
                      <p className="text-sm text-muted-foreground">ft</p>
                      <p className="text-xs">Perimeter</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{pointCloud.length.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">points</p>
                      <p className="text-xs">Point Cloud</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{defects.length}</p>
                      <p className="text-sm text-muted-foreground">defects</p>
                      <p className="text-xs">Detected</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="export" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" onClick={() => handleExport('obj')}>
                  <Download className="h-4 w-4 mr-1" />
                  OBJ Model
                </Button>
                <Button variant="outline" onClick={() => handleExport('ply')}>
                  <Download className="h-4 w-4 mr-1" />
                  PLY Point Cloud
                </Button>
                <Button variant="outline" onClick={() => handleExport('stl')}>
                  <Download className="h-4 w-4 mr-1" />
                  STL Mesh
                </Button>
                <Button variant="outline" onClick={() => handleExport('screenshot')}>
                  <Download className="h-4 w-4 mr-1" />
                  Screenshot
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* 3D Viewer */}
      <Card className={fullscreen ? 'fixed inset-0 z-50' : ''}>
        <CardContent className="p-0">
          <div className={`bg-gray-900 ${fullscreen ? 'h-screen' : 'h-96'} rounded-lg overflow-hidden`}>
            <Canvas>
              <Suspense fallback={null}>
                {/* Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />
                
                {/* Environment */}
                <Environment preset="city" />
                
                {/* Grid */}
                {showGrid && (
                  <Grid 
                    args={[100, 100]} 
                    position={[0, -1, 0]}
                    cellSize={5}
                    cellThickness={0.5}
                    cellColor="#444444"
                    sectionSize={25}
                    sectionThickness={1}
                    sectionColor="#666666"
                  />
                )}
                
                {/* Point Cloud */}
                <PointCloud 
                  points={pointCloud}
                  pointSize={pointSize[0]}
                  showPointCloud={showPointCloud}
                  colorMode={colorMode}
                />
                
                {/* Surface Mesh */}
                <SurfaceMesh 
                  points={pointCloud}
                  showSurface={showSurface}
                  wireframe={wireframe}
                />
                
                {/* Defect Markers */}
                <DefectMarkers defects={defects} showDefects={showDefects} />
                
                {/* Camera Controls */}
                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={10}
                  maxDistance={200}
                />
                
                <CameraController resetTrigger={resetTrigger} />
              </Suspense>
            </Canvas>
            
            {/* Overlay Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {fullscreen && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFullscreen(false)}
                  className="bg-black/50 border-white/50 text-white hover:bg-white/20"
                >
                  Exit Fullscreen
                </Button>
              )}
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Critical Defects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span>High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Medium Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Low Priority</span>
                </div>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white p-3 rounded-lg text-xs">
              <div className="space-y-1">
                <p>Left click + drag: Rotate</p>
                <p>Right click + drag: Pan</p>
                <p>Scroll: Zoom</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelViewer3D;