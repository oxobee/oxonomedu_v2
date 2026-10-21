-- ============================================================================
-- OXONOM EDU / MEB PRODUCTION SUPABASE SCHEMA & SEED DATA
-- Fully normalized PostgreSQL schema with RLS, triggers, and authentic seed records.
-- School: Necla Görer İlkokulu (32 Branches: 1/A - 8/D)
-- Principal: Dr. Uğur UĞURLU | Teacher: Özlem ZOR | Student: Erçil UĞURLU (1/A)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES (Extends Supabase auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('principal', 'teacher', 'student', 'parent')),
  full_name TEXT NOT NULL,
  phone TEXT,
  tc_no TEXT,
  school_id UUID,
  school_name TEXT NOT NULL DEFAULT 'Necla Görer İlkokulu',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. SCHOOLS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Necla Görer İlkokulu',
  code TEXT UNIQUE NOT NULL DEFAULT 'NECLA-GORER-01',
  city TEXT NOT NULL DEFAULT 'İstanbul',
  district TEXT NOT NULL DEFAULT 'Kadıköy',
  principal_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  total_classes INT NOT NULL DEFAULT 32,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign key link back to profiles
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS fk_profiles_school,
  ADD CONSTRAINT fk_profiles_school FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 3. CLASSES (Dynamic Classrooms & Branches)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,          -- e.g. '1/A', '9/B', 'Anasınıfı-A'
  grade INT NOT NULL,          -- 0 (kindergarten), 1-12 (elementary, middle, high)
  branch TEXT NOT NULL,        -- Any branch letter or name (A, B, C, D, E, etc.)
  advisor_teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_count INT NOT NULL DEFAULT 0,
  classroom TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, name)
);

-- ----------------------------------------------------------------------------
-- 4. TEACHERS (Faculty & Branch Allocation)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  branch TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  assigned_classes TEXT[] NOT NULL DEFAULT '{"1/A"}',
  weekly_hours INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. STUDENTS (Pupil Records)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  student_number TEXT NOT NULL,
  class_name TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  parent_name TEXT,
  parent_phone TEXT,
  attendance_status TEXT NOT NULL DEFAULT 'present' CHECK (attendance_status IN ('present', 'absent', 'late', 'excused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (class_name, student_number)
);

-- ----------------------------------------------------------------------------
-- 6. COURSES (Curriculum Modules)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  grade INT NOT NULL,
  curriculum_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. COURSE PROGRESS (Weekly topic selection & coverage tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  current_topic TEXT NOT NULL,
  completed_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, class_name)
);

-- ----------------------------------------------------------------------------
-- 8. SCHEDULES (Weekly Timetable)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1: Mon, 7: Sun
  period INT NOT NULL,
  subject TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  classroom TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. ANNOUNCEMENTS (MEB SMS & In-App Broadcasts)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_audience TEXT[] NOT NULL DEFAULT '{"all"}', -- 'all', 'students', 'teachers', 'parents'
  target_classes TEXT[] NOT NULL DEFAULT '{"all"}',
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  is_sms_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. ASSIGNMENTS & HOMEWORK
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  teacher_name TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. ASSIGNMENT SUBMISSIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
  grade INT CHECK (grade BETWEEN 0 AND 100),
  feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assignment_id, student_id)
);

