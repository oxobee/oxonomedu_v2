'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tv,
  CheckSquare,
  Sparkles,
  BookOpen,
  ChevronRight,
  ArrowRight,
  Info,
  CalendarDays,
  ListFilter,
  GraduationCap,
  Filter,
  User,
  School,
  CheckCircle2,
  Table,
} from 'lucide-react'
import {
  DAYS_LIST,
  PRIMARY_PERIODS,
  MIDDLE_PERIODS,
  INITIAL_SCHEDULE_ENTRIES,
  type ScheduleEntry,
  type DayKey,
} from '@components/Mobile/Admin/MAdminScheduleClient'
import { CANONICAL_9A_SCHEDULE_30 } from '@/lib/student/studentData'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import MockBadge from '@components/Common/MockBadge'
import LiveClassRadar from '@components/Common/LiveClassRadar'

interface LessonPlanModalData {
  title: string
  subject: string
  classroom: string
  teacher: string
  time: string
  room: string
  curriculumGoal: string
  materials: string[]
  teacherNotes: string
}

const PERIOD_TIMES: Record<number, string> = {
  1: '08:30 - 09:10',
  2: '09:25 - 10:05',
  3: '10:20 - 11:00',
  4: '11:15 - 11:55',
  5: '12:45 - 13:25',
  6: '13:40 - 14:20',
  7: '14:35 - 15:15',
}

const CURRICULUM_GOALS: Record<string, string> = {
  'Türk Dili ve Edebiyatı': 'Metin tahlili, ana fikir ve yardımcı fikirlerin belirlenmesi, edebi sanatlar analizi.',
  'Matematik': 'Fonksiyonlar, grafik okuma, denklem çözümü ve problem modelleme.',
  'Tarih': 'Tarih yazımı, ilk Türk devletlerinde teşkilatlanma ve kültürel miras.',
  'Fizik': 'Kuvvet ve hareket, vektörler ve Newton hareket kanunları.',
  'Kimya': 'Kimyasal türler arası etkileşimler ve periyodik özellikler.',
  'Biyoloji': 'Canlıların temel bileşenleri ve hücresel solunum mekanizmaları.',
  'İngilizce': 'Reading comprehension, academic vocabulary and interactive dialogue.',
  'Bilişim & Kodlama': 'Algoritma tasarımı, temel Python sözdizimi ve akıllı tahta projeleri.',
  'Rehberlik ve Yönlendirme': 'Akademik hedef belirleme, verimli ders çalışma ve sınav motivasyonu.',
}

