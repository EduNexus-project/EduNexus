import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { Bell, Clock, BellRing, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ParentNotifications: React.FC = () => {
  const { currentUser, role } = useAuth();
  const notifications = notificationService.getNotificationsForRole(role, currentUser?.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
          Institutional Feed
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
          Notices & Afternoon Departure Alerts
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time communications from Principal, Class Incharge, and automated attendance sentinels.
        </p>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No institutional notices currently present.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                n.type === 'alert'
                  ? 'bg-rose-50/60 border-rose-200'
                  : n.type === 'warning'
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shrink-0">
                {n.type === 'alert' && <BellRing className="w-5 h-5 text-rose-600" />}
                {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                {n.type === 'info' && <Info className="w-5 h-5 text-indigo-600" />}
                {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {n.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
