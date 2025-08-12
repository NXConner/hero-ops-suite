import * as Print from "expo-print";
import { Overlay } from "../types/overlay";
import { EstimateResult } from "./costEstimator";
import { BRAND as DEFAULT_BRAND } from "../theme/branding";

type Brand = { companyName: string; primary: string; footerDisclaimer: string };

export async function generatePdfReport(params: {
  overlay: Overlay;
  estimate: EstimateResult;
  siteName?: string;
  brand?: Brand;
}): Promise<{ uri: string }> {
  const { overlay, estimate, siteName, brand = DEFAULT_BRAND } = params;
  const html = `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; padding: 24px; }
        h1 { color: ${brand.primary}; }
        .section { margin-top: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #eee; padding: 8px; text-align: left; }
        th { background: #fafafa; }
        .footer { margin-top: 24px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h1>${brand.companyName} — Asphalt Assessment</h1>
      <div>Site: ${siteName || "N/A"}</div>
      <div>Date: ${new Date(overlay.timestamp).toLocaleString()}</div>

      <div class="section">
        <h2>Dimensions</h2>
        <div>Perimeter (ft): ${overlay.dimensions?.perimeter_ft ?? "—"}</div>
        <div>Area (sqft): ${overlay.dimensions?.area_sqft ?? "—"}</div>
      </div>

      <div class="section">
        <h2>Defects Summary</h2>
        <div>Cracks: ${overlay.cracks.length}, Potholes: ${overlay.potholes.length}, Zones: ${overlay.distress_zones.length}</div>
      </div>

      <div class="section">
        <h2>Estimate</h2>
        <table>
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Unit</th><th>Unit Cost</th><th>Total</th></tr>
          </thead>
          <tbody>
            ${estimate.lines
              .map(
                (l) =>
                  `<tr><td>${l.description}</td><td>${l.quantity.toFixed(2)}</td><td>${l.unit}</td><td>$${l.unit_cost.toFixed(
                    2,
                  )}</td><td>$${l.total.toFixed(2)}</td></tr>`,
              )
              .join("")}
            <tr><td>Mobilization</td><td></td><td></td><td></td><td>$${estimate.mobilization.toFixed(2)}</td></tr>
          </tbody>
        </table>
        <div>Contingency: ${(estimate.contingencyPercent * 100).toFixed(0)}%</div>
        <h3>Total: $${estimate.total.toFixed(2)}</h3>
      </div>

      <div class="section">
        <h2>Recommendations</h2>
        <ul>
          ${(overlay.recommendations || []).map((r) => `<li>${r}</li>`).join("")}
        </ul>
      </div>

      <div class="footer">${brand.footerDisclaimer}</div>
    </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html });
  return { uri };
}
