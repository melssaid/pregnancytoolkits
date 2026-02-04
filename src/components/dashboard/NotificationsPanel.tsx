import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, CheckCheck, Settings, Pill, Droplet, Dumbbell, Calendar, 
  Sparkles, ChevronRight, HardDrive, BellRing, Volume2, VolumeX,
  Clock, Zap, Shield, Pin, AlertTriangle, Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
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
  backup: HardDrive,
  general: Bell,
  welcome: Zap,
  disclaimer: Shield,
};

const typeColors: Record<string, string> = {
  appointment: 'from-blue-500 to-indigo-500',
  vitamin: 'from-amber-500 to-orange-500',
  exercise: 'from-emerald-500 to-green-500',
  water: 'from-sky-500 to-cyan-500',
  stretch: 'from-violet-500 to-purple-500',
  backup: 'from-rose-500 to-pink-500',
  general: 'from-primary to-accent',
  welcome: 'from-pink-500 to-rose-400',
  disclaimer: 'from-amber-500 to-yellow-400',
};

const typeBgColors: Record<string, string> = {
  appointment: 'bg-blue-500/10 border-blue-500/20',
  vitamin: 'bg-amber-500/10 border-amber-500/20',
  exercise: 'bg-emerald-500/10 border-emerald-500/20',
  water: 'bg-sky-500/10 border-sky-500/20',
  stretch: 'bg-violet-500/10 border-violet-500/20',
  backup: 'bg-rose-500/10 border-rose-500/20',
  general: 'bg-primary/10 border-primary/20',
  welcome: 'bg-pink-500/10 border-pink-500/20',
  disclaimer: 'bg-amber-500/10 border-amber-500/20',
};

