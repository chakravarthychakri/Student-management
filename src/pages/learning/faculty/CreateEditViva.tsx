// @ts-nocheck
import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { 
  ArrowLeft, 
  BrainCircuit, 
  Plus, 
  Trash2, 
  Copy, 
  Save, 
  Check, 
  HelpCircle,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"
import type { VivaQuiz, VivaQuestion } from "@/types/learning.types"

export default function CreateEditViva() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [loading, setLoading] = useState(false)
  const [subjects, setSubjects] = useState<any[]>([])

  // Quiz Meta State
  const [quizData, setQuizData] = useState<Partial<VivaQuiz>>({
    title: "",
    description: "",
    subject_id: "",
    unit: "Unit 1",
    topic: "",
    quiz_type: "theory",
    difficulty: "Intermediate",
    duration_minutes: 10,
    max_attempts: 3,
    passing_score_percentage: 60,
    status: "published"
  })

  // Questions List State
  const [questions, setQuestions] = useState<VivaQuestion[]>([
    {
      id: "q-new-1",
      question_text: "What is the primary characteristic of this topic?",
      option_a: "Option A Description",
      option_b: "Option B Description",
      option_c: "Option C Description",
      option_d: "Option D Description",
      correct_option: "A",
      explanation: "Explanation why Option A is the correct answer."
    }
  ])

  useEffect(() => {
    const fetchInit = async () => {
      const subs = await LearningService.getStudentSubjects(profile?.id)
      setSubjects(subs)
      if (subs.length > 0 && !quizData.subject_id) {
        setQuizData((prev) => ({ ...prev, subject_id: subs[0].id }))
      }

      if (id) {
        const existing = await LearningService.getVivaQuizById(id, profile?.id)
        if (existing) {
          setQuizData(existing)
          if (existing.questions && existing.questions.length > 0) {
            setQuestions(existing.questions)
          }
        }
      }
    }
    fetchInit()
  }, [id, profile?.id])

  const handleAddQuestion = () => {
    const newQ: VivaQuestion = {
      id: "q-new-" + Date.now(),
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "A",
      explanation: ""
    }
    setQuestions([...questions, newQ])
  }

  const handleDuplicateQuestion = (idx: number) => {
    const target = questions[idx]
    const duplicated: VivaQuestion = {
      ...target,
      id: "q-new-" + Date.now(),
      question_text: `${target.question_text} (Copy)`
    }
    const updated = [...questions]
    updated.splice(idx + 1, 0, duplicated)
    setQuestions(updated)
    toast.info("Question duplicated")
  }

  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) {
      toast.error("Quiz must have at least one question")
      return
    }
    setQuestions(questions.filter((_, i) => i !== idx))
  }

  const handleQuestionChange = (idx: number, field: keyof VivaQuestion, value: any) => {
    const updated = [...questions]
    updated[idx] = { ...updated[idx], [field]: value }
    setQuestions(updated)
  }

  const handleSaveQuiz = async () => {
    if (!quizData.title?.trim()) {
      toast.error("Please enter a quiz title")
      return
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question_text.trim() || !q.option_a.trim() || !q.option_b.trim()) {
        toast.error(`Please complete question #${i + 1} and its options`)
        return
      }
    }

    setLoading(true)
    try {
      if (isEditing && id) {
        await LearningService.deleteVivaQuiz(id)
      }

      await LearningService.createVivaQuiz(
        {
          ...quizData,
          faculty_id: profile?.id || "fac-1"
        },
        questions
      )

      toast.success(isEditing ? "Quiz updated successfully! 🎉" : "Viva quiz created & published! 🎉")
      navigate("/learning/faculty/viva")
    } catch (err) {
      toast.error("Failed to save quiz")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/learning/faculty/viva"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Viva Management</span>
        </Link>

        <Button
          onClick={handleSaveQuiz}
          disabled={loading}
          className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white gap-2 shadow-md shadow-emerald-600/20 px-6"
        >
          <Save className="h-4 w-4" />
          <span>{isEditing ? "Update Quiz" : "Publish Viva Quiz"}</span>
        </Button>
      </div>

      {/* 1. QUIZ SETTINGS CARD */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Viva Quiz Configuration
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Configure subject mapping, time duration, maximum attempts, and passing score.
            </p>
          </div>
          <BrainCircuit className="h-6 w-6 text-emerald-600" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Quiz Title <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Operating Systems: CPU Scheduling & Deadlocks Viva"
              value={quizData.title}
              onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
              className="h-12 bg-slate-50 border-slate-200 rounded-2xl text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Subject</label>
              <select
                value={quizData.subject_id}
                onChange={(e) => setQuizData({ ...quizData, subject_id: e.target.value })}
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Unit</label>
              <select
                value={quizData.unit}
                onChange={(e) => setQuizData({ ...quizData, unit: e.target.value })}
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
              >
                <option value="Unit 1">Unit 1</option>
                <option value="Unit 2">Unit 2</option>
                <option value="Unit 3">Unit 3</option>
                <option value="Unit 4">Unit 4</option>
                <option value="Unit 5">Unit 5</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Topic</label>
              <Input
                type="text"
                placeholder="e.g. Process Scheduling"
                value={quizData.topic}
                onChange={(e) => setQuizData({ ...quizData, topic: e.target.value })}
                className="h-11 bg-slate-50 border-slate-200 rounded-2xl text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Duration (min)</label>
              <Input
                type="number"
                min={1}
                max={60}
                value={quizData.duration_minutes}
                onChange={(e) => setQuizData({ ...quizData, duration_minutes: Number(e.target.value) })}
                className="h-11 bg-slate-50 border-slate-200 rounded-2xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Max Attempts</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={quizData.max_attempts}
                onChange={(e) => setQuizData({ ...quizData, max_attempts: Number(e.target.value) })}
                className="h-11 bg-slate-50 border-slate-200 rounded-2xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Difficulty</label>
              <select
                value={quizData.difficulty}
                onChange={(e) => setQuizData({ ...quizData, difficulty: e.target.value as any })}
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Type</label>
              <select
                value={quizData.quiz_type}
                onChange={(e) => setQuizData({ ...quizData, quiz_type: e.target.value as any })}
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
              >
                <option value="theory">Theory Viva</option>
                <option value="lab">Lab Viva</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. QUESTION BUILDER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Quiz Questions ({questions.length})
          </h3>

          <Button
            type="button"
            onClick={handleAddQuestion}
            className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Question</span>
          </Button>
        </div>

        {questions.map((q, idx) => (
          <div
            key={q.id || idx}
            className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider">
                Question {idx + 1}
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDuplicateQuestion(idx)}
                  className="h-8 w-8 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50"
                  title="Duplicate Question"
                >
                  <Copy className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteQuestion(idx)}
                  className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete Question"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Question Prompt <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Enter the question text..."
                value={q.question_text}
                onChange={(e) => handleQuestionChange(idx, "question_text", e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "A", field: "option_a" },
                { key: "B", field: "option_b" },
                { key: "C", field: "option_c" },
                { key: "D", field: "option_d" }
              ].map((opt) => (
                <div key={opt.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Option {opt.key}</span>
                    <label className="inline-flex items-center gap-1 cursor-pointer text-[11px] text-emerald-800">
                      <input
                        type="radio"
                        name={`correct-${idx}`}
                        checked={q.correct_option === opt.key}
                        onChange={() => handleQuestionChange(idx, "correct_option", opt.key)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Correct Answer</span>
                    </label>
                  </div>
                  <Input
                    type="text"
                    placeholder={`Enter Option ${opt.key}...`}
                    value={q[opt.field]}
                    onChange={(e) => handleQuestionChange(idx, opt.field as any, e.target.value)}
                    className="h-11 bg-slate-50 border-slate-200 rounded-2xl text-xs font-medium"
                  />
                </div>
              ))}
            </div>

            {/* Explanation */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Explanation (Shown during answer review)
              </label>
              <textarea
                rows={2}
                placeholder="Explain why the correct answer is right to assist student learning..."
                value={q.explanation || ""}
                onChange={(e) => handleQuestionChange(idx, "explanation", e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        ))}

        {/* Bottom Save CTA */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSaveQuiz}
            disabled={loading}
            className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white gap-2 shadow-md shadow-emerald-600/20 px-8 py-6"
          >
            <Save className="h-4 w-4" />
            <span>{isEditing ? "Update & Save Viva Quiz" : "Publish Viva Quiz"}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
