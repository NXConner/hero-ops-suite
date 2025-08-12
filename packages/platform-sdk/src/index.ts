export interface Scan {
  scan_id: string;
  site_id?: string | null;
  client_id?: string | null;
  timestamp: string;
  perimeter_ft?: number | null;
  area_sqft?: number | null;
  mesh_url?: string | null;
}

export interface EstimateLine {
  item_code: string;
  description: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total: number;
}

export interface EstimateResponse {
  lines: EstimateLine[];
  mobilization: number;
  contingencyPercent: number;
  subtotal: number;
  total: number;
}

export interface SdkConfig {
  baseUrl: string;
  token?: string | null;
}

export function createApiClient(config: SdkConfig) {
  const base = config.baseUrl.replace(/\/$/, '');
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (config.token) defaultHeaders['Authorization'] = `Bearer ${config.token}`;

  async function request<T = any>(path: string, init?: RequestInit): Promise<T> {
    const url = `${base}/${path.replace(/^\//, '')}`;
    const res = await fetch(url, {
      ...init,
      headers: { ...defaultHeaders, ...(init?.headers as any) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return (await res.json()) as T;
    return (await res.text()) as unknown as T;
  }

  return {
    listScans: () => request<{ scans: Scan[] }>(`/scans`),
    getScan: (id: string) => request<{ scan: Scan; overlay?: unknown }>(`/scans/${id}`),
    getEstimate: (id: string) => request<EstimateResponse>(`/estimate/${id}`, { method: 'POST' }),
  };
}