import { jsPDF } from 'jspdf';
import type { StoredJob } from '@/services/jobs';
import type { Customer } from '@/services/customers';

export function exportInvoicePDF(invoiceText: string, jobName: string = 'invoice'): void {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 40;
  const maxWidth = 612 - margin * 2; // letter width in pts
  const lines = doc.splitTextToSize(invoiceText, maxWidth);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  let y = margin;
  lines.forEach((line: string) => {
    if (y > 750) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 16;
  });
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