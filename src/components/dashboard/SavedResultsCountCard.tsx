import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { safeParseLocalStorage } from "@/lib/safeStorage";

export const SavedResultsCountCard = memo(function SavedResultsCountCard() {
  const { t } = useTranslation();

  const count = useMemo(() => {
    const all = safeParseLocalStorage<any[]>("ai-saved-results", [], (d): d is any[] => Array.isArray(d));
    return all.length;
  }, []);

  if (count === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Link to="/tools" className="block rounded-2xl border border-border/20 bg-card p-3.5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="text-xl font-bold text-foreground">{count}</span>
            <p className="text-[11px] text-muted-foreground">
              {t("dashboard.savedResults.label", "نتيجة ذكاء اصطناعي محفوظة")}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});
