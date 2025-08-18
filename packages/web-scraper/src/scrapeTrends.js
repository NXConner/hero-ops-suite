import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import RSSParser from "rss-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readFeeds() {
  const feedsPath = path.resolve(__dirname, "../config/feeds.json");
  if (!(await fs.pathExists(feedsPath))) return [];
  const list = await fs.readJson(feedsPath);
  return list;
}

export async function scrapeTrends() {
  const feeds = await readFeeds();
  const parser = new RSSParser({ timeout: 15000 });
  const results = [];
  for (const f of feeds) {
    try {
      const feed = await parser.parseURL(f.url);
      const items = (feed.items || []).slice(0, 15).map((i) => ({
        source: f.name || feed.title || f.url,
        title: i.title || "",
        link: i.link || "",
        pubDate: i.pubDate || null,
        isoDate: i.isoDate || null,
        summary: i.contentSnippet || "",
      }));
      results.push({ feed: f.url, source: f.name || feed.title || f.url, items });
    } catch (e) {
      results.push({ feed: f.url, error: e.message, items: [] });
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  const flat = results.flatMap((r) => r.items.map((i) => ({ ...i, source: r.source })));

  return { feeds: results, items: flat, scraped_at: new Date().toISOString() };
}
