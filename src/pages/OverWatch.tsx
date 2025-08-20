import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import RealMapComponent from "@/components/map/RealMapComponent";
import FleetTracking from "@/components/map/FleetTracking";
import WeatherOverlay from "@/components/map/WeatherOverlay";
import PavementScan3D from "@/components/pavement/PavementScan3D";
import { useTerminology } from "@/contexts/TerminologyContext";
import { authService } from "@/services/auth";
import { saveLayerPresetsToCloud, loadLayerPresetsFromCloud } from "@/services/overwatchPresets";

type LayerPreset = {
  id: string;
  name: string;
  selectedMapService: string;
  activeOverlays: string[];
  mapCenter: [number, number];
  mapZoom: number;
};

const LAYER_PRESETS_KEY = "overwatch-layer-presets";

const tileSets: Record<string, { tiles: string[]; attribution?: string }> = {
  osm: {
    tiles: [
      "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
      "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
      "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
    ],
    attribution: "© OpenStreetMap contributors",
  },
  satellite: {
    tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
    attribution: "© Esri",
  },
  topo: {
    tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"],
    attribution: "© Esri",
  },
};

const OverWatch: React.FC = () => {
  const { terminologyMode } = useTerminology();
  const [selectedMapService, setSelectedMapService] = useState<string>("osm");
  const [activeOverlays, setActiveOverlays] = useState<string[]>(["fleet", "weather"]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-74.006, 40.7128]);
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [presets, setPresets] = useState<LayerPreset[]>([]);
  const [clusterEnabled, setClusterEnabled] = useState(false);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [autoRefreshPoints, setAutoRefreshPoints] = useState(false);
  const [refreshMs, setRefreshMs] = useState(15000);
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const importFileRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LAYER_PRESETS_KEY) || "[]");
      if (Array.isArray(saved)) setPresets(saved as LayerPreset[]);
    } catch {}
    // Cloud load (gated)
    (async () => {
      try {
        const enabled = localStorage.getItem("ow-cloud-presets") === "1";
        if (!enabled) return;
        const cloud = await loadLayerPresetsFromCloud();
        if (cloud && cloud.length > 0) setPresets(cloud as any);
      } catch {}
    })();
    // Role defaults (one-time)
    try {
      const user = authService.getCurrentUser?.();
      const appliedKey = user ? `ow-default-applied-${user.id}` : null;
      if (user && !localStorage.getItem(appliedKey!)) {
        const roleDefaults: Record<string, { overlays: string[]; service: string }> = {
          admin: { overlays: ["fleet", "weather", "pavement"], service: "satellite" },
          supervisor: { overlays: ["fleet", "weather"], service: "osm" },
          operator: { overlays: ["fleet"], service: "osm" },
          analyst: { overlays: ["pavement", "weather"], service: "topo" },
          field_worker: { overlays: ["fleet"], service: "osm" },
          viewer: { overlays: ["weather"], service: "osm" },
          super_admin: { overlays: ["fleet", "weather", "pavement"], service: "satellite" },
        };
        const def = roleDefaults[user.role] || roleDefaults.viewer;
        setSelectedMapService(def.service);
        setActiveOverlays(def.overlays);
        localStorage.setItem(appliedKey!, "1");
      }
    } catch {}
  }, []);

  const persistPresets = (next: LayerPreset[]) => {
    setPresets(next);
    try {
      localStorage.setItem(LAYER_PRESETS_KEY, JSON.stringify(next));
    } catch {}
    try {
      const enabled = localStorage.getItem("ow-cloud-presets") === "1";
      if (enabled) void saveLayerPresetsToCloud(next as any);
    } catch {}
  };

  // Auto-refresh demo points
  useEffect(() => {
    if (!autoRefreshPoints) return;
    let stop = false;
    const tick = async () => {
      try {
        const resp = await fetch(`/demo/points?n=150&lng=${mapCenter[0]}&lat=${mapCenter[1]}&spread=0.3`);
        const json = await resp.json();
        const api = (window as any).mapMethods;
        if (!stop && api?.setPoints && Array.isArray(json.points)) api.setPoints(json.points);
      } catch {}
      if (!stop) setTimeout(tick, refreshMs);
    };
    tick();
    return () => {
      stop = true;
    };
  }, [autoRefreshPoints, mapCenter, refreshMs]);

  const tiles = useMemo(() => tileSets[selectedMapService] || tileSets.osm, [selectedMapService]);

  const handleLoadDemoPoints = () => {
    try {
      const api = (window as any).mapMethods;
      if (api?.setPoints) {
        const pts = [
          { lng: -74.006, lat: 40.7128 },
          { lng: -73.9857, lat: 40.7484 },
          { lng: -73.9772, lat: 40.7527 },
          { lng: -73.968, lat: 40.7851 },
        ];
        api.setPoints(pts);
      }
    } catch {}
  };

  const handleQuickSave = () => {
    const id = (crypto as any).randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const name = `${selectedMapService.toUpperCase()} · ${new Date().toLocaleTimeString()}`;
    const preset: LayerPreset = { id, name, selectedMapService, activeOverlays: [...activeOverlays], mapCenter: [...mapCenter] as [number, number], mapZoom };
    const next = [preset, ...presets].slice(0, 20);
    persistPresets(next);
  };

  const applyPreset = (id: string) => {
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    setSelectedMapService(p.selectedMapService);
    setActiveOverlays(p.activeOverlays);
    setMapCenter(p.mapCenter);
    setMapZoom(p.mapZoom);
  };

  const deletePreset = (id: string) => {
    const next = presets.filter((p) => p.id !== id);
    persistPresets(next);
    setSelectedPresetId("");
  };

  const exportPresets = () => {
    try {
      const data = JSON.stringify(presets, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "overwatch-layer-presets.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const triggerImport = () => importFileRef.current?.click();
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        if (Array.isArray(json)) persistPresets(json as any);
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 relative">
        <div className="p-3 flex gap-2 items-center">
          <Button variant="outline" onClick={handleLoadDemoPoints}>Load Demo Points</Button>
          <Button variant="outline" onClick={handleQuickSave}>Quick Save</Button>
          <select
            value={selectedMapService}
            onChange={(e) => setSelectedMapService(e.target.value)}
            className="h-8 bg-slate-800 border border-slate-600 text-xs text-slate-200 rounded px-2"
            title="Basemap"
          >
            <option value="osm">OpenStreetMap</option>
            <option value="satellite">Satellite</option>
            <option value="topo">Topographic</option>
          </select>
        </div>
        <div className="absolute inset-0">
          <RealMapComponent
            center={mapCenter}
            zoom={mapZoom}
            tileUrls={tiles.tiles}
            attribution={tiles.attribution}
            clusterEnabled={clusterEnabled}
            heatmapEnabled={heatmapEnabled}
            onMapMove={(center, zoom) => {
              setMapCenter(center);
              setMapZoom(zoom);
            }}
          >
            <FleetTracking terminologyMode={terminologyMode} isVisible={activeOverlays.includes("fleet")} />
            <WeatherOverlay terminologyMode={terminologyMode} isVisible={activeOverlays.includes("weather")} onRecommendationChange={() => {}} />
            <PavementScan3D terminologyMode={terminologyMode} isVisible={activeOverlays.includes("pavement")} onDefectSelect={() => {}} onAnalysisComplete={() => {}} />
          </RealMapComponent>
        </div>
        {/* Floating controls */}
        <div className="fixed right-4 bottom-24 z-40 w-72 rounded-md border border-slate-700 bg-slate-900/85 p-3 shadow-lg backdrop-blur">
          <div className="text-xs text-slate-300 mb-2">Legend & Controls</div>
          <div className="grid grid-cols-2 gap-2 items-center text-xs text-slate-300">
            <span>Show Clusters</span>
            <Switch checked={clusterEnabled} onCheckedChange={setClusterEnabled} />
            <span>Show Heatmap</span>
            <Switch checked={heatmapEnabled} onCheckedChange={setHeatmapEnabled} />
            <span>Auto Refresh</span>
            <Switch checked={autoRefreshPoints} onCheckedChange={setAutoRefreshPoints} />
            <span>Refresh (ms)</span>
            <input
              type="number"
              min={2000}
              step={1000}
              value={refreshMs}
              onChange={(e) => setRefreshMs(Math.max(2000, Number(e.target.value) || 15000))}
              className="h-6 w-full bg-slate-800 border border-slate-600 text-xs text-slate-200 rounded px-1"
              title="Refresh ms"
            />
            <span>Fleet</span>
            <Switch
              checked={activeOverlays.includes("fleet")}
              onCheckedChange={(v) => {
                setActiveOverlays((prev) => {
                  if (v) return Array.from(new Set([...prev, "fleet"]));
                  return prev.filter((id) => id !== "fleet");
                });
              }}
            />
            <span>Weather</span>
            <Switch
              checked={activeOverlays.includes("weather")}
              onCheckedChange={(v) => {
                setActiveOverlays((prev) => {
                  if (v) return Array.from(new Set([...prev, "weather"]));
                  return prev.filter((id) => id !== "weather");
                });
              }}
            />
            <span>Pavement</span>
            <Switch
              checked={activeOverlays.includes("pavement")}
              onCheckedChange={(v) => {
                setActiveOverlays((prev) => {
                  if (v) return Array.from(new Set([...prev, "pavement"]));
                  return prev.filter((id) => id !== "pavement");
                });
              }}
            />
          </div>
          <div className="mt-3">
            <Button variant="outline" size="sm" className="bg-slate-800 border-slate-600 text-xs w-full" onClick={handleQuickSave}>
              Save Current as Preset
            </Button>
            <div className="mt-2 grid grid-cols-2 gap-2 items-center">
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="h-8 bg-slate-800 border border-slate-600 text-xs text-slate-200 rounded px-2 col-span-2"
              >
                <option value="">Select preset…</option>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600 text-xs"
                onClick={() => selectedPresetId && applyPreset(selectedPresetId)}
              >
                Apply
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600 text-xs"
                onClick={() => selectedPresetId && deletePreset(selectedPresetId)}
              >
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600 text-xs col-span-1"
                onClick={exportPresets}
              >
                Export
              </Button>
              <input ref={importFileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600 text-xs col-span-1"
                onClick={triggerImport}
              >
                Import
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverWatch;

