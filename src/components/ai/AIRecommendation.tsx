import React from 'react';
import { Lightbulb, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

interface AIRecommendationProps {
  title: string;
  category: 'attendance' | 'academic' | 'intervention';
  description: string;
  impactScore?: string;
  onApply?: () => void;
}

export const AIRecommendation: React.FC<AIRecommendationProps> = ({
  title,
  category,
  description,
  impactScore,
  onApply
}) => {
  const iconMap = {
    attendance: <TrendingUp className="w-4 h-4 text-amber-600" />,
    academic: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    intervention: <AlertCircle className="w-4 h-4 text-indigo-600" />
  };

  const bgMap = {
    attendance: 'bg-amber-50/70 border-amber-200/80',
    academic: 'bg-emerald-50/70 border-emerald-200/80',
    intervention: 'bg-indigo-50/70 border-indigo-200/80'
  };

  return (
    <div className={`p-4 rounded-xl border ${bgMap[category]} transition-all flex flex-col justify-between`}>
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {iconMap[category]}
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {category} Directive
            </span>
          </div>
          {impactScore && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
              {impactScore}
            </span>
          )}
        </div>
        <h4 className="text-xs font-bold text-slate-900 mt-2">{title}</h4>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{description}</p>
      </div>

      {onApply && (
        <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-end">
          <button
            onClick={onApply}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Apply Action →
          </button>
        </div>
      )}
    </div>
  );
};
