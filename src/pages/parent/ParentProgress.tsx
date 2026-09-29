import React, { useEffect, useState } from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { aiService } from '../../services/aiService';
import { AIProgressSummary } from '../../components/ai/AIProgressSummary';
import { useToast } from '../../context/ToastContext';
import { Sparkles, MessageSquare, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { ParentStudentUnavailable } from './ParentStudentUnavailable';
import { StudentMarkReport } from '../../types';
import { parentService } from '../../services/parentService';

export const ParentProgress: React.FC = () => {
  const { students, classes, selectedParentStudentId, parentStudentsLoading } = useERPData();
  const { success } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const myStudent = students.find((student) => student.id === selectedParentStudentId) ||
    (students.length === 1 ? students[0] : undefined);
  const mentorName = myStudent
    ? classes.find((academicClass) => academicClass.id === myStudent.classId)?.classTeacherName
    : undefined;
  const [markReportState, setMarkReportState] = useState<{ studentId: string; report: StudentMarkReport } | null>(null);
  const [loadError, setLoadError] = useState('');
  const [digestState, setDigestState] = useState<{
    studentId: string;
    digest: ReturnType<typeof aiService.generateParentDigest>;
  } | null>(null);
  const markReport = markReportState && markReportState.studentId === myStudent?.id ? markReportState.report : undefined;
  const digest = digestState && digestState.studentId === myStudent?.id ? digestState.digest : null;

  useEffect(() => {
    if (!myStudent) return;
    let active = true;
    setMarkReportState(null);
    setDigestState(null);
    setLoadError('');
    parentService.getMarks(myStudent.id)
      .then((studentReport) => {
        if (!active) return;
        setMarkReportState({ studentId: myStudent.id, report: studentReport });
        setDigestState({ studentId: myStudent.id, digest: aiService.generateParentDigest(myStudent, studentReport) });
      })
      .catch((error: Error) => { if (active) setLoadError(error.message); });
    return () => { active = false; };
  }, [myStudent?.id]);

  const handleRegenerate = () => {
    if (!myStudent) return;
    setIsRegenerating(true);
    setTimeout(() => {
      const fresh = aiService.generateParentDigest(myStudent, markReport);
      setDigestState({ studentId: myStudent.id, digest: fresh });
      setIsRegenerating(false);
      success('Cognitive Digest Regenerated', 'Updated plain-language synthesis from latest attendance ledgers.');
    }, 600);
  };

  const handleAcknowledge = () => {
    setAcknowledged(true);
    success('Digest Acknowledged', `Recorded guardian acknowledgment${mentorName ? ` for ${mentorName}` : ''}.`);
  };

  if (!myStudent) {
    return <ParentStudentUnavailable loading={parentStudentsLoading} />;
  }
  if (!digest) {
    return <div role={loadError ? 'alert' : 'status'} className="py-12 text-center text-xs text-slate-500">
      {loadError || 'Loading linked student progress...'}
    </div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
          Cognitive Guardian Intelligence
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
          AI Academic & Attendance Synthesis
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Plain-language synthesis analyzing lecture roll-calls, afternoon labs, and test scores for {myStudent.name}.
        </p>
      </div>

      {/* Main Digest Component */}
      <AIProgressSummary
        digest={digest}
        onRegenerate={handleRegenerate}
        loading={isRegenerating}
      />

      {/* Guardian Acknowledgment Action */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Guardian Digital Acknowledgment</h4>
            <p className="text-xs text-slate-500">
              Confirm you have reviewed this weekly cognitive summary and afternoon session status.
            </p>
          </div>
        </div>

        <button
          onClick={handleAcknowledge}
          disabled={acknowledged}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            acknowledged
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{acknowledged ? 'Acknowledgment Recorded' : 'Confirm & Acknowledge'}</span>
        </button>
      </div>
    </div>
  );
};
