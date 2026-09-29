import React from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Mail, GraduationCap, MapPin, Shield, BookOpen } from 'lucide-react';
import { ParentStudentUnavailable } from './ParentStudentUnavailable';
import { StudentAvatar } from '../../components/common/StudentAvatar';

export const ParentProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const { students, classes, selectedParentStudentId, parentStudentsLoading } = useERPData();
  const myStudent = students.find((student) => student.id === selectedParentStudentId) ||
    (students.length === 1 ? students[0] : undefined);

  if (!myStudent) {
    return <ParentStudentUnavailable loading={parentStudentsLoading} />;
  }
  const mentor = classes.find((academicClass) => academicClass.id === myStudent.classId);

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
          Enrolled Student Record
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
          Student & Guardian Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Official enrollment dossier, emergency contacts, and assigned faculty counselor.
        </p>
      </div>

      {/* Student Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-4">
          <StudentAvatar name={myStudent.name} src={myStudent.avatar} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/20" />
          <div>
            <h3 className="text-base font-bold text-slate-900">{myStudent.name}</h3>
            <p className="text-xs text-indigo-600 font-mono font-medium">{myStudent.rollNumber}</p>
            <p className="text-xs text-slate-500 mt-0.5">{myStudent.className} • Semester {myStudent.semester}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Academic Department</span>
            <p className="font-semibold text-slate-800">{myStudent.department}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Hostel / Residential Status</span>
            <p className="font-semibold text-slate-800">Cauvery Hall of Residence (Room 214)</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Guardian Name</span>
            <p className="font-semibold text-slate-800">{currentUser?.name || myStudent.parentName}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Guardian Registered Contact</span>
            <p className="font-semibold text-slate-800 font-mono">{currentUser?.phone || myStudent.parentPhone}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Relationship</span>
            <p className="font-semibold text-slate-800 capitalize">{myStudent.parentRelationship || currentUser?.relationship || 'Guardian'}</p>
          </div>
        </div>
      </div>

      {/* Mentor Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Assigned Faculty Mentor</h3>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-slate-900">{mentor?.classTeacherName || 'Assigned faculty'}</p>
            <p className="text-slate-500 text-[11px]">Class mentor</p>
            <p className="text-slate-500 text-[11px] font-mono mt-1">{mentor?.code || myStudent.className}</p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
            Active Incharge
          </span>
        </div>
      </div>
    </div>
  );
};
