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
  // Crew & labor
  numFullTime: number; // e.g., 2
  numPartTime: number; // e.g., 1
  hourlyRatePerPerson: number; // e.g., 12
  // Travel & fuel
  roundTripMilesSupplier: number; // business -> supplier -> business
  roundTripMilesJob: number; // business -> job -> business
  c30MpgLoaded?: number; // default 12
  dakotaMpg?: number; // default 17
  fuelPricePerGallon: number; // current fuel price
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

// Constants and helpers derived from user guidance
const DEFAULTS = {
  mixedSealerCoverageSqftPerGal: 76, // mid of 70-82
  waterPercent: 0.2, // 20%
  sandBagsPer100GalConcentrate: 6, // 300 lbs ~ 6 bags per 100 gal
  fastDryGalPer125GalConcentrate: 2, // 2 gal per 125 gal concentrate
  prepSealCoverageSqftPerGal: 175, // 150-200 avg
  crackFillRatePerFoot: 1.75, // default material+labor rate midpoint $1-$3
  patchingPerSqft: 3.5, // midpoint $2-$5 hot-mix
  lineCostPerLinearFoot: 0.9, // $0.75-$1.00
  avgStallLinearFeetSingle: 20,
  avgStallLinearFeetDouble: 25,
  mobilizationFee: 250, // midpoint $150-$350
  c30MpgLoaded: 12,
  dakotaMpg: 17,
  equipmentActiveFuelGph: 2,
  excessiveIdleCostPerHour: 50,
  overheadPct: 0.10, // default overhead 10%
  profitPct: 0.18 // default profit
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
  // Determine mixed gallons needed at given coverage and porosity
  const effectiveCoverage = DEFAULTS.mixedSealerCoverageSqftPerGal / (porosityFactor || 1);
  const mixedGallonsNeeded = squareFeet / effectiveCoverage;

  // Convert mixed gallons to concentrate gallons given 20% water: mixed = concentrate * (1 + water)
  const concentrateGallons = mixedGallonsNeeded / (1 + DEFAULTS.waterPercent);

  // Sand bags per 100 gal concentrate: 6 bags per 100
  const sandBags = (concentrateGallons / 100) * DEFAULTS.sandBagsPer100GalConcentrate;

  // Fast dry: 2 gal per 125 gal concentrate. Compute required gallons, then 5-gal buckets.
  const fastDryGallons = (concentrateGallons / 125) * DEFAULTS.fastDryGalPer125GalConcentrate;
  const fastDryBuckets5Gal = Math.ceil(fastDryGallons / 5);

  // Prep Seal for oil spots: 175 sqft/gal avg; 5-gal buckets
  const prepSealGallons = oilSpotSqft > 0 ? oilSpotSqft / DEFAULTS.prepSealCoverageSqftPerGal : 0;
  const prepSealBuckets5Gal = Math.ceil(prepSealGallons / 5);

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

  return { materials, concentrateGallons };
}

export function computeCrackFill(
  linearFeet: number,
  unitCosts: { crackBox: number; propaneTank: number },
  pricePerFoot: number
) {
  // Boxes consumption can vary; assume 1 box per ~200 linear feet typical. Make it conservative 1/150.
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
  unitSellPricePerSqft: number
) {
  const sellPrice = roundToTwo(squareFeet * unitSellPricePerSqft);
  return { sellPrice };
}

export function computeStriping(
  params: {
    numStandardStalls: number;
    numDoubleStalls: number;
    numHandicapSpots: number;
    hasCrosswalks: boolean;
    numArrows: number;
  },
  unitCostPerLinearFoot: number
) {
  const lfStalls =
    params.numStandardStalls * DEFAULTS.avgStallLinearFeetSingle +
    params.numDoubleStalls * DEFAULTS.avgStallLinearFeetDouble;
  // Extras
  let extras = 0;
  if (params.numHandicapSpots > 0) {
    extras += params.numHandicapSpots * 40; // flat allowance per symbol
  }
  if (params.hasCrosswalks) {
    extras += 60; // allowance
  }
  if (params.numArrows > 0) {
    extras += params.numArrows * 15;
  }
  const linePrice = roundToTwo(lfStalls * unitCostPerLinearFoot + extras);
  return { linearFeet: lfStalls, sellPrice: linePrice };
}

