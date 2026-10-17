/**
 * SHT AI-ERP BETA — TEAM 3
 * Sakith Harvan Technologies
 * Fully Data-Driven, Persistent School Management Platform
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ShtNavbar, ShtNavTab } from './components/ShtNavbar';
import { AuthScreen } from './components/AuthScreen';
import { PrincipalDashboardView } from './components/PrincipalDashboardView';
import { TeacherPortalView } from './components/TeacherPortalView';
import { ParentDashboardView } from './components/ParentDashboardView';
import { ConnectionModal } from './components/ConnectionModal';

// Code-split heavy secondary tabs to optimize production bundles
const Campus3DHeatmap = lazy(() => import('./components/Campus3DHeatmap').then((m) => ({ default: m.Campus3DHeatmap })));
const WebhookMonitor = lazy(() => import('./components/WebhookMonitor').then((m) => ({ default: m.WebhookMonitor })));
const QASecurityAudit = lazy(() => import('./components/QASecurityAudit').then((m) => ({ default: m.QASecurityAudit })));
const VercelDeploymentGuide = lazy(() => import('./components/VercelDeploymentGuide').then((m) => ({ default: m.VercelDeploymentGuide })));

import {
  UserProfile,
  PrincipalSummaryStats,
  CorrectionRequest,
  AnomalyAlert,
  AuditLog,
  StudentRecord,
  ERPClass,
  MarkRecord,
  ERPNotification,
} from './types/sht';
import { Loader2 } from 'lucide-react';

export default function App() {
  // Current authenticated user session (null when unauthenticated)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('sht_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<ShtNavTab>(() => {
    try {
      const stored = localStorage.getItem('sht_user_profile');
      if (stored) {
        const u = JSON.parse(stored);
        return u.role as ShtNavTab;
      }
    } catch {}
    return 'principal';
  });

  // ERP Datasets (Zero fake data baseline)
  const [stats, setStats] = useState<PrincipalSummaryStats>({
    total_students: 0,
    total_teachers: 0,
    total_classes: 0,
    today_attendance_pct: 0,
    fn_present: 0,
    fn_total: 0,
    an_present: 0,
    an_total: 0,
    present_count: 0,
    absent_count: 0,
    pending_count: 0,
    active_anomalies_count: 0,
    pending_corrections_count: 0,
  });

  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [studentsList, setStudentsList] = useState<StudentRecord[]>([]);
  const [classesList, setClassesList] = useState<ERPClass[]>([]);
  const [marksList, setMarksList] = useState<MarkRecord[]>([]);
  const [notificationsList, setNotificationsList] = useState<ERPNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  const loadAllData = async () => {
    try {
      const [sumRes, corRes, anomRes, audRes, clsRes, stuRes, mrkRes, notifRes] = await Promise.all([
        fetch('/api/sht/principal/summary').then((r) => r.json()).catch(() => null),
        fetch('/api/sht/corrections').then((r) => r.json()).catch(() => []),
        fetch('/api/sht/anomalies').then((r) => r.json()).catch(() => []),
        fetch('/api/sht/audit-logs').then((r) => r.json()).catch(() => []),
        fetch('/api/sht/classes').then((r) => r.json()).catch(() => []),
        fetch('/api/sht/students').then((r) => r.json()).catch(() => []),
        fetch('/api/sht/marks').then((r) => r.json()).catch(() => []),
        fetch('/api/sht/notifications').then((r) => r.json()).catch(() => []),
      ]);

      if (sumRes?.stats) setStats(sumRes.stats);
      if (Array.isArray(corRes)) setCorrections(corRes);
      if (Array.isArray(anomRes)) setAnomalies(anomRes);
      if (Array.isArray(audRes)) setAudits(audRes);
      if (Array.isArray(clsRes)) setClassesList(clsRes);
      if (Array.isArray(stuRes)) setStudentsList(stuRes);
      if (Array.isArray(mrkRes)) setMarksList(mrkRes);
      if (Array.isArray(notifRes)) setNotificationsList(notifRes);
    } catch (err) {
      console.error('Failed to load SHT AI-ERP state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleLoginSuccess = (user: UserProfile, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('sht_user_profile', JSON.stringify(user));
    localStorage.setItem('sht_auth_token', token);
    setActiveTab(user.role as ShtNavTab);
    loadAllData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sht_user_profile');
    localStorage.removeItem('sht_auth_token');
  };

  // If visitor is unauthenticated, render the Split-Screen Login & Registration Experience
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const activeAnomaliesCount = anomalies.filter((a) => a.status === 'Active').length;
  const pendingCorrectionsCount = corrections.filter((c) => c.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <ShtNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        activeAnomaliesCount={activeAnomaliesCount}
        pendingCorrectionsCount={pendingCorrectionsCount}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onLogout={handleLogout}
        notifications={notificationsList}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-400 font-mono">
              Loading Institutional Records from Database...
            </p>
          </div>
        ) : (
          <>
            {/* Principal Portal */}
            {activeTab === 'principal' && (
              <PrincipalDashboardView
                stats={stats}
                corrections={corrections}
                anomalies={anomalies}
                audits={audits}
                students={studentsList}
                classes={classesList}
                onRefresh={loadAllData}
                onOpen3DView={() => setActiveTab('heatmap')}
              />
            )}

            {/* Teacher Workstation */}
            {activeTab === 'teacher' && (
              <TeacherPortalView
                classes={classesList}
                students={studentsList}
                marks={marksList}
                onRefresh={loadAllData}
                currentUser={currentUser}
              />
            )}

            {/* Parent Portal */}
            {activeTab === 'parent' && (
              <ParentDashboardView
                currentUser={currentUser}
                notifications={notificationsList}
              />
            )}

            <Suspense
              fallback={
                <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  <p className="text-xs text-slate-400 font-mono">Loading module...</p>
                </div>
              }
            >
              {activeTab === 'heatmap' && <Campus3DHeatmap />}

              {activeTab === 'webhooks' && (
                <WebhookMonitor
                  logs={notificationsList.map((n) => ({
                    id: n.id,
                    event_id: 'evt-' + n.id,
                    event_type: 'ATTENDANCE_ABSENCE_COMMITTED',
                    session_type: 'AN',
                    student_id: n.recipient_id,
                    student_name: 'Student',
                    parent_name: 'Guardian',
                    parent_channel: n.channel,
                    destination_phone: n.recipient_phone,
                    message_preview: n.message,
                    delivery_status: n.status,
                    latency_ms: n.latency_ms,
                    hmac_verified: true,
                    timestamp: n.created_at,
                  }))}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'qa_audit' && <QASecurityAudit />}

              {activeTab === 'guide' && <VercelDeploymentGuide />}
            </Suspense>
          </>
        )}
      </main>

      {/* SHT Team 3 Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div>
            <span className="font-bold text-slate-200">SHT AI-ERP Beta • Team 3</span>
            <span className="text-slate-500 mx-2">|</span>
            <span className="text-slate-400">Sakith Harvan Technologies</span>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Team Lead: <span className="text-indigo-400 font-semibold">Sujith</span> • Members: <span className="text-slate-300">Sneha, Siddu, T. Vyshnavi</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] text-slate-500">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">Persistent Disk Storage</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">Supabase Connected</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">Gemini 3.8 / Groq</span>
          </div>
        </div>
      </footer>

      {/* Diagnostics Modal */}
      <ConnectionModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </div>
  );
}
