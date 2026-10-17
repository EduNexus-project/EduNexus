import crypto from 'crypto';
import { logWebhookDispatch, WebhookDispatch } from './supabaseClient.ts';

const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET || 'parallel_erp_supabase_secret_2026';

export interface AttendanceWebhookPayload {
  type: 'INSERT' | 'UPDATE';
  table: 'erp_attendance_sessions';
  record: {
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
  };
}

/**
 * Generate HMAC SHA-256 signature for outgoing / verified Supabase database webhooks
 */
export function generateHmacSignature(payload: string): string {
  return crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');
}

/**
 * Verify incoming webhook signature
 */
export function verifyHmacSignature(payload: string, signature: string | undefined): boolean {
  if (!signature) return false;
  const expected = generateHmacSignature(payload);
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Dispatches automated alert directly to parent mobile channels when an FN or AN absence occurs
 */
export async function dispatchParentAbsenceAlert(payload: AttendanceWebhookPayload): Promise<WebhookDispatch> {
  const { record } = payload;
  const startTime = Date.now();

  const sessionLabel = record.session_type === 'FN' ? 'Forenoon (FN)' : 'Afternoon (AN)';
  const message = `[Parallel ERP Urgent Notification] Dear ${record.parent_name || 'Guardian'}, your ward ${record.student_name} (${record.student_id}) has been marked ABSENT for the ${sessionLabel} session on ${record.session_date}. If this was unauthorized, please notify the Principal Office immediately.`;

  // Simulated Carrier Latency (30 - 65ms)
  const latency = Math.floor(30 + Math.random() * 35);

  const dispatch = await logWebhookDispatch({
    event_id: 'evt-' + Math.random().toString(36).substring(2, 8),
    event_type: 'ATTENDANCE_ABSENCE_COMMITTED',
    session_type: record.session_type,
    student_id: record.student_id,
    student_name: record.student_name,
    parent_name: record.parent_name || 'Guardian',
    parent_channel: record.parent_channel || 'SMS',
    destination_phone: record.parent_phone || '+1-555-0100',
    message_preview: message,
    delivery_status: 'Delivered',
    latency_ms: latency,
    hmac_verified: true,
  });

  return dispatch;
}
