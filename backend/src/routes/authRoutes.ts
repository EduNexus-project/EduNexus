import { Router } from 'express';
import { login, register, getMe, logout } from '../controllers/authController';
import { optionalProtect, protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', optionalProtect, getMe);
router.post('/register', protect, authorizeRoles('PRINCIPAL'), register);

export default router;
