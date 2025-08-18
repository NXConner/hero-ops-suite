import { describe, it, expect } from "vitest";
import {
  computeSealcoatMaterials,
  computeCrackFill,
  computeStriping,
  computeFuelAndEquipment,
  computeTransportLoad,
} from "@/lib/estimator";
import { buildEstimate, type EstimateInput } from "@/lib/estimator";
import { importCSVWithMapping } from "@/services/exportImport";

function baseInput(): EstimateInput {
  return {
    serviceType: "sealcoating",
    sealcoatSquareFeet: 3000,
    numFullTime: 2,
    numPartTime: 1,
    hourlyRatePerPerson: 12,
    roundTripMilesSupplier: 10,
    roundTripMilesJob: 10,
    fuelPricePerGallon: 3.14,
    pmmPricePerGallon: 3.65,
    sandPricePer50lbBag: 10,
    fastDryPricePer5Gal: 50,
    prepSealPricePer5Gal: 50,
    crackBoxPricePer30lb: 44.99,
    propanePerTank: 10,
  } as any;
}

describe("estimator helpers", () => {
  it("computes sealcoat materials with water and sand", () => {
    const res = computeSealcoatMaterials(
      7600,
      1,
      { pmm: 3.65, sandBag: 10, fastDry5Gal: 50, prepSeal5Gal: 50 },
      0,
    );
    expect(res.concentrateGallons).toBeGreaterThan(0);
    expect(res.sandBags).toBeGreaterThanOrEqual(1);
    expect(res.waterGallons).toBeGreaterThan(0);
  });

  it("computes crack fill boxes", () => {
    const res = computeCrackFill(300, { crackBox: 44.99, propaneTank: 10 }, 1.75);
    expect(res.items[0].quantity).toBeGreaterThanOrEqual(2);
    expect(res.sellPrice).toBeCloseTo(525, 0);
  });

  it("computes striping with extras and color delta", () => {
    const res = computeStriping(
      {
        numStandardStalls: 10,
        numDoubleStalls: 0,
        numHandicapSpots: 2,
        hasCrosswalks: false,
        numArrows: 1,
        numCrosswalks: 3,
        paintColor: "blue",
      },
      0.9,
    );
    expect(res.linearFeet).toBe(200);
    expect(res.sellPrice).toBeGreaterThan(0);
  });

  it("computes fuel with mpg degradation", () => {
    const cost = computeFuelAndEquipment({
      serviceType: "sealcoating",
      numFullTime: 2,
      numPartTime: 1,
      hourlyRatePerPerson: 12,
      roundTripMilesSupplier: 96,
      roundTripMilesJob: 20,
      fuelPricePerGallon: 3.14,
      pmmPricePerGallon: 3.65,
      sandPricePer50lbBag: 10,
      fastDryPricePer5Gal: 50,
      prepSealPricePer5Gal: 50,
      crackBoxPricePer30lb: 44.99,
      propanePerTank: 10,
      includeTransportWeightCheck: false,
    } as any);
    expect(cost.cost).toBeGreaterThan(0);
  });

  it("computes transport load with sand and water", () => {
    const load = computeTransportLoad(200, 12, 40);
    expect(load.totalWeightLbs).toBeGreaterThan(0);
    expect(load.notes).toContain("sand");
  });

  it("applies sales tax when applySalesTax is true", () => {
    const input = baseInput();
    (input as any).applySalesTax = true;
    const out = buildEstimate(input);
    expect(out.total).toBeGreaterThan(out.subtotal + out.overhead.cost + out.profit.cost - 1);
  });

  it("respects trailer MPG modifier", () => {
    const input = baseInput();
    (input as any).trailerMpgModifierPct = -0.1;
    const outA = buildEstimate(input);
    (input as any).trailerMpgModifierPct = 0.0;
    const outB = buildEstimate(input);
    expect(outA.equipmentAndFuel.reduce((s, i) => s + i.cost, 0)).toBeGreaterThan(
      outB.equipmentAndFuel.reduce((s, i) => s + i.cost, 0),
    );
  });

  it("adds propane by hours to crack cost", () => {
    const input = baseInput();
    input.serviceType = "crack_filling";
    (input as any).crackLinearFeet = 150;
    (input as any).crackHours = 2;
    (input as any).propaneCostPerHour = 10;
    const out = buildEstimate(input);
    const mat = out.materials.find((m) => m.label.includes("Propane (hours)"));
    expect(mat?.cost).toBe(20);
  });

  it("supports leg-based routing fuel costing", () => {
    const input = baseInput();
    (input as any).legBasedRouting = true;
    (input as any).legC30TotalMiles = 100;
    (input as any).legC30LoadedMiles = 60;
    (input as any).legDakotaTotalMiles = 40;
    const out = buildEstimate(input);
    const travel = out.equipmentAndFuel.find((i) => i.label.includes("leg-based"));
    expect(travel).toBeTruthy();
  });

  it("imports CSV with mapping and validation", () => {
    const csv = "id,name,address,notes\n1,Acme,123 Main,VIP";
    const mapping = {
      columns: { id: "id", name: "name", address: "address", notes: "notes" },
    } as any;
    const res = importCSVWithMapping(
      csv,
      mapping,
      (row) => (!row.name || !row.address ? "Missing name or address" : null),
      (row: any) => row,
    );
    expect(res.rows.length).toBe(1);
    expect(res.errors.length).toBe(0);
    expect((res.rows[0] as any).name).toBe("Acme");
  });
});
