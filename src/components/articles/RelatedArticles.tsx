
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { articleUiCopy, getNextArticle, getRelatedArticles, getSimilarArticles } from "@/data/articles";
import { ArticleTitleLink } from "@/components/articles/ArticleCards";

export function RelatedArticles({ slug, limit = 3 }: { slug: string; limit?: number }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const isRTL = lang === "ar";
  const copy = articleUiCopy(lang);
  const nextArticle = useMemo(() => getNextArticle(slug, lang), [lang, slug]);
  const articles = useMemo(() => getRelatedArticles(slug, lang, limit), [lang, limit, slug]);
  const similarArticles = useMemo(() => getSimilarArticles(slug, lang, 2), [lang, slug]);

  if (!nextArticle && !articles.length && !similarArticles.length) return null;

  return (
    <section className="space-y-2 rounded-[1.5rem] border border-primary/10 bg-gradient-to-br from-card via-background to-secondary/20 px-3 py-3" style={{ boxShadow: "var(--shadow-card)" }}>
      {nextArticle && (
        <div className="space-y-2 rounded-[1.2rem] border border-primary/10 bg-card p-3">
          <div>
            <h2 className="text-base font-extrabold text-primary ar-heading">{copy.readNext}</h2>
          </div>
          <ArticleTitleLink article={nextArticle} isRTL={isRTL} label={copy.continueReading} />
        </div>
      )}

      {(!!articles.length || !!similarArticles.length) && (
        <div className="overflow-hidden rounded-[1.2rem] border border-primary/10 bg-card">
          {!!articles.length && (
            <div className="space-y-2 px-3 py-3">
              <div>
                <h2 className="text-[15px] font-extrabold text-primary ar-heading">مقالات قريبة</h2>
              </div>
              <div className="space-y-2">
                {articles.map((article, index) => (
                  <ArticleTitleLink key={article.slug} article={article} isRTL={isRTL} label={index === 0 ? copy.readAlso : copy.suggested} />
                ))}
              </div>
            </div>
          )}

          {!!similarArticles.length && (
            <div className="space-y-2 border-t border-primary/10 px-3 py-3">
              <div>
                <h2 className="text-[15px] font-extrabold text-primary ar-heading">مقالات مشابهة</h2>
              </div>
              <div className="space-y-2">
                {similarArticles.map((article) => (
                  <ArticleTitleLink key={article.slug} article={article} isRTL={isRTL} label={copy.suggested} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
