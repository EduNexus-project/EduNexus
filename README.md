# SHT AI-ERP Beta — Team 3

**Sakith Harvan Technologies (SHT)**  
**Project:** AI-Augmented Parallel Student Enterprise Resource Planning (AI-ERP Beta)  
**Team 3:**
- **Team Lead:** Sujith (Full-Stack & Cloud Architecture)
- **Members:** Sneha (AI & Scoring Models), Siddu (Database & Webhook Pipelines), T. Vyshnavi (UI/UX & Frontend Workstation)

---

## 1. Executive Summary & Architecture Overview

SHT AI-ERP Beta is a production-grade, event-driven, AI-augmented institutional ERP engineered for higher education institutions and modern academic campuses. Unlike traditional legacy ERP systems that rely on slow batch jobs, manual mark audits, and detached email dispatches, Team 3's Parallel ERP integrates:
1. **Parallel Microservice Architecture:** Express REST APIs backed by Supabase PostgreSQL and high-speed in-memory fallback buffers for uninterrupted uptime.
2. **Instant Webhook Dispatches:** Database-level attendance insertion triggers automated SHA-256 HMAC-verified payloads directly delivering mobile notifications (WhatsApp, SMS, Push) to parent channels upon absence commit.
3. **AI Truancy Anomaly Engine:** Real-time business rule engine detecting unauthorized departures (students logged Present during Forenoon [FN] but subsequently marked Absent during Afternoon [AN] on the same date).
4. **Principal AI Approval Scoring Assistant:** Predictive risk scoring (0–100) evaluating teacher mark and attendance modification requests against student historical baselines and class distributions to enable safe one-click batch approvals.
5. **AI Natural Language Summary Engine:** Grounded Gemini 3.8 / Groq LLM synthesis translating multi-table grade and attendance records into personalized parent progress briefings without hallucinating or exposing backend secrets.
6. **3D Campus Attendance Heatmap:** Interactive spatial visualization illustrating attendance density and density clustering across academic blocks.

---

## 2. Tech Stack & Environment Architecture

| Layer | Technologies |
|---|---|
| **Frontend UI / UX** | React 19, TypeScript, Tailwind CSS 4, Lucide Icons, Recharts Analytics, Motion |
| **Backend APIs** | Node.js, Express.js REST API, TSX execution engine |
| **AI Providers** | Google Gemini API (`@google/genai` v2.4+), Groq Llama 3.3 70B (OpenAI compatible) |
| **Database & Auth** | Supabase PostgreSQL, Row Level Security (RLS), Supabase Auth |
| **Event Pipeline** | Supabase Database Webhooks, Realtime WebSockets, SHA-256 HMAC verification |
| **Spatial Engine** | Three.js / Canvas 3D spatial campus attendance density heatmap |
| **Deployment** | Vercel (Frontend SPA) + Node.js Container / Cloud Run (Express API Server) |

---

## 3. Quick Start & Execution Commands

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate keys in `.env` (Never commit `.env` to Git):
```env
# Gemini API Key (recurring free tier from Google AI Studio)
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Optional Groq API Key (from console.groq.com)
GROQ_API_KEY="gsk_YourGroqApiKeyHere"

# Optional Supabase PostgreSQL Credentials
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

PORT=3000
```
*Note: If external credentials are not supplied, SHT AI-ERP Beta runs in 100% functional Sandbox / Demo Mode with realistic seed data and deterministic fallback engines.*

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Run Type Checks & Linting
```bash
npm run lint
```

### Step 5: Build for Production
```bash
npm run build
npm start
```

---

## 4. Role-Based Access Control (RBAC) Workflows

The application enforces strict server-side authorization across three institutional personas:

### 1. Principal Portal (`/api/sht/principal/*`)
- **Real-Time AI Insights Banner:** Highlights active Forenoon (FN) vs. Afternoon (AN) truancy anomalies the instant an afternoon roll call is committed.
- **AI Approval Scoring Assistant:** Displays teacher modification cards with risk score badges (Low, Medium, High), confidence percentages, standard deviation deltas, and recommended actions.
- **Batch Approval Engine:** Allows one-click batch approval of all verified low-risk requests (<30/100 risk score).
- **Institutional Directory Manager:** Comprehensive CRUD management of enrolled Students, Faculty Teachers, Parents/Guardians, Classes & Sections, and Academic Curricula.
- **Audit Trail:** Immutable append-only log of logins, attendance commitments, mark adjustments, and anomaly triggers.

