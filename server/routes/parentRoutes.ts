import { Router, Request, Response } from 'express';
import { callGemini } from '../services/geminiClient.ts';
import { callGroq } from '../services/groqClient.ts';
import { getAttendanceSessions } from '../services/supabaseClient.ts';

const router = Router();

// Student mock records directory for parent portal
const STUDENT_PROFILES: Record<string, {
  name: string;
  gradeLevel: string;
  major: string;
  advisor: string;
  grades: Array<{ course: string; code: string; score: number; max: number; grade: string; remarks: string }>;
}> = {
  'STU-1029': {
    name: 'Sophia Chen',
    gradeLevel: 'Junior (Year 3)',
    major: 'Computer Science & AI',
    advisor: 'Dr. Aris Thorne',
    grades: [
      { course: 'Distributed Cloud Systems', code: 'CS-440', score: 94.5, max: 100, grade: 'A', remarks: 'Outstanding distributed consensus lab execution' },
      { course: 'Machine Learning Pipelines', code: 'DS-320', score: 91.0, max: 100, grade: 'A-', remarks: 'Consistently ranks in top 5th percentile' },
      { course: 'Enterprise Telemetry', code: 'IS-310', score: 89.0, max: 100, grade: 'B+', remarks: 'Active classroom contributor' },
    ],
  },
  'STU-1032': {
    name: 'Mateo Rossi',
    gradeLevel: 'Junior (Year 3)',
    major: 'Computer Science & AI',
    advisor: 'Dr. Aris Thorne',
    grades: [
      { course: 'Distributed Cloud Systems', code: 'CS-440', score: 62.0, max: 100, grade: 'D', remarks: 'Late project submission; midterm algorithm deficit' },
      { course: 'Computer Architecture', code: 'CS-310', score: 68.5, max: 100, grade: 'C+', remarks: 'Good lab work, struggles on timed theory tests' },
      { course: 'Linear Algebra for AI', code: 'MATH-240', score: 71.0, max: 100, grade: 'C-', remarks: 'Shows promise when attended consistently' },
    ],
  },
  'STU-1030': {
    name: 'Liam Davies',
    gradeLevel: 'Junior (Year 3)',
    major: 'Computer Science & AI',
    advisor: 'Dr. Evelyn Reed',
    grades: [
      { course: 'Distributed Cloud Systems', code: 'CS-440', score: 88.0, max: 100, grade: 'B+', remarks: 'Solid homework and team project contributions' },
      { course: 'Data Structures & Algorithms', code: 'CS-201', score: 85.5, max: 100, grade: 'B', remarks: 'Reliable analytical performance' },
    ],
  },
};

router.get('/students', (_req: Request, res: Response): void => {
  res.json(
    Object.keys(STUDENT_PROFILES).map((id) => ({
      student_id: id,
      ...STUDENT_PROFILES[id],
    }))
  );
});

router.post('/progress-report', async (req: Request, res: Response): Promise<void> => {
  try {
    const { student_id, provider = 'auto' } = req.body;
    const profile = STUDENT_PROFILES[student_id] || STUDENT_PROFILES['STU-1029'];

    const allSessions = await getAttendanceSessions();
    const studentSessions = allSessions.filter((s) => s.student_id === student_id);

    const totalSessions = studentSessions.length || 10;
    const presentCount = studentSessions.filter((s) => s.status === 'Present').length;
    const absentCount = studentSessions.filter((s) => s.status === 'Absent').length;
    const attendancePct = Math.round((presentCount / Math.max(1, totalSessions)) * 100);

    const prompt = `You are the Parent Portal AI Natural Language Summary Engine.
Convert this student's complex technical grade and attendance records into an empathetic, clear, and reassuring narrative progress report for their parents.

Student Name: ${profile.name} (ID: ${student_id})
Major: ${profile.major}, Academic Advisor: ${profile.advisor}
Attendance Record:
- Total Logged Sessions: ${totalSessions}
- Present: ${presentCount} (${attendancePct}%)
- Absences: ${absentCount}
- Recent Sessions: ${JSON.stringify(studentSessions.slice(0, 4))}

Academic Courses & Grades:
${JSON.stringify(profile.grades, null, 2)}

Provide JSON response in this exact format:
{
  "greeting": string,
  "executive_narrative": string,
  "strengths_and_achievements": string[],
  "attendance_insights": string,
  "home_support_recommendations": string[],
  "overall_standing": "HONORS" | "ON_TRACK" | "NEEDS_INTERVENTION" | "CRITICAL_REVIEW"
}`;

    let resultText = '';
    let modelUsed = 'gemini-3.8-flash';

    try {
      const aiResp = await callGemini({
        prompt,
        jsonMode: true,
        temperature: 0.2,
      });
      resultText = aiResp.text;
      modelUsed = aiResp.model;
    } catch {
      // Deterministic parent narrative fallback
      res.json({
        greeting: `Dear Family of ${profile.name},`,
        executive_narrative: `${profile.name} is making active progress in the ${profile.major} program. Overall attendance stands at ${attendancePct}%. Coursework demonstrates steady engagement across core computer science and engineering coursework.`,
        strengths_and_achievements: profile.grades.map(
          (g) => `${g.course}: Earned ${g.grade} (${g.score}%). ${g.remarks}`
        ),
        attendance_insights:
          absentCount > 0
            ? `${absentCount} absence(s) logged during recent Afternoon sessions. Consistent full-day attendance will help retain complex lecture material.`
            : 'Exemplary 100% full-day attendance across Forenoon and Afternoon sessions.',
        home_support_recommendations: [
          'Encourage regular review of distributed systems homework before project deadlines.',
          'Review campus afternoon schedule to ensure timely attendance across both FN and AN sessions.',
          'Connect with academic advisor if additional tutoring or assignment re-evaluation is needed.',
        ],
        overall_standing: attendancePct > 85 ? 'HONORS' : 'ON_TRACK',
        student: profile,
        model_used: 'rule-engine-narrative-fallback',
      });
      return;
    }

    const clean = resultText.replace(/^```json/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(clean);

    res.json({
      ...parsed,
      student: profile,
      model_used: modelUsed,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
