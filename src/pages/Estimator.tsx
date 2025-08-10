import { useMemo, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { EstimateInput, ServiceType } from '@/lib/estimator';
import { buildEstimate } from '@/lib/estimator';
import { BUSINESS_PROFILE } from '@/data/business';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { computeRoundTripMilesBetween } from '@/lib/geo';

const DEFAULT_FUEL_PRICE = 3.14; // EIA default; editable

const Estimator = () => {
  const { profile } = useBusinessProfile();
  const [serviceType, setServiceType] = useState<ServiceType>('sealcoating');
  const [params, setParams] = useState({
    sealcoatSquareFeet: 0,
    patchSquareFeet: 0,
    crackLinearFeet: 0,
    numStandardStalls: 0,
    numDoubleStalls: 0,
    numHandicapSpots: 0,
    hasCrosswalks: false,
    numArrows: 0,
    oilSpotSquareFeet: 0,
    surfacePorosityFactor: 1,
  });
  const [jobAddress, setJobAddress] = useState(BUSINESS_PROFILE.address.full);
  const [roundTripMilesSupplier, setRoundTripMilesSupplier] = useState(BUSINESS_PROFILE.travelDefaults.roundTripMilesSupplier); // Stuart, VA ↔ Madison, NC approx
  const [roundTripMilesJob, setRoundTripMilesJob] = useState(0); // default same as business if unknown
  const [fuelPrice, setFuelPrice] = useState(DEFAULT_FUEL_PRICE);

  const [laborRate, setLaborRate] = useState(BUSINESS_PROFILE.crew.hourlyRatePerPerson);
  const [numFullTime, setNumFullTime] = useState(BUSINESS_PROFILE.crew.numFullTime);
  const [numPartTime, setNumPartTime] = useState(BUSINESS_PROFILE.crew.numPartTime);

  const [sealerActiveHours, setSealerActiveHours] = useState(0);
  const [excessiveIdleHours, setExcessiveIdleHours] = useState(0);

  const [pmmPrice, setPmmPrice] = useState(BUSINESS_PROFILE.materials.pmmPricePerGallon);

  const [notes, setNotes] = useState('');

  // React to business profile changes
  useMemo(() => {
    setRoundTripMilesSupplier(profile.travelDefaults.roundTripMilesSupplier);
    setLaborRate(profile.crew.hourlyRatePerPerson);
    setNumFullTime(profile.crew.numFullTime);
    setNumPartTime(profile.crew.numPartTime);
    setPmmPrice(profile.materials.pmmPricePerGallon);
  }, [profile]);

  const estimateInput: EstimateInput = useMemo(() => ({
    serviceType,
    sealcoatSquareFeet: Number(params.sealcoatSquareFeet) || 0,
    patchSquareFeet: Number(params.patchSquareFeet) || 0,
    crackLinearFeet: Number(params.crackLinearFeet) || 0,
    numStandardStalls: Number(params.numStandardStalls) || 0,
    numDoubleStalls: Number(params.numDoubleStalls) || 0,
    numHandicapSpots: Number(params.numHandicapSpots) || 0,
    hasCrosswalks: params.hasCrosswalks,
    numArrows: Number(params.numArrows) || 0,
    oilSpotSquareFeet: Number(params.oilSpotSquareFeet) || 0,
    surfacePorosityFactor: Number(params.surfacePorosityFactor) || 1,
    numFullTime,
    numPartTime,
    hourlyRatePerPerson: laborRate,
    roundTripMilesSupplier: Number(roundTripMilesSupplier) || 0,
    roundTripMilesJob: Number(roundTripMilesJob) || 0,
    fuelPricePerGallon: Number(fuelPrice) || DEFAULT_FUEL_PRICE,
    sealerActiveHours: Number(sealerActiveHours) || 0,
    excessiveIdleHours: Number(excessiveIdleHours) || 0,
    pmmPricePerGallon: Number(pmmPrice) || BUSINESS_PROFILE.materials.pmmPricePerGallon,
    sandPricePer50lbBag: BUSINESS_PROFILE.materials.sandPricePer50lbBag,
    fastDryPricePer5Gal: BUSINESS_PROFILE.materials.fastDryPricePer5Gal,
    prepSealPricePer5Gal: BUSINESS_PROFILE.materials.prepSealPricePer5Gal,
    crackBoxPricePer30lb: BUSINESS_PROFILE.materials.crackBoxPricePer30lb,
    propanePerTank: BUSINESS_PROFILE.materials.propanePerTank,
    includeTransportWeightCheck: true
  }), [serviceType, params, numFullTime, numPartTime, laborRate, roundTripMilesSupplier, roundTripMilesJob, fuelPrice, pmmPrice, sealerActiveHours, excessiveIdleHours]);

  const result = useMemo(() => buildEstimate(estimateInput), [estimateInput]);

  const formatMoney = (n: number) => `$${n.toFixed(2)}`;

  const textInvoice = useMemo(() => {
    const lines: string[] = [];
    lines.push(`Project: ${result.projectDescription || serviceType}`);
    lines.push(`Job Address: ${jobAddress}`);
    lines.push('');
    lines.push('Material Costs:');
    result.materials.forEach(m => {
      const qtyPart = m.quantity ? ` x ${m.quantity} ${m.unit || ''}` : '';
      const unitPart = m.unitCost ? ` @ ${formatMoney(m.unitCost)}` : '';
      lines.push(`- ${m.label}${qtyPart}${unitPart}: ${formatMoney(m.cost)}`);
    });
    if (result.mobilization && result.mobilization.length) {
      lines.push('- Mobilization: ' + formatMoney(result.mobilization.reduce((s, i) => s + i.cost, 0)));
    }
    lines.push('');
    lines.push('Labor:');
    result.labor.forEach(l => lines.push(`- ${l.label}: ${formatMoney(l.cost)}${l.notes ? ` (${l.notes})` : ''}`));
    lines.push('');
    lines.push('Equipment & Fuel:');
    result.equipmentAndFuel.forEach(e => lines.push(`- ${e.label}: ${formatMoney(e.cost)}${e.notes ? ` (${e.notes})` : ''}`));
    lines.push('');
    lines.push(`Subtotal: ${formatMoney(result.subtotal)}`);
    lines.push(`${result.overhead.label}: ${formatMoney(result.overhead.cost)}`);
    lines.push(`${result.profit.label}: ${formatMoney(result.profit.cost)}`);
    lines.push(`Total: ${formatMoney(result.total)}`);
    if (result.transportLoad) {
      lines.push('');
      lines.push(`Transport Load: ~${result.transportLoad.totalWeightLbs} lbs. ${result.transportLoad.exceedsLikelyGvwr ? 'Check GVWR!' : ''}`);
      lines.push(result.transportLoad.notes);
    }
    if (notes) {
      lines.push('');
      lines.push('Customer Notes:');
      lines.push(notes);
    }
    lines.push('');
    result.notes.forEach(n => lines.push(`Note: ${n}`));
    return lines.join('\n');
  }, [result, serviceType, jobAddress, notes]);

  const textInvoice25 = useMemo(() => {
    return `Total with 25% markup: ${formatMoney(result.totalWith25PctMarkup)}`;
  }, [result]);

  const textInvoiceRounded = useMemo(() => {
    return `Rounded total to nearest $10: ${formatMoney(result.roundedVariant.roundedTotal)}\nImplied markup: ${result.roundedVariant.impliedMarkupPct}%\nRounded + 25%: ${formatMoney(result.roundedVariant.roundedPlus25Pct)}`;
  }, [result]);

  // Auto-compute supplier RT miles based on business->supplier addresses
  const handleComputeSupplierMiles = async () => {
    const miles = await computeRoundTripMilesBetween(BUSINESS_PROFILE.address.full, BUSINESS_PROFILE.supplier.address.full);
    if (miles && Number.isFinite(miles)) setRoundTripMilesSupplier(miles);
  };

  const handleComputeJobMiles = async () => {
    const miles = await computeRoundTripMilesBetween(BUSINESS_PROFILE.address.full, jobAddress);
    if (miles && Number.isFinite(miles)) setRoundTripMilesJob(miles);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Asphalt Estimator
                </h1>
                <p className="text-muted-foreground mt-1">Generate fast, accurate bids</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>Enter project details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Service</Label>
                  <Select value={serviceType} onValueChange={(v: ServiceType) => setServiceType(v)}>
                    <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Services</SelectLabel>
                        <SelectItem value="sealcoating">Sealcoating</SelectItem>
                        <SelectItem value="crack_filling">Crack Filling</SelectItem>
                        <SelectItem value="patching">Asphalt Patching</SelectItem>
                        <SelectItem value="line_striping">Line Striping</SelectItem>
                        <SelectItem value="combo_driveway">Driveway Combo</SelectItem>
                        <SelectItem value="combo_parkinglot">Parking Lot Combo</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Job address</Label>
                  <Input value={jobAddress} onChange={e => setJobAddress(e.target.value)} />
                </div>
                <div>
                  <Label>Sealcoat sq ft</Label>
                  <Input type="number" value={params.sealcoatSquareFeet} onChange={e => setParams(p => ({ ...p, sealcoatSquareFeet: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Patch sq ft</Label>
                  <Input type="number" value={params.patchSquareFeet} onChange={e => setParams(p => ({ ...p, patchSquareFeet: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Crack feet</Label>
                  <Input type="number" value={params.crackLinearFeet} onChange={e => setParams(p => ({ ...p, crackLinearFeet: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Oil spots sq ft</Label>
                  <Input type="number" value={params.oilSpotSquareFeet} onChange={e => setParams(p => ({ ...p, oilSpotSquareFeet: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Porosity factor</Label>
                  <Input type="number" step="0.1" value={params.surfacePorosityFactor} onChange={e => setParams(p => ({ ...p, surfacePorosityFactor: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Stalls (single)</Label>
                  <Input type="number" value={params.numStandardStalls} onChange={e => setParams(p => ({ ...p, numStandardStalls: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Stalls (double)</Label>
                  <Input type="number" value={params.numDoubleStalls} onChange={e => setParams(p => ({ ...p, numDoubleStalls: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Handicap spots</Label>
                  <Input type="number" value={params.numHandicapSpots} onChange={e => setParams(p => ({ ...p, numHandicapSpots: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Arrows</Label>
                  <Input type="number" value={params.numArrows} onChange={e => setParams(p => ({ ...p, numArrows: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Crosswalks?</Label>
                  <Select value={params.hasCrosswalks ? 'yes' : 'no'} onValueChange={v => setParams(p => ({ ...p, hasCrosswalks: v === 'yes' }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <Label>Round trip miles (supplier)</Label>
                  <div className="flex gap-2">
                    <Input type="number" value={roundTripMilesSupplier} onChange={e => setRoundTripMilesSupplier(Number(e.target.value))} />
                    <Button type="button" variant="outline" onClick={handleComputeSupplierMiles}>Auto</Button>
                  </div>
                </div>
                <div>
                  <Label>Round trip miles (job)</Label>
                  <div className="flex gap-2">
                    <Input type="number" value={roundTripMilesJob} onChange={e => setRoundTripMilesJob(Number(e.target.value))} />
                    <Button type="button" variant="outline" onClick={handleComputeJobMiles}>Auto</Button>
                  </div>
                </div>
                <div>
                  <Label>Fuel price $/gal</Label>
                  <Input type="number" step="0.01" value={fuelPrice} onChange={e => setFuelPrice(Number(e.target.value))} />
                </div>
                <div>
                  <Label>PMM price $/gal</Label>
                  <div className="flex gap-2">
                    <Input type="number" step="0.01" value={pmmPrice} onChange={e => setPmmPrice(Number(e.target.value))} />
                    <Select onValueChange={(v) => setPmmPrice(v === 'bulk' ? BUSINESS_PROFILE.materials.pmmBulkPricePerGallon : BUSINESS_PROFILE.materials.pmmPricePerGallon)}>
                      <SelectTrigger className="w-[140px]"><SelectValue placeholder="Preset" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default ${BUSINESS_PROFILE.materials.pmmPricePerGallon.toFixed(2)}</SelectItem>
                        <SelectItem value="bulk">Bulk ${BUSINESS_PROFILE.materials.pmmBulkPricePerGallon.toFixed(2)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Labor rate $/hr per person</Label>
                  <Input type="number" step="0.5" value={laborRate} onChange={e => setLaborRate(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Full-time employees</Label>
                  <Input type="number" value={numFullTime} onChange={e => setNumFullTime(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Part-time employees</Label>
                  <Input type="number" value={numPartTime} onChange={e => setNumPartTime(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Sealer active hours</Label>
                  <Input type="number" step="0.5" value={sealerActiveHours} onChange={e => setSealerActiveHours(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Excessive idle hours</Label>
                  <Input type="number" step="0.5" value={excessiveIdleHours} onChange={e => setExcessiveIdleHours(Number(e.target.value))} />
                </div>
              </div>

              <div>
                <Label>Additional notes</Label>
                <Textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => navigator.clipboard.writeText(textInvoice)}>Copy Invoice</Button>
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(textInvoice + '\n\n' + textInvoice25 + '\n' + textInvoiceRounded)}>Copy All Variants</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle>Invoice Preview</CardTitle>
              <CardDescription>Text-only breakdown for quoting</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-secondary/20 p-4 rounded-md border border-border/30">
{`${textInvoice}

${textInvoice25}

${textInvoiceRounded}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Estimator;