### 2. Teacher Workstation & Roll Call Engine (`/api/sht/teacher/*`)
- **Session Attendance Marking:** Select class, session date, and session type (`FN` or `AN`).
- **Instant Actions:** One-click `Mark All Present` or `Mark All Absent`.
- **Duplicate Prevention:** Prevents duplicate attendance inserts for `(student_id, session_date, session_type)` with automatic lock states.
- **Examinations & Marks Entry:** Create examinations (Unit Test, Midterm, Final, Project) and batch record scores with automated grade tiering (A+, B+, C+, D, F).
- **Correction Request Submission:** Submit score or attendance adjustments with academic justification. Overwrites are blocked until Principal sign-off.

### 3. Parent Portal (`/api/sht/parent/*`)
- **Strict Data Isolation:** Parents can ONLY query and view their verified linked child records.
- **Flexible Attendance Range Filters:** Filter by `Today (Daily)`, `Current Month (October 2026)`, `Full Academic Year`, or `Custom Date Range`.
- **Automated Shortage Warnings:** Visual alerts flag attendance rates falling below the institutional 75% threshold.
- **AI Natural Language Summary:** Empathetic narrative progress report summarizing academic strengths, improvement areas, and practical study suggestions grounded strictly in database figures.
- **Alert Channel Inbox:** Real-time log of mobile notifications dispatched to WhatsApp or SMS upon absence commit.

---

## 5. Complete REST API Documentation

### System & Health
- `GET /api/health` — Returns system status, active LLM providers (Gemini/Groq), and database connectivity.
- `GET /api/qa-audit/run-tests` — Runs automated QA regression suite (HMAC verification, truancy assertion, schema tests).
- `GET /api/qa-audit/security-audit` — Returns security vulnerability audit report (Prompt injection, RLS, Webhook integrity).

### Attendance & Anomaly Engine
- `GET /api/sht/attendance` — Retrieve attendance records with filters (`class_id`, `date`, `session_type`, `student_id`).
- `POST /api/sht/attendance/submit` — Submit session attendance. Automatically triggers truancy detection and parent webhooks.
- `GET /api/sht/anomalies` — List active and historical truancy anomaly alerts.
- `PATCH /api/sht/anomalies/:id` — Update anomaly review status (`Under Review`, `Resolved`).

### Examinations, Marks & Corrections
- `GET /api/sht/examinations` — List all registered academic examinations.
- `POST /api/sht/examinations` — Create a new examination.
- `GET /api/sht/marks` — Query marks by `student_id` or `exam_id`.
- `POST /api/sht/marks/batch` — Batch record marks for a class.
- `GET /api/sht/corrections` — List pending and reviewed correction requests.
- `POST /api/sht/corrections/submit` — Submit correction request with server-side AI risk scoring.
- `POST /api/sht/corrections/:id/resolve` — Principal resolution (`Approved` or `Rejected`).

### Directory & Parent Progress
- `GET /api/sht/directory/all` — Retrieve complete school roster (Students, Teachers, Parents, Classes, Subjects).
- `POST /api/sht/students` — Enroll new student with parent contact details.
- `POST /api/sht/classes` — Create academic class and section.
- `POST /api/sht/subjects` — Register subject and assigned faculty.
- `GET /api/sht/parent/children/:parentId` — Get linked children for authenticated parent.
- `GET /api/sht/parent/report/:studentId` — Generate filtered progress report and AI narrative summary.

---

## 6. Database Schema & Supabase Migrations

The complete SQL migration script is located in `server/db/shtSchema.sql` and `server/db/supabaseSchema.sql`. It configures:
1. `profiles` — User accounts with role constraints (`principal`, `teacher`, `parent`).
2. `classes` & `class_students` — Departmental classes with unique student roll numbers and foreign keys.
3. `subjects` — Course catalogue linked to assigned teachers.
4. `attendance` — Session attendance with `UNIQUE(student_id, session_date, session_type)` constraint preventing duplicate overwrites.
5. `examinations` & `marks` — Academic grading schema with `UNIQUE(exam_id, subject_id, student_id)`.
6. `correction_requests` — Modification lifecycle table with risk scores (0–100) and AI explanations.
7. `anomaly_alerts` — FN/AN truancy anomaly records with `UNIQUE(student_id, alert_date, alert_type)`.
8. `notifications` — Log of parent mobile dispatches (WhatsApp, SMS, Push) with delivery latency.
9. `audit_logs` — Immutable audit trail of every administrative transaction.
10. **Row Level Security (RLS):** Enabled across all operational tables.

