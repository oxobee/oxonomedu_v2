'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Tv,
  Users,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Calendar,
  AlertCircle,
  Coffee,
  Utensils,
  ChevronRight,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Bell,
  ArrowRight,
  MapPin,
  Compass,
  Radio,
  SlidersHorizontal,
  Flame,
  Award,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { CANONICAL_9A_SCHEDULE_30, getSynchronizedClassWeeklySchedule } from '@/lib/student/studentData'
import { ScheduleEntry, DayKey } from '@components/Mobile/Admin/MAdminScheduleClient'
import { ALL_CLASSROOMS } from '@services/demo/schoolDirectory'

// MEB Standard 6-period daily schedule with bell times
export interface PeriodTimeConfig {
  period: number
  startTime: string // "08:30"
  endTime: string // "09:10"
  startMinutes: number // minutes from midnight (510)
  endMinutes: number // minutes from midnight (550)
  durationMinutes: number // 40
  isLunchAfter?: boolean
  breakDurationAfter?: number // 15 or 50
}

export const MEB_PERIOD_CONFIG: PeriodTimeConfig[] = [
  { period: 1, startTime: '08:30', endTime: '09:10', startMinutes: 8 * 60 + 30, endMinutes: 9 * 60 + 10, durationMinutes: 40, breakDurationAfter: 15 },
  { period: 2, startTime: '09:25', endTime: '10:05', startMinutes: 9 * 60 + 25, endMinutes: 10 * 60 + 5, durationMinutes: 40, breakDurationAfter: 15 },
  { period: 3, startTime: '10:20', endTime: '11:00', startMinutes: 10 * 60 + 20, endMinutes: 11 * 60 + 0, durationMinutes: 40, breakDurationAfter: 15 },
  { period: 4, startTime: '11:15', endTime: '11:55', startMinutes: 11 * 60 + 15, endMinutes: 11 * 60 + 55, durationMinutes: 40, isLunchAfter: true, breakDurationAfter: 50 },
  { period: 5, startTime: '12:45', endTime: '13:25', startMinutes: 12 * 60 + 45, endMinutes: 13 * 60 + 25, durationMinutes: 40, breakDurationAfter: 15 },
  { period: 6, startTime: '13:40', endTime: '14:20', startMinutes: 13 * 60 + 40, endMinutes: 14 * 60 + 20, durationMinutes: 40, breakDurationAfter: 0 },
]

export interface LiveClassRadarProps {
  role?: 'student' | 'teacher' | 'principal'
  initialClassCode?: string
  compact?: boolean
  showClassSelector?: boolean
  className?: string
  titleOverride?: string
  initialExpanded?: boolean
}

