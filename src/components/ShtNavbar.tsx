import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  HeartHandshake,
  Eye,
  Radio,
  Lock,
  BookOpen,
  LogOut,
  Terminal,
  GraduationCap,
  Bell,
  X,
  Smartphone,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { UserProfile, ERPUserRole, ERPNotification } from '../types/sht';

export type ShtNavTab =
  | 'principal'
  | 'teacher'
  | 'parent'
  | 'heatmap'
  | 'webhooks'
  | 'qa_audit'
  | 'guide';

interface ShtNavbarProps {
  activeTab: ShtNavTab;
  setActiveTab: (tab: ShtNavTab) => void;
  currentUser: UserProfile;
  activeAnomaliesCount: number;
  pendingCorrectionsCount: number;
  notifications?: ERPNotification[];
  onOpenDiagnostics: () => void;
  onLogout: () => void;
}

export const ShtNavbar: React.FC<ShtNavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  activeAnomaliesCount,
  pendingCorrectionsCount,
  notifications = [],
  onOpenDiagnostics,
  onLogout,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-40 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Tier */}
        <div className="flex items-center justify-between h-16">
          {/* Logo & SHT Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-bold">
              <GraduationCap className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-100 text-lg tracking-tight">SHT AI-ERP</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  Beta • Team 3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sakith Harvan Technologies • Fully Data-Driven
              </p>
            </div>
          </div>

          {/* Center: Authenticated Role & Status Indicator */}
          <div className="hidden md:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 font-medium">Verified Session:</span>
            <span className="font-bold text-slate-200">{currentUser.name}</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              {currentUser.role}
            </span>
          </div>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-2.5">
            {/* Truancy Flag Pill (visible to Principal) */}
            {currentUser.role === 'principal' && activeAnomaliesCount > 0 && (
              <button
                onClick={() => setActiveTab('principal')}
                title="Active Truancy Anomalies Detected"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-700/60 text-rose-300 text-xs font-bold transition hover:bg-rose-900/60"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>{activeAnomaliesCount} Anomaly</span>
              </button>
            )}

            {/* In-App Notification Center Bell */}
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition"
              title="Notification Center"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center font-mono">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Diagnostics */}
            <button
              onClick={onOpenDiagnostics}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Diagnostics</span>
            </button>

            {/* User Profile & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-300">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-semibold text-slate-200 leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">{currentUser.role}</div>
              </div>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/50 transition flex items-center gap-1.5 text-xs font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation based on Authenticated Role */}
        <div className="flex items-center space-x-1 border-t border-slate-800/80 pt-2 pb-2 overflow-x-auto scrollbar-none">
          {currentUser.role === 'principal' && (
            <>
              <button
                onClick={() => setActiveTab('principal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'principal'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                <span>Principal Portal</span>
                {pendingCorrectionsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950">
                    {pendingCorrectionsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('heatmap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'heatmap'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-300" />
                <span>3D Campus Heatmap</span>
              </button>

              <button
                onClick={() => setActiveTab('webhooks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'webhooks'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-amber-300" />
                <span>Realtime Webhooks</span>
              </button>

              <button
                onClick={() => setActiveTab('qa_audit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'qa_audit'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-cyan-300" />
                <span>QA Tests & Security Audit</span>
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'guide'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-300" />
                <span>Deployment Spec</span>
              </button>
            </>
          )}

          {currentUser.role === 'teacher' && (
            <button
              onClick={() => setActiveTab('teacher')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-indigo-600 text-white shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Teacher Workstation & Attendance Roll Call</span>
            </button>
          )}

          {currentUser.role === 'parent' && (
            <button
              onClick={() => setActiveTab('parent')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-indigo-600 text-white shadow-sm"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-rose-300" />
              <span>Parent Portal & Student Progress</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications Drawer */}
      {isNotifOpen && (
        <div className="absolute right-4 top-16 w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200">In-App Notification Center</h3>
            </div>
            <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {notifications.length > 0 ? (
              notifications.slice(0, 8).map((n) => (
                <div key={n.id} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-cyan-400 font-mono flex items-center gap-1">
                      <Smartphone className="w-3 h-3" />
                      {n.channel} • {n.recipient_phone}
                    </span>
                    <span className="text-slate-500 font-mono">{n.created_at?.split('T')[1]?.slice(0, 5)} UTC</span>
                  </div>
                  <p className="text-slate-200 text-[11px] leading-tight">{n.message}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span className="text-emerald-400 font-semibold">{n.status}</span>
                    <span className="font-mono">{n.latency_ms}ms</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs italic">
                No notifications logged yet.
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
