import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Droplet, Circle, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type DiaperType = "wet" | "dirty" | "both";

interface QuickAddButtonsProps {
  onAdd: (type: DiaperType) => void;
}

export const QuickAddButtons = ({ onAdd }: QuickAddButtonsProps) => {
  const { t } = useTranslation();
  const [lastAdded, setLastAdded] = useState<DiaperType | null>(null);

  const handleAdd = (type: DiaperType) => {
    onAdd(type);
    setLastAdded(type);
    setTimeout(() => setLastAdded(null), 1200);
  };

  const buttons: { type: DiaperType; icon: React.ReactNode; color: string; activeColor: string }[] = [
    {
      type: "wet",
      icon: <Droplet className="h-7 w-7" />,
      color: "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300",
      activeColor: "bg-blue-100 dark:bg-blue-900/40 border-blue-400 scale-95",
    },
    {
      type: "dirty",
      icon: <Circle className="h-7 w-7 fill-current" />,
      color: "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-300",
      activeColor: "bg-amber-100 dark:bg-amber-900/40 border-amber-400 scale-95",
    },
    {
      type: "both",
      icon: (
        <div className="flex gap-0.5">
          <Droplet className="h-5 w-5 text-blue-500" />
          <Circle className="h-5 w-5 text-amber-600 fill-amber-600" />
        </div>
      ),
      color: "text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-300",
      activeColor: "bg-purple-100 dark:bg-purple-900/40 border-purple-400 scale-95",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-semibold">{t('diaperPage.quickAdd')}</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {buttons.map(({ type, icon, color, activeColor }) => (
              <motion.button
                key={type}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleAdd(type)}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-border p-4 transition-all duration-200 ${
                  lastAdded === type ? activeColor : color
                }`}
              >
                <div className="shrink-0">{icon}</div>
                <span className="text-xs font-medium truncate w-full text-center text-foreground">
                  {t(`diaperPage.${type}`)}
                </span>
                
                <AnimatePresence>
                  {lastAdded === type && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -end-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-xs">✓</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
