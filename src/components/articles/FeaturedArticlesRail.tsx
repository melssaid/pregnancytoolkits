
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { articleUiCopy, getGlobalFeaturedArticles } from "@/data/articles";
import { ArticleCompactLink, ArticleFeatureCard } from "@/components/articles/ArticleCards";
import { resolveArticleLocale } from "@/lib/articleLocale";

export function FeaturedArticlesRail({ limit = 4 }: { limit?: number }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const locale = resolveArticleLocale(lang);
  const copy = articleUiCopy(lang);
  const articles = useMemo(() => getGlobalFeaturedArticles(lang, limit), [lang, limit]);

  if (!articles.length) return null;

  return (
    <section className="rounded-[1.6rem] border border-border/80 bg-gradient-to-br from-card via-background to-secondary/35 px-3 py-3.5" style={{ boxShadow: "var(--shadow-card)" }} dir={locale.dir}>
      <div className="mb-3 px-1">
        <p className="text-[11px] font-semibold text-primary">{copy.discoverMore}</p>
        <h2 className={`mt-1 text-lg font-extrabold text-foreground ${locale.headingClass}`}>{copy.mostRead}</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground" style={{ textAlign: locale.textAlign }}>{copy.mostReadDesc}</p>
      </div>

      <div className="space-y-3">
        <ArticleFeatureCard article={articles[0]} isRTL={locale.isRTL} label={copy.featuredLabel} eager />
        {articles[1] && <ArticleFeatureCard article={articles[1]} isRTL={locale.isRTL} label={copy.readAlso} />}
        <div className="space-y-2">
          {articles.slice(2).map((article) => (
            <ArticleCompactLink key={article.slug} article={article} isRTL={locale.isRTL} label={copy.continueReading} />
          ))}
        </div>
      </div>
    </section>
  );
}
