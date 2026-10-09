// @ts-nocheck
import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { 
  BrainCircuit, 
  PlusCircle, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Users, 
  Award,
  Sparkles,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"
import type { VivaQuiz } from "@/types/learning.types"

export default function FacultyVivaList() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [quizzes, setQuizzes] = useState<VivaQuiz[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const fetchQuizzes = async () => {
    setLoading(true)
    try {
      const data = await LearningService.getVivaQuizzes({ studentId: profile?.id })
      setQuizzes(data)
    } catch (err) {
      console.error("Failed to load viva quizzes:", err)
      toast.error("Failed to load quizzes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [profile?.id])

  const handleDelete = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this Viva quiz?")) return
    try {
      await LearningService.deleteVivaQuiz(quizId)
      toast.success("Quiz deleted successfully")
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId))
    } catch {
      toast.error("Failed to delete quiz")
    }
  }

  const filteredQuizzes = quizzes.filter((q) => {
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase()
      return (
        q.title.toLowerCase().includes(s) ||
        (q.topic && q.topic.toLowerCase().includes(s)) ||
        (q.subject?.name && q.subject.name.toLowerCase().includes(s))
      )
    }
    return true
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. HEADER BANNER */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
            <BrainCircuit className="h-3.5 w-3.5 text-emerald-600" />
            <span>Assessment Management</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Faculty Viva Quizzes
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Design timed topic quizzes, manage question banks, and review attempt metrics.
          </p>

          <div className="pt-1">
            <Button asChild className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white gap-2 shadow-md shadow-emerald-600/20 px-5 shrink-0">
              <Link to="/learning/faculty/viva/new">
                <PlusCircle className="h-4 w-4" />
                <span>Create New Viva</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className="hidden md:flex shrink-0 items-center justify-center z-10 pr-2">
          <img
            src="/assets/illustrations/Faculty-viva-pana.png"
            alt="Faculty Viva Assessments Illustration"
            className="w-48 h-48 lg:w-56 lg:h-56 object-contain filter drop-shadow-xs transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-emerald-600" />
          <Input
            type="search"
            placeholder="Search quizzes by title, subject or unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 h-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold"
          />
        </div>
      </div>

      {/* 3. QUIZZES TABLE */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : filteredQuizzes.length > 0 ? (
        <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="pb-3 px-3">Quiz Title</th>
                  <th className="pb-3 px-3">Subject & Unit</th>
                  <th className="pb-3 px-3">Questions</th>
                  <th className="pb-3 px-3">Duration</th>
                  <th className="pb-3 px-3">Difficulty</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-3">
                      <div className="space-y-0.5 max-w-sm">
                        <h4 className="font-bold text-slate-900 line-clamp-1">
                          {quiz.title}
                        </h4>
                        <span className="text-[11px] text-emerald-700 font-medium">
                          {quiz.quiz_type === "lab" ? "Laboratory Viva" : "Theory Viva"}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">
                          {quiz.subject?.code || "CS301"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {quiz.unit || "Unit 1"}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-3 font-bold text-slate-900">
                      {quiz.total_questions || (quiz.questions?.length || 5)} Questions
                    </td>

                    <td className="py-4 px-3 font-semibold text-slate-600">
                      {quiz.duration_minutes} min
                    </td>

                    <td className="py-4 px-3">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {quiz.difficulty}
                      </span>
                    </td>

                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                          title="Preview Quiz"
                        >
                          <Link to={`/learning/viva/${quiz.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit Quiz"
                        >
                          <Link to={`/learning/faculty/viva/edit/${quiz.id}`}>
                            <Edit3 className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(quiz.id)}
                          className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Quiz"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8E4] rounded-3xl p-10 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="flex justify-center">
            <img 
              src="/assets/illustrations/Faculty-viva-pana.png" 
              alt="No viva quizzes illustration"
              className="w-40 h-40 object-contain filter drop-shadow-xs"
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">No Viva Quizzes Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Create your first interactive quiz for enrolled students.</p>
          </div>
          <Button asChild className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
            <Link to="/learning/faculty/viva/new">Create Viva Quiz</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
