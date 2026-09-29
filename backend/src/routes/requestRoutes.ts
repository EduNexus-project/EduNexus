import { Router } from 'express';
import { getRequests, createRequest, reviewRequest } from '../controllers/requestController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/', protect, getRequests);
router.post('/', protect, authorizeRoles('TEACHER'), createRequest);
router.patch('/:id/review', protect, authorizeRoles('PRINCIPAL'), reviewRequest);
router.put('/:id/approve', protect, authorizeRoles('PRINCIPAL'), (req, res) => {
  req.body.status = 'approved';
  reviewRequest(req, res);
});
router.put('/:id/reject', protect, authorizeRoles('PRINCIPAL'), (req, res) => {
  req.body.status = 'rejected';
  reviewRequest(req, res);
});

export default router;
