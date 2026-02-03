import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, CheckCheck, Settings, Pill, Droplet, Dumbbell, Calendar, 
  Sparkles, ChevronRight, HardDrive, BellRing, Volume2, VolumeX,
  Clock, Zap, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

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
  appointment: 'from-blue-500 to-indigo-500',
  vitamin: 'from-amber-500 to-orange-500',
  exercise: 'from-emerald-500 to-green-500',
  water: 'from-sky-500 to-cyan-500',
  stretch: 'from-violet-500 to-purple-500',
  backup: 'from-rose-500 to-pink-500',
  general: 'from-primary to-accent',
};

const typeBgColors: Record<string, string> = {
  appointment: 'bg-blue-500/10 border-blue-500/20',
  vitamin: 'bg-amber-500/10 border-amber-500/20',
  exercise: 'bg-emerald-500/10 border-emerald-500/20',
  water: 'bg-sky-500/10 border-sky-500/20',
  stretch: 'bg-violet-500/10 border-violet-500/20',
  backup: 'bg-rose-500/10 border-rose-500/20',
  general: 'bg-primary/10 border-primary/20',
};

function NotificationItem({ notification, onRead, onClear, index }: { 
  notification: Notification; 
  onRead: () => void;
  onClear: () => void;
  index: number;
}) {
  const Icon = typeIcons[notification.type] || Bell;
  const gradientClass = typeColors[notification.type] || 'from-primary to-accent';
  const bgClass = typeBgColors[notification.type] || 'bg-primary/10 border-primary/20';
  
  const timeAgo = () => {
    const diff = Date.now() - new Date(notification.time).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'Now';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className={`group relative p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
        notification.read 
          ? 'bg-muted/20 border-border/30' 
          : `${bgClass} shadow-sm hover:shadow-md`
      }`}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}
      
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-semibold line-clamp-1 ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
                {timeAgo()}
              </span>
              <button 
                onClick={onClear} 
                className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-muted/50 transition-all"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
          
          {notification.actionUrl && (
            <Link 
              to={notification.actionUrl} 
              onClick={onRead}
              className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:underline"
            >
              View Details <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
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
    <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-1.5">
        <div className={`w-5 h-5 rounded ${color} flex items-center justify-center`}>
          <Icon className="w-2.5 h-2.5 text-white" />
        </div>
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="scale-75" />
    </div>
  );
}

export function NotificationsPanel() {
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
  const [isExpanded, setIsExpanded] = useState(true);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-muted/20">
      {/* Compact Header */}
      <div className="px-3 py-2.5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow">
                <BellRing className="w-4 h-4 text-primary-foreground" />
              </div>
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </div>
            <div>
              <h3 className="text-xs font-bold">Notifications</h3>
              <p className="text-[9px] text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-0.5">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button 
              variant={showSettings ? "secondary" : "ghost"}
              size="icon" 
              className="h-7 w-7"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className={`w-3.5 h-3.5 transition-transform ${showSettings ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Panel - More Compact */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border/50"
          >
            <div className="p-3 bg-muted/20">
              <div className="flex items-center gap-1.5 mb-2">
                <Shield className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Reminders</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <SettingsItem 
                  icon={Calendar} 
                  label="Appointments" 
                  color="bg-blue-500"
                  checked={settings.appointmentReminders}
                  onChange={(v) => updateSettings({ appointmentReminders: v })}
                />
                <SettingsItem 
                  icon={Pill} 
                  label="Vitamins" 
                  color="bg-amber-500"
                  checked={settings.vitaminReminders}
                  onChange={(v) => updateSettings({ vitaminReminders: v })}
                />
                <SettingsItem 
                  icon={Dumbbell} 
                  label="Exercise" 
                  color="bg-emerald-500"
                  checked={settings.exerciseReminders}
                  onChange={(v) => updateSettings({ exerciseReminders: v })}
                />
                <SettingsItem 
                  icon={Droplet} 
                  label="Water" 
                  color="bg-sky-500"
                  checked={settings.waterReminders}
                  onChange={(v) => updateSettings({ waterReminders: v })}
                />
                <SettingsItem 
                  icon={Sparkles} 
                  label="Stretching" 
                  color="bg-violet-500"
                  checked={settings.stretchReminders}
                  onChange={(v) => updateSettings({ stretchReminders: v })}
                />
                <SettingsItem 
                  icon={HardDrive} 
                  label="Backup" 
                  color="bg-rose-500"
                  checked={settings.backupReminders ?? true}
                  onChange={(v) => {
                    updateSettings({ backupReminders: v });
                    if (v && !localStorage.getItem('backup_reminder_first_enabled')) {
                      localStorage.setItem('backup_reminder_first_enabled', 'true');
                      addNotification({
                        type: 'backup',
                        title: 'Backup Reminders Enabled',
                        message: 'You will be reminded weekly to backup your pregnancy data.',
                        actionUrl: '/settings',
                      });
                    }
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      <CardContent className="p-3">
        {notifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-3">
              <Bell className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-foreground">All Caught Up!</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
              We'll remind you about vitamins, exercises & appointments
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {recentNotifications.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  onClear={() => clearNotification(notification.id)}
                  index={index}
                />
              ))}
            </AnimatePresence>
            
            {notifications.length > 5 && (
              <div className="text-center pt-2">
                <span className="text-xs text-muted-foreground">
                  +{notifications.length - 5} more notifications
                </span>
              </div>
            )}
            
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll}
                className="w-full text-xs text-muted-foreground hover:text-destructive mt-2"
              >
                <X className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
