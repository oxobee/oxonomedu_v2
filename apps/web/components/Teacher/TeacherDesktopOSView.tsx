'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tv,
  CheckSquare,
  Calendar,
  CalendarDays,
  BookOpen,
  BookOpenCheck,
  Award,
  FolderOpen,
  Users,
  BarChart3,
  TrendingUp,
  Settings,
  Search,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Clock,
  Pin,
  Grid,
  ExternalLink,
  School,
  FileQuestion,
  Upload,
  ArrowRight,
  ShieldCheck,
  Image as ImageIcon,
  Check,
  Smartphone,
  Eye,
  Type,
  Palette,
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  Sliders,
  Layers,
  ArrowLeft,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { ALL_CLASSROOMS } from '@services/demo/schoolDirectory'
import { signOut } from '@components/Contexts/AuthContext'
import {
  DesktopOSConfig,
  DesktopHeroSlide,
  DesktopShortcutItem,
  ShortcutCategory,
  SHORTCUT_CATEGORIES,
  getDesktopOSConfig,
  DEFAULT_DESKTOP_OS_CONFIG,
} from '@/lib/os/desktopOsStorage'

// Lazy-loaded or directly embedded views
import TeacherAttendanceView from './views/TeacherAttendanceView'
import TeacherScheduleView from './views/TeacherScheduleView'
import TeacherClassesView from './views/TeacherClassesView'
import TeacherAssessmentsView from './views/TeacherAssessmentsView'
import TeacherAgendaView from './views/TeacherAgendaView'
import TeacherFilesView from './views/TeacherFilesView'
import TeacherCoursesManagementView from './views/TeacherCoursesManagementView'
import TeacherReportsView from './views/TeacherReportsView'
import TeacherProgressView from './views/TeacherProgressView'
import MHomeworkClient from '@components/Mobile/MHomeworkClient'
import MProfileClient from '@components/Mobile/MProfileClient'

