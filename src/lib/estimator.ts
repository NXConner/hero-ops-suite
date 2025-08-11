import { BUSINESS_PROFILE } from "@/data/business";
import type { BusinessProfile } from "@/types/business";

export type ServiceType = 'sealcoating' | 'crack_filling' | 'patching' | 'line_striping' | 'combo_driveway' | 'combo_parkinglot';

export interface EstimateInput {
  serviceType: ServiceType;
  // Areas and lengths
  sealcoatSquareFeet?: number; // area to sealcoat
  patchSquareFeet?: number; // area to patch
  crackLinearFeet?: number; // linear feet of cracks
  // Line striping
  numStandardStalls?: number;
  numDoubleStalls?: number;
  numHandicapSpots?: number;
  hasCrosswalks?: boolean;
  numArrows?: number;
  // Site conditions
  oilSpotSquareFeet?: number; // area needing Prep Seal
  surfacePorosityFactor?: number; // 1.0 normal, >1 increases usage
  // Patching detail
  patchThicknessInches?: number; // default 2
  patchMaterial?: 'hot' | 'cold';
  tackCoat?: boolean;
  additives?: boolean;
  // Crack detail
  deepCrackPrefillPct?: number; // 0..1 portion needing sand prefill
  // Crew & labor
  numFullTime: number; // e.g., 2
  numPartTime: number; // e.g., 1
  hourlyRatePerPerson: number; // e.g., 12
  // Travel & fuel
  roundTripMilesSupplier: number; // business -> supplier -> business
  roundTripMilesJob: number; // business -> job -> business
  c30MpgLoaded?: number; // default 12
  dakotaMpg?: number; // default 17
  trailerMpgModifierPct?: number; // e.g., -0.1 reduces mpg by 10%
  fuelPricePerGallon: number; // current fuel price
  legBasedRouting?: boolean; // if true, cost legs separately (supplier->job->return)
  // Equipment operation
  sealerActiveHours?: number; // hours machine actively used
  equipmentActiveFuelGph?: number; // gallons per hour when active (default 2)
  excessiveIdleHours?: number; // hours of excessive idle
  excessiveIdleCostPerHour?: number; // default 50
  // Materials unit pricing
  pmmPricePerGallon: number; // e.g., 3.65
  sandPricePer50lbBag: number; // e.g., 10
  fastDryPricePer5Gal: number; // 50
  prepSealPricePer5Gal: number; // 50
  crackBoxPricePer30lb: number; // 44.99
  propanePerTank: number; // 10
  // Options
  includeTransportWeightCheck?: boolean;
  applySalesTax?: boolean; // per‑job toggle to include sales tax in total
  multiCoat?: number; // e.g., 1,2
  wasteFactorPct?: number; // e.g., 0.05
  applicationMethod?: 'spray' | 'squeegee';
}

export interface EstimateBreakdownItem {
  label: string;
  quantity?: number;
  unit?: string;
  unitCost?: number;
  cost: number;
  notes?: string;
}

export interface EstimateOutput {
  projectDescription: string;
  materials: EstimateBreakdownItem[];
  labor: EstimateBreakdownItem[];
  equipmentAndFuel: EstimateBreakdownItem[];
  mobilization?: EstimateBreakdownItem[];
  subtotal: number;
  overhead: EstimateBreakdownItem;
  profit: EstimateBreakdownItem;
  total: number;
  // Variants
  totalWith25PctMarkup: number;
  roundedVariant: {
    roundedTotal: number;
    impliedMarkupPct: number; // based on rounded vs base subtotal+overhead+profit
    roundedPlus25Pct: number;
  };
  transportLoad?: {
    totalWeightLbs: number;
    notes: string;
    exceedsLikelyGvwr: boolean;
  };
  notes: string[];
}

