import React, { useState } from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { SearchBar } from '../../components/common/SearchBar';
import { BookOpen, Mail, Phone, Layers, Award, CheckCircle2 } from 'lucide-react';

export const PrincipalTeachers: React.FC = () => {
  const { teachers, classes, requests } = useERPData();
  const [search, setSearch] = useState('');

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
            Faculty Governance
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Faculty & Department Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Class incharge assignments, roll-call adherence, and modification audit history.
          </p>
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by faculty name, department, or employee code..."
          className="w-full sm:w-80"
        />
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => {
          const teacherRequests = requests.filter((r) => r.teacherId === t.id);
          const assignedClassObjs = classes.filter((c) => t.assignedClasses.includes(c.id));

          return (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start gap-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{t.name}</h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {t.employeeCode}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">{t.designation}</p>
                  <p className="text-[11px] text-slate-500">{t.department}</p>
                </div>
              </div>

              {/* Contact info */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {t.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {t.phone}
                </span>
              </div>

              {/* Subjects & Classes */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Assigned Classes & Subjects
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {assignedClassObjs.map((c) => (
                    <span
                      key={c.id}
                      className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-semibold"
                    >
                      {c.name}
                    </span>
                  ))}
                  {t.subjectsTaught.map((sub, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Audit history */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Modification Appeals Filed: <strong className="text-slate-800">{teacherRequests.length}</strong></span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 98.4% On-Time Roll Call
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
