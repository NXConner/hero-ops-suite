import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface DefectData {
  id: string;
  type: "crack" | "pothole" | "alligator" | "rutting" | "bleeding" | "raveling" | "patching";
  severity: "low" | "medium" | "high" | "critical";
  position: { x: number; y: number; z: number };
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
}

interface Props {
  scanData: ScanData;
  showDefects: boolean;
  selectedDefectTypes: string[];
  opacity: number;
  showGrid: boolean;
  showAnalysis: boolean;
  className?: string;
}

const severityColor = (severity: DefectData["severity"]) => {
  switch (severity) {
    case "critical":
      return new THREE.Color(0xef4444);
    case "high":
      return new THREE.Color(0xf97316);
    case "medium":
      return new THREE.Color(0xeab308);
    case "low":
    default:
      return new THREE.Color(0x22c55e);
  }
};

const Real3DPavementViewerThree: React.FC<Props> = ({
  scanData,
  showDefects,
  selectedDefectTypes,
  opacity,
  showGrid,
  showAnalysis,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groundRef = useRef<THREE.Mesh | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const markersRef = useRef<THREE.Object3D[]>([]);
  const animRef = useRef<number | null>(null);

  // Initialize renderer, camera, scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(8, 10, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    scene.add(hemi);

    // Ground plane representing pavement
    const groundGeo = new THREE.PlaneGeometry(20, 20, 10, 10);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x4d4d4d, transparent: true, opacity: opacity / 100 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    groundRef.current = ground;

    // Grid helper
    if (showGrid) {
      const grid = new THREE.GridHelper(20, 20, 0x00ffff, 0x00ffff);
      scene.add(grid);
      gridRef.current = grid;
    }

    const onResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", onResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      markersRef.current.forEach((m) => scene.remove(m));
      if (gridRef.current) scene.remove(gridRef.current);
      if (groundRef.current) scene.remove(groundRef.current);
      renderer.dispose();
      scene.clear();
      containerRef.current?.removeChild(renderer.domElement);
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      groundRef.current = null;
      gridRef.current = null;
      markersRef.current = [];
    };
  }, []);

  // Update grid and ground opacity when props change
  useEffect(() => {
    if (groundRef.current) {
      const mat = groundRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = opacity / 100;
      mat.needsUpdate = true;
    }
    if (sceneRef.current) {
      if (showGrid && !gridRef.current) {
        const grid = new THREE.GridHelper(20, 20, 0x00ffff, 0x00ffff);
        sceneRef.current.add(grid);
        gridRef.current = grid;
      } else if (!showGrid && gridRef.current) {
        sceneRef.current.remove(gridRef.current);
        gridRef.current = null;
      }
    }
  }, [opacity, showGrid]);

  // Draw defects
  useEffect(() => {
    if (!sceneRef.current) return;
    // Clear existing markers
    markersRef.current.forEach((m) => sceneRef.current!.remove(m));
    markersRef.current = [];

    if (showDefects) {
      const types = new Set(selectedDefectTypes);
      scanData.defects
        .filter((d) => types.has(d.type))
        .forEach((defect) => {
          const size = defect.severity === "critical" ? 0.8 : defect.severity === "high" ? 0.6 : defect.severity === "medium" ? 0.45 : 0.35;
          const geom = new THREE.SphereGeometry(size, 16, 16);
          const mat = new THREE.MeshStandardMaterial({ color: severityColor(defect.severity), emissive: severityColor(defect.severity) });
          const mesh = new THREE.Mesh(geom, mat);
          mesh.position.set(defect.position.x, Math.max(0.05, defect.position.y), defect.position.z);

          // Label as a simple billboarded plane (optional omitted for brevity)
          sceneRef.current!.add(mesh);
          markersRef.current.push(mesh);
        });
    }
  }, [scanData, showDefects, selectedDefectTypes]);

  return <div ref={containerRef} className={`w-full h-[480px] rounded border border-border/30 ${className}`} />;
};

export default Real3DPavementViewerThree;