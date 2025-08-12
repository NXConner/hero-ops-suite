
declare module "@asphalt/platform-sdk" {
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

  export function createApiClient(config: SdkConfig): {
    listScans: () => Promise<{ scans: Scan[] }>;
    getScan: (id: string) => Promise<{ scan: Scan; overlay?: unknown }>;
    getEstimate: (id: string) => Promise<EstimateResponse>;
  };
}
