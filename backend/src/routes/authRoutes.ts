import { Router } from 'express';
import { login, register, getMe, logout } from '../controllers/authController';
import { optionalProtect } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', optionalProtect, getMe);
router.post('/register', register);

export default router;
