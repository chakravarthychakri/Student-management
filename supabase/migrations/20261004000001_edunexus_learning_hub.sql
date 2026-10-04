-- ============================================================================
-- EduNexus: Student Learning Hub Migration
-- Seamlessly integrates with existing EduTrack database, profiles, subjects, and enrollments
-- ============================================================================

-- 1. LEARNING NOTES
CREATE TABLE IF NOT EXISTS public.learning_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    unit TEXT NOT NULL DEFAULT 'Unit 1',
    topic TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'rich_text', -- 'rich_text', 'pdf', 'docx', 'video', 'embed'
    content TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    difficulty TEXT NOT NULL DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced'
    estimated_minutes INTEGER NOT NULL DEFAULT 15,
    tags TEXT[] DEFAULT '{}',
    learning_objectives TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    table_of_contents JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'published', -- 'draft', 'published', 'archived'
    views_count INTEGER NOT NULL DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. LEARNING NOTE PROGRESS (Tracks student note completion & reading time)
CREATE TABLE IF NOT EXISTS public.learning_note_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES public.learning_notes(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, note_id)
);

-- 3. LEARNING BOOKMARKS (Student saved resources)
CREATE TABLE IF NOT EXISTS public.learning_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES public.learning_notes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, note_id)
);

-- 4. LEARNING VIVA QUIZZES (Subject and lab practice quizzes)
CREATE TABLE IF NOT EXISTS public.learning_viva_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    unit TEXT DEFAULT 'Unit 1',
    topic TEXT,
    quiz_type TEXT NOT NULL DEFAULT 'theory', -- 'theory', 'lab'
    difficulty TEXT NOT NULL DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced'
    duration_minutes INTEGER NOT NULL DEFAULT 10,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    passing_score_percentage INTEGER NOT NULL DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'published', -- 'draft', 'published', 'archived'
    total_questions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. LEARNING VIVA QUESTIONS
CREATE TABLE IF NOT EXISTS public.learning_viva_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.learning_viva_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL, -- 'A', 'B', 'C', 'D'
    explanation TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. LEARNING QUESTION BANK (Reusable question repository for faculty)
CREATE TABLE IF NOT EXISTS public.learning_question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    unit TEXT DEFAULT 'Unit 1',
    topic TEXT,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL, -- 'A', 'B', 'C', 'D'
    explanation TEXT,
    difficulty TEXT NOT NULL DEFAULT 'Intermediate',
    quiz_type TEXT NOT NULL DEFAULT 'theory',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. LEARNING VIVA ATTEMPTS (Student quiz submissions)
CREATE TABLE IF NOT EXISTS public.learning_viva_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.learning_viva_quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    score_percentage INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    incorrect_count INTEGER NOT NULL DEFAULT 0,
    unanswered_count INTEGER NOT NULL DEFAULT 0,
    time_taken_seconds INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed', -- 'in_progress', 'completed', 'timeout'
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. LEARNING VIVA ANSWERS (Detailed per-question answers for each attempt)
CREATE TABLE IF NOT EXISTS public.learning_viva_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.learning_viva_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.learning_viva_questions(id) ON DELETE CASCADE,
    selected_option TEXT, -- 'A', 'B', 'C', 'D' or null
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. LEARNING ACTIVITY LOG (For student analytics & streak computation)
CREATE TABLE IF NOT EXISTS public.learning_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'note_viewed', 'note_completed', 'note_bookmarked', 'viva_started', 'viva_completed', 'search_performed'
    reference_id UUID,
    title TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. LEARNING STREAKS
CREATE TABLE IF NOT EXISTS public.learning_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 1,
    longest_streak INTEGER NOT NULL DEFAULT 1,
    last_activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weekly_history JSONB NOT NULL DEFAULT '{"Mon": true, "Tue": true, "Wed": true, "Thu": true, "Fri": false, "Sat": false, "Sun": false}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_learning_notes_subject_id ON public.learning_notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_learning_notes_faculty_id ON public.learning_notes(faculty_id);
CREATE INDEX IF NOT EXISTS idx_learning_notes_status ON public.learning_notes(status);
CREATE INDEX IF NOT EXISTS idx_learning_note_progress_student ON public.learning_note_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_bookmarks_student ON public.learning_bookmarks(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_viva_quizzes_subject ON public.learning_viva_quizzes(subject_id);
CREATE INDEX IF NOT EXISTS idx_learning_viva_questions_quiz ON public.learning_viva_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_learning_viva_attempts_student ON public.learning_viva_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_viva_attempts_quiz ON public.learning_viva_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_learning_activity_student ON public.learning_activity(student_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.learning_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_note_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_viva_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_viva_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_viva_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_viva_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_streaks ENABLE ROW LEVEL SECURITY;

-- Learning Notes Policies
CREATE POLICY "Public read published notes" ON public.learning_notes
    FOR SELECT USING (status = 'published' OR auth.uid() IN (SELECT auth_user_id FROM public.profiles WHERE id = faculty_id));

CREATE POLICY "Faculty can insert notes" ON public.learning_notes
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM public.profiles WHERE id = faculty_id AND role = 'professor'));

CREATE POLICY "Faculty can update their notes" ON public.learning_notes
    FOR UPDATE USING (auth.uid() IN (SELECT auth_user_id FROM public.profiles WHERE id = faculty_id AND role = 'professor'));

CREATE POLICY "Faculty can delete their notes" ON public.learning_notes
    FOR DELETE USING (auth.uid() IN (SELECT auth_user_id FROM public.profiles WHERE id = faculty_id AND role = 'professor'));

-- Progress Policies
CREATE POLICY "Students manage own progress" ON public.learning_note_progress
    FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM public.profiles WHERE id = student_id));

-- Bookmarks Policies
CREATE POLICY "Students manage own bookmarks" ON public.learning_bookmarks
    FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM public.profiles WHERE id = student_id));

-- Viva Quizzes Policies
CREATE POLICY "Public read published quizzes" ON public.learning_viva_quizzes
    FOR SELECT USING (status = 'published' OR auth.uid() IN (SELECT auth_user_id FROM public.profiles WHERE id = faculty_id));

CREATE POLICY "Faculty manage own quizzes" ON public.learning_viva_quizzes
    FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM public.profiles WHERE id = faculty_id AND role = 'professor'));

-- Viva Questions Policies
CREATE POLICY "Public read quiz questions" ON public.learning_viva_questions
    FOR SELECT USING (true);

CREATE POLICY "Faculty manage quiz questions" ON public.learning_viva_questions
    FOR ALL USING (true);

-- Question Bank Policies
CREATE POLICY "Faculty manage question bank" ON public.learning_question_bank
    FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM public.profiles WHERE id = faculty_id));

-- Viva Attempts Policies
CREATE POLICY "Students manage own attempts" ON public.learning_viva_attempts
    FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM public.profiles WHERE id = student_id));

CREATE POLICY "Faculty view student attempts" ON public.learning_viva_attempts
    FOR SELECT USING (true);

-- Viva Answers Policies
CREATE POLICY "Students manage own answers" ON public.learning_viva_answers
    FOR ALL USING (true);

-- Activity Policies
CREATE POLICY "Students manage own activity" ON public.learning_activity
    FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM public.profiles WHERE id = student_id));

-- Streaks Policies
CREATE POLICY "Students manage own streaks" ON public.learning_streaks
    FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM public.profiles WHERE id = student_id));
