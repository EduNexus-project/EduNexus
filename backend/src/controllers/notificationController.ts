import { Response } from 'express';
import { dbStore } from '../services/dbStore';
import { AuthRequest } from '../types';

const canReadNotification = (notification: any, user: NonNullable<AuthRequest['user']>) => {
  if (notification.targetUserId) return notification.targetUserId === user.id;
  return notification.targetRole === 'all' || notification.targetRole === user.role.toLowerCase();
};

// GET /api/notifications
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const items = dbStore.notifications.filter((notification) => canReadNotification(notification, req.user!));

    res.json({
      success: true,
      data: { notifications: items },
      notifications: items,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/notifications
export const dispatchNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { targetRole, targetUserId, title, message, type, linkAction } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const newItem = {
      id: req.body.id || `notif_${Date.now()}`,
      targetRole: targetRole || 'all',
      targetUserId,
      title,
      message,
      type: type || 'info',
      timestamp: 'Just now',
      read: false,
      linkAction,
    };

    dbStore.notifications.unshift(newItem);

    res.status(201).json({ success: true, data: newItem });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/notifications/:id/read
export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const item = dbStore.notifications.find((notification) => notification.id === id && canReadNotification(notification, req.user!));
    if (!item) return res.status(404).json({ success: false, message: 'Notification not found' });
    item.read = true;
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/notifications/read-all
export const markAllNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    dbStore.notifications.forEach(n => {
      if (canReadNotification(n, req.user!)) n.read = true;
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
