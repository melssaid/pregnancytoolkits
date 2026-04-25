#!/usr/bin/env node
/**
 * Quick localization checks for dashboard card components.
 *
 * Validates that every key actually used by card components for
 * the week label, units (kg/g/cm), and badge/trimester text
 * exists and is non-empty in all 7 locale files.
 *
 * Usage: node scripts/validate-card-locales.mjs
 * Exits 1 on missing/empty/unsubstituted-placeholder issues.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const LOCALES = ["en", "ar", "fr", "es", "de", "pt", "tr"];

/**
 * Keys grouped by concern. Each entry is the dot path used by
 * dashboard/chart/weight-gain card components via i18next `t(...)`.
 */
const KEYS = {
  weekLabel: [
    "dashboardV2.progress.week",
    "dailyDashboard.week",
    "milestones.week",
    "milestones.weeksLeft",
    "progressRing.week",
    "babySize.weekLabel",
    "babySize.sinceLastWeek",
    "medicalSummary.currentWeek",
    "dashboard.recentResults.week",
    "dashboard.recentResults.weeklySummary",
    "countdown.weeks",
    "toolsInternal.weightGain.week",
  ],
  units: [
    "charts.babyGrowth.kg",
    "charts.babyGrowth.weightKg",
    "toolsInternal.weightGain.kgPerWeek",
    // Generic unit blocks the cards reference indirectly:
    "units.kg",
    "units.g",
    "units.cm",
  ],
  badgeAndTrimester: [
    "dashboardV2.progress.trimester1",
    "dashboardV2.progress.trimester2",
    "dashboardV2.progress.trimester3",
    "dashboardV2.progress.daysLeft",
    "dashboardV2.progress.complete",
    "dashboard.weeklySymptoms.title",
    "weeklyComparison.title",
    "weeklyComparison.kicks",
    "weeklyComparison.water",
    "weeklyComparison.vitamins",
    "weeklyComparison.glasses",
    "weeklyComparison.days",
  ],
};

// Optional keys: present in some namespaces but truly optional. We only
// warn (not fail) when these are missing — they may not be used everywhere.
const OPTIONAL = new Set([
  "units.kg",
  "units.g",
  "units.cm",
]);

function loadLocale(lang) {
  const p = join(ROOT, "src", "locales", `${lang}.json`);
  return JSON.parse(readFileSync(p, "utf8"));
}

function get(obj, path) {
  return path.split(".").reduce((acc, part) => {
    if (acc == null) return undefined;
    return acc[part];
  }, obj);
}

const dicts = Object.fromEntries(LOCALES.map(l => [l, loadLocale(l)]));

const missing = []; // hard failures
const warnings = []; // soft (optional missing or untranslated)
let checked = 0;

for (const [group, keys] of Object.entries(KEYS)) {
  for (const key of keys) {
    for (const lang of LOCALES) {
      checked++;
      const val = get(dicts[lang], key);
      const isOptional = OPTIONAL.has(key);

      if (val === undefined) {
        (isOptional ? warnings : missing).push({
          group, key, lang, reason: "missing",
        });
        continue;
      }
      if (typeof val !== "string") {
        missing.push({ group, key, lang, reason: `not a string (${typeof val})` });
        continue;
      }
      if (val.trim() === "") {
        missing.push({ group, key, lang, reason: "empty" });
        continue;
      }

      // Detect unsubstituted English fallbacks in non-English locales
      // for week-label keys (e.g., literal "Week {{week}}" in fr/de/etc).
      if (lang !== "en" && group === "weekLabel") {
        const enVal = get(dicts.en, key);
        if (enVal && val === enVal && /[A-Za-z]/.test(val)) {
          warnings.push({
            group, key, lang,
            reason: `identical to English ("${val}") — likely untranslated`,
          });
        }
      }

      // Sanity: kg/cm/g unit strings should be very short (<= 6 chars).
      if (group === "units" && val.length > 6) {
        warnings.push({
          group, key, lang,
          reason: `unit string is unusually long ("${val}")`,
        });
      }

      // Placeholder integrity: if EN uses {{week}}, all locales should too.
      const enVal = get(dicts.en, key);
      if (typeof enVal === "string") {
        const enPlaceholders = [...enVal.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]);
        for (const ph of enPlaceholders) {
          if (!val.includes(`{{${ph}}}`)) {
            missing.push({
              group, key, lang,
              reason: `missing placeholder {{${ph}}} (EN has it)`,
            });
          }
        }
      }
    }
  }
}

const lines = [];
lines.push(`Checked ${checked} (key × locale) pairs across ${LOCALES.length} languages.\n`);

if (missing.length === 0) {
  lines.push("✅ No hard localization issues.");
} else {
  lines.push(`❌ ${missing.length} hard issue(s):`);
  for (const m of missing) {
    lines.push(`  [${m.lang}] ${m.group} → ${m.key} — ${m.reason}`);
  }
}

if (warnings.length > 0) {
  lines.push(`\n⚠️  ${warnings.length} warning(s):`);
  for (const w of warnings) {
    lines.push(`  [${w.lang}] ${w.group} → ${w.key} — ${w.reason}`);
  }
}

console.log(lines.join("\n"));
process.exit(missing.length > 0 ? 1 : 0);
