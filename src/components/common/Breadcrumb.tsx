import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  items: { label: string; active?: boolean; onClick?: () => void }[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
      <div className="flex items-center gap-1 text-slate-400">
        <Home className="w-3.5 h-3.5" />
        <span>EduNexus</span>
      </div>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          {item.active ? (
            <span className="text-slate-800 font-semibold">{item.label}</span>
          ) : (
            <button
              onClick={item.onClick}
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
