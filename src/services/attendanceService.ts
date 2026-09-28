import { AttendanceRecord, SessionType, AttendanceStatus, Student } from '../types';
import { GENERATE_INITIAL_ATTENDANCE } from '../data/mockData';
import { authService } from './authService';

const ATTENDANCE_STORAGE_KEY = 'edunexus_attendance_records';

class AttendanceService {
  private records: AttendanceRecord[] = [];

  constructor() {
    this.init();
    this.syncFromBackend();
  }

  private init() {
    try {
      const saved = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (saved) {
        this.records = JSON.parse(saved);
        return;
      }
    } catch {
      // ignore
    }
    this.records = GENERATE_INITIAL_ATTENDANCE();
    this.save();
  }

  private save() {
    try {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(this.records));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }

  private async syncFromBackend() {
    try {
      const res = await fetch('/api/attendance');
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.records) && data.data.records.length > 0) {
        this.records = data.data.records;
        this.save();
      }
    } catch (err) {
      // Background sync, fallback silently
    }
  }

  getAllRecords(): AttendanceRecord[] {
    return [...this.records];
  }

  getStudentRecords(studentId: string): AttendanceRecord[] {
    return this.records.filter((r) => r.studentId === studentId);
  }

  getRecordsByDateAndSession(date: string, session: SessionType): AttendanceRecord[] {
    return this.records.filter((r) => r.date === date && r.session === session);
  }

  markStudentAttendance(
    studentId: string,
    date: string,
    session: SessionType,
    status: AttendanceStatus,
    markedBy: string = 'usr_teacher_01'
  ): AttendanceRecord {
    const existingIndex = this.records.findIndex(
      (r) => r.studentId === studentId && r.date === date && r.session === session
    );

    const now = new Date().toISOString();
    let record: AttendanceRecord;

    if (existingIndex >= 0) {
      this.records[existingIndex] = {
        ...this.records[existingIndex],
        status,
        markedBy,
        markedAt: now
      };
      record = this.records[existingIndex];
    } else {
      record = {
        id: `att_${studentId}_${date}_${session}`,
        studentId,
        date,
        session,
        status,
        markedBy,
        markedAt: now
      };
      this.records.push(record);
    }
    this.save();

    // Call REST backend endpoint
    fetch('/api/attendance/mark', {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ studentId, date, session, status, markedBy })
    }).catch((err) => console.warn('[attendanceService] API sync note:', err));

    return record;
  }

  bulkMark(
    studentIds: string[],
    date: string,
    session: SessionType,
    status: AttendanceStatus,
    markedBy: string = 'usr_teacher_01'
  ): void {
    studentIds.forEach((id) => {
      const existingIndex = this.records.findIndex(
        (r) => r.studentId === id && r.date === date && r.session === session
      );
      const now = new Date().toISOString();
      if (existingIndex >= 0) {
        this.records[existingIndex] = {
          ...this.records[existingIndex],
          status,
          markedBy,
          markedAt: now
        };
      } else {
        this.records.push({
          id: `att_${id}_${date}_${session}`,
          studentId: id,
          date,
          session,
          status,
          markedBy,
          markedAt: now
        });
      }
    });
    this.save();

    // Call REST bulk endpoint
    fetch('/api/attendance/bulk', {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ studentIds, date, session, status, markedBy })
    }).catch((err) => console.warn('[attendanceService] Bulk API sync note:', err));
  }

  // Detect session-skipping: students present in FN but absent in AN on a particular date
  detectSessionSkippers(date: string, students: Student[]): { student: Student; fnStatus: AttendanceStatus; anStatus: AttendanceStatus }[] {
    const fnMap = new Map<string, AttendanceStatus>();
    const anMap = new Map<string, AttendanceStatus>();

    this.records
      .filter((r) => r.date === date)
      .forEach((r) => {
        if (r.session === 'FN') fnMap.set(r.studentId, r.status);
        if (r.session === 'AN') anMap.set(r.studentId, r.status);
      });

    const skippers: { student: Student; fnStatus: AttendanceStatus; anStatus: AttendanceStatus }[] = [];

    students.forEach((s) => {
      const fn = fnMap.get(s.id) || 'present';
      const an = anMap.get(s.id) || 'present';
      if (fn === 'present' && an === 'absent') {
        skippers.push({ student: s, fnStatus: fn, anStatus: an });
      }
    });

    return skippers;
  }

  // Compute stats for a student
  getStudentStats(studentId: string): {
    fnRate: number;
    anRate: number;
    overallRate: number;
    totalSessions: number;
    presentSessions: number;
    consecutiveAbsences: number;
    afternoonDropCount: number;
  } {
    const studentRecords = this.records.filter((r) => r.studentId === studentId);
    if (studentRecords.length === 0) {
      return {
        fnRate: 90,
        anRate: 90,
        overallRate: 90,
        totalSessions: 0,
        presentSessions: 0,
        consecutiveAbsences: 0,
        afternoonDropCount: 0
      };
    }

    const fnRecords = studentRecords.filter((r) => r.session === 'FN');
    const anRecords = studentRecords.filter((r) => r.session === 'AN');

    const fnPresent = fnRecords.filter((r) => r.status === 'present' || r.status === 'excused').length;
    const anPresent = anRecords.filter((r) => r.status === 'present' || r.status === 'excused').length;

    const fnRate = fnRecords.length > 0 ? (fnPresent / fnRecords.length) * 100 : 100;
    const anRate = anRecords.length > 0 ? (anPresent / anRecords.length) * 100 : 100;
    const totalSessions = studentRecords.length;
    const presentSessions = fnPresent + anPresent;
    const overallRate = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 100;

    // Check dates for afternoon drops
    const dates = Array.from(new Set(studentRecords.map((r) => r.date))).sort();
    let afternoonDropCount = 0;
    dates.forEach((d) => {
      const fn = studentRecords.find((r) => r.date === d && r.session === 'FN');
      const an = studentRecords.find((r) => r.date === d && r.session === 'AN');
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
      afternoonDropCount
    };
  }

  exportAttendanceCSV(students: Student[], date: string): string {
    const headers = ['Roll Number', 'Student Name', 'Class', 'Date', 'Forenoon (FN)', 'Afternoon (AN)', 'Remarks'];
    const rows = students.map((s) => {
      const fn = this.records.find((r) => r.studentId === s.id && r.date === date && r.session === 'FN')?.status || 'present';
      const an = this.records.find((r) => r.studentId === s.id && r.date === date && r.session === 'AN')?.status || 'present';
      const remark = fn === 'present' && an === 'absent' ? 'Afternoon Session Skip' : 'Normal';
      return [s.rollNumber, `"${s.name}"`, s.className, date, fn.toUpperCase(), an.toUpperCase(), remark].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

export const attendanceService = new AttendanceService();
