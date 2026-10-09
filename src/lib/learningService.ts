// @ts-nocheck
import { supabase } from "./supabase"
import type {
  LearningNote,
  VivaQuiz,
  VivaQuestion,
  VivaAttempt,
  QuestionBankItem,
  StudentLearningStreak,
  StudentSubjectProgress,
  DifficultyLevel,
  ContentType
} from "@/types/learning.types"

// Fresh clean storage key for EduNexus initial state
const STORAGE_PREFIX = "edunexus_clean_v2_"

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch (e) {
    console.warn("LocalStorage save warning:", e)
  }
}

// Initial Subjects (Academic structural foundation)
export const INITIAL_SUBJECTS = [
  {
    id: "sub-cs301",
    code: "CS301",
    name: "Data Structures & Algorithms",
    description: "Fundamental data structures, trees, graphs, sorting, and algorithmic complexity analysis.",
    department: "CSE",
    year: 2,
    faculty_name: "Dr. A. Sharma"
  },
  {
    id: "sub-cs302",
    code: "CS302",
    name: "Database Management Systems",
    description: "Relational database design, SQL querying, normal forms (1NF-BCNF), ACID transactions, and indexing.",
    department: "CSE",
    year: 2,
    faculty_name: "Prof. S. Kumar"
  },
  {
    id: "sub-cs303",
    code: "CS303",
    name: "Operating Systems",
    description: "Process scheduling, thread concurrency, memory management, virtual memory paging, and deadlock mitigation.",
    department: "CSE",
    year: 2,
    faculty_name: "Dr. R. Verma"
  },
  {
    id: "sub-cs304",
    code: "CS304",
    name: "Java Object Oriented Programming",
    description: "Object-oriented design patterns, polymorphism, abstraction, exception handling, multithreading, and streams.",
    department: "CSE",
    year: 2,
    faculty_name: "Prof. M. Patel"
  },
  {
    id: "sub-cs305",
    code: "CS305",
    name: "Computer Networks",
    description: "OSI and TCP/IP protocol stack, IP addressing, subnetting, routing algorithms, transport layer protocols.",
    department: "CSE",
    year: 3,
    faculty_name: "Dr. K. Iyer"
  }
]

// Initial State: 0 Notes (Professors will upload after deployment)
export const INITIAL_NOTES: LearningNote[] = []

// Initial State: 0 Viva Quizzes
export const INITIAL_VIVA_QUIZZES: VivaQuiz[] = []

// Initial State: 0 Questions in Question Bank
export const INITIAL_QUESTION_BANK: QuestionBankItem[] = []

// ============================================================================
// LEARNING SERVICE API
// Connects to Supabase with seamless local synchronizer fallback
// ============================================================================

