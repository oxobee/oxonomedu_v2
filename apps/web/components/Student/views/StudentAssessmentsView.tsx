'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  FileCheck,
  Calendar,
  Clock,
  MapPin,
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Check,
  User,
  ArrowRight,
} from 'lucide-react'
import {
  getSynchronizedStudentAssessments,
  type StudentAssessment,
} from '@/lib/student/studentData'
import { fetchExamsFromServer } from '@/lib/teacher/teacherAgendaStorage'

export type AssessmentStatusTab = 'all' | 'graded' | 'upcoming'
export type AssessmentTypeTab = 'all' | 'written' | 'oral' | 'quiz' | 'performance'

interface StudentAssessmentsViewProps {
  initialTab?: string
}

export default function StudentAssessmentsView({
  initialTab = 'all',
}: StudentAssessmentsViewProps) {
  // Primary status category: 'all' | 'graded' (Puan Verilmiş) | 'upcoming' (Puan Verilecek)
  const [statusTab, setStatusTab] = useState<AssessmentStatusTab>(() => {
    if (initialTab === 'results' || initialTab === 'graded') return 'graded'
    if (initialTab === 'upcoming' || initialTab === 'exams') return 'upcoming'
    return 'all'
  })

  // Secondary type filter
  const [typeTab, setTypeTab] = useState<AssessmentTypeTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [assessments, setAssessments] = useState<StudentAssessment[]>([])

  useEffect(() => {
    const syncAssessments = () => {
      setAssessments(getSynchronizedStudentAssessments())
    }
    syncAssessments()

    // Also pull latest updates from backend database
    fetchExamsFromServer().then((srvExams) => {
      if (Array.isArray(srvExams)) {
        setAssessments(getSynchronizedStudentAssessments())
      }
    })

    window.addEventListener('oxonom_student_updated', syncAssessments)
    window.addEventListener('oxonom_teacher_profile_updated', syncAssessments)
    window.addEventListener('oxonom_exam_calendar_updated', syncAssessments)
    window.addEventListener('storage', syncAssessments)

    return () => {
      window.removeEventListener('oxonom_student_updated', syncAssessments)
      window.removeEventListener('oxonom_teacher_profile_updated', syncAssessments)
      window.removeEventListener('oxonom_exam_calendar_updated', syncAssessments)
      window.removeEventListener('storage', syncAssessments)
    }
  }, [])

  const displayAssessments = assessments

  // Helper to normalize assessment type
  const normalizeType = (item: StudentAssessment): 'written' | 'oral' | 'quiz' | 'performance' | 'mock' => {
    const t = (item.type || '').toLowerCase()
    const lbl = (item.examTypeLabel || '').toLowerCase()
    if (t === 'oral' || lbl.includes('sözlü')) return 'oral'
    if (t === 'quiz' || lbl.includes('quiz')) return 'quiz'
    if (t === 'performance' || lbl.includes('performans') || lbl.includes('proje')) return 'performance'
    if (t === 'mock' || lbl.includes('deneme')) return 'mock'
    return 'written'
  }

  // Type label helper
  const getTypeBadge = (item: StudentAssessment) => {
    const norm = normalizeType(item)
    if (norm === 'oral') {
      return {
        label: 'Sözlü Sınav',
        className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
        dot: 'bg-amber-500',
      }
    }
    if (norm === 'quiz') {
      return {
        label: 'Quiz',
        className: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
        dot: 'bg-cyan-500',
      }
    }
    if (norm === 'performance') {
      return {
        label: 'Performans & Proje',
        className: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
        dot: 'bg-purple-500',
      }
    }
    if (norm === 'mock') {
      return {
        label: 'Deneme Sınavı',
        className: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
        dot: 'bg-rose-500',
      }
    }
    return {
      label: 'Yazılı Sınav',
      className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      dot: 'bg-indigo-500',
    }
  }

  // Counts for pills and banners
  const counts = useMemo(() => {
    const graded = displayAssessments.filter((a) => a.isGraded && a.score !== undefined && a.score !== null)
    const upcoming = displayAssessments.filter((a) => !a.isGraded || a.score === undefined || a.score === null)

    const written = displayAssessments.filter((a) => normalizeType(a) === 'written')
    const oral = displayAssessments.filter((a) => normalizeType(a) === 'oral')
    const quiz = displayAssessments.filter((a) => normalizeType(a) === 'quiz')
    const perf = displayAssessments.filter((a) => normalizeType(a) === 'performance')

    return {
      all: displayAssessments.length,
      graded: graded.length,
      upcoming: upcoming.length,
      written: written.length,
      oral: oral.length,
      quiz: quiz.length,
      performance: perf.length,
    }
  }, [displayAssessments])

  // Filter items based on statusTab, typeTab, and searchQuery
  const filteredAssessments = useMemo(() => {
    return displayAssessments.filter((item) => {
      const isItemGraded = item.isGraded && item.score !== undefined && item.score !== null
      const norm = normalizeType(item)

      // Primary Status Filter
      if (statusTab === 'graded' && !isItemGraded) return false
      if (statusTab === 'upcoming' && isItemGraded) return false

      // Secondary Type Filter
      if (typeTab === 'written' && norm !== 'written') return false
      if (typeTab === 'oral' && norm !== 'oral') return false
      if (typeTab === 'quiz' && norm !== 'quiz') return false
      if (typeTab === 'performance' && norm !== 'performance') return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.title.toLowerCase().includes(q) ||
          item.courseName.toLowerCase().includes(q) ||
          (item.teacherName && item.teacherName.toLowerCase().includes(q)) ||
          (item.scope && item.scope.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [displayAssessments, statusTab, typeTab, searchQuery])

  // Split filtered into upcoming vs graded
  const upcomingAssessments = useMemo(() => {
    return filteredAssessments.filter((a) => !a.isGraded || a.score === undefined || a.score === null)
  }, [filteredAssessments])

  const gradedAssessments = useMemo(() => {
    return filteredAssessments.filter((a) => a.isGraded && a.score !== undefined && a.score !== null)
  }, [filteredAssessments])

  // Calculate Average Score of graded exams strictly from real entered grades
  const publishedScores = displayAssessments.filter((a) => a.isGraded && a.score !== undefined && a.score !== null)
  const averageScoreNum = publishedScores.length
    ? publishedScores.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) / publishedScores.length
    : null

  const averageScore = averageScoreNum !== null ? averageScoreNum.toFixed(1) : '-'

  // Academic Status badge based on average score
  const getAcademicStatusBadge = () => {
    if (averageScoreNum === null) {
      return {
        label: 'Değerlendirme Sürecinde',
        badgeBg: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700',
      }
    }
    if (averageScoreNum >= 85) {
      return {
        label: 'Üstün Başarı (Takdir Seviyesi)',
        badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      }
    }
    if (averageScoreNum >= 70) {
      return {
        label: 'Başarılı (Teşekkür Seviyesi)',
        badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
      }
    }
    if (averageScoreNum >= 50) {
      return {
        label: 'Geçer (Geliştirilmeli)',
        badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
      }
    }
    return {
      label: 'Kritik Seviye / Etüt Takibinde',
      badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
    }
  }

  const academicStatus = getAcademicStatusBadge()

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-6 font-jakarta w-full min-w-0 overflow-hidden">
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm w-full min-w-0 overflow-hidden">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2">
            <FileCheck size={14} />
            <span>Ölçme ve Değerlendirme Takibi</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight truncate">
              Sınavlarım
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Öğretmenlerin tarafından planlanan yazılı, sözlü sınavlar, quizler ve açıklanan resmi sınav notların.
          </p>
        </div>

        {/* Dynamic Academic Level Status Pill */}
        <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto">
          <div className="w-full sm:w-auto p-3 sm:p-3.5 px-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60 shadow-xs flex items-center justify-between sm:justify-start gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
              <Award size={20} />
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
                Sınav Not Ortalaması
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-900 dark:text-amber-100">
                {averageScore} {averageScore !== '-' && <span className="text-xs font-normal text-amber-700 dark:text-amber-400">/ 100</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── LIVE KPI STATS BAR (4 CARDS: 2x2 ON MOBILE, 4-COL ON DESKTOP) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 w-full min-w-0">
        {/* Ortalamam */}
        <div className="min-w-0 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between gap-2 overflow-hidden">
          <div className="min-w-0 flex-1">
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider block truncate">
              Genel Sınav Ort.
            </span>
            <span className="text-base sm:text-lg lg:text-xl font-black text-gray-900 dark:text-white truncate block">
              {averageScore}
            </span>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <TrendingUp size={16} />
          </div>
        </div>

        {/* Puan Verilmiş */}
        <div className="min-w-0 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between gap-2 overflow-hidden">
          <div className="min-w-0 flex-1">
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider block truncate">
              Puan Verilmiş
            </span>
            <span className="text-base sm:text-lg lg:text-xl font-black text-emerald-600 dark:text-emerald-400 truncate block">
              {counts.graded} Sınav
            </span>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} />
          </div>
        </div>

        {/* Puan Verilecek */}
        <div className="min-w-0 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between gap-2 overflow-hidden">
          <div className="min-w-0 flex-1">
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider block truncate">
              Puan Verilecek
            </span>
            <span className="text-base sm:text-lg lg:text-xl font-black text-amber-600 dark:text-amber-400 truncate block">
              {counts.upcoming} Sınav
            </span>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock size={16} />
          </div>
        </div>

        {/* Başarı Durumu */}
        <div className="min-w-0 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between gap-2 overflow-hidden">
          <div className="min-w-0 flex-1 pr-1">
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider block truncate">
              Akademik Durum
            </span>
            <span className="text-[11px] sm:text-xs font-black truncate block mt-0.5 text-gray-900 dark:text-white">
              {academicStatus.label}
            </span>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Award size={16} />
          </div>
        </div>
      </div>

      {/* ── PRIMARY STATUS TABS & FILTERS (PUAN VERİLMİŞ vs PUAN VERİLECEK vs TÜMÜ) ── */}
      <div className="space-y-3 sm:space-y-4 w-full min-w-0">
        {/* Main Status Toggle */}
        <div className="w-full max-w-full min-w-0 overflow-x-auto flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-2xl bg-gray-100/80 dark:bg-gray-800/60 no-scrollbar">
          <button
            type="button"
            onClick={() => setStatusTab('graded')}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              statusTab === 'graded'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 size={15} />
            <span>Puan Verilmiş ({counts.graded})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusTab('upcoming')}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              statusTab === 'upcoming'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Clock size={15} />
            <span>Puan Verilecek ({counts.upcoming})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusTab('all')}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              statusTab === 'all'
                ? 'bg-white dark:bg-[#121826] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Calendar size={15} />
            <span>Tüm Sınavlar ({counts.all})</span>
          </button>
        </div>

        {/* Secondary Filter Chips */}
        <div className="w-full max-w-full min-w-0 overflow-x-auto flex items-center gap-1.5 sm:gap-2 pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setTypeTab('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              typeTab === 'all'
                ? 'bg-[#4B075F] text-white shadow-xs'
                : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
            }`}
          >
            Tüm Türler
          </button>

          <button
            type="button"
            onClick={() => setTypeTab('written')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              typeTab === 'written'
                ? 'bg-[#4B075F] text-white shadow-xs'
                : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
            }`}
          >
            Yazılı Sınavlar {counts.written > 0 && `(${counts.written})`}
          </button>

          <button
            type="button"
            onClick={() => setTypeTab('oral')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              typeTab === 'oral'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
            }`}
          >
            Sözlü Sınavlar {counts.oral > 0 && `(${counts.oral})`}
          </button>

          <button
            type="button"
            onClick={() => setTypeTab('quiz')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              typeTab === 'quiz'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
            }`}
          >
            Quizler {counts.quiz > 0 && `(${counts.quiz})`}
          </button>

          <button
            type="button"
            onClick={() => setTypeTab('performance')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              typeTab === 'performance'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
            }`}
          >
            Performans &amp; Proje {counts.performance > 0 && `(${counts.performance})`}
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full min-w-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ders adına, sınav konusuna veya öğretmene göre ara..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white dark:bg-[#121826] text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
      </div>

      {/* ── BÖLÜM 1: PUAN VERİLMİŞ SINAVLAR (SONUÇLANAN RESMİ NOTLAR) ── */}
      {(statusTab === 'all' || statusTab === 'graded') && (
        <div className="space-y-4 pt-1 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <span>Puan Verilmiş Sınavlar ({gradedAssessments.length})</span>
            </h2>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl self-start sm:self-auto">
              Resmi Karne ve Sınav Kayıtları
            </span>
          </div>

          {gradedAssessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 w-full min-w-0">
              {gradedAssessments.map((item) => {
                const badge = getTypeBadge(item)
                const score = item.score ?? 0
                const isCritical = score < 50
                const isWarning = score < 70 && score >= 50

                return (
                  <div
                    key={item.id}
                    className={`w-full min-w-0 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md overflow-hidden ${
                      isCritical
                        ? 'border-rose-300 dark:border-rose-900/60 hover:border-rose-500'
                        : isWarning
                        ? 'border-amber-300 dark:border-amber-900/60 hover:border-amber-500'
                        : 'border-emerald-200/80 dark:border-emerald-900/60 hover:border-emerald-500'
                    }`}
                  >
                    <div className="space-y-3 min-w-0">
                      {/* Header with Type Badge & Date */}
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-xl border flex items-center gap-1.5 truncate ${badge.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                          <span className="truncate">{badge.label}</span>
                        </span>

                        <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1 shrink-0">
                          <Calendar size={12} />
                          {item.date}
                        </span>
                      </div>

                      {/* Course & Title */}
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide truncate">
                          {item.courseName}
                        </div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mt-0.5 leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                      </div>

                      {/* Score Highlight Box */}
                      <div
                        className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between min-w-0 overflow-hidden ${
                          isCritical
                            ? 'bg-rose-500/10 border-rose-500/30'
                            : isWarning
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-emerald-500/10 border-emerald-500/30'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <span
                            className={`text-[9px] sm:text-[10px] font-extrabold uppercase block tracking-wider truncate ${
                              isCritical
                                ? 'text-rose-700 dark:text-rose-400'
                                : isWarning
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-emerald-700 dark:text-emerald-400'
                            }`}
                          >
                            Puan Verildi
                          </span>
                          <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 truncate block">
                            {score >= 85
                              ? 'Üstün Başarı'
                              : score >= 70
                              ? 'İyi Seviye'
                              : score >= 50
                              ? 'Geçer Not'
                              : 'Kritik Seviye / Başarısız'}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`text-2xl sm:text-3xl font-black tracking-tight ${
                              isCritical
                                ? 'text-rose-600 dark:text-rose-400'
                                : isWarning
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {score}
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 block -mt-1">
                            / {item.maxScore || 100} Puan
                          </span>
                        </div>
                      </div>

                      {/* Score Progress Bar */}
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                        />
                      </div>

                      {/* Teacher Feedback */}
                      {item.teacherFeedback ? (
                        <div
                          className={`p-3 rounded-xl border text-[11px] leading-relaxed break-words ${
                            isCritical
                              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200'
                              : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5 font-bold">
                            Öğretmen Değerlendirmesi:
                          </strong>
                          &quot;{item.teacherFeedback}&quot;
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400 italic">
                          Resmi sınav kağıdı zümre arşivinde onaylanmıştır.
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] min-w-0">
                      <span className="text-gray-400 flex items-center gap-1 truncate min-w-0">
                        <User size={12} className="shrink-0" />
                        <span className="truncate">{item.teacherName || 'Ders Öğretmeni'}</span>
                      </span>
                      <span
                        className={`font-bold flex items-center gap-1 shrink-0 ${
                          isCritical
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        <Check size={13} />
                        <span>Karneye İşlendi</span>
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 text-xs text-gray-400">
              Henüz puanlanmış bir sınav kaydı bulunmamaktadır.
            </div>
          )}
        </div>
      )}

      {/* ── BÖLÜM 2: PUAN VERİLECEK SINAVLAR (YAKLAŞAN / BEKLEYENLER) ── */}
      {(statusTab === 'all' || statusTab === 'upcoming') && (
        <div className="space-y-4 pt-2 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-amber-500 shrink-0" />
              <span>Puan Verilecek Sınavlar ({upcomingAssessments.length})</span>
            </h2>
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl self-start sm:self-auto">
              Değerlendirme & Sınav Bekleniyor
            </span>
          </div>

          {upcomingAssessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 w-full min-w-0">
              {upcomingAssessments.map((item) => {
                const badge = getTypeBadge(item)
                return (
                  <div
                    key={item.id}
                    className="w-full min-w-0 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:border-amber-400/60 hover:shadow-md transition-all flex flex-col justify-between space-y-4 overflow-hidden"
                  >
                    <div className="space-y-3 min-w-0">
                      {/* Header Pill */}
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-xl border flex items-center gap-1.5 truncate ${badge.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                          <span className="truncate">{badge.label}</span>
                        </span>

                        <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl shrink-0">
                          Puan Verilecek
                        </span>
                      </div>

                      {/* Title & Subject */}
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide truncate">
                          {item.courseName}
                        </div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mt-0.5 leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                      </div>

                      {/* Metadata Box */}
                      <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 space-y-2 text-xs min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                          <span className="flex items-center gap-1.5 text-gray-400 shrink-0">
                            <Calendar size={13} />
                            Tarih:
                          </span>
                          <span className="font-extrabold text-gray-900 dark:text-white font-mono truncate">
                            {item.date}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                          <span className="flex items-center gap-1.5 text-gray-400 shrink-0">
                            <Clock size={13} />
                            Saat:
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white font-mono truncate">
                            {item.time} ({item.durationMinutes} Dk)
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 min-w-0">
                          <span className="flex items-center gap-1.5 text-gray-400 shrink-0">
                            <MapPin size={13} />
                            Salon:
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                            {item.location}
                          </span>
                        </div>
                      </div>

                      {/* Scope / Topics */}
                      {item.scope && (
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 leading-relaxed break-words">
                          <strong className="text-gray-700 dark:text-gray-200 font-bold block mb-0.5">
                            Konu Kapsamı:
                          </strong>
                          {item.scope}
                        </div>
                      )}
                    </div>

                    {/* Teacher Info */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] min-w-0">
                      <span className="text-gray-400 flex items-center gap-1 truncate min-w-0">
                        <User size={12} className="shrink-0" />
                        <span className="truncate">{item.teacherName || 'Zümre Öğretmeni'}</span>
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                        100 Puan Üzerinden
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 text-xs text-gray-400">
              Şu an değerlendirme bekleyen bir sınav bulunmamaktadır.
            </div>
          )}
        </div>
      )}

      {/* Empty State when no results across filters */}
      {filteredAssessments.length === 0 && (
        <div className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 space-y-2">
          <AlertCircle size={28} className="mx-auto text-gray-400" />
          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
            Kayıt Bulunamadı
          </h4>
          <p className="text-xs text-gray-400">
            Arama kriterinize veya seçili sekmeye uygun herhangi bir sınav bulunmuyor.
          </p>
        </div>
      )}
    </div>
  )
}
