
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { articleUiCopy, getNextArticle, getRelatedArticles, getSimilarArticles } from "@/data/articles";
import { ArticleTitleLink } from "@/components/articles/ArticleCards";
import { resolveArticleLocale } from "@/lib/articleLocale";

export function RelatedArticles({ slug, limit = 3 }: { slug: string; limit?: number }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const locale = resolveArticleLocale(lang);
  const copy = articleUiCopy(lang);
  const nextArticle = useMemo(() => getNextArticle(slug, lang), [lang, slug]);
  const articles = useMemo(() => getRelatedArticles(slug, lang, limit), [lang, limit, slug]);
  const similarArticles = useMemo(() => getSimilarArticles(slug, lang, 2), [lang, slug]);

  if (!nextArticle && !articles.length && !similarArticles.length) return null;

  return (
    <section className="space-y-2 rounded-[1.5rem] border border-primary/10 bg-gradient-to-br from-card via-background to-secondary/20 px-3 py-3" style={{ boxShadow: "var(--shadow-card)" }} dir={locale.dir}>
      {nextArticle && (
        <div className="space-y-2 rounded-[1.2rem] border border-primary/10 bg-card p-3">
          <div>
            <h2 className={`text-base font-extrabold text-primary ${locale.headingClass}`}>{copy.readNext}</h2>
          </div>
          <ArticleTitleLink article={nextArticle} isRTL={locale.isRTL} label={copy.continueReading} />
        </div>
      )}

      {(!!articles.length || !!similarArticles.length) && (
        <div className="overflow-hidden rounded-[1.2rem] border border-primary/10 bg-card">
          {!!articles.length && (
            <div className="space-y-2 px-3 py-3">
              <div>
                <h2 className={`text-[15px] font-extrabold text-primary ${locale.headingClass}`}>{copy.relatedArticles}</h2>
              </div>
              <div className="space-y-2">
                {articles.map((article, index) => (
                  <ArticleTitleLink key={article.slug} article={article} isRTL={locale.isRTL} label={index === 0 ? copy.readAlso : copy.suggested} />
                ))}
              </div>
            </div>
          )}

          {!!similarArticles.length && (
            <div className="space-y-2 border-t border-primary/10 px-3 py-3">
              <div>
                <h2 className={`text-[15px] font-extrabold text-primary ${locale.headingClass}`}>{copy.similarArticles}</h2>
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
