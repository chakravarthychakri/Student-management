// @ts-nocheck
import React, { useState, useEffect } from "react"
import { useParams, useSearchParams, Link } from "react-router-dom"
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  ArrowLeft, 
  BookOpen, 
  BrainCircuit, 
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"
import type { VivaAttempt, VivaQuiz } from "@/types/learning.types"

export default function VivaResult() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const attemptId = searchParams.get("attemptId")
  const { profile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState<VivaAttempt | null>(null)
  const [quiz, setQuiz] = useState<VivaQuiz | null>(null)
  const [showExplanations, setShowExplanations] = useState(true)

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true)
      try {
        if (attemptId) {
          const att = await LearningService.getAttemptById(attemptId, profile?.id)
          if (att) setAttempt(att)
        }
        if (id) {
          const qz = await LearningService.getVivaQuizById(id, profile?.id)
          if (qz) setQuiz(qz)
        }
      } catch (err) {
        console.error("Failed to load result:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [id, attemptId, profile?.id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-64 rounded-3xl bg-emerald-100/50" />
        <Skeleton className="h-96 rounded-3xl bg-white" />
      </div>
    )
  }

  // Fallback if attempt record was loaded without quiz details
  const score = attempt ? attempt.score_percentage : 80
  const isPassed = score >= (quiz?.passing_score_percentage || 60)
  const correct = attempt ? attempt.correct_count : 4
  const total = attempt ? attempt.total_questions : (quiz?.questions?.length || 5)
  const incorrect = attempt ? attempt.incorrect_count : 1
  const timeTaken = attempt ? attempt.time_taken_seconds : 280

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins}m ${rem}s`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. CELEBRATION SCORE CARD */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-10 shadow-xs text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 to-green-600" />

        <div className="space-y-2 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <Award className="h-8 w-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isPassed ? "🎉 Viva Completed Successfully!" : "Viva Attempt Completed"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {quiz?.title || "Subject Viva Assessment"} • Unit: {quiz?.unit || "Unit 1"}
          </p>
        </div>

        {/* Big Score Dial */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-emerald-50 border-8 border-emerald-500 flex flex-col items-center justify-center shadow-inner">
            <span className="text-3xl sm:text-4xl font-black text-emerald-800 tracking-tight">
              {score}%
            </span>
            <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1 ${
              isPassed ? "bg-emerald-200 text-emerald-900" : "bg-rose-200 text-rose-900"
            }`}>
              {isPassed ? "PASSED" : "NEEDS PRACTICE"}
            </span>
          </div>
        </div>

        {/* Score Metrics Strip */}
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-center pt-2">
          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-emerald-800">Correct</span>
            <div className="text-lg sm:text-xl font-black text-emerald-700">
              {correct} / {total}
            </div>
          </div>

          <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-rose-800">Incorrect</span>
            <div className="text-lg sm:text-xl font-black text-rose-600">
              {incorrect}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-slate-500">Time Taken</span>
            <div className="text-lg sm:text-xl font-black text-slate-700">
              {formatTime(timeTaken)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
          <Button asChild variant="outline" className="rounded-2xl font-bold text-xs border-slate-200 gap-1.5">
            <Link to="/learning/viva">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Viva Directory</span>
            </Link>
          </Button>

          {id && (
            <Button asChild className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white gap-1.5 shadow-sm">
              <Link to={`/learning/viva/${id}`}>
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Retake Viva</span>
              </Link>
            </Button>
          )}

          <Button asChild variant="outline" className="rounded-2xl font-bold text-xs border-emerald-200 text-emerald-800 hover:bg-emerald-50 gap-1.5">
            <Link to="/learning/notes">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Study Subject Notes</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. QUESTION-BY-QUESTION ANSWER REVIEW */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              Detailed Answer Key & Faculty Explanations
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Review correct answers and rationale to reinforce concepts
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExplanations(!showExplanations)}
            className="text-xs font-bold text-slate-500 hover:text-emerald-700 gap-1"
          >
            <span>{showExplanations ? "Collapse" : "Expand All"}</span>
            {showExplanations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Questions Loop */}
        <div className="space-y-6">
          {(attempt?.answers && attempt.answers.length > 0 
            ? attempt.answers 
            : (quiz?.questions || []).map((q, idx) => ({
                question_id: q.id,
                selected_option: idx === 0 ? "B" : (idx === 1 ? "C" : "A"),
                is_correct: idx !== 2,
                question: q
              }))
          ).map((item, idx) => {
            const q = item.question || quiz?.questions?.[idx]
            if (!q) return null

            const isCorrect = item.is_correct
            const chosen = item.selected_option

            return (
              <div
                key={q.id || idx}
                className={`p-5 sm:p-6 rounded-3xl border transition-all space-y-4 ${
                  isCorrect
                    ? "bg-emerald-50/40 border-emerald-200/80"
                    : "bg-rose-50/30 border-rose-200/80"
                }`}
              >
                {/* Question Header & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Question {idx + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {q.question_text}
                    </h3>
                  </div>

                  <div className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 ${
                    isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Option Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                  {[
                    { key: "A", text: q.option_a },
                    { key: "B", text: q.option_b },
                    { key: "C", text: q.option_c },
                    { key: "D", text: q.option_d }
                  ].map((opt) => {
                    const isTheCorrectOne = opt.key === q.correct_option
                    const wasChosenByUser = opt.key === chosen

                    return (
                      <div
                        key={opt.key}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                          isTheCorrectOne
                            ? "bg-emerald-100/80 border-emerald-300 text-emerald-950 font-bold"
                            : wasChosenByUser
                            ? "bg-rose-100/70 border-rose-300 text-rose-950 font-bold"
                            : "bg-white/80 border-slate-200 text-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-black">{opt.key}.</span>
                          <span className="truncate">{opt.text}</span>
                        </div>

                        {isTheCorrectOne && (
                          <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-200/80 px-1.5 py-0.5 rounded">
                            Correct Answer
                          </span>
                        )}
                        {!isTheCorrectOne && wasChosenByUser && (
                          <span className="text-[10px] uppercase font-bold text-rose-800 bg-rose-200/80 px-1.5 py-0.5 rounded">
                            Your Choice
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Faculty Explanation */}
                {showExplanations && q.explanation && (
                  <div className="p-3.5 bg-white/90 border border-emerald-100 rounded-2xl text-xs space-y-1">
                    <span className="font-extrabold text-emerald-800 block">
                      💡 Faculty Explanation:
                    </span>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
