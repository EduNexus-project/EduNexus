import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  User,
  GraduationCap,
  Calendar,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Send,
  Loader2,
  HeartHandshake,
  Smartphone,
} from 'lucide-react';
import { WebhookDispatch } from '../types/erp';

interface ParentPortalProps {
  webhookLogs: WebhookDispatch[];
}

export const ParentPortal: React.FC<ParentPortalProps> = ({ webhookLogs }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('STU-1029');
  const [report, setReport] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const students = [
    { id: 'STU-1029', name: 'Sophia Chen', grade: 'Year 3', major: 'Computer Science' },
    { id: 'STU-1032', name: 'Mateo Rossi', grade: 'Year 3', major: 'Computer Science' },
    { id: 'STU-1030', name: 'Liam Davies', grade: 'Year 3', major: 'Computer Science' },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/parent/progress-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: selectedStudentId }),
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerateReport();
  }, [selectedStudentId]);

  const handleCopy = () => {
    if (!report) return;
    const text = `${report.greeting}\n\n${report.executive_narrative}\n\nStrengths:\n${report.strengths_and_achievements?.map((s: string) => `- ${s}`).join('\n')}\n\nAttendance:\n${report.attendance_insights}\n\nHome Recommendations:\n${report.home_support_recommendations?.map((r: string) => `• ${r}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <HeartHandshake className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">Parent & Guardian Portal</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              AI Natural Language Summary Engine converts complex monthly grade and attendance tables into clear, concise narrative progress reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Select Ward:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.major})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real-time Parent Mobile Notification Feed */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Live Parent Mobile Alerts
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Webhook Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Real-time notification dispatches sent directly to parent mobile channels upon FN or AN absence database insertion.
            </p>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {webhookLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <span>•</span> {log.parent_channel}
                    </span>
                    <span className="text-slate-500 text-[10px] font-mono">{log.timestamp.split('T')[1].slice(0, 5)} UTC</span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{log.message_preview}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                    <span>To: {log.destination_phone}</span>
                    <span className="text-emerald-400 font-mono">Delivered ({log.latency_ms}ms)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: AI Narrative Progress Report */}
        <div className="lg:col-span-8">
          {isGenerating ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs text-slate-400 font-mono">
                AI Natural Language Summary Engine is synthesizing monthly academic & attendance tables...
              </p>
            </div>
          ) : report ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        report.overall_standing === 'HONORS'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : report.overall_standing === 'NEEDS_INTERVENTION'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                      }`}
                    >
                      Status: {report.overall_standing}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">• Monthly Progress Briefing</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100 mt-1">{report.greeting}</h2>
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{copied ? 'Copied' : 'Share Narrative Report'}</span>
                </button>
              </div>

              {/* Executive Narrative */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                  Executive Narrative Overview
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {report.executive_narrative}
                </p>
              </div>

              {/* Strengths & Highlights */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  Subject Mastery & Academic Strengths
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {report.strengths_and_achievements?.map((str: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 text-xs text-slate-200">
                      <span className="text-emerald-400 font-bold mt-0.5">•</span>
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance Insights (FN vs AN clarity) */}
              <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Session Attendance Consistency (FN & AN)
                </span>
                <p className="text-xs text-indigo-100/90 leading-relaxed">{report.attendance_insights}</p>
              </div>

              {/* Home Support Recommendations */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Actionable Support at Home
                </span>
                <div className="space-y-2">
                  {report.home_support_recommendations?.map((rec: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 text-xs text-slate-300">
                      <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
