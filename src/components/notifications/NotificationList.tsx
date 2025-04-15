import React from 'react';
import { Notification } from '@/lib/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationListProps {
  notifications: Notification[];
  emptyMessage?: string;
  maxHeight?: string;
}

export function NotificationList({ 
  notifications, 
  emptyMessage = "No notifications", 
  maxHeight = "400px" 
}: NotificationListProps) {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();
  
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.link) {
      navigate(notification.link);
    }
  };
  
  if (notifications.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <ScrollArea className={`max-h-[${maxHeight}]`}>
      <div className="px-1 py-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              mb-2 flex cursor-pointer items-start rounded-md p-2 last:mb-0 hover:bg-slate-100
              ${notification.read ? 'opacity-70' : 'font-medium'}
            `}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="mr-2 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{notification.title}</p>
                {!notification.read && (
                  <Badge variant="outline" className="ml-2 h-5 bg-blue-50 px-1.5 text-[10px]">
                    New
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 line-clamp-2">{notification.message}</p>
              <p className="mt-1 text-[10px] text-gray-400">
                {format(new Date(notification.timestamp), 'MMM d, yyyy • h:mm a')}
              </p>
            </div>
            {notification.link && (
              <ArrowRight className="ml-2 h-3 w-3 shrink-0 text-gray-400" />
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 