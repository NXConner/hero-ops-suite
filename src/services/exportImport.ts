import { loadOverrides, saveOverrides, applyOverridesToGlobal } from "@/services/businessProfile";
import { listJobs, saveJob, type StoredJob } from "@/services/jobs";
import { listCustomers, saveCustomer, type Customer } from "@/services/customers";

export type ExportBundle = {
  version: number;
  exportedAt: number;
  settingsOverrides: any | null;
  jobs: StoredJob[];
  customers: Customer[];
};

export function exportSettingsOverrides(): string {
  return JSON.stringify(loadOverrides() ?? {}, null, 2);
}

export function importSettingsOverrides(data: any) {
  if (!data || typeof data !== 'object') return;
  saveOverrides(data);
  applyOverridesToGlobal(data);
}

export function exportJobs(): string {
  return JSON.stringify(listJobs(), null, 2);
}

export function importJobs(jobs: StoredJob[]) {
  if (!Array.isArray(jobs)) return;
  jobs.forEach(j => {
    // Save will upsert; keep original timestamps
    saveJob({
      id: j.id,
      name: j.name,
      address: j.address,
      serviceType: j.serviceType,
      params: j.params,
    });
  });
}

export function exportCustomers(): string {
  return JSON.stringify(listCustomers(), null, 2);
}

export function importCustomers(customers: Customer[]) {
  if (!Array.isArray(customers)) return;
  customers.forEach(c => {
    saveCustomer({ id: c.id, name: c.name, address: c.address, notes: c.notes });
  });
}

export function exportAll(): string {
  const bundle: ExportBundle = {
    version: 1,
    exportedAt: Date.now(),
    settingsOverrides: loadOverrides(),
    jobs: listJobs(),
    customers: listCustomers(),
  };
  return JSON.stringify(bundle, null, 2);
}

export function importAll(bundle: ExportBundle) {
  if (!bundle || typeof bundle !== 'object') return;
  if (bundle.settingsOverrides) importSettingsOverrides(bundle.settingsOverrides);
  if (Array.isArray(bundle.jobs)) importJobs(bundle.jobs);
  if (Array.isArray(bundle.customers)) importCustomers(bundle.customers);
}

export type CSVRow = Record<string, string>;

export interface CSVMapping {
  columns: Record<string, string>; // map incoming header -> field name
}

export interface CSVImportResult<T> {
  rows: T[];
  errors: { row: number; message: string }[];
}

export function parseCSV(raw: string): { header: string[]; rows: string[][] } {
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { header: [], rows: [] };
  const header = splitCsvLine(lines[0]);
  const rows = lines.slice(1).map(splitCsvLine);
  return { header, rows };
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result.map(s => s.trim());
}

export function importCSVWithMapping<T = any>(raw: string, mapping: CSVMapping, validator: (row: CSVRow) => string | null, projector: (row: CSVRow) => T): CSVImportResult<T> {
  const { header, rows } = parseCSV(raw);
  const errors: { row: number; message: string }[] = [];
  if (header.length === 0) return { rows: [], errors: [{ row: 0, message: 'Missing header' }] };
  const headerSet = new Set(header);
  const mappedRows: T[] = [];
  rows.forEach((cols, idx) => {
    const rowObj: CSVRow = {};
    header.forEach((h, i) => { rowObj[h] = cols[i] ?? ''; });
    const error = validator(rowObj);
    if (error) {
      errors.push({ row: idx + 2, message: error });
      return;
    }
    const projected: any = {};
    Object.entries(mapping.columns).forEach(([incoming, field]) => {
      projected[field] = rowObj[incoming] ?? '';
    });
    try {
      mappedRows.push(projector(projected));
    } catch (e: any) {
      errors.push({ row: idx + 2, message: e?.message || 'Projection error' });
    }
  });
  return { rows: mappedRows, errors };
}