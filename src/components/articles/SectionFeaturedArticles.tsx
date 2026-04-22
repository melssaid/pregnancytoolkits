
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { articleUiCopy, getArticleCountBySection, getFeaturedSectionBundle, type ArticleSectionKey } from "@/data/articles";
import { ArticleCompactLink, ArticleFeatureCard } from "@/components/articles/ArticleCards";

export function SectionFeaturedArticles({ sectionKey }: { sectionKey: ArticleSectionKey }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const isRTL = lang === "ar";
  const copy = articleUiCopy(lang);
  const bundle = useMemo(() => getFeaturedSectionBundle(sectionKey, lang), [lang, sectionKey]);
  const counts = useMemo(() => getArticleCountBySection(), []);

  if (!bundle.main) return null;

  return (
    <div className="mt-3 rounded-[1.35rem] border border-border/70 bg-background/70 p-2.5 backdrop-blur-sm">
      <div className="mb-2.5 px-1">
        <p className="text-[11px] font-semibold text-primary">{copy.sectionIntro}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-foreground ar-heading">{copy.sectionTitles[sectionKey]}</h3>
          <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-secondary-foreground">{counts[sectionKey]}</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <ArticleFeatureCard article={bundle.main} isRTL={isRTL} label={copy.featuredLabel} />
        <div className="space-y-2">
          {bundle.secondary.map((article, index) => (
            <ArticleCompactLink
              key={article.slug}
              article={article}
              isRTL={isRTL}
              label={index === 0 ? copy.readAlso : copy.suggested}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
