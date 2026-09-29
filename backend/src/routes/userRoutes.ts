import express, { Router } from 'express';
import { getUsers, getUserById, updateUser, updateProfilePhoto, deleteUser } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.use(protect);
router.put(
	'/me/profile-photo',
	express.raw({ type: ['image/jpeg', 'image/png'], limit: '2mb' }),
	updateProfilePhoto
);
router.get('/', authorizeRoles('PRINCIPAL'), getUsers);
router.get('/:id', getUserById);
router.put('/:id', authorizeRoles('PRINCIPAL'), updateUser);
router.delete('/:id', authorizeRoles('PRINCIPAL'), deleteUser);

export default router;
