import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';

// GET /api/campus/blocks
export const getCampusBlocks = async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: { blocks: dbStore.campusBlocks },
      blocks: dbStore.campusBlocks,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/overview
export const getAnalyticsOverview = async (_req: Request, res: Response) => {
  try {
    const totalStudents = dbStore.students.length;
    const totalTeachers = dbStore.teachers.length;
    const totalClasses = dbStore.classes.length;

    const avgFn =
      totalStudents > 0
        ? Math.round((dbStore.students.reduce((acc, s) => acc + (s.fnAttendanceRate || 90), 0) / totalStudents) * 10) / 10
        : 90;
    const avgAn =
      totalStudents > 0
        ? Math.round((dbStore.students.reduce((acc, s) => acc + (s.anAttendanceRate || 90), 0) / totalStudents) * 10) / 10
        : 85;

    const activeAnomalies = dbStore.anomalies.filter(a => a.status === 'pending_review').length;
    const pendingRequests = dbStore.requests.filter(r => r.status === 'pending').length;

    res.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalClasses,
        averageFnRate: avgFn,
        averageAnRate: avgAn,
        activeAnomalies,
        pendingRequests,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/audit
export const getAuditLogs = async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: { logs: dbStore.auditLogs },
      logs: dbStore.auditLogs,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
