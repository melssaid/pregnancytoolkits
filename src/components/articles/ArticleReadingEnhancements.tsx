import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Bookmark, BookmarkCheck, Share2, ArrowUp, List, X } from "lucide-react";
import { toast } from "sonner";
import { useSavedResults } from "@/hooks/useSavedResults";

interface Section {
  heading: string;
  body: string;
}

interface Props {
  slug: string;
  title: string;
  excerpt: string;
  sections: Section[];
  isRTL: boolean;
}

/** Top fixed reading progress bar */
function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      setProgress(height > 0 ? Math.min(100, Math.max(0, (scrollTop / height) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent pointer-events-none"
    >
      <div
        className="h-full bg-gradient-to-r from-[hsl(340,65%,52%)] via-[hsl(345,60%,56%)] to-[hsl(15,70%,55%)] transition-[width] duration-150"
        style={{ width: `${progress}%`, boxShadow: "0 0 8px hsl(340 65% 52% / 0.45)" }}
      />
    </div>
  );
}

/** Floating action bar — share, save, ToC, back-to-top */
export function ArticleReadingEnhancements({ slug, title, excerpt, sections, isRTL }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const isAr = lang === "ar";
  const { isSaved, save, unsaveByContent } = useSavedResults();
  const [showToc, setShowToc] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const savedKey = `article:${slug}`;
  const saved = isSaved(savedKey);

  const labels = useMemo(
    () => ({
      share: isAr ? "مشاركة" : "Share",
      save: isAr ? "حفظ" : "Save",
      saved: isAr ? "محفوظ" : "Saved",
      toc: isAr ? "محتويات المقال" : "In this article",
      top: isAr ? "أعلى" : "Top",
      copied: isAr ? "تم نسخ الرابط" : "Link copied",
      shareFail: isAr ? "تعذرت المشاركة" : "Sharing failed",
    }),
    [isAr]
  );

  const headings = useMemo(
    () =>
      sections
        .map((s, i) => ({ heading: s.heading.trim(), index: i }))
        .filter((s) => s.heading.length > 0),
    [sections]
  );

  // Track scroll for back-to-top button
  useEffect(() => {
    const onScroll = () => setShowTopBtn(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title, text: excerpt, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success(labels.copied);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") toast.error(labels.shareFail);
    }
  }, [title, excerpt, labels.copied, labels.shareFail]);

  const handleSave = useCallback(() => {
    if (saved) {
      unsaveByContent(savedKey);
    } else {
      save({
        toolId: "article-bookmark",
        title,
        content: savedKey,
        meta: { slug, excerpt, savedAt: new Date().toISOString() },
      });
    }
  }, [saved, unsaveByContent, save, savedKey, title, slug, excerpt]);

  const scrollToHeading = useCallback((index: number) => {
    const el = document.querySelector(`[data-section-index="${index}"]`) as HTMLElement | null;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setShowToc(false);
  }, []);

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <ReadingProgressBar />

      {/* Inline Table of Contents card (only when there are headings) */}
      {headings.length > 1 && (
        <section
          dir={isRTL ? "rtl" : "ltr"}
          className="rounded-[1.35rem] border border-border bg-card px-4 py-3"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <button
            type="button"
            onClick={() => setShowToc((s) => !s)}
            className="flex w-full items-center justify-between gap-2 text-start"
            aria-expanded={showToc}
          >
            <span className="flex items-center gap-2">
              <List className="h-4 w-4 text-primary" strokeWidth={2.2} />
              <span className={`text-[13px] font-extrabold text-foreground ${isAr ? "ar-heading" : ""}`}>
                {labels.toc}
              </span>
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {headings.length}
            </span>
          </button>
          {showToc && (
            <ol className={`mt-3 space-y-1.5 ${isRTL ? "pe-2" : "ps-2"}`}>
              {headings.map((h, idx) => (
                <li key={`${h.index}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => scrollToHeading(h.index)}
                    className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-start text-[12px] leading-6 text-foreground/85 transition-colors hover:bg-secondary"
                  >
                    <span className="mt-[2px] inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-primary">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{h.heading}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {/* Floating action bar */}
      <div
        className={`fixed bottom-20 z-40 flex flex-col gap-2 ${isRTL ? "left-3" : "right-3"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {showTopBtn && (
          <button
            type="button"
            onClick={scrollTop}
            aria-label={labels.top}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-md backdrop-blur transition-all hover:scale-105 active:scale-95"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.2} />
          </button>
        )}
        <button
          type="button"
          onClick={handleShare}
          aria-label={labels.share}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-md backdrop-blur transition-all hover:scale-105 active:scale-95"
        >
          <Share2 className="h-4 w-4 text-primary" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          onClick={handleSave}
          aria-label={saved ? labels.saved : labels.save}
          aria-pressed={saved}
          className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-md backdrop-blur transition-all hover:scale-105 active:scale-95 ${
            saved
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card/95 text-foreground"
          }`}
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4" strokeWidth={2.2} />
          ) : (
            <Bookmark className="h-4 w-4 text-primary" strokeWidth={2.2} />
          )}
        </button>
      </div>
    </>
  );
}

export default ArticleReadingEnhancements;
