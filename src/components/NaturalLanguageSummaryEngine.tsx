import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  FileSpreadsheet,
  GraduationCap,
  Users,
  DollarSign,
  AlertOctagon,
  CheckCircle,
  Copy,
  Check,
  Loader2,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import { AISummaryResult, AttendanceItem, GradeItem, ExpenseItem } from '../types/erp';

interface SummaryEngineProps {
  attendanceData: AttendanceItem[];
  gradesData: GradeItem[];
  expensesData: ExpenseItem[];
}

export const NaturalLanguageSummaryEngine: React.FC<SummaryEngineProps> = ({
  attendanceData,
  gradesData,
  expensesData,
}) => {
  const [selectedDataset, setSelectedDataset] = useState<'attendance_and_grades' | 'financial_expenses' | 'executive_overview'>('attendance_and_grades');
  const [selectedProvider, setSelectedProvider] = useState<'auto' | 'gemini' | 'groq'>('auto');
  const [focusArea, setFocusArea] = useState<string>('operational_risks');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [summaryResult, setSummaryResult] = useState<AISummaryResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    // Prepare payload based on chosen dataset
    let payload: Record<string, any> = {};
    if (selectedDataset === 'attendance_and_grades') {
      payload = {
        attendance: attendanceData,
        grades: gradesData,
      };
    } else if (selectedDataset === 'financial_expenses') {
      payload = {
        expenses: expensesData,
      };
    } else {
      payload = {
        attendance: attendanceData,
        grades: gradesData,
        expenses: expensesData,
      };
    }

    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataPayload: payload,
          summaryType: selectedDataset,
          provider: selectedProvider,
          focus: focusArea,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to synthesize summary');
      }

      const data: AISummaryResult = await res.json();
      setSummaryResult(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!summaryResult) return;
    const text = `PARALLEL ERP EXECUTIVE BRIEFING\n\nHeadline: ${summaryResult.headline}\n\nExecutive Summary:\n${summaryResult.executive_summary}\n\nKey Findings:\n${summaryResult.key_findings.map((f) => `- ${f}`).join('\n')}\n\nAnomalies Detected:\n${summaryResult.anomalies_detected.map((a) => `- ${a}`).join('\n')}\n\nAction Items:\n${summaryResult.action_items.map((i) => `[ ] ${i}`).join('\n')}\n\nHealth Rating: ${summaryResult.health_rating}\nGenerated via: ${summaryResult.ai_provider_used?.toUpperCase() || 'LLM'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">AI Natural Language Summary Engine</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Synthesizes raw student attendance, academic marks, and departmental budget variance into clear, decision-ready executive briefings using server-side LLMs.
          </p>
        </div>

        {/* Engine Toggle */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-medium flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Provider:
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

      {errorMsg && (
        <div className="bg-rose-950/40 border border-rose-800 text-rose-300 text-xs px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Dataset Selection Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dataset 1 */}
        <div
          onClick={() => setSelectedDataset('attendance_and_grades')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            selectedDataset === 'attendance_and_grades'
              ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">Academic & Attendance</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Correlates student attendance logs with midterm test scores across CS & Data Science cohorts.
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
            <span>{attendanceData.length} Attendance Logs</span>
            <span>•</span>
            <span>{gradesData.length} Grade Records</span>
          </div>
        </div>

        {/* Dataset 2 */}
        <div
          onClick={() => setSelectedDataset('financial_expenses')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            selectedDataset === 'financial_expenses'
              ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Departmental Budgets</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Evaluates quarterly allocations, spent amounts, and fiscal variance across engineering and admin.
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
            <span>{expensesData.length} Department Ledgers</span>
            <span>•</span>
            <span>Q4-2026 Fiscal Year</span>
          </div>
        </div>

        {/* Dataset 3 */}
        <div
          onClick={() => setSelectedDataset('executive_overview')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            selectedDataset === 'executive_overview'
              ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-200">Holistic Parallel Overview</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Cross-domain executive digest synthesizing academic success, operational uptime, and fiscal burn.
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
            <span>Unified Multi-Table Feed</span>
          </div>
        </div>
      </div>

      {/* Synthesis Configuration & Trigger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Synthesis Lens:</span>
          <select
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            aria-label="Synthesis focus area"
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="operational_risks">Focus: Operational Risks & Anomalies</option>
            <option value="academic_intervention">Focus: Student Retention & Academic Interventions</option>
            <option value="budgetary_efficiency">Focus: Fiscal Efficiency & Burn Rates</option>
            <option value="executive_briefing">Focus: High-Level Board of Regents Summary</option>
          </select>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={isGenerating}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-indigo-600 to-cyan-500 hover:opacity-95 disabled:opacity-50 text-white shadow-lg shadow-indigo-500/20 transition"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing Records...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Natural Language Briefing</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Output Result */}
      {summaryResult ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    summaryResult.health_rating === 'EXCELLENT'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : summaryResult.health_rating === 'STABLE'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : summaryResult.health_rating === 'ATTENTION_REQUIRED'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  Health: {summaryResult.health_rating}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Synthesized with {summaryResult.ai_provider_used?.toUpperCase() || 'LLM'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-1">{summaryResult.headline}</h2>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Briefing'}</span>
            </button>
          </div>

          {/* Narrative Executive Summary */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">
              Executive Synthesis
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">{summaryResult.executive_summary}</p>
          </div>

          {/* Findings & Anomalies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Findings */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Key Operational Insights
              </span>
              <ul className="space-y-2">
                {summaryResult.key_findings.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Anomalies Detected */}
            <div className="bg-amber-950/10 p-4 rounded-xl border border-amber-900/30">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                <AlertOctagon className="w-4 h-4 text-amber-400" />
                Anomalies & Variance Flags
              </span>
              <ul className="space-y-2">
                {summaryResult.anomalies_detected.map((item, idx) => (
                  <li key={idx} className="text-xs text-amber-200/90 flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">⚠</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-900/30">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Recommended Leadership Action Plan
            </span>
            <div className="space-y-2">
              {summaryResult.action_items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-mono font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No briefing generated yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Select an operational dataset above and click "Generate Natural Language Briefing" to run the AI Summary Engine.
          </p>
        </div>
      )}
    </div>
  );
};
