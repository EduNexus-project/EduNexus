import { Router } from 'express';
import { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher, getTeacherClasses } from '../controllers/teacherController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.use(protect);
router.get('/', getTeachers);
router.get('/:id', getTeacherById);
router.get('/:id/classes', getTeacherClasses);
router.post('/', authorizeRoles('PRINCIPAL'), createTeacher);
router.put('/:id', authorizeRoles('PRINCIPAL', 'TEACHER'), updateTeacher);
router.delete('/:id', authorizeRoles('PRINCIPAL'), deleteTeacher);

export default router;
