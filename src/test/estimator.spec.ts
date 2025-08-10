import { describe, it, expect } from 'vitest';
import { computeSealcoatMaterials, computeCrackFill, computeStriping, computeFuelAndEquipment, computeTransportLoad } from '@/lib/estimator';

describe('estimator helpers', () => {
  it('computes sealcoat materials with water and sand', () => {
    const res = computeSealcoatMaterials(7600, 1, { pmm: 3.65, sandBag: 10, fastDry5Gal: 50, prepSeal5Gal: 50 }, 0);
    expect(res.concentrateGallons).toBeGreaterThan(0);
    expect(res.sandBags).toBeGreaterThanOrEqual(1);
    expect(res.waterGallons).toBeGreaterThan(0);
  });

  it('computes crack fill boxes', () => {
    const res = computeCrackFill(300, { crackBox: 44.99, propaneTank: 10 }, 1.75);
    expect(res.items[0].quantity).toBeGreaterThanOrEqual(2);
    expect(res.sellPrice).toBeCloseTo(525, 0);
  });

  it('computes striping with extras and color delta', () => {
    const res = computeStriping({ numStandardStalls: 10, numDoubleStalls: 0, numHandicapSpots: 2, hasCrosswalks: false, numArrows: 1, numCrosswalks: 3, paintColor: 'blue' }, 0.9);
    expect(res.linearFeet).toBe(200);
    expect(res.sellPrice).toBeGreaterThan(0);
  });

  it('computes fuel with mpg degradation', () => {
    const cost = computeFuelAndEquipment({
      serviceType: 'sealcoating',
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

  it('computes transport load with sand and water', () => {
    const load = computeTransportLoad(200, 12, 40);
    expect(load.totalWeightLbs).toBeGreaterThan(0);
    expect(load.notes).toContain('sand');
  });
});