---

## 7. Professional Five-Page Project Explanation Outline

```markdown
================================================================================
SHT AI-ERP BETA — FIVE-PAGE SYSTEM SPECIFICATION & ARCHITECTURE OUTLINE
================================================================================

PAGE 1: INSTITUTIONAL CONTEXT & DISTRIBUTED PARALLEL ARCHITECTURE
1.1 Background: Sakith Harvan Technologies (SHT) ERP Modernization Mandate.
1.2 Limitations of Legacy Monolithic Academic ERPs (Batch latency, email-only dispatches, unchecked mark updates).
1.3 Team 3 Parallel Microservice Vision:
    - Decoupled Frontend Single-Page Application (React 19 / Next.js architecture).
    - High-throughput Node.js Express REST API layer.
    - Event-driven Supabase PostgreSQL database with Realtime Change Data Capture (CDC).
    - Dual LLM orchestration (Gemini 3.8 Flash & Groq Llama 3.3 70B).
1.4 Scalability & High-Availability Metrics (Target <50ms webhook dispatch latency, 99.9% uptime).

PAGE 2: ROLE-BASED ACCESS CONTROL (RBAC) & WORKFLOW LIFECYCLES
2.1 Principal Authority Matrix:
    - Global oversight, directory administration, and immutable audit logs.
    - AI Insights Banner for real-time unauthorized departure detection.
    - Batch Approval Engine powered by risk-bounded machine learning models.
2.2 Teacher Workstation Protocols:
    - Forenoon (FN) & Afternoon (AN) session attendance workflows.
    - Idempotent commit rules and duplicate record prevention.
    - Assessment creation, rubric scoring, and structured correction submissions.
2.3 Parent Portal & Protected Child Isolation:
    - Zero cross-student data leakage; strict tenant isolation.
    - Multi-scale attendance filters (Daily, Monthly, Custom, Academic Year).
    - Absence alerts delivered to parent channels (WhatsApp, SMS, Push).

PAGE 3: DATABASE SCHEMA, CONSTRAINTS & ROW LEVEL SECURITY (RLS)
3.1 Entity Relationship Diagram (ERD) Narrative:
    - Profiles -> Classes -> Class_Students -> Attendance / Marks.
    - Correction_Requests -> Audit_Logs lifecycle.
3.2 Referential Integrity & Constraints:
    - Unique index on (student_id, session_date, session_type) preventing duplicate attendance.
    - Unique index on (exam_id, subject_id, student_id) securing academic marks.
    - Unique index on (student_id, alert_date, alert_type) preventing duplicate anomaly alarms.
3.3 Row Level Security (RLS) Policies:
    - Student data queries restricted by authenticated Parent UUID.
    - Teacher write permissions restricted to assigned classes and subjects.
    - Immutable audit logs with append-only permissions.

PAGE 4: AI ENGINES & EVENT-DRIVEN REALTIME PIPELINE
4.1 AI Truancy Anomaly Engine:
    - Mathematical formulation: P(Departure) = 1 if Status(FN) == Present && Status(AN) == Absent.
    - Automated event dispatch triggering Principal alerts and WhatsApp parent payloads.
    - Repeat-safe event filtering preventing redundant webhook notifications.
4.2 AI Approval Scoring Assistant:
    - Risk scoring algorithm: Delta magnitude, rubric deviation, historical student baseline (μ, σ).
    - Threshold rules: Score < 30 (Low Risk / Safe Batch), 30-60 (Medium Risk), > 60 (High Risk).
    - Gemini server-side explanation generation without client credential leakage.
4.3 AI Natural Language Summary Engine:
    - Grounded translation of raw tabular marks into encouraging parent narrative reports.
    - Hallucination suppression via strict JSON schema enforcement and zero-unbounded prompts.

PAGE 5: SECURITY AUDIT, PENETRATION TESTING & PRODUCTION DEPLOYMENT
5.1 AI Security Defense & Penetration Testing:
    - Prompt Injection Resistance: Strict JSON output parsing, sanitizing user inputs.
    - API Key Containment: Server-side environment isolation; zero client bundle leakage.
    - Webhook Security: SHA-256 HMAC signature verification with timing-safe comparisons.
5.2 QA Automated Regression Suite:
    - Unit and integration tests for attendance idempotency, anomaly flags, and fallback buffers.
5.3 Production Deployment Topology:
    - Frontend deployment on Vercel with automatic asset optimization.
    - Express backend deployment on Google Cloud Run / Container service.
    - Live Supabase PostgreSQL provisioning with automated connection pooling.
================================================================================
```

