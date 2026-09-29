import React, { useEffect, useState } from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { AttendanceRecord } from '../../types';
import { parentService } from '../../services/parentService';
import { CalendarCheck2, Clock, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ParentStudentUnavailable } from './ParentStudentUnavailable';

export const ParentAttendance: React.FC = () => {
  const { students, selectedParentStudentId, parentStudentsLoading } = useERPData();
  const myStudent = students.find((student) => student.id === selectedParentStudentId) ||
    (students.length === 1 ? students[0] : undefined);
  const [recordSet, setRecordSet] = useState<{ studentId: string; records: AttendanceRecord[] } | null>(null);
  const [loadError, setLoadError] = useState('');
  const records = recordSet && recordSet.studentId === myStudent?.id ? recordSet.records : [];

  useEffect(() => {
    if (!myStudent) {
      setRecordSet(null);
      return;
    }
    let active = true;
    setRecordSet(null);
    setLoadError('');
    parentService.getAttendance(myStudent.id)
      .then((studentRecords) => { if (active) setRecordSet({ studentId: myStudent.id, records: studentRecords }); })
      .catch((error: Error) => { if (active) setLoadError(error.message); });
    return () => { active = false; };
  }, [myStudent?.id]);

  if (!myStudent) {
    return <ParentStudentUnavailable loading={parentStudentsLoading} />;
  }

  // Group records by date
  const dateMap: Record<string, { FN?: string; AN?: string }> = {};
  records.forEach((r) => {
    if (!dateMap[r.date]) dateMap[r.date] = {};
    if (r.session === 'FN') dateMap[r.date].FN = r.status;
    if (r.session === 'AN') dateMap[r.date].AN = r.status;
  });

  const sortedDates = Object.keys(dateMap).sort().reverse();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
          Attendance Ledger
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
          Dual-Session Roll Log ({myStudent.name})
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tracking Forenoon (09:00 AM – 12:45 PM) and Afternoon (01:30 PM – 04:30 PM) sessions.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Forenoon (FN) Presence</span>
          <p className="text-2xl font-bold text-emerald-600 font-mono mt-1">{myStudent.fnAttendanceRate}%</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Theoretical coursework</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Afternoon (AN) Presence</span>
          <p className={`text-2xl font-bold font-mono mt-1 ${myStudent.anAttendanceRate < 80 ? 'text-rose-600' : 'text-blue-600'}`}>
            {myStudent.anAttendanceRate}%
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Laboratory practicals</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Total Cumulative Roll</span>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{myStudent.overallAttendanceRate}%</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Above 75% cutoff</span>
        </div>
      </div>

      {/* Session Day-by-Day Log */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Day-by-Day Dual Session Audit
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Academic Semester 6</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {loadError && <p role="alert" className="p-4 text-rose-600">{loadError}</p>}
          {sortedDates.map((date) => {
            const dayData = dateMap[date];
            const fnStatus = dayData?.FN || 'present';
            const anStatus = dayData?.AN || 'present';
            const isSkip = fnStatus === 'present' && anStatus === 'absent';

            return (
              <div key={date} className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                <div>
                  <span className="font-bold text-slate-900 block font-mono text-sm">{date}</span>
                  <span className="text-[11px] text-slate-500">Regular Academic Working Day</span>
                </div>

                <div className="flex items-center gap-4">
                  {/* FN Status */}
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Forenoon (09:00 - 12:45)</span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold text-xs ${
                        fnStatus === 'present' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {fnStatus === 'present' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {fnStatus.toUpperCase()}
                    </span>
                  </div>

                  {/* AN Status */}
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Afternoon (01:30 - 04:30)</span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold text-xs ${
                        anStatus === 'present' ? 'text-blue-700' : 'text-rose-700'
                      }`}
                    >
                      {anStatus === 'present' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {anStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Tag */}
                <div>
                  {isSkip ? (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      Afternoon Departure Flagged
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Standard Attendance
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
