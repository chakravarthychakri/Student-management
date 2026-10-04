// @ts-nocheck
import React, { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Clock, ArrowLeft, ArrowRight, BrainCircuit, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"
import type { VivaQuiz } from "@/types/learning.types"

export default function VivaQuizTake() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState<VivaQuiz | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({})
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(525) // 08:45 initial default
  const [submitting, setSubmitting] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const initialTimeRef = useRef(600)

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await LearningService.getVivaQuizById(id, profile?.id)
        if (data && data.questions && data.questions.length > 0) {
          setQuiz(data)
          const durationSecs = (data.duration_minutes || 10) * 60
          setTimeLeftSeconds(durationSecs)
          initialTimeRef.current = durationSecs
        } else {
          // Fallback sample questions if database returns empty
          const fallbackQuiz: VivaQuiz = {
            id: id || "demo",
            title: "Data Structures Basics",
            difficulty: "Easy",
            duration_minutes: 10,
            questions: [
              {
                id: "q1",
                question_text: "What is the time complexity to access an element in an array by index?",
                option_a: "O(n)",
                option_b: "O(1)",
                option_c: "O(log n)",
                option_d: "O(n²)",
                correct_option: "B"
              },
              {
                id: "q2",
                question_text: "Which data structure operates on a First-In-First-Out (FIFO) basis?",
                option_a: "Stack",
                option_b: "Queue",
                option_c: "Tree",
                option_d: "Graph",
                correct_option: "B"
              },
              {
                id: "q3",
                question_text: "Which of the following is a linear data structure?",
                option_a: "Tree",
                option_b: "Graph",
                option_c: "Stack",
                option_d: "Heap",
                correct_option: "C"
              },
              {
                id: "q4",
                question_text: "What is the worst-case time complexity of searching in a binary search tree (BST)?",
                option_a: "O(1)",
                option_b: "O(log n)",
                option_c: "O(n)",
                option_d: "O(n log n)",
                correct_option: "C"
              }
            ]
          }
          setQuiz(fallbackQuiz)
          setTimeLeftSeconds(525)
        }
      } catch (err) {
        console.error("Failed to load quiz:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [id, profile?.id])

  // Countdown timer
  useEffect(() => {
    if (loading || !quiz || submitting) return

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [loading, quiz, submitting])

  const handleAutoSubmit = async () => {
    toast.warning("Time's up! Submitting quiz...")
    await submitQuizAttempt()
  }

  const handleOptionSelect = (option: "A" | "B" | "C" | "D") => {
    if (!quiz || !quiz.questions) return
    const currentQ = quiz.questions[currentIndex]
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: option
    }))
  }

  const submitQuizAttempt = async () => {
    if (!quiz || submitting) return
    setSubmitting(true)
    try {
      const timeTaken = initialTimeRef.current - timeLeftSeconds
      const attempt = await LearningService.submitVivaAttempt(
        quiz.id,
        profile?.id || "default",
        answers,
        Math.max(timeTaken, 15)
      )
      toast.success("Quiz submitted successfully! 🎉")
      navigate(`/learning/viva/${quiz.id}/result?attemptId=${attempt.id}`)
    } catch (err) {
      console.error("Submission error:", err)
      navigate(`/learning/viva`)
    }
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-28 rounded-2xl bg-white" />
        <Skeleton className="h-96 rounded-2xl bg-white" />
      </div>
    )
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center bg-white border border-slate-200/90 rounded-2xl p-12 space-y-4">
        <BrainCircuit className="h-10 w-10 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Quiz Unavailable</h2>
        <Button asChild className="rounded-xl bg-[#16A34A] text-white text-xs font-bold">
          <Link to="/learning/viva">Back to Quizzes</Link>
        </Button>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentIndex]
  const totalQuestions = quiz.questions.length
  const currentQNumber = currentIndex + 1
  const progressPercent = Math.round((currentQNumber / totalQuestions) * 100)

  const options = [
    { key: "A", text: currentQuestion.option_a },
    { key: "B", text: currentQuestion.option_b },
    { key: "C", text: currentQuestion.option_c },
    { key: "D", text: currentQuestion.option_d }
  ]

  const selectedAnswer = answers[currentQuestion.id]

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* 1. Main Header Card (Screen 6: Title + Question X of Y + Green bar + Timer) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
        {/* Title and Timer */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {quiz.title}
          </h1>

          {/* Timer Badge (Screen 6) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>
        </div>

        {/* Progress Bar & Question Counter (Screen 6) */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-500">
            Question {currentQNumber} of {totalQuestions}
          </span>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#16A34A] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Question & Options Card (Screen 6) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Question Text */}
        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
          {currentQuestion.question_text}
        </h2>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {options.map((opt) => {
            const isSelected = selectedAnswer === opt.key
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleOptionSelect(opt.key as any)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4 cursor-pointer ${
                  isSelected
                    ? "border-[#16A34A] bg-[#E6F7ED] text-[#14532D]"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
                  <span className={isSelected ? "text-[#16A34A] font-bold" : "text-slate-700"}>
                    {opt.key}. {opt.text}
                  </span>
                </div>

                {/* Radio indicator */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isSelected ? "border-[#16A34A] bg-[#16A34A]" : "border-slate-300 bg-white"
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Bottom Navigation Buttons (Screen 6: Previous / Next Question) */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold transition-colors ${
              currentIndex === 0
                ? "text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>Next Question</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={submitQuizAttempt}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>{submitting ? "Submitting..." : "Submit Quiz"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
