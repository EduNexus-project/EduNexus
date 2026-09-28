import React from 'react';
import { useERPData } from '../../context/ERPDataContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export const TeacherAnalytics: React.FC = () => {
  const { students } = useERPData();
  const classStudents = students.filter((s) => s.classId === 'cls_cse_a');

  const studentPerformanceData = classStudents.map((s) => ({
    name: s.name.split(' ')[0],
    fullName: s.name,
    roll: s.rollNumber,
    FN_Rate: s.fnAttendanceRate,
    AN_Rate: s.anAttendanceRate,
    CGPA: s.academicCgpa * 10
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
          Faculty Class Analytics
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
          CSE-6A Class Performance & Attendance Correlation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Demonstrating impact of afternoon practical lab attendance on continuous internal assessment.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Forenoon vs Afternoon Rates by Student
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Notice the drop in AN laboratory rate for Aarav Kumar and Rohan Deshmukh.
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studentPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis domain={[50, 100]} stroke="#64748b" fontSize={11} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="FN_Rate" name="FN Theory Roll %" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="AN_Rate" name="AN Lab Roll %" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
