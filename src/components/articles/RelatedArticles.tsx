
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { articleUiCopy, getNextArticle, getRelatedArticles, getSimilarArticles } from "@/data/articles";
import { ArticleCompactLink } from "@/components/articles/ArticleCards";

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
    <section className="space-y-3 rounded-[1.5rem] border border-border/80 bg-card/85 px-3 py-3.5" style={{ boxShadow: "var(--shadow-card)" }}>
      {nextArticle && (
        <div className="space-y-2 rounded-[1.2rem] border border-border/70 bg-background/75 p-3">
          <div>
            <h2 className="text-lg font-extrabold text-foreground ar-heading">{copy.readNext}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy.readNextDesc}</p>
          </div>
          <ArticleCompactLink article={nextArticle} isRTL={isRTL} label={copy.continueReading} />
        </div>
      )}

      {!!articles.length && (
        <div className="space-y-2">
          <div>
            <h2 className="text-lg font-extrabold text-foreground ar-heading">{copy.relatedArticles}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy.relatedArticlesDesc}</p>
          </div>
          <div className="space-y-2">
            {articles.map((article, index) => (
              <ArticleCompactLink key={article.slug} article={article} isRTL={isRTL} label={index === 0 ? copy.readAlso : copy.suggested} />
            ))}
          </div>
        </div>
      )}

      {!!similarArticles.length && (
        <div className="space-y-2 rounded-[1.2rem] border border-border/70 bg-background/60 p-3">
          <div>
            <h2 className="text-lg font-extrabold text-foreground ar-heading">{copy.similarArticles}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy.similarArticlesDesc}</p>
          </div>
          <div className="space-y-2">
            {similarArticles.map((article) => (
              <ArticleCompactLink key={article.slug} article={article} isRTL={isRTL} label={copy.suggested} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
