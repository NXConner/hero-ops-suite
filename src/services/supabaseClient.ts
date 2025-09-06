import type { SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null | undefined;

export function isSupabaseEnabled(): boolean {
  try {
    const url = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined;
    const key = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string | undefined;
    return Boolean(url && key && url.trim() && key.trim());
  } catch {
    return false;
  }
}

export async function getSupabase(): Promise<SupabaseClient | null> {
  if (cachedClient !== undefined) return (cachedClient as SupabaseClient | null) ?? null;
  if (!isSupabaseEnabled()) {
    cachedClient = null;
    return null;
  }
  try {
    const url = (import.meta as any).env.VITE_SUPABASE_URL as string;
    const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;
    const { createClient } = await import("@supabase/supabase-js");
    cachedClient = createClient(url, key);
    return cachedClient;
  } catch {
    cachedClient = null;
    return null;
  }
}

