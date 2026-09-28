import { supabase, isSupabaseConfigured } from '../config/supabase';
import { dbStore } from '../services/dbStore';

export interface AuditLogEntry {
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  previous_data?: Record<string, unknown> | null;
  new_data?: Record<string, unknown> | null;
  ip_address?: string | null;
}

export const createAuditLog = async (entry: AuditLogEntry): Promise<void> => {
  const fullEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...entry,
    created_at: new Date().toISOString(),
  };

  dbStore.auditLogs.unshift(fullEntry);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('audit_logs').insert([entry]);
    } catch (err: any) {
      console.warn('[Audit] Supabase log warning:', err.message);
    }
  }
};
