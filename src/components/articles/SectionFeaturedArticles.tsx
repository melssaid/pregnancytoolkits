
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { articleUiCopy, getFeaturedSectionBundle, type ArticleSectionKey } from "@/data/articles";
import { ArticleFeatureCard, ArticleTitleLink } from "@/components/articles/ArticleCards";

export function SectionFeaturedArticles({ sectionKey }: { sectionKey: ArticleSectionKey }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const isRTL = lang === "ar";
  const copy = articleUiCopy(lang);
  const bundle = useMemo(() => getFeaturedSectionBundle(sectionKey, lang), [lang, sectionKey]);

  if (!bundle.main) return null;

  return (
    <div className="mt-3 px-0.5">
      <div className="mb-3 rounded-[1rem] bg-gradient-to-r from-background/70 via-secondary/20 to-transparent px-2 py-2">
        <div className="mb-1.5 h-[3px] w-16 rounded-full bg-gradient-to-r from-primary via-primary/40 to-transparent" />
        <h3 className="text-[15px] font-black text-foreground ar-heading">{copy.sectionTitles[sectionKey]}</h3>
      </div>

      <div className="space-y-2.5">
        <ArticleFeatureCard article={bundle.main} isRTL={isRTL} label={copy.featuredLabel} hideLabel />
        <div className="space-y-2">
          {bundle.secondary.map((article, index) => (
            <ArticleTitleLink
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
