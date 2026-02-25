import { describe, it, expect } from "vitest";
import { toolsData, getRelatedTools } from "@/lib/tools-data";

const definedRoutes = [
  "/", "/dashboard", "/settings", "/privacy", "/terms", "/contact",
  "/tools/pregnancy-assistant", "/tools/wellness-diary", "/tools/ai-meal-suggestion",
  "/tools/weekly-summary", "/tools/smart-appointment-reminder", "/tools/ai-craving-alternatives",
  "/tools/smart-grocery-list", "/tools/smart-plan",
  "/tools/ai-sleep-optimizer",
  "/tools/ai-hospital-bag", "/tools/ai-partner-guide", "/tools/ai-birth-position",
  "/tools/ai-skincare", "/tools/ai-nausea-relief", "/tools/ai-bump-photos",
  "/tools/ai-fitness-coach", "/tools/ai-back-pain-relief", "/tools/vitamin-tracker",
  "/tools/labor-progress", "/tools/ai-birth-plan",
  "/tools/cycle-tracker", "/tools/due-date-calculator", "/tools/fetal-growth",
  "/tools/kick-counter", "/tools/weight-gain", "/tools/mental-health-coach",
  "/tools/gestational-diabetes", "/tools/preeclampsia-risk", "/tools/baby-gear-recommender",
  "/tools/ai-lactation-prep", "/tools/postpartum-recovery", "/tools/baby-cry-translator",
  "/tools/baby-sleep-tracker", "/tools/baby-growth", "/tools/diaper-tracker",
  "/videos", "/splash",
  "/tools/fertility-academy", "/tools/nutrition-supplements",
  "/tools/tww-companion", "/tools/preconception-checkup",
];

describe("Route integrity", () => {
  it("every tool href has a matching route", () => {
    const missing = toolsData.filter(t => !definedRoutes.includes(t.href));
    expect(missing.map(t => `${t.id}: ${t.href}`)).toEqual([]);
  });

  it("all tool hrefs are unique", () => {
    const hrefs = toolsData.map(t => t.href);
    const dupes = hrefs.filter((h, i) => hrefs.indexOf(h) !== i);
    expect(dupes).toEqual([]);
  });

  it("all tool IDs are unique", () => {
    const ids = toolsData.map(t => t.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  it("tool relationships reference valid tool IDs", () => {
    const validIds = new Set(toolsData.map(t => t.id));
    for (const tool of toolsData) {
      const related = getRelatedTools(tool.id);
      for (const r of related) {
        expect(validIds.has(r.id), `Related tool "${r.id}" from "${tool.id}" not found`).toBe(true);
      }
    }
  });
});
