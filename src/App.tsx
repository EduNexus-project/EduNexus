/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ERPDataProvider } from './context/ERPDataContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';

// Principal screens
import { PrincipalDashboard } from './pages/principal/PrincipalDashboard';
import { PrincipalAttendance } from './pages/principal/PrincipalAttendance';
import { PrincipalAnomalies } from './pages/principal/PrincipalAnomalies';
import { PrincipalRequests } from './pages/principal/PrincipalRequests';
import { PrincipalStudents } from './pages/principal/PrincipalStudents';
import { PrincipalTeachers } from './pages/principal/PrincipalTeachers';
import { PrincipalParents } from './pages/principal/PrincipalParents';
import { PrincipalAnalytics } from './pages/principal/PrincipalAnalytics';
import { PrincipalSettings } from './pages/principal/PrincipalSettings';

// Teacher screens
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherClasses } from './pages/teacher/TeacherClasses';
import { TeacherAttendance } from './pages/teacher/TeacherAttendance';
import { TeacherMarks } from './pages/teacher/TeacherMarks';
import { TeacherRequests } from './pages/teacher/TeacherRequests';
import { TeacherAnalytics } from './pages/teacher/TeacherAnalytics';

// Parent screens
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { ParentAttendance } from './pages/parent/ParentAttendance';
import { ParentMarks } from './pages/parent/ParentMarks';
import { ParentProgress } from './pages/parent/ParentProgress';
import { ParentNotifications } from './pages/parent/ParentNotifications';
import { ParentProfile } from './pages/parent/ParentProfile';
import { ParentRequests } from './pages/parent/ParentRequests';

const AppContent: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setCurrentTab('dashboard')} />;
  }

  const renderActiveScreen = () => {
    if (role === 'principal') {
      switch (currentTab) {
        case 'dashboard':
          return <PrincipalDashboard onNavigateTab={setCurrentTab} />;
        case 'attendance':
          return <PrincipalAttendance />;
        case 'anomalies':
          return <PrincipalAnomalies />;
        case 'requests':
          return <PrincipalRequests />;
        case 'students':
          return <PrincipalStudents />;
        case 'teachers':
          return <PrincipalTeachers />;
        case 'parents':
          return <PrincipalParents />;
        case 'analytics':
          return <PrincipalAnalytics />;
        case 'settings':
          return <PrincipalSettings />;
        default:
          return <PrincipalDashboard onNavigateTab={setCurrentTab} />;
      }
    }

    if (role === 'teacher') {
      switch (currentTab) {
        case 'dashboard':
          return <TeacherDashboard onNavigateTab={setCurrentTab} />;
        case 'classes':
          return <TeacherClasses onNavigateTab={setCurrentTab} />;
        case 'attendance':
          return <TeacherAttendance onOpenRequestModal={() => setCurrentTab('requests')} />;
        case 'marks':
          return <TeacherMarks onOpenRequestModal={() => setCurrentTab('requests')} />;
        case 'requests':
          return <TeacherRequests />;
        case 'analytics':
          return <TeacherAnalytics />;
        default:
          return <TeacherDashboard onNavigateTab={setCurrentTab} />;
      }
    }

    if (role === 'parent') {
      switch (currentTab) {
        case 'dashboard':
          return <ParentDashboard onNavigateTab={setCurrentTab} />;
        case 'attendance':
          return <ParentAttendance />;
        case 'marks':
          return <ParentMarks />;
        case 'progress':
          return <ParentProgress />;
        case 'requests':
          return <ParentRequests />;
        case 'notifications':
          return <ParentNotifications />;
        case 'profile':
          return <ParentProfile />;
        default:
          return <ParentDashboard onNavigateTab={setCurrentTab} />;
      }
    }

    return <PrincipalDashboard onNavigateTab={setCurrentTab} />;
  };

  return (
    <DashboardLayout currentTab={currentTab} onSelectTab={setCurrentTab}>
      {renderActiveScreen()}
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ERPDataProvider>
          <AppContent />
        </ERPDataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