export function computeFuelAndEquipment(
  input: EstimateInput,
  concentrateGallonsUsed?: number
) {
  const c30Mpg = input.c30MpgLoaded ?? DEFAULTS.c30MpgLoaded;
  const dakotaMpg = input.dakotaMpg ?? DEFAULTS.dakotaMpg;
  const fuelRate = input.fuelPricePerGallon;

  // Travel fuel
  const c30Miles = input.roundTripMilesSupplier + input.roundTripMilesJob; // assume C30 runs supplier + job
  const dakotaMiles = input.roundTripMilesJob; // Dakota primarily to/from job
  const c30Fuel = c30Miles / c30Mpg;
  const dakotaFuel = dakotaMiles / dakotaMpg;
  const travelFuelGallons = c30Fuel + dakotaFuel;
  const travelFuelCost = roundToTwo(travelFuelGallons * fuelRate);

  // Equipment active fuel (sealer rig)
  const activeHours = input.sealerActiveHours ?? 0;
  const activeGph = input.equipmentActiveFuelGph ?? DEFAULTS.equipmentActiveFuelGph;
  const activeFuel = activeHours * activeGph;
  const activeFuelCost = roundToTwo(activeFuel * fuelRate);

  // Excessive idle cost
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

export function computeTransportLoad(concentrateGallons: number) {
  const unitEmptyLbs = 1865;
  const sealerLbsPerGal = 10; // as given
  const tankLoadLbs = concentrateGallons * sealerLbsPerGal; // conservative: concentrate only; mixed is heavier with sand but sand is separate
  const totalWeight = unitEmptyLbs + tankLoadLbs;
  const truckCurb = 4300;
  const combined = totalWeight + truckCurb;
  const likelyGvwrMin = 10000;
  const exceeds = combined > likelyGvwrMin;
  const notes = `Unit ${unitEmptyLbs} lbs + sealer ${Math.round(tankLoadLbs)} lbs + truck ${truckCurb} lbs = ${Math.round(combined)} lbs.`;
  return { totalWeightLbs: Math.round(combined), notes, exceedsLikelyGvwr: exceeds };
}

export function buildEstimate(input: EstimateInput): EstimateOutput {
  const notes: string[] = [];
  let materials: EstimateBreakdownItem[] = [];
  const labor: EstimateBreakdownItem[] = [];
  const equipmentAndFuel: EstimateBreakdownItem[] = [];
  const mobilization: EstimateBreakdownItem[] = [
    { label: 'Mobilization', cost: DEFAULTS.mobilizationFee }
  ];

  let projectDescription = '';
  let concentrateGallons = 0;
  let baseSellFromTasks = 0;

  // Assume baseline hours by service type
  let laborHours = 0;

  const porosity = input.surfacePorosityFactor ?? 1;

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
    materials = materials.concat(sc.materials);
    projectDescription += `Sealcoating ${sqft} sq ft. `;
    laborHours += Math.max(2, sqft / 3000); // rough: 3k sqft per hour baseline for 2-3 crew
  }

  if (input.serviceType === 'crack_filling' || input.serviceType === 'combo_driveway' || input.serviceType === 'combo_parkinglot') {
    const lf = input.crackLinearFeet || 0;
    if (lf > 0) {
      const crack = computeCrackFill(lf, { crackBox: input.crackBoxPricePer30lb, propaneTank: input.propanePerTank }, DEFAULTS.crackFillRatePerFoot);
      materials = materials.concat(crack.items);
      baseSellFromTasks += crack.sellPrice;
      projectDescription += `Crack filling ${lf} linear ft. `;
      laborHours += Math.max(1, lf / 100); // 1 hr per 100 ft
    }
  }

  if (input.serviceType === 'patching' || input.serviceType === 'combo_driveway' || input.serviceType === 'combo_parkinglot') {
    const patchSqft = input.patchSquareFeet || 0;
    if (patchSqft > 0) {
      const patch = computePatching(patchSqft, DEFAULTS.patchingPerSqft);
      baseSellFromTasks += patch.sellPrice;
      projectDescription += `Patching ${patchSqft} sq ft. `;
      laborHours += Math.max(1, patchSqft / 400); // 400 sqft/hr baseline
    }
  }

  if (input.serviceType === 'line_striping' || input.serviceType === 'combo_parkinglot') {
    const params = {
      numStandardStalls: input.numStandardStalls || 0,
      numDoubleStalls: input.numDoubleStalls || 0,
      numHandicapSpots: input.numHandicapSpots || 0,
      hasCrosswalks: input.hasCrosswalks || false,
      numArrows: input.numArrows || 0
    };
    const strip = computeStriping(params, DEFAULTS.lineCostPerLinearFoot);
    baseSellFromTasks += strip.sellPrice;
    projectDescription += `Line striping ~${strip.linearFeet} LF with extras. `;
    laborHours += Math.max(1, strip.linearFeet / 300); // baseline productivity
  }

  // Labor cost (cost basis)
  const laborResult = computeLabor(input, laborHours);
  labor.push(laborResult.item);

  // Equipment & Fuel
  const fuel = computeFuelAndEquipment(input, concentrateGallons);
  equipmentAndFuel.push(...fuel.items);

  // Subtotal of cost-basis materials + labor + equipment + mobilization
  const materialsCost = materials.reduce((sum, m) => sum + m.cost, 0);
  const laborCost = labor.reduce((sum, i) => sum + i.cost, 0);
  const equipmentFuelCost = equipmentAndFuel.reduce((sum, i) => sum + i.cost, 0);
  const mobilizationCost = mobilization.reduce((sum, i) => sum + i.cost, 0);

  // Selling price: use baseSellFromTasks as market-rate revenue for crack/patch/striping; add materials at cost + labor + equipment + mobilization for sealcoat portion; then apply overhead & profit
  let subtotal = materialsCost + laborCost + equipmentFuelCost + mobilizationCost + baseSellFromTasks;

  subtotal = roundToTwo(subtotal);

  const overhead: EstimateBreakdownItem = { label: 'Overhead (10%)', cost: roundToTwo(subtotal * DEFAULTS.overheadPct) };
  const profit: EstimateBreakdownItem = { label: 'Profit (18%)', cost: roundToTwo((subtotal + overhead.cost) * DEFAULTS.profitPct) };
  const total = roundToTwo(subtotal + overhead.cost + profit.cost);

  const totalWith25PctMarkup = roundToTwo(total * 1.25);

  const roundedTotal = Math.ceil(total / 10) * 10;
  const impliedMarkupPct = total === 0 ? 0 : roundToTwo(((roundedTotal - total) / total) * 100);
  const roundedPlus25Pct = Math.ceil((roundedTotal * 1.25) / 10) * 10;

  // Transport load check
  let transportLoad: EstimateOutput['transportLoad'];
  if (input.includeTransportWeightCheck && concentrateGallons > 0) {
    transportLoad = computeTransportLoad(concentrateGallons);
  }

  // Invoice notes
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
    overhead,
    profit,
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