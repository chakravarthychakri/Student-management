// @ts-nocheck
import React from "react"
import { Link } from "react-router-dom"
import { CheckCircle2, Circle, ArrowRight, BookOpen, BrainCircuit, Sparkles } from "lucide-react"

interface TopicMilestone {
  name: string
  isCompleted: boolean
  isCurrent?: boolean
  noteId?: string
  vivaId?: string
}

interface UnitRoadmap {
  unit: string
  title: string
  topics: TopicMilestone[]
}

interface RoadmapViewProps {
  units: UnitRoadmap[]
  subjectName?: string
}

export default function RoadmapView({ units, subjectName = "Subject" }: RoadmapViewProps) {
  return (
    <div className="bg-white border border-[#E2E8E4] rounded-3xl p-6 sm:p-8 shadow-xs">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Curriculum Learning Roadmap
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Step-by-step sequential mastery pathway for {subjectName}
          </p>
        </div>
      </div>

      <div className="space-y-8 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-emerald-100/80 before:hidden sm:before:block">
        {units.map((u, uIdx) => (
          <div key={uIdx} className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-sm shadow-emerald-600/20">
                {u.unit}
              </span>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                {u.title}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 sm:pl-10">
              {u.topics.map((topic, tIdx) => (
                <div
                  key={tIdx}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    topic.isCompleted 
                      ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-900" 
                      : "bg-slate-50/70 border-slate-200/70 text-slate-700 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {topic.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                    )}
                    <span className="text-xs font-bold truncate">
                      {topic.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {topic.noteId && (
                      <Link
                        to={`/learning/notes/${topic.noteId}`}
                        className="p-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Read Note"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    {topic.vivaId && (
                      <Link
                        to={`/learning/viva/${topic.vivaId}`}
                        className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                        title="Take Viva"
                      >
                        <BrainCircuit className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
