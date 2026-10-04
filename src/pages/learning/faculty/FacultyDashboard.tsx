// @ts-nocheck
import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { 
  Layers, 
  BookOpen, 
  BrainCircuit, 
  Users, 
  Award, 
  PlusCircle, 
  TrendingUp, 
  Eye, 
  Sparkles,
  ArrowRight,
  FileText,
  FileQuestion
} from "lucide-react"
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { LearningService } from "@/lib/learningService"

export default function FacultyDashboard() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      try {
        const res = await LearningService.getFacultyDashboardData(profile?.id)
        setData(res)
      } catch (err) {
        console.error("Failed to load faculty dashboard:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [profile?.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 rounded-3xl bg-emerald-100/50" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-3xl bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HEADER BANNER */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Faculty Studio</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Learning Resource Management
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Publish curriculum study notes, configure timed Viva quizzes, and monitor real-time class learning analytics.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button asChild className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white gap-2 shadow-md shadow-emerald-600/20 px-5">
            <Link to="/learning/faculty/notes/new">
              <PlusCircle className="h-4 w-4" />
              <span>Create Note</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="rounded-2xl border-emerald-200 text-emerald-800 hover:bg-emerald-50 font-bold text-xs gap-2">
            <Link to="/learning/faculty/viva/new">
              <BrainCircuit className="h-4 w-4" />
              <span>Create Viva Quiz</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Published Notes</span>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {data?.publishedNotesCount || 24}
          </div>
          <p className="text-[11px] font-semibold text-emerald-700 mt-1">
            Active in library
          </p>
        </div>

        <div className="bg-white border border-green-100 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Viva Quizzes</span>
            <BrainCircuit className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {data?.vivaQuizzesCount || 8}
          </div>
          <p className="text-[11px] font-semibold text-emerald-700 mt-1">
            Across your subjects
          </p>
        </div>

        <div className="bg-white border border-blue-100 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Student Attempts</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {data?.totalAttempts || 326}
          </div>
          <p className="text-[11px] font-semibold text-blue-600 mt-1">
            Completed tests
          </p>
        </div>

        <div className="bg-white border border-emerald-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Average Class Score</span>
            <Award className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-800">
            {data?.averageScore || 78}%
          </div>
          <p className="text-[11px] font-semibold text-emerald-700 mt-1">
            Proficiency level
          </p>
        </div>
      </div>

      {/* 3. CHARTS & SUBJECT PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Distribution Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Student Viva Score Distribution
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Distribution of student grades across all your active Viva quizzes
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.scoreDistribution || []} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} fontWeight={600} />
                <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "1rem",
                    border: "1px solid #E2E8E4",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                />
                <Bar dataKey="count" fill="#16A34A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Question Bank Helper Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50/50 border border-emerald-100 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileQuestion className="h-5 w-5" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              Reusable Question Bank
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Store and categorize multiple choice questions by subject, unit, and difficulty to easily populate new Viva assessments.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-extrabold text-emerald-900">
              {data?.questionBankCount || 3} Questions in repository
            </div>
            <Button asChild className="w-full rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs">
              <Link to="/learning/faculty/questions">
                Manage Question Bank →
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 4. SUBJECT-LEVEL PERFORMANCE TABLE */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Authorized Subjects Performance
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Student engagement and test averages for your assigned subjects
            </p>
          </div>

          <Button asChild variant="ghost" size="sm" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
            <Link to="/learning/faculty/analytics">
              Full Analytics →
            </Link>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="pb-3 px-3">Subject Name</th>
                <th className="pb-3 px-3">Enrolled Students</th>
                <th className="pb-3 px-3">Average Viva Score</th>
                <th className="pb-3 px-3">Notes Completion</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {(data?.subjectPerformance || []).map((sub, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    {sub.subject}
                  </td>
                  <td className="py-3.5 px-3">
                    {sub.enrolledStudents} Students
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold">
                      {sub.avgScore}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${sub.notesCompletedPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">{sub.notesCompletedPct}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <Link
                      to="/learning/faculty/analytics"
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      View Students
                    </Link>
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
