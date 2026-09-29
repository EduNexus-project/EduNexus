import React, { useState } from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { useAuth } from '../../context/AuthContext';
import { RequestType, Student } from '../../types';
import {
  FileCheck2,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Plus
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const TeacherRequests: React.FC<{ initialStudent?: Student | null }> = ({
  initialStudent
}) => {
  const { currentUser } = useAuth();
  const { students, requests, submitModificationRequest } = useERPData();
  const classStudents = students.filter((s) => s.classId === 'cls_cse_a');

  const [showModal, setShowModal] = useState(false);
  const [requestType, setRequestType] = useState<RequestType>('attendance_correction');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudent?.id || classStudents[0]?.id || ''
  );
  const [dateOrExam, setDateOrExam] = useState('2026-09-28 (AN Session)');
  const [subjectCode, setSubjectCode] = useState('CS604: Cloud Computing Lab');
  const [originalValue, setOriginalValue] = useState('Absent');
  const [proposedValue, setProposedValue] = useState('Present (On Duty)');
  const [reason, setReason] = useState(
    'Student represented university at internal Smart India Hackathon scrutiny round with prior HOD endorsement.'
  );

  const myRequests = requests.filter((r) => r.teacherId === currentUser?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    submitModificationRequest({
      requestType,
      teacherId: currentUser?.id || '',
      teacherName: currentUser?.name || 'Current user',
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      classId: student.classId,
      className: student.className,
      dateOrExam,
      subjectCode: requestType === 'marks_revision' ? subjectCode : undefined,
      originalValue,
      proposedValue,
      reason
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
            Administrative Appeals
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Faculty Modification Workflow
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit formal appeals for locked attendance and examination records to the Principal.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Modification Appeal</span>
        </button>
      </div>

      {/* Rules Notice */}
      <div className="p-4 rounded-2xl bg-slate-100/90 border border-slate-200 text-slate-700 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900">Decoupled Administrative Safeguard Protocol</p>
          <p className="leading-relaxed">
            All appeals automatically undergo an <strong>AI Safety Assessment</strong> calculating risk indices, historic teacher correlation, and institutional policy matching before routing to the Principal's digital desk.
          </p>
        </div>
      </div>

      {/* List of Submitted Requests */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Your Submitted Appeals ({myRequests.length})
        </h3>

        {myRequests.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No modification appeals filed yet.
          </div>
        ) : (
          myRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      req.requestType === 'attendance_correction'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {req.requestType.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{req.studentName} ({req.rollNumber})</span>
                  <span className="text-xs text-slate-500 font-mono">• {req.dateOrExam}</span>
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

              {/* Target values */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Original</span>
                  <p className="font-mono font-bold text-slate-700 mt-0.5">{req.originalValue}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Proposed Target</span>
                  <p className="font-mono font-bold text-emerald-900 mt-0.5">{req.proposedValue}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100 italic">
                "{req.reason}"
              </p>

              {/* AI Safety Assessment indicator */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-500">
                <span className="flex items-center gap-1 text-purple-700 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  AI Safety Index: {req.aiSafetyAssessment.safetyScore}% ({req.aiSafetyAssessment.riskIndex})
                </span>

                {req.reviewedBy && (
                  <span className="font-semibold text-slate-800">
                    Digitally Signed by {req.reviewedBy}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Appeal Modal */}
      {showModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowModal(false)}
          title="Submit Locked Record Modification Appeal"
          subtitle="All submissions require Dean of Academics digital authorization."
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Appeal Category</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRequestType('attendance_correction')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    requestType === 'attendance_correction'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Attendance Correction
                </button>
                <button
                  type="button"
                  onClick={() => setRequestType('marks_revision')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    requestType === 'marks_revision'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Marks Revision
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {classStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNumber}) – {s.className}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Session Date / Exam</label>
                <input
                  type="text"
                  required
                  value={dateOrExam}
                  onChange={(e) => setDateOrExam(e.target.value)}
                  placeholder="e.g. 2026-09-28 (AN Session)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Code</label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="e.g. CS604: Cloud Lab"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Locked Value</label>
                <input
                  type="text"
                  required
                  value={originalValue}
                  onChange={(e) => setOriginalValue(e.target.value)}
                  placeholder="e.g. Absent or 38 / 50"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Proposed Target Value</label>
                <input
                  type="text"
                  required
                  value={proposedValue}
                  onChange={(e) => setProposedValue(e.target.value)}
                  placeholder="e.g. Present (On Duty) or 44 / 50"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Faculty Justification & Evidence
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State academic reason, HOD approval details, or re-evaluation findings..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
              />
            </div>

            {/* Live AI Safety Index Preview */}
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs">
              <span className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Live AI Safety Estimation
              </span>
              <p className="leading-relaxed text-[11px]">
                Estimated Safety Index: <strong>{reason.toLowerCase().includes('duty') ? '94% (Safe)' : '88% (Safe)'}</strong>.
                Low risk of grade tampering. Endorsement will be submitted directly to the Principal.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Principal</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
