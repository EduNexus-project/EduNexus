import React from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { useAuth } from '../../context/AuthContext';
import { Layers, Users, BookOpen, Clock, CalendarCheck2, ArrowRight } from 'lucide-react';

export const TeacherClasses: React.FC<{ onNavigateTab: (tab: string) => void }> = ({
  onNavigateTab
}) => {
  const { currentUser } = useAuth();
  const { classes, students } = useERPData();

  const myClasses = classes.filter(
    (c) => c.classTeacherId === currentUser?.id || currentUser?.role === 'principal'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
          Academic Load
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
          Assigned Classes & Laboratory Sections
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Classes under your direct faculty incharge supervision and continuous evaluation rubrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {myClasses.map((cls) => {
          const classStudents = students.filter((s) => s.classId === cls.id);
          const lowAttendanceCount = classStudents.filter((s) => s.overallAttendanceRate < 75).length;

          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {cls.code}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{cls.roomNumber}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{cls.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{cls.block}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2.5 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Enrolled</span>
                    <p className="font-bold text-slate-900 font-mono text-sm mt-0.5">{cls.totalStudents}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">FN Rate</span>
                    <p className="font-bold text-emerald-600 font-mono text-sm mt-0.5">{cls.todaysFnRate}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">AN Rate</span>
                    <p className="font-bold text-blue-600 font-mono text-sm mt-0.5">{cls.todaysAnRate}%</p>
                  </div>
                </div>

                {lowAttendanceCount > 0 && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-[11px] text-rose-700 font-medium">
                    ⚠️ {lowAttendanceCount} student(s) falling below 75% attendance detention barrier.
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onNavigateTab('marks')}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors text-center"
                >
                  Grade Marks
                </button>
                <button
                  onClick={() => onNavigateTab('attendance')}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs text-center"
                >
                  Roll Call Matrix →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
