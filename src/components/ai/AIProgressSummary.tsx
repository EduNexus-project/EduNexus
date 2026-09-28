import React, { useState } from 'react';
import { AIParentDigest } from '../../types';
import { Sparkles, RefreshCw, CheckCircle2, AlertTriangle, Lightbulb, BellRing, Clock } from 'lucide-react';

interface AIProgressSummaryProps {
  digest: AIParentDigest;
  onRegenerate: () => void;
  loading?: boolean;
}

export const AIProgressSummary: React.FC<AIProgressSummaryProps> = ({
  digest,
  onRegenerate,
  loading = false
}) => {
  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 p-5 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
              Cognitive Guardian AI Digest
            </span>
            <h3 className="text-base font-bold text-white leading-tight">
              Academic & Attendance Narrative
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-indigo-200 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5" />
            {digest.generatedAt}
          </span>
          <button
            onClick={onRegenerate}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Departure alert if afternoon session skipped */}
        {digest.afternoonDepartureAlert && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900">
            <BellRing className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
            <div className="text-xs">
              <h5 className="font-bold text-rose-950 text-sm">
                Afternoon Departure Alert ({digest.afternoonDepartureAlert.date})
              </h5>
              <p className="mt-1 leading-relaxed text-rose-800">
                Automated roll-call logs recorded presence in Forenoon sessions (09:00 AM – 12:45 PM),
                followed by absence in the Afternoon laboratory module (01:30 PM – 04:30 PM).
              </p>
            </div>
          </div>
        )}

        {/* Narrative Executive Summary */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Executive Performance Synthesis
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-sans">
            {digest.executiveSummary}
          </p>
        </div>

        {/* 3 Pillars: Strengths, Concerns, Interventions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Strengths */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Academic Strengths</span>
            </div>
            <ul className="space-y-2 text-xs text-emerald-950 flex-1">
              {digest.academicStrengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span className="leading-snug">{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Concerns */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 flex flex-col">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Attendance Concerns</span>
            </div>
            <ul className="space-y-2 text-xs text-amber-950 flex-1">
              {digest.attendanceConcerns.map((con, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="leading-snug">{con}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interventions */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-col">
            <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs uppercase tracking-wider mb-2.5">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <span>Recommended Actions</span>
            </div>
            <ul className="space-y-2 text-xs text-indigo-950 flex-1">
              {digest.recommendedInterventions.map((act, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span className="leading-snug">{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dual-Session Bar Metrics */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-4">
            <div>
              <span className="font-semibold text-slate-700">Forenoon Rate:</span>{' '}
              <span className="font-bold text-emerald-600 tabular-nums">{digest.fnAttendanceRate}%</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Afternoon Rate:</span>{' '}
              <span className={`font-bold tabular-nums ${digest.anAttendanceRate < 80 ? 'text-rose-600' : 'text-slate-800'}`}>
                {digest.anAttendanceRate}%
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            Powered by EduNexus Continuous Anomaly Model
          </span>
        </div>
      </div>
    </div>
  );
};
