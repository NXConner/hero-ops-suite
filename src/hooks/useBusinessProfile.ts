import { useCallback, useEffect, useMemo, useState } from "react";
import { BUSINESS_PROFILE } from "@/data/business";
import type { BusinessProfile } from "@/types/business";
import { applyOverridesToGlobal, clearOverrides, getEffectiveBusinessProfile, loadOverrides, saveOverrides } from "@/services/businessProfile";

export function useBusinessProfile() {
  const [overrides, setOverrides] = useState<Partial<BusinessProfile> | null>(null);
  const [profile, setProfile] = useState<BusinessProfile>(getEffectiveBusinessProfile());

  useEffect(() => {
    const loaded = loadOverrides();
    setOverrides(loaded);
    applyOverridesToGlobal(loaded);
    setProfile(getEffectiveBusinessProfile());
  }, []);

  const save = useCallback((patch: Partial<BusinessProfile>) => {
    saveOverrides(patch);
    const merged = getEffectiveBusinessProfile();
    setOverrides(loadOverrides());
    applyOverridesToGlobal(loadOverrides());
    setProfile(merged);
  }, []);

  const reset = useCallback(() => {
    clearOverrides();
    applyOverridesToGlobal(null);
    setOverrides(null);
    setProfile(getEffectiveBusinessProfile());
  }, []);

  return useMemo(() => ({ profile, overrides, save, reset }), [profile, overrides, save, reset]);
}