-- ----------------------------------------------------------------------------
-- 12. EXAMS & AUTOMATIC TESTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exams_and_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 13. STUDENT TEST RESULTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  correct_count INT NOT NULL DEFAULT 0,
  wrong_count INT NOT NULL DEFAULT 0,
  empty_count INT NOT NULL DEFAULT 0,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  details JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 14. SAVED SMART BOARD NOTES (Akıllı Tahta Notları)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.board_notes (
  id TEXT PRIMARY KEY,
  board_info TEXT NOT NULL,
  class_codes TEXT[] NOT NULL DEFAULT '{"1/A"}',
  course_name TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  student_notes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 15. PANO PAIRING SESSIONS (QR / OTP Akıllı Tahta Kumanda Oturumları)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pano_pairing_sessions (
  id TEXT PRIMARY KEY,
  otp_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  teacher_data JSONB DEFAULT '{}'::jsonb,
  selected_class_id INT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 16. DAILY ATTENDANCE (Canlı Yoklama)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  records JSONB NOT NULL DEFAULT '{}'::jsonb,
  present_count INT NOT NULL DEFAULT 0,
  absent_count INT NOT NULL DEFAULT 0,
  late_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (class_name, date)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams_and_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pano_pairing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;

-- Read policies (Allow authenticated users and anon read for demo)
CREATE POLICY "Public read for profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read for schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Public read for classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Public read for teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Public read for students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public read for courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public read for course_progress" ON public.course_progress FOR SELECT USING (true);
CREATE POLICY "Public read for schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Public read for announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public read for assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Public read for submissions" ON public.assignment_submissions FOR SELECT USING (true);
CREATE POLICY "Public read for tests" ON public.exams_and_tests FOR SELECT USING (true);
CREATE POLICY "Public read for test_results" ON public.student_test_results FOR SELECT USING (true);
CREATE POLICY "Public read for board_notes" ON public.board_notes FOR SELECT USING (true);
CREATE POLICY "Public all for board_notes" ON public.board_notes FOR ALL USING (true);
CREATE POLICY "Public all for pano_pairing" ON public.pano_pairing_sessions FOR ALL USING (true);
CREATE POLICY "Public all for daily_attendance" ON public.daily_attendance FOR ALL USING (true);

-- Insert / Update / Delete policies for full dynamic management
CREATE POLICY "Manage classes" ON public.classes FOR ALL USING (true);
CREATE POLICY "Manage schools" ON public.schools FOR ALL USING (true);
CREATE POLICY "Manage teachers" ON public.teachers FOR ALL USING (true);
CREATE POLICY "Manage students" ON public.students FOR ALL USING (true);
CREATE POLICY "Manage profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Auth users insert profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Auth users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Staff insert announcements" ON public.announcements FOR ALL USING (true);
CREATE POLICY "Staff manage assignments" ON public.assignments FOR ALL USING (true);
CREATE POLICY "Students manage submissions" ON public.assignment_submissions FOR ALL USING (true);
CREATE POLICY "Teachers manage progress" ON public.course_progress FOR ALL USING (true);
CREATE POLICY "Test results insert" ON public.student_test_results FOR ALL USING (true);

-- ============================================================================
-- AUTH TRIGGER: AUTO-CREATE PROFILE ON SUPABASE AUTH SIGNUP
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    role,
    full_name,
    school_name
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'school_name', 'Necla Görer İlkokulu')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SEED DATA (Authentic Necla Görer İlkokulu Structure)
-- ============================================================================
DO $$
DECLARE
  v_school_id UUID;
BEGIN
  -- 1. Insert School
  INSERT INTO public.schools (name, code, city, district, total_classes)
  VALUES ('Necla Görer İlkokulu', 'NECLA-GORER-01', 'İstanbul', 'Kadıköy', 32)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_school_id;

  -- 2. Insert 32 Branches (1/A - 8/D)
  INSERT INTO public.classes (school_id, name, grade, branch, student_count, classroom)
  VALUES
    (v_school_id, '1/A', 1, 'A', 28, 'Zemin Kat - Derslik 101'),
    (v_school_id, '1/B', 1, 'B', 27, 'Zemin Kat - Derslik 102'),
    (v_school_id, '1/C', 1, 'C', 28, 'Zemin Kat - Derslik 103'),
    (v_school_id, '1/D', 1, 'D', 26, 'Zemin Kat - Derslik 104'),
    (v_school_id, '2/A', 2, 'A', 29, '1. Kat - Derslik 201'),
    (v_school_id, '2/B', 2, 'B', 30, '1. Kat - Derslik 202'),
    (v_school_id, '2/C', 2, 'C', 28, '1. Kat - Derslik 203'),
    (v_school_id, '2/D', 2, 'D', 27, '1. Kat - Derslik 204'),
    (v_school_id, '3/A', 3, 'A', 31, '1. Kat - Derslik 205'),
    (v_school_id, '3/B', 3, 'B', 30, '1. Kat - Derslik 206'),
    (v_school_id, '3/C', 3, 'C', 29, '1. Kat - Derslik 207'),
    (v_school_id, '3/D', 3, 'D', 28, '1. Kat - Derslik 208'),
    (v_school_id, '4/A', 4, 'A', 32, '2. Kat - Derslik 301'),
    (v_school_id, '4/B', 4, 'B', 31, '2. Kat - Derslik 302'),
    (v_school_id, '4/C', 4, 'C', 30, '2. Kat - Derslik 303'),
    (v_school_id, '4/D', 4, 'D', 29, '2. Kat - Derslik 304'),
    (v_school_id, '5/A', 5, 'A', 30, '2. Kat - Derslik 305'),
    (v_school_id, '5/B', 5, 'B', 29, '2. Kat - Derslik 306'),
    (v_school_id, '5/C', 5, 'C', 28, '2. Kat - Derslik 307'),
    (v_school_id, '5/D', 5, 'D', 28, '2. Kat - Derslik 308'),
    (v_school_id, '6/A', 6, 'A', 31, '3. Kat - Derslik 401'),
    (v_school_id, '6/B', 6, 'B', 30, '3. Kat - Derslik 402'),
    (v_school_id, '6/C', 6, 'C', 29, '3. Kat - Derslik 403'),
    (v_school_id, '6/D', 6, 'D', 29, '3. Kat - Derslik 404'),
    (v_school_id, '7/A', 7, 'A', 32, '3. Kat - Derslik 405'),
    (v_school_id, '7/B', 7, 'B', 31, '3. Kat - Derslik 406'),
    (v_school_id, '7/C', 7, 'C', 30, '3. Kat - Derslik 407'),
    (v_school_id, '7/D', 7, 'D', 29, '3. Kat - Derslik 408'),
    (v_school_id, '8/A', 8, 'A', 30, '4. Kat - Derslik 501'),
    (v_school_id, '8/B', 8, 'B', 29, '4. Kat - Derslik 502'),
    (v_school_id, '8/C', 8, 'C', 28, '4. Kat - Derslik 503'),
    (v_school_id, '8/D', 8, 'D', 28, '4. Kat - Derslik 504')
  ON CONFLICT (school_id, name) DO NOTHING;

  -- 3. Insert Faculty
  INSERT INTO public.teachers (full_name, branch, email, assigned_classes)
  VALUES ('Özlem ZOR', 'Sınıf Öğretmeni', 'ozlem.zor@oxonom.edu.tr', '{"1/A"}')
  ON CONFLICT DO NOTHING;

  -- 4. Insert Student (Erçil Uğurlu)
  INSERT INTO public.students (full_name, student_number, class_name, parent_name, parent_phone)
  VALUES ('Erçil UĞURLU', '101', '1/A', 'Uğur Uğurlu', '+90 555 123 4567')
  ON CONFLICT (class_name, student_number) DO NOTHING;

  -- 5. Insert Sample Announcements
  INSERT INTO public.announcements (school_id, title, content, priority, target_audience, sender_name, sender_role)
  VALUES
    (v_school_id, '2026-2027 Eğitim Öğretim Yılı 1. Dönem Bilgilendirmesi', 'Sayın velilerimiz ve değerli öğretmenlerimiz, yeni eğitim öğretim dönemi ders programları sisteme tanımlanmıştır.', 'normal', '{"all"}', 'Dr. Uğur UĞURLU', 'Okul Müdürü'),
    (v_school_id, '1. Sınıflar Okuma Bayramı ve Etkinlik Planı', '1/A şubesi öğrencilerimizin ilk okuma-yazma kazanım değerlendirmesi cuma günü gerçekleştirilecektir.', 'high', '{"students", "teachers"}', 'Özlem ZOR', 'Sınıf Öğretmeni')
  ON CONFLICT DO NOTHING;
END $$;
