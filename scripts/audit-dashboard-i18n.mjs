#!/usr/bin/env node
/**
 * Audits all i18next `t("…")` keys used by the dashboard surface
 * (SmartDashboard + TodayStoryHero + UnifiedToolsGrid + 3 tabs)
 * against every locale file. Reports missing/empty/placeholder issues.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const FILES = [
  "src/pages/SmartDashboard.tsx",
  "src/components/dashboard/TodayStoryHero.tsx",
  "src/components/dashboard/UnifiedToolsGrid.tsx",
  "src/components/dashboard/tabs/InsightsTab.tsx",
  "src/components/dashboard/tabs/ArchiveTab.tsx",
  "src/components/dashboard/tabs/MoreTab.tsx",
];

const LOCALES = ["en", "ar", "fr", "es", "de", "pt", "tr"];

function extractKeys(src) {
  // Matches t("foo.bar") or t('foo.bar') with optional second arg
  const re = /\bt\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]/g;
  const out = new Set();
  let m;
  while ((m = re.exec(src))) out.add(m[1]);
  return [...out];
}

function get(obj, path) {
  return path.split(".").reduce((acc, p) => (acc == null ? undefined : acc[p]), obj);
}

const dicts = Object.fromEntries(
  LOCALES.map(l => [l, JSON.parse(readFileSync(join(ROOT, "src/locales", `${l}.json`), "utf8"))])
);

const allKeys = new Set();
for (const f of FILES) {
  const src = readFileSync(join(ROOT, f), "utf8");
  for (const k of extractKeys(src)) allKeys.add(k);
}

const missing = [];
const empty = [];
const placeholderMismatch = [];

for (const key of allKeys) {
  const enVal = get(dicts.en, key);
  const enPlaceholders = typeof enVal === "string"
    ? [...enVal.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1])
    : [];

  for (const lang of LOCALES) {
    const v = get(dicts[lang], key);
    if (v === undefined) {
      missing.push({ lang, key });
      continue;
    }
    if (typeof v === "string" && v.trim() === "") {
      empty.push({ lang, key });
      continue;
    }
    for (const ph of enPlaceholders) {
      if (typeof v === "string" && !v.includes(`{{${ph}}}`)) {
        placeholderMismatch.push({ lang, key, ph });
      }
    }
  }
}

console.log(`Audited ${allKeys.size} keys × ${LOCALES.length} locales = ${allKeys.size * LOCALES.length} pairs.\n`);
if (!missing.length && !empty.length && !placeholderMismatch.length) {
  console.log("✅ All dashboard-surface i18n keys exist with correct placeholders in every locale.");
  process.exit(0);
}
if (missing.length) {
  console.log(`❌ Missing (${missing.length}):`);
  for (const x of missing) console.log(`  [${x.lang}] ${x.key}`);
}
if (empty.length) {
  console.log(`❌ Empty (${empty.length}):`);
  for (const x of empty) console.log(`  [${x.lang}] ${x.key}`);
}
if (placeholderMismatch.length) {
  console.log(`❌ Missing placeholders (${placeholderMismatch.length}):`);
  for (const x of placeholderMismatch) console.log(`  [${x.lang}] ${x.key} — needs {{${x.ph}}}`);
}
process.exit(1);
