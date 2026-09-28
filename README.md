# EduNexus – Smart Academic ERP
> **One Connected Platform for Smarter Education**  
> *Team 3: AI-ERP Beta – AI-Augmented Parallel ERP Architecture*

EduNexus is an enterprise-grade academic ERP connecting **Principals & Administrators**, **Faculty/Teachers**, and **Parents/Guardians**. Designed with clean decoupled service abstractions, it specializes in dual-session attendance tracking (**Forenoon FN & Afternoon AN**), continuous AI anomaly detection, structured teacher modification requests, and cognitive progress digests.

---

## 🌟 Key Architecture & Capabilities

### 1. Dual-Session Attendance Matrix (FN & AN)
- Distinct roll-calls for **Forenoon (09:00 AM – 12:45 PM)** and **Afternoon (01:30 PM – 04:30 PM)**.
- Quick bulk actions: "All FN Present", "All AN Present", "All FN Absent", "All AN Absent".
- Real-time detection of session-skipping patterns (Present in FN, Absent in AN).
- Single-click CSV export and student longitudinal attendance audits.

### 2. AI-Augmented Anomaly Detection
- Real-time engine scanning morning lecture roll-calls vs afternoon laboratory logs.
- Detects session skips, sudden drops, and consecutive streak absences.
- Risk grading: **High**, **Medium**, and **Low** with confidence scores.
- Principal review flow with documented administrative audit trails.

### 3. Faculty Modification Workflow & Principal Digital Sign-Off
- Faculty cannot retroactively alter locked attendance or examination grades.
- Formal "Request Correction" workflow comparing original vs proposed target values.
- Automated **AI Safety Assessment** calculating risk indices and historic correlation before Principal review.
- Confirmation modals with instant reactive synchronization across teacher and parent views.

### 4. Cognitive Guardian Digest (Parent Portal)
- Synthesizes attendance ledgers and examination results into plain-language progress summaries.
- Highlights **Academic Strengths**, **Attendance Concerns**, and **Recommended Interventions**.
- 1-click **Regenerate Summary** with live timestamps.
- Automated real-time alerts for afternoon departures.

### 5. Interactive 3D Campus Heatmap
- Three.js WebGL visualization depicting academic blocks with color-coded attendance heatmaps.
- Interactive block inspection displaying real-time FN & AN percentages.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript |
| **Styling & Design System** | Tailwind CSS v4, Plus Jakarta Sans, JetBrains Mono |
| **Icons & Micro-Interactions** | Lucide React |
| **Data Visualization** | Recharts (Line charts, Bar charts, Area charts, Pie charts) |
| **3D Spatial Graphics** | Three.js WebGL Canvas |
| **State & Context** | React Context (AuthContext, ToastContext, ERPDataContext) |
| **Build & Tooling** | Vite 8, ES2022 |

---

## 📂 Folder Structure