export default function TeacherDesktopOSView() {
  // ── 1. ACTIVE CLASSROOM & TEACHER IDENTITY ──
  const [activeClassCode, setActiveClassCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_selected_class')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.code) return parsed.code
        }
      } catch (_) {}
    }
    return ALL_CLASSROOMS[0]?.code || '1/B'
  })

  const [teacherName, setTeacherName] = useState<string>('Ebru TEKNECİ')
  const [teacherBranch, setTeacherBranch] = useState<string>('Türk Dili ve Edebiyatı')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const pStr = localStorage.getItem('oxonom_teacher_profile')
        if (pStr) {
          const p = JSON.parse(pStr)
          if (p.name) setTeacherName(p.name)
          else if (p.firstName) setTeacherName(`${p.firstName} ${p.lastName || ''}`.trim())
          if (p.branch) setTeacherBranch(p.branch)
        }
      } catch (_) {}
    }
  }, [])

  // ── 2. REAL-TIME DIGITAL CLOCK ──
  const [timeStr, setTimeStr] = useState<string>('')
  const [dateStr, setDateStr] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(
        now.toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      )
      setDateStr(
        now.toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          weekday: 'long',
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // ── 3. OS CONFIGURATION (HERO SLIDER & SHORTCUT POSTERS) ──
  const [config, setConfig] = useState<DesktopOSConfig>(DEFAULT_DESKTOP_OS_CONFIG)

  useEffect(() => {
    // Load config initially
    const loaded = getDesktopOSConfig()
    setConfig(loaded)

    // Listen for custom events triggered by Superadmin
    const handleConfigUpdate = (e: any) => {
      if (e.detail) {
        setConfig(e.detail)
      } else {
        setConfig(getDesktopOSConfig())
      }
    }
    window.addEventListener('oxonom-os-config-updated', handleConfigUpdate)
    window.addEventListener('storage', handleConfigUpdate)

    return () => {
      window.removeEventListener('oxonom-os-config-updated', handleConfigUpdate)
      window.removeEventListener('storage', handleConfigUpdate)
    }
  }, [])

  // ── 4. HERO SLIDER STATE ──
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [isSliderHovered, setIsSliderHovered] = useState(false)

  const activeSlides = useMemo(() => {
    const valid = config.heroSlides.filter((s) => s.isActive)
    return valid.length > 0 ? valid : DEFAULT_DESKTOP_OS_CONFIG.heroSlides
  }, [config.heroSlides])

  // Auto rotate hero slides every 6 seconds
  useEffect(() => {
    if (isSliderHovered || activeSlides.length <= 1) return
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % activeSlides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [isSliderHovered, activeSlides.length])

  // ── 5. CATEGORY FILTER STATE (Pill Navigation) ──
  const [selectedCategory, setSelectedCategory] = useState<ShortcutCategory | 'all'>('all')

  // Group shortcuts by category
  const categorizedSections = useMemo(() => {
    const list = config.shortcuts || DEFAULT_DESKTOP_OS_CONFIG.shortcuts

    if (selectedCategory !== 'all') {
      const filtered = list.filter((item) => item.category === selectedCategory)
      const catInfo = SHORTCUT_CATEGORIES.find((c) => c.id === selectedCategory)
      return [
        {
          id: selectedCategory,
          title: catInfo?.title || 'Filtrelenen Menüler',
          desc: catInfo?.desc || '',
          items: filtered,
        },
      ]
    }

    // Default view: Multiple categorized Netflix-style rows
    return [
      {
        id: 'core' as ShortcutCategory,
        title: 'Öne Çıkan Hızlı İşlemler & Ders',
        desc: 'Günlük derste en sık kullanılan ana öğretmen modülleri',
        items: list.filter((i) => i.category === 'core'),
      },
      {
        id: 'students' as ShortcutCategory,
        title: 'Sınıf & Öğrenci Yönetimi',
        desc: 'Öğrenci listesi, gelişim takibi, sınıf başarı grafikleri ve rehberlik',
        items: list.filter((i) => i.category === 'students'),
      },
      {
        id: 'materials' as ShortcutCategory,
        title: 'Eğitim & Dijital Materyaller (Devam Edenler)',
        desc: 'MEB e-kitaplar, ders sunumları, PDF kütüphanesi ve tahta çıktıları',
        items: list.filter((i) => i.category === 'materials'),
      },
      {
        id: 'assessments' as ShortcutCategory,
        title: 'Ölçme, Değerlendirme & Sınavlar',
        desc: 'İnteraktif sınavlar, quizler, yazılı takvimi ve ödevlendirme',
        items: list.filter((i) => i.category === 'assessments'),
      },
      {
        id: 'planning' as ShortcutCategory,
        title: 'Planlama, Ajanda & Takvim',
        desc: 'Haftalık ders programı, zümre ajandası ve MEB resmi akademik takvim',
        items: list.filter((i) => i.category === 'planning'),
      },
    ].filter((sec) => sec.items.length > 0)
  }, [config.shortcuts, selectedCategory])

  // ── 6. ACTIVE WINDOW MANAGEMENT SYSTEM ──
  const [activeWindowAppId, setActiveWindowAppId] = useState<string | null>(null)
  const [isWindowMaximized, setIsWindowMaximized] = useState<boolean>(false)

  // Find active app item for window
  const activeApp = useMemo(() => {
    if (!activeWindowAppId) return null
    return (
      config.shortcuts.find((s) => s.windowId === activeWindowAppId || s.id === activeWindowAppId) || {
        id: activeWindowAppId,
        title: 'Öğretmen Modülü',
        subtitle: `${activeClassCode} Şubesi`,
        windowId: activeWindowAppId,
        posterImage: '',
        category: 'core' as ShortcutCategory,
        order: 1,
      }
    )
  }, [activeWindowAppId, config.shortcuts, activeClassCode])

  const openAppWindow = (windowIdOrAppId: string) => {
    setActiveWindowAppId(windowIdOrAppId)
    setIsWindowMaximized(false)
  }

  const closeAppWindow = () => {
    setActiveWindowAppId(null)
  }

  // ── 7. CLASSROOM PICKER MODAL ──
  const [isClassPickerOpen, setIsClassPickerOpen] = useState(false)
  const handleSelectClass = (cls: any) => {
    setActiveClassCode(cls.code)
    try {
      localStorage.setItem('oxonom_selected_class', JSON.stringify(cls))
    } catch (_) {}
    setIsClassPickerOpen(false)
    toast.success(`Aktif sınıf ${cls.code} olarak seçildi.`)
  }

  // ── 8. SMARTBOARD / TAHTAYA GÖNDER MODAL ──
  const [isSmartboardModalOpen, setIsSmartboardModalOpen] = useState(false)
  const [smartboardStep, setSmartboardStep] = useState<'main' | 'file' | 'exam'>('main')
  const [boardId, setBoardId] = useState('1A')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [examTitle, setExamTitle] = useState('')
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: 'Türk edebiyatında ilk edebi roman hangisidir?',
      options: ['İntibah', 'Araba Sevdası', 'Taaşşuk-ı Talat ve Fitnat', 'Mai ve Siyah'],
      correctAnswer: 0,
    },
  ])

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        setFilePreview(uploadEvent.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSendFileToBoard = () => {
    if (!selectedFile && !filePreview) {
      toast.error('Lütfen önce bir görsel veya materyal seçin.')
      return
    }
    toast.success(`Görsel ${boardId} akıllı tahtasına başarıyla gönderildi!`)
    setIsSmartboardModalOpen(false)
    setSelectedFile(null)
    setFilePreview(null)
    setSmartboardStep('main')
  }

  const handleSendExamToBoard = () => {
    if (!examTitle.trim()) {
      toast.error('Lütfen sınav başlığı giriniz.')
      return
    }
    toast.success(`"${examTitle}" sınavı ${boardId} akıllı tahtasına başarıyla gönderildi!`)
    setIsSmartboardModalOpen(false)
    setExamTitle('')
    setSmartboardStep('main')
  }

  // ── 9. EXIT OS HANDLER ──
  const handleExitOS = () => {
    // If opened via target="_blank", attempt to close, or redirect to /teacher/dashboard
    if (typeof window !== 'undefined') {
      if (window.opener) {
        window.close()
      } else {
        window.location.href = '/teacher/dashboard'
      }
    }
  }

  // Horizontal scroll refs
  const rowRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const scrollRow = (secId: string, direction: 'left' | 'right') => {
    const el = rowRefs.current[secId]
    if (el) {
      const scrollAmount = direction === 'left' ? -420 : 420
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0D13] text-white font-jakarta select-none relative flex flex-col justify-between overflow-x-hidden">
      <Toaster position="top-right" />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP CINEMATIC OS HEADER BAR                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-14 w-full px-4 sm:px-6 bg-[#0B0D13]/85 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-3">
        {/* Left: Brand, Teacher & Class Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/teacher/dashboard"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer group"
            title="Öğretmen Standart Paneline Dön"
          >
            <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center font-black text-xs shadow-md">
              OX
            </span>
            <span className="font-black text-xs sm:text-sm tracking-tight text-white group-hover:text-amber-400 transition-colors">
              Öğretmen OS
            </span>
          </Link>

          {/* Teacher Identity Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-200">
            <span>👩‍🏫</span>
            <span className="truncate max-w-[130px]">{teacherName}</span>
          </div>

          {/* Active Class Selector Button */}
          <button
            type="button"
            onClick={() => setIsClassPickerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-extrabold text-xs cursor-pointer transition-all active:scale-95"
            title="Sınıf Değiştir"
          >
            <School size={13} className="text-amber-400" />
            <span>{activeClassCode} Şubesi</span>
            <span className="text-[10px] opacity-75">▼</span>
          </button>
        </div>

        {/* Center: Live Digital Clock */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="font-mono text-xs sm:text-sm font-black tracking-wider bg-black/40 border border-white/10 px-3.5 py-1 rounded-xl backdrop-blur-md text-amber-300">
            <span>{timeStr || '10:20:00'}</span>
            <span className="text-[11px] font-sans font-medium text-gray-300 ml-2">
              • {dateStr}
            </span>
          </div>
        </div>

        {/* Right: Quick Actions, Tahtaya Gönder, Superadmin & EXIT OS */}
        <div className="flex items-center gap-2">
          {/* Quick Smartboard Launch Button */}
          <button
            type="button"
            onClick={() => setIsSmartboardModalOpen(true)}
            className="h-8 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition-all active:scale-95"
            title="Akıllı Tahtaya Dosya veya Sınav Gönder"
          >
            <Tv size={14} />
            <span className="hidden sm:inline">Tahtaya Gönder</span>
          </button>

          {/* Superadmin Settings Link */}
          <Link
            href="/superadmin/os-settings"
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10"
            title="Superadmin OS Ayarları (Afiş & Slider Yönetimi)"
          >
            <Sliders size={13} />
            <span className="hidden md:inline">Afiş Ayarları</span>
          </Link>

          {/* CRITICAL EXIT BUTTON: Prominent button to exit OS screen */}
          <button
            type="button"
            onClick={handleExitOS}
            className="h-8 px-3 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/30 transition-all cursor-pointer active:scale-95 border border-rose-500/40"
            title="OS Ekranından Çık ve Panoya Dön"
          >
            <ArrowLeft size={14} />
            <span>OS'ten Çık</span>
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN STREAMING FEED (HERO SLIDER + CATEGORY ROWS)         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full pb-28 space-y-8">
        {/* ── A) CINEMATIC HERO SLIDER (Web & Mobile, Image 1 & 2 Style) ── */}
        <section
          onMouseEnter={() => setIsSliderHovered(true)}
          onMouseLeave={() => setIsSliderHovered(false)}
          className="relative w-full overflow-hidden bg-black"
        >
          {activeSlides[activeSlideIndex] && (
            <div className="relative w-full min-h-[360px] sm:min-h-[440px] md:min-h-[500px] lg:min-h-[560px] flex items-end">
              {/* Web Banner Background (Hidden on small mobile) */}
              <div className="hidden sm:block absolute inset-0">
                <img
                  src={activeSlides[activeSlideIndex].webImage}
                  alt={activeSlides[activeSlideIndex].title}
                  className="w-full h-full object-cover object-center transform scale-100 transition-all duration-1000 ease-out"
                />
              </div>

              {/* Mobile Banner Background (Displayed on mobile) */}
              <div className="sm:hidden absolute inset-0">
                <img
                  src={
                    activeSlides[activeSlideIndex].mobileImage ||
                    activeSlides[activeSlideIndex].webImage
                  }
                  alt={activeSlides[activeSlideIndex].title}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Dramatic Cinematic Vignette Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D13] via-[#0B0D13]/60 to-transparent" />
              <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#0B0D13] via-[#0B0D13]/70 to-transparent" />

              {/* Slide Content Box */}
              <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-8 sm:pb-12 space-y-3 sm:space-y-4">
                {activeSlides[activeSlideIndex].badge && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black uppercase tracking-wider shadow-lg">
                    <Sparkles size={13} />
                    <span>{activeSlides[activeSlideIndex].badge}</span>
                  </div>
                )}

                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-3xl drop-shadow-xl leading-tight">
                  {activeSlides[activeSlideIndex].title}
                </h1>

                <p className="text-xs sm:text-base text-gray-200 max-w-xl line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-md">
                  {activeSlides[activeSlideIndex].subtitle}
                </p>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const link = activeSlides[activeSlideIndex].actionLink
                      if (link) openAppWindow(link)
                      else setIsSmartboardModalOpen(true)
                    }}
                    className="h-11 sm:h-12 px-6 sm:px-8 rounded-2xl bg-[#F5A623] hover:bg-[#F5A623]/90 text-black font-black text-xs sm:text-sm flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#F5A623]/30 cursor-pointer"
                  >
                    <Play size={16} fill="currentColor" />
                    <span>{activeSlides[activeSlideIndex].actionText || 'Hemen Başlat'}</span>
                  </button>

                  {activeSlides[activeSlideIndex].secondaryActionText && (
                    <button
                      type="button"
                      onClick={() => {
                        const secLink = activeSlides[activeSlideIndex].secondaryActionLink
                        if (secLink) openAppWindow(secLink)
                      }}
                      className="h-11 sm:h-12 px-5 sm:px-6 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>{activeSlides[activeSlideIndex].secondaryActionText}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Slider Dots Indicator */}
              <div className="absolute bottom-4 right-4 sm:right-8 z-20 flex items-center gap-1.5">
                {activeSlides.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setActiveSlideIndex(dotIdx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeSlideIndex === dotIdx ? 'w-6 bg-[#F5A623]' : 'w-2 bg-white/40'
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next Chevrons on Hero */}
              <button
                type="button"
                onClick={() =>
                  setActiveSlideIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1))
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 hover:opacity-100 sm:group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => setActiveSlideIndex((prev) => (prev + 1) % activeSlides.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 hover:opacity-100 sm:group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          )}
        </section>

        {/* ── B) CATEGORY FILTER PILLS (Matching Image 1: Movies, Sports...) ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SHORTCUT_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs font-black transition-all cursor-pointer shrink-0 ${
                    active
                      ? 'bg-[#F5A623] text-black shadow-lg shadow-[#F5A623]/25 scale-102'
                      : 'bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10'
                  }`}
                >
                  {cat.title}
                </button>
              )
            })}
          </div>
        </section>

        {/* ── C) CATEGORIZED STREAMING ROWS (Netflix / Peacock Style) ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          {categorizedSections.map((section) => (
            <section key={section.id} className="space-y-3 relative group/row">
              {/* Row Header with Category Title & Scroll Chevrons */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>{section.title}</span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">{section.desc}</p>
                </div>

                {/* Left / Right Scroll Chevrons */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollRow(section.id, 'left')}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
                    title="Önceki"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollRow(section.id, 'right')}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
                    title="Sonraki"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Horizontal Scrollable Rail of Movie Poster Cards */}
              <div
                ref={(el) => {
                  rowRefs.current[section.id] = el
                }}
                className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth scrollbar-none"
              >
                {section.items.map((item) => {
                  const isLandscape = item.format === 'landscape'

                  return (
                    <div
                      key={item.id}
                      onClick={() => openAppWindow(item.windowId)}
                      className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#141926] border border-white/10 hover:border-amber-400/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20 cursor-pointer shrink-0 select-none flex flex-col justify-end ${
                        isLandscape
                          ? 'w-[280px] sm:w-[360px] aspect-[16/9]'
                          : 'w-[160px] sm:w-[210px] md:w-[230px] aspect-[2/3]'
                      }`}
                    >
                      {/* Poster Cover Image */}
                      <img
                        src={item.posterImage}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />

                      {/* Dark Vignette Overlay for Crisp Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                      {/* Top Badges (e.g. HER DERS, CANLI, MEB, 4K) */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                        {item.badge ? (
                          <span
                            className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg ${
                              item.badgeColor || 'bg-emerald-500 text-white'
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : (
                          <span />
                        )}

                        {item.tagInfo && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-black/75 text-gray-200 border border-white/20 backdrop-blur-xs">
                            {item.tagInfo}
                          </span>
                        )}
                      </div>

                      {/* Play / Open Hover Overlay Icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-xl shadow-black/60 transform scale-75 group-hover:scale-100 transition-transform">
                          <Play size={20} fill="currentColor" className="ml-0.5" />
                        </div>
                      </div>

                      {/* Bottom Info: Title & Subtitle */}
                      <div className="relative z-10 p-3 sm:p-4 space-y-0.5">
                        <h3 className="font-black text-sm sm:text-base text-white tracking-tight leading-snug drop-shadow-md group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-300 line-clamp-1 drop-shadow-xs font-medium">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. OS APPLICATION WINDOW POPUP (MODAL WINDOW)                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeWindowAppId && activeApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`bg-white dark:bg-[#15101E] text-gray-900 dark:text-white rounded-[28px] sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden transition-all duration-300 ${
                isWindowMaximized
                  ? 'w-full h-full rounded-none'
                  : 'w-full max-w-5xl h-[88vh] max-h-[900px]'
              }`}
            >
              {/* Window Header Titlebar (Mac / OS Style) */}
              <div className="h-14 px-4 sm:px-6 bg-gray-100 dark:bg-[#1C1628] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between select-none shrink-0">
                {/* Left: App Icon & Title */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center shadow-xs shrink-0 font-black">
                    <Tv size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white m-0 leading-tight">
                      {activeApp.title}
                    </h2>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 m-0 hidden sm:block">
                      {activeApp.subtitle} • {activeClassCode} Şubesi
                    </p>
                  </div>
                </div>

                {/* Right: Window Controls & Giant Close Button */}
                <div className="flex items-center gap-2">
                  {/* Maximize Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsWindowMaximized((v) => !v)}
                    className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors cursor-pointer hidden sm:flex"
                    title={isWindowMaximized ? 'Küçült' : 'Tam Ekran'}
                  >
                    {isWindowMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>

                  {/* Giant Red Close Button */}
                  <button
                    type="button"
                    onClick={closeAppWindow}
                    className="h-9 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                    title="Pencereyi Kapat ve Masaüstüne Dön"
                  >
                    <X size={15} strokeWidth={2.5} />
                    <span>Kapat</span>
                  </button>
                </div>
              </div>

              {/* Window Body: Actual Interactive View */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FCF9FD] dark:bg-[#17101C]">
                {activeWindowAppId === 'attendance' && <TeacherAttendanceView />}
                {activeWindowAppId === 'schedule' && <TeacherScheduleView />}
                {activeWindowAppId === 'classes' && <TeacherClassesView />}
                {activeWindowAppId === 'assessments' && <TeacherAssessmentsView />}
                {activeWindowAppId === 'agenda' && <TeacherAgendaView />}
                {activeWindowAppId === 'files' && <TeacherFilesView />}
                {activeWindowAppId === 'courses' && <TeacherCoursesManagementView />}
                {activeWindowAppId === 'reports' && <TeacherReportsView />}
                {activeWindowAppId === 'progress' && <TeacherProgressView />}
                {activeWindowAppId === 'assignments' && <MHomeworkClient hideDock hideHeader />}
                {activeWindowAppId === 'settings' && <MProfileClient hideDock hideHeader />}
                {activeWindowAppId === 'academicCalendar' && <TeacherScheduleView />}
                {activeWindowAppId === 'smartboard' && (
                  <div className="max-w-2xl mx-auto space-y-6 py-6 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/30">
                      <Tv size={32} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white">
                        Akıllı Tahta & Canlı Pano Kontrolü
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Seçili sınıf: <strong>{activeClassCode} Şubesi</strong>. Aşağıdaki butonlarla doğrudan tahtaya dosya gönderebilir veya canlı tahta ekranını başlatabilirsiniz.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          closeAppWindow()
                          setIsSmartboardModalOpen(true)
                        }}
                        className="h-11 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                      >
                        <Upload size={16} />
                        <span>Tahtaya Dosya / Sınav Gönder</span>
                      </button>
                      <Link
                        href={`/pano/${boardId}/tahta`}
                        target="_blank"
                        className="h-11 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-2"
                      >
                        <ExternalLink size={15} />
                        <span>Tahtayı Yeni Sekmede Başlat</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. CLASSROOM SELECTOR MODAL                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isClassPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#141926] text-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-white/10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-black flex items-center gap-2">
                  <School size={18} className="text-amber-400" />
                  <span>Aktif Çalışma Sınıfı Seçin</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsClassPickerOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="max-h-[340px] overflow-y-auto space-y-2 mt-4 pr-1">
                {ALL_CLASSROOMS.slice(0, 16).map((cls) => {
                  const isSelected = cls.code === activeClassCode
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => handleSelectClass(cls)}
                      className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-extrabold shadow-sm'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${
                            isSelected ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-300'
                          }`}
                        >
                          {cls.code}
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-extrabold">{cls.name || `${cls.code} Sınıfı`}</div>
                          <div className="text-[10px] text-gray-400">{cls.grade_level}. Sınıf Seviyesi</div>
                        </div>
                      </div>
                      {isSelected && <Check size={16} className="text-amber-400" />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. SMARTBOARD "TAHTAYA GÖNDER" MODAL                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSmartboardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-lg bg-[#141926] text-white rounded-3xl p-5 sm:p-6 border border-white/15 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Tv size={20} className="text-emerald-400" />
                  <h3 className="text-base font-black m-0">Akıllı Tahtaya Gönder</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSmartboardModalOpen(false)
                    setSmartboardStep('main')
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Step 1: Main Menu Options */}
              {smartboardStep === 'main' && (
                <div className="space-y-4">
                  {/* Board selector */}
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1.5">
                      Hedef Akıllı Tahta No
                    </label>
                    <select
                      value={boardId}
                      onChange={(e) => setBoardId(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm font-bold"
                    >
                      <option value="1A">1-A Sınıfı Akıllı Tahtası</option>
                      <option value="1B">1-B Sınıfı Akıllı Tahtası</option>
                      <option value="2A">2-A Sınıfı Akıllı Tahtası</option>
                      <option value="9A">9-A Sınıfı Akıllı Tahtası</option>
                    </select>
                  </div>

                  {/* 2 Options: Sınav Gönder or Dosya Gönder */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSmartboardStep('file')}
                      className="p-5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border-2 border-cyan-500/40 text-left transition-all cursor-pointer group space-y-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-cyan-500 text-black flex items-center justify-center shadow-md">
                        <Upload size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-cyan-300 group-hover:underline">
                          Tahtaya Görsel / Dosya
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          Cihazınızdan görsel seçip doğrudan seçili tahtada açın.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSmartboardStep('exam')}
                      className="p-5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border-2 border-rose-500/40 text-left transition-all cursor-pointer group space-y-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                        <Award size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-rose-300 group-hover:underline">
                          Pano Sınavı Gönder
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          İnteraktif sorular hazırlayıp tahtaya canlı sınav olarak yansıtın.
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: File Upload to Smartboard */}
              {smartboardStep === 'file' && (
                <div className="space-y-4">
                  <div className="text-xs text-gray-300">
                    Hedef Tahta: <strong>{boardId}</strong>
                  </div>

                  {/* Drop zone */}
                  <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center hover:border-cyan-400 transition-colors">
                    {filePreview ? (
                      <div className="space-y-3">
                        <img
                          src={filePreview}
                          alt="Seçilen görsel"
                          className="max-h-48 mx-auto rounded-xl object-contain border border-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null)
                            setFilePreview(null)
                          }}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Farklı Görsel Seç
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block space-y-2">
                        <Upload size={32} className="mx-auto text-cyan-400" />
                        <div className="text-xs font-bold text-gray-200">
                          Görseli buraya sürükleyin veya dosya seçin
                        </div>
                        <div className="text-[10px] text-gray-400">PNG, JPG, WebP formatları</div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUploadChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSmartboardStep('main')}
                      className="h-10 px-4 rounded-xl bg-white/10 text-xs font-bold text-gray-300"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      onClick={handleSendFileToBoard}
                      className="h-10 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black shadow-lg"
                    >
                      Tahtaya Gönder
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Exam Maker to Smartboard */}
              {smartboardStep === 'exam' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Sınav Başlığı
                    </label>
                    <input
                      type="text"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      placeholder="Örn: 9-A Edebiyat Şiir Bilgisi Quiz 1"
                      className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-bold"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <div className="text-xs font-black text-rose-300">Örnek Soru 1:</div>
                    <div className="text-xs text-gray-200">{questions[0].text}</div>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {questions[0].options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg text-[11px] font-bold ${
                            oIdx === questions[0].correctAnswer
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-white/5 text-gray-400'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}) {opt}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSmartboardStep('main')}
                      className="h-10 px-4 rounded-xl bg-white/10 text-xs font-bold text-gray-300"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      onClick={handleSendExamToBoard}
                      className="h-10 px-6 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black shadow-lg"
                    >
                      Panoya Sınavı Gönder
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. BOTTOM DOCK (iPadOS / Image 1 Glassy Dock)                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-lg pointer-events-none">
        <div className="pointer-events-auto bg-[#141926]/90 backdrop-blur-2xl border border-white/15 rounded-full px-4 py-2 flex items-center justify-between gap-2 shadow-2xl">
          {/* All Apps / Categories */}
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`h-10 px-4 rounded-full font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#F5A623] text-black shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Grid size={15} />
            <span>Tümü</span>
          </button>

          {/* Quick Pinned Poster Apps */}
          <div className="flex items-center gap-1">
            {[
              { id: 'attendance', title: 'Yoklama', icon: CheckSquare },
              { id: 'smartboard', title: 'Tahta', icon: Tv },
              { id: 'schedule', title: 'Program', icon: Calendar },
              { id: 'assessments', title: 'Sınav', icon: Award },
              { id: 'courses', title: 'Kitaplar', icon: BookOpenCheck },
            ].map((d) => {
              const Icon = d.icon
              const isOpen = activeWindowAppId === d.id

              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => openAppWindow(d.id)}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 ${
                    isOpen ? 'bg-[#F5A623] text-black font-black shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title={d.title}
                >
                  <Icon size={17} />
                  {isOpen && (
                    <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Exit / Return */}
          <button
            type="button"
            onClick={handleExitOS}
            className="h-10 px-3.5 rounded-full bg-white/10 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            title="OS'ten Çık"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </footer>
    </div>
  )
}
