'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  FileCheck,
  TrendingUp,
  Award,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  CheckSquare,
  BookMarked,
  MapPin,
  Play,
  Layers,
  Flame,
  MessageSquareQuote,
  Tv,
  Table,
  List,
  CalendarDays,
  X,
  FileText,
  Trash2,
  Plus,
  Tag,
  Headphones,
  Mic,
  Lightbulb,
  Compass,
  Gift,
  Trophy,
  Crown,
  ChevronDown,
  UserCheck,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  DEFAULT_STUDENT_PROFILE,
  STUDENT_COURSES,
  STUDENT_ASSESSMENTS,
  STUDENT_ANNOUNCEMENTS,
  getStoredPlannerTasks,
  getSynchronizedStudentProfile,
  getSynchronizedStudentAssignments,
  getSynchronizedStudentAssessments,
  getSynchronizedGuidanceNotes,
  getSynchronizedClassWeeklySchedule,
  getStudentSubmissions,
  type PlannerTask,
  type StudentProfile,
  type StudentAssessment,
  type GuidanceNoteItem,
  type StudentSubmission,
} from '@/lib/student/studentData'
import LiveClassRadar from '@components/Common/LiveClassRadar'
import CalendarReminderWidget from '@components/Common/CalendarReminderWidget'
import {
  getStoredCustomAssignments,
  DEFAULT_SCHOOL_ASSIGNMENTS,
  type SchoolAssignmentItem,
} from '@services/school_assignments/school_assignments'
import {
  DAYS_LIST,
  MIDDLE_PERIODS,
  type ScheduleEntry,
  type DayKey,
} from '@components/Mobile/Admin/MAdminScheduleClient'

// Color helper for timetable schedule entries
function getStudentDashboardSubjectColor(subject: string, color?: string) {
  const sub = subject.toLowerCase()
  if (color === 'blue' || sub.includes('türk') || sub.includes('edebiyat')) {
    return {
      bg: 'bg-blue-50/80 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-900/60',
      text: 'text-blue-700 dark:text-blue-300',
    }
  }
  if (color === 'indigo' || sub.includes('matematik')) {
    return {
      bg: 'bg-indigo-50/80 dark:bg-indigo-950/40',
      border: 'border-indigo-200 dark:border-indigo-900/60',
      text: 'text-indigo-700 dark:text-indigo-300',
    }
  }
  if (
    color === 'emerald' ||
    sub.includes('fen') ||
    sub.includes('fizik') ||
    sub.includes('kimya') ||
    sub.includes('biyoloji') ||
    sub.includes('din')
  ) {
    return {
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-900/60',
      text: 'text-emerald-700 dark:text-emerald-300',
    }
  }
  if (color === 'cyan' || sub.includes('bilişim') || sub.includes('kodlama') || sub.includes('yazılım')) {
    return {
      bg: 'bg-cyan-50/80 dark:bg-cyan-950/40',
      border: 'border-cyan-200 dark:border-cyan-900/60',
      text: 'text-cyan-700 dark:text-cyan-300',
    }
  }
  if (color === 'purple' || sub.includes('ingilizce') || sub.includes('yabancı')) {
    return {
      bg: 'bg-purple-50/80 dark:bg-purple-950/40',
      border: 'border-purple-200 dark:border-purple-900/60',
      text: 'text-purple-700 dark:text-purple-300',
    }
  }
  if (
    color === 'pink' ||
    sub.includes('görsel') ||
    sub.includes('sanat') ||
    sub.includes('müzik') ||
    sub.includes('rehberlik')
  ) {
    return {
      bg: 'bg-pink-50/80 dark:bg-pink-950/40',
      border: 'border-pink-200 dark:border-pink-900/60',
      text: 'text-pink-700 dark:text-pink-300',
    }
  }
  if (color === 'amber' || sub.includes('tarih') || sub.includes('sosyal')) {
    return {
      bg: 'bg-amber-50/80 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-900/60',
      text: 'text-amber-700 dark:text-amber-300',
    }
  }
  if (color === 'teal' || sub.includes('coğrafya') || sub.includes('hayat')) {
    return {
      bg: 'bg-teal-50/80 dark:bg-teal-950/40',
      border: 'border-teal-200 dark:border-teal-900/60',
      text: 'text-teal-700 dark:text-teal-300',
    }
  }
  if (color === 'orange' || sub.includes('beden') || sub.includes('spor') || sub.includes('oyun')) {
    return {
      bg: 'bg-orange-50/80 dark:bg-orange-950/40',
      border: 'border-orange-200 dark:border-orange-900/60',
      text: 'text-orange-700 dark:text-orange-300',
    }
  }
  return {
    bg: 'bg-blue-50/80 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-900/60',
    text: 'text-blue-700 dark:text-blue-300',
  }
}

