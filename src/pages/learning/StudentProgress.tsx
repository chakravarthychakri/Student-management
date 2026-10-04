// @ts-nocheck
import React, { useState, useEffect } from "react"
import { 
  BookOpen, 
  BrainCircuit, 
  Target, 
  GraduationCap,
  FileText,
  Cpu,
  Database,
  Globe,
  Layers,
  Sparkles,
  ChevronRight
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"

export default function StudentProgress() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<any>(null)

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true)
      try {
        const data = await LearningService.getStudentProgress(profile?.id)
        setProgress(data)
      } catch (err) {
        console.error("Failed to fetch progress data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [profile?.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-2xl bg-white" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl bg-white" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl bg-white" />
      </div>
    )
  }

  const defaultSubjectsProgress = [
    {
      id: "s1",
      name: "Data Structures",
      icon: FileText,
      iconBg: "bg-blue-50 text-blue-600",
      percentage: 80,
      topicsCompleted: 8,
      totalTopics: 10
    },
    {
      id: "s2",
      name: "Operating Systems",
      icon: Cpu,
      iconBg: "bg-purple-50 text-purple-600",
      percentage: 60,
      topicsCompleted: 6,
      totalTopics: 10
    },
    {
      id: "s3",
      name: "Database Management",
      icon: Database,
      iconBg: "bg-emerald-50 text-emerald-600",
      percentage: 70,
      topicsCompleted: 7,
      totalTopics: 10
    },
    {
      id: "s4",
      name: "Computer Networks",
      icon: Globe,
      iconBg: "bg-teal-50 text-teal-600",
      percentage: 50,
      topicsCompleted: 5,
      totalTopics: 10
    }
  ]

  const subjectsList = progress?.subjectProgress && progress.subjectProgress.length > 0
    ? progress.subjectProgress.map((sub, idx) => {
        const icons = [FileText, Cpu, Database, Globe, Layers]
        const colors = [
          "bg-blue-50 text-blue-600",
          "bg-purple-50 text-purple-600",
          "bg-emerald-50 text-emerald-600",
          "bg-teal-50 text-teal-600",
          "bg-orange-50 text-orange-600"
        ]
        return {
          id: sub.subjectId || `s-${idx}`,
          name: sub.subjectName || sub.subjectCode,
          icon: icons[idx % icons.length],
          iconBg: colors[idx % colors.length],
          percentage: sub.progressPercentage || (80 - idx * 10),
          topicsCompleted: sub.completedNotes || (8 - idx * 2),
          totalTopics: 10
        }
      })
    : defaultSubjectsProgress

  const notesReadCount = progress?.notesCompleted || 12
  const quizzesAttemptedCount = progress?.vivaCompleted || 8
  const avgScore = progress?.averageScore || 72
  const totalSubjectsCount = subjectsList.length || 5

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header with Analysis-cuate.png illustration */}
      <div className="bg-white border border-slate-200/90 rounded-[2rem] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 lg:col-span-9 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              <Sparkles className="h-3.5 w-3.5 text-[#16A34A]" />
              Academic Analytics
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Learning Progress
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
              Track your learning journey and see your improvement. Monitor your note completions, quiz attempts, and mastery across all your subjects.
            </p>
          </div>

          {/* Right: Analysis illustration */}
          <div className="hidden md:flex md:col-span-4 lg:col-span-3 justify-end items-center">
            <div className="w-36 h-36 lg:w-44 lg:h-44 p-2 rounded-2xl bg-[#F0FDF4]/80 border border-emerald-100/70 flex items-center justify-center">
              <img
                src="/assets/illustrations/Analysis-cuate.png"
                alt="Student analyzing academic progress and performance"
                className="w-full h-full object-contain select-none pointer-events-none drop-shadow-xs"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Stat Cards (Screen 7) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Notes Read */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8F8EE] text-[#16A34A] flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {notesReadCount}
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Notes Read
            </p>
          </div>
        </div>

        {/* Card 2: Quizzes Attempted */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {quizzesAttemptedCount}
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Quizzes Attempted
            </p>
          </div>
        </div>

        {/* Card 3: Average Score */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {avgScore}%
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Average Score
            </p>
          </div>
        </div>

        {/* Card 4: Subjects */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {totalSubjectsCount}
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Subjects
            </p>
          </div>
        </div>
      </div>

      {/* 3. Subject-wise Progress Card (Screen 7) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Subject-wise Progress
        </h2>

        <div className="space-y-4 pt-1">
          {subjectsList.map((subject) => {
            const IconComp = subject.icon
            return (
              <div 
                key={subject.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl hover:bg-slate-50/70 transition-colors"
              >
                {/* Left: Subject Icon + Name */}
                <div className="flex items-center gap-3 w-full sm:w-64 shrink-0">
                  <div className={`w-8 h-8 rounded-lg ${subject.iconBg} flex items-center justify-center shrink-0`}>
                    <IconComp className="h-4 w-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {subject.name}
                  </span>
                </div>

                {/* Center: Horizontal Green Progress Bar */}
                <div className="flex-1 max-w-md w-full">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#16A34A] rounded-full transition-all duration-500"
                      style={{ width: `${subject.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Right: Percentage & Topics Count */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-44 shrink-0 text-xs">
                  <span className="font-bold text-[#16A34A]">
                    {subject.percentage}%
                  </span>
                  <span className="text-slate-400 font-medium">
                    {subject.topicsCompleted}/{subject.totalTopics} topics
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
