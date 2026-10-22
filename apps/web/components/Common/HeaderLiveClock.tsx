'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Calendar as CalendarIcon } from 'lucide-react'

export interface HeaderLiveClockProps {
  theme?: 'emerald' | 'indigo' | 'cyan' | 'purple' | 'amber' | 'oxonom'
  variant?: 'desktop' | 'compact' | 'mobile'
  className?: string
  showSeconds?: boolean
}

export default function HeaderLiveClock({
  theme = 'oxonom',
  variant = 'desktop',
  className = '',
  showSeconds = true,
}: HeaderLiveClockProps) {
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    setMounted(true)
    setNow(new Date())
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[#E8DFEB] dark:border-[#49364F] bg-white/60 dark:bg-[#211729]/60 text-xs text-gray-400 animate-pulse select-none ${className}`}
        aria-hidden="true"
      >
        <Clock size={13} className="opacity-50 text-[#8D49A6]" />
        <span className="font-mono">--:--:--</span>
      </div>
    )
  }

  // Format Turkish Date components
  const dayName = now.toLocaleDateString('tr-TR', { weekday: 'long' })
  const dayNumber = now.getDate()
  const monthName = now.toLocaleDateString('tr-TR', { month: 'long' })
  const shortMonthName = now.toLocaleDateString('tr-TR', { month: 'short' })
  const year = now.getFullYear()

  // Format Time
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  // Mobile Compact Pill (Notch-safe, Sleek)
  if (variant === 'mobile') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#8D49A6]/25 dark:border-[#8D49A6]/35 bg-gradient-to-r from-purple-50/80 to-white/90 dark:from-[#25132E]/90 dark:to-[#170B1D]/90 backdrop-blur-md text-[11px] shadow-xs select-none ${className}`}
        title={`${dayNumber} ${monthName} ${year}, ${dayName}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#D914C8] animate-pulse shrink-0" />
        <span className="font-bold text-[#241329] dark:text-[#F0D8FA]">
          {dayNumber} {shortMonthName}
        </span>
        <span className="text-[#8D49A6] opacity-50 font-bold">•</span>
        <span className="font-mono font-black text-[#4B075F] dark:text-white">
          {hours}:{minutes}
        </span>
      </div>
    )
  }

  // Compact Pill
  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[#8D49A6]/25 dark:border-[#8D49A6]/35 bg-gradient-to-r from-purple-50/70 to-white/80 dark:from-[#25132E]/80 dark:to-[#170B1D]/80 backdrop-blur-md text-xs select-none shadow-xs ${className}`}
      >
        <div className="flex items-center gap-1.5 text-[#241329] dark:text-gray-200 font-bold">
          <CalendarIcon size={12} className="text-[#8D49A6] dark:text-[#C58ADB]" />
          <span>{dayNumber} {shortMonthName} {dayName}</span>
        </div>
        <span className="text-[#8D49A6]/40">|</span>
        <div className="px-2 py-0.5 rounded-lg bg-[#4B075F]/10 dark:bg-[#4B075F]/40 text-[#4B075F] dark:text-[#F0D8FA] border border-[#8D49A6]/25 font-mono font-black text-[11px] flex items-center gap-1">
          <Clock size={11} className="text-[#D914C8]" />
          <span>{hours}:{minutes}{showSeconds ? `:${seconds}` : ''}</span>
        </div>
      </div>
    )
  }

  // Desktop Full Featured Header Clock & Calendar Card (Futuristic Oxonom Pill)
  return (
    <div
      className={`inline-flex items-center gap-3 px-3.5 py-1.5 rounded-2xl border border-[#8D49A6]/25 dark:border-[#8D49A6]/35 bg-gradient-to-r from-purple-50/80 via-white to-purple-50/60 dark:from-[#24122C]/90 dark:via-[#1C0D24]/90 dark:to-[#150A1C]/90 backdrop-blur-md text-xs shadow-xs select-none transition-all hover:border-[#8D49A6]/50 ${className}`}
      title="Sistem Tarih ve Canlı Saat"
    >
      {/* Date Section */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#4B075F] to-[#8D49A6] text-white flex items-center justify-center shrink-0 shadow-xs">
          <CalendarIcon size={12} />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[11px] font-black text-[#241329] dark:text-white">
            {dayNumber} {monthName} {year}
          </span>
          <span className="text-[9px] font-bold text-[#8D49A6] dark:text-[#C58ADB] mt-0.5">
            {dayName}
          </span>
        </div>
      </div>

      {/* Elegant Divider */}
      <div className="h-5 w-px bg-[#8D49A6]/20 dark:bg-[#8D49A6]/30" />

      {/* Live Time Badge */}
      <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#4B075F]/10 via-[#8D49A6]/10 to-[#D914C8]/10 dark:from-[#4B075F]/40 dark:to-[#8D49A6]/30 border border-[#8D49A6]/30 text-[#4B075F] dark:text-[#F0D8FA] flex items-center gap-1.5 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D914C8] animate-pulse shrink-0 shadow-xs" />
        <span className="font-mono font-black text-xs tracking-wider">
          {hours}:{minutes}{showSeconds ? `:${seconds}` : ''}
        </span>
      </div>
    </div>
  )
}