export default function StudentDashboardView() {
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE)
  const [tasks, setTasks] = useState<PlannerTask[]>([])
  const [assignments, setAssignments] = useState<SchoolAssignmentItem[]>([])
  const [assessments, setAssessments] = useState<StudentAssessment[]>([])
  const [guidanceNotes, setGuidanceNotes] = useState<GuidanceNoteItem[]>([])
  const [weeklySchedule, setWeeklySchedule] = useState<ScheduleEntry[]>([])
  const [submissions, setSubmissions] = useState<Record<string, StudentSubmission>>({})
  // Timetable view mode: default is 'list' on mobile as requested, 'matrix' on desktop (>=1024px)
  const [scheduleViewMode, setScheduleViewMode] = useState<'matrix' | 'list'>('list')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setScheduleViewMode('matrix')
    }
  }, [])

  // Active day selection in the weekly schedule tabs
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<DayKey>(() => {
    const dayIndex = new Date().getDay()
    switch (dayIndex) {
      case 1:
        return 'mon'
      case 2:
        return 'tue'
      case 3:
        return 'wed'
      case 4:
        return 'thu'
      case 5:
        return 'fri'
      default:
        return 'mon'
    }
  })

  // Student Notes State (Synchronized with "Defterim ve Planlayıcım")
  const [studentNotes, setStudentNotes] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oxonom_student_notes_ercil')
        if (raw) return JSON.parse(raw)
      } catch (_) {}
    }
    return []
  })

  // Lesson Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [selectedLessonNoteTarget, setSelectedLessonNoteTarget] = useState<{
    lesson: ScheduleEntry
    dayLabel: string
    dayKey: string
    periodNumber: number
    periodTime: string
  } | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteCategory, setNoteCategory] = useState('Ders Notu')

  // Sync listener for notes from other tabs or Planner
  useEffect(() => {
    const handleNotesSync = () => {
      try {
        const raw = localStorage.getItem('oxonom_student_notes_ercil')
        if (raw) setStudentNotes(JSON.parse(raw))
      } catch (_) {}
    }
    window.addEventListener('storage', handleNotesSync)
    window.addEventListener('oxonom_student_notes_updated', handleNotesSync)
    return () => {
      window.removeEventListener('storage', handleNotesSync)
      window.removeEventListener('oxonom_student_notes_updated', handleNotesSync)
    }
  }, [])

  const getLessonNotes = (dayKey: string, periodNumber: number, subjectName: string) => {
    return studentNotes.filter((n) => {
      if (n.lessonKey === `${dayKey}-${periodNumber}`) return true
      if (
        n.course &&
        n.course.toLowerCase() === subjectName.toLowerCase() &&
        n.lessonInfo &&
        n.lessonInfo.includes(`${periodNumber}. Ders`)
      ) {
        return true
      }
      return false
    })
  }

  const handleOpenLessonNoteModal = (
    lesson: ScheduleEntry,
    dayLabel: string,
    dayKey: string,
    periodNumber: number,
    periodTime: string
  ) => {
    const subject = (lesson as any)?.subjectName || lesson?.subject || 'Ders'
    setSelectedLessonNoteTarget({
      lesson,
      dayLabel,
      dayKey,
      periodNumber,
      periodTime,
    })
    setNoteTitle(`${subject} — ${dayLabel} ${periodNumber}. Ders`)
    setNoteContent('')
    setNoteCategory('Ders Notu')
    setIsNoteModalOpen(true)
  }

  const handleSaveLessonNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLessonNoteTarget) return
    if (!noteTitle.trim() || !noteContent.trim()) {
      toast.error('Lütfen not başlığı ve not içeriği giriniz.')
      return
    }

    const subject =
      (selectedLessonNoteTarget.lesson as any)?.subjectName ||
      selectedLessonNoteTarget.lesson?.subject ||
      'Ders'

    const newNote = {
      id: `sn-${Date.now()}`,
      title: noteTitle.trim(),
      course: subject,
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
      content: noteContent.trim(),
      category: noteCategory,
      lessonKey: `${selectedLessonNoteTarget.dayKey}-${selectedLessonNoteTarget.periodNumber}`,
      lessonInfo: `${selectedLessonNoteTarget.dayLabel} · ${selectedLessonNoteTarget.periodNumber}. Ders (${selectedLessonNoteTarget.periodTime})`,
      teacherName: selectedLessonNoteTarget.lesson.teacherName || '',
      roomName: selectedLessonNoteTarget.lesson.roomName || '',
    }

    const updated = [newNote, ...studentNotes]
    setStudentNotes(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_student_notes_ercil', JSON.stringify(updated))
      window.dispatchEvent(new Event('oxonom_student_notes_updated'))
    }

    toast.success(`"${subject}" ders notu kaydedildi ve Defterim/Planlayıcım alanına eklendi!`, {
      icon: '📝',
      duration: 4000,
    })

    setNoteContent('')
    setIsNoteModalOpen(false)
  }

  const handleDeleteLessonNote = (noteId: string) => {
    const updated = studentNotes.filter((n) => n.id !== noteId)
    setStudentNotes(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_student_notes_ercil', JSON.stringify(updated))
      window.dispatchEvent(new Event('oxonom_student_notes_updated'))
    }
    toast.success('Not silindi.')
  }

  useEffect(() => {
    const syncAll = () => {
      const p = getSynchronizedStudentProfile()
      setProfile(p)
      setTasks(getStoredPlannerTasks())
      setAssignments(getSynchronizedStudentAssignments())
      setAssessments(getSynchronizedStudentAssessments())
      setGuidanceNotes(getSynchronizedGuidanceNotes())
      setWeeklySchedule(getSynchronizedClassWeeklySchedule(p.className))
      setSubmissions(getStudentSubmissions())
    }

    syncAll()

    // Fetch remote schedule
    const fetchRemoteSchedule = async () => {
      try {
        const res = await fetch('/api/schedule', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (data && Array.isArray(data.schedule) && data.schedule.length > 0) {
            setWeeklySchedule(data.schedule)
            try {
              localStorage.setItem('oxonom_admin_schedule_30', JSON.stringify(data.schedule))
              localStorage.setItem('oxonom_schedule_30', JSON.stringify(data.schedule))
              if (Array.isArray(data.periods)) {
                localStorage.setItem('oxonom_admin_periods_30', JSON.stringify(data.periods))
                localStorage.setItem('oxonom_periods_30', JSON.stringify(data.periods))
              }
            } catch (_) {}
          }
        }
      } catch (_) {}
    }

    const fetchRemoteExams = async () => {
      try {
        const res = await fetch('/api/exams', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (data && Array.isArray(data.exams)) {
            try {
              const deletedRaw = localStorage.getItem('oxonom_deleted_exam_ids')
              const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : []
              const cleanExams = data.exams.filter((e: any) => !deletedIds.includes(e.id))
              localStorage.setItem('oxonom_school_exam_calendar', JSON.stringify(cleanExams))
            } catch (_) {}
            setAssessments(getSynchronizedStudentAssessments())
          }
        }
      } catch (_) {}
    }

    fetchRemoteExams()
    const scheduleInterval = setInterval(fetchRemoteSchedule, 5000)

    window.addEventListener('oxonom_student_updated', syncAll)
    window.addEventListener('oxonom_assignments_updated', syncAll)
    window.addEventListener('oxonom_student_homeworks_updated', syncAll)
    window.addEventListener('oxonom_student_submission_updated', syncAll)
    window.addEventListener('oxonom_teacher_profile_updated', syncAll)
    window.addEventListener('oxonom_attendance_updated', syncAll)
    window.addEventListener('oxonom_admin_schedule_updated', syncAll)
    window.addEventListener('oxonom_schedule_updated', syncAll)
    window.addEventListener('oxonom_schedule_published', syncAll)
    window.addEventListener('oxonom_exam_calendar_updated', syncAll)
    window.addEventListener('storage', syncAll)

    return () => {
      clearInterval(scheduleInterval)
      window.removeEventListener('oxonom_student_updated', syncAll)
      window.removeEventListener('oxonom_assignments_updated', syncAll)
      window.removeEventListener('oxonom_student_homeworks_updated', syncAll)
      window.removeEventListener('oxonom_student_submission_updated', syncAll)
      window.removeEventListener('oxonom_teacher_profile_updated', syncAll)
      window.removeEventListener('oxonom_attendance_updated', syncAll)
      window.removeEventListener('oxonom_admin_schedule_updated', syncAll)
      window.removeEventListener('oxonom_schedule_updated', syncAll)
      window.removeEventListener('oxonom_schedule_published', syncAll)
      window.removeEventListener('oxonom_exam_calendar_updated', syncAll)
      window.removeEventListener('storage', syncAll)
    }
  }, [])

  // Schedule periods
  const schedulePeriods = useMemo(() => {
    const hasPeriod7 = weeklySchedule.some((e) => e.period >= 7)
    if (hasPeriod7) {
      return MIDDLE_PERIODS
    }
    if (typeof window !== 'undefined') {
      try {
        const saved =
          localStorage.getItem('oxonom_admin_periods_30') ||
          localStorage.getItem('oxonom_periods_30') ||
          localStorage.getItem('oxonom_admin_periods')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
          }
        }
      } catch (_) {}
    }
    return MIDDLE_PERIODS.filter((p) => p.periodNumber <= 6)
  }, [weeklySchedule])

  const todayKey: DayKey = useMemo(() => {
    const dayIndex = new Date().getDay()
    switch (dayIndex) {
      case 1:
        return 'mon'
      case 2:
        return 'tue'
      case 3:
        return 'wed'
      case 4:
        return 'thu'
      case 5:
        return 'fri'
      default:
        return 'mon'
    }
  }, [])

  const selectedDayClasses = useMemo(() => {
    return weeklySchedule
      .filter((e) => e.day === selectedScheduleDay)
      .sort((a, b) => a.period - b.period)
  }, [weeklySchedule, selectedScheduleDay])

  const todayClasses = useMemo(() => {
    return weeklySchedule
      .filter((e) => e.day === todayKey)
      .sort((a, b) => a.period - b.period)
  }, [weeklySchedule, todayKey])

  const todayClassesCount = todayClasses.length || 6

  // Find today's current or upcoming active lesson for "Kaldığın Yerden Devam Et"
  const activeOrNextLesson = useMemo(() => {
    if (todayClasses.length > 0) {
      return todayClasses[0]
    }
    if (weeklySchedule.length > 0) {
      return weeklySchedule[0]
    }
    return null
  }, [todayClasses, weeklySchedule])

  // Pending assignments
  const pendingAssignments = useMemo(() => {
    return assignments
      .filter((asg) => {
        const id = String(asg.assignment_uuid || asg.id)
        return !submissions[id]
      })
      .slice(0, 4)
  }, [assignments, submissions])

  // Total and submitted assignments for clear metrics
  const allPendingAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      const id = String(asg.assignment_uuid || asg.id)
      return !submissions[id]
    })
  }, [assignments, submissions])

  const submittedAssignmentsCount = useMemo(() => {
    return assignments.filter((asg) => {
      const id = String(asg.assignment_uuid || asg.id)
      return Boolean(submissions[id])
    }).length
  }, [assignments, submissions])

  const totalAssignmentsCount = Math.max(assignments.length, 1)
  const homeworkProgressPercent = Math.min(
    100,
    Math.round((submittedAssignmentsCount / totalAssignmentsCount) * 100)
  )

  // Hero slider state with page & direction for 3D drag/swipe
  const [[heroPage, heroDirection], setHeroPage] = useState([0, 0])
  const heroSlideIndex = ((heroPage % 2) + 2) % 2

  const paginateHero = (newDirection: number) => {
    setHeroPage(([prevPage]) => [prevPage + newDirection, newDirection])
  }

  // Auto-advance hero slider every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      paginateHero(1)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  const hero3DVariants: Variants = {
    enter: (dir: number) => ({
      x: dir >= 0 ? 300 : -300,
      rotateY: dir >= 0 ? 25 : -25,
      scale: 0.94,
      opacity: 0.65,
    }),
    center: {
      x: 0,
      rotateY: 0,
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 260,
        damping: 24,
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      rotateY: dir < 0 ? 25 : -25,
      scale: 0.94,
      opacity: 0.65,
      transition: {
        duration: 0.22,
        ease: 'easeInOut' as const,
      },
    }),
  }

  // Parse exam date
  const parseExamDate = (dateStr: string): Date | null => {
    if (!dateStr) return null
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10)
        const m = parseInt(parts[1], 10) - 1
        const d = parseInt(parts[2], 10)
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          return new Date(y, m, d)
        }
      }
    }
    if (dateStr.includes('.')) {
      const parts = dateStr.split('.')
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
      }
    }
    const monthsMap: Record<string, number> = {
      ocak: 0,
      şubat: 1,
      mart: 2,
      nisan: 3,
      mayıs: 4,
      haziran: 5,
      temmuz: 6,
      ağustos: 7,
      eylül: 8,
      ekim: 9,
      kasım: 10,
      aralık: 11,
    }
    const parts = dateStr.trim().split(/\s+/)
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10)
      const month = monthsMap[parts[1].toLowerCase()]
      const year = parseInt(parts[2], 10)
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        return new Date(year, month, day)
      }
    }
    try {
      const d = new Date(dateStr)
      if (!isNaN(d.getTime())) return d
    } catch (_) {}
    return null
  }

  // Upcoming exams
  const upcomingWeekExams = useMemo(() => {
    const now = new Date()
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    const sorted = assessments
      .filter((a) => a.status === 'upcoming')
      .map((exam) => {
        const parsed = parseExamDate(exam.date)
        let daysLeft: number | null = null
        if (parsed) {
          const examMidnight = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime()
          daysLeft = Math.round((examMidnight - todayMidnight) / (1000 * 60 * 60 * 24))
        }
        return {
          ...exam,
          parsedDate: parsed,
          daysLeft,
        }
      })
      .sort((a, b) => {
        if (a.daysLeft !== null && b.daysLeft !== null) {
          return a.daysLeft - b.daysLeft
        }
        return 0
      })

    return sorted.slice(0, 4)
  }, [assessments])

  // Toggle quick planner task
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    setTasks(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_student_planner_tasks_ercil', JSON.stringify(updated))
    }
  }

  const completedTasksCount = tasks.filter((t) => t.completed).length
  const totalTasksCount = tasks.length || 0

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hours = new Date().getHours()
    if (hours < 12) return 'Günaydın'
    if (hours < 18) return 'İyi günler'
    return 'İyi akşamlar'
  }, [])

  // Dynamic Academic Standing Theme based on real GPA
  const academicStatusTheme = useMemo(() => {
    const gpa = profile.gpa || 0
    if (gpa === 0) {
      return {
        cardBg: 'bg-slate-50 dark:bg-slate-800/40',
        cardBorder: 'border-slate-200 dark:border-slate-700/60',
        avatarBg: 'from-slate-400 to-slate-600',
        scoreColor: 'text-slate-600 dark:text-slate-300',
        statusColor: 'text-slate-500 dark:text-slate-400',
        statusLabel: 'Not Girişi Sürecinde',
      }
    }
    if (gpa < 50) {
      return {
        cardBg: 'bg-rose-50/90 dark:bg-rose-950/40',
        cardBorder: 'border-rose-200 dark:border-rose-800/60',
        avatarBg: 'from-rose-500 to-red-600',
        scoreColor: 'text-rose-600 dark:text-rose-400',
        statusColor: 'text-rose-600 dark:text-rose-400',
        statusLabel: 'Kritik Seviye / Destek Gerekli',
      }
    }
    if (gpa < 75) {
      return {
        cardBg: 'bg-[#F7F0FA] dark:bg-[#2D2035]',
        cardBorder: 'border-[#E8DFEB] dark:border-[#49364F]',
        avatarBg: 'from-[#4B075F] to-[#8D49A6]',
        scoreColor: 'text-[#4B075F] dark:text-[#C58ADB]',
        statusColor: 'text-[#8D49A6] dark:text-[#C58ADB]',
        statusLabel: 'Orta Düzey / Geliştirilebilir',
      }
    }
    return {
      cardBg: 'bg-emerald-50/90 dark:bg-emerald-950/40',
      cardBorder: 'border-emerald-200 dark:border-emerald-800/60',
      avatarBg: 'from-emerald-500 to-teal-600',
      scoreColor: 'text-emerald-600 dark:text-emerald-400',
      statusColor: 'text-emerald-600 dark:text-emerald-400',
      statusLabel: 'Üstün Başarı / Takdir Seviyesi',
    }
  }, [profile.gpa])

  // Core actual courses of 1/A curriculum (100% REAL DATA, NO MOCK) with richer, distinguishable pastel tones
  const realCoreCourses = [
    {
      id: 'turkce',
      name: 'Türkçe',
      teacher: 'Özlem ZOR',
      hours: '10 Saat / Hafta',
      icon: BookOpen,
      bg: 'bg-[#EDE9FE] dark:bg-[#2E1065]/40',
      border: 'border-[#DDD6FE] dark:border-purple-800/60',
      iconBg: 'bg-purple-600/15 text-purple-700 dark:text-purple-300',
    },
    {
      id: 'matematik',
      name: 'Matematik',
      teacher: 'Özlem ZOR',
      hours: '5 Saat / Hafta',
      icon: Lightbulb,
      bg: 'bg-[#FFE4E6] dark:bg-[#881337]/40',
      border: 'border-[#FECDD3] dark:border-rose-800/60',
      iconBg: 'bg-rose-600/15 text-rose-700 dark:text-rose-300',
    },
    {
      id: 'hayat-bilgisi',
      name: 'Hayat Bilgisi',
      teacher: 'Özlem ZOR',
      hours: '4 Saat / Hafta',
      icon: Compass,
      bg: 'bg-[#DCFCE7] dark:bg-[#052E16]/40',
      border: 'border-[#BBF7D0] dark:border-emerald-800/60',
      iconBg: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300',
    },
    {
      id: 'yabanci-dil-ingilizce',
      name: 'Yabancı Dil (İngilizce)',
      teacher: 'Nilgün KAYA',
      hours: '2 Saat / Hafta',
      icon: Headphones,
      bg: 'bg-[#FEF3C7] dark:bg-[#78350F]/40',
      border: 'border-[#FDE68A] dark:border-amber-800/60',
      iconBg: 'bg-amber-600/15 text-amber-700 dark:text-amber-300',
    },
  ]

  const activeSubjectName =
    (activeOrNextLesson as any)?.subjectName ||
    activeOrNextLesson?.subject ||
    'Türkçe'
  const activeTeacherName = activeOrNextLesson?.teacherName || profile.mentorTeacher || 'Özlem ZOR'
  const activeRoomName = activeOrNextLesson?.roomName || `Derslik ${profile.className}`

  // Smart Academic Performance Calculation
  const isGoodAcademic = profile.gpa >= 70 || (profile.classRank > 0 && profile.classRank <= 10)

  const heroSlides = [
    {
      id: 0,
      tag: `${profile.className} Sınıfı • MEB Müfredatı`,
      tagEmoji: '🇹🇷',
      title: (
        <>
          {greeting},{' '}
          <span className="text-cyan-200 drop-shadow-sm">{profile.firstName}!</span> 👋
        </>
      ),
      description: (
        <>
          Bugün seni{' '}
          <strong className="font-extrabold text-white underline decoration-cyan-300/60 decoration-2 underline-offset-2">
            {todayClassesCount} ders saati
          </strong>{' '}
          ve{' '}
          <strong className="font-extrabold text-white underline decoration-amber-300/60 decoration-2 underline-offset-2">
            {allPendingAssignments.length} aktif ödev
          </strong>{' '}
          bekliyor.
        </>
      ),
      primaryBtn: {
        label: 'Dersine Devam Et',
        href: '/student/courses',
        icon: ArrowRight,
      },
      secondaryBtn: {
        label: `Ödevler (${allPendingAssignments.length})`,
        href: '/student/assignments',
        icon: BookOpen,
      },
    },
    {
      id: 1,
      tag: isGoodAcademic
        ? `🏆 Sınıf Başarısı • Derece: ${profile.classRank}.`
        : `🎯 Akademik Hedef & Motivasyon`,
      tagEmoji: isGoodAcademic ? '🌟' : '💪',
      title: isGoodAcademic ? (
        profile.classRank === 1 ? (
          <>
            Harika Gidiyorsun, <span className="text-amber-200 drop-shadow-sm">Sınıf Birincisisin!</span> 🌟
          </>
        ) : (
          <>
            Tebrikler, <span className="text-amber-200 drop-shadow-sm">Başarın Yüksek Seviyede!</span> 🌟
          </>
        )
      ) : (
        <>
          Hedeflerine <span className="text-cyan-200 drop-shadow-sm">Adım Adım Odaklan!</span> 💪
        </>
      ),
      description: isGoodAcademic ? (
        profile.gpa > 0 ? (
          <>
            Genel not ortalaman{' '}
            <strong className="font-extrabold text-white underline decoration-amber-300/60 decoration-2 underline-offset-2">
              {profile.gpa} Ort.
            </strong>
            . Bu tempoyla devam ederek dereceni rahatlıkla koruyabilirsin.
          </>
        ) : (
          <>Ders içi katılımın ve devamlılık oranın takdir seviyesinde.</>
        )
      ) : (
        <>
          Daha yüksek bir not ortalaması için çalışma planı oluşturup eksik olduğun ders konularına odaklanarak hızla yükselebilirsin.
        </>
      ),
      primaryBtn: isGoodAcademic
        ? {
            label: 'Gelişim Raporum',
            href: '/student/progress',
            icon: TrendingUp,
          }
        : {
            label: 'Çalışma Planı Yap',
            href: '/student/planner',
            icon: CheckSquare,
          },
      secondaryBtn: isGoodAcademic
        ? {
            label: 'Not & Değerlendirmeler',
            href: '/student/assessments',
            icon: Award,
          }
        : {
            label: 'Derslerimi İncele',
            href: '/student/courses',
            icon: BookOpen,
          },
    },
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden p-3.5 sm:p-6 lg:p-8 max-w-[1520px] mx-auto space-y-6 lg:space-y-8 select-none">
      {/* ── TOP SECTION: 2 COLUMNS (Left Main Content + Right Widgets Column) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full min-w-0">
        {/* ── LEFT MAIN COLUMN (lg:col-span-8) ── */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-7 min-w-0 w-full">
          {/* ── VIBRANT OXONOM BRAND HERO SLIDER (Sabit Yükseklik, Güzel Pattern & 3D Sürükleme) ── */}
          <div
            className="relative mt-2 sm:mt-4 lg:mt-6 rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-[#241329] via-[#4B075F] to-[#8D49A6] border border-purple-400/30 dark:border-purple-800/40 p-5 sm:p-6 lg:p-7 text-white shadow-[0_16px_45px_rgba(75,7,95,0.25)] overflow-hidden select-none h-[255px] sm:h-[235px] lg:h-[235px] flex flex-col justify-between"
            style={{ perspective: 1000 }}
          >
            {/* ── HIGH-DEFINITION EDUCATIONAL & GEOMETRIC PATTERN (Daha Belirgin Güzel Pattern) ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[28px] sm:rounded-[32px]">
              {/* Dynamic Grid with Crosshairs & Dots */}
              <svg
                className="absolute inset-0 w-full h-full opacity-20 dark:opacity-25 text-white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="hero-pattern-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                    <path d="M 36 0 L 0 0 0 36" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2,3" />
                    <circle cx="36" cy="0" r="1.5" fill="currentColor" opacity="0.9" />
                    <circle cx="0" cy="36" r="1.5" fill="currentColor" opacity="0.9" />
                    <circle cx="18" cy="18" r="0.75" fill="currentColor" opacity="0.6" />
                  </pattern>
                  <linearGradient id="hero-pattern-mask" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
                  </linearGradient>
                  <mask id="hero-mask-layer">
                    <rect width="100%" height="100%" fill="url(#hero-pattern-mask)" />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-pattern-grid)" mask="url(#hero-mask-layer)" />
              </svg>

              {/* Tech / Math Accent Constellation */}
              <svg
                className="absolute right-0 top-0 w-80 h-full opacity-25 text-white pointer-events-none hidden sm:block"
                viewBox="0 0 320 240"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M30 0L110 70H210L270 15" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" />
                <path d="M150 70L190 115L270 115" stroke="currentColor" strokeWidth="1.2" />
                <path d="M190 115L230 155H310" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" />
                <circle cx="110" cy="70" r="3" fill="currentColor" />
                <circle cx="210" cy="70" r="3" fill="currentColor" />
                <circle cx="190" cy="115" r="3.5" fill="currentColor" />
                <circle cx="230" cy="155" r="3" fill="currentColor" />
                <circle cx="270" cy="15" r="3" fill="currentColor" />
              </svg>

              {/* Ambient Glowing Orbs */}
              <motion.div
                animate={{
                  x: [0, 20, 0],
                  y: [0, -15, 0],
                  scale: [1, 1.06, 1],
                }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-400/25 rounded-full blur-3xl pointer-events-none"
              />
              <motion.div
                animate={{
                  x: [0, -20, 0],
                  y: [0, 15, 0],
                  scale: [1, 1.08, 1],
                }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-16 -left-16 w-72 h-72 bg-blue-300/25 rounded-full blur-3xl pointer-events-none"
              />
            </div>

            {/* ── SABİT SAĞ ÜST OK BUTONLARI (Kutunun sağ üstünde sabit) ── */}
            <div className="absolute top-5 right-5 sm:top-6 sm:right-7 z-30 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => paginateHero(-1)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-xs"
                title="Önceki Slayt"
                aria-label="Önceki"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => paginateHero(1)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-xs"
                title="Sonraki Slayt"
                aria-label="Sonraki"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* ── 3D DRAGGABLE SLIDER İÇERİĞİ (Sürükleyerek diğer slidera geçiş) ── */}
            <div className="relative z-10 w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
              <AnimatePresence custom={heroDirection} mode="wait">
                <motion.div
                  key={heroPage}
                  custom={heroDirection}
                  variants={hero3DVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset, velocity }) => {
                    if (offset.x < -35 || velocity.x < -250) {
                      paginateHero(1)
                    } else if (offset.x > 35 || velocity.x > 250) {
                      paginateHero(-1)
                    }
                  }}
                  className="h-full flex flex-col justify-between w-full cursor-grab active:cursor-grabbing"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Badge */}
                  <div className="flex items-center gap-2 self-start pr-20 shrink-0">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black text-white border border-white/30 shadow-xs">
                      <span className="text-xs">{heroSlides[heroSlideIndex].tagEmoji}</span>
                      <span className="truncate max-w-[260px] sm:max-w-none">{heroSlides[heroSlideIndex].tag}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="my-auto py-1 space-y-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight line-clamp-1">
                      {heroSlides[heroSlideIndex].title}
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-blue-100/90 leading-relaxed max-w-xl line-clamp-2">
                      {heroSlides[heroSlideIndex].description}
                    </p>
                  </div>

                  {/* Action Buttons & Indicator Dots */}
                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link
                          href={heroSlides[heroSlideIndex].primaryBtn.href}
                          className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white hover:bg-[#FCE8FA] text-[#4B075F] font-black text-xs sm:text-sm shadow-lg shadow-black/15 transition-all"
                        >
                          <span>{heroSlides[heroSlideIndex].primaryBtn.label}</span>
                          {React.createElement(heroSlides[heroSlideIndex].primaryBtn.icon, {
                            size: 15,
                          })}
                        </Link>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link
                          href={heroSlides[heroSlideIndex].secondaryBtn.href}
                          className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md font-bold text-xs sm:text-sm border border-white/25 shadow-xs transition-all"
                        >
                          {React.createElement(heroSlides[heroSlideIndex].secondaryBtn.icon, {
                            size: 14,
                            className: 'text-cyan-200',
                          })}
                          <span>{heroSlides[heroSlideIndex].secondaryBtn.label}</span>
                        </Link>
                      </motion.div>
                    </div>

                    {/* Interactive Slide Dots */}
                    <div className="flex items-center gap-1.5 self-start sm:self-center">
                      {heroSlides.map((s, idx) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            if (heroSlideIndex !== idx) {
                              paginateHero(idx > heroSlideIndex ? 1 : -1)
                            }
                          }}
                          className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            heroSlideIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Slayt ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── 1. YAKLAŞAN SINAVLAR & BEKLEYEN ÖDEVLER (WIDGET ÜST KISMA TAŞINDI) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch">
            {/* ── YAKLAŞAN SINAVLAR ── */}
            <div
              id="yaklasan-sinavlar"
              className="p-5 sm:p-6 rounded-[28px] bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] shadow-sm space-y-3.5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        Yaklaşan Sınavlar
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
                        {upcomingWeekExams.length} Sınav
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Resmi sınav takvimi ({profile.className || '1/A'})
                    </p>
                  </div>
                </div>

                <Link
                  href="/student/planner?tab=calendar"
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Tümü</span>
                  <ChevronRight size={13} />
                </Link>
              </div>

              {upcomingWeekExams.length > 0 ? (
                <div className="space-y-2.5 flex-1">
                  {upcomingWeekExams.slice(0, 3).map((exam) => {
                    const daysLeft = (exam as any).daysLeft
                    let countdownLabel = 'Yaklaşıyor'
                    if (daysLeft === 0) countdownLabel = 'Bugün!'
                    else if (daysLeft === 1) countdownLabel = 'Yarın!'
                    else if (daysLeft !== null && daysLeft > 1 && daysLeft <= 7) {
                      countdownLabel = `${daysLeft} Gün Kaldı`
                    } else if (daysLeft !== null && daysLeft > 7) {
                      countdownLabel = `${daysLeft} Gün Sonra`
                    }

                    return (
                      <div
                        key={exam.id}
                        className="p-3 rounded-2xl bg-amber-50/40 dark:bg-[#2D2035] border border-amber-200/60 dark:border-amber-900/30 flex items-center justify-between gap-3 hover:border-amber-400 transition-all"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9.5px] font-black px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                              {exam.courseName}
                            </span>
                            <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                              {countdownLabel}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {exam.title}
                          </h4>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>{exam.date} • {exam.time}</span>
                            <span>•</span>
                            <span>{exam.location}</span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-xs">
                            {exam.durationMinutes} dk
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4 text-center bg-slate-50 dark:bg-[#2D2035] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <CheckCircle2 size={22} className="mx-auto text-emerald-500 mb-1" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Önümüzdeki günlerde planlanmış sınavın bulunmuyor 🎉
                  </p>
                </div>
              )}
            </div>

            {/* ── BEKLEYEN ÖDEVLER ── */}
            <div className="p-5 sm:p-6 rounded-[28px] bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] shadow-sm space-y-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        Bekleyen Ödevler
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                        {pendingAssignments.length} Aktif
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Öğretmenler tarafından verilen çalışmalar
                    </p>
                  </div>
                </div>

                <Link
                  href="/student/assignments"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Tümü</span>
                  <ChevronRight size={13} />
                </Link>
              </div>

              {pendingAssignments.length > 0 ? (
                <div className="space-y-2.5 flex-1">
                  {pendingAssignments.slice(0, 3).map((asg) => (
                    <Link
                      key={asg.id || asg.assignment_uuid}
                      href={`/student/assignments/${asg.assignment_uuid || asg.id}`}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-[#2D2035] border border-blue-50 dark:border-blue-900/30 flex items-center justify-between gap-3 hover:border-emerald-400 transition-all group"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9.5px] font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600">
                            {(asg as any).subject_name || asg.subject || 'Ders'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Son: {asg.due_date ? String(asg.due_date).slice(0, 10) : '28.10.2026'}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                          {asg.title}
                        </h4>
                        <div className="text-[10px] text-slate-400">
                          {asg.teacher_name || 'Öğretmen'}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-[11px] shadow-xs group-hover:translate-x-0.5 transition-transform">
                          <span>Çöz</span>
                          <ArrowRight size={11} />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center bg-slate-50 dark:bg-[#2D2035] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <CheckCircle2 size={22} className="mx-auto text-emerald-500 mb-1" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Tüm ödevlerin tamamlandı, tebrikler! 🌟
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── 2. NOTLARIM & AJANDA HATIRLATICI TAKVİMİ ── */}
          <div>
            <CalendarReminderWidget
              storageKey="oxonom_student_calendar_reminders"
              role="student"
              compactMode={true}
              title="Notlarım & Ajanda Takvimi"
              description="Ders çalışma günlerine özel notlar ekleyebilir, sesli pop-up hatırlatıcılar kurabilirsiniz."
            />
          </div>

          {/* ── 3. CANLI DERS TAKİP RADARI (MİNİMAL & EN BAŞTA DEĞİL) ── */}
          <div className="p-4 sm:p-5 rounded-[26px] bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  Canlı Ders Takibi
                </h3>
              </div>
              <Link
                href="/student/courses"
                className="text-[11px] font-bold text-[#4B075F] dark:text-[#C58ADB] hover:underline flex items-center gap-0.5"
              >
                <span>Ders Programı</span>
                <ChevronRight size={13} />
              </Link>
            </div>
            <LiveClassRadar role="student" initialClassCode={profile.className || '1/A'} />
          </div>

          {/* ── REHBERLİK & ÖĞRETMEN GÖRÜŞÜ VE YAKLAŞAN SINAV ÖZETİ (Aradaki boşluğu dolduran alan) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* Card 1: Öğretmen & Rehberlik Görüşü */}
            <div className="p-4 sm:p-5 rounded-[26px] bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] shadow-[0_6px_25px_rgba(75,7,95,0.03)] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F0D8FA] dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center shrink-0">
                    <MessageSquareQuote size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                      Rehberlik & Öğretmen Notu
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {profile.mentorTeacher || 'Ebru TEKNECİ'}
                    </p>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#FCE8FA] text-[#8D49A6] dark:text-[#F17AE6] border border-[#D5C5DC]/40">
                  Resmi Görüş
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FCF9FD] dark:bg-[#2D2035] border border-[#E8DFEB] dark:border-[#49364F]">
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium italic leading-relaxed">
                  "{guidanceNotes.length > 0
                    ? guidanceNotes[0].content
                    : 'Öğrencinin ders içi motivasyonu, ödev disiplini ve sınıf içi etkileşimi yüksek seviyededir.'}"
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E8DFEB] dark:border-[#49364F] text-[10px] text-slate-400 font-bold">
                  <span>{guidanceNotes.length > 0 ? guidanceNotes[0].date : '28.09.2026'}</span>
                  <span className="text-[#8D49A6] dark:text-[#C58ADB]">Danışman Öğretmen Onaylı</span>
                </div>
              </div>
            </div>

            {/* Card 2: Yaklaşan Sınav & Değerlendirme Takvimi Özeti */}
            <div className="p-4 sm:p-5 rounded-[26px] bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] shadow-[0_6px_25px_rgba(75,7,95,0.03)] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                      Sınav & Değerlendirme
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      Resmi Takvim ({profile.className})
                    </p>
                  </div>
                </div>
                <Link
                  href="/student/planner?tab=calendar"
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Takvim</span>
                  <ChevronRight size={13} />
                </Link>
              </div>

              {upcomingWeekExams.length > 0 ? (
                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9.5px] font-black px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        {upcomingWeekExams[0].courseName}
                      </span>
                      <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        {(upcomingWeekExams[0] as any).daysLeft === 0
                          ? 'Bugün!'
                          : (upcomingWeekExams[0] as any).daysLeft === 1
                          ? 'Yarın!'
                          : `${(upcomingWeekExams[0] as any).daysLeft} Gün Kaldı`}
                      </span>
                    </div>
                    <div className="text-xs font-black text-slate-900 dark:text-white truncate mt-1">
                      {upcomingWeekExams[0].title}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      {upcomingWeekExams[0].date} • {upcomingWeekExams[0].time}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-xs">
                      {upcomingWeekExams[0].durationMinutes} dk
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#15213B] border border-blue-50 dark:border-blue-900/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                      Yakın Tarihte Sınav Yok
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Ders tekrarları ve konu testlerine odaklanabilirsin.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── HAFTALIK DERS PROGRAMI (Müdürlük Onaylı Canlı Senkronize Matrix) ── */}
          <div className="p-6 sm:p-7 rounded-[32px] bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] shadow-[0_8px_30px_rgba(75,7,95,0.04)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0D8FA] dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Haftalık Ders Programı ({profile.className})
                    </h2>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#E4F5ED] text-[#16805D] border border-[#16805D]/20">
                      Canlı Senkronize
                    </span>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#F0D8FA] text-[#4B075F] border border-[#D5C5DC]">
                      Müdürlük Onaylı
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Okul müdürlüğü tarafından onaylanan haftalık MEB ders akışı ({weeklySchedule.length || 30} Saat / Hafta)
                  </p>
                </div>
              </div>

              {/* View Switcher & Link to full schedule */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setScheduleViewMode('matrix')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      scheduleViewMode === 'matrix'
                        ? 'bg-white dark:bg-[#211729] text-[#4B075F] dark:text-[#C58ADB] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Table size={13} />
                    <span>Tablo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleViewMode('list')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      scheduleViewMode === 'list'
                        ? 'bg-white dark:bg-[#211729] text-[#4B075F] dark:text-[#C58ADB] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <List size={13} />
                    <span>Günlük Liste</span>
                  </button>
                </div>

                <Link
                  href="/student/courses?tab=schedule"
                  className="text-xs font-black text-[#4B075F] dark:text-[#C58ADB] hover:underline flex items-center gap-1 pl-1"
                >
                  <span>Tam Ekran</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* TABLO MATRİS GÖRÜNÜMÜ: 5 Gün x Periyotlar */}
            {scheduleViewMode === 'matrix' && (
              <div className="w-full max-w-full rounded-2xl border border-[#E8DFEB] dark:border-[#49364F] overflow-hidden">
                <div className="w-full max-w-full overflow-x-auto touch-pan-x custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[620px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-blue-100/80 dark:border-blue-900/60 text-[10px] font-black text-slate-600 dark:text-slate-300">
                        <th className="p-3 w-28 text-center shrink-0">Saat / Periyot</th>
                        {DAYS_LIST.map((day) => {
                          const dayCount = weeklySchedule.filter((e) => e.day === day.key).length
                          const isToday = todayKey === day.key
                          return (
                            <th key={day.key} className="p-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <span>{day.label}</span>
                                {isToday && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Bugün" />
                                )}
                              </div>
                              <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                                {dayCount} Ders
                              </div>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50 dark:divide-blue-950/40 text-xs">
                      {schedulePeriods.map((period) => (
                        <tr
                          key={period.periodNumber}
                          className="hover:bg-blue-50/30 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          {/* Period & Time Column */}
                          <td className="p-2.5 text-center bg-slate-50/50 dark:bg-slate-900/30 border-r border-blue-50 dark:border-blue-950/50 shrink-0">
                            <div className="font-black text-slate-800 dark:text-slate-200 text-xs">
                              {period.periodNumber}. Ders
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {period.time}
                            </div>
                          </td>

                          {/* Day Columns */}
                          {DAYS_LIST.map((day) => {
                            const match = weeklySchedule.find(
                              (e) => e.day === day.key && e.period === period.periodNumber
                            )
                            const subjectName = (match as any)?.subjectName || match?.subject || ''
                            const style = match
                              ? getStudentDashboardSubjectColor(subjectName, (match as any).color)
                              : null

                            const lessonNotes = match
                              ? getLessonNotes(day.key, period.periodNumber, subjectName)
                              : []
                            const hasNotes = lessonNotes.length > 0

                            return (
                              <td
                                key={day.key}
                                className="p-1.5 align-top border-r last:border-r-0 border-blue-50 dark:border-blue-950/40"
                              >
                                {match ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenLessonNoteModal(
                                        match,
                                        day.label,
                                        day.key,
                                        period.periodNumber,
                                        period.time
                                      )
                                    }
                                    className={`w-full text-left block p-2 rounded-2xl border transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer relative group ${style?.bg} ${style?.border} ${style?.text}`}
                                  >
                                    <div className="flex items-start justify-between gap-1">
                                      <div className="font-black text-[11px] leading-tight truncate flex-1">
                                        {subjectName}
                                      </div>
                                      {hasNotes && (
                                        <span
                                          title={`${lessonNotes.length} Not Kayıtlı`}
                                          className="shrink-0 px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-[8px] flex items-center gap-0.5 shadow-xs"
                                        >
                                          <FileText size={8} />
                                          <span>{lessonNotes.length}</span>
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[9px] opacity-80 truncate mt-1">
                                      {match.teacherName || 'Öğretmen'}
                                    </div>
                                    <div className="flex items-center justify-between text-[8px] opacity-75 mt-1">
                                      <span className="truncate">
                                        {match.roomName?.split('(')[0]?.trim() || `Derslik ${profile.className}`}
                                      </span>
                                      {hasNotes ? (
                                        <span className="font-bold text-[8px] text-amber-600 dark:text-amber-400">
                                          Not Var
                                        </span>
                                      ) : (
                                        <span className="opacity-0 group-hover:opacity-100 text-[8px] transition-opacity font-bold text-[#4B075F] dark:text-[#C58ADB]">
                                          + Not
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                ) : (
                                  <div className="w-full h-14 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 text-[9px] font-bold">
                                    <span>Boş</span>
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GÜNLÜK LİSTE GÖRÜNÜMÜ */}
            {scheduleViewMode === 'list' && (
              <div className="space-y-4 w-full min-w-0">
                {/* Day Selector Pill Tabs */}
                <div className="grid grid-cols-5 gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 w-full min-w-0">
                  {DAYS_LIST.map((day) => {
                    const isSelected = selectedScheduleDay === day.key
                    const isToday = todayKey === day.key
                    const count = weeklySchedule.filter((e) => e.day === day.key).length

                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => setSelectedScheduleDay(day.key)}
                        className={`py-2 px-1 sm:px-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 min-w-0 ${
                          isSelected
                            ? 'bg-white dark:bg-[#211729] text-[#4B075F] dark:text-[#C58ADB] font-black shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{day.label}</span>
                          {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Bugün" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 hidden sm:inline">
                          {count > 0 ? `${count} Ders` : '—'}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Day's Lessons List */}
                <div className="space-y-2.5">
                  {selectedDayClasses.length > 0 ? (
                    selectedDayClasses.map((item, idx) => {
                      const periodTime =
                        MIDDLE_PERIODS.find((p) => p.periodNumber === item.period)?.time ||
                        (item as any).timeSlot ||
                        '09:25 - 10:05'
                      const subjectName = (item as any).subjectName || item.subject || 'Ders'
                      const dayLabel = DAYS_LIST.find((d) => d.key === selectedScheduleDay)?.label || 'Seçili Gün'
                      const lessonNotes = getLessonNotes(selectedScheduleDay, item.period, subjectName)
                      const hasNotes = lessonNotes.length > 0

                      return (
                        <div
                          key={item.id || idx}
                          onClick={() =>
                            handleOpenLessonNoteModal(
                              item,
                              dayLabel,
                              selectedScheduleDay,
                              item.period,
                              periodTime
                            )
                          }
                          className="p-4 rounded-2xl bg-[#FCF9FD] dark:bg-[#2D2035] border border-[#E8DFEB] dark:border-[#49364F] flex items-center justify-between gap-3 hover:border-[#D5C5DC] dark:hover:border-[#C58ADB] transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-[#F0D8FA] dark:bg-[#211729] text-[#4B075F] dark:text-[#C58ADB] border border-[#D5C5DC]/60 flex flex-col items-center justify-center shrink-0">
                              <span className="text-sm font-black">{item.period}</span>
                              <span className="text-[8px] font-bold uppercase text-slate-400">Ders</span>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                                  {subjectName}
                                </span>
                                {hasNotes && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                    <FileText size={10} />
                                    <span>{lessonNotes.length} Not</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {item.teacherName || 'Öğretmen'}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={11} />
                                  {item.roomName || `Derslik ${profile.className}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-black text-slate-700 dark:text-slate-300">
                              {periodTime}
                            </div>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              40 Dk
                            </span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      Bu gün için planlanmış ders saati bulunmamaktadır.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: AUTHENTIC REAL DATA WIDGETS (lg:col-span-4) ── */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-5">
          {/* ── WIDGET 1: AKADEMİK BAŞARI & RESMİ STATÜ (100% REAL DATA, NO FAKE NAMES) ── */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-[#111A2E] border border-blue-100/80 dark:border-blue-900/40 shadow-[0_8px_30px_rgb(29,119,255,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Akademik Durumum
              </h3>
              <Link
                href="/student/progress"
                className="text-xs font-bold text-[#4B075F] dark:text-[#C58ADB] hover:underline"
              >
                Detay &gt;
              </Link>
            </div>

            {/* Dynamic Color-Coded Official Student Standing Row */}
            <div className={`p-4 rounded-2xl ${academicStatusTheme.cardBg} border ${academicStatusTheme.cardBorder} space-y-2 transition-all`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${academicStatusTheme.avatarBg} text-white font-black text-xs flex items-center justify-center shadow-xs`}>
                    {profile.firstName.slice(0, 1)}
                    {profile.lastName.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      {profile.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {profile.className} • No: {profile.studentNo}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-black ${academicStatusTheme.scoreColor}`}>
                    {profile.gpa > 0 ? `${profile.gpa} Ort.` : '0.0 Ort.'}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Sınıf {profile.classRank}.'si
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Akademik Durum:</span>
                <span className={`font-bold ${academicStatusTheme.statusColor}`}>
                  {academicStatusTheme.statusLabel}
                </span>
              </div>
            </div>

            {/* Attendance & Class Details */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#15213B] border border-blue-50 dark:border-blue-900/30">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Devam Oranı</div>
                <div className="text-base font-black text-emerald-600 mt-0.5">
                  %{profile.attendanceRate}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#15213B] border border-blue-50 dark:border-blue-900/30">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Devamsızlık</div>
                <div className="text-base font-black text-slate-800 dark:text-slate-100 mt-0.5">
                  {profile.absentDays || 0} Gün
                </div>
              </div>
            </div>
          </div>

          {/* ── WIDGET 2: GÜNLÜK HEDEF & PLANLAYICI GÖREVLERİ (REAL DATA) ── */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-[#111A2E] border border-blue-100/80 dark:border-blue-900/40 shadow-[0_8px_30px_rgb(29,119,255,0.04)] space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Günlük Hedefim
              </h3>
              <Link
                href="/student/planner"
                className="text-xs font-bold text-[#4B075F] dark:text-[#C58ADB] hover:underline"
              >
                Planlayıcı &gt;
              </Link>
            </div>

            {/* Circular Progress Ring with Flame */}
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                    className="dark:stroke-slate-800"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#8D49A6"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={
                      totalTasksCount > 0
                        ? 251.2 * (1 - completedTasksCount / totalTasksCount)
                        : 251.2
                    }
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Flame size={16} className="text-amber-500 fill-amber-500 mb-0.5" />
                  <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    {completedTasksCount}/{Math.max(1, totalTasksCount)}
                  </div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase">Görev</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white">
                  {completedTasksCount === totalTasksCount && totalTasksCount > 0
                    ? 'Tüm görevler tamamlandı! 🎉'
                    : 'Hedefine odaklan!'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  {tasks.length > 0
                    ? `${totalTasksCount - completedTasksCount} görev bekliyor`
                    : 'Henüz görev eklenmedi'}
                </div>
                <div className="text-[10px] text-[#8D49A6] dark:text-[#C58ADB] font-bold mt-2">
                  %{totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0} İlerleme
                </div>
              </div>
            </div>

            {/* Real Interactive Tasks List (Kaydırılabilir alan) */}
            <div className="space-y-2 pt-1 border-t border-[#E8DFEB] dark:border-[#49364F] max-h-[195px] overflow-y-auto custom-scrollbar pr-1">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className="w-full text-left p-2.5 rounded-2xl bg-[#FCF9FD] dark:bg-[#2D2035] hover:bg-[#F0D8FA]/50 dark:hover:bg-[#49364F]/50 border border-[#E8DFEB] dark:border-[#49364F] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        task.completed
                          ? 'bg-[#4B075F] border-[#4B075F] text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {task.completed && <CheckSquare size={12} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-bold leading-tight truncate ${
                          task.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.title}
                      </p>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{task.course}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 font-medium">
                  Henüz planlanmış bir görev bulunmuyor.
                </div>
              )}
            </div>
          </div>

          {/* ── WIDGET 3: ÖDEV VE ÇALIŞMA DURUMU (YENİLENMİŞ & ANLAŞILIR) ── */}
          <div className="p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] shadow-[0_8px_30px_rgba(75,7,95,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F0D8FA] dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center shrink-0">
                  <BookOpen size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Ödev & Çalışma Durumu
                </h3>
              </div>
              <Link
                href="/student/assignments"
                className="text-xs font-bold text-[#4B075F] dark:text-[#C58ADB] hover:underline"
              >
                Tümü &gt;
              </Link>
            </div>

            {/* Clear Status Metrics: Teslim Edilen vs Bekleyen */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Teslim Edilen</div>
                  <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                    {submittedAssignmentsCount}{' '}
                    <span className="text-[10px] font-bold text-slate-400">/ {totalAssignmentsCount}</span>
                  </div>
                </div>
              </div>

              <div
                className={`p-3 rounded-2xl ${
                  allPendingAssignments.length > 0
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40'
                    : 'bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40'
                } flex items-center gap-2.5`}
              >
                <div
                  className={`w-8 h-8 rounded-xl ${
                    allPendingAssignments.length > 0
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  } flex items-center justify-center shrink-0`}
                >
                  <AlertCircle size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Bekleyen</div>
                  <div
                    className={`text-sm sm:text-base font-black leading-tight ${
                      allPendingAssignments.length > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {allPendingAssignments.length}{' '}
                    <span className="text-[10px] font-bold text-slate-400">Ödev</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">Ödev Teslim İlerlemesi</span>
                <span className="text-[#4B075F] dark:text-[#C58ADB] font-black">%{homeworkProgressPercent}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8] transition-all duration-500 ease-out"
                  style={{ width: `${homeworkProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── DERSLERİM & GELİŞİM ALANLARI (SAĞ PANELDE 2'Lİ SÜTUN + TÜMÜNÜ GÖR BUTONU) ── */}
          <div className="p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] shadow-[0_8px_30px_rgba(75,7,95,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Derslerim & Gelişim Alanları
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  {profile.className} MEB Haftalık Müfredat Branşları
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F0D8FA] dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB] border border-[#D5C5DC]/50">
                {realCoreCourses.length} Branş
              </span>
            </div>

            {/* 2'li Sütun Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {realCoreCourses.map((c, idx) => {
                const Icon = c.icon
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.25 }}
                    whileHover={{ y: -3, transition: { duration: 0.15 } }}
                    className="h-full"
                  >
                    <Link
                      href={`/student/courses/${c.id}`}
                      className={`h-full p-3 sm:p-3.5 rounded-[20px] ${c.bg} border ${c.border} hover:shadow-md transition-all group flex flex-col justify-between`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-8 h-8 rounded-xl ${c.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform shrink-0`}
                        >
                          <Icon size={16} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                          {c.hours.split(' ')[0]}s
                        </span>
                      </div>
                      <div>
                        <div className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white leading-tight line-clamp-2">
                          {c.name}
                        </div>
                        <div className="text-[9px] sm:text-[9.5px] text-slate-600 dark:text-slate-400 font-semibold mt-1 truncate">
                          {c.teacher}
                        </div>
                      </div>
                      <div className="pt-2 flex justify-end">
                        <ArrowRight
                          size={12}
                          className="text-[#4B075F] dark:text-[#C58ADB] group-hover:translate-x-1 transition-transform"
                        />
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Yatay Olarak Tümünü Gör Butonu ve İkonu */}
            <Link
              href="/student/courses"
              className="w-full py-2.5 px-4 rounded-2xl bg-[#FCF9FD] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] border border-[#E8DFEB] dark:border-[#49364F] text-xs font-black text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center gap-2 shadow-xs transition-all group cursor-pointer"
            >
              <span>Tümünü Gör</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── MODAL: DERS NOTU EKLEME VE GÖRÜNTÜLEME MODALI (100% WORKING & SYNCED) ── */}
      <AnimatePresence>
        {isNoteModalOpen && selectedLessonNoteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNoteModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#211729] rounded-[32px] border border-[#E8DFEB] dark:border-[#49364F] shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[#E8DFEB] dark:border-[#49364F] flex items-center justify-between gap-3 bg-gradient-to-r from-[#FCF9FD] via-white to-[#F0D8FA]/30 dark:from-[#211729] dark:via-[#2D2035] dark:to-[#211729]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#F0D8FA] dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {(selectedLessonNoteTarget.lesson as any)?.subjectName ||
                          selectedLessonNoteTarget.lesson?.subject ||
                          'Ders Notu'}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#F0D8FA] dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB] border border-[#D5C5DC]/50">
                        {selectedLessonNoteTarget.dayLabel} • {selectedLessonNoteTarget.periodNumber}. Ders
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {selectedLessonNoteTarget.periodTime} •{' '}
                      {selectedLessonNoteTarget.lesson.teacherName || 'Öğretmen'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body: Scrollable */}
              <div className="p-5 overflow-y-auto space-y-4">
                {/* Existing Notes for this Lesson */}
                {(() => {
                  const subject =
                    (selectedLessonNoteTarget.lesson as any)?.subjectName ||
                    selectedLessonNoteTarget.lesson?.subject ||
                    'Ders'
                  const existingNotes = getLessonNotes(
                    selectedLessonNoteTarget.dayKey,
                    selectedLessonNoteTarget.periodNumber,
                    subject
                  )

                  if (existingNotes.length === 0) return null

                  return (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300">
                        <span>Kayıtlı Ders Notları</span>
                        <span className="text-[10px] text-slate-400">({existingNotes.length})</span>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {existingNotes.map((note) => (
                          <div
                            key={note.id}
                            className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 relative group"
                          >
                            <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400 font-bold mb-1">
                              <span>{note.category || 'Ders Notu'}</span>
                              <div className="flex items-center gap-2">
                                <span>{note.date}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLessonNote(note.id)}
                                  className="text-rose-500 hover:text-rose-700 transition-colors p-0.5"
                                  title="Notu Sil"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                              {note.title}
                            </h4>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">
                              {note.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Form to Add New Note */}
                <form onSubmit={handleSaveLessonNote} className="space-y-3.5 pt-2">
                  <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Plus size={14} className="text-[#4B075F] dark:text-[#C58ADB]" />
                    <span>Yeni Ders Notu Ekle</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Not Başlığı
                    </label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Örn: 3. Ders Konu Özeti & Formüller"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFEB] dark:border-[#49364F] bg-[#FCF9FD] dark:bg-[#2D2035] text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4B075F]/30"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Kategori
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {['Ders Notu', 'Önemli Hatırlatma', 'Soru Notu', 'Ödev Notu'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNoteCategory(cat)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                            noteCategory === cat
                              ? 'bg-[#4B075F] text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Not İçeriği
                    </label>
                    <textarea
                      rows={4}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Öğretmenin tahtaya yazdığı önemli formüller, sayfa numaraları veya hatırlatmalar..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFEB] dark:border-[#49364F] bg-[#FCF9FD] dark:bg-[#2D2035] text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4B075F]/30 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsNoteModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-full bg-[#4B075F] hover:bg-[#620B79] text-white font-black text-xs shadow-md shadow-purple-950/20 transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Notu Kaydet</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
