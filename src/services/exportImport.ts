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