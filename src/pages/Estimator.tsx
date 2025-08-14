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
import { computeRoundTripMilesBetween, reverseGeocode } from '@/lib/geo';
import { searchAddressCandidates, type AddressCandidate } from '@/lib/geo';
import { saveJob, listJobs, type StoredJob } from '@/services/jobs';
import { listCustomers, saveCustomer, type Customer } from '@/services/customers';
import { exportInvoicePDF, exportJobsCSV, exportCustomersCSV, downloadTextFile } from '@/services/exporters';
import RealMapComponent from '@/components/map/RealMapComponent';
import { geocodeAddress } from '@/lib/geo';
import { listProjects, saveProject, type Project } from '@/services/projects';
import { addChangeOrder } from '@/services/projects';

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
    numCrosswalks: 0,
    paintColor: 'yellow',
  });
  const [jobAddress, setJobAddress] = useState(BUSINESS_PROFILE.address.full);
  const [addressSearch, setAddressSearch] = useState('');
  const [addressCandidates, setAddressCandidates] = useState<AddressCandidate[]>([]);
  const [showCandidates, setShowCandidates] = useState(false);
  const [jobStreet, setJobStreet] = useState('');
  const [jobCity, setJobCity] = useState('');
  const [jobState, setJobState] = useState('');
  const [jobZip, setJobZip] = useState('');
  const [jobCoords, setJobCoords] = useState<{lat:number; lon:number} | null>(null);
  const [supplierCoords, setSupplierCoords] = useState<{lat:number; lon:number} | null>(null);
  const [roundTripMilesSupplier, setRoundTripMilesSupplier] = useState(BUSINESS_PROFILE.travelDefaults.roundTripMilesSupplier); // Stuart, VA ↔ Madison, NC approx
  const [roundTripMilesJob, setRoundTripMilesJob] = useState(0); // default same as business if unknown
  const [fuelPrice, setFuelPrice] = useState(DEFAULT_FUEL_PRICE);
  const [legBased, setLegBased] = useState(false);
  const [legC30Total, setLegC30Total] = useState<number | ''>('');
  const [legC30Loaded, setLegC30Loaded] = useState<number | ''>('');
  const [legDakotaTotal, setLegDakotaTotal] = useState<number | ''>('');

  const [laborRate, setLaborRate] = useState(BUSINESS_PROFILE.crew.hourlyRatePerPerson);
  const [numFullTime, setNumFullTime] = useState(BUSINESS_PROFILE.crew.numFullTime);
  const [numPartTime, setNumPartTime] = useState(BUSINESS_PROFILE.crew.numPartTime);

  const [sealerActiveHours, setSealerActiveHours] = useState(0);
  const [excessiveIdleHours, setExcessiveIdleHours] = useState(0);
  const [includeWeightCheck, setIncludeWeightCheck] = useState(true);

  const [pmmPrice, setPmmPrice] = useState(BUSINESS_PROFILE.materials.pmmPricePerGallon);

  const [notes, setNotes] = useState('');

  const [jobs, setJobs] = useState<StoredJob[]>(listJobs());
  const [jobName, setJobName] = useState('');
  const [customers, setCustomers] = useState<Customer[]>(listCustomers());
  const [customerName, setCustomerName] = useState('');
  const [projects, setProjects] = useState<Project[]>(listProjects());
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [arrowCounts, setArrowCounts] = useState<Record<string, number>>({});
  const [textCounts, setTextCounts] = useState<Record<string, number>>({});

  // React to business profile changes
  useMemo(() => {
    setRoundTripMilesSupplier(profile.travelDefaults.roundTripMilesSupplier);
    setLaborRate(profile.crew.hourlyRatePerPerson);
    setNumFullTime(profile.crew.numFullTime);
    setNumPartTime(profile.crew.numPartTime);
    setPmmPrice(profile.materials.pmmPricePerGallon);
    // Precompute supplier coords once
    (async () => {
      const sup = await geocodeAddress(BUSINESS_PROFILE.supplier.address.full);
      if (sup) setSupplierCoords(sup);
    })();
  }, [profile]);

  const estimateInput: EstimateInput = useMemo(() => ({
    serviceType,
    sealcoatSquareFeet: Number(params.sealcoatSquareFeet) || 0,
    patchSquareFeet: Number(params.patchSquareFeet) || 0,
    crackLinearFeet: Number(params.crackLinearFeet) || 0,
    numStandardStalls: Number(params.numStandardStalls) || 0,
    numDoubleStalls: Number(params.numDoubleStalls) || 0,
    numHandicapSpots: Number(params.numHandicapSpots) || 0,
    hasCrosswalks: params.hasCrosswalks || (Number(params.numCrosswalks) || 0) > 0,
    numArrows: (() => {
      const manual = Number(params.numArrows) || 0;
      const sum = Object.values(arrowCounts).reduce((s, n) => s + (Number(n) || 0), 0);
      return sum || manual;
    })(),
    oilSpotSquareFeet: Number(params.oilSpotSquareFeet) || 0,
    surfacePorosityFactor: Number(params.surfacePorosityFactor) || 1,
    numFullTime,
    numPartTime,
    hourlyRatePerPerson: laborRate,
    roundTripMilesSupplier: Number(roundTripMilesSupplier) || 0,
    roundTripMilesJob: Number(roundTripMilesJob) || 0,
    fuelPricePerGallon: Number(fuelPrice) || DEFAULT_FUEL_PRICE,
    legBasedRouting: legBased,
    legC30TotalMiles: typeof legC30Total === 'number' ? legC30Total : undefined,
    legC30LoadedMiles: typeof legC30Loaded === 'number' ? legC30Loaded : undefined,
    legDakotaTotalMiles: typeof legDakotaTotal === 'number' ? legDakotaTotal : undefined,
    sealerActiveHours: Number(sealerActiveHours) || 0,
    excessiveIdleHours: Number(excessiveIdleHours) || 0,
    pmmPricePerGallon: Number(pmmPrice) || BUSINESS_PROFILE.materials.pmmPricePerGallon,
    sandPricePer50lbBag: BUSINESS_PROFILE.materials.sandPricePer50lbBag,
    fastDryPricePer5Gal: BUSINESS_PROFILE.materials.fastDryPricePer5Gal,
    prepSealPricePer5Gal: BUSINESS_PROFILE.materials.prepSealPricePer5Gal,
    crackBoxPricePer30lb: BUSINESS_PROFILE.materials.crackBoxPricePer30lb,
    propanePerTank: BUSINESS_PROFILE.materials.propanePerTank,
    includeTransportWeightCheck: includeWeightCheck,
    applySalesTax: (params as any).applySalesTax === true
  }), [serviceType, params, arrowCounts, numFullTime, numPartTime, laborRate, roundTripMilesSupplier, roundTripMilesJob, fuelPrice, legBased, legC30Total, legC30Loaded, legDakotaTotal, pmmPrice, includeWeightCheck, sealerActiveHours, excessiveIdleHours]);

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
    if ((params as any).applySalesTax) {
      lines.push(`(Sales tax included in Total)`);
    }
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

  const handleSaveJob = async () => {
    const record = await saveJob({
      name: jobName || `Job ${new Date().toLocaleString()}`,
      address: jobAddress,
      serviceType,
      params: {
        ...params,
        roundTripMilesSupplier,
        roundTripMilesJob,
        fuelPrice,
        legBased,
        legC30Total,
        legC30Loaded,
        legDakotaTotal,
        laborRate,
        numFullTime,
        numPartTime,
        sealerActiveHours,
        excessiveIdleHours,
        includeWeightCheck,
        pmmPrice,
        notes,
        applySalesTax: (params as any).applySalesTax === true,
      },
    });
    setJobs(listJobs());
    setJobName(record.name);
  };

  const handleLoadJob = (j: StoredJob) => {
    setJobName(j.name);
    setJobAddress(j.address);
    setServiceType(j.serviceType as ServiceType);
    setParams(p => ({
      ...p,
      sealcoatSquareFeet: j.params.sealcoatSquareFeet ?? 0,
      patchSquareFeet: j.params.patchSquareFeet ?? 0,
      crackLinearFeet: j.params.crackLinearFeet ?? 0,
      numStandardStalls: j.params.numStandardStalls ?? 0,
      numDoubleStalls: j.params.numDoubleStalls ?? 0,
      numHandicapSpots: j.params.numHandicapSpots ?? 0,
      hasCrosswalks: j.params.hasCrosswalks ?? false,
      numArrows: j.params.numArrows ?? 0,
      oilSpotSquareFeet: j.params.oilSpotSquareFeet ?? 0,
      surfacePorosityFactor: j.params.surfacePorosityFactor ?? 1,
      numCrosswalks: j.params.numCrosswalks ?? 0,
      paintColor: j.params.paintColor ?? 'yellow',
    }));
    setRoundTripMilesSupplier(j.params.roundTripMilesSupplier ?? BUSINESS_PROFILE.travelDefaults.roundTripMilesSupplier);
    setRoundTripMilesJob(j.params.roundTripMilesJob ?? 0);
    setFuelPrice(j.params.fuelPrice ?? DEFAULT_FUEL_PRICE);
    setLegBased(!!j.params.legBased);
    setLegC30Total(j.params.legC30Total ?? '');
    setLegC30Loaded(j.params.legC30Loaded ?? '');
    setLegDakotaTotal(j.params.legDakotaTotal ?? '');
    setLaborRate(j.params.laborRate ?? BUSINESS_PROFILE.crew.hourlyRatePerPerson);
    setNumFullTime(j.params.numFullTime ?? BUSINESS_PROFILE.crew.numFullTime);
    setNumPartTime(j.params.numPartTime ?? BUSINESS_PROFILE.crew.numPartTime);
    setSealerActiveHours(j.params.sealerActiveHours ?? 0);
    setExcessiveIdleHours(j.params.excessiveIdleHours ?? 0);
    setIncludeWeightCheck(!!j.params.includeWeightCheck);
    setPmmPrice(j.params.pmmPrice ?? BUSINESS_PROFILE.materials.pmmPricePerGallon);
    setNotes(j.params.notes ?? '');
    setParams(p => ({ ...p, applySalesTax: !!(j as any).params?.applySalesTax }));
  };

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const addr = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      if (addr) setJobAddress(addr);
      setJobStreet(''); setJobCity(''); setJobState(''); setJobZip('');
      setJobCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    });
  };

  const composeStructuredAddress = () => {
    const parts = [jobStreet, jobCity, jobState, jobZip].map(s => (s||'').trim()).filter(Boolean);
    return parts.join(', ');
  };

  const handleStructuredAddressBlur = async () => {
    const full = composeStructuredAddress();
    if (full) {
      setJobAddress(full);
      const res = await geocodeAddress(full);
      setJobCoords(res);
    }
  };

  const handleSaveCustomer = async () => {
    if (!customerName || !jobAddress) return;
    await saveCustomer({ name: customerName, address: jobAddress, notes: '' });
    setCustomers(listCustomers());
  };

  const handleConvertToProject = async () => {
    const record = await saveProject({
      name: jobName || `Project ${new Date().toLocaleString()}`,
      address: jobAddress,
      status: 'planned',
      serviceType,
      estimate: result,
    });
    setProjects(listProjects());
    setJobName(record.name);
    setCurrentProjectId(record.id);
  };

  const handleAddChangeOrder = async () => {
    if (!currentProjectId) return;
    await addChangeOrder(currentProjectId, `${textInvoice}\n\n${textInvoice25}\n\n${textInvoiceRounded}`);
    setProjects(listProjects());
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <Label>Job name</Label>
                  <Input value={jobName} onChange={e => setJobName(e.target.value)} placeholder="Customer/Location" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={handleSaveJob}>Save Job</Button>
                  <Button type="button" onClick={() => navigator.clipboard.writeText(textInvoice)}>Copy Invoice</Button>
                  <Button type="button" variant="outline" onClick={() => {
                    const all = `${textInvoice}\n\n${textInvoice25}\n\n${textInvoiceRounded}`;
                    navigator.clipboard.writeText(all);
                  }}>Copy All</Button>
                  <Button type="button" variant="outline" onClick={() => {
                    const all = `${textInvoice}\n\n${textInvoice25}\n\n${textInvoiceRounded}`;
                    const blob = new Blob([all], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${jobName || 'invoice'}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>Download .txt</Button>
                </div>
              </div>

              <div>
                <Label>Address (structured)</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Input placeholder="Street" value={jobStreet} onChange={e => setJobStreet(e.target.value)} onBlur={handleStructuredAddressBlur} />
                  <Input placeholder="City" value={jobCity} onChange={e => setJobCity(e.target.value)} onBlur={handleStructuredAddressBlur} />
                  <Input placeholder="State" value={jobState} onChange={e => setJobState(e.target.value)} onBlur={handleStructuredAddressBlur} />
                  <Input placeholder="ZIP" value={jobZip} onChange={e => setJobZip(e.target.value)} onBlur={handleStructuredAddressBlur} />
                </div>
                <div className="mt-2">
                  <Label className="text-xs text-muted-foreground">Full Address</Label>
                  <Input
                    value={addressSearch || jobAddress}
                    onChange={async (e) => {
                      const v = e.target.value;
                      setAddressSearch(v);
                      setShowCandidates(true);
                      const c = await searchAddressCandidates(v, 5);
                      setAddressCandidates(c);
                    }}
                    onBlur={async () => {
                      // On blur, if user typed custom, set and geocode
                      const full = addressSearch || jobAddress;
                      setJobAddress(full);
                      const res = await geocodeAddress(full);
                      setJobCoords(res);
                      setTimeout(() => setShowCandidates(false), 150);
                    }}
                    onFocus={() => setShowCandidates(true)}
                  />
                  {showCandidates && addressCandidates.length > 0 && (
                    <div className="mt-1 border border-border/40 rounded bg-background shadow-lg max-h-48 overflow-auto">
                      {addressCandidates.map((c, idx) => (
                        <div
                          key={idx}
                          className="px-2 py-1 text-sm hover:bg-accent cursor-pointer"
                          onMouseDown={() => {
                            setJobAddress(c.displayName);
                            setAddressSearch('');
                            setAddressCandidates([]);
                            setShowCandidates(false);
                            setJobCoords({ lat: c.lat, lon: c.lon });
                          }}
                        >
                          {c.displayName}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">Use My Location will override structured fields.</div>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button type="button" variant="outline" onClick={handleUseMyLocation}>Use My Location</Button>
                  <Button type="button" variant="outline" onClick={handleComputeJobMiles}>Auto Miles</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <Label>Presets</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Button type="button" size="sm" variant="outline" onClick={() => {
                      setServiceType('combo_driveway');
                      setParams(p => ({ ...p, sealcoatSquareFeet: 2500, patchSquareFeet: 50, crackLinearFeet: 120 }));
                    }}>Driveway</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => {
                      setServiceType('combo_parkinglot');
                      setParams(p => ({ ...p, sealcoatSquareFeet: 18000, patchSquareFeet: 200, crackLinearFeet: 800, numStandardStalls: 90, numDoubleStalls: 10 }));
                    }}>Parking Lot</Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Service</Label>
                  <Select value={serviceType} onValueChange={(v) => setServiceType(v as ServiceType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sealcoating">Sealcoating</SelectItem>
                      <SelectItem value="crack_filling">Crack Filling</SelectItem>
                      <SelectItem value="patching">Patching</SelectItem>
                      <SelectItem value="line_striping">Line Striping</SelectItem>
                      <SelectItem value="combo_driveway">Driveway Combo</SelectItem>
                      <SelectItem value="combo_parkinglot">Parking Lot Combo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stall size</Label>
                  <Select value={(params as any).stallSize || 'standard'} onValueChange={(v) => setParams(p => ({ ...p, stallSize: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Paint color</Label>
                  <Select value={params.paintColor} onValueChange={(v) => setParams(p => ({ ...p, paintColor: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(BUSINESS_PROFILE.pricing.paintColors ?? ['yellow','white','blue']).map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Sealcoat sq ft</Label>
                  <Input type="number" min={0} value={params.sealcoatSquareFeet} onChange={e => setParams(p => ({ ...p, sealcoatSquareFeet: Math.max(0, Number(e.target.value) || 0) }))} />
                </div>
                <div>
                  <Label>Patch sq ft</Label>
                  <Input type="number" min={0} value={params.patchSquareFeet} onChange={e => setParams(p => ({ ...p, patchSquareFeet: Math.max(0, Number(e.target.value) || 0) }))} />
                </div>
                <div>
                  <Label>Crack LF</Label>
                  <Input type="number" min={0} value={params.crackLinearFeet} onChange={e => setParams(p => ({ ...p, crackLinearFeet: Math.max(0, Number(e.target.value) || 0) }))} />
                </div>
                <div>
                  <Label>Oil spots area (sq ft)</Label>
                  <div className="flex gap-2">
                    <Input type="number" min={0} value={params.oilSpotSquareFeet} onChange={e => setParams(p => ({ ...p, oilSpotSquareFeet: Math.max(0, Number(e.target.value) || 0) }))} />
                    <Button type="button" variant="outline" onClick={() => {
                      const m = (window as any).mapMethods;
                      // If OverWatch map exposes last polygon area in m.lastAreaSqFt, use it
                      const area = (m?.lastAreaSqFt || 0);
                      if (area > 0) setParams(p => ({ ...p, oilSpotSquareFeet: Math.round(area) }));
                    }}>Use map</Button>
                  </div>
                </div>
                <div>
                  <Label>Crack hours</Label>
                  <Input type="number" step="0.5" min={0} onBlur={e => setParams(p => ({ ...p, crackHours: Math.max(0, Number(e.target.value) || 0) }))} />
                </div>
                <div>
                  <Label>Propane $/hr</Label>
                  <Input type="number" step="0.01" min={0} onBlur={e => setParams(p => ({ ...p, propaneCostPerHour: Math.max(0, Number(e.target.value) || 0) }))} />
                </div>
                <div>
                  <Label>Standard stalls</Label>
                  <Input type="number" value={params.numStandardStalls} onChange={e => setParams(p => ({ ...p, numStandardStalls: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Double stalls</Label>
                  <Input type="number" value={params.numDoubleStalls} onChange={e => setParams(p => ({ ...p, numDoubleStalls: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Handicap spots</Label>
                  <Input type="number" value={params.numHandicapSpots} onChange={e => setParams(p => ({ ...p, numHandicapSpots: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Crosswalks count</Label>
                  <Input type="number" value={params.numCrosswalks} onChange={e => setParams(p => ({ ...p, numCrosswalks: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Stop bars</Label>
                  <Input type="number" value={(params as any).numStopBars || 0} onChange={e => setParams(p => ({ ...p, numStopBars: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Text stencils</Label>
                  <Input type="number" value={(params as any).numTextStencils || 0} onChange={e => setParams(p => ({ ...p, numTextStencils: Number(e.target.value) }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <Label>Round trip miles (supplier)</Label>
                  <div className="flex gap-2">
                    <Input type="number" min={0} value={roundTripMilesSupplier} onChange={e => setRoundTripMilesSupplier(Math.max(0, Number(e.target.value) || 0))} />
                    <Button type="button" variant="outline" onClick={handleComputeSupplierMiles}>Auto</Button>
                  </div>
                </div>
                <div>
                  <Label>Round trip miles (job)</Label>
                  <div className="flex gap-2">
                    <Input type="number" min={0} value={roundTripMilesJob} onChange={e => setRoundTripMilesJob(Math.max(0, Number(e.target.value) || 0))} />
                    <Button type="button" variant="outline" onClick={handleComputeJobMiles}>Auto</Button>
                  </div>
                </div>
                <div>
                  <Label>Fuel price $/gal</Label>
                  <Input type="number" step="0.01" min={0} value={fuelPrice} onChange={e => setFuelPrice(Math.max(0, Number(e.target.value) || 0))} />
                </div>
                <div>
                  <Label>Trailer MPG modifier (%)</Label>
                  <Input type="number" step="1" placeholder="e.g., -10 for -10%" onBlur={e => setParams(p => ({ ...p, trailerMpgModifierPct: (Number(e.target.value) || 0) / 100 }))} />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Label>Leg-based routing</Label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                    <Select value={legBased ? 'yes' : 'no'} onValueChange={v => setLegBased(v === 'yes')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">Disabled</SelectItem>
                        <SelectItem value="yes">Enabled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input disabled={!legBased} placeholder="C30 total miles" value={legC30Total} onChange={e => setLegC30Total(Number(e.target.value) || '')} />
                    <Input disabled={!legBased} placeholder="C30 loaded miles" value={legC30Loaded} onChange={e => setLegC30Loaded(Number(e.target.value) || '')} />
                    <Input disabled={!legBased} placeholder="Dakota total miles" value={legDakotaTotal} onChange={e => setLegDakotaTotal(Number(e.target.value) || '')} />
                  </div>
                </div>
                <div>
                  <Label>Application method</Label>
                  <Select value={(params as any).applicationMethod || 'spray'} onValueChange={(v) => setParams(p => ({ ...p, applicationMethod: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spray">Spray</SelectItem>
                      <SelectItem value="squeegee">Squeegee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>PMM price $/gal</Label>
                  <div className="flex gap-2">
                    <Input type="number" step="0.01" value={pmmPrice} onChange={e => setPmmPrice(Math.max(0, Number(e.target.value) || 0))} />
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
                <div>
                  <Label>Transport weight check</Label>
                  <Select value={includeWeightCheck ? 'yes' : 'no'} onValueChange={(v) => setIncludeWeightCheck(v === 'yes')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Include</SelectItem>
                      <SelectItem value="no">Exclude</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Apply sales tax</Label>
                  <Select value={(params as any).applySalesTax ? 'yes' : 'no'} onValueChange={(v) => setParams(p => ({ ...p, applySalesTax: v === 'yes' }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Sealcoat coats</Label>
                  <Select value={String((params as any).multiCoat || 1)} onValueChange={(v) => setParams(p => ({ ...p, multiCoat: Number(v) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Waste factor (%)</Label>
                  <Input type="number" step="1" placeholder="e.g., 5" onBlur={e => setParams(p => ({ ...p, wasteFactorPct: (Number(e.target.value) || 0) / 100 }))} />
                </div>
                <div>
                  <Label>Tack coat / Additives</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={(params as any).tackCoat ? 'yes' : 'no'} onValueChange={(v) => setParams(p => ({ ...p, tackCoat: v === 'yes' }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Tack</SelectItem>
                        <SelectItem value="no">No tack</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={(params as any).additives ? 'yes' : 'no'} onValueChange={(v) => setParams(p => ({ ...p, additives: v === 'yes' }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Additives</SelectItem>
                        <SelectItem value="no">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {(serviceType === 'line_striping' || serviceType === 'combo_parkinglot') && (
                <div className="mt-2">
                  <Label>Stencil Catalog</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Arrows</div>
                      {(BUSINESS_PROFILE.pricing.stencilCatalog?.arrows.types || []).map(t => (
                        <div key={t} className="flex items-center gap-2">
                          <span className="w-24 capitalize">{t}</span>
                          <Input type="number" min={0} value={arrowCounts[t] || 0} onChange={e => setArrowCounts(prev => ({ ...prev, [t]: Math.max(0, Number(e.target.value) || 0) }))} />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Text</div>
                      {(BUSINESS_PROFILE.pricing.stencilCatalog?.text.items || []).map(it => (
                        <div key={it} className="flex items-center gap-2">
                          <span className="w-32">{it}</span>
                          <Input type="number" min={0} value={textCounts[it] || 0} onChange={e => {
                            const n = Math.max(0, Number(e.target.value) || 0);
                            setTextCounts(prev => ({ ...prev, [it]: n }));
                            const total = Object.values({ ...textCounts, [it]: n }).reduce((s, v) => s + (Number(v) || 0), 0);
                            setParams(p => ({ ...p, numTextStencils: total }));
                          }} />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Handicap Symbols</div>
                      <div className="flex items-center gap-2">
                        <span className="w-24">Count</span>
                        <Input type="number" min={0} value={params.numHandicapSpots} onChange={e => setParams(p => ({ ...p, numHandicapSpots: Math.max(0, Number(e.target.value) || 0) }))} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label>Additional notes</Label>
                <Textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <Label>Customer name</Label>
                  <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer name" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={handleSaveCustomer}>Save to address book</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle>Route Preview</CardTitle>
              <CardDescription>Supplier → Job (approximate straight line)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full rounded overflow-hidden border border-border/30">
                <RealMapComponent
                  center={jobCoords ? [jobCoords.lon, jobCoords.lat] : [-74.006, 40.7128]}
                  zoom={jobCoords ? 10 : 3}
                  styleUrl={'mapbox://styles/mapbox/streets-v12'}
                >
                  {/* Draw simple line using a GeoJSON source if both coords are present */}
                  {jobCoords && supplierCoords && (
                    (() => {
                      const map = (window as any).mapMethods?.getMap?.();
                      if (map && map.isStyleLoaded()) {
                        const route = {
                          type: 'Feature',
                          geometry: {
                            type: 'LineString',
                            coordinates: [
                              [supplierCoords.lon, supplierCoords.lat],
                              [jobCoords.lon, jobCoords.lat]
                            ]
                          }
                        } as any;
                        const srcId = 'route-preview';
                        if (!map.getSource(srcId)) {
                          map.addSource(srcId, { type: 'geojson', data: route });
                          map.addLayer({ id: 'route-line', type: 'line', source: srcId, paint: { 'line-color': '#22d3ee', 'line-width': 3 } });
                        } else {
                          (map.getSource(srcId) as any).setData(route);
                        }
                      }
                      return null;
                    })()
                  )}
                </RealMapComponent>
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
              <div className="mt-3 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => exportInvoicePDF(`${textInvoice}\n\n${textInvoice25}\n\n${textInvoiceRounded}`, jobName || 'invoice')}>Export PDF</Button>
                <Button type="button" variant="outline" onClick={() => downloadTextFile(exportJobsCSV(jobs), 'jobs.csv', 'text/csv')}>Jobs CSV</Button>
                <Button type="button" variant="outline" onClick={() => downloadTextFile(exportCustomersCSV(customers), 'customers.csv', 'text/csv')}>Customers CSV</Button>
                <Button type="button" onClick={handleConvertToProject}>Convert to Project</Button>
                {currentProjectId && (
                  <Button type="button" variant="outline" onClick={handleAddChangeOrder}>Add as Change Order</Button>
                )}
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Recent Jobs</Label>
                  <div className="mt-2 space-y-2 max-h-64 overflow-auto">
                    {jobs.map(j => (
                      <div key={j.id} className="flex items-center justify-between p-2 rounded border border-border/30">
                        <div className="text-sm">
                          <div className="font-medium">{j.name}</div>
                          <div className="text-muted-foreground">{new Date(j.updatedAt).toLocaleString()}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => handleLoadJob(j)}>Load</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Projects</Label>
                  <div className="mt-2 space-y-2 max-h-64 overflow-auto">
                    {projects.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded border border-border/30">
                        <div className="text-sm">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-muted-foreground">{p.status}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => setJobAddress(p.address)}>Use Address</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Address Book</Label>
                  <div className="mt-2 space-y-2 max-h-64 overflow-auto">
                    {customers.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-2 rounded border border-border/30">
                        <div className="text-sm">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-muted-foreground">{c.address}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => setJobAddress(c.address)}>Use</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Estimator;