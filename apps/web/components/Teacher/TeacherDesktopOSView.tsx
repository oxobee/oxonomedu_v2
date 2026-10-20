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
  Volume2,
  VolumeX,
  Wifi,
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
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ALL_CLASSROOMS } from '@services/demo/schoolDirectory'
import { signOut } from '@components/Contexts/AuthContext'

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
import TeacherCommunicationView from './views/TeacherCommunicationView'
import MHomeworkClient from '@components/Mobile/MHomeworkClient'
import MProfileClient from '@components/Mobile/MProfileClient'

// ── TYPES ──
export interface DesktopApp {
  id: string
  title: string
  subtitle: string
  badge?: string
  badgeColor?: string
  category: 'core' | 'teaching' | 'tools' | 'system'
  icon: any
  gradient: string
  textColor: string
  path: string
  quickAction?: string
}

// ── 13 CORE TEACHER APPS ──
export const TEACHER_DESKTOP_APPS: DesktopApp[] = [
  {
    id: 'attendance',
    title: 'Yoklama Al',
    subtitle: 'Sınıf e-Yoklama Girişi',
    badge: 'Her Ders',
    badgeColor: 'bg-emerald-500 text-white',
    category: 'core',
    icon: CheckSquare,
    gradient: 'from-emerald-500 to-teal-600',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    path: '/teacher/attendance',
    quickAction: 'e-Yoklama Aç',
  },
  {
    id: 'smartboard',
    title: 'Akıllı Tahta',
    subtitle: 'Tahtaya Gönder & Pano',
    badge: 'Canlı Pano',
    badgeColor: 'bg-cyan-500 text-white',
    category: 'core',
    icon: Tv,
    gradient: 'from-cyan-500 to-blue-600',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    path: '/teacher/live-class',
    quickAction: 'Tahtaya Yansıt',
  },
  {
    id: 'schedule',
    title: 'Ders Programı',
    subtitle: 'Haftalık & Günlük Saatler',
    badge: 'Bugün 6 Ders',
    badgeColor: 'bg-indigo-500 text-white',
    category: 'core',
    icon: Calendar,
    gradient: 'from-indigo-500 to-purple-600',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    path: '/teacher/schedule',
  },
  {
    id: 'assignments',
    title: 'Ödevler & Takip',
    subtitle: 'Ödev Gönder & İncele',
    badge: 'Ödev Ver',
    badgeColor: 'bg-amber-500 text-white',
    category: 'teaching',
    icon: BookOpen,
    gradient: 'from-amber-500 to-orange-600',
    textColor: 'text-amber-600 dark:text-amber-400',
    path: '/teacher/assignments',
  },
  {
    id: 'assessments',
    title: 'Sınav & Quiz',
    subtitle: 'Soru Bankası & Yazılılar',
    badge: 'Yazılı Takvimi',
    badgeColor: 'bg-rose-500 text-white',
    category: 'teaching',
    icon: Award,
    gradient: 'from-rose-500 to-red-600',
    textColor: 'text-rose-600 dark:text-rose-400',
    path: '/teacher/assessments',
  },
  {
    id: 'agenda',
    title: 'Ajanda & Notlar',
    subtitle: 'Ders Notu & Zümre Takvimi',
    badge: 'Planlarım',
    badgeColor: 'bg-purple-500 text-white',
    category: 'teaching',
    icon: CalendarDays,
    gradient: 'from-purple-500 to-fuchsia-600',
    textColor: 'text-purple-600 dark:text-purple-400',
    path: '/teacher/agenda',
  },
  {
    id: 'classes',
    title: 'Sınıf & Öğrenciler',
    subtitle: 'Öğrenci Listesi & Veli İletişimi',
    badge: 'Rehberlik',
    badgeColor: 'bg-teal-500 text-white',
    category: 'core',
    icon: Users,
    gradient: 'from-teal-500 to-emerald-600',
    textColor: 'text-teal-600 dark:text-teal-400',
    path: '/teacher/classes',
  },
  {
    id: 'files',
    title: 'Dosyalar & Materyal',
    subtitle: 'Tahta Çıktıları & PDF Arşivi',
    badge: 'Kütüphane',
    badgeColor: 'bg-sky-500 text-white',
    category: 'tools',
    icon: FolderOpen,
    gradient: 'from-sky-500 to-blue-600',
    textColor: 'text-sky-600 dark:text-sky-400',
    path: '/teacher/files',
  },
  {
    id: 'courses',
    title: 'Ders Kitapları',
    subtitle: 'MEB Müfredat Kitapları',
    badge: 'E-Kitap',
    badgeColor: 'bg-emerald-600 text-white',
    category: 'teaching',
    icon: BookOpenCheck,
    gradient: 'from-emerald-600 to-green-700',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    path: '/teacher/courses',
  },
  {
    id: 'reports',
    title: 'Başarı & Raporlar',
    subtitle: 'Sınıf Ortalamaları & Grafikler',
    badge: 'Grafik',
    badgeColor: 'bg-violet-500 text-white',
    category: 'tools',
    icon: BarChart3,
    gradient: 'from-violet-600 to-purple-700',
    textColor: 'text-violet-600 dark:text-violet-400',
    path: '/teacher/reports',
  },
  {
    id: 'progress',
    title: 'Öğrenci Gelişimi',
    subtitle: 'Akademik İlerleme & Takip',
    badge: 'Gelişim',
    badgeColor: 'bg-amber-600 text-white',
    category: 'tools',
    icon: TrendingUp,
    gradient: 'from-amber-600 to-yellow-600',
    textColor: 'text-amber-700 dark:text-amber-300',
    path: '/teacher/student-progress',
  },
  {
    id: 'academicCalendar',
    title: 'Akademik Takvim',
    subtitle: 'MEB Çalışma ve Tatil Takvimi',
    badge: '2026-2027',
    badgeColor: 'bg-blue-600 text-white',
    category: 'system',
    icon: Calendar,
    gradient: 'from-blue-600 to-indigo-700',
    textColor: 'text-blue-600 dark:text-blue-400',
    path: '/teacher/academic-calendar',
  },
  {
    id: 'settings',
    title: 'Profil & Ayarlar',
    subtitle: 'Öğretmen Bilgileri & Şifre',
    badge: 'Ayarlar',
    badgeColor: 'bg-gray-500 text-white',
    category: 'system',
    icon: Settings,
    gradient: 'from-gray-600 to-slate-800',
    textColor: 'text-gray-700 dark:text-gray-300',
    path: '/teacher/settings',
  },
]

