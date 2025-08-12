import { Overlay } from '../types/overlay';

export const demoOverlay: Overlay = {
  scan_id: 'demo',
  timestamp: new Date().toISOString(),
  dimensions: { perimeter_ft: 142.5, area_sqft: 1200, bbox_ft: [60, 20] },
  cracks: [
    { id: 'c1', length_ft: 100, severity: 'moderate', coordinates: [] },
    { id: 'c2', length_ft: 55, severity: 'minor', coordinates: [] }
  ],
  potholes: [
    { id: 'p1', area_sqft: 5, center: { x: 0, y: 0, z: 0 }, depth_in: 2 }
  ],
  distress_zones: [
    { id: 'd1', type: 'gatoring', area_sqft: 20, polygon: [] }
  ],
  slope_analysis: { pooling_area_sqft: 50, risk_zones: [], slope_vectors: [] },
  recommendations: ['Seal cracks', 'Patch pothole', 'Regrade north edge']
};