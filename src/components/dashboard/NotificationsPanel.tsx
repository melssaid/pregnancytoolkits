import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { sendDailyScheduleToSW } from '@/lib/scheduleNotifications';
import { 
  Bell, X, CheckCheck, Settings, Pill, Droplet, Calendar,
  BellRing, BellPlus, BellOff,
  CheckCircle, Smartphone, Trash2, ExternalLink, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const typeIcons: Record<string, any> = {
  appointment: Calendar,
  vitamin: Pill,
  water: Droplet,
  general: Bell,
};

const typeColors: Record<string, string> = {
  appointment: 'bg-blue-500',
  vitamin: 'bg-amber-500',
  water: 'bg-sky-500',
  general: 'bg-primary',
};

function NotificationItem({ notification, onRead, onClear, index }: { 
  notification: Notification; 
  onRead: () => void;
  onClear: () => void;
  index: number;
}) {
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type] || 'bg-primary';
  
  const { t } = useTranslation();
  const timeAgo = () => {
    const diff = Date.now() - new Date(notification.time).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return t('notificationsPanel.now');
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      onClear();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ delay: index * 0.03, duration: 0.15 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.4}
      onDragEnd={handleDragEnd}
      onClick={() => { if (!notification.read) onRead(); }}
      className={`relative px-2.5 py-2 rounded-lg border transition-colors touch-pan-y cursor-pointer ${
        notification.read 
          ? 'bg-muted/20 border-transparent' 
          : 'bg-card border-border/40'
      }`}
    >
      {/* Unread dot */}
      {!notification.read && (
        <div className="absolute start-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
      
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-md ${colorClass} flex items-center justify-center text-white flex-shrink-0`}>
          <Icon className="w-3 h-3" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className={`text-[11px] font-semibold leading-snug ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
              {notification.title}
            </h4>
            <span className="text-[9px] text-muted-foreground shrink-0">{timeAgo()}</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-snug">{notification.message}</p>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onClear(); }} 
          className="p-1 rounded-md hover:bg-muted/60 transition-colors shrink-0"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
      
      {/* Action link */}
      {notification.actionUrl && (
        <Link 
          to={notification.actionUrl} 
          onClick={(e) => { e.stopPropagation(); onRead(); }}
          className="mt-1 ms-8 text-[10px] font-medium text-primary flex items-center gap-0.5"
        >
          {t('notificationsPanel.viewDetails')} <ChevronRight className="w-2.5 h-2.5" />
        </Link>
      )}
    </motion.div>
  );
}

function SettingsItem({ 
  icon: Icon, label, color, checked, onChange 
}: { 
  icon: any; label: string; color: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between py-2 px-2.5 rounded-lg border transition-all duration-200 w-full ${
        checked 
          ? 'bg-primary/8 border-primary/30' 
          : 'bg-muted/20 border-border/40 opacity-50'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-md ${checked ? color : 'bg-muted-foreground/30'} flex items-center justify-center transition-colors`}>
          <Icon className="w-2.5 h-2.5 text-white" />
        </div>
        <span className={`text-xs font-medium ${checked ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
      </div>
      <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all ${
        checked ? 'border-primary bg-primary' : 'border-muted-foreground/40'
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
    <Card className="overflow-hidden border-border/50">
      {/* Header */}
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
            {notifications.length > 0 && (
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
            <div className="p-2.5 bg-muted/20 space-y-1.5">
              <SettingsItem icon={Calendar} label={t('notificationsPanel.appointments')} color="bg-blue-500" checked={settings.appointmentReminders} onChange={(v) => updateSettings({ appointmentReminders: v })} />
              <SettingsItem icon={Pill} label={t('notificationsPanel.vitamins')} color="bg-amber-500" checked={settings.vitaminReminders} onChange={(v) => updateSettings({ vitaminReminders: v })} />
              <SettingsItem icon={Droplet} label={t('notificationsPanel.water')} color="bg-sky-500" checked={settings.waterReminders} onChange={(v) => updateSettings({ waterReminders: v })} />

              {/* Push Notifications */}
              {pushSupported && (
                <div className="pt-1.5 border-t border-border/30">
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
                      className={`flex items-center justify-between py-2 px-2.5 rounded-lg border transition-all w-full ${
                        pushEnabled ? 'bg-primary/8 border-primary/30' : 'bg-muted/20 border-border/40 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-md ${pushEnabled ? 'bg-primary' : 'bg-muted-foreground/30'} flex items-center justify-center`}>
                          {pushEnabled ? <BellPlus className="w-2.5 h-2.5 text-primary-foreground" /> : <BellOff className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className={`text-xs font-medium ${pushEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {t('notificationsPanel.enablePush')}
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center ${
                        pushEnabled ? 'border-primary bg-primary' : 'border-muted-foreground/40'
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
      <CardContent className="p-2">
        {notifications.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-[11px] font-medium text-muted-foreground">{t('notificationsPanel.noCaughtUp')}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{t('notificationsPanel.noDesc')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {notifications.slice(0, 10).map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  onClear={() => clearNotification(notification.id)}
                  index={index}
                />
              ))}
            </AnimatePresence>
            
            {notifications.length > 10 && (
              <p className="text-center text-[9px] text-muted-foreground pt-1">
                +{notifications.length - 10} {t('notificationsPanel.moreNotifications', { count: notifications.length - 10 })}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
