// @ts-nocheck
import { useState } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { 
  Home, 
  BookOpen, 
  BrainCircuit, 
  BarChart2, 
  Bookmark, 
  Search, 
  Menu, 
  X, 
  ArrowLeft, 
  User, 
  LogOut, 
  Flame, 
  PlusCircle, 
  Layers, 
  FileQuestion, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Headphones,
  FileText,
  LayoutDashboard
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import NotificationBell from "@/components/notifications/NotificationBell"
import EduNexusLogo from "@/components/learning/EduNexusLogo"

interface NavLinkItem {
  icon: React.ElementType
  label: string
  href: string
  badge?: string
}

export default function EduNexusLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()

  const isFaculty = profile?.role === "professor" || profile?.role === "admin"
  const isStudent = !isFaculty

  // Student Links
  const studentNavLinks: NavLinkItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/learning" },
    { icon: FileText, label: "Notes", href: "/learning/notes" },
    { icon: BrainCircuit, label: "Viva", href: "/learning/viva" },
    { icon: BarChart2, label: "Progress", href: "/learning/progress" },
    { icon: Bookmark, label: "Bookmarks", href: "/learning/bookmarks" },
    { icon: Search, label: "Search", href: "/learning/search" },
  ]

  // Faculty Links
  const facultyNavLinks: NavLinkItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/learning" },
    { icon: Layers, label: "Faculty Hub", href: "/learning/faculty/dashboard" },
    { icon: FileText, label: "Manage Notes", href: "/learning/faculty/notes" },
    { icon: BrainCircuit, label: "Manage Viva", href: "/learning/faculty/viva" },
    { icon: FileQuestion, label: "Question Bank", href: "/learning/faculty/questions" },
    { icon: BarChart2, label: "Student Analytics", href: "/learning/faculty/analytics" },
    { icon: Search, label: "Search Hub", href: "/learning/search" },
  ]

  const activeLinks = isFaculty ? facultyNavLinks : studentNavLinks

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/learning/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  const edutrackDashboardUrl = isFaculty ? "/professor/dashboard" : "/student/dashboard"

  return (
    <div className="min-h-screen bg-[#F4FAF6] flex p-2 sm:p-3.5 gap-2 sm:gap-3.5 pb-20 md:pb-3.5 font-sans antialiased text-[#141E19]">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* EduNexus Light Mint Green Sidebar */}
      <aside className={`
        fixed inset-y-2 left-2 z-50 w-64 bg-[#EAF7EE] border border-[#D2ECD9] rounded-3xl shadow-lg md:shadow-none transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex-shrink-0 flex flex-col justify-between p-3.5
        ${sidebarOpen ? "translate-x-0" : "-translate-x-[120%]"}
      `}>
        <div>
          {/* Brand Header */}
          <div className="h-20 flex items-center justify-between px-2.5 border-b border-[#D2ECD9]/60">
            <Link to="/learning" onClick={() => setSidebarOpen(false)} className="flex items-center">
              <EduNexusLogo size="md" />
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden rounded-full hover:bg-emerald-100 text-slate-500 h-8 w-8" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 mt-4">
            {activeLinks.map((link) => {
              const isActive = location.pathname === link.href || 
                (link.href !== "/learning" && location.pathname.startsWith(link.href))

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive 
                      ? "bg-[#16A34A] text-white shadow-xs font-bold" 
                      : "text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900"
                  }`}
                >
                  <link.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-600"}`} />
                  <span>{link.label}</span>
                </Link>
              )
            })}

            {/* Back to EduTrack: placed right after the Search section */}
            <div className="pt-2 border-t border-[#D2ECD9]/60 mt-3">
              <Link
                to={edutrackDashboardUrl}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-all"
              >
                <ArrowLeft className="h-4 w-4 shrink-0 text-slate-600" />
                <span>Back to EduTrack</span>
              </Link>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent rounded-2xl overflow-hidden relative">
        {/* Top Header */}
        <header className="h-14 sm:h-16 flex items-center justify-between px-2 sm:px-4 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden rounded-xl bg-white shadow-xs h-9 w-9 shrink-0 border border-slate-200 text-slate-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div className="md:hidden flex items-center">
              <EduNexusLogo size="xs" iconOnly />
            </div>
          </div>

          {/* Right Header: Notification + Student dropdown */}
          <div className="flex items-center gap-3">
            <NotificationBell />

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 cursor-pointer hover:opacity-95 transition-all bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/90 shadow-xs hover:border-[#16A34A]/50 hover:bg-white"
                >
                  <Avatar className="w-7 h-7 rounded-full border border-white shadow-xs overflow-hidden">
                    <AvatarImage src={profile?.profile_photo_url || profile?.avatar_url || ""} alt="User avatar" />
                    <AvatarFallback className="bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white font-bold text-xs flex items-center justify-center">
                      {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "S"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-bold text-slate-800 capitalize hidden sm:inline">
                    {profile?.full_name ? profile.full_name.split(" ")[0] : "Student"}
                  </span>
                  <ChevronRight className="h-3 w-3 text-slate-400 rotate-90" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border-emerald-100 bg-white/95 backdrop-blur-md" align="end">
                <DropdownMenuLabel className="font-normal p-3 bg-emerald-50/60 rounded-t-xl">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 capitalize">
                      {profile?.full_name || "Student"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {profile?.email || "student@edutrack.edu"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer text-xs">
                  <Link to={edutrackDashboardUrl} className="w-full flex items-center">
                    <ArrowLeft className="mr-2 h-3.5 w-3.5 text-emerald-700" />
                    <span>EduTrack Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="rounded-xl text-rose-600 text-xs cursor-pointer">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto px-3 sm:px-6 lg:px-8 pb-8 custom-scrollbar">
          <Outlet />
        </main>

        {/* EduNexus Footer */}
        <footer className="px-6 py-4 border-t border-emerald-100/70 bg-white/70 backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 rounded-b-[1.5rem] sm:rounded-b-[2rem]">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-extrabold text-emerald-800">EduNexus</span>
            <span>•</span>
            <span>Learn • Practice • Grow</span>
            <span>•</span>
            <span>© 2026 EduTrack Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 font-semibold">
            <Link to="/learning/notes" className="hover:text-emerald-700 transition-colors">Study Notes</Link>
            <Link to="/learning/viva" className="hover:text-emerald-700 transition-colors">Viva Quizzes</Link>
            <Link to="/learning/progress" className="hover:text-emerald-700 transition-colors">Analytics</Link>
            <Link to={edutrackDashboardUrl} className="text-emerald-700 hover:underline">EduTrack</Link>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar for EduNexus */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-100 md:hidden px-2 py-2 flex items-center justify-around shadow-lg">
        {activeLinks.slice(0, 5).map((link) => {
          const isActive = location.pathname === link.href || 
            (link.href !== "/learning" && location.pathname.startsWith(link.href))

          return (
            <Link
              key={link.href}
              to={link.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? "text-emerald-700 font-bold scale-105" : "text-slate-500 font-medium hover:text-slate-900"
              }`}
            >
              <link.icon className={`h-5 w-5 ${isActive ? "text-emerald-600" : ""}`} />
              <span className="text-[10px] tracking-tight">{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
