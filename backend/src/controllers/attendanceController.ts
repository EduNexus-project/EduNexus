import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';
import { createAuditLog } from '../utils/auditLogger';
import { AuthRequest } from '../types';
import { getParentStudentIds, parentCanAccessStudent } from '../services/parentRelationships';

// Helper to compute student stats
export function computeStudentAttendanceStats(studentId: string) {
  const records = dbStore.attendance.filter(r => r.studentId === studentId);
  if (records.length === 0) {
    return {
      fnRate: 90,
      anRate: 90,
      overallRate: 90,
      totalSessions: 0,
      presentSessions: 0,
      consecutiveAbsences: 0,
      afternoonDropCount: 0,
    };
  }

  const fnRecords = records.filter(r => r.session === 'FN');
  const anRecords = records.filter(r => r.session === 'AN');

  const fnPresent = fnRecords.filter(r => r.status === 'present' || r.status === 'excused').length;
  const anPresent = anRecords.filter(r => r.status === 'present' || r.status === 'excused').length;

  const fnRate = fnRecords.length > 0 ? (fnPresent / fnRecords.length) * 100 : 100;
  const anRate = anRecords.length > 0 ? (anPresent / anRecords.length) * 100 : 100;
  const totalSessions = records.length;
  const presentSessions = fnPresent + anPresent;
  const overallRate = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 100;

  const dates = Array.from(new Set(records.map(r => r.date))).sort();
  let afternoonDropCount = 0;
  dates.forEach(d => {
    const fn = records.find(r => r.date === d && r.session === 'FN');
    const an = records.find(r => r.date === d && r.session === 'AN');
    if (fn && an && (fn.status === 'present' || fn.status === 'late') && an.status === 'absent') {
      afternoonDropCount++;
    }
  });

  return {
    fnRate: Math.round(fnRate * 10) / 10,
    anRate: Math.round(anRate * 10) / 10,
    overallRate: Math.round(overallRate * 10) / 10,
    totalSessions,
    presentSessions,
    consecutiveAbsences: 0,
    afternoonDropCount,
  };
}

// Update student object's cached rates
function syncStudentRates(studentId: string) {
  const stats = computeStudentAttendanceStats(studentId);
  const student = dbStore.students.find(s => s.id === studentId);
  if (student) {
    student.fnAttendanceRate = stats.fnRate;
    student.anAttendanceRate = stats.anRate;
    student.overallAttendanceRate = stats.overallRate;
  }
}

// GET /api/attendance
export const getAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { date, studentId, session } = req.query;
    let records = dbStore.attendance;

    if (req.user?.role === 'PARENT') {
      const linkedIds = await getParentStudentIds(req.user.id, req.user.email);
      if (studentId && !linkedIds.includes(String(studentId))) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      records = records.filter((record) => linkedIds.includes(record.studentId));
    }

    if (date) records = records.filter(r => r.date === date);
    if (studentId) records = records.filter(r => r.studentId === studentId);
    if (session) records = records.filter(r => r.session === session);

    res.json({
      success: true,
      data: { records },
      records,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance/student/:studentId
export const getStudentAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.params.studentId as string;
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!(await parentCanAccessStudent(req, studentId))) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const records = dbStore.attendance.filter(r => r.studentId === studentId);
    const stats = computeStudentAttendanceStats(studentId);
    res.json({
      success: true,
      data: {
        records,
        stats,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance/stats/:studentId
export const getStudentStats = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.params.studentId as string;
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!(await parentCanAccessStudent(req, studentId))) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const stats = computeStudentAttendanceStats(studentId);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/attendance/mark
export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { studentId, date, session, status, markedBy } = req.body;
    if (!studentId || !date || !session || !status) {
      return res.status(400).json({ success: false, message: 'studentId, date, session, and status are required' });
    }

    const normalizedStatus = status.toLowerCase();
    const existingIndex = dbStore.attendance.findIndex(
      r => r.studentId === studentId && r.date === date && r.session === session
    );

    const now = new Date().toISOString();
    let record: any;

    if (existingIndex >= 0) {
      const prev = { ...dbStore.attendance[existingIndex] };
      dbStore.attendance[existingIndex] = {
        ...dbStore.attendance[existingIndex],
        status: normalizedStatus,
        markedBy: markedBy || 'usr_teacher_01',
        markedAt: now,
      };
      record = dbStore.attendance[existingIndex];

      await createAuditLog({
        user_id: (req as any).user?.id || markedBy || 'teacher',
        action: 'UPDATE_ATTENDANCE',
        entity_type: 'ATTENDANCE',
        entity_id: record.id,
        previous_data: prev,
        new_data: record,
      });
    } else {
      record = {
        id: `att_${studentId}_${date}_${session}`,
        studentId,
        date,
        session,
        status: normalizedStatus,
        markedBy: markedBy || 'usr_teacher_01',
        markedAt: now,
      };
      dbStore.attendance.push(record);

      await createAuditLog({
        user_id: (req as any).user?.id || markedBy || 'teacher',
        action: 'RECORD_ATTENDANCE',
        entity_type: 'ATTENDANCE',
        entity_id: record.id,
        new_data: record,
      });
    }

    syncStudentRates(studentId);

    res.json({ success: true, data: record });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/attendance/bulk
export const bulkMarkAttendance = async (req: Request, res: Response) => {
  try {
    const { studentIds, date, session, status, markedBy } = req.body;
    if (!Array.isArray(studentIds) || !date || !session || !status) {
      return res.status(400).json({ success: false, message: 'studentIds array, date, session, and status are required' });
    }

    const normalizedStatus = status.toLowerCase();
    const now = new Date().toISOString();

    studentIds.forEach(id => {
      const existingIndex = dbStore.attendance.findIndex(
        r => r.studentId === id && r.date === date && r.session === session
      );

      if (existingIndex >= 0) {
        dbStore.attendance[existingIndex] = {
          ...dbStore.attendance[existingIndex],
          status: normalizedStatus,
          markedBy: markedBy || 'usr_teacher_01',
          markedAt: now,
        };
      } else {
        dbStore.attendance.push({
          id: `att_${id}_${date}_${session}`,
          studentId: id,
          date,
          session,
          status: normalizedStatus,
          markedBy: markedBy || 'usr_teacher_01',
          markedAt: now,
        });
      }

      syncStudentRates(id);
    });

    await createAuditLog({
      user_id: (req as any).user?.id || markedBy || 'teacher',
      action: 'BULK_ATTENDANCE',
      entity_type: 'ATTENDANCE',
      new_data: { count: studentIds.length, date, session, status: normalizedStatus },
    });

    res.json({ success: true, message: `Bulk attendance recorded for ${studentIds.length} students` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance/skippers
export const detectSessionSkippers = async (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || '2026-09-28';
    const fnMap = new Map<string, string>();
    const anMap = new Map<string, string>();

    dbStore.attendance
      .filter(r => r.date === date)
      .forEach(r => {
        if (r.session === 'FN') fnMap.set(r.studentId, r.status);
        if (r.session === 'AN') anMap.set(r.studentId, r.status);
      });

    const skippers: any[] = [];
    dbStore.students.forEach(s => {
      const fn = fnMap.get(s.id) || 'present';
      const an = anMap.get(s.id) || 'present';
      if ((fn === 'present' || fn === 'late') && an === 'absent') {
        skippers.push({ student: s, fnStatus: fn, anStatus: an });
      }
    });

    res.json({ success: true, data: { date, count: skippers.length, skippers } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
