import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Trash2, ChevronDown, ChevronUp, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useSavedResults } from "@/hooks/useSavedResults";

/**
 * Compact list of saved holistic analysis reports.
 * Each item shows date + points cost + expandable content.
 */
export const SavedHolisticReports = memo(function SavedHolisticReports() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const { results, remove } = useSavedResults("holistic-dashboard");
  const [openId, setOpenId] = useState<string | null>(null);

  if (results.length === 0) return null;

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(lang, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso.slice(0, 10);
    }
  };

  return (
    <Card
      className="overflow-hidden border-0"
      style={{
        background: "linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(330 30% 98%) 100%)",
        boxShadow: "0 4px 14px -4px hsl(330 40% 50% / 0.12)",
        border: "1px solid hsl(330 30% 92%)",
      }}
    >
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center gap-2">
          <div
            className="shrink-0 p-1.5 rounded-xl"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(330 65% 55%))" }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="font-bold text-[14px] text-foreground leading-tight">
            {t("dashboardV2.holistic.savedList.title")}
          </h3>
          <span className="ml-auto text-[11px] font-semibold text-muted-foreground tabular-nums">
            {results.length}
          </span>
        </div>

        <div className="space-y-2">
          {results.map((r) => {
            const isOpen = openId === r.id;
            const points = (r.meta?.pointsCost as number) ?? 7;
            return (
              <div
                key={r.id}
                className="rounded-xl overflow-hidden"
                style={{ background: "hsl(0 0% 100% / 0.7)", border: "1px solid hsl(0 0% 0% / 0.06)" }}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : r.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[12px] font-semibold text-foreground tabular-nums">
                        {fmtDate(r.savedAt)}
                      </span>
                      <span
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                        style={{ background: "linear-gradient(135deg, hsl(45 90% 50%), hsl(35 90% 50%))" }}
                      >
                        <Crown className="w-2 h-2" />
                        {t("dashboardV2.holistic.savedList.points", { count: points })}
                      </span>
                      {r.meta?.week ? (
                        <span className="text-[10px] text-muted-foreground">
                          {t("dashboardV2.holistic.savedList.week", { week: r.meta.week })}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 pt-1 border-t border-foreground/5 space-y-2">
                    <MarkdownRenderer content={r.content} />
                    <button
                      onClick={() => {
                        remove(r.id);
                        if (openId === r.id) setOpenId(null);
                      }}
                      className="flex items-center gap-1 text-[11px] text-destructive/80 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      {t("dashboardV2.holistic.savedList.delete")}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

export default SavedHolisticReports;
