import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

type CustomOverlay = {
  id: string;
  name: string;
  urlTemplate: string; // e.g., https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
  opacity: number; // 0..100
  visible: boolean;
};

const STORAGE_KEY = "custom-overlays-library";

interface CustomOverlayManagerProps {
  isVisible: boolean;
}

function getMap(): any | null {
  try {
    return (window as any).mapMethods?.getMap?.() ?? null;
  } catch {
    return null;
  }
}

function ensureRasterOverlay(map: any, overlay: CustomOverlay) {
  if (!map?.isStyleLoaded?.()) return;
  const sourceId = `custom-overlay-src-${overlay.id}`;
  const layerId = `custom-overlay-lyr-${overlay.id}`;
  try {
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "raster",
        tiles: [overlay.urlTemplate],
        tileSize: 256,
        attribution: "Custom layer",
      });
    }
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "raster",
        source: sourceId,
        paint: { "raster-opacity": Math.max(0, Math.min(1, overlay.opacity / 100)) },
      });
    } else {
      map.setPaintProperty(
        layerId,
        "raster-opacity",
        Math.max(0, Math.min(1, overlay.opacity / 100)),
      );
    }
    map.setLayoutProperty(layerId, "visibility", overlay.visible ? "visible" : "none");
  } catch {
    // best-effort; ignore rendering errors
  }
}

function removeRasterOverlay(map: any, overlayId: string) {
  if (!map) return;
  const sourceId = `custom-overlay-src-${overlayId}`;
  const layerId = `custom-overlay-lyr-${overlayId}`;
  try {
    if (map.getLayer(layerId)) map.removeLayer(layerId);
  } catch {
    /* ignore */
  }
  try {
    if (map.getSource(sourceId)) map.removeSource(sourceId);
  } catch {
    /* ignore */
  }
}

const CustomOverlayManager: React.FC<CustomOverlayManagerProps> = ({ isVisible }) => {
  const [overlays, setOverlays] = useState<CustomOverlay[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [opacity, setOpacity] = useState<number>(80);
  const mountedRef = useRef(false);

  // Load saved overlays
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as CustomOverlay[];
      if (Array.isArray(saved)) setOverlays(saved);
    } catch {
      /* ignore */
    }
  }, []);

  // Persist overlays
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overlays));
    } catch {
      /* ignore */
    }
  }, [overlays]);

  // Sync overlays to map whenever list changes
  useEffect(() => {
    const map = getMap();
    if (!map) return;
    const syncAll = () => {
      overlays.forEach((o) => ensureRasterOverlay(map, o));
    };
    if (map.isStyleLoaded?.()) syncAll();
    // Re-sync on style reloads (e.g., basemap change)
    const onStyleLoad = () => syncAll();
    try {
      map.on("style.load", onStyleLoad);
    } catch {
      /* ignore */
    }
    return () => {
      try {
        map.off("style.load", onStyleLoad);
      } catch {
        /* ignore */
      }
    };
  }, [overlays]);

  const addOverlay = () => {
    if (!url || !name) return;
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const o: CustomOverlay = { id, name, urlTemplate: url, opacity, visible: true };
    setOverlays((prev) => [o, ...prev]);
    // Apply immediately
    const map = getMap();
    if (map) ensureRasterOverlay(map, o);
    setName("");
    setUrl("");
    setOpacity(80);
  };

  const removeOverlayById = (id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    const map = getMap();
    if (map) removeRasterOverlay(map, id);
  };

  const updateOverlay = (id: string, patch: Partial<CustomOverlay>) => {
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    const map = getMap();
    if (map) {
      const next = overlays.find((o) => o.id === id);
      if (next) ensureRasterOverlay(map, { ...next, ...patch });
    }
  };

  return (
    <div className="pointer-events-none absolute left-2 top-2 z-20 w-[340px] max-w-[95vw]">
      <Card className="pointer-events-auto bg-slate-900/90 border border-cyan-500/30 shadow-md">
        <CardHeader className="py-3">
          <CardTitle className="text-sm text-cyan-300">Custom Layers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add overlay form */}
          {isVisible && (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 items-center">
                <Label className="col-span-1 text-xs">Name</Label>
                <Input
                  className="col-span-3 h-8"
                  placeholder="My Tiles"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 gap-2 items-center">
                <Label className="col-span-1 text-xs">URL</Label>
                <Input
                  className="col-span-3 h-8"
                  placeholder="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 gap-2 items-center">
                <Label className="col-span-1 text-xs">Opacity</Label>
                <div className="col-span-3">
                  <Slider
                    value={[opacity]}
                    onValueChange={(v) => setOpacity(v[0] ?? 80)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={addOverlay}>
                  Add Layer
                </Button>
              </div>
            </div>
          )}

          {/* Existing overlays */}
          <div className="space-y-3">
            {overlays.length === 0 && (
              <div className="text-xs text-slate-400">
                No custom layers yet. Add a tile URL template above.
              </div>
            )}
            {overlays.map((o) => (
              <div key={o.id} className="rounded border border-slate-700 p-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-slate-200 truncate mr-2" title={o.name}>
                    {o.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={o.visible}
                      onCheckedChange={(v) => updateOverlay(o.id, { visible: v })}
                    />
                    <Button variant="outline" size="sm" onClick={() => removeOverlayById(o.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-[10px] text-slate-500 truncate" title={o.urlTemplate}>
                    {o.urlTemplate}
                  </div>
                  <div className="mt-1">
                    <Slider
                      value={[o.opacity]}
                      onValueChange={(v) => updateOverlay(o.id, { opacity: v[0] ?? o.opacity })}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomOverlayManager;
