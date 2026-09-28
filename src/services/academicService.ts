import { Student, Teacher, AcademicClass, StudentMarkReport, SubjectMarks } from '../types';
import { INITIAL_STUDENTS, INITIAL_TEACHERS, INITIAL_CLASSES, INITIAL_STUDENT_MARKS } from '../data/mockData';
import { authService } from './authService';

const STUDENTS_KEY = 'edunexus_students';
const CLASSES_KEY = 'edunexus_classes';
const MARKS_KEY = 'edunexus_marks';

class AcademicService {
  private students: Student[] = [];
  private classes: AcademicClass[] = [];
  private teachers: Teacher[] = [];
  private marks: Record<string, StudentMarkReport> = {};

  constructor() {
    this.init();
    this.syncFromBackend();
  }

  private init() {
    try {
      const storedStudents = localStorage.getItem(STUDENTS_KEY);
      this.students = storedStudents ? JSON.parse(storedStudents) : [...INITIAL_STUDENTS];
    } catch {
      this.students = [...INITIAL_STUDENTS];
    }

    try {
      const storedClasses = localStorage.getItem(CLASSES_KEY);
      this.classes = storedClasses ? JSON.parse(storedClasses) : [...INITIAL_CLASSES];
    } catch {
      this.classes = [...INITIAL_CLASSES];
    }

    this.teachers = [...INITIAL_TEACHERS];

    try {
      const storedMarks = localStorage.getItem(MARKS_KEY);
      this.marks = storedMarks ? JSON.parse(storedMarks) : { ...INITIAL_STUDENT_MARKS };
    } catch {
      this.marks = { ...INITIAL_STUDENT_MARKS };
    }
  }

  private async syncFromBackend() {
    try {
      // Sync classes
      const classRes = await fetch('/api/academic/classes');
      const classData = await classRes.json();
      if (classData.success && Array.isArray(classData.data?.classes) && classData.data.classes.length > 0) {
        this.classes = classData.data.classes;
      }

      // Sync students
      const stdRes = await fetch('/api/academic/students');
      const stdData = await stdRes.json();
      if (stdData.success && Array.isArray(stdData.data?.students) && stdData.data.students.length > 0) {
        this.students = stdData.data.students;
      }

      // Sync teachers
      const tchRes = await fetch('/api/academic/teachers');
      const tchData = await tchRes.json();
      if (tchData.success && Array.isArray(tchData.data?.teachers) && tchData.data.teachers.length > 0) {
        this.teachers = tchData.data.teachers;
      }

      this.save();
    } catch (err) {
      // Background sync, fallback smoothly
    }
  }

  private save() {
    try {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(this.students));
      localStorage.setItem(CLASSES_KEY, JSON.stringify(this.classes));
      localStorage.setItem(MARKS_KEY, JSON.stringify(this.marks));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }

  getStudents(classId?: string): Student[] {
    if (classId) {
      return this.students.filter((s) => s.classId === classId);
    }
    return [...this.students];
  }

  getStudentById(studentId: string): Student | undefined {
    return this.students.find((s) => s.id === studentId);
  }

  updateStudent(studentId: string, updates: Partial<Student>): Student | undefined {
    const idx = this.students.findIndex((s) => s.id === studentId);
    if (idx >= 0) {
      this.students[idx] = { ...this.students[idx], ...updates };
      this.save();

      // Trigger backend REST update
      fetch(`/api/academic/students/${studentId}`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(updates)
      }).catch((err) => console.warn('[academicService] Update error:', err));

      return this.students[idx];
    }
    return undefined;
  }

  getClasses(): AcademicClass[] {
    return [...this.classes];
  }

  getClassById(classId: string): AcademicClass | undefined {
    return this.classes.find((c) => c.id === classId);
  }

  getTeachers(): Teacher[] {
    return [...this.teachers];
  }

  getTeacherById(teacherId: string): Teacher | undefined {
    return this.teachers.find((t) => t.id === teacherId);
  }

  getMarksByStudent(studentId: string): StudentMarkReport | undefined {
    return this.marks[studentId];
  }

  updateSubjectMark(
    studentId: string,
    subjectCode: string,
    internalObtained: number,
    externalObtained?: number
  ): StudentMarkReport | undefined {
    const report = this.marks[studentId];
    if (!report) return undefined;

    const sub = report.subjects.find((s) => s.subjectCode === subjectCode);
    if (sub) {
      sub.internalObtained = internalObtained;
      if (externalObtained !== undefined) {
        sub.externalObtained = externalObtained;
      }
      sub.totalObtained = Math.min(100, Math.round((sub.internalObtained / sub.internalMax) * 50 + (sub.externalObtained / sub.externalMax) * 50));
      if (sub.totalObtained >= 90) sub.grade = 'O (Outstanding)';
      else if (sub.totalObtained >= 80) sub.grade = 'A+';
      else if (sub.totalObtained >= 70) sub.grade = 'A';
      else if (sub.totalObtained >= 60) sub.grade = 'B+';
      else if (sub.totalObtained >= 50) sub.grade = 'B';
      else sub.grade = 'RA (Re-Appear)';

      this.save();

      // Trigger backend REST update
      fetch(`/api/academic/marks/${studentId}`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          subjectCode,
          internalObtained,
          externalObtained: sub.externalObtained
        })
      }).catch((err) => console.warn('[academicService] Mark update error:', err));
    }
    return report;
  }
}

export const academicService = new AcademicService();
