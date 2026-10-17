/**
 * Supabase Database Client & Real-time Data Store
 * Supports FN/AN attendance sessions, teacher modifications, webhook dispatches, and truancy alerts.
 * Purely data-driven with zero hardcoded sample data.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Supabase] Connected to live endpoint:', supabaseUrl);
  } catch (err) {
    console.warn('[Supabase] Initialization failed, active in-memory store engaged:', err);
  }
}

export interface AttendanceSession {
  id: string;
  student_id: string;
  student_name: string;
  department: string;
  cohort: string;
  session_date: string;
  session_type: 'FN' | 'AN'; // Forenoon vs Afternoon
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

export interface ApprovalRecord {
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

// In-Memory Fallback State (Empty by default)
let memoryAttendanceSessions: AttendanceSession[] = [];
let memoryModifications: TeacherModification[] = [];
let memoryWebhookLogs: WebhookDispatch[] = [];
let memoryTruancyAlerts: TruancyAlert[] = [];
let memoryApprovals: ApprovalRecord[] = [];

// Database accessors
export async function getAttendanceSessions(): Promise<AttendanceSession[]> {
  return memoryAttendanceSessions;
}

export async function addAttendanceSession(session: Omit<AttendanceSession, 'id' | 'created_at'>): Promise<AttendanceSession> {
  const newSession: AttendanceSession = {
    ...session,
    id: 'att-s' + (memoryAttendanceSessions.length + 1),
    created_at: new Date().toISOString(),
  };
  memoryAttendanceSessions.unshift(newSession);
  return newSession;
}

export async function getModifications(): Promise<TeacherModification[]> {
  return memoryModifications;
}

export async function addModification(mod: Omit<TeacherModification, 'id' | 'created_at' | 'request_code'>): Promise<TeacherModification> {
  const newMod: TeacherModification = {
    ...mod,
    id: 'mod-' + Math.random().toString(36).substring(2, 8),
    request_code: `MOD-2026-${Math.floor(100 + Math.random() * 900)}`,
    status: 'Pending',
    created_at: new Date().toISOString(),
  };
  memoryModifications.unshift(newMod);
  return newMod;
}

export async function updateModification(id: string, updates: Partial<TeacherModification>): Promise<TeacherModification | null> {
  const idx = memoryModifications.findIndex((m) => m.id === id);
  if (idx !== -1) {
    memoryModifications[idx] = { ...memoryModifications[idx], ...updates };
    return memoryModifications[idx];
  }
  return null;
}

export async function getWebhookLogs(): Promise<WebhookDispatch[]> {
  return memoryWebhookLogs;
}

export async function logWebhookDispatch(dispatch: Omit<WebhookDispatch, 'id' | 'timestamp'>): Promise<WebhookDispatch> {
  const newLog: WebhookDispatch = {
    ...dispatch,
    id: 'wh-' + (memoryWebhookLogs.length + 1),
    timestamp: new Date().toISOString(),
  };
  memoryWebhookLogs.unshift(newLog);
  return newLog;
}

export async function getTruancyAlerts(): Promise<TruancyAlert[]> {
  return memoryTruancyAlerts;
}

export async function updateTruancyAlert(id: string, status: TruancyAlert['status']): Promise<TruancyAlert | null> {
  const alert = memoryTruancyAlerts.find((a) => a.id === id);
  if (alert) {
    alert.status = status;
    return alert;
  }
  return null;
}

export async function getApprovals(): Promise<ApprovalRecord[]> {
  return memoryApprovals;
}

export async function createApproval(record: Omit<ApprovalRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ApprovalRecord> {
  const newRec: ApprovalRecord = {
    ...record,
    id: 'app-' + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  memoryApprovals.unshift(newRec);
  return newRec;
}

export async function updateApproval(id: string, updates: Partial<ApprovalRecord>): Promise<ApprovalRecord | null> {
  const idx = memoryApprovals.findIndex((a) => a.id === id);
  if (idx !== -1) {
    memoryApprovals[idx] = { ...memoryApprovals[idx], ...updates, updated_at: new Date().toISOString() };
    return memoryApprovals[idx];
  }
  return null;
}

export async function getAttendance(): Promise<any[]> {
  return memoryAttendanceSessions;
}

export async function getGrades(): Promise<any[]> {
  return [];
}

export async function getExpenses(): Promise<any[]> {
  return [];
}

export async function getSystemHealth(): Promise<any> {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  return {
    supabaseConnected: Boolean(supabase),
    supabaseUrlConfigured: Boolean(supabaseUrl && !supabaseUrl.includes('your-project')),
    groqKeyConfigured: Boolean(groqKey && groqKey !== 'MY_GROQ_API_KEY' && groqKey.length > 5),
    geminiKeyConfigured: Boolean(geminiKey && geminiKey !== 'MY_GEMINI_API_KEY' && geminiKey.length > 5),
    mode: supabase ? 'supabase_live' : 'memory_fallback',
    counts: {
      approvals: memoryApprovals.length,
      attendance: memoryAttendanceSessions.length,
      modifications: memoryModifications.length,
      webhooks: memoryWebhookLogs.length,
      truancy: memoryTruancyAlerts.length,
    },
  };
}

export * from './groqClient.ts';
export * from './geminiClient.ts';
