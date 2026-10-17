import { Router, Request, Response } from 'express';
import {
  getModifications,
  updateModification,
  getTruancyAlerts,
  updateTruancyAlert,
} from '../services/supabaseClient.ts';
import { scoreTeacherModification } from '../services/modificationScorer.ts';
import { analyzeTruancyPatterns } from '../services/truancyEngine.ts';

const router = Router();

// 1. Dynamic AI Insights Banner for Principal Dashboard
router.get('/dashboard-insights', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [truancyResult, modifications] = await Promise.all([
      analyzeTruancyPatterns(),
      getModifications(),
    ]);

    const pendingMods = modifications.filter((m) => m.status === 'Pending');
    const batchSafeMods = pendingMods.filter((m) => (m.risk_score !== undefined && m.risk_score < 30) || m.ai_recommendation === 'APPROVE_MODIFICATION');

    res.json({
      truancyAnomalies: truancyResult.detected_anomalies,
      truancyCount: truancyResult.unauthorized_departure_count,
      pendingModificationsCount: pendingMods.length,
      batchSafeModificationsCount: batchSafeMods.length,
      batchSafeIds: batchSafeMods.map((m) => m.id),
      systemIntegrity: truancyResult.unauthorized_departure_count > 0 ? 'ALERT_UNAUTHORIZED_DEPARTURE' : 'OPTIMAL',
      bannerHeadline: truancyResult.unauthorized_departure_count > 0
        ? `SECURITY ALERT: ${truancyResult.unauthorized_departure_count} Unauthorized Mid-Day Departure(s) Detected (FN Present → AN Absent)`
        : 'All Campus Checkpoints Synchronized • 0 Truancy Anomalies Detected',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Teacher Modifications List
router.get('/modifications', async (_req: Request, res: Response): Promise<void> => {
  try {
    const list = await getModifications();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. AI Score Teacher Modification Request
router.post('/modifications/score', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.body;
    const modifications = await getModifications();
    const mod = modifications.find((m) => m.id === id);

    if (!mod) {
      res.status(404).json({ error: 'Modification request not found' });
      return;
    }

    const scoring = await scoreTeacherModification(mod);

    const updated = await updateModification(id, {
      risk_score: scoring.risk_score,
      confidence_score: scoring.confidence_score,
      ai_recommendation: scoring.ai_recommendation,
      pattern_analysis: scoring.pattern_analysis,
    });

    res.json({ ...scoring, record: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Principal Decision on Modification (Approve / Reject)
router.post('/modifications/:id/decision', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { decision } = req.body; // 'Approved' | 'Rejected' | 'Escalated'

    const updated = await updateModification(id, {
      status: decision,
    });

    if (!updated) {
      res.status(404).json({ error: 'Modification request not found' });
      return;
    }

    res.json({ success: true, record: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Principal Batch Approval Execution
router.post('/batch-approve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body; // string[]
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'Valid array of modification IDs required' });
      return;
    }

    const approvedList = [];
    for (const id of ids) {
      const updated = await updateModification(id, { status: 'Approved' });
      if (updated) approvedList.push(updated);
    }

    res.json({
      success: true,
      count: approvedList.length,
      approvedRecords: approvedList,
      message: `Successfully batch-approved ${approvedList.length} low-risk teacher modification requests with high AI confidence.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Truancy Alerts & Marshal Actions
router.get('/truancy-alerts', async (_req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await getTruancyAlerts();
    res.json(alerts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/truancy/:id/action', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'Security Dispatched' | 'Guardian Contacted' | 'Resolved'

    const updated = await updateTruancyAlert(id, action);
    res.json({ success: true, alert: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
