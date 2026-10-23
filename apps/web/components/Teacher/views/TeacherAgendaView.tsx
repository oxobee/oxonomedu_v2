'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Tag,
  Pin,
  Trash2,
  Edit3,
  Copy,
  BookOpen,
  UserCheck,
  PhoneCall,
  Users,
  Award,
  AlertCircle,
  X,
  Sparkles,
  Calendar as CalendarIcon,
  ChevronRight,
  Layers,
  Check,
  GraduationCap,
  ExternalLink,
  Info,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MockBadge from '@components/Common/MockBadge'
import {
  TeacherNote,
  SchoolExamItem,
  NOTE_CATEGORIES,
  NOTE_COLOR_THEMES,
  getStoredTeacherNotes,
  saveStoredTeacherNotes,
  getStoredSchoolExams,
  saveStoredSchoolExams,
  fetchExamsFromServer,
  pushExamToServer,
  deleteExamFromServer,
} from '@/lib/teacher/teacherAgendaStorage'
import { ALL_CLASSROOMS } from '@services/demo/schoolDirectory'
import CalendarReminderWidget from '@components/Common/CalendarReminderWidget'

export default function TeacherAgendaView() {
  const [activeTab, setActiveTab] = useState<'all' | 'calendar' | 'notes' | 'exams'>('all')

  // ── Notes State ──
  const [notes, setNotes] = useState<TeacherNote[]>([])
  const [noteCategoryFilter, setNoteCategoryFilter] = useState<string>('all')
  const [noteColorFilter, setNoteColorFilter] = useState<string>('all')
  const [noteSearchQuery, setNoteSearchQuery] = useState('')
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<TeacherNote | null>(null)

  // Form State for Note
  const [noteFormTitle, setNoteFormTitle] = useState('')
  const [noteFormCategory, setNoteFormCategory] = useState<TeacherNote['category']>('lesson_plan')
  const [noteFormContent, setNoteFormContent] = useState('')
  const [noteFormColor, setNoteFormColor] = useState<TeacherNote['color']>('blue')
  const [noteFormClass, setNoteFormClass] = useState(() => ALL_CLASSROOMS[0]?.code || '1/A')
  const [noteFormTags, setNoteFormTags] = useState('')
  const [noteFormPinned, setNoteFormPinned] = useState(false)

  // ── Exams State ──
  const [exams, setExams] = useState<SchoolExamItem[]>([])
  const [examClassFilter, setExamClassFilter] = useState(() => ALL_CLASSROOMS[0]?.code || '1/A')
  const [examTypeFilter, setExamTypeFilter] = useState('all')
  const [examSearchQuery, setExamSearchQuery] = useState('')
  const [isExamModalOpen, setIsExamModalOpen] = useState(false)
  const [examViewMode, setExamViewMode] = useState<'timeline' | 'grid'>('timeline')

  // Form State for Exam
  const [examFormClass, setExamFormClass] = useState(() => ALL_CLASSROOMS[0]?.code || '1/A')
  const [examFormCourse, setExamFormCourse] = useState('Türk Dili ve Edebiyatı')
  const [examFormTitle, setExamFormTitle] = useState('')
  const [examFormType, setExamFormType] = useState<SchoolExamItem['type']>('exam')
  const [examFormDate, setExamFormDate] = useState('2026-10-28')
  const [examFormPeriod, setExamFormPeriod] = useState(3)
  const [examFormTime, setExamFormTime] = useState('10:20 - 11:00')
  const [examFormDuration, setExamFormDuration] = useState(40)
  const [examFormLocation, setExamFormLocation] = useState(() => `Derslik (${ALL_CLASSROOMS[0]?.code || '1/A'})`)
  const [examFormScope, setExamFormScope] = useState('')
  const [isSubmittingExam, setIsSubmittingExam] = useState(false)

  // Teacher Profile from localStorage
  const [teacherName, setTeacherName] = useState('Bahar ÇETİN')

  // ── Load Notes & Exams ──
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const profile = localStorage.getItem('oxonom_teacher_profile')
        if (profile) {
          const parsed = JSON.parse(profile)
          setTeacherName(`${parsed.firstName || 'Ebru'} ${parsed.lastName || 'TEKNECİ'}`)
        }
      } catch (_) {}

      // Load local notes
      setNotes(getStoredTeacherNotes())

      // Load exams from local first, then sync from server
      setExams(getStoredSchoolExams())
      fetchExamsFromServer().then((srvExams) => {
        if (srvExams && srvExams.length > 0) {
          setExams(srvExams)
        }
      })

      const handleNotesUpdate = () => setNotes(getStoredTeacherNotes())
      const handleExamsUpdate = () => setExams(getStoredSchoolExams())

      window.addEventListener('oxonom_teacher_notes_updated', handleNotesUpdate)
      window.addEventListener('oxonom_exam_calendar_updated', handleExamsUpdate)
      window.addEventListener('storage', handleExamsUpdate)

      return () => {
        window.removeEventListener('oxonom_teacher_notes_updated', handleNotesUpdate)
        window.removeEventListener('oxonom_exam_calendar_updated', handleExamsUpdate)
        window.removeEventListener('storage', handleExamsUpdate)
      }
    }
  }, [])

  // ── Note CRUD Handlers ──
  const openNewNoteModal = () => {
    setEditingNote(null)
    setNoteFormTitle('')
    setNoteFormCategory('lesson_plan')
    setNoteFormContent('')
    setNoteFormColor('blue')
    setNoteFormClass(ALL_CLASSROOMS[0]?.code || '1/A')
    setNoteFormTags('')
    setNoteFormPinned(false)
    setIsNoteModalOpen(true)
  }

  const openEditNoteModal = (note: TeacherNote) => {
    setEditingNote(note)
    setNoteFormTitle(note.title)
    setNoteFormCategory(note.category)
    setNoteFormContent(note.content)
    setNoteFormColor(note.color)
    setNoteFormClass(note.className || ALL_CLASSROOMS[0]?.code || '1/A')
    setNoteFormTags(note.tags ? note.tags.join(', ') : '')
    setNoteFormPinned(note.isPinned)
    setIsNoteModalOpen(true)
  }

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteFormTitle.trim() || !noteFormContent.trim()) {
      toast.error('Lütfen not başlığı ve içeriği giriniz.')
      return
    }

    const tagsArray = noteFormTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const nowStr = new Date().toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
    const dateStr = new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    if (editingNote) {
      const updated: TeacherNote[] = notes.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              title: noteFormTitle.trim(),
              category: noteFormCategory,
              content: noteFormContent.trim(),
              color: noteFormColor,
              className: noteFormClass,
              tags: tagsArray,
              isPinned: noteFormPinned,
              updatedAt: nowStr,
            }
          : n
      )
      setNotes(updated)
      saveStoredTeacherNotes(updated)
      toast.success('Not başarıyla güncellendi.')
    } else {
      const newNote: TeacherNote = {
        id: `note-${Date.now()}`,
        title: noteFormTitle.trim(),
        category: noteFormCategory,
        content: noteFormContent.trim(),
        color: noteFormColor,
        className: noteFormClass,
        tags: tagsArray,
        isPinned: noteFormPinned,
        date: dateStr,
        updatedAt: nowStr,
      }
      const updated = [newNote, ...notes]
      setNotes(updated)
      saveStoredTeacherNotes(updated)
      toast.success('Yeni not oluşturuldu ve ajandaya eklendi!')
    }

    setIsNoteModalOpen(false)
  }

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id)
    setNotes(updated)
    saveStoredTeacherNotes(updated)
    toast.success('Not silindi.')
  }

  const handleTogglePinNote = (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    setNotes(updated)
    saveStoredTeacherNotes(updated)
  }

  const handleCopyNote = (note: TeacherNote) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`)
    toast.success('Not metni panoya kopyalandı!')
  }

  // ── Exam CRUD & Sync Handlers ──
  const openNewExamModal = () => {
    const targetClass = examClassFilter === 'all' ? (ALL_CLASSROOMS[0]?.code || '1/A') : examClassFilter
    setExamFormClass(targetClass)
    setExamFormCourse('Türk Dili ve Edebiyatı')
    setExamFormTitle('1. Dönem 2. Yazılı Sınavı')
    setExamFormType('exam')
    setExamFormDate('2026-10-28')
    setExamFormPeriod(3)
    setExamFormTime('10:20 - 11:00')
    setExamFormDuration(40)
    setExamFormLocation(`Derslik (${targetClass})`)
    setExamFormScope('Şiir bilgisi, aruz vezni, hikaye tahlilleri ve imla kuralları.')
    setIsExamModalOpen(true)
  }

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!examFormTitle.trim() || !examFormCourse.trim()) {
      toast.error('Lütfen sınav başlığı ve ders adını giriniz.')
      return
    }

    setIsSubmittingExam(true)

    // Formatted date string for display
    let displayDate = examFormDate
    try {
      const d = new Date(examFormDate)
      if (!isNaN(d.getTime())) {
        displayDate = d.toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      }
    } catch (_) {}

    const newExam: SchoolExamItem = {
      id: `exam-${Date.now()}`,
      className: examFormClass,
      courseName: examFormCourse,
      title: examFormTitle.trim(),
      type: examFormType,
      date: displayDate,
      time: examFormTime,
      period: examFormPeriod,
      durationMinutes: examFormDuration,
      location: examFormLocation,
      teacherName: teacherName || 'Bahar ÇETİN',
      scope: examFormScope.trim(),
      isPublished: true,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    }

    // Update local state and localStorage
    const updated = [newExam, ...exams]
    setExams(updated)
    saveStoredSchoolExams(updated)

    // Push to server API for cross-browser sync
    await pushExamToServer(newExam)

    setIsSubmittingExam(false)
    setIsExamModalOpen(false)
    toast.success(
      `Sınav takvime eklendi ve ${newExam.className} sınıfı öğrencilerinin "Sınav Takvimi" ekranına anında yansıtıldı!`,
      { duration: 5000 }
    )
  }

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Bu sınavı takvimden silmek istediğinize emin misiniz?')) return
    const updated = exams.filter((e) => e.id !== examId)
    setExams(updated)
    saveStoredSchoolExams(updated)
    await deleteExamFromServer(examId)
    toast.success('Sınav takvimden kaldırıldı.')
  }

  // ── Filtered Notes ──
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        if (noteCategoryFilter !== 'all' && n.category !== noteCategoryFilter) return false
        if (noteColorFilter !== 'all' && n.color !== noteColorFilter) return false
        if (noteSearchQuery.trim()) {
          const q = noteSearchQuery.toLowerCase()
          const matchTitle = n.title.toLowerCase().includes(q)
          const matchContent = n.content.toLowerCase().includes(q)
          const matchTags = n.tags?.some((t) => t.toLowerCase().includes(q))
          if (!matchTitle && !matchContent && !matchTags) return false
        }
        return true
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return 0
      })
  }, [notes, noteCategoryFilter, noteColorFilter, noteSearchQuery])

  // ── Filtered Exams ──
  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      if (examClassFilter !== 'all' && e.className !== examClassFilter && e.className !== 'Tüm Sınıflar') {
        return false
      }
      if (examTypeFilter !== 'all' && e.type !== examTypeFilter) return false
      if (examSearchQuery.trim()) {
        const q = examSearchQuery.toLowerCase()
        return (
          e.title.toLowerCase().includes(q) ||
          e.courseName.toLowerCase().includes(q) ||
          (e.scope && e.scope.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [exams, examClassFilter, examTypeFilter, examSearchQuery])

  const upcomingExams = useMemo(() => {
    return filteredExams.filter((e) => e.status !== 'completed')
  }, [filteredExams])

  const completedExams = useMemo(() => {
    return filteredExams.filter((e) => e.status === 'completed')
  }, [filteredExams])

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
            <CalendarDays size={14} />
            <span>Öğretmen Çalışma Masası</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Ajanda & Sınav Takvimi
            </h1>
            <MockBadge label="Canlı Senkronize" />
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Renkli kategorize ders notları, zümre toplantıları ve öğrencilere canlı yansıyan resmi sınav takvimi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={openNewNoteModal}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#131C31] hover:bg-gray-50 dark:hover:bg-[#19243E] border border-gray-200/80 dark:border-gray-800 text-gray-800 dark:text-gray-200 text-xs font-extrabold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus size={16} className="text-indigo-500" />
            <span>Yeni Not Oluştur</span>
          </button>

          <button
            type="button"
            onClick={openNewExamModal}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <CalendarIcon size={16} />
            <span>+ Sınav Takvimine Ekle</span>
          </button>
        </div>
      </div>

      {/* ── MAIN NAVIGATION TABS ── */}
      <div className="flex items-center gap-2 border-b border-gray-200/80 dark:border-gray-800/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60'
          }`}
        >
          <Layers size={14} />
          <span>Tüm Ajanda</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'calendar'
              ? 'bg-brand-gradient text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60'
          }`}
        >
          <CalendarIcon size={14} />
          <span>Takvim & Hatırlatıcılar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'notes'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60'
          }`}
        >
          <FileText size={14} />
          <span>Notlarım & Not Oluştur</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">{notes.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'exams'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60'
          }`}
        >
          <CalendarDays size={14} />
          <span>Sınav Takvimi</span>
          <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
            {exams.length}
          </span>
        </button>
      </div>

      {/* ── TAB CONTENT ── */}

      {/* 1. OVERVIEW: TÜM AJANDA */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <div className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                  {notes.length}
                </div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Kayıtlı Not
                </div>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <CalendarDays size={20} />
              </div>
              <div>
                <div className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                  {upcomingExams.length}
                </div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Yaklaşan Sınav
                </div>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                  {completedExams.length}
                </div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Tamamlanan Sınav
                </div>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <GraduationCap size={20} />
              </div>
              <div>
                <div className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                  {examClassFilter}
                </div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Aktif Şube
                </div>
              </div>
            </div>
          </div>

          {/* ── İNTERAKTİF TAKVİM & GÜNLÜK HATIRLATICI MODÜLÜ ── */}
          <CalendarReminderWidget
            storageKey="oxonom_teacher_calendar_reminders"
            role="teacher"
            title="Öğretmen Ajandası & Hatırlatıcı Takvimi"
            description="Günlere özel ders/çalışma notları ekleyebilir, sesli ve açılır pencereli (pop-up) hatırlatıcılar kurabilirsiniz."
          />

          {/* Side by Side Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Upcoming Exam Schedule Preview */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      Yaklaşan Sınav Takvimi
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      Öğrenci ekranlarına senkronize sınavlar
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('exams')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Tümünü Gör</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-3">
                {upcomingExams.slice(0, 4).map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {ex.className}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">{ex.courseName}</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-gray-900 dark:text-white">
                        {ex.title}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock size={12} className="text-amber-500" />
                          {ex.time}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin size={12} className="text-emerald-500" />
                          {ex.location}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                        {ex.date}
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Yayında
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Pinned & Recent Notes Preview */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Pin size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      Önemli & Sabitlenmiş Notlar
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      Ders hazırlıkları ve öğrenci gözlemleri
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Tüm Notlar</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-3">
                {notes.slice(0, 3).map((note) => {
                  const theme = NOTE_COLOR_THEMES[note.color] || NOTE_COLOR_THEMES.blue
                  return (
                    <div
                      key={note.id}
                      onClick={() => openEditNoteModal(note)}
                      className={`p-3.5 rounded-2xl border ${theme.border} ${theme.bgLight} ${theme.bgDark} transition-all cursor-pointer space-y-1.5`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          {NOTE_CATEGORIES.find((c) => c.id === note.category)?.label || 'Not'}
                        </span>
                        {note.isPinned && <Pin size={12} className="text-amber-500 fill-amber-500" />}
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                        {note.title}
                      </h4>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. TAB: TAKVİM & HATIRLATICI MODÜLÜ (GÜN NOTLARI & SESLİ POPUP) ── */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <CalendarReminderWidget
            storageKey="oxonom_teacher_calendar_reminders"
            role="teacher"
            title="Öğretmen Ajandası & Hatırlatıcı Takvimi"
            description="Tüm günlere özel çalışma ve ders notları ekleyebilir, belirlediğiniz gün ve saat geldiğinde sesli pop-up hatırlatıcı alabilirsiniz."
          />
        </div>
      )}

      {/* 2. TAB: NOTLARIM & NOT OLUŞTUR (Detaylı Renkli Kategorize Notlarım Sayfası) */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Controls Bar: Search & Category Filter Pills */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Not başlığı, içerik veya etiket ara..."
                  value={noteSearchQuery}
                  onChange={(e) => setNoteSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/80 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Color filter dots */}
              <div className="flex items-center gap-1.5 self-start md:self-auto">
                <span className="text-[11px] font-bold text-gray-400 mr-1">Renk:</span>
                <button
                  type="button"
                  onClick={() => setNoteColorFilter('all')}
                  className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                    noteColorFilter === 'all'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}
                  title="Tüm Renkler"
                >
                  *
                </button>
                {(Object.keys(NOTE_COLOR_THEMES) as Array<TeacherNote['color']>).map((col) => {
                  const item = NOTE_COLOR_THEMES[col]
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNoteColorFilter(col)}
                      className={`w-6 h-6 rounded-full ${item.dot} transition-transform ${
                        noteColorFilter === col ? 'scale-125 ring-2 ring-indigo-500' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={item.name}
                    />
                  )
                })}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <button
                type="button"
                onClick={() => setNoteCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  noteCategoryFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Tüm Kategoriler ({notes.length})
              </button>

              {NOTE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setNoteCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    noteCategoryFilter === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {cat.label} ({notes.filter((n) => n.category === cat.id).length})
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80">
              <FileText size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Aradığınız kriterde not bulunamadı</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Filtreleri temizleyebilir veya "Yeni Not Oluştur" butonuyla hemen yeni bir ders/gözlem notu ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => {
                const theme = NOTE_COLOR_THEMES[note.color] || NOTE_COLOR_THEMES.blue
                const categoryDef = NOTE_CATEGORIES.find((c) => c.id === note.category)

                return (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`rounded-3xl border ${theme.border} ${theme.bgLight} ${theme.bgDark} p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group relative overflow-hidden`}
                  >
                    {/* Top Accent Strip */}
                    <div className="space-y-3">
                      {/* Card Header: Category Badge + Pinned + Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.8 rounded-full ${categoryDef?.bg || 'bg-gray-500/10'}`}>
                          {categoryDef?.label || 'Not'}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTogglePinNote(note.id)
                            }}
                            className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                              note.isPinned ? 'text-amber-500 fill-amber-500' : 'text-gray-400'
                            }`}
                            title={note.isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
                          >
                            <Pin size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyNote(note)
                            }}
                            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            title="Panoya Kopyala"
                          >
                            <Copy size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditNoteModal(note)
                            }}
                            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-indigo-600 transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteNote(note.id)
                            }}
                            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-rose-600 transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug">
                        {note.title}
                      </h3>

                      {/* Content */}
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>

                    {/* Footer: Date & Tags */}
                    <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 space-y-2">
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {note.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span>{note.className ? `Şube: ${note.className}` : 'Genel'}</span>
                        <span>{note.updatedAt || note.date}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. TAB: SINAV TAKVİMİ (Anlaşılır, Şık ve Öğrenciye Canlı Yansıyan Sınav Yönetimi) */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          {/* Top Filter and Controls Card */}
          <div className="p-4.5 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Class Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                <span className="text-xs font-bold text-gray-400 mr-1 flex items-center gap-1">
                  <Filter size={13} />
                  <span>Şube:</span>
                </span>
                {[...ALL_CLASSROOMS.map((c) => c.code), 'all'].map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setExamClassFilter(cls)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                      examClassFilter === cls
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {cls === 'all' ? 'Tüm Şubeler' : `${cls} Şubesi`}
                  </button>
                ))}
              </div>

              {/* Add Exam Big Button */}
              <button
                type="button"
                onClick={openNewExamModal}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Plus size={16} />
                <span>+ Yeni Sınav Tanımla</span>
              </button>
            </div>

            {/* Sub-Filters: Type Filter & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800/60">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setExamTypeFilter('all')}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    examTypeFilter === 'all'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Tümü ({filteredExams.length})
                </button>
                <button
                  type="button"
                  onClick={() => setExamTypeFilter('exam')}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    examTypeFilter === 'exam'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Yazılı Sınavlar
                </button>
                <button
                  type="button"
                  onClick={() => setExamTypeFilter('common')}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    examTypeFilter === 'common'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Ortak Sınavlar
                </button>
                <button
                  type="button"
                  onClick={() => setExamTypeFilter('quiz')}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    examTypeFilter === 'quiz'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Mini Quizler
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ders veya sınav adı ara..."
                  value={examSearchQuery}
                  onChange={(e) => setExamSearchQuery(e.target.value)}
                  className="w-full h-8.5 pl-8 pr-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/80 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Synchronized Notice Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 flex items-start gap-3">
            <Info size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
              <span className="font-bold">Öğrenci Portalı Entegrasyonu:</span> Bu ekranda tanımladığınız tüm yazılı sınav ve quizler, ilgili sınıftaki ({examClassFilter}) tüm öğrencilerin{' '}
              <span className="font-extrabold underline">&quot;Sınav Takvimi&quot;</span> ekranında otomatik olarak görüntülenir.
            </div>
          </div>

          {/* Sınav Listesi / Timeline Cards */}
          {filteredExams.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80">
              <CalendarDays size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Seçilen kriterde sınav bulunamadı</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Yeni bir yazılı sınav veya quiz tanımlamak için yukarıdaki "+ Yeni Sınav Tanımla" butonuna tıklayabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExams.map((exam) => {
                const isCompleted = exam.status === 'completed'
                const typeBadge =
                  exam.type === 'common'
                    ? { label: 'MEB Ortak Sınav', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' }
                    : exam.type === 'quiz'
                    ? { label: 'Mini Quiz', bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' }
                    : exam.type === 'mock'
                    ? { label: 'Deneme Sınavı', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' }
                    : { label: 'Yazılı Sınav', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' }

                return (
                  <motion.div
                    key={exam.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Date & Time Pillar */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/20 border border-indigo-500/20 flex flex-col items-center justify-center text-center shrink-0">
                        <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          {exam.date.split(' ')[1] || 'EKİM'}
                        </span>
                        <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                          {exam.date.split(' ')[0] || '12'}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400">
                          {exam.period ? `${exam.period}. Ders` : 'Saatli'}
                        </span>
                      </div>

                      {/* Middle: Details */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${typeBadge.bg}`}>
                            {typeBadge.label}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {exam.className} Şubesi
                          </span>
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {exam.courseName}
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                          {exam.title}
                        </h3>

                        {exam.scope && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl line-clamp-2">
                            <span className="font-bold text-gray-900 dark:text-white">Kapsam: </span>
                            {exam.scope}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400 flex-wrap pt-1">
                          <span className="flex items-center gap-1 font-semibold">
                            <Clock size={13} className="text-amber-500" />
                            {exam.time} ({exam.durationMinutes} dk)
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <MapPin size={13} className="text-emerald-500" />
                            {exam.location}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <UserCheck size={13} className="text-indigo-500" />
                            {exam.teacherName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                      {isCompleted ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <CheckCircle2 size={15} />
                          <span>Tamamlandı</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
                          <Clock size={15} />
                          <span>Öğrenciye Açık</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteExam(exam.id)}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Sınavı Kaldır"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CREATE / EDIT NOTE MODAL ── */}
      <AnimatePresence>
        {isNoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNoteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1526] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                    {editingNote ? 'Notu Düzenle' : 'Yeni Not Oluştur'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Kişisel çalışma notu, öğrenci gözlemi veya ders hazırlığı
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveNote} className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Not Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`Örn: ${examClassFilter} Ders Uygulaması`}
                    value={noteFormTitle}
                    onChange={(e) => setNoteFormTitle(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {/* Category & Class */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Kategori *
                    </label>
                    <select
                      value={noteFormCategory}
                      onChange={(e) => setNoteFormCategory(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-hidden"
                    >
                      {NOTE_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      İlgili Şube
                    </label>
                    <select
                      value={noteFormClass}
                      onChange={(e) => setNoteFormClass(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-hidden"
                    >
                      {ALL_CLASSROOMS.map((cls) => (
                        <option key={cls.id} value={cls.code}>
                          {cls.name}
                        </option>
                      ))}
                      <option value="Tüm Sınıflar">Tüm Sınıflar</option>
                      <option value="Genel">Genel</option>
                    </select>
                  </div>
                </div>

                {/* Color Theme Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Kart Rengi & Tema
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(Object.keys(NOTE_COLOR_THEMES) as Array<TeacherNote['color']>).map((col) => {
                      const item = NOTE_COLOR_THEMES[col]
                      const selected = noteFormColor === col
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setNoteFormColor(col)}
                          className={`w-7 h-7 rounded-full ${item.dot} flex items-center justify-center transition-transform cursor-pointer ${
                            selected ? 'scale-125 ring-2 ring-indigo-500' : 'opacity-70 hover:opacity-100'
                          }`}
                          title={item.name}
                        >
                          {selected && <Check size={13} className="text-white drop-shadow-sm" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Not İçeriği *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Ders kazanımları, öğrenci gözlemleri veya yapılacaklar..."
                    value={noteFormContent}
                    onChange={(e) => setNoteFormContent(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {/* Tags & Pinned Toggle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Etiketler (Virgülle ayırın)
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Sınav, Akıllı Tahta, Vezin"
                      value={noteFormTags}
                      onChange={(e) => setNoteFormTags(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={noteFormPinned}
                        onChange={(e) => setNoteFormPinned(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Bu Notu Başa Sabitle (Pin)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNoteModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-sm cursor-pointer"
                  >
                    {editingNote ? 'Değişiklikleri Kaydet' : 'Notu Kaydet'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CREATE EXAM MODAL (Cross-role Synced to Student) ── */}
      <AnimatePresence>
        {isExamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmittingExam && setIsExamModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1526] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <CalendarDays size={18} className="text-indigo-600" />
                    <span>Sınav Takvimine Ekle</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Tanımlanan sınav ilgili sınıfın öğrenci paneline doğrudan yansıtılır.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  disabled={isSubmittingExam}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Exam Form */}
              <form onSubmit={handleSaveExam} className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
                {/* Sınıf & Ders Seçimi */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Hedef Sınıf / Şube *
                    </label>
                    <select
                      value={examFormClass}
                      onChange={(e) => setExamFormClass(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white font-bold focus:outline-hidden"
                    >
                      {ALL_CLASSROOMS.map((cls) => (
                        <option key={cls.id} value={cls.code}>
                          {cls.name}
                        </option>
                      ))}
                      <option value="Tüm Sınıflar">Tüm Şubeler (Ortak)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Ders *
                    </label>
                    <select
                      value={examFormCourse}
                      onChange={(e) => setExamFormCourse(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white font-bold focus:outline-hidden"
                    >
                      <option value="Türk Dili ve Edebiyatı">Türk Dili ve Edebiyatı</option>
                      <option value="Matematik">Matematik</option>
                      <option value="Fizik & Fen Bilimleri">Fizik & Fen Bilimleri</option>
                      <option value="Bilişim & Kodlama">Bilişim & Kodlama</option>
                      <option value="Yabancı Dil (İngilizce)">Yabancı Dil (İngilizce)</option>
                      <option value="Tarih">Tarih</option>
                      <option value="Coğrafya">Coğrafya</option>
                    </select>
                  </div>
                </div>

                {/* Sınav Adı & Türü */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Sınav Adı *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: 1. Dönem 2. Yazılı Sınavı"
                      value={examFormTitle}
                      onChange={(e) => setExamFormTitle(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Sınav Türü
                    </label>
                    <select
                      value={examFormType}
                      onChange={(e) => setExamFormType(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-hidden"
                    >
                      <option value="exam">Yazılı Sınav</option>
                      <option value="common">Ortak Sınav (MEB / Okul Geneli)</option>
                      <option value="quiz">Mini Quiz / Tarama</option>
                      <option value="mock">Deneme Sınavı</option>
                      <option value="performance">Performans Değerlendirmesi</option>
                    </select>
                  </div>
                </div>

                {/* Tarih, Ders Saati ve Saat */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Sınav Tarihi *
                    </label>
                    <input
                      type="date"
                      required
                      value={examFormDate}
                      onChange={(e) => setExamFormDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Ders Saati
                    </label>
                    <select
                      value={examFormPeriod}
                      onChange={(e) => {
                        const p = Number(e.target.value)
                        setExamFormPeriod(p)
                        const times: Record<number, string> = {
                          1: '08:30 - 09:10',
                          2: '09:25 - 10:05',
                          3: '10:20 - 11:00',
                          4: '11:15 - 11:55',
                          5: '12:45 - 13:25',
                          6: '13:40 - 14:20',
                        }
                        if (times[p]) setExamFormTime(times[p])
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-hidden"
                    >
                      <option value={1}>1. Ders (08:30)</option>
                      <option value={2}>2. Ders (09:25)</option>
                      <option value={3}>3. Ders (10:20)</option>
                      <option value={4}>4. Ders (11:15)</option>
                      <option value={5}>5. Ders (12:45)</option>
                      <option value={6}>6. Ders (13:40)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Saat Aralığı
                    </label>
                    <input
                      type="text"
                      value={examFormTime}
                      onChange={(e) => setExamFormTime(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Derslik ve Süre */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Sınav Yeri / Derslik
                    </label>
                    <input
                      type="text"
                      value={examFormLocation}
                      onChange={(e) => setExamFormLocation(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Sınav Süresi (Dk)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={examFormDuration}
                      onChange={(e) => setExamFormDuration(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Sınav Kapsamı / Konular */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Sınav Kapsamı & Kazanımlar (Öğrenciler Görecektir)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Örn: 1. ve 2. ünite konuları, divan edebiyatı şiir tahlili ve imla kuralları..."
                    value={examFormScope}
                    onChange={(e) => setExamFormScope(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {/* Live Sync Confirmation Box */}
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <Sparkles size={16} className="text-amber-500 shrink-0" />
                  <span>
                    Bu sınav kaydedildiği anda <span className="font-extrabold">{examFormClass}</span> sınıfındaki tüm öğrencilerin Akademik Takvim / Sınav Takvimi ekranına yayınlanır.
                  </span>
                </div>

                {/* Modal Footer */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExamModalOpen(false)}
                    disabled={isSubmittingExam}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingExam}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-extrabold shadow-sm cursor-pointer flex items-center gap-2"
                  >
                    {isSubmittingExam ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Kaydediliyor...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Kaydet ve Öğrencilere Yayınla</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
