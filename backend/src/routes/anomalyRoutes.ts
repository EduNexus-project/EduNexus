import { Router } from 'express';
import {
  getAnomalies,
  getStudentAnomalies,
  updateAnomalyStatus,
  runAnomalyScan,
} from '../controllers/anomalyController';
import { optionalProtect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', optionalProtect, getAnomalies);
router.get('/student/:studentId', optionalProtect, getStudentAnomalies);
router.patch('/:id', optionalProtect, updateAnomalyStatus);
router.post('/scan', optionalProtect, runAnomalyScan);

export default router;
