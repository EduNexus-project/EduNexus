import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 4,
  className = ''
}) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      <div className="h-6 bg-slate-200 rounded-lg w-1/3"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="h-10 w-10 bg-slate-200 rounded-xl shrink-0"></div>
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
            <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
          </div>
          <div className="h-8 w-20 bg-slate-200 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
};
