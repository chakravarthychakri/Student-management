// @ts-nocheck
import React, { useState } from "react"
import { Link } from "react-router-dom"
import { 
  BookOpen, 
  Bookmark, 
  Database,
  Cpu,
  Layers,
  FileText, 
  HardDrive,
  GitBranch,
  Network
} from "lucide-react"
import { toast } from "sonner"
import { LearningService } from "@/lib/learningService"
import { useAuth } from "@/contexts/AuthContext"
import type { LearningNote } from "@/types/learning.types"

interface NoteCardProps {
  note: LearningNote
  onBookmarkToggle?: (noteId: string, isBookmarked: boolean) => void
  viewMode?: "grid" | "list"
}

export default function NoteCard({ note, onBookmarkToggle, viewMode = "grid" }: NoteCardProps) {
  const { profile } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(Boolean(note.is_bookmarked))
  const [loadingBookmark, setLoadingBookmark] = useState(false)

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoadingBookmark(true)
    try {
      const nextState = await LearningService.toggleBookmark(profile?.id || "default", note.id)
      setIsBookmarked(nextState)
      if (nextState) {
        toast.success("✓ Saved to bookmarks", { description: note.title })
      } else {
        toast.info("Removed from bookmarks")
      }
      if (onBookmarkToggle) onBookmarkToggle(note.id, nextState)
    } catch (err) {
      toast.error("Failed to update bookmark")
    } finally {
      setLoadingBookmark(false)
    }
  }

  // Get subject icon and background color style matching Screen 3
  const getSubjectIconStyle = () => {
    const titleLower = (note.title || "").toLowerCase()
    const subjLower = (note.subject?.name || "").toLowerCase()

    if (titleLower.includes("array") || titleLower.includes("linked list")) {
      return { icon: Layers, bg: "bg-rose-50 text-rose-500" }
    }
    if (titleLower.includes("process") || subjLower.includes("operating") || titleLower.includes("scheduling")) {
      return { icon: Cpu, bg: "bg-purple-50 text-purple-600" }
    }
    if (titleLower.includes("normalization") || titleLower.includes("graph")) {
      return { icon: GitBranch, bg: "bg-orange-50 text-orange-500" }
    }
    if (subjLower.includes("network") || titleLower.includes("network")) {
      return { icon: Network, bg: "bg-blue-50 text-blue-600" }
    }
    if (titleLower.includes("sql") || subjLower.includes("database") || subjLower.includes("dbms")) {
      return { icon: Database, bg: "bg-emerald-50 text-emerald-600" }
    }
    if (titleLower.includes("file system")) {
      return { icon: HardDrive, bg: "bg-slate-100 text-slate-600" }
    }
    if (subjLower.includes("data structure") || titleLower.includes("data structure")) {
      return { icon: BookOpen, bg: "bg-[#E8F8EE] text-[#16A34A]" }
    }
    return { icon: FileText, bg: "bg-emerald-50 text-[#16A34A]" }
  }

  const { icon: IconComponent, bg: iconBg } = getSubjectIconStyle()
  const pageCount = note.estimated_minutes ? `${note.estimated_minutes} pages` : "12 pages"
  const formattedDate = note.updated_at 
    ? new Date(note.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Apr 20, 2025"

  if (viewMode === "list") {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#16A34A]/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <Link to={`/learning/notes/${note.id}`} className="block group-hover:text-[#16A34A] transition-colors">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {note.title}
              </h3>
            </Link>
            <p className="text-xs text-slate-500 font-medium">
              {note.subject?.name || "Data Structures"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-bold text-[10px]">
              PDF
            </span>
            <span>{pageCount}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>

          <button
            type="button"
            onClick={handleBookmarkClick}
            disabled={loadingBookmark}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#16A34A] hover:bg-emerald-50 transition-colors"
            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-[#16A34A] text-[#16A34A]" : ""}`} />
          </button>
        </div>
      </div>
    )
  }

  // Grid Mode matching Screen 3
  return (
    <div className="group relative bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#16A34A]/40 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Icon Pill & Bookmark */}
        <div className="flex items-center justify-between mb-3.5">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
            <IconComponent className="h-4 w-4" />
          </div>

          <button
            type="button"
            onClick={handleBookmarkClick}
            disabled={loadingBookmark}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#16A34A] hover:bg-emerald-50 transition-colors"
            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-[#16A34A] text-[#16A34A]" : ""}`} />
          </button>
        </div>

        {/* Note Title */}
        <Link to={`/learning/notes/${note.id}`} className="block group-hover:text-[#16A34A] transition-colors">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
            {note.title}
          </h3>
        </Link>

        {/* Subject Subtitle */}
        <p className="text-xs text-slate-500 font-medium mt-1">
          {note.subject?.name || "Data Structures"}
        </p>
      </div>

      {/* Bottom Meta Row */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-bold text-[10px]">
            PDF
          </span>
          <span>{pageCount}</span>
        </div>
        <span>{formattedDate}</span>
      </div>
    </div>
  )
}
