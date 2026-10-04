// @ts-nocheck
import React, { useState, useEffect } from "react"
import { Search, BrainCircuit, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"
import VivaCard from "@/components/learning/VivaCard"
import type { VivaQuiz } from "@/types/learning.types"

export default function VivaExplorer() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [quizzes, setQuizzes] = useState<VivaQuiz[]>([])
  const [subjects, setSubjects] = useState<any[]>([])

  // Filters State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedTopic, setSelectedTopic] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")

  const defaultTopics = [
    "Arrays & Linked Lists",
    "Trees & Graphs",
    "Process Scheduling",
    "Normalization",
    "Computer Networks Basics",
    "SQL Queries",
    "File Systems"
  ]

  useEffect(() => {
    const fetchInit = async () => {
      const subs = await LearningService.getStudentSubjects(profile?.id)
      setSubjects(subs)
    }
    fetchInit()
  }, [profile?.id])

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true)
      try {
        const data = await LearningService.getVivaQuizzes({
          subjectId: selectedSubject,
          difficulty: selectedDifficulty,
          search: searchQuery,
          studentId: profile?.id
        })
        
        let filtered = data
        if (selectedTopic !== "all") {
          filtered = filtered.filter(q => (q.topic || "").toLowerCase().includes(selectedTopic.toLowerCase()))
        }
        
        setQuizzes(filtered)
      } catch (err) {
        console.error("Failed to load viva quizzes:", err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchQuizzes()
    }, 150)

    return () => clearTimeout(timer)
  }, [selectedSubject, selectedTopic, selectedDifficulty, searchQuery, profile?.id])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner with Podcast-rafiki.png illustration */}
      <div className="bg-white border border-slate-200/90 rounded-[2rem] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 lg:col-span-9 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              <Sparkles className="h-3.5 w-3.5 text-[#16A34A]" />
              Assessment Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Viva - Practice and Test Your Knowledge
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
              Attempt interactive quizzes based on your subjects and topics. Test your understanding, prepare for oral examinations, and get instant performance insights.
            </p>
          </div>

          {/* Right: Illustration */}
          <div className="hidden md:flex md:col-span-4 lg:col-span-3 justify-end items-center">
            <div className="w-36 h-36 lg:w-44 lg:h-44 p-2 rounded-2xl bg-[#F0FDF4]/80 border border-emerald-100/70 flex items-center justify-center">
              <img
                src="/assets/illustrations/Podcast-rafiki.png"
                alt="Students practicing viva quizzes and assessments"
                className="w-full h-full object-contain select-none pointer-events-none drop-shadow-xs"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar (Screen 5: 3 Dropdowns + Search Input + Green Button) */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3"
      >
        {/* Subject Dropdown */}
        <div className="flex-1 min-w-[140px]">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.code}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Dropdown */}
        <div className="flex-1 min-w-[140px]">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] cursor-pointer"
          >
            <option value="all">All Topics</option>
            {defaultTopics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Dropdown */}
        <div className="flex-1 min-w-[140px]">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] cursor-pointer"
          >
            <option value="all">All Difficulty</option>
            <option value="Beginner">Easy</option>
            <option value="Intermediate">Medium</option>
            <option value="Advanced">Hard</option>
          </select>
        </div>

        {/* Search Input + Green Button */}
        <div className="flex-[1.5] min-w-[200px] flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
            />
          </div>

          <button
            type="submit"
            className="h-11 w-11 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center justify-center shrink-0 transition-colors shadow-xs"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* 3. Section Title (Screen 5: Available Quizzes (12)) */}
      <div className="pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Available Quizzes ({quizzes.length})
        </h2>
      </div>

      {/* 4. Quizzes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl bg-white border border-slate-100" />
          ))}
        </div>
      ) : quizzes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {quizzes.map((quiz) => (
            <VivaCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <BrainCircuit className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            No Quizzes Available
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            There are currently no quizzes matching your selected criteria.
          </p>
        </div>
      )}
    </div>
  )
}
