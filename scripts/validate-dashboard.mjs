import { readFile } from "node:fs/promises";

const requiredFiles = [
  "public/index.html",
  "public/styles.css",
  "public/app.js",
  "public/sample-data.json",
  "netlify/functions/netlify-dashboard.mjs",
  "netlify.toml",
];

for (const file of requiredFiles) {
  const contents = await readFile(file, "utf8");
  if (!contents.trim()) {
    throw new Error(`${file} is empty`);
  }
}

const sampleData = JSON.parse(await readFile("public/sample-data.json", "utf8"));
const requiredTopLevelKeys = ["generatedAt", "metrics", "connections", "sites", "activity", "alerts", "recommendations"];

for (const key of requiredTopLevelKeys) {
  if (!(key in sampleData)) {
    throw new Error(`sample-data.json is missing ${key}`);
  }
}

if (!Array.isArray(sampleData.sites) || sampleData.sites.length === 0) {
  throw new Error("sample-data.json must include at least one site");
}

if (!Number.isFinite(sampleData.metrics.sitesMonitored)) {
  throw new Error("sample-data.json metrics.sitesMonitored must be numeric");
}

console.log("Dashboard files and sample data validated.");
