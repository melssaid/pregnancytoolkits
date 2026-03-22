/**
 * Locale Validation Script
 * Compares all locale files against en.json to detect:
 * - Missing keys
 * - Extra keys
 * - Broken interpolation placeholders
 *
 * Usage: npx tsx scripts/validate-locales.ts
 */

import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.resolve(__dirname, '../src/locales');
const BASE_LANG = 'en';
const LANGS = ['ar', 'de', 'es', 'fr', 'pt', 'tr'];

function flattenKeys(obj: any, prefix = ''): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      for (const [k, v] of flattenKeys(value, fullKey)) {
        result.set(k, v);
      }
    } else {
      result.set(fullKey, String(value));
    }
  }
  return result;
}

function extractPlaceholders(str: string): string[] {
  const matches = str.match(/\{\{(\w+)\}\}/g) || [];
  return matches.sort();
}

const baseFile = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, `${BASE_LANG}.json`), 'utf8'));
const baseKeys = flattenKeys(baseFile);

let totalIssues = 0;

for (const lang of LANGS) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing locale file: ${lang}.json`);
    totalIssues++;
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const langKeys = flattenKeys(data);
  const missing: string[] = [];
  const extra: string[] = [];
  const brokenPlaceholders: string[] = [];

  for (const [key, baseValue] of baseKeys) {
    if (!langKeys.has(key)) {
      missing.push(key);
    } else {
      const basePH = extractPlaceholders(baseValue);
      const langPH = extractPlaceholders(langKeys.get(key)!);
      if (basePH.join(',') !== langPH.join(',')) {
        brokenPlaceholders.push(`${key}: expected ${basePH.join(',')} got ${langPH.join(',')}`);
      }
    }
  }

  for (const key of langKeys.keys()) {
    if (!baseKeys.has(key)) {
      extra.push(key);
    }
  }

  const issues = missing.length + extra.length + brokenPlaceholders.length;
  totalIssues += issues;

  if (issues > 0) {
    console.log(`\n📌 ${lang}.json — ${issues} issue(s):`);
    if (missing.length > 0) {
      console.log(`  ⚠️  Missing keys (${missing.length}):`);
      missing.slice(0, 10).forEach(k => console.log(`    - ${k}`));
      if (missing.length > 10) console.log(`    ... and ${missing.length - 10} more`);
    }
    if (brokenPlaceholders.length > 0) {
      console.log(`  🔧 Broken placeholders (${brokenPlaceholders.length}):`);
      brokenPlaceholders.slice(0, 5).forEach(k => console.log(`    - ${k}`));
    }
    if (extra.length > 0) {
      console.log(`  ℹ️  Extra keys (${extra.length}):`);
      extra.slice(0, 5).forEach(k => console.log(`    - ${k}`));
      if (extra.length > 5) console.log(`    ... and ${extra.length - 5} more`);
    }
  } else {
    console.log(`✅ ${lang}.json — OK`);
  }
}

console.log(`\n${totalIssues === 0 ? '✅ All locales valid!' : `⚠️  Total issues: ${totalIssues}`}`);
process.exit(totalIssues > 0 ? 1 : 0);
