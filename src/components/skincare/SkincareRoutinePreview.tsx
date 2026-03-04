import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, Moon as MoonIcon } from "lucide-react";
import { motion } from "framer-motion";

export const SkincareRoutinePreview = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="grid grid-cols-2 gap-2">
        <Card className="overflow-hidden border-primary/10">
          <CardContent className="p-3 text-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/10 flex items-center justify-center mx-auto mb-2">
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <h4 className="font-semibold text-xs">{t('toolsInternal.skincare.morning')}</h4>
            <p className="text-[10px] text-muted-foreground leading-tight mt-1">
              {t('toolsInternal.skincare.morningSteps')}
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-primary/10">
          <CardContent className="p-3 text-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/10 flex items-center justify-center mx-auto mb-2">
              <MoonIcon className="w-4 h-4 text-indigo-500" />
            </div>
            <h4 className="font-semibold text-xs">{t('toolsInternal.skincare.evening')}</h4>
            <p className="text-[10px] text-muted-foreground leading-tight mt-1">
              {t('toolsInternal.skincare.eveningSteps')}
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
