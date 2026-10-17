import React, { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  AlertCircle,
  Sparkles,
  Zap,
  GraduationCap,
  Users,
  Building,
  Loader2,
} from 'lucide-react';
import { AttendanceSession } from '../types/erp';

interface TeacherPortalProps {
  onAttendanceMarked: () => void;
  onModificationSubmitted: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  onAttendanceMarked,
  onModificationSubmitted,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'modifications'>('attendance');

  // Attendance Form State
  const [studentId, setStudentId] = useState('STU-1032');
  const [studentName, setStudentName] = useState('Mateo Rossi');
  const [sessionType, setSessionType] = useState<'FN' | 'AN'>('AN');
  const [status, setStatus] = useState<'Present' | 'Absent' | 'Late' | 'Excused'>('Absent');
  const [parentChannel, setParentChannel] = useState<'SMS' | 'WhatsApp' | 'Push'>('WhatsApp');
  const [isSubmittingAtt, setIsSubmittingAtt] = useState(false);
  const [attMessage, setAttMessage] = useState<string | null>(null);

  // Modification Form State
  const [modTeacher, setModTeacher] = useState('Prof. Marcus Vance');
  const [modStudentId, setModStudentId] = useState('STU-1032');
  const [modStudentName, setModStudentName] = useState('Mateo Rossi');
  const [modCourse, setModCourse] = useState('CS-440');
  const [modCourseName, setModCourseName] = useState('Distributed Cloud Systems');
  const [modType, setModType] = useState<'Grade Adjustment' | 'Attendance Override'>('Grade Adjustment');
  const [prevVal, setPrevVal] = useState('62.0% (Grade D)');
  const [propVal, setPropVal] = useState('85.0% (Grade B)');
  const [prevScore, setPrevScore] = useState('62');
  const [propScore, setPropScore] = useState('85');
  const [justification, setJustification] = useState(
    'Student demonstrated correct RAFT consensus implementation during lab oral re-examination.'
  );
  const [isSubmittingMod, setIsSubmittingMod] = useState(false);
  const [modMessage, setModMessage] = useState<string | null>(null);

  const studentDirectory = [
    { id: 'STU-1032', name: 'Mateo Rossi', dept: 'Computer Science', phone: '+1-555-0192', parent: 'Elena Rossi' },
    { id: 'STU-1029', name: 'Sophia Chen', dept: 'Computer Science', phone: '+1-555-0111', parent: 'David Chen' },
    { id: 'STU-1030', name: 'Liam Davies', dept: 'Computer Science', phone: '+1-555-0144', parent: 'Arthur Davies' },
    { id: 'STU-1034', name: 'Noah Kim', dept: 'Data Science', phone: '+1-555-0188', parent: 'Grace Kim' },
    { id: 'STU-1037', name: 'Chloe Dubois', dept: 'Information Systems', phone: '+1-555-0155', parent: 'Marie Dubois' },
  ];

