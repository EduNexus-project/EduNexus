import React from 'react';
import { Clock, FileCheck2 } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';

export const ParentRequests: React.FC = () => {
  const { requests } = useERPData();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
          Linked Student Records
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">Requests</h1>
        <p className="text-xs text-slate-500 mt-0.5">Review requests associated with your linked student records.</p>
      </div>

      {requests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No requests are associated with your linked students.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <FileCheck2 className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">
                    {request.requestType === 'attendance_correction' ? 'Attendance correction' : 'Marks revision'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {request.studentName} · {request.className} · {request.dateOrExam}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{request.reason}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                request.status === 'approved'
                  ? 'bg-emerald-50 text-emerald-700'
                  : request.status === 'rejected'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                <Clock className="w-3 h-3" />
                {request.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};