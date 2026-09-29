import { Router } from 'express';
import {
  getNotifications,
  dispatchNotification,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/', protect, getNotifications);
router.post('/', protect, authorizeRoles('PRINCIPAL', 'TEACHER'), dispatchNotification);
router.patch('/read-all', protect, markAllNotificationsRead);
router.patch('/:id/read', protect, markNotificationRead);

export default router;
