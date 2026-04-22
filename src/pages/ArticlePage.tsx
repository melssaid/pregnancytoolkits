
import { Clock3, Home, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { FeaturedArticlesRail } from "@/components/articles/FeaturedArticlesRail";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import { articleUiCopy, getLocalizedArticleBySlug, getRelatedToolRecords } from "@/data/articles";

const ArticlePage = () => {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const copy = articleUiCopy(lang);
  const article = useMemo(() => getLocalizedArticleBySlug(slug, lang), [lang, slug]);
  const relatedTools = useMemo(() => (article ? getRelatedToolRecords(article) : []), [article]);

  if (!article) {
    return (
      <Layout showBack>
        <SEOHead title={copy.articleNotFound} description={copy.articleNotFoundDesc} noindex />
        <div className="container max-w-3xl py-8 pb-24">
          <div className="rounded-[1.75rem] border border-border bg-card px-5 py-8 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-foreground ar-heading">{copy.articleNotFound}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.articleNotFoundDesc}</p>
            <Button asChild className="mt-5">
              <Link to="/">
                <Home className="h-4 w-4" />
                {copy.backToHome}
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBack>
      <SEOHead
        title={article.title}
        description={article.excerpt}
        type="article"
        image={article.image}
        publishedTime={article.publishedAt}
        modifiedTime={article.updatedAt}
        author={copy.professionalDesk}
        articleSection={article.sectionLabel}
        articleTags={article.tagLabels}
        keywords={article.tagLabels.join(", ")}
      />

      <article className="container max-w-3xl space-y-5 py-5 pb-24">
        <header className="overflow-hidden rounded-[1.75rem] border border-border/80 bg-gradient-to-br from-card via-background to-secondary/35" style={{ boxShadow: "var(--shadow-card)" }}>
          <AspectRatio ratio={16 / 8.8}>
            <img src={article.image} alt={article.heroAlt} width={1280} height={720} loading="eager" className="h-full w-full rounded-[1.2rem] object-cover" />
          </AspectRatio>

          <div className="space-y-3 px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">{article.typeLabel}</span>
              <span className="rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">{article.sectionLabel}</span>
            </div>

            <h1 className="text-[1.7rem] font-black leading-tight text-foreground ar-heading">{article.title}</h1>
            <p className="text-sm leading-7 text-foreground/75">{article.excerpt}</p>

            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              <div className="rounded-2xl border border-primary/10 bg-background/90 px-3 py-2.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Clock3 className="h-3.5 w-3.5 text-primary" />
                  {article.readTimeLabel}
                </div>
              </div>
              <div className="rounded-2xl border border-primary/10 bg-primary/10 px-3 py-2.5">
                <div className="font-semibold text-primary">{article.tagLabels.slice(0, 3).join(" • ")}</div>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-[1.6rem] border border-primary/10 bg-gradient-to-b from-card via-card to-secondary/20 px-4 py-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex flex-wrap gap-2">
            {article.tagLabels.map((tag) => (
              <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-secondary-foreground">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-[1.35rem] border border-primary/10 bg-background/85 px-4 py-4">
              <div className="mb-3 h-[3px] w-16 rounded-full bg-gradient-to-r from-primary via-primary/35 to-transparent" />
              <div className="space-y-3 text-[15px] leading-8 text-foreground/95">
                {article.intro.split("\n\n").map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            {article.sections.slice(1).map((section) => (
              <section key={section.heading} className="rounded-[1.15rem] border border-border/70 bg-background/75 px-4 py-3.5">
                <h2 className="text-[14px] font-bold leading-6 text-primary ar-heading">{section.heading}</h2>
                <div className="mt-2 space-y-3 text-[14px] leading-8 text-foreground/90">
                  {section.body.split("\n\n").map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}

            <div className="border-t border-primary/10 pt-4 text-center text-[12px] font-medium text-muted-foreground">
              <span className="text-primary">Pregnancy Toolkits</span>
              <span className="mx-2 text-border">•</span>
              <span>{copy.professionalDesk}</span>
            </div>
          </div>
        </section>

        {!!relatedTools.length && (
          <section className="space-y-3 rounded-[1.5rem] border border-primary/10 bg-gradient-to-br from-card via-background to-secondary/25 px-3 py-3.5" style={{ boxShadow: "var(--shadow-card)" }}>
            <div>
              <h2 className="text-base font-extrabold text-primary ar-heading">أدوات مفيدة</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {relatedTools.map((tool) => (
                <Link key={tool.id} to={tool.href} className="rounded-2xl border border-primary/10 bg-background/90 px-3 py-3 transition-colors hover:border-primary/35 hover:bg-secondary/30">
                  <div className="text-sm font-bold text-foreground ar-heading">{t(tool.titleKey)}</div>
                  <div className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted-foreground">{t(tool.descriptionKey)}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <RelatedArticles slug={article.slug} />
        <FeaturedArticlesRail limit={4} />
      </article>
    </Layout>
  );
};

export default ArticlePage;
