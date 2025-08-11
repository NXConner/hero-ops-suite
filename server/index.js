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

// List scans
app.get('/scans', async (req, res) => {
  const list = Array.from(scans.values());
  res.json({ scans: list });
});

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

// Upload overlay
app.post('/scans/:id/overlay', async (req, res) => {
  const scan_id = req.params.id;
  if (!scans.has(scan_id)) return res.status(404).json({ error: 'not_found' });
  const overlay = req.body || {};
  const file = path.join(overlaysDir, `${scan_id}.json`);
  await fs.writeJson(file, overlay, { spaces: 2 });
  res.json({ ok: true });
});

// Get overlay only
app.get('/scans/:id/overlay', async (req, res) => {
  const scan_id = req.params.id;
  if (!scans.has(scan_id)) return res.status(404).json({ error: 'not_found' });
  const file = path.join(overlaysDir, `${scan_id}.json`);
  if (!(await fs.pathExists(file))) return res.status(404).json({ error: 'no_overlay' });
  const overlay = await fs.readJson(file);
  res.json(overlay);
});

// Get scan with overlay
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

function computeOverlayStats(overlay) {
  if (!overlay) return { cracks_ft: 0, potholes_sqft: 0, gator_sqft: 0, pooling_sqft: 0, score: 0 };
  const cracks_ft = (overlay.cracks || []).reduce((a, c) => a + (c.length_ft || 0), 0);
  const potholes_sqft = (overlay.potholes || []).reduce((a, p) => a + (p.area_sqft || 0), 0);
  const gator_sqft = (overlay.distress_zones || [])
    .filter((d) => d.type === 'gatoring')
    .reduce((a, d) => a + (d.area_sqft || 0), 0);
  const pooling_sqft = overlay.slope_analysis?.pooling_area_sqft || 0;
  const score = cracks_ft * 0.5 + potholes_sqft * 2 + gator_sqft * 1.2 + pooling_sqft * 1.5;
  return { cracks_ft, potholes_sqft, gator_sqft, pooling_sqft, score };
}

app.get('/analytics/summary', async (req, res) => {
  let totals = { sites: 0, cracks_ft: 0, potholes_sqft: 0, gator_sqft: 0, pooling_sqft: 0, score: 0 };
  for (const scan of scans.values()) {
    totals.sites += 1;
    const file = path.join(overlaysDir, `${scan.scan_id}.json`);
    const overlay = (await fs.pathExists(file)) ? await fs.readJson(file) : null;
    const s = computeOverlayStats(overlay);
    totals.cracks_ft += s.cracks_ft;
    totals.potholes_sqft += s.potholes_sqft;
    totals.gator_sqft += s.gator_sqft;
    totals.pooling_sqft += s.pooling_sqft;
    totals.score += s.score;
  }
  res.json({ totals });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API server listening on http://localhost:${port}`));