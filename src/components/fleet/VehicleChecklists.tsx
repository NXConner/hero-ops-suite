import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { databaseService } from '@/services/database';
import { FileText, Upload, ClipboardCheck, Wrench } from 'lucide-react';

interface VehicleRef {
  id: string;
  name: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface VehicleChecklistRecord {
  id: string;
  vehicleId: string;
  type: 'inspection' | 'maintenance';
  items: ChecklistItem[];
  notes?: string;
  createdAt: string;
}

interface VehicleDocumentRecord {
  id: string;
  vehicleId: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
  category: 'manual' | 'repair-guide' | 'parts-list' | 'receipt' | 'other';
  note?: string;
  uploadedAt: string;
}

type Props = {
  vehicles: VehicleRef[];
};

const DEFAULT_INSPECTION_ITEMS: ChecklistItem[] = [
  { id: 'windshield', label: 'Windshield free of cracks', checked: false },
  { id: 'body-color', label: 'Body panel colors match', checked: false },
  { id: 'magnet', label: 'Magnet adheres to steel body panels', checked: false },
  { id: 'fresh-paint', label: 'No fresh paint concealing rust', checked: false },
  { id: 'panel-seams', label: 'Trunk/hood seams aligned', checked: false },
  { id: 'door-seams', label: 'Door/fender seams aligned', checked: false },
  { id: 'scratches', label: 'Free of body scratches', checked: false },
  { id: 'dents', label: 'Free of body dents', checked: false },
  { id: 'wipers', label: 'Wipers/blades functional', checked: false },
  { id: 'lights', label: 'Lights intact and functional', checked: false },
  { id: 'tire-brand', label: 'Tires are reputable brand', checked: false },
  { id: 'tire-matching', label: 'Tires are same make', checked: false },
  { id: 'tire-cuts', label: 'Tires free of cuts/bubbles/cracks', checked: false },
  { id: 'tread', label: 'Tread worn evenly', checked: false },
  { id: 'spare-tools', label: 'Spare/jack/lug wrench present', checked: false },
  { id: 'spare-inflated', label: 'Spare tire inflated', checked: false },
  { id: 'leaks', label: 'No fluid/oil leaks', checked: false },
  { id: 'filler-neck', label: 'Filler neck clean (no heavy deposits)', checked: false },
  { id: 'battery', label: 'Battery terminals corrosion-free', checked: false },
  { id: 'oil', label: 'Oil dipstick clean (no dark/black oil)', checked: false },
  { id: 'odor', label: 'No odors while running', checked: false },
  { id: 'emissions', label: 'Exhaust not blue/black', checked: false },
  { id: 'rests-level', label: 'Vehicle rests level', checked: false },
  { id: 'suspension-sound', label: 'No creaks when bouncing corners', checked: false },
  { id: 'suspension-even', label: 'All corners respond the same', checked: false },
  { id: 'seats', label: 'Seats unworn / no cracks', checked: false },
  { id: 'doors', label: 'All doors open/close freely', checked: false },
  { id: 'trunk', label: 'Trunk opens/closes freely', checked: false },
  { id: 'scent', label: 'No heavy air freshener scent', checked: false },
  { id: 'gauges', label: 'All gauges work', checked: false },
  { id: 'warnings', label: 'No dash warning lights staying on', checked: false },
  { id: 'stereo', label: 'Stereo works', checked: false },
  { id: 'heater', label: 'Heater works', checked: false },
];

const DEFAULT_MAINTENANCE_ITEMS: ChecklistItem[] = [
  { id: 'oil-change', label: 'Engine oil and filter changed', checked: false },
  { id: 'air-filter', label: 'Air filter replaced/cleaned', checked: false },
  { id: 'cabin-filter', label: 'Cabin filter replaced', checked: false },
  { id: 'coolant', label: 'Coolant level/condition OK', checked: false },
  { id: 'brake-fluid', label: 'Brake fluid level/condition OK', checked: false },
  { id: 'transmission', label: 'Transmission fluid check/service', checked: false },
  { id: 'belts', label: 'Belts inspected', checked: false },
  { id: 'hoses', label: 'Hoses inspected', checked: false },
  { id: 'battery-maint', label: 'Battery tested/terminals cleaned', checked: false },
  { id: 'tire-rotation', label: 'Tires rotated and pressure set', checked: false },
  { id: 'alignment', label: 'Alignment check', checked: false },
  { id: 'brakes', label: 'Brake pads/rotors inspected', checked: false },
  { id: 'suspension', label: 'Suspension/steering inspected', checked: false },
  { id: 'lights-maint', label: 'Exterior/interior lights checked', checked: false },
  { id: 'wipers-maint', label: 'Wiper blades replaced if needed', checked: false },
];

function uid(): string {
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).toLowerCase();
}

