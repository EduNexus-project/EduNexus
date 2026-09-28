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
router.get('/students', optionalProtect, getStudents);
router.get('/students/:id', optionalProtect, getStudentById);
router.post('/students', optionalProtect, createStudent);
router.put('/students/:id', optionalProtect, updateStudent);
router.delete('/students/:id', optionalProtect, deleteStudent);

// Teachers
router.get('/teachers', optionalProtect, getTeachers);
router.get('/teachers/:id', optionalProtect, getTeacherById);
router.get('/teachers/:id/classes', optionalProtect, getTeacherClasses);

// Parents
router.get('/parents', optionalProtect, getParents);

// Marks
router.get('/marks/:studentId', optionalProtect, getMarksByStudent);
router.put('/marks/:studentId', optionalProtect, updateSubjectMark);

export default router;
