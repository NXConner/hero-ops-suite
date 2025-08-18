export type StoredJob = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  address: string;
  serviceType: string;
  params: Record<string, any>;
};

const JOBS_KEY = "recentJobs";
const MAX_JOBS = 50;

function loadAll(): StoredJob[] {
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    return raw ? (JSON.parse(raw) as StoredJob[]) : [];
  } catch {
    return [];
  }
}

function saveAll(list: StoredJob[]) {
  try {
    localStorage.setItem(JOBS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

// Optional Supabase adapter (lazy)
async function getSupabaseClient(): Promise<any | null> {
  try {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(url, key);
  } catch {
    return null;
  }
}

export async function saveJob(
  job: Omit<StoredJob, "id" | "createdAt" | "updatedAt"> & { id?: string },
): Promise<StoredJob> {
  const list = loadAll();
  const now = Date.now();
  const id = job.id ?? crypto.randomUUID?.() ?? `${now}-${Math.random().toString(36).slice(2)}`;
  const existingIndex = list.findIndex((j) => j.id === id);
  const record: StoredJob = {
    id,
    name: job.name,
    address: job.address,
    serviceType: job.serviceType,
    params: job.params,
    createdAt: existingIndex >= 0 ? list[existingIndex].createdAt : now,
    updatedAt: now,
  };
  if (existingIndex >= 0) list.splice(existingIndex, 1, record);
  else list.unshift(record);
  if (list.length > MAX_JOBS) list.pop();
  saveAll(list);

  // Best-effort cloud sync
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from("jobs_estimator")
        .upsert({
          id: record.id,
          name: record.name,
          address: record.address,
          service_type: record.serviceType,
          params: record.params,
          created_at: new Date(record.createdAt).toISOString(),
          updated_at: new Date(record.updatedAt).toISOString(),
        });
    } catch {
      // ignore cloud errors
    }
  }

  return record;
}

export function listJobs(): StoredJob[] {
  return loadAll();
}

export function getJob(id: string): StoredJob | undefined {
  return loadAll().find((j) => j.id === id);
}

export async function deleteJob(id: string) {
  const list = loadAll().filter((j) => j.id !== id);
  saveAll(list);
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("jobs_estimator").delete().eq("id", id);
    } catch {
      /* ignore */
    }
  }
}
