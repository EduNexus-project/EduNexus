import { Router } from 'express';
import {
  getClasses,
  getClassById,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getTeachers,
  getTeacherById,
  getTeacherClasses,
  getParents,
  getMarksByStudent,
  updateSubjectMark,
} from '../controllers/academicController';
import { optionalProtect, protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

// Classes
router.get('/classes', optionalProtect, getClasses);
router.get('/classes/:id', optionalProtect, getClassById);

// Students
router.get('/students', protect, getStudents);
router.get('/students/:id', protect, getStudentById);
router.post('/students', protect, authorizeRoles('PRINCIPAL'), createStudent);
router.put('/students/:id', protect, authorizeRoles('PRINCIPAL'), updateStudent);
router.delete('/students/:id', protect, authorizeRoles('PRINCIPAL'), deleteStudent);

// Teachers
router.get('/teachers', optionalProtect, getTeachers);
router.get('/teachers/:id', optionalProtect, getTeacherById);
router.get('/teachers/:id/classes', optionalProtect, getTeacherClasses);

// Parents
router.get('/parents', protect, authorizeRoles('PRINCIPAL'), getParents);

// Marks
router.get('/marks/:studentId', protect, getMarksByStudent);
router.put('/marks/:studentId', protect, authorizeRoles('PRINCIPAL', 'TEACHER'), updateSubjectMark);

export default router;