function NotificationItem({ notification, onRead, onClear, index, onDisclaimerClick }: { 
  notification: Notification; 
  onRead: () => void;
  onClear: () => void;
  index: number;
  onDisclaimerClick?: () => void;
}) {
  const Icon = typeIcons[notification.type] || Bell;
  const gradientClass = typeColors[notification.type] || 'from-primary to-accent';
  const bgClass = typeBgColors[notification.type] || 'bg-primary/10 border-primary/20';
  const isPinned = notification.isPinned;
  const isDisclaimer = notification.type === 'disclaimer';
  
  const timeAgo = () => {
    if (isPinned) return '';
    const diff = Date.now() - new Date(notification.time).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'Now';
  };

  const handleActionClick = (e: React.MouseEvent) => {
    if (isDisclaimer && onDisclaimerClick) {
      e.preventDefault();
      onDisclaimerClick();
    } else {
      onRead();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className={`group relative p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
        isPinned 
          ? `${bgClass} ring-1 ring-inset ring-primary/10` 
          : notification.read 
            ? 'bg-muted/20 border-border/30' 
            : `${bgClass} shadow-sm hover:shadow-md`
      }`}
    >
      {/* Pinned indicator */}
      {isPinned && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
          <Pin className="w-2 h-2 text-primary" />
        </div>
      )}
      
      {/* Unread indicator */}
      {!notification.read && !isPinned && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}
      
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-semibold line-clamp-1 ${notification.read && !isPinned ? 'text-muted-foreground' : 'text-foreground'}`}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!isPinned && (
                <>
                  <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
                    {timeAgo()}
                  </span>
                  <button 
                    onClick={onClear} 
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-muted/50 transition-all"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
          
          {isDisclaimer ? (
            <button 
              onClick={handleActionClick}
              className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:underline"
            >
              View Details <ChevronRight className="w-3 h-3" />
            </button>
          ) : notification.actionUrl && (
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
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
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
  const [showDisclaimerDialog, setShowDisclaimerDialog] = useState(false);

  // Check if pinned notifications should be hidden (after 3 hours from first visit)
  const shouldShowPinnedNotifications = useMemo(() => {
    const HIDE_AFTER_HOURS = 3;
    const FIRST_VISIT_KEY = 'app_first_visit_time';
    const PINNED_HIDDEN_KEY = 'pinned_notifications_hidden';
    
    // Check if already marked as hidden permanently
    if (localStorage.getItem(PINNED_HIDDEN_KEY) === 'true') {
      return false;
    }
    
    // Get or set first visit time
    let firstVisitTime = localStorage.getItem(FIRST_VISIT_KEY);
    if (!firstVisitTime) {
      firstVisitTime = new Date().toISOString();
      localStorage.setItem(FIRST_VISIT_KEY, firstVisitTime);
    }
    
    // Check if 3 hours have passed
    const hoursSinceFirstVisit = (Date.now() - new Date(firstVisitTime).getTime()) / (1000 * 60 * 60);
    if (hoursSinceFirstVisit >= HIDE_AFTER_HOURS) {
      localStorage.setItem(PINNED_HIDDEN_KEY, 'true');
      return false;
    }
    
    return true;
  }, []);

  // Pinned default notifications (shown only for first 3 hours)
  const pinnedNotifications: Notification[] = useMemo(() => {
    if (!shouldShowPinnedNotifications) return [];
    
    return [
      {
        id: 'pinned-welcome',
        type: 'welcome',
        title: isArabic ? '👋 مرحباً بك!' : '👋 Welcome!',
        message: isArabic 
          ? 'استمتعي بأكثر من 40 أداة ذكية لمتابعة حملك بطريقة سهلة وآمنة.'
          : 'Enjoy 40+ smart tools to track your pregnancy easily and safely.',
        time: new Date().toISOString(),
        read: true,
        isPinned: true,
        actionUrl: '/',
      },
      {
        id: 'pinned-disclaimer',
        type: 'disclaimer',
        title: isArabic ? '⚕️ إخلاء مسؤولية طبية' : '⚕️ Medical Disclaimer',
        message: isArabic 
          ? 'هذا التطبيق للمعلومات فقط ولا يُغني عن استشارة الطبيب المختص.'
          : 'This app is for informational purposes only and does not replace professional medical advice.',
        time: new Date().toISOString(),
        read: true,
        isPinned: true,
        actionUrl: '/privacy-policy',
      },
    ];
  }, [isArabic, shouldShowPinnedNotifications]);

  // Combine pinned + regular notifications
  const allNotifications = useMemo(() => {
    const regularNotifications = notifications.filter(n => !n.isPinned);
    return [...pinnedNotifications, ...regularNotifications];
  }, [notifications, pinnedNotifications]);

  const recentNotifications = allNotifications.slice(0, 7);

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
        {allNotifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-3">
              <Bell className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-foreground">
              {isArabic ? 'لا توجد إشعارات!' : 'All Caught Up!'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
              {isArabic 
                ? 'سنذكرك بالفيتامينات والتمارين والمواعيد'
                : "We'll remind you about vitamins, exercises & appointments"}
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
                  onDisclaimerClick={() => setShowDisclaimerDialog(true)}
                />
              ))}
            </AnimatePresence>
            
            {allNotifications.length > 7 && (
              <div className="text-center pt-2">
                <span className="text-xs text-muted-foreground">
                  +{allNotifications.length - 7} {isArabic ? 'إشعارات أخرى' : 'more notifications'}
                </span>
              </div>
            )}
            
            {notifications.filter(n => !n.isPinned).length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll}
                className="w-full text-xs text-muted-foreground hover:text-destructive mt-2"
              >
                <X className="w-3 h-3 mr-1" />
                {isArabic ? 'مسح الكل' : 'Clear All'}
              </Button>
            )}
          </div>
        )}
      </CardContent>

      {/* Medical Disclaimer Dialog */}
      <Dialog open={showDisclaimerDialog} onOpenChange={setShowDisclaimerDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Stethoscope className="w-5 h-5" />
              {isArabic ? 'إخلاء المسؤولية الطبية' : 'Medical Disclaimer'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  {isArabic 
                    ? 'هذا التطبيق مخصص للأغراض التعليمية والمعلوماتية فقط ولا يُقدم نصائح طبية أو تشخيصية أو علاجية.'
                    : 'This app is for educational and informational purposes only and does not provide medical advice, diagnosis, or treatment.'}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">
                {isArabic ? 'يرجى الانتباه:' : 'Please note:'}
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {isArabic 
                    ? 'استشيري طبيبتك دائماً قبل اتخاذ أي قرار صحي.'
                    : 'Always consult your healthcare provider before making any health decisions.'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {isArabic 
                    ? 'نتائج الأدوات الذكية للمعلومات العامة فقط.'
                    : 'AI tool results are for general information only.'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {isArabic 
                    ? 'في حالات الطوارئ، اتصلي بالإسعاف أو اذهبي لأقرب مستشفى.'
                    : 'In emergencies, call emergency services or go to the nearest hospital.'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {isArabic 
                    ? 'بياناتك محفوظة محلياً على جهازك فقط.'
                    : 'Your data is stored locally on your device only.'}
                </li>
              </ul>
            </div>
            
            <Button 
              onClick={() => setShowDisclaimerDialog(false)} 
              className="w-full"
            >
              {isArabic ? 'فهمت' : 'I Understand'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
