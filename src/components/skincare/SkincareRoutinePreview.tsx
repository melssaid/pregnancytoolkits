import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, Moon as MoonIcon } from "lucide-react";

export const SkincareRoutinePreview = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-2">
      <Card className="border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Sun className="w-3.5 h-3.5 text-primary" />
            <h4 className="font-semibold text-xs">{t('toolsInternal.skincare.morning')}</h4>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {t('toolsInternal.skincare.morningSteps')}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <MoonIcon className="w-3.5 h-3.5 text-primary" />
            <h4 className="font-semibold text-xs">{t('toolsInternal.skincare.evening')}</h4>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {t('toolsInternal.skincare.eveningSteps')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
