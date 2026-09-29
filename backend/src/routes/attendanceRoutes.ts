import { Router } from 'express';
import {
  getAttendance,
  getStudentAttendance,
  getStudentStats,
  markAttendance,
  bulkMarkAttendance,
  detectSessionSkippers,
} from '../controllers/attendanceController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/', protect, getAttendance);
router.get('/student/:studentId', protect, getStudentAttendance);
router.get('/stats/:studentId', protect, getStudentStats);
router.post('/mark', protect, authorizeRoles('PRINCIPAL', 'TEACHER'), markAttendance);
router.post('/bulk', protect, authorizeRoles('PRINCIPAL', 'TEACHER'), bulkMarkAttendance);
router.get('/skippers', protect, authorizeRoles('PRINCIPAL', 'TEACHER'), detectSessionSkippers);

export default router;
