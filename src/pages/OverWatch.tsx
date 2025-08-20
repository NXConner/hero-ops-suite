import React, { useState, useRef, useEffect, Suspense, lazy } from "react";
// Removed react-leaflet dependency - using placeholder
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Sidebar from "@/components/Sidebar";
import { useSearchParams } from "react-router-dom";
import { useTerminology } from "@/contexts/TerminologyContext";
import { authService } from "@/services/auth";

const mapServices = [
  { id: "osm", name: "OpenStreetMap", icon: null },
  { id: "satellite", name: "Satellite", icon: null },
  { id: "terrain", name: "Terrain", icon: null },
  { id: "topo", name: "Topographic", icon: null },
];

const OverWatch: React.FC = () => {
  const [selectedMapService, setSelectedMapService] = useState("osm");
  const { terminologyMode, setTerminologyMode, getTerm } = useTerminology();
  const [activeOverlays, setActiveOverlays] = useState<string[]>(["fleet", "weather"]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isMeasurementMode, setIsMeasurementMode] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006]); // NYC default
  const [mapZoom, setMapZoom] = useState(13);
  const [drawings, setDrawings] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [showWidgets, setShowWidgets] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [weatherRecommendations, setWeatherRecommendations] = useState<string[]>([]);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const [searchParams] = useSearchParams();
  const [showCustomOverlayManager, setShowCustomOverlayManager] = useState<boolean>(false);
  const [layerPresetName, setLayerPresetName] = useState<string>("");
  const [layerPresets, setLayerPresets] = useState<
    Array<{ id: string; name: string; selectedMapService: string; activeOverlays: string[]; mapCenter: [number, number]; mapZoom: number }>
  >([]);
  const [clusterEnabled, setClusterEnabled] = useState<boolean>(false);
  const [heatmapEnabled, setHeatmapEnabled] = useState<boolean>(false);
  const [autoRefreshPoints, setAutoRefreshPoints] = useState<boolean>(false);
  const [refreshMs, setRefreshMs] = useState<number>(15000);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("overwatch-prefs") || "{}");
      if (saved.selectedMapService) setSelectedMapService(saved.selectedMapService);
      if (saved.terminologyMode) setTerminologyMode(saved.terminologyMode);
      if (Array.isArray(saved.activeOverlays)) setActiveOverlays(saved.activeOverlays);
      if (Array.isArray(saved.mapCenter) && saved.mapCenter.length === 2)
        setMapCenter(saved.mapCenter);
      if (typeof saved.mapZoom === "number") setMapZoom(saved.mapZoom);
      if (typeof saved.showCustomOverlayManager === "boolean")
        setShowCustomOverlayManager(saved.showCustomOverlayManager);
      if (typeof saved.clusterEnabled === "boolean") setClusterEnabled(saved.clusterEnabled);
      if (typeof saved.heatmapEnabled === "boolean") setHeatmapEnabled(saved.heatmapEnabled);
      const presets = JSON.parse(localStorage.getItem("overwatch-layer-presets") || "[]");
      if (Array.isArray(presets)) setLayerPresets(presets);
    } catch {
      /* ignore */
    }
    // Apply role-based default preset once per user
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

  useEffect(() => {
    try {
      localStorage.setItem(
        "overwatch-prefs",
        JSON.stringify({
          selectedMapService,
          terminologyMode,
          activeOverlays,
          mapCenter,
          mapZoom,
          showCustomOverlayManager,
          clusterEnabled,
          heatmapEnabled,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [
    selectedMapService,
    terminologyMode,
    activeOverlays,
    mapCenter,
    mapZoom,
    showCustomOverlayManager,
    clusterEnabled,
    heatmapEnabled,
  ]);

  // Auto-refresh demo points when enabled
  useEffect(() => {
    if (!autoRefreshPoints) return;
    let stop = false;
    const tick = async () => {
      try {
        const resp = await fetch(`/demo/points?n=150&lng=${mapCenter[0]}&lat=${mapCenter[1]}&spread=0.3`);
        const json = await resp.json();
        const api = (window as any).mapMethods;
        if (!stop && api?.setPoints && Array.isArray(json.points)) {
          api.setPoints(json.points);
        }
      } catch {}
      if (!stop) setTimeout(tick, refreshMs);
    };
    tick();
    return () => {
      stop = true;
    };
  }, [autoRefreshPoints, mapCenter, refreshMs]);

  function persistLayerPresets(next: typeof layerPresets) {
    setLayerPresets(next);
    try {
      localStorage.setItem("overwatch-layer-presets", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function saveCurrentAsPreset() {
    const name = layerPresetName.trim() || `Preset ${new Date().toLocaleString()}`;
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const preset = {
      id,
      name,
      selectedMapService,
      activeOverlays: [...activeOverlays],
      mapCenter: [...mapCenter] as [number, number],
      mapZoom,
    };
    const next = [preset, ...layerPresets].slice(0, 20);
    persistLayerPresets(next);
    setLayerPresetName("");
  }

  function applyPreset(presetId: string) {
    const p = layerPresets.find((x) => x.id === presetId);
    if (!p) return;
    setSelectedMapService(p.selectedMapService);
    setActiveOverlays(p.activeOverlays);
    setMapCenter(p.mapCenter);
    setMapZoom(p.mapZoom);
  }

  function deletePreset(presetId: string) {
    const next = layerPresets.filter((x) => x.id !== presetId);
    persistLayerPresets(next);
  }

  function exportLayerPresets() {
    const data = JSON.stringify(layerPresets, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "overwatch-layer-presets.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const importFileRef = useRef<HTMLInputElement | null>(null);
  function triggerImportPresets() {
    importFileRef.current?.click();
  }
  function handleImportPresets(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        if (Array.isArray(json)) {
          const sanitized = json
            .filter((p) => p && typeof p.id === "string" && typeof p.name === "string")
            .map((p) => ({
              id: String(p.id),
              name: String(p.name),
              selectedMapService: String(p.selectedMapService ?? "osm"),
              activeOverlays: Array.isArray(p.activeOverlays) ? p.activeOverlays.slice(0, 20) : [],
              mapCenter: Array.isArray(p.mapCenter) && p.mapCenter.length === 2 ? [Number(p.mapCenter[0]), Number(p.mapCenter[1])] : mapCenter,
              mapZoom: Number(p.mapZoom ?? mapZoom),
            }));
          persistLayerPresets(sanitized);
        }
      } catch {
        // ignore invalid JSON
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">OverWatch</h1>
          <div className="flex items-center gap-2">
            <Select value={selectedMapService} onValueChange={setSelectedMapService}>
              <SelectTrigger className="w-40 h-8 text-xs bg-slate-800 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {mapServices.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex items-center gap-2">
                      {service.icon}
                      {service.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Label htmlFor="layer-presets" className="text-xs text-slate-300">
                Layer Presets:
              </Label>
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600 text-xs"
                onClick={() => {
                  const name = `${selectedMapService.toUpperCase()} · ${new Date().toLocaleTimeString()}`;
                  const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
                  const preset = {
                    id,
                    name,
                    selectedMapService,
                    activeOverlays: [...activeOverlays],
                    mapCenter: [...mapCenter] as [number, number],
                    mapZoom,
                  };
                  const next = [preset, ...layerPresets].slice(0, 20);
                  persistLayerPresets(next);
                }}
              >
                Quick Save
              </Button>
              <Input
                value={layerPresetName}
                onChange={(e) => setLayerPresetName(e.target.value)}
                placeholder="Preset name"
                className="h-8 w-40 bg-slate-800 border-slate-600 text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600 text-xs"
                onClick={saveCurrentAsPreset}
              >
                Save
              </Button>
              <Select onValueChange={(id) => applyPreset(id)}>
                <SelectTrigger className="w-40 h-8 text-xs bg-slate-800 border-slate-600">
                  <SelectValue placeholder="Apply preset" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {layerPresets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {layerPresets.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-800 border-slate-600 text-xs"
                  onClick={() => {
                    const last = layerPresets[0];
                    if (last) deletePreset(last.id);
                  }}
                >
                  Delete Last
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600 text-xs"
                onClick={exportLayerPresets}
              >
                Export
              </Button>
              <input
                ref={importFileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportPresets}
              />
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600 text-xs"
                onClick={triggerImportPresets}
              >
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600 text-xs"
                onClick={() => {
                  try {
                    const api = (window as any).mapMethods;
                    if (api?.setPoints) {
                      const pts = [
                        { lng: -74.006, lat: 40.7128 },
                        { lng: -73.9857, lat: 40.7484 },
                        { lng: -73.9772, lat: 40.7527 },
                        { lng: -73.9680, lat: 40.7851 },
                      ];
                      api.setPoints(pts);
                    } else {
                      console.log("mapMethods.setPoints not available yet");
                    }
                  } catch (e) {
                    console.log("Error loading demo points", e);
                  }
                }}
              >
                Load Demo Points
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600 text-xs"
                onClick={() => {
                  try {
                    const api = (window as any).mapMethods;
                    if (api?.setPoints) {
                      api.setPoints([]);
                    }
                  } catch {}
                }}
              >
                Clear Points
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-slate-300">Cluster</Label>
                <Switch checked={clusterEnabled} onCheckedChange={setClusterEnabled} />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-slate-300">Heatmap</Label>
                <Switch checked={heatmapEnabled} onCheckedChange={setHeatmapEnabled} />
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="map" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="draw">Draw</TabsTrigger>
            <TabsTrigger value="measure">Measure</TabsTrigger>
          </TabsList>

          <TabsContent value="map">
            <div className="h-full flex flex-col">
              <div className="flex-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Map View</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-full w-full" id="map-container"></div>
                    <div className="text-xs text-slate-500 mt-2">
                      Cluster: {clusterEnabled ? "On" : "Off"} · Heatmap: {heatmapEnabled ? "On" : "Off"}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-3 rounded border border-slate-700 bg-slate-900/70 px-3 py-2">
                      <span className="text-xs text-slate-300">Legend:</span>
                      <span className="inline-flex items-center gap-1 text-xs text-cyan-300">
                        <span className="inline-block w-3 h-3 rounded-full bg-cyan-400" /> Cluster
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-red-300">
                        <span className="inline-block w-3 h-3 rounded-full bg-red-500 opacity-60" /> Heat
                      </span>
                      <span className="inline-flex items-center gap-2 text-xs text-slate-400 ml-3">
                        <Label className="text-xs">Show</Label>
                        <Switch checked={clusterEnabled} onCheckedChange={setClusterEnabled} />
                        <span className="text-xs">Clusters</span>
                        <Switch checked={heatmapEnabled} onCheckedChange={setHeatmapEnabled} />
                        <span className="text-xs">Heatmap</span>
                        <Switch checked={autoRefreshPoints} onCheckedChange={setAutoRefreshPoints} />
                        <span className="text-xs">Auto Refresh</span>
                        <input
                          type="number"
                          min={2000}
                          step={1000}
                          value={refreshMs}
                          onChange={(e) => setRefreshMs(Math.max(2000, Number(e.target.value) || 15000))}
                          className="h-6 w-20 bg-slate-800 border border-slate-600 text-xs text-slate-200 rounded px-1"
                          title="Refresh ms"
                        />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline">Zoom In</Button>
                <Button variant="outline">Zoom Out</Button>
                <Button variant="outline">Center Map</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="draw">
            <div className="h-full flex flex-col">
              <div className="flex-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Draw Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline">Draw Line</Button>
                      <Button variant="outline">Draw Polygon</Button>
                      <Button variant="outline">Draw Circle</Button>
                      <Button variant="outline">Draw Rectangle</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="measure">
            <div className="h-full flex flex-col">
              <div className="flex-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Measurement Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline">Distance</Button>
                      <Button variant="outline">Area</Button>
                      <Button variant="outline">Perimeter</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OverWatch;