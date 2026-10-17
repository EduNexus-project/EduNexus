import { Router, Request, Response } from 'express';
import {
  addAttendanceSession,
  addModification,
  getAttendanceSessions,
} from '../services/supabaseClient.ts';
import { dispatchParentAbsenceAlert } from '../services/webhookDispatcher.ts';
import { scoreTeacherModification } from '../services/modificationScorer.ts';

const router = Router();

// 1. Mark Attendance (FN or AN session) - Automatically triggers Supabase Webhook on absence
router.post('/attendance/mark', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      student_id,
      student_name,
      department,
      cohort,
      session_type, // 'FN' | 'AN'
      status, // 'Present' | 'Absent' | 'Late' | 'Excused'
      parent_name,
      parent_phone,
      parent_channel = 'SMS',
      building_zone,
    } = req.body;

    if (!student_id || !session_type || !status) {
      res.status(400).json({ error: 'Missing required attendance fields' });
      return;
    }

    const newSession = await addAttendanceSession({
      student_id,
      student_name: student_name || 'Student',
      department: department || 'Computer Science & AI',
      cohort: cohort || 'CS-2026-A',
      session_date: new Date().toISOString().split('T')[0],
      session_type,
      status,
      parent_name: parent_name || 'Guardian',
      parent_phone: parent_phone || '+1-555-0100',
      parent_channel,
      building_zone: building_zone || 'CS Wing Lab 302',
    });

    // If an FN or AN absence was committed, fire the Supabase Database Webhook alert immediately!
    let webhookDispatch = null;
    if (status === 'Absent') {
      webhookDispatch = await dispatchParentAbsenceAlert({
        type: 'INSERT',
        table: 'erp_attendance_sessions',
        record: newSession,
      });
    }

    res.status(201).json({
      session: newSession,
      webhookFired: status === 'Absent',
      webhookDispatch,
      message: status === 'Absent'
        ? `Absence recorded for ${session_type} session. Real-time webhook fired to parent via ${parent_channel}.`
        : `Attendance recorded as ${status} for ${session_type} session.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Submit Grade or Attendance Modification Request
router.post('/modifications/submit', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      teacher_name,
      department,
      student_id,
      student_name,
      course_code,
      course_name,
      modification_type,
      previous_value,
      proposed_value,
      previous_score_num,
      proposed_score_num,
      class_average,
      student_historical_average,
      justification,
    } = req.body;

    if (!student_id || !modification_type || !justification) {
      res.status(400).json({ error: 'Missing required modification fields' });
      return;
    }

    const created = await addModification({
      teacher_id: 'TCH-' + Math.floor(100 + Math.random() * 900),
      teacher_name: teacher_name || 'Faculty Member',
      department: department || 'Computer Science',
      student_id,
      student_name: student_name || 'Student',
      course_code: course_code || 'CS-440',
      course_name: course_name || 'Distributed Systems',
      modification_type: modification_type || 'Grade Adjustment',
      previous_value,
      proposed_value,
      previous_score_num: Number(previous_score_num) || undefined,
      proposed_score_num: Number(proposed_score_num) || undefined,
      class_average: Number(class_average) || 78.5,
      student_historical_average: Number(student_historical_average) || 72.0,
      status: 'Pending',
      justification,
    });

    // Pre-score with AI Approval Scoring Assistant
    const scoring = await scoreTeacherModification(created);
    created.risk_score = scoring.risk_score;
    created.confidence_score = scoring.confidence_score;
    created.ai_recommendation = scoring.ai_recommendation;
    created.pattern_analysis = scoring.pattern_analysis;

    res.status(201).json({
      modification: created,
      scoring,
      message: 'Modification request submitted to Principal Portal and pre-scored by AI.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
