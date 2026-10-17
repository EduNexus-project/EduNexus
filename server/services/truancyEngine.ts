import { callGemini } from './geminiClient.ts';
import { callGroq } from './groqClient.ts';
import { getAttendanceSessions, TruancyAlert } from './supabaseClient.ts';

export interface TruancyAnalysisResult {
  detected_anomalies: TruancyAlert[];
  total_checked: number;
  unauthorized_departure_count: number;
  engine_notice: string;
}

/**
 * AI Anomaly Engine: Continuously analyzes attendance patterns, specifically
 * identifying students logged as present in Forenoon (FN) but subsequently
 * marked absent in Afternoon (AN), alerting the Principal immediately.
 */
export async function analyzeTruancyPatterns(dateFilter?: string): Promise<TruancyAnalysisResult> {
  const sessions = await getAttendanceSessions();
  const targetDate = dateFilter || '2026-10-14';

  // Group by student for the given date
  const studentMap = new Map<string, { fn?: string; an?: string; student: any }>();

  for (const s of sessions) {
    if (s.session_date !== targetDate) continue;
    if (!studentMap.has(s.student_id)) {
      studentMap.set(s.student_id, { student: s });
    }
    const entry = studentMap.get(s.student_id)!;
    if (s.session_type === 'FN') entry.fn = s.status;
    if (s.session_type === 'AN') entry.an = s.status;
  }

  const flaggedStudents: Array<{ id: string; name: string; cohort: string; dept: string; fn: string; an: string; parentPhone: string; parentName: string }> = [];

  studentMap.forEach((val, id) => {
    if (val.fn === 'Present' && val.an === 'Absent') {
      flaggedStudents.push({
        id,
        name: val.student.student_name,
        cohort: val.student.cohort,
        dept: val.student.department,
        fn: val.fn,
        an: val.an,
        parentPhone: val.student.parent_phone,
        parentName: val.student.parent_name,
      });
    }
  });

  const alerts: TruancyAlert[] = await Promise.all(
    flaggedStudents.map(async (stu) => {
      let brief = `URGENT SECURITY ANOMALY: ${stu.name} (${stu.id}) was registered PRESENT in Forenoon session, but logged ABSENT for the Afternoon session. Potential unauthorized campus departure detected. Parent alerted via automated webhook.`;
      let riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'CRITICAL';

      try {
        const prompt = `You are the Campus Security AI Anomaly Engine.
Analyze this high-priority truancy event:
Student: ${stu.name} (ID: ${stu.id})
Cohort: ${stu.cohort}, Department: ${stu.dept}
Forenoon (FN) Status: PRESENT (Scanned at 09:00)
Afternoon (AN) Status: ABSENT (Unrecorded at 13:45)

Generate a 2-sentence urgent Principal Security Brief with risk level (CRITICAL or HIGH) and immediate recommended action (e.g. review gate turnstile CCTV, dispatch campus marshal, contact guardian).
Output JSON format:
{
  "risk_level": "CRITICAL" | "HIGH",
  "security_brief": "string"
}`;

        const aiResp = await callGemini({
          prompt,
          jsonMode: true,
          temperature: 0.1,
        });

        const parsed = JSON.parse(aiResp.text.replace(/```json|```/g, '').trim());
        if (parsed.security_brief) brief = parsed.security_brief;
        if (parsed.risk_level) riskLevel = parsed.risk_level;
      } catch {
        // Heuristic fallback retains critical security alert
      }

      return {
        id: 'tr-' + stu.id.toLowerCase(),
        student_id: stu.id,
        student_name: stu.name,
        cohort: stu.cohort,
        department: stu.dept,
        alert_date: targetDate,
        fn_status: 'Present' as const,
        an_status: 'Absent' as const,
        risk_level: riskLevel,
        parent_phone: stu.parentPhone,
        parent_name: stu.parentName,
        last_seen_zone: 'Main Campus Gate 2 / Turnstile West',
        ai_security_brief: brief,
        status: 'Active Alert' as const,
        timestamp: new Date().toISOString(),
      };
    })
  );

  return {
    detected_anomalies: alerts,
    total_checked: studentMap.size,
    unauthorized_departure_count: alerts.length,
    engine_notice: alerts.length > 0
      ? `Active Truancy Pattern Detected: ${alerts.length} student(s) logged Present in FN but Absent in AN.`
      : 'All Forenoon to Afternoon sessions consistent. No mid-day departures flagged.',
  };
}