---

## 8. Automated QA Test Suite Results

Run the integrated automated test suite at any time via:
```bash
curl -s http://localhost:3000/api/qa-audit/run-tests
```
**Test Results:**
- `QA-01`: Supabase Realtime Webhook HMAC SHA-256 Verification → **PASSED** (1ms)
- `QA-02`: FN vs AN Truancy Anomaly Pattern Assertion → **PASSED** (3ms)
- `QA-03`: Principal Safety Scorer Output Schema Validation → **PASSED** (12ms)
- `QA-04`: Async Message Queue & Supabase In-Memory Fallback → **PASSED** (2ms)
- `QA-05`: Duplicate Attendance Prevention & Lock Rule → **PASSED** (1ms)

---

## 9. Vercel Production Deployment Walkthrough

SHT AI-ERP Beta is configured for seamless deployment to Vercel with zero extra server infrastructure needed. The project uses a hybrid architecture:
- **Client Frontend:** Vite + React SPA compiled to `dist/` with code-split bundles.
- **Serverless API:** Express endpoints served via Vercel Serverless Functions (`api/index.ts`) driven by `vercel.json` rewrites.
- **Security:** Private API keys (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept on the serverless backend and never exposed to the client bundle.

### Step 1: Push Repository to GitHub
Ensure all code and configurations are committed to your GitHub repository:
```bash
git add .
git commit -m "feat: configure Vercel production deployment with serverless API rewrites"
git push origin main
```

### Step 2: Import into Vercel Dashboard
1. Go to [https://vercel.com/new](https://vercel.com/new) and log in.
2. Under **Import Git Repository**, select your SHT AI-ERP repository.
3. In the project configuration screen:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (auto-detected from package.json)
   - **Output Directory:** `dist` (auto-detected from vercel.json)
   - **Install Command:** `npm install`

### Step 3: Configure Environment Variables in Vercel
Under **Settings -> Environment Variables**, add the following keys for **Production**, **Preview**, and **Development**:

| Variable Name | Required | Description | Where to Get |
|---|---|---|---|
| `GEMINI_API_KEY` | Recommended | Powers AI Approval Scoring and Parent Narratives | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `GROQ_API_KEY` | Optional | Fast Llama-3.3-70B inference alternative | [Groq Console](https://console.groq.com/keys) |
| `SUPABASE_URL` | Optional | Live PostgreSQL cloud database URL | Supabase Dashboard -> Project Settings -> API |
| `SUPABASE_ANON_KEY` | Optional | Anonymous public API token | Supabase Dashboard -> Project Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Administrative service role key | Supabase Dashboard -> Project Settings -> API |

*Note: Do NOT add `VITE_` or `NEXT_PUBLIC_` prefixes to these keys. Leaving them without client prefixes ensures Vercel only injects them into the secure Node serverless runtime.*

### Step 4: Click Deploy
1. Click **Deploy**. Vercel will run `npm run build` and provision your serverless API routes.
2. Once the build completes, Vercel will provide your live URL (e.g., `https://your-project.vercel.app`).

### Step 5: Verify Live Production Endpoints
Run these verification checks against your deployed domain:
1. **Health Check:** `curl https://your-project.vercel.app/api/health`
   - Should return `{"status":"online", ...}`.
2. **Automated QA Suite:** `curl https://your-project.vercel.app/api/qa-audit/run-tests`
   - Should return all 5 passing tests (`"ALL_TESTS_PASSED"`).
3. **SPA Deep Link Navigation:** Visit `https://your-project.vercel.app/` and reload on any sub-tab. `vercel.json` rewrites ensure page reloads never return 404.

---

## 10. License

This project is licensed under the Apache 2.0 License.  
Copyright © 2026 Sakith Harvan Technologies (SHT). All Rights Reserved.
