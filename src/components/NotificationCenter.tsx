import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck, Settings, Pill, Droplet, Dumbbell, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const typeIcons: Record<string, any> = {
  appointment: Calendar,
  vitamin: Pill,
  exercise: Dumbbell,
  water: Droplet,
  stretch: Sparkles,
  general: Bell,
};

const typeColors: Record<string, string> = {
  appointment: 'bg-blue-500',
  vitamin: 'bg-amber-500',
  exercise: 'bg-emerald-500',
  water: 'bg-sky-500',
  stretch: 'bg-violet-500',
  general: 'bg-primary',
};

function NotificationItem({ notification, onRead, onClear }: { 
  notification: Notification; 
  onRead: () => void;
  onClear: () => void;
}) {
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type] || 'bg-primary';
  
  const timeAgo = () => {
    const diff = Date.now() - new Date(notification.time).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-3 rounded-xl border transition-colors ${
        notification.read 
          ? 'bg-muted/30 border-border/50' 
          : 'bg-card border-primary/20 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center text-white flex-shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
              {notification.title}
            </h4>
            <button onClick={onClear} className="text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">{timeAgo()}</span>
            {notification.actionUrl && (
              <Link 
                to={notification.actionUrl} 
                onClick={onRead}
                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
              >
                Open <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function NotificationCenter() {
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
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">Notifications</SheetTitle>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
              </button>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-semibold text-sm">Reminder Settings</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Appointments</span>
                      </div>
                      <Switch 
                        checked={settings.appointmentReminders}
                        onCheckedChange={(v) => updateSettings({ appointmentReminders: v })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-amber-500" />
                        <span className="text-sm">Vitamins</span>
                      </div>
                      <Switch 
                        checked={settings.vitaminReminders}
                        onCheckedChange={(v) => updateSettings({ vitaminReminders: v })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm">Exercise</span>
                      </div>
                      <Switch 
                        checked={settings.exerciseReminders}
                        onCheckedChange={(v) => updateSettings({ exerciseReminders: v })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-sky-500" />
                        <span className="text-sm">Water</span>
                      </div>
                      <Switch 
                        checked={settings.waterReminders}
                        onCheckedChange={(v) => updateSettings({ waterReminders: v })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-500" />
                        <span className="text-sm">Stretching</span>
                      </div>
                      <Switch 
                        checked={settings.stretchReminders}
                        onCheckedChange={(v) => updateSettings({ stretchReminders: v })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-medium text-muted-foreground">No notifications yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                We'll remind you about vitamins, exercises & more
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={() => markAsRead(notification.id)}
                    onClear={() => clearNotification(notification.id)}
                  />
                ))}
              </AnimatePresence>
              
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAll}
                  className="w-full text-xs text-muted-foreground mt-4"
                >
                  Clear All Notifications
                </Button>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
