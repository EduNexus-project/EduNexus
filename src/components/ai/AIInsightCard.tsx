import React from 'react';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Anomaly } from '../../types';

interface AIInsightCardProps {
  anomalies: Anomaly[];
  onViewAll?: () => void;
  onTriggerScan?: () => void;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  anomalies,
  onViewAll,
  onTriggerScan
}) => {
  const pending = anomalies.filter((a) => a.status === 'pending_review');
  const sessionSkippers = pending.filter((a) => a.type === 'session_skip');

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 p-6 text-white border border-indigo-500/20 shadow-xl">
      {/* Background glowing orbs */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300">
              <Sparkles className="w-5 h-5 text-purple-300 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Cognitive Sentinel Engine
              </span>
              <h3 className="text-lg font-bold text-white">Dual-Session AI Anomaly Watch</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onTriggerScan && (
              <button
                onClick={onTriggerScan}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-all backdrop-blur-xs"
              >
                Trigger Scan
              </button>
            )}
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/30"
              >
                <span>Review All ({pending.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Afternoon Disparities</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1 tabular-nums">
              {sessionSkippers.length} Students
            </p>
            <p className="text-[11px] text-amber-300/90 mt-0.5">
              High FN presence &gt; 90% with recurrent AN absences
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Detention Risk Threshold</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1 tabular-nums">
              {anomalies.filter((a) => a.riskLevel === 'high').length} Students
            </p>
            <p className="text-[11px] text-rose-300/90 mt-0.5">
              Cumulative attendance falling below mandatory 75%
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Institutional Safety Index</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1 tabular-nums">92.4%</p>
            <p className="text-[11px] text-emerald-300/90 mt-0.5">
              Cross-session attendance data consistency score
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
