# EduNexus Backend Implementation Plan

## 1. Existing Frontend Architecture
Based on the repository's `README.md`, the frontend is built with:
- **Framework:** React 19, TypeScript, Vite 8
- **Styling:** Tailwind CSS v4, Plus Jakarta Sans, JetBrains Mono
- **State Management:** React Context (`AuthContext`, `ToastContext`, `ERPDataContext`)
- **Visuals:** Recharts for data visualization, Three.js for 3D spatial graphics.
- **Service Abstraction:** The `src/services/` directory decouples API logic (`authService`, `attendanceService`, `academicService`, `requestService`, `aiService`, `notificationService`).

*(Note: The actual `src/` directory appears to be missing in the Git repository due to a web upload issue, but the architecture is documented in the README.)*

## 2. Backend Requirements
- **Runtime:** Node.js with Express.js (TypeScript)
- **Database:** Supabase PostgreSQL
- **Role-based Authentication:** Principal, Teacher, Parent. 
- **Security:** JWT-based/Supabase auth, role-based route protection, CORS, input validation, and environment variables.
- **Core Features:** Attendance tracking (FN/AN), exam marks, anomaly detection, approval workflows (corrections), notifications, audit logs, and AI progress summaries.

## 3. Database Entities & Relationships
### Entities
1. **users**: Base table for all users.
2. **students**: Student details.
3. **teachers**: Teacher details.
4. **parents**: Parent details.
5. **classes**: Academic classes/sections.
6. **subjects**: Subjects taught in classes.
7. **student_parents**: Mapping table between students and parents.
8. **teacher_classes**: Mapping table for teachers and their assigned classes/subjects.
9. **attendance**: FN/AN attendance records.
10. **attendance_correction_requests**: Approval workflow for attendance modifications.
11. **exams**: Exam definitions.
12. **marks**: Student exam scores.
13. **notifications**: System alerts.
14. **anomaly_records**: Detected anomalies (e.g., afternoon departures).
15. **audit_logs**: Audit trail for system actions.

### Relationships
- `users` 1:1 `students` / `teachers` / `parents` (or role column mapping to specific profiles).
- `students` M:N `parents` (via `student_parents`).
- `teachers` M:N `classes` (via `teacher_classes`).
- `classes` 1:N `students`.
- `students` 1:N `attendance`.
- `attendance` 1:N `attendance_correction_requests` (Teacher -> Principal approval).
- `students` 1:N `marks`.
- `exams` 1:N `marks`.

## 4. REST API Endpoints

### Auth (`/api/auth`)
- `POST /login`
- `GET /me` (Verify session & role)
- `POST /logout`

### Academic (`/api/classes`, `/api/subjects`, `/api/students`, `/api/teachers`, `/api/parents`)
- `GET /classes`
- `GET /classes/:id/students`
- `GET /students/:id`
- `GET /teachers/:id/classes`

### Attendance (`/api/attendance`)
- `GET /` (Query by class/date)
- `POST /` (Submit FN/AN roll-call)
- `GET /stats` (Student-level statistics)

### Corrections (`/api/attendance/corrections`)
- `POST /` (Teacher submits request)
- `GET /` (Principal views requests)
- `PUT /:id/approve` (Principal approves)
- `PUT /:id/reject` (Principal rejects)

### Exams & Marks (`/api/exams`, `/api/marks`)
- `GET /exams`
- `GET /marks` (Query by student/exam)
- `POST /marks` (Submit grades)

### AI & Anomalies (`/api/anomalies`, `/api/ai`)
- `GET /anomalies`
- `GET /ai/progress-summary/:studentId` (Cognitive narrative)

### Notifications & Audit (`/api/notifications`, `/api/audit`)
- `GET /notifications`
- `GET /audit`

## 5. Authentication and Authorization Design
- **Auth Provider:** Supabase Auth (or JWT if implemented natively in backend).
- **Middleware:** 
  - `authMiddleware.ts`: Verifies Bearer token.
  - `roleMiddleware.ts`: Checks `req.user.role` against allowed roles (e.g., `roleMiddleware(['PRINCIPAL'])`).
- **Data Access:** Enforce row-level logic (e.g., teachers can only see their classes, parents only their children).

## 6. Frontend-to-Backend Integration Points
- Replace dummy data in `src/data/mockData.ts` with API calls.
- Update `src/services/*.ts` to fetch from `VITE_API_BASE_URL`.
- Maintain existing React Contexts (`AuthContext`, `ERPDataContext`) but map them to the new asynchronous API services.

## 7. Environment Variables
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_API_KEY=
```

## 8. Development & Deployment Plan
1. **Setup Backend Scaffold:** Initialize Express app, install dependencies, set up TypeScript.
2. **Database Initialization:** Write `backend/supabase/schema.sql` and apply it to Supabase.
3. **Core API Implementation:** Implement auth, attendance, and academic routes.
4. **Workflow APIs:** Implement attendance correction requests and AI proxy endpoints.
5. **Frontend Integration:** Hook up frontend services to Express API.
6. **Testing & QA:** Verify all role permissions and edge cases (especially approval workflows).
