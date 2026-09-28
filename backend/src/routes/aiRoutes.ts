import { Router } from 'express';
import {
  getStudentProgressSummary,
  generateParentDigest,
  assessRequestSafety,
} from '../controllers/aiController';
import { optionalProtect } from '../middleware/authMiddleware';

const router = Router();

router.get('/progress-summary/:studentId', optionalProtect, getStudentProgressSummary);
router.post('/parent-digest', optionalProtect, generateParentDigest);
router.post('/assess-request', optionalProtect, assessRequestSafety);

export default router;
