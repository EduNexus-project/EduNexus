import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileText,
  Search,
  Check,
  Zap,
  Sparkles,
  PhoneCall,
  Lock,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  PrincipalSummaryStats,
  CorrectionRequest,
  AnomalyAlert,
  AuditLog,
  StudentRecord,
  ERPClass,
} from '../types/sht';
import { PrincipalDirectoryManager } from './PrincipalDirectoryManager';

interface PrincipalDashboardProps {
  stats: PrincipalSummaryStats;
  corrections: CorrectionRequest[];
  anomalies: AnomalyAlert[];
  audits: AuditLog[];
  students: StudentRecord[];
  classes: ERPClass[];
  onRefresh: () => void;
  onOpen3DView: () => void;
}

export const PrincipalDashboardView: React.FC<PrincipalDashboardProps> = ({
  stats,
  corrections,
  anomalies,
  audits,
  students,
  classes,
  onRefresh,
  onOpen3DView,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'corrections' | 'anomalies' | 'directory' | 'audits'>('overview');
  const [selectedCorrectionId, setSelectedCorrectionId] = useState<string>(corrections[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingCorrections = corrections.filter((c) => c.status === 'Pending');
  const batchSafeCorrections = pendingCorrections.filter((c) => c.risk_category === 'Low' || c.risk_score < 30);
  const activeAnomalies = anomalies.filter((a) => a.status === 'Active');

  const currentCorrection = corrections.find((c) => c.id === selectedCorrectionId) || pendingCorrections[0] || corrections[0];

  // Weekly attendance trend chart data (FN vs AN)
  const attendanceTrendData = [
    { day: 'Mon (Oct 8)', FN: 94, AN: 92 },
    { day: 'Tue (Oct 9)', FN: 96, AN: 95 },
    { day: 'Wed (Oct 10)', FN: 92, AN: 89 },
    { day: 'Thu (Oct 11)', FN: 90, AN: 85 },
    { day: 'Fri (Oct 12)', FN: 95, AN: 91 },
    { day: 'Mon (Oct 13)', FN: 98, AN: 96 },
    { day: 'Today (Oct 14)', FN: stats.today_attendance_pct, AN: Math.max(60, stats.today_attendance_pct - 15) },
  ];

  // Subject marks average chart data
  const subjectPerformanceData = [
    { subject: 'Distributed Cloud (CS-440)', avg: 81.0, benchmark: 75.0 },
    { subject: 'Computer Arch (CS-310)', avg: 82.2, benchmark: 75.0 },
    { subject: 'Linear Algebra (MATH-240)', avg: 81.5, benchmark: 75.0 },
    { subject: 'ML Pipelines (DS-320)', avg: 84.5, benchmark: 75.0 },
  ];

  const handleResolveCorrection = async (id: string, decision: 'Approved' | 'Rejected') => {
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      const res = await fetch(`/api/sht/corrections/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, reviewed_by: 'Dr. K. S. Raman (Principal)' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resolve request');
      setActionFeedback(data.message);
      onRefresh();
    } catch (err: any) {
      setActionFeedback(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchApprove = async () => {
    if (batchSafeCorrections.length === 0) return;
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      for (const req of batchSafeCorrections) {
        await fetch(`/api/sht/corrections/${req.id}/resolve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision: 'Approved', reviewed_by: 'Dr. K. S. Raman (Principal)' }),
        });
      }
      setActionFeedback(`Successfully batch-approved ${batchSafeCorrections.length} low-risk correction requests.`);
      onRefresh();
    } catch (err: any) {
      setActionFeedback(`Error during batch approval: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveAnomaly = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/sht/anomalies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setActionFeedback(`Anomaly alert marked as "${status}".`);
        onRefresh();
      }
    } catch (err: any) {
      setActionFeedback(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. REAL-TIME AI INSIGHTS & TRUANCY ANOMALY BANNER */}
      {activeAnomalies.length > 0 ? (
        <div className="rounded-2xl border p-5 bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/50 border-rose-500/60 shadow-lg shadow-rose-950/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                </span>
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-rose-400">
                  AI Truancy Anomaly Engine • Core Safety Watch
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Potential Attendance Anomaly Flagged ({activeAnomalies.length} Student Record{activeAnomalies.length > 1 ? 's' : ''})
              </h2>
              <p className="text-xs text-rose-200/90 max-w-3xl leading-relaxed">
                {activeAnomalies[0].explanation} (Labeled as a potential attendance anomaly for administrative verification).
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleResolveAnomaly(activeAnomalies[0].id, 'Under Review')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                <span>Contact Guardian</span>
              </button>

              <button
                onClick={() => handleResolveAnomaly(activeAnomalies[0].id, 'Resolved')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Reviewed</span>
              </button>

              <button
                onClick={onOpen3DView}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition flex items-center gap-1.5"
              >
                <span>3D Heatmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border p-4 bg-slate-900 border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">
              Real-Time AI Anomaly Engine Active: All Forenoon (FN) & Afternoon (AN) checkpoints synchronized.
            </span>
          </div>
          <span className="text-slate-400 font-mono">0 Active Truancy Alerts</span>
        </div>
      )}

      {actionFeedback && (
        <div className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            {actionFeedback}
          </span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* 2. STATS KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">{stats.total_students}</div>
          <div className="text-[11px] text-slate-500">Across {stats.total_classes} Academic Classes</div>
        </div>

        {/* Overall Attendance % */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Attendance</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">{stats.today_attendance_pct}%</span>
            <span className="text-[11px] text-slate-400 font-mono">({stats.present_count} marks)</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span>FN: {stats.fn_present} present</span>
            <span>AN: {stats.an_present} present</span>
          </div>
        </div>

        {/* Absent & Pending */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Absences & Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400 font-mono">{stats.absent_count}</span>
            <span className="text-xs text-slate-500">absent</span>
            <span className="text-slate-600">•</span>
            <span className="text-sm font-mono text-amber-400">{stats.pending_count}</span>
            <span className="text-xs text-slate-500">pending</span>
          </div>
          <div className="text-[11px] text-slate-500">Webhooks auto-notified parents</div>
        </div>

        {/* Pending Teacher Corrections */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Correction Requests</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">{pendingCorrections.length}</div>
          <div className="text-[11px] text-indigo-400 font-medium">
            {batchSafeCorrections.length} safe for 1-click batch approval
          </div>
        </div>
      </div>

      {/* 3. SECTION SUB-TABS */}
      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'overview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Analytics & Trends
        </button>

        <button
          onClick={() => setActiveSubTab('corrections')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'corrections' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Correction Requests</span>
          {pendingCorrections.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold">
              {pendingCorrections.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('anomalies')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'anomalies' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Suspicious Patterns</span>
          {activeAnomalies.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
              {activeAnomalies.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('directory')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'directory' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Students & Classes
        </button>

        <button
          onClick={() => setActiveSubTab('audits')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'audits' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Audit Trail
        </button>
      </div>

      {/* 4. TAB CONTENT */}
      {/* OVERVIEW & CHARTS */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Attendance Trends FN vs AN */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">7-Day Attendance Rate: Forenoon (FN) vs Afternoon (AN)</h3>
                <p className="text-xs text-slate-400">Tracks session retention and mid-day attendance attrition</p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis domain={[50, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="FN" fill="#6366f1" name="Forenoon (FN) %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="AN" fill="#38bdf8" name="Afternoon (AN) %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Examination Performance */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Examination Subject Averages</h3>
              <p className="text-xs text-slate-400">Class 10-A & 10-B Midterm Benchmark</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectPerformanceData} layout="vertical" margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" domain={[60, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis dataKey="subject" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={110} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="avg" fill="#10b981" name="Class Average %" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* CORRECTION REQUESTS WORKSPACE */}
      {activeSubTab === 'corrections' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Teacher Marks & Attendance Correction Queue ({pendingCorrections.length} Pending)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                AI Approval Scoring Assistant evaluates requested adjustments against historical student performance and class curves.
              </p>
            </div>

            {batchSafeCorrections.length > 0 && (
              <button
                onClick={handleBatchApprove}
                disabled={isProcessing}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 hover:opacity-95 text-white shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Execute Batch Safe Approvals ({batchSafeCorrections.length} Low-Risk Items)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Cards List */}
            <div className="lg:col-span-5 space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {corrections.map((item) => {
                const isSelected = item.id === (currentCorrection?.id || '');
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCorrectionId(item.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-800/95 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">{item.request_code}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          item.risk_category === 'Low'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : item.risk_category === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        Risk: {item.risk_category} ({item.risk_score}/100)
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-200 mt-1">
                      {item.student_name} • {item.record_type === 'mark' ? 'Marks Edit' : 'Attendance Override'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      By {item.teacher_name} ({item.course_or_date})
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60 font-mono">
                      <span className="text-slate-400 line-through">{item.original_value}</span>
                      <ArrowRight className="w-3 h-3 text-indigo-400" />
                      <span className="text-emerald-400 font-bold">{item.proposed_value}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Detailed Inspection & AI Risk Assessment */}
            <div className="lg:col-span-7">
              {currentCorrection ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30">
                          {currentCorrection.request_code}
                        </span>
                        <span className="text-xs text-slate-400">• {currentCorrection.course_or_date}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-100 mt-1">
                        Proposed {currentCorrection.record_type.toUpperCase()} Change for {currentCorrection.student_name}
                      </h3>
                      <p className="text-xs text-slate-400">Requested by {currentCorrection.teacher_name}</p>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border uppercase ${
                        currentCorrection.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : currentCorrection.status === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {currentCorrection.status}
                    </span>
                  </div>

                  {/* Comparison Grid */}
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-sans uppercase">Original Recorded Value</span>
                      <div className="text-slate-300 font-bold text-sm mt-1">{currentCorrection.original_value}</div>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-sans uppercase">Proposed Value</span>
                      <div className="text-emerald-400 font-bold text-sm mt-1">{currentCorrection.proposed_value}</div>
                    </div>
                  </div>

                  {/* Teacher's Stated Reason */}
                  <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 text-xs">
                    <span className="font-semibold text-slate-300 block mb-1">Teacher's Stated Reason:</span>
                    <p className="text-slate-300 italic font-serif leading-relaxed">"{currentCorrection.reason}"</p>
                  </div>

                  {/* AI Approval Scoring Assistant Box */}
                  <div className="bg-gradient-to-br from-indigo-950/30 to-slate-950 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        AI Approval Risk Assessment
                      </span>
                      <span className="font-mono text-slate-400 text-[10px]">
                        Risk: {currentCorrection.risk_score}/100 ({currentCorrection.risk_category})
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">{currentCorrection.ai_explanation}</p>

                    {currentCorrection.supporting_factors && currentCorrection.supporting_factors.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">Supporting Factors:</span>
                        <ul className="space-y-1">
                          {currentCorrection.supporting_factors.map((factor, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                              <span className="text-indigo-400 font-bold">•</span>
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="p-2.5 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs text-indigo-200">
                      <strong>Suggested Principal Action:</strong> {currentCorrection.suggested_action}
                    </div>
                  </div>

                  {/* Principal Approve / Reject Actions */}
                  {currentCorrection.status === 'Pending' ? (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleResolveCorrection(currentCorrection.id, 'Rejected')}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Request</span>
                      </button>

                      <button
                        onClick={() => handleResolveCorrection(currentCorrection.id, 'Approved')}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Update Record</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-xs text-slate-400 italic">
                      Reviewed by {currentCorrection.reviewed_by} on {currentCorrection.reviewed_at?.split('T')[0]}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* SUSPICIOUS ATTENDANCE PATTERNS / ANOMALIES */}
      {activeSubTab === 'anomalies' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              AI Attendance Anomaly Engine • Truancy Flag Review
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Business Rule: Flags students logged Present in Forenoon (FN) and subsequently marked Absent in Afternoon (AN) on the same date.
              Accurately labeled as <em>potential attendance anomalies</em> for administrative review.
            </p>
          </div>

          <div className="space-y-3">
            {anomalies.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
                      {item.alert_type}
                    </span>
                    <h4 className="text-sm font-bold text-slate-200">
                      {item.student_name} ({item.student_id}) • Class {item.class_name}
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                      item.status === 'Active'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-sans">Date:</span>
                    <div className="text-slate-300 font-bold">{item.alert_date}</div>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-sans">Forenoon (FN):</span>
                    <div className="text-emerald-400 font-bold">{item.fn_status}</div>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-sans">Afternoon (AN):</span>
                    <div className="text-rose-400 font-bold">{item.an_status}</div>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-sans">Severity:</span>
                    <div className="text-amber-400 font-bold">{item.severity}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  {item.explanation}
                </p>

                {item.status === 'Active' && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleResolveAnomaly(item.id, 'Under Review')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    >
                      Acknowledge Review
                    </button>
                    <button
                      onClick={() => handleResolveAnomaly(item.id, 'Resolved')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DIRECTORY: STUDENTS, TEACHERS, PARENTS, CLASSES & SUBJECTS */}
      {activeSubTab === 'directory' && (
        <PrincipalDirectoryManager
          classes={classes}
          students={students}
          onRefresh={onRefresh}
        />
      )}

      {/* AUDIT TRAIL */}
      {activeSubTab === 'audits' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Administrative & Security Audit Trail ({audits.length} Records)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Permanent immutable log of logins, attendance commitments, mark modifications, and anomaly dispatches.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Timestamp (UTC)</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {audits.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 text-slate-400">{log.timestamp.replace('T', ' ').slice(0, 19)}</td>
                    <td className="px-4 py-3 font-sans font-medium text-slate-200">{log.actor_name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 uppercase text-[9px] font-bold">
                        {log.actor_role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-cyan-400 font-bold">{log.action}</td>
                    <td className="px-4 py-3 text-slate-400">{log.target_type}</td>
                    <td className="px-4 py-3 font-sans text-slate-300">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
