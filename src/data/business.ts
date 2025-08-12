import type { BusinessProfile } from "@/types/business";

export const BUSINESS_PROFILE: BusinessProfile = {
  businessName: undefined,
  address: {
    street: "337 Ayers Orchard Road",
    city: "Stuart",
    state: "VA",
    zip: "24171",
    full: "337 Ayers Orchard Road, Stuart, VA 24171",
  },
  supplier: {
    name: "SealMaster Madison NC",
    address: {
      street: "703 West Decatur Street",
      city: "Madison",
      state: "NC",
      zip: "27025",
      full: "703 West Decatur Street, Madison, NC 27025",
    },
  },
  crew: {
    numFullTime: 2,
    numPartTime: 1,
    hourlyRatePerPerson: 12,
  },
  materials: {
    // Note: both values are provided by the user; default uses 3.65
    pmmPricePerGallon: 3.65,
    pmmBulkPricePerGallon: 3.79,
    sandPricePer50lbBag: 10,
    fastDryPricePer5Gal: 50,
    prepSealPricePer5Gal: 50,
    crackBoxPricePer30lb: 44.99,
    propanePerTank: 10,
  },
  mix: {
    waterPercent: 0.2,
    sandBagsPer100GalConcentrate: 6,
    fastDryGalPer125GalConcentrate: 2,
  },
  coverage: {
    mixedSealerCoverageSqftPerGal: 76,
    prepSealCoverageSqftPerGal: 175,
  },
  pricing: {
    crackFillRatePerFoot: 1.75,
    patchingPerSqft: 3.5,
    lineCostPerLinearFoot: 0.9,
    mobilizationFee: 250,
    overheadPct: 0.1,
    profitPct: 0.18,
    handicapSymbolCost: 40,
    arrowCost: 15,
    crosswalkCost: 60,
    stopBarCost: 25,
    textStencilCost: 15,
    paintColors: ["white", "yellow", "blue"],
    paintColorCostDelta: { blue: 0.05 },
    patchingHotPerSqft: 3.5,
    patchingColdPerSqft: 3.0,
    salesTaxPct: 0,
    stencilCatalog: {
      stalls: [
        { size: "standard", lf: 20 },
        { size: "compact", lf: 18 },
        { size: "truck", lf: 22 },
      ],
      hcSymbol: { sizes: ["small", "standard", "large"], base: 40 },
      arrows: { types: ["straight", "left", "right", "both"], base: 15 },
      text: { items: ["STOP", "FIRE LANE", "NO PARKING"], base: 15 },
    },
  },
  fuel: {
    c30MpgLoaded: 12,
    dakotaMpg: 17,
    equipmentActiveFuelGph: 2,
    excessiveIdleCostPerHour: 50,
    defaultFuelPricePerGallon: 3.14,
    mpgDegradeLoadedPct: 0.1,
  },
  vehicles: {
    c30: {
      name: "1978 Chevy C30 Custom Deluxe (350, 3-speed)",
      curbWeightLbs: 4300,
      gvwrMinLbs: 10000,
      mpgLoaded: 12,
    },
    dakota: {
      name: "1995 Dodge Dakota V6 Magnum (Auto)",
      mpg: 17,
    },
  },
  equipment: {
    sealmasterSk550: {
      name: "SealMaster SK 550 Tank Sealing Machine (Skid Unit)",
      emptyWeightLbs: 1865,
      capacityGallons: 550,
      sealerWeightPerGallonLbs: 10,
    },
  },
  trailers: [
    {
      name: "8ft black utility trailer",
      lengthFt: 8,
      type: "utility",
      notes: "4 crack machines, propane, crack filler, sand, 2 push blowers, LW crack clear, tools",
    },
    {
      name: "10ft black utility trailer",
      lengthFt: 10,
      type: "utility",
      notes: "Similar load as 8ft trailer",
    },
    { name: "8ft white trailer", lengthFt: 8, type: "enclosed" },
    { name: "10ft tilt-back trailer", lengthFt: 10, type: "tilt-back" },
    { name: "12ft heavy duty black trailer", lengthFt: 12, type: "heavy-duty" },
  ],
  travelDefaults: {
    roundTripMilesSupplier: 96, // approx Stuart, VA <-> Madison, NC
  },
};
