import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { DEMO_USERS } from '../../data/mockData';
import { Shield, GraduationCap, Users, ArrowRight, Lock, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('principal');
  const [email, setEmail] = useState(DEMO_USERS.principal.email);
  const [password, setPassword] = useState('nexus@2026');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(DEMO_USERS[role].email);
    setPassword(role === 'principal' ? 'nexus@2026' : role === 'teacher' ? 'teacher@2026' : 'parent@2026');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
    if (onLoginSuccess) onLoginSuccess();
  };

  const handleFastDemoLogin = (role: UserRole) => {
    login(role);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-black text-2xl shadow-xl shadow-indigo-500/25 mb-3">
            E
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">EduNexus ERP</h1>
          <p className="text-xs text-indigo-300 font-medium mt-1">
            Enterprise Academic Management & AI Sentinel Engine
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Quick Demo Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Demo Persona (1-Click Test Access)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('principal')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedRole === 'principal'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-xs'
                    : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-4 h-4 mb-1 text-indigo-400" />
                <span>Principal</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('teacher')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedRole === 'teacher'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-xs'
                    : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4 mb-1 text-emerald-400" />
                <span>Teacher</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('parent')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedRole === 'parent'
                    ? 'bg-sky-600/20 border-sky-500 text-sky-300 shadow-xs'
                    : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4 mb-1 text-sky-400" />
                <span>Parent</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Institutional Email ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <span className="text-[10px] text-indigo-400">Pre-filled for testing</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <span>Access {selectedRole.toUpperCase()} Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Instant Fast Login Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center mb-2">
              Instant One-Click Entry
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleFastDemoLogin('principal')}
                className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  Dr. Ramesh Sundaram (Principal)
                </span>
                <span className="text-[10px] text-indigo-400 font-bold">Enter →</span>
              </button>

              <button
                type="button"
                onClick={() => handleFastDemoLogin('teacher')}
                className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  Prof. Anitha Vasudevan (Teacher)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Enter →</span>
              </button>

              <button
                type="button"
                onClick={() => handleFastDemoLogin('parent')}
                className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  Suresh Kumar (Parent)
                </span>
                <span className="text-[10px] text-sky-400 font-bold">Enter →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Feature Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Dual-Session (FN & AN)
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Anomaly Detection
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Digital Sign-Off
          </span>
        </div>
      </div>
    </div>
  );
};
