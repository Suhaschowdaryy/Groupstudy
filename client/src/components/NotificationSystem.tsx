import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Check, X, MessageSquare, Users, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  type: 'message' | 'invite' | 'file' | 'reminder' | 'achievement';
  title: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

export function NotificationSystem() {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications from server
  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: () => fetch('/api/notifications').then(res => res.json()),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Count unread notifications
  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
      refetch();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      refetch();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return MessageSquare;
      case 'invite':
        return Users;
      case 'file':
        return FileText;
      case 'reminder':
        return Calendar;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'text-blue-500';
      case 'invite':
        return 'text-green-500';
      case 'file':
        return 'text-purple-500';
      case 'reminder':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          data-testid="notifications-button"
          className="relative"
        >
          <Bell className="text-muted-foreground" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge 
                  variant="destructive" 
                  className="w-5 h-5 p-0 flex items-center justify-center text-xs animate-pulse"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0 mr-4" 
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {notifications.map((notification: Notification, index: number) => {
                    const Icon = getNotificationIcon(notification.type);
                    const iconColor = getNotificationColor(notification.type);
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div
                          className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                            !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full bg-background border flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 ${iconColor}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className={`text-sm font-medium truncate ${
                                  !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                                )}
                              </div>
                              
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {notification.content}
                              </p>
                              
                              <p className="text-xs text-muted-foreground">
                                {formatTimeAgo(notification.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {index < notifications.length - 1 && <Separator />}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}