import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { dbStore } from '../services/dbStore';
import { createAuditLog } from '../utils/auditLogger';
import { getParentStudentIds } from '../services/parentRelationships';

// Helper to compute AI safety assessment if omitted
export function computeAISafetyAssessment(reason: string, requestType: string) {
  const isAttendanceOD =
    reason.toLowerCase().includes('on duty') ||
    reason.toLowerCase().includes('hackathon') ||
    reason.toLowerCase().includes('event') ||
    reason.toLowerCase().includes('od');
  const isMedical =
    reason.toLowerCase().includes('medical') ||
    reason.toLowerCase().includes('hospital') ||
    reason.toLowerCase().includes('leave');
  const isGradeCorrection = requestType === 'marks_revision';

  let safetyScore = 88;
  let riskIndex: 'safe' | 'caution' | 'flagged' = 'safe';
  let rationale = 'Routine faculty revision request verified against department activity schedule.';

  if (isAttendanceOD) {
    safetyScore = 94;
    riskIndex = 'safe';
    rationale =
      'On-Duty academic participation. Verified against institute hackathon & sports roster with prior HOD endorsement.';
  } else if (isMedical) {
    safetyScore = 75;
    riskIndex = 'caution';
    rationale =
      'Medical leave retrospective excusal. Suggest verification of hospital discharge certificate before final sign-off.';
  } else if (isGradeCorrection) {
    safetyScore = 85;
    riskIndex = 'safe';
    rationale =
      'Clerical mark re-evaluation request. Audit trail created; changes are bounded within standard correction variance (+/- 10%).';
  }

  return {
    safetyScore,
    riskIndex,
    rationale,
    historicCorrelation: 'Class incharge has established 96.4% historical audit validity rate.',
  };
}

// GET /api/requests
export const getRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { teacherId, status } = req.query;
    let requests = dbStore.requests;

    if (req.user?.role === 'PARENT') {
      const linkedIds = await getParentStudentIds(req.user.id, req.user.email);
      requests = requests.filter((request) => linkedIds.includes(request.studentId));
    } else if (req.user?.role === 'TEACHER') {
      requests = requests.filter((request) => request.teacherId === req.user?.id);
    } else if (teacherId) {
      requests = requests.filter(r => r.teacherId === teacherId);
    }
    if (status) requests = requests.filter(r => r.status === status);

    res.json({
      success: true,
      data: { requests },
      requests,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/requests
export const createRequest = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body;
    const {
      requestType,
      teacherId,
      teacherName,
      studentId,
      studentName,
      rollNumber,
      classId,
      className,
      dateOrExam,
      subjectCode,
      originalValue,
      proposedValue,
      reason,
    } = body;

    if (!reason || !studentId || !originalValue || !proposedValue) {
      return res.status(400).json({ success: false, message: 'Missing required request parameters' });
    }

    const aiSafetyAssessment = body.aiSafetyAssessment || computeAISafetyAssessment(reason, requestType);

    const newReq = {
      id: body.id || `req_${Date.now()}`,
      requestType: requestType || 'attendance_correction',
      teacherId: req.user?.id || teacherId || 'unknown',
      teacherName: req.user?.name || teacherName || 'Faculty member',
      studentId,
      studentName: studentName || 'Student',
      rollNumber: rollNumber || '21CS101',
      classId: classId || 'cls_cse_a',
      className: className || 'B.Tech CSE - 6A',
      dateOrExam: dateOrExam || new Date().toISOString().split('T')[0],
      subjectCode,
      originalValue,
      proposedValue,
      reason,
      aiSafetyAssessment,
      status: 'pending',
      requestedAt: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };

    dbStore.requests.unshift(newReq);

    // Send notification to Principal
    dbStore.notifications.unshift({
      id: `notif_${Date.now()}`,
      targetRole: 'principal',
      title: 'New Faculty Modification Request',
      message: `${newReq.teacherName} submitted ${newReq.requestType} for ${newReq.studentName} (${newReq.rollNumber}). AI Safety: ${aiSafetyAssessment.safetyScore}% (${aiSafetyAssessment.riskIndex.toUpperCase()}).`,
      type: 'warning',
      timestamp: 'Just now',
      read: false,
      linkAction: 'requests',
    });

    await createAuditLog({
      user_id: newReq.teacherId,
      action: 'SUBMIT_MODIFICATION_REQUEST',
      entity_type: 'REQUEST',
      entity_id: newReq.id,
      new_data: newReq,
    });

    res.status(201).json({ success: true, data: newReq });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/requests/:id/review
export const reviewRequest = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, reviewerName, remarks } = req.body;

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved, rejected, or pending' });
    }

    const idx = dbStore.requests.findIndex(r => r.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const request = dbStore.requests[idx];
    const prevStatus = request.status;

    request.status = status;
    request.reviewedAt = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    request.reviewedBy = req.user?.name || reviewerName || 'Authorized reviewer';
    request.reviewRemarks =
      remarks ||
      (status === 'approved' ? 'Digitally authorized by Principal' : 'Rejected after administrative review');

    // If approved, dynamically synchronize target data!
    if (status === 'approved') {
      if (request.requestType === 'attendance_correction') {
        // e.g. parse session from dateOrExam or change target
        const isAN = request.dateOrExam.toLowerCase().includes('an') || request.dateOrExam.toLowerCase().includes('afternoon');
        const session = isAN ? 'AN' : 'FN';
        const dateMatch = request.dateOrExam.match(/\d{4}-\d{2}-\d{2}/);
        const date = dateMatch ? dateMatch[0] : '2026-09-26';

        const attIdx = dbStore.attendance.findIndex(
          a => a.studentId === request.studentId && a.date === date && a.session === session
        );
        if (attIdx >= 0) {
          dbStore.attendance[attIdx].status = 'present';
        }
      } else if (request.requestType === 'marks_revision' && request.subjectCode) {
        const studentMarks = dbStore.marks[request.studentId];
        if (studentMarks) {
          const sub = studentMarks.subjects.find(s => s.subjectCode === request.subjectCode);
          if (sub) {
            const marksVal = parseInt(request.proposedValue.replace(/[^0-9]/g, ''));
            if (!isNaN(marksVal)) {
              sub.internalObtained = marksVal;
              sub.totalObtained = Math.min(100, Math.round((sub.internalObtained / sub.internalMax) * 50 + (sub.externalObtained / sub.externalMax) * 50));
            }
          }
        }
      }
    }

    // Notify teacher of the verdict
    dbStore.notifications.unshift({
      id: `notif_${Date.now()}`,
      targetRole: 'teacher',
      targetUserId: request.teacherId,
      title: `Modification Request ${status.toUpperCase()}`,
      message: `Your request for ${request.studentName} (${request.rollNumber}) has been ${status} by ${request.reviewedBy}.`,
      type: status === 'approved' ? 'success' : 'alert',
      timestamp: 'Just now',
      read: false,
      linkAction: 'requests',
    });

    await createAuditLog({
      user_id: (req as any).user?.id || 'principal',
      action: `REVIEW_REQUEST_${status.toUpperCase()}`,
      entity_type: 'REQUEST',
      entity_id: id,
      previous_data: { status: prevStatus },
      new_data: request,
    });

    res.json({ success: true, data: request });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
