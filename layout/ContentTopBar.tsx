import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { NotificationPanel } from '../sales/components/NotificationPanel';
import { IndoorHeaderLabSelector } from '../indoor/components/IndoorHeaderLabSelector';
import apiClient from '../shared/api/apiClient';

interface ContentTopBarProps {
  showIndoorLab?: boolean;
}

export function ContentTopBar({ showIndoorLab = false }: ContentTopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchNotificationCount();
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const data = await apiClient.get<unknown[]>('/sales/notifications/upcoming-deliveries');
      setNotificationCount(data.length);
    } catch {
      // non-critical
    }
  };

  return (
    <div className="flex w-full items-center justify-end gap-4 px-3 pb-3 shrink-0">
      {showIndoorLab && <IndoorHeaderLabSelector />}

      <div className="relative shrink-0">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 hover:bg-white/60 rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
        {showNotifications && (
          <NotificationPanel onClose={() => { setShowNotifications(false); fetchNotificationCount(); }} />
        )}
      </div>
    </div>
  );
}
