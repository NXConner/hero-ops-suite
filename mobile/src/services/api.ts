import axios from 'axios';
import { Overlay } from '../types/overlay';
import { CONFIG } from '../config';

const api = axios.create({ baseURL: CONFIG.API_BASE_URL });

export async function createScan(payload: {
  site_id?: string;
  client_id?: string;
  perimeter_ft?: number;
  area_sqft?: number;
  mesh_url?: string;
}): Promise<{ scan_id: string; upload_urls?: Record<string, string> }> {
  const { data } = await api.post('/scans', payload);
  return data;
}

export async function uploadOverlay(scanId: string, overlay: Overlay): Promise<void> {
  await api.post(`/scans/${scanId}/overlay`, overlay);
}

export async function getScan(scanId: string): Promise<{ scan: any; overlay: Overlay | null }> {
  const { data } = await api.get(`/scans/${scanId}`);
  return data;
}

export async function getReport(scanId: string): Promise<{ pdf_url: string }> {
  const { data } = await api.get(`/scans/${scanId}/report`);
  return data;
}

export async function createJob(payload: any): Promise<{ job_id: string }> {
  const { data } = await api.post('/jobs', payload);
  return data;
}

export async function createInvoice(payload: any): Promise<{ invoice_id: string }> {
  const { data } = await api.post('/invoices', payload);
  return data;
}

export async function getAnalyticsSummary(): Promise<any> {
  const { data } = await api.get('/analytics/summary');
  return data;
}