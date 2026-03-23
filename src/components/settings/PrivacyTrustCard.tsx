import { Shield, Smartphone, Eye, Server } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PrivacyTrustCard = () => {
  const { t } = useTranslation();

  const trustPoints = [
    {
      icon: Smartphone,
      text: t('settings.trust.localData'),
    },
    {
      icon: Eye,
      text: t('settings.trust.noAdSharing'),
    },
    {
      icon: Server,
      text: t('settings.trust.noAIStorage'),
    },
  ];

  return (
    <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          {t('settings.trust.title')}
        </span>
      </div>
      <div className="space-y-2.5">
        {trustPoints.map((point, i) => {
          const Icon = point.icon;
          return (
            <div key={i} className="flex items-start gap-2.5">
              <Icon className="w-3.5 h-3.5 text-primary/70 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {point.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrivacyTrustCard;
