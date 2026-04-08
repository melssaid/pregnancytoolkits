import React, { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, User, Download, Trash2, Heart, 
  ChevronRight, ChevronLeft, Lock, RotateCcw
} from 'lucide-react';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { toast } from 'sonner';
import { DataBackupManager } from '@/components/settings/DataBackupManager';
import { EncryptionManager } from '@/components/settings/EncryptionManager';
import { AccountDeletion } from '@/components/settings/AccountDeletion';
import { LanguageSelector } from '@/components/settings/LanguageSelector';
import { ProfileEditor } from '@/components/settings/ProfileEditor';
import { Layout } from '@/components/Layout';
import PrivacyTrustCard from '@/components/settings/PrivacyTrustCard';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type SettingsView = 'main' | 'profile' | 'language' | 'security' | 'backup' | 'delete';

const APP_VERSION = '1.0.16';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeView, setActiveView] = useState<SettingsView>('main');
  const { used, limit, remaining, resetUsage } = useAIUsage();
  const navigate = useNavigate();
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const settingsItems: {
    id: SettingsView;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    desc: string;
    iconColor: string;
    iconBg: string;
  }[] = [
    {
      id: 'profile',
      icon: User,
      label: t('settings.profile.title'),
      desc: t('settings.profile.desc'),
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
    },
    {
      id: 'language',
      icon: Globe,
      label: t('settings.language.sectionTitle'),
      desc: t('settings.language.desc'),
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
    },
    {
      id: 'backup',
      icon: Download,
      label: t('settings.backup.title'),
      desc: t('settings.backup.description'),
      iconColor: 'text-accent',
      iconBg: 'bg-accent/10',
    },
    {
      id: 'security',
      icon: Lock,
      label: t('settings.securityPrivacy'),
      desc: t('settings.securityDesc'),
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/10',
    },
    {
      id: 'delete',
      icon: Trash2,
      label: t('settings.deleteAccount.title'),
      desc: t('settings.deleteAccount.description'),
      iconColor: 'text-destructive',
      iconBg: 'bg-destructive/10',
    },
  ];

  const renderSubView = () => {
    switch (activeView) {
      case 'profile': return <ProfileEditor compact />;
      case 'language': return <LanguageSelector compact />;
      case 'security': return <EncryptionManager compact />;
      case 'backup': return <DataBackupManager compact />;
      case 'delete': return <AccountDeletion compact />;
      default: return null;
    }
  };

  const getSubViewTitle = () => {
    const item = settingsItems.find(i => i.id === activeView);
    return item?.label || t('settings.title');
  };

  return (
    <Layout showBack>
      <SEOHead title={t('settings.title')} description="Manage your preferences, data privacy, encryption and language settings" />
      <div className="container py-4 pb-24 max-w-lg mx-auto">

        <AnimatePresence mode="wait">
          {activeView === 'main' ? (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Header */}
              <div className="text-center mb-2">
                <h1 className="text-xl font-bold text-foreground">{t('settings.title')}</h1>
                <p className="text-xs text-muted-foreground mt-1">{t('settings.subtitle')}</p>
              </div>

              {/* Settings List */}
              <div className="rounded-2xl border bg-card overflow-hidden divide-y divide-border/50">
                {settingsItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => item.id === 'language' ? navigate('/language') : setActiveView(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors active:scale-[0.99]"
                    >
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", item.iconBg)}>
                        <Icon className={cn("w-4.5 h-4.5", item.iconColor)} />
                      </div>
                      <div className="flex-1 text-start min-w-0">
                        <span className="text-sm font-medium text-foreground block">{item.label}</span>
                        <span className="text-[10px] text-muted-foreground line-clamp-1">{item.desc}</span>
                      </div>
                      <ChevronIcon className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                    </motion.button>
                  );
                })}
              </div>

              {/* Admin AI Reset — dev only */}
              {import.meta.env.DEV && (
                <div className="rounded-2xl border border-amber-500/30 bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <RotateCcw className="w-4.5 h-4.5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground block">
                        {t('settings.aiReset.title')}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {t('settings.aiReset.status', { used, limit, remaining })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      resetUsage();
                      toast.success(t('settings.aiReset.success'));
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors active:scale-[0.98]"
                  >
                    {t('settings.aiReset.button')}
                  </button>
                  <p className="text-[9px] text-amber-500/60 text-center">⚠ DEV ONLY — hidden in production</p>
                </div>
              )}

              {/* Privacy Trust Card */}
              <PrivacyTrustCard />

              {/* Footer */}
              <div className="text-center space-y-2 pt-2">
                <div className="flex items-center justify-center gap-1.5">
                  <Heart className="w-3 h-3 text-primary" />
                  <span className="text-xs text-muted-foreground">{t('settings.appTagline')}</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/60">
                  <span>v{APP_VERSION}</span>
                  <span>·</span>
                  <Link to="/privacy" className="hover:text-primary transition-colors">
                    {t('settings.dataPrivacy')}
                  </Link>
                  <span>·</span>
                  <Link to="/terms" className="hover:text-primary transition-colors">
                    {t('layout.footer.terms')}
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Sub-view Header */}
              <button
                onClick={() => setActiveView('main')}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors active:scale-[0.97] mb-1"
              >
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span className="font-medium">{t('settings.title')}</span>
              </button>

              <h2 className="text-lg font-bold text-foreground">{getSubViewTitle()}</h2>

              {/* Sub-view Content */}
              <div className="rounded-2xl border bg-card p-4">
                {renderSubView()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
};

export default Settings;
