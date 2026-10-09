// @ts-nocheck
import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { 
  BookOpen, 
  BrainCircuit, 
  Bookmark, 
  BarChart2, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Flame, 
  ChevronRight,
  Search,
  Headphones,
  Video,
  Presentation,
  ExternalLink,
  Star,
  Layers,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"
import LearningHero from "@/components/learning/LearningHero"
import SubjectCard from "@/components/learning/SubjectCard"
import NoteCard from "@/components/learning/NoteCard"
import VivaCard from "@/components/learning/VivaCard"
import LearningStats from "@/components/learning/LearningStats"
import type { LearningNote, VivaQuiz } from "@/types/learning.types"

export default function StudentHome() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<any[]>([])
  const [notes, setNotes] = useState<LearningNote[]>([])
  const [quizzes, setQuizzes] = useState<VivaQuiz[]>([])
  const [progressData, setProgressData] = useState<any>(null)
  const [homeSearchInput, setHomeSearchInput] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [subs, nts, vz, prog] = await Promise.all([
          LearningService.getStudentSubjects(profile?.id),
          LearningService.getNotes({
            studentId: profile?.id,
            studentYear: profile?.role === "student" ? profile?.year : undefined,
            studentSection: profile?.role === "student" ? profile?.section : undefined
          }),
          LearningService.getVivaQuizzes({ studentId: profile?.id }),
          LearningService.getStudentProgress(profile?.id)
        ])

        setSubjects(subs)
        setNotes(nts)
        setQuizzes(vz)
        setProgressData(prog)
      } catch (err) {
        console.error("Error loading EduNexus dashboard:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [profile?.id])

  const handleHomeSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (homeSearchInput.trim()) {
      navigate(`/learning/search?q=${encodeURIComponent(homeSearchInput.trim())}`)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-[2rem] bg-emerald-100/50" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-3xl bg-emerald-50" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-3xl bg-slate-100" />
          <Skeleton className="h-64 rounded-3xl bg-slate-100" />
          <Skeleton className="h-64 rounded-3xl bg-slate-100" />
        </div>
      </div>
    )
  }

  const inProgressNotes = notes.filter(n => !n.is_completed).slice(0, 2)
  const continueNote = inProgressNotes.length > 0 ? inProgressNotes[0] : (notes.length > 0 ? notes[0] : null)
  const recentNotes = notes.slice(0, 3)
  const recommendedQuizzes = quizzes.slice(0, 2)
  const bookmarkedNotes = notes.filter(n => n.is_bookmarked).slice(0, 4)

  return (
    <div className="space-y-12 animate-in fade-in duration-300 pb-10">
      {/* 2. HERO SECTION (Studying-rafiki.png — IMAGE RIGHT) */}
      <LearningHero
        studentName={profile?.full_name || "Student"}
        department={profile?.department || "Computer Science"}
        semester={profile?.year ? profile.year * 2 : 4}
        role={profile?.role || "student"}
      />

      {/* 3. QUICK ACTIONS (4 Feature Cards matching Screen 2) */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Browse Notes */}
          <Link
            to="/learning/notes"
            className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#E8F8EE] text-[#16A34A] flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Browse Notes
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Access subject-wise notes shared by your faculty
                </p>
              </div>
            </div>
          </Link>

          {/* Card 2: Take Viva */}
          <Link
            to="/learning/viva"
            className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                  Take Viva
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Practice quizzes and strengthen your concepts
                </p>
              </div>
            </div>
          </Link>

          {/* Card 3: Track Progress */}
          <Link
            to="/learning/progress"
            className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BarChart2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                  Track Progress
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Monitor your learning journey
                </p>
              </div>
            </div>
          </Link>

          {/* Card 4: Saved Content */}
          <Link
            to="/learning/bookmarks"
            className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Bookmark className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                  Saved Content
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  View your bookmarked notes and quizzes
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. MY SUBJECTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>My Subjects</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Synchronized directly with your EduTrack academic database
            </p>
          </div>
          <Link
            to="/learning/notes"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>View All Notes</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {subjects.map((subject) => {
            const subNotes = notes.filter((n) => n.subject_id === subject.id)
            const subViva = quizzes.filter((q) => q.subject_id === subject.id)
            const subProg = progressData?.subjectProgress?.find((p: any) => p.subjectId === subject.id)
            return (
              <SubjectCard
                key={subject.id}
                id={subject.id}
                code={subject.code}
                name={subject.name}
                description={subject.description}
                facultyName={subject.faculty_name}
                notesCount={subNotes.length}
                vivaCount={subViva.length}
                progressPercentage={subProg?.progressPercentage || 0}
              />
            )
          })}
        </div>
      </section>

      {/* 5. EXPLORE LEARNING RESOURCES (Research-paper-pana.png — IMAGE LEFT) */}
      <section className="bg-white border border-[#E2E8E4] rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT: Research paper illustration */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none flex items-center justify-center p-3 rounded-2xl bg-[#F0FDF4]/70 border border-emerald-50">
              <img
                src="/assets/illustrations/Research paper-pana.png"
                alt="Student exploring academic research and learning resources"
                className="w-full max-h-60 sm:max-h-72 lg:max-h-80 object-contain drop-shadow-xs select-none pointer-events-none transition-transform duration-300 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          </div>

          {/* RIGHT: Notes info */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Academic Resources
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Explore Your Learning Resources
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
              Access notes and study materials shared by your faculty. Find curriculum notes, reading guides, and unit breakdowns for all your engineering subjects.
            </p>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 block">
                Find resources based on:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  "Subject",
                  "Unit",
                  "Topic",
                  "Faculty",
                  "Semester",
                  "Difficulty"
                ].map((item) => (
                  <div 
                    key={item} 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0FDF4] border border-emerald-100/80 text-xs font-semibold text-emerald-900"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3">
              <Button asChild className="h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 text-xs sm:text-sm gap-2">
                <Link to="/learning/notes">
                  <span>Browse Notes →</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. RECENTLY ADDED NOTES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Recently Added Notes
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Curated and published by your department faculty members
            </p>
          </div>
          <Link
            to="/learning/notes"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>View All ({notes.length})</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-3xl bg-slate-50/70 border border-slate-200/70 text-slate-400 font-medium text-xs">
            No lecture notes uploaded yet. Your professors will publish notes for your subjects soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </section>

      {/* 7. MULTIMEDIA LEARNING (Podcast-rafiki.png — IMAGE RIGHT) */}
      <section className="bg-white border border-[#E2E8E4] rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT: Multimedia Description & Features */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              <Headphones className="h-3.5 w-3.5 text-emerald-600" />
              Multimedia Hub
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Learn Beyond Notes 🎧
            </h2>

            <p className="text-sm font-extrabold text-emerald-800">
              Learning doesn't have to stop at a document.
            </p>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
              Discover rich multimedia learning resources provided by your faculty for interactive visual and audio comprehension:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {[
                { title: "🎧 Audio explanations", desc: "Short conceptual podcasts" },
                { title: "🎥 Recorded lectures", desc: "Full unit classroom videos" },
                { title: "▶️ Topic walkthroughs", desc: "Code and circuit demonstrations" },
                { title: "💡 Concept discussions", desc: "Q&A and viva breakdown sessions" }
              ].map((item) => (
                <div key={item.title} className="p-3 rounded-2xl bg-[#F0FDF4] border border-emerald-100 text-xs font-bold text-emerald-950">
                  <span className="block text-slate-900">{item.title}</span>
                  <span className="text-[11px] font-medium text-slate-500">{item.desc}</span>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <Button asChild className="h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 text-xs sm:text-sm gap-2">
                <Link to="/learning/resources">
                  <span>Explore Resources →</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* RIGHT: Podcast illustration */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none flex items-center justify-center p-3 rounded-2xl bg-[#F0FDF4]/70 border border-emerald-50">
              <img
                src="/assets/illustrations/Podcast-rafiki.png"
                alt="Students learning from podcasts and multimedia educational resources"
                className="w-full max-h-60 sm:max-h-72 lg:max-h-80 object-contain drop-shadow-xs select-none pointer-events-none transition-transform duration-300 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 8. PRACTICE YOUR KNOWLEDGE (VIVA CARDS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Practice Your Knowledge 🧠</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Timed Viva quizzes tailored to test theoretical and lab concepts
            </p>
          </div>
          <Link
            to="/learning/viva"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>All Viva Quizzes</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {recommendedQuizzes.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-3xl bg-slate-50/70 border border-slate-200/70 text-slate-400 font-medium text-xs">
            No Viva quizzes published yet. Practice quizzes will appear here once assigned by faculty.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {recommendedQuizzes.map((quiz) => (
              <VivaCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </section>

      {/* 9. SEARCH & EXPLORE (Search-rafiki.png — IMAGE LEFT) */}
      <section className="bg-white border border-[#E2E8E4] rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT: Search illustration */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none flex items-center justify-center p-3 rounded-2xl bg-[#F0FDF4]/70 border border-emerald-50">
              <img
                src="/assets/illustrations/Search-rafiki.png"
                alt="Students discovering notes, topics and quizzes using search"
                className="w-full max-h-60 sm:max-h-72 lg:max-h-80 object-contain drop-shadow-xs select-none pointer-events-none transition-transform duration-300 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          </div>

          {/* RIGHT: Search explanation & search form */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              <Search className="h-3.5 w-3.5 text-emerald-600" />
              Search & Discovery
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Find What You Need
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
              Search across your learning world instantly. Find notes, viva quizzes, topics, subjects, and faculty lecture decks with unified indexing.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {["📚 Notes", "🧠 Viva", "📘 Subjects", "📑 Topics", "👨‍🏫 Faculty Resources"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  {tag}
                </span>
              ))}
            </div>

            {/* Quick Search Bar */}
            <form onSubmit={handleHomeSearch} className="pt-2">
              <div className="flex items-center gap-2 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-4 w-4 text-emerald-600" />
                  <Input
                    type="search"
                    placeholder="Search notes, topics, subjects or quizzes..."
                    value={homeSearchInput}
                    onChange={(e) => setHomeSearchInput(e.target.value)}
                    className="w-full pl-11 pr-4 h-12 bg-[#F0FDF4]/70 border border-emerald-200 rounded-2xl text-xs font-semibold focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
                <Button type="submit" className="h-12 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-xs">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 10. RECENTLY SAVED / BOOKMARKS (Bookmarks-pana.png — IMAGE RIGHT) */}
      <section className="bg-white border border-[#E2E8E4] rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT: Bookmarks info & list preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              <Bookmark className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" />
              My Saved Learning
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Save What Matters
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
              Bookmark useful notes, resources and Viva quizzes so you can return to them whenever you need for rapid revision before exams.
            </p>

            {/* Quick Saved Items List */}
            <div className="space-y-2 pt-1 max-w-lg">
              <span className="text-xs font-bold text-slate-700 block">Recently Saved:</span>
              <div className="space-y-1.5">
                {[
                  { title: "📘 Introduction to Data Structures", type: "Note", subject: "CS301" },
                  { title: "📘 DBMS Normalization (1NF to BCNF)", type: "Note", subject: "CS302" },
                  { title: "🧠 Data Structures Basics Viva Quiz", type: "Viva", subject: "CS301" },
                  { title: "🎥 Operating Systems CPU Scheduling", type: "Video", subject: "CS303" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0FDF4] border border-emerald-100 text-xs font-semibold text-slate-800">
                    <span className="truncate">{item.title}</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 ml-2">
                      {item.subject}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3">
              <Button asChild className="h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 text-xs sm:text-sm gap-2">
                <Link to="/learning/bookmarks">
                  <span>View All Saved →</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* RIGHT: Bookmarks illustration */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none flex items-center justify-center p-3 rounded-2xl bg-[#F0FDF4]/70 border border-emerald-50">
              <img
                src="/assets/illustrations/Bookmarks-pana.png"
                alt="Student saving and bookmarking academic learning content"
                className="w-full max-h-60 sm:max-h-72 lg:max-h-80 object-contain drop-shadow-xs select-none pointer-events-none transition-transform duration-300 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 11. LEARNING PROGRESS (Analysis-cuate.png — IMAGE LEFT) */}
      <section className="bg-white border border-[#E2E8E4] rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT: Analysis illustration */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none flex items-center justify-center p-3 rounded-2xl bg-[#F0FDF4]/70 border border-emerald-50">
              <img
                src="/assets/illustrations/Analysis-cuate.png"
                alt="Student analyzing academic progress and performance"
                className="w-full max-h-60 sm:max-h-72 lg:max-h-80 object-contain drop-shadow-xs select-none pointer-events-none transition-transform duration-300 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          </div>

          {/* RIGHT: Progress description & checks */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Academic Tracking
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Track Your Learning Journey
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
              See how you're progressing across subjects and topics. Get deep insights into your study habits, quiz performance, and milestone streaks.
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="space-y-2">
                {[
                  "Notes completed",
                  "Viva attempts",
                  "Average scores",
                  "Subject progress",
                  "Learning streak"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3">
              <Button asChild className="h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 text-xs sm:text-sm gap-2">
                <Link to="/learning/progress">
                  <span>View My Progress →</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTINUED STUDY & STATS SUMMARY */}
      <div className="space-y-6">
        <LearningStats
          notesCompleted={progressData?.notesCompleted || 0}
          totalNotes={progressData?.totalNotes || 0}
          vivaCompleted={progressData?.vivaCompleted || 0}
          averageScore={progressData?.averageScore || 0}
          streakDays={progressData?.learningStreak?.current_streak || 0}
        />

        {/* Continue Learning Card */}
        {continueNote && (
          <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Continue Learning
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Unit: {continueNote.unit}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {continueNote.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 mt-2 line-clamp-2 font-medium">
                {continueNote.description}
              </p>

              {/* Progress Slider */}
              <div className="mt-5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Subject: {continueNote.subject?.name || "Subject"}</span>
                  <span className="text-emerald-700 font-extrabold">
                    {continueNote.progress_percentage || 0}% Completed
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${continueNote.progress_percentage || 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-5 mt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span>~{continueNote.estimated_minutes} min remaining</span>
              </div>

              <Button asChild className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs gap-1.5 text-white shadow-md shadow-emerald-600/20 px-5">
                <Link to={`/learning/notes/${continueNote.id}`}>
                  <span>Resume Study</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

