import { Flame, Check, Sparkles } from "lucide-react"
import type { StudentLearningStreak } from "@/types/learning.types"

interface StreakCardProps {
  streak?: StudentLearningStreak
}

export default function StreakCard({
  streak = {
    current_streak: 7,
    longest_streak: 14,
    last_activity_date: new Date().toISOString().split("T")[0],
    weekly_history: {
      Mon: true,
      Tue: true,
      Wed: true,
      Thu: true,
      Fri: true,
      Sat: true,
      Sun: true
    }
  }
}: StreakCardProps) {
  const days: (keyof typeof streak.weekly_history)[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-100 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="h-6 w-6 fill-amber-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              {streak.current_streak} Day Learning Streak! 🔥
            </h3>
            <p className="text-xs font-semibold text-emerald-800/80">
              Personal Best: {streak.longest_streak} Days
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
          <Sparkles className="h-3 w-3" /> Streak Active
        </span>
      </div>

      {/* Week Tracker Pills */}
      <div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
          {days.map((day) => {
            const isCompleted = streak.weekly_history[day]
            return (
              <div
                key={day}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
                  isCompleted 
                    ? "bg-gradient-to-b from-emerald-600 to-green-600 text-white shadow-xs" 
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <span className="text-[10px] font-bold uppercase">{day}</span>
                <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center ${
                  isCompleted ? "bg-white/20" : "bg-slate-200"
                }`}>
                  {isCompleted ? (
                    <Check className="h-3 w-3 text-white stroke-[3]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-[11px] text-slate-500 text-center font-medium mt-3">
          Earn streak days by reading notes or finishing Viva quizzes daily!
        </p>
      </div>
    </div>
  )
}
