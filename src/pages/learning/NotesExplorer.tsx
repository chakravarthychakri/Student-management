// @ts-nocheck
import React, { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { LayoutGrid, List, FolderOpen, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"
import NoteCard from "@/components/learning/NoteCard"
import NoteFilters from "@/components/learning/NoteFilters"
import type { LearningNote } from "@/types/learning.types"

export default function NotesExplorer() {
  const { profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<LearningNote[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("subject") || "all")
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get("topic") || "all")
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "all")

  useEffect(() => {
    const fetchInit = async () => {
      const subs = await LearningService.getStudentSubjects(profile?.id)
      setSubjects(subs)
    }
    fetchInit()
  }, [profile?.id])

  useEffect(() => {
    const fetchFilteredNotes = async () => {
      setLoading(true)
      try {
        const data = await LearningService.getNotes({
          subjectId: selectedSubject,
          search: searchQuery,
          studentId: profile?.id
        })
        
        let filtered = data
        if (selectedTopic !== "all") {
          filtered = filtered.filter(n => (n.topic || "").toLowerCase().includes(selectedTopic.toLowerCase()))
        }
        if (selectedType !== "all") {
          filtered = filtered.filter(n => n.content_type === selectedType)
        }
        
        setNotes(filtered)
      } catch (err) {
        console.error("Failed to fetch notes:", err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchFilteredNotes()
    }, 150)

    return () => clearTimeout(timer)
  }, [selectedSubject, selectedTopic, selectedType, searchQuery, profile?.id])

  const handleClearAll = () => {
    setSearchQuery("")
    setSelectedSubject("all")
    setSelectedTopic("all")
    setSelectedType("all")
    setSearchParams({})
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Page Header with Research paper-pana.png illustration */}
      <div className="bg-white border border-slate-200/90 rounded-[2rem] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 lg:col-span-9 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              <Sparkles className="h-3.5 w-3.5 text-[#16A34A]" />
              Study Library
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Subject Notes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
              Explore and learn from faculty uploaded notes. Access curriculum breakdowns, reading guides, and study materials for your engineering courses.
            </p>
          </div>

          {/* Right: Research paper illustration */}
          <div className="hidden md:flex md:col-span-4 lg:col-span-3 justify-end items-center">
            <div className="w-36 h-36 lg:w-44 lg:h-44 p-2 rounded-2xl bg-[#F0FDF4]/80 border border-emerald-100/70 flex items-center justify-center">
              <img
                src="/assets/illustrations/Research paper-pana.png"
                alt="Student studying academic notes and research papers"
                className="w-full h-full object-contain select-none pointer-events-none drop-shadow-xs"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar (Screen 3: Dropdowns + Search) */}
      <NoteFilters
        subjects={subjects}
        selectedSubject={selectedSubject}
        onSelectSubject={setSelectedSubject}
        selectedTopic={selectedTopic}
        onSelectTopic={setSelectedTopic}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={() => {}}
      />

      {/* 3. Notes Count & View Mode Switcher */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Notes ({notes.length})
        </h2>

        {/* Grid / List Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-[#16A34A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-[#16A34A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* 4. Notes Display Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl bg-white border border-slate-100" />
          ))}
        </div>
      ) : notes.length > 0 ? (
        <div className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
            : "space-y-3"
        }>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} viewMode={viewMode} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#16A34A] flex items-center justify-center mx-auto">
            <FolderOpen className="h-7 w-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              No Notes Found
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              We couldn't find any notes matching your current filter criteria.
            </p>
          </div>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded-xl bg-[#16A34A] text-white font-bold text-xs hover:bg-[#15803D] transition-colors shadow-xs"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
