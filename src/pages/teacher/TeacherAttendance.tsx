import React, { useState } from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { useToast } from '../../context/ToastContext';
import { attendanceService } from '../../services/attendanceService';
import { AttendanceStatus, SessionType, Student } from '../../types';
import {
  CalendarCheck2,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const TeacherAttendance: React.FC<{ onOpenRequestModal?: (student: Student) => void }> = ({
  onOpenRequestModal
}) => {
  const { students, selectedDate, setSelectedDate, markAttendance, bulkMarkAttendance } = useERPData();
  const { success, info } = useToast();
  const [selectedSession, setSelectedSession] = useState<'both' | 'FN' | 'AN'>('both');
  const [auditStudent, setAuditStudent] = useState<Student | null>(null);

  // Filter students for CSE-6A (teacher's assigned class)
  const classStudents = students.filter((s) => s.classId === 'cls_cse_a');

  // Detect session-skipping patterns on selected date
  const skippers = attendanceService.detectSessionSkippers(selectedDate, classStudents);

  const handleBulkAction = (session: SessionType, status: AttendanceStatus) => {
    const studentIds = classStudents.map((s) => s.id);
    bulkMarkAttendance(studentIds, selectedDate, session, status);
  };

  const handleExportCSV = () => {
    const csv = attendanceService.exportAttendanceCSV(classStudents, selectedDate);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CSE-6A_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('CSV Exported', `Downloaded attendance ledger for ${selectedDate}.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
            Dual-Session Operational Roll-Call
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            FN & AN Attendance Matrix (CSE-6A)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Forenoon (09:00 AM – 12:45 PM) and Afternoon (01:30 PM – 04:30 PM) synchronized register.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Session-Skipping Alert Banner if detected */}
      {skippers.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3.5 text-amber-950">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs flex-1">
            <h4 className="font-bold text-amber-900">
              Automated Session-Skipping Pattern Detected ({skippers.length} Students)
            </h4>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              The following students were recorded <strong>Present in Forenoon (FN)</strong>, but marked <strong>Absent in Afternoon (AN)</strong> practical sessions on {selectedDate}:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {skippers.map((item) => (
                <span
                  key={item.student.id}
                  className="px-2.5 py-1 rounded-lg bg-amber-200/80 font-bold text-amber-950 text-xs flex items-center gap-1"
                >
                  <span>{item.student.name} ({item.student.rollNumber})</span>
                  <span className="text-[10px] text-amber-800 font-mono">[FN: Present | AN: Absent]</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Bulk Actions Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            Quick Bulk Register Actions
          </span>
          <span className="text-slate-400 font-mono text-[11px]">Selected: {selectedDate}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleBulkAction('FN', 'present')}
            className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>All FN Present</span>
          </button>

          <button
            onClick={() => handleBulkAction('AN', 'present')}
            className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>All AN Present</span>
          </button>

          <button
            onClick={() => handleBulkAction('FN', 'absent')}
            className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>All FN Absent</span>
          </button>

          <button
            onClick={() => handleBulkAction('AN', 'absent')}
            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4 text-amber-600" />
            <span>All AN Absent</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Session Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Student & Roll No</th>
                <th className="px-5 py-3">
                  <span className="block">Forenoon Session (FN)</span>
                  <span className="text-[10px] text-slate-400 font-normal">09:00 AM – 12:45 PM</span>
                </th>
                <th className="px-5 py-3">
                  <span className="block">Afternoon Session (AN)</span>
                  <span className="text-[10px] text-slate-400 font-normal">01:30 PM – 04:30 PM</span>
                </th>
                <th className="px-5 py-3">Pattern Status</th>
                <th className="px-5 py-3 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {classStudents.map((student) => {
                const fnRecord = attendanceService
                  .getAllRecords()
                  .find((r) => r.studentId === student.id && r.date === selectedDate && r.session === 'FN');
                const anRecord = attendanceService
                  .getAllRecords()
                  .find((r) => r.studentId === student.id && r.date === selectedDate && r.session === 'AN');

                const fnStatus: AttendanceStatus = fnRecord?.status || 'present';
                const anStatus: AttendanceStatus = anRecord?.status || 'present';

                const isSessionSkip = fnStatus === 'present' && anStatus === 'absent';

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

                    {/* FN Toggle Buttons */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => markAttendance(student.id, selectedDate, 'FN', 'present')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            fnStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => markAttendance(student.id, selectedDate, 'FN', 'absent')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            fnStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => markAttendance(student.id, selectedDate, 'FN', 'excused')}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                            fnStatus === 'excused'
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          OD
                        </button>
                      </div>
                    </td>

                    {/* AN Toggle Buttons */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => markAttendance(student.id, selectedDate, 'AN', 'present')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            anStatus === 'present'
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => markAttendance(student.id, selectedDate, 'AN', 'absent')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            anStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => markAttendance(student.id, selectedDate, 'AN', 'excused')}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                            anStatus === 'excused'
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          OD
                        </button>
                      </div>
                    </td>

                    {/* Pattern Status Badge */}
                    <td className="px-5 py-3.5">
                      {isSessionSkip ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Session Skip (FN-P, AN-A)
                        </span>
                      ) : fnStatus === 'absent' && anStatus === 'absent' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Full Day Absence
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Consistent</span>
                      )}
                    </td>

                    {/* Audit Action */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setAuditStudent(student)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        Ledger
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Modal */}
      {auditStudent && (
        <Modal
          isOpen={true}
          onClose={() => setAuditStudent(null)}
          title={`Longitudinal Attendance Ledger: ${auditStudent.name}`}
          subtitle={`Roll: ${auditStudent.rollNumber} • ${auditStudent.className}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Forenoon</span>
                <p className="text-lg font-bold text-emerald-600 font-mono mt-0.5">{auditStudent.fnAttendanceRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Afternoon</span>
                <p className="text-lg font-bold text-rose-600 font-mono mt-0.5">{auditStudent.anAttendanceRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Cumulative</span>
                <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">{auditStudent.overallAttendanceRate}%</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <p className="font-bold text-slate-800 mb-1">Guardian Contact</p>
              <p className="text-slate-600">{auditStudent.parentName} ({auditStudent.parentPhone})</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              {onOpenRequestModal && (
                <button
                  onClick={() => {
                    onOpenRequestModal(auditStudent);
                    setAuditStudent(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors"
                >
                  File Correction Appeal →
                </button>
              )}
              <button
                onClick={() => setAuditStudent(null)}
                className="ml-auto px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
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