// Defaults resolved from business profile
const DEFAULTS = {
  mixedSealerCoverageSqftPerGal: BUSINESS_PROFILE.coverage.mixedSealerCoverageSqftPerGal,
  waterPercent: BUSINESS_PROFILE.mix.waterPercent,
  sandBagsPer100GalConcentrate: BUSINESS_PROFILE.mix.sandBagsPer100GalConcentrate,
  fastDryGalPer125GalConcentrate: BUSINESS_PROFILE.mix.fastDryGalPer125GalConcentrate,
  prepSealCoverageSqftPerGal: BUSINESS_PROFILE.coverage.prepSealCoverageSqftPerGal,
  crackFillRatePerFoot: BUSINESS_PROFILE.pricing.crackFillRatePerFoot,
  patchingPerSqft: BUSINESS_PROFILE.pricing.patchingPerSqft,
  lineCostPerLinearFoot: BUSINESS_PROFILE.pricing.lineCostPerLinearFoot,
  avgStallLinearFeetSingle: 20,
  avgStallLinearFeetDouble: 25,
  mobilizationFee: BUSINESS_PROFILE.pricing.mobilizationFee,
  c30MpgLoaded: BUSINESS_PROFILE.fuel.c30MpgLoaded,
  dakotaMpg: BUSINESS_PROFILE.fuel.dakotaMpg,
  equipmentActiveFuelGph: BUSINESS_PROFILE.fuel.equipmentActiveFuelGph,
  excessiveIdleCostPerHour: BUSINESS_PROFILE.fuel.excessiveIdleCostPerHour,
  overheadPct: BUSINESS_PROFILE.pricing.overheadPct,
  profitPct: BUSINESS_PROFILE.pricing.profitPct,
};

