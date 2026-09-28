import React, { useState } from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { AnomalyAlert } from '../../components/ai/AnomalyAlert';
import { Sparkles, Filter, ShieldAlert, CheckCircle2, RotateCw } from 'lucide-react';
import { AnomalyType } from '../../types';

export const PrincipalAnomalies: React.FC = () => {
  const { anomalies, reviewAnomaly, runAiAnomalyScan } = useERPData();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      runAiAnomalyScan();
      setIsScanning(false);
    }, 600);
  };

  const filtered = anomalies.filter((a) => {
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (filterRisk !== 'all' && a.riskLevel !== filterRisk) return false;
    return true;
  });

  const highRiskCount = anomalies.filter((a) => a.riskLevel === 'high').length;
  const sessionSkipCount = anomalies.filter((a) => a.type === 'session_skip').length;
  const pendingCount = anomalies.filter((a) => a.status === 'pending_review').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
            Cognitive Anomaly Sentinel
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            AI Anomaly & Pattern Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inference engine scanning morning lectures vs afternoon laboratory logs.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning Telemetry...' : 'Trigger Live AI Scan'}</span>
        </button>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Review</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums font-mono">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting Principal endorsement</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Session Skippers</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-1 tabular-nums font-mono">{sessionSkipCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Present in FN, absent in AN</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Critical Detention Risks</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums font-mono">{highRiskCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Consecutive streaks &lt;75% cutoff</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Anomaly Patterns ({anomalies.length})
          </button>
          <button
            onClick={() => setFilterType('session_skip')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'session_skip'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Session Skips (FN vs AN)
          </button>
          <button
            onClick={() => setFilterType('consecutive_streak')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'consecutive_streak'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Consecutive Absence Streaks
          </button>
          <button
            onClick={() => setFilterType('friday_pattern')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'friday_pattern'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Friday Departure Trend
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Risk:</span>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk Only</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No Anomalies Found for Active Filter</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the filters or running a fresh AI scan.</p>
          </div>
        ) : (
          filtered.map((anomaly) => (
            <AnomalyAlert
              key={anomaly.id}
              anomaly={anomaly}
              onReview={(id, status, notes) => reviewAnomaly(id, status, 'Dr. Ramesh Sundaram', notes)}
            />
          ))
        )}
      </div>
    </div>
  );
};
