import { describe, it, expect } from "vitest";
import { getComplianceProfile, VA_PROFILE, NC_PROFILE } from "@/data/state-compliance";

describe("state-compliance profiles", () => {
  it("returns VA and NC profiles with required items", () => {
    const va = getComplianceProfile("VA");
    const nc = getComplianceProfile("NC");
    expect(va.name).toContain("Virginia");
    expect(nc.name).toContain("North Carolina");
    expect(va.items.some((i) => i.category === "licensing")).toBe(true);
    expect(nc.items.some((i) => i.category === "standards")).toBe(true);
  });

  it("exports objects consistent with named exports", () => {
    expect(VA_PROFILE.state).toBe("VA");
    expect(NC_PROFILE.state).toBe("NC");
  });
});
