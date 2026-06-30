'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import { useURYStore } from '@/lib/ury-store';

// Notification stored separately from toasts — these persist
export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'kot' | 'table' | 'invoice';
  title: string;
  description?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string; // e.g. navigate to kitchen tab
}

const notificationIcons: Record<Notification['type'], React.ElementType> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  kot: Bell,
  table: Info,
  invoice: Info,
};

const notificationColors: Record<Notification['type'], string> = {
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  kot: 'text-red-600 dark:text-red-400',
  table: 'text-amber-600 dark:text-amber-400',
  invoice: 'text-violet-600 dark:text-violet-400',
};

const NOTIFICATION_KEY = 'ury_notifications';

function loadNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFICATION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((n: Notification) => ({
      ...n,
      timestamp: new Date(n.timestamp),
    }));
  } catch {
    return [];
  }
}

function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return;
  const toSave = notifications.slice(0, 50);
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(toSave));
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const { kotCards, shiftInfo, setActiveTab } = useURYStore();
  const prevKotCountRef = useRef(kotCards.length);
  const prevShiftStatusRef = useRef(shiftInfo.status);

  // Load notifications on mount
  useEffect(() => {
    setNotifications(loadNotifications());
  }, []);

  // Watch for KOT changes — new orders trigger notification
  useEffect(() => {
    const prevCount = prevKotCountRef.current;
    const currentCount = kotCards.length;
    if (currentCount > prevCount && prevCount > 0) {
      const newKot = kotCards[0];
      addNotification({
        type: 'kot',
        title: `Novo naročilo ${newKot?.orderNo || `#${currentCount - prevCount}`}`,
        description: newKot
          ? `Miza ${newKot.table} — ${newKot.items.length} artiklov`
          : `${currentCount - prevCount} nova naročila`,
        actionUrl: 'kitchen',
      });
    }
    prevKotCountRef.current = currentCount;
  }, [kotCards.length]);

  // Watch for shift status changes
  useEffect(() => {
    if (prevShiftStatusRef.current !== shiftInfo.status && prevShiftStatusRef.current) {
      addNotification({
        type: shiftInfo.status === 'open' ? 'success' : 'info',
        title: shiftInfo.status === 'open' ? 'Smena odprta' : 'Smena zaprta',
        description: shiftInfo.status === 'open'
          ? `Odprl: ${shiftInfo.openedBy} — Saldo: ₹${shiftInfo.openingBalance.toLocaleString('en-IN')}`
          : 'Smena je bila uspešno zaprta',
        actionUrl: 'shift',
      });
    }
    prevShiftStatusRef.current = shiftInfo.status;
  }, [shiftInfo.status]);

  function addNotification(partial: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const notification: Notification = {
      ...partial,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => {
      const updated = [notification, ...prev].slice(0, 50);
      saveNotifications(updated);
      return updated;
    });
  }

  function markAsRead(id: string) {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(updated);
      return updated;
    });
  }

  function markAllAsRead() {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }

  function clearAll() {
    setNotifications([]);
    saveNotifications([]);
  }

  function handleNotificationClick(notification: Notification) {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      setActiveTab(notification.actionUrl);
      setIsOpen(false);
    }
  }

  function formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Zdaj';
    if (minutes < 60) return `Pred ${minutes}min`;
    if (hours < 24) return `Pred ${hours}h`;
    return date.toLocaleDateString('sl-SI', { day: 'numeric', month: 'short' });
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1 animate-in zoom-in duration-200">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Obvestila</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5">
                {unreadCount} novih
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={markAllAsRead}
                title="Označi vse kot prebrano"
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={clearAll}
                title="Počisti vse"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <ScrollArea className="h-[320px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">Ni obvestil</p>
              <p className="text-xs opacity-60">Nova obvestila bodo prikazana tukaj</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                      !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${notificationColors[notification.type]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                        )}
                      </div>
                      {notification.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.description}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
