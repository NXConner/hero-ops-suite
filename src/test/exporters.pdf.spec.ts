import { describe, it, expect, vi } from "vitest";
import { exportInvoicePDF, exportInvoiceTablePDF } from "@/services/exporters";
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

  it("table export renders without throwing", () => {
    const est: any = {
      projectDescription: "Sealcoating 3000 sq ft",
      materials: [{ label: "PMM", cost: 120, quantity: 33, unit: "gal" }],
      labor: [{ label: "Crew Labor", cost: 200 }],
      equipmentAndFuel: [{ label: "Travel Fuel", cost: 50 }],
      mobilization: [{ label: "Mobilization", cost: 250 }],
      subtotal: 620,
      overhead: { label: "Overhead (10%)", cost: 62 },
      profit: { label: "Profit (18%)", cost: 123 },
      total: 805,
    };
    expect(() => exportInvoiceTablePDF(est, "test-invoice-table")).not.toThrow();
  });
});

