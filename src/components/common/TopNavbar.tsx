import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERPData } from '../../context/ERPDataContext';
import { notificationService } from '../../services/notificationService';
import { NotificationItem, UserRole } from '../../types';
import {
  Bell,
  Calendar,
  Sparkles,
  LogOut,
  UserCheck,
  GraduationCap,
  Users,
  Shield,
  Check,
  Clock
} from 'lucide-react';

interface TopNavbarProps {
  onNavigateTab?: (tab: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onNavigateTab }) => {
  const { currentUser, role, switchRole, logout } = useAuth();
  const { selectedDate, setSelectedDate, anomalies, requests, runAiAnomalyScan } = useERPData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = notificationService.subscribe((items) => {
      setNotifications(items.filter((n) => n.targetRole === 'all' || n.targetRole === role));
    });
    return unsub;
  }, [role]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead(role, currentUser?.id);
  };

  const handleRoleToggle = (targetRole: UserRole) => {
    switchRole(targetRole);
    if (onNavigateTab) {
      onNavigateTab('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 h-16 flex items-center justify-between transition-all">
      {/* Zone 1: Left - Date Selector & System Mode */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-100/80 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-700 transition-colors">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Academic Session:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs cursor-pointer"
          />
        </div>

        <button
          onClick={() => runAiAnomalyScan()}
          title="Run Real-Time AI Roll-Call Anomaly Scanner"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-all shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>AI Scan</span>
        </button>
      </div>

      {/* Zone 2: Center - Fast Role Toggler */}
      <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
        <button
          onClick={() => handleRoleToggle('principal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            role === 'principal'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Principal</span>
          {requests.filter((r) => r.status === 'pending').length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {requests.filter((r) => r.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleRoleToggle('teacher')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            role === 'teacher'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Teacher</span>
        </button>

        <button
          onClick={() => handleRoleToggle('parent')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            role === 'parent'
              ? 'bg-white text-sky-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-sky-600" />
          <span className="hidden sm:inline">Parent</span>
        </button>
      </div>

      {/* Zone 3: Right - Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No active notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        notificationService.markAsRead(n.id);
                        if (n.linkAction && onNavigateTab) {
                          onNavigateTab(n.linkAction);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                        !n.read ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          !n.read ? 'bg-indigo-600' : 'bg-transparent'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 leading-snug">{n.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block flex items-center gap-1">
                          <Clock className="w-3 h-3 inline" />
                          {n.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-all"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
            <div className="hidden md:block text-left pr-1">
              <p className="text-xs font-bold text-slate-800 leading-none">{currentUser?.name}</p>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5 capitalize">{currentUser?.role}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                  {currentUser?.designation || currentUser?.role}
                </span>
              </div>

              <div className="p-2 space-y-1">
                <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Persona
                </p>
                <button
                  onClick={() => {
                    handleRoleToggle('principal');
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left font-medium ${
                    role === 'principal' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-indigo-600" /> Dr. Ramesh (Principal)
                  </span>
                  {role === 'principal' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>

                <button
                  onClick={() => {
                    handleRoleToggle('teacher');
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left font-medium ${
                    role === 'teacher' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> Prof. Anitha (Faculty)
                  </span>
                  {role === 'teacher' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>

                <button
                  onClick={() => {
                    handleRoleToggle('parent');
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left font-medium ${
                    role === 'parent' ? 'bg-sky-50 text-sky-700 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-sky-600" /> Suresh Kumar (Parent)
                  </span>
                  {role === 'parent' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                </button>
              </div>

              <div className="p-2 border-t border-slate-100">
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-bold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
