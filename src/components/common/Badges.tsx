import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, Sparkles, Clock, AlertOctagon } from 'lucide-react';
import { AttendanceStatus } from '../../types';

export const AttendanceBadge: React.FC<{ status: AttendanceStatus | string; className?: string }> = ({
  status,
  className = ''
}) => {
  const s = status.toLowerCase();
  if (s === 'present') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 ${className}`}>
        <CheckCircle className="w-3 h-3 text-emerald-600" />
        Present
      </span>
    );
  }
  if (s === 'absent') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 ${className}`}>
        <AlertOctagon className="w-3 h-3 text-rose-600" />
        Absent
      </span>
    );
  }
  if (s === 'late') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 ${className}`}>
        <Clock className="w-3 h-3 text-amber-600" />
        Late
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 ${className}`}>
      <CheckCircle className="w-3 h-3 text-indigo-600" />
      Excused / OD
    </span>
  );
};

export const RiskBadge: React.FC<{ level: 'low' | 'medium' | 'high'; className?: string }> = ({
  level,
  className = ''
}) => {
  if (level === 'high') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300 animate-pulse ${className}`}>
        <ShieldAlert className="w-3 h-3 text-rose-600" />
        High Risk
      </span>
    );
  }
  if (level === 'medium') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 ${className}`}>
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        Medium Risk
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 ${className}`}>
      <CheckCircle className="w-3 h-3 text-emerald-600" />
      Low Risk
    </span>
  );
};

export const ConfidenceBadge: React.FC<{ score: number; className?: string }> = ({
  score,
  className = ''
}) => {
  const color =
    score >= 90
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : score >= 75
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${color} ${className}`}>
      <Sparkles className="w-3 h-3 text-purple-600" />
      {score}% AI Confidence
    </span>
  );
};
