import { Router } from 'express';
import {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
} from '../controllers/studentController';
// In a real app, you would also import and use auth/role middlewares here
// import { protect } from '../middleware/authMiddleware';
// import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

// Apply protect middleware to all routes if auth is fully implemented
// router.use(protect);

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', createStudent); // e.g. router.post('/', authorizeRoles('PRINCIPAL'), createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;
