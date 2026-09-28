import { Router } from 'express';
import { getRequests, createRequest, reviewRequest } from '../controllers/requestController';
import { optionalProtect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', optionalProtect, getRequests);
router.post('/', optionalProtect, createRequest);
router.patch('/:id/review', optionalProtect, reviewRequest);
router.put('/:id/approve', optionalProtect, (req, res) => {
  req.body.status = 'approved';
  reviewRequest(req, res);
});
router.put('/:id/reject', optionalProtect, (req, res) => {
  req.body.status = 'rejected';
  reviewRequest(req, res);
});

export default router;
