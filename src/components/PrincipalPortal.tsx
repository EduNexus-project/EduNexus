import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  Users,
  GraduationCap,
  Clock,
  ArrowRight,
  Loader2,
  Check,
  Layers,
  PhoneCall,
  Lock,
} from 'lucide-react';
import { TeacherModification, TruancyAlert } from '../types/erp';

interface PrincipalPortalProps {
  modifications: TeacherModification[];
  truancyAlerts: TruancyAlert[];
  onRefresh: () => void;
  onOpen3DView: () => void;
}

export const PrincipalPortal: React.FC<PrincipalPortalProps> = ({
  modifications,
  truancyAlerts,
  onRefresh,
  onOpen3DView,
}) => {
  const [selectedModId, setSelectedModId] = useState<string>(modifications[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeTruancy = truancyAlerts.filter((a) => a.status === 'Active Alert');
  const pendingMods = modifications.filter((m) => m.status === 'Pending');
  const batchSafeMods = pendingMods.filter(
    (m) => (m.risk_score !== undefined && m.risk_score < 30) || m.ai_recommendation === 'APPROVE_MODIFICATION'
  );

  const currentMod = modifications.find((m) => m.id === selectedModId) || modifications[0];

  const handleDecision = async (id: string, decision: 'Approved' | 'Rejected' | 'Escalated') => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/principal/modifications/${id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      if (res.ok) {
        setFeedback(`Modification request marked as ${decision}.`);
        onRefresh();
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchApprove = async () => {
    if (batchSafeMods.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/principal/batch-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: batchSafeMods.map((m) => m.id) }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(data.message || 'Batch approved successfully.');
        onRefresh();
      }
    } catch (err: any) {
      setFeedback(`Batch approval error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTruancyAction = async (id: string, action: 'Security Dispatched' | 'Guardian Contacted' | 'Resolved') => {
    try {
      const res = await fetch(`/api/principal/truancy/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setFeedback(`Security Action Executed: ${action}`);
        onRefresh();
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. DYNAMIC AI INSIGHTS BANNER (Principal Dashboard Top Requirement) */}
      <div
        className={`rounded-2xl border p-5 transition-all shadow-lg ${
          activeTruancy.length > 0
            ? 'bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/40 border-rose-600/60 shadow-rose-950/30'
            : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/30 border-emerald-500/40 shadow-emerald-950/20'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`p-1 rounded-lg ${
                  activeTruancy.length > 0
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-rose-400">
                AI Anomaly Engine • Real-Time Campus Intelligence
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-100">
              {activeTruancy.length > 0
                ? `SECURITY ALERT: ${activeTruancy.length} Unauthorized Mid-Day Departure(s) Flagged (FN Present → AN Absent)`
                : 'All Campus Checkpoints Synchronized • Zero Session Skipping Detected'}
            </h2>

            {activeTruancy.length > 0 && (
              <p className="text-xs text-rose-200/90 max-w-3xl leading-relaxed">
                {activeTruancy[0].ai_security_brief}
              </p>
            )}
          </div>

          {activeTruancy.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleTruancyAction(activeTruancy[0].id, 'Security Dispatched')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Gate 2 & Dispatch Marshal</span>
              </button>
              <button
                onClick={() => handleTruancyAction(activeTruancy[0].id, 'Guardian Contacted')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                <span>Call Guardian ({activeTruancy[0].parent_phone})</span>
              </button>
              <button
                onClick={onOpen3DView}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition flex items-center gap-1.5"
              >
                <span>Locate on 3D Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpen3DView}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Inspect 3D Campus Heatmap
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            {feedback}
          </span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* 2. BATCH APPROVAL BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            Teacher Marks & Attendance Modification Requests ({pendingMods.length} Pending)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Machine learning models evaluate grade edits against class curves and historical student trajectories.
          </p>
        </div>

        {batchSafeMods.length > 0 && (
          <button
            onClick={handleBatchApprove}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 hover:opacity-95 text-white shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Execute Batch Safe Approvals ({batchSafeMods.length} Low-Risk Requests)</span>
          </button>
        )}
      </div>

      {/* 3. MODIFICATION REQUESTS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Cards */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Incoming Modification Feed
          </span>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {modifications.map((item) => {
              const isSelected = item.id === (currentMod?.id || '');
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedModId(item.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs text-indigo-400 font-semibold">{item.request_code}</span>
                    {/* Smart Recommendation Badge */}
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        item.ai_recommendation === 'APPROVE_MODIFICATION'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.ai_recommendation === 'REJECT_MODIFICATION'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {item.ai_recommendation === 'APPROVE_MODIFICATION'
                        ? 'Safe to Approve'
                        : item.ai_recommendation === 'REJECT_MODIFICATION'
                        ? 'High Anomaly'
                        : 'Audit Trail Required'}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-200 mt-1">
                    {item.student_name} • {item.modification_type}
                  </h4>

                  <div className="text-xs text-slate-400 mt-1">
                    <span>Teacher: {item.teacher_name}</span> ({item.course_code})
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60 font-mono">
                    <span className="text-slate-400 line-through">{item.previous_value}</span>
                    <ArrowRight className="w-3 h-3 text-indigo-400" />
                    <span className="text-emerald-400 font-bold">{item.proposed_value}</span>
                  </div>

                  {item.confidence_score && (
                    <div className="mt-2 flex items-center justify-between text-[11px] bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800/80">
                      <span className="text-slate-400">Risk: {item.risk_score}/100</span>
                      <span className="font-semibold text-cyan-300 font-mono">
                        {Math.round(item.confidence_score * 100)}% Confidence
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Analysis & Decision Panel */}
        <div className="lg:col-span-7">
          {currentMod ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      {currentMod.request_code}
                    </span>
                    <span className="text-xs text-slate-400">• {currentMod.course_code}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mt-1">
                    {currentMod.modification_type} for {currentMod.student_name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Submitted by {currentMod.teacher_name}</p>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border uppercase ${
                    currentMod.status === 'Approved'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : currentMod.status === 'Rejected'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {currentMod.status}
                </span>
              </div>

              {/* Statistical Delta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Previous</span>
                  <div className="text-xs font-mono font-bold text-slate-300 mt-1">{currentMod.previous_value}</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Proposed</span>
                  <div className="text-xs font-mono font-bold text-emerald-400 mt-1">{currentMod.proposed_value}</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Class Avg</span>
                  <div className="text-xs font-mono font-bold text-slate-300 mt-1">{currentMod.class_average}%</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Historical Avg</span>
                  <div className="text-xs font-mono font-bold text-indigo-300 mt-1">
                    {currentMod.student_historical_average}%
                  </div>
                </div>
              </div>

              {/* Teacher Justification */}
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-xs font-semibold text-slate-300 block mb-1">Teacher Statement & Justification:</span>
                <p className="text-xs text-slate-300 italic leading-relaxed font-serif">"{currentMod.justification}"</p>
              </div>

              {/* AI Scoring Assistant Box */}
              <div className="bg-gradient-to-br from-indigo-950/30 to-slate-950 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    AI Principal Safety Assessment
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Gemini 3.8 / Heuristics</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Risk Score</span>
                    <span
                      className={`text-xl font-mono font-bold ${
                        (currentMod.risk_score || 0) > 60
                          ? 'text-rose-400'
                          : (currentMod.risk_score || 0) > 30
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {currentMod.risk_score ?? 20} / 100
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Confidence</span>
                    <span className="text-xl font-mono font-bold text-cyan-400">
                      {Math.round((currentMod.confidence_score || 0.95) * 100)}%
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Recommendation</span>
                    <span className="text-xs font-mono font-bold text-indigo-300 mt-1 block">
                      {currentMod.ai_recommendation || 'APPROVE_MODIFICATION'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                  <span className="font-semibold text-slate-200 block mb-0.5">Grading Curve Analysis:</span>
                  <p className="leading-relaxed text-[11px] text-slate-300">{currentMod.pattern_analysis}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleDecision(currentMod.id, 'Rejected')}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject Edit</span>
                </button>

                <button
                  onClick={() => handleDecision(currentMod.id, 'Approved')}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Modification</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              Select a modification request from the feed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
