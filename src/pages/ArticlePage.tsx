
import { Home, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { FeaturedArticlesRail } from "@/components/articles/FeaturedArticlesRail";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import { articleUiCopy, getLocalizedArticleBySlug, getRelatedToolRecords } from "@/data/articles";
import { resolveArticleLocale } from "@/lib/articleLocale";
import { useDailyArticleContent } from "@/hooks/useDailyArticleContent";

const ArticlePage = () => {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const locale = resolveArticleLocale(lang);
  const copy = articleUiCopy(lang);
  const article = useMemo(() => getLocalizedArticleBySlug(slug, lang), [lang, slug]);
  const dailyContent = useDailyArticleContent(slug, lang);
  const relatedTools = useMemo(() => (article ? getRelatedToolRecords(article) : []), [article]);
  const contentFallback = lang === "ar"
    ? {
        title: "المحتوى النصي لهذه المقالة غير متاح حالياً",
        body: "نعمل على استكمال نص هذه المقالة. يمكنكِ العودة لاحقاً أو متابعة أداة مرتبطة أو مقال آخر من نفس القسم.",
      }
    : {
        title: "This article body is not available right now",
        body: "We’re still preparing the full text for this article. Please check back soon or continue with a related tool or another article from this section.",
      };

  if (!article) {
    return (
      <Layout showBack compactBackHeader>
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

  const resolvedSections = useMemo(() => {
    if (!article) return [] as { heading: string; body: string }[];
    return dailyContent.sections.length ? dailyContent.sections : article.sections;
  }, [article, dailyContent.sections]);

  const resolvedTitle = dailyContent.data?.title_override?.trim() || article.title;
  const resolvedIntro = dailyContent.data?.intro_override?.trim() || article.intro?.trim() || "";
  const resolvedExcerpt = dailyContent.data?.excerpt_override?.trim() || resolvedIntro || article.excerpt;
  const markdownBody = useMemo(() => {
    const introBlock = resolvedIntro ? [resolvedIntro] : [];
    const sectionBlocks = resolvedSections.flatMap((section, index) => {
      const body = section.body.trim();
      if (!body) return [];
      if (index === 0 && !section.heading.trim()) return [body];
      return [`## ${section.heading.trim()}`, body];
    });

    return [...introBlock, ...sectionBlocks].join("\n\n").trim();
  }, [resolvedIntro, resolvedSections]);

  const hasRenderableContent = markdownBody.length > 0;

  return (
    <Layout showBack compactBackHeader>
      <SEOHead
        title={resolvedTitle}
        description={dailyContent.data?.seo_description || resolvedExcerpt}
        type="article"
        image={article.image}
        publishedTime={article.publishedAt}
        modifiedTime={article.updatedAt}
        author={copy.professionalDesk}
        articleSection={article.sectionLabel}
        articleTags={article.tagLabels}
      />

      <article className="container max-w-3xl space-y-5 py-5 pb-24" dir={locale.dir}>
        <header className="overflow-hidden rounded-[1.75rem] border border-border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
          <AspectRatio ratio={16 / 8.8}>
            <img src={article.image} alt={article.heroAlt} width={1280} height={720} loading="eager" className="h-full w-full rounded-[1.2rem] object-cover" />
          </AspectRatio>

          <div className="space-y-4 px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">{article.typeLabel}</span>
              <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">{article.sectionLabel}</span>
            </div>

            <div className="relative isolate space-y-3 rounded-[1.25rem] border border-border bg-card px-4 py-4 shadow-sm">
              <h1 className={`relative z-10 text-[1.9rem] font-black leading-tight text-foreground ${locale.headingClass}`}>{resolvedTitle}</h1>
              <p className="relative z-10 text-[15px] leading-8 text-foreground" style={{ textAlign: locale.textAlign }}>{resolvedExcerpt}</p>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <div className="rounded-2xl border border-border bg-secondary px-3 py-2.5">
                <div className="font-semibold text-primary">{article.tagLabels.slice(0, 3).join(" • ")}</div>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-[1.6rem] border border-border bg-card px-4 py-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="relative space-y-3" data-testid="article-body">
            {hasRenderableContent ? (
              <div className="rounded-[1.35rem] border border-border bg-card px-4 py-5">
                <div className={`article-markdown prose prose-sm max-w-none prose-headings:text-foreground prose-p:my-0 prose-p:text-foreground prose-p:leading-8 prose-p:text-[15px] prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-3 prose-h2:text-[1.45rem] prose-h2:font-black prose-ul:my-4 prose-ul:space-y-2 prose-li:text-[14px] prose-li:leading-7 prose-strong:text-foreground dark:prose-invert ${locale.isRTL ? "prose-headings:ar-heading prose-ul:ps-5" : "prose-ul:pl-5"}`}
                  style={{ textAlign: locale.textAlign }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({ children }) => (
                        <h2 className={`text-[1.45rem] font-black leading-tight text-foreground ${locale.headingClass}`}>
                          {children}
                        </h2>
                      ),
                      p: ({ children }) => <p className="text-[15px] leading-8 text-foreground">{children}</p>,
                    }}
                  >
                    {markdownBody}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div data-testid="article-body-fallback" className="rounded-[1.35rem] border border-border bg-card px-4 py-5 text-center">
                <h2 className="text-[15px] font-extrabold text-primary ar-heading">{contentFallback.title}</h2>
                <p className="mt-2 text-[14px] leading-7 text-muted-foreground">{contentFallback.body}</p>
              </div>
            )}

            <div className="border-t border-border pt-4 text-center text-[12px] font-medium text-muted-foreground">
              <span className="text-primary">Pregnancy Toolkits</span>
              <span className="mx-2 text-border">•</span>
              <span>{copy.professionalDesk}</span>
            </div>
          </div>
        </section>

        {!!relatedTools.length && (
          <section className="space-y-2 rounded-[1.35rem] border border-border bg-card px-3 py-3" style={{ boxShadow: "var(--shadow-card)" }} dir={locale.dir}>
            <div>
              <h2 className={`text-[13px] font-extrabold text-primary ${locale.headingClass}`}>{copy.relatedTools}</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {relatedTools.map((tool) => (
                <Link key={tool.id} to={tool.href} className="rounded-[1rem] border border-border bg-card px-3 py-2 transition-colors hover:border-primary/35 hover:bg-secondary">
                  <div className={`text-[11px] font-bold text-foreground ${locale.headingClass}`}>{t(tool.titleKey)}</div>
                  <div className="mt-1 line-clamp-2 text-[9px] leading-4 text-muted-foreground">{t(tool.descriptionKey)}</div>
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
