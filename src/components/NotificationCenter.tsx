import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Bell, X, CheckCheck, Settings, Pill, Droplet, Dumbbell, Calendar, Sparkles, ChevronRight, HardDrive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';

const typeIcons: Record<string, any> = {
  appointment: Calendar,
  vitamin: Pill,
  exercise: Dumbbell,
  water: Droplet,
  stretch: Sparkles,
  backup: HardDrive,
  general: Bell,
};

const typeColors: Record<string, string> = {
  appointment: 'bg-blue-500',
  vitamin: 'bg-amber-500',
  exercise: 'bg-emerald-500',
  water: 'bg-sky-500',
  stretch: 'bg-violet-500',
  backup: 'bg-rose-500',
  general: 'bg-primary',
};

function NotificationItem({ notification, onRead, onClear }: { 
  notification: Notification; 
  onRead: () => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type] || 'bg-primary';
  
  const timeAgo = () => {
    const diff = Date.now() - new Date(notification.time).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return t('notificationCenter.hAgo', { h: hours });
    if (minutes > 0) return t('notificationCenter.mAgo', { m: minutes });
    return t('notificationCenter.justNow');
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
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.4}
      onDragEnd={handleDragEnd}
      className={`px-2.5 py-2 rounded-lg border transition-colors touch-pan-y ${
        notification.read 
          ? 'bg-muted/20 border-transparent' 
          : 'bg-card border-border/40'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-md ${colorClass} flex items-center justify-center text-white flex-shrink-0`}>
          <Icon className="w-3 h-3" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className={`text-[11px] font-semibold truncate ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
              {notification.title}
            </h4>
            <span className="text-[9px] text-muted-foreground shrink-0">{timeAgo()}</span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{notification.message}</p>
        </div>
        <button onClick={onClear} className="p-1 rounded-md hover:bg-muted/60 transition-colors shrink-0">
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
      {notification.actionUrl && !notification.read && (
        <Link 
          to={notification.actionUrl} 
          onClick={onRead}
          className="mt-1 ms-8 text-[10px] font-medium text-primary flex items-center gap-0.5"
        >
          {t('notificationCenter.open')} <ChevronRight className="w-2.5 h-2.5" />
        </Link>
      )}
    </motion.div>
  );
}

export function NotificationCenter() {
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
  
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-sm p-0">
        <SheetHeader className="px-3 py-2 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-sm">{t('notificationCenter.title')}</SheetTitle>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="p-3 max-h-[calc(100vh-80px)] overflow-y-auto">
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2"
              >
                <h4 className="font-semibold text-[11px]">{t('notificationCenter.reminderSettings')}</h4>
                {[
                  { key: 'appointmentReminders', icon: Calendar, label: t('notificationCenter.appointments'), color: 'text-blue-500' },
                  { key: 'vitaminReminders', icon: Pill, label: t('notificationCenter.vitamins'), color: 'text-amber-500' },
                  { key: 'waterReminders', icon: Droplet, label: t('notificationCenter.water'), color: 'text-sky-500' },
                ].map(({ key, icon: ItemIcon, label, color }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ItemIcon className={`w-3.5 h-3.5 ${color}`} />
                      <span className="text-[11px]">{label}</span>
                    </div>
                    <Switch 
                      checked={(settings as any)[key]} 
                      onCheckedChange={(v) => updateSettings({ [key]: v })} 
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {notifications.length === 0 ? (
            <div className="text-center py-10">
              <Bell className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-[11px] font-medium text-muted-foreground">{t('notificationCenter.noNotifications')}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{t('notificationCenter.remindYou')}</p>
            </div>
          ) : (
            <div className="space-y-1">
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
      </SheetContent>
    </Sheet>
  );
}
