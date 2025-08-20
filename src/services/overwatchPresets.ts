// Best-effort cloud persistence for OverWatch layer presets via Supabase.
// Stores presets JSON under business_overrides with id 'overwatch_presets'.

export type LayerPreset = {
  id: string;
  name: string;
  selectedMapService: string;
  activeOverlays: string[];
  mapCenter: [number, number];
  mapZoom: number;
};

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

export async function saveLayerPresetsToCloud(presets: LayerPreset[]): Promise<void> {
  const supabase = await getSupabaseClient();
  if (!supabase) return;
  try {
    await supabase
      .from("business_overrides")
      .upsert({ id: "overwatch_presets", data: { presets }, updated_at: new Date().toISOString() });
  } catch {
    // ignore cloud errors
  }
}

export async function loadLayerPresetsFromCloud(): Promise<LayerPreset[] | null> {
  const supabase = await getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("business_overrides")
      .select("data")
      .eq("id", "overwatch_presets")
      .single();
    const presets = (data?.data?.presets as LayerPreset[]) || null;
    return Array.isArray(presets) ? presets : null;
  } catch {
    return null;
  }
}

