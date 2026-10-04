// @ts-nocheck
import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { 
  Headphones, 
  Video, 
  FileText, 
  ExternalLink, 
  Play, 
  Sparkles, 
  Bookmark, 
  Clock, 
  User, 
  Search, 
  Filter, 
  CheckCircle2, 
  X,
  Radio,
  Tv,
  Presentation,
  Volume2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"

interface MultimediaItem {
  id: string
  title: string
  description: string
  type: "video" | "audio" | "presentation" | "link" | "document"
  subject: string
  subjectCode: string
  unit: string
  faculty: string
  duration: string
  mediaUrl: string
  is_bookmarked?: boolean
  is_completed?: boolean
  thumbnail?: string
}

export default function MultimediaResources() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [activeMediaModal, setActiveMediaModal] = useState<MultimediaItem | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  // Seed / Curated multimedia resources
  const [resources, setResources] = useState<MultimediaItem[]>([
    {
      id: "media-1",
      title: "Introduction to Binary Search Trees & Balanced Rotations",
      description: "Comprehensive recorded video lecture covering AVL and Red-Black tree insertion fundamentals.",
      type: "video",
      subject: "Data Structures & Algorithms",
      subjectCode: "CS301",
      unit: "Unit 3",
      faculty: "Prof. Kumar",
      duration: "18 min",
      mediaUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      is_bookmarked: true,
      is_completed: true
    },
    {
      id: "media-2",
      title: "DBMS Normalization (1NF to BCNF) Audio Breakdown",
      description: "Audio discussion explaining functional dependencies and lossless join decomposition with practical examples.",
      type: "audio",
      subject: "Database Management Systems",
      subjectCode: "CS302",
      unit: "Unit 2",
      faculty: "Prof. Sharma",
      duration: "12 min",
      mediaUrl: "https://example.com/audio/dbms-norm.mp3",
      is_bookmarked: false,
      is_completed: false
    },
    {
      id: "media-3",
      title: "Operating Systems: CPU Scheduling Algorithms Deep-Dive",
      description: "Visual walkthrough comparing FCFS, Round Robin, SJF, and Priority Scheduling with Gantt charts.",
      type: "video",
      subject: "Operating Systems",
      subjectCode: "CS303",
      unit: "Unit 2",
      faculty: "Prof. Rao",
      duration: "24 min",
      mediaUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      is_bookmarked: false,
      is_completed: true
    },
    {
      id: "media-4",
      title: "Computer Networks: OSI Model vs TCP/IP Architecture Deck",
      description: "High-resolution presentation slides covering packet headers, routing protocols, and subnet masks.",
      type: "presentation",
      subject: "Computer Networks",
      subjectCode: "CS304",
      unit: "Unit 1",
      faculty: "Prof. Ananya",
      duration: "25 Slides",
      mediaUrl: "https://example.com/slides/networks.pdf",
      is_bookmarked: true,
      is_completed: false
    },
    {
      id: "media-5",
      title: "Interactive Sorting Algorithms Visualizer & Sandbox",
      description: "External interactive sandbox illustrating Quick Sort, Merge Sort, and Heap Sort time complexity in real-time.",
      type: "link",
      subject: "Data Structures & Algorithms",
      subjectCode: "CS301",
      unit: "Unit 4",
      faculty: "Prof. Kumar",
      duration: "Interactive",
      mediaUrl: "https://visualgo.net/en/sorting",
      is_bookmarked: false,
      is_completed: false
    },
    {
      id: "media-6",
      title: "Java Multithreading & Concurrency Podcast Explanation",
      description: "Listen to faculty explain thread synchronization, race conditions, and deadlocks in modern JVM environments.",
      type: "audio",
      subject: "Java & Object Oriented Programming",
      subjectCode: "CS305",
      unit: "Unit 4",
      faculty: "Prof. Verma",
      duration: "15 min",
      mediaUrl: "https://example.com/audio/java-threads.mp3",
      is_bookmarked: true,
      is_completed: false
    }
  ])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(timer)
  }, [])

  const handleToggleBookmark = (id: string) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextVal = !r.is_bookmarked
          if (nextVal) {
            toast.success("✓ Added to your bookmarks")
          } else {
            toast.info("Removed from bookmarks")
          }
          return { ...r, is_bookmarked: nextVal }
        }
        return r
      })
    )
  }

  const handleToggleCompleted = (id: string) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextVal = !r.is_completed
          toast.success(nextVal ? "Marked as completed! 🎯" : "Marked as in-progress")
          return { ...r, is_completed: nextVal }
        }
        return r
      })
    )
  }

  const filteredResources = resources.filter((res) => {
    const matchesTab = activeTab === "all" || res.type === activeTab
    const matchesSubject = selectedSubject === "all" || res.subjectCode === selectedSubject
    const matchesSearch =
      !searchQuery.trim() ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.faculty.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSubject && matchesSearch
  })

  const getMediaBadge = (type: string) => {
    switch (type) {
      case "video":
        return { label: "Video Lecture", icon: Video, bg: "bg-blue-50 text-blue-700 border-blue-100" }
      case "audio":
        return { label: "Audio Podcast", icon: Headphones, bg: "bg-purple-50 text-purple-700 border-purple-100" }
      case "presentation":
        return { label: "Slide Deck", icon: Presentation, bg: "bg-amber-50 text-amber-700 border-amber-100" }
      case "link":
        return { label: "Interactive Tool", icon: ExternalLink, bg: "bg-emerald-50 text-emerald-700 border-emerald-100" }
      default:
        return { label: "Document", icon: FileText, bg: "bg-slate-50 text-slate-700 border-slate-100" }
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO HEADER WITH PODCAST-RAFIKI.PNG */}
      <div className="bg-white border border-[#E2E8E4] rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Multimedia Learning Hub
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Learn Beyond Notes 🎧
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
              Learning doesn't have to stop at a document. Discover audio podcasts, recorded faculty walkthroughs, slide decks, and interactive sandboxes designed to master complex engineering topics.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {[
                { label: "Audio Explanations", icon: "🎧" },
                { label: "Recorded Lectures", icon: "🎥" },
                { label: "Topic Walkthroughs", icon: "▶️" },
                { label: "Concept Discussions", icon: "💡" }
              ].map((pill) => (
                <div key={pill.label} className="p-2.5 rounded-xl bg-[#F0FDF4] border border-emerald-100/80 text-[11px] font-bold text-emerald-900 flex items-center gap-2">
                  <span>{pill.icon}</span>
                  <span className="truncate">{pill.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Illustration */}
          <div className="lg:col-span-4 flex justify-center items-center">
            <div className="w-full max-w-xs p-3 rounded-2xl bg-[#F0FDF4]/70 border border-emerald-50 flex items-center justify-center">
              <img
                src="/assets/illustrations/Podcast-rafiki.png"
                alt="Students learning from podcasts and multimedia educational resources"
                className="w-full h-auto max-h-56 object-contain select-none pointer-events-none drop-shadow-xs transition-transform hover:scale-[1.02]"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-emerald-600" />
            <Input
              type="search"
              placeholder="Search lectures, audio topics, or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-auto h-11 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
          >
            <option value="all">All Subjects</option>
            <option value="CS301">CS301 - Data Structures</option>
            <option value="CS302">CS302 - DBMS</option>
            <option value="CS303">CS303 - Operating Systems</option>
            <option value="CS304">CS304 - Networks</option>
            <option value="CS305">CS305 - Java OOP</option>
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { id: "all", label: "All Formats" },
            { id: "video", label: "🎥 Videos", icon: Video },
            { id: "audio", label: "🎧 Audio Podcasts", icon: Headphones },
            { id: "presentation", label: "📑 Presentations", icon: Presentation },
            { id: "link", label: "🔗 Interactive Tools", icon: ExternalLink }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MULTIMEDIA GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 rounded-3xl bg-slate-100" />
          ))}
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const badge = getMediaBadge(res.type)
            const BadgeIcon = badge.icon

            return (
              <div
                key={res.id}
                className="bg-white border border-[#E2E8E4] rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-emerald-200"
              >
                <div>
                  {/* Top Badges & Bookmark */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${badge.bg}`}>
                      <BadgeIcon className="h-3.5 w-3.5" />
                      <span>{badge.label}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(res.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        res.is_bookmarked
                          ? "bg-amber-50 text-amber-500 hover:bg-amber-100"
                          : "bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                      }`}
                      title={res.is_bookmarked ? "Remove bookmark" : "Save bookmark"}
                    >
                      <Bookmark className={`h-4 w-4 ${res.is_bookmarked ? "fill-amber-500" : ""}`} />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>

                  {/* Academic Context */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-600">
                      <span>{res.subjectCode} • {res.unit}</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{res.duration}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                      <User className="h-3 w-3 text-emerald-600" />
                      <span>{res.faculty}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100">
                  <Button
                    onClick={() => {
                      if (res.type === "link") {
                        window.open(res.mediaUrl, "_blank")
                      } else {
                        setActiveMediaModal(res)
                      }
                    }}
                    className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs"
                  >
                    {res.type === "video" ? (
                      <>
                        <Play className="h-3.5 w-3.5 fill-white" />
                        <span>Watch Lecture</span>
                      </>
                    ) : res.type === "audio" ? (
                      <>
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Listen Audio</span>
                      </>
                    ) : res.type === "presentation" ? (
                      <>
                        <Presentation className="h-3.5 w-3.5" />
                        <span>View Slides</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Launch Sandbox</span>
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleToggleCompleted(res.id)}
                    className={`p-2.5 rounded-2xl border transition-colors ${
                      res.is_completed
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-400 border-slate-200 hover:text-emerald-700 hover:bg-emerald-50"
                    }`}
                    title={res.is_completed ? "Completed" : "Mark as completed"}
                  >
                    <CheckCircle2 className={`h-4 w-4 ${res.is_completed ? "fill-emerald-600 text-white" : ""}`} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8E4] rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <Headphones className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-900">
            No Multimedia Resources Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Try switching filter categories or clearing the search query to see available faculty multimedia.
          </p>
        </div>
      )}

      {/* MEDIA PLAYER / PREVIEW MODAL */}
      {activeMediaModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black uppercase">
                  {activeMediaModal.subjectCode} • {activeMediaModal.unit}
                </span>
                <span className="text-xs text-slate-400 font-bold">{activeMediaModal.duration}</span>
              </div>
              <button
                onClick={() => setActiveMediaModal(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {activeMediaModal.title}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Faculty: {activeMediaModal.faculty}
              </p>
            </div>

            {/* Media Player Simulation Container */}
            <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-4 text-white text-center space-y-4">
              {activeMediaModal.type === "video" ? (
                <div className="aspect-video w-full bg-slate-950 rounded-xl flex flex-col items-center justify-center gap-3 p-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 fill-white ml-1" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Video Player Ready: {activeMediaModal.title}
                  </p>
                </div>
              ) : activeMediaModal.type === "audio" ? (
                <div className="py-8 px-4 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg">
                    <Headphones className="h-8 w-8" />
                  </div>
                  <div className="w-full max-w-md space-y-2">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-1/3 rounded-full" />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>04:12</span>
                      <span>{activeMediaModal.duration}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 px-4 flex flex-col items-center justify-center gap-3">
                  <Presentation className="h-12 w-12 text-emerald-400" />
                  <p className="text-xs text-slate-300">
                    Presentation Deck • {activeMediaModal.duration}
                  </p>
                  <Button
                    onClick={() => toast.success("Slides downloaded / opened in viewer")}
                    className="rounded-xl bg-emerald-600 text-white font-bold text-xs"
                  >
                    Open Full Slide Viewer
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  handleToggleBookmark(activeMediaModal.id)
                  setActiveMediaModal((prev) => prev ? { ...prev, is_bookmarked: !prev.is_bookmarked } : null)
                }}
                className="rounded-2xl text-xs font-bold gap-1.5"
              >
                <Bookmark className={`h-4 w-4 ${activeMediaModal.is_bookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
                <span>{activeMediaModal.is_bookmarked ? "Saved in Bookmarks" : "Save Bookmark"}</span>
              </Button>

              <Button
                onClick={() => {
                  handleToggleCompleted(activeMediaModal.id)
                  setActiveMediaModal(null)
                }}
                className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6"
              >
                Done & Mark Finished
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
