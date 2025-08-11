import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const dataDir = path.join(__dirname, 'data');
const overlaysDir = path.join(dataDir, 'overlays');
await fs.ensureDir(overlaysDir);

const scans = new Map();
const jobs = new Map();
const invoices = new Map();

function id() {
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).toLowerCase();
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/scans', async (req, res) => {
  const scan_id = id();
  const scan = {
    scan_id,
    site_id: req.body.site_id || null,
    client_id: req.body.client_id || null,
    timestamp: new Date().toISOString(),
    perimeter_ft: req.body.perimeter_ft || null,
    area_sqft: req.body.area_sqft || null,
    mesh_url: req.body.mesh_url || null,
  };
  scans.set(scan_id, scan);
  res.json({ scan_id, upload_urls: {} });
});

app.post('/scans/:id/overlay', async (req, res) => {
  const scan_id = req.params.id;
  if (!scans.has(scan_id)) return res.status(404).json({ error: 'not_found' });
  const overlay = req.body || {};
  const file = path.join(overlaysDir, `${scan_id}.json`);
  await fs.writeJson(file, overlay, { spaces: 2 });
  res.json({ ok: true });
});

app.get('/scans/:id', async (req, res) => {
  const scan_id = req.params.id;
  const scan = scans.get(scan_id);
  if (!scan) return res.status(404).json({ error: 'not_found' });
  const file = path.join(overlaysDir, `${scan_id}.json`);
  const overlay = (await fs.pathExists(file)) ? await fs.readJson(file) : null;
  res.json({ scan, overlay });
});

app.get('/scans/:id/report', async (req, res) => {
  const scan_id = req.params.id;
  if (!scans.has(scan_id)) return res.status(404).json({ error: 'not_found' });
  res.json({ pdf_url: `https://example.com/reports/${scan_id}.pdf` });
});

app.post('/jobs', async (req, res) => {
  const job_id = id();
  jobs.set(job_id, { job_id, ...req.body, status: 'draft', created_at: new Date().toISOString() });
  res.json({ job_id });
});

app.post('/invoices', async (req, res) => {
  const invoice_id = id();
  invoices.set(invoice_id, { invoice_id, ...req.body, status: 'draft', created_at: new Date().toISOString() });
  res.json({ invoice_id });
});

app.get('/analytics/summary', async (req, res) => {
  res.json({
    sites: scans.size,
    jobs: jobs.size,
    invoices: invoices.size,
    totals: { cracks_ft: 0, potholes_sqft: 0 },
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API server listening on http://localhost:${port}`));