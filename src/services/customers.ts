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

async function getSupabaseClient(): Promise<any | null> {
  try {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(url, key);
  } catch {
    return null;
  }
}

export function listCustomers(): Customer[] {
  return loadAll();
}

export async function saveCustomer(input: Omit<Customer, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<Customer> {
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

  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('customers').upsert({ id: record.id, name: record.name, address: record.address, notes: record.notes ?? '', created_at: new Date(record.createdAt).toISOString(), updated_at: new Date(record.updatedAt).toISOString() });
    } catch { /* ignore */ }
  }

  return record;
}

export async function deleteCustomer(id: string) {
  const list = loadAll().filter(c => c.id !== id);
  saveAll(list);
  const supabase = await getSupabaseClient();
  if (supabase) {
    try { await supabase.from('customers').delete().eq('id', id); } catch { /* ignore */ }
  }
}