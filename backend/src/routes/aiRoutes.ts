import { Router } from 'express';
import {
  getStudentProgressSummary,
  generateParentDigest,
  assessRequestSafety,
} from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/progress-summary/:studentId', protect, getStudentProgressSummary);
router.post('/parent-digest', protect, generateParentDigest);
router.post('/assess-request', protect, authorizeRoles('PRINCIPAL', 'TEACHER'), assessRequestSafety);

export default router;
