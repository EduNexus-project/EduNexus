export type ERPUserRole = 'principal' | 'teacher' | 'parent';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: ERPUserRole;
  phone: string;
  department: string;
  avatar_url?: string;
  linked_student_id?: string;
  assigned_class_id?: string;
  school_name?: string;
  staff_id?: string;
}

export interface ERPClass {
  id: string;
  code: string;
  name: string;
  department: string;
  section: string;
  academic_year: string;
  total_students: number;
}

export interface StudentRecord {
  id: string;
  student_id: string;
  student_name: string;
  roll_no: number;
  class_id: string;
  class_name: string;
  parent_id: string;
  parent_name: string;
  parent_phone: string;
  parent_channel: 'WhatsApp' | 'SMS' | 'Push';
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  class_id: string;
  class_name: string;
  session_date: string;
  session_type: 'FN' | 'AN';
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string;
  recorded_by: string;
  created_at: string;
}

export interface MarkRecord {
  id: string;
  exam_id: string;
  exam_name: string;
  subject_id: string;
  subject_name: string;
  student_id: string;
  student_name: string;
  score: number;
  max_marks: number;
  grade: string;
  remarks?: string;
  updated_at: string;
}

export interface CorrectionRequest {
  id: string;
  request_code: string;
  teacher_id: string;
  teacher_name: string;
  record_type: 'mark' | 'attendance';
  target_id: string;
  student_id: string;
  student_name: string;
  course_or_date: string;
  original_value: string;
  proposed_value: string;
  original_score_num?: number;
  proposed_score_num?: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  risk_score: number;
  risk_category: 'Low' | 'Medium' | 'High';
  ai_explanation: string;
  supporting_factors: string[];
  suggested_action: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface AnomalyAlert {
  id: string;
  alert_type: 'TRUANCY_FN_AN_MISMATCH';
  student_id: string;
  student_name: string;
  class_name: string;
  alert_date: string;
  fn_status: 'Present';
  an_status: 'Absent';
  severity: 'HIGH' | 'CRITICAL';
  status: 'Active' | 'Under Review' | 'Resolved';
  explanation: string;
  created_at: string;
}

export interface ERPNotification {
  id: string;
  recipient_type: 'parent' | 'principal' | 'teacher';
  recipient_id: string;
  recipient_phone: string;
  channel: 'WhatsApp' | 'SMS' | 'Push';
  title: string;
  message: string;
  status: 'Delivered' | 'Pending' | 'Failed';
  latency_ms: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id?: string;
  details: string;
  timestamp: string;
}

export interface PrincipalSummaryStats {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  today_attendance_pct: number;
  fn_present: number;
  fn_total: number;
  an_present: number;
  an_total: number;
  present_count: number;
  absent_count: number;
  pending_count: number;
  active_anomalies_count: number;
  pending_corrections_count: number;
}

export interface SubjectRecord {
  id: string;
  class_id: string;
  code: string;
  name: string;
  teacher_id: string;
  teacher_name: string;
}

export interface ExamRecord {
  id: string;
  name: string;
  exam_type: 'Unit Test' | 'Midterm' | 'Final' | 'Project';
  class_id: string;
  max_marks: number;
  academic_year: string;
}
