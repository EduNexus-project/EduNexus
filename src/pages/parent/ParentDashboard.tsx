import React, { useEffect, useState } from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { aiService } from '../../services/aiService';
import { KPICard } from '../../components/common/KPICard';
import { AIProgressSummary } from '../../components/ai/AIProgressSummary';
import { ParentStudentUnavailable } from './ParentStudentUnavailable';
import { StudentMarkReport } from '../../types';
import { parentService } from '../../services/parentService';
import {
  CalendarCheck2,
  Award,
  Sparkles,
  BellRing,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  ArrowRight
} from 'lucide-react';

export const ParentDashboard: React.FC<{ onNavigateTab: (tab: string) => void }> = ({
  onNavigateTab
}) => {
  const { students, classes, selectedDate, selectedParentStudentId, parentStudentsLoading } = useERPData();

  const myStudent = students.find((student) => student.id === selectedParentStudentId) ||
    (students.length === 1 ? students[0] : undefined);
  const [markReportState, setMarkReportState] = useState<{ studentId: string; report: StudentMarkReport } | null>(null);
  const markReport = markReportState && markReportState.studentId === myStudent?.id ? markReportState.report : undefined;

  useEffect(() => {
    if (!myStudent) {
      setMarkReportState(null);
      return;
    }
    let active = true;
    setMarkReportState(null);
    parentService.getMarks(myStudent.id)
      .then((report) => { if (active) setMarkReportState({ studentId: myStudent.id, report }); })
      .catch(() => { if (active) setMarkReportState(null); });
    return () => { active = false; };
  }, [myStudent?.id]);

  if (!myStudent) {
    return <ParentStudentUnavailable loading={parentStudentsLoading} />;
  }

  const digest = aiService.generateParentDigest(myStudent, markReport);
  const mentorName = classes.find((academicClass) => academicClass.id === myStudent.classId)?.classTeacherName;

  const hasAfternoonDrop = myStudent.fnAttendanceRate > myStudent.anAttendanceRate + 10;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
            Guardian Academic Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Ward Overview: {myStudent.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {myStudent.className} • Roll No: {myStudent.rollNumber} • Mentor: {mentorName || 'Assigned faculty'}
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('progress')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>View AI Cognitive Digest</span>
        </button>
      </div>

      {/* Afternoon Departure Warning if applicable */}
      {hasAfternoonDrop && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
          <BellRing className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs flex-1">
            <h4 className="font-bold text-amber-900">
              Notice: Afternoon Laboratory Session Disparity
            </h4>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              Automated institutional telemetry shows {myStudent.name} maintains <strong>{myStudent.fnAttendanceRate}% in Forenoon lectures</strong>, but drops to <strong>{myStudent.anAttendanceRate}% in Afternoon lab hours</strong>. Faculty mentor has been notified.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
          >
            Review Ledger
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Overall Attendance"
          value={`${myStudent.overallAttendanceRate}%`}
          subtext="University Cutoff: 75%"
          icon={<CalendarCheck2 className="w-5 h-5" />}
          highlightColor="indigo"
          trend={{ value: 'Eligible for Finals', isPositive: true }}
          onClick={() => onNavigateTab('attendance')}
        />

        <KPICard
          title="Forenoon (FN) Roll"
          value={`${myStudent.fnAttendanceRate}%`}
          subtext="Theory hours (09:00 - 12:45)"
          icon={<CheckCircle2 className="w-5 h-5" />}
          highlightColor="emerald"
          onClick={() => onNavigateTab('attendance')}
        />

        <KPICard
          title="Afternoon (AN) Roll"
          value={`${myStudent.anAttendanceRate}%`}
          subtext="Practical Labs (01:30 - 04:30)"
          icon={<AlertTriangle className="w-5 h-5" />}
          highlightColor={myStudent.anAttendanceRate < 80 ? 'rose' : 'indigo'}
          onClick={() => onNavigateTab('attendance')}
        />

        <KPICard
          title="Cumulative CGPA"
          value={`${myStudent.academicCgpa}`}
          subtext="Scale of 10.0"
          icon={<Award className="w-5 h-5" />}
          highlightColor="purple"
          trend={{ value: 'Top 15% in CSE', isPositive: true }}
          onClick={() => onNavigateTab('marks')}
        />
      </div>

      {/* AI Digest Component Preview */}
      <AIProgressSummary
        digest={digest}
        onRegenerate={() => onNavigateTab('progress')}
      />

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigateTab('marks')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs flex items-center justify-between"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900">Mid-Term 1 Report Transcript</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              View official subject scores, grades, and COE verification stamp.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-indigo-600" />
        </div>

        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs flex items-center justify-between"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900">Monthly Session Calendar</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect day-by-day morning and afternoon roll-call logs.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-indigo-600" />
        </div>
      </div>
    </div>
  );
};
