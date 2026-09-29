import { AttendanceRecord, StudentMarkReport } from '../types';
import { authService } from './authService';

export const parentService = {
  async getAttendance(studentId: string): Promise<AttendanceRecord[]> {
    const response = await fetch(`/api/attendance/student/${encodeURIComponent(studentId)}`, {
      headers: authService.getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok || !result.success || !Array.isArray(result.data?.records)) {
      throw new Error(result.message || 'Unable to load student attendance');
    }
    return result.data.records;
  },

  async getMarks(studentId: string): Promise<StudentMarkReport> {
    const response = await fetch(`/api/academic/marks/${encodeURIComponent(studentId)}`, {
      headers: authService.getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Unable to load student marks');
    }
    return result.data;
  }
};