// Subject color mapping with vibrant, modern palettes
export function getSubjectColorTheme(subject: string) {
  const sub = (subject || '').toLowerCase()
  if (sub.includes('türk') || sub.includes('edebiyat')) {
    return {
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
      border: 'border-blue-400 dark:border-blue-500/40',
      badge: 'bg-blue-600 text-white',
      text: 'text-blue-700 dark:text-blue-300',
      glow: 'shadow-blue-500/20',
      gradient: 'from-blue-600 to-indigo-600',
      accent: '#2563eb',
    }
  }
  if (sub.includes('matematik') || sub.includes('geometri')) {
    return {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      border: 'border-indigo-400 dark:border-indigo-500/40',
      badge: 'bg-indigo-600 text-white',
      text: 'text-indigo-700 dark:text-indigo-300',
      glow: 'shadow-indigo-500/20',
      gradient: 'from-indigo-600 to-violet-600',
      accent: '#4f46e5',
    }
  }
  if (sub.includes('fizik') || sub.includes('kimya') || sub.includes('biyoloji') || sub.includes('fen')) {
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      border: 'border-emerald-400 dark:border-emerald-500/40',
      badge: 'bg-emerald-600 text-white',
      text: 'text-emerald-700 dark:text-emerald-300',
      glow: 'shadow-emerald-500/20',
      gradient: 'from-emerald-600 to-teal-600',
      accent: '#059669',
    }
  }
  if (sub.includes('bilişim') || sub.includes('kodlama') || sub.includes('yazılım')) {
    return {
      bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
      border: 'border-cyan-400 dark:border-cyan-500/40',
      badge: 'bg-cyan-600 text-white',
      text: 'text-cyan-700 dark:text-cyan-300',
      glow: 'shadow-cyan-500/20',
      gradient: 'from-cyan-600 to-blue-600',
      accent: '#0891b2',
    }
  }
  if (sub.includes('ingilizce') || sub.includes('yabancı dil') || sub.includes('almanca')) {
    return {
      bg: 'bg-purple-500/10 dark:bg-purple-500/15',
      border: 'border-purple-400 dark:border-purple-500/40',
      badge: 'bg-purple-600 text-white',
      text: 'text-purple-700 dark:text-purple-300',
      glow: 'shadow-purple-500/20',
      gradient: 'from-purple-600 to-pink-600',
      accent: '#9333ea',
    }
  }
  if (sub.includes('tarih') || sub.includes('inkılap') || sub.includes('felsefe')) {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      border: 'border-amber-400 dark:border-amber-500/40',
      badge: 'bg-amber-600 text-white',
      text: 'text-amber-700 dark:text-amber-300',
      glow: 'shadow-amber-500/20',
      gradient: 'from-amber-600 to-orange-600',
      accent: '#d97706',
    }
  }
  if (sub.includes('coğrafya')) {
    return {
      bg: 'bg-teal-500/10 dark:bg-teal-500/15',
      border: 'border-teal-400 dark:border-teal-500/40',
      badge: 'bg-teal-600 text-white',
      text: 'text-teal-700 dark:text-teal-300',
      glow: 'shadow-teal-500/20',
      gradient: 'from-teal-600 to-emerald-600',
      accent: '#0d9488',
    }
  }
  if (sub.includes('beden') || sub.includes('spor')) {
    return {
      bg: 'bg-orange-500/10 dark:bg-orange-500/15',
      border: 'border-orange-400 dark:border-orange-500/40',
      badge: 'bg-orange-600 text-white',
      text: 'text-orange-700 dark:text-orange-300',
      glow: 'shadow-orange-500/20',
      gradient: 'from-orange-600 to-red-600',
      accent: '#ea580c',
    }
  }
  if (sub.includes('müzik') || sub.includes('görsel') || sub.includes('sanat')) {
    return {
      bg: 'bg-pink-500/10 dark:bg-pink-500/15',
      border: 'border-pink-400 dark:border-pink-500/40',
      badge: 'bg-pink-600 text-white',
      text: 'text-pink-700 dark:text-pink-300',
      glow: 'shadow-pink-500/20',
      gradient: 'from-pink-600 to-rose-600',
      accent: '#db2777',
    }
  }
  return {
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    border: 'border-slate-400 dark:border-slate-500/40',
    badge: 'bg-slate-700 text-white',
    text: 'text-slate-700 dark:text-slate-300',
    glow: 'shadow-slate-500/20',
    gradient: 'from-slate-700 to-gray-800',
    accent: '#475569',
  }
}

