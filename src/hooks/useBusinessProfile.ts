import { useCallback, useEffect, useMemo, useState } from "react";
import { BUSINESS_PROFILE } from "@/data/business";
import type { BusinessProfile } from "@/types/business";
import {
  applyOverridesToGlobal,
  clearOverrides,
  getEffectiveBusinessProfile,
  loadOverrides,
  saveOverrides,
  loadOverridesFromCloud,
  saveOverridesToCloud,
} from "@/services/businessProfile";

export function useBusinessProfile() {
  const [overrides, setOverrides] = useState<Partial<BusinessProfile> | null>(null);
  const [profile, setProfile] = useState<BusinessProfile>(getEffectiveBusinessProfile());

  useEffect(() => {
    (async () => {
      const local = loadOverrides();
      const remote = await loadOverridesFromCloud();
      const initial = remote || local;
      setOverrides(initial);
      applyOverridesToGlobal(initial);
      setProfile(getEffectiveBusinessProfile());
    })();
  }, []);

  const save = useCallback((patch: Partial<BusinessProfile>) => {
    saveOverrides(patch);
    const merged = getEffectiveBusinessProfile();
    setOverrides(loadOverrides());
    applyOverridesToGlobal(loadOverrides());
    setProfile(merged);
    // persist to cloud best-effort
    void saveOverridesToCloud(loadOverrides() || {});
  }, []);

  const reset = useCallback(() => {
    clearOverrides();
    applyOverridesToGlobal(null);
    setOverrides(null);
    setProfile(getEffectiveBusinessProfile());
    void saveOverridesToCloud({});
  }, []);

  return useMemo(() => ({ profile, overrides, save, reset }), [profile, overrides, save, reset]);
}
