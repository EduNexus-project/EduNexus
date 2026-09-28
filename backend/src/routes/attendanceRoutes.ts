import { Router } from 'express';
import {
  getAttendance,
  getStudentAttendance,
  getStudentStats,
  markAttendance,
  bulkMarkAttendance,
  detectSessionSkippers,
} from '../controllers/attendanceController';
import { optionalProtect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', optionalProtect, getAttendance);
router.get('/student/:studentId', optionalProtect, getStudentAttendance);
router.get('/stats/:studentId', optionalProtect, getStudentStats);
router.post('/mark', optionalProtect, markAttendance);
router.post('/bulk', optionalProtect, bulkMarkAttendance);
router.get('/skippers', optionalProtect, detectSessionSkippers);

export default router;
