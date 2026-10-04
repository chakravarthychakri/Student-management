// @ts-nocheck
import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Bookmark, FileText, Clock } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"
import type { VivaQuiz } from "@/types/learning.types"

interface VivaCardProps {
  quiz: VivaQuiz
}

export default function VivaCard({ quiz }: VivaCardProps) {
  const { profile } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loadingBookmark, setLoadingBookmark] = useState(false)

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoadingBookmark(true)
    try {
      const nextState = await LearningService.toggleBookmark(profile?.id || "default", quiz.id)
      setIsBookmarked(nextState)
      if (nextState) {
        toast.success("✓ Saved quiz to bookmarks")
      } else {
        toast.info("Removed from bookmarks")
      }
    } catch {
      toast.error("Failed to update bookmark")
    } finally {
      setLoadingBookmark(false)
    }
  }

  const getDifficultyColor = (diff: string) => {
    const d = (diff || "Easy").toLowerCase()
    if (d.includes("easy") || d.includes("beginner")) {
      return "bg-emerald-50 text-[#16A34A] border-emerald-200"
    }
    if (d.includes("medium") || d.includes("intermediate")) {
      return "bg-amber-50 text-amber-600 border-amber-200"
    }
    return "bg-rose-50 text-rose-600 border-rose-200"
  }

  const difficultyLabel = quiz.difficulty === "Beginner" 
    ? "Easy" 
    : (quiz.difficulty === "Intermediate" ? "Medium" : (quiz.difficulty || "Easy"))

  const totalQ = quiz.total_questions || (quiz.questions?.length || 10)
  const durationMin = quiz.duration_minutes || 10

  return (
    <div className="group bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#16A34A]/40 transition-all duration-200 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Top Title & Bookmark */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <Link to={`/learning/viva/${quiz.id}`} className="block group-hover:text-[#16A34A] transition-colors">
              <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                {quiz.title}
              </h3>
            </Link>
            <p className="text-xs text-slate-500 font-medium">
              {quiz.subject?.name || "Data Structures"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleBookmarkClick}
            disabled={loadingBookmark}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#16A34A] hover:bg-emerald-50 transition-colors shrink-0"
            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-[#16A34A] text-[#16A34A]" : ""}`} />
          </button>
        </div>

        {/* Info Row (Questions • Minutes) */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
          <div className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span>{totalQ} Questions</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{durationMin} minutes</span>
          </div>
        </div>

        {/* Difficulty Pill */}
        <div>
          <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getDifficultyColor(difficultyLabel)}`}>
            {difficultyLabel}
          </span>
        </div>
      </div>

      {/* Full-width Solid Green CTA Button */}
      <div className="pt-4 mt-2">
        <Link
          to={`/learning/viva/${quiz.id}`}
          className="w-full flex items-center justify-center py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs transition-colors shadow-xs"
        >
          Start Quiz
        </Link>
      </div>
    </div>
  )
}
