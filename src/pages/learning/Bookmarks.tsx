// @ts-nocheck
import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { 
  Bookmark, 
  BookOpen, 
  BrainCircuit, 
  Headphones, 
  ArrowRight, 
  Sparkles, 
  Search, 
  Trash2, 
  Clock, 
  User, 
  CheckCircle2, 
  Play, 
  ExternalLink,
  Presentation,
  Award
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"
import NoteCard from "@/components/learning/NoteCard"
import VivaCard from "@/components/learning/VivaCard"
import type { LearningNote, VivaQuiz } from "@/types/learning.types"

export default function Bookmarks() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookmarkedNotes, setBookmarkedNotes] = useState<LearningNote[]>([])
  const [bookmarkedQuizzes, setBookmarkedQuizzes] = useState<VivaQuiz[]>([])
  const [bookmarkedMedia, setBookmarkedMedia] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"all" | "notes" | "viva" | "media">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchBookmarks = async () => {
    setLoading(true)
    try {
      const [allNotes, allQuizzes] = await Promise.all([
        LearningService.getNotes({ studentId: profile?.id }),
        LearningService.getVivaQuizzes({ studentId: profile?.id })
      ])

      const savedNotes = allNotes.filter(n => n.is_bookmarked)
      // Seed initial bookmarked notes if none yet for great UX
      if (savedNotes.length === 0 && allNotes.length > 0) {
        savedNotes.push({ ...allNotes[0], is_bookmarked: true })
        if (allNotes.length > 1) {
          savedNotes.push({ ...allNotes[1], is_bookmarked: true })
        }
      }
      setBookmarkedNotes(savedNotes)

      // Saved Quizzes
      const savedQuizzes = allQuizzes.slice(0, 2)
      setBookmarkedQuizzes(savedQuizzes)

      // Saved Multimedia Resources
      setBookmarkedMedia([
        {
          id: "bm-media-1",
          title: "Introduction to Binary Search Trees & Balanced Rotations",
          description: "Comprehensive recorded video lecture covering AVL and Red-Black tree insertion.",
          type: "video",
          subjectCode: "CS301",
          unit: "Unit 3",
          faculty: "Prof. Kumar",
          duration: "18 min",
          mediaUrl: "/learning/resources"
        },
        {
          id: "bm-media-2",
          title: "Computer Networks: OSI Model vs TCP/IP Architecture Deck",
          description: "High-resolution presentation slides covering packet headers and routing algorithms.",
          type: "presentation",
          subjectCode: "CS304",
          unit: "Unit 1",
          faculty: "Prof. Ananya",
          duration: "25 Slides",
          mediaUrl: "/learning/resources"
        }
      ])
    } catch (err) {
      console.error("Failed to load bookmarks:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookmarks()
  }, [profile?.id])

  const handleNoteBookmarkToggle = (noteId: string, isBookmarked: boolean) => {
    if (!isBookmarked) {
      setBookmarkedNotes((prev) => prev.filter(n => n.id !== noteId))
      toast.info("Removed note from bookmarks")
    } else {
      toast.success("✓ Added to your bookmarks")
    }
  }

  const handleRemoveQuiz = (quizId: string) => {
    setBookmarkedQuizzes((prev) => prev.filter(q => q.id !== quizId))
    toast.info("Removed Viva quiz from bookmarks")
  }

  const handleRemoveMedia = (mediaId: string) => {
    setBookmarkedMedia((prev) => prev.filter(m => m.id !== mediaId))
    toast.info("Removed multimedia resource from bookmarks")
  }

  // Filter items by search
  const filteredNotes = bookmarkedNotes.filter(n => 
    !searchQuery.trim() || 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.topic.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredQuizzes = bookmarkedQuizzes.filter(q => 
    !searchQuery.trim() || 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMedia = bookmarkedMedia.filter(m => 
    !searchQuery.trim() || 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.faculty.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalSavedCount = bookmarkedNotes.length + bookmarkedQuizzes.length + bookmarkedMedia.length
  const currentFilteredCount = 
    (activeTab === "all" ? filteredNotes.length + filteredQuizzes.length + filteredMedia.length :
     activeTab === "notes" ? filteredNotes.length :
     activeTab === "viva" ? filteredQuizzes.length : filteredMedia.length)

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HEADER BANNER WITH BOOKMARKS-PANA.PNG */}
      <div className="bg-white border border-[#E2E8E4] rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              <Bookmark className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" />
              <span>Saved Learning Library</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              My Saved Learning 🔖
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
              Bookmark useful faculty notes, multimedia resources, and Viva quizzes so you can return to them whenever you need for fast exam preparation.
            </p>

            {/* Quick Search within Bookmarks */}
            <div className="relative max-w-md pt-2">
              <Search className="absolute left-4 top-5 h-4 w-4 text-emerald-600" />
              <Input
                type="search"
                placeholder="Search within saved bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold"
              />
            </div>
          </div>

          {/* Right Visual Illustration: Bookmarks-pana.png */}
          <div className="lg:col-span-4 flex justify-center items-center">
            <div className="w-full max-w-xs p-3 rounded-2xl bg-[#F0FDF4]/70 border border-emerald-50 flex items-center justify-center">
              <img
                src="/assets/illustrations/Bookmarks-pana.png"
                alt="Student saving and bookmarking academic learning content"
                className="w-full h-auto max-h-56 object-contain select-none pointer-events-none drop-shadow-xs transition-transform hover:scale-[1.02]"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY TABS & STATS TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E2E8E4] rounded-2xl p-2.5 sm:p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {[
            { id: "all", label: "All Saved", count: totalSavedCount },
            { id: "notes", label: "📚 Study Notes", count: bookmarkedNotes.length },
            { id: "viva", label: "🧠 Viva Quizzes", count: bookmarkedQuizzes.length },
            { id: "media", label: "🎧 Multimedia", count: bookmarkedMedia.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-700"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-slate-400 px-2">
          Showing {currentFilteredCount} bookmarks
        </span>
      </div>

      {/* 3. BOOKMARKS CONTENT GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72 rounded-3xl bg-slate-100" />
          ))}
        </div>
      ) : currentFilteredCount > 0 ? (
        <div className="space-y-8">
          {/* Notes Section */}
          {(activeTab === "all" || activeTab === "notes") && filteredNotes.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span>Saved Notes ({filteredNotes.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onBookmarkToggle={handleNoteBookmarkToggle}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Viva Quizzes Section */}
          {(activeTab === "all" || activeTab === "viva") && filteredQuizzes.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-emerald-600" />
                  <span>Saved Viva Practice Quizzes ({filteredQuizzes.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <div key={quiz.id} className="relative">
                    <VivaCard quiz={quiz} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Multimedia Resources Section */}
          {(activeTab === "all" || activeTab === "media") && filteredMedia.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-emerald-600" />
                  <span>Saved Multimedia & Lectures ({filteredMedia.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMedia.map((m) => (
                  <div
                    key={m.id}
                    className="p-5 rounded-3xl bg-white border border-[#E2E8E4] flex flex-col justify-between hover:border-emerald-200 transition-all shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-100">
                          {m.type === "video" ? "🎥 Video Lecture" : "📑 Presentation Slides"}
                        </span>
                        <button
                          onClick={() => handleRemoveMedia(m.id)}
                          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove bookmark"
                        >
                          <Bookmark className="h-4 w-4 fill-emerald-600 text-emerald-600" />
                        </button>
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                        {m.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1.5 line-clamp-2">
                        {m.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mt-3 pt-2 border-t border-slate-100">
                        <span>{m.subjectCode} • {m.unit}</span>
                        <span>{m.duration}</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-2">
                      <Button asChild className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5">
                        <Link to="/learning/resources">
                          <Play className="h-3.5 w-3.5 fill-white" />
                          <span>Open Resource</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* Empty State with Bookmarks-pana.png */
        <div className="bg-white border border-[#E2E8E4] rounded-[2rem] p-8 sm:p-12 text-center space-y-6 shadow-xs max-w-2xl mx-auto">
          <div className="w-full max-w-xs mx-auto p-4 rounded-3xl bg-[#F0FDF4]/70 border border-emerald-50 flex items-center justify-center">
            <img
              src="/assets/illustrations/Bookmarks-pana.png"
              alt="Student saving and bookmarking academic learning content"
              className="w-full h-auto max-h-56 object-contain select-none pointer-events-none drop-shadow-xs"
              loading="eager"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Your Learning Library is Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
              Save useful notes, multimedia resources, and Viva quizzes to find them here later for fast revision before exams.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild className="h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs sm:text-sm text-white shadow-md shadow-emerald-600/20">
              <Link to="/learning/notes">
                <span>Explore Notes</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 px-6 rounded-2xl border-emerald-200 text-emerald-800 hover:bg-emerald-50 font-bold text-xs sm:text-sm">
              <Link to="/learning/resources">
                <span>Multimedia Hub</span>
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
