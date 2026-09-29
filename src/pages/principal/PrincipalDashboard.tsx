import React, { useState } from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { useAuth } from '../../context/AuthContext';
import { KPICard } from '../../components/common/KPICard';
import { AIInsightCard } from '../../components/ai/AIInsightCard';
import { AnomalyAlert } from '../../components/ai/AnomalyAlert';
import { CampusAttendance3D } from '../../components/visualization/CampusAttendance3D';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Users,
  CalendarCheck2,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { ModificationRequest } from '../../types';

export const PrincipalDashboard: React.FC<{ onNavigateTab: (tab: string) => void }> = ({
  onNavigateTab
}) => {
  const { currentUser } = useAuth();
  const {
    students,
    classes,
    anomalies,
    requests,
    reviewModificationRequest,
    runAiAnomalyScan,
    selectedDate
  } = useERPData();

  const [selectedRequestToReview, setSelectedRequestToReview] = useState<{
    request: ModificationRequest;
    action: 'approved' | 'rejected';
  } | null>(null);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const activeAnomalies = anomalies.filter((a) => a.status === 'pending_review');

  // Overall attendance statistics
  const avgFn = Math.round(
    classes.reduce((acc, c) => acc + c.todaysFnRate, 0) / (classes.length || 1)
  );
  const avgAn = Math.round(
    classes.reduce((acc, c) => acc + c.todaysAnRate, 0) / (classes.length || 1)
  );
  const overallRate = Math.round((avgFn + avgAn) / 2);

  const handleConfirmApproval = (remarks?: string) => {
    if (!selectedRequestToReview) return;
    reviewModificationRequest(
      selectedRequestToReview.request.id,
      selectedRequestToReview.action,
      currentUser?.name || 'Current user',
      remarks
    );
    setSelectedRequestToReview(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
            Administrative Directorate • Session 2026-27
          </span>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
            Institutional Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time dual-session supervision, continuous anomaly detection, and digital governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('attendance')}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
          >
            Dual-Session Matrix
          </button>
          <button
            onClick={() => onNavigateTab('requests')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Review Appeals ({pendingRequests.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Overall Attendance Rate"
          value={`${overallRate}%`}
          subtext={`FN: ${avgFn}% | AN: ${avgAn}%`}
          icon={<CalendarCheck2 className="w-5 h-5" />}
          highlightColor="indigo"
          trend={{ value: '+1.4% vs last week', isPositive: true }}
          onClick={() => onNavigateTab('attendance')}
        />

        <KPICard
          title="Afternoon Drop Variance"
          value={`-${avgFn - avgAn}%`}
          subtext="Lab session departure rate"
          icon={<TrendingDown className="w-5 h-5" />}
          highlightColor="amber"
          trend={{ value: 'Elevated across Friday Labs', isPositive: false }}
          onClick={() => onNavigateTab('anomalies')}
        />

        <KPICard
          title="AI Anomalies Flagged"
          value={activeAnomalies.length}
          subtext="Requires administrative review"
          icon={<AlertTriangle className="w-5 h-5" />}
          highlightColor="rose"
          trend={{ value: '3 high priority', isPositive: false }}
          onClick={() => onNavigateTab('anomalies')}
        />

        <KPICard
          title="Modification Appeals"
          value={pendingRequests.length}
          subtext="Awaiting digital sign-off"
          icon={<FileCheck2 className="w-5 h-5" />}
          highlightColor="purple"
          trend={{ value: '100% verified AI safety', isPositive: true, neutral: true }}
          onClick={() => onNavigateTab('requests')}
        />
      </div>

      {/* AI Insight Card */}
      <AIInsightCard
        anomalies={anomalies}
        onViewAll={() => onNavigateTab('anomalies')}
        onTriggerScan={() => runAiAnomalyScan()}
      />

      {/* 3D Campus Heatmap & Quick Class Roll Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CampusAttendance3D />
        </div>

        {/* Academic Classes Quick Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Today's Class Roll Rates</h3>
              <span className="text-[11px] font-mono text-slate-500">{selectedDate}</span>
            </div>

            <div className="space-y-3">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{cls.code}</span>
                    <span className="tabular-nums font-mono text-indigo-600">{cls.overallRate}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{cls.name}</p>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      FN: {cls.todaysFnRate}%
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md border ${
                        cls.todaysAnRate < 80
                          ? 'text-rose-700 bg-rose-50 border-rose-100'
                          : 'text-blue-700 bg-blue-50 border-blue-100'
                      }`}
                    >
                      AN: {cls.todaysAnRate}%
                    </span>
                    <span className="text-slate-400">{cls.totalStudents} studs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('attendance')}
            className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View All Department Registers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pending Appeals & Urgent Anomalies Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Faculty Modification Appeals */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Pending Faculty Modification Appeals
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('requests')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View All ({pendingRequests.length}) →
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No pending faculty appeals requiring Principal sign-off.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{req.studentName} ({req.rollNumber})</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                      AI Safety {req.aiSafetyAssessment.safetyScore}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">{req.reason}</p>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">By {req.teacherName}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          setSelectedRequestToReview({ request: req, action: 'rejected' })
                        }
                        className="px-2.5 py-1 text-slate-600 hover:text-rose-600 text-xs font-semibold"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() =>
                          setSelectedRequestToReview({ request: req, action: 'approved' })
                        }
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Sign & Approve</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority AI Anomaly Feed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Priority AI Anomaly Feed</h3>
            </div>
            <button
              onClick={() => onNavigateTab('anomalies')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Open Center ({activeAnomalies.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {activeAnomalies.slice(0, 2).map((anomaly) => (
              <AnomalyAlert
                key={anomaly.id}
                anomaly={anomaly}
                compact={true}
                onReview={() => onNavigateTab('anomalies')}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Digital Sign-Off */}
      {selectedRequestToReview && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setSelectedRequestToReview(null)}
          onConfirm={handleConfirmApproval}
          variant={selectedRequestToReview.action === 'approved' ? 'success' : 'danger'}
          title={
            selectedRequestToReview.action === 'approved'
              ? 'Institutional Digital Sign-Off & Approval'
              : 'Reject Faculty Modification Appeal'
          }
          message={
            selectedRequestToReview.action === 'approved'
              ? `You are digitally authorising the ${selectedRequestToReview.request.requestType.replace('_', ' ')} for ${selectedRequestToReview.request.studentName} (${selectedRequestToReview.request.rollNumber}) submitted by ${selectedRequestToReview.request.teacherName}. This will automatically alter locked registers and notify the parent.`
              : `Are you sure you want to reject this modification request?`
          }
          confirmLabel={
            selectedRequestToReview.action === 'approved'
              ? 'Authorize & Synchronize Records'
              : 'Confirm Rejection'
          }
        />
      )}
    </div>
  );
};
