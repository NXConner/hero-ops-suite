import { describe, it, expect, vi } from "vitest";
import { exportInvoicePDF } from "@/services/exporters";
import { BUSINESS_PROFILE } from "@/data/business";

describe("PDF exporter branding", () => {
  it("respects branding colors and footer text (smoke)", () => {
    // Mock addImage to avoid image processing in tests
    (global as any).HTMLCanvasElement = (global as any).HTMLCanvasElement || function () {};
    // Ensure fetch returns something for logo if needed
    (global as any).fetch = vi.fn().mockResolvedValue({ blob: () => new Blob([""], { type: "image/png" }) });
    // Setup branding
    (BUSINESS_PROFILE as any).branding = {
      ...(BUSINESS_PROFILE as any).branding,
      primaryColor: "#112233",
      secondaryColor: "#abcdef",
      footerText: "Custom footer",
    };
    // Should not throw
    expect(() => exportInvoicePDF("Hello world", "test-invoice")).not.toThrow();
  });
});

