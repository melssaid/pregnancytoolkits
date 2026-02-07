import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Shield, Baby } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TrimesterAlertProps {
  week: number;
}

const getTrimester = (week: number): 1 | 2 | 3 => {
  if (week <= 13) return 1;
  if (week <= 26) return 2;
  return 3;
};

export const TrimesterAlert: React.FC<TrimesterAlertProps> = ({ week }) => {
  const { t } = useTranslation();
  const trimester = getTrimester(week);

  const configs = {
    1: {
      icon: Shield,
      borderClass: 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-900/10',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
    },
    2: {
      icon: Baby,
      borderClass: 'border-blue-500/30 bg-blue-500/5 dark:bg-blue-900/10',
      iconClass: 'text-blue-600 dark:text-blue-400',
    },
    3: {
      icon: AlertTriangle,
      borderClass: 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-900/10',
      iconClass: 'text-amber-600 dark:text-amber-400',
    },
  };

  const config = configs[trimester];
  const Icon = config.icon;

  return (
    <Card className={`${config.borderClass} border`}>
      <CardContent className="p-3 flex gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-xs text-foreground mb-0.5">
            {t(`toolsInternal.fitnessCoach.trimesterAlerts.t${trimester}.title`)}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t(`toolsInternal.fitnessCoach.trimesterAlerts.t${trimester}.text`)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
