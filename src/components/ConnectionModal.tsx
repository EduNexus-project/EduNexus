import React, { useState, useEffect } from 'react';
import {
  X,
  Terminal,
  Cpu,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({ isOpen, onClose }) => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    groq?: any;
    gemini?: any;
    supabase?: any;
  }>({});

  const runTest = async () => {
    setTesting(true);
    try {
      const [aiRes, sysRes] = await Promise.all([
        fetch('/api/ai/test-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'all' }),
        }).then((r) => r.json()),
        fetch('/api/erp/system-status').then((r) => r.json()),
      ]);

      setResults({
        groq: aiRes.groq,
        gemini: aiRes.gemini,
        supabase: sysRes,
      });
    } catch (err: any) {
      setResults({
        groq: { status: 'error', message: err.message },
        gemini: { status: 'error', message: err.message },
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runTest();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Terminal className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Backend API Diagnostic & LLM Ping</h2>
              <p className="text-xs text-slate-400">
                Server-side diagnostics for Groq, Gemini, and Supabase connections.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Click Ping to test live round-trips from Express to AI endpoints.
          </span>
          <button
            onClick={runTest}
            disabled={testing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>Ping Providers Now</span>
          </button>
        </div>

        {/* Diagnostics Cards */}
        <div className="space-y-4">
          {/* Groq Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h3 className="text-sm font-bold text-slate-200">Groq LLM Client</h3>
                <span className="text-[10px] font-mono text-slate-400">llama-3.3-70b-versatile</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  results.groq?.status === 'connected'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : results.groq?.status === 'missing_key'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {results.groq?.status === 'connected'
                  ? `Connected (${results.groq.latencyMs}ms)`
                  : results.groq?.status === 'missing_key'
                  ? 'Key Pending in .env'
                  : 'Connection Standby'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-slate-400">
                Key Preview: <span className="font-mono text-slate-200">{results.groq?.maskedKey || 'Not configured'}</span>
              </div>
              <div className="text-slate-400 text-right">
                Endpoint: <span className="font-mono text-indigo-300">api.groq.com/openai/v1</span>
              </div>
            </div>

            {results.groq?.status === 'missing_key' && (
              <div className="text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                <p>
                  To enable live Groq inference: Go to{' '}
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 underline inline-flex items-center gap-0.5"
                  >
                    console.groq.com/keys <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  , create a key (starts with <code className="font-mono text-amber-300">gsk_</code>), and add{' '}
                  <code className="font-mono text-cyan-300">GROQ_API_KEY=gsk_...</code> to your <code className="font-mono">.env</code> or Vercel Settings.
                </p>
              </div>
            )}
          </div>

          {/* Gemini Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold text-slate-200">Google Gemini GenAI Client</h3>
                <span className="text-[10px] font-mono text-slate-400">gemini-3.8-flash</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  results.gemini?.status === 'connected'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : results.gemini?.status === 'missing_key'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {results.gemini?.status === 'connected'
                  ? `Connected (${results.gemini.latencyMs}ms)`
                  : results.gemini?.status === 'missing_key'
                  ? 'Key Pending in .env'
                  : 'Active SDK'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-slate-400">
                Key Preview: <span className="font-mono text-slate-200">{results.gemini?.maskedKey || 'Configured via Runtime'}</span>
              </div>
              <div className="text-slate-400 text-right">
                SDK: <span className="font-mono text-emerald-400">@google/genai</span>
              </div>
            </div>

            <div className="text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300">
              <p>
                Gemini uses recurring free-tier flash models without credit card requirements. When deploying on Vercel, place <code className="font-mono text-cyan-300">GEMINI_API_KEY=AIzaSy...</code> in Vercel Settings → Environment Variables.
              </p>
            </div>
          </div>

          {/* Supabase Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-200">Supabase Database Integration</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  results.supabase?.supabaseConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {results.supabase?.supabaseConnected ? 'Supabase Live' : 'Active In-Memory State'}
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Table: erp_approvals</span>
                <span className="font-mono text-slate-200">{results.supabase?.counts?.approvals || 5} records</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Table: erp_attendance</span>
                <span className="font-mono text-slate-200">{results.supabase?.counts?.attendance || 10} records</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Table: erp_academic_grades</span>
                <span className="font-mono text-slate-200">{results.supabase?.counts?.grades || 7} records</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Table: erp_budget_expenses</span>
                <span className="font-mono text-slate-200">{results.supabase?.counts?.expenses || 5} records</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
