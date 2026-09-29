import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { createAuditLog } from '../utils/auditLogger';
import { AuthRequest } from '../types';
import { getParentStudentIds, parentCanAccessStudent, syncStudentParentLink } from '../services/parentRelationships';

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
export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const { classId } = req.query;
    const parentIds = req.user.role === 'PARENT'
      ? await getParentStudentIds(req.user.id, req.user.email)
      : null;
    let students: any[] = dbStore.students;

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('students').select('*, classes(name,section)');
      if (parentIds) {
        if (parentIds.length === 0) students = [];
        else {
          const { data, error } = await query.in('id', parentIds);
          if (error) return res.status(500).json({ success: false, message: 'Unable to load students' });
          students = (data || []).map((student: any) => toStudentResponse(student));
        }
      } else {
        const { data, error } = await query;
        if (error) return res.status(500).json({ success: false, message: 'Unable to load students' });
        if (data) students = data.map((student: any) => toStudentResponse(student));
      }
    } else if (parentIds) {
      students = dbStore.students.filter((student) => parentIds.includes(student.id));
    }

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

const toStudentResponse = (student: any) => {
  const relatedClass = Array.isArray(student.classes) ? student.classes[0] : student.classes;
  return {
    ...student,
    studentId: student.studentId || student.student_code || student.id,
    rollNumber: student.rollNumber || student.roll_number,
    classId: student.classId || student.class_id,
    className: student.className || student.class_name || relatedClass?.name || '',
    section: student.section || relatedClass?.section || '',
    dateOfBirth: student.dateOfBirth || student.date_of_birth || undefined,
    parentName: student.parentName || student.parent_name || '',
    parentEmail: student.parentEmail || student.parent_email || '',
    parentPhone: student.parentPhone || student.parent_phone || '',
    parentRelationship: student.parentRelationship || student.parent_relationship || undefined,
    fnAttendanceRate: student.fnAttendanceRate ?? 0,
    anAttendanceRate: student.anAttendanceRate ?? 0,
    overallAttendanceRate: student.overallAttendanceRate ?? 0,
    academicCgpa: student.academicCgpa ?? student.academic_cgpa ?? 0,
    riskLevel: student.riskLevel || 'low',
  };
};

const getStudentClass = async (classId: string) => {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.from('classes').select('id,name,section,academic_year').eq('id', classId).maybeSingle();
    return data;
  }
  return dbStore.classes.find((academicClass) => academicClass.id === classId);
};

const isValidDateOfBirth = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && date <= new Date();
};

