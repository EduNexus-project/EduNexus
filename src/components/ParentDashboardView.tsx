import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  User,
  GraduationCap,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Smartphone,
  Copy,
  Check,
  Sparkles,
  Loader2,
  BookOpen,
  Filter,
  Clock,
  ChevronDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  StudentRecord,
  ERPNotification,
  AttendanceRecord,
} from '../types/sht';

interface ParentDashboardProps {
  currentUser: { id: string; name: string; linked_student_id?: string };
  notifications: ERPNotification[];
}

export const ParentDashboardView: React.FC<ParentDashboardProps> = ({
  currentUser,
  notifications,
}) => {
  const [children, setChildren] = useState<StudentRecord[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [reportData, setReportData] = useState<any | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  // Attendance filter range state
  const [filterRange, setFilterRange] = useState<'daily' | 'monthly' | 'academic_year' | 'custom'>('monthly');
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-10-14');

  // Load linked children strictly for this parent account (parent data isolation)
  useEffect(() => {
    fetch(`/api/sht/parent/children/${currentUser.id}`)
      .then((r) => r.json())
      .then((list) => {
        setChildren(list);
        if (list.length > 0) {
          setSelectedStudentId(list[0].student_id);
        }
      })
      .catch((err) => console.error(err));
  }, [currentUser.id]);

  // Load report and attendance when child or filter changes
  useEffect(() => {
    if (!selectedStudentId) return;
    setIsLoadingReport(true);

    let query = `/api/sht/parent/report/${selectedStudentId}?range=${filterRange}`;
    if (filterRange === 'custom') {
      query += `&start=${customStartDate}&end=${customEndDate}`;
    } else if (filterRange === 'daily') {
      query += `&start=2026-10-14`;
    }

    fetch(query)
      .then((r) => r.json())
      .then((data) => setReportData(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingReport(false));
  }, [selectedStudentId, filterRange, customStartDate, customEndDate]);

  const handleCopyReport = () => {
    if (!reportData) return;
    const txt = `${reportData.greeting}\n\n${reportData.narrative_report}\n\nStrengths:\n${reportData.strengths?.map((s: string) => `- ${s}`).join('\n')}\n\nAreas Needing Support:\n${reportData.areas_for_improvement?.map((a: string) => `- ${a}`).join('\n')}\n\nPractical Study Suggestions:\n${reportData.practical_study_suggestions?.map((p: string) => `• ${p}`).join('\n')}`;
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStudent = children.find((c) => c.student_id === selectedStudentId) || children[0];

  const parentNotifications = notifications.filter(
    (n) => n.recipient_id === currentUser.id || n.recipient_phone === currentStudent?.parent_phone
  );

  const marksChartData = reportData?.recent_marks?.map((m: any) => ({
    subject: m.subject_name.split(' ')[0],
    score: m.score,
    benchmark: 75,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <HeartHandshake className="w-5 h-5 text-rose-300" />
              </span>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">Parent Portal & Student Progress</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Protected access to linked student records, monthly AI progress briefings, and real-time absence mobile alerts.
            </p>
          </div>

          {/* Child Selector */}
          {children.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Viewing Ward:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 font-bold"
              >
                {children.map((c) => (
                  <option key={c.student_id} value={c.student_id}>
                    {c.student_name} ({c.class_name})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid or Empty State */}
      {children.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <HeartHandshake className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Linked Student Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            This parent account is not currently linked to an enrolled student in the school database.
            Please verify your ward's student admission number with the school administration.
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Card, Attendance Gauge & Mobile Alerts */}
        <div className="lg:col-span-4 space-y-4">
          {/* Child Card */}
          {currentStudent && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {currentStudent.student_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{currentStudent.student_name}</h3>
                  <div className="text-xs text-slate-400 font-mono">
                    ID: {currentStudent.student_id} • Roll No: {currentStudent.roll_no}
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    Class: {currentStudent.class_name}
                  </span>
                </div>
              </div>

              {/* Attendance Period Filter Selector */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-indigo-400" />
                    Attendance Range Filter
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setFilterRange('daily')}
                    className={`px-2 py-1 rounded-lg font-medium transition ${
                      filterRange === 'daily' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Today (Daily)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterRange('monthly')}
                    className={`px-2 py-1 rounded-lg font-medium transition ${
                      filterRange === 'monthly' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Month (Oct '26)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterRange('academic_year')}
                    className={`px-2 py-1 rounded-lg font-medium transition ${
                      filterRange === 'academic_year' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Academic Year
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterRange('custom')}
                    className={`px-2 py-1 rounded-lg font-medium transition ${
                      filterRange === 'custom' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Custom Dates
                  </button>
                </div>

                {filterRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500">Start Date</span>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">End Date</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Attendance KPI */}
              {reportData?.attendance_summary && (
                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 capitalize">
                      {reportData.attendance_summary.filter_range || filterRange} Attendance Rate
                    </span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        reportData.attendance_summary.shortage_warning ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {reportData.attendance_summary.attendance_pct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        reportData.attendance_summary.shortage_warning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, reportData.attendance_summary.attendance_pct)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>FN: {reportData.attendance_summary.fn_present} present</span>
                    <span>AN: {reportData.attendance_summary.an_present} present</span>
                  </div>

                  {reportData.attendance_summary.shortage_warning && (
                    <div className="p-2 bg-amber-950/30 border border-amber-800/40 rounded-lg text-amber-300 text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Shortage Warning: Attendance is below 75% threshold.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Simulated Mobile Alert Channel Inbox */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Parent Alert Channel Inbox
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {currentStudent?.parent_channel || 'WhatsApp'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time notifications dispatched directly to your mobile channel the instant an attendance absence is committed.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {parentNotifications.length > 0 ? (
                parentNotifications.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-emerald-400 font-mono">
                        {n.channel} Delivery
                      </span>
                      <span className="text-slate-500 text-[10px] font-mono">
                        {n.created_at.split('T')[1].slice(0, 5)} UTC
                      </span>
                    </div>
                    <p className="text-slate-200 text-[11px] leading-relaxed">{n.message}</p>
                    <div className="text-[10px] text-slate-500 text-right">Delivered in {n.latency_ms}ms (Simulated)</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs italic">
                  No attendance alerts recorded. Check-in history is clear.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Monthly Progress Report, Subject Marks Chart & Session History */}
        <div className="lg:col-span-8 space-y-6">
          {isLoadingReport ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs text-slate-400 font-mono">
                AI Natural Language Summary Engine is synthesizing academic records...
              </p>
            </div>
          ) : reportData ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-100">{reportData.greeting}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Academic & Attendance Progress Briefing (Grounded in Verified Institutional Records)
                  </p>
                </div>

                <button
                  onClick={handleCopyReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{copied ? 'Copied' : 'Share Narrative'}</span>
                </button>
              </div>

              {/* Narrative Summary */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-1.5">
                  Executive Progress Narrative
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {reportData.narrative_report}
                </p>
              </div>

              {/* Subject Marks Recharts Visual */}
              {marksChartData.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    Midterm Examination Score Breakdown
                  </h3>
                  <div className="h-48 w-full bg-slate-950/40 p-2 rounded-xl border border-slate-800">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marksChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                        <Bar dataKey="score" fill="#6366f1" name="Score (%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Strengths */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Key Academic Strengths
                  </span>
                  <ul className="space-y-1.5">
                    {reportData.strengths?.map((s: string, i: number) => (
                      <li key={i} className="text-slate-300 flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Areas Needing Support
                  </span>
                  <ul className="space-y-1.5">
                    {reportData.areas_for_improvement?.map((a: string, i: number) => (
                      <li key={i} className="text-slate-300 flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Practical Study Suggestions */}
              {reportData.practical_study_suggestions && reportData.practical_study_suggestions.length > 0 && (
                <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-4 space-y-2.5">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    Practical Study Suggestions for Home
                  </span>
                  <div className="space-y-1.5">
                    {reportData.practical_study_suggestions.map((p: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                        <span className="w-4 h-4 rounded bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-mono font-bold mt-0.5 flex-shrink-0">
                          {i + 1}
                        </span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Session Attendance Log Table */}
              {reportData.attendance_records && reportData.attendance_records.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      Session Attendance Records ({reportData.attendance_records.length} Logs)
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Filtered by: {filterRange}
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px] sticky top-0">
                        <tr>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Session</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Remarks</th>
                          <th className="px-3 py-2">Recorded By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
                        {reportData.attendance_records.map((rec: AttendanceRecord) => (
                          <tr key={rec.id} className="hover:bg-slate-800/40">
                            <td className="px-3 py-2 font-mono text-slate-300">{rec.session_date}</td>
                            <td className="px-3 py-2 font-mono font-bold text-indigo-400">{rec.session_type}</td>
                            <td className="px-3 py-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  rec.status === 'Present'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : rec.status === 'Absent'
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {rec.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-400 text-[11px] italic">{rec.remarks || '—'}</td>
                            <td className="px-3 py-2 text-slate-400 text-[11px]">{rec.recorded_by}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      )}
    </div>
  );
};
