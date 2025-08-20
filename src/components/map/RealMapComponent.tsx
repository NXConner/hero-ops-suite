import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { area as turfArea } from "@turf/turf";

// Helper: Build a simple raster style for MapLibre from tile URLs
function buildRasterStyle(tileUrls: string[], attribution?: string): any {
  return {
    version: 8,
    sources: {
      base: {
        type: "raster",
        tiles: tileUrls,
        tileSize: 256,
        attribution: attribution || "",
      },
    },
    layers: [
      {
        id: "base",
        type: "raster",
        source: "base",
      },
    ],
  };
}

interface RealMapComponentProps {
  center: [number, number];
  zoom: number;
  className?: string;
  onMapLoad?: (map: maplibregl.Map) => void;
  onMapClick?: (e: any) => void;
  onMapMove?: (center: [number, number], zoom: number) => void;
  children?: React.ReactNode;
  // Preferred: provide open/free raster tiles
  tileUrls?: string[];
  attribution?: string;
  clusterEnabled?: boolean;
  heatmapEnabled?: boolean;
}

const RealMapComponent: React.FC<RealMapComponentProps> = ({
  center,
  zoom,
  className = "",
  onMapLoad,
  onMapClick,
  onMapMove,
  children,
  tileUrls = ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
  attribution = "© OpenStreetMap contributors",
  clusterEnabled = false,
  heatmapEnabled = false,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const drawRef = useRef<any>(null);
  const pointsDataRef = useRef<GeoJSON.FeatureCollection<GeoJSON.Point> | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map using MapLibre with a simple raster tile style
    const initialStyle = buildRasterStyle(tileUrls, attribution);
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: center,
      zoom: zoom,
      attributionControl: true,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add geolocate control
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "top-right",
    );

    // Add scale control
    map.current.addControl(new maplibregl.ScaleControl(), "bottom-left");

    // Add fullscreen control
    map.current.addControl(new maplibregl.FullscreenControl(), "top-right");

    // Set up event listeners
    map.current.on("load", () => {
      setMapLoaded(true);
      onMapLoad?.(map.current!);
      // Lazy-load Mapbox Draw to enable polygon drawing and area calculation
      (async () => {
        try {
          const Draw = (await import("@mapbox/mapbox-gl-draw")).default as any;
          const draw = new Draw({
            displayControlsDefault: false,
            controls: { polygon: true, trash: true },
          });
          drawRef.current = draw;
          map.current?.addControl(draw, "top-right");
          const updateArea = () => {
            try {
              const data = draw.getAll();
              let sqFt = 0;
              if (data && data.features && data.features.length > 0) {
                // Use the last feature drawn that is a Polygon
                const last = [...data.features]
                  .reverse()
                  .find((f: any) => f.geometry?.type === "Polygon");
                if (last) {
                  const sqMeters = turfArea(last as any);
                  sqFt = Math.max(0, Math.round(sqMeters * 10.7639));
                }
              }
              (window as any).mapMethods = {
                ...(window as any).mapMethods,
                lastAreaSqFt: sqFt,
              };
            } catch (_e) {
              /* ignore */
            }
          };
          map.current?.on("draw.create", updateArea);
          map.current?.on("draw.update", updateArea);
          map.current?.on("draw.delete", () => {
            (window as any).mapMethods = {
              ...(window as any).mapMethods,
              lastAreaSqFt: 0,
            };
          });
        } catch (_e) {
          /* ignore draw load */
        }
      })();
    });

    map.current.on("click", (e) => {
      onMapClick?.(e);
    });

    map.current.on("moveend", () => {
      if (map.current) {
        const newCenter = map.current.getCenter();
        const newZoom = map.current.getZoom();
        onMapMove?.([newCenter.lng, newCenter.lat], newZoom);
      }
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map center and zoom when props change
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.easeTo({
        center: center,
        zoom: zoom,
        duration: 1000,
      });
    }
  }, [center, zoom, mapLoaded]);

  // Update style when tileUrls or attribution changes
  useEffect(() => {
    if (map.current && mapLoaded && tileUrls && tileUrls.length > 0) {
      const newStyle = buildRasterStyle(tileUrls, attribution);
      map.current.setStyle(newStyle as any);
    }
  }, [tileUrls, attribution, mapLoaded]);

  // Placeholder effects for cluster/heatmap toggles until data layers are wired
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    // Expose toggle states for potential child components to use
    (window as any).mapMethods = {
      ...(window as any).mapMethods,
      clusterEnabled,
      heatmapEnabled,
    };
  }, [clusterEnabled, heatmapEnabled, mapLoaded]);

  // Helpers to create clustered point layers
  const ensurePointLayers = () => {
    if (!map.current || !mapLoaded) return;
    const m = map.current;
    const sourceId = "ow-points";

    if (!m.getSource(sourceId)) {
      m.addSource(sourceId, {
        type: "geojson",
        data: pointsDataRef.current || { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      } as any);
    }
    // Cluster circles
    if (!m.getLayer("ow-clusters")) {
      m.addLayer({
        id: "ow-clusters",
        type: "circle",
        source: sourceId,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            100,
            "#f1f075",
            750,
            "#f28cb1",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            15,
            100,
            20,
            750,
            25,
          ],
          "circle-opacity": 0.8,
        },
      } as any);
    }
    // Cluster count labels
    if (!m.getLayer("ow-cluster-count")) {
      m.addLayer({
        id: "ow-cluster-count",
        type: "symbol",
        source: sourceId,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: { "text-color": "#0f172a" },
      } as any);
    }
    // Unclustered points
    if (!m.getLayer("ow-unclustered")) {
      m.addLayer({
        id: "ow-unclustered",
        type: "circle",
        source: sourceId,
        filter: ["!has", "point_count"],
        paint: {
          "circle-color": "#11b4da",
          "circle-radius": 6,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      } as any);
    }
    // Heat layer (simulated via large semi-transparent circles)
    if (!m.getLayer("ow-heat")) {
      m.addLayer({
        id: "ow-heat",
        type: "circle",
        source: sourceId,
        paint: {
          "circle-color": "#ef4444",
          "circle-radius": 20,
          "circle-blur": 1,
          "circle-opacity": 0.25,
        },
      } as any);
    }

    // Toggle visibility
    try {
      m.setLayoutProperty("ow-clusters", "visibility", clusterEnabled ? "visible" : "none");
      m.setLayoutProperty("ow-cluster-count", "visibility", clusterEnabled ? "visible" : "none");
      m.setLayoutProperty("ow-unclustered", "visibility", clusterEnabled ? "none" : "visible");
      m.setLayoutProperty("ow-heat", "visibility", heatmapEnabled ? "visible" : "none");
    } catch (_e) {
      /* ignore */
    }
  };

  // Apply layers on load and whenever toggles change
  useEffect(() => {
    ensurePointLayers();
  }, [mapLoaded, clusterEnabled, heatmapEnabled]);

  const addMarker = (
    lng: number,
    lat: number,
    options?: {
      color?: string;
      popup?: string;
      draggable?: boolean;
      className?: string;
    },
  ) => {
    if (!map.current) return null;

    const marker = new maplibregl.Marker({
      color: options?.color || "#3FB1CE",
      draggable: options?.draggable || false,
    })
      .setLngLat([lng, lat])
      .addTo(map.current);

    if (options?.popup) {
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(options.popup);
      marker.setPopup(popup);
    }

    return marker;
  };

  const addGeoJSONSource = (
    sourceId: string,
    data: GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.FeatureCollection<GeoJSON.Geometry>,
  ) => {
    if (!map.current || !mapLoaded) return;

    if (map.current.getSource(sourceId)) {
      (map.current.getSource(sourceId) as any).setData(data);
    } else {
      map.current.addSource(sourceId, {
        type: "geojson",
        data: data,
      });
    }
  };

  const addLayer = (layer: any) => {
    if (!map.current || !mapLoaded) return;

    if (!map.current.getLayer(layer.id)) {
      map.current.addLayer(layer);
    }
  };

  const flyTo = (center: [number, number], zoom?: number) => {
    if (!map.current) return;

    map.current.flyTo({
      center: center,
      zoom: zoom || map.current.getZoom(),
      duration: 2000,
    });
  };

  // Expose map methods for parent components
  useEffect(() => {
    if (mapLoaded && map.current) {
      // Store map methods on a global reference for access by children
      (window as any).mapMethods = {
        addMarker,
        addGeoJSONSource,
        addLayer,
        flyTo,
        getMap: () => map.current,
        lastAreaSqFt: (window as any).mapMethods?.lastAreaSqFt || 0,
        clusterEnabled: (window as any).mapMethods?.clusterEnabled || false,
        heatmapEnabled: (window as any).mapMethods?.heatmapEnabled || false,
        setPoints: (features: Array<{ lng: number; lat: number }>) => {
          const fc: GeoJSON.FeatureCollection<GeoJSON.Point> = {
            type: "FeatureCollection",
            features: (features || []).map((pt) => ({
              type: "Feature",
              properties: {},
              geometry: { type: "Point", coordinates: [pt.lng, pt.lat] },
            })),
          };
          pointsDataRef.current = fc;
          if (map.current && mapLoaded) {
            const src = map.current.getSource("ow-points") as any;
            if (src && src.setData) src.setData(fc);
            else ensurePointLayers();
          }
        },
      };
    }
  }, [mapLoaded]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainer} data-testid="map-container" className="w-full h-full" />

      {/* Loading indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
          <div className="text-center text-cyan-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-2"></div>
            <div>Loading Map...</div>
          </div>
        </div>
      )}

      {/* Render children after map is loaded */}
      {mapLoaded && children}
    </div>
  );
};

export default RealMapComponent;
