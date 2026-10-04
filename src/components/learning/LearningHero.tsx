// @ts-nocheck
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, BookOpen, BrainCircuit, BarChart2, Quote, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LearningHeroProps {
  studentName?: string
  department?: string
  semester?: number
  role?: string
}

export default function LearningHero({
  studentName = "Student",
  department = "Computer Science",
  semester = 4,
  role = "student"
}: LearningHeroProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/learning/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#D7F5E3] via-[#E4F8EC] to-[#E9F9F0] border border-[#C6EDD4] shadow-xs p-6 sm:p-8 lg:p-10 transition-all">
      {/* Soft decorative background glows */}
      <div className="absolute top-0 right-1/3 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none -mt-16" />
      <div className="absolute bottom-0 left-10 w-60 h-60 bg-green-200/30 rounded-full blur-2xl pointer-events-none -mb-10" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* LEFT COLUMN: Welcome, Tagline, Quotation, Search & Action Buttons */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Title & Tagline */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Hello, {studentName} <span className="animate-wave inline-block origin-[70%_70%] select-none ml-1 align-baseline">👋</span>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-600 tracking-wide">
              Welcome to EduNexus <span className="text-emerald-600 font-extrabold">•</span> Learn <span className="text-emerald-600 font-extrabold">•</span> Practice <span className="text-emerald-600 font-extrabold">•</span> Grow
            </p>
          </div>

          {/* Inspiring Quotation */}
          <div className="flex items-center gap-2.5 max-w-xl py-0.5">
            <div className="w-6 h-6 rounded-full bg-emerald-600/15 flex items-center justify-center shrink-0">
              <Quote className="h-3.5 w-3.5 text-emerald-700 rotate-180" />
            </div>
            <p className="text-xs sm:text-[13.5px] font-medium text-slate-700 leading-snug">
              “<span className="font-bold text-emerald-900">Education is the passport to the future</span> — for tomorrow belongs to those who prepare for it today.”
            </p>
          </div>

          {/* Embedded Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl">
            <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 pl-4 border border-slate-200/90 shadow-sm focus-within:border-[#16A34A] transition-colors">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <Input
                type="search"
                placeholder="Search notes, quizzes, subjects..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 text-xs sm:text-sm h-9 p-0 placeholder:text-slate-400 font-medium"
              />
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white shrink-0 shadow-xs"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* 3 Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {/* Button 1: Explore Notes */}
            <button
              type="button"
              onClick={() => navigate("/learning/notes")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              <BookOpen className="h-4 w-4" />
              <span>Explore Notes</span>
            </button>

            {/* Button 2: Practice Viva */}
            <button
              type="button"
              onClick={() => navigate("/learning/viva")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50/80 text-slate-800 hover:text-[#16A34A] border border-slate-200 text-xs font-bold transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              <BrainCircuit className="h-4 w-4 text-purple-600" />
              <span>Practice Viva</span>
            </button>

            {/* Button 3: View Analytics */}
            <button
              type="button"
              onClick={() => navigate("/learning/progress")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50/80 text-slate-800 hover:text-[#16A34A] border border-slate-200 text-xs font-bold transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              <BarChart2 className="h-4 w-4 text-teal-600" />
              <span>View Analytics</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Illustration with floating quote badge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-full max-w-xs sm:max-w-sm flex flex-col items-center">
            {/* Knowledge Today Quote Badge */}
            <div className="absolute top-2 left-0 sm:-left-4 z-20 text-left bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-100 shadow-xs">
              <p className="text-[11px] font-black text-slate-800 leading-tight">
                Knowledge Today.
              </p>
              <p className="text-[10px] font-bold text-emerald-700 leading-tight">
                A Brighter Tomorrow
              </p>
            </div>

            {/* Illustration */}
            <img 
              src="/assets/illustrations/Studying-rafiki.png" 
              alt="Student studying at a desk"
              className="w-full max-h-52 sm:max-h-60 object-contain drop-shadow-xs select-none pointer-events-none"
              loading="eager"
            />

            <p className="text-[11px] font-bold text-slate-500 mt-0.5 tracking-wide">
              “Learn without limits”
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
