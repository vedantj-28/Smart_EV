import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, X, CheckCircle, AlertTriangle, Info, Battery } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const NotificationCenter: React.FC = () => {
  const { currentUser, isCharging, currentSession } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Add notifications based on app state
  useEffect(() => {
    if (!currentUser) return;

    // Low balance warning
    if (currentUser.walletBalance <= 50) {
      const lowBalanceNotification: Notification = {
        id: 'low-balance',
        type: 'warning',
        title: 'Low Wallet Balance',
        message: `Your balance is ${currentUser.walletBalance.toFixed(2)}. Please top up to continue charging.`,
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => {
        const exists = prev.some(n => n.id === 'low-balance');
        if (!exists) {
          return [lowBalanceNotification, ...prev];
        }
        return prev;
      });
    }

    // Charging completion notification
    if (!isCharging && currentSession?.status === 'completed') {
      const chargingCompleteNotification: Notification = {
        id: `charging-complete-${currentSession.id}`,
        type: 'success',
        title: 'Charging Completed',
        message: `Your vehicle is fully charged. Total cost: ₹${currentSession.totalCost.toFixed(2)}`,
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => {
        const exists = prev.some(n => n.id === `charging-complete-${currentSession.id}`);
        if (!exists) {
          return [chargingCompleteNotification, ...prev];
        }
        return prev;
      });
    }
  }, [currentUser, isCharging, currentSession]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-warning-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-error-600" />;
      default: return <Info className="w-5 h-5 text-primary-600" />;
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-primary-50/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notification.id);
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;