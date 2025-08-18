import { Overlay } from "../types/overlay";

type PricingItem = { item_code: string; unit: "ft" | "sqft" | "ea"; unit_cost: number };

type PricingTable = Record<string, PricingItem>;

export type EstimateLine = {
  item_code: string;
  description: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total: number;
};

export type EstimateResult = {
  lines: EstimateLine[];
  mobilization: number;
  contingencyPercent: number;
  subtotal: number;
  total: number;
};

export function estimateCosts(
  overlay: Overlay,
  pricing: PricingTable,
  options: { mobilization?: number; contingencyPercent?: number } = {},
): EstimateResult {
  const mobilization = options.mobilization ?? 250;
  const contingencyPercent = options.contingencyPercent ?? 0.1;

  const lines: EstimateLine[] = [];

  // Crack sealing
  const crackLengthFt = overlay.cracks.reduce((acc, c) => acc + (c.length_ft || 0), 0);
  if (crackLengthFt > 0 && pricing["CRACK_SEAL"]) {
    const p = pricing["CRACK_SEAL"];
    lines.push({
      item_code: "CRACK_SEAL",
      description: "Crack sealing (hot-pour)",
      quantity: crackLengthFt,
      unit: p.unit,
      unit_cost: p.unit_cost,
      total: crackLengthFt * p.unit_cost,
    });
  }

  // Pothole patching by area
  const potholeAreaSqft = overlay.potholes.reduce((acc, p) => acc + (p.area_sqft || 0), 0);
  if (potholeAreaSqft > 0 && pricing["POTHOLE_PATCH"]) {
    const p = pricing["POTHOLE_PATCH"];
    lines.push({
      item_code: "POTHOLE_PATCH",
      description: "Pothole patch",
      quantity: potholeAreaSqft,
      unit: p.unit,
      unit_cost: p.unit_cost,
      total: potholeAreaSqft * p.unit_cost,
    });
  }

  // Gatoring repair by area
  const gatorAreaSqft = overlay.distress_zones
    .filter((d) => d.type === "gatoring")
    .reduce((acc, d) => acc + (d.area_sqft || 0), 0);
  if (gatorAreaSqft > 0 && pricing["GATOR_REPAIR"]) {
    const p = pricing["GATOR_REPAIR"];
    lines.push({
      item_code: "GATOR_REPAIR",
      description: "Gatoring repair",
      quantity: gatorAreaSqft,
      unit: p.unit,
      unit_cost: p.unit_cost,
      total: gatorAreaSqft * p.unit_cost,
    });
  }

  // Regrading for pooling area
  const poolingAreaSqft = overlay.slope_analysis?.pooling_area_sqft || 0;
  if (poolingAreaSqft > 0 && pricing["REGRADING"]) {
    const p = pricing["REGRADING"];
    lines.push({
      item_code: "REGRADING",
      description: "Regrading/leveling",
      quantity: poolingAreaSqft,
      unit: p.unit,
      unit_cost: p.unit_cost,
      total: poolingAreaSqft * p.unit_cost,
    });
  }

  const subtotal = lines.reduce((acc, l) => acc + l.total, 0) + mobilization;
  const total = subtotal * (1 + contingencyPercent);

  return { lines, mobilization, contingencyPercent, subtotal, total };
}
