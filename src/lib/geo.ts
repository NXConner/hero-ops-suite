export interface LatLng {
  lat: number;
  lon: number;
}

const GEOCODE_CACHE_KEY = "geocodeCache";
const REVERSE_CACHE_KEY = "reverseGeocodeCache";

function loadCache(key: string): Record<string, any> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(key: string, cache: Record<string, any>) {
  try {
    localStorage.setItem(key, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const key = address.trim().toLowerCase();
  const cache = loadCache(GEOCODE_CACHE_KEY);
  if (cache[key]) return cache[key];
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
  const resp = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!resp.ok) return null;
  const data = await resp.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const item = data[0];
  const lat = parseFloat(item.lat);
  const lon = parseFloat(item.lon);
  const result = { lat, lon };
  cache[key] = result;
  saveCache(GEOCODE_CACHE_KEY, cache);
  return result;
}

export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  const key = `${lat.toFixed(6)},${lon.toFixed(6)}`;
  const cache = loadCache(REVERSE_CACHE_KEY);
  if (cache[key]) return cache[key];
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const resp = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!resp.ok) return null;
  const data = await resp.json();
  const disp = data?.display_name as string | undefined;
  if (!disp) return null;
  cache[key] = disp;
  saveCache(REVERSE_CACHE_KEY, cache);
  return disp;
}

export function haversineMiles(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.asin(Math.min(1, Math.sqrt(h)));
  return R * c;
}

export async function computeRoundTripMilesBetween(addrA: string, addrB: string): Promise<number | null> {
  const [a, b] = await Promise.all([geocodeAddress(addrA), geocodeAddress(addrB)]);
  if (!a || !b) return null;
  const oneWay = haversineMiles(a, b);
  return Math.round(oneWay * 2);
}