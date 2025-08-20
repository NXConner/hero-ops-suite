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
      const presets = JSON.parse(localStorage.getItem("overwatch-layer-presets") || "[]");
      if (Array.isArray(presets)) setLayerPresets(presets);
    } catch {
      /* ignore */
    }
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
  ]);

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