function roundToTwo(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeSealcoatMaterials(
  squareFeet: number,
  porosityFactor: number,
  unitCosts: { pmm: number; sandBag: number; fastDry5Gal: number; prepSeal5Gal: number },
  oilSpotSqft: number
) {
  const effectiveCoverage = DEFAULTS.mixedSealerCoverageSqftPerGal / (porosityFactor || 1);
  let mixedGallonsNeeded = squareFeet / effectiveCoverage;
  const concentrateGallons = mixedGallonsNeeded / (1 + DEFAULTS.waterPercent);
  const sandBags = (concentrateGallons / 100) * DEFAULTS.sandBagsPer100GalConcentrate;
  const fastDryGallons = (concentrateGallons / 125) * DEFAULTS.fastDryGalPer125GalConcentrate;
  const fastDryBuckets5Gal = Math.ceil(fastDryGallons / 5);
  const prepSealGallons = oilSpotSqft > 0 ? oilSpotSqft / DEFAULTS.prepSealCoverageSqftPerGal : 0;
  const prepSealBuckets5Gal = Math.ceil(prepSealGallons / 5);
  const waterGallons = concentrateGallons * DEFAULTS.waterPercent;

  const materials: EstimateBreakdownItem[] = [];

  materials.push({
    label: 'SealMaster PMM Concentrate',
    quantity: roundToTwo(concentrateGallons),
    unit: 'gal',
    unitCost: unitCosts.pmm,
    cost: roundToTwo(concentrateGallons * unitCosts.pmm),
    notes: '20% water assumed; sand added per guidelines'
  });

  if (sandBags > 0) {
    const qty = Math.ceil(sandBags);
    materials.push({
      label: 'Sand (50 lb bags)',
      quantity: qty,
      unit: 'bag',
      unitCost: unitCosts.sandBag,
      cost: roundToTwo(qty * unitCosts.sandBag)
    });
  }

  if (fastDryBuckets5Gal > 0) {
    materials.push({
      label: 'Fast Dry Additive (5 gal)',
      quantity: fastDryBuckets5Gal,
      unit: 'bucket',
      unitCost: unitCosts.fastDry5Gal,
      cost: roundToTwo(fastDryBuckets5Gal * unitCosts.fastDry5Gal)
    });
  }

  if (prepSealBuckets5Gal > 0) {
    materials.push({
      label: 'Prep Seal (5 gal)',
      quantity: prepSealBuckets5Gal,
      unit: 'bucket',
      unitCost: unitCosts.prepSeal5Gal,
      cost: roundToTwo(prepSealBuckets5Gal * unitCosts.prepSeal5Gal)
    });
  }

  return { materials, concentrateGallons, sandBags: Math.ceil(sandBags), waterGallons: roundToTwo(waterGallons) };
}

export function computeCrackFill(
  linearFeet: number,
  unitCosts: { crackBox: number; propaneTank: number },
  pricePerFoot: number
) {
  const boxes = Math.ceil(linearFeet / 150);
  const propaneTanks = Math.max(1, Math.ceil(boxes / 2));
  const materialCost = boxes * unitCosts.crackBox + propaneTanks * unitCosts.propaneTank;
  const lineItemMaterial: EstimateBreakdownItem = {
    label: 'Crack Filler (30 lb boxes)',
    quantity: boxes,
    unit: 'box',
    unitCost: unitCosts.crackBox,
    cost: roundToTwo(boxes * unitCosts.crackBox)
  };
  const lineItemPropane: EstimateBreakdownItem = {
    label: 'Propane Tanks',
    quantity: propaneTanks,
    unit: 'tank',
    unitCost: unitCosts.propaneTank,
    cost: roundToTwo(propaneTanks * unitCosts.propaneTank)
  };
  const sellPrice = roundToTwo(linearFeet * pricePerFoot);
  return { materialCost: roundToTwo(materialCost), items: [lineItemMaterial, lineItemPropane], sellPrice };
}

export function computePatching(
  squareFeet: number,
  unitSellPricePerSqft: number,
  thicknessInches = 2,
  material: 'hot' | 'cold' = 'hot'
) {
  let base = unitSellPricePerSqft;
  // Adjust base for material if provided
  if (material === 'cold' && BUSINESS_PROFILE.pricing.patchingColdPerSqft) {
    base = BUSINESS_PROFILE.pricing.patchingColdPerSqft;
  } else if (material === 'hot' && BUSINESS_PROFILE.pricing.patchingHotPerSqft) {
    base = BUSINESS_PROFILE.pricing.patchingHotPerSqft;
  }
  // Scale price roughly linearly with thickness relative to 2"
  const thicknessFactor = thicknessInches / 2;
  const sellPrice = roundToTwo(squareFeet * base * thicknessFactor);
  return { sellPrice };
}

export function computeStriping(
  params: {
    numStandardStalls: number;
    numDoubleStalls: number;
    numHandicapSpots: number;
    hasCrosswalks: boolean;
    numArrows: number;
    numCrosswalks?: number;
    paintColor?: string;
    numStopBars?: number;
    numTextStencils?: number;
    stallSize?: 'standard' | 'compact' | 'truck';
  },
  unitCostPerLinearFoot: number
) {
  const chosen = params.stallSize || 'standard';
  const catalog = BUSINESS_PROFILE.pricing.stencilCatalog;
  const sizeLf = catalog?.stalls.find(s => s.size === chosen)?.lf ?? DEFAULTS.avgStallLinearFeetSingle;
  const lfStalls =
    params.numStandardStalls * sizeLf +
    params.numDoubleStalls * DEFAULTS.avgStallLinearFeetDouble;
  let extras = 0;
  if (params.numHandicapSpots > 0) {
    const hc = BUSINESS_PROFILE.pricing.handicapSymbolCost ?? 40;
    extras += params.numHandicapSpots * hc;
  }
  const crosswalks = params.numCrosswalks ?? (params.hasCrosswalks ? 1 : 0);
  if (crosswalks > 0) {
    const cx = BUSINESS_PROFILE.pricing.crosswalkCost ?? 60;
    extras += crosswalks * cx;
  }
  if ((params.numStopBars ?? 0) > 0) {
    const sb = BUSINESS_PROFILE.pricing.stopBarCost ?? 25;
    extras += (params.numStopBars ?? 0) * sb;
  }
  if ((params.numTextStencils ?? 0) > 0) {
    const ts = BUSINESS_PROFILE.pricing.textStencilCost ?? 15;
    extras += (params.numTextStencils ?? 0) * ts;
  }
  if (params.numArrows > 0) {
    const ar = BUSINESS_PROFILE.pricing.arrowCost ?? 15;
    extras += params.numArrows * ar;
  }
  let colorDelta = 0;
  if (params.paintColor) {
    const delta = BUSINESS_PROFILE.pricing.paintColorCostDelta?.[params.paintColor] ?? 0;
    colorDelta = delta * lfStalls;
  }
  const linePrice = roundToTwo(lfStalls * unitCostPerLinearFoot + extras + colorDelta);
  return { linearFeet: lfStalls, sellPrice: linePrice };
}

export function computeFuelAndEquipment(
  input: EstimateInput,
  concentrateGallonsUsed?: number
) {
  const c30MpgBase = input.c30MpgLoaded ?? DEFAULTS.c30MpgLoaded;
  const dakotaMpgBase = input.dakotaMpg ?? DEFAULTS.dakotaMpg;
  const fuelRate = input.fuelPricePerGallon;
  const degrade = BUSINESS_PROFILE.fuel.mpgDegradeLoadedPct ?? 0;
  const trailerMod = input.trailerMpgModifierPct ?? 0;

  const c30Miles = input.roundTripMilesSupplier + input.roundTripMilesJob;
  const dakotaMiles = input.roundTripMilesJob;
  const c30MpgEffective = c30Miles > 0 ? c30MpgBase * (1 - degrade) * (1 + trailerMod) : c30MpgBase;
  const dakotaMpgEffective = dakotaMiles > 0 ? dakotaMpgBase * (1 + trailerMod) : dakotaMpgBase;
  const c30Fuel = c30Miles / c30MpgEffective;
  const dakotaFuel = dakotaMiles / dakotaMpgEffective;
  const travelFuelGallons = c30Fuel + dakotaFuel;
  const travelFuelCost = roundToTwo(travelFuelGallons * fuelRate);

  const activeHours = input.sealerActiveHours ?? 0;
  const activeGph = input.equipmentActiveFuelGph ?? DEFAULTS.equipmentActiveFuelGph;
  const activeFuel = activeHours * activeGph;
  const activeFuelCost = roundToTwo(activeFuel * fuelRate);

  const idleHours = input.excessiveIdleHours ?? 0;
  const idleCostRate = input.excessiveIdleCostPerHour ?? DEFAULTS.excessiveIdleCostPerHour;
  const idleCost = roundToTwo(idleHours * idleCostRate);

  const items: EstimateBreakdownItem[] = [
    { label: 'Travel Fuel (both vehicles)', cost: travelFuelCost, notes: `${roundToTwo(travelFuelGallons)} gal @ $${fuelRate}/gal` },
  ];
  if (activeFuelCost > 0) items.push({ label: 'Equipment Fuel (active operation)', cost: activeFuelCost, notes: `${roundToTwo(activeFuel)} gal @ $${fuelRate}/gal` });
  if (idleCost > 0) items.push({ label: 'Equipment Excessive Idle', cost: idleCost, notes: `${idleHours} hr @ $${idleCostRate}/hr` });

  return { items, cost: roundToTwo(travelFuelCost + activeFuelCost + idleCost) };
}

export function computeLabor(
  input: EstimateInput,
  hours: number,
  label = 'Crew Labor'
) {
  const crewSize = input.numFullTime + input.numPartTime;
  const hourly = input.hourlyRatePerPerson;
  const cost = roundToTwo(hours * crewSize * hourly);
  const item: EstimateBreakdownItem = {
    label,
    cost,
    notes: `${hours} hr x ${crewSize} crew x $${hourly}/hr`
  };
  return { item, hours, crewSize, hourly };
}

export function computeTransportLoad(concentrateGallons: number, sandBags: number, waterGallons: number) {
  const unitEmptyLbs = BUSINESS_PROFILE.equipment.sealmasterSk550.emptyWeightLbs ?? 1865;
  const sealerLbsPerGal = BUSINESS_PROFILE.equipment.sealmasterSk550.sealerWeightPerGallonLbs ?? 10;
  const tankLoadLbs = (concentrateGallons + waterGallons) * sealerLbsPerGal;
  const sandLbs = sandBags * 50;
  const totalWeight = unitEmptyLbs + tankLoadLbs + sandLbs;
  const truckCurb = BUSINESS_PROFILE.vehicles.c30.curbWeightLbs ?? 4300;
  const combined = totalWeight + truckCurb;
  const likelyGvwrMin = BUSINESS_PROFILE.vehicles.c30.gvwrMinLbs ?? 10000;
  const exceeds = combined > likelyGvwrMin;
  const notes = `Unit ${unitEmptyLbs} lbs + sealer ${Math.round(tankLoadLbs)} lbs + sand ${sandLbs} lbs + truck ${truckCurb} lbs = ${Math.round(combined)} lbs.`;
  return { totalWeightLbs: Math.round(combined), notes, exceedsLikelyGvwr: exceeds };
}

export function buildEstimate(input: EstimateInput): EstimateOutput {
  const notes: string[] = [];
  let materials: EstimateBreakdownItem[] = [];
  const labor: EstimateBreakdownItem[] = [];
  const equipmentAndFuel: EstimateBreakdownItem[] = [];
  const mobilization: EstimateBreakdownItem[] = [
    { label: 'Mobilization', cost: BUSINESS_PROFILE.pricing.mobilizationFee }
  ];

  let projectDescription = '';
  let concentrateGallons = 0;
  let baseSellFromTasks = 0;

  let laborHours = 0;

  const porosity = input.surfacePorosityFactor ?? 1;

  let scContext: {concentrateGallons: number; sandBags: number; waterGallons: number} | null = null;
  if (input.serviceType === 'sealcoating' || input.serviceType === 'combo_driveway' || input.serviceType === 'combo_parkinglot') {
    const sqft = input.sealcoatSquareFeet || 0;
    const oilSqft = input.oilSpotSquareFeet || 0;
    const sc = computeSealcoatMaterials(
      sqft,
      porosity,
      {
        pmm: input.pmmPricePerGallon,
        sandBag: input.sandPricePer50lbBag,
        fastDry5Gal: input.fastDryPricePer5Gal,
        prepSeal5Gal: input.prepSealPricePer5Gal
      },
      oilSqft
    );
    concentrateGallons = sc.concentrateGallons;
    scContext = { concentrateGallons: sc.concentrateGallons, sandBags: sc.sandBags, waterGallons: sc.waterGallons } as any;
    materials = materials.concat(sc.materials);
    // Multi-coat and waste factor
    const coats = Math.max(1, input.multiCoat ?? 1);
    if (coats > 1) {
      const extraCoats = coats - 1;
      const extraCost = roundToTwo((sc.materials.reduce((s, m) => s + m.cost, 0)) * extraCoats * 0.9); // assume 90% of initial per extra coat
      materials.push({ label: `Additional Coats x${extraCoats}`, cost: extraCost });
    }
    if ((input.wasteFactorPct ?? 0) > 0) {
      const baseMat = materials.reduce((s, m) => s + m.cost, 0);
      const waste = roundToTwo(baseMat * (input.wasteFactorPct ?? 0));
      materials.push({ label: `Waste Factor`, cost: waste, notes: `${Math.round((input.wasteFactorPct ?? 0) * 100)}%` });
    }
    // Application method productivity impact on labor hours
    if (input.applicationMethod === 'spray') laborHours += Math.max(0, -0.2 * (sqft / 3000));
    if (input.applicationMethod === 'squeegee') laborHours += Math.max(0.2, 0.2 * (sqft / 3000));
    projectDescription += `Sealcoating ${sqft} sq ft. `;
    laborHours += Math.max(2, sqft / 3000);
  }

  if (input.serviceType === 'patching' || input.serviceType === 'combo_driveway' || input.serviceType === 'combo_parkinglot') {
    const patchSqft = input.patchSquareFeet || 0;
    if (patchSqft > 0) {
      const patch = computePatching(patchSqft, DEFAULTS.patchingPerSqft, input.patchThicknessInches ?? 2, (input.patchMaterial as any) ?? 'hot');
      baseSellFromTasks += patch.sellPrice;
      // Tack coat/additives surcharges
      if (input.tackCoat) materials.push({ label: 'Tack Coat', cost: roundToTwo(patchSqft * 0.15) });
      if (input.additives) materials.push({ label: 'Additives', cost: roundToTwo(patchSqft * 0.10) });
      projectDescription += `Patching ${patchSqft} sq ft @ ${input.patchThicknessInches ?? 2}\" ${input.patchMaterial ?? 'hot'}-mix. `;
      laborHours += Math.max(1, patchSqft / 400);
    }
  }

  if (input.serviceType === 'crack_filling' || input.serviceType === 'combo_driveway' || input.serviceType === 'combo_parkinglot') {
    const lf = input.crackLinearFeet || 0;
    if (lf > 0) {
      const crack = computeCrackFill(lf, { crackBox: input.crackBoxPricePer30lb, propaneTank: input.propanePerTank }, DEFAULTS.crackFillRatePerFoot);
      materials = materials.concat(crack.items);
      baseSellFromTasks += crack.sellPrice;
      const deepPct = input.deepCrackPrefillPct ?? 0;
      if (deepPct > 0) {
        const sandBagsPrefill = Math.ceil((lf * deepPct) / 100); // rough: 1 bag per 100 ft deep cracks
        if (sandBagsPrefill > 0) {
          materials.push({ label: 'Sand (deep crack prefill)', quantity: sandBagsPrefill, unit: 'bag', unitCost: input.sandPricePer50lbBag, cost: roundToTwo(sandBagsPrefill * input.sandPricePer50lbBag) });
        }
      }
      projectDescription += `Crack filling ${lf} linear ft. `;
      laborHours += Math.max(1, lf / 100);
    }
  }

  if (input.serviceType === 'line_striping' || input.serviceType === 'combo_parkinglot') {
    const params = {
      numStandardStalls: input.numStandardStalls || 0,
      numDoubleStalls: input.numDoubleStalls || 0,
      numHandicapSpots: input.numHandicapSpots || 0,
      hasCrosswalks: input.hasCrosswalks || false,
      numArrows: input.numArrows || 0,
      numCrosswalks: (input as any).numCrosswalks || 0,
      paintColor: (input as any).paintColor || undefined,
      numStopBars: (input as any).numStopBars || 0,
      numTextStencils: (input as any).numTextStencils || 0,
      stallSize: (input as any).stallSize || 'standard',
    };
    const strip = computeStriping(params, DEFAULTS.lineCostPerLinearFoot);
    baseSellFromTasks += strip.sellPrice;
    projectDescription += `Line striping ~${strip.linearFeet} LF with extras. `;
    laborHours += Math.max(1, strip.linearFeet / 300);
  }

  const laborResult = computeLabor(input, laborHours);
  labor.push(laborResult.item);

  const fuel = computeFuelAndEquipment(input, concentrateGallons);
  equipmentAndFuel.push(...fuel.items);

  const materialsCost = materials.reduce((sum, m) => sum + m.cost, 0);
  const laborCost = labor.reduce((sum, i) => sum + i.cost, 0);
  const equipmentFuelCost = equipmentAndFuel.reduce((sum, i) => sum + i.cost, 0);
  const mobilizationCost = mobilization.reduce((sum, i) => sum + i.cost, 0);

  let subtotal = materialsCost + laborCost + equipmentFuelCost + mobilizationCost + baseSellFromTasks;
  subtotal = roundToTwo(subtotal);

  const overheadCost = roundToTwo(subtotal * DEFAULTS.overheadPct);
  const profitCost = roundToTwo((subtotal + overheadCost) * DEFAULTS.profitPct);
  let total = roundToTwo(subtotal + overheadCost + profitCost);

  // Sales tax (optional per-job)
  const taxPct = BUSINESS_PROFILE.pricing.salesTaxPct ?? 0;
  if (input.applySalesTax && taxPct > 0) {
    const tax = roundToTwo(total * taxPct);
    materials.push({ label: `Sales Tax (${Math.round(taxPct * 100)}%)`, cost: tax });
    total = roundToTwo(total + tax);
  }

  const totalWith25PctMarkup = roundToTwo(total * 1.25);
  const roundedTotal = Math.ceil(total / 10) * 10;
  const impliedMarkupPct = total === 0 ? 0 : roundToTwo(((roundedTotal - total) / total) * 100);
  const roundedPlus25Pct = Math.ceil((roundedTotal * 1.25) / 10) * 10;

  let transportLoad: EstimateOutput['transportLoad'];
  if (input.includeTransportWeightCheck && scContext) {
    transportLoad = computeTransportLoad(scContext.concentrateGallons, scContext.sandBags, scContext.waterGallons);
  }

  notes.push('Estimate valid for 30 days. Subject to site inspection.');
  notes.push('Coverage and material usage may vary with pavement age and porosity.');
  notes.push('Travel distances and fuel calculations are estimates; actual costs may vary.');

  return {
    projectDescription: projectDescription.trim(),
    materials,
    labor,
    equipmentAndFuel,
    mobilization,
    subtotal,
    overhead: { label: `Overhead (${Math.round(DEFAULTS.overheadPct * 100)}%)`, cost: overheadCost },
    profit: { label: `Profit (${Math.round(DEFAULTS.profitPct * 100)}%)`, cost: profitCost },
    total,
    totalWith25PctMarkup,
    roundedVariant: {
      roundedTotal,
      impliedMarkupPct,
      roundedPlus25Pct
    },
    transportLoad,
    notes
  };
}