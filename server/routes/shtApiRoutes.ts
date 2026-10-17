import { Router, Request, Response } from 'express';
import {
  profiles,
  classes,
  students,
  subjects,
  attendance,
  examinations,
  marks,
  correctionRequests,
  anomalyAlerts,
  notifications,
  auditLogs,
  submitSessionAttendance,
  calculateCorrectionRisk,
  resolveCorrectionRequest,
  generateParentProgressReport,
  createExamination,
  recordBatchMarks,
  createStudent,
  updateStudent,
  deleteStudent,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  createClass,
  updateClass,
  deleteClass,
  createSubject,
  deleteSubject,
  registerUser,
  loginUser,
} from '../services/shtStore.ts';

const router = Router();

// -------------------------------------------------------------
// 1. AUTHENTICATION & USER PROFILES
// -------------------------------------------------------------
router.get('/profiles', (_req: Request, res: Response): void => {
  // Strip passwords for security
  const safeProfiles = profiles.map(({ password, ...rest }) => rest);
  res.json(safeProfiles);
});

router.post('/auth/register', (req: Request, res: Response): void => {
  try {
    const { name, email, password, role, phone, department, institution_code, school_name, staff_id, student_id } = req.body;

    if (!name || !email || !role) {
      res.status(400).json({ error: 'Full name, email address, and role are required.' });
      return;
    }

    const result = registerUser({
      name,
      email,
      password,
      role,
      phone,
      department,
      institution_code,
      school_name,
      staff_id,
      student_id,
    });

    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    const { password: _, ...safeUser } = result.user!;
    res.status(201).json({
      success: true,
      user: safeUser,
      message: `Account created successfully for ${safeUser.name}. You may now sign in.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', (req: Request, res: Response): void => {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Please enter your email address.' });
      return;
    }

    const result = loginUser({
      email,
      password,
      selectedRole: role,
    });

    if (!result.success) {
      res.status(401).json({ error: result.message });
      return;
    }

    const { password: _, ...safeUser } = result.user!;
    res.json({
      success: true,
      user: safeUser,
      token: result.token,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/auth/me', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'No authorization header provided.' });
    return;
  }
  // Extract user ID from token
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token.startsWith('jwt-sht-')) {
    res.status(401).json({ error: 'Invalid authentication session.' });
    return;
  }

  try {
    const decoded = Buffer.from(token.replace('jwt-sht-', ''), 'base64').toString('utf-8');
    const [userId] = decoded.split(':');
    const user = profiles.find((p) => p.id === userId);
    if (!user) {
      res.status(401).json({ error: 'User session not found.' });
      return;
    }
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch {
    res.status(401).json({ error: 'Session expired or malformed.' });
  }
});

// -------------------------------------------------------------
// 2. PRINCIPAL DASHBOARD SUMMARY & ANALYTICS
// -------------------------------------------------------------
router.get('/principal/summary', (req: Request, res: Response): void => {
  const queryDate = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter((a) => a.session_date === queryDate);

  const totalPossible = students.length * 2; // FN and AN sessions
  const fnRecords = todayRecords.filter((a) => a.session_type === 'FN');
  const anRecords = todayRecords.filter((a) => a.session_type === 'AN');

  const fnPresent = fnRecords.filter((a) => a.status === 'Present').length;
  const anPresent = anRecords.filter((a) => a.status === 'Present').length;
  const totalPresent = fnPresent + anPresent;

  const totalAbsent = todayRecords.filter((a) => a.status === 'Absent').length;
  const totalPending = Math.max(0, totalPossible - todayRecords.length);

  const attendancePct = totalPossible > 0 ? Math.round((totalPresent / (todayRecords.length || 1)) * 100) : 0;

  const activeAlerts = anomalyAlerts.filter((a) => a.status === 'Active');
  const pendingCorrections = correctionRequests.filter((c) => c.status === 'Pending');

  res.json({
    stats: {
      total_students: students.length,
      total_teachers: profiles.filter((p) => p.role === 'teacher').length,
      total_classes: classes.length,
      today_attendance_pct: attendancePct,
      fn_present: fnPresent,
      fn_total: fnRecords.length,
      an_present: anPresent,
      an_total: anRecords.length,
      present_count: totalPresent,
      absent_count: totalAbsent,
      pending_count: totalPending,
      active_anomalies_count: activeAlerts.length,
      pending_corrections_count: pendingCorrections.length,
    },
    active_anomalies: activeAlerts,
    pending_corrections: pendingCorrections,
    recent_audits: auditLogs.slice(0, 10),
  });
});

// -------------------------------------------------------------
// 3. CLASSES & ROSTER
// -------------------------------------------------------------
router.get('/classes', (_req: Request, res: Response): void => {
  res.json(classes);
});

router.post('/classes', (req: Request, res: Response): void => {
  try {
    const { code, name, department, section, academic_year } = req.body;
    if (!code || !name || !department || !section) {
      res.status(400).json({ error: 'Code, name, department, and section are required.' });
      return;
    }
    const cls = createClass({ code, name, department, section, academic_year });
    res.status(201).json({ success: true, class: cls });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/classes/:id', (req: Request, res: Response): void => {
  try {
    const updated = updateClass(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Class not found.' });
      return;
    }
    res.json({ success: true, class: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/classes/:id', (req: Request, res: Response): void => {
  try {
    const deleted = deleteClass(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Class not found.' });
      return;
    }
    res.json({ success: true, message: 'Class deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/classes/:id/roster', (req: Request, res: Response): void => {
  const { id } = req.params;
  const roster = students.filter((s) => s.class_id === id);
  res.json(roster);
});

// -------------------------------------------------------------
// 4. STUDENT CRUD (EXACT NAMES SAVED VERBATIM)
// -------------------------------------------------------------
router.get('/students', (_req: Request, res: Response): void => {
  res.json(students);
});

router.post('/students', (req: Request, res: Response): void => {
  try {
    const { student_name, roll_no, class_id, parent_name, parent_phone, parent_channel } = req.body;
    if (!student_name || roll_no === undefined || !class_id || !parent_name) {
      res.status(400).json({ error: 'Student name, roll number, class, and parent name are required.' });
      return;
    }
    const student = createStudent({
      student_name,
      roll_no,
      class_id,
      parent_name,
      parent_phone: parent_phone || '',
      parent_channel,
    });
    res.status(201).json({ success: true, student });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/students/:id', (req: Request, res: Response): void => {
  try {
    const updated = updateStudent(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }
    res.json({ success: true, student: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/students/:id', (req: Request, res: Response): void => {
  try {
    const deleted = deleteStudent(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }
    res.json({ success: true, message: 'Student removed from database.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 5. TEACHER / FACULTY CRUD
// -------------------------------------------------------------
router.get('/teachers', (_req: Request, res: Response): void => {
  const teachers = profiles.filter((p) => p.role === 'teacher').map(({ password, ...t }) => t);
  res.json(teachers);
});

router.post('/teachers', (req: Request, res: Response): void => {
  try {
    const { name, email, phone, department, assigned_class_id, staff_id, password } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: 'Teacher full name and email are required.' });
      return;
    }
    const newTeacher = createTeacher({
      name,
      email,
      phone,
      department,
      assigned_class_id,
      staff_id,
      password,
    });
    const { password: _, ...safe } = newTeacher;
    res.status(201).json({ success: true, teacher: safe });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/teachers/:id', (req: Request, res: Response): void => {
  try {
    const updated = updateTeacher(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Teacher record not found.' });
      return;
    }
    const { password: _, ...safe } = updated;
    res.json({ success: true, teacher: safe });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/teachers/:id', (req: Request, res: Response): void => {
  try {
    const deleted = deleteTeacher(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Teacher record not found.' });
      return;
    }
    res.json({ success: true, message: 'Teacher removed from institution records.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 6. SUBJECTS CRUD
// -------------------------------------------------------------
router.get('/subjects', (_req: Request, res: Response): void => {
  res.json(subjects);
});

router.post('/subjects', (req: Request, res: Response): void => {
  try {
    const { class_id, code, name, teacher_id, teacher_name } = req.body;
    if (!class_id || !code || !name) {
      res.status(400).json({ error: 'Class, subject code, and name are required.' });
      return;
    }
    const subject = createSubject({
      class_id,
      code,
      name,
      teacher_id,
      teacher_name: teacher_name || 'Assigned Faculty',
    });
    res.status(201).json({ success: true, subject });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/subjects/:id', (req: Request, res: Response): void => {
  try {
    const deleted = deleteSubject(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Subject not found.' });
      return;
    }
    res.json({ success: true, message: 'Subject removed.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 7. ATTENDANCE ENGINE (FN & AN Sessions + Duplicate Prevention)
// -------------------------------------------------------------
router.get('/attendance', (req: Request, res: Response): void => {
  const { class_id, date, session_type } = req.query;
  let list = [...attendance];

  if (class_id) list = list.filter((a) => a.class_id === class_id);
  if (date) list = list.filter((a) => a.session_date === date);
  if (session_type) list = list.filter((a) => a.session_type === session_type);

  res.json(list);
});

router.post('/attendance/submit', async (req: Request, res: Response): Promise<void> => {
  try {
    const { class_id, session_date, session_type, records, recorded_by } = req.body;

    if (!class_id || !session_date || !session_type || !Array.isArray(records)) {
      res.status(400).json({ error: 'Missing required attendance payload fields' });
      return;
    }

    const result = await submitSessionAttendance({
      class_id,
      session_date,
      session_type,
      records,
      recorded_by: recorded_by || 'Teacher',
    });

    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 8. EXAMINATIONS & MARKS
// -------------------------------------------------------------
router.get('/examinations', (_req: Request, res: Response): void => {
  res.json(examinations);
});

router.post('/examinations', (req: Request, res: Response): void => {
  try {
    const { name, exam_type, class_id, max_marks, academic_year } = req.body;
    if (!name || !exam_type || !class_id) {
      res.status(400).json({ error: 'Name, exam type, and class are required.' });
      return;
    }
    const newExam = createExamination({ name, exam_type, class_id, max_marks, academic_year });
    res.status(201).json({ success: true, examination: newExam });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/marks', (req: Request, res: Response): void => {
  const { student_id, exam_id } = req.query;
  let list = [...marks];
  if (student_id) list = list.filter((m) => m.student_id === student_id);
  if (exam_id) list = list.filter((m) => m.exam_id === exam_id);
  res.json(list);
});

router.post('/marks/batch', (req: Request, res: Response): void => {
  try {
    const { exam_id, subject_id, marks_entries, entered_by } = req.body;
    if (!exam_id || !subject_id || !Array.isArray(marks_entries)) {
      res.status(400).json({ error: 'Exam ID, Subject ID, and marks entries array are required.' });
      return;
    }
    const result = recordBatchMarks({
      exam_id,
      subject_id,
      marks_entries,
      entered_by: entered_by || 'Faculty',
    });
    res.json({
      success: true,
      message: `Successfully processed ${result.insertedCount + result.updatedCount} marks records.`,
      result,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 9. CORRECTION REQUESTS (AI Scoring + Principal Approval)
// -------------------------------------------------------------
router.get('/corrections', (_req: Request, res: Response): void => {
  res.json(correctionRequests);
});

router.post('/corrections/submit', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      teacher_id,
      teacher_name,
      record_type,
      target_id,
      student_id,
      student_name,
      course_or_date,
      original_value,
      proposed_value,
      original_score_num,
      proposed_score_num,
      reason,
    } = req.body;

    if (!student_id || !record_type || !reason) {
      res.status(400).json({ error: 'Student ID, record type, and reason are required.' });
      return;
    }

    const student = students.find((s) => s.student_id === student_id);
    const resolvedStudentName = student ? student.student_name : student_name || student_id;

    const riskAnalysis = await calculateCorrectionRisk({
      record_type,
      student_name: resolvedStudentName,
      original_value,
      proposed_value,
      original_score_num: original_score_num !== undefined ? Number(original_score_num) : undefined,
      proposed_score_num: proposed_score_num !== undefined ? Number(proposed_score_num) : undefined,
      reason,
    });

    const newReq: any = {
      id: 'req-' + Math.random().toString(36).substring(2, 9),
      request_code: `CR-2026-${Math.floor(100 + Math.random() * 900)}`,
      teacher_id: teacher_id || 'usr-teacher-01',
      teacher_name: teacher_name || 'Faculty Member',
      record_type,
      target_id: target_id || 'target-auto',
      student_id,
      student_name: resolvedStudentName,
      course_or_date: course_or_date || 'Course Record',
      original_value,
      proposed_value,
      original_score_num: Number(original_score_num) || undefined,
      proposed_score_num: Number(proposed_score_num) || undefined,
      reason,
      status: 'Pending',
      risk_score: riskAnalysis.risk_score,
      risk_category: riskAnalysis.risk_category,
      ai_explanation: riskAnalysis.ai_explanation,
      supporting_factors: riskAnalysis.supporting_factors,
      suggested_action: riskAnalysis.suggested_action,
      created_at: new Date().toISOString(),
    };

    correctionRequests.unshift(newReq);

    auditLogs.unshift({
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      actor_name: teacher_name || 'Teacher',
      actor_role: 'teacher',
      action: 'CORRECTION_REQUESTED',
      target_type: 'correction_requests',
      target_id: newReq.id,
      details: `Submitted ${record_type} correction ${newReq.request_code} for ${resolvedStudentName}. Assessed Risk: ${riskAnalysis.risk_score}/100.`,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      request: newReq,
      message: 'Correction request submitted to Principal Portal with AI risk assessment.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/corrections/:id/resolve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { decision, reviewed_by } = req.body;

    if (!decision || !['Approved', 'Rejected'].includes(decision)) {
      res.status(400).json({ error: 'Valid decision ("Approved" or "Rejected") is required.' });
      return;
    }

    const result = await resolveCorrectionRequest({
      request_id: id,
      decision,
      reviewed_by: reviewed_by || 'Principal',
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 10. AI TRUANCY ANOMALIES
// -------------------------------------------------------------
router.get('/anomalies', (_req: Request, res: Response): void => {
  res.json(anomalyAlerts);
});

router.patch('/anomalies/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status } = req.body;
  const alert = anomalyAlerts.find((a) => a.id === id);

  if (!alert) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }

  alert.status = status || 'Resolved';

  auditLogs.unshift({
    id: 'aud-' + Math.random().toString(36).substring(2, 9),
    actor_name: 'Principal Office',
    actor_role: 'principal',
    action: 'ANOMALY_STATUS_UPDATED',
    target_type: 'anomaly_alerts',
    target_id: id,
    details: `Updated truancy alert status for ${alert.student_name} to "${alert.status}".`,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, alert });
});

// -------------------------------------------------------------
// 11. PARENT DASHBOARD & STRICT CHILD DATA ISOLATION
// -------------------------------------------------------------
router.get('/parent/children/:parentId', (req: Request, res: Response): void => {
  const { parentId } = req.params;
  const parentProfile = profiles.find((p) => p.id === parentId || p.email.toLowerCase() === parentId.toLowerCase());

  // Strictly return only verified linked students. Never return unlinked students.
  let linked = students.filter((s) => s.parent_id === parentId);
  if (linked.length === 0 && parentProfile?.linked_student_id) {
    linked = students.filter((s) => s.student_id === parentProfile.linked_student_id);
  }

  res.json(linked);
});

router.get('/parent/report/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { range, start, end } = req.query;

    const report = await generateParentProgressReport(studentId, {
      range: (range as string) || 'academic_year',
      startDate: start as string | undefined,
      endDate: end as string | undefined,
    });
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 12. DIRECTORY ALL & AUDITS
// -------------------------------------------------------------
router.get('/directory/all', (_req: Request, res: Response): void => {
  res.json({
    students,
    teachers: profiles.filter((p) => p.role === 'teacher').map(({ password, ...t }) => t),
    parents: profiles.filter((p) => p.role === 'parent').map(({ password, ...pr }) => pr),
    classes,
    subjects,
    examinations,
  });
});

router.get('/notifications', (req: Request, res: Response): void => {
  const { recipient_id } = req.query;
  let list = [...notifications];
  if (recipient_id) {
    list = list.filter((n) => n.recipient_id === recipient_id);
  }
  res.json(list);
});

router.get('/audit-logs', (_req: Request, res: Response): void => {
  res.json(auditLogs);
});

export default router;
