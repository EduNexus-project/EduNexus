import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Settings, ShieldCheck, Clock, Sliders, Bell, Database, Key } from 'lucide-react';

export const PrincipalSettings: React.FC = () => {
  const { success } = useToast();
  const [fnStartTime, setFnStartTime] = useState('09:00');
  const [fnEndTime, setFnEndTime] = useState('12:45');
  const [anStartTime, setAnStartTime] = useState('13:30');
  const [anEndTime, setAnEndTime] = useState('16:30');
  const [detentionCutoff, setDetentionCutoff] = useState(75);
  const [autoSmsParent, setAutoSmsParent] = useState(true);
  const [aiSensitivity, setAiSensitivity] = useState('Standard (Balanced)');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    success('Institutional Governance Parameters Saved', 'Timing thresholds and lock constraints synchronized.');
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
          Institutional Governance
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
          System Configuration & Session Governance
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure dual-session lock windows, detention cutoffs, and AI anomaly thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dual-Session Time Windows */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold">Dual-Session Operational Timings</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 block text-xs">
                Forenoon (FN) Session Window
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={fnStartTime}
                    onChange={(e) => setFnStartTime(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Lock / Freeze</label>
                  <input
                    type="time"
                    value={fnEndTime}
                    onChange={(e) => setFnEndTime(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                Attendance rolls automatically lock at 12:45 PM. Faculty require Principal sign-off thereafter.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 block text-xs">
                Afternoon (AN) Session Window
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Unlock Time</label>
                  <input
                    type="time"
                    value={anStartTime}
                    onChange={(e) => setAnStartTime(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Close Time</label>
                  <input
                    type="time"
                    value={anEndTime}
                    onChange={(e) => setAnEndTime(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                Covers practical lab sessions, tutorials, and project research hours.
              </p>
            </div>
          </div>
        </div>

        {/* Academic Thresholds */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold">Academic Cutoff & AI Sensitivity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Mandatory University Attendance Detention Threshold
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={50}
                  max={90}
                  value={detentionCutoff}
                  onChange={(e) => setDetentionCutoff(Number(e.target.value))}
                  className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                />
                <span className="font-bold text-slate-700">%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Students dropping below this threshold are automatically flagged for Principal review.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                AI Anomaly Detection Sensitivity
              </label>
              <select
                value={aiSensitivity}
                onChange={(e) => setAiSensitivity(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option>High (Flag any &gt;10% FN-AN divergence)</option>
                <option>Standard (Balanced)</option>
                <option>Relaxed (Flag only multi-week trends)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 text-xs">Automated Guardian Afternoon Departure SMS</p>
              <p className="text-[11px] text-slate-500">
                Immediately dispatch SMS to parents when student is present in FN but absent in AN.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoSmsParent}
              onChange={(e) => setAutoSmsParent(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Digital Signature & Principal Key status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900">
            <Key className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold">Principal Digital Signature Token</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Institutional cryptographic sign-off is active for Dr. Ramesh Sundaram (Dean of Academics).
            All approved teacher modification appeals are anchored to institutional immutable audit registers.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 w-fit">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital Cert: NEXUS-SIGN-2026-RS9948 • Status: Active & Valid</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            Save Institutional Settings
          </button>
        </div>
      </form>
    </div>
  );
};
