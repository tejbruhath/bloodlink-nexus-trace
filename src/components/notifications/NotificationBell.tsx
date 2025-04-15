import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { NotificationList } from './NotificationList';

export function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    // Mark all as read when opening the dropdown
    if (open && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleToggle}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-bloodlink-red"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => navigate('/notifications')}
            >
              View All
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <NotificationList 
          notifications={notifications.slice(0, 5)} 
          emptyMessage="No notifications" 
          maxHeight="300px" 
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 