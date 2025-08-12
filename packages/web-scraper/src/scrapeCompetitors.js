import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { load as loadHtml } from 'cheerio';
import pLimit from 'p-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USER_AGENT = 'AsphaltIntelBot/0.1 (+https://example.com/bot-info)';

const KEYWORDS = [
  'asphalt',
  'paving',
  'sealcoat',
  'sealcoating',
  'crack seal',
  'crack sealing',
  'pothole',
  'milling',
  'striping',
  'line striping',
  'overlay',
  'resurfacing',
  'chip seal',
  'slurry seal',
  'parking lot',
  'driveway',
  'ADA',
  'ADA compliance'
];

async function readTargets() {
  const targetsPath = path.resolve(__dirname, '../config/targets.json');
  if (!(await fs.pathExists(targetsPath))) return [];
  const list = await fs.readJson(targetsPath);
  return list;
}

function countKeywords(text) {
  const counts = {};
  const lower = text.toLowerCase();
  for (const k of KEYWORDS) {
    const re = new RegExp(`\\b${k.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const matches = lower.match(re);
    counts[k] = matches ? matches.length : 0;
  }
  return counts;
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'user-agent': USER_AGENT, accept: 'text/html' } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${url}`);
  return await res.text();
}

function extractInfo(url, html) {
  const $ = loadHtml(html);
  const title = $('title').first().text().trim();
  const description = $('meta[name="description"]').attr('content') || '';
  const h1 = $('h1').slice(0, 3).map((_, el) => $(el).text().trim()).get();
  const h2 = $('h2').slice(0, 5).map((_, el) => $(el).text().trim()).get();
  const text = $('body').text().replace(/\s+/g, ' ');
  const keywords = countKeywords(text);
  const links = $('a[href]').slice(0, 50).map((_, el) => $(el).attr('href')).get();
  return { url, title, description, h1, h2, keywords, sample_links: links };
}

export async function scrapeCompetitors() {
  const targets = await readTargets();
  const limit = pLimit(4);
  const results = [];

  const tasks = targets.map((t) => limit(async () => {
    const domain = t.domain.replace(/\/$/, '');
    const pages = t.pages && t.pages.length ? t.pages : [''];
    const out = { domain, pages: [], last_scraped_at: new Date().toISOString(), company: t.company || null, region: t.region || null };
    for (const page of pages) {
      const url = page ? `${domain}${page.startsWith('/') ? page : `/${page}`}` : domain;
      try {
        const html = await fetchHtml(url);
        const info = extractInfo(url, html);
        out.pages.push(info);
      } catch (e) {
        out.pages.push({ url, error: e.message });
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    results.push(out);
  }));

  await Promise.all(tasks);

  // Summaries by keyword across competitors
  const keywordSummary = {};
  for (const r of results) {
    for (const p of r.pages) {
      if (!p.keywords) continue;
      for (const [k, v] of Object.entries(p.keywords)) {
        keywordSummary[k] = (keywordSummary[k] || 0) + (v || 0);
      }
    }
  }

  return { competitors: results, keyword_summary: keywordSummary, scraped_at: new Date().toISOString() };
}