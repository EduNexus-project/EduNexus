import { Router } from 'express';
import {
  getNotifications,
  dispatchNotification,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController';
import { optionalProtect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', optionalProtect, getNotifications);
router.post('/', optionalProtect, dispatchNotification);
router.patch('/read-all', optionalProtect, markAllNotificationsRead);
router.patch('/:id/read', optionalProtect, markNotificationRead);

export default router;
