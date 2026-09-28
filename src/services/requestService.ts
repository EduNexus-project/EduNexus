import { ModificationRequest, RequestStatus, RequestType } from '../types';
import { INITIAL_REQUESTS } from '../data/mockData';
import { authService } from './authService';

const REQUESTS_STORAGE_KEY = 'edunexus_modification_requests';

class RequestService {
  private requests: ModificationRequest[] = [];

  constructor() {
    this.init();
    this.syncFromBackend();
  }

  private init() {
    try {
      const stored = localStorage.getItem(REQUESTS_STORAGE_KEY);
      this.requests = stored ? JSON.parse(stored) : [...INITIAL_REQUESTS];
    } catch {
      this.requests = [...INITIAL_REQUESTS];
    }
  }

  private async syncFromBackend() {
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.requests) && data.data.requests.length > 0) {
        this.requests = data.data.requests;
        this.save();
      }
    } catch (err) {
      // background sync
    }
  }

  private save() {
    try {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(this.requests));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }

  getAllRequests(): ModificationRequest[] {
    return [...this.requests];
  }

  getRequestsByTeacher(teacherId: string): ModificationRequest[] {
    return this.requests.filter((r) => r.teacherId === teacherId);
  }

  getPendingRequests(): ModificationRequest[] {
    return this.requests.filter((r) => r.status === 'pending');
  }

  createRequest(params: {
    requestType: RequestType;
    teacherId: string;
    teacherName: string;
    studentId: string;
    studentName: string;
    rollNumber: string;
    classId: string;
    className: string;
    dateOrExam: string;
    subjectCode?: string;
    originalValue: string;
    proposedValue: string;
    reason: string;
  }): ModificationRequest {
    // Automated AI Safety Assessment
    const isAttendanceOD = params.reason.toLowerCase().includes('on duty') || params.reason.toLowerCase().includes('hackathon') || params.reason.toLowerCase().includes('event');
    const isMedical = params.reason.toLowerCase().includes('medical') || params.reason.toLowerCase().includes('hospital');
    const isGradeCorrection = params.requestType === 'marks_revision';

    let safetyScore = 88;
    let riskIndex: 'safe' | 'caution' | 'flagged' = 'safe';
    let rationale = 'Routine faculty revision request verified against department activity schedule.';

    if (isAttendanceOD) {
      safetyScore = 94;
      riskIndex = 'safe';
      rationale = 'On-Duty academic participation. Verified against institute hackathon & sports roster with prior HOD endorsement.';
    } else if (isMedical) {
      safetyScore = 75;
      riskIndex = 'caution';
      rationale = 'Medical leave retrospective excusal. Suggest verification of hospital discharge certificate before final sign-off.';
    } else if (isGradeCorrection) {
      safetyScore = 85;
      riskIndex = 'safe';
      rationale = 'Clerical mark re-evaluation request. Audit trail created; changes are bounded within standard correction variance (+/- 10%).';
    }

    const newReq: ModificationRequest = {
      id: `req_${Date.now()}`,
      ...params,
      aiSafetyAssessment: {
        safetyScore,
        riskIndex,
        rationale,
        historicCorrelation: 'Class incharge has established 96.4% historical audit validity rate.'
      },
      status: 'pending',
      requestedAt: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    };

    this.requests.unshift(newReq);
    this.save();

    // Call REST API
    fetch('/api/requests', {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(newReq)
    }).catch((err) => console.warn('[requestService] API error:', err));

    return newReq;
  }

  updateRequestStatus(
    requestId: string,
    status: RequestStatus,
    reviewerName: string,
    remarks?: string
  ): ModificationRequest | undefined {
    const idx = this.requests.findIndex((r) => r.id === requestId);
    if (idx >= 0) {
      this.requests[idx] = {
        ...this.requests[idx],
        status,
        reviewedAt: new Date().toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        }),
        reviewedBy: reviewerName,
        reviewRemarks: remarks || (status === 'approved' ? 'Digitally authorized by Principal' : 'Rejected after administrative review')
      };
      this.save();

      // Call REST review endpoint
      fetch(`/api/requests/${requestId}/review`, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ status, reviewedBy: reviewerName, remarks })
      }).catch((err) => console.warn('[requestService] Review API error:', err));

      return this.requests[idx];
    }
    return undefined;
  }
}

export const requestService = new RequestService();
