import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapProvider } from './MapContext';

// Mapbox access token - must be set via environment variable VITE_MAPBOX_TOKEN
const MAPBOX_TOKEN = (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_MAPBOX_TOKEN : undefined) as string | undefined;

interface RealMapComponentProps {
  center: [number, number];
  zoom: number;
  className?: string;
  onMapLoad?: (map: mapboxgl.Map) => void;
  onMapClick?: (e: mapboxgl.MapMouseEvent) => void;
  onMapMove?: (center: [number, number], zoom: number) => void;
  children?: React.ReactNode;
}

const RealMapComponent: React.FC<RealMapComponentProps> = ({
  center,
  zoom,
  className = '',
  onMapLoad,
  onMapClick,
  onMapMove,
  children
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!MAPBOX_TOKEN) {
      setTokenMissing(true);
      return;
    }

    // Set mapbox access token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12', // Satellite view for operations
      center: center,
      zoom: zoom,
      attributionControl: true
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Set up event listeners
    map.current.on('load', () => {
      setMapLoaded(true);
      onMapLoad?.(map.current!);
    });

    map.current.on('click', (e) => {
      onMapClick?.(e);
    });

    map.current.on('moveend', () => {
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
        duration: 1000
      });
    }
  }, [center, zoom, mapLoaded]);

  const addMarker = (lng: number, lat: number, options?: { 
    color?: string; 
    popup?: string;
    draggable?: boolean;
    className?: string;
  }) => {
    if (!map.current) return null;

    const marker = new mapboxgl.Marker({
      color: options?.color || '#3FB1CE',
      draggable: options?.draggable || false
    })
      .setLngLat([lng, lat])
      .addTo(map.current);

    if (options?.popup) {
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(options.popup);
      marker.setPopup(popup);
    }

    return marker;
  };

  const addGeoJSONSource = (sourceId: string, data: any) => {
    if (!map.current || !mapLoaded) return;

    if (map.current.getSource(sourceId)) {
      (map.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(data);
    } else {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: data
      });
    }
  };

  const addLayer = (layer: mapboxgl.LayerSpecification) => {
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
      duration: 2000
    });
  };

  // Expose map methods to children via context provider
  const mapMethods = {
    addMarker,
    addGeoJSONSource,
    addLayer,
    flyTo,
    getMap: () => map.current,
  };


  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />

      {tokenMissing && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur flex items-center justify-center">
          <div className="text-center text-red-300 space-y-2">
            <div className="font-semibold">Mapbox token is not configured</div>
            <div className="text-sm">Set VITE_MAPBOX_TOKEN in your environment to enable maps.</div>
          </div>
        </div>
      )}
      {/* Loading indicator */}
      {!tokenMissing && !mapLoaded && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
          <div className="text-center text-cyan-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-2"></div>
            <div>Loading Map...</div>
          </div>
        </div>
      )}

      {/* Render children after map is loaded */}
      {!tokenMissing && mapLoaded && (
        <MapProvider value={mapMethods}>
          {children}
        </MapProvider>
      )}
    </div>
  );
};

export default RealMapComponent;