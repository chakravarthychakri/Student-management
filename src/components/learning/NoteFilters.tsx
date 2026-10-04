// @ts-nocheck
import React from "react"
import { Search } from "lucide-react"

interface NoteFiltersProps {
  subjects: { id: string; name: string; code: string }[]
  topics?: string[]
  selectedSubject: string
  onSelectSubject: (id: string) => void
  selectedTopic?: string
  onSelectTopic?: (topic: string) => void
  selectedType?: string
  onSelectType?: (type: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onSearchSubmit?: () => void
}

export default function NoteFilters({
  subjects = [],
  topics = [
    "Arrays & Linked Lists",
    "Trees & Graphs",
    "Process Management",
    "Normalization",
    "Computer Networks Basics",
    "SQL Queries",
    "File Systems"
  ],
  selectedSubject,
  onSelectSubject,
  selectedTopic = "all",
  onSelectTopic,
  selectedType = "all",
  onSelectType,
  searchQuery,
  onSearchChange,
  onSearchSubmit
}: NoteFiltersProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearchSubmit) onSearchSubmit()
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3"
    >
      {/* 1. Subject Dropdown */}
      <div className="flex-1 min-w-[140px]">
        <select
          value={selectedSubject}
          onChange={(e) => onSelectSubject(e.target.value)}
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

      {/* 2. Topic Dropdown */}
      <div className="flex-1 min-w-[140px]">
        <select
          value={selectedTopic}
          onChange={(e) => onSelectTopic && onSelectTopic(e.target.value)}
          className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] cursor-pointer"
        >
          <option value="all">All Topics</option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Type Dropdown */}
      <div className="flex-1 min-w-[140px]">
        <select
          value={selectedType}
          onChange={(e) => onSelectType && onSelectType(e.target.value)}
          className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="pdf">PDF Documents</option>
          <option value="rich_text">Interactive Notes</option>
          <option value="video">Video Lectures</option>
        </select>
      </div>

      {/* 4. Search Input + Green Button */}
      <div className="flex-[1.5] min-w-[200px] flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
  )
}
