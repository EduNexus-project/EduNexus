import React, { useState } from 'react';
import { Anomaly } from '../../types';
import { RiskBadge, ConfidenceBadge } from '../common/Badges';
import { AlertTriangle, Clock, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AnomalyAlertProps {
  anomaly: Anomaly;
  onReview?: (anomalyId: string, status: Anomaly['status'], notes?: string) => void;
  compact?: boolean;
}

export const AnomalyAlert: React.FC<AnomalyAlertProps> = ({
  anomaly,
  onReview,
  compact = false
}) => {
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');

  const handleAction = (status: Anomaly['status']) => {
    if (onReview) {
      onReview(anomaly.id, status, notes || undefined);
    }
    setShowNotesModal(false);
  };

  return (
    <div
      className={`rounded-2xl border transition-all ${
        anomaly.riskLevel === 'high'
          ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
          : anomaly.riskLevel === 'medium'
          ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
          : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
      } p-4 sm:p-5`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <RiskBadge level={anomaly.riskLevel} />
          <ConfidenceBadge score={anomaly.confidenceScore} />
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {anomaly.detectedAt}
          </span>
        </div>

        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
            anomaly.status === 'pending_review'
              ? 'bg-amber-100 text-amber-800'
              : anomaly.status === 'reviewed'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {anomaly.status.replace('_', ' ')}
        </span>
      </div>

      <div className="mt-2.5">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          {anomaly.riskLevel === 'high' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
          {anomaly.title}
        </h4>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{anomaly.description}</p>
      </div>

      {/* Target student metadata */}
      <div className="mt-3 p-2.5 rounded-xl bg-white/80 border border-slate-200/80 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-slate-800">{anomaly.studentName}</span>
          <span className="text-slate-400 font-mono ml-2">({anomaly.rollNumber})</span>
        </div>
        <span className="text-slate-500 font-medium">{anomaly.className}</span>
      </div>

      {/* Evidence & AI Suggested Action */}
      {!compact && (
        <div className="mt-3 space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-700">
            <span className="font-bold text-slate-900 block mb-0.5 text-[11px] uppercase tracking-wider">
              Telemetry Evidence
            </span>
            <p className="font-mono text-[11px] text-slate-600">{anomaly.evidence}</p>
          </div>

          {anomaly.aiSuggestedAction && (
            <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-900">
              <span className="font-bold text-purple-950 block mb-0.5 text-[11px] uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                AI Recommended Action
              </span>
              <p className="text-[11px] leading-relaxed">{anomaly.aiSuggestedAction}</p>
            </div>
          )}
        </div>
      )}

      {/* Review actions for Administrator/Principal */}
      {onReview && anomaly.status === 'pending_review' && (
        <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-end gap-2">
          <button
            onClick={() => handleAction('escalated')}
            className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100/60 rounded-xl transition-colors"
          >
            Escalate to Dean
          </button>
          <button
            onClick={() => handleAction('reviewed')}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mark Reviewed</span>
          </button>
        </div>
      )}
    </div>
  );
};