export const getStudentById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    let student: any = dbStore.students.find(s => s.id === id || s.rollNumber === id || s.studentId === id);
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('students').select('*, classes(name,section)').eq('id', id).maybeSingle();
      student = data ? toStudentResponse(data) : undefined;
    }
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (!(await parentCanAccessStudent(req, student.id))) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body;
    const studentId = typeof body.studentId === 'string' ? body.studentId.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const rollNumber = typeof body.rollNumber === 'string' ? body.rollNumber.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const classId = typeof body.classId === 'string' ? body.classId.trim() : '';
    const section = typeof body.section === 'string' ? body.section.trim() : '';
    const parentEmail = typeof body.parentEmail === 'string' ? body.parentEmail.trim().toLowerCase() : '';
    const parentName = typeof body.parentName === 'string' ? body.parentName.trim() : '';
    const parentPhone = typeof body.parentPhone === 'string' ? body.parentPhone.trim() : '';
    const parentRelationship = typeof body.parentRelationship === 'string'
      ? body.parentRelationship.trim().toLowerCase()
      : '';

    if (!studentId || !name || !email || !rollNumber || !classId || !section || !isValidDateOfBirth(body.dateOfBirth)) {
      return res.status(400).json({ success: false, message: 'Student ID, name, email, roll number, class, section, and date of birth are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid student email is required' });
    }
    const hasParentContact = parentEmail || parentName || parentPhone || parentRelationship;
    if (hasParentContact && (!parentEmail || !parentName || !parentPhone || !['father', 'mother', 'guardian'].includes(parentRelationship))) {
      return res.status(400).json({ success: false, message: 'Provide the parent name, email, phone, and relationship together' });
    }
    const classInfo = await getStudentClass(classId);
    if (!classInfo) return res.status(400).json({ success: false, message: 'Select a valid class' });
    if (String(classInfo.section || '').toUpperCase() !== section.toUpperCase()) {
      return res.status(400).json({ success: false, message: 'Student section must match the selected class' });
    }

    if (!isSupabaseConfigured && dbStore.students.some((student) =>
      student.studentId === studentId || student.rollNumber.toLowerCase() === rollNumber.toLowerCase() || student.email.toLowerCase() === email
    )) {
      return res.status(409).json({ success: false, message: 'Student ID, roll number, or email already exists' });
    }

    const commonStudent = {
      studentId,
      rollNumber,
      name,
      email,
      phone: typeof body.phone === 'string' ? body.phone.trim() : '',
      dateOfBirth: body.dateOfBirth,
      section,
      classId,
      className: classInfo.name,
      department: classInfo.department || '',
      semester: Number(classInfo.semester) || 0,
      parentName,
      parentEmail,
      parentPhone,
      parentRelationship: parentRelationship || undefined,
      avatar: '',
      fnAttendanceRate: 0,
      anAttendanceRate: 0,
      overallAttendanceRate: 0,
      academicCgpa: 0,
      riskLevel: 'low',
      tags: [],
    };

    let newStudent: any;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('students')
        .insert({
          student_code: studentId,
          name,
          email,
          phone: commonStudent.phone || null,
          roll_number: rollNumber,
          section,
          class_id: classId,
          date_of_birth: body.dateOfBirth,
          parent_name: parentName || null,
          parent_email: parentEmail || null,
          parent_phone: parentPhone || null,
          parent_relationship: parentRelationship || null,
        })
        .select('*, classes(name,section)')
        .single();
      if (error) {
        if (error.code === '23505') return res.status(409).json({ success: false, message: 'Student ID, roll number, or email already exists' });
        return res.status(500).json({ success: false, message: 'Unable to create student' });
      }
      newStudent = toStudentResponse(data);
      try {
        await syncStudentParentLink(newStudent.id, parentEmail, parentRelationship);
      } catch (linkError: any) {
        return res.status(500).json({ success: false, message: 'Student was created but parent link could not be synchronized' });
      }
    } else {
      newStudent = { id: `std_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, ...commonStudent };
      dbStore.students.push(newStudent);
    }

    try {
      await syncStudentParentLink(newStudent.id, parentEmail, parentRelationship);
    } catch {
      return res.status(500).json({ success: false, message: 'Student was created but parent link could not be synchronized' });
    }

    await createAuditLog({
      user_id: req.user?.id || null,
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

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const body = req.body;
    const studentId = typeof body.studentId === 'string' ? body.studentId.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const rollNumber = typeof body.rollNumber === 'string' ? body.rollNumber.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const classId = typeof body.classId === 'string' ? body.classId.trim() : '';
    const section = typeof body.section === 'string' ? body.section.trim() : '';
    const parentEmail = typeof body.parentEmail === 'string' ? body.parentEmail.trim().toLowerCase() : '';
    const parentName = typeof body.parentName === 'string' ? body.parentName.trim() : '';
    const parentPhone = typeof body.parentPhone === 'string' ? body.parentPhone.trim() : '';
    const parentRelationship = typeof body.parentRelationship === 'string'
      ? body.parentRelationship.trim().toLowerCase()
      : '';

    if (!studentId || !name || !email || !rollNumber || !classId || !section || !isValidDateOfBirth(body.dateOfBirth)) {
      return res.status(400).json({ success: false, message: 'Student ID, name, email, roll number, class, section, and date of birth are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid student email is required' });
    }
    const hasParentContact = parentEmail || parentName || parentPhone || parentRelationship;
    if (hasParentContact && (!parentEmail || !parentName || !parentPhone || !['father', 'mother', 'guardian'].includes(parentRelationship))) {
      return res.status(400).json({ success: false, message: 'Provide the parent name, email, phone, and relationship together' });
    }
    const classInfo = await getStudentClass(classId);
    if (!classInfo) return res.status(400).json({ success: false, message: 'Select a valid class' });
    if (String(classInfo.section || '').toUpperCase() !== section.toUpperCase()) {
      return res.status(400).json({ success: false, message: 'Student section must match the selected class' });
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('students')
        .update({
          student_code: studentId,
          name,
          email,
          phone: typeof body.phone === 'string' ? body.phone.trim() || null : null,
          roll_number: rollNumber,
          section: classInfo.section,
          class_id: classId,
          date_of_birth: body.dateOfBirth,
          parent_name: parentName || null,
          parent_email: parentEmail || null,
          parent_phone: parentPhone || null,
          parent_relationship: parentRelationship || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, classes(name,section)')
        .single();
      if (error) {
        if (error.code === '23505') return res.status(409).json({ success: false, message: 'Student ID, roll number, or email already exists' });
        return res.status(500).json({ success: false, message: 'Unable to update student' });
      }
      const updatedStudent = toStudentResponse(data);
      try {
        await syncStudentParentLink(updatedStudent.id, parentEmail, parentRelationship);
      } catch {
        return res.status(500).json({ success: false, message: 'Student was updated but parent link could not be synchronized' });
      }
      await createAuditLog({
        user_id: req.user?.id || null,
        action: 'UPDATE_STUDENT',
        entity_type: 'STUDENT',
        entity_id: id,
        new_data: updatedStudent,
      });
      return res.json({ success: true, data: updatedStudent });
    }

    const index = dbStore.students.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const prevData = { ...dbStore.students[index] };
    const duplicate = dbStore.students.some((student, studentIndex) => studentIndex !== index && (
      student.studentId?.toLowerCase() === studentId.toLowerCase() ||
      student.rollNumber.toLowerCase() === rollNumber.toLowerCase() ||
      student.email.toLowerCase() === email
    ));
    if (duplicate) return res.status(409).json({ success: false, message: 'Student ID, roll number, or email already exists' });

    dbStore.students[index] = {
      ...dbStore.students[index],
      studentId,
      name,
      email,
      phone: typeof body.phone === 'string' ? body.phone.trim() : '',
      rollNumber,
      classId,
      className: classInfo.name,
      section,
      department: classInfo.department || '',
      semester: Number(classInfo.semester) || 0,
      dateOfBirth: body.dateOfBirth,
      parentName,
      parentEmail,
      parentPhone,
      parentRelationship: parentRelationship || undefined,
    };

    try {
      await syncStudentParentLink(id, parentEmail, parentRelationship);
    } catch {
      return res.status(500).json({ success: false, message: 'Student was updated but parent link could not be synchronized' });
    }

    await createAuditLog({
      user_id: req.user?.id || null,
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

export const deleteStudent = async (req: AuthRequest, res: Response) => {
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
export const getMarksByStudent = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.params.studentId as string;
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!(await parentCanAccessStudent(req, studentId))) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const report = dbStore.marks[studentId];
    if (!report) {
      // Fallback: generate default template report for student
      const student = dbStore.students.find(s => s.id === studentId);
      const defaultReport: any = {
        studentId,
        studentName: student?.name || 'Student',
        rollNumber: student?.rollNumber || '',
        semester: student?.semester || 0,
        examTerm: 'Mid-Term 1',
        totalCredits: 0,
        gpa: student?.academicCgpa || 0,
        locked: false,
        subjects: [],
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
