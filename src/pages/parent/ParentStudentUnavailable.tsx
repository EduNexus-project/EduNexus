import React from 'react';
import { UserRound } from 'lucide-react';

interface ParentStudentUnavailableProps {
  loading?: boolean;
}

export const ParentStudentUnavailable: React.FC<ParentStudentUnavailableProps> = ({ loading = false }) => (
  <div className="min-h-64 flex items-center justify-center px-4 animate-in fade-in duration-300">
    <div className="max-w-md text-center">
      <UserRound className="w-8 h-8 text-slate-400 mx-auto mb-3" />
      <h2 className="text-base font-bold text-slate-800">
        {loading ? 'Loading linked student record' : 'No student linked to this account'}
      </h2>
      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
        {loading
          ? 'The academic record is being retrieved.'
          : 'Contact your institution to link a student record to this account.'}
      </p>
    </div>
  </div>
);