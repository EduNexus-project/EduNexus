import React, { useState } from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { useAuth } from '../../context/AuthContext';
import { ModificationRequest, RequestStatus } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  GraduationCap
} from 'lucide-react';

export const PrincipalRequests: React.FC = () => {
  const { currentUser } = useAuth();
  const { requests, reviewModificationRequest } = useERPData();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<{
    request: ModificationRequest;
    action: RequestStatus;
  } | null>(null);

  const filtered = requests.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;

  const handleConfirmAction = (remarks?: string) => {
    if (!selectedRequest) return;
    reviewModificationRequest(
      selectedRequest.request.id,
      selectedRequest.action,
      currentUser?.name || 'Dr. Ramesh Sundaram',
      remarks
    );
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
            Administrative Governance
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Faculty Modification Appeals & Digital Sign-Off
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Locked attendance records and exam marks cannot be altered without Principal digital authorization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            {pendingCount} Pending Appeals
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Requests ({requests.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'pending'
              ? 'bg-amber-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pending Review ({pendingCount})
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'approved'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Approved Sign-Offs ({approvedCount})
        </button>
      </div>

      {/* Request Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No modification requests match the active filter.
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 transition-all hover:border-slate-300"
            >
              {/* Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                      req.requestType === 'attendance_correction'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {req.requestType.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{req.dateOrExam}</span>
                  {req.subjectCode && (
                    <span className="text-xs font-mono text-slate-500">• {req.subjectCode}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      req.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : req.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {req.status.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{req.requestedAt}</span>
                </div>
              </div>

              {/* Student & Faculty Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Student</span>
                    <span className="font-bold text-slate-900">{req.studentName}</span>
                    <span className="text-slate-500 font-mono ml-1.5">({req.rollNumber}, {req.className})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant Faculty</span>
                    <span className="font-bold text-slate-900">{req.teacherName}</span>
                  </div>
                </div>
              </div>

              {/* Value comparison table */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                  <span className="text-[10px] uppercase font-bold text-rose-500 block mb-1">
                    Original Locked Value
                  </span>
                  <p className="font-bold text-rose-900 text-sm font-mono">{req.originalValue}</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">
                    Proposed Target Value
                  </span>
                  <p className="font-bold text-emerald-900 text-sm font-mono">{req.proposedValue}</p>
                </div>
              </div>

              {/* Faculty Reason */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Faculty Justification Statement
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  "{req.reason}"
                </p>
              </div>

              {/* Automated AI Safety Assessment */}
              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-950 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Automated AI Safety Assessment
                  </span>
                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-purple-200/80 text-purple-900">
                    Safety Index: {req.aiSafetyAssessment.safetyScore}% ({req.aiSafetyAssessment.riskIndex.toUpperCase()})
                  </span>
                </div>
                <p className="text-purple-900 text-xs leading-relaxed">
                  {req.aiSafetyAssessment.rationale}
                </p>
                <p className="text-[10px] text-purple-700 font-mono">
                  Audit Metric: {req.aiSafetyAssessment.historicCorrelation}
                </p>
              </div>

              {/* Reviewed information or Actions */}
              {req.status === 'pending' ? (
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedRequest({ request: req, action: 'rejected' })}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Reject Appeal
                  </button>
                  <button
                    onClick={() => setSelectedRequest({ request: req, action: 'approved' })}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Digital Sign-Off</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>
                    Reviewed by <strong className="text-slate-700">{req.reviewedBy}</strong> on {req.reviewedAt}
                  </span>
                  {req.reviewRemarks && (
                    <span className="italic text-slate-600">"{req.reviewRemarks}"</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Confirm Dialog */}
      {selectedRequest && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setSelectedRequest(null)}
          onConfirm={handleConfirmAction}
          variant={selectedRequest.action === 'approved' ? 'success' : 'danger'}
          title={
            selectedRequest.action === 'approved'
              ? 'Digital Institutional Sign-Off'
              : 'Reject Appeal'
          }
          message={
            selectedRequest.action === 'approved'
              ? `Authorize amendment for ${selectedRequest.request.studentName} (${selectedRequest.request.rollNumber}). The locked register will be updated from "${selectedRequest.request.originalValue}" to "${selectedRequest.request.proposedValue}".`
              : `Confirm rejection of appeal submitted by ${selectedRequest.request.teacherName}.`
          }
          confirmLabel={selectedRequest.action === 'approved' ? 'Digital Sign-Off' : 'Confirm Rejection'}
        />
      )}
    </div>
  );
};
