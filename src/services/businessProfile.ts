import { BUSINESS_PROFILE } from "@/data/business";
import type { BusinessProfile } from "@/types/business";

const STORAGE_KEY = "businessProfileOverrides";

function deepMerge<T>(target: T, source: Partial<T>): T {
  const output: any = Array.isArray(target) ? [...(target as any)] : { ...(target as any) };
  if (!source) return output as T;
  Object.keys(source as any).forEach((key) => {
    const sVal: any = (source as any)[key];
    if (sVal === undefined) return;
    if (sVal && typeof sVal === "object" && !Array.isArray(sVal)) {
      (output as any)[key] = deepMerge((output as any)[key] ?? {}, sVal);
    } else {
      (output as any)[key] = sVal;
    }
  });
  return output as T;
}

export function loadOverrides(): Partial<BusinessProfile> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<BusinessProfile>;
  } catch {
    return null;
  }
}

export function saveOverrides(overrides: Partial<BusinessProfile>): void {
  try {
    const existing = loadOverrides() || {};
    const merged = deepMerge(existing, overrides);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

export function clearOverrides(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export async function saveOverridesToCloud(overrides: Partial<BusinessProfile>) {
  try {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);
    await supabase
      .from("business_overrides")
      .upsert({ id: "default", data: overrides, updated_at: new Date().toISOString() });
  } catch {
    /* ignore */
  }
}

export async function loadOverridesFromCloud(): Promise<Partial<BusinessProfile> | null> {
  try {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);
    const { data } = await supabase
      .from("business_overrides")
      .select("data")
      .eq("id", "default")
      .single();
    return (data?.data as Partial<BusinessProfile>) ?? null;
  } catch {
    return null;
  }
}

export function applyOverridesToGlobal(overrides: Partial<BusinessProfile> | null): void {
  if (!overrides) return;
  // Mutate BUSINESS_PROFILE in place so any module-level imports see fresh values
  // Materials, mix, coverage, pricing, fuel, crew, vehicles, equipment, travelDefaults, trailers
  if (overrides.address) Object.assign(BUSINESS_PROFILE.address, overrides.address);
  if (overrides.supplier) {
    BUSINESS_PROFILE.supplier = deepMerge(BUSINESS_PROFILE.supplier, overrides.supplier);
  }
  if (overrides.materials) Object.assign(BUSINESS_PROFILE.materials, overrides.materials);
  if (overrides.mix) Object.assign(BUSINESS_PROFILE.mix, overrides.mix);
  if (overrides.coverage) Object.assign(BUSINESS_PROFILE.coverage, overrides.coverage);
  if (overrides.pricing) Object.assign(BUSINESS_PROFILE.pricing, overrides.pricing);
  if (overrides.fuel) Object.assign(BUSINESS_PROFILE.fuel, overrides.fuel);
  if (overrides.crew) Object.assign(BUSINESS_PROFILE.crew, overrides.crew);
  if (overrides.vehicles)
    BUSINESS_PROFILE.vehicles = deepMerge(BUSINESS_PROFILE.vehicles, overrides.vehicles);
  if (overrides.equipment)
    BUSINESS_PROFILE.equipment = deepMerge(BUSINESS_PROFILE.equipment, overrides.equipment);
  if (overrides.trailers) BUSINESS_PROFILE.trailers = overrides.trailers;
  if (overrides.travelDefaults)
    Object.assign(BUSINESS_PROFILE.travelDefaults, overrides.travelDefaults);
}

export function getEffectiveBusinessProfile(): BusinessProfile {
  const overrides = loadOverrides();
  const merged = deepMerge(BUSINESS_PROFILE, overrides ?? {});
  return merged;
}
