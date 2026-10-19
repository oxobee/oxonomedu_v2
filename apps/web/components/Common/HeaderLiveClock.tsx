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

  // Avoid hydration mismatch by rendering a skeleton / static placeholder on first paint
  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/40 text-xs text-gray-400 animate-pulse select-none ${className}`}
        aria-hidden="true"
      >
        <Clock size={13} className="opacity-50" />
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

  // Theme-specific styles
  const themeStyles = {
    emerald: {
      border: 'border-emerald-500/20 dark:border-emerald-500/30',
      bg: 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]',
      timeBadge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
      icon: 'text-emerald-600 dark:text-emerald-400',
      dateText: 'text-gray-700 dark:text-gray-200',
      dot: 'bg-emerald-500',
    },
    indigo: {
      border: 'border-indigo-500/20 dark:border-indigo-500/30',
      bg: 'bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08]',
      timeBadge: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30',
      icon: 'text-indigo-600 dark:text-indigo-400',
      dateText: 'text-gray-700 dark:text-gray-200',
      dot: 'bg-indigo-500',
    },
    cyan: {
      border: 'border-cyan-500/20 dark:border-cyan-500/30',
      bg: 'bg-cyan-500/[0.04] dark:bg-cyan-500/[0.08]',
      timeBadge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30',
      icon: 'text-cyan-600 dark:text-cyan-400',
      dateText: 'text-gray-700 dark:text-gray-200',
      dot: 'bg-cyan-500',
    },
    purple: {
      border: 'border-purple-500/20 dark:border-purple-500/30',
      bg: 'bg-purple-500/[0.04] dark:bg-purple-500/[0.08]',
      timeBadge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30',
      icon: 'text-purple-600 dark:text-purple-400',
      dateText: 'text-gray-700 dark:text-gray-200',
      dot: 'bg-purple-500',
    },
    amber: {
      border: 'border-amber-500/20 dark:border-amber-500/30',
      bg: 'bg-amber-500/[0.04] dark:bg-amber-500/[0.08]',
      timeBadge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
      icon: 'text-amber-600 dark:text-amber-400',
      dateText: 'text-gray-700 dark:text-gray-200',
      dot: 'bg-amber-500',
    },
    oxonom: {
      border: 'border-[#E8DFEB] dark:border-[#49364F]',
      bg: 'bg-[#FCF9FD]/90 dark:bg-[#211729]/90',
      timeBadge: 'bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] border border-[#D5C5DC] dark:border-[#8D49A6]/40',
      icon: 'text-[#4B075F] dark:text-[#C58ADB]',
      dateText: 'text-[#241329] dark:text-[#FCF9FD]',
      dot: 'bg-[#D914C8]',
    },
  }

  const currentTheme = themeStyles[theme] || themeStyles.oxonom

  // Mobile Compact Pill
  if (variant === 'mobile') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${currentTheme.border} ${currentTheme.bg} backdrop-blur-md text-[11px] select-none ${className}`}
        title={`${dayNumber} ${monthName} ${year}, ${dayName}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.dot} animate-pulse shrink-0`} />
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {dayNumber} {shortMonthName}
        </span>
        <span className="text-gray-400 dark:text-gray-600 font-bold">•</span>
        <span className={`font-mono font-bold ${currentTheme.icon}`}>
          {hours}:{minutes}
        </span>
      </div>
    )
  }

  // Compact Pill (e.g. For medium view or tight spaces)
  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${currentTheme.border} ${currentTheme.bg} backdrop-blur-md text-xs select-none shadow-xs ${className}`}
      >
        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-semibold">
          <CalendarIcon size={12} className={currentTheme.icon} />
          <span>{dayNumber} {shortMonthName} {dayName}</span>
        </div>
        <span className="text-gray-300 dark:text-gray-700">|</span>
        <div className={`px-1.5 py-0.5 rounded-lg ${currentTheme.timeBadge} font-mono font-bold flex items-center gap-1 text-[11px]`}>
          <Clock size={11} className={currentTheme.icon} />
          <span>{hours}:{minutes}{showSeconds ? `:${seconds}` : ''}</span>
        </div>
      </div>
    )
  }

  // Desktop Full Featured Header Clock & Calendar Card
  return (
    <div
      className={`inline-flex items-center gap-3 px-3.5 py-1.5 rounded-2xl border ${currentTheme.border} ${currentTheme.bg} backdrop-blur-md text-xs shadow-xs select-none transition-all hover:shadow-sm ${className}`}
      title="Sistem Tarih ve Canlı Saat"
    >
      {/* Date Section */}
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-lg ${currentTheme.bg} flex items-center justify-center shrink-0`}>
          <CalendarIcon size={13} className={currentTheme.icon} />
        </div>
        <div className="flex flex-col leading-none">
          <span className={`text-[11px] font-bold ${currentTheme.dateText}`}>
            {dayNumber} {monthName} {year}
          </span>
          <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 mt-0.5">
            {dayName}
          </span>
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="h-5 w-px bg-gray-200 dark:bg-gray-800" />

      {/* Live Time Badge */}
      <div className={`px-2.5 py-1 rounded-xl ${currentTheme.timeBadge} flex items-center gap-1.5 shadow-xs`}>
        <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.dot} animate-pulse shrink-0`} />
        <span className="font-mono font-black text-xs tracking-wider">
          {hours}:{minutes}{showSeconds ? `:${seconds}` : ''}
        </span>
      </div>
    </div>
  )
}
