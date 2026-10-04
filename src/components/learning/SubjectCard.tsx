import { Link } from "react-router-dom"
import { BookOpen, BrainCircuit, ArrowRight, UserCheck } from "lucide-react"

interface SubjectCardProps {
  id: string
  code: string
  name: string
  description?: string
  facultyName?: string
  notesCount?: number
  vivaCount?: number
  progressPercentage?: number
}

export default function SubjectCard({
  id,
  code,
  name,
  description,
  facultyName = "Faculty Member",
  notesCount = 4,
  vivaCount = 2,
  progressPercentage = 75
}: SubjectCardProps) {
  return (
    <div className="group relative bg-white border border-[#E2E8E4] rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        {/* Top Header Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-100/80">
            {code}
          </span>
          <span className="text-xl">📘</span>
        </div>

        {/* Subject Name */}
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
          {name}
        </h3>

        {description && (
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-medium">
            {description}
          </p>
        )}

        {/* Faculty Instructor */}
        <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-slate-600">
          <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>{facultyName}</span>
        </div>

        {/* Content Badges */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1 bg-emerald-50/60 px-2.5 py-1 rounded-lg text-emerald-800">
            <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
            <span>{notesCount} Notes</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
            <BrainCircuit className="h-3.5 w-3.5 text-slate-500" />
            <span>{vivaCount} Viva</span>
          </div>
        </div>
      </div>

      {/* Progress & CTA */}
      <div className="mt-5 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
          <span className="text-slate-500">Progress</span>
          <span className="text-emerald-700">{progressPercentage}%</span>
        </div>
        
        {/* Custom Green Progress */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>

        <Link
          to={`/learning/subjects/${id}`}
          className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-600 text-slate-700 hover:text-white font-bold text-xs transition-all duration-200 group-hover:bg-emerald-600 group-hover:text-white shadow-xs"
        >
          <span>Open Subject</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
