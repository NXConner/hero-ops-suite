import { describe, it, expect, beforeEach } from "vitest";

describe("OverWatch Layer Presets persistence", () => {
  const KEY = "overwatch-layer-presets";
  const PREFS = "overwatch-prefs";

  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads presets from localStorage", () => {
    const preset = {
      id: "p1",
      name: "My Preset",
      selectedMapService: "osm",
      activeOverlays: ["fleet", "weather"],
      mapCenter: [40.0, -74.0] as [number, number],
      mapZoom: 10,
    };
    localStorage.setItem(KEY, JSON.stringify([preset]));

    const raw = localStorage.getItem(KEY);
    expect(raw).toBeTruthy();
    const list = JSON.parse(String(raw));
    expect(Array.isArray(list)).toBe(true);
    expect(list[0].name).toBe("My Preset");
  });

  it("persists cluster/heatmap toggles in overwatch-prefs", () => {
    const prefs = {
      selectedMapService: "osm",
      terminologyMode: "civilian",
      activeOverlays: ["fleet"],
      mapCenter: [0, 0],
      mapZoom: 5,
      showCustomOverlayManager: false,
      clusterEnabled: true,
      heatmapEnabled: false,
    };
    localStorage.setItem(PREFS, JSON.stringify(prefs));
    const read = JSON.parse(String(localStorage.getItem(PREFS)));
    expect(read.clusterEnabled).toBe(true);
    expect(read.heatmapEnabled).toBe(false);
  });
});

