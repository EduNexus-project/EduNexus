import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';

// GET /api/notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { role, userId } = req.query;
    let items = dbStore.notifications;

    if (role || userId) {
      items = items.filter(
        n =>
          n.targetRole === 'all' ||
          (role && n.targetRole === role) ||
          (userId && n.targetUserId === userId)
      );
    }

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
export const dispatchNotification = async (req: Request, res: Response) => {
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
export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = dbStore.notifications.find(n => n.id === id);
    if (item) {
      item.read = true;
    }
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/notifications/read-all
export const markAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    const { role, userId } = req.body;
    dbStore.notifications.forEach(n => {
      if (
        !role ||
        n.targetRole === 'all' ||
        n.targetRole === role ||
        (userId && n.targetUserId === userId)
      ) {
        n.read = true;
      }
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
