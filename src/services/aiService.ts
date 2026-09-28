import { Anomaly, AIParentDigest, Student, StudentMarkReport } from '../types';
import { INITIAL_ANOMALIES } from '../data/mockData';
import { attendanceService } from './attendanceService';
import { authService } from './authService';

const ANOMALIES_STORAGE_KEY = 'edunexus_ai_anomalies';

class AIService {
  private anomalies: Anomaly[] = [];

  constructor() {
    this.init();
    this.syncFromBackend();
  }

  private init() {
    try {
      const stored = localStorage.getItem(ANOMALIES_STORAGE_KEY);
      this.anomalies = stored ? JSON.parse(stored) : [...INITIAL_ANOMALIES];
    } catch {
      this.anomalies = [...INITIAL_ANOMALIES];
    }
  }

  private async syncFromBackend() {
    try {
      const res = await fetch('/api/anomalies');
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.anomalies) && data.data.anomalies.length > 0) {
        this.anomalies = data.data.anomalies;
        this.save();
      }
    } catch (err) {
      // background sync
    }
  }

  private save() {
    try {
      localStorage.setItem(ANOMALIES_STORAGE_KEY, JSON.stringify(this.anomalies));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }

  getAllAnomalies(): Anomaly[] {
    return [...this.anomalies];
  }

  getActiveAnomalies(): Anomaly[] {
    return this.anomalies.filter((a) => a.status === 'pending_review');
  }

  getAnomaliesByStudent(studentId: string): Anomaly[] {
    return this.anomalies.filter((a) => a.studentId === studentId);
  }

  updateAnomalyStatus(
    anomalyId: string,
    status: Anomaly['status'],
    reviewerName?: string,
    notes?: string
  ): Anomaly | undefined {
    const idx = this.anomalies.findIndex((a) => a.id === anomalyId);
    if (idx >= 0) {
      this.anomalies[idx] = {
        ...this.anomalies[idx],
        status,
        reviewedBy: reviewerName,
        reviewNotes: notes
      };
      this.save();

      // Call REST patch endpoint
      fetch(`/api/anomalies/${anomalyId}`, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ status, reviewedBy: reviewerName, notes })
      }).catch((err) => console.warn('[aiService] API patch error:', err));

      return this.anomalies[idx];
    }
    return undefined;
  }

  runAnomalyScan(students: Student[]): Anomaly[] {
    // Real-time scan comparing FN vs AN
    const newDetected: Anomaly[] = [];
    students.forEach((s) => {
      const stats = attendanceService.getStudentStats(s.id);
      
      // If student has afternoon drop count >= 2 and not already flagged
      if (stats.afternoonDropCount >= 2) {
        const existing = this.anomalies.find((a) => a.studentId === s.id && a.type === 'session_skip');
        if (!existing) {
          const freshAnomaly: Anomaly = {
            id: `anom_${Date.now()}_${s.id}`,
            studentId: s.id,
            studentName: s.name,
            rollNumber: s.rollNumber,
            classId: s.classId,
            className: s.className,
            type: 'session_skip',
            riskLevel: 'medium',
            confidenceScore: 92,
            title: 'Dual-Session Disparity: Afternoon Drop Detected',
            description: `${s.name} recorded ${stats.fnRate}% Forenoon attendance, but drops sharply to ${stats.anRate}% during Afternoon practical sessions.`,
            detectedAt: 'Just now (Live Scan)',
            evidence: `Forenoon rate: ${stats.fnRate}% | Afternoon rate: ${stats.anRate}%. Detected ${stats.afternoonDropCount} session departures.`,
            status: 'pending_review',
            aiSuggestedAction: 'Notify Guardian via SMS and schedule faculty mentor check-in.'
          };
          this.anomalies.unshift(freshAnomaly);
          newDetected.push(freshAnomaly);
        }
      }
    });

    this.save();

    // Trigger backend scan API
    fetch('/api/anomalies/scan', { method: 'POST' }).catch((err) =>
      console.warn('[aiService] Scan API note:', err)
    );

    return newDetected;
  }

  generateParentDigest(
    student: Student,
    markReport?: StudentMarkReport
  ): AIParentDigest {
    const stats = attendanceService.getStudentStats(student.id);
    const cgpa = student.academicCgpa || 8.5;
    const now = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      month: 'short',
      day: 'numeric'
    });

    const strengths: string[] = [
      `High engagement in morning theoretical lectures with ${stats.fnRate}% Forenoon presence.`,
      `Strong academic foundation with current CGPA of ${cgpa} / 10.0.`
    ];

    if (markReport && markReport.subjects.length > 0) {
      const topSubject = [...markReport.subjects].sort((a, b) => b.totalObtained - a.totalObtained)[0];
      if (topSubject) {
        strengths.push(`Distinction-level mastery demonstrated in ${topSubject.subjectName} (${topSubject.grade}, ${topSubject.totalObtained}/100).`);
      }
    }

    const concerns: string[] = [];
    if (stats.anRate < 85) {
      concerns.push(`Noticeable drop in afternoon laboratory sessions (${stats.anRate}% AN vs ${stats.fnRate}% FN).`);
    }
    if (stats.overallRate < 85) {
      concerns.push(`Overall cumulative attendance is ${stats.overallRate}%, approaching the 75% institutional exam hall-ticket cutoff.`);
    }
    if (concerns.length === 0) {
      concerns.push('No acute attendance concerns detected this academic cycle.');
    }

    const interventions: string[] = [
      'Encourage regular laboratory participation on Tuesday and Thursday afternoons.',
      'Schedule a brief 10-minute check-in with faculty mentor Prof. Anitha Vasudevan.',
      'Review continuous assessment rubrics to ensure internal marks eligibility for upcoming semester finals.'
    ];

    const hasAfternoonDeparture = stats.fnRate > stats.anRate + 10;

    return {
      studentId: student.id,
      studentName: student.name,
      generatedAt: now,
      fnAttendanceRate: stats.fnRate,
      anAttendanceRate: stats.anRate,
      compositeScore: Math.round((stats.overallRate * 0.4) + (cgpa * 10 * 0.6)),
      executiveSummary: `${student.name} is performing commendably on core engineering coursework with a cumulative GPA of ${cgpa}. However, automated session analytics have flagged a recurring drop during Afternoon laboratory hours (1:30 PM - 4:30 PM), which could impair practical laboratory credits if unaddressed.`,
      academicStrengths: strengths,
      attendanceConcerns: concerns,
      recommendedInterventions: interventions,
      afternoonDepartureAlert: hasAfternoonDeparture
        ? {
            date: 'September 26, 2026',
            leftEarly: true,
            session: 'AN'
          }
        : undefined
    };
  }
}

export const aiService = new AIService();
