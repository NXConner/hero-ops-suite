import { jsPDF } from "jspdf";
import type { StoredJob } from "@/services/jobs";
import type { Customer } from "@/services/customers";
import { BUSINESS_PROFILE } from "@/data/business";
import type { StateCode } from "@/data/state-compliance";
import { getComplianceProfile } from "@/data/state-compliance";

export function exportInvoicePDF(invoiceText: string, jobName: string = "invoice"): void {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 40;
  const maxWidth = 612 - margin * 2; // letter width in pts
  // Header
  doc.setFillColor(branding.primaryColor || "#0f172a");
  doc.rect(0, 0, 612, 90, "F");
  const company = BUSINESS_PROFILE.businessName || "Asphalt Company";
  const addr = BUSINESS_PROFILE.address?.full || "";
  const branding = BUSINESS_PROFILE.branding || {};
  // Optional logo
  const hasLogo = !!branding.logoUrl;
  if (hasLogo) {
    try {
      // Note: jsPDF needs a data URL. If a URL is provided, attempt fetch and convert.
      // This is best-effort and will be ignored on CORS failure.
      // Consumers can set branding.logoUrl to a data URL for reliability.
      // @ts-ignore

      (async () => {
        try {
          if (branding.logoUrl && branding.logoUrl.startsWith("data:")) {
            doc.addImage(branding.logoUrl, "PNG", margin, 12, 120, 60, undefined, "FAST");
          } else if (branding.logoUrl) {
            try {
              const res = await fetch(branding.logoUrl);
              const blob = await res.blob();
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  doc.addImage(
                    String(reader.result),
                    "PNG",
                    margin,
                    12,
                    120,
                    60,
                    undefined,
                    "FAST",
                  );
                } catch (e) {
                  /* ignore addImage failure */
                }
              };
              reader.readAsDataURL(blob);
            } catch (e) {
              // ignore logo fetch errors
            }
          }
        } catch (e) {
          // ignore inner logo processing errors
        }
      })();
    } catch (e) {
      // ignore outer logo rendering errors
    }
  }
  doc.setTextColor(branding.secondaryColor || "#22d3ee");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(company, hasLogo ? margin + 130 : margin, 40);
  if (addr) {
    doc.setTextColor("#cbd5e1");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(addr, hasLogo ? margin + 130 : margin, 56);
  }
  const contactLine = [branding.phone, branding.email, branding.website]
    .filter(Boolean)
    .join("  •  ");
  if (contactLine) {
    doc.setTextColor("#a3b2c2");
    doc.setFontSize(9);
    doc.text(contactLine, hasLogo ? margin + 130 : margin, 72);
  }
  doc.setTextColor("#94a3b8");
  doc.setFontSize(10);
  doc.text("Estimate / Invoice", 480, 45, { align: "right" });

  // Body
  const lines = doc.splitTextToSize(invoiceText, maxWidth);
  doc.setTextColor("#0f172a");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  let y = margin + 70;
  lines.forEach((line: string) => {
    if (y > 700) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 16;
  });

  // Footer: terms and signature
  const terms = branding.footerText ||
    "Terms: Net 30. Prices valid 30 days. Work scheduled weather permitting.";
  y += 12;
  if (y > 730) {
    doc.addPage();
    y = margin;
  }
  doc.setDrawColor("#94a3b8");
  doc.line(margin, y, 612 - margin, y);
  y += 16;
  doc.setTextColor("#475569");
  doc.setFontSize(10);
  doc.text(terms, margin, y);
  y += 28;
  doc.setTextColor("#0f172a");
  doc.text("Customer Signature: ________________________________   Date: ____________", margin, y);
  doc.save(`${sanitize(jobName)}.pdf`);
}

function sanitize(name: string): string {
  return name.replace(/[^a-z0-9\-_]+/gi, "_").slice(0, 80) || "invoice";
}

export function exportJobsCSV(jobs: StoredJob[]): string {
  const header = ["id", "name", "address", "serviceType", "updatedAt", "params"];
  const rows = jobs.map((j) => [
    j.id,
    j.name,
    j.address,
    j.serviceType,
    new Date(j.updatedAt).toISOString(),
    JSON.stringify(j.params),
  ]);
  return toCSV([header, ...rows]);
}

export function exportCustomersCSV(customers: Customer[]): string {
  const header = ["id", "name", "address", "notes", "updatedAt"];
  const rows = customers.map((c) => [
    c.id,
    c.name,
    c.address,
    c.notes || "",
    new Date(c.updatedAt).toISOString(),
  ]);
  return toCSV([header, ...rows]);
}

function toCSV(rows: (string | number)[][]): string {
  const esc = (v: any) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}

export function downloadTextFile(data: string, filename: string, mime = "text/plain") {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportComplianceChecklistPDF(
  state: StateCode,
  jobName: string = "compliance",
): void {
  const profile = getComplianceProfile(state);
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 40;
  const maxWidth = 612 - margin * 2;

  // Header
  doc.setFillColor("#0f172a");
  doc.rect(0, 0, 612, 70, "F");
  doc.setTextColor("#22d3ee");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(
    `${BUSINESS_PROFILE.businessName || "Company"} — ${profile.name} Compliance Checklist`,
    margin,
    40,
  );

  let y = margin + 60;
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#0f172a");
  doc.setFontSize(11);

  const categoryOrder: Array<ReturnType<typeof groupBy>[number]["category"]> = [
    "licensing",
    "permits",
    "standards",
    "safety",
    "environment",
    "transport",
    "tax",
    "insurance",
  ];

  const groups = groupBy(profile.items, "category");
  for (const cat of categoryOrder) {
    const items = groups.filter((g) => g.category === cat)[0]?.items || [];
    if (items.length === 0) continue;
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
    // category heading
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#334155");
    doc.text(capitalize(cat), margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#0f172a");
    for (const item of items) {
      if (y > 740) {
        doc.addPage();
        y = margin;
      }
      const line = `□ ${item.label}${item.required ? " (Required)" : ""}`;
      const lines = doc.splitTextToSize(line, maxWidth);
      lines.forEach((ln: string) => {
        doc.text(ln, margin, y);
        y += 14;
      });
    }
    y += 6;
  }

  doc.save(`${sanitize(jobName)}_${profile.state}_compliance.pdf`);
}

function groupBy<T extends Record<string, any>>(
  arr: T[],
  key: keyof T,
): Array<{ category: any; items: T[] }> {
  const map = new Map<any, T[]>();
  for (const el of arr) {
    const k = el[key];
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(el);
  }
  return Array.from(map.entries())
    .map(([category, items]) => ({ category, items }))
    .sort((a, b) => String(a.category).localeCompare(String(b.category)));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
