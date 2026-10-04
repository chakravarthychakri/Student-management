interface EduNexusLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  iconOnly?: boolean
  className?: string
}

export default function EduNexusLogo({
  size = "md",
  iconOnly = false,
  className = ""
}: EduNexusLogoProps) {
  const sizeMap = {
    xs: { icon: "w-6 h-6", text: "text-base", sub: "text-[9px]" },
    sm: { icon: "w-8 h-8", text: "text-lg", sub: "text-[10px]" },
    md: { icon: "w-10 h-10", text: "text-xl", sub: "text-xs" },
    lg: { icon: "w-12 h-12", text: "text-2xl", sub: "text-sm" },
    xl: { icon: "w-16 h-16", text: "text-3xl", sub: "text-base" },
  }

  const currentSize = sizeMap[size]

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Plant Sprout / Learning Leaf Logo */}
      <div className={`relative ${currentSize.icon} rounded-xl bg-emerald-600 flex items-center justify-center shadow-xs shrink-0`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3/5 h-3/5 text-white"
        >
          {/* Sprout / Leaves */}
          <path d="M7 20h10" />
          <path d="M12 20v-8" />
          <path d="M12 12c-3.5 0-6-2.5-6-6 4 0 6 2.5 6 6z" fill="currentColor" fillOpacity="0.2" />
          <path d="M12 10c3.5 0 6-2 6-5-4 0-6 2-6 5z" fill="currentColor" fillOpacity="0.2" />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight text-slate-900 leading-tight ${currentSize.text}`}>
            Edu<span className="text-emerald-600">Nexus</span>
          </span>
          <span className={`font-medium tracking-tight text-slate-400 leading-none mt-0.5 ${currentSize.sub}`}>
            A Student Learning Hub
          </span>
        </div>
      )}
    </div>
  )
}
