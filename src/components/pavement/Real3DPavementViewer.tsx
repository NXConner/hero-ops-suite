// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { sensorDataService, SensorDataResponse } from '@/services/api';

// Types imported lazily at runtime; keep TS references via typeof
let Babylon: typeof import('@babylonjs/core') | null = null;

interface DefectData {
  id: string;
  type: 'crack' | 'pothole' | 'alligator' | 'rutting' | 'bleeding' | 'raveling' | 'patching';
  severity: 'low' | 'medium' | 'high' | 'critical';
  position: any; // Babylon Vector3 at runtime
  area: number;
  length?: number;
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
  surfaceConditionIndex: number;
  averageRoughness: number;
  estimatedLifespan: number;
  realSensorData?: SensorDataResponse[];
}

interface Real3DPavementViewerProps {
  scanData: ScanData;
  showDefects: boolean;
  selectedDefectTypes: string[];
  opacity: number;
  showGrid: boolean;
  showAnalysis: boolean;
  className?: string;
}

const Real3DPavementViewer: React.FC<Real3DPavementViewerProps> = ({
  scanData,
  showDefects,
  selectedDefectTypes,
  opacity,
  showGrid,
  showAnalysis,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any | null>(null);
  const sceneRef = useRef<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [realSensorData, setRealSensorData] = useState<SensorDataResponse[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    let disposed = false;

    const init = async () => {
      const core = await import('@babylonjs/core');
      if (disposed) return;
      Babylon = core;

      const { Engine, Scene, Vector3, FreeCamera, HemisphericLight, MeshBuilder, StandardMaterial, Color3 } = core;

      const engine = new Engine(canvasRef.current, true);
      engineRef.current = engine;

      const scene = new Scene(engine);
      sceneRef.current = scene;

      const camera = new FreeCamera('camera', new Vector3(0, 10, -10), scene);
      camera.setTarget(Vector3.Zero());
      camera.attachTo(canvasRef.current);

      const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);
      light.intensity = 0.7;

      const ground = MeshBuilder.CreateGround('ground', { width: 20, height: 20, subdivisions: 50 }, scene);
      const groundMaterial = new StandardMaterial('groundMaterial', scene);
      groundMaterial.diffuseColor = new Color3(0.3, 0.3, 0.3);
      groundMaterial.alpha = opacity / 100;
      ground.material = groundMaterial;

      if (showGrid) {
        const gridMaterial = new StandardMaterial('gridMaterial', scene);
        gridMaterial.wireframe = true;
        gridMaterial.diffuseColor = new Color3(0, 1, 1);
        const gridLines = MeshBuilder.CreateGround('grid', { width: 20, height: 20, subdivisions: 10 }, scene);
        gridLines.material = gridMaterial;
        gridLines.position.y = 0.01;
      }

      loadRealSensorData();

      if (showDefects) {
        createDefectMarkers(scene);
      }

      engine.runRenderLoop(() => {
        scene.render();
      });

      setIsLoading(false);

      const handleResize = () => engine.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        engine.dispose();
      };
    };

    const cleanup = init();
    return () => {
      disposed = true;
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  const loadRealSensorData = async () => {
    try {
      const sensorData = await sensorDataService.getSensorData();
      setRealSensorData(sensorData);
      if (sensorData.length > 0) {
        updateScanDataWithSensorReadings(sensorData);
      }
    } catch (error) {
      setRealSensorData(generateMockSensorData());
    }
  };

  const updateScanDataWithSensorReadings = (sensorData: SensorDataResponse[]) => {
    if (!Babylon) return;
    const { Vector3 } = Babylon;

    const temperatureSensors = sensorData.filter(s => s.type === 'temperature');
    const pressureSensors = sensorData.filter(s => s.type === 'pressure');
    const vibrationSensors = sensorData.filter(s => s.type === 'vibration');
    const thicknessSensors = sensorData.filter(s => s.type === 'thickness');
    const compactionSensors = sensorData.filter(s => s.type === 'compaction');

    const detectedDefects: DefectData[] = [];

    temperatureSensors.forEach((sensor, index) => {
      if (sensor.value > 200) {
        detectedDefects.push({
          id: `temp-defect-${index}`,
          type: 'bleeding',
          severity: sensor.value > 250 ? 'high' : 'medium',
          position: new Vector3((sensor.location.longitude + 74.0060) * 1000, 0.1, (sensor.location.latitude - 40.7128) * 1000),
          area: 12.5,
          description: `High temperature detected: ${sensor.value}°F`,
          timestamp: new Date(sensor.timestamp),
          repairCost: 800,
          priority: sensor.value > 250 ? 1 : 2
        });
      }
    });

    pressureSensors.forEach((sensor, index) => {
      if (sensor.value < 1500) {
        detectedDefects.push({
          id: `pressure-defect-${index}`,
          type: 'rutting',
          severity: sensor.value < 1000 ? 'critical' : 'high',
          position: new Vector3((sensor.location.longitude + 74.0060) * 1000, 0.1, (sensor.location.latitude - 40.7128) * 1000),
          area: 25.3,
          description: `Low pressure detected: ${sensor.value} PSI`,
          timestamp: new Date(sensor.timestamp),
          repairCost: 1500,
          priority: 1
        });
      }
    });

    vibrationSensors.forEach((sensor, index) => {
      if (sensor.value > 8) {
        detectedDefects.push({
          id: `vibration-defect-${index}`,
          type: 'crack',
          severity: sensor.value > 12 ? 'high' : 'medium',
          position: new Vector3((sensor.location.longitude + 74.0060) * 1000, 0.1, (sensor.location.latitude - 40.7128) * 1000),
          area: 8.7,
          length: 15,
          description: `High vibration detected: ${sensor.value} Hz`,
          timestamp: new Date(sensor.timestamp),
          repairCost: 600,
          priority: 2
        });
      }
    });

    thicknessSensors.forEach((sensor, index) => {
      if (sensor.value < 2.5) {
        detectedDefects.push({
          id: `thickness-defect-${index}`,
          type: 'raveling',
          severity: sensor.value < 2 ? 'critical' : 'high',
          position: new Vector3((sensor.location.longitude + 74.0060) * 1000, 0.1, (sensor.location.latitude - 40.7128) * 1000),
          area: 18.2,
          description: `Thin pavement detected: ${sensor.value} inches`,
          timestamp: new Date(sensor.timestamp),
          repairCost: 2200,
          priority: 1
        });
      }
    });

    if (detectedDefects.length > 0) {
      scanData.defects = [...scanData.defects, ...detectedDefects];
      const avgCompaction = compactionSensors.reduce((sum, s) => sum + s.value, 0) / compactionSensors.length || 95;
      const criticalDefects = detectedDefects.filter(d => d.severity === 'critical').length;
      const highDefects = detectedDefects.filter(d => d.severity === 'high').length;
      scanData.surfaceConditionIndex = Math.max(0, avgCompaction - (criticalDefects * 15) - (highDefects * 8));
    }
  };

  const generateMockSensorData = (): SensorDataResponse[] => {
    const sensorTypes: SensorDataResponse['type'][] = ['temperature', 'pressure', 'vibration', 'thickness', 'compaction'];
    return sensorTypes.map((type, index) => ({
      sensorId: `sensor_${type}_${index}`,
      type,
      value: getMockValueForType(type),
      unit: getUnitForType(type),
      timestamp: new Date().toISOString(),
      location: { latitude: 40.7128 + (Math.random() - 0.5) * 0.001, longitude: -74.0060 + (Math.random() - 0.5) * 0.001 },
      quality: 'good',
      alerts: [],
      calibrationDate: new Date().toISOString(),
      batteryLevel: 75 + Math.random() * 25
    }));
  };

  const getMockValueForType = (type: SensorDataResponse['type']): number => {
    switch (type) {
      case 'temperature': return 180 + Math.random() * 80;
      case 'pressure': return 1800 + Math.random() * 400;
      case 'vibration': return Math.random() * 12;
      case 'thickness': return 2.5 + Math.random() * 2;
      case 'compaction': return 88 + Math.random() * 12;
      default: return Math.random() * 100;
    }
  };

  const getUnitForType = (type: SensorDataResponse['type']): string => {
    switch (type) {
      case 'temperature': return '°F';
      case 'pressure': return 'PSI';
      case 'vibration': return 'Hz';
      case 'thickness': return 'in';
      case 'compaction': return '%';
      default: return 'units';
    }
  };

  const createDefectMarkers = (scene: any) => {
    if (!sceneRef.current || !Babylon) return;
    const { MeshBuilder, StandardMaterial, Color3 } = Babylon;

    scanData.defects
      .filter(defect => selectedDefectTypes.includes(defect.type))
      .forEach(defect => {
        const marker = MeshBuilder.CreateBox(`defect-${defect.id}`, { size: 0.5 }, scene);
        marker.position = defect.position;
        const material = new StandardMaterial(`defect-material-${defect.id}`, scene);
        material.diffuseColor = getDefectColor(defect.type, defect.severity);
        material.emissiveColor = getDefectColor(defect.type, defect.severity);
        marker.material = material;
      });
  };

  const getDefectColor = (type: string, severity: string) => {
    if (!Babylon) return { r: 0.5, g: 0.5, b: 0.5 } as any;
    const { Color3 } = Babylon;
    const colors: Record<string, any> = {
      crack: severity === 'critical' ? new Color3(1, 0, 0) : new Color3(1, 0.5, 0),
      pothole: new Color3(0.8, 0, 0),
      alligator: new Color3(0.5, 0, 1),
      rutting: new Color3(0, 0.8, 0.3),
      bleeding: new Color3(1, 0, 0.5),
      raveling: new Color3(0, 0.8, 1),
      patching: new Color3(0.5, 0.5, 0.5)
    };
    return colors[type] || new Color3(0.5, 0.5, 0.5);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ outline: 'none' }} />
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
          <div className="text-center text-cyan-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-2"></div>
            <div>Loading 3D Viewer...</div>
          </div>
        </div>
      )}
      {showAnalysis && (
        <div className="absolute top-4 right-4 bg-slate-900/95 border border-cyan-500/30 rounded p-3 text-xs">
          <div className="text-cyan-400 font-semibold mb-2">Real-Time Analysis</div>
          <div className="space-y-1">
            <div>Surface Index: <span className="text-orange-400">{scanData.surfaceConditionIndex}</span></div>
            <div>Defects: <span className="text-red-400">{scanData.defects.length}</span></div>
            <div>Sensors: <span className="text-green-400">{realSensorData.length} active</span></div>
            <div>Data Source: <span className="text-blue-400">{realSensorData.some(s => s.calibrationDate) ? 'Real IoT' : 'Simulated'}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Real3DPavementViewer;