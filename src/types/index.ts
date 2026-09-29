export type UserRole = 'principal' | 'teacher' | 'parent';
export type ParentRelationship = 'father' | 'mother' | 'guardian';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  designation?: string;
  phone?: string;
  relationship?: ParentRelationship;
  studentIds?: string[];
  studentId?: string;
  studentName?: string;
}

export type SessionType = 'FN' | 'AN'; // Forenoon (09:00 - 12:45) vs Afternoon (01:30 - 04:30)
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  session: SessionType;
  status: AttendanceStatus;
  subjectCode?: string;
  markedBy: string; // teacherId
  markedAt: string;
  notes?: string;
}

export interface Student {
  id: string;
  studentId?: string;
  rollNumber: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  avatar: string;
  classId: string;
  className: string;
  section: string;
  department: string;
  semester: number;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  parentRelationship?: ParentRelationship;
  fnAttendanceRate: number; // percentage
  anAttendanceRate: number; // percentage
  overallAttendanceRate: number; // percentage
  academicCgpa: number;
  riskLevel: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface Teacher {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  designation: string;
  phone: string;
  assignedClasses: string[]; // classIds
  subjectsTaught: string[];
}

export interface AcademicClass {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  section: string;
  classTeacherId: string;
  classTeacherName: string;
  totalStudents: number;
  todaysFnRate: number;
  todaysAnRate: number;
  overallRate: number;
  roomNumber: string;
  block: string; // e.g. 'Ramanujan Block'
}

export interface SubjectMarks {
  subjectCode: string;
  subjectName: string;
  credits: number;
  internalMax: number;
  internalObtained: number;
  externalMax: number;
  externalObtained: number;
  totalMax: number;
  totalObtained: number;
  grade: string;
  status: 'passed' | 'failed' | 'withheld';
}

export interface StudentMarkReport {
  studentId: string;
  studentName: string;
  rollNumber: string;
  semester: number;
  examTerm: 'Mid-Term 1' | 'Mid-Term 2' | 'Semester End';
  subjects: SubjectMarks[];
  totalCredits: number;
  gpa: number;
  locked: boolean;
}

export type AnomalyType =
  | 'session_skip'         // Present in FN, Absent in AN
  | 'sudden_drop'          // Dropped >20% in 14 days
  | 'consecutive_streak'   // 3+ consecutive full-day absences
  | 'friday_pattern'       // Repeatedly absent on Friday afternoons
  | 'grade_disparity';     // High attendance but acute grade dip

export interface Anomaly {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  classId: string;
  className: string;
  type: AnomalyType;
  riskLevel: 'low' | 'medium' | 'high';
  confidenceScore: number; // 0 - 100
  title: string;
  description: string;
  detectedAt: string;
  evidence: string;
  status: 'pending_review' | 'reviewed' | 'resolved' | 'escalated';
  reviewedBy?: string;
  reviewNotes?: string;
  aiSuggestedAction?: string;
}

export type RequestType = 'attendance_correction' | 'marks_revision';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface ModificationRequest {
  id: string;
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
  aiSafetyAssessment: {
    safetyScore: number; // 0 - 100
    riskIndex: 'safe' | 'caution' | 'flagged';
    rationale: string;
    historicCorrelation: string;
  };
  status: RequestStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewRemarks?: string;
}

export interface CampusBlockHeatmap {
  id: string;
  name: string;
  code: string;
  fnAttendanceRate: number;
  anAttendanceRate: number;
  occupancyRate: number;
  totalStudents: number;
  departments: string[];
  anomaliesDetected: number;
  position: [number, number, number]; // 3D coordinates (x, y, z)
  dimensions: [number, number, number]; // width, height, depth
  colorHex: string;
}

export interface NotificationItem {
  id: string;
  targetRole: UserRole | 'all';
  targetUserId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  timestamp: string;
  read: boolean;
  linkAction?: string;
}

export interface AIParentDigest {
  studentId: string;
  studentName: string;
  generatedAt: string;
  fnAttendanceRate: number;
  anAttendanceRate: number;
  compositeScore: number;
  executiveSummary: string;
  academicStrengths: string[];
  attendanceConcerns: string[];
  recommendedInterventions: string[];
  afternoonDepartureAlert?: {
    date: string;
    leftEarly: boolean;
    session: 'AN';
  };
}