  const handleStudentSelect = (id: string) => {
    setStudentId(id);
    const stu = studentDirectory.find((s) => s.id === id);
    if (stu) setStudentName(stu.name);
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAtt(true);
    setAttMessage(null);

    const stu = studentDirectory.find((s) => s.id === studentId);

    try {
      const res = await fetch('/api/teacher/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          student_name: studentName,
          department: stu?.dept || 'Computer Science & AI',
          cohort: 'CS-2026-A',
          session_type: sessionType,
          status,
          parent_name: stu?.parent || 'Guardian',
          parent_phone: stu?.phone || '+1-555-0100',
          parent_channel: parentChannel,
          building_zone: 'CS Wing Lab 302',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record attendance');

      setAttMessage(data.message);
      onAttendanceMarked();
    } catch (err: any) {
      setAttMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmittingAtt(false);
    }
  };

  const handleSubmitModification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMod(true);
    setModMessage(null);

    try {
      const res = await fetch('/api/teacher/modifications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_name: modTeacher,
          department: 'Computer Science & AI',
          student_id: modStudentId,
          student_name: modStudentName,
          course_code: modCourse,
          course_name: modCourseName,
          modification_type: modType,
          previous_value: prevVal,
          proposed_value: propVal,
          previous_score_num: parseFloat(prevScore),
          proposed_score_num: parseFloat(propScore),
          class_average: 78.5,
          student_historical_average: 64.0,
          justification,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit modification request');

      setModMessage(data.message);
      onModificationSubmitted();
    } catch (err: any) {
      setModMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmittingMod(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">Teacher & Faculty Workstation</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Mark Forenoon (FN) & Afternoon (AN) roll calls with instant Supabase Webhook dispatch, or submit mark modification requests to the Principal.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveSubTab('attendance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'attendance'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Session Attendance & Webhook
            </button>
            <button
              onClick={() => setActiveSubTab('modifications')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'modifications'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Grade Modification Request
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'attendance' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Form */}
          <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Record Student Attendance (Forenoon / Afternoon)
            </h2>

            {attMessage && (
              <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{attMessage}</span>
              </div>
            )}

            <form onSubmit={handleMarkAttendance} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Student</label>
                <select
                  value={studentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {studentDirectory.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id}) • {s.dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Session Type</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSessionType('FN')}
                      className={`py-1.5 rounded-lg text-xs font-semibold ${
                        sessionType === 'FN' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Forenoon (FN)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSessionType('AN')}
                      className={`py-1.5 rounded-lg text-xs font-semibold ${
                        sessionType === 'AN' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Afternoon (AN)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Attendance Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="Present">Present (Attended)</option>
                    <option value="Absent">Absent (Triggers Webhook)</option>
                    <option value="Late">Late Arrival</option>
                    <option value="Excused">Excused Academic Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Parent Notification Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['WhatsApp', 'SMS', 'Push'] as const).map((chan) => (
                    <button
                      key={chan}
                      type="button"
                      onClick={() => setParentChannel(chan)}
                      className={`py-2 rounded-xl text-xs font-medium border transition ${
                        parentChannel === chan
                          ? 'bg-slate-800 border-indigo-500 text-indigo-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {chan}
                    </button>
                  ))}
                </div>
              </div>

              {status === 'Absent' && (
                <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Event-Driven Webhook Trigger:</strong> Submitting an Absent record will instantly commit to Supabase, firing an automated webhook payload to dispatch an alert directly to the parent's {parentChannel} channel.
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingAtt}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-sm transition flex items-center justify-center gap-2"
              >
                {isSubmittingAtt ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Commit Attendance & Fire Webhooks</span>
              </button>
            </form>
          </div>

          {/* Truancy Mechanism Explainer */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-cyan-400" />
                Truancy Anomaly Trigger Rules
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Parallel ERP cross-checks FN (Forenoon) against AN (Afternoon) timestamps. If a student is logged <strong>Present in FN</strong> and subsequently marked <strong>Absent in AN</strong>:
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>AI Anomaly Engine</strong> flags an unauthorized departure alert on the Principal dashboard.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Database Webhook</strong> sends an automated notification to guardian channels.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>3D Campus Heatmap</strong> turns the building beacon red.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'modifications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 max-w-3xl">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            Submit Grade or Attendance Modification Request
          </h2>
          <p className="text-xs text-slate-400">
            Submit proposed score revisions to the Principal. The AI Approval Scoring Assistant will evaluate the change against historical grading curves and class averages.
          </p>

          {modMessage && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{modMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitModification} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Teacher Name</label>
                <input
                  type="text"
                  value={modTeacher}
                  onChange={(e) => setModTeacher(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Student</label>
                <select
                  value={modStudentId}
                  onChange={(e) => {
                    setModStudentId(e.target.value);
                    const stu = studentDirectory.find((s) => s.id === e.target.value);
                    if (stu) setModStudentName(stu.name);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  {studentDirectory.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Course Code</label>
                <input
                  type="text"
                  value={modCourse}
                  onChange={(e) => setModCourse(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Previous Score (%)</label>
                <input
                  type="number"
                  value={prevScore}
                  onChange={(e) => {
                    setPrevScore(e.target.value);
                    setPrevVal(`${e.target.value}%`);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Proposed Score (%)</label>
                <input
                  type="number"
                  value={propScore}
                  onChange={(e) => {
                    setPropScore(e.target.value);
                    setPropVal(`${e.target.value}%`);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold text-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Academic Justification *</label>
              <textarea
                rows={3}
                required
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explain reason for mark re-evaluation, project re-grading, or clerical fix..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingMod}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-sm transition flex items-center gap-2"
            >
              {isSubmittingMod ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Submit to Principal Portal</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
