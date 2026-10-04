import React from "react"

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
  const heightMap = {
    xs: "h-7",
    sm: "h-9",
    md: "h-11 sm:h-12",
    lg: "h-14 sm:h-15",
    xl: "h-18",
  }

  const currentHeight = heightMap[size] || "h-11 sm:h-12"

  if (iconOnly) {
    return (
      <div className={`relative w-9 h-9 rounded-xl overflow-hidden bg-white/90 border border-emerald-100 p-1 flex items-center justify-center shadow-xs shrink-0 select-none ${className}`}>
        <img
          src="/assets/edunexus-logo.png"
          alt="EduNexus Icon"
          className="w-full h-full object-contain object-left scale-150 origin-left"
          loading="eager"
        />
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/assets/edunexus-logo.png"
        alt="EduNexus - A Student Learning Hub"
        className={`${currentHeight} w-auto max-w-full object-contain drop-shadow-xs`}
        loading="eager"
      />
    </div>
  )
}
