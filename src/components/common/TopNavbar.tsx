import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERPData } from '../../context/ERPDataContext';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services/notificationService';
import { NotificationItem } from '../../types';
import {
  Bell,
  Calendar,
  Sparkles,
  LogOut,
  Clock,
  UserRound,
  ImagePlus,
  Users
} from 'lucide-react';

interface TopNavbarProps {
  onNavigateTab?: (tab: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onNavigateTab }) => {
  const { currentUser, role, logout, updateProfilePhoto } = useAuth();
  const { success } = useToast();
  const {
    selectedDate,
    setSelectedDate,
    runAiAnomalyScan,
    students,
    selectedParentStudentId,
    setSelectedParentStudentId
  } = useERPData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    notificationService.syncFromBackend();
    const unsub = notificationService.subscribe((items) => {
      setNotifications(notificationService.getNotificationsForRole(role, currentUser?.id));
    });
    return unsub;
  }, [currentUser?.id, role]);

  useEffect(() => {
    if (!selectedPhoto) {
      setPhotoPreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedPhoto);
    setPhotoPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedPhoto]);

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

  const handlePhotoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setSelectedPhoto(null);
      setPhotoError('Choose a JPG, JPEG, or PNG image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSelectedPhoto(null);
      setPhotoError('Profile photos must be 2 MB or smaller.');
      return;
    }

    setPhotoError('');
    setSelectedPhoto(file);
  };

  const handleSavePhoto = async () => {
    if (!selectedPhoto) return;
    setIsSavingPhoto(true);
    const result = await updateProfilePhoto(selectedPhoto);
    setIsSavingPhoto(false);
    if (!result.success) {
      setPhotoError(result.message || 'Unable to update your profile photo.');
      return;
    }
    setSelectedPhoto(null);
    setPhotoError('');
    success('Profile photo updated');
  };

  const renderAvatar = (size: string, imageClass = '') => {
    const src = photoPreviewUrl || currentUser?.avatar;
    return src ? (
      <img src={src} alt={`${currentUser?.name || 'User'} profile`} className={`${size} rounded-full object-cover ${imageClass}`} />
    ) : (
      <span className={`${size} rounded-full bg-slate-100 text-slate-500 flex items-center justify-center ${imageClass}`}>
        <UserRound className="w-1/2 h-1/2" />
      </span>
    );
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
        {role === 'parent' && students.length > 1 && (
          <label className="flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-700">
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">My Children</span>
            <select
              aria-label="My Children"
              value={selectedParentStudentId || ''}
              onChange={(event) => setSelectedParentStudentId(event.target.value || null)}
              className="max-w-36 bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs cursor-pointer"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} • {student.rollNumber}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Zone 2: Right - Notifications & User Profile */}
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
            {renderAvatar('w-8 h-8', 'ring-2 ring-indigo-500/20')}
            <div className="hidden md:block text-left pr-1">
              <p className="text-xs font-bold text-slate-800 leading-none">{currentUser?.name || 'Account'}</p>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5 capitalize">{role}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 max-h-[80vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                {renderAvatar('w-12 h-12', 'shrink-0')}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name || 'Account'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                    {currentUser?.designation || role}
                  </span>
                </div>
              </div>

              <div className="p-3 border-b border-slate-100">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                  onChange={handlePhotoSelected}
                  className="hidden"
                />
                {selectedPhoto && photoPreviewUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={photoPreviewUrl} alt="Profile photo preview" className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700">Preview photo</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          type="button"
                          onClick={handleSavePhoto}
                          disabled={isSavingPhoto}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                        >
                          {isSavingPhoto ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSelectedPhoto(null); setPhotoError(''); }}
                          className="text-xs font-medium text-slate-500 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setPhotoError(''); photoInputRef.current?.click(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-left font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <ImagePlus className="w-4 h-4 text-indigo-600" />
                    Change Profile Photo
                  </button>
                )}
                <p className="text-[10px] text-slate-400 mt-2">JPG, JPEG or PNG; maximum 2 MB.</p>
                {photoError && <p role="alert" className="text-[11px] text-rose-600 mt-2">{photoError}</p>}
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
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
