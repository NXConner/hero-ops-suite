import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type LayerPreset = {
  id: string;
  name: string;
  selectedMapService: string;
  activeOverlays: string[];
  mapCenter: [number, number];
  mapZoom: number;
};

const LAYER_PRESETS_KEY = "overwatch-layer-presets";

const OverWatch: React.FC = () => {
  const [selectedMapService, setSelectedMapService] = useState<string>("osm");
  const [activeOverlays, setActiveOverlays] = useState<string[]>(["fleet", "weather"]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-74.006, 40.7128]);
  const [mapZoom, setMapZoom] = useState<number>(10);
  const [presets, setPresets] = useState<LayerPreset[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LAYER_PRESETS_KEY) || "[]");
      if (Array.isArray(saved)) setPresets(saved as LayerPreset[]);
    } catch {
      /* ignore */
    }
  }, []);

  const persistPresets = (next: LayerPreset[]) => {
    setPresets(next);
    try {
      localStorage.setItem(LAYER_PRESETS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

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
    } catch {
      /* ignore */
    }
  };

  const handleQuickSave = () => {
    const id = (crypto as any).randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const name = `${selectedMapService.toUpperCase()} · ${new Date().toLocaleTimeString()}`;
    const preset: LayerPreset = {
      id,
      name,
      selectedMapService,
      activeOverlays: [...activeOverlays],
      mapCenter: [...mapCenter] as [number, number],
      mapZoom,
    };
    const next = [preset, ...presets].slice(0, 20);
    persistPresets(next);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-xl font-bold">OverWatch</div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleLoadDemoPoints}>
          Load Demo Points
        </Button>
        <Button variant="outline" onClick={handleQuickSave}>
          Quick Save
        </Button>
      </div>
    </div>
  );
};

export default OverWatch;

