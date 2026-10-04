// @ts-nocheck
import React from "react"
import { useAuth } from "@/contexts/AuthContext"
import StudentHome from "./StudentHome"
import FacultyDashboard from "./faculty/FacultyDashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function LearningHomeRouter() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 rounded-3xl bg-emerald-100/50" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-3xl bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  const isFaculty = profile?.role === "professor" || profile?.role === "admin"

  return isFaculty ? <FacultyDashboard /> : <StudentHome />
}
