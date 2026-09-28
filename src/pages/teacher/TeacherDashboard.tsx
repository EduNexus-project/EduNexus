import React from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { useAuth } from '../../context/AuthContext';
import { KPICard } from '../../components/common/KPICard';
import {
  CalendarCheck2,
  Clock,
  Award,
  FileCheck2,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Sparkles
} from 'lucide-react';

export const TeacherDashboard: React.FC<{ onNavigateTab: (tab: string) => void }> = ({
  onNavigateTab
}) => {
  const { currentUser } = useAuth();
  const { classes, students, requests, selectedDate } = useERPData();

  const myClass = classes.find((c) => c.classTeacherId === currentUser?.id) || classes[0];
  const myStudents = students.filter((s) => s.classId === myClass.id);
  const myRequests = requests.filter((r) => r.teacherId === currentUser?.id);
  const pendingRequests = myRequests.filter((r) => r.status === 'pending');

  const skippers = myStudents.filter((s) => s.fnAttendanceRate > s.anAttendanceRate + 10);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
            Faculty Workspace • {myClass?.name}
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Class Incharge Desk: {currentUser?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dual-session roll-call verification, continuous assessment, and Principal modification appeals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('attendance')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <CalendarCheck2 className="w-4 h-4" />
            <span>Open Roll-Call Matrix</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Assigned Class Roll"
          value={`${myClass?.overallRate}%`}
          subtext={`FN: ${myClass?.todaysFnRate}% | AN: ${myClass?.todaysAnRate}%`}
          icon={<Users className="w-5 h-5" />}
          highlightColor="emerald"
          trend={{ value: 'Target > 85%', isPositive: true }}
          onClick={() => onNavigateTab('attendance')}
        />

        <KPICard
          title="Afternoon Disparity"
          value={`${skippers.length} Students`}
          subtext="Afternoon lab session drop"
          icon={<AlertTriangle className="w-5 h-5" />}
          highlightColor="rose"
          trend={{ value: 'Flagged by AI sentinel', isPositive: false }}
          onClick={() => onNavigateTab('attendance')}
        />

        <KPICard
          title="Continuous Marks Locked"
          value="Mid-Term 1"
          subtext="Re-evaluation via appeal only"
          icon={<Award className="w-5 h-5" />}
          highlightColor="indigo"
          onClick={() => onNavigateTab('marks')}
        />

        <KPICard
          title="Appeals Filed"
          value={myRequests.length}
          subtext={`${pendingRequests.length} awaiting Principal sign-off`}
          icon={<FileCheck2 className="w-5 h-5" />}
          highlightColor="purple"
          onClick={() => onNavigateTab('requests')}
        />
      </div>

      {/* Today's Teaching Schedule & Quick Session Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Today's Dual-Session Schedule ({selectedDate})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Hall: LH-302</span>
          </div>

          <div className="space-y-3">
            {/* FN Session */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white uppercase font-mono">
                    FN Session
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    CS601: Distributed Systems (Theory)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  09:00 AM – 10:45 AM • LH-302 (Ramanujan Wing)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Roll Submitted (94.7%)
                </span>
              </div>
            </div>

            {/* AN Session */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white uppercase font-mono">
                    AN Session
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    CS604: Cloud Computing Laboratory
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  01:30 PM – 04:30 PM • Systems Lab 3 (Aryabhata Centre)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('attendance')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  Verify AN Lab Roll →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Appeal & Alerts Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Class Incharge Alerts</h3>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1 mb-3">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Aarav Kumar (21CS101)
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Present in FN theory, marked absent in AN Cloud Lab. An On-Duty modification appeal has been submitted to the Principal.
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Need to correct attendance or modify locked test marks? Submit a formal request with rationale for Principal digital sign-off.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('requests')}
            className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Submit Modification Appeal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
