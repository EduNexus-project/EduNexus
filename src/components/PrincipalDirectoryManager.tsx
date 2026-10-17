import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Building,
  BookOpen,
  Search,
  PlusCircle,
  X,
  Loader2,
  CheckCircle2,
  HeartHandshake,
  Trash2,
  Edit2,
  AlertTriangle,
  Mail,
  Phone,
  UserCheck,
} from 'lucide-react';
import { ERPClass, StudentRecord, SubjectRecord } from '../types/sht';

interface DirectoryManagerProps {
  classes: ERPClass[];
  students: StudentRecord[];
  onRefresh: () => void;
}

export const PrincipalDirectoryManager: React.FC<DirectoryManagerProps> = ({
  classes,
  students,
  onRefresh,
}) => {
  const [category, setCategory] = useState<'students' | 'teachers' | 'parents' | 'classes' | 'subjects'>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [directoryData, setDirectoryData] = useState<{
    students: StudentRecord[];
    teachers: any[];
    parents: any[];
    classes: ERPClass[];
    subjects: SubjectRecord[];
  }>({
    students,
    teachers: [],
    parents: [],
    classes,
    subjects: [],
  });

  // Modal States
  const [isEnrollStudentOpen, setIsEnrollStudentOpen] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<{ type: string; id: string; name: string } | null>(null);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Student Form
  const [newStudentName, setNewStudentName] = useState('');
  const [newRollNo, setNewRollNo] = useState('');
  const [newClassId, setNewClassId] = useState(classes[0]?.id || '');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('+1-555-');
  const [newParentChannel, setNewParentChannel] = useState<'WhatsApp' | 'SMS' | 'Push'>('WhatsApp');

  // Edit Student Form
  const [editStudentName, setEditStudentName] = useState('');
  const [editRollNo, setEditRollNo] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editParentName, setEditParentName] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');

  // New Teacher Form
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPhone, setNewTeacherPhone] = useState('+1-555-');
  const [newTeacherDept, setNewTeacherDept] = useState('Computer Science');
  const [newTeacherClassId, setNewTeacherClassId] = useState(classes[0]?.id || '');
  const [newTeacherStaffId, setNewTeacherStaffId] = useState('');

  // New Class Form
  const [newClassCode, setNewClassCode] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newClassDept, setNewClassDept] = useState('Computer Science & AI');
  const [newClassSection, setNewClassSection] = useState('A');

  // New Subject Form
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectTeacher, setNewSubjectTeacher] = useState('');
  const [newSubjectClassId, setNewSubjectClassId] = useState(classes[0]?.id || '');

  const fetchDirectory = () => {
    fetch('/api/sht/directory/all')
      .then((r) => r.json())
      .then((data) => {
        if (data.students) {
          setDirectoryData(data);
          if (data.classes.length > 0 && !newClassId) {
            setNewClassId(data.classes[0].id);
            setNewTeacherClassId(data.classes[0].id);
            setNewSubjectClassId(data.classes[0].id);
          }
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  // Update default selected class when classes change
  useEffect(() => {
    if (classes.length > 0) {
      if (!newClassId) setNewClassId(classes[0].id);
      if (!newTeacherClassId) setNewTeacherClassId(classes[0].id);
      if (!newSubjectClassId) setNewSubjectClassId(classes[0].id);
    }
  }, [classes]);

  // Enroll Student
  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newRollNo) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/sht/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: newStudentName.trim(),
          roll_no: Number(newRollNo),
          class_id: newClassId || (directoryData.classes[0]?.id || 'cls-gen'),
          parent_name: newParentName.trim() || 'Parent',
          parent_phone: newParentPhone.trim(),
          parent_channel: newParentChannel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to enroll student');

      setFeedback(`Successfully enrolled student: "${data.student.student_name}" (ID: ${data.student.student_id}).`);
      setIsEnrollStudentOpen(false);
      setNewStudentName('');
      setNewRollNo('');
      setNewParentName('');
      fetchDirectory();
      onRefresh();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Student
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editStudentName.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/sht/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: editStudentName.trim(),
          roll_no: Number(editRollNo),
          class_id: editClassId,
          parent_name: editParentName.trim(),
          parent_phone: editParentPhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update student');

      setFeedback(`Updated student name to "${data.student.student_name}".`);
      setEditingStudent(null);
      fetchDirectory();
      onRefresh();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Teacher
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherEmail.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/sht/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeacherName.trim(),
          email: newTeacherEmail.trim(),
          phone: newTeacherPhone.trim(),
          department: newTeacherDept.trim(),
          assigned_class_id: newTeacherClassId,
          staff_id: newTeacherStaffId.trim() || `TCH-${Math.floor(1000 + Math.random() * 9000)}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add teacher');

      setFeedback(`Successfully added faculty member: "${data.teacher.name}".`);
      setIsAddTeacherOpen(false);
      setNewTeacherName('');
      setNewTeacherEmail('');
      setNewTeacherStaffId('');
      fetchDirectory();
      onRefresh();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Class
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassCode.trim() || !newClassName.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/sht/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newClassCode.trim().toUpperCase(),
          name: newClassName.trim(),
          department: newClassDept.trim(),
          section: newClassSection.trim().toUpperCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create class');

      setFeedback(`Successfully created class ${data.class.code} ("${data.class.name}").`);
      setIsCreateClassOpen(false);
      setNewClassCode('');
      setNewClassName('');
      fetchDirectory();
      onRefresh();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Subject
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectCode.trim() || !newSubjectName.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/sht/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: newSubjectClassId,
          code: newSubjectCode.trim().toUpperCase(),
          name: newSubjectName.trim(),
          teacher_name: newSubjectTeacher.trim() || 'Assigned Faculty',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create subject');

      setFeedback(`Successfully created subject "${data.subject.name}".`);
      setIsCreateSubjectOpen(false);
      setNewSubjectCode('');
      setNewSubjectName('');
      setNewSubjectTeacher('');
      fetchDirectory();
      onRefresh();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    setIsSubmitting(true);
    try {
      let endpoint = '';
      if (deletingRecord.type === 'student') endpoint = `/api/sht/students/${deletingRecord.id}`;
      else if (deletingRecord.type === 'teacher') endpoint = `/api/sht/teachers/${deletingRecord.id}`;
      else if (deletingRecord.type === 'class') endpoint = `/api/sht/classes/${deletingRecord.id}`;
      else if (deletingRecord.type === 'subject') endpoint = `/api/sht/subjects/${deletingRecord.id}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete record');
      }

      setFeedback(`Deleted ${deletingRecord.type}: "${deletingRecord.name}".`);
      setDeletingRecord(null);
      fetchDirectory();
      onRefresh();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-4">
      {/* Header & Sub-Navigation */}
      <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-400" />
            Institutional Entity Directory & Management
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real database records: Students, Faculty, Guardians, Classes, and Academic Curricula.
          </p>
        </div>

        {/* Entity Category Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setCategory('students')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              category === 'students' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Students ({directoryData.students.length})
          </button>
          <button
            onClick={() => setCategory('teachers')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              category === 'teachers' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Teachers ({directoryData.teachers.length})
          </button>
          <button
            onClick={() => setCategory('parents')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              category === 'parents' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Parents ({directoryData.parents.length})
          </button>
          <button
            onClick={() => setCategory('classes')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              category === 'classes' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Classes ({directoryData.classes.length})
          </button>
          <button
            onClick={() => setCategory('subjects')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              category === 'subjects' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Subjects ({directoryData.subjects.length})
          </button>
        </div>
      </div>

      {feedback && (
        <div className="mx-5 bg-slate-800 border border-slate-700 text-slate-200 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {feedback}
          </span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Action Bar & Search */}
      <div className="px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={`Search ${category}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {category === 'students' && (
            <button
              onClick={() => setIsEnrollStudentOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Enroll Student</span>
            </button>
          )}

          {category === 'teachers' && (
            <button
              onClick={() => setIsAddTeacherOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Faculty Member</span>
            </button>
          )}

          {category === 'classes' && (
            <button
              onClick={() => setIsCreateClassOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Class</span>
            </button>
          )}

          {category === 'subjects' && (
            <button
              onClick={() => setIsCreateSubjectOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          )}
        </div>
      </div>

      {/* TABLES AND CLEAN EMPTY STATES */}
      <div className="overflow-x-auto pb-4 px-5">
        {/* STUDENTS VIEW */}
        {category === 'students' && (
          directoryData.students.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">No students enrolled yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Begin by enrolling your first student. All exact names and details are saved persistently to the database.
              </p>
              <button
                onClick={() => setIsEnrollStudentOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Enroll Student</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold border-y border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Exact Full Name</th>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Parent / Guardian</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {directoryData.students
                  .filter(
                    (s) =>
                      s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-400">{row.student_id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-100">{row.student_name}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{row.roll_no}</td>
                      <td className="px-4 py-3 font-mono text-cyan-300 font-semibold">{row.class_name}</td>
                      <td className="px-4 py-3 text-slate-300">{row.parent_name}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{row.parent_phone}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingStudent(row);
                              setEditStudentName(row.student_name);
                              setEditRollNo(String(row.roll_no));
                              setEditClassId(row.class_id);
                              setEditParentName(row.parent_name);
                              setEditParentPhone(row.parent_phone);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                            title="Edit Student"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingRecord({ type: 'student', id: row.id, name: row.student_name })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )
        )}

        {/* TEACHERS VIEW */}
        {category === 'teachers' && (
          directoryData.teachers.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">No teachers added yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add faculty members to assign them classes and enable attendance roll call.
              </p>
              <button
                onClick={() => setIsAddTeacherOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Faculty Member</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold border-y border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Faculty ID</th>
                  <th className="px-4 py-3">Exact Name</th>
                  <th className="px-4 py-3">Official Email</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {directoryData.teachers
                  .filter(
                    (t) =>
                      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      t.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-400">{row.staff_id || row.id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-100">{row.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{row.email}</td>
                      <td className="px-4 py-3 text-slate-300">{row.department}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{row.phone || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setDeletingRecord({ type: 'teacher', id: row.id, name: row.name })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Remove Teacher"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )
        )}

        {/* PARENTS VIEW */}
        {category === 'parents' && (
          directoryData.parents.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-2">
              <HeartHandshake className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">No parent accounts registered yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Parents create accounts through the registration portal by linking to their child's admission number.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold border-y border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Guardian Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Linked Student ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {directoryData.parents
                  .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-semibold text-slate-100">{row.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{row.email}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{row.phone || '—'}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">{row.linked_student_id || '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )
        )}

        {/* CLASSES VIEW */}
        {category === 'classes' && (
          directoryData.classes.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-3">
              <Building className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-200">No classes created yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create your first institutional class to structure curricula and student cohorts.
              </p>
              <button
                onClick={() => setIsCreateClassOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Class</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold border-y border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Class Code</th>
                  <th className="px-4 py-3">Class Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Academic Year</th>
                  <th className="px-4 py-3">Enrolled</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {directoryData.classes.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono font-bold text-cyan-300">{row.code}</td>
                    <td className="px-4 py-3 font-semibold text-slate-100">{row.name}</td>
                    <td className="px-4 py-3 text-slate-300">{row.department}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{row.section}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{row.academic_year}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">{row.total_students}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeletingRecord({ type: 'class', id: row.id, name: row.name })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Delete Class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* SUBJECTS VIEW */}
        {category === 'subjects' && (
          directoryData.subjects.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-200">No subjects added yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add academic course subjects and assign them to faculty instructors.
              </p>
              <button
                onClick={() => setIsCreateSubjectOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Subject</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold border-y border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Subject Code</th>
                  <th className="px-4 py-3">Subject Name</th>
                  <th className="px-4 py-3">Assigned Faculty</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {directoryData.subjects.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono font-bold text-cyan-300">{row.code}</td>
                    <td className="px-4 py-3 font-semibold text-slate-100">{row.name}</td>
                    <td className="px-4 py-3 text-slate-300">{row.teacher_name}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeletingRecord({ type: 'subject', id: row.id, name: row.name })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* ENROLL STUDENT MODAL */}
      {isEnrollStudentOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-400" />
                Enroll New Student
              </h4>
              <button onClick={() => setIsEnrollStudentOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollStudent} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Exact Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sujith Sai"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Roll Number</label>
                  <input
                    type="number"
                    required
                    placeholder="101"
                    value={newRollNo}
                    onChange={(e) => setNewRollNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Assigned Class</label>
                  <select
                    value={newClassId}
                    onChange={(e) => setNewClassId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {directoryData.classes.length === 0 ? (
                      <option value="">No classes created</option>
                    ) : (
                      directoryData.classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Parent / Guardian Details
                </span>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Parent Full Name"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Phone (+1-555-...)"
                      value={newParentPhone}
                      onChange={(e) => setNewParentPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <select
                      value={newParentChannel}
                      onChange={(e) => setNewParentChannel(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="SMS">SMS</option>
                      <option value="Push">Push Notification</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollStudentOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save to Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                Edit Student Details (ID: {editingStudent.student_id})
              </h4>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Exact Full Name</label>
                <input
                  type="text"
                  required
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Roll Number</label>
                  <input
                    type="number"
                    value={editRollNo}
                    onChange={(e) => setEditRollNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Assigned Class</label>
                  <select
                    value={editClassId}
                    onChange={(e) => setEditClassId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {directoryData.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Guardian Contact
                </span>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Parent Name"
                    value={editParentName}
                    onChange={(e) => setEditParentName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={editParentPhone}
                    onChange={(e) => setEditParentPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Update Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TEACHER MODAL */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                Add Faculty Member
              </h4>
              <button onClick={() => setIsAddTeacherOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Exact Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Official Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rajesh@sht.edu"
                  value={newTeacherEmail}
                  onChange={(e) => setNewTeacherEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newTeacherPhone}
                    onChange={(e) => setNewTeacherPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Staff / Faculty ID</label>
                  <input
                    type="text"
                    placeholder="TCH-1001"
                    value={newTeacherStaffId}
                    onChange={(e) => setNewTeacherStaffId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Department</label>
                  <input
                    type="text"
                    value={newTeacherDept}
                    onChange={(e) => setNewTeacherDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Assigned Class</label>
                  <select
                    value={newTeacherClassId}
                    onChange={(e) => setNewTeacherClassId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">All Classes</option>
                    {directoryData.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Faculty</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CLASS MODAL */}
      {isCreateClassOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-400" />
                Create Institutional Class
              </h4>
              <button onClick={() => setIsCreateClassOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Class Code</label>
                  <input
                    type="text"
                    required
                    placeholder="CS-10A"
                    value={newClassCode}
                    onChange={(e) => setNewClassCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Section</label>
                  <input
                    type="text"
                    required
                    placeholder="A"
                    value={newClassSection}
                    onChange={(e) => setNewClassSection(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science (Section A)"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={newClassDept}
                  onChange={(e) => setNewClassDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateClassOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Class</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SUBJECT MODAL */}
      {isCreateSubjectOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Add Academic Subject
              </h4>
              <button onClick={() => setIsCreateSubjectOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="CS-401"
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Class</label>
                  <select
                    value={newSubjectClassId}
                    onChange={(e) => setNewSubjectClassId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {directoryData.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Cloud Systems"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Assigned Teacher Name</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Marcus Vance"
                  value={newSubjectTeacher}
                  onChange={(e) => setNewSubjectTeacher(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSubjectOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Subject</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <span className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <h4 className="text-sm font-bold text-slate-100">Confirm Deletion</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete {deletingRecord.type} <span className="font-bold text-white">"{deletingRecord.name}"</span>? This will be removed from the database immediately.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow transition flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
