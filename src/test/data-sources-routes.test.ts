import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Pre-deploy guard: every `href` referenced by DataSourcesPanel
 * must correspond to a real <Route path="..."> registered in AnimatedRoutes.
 *
 * Both <Route ... element={<Comp />} /> and <Route ... element={<Navigate ... />} />
 * are accepted as valid destinations (a navigate target is still a routable path).
 */

const root = resolve(__dirname, "../..");

const readFile = (p: string) => readFileSync(resolve(root, p), "utf8");

function extractDataSourceHrefs(source: string): string[] {
  // Matches:  href: "/tools/xxx"
  const re = /href:\s*"(\/tools\/[a-z0-9-]+)"/gi;
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) out.add(m[1]);
  return [...out];
}

function extractRegisteredRoutes(source: string): Set<string> {
  // Matches:  <Route path="/tools/xxx"
  const re = /<Route\s+path="(\/[^"]+)"/g;
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) out.add(m[1]);
  return out;
}

describe("DataSourcesPanel route integrity", () => {
  const panel = readFile("src/components/dashboard/DataSourcesPanel.tsx");
  const routes = readFile("src/components/AnimatedRoutes.tsx");

  const hrefs = extractDataSourceHrefs(panel);
  const registered = extractRegisteredRoutes(routes);

  it("extracts at least one href from DataSourcesPanel", () => {
    expect(hrefs.length).toBeGreaterThan(0);
  });

  it("registers a non-trivial number of app routes", () => {
    expect(registered.size).toBeGreaterThan(10);
  });

  it.each(["placeholder"])("(per-href checks below)", () => {
    expect(true).toBe(true);
  });

  // One assertion per href — failures pinpoint the broken link
  for (const href of hrefs) {
    it(`route exists for "${href}"`, () => {
      expect(
        registered.has(href),
        `Missing <Route path="${href}"> in AnimatedRoutes.tsx. ` +
          `Either add the route or update DataSourcesPanel.tsx to point to a valid one.`,
      ).toBe(true);
    });
  }
});