export const LearningService = {
  // 1. Fetch Student Subjects dynamically from EduTrack DB
  async getStudentSubjects(studentId?: string) {
    try {
      const { data: dbSubjects, error } = await supabase
        .from("subjects")
        .select(`
          id,
          name,
          code,
          description,
          professor_id,
          profiles:professor_id (
            full_name
          )
        `)

      if (!error && dbSubjects && dbSubjects.length > 0) {
        return dbSubjects.map((s: any) => ({
          id: s.id,
          code: s.code || "SUB",
          name: s.name,
          description: s.description || "Core curriculum subject",
          faculty_name: s.profiles?.full_name || "Faculty Member",
          department: "CSE",
          year: 2
        }))
      }
    } catch (e) {
      console.warn("Using fallback subject data:", e)
    }

    return INITIAL_SUBJECTS
  },

  // 2. Fetch Notes with Filter Criteria & Bookmark/Progress Hydration
  async getNotes(filters?: {
    subjectId?: string
    unit?: string
    difficulty?: DifficultyLevel
    contentType?: ContentType
    search?: string
    studentId?: string
  }): Promise<LearningNote[]> {
    let localNotes = getStorageItem<LearningNote[]>("notes", INITIAL_NOTES)
    const bookmarks = getStorageItem<string[]>(`bookmarks_${filters?.studentId || "default"}`, [])
    const completedNotes = getStorageItem<string[]>(`completed_notes_${filters?.studentId || "default"}`, [])

    try {
      let query = supabase
        .from("learning_notes")
        .select(`
          *,
          subject:subject_id (id, name, code, description),
          faculty:faculty_id (id, full_name, email, profile_photo_url)
        `)
        .eq("status", "published")

      if (filters?.subjectId && filters.subjectId !== "all") {
        query = query.eq("subject_id", filters.subjectId)
      }
      if (filters?.unit && filters.unit !== "all") {
        query = query.eq("unit", filters.unit)
      }
      if (filters?.difficulty && filters.difficulty !== "all") {
        query = query.eq("difficulty", filters.difficulty)
      }

      const { data: dbNotes, error } = await query

      if (!error && dbNotes && dbNotes.length > 0) {
        localNotes = dbNotes
      }
    } catch (e) {
      // Fallback
    }

    return localNotes
      .filter(n => {
        if (filters?.subjectId && filters.subjectId !== "all" && n.subject_id !== filters.subjectId) return false
        if (filters?.unit && filters.unit !== "all" && n.unit !== filters.unit) return false
        if (filters?.difficulty && filters.difficulty !== "all" && n.difficulty !== filters.difficulty) return false
        if (filters?.contentType && filters.contentType !== "all" && n.content_type !== filters.contentType) return false
        if (filters?.search && filters.search.trim()) {
          const q = filters.search.toLowerCase()
          return (
            n.title.toLowerCase().includes(q) ||
            n.topic.toLowerCase().includes(q) ||
            n.unit.toLowerCase().includes(q) ||
            (n.subject?.name && n.subject.name.toLowerCase().includes(q)) ||
            (n.subject?.code && n.subject.code.toLowerCase().includes(q))
          )
        }
        return true
      })
      .map(note => ({
        ...note,
        is_bookmarked: bookmarks.includes(note.id),
        is_completed: completedNotes.includes(note.id),
        progress_percentage: completedNotes.includes(note.id) ? 100 : (bookmarks.includes(note.id) ? 40 : 0)
      }))
  },

  // 3. Fetch Single Note Detail
  async getNoteById(noteId: string, studentId?: string): Promise<LearningNote | null> {
    const notes = await this.getNotes({ studentId })
    const note = notes.find(n => n.id === noteId) || null
    if (note) {
      this.logActivity(studentId, "note_viewed", note.id, `Viewed note: ${note.title}`)
    }
    return note
  },

  // 4. Bookmark Toggle
  async toggleBookmark(studentId: string, noteId: string): Promise<boolean> {
    const key = `bookmarks_${studentId || "default"}`
    const bookmarks = getStorageItem<string[]>(key, [])
    const exists = bookmarks.includes(noteId)
    const updated = exists ? bookmarks.filter(id => id !== noteId) : [...bookmarks, noteId]
    setStorageItem(key, updated)

    try {
      if (exists) {
        await supabase.from("learning_bookmarks").delete().match({ student_id: studentId, note_id: noteId })
      } else {
        await supabase.from("learning_bookmarks").insert({ student_id: studentId, note_id: noteId })
        this.logActivity(studentId, "note_bookmarked", noteId, "Saved note to bookmarks")
      }
    } catch (e) {}

    return !exists
  },

  // 5. Mark Note as Completed
  async markNoteCompleted(studentId: string, noteId: string, timeSpentSeconds: number = 300): Promise<boolean> {
    const key = `completed_notes_${studentId || "default"}`
    const completed = getStorageItem<string[]>(key, [])
    const exists = completed.includes(noteId)
    const updated = exists ? completed.filter(id => id !== noteId) : [...completed, noteId]
    setStorageItem(key, updated)

    try {
      await supabase.from("learning_note_progress").upsert({
        student_id: studentId,
        note_id: noteId,
        is_completed: !exists,
        progress_percentage: !exists ? 100 : 0,
        completed_at: !exists ? new Date().toISOString() : null,
        time_spent_seconds: timeSpentSeconds,
        last_read_at: new Date().toISOString()
      }, { onConflict: "student_id, note_id" })

      if (!exists) {
        this.logActivity(studentId, "note_completed", noteId, "Completed studying note")
        this.incrementStreak(studentId)
      }
    } catch (e) {
      if (!exists) {
        this.incrementStreak(studentId)
      }
    }

    return !exists
  },

  // 6. Fetch Viva Quizzes
  async getVivaQuizzes(filters?: {
    subjectId?: string
    quizType?: "theory" | "lab"
    difficulty?: DifficultyLevel
    search?: string
    studentId?: string
  }): Promise<VivaQuiz[]> {
    let localQuizzes = getStorageItem<VivaQuiz[]>("viva_quizzes", INITIAL_VIVA_QUIZZES)
    const attempts = getStorageItem<VivaAttempt[]>(`viva_attempts_${filters?.studentId || "default"}`, [])

    try {
      const { data: dbQuizzes, error } = await supabase
        .from("learning_viva_quizzes")
        .select(`
          *,
          subject:subject_id (id, name, code),
          faculty:faculty_id (id, full_name),
          questions:learning_viva_questions (*)
        `)
        .eq("status", "published")

      if (!error && dbQuizzes && dbQuizzes.length > 0) {
        localQuizzes = dbQuizzes
      }
    } catch (e) {}

    return localQuizzes
      .filter(q => {
        if (filters?.subjectId && filters.subjectId !== "all" && q.subject_id !== filters.subjectId) return false
        if (filters?.quizType && filters.quizType !== "all" && q.quiz_type !== filters.quizType) return false
        if (filters?.difficulty && filters.difficulty !== "all" && q.difficulty !== filters.difficulty) return false
        if (filters?.search && filters.search.trim()) {
          const s = filters.search.toLowerCase()
          return (
            q.title.toLowerCase().includes(s) ||
            (q.topic && q.topic.toLowerCase().includes(s)) ||
            (q.subject?.name && q.subject.name.toLowerCase().includes(s))
          )
        }
        return true
      })
      .map(quiz => {
        const userAttempts = attempts.filter(a => a.quiz_id === quiz.id)
        const bestScore = userAttempts.length > 0 
          ? Math.max(...userAttempts.map(a => a.score_percentage)) 
          : undefined

        return {
          ...quiz,
          user_attempts_count: userAttempts.length,
          best_score_percentage: bestScore,
          is_completed: userAttempts.length > 0
        }
      })
  },

  // 7. Get Viva Quiz By ID
  async getVivaQuizById(quizId: string, studentId?: string): Promise<VivaQuiz | null> {
    const quizzes = await this.getVivaQuizzes({ studentId })
    return quizzes.find(q => q.id === quizId) || null
  },

  // 8. Submit Viva Attempt
  async submitVivaAttempt(
    quizId: string,
    studentId: string,
    answers: Record<string, "A" | "B" | "C" | "D">,
    timeTakenSeconds: number
  ): Promise<VivaAttempt> {
    const quiz = await this.getVivaQuizById(quizId, studentId)
    if (!quiz || !quiz.questions) {
      throw new Error("Viva quiz not found")
    }

    let correctCount = 0
    let incorrectCount = 0
    let unansweredCount = 0
    const answerRecords = []

    quiz.questions.forEach(q => {
      const selected = answers[q.id]
      if (!selected) {
        unansweredCount++
        answerRecords.push({
          question_id: q.id,
          selected_option: null,
          is_correct: false,
          question: q
        })
      } else if (selected === q.correct_option) {
        correctCount++
        answerRecords.push({
          question_id: q.id,
          selected_option: selected,
          is_correct: true,
          question: q
        })
      } else {
        incorrectCount++
        answerRecords.push({
          question_id: q.id,
          selected_option: selected,
          is_correct: false,
          question: q
        })
      }
    })

    const totalQuestions = quiz.questions.length
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

    const attemptsKey = `viva_attempts_${studentId || "default"}`
    const existingAttempts = getStorageItem<VivaAttempt[]>(attemptsKey, [])
    const attemptNumber = existingAttempts.filter(a => a.quiz_id === quizId).length + 1

    const newAttempt: VivaAttempt = {
      id: "attempt-" + Date.now(),
      quiz_id: quizId,
      student_id: studentId,
      attempt_number: attemptNumber,
      score_percentage: scorePercentage,
      total_questions: totalQuestions,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      unanswered_count: unansweredCount,
      time_taken_seconds: timeTakenSeconds,
      status: "completed",
      started_at: new Date(Date.now() - timeTakenSeconds * 1000).toISOString(),
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      quiz,
      answers: answerRecords
    }

    existingAttempts.push(newAttempt)
    setStorageItem(attemptsKey, existingAttempts)

    this.logActivity(studentId, "viva_completed", quizId, `Completed Viva: ${quiz.title} with score ${scorePercentage}%`)
    this.incrementStreak(studentId)

    try {
      await supabase.from("learning_viva_attempts").insert({
        quiz_id: quizId,
        student_id: studentId,
        attempt_number: attemptNumber,
        score_percentage: scorePercentage,
        total_questions: totalQuestions,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
        unanswered_count: unansweredCount,
        time_taken_seconds: timeTakenSeconds,
        status: "completed"
      })
    } catch (e) {}

    return newAttempt
  },

  // 9. Get Single Attempt Result
  async getAttemptById(attemptId: string, studentId?: string): Promise<VivaAttempt | null> {
    const key = `viva_attempts_${studentId || "default"}`
    const attempts = getStorageItem<VivaAttempt[]>(key, [])
    return attempts.find(a => a.id === attemptId) || null
  },

  // 10. Student Progress & Analytics (Initial State = 0)
  async getStudentProgress(studentId?: string): Promise<{
    overallPercentage: number
    notesCompleted: number
    totalNotes: number
    vivaCompleted: number
    totalViva: number
    averageScore: number
    learningStreak: StudentLearningStreak
    subjectProgress: StudentSubjectProgress[]
    scoreTrend: { date: string; score: number; quizTitle: string }[]
    recentActivity: { id: string; title: string; time: string; type: string }[]
  }> {
    const notes = await this.getNotes({ studentId })
    const vivaQuizzes = await this.getVivaQuizzes({ studentId })
    const subjects = await this.getStudentSubjects(studentId)
    const attemptsKey = `viva_attempts_${studentId || "default"}`
    const attempts = getStorageItem<VivaAttempt[]>(attemptsKey, [])

    const completedNotesCount = notes.filter(n => n.is_completed).length
    const totalNotesCount = notes.length

    const averageScore = attempts.length > 0
      ? Math.round(attempts.reduce((acc, curr) => acc + curr.score_percentage, 0) / attempts.length)
      : 0

    const overallPercentage = totalNotesCount > 0 
      ? Math.round(((completedNotesCount / totalNotesCount) * 0.5 + (averageScore / 100) * 0.5) * 100)
      : 0

    // Subject Breakdown - 0 state
    const subjectProgress: StudentSubjectProgress[] = subjects.map(sub => {
      const subNotes = notes.filter(n => n.subject_id === sub.id)
      const subViva = vivaQuizzes.filter(v => v.subject_id === sub.id)
      const subCompletedNotes = subNotes.filter(n => n.is_completed).length
      const subCompletedViva = subViva.filter(v => v.is_completed).length

      const noteRatio = subNotes.length > 0 ? (subCompletedNotes / subNotes.length) : 0
      const vivaRatio = subViva.length > 0 ? (subCompletedViva / subViva.length) : 0
      const calculatedProgress = Math.round((noteRatio * 0.5 + vivaRatio * 0.5) * 100)

      return {
        subjectId: sub.id,
        subjectCode: sub.code,
        subjectName: sub.name,
        facultyName: sub.faculty_name,
        totalNotes: subNotes.length,
        completedNotes: subCompletedNotes,
        totalViva: subViva.length,
        completedViva: subCompletedViva,
        averageScore: 0,
        progressPercentage: calculatedProgress,
        units: []
      }
    })

    const streak = getStorageItem<StudentLearningStreak>(`streak_${studentId || "default"}`, {
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: "",
      weekly_history: {
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
        Sat: false,
        Sun: false
      }
    })

    const scoreTrend: { date: string; score: number; quizTitle: string }[] = []
    const recentActivity: { id: string; title: string; time: string; type: string }[] = []

    return {
      overallPercentage,
      notesCompleted: completedNotesCount,
      totalNotes: totalNotesCount,
      vivaCompleted: attempts.length,
      totalViva: vivaQuizzes.length,
      averageScore,
      learningStreak: streak,
      subjectProgress,
      scoreTrend,
      recentActivity
    }
  },

  // 11. Activity Logging Helper
  logActivity(studentId: string | undefined, type: string, referenceId: string, title: string) {
    const key = `activity_${studentId || "default"}`
    const logs = getStorageItem<any[]>(key, [])
    logs.unshift({
      id: "act-" + Date.now(),
      type,
      referenceId,
      title,
      timestamp: new Date().toISOString()
    })
    setStorageItem(key, logs.slice(0, 50))
  },

  // 12. Streak Increment Helper
  incrementStreak(studentId: string | undefined) {
    const key = `streak_${studentId || "default"}`
    const streak = getStorageItem<StudentLearningStreak>(key, {
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: new Date().toISOString().split("T")[0],
      weekly_history: {
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
        Sat: false,
        Sun: false
      }
    })

    const todayDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()] as keyof typeof streak.weekly_history
    streak.current_streak += 1
    streak.longest_streak = Math.max(streak.longest_streak, streak.current_streak)
    streak.weekly_history[todayDay] = true
    setStorageItem(key, streak)
  },

  // 13. Global Search across Notes, Viva, Subjects, Topics
  async globalSearch(query: string, studentId?: string) {
    if (!query || !query.trim()) return { notes: [], viva: [], subjects: [], topics: [] }
    const q = query.toLowerCase().trim()

    const notes = await this.getNotes({ search: q, studentId })
    const viva = await this.getVivaQuizzes({ search: q, studentId })
    const subjects = (await this.getStudentSubjects(studentId)).filter(s =>
      s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    )

    return {
      notes,
      viva,
      subjects,
      topics: []
    }
  },

  // 14. Faculty: Learning Dashboard Analytics (Initial State = 0)
  async getFacultyDashboardData(facultyId?: string) {
    const notes = getStorageItem<LearningNote[]>("notes", INITIAL_NOTES)
    const vivaQuizzes = getStorageItem<VivaQuiz[]>("viva_quizzes", INITIAL_VIVA_QUIZZES)
    const questions = getStorageItem<QuestionBankItem[]>("question_bank", INITIAL_QUESTION_BANK)
    const subjects = await this.getStudentSubjects()

    const totalViews = notes.reduce((acc, curr) => acc + (curr.views_count || 0), 0)
    const totalAttempts = 0
    const averageScore = 0

    // Only show subjects when notes or viva quizzes have been uploaded
    const activeSubjectIds = new Set([
      ...notes.map(n => n.subject_id),
      ...vivaQuizzes.map(v => v.subject_id)
    ])
    const activeSubjects = subjects.filter(s => activeSubjectIds.has(s.id))

    const subjectPerformance = activeSubjects.map(s => {
      const subNotes = notes.filter(n => n.subject_id === s.id)
      const subViva = vivaQuizzes.filter(v => v.subject_id === s.id)
      return {
        subject: s.name,
        subjectId: s.id,
        enrolledStudents: 0,
        avgScore: 0,
        notesCompletedPct: 0,
        notesCount: subNotes.length,
        vivaCount: subViva.length
      }
    })

    return {
      publishedNotesCount: notes.length,
      vivaQuizzesCount: vivaQuizzes.length,
      questionBankCount: questions.length,
      totalViews,
      totalAttempts,
      averageScore,
      recentNotes: notes.slice(0, 5),
      recentQuizzes: vivaQuizzes.slice(0, 5),
      subjectPerformance,
      scoreDistribution: []
    }
  },

  // 15. Faculty: Create Note
  async createNote(noteData: Partial<LearningNote>): Promise<LearningNote> {
    const notes = getStorageItem<LearningNote[]>("notes", INITIAL_NOTES)
    const newNote: LearningNote = {
      id: "note-" + Date.now(),
      subject_id: noteData.subject_id || "sub-cs301",
      faculty_id: noteData.faculty_id || "fac-1",
      title: noteData.title || "Untitled Note",
      description: noteData.description || "",
      unit: noteData.unit || "Unit 1",
      topic: noteData.topic || "Core Topic",
      content_type: noteData.content_type || "rich_text",
      content: noteData.content || "",
      file_url: noteData.file_url || null,
      file_name: noteData.file_name || null,
      difficulty: noteData.difficulty || "Intermediate",
      estimated_minutes: noteData.estimated_minutes || 15,
      tags: noteData.tags || ["Academic"],
      learning_objectives: noteData.learning_objectives || [],
      prerequisites: noteData.prerequisites || [],
      table_of_contents: noteData.table_of_contents || [],
      status: noteData.status || "published",
      views_count: 0,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subject: INITIAL_SUBJECTS.find(s => s.id === noteData.subject_id) || INITIAL_SUBJECTS[0],
      faculty: {
        id: noteData.faculty_id || "fac-1",
        full_name: "Faculty Member",
        email: "faculty@edutrack.edu",
        profile_photo_url: null
      }
    }

    notes.unshift(newNote)
    setStorageItem("notes", notes)

    try {
      await supabase.from("learning_notes").insert(newNote)
    } catch (e) {}

    return newNote
  },

  // 16. Faculty: Update Note
  async updateNote(noteId: string, updates: Partial<LearningNote>): Promise<LearningNote> {
    const notes = getStorageItem<LearningNote[]>("notes", INITIAL_NOTES)
    const index = notes.findIndex(n => n.id === noteId)
    if (index === -1) throw new Error("Note not found")

    const updated = {
      ...notes[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    notes[index] = updated
    setStorageItem("notes", notes)

    try {
      await supabase.from("learning_notes").update(updates).eq("id", noteId)
    } catch (e) {}

    return updated
  },

  // 17. Faculty: Delete Note
  async deleteNote(noteId: string): Promise<boolean> {
    const notes = getStorageItem<LearningNote[]>("notes", INITIAL_NOTES)
    const filtered = notes.filter(n => n.id !== noteId)
    setStorageItem("notes", filtered)

    try {
      await supabase.from("learning_notes").delete().eq("id", noteId)
    } catch (e) {}

    return true
  },

  // 18. Faculty: Create Viva Quiz
  async createVivaQuiz(quizData: Partial<VivaQuiz>, questions: VivaQuestion[]): Promise<VivaQuiz> {
    const quizzes = getStorageItem<VivaQuiz[]>("viva_quizzes", INITIAL_VIVA_QUIZZES)
    const newQuizId = "viva-" + Date.now()

    const preparedQuestions = questions.map((q, idx) => ({
      ...q,
      id: q.id || `q-${newQuizId}-${idx + 1}`,
      quiz_id: newQuizId,
      order_index: idx + 1
    }))

    const newQuiz: VivaQuiz = {
      id: newQuizId,
      subject_id: quizData.subject_id || "sub-cs301",
      faculty_id: quizData.faculty_id || "fac-1",
      title: quizData.title || "New Viva Quiz",
      description: quizData.description || "",
      unit: quizData.unit || "Unit 1",
      topic: quizData.topic || "",
      quiz_type: quizData.quiz_type || "theory",
      difficulty: quizData.difficulty || "Intermediate",
      duration_minutes: quizData.duration_minutes || 10,
      max_attempts: quizData.max_attempts || 3,
      passing_score_percentage: quizData.passing_score_percentage || 60,
      status: quizData.status || "published",
      total_questions: preparedQuestions.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subject: INITIAL_SUBJECTS.find(s => s.id === quizData.subject_id) || INITIAL_SUBJECTS[0],
      faculty: {
        id: quizData.faculty_id || "fac-1",
        full_name: "Faculty Member"
      },
      questions: preparedQuestions
    }

    quizzes.unshift(newQuiz)
    setStorageItem("viva_quizzes", quizzes)

    try {
      await supabase.from("learning_viva_quizzes").insert(newQuiz)
      if (preparedQuestions.length > 0) {
        await supabase.from("learning_viva_questions").insert(preparedQuestions)
      }
    } catch (e) {}

    return newQuiz
  },

  // 19. Faculty: Delete Viva Quiz
  async deleteVivaQuiz(quizId: string): Promise<boolean> {
    const quizzes = getStorageItem<VivaQuiz[]>("viva_quizzes", INITIAL_VIVA_QUIZZES)
    const filtered = quizzes.filter(q => q.id !== quizId)
    setStorageItem("viva_quizzes", filtered)

    try {
      await supabase.from("learning_viva_quizzes").delete().eq("id", quizId)
    } catch (e) {}

    return true
  },

  // 20. Question Bank Methods
  async getQuestionBank(facultyId?: string): Promise<QuestionBankItem[]> {
    const localQB = getStorageItem<QuestionBankItem[]>("question_bank", INITIAL_QUESTION_BANK)
    return localQB
  },

  async addQuestionToBank(question: Partial<QuestionBankItem>): Promise<QuestionBankItem> {
    const qb = getStorageItem<QuestionBankItem[]>("question_bank", INITIAL_QUESTION_BANK)
    const newQ: QuestionBankItem = {
      id: "qb-" + Date.now(),
      faculty_id: question.faculty_id || "fac-1",
      subject_id: question.subject_id || "sub-cs301",
      unit: question.unit || "Unit 1",
      topic: question.topic || "Core Topic",
      question_text: question.question_text || "",
      option_a: question.option_a || "",
      option_b: question.option_b || "",
      option_c: question.option_c || "",
      option_d: question.option_d || "",
      correct_option: question.correct_option || "A",
      explanation: question.explanation || "",
      difficulty: question.difficulty || "Intermediate",
      quiz_type: question.quiz_type || "theory",
      created_at: new Date().toISOString()
    }
    qb.unshift(newQ)
    setStorageItem("question_bank", qb)

    try {
      await supabase.from("learning_question_bank").insert(newQ)
    } catch (e) {}

    return newQ
  },

  async deleteQuestionFromBank(questionId: string): Promise<boolean> {
    const qb = getStorageItem<QuestionBankItem[]>("question_bank", INITIAL_QUESTION_BANK)
    const filtered = qb.filter(q => q.id !== questionId)
    setStorageItem("question_bank", filtered)
    try {
      await supabase.from("learning_question_bank").delete().eq("id", questionId)
    } catch (e) {}
    return true
  }
}