// ── WALLPAPER THEMES ──
const WALLPAPERS = [
  {
    id: 'ventura',
    name: 'Ventura Günbatımı',
    bg: 'bg-gradient-to-tr from-[#240B36] via-[#C31432]/40 to-[#4B075F]',
    surface: 'bg-[#181124]/75',
    accent: '#D914C8',
  },
  {
    id: 'sequoia',
    name: 'Gece Dağları',
    bg: 'bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#3A506B]',
    surface: 'bg-[#0E1626]/80',
    accent: '#38BDF8',
  },
  {
    id: 'emerald',
    name: 'Sakin Zümrüt',
    bg: 'bg-gradient-to-br from-[#064E3B] via-[#0F172A] to-[#022C22]',
    surface: 'bg-[#0B1A16]/80',
    accent: '#34D399',
  },
  {
    id: 'classroom-light',
    name: 'Aydınlık Eğitim',
    bg: 'bg-gradient-to-br from-[#E0E7FF] via-[#F1F5F9] to-[#F8FAFC]',
    surface: 'bg-white/90',
    accent: '#4F46E5',
    isLight: true,
  },
]

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
    return ALL_CLASSROOMS[0]?.code || '1/A'
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
          if (p.branch) setTeacherBranch(p.branch.split('·')[0].trim())
        }
      } catch (_) {}

      const handleClassChange = (e: any) => {
        if (e.detail?.code) {
          setActiveClassCode(e.detail.code)
        }
      }
      window.addEventListener('oxonom_class_changed', handleClassChange)
      return () => window.removeEventListener('oxonom_class_changed', handleClassChange)
    }
  }, [])

  // ── 2. DRAGGABLE ICON POSITIONS WITH LOCALSTORAGE PERSISTENCE ──
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [isLoadedPositions, setIsLoadedPositions] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oxonom_teacher_desktop_positions_v1')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && typeof parsed === 'object') {
            setIconPositions(parsed)
          }
        }
      } catch (_) {}
      setIsLoadedPositions(true)
    }
  }, [])

  const handleDragEnd = (appId: string, info: any) => {
    setIconPositions((prev) => {
      const current = prev[appId] || { x: 0, y: 0 }
      const updated = {
        ...prev,
        [appId]: {
          x: Math.round(current.x + info.offset.x),
          y: Math.round(current.y + info.offset.y),
        },
      }
      try {
        localStorage.setItem('oxonom_teacher_desktop_positions_v1', JSON.stringify(updated))
      } catch (_) {}
      return updated
    })
  }

  const handleResetPositions = () => {
    setIconPositions({})
    try {
      localStorage.removeItem('oxonom_teacher_desktop_positions_v1')
      toast.success('İkonlar varsayılan ızgaraya hizalandı! 📐', { icon: '✨' })
    } catch (_) {}
  }

  // ── 3. SENIOR ACCESSIBILITY (YAŞLI DOSTU BÜYÜK YAZI / İKON) ──
  const [isSeniorMode, setIsSeniorMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oxonom_teacher_senior_mode') === 'true'
    }
    return true // Default ON for friendly experience
  })

  const toggleSeniorMode = () => {
    const next = !isSeniorMode
    setIsSeniorMode(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_teacher_senior_mode', String(next))
      toast.success(next ? 'Büyük Yazı & İkon Modu Aktif Edildi 🔍' : 'Standart Boyuta Geçildi', {
        duration: 2000,
      })
    }
  }

  // ── 4. WALLPAPER SELECTION ──
  const [wallpaperId, setWallpaperId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oxonom_teacher_wallpaper') || 'ventura'
    }
    return 'ventura'
  })

  const activeWallpaper = useMemo(() => {
    return WALLPAPERS.find((w) => w.id === wallpaperId) || WALLPAPERS[0]
  }, [wallpaperId])

  const selectWallpaper = (id: string) => {
    setWallpaperId(id)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_teacher_wallpaper', id)
      toast.success('Masaüstü duvar kağıdı güncellendi! 🎨', { duration: 1500 })
    }
  }

  // ── 5. LIVE CLOCK (GERÇEK DİJİTAL SAAT) ──
  const [timeStr, setTimeStr] = useState('')
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(
        now.toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
      setDateStr(
        now.toLocaleDateString('tr-TR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // ── 6. POST-IT / MASAÜSTÜ NOT DEFTERİ (Auto-Save) ──
  const [stickyNote, setStickyNote] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('oxonom_teacher_sticky_note') ||
        '📌 GÜNLÜK HATIRLATMA:\n• 1/A Sınıfı şiir tahlili çalışma formları dağıtılacak.\n• 3. Ders akıllı tahtada kavram haritası açılacak.\n• Zümre toplantısı Cuma günü saat 15:30.'
      )
    }
    return '📌 GÜNLÜK HATIRLATMA...'
  })

  const handleStickyNoteChange = (val: string) => {
    setStickyNote(val)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_teacher_sticky_note', val)
    }
  }

  // ── 7. ACTIVE OS WINDOW MANAGEMENT ──
  const [activeWindowAppId, setActiveWindowAppId] = useState<string | null>(null)
  const [isWindowMaximized, setIsWindowMaximized] = useState<boolean>(false)
  const [startMenuOpen, setStartMenuOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isWallpaperPickerOpen, setIsWallpaperPickerOpen] = useState<boolean>(false)
  const [isClassPickerOpen, setIsClassPickerOpen] = useState<boolean>(false)

  // Smartboard Dispatch Modal State
  const [isSmartboardModalOpen, setIsSmartboardModalOpen] = useState<boolean>(false)
  const [smartboardTarget, setSmartboardTarget] = useState<string>(() => `PANO-${activeClassCode.replace(/[\/\s]/g, '')}`)

  const activeApp = useMemo(() => {
    return TEACHER_DESKTOP_APPS.find((a) => a.id === activeWindowAppId) || null
  }, [activeWindowAppId])

  const openAppWindow = (appId: string) => {
    if (appId === 'smartboard') {
      setIsSmartboardModalOpen(true)
      setStartMenuOpen(false)
      return
    }
    setActiveWindowAppId(appId)
    setIsWindowMaximized(false)
    setStartMenuOpen(false)
  }

  const closeAppWindow = () => {
    setActiveWindowAppId(null)
    setIsWindowMaximized(false)
  }

  // Filtered Apps for Search
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return TEACHER_DESKTOP_APPS
    const q = searchQuery.toLowerCase().trim()
    return TEACHER_DESKTOP_APPS.filter(
      (a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
    )
  }, [searchQuery])

  // Change Active Classroom
  const handleSelectClass = (cls: { code: string; name: string }) => {
    setActiveClassCode(cls.code)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_selected_class', JSON.stringify(cls))
        window.dispatchEvent(new CustomEvent('oxonom_class_changed', { detail: cls }))
        toast.success(`Aktif sınıf ${cls.code} olarak seçildi! 🏫`, { icon: '✅' })
      } catch (_) {}
    }
    setIsClassPickerOpen(false)
  }

  return (
    <div
      className={`min-h-screen w-full relative overflow-hidden select-none font-jakarta flex flex-col justify-between transition-colors duration-500 ${activeWallpaper.bg} ${
        activeWallpaper.isLight ? 'text-gray-900' : 'text-white'
      }`}
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 80%)',
      }}
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP OS MENU BAR (Apple / macOS / Chromebook Style)         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header
        className={`h-12 w-full px-4 sm:px-6 flex items-center justify-between border-b backdrop-blur-xl z-30 transition-all ${
          activeWallpaper.isLight
            ? 'bg-white/80 border-black/10 text-gray-900 shadow-xs'
            : 'bg-black/40 border-white/10 text-white shadow-md'
        }`}
      >
        {/* Left: Brand, Teacher & Active Class Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* OS Apple/Oxonom Logo */}
          <button
            type="button"
            onClick={() => setStartMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all cursor-pointer font-black text-xs"
            title="Öğretmen Başlat Menüsü"
          >
            <span className="w-5 h-5 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-[11px] shadow-xs">
              OX
            </span>
            <span className="hidden sm:inline font-extrabold tracking-tight">Öğretmen OS</span>
          </button>

          {/* Teacher Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/15 dark:bg-white/10 text-xs font-bold">
            <span>👩‍🏫</span>
            <span className="truncate max-w-[140px]">{teacherName}</span>
          </div>

          {/* Active Class Selector Button */}
          <button
            type="button"
            onClick={() => setIsClassPickerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 font-extrabold text-xs cursor-pointer transition-all active:scale-95"
            title="Sınıfı Değiştir"
          >
            <School size={14} className="text-emerald-400" />
            <span>{activeClassCode} Şubesi</span>
            <span className="text-[10px] opacity-75">▼</span>
          </button>
        </div>

        {/* Center: Real Large Digital Clock */}
        <div className="flex items-center gap-2 text-center">
          <div className="font-mono text-xs sm:text-sm font-extrabold tracking-wider bg-black/20 dark:bg-white/10 px-3 py-1 rounded-xl backdrop-blur-md">
            <span>{timeStr || '10:20:00'}</span>
            <span className="hidden lg:inline text-[11px] font-sans font-medium opacity-75 ml-2">
              • {dateStr}
            </span>
          </div>
        </div>

        {/* Right: Quick Controls (Senior Mode, Wallpaper, Tahtaya Gönder, Exit) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Senior Accessibility Mode Toggle */}
          <button
            type="button"
            onClick={toggleSeniorMode}
            className={`h-8 px-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isSeniorMode
                ? 'bg-amber-500 text-white shadow-md shadow-amber-950/20'
                : 'bg-white/10 hover:bg-white/20 text-white/90'
            }`}
            title="Yaşlı Dostu Büyük Yazı ve İkon Modunu Aç / Kapat"
          >
            <Type size={14} />
            <span className="hidden sm:inline">
              {isSeniorMode ? 'Büyük Boyut (%125)' : 'Standart Boyut'}
            </span>
          </button>

          {/* Snap to Grid / Reset Button */}
          <button
            type="button"
            onClick={handleResetPositions}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
            title="İkonları Izgaraya Hizala"
          >
            <RotateCcw size={14} />
          </button>

          {/* Wallpaper Picker */}
          <button
            type="button"
            onClick={() => setIsWallpaperPickerOpen((v) => !v)}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
            title="Duvar Kâğıdını Değiştir"
          >
            <Palette size={14} />
          </button>

          {/* Quick Smartboard Launch Button */}
          <button
            type="button"
            onClick={() => setIsSmartboardModalOpen(true)}
            className="h-8 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/30 cursor-pointer transition-all active:scale-95 animate-pulse"
            title="Akıllı Tahtaya Dosya veya Sınav Gönder"
          >
            <Tv size={14} />
            <span className="hidden sm:inline">Tahtaya Gönder</span>
          </button>

          {/* Safe Signout */}
          <button
            type="button"
            onClick={async () => {
              if (confirm('Öğretmen oturumunu kapatmak istediğinize emin misiniz?')) {
                await signOut()
                window.location.href = '/loginv2'
              }
            }}
            className="w-8 h-8 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 flex items-center justify-center transition-all cursor-pointer"
            title="Güvenli Çıkış"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN DESKTOP CANVAS WORKSPACE (SÜRÜKLE - BIRAK ALANI)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 relative overflow-hidden flex flex-col justify-between">
        {/* Desktop Top Area: Big Friendly Greeting & Widgets */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-6 z-10 pointer-events-none">
          {/* Greeting Banner */}
          <div className="pointer-events-auto bg-black/30 dark:bg-black/50 backdrop-blur-xl border border-white/15 p-4 sm:p-5 rounded-3xl max-w-lg shadow-xl text-white">
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400 mb-1 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>GÜNLÜK ÖĞRETMEN ÇALIŞMA MASASI</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
              Merhaba, {teacherName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 mt-1 leading-relaxed">
              İkonları dilediğiniz gibi sürükleyip yerleştirebilirsiniz. Herhangi bir menüye tıklayarak doğrudan kullanmaya başlayın.
            </p>
          </div>

          {/* Right Desktop Widgets: Next Class & Sticky Note */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto pointer-events-auto">
            {/* Widget 1: Next Lesson Card */}
            <div className="p-4 rounded-3xl bg-black/35 backdrop-blur-xl border border-white/15 text-white flex-1 min-w-[260px] shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300 pb-2 border-b border-white/10">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Clock size={14} />
                  <span>Sıradaki Ders</span>
                </span>
                <span className="font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md text-[11px]">
                  10:20 - 11:00
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-sm font-black text-white">{teacherBranch}</div>
                <div className="text-xs text-gray-300 mt-0.5 font-bold">
                  {activeClassCode} Şubesi • Derslik {activeClassCode}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => openAppWindow('attendance')}
                  className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-xs text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  <CheckSquare size={13} />
                  <span>Yoklama</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSmartboardModalOpen(true)}
                  className="h-9 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-extrabold text-xs text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  <Tv size={13} />
                  <span>Tahtaya Aç</span>
                </button>
              </div>
            </div>

            {/* Widget 2: Yellow Sticky Note (Masaüstü Post-it) */}
            <div className="p-3.5 rounded-3xl bg-amber-100 text-amber-950 border-2 border-amber-300 shadow-xl flex-1 min-w-[260px] max-w-sm flex flex-col justify-between rotate-1 hover:rotate-0 transition-transform">
              <div className="flex items-center justify-between pb-1 border-b border-amber-300/60 text-xs font-extrabold text-amber-900">
                <span className="flex items-center gap-1">
                  <Pin size={13} className="text-amber-700" />
                  <span>Öğretmen Not Defteri</span>
                </span>
                <span className="text-[10px] text-amber-700 font-bold">Otomatik Kayıt</span>
              </div>
              <textarea
                value={stickyNote}
                onChange={(e) => handleStickyNoteChange(e.target.value)}
                rows={3}
                placeholder="Buraya hatırlatıcı veya yapacaklarınızı yazabilirsiniz..."
                className="w-full bg-transparent border-none outline-hidden text-xs sm:text-[13px] font-bold text-amber-950 resize-none mt-2 placeholder:text-amber-800/50 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* ── DRAGGABLE ICONS GRID ── */}
        <div className="flex-1 w-full relative min-h-[360px] z-10">
          <div
            className={`grid gap-4 sm:gap-6 justify-start ${
              isSeniorMode
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7'
                : 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8'
            }`}
          >
            {TEACHER_DESKTOP_APPS.map((app, index) => {
              const Icon = app.icon
              const pos = iconPositions[app.id] || { x: 0, y: 0 }

              return (
                <motion.div
                  key={app.id}
                  drag
                  dragMomentum={false}
                  dragElastic={0.15}
                  onDragEnd={(e, info) => handleDragEnd(app.id, info)}
                  animate={{ x: pos.x, y: pos.y }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="flex flex-col items-center text-center cursor-grab active:cursor-grabbing group select-none relative"
                  style={{ touchAction: 'none' }}
                >
                  {/* Outer Clickable Area */}
                  <div
                    onClick={() => openAppWindow(app.id)}
                    className="flex flex-col items-center gap-2 p-2 rounded-3xl hover:bg-white/15 active:scale-95 transition-all group-hover:scale-105"
                  >
                    {/* Big App Icon Squircle */}
                    <div
                      className={`relative rounded-[26px] bg-gradient-to-br ${app.gradient} flex items-center justify-center text-white shadow-xl shadow-black/30 group-hover:shadow-2xl transition-all border-2 border-white/30 ${
                        isSeniorMode ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-16 h-16 sm:w-20 sm:h-20'
                      }`}
                    >
                      <Icon
                        size={isSeniorMode ? 40 : 32}
                        strokeWidth={2.4}
                        className="drop-shadow-md group-hover:scale-110 transition-transform"
                      />

                      {/* Notification Badge if any */}
                      {app.badge && (
                        <span
                          className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black shadow-md border border-white/40 ${app.badgeColor}`}
                        >
                          {app.badge}
                        </span>
                      )}
                    </div>

                    {/* App Title & Subtitle */}
                    <div className="flex flex-col items-center max-w-[120px]">
                      <span
                        className={`font-black text-center leading-tight drop-shadow-md transition-colors ${
                          activeWallpaper.isLight ? 'text-gray-900' : 'text-white'
                        } ${isSeniorMode ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}
                      >
                        {app.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold line-clamp-1 opacity-80 mt-0.5 ${
                          activeWallpaper.isLight ? 'text-gray-700' : 'text-gray-200'
                        }`}
                      >
                        {app.subtitle}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. BOTTOM OS TASKBAR & DOCK (iPadOS / macOS Dock Style)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="w-full pb-3 px-4 z-20 flex justify-center pointer-events-none">
        <div className="pointer-events-auto max-w-2xl w-full bg-black/60 dark:bg-black/75 backdrop-blur-2xl border border-white/20 rounded-full px-4 py-2 flex items-center justify-between gap-2 shadow-2xl">
          {/* Start Button */}
          <button
            type="button"
            onClick={() => setStartMenuOpen((v) => !v)}
            className={`h-11 px-4 rounded-full font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
              startMenuOpen
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            <Grid size={16} />
            <span className="hidden sm:inline">Uygulamalar</span>
          </button>

          {/* Center: Pinned Dock Apps (Most Frequent) */}
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'attendance', title: 'Yoklama', icon: CheckSquare, color: 'bg-emerald-500' },
              { id: 'smartboard', title: 'Tahta', icon: Tv, color: 'bg-cyan-500' },
              { id: 'schedule', title: 'Program', icon: Calendar, color: 'bg-indigo-500' },
              { id: 'assignments', title: 'Ödevler', icon: BookOpen, color: 'bg-amber-500' },
              { id: 'files', title: 'Dosyalar', icon: FolderOpen, color: 'bg-sky-500' },
            ].map((dockItem) => {
              const Icon = dockItem.icon
              const isOpen = activeWindowAppId === dockItem.id

              return (
                <button
                  key={dockItem.id}
                  type="button"
                  onClick={() => openAppWindow(dockItem.id)}
                  className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer hover:scale-115 active:scale-95 ${
                    isOpen ? `${dockItem.color} text-white shadow-lg` : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title={dockItem.title}
                >
                  <Icon size={19} strokeWidth={2.4} />
                  {isOpen && (
                    <span className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-1.5">
            {/* Show Desktop / Minimize Windows */}
            <button
              type="button"
              onClick={closeAppWindow}
              className="h-10 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer hidden sm:flex items-center gap-1"
              title="Açık Pencereleri Kapatıp Masaüstünü Göster"
            >
              <span>Masaüstü</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. OS APPLICATION WINDOW POPUP (MODAL WINDOW)                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeWindowAppId && activeApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`bg-white dark:bg-[#15101E] text-gray-900 dark:text-white rounded-[28px] sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden transition-all duration-300 ${
                isWindowMaximized
                  ? 'fixed inset-2 sm:inset-4 w-auto h-auto'
                  : 'w-full max-w-6xl max-h-[92vh] h-[85vh]'
              }`}
            >
              {/* Window Title Bar (Mac Traffic Lights & Large Controls) */}
              <div className="h-14 px-4 sm:px-6 bg-gray-100 dark:bg-[#20172D] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0 select-none">
                {/* Left: Window Title with App Icon */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${activeApp.gradient} text-white flex items-center justify-center shadow-xs shrink-0`}
                  >
                    <activeApp.icon size={18} strokeWidth={2.4} />
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

                {/* Right: Window Traffic Lights & Giant Close Button */}
                <div className="flex items-center gap-2">
                  {/* Open in full page link */}
                  <Link
                    href={activeApp.path}
                    className="h-9 px-3 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Tam Web Sayfasında Aç"
                  >
                    <ExternalLink size={13} />
                    <span className="hidden sm:inline">Tam Sayfada Aç</span>
                  </Link>

                  {/* Maximize Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsWindowMaximized((v) => !v)}
                    className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors cursor-pointer hidden sm:flex"
                    title={isWindowMaximized ? 'Küçült' : 'Tam Ekran'}
                  >
                    {isWindowMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>

                  {/* Giant Red Close Button (Yaşlı Dostu Dev Kapat Butonu) */}
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. START MENU / LAUNCHPAD DRAWER (Tüm Uygulamalar)           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {startMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-2xl bg-white dark:bg-[#1A1224] rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col max-h-[85vh] text-gray-900 dark:text-white"
            >
              {/* Header with Search */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 gap-3">
                <div className="flex items-center gap-2">
                  <Grid size={20} className="text-emerald-500" />
                  <h3 className="text-lg font-black m-0">Tüm Öğretmen Menüleri</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStartMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Big Search Bar */}
              <div className="my-3 relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Menü veya işlem ara (Yoklama, Sınav, Notlar...)"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-100 dark:bg-gray-800 border-none text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* App List Grid */}
              <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-1">
                {filteredApps.map((app) => {
                  const Icon = app.icon
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => openAppWindow(app.id)}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 text-left transition-all cursor-pointer group border border-transparent hover:border-emerald-500/40"
                    >
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${app.gradient} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black truncate">{app.title}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                          {app.subtitle}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. WALLPAPER PICKER MODAL                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isWallpaperPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1A1224] text-gray-900 dark:text-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-base font-black flex items-center gap-2">
                  <Palette size={18} className="text-purple-500" />
                  <span>Masaüstü Duvar Kâğıdı</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsWallpaperPickerOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {WALLPAPERS.map((wp) => (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => {
                      selectWallpaper(wp.id)
                      setIsWallpaperPickerOpen(false)
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                      wallpaperId === wp.id
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'border-gray-200 dark:border-gray-700'
                    } ${wp.bg}`}
                  >
                    <span className="text-xs font-black text-white drop-shadow-md">{wp.name}</span>
                    {wallpaperId === wp.id && (
                      <span className="self-end px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                        Seçili
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 7. CLASSROOM SELECTOR MODAL                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isClassPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1A1224] text-gray-900 dark:text-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-base font-black flex items-center gap-2">
                  <School size={18} className="text-emerald-500" />
                  <span>Aktif Çalışma Sınıfı Seçin</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsClassPickerOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
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
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-300'
                          : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          {cls.code}
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-black">{cls.name}</div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">
                            {cls.teacher_name} • {cls.grade_level}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check size={16} className="text-emerald-600" />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 8. SMARTBOARD DISPATCH MODAL (TAHTAYA GÖNDER / PANO SINAV)   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSmartboardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white dark:bg-[#1A1224] text-gray-900 dark:text-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/15 to-teal-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Tv size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black m-0">Akıllı Tahtaya Gönder</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                      Hedef Tahta: <span className="font-mono font-bold text-emerald-600">{smartboardTarget}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSmartboardModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Tahta ID Girişi */}
                <div>
                  <label className="text-xs font-black text-gray-700 dark:text-gray-300 block mb-1 uppercase tracking-wider">
                    Hedef Tahta Numarası
                  </label>
                  <input
                    type="text"
                    value={smartboardTarget}
                    onChange={(e) => setSmartboardTarget(e.target.value.toUpperCase())}
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 font-mono font-bold text-sm outline-hidden focus:border-emerald-500"
                    placeholder="Örn: PANO-1A veya 1A-01"
                  />
                </div>

                {/* Eylemler */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSmartboardModalOpen(false)
                      openAppWindow('files')
                      toast.success(`Dosyalar ekranı açıldı. Dosyayı seçip "${smartboardTarget}" tahtasına gönderin!`, {
                        icon: '📁',
                      })
                    }}
                    className="p-4 rounded-2xl border-2 border-cyan-500/30 hover:border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-left cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center mb-2">
                        <ImageIcon size={18} />
                      </div>
                      <div className="text-xs font-black text-cyan-900 dark:text-cyan-200">
                        Tahtaya Görsel / Dosya
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Cihazdan veya arşivden seçilen görseli tahtada aç
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSmartboardModalOpen(false)
                      window.open(`/pano/${encodeURIComponent(smartboardTarget)}/tahta`, '_blank')
                      toast.success(`"${smartboardTarget}" Akıllı Tahta ekranı açıldı! 🎨`, { icon: '🚀' })
                    }}
                    className="p-4 rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-left cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2">
                        <Tv size={18} />
                      </div>
                      <div className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        Canlı Tahtayı Başlat
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Akıllı tahtanın canlı ekranını yeni sekmede tam ekran aç
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
