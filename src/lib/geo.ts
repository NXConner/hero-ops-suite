export interface LatLng {
  lat: number;
  lon: number;
}

const GEOCODE_CACHE_KEY = "geocodeCache";
const REVERSE_CACHE_KEY = "reverseGeocodeCache";
const AUTOCOMPLETE_CACHE_KEY = "geocodeAutocompleteCache";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type CacheEntry<T> = { v: T; t: number } | T;

function now() {
  return Date.now();
}

function loadCache(key: string): Record<string, CacheEntry<any>> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, CacheEntry<any>>) : {};
  } catch {
    return {};
  }
}

function saveCache(key: string, cache: Record<string, CacheEntry<any>>) {
  try {
    localStorage.setItem(key, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

function getCacheValue<T>(cache: Record<string, CacheEntry<T>>, k: string): T | null {
  const entry = cache[k];
  if (!entry) return null;
  if (typeof (entry as any).t === "number" && "v" in (entry as any)) {
    const ce = entry as { v: T; t: number };
    if (now() - ce.t > CACHE_TTL_MS) return null;
    return ce.v;
  }
  // legacy plain value
  return entry as T;
}

function setCacheValue<T>(cache: Record<string, CacheEntry<T>>, k: string, v: T) {
  (cache as any)[k] = { v, t: now() } as CacheEntry<T>;
}

async function fetchWithRetry(
  url: string,
  opts: RequestInit,
  retries = 2,
  delayMs = 400,
): Promise<Response> {
  let attempt = 0;
  for (;;) {
    try {
      const resp = await fetch(url, opts);
      if (!resp.ok && attempt < retries) throw new Error(`HTTP ${resp.status}`);
      return resp;
    } catch (e) {
      if (attempt >= retries) throw e;
      await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
      attempt++;
    }
  }
}

export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const key = address.trim().toLowerCase();
  const cache = loadCache(GEOCODE_CACHE_KEY);
  const cached = getCacheValue<LatLng>(cache, key);
  if (cached) return cached;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
  const resp = await fetchWithRetry(url, {
    headers: { Accept: "application/json", "User-Agent": "OverWatch-Estimator/1.0" },
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const item = data[0];
  const lat = parseFloat(item.lat);
  const lon = parseFloat(item.lon);
  const result = { lat, lon };
  setCacheValue(cache, key, result);
  saveCache(GEOCODE_CACHE_KEY, cache);
  return result;
}

export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  const key = `${lat.toFixed(6)},${lon.toFixed(6)}`;
  const cache = loadCache(REVERSE_CACHE_KEY);
  const cached = getCacheValue<string>(cache, key);
  if (cached) return cached;
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const resp = await fetchWithRetry(url, {
    headers: { Accept: "application/json", "User-Agent": "OverWatch-Estimator/1.0" },
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  const disp = data?.display_name as string | undefined;
  if (!disp) return null;
  setCacheValue(cache, key, disp);
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

export async function computeRoundTripMilesBetween(
  addrA: string,
  addrB: string,
): Promise<number | null> {
  const [a, b] = await Promise.all([geocodeAddress(addrA), geocodeAddress(addrB)]);
  if (!a || !b) return null;
  const oneWay = haversineMiles(a, b);
  return Math.round(oneWay * 2);
}

// New: address autocomplete using Nominatim search
export type AddressCandidate = { displayName: string; lat: number; lon: number };

export async function searchAddressCandidates(
  query: string,
  limit = 5,
): Promise<AddressCandidate[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const cache = loadCache(AUTOCOMPLETE_CACHE_KEY);
  const key = `${q.toLowerCase()}::${limit}`;
  const cached = getCacheValue<AddressCandidate[]>(cache, key);
  if (cached) return cached;
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=${limit}&q=${encodeURIComponent(q)}`;
  const resp = await fetchWithRetry(url, {
    headers: { Accept: "application/json", "User-Agent": "OverWatch-Estimator/1.0" },
  });
  if (!resp.ok) return [];
  const data = await resp.json();
  const results: AddressCandidate[] = Array.isArray(data)
    ? data.map((d: any) => ({
        displayName: d.display_name as string,
        lat: parseFloat(d.lat),
        lon: parseFloat(d.lon),
      }))
    : [];
  setCacheValue(cache, key, results);
  saveCache(AUTOCOMPLETE_CACHE_KEY, cache);
  return results;
}
