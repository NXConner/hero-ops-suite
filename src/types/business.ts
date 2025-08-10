export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  full: string; // cached full string for convenience
}

export interface Supplier {
  name: string;
  address: Address;
}

export interface CrewDefaults {
  numFullTime: number;
  numPartTime: number;
  hourlyRatePerPerson: number;
}

export interface MaterialPrices {
  pmmPricePerGallon: number; // default price
  pmmBulkPricePerGallon: number; // bulk reference (note: provided may be higher)
  sandPricePer50lbBag: number;
  fastDryPricePer5Gal: number;
  prepSealPricePer5Gal: number;
  crackBoxPricePer30lb: number;
  propanePerTank: number;
}

export interface MixGuidelines {
  waterPercent: number; // e.g., 0.2
  sandBagsPer100GalConcentrate: number; // e.g., 6
  fastDryGalPer125GalConcentrate: number; // e.g., 2
}

export interface CoverageRates {
  mixedSealerCoverageSqftPerGal: number; // e.g., 76
  prepSealCoverageSqftPerGal: number; // e.g., 175
}

export interface PricingBaselines {
  crackFillRatePerFoot: number; // e.g., 1.75
  patchingPerSqft: number; // e.g., 3.5
  lineCostPerLinearFoot: number; // e.g., 0.9
  mobilizationFee: number; // e.g., 250
  overheadPct: number; // e.g., 0.10
  profitPct: number; // e.g., 0.18
  handicapSymbolCost?: number; // e.g., 40
  arrowCost?: number; // e.g., 15
  crosswalkCost?: number; // e.g., 60
  stopBarCost?: number; // e.g., 25
  textStencilCost?: number; // e.g., 15
  paintColors?: string[]; // optional available paint colors
  paintColorCostDelta?: Record<string, number>; // per-color cost delta per LF
  patchingHotPerSqft?: number; // baseline at 2"
  patchingColdPerSqft?: number; // baseline at 2"
  salesTaxPct?: number; // optional sales tax
}

export interface FuelAssumptions {
  c30MpgLoaded: number; // e.g., 12
  dakotaMpg: number; // e.g., 17
  equipmentActiveFuelGph: number; // e.g., 2
  excessiveIdleCostPerHour: number; // e.g., 50
  defaultFuelPricePerGallon: number; // e.g., 3.14
  mpgDegradeLoadedPct?: number; // e.g., 0.1 reduce mpg by 10% when towing/loaded
}

export interface VehicleSpec {
  name: string;
  curbWeightLbs?: number;
  gvwrMinLbs?: number;
  mpgLoaded?: number;
  mpg?: number;
}

export interface EquipmentSpec {
  name: string;
  emptyWeightLbs?: number;
  capacityGallons?: number;
  sealerWeightPerGallonLbs?: number;
}

export interface TrailerSpec {
  name: string;
  lengthFt?: number;
  type?: string;
  notes?: string;
}

export interface BusinessProfile {
  businessName?: string;
  address: Address;
  supplier: Supplier;
  materials: MaterialPrices;
  mix: MixGuidelines;
  coverage: CoverageRates;
  pricing: PricingBaselines;
  fuel: FuelAssumptions;
  crew: CrewDefaults;
  vehicles: {
    c30: VehicleSpec;
    dakota: VehicleSpec;
  };
  equipment: {
    sealmasterSk550: EquipmentSpec;
  };
  trailers: TrailerSpec[];
  travelDefaults: {
    roundTripMilesSupplier: number;
  };
}