import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Send,
  Zap,
  Building,
  DollarSign,
  User,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { ApprovalItem, AIScoringResult } from '../types/erp';

interface ApprovalScoringProps {
  approvals: ApprovalItem[];
  onRefresh: () => void;
  onOpenNewReqModal: () => void;
}

export const ApprovalScoringAssistant: React.FC<ApprovalScoringProps> = ({
  approvals,
  onRefresh,
  onOpenNewReqModal,
}) => {
  const [selectedId, setSelectedId] = useState<string>(approvals[0]?.id || '');
  const [selectedProvider, setSelectedProvider] = useState<'auto' | 'gemini' | 'groq'>('auto');
  const [isScoring, setIsScoring] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const currentItem = approvals.find((a) => a.id === selectedId) || approvals[0];

  const handleRunScoring = async () => {
    if (!currentItem) return;
    setIsScoring(true);
    setActionFeedback(null);

    try {
      const res = await fetch('/api/ai/approval-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId: currentItem.id,
          title: currentItem.title,
          category: currentItem.category,
          department: currentItem.department,
          amount: currentItem.amount,
          currency: currentItem.currency,
          requested_by: currentItem.requested_by,
          justification: currentItem.justification,
          description: currentItem.description,
          provider: selectedProvider,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Scoring failed');
      }

      await res.json();
      setActionFeedback(`Successfully scored using ${selectedProvider.toUpperCase()} model.`);
      onRefresh();
    } catch (err: any) {
      setActionFeedback(`Error: ${err.message}`);
    } finally {
      setIsScoring(false);
    }
  };

  const handleUpdateStatus = async (status: 'Approved' | 'Rejected' | 'Escalated') => {
    if (!currentItem) return;
    try {
      const res = await fetch(`/api/erp/approvals/${currentItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setActionFeedback(`Requisition marked as ${status}.`);
        onRefresh();
      }
    } catch (err: any) {
      setActionFeedback(`Failed to update status: ${err.message}`);
    }
  };

  const filteredApprovals = approvals.filter((item) => {
    if (filterCategory === 'all') return true;
    return item.category.toLowerCase() === filterCategory.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">AI Approval Scoring Assistant</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time compliance validation, risk scoring (0-100), policy audit, and automated workflow recommendation via Groq & Gemini backend LLMs.
          </p>
        </div>

        {/* Provider Selector */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-medium flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Engine:
          </span>
          <button
            onClick={() => setSelectedProvider('auto')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              selectedProvider === 'auto'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Auto Route
          </button>
          <button
            onClick={() => setSelectedProvider('gemini')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              selectedProvider === 'gemini'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gemini 3.8
          </button>
          <button
            onClick={() => setSelectedProvider('groq')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              selectedProvider === 'groq'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Groq Llama-3.3
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="bg-slate-800/80 border border-slate-700 text-slate-200 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            {actionFeedback}
          </span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: List on Left, Detail & AI Scoring on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pending Requisitions ({filteredApprovals.length})
              </span>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              aria-label="Filter requisitions by category"
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="Procurement">Procurement</option>
              <option value="Expense Claim">Expense Claim</option>
              <option value="Travel">Travel</option>
            </select>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredApprovals.map((item) => {
              const isSelected = item.id === (currentItem?.id || '');
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500/80 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs text-indigo-400 font-semibold">{item.request_code}</span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                        item.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.status === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : item.status === 'Escalated'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-200 mt-1 line-clamp-1">{item.title}</h3>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60">
                    <span className="truncate max-w-[150px]">{item.department}</span>
                    <span className="font-semibold text-slate-200 font-mono">
                      {item.currency} {item.amount.toLocaleString()}
                    </span>
                  </div>

                  {/* AI Pill if already scored */}
                  {item.risk_score !== undefined && (
                    <div className="mt-2.5 flex items-center justify-between text-[11px] bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.risk_score > 60
                              ? 'bg-rose-500'
                              : item.risk_score > 30
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <span className="text-slate-400">Risk: {item.risk_score}/100</span>
                      </div>
                      <span className="font-semibold font-mono text-indigo-300">{item.ai_recommendation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={onOpenNewReqModal}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 text-xs font-medium text-slate-400 hover:text-indigo-300 transition flex items-center justify-center gap-2"
          >
            <span>+ Create Custom Requisition to Test AI Scoring</span>
          </button>
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-7 space-y-4">
          {currentItem ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      {currentItem.request_code}
                    </span>
                    <span className="text-xs text-slate-400">• {currentItem.category}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100 mt-1">{currentItem.title}</h2>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {currentItem.currency} {currentItem.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">Requisition Amount</div>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    Requester
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                    {currentItem.requested_by}
                  </div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-500" />
                    Department
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                    {currentItem.department}
                  </div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Current Status
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">{currentItem.status}</div>
                </div>
              </div>

              {/* Description & Justification */}
              <div className="space-y-3">
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-300 block mb-1">Scope & Description:</span>
                  <p className="text-xs text-slate-400 leading-relaxed">{currentItem.description}</p>
                </div>
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-300 block mb-1">Institutional Justification:</span>
                  <p className="text-xs text-slate-400 leading-relaxed">{currentItem.justification}</p>
                </div>
              </div>

              {/* AI Scoring Assistant Box */}
              <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold text-slate-100">AI Scoring Engine Assessment</span>
                  </div>

                  <button
                    onClick={handleRunScoring}
                    disabled={isScoring}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow transition"
                  >
                    {isScoring ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>{currentItem.risk_score !== undefined ? 'Re-Score via LLM' : 'Run AI Scoring'}</span>
                      </>
                    )}
                  </button>
                </div>

                {currentItem.risk_score !== undefined ? (
                  <div className="space-y-4 pt-2">
                    {/* Score Bar & Recommendation */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Risk Score */}
                      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                          Risk Score
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span
                            className={`text-2xl font-black font-mono ${
                              currentItem.risk_score > 60
                                ? 'text-rose-400'
                                : currentItem.risk_score > 30
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {currentItem.risk_score}
                          </span>
                          <span className="text-xs text-slate-500">/ 100</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              currentItem.risk_score > 60
                                ? 'bg-rose-500'
                                : currentItem.risk_score > 30
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, currentItem.risk_score)}%` }}
                          />
                        </div>
                      </div>

                      {/* AI Recommendation */}
                      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                          AI Recommendation
                        </span>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                              currentItem.ai_recommendation === 'APPROVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : currentItem.ai_recommendation === 'REJECT'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {currentItem.ai_recommendation === 'APPROVE' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {currentItem.ai_recommendation === 'REJECT' && <XCircle className="w-3.5 h-3.5" />}
                            {currentItem.ai_recommendation === 'ESCALATE' && <AlertTriangle className="w-3.5 h-3.5" />}
                            {currentItem.ai_recommendation}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 mt-2">
                          Confidence: {Math.round((currentItem.confidence_score || 0.9) * 100)}%
                        </span>
                      </div>

                      {/* Provider & Model */}
                      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                          Evaluated By
                        </span>
                        <div className="mt-1">
                          <div className="text-xs font-bold text-slate-200 uppercase font-mono">
                            {currentItem.ai_provider_used || 'Express LLM'}
                          </div>
                          <div className="text-[11px] text-indigo-400 font-mono truncate">
                            {currentItem.ai_provider_used === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-3.8-flash'}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-2">Zero Client Secret Exposure</span>
                      </div>
                    </div>

                    {/* Policy Violations */}
                    {currentItem.policy_violations && currentItem.policy_violations.length > 0 && (
                      <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-3">
                        <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5 mb-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                          Detected Policy Violations ({currentItem.policy_violations.length})
                        </span>
                        <ul className="space-y-1">
                          {currentItem.policy_violations.map((violation, i) => (
                            <li key={i} className="text-xs text-rose-200/90 flex items-start gap-1.5">
                              <span className="text-rose-500 font-bold">•</span>
                              {violation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Analysis Summary */}
                    {currentItem.ai_analysis_summary && (
                      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-xs font-semibold text-slate-300 block mb-1">Scoring Rationale:</span>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {currentItem.ai_analysis_summary}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                    <Sparkles className="w-8 h-8 text-indigo-400/40 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">
                      This requisition has not been audited yet. Click "Run AI Scoring" to initiate server-side Groq or Gemini risk assessment.
                    </p>
                  </div>
                )}
              </div>

              {/* Human Decision Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleUpdateStatus('Rejected')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus('Escalated')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 transition flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Escalate to CFO/VP</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus('Approved')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Requisition</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              No requisition selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
