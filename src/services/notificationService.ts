import { NotificationItem, UserRole } from '../types';
import { INITIAL_NOTIFICATIONS } from '../data/mockData';
import { authService } from './authService';

const NOTIFICATIONS_KEY = 'edunexus_notifications';

class NotificationService {
  private notifications: NotificationItem[] = [];
  private listeners: ((notifications: NotificationItem[]) => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      this.notifications = stored ? JSON.parse(stored) : [...INITIAL_NOTIFICATIONS];
    } catch {
      this.notifications = [...INITIAL_NOTIFICATIONS];
    }
  }

  async syncFromBackend() {
    try {
      const res = await fetch('/api/notifications', { headers: authService.getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.notifications)) {
        this.notifications = data.data.notifications;
        this.save();
      }
    } catch (err) {
      // background sync
    }
  }

  private save() {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(this.notifications));
    } catch (e) {
      console.warn('Notification save error', e);
    }
    this.listeners.forEach((fn) => fn([...this.notifications]));
  }

  subscribe(listener: (notifications: NotificationItem[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.notifications]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getNotificationsForRole(role: UserRole, userId?: string): NotificationItem[] {
    return this.notifications.filter((notification) => {
      if (notification.targetUserId) return notification.targetUserId === userId;
      return notification.targetRole === 'all' || notification.targetRole === role;
    });
  }

  getUnreadCount(role: UserRole, userId?: string): number {
    return this.getNotificationsForRole(role, userId).filter((n) => !n.read).length;
  }

  markAsRead(notificationId: string): void {
    const item = this.notifications.find((n) => n.id === notificationId);
    if (item) {
      item.read = true;
      this.save();
    }
    fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders()
    }).catch(() => {});
  }

  markAllAsRead(role: UserRole, userId?: string): void {
    this.notifications.forEach((n) => {
      if (n.targetUserId ? n.targetUserId === userId : n.targetRole === 'all' || n.targetRole === role) {
        n.read = true;
        fetch(`/api/notifications/${n.id}/read`, {
          method: 'PATCH',
          headers: authService.getAuthHeaders()
        }).catch(() => {});
      }
    });
    this.save();
  }

  dispatch(notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): NotificationItem {
    const newItem: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: 'Just now',
      read: false,
      ...notification
    };
    this.notifications.unshift(newItem);
    this.save();

    fetch('/api/notifications', {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(newItem)
    }).catch(() => {});

    return newItem;
  }
}

export const notificationService = new NotificationService();
