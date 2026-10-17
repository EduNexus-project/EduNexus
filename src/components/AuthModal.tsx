import React, { useState } from 'react';
import {
  X,
  Lock,
  ShieldCheck,
  Users,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Key,
} from 'lucide-react';
import { UserProfile, ERPUserRole } from '../types/sht';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (role: ERPUserRole, customEmail?: string) => void;
  currentUser: UserProfile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  currentUser,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    let assignedRole: ERPUserRole = 'teacher';
    if (emailInput.includes('principal')) assignedRole = 'principal';
    else if (emailInput.includes('parent')) assignedRole = 'parent';
    onLogin(assignedRole, emailInput);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Lock className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100">SHT AI-ERP Authentication & Roles</h2>
              <p className="text-xs text-slate-400">Sakith Harvan Technologies (Team 3)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: Explicitly Separated Demo Mode Quick-Switch */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Demo Mode Account Presets (Presentation Testing)
            </span>
            <span className="text-[10px] font-mono text-slate-400">Pre-provisioned</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Select a verified demo account to inspect role-specific permissions and capabilities:
          </p>

          <div className="space-y-2">
            {/* Principal Preset */}
            <div
              onClick={() => {
                onLogin('principal');
                onClose();
              }}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                currentUser.role === 'principal'
                  ? 'bg-indigo-950/40 border-indigo-500'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-indigo-500/10 text-cyan-300 border border-indigo-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-200">Dr. K. S. Raman (Principal)</div>
                  <div className="text-[10px] text-slate-400 font-mono">principal@sht.edu • Full Administrative Authority</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400" />
            </div>

            {/* Teacher Preset */}
            <div
              onClick={() => {
                onLogin('teacher');
                onClose();
              }}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                currentUser.role === 'teacher'
                  ? 'bg-indigo-950/40 border-indigo-500'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  <Users className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-200">Prof. Marcus Vance (Teacher)</div>
                  <div className="text-[10px] text-slate-400 font-mono">teacher.marcus@sht.edu • Class 10-A Assigned</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400" />
            </div>

            {/* Parent Preset */}
            <div
              onClick={() => {
                onLogin('parent');
                onClose();
              }}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                currentUser.role === 'parent'
                  ? 'bg-indigo-950/40 border-indigo-500'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30">
                  <HeartHandshake className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-200">Elena Rossi (Parent)</div>
                  <div className="text-[10px] text-slate-400 font-mono">parent.rossi@sht.edu • Linked to Mateo Rossi</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-400" />
            </div>
          </div>
        </div>

        {/* SECTION 2: Custom Credential Sign-In */}
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Or Sign In With Custom Email
          </span>
          <form onSubmit={handleCustomSubmit} className="space-y-3 text-xs">
            <div>
              <input
                type="email"
                placeholder="e.g. your.name@sht.edu"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="••••••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
            >
              Authenticate Session
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
