import React, { useState } from 'react';
import { Database, Search, Filter, ShieldCheck, GraduationCap, DollarSign, Calendar, Copy, Check } from 'lucide-react';
import { ApprovalItem, AttendanceItem, GradeItem, ExpenseItem, SystemStatus } from '../types/erp';

interface DataHubProps {
  approvals: ApprovalItem[];
  attendance: AttendanceItem[];
  grades: GradeItem[];
  expenses: ExpenseItem[];
  systemStatus: SystemStatus | null;
}

export const DataHub: React.FC<DataHubProps> = ({
  approvals,
  attendance,
  grades,
  expenses,
  systemStatus,
}) => {
  const [subTab, setSubTab] = useState<'attendance' | 'grades' | 'expenses' | 'approvals'>('attendance');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSchema, setCopiedSchema] = useState(false);

  const copySqlSchema = () => {
    fetch('/server/db/supabaseSchema.sql')
      .then((res) => (res.ok ? res.text() : ''))
      .then((sql) => {
        if (!sql) {
          navigator.clipboard.writeText('-- Supabase Parallel ERP Schema\n-- Refer to server/db/supabaseSchema.sql');
        } else {
          navigator.clipboard.writeText(sql);
        }
        setCopiedSchema(true);
        setTimeout(() => setCopiedSchema(false), 2000);
      })
      .catch(() => {
        setCopiedSchema(true);
        setTimeout(() => setCopiedSchema(false), 2000);
      });
  };

  const filteredAttendance = attendance.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cohort.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGrades = grades.filter(
    (g) =>
      g.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExpenses = expenses.filter(
    (e) =>
      e.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.budget_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.expense_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApprovals = approvals.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.request_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title & Database Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">ERP Data Hub (Supabase Tables)</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Live querying layer serving raw records to the AI Approval Scoring Assistant and Natural Language Summary Engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copySqlSchema}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>Copy Supabase SQL Schema</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                systemStatus?.supabaseConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300">
              {systemStatus?.supabaseConnected ? 'Supabase Live' : 'Active In-Memory Cache'}
            </span>
          </div>
        </div>
      </div>

      {/* Table Selector & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSubTab('attendance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              subTab === 'attendance' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Attendance ({attendance.length})</span>
          </button>

          <button
            onClick={() => setSubTab('grades')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              subTab === 'grades' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Grades ({grades.length})</span>
          </button>

          <button
            onClick={() => setSubTab('expenses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              subTab === 'expenses' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Budgets ({expenses.length})</span>
          </button>

          <button
            onClick={() => setSubTab('approvals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              subTab === 'approvals' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Requisitions ({approvals.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table Render */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {subTab === 'attendance' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Student / Staff ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Cohort</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAttendance.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono text-indigo-400">{row.student_or_staff_id}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{row.name}</td>
                    <td className="px-4 py-3 text-slate-400">{row.role}</td>
                    <td className="px-4 py-3">{row.department}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{row.cohort}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{row.session_date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          row.attendance_status === 'Present'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : row.attendance_status === 'Late'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : row.attendance_status === 'Excused'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {row.attendance_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 italic">{row.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {subTab === 'grades' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Cohort</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Assessment Type</th>
                  <th className="px-4 py-3">Grade Score</th>
                  <th className="px-4 py-3">Letter Grade</th>
                  <th className="px-4 py-3">Semester</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredGrades.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono text-indigo-400">{row.student_id}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{row.student_name}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{row.cohort}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-cyan-400 font-semibold mr-1">{row.course_code}</span>
                      <span className="text-slate-400">{row.course_name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{row.assessment_type}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-200">
                      {row.grade_score} / {row.max_score}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          row.letter_grade.startsWith('A')
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : row.letter_grade.startsWith('B')
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : row.letter_grade.startsWith('C')
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {row.letter_grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{row.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {subTab === 'expenses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Expense Code</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Allocated Budget</th>
                  <th className="px-4 py-3">Spent Amount</th>
                  <th className="px-4 py-3">Variance</th>
                  <th className="px-4 py-3">Quarter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredExpenses.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono text-indigo-400 font-semibold">{row.expense_code}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{row.department}</td>
                    <td className="px-4 py-3 text-slate-400">{row.budget_category}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">${row.allocated_budget.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">${row.spent_amount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono font-bold">
                      <span className={row.variance < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {row.variance < 0 ? `-$${Math.abs(row.variance).toLocaleString()}` : `+$${row.variance.toLocaleString()}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{row.fiscal_quarter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {subTab === 'approvals' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">AI Risk Score</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredApprovals.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono text-indigo-400 font-semibold">{row.request_code}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{row.title}</td>
                    <td className="px-4 py-3 text-slate-400">{row.department}</td>
                    <td className="px-4 py-3 text-slate-400">{row.requested_by}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-200">
                      {row.currency} {row.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {row.risk_score !== undefined ? (
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            row.risk_score > 60
                              ? 'bg-rose-500/20 text-rose-300'
                              : row.risk_score > 30
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {row.risk_score} / 100 ({row.ai_recommendation})
                        </span>
                      ) : (
                        <span className="text-slate-500">Unscored</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
