import axios from "axios";
import { Overlay } from "../types/overlay";
import { CONFIG } from "../config";

const api = axios.create({ baseURL: CONFIG.API_BASE_URL });

export async function listScans(): Promise<{ scans: any[] }> {
  const { data } = await api.get("/scans");
  return data;
}

export async function createScan(payload: {
  site_id?: string;
  client_id?: string;
  perimeter_ft?: number;
  area_sqft?: number;
  mesh_url?: string;
}): Promise<{ scan_id: string; upload_urls?: Record<string, string> }> {
  const { data } = await api.post("/scans", payload);
  return data;
}

export async function updateScan(scanId: string, updates: any): Promise<{ scan: any }> {
  const { data } = await api.put(`/scans/${scanId}`, updates);
  return data;
}

export async function uploadOverlay(scanId: string, overlay: Overlay): Promise<void> {
  await api.post(`/scans/${scanId}/overlay`, overlay);
}

export async function getOverlay(scanId: string): Promise<Overlay> {
  const { data } = await api.get(`/scans/${scanId}/overlay`);
  return data;
}

export async function getScan(scanId: string): Promise<{ scan: any; overlay: Overlay | null }> {
  const { data } = await api.get(`/scans/${scanId}`);
  return data;
}

export async function getReport(scanId: string): Promise<{ pdf_url: string }> {
  const { data } = await api.get(`/scans/${scanId}/report`);
  return data;
}

export async function getPricing(): Promise<
  Record<string, { item_code: string; unit: string; unit_cost: number }>
> {
  const { data } = await api.get("/config/pricing");
  return data;
}

export async function setPricing(
  pricing: Record<string, { item_code: string; unit: string; unit_cost: number }>,
): Promise<void> {
  await api.put("/config/pricing", pricing);
}

export async function getBranding(): Promise<{
  companyName: string;
  primary: string;
  footerDisclaimer: string;
}> {
  const { data } = await api.get("/config/branding");
  return data;
}

export async function setBranding(branding: {
  companyName: string;
  primary: string;
  footerDisclaimer: string;
}): Promise<void> {
  await api.put("/config/branding", branding);
}

export async function getAnalyticsSummary(): Promise<any> {
  const { data } = await api.get("/analytics/summary");
  return data;
}

export async function getPrioritized(): Promise<{
  rows: Array<{ scan: any; stats: any; priority: number }>;
}> {
  const { data } = await api.get("/analytics/prioritized");
  return data;
}
