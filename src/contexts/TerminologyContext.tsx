import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@/services/auth";

export type TerminologyMode = "military" | "civilian" | "both";

interface TerminologyContextValue {
  terminologyMode: TerminologyMode;
  setTerminologyMode: (mode: TerminologyMode) => void;
  getTerm: (military: string, civilian: string) => string;
}

const TerminologyContext = createContext<TerminologyContextValue | undefined>(undefined);

const TERMINOLOGY_STORAGE_KEY = "terminologyMode";

export const TerminologyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [terminologyMode, setTerminologyModeState] = useState<TerminologyMode>("civilian");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TERMINOLOGY_STORAGE_KEY) as TerminologyMode | null;
      if (stored === "military" || stored === "civilian" || stored === "both") {
        setTerminologyModeState(stored);
        return;
      }
    } catch {
      /* ignore */
    }

    try {
      const inferred = authService.getTerminologyForUser?.() as TerminologyMode | undefined;
      if (inferred) {
        setTerminologyModeState(inferred);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setTerminologyMode = useCallback((mode: TerminologyMode) => {
    setTerminologyModeState(mode);
    try {
      localStorage.setItem(TERMINOLOGY_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, []);

  const getTerm = useCallback(
    (military: string, civilian: string) => {
      switch (terminologyMode) {
        case "military":
          return military;
        case "civilian":
          return civilian;
        case "both":
          return `${military} / ${civilian}`;
        default:
          return military;
      }
    },
    [terminologyMode],
  );

  const value = useMemo(
    () => ({ terminologyMode, setTerminologyMode, getTerm }),
    [terminologyMode, setTerminologyMode, getTerm],
  );

  return <TerminologyContext.Provider value={value}>{children}</TerminologyContext.Provider>;
};

export const useTerminology = (): TerminologyContextValue => {
  const ctx = useContext(TerminologyContext);
  if (!ctx) {
    throw new Error("useTerminology must be used within a TerminologyProvider");
  }
  return ctx;
};
