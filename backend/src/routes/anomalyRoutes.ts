import { Router } from 'express';
import {
  getAnomalies,
  getStudentAnomalies,
  updateAnomalyStatus,
  runAnomalyScan,
} from '../controllers/anomalyController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/', protect, getAnomalies);
router.get('/student/:studentId', protect, getStudentAnomalies);
router.patch('/:id', protect, authorizeRoles('PRINCIPAL'), updateAnomalyStatus);
router.post('/scan', protect, authorizeRoles('PRINCIPAL', 'TEACHER'), runAnomalyScan);

export default router;
