import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { createAuditLog } from '../utils/auditLogger';

// ============================================
// CLASSES
// ============================================
export const getClasses = async (_req: Request, res: Response) => {
  try {
    let classes = dbStore.classes;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('classes').select('*');
      if (!error && data && data.length > 0) classes = data;
    }
    res.json({
      success: true,
      data: { classes },
      classes, // dual compatibility
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getClassById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    let cls = dbStore.classes.find(c => c.id === id);
    if (!cls && isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('classes').select('*').eq('id', id).single();
      cls = data;
    }
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: cls });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================
// STUDENTS
// ============================================
export const getStudents = async (req: Request, res: Response) => {
  try {
    const { classId } = req.query;
    let students = dbStore.students;

    if (classId) {
      students = students.filter(s => s.classId === classId || s.class_id === classId);
    }

    res.json({
      success: true,
      data: { students },
      students, // dual compatibility
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    let student = dbStore.students.find(s => s.id === id || s.rollNumber === id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const newStudent = {
      id: body.id || `std_${Date.now()}`,
      rollNumber: body.rollNumber || body.roll_number,
      name: body.name,
      email: body.email || `${body.rollNumber?.toLowerCase()}@edunexus.edu`,
      avatar: body.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      classId: body.classId || body.class_id || 'cls_cse_a',
      className: body.className || body.class_name || 'B.Tech CSE - 6A',
      section: body.section || 'A',
      department: body.department || 'Computer Science',
      semester: body.semester || 6,
      parentName: body.parentName || body.parent_name || 'Guardian',
      parentPhone: body.parentPhone || body.parent_phone || '+91 98400 00000',
      parentEmail: body.parentEmail || body.parent_email || 'guardian@edunexus.edu',
      fnAttendanceRate: 90,
      anAttendanceRate: 90,
      overallAttendanceRate: 90,
      academicCgpa: body.academicCgpa || 8.0,
      riskLevel: 'low',
      tags: body.tags || ['Regular'],
    };

    dbStore.students.push(newStudent);

    await createAuditLog({
      user_id: (req as any).user?.id || 'admin',
      action: 'CREATE_STUDENT',
      entity_type: 'STUDENT',
      entity_id: newStudent.id,
      new_data: newStudent,
    });

    res.status(201).json({ success: true, data: newStudent });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    const index = dbStore.students.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const prevData = { ...dbStore.students[index] };
    dbStore.students[index] = { ...dbStore.students[index], ...updates };

    await createAuditLog({
      user_id: (req as any).user?.id || 'admin',
      action: 'UPDATE_STUDENT',
      entity_type: 'STUDENT',
      entity_id: id,
      previous_data: prevData,
      new_data: dbStore.students[index],
    });

    res.json({ success: true, data: dbStore.students[index] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const index = dbStore.students.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const removed = dbStore.students.splice(index, 1)[0];

    await createAuditLog({
      user_id: (req as any).user?.id || 'admin',
      action: 'DELETE_STUDENT',
      entity_type: 'STUDENT',
      entity_id: id,
      previous_data: removed,
    });

    res.json({ success: true, message: 'Student removed successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================
// TEACHERS
// ============================================
export const getTeachers = async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: { teachers: dbStore.teachers },
      teachers: dbStore.teachers,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const teacher = dbStore.teachers.find(t => t.id === id || t.user_id === id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, data: teacher });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTeacherClasses = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const teacher = dbStore.teachers.find(t => t.id === id || t.user_id === id);
    const assignedClassIds = teacher?.assignedClasses || ['cls_cse_a'];
    const classes = dbStore.classes.filter(c => assignedClassIds.includes(c.id));
    res.json({ success: true, data: classes });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================
// PARENTS
// ============================================
export const getParents = async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: { parents: dbStore.parents },
      parents: dbStore.parents,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================
// MARKS
// ============================================
export const getMarksByStudent = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId as string;
    const report = dbStore.marks[studentId];
    if (!report) {
      // Fallback: generate default template report for student
      const student = dbStore.students.find(s => s.id === studentId);
      const defaultReport: any = {
        studentId,
        studentName: student?.name || 'Student',
        rollNumber: student?.rollNumber || '21CS100',
        semester: 6,
        examTerm: 'Mid-Term 1',
        totalCredits: 22,
        gpa: student?.academicCgpa || 8.0,
        locked: false,
        subjects: [
          {
            subjectCode: 'CS8401',
            subjectName: 'Operating Systems Principles',
            credits: 4,
            internalMax: 50,
            internalObtained: 42,
            externalMax: 100,
            externalObtained: 84,
            totalMax: 100,
            totalObtained: 84,
            grade: 'A+',
            status: 'passed',
          },
          {
            subjectCode: 'CS8402',
            subjectName: 'Database Management Systems',
            credits: 4,
            internalMax: 50,
            internalObtained: 40,
            externalMax: 100,
            externalObtained: 80,
            totalMax: 100,
            totalObtained: 80,
            grade: 'A',
            status: 'passed',
          }
        ]
      };
      return res.json({ success: true, data: defaultReport });
    }
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSubjectMark = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId as string;
    const { subjectCode, internalObtained, externalObtained } = req.body;

    let report = dbStore.marks[studentId];
    if (!report) {
      const student = dbStore.students.find(s => s.id === studentId);
      report = {
        studentId,
        studentName: student?.name || 'Student',
        rollNumber: student?.rollNumber || '21CS100',
        semester: 6,
        examTerm: 'Mid-Term 1',
        totalCredits: 22,
        gpa: student?.academicCgpa || 8.0,
        locked: false,
        subjects: []
      };
      dbStore.marks[studentId] = report;
    }

    const sub = report.subjects.find((s: any) => s.subjectCode === subjectCode);
    if (sub) {
      sub.internalObtained = Number(internalObtained);
      if (externalObtained !== undefined) {
        sub.externalObtained = Number(externalObtained);
      }
      sub.totalObtained = Math.min(
        100,
        Math.round((sub.internalObtained / sub.internalMax) * 50 + (sub.externalObtained / sub.externalMax) * 50)
      );

      if (sub.totalObtained >= 90) sub.grade = 'O (Outstanding)';
      else if (sub.totalObtained >= 80) sub.grade = 'A+';
      else if (sub.totalObtained >= 70) sub.grade = 'A';
      else if (sub.totalObtained >= 60) sub.grade = 'B+';
      else if (sub.totalObtained >= 50) sub.grade = 'B';
      else sub.grade = 'RA (Re-Appear)';
    }

    await createAuditLog({
      user_id: (req as any).user?.id || 'faculty',
      action: 'UPDATE_MARKS',
      entity_type: 'MARKS',
      entity_id: `${studentId}_${subjectCode}`,
      new_data: { studentId, subjectCode, internalObtained, externalObtained },
    });

    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
