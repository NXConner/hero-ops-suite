export type Vector3 = { x: number; y: number; z: number };

export type Crack = {
  id: string;
  length_ft: number;
  severity: "minor" | "moderate" | "severe" | string;
  coordinates: Vector3[];
};

export type Pothole = {
  id: string;
  area_sqft: number;
  depth_in?: number;
  center: Vector3;
};

export type DistressZone = {
  id: string;
  type: "gatoring" | "patch" | "edge" | string;
  area_sqft: number;
  polygon: Vector3[];
};

export type SlopeVector = {
  start: Vector3;
  end: Vector3;
  grade_percent: number;
};

export type RiskZone = {
  id: string;
  center: Vector3;
  severity: "low" | "medium" | "high" | string;
};

export type SlopeAnalysis = {
  pooling_area_sqft: number;
  risk_zones: RiskZone[];
  slope_vectors: SlopeVector[];
};

export type Overlay = {
  scan_id: string;
  timestamp: string;
  dimensions?: { perimeter_ft?: number; area_sqft?: number; bbox_ft?: [number, number] };
  cracks: Crack[];
  potholes: Pothole[];
  distress_zones: DistressZone[];
  slope_analysis?: SlopeAnalysis;
  recommendations?: string[];
};
