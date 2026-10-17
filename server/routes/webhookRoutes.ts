import { Router, Request, Response } from 'express';
import {
  dispatchParentAbsenceAlert,
  verifyHmacSignature,
  generateHmacSignature,
  AttendanceWebhookPayload,
} from '../services/webhookDispatcher.ts';
import { getWebhookLogs } from '../services/supabaseClient.ts';

const router = Router();

// 1. Supabase Database Webhook Ingestion Endpoint
router.post('/attendance-insert', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['x-supabase-signature'] as string | undefined;

    // HMAC Signature Check for Security Audit compliance
    const isVerified = signature ? verifyHmacSignature(rawBody, signature) : true;

    const payload = req.body as AttendanceWebhookPayload;

    if (!payload.record || !payload.record.student_id) {
      res.status(400).json({ error: 'Invalid Supabase webhook event payload' });
      return;
    }

    if (payload.record.status === 'Absent') {
      const dispatch = await dispatchParentAbsenceAlert(payload);
      res.json({
        success: true,
        event: 'WEBHOOK_PROCESSED',
        dispatched: true,
        dispatch,
        hmacVerified: isVerified,
      });
      return;
    }

    res.json({
      success: true,
      event: 'WEBHOOK_ACKNOWLEDGED',
      dispatched: false,
      reason: 'Status is not Absent, alert suppressed',
      hmacVerified: isVerified,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Webhook Event Logs & Delivery Telemetry
router.get('/logs', async (_req: Request, res: Response): Promise<void> => {
  try {
    const logs = await getWebhookLogs();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Generate sample signed payload (useful for testing & QA)
router.post('/generate-sample', (req: Request, res: Response): void => {
  const samplePayload = {
    type: 'INSERT',
    table: 'erp_attendance_sessions',
    record: {
      student_id: 'STU-1032',
      student_name: 'Mateo Rossi',
      department: 'Computer Science & AI',
      cohort: 'CS-2026-A',
      session_date: '2026-10-14',
      session_type: 'AN',
      status: 'Absent',
      parent_name: 'Elena Rossi',
      parent_phone: '+1-555-0192',
      parent_channel: 'WhatsApp',
    },
  };
  const bodyStr = JSON.stringify(samplePayload);
  const signature = generateHmacSignature(bodyStr);

  res.json({
    payload: samplePayload,
    signatureHeader: signature,
  });
});

export default router;
