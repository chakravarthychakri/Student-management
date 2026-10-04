// @ts-nocheck
import React, { useState, useEffect } from "react"
import { 
  BarChart2, 
  Users, 
  Award, 
  AlertTriangle, 
  Download, 
  CheckCircle2, 
  Search, 
  Sparkles,
  TrendingUp,
  BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"

export default function FacultyAnalytics() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const enrolledStudents = [
    { id: "st-1", name: "Chakravarthy Chakri", rollNo: "22CSE042", section: "CSE-A", notesCompleted: 14, totalNotes: 16, vivaAttempts: 6, avgScore: 88, status: "Excellent" },
    { id: "st-2", name: "Ananya Sharma", rollNo: "22CSE015", section: "CSE-A", notesCompleted: 16, totalNotes: 16, vivaAttempts: 8, avgScore: 92, status: "Excellent" },
    { id: "st-3", name: "Rohan Gupta", rollNo: "22CSE089", section: "CSE-B", notesCompleted: 10, totalNotes: 16, vivaAttempts: 4, avgScore: 74, status: "Good" },
    { id: "st-4", name: "Priya Nair", rollNo: "22CSE104", section: "CSE-A", notesCompleted: 12, totalNotes: 16, vivaAttempts: 5, avgScore: 82, status: "Good" },
    { id: "st-5", name: "Vikram Reddy", rollNo: "22CSE120", section: "CSE-B", notesCompleted: 6, totalNotes: 16, vivaAttempts: 2, avgScore: 58, status: "Needs Support" },
    { id: "st-6", name: "Siddharth Menon", rollNo: "22CSE067", section: "CSE-A", notesCompleted: 15, totalNotes: 16, vivaAttempts: 7, avgScore: 90, status: "Excellent" }
  ]

  const difficultQuestions = [
    { question: "Floyd's Cycle-Finding algorithm time & space complexity", subject: "Data Structures", incorrectRate: "42% Incorrect", unit: "Unit 2" },
    { question: "Boyce-Codd Normal Form (BCNF) Superkey condition test", subject: "DBMS", incorrectRate: "38% Incorrect", unit: "Unit 3" },
    { question: "Belady's Anomaly occurrence under FIFO page replacement", subject: "Operating Systems", incorrectRate: "48% Incorrect", unit: "Unit 4" }
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  const handleExportCSV = () => {
    toast.success("Exported student performance report (CSV)", {
      description: "Class_Learning_Analytics_2026.csv"
    })
  }

  const filteredStudents = enrolledStudents.filter((st) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return st.name.toLowerCase().includes(q) || st.rollNo.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HEADER BANNER */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
            <BarChart2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Class Performance Analytics</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Student Learning & Assessment Insights
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Monitor student completion of curriculum notes, Viva test scores, and identify specific topics requiring classroom reinforcement.
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="rounded-2xl border-emerald-200 text-emerald-800 hover:bg-emerald-50 font-bold text-xs gap-2 shadow-xs shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>Export Analytics Report</span>
        </Button>
      </div>

      {/* 2. SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Active Students</span>
          <div className="text-2xl font-black text-slate-900 mt-1">64 Enrolled</div>
          <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">Across assigned sections</p>
        </div>

        <div className="bg-white border border-green-100 rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Class Viva Average</span>
          <div className="text-2xl font-black text-emerald-800 mt-1">81% Score</div>
          <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">Above standard benchmark</p>
        </div>

        <div className="bg-white border border-blue-100 rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Notes Read Rate</span>
          <div className="text-2xl font-black text-blue-700 mt-1">74% Coverage</div>
          <p className="text-[11px] font-semibold text-blue-600 mt-0.5">Average notes completed</p>
        </div>

        <div className="bg-white border border-amber-100 rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Support Needed</span>
          <div className="text-2xl font-black text-amber-600 mt-1">4 Students</div>
          <p className="text-[11px] font-semibold text-amber-600 mt-0.5">Score &lt; 60%</p>
        </div>
      </div>

      {/* 3. MOST MISSED QUESTIONS & CONCEPT INTERVENTIONS */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Concepts Requiring Classroom Reinforcement
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Based on aggregate Viva quiz question error rates across all attempts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {difficultQuestions.map((dq, i) => (
            <div key={i} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-amber-800">
                <span>{dq.subject}</span>
                <span className="bg-amber-200 px-2 py-0.5 rounded-full">{dq.incorrectRate}</span>
              </div>
              <p className="text-xs font-bold text-slate-900 leading-snug">
                {dq.question}
              </p>
              <span className="text-[11px] font-semibold text-slate-500 block">
                {dq.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. AUTHORIZED STUDENT PERFORMANCE TABLE */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Enrolled Student Roster & Performance
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Only displaying students enrolled in your authorized subjects
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="search"
              placeholder="Search student or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs rounded-xl bg-slate-50 border-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="pb-3 px-3">Student Name</th>
                <th className="pb-3 px-3">Roll Number</th>
                <th className="pb-3 px-3">Section</th>
                <th className="pb-3 px-3">Notes Read</th>
                <th className="pb-3 px-3">Viva Attempts</th>
                <th className="pb-3 px-3">Average Score</th>
                <th className="pb-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    {st.name}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono">
                    {st.rollNo}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                      {st.section}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${Math.round((st.notesCompleted / st.totalNotes) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 font-bold">{st.notesCompleted}/{st.totalNotes}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-800">
                    {st.vivaAttempts} Attempts
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                      st.avgScore >= 80 
                        ? "bg-emerald-50 text-emerald-800" 
                        : st.avgScore >= 60 
                        ? "bg-blue-50 text-blue-800" 
                        : "bg-rose-50 text-rose-800"
                    }`}>
                      {st.avgScore}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                      st.status === "Excellent"
                        ? "bg-emerald-100 text-emerald-800"
                        : st.status === "Good"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {st.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
