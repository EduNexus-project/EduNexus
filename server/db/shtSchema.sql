-- =========================================================================
-- SHT AI-ERP BETA — Supabase PostgreSQL Schema (Team 3)
-- Sakith Harvan Technologies
-- Team Lead: Sujith | Members: Sneha, Siddu, T. Vyshnavi
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Role-based users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE, -- References auth.users(id) if Supabase Auth is active
  name VARCHAR(128) NOT NULL,
  email VARCHAR(128) UNIQUE NOT NULL,
  role VARCHAR(32) NOT NULL CHECK (role IN ('principal', 'teacher', 'parent')),
  phone VARCHAR(32),
  department VARCHAR(64),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(32) UNIQUE NOT NULL, -- e.g. "CS-10A", "DS-10B"
  name VARCHAR(128) NOT NULL,
  department VARCHAR(64) NOT NULL,
  academic_year VARCHAR(32) NOT NULL DEFAULT '2026-2027',
  section VARCHAR(8) NOT NULL DEFAULT 'A',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Class Students
CREATE TABLE IF NOT EXISTS class_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id VARCHAR(32) UNIQUE NOT NULL, -- e.g. "STU-1032"
  student_name VARCHAR(128) NOT NULL,
  roll_no INTEGER NOT NULL,
  parent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  parent_name VARCHAR(128) NOT NULL,
  parent_phone VARCHAR(32) NOT NULL,
  parent_channel VARCHAR(16) DEFAULT 'WhatsApp' CHECK (parent_channel IN ('WhatsApp', 'SMS', 'Push')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  code VARCHAR(32) NOT NULL,
  name VARCHAR(128) NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  teacher_name VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Attendance (FN & AN Sessions with Duplicate Prevention)
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id VARCHAR(32) NOT NULL,
  student_name VARCHAR(128) NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_type VARCHAR(8) NOT NULL CHECK (session_type IN ('FN', 'AN')), -- Forenoon vs Afternoon
  status VARCHAR(32) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Excused')),
  remarks TEXT,
  recorded_by VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent duplicate records for the same student, date, and session!
  CONSTRAINT unique_student_session_attendance UNIQUE (student_id, session_date, session_type)
);

-- 6. Examinations
CREATE TABLE IF NOT EXISTS examinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(128) NOT NULL,
  exam_type VARCHAR(32) NOT NULL DEFAULT 'Midterm' CHECK (exam_type IN ('Unit Test', 'Midterm', 'Final', 'Project')),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  academic_year VARCHAR(32) NOT NULL DEFAULT '2026-2027',
  max_marks NUMERIC(5, 2) DEFAULT 100.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Marks
CREATE TABLE IF NOT EXISTS marks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  student_id VARCHAR(32) NOT NULL,
  student_name VARCHAR(128) NOT NULL,
  score NUMERIC(5, 2) NOT NULL,
  max_marks NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
  grade VARCHAR(4),
  remarks TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_exam_subject_mark UNIQUE (exam_id, subject_id, student_id)
);

-- 8. Correction Requests (Teacher submits, Principal approves/rejects)
CREATE TABLE IF NOT EXISTS correction_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_code VARCHAR(32) UNIQUE NOT NULL,
  teacher_id VARCHAR(64) NOT NULL,
  teacher_name VARCHAR(128) NOT NULL,
  record_type VARCHAR(32) NOT NULL CHECK (record_type IN ('mark', 'attendance')),
  target_id VARCHAR(64) NOT NULL, -- references mark id or attendance id
  student_id VARCHAR(32) NOT NULL,
  student_name VARCHAR(128) NOT NULL,
  course_or_date VARCHAR(64) NOT NULL,
  original_value VARCHAR(64) NOT NULL,
  proposed_value VARCHAR(64) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(32) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  risk_score INTEGER DEFAULT 25,
  risk_category VARCHAR(16) DEFAULT 'Low' CHECK (risk_category IN ('Low', 'Medium', 'High')),
  ai_explanation TEXT,
  supporting_factors JSONB DEFAULT '[]'::jsonb,
  suggested_action VARCHAR(64),
  reviewed_by VARCHAR(128),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Anomaly Alerts (AI Truancy Engine: FN Present + AN Absent)
CREATE TABLE IF NOT EXISTS anomaly_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type VARCHAR(64) DEFAULT 'TRUANCY_FN_AN_MISMATCH',
  student_id VARCHAR(32) NOT NULL,
  student_name VARCHAR(128) NOT NULL,
  class_name VARCHAR(64) NOT NULL,
  alert_date DATE NOT NULL DEFAULT CURRENT_DATE,
  fn_status VARCHAR(16) NOT NULL DEFAULT 'Present',
  an_status VARCHAR(16) NOT NULL DEFAULT 'Absent',
  severity VARCHAR(16) DEFAULT 'HIGH' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status VARCHAR(32) DEFAULT 'Active' CHECK (status IN ('Active', 'Under Review', 'Resolved')),
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_date_truancy UNIQUE (student_id, alert_date, alert_type)
);

-- 10. Notifications (Parent Mobile Channels)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_type VARCHAR(32) NOT NULL CHECK (recipient_type IN ('parent', 'principal', 'teacher')),
  recipient_id VARCHAR(64) NOT NULL,
  recipient_phone VARCHAR(32) NOT NULL,
  channel VARCHAR(16) NOT NULL CHECK (channel IN ('WhatsApp', 'SMS', 'Push')),
  title VARCHAR(128) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(32) DEFAULT 'Delivered' CHECK (status IN ('Delivered', 'Pending', 'Failed')),
  latency_ms INTEGER DEFAULT 35,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_name VARCHAR(128) NOT NULL,
  actor_role VARCHAR(32) NOT NULL,
  action VARCHAR(64) NOT NULL,
  target_type VARCHAR(64) NOT NULL,
  target_id VARCHAR(64),
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Setup
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE correction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Permissive public read & authenticated modify policies for demo / service roles
CREATE POLICY "Allow read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow read classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Allow read class_students" ON class_students FOR SELECT USING (true);
CREATE POLICY "Allow read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Allow read attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "Allow insert attendance" ON attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read marks" ON marks FOR SELECT USING (true);
CREATE POLICY "Allow read correction_requests" ON correction_requests FOR SELECT USING (true);
CREATE POLICY "Allow insert correction_requests" ON correction_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update correction_requests" ON correction_requests FOR UPDATE USING (true);
CREATE POLICY "Allow read anomaly_alerts" ON anomaly_alerts FOR SELECT USING (true);
CREATE POLICY "Allow read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow read audit_logs" ON audit_logs FOR SELECT USING (true);
