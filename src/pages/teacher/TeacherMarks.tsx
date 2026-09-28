import React, { useState } from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { useAuth } from '../../context/AuthContext';
import { Lock, FileCheck2, Award, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Student } from '../../types';

export const TeacherMarks: React.FC<{ onOpenRequestModal?: (student: Student, defaultType?: 'marks_revision') => void }> = ({
  onOpenRequestModal
}) => {
  const { students, getStudentMarkReport } = useERPData();
  const classStudents = students.filter((s) => s.classId === 'cls_cse_a');
  const [selectedTerm, setSelectedTerm] = useState('Mid-Term 1');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
            Assessment Governance
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Continuous Internal Assessment Marks
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mid-Term and laboratory marks locked by COE. Faculty modifications require Principal digital approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold font-mono">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Master Register: LOCKED</span>
          </span>
        </div>
      </div>

      {/* Lock Notice Callout */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
        <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">Academic Security Rule:</strong> In accordance with university academic regulations, faculty cannot retroactively alter finalized assessment ledgers directly. To correct an entry, click <strong>"Request Correction"</strong> to generate a formal appeal with automated AI safety audit.
        </div>
      </div>

      {/* Marks Spreadsheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              CSE-6A Continuous Marks Register
            </span>
          </div>

          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
          >
            <option>Mid-Term 1</option>
            <option>Mid-Term 2</option>
            <option>Semester End Final</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Student & Roll No</th>
                <th className="px-5 py-3">CS601: Distributed Sys (50)</th>
                <th className="px-5 py-3">CS602: Compiler Des (50)</th>
                <th className="px-5 py-3">CS604: Cloud Lab (50)</th>
                <th className="px-5 py-3">Term GPA</th>
                <th className="px-5 py-3 text-right">Appeal Revision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {classStudents.map((s) => {
                const report = getStudentMarkReport(s.id);
                const ds = report?.subjects.find((sub) => sub.subjectCode === 'CS601')?.internalObtained ?? 42;
                const cd = report?.subjects.find((sub) => sub.subjectCode === 'CS602')?.internalObtained ?? 40;
                const cl = report?.subjects.find((sub) => sub.subjectCode === 'CS604')?.internalObtained ?? 36;

                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{s.rollNumber}</p>
                    </td>

                    <td className="px-5 py-3.5 font-mono">
                      <span className="font-bold text-slate-800">{ds}</span> / 50
                    </td>

                    <td className="px-5 py-3.5 font-mono">
                      <span className="font-bold text-slate-800">{cd}</span> / 50
                    </td>

                    <td className="px-5 py-3.5 font-mono">
                      <span className={`font-bold ${cl < 38 ? 'text-amber-600' : 'text-slate-800'}`}>
                        {cl}
                      </span>{' '}
                      / 50
                    </td>

                    <td className="px-5 py-3.5 font-mono font-bold text-indigo-600">
                      {report?.gpa || s.academicCgpa}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => onOpenRequestModal && onOpenRequestModal(s, 'marks_revision')}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Request Correction</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
