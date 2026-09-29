import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, GraduationCap, Lock, Mail, Shield, UserRound, Users } from 'lucide-react';
import { authService } from '../../services/authService';
import { ParentRelationship, UserRole } from '../../types';

interface RegistrationPageProps {
  onBackToLogin: () => void;
  onRegistrationSuccess: (email: string, role: UserRole) => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  onBackToLogin,
  onRegistrationSuccess
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState<ParentRelationship>('guardian');
  const [selectedRole, setSelectedRole] = useState<UserRole>('principal');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = await authService.register({
      name: fullName,
      email,
      password,
      role: selectedRole,
      phone: selectedRole === 'parent' ? phone : undefined,
      relationship: selectedRole === 'parent' ? relationship : undefined
    });
    setIsSubmitting(false);

    if (result.success) {
      onRegistrationSuccess(email.trim(), selectedRole);
    } else {
      setErrorMessage(result.message);
    }
  };

  const roleOptions: { role: UserRole; label: string; icon: typeof Shield; color: string; selected: string }[] = [
    {
      role: 'principal',
      label: 'Principal',
      icon: Shield,
      color: 'text-indigo-400',
      selected: 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-xs'
    },
    {
      role: 'teacher',
      label: 'Teacher',
      icon: GraduationCap,
      color: 'text-emerald-400',
      selected: 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-xs'
    },
    {
      role: 'parent',
      label: 'Parent',
      icon: Users,
      color: 'text-sky-400',
      selected: 'bg-sky-600/20 border-sky-500 text-sky-300 shadow-xs'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-black text-2xl shadow-xl shadow-indigo-500/25 mb-3">
            E
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">EduNexus ERP</h1>
          <p className="text-xs text-indigo-300 font-medium mt-1">
            Enterprise Academic Management &amp; AI Sentinel Engine
          </p>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Create an account</h2>
            <p className="text-xs text-slate-400 mt-1">Enter your details to register with EduNexus.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className="block text-xs font-semibold text-slate-300 mb-1">
                Institutional Email ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your institutional email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            {selectedRole === 'parent' && (
              <>
                <div>
                  <label htmlFor="register-phone" className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone
                  </label>
                  <input
                    id="register-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Enter your phone number"
                    required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label htmlFor="register-relationship" className="block text-xs font-semibold text-slate-300 mb-1">
                    Relationship
                  </label>
                  <select
                    id="register-relationship"
                    value={relationship}
                    onChange={(event) => setRelationship(event.target.value as ParentRelationship)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="guardian">Guardian</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="register-password" className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="register-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Select Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roleOptions.map(({ role, label, icon: Icon, color, selected }) => (
                  <button
                    key={role}
                    type="button"
                    aria-pressed={selectedRole === role}
                    onClick={() => setSelectedRole(role)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      selectedRole === role
                        ? selected
                        : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${color}`} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && <p role="alert" className="text-xs text-rose-300">{errorMessage}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full mt-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800/70 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};