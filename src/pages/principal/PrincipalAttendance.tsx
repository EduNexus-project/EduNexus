import React, { useState } from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { attendanceService } from '../../services/attendanceService';
import { Download, Calendar, Filter, Users, ShieldAlert, ArrowUpDown, Check, AlertOctagon } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Student } from '../../types';

export const PrincipalAttendance: React.FC = () => {
  const { classes, students, selectedDate, setSelectedDate } = useERPData();
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [inspectStudent, setInspectStudent] = useState<Student | null>(null);

  const filteredStudents = selectedClassId === 'all'
    ? students
    : students.filter((s) => s.classId === selectedClassId);

  const avgFn = Math.round(
    classes.reduce((acc, c) => acc + c.todaysFnRate, 0) / (classes.length || 1)
  );
  const avgAn = Math.round(
    classes.reduce((acc, c) => acc + c.todaysAnRate, 0) / (classes.length || 1)
  );

  const handleExportCSV = () => {
    const csv = attendanceService.exportAttendanceCSV(filteredStudents, selectedDate);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `EduNexus_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
            Dual-Session Supervisory Registry
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Institutional Attendance Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Forenoon (09:00 AM – 12:45 PM) vs Afternoon (01:30 PM – 04:30 PM) roll-call ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Dual Session Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Forenoon (FN) Roll Rate
          </span>
          <p className="text-2xl lg:text-3xl font-bold text-emerald-600 mt-1 tabular-nums font-mono">
            {avgFn}%
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Theory lectures (09:00 AM – 12:45 PM)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Afternoon (AN) Roll Rate
          </span>
          <p className="text-2xl lg:text-3xl font-bold text-blue-600 mt-1 tabular-nums font-mono">
            {avgAn}%
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Practical Labs (01:30 PM – 04:30 PM)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Session Disparity Drop
          </span>
          <p className="text-2xl lg:text-3xl font-bold text-amber-600 mt-1 tabular-nums font-mono">
            -{avgFn - avgAn}%
          </p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
            Afternoon session drop variance
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Active Roster Enrolled
          </span>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900 mt-1 tabular-nums font-mono">
            {students.length * 28} Students
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across 4 engineering branches
          </span>
        </div>
      </div>

      {/* Class Level Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Filter By Department / Class
            </span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="ml-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
            >
              <option value="all">All Departments & Sections</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} – {c.department}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredStudents.length} student ledgers for {selectedDate}
          </span>
        </div>

        {/* Student Dual-Session Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Student & Roll No</th>
                <th className="px-5 py-3">Class</th>
                <th className="px-5 py-3">Forenoon (FN)</th>
                <th className="px-5 py-3">Afternoon (AN)</th>
                <th className="px-5 py-3">Overall Rate</th>
                <th className="px-5 py-3">Disparity Flag</th>
                <th className="px-5 py-3 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.map((student) => {
                const isSkipper = student.fnAttendanceRate > student.anAttendanceRate + 10;
                return (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">{student.rollNumber}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      {student.className}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-mono">
                        <Check className="w-3 h-3 text-emerald-600" />
                        {student.fnAttendanceRate}%
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md border font-mono ${
                          student.anAttendanceRate < 80
                            ? 'text-rose-700 bg-rose-50 border-rose-200'
                            : 'text-blue-700 bg-blue-50 border-blue-200'
                        }`}
                      >
                        {student.anAttendanceRate < 80 ? (
                          <AlertOctagon className="w-3 h-3 text-rose-600" />
                        ) : (
                          <Check className="w-3 h-3 text-blue-600" />
                        )}
                        {student.anAttendanceRate}%
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-bold tabular-nums text-slate-900 font-mono">
                      {student.overallAttendanceRate}%
                    </td>

                    <td className="px-5 py-3.5">
                      {isSkipper ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <ShieldAlert className="w-3 h-3 text-amber-600" />
                          FN-AN Drop (-{Math.round(student.fnAttendanceRate - student.anAttendanceRate)}%)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Normal Pattern</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setInspectStudent(student)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        Audit Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Student Modal */}
      {inspectStudent && (
        <Modal
          isOpen={true}
          onClose={() => setInspectStudent(null)}
          title={`Attendance Audit: ${inspectStudent.name} (${inspectStudent.rollNumber})`}
          subtitle={`${inspectStudent.className} • Class Incharge: Prof. Anitha Vasudevan`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Forenoon</span>
                <p className="text-lg font-bold text-emerald-600 mt-0.5 font-mono">{inspectStudent.fnAttendanceRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Afternoon</span>
                <p className="text-lg font-bold text-rose-600 mt-0.5 font-mono">{inspectStudent.anAttendanceRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5 font-mono">{inspectStudent.overallAttendanceRate}%</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <p className="font-semibold text-slate-800">Guardian Contact Details</p>
              <p className="text-slate-600">Parent: {inspectStudent.parentName}</p>
              <p className="text-slate-600 font-mono">Phone: {inspectStudent.parentPhone}</p>
              <p className="text-slate-600">Email: {inspectStudent.parentEmail}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectStudent(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
