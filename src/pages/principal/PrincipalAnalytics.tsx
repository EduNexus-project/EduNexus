import React from 'react';
import { useERPData } from '../../context/ERPDataContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, ShieldAlert, Award, Calendar } from 'lucide-react';

export const PrincipalAnalytics: React.FC = () => {
  const { classes, students, anomalies } = useERPData();

  // Weekly Trend Data (FN vs AN)
  const trendData = [
    { day: 'Mon (Sep 22)', FN: 96.2, AN: 88.4 },
    { day: 'Tue (Sep 23)', FN: 95.8, AN: 84.1 },
    { day: 'Wed (Sep 24)', FN: 94.5, AN: 86.0 },
    { day: 'Thu (Sep 25)', FN: 95.1, AN: 82.5 },
    { day: 'Fri (Sep 26)', FN: 93.8, AN: 76.2 }, // Friday dip
    { day: 'Today (Sep 28)', FN: 94.7, AN: 81.6 }
  ];

  // Department Comparison
  const departmentData = classes.map((c) => ({
    name: c.code,
    fullName: c.name,
    FN: c.todaysFnRate,
    AN: c.todaysAnRate,
    Overall: c.overallRate
  }));

  // Risk Distribution
  const safeCount = students.filter((s) => s.overallAttendanceRate >= 85).length;
  const moderateCount = students.filter(
    (s) => s.overallAttendanceRate >= 75 && s.overallAttendanceRate < 85
  ).length;
  const criticalCount = students.filter((s) => s.overallAttendanceRate < 75).length;

  const riskPieData = [
    { name: 'Safe (>85%)', value: safeCount, color: '#10b981' },
    { name: 'Moderate (75-85%)', value: moderateCount, color: '#f59e0b' },
    { name: 'Detention Risk (<75%)', value: criticalCount, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
          Executive Telemetry
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
          Institutional Academic & Attendance Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Cross-session longitudinal correlations, Friday afternoon departure patterns, and hall-ticket risk matrices.
        </p>
      </div>

      {/* Primary Chart: Dual-Session Weekly Trend */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Dual-Session Longitudinal Roll-Call Trend (FN vs AN)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Notice the consistent divergence between Forenoon theory lectures and Afternoon laboratory hours.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-mono">
            Variance: -17.6% on Fridays
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis domain={[60, 100]} stroke="#64748b" fontSize={11} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="FN"
                name="Forenoon (FN: 09:00 - 12:45)"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="AN"
                name="Afternoon (AN: 01:30 - 04:30)"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Department Comparison + Detention Risk Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Comparison Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Departmental Session Comparison
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Today's Forenoon vs Afternoon percentages by academic branch
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis domain={[60, 100]} stroke="#64748b" fontSize={11} unit="%" />
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
                <Bar dataKey="FN" name="FN Theory" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="AN" name="AN Practical" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Donut */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Institutional Exam Hall-Ticket Risk Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Students categorized against 75% university eligibility cutoff
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '0.75rem',
                      border: 'none',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            {riskPieData.map((item, i) => (
              <div key={i} className="p-2 rounded-xl bg-slate-50">
                <span className="text-[10px] font-bold text-slate-500 block truncate">{item.name}</span>
                <p className="text-base font-bold font-mono mt-0.5" style={{ color: item.color }}>
                  {item.value} studs
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
