import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { dbStore } from '../services/dbStore';
import { computeStudentAttendanceStats } from './attendanceController';
import { computeAISafetyAssessment } from './requestController';
import { parentCanAccessStudent } from '../services/parentRelationships';

// GET /api/ai/progress-summary/:studentId
export const getStudentProgressSummary = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.params.studentId as string;
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!(await parentCanAccessStudent(req, studentId))) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const student = dbStore.students.find(s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const stats = computeStudentAttendanceStats(studentId);
    const markReport = dbStore.marks[studentId];
    const cgpa = student.academicCgpa || 8.5;
    const now = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      month: 'short',
      day: 'numeric',
    });

    const strengths: string[] = [
      `High engagement in morning theoretical lectures with ${stats.fnRate}% Forenoon presence.`,
      `Strong academic foundation with current CGPA of ${cgpa} / 10.0.`,
    ];

    if (markReport && markReport.subjects && markReport.subjects.length > 0) {
      const topSubject = [...markReport.subjects].sort((a, b) => b.totalObtained - a.totalObtained)[0];
      if (topSubject) {
        strengths.push(
          `Distinction-level mastery demonstrated in ${topSubject.subjectName} (${topSubject.grade}, ${topSubject.totalObtained}/100).`
        );
      }
    }

    const concerns: string[] = [];
    if (stats.anRate < 85) {
      concerns.push(`Noticeable drop in afternoon laboratory sessions (${stats.anRate}% AN vs ${stats.fnRate}% FN).`);
    }
    if (stats.overallRate < 85) {
      concerns.push(
        `Overall cumulative attendance is ${stats.overallRate}%, approaching the 75% institutional exam hall-ticket cutoff.`
      );
    }
    if (concerns.length === 0) {
      concerns.push('No acute attendance concerns detected this academic cycle.');
    }

    const interventions: string[] = [
      'Encourage regular laboratory participation on Tuesday and Thursday afternoons.',
      'Schedule a brief 10-minute check-in with faculty mentor Prof. Anitha Vasudevan.',
      'Review continuous assessment rubrics to ensure internal marks eligibility for upcoming semester finals.',
    ];

    const hasAfternoonDeparture = stats.fnRate > stats.anRate + 10;

    let executiveSummary = `${student.name} is performing commendably on core engineering coursework with a cumulative GPA of ${cgpa}. However, automated session analytics have flagged a recurring drop during Afternoon laboratory hours (1:30 PM - 4:30 PM), which could impair practical laboratory credits if unaddressed.`;

    // Attempt Gemini AI Enhancement if API key is present
    const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    if (geminiKey && geminiKey.length > 10 && !geminiKey.includes('your_')) {
      try {
        const prompt = `As an educational AI Dean in an Indian engineering college, generate a concise 2-sentence executive academic summary for student ${student.name} (Roll: ${student.rollNumber}). Forenoon attendance: ${stats.fnRate}%, Afternoon attendance: ${stats.anRate}%, CGPA: ${cgpa}/10. Keep it professional, encouraging, yet vigilant on afternoon session skips.`;
        const aiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );
        const aiJson: any = await aiRes.json();
        const candidateText = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && candidateText.trim().length > 20) {
          executiveSummary = candidateText.trim();
        }
      } catch (err) {
        // Fallback safely to heuristic summary
      }
    }

    const digest = {
      studentId: student.id,
      studentName: student.name,
      generatedAt: now,
      fnAttendanceRate: stats.fnRate,
      anAttendanceRate: stats.anRate,
      compositeScore: Math.round(stats.overallRate * 0.4 + cgpa * 10 * 0.6),
      executiveSummary,
      academicStrengths: strengths,
      attendanceConcerns: concerns,
      recommendedInterventions: interventions,
      afternoonDepartureAlert: hasAfternoonDeparture
        ? {
            date: 'September 26, 2026',
            leftEarly: true,
            session: 'AN',
          }
        : undefined,
    };

    res.json({ success: true, data: digest });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/ai/parent-digest
export const generateParentDigest = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.body;
    if (studentId) {
      req.params.studentId = studentId;
      return getStudentProgressSummary(req, res);
    }
    res.status(400).json({ success: false, message: 'studentId required' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/ai/assess-request
export const assessRequestSafety = async (req: AuthRequest, res: Response) => {
  try {
    const { reason, requestType } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason is required' });
    }
    const assessment = computeAISafetyAssessment(reason, requestType || 'attendance_correction');
    res.json({ success: true, data: assessment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
