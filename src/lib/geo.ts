export interface LatLng {
  lat: number;
  lon: number;
}

const GEOCODE_CACHE_KEY = "geocodeCache";

function loadCache(): Record<string, LatLng> {
  try {
    const raw = localStorage.getItem(GEOCODE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, LatLng>) {
  try {
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const key = address.trim().toLowerCase();
  const cache = loadCache();
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
  saveCache(cache);
  return result;
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