import { BookOpen, BrainCircuit, Award, Flame } from "lucide-react"

interface LearningStatsProps {
  notesCompleted?: number
  totalNotes?: number
  vivaCompleted?: number
  averageScore?: number
  streakDays?: number
}

export default function LearningStats({
  notesCompleted = 0,
  totalNotes = 0,
  vivaCompleted = 0,
  averageScore = 0,
  streakDays = 0
}: LearningStatsProps) {
  const stats = [
    {
      title: "Notes Completed",
      value: `${notesCompleted} / ${totalNotes}`,
      subtext: totalNotes > 0 ? `${Math.round((notesCompleted / totalNotes) * 100)}% coverage` : "0% coverage",
      icon: BookOpen,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100"
    },
    {
      title: "Viva Completed",
      value: `${vivaCompleted}`,
      subtext: "Quizzes tested",
      icon: BrainCircuit,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-100"
    },
    {
      title: "Average Score",
      value: `${averageScore}%`,
      subtext: averageScore > 0 ? "Proficiency score" : "No score recorded",
      icon: Award,
      iconColor: "text-emerald-700",
      bgColor: "bg-emerald-100/50",
      borderColor: "border-emerald-200"
    },
    {
      title: "Learning Streak",
      value: `${streakDays} Days`,
      subtext: "Daily active learner",
      icon: Flame,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100"
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`bg-white border ${stat.borderColor} rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 truncate max-w-[110px]">
              {stat.title}
            </span>
            <div className={`p-2 rounded-2xl ${stat.bgColor} ${stat.iconColor} shrink-0`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {stat.value}
            </div>
            <div className="text-[11px] font-semibold text-emerald-700/80 mt-0.5 truncate">
              {stat.subtext}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
