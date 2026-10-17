import React from 'react';
import {
  Cpu,
  ShieldCheck,
  Database,
  Sparkles,
  Terminal,
  BookOpen,
  Users,
  Radio,
  Eye,
  HeartHandshake,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { SystemStatus } from '../types/erp';

export type ActiveTab =
  | 'principal'
  | 'teacher'
  | 'parent'
  | '3d_heatmap'
  | 'webhooks'
  | 'approvals_general'
  | 'qa_audit'
  | 'guide';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  systemStatus: SystemStatus | null;
  activeTruancyCount: number;
  onOpenTestModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  activeTruancyCount,
  onOpenTestModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-rose-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
              <Cpu className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-lg tracking-tight">PARALLEL ERP</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Team 3 • Parallel Microservices
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Supabase Realtime Webhooks • AI Truancy Anomaly Engine • Three.js 3D Heatmaps
              </p>
            </div>
          </div>

          {/* Service Status Badges */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Truancy Flag Indicator */}
            {activeTruancyCount > 0 && (
              <button
                onClick={() => setActiveTab('principal')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-950/60 border border-rose-700/60 text-rose-300"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{activeTruancyCount} Truancy Alert</span>
              </button>
            )}

            {/* Groq Badge */}
            <button
              onClick={onOpenTestModal}
              title="Groq LLM Status"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  systemStatus?.groqKeyConfigured ? 'bg-amber-400' : 'bg-slate-500'
                }`}
              />
              <span className="font-mono text-[11px]">Groq</span>
            </button>

            {/* Gemini Badge */}
            <button
              onClick={onOpenTestModal}
              title="Gemini LLM Status"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  systemStatus?.geminiKeyConfigured ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
              <span className="font-mono text-[11px]">Gemini 3.8</span>
            </button>

            {/* Supabase Badge */}
            <button
              onClick={onOpenTestModal}
              title="Supabase Realtime Webhooks"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[11px]">Supabase Realtime</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTestModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Diagnostics</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-t border-slate-800/80 pt-2 pb-2 overflow-x-auto scrollbar-none">
          {/* 1. Principal Portal */}
          <button
            onClick={() => setActiveTab('principal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'principal'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
            <span>Principal Portal & AI Scorer</span>
            {activeTruancyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white">
                !
              </span>
            )}
          </button>

          {/* 2. Teacher Portal */}
          <button
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'teacher'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Teacher Portal & FN/AN Roll Call</span>
          </button>

          {/* 3. Parent Portal */}
          <button
            onClick={() => setActiveTab('parent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'parent'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-rose-300" />
            <span>Parent Portal & AI Narrative</span>
          </button>

          {/* 4. 3D Campus Heatmap (Three.js) */}
          <button
            onClick={() => setActiveTab('3d_heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === '3d_heatmap'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-300" />
            <span>3D Campus Heatmap (Three.js)</span>
          </button>

          {/* 5. Webhooks & Realtime Stream */}
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'webhooks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-300" />
            <span>Webhooks & Alerts Stream</span>
          </button>

          {/* 6. QA & Security Audit */}
          <button
            onClick={() => setActiveTab('qa_audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'qa_audit'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-cyan-300" />
            <span>QA & Security Audit</span>
          </button>

          {/* 7. Architecture & Vercel Guide */}
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-300" />
            <span>Vercel & Vibe Coding Spec</span>
          </button>
        </div>
      </div>
    </header>
  );
};