```
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx                      # Root application entry
│   ├── App.tsx                       # Role-based App Router & Route Dispatcher
│   ├── index.css                     # Tailwind styling & typography
│   ├── types/
│   │   └── index.ts                  # Domain models (Student, Class, Anomaly, Request)
│   ├── data/
│   │   └── mockData.ts               # Indian collegiate student roster & ledgers
│   ├── services/                     # Decoupled API abstraction layers
│   │   ├── authService.ts            # Auth & role session handler
│   │   ├── attendanceService.ts      # FN/AN roll-call & rate computation
│   │   ├── academicService.ts        # Students, teachers, classes, grades
│   │   ├── requestService.ts         # Teacher modification requests & approval
│   │   ├── aiService.ts              # AI anomaly engine & parent summarizer
│   │   └── notificationService.ts    # Alert dispatcher & event subscriber
│   ├── context/
│   │   ├── AuthContext.tsx           # Multi-role authentication & demo switcher
│   │   ├── ToastContext.tsx          # Real-time toast notifications system
│   │   └── ERPDataContext.tsx        # Reactive global data bridge
│   ├── components/
│   │   ├── common/
│   │   │   ├── Sidebar.tsx           # Role-adaptive sidebar with badge counts
│   │   │   ├── TopNavbar.tsx         # 3-zone top bar with instant role toggler
│   │   │   ├── Breadcrumb.tsx        # Contextual breadcrumb navigation
│   │   │   ├── KPICard.tsx           # Metric cards with tabular numerals
│   │   │   ├── Badges.tsx            # Attendance, Risk, and Confidence badges
│   │   │   ├── Modal.tsx             # Accessible dialog
│   │   │   ├── ConfirmDialog.tsx     # Double-confirmation for approvals
│   │   │   ├── SearchBar.tsx         # Clearable search input
│   │   │   └── LoadingSkeleton.tsx   # Skeleton placeholders
│   │   ├── ai/
│   │   │   ├── AIInsightCard.tsx     # Prominent AI anomaly banner
│   │   │   ├── AnomalyAlert.tsx      # Anomaly detail card with review trigger
│   │   │   ├── AIProgressSummary.tsx # Parent cognitive narrative card
│   │   │   └── AIRecommendation.tsx  # Pedagogical recommendations
│   │   ├── visualization/
│   │   │   └── CampusAttendance3D.tsx# Three.js 3D campus block heatmap
│   │   └── layout/
│   │       └── DashboardLayout.tsx   # Persistent shell layout
│   └── pages/
│       ├── auth/
│       │   ├── LoginPage.tsx         # Direct 3-role portal login & validation
│       │   └── RegisterPage.tsx      # 3-role registration with confirmation
│       ├── principal/                # Principal command center (9 screens)
│       │   ├── PrincipalDashboard.tsx
│       │   ├── PrincipalAttendance.tsx
│       │   ├── PrincipalAnomalies.tsx
│       │   ├── PrincipalRequests.tsx
│       │   ├── PrincipalStudents.tsx
│       │   ├── PrincipalTeachers.tsx
│       │   ├── PrincipalParents.tsx
│       │   ├── PrincipalAnalytics.tsx
│       │   └── PrincipalSettings.tsx
│       ├── teacher/                  # Faculty workspace (6 screens)
│       │   ├── TeacherDashboard.tsx
│       │   ├── TeacherClasses.tsx
│       │   ├── TeacherAttendance.tsx # FN & AN roll-call matrix
│       │   ├── TeacherMarks.tsx      # Inline grades grading table
│       │   ├── TeacherRequests.tsx   # Appeal submission form
│       │   └── TeacherAnalytics.tsx
│       └── parent/                   # Guardian portal (6 screens)
│           ├── ParentDashboard.tsx
│           ├── ParentAttendance.tsx  # Monthly session calendar
│           ├── ParentMarks.tsx       # Report card transcript
│           ├── ParentProgress.tsx    # AI progress narrative
│           ├── ParentNotifications.tsx
│           └── ParentProfile.tsx
```

---

## 🚀 How to Install & Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Server will initialize at `http://localhost:3000`.

3. **Compile production build**:
   ```bash
   npm run build
   ```

---

## 👥 Demo Accounts (1-Click Instant Login)

The login screen provides one-click credentials for instant evaluator testing:

| Role | Name | Email | Default Password |
| :--- | :--- | :--- | :--- |
| **Principal** | Dr. Ramesh Sundaram | `principal@edunexus.edu` | `nexus@2026` |
| **Teacher** | Prof. Anitha Vasudevan | `anitha.v@edunexus.edu` | `teacher@2026` |
| **Parent** | Suresh Kumar | `suresh.kumar@gmail.com` | `parent@2026` |

*Note: You can also seamlessly switch roles anytime using the top navigation bar's fast role toggle.*

---

## 🔮 Future Backend & Database Integration

EduNexus frontend is specifically structured to plug into Supabase and Node.js/Express without refactoring the UI components:

```
[UI Components]
       │
       ▼
[Service Abstraction Layer (src/services/*)]
       │
       ├──► Supabase Client (Authentication, Row-Level Security, Database)
       ├──► Supabase Realtime (Instant Attendance & Anomaly broadcast)
       ├──► Express REST API (Validation & Complex Academic Rules)
       └──► AI Orchestrator (Gemini 2.5 Flash / Groq for Cognitive Summaries)
```

Environment variables to be configured upon backend rollout:
```env
# Supabase Connectivity
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# Backend API Service
VITE_API_BASE_URL=https://api.edunexus.edu

# AI API Key (Protected on server-side proxy)
GEMINI_API_KEY=your-gemini-key
```
