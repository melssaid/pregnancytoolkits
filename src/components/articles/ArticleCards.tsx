
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ArticleRecord, ArticleSectionKey } from "@/data/articles";

const toneMap: Record<ArticleSectionKey, { shell: string; badge: string; overlay: string }> = {
  planning: {
    shell: "bg-gradient-to-br from-primary/10 via-background to-background border-border/80",
    badge: "bg-background/90 text-foreground border-border/60",
    overlay: "from-background via-background/35 to-transparent",
  },
  pregnant: {
    shell: "bg-gradient-to-br from-primary/10 via-secondary/50 to-background border-border/80",
    badge: "bg-background/90 text-foreground border-border/60",
    overlay: "from-background via-background/30 to-transparent",
  },
  postpartum: {
    shell: "bg-gradient-to-br from-secondary via-muted/40 to-background border-border/80",
    badge: "bg-background/90 text-foreground border-border/60",
    overlay: "from-background via-background/35 to-transparent",
  },
};

interface ArticleCardSharedProps {
  article: ArticleRecord;
  isRTL?: boolean;
  label?: string;
  eager?: boolean;
}

export function ArticleFeatureCard({ article, isRTL = false, label, eager = false }: ArticleCardSharedProps) {
  const tone = toneMap[article.sectionKey];
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <Link to={`/articles/${article.slug}`} className="block">
      <Card className={cn("group overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40", tone.shell)} style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <img
              src={article.image}
              alt={article.heroAlt}
              loading={eager ? "eager" : "lazy"}
              width={1280}
              height={720}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </AspectRatio>
          <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-t opacity-90", tone.overlay)} />
          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm", tone.badge)}>
              {label || article.typeLabel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
              <Clock3 className="h-3.5 w-3.5" />
              {article.readTimeLabel}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="rounded-2xl border border-background/60 bg-background/80 p-3.5 backdrop-blur-sm">
              <h3 className="line-clamp-2 text-[15px] font-extrabold leading-snug text-foreground ar-heading">{article.title}</h3>
              <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{article.excerpt}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {article.tagLabels.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full bg-secondary px-2 py-1 text-[10px] font-medium text-secondary-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
                <ArrowIcon className="h-4 w-4 flex-shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function ArticleCompactLink({ article, isRTL = false, label }: ArticleCardSharedProps) {
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <Link to={`/articles/${article.slug}`} className="block">
      <div className="group flex items-center gap-3 rounded-2xl border border-border/80 bg-card/90 px-3 py-3 transition-all duration-300 hover:border-primary/35 hover:bg-background" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted">
          <img src={article.image} alt={article.heroAlt} loading="lazy" width={112} height={112} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">{label || article.typeLabel}</span>
            <span className="text-[10px] font-medium text-muted-foreground">{article.readTimeLabel}</span>
          </div>
          <h4 className="mt-1 line-clamp-2 text-[13px] font-bold leading-snug text-foreground ar-heading">{article.title}</h4>
        </div>
        <ArrowIcon className="h-4 w-4 flex-shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
      </div>
    </Link>
  );
}
