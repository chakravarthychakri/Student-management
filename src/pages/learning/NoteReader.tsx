// @ts-nocheck
import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { 
  Download, 
  Bookmark, 
  ChevronRight, 
  FileText, 
  Menu as MenuIcon, 
  Minus, 
  Plus, 
  Maximize2, 
  MoreVertical,
  CheckCircle2
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"
import type { LearningNote } from "@/types/learning.types"

export default function NoteReader() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState<LearningNote | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0)

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await LearningService.getNoteById(id, profile?.id)
        if (data) {
          setNote(data)
          setIsBookmarked(Boolean(data.is_bookmarked))
        }
      } catch (err) {
        console.error("Failed to load note:", err)
        toast.error("Failed to load note")
      } finally {
        setLoading(false)
      }
    }

    fetchNote()
  }, [id, profile?.id])

  const handleToggleBookmark = async () => {
    if (!note) return
    try {
      const nextState = await LearningService.toggleBookmark(profile?.id || "default", note.id)
      setIsBookmarked(nextState)
      if (nextState) {
        toast.success("✓ Saved to bookmarks")
      } else {
        toast.info("Removed from bookmarks")
      }
    } catch {
      toast.error("Failed to update bookmark")
    }
  }

  const handleDownload = () => {
    toast.success("Download started", {
      description: `${note?.title || "Note"}.pdf`
    })
  }

  const defaultTopics = [
    "1. What is a Data Structure?",
    "2. Types of Data Structures",
    "3. Arrays",
    "4. Linked Lists",
    "5. Stacks",
    "6. Queues",
    "7. Trees",
    "8. Graphs",
    "9. Applications",
    "10. Conclusion"
  ]

  const topicsList = note?.table_of_contents && note.table_of_contents.length > 0
    ? note.table_of_contents.map((t, idx) => `${idx + 1}. ${t.title}`)
    : defaultTopics

  const totalPages = note?.estimated_minutes ? Math.max(8, note.estimated_minutes) : 12

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64 rounded-lg bg-slate-200" />
        <Skeleton className="h-32 w-full rounded-2xl bg-white" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-4 h-96 rounded-2xl bg-white" />
          <Skeleton className="lg:col-span-8 h-96 rounded-2xl bg-white" />
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-4 max-w-md mx-auto">
        <FileText className="h-10 w-10 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Note Not Found</h2>
        <p className="text-xs text-slate-500">The study material does not exist or has been removed.</p>
        <Link
          to="/learning/notes"
          className="inline-block px-4 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold"
        >
          Back to Notes
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Breadcrumb (Screen 4: Notes > Subject > Title) */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/learning/notes" className="hover:text-[#16A34A] transition-colors">
          Notes
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="hover:text-slate-800 transition-colors">
          {note.subject?.name || "Data Structures"}
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-md">
          {note.title}
        </span>
      </nav>

      {/* 2. Top Header Card (Screen 4) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Icon + Title + Meta */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {note.title}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              {note.subject?.name || "Data Structures"}
            </p>

            {/* Badges Strip */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400 font-medium">
              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-bold text-[10px]">
                PDF
              </span>
              <span>{totalPages} pages</span>
              <span>•</span>
              <span>Uploaded on Apr 20, 2025</span>
            </div>
          </div>
        </div>

        {/* Right Side: Download & Bookmark Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>

          <button
            type="button"
            onClick={handleToggleBookmark}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-[#16A34A] text-[#16A34A]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 3. Main 2-Column Section (Screen 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Topics in this Note */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Topics in this Note
          </h3>

          <nav className="space-y-1">
            {topicsList.map((topic, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedTopicIndex(index)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  selectedTopicIndex === index
                    ? "bg-[#E8F8EE] text-[#16A34A] font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {topic}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Column: PDF Viewer Canvas & Dark Toolbar */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800">
          {/* Dark PDF Viewer Toolbar */}
          <div className="bg-[#1E293B] text-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-medium border-b border-slate-700">
            {/* Left Options */}
            <div className="flex items-center gap-3">
              <button className="p-1 text-slate-400 hover:text-white rounded transition-colors" title="Sidebar">
                <MenuIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Center: Page indicator & Zoom controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                <span>{currentPage}</span>
                <span>/</span>
                <span>{totalPages}</span>
              </div>

              <div className="h-4 w-[1px] bg-slate-700" />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                  className="p-1 text-slate-400 hover:text-white rounded"
                  title="Zoom Out"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] font-mono text-slate-300">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
                  className="p-1 text-slate-400 hover:text-white rounded"
                  title="Zoom In"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Right Tools */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("pdf-viewport")
                  if (el?.requestFullscreen) el.requestFullscreen()
                }}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="Fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
              <button className="p-1 text-slate-400 hover:text-white rounded" title="Options">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Document Content Viewport */}
          <div id="pdf-viewport" className="bg-[#525659] p-4 sm:p-8 min-h-[600px] flex justify-center overflow-auto">
            <div 
              className="bg-white text-slate-900 rounded-sm shadow-2xl p-8 sm:p-12 max-w-2xl w-full min-h-[750px] space-y-6"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
            >
              {/* Document Header */}
              <div className="text-center pb-6 border-b border-slate-200 space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {note.title}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {note.subject?.name || "Data Structures"} • Academic Notes
                </p>
              </div>

              {/* 1. What is a Data Structure? */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  1. What is a Data Structure?
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed pl-3">
                  • A data structure is a particular way of organizing and storing data in a computer so that it can be accessed and modified efficiently.
                </p>
              </div>

              {/* 2. Types of Data Structures */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  2. Types of Data Structures
                </h3>
                <ul className="text-xs text-slate-700 space-y-1.5 pl-3">
                  <li>
                    <span className="font-semibold">• Linear Data Structures:</span> Elements form a sequence (Arrays, Linked Lists, Stacks, Queues).
                  </li>
                  <li>
                    <span className="font-semibold">• Non-Linear Data Structures:</span> Elements are arranged hierarchically or interconnected (Trees, Graphs).
                  </li>
                </ul>

                {/* Flowchart Diagram (matching Screen 4 visual layout) */}
                <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col items-center space-y-4">
                    {/* Root */}
                    <div className="px-4 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs shadow-xs">
                      Data Structure
                    </div>

                    {/* Branches */}
                    <div className="w-48 h-3 border-t-2 border-l-2 border-r-2 border-slate-400" />

                    <div className="grid grid-cols-2 gap-8 w-full max-w-md">
                      {/* Linear Branch */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="px-3 py-1 rounded bg-blue-100 text-blue-900 border border-blue-300 font-bold text-[11px]">
                          Linear
                        </div>
                        <div className="flex flex-wrap justify-center gap-1 text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-medium">Array</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-medium">Linked List</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-medium">Stack</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-medium">Queue</span>
                        </div>
                      </div>

                      {/* Non-Linear Branch */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="px-3 py-1 rounded bg-purple-100 text-purple-900 border border-purple-300 font-bold text-[11px]">
                          Non-Linear
                        </div>
                        <div className="flex flex-wrap justify-center gap-1 text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-medium">Tree</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-medium">Graph</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Note Content Body */}
              {note.content && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-700 leading-relaxed space-y-3">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: note.content
                        .replace(/^# (.*$)/gim, '<h3 class="text-sm font-bold text-slate-900 mt-4 mb-1">$1</h3>')
                        .replace(/^## (.*$)/gim, '<h4 class="text-xs font-bold text-emerald-800 mt-3 mb-1">$1</h4>')
                        .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-slate-900">$1</strong>')
                        .replace(/\n\n/gim, '</p><p class="text-slate-700 text-xs my-2">')
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
