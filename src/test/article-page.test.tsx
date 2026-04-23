import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ArticleRecord } from "@/data/articles";
import * as articleData from "@/data/articles";
import ArticlePage from "@/pages/ArticlePage";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
    i18n: { language: "ar" },
  }),
}));

vi.mock("@/components/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/SEOHead", () => ({
  SEOHead: () => null,
}));

vi.mock("@/components/articles/FeaturedArticlesRail", () => ({
  FeaturedArticlesRail: () => null,
}));

vi.mock("@/components/articles/RelatedArticles", () => ({
  RelatedArticles: () => null,
}));

const renderArticleRoute = (slug: string) => render(
  <MemoryRouter initialEntries={[`/articles/${slug}`]}>
    <Routes>
      <Route path="/articles/:slug" element={<ArticlePage />} />
    </Routes>
  </MemoryRouter>
);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ArticlePage body rendering", () => {
  it("renders body content for every article slug or shows a clear fallback", () => {
    const articles = articleData.getLocalizedArticles("ar", new Date("2030-01-01T00:00:00.000Z"));
    const bannedPhrases = ["ما الذي تفعلينه", "ما الذي تنتبهين له", "الفكرة الأساسية"];

    for (const article of articles) {
      const { unmount } = renderArticleRoute(article.slug);
      const bodyContainer = screen.getByTestId("article-body");
      const fallback = screen.queryByTestId("article-body-fallback");
      const paragraphCount = bodyContainer.querySelectorAll("p").length;
      const bodyText = bodyContainer.textContent?.trim() ?? "";

      expect(
        paragraphCount > 0 || !!fallback,
        `Expected article slug "${article.slug}" to render body content or a fallback message.`,
      ).toBe(true);

      if (!fallback) {
        expect(
          bodyText.length,
          `Expected article slug "${article.slug}" to contain substantial article text, but it was too short.`,
        ).toBeGreaterThan(350);

        for (const phrase of bannedPhrases) {
          expect(
            bodyText.includes(phrase),
            `Expected article slug "${article.slug}" to avoid legacy filler phrase "${phrase}".`,
          ).toBe(false);
        }
      }

      unmount();
    }
  });

  it("shows a clear fallback when article content is missing", () => {
    const emptyArticle: ArticleRecord = {
      id: "empty-article",
      slug: "empty-article",
      sectionKey: "pregnant",
      sectionLabel: "الحمل",
      type: "article",
      typeLabel: "مقال",
      title: "مقالة بدون محتوى",
      excerpt: "وصف مختصر للمقالة.",
      intro: "",
      heroAlt: "مقالة بدون محتوى",
      image: "/placeholder.svg",
      readTime: 4,
      readTimeLabel: "4 دقائق",
      tags: [],
      tagLabels: [],
      sections: [],
      publishedAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
      relatedToolIds: [],
      relatedArticleIds: [],
      featuredInSection: false,
      featuredGlobal: false,
      popularityWeight: 1,
      order: 1,
    };

    vi.spyOn(articleData, "getLocalizedArticleBySlug").mockReturnValue(emptyArticle);

    renderArticleRoute(emptyArticle.slug);

    expect(screen.getByTestId("article-body-fallback")).toBeInTheDocument();
    expect(screen.getByText("المحتوى النصي لهذه المقالة غير متاح حالياً")).toBeInTheDocument();
  });
});