/**
 * Visual / structural RTL direction test.
 *
 * Goal: ensure that when the active language is Arabic, every dashboard-surface
 * card and every nested presentational sub-component renders with the correct
 * `dir` attribute and text-alignment, while non-Arabic locales render LTR.
 *
 * We intentionally render small, dependency-light card components rather than
 * the full <SmartDashboard /> tree (which pulls in framer-motion, supabase,
 * service-worker hooks, etc.). The presentational contract being verified is:
 *
 *   1. <html dir="…"> mirrors the active locale.
 *   2. Components that use the `useLanguage()` `isRTL` flag set `dir="rtl"`
 *      on their root element under Arabic.
 *   3. Tabs / nested wrappers also propagate `dir="rtl"` so inner cards inherit
 *      the correct flow direction.
 *   4. Under non-Arabic locales (default LTR), no stray `dir="rtl"` leaks in.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n, { i18nReady, updateDocumentDirection, setManualLanguage } from "@/i18n";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { resolveArticleLocale } from "@/lib/articleLocale";

/* ---------------------------------------------------------------- */
/* Minimal cards that mirror the real dashboard contract            */
/* ---------------------------------------------------------------- */

const CardRoot: React.FC<{ children?: React.ReactNode; testId: string }> = ({ children, testId }) => {
  const { isRTL } = useLanguage();
  return (
    <div data-testid={testId} dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "text-right" : "text-left"}>
      {children}
    </div>
  );
};

const TabsWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isRTL } = useLanguage();
  return (
    <div data-testid="tabs-wrapper" dir={isRTL ? "rtl" : "ltr"}>
      {children}
    </div>
  );
};

const NestedInnerCard: React.FC = () => (
  <CardRoot testId="inner-card">
    <span>kg · g · cm</span>
  </CardRoot>
);

const Surface: React.FC = () => (
  <TabsWrapper>
    <CardRoot testId="hero-card" />
    <CardRoot testId="weekly-card" />
    <CardRoot testId="tools-grid">
      <NestedInnerCard />
    </CardRoot>
  </TabsWrapper>
);

/* ---------------------------------------------------------------- */
/* Helpers                                                           */
/* ---------------------------------------------------------------- */

const renderWithLocale = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <Surface />
      </LanguageProvider>
    </I18nextProvider>
  );

const ALL_TARGET_IDS = ["tabs-wrapper", "hero-card", "weekly-card", "tools-grid", "inner-card"];

/* ---------------------------------------------------------------- */
/* Tests                                                             */
/* ---------------------------------------------------------------- */

beforeAll(async () => {
  await i18nReady;
});

describe("RTL/LTR direction contract — dashboard cards", () => {
  it("resolveArticleLocale identifies Arabic as RTL and Latin scripts as LTR", () => {
    expect(resolveArticleLocale("ar").dir).toBe("rtl");
    expect(resolveArticleLocale("ar").textAlign).toBe("right");
    for (const lang of ["en", "fr", "es", "de", "pt", "tr"]) {
      const r = resolveArticleLocale(lang);
      expect(r.dir).toBe("ltr");
      expect(r.textAlign).toBe("left");
    }
  });

  it("under Arabic, every card + tab wrapper + nested inner card renders dir=rtl", async () => {
    await setManualLanguage("ar");
    updateDocumentDirection("ar");

    expect(document.documentElement.getAttribute("dir")).toBe("rtl");
    expect(document.documentElement.getAttribute("lang")).toBe("ar");

    const { getByTestId } = renderWithLocale();
    for (const id of ALL_TARGET_IDS) {
      const el = getByTestId(id);
      expect(el.getAttribute("dir")).toBe("rtl");
    }
    // Outer cards must use right-aligned text under RTL.
    expect(getByTestId("hero-card").className).toMatch(/text-right/);
    expect(getByTestId("inner-card").className).toMatch(/text-right/);
  });

  it("after switching back to English, no dir=rtl leaks into cards or nested children", async () => {
    await setManualLanguage("en");
    updateDocumentDirection("en");

    expect(document.documentElement.getAttribute("dir")).toBe("ltr");
    expect(document.documentElement.getAttribute("lang")).toBe("en");

    const { getByTestId } = renderWithLocale();
    for (const id of ALL_TARGET_IDS) {
      const el = getByTestId(id);
      expect(el.getAttribute("dir")).toBe("ltr");
    }
    expect(getByTestId("hero-card").className).toMatch(/text-left/);
    expect(getByTestId("inner-card").className).toMatch(/text-left/);
  });

  it.each(["fr", "es", "de", "pt", "tr"])(
    "Latin locale '%s' renders all cards as dir=ltr (no Arabic leakage)",
    async (lang) => {
      await setManualLanguage(lang);
      updateDocumentDirection(lang);

      expect(document.documentElement.getAttribute("dir")).toBe("ltr");
      expect(document.documentElement.getAttribute("lang")).toBe(lang);

      const { getByTestId } = renderWithLocale();
      for (const id of ALL_TARGET_IDS) {
        expect(getByTestId(id).getAttribute("dir")).toBe("ltr");
      }
    }
  );
});
