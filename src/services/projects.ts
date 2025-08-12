export type ProjectStatus = 'planned' | 'scheduled' | 'in_progress' | 'completed' | 'archived';

export type Project = {
  id: string;
  name: string;
  address: string;
  status: ProjectStatus;
  serviceType?: string;
  estimate?: any;
  createdAt: number;
  updatedAt: number;
};

const KEY = 'projects';

function loadAll(): Project[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') as Project[]; } catch { return []; }
}

function saveAll(list: Project[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

async function getSupabaseClient(): Promise<any | null> {
  try {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(url, key);
  } catch { return null; }
}

export function listProjects(): Project[] { return loadAll(); }

export async function saveProject(input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Project> {
  const list = loadAll();
  const now = Date.now();
  const id = input.id ?? crypto.randomUUID?.() ?? `${now}-${Math.random().toString(36).slice(2)}`;
  const idx = list.findIndex(p => p.id === id);
  const record: Project = { id, name: input.name, address: input.address, status: input.status, serviceType: input.serviceType, estimate: input.estimate, createdAt: idx >= 0 ? list[idx].createdAt : now, updatedAt: now };
  if (idx >= 0) list.splice(idx, 1, record); else list.unshift(record);
  saveAll(list);
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('projects').upsert({ id: record.id, name: record.name, address: record.address, status: record.status, service_type: record.serviceType, estimate: record.estimate, created_at: new Date(record.createdAt).toISOString(), updated_at: new Date(record.updatedAt).toISOString() });
    } catch { /* ignore */ }
  }
  return record;
}

export async function deleteProject(id: string) {
  const list = loadAll().filter(p => p.id !== id);
  saveAll(list);
  const supabase = await getSupabaseClient();
  if (supabase) { try { await supabase.from('projects').delete().eq('id', id); } catch { /* ignore */ } }
}