function getTeacherSubjectColor(subject: string, color?: string) {
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
  if (color === 'emerald' || sub.includes('fen') || sub.includes('fizik') || sub.includes('kimya') || sub.includes('biyoloji') || sub.includes('din')) {
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
  if (color === 'pink' || sub.includes('görsel') || sub.includes('sanat') || sub.includes('müzik') || sub.includes('rehberlik')) {
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

export default function TeacherScheduleView() {
  const { theme } = useMobileTheme()
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly')
  const [scopeFilter, setScopeFilter] = useState<'my_lessons' | 'all_school'>('my_lessons')
  const [selectedDayKey, setSelectedDayKey] = useState<DayKey>('mon')
  const [selectedLessonModal, setSelectedLessonModal] = useState<LessonPlanModalData | null>(null)
  const [scheduleVersion, setScheduleVersion] = useState(0)

  // Current Logged-in Teacher Name
  const teacherName = 'Ebru TEKNECİ'

  // Load schedule entries synced from Principal/Admin
  const allEntries = useMemo<ScheduleEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw30 = localStorage.getItem('oxonom_admin_schedule_30')
        const rawSchedule = localStorage.getItem('oxonom_schedule_30')
        if (raw30) {
          const parsed = JSON.parse(raw30)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        } else if (rawSchedule) {
          const parsed = JSON.parse(rawSchedule)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('oxonom_admin_schedule_') || key.startsWith('oxonom_schedule_')) && !key.includes('revisions')) {
            const val = localStorage.getItem(key)
            if (val) {
              const parsed = JSON.parse(val)
              if (Array.isArray(parsed) && parsed.length > 0) return parsed
            }
          }
        }
      } catch (_) {}
    }
    return CANONICAL_9A_SCHEDULE_30
  }, [scheduleVersion])

  // Listen for schedule updates and publishes from Principal & sync from /api/schedule
  useEffect(() => {
    const handleUpdate = () => {
      setScheduleVersion((v) => v + 1)
    }

    const fetchRemote = async () => {
      try {
        const res = await fetch('/api/schedule', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (data && Array.isArray(data.schedule) && data.schedule.length > 0) {
            try {
              localStorage.setItem('oxonom_admin_schedule_30', JSON.stringify(data.schedule))
              localStorage.setItem('oxonom_schedule_30', JSON.stringify(data.schedule))
              localStorage.setItem('oxonom_teacher_schedule_30', JSON.stringify(data.schedule))
              if (Array.isArray(data.periods)) {
                localStorage.setItem('oxonom_admin_periods_30', JSON.stringify(data.periods))
              }
            } catch (_) {}
            setScheduleVersion((v) => v + 1)
          }
        }
      } catch (_) {}
    }
    fetchRemote()
    const interval = setInterval(fetchRemote, 4000)

    window.addEventListener('storage', handleUpdate)
    window.addEventListener('oxonom_admin_schedule_updated', handleUpdate)
    window.addEventListener('oxonom_schedule_updated', handleUpdate)
    window.addEventListener('oxonom_schedule_published', handleUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('oxonom_admin_schedule_updated', handleUpdate)
      window.removeEventListener('oxonom_schedule_updated', handleUpdate)
      window.removeEventListener('oxonom_schedule_published', handleUpdate)
    }
  }, [])

  // Dynamically determine period rows: only show periods that actually exist (no empty 7th period!)
  const schedulePeriods = useMemo(() => {
    const hasPeriod7 = allEntries.some((e) => e.period >= 7)
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
  }, [allEntries])

  // Filter entries based on scopeFilter (my_lessons vs all_school)
  const filteredEntries = useMemo(() => {
    if (scopeFilter === 'my_lessons') {
      return allEntries.filter((e) => {
        const activeName = ((e as any).activeTeacherName || e.teacherName || '').toLowerCase()
        return (
          activeName.includes('ebru') ||
          (e.teacherName === teacherName && !(e as any).isTeacherOnLeave)
        )
      })
    }
    return allEntries
  }, [allEntries, scopeFilter])

  // Entries for the selected day
  const dayEntries = useMemo(() => {
    return filteredEntries
      .filter((e) => e.day === selectedDayKey)
      .sort((a, b) => a.period - b.period)
  }, [filteredEntries, selectedDayKey])

  // Calculate teacher's total weekly hours
  const teacherWeeklyHours = useMemo(() => {
    return allEntries.filter((e) => {
      const activeName = ((e as any).activeTeacherName || e.teacherName || '').toLowerCase()
      return (
        activeName.includes('ebru') ||
        (e.teacherName === teacherName && !(e as any).isTeacherOnLeave)
      )
    }).length
  }, [allEntries])

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <GraduationCap size={15} />
            <span>Müdür Onaylı Bütünleşik Ders Çizelgesi</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Haftalık Ders Programı
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Okul Müdürü tarafından oluşturulan haftalık ders akışı, derslik ve akıllı tahta dağılımı
          </p>
        </div>

        {/* View Mode & Scope Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Selector: Kendi Derslerim vs Tüm Okul */}
          <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80">
            <button
              type="button"
              onClick={() => setScopeFilter('my_lessons')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                scopeFilter === 'my_lessons'
                  ? 'bg-[#4B075F] text-white shadow-xs shadow-purple-950/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <User size={13} />
              <span>Yalnız Kendi Derslerim ({teacherName})</span>
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('all_school')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                scopeFilter === 'all_school'
                  ? 'bg-[#4B075F] text-white shadow-xs shadow-purple-950/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <School size={13} />
              <span>Tüm Okul Programı</span>
            </button>
          </div>

          {/* View Mode Toggle: Haftalık Tablo vs Günlük Liste */}
          <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80">
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'weekly'
                  ? 'bg-white dark:bg-[#1A2338] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Table size={13} />
              <span>Haftalık Tablo</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'daily'
                  ? 'bg-white dark:bg-[#1A2338] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Clock size={13} />
              <span>Günlük Liste</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Quick Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Haftalık Toplam Ders</span>
            <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {teacherWeeklyHours} Saat / Hafta
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold">
            %100 Doluluk
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Rehberlik & Sınıf</span>
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
              9/A Şubesi
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold">
            Derslik 9-A
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Program Durumu</span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <CheckCircle2 size={18} />
              <span>Müdür Onaylı</span>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-mono">Rev. 2026-Güz</span>
        </div>
      </div>

      {/* Canlı Ders Takip Radarı & Akış */}
      <LiveClassRadar role="teacher" initialClassCode="9-A" />

      {/* Week Day Selector Tabs (for Daily mode) */}
      {viewMode === 'daily' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {DAYS_LIST.map((day) => {
            const isSelected = selectedDayKey === day.key
            const countForDay = filteredEntries.filter((e) => e.day === day.key).length
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDayKey(day.key)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#4B075F] text-white shadow-sm shadow-purple-950/20'
                    : 'bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 text-gray-700 dark:text-gray-300 hover:border-[#4B075F]'
                }`}
              >
                <span>{day.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {countForDay} Ders
                </span>
                {day.key === 'mon' && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-black ${
                    isSelected ? 'bg-amber-400 text-black' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    Bugün
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* DAILY VIEW: Timetable List */}
      {viewMode === 'daily' && (
        <div className="space-y-3.5">
          {dayEntries.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#121826] border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
              <Calendar size={28} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Seçilen günde ders bulunmamaktadır.
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {scopeFilter === 'my_lessons'
                  ? 'Bu gün için planlanmış dersiniz bulunmuyor.'
                  : 'Tüm okul programında bu gün için ders atanmamış.'}
              </p>
            </div>
          ) : (
            dayEntries.map((lesson) => {
              const isCurrent = lesson.period === 1 && selectedDayKey === 'mon'
              const timeStr = PERIOD_TIMES[lesson.period] || '08:30 - 09:10'
              const goal = CURRICULUM_GOALS[lesson.subject] || 'MEB 9. Sınıf müfredat kazanımı ve metin uygulaması.'
              const classroomDisplay = lesson.classCode === '9-A' ? '9/A Şubesi' : `${lesson.classCode} Şubesi`

              return (
                <motion.article
                  key={lesson.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-3xl border transition-all ${
                    isCurrent
                      ? 'bg-white dark:bg-[#121A2F] border-emerald-500/50 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-[#121826] border-gray-200/80 dark:border-gray-800/80 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Time & Subject info */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 font-black ${
                          isCurrent
                            ? 'bg-[#4B075F] text-white shadow-sm shadow-purple-950/20'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="text-base leading-none">{lesson.period}</span>
                        <span className="text-[9px] uppercase tracking-wider font-bold">Ders</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                            {lesson.subject}
                          </h2>
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                            {classroomDisplay}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                            <MapPin size={11} />
                            <span>{lesson.roomName}</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg">
                            <User size={11} />
                            <span>{lesson.teacherName}</span>
                          </span>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Şu Anki / Sıradaki Ders</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={13} />
                          <span className="font-mono font-medium">{timeStr}</span>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium pt-1">
                          🎯 <span className="font-bold">Kazanım:</span> {goal}
                        </p>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedLessonModal({
                            title: `${lesson.period}. Ders: ${lesson.subject}`,
                            subject: lesson.subject,
                            classroom: classroomDisplay,
                            teacher: lesson.teacherName,
                            time: timeStr,
                            room: lesson.roomName,
                            curriculumGoal: goal,
                            materials: [
                              '9. Sınıf MEB Ders Kitabı',
                              'İnteraktif Akıllı Tahta Notları',
                              'Çalışma Kâğıdı & Soru Bankası',
                            ],
                            teacherNotes:
                              'Müdür onaylı haftalık ders akışı kapsamında işlenecektir. Tahta oturumu ve yoklama kaydı aktiftir.',
                          })
                        }
                        className="h-10 px-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <BookOpen size={14} />
                        <span>Ders Planı</span>
                      </button>

                      <Link
                        href={`/teacher/attendance?class=${encodeURIComponent(lesson.classCode)}`}
                        className="h-10 px-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <CheckSquare size={14} />
                        <span>Yoklama</span>
                      </Link>
                    </div>
                  </div>
                </motion.article>
              )
            })
          )}
        </div>
      )}

      {/* WEEKLY TIMETABLE GRID (Weekly mode - Matris Tablo Görünümü) */}
      {viewMode === 'weekly' && (
        <div className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-3xl p-4 sm:p-5 shadow-sm overflow-hidden space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span>Haftalık Ders Dağılım Matrisi</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {filteredEntries.length} Ders Saati
                </span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {scopeFilter === 'my_lessons'
                  ? `Öğretmen: ${teacherName} · Müdürlük onaylı haftalık ders programı`
                  : 'Okul Geneli Tüm Sınıflar ve Şubeler'}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full self-start sm:self-auto">
              🟢 Canlı Senkronize
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200/80 dark:border-gray-800 text-[11px] font-black text-gray-600 dark:text-gray-300">
                  <th className="p-3 w-28 text-center shrink-0">Saat / Periyot</th>
                  {DAYS_LIST.map((day) => {
                    const dayCount = filteredEntries.filter((e) => e.day === day.key).length
                    return (
                      <th key={day.key} className="p-3 text-center">
                        <div>{day.label}</div>
                        <div className="text-[9px] font-medium text-gray-400">
                          {dayCount} Ders
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
                {schedulePeriods.map((period) => (
                  <tr key={period.periodNumber} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    {/* Periyot & Saat Hücresi */}
                    <td className="p-2.5 text-center bg-gray-50/40 dark:bg-gray-900/40 border-r border-gray-100 dark:border-gray-800/60 shrink-0">
                      <div className="font-black text-gray-900 dark:text-white">
                        {period.periodNumber}. Ders
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {period.time}
                      </div>
                    </td>

                    {/* Günler */}
                    {DAYS_LIST.map((day) => {
                      const match = filteredEntries.find(
                        (e) => e.day === day.key && e.period === period.periodNumber
                      )
                      const style = match ? getTeacherSubjectColor(match.subject, match.color) : null

                      return (
                        <td
                          key={day.key}
                          className="p-1.5 align-top border-r last:border-r-0 border-gray-100 dark:border-gray-800/60"
                        >
                          {match ? (
                            <div
                              onClick={() =>
                                setSelectedLessonModal({
                                  title: match.subject,
                                  subject: match.subject,
                                  classroom: match.classCode === '9-A' ? '9/A Şubesi' : `${match.classCode} Şubesi`,
                                  teacher: (match as any).activeTeacherName || match.teacherName,
                                  time: period.time,
                                  room: match.roomName,
                                  curriculumGoal: CURRICULUM_GOALS[match.subject] || 'MEB 9. Sınıf müfredat kazanımı ve metin uygulaması.',
                                  materials: [
                                    'Ders Kitabı ve Etkileşimli Föy',
                                    'Akıllı Tahta Sunumu',
                                    'Ders İçi Uygulama ve Soru Seti',
                                  ],
                                  teacherNotes: 'Müdür onaylı haftalık ders akışı kapsamında işlenecektir. Tahta oturumu ve yoklama kaydı aktiftir.',
                                })
                              }
                              className={`p-2 rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] ${style?.bg} ${style?.border} ${style?.text}`}
                            >
                              <div className="font-black text-[11px] leading-tight">
                                {match.subject}
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-[10px] opacity-90">
                                <span className="font-semibold">{(match as any).activeTeacherName || match.teacherName}</span>
                                {(match as any).isTeacherOnLeave && (
                                  <span className="text-[8px] font-black px-1 rounded bg-amber-500 text-white">
                                    Yedek
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-[9px] opacity-75 mt-1">
                                <span className="truncate">{match.roomName.split('(')[0].trim()}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-16 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800/80 flex flex-col items-center justify-center text-gray-400 text-[10px] font-bold">
                              <span className="text-xs">+</span>
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

      {/* Lesson Plan Detail Modal */}
      <AnimatePresence>
        {selectedLessonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-jakarta">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLessonModal(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                    {selectedLessonModal.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedLessonModal.classroom} • {selectedLessonModal.time} • {selectedLessonModal.teacher}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLessonModal(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                    Derslik & Konum
                  </div>
                  <p className="mt-1 text-gray-800 dark:text-gray-200 font-bold bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    📍 {selectedLessonModal.room}
                  </p>
                </div>

                <div>
                  <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                    Ders Kazanımı
                  </div>
                  <p className="mt-1 text-gray-800 dark:text-gray-200 font-medium leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    {selectedLessonModal.curriculumGoal}
                  </p>
                </div>

                <div>
                  <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                    Kullanılacak Materyaller
                  </div>
                  <ul className="mt-1 space-y-1">
                    {selectedLessonModal.materials.map((m, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                    Ders & Yönetim Notu
                  </div>
                  <p className="mt-1 text-gray-600 dark:text-gray-400 italic">
                    {selectedLessonModal.teacherNotes}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLessonModal(null)}
                  className="h-9 px-4 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold text-xs cursor-pointer transition-colors shadow-xs shadow-purple-950/20"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
