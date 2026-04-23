
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { articleUiCopy, getNextArticle, getRelatedArticles, getSimilarArticles } from "@/data/articles";
import { ArticleTitleLink } from "@/components/articles/ArticleCards";
import { resolveArticleLocale } from "@/lib/articleLocale";

export function RelatedArticles({ slug, limit = 3, embedded = false }: { slug: string; limit?: number; embedded?: boolean }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const locale = resolveArticleLocale(lang);
  const copy = articleUiCopy(lang);
  const nextArticle = useMemo(() => getNextArticle(slug, lang), [lang, slug]);
  const articles = useMemo(() => getRelatedArticles(slug, lang, limit), [lang, limit, slug]);
  const similarArticles = useMemo(() => getSimilarArticles(slug, lang, 2), [lang, slug]);

  if (!nextArticle && !articles.length && !similarArticles.length) return null;

  return (
    <section className={embedded ? "space-y-3" : "space-y-3 rounded-[1.5rem] border border-border bg-card px-3 py-3"} style={embedded ? undefined : { boxShadow: "var(--shadow-card)" }} dir={locale.dir}>
      {nextArticle && (
        <div className="space-y-2 rounded-[1.2rem] border border-border bg-card p-3">
          <div>
            <h2 className={`text-[1.3rem] font-black text-foreground ${locale.headingClass}`}>{copy.readNext}</h2>
          </div>
          <ArticleTitleLink article={nextArticle} isRTL={locale.isRTL} label={copy.continueReading} />
        </div>
      )}

      {(!!articles.length || !!similarArticles.length) && (
        <div className="overflow-hidden rounded-[1.2rem] border border-border bg-card">
          {!!articles.length && (
            <div className="space-y-2 px-3 py-3">
              <div>
                <h2 className={`text-[1.3rem] font-black text-foreground ${locale.headingClass}`}>{copy.relatedArticles}</h2>
              </div>
              <div className="space-y-2">
                {articles.map((article, index) => (
                  <ArticleTitleLink key={article.slug} article={article} isRTL={locale.isRTL} label={index === 0 ? copy.readAlso : copy.suggested} />
                ))}
              </div>
            </div>
          )}

          {!!similarArticles.length && (
            <div className="space-y-2 border-t border-border px-3 py-3">
              <div>
                <h2 className={`text-[1.3rem] font-black text-foreground ${locale.headingClass}`}>{copy.similarArticles}</h2>
              </div>
              <div className="space-y-2">
                {similarArticles.map((article) => (
                  <ArticleTitleLink key={article.slug} article={article} isRTL={locale.isRTL} label={copy.suggested} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
