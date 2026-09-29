import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Student,
  AcademicClass,
  Teacher,
  Anomaly,
  ModificationRequest,
  CampusBlockHeatmap,
  SessionType,
  AttendanceStatus,
  RequestStatus,
  RequestType,
  StudentMarkReport
} from '../types';
import { academicService } from '../services/academicService';
import { attendanceService } from '../services/attendanceService';
import { aiService } from '../services/aiService';
import { requestService } from '../services/requestService';
import { notificationService } from '../services/notificationService';
import { authService } from '../services/authService';
import { CAMPUS_BLOCKS } from '../data/mockData';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

interface ERPDataContextType {
  students: Student[];
  classes: AcademicClass[];
  teachers: Teacher[];
  anomalies: Anomaly[];
  requests: ModificationRequest[];
  campusBlocks: CampusBlockHeatmap[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedParentStudentId: string | null;
  setSelectedParentStudentId: (studentId: string | null) => void;
  parentStudentsLoading: boolean;
  // Mutations
  markAttendance: (studentId: string, date: string, session: SessionType, status: AttendanceStatus) => void;
  bulkMarkAttendance: (studentIds: string[], date: string, session: SessionType, status: AttendanceStatus) => void;
  submitModificationRequest: (data: {
    requestType: RequestType;
    teacherId: string;
    teacherName: string;
    studentId: string;
    studentName: string;
    rollNumber: string;
    classId: string;
    className: string;
    dateOrExam: string;
    subjectCode?: string;
    originalValue: string;
    proposedValue: string;
    reason: string;
  }) => ModificationRequest;
  reviewModificationRequest: (requestId: string, status: RequestStatus, reviewerName: string, remarks?: string) => void;
  reviewAnomaly: (anomalyId: string, status: Anomaly['status'], reviewerName?: string, notes?: string) => void;
  runAiAnomalyScan: () => number;
  updateStudentMarks: (studentId: string, subjectCode: string, internal: number, external?: number) => void;
  getStudentMarkReport: (studentId: string) => StudentMarkReport | undefined;
  refreshData: () => void;
}

const ERPDataContext = createContext<ERPDataContextType | undefined>(undefined);

export const ERPDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { success, info } = useToast();
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-28');
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsOwnerId, setStudentsOwnerId] = useState<string | null>(null);
  const [requestsOwnerId, setRequestsOwnerId] = useState<string | null>(null);
  const [selectedParentStudentId, setSelectedParentStudentId] = useState<string | null>(null);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [requests, setRequests] = useState<ModificationRequest[]>([]);
  const [campusBlocks, setCampusBlocks] = useState<CampusBlockHeatmap[]>(CAMPUS_BLOCKS);

  const parentStudentsLoading = currentUser?.role === 'parent' && studentsOwnerId !== currentUser.id;
  const visibleStudents = parentStudentsLoading ? [] : students;
  const requestsLoading = Boolean(currentUser && requestsOwnerId !== currentUser.id);
  const visibleRequests = requestsLoading ? [] : requests;

  const refreshData = useCallback(async () => {
    try {
      const headers = authService.getAuthHeaders();
      const [studentsRes, classesRes, requestsRes, anomaliesRes] = await Promise.all([
        fetch('/api/academic/students', { headers }),
        fetch('/api/academic/classes', { headers }),
        fetch('/api/requests', { headers }),
        fetch('/api/anomalies', { headers })
      ]);
      if (!studentsRes.ok || !classesRes.ok || !requestsRes.ok || !anomaliesRes.ok) {
        throw new Error('Unable to load ERP data');
      }

      const [studentsData, classesData, requestsData, anomaliesData] = await Promise.all([
        studentsRes.json(),
        classesRes.json(),
        requestsRes.json(),
        anomaliesRes.json()
      ]);

      if (studentsData.success && Array.isArray(studentsData.data?.students)) {
        setStudents(studentsData.data.students);
        setStudentsOwnerId(currentUser?.id || null);
      }
      if (classesData.success && Array.isArray(classesData.data?.classes)) {
        setClasses(classesData.data.classes);
      }
      if (requestsData.success && Array.isArray(requestsData.data?.requests)) {
        setRequests(requestsData.data.requests);
        setRequestsOwnerId(currentUser?.id || null);
      }
      if (anomaliesData.success && Array.isArray(anomaliesData.data?.anomalies)) {
        setAnomalies(anomaliesData.data.anomalies);
      }
    } catch (err) {
      if (currentUser?.role === 'parent') {
        setStudents([]);
        setRequests([]);
        setStudentsOwnerId(currentUser.id);
        setRequestsOwnerId(currentUser.id);
        return;
      }

      const rawStudents = academicService.getStudents();
      const enrichedStudents = rawStudents.map((s) => {
        const stats = attendanceService.getStudentStats(s.id);
        return {
          ...s,
          fnAttendanceRate: stats.fnRate,
          anAttendanceRate: stats.anRate,
          overallAttendanceRate: stats.overallRate
        };
      });

      setStudents(enrichedStudents);
      setClasses(academicService.getClasses());
      setTeachers(academicService.getTeachers());
      setAnomalies(aiService.getAllAnomalies());
      setRequests(requestService.getAllRequests());
      setStudentsOwnerId(currentUser?.id || null);
      setRequestsOwnerId(currentUser?.id || null);
    }

    setTeachers(academicService.getTeachers());
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const visibleStudentIds = visibleStudents.map((student) => student.id).join('|');
  useEffect(() => {
    if (currentUser?.role !== 'parent') {
      setSelectedParentStudentId(null);
      return;
    }
    if (!parentStudentsLoading) {
      setSelectedParentStudentId((selectedId) =>
        selectedId && visibleStudents.some((student) => student.id === selectedId)
          ? selectedId
          : visibleStudents[0]?.id || null
      );
    }
  }, [currentUser?.id, currentUser?.role, parentStudentsLoading, visibleStudentIds]);

  const markAttendance = (
    studentId: string,
    date: string,
    session: SessionType,
    status: AttendanceStatus
  ) => {
    attendanceService.markStudentAttendance(studentId, date, session, status);
    // Optimistic UI update
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const stats = attendanceService.getStudentStats(s.id);
          return {
            ...s,
            fnAttendanceRate: stats.fnRate,
            anAttendanceRate: stats.anRate,
            overallAttendanceRate: stats.overallRate
          };
        }
        return s;
      })
    );
  };

  const bulkMarkAttendance = (
    studentIds: string[],
    date: string,
    session: SessionType,
    status: AttendanceStatus
  ) => {
    attendanceService.bulkMark(studentIds, date, session, status);
    refreshData();
    success(
      `Bulk Attendance Applied`,
      `Marked ${studentIds.length} students as ${status.toUpperCase()} for ${session} session on ${date}.`
    );
  };

  const submitModificationRequest = (data: {
    requestType: RequestType;
    teacherId: string;
    teacherName: string;
    studentId: string;
    studentName: string;
    rollNumber: string;
    classId: string;
    className: string;
    dateOrExam: string;
    subjectCode?: string;
    originalValue: string;
    proposedValue: string;
    reason: string;
  }) => {
    const newReq = requestService.createRequest(data);
    setRequests((prev) => [newReq, ...prev]);

    // Dispatch system notification to Principal
    notificationService.dispatch({
      targetRole: 'principal',
      title: 'New Modification Appeal Submitted',
      message: `${data.teacherName} submitted ${data.requestType.replace('_', ' ')} for ${data.studentName} (${data.rollNumber}). AI Safety: ${newReq.aiSafetyAssessment.safetyScore}%`,
      type: 'warning',
      linkAction: 'requests'
    });

    success(
      'Modification Request Submitted',
      `Locked record appeal forwarded to Principal. AI Safety Index calculated: ${newReq.aiSafetyAssessment.safetyScore}%.`
    );

    return newReq;
  };

  const reviewModificationRequest = (
    requestId: string,
    status: RequestStatus,
    reviewerName: string,
    remarks?: string
  ) => {
    const updated = requestService.updateRequestStatus(requestId, status, reviewerName, remarks);
    if (updated) {
      if (status === 'approved' && updated.requestType === 'attendance_correction') {
        const isPresent = updated.proposedValue.toLowerCase().includes('present') || updated.proposedValue.toLowerCase().includes('duty');
        const session: SessionType = updated.dateOrExam.includes('AN') ? 'AN' : 'FN';
        const dateMatch = updated.dateOrExam.match(/\d{4}-\d{2}-\d{2}/);
        const targetDate = dateMatch ? dateMatch[0] : '2026-09-26';

        attendanceService.markStudentAttendance(
          updated.studentId,
          targetDate,
          session,
          isPresent ? 'present' : 'excused',
          'Principal Authorization'
        );
      }

      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status, reviewedBy: reviewerName, reviewRemarks: remarks } : r))
      );

      notificationService.dispatch({
        targetRole: 'teacher',
        targetUserId: updated.teacherId,
        title: `Modification Request ${status.toUpperCase()}`,
        message: `Principal ${reviewerName} has ${status} the appeal for ${updated.studentName} (${updated.rollNumber}).`,
        type: status === 'approved' ? 'success' : 'alert',
        linkAction: 'requests'
      });

      if (status === 'approved') {
        success('Request Digitally Signed & Approved', `The academic record for ${updated.studentName} has been synchronized across all registers.`);
      } else {
        info('Request Rejected', `Appeal marked as rejected with administrative review remarks.`);
      }
    }
  };

  const reviewAnomaly = (
    anomalyId: string,
    status: Anomaly['status'],
    reviewerName?: string,
    notes?: string
  ) => {
    aiService.updateAnomalyStatus(anomalyId, status, reviewerName, notes);
    setAnomalies((prev) =>
      prev.map((a) => (a.id === anomalyId ? { ...a, status, reviewedBy: reviewerName, reviewNotes: notes } : a))
    );
    info('Anomaly Status Updated', `Anomaly record marked as ${status.replace('_', ' ')}.`);
  };

  const runAiAnomalyScan = (): number => {
    const detected = aiService.runAnomalyScan(students);
    if (detected.length > 0) {
      setAnomalies((prev) => [...detected, ...prev]);
      info(
        'AI Engine Scan Completed',
        `Discovered ${detected.length} session-skipping pattern(s) across academic registers.`
      );
    } else {
      success('AI Engine Scan Completed', 'No new critical anomalies or session disparities detected.');
    }
    return detected.length;
  };

  const updateStudentMarks = (
    studentId: string,
    subjectCode: string,
    internal: number,
    external?: number
  ) => {
    academicService.updateSubjectMark(studentId, subjectCode, internal, external);
    fetch(`/api/academic/marks/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectCode, internalObtained: internal, externalObtained: external })
    }).catch(() => {});
    refreshData();
    success('Marks Saved', `Updated assessment marks for subject ${subjectCode}.`);
  };

  const getStudentMarkReport = (studentId: string) => {
    return academicService.getMarksByStudent(studentId);
  };

  return (
    <ERPDataContext.Provider
      value={{
        students: visibleStudents,
        classes,
        teachers,
        anomalies,
        requests: visibleRequests,
        campusBlocks,
        selectedDate,
        setSelectedDate,
        selectedParentStudentId,
        setSelectedParentStudentId,
        parentStudentsLoading,
        markAttendance,
        bulkMarkAttendance,
        submitModificationRequest,
        reviewModificationRequest,
        reviewAnomaly,
        runAiAnomalyScan,
        updateStudentMarks,
        getStudentMarkReport,
        refreshData
      }}
    >
      {children}
    </ERPDataContext.Provider>
  );
};

export const useERPData = () => {
  const context = useContext(ERPDataContext);
  if (!context) {
    throw new Error('useERPData must be used within ERPDataProvider');
  }
  return context;
};
