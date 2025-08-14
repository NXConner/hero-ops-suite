// @ts-nocheck

// Helper to map PavementScan Pro defects to server overlay schema expected by /server/index.js
// The server computes:
// - cracks_ft from overlay.cracks[].length_ft
// - potholes_sqft from overlay.potholes[].area_sqft
// - gator_sqft from overlay.distress_zones[] items with type === 'gatoring'
// - pooling_sqft from overlay.slope_analysis.pooling_area_sqft

export function buildOverlayFromDefects(defects, extras = {}) {
  const cracks = [];
  const potholes = [];
  const distress_zones = [];

  let pooling_area_sqft = 0;

  for (const d of defects || []) {
    const type = d.type;
    const lengthFt = d.measurements?.length || undefined;
    const areaSqft = d.measurements?.area || undefined;

    if (type === 'crack') {
      if (lengthFt && lengthFt > 0) {
        cracks.push({ id: d.id, length_ft: lengthFt, severity: d.severity });
      }
      continue;
    }

    if (type === 'pothole') {
      if (areaSqft && areaSqft > 0) {
        potholes.push({ id: d.id, area_sqft: areaSqft, severity: d.severity });
      }
      continue;
    }

    if (type === 'water_pooling') {
      if (areaSqft && areaSqft > 0) pooling_area_sqft += areaSqft;
      continue;
    }

    // All other surface distress go into distress_zones with a generic shape
    if (areaSqft && areaSqft > 0) {
      distress_zones.push({ id: d.id, type, area_sqft: areaSqft, severity: d.severity });
    }
  }

  // Allow callers to add/override pooling via extras
  if (typeof extras.poolingAreaSqft === 'number') {
    pooling_area_sqft += extras.poolingAreaSqft;
  }

  const overlay = {
    cracks,
    potholes,
    distress_zones,
    slope_analysis: {
      pooling_area_sqft
    }
  };

  return overlay;
}