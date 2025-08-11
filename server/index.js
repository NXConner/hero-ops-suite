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
const scansFile = path.join(dataDir, 'scans.json');
const pricingFile = path.join(dataDir, 'pricing.json');
const brandingFile = path.join(dataDir, 'branding.json');
await fs.ensureDir(overlaysDir);
await fs.ensureDir(dataDir);

const scans = new Map();
const jobs = new Map();
const invoices = new Map();

function id() {
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).toLowerCase();
}

async function loadState() {
  if (await fs.pathExists(scansFile)) {
    const list = await fs.readJson(scansFile);
    for (const s of list) scans.set(s.scan_id, s);
  }
  if (!(await fs.pathExists(pricingFile))) {
    const defaults = {
      CRACK_SEAL: { item_code: 'CRACK_SEAL', unit: 'ft', unit_cost: 1.5 },
      POTHOLE_PATCH: { item_code: 'POTHOLE_PATCH', unit: 'sqft', unit_cost: 12 },
      GATOR_REPAIR: { item_code: 'GATOR_REPAIR', unit: 'sqft', unit_cost: 6.5 },
      REGRADING: { item_code: 'REGRADING', unit: 'sqft', unit_cost: 4 },
    };
    await fs.writeJson(pricingFile, defaults, { spaces: 2 });
  }
  if (!(await fs.pathExists(brandingFile))) {
    const defaults = {
      companyName: 'Nate Asphalt Co.',
      primary: '#0b6bcb',
      footerDisclaimer: 'This report is an engineering aid. Field conditions may vary.',
    };
    await fs.writeJson(brandingFile, defaults, { spaces: 2 });
  }
}

async function saveScans() {
  const list = Array.from(scans.values());
  await fs.writeJson(scansFile, list, { spaces: 2 });
}

await loadState();

app.get('/health', (req, res) => res.json({ ok: true }));

// Config endpoints
app.get('/config/pricing', async (req, res) => {
  const pricing = await fs.readJson(pricingFile);
  res.json(pricing);
});

app.put('/config/pricing', async (req, res) => {
  const pricing = req.body || {};
  await fs.writeJson(pricingFile, pricing, { spaces: 2 });
  res.json({ ok: true });
});

app.get('/config/branding', async (req, res) => {
  const branding = await fs.readJson(brandingFile);
  res.json(branding);
});

app.put('/config/branding', async (req, res) => {
  const branding = req.body || {};
  await fs.writeJson(brandingFile, branding, { spaces: 2 });
  res.json({ ok: true });
});

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
  await saveScans();
  res.json({ scan_id, upload_urls: {} });
});

app.put('/scans/:id', async (req, res) => {
  const scan_id = req.params.id;
  const scan = scans.get(scan_id);
  if (!scan) return res.status(404).json({ error: 'not_found' });
  const updates = req.body || {};
  const updated = { ...scan, ...updates };
  scans.set(scan_id, updated);
  await saveScans();
  res.json({ scan: updated });
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

app.get('/jobs', async (req, res) => {
  const scan_id = req.query.scan_id;
  const list = Array.from(jobs.values()).filter((j) => (scan_id ? j.scan_id === scan_id : true));
  res.json({ jobs: list });
});

const messages = [];
app.get('/messages', async (req, res) => {
  const scan_id = req.query.scan_id;
  const list = messages.filter((m) => (scan_id ? m.scan_id === scan_id : true));
  res.json({ messages: list });
});

app.post('/messages', async (req, res) => {
  const msg = { id: id(), ...req.body, timestamp: new Date().toISOString() };
  messages.push(msg);
  res.json({ message: msg });
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

app.get('/analytics/prioritized', async (req, res) => {
  const rows = [];
  for (const scan of scans.values()) {
    const file = path.join(overlaysDir, `${scan.scan_id}.json`);
    const overlay = (await fs.pathExists(file)) ? await fs.readJson(file) : null;
    const stats = computeOverlayStats(overlay);
    const priority = stats.score; // simple prioritization
    rows.push({ scan, stats, priority });
  }
  rows.sort((a, b) => b.priority - a.priority);
  res.json({ rows });
});

// Server-side estimate based on saved pricing
function estimateCosts(overlay, pricing) {
  const lines = [];
  const crackLengthFt = (overlay.cracks || []).reduce((acc, c) => acc + (c.length_ft || 0), 0);
  if (crackLengthFt > 0 && pricing.CRACK_SEAL) {
    const p = pricing.CRACK_SEAL;
    lines.push({ item_code: 'CRACK_SEAL', description: 'Crack sealing (hot-pour)', quantity: crackLengthFt, unit: p.unit, unit_cost: p.unit_cost, total: crackLengthFt * p.unit_cost });
  }
  const potholeAreaSqft = (overlay.potholes || []).reduce((acc, p) => acc + (p.area_sqft || 0), 0);
  if (potholeAreaSqft > 0 && pricing.POTHOLE_PATCH) {
    const p = pricing.POTHOLE_PATCH;
    lines.push({ item_code: 'POTHOLE_PATCH', description: 'Pothole patch', quantity: potholeAreaSqft, unit: p.unit, unit_cost: p.unit_cost, total: potholeAreaSqft * p.unit_cost });
  }
  const gatorAreaSqft = (overlay.distress_zones || []).filter((d) => d.type === 'gatoring').reduce((acc, d) => acc + (d.area_sqft || 0), 0);
  if (gatorAreaSqft > 0 && pricing.GATOR_REPAIR) {
    const p = pricing.GATOR_REPAIR;
    lines.push({ item_code: 'GATOR_REPAIR', description: 'Gatoring repair', quantity: gatorAreaSqft, unit: p.unit, unit_cost: p.unit_cost, total: gatorAreaSqft * p.unit_cost });
  }
  const poolingAreaSqft = overlay.slope_analysis?.pooling_area_sqft || 0;
  if (poolingAreaSqft > 0 && pricing.REGRADING) {
    const p = pricing.REGRADING;
    lines.push({ item_code: 'REGRADING', description: 'Regrading/leveling', quantity: poolingAreaSqft, unit: p.unit, unit_cost: p.unit_cost, total: poolingAreaSqft * p.unit_cost });
  }
  const mobilization = 250;
  const contingencyPercent = 0.1;
  const subtotal = lines.reduce((acc, l) => acc + l.total, 0) + mobilization;
  const total = subtotal * (1 + contingencyPercent);
  return { lines, mobilization, contingencyPercent, subtotal, total };
}

app.post('/estimate/:id', async (req, res) => {
  const scan_id = req.params.id;
  if (!scans.has(scan_id)) return res.status(404).json({ error: 'not_found' });
  const file = path.join(overlaysDir, `${scan_id}.json`);
  if (!(await fs.pathExists(file))) return res.status(404).json({ error: 'no_overlay' });
  const overlay = await fs.readJson(file);
  const pricing = await fs.readJson(pricingFile);
  const estimate = estimateCosts(overlay, pricing);
  res.json(estimate);
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API server listening on http://localhost:${port}`));