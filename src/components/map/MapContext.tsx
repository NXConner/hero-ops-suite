import React, { createContext, useContext } from 'react';
import type mapboxgl from 'mapbox-gl';

export interface MapMethods {
  addMarker: (lng: number, lat: number, options?: {
    color?: string;
    popup?: string;
    draggable?: boolean;
    className?: string;
  }) => mapboxgl.Marker | null;
  addGeoJSONSource: (sourceId: string, data: any) => void;
  addLayer: (layer: mapboxgl.LayerSpecification) => void;
  flyTo: (center: [number, number], zoom?: number) => void;
  getMap: () => mapboxgl.Map | null;
}

const MapContext = createContext<MapMethods | null>(null);

export const useMap = () => {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMap must be used within a MapProvider');
  return ctx;
};

export const MapProvider = MapContext.Provider;