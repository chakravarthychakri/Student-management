// @ts-nocheck
import React, { useState, useEffect } from "react"
import { 
  FileQuestion, 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  Filter, 
  Sparkles,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"
import type { QuestionBankItem } from "@/types/learning.types"

export default function QuestionBank() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<QuestionBankItem[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    subject_id: "",
    unit: "Unit 1",
    topic: "",
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
    explanation: "",
    difficulty: "Intermediate",
    quiz_type: "theory"
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [qb, subs] = await Promise.all([
        LearningService.getQuestionBank(profile?.id),
        LearningService.getStudentSubjects(profile?.id)
      ])
      setQuestions(qb)
      setSubjects(subs)
      if (subs.length > 0) {
        setNewQuestion((prev) => ({ ...prev, subject_id: subs[0].id }))
      }
    } catch (err) {
      console.error("Failed to load question bank:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [profile?.id])

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.question_text.trim() || !newQuestion.option_a.trim() || !newQuestion.option_b.trim()) {
      toast.error("Please provide question text and at least options A and B")
      return
    }

    try {
      const created = await LearningService.addQuestionToBank({
        ...newQuestion,
        faculty_id: profile?.id || "fac-1"
      })
      setQuestions([created, ...questions])
      toast.success("Question added to repository! 🎉")
      setShowCreateModal(false)
      setNewQuestion({
        subject_id: subjects[0]?.id || "",
        unit: "Unit 1",
        topic: "",
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "A",
        explanation: "",
        difficulty: "Intermediate",
        quiz_type: "theory"
      })
    } catch {
      toast.error("Failed to add question")
    }
  }

  const handleDelete = async (qId: string) => {
    try {
      await LearningService.deleteQuestionFromBank(qId)
      setQuestions(questions.filter((q) => q.id !== qId))
      toast.success("Question removed from bank")
    } catch {
      toast.error("Failed to delete")
    }
  }

  const filteredQuestions = questions.filter((q) => {
    if (selectedSubject !== "all" && q.subject_id !== selectedSubject) return false
    if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty) return false
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase()
      return (
        q.question_text.toLowerCase().includes(s) ||
        (q.topic && q.topic.toLowerCase().includes(s))
      )
    }
    return true
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. HEADER BANNER */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
            <FileQuestion className="h-3.5 w-3.5 text-emerald-600" />
            <span>Central Question Repository</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Reusable Question Bank
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Organize a library of multiple choice questions categorized by subject, unit, and difficulty to easily assemble Viva quizzes.
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white gap-2 shadow-md shadow-emerald-600/20 px-5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Question to Bank</span>
        </Button>
      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-emerald-600" />
          <Input
            type="search"
            placeholder="Search questions by keyword or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 h-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="h-10 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex-1 sm:flex-initial"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="h-10 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex-1 sm:flex-initial"
          >
            <option value="all">Difficulty: All</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* 3. QUESTIONS LIST */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-3xl bg-slate-100" />
          ))}
        </div>
      ) : filteredQuestions.length > 0 ? (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="bg-white border border-[#E2E8E4] rounded-3xl p-6 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                    {q.unit || "Unit 1"} • {q.difficulty}
                  </span>
                  {q.topic && (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      Topic: {q.topic}
                    </span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(q.id)}
                  className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete from Bank"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {q.question_text}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                {[
                  { key: "A", text: q.option_a },
                  { key: "B", text: q.option_b },
                  { key: "C", text: q.option_c },
                  { key: "D", text: q.option_d }
                ].map((opt) => (
                  <div
                    key={opt.key}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      opt.key === q.correct_option
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                        : "bg-slate-50/60 border-slate-200 text-slate-600"
                    }`}
                  >
                    <span>{opt.key}. {opt.text}</span>
                    {opt.key === q.correct_option && (
                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-200 px-1.5 py-0.5 rounded">
                        Correct
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {q.explanation && (
                <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600">
                  <span className="font-bold text-slate-800">Explanation: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8E4] rounded-3xl p-12 text-center space-y-3">
          <FileQuestion className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-900">No Questions in Repository</h3>
          <p className="text-xs text-slate-500">Add questions to your bank to build quizzes with 1-click.</p>
          <Button onClick={() => setShowCreateModal(true)} className="rounded-2xl bg-emerald-600 text-white font-bold text-xs mt-2">
            Add Question
          </Button>
        </div>
      )}

      {/* Create Question Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Add Question to Bank
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCreateModal(false)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={newQuestion.subject_id}
                    onChange={(e) => setNewQuestion({ ...newQuestion, subject_id: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Unit</label>
                  <select
                    value={newQuestion.unit}
                    onChange={(e) => setNewQuestion({ ...newQuestion, unit: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  >
                    <option value="Unit 1">Unit 1</option>
                    <option value="Unit 2">Unit 2</option>
                    <option value="Unit 3">Unit 3</option>
                    <option value="Unit 4">Unit 4</option>
                    <option value="Unit 5">Unit 5</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Question Prompt</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter the question text..."
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-2">
                {[
                  { key: "A", field: "option_a" },
                  { key: "B", field: "option_b" },
                  { key: "C", field: "option_c" },
                  { key: "D", field: "option_d" }
                ].map((opt) => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <span className="w-6 text-xs font-black text-slate-700">{opt.key}:</span>
                    <Input
                      type="text"
                      required={opt.key === "A" || opt.key === "B"}
                      placeholder={`Option ${opt.key}`}
                      value={newQuestion[opt.field]}
                      onChange={(e) => setNewQuestion({ ...newQuestion, [opt.field]: e.target.value })}
                      className="h-10 bg-slate-50 border-slate-200 text-xs"
                    />
                    <input
                      type="radio"
                      name="correct_opt"
                      checked={newQuestion.correct_option === opt.key}
                      onChange={() => setNewQuestion({ ...newQuestion, correct_option: opt.key })}
                      title="Mark as correct answer"
                      className="text-emerald-600 ml-1"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Explanation</label>
                <textarea
                  rows={2}
                  placeholder="Explanation shown in answer reviews..."
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-2xl font-bold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Save Question
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