export default function LiveClassRadar({
  role = 'student',
  initialClassCode = '1/A',
  compact = false,
  showClassSelector = false,
  className = '',
  titleOverride,
  initialExpanded = false,
}: LiveClassRadarProps) {
  const isStudent = role === 'student'
  const canSwitchClass = !isStudent

  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (isStudent) return '1/A'
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oxonom_live_radar_class')
      if (saved) return saved
    }
    return initialClassCode || '1/A'
  })

  const handleClassChange = (newClass: string) => {
    if (isStudent) return
    setSelectedClass(newClass)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_live_radar_class', newClass)
    }
  }

  // Synchronize when initialClassCode prop changes from parent (e.g. Hero class switcher)
  useEffect(() => {
    if (isStudent) return
    if (initialClassCode && initialClassCode !== selectedClass) {
      setSelectedClass(initialClassCode)
    }
  }, [initialClassCode, isStudent])

  // Synchronize with global class changes
  useEffect(() => {
    if (isStudent) return
    const handleClassChanged = (e: any) => {
      const cls = e?.detail
      const code = cls?.code || cls?.name || cls
      if (typeof code === 'string' && code.trim()) {
        setSelectedClass(code.trim())
      }
    }
    window.addEventListener('oxonom_class_changed', handleClassChanged)
    return () => window.removeEventListener('oxonom_class_changed', handleClassChanged)
  }, [isStudent])
  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>([])
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [isExpanded, setIsExpanded] = useState<boolean>(initialExpanded)

  // Dynamic available classes from school directory / local storage
  const availableClasses = useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oxonom_admin_classes_30')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const codes = parsed.map((c: any) => c.code || c.name?.split(' ')[0] || c)
            return Array.from(new Set(codes))
          }
        }
      } catch (_) {}
    }
    return ALL_CLASSROOMS.map((c) => c.code)
  }, [])

  // Grade branches for the active selection
  const currentGradeNum = useMemo(() => {
    const match = selectedClass.match(/\d+/)
    return match ? match[0] : '1'
  }, [selectedClass])

  const gradeBranches = useMemo(() => {
    const prefix = `${currentGradeNum}/`
    const dashPrefix = `${currentGradeNum}-`
    const list = availableClasses.filter(
      (c) => c.startsWith(prefix) || c.startsWith(dashPrefix)
    )
    return list.length > 0 ? list : [`${currentGradeNum}/A`, `${currentGradeNum}/B`, `${currentGradeNum}/C`, `${currentGradeNum}/D`]
  }, [availableClasses, currentGradeNum])

  // Simulation mode allows testing live animations regardless of current computer clock (e.g. night time)
  // Default is 'realtime' (100% authentic clock)
  const [timeMode, setTimeMode] = useState<'realtime' | 'simulated'>('realtime')
  const [simulatedMinutes, setSimulatedMinutes] = useState<number>(10 * 60 + 35) // 10:35 default demo (Period 3)

  // 1. Fetch real-time schedule from /api/schedule with fallbacks
  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch('/api/schedule', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.schedule) && data.schedule.length > 0) {
          setScheduleData(data.schedule)
          return
        }
      }
    } catch (_) {}

    // Fallback to local storage or canonical 9-A
    const local = getSynchronizedClassWeeklySchedule(selectedClass)
    setScheduleData(local)
  }, [selectedClass])

  useEffect(() => {
    fetchSchedule()
    const onScheduleUpdated = () => fetchSchedule()
    window.addEventListener('oxonom_schedule_published', onScheduleUpdated)
    window.addEventListener('oxonom_schedule_updated', onScheduleUpdated)
    window.addEventListener('oxonom_admin_schedule_updated', onScheduleUpdated)

    return () => {
      window.removeEventListener('oxonom_schedule_published', onScheduleUpdated)
      window.removeEventListener('oxonom_schedule_updated', onScheduleUpdated)
      window.removeEventListener('oxonom_admin_schedule_updated', onScheduleUpdated)
    }
  }, [fetchSchedule])

  // 2. Real-time Clock Interval (Tick every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 3. Calculate effective time & day
  const effectiveDayKey: DayKey = useMemo(() => {
    const day = currentTime.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
    if (day === 1) return 'mon'
    if (day === 2) return 'tue'
    if (day === 3) return 'wed'
    if (day === 4) return 'thu'
    if (day === 5) return 'fri'
    // Weekend default to Monday for view
    return 'mon'
  }, [currentTime])

  const isWeekend = useMemo(() => {
    const day = currentTime.getDay()
    return day === 0 || day === 6
  }, [currentTime])

  // Minutes from midnight
  const effectiveCurrentMinutes = useMemo(() => {
    if (timeMode === 'simulated') {
      return simulatedMinutes
    }
    return currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60
  }, [timeMode, simulatedMinutes, currentTime])

  // Formatted clock string
  const formattedClock = useMemo(() => {
    if (timeMode === 'simulated') {
      const h = Math.floor(simulatedMinutes / 60).toString().padStart(2, '0')
      const m = Math.floor(simulatedMinutes % 60).toString().padStart(2, '0')
      const s = Math.floor((simulatedMinutes * 60) % 60).toString().padStart(2, '0')
      return `${h}:${m}:${s}`
    }
    return currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, [timeMode, simulatedMinutes, currentTime])

  const formattedDateStr = useMemo(() => {
    return currentTime.toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }, [currentTime])

  // 4. Filter today's periods for selected class
  const todayLessons = useMemo(() => {
    const normSelected = selectedClass.replace(/[\/\-\s]/g, '').toLowerCase()
    const base = scheduleData.length > 0 ? scheduleData : CANONICAL_9A_SCHEDULE_30
    return base
      .filter((s) => {
        if (s.day !== effectiveDayKey) return false
        if (!s.classCode) return true
        const normEntry = s.classCode.replace(/[\/\-\s]/g, '').toLowerCase()
        return (
          normEntry === normSelected ||
          normEntry.includes(normSelected) ||
          normSelected.includes(normEntry) ||
          (normSelected.startsWith('1') && normEntry.startsWith('1'))
        )
      })
      .sort((a, b) => a.period - b.period)
  }, [scheduleData, effectiveDayKey, selectedClass])

  // 5. Determine active state: which lesson is active, or if in a break / outside hours
  const liveState = useMemo(() => {
    const nowMin = effectiveCurrentMinutes
    const schoolStart = MEB_PERIOD_CONFIG[0].startMinutes // 08:30 = 510
    const schoolEnd = MEB_PERIOD_CONFIG[MEB_PERIOD_CONFIG.length - 1].endMinutes // 14:20 = 860

    // State A: Before School
    if (nowMin < schoolStart) {
      const remainingMin = Math.ceil(schoolStart - nowMin)
      return {
        status: 'before_school' as const,
        activePeriod: null,
        nextPeriod: MEB_PERIOD_CONFIG[0],
        nextLesson: todayLessons.find((l) => l.period === 1) || null,
        remainingMinutes: remainingMin,
        remainingSeconds: Math.ceil((schoolStart - nowMin) * 60),
        elapsedMinutes: 0,
        elapsedPercent: 0,
        label: 'Okul Henüz Başlamadı',
        sublabel: `Ders ziline ${remainingMin} dakika kaldı (08:30)`,
      }
    }

    // State B: After School
    if (nowMin >= schoolEnd) {
      return {
        status: 'after_school' as const,
        activePeriod: null,
        nextPeriod: null,
        nextLesson: null,
        remainingMinutes: 0,
        remainingSeconds: 0,
        elapsedMinutes: schoolEnd - schoolStart,
        elapsedPercent: 100,
        label: 'Bugünkü Tüm Dersler Tamamlandı',
        sublabel: 'İyi dinlenmeler! Yarının ders programını inceleyebilirsiniz.',
      }
    }

    // State C: Inside School Hours - Check each period
    for (let i = 0; i < MEB_PERIOD_CONFIG.length; i++) {
      const p = MEB_PERIOD_CONFIG[i]

      // During active lesson
      if (nowMin >= p.startMinutes && nowMin < p.endMinutes) {
        const elapsedMin = nowMin - p.startMinutes
        const remainingMin = p.endMinutes - nowMin
        const totalDuration = p.durationMinutes
        const percent = Math.min(100, Math.max(0, Math.round((elapsedMin / totalDuration) * 100)))
        const lesson = todayLessons.find((l) => l.period === p.period) || null
        const nextP = i < MEB_PERIOD_CONFIG.length - 1 ? MEB_PERIOD_CONFIG[i + 1] : null
        const nextL = nextP ? todayLessons.find((l) => l.period === nextP.period) || null : null

        return {
          status: 'in_lesson' as const,
          activePeriod: p,
          activeLesson: lesson,
          nextPeriod: nextP,
          nextLesson: nextL,
          remainingMinutes: Math.floor(remainingMin),
          remainingSeconds: Math.floor((p.endMinutes - nowMin) * 60),
          elapsedMinutes: Math.floor(elapsedMin),
          elapsedSeconds: Math.floor(elapsedMin * 60),
          elapsedPercent: percent,
          label: `${p.period}. Ders İşleniyor`,
          sublabel: lesson?.subject || 'Ders Programı',
        }
      }

      // During break after this period
      const nextP = MEB_PERIOD_CONFIG[i + 1]
      if (nextP && nowMin >= p.endMinutes && nowMin < nextP.startMinutes) {
        const breakTotal = nextP.startMinutes - p.endMinutes
        const breakElapsed = nowMin - p.endMinutes
        const breakRemaining = nextP.startMinutes - nowMin
        const percent = Math.min(100, Math.max(0, Math.round((breakElapsed / breakTotal) * 100)))
        const isLunch = p.isLunchAfter
        const nextL = todayLessons.find((l) => l.period === nextP.period) || null

        return {
          status: (isLunch ? 'lunch_break' : 'recess_break') as 'lunch_break' | 'recess_break',
          activePeriod: null,
          prevPeriod: p,
          nextPeriod: nextP,
          nextLesson: nextL,
          breakDuration: breakTotal,
          remainingMinutes: Math.floor(breakRemaining),
          remainingSeconds: Math.floor(breakRemaining * 60),
          elapsedMinutes: Math.floor(breakElapsed),
          elapsedPercent: percent,
          label: isLunch ? 'Öğle Arası Dinlenmesi' : 'Teneffüs Arası',
          sublabel: `${nextP.period}. Ders (${nextL?.subject || 'Sıradaki Ders'}) ${Math.ceil(breakRemaining)} dk sonra başlayacak`,
        }
      }
    }

    // Default safe fallback
    return {
      status: 'after_school' as const,
      activePeriod: null,
      nextPeriod: null,
      nextLesson: null,
      remainingMinutes: 0,
      remainingSeconds: 0,
      elapsedMinutes: 0,
      elapsedPercent: 100,
      label: 'Ders Saati Dışında',
      sublabel: 'Program dışı saat.',
    }
  }, [effectiveCurrentMinutes, todayLessons])

  // Get active subject theme
  const activeSubjectTheme = useMemo(() => {
    if (liveState.status === 'in_lesson' && liveState.activeLesson) {
      return getSubjectColorTheme(liveState.activeLesson.subject)
    }
    return {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      border: 'border-indigo-400 dark:border-indigo-500/40',
      badge: 'bg-indigo-600 text-white',
      text: 'text-indigo-700 dark:text-indigo-300',
      glow: 'shadow-indigo-500/20',
      gradient: 'from-indigo-600 to-cyan-600',
      accent: '#4f46e5',
    }
  }, [liveState])

  // Helpers for formatting remaining mm:ss
  const formatCountdown = (totalSec: number) => {
    if (totalSec <= 0) return '00:00'
    const m = Math.floor(totalSec / 60)
    const s = Math.floor(totalSec % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Radial progress calculations
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (liveState.elapsedPercent / 100) * circumference

  return (
    <div
      className={`rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/90 dark:border-gray-800/90 shadow-sm overflow-hidden transition-all duration-300 relative ${className}`}
    >
      {/* ── 1. COMPACT COLLAPSIBLE SUMMARY CARD (Default View on Load) ── */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 sm:p-4.5 bg-gradient-to-r from-[#FCF9FD] via-[#F7F0FA] to-white dark:from-[#17101C] dark:via-[#211729] dark:to-[#17101C] cursor-pointer hover:bg-[#F0D8FA]/40 dark:hover:bg-[#2D2035] transition-all select-none"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
          {/* Left: Mini Radial Progress Ring (Özet Grafik) + Özet Bilgiler */}
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            {/* Özet Grafik: Circular Progress Ring with Period or Status Icon */}
            <div className="relative w-12 h-12 sm:w-13 sm:h-13 shrink-0 flex items-center justify-center">
              <svg className="w-12 h-12 sm:w-13 sm:h-13 -rotate-90 transform" viewBox="0 0 52 52">
                <circle
                  cx="26"
                  cy="26"
                  r="20"
                  className="stroke-slate-200/80 dark:stroke-slate-800"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="26"
                  cy="26"
                  r="20"
                  className={`transition-all duration-700 ${
                    liveState.status === 'in_lesson'
                      ? 'stroke-[#4B075F]'
                      : liveState.status === 'recess_break'
                      ? 'stroke-amber-500'
                      : liveState.status === 'lunch_break'
                      ? 'stroke-orange-500'
                      : liveState.status === 'before_school'
                      ? 'stroke-[#8D49A6]'
                      : 'stroke-[#D914C8]'
                  }`}
                  strokeWidth="3.5"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 - (liveState.elapsedPercent / 100) * 2 * Math.PI * 20}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {liveState.status === 'in_lesson' ? (
                  <>
                    <span className="text-xs font-black text-slate-900 dark:text-white leading-none">
                      {liveState.activePeriod?.period}
                    </span>
                    <span className="text-[7px] font-extrabold text-[#4B075F] dark:text-[#C58ADB] uppercase tracking-tighter mt-0.5">
                      DERS
                    </span>
                  </>
                ) : liveState.status === 'recess_break' ? (
                  <Coffee size={15} className="text-amber-500" />
                ) : liveState.status === 'lunch_break' ? (
                  <Utensils size={15} className="text-orange-500" />
                ) : liveState.status === 'before_school' ? (
                  <Clock size={15} className="text-[#4B075F] dark:text-[#C58ADB]" />
                ) : (
                  <CheckCircle2 size={15} className="text-[#8D49A6]" />
                )}
              </div>
            </div>

            {/* Özet Bilgiler */}
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                  {titleOverride || 'Canlı Ders Takibi'}
                </span>
                <span className="px-2 py-0.5 rounded-lg text-[10.5px] font-black bg-[#F0D8FA] dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB] border border-[#8D49A6]/20">
                  {selectedClass.replace('-', '/')} Şubesi
                </span>

                {/* Status badge */}
                {liveState.status === 'in_lesson' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>Şu Anda İşleniyor</span>
                  </span>
                ) : liveState.status === 'recess_break' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs">
                    <Coffee size={11} />
                    <span>Teneffüs Arası</span>
                  </span>
                ) : liveState.status === 'lunch_break' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-white shadow-xs">
                    <Utensils size={11} />
                    <span>Öğle Arası</span>
                  </span>
                ) : liveState.status === 'before_school' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#8D49A6] text-white shadow-xs">
                    <Clock size={11} />
                    <span>Canlı Ders Henüz Başlamadı</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white shadow-xs">
                    <CheckCircle2 size={11} />
                    <span>Dersler Bitti</span>
                  </span>
                )}
              </div>

              {/* Lesson subtitle info */}
              <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 flex-wrap">
                {liveState.status === 'in_lesson' && liveState.activeLesson ? (
                  <>
                    <strong className="font-black text-slate-900 dark:text-white">
                      {liveState.activeLesson.subject}
                    </strong>
                    <span>·</span>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      {liveState.activePeriod?.startTime} - {liveState.activePeriod?.endTime}
                    </span>
                    <span>·</span>
                    <span className="font-medium truncate max-w-[140px] sm:max-w-none">
                      {liveState.activeLesson.teacherName}
                    </span>
                    <span>·</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                      <Tv size={12} /> Tahta Aktif
                    </span>
                  </>
                ) : liveState.status === 'recess_break' || liveState.status === 'lunch_break' ? (
                  <>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      Sıradaki: {liveState.nextPeriod?.period}. Ders {liveState.nextLesson?.subject || ''} ({liveState.nextPeriod?.startTime})
                    </span>
                    <span>·</span>
                    <span>{liveState.remainingMinutes} dk sonra başlıyor</span>
                  </>
                ) : liveState.status === 'before_school' ? (
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    Günün ilk dersi: 1. Ders {liveState.nextLesson?.subject || 'Hazırlık'} (08:30)
                  </span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400">
                    Günün 6 dersi tamamlandı · 350 dk MEB akışı sona erdi
                  </span>
                )}
              </div>

              {/* Mini linear progress */}
              <div className="flex items-center gap-2 pt-0.5 max-w-xs sm:max-w-sm">
                <div className="h-1.5 flex-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      liveState.status === 'in_lesson'
                        ? 'bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8]'
                        : liveState.status === 'recess_break' || liveState.status === 'lunch_break'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                        : 'bg-[#4B075F]'
                    }`}
                    style={{ width: `${liveState.elapsedPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono shrink-0">
                  %{liveState.elapsedPercent}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Class Switcher (if principal) + Expand / Collapse Button */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {/* Teacher / Principal Classroom Switcher */}
            {canSwitchClass && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5"
              >
                {/* Full School Class Selector Dropdown */}
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleClassChange(e.target.value)
                  }}
                  aria-label="Sınıf Seçimi"
                  className="h-8 px-2.5 rounded-xl text-xs font-black bg-white dark:bg-[#211729] text-[#4B075F] dark:text-[#E7C4F3] border border-[#E8DFEB] dark:border-[#49364F] shadow-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#8D49A6]"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls} Şubesi
                    </option>
                  ))}
                </select>

                {/* Quick Branch Switcher Buttons */}
                <div className="hidden sm:flex items-center gap-0.5 bg-white dark:bg-[#211729] p-0.5 rounded-xl border border-[#E8DFEB] dark:border-[#49364F] shadow-xs">
                  {gradeBranches.map((bCls) => (
                    <button
                      key={bCls}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClassChange(bCls)
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        selectedClass === bCls
                          ? 'bg-[#4B075F] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {bCls}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Expand / Collapse Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#F0D8FA] hover:bg-[#E7C4F3] dark:bg-[#2D2035] dark:hover:bg-[#350444] text-[#4B075F] dark:text-[#C58ADB] text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>{isExpanded ? 'Daralt' : 'Tüm Akışı Gör'}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. EXPANDED FULL INFORMATION CARD (Tıklandığında Genişleyen Alan) ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-[#E8DFEB] dark:border-[#49364F]"
          >
            {/* ── TOP GRAPHIC AREA: MEVCUT DERSİN İŞ SÜRESİ & DETAYLARI ── */}
            <div className="p-4 sm:p-6 bg-gradient-to-b from-[#FCF9FD] to-white dark:from-[#17101C] dark:to-[#211729] border-b border-[#E8DFEB] dark:border-[#49364F]">
              <div className="w-full space-y-4">
                {/* Header: Status Pill + Live Lesson State Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    {liveState.status === 'in_lesson' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white" />
                        <span>Şu Anda İşleniyor</span>
                      </span>
                    ) : liveState.status === 'recess_break' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-sm shadow-amber-500/30">
                        <Coffee size={14} />
                        <span>Teneffüs Arası</span>
                      </span>
                    ) : liveState.status === 'lunch_break' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-orange-500 text-white shadow-sm shadow-orange-500/30">
                        <Utensils size={14} />
                        <span>Öğle Arası</span>
                      </span>
                    ) : liveState.status === 'before_school' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#8D49A6] text-white shadow-sm">
                        <Bell size={14} />
                        <span>Canlı Ders Henüz Başlamadı</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#4B075F] text-white shadow-sm">
                        <CheckCircle2 size={14} />
                        <span>Dersler Bitti</span>
                      </span>
                    )}

                    <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400">
                      {liveState.label}
                    </span>
                  </div>

                  {/* Live Lesson Status Indicator */}
                  {liveState.status === 'in_lesson' ? (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50 text-xs font-black shadow-xs shrink-0 self-start sm:self-auto">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Canlı Ders Devam Ediyor</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#F0D8FA]/60 dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB] border border-[#8D49A6]/20 text-xs font-bold shadow-xs shrink-0 self-start sm:self-auto">
                      <Clock size={15} className="text-[#4B075F] dark:text-[#C58ADB]" />
                      <span className="font-extrabold text-[#4B075F] dark:text-[#C58ADB]">Canlı ders henüz başlamadı</span>
                    </div>
                  )}
                </div>

                {/* Active Lesson / Break Title & Info */}
                <div className="space-y-1">
                  {liveState.status === 'in_lesson' && liveState.activeLesson ? (
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                          {liveState.activeLesson.subject}
                        </h3>
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-lg text-white ${activeSubjectTheme.badge}`}
                        >
                          {liveState.activePeriod?.period}. Ders ({liveState.activePeriod?.startTime} -{' '}
                          {liveState.activePeriod?.endTime})
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300 flex-wrap pt-1">
                        <span className="flex items-center gap-1 font-semibold">
                          <GraduationCap size={15} className="text-indigo-500" />
                          <span>Öğretmen: {liveState.activeLesson.teacherName}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-semibold">
                          <MapPin size={14} className="text-emerald-500" />
                          <span>{liveState.activeLesson.roomName || `Derslik ${selectedClass}`}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <Tv size={14} />
                          <span>Akıllı Tahta Aktif</span>
                        </span>
                      </div>
                    </>
                  ) : liveState.status === 'recess_break' || liveState.status === 'lunch_break' ? (
                    <>
                      <h3 className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
                        {liveState.status === 'lunch_break' ? <Utensils size={24} /> : <Coffee size={24} />}
                        <span>{liveState.label}</span>
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Sıradaki ders:{' '}
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                          {liveState.nextPeriod?.period}. Ders {liveState.nextLesson?.subject}
                        </span>{' '}
                        ({liveState.nextPeriod?.startTime}) — Dersliğinize geçmek için hazırlanabilirsiniz.
                      </p>
                    </>
                  ) : liveState.status === 'before_school' ? (
                    <>
                      <h3 className="text-xl sm:text-2xl font-black text-[#4B075F] dark:text-[#C58ADB] flex items-center gap-2">
                        <Clock size={22} className="text-[#4B075F] dark:text-[#C58ADB]" />
                        <span>Canlı ders henüz başlamadı</span>
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Günün ilk dersi:{' '}
                        <span className="font-bold text-gray-900 dark:text-white">
                          1. Ders {liveState.nextLesson?.subject || 'Derslik Hazırlığı'}
                        </span>{' '}
                        saat 08:30&apos;da başlayacak.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl sm:text-2xl font-black text-[#4B075F] dark:text-[#C58ADB]">
                        Bugünkü 6 Ders Başarıyla Tamamlandı 🎉
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Tüm dersler MEB müfredatına uygun olarak işlendi. Yarının programını kontrol edebilirsiniz.
                      </p>
                    </>
                  )}
                </div>

                {/* Linear Progress Bar with Milestones */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    <span>Geçen: {liveState.elapsedMinutes} dk</span>
                    <span className="font-extrabold text-gray-900 dark:text-white">
                      {liveState.status === 'in_lesson' ? 'Ders İlerleme Çubuğu' : 'Zaman Akışı'}
                    </span>
                    <span>Kalan: {liveState.remainingMinutes} dk</span>
                  </div>

                  {/* Bar track */}
                  <div className="h-3.5 w-full bg-gray-200/80 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 relative">
                    <motion.div
                      className={`h-full rounded-full transition-all duration-500 ${
                        liveState.status === 'in_lesson'
                          ? 'bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8] shadow-sm shadow-purple-950/20'
                          : liveState.status === 'lunch_break' || liveState.status === 'recess_break'
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                          : 'bg-[#4B075F]'
                      }`}
                      style={{ width: `${liveState.elapsedPercent}%` }}
                    />
                  </div>

                  {/* Milestones labels */}
                  <div className="flex justify-between text-[10px] text-gray-400 px-1 font-mono">
                    <span>0 dk</span>
                    <span>10 dk</span>
                    <span>20 dk</span>
                    <span>30 dk</span>
                    <span>40 dk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── İNFOGRAFİK VE ANİMASYONLU GÜNLÜK AKIŞ STEPPER (1-6. DERSLER & ARALAR) ── */}
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles size={17} className="text-amber-500" />
                    <span>Canlı Ders Akışı</span>
                  </h3>
                </div>

                <span className="text-xs font-mono font-bold text-gray-400 hidden sm:inline-block">
                  08:30 — 14:20 (Toplam 350 Dk)
                </span>
              </div>

              {/* PERIODS TIMELINE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
                {MEB_PERIOD_CONFIG.map((periodConfig) => {
                  const lesson = todayLessons.find((l) => l.period === periodConfig.period)
                  const subject = lesson?.subject || 'Belirlenmedi'
                  const teacher = lesson?.teacherName || 'Atanmadı'
                  const room = lesson?.roomName || `Derslik ${selectedClass}`
                  const colorTheme = getSubjectColorTheme(subject)

                  // Determine status for this period
                  const nowMin = effectiveCurrentMinutes
                  const isPast = nowMin >= periodConfig.endMinutes
                  const isCurrent = nowMin >= periodConfig.startMinutes && nowMin < periodConfig.endMinutes
                  const isFuture = nowMin < periodConfig.startMinutes

                  return (
                    <React.Fragment key={periodConfig.period}>
                      {/* Period Card */}
                      <div
                        className={`relative rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between space-y-3 ${
                          isPast
                            ? 'opacity-40 grayscale hover:grayscale-0 hover:opacity-80 bg-gray-100/70 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-800/60'
                            : isCurrent
                            ? `bg-gradient-to-br from-white via-indigo-50/50 to-white dark:from-[#131C31] dark:via-[#18233C] dark:to-[#131C31] border-2 ${activeSubjectTheme.border} ring-4 ring-indigo-500/15 shadow-xl ${activeSubjectTheme.glow}`
                            : `bg-white dark:bg-[#131C31] border ${colorTheme.border} shadow-xs hover:shadow-md`
                        }`}
                      >
                        {/* Top Bar: Period Number & Status Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${
                                isPast
                                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                  : isCurrent
                                  ? 'bg-emerald-600 text-white font-black animate-pulse'
                                  : colorTheme.badge
                              }`}
                            >
                              {periodConfig.period}. DERS
                            </span>

                            <span className="text-[11px] font-mono font-bold text-gray-500 dark:text-gray-400">
                              {periodConfig.startTime} - {periodConfig.endTime}
                            </span>
                          </div>

                          {/* Status indicator */}
                          {isPast && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              <span>Tamamlandı</span>
                            </span>
                          )}

                          {isCurrent && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              <span>CANLI İŞLENİYOR</span>
                            </span>
                          )}

                          {isFuture && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorTheme.bg} ${colorTheme.text} border ${colorTheme.border}`}
                            >
                              Gelecek Ders
                            </span>
                          )}
                        </div>

                        {/* Body: Subject Title & Details */}
                        <div className="space-y-1.5">
                          <h4
                            className={`text-sm sm:text-base font-black leading-snug ${
                              isPast
                                ? 'text-gray-600 dark:text-gray-400 line-through'
                                : isCurrent
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {subject}
                          </h4>

                          <div className="space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <GraduationCap size={13} className="text-indigo-500" />
                              <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">
                                {teacher}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-emerald-500" />
                              <span className="truncate">{room}</span>
                            </div>
                          </div>
                        </div>

                        {/* Footer: Live Progress / Countdown */}
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
                          {isPast && (
                            <span className="text-gray-400 font-medium">40 dk işlendi · Yoklama alındı</span>
                          )}

                          {isCurrent && (
                            <div className="w-full space-y-1">
                              <div className="flex items-center justify-between text-[10.5px] font-bold">
                                <span className="text-indigo-600 dark:text-cyan-400">
                                  Geçen: {liveState.elapsedMinutes} dk
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                                  {formatCountdown(liveState.remainingSeconds)} kaldı
                                </span>
                              </div>
                              <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                                  style={{ width: `${liveState.elapsedPercent}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {isFuture && (
                            <div className="flex items-center justify-between w-full text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>
                                  {Math.ceil(periodConfig.startMinutes - nowMin)} dk sonra başlayacak
                                </span>
                              </span>
                              <span className="font-bold text-gray-600 dark:text-gray-300">40 Dk</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  )
                })}
              </div>
            </div>

            {/* ── BOTTOM COLLAPSE TRIGGER BAR ── */}
            <div className="p-3 sm:px-6 bg-slate-50 dark:bg-[#10182E]/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                MEB Haftalık Canlı Ders Akışı · 08:30 - 14:20
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-xs font-bold text-[#4B075F] dark:text-[#C58ADB] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Akışı Daralt</span>
                <ChevronDown size={13} className="rotate-180" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
