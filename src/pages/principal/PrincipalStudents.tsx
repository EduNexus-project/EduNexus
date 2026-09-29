import React, { useState } from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { useToast } from '../../context/ToastContext';
import { SearchBar } from '../../components/common/SearchBar';
import { RiskBadge } from '../../components/common/Badges';
import { GraduationCap, Phone, Mail, Award, AlertTriangle, ShieldCheck, Plus, Pencil } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { StudentAvatar } from '../../components/common/StudentAvatar';
import { Student } from '../../types';
import { authService } from '../../services/authService';

interface StudentFormValues {
  studentId: string;
  name: string;
  email: string;
  phone: string;
  classId: string;
  section: string;
  rollNumber: string;
  dateOfBirth: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentRelationship: '' | 'father' | 'mother' | 'guardian';
}

const emptyStudentForm: StudentFormValues = {
  studentId: '',
  name: '',
  email: '',
  phone: '',
  classId: '',
  section: '',
  rollNumber: '',
  dateOfBirth: '',
  parentName: '',
  parentEmail: '',
  parentPhone: '',
  parentRelationship: ''
};

export const PrincipalStudents: React.FC = () => {
  const { students, classes, getStudentMarkReport, refreshData } = useERPData();
  const { success } = useToast();
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [inspectStudent, setInspectStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentForm, setStudentForm] = useState<StudentFormValues>(emptyStudentForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClass === 'all' || s.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  const markReport = inspectStudent ? getStudentMarkReport(inspectStudent.id) : undefined;

  const openStudentForm = (student?: Student) => {
    setEditingStudent(student || null);
    setStudentForm(student ? {
      studentId: student.studentId || '',
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      classId: student.classId,
      section: student.section,
      rollNumber: student.rollNumber,
      dateOfBirth: student.dateOfBirth || '',
      parentName: student.parentName || '',
      parentEmail: student.parentEmail || '',
      parentPhone: student.parentPhone || '',
      parentRelationship: student.parentRelationship || ''
    } : emptyStudentForm);
    setFormError('');
    setShowStudentForm(true);
  };

  const handleStudentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError('');
    const selectedClassInfo = classes.find((academicClass) => academicClass.id === studentForm.classId);
    try {
      const response = await fetch(
        editingStudent ? `/api/academic/students/${encodeURIComponent(editingStudent.id)}` : '/api/academic/students',
        {
          method: editingStudent ? 'PUT' : 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify({
            ...studentForm,
            parentRelationship: studentForm.parentRelationship || undefined,
            className: selectedClassInfo?.name || editingStudent?.className || '',
            department: selectedClassInfo?.department || editingStudent?.department || '',
            semester: selectedClassInfo?.semester || editingStudent?.semester || 0
          })
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        setFormError(result.message || 'Unable to save student record.');
        return;
      }
      await refreshData();
      setShowStudentForm(false);
      setEditingStudent(null);
      success(editingStudent ? 'Student record updated' : 'Student created');
    } catch {
      setFormError('Unable to reach the student service. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
            Academic Registry
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Student Roster & Longitudinal Profiles
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full enrollment registry with cumulative CGPA, dual-session roll rates, and AI detention risks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openStudentForm()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by student name, roll number (e.g. 21CS101)..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Department:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="all">All Classes</option>
            {classes.map((academicClass) => (
              <option key={academicClass.id} value={academicClass.id}>{academicClass.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Student & Identity</th>
                <th className="px-5 py-3">Branch & Sem</th>
                <th className="px-5 py-3">Cumulative CGPA</th>
                <th className="px-5 py-3">Forenoon (FN)</th>
                <th className="px-5 py-3">Afternoon (AN)</th>
                <th className="px-5 py-3">Overall Roll</th>
                <th className="px-5 py-3">Risk Index</th>
                <th className="px-5 py-3 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <StudentAvatar name={s.name} src={s.avatar} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" />
                      <div>
                        <p className="font-bold text-slate-900">{s.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">ID: {s.studentId || s.id}</p>
                        <p className="text-[11px] font-mono text-slate-400">{s.rollNumber}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="font-medium text-slate-700 block">{s.department}</span>
                    <span className="text-[10px] text-slate-400">Sem {s.semester} (Sec {s.section})</span>
                  </td>

                  <td className="px-5 py-3.5 font-bold font-mono text-slate-900">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {s.academicCgpa} / 10.0
                    </span>
                  </td>

                  <td className="px-5 py-3.5 font-mono text-emerald-700 font-bold">
                    {s.fnAttendanceRate}%
                  </td>

                  <td className="px-5 py-3.5 font-mono font-bold">
                    <span className={s.anAttendanceRate < 80 ? 'text-rose-600' : 'text-blue-700'}>
                      {s.anAttendanceRate}%
                    </span>
                  </td>

                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                    {s.overallAttendanceRate}%
                  </td>

                  <td className="px-5 py-3.5">
                    <RiskBadge level={s.riskLevel} />
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setInspectStudent(s)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                      >
                        Dossier
                      </button>
                      <button
                        onClick={() => openStudentForm(s)}
                        title={`Edit ${s.name}`}
                        aria-label={`Edit ${s.name}`}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Dossier Modal */}
      {inspectStudent && (
        <Modal
          isOpen={true}
          onClose={() => setInspectStudent(null)}
          title={`Academic Dossier: ${inspectStudent.name}`}
          subtitle={`Roll No: ${inspectStudent.rollNumber} • ${inspectStudent.className}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Bio Header */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <StudentAvatar name={inspectStudent.name} src={inspectStudent.avatar} className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/20" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">{inspectStudent.name}</h3>
                  <RiskBadge level={inspectStudent.riskLevel} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Student ID: {inspectStudent.studentId || inspectStudent.id} • {inspectStudent.department} • Semester {inspectStudent.semester}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {inspectStudent.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {inspectStudent.parentPhone}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  DOB: {inspectStudent.dateOfBirth || 'Not recorded'} · Parent: {inspectStudent.parentName || 'Not linked'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {inspectStudent.parentEmail || 'No parent email'}{inspectStudent.parentRelationship ? ` · ${inspectStudent.parentRelationship}` : ''}
                </p>
              </div>
            </div>

            {/* Attendance & GPA */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Forenoon</span>
                <p className="text-base font-bold text-emerald-600 font-mono mt-0.5">{inspectStudent.fnAttendanceRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Afternoon</span>
                <p className="text-base font-bold text-rose-600 font-mono mt-0.5">{inspectStudent.anAttendanceRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall</span>
                <p className="text-base font-bold text-slate-900 font-mono mt-0.5">{inspectStudent.overallAttendanceRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">CGPA</span>
                <p className="text-base font-bold text-indigo-600 font-mono mt-0.5">{inspectStudent.academicCgpa}</p>
              </div>
            </div>

            {/* Subject Marks if available */}
            {markReport && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Examination Assessment Ledger ({markReport.examTerm})
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <tr>
                        <th className="px-3 py-2">Subject</th>
                        <th className="px-3 py-2">Internal (50)</th>
                        <th className="px-3 py-2">External (100)</th>
                        <th className="px-3 py-2">Total (100)</th>
                        <th className="px-3 py-2">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {markReport.subjects.map((sub) => (
                        <tr key={sub.subjectCode}>
                          <td className="px-3 py-2 font-medium text-slate-900">{sub.subjectName}</td>
                          <td className="px-3 py-2 font-mono">{sub.internalObtained}</td>
                          <td className="px-3 py-2 font-mono">{sub.externalObtained}</td>
                          <td className="px-3 py-2 font-mono font-bold text-indigo-600">{sub.totalObtained}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700">{sub.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => { setInspectStudent(null); openStudentForm(inspectStudent); }}
                className="mr-auto flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Student
              </button>
              <button
                onClick={() => setInspectStudent(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={showStudentForm}
        onClose={() => setShowStudentForm(false)}
        title={editingStudent ? 'Edit Student' : 'Add Student'}
        subtitle="Maintain the student record and optional parent relationship."
        maxWidth="2xl"
      >
        <form onSubmit={handleStudentSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-slate-700 space-y-1">
              <span>Student ID</span>
              <input required value={studentForm.studentId} onChange={(event) => setStudentForm({ ...studentForm, studentId: event.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </label>
            <label className="text-xs font-semibold text-slate-700 space-y-1">
              <span>Full Name</span>
              <input required value={studentForm.name} onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </label>
            <label className="text-xs font-semibold text-slate-700 space-y-1">
              <span>Student Email</span>
              <input required type="email" value={studentForm.email} onChange={(event) => setStudentForm({ ...studentForm, email: event.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </label>
            <label className="text-xs font-semibold text-slate-700 space-y-1">
              <span>Student Phone</span>
              <input type="tel" value={studentForm.phone} onChange={(event) => setStudentForm({ ...studentForm, phone: event.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </label>
            <label className="text-xs font-semibold text-slate-700 space-y-1">
              <span>Class</span>
              <select required value={studentForm.classId} onChange={(event) => {
                const selected = classes.find((academicClass) => academicClass.id === event.target.value);
                setStudentForm({ ...studentForm, classId: event.target.value, section: selected?.section || '' });
              }} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <option value="">Select class</option>
                {classes.map((academicClass) => <option key={academicClass.id} value={academicClass.id}>{academicClass.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-700 space-y-1">
              <span>Section</span>
              <input required value={studentForm.section} readOnly className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl" />
            </label>
            <label className="text-xs font-semibold text-slate-700 space-y-1">
              <span>Roll Number</span>
              <input required value={studentForm.rollNumber} onChange={(event) => setStudentForm({ ...studentForm, rollNumber: event.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </label>
            <label className="text-xs font-semibold text-slate-700 space-y-1">
              <span>Date of Birth</span>
              <input required type="date" value={studentForm.dateOfBirth} onChange={(event) => setStudentForm({ ...studentForm, dateOfBirth: event.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </label>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Parent Contact (Optional)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-700 space-y-1">
                <span>Parent / Guardian Name</span>
                <input value={studentForm.parentName} onChange={(event) => setStudentForm({ ...studentForm, parentName: event.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </label>
              <label className="text-xs font-semibold text-slate-700 space-y-1">
                <span>Parent Email</span>
                <input type="email" value={studentForm.parentEmail} onChange={(event) => setStudentForm({ ...studentForm, parentEmail: event.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </label>
              <label className="text-xs font-semibold text-slate-700 space-y-1">
                <span>Parent Phone</span>
                <input type="tel" value={studentForm.parentPhone} onChange={(event) => setStudentForm({ ...studentForm, parentPhone: event.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </label>
              <label className="text-xs font-semibold text-slate-700 space-y-1">
                <span>Relationship</span>
                <select value={studentForm.parentRelationship} onChange={(event) => setStudentForm({ ...studentForm, parentRelationship: event.target.value as StudentFormValues['parentRelationship'] })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <option value="">Select relationship</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="guardian">Guardian</option>
                </select>
              </label>
            </div>
          </div>

          {formError && <p role="alert" className="text-xs text-rose-600">{formError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowStudentForm(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-60">
              {isSaving ? 'Saving...' : editingStudent ? 'Save Student' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
