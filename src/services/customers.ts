export type Customer = {
  id: string;
  name: string;
  address: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

const KEY = "customers";

function loadAll(): Customer[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Customer[]) : [];
  } catch {
    return [];
  }
}

function saveAll(list: Customer[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

export function listCustomers(): Customer[] {
  return loadAll();
}

export function saveCustomer(input: Omit<Customer, "id" | "createdAt" | "updatedAt"> & { id?: string }): Customer {
  const list = loadAll();
  const now = Date.now();
  const id = input.id ?? crypto.randomUUID?.() ?? `${now}-${Math.random().toString(36).slice(2)}`;
  const existingIndex = list.findIndex(c => c.id === id);
  const record: Customer = {
    id,
    name: input.name,
    address: input.address,
    notes: input.notes,
    createdAt: existingIndex >= 0 ? list[existingIndex].createdAt : now,
    updatedAt: now,
  };
  if (existingIndex >= 0) list.splice(existingIndex, 1, record);
  else list.unshift(record);
  saveAll(list);
  return record;
}

export function deleteCustomer(id: string) {
  const list = loadAll().filter(c => c.id !== id);
  saveAll(list);
}