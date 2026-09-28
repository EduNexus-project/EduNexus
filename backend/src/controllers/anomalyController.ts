import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';
import { computeStudentAttendanceStats } from './attendanceController';
import { createAuditLog } from '../utils/auditLogger';

// GET /api/anomalies
export const getAnomalies = async (req: Request, res: Response) => {
  try {
    const { status, studentId } = req.query;
    let anomalies = dbStore.anomalies;

    if (status) anomalies = anomalies.filter(a => a.status === status);
    if (studentId) anomalies = anomalies.filter(a => a.studentId === studentId);

    res.json({
      success: true,
      data: { anomalies },
      anomalies,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/anomalies/student/:studentId
export const getStudentAnomalies = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId as string;
    const anomalies = dbStore.anomalies.filter(a => a.studentId === studentId);
    res.json({ success: true, data: anomalies });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/anomalies/:id
export const updateAnomalyStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, reviewerName, notes } = req.body;

    const idx = dbStore.anomalies.findIndex(a => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Anomaly record not found' });
    }

    const prev = { ...dbStore.anomalies[idx] };
    dbStore.anomalies[idx] = {
      ...dbStore.anomalies[idx],
      status: status || dbStore.anomalies[idx].status,
      reviewedBy: reviewerName || 'Dr. Ramesh Sundaram (Principal)',
      reviewNotes: notes || dbStore.anomalies[idx].reviewNotes,
    };

    await createAuditLog({
      user_id: (req as any).user?.id || 'principal',
      action: 'UPDATE_ANOMALY_STATUS',
      entity_type: 'ANOMALY',
      entity_id: id,
      previous_data: prev,
      new_data: dbStore.anomalies[idx],
    });

    res.json({ success: true, data: dbStore.anomalies[idx] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/anomalies/scan
export const runAnomalyScan = async (req: Request, res: Response) => {
  try {
    const newlyDetected: any[] = [];

    dbStore.students.forEach(s => {
      const stats = computeStudentAttendanceStats(s.id);

      if (stats.afternoonDropCount >= 2 || stats.fnRate - stats.anRate >= 15) {
        const existing = dbStore.anomalies.find(a => a.studentId === s.id && a.type === 'session_skip');
        if (!existing) {
          const freshAnomaly = {
            id: `anom_${Date.now()}_${s.id}`,
            studentId: s.id,
            studentName: s.name,
            rollNumber: s.rollNumber,
            classId: s.classId,
            className: s.className,
            type: 'session_skip',
            riskLevel: stats.fnRate - stats.anRate > 20 ? 'high' : 'medium',
            confidenceScore: 92,
            title: 'Dual-Session Disparity: Afternoon Drop Detected',
            description: `${s.name} recorded ${stats.fnRate}% Forenoon attendance, but drops sharply to ${stats.anRate}% during Afternoon practical sessions.`,
            detectedAt: 'Just now (Live Scan)',
            evidence: `Forenoon rate: ${stats.fnRate}% | Afternoon rate: ${stats.anRate}%. Detected ${stats.afternoonDropCount} session departures.`,
            status: 'pending_review',
            aiSuggestedAction: 'Notify Guardian via SMS and schedule faculty mentor check-in.',
          };
          dbStore.anomalies.unshift(freshAnomaly);
          newlyDetected.push(freshAnomaly);
        }
      }
    });

    await createAuditLog({
      user_id: (req as any).user?.id || 'system',
      action: 'RUN_AI_ANOMALY_SCAN',
      entity_type: 'ANOMALY_SCAN',
      new_data: { newlyDetectedCount: newlyDetected.length },
    });

    res.json({
      success: true,
      message: `Anomaly scan complete. ${newlyDetected.length} new anomalies detected.`,
      data: {
        newlyDetectedCount: newlyDetected.length,
        newAnomalies: newlyDetected,
        allAnomalies: dbStore.anomalies,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
