import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERPData } from '../../context/ERPDataContext';
import {
  LayoutDashboard,
  CalendarCheck2,
  AlertTriangle,
  FileCheck2,
  GraduationCap,
  Users,
  BarChart3,
  Settings,
  BookOpen,
  Award,
  Sparkles,
  Bell,
  User,
  HeartHandshake,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse
}) => {
  const { role } = useAuth();
  const { requests, anomalies } = useERPData();

  const pendingRequestsCount = requests.filter((r) => r.status === 'pending').length;
  const activeAnomaliesCount = anomalies.filter((a) => a.status === 'pending_review').length;

  const principalNav = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'attendance', label: 'Dual-Session Roll', icon: CalendarCheck2 },
    {
      id: 'anomalies',
      label: 'AI Anomaly Center',
      icon: AlertTriangle,
      badge: activeAnomaliesCount > 0 ? activeAnomaliesCount : undefined,
      badgeColor: 'bg-rose-500'
    },
    {
      id: 'requests',
      label: 'Modification Appeals',
      icon: FileCheck2,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
      badgeColor: 'bg-amber-500'
    },
    { id: 'students', label: 'Student Directory', icon: GraduationCap },
    { id: 'teachers', label: 'Faculty Directory', icon: BookOpen },
    { id: 'parents', label: 'Guardian Network', icon: HeartHandshake },
    { id: 'analytics', label: 'Institutional Analytics', icon: BarChart3 },
    { id: 'settings', label: 'System Governance', icon: Settings }
  ];

  const teacherNav = [
    { id: 'dashboard', label: 'Faculty Desk', icon: LayoutDashboard },
    { id: 'classes', label: 'Assigned Classes', icon: Layers },
    { id: 'attendance', label: 'Mark FN & AN Roll', icon: CalendarCheck2 },
    { id: 'marks', label: 'Continuous Marks', icon: Award },
    {
      id: 'requests',
      label: 'Submit Modification',
      icon: FileCheck2,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
      badgeColor: 'bg-indigo-500'
    },
    { id: 'analytics', label: 'Class Performance', icon: BarChart3 }
  ];

  const parentNav = [
    { id: 'dashboard', label: 'Student Overview', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance Ledger', icon: CalendarCheck2 },
    { id: 'marks', label: 'Semester Grades', icon: Award },
    { id: 'progress', label: 'AI Cognitive Digest', icon: Sparkles, badge: 'AI', badgeColor: 'bg-purple-600' },
    { id: 'requests', label: 'Requests', icon: FileCheck2 },
    { id: 'notifications', label: 'Institutional Notices', icon: Bell },
    { id: 'profile', label: 'Student Profile', icon: User }
  ];

  const navItems = role === 'principal' ? principalNav : role === 'teacher' ? teacherNav : parentNav;

  return (
    <aside
      className={`relative bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-300 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/40">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-base shadow-md shadow-indigo-500/20">
              E
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block leading-none">
                EduNexus
              </span>
              <span className="text-[10px] text-indigo-400 font-mono font-medium tracking-wide">
                Smart Academic ERP
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-lg">
            E
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden lg:block"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Indicator Banner */}
      {!collapsed && (
        <div className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-800/60 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Role</span>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
              role === 'principal'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : role === 'teacher'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
            }`}
          >
            {role.toUpperCase()}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}

              {item.badge !== undefined && (
                <span
                  className={`ml-auto px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-indigo-500'} ${
                    collapsed ? 'absolute top-1.5 right-1.5 w-2 h-2 p-0 rounded-full' : ''
                  }`}
                >
                  {!collapsed ? item.badge : ''}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer info */}
      {!collapsed && (
        <div className="p-3.5 m-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Dual-Session Engine
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            FN: 09:00 - 12:45 | AN: 01:30 - 04:30
          </p>
        </div>
      )}
    </aside>
  );
};
