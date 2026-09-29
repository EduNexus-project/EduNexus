ALTER TABLE students ADD COLUMN IF NOT EXISTS student_code VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS section VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_email VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_relationship VARCHAR(20);
ALTER TABLE parents ADD COLUMN IF NOT EXISTS relationship VARCHAR(20);
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_student_code ON students(student_code) WHERE student_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_students_parent_email ON students(parent_email);