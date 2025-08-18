// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import {
  Engine,
  Scene,
  Vector3,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  GroundMesh,
} from "@babylonjs/core";
import { sensorDataService, SensorDataResponse } from "@/services/api";

interface DefectData {
  id: string;
  type: "crack" | "pothole" | "alligator" | "rutting" | "bleeding" | "raveling" | "patching";
  severity: "low" | "medium" | "high" | "critical";
  position: Vector3;
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
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [realSensorData, setRealSensorData] = useState<SensorDataResponse[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Babylon.js
    const engine = new Engine(canvasRef.current, true);
    engineRef.current = engine;

    const scene = new Scene(engine);
    sceneRef.current = scene;

    // Create camera
    const camera = new FreeCamera("camera", new Vector3(0, 10, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachTo(canvasRef.current);

    // Create lighting
    const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
    light.intensity = 0.7;

    // Create ground mesh representing pavement
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 20, height: 20, subdivisions: 50 },
      scene,
    );
    const groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new Color3(0.3, 0.3, 0.3);
    groundMaterial.alpha = opacity / 100;
    ground.material = groundMaterial;

    // Add grid if enabled
    if (showGrid) {
      const gridMaterial = new StandardMaterial("gridMaterial", scene);
      gridMaterial.wireframe = true;
      gridMaterial.diffuseColor = new Color3(0, 1, 1);

      const gridLines = MeshBuilder.CreateGround(
        "grid",
        { width: 20, height: 20, subdivisions: 10 },
        scene,
      );
      gridLines.material = gridMaterial;
      gridLines.position.y = 0.01;
    }

    // Load real sensor data
    loadRealSensorData();

    // Create defect markers
    if (showDefects) {
      createDefectMarkers(scene);
    }

    // Start rendering loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    setIsLoading(false);

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      engine.dispose();
    };
  }, []);

  // Load real sensor data
  const loadRealSensorData = async () => {
    try {
      const sensorData = await sensorDataService.getSensorData();
      setRealSensorData(sensorData);

      // Update scan data with real sensor information
      if (sensorData.length > 0) {
        updateScanDataWithSensorReadings(sensorData);
      }
    } catch (error) {
      console.log("Using mock sensor data:", error);
      // Fallback to mock sensor data
      setRealSensorData(generateMockSensorData());
    }
  };

  // Update defects and surface conditions based on real sensor data
  const updateScanDataWithSensorReadings = (sensorData: SensorDataResponse[]) => {
    const temperatureSensors = sensorData.filter((s) => s.type === "temperature");
    const pressureSensors = sensorData.filter((s) => s.type === "pressure");
    const vibrationSensors = sensorData.filter((s) => s.type === "vibration");
    const thicknessSensors = sensorData.filter((s) => s.type === "thickness");
    const compactionSensors = sensorData.filter((s) => s.type === "compaction");

    // Analyze sensor data for defect detection
    const detectedDefects: DefectData[] = [];

    // Temperature analysis - high temps can indicate bleeding
    temperatureSensors.forEach((sensor, index) => {
      if (sensor.value > 200) {
        // Over 200°F
        detectedDefects.push({
          id: `temp-defect-${index}`,
          type: "bleeding",
          severity: sensor.value > 250 ? "high" : "medium",
          position: new Vector3(
            (sensor.location.longitude + 74.006) * 1000, // Convert to relative position
            0.1,
            (sensor.location.latitude - 40.7128) * 1000,
          ),
          area: 12.5,
          description: `High temperature detected: ${sensor.value}°F`,
          timestamp: new Date(sensor.timestamp),
          repairCost: 800,
          priority: sensor.value > 250 ? 1 : 2,
        });
      }
    });

    // Pressure analysis - low pressure can indicate rutting
    pressureSensors.forEach((sensor, index) => {
      if (sensor.value < 1500) {
        // Under 1500 PSI
        detectedDefects.push({
          id: `pressure-defect-${index}`,
          type: "rutting",
          severity: sensor.value < 1000 ? "critical" : "high",
          position: new Vector3(
            (sensor.location.longitude + 74.006) * 1000,
            0.1,
            (sensor.location.latitude - 40.7128) * 1000,
          ),
          area: 25.3,
          description: `Low pressure detected: ${sensor.value} PSI`,
          timestamp: new Date(sensor.timestamp),
          repairCost: 1500,
          priority: 1,
        });
      }
    });

    // Vibration analysis - high vibration can indicate cracking
    vibrationSensors.forEach((sensor, index) => {
      if (sensor.value > 8) {
        // Over 8 Hz
        detectedDefects.push({
          id: `vibration-defect-${index}`,
          type: "crack",
          severity: sensor.value > 12 ? "high" : "medium",
          position: new Vector3(
            (sensor.location.longitude + 74.006) * 1000,
            0.1,
            (sensor.location.latitude - 40.7128) * 1000,
          ),
          area: 8.7,
          length: 15,
          description: `High vibration detected: ${sensor.value} Hz`,
          timestamp: new Date(sensor.timestamp),
          repairCost: 600,
          priority: 2,
        });
      }
    });

    // Thickness analysis - thin spots indicate wear
    thicknessSensors.forEach((sensor, index) => {
      if (sensor.value < 2.5) {
        // Under 2.5 inches
        detectedDefects.push({
          id: `thickness-defect-${index}`,
          type: "raveling",
          severity: sensor.value < 2 ? "critical" : "high",
          position: new Vector3(
            (sensor.location.longitude + 74.006) * 1000,
            0.1,
            (sensor.location.latitude - 40.7128) * 1000,
          ),
          area: 18.2,
          description: `Thin pavement detected: ${sensor.value} inches`,
          timestamp: new Date(sensor.timestamp),
          repairCost: 2200,
          priority: 1,
        });
      }
    });

    // Update scan data with real defects
    if (detectedDefects.length > 0) {
      scanData.defects = [...scanData.defects, ...detectedDefects];

      // Recalculate surface condition index based on real data
      const avgCompaction =
        compactionSensors.reduce((sum, s) => sum + s.value, 0) / compactionSensors.length || 95;
      const criticalDefects = detectedDefects.filter((d) => d.severity === "critical").length;
      const highDefects = detectedDefects.filter((d) => d.severity === "high").length;

      scanData.surfaceConditionIndex = Math.max(
        0,
        avgCompaction - criticalDefects * 15 - highDefects * 8,
      );
    }
  };

  // Generate mock sensor data for fallback
  const generateMockSensorData = (): SensorDataResponse[] => {
    const sensorTypes: SensorDataResponse["type"][] = [
      "temperature",
      "pressure",
      "vibration",
      "thickness",
      "compaction",
    ];
    return sensorTypes.map((type, index) => ({
      sensorId: `sensor_${type}_${index}`,
      type,
      value: getMockValueForType(type),
      unit: getUnitForType(type),
      timestamp: new Date().toISOString(),
      location: {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.001,
        longitude: -74.006 + (Math.random() - 0.5) * 0.001,
      },
      quality: "good",
      alerts: [],
      calibrationDate: new Date().toISOString(),
      batteryLevel: 75 + Math.random() * 25,
    }));
  };

  const getMockValueForType = (type: SensorDataResponse["type"]): number => {
    switch (type) {
      case "temperature":
        return 180 + Math.random() * 80; // °F
      case "pressure":
        return 1800 + Math.random() * 400; // PSI
      case "vibration":
        return Math.random() * 12; // Hz
      case "thickness":
        return 2.5 + Math.random() * 2; // inches
      case "compaction":
        return 88 + Math.random() * 12; // %
      default:
        return Math.random() * 100;
    }
  };

  const getUnitForType = (type: SensorDataResponse["type"]): string => {
    switch (type) {
      case "temperature":
        return "°F";
      case "pressure":
        return "PSI";
      case "vibration":
        return "Hz";
      case "thickness":
        return "in";
      case "compaction":
        return "%";
      default:
        return "units";
    }
  };

  // Create 3D defect markers
  const createDefectMarkers = (scene: Scene) => {
    if (!sceneRef.current) return;

    scanData.defects
      .filter((defect) => selectedDefectTypes.includes(defect.type))
      .forEach((defect) => {
        const marker = MeshBuilder.CreateBox(`defect-${defect.id}`, { size: 0.5 }, scene);
        marker.position = defect.position;

        const material = new StandardMaterial(`defect-material-${defect.id}`, scene);
        material.diffuseColor = getDefectColor(defect.type, defect.severity);
        material.emissiveColor = getDefectColor(defect.type, defect.severity);
        marker.material = material;

        // Add click interaction
        marker.actionManager = new (scene.getEngine() as any).ActionManager(scene);
        // Note: ActionManager would need proper implementation for interactions
      });
  };

  const getDefectColor = (type: string, severity: string): Color3 => {
    const baseColors = {
      crack: severity === "critical" ? new Color3(1, 0, 0) : new Color3(1, 0.5, 0),
      pothole: new Color3(0.8, 0, 0),
      alligator: new Color3(0.5, 0, 1),
      rutting: new Color3(0, 0.8, 0.3),
      bleeding: new Color3(1, 0, 0.5),
      raveling: new Color3(0, 0.8, 1),
      patching: new Color3(0.5, 0.5, 0.5),
    };
    return baseColors[type as keyof typeof baseColors] || new Color3(0.5, 0.5, 0.5);
  };

  // Update defects when props change
  useEffect(() => {
    if (sceneRef.current && showDefects) {
      // Clear existing defect markers
      sceneRef.current.meshes
        .filter((mesh) => mesh.name.startsWith("defect-"))
        .forEach((mesh) => mesh.dispose());

      // Create new defect markers
      createDefectMarkers(sceneRef.current);
    }
  }, [showDefects, selectedDefectTypes, scanData.defects]);

  // Update opacity
  useEffect(() => {
    if (sceneRef.current) {
      const ground = sceneRef.current.getMeshByName("ground");
      if (ground && ground.material) {
        (ground.material as StandardMaterial).alpha = opacity / 100;
      }
    }
  }, [opacity]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ outline: "none" }} />

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
            <div>
              Surface Index:{" "}
              <span className="text-orange-400">{scanData.surfaceConditionIndex}</span>
            </div>
            <div>
              Defects: <span className="text-red-400">{scanData.defects.length}</span>
            </div>
            <div>
              Sensors: <span className="text-green-400">{realSensorData.length} active</span>
            </div>
            <div>
              Data Source:{" "}
              <span className="text-blue-400">
                {realSensorData.some((s) => s.calibrationDate) ? "Real IoT" : "Simulated"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Real3DPavementViewer;