const VehicleChecklists: React.FC<Props> = ({ vehicles }) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [inspectionItems, setInspectionItems] = useState<ChecklistItem[]>(DEFAULT_INSPECTION_ITEMS);
  const [maintenanceItems, setMaintenanceItems] = useState<ChecklistItem[]>(DEFAULT_MAINTENANCE_ITEMS);
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [documents, setDocuments] = useState<VehicleDocumentRecord[]>([]);
  const [saving, setSaving] = useState(false);

  const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v.name])), [vehicles]);

  useEffect(() => {
    const vId = vehicles[0]?.id || '';
    setSelectedVehicleId(prev => prev || vId);
  }, [vehicles]);

  useEffect(() => {
    if (!selectedVehicleId) return;
    // Load existing checklists and docs
    (async () => {
      // @ts-ignore - databaseService methods added in service edit
      const [inspections, maints, docs] = await Promise.all([
        // @ts-ignore
        databaseService.getVehicleChecklists(selectedVehicleId, 'inspection'),
        // @ts-ignore
        databaseService.getVehicleChecklists(selectedVehicleId, 'maintenance'),
        // @ts-ignore
        databaseService.getVehicleDocuments(selectedVehicleId),
      ]);

      if (inspections && inspections.length > 0) {
        const latest = inspections.sort((a: VehicleChecklistRecord, b: VehicleChecklistRecord) => b.createdAt.localeCompare(a.createdAt))[0];
        setInspectionItems(latest.items);
        setInspectionNotes(latest.notes || '');
      } else {
        setInspectionItems(DEFAULT_INSPECTION_ITEMS.map(i => ({ ...i })));
        setInspectionNotes('');
      }

      if (maints && maints.length > 0) {
        const latest = maints.sort((a: VehicleChecklistRecord, b: VehicleChecklistRecord) => b.createdAt.localeCompare(a.createdAt))[0];
        setMaintenanceItems(latest.items);
        setMaintenanceNotes(latest.notes || '');
      } else {
        setMaintenanceItems(DEFAULT_MAINTENANCE_ITEMS.map(i => ({ ...i })));
        setMaintenanceNotes('');
      }

      setDocuments(docs || []);
    })();
  }, [selectedVehicleId]);

  const toggleItem = (type: 'inspection' | 'maintenance', id: string, checked: boolean) => {
    if (type === 'inspection') {
      setInspectionItems(prev => prev.map(i => (i.id === id ? { ...i, checked } : i)));
    } else {
      setMaintenanceItems(prev => prev.map(i => (i.id === id ? { ...i, checked } : i)));
    }
  };

  const handleSaveChecklist = async (type: 'inspection' | 'maintenance') => {
    if (!selectedVehicleId) return;
    setSaving(true);
    try {
      const record: VehicleChecklistRecord = {
        id: uid(),
        vehicleId: selectedVehicleId,
        type,
        items: type === 'inspection' ? inspectionItems : maintenanceItems,
        notes: type === 'inspection' ? inspectionNotes : maintenanceNotes,
        createdAt: new Date().toISOString(),
      };
      // @ts-ignore
      await databaseService.saveVehicleChecklist(record);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDocuments = async (files: FileList | null) => {
    if (!files || !selectedVehicleId) return;
    const list: VehicleDocumentRecord[] = [];
    for (const file of Array.from(files)) {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
      });
      list.push({
        id: uid(),
        vehicleId: selectedVehicleId,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        category: 'other',
        uploadedAt: new Date().toISOString(),
      });
    }
    // @ts-ignore
    await databaseService.saveVehicleDocuments(list);
    // @ts-ignore
    const updated = await databaseService.getVehicleDocuments(selectedVehicleId);
    setDocuments(updated || []);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Vehicle</span>
        <select
          className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
          value={selectedVehicleId}
          onChange={(e) => setSelectedVehicleId(e.target.value)}
        >
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>

      <Card className="bg-slate-800 border-cyan-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-300 text-sm flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" /> Inspection Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-56 pr-2">
            <div className="grid grid-cols-1 gap-2">
              {inspectionItems.map(item => (
                <label key={item.id} className="flex items-center gap-2 text-xs text-slate-200">
                  <Checkbox checked={item.checked} onCheckedChange={(v) => toggleItem('inspection', item.id, Boolean(v))} />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-3">
            <Textarea
              placeholder="Inspection notes"
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              className="text-xs"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={() => handleSaveChecklist('inspection')} disabled={saving}>
              Save Inspection
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-cyan-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-300 text-sm flex items-center gap-2">
            <Wrench className="w-4 h-4" /> Maintenance Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-40 pr-2">
            <div className="grid grid-cols-1 gap-2">
              {maintenanceItems.map(item => (
                <label key={item.id} className="flex items-center gap-2 text-xs text-slate-200">
                  <Checkbox checked={item.checked} onCheckedChange={(v) => toggleItem('maintenance', item.id, Boolean(v))} />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-3">
            <Textarea
              placeholder="Maintenance notes"
              value={maintenanceNotes}
              onChange={(e) => setMaintenanceNotes(e.target.value)}
              className="text-xs"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={() => handleSaveChecklist('maintenance')} disabled={saving}>
              Save Maintenance
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-cyan-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-300 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" /> Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input type="file" multiple onChange={(e) => handleUploadDocuments(e.target.files)} className="text-xs" />
            <Button size="sm" variant="outline" className="gap-2" onClick={() => {}}>
              <Upload className="w-3 h-3" /> Upload
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {documents.length === 0 && (
              <div className="text-xs text-slate-400">No documents uploaded.</div>
            )}
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between bg-slate-900/60 rounded px-2 py-1">
                <div className="text-xs text-slate-200 truncate">
                  {doc.name} <Badge variant="outline" className="ml-2 text-slate-400 border-slate-600">{doc.category}</Badge>
                </div>
                <a
                  className="text-xs text-cyan-300 underline"
                  href={doc.dataUrl}
                  download={doc.name}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleChecklists;