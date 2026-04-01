import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { sendDailyScheduleToSW } from '@/lib/scheduleNotifications';
import { 
  Bell, X, CheckCheck, Pill, Droplet, Calendar, Heart,
  BellRing, BellPlus, BellOff,
  CheckCircle, Smartphone, Trash2, ExternalLink, ChevronRight, Settings,
  Baby, Footprints, Trophy, Shirt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { PushPermissionPrompt } from '@/components/notifications/PushPermissionPrompt';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const typeIcons: Record<string, any> = {
  appointment: Calendar,
  vitamin: Pill,
  water: Droplet,
  cycle: Heart,
  weeklyTip: Baby,
  kickReminder: Footprints,
  milestone: Trophy,
  diaper: Shirt,
  general: Bell,
};

const typeGradients: Record<string, string> = {
  appointment: 'from-blue-500 to-blue-600',
  vitamin: 'from-amber-400 to-amber-500',
  water: 'from-sky-400 to-sky-500',
  cycle: 'from-rose-400 to-rose-500',
  weeklyTip: 'from-pink-400 to-pink-500',
  kickReminder: 'from-violet-400 to-violet-500',
  milestone: 'from-yellow-400 to-orange-500',
  diaper: 'from-teal-400 to-teal-500',
  general: 'from-primary to-accent',
};

function NotificationItem({ notification, onRead, onClear }: { 
  notification: Notification; 
  onRead: () => void;
  onClear: () => void;
}) {
  const Icon = typeIcons[notification.type] || Bell;
  const gradient = typeGradients[notification.type] || 'from-primary to-accent';
  
  const { t } = useTranslation();

  // Resolve i18n keys at render time for live language switching
  const displayTitle = notification.titleKey ? t(notification.titleKey) : notification.title;
  const displayMessage = notification.messageKey 
    ? t(notification.messageKey, notification.messageParams || {}) 
    : notification.message;

  const timeAgo = () => {
    const diff = Date.now() - new Date(notification.time).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return t('notificationsPanel.now');
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) onClear();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      onClick={() => { if (!notification.read) onRead(); }}
      className={`relative flex items-start gap-2.5 p-2.5 rounded-xl transition-all touch-pan-y cursor-pointer group ${
        notification.read 
          ? 'opacity-50' 
          : 'bg-card/60'
      }`}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className={`text-xs font-semibold leading-tight ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
            {displayTitle}
          </h4>
          <span className="text-[9px] text-muted-foreground/70 shrink-0 pt-0.5">{timeAgo()}</span>
        </div>
        <p className="text-[11px] text-muted-foreground/80 leading-snug mt-0.5 line-clamp-2">{displayMessage}</p>
        
        {notification.actionUrl && !notification.read && (
          <Link 
            to={notification.actionUrl} 
            onClick={(e) => { e.stopPropagation(); onRead(); }}
            className="inline-flex items-center gap-0.5 mt-1.5 text-[10px] font-semibold text-primary hover:underline"
          >
            {t('notificationsPanel.viewDetails')} <ChevronRight className="w-2.5 h-2.5" />
          </Link>
        )}
      </div>

      {/* Dismiss */}
      <button 
        onClick={(e) => { e.stopPropagation(); onClear(); }} 
        className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted/60 transition-all shrink-0"
      >
        <X className="w-3 h-3 text-muted-foreground" />
      </button>
      
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-primary" />
      )}
    </motion.div>
  );
}

function SettingsItem({ 
  icon: Icon, label, hint, color, checked, onChange
}: { 
  icon: any; label: string; hint?: string; color: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between py-2 px-3 rounded-xl transition-all duration-200 w-full ${
        checked 
          ? 'bg-primary/8 border border-primary/20' 
          : 'bg-muted/30 border border-transparent opacity-60'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-6 h-6 rounded-lg ${checked ? color : 'bg-muted-foreground/20'} flex items-center justify-center transition-colors`}>
          <Icon className="w-3 h-3 text-white" />
        </div>
        <div className="text-start">
          <span className={`text-xs font-medium block ${checked ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
          {checked && hint && (
            <span className="text-[9px] text-primary/70 block">{hint}</span>
          )}
        </div>
      </div>
      <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
        checked ? 'border-primary bg-primary' : 'border-muted-foreground/30'
      }`}>
        {checked && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
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
    markAsRead, 
    markAllAsRead, 
    clearNotification, 
    clearAll,
    updateSettings 
  } = useNotifications();
  
  const [showSettings, setShowSettings] = useState(false);


  const { supported: pushSupported, permission: pushPermission, enabled: pushEnabled, enablePush, disablePush } = usePushNotifications();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
              <BellRing className="w-4 h-4 text-primary-foreground" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-card">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold">{t('notificationsPanel.title')}</h3>
            <p className="text-[10px] text-muted-foreground">
              {unreadCount > 0 ? t('notificationsPanel.unread', { count: unreadCount }) : t('notificationsPanel.allCaughtUp')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={markAllAsRead}>
              <CheckCheck className="w-3.5 h-3.5" />
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={clearAll}>
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          )}
          <Button 
            variant={showSettings ? "secondary" : "ghost"}
            size="icon" 
            className="h-7 w-7 rounded-lg"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className={`w-3.5 h-3.5 transition-transform ${showSettings ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pb-2">
              {/* Master toggle */}
              <button
                onClick={() => updateSettings({ masterEnabled: !settings.masterEnabled })}
                className={`flex items-center justify-between py-2.5 px-3 rounded-xl border transition-all w-full mb-2 ${
                  settings.masterEnabled 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-destructive/5 border-destructive/20'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg ${settings.masterEnabled ? 'bg-primary' : 'bg-muted-foreground/30'} flex items-center justify-center transition-colors`}>
                    {settings.masterEnabled ? <BellRing className="w-3.5 h-3.5 text-primary-foreground" /> : <BellOff className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="text-start">
                    <span className={`text-xs font-bold block ${settings.masterEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {t('notificationsPanel.masterToggle')}
                    </span>
                    <span className="text-[9px] text-muted-foreground block">
                      {settings.masterEnabled ? t('notificationsPanel.masterOnHint') : t('notificationsPanel.masterOffHint')}
                    </span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  settings.masterEnabled ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                }`}>
                  {settings.masterEnabled && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />}
                </div>
              </button>

              {/* Individual toggles — only show when master is ON */}
              {settings.masterEnabled && (<>
              <SettingsItem icon={Calendar} label={t('notificationsPanel.appointments')} hint={t('notificationsPanel.appointmentsHint')} color="bg-blue-500" checked={settings.appointmentReminders} onChange={(v) => updateSettings({ appointmentReminders: v })} />
              <SettingsItem icon={Pill} label={t('notificationsPanel.vitamins')} hint={t('notificationsPanel.vitaminsHint')} color="bg-amber-500" checked={settings.vitaminReminders} onChange={(v) => updateSettings({ vitaminReminders: v })} />
              <SettingsItem icon={Droplet} label={t('notificationsPanel.water')} hint={t('notificationsPanel.waterHint')} color="bg-sky-500" checked={settings.waterReminders} onChange={(v) => updateSettings({ waterReminders: v })} />
              <SettingsItem icon={Heart} label={t('notificationsPanel.cycleReminders')} hint={t('notificationsPanel.cycleHint')} color="bg-rose-500" checked={settings.cycleReminders} onChange={(v) => updateSettings({ cycleReminders: v })} />
              <SettingsItem icon={Footprints} label={t('notificationsPanel.kickReminders')} hint={t('notificationsPanel.kickHint')} color="bg-violet-500" checked={settings.kickReminders} onChange={(v) => updateSettings({ kickReminders: v })} />
              <SettingsItem icon={Trophy} label={t('notificationsPanel.milestoneReminders')} hint={t('notificationsPanel.milestoneHint')} color="bg-yellow-500" checked={settings.milestoneReminders} onChange={(v) => updateSettings({ milestoneReminders: v })} />
              <SettingsItem icon={Shirt} label={t('notificationsPanel.diaperReminders')} hint={t('notificationsPanel.diaperHint')} color="bg-teal-500" checked={settings.diaperReminders} onChange={(v) => updateSettings({ diaperReminders: v })} />
              </>)}

              {pushSupported && (
                <div className="pt-1 mt-1 border-t border-border/30">
                  {pushPermission === 'denied' ? (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                          {t('notificationsPanel.pushGuideTitle')}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {t('notificationsPanel.pushGuideDesc')}
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="w-full py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-[10px] font-medium text-amber-700 dark:text-amber-400 transition-colors flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
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
                      className={`flex items-center justify-between py-2 px-3 rounded-xl border transition-all w-full ${
                        pushEnabled ? 'bg-primary/8 border-primary/20' : 'bg-muted/30 border-transparent opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-lg ${pushEnabled ? 'bg-primary' : 'bg-muted-foreground/20'} flex items-center justify-center`}>
                          {pushEnabled ? <BellPlus className="w-3 h-3 text-primary-foreground" /> : <BellOff className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-xs font-medium ${pushEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {t('notificationsPanel.enablePush')}
                        </span>
                      </div>
                      <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                        pushEnabled ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                      }`}>
                        {pushEnabled && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
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
      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
            <Bell className="w-5 h-5 text-muted-foreground/40" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">{t('notificationsPanel.noCaughtUp')}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">{t('notificationsPanel.noDesc')}</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={() => markAsRead(notification.id)}
                onClear={() => clearNotification(notification.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
