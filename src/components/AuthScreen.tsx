import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Users,
  HeartHandshake,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Phone,
  KeyRound,
  IdCard,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { UserProfile, ERPUserRole } from '../types/sht';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile, token: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [viewMode, setViewMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [selectedRole, setSelectedRole] = useState<ERPUserRole>('principal');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Multi-step Registration state
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [regRole, setRegRole] = useState<ERPUserRole>('principal');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Role-specific fields
  const [schoolName, setSchoolName] = useState('Sakith Harvan Technologies Institute');
  const [institutionCode, setInstitutionCode] = useState('SHT-ADMIN-2026');
  const [staffId, setStaffId] = useState('');
  const [department, setDepartment] = useState('Computer Science & AI');
  const [studentId, setStudentId] = useState('');

  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessUser, setRegSuccessUser] = useState<UserProfile | null>(null);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim()) {
      setLoginError('Please enter your registered email address.');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch('/api/sht/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
          role: selectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify your credentials.');
      }

      if (rememberMe) {
        localStorage.setItem('sht_remember_email', loginEmail.trim());
      } else {
        localStorage.removeItem('sht_remember_email');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async () => {
    setRegError(null);

    // Validation
    if (!regName.trim()) {
      setRegError('Please enter your full official name.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Please enter your official email address.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Password and Confirm Password do not match.');
      return;
    }
    if (regRole === 'principal' && !termsAccepted) {
      setRegError('You must accept the Institutional Governance and Privacy Terms.');
      return;
    }

    setRegLoading(true);
    try {
      const res = await fetch('/api/sht/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          role: regRole,
          phone: regPhone.trim(),
          department,
          school_name: schoolName,
          institution_code: institutionCode.trim(),
          staff_id: staffId.trim(),
          student_id: studentId.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed. Please review your details.');
      }

      setRegSuccessUser(data.user);
    } catch (err: any) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
            <GraduationCap className="w-5 h-5 text-cyan-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-100 text-lg tracking-tight">SHT AI-ERP</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Beta • Team 3
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Sakith Harvan Technologies</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {viewMode === 'login' ? (
            <button
              onClick={() => {
                setViewMode('register');
                setRegStep(1);
                setRegError(null);
                setRegSuccessUser(null);
              }}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 hover:border-indigo-500/50 transition flex items-center gap-1.5"
            >
              <span>Create Account</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                setViewMode('login');
                setLoginError(null);
              }}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              Already registered? Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch justify-center max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-8">
        {/* LEFT SECTION: Brand Story & Highlights */}
        <div className="lg:w-1/2 flex flex-col justify-between bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-indigo-950/30 border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle geometric background shapes */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Next-Generation Intelligent School Management</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight leading-tight">
              Smarter Schools. <br />
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-200 bg-clip-text text-transparent">
                Better Outcomes.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              An institutional ERP system engineered with dual-session Forenoon (FN) & Afternoon (AN) attendance tracking,
              autonomous AI truancy anomaly detection, and automated administrative approval scoring.
            </p>

            {/* Feature Highlights Cards */}
            <div className="space-y-3.5 pt-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3.5">
                <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Smart Attendance & Truancy AI</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dual FN & AN roll call with automatic anomaly flagging whenever a student is Present in Forenoon but Absent in Afternoon.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3.5">
                <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">AI Scoring & Principal Approvals</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Teacher grade and attendance correction requests are evaluated with an AI risk engine before Principal final sign-off.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3.5">
                <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <HeartHandshake className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Parent Transparency & Webhooks</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Data isolation ensures parents see only their verified children with automated multi-channel alert notifications.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SHT Team 3 Credit Badge */}
          <div className="relative z-10 pt-6 mt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <div>
              <span className="font-semibold text-slate-300">Sakith Harvan Technologies</span>
              <span className="text-slate-500 mx-1.5">•</span>
              <span>Team Lead: <span className="text-indigo-400 font-semibold">Sujith</span></span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Members: Sneha, Siddu, T. Vyshnavi
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Interactive Login / Register Form */}
        <div className="lg:w-1/2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col justify-center">
          {viewMode === 'login' ? (
            /* ------------------ LOGIN FORM ------------------ */
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-100 tracking-tight">Welcome Back</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select your institutional role and sign in to your dashboard.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-700/60 text-rose-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{loginError}</span>
                </div>
              )}

              {/* Role Selector Cards */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Select Your Role
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Principal */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('principal');
                      setLoginError(null);
                    }}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      selectedRole === 'principal'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <ShieldCheck className={`w-5 h-5 ${selectedRole === 'principal' ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">Principal</span>
                    <span className="text-[10px] text-slate-400">Executive</span>
                  </button>

                  {/* Teacher */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('teacher');
                      setLoginError(null);
                    }}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      selectedRole === 'teacher'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Users className={`w-5 h-5 ${selectedRole === 'teacher' ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">Teacher</span>
                    <span className="text-[10px] text-slate-400">Faculty</span>
                  </button>

                  {/* Parent */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('parent');
                      setLoginError(null);
                    }}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      selectedRole === 'parent'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <HeartHandshake className={`w-5 h-5 ${selectedRole === 'parent' ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">Parent</span>
                    <span className="text-[10px] text-slate-400">Guardian</span>
                  </button>
                </div>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Official Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. your.name@sht.edu"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Remember email on this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials & Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In as {selectedRole.toUpperCase()}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* No account yet? Prompt */}
              <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
                <span>New to SHT AI-ERP? </span>
                <button
                  onClick={() => {
                    setViewMode('register');
                    setRegStep(1);
                    setRegError(null);
                    setRegSuccessUser(null);
                  }}
                  className="text-indigo-400 font-bold hover:underline"
                >
                  Create an institutional account
                </button>
              </div>

              {/* Initial Setup Info Callout */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                  <span>First-Time Setup or Evaluation</span>
                </div>
                <p>
                  To start with a clean database, register your Principal account with authorization code <span className="font-mono text-indigo-300 font-bold">SHT-ADMIN-2026</span>. All entered names and records will be saved permanently.
                </p>
              </div>
            </div>
          ) : regSuccessUser ? (
            /* ------------------ REGISTRATION SUCCESS SCREEN ------------------ */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-100 tracking-tight">Account Successfully Created!</h2>
                <p className="text-xs text-slate-400 mt-1.5">
                  Welcome to SHT AI-ERP, <span className="font-bold text-slate-200">{regSuccessUser.name}</span>. Your account has been registered in the database.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Full Name:</span>
                  <span className="text-slate-200 font-bold">{regSuccessUser.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Official Email:</span>
                  <span className="text-slate-200">{regSuccessUser.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Role:</span>
                  <span className="text-indigo-400 font-bold uppercase">{regSuccessUser.role}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Institution:</span>
                  <span className="text-slate-300">{regSuccessUser.school_name || 'Sakith Harvan Technologies'}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setViewMode('login');
                  setLoginEmail(regSuccessUser.email);
                  setSelectedRole(regSuccessUser.role);
                  setLoginError(null);
                }}
                className="w-full py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* ------------------ MULTI-STEP REGISTRATION FORM ------------------ */
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-100 tracking-tight">Create Account</h2>
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    Step {regStep} of 3
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {regStep === 1 && 'Select your institutional role to begin.'}
                  {regStep === 2 && `Enter your official profile information as a ${regRole.toUpperCase()}.`}
                  {regStep === 3 && 'Review your information and complete account setup.'}
                </p>
              </div>

              {regError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-700/60 text-rose-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{regError}</span>
                </div>
              )}

              {/* STEP 1: ROLE SELECTION */}
              {regStep === 1 && (
                <div className="space-y-3">
                  <div
                    onClick={() => setRegRole('principal')}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      regRole === 'principal'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <ShieldCheck className="w-6 h-6" />
                      </span>
                      <div>
                        <div className="text-sm font-bold text-slate-200">Principal / Executive Head</div>
                        <div className="text-xs text-slate-400">Institutional setup, teacher management, and correction approvals.</div>
                      </div>
                    </div>
                    {regRole === 'principal' && <Check className="w-5 h-5 text-indigo-400" />}
                  </div>

                  <div
                    onClick={() => setRegRole('teacher')}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      regRole === 'teacher'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <Users className="w-6 h-6" />
                      </span>
                      <div>
                        <div className="text-sm font-bold text-slate-200">Teacher / Academic Faculty</div>
                        <div className="text-xs text-slate-400">Mark dual-session attendance, enter exam grades, and submit corrections.</div>
                      </div>
                    </div>
                    {regRole === 'teacher' && <Check className="w-5 h-5 text-cyan-400" />}
                  </div>

                  <div
                    onClick={() => setRegRole('parent')}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      regRole === 'parent'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <HeartHandshake className="w-6 h-6" />
                      </span>
                      <div>
                        <div className="text-sm font-bold text-slate-200">Parent / Legal Guardian</div>
                        <div className="text-xs text-slate-400">Track student attendance, academic marks, and receive absence alerts.</div>
                      </div>
                    </div>
                    {regRole === 'parent' && <Check className="w-5 h-5 text-emerald-400" />}
                  </div>

                  <button
                    type="button"
                    onClick={() => setRegStep(2)}
                    className="w-full mt-4 py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Enter Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: PROFILE INPUTS */}
              {regStep === 2 && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Exact Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sujith Sai"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Official Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. your.email@sht.edu"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Contact Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1-555-0123"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Role-Specific Fields */}
                  {regRole === 'principal' && (
                    <>
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Institution / School Name</label>
                        <input
                          type="text"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-300">School Authorization Code</label>
                          <span className="text-[10px] text-indigo-400 font-mono">Code: SHT-ADMIN-2026</span>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SHT-ADMIN-2026"
                          value={institutionCode}
                          onChange={(e) => setInstitutionCode(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </>
                  )}

                  {regRole === 'teacher' && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Faculty / Staff ID</label>
                          <input
                            type="text"
                            placeholder="e.g. TCH-1044"
                            value={staffId}
                            onChange={(e) => setStaffId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Department</label>
                          <input
                            type="text"
                            placeholder="Computer Science"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-300">School Invitation Code</label>
                          <span className="text-[10px] text-indigo-400 font-mono">Code: SHT-STAFF-2026</span>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SHT-STAFF-2026"
                          value={institutionCode}
                          onChange={(e) => setInstitutionCode(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </>
                  )}

                  {regRole === 'parent' && (
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Student Admission Number (Linking Code)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. STU-1032"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Must match an enrolled student in the school database to link records.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Password</label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Confirm Password</label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {regRole === 'principal' && (
                    <label className="flex items-start gap-2 pt-1 text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-[11px] leading-relaxed">
                        I confirm authority to configure this school institution under SHT data governance policies.
                      </span>
                    </label>
                  )}

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!regName.trim() || !regEmail.trim() || !regPassword) {
                          setRegError('Please fill in all required fields.');
                          return;
                        }
                        setRegError(null);
                        setRegStep(3);
                      }}
                      className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
                    >
                      Review & Confirm
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW & SUBMIT */}
              {regStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Account Type:</span>
                      <span className="text-indigo-400 font-bold uppercase">{regRole}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Exact Name:</span>
                      <span className="text-slate-200 font-bold">{regName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Official Email:</span>
                      <span className="text-slate-200">{regEmail}</span>
                    </div>
                    {regPhone && (
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Phone:</span>
                        <span className="text-slate-300">{regPhone}</span>
                      </div>
                    )}
                    {regRole === 'principal' && (
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">School Name:</span>
                        <span className="text-slate-300">{schoolName}</span>
                      </div>
                    )}
                    {regRole === 'parent' && (
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Linked Student ID:</span>
                        <span className="text-emerald-400 font-mono font-bold">{studentId}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Password:</span>
                      <span className="text-slate-400">••••••••••••</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRegStep(2)}
                      className="px-4 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold"
                    >
                      Back to Edit
                    </button>
                    <button
                      type="button"
                      disabled={regLoading}
                      onClick={handleRegisterSubmit}
                      className="flex-1 py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {regLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Account to Database...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Submit & Create Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-6 text-xs text-slate-400 text-center">
        <span>SHT AI-ERP Beta • Sakith Harvan Technologies • Fully Data-Driven Architecture</span>
      </footer>
    </div>
  );
};
