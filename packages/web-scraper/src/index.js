#!/usr/bin/env node
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import { scrapeCompetitors } from "./scrapeCompetitors.js";
import { scrapeTrends } from "./scrapeTrends.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getRepoRoot() {
  // packages/web-scraper/src -> repo root is ../../..
  return path.resolve(__dirname, "../../..");
}

async function ensureDataDir(root) {
  const dataDir = path.join(root, "server", "data");
  await fs.ensureDir(dataDir);
  return dataDir;
}

async function main() {
  const mode = process.argv[2] || "all";
  const root = await getRepoRoot();
  const dataDir = await ensureDataDir(root);

  if (mode === "competitors" || mode === "all") {
    const result = await scrapeCompetitors();
    const outFile = path.join(dataDir, "intel-competitors.json");
    await fs.writeJson(outFile, result, { spaces: 2 });
    console.log(`Wrote competitors to ${outFile}`);
  }

  if (mode === "trends" || mode === "all") {
    const result = await scrapeTrends();
    const outFile = path.join(dataDir, "intel-trends.json");
    await fs.writeJson(outFile, result, { spaces: 2 });
    console.log(`Wrote trends to ${outFile}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
