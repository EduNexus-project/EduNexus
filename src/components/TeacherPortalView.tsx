import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  GraduationCap,
  Send,
  AlertCircle,
  FileText,
  Sparkles,
  Zap,
  ArrowRight,
  Loader2,
  Check,
  X,
  PlusCircle,
  Lock,
  Edit3,
} from 'lucide-react';
import {
  ERPClass,
  StudentRecord,
  AttendanceRecord,
  MarkRecord,
  ExamRecord,
  SubjectRecord,
  UserProfile,
} from '../types/sht';

interface TeacherPortalProps {
  classes: ERPClass[];
  students: StudentRecord[];
  marks: MarkRecord[];
  onRefresh: () => void;
  currentUser?: UserProfile;
}

export const TeacherPortalView: React.FC<TeacherPortalProps> = ({
  classes,
  students,
  marks,
  onRefresh,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'marks' | 'correction_form'>('attendance');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [sessionDate, setSessionDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState<'FN' | 'AN'>('FN');

  // Attendance roster state
  const classStudents = students.filter((s) => s.class_id === selectedClassId);
  const [rosterAttendance, setRosterAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isSessionCommitted, setIsSessionCommitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Examination State
  const [examinations, setExaminations] = useState<ExamRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamType, setNewExamType] = useState<'Unit Test' | 'Midterm' | 'Final' | 'Project'>('Unit Test');
  const [newExamMaxMarks, setNewExamMaxMarks] = useState(100);

  // Batch Marks Entry Modal State
  const [isEnterMarksOpen, setIsEnterMarksOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [marksInput, setMarksInput] = useState<Record<string, { score: number; remarks: string }>>({});
  const [isSubmittingMarks, setIsSubmittingMarks] = useState(false);

  // Correction Request Form State
  const [corStudentId, setCorStudentId] = useState(classStudents[0]?.student_id || 'STU-1032');
  const [corType, setCorType] = useState<'mark' | 'attendance'>('mark');
  const [corCourseOrDate, setCorCourseOrDate] = useState('Distributed Cloud Systems (CS-440)');
  const [corOriginalVal, setCorOriginalVal] = useState('62.0% (Grade D)');
  const [corProposedVal, setCorProposedVal] = useState('85.0% (Grade B)');
  const [corOrigNum, setCorOrigNum] = useState('62');
  const [corPropNum, setCorPropNum] = useState('85');
  const [corReason, setCorReason] = useState('Student submitted project re-evaluation with updated GitHub commits.');
  const [corSubmitting, setCorSubmitting] = useState(false);

  // Fetch examinations & subjects
  const loadExamsAndSubjects = () => {
    fetch('/api/sht/examinations')
      .then((r) => r.json())
      .then((list) => {
        if (Array.isArray(list)) {
          setExaminations(list);
          if (list.length > 0 && !selectedExamId) setSelectedExamId(list[0].id);
        }
      })
      .catch((err) => console.error(err));

    fetch('/api/sht/directory/all')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.subjects)) {
          setSubjects(data.subjects);
          if (data.subjects.length > 0 && !selectedSubjectId) setSelectedSubjectId(data.subjects[0].id);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadExamsAndSubjects();
  }, []);

  // Check and retrieve existing attendance for this class, date & session
  useEffect(() => {
    if (!selectedClassId || !sessionDate || !sessionType) return;
    setIsLoadingSession(true);
    fetch(`/api/sht/attendance?class_id=${selectedClassId}&date=${sessionDate}&session_type=${sessionType}`)
      .then((r) => r.json())
      .then((records: AttendanceRecord[]) => {
        if (Array.isArray(records) && records.length > 0) {
          setIsSessionCommitted(true);
          const map: Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'> = {};
          records.forEach((rec) => {
            map[rec.student_id] = rec.status;
          });
          setRosterAttendance(map);
        } else {
          setIsSessionCommitted(false);
          // Default all to Present for convenient rollout
          const map: Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'> = {};
          classStudents.forEach((stu) => {
            map[stu.student_id] = 'Present';
          });
          setRosterAttendance(map);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingSession(false));
  }, [selectedClassId, sessionDate, sessionType]);

  const handleStatusToggle = (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    setRosterAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'> = {};
    classStudents.forEach((s) => {
      updated[s.student_id] = 'Present';
    });
    setRosterAttendance(updated);
  };

  const handleMarkAllAbsent = () => {
    const updated: Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'> = {};
    classStudents.forEach((s) => {
      updated[s.student_id] = 'Absent';
    });
    setRosterAttendance(updated);
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const records = classStudents.map((s) => ({
      student_id: s.student_id,
      status: rosterAttendance[s.student_id] || 'Present',
    }));

    try {
      const res = await fetch('/api/sht/attendance/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: selectedClassId,
          session_date: sessionDate,
          session_type: sessionType,
          records,
          recorded_by: currentUser ? `${currentUser.name} (Teacher)` : 'Faculty Member',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit attendance');

      setFeedback(data.message);
      setIsSessionCommitted(true);
      onRefresh();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sht/examinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newExamName,
          exam_type: newExamType,
          class_id: selectedClassId,
          max_marks: Number(newExamMaxMarks),
          academic_year: '2026-2027',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create exam');

      setFeedback(`Created examination "${newExamName}" successfully.`);
      setIsCreateExamOpen(false);
      setNewExamName('');
      loadExamsAndSubjects();
      onRefresh();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    }
  };

  const handleOpenEnterMarks = () => {
    // Initialize marksInput with existing marks or defaults
    const map: Record<string, { score: number; remarks: string }> = {};
    classStudents.forEach((stu) => {
      const existing = marks.find(
        (m) => m.student_id === stu.student_id && m.exam_id === selectedExamId && m.subject_id === selectedSubjectId
      );
      map[stu.student_id] = {
        score: existing ? existing.score : 80,
        remarks: existing?.remarks || 'Routine evaluation',
      };
    });
    setMarksInput(map);
    setIsEnterMarksOpen(true);
  };

  const handleSubmitBatchMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMarks(true);
    setFeedback(null);

    const entries = classStudents.map((stu) => ({
      student_id: stu.student_id,
      score: marksInput[stu.student_id]?.score || 0,
      remarks: marksInput[stu.student_id]?.remarks || '',
    }));

    try {
      const res = await fetch('/api/sht/marks/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_id: selectedExamId,
          subject_id: selectedSubjectId,
          marks_entries: entries,
          entered_by: currentUser ? `${currentUser.name} (Teacher)` : 'Faculty Member',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save marks');

      setFeedback(data.message);
      setIsEnterMarksOpen(false);
      onRefresh();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmittingMarks(false);
    }
  };

  const handleStudentSelectInCorrection = (stuId: string) => {
    setCorStudentId(stuId);
    const stu = students.find((s) => s.student_id === stuId);
    if (stu) {
      const studentMark = marks.find((m) => m.student_id === stuId);
      if (studentMark) {
        setCorOriginalVal(`${studentMark.score}% (Grade ${studentMark.grade})`);
        setCorOrigNum(String(studentMark.score));
        setCorCourseOrDate(`${studentMark.subject_name}`);
      }
    }
  };

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    setCorSubmitting(true);
    setFeedback(null);

    const targetStudent = students.find((s) => s.student_id === corStudentId);

    try {
      const res = await fetch('/api/sht/corrections/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: currentUser?.id || 'usr-teacher-gen',
          teacher_name: currentUser ? currentUser.name : 'Faculty Member',
          record_type: corType,
          target_id: 'target-auto',
          student_id: corStudentId,
          student_name: targetStudent?.student_name || corStudentId,
          course_or_date: corCourseOrDate,
          original_value: corOriginalVal,
          proposed_value: corProposedVal,
          original_score_num: Number(corOrigNum) || undefined,
          proposed_score_num: Number(corPropNum) || undefined,
          reason: corReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');

      setFeedback(data.message);
      onRefresh();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setCorSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">Teacher Workstation & Roll Call Engine</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Submit Forenoon (FN) & Afternoon (AN) attendance with duplicate prevention, manage exams, enter marks, and request record corrections.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'attendance' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Session Roll Call
            </button>
            <button
              onClick={() => setActiveTab('marks')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'marks' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Class Marks & Exams
            </button>
            <button
              onClick={() => setActiveTab('correction_form')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'correction_form' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Request Correction
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            {feedback}
          </span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* 1. ATTENDANCE ROLL CALL TAB */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls & Roster */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">Roll Call Roster</h3>
                {isSessionCommitted && (
                  <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Lock className="w-3 h-3" />
                    Session Recorded & Locked
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 font-semibold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} ({c.name})
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 font-mono"
                />

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setSessionType('FN')}
                    className={`px-2.5 py-1 rounded-lg font-bold font-mono transition ${
                      sessionType === 'FN' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Forenoon (FN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionType('AN')}
                    className={`px-2.5 py-1 rounded-lg font-bold font-mono transition ${
                      sessionType === 'AN' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Afternoon (AN)
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {classStudents.length} Students in Roster
                {isLoadingSession && <span className="ml-2 text-indigo-400 font-mono text-[10px]">(Loading status...)</span>}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark All Present</span>
                </button>
                <button
                  type="button"
                  onClick={handleMarkAllAbsent}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Mark All Absent</span>
                </button>
              </div>
            </div>

            {/* Student Roster Table */}
            {classStudents.length === 0 ? (
              <div className="p-10 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-2">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">No students enrolled in this class</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Enroll students in this class through the Principal Directory to begin recording session attendance.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {classStudents.map((stu) => {
                const currentStatus = rosterAttendance[stu.student_id] || 'Present';
                return (
                  <div
                    key={stu.student_id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-mono font-bold text-[11px]">
                        {stu.roll_no}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-200">{stu.student_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID: {stu.student_id} • Parent: {stu.parent_name} ({stu.parent_channel})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {(['Present', 'Absent', 'Late', 'Excused'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusToggle(stu.student_id, status)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            currentStatus === status
                              ? status === 'Present'
                                ? 'bg-emerald-600 text-white'
                                : status === 'Absent'
                                ? 'bg-rose-600 text-white'
                                : status === 'Late'
                                ? 'bg-amber-600 text-white'
                                : 'bg-cyan-600 text-white'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                {isSessionCommitted
                  ? 'Note: This session has existing entries. Submitting will preserve unique constraints and log audit changes.'
                  : 'Submitting will commit the official session roster and trigger webhook alerts for absences.'}
              </span>
              <button
                type="button"
                onClick={handleSubmitAttendance}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Commit {sessionType} Attendance</span>
              </button>
            </div>
          </div>

          {/* Right Column: Attendance Rules & Information */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-cyan-400" />
                Attendance Engine Rules
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <strong className="text-indigo-400 block mb-0.5">Dual-Session Protocol:</strong>
                  Classes operate on Forenoon (FN) and Afternoon (AN) sessions. Both sessions contribute equally to the 75% semester minimum.
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <strong className="text-rose-400 block mb-0.5">Truancy Anomaly Trigger:</strong>
                  Marking a student Absent in AN after being Present in FN immediately flags a potential departure anomaly to the Principal.
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <strong className="text-emerald-400 block mb-0.5">Automated Webhook Dispatches:</strong>
                  Marking an Absent record fires an automated real-time notification to the parent's mobile channel (WhatsApp / SMS).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CLASS MARKS & EXAMS TAB */}
      {activeTab === 'marks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Class Examinations & Performance Marks</h3>
              <p className="text-xs text-slate-400">Class 10-A Distributed Cloud Systems (CS-440)</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateExamOpen(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Create Examination</span>
              </button>
              <button
                onClick={handleOpenEnterMarks}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Enter / Record Marks</span>
              </button>
              <button
                onClick={() => setActiveTab('correction_form')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Request Mark Correction</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Exam Name</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Teacher Remarks</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {marks.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-400">{row.student_id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-200">{row.student_name}</td>
                    <td className="px-4 py-3 text-slate-300">{row.subject_name}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{row.exam_name}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-200">
                      {row.score} / {row.max_marks}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          row.grade.startsWith('A')
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : row.grade.startsWith('B')
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : row.grade.startsWith('C')
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {row.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 italic">{row.remarks || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          handleStudentSelectInCorrection(row.student_id);
                          setActiveTab('correction_form');
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline"
                      >
                        Correction
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. REQUEST CORRECTION FORM */}
      {activeTab === 'correction_form' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 max-w-3xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Submit Mark or Attendance Correction Request
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Teachers cannot directly overwrite committed examination marks or attendance records. Submit this request for Principal approval.
            </p>
          </div>

          <form onSubmit={handleSubmitCorrection} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Student</label>
                <select
                  value={corStudentId}
                  onChange={(e) => handleStudentSelectInCorrection(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  {students.map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.student_name} ({s.student_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Record Type</label>
                <select
                  value={corType}
                  onChange={(e) => setCorType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="mark">Examination Mark Correction</option>
                  <option value="attendance">Attendance Status Override</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Course / Date</label>
                <input
                  type="text"
                  value={corCourseOrDate}
                  onChange={(e) => setCorCourseOrDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Original Value</label>
                <input
                  type="text"
                  value={corOriginalVal}
                  onChange={(e) => setCorOriginalVal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Proposed Value *</label>
                <input
                  type="text"
                  required
                  value={corProposedVal}
                  onChange={(e) => setCorProposedVal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold text-emerald-400"
                />
              </div>
            </div>

            {corType === 'mark' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Original Score (Number)</label>
                  <input
                    type="number"
                    value={corOrigNum}
                    onChange={(e) => setCorOrigNum(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Proposed Score (Number)</label>
                  <input
                    type="number"
                    value={corPropNum}
                    onChange={(e) => setCorPropNum(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold text-emerald-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-medium mb-1">Reason for Correction *</label>
              <textarea
                rows={3}
                required
                value={corReason}
                onChange={(e) => setCorReason(e.target.value)}
                placeholder="Explain the academic rationale (e.g. project regrading, clerical entry error, rubric audit)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={corSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow transition flex items-center gap-2"
              >
                {corSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Submit Correction to Principal</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE EXAMINATION MODAL */}
      {isCreateExamOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                Create New Examination
              </h3>
              <button onClick={() => setIsCreateExamOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExamSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Examination Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit Test 2 or Final Semester Exam"
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Exam Type</label>
                  <select
                    value={newExamType}
                    onChange={(e) => setNewExamType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="Unit Test">Unit Test</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Final">Final</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={newExamMaxMarks}
                    onChange={(e) => setNewExamMaxMarks(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateExamOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white shadow"
                >
                  Create Examination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENTER MARKS MODAL */}
      {isEnterMarksOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  Enter / Record Examination Marks
                </h3>
                <p className="text-xs text-slate-400">Class {selectedClassId}</p>
              </div>
              <button onClick={() => setIsEnterMarksOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-shrink-0 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Select Examination</label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  {examinations.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.exam_type})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Select Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  {subjects.map((sb) => (
                    <option key={sb.id} value={sb.id}>
                      {sb.name} ({sb.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handleSubmitBatchMarks} className="flex-1 overflow-y-auto space-y-3 text-xs pr-1">
              <div className="space-y-2">
                {classStudents.map((stu) => {
                  const val = marksInput[stu.student_id] || { score: 75, remarks: '' };
                  const grade =
                    val.score >= 90 ? 'A+' : val.score >= 80 ? 'B+' : val.score >= 70 ? 'C+' : val.score >= 60 ? 'D' : 'F';
                  return (
                    <div
                      key={stu.student_id}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="w-1/3">
                        <div className="font-semibold text-slate-200">{stu.student_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{stu.student_id}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={val.score}
                          onChange={(e) =>
                            setMarksInput((prev) => ({
                              ...prev,
                              [stu.student_id]: { ...val, score: Number(e.target.value) },
                            }))
                          }
                          className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-slate-100"
                        />
                        <span className="w-8 text-center font-mono font-bold text-xs text-indigo-400">
                          {grade}
                        </span>
                      </div>

                      <input
                        type="text"
                        placeholder="Remarks..."
                        value={val.remarks}
                        onChange={(e) =>
                          setMarksInput((prev) => ({
                            ...prev,
                            [stu.student_id]: { ...val, remarks: e.target.value },
                          }))
                        }
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 text-[11px]"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEnterMarksOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMarks}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow flex items-center gap-1.5"
                >
                  {isSubmittingMarks && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Commit Class Marks</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
