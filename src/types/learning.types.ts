// EduNexus Domain & Learning Types

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced"
export type ContentType = "rich_text" | "pdf" | "docx" | "video" | "embed"
export type QuizType = "theory" | "lab"
export type ContentStatus = "draft" | "published" | "archived"

export interface TableOfContentItem {
  id: string
  title: string
  level: number
}

export interface LearningNote {
  id: string
  subject_id: string
  faculty_id: string
  title: string
  description?: string | null
  unit: string
  topic: string
  content_type: ContentType
  content?: string | null
  file_url?: string | null
  file_name?: string | null
  file_size?: number | null
  difficulty: DifficultyLevel
  estimated_minutes: number
  tags: string[]
  learning_objectives: string[]
  prerequisites: string[]
  table_of_contents: TableOfContentItem[]
  status: ContentStatus
  views_count: number
  version: number
  created_at: string
  updated_at: string
  // Hydrated joins
  subject?: {
    id: string
    name: string
    code: string
    description?: string | null
  }
  faculty?: {
    id: string
    full_name: string | null
    email: string | null
    profile_photo_url: string | null
  }
  is_completed?: boolean
  is_bookmarked?: boolean
  progress_percentage?: number
}

export interface LearningNoteProgress {
  id: string
  student_id: string
  note_id: string
  is_completed: boolean
  progress_percentage: number
  last_read_at: string
  completed_at?: string | null
  time_spent_seconds: number
  created_at: string
}

export interface LearningBookmark {
  id: string
  student_id: string
  note_id: string
  created_at: string
  note?: LearningNote
}

export interface VivaQuestion {
  id: string
  quiz_id?: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: "A" | "B" | "C" | "D"
  explanation?: string | null
  order_index?: number
  points?: number
}

export interface VivaQuiz {
  id: string
  subject_id: string
  faculty_id: string
  title: string
  description?: string | null
  unit?: string | null
  topic?: string | null
  quiz_type: QuizType
  difficulty: DifficultyLevel
  duration_minutes: number
  max_attempts: number
  passing_score_percentage: number
  status: ContentStatus
  total_questions: number
  created_at: string
  updated_at: string
  // Hydrated joins
  subject?: {
    id: string
    name: string
    code: string
  }
  faculty?: {
    id: string
    full_name: string | null
  }
  questions?: VivaQuestion[]
  user_attempts_count?: number
  best_score_percentage?: number
  is_completed?: boolean
}

export interface VivaAttempt {
  id: string
  quiz_id: string
  student_id: string
  attempt_number: number
  score_percentage: number
  total_questions: number
  correct_count: number
  incorrect_count: number
  unanswered_count: number
  time_taken_seconds: number
  status: "in_progress" | "completed" | "timeout"
  started_at: string
  completed_at: string
  created_at: string
  quiz?: VivaQuiz
  answers?: VivaAnswerRecord[]
  student?: {
    id: string
    full_name: string | null
    email: string | null
    student_id: string | null
    section?: string | null
  }
}

export interface VivaAnswerRecord {
  id?: string
  attempt_id?: string
  question_id: string
  selected_option: "A" | "B" | "C" | "D" | null
  is_correct: boolean
  question?: VivaQuestion
}

export interface QuestionBankItem {
  id: string
  faculty_id: string
  subject_id?: string | null
  unit?: string | null
  topic?: string | null
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: "A" | "B" | "C" | "D"
  explanation?: string | null
  difficulty: DifficultyLevel
  quiz_type: QuizType
  created_at: string
  subject?: {
    id: string
    name: string
    code: string
  }
}

export interface StudentLearningStreak {
  current_streak: number
  longest_streak: number
  last_activity_date: string
  weekly_history: {
    Mon: boolean
    Tue: boolean
    Wed: boolean
    Thu: boolean
    Fri: boolean
    Sat: boolean
    Sun: boolean
  }
}

export interface StudentSubjectProgress {
  subjectId: string
  subjectCode: string
  subjectName: string
  facultyName?: string
  totalNotes: number
  completedNotes: number
  totalViva: number
  completedViva: number
  averageScore: number
  progressPercentage: number
  units: {
    unit: string
    title: string
    topics: {
      name: string
      isCompleted: boolean
      noteId?: string
      vivaId?: string
    }[]
  }[]
}
