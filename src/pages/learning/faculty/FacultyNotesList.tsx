// @ts-nocheck
import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { 
  BookOpen, 
  PlusCircle, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"
import type { LearningNote } from "@/types/learning.types"

export default function FacultyNotesList() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<LearningNote[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedSection, setSelectedSection] = useState("all")

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const data = await LearningService.getNotes({ studentId: profile?.id })
      setNotes(data)
    } catch (err) {
      console.error("Failed to load notes:", err)
      toast.error("Failed to fetch notes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [profile?.id])

  const handleTogglePublish = async (note: LearningNote) => {
    const newStatus = note.status === "published" ? "draft" : "published"
    try {
      const updated = await LearningService.updateNote(note.id, { status: newStatus })
      if (newStatus === "published") {
        const yearText = note.target_year ? `Year ${note.target_year}` : "All Years"
        const secText = (note.target_sections && note.target_sections.length > 0)
          ? `Sec ${note.target_sections.join(", ")}`
          : (note.target_section && note.target_section !== "all" ? `Sec ${note.target_section}` : "All Sections")

        toast.success(`Note published! 📢 EduNexus notification sent to ${yearText} (${secText}) students.`)
      } else {
        toast.info("Note unpublished to draft")
      }
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, status: newStatus } : n))
      )
    } catch {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return
    try {
      await LearningService.deleteNote(noteId)
      toast.success("Note deleted successfully")
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
    } catch {
      toast.error("Failed to delete note")
    }
  }

  const getAudienceLabel = (note: LearningNote) => {
    const isAllYears = note.all_years || !note.target_year || note.target_year === 0
    const isAllSec = note.all_sections || (!note.target_sections?.length && (!note.target_section || note.target_section === "all"))

    if (isAllYears && isAllSec) return "All Students"
    
    const yearStr = isAllYears ? "All Years" : `Year ${note.target_year}`
    const secStr = isAllSec 
      ? "All Sec" 
      : (note.target_sections && note.target_sections.length > 0 
          ? `Sec ${note.target_sections.join(",")}` 
          : `Sec ${note.target_section}`)

    return `${yearStr} • ${secStr}`
  }

  const filteredNotes = notes.filter((n) => {
    if (selectedStatus !== "all" && n.status !== selectedStatus) return false
    
    // Filter by Year
    if (selectedYear !== "all") {
      const y = Number(selectedYear)
      if (n.target_year && n.target_year !== 0 && !n.all_years && n.target_year !== y) {
        return false
      }
    }

    // Filter by Section
    if (selectedSection !== "all") {
      const sec = selectedSection
      const matches = n.all_sections || 
        !n.target_sections?.length || 
        n.target_sections.includes(sec) || 
        n.target_section === "all" || 
        n.target_section === sec
      if (!matches) return false
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        n.title.toLowerCase().includes(q) ||
        n.topic.toLowerCase().includes(q) ||
        (n.subject?.name && n.subject.name.toLowerCase().includes(q))
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
            <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
            <span>Study Notes Management</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Published & Draft Notes
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Create, edit, target by student Year & Section, and publish curriculum notes with automatic EduNexus student notifications.
          </p>

          <div className="pt-1">
            <Button asChild className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white gap-2 shadow-md shadow-emerald-600/20 px-5 shrink-0">
              <Link to="/learning/faculty/notes/new">
                <PlusCircle className="h-4 w-4" />
                <span>Create New Note</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className="hidden md:flex shrink-0 items-center justify-center z-10 pr-2">
          <img
            src="/assets/illustrations/Faculty-notes-pana.png"
            alt="Study Notes Management Illustration"
            className="w-48 h-48 lg:w-56 lg:h-56 object-contain filter drop-shadow-xs transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-emerald-600" />
          <Input
            type="search"
            placeholder="Search notes by title, topic or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 h-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap sm:flex-nowrap">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex-1 sm:flex-initial"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          {/* Target Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-10 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex-1 sm:flex-initial"
          >
            <option value="all">All Target Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          {/* Target Section Filter */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="h-10 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex-1 sm:flex-initial"
          >
            <option value="all">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
            <option value="D">Section D</option>
            <option value="E">Section E</option>
            <option value="F">Section F</option>
          </select>
        </div>
      </div>

      {/* 3. NOTES TABLE */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="pb-3 px-3">Title & Topic</th>
                  <th className="pb-3 px-3">Subject & Unit</th>
                  <th className="pb-3 px-3">Target Audience</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Views</th>
                  <th className="pb-3 px-3">Updated</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-3">
                      <div className="space-y-0.5 max-w-sm">
                        <h4 className="font-bold text-slate-900 line-clamp-1">
                          {note.title}
                        </h4>
                        <span className="text-[11px] text-emerald-700 font-medium">
                          Topic: {note.topic}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">
                          {note.subject?.code || "CS301"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {note.unit}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-100">
                        {getAudienceLabel(note)}
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        note.status === "published"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {note.status}
                      </span>
                    </td>

                    <td className="py-4 px-3 font-bold text-slate-900">
                      {note.views_count || 0} views
                    </td>

                    <td className="py-4 px-3 text-slate-400 font-medium">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                          title="Preview Student View"
                        >
                          <Link to={`/learning/notes/${note.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit Note"
                        >
                          <Link to={`/learning/faculty/notes/edit/${note.id}`}>
                            <Edit3 className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePublish(note)}
                          className="h-8 w-8 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                          title={note.status === "published" ? "Unpublish Note" : "Publish Note & Notify Students"}
                        >
                          {note.status === "published" ? (
                            <ToggleRight className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-slate-400" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(note.id)}
                          className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Note"
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
              src="/assets/illustrations/Faculty-notes-pana.png" 
              alt="No notes illustration"
              className="w-40 h-40 object-contain filter drop-shadow-xs"
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">No Notes Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Get started by creating your first lecture note for enrolled students.</p>
          </div>
          <Button asChild className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
            <Link to="/learning/faculty/notes/new">Create Note</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
