export interface ApprovalItem {
  id: string;
  request_code: string;
  title: string;
  category: string;
  requested_by: string;
  department: string;
  amount: number;
  currency: string;
  description: string;
  justification: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Escalated';
  risk_score?: number;
  confidence_score?: number;
  policy_violations?: string[];
  ai_recommendation?: 'APPROVE' | 'REJECT' | 'ESCALATE';
  ai_analysis_summary?: string;
  ai_provider_used?: 'groq' | 'gemini';
  created_at: string;
  updated_at: string;
}

export interface AttendanceItem {
  id: string;
  student_or_staff_id: string;
  name: string;
  role: 'Student' | 'Faculty' | 'Staff';
  department: string;
  cohort: string;
  session_date: string;
  attendance_status: 'Present' | 'Absent' | 'Excused' | 'Late';
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  student_id: string;
  student_name: string;
  department: string;
  cohort: string;
  session_date: string;
  session_type: 'FN' | 'AN';
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  parent_name: string;
  parent_phone: string;
  parent_channel: 'SMS' | 'WhatsApp' | 'Push';
  building_zone?: string;
  created_at: string;
}

export interface TeacherModification {
  id: string;
  request_code: string;
  teacher_id: string;
  teacher_name: string;
  department: string;
  student_id: string;
  student_name: string;
  course_code: string;
  course_name: string;
  modification_type: 'Grade Adjustment' | 'Attendance Override' | 'Exam Re-evaluation';
  previous_value: string;
  proposed_value: string;
  previous_score_num?: number;
  proposed_score_num?: number;
  class_average: number;
  student_historical_average: number;
  justification: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Escalated';
  risk_score?: number;
  confidence_score?: number;
  ai_recommendation?: 'APPROVE_MODIFICATION' | 'REJECT_MODIFICATION' | 'REQUEST_AUDIT_TRAIL';
  pattern_analysis?: string;
  ai_provider_used?: 'gemini' | 'groq';
  created_at: string;
}

export interface WebhookDispatch {
  id: string;
  event_id: string;
  event_type: 'ATTENDANCE_ABSENCE_COMMITTED';
  session_type: 'FN' | 'AN';
  student_id: string;
  student_name: string;
  parent_name: string;
  parent_channel: 'SMS' | 'WhatsApp' | 'Push';
  destination_phone: string;
  message_preview: string;
  delivery_status: 'Delivered' | 'Pending' | 'Failed';
  latency_ms: number;
  hmac_verified: boolean;
  timestamp: string;
}

export interface TruancyAlert {
  id: string;
  student_id: string;
  student_name: string;
  cohort: string;
  department: string;
  alert_date: string;
  fn_status: 'Present';
  an_status: 'Absent';
  risk_level: 'CRITICAL' | 'HIGH' | 'MODERATE';
  parent_phone: string;
  parent_name: string;
  last_seen_zone: string;
  ai_security_brief: string;
  status: 'Active Alert' | 'Security Dispatched' | 'Guardian Contacted' | 'Resolved';
  timestamp: string;
}

export interface GradeItem {
  id: string;
  student_id: string;
  student_name: string;
  cohort: string;
  course_code: string;
  course_name: string;
  assessment_type: string;
  grade_score: number;
  max_score: number;
  letter_grade: string;
  semester: string;
}

export interface ExpenseItem {
  id: string;
  expense_code: string;
  department: string;
  budget_category: string;
  allocated_budget: number;
  spent_amount: number;
  fiscal_quarter: string;
  variance: number;
}

export interface AIScoringResult {
  risk_score: number;
  confidence_score: number;
  policy_violations: string[];
  ai_recommendation: 'APPROVE' | 'REJECT' | 'ESCALATE';
  ai_analysis_summary: string;
  ai_provider_used: 'groq' | 'gemini';
  model_used?: string;
}

export interface AISummaryResult {
  headline: string;
  executive_summary: string;
  key_findings: string[];
  anomalies_detected: string[];
  action_items: string[];
  health_rating: 'EXCELLENT' | 'STABLE' | 'ATTENTION_REQUIRED' | 'CRITICAL';
  ai_provider_used: 'groq' | 'gemini';
  model_used?: string;
}

export interface SystemStatus {
  supabaseConnected: boolean;
  supabaseUrlConfigured: boolean;
  groqKeyConfigured: boolean;
  geminiKeyConfigured: boolean;
  mode: 'supabase_live' | 'memory_fallback';
  counts: {
    approvals: number;
    attendance: number;
    grades: number;
    expenses: number;
  };
}
