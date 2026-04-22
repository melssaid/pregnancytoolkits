
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { articleUiCopy, getRelatedArticles } from "@/data/articles";
import { ArticleCompactLink } from "@/components/articles/ArticleCards";

export function RelatedArticles({ slug, limit = 3 }: { slug: string; limit?: number }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const isRTL = lang === "ar";
  const copy = articleUiCopy(lang);
  const articles = useMemo(() => getRelatedArticles(slug, lang, limit), [lang, limit, slug]);

  if (!articles.length) return null;

  return (
    <section className="space-y-3 rounded-[1.5rem] border border-border/80 bg-card/85 px-3 py-3.5" style={{ boxShadow: "var(--shadow-card)" }}>
      <div>
        <h2 className="text-lg font-extrabold text-foreground ar-heading">{copy.relatedArticles}</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy.relatedArticlesDesc}</p>
      </div>
      <div className="space-y-2">
        {articles.map((article, index) => (
          <ArticleCompactLink key={article.slug} article={article} isRTL={isRTL} label={index === 0 ? copy.readAlso : copy.suggested} />
        ))}
      </div>
    </section>
  );
}
