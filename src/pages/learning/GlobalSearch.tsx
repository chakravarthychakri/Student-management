// @ts-nocheck
import React, { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { 
  Search, 
  BookOpen, 
  BrainCircuit, 
  Layers, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  FolderOpen
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"
import NoteCard from "@/components/learning/NoteCard"
import VivaCard from "@/components/learning/VivaCard"

export default function GlobalSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const { profile } = useAuth()

  const [query, setQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    notes: any[]
    viva: any[]
    subjects: any[]
    topics: any[]
  }>({
    notes: [],
    viva: [],
    subjects: [],
    topics: []
  })

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (searchStr: string) => {
    if (!searchStr.trim()) {
      setResults({ notes: [], viva: [], subjects: [], topics: [] })
      return
    }
    setLoading(true)
    try {
      const data = await LearningService.globalSearch(searchStr, profile?.id)
      setResults(data)
    } catch (err) {
      console.error("Search error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    setSearchParams(val ? { q: val } : {})
    performSearch(val)
  }

  const popularKeywords = [
    "Linked Lists",
    "Normalization",
    "CPU Scheduling",
    "Java OOP",
    "TCP/IP",
    "Binary Trees"
  ]

  const totalResults = results.notes.length + results.viva.length + results.subjects.length + results.topics.length

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. SEARCH HERO WITH SEARCH-RAFIKI.PNG */}
      <div className="bg-white border border-[#E2E8E4] rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        <div className={`grid grid-cols-1 ${!query.trim() ? "lg:grid-cols-12" : ""} gap-8 items-center`}>
          <div className={`${!query.trim() ? "lg:col-span-7" : "max-w-3xl mx-auto"} space-y-4`}>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>EduNexus Discovery</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              What are you looking for?
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Search notes, topics, subjects, multimedia resources, and Viva quizzes.
            </p>

            {/* Big Search Input */}
            <div className="relative pt-2">
              <Search className="absolute left-4 top-5 h-5 w-5 text-emerald-600" />
              <Input
                type="search"
                placeholder="Search notes, topics, subjects, or quizzes..."
                value={query}
                onChange={handleInputChange}
                autoFocus
                className="w-full pl-12 pr-4 h-14 bg-emerald-50/40 border-2 border-emerald-100 focus:border-emerald-500 rounded-2xl text-xs sm:text-sm font-semibold shadow-2xs"
              />
            </div>

            {/* Popular Keyword Suggestions */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-bold text-slate-400">Popular:</span>
              {popularKeywords.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => {
                    setQuery(kw)
                    setSearchParams({ q: kw })
                    performSearch(kw)
                  }}
                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-colors"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Search Landing Illustration (Shown when before search) */}
          {!query.trim() && (
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="w-full max-w-sm p-4 rounded-2xl bg-[#F0FDF4]/70 border border-emerald-50 flex items-center justify-center">
                <img
                  src="/assets/illustrations/Search-rafiki.png"
                  alt="Students discovering notes, topics and quizzes using search"
                  className="w-full h-auto max-h-64 object-contain select-none pointer-events-none drop-shadow-xs transition-transform hover:scale-[1.02]"
                  loading="eager"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. SEARCH RESULTS SECTION */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-3xl bg-slate-100" />
          ))}
        </div>
      ) : query.trim() ? (
        totalResults > 0 ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
              <span>Found {totalResults} matching results for "{query}"</span>
            </div>

            {/* Notes Category */}
            {results.notes.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  <span>Study Notes ({results.notes.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {results.notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              </section>
            )}

            {/* Viva Quizzes Category */}
            {results.viva.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-emerald-600" />
                  <span>Viva Practice Quizzes ({results.viva.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.viva.map((quiz) => (
                    <VivaCard key={quiz.id} quiz={quiz} />
                  ))}
                </div>
              </section>
            )}

            {/* Topics Category */}
            {results.topics.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <span>Matching Curriculum Topics ({results.topics.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.topics.map((t, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white border border-[#E2E8E4] flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {t.subject}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {t.name}
                        </h4>
                      </div>

                      {t.noteId && (
                        <Button asChild size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                          <Link to={`/learning/notes/${t.noteId}`}>
                            Open Note
                          </Link>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8E4] rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <FolderOpen className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-black text-slate-900">
              No Results Found for "{query}"
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Try searching with broader engineering keywords, subject codes (e.g. CS301), or topic names.
            </p>
          </div>
        )
      ) : null}
    </div>
  )
}
