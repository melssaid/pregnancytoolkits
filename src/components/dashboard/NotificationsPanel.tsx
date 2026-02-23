import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { sendDailyScheduleToSW } from '@/lib/scheduleNotifications';
import { 
  Bell, X, CheckCheck, Settings, Pill, Droplet, Dumbbell, Calendar, Heart,
  Sparkles, ChevronRight, HardDrive, BellRing, Volume2, VolumeX,
  Clock, Zap, Shield, Pin, AlertTriangle, Stethoscope, BellPlus, BellOff,
  CheckCircle, ExternalLink, Smartphone, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const typeIcons: Record<string, any> = {
  appointment: Calendar,
  vitamin: Pill,
  exercise: Dumbbell,
  water: Droplet,
  stretch: Sparkles,
  kegel: Heart,
  backup: HardDrive,
  general: Bell,
  welcome: Zap,
  disclaimer: Shield,
};

const typeColors: Record<string, string> = {
  appointment: 'bg-blue-500',
  vitamin: 'bg-amber-500',
  exercise: 'bg-emerald-500',
  water: 'bg-sky-500',
  stretch: 'bg-violet-500',
  kegel: 'bg-pink-500',
  backup: 'bg-rose-500',
  general: 'bg-primary',
  welcome: 'bg-pink-500',
  disclaimer: 'bg-amber-500',
};

function NotificationItem({ notification, onRead, onClear, index, onDisclaimerClick }: { 
  notification: Notification; 
  onRead: () => void;
  onClear: () => void;
  index: number;
  onDisclaimerClick?: () => void;
}) {
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type] || 'bg-primary';
  const isPinned = notification.isPinned;
  const isDisclaimer = notification.type === 'disclaimer';
  
  const { t } = useTranslation();
  const timeAgo = () => {
    if (isPinned) return '';
    const diff = Date.now() - new Date(notification.time).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return t('notificationsPanel.now');
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100 && !isPinned) {
      onClear();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ delay: index * 0.03, duration: 0.15 }}
      drag={isPinned ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.4}
      onDragEnd={handleDragEnd}
      className={`relative px-2.5 py-2 rounded-lg border transition-colors touch-pan-y ${
        isPinned 
          ? 'bg-primary/5 border-primary/15' 
          : notification.read 
            ? 'bg-muted/20 border-transparent' 
            : 'bg-card border-border/40'
      }`}
    >
      {/* Unread dot */}
      {!notification.read && !isPinned && (
        <div className="absolute start-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
      
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-md ${colorClass} flex items-center justify-center text-white flex-shrink-0`}>
          <Icon className="w-3 h-3" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className={`text-[11px] font-semibold truncate ${notification.read && !isPinned ? 'text-muted-foreground' : 'text-foreground'}`}>
              {notification.title}
            </h4>
            {!isPinned && (
              <span className="text-[9px] text-muted-foreground shrink-0">{timeAgo()}</span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{notification.message}</p>
        </div>

        {!isPinned && (
          <button 
            onClick={onClear} 
            className="p-1 rounded-md hover:bg-muted/60 transition-colors shrink-0"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>
      
      {/* Action link - only show if not read or is disclaimer */}
      {(isDisclaimer || (notification.actionUrl && !notification.read)) && (
        isDisclaimer ? (
          <button 
            onClick={() => onDisclaimerClick?.()}
            className="mt-1 ms-8 text-[10px] font-medium text-primary flex items-center gap-0.5"
          >
            {t('notificationsPanel.viewDetails')} <ChevronRight className="w-2.5 h-2.5" />
          </button>
        ) : (
          <Link 
            to={notification.actionUrl!} 
            onClick={onRead}
            className="mt-1 ms-8 text-[10px] font-medium text-primary flex items-center gap-0.5"
          >
            {t('notificationsPanel.viewDetails')} <ChevronRight className="w-2.5 h-2.5" />
          </Link>
        )
      )}
    </motion.div>
  );
}

function SettingsItem({ 
  icon: Icon, 
  label, 
  color, 
  checked, 
  onChange 
}: { 
  icon: any; 
  label: string; 
  color: string; 
  checked: boolean; 
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between py-1.5 px-2 rounded-lg border transition-all duration-200 w-full ${
        checked 
          ? 'bg-primary/8 border-primary/30' 
          : 'bg-muted/20 border-border/40 opacity-50'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <div className={`w-4 h-4 rounded ${checked ? color : 'bg-muted-foreground/30'} flex items-center justify-center transition-colors`}>
          <Icon className="w-2 h-2 text-white" />
        </div>
        <span className={`text-[10px] font-medium ${checked ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
      </div>
      <div className={`w-3.5 h-3.5 rounded-full border-[1.5px] flex items-center justify-center transition-all ${
        checked ? 'border-primary bg-primary' : 'border-muted-foreground/40'
      }`}>
        {checked && <CheckCircle className="w-2.5 h-2.5 text-primary-foreground" />}
      </div>
    </button>
  );
}

export function NotificationsPanel() {
  const { t } = useTranslation();
  
  const { 
    notifications, 
    unreadCount, 
    settings, 
    addNotification,
    markAsRead, 
    markAllAsRead, 
    clearNotification, 
    clearAll,
    updateSettings 
  } = useNotifications();
  
  const [showSettings, setShowSettings] = useState(false);
  const [showDisclaimerDialog, setShowDisclaimerDialog] = useState(false);
  
  const { supported: pushSupported, permission: pushPermission, enabled: pushEnabled, enablePush, disablePush } = usePushNotifications();

  // Check if pinned notifications should be hidden (after 3 hours from first visit)
  const shouldShowPinnedNotifications = useMemo(() => {
    const FIRST_VISIT_KEY = 'app_first_visit_time';
    const PINNED_HIDDEN_KEY = 'pinned_notifications_hidden';
    if (localStorage.getItem(PINNED_HIDDEN_KEY) === 'true') return false;
    let firstVisitTime = localStorage.getItem(FIRST_VISIT_KEY);
    if (!firstVisitTime) {
      firstVisitTime = new Date().toISOString();
      localStorage.setItem(FIRST_VISIT_KEY, firstVisitTime);
    }
    const hoursSinceFirstVisit = (Date.now() - new Date(firstVisitTime).getTime()) / (1000 * 60 * 60);
    if (hoursSinceFirstVisit >= 3) {
      localStorage.setItem(PINNED_HIDDEN_KEY, 'true');
      return false;
    }
    return true;
  }, []);

  const pinnedNotifications: Notification[] = useMemo(() => {
    if (!shouldShowPinnedNotifications) return [];
    return [
      {
        id: 'pinned-welcome',
        type: 'welcome',
        title: t('notificationsPanel.welcome'),
        message: t('notificationsPanel.welcomeDesc'),
        time: new Date().toISOString(),
        read: true,
        isPinned: true,
        actionUrl: '/',
      },
      {
        id: 'pinned-disclaimer',
        type: 'disclaimer',
        title: t('notificationsPanel.disclaimer'),
        message: t('notificationsPanel.disclaimerDesc'),
        time: new Date().toISOString(),
        read: true,
        isPinned: true,
        actionUrl: '/privacy-policy',
      },
    ];
  }, [t, shouldShowPinnedNotifications]);

  const allNotifications = useMemo(() => {
    const regularNotifications = notifications.filter(n => !n.isPinned);
    return [...pinnedNotifications, ...regularNotifications];
  }, [notifications, pinnedNotifications]);

  const recentNotifications = allNotifications.slice(0, 7);
  const regularCount = notifications.filter(n => !n.isPinned).length;

  return (
    <Card className="overflow-hidden border-border/50">
      {/* Compact Header */}
      <div className="px-3 py-2 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <BellRing className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -end-1 w-3.5 h-3.5 bg-destructive text-destructive-foreground text-[8px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-[11px] font-bold leading-tight">{t('notificationsPanel.title')}</h3>
              <p className="text-[9px] text-muted-foreground">
                {unreadCount > 0 ? t('notificationsPanel.unread', { count: unreadCount }) : t('notificationsPanel.allCaughtUp')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-0.5">
            {unreadCount > 0 && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={markAllAsRead}>
                <CheckCheck className="w-3 h-3" />
              </Button>
            )}
            {regularCount > 0 && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearAll} title={t('notificationsPanel.clearAll')}>
                <Trash2 className="w-3 h-3 text-muted-foreground" />
              </Button>
            )}
            <Button 
              variant={showSettings ? "secondary" : "ghost"}
              size="icon" 
              className="h-6 w-6"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className={`w-3 h-3 transition-transform ${showSettings ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border/40"
          >
            <div className="p-2.5 bg-muted/20">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Shield className="w-2.5 h-2.5 text-primary" />
                <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{t('notificationsPanel.reminders')}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <SettingsItem icon={Calendar} label={t('notificationsPanel.appointments')} color="bg-blue-500" checked={settings.appointmentReminders} onChange={(v) => updateSettings({ appointmentReminders: v })} />
                <SettingsItem icon={Pill} label={t('notificationsPanel.vitamins')} color="bg-amber-500" checked={settings.vitaminReminders} onChange={(v) => updateSettings({ vitaminReminders: v })} />
                <SettingsItem icon={Dumbbell} label={t('notificationsPanel.exercise')} color="bg-emerald-500" checked={settings.exerciseReminders} onChange={(v) => updateSettings({ exerciseReminders: v })} />
                <SettingsItem icon={Droplet} label={t('notificationsPanel.water')} color="bg-sky-500" checked={settings.waterReminders} onChange={(v) => updateSettings({ waterReminders: v })} />
                <SettingsItem icon={Sparkles} label={t('notificationsPanel.stretching')} color="bg-violet-500" checked={settings.stretchReminders} onChange={(v) => updateSettings({ stretchReminders: v })} />
                <SettingsItem icon={Heart} label={t('notificationsPanel.kegel')} color="bg-pink-500" checked={settings.kegelReminders ?? true} onChange={(v) => updateSettings({ kegelReminders: v })} />
                <SettingsItem 
                  icon={HardDrive} 
                  label={t('notificationsPanel.backup')} 
                  color="bg-rose-500" 
                  checked={settings.backupReminders ?? false} 
                  onChange={(v) => {
                    updateSettings({ backupReminders: v });
                    if (v && !localStorage.getItem('backup_reminder_first_enabled')) {
                      localStorage.setItem('backup_reminder_first_enabled', 'true');
                      addNotification({
                        type: 'backup',
                        title: t('notificationsPanel.backupEnabled'),
                        message: t('notificationsPanel.backupEnabledDesc'),
                        actionUrl: '/settings',
                      });
                    }
                  }} 
                />
              </div>

              {/* Push Notifications */}
              {pushSupported && (
                <div className="mt-2 pt-2 border-t border-border/30">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <BellPlus className="w-2.5 h-2.5 text-primary" />
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('notificationsPanel.pushNotifications')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 py-1 px-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 mb-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-medium">
                      {t('notificationsPanel.inAppActive')}
                    </span>
                  </div>

                  {pushPermission === 'denied' ? (
                    <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2 space-y-1.5">
                      <div className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                          {t('notificationsPanel.pushGuideTitle')}
                        </span>
                      </div>
                      <p className="text-[9px] text-muted-foreground leading-relaxed">
                        {t('notificationsPanel.pushGuideDesc')}
                      </p>
                      <div className="space-y-0.5 text-[9px] text-muted-foreground">
                        <div>1. {t('notificationsPanel.pushGuideStep1')}</div>
                        <div>2. {t('notificationsPanel.pushGuideStep2')}</div>
                        <div>3. {t('notificationsPanel.pushGuideStep3')}</div>
                      </div>
                      <button
                        onClick={() => window.location.reload()}
                        className="w-full py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-[9px] font-medium text-amber-700 dark:text-amber-400 transition-colors flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        {t('notificationsPanel.pushGuideReload')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={async () => {
                        if (!pushEnabled) {
                          const success = await enablePush();
                          if (success) {
                            toast.success(t('notificationsPanel.pushEnabledSuccess'));
                            sendDailyScheduleToSW();
                          }
                        } else {
                          disablePush();
                        }
                      }}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-lg border transition-all w-full ${
                        pushEnabled ? 'bg-primary/8 border-primary/30' : 'bg-muted/20 border-border/40 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded ${pushEnabled ? 'bg-primary' : 'bg-muted-foreground/30'} flex items-center justify-center`}>
                          {pushEnabled ? <BellPlus className="w-2 h-2 text-primary-foreground" /> : <BellOff className="w-2 h-2 text-white" />}
                        </div>
                        <span className={`text-[10px] font-medium ${pushEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {t('notificationsPanel.enablePush')}
                        </span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-full border-[1.5px] flex items-center justify-center ${
                        pushEnabled ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                      }`}>
                        {pushEnabled && <CheckCircle className="w-2.5 h-2.5 text-primary-foreground" />}
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      <CardContent className="p-2">
        {allNotifications.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-[11px] font-medium text-muted-foreground">{t('notificationsPanel.noCaughtUp')}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{t('notificationsPanel.noDesc')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {recentNotifications.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  onClear={() => clearNotification(notification.id)}
                  index={index}
                  onDisclaimerClick={() => setShowDisclaimerDialog(true)}
                />
              ))}
            </AnimatePresence>
            
            {allNotifications.length > 7 && (
              <p className="text-center text-[9px] text-muted-foreground pt-1">
                +{allNotifications.length - 7} {t('notificationsPanel.moreNotifications', { count: allNotifications.length - 7 })}
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Disclaimer Dialog */}
      <Dialog open={showDisclaimerDialog} onOpenChange={setShowDisclaimerDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Stethoscope className="w-5 h-5" />
              {t('notificationsPanel.disclaimerTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{t('notificationsPanel.disclaimerBody')}</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">{t('notificationsPanel.pleaseNote')}</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>{t('notificationsPanel.consultDoctor')}</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>{t('notificationsPanel.aiGeneral')}</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>{t('notificationsPanel.emergency')}</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>{t('notificationsPanel.dataLocal')}</li>
              </ul>
            </div>
            <Button onClick={() => setShowDisclaimerDialog(false)} className="w-full">
              {t('notificationsPanel.understood')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
