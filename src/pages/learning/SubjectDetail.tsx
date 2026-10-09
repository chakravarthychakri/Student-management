// @ts-nocheck
import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { 
  ArrowLeft, 
  BookOpen, 
  BrainCircuit, 
  UserCheck, 
  Sparkles, 
  Layers, 
  Award,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"
import NoteCard from "@/components/learning/NoteCard"
import VivaCard from "@/components/learning/VivaCard"
import RoadmapView from "@/components/learning/RoadmapView"
import type { LearningNote, VivaQuiz } from "@/types/learning.types"

export default function SubjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState<any>(null)
  const [notes, setNotes] = useState<LearningNote[]>([])
  const [vivaList, setVivaList] = useState<VivaQuiz[]>([])
  const [progressData, setProgressData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"roadmap" | "notes" | "viva">("roadmap")

  useEffect(() => {
    const fetchSubjectDetails = async () => {
      if (!id) return
      setLoading(true)
      try {
        const [subs, nts, vz, prog] = await Promise.all([
          LearningService.getStudentSubjects(profile?.id),
          LearningService.getNotes({
            subjectId: id,
            studentId: profile?.id,
            studentYear: profile?.role === "student" ? profile?.year : undefined,
            studentSection: profile?.role === "student" ? profile?.section : undefined
          }),
          LearningService.getVivaQuizzes({ subjectId: id, studentId: profile?.id }),
          LearningService.getStudentProgress(profile?.id)
        ])

        const matchedSub = subs.find(s => s.id === id) || subs[0]
        setSubject(matchedSub)
        setNotes(nts)
        setVivaList(vz)
        setProgressData(prog)
      } catch (err) {
        console.error("Failed to load subject details:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubjectDetails()
  }, [id, profile?.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 rounded-3xl bg-emerald-100/50" />
        <Skeleton className="h-96 rounded-3xl bg-white" />
      </div>
    )
  }

  const subjectProg = progressData?.subjectProgress?.find(s => s.subjectId === id)
  const progressPct = subjectProg?.progressPercentage || 0

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back Navigation */}
      <Link
        to="/learning"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Learning Hub</span>
      </Link>

      {/* 1. SUBJECT BANNER */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-100">
              {subject?.code || "CS301"}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Department: {subject?.department || "CSE"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {subject?.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            {subject?.description}
          </p>

          <div className="flex items-center gap-2 pt-1 text-xs font-bold text-slate-600">
            <UserCheck className="h-4 w-4 text-emerald-600" />
            <span>Faculty: {subject?.faculty_name || "Faculty Member"}</span>
          </div>
        </div>

        {/* Progress Pill Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-green-700 text-white min-w-[220px] shadow-md shadow-emerald-700/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              Subject Mastery
            </span>
            <span className="text-xl font-black">{progressPct}%</span>
          </div>

          <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-100 font-medium pt-1">
            <span>{notes.length} Notes</span>
            <span>{vivaList.length} Viva Quizzes</span>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("roadmap")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "roadmap"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Curriculum Roadmap</span>
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "notes"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Study Notes ({notes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("viva")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "viva"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
          }`}
        >
          <BrainCircuit className="h-4 w-4" />
          <span>Viva Quizzes ({vivaList.length})</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === "roadmap" && (
        <RoadmapView
          units={subjectProg?.units || []}
          subjectName={subject?.name}
        />
      )}

      {activeTab === "notes" && (
        notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8E4] rounded-3xl p-12 text-center space-y-3">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-black text-slate-900">No Notes Available Yet</h3>
            <p className="text-xs text-slate-500">Your faculty haven't published notes for this subject yet.</p>
          </div>
        )
      )}

      {activeTab === "viva" && (
        vivaList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vivaList.map((quiz) => (
              <VivaCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8E4] rounded-3xl p-12 text-center space-y-3">
            <BrainCircuit className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-black text-slate-900">No Viva Quizzes Available</h3>
            <p className="text-xs text-slate-500">There are currently no quizzes configured for this subject.</p>
          </div>
        )
      )}
    </div>
  )
}
