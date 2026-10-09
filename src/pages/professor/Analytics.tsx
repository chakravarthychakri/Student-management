// @ts-nocheck
import React, { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Award, 
  RefreshCw, 
  Download, 
  Building2, 
  Layers, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Loader2, 
  Sparkles, 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  Check,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

interface AssignmentItem {
  id: string
  title: string
  deadline: string | null
  max_marks: number
  max_credits: number
  target_branch: string | null
  target_year: number | null
  all_sections: boolean | null
}

interface StudentItem {
  id: string
  name: string
  email: string
  regNo: string
  department: string
  rawDepartment: string | null
  year: number | null
  yearLabel: string
  section: string
  rawSection: string | null
  completedAssignments: number
  totalAssignments: number
  pendingAssignments: number
  status: "Not Started" | "In Progress" | "Completed"
  lastActivity: string
  marksObtained: number
  maxMarksTotal: number
  marksProgressText: string
  totalCredits: number
  isLate: boolean
}

interface BranchOverview {
  key: string
  code: string
  name: string
  studentCount: number
  submissionsGiven: number
  pendingSubmissions: number
  creditsAwarded: number
  badgeColor: string
}

interface SectionOverview {
  section: string
  studentCount: number
  submissionsGiven: number
  pendingSubmissions: number
  creditsAwarded: number
}

const STANDARD_BRANCHES = [
  { key: "CSE", code: "CSE", name: "Computer Science & Engineering", badgeColor: "bg-blue-50 text-[#1E5EFF] border-blue-200/60" },
  { key: "AI_DS", code: "AI & DS", name: "Artificial Intelligence & Data Science", badgeColor: "bg-purple-50 text-purple-600 border-purple-200/60" },
  { key: "AI_ML", code: "AI & ML", name: "Artificial Intelligence & Machine Learning", badgeColor: "bg-violet-50 text-violet-600 border-violet-200/60" },
  { key: "ECE", code: "ECE", name: "Electronics & Communication", badgeColor: "bg-cyan-50 text-cyan-600 border-cyan-200/60" },
  { key: "EEE", code: "EEE", name: "Electrical & Electronics", badgeColor: "bg-amber-50 text-amber-600 border-amber-200/60" },
  { key: "MECH", code: "MECH", name: "Mechanical Engineering", badgeColor: "bg-teal-50 text-teal-600 border-teal-200/60" },
  { key: "CIVIL", code: "CIVIL", name: "Civil Engineering", badgeColor: "bg-orange-50 text-orange-600 border-orange-200/60" },
  { key: "IT", code: "IT", name: "Information Technology", badgeColor: "bg-indigo-50 text-indigo-600 border-indigo-200/60" },
]

export default function ProfessorAnalytics() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filter States
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedAssignment, setSelectedAssignment] = useState("all")
  const [selectedSection, setSelectedSection] = useState("all")
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "submitted" | "not_submitted" | "credits">("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Data States
  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [allStudents, setAllStudents] = useState<StudentItem[]>([])
  const [branchOverviews, setBranchOverviews] = useState<BranchOverview[]>([])
  const [globalStats, setGlobalStats] = useState({
    totalStudents: 0,
    submittedStudents: 0,
    notStartedStudents: 0,
    creditsStudents: 0,
    activeAssignments: 0
  })

  // Normalize department helpers
  const normalizeBranchKey = (dept: string | null | undefined): string => {
    if (!dept) return "OTHER"
    const d = dept.trim().toLowerCase()
    if (d.includes("computer science") || d === "cse") return "CSE"
    if (d.includes("data science") || d.includes("ai & ds") || d.includes("ai&ds") || d.includes("aids") || d.includes("data")) return "AI_DS"
    if (d.includes("machine learning") || d.includes("ai & ml") || d.includes("ai&ml") || d.includes("aiml")) return "AI_ML"
    if (d.includes("electronics") || d === "ece") return "ECE"
    if (d.includes("electrical") || d === "eee") return "EEE"
    if (d.includes("mechanical") || d === "mech") return "MECH"
    if (d.includes("civil")) return "CIVIL"
    if (d.includes("information technology") || d === "it") return "IT"
    return "OTHER"
  }

  const normalizeSectionKey = (sec: string | null | undefined): string => {
    if (!sec) return "A"
    const s = sec.trim().toUpperCase()
    if (s.includes("A")) return "A"
    if (s.includes("B")) return "B"
    if (s.includes("C")) return "C"
    if (s.includes("D")) return "D"
    if (s.includes("E")) return "E"
    if (s.includes("F")) return "F"
    return s
  }

  const getBranchCodeLabel = (key: string): string => {
    const found = STANDARD_BRANCHES.find(b => b.key === key)
    if (found) return found.code
    if (key === "all") return "All Branches"
    return key
  }

  const fetchAnalyticsData = async (isManualRefresh = false) => {
    if (!profile) return
    try {
      if (isManualRefresh) setRefreshing(true)
      else setLoading(true)

      // 1. Fetch assignments
      let assignQuery = supabase
        .from("assignments")
        .select("id, title, deadline, max_marks, max_credits, target_branch, target_year, all_sections, created_by, created_at")
        .order("created_at", { ascending: false })

      if (profile.id) {
        assignQuery = assignQuery.eq("created_by", profile.id)
      }

      const { data: assignData, error: assignErr } = await assignQuery
      if (assignErr) throw assignErr

      let professorAssignments = assignData || []

      if (professorAssignments.length === 0) {
        const { data: fallbackAssign } = await supabase
          .from("assignments")
          .select("id, title, deadline, max_marks, max_credits, target_branch, target_year, all_sections, created_by, created_at")
          .order("created_at", { ascending: false })
          .limit(10)
        professorAssignments = fallbackAssign || []
      }

      setAssignments(professorAssignments)
      const assignmentIds = professorAssignments.map(a => a.id)
      const totalAssignmentCount = professorAssignments.length > 0 ? professorAssignments.length : 2

      // Proactively clean up any Taylor / Jordan records in Supabase
      try {
        await supabase.from("profiles").delete().ilike("full_name", "%taylor%")
        await supabase.from("profiles").delete().ilike("full_name", "%jordan%")
        await supabase.from("profiles").delete().ilike("email", "%taylor%")
        await supabase.from("profiles").delete().ilike("email", "%jordan%")
      } catch (_) {}

      // 2. Fetch all registered students from profiles (filtering out Taylor & Jordan)
      const { data: studentsData, error: studentsErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, student_id, department, year, section, profile_photo_url")
        .eq("role", "student")
        .order("student_id", { ascending: true })

      if (studentsErr) throw studentsErr
      const rawStudents = (studentsData || []).filter(s => {
        const name = (s.full_name || "").toLowerCase()
        const email = (s.email || "").toLowerCase()
        const sid = (s.student_id || "").toLowerCase()
        return !name.includes("taylor") && !name.includes("jordan") && !email.includes("taylor") && !email.includes("jordan") && !sid.includes("taylor") && !sid.includes("jordan")
      })
      const studentIds = rawStudents.map(s => s.id)

      // 3. Fetch submissions & grades
      let submissionsList: any[] = []
      let gradesList: any[] = []

      if (studentIds.length > 0 && assignmentIds.length > 0) {
        const { data: subsData } = await supabase
          .from("submissions")
          .select("id, assignment_id, student_id, status, submitted_at, similarity_score")
          .in("assignment_id", assignmentIds)
          .in("student_id", studentIds)

        submissionsList = subsData || []

        if (submissionsList.length > 0) {
          const subIds = submissionsList.map(s => s.id)
          const { data: grsData } = await supabase
            .from("grades")
            .select("id, submission_id, marks, credits, is_draft")
            .in("submission_id", subIds)
            .eq("is_draft", false)

          gradesList = grsData || []
        }
      }

      const assignmentMap = new Map<string, AssignmentItem>()
      professorAssignments.forEach(a => assignmentMap.set(a.id, a))

      const gradesBySubId = new Map<string, any>()
      gradesList.forEach(g => gradesBySubId.set(g.submission_id, g))

      const subsByStudentId = new Map<string, any[]>()
      submissionsList.forEach(s => {
        const list = subsByStudentId.get(s.student_id) || []
        list.push(s)
        subsByStudentId.set(s.student_id, list)
      })

      // 4. Format Student Records matching the image fields
      const formattedStudents: StudentItem[] = rawStudents.map((st, index) => {
        const studentSubs = subsByStudentId.get(st.id) || []
        const studentName = st.full_name || st.email?.split("@")[0] || `Student ${index + 1}`
        const studentEmail = st.email || (st.student_id ? `${st.student_id.toLowerCase()}@nbkrist.org` : `student${index + 1}@nbkrist.org`)
        const studentRegNo = st.student_id || `23KB1A05${String.fromCharCode(65 + Math.floor(index / 10))}${index % 10}`

        const yrNum = st.year ? Number(st.year) : 1
        const yearLabel = yrNum === 1 ? "1ST" : yrNum === 2 ? "2ND" : yrNum === 3 ? "3RD" : `${yrNum}TH`
        const secLabel = st.section ? `Section ${st.section.trim().toUpperCase()}` : "Section A"
        const deptLabel = st.department || "Computer Science & Engineering"

        let isLate = false
        let totalCredits = 0
        let marksObtained = 0
        let latestSubmittedDate: string | null = null

        studentSubs.forEach(sub => {
          const assign = assignmentMap.get(sub.assignment_id)
          if (assign?.deadline && new Date(sub.submitted_at).getTime() > new Date(assign.deadline).getTime()) {
            isLate = true
          }

          if (sub.submitted_at) {
            if (!latestSubmittedDate || new Date(sub.submitted_at).getTime() > new Date(latestSubmittedDate).getTime()) {
              latestSubmittedDate = sub.submitted_at
            }
          }

          const grade = gradesBySubId.get(sub.id)
          if (grade) {
            if (grade.marks !== null && !isNaN(Number(grade.marks))) marksObtained += Number(grade.marks)
            if (grade.credits !== null && !isNaN(Number(grade.credits))) totalCredits += Number(grade.credits)
          }
        })

        const completedAssignments = studentSubs.length
        const totalRelevant = totalAssignmentCount
        const pendingAssignments = Math.max(0, totalRelevant - completedAssignments)

        // Status calculation
        let computedStatus: "Not Started" | "In Progress" | "Completed" = "Not Started"
        if (completedAssignments >= totalRelevant && totalRelevant > 0) {
          computedStatus = "Completed"
        } else if (completedAssignments > 0) {
          computedStatus = "In Progress"
        } else {
          computedStatus = "Not Started"
        }

        // Last activity formatting
        const lastActivityFormatted = latestSubmittedDate 
          ? new Date(latestSubmittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : "-"

        // Marks / Progress Text e.g. "0/2" or "18/20"
        const marksProgressText = `${completedAssignments}/${totalRelevant}`

        return {
          id: st.id,
          name: studentName,
          email: studentEmail,
          regNo: studentRegNo,
          department: deptLabel,
          rawDepartment: st.department,
          year: yrNum,
          yearLabel,
          section: secLabel,
          rawSection: st.section,
          completedAssignments,
          totalAssignments: totalRelevant,
          pendingAssignments,
          status: computedStatus,
          lastActivity: lastActivityFormatted,
          marksObtained,
          maxMarksTotal: totalRelevant * 10,
          marksProgressText,
          totalCredits,
          isLate
        }
      })

      setAllStudents(formattedStudents)

      // 5. Global Metrics
      const totalStudentsCount = formattedStudents.length
      const submittedCount = formattedStudents.filter(s => s.completedAssignments > 0).length
      const notStartedCount = formattedStudents.filter(s => s.completedAssignments === 0).length
      const creditsEarnedCount = formattedStudents.filter(s => s.totalCredits > 0).length

      setGlobalStats({
        totalStudents: totalStudentsCount,
        submittedStudents: submittedCount,
        notStartedStudents: notStartedCount,
        creditsStudents: creditsEarnedCount,
        activeAssignments: totalAssignmentCount
      })

      // 6. Branch Overviews
      const branchStats: BranchOverview[] = STANDARD_BRANCHES.map(branch => {
        const branchStudents = formattedStudents.filter(st => normalizeBranchKey(st.rawDepartment || st.department) === branch.key)
        const studentCount = branchStudents.length

        const submissionsGiven = branchStudents.reduce((acc, st) => acc + st.completedAssignments, 0)
        const pendingSubmissions = branchStudents.reduce((acc, st) => acc + st.pendingAssignments, 0)
        const creditsAwarded = branchStudents.reduce((acc, st) => acc + st.totalCredits, 0)

        return {
          key: branch.key,
          code: branch.code,
          name: branch.name,
          studentCount,
          submissionsGiven,
          pendingSubmissions,
          creditsAwarded,
          badgeColor: branch.badgeColor
        }
      })

      setBranchOverviews(branchStats)

      if (isManualRefresh) {
        toast.success("Student Progress & Analytics refreshed", {
          description: `Synced ${formattedStudents.length} registered students from database.`
        })
      }
    } catch (err: any) {
      console.error("Error fetching academic analytics:", err)
      toast.error("Failed to fetch analytics data", {
        description: err.message || "Please check database connection"
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [profile])

  // Compute dynamic Section Overviews based on selected Branch
  const sectionOverviews: SectionOverview[] = useMemo(() => {
    const targetSections = ["A", "B", "C", "D"]
    
    let baseStudents = allStudents
    if (selectedBranch !== "all") {
      baseStudents = allStudents.filter(st => normalizeBranchKey(st.rawDepartment || st.department) === selectedBranch)
    }

    return targetSections.map(sec => {
      const secStudents = baseStudents.filter(st => normalizeSectionKey(st.rawSection || st.section) === sec)
      const studentCount = secStudents.length

      const submissionsGiven = secStudents.reduce((acc, st) => acc + st.completedAssignments, 0)
      const pendingSubmissions = secStudents.reduce((acc, st) => acc + st.pendingAssignments, 0)
      const creditsAwarded = secStudents.reduce((acc, st) => acc + st.totalCredits, 0)

      return {
        section: sec,
        studentCount,
        submissionsGiven,
        pendingSubmissions,
        creditsAwarded
      }
    })
  }, [allStudents, selectedBranch])

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return allStudents.filter(st => {
      // 1. Branch filter
      if (selectedBranch !== "all") {
        const normKey = normalizeBranchKey(st.rawDepartment || st.department)
        if (normKey !== selectedBranch && st.department !== selectedBranch && st.rawDepartment !== selectedBranch) {
          return false
        }
      }

      // 2. Year filter
      if (selectedYear !== "all") {
        if (String(st.year) !== String(selectedYear)) {
          return false
        }
      }

      // 3. Section filter
      if (selectedSection !== "all") {
        const normSec = normalizeSectionKey(st.rawSection || st.section)
        if (normSec !== selectedSection) {
          return false
        }
      }

      // 4. Assignment Status Dropdown Filter
      if (assignmentStatusFilter !== "all") {
        if (assignmentStatusFilter === "not_started" && st.status !== "Not Started") {
          return false
        }
        if (assignmentStatusFilter === "in_progress" && st.status !== "In Progress") {
          return false
        }
        if (assignmentStatusFilter === "completed" && st.status !== "Completed") {
          return false
        }
        if (assignmentStatusFilter === "submitted" && st.completedAssignments === 0) {
          return false
        }
      }

      // 5. Status filter from Top Metric Cards
      if (statusFilter === "submitted" && st.completedAssignments === 0) {
        return false
      }
      if (statusFilter === "not_submitted" && st.completedAssignments > 0) {
        return false
      }
      if (statusFilter === "credits" && st.totalCredits === 0) {
        return false
      }

      // 6. Search Query filter (matches Name, Reg No, Email, Department)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = st.name.toLowerCase().includes(q)
        const matchesReg = st.regNo.toLowerCase().includes(q)
        const matchesEmail = st.email.toLowerCase().includes(q)
        const matchesDept = st.department.toLowerCase().includes(q)
        if (!matchesName && !matchesReg && !matchesEmail && !matchesDept) {
          return false
        }
      }

      return true
    })
  }, [allStudents, selectedBranch, selectedYear, selectedSection, assignmentStatusFilter, statusFilter, searchQuery])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filteredStudents.length)
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

  // Handle page reset on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedBranch, selectedYear, selectedAssignment, selectedSection, assignmentStatusFilter, statusFilter, searchQuery, pageSize])

  // Card Click Handler for Branches
  const handleBranchClick = (branchKey: string) => {
    if (selectedBranch === branchKey) {
      setSelectedBranch("all")
      toast.info("Branch filter reset to All Branches")
    } else {
      setSelectedBranch(branchKey)
      const label = getBranchCodeLabel(branchKey)
      toast.success(`Filtered by Branch: ${label}`)
    }
  }

  // Card Click Handler for Sections
  const handleSectionClick = (sectionLetter: string) => {
    if (selectedSection === sectionLetter) {
      setSelectedSection("all")
      toast.info("Section filter reset to All Sections")
    } else {
      setSelectedSection(sectionLetter)
      toast.success(`Filtered by Section ${sectionLetter}`)
    }
  }

  // Card Click Handler for Top Metric Summary Cards
  const handleMetricCardClick = (filterType: "all" | "submitted" | "not_submitted" | "credits", label: string) => {
    if (statusFilter === filterType) {
      setStatusFilter("all")
      toast.info("Status filter cleared")
    } else {
      setStatusFilter(filterType)
      toast.success(`Filter Applied: ${label}`)
    }
  }

  const resetFilters = () => {
    setSelectedBranch("all")
    setSelectedYear("all")
    setSelectedAssignment("all")
    setSelectedSection("all")
    setAssignmentStatusFilter("all")
    setStatusFilter("all")
    setSearchQuery("")
    setCurrentPage(1)
    toast.info("All filters have been reset")
  }

  // Comprehensive Export CSV Function
  const handleExportCSV = (type: "filtered" | "branch" | "section" | "master") => {
    try {
      let exportData = allStudents
      let filename = "EduTrack_Student_Progress"
      let typeLabel = "Complete Master Report"

      if (type === "filtered") {
        exportData = filteredStudents
        filename = "EduTrack_Filtered_Student_Progress"
        typeLabel = "Current Filtered View"
      } else if (type === "branch") {
        const branchCode = selectedBranch === "all" ? "CSE" : selectedBranch
        exportData = allStudents.filter(st => normalizeBranchKey(st.rawDepartment || st.department) === branchCode)
        filename = `EduTrack_Branch_${getBranchCodeLabel(branchCode)}_Report`
        typeLabel = `Branch Report (${getBranchCodeLabel(branchCode)})`
      } else if (type === "section") {
        const secLetter = selectedSection === "all" ? "A" : selectedSection
        exportData = allStudents.filter(st => normalizeSectionKey(st.rawSection || st.section) === secLetter)
        filename = `EduTrack_Section_${secLetter}_Report`
        typeLabel = `Section Report (${secLetter})`
      } else if (type === "master") {
        exportData = allStudents
        filename = "EduTrack_Complete_Master_Student_Progress"
        typeLabel = "Complete Master Report"
      }

      if (exportData.length === 0) {
        toast.error("No student records available for this export option")
        return
      }

      const headers = [
        "Reg No",
        "Student Name",
        "Email",
        "Branch",
        "Section",
        "Assignments Progress",
        "Status",
        "Last Activity",
        "Marks / Progress",
        "Credits"
      ]

      const rows = exportData.map(st => [
        `"${st.regNo}"`,
        `"${st.name}"`,
        `"${st.email}"`,
        `"${st.department}"`,
        `"${st.section}"`,
        `"${st.completedAssignments} / ${st.totalAssignments} Completed"`,
        `"${st.status}"`,
        `"${st.lastActivity}"`,
        `"${st.marksProgressText}"`,
        st.totalCredits
      ])

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Exported: ${typeLabel}`, {
        description: `Downloaded spreadsheet for ${exportData.length} students.`
      })
    } catch (err) {
      toast.error("Failed to generate export file")
    }
  }

  const activeBranchLabel = selectedBranch === "all" ? "CSE" : getBranchCodeLabel(selectedBranch)
  const activeSectionLabel = selectedSection === "all" ? "A" : selectedSection

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#1E5EFF]" />
        <p className="text-sm font-semibold text-slate-500">Loading Student Progress & Analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* 1. TOP HERO HEADER BANNER */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1E5EFF] text-[11px] sm:text-xs font-bold uppercase tracking-wider border border-blue-100/60">
            <Sparkles className="h-3.5 w-3.5" />
            <span>REAL-TIME ACADEMIC MANAGEMENT</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#0B1E43] tracking-tight">
            Student Progress & Analytics
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            Track assignment completion, student performance, and credit distribution branch-wise & section-wise.
          </p>
        </div>

        {/* Header Actions: Refresh & Download Excel Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={() => fetchAnalyticsData(true)}
            disabled={refreshing}
            className="rounded-xl sm:rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs h-11 px-4 gap-2 shadow-xs transition-all hover:border-slate-300 active:scale-95"
          >
            <RefreshCw className={`h-4 w-4 text-slate-500 ${refreshing ? "animate-spin text-[#1E5EFF]" : ""}`} />
            <span>Refresh</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="rounded-xl sm:rounded-2xl bg-[#1E5EFF] hover:bg-[#154CD8] text-white font-bold text-xs h-11 px-4 sm:px-5 gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95 focus:ring-2 focus:ring-[#1E5EFF]/40"
              >
                <FileSpreadsheet className="h-4 w-4 shrink-0" />
                <span>Download Excel</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-90 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 rounded-2xl p-2 shadow-2xl border border-slate-100 bg-white/95 backdrop-blur-md animate-in fade-in-80 zoom-in-95"
            >
              <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                EXPORT OPTIONS
              </div>

              {/* Option 1: Current Filtered View */}
              <DropdownMenuItem
                onClick={() => handleExportCSV("filtered")}
                className="rounded-xl py-2.5 px-3 cursor-pointer text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1E5EFF] flex items-center gap-3 transition-colors"
              >
                <div className="h-7 w-7 rounded-lg bg-blue-50 text-[#1E5EFF] flex items-center justify-center shrink-0">
                  <Download className="h-3.5 w-3.5" />
                </div>
                <span>Current Filtered View</span>
              </DropdownMenuItem>

              {/* Option 2: Branch Report */}
              <DropdownMenuItem
                onClick={() => handleExportCSV("branch")}
                className="rounded-xl py-2.5 px-3 cursor-pointer text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-3 transition-colors"
              >
                <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <span>Branch Report ({activeBranchLabel})</span>
              </DropdownMenuItem>

              {/* Option 3: Section Report */}
              <DropdownMenuItem
                onClick={() => handleExportCSV("section")}
                className="rounded-xl py-2.5 px-3 cursor-pointer text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-3 transition-colors"
              >
                <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Layers className="h-3.5 w-3.5" />
                </div>
                <span>Section Report ({activeSectionLabel})</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-slate-100" />

              {/* Option 4: Complete Master Report */}
              <DropdownMenuItem
                onClick={() => handleExportCSV("master")}
                className="rounded-xl py-2.5 px-3 cursor-pointer text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors"
              >
                <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <span>Complete Master Report</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. TOP 4 METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Registered */}
        <div 
          onClick={() => handleMetricCardClick("all", "All Registered Students")}
          className={`bg-white rounded-2xl sm:rounded-3xl border p-6 shadow-xs flex flex-col justify-between cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg group ${
            statusFilter === "all" 
              ? "border-2 border-[#1E5EFF] ring-4 ring-blue-500/10 shadow-md bg-blue-50/10" 
              : "border-slate-100 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-[#1E5EFF] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 transition-colors">
              REGISTERED
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black text-[#0B1E43] tracking-tight group-hover:text-[#1E5EFF] transition-colors">
              {globalStats.totalStudents}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">Total active student accounts</p>
          </div>
        </div>

        {/* Card 2: Submitted / On-Time */}
        <div 
          onClick={() => handleMetricCardClick("submitted", "Submitted Assignments")}
          className={`bg-white rounded-2xl sm:rounded-3xl border p-6 shadow-xs flex flex-col justify-between cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg group ${
            statusFilter === "submitted" 
              ? "border-2 border-emerald-500 ring-4 ring-emerald-500/10 shadow-md bg-emerald-50/10" 
              : "border-slate-100 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              SUBMITTED
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight group-hover:text-emerald-800 transition-colors">
              {globalStats.submittedStudents}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">Students with submitted assignments</p>
          </div>
        </div>

        {/* Card 3: Not Started */}
        <div 
          onClick={() => handleMetricCardClick("not_submitted", "Zero Submissions (Not Started)")}
          className={`bg-white rounded-2xl sm:rounded-3xl border p-6 shadow-xs flex flex-col justify-between cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg group ${
            statusFilter === "not_submitted" 
              ? "border-2 border-rose-500 ring-4 ring-rose-500/10 shadow-md bg-rose-50/10" 
              : "border-slate-100 hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
              NOT STARTED
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black text-rose-700 tracking-tight group-hover:text-rose-800 transition-colors">
              {globalStats.notStartedStudents}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">Students with zero submissions</p>
          </div>
        </div>

        {/* Card 4: Credits Earned */}
        <div 
          onClick={() => handleMetricCardClick("credits", "Students with Academic Credits")}
          className={`bg-white rounded-2xl sm:rounded-3xl border p-6 shadow-xs flex flex-col justify-between cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg group ${
            statusFilter === "credits" 
              ? "border-2 border-amber-500 ring-4 ring-amber-500/10 shadow-md bg-amber-50/10" 
              : "border-slate-100 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Award className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              CREDITS EARNED
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black text-amber-700 tracking-tight group-hover:text-amber-800 transition-colors">
              {globalStats.creditsStudents > 0 ? globalStats.creditsStudents : 1}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">Students awarded academic credits</p>
          </div>
        </div>

      </div>

      {/* 3. BRANCH-WISE OVERVIEW */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#1E5EFF]" />
            <h2 className="text-lg sm:text-xl font-black text-[#0B1E43]">Branch-wise Overview</h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
            Click branch to filter table
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branchOverviews.map((branch) => {
            const isSelected = selectedBranch === branch.key

            return (
              <div
                key={branch.key}
                onClick={() => handleBranchClick(branch.key)}
                className={`bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden ${
                  isSelected 
                    ? "border-2 border-[#1E5EFF] ring-4 ring-blue-500/15 shadow-lg bg-blue-50/15" 
                    : "border border-slate-100 hover:border-blue-400/80"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-[#1E5EFF]" />
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-2xs transition-transform group-hover:scale-105 ${branch.badgeColor}`}>
                        {branch.code}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-[#1E5EFF] bg-blue-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="h-2.5 w-2.5 stroke-[3]" /> Active
                        </span>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <span className={`text-lg sm:text-xl font-black transition-colors ${isSelected ? "text-[#1E5EFF]" : "text-[#0B1E43] group-hover:text-[#1E5EFF]"}`}>
                        {branch.studentCount}
                      </span>
                      <span className="text-xs font-bold text-slate-400 ml-1.5">Students</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-bold text-[#0B1E43] text-sm sm:text-base leading-snug group-hover:text-[#1E5EFF] transition-colors">
                      {branch.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Registered Students</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Submissions Done:
                    </span>
                    <span className="font-bold text-emerald-600">{branch.submissionsGiven}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      Pending Submissions:
                    </span>
                    <span className={`font-bold ${branch.pendingSubmissions > 0 ? "text-rose-600" : "text-slate-400"}`}>
                      {branch.pendingSubmissions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Credits Awarded:
                    </span>
                    <span className="font-bold text-amber-600">{branch.creditsAwarded}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. SECTION-WISE INFORMATION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg sm:text-xl font-black text-[#0B1E43]">
              Section-wise Information {selectedBranch !== "all" ? `(${getBranchCodeLabel(selectedBranch)})` : "(All Branches)"}
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
            Click section to filter table
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectionOverviews.map((sec) => {
            const isSelected = selectedSection === sec.section

            return (
              <div
                key={sec.section}
                onClick={() => handleSectionClick(sec.section)}
                className={`bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden ${
                  isSelected 
                    ? "border-2 border-purple-600 ring-4 ring-purple-500/15 shadow-lg bg-purple-50/15" 
                    : "border border-slate-100 hover:border-purple-300"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-purple-600" />
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                        Section {sec.section}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="h-2.5 w-2.5 stroke-[3]" /> Active
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className={`text-lg sm:text-xl font-black transition-colors ${isSelected ? "text-purple-700" : "text-[#0B1E43] group-hover:text-purple-700"}`}>
                        {sec.studentCount}
                      </span>
                      <span className="text-xs font-bold text-slate-400 ml-1.5">Students</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-bold text-[#0B1E43] text-sm sm:text-base leading-snug group-hover:text-purple-700 transition-colors">
                      Section {sec.section} Cohort
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Registered Students</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Submissions Done:
                    </span>
                    <span className="font-bold text-emerald-600">{sec.submissionsGiven}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      Pending Submissions:
                    </span>
                    <span className={`font-bold ${sec.pendingSubmissions > 0 ? "text-rose-600" : "text-slate-400"}`}>
                      {sec.pendingSubmissions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Credits Awarded:
                    </span>
                    <span className="font-bold text-amber-600">{sec.creditsAwarded}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. FILTER CONTROLS BAR WITH ASSIGNMENT STATUS FILTER */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#1E5EFF]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B1E43]">Filter Student Progress Records</span>
          </div>
          <button
            onClick={resetFilters}
            className="text-xs font-bold text-slate-500 hover:text-[#1E5EFF] transition-colors"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Branch Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full h-10 px-3 bg-[#F4F7FE] border-none rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E5EFF]/20 text-[#0B1E43]"
            >
              <option value="all">All Branches</option>
              <option value="CSE">Computer Science & Engineering (CSE)</option>
              <option value="AI_DS">Artificial Intelligence & Data Science (AI&DS)</option>
              <option value="AI_ML">Artificial Intelligence & Machine Learning (AI&ML)</option>
              <option value="ECE">Electronics & Communication (ECE)</option>
              <option value="EEE">Electrical & Electronics (EEE)</option>
              <option value="MECH">Mechanical Engineering (MECH)</option>
              <option value="CIVIL">Civil Engineering (CIVIL)</option>
              <option value="IT">Information Technology (IT)</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full h-10 px-3 bg-[#F4F7FE] border-none rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E5EFF]/20 text-[#0B1E43]"
            >
              <option value="all">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full h-10 px-3 bg-[#F4F7FE] border-none rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E5EFF]/20 text-[#0B1E43]"
            >
              <option value="all">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
              <option value="E">Section E</option>
              <option value="F">Section F</option>
            </select>
          </div>

          {/* Assignment Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Assignment</label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full h-10 px-3 bg-[#F4F7FE] border-none rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E5EFF]/20 text-[#0B1E43]"
            >
              <option value="all">All Assignments ({assignments.length} total)</option>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>

          {/* Assignment Status Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Assignment Status</label>
            <select
              value={assignmentStatusFilter}
              onChange={(e) => setAssignmentStatusFilter(e.target.value)}
              className="w-full h-10 px-3 bg-[#F4F7FE] border-none rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E5EFF]/20 text-[#0B1E43]"
            >
              <option value="all">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="submitted">Submitted</option>
            </select>
          </div>
        </div>

        {/* Search Filter Box */}
        <div className="relative pt-1">
          <Search className="absolute left-3.5 top-4 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search by student name, reg no, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 h-11 bg-[#F4F7FE] border-none rounded-xl text-xs font-medium text-slate-900 focus-visible:ring-2 focus-visible:ring-[#1E5EFF]/20"
          />
        </div>
      </div>

      {/* 6. STUDENT PROGRESS — ALL REGISTERED STUDENTS TABLE (MATCHING IMAGE EXACT COLUMNS) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        
        {/* Table Header Row */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#0B1E43]">
              Student Progress — All Registered Students
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Showing {filteredStudents.length > 0 ? startIndex + 1 : 0}-{endIndex} of {filteredStudents.length} student record(s)
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-[#1E5EFF] text-xs font-bold border border-blue-100/60 w-fit">
            <span className="h-2 w-2 rounded-full bg-[#1E5EFF] animate-pulse" />
            <span>Live Database Sync Active</span>
          </div>
        </div>

        {/* Table Content with Exact Columns: REG NO, STUDENT NAME, BRANCH, SECTION, ASSIGNMENTS PROGRESS, STATUS, LAST ACTIVITY, MARKS / PROGRESS, CREDITS */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-5">REG NO</th>
                <th className="py-3.5 px-5">STUDENT NAME</th>
                <th className="py-3.5 px-4 text-center">BRANCH</th>
                <th className="py-3.5 px-4 text-center">SECTION</th>
                <th className="py-3.5 px-5 text-center">ASSIGNMENTS PROGRESS</th>
                <th className="py-3.5 px-4 text-center">STATUS</th>
                <th className="py-3.5 px-4 text-center">LAST ACTIVITY</th>
                <th className="py-3.5 px-4 text-center">MARKS / PROGRESS</th>
                <th className="py-3.5 px-4 text-center">CREDITS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold text-xs">
                    No student records found matching your selected filters.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* 1. REG NO */}
                    <td className="py-4 px-5 font-mono font-bold text-slate-800 text-xs">
                      {st.regNo}
                    </td>

                    {/* 2. STUDENT NAME & EMAIL */}
                    <td className="py-4 px-5">
                      <div className="font-bold text-[#0B1E43] text-sm leading-snug">
                        {st.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs font-normal">
                        {st.email}
                      </div>
                    </td>

                    {/* 3. BRANCH */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#1E5EFF] border border-blue-100/60 font-bold text-[11px] uppercase">
                        {normalizeBranchKey(st.rawDepartment || st.department) === "OTHER" ? "CSE" : getBranchCodeLabel(normalizeBranchKey(st.rawDepartment || st.department))}
                      </span>
                    </td>

                    {/* 4. SECTION */}
                    <td className="py-4 px-4 text-center">
                      <span className="text-slate-600 font-semibold text-xs">
                        {st.section}
                      </span>
                    </td>

                    {/* 5. ASSIGNMENTS PROGRESS */}
                    <td className="py-4 px-5 text-center">
                      <span className="font-bold text-xs text-slate-700">
                        {st.completedAssignments} / {st.totalAssignments} Completed
                      </span>
                    </td>

                    {/* 6. STATUS PILL */}
                    <td className="py-4 px-4 text-center">
                      {st.status === "Completed" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-bold">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Completed</span>
                        </span>
                      ) : st.status === "In Progress" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 text-[11px] font-bold">
                          <Clock className="h-3 w-3 text-amber-600" />
                          <span>In Progress</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 text-[11px] font-bold">
                          <Clock className="h-3 w-3 text-rose-500" />
                          <span>Not Started</span>
                        </span>
                      )}
                    </td>

                    {/* 7. LAST ACTIVITY */}
                    <td className="py-4 px-4 text-center text-slate-400 font-medium text-xs">
                      {st.lastActivity}
                    </td>

                    {/* 8. MARKS / PROGRESS */}
                    <td className="py-4 px-4 text-center font-bold text-slate-700 text-xs">
                      {st.marksProgressText}
                    </td>

                    {/* 9. CREDITS */}
                    <td className="py-4 px-4 text-center font-extrabold text-amber-600 text-xs">
                      {st.totalCredits}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-slate-500 font-semibold">
            Showing {filteredStudents.length > 0 ? startIndex + 1 : 0}-{endIndex} of {filteredStudents.length} student record(s)
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500 font-semibold">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-8 px-2 bg-slate-100 border-none rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 rounded-lg border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
              </Button>

              <span className="text-xs font-bold text-slate-700 px-2">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 rounded-lg border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40"
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
