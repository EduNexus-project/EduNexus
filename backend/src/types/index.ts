// Shared types for EduNexus backend

export type UserRole = 'PRINCIPAL' | 'TEACHER' | 'PARENT';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  name: string;
  avatar?: string;
  phone?: string;
  relationship?: 'father' | 'mother' | 'guardian';
  studentIds?: string[];
  studentId?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  student_code: string | null;
  name: string;
  roll_number: string;
  section: string | null;
  class_id: string | null;
  date_of_birth: string | null;
  gender: string | null;
  email: string | null;
  phone: string | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  parent_relationship: 'father' | 'mother' | 'guardian' | null;
  address: string | null;
  relationship?: 'father' | 'mother' | 'guardian';
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  name: string;
  employee_id: string;
  department: string | null;
  phone: string | null;
  qualification: string | null;
  created_at: string;
  updated_at: string;
}

export interface Parent {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  occupation: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  name: string;
  section: string | null;
  academic_year: string | null;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface TeacherClass {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
}

export type AttendanceSession = 'FN' | 'AN';
export type AttendanceStatus = 'Present' | 'Absent';

export interface Attendance {
  id: string;
  student_id: string;
  date: string;
  session: AttendanceSession;
  status: AttendanceStatus;
  recorded_by: string | null;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export type CorrectionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AttendanceCorrectionRequest {
  id: string;
  attendance_id: string;
  requested_by: string;
  student_id: string;
  date: string;
  session: string;
  previous_status: string;
  requested_status: string;
  reason: string;
  status: CorrectionStatus;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface Exam {
  id: string;
  name: string;
  class_id: string | null;
  subject_id: string | null;
  date: string;
  max_score: number;
  exam_type: string | null;
  created_at: string;
}

export interface Mark {
  id: string;
  student_id: string;
  exam_id: string;
  subject_id: string;
  score: number;
  max_score: number;
  grade: string | null;
  remarks: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AnomalyRecord {
  id: string;
  student_id: string;
  type: string;
  description: string | null;
  risk_level: RiskLevel | null;
  confidence_score: number | null;
  is_reviewed: boolean;
  reviewed_by: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  previous_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// Express request extension for authenticated requests
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}
