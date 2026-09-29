import React, { useEffect, useState } from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { Award, CheckCircle2, ShieldCheck, Download, Printer } from 'lucide-react';
import { ParentStudentUnavailable } from './ParentStudentUnavailable';
import { StudentMarkReport } from '../../types';
import { parentService } from '../../services/parentService';

export const ParentMarks: React.FC = () => {
  const { students, selectedParentStudentId, parentStudentsLoading } = useERPData();
  const myStudent = students.find((student) => student.id === selectedParentStudentId) ||
    (students.length === 1 ? students[0] : undefined);
  const [reportState, setReportState] = useState<{ studentId: string; report: StudentMarkReport } | null>(null);
  const [loadError, setLoadError] = useState('');
  const report = reportState && reportState.studentId === myStudent?.id ? reportState.report : null;

  useEffect(() => {
    if (!myStudent) {
      setReportState(null);
      return;
    }
    let active = true;
    setReportState(null);
    setLoadError('');
    parentService.getMarks(myStudent.id)
      .then((studentReport) => { if (active) setReportState({ studentId: myStudent.id, report: studentReport }); })
      .catch((error: Error) => { if (active) setLoadError(error.message); });
    return () => { active = false; };
  }, [myStudent?.id]);

  if (!myStudent) {
    return <ParentStudentUnavailable loading={parentStudentsLoading} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
            Assessment Transcript
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Continuous Examination Report Card
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified academic ledgers issued under University Examination Regulations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold transition-all shadow-2xs hover:bg-slate-800"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Transcript Card */}
      {loadError && <p role="alert" className="text-xs text-rose-600">{loadError}</p>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {/* Institutional Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              EduNexus Institute of Technology
            </h2>
            <p className="text-xs text-slate-500">Autonomous Institution • Office of the Controller of Examinations</p>
            <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-700">
              <span>Candidate: <strong>{myStudent.name}</strong></span>
              <span>• Roll No: <strong className="font-mono">{myStudent.rollNumber}</strong></span>
              <span>• Class: <strong>{myStudent.className}</strong></span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Assessment Term</span>
            <p className="text-sm font-bold text-indigo-700 font-mono">{report?.examTerm || 'Mid-Term 1'}</p>
            <span className="text-xs font-bold text-slate-900 block mt-1">
              GPA: <span className="font-mono text-emerald-600 text-base">{report?.gpa || myStudent.academicCgpa}</span> / 10.0
            </span>
          </div>
        </div>

        {/* Subjects Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Course Code & Title</th>
                <th className="px-5 py-3">Credits</th>
                <th className="px-5 py-3">Continuous Internal (50)</th>
                <th className="px-5 py-3">End-Term Assessment (100)</th>
                <th className="px-5 py-3">Scaled Total (100)</th>
                <th className="px-5 py-3">Letter Grade</th>
                <th className="px-5 py-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {report?.subjects.map((sub) => (
                <tr key={sub.subjectCode} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-bold text-indigo-600 mr-2">{sub.subjectCode}</span>
                    <span className="font-bold text-slate-900">{sub.subjectName}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono font-semibold">{sub.credits}</td>
                  <td className="px-5 py-3.5 font-mono">{sub.internalObtained} / {sub.internalMax}</td>
                  <td className="px-5 py-3.5 font-mono">{sub.externalObtained} / {sub.externalMax}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900 text-sm">
                    {sub.totalObtained}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-indigo-700 font-mono">{sub.grade}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      PASSED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* COE Seal */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Digitally Authenticated by Controller of Examinations
          </span>
          <span className="text-[11px] text-slate-400">Total Credits Earned: 22</span>
        </div>
      </div>
    </div>
  );
};
