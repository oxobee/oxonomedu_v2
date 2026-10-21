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
  FileText,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Play,
  Sparkles,
  BookOpen,
  User,
  Check,
  AlertTriangle,
  StickyNote,
  Presentation,
  Download,
  Trash2,
  Edit3,
  Maximize2,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getSynchronizedStudentAssessments,
  getSynchronizedStudentProfile,
  type StudentAssessment,
} from '@/lib/student/studentData'
import {
  getSavedBoardNotes,
  deleteBoardNote,
  updateStudentBoardNote,
  type SavedBoardNote,
} from '@/lib/board/boardNotesStorage'
import SmartBoardMockup from '@/components/Student/board/SmartBoardMockup'
import { fetchExamsFromServer } from '@/lib/teacher/teacherAgendaStorage'
import toast from 'react-hot-toast'

export type AssessmentStatusTab = 'all' | 'graded' | 'upcoming' | 'board-notes'
export type AssessmentTypeTab = 'all' | 'written' | 'oral' | 'quiz' | 'performance'

interface StudentAssessmentsViewProps {
  initialTab?: string
}

export default function StudentAssessmentsView({
  initialTab = 'all',
}: StudentAssessmentsViewProps) {
  // Primary status category: 'all' | 'graded' (Puan Verilmiş) | 'upcoming' (Puan Verilecek) | 'board-notes'
  const [statusTab, setStatusTab] = useState<AssessmentStatusTab>(() => {
    if (initialTab === 'results' || initialTab === 'graded') return 'graded'
    if (initialTab === 'upcoming' || initialTab === 'exams') return 'upcoming'
    if (initialTab === 'board-notes' || initialTab === 'notes') return 'board-notes'
    return 'all'
  })

  // Secondary type filter
  const [typeTab, setTypeTab] = useState<AssessmentTypeTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [assessments, setAssessments] = useState<StudentAssessment[]>([])

  // Board Notes State
  const [boardNotes, setBoardNotes] = useState<SavedBoardNote[]>([])
  const [activeBoardModal, setActiveBoardModal] = useState<SavedBoardNote | null>(null)
  const [boardToEdit, setBoardToEdit] = useState<SavedBoardNote | null>(null)
  const [boardInputText, setBoardInputText] = useState('')
  const [boardToDelete, setBoardToDelete] = useState<SavedBoardNote | null>(null)
  const [boardCourseFilter, setBoardCourseFilter] = useState('all')

  useEffect(() => {
    const syncAssessments = () => {
      setAssessments(getSynchronizedStudentAssessments())
      const prof = getSynchronizedStudentProfile()
      setBoardNotes(getSavedBoardNotes(prof?.className || '1/A'))
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
    window.addEventListener('oxonom_board_notes_updated', syncAssessments)
    window.addEventListener('storage', syncAssessments)

    return () => {
      window.removeEventListener('oxonom_student_updated', syncAssessments)
      window.removeEventListener('oxonom_teacher_profile_updated', syncAssessments)
      window.removeEventListener('oxonom_exam_calendar_updated', syncAssessments)
      window.removeEventListener('oxonom_board_notes_updated', syncAssessments)
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

  // Filtered Board Notes for "Sınavlar ve Notlar" tab
  const filteredBoardNotes = useMemo(() => {
    let list = [...boardNotes]
    if (boardCourseFilter !== 'all') {
      list = list.filter((b) => b.courseName.toLowerCase() === boardCourseFilter.toLowerCase())
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.courseName.toLowerCase().includes(q) ||
          (b.studentNote && b.studentNote.toLowerCase().includes(q)) ||
          (b.teacherName && b.teacherName.toLowerCase().includes(q))
      )
    }
    return list
  }, [boardNotes, boardCourseFilter, searchQuery])

  const boardCourseOptions = useMemo(() => {
    const set = new Set<string>()
    boardNotes.forEach((b) => {
      if (b.courseName) set.add(b.courseName)
    })
    return ['all', ...Array.from(set)]
  }, [boardNotes])

  // Save student note on board note
  const handleSaveBoardNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!boardToEdit) return
    updateStudentBoardNote(boardToEdit.id, boardInputText)
    if (activeBoardModal?.id === boardToEdit.id) {
      setActiveBoardModal({
        ...activeBoardModal,
        studentNote: boardInputText.trim(),
        studentNoteUpdatedAt: Date.now(),
      })
    }
    setBoardToEdit(null)
    toast.success('Harika! Çalışma notunuz kaydedildi ✨', { icon: '📝' })
  }

  // Confirm delete board note
  const handleConfirmDeleteBoard = () => {
    if (!boardToDelete) return
    const deletedTitle = boardToDelete.title
    deleteBoardNote(boardToDelete.id)
    if (activeBoardModal?.id === boardToDelete.id) {
      setActiveBoardModal(null)
    }
    setBoardToDelete(null)
    toast.success(`"${deletedTitle}" silindi.`, { icon: '🗑️' })
  }

  // Download board note image
  const handleDownloadBoard = (note: SavedBoardNote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const link = document.createElement('a')
    link.href = note.imageUrl
    const safeName = note.title.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_\- ]/g, '').replace(/\s+/g, '_')
    link.download = `${safeName}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 font-jakarta">
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2">
            <FileCheck size={14} />
            <span>Ölçme ve Değerlendirme Takibi</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Sınavlar ve Notlar
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Öğretmenlerin tarafından planlanan yazılı, sözlü sınavlar, quizler ve açıklanan resmi sınav notların.
          </p>
        </div>

        {/* Dynamic Academic Level Status Pill */}
        <div className="flex items-center gap-3">
          <div className="p-3.5 px-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60 shadow-xs flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
              <Award size={22} />
            </div>
            <div>
              <div className="text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
                Sınav Not Ortalaması
              </div>
              <div className="text-xl font-black text-amber-900 dark:text-amber-100">
                {averageScore} {averageScore !== '-' && <span className="text-xs font-normal text-amber-700 dark:text-amber-400">/ 100</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── LIVE KPI STATS BAR ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Ortalamam */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Genel Sınav Ort.
            </span>
            <span className="text-lg lg:text-xl font-black text-gray-900 dark:text-white">
              {averageScore}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
        </div>

        {/* Puan Verilmiş */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Puan Verilmiş
            </span>
            <span className="text-lg lg:text-xl font-black text-emerald-600 dark:text-emerald-400">
              {counts.graded} Sınav
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
        </div>

        {/* Puan Verilecek */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Puan Verilecek
            </span>
            <span className="text-lg lg:text-xl font-black text-amber-600 dark:text-amber-400">
              {counts.upcoming} Sınav
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock size={18} />
          </div>
        </div>

        {/* Başarı Durumu */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Akademik Durum
            </span>
            <span className="text-xs font-black truncate block mt-0.5 text-gray-900 dark:text-white">
              {academicStatus.label}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Award size={18} />
          </div>
        </div>

        {/* Akıllı Tahta & Çalışma Notlarım KPI */}
        <button
          type="button"
          onClick={() => setStatusTab('board-notes')}
          className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#8D49A6] transition-colors text-left"
        >
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Tahta Notlarım
            </span>
            <span className="text-lg lg:text-xl font-black text-[#8D49A6] dark:text-[#D914C8]">
              {boardNotes.length} Not
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#8D49A6] dark:text-[#D914C8] flex items-center justify-center">
            <StickyNote size={18} />
          </div>
        </button>
      </div>

      {/* ── PRIMARY STATUS TABS: PUAN VERİLMİŞ vs PUAN VERİLECEK ── */}
      <div className="space-y-4">
        {/* Main Status Toggle (Puan Verilmiş / Puan Verilecek / Tümü / Akıllı Tahta Notlarım) */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-100/80 dark:bg-gray-800/60 max-w-fit overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setStatusTab('graded')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
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
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
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
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              statusTab === 'all'
                ? 'bg-white dark:bg-[#121826] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Calendar size={15} />
            <span>Tüm Sınavlar ({counts.all})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusTab('board-notes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              statusTab === 'board-notes'
                ? 'bg-brand-gradient text-white shadow-sm shadow-purple-900/30'
                : 'text-[#4B075F] dark:text-[#E9D5FF] bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60'
            }`}
          >
            <StickyNote size={15} />
            <span>Akıllı Tahta Notlarım ({boardNotes.length})</span>
            {boardNotes.some((b) => b.studentNote) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Secondary Filter Chips */}
        {statusTab === 'board-notes' ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {boardCourseOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setBoardCourseFilter(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  boardCourseFilter === c
                    ? 'bg-[#4B075F] text-white shadow-xs'
                    : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
                }`}
              >
                {c === 'all' ? 'Tüm Dersler' : c}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setTypeTab('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                typeTab === 'performance'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
              }`}
            >
              Performans &amp; Proje {counts.performance > 0 && `(${counts.performance})`}
            </button>
          </div>
        )}

        {/* Search Box */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              statusTab === 'board-notes'
                ? 'Ders adına, çalışma notuna veya öğretmene göre ara...'
                : 'Ders adına, sınav konusuna veya öğretmene göre ara...'
            }
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white dark:bg-[#121826] text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
      </div>

      {/* ── BÖLÜM 1: PUAN VERİLMİŞ SINAVLAR (SONUÇLANAN RESMİ NOTLAR) ── */}
      {(statusTab === 'all' || statusTab === 'graded') && (
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span>Puan Verilmiş Sınavlar ve Notlar ({gradedAssessments.length})</span>
            </h2>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl">
              Resmi Karne ve Sınav Kayıtları
            </span>
          </div>

          {gradedAssessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gradedAssessments.map((item) => {
                const badge = getTypeBadge(item)
                const score = item.score ?? 0
                const isCritical = score < 50
                const isWarning = score < 70 && score >= 50
                const isGood = score >= 70

                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-3xl bg-white dark:bg-[#121826] border transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                      isCritical
                        ? 'border-rose-300 dark:border-rose-900/60 hover:border-rose-500'
                        : isWarning
                        ? 'border-amber-300 dark:border-amber-900/60 hover:border-amber-500'
                        : 'border-emerald-200/80 dark:border-emerald-900/60 hover:border-emerald-500'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header with Type Badge & Date */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${badge.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>

                        <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {item.date}
                        </span>
                      </div>

                      {/* Course & Title */}
                      <div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                          {item.courseName}
                        </div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mt-0.5 leading-snug">
                          {item.title}
                        </h3>
                      </div>

                      {/* Score Highlight Box */}
                      <div
                        className={`p-4 rounded-2xl border flex items-center justify-between ${
                          isCritical
                            ? 'bg-rose-500/10 border-rose-500/30'
                            : isWarning
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-emerald-500/10 border-emerald-500/30'
                        }`}
                      >
                        <div>
                          <span
                            className={`text-[10px] font-extrabold uppercase block tracking-wider ${
                              isCritical
                                ? 'text-rose-700 dark:text-rose-400'
                                : isWarning
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-emerald-700 dark:text-emerald-400'
                            }`}
                          >
                            Puan Verildi
                          </span>
                          <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                            {score >= 85
                              ? 'Üstün Başarı'
                              : score >= 70
                              ? 'İyi Seviye'
                              : score >= 50
                              ? 'Geçer Not'
                              : 'Kritik Seviye / Başarısız'}
                          </span>
                        </div>

                        <div className="text-right">
                          <div
                            className={`text-3xl font-black tracking-tight ${
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
                          className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                            isCritical
                              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200'
                              : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5 font-bold">
                            Öğretmen Değerlendirmesi:
                          </strong>
                          "{item.teacherFeedback}"
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400 italic">
                          Resmi sınav kağıdı zümre arşivinde onaylanmıştır.
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 flex items-center gap-1">
                        <User size={12} />
                        {item.teacherName || 'Ders Öğretmeni'}
                      </span>
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          isCritical
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        <Check size={13} />
                        Puanlandı & Karneye İşlendi
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 text-xs text-gray-400">
              Henüz puanlanmış bir sınav kaydı bulunmamaktadır.
            </div>
          )}
        </div>
      )}

      {/* ── BÖLÜM 2: PUAN VERİLECEK SINAVLAR (YAKLAŞAN / BEKLEYENLER) ── */}
      {(statusTab === 'all' || statusTab === 'upcoming') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              <span>Puan Verilecek Sınavlar ({upcomingAssessments.length})</span>
            </h2>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl">
              Değerlendirme & Sınav Bekleniyor
            </span>
          </div>

          {upcomingAssessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingAssessments.map((item) => {
                const badge = getTypeBadge(item)
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:border-amber-400/60 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Header Pill */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${badge.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>

                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl">
                          Puan Verilecek
                        </span>
                      </div>

                      {/* Title & Subject */}
                      <div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                          {item.courseName}
                        </div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mt-0.5 leading-snug">
                          {item.title}
                        </h3>
                      </div>

                      {/* Metadata Box */}
                      <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                          <span className="flex items-center gap-1.5 text-gray-400">
                            <Calendar size={13} />
                            Tarih:
                          </span>
                          <span className="font-extrabold text-gray-900 dark:text-white font-mono">
                            {item.date}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                          <span className="flex items-center gap-1.5 text-gray-400">
                            <Clock size={13} />
                            Saat:
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white font-mono">
                            {item.time} ({item.durationMinutes} Dk)
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                          <span className="flex items-center gap-1.5 text-gray-400">
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
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 leading-relaxed">
                          <strong className="text-gray-700 dark:text-gray-200 font-bold block mb-0.5">
                            Konu Kapsamı:
                          </strong>
                          {item.scope}
                        </div>
                      )}
                    </div>

                    {/* Teacher Info */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 flex items-center gap-1">
                        <User size={12} />
                        {item.teacherName || 'Zümre Öğretmeni'}
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        100 Tam Puan Üzerinden
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 text-xs text-gray-400">
              Şu an değerlendirme bekleyen bir sınav bulunmamaktadır.
            </div>
          )}
        </div>
      )}

      {/* ── BÖLÜM 3: AKILLI TAHTA VE ÇALIŞMA NOTLARIM ── */}
      {statusTab === 'board-notes' && (
        <div className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/60 p-5 rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-gradient text-white flex items-center justify-center font-bold shadow-md shrink-0">
                <Presentation size={24} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Akıllı Tahta ve Sınav Hazırlık Notlarım
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Öğretmenlerinizin akıllı tahtadan gönderdiği ders çizimleri ve sınavlar için eklediğiniz özel çalışma notlarınız.
                </p>
              </div>
            </div>

            <Link
              href="/student/board-notes"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#121826] border border-purple-200 dark:border-purple-800 text-xs font-bold text-[#8D49A6] dark:text-[#D914C8] hover:bg-purple-50 dark:hover:bg-purple-900/40 flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-colors"
            >
              <span>Tüm Arşive Git</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Grid of Board Notes */}
          {filteredBoardNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBoardNotes.map((note) => (
                <div key={note.id} className="flex flex-col space-y-3">
                  <SmartBoardMockup
                    imageUrl={note.imageUrl}
                    title={note.title}
                    courseName={note.courseName}
                    dateStr={note.dateStr}
                    studentNote={note.studentNote}
                    onExpand={() => setActiveBoardModal(note)}
                    onAddNote={() => {
                      setBoardToEdit(note)
                      setBoardInputText(note.studentNote || '')
                    }}
                    onDownload={() => handleDownloadBoard(note)}
                    onDelete={() => setBoardToDelete(note)}
                  />

                  {/* Note Details Box */}
                  <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white line-clamp-1">
                          {note.title}
                        </h3>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 block">
                          {note.teacherName || 'Ders Öğretmeni'} • {note.dateStr}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-[#4B075F] dark:text-[#C58ADB] shrink-0">
                        {note.classCodes?.join(', ') || '1/A'}
                      </span>
                    </div>

                    {/* Personal Study Note Sticky */}
                    {note.studentNote ? (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-800 dark:text-amber-300">
                            <StickyNote size={12} className="text-amber-600" />
                            <span>Sınav &amp; Çalışma Notum:</span>
                          </div>
                          <p className="text-xs text-gray-900 dark:text-gray-100 font-semibold mt-1 line-clamp-2 leading-relaxed">
                            {note.studentNote}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setBoardToEdit(note)
                            setBoardInputText(note.studentNote || '')
                          }}
                          className="p-1 rounded-md text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shrink-0 cursor-pointer"
                          title="Notu Düzenle"
                        >
                          <Edit3 size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setBoardToEdit(note)
                          setBoardInputText('')
                        }}
                        className="w-full py-2 px-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-[#8D49A6] text-gray-500 hover:text-[#8D49A6] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-gray-50/50 dark:bg-gray-800/30"
                      >
                        <StickyNote size={13} />
                        <span>+ Sınav İçin Bu Tahtaya Not Ekle</span>
                      </button>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => setActiveBoardModal(note)}
                        className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Maximize2 size={13} />
                        <span>Tam Ekran İncele</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleDownloadBoard(note, e)}
                          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          title="İndir"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setBoardToDelete(note)}
                          className="p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Bu Tahtayı Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 space-y-2">
              <Presentation size={32} className="mx-auto text-gray-400" />
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                Akıllı Tahta Notu Bulunamadı
              </h4>
              <p className="text-xs text-gray-400">
                Seçtiğiniz filtreye uygun tahta notu bulunamadı.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State when no results across filters */}
      {statusTab !== 'board-notes' && filteredAssessments.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 space-y-2">
          <AlertCircle size={28} className="mx-auto text-gray-400" />
          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
            Kayıt Bulunamadı
          </h4>
          <p className="text-xs text-gray-400">
            Arama kriterinize veya seçili sekmeye uygun herhangi bir sınav bulunmuyor.
          </p>
        </div>
      )}

      {/* ── FULL SCREEN BOARD VIEWER MODAL ── */}
      <AnimatePresence>
        {activeBoardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => setActiveBoardModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative z-10 w-full max-w-5xl max-h-[95vh] bg-[#121826] border border-gray-700/60 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Top Bar */}
              <div className="px-4 py-3 sm:px-6 bg-[#161F32] border-b border-gray-700/60 flex items-center justify-between gap-3 text-white">
                <div className="min-w-0 flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] shrink-0" />
                  <div className="truncate">
                    <h2 className="text-sm sm:text-base font-extrabold truncate">
                      {activeBoardModal.title}
                    </h2>
                    <span className="text-[11px] text-gray-400">
                      {activeBoardModal.teacherName || 'Ders Öğretmeni'} • Sınıf: {activeBoardModal.classCodes?.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setBoardToEdit(activeBoardModal)
                      setBoardInputText(activeBoardModal.studentNote || '')
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-amber-500/30 cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span className="hidden sm:inline">
                      {activeBoardModal.studentNote ? 'Notumu Düzenle' : 'Not Ekle'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadBoard(activeBoardModal)}
                    className="px-3 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-xs font-bold text-gray-200 flex items-center gap-1.5 transition-colors border border-gray-700 cursor-pointer"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">İndir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBoardToDelete(activeBoardModal)}
                    className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-800/50 cursor-pointer"
                    title="Tahtayı Sil"
                  >
                    <Trash2 size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveBoardModal(null)}
                    className="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Viewer Image */}
              <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-black/70 min-h-[320px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeBoardModal.imageUrl}
                  alt={activeBoardModal.title}
                  className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-2xl border border-slate-800"
                />
              </div>

              {/* Student Note Bar in Fullscreen Modal */}
              {activeBoardModal.studentNote && (
                <div className="px-4 py-2.5 sm:px-6 bg-[#1A1F2C] border-t border-gray-700/60 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-amber-400 font-extrabold shrink-0 flex items-center gap-1">
                      <StickyNote size={14} />
                      <span>Sınav Çalışma Notun:</span>
                    </span>
                    <span className="text-slate-200 truncate font-semibold">
                      {activeBoardModal.studentNote}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBoardToEdit(activeBoardModal)
                      setBoardInputText(activeBoardModal.studentNote || '')
                    }}
                    className="text-[#D914C8] hover:underline font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Düzenle
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CUTE PERSONAL NOTE ADD/EDIT MODAL ── */}
      <AnimatePresence>
        {boardToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              className="w-full max-w-lg bg-white dark:bg-[#161D2C] border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <StickyNote size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                      Sınav Hazırlığı İçin Tahtaya Not Ekle
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {boardToEdit.title}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setBoardToEdit(null)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Quick tags */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1.5">
                  Hızlı Not Şablonları:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['🎯 Sınavda Kesin Çıkar!', '📐 Önemli Pisagor Formülü', '⭐ Tekrar Edilecek Yer', '⚠️ Dikkat: Özne ve Yüklem'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setBoardInputText((prev) => (prev ? `${prev} ${tag}` : tag))}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveBoardNote} className="space-y-4">
                <div>
                  <textarea
                    rows={4}
                    value={boardInputText}
                    onChange={(e) => setBoardInputText(e.target.value)}
                    placeholder="Bu ders tahtası ile ilgili formülleri ve sınav hazırlık notlarını yaz..."
                    className="w-full p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8D49A6] transition-all resize-none font-medium leading-relaxed"
                    autoFocus
                  />
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                    <span>💡 Eklediğin not Sınavlar ve Notlar ekranında öne çıkarılır.</span>
                    <span>{boardInputText.length} karakter</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setBoardToEdit(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-brand-gradient hover:opacity-95 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Check size={15} />
                    <span>Notu Kaydet ✨</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CUTE CONFIRMATION MODAL ("EMİN MİSİNİZ?") ── */}
      <AnimatePresence>
        {boardToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#161D2C] border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-6 text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-inner">
                <Trash2 size={32} className="animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Tahta Notunu Silmek İstiyor musunuz? 🗑️
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    &quot;{boardToDelete.title}&quot;
                  </span>{' '}
                  ders kaydı ve varsa çalışma notların arşivinizden kaldırılacaktır. Emin misin?
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setBoardToDelete(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Vazgeç, Kalsın
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDeleteBoard}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-black shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Evet, Sil</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
