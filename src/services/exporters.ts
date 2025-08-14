import { jsPDF } from 'jspdf';
import type { StoredJob } from '@/services/jobs';
import type { Customer } from '@/services/customers';
import { BUSINESS_PROFILE } from '@/data/business';

export function exportInvoicePDF(invoiceText: string, jobName: string = 'invoice'): void {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 40;
  const maxWidth = 612 - margin * 2; // letter width in pts
  // Header
  doc.setFillColor('#0f172a');
  doc.rect(0, 0, 612, 70, 'F');
  const company = BUSINESS_PROFILE.businessName || 'Asphalt Company';
  const addr = BUSINESS_PROFILE.address?.full || '';
  doc.setTextColor('#22d3ee');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(company, margin, 40);
  if (addr) {
    doc.setTextColor('#cbd5e1');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(addr, margin, 56);
  }
  doc.setTextColor('#94a3b8');
  doc.setFontSize(10);
  doc.text('Estimate / Invoice', 480, 45, { align: 'right' });

  // Body
  const lines = doc.splitTextToSize(invoiceText, maxWidth);
  doc.setTextColor('#0f172a');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  let y = margin + 50;
  lines.forEach((line: string) => {
    if (y > 700) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 16;
  });

  // Footer: terms and signature
  const terms = 'Terms: Net 30. Prices valid 30 days. Work scheduled weather permitting.';
  y += 12;
  if (y > 730) { doc.addPage(); y = margin; }
  doc.setDrawColor('#94a3b8');
  doc.line(margin, y, 612 - margin, y);
  y += 16;
  doc.setTextColor('#475569');
  doc.setFontSize(10);
  doc.text(terms, margin, y);
  y += 28;
  doc.setTextColor('#0f172a');
  doc.text('Customer Signature: ________________________________   Date: ____________', margin, y);
  doc.save(`${sanitize(jobName)}.pdf`);
}

function sanitize(name: string): string {
  return name.replace(/[^a-z0-9\-_]+/gi, '_').slice(0, 80) || 'invoice';
}

export function exportJobsCSV(jobs: StoredJob[]): string {
  const header = ['id','name','address','serviceType','updatedAt','params'];
  const rows = jobs.map(j => [
    j.id,
    j.name,
    j.address,
    j.serviceType,
    new Date(j.updatedAt).toISOString(),
    JSON.stringify(j.params)
  ]);
  return toCSV([header, ...rows]);
}

export function exportCustomersCSV(customers: Customer[]): string {
  const header = ['id','name','address','notes','updatedAt'];
  const rows = customers.map(c => [
    c.id,
    c.name,
    c.address,
    c.notes || '',
    new Date(c.updatedAt).toISOString()
  ]);
  return toCSV([header, ...rows]);
}

function toCSV(rows: (string|number)[][]): string {
  const esc = (v: any) => {
    const s = String(v ?? '');
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  return rows.map(r => r.map(esc).join(',')).join('\n');
}

export function downloadTextFile(data: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}