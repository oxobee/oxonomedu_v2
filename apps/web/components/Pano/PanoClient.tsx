'use client'
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { clearAllClientAuthCookies } from '@components/Contexts/AuthContext'
import { useOrg } from '@components/Contexts/OrgContext'
import { getUriWithOrg } from '@services/config/config'
import { getOrgLogoMediaDirectory } from '@services/media/media'
import {
  RotateCw,
  ExternalLink,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2,
  Minus,
  X,
  Lock,
  Unlock,
  KeyRound,
  LayoutDashboard,
  Bell,
  Sparkles,
  School,
  Users,
  Calendar,
  FileText,
  Sliders,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Delete,
  CloudSun,
  Presentation,
  CheckCircle2,
  Sparkle,
  LogOut,
  Smartphone,
  Tv,
  QrCode,
  Radio,
  Wifi,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Dice5,
  Award,
  Zap,
  Calculator,
  Trophy,
  Crown,
  HelpCircle,
  Wrench,
  Compass,
  Image as ImageIcon,
  FileQuestion,
  UploadCloud,
  Power,
} from 'lucide-react'
import QRCode from 'qrcode'
import {
  ALL_CLASSROOMS,
  ALL_CLASSROOM_BOARDS,
  generateClassroomBoards,
  generateClassroomAssignments,
  getSingleSourceOfTruthStudents,
  normalizeClassCode,
  getClassBoardIdentity,
  TEACHER_ROSTER,
} from '@services/demo/schoolDirectory'
import { getAttendanceForClass, getTodayDateString } from '@services/demo/attendanceService'
import { createBoard } from '@services/boards/boards'
import toast from 'react-hot-toast'
import PanoStandbyScreen from './PanoStandbyScreen'
import PanoLockScreen from './PanoLockScreen'
import PanoPairingGate from './PanoPairingGate'
import {
  BoardPairingInfo,
  getActivePairedBoardSession,
  setActivePairedBoardSession,
  disconnectActiveBoard,
  pairBoardWithCode,
  findBoardByPairingCode,
  setBoardLiveStatus,
  BOARD_SYNC_CHANNEL_NAME,
} from '@/lib/pano/boardPairingManager'
import { getTenantClasses } from '@/lib/schools/schoolTenantManager'
import { TeacherPairData } from '@/lib/pano-pair/store'
import { usePanoSync, AppItem, WindowState, ClassroomItem, PanoAction } from '@/hooks/usePanoSync'
import screenfull from 'screenfull'
import { RemoteActionMessage } from '@/lib/remote/protocol'

// Pixel-perfect SVG Icons matching EduOS design
const Icons = {
  Board: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
  ),
  Classes: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Courses: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-5.25 6.557c1.47 0 2.89-.14 4.25-.407" />
    </svg>
  ),
  Homework: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  Playgrounds: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  ),
  Attendance: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  ),
  Games: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  ),
  Tools: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.54 2.54 0 01-3.58 0 2.54 2.54 0 010-3.58l5.653-4.655m5.078-2.652a6.375 6.375 0 00-7.394-7.394c-.468.14-.891.382-1.208.766L3 5.75" />
    </svg>
  ),
  Exam: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l2 2 4-4" />
    </svg>
  ),
  Explore: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-full h-full">
      <circle cx="12" cy="12" r="9" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.2" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  OxonomLogo: () => (
    <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
      <rect width="36" height="36" rx="10" fill="url(#oxonom-grad)" />
      <path d="M10 18C10 13.5817 13.5817 10 18 10C22.4183 10 26 13.5817 26 18C26 22.4183 22.4183 26 18 26C13.5817 26 10 22.4183 10 18Z" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="32 10" />
      <circle cx="18" cy="18" r="4" fill="white" />
      <defs>
        <linearGradient id="oxonom-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4B075F" />
          <stop offset="0.55" stopColor="#8D49A6" />
          <stop offset="1" stopColor="#D914C8" />
        </linearGradient>
      </defs>
    </svg>
  )
}


interface QuoteItem {
  text: string
  author?: string
}

export interface PanoSettings {
  pin: string
  idleTimeout: number // seconds: 0 = never, 30, 60, 120, 300, 600
  unlockType: 'pin' | 'slide'
  quotes: QuoteItem[]
}

const buildPanoClassrooms = (studentList?: any[]): ClassroomItem[] => {
  const students = studentList || (typeof window !== 'undefined' ? getSingleSourceOfTruthStudents(30) : [])
  return ALL_CLASSROOMS.map(c => {
    const norm = normalizeClassCode(c.code || c.name)
    const gradeNum = parseInt(c.grade_level || '', 10) || 1
    const isPrimary = gradeNum <= 4

    const classStudents = students.filter((s: any) => {
      const sNorm = normalizeClassCode(s.className || '')
      return sNorm === norm || sNorm.replace('-', '/') === norm.replace('-', '/')
    })

    const rosterTeacher = TEACHER_ROSTER.find(t => t.name === c.teacher_name)
    const subject = isPrimary ? 'Sınıf Öğretmeni' : (rosterTeacher?.branch || c.subject || 'Branş Öğretmeni')
    const schoolName = isPrimary ? 'Necla Görer İlkokulu' : 'Şair Fevzi Kutlu Kalkancı Ortaokulu'

    let attStr = classStudents.length > 0 ? 'Alınmadı' : '-'
    if (typeof window !== 'undefined') {
      try {
        const att = getAttendanceForClass(c.code || c.name, getTodayDateString())
        if (att && att.taken && att.totalCount > 0) {
          attStr = `%${Math.round((att.presentCount / att.totalCount) * 100)}`
        }
      } catch (_) {}
    }

    return {
      id: c.id,
      name: c.name,
      code: c.code,
      gradeLevel: c.grade_level,
      studentCount: classStudents.length,
      boardCount: c.boards_count || 0,
      attendance: attStr,
      teacherName: c.teacher_name,
      subject,
      schoolName,
    }
  })
}

const INITIAL_CLASSROOMS: ClassroomItem[] = buildPanoClassrooms()
const DEFAULT_CLASSROOMS: ClassroomItem[] = INITIAL_CLASSROOMS

// Groups classrooms by grade level (numeric order) and sorts branches with Turkish collation,
// so 28-31 branches stay readable and "10" never sorts before "9".
const groupClassroomsByGrade = (list: ClassroomItem[]) => {
  const groups = new Map<string, ClassroomItem[]>()
  for (const c of list) {
    const key = c.gradeLevel || 'Diğer'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(c)
  }
  const gradeNum = (g: string) => parseInt(g, 10) || 999
  return Array.from(groups.entries())
    .sort((a, b) => gradeNum(a[0]) - gradeNum(b[0]) || a[0].localeCompare(b[0], 'tr'))
    .map(([grade, items]) => ({
      grade,
      items: [...items].sort((x, y) => x.name.localeCompare(y.name, 'tr', { numeric: true })),
    }))
}

/**
 * 2D Geometric D-Pad / Arrow Key Navigation for Smartboard Remote Controls
 */
function handleGridArrowNav(e: React.KeyboardEvent, itemSelector: string) {
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
  const currentEl = e.currentTarget as HTMLElement
  const container = currentEl.closest('[data-grid-container]') || document
  const items = Array.from(container.querySelectorAll<HTMLElement>(`[data-grid-item="${itemSelector}"]`))
  if (items.length <= 1) return

  const currentIndex = items.indexOf(currentEl)
  if (currentIndex === -1) return

  const currentRect = currentEl.getBoundingClientRect()
  const currentCenter = {
    x: currentRect.left + currentRect.width / 2,
    y: currentRect.top + currentRect.height / 2,
  }

  let bestNext: HTMLElement | null = null
  let bestDist = Infinity

  for (const item of items) {
    if (item === currentEl) continue
    const rect = item.getBoundingClientRect()
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }

    const dx = center.x - currentCenter.x
    const dy = center.y - currentCenter.y

    let isCandidate = false

    if (e.key === 'ArrowRight' && dx > 10 && Math.abs(dy) < rect.height * 0.8) {
      isCandidate = true
    } else if (e.key === 'ArrowLeft' && dx < -10 && Math.abs(dy) < rect.height * 0.8) {
      isCandidate = true
    } else if (e.key === 'ArrowDown' && dy > 10) {
      isCandidate = true
    } else if (e.key === 'ArrowUp' && dy < -10) {
      isCandidate = true
    }

    if (isCandidate) {
      const dist =
        e.key === 'ArrowRight' || e.key === 'ArrowLeft'
          ? Math.abs(dx) + Math.abs(dy) * 2
          : Math.abs(dy) + Math.abs(dx) * 1.5

      if (dist < bestDist) {
        bestDist = dist
        bestNext = item
      }
    }
  }

  // Fallback to sequential wrap-around if no geometric neighbor in that direction
  if (!bestNext) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      bestNext = items[(currentIndex + 1) % items.length]
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      bestNext = items[(currentIndex - 1 + items.length) % items.length]
    }
  }

  if (bestNext) {
    e.preventDefault()
    bestNext.focus()
    bestNext.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
}

const DEFAULT_PANO_QUOTES: QuoteItem[] = [
  { text: "“Hayatta en hakiki mürşit ilimdir, fendir.”", author: "Gazi Mustafa Kemal Atatürk" },
  { text: "“İlim ilim bilmektir, ilim kendin bilmektir. Sen kendin bilmezsin, ya nice okumaktır.”", author: "Yunus Emre" },
  { text: "“Bir mıh bir nalı, bir nal bir atı, bir at bir yiğidi, bir yiğit bir vatanı kurtarır.”", author: "Türk Atasözü" },
  { text: "“Eğitim, dünyayı değiştirmek için kullanabileceğiniz en güçlü silahtır.”", author: "Nelson Mandela" },
  { text: "“Bilgi cesaret verir, cehalet ise cüret.”", author: "Platon" },
  { text: "“Akıl akıldan üstündür; ilim paylaştıkça çoğalan yegane hazinedir.”", author: "Şems-i Tebrizi" },
  { text: "“Bana bir harf öğretenin kırk yıl kölesi olurum.”", author: "Hz. Ali (r.a.)" },
  { text: "“Gözlem yapmadan teoriler üretmek, tuğlasız bina yapmaya benzer.”", author: "Arthur Conan Doyle" }
]

const normalizeQuote = (q: any): QuoteItem => {
  if (typeof q === 'object' && q !== null && 'text' in q) {
    return { text: q.text || '', author: q.author || '' }
  }
  if (typeof q === 'string') {
    if (q.includes(' — ')) {
      const parts = q.split(' — ')
      return { text: parts[0].trim(), author: parts.slice(1).join(' — ').trim() }
    }
    return { text: q.trim(), author: '' }
  }
  return { text: '', author: '' }
}

const DEFAULT_SETTINGS: PanoSettings = {
  pin: '',
  idleTimeout: 300,
  unlockType: 'pin',
  quotes: DEFAULT_PANO_QUOTES
}

// Live Turkish Clock (Characteristic Digital Font without Seconds)
const Clock = ({ detailed = false, className = "" }: { detailed?: boolean; className?: string }) => {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (detailed) {
    const hours = String(time.getHours()).padStart(2, '0')
    const minutes = String(time.getMinutes()).padStart(2, '0')
    const dateFormatted = time.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    const weekday = time.toLocaleDateString('tr-TR', { weekday: 'long' })

    return (
      <div className={`flex flex-col items-center select-none ${className}`}>
        <div className="flex items-center justify-center font-mono tabular-nums tracking-wider drop-shadow-[0_15px_45px_rgba(0,0,0,0.9)]">
          <span className="text-8xl sm:text-9xl md:text-[10.5rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-50 to-slate-400 drop-shadow-[0_0_35px_rgba(141,73,166,0.4)]">
            {hours}
          </span>
          <span className="text-7xl sm:text-8xl md:text-9xl font-extralight text-[#D914C8] mx-3 sm:mx-6 animate-pulse drop-shadow-[0_0_25px_rgba(217,20,200,0.9)]">
            :
          </span>
          <span className="text-8xl sm:text-9xl md:text-[10.5rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-50 to-slate-400 drop-shadow-[0_0_35px_rgba(141,73,166,0.4)]">
            {minutes}
          </span>
        </div>

        <div className="mt-4 px-6 py-2 rounded-full bg-slate-900/70 border border-[#8D49A6]/30 backdrop-blur-2xl text-slate-200 text-sm sm:text-base md:text-lg font-medium tracking-wide shadow-2xl flex items-center gap-2.5 ring-1 ring-white/10">
          <Calendar className="w-4 h-4 text-[#E9D5FF]" />
          <span>{dateFormatted}</span>
          <span className="text-slate-500">•</span>
          <span className="text-[#E9D5FF] font-bold capitalize">{weekday}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`px-4 py-1.5 rounded-full bg-white/80 dark:bg-[#241329]/80 border border-[#E8DFEB] dark:border-[#49364F] shadow-2xs text-[#514458] dark:text-slate-200 font-semibold text-xs sm:text-sm hidden sm:flex items-center gap-2 ${className}`}>
      <span>{time.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      <span className="text-[#8D49A6]">•</span>
      <span className="font-bold text-[#4B075F] dark:text-white font-mono">{time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  )
}

// Prominent Clock & Calendar Card (Hava durumu yerine dikkat çekici saat & takvim kartı)
const PanoClockCalendarCard = () => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  const dayName = now.toLocaleDateString('tr-TR', { weekday: 'long' })

  return (
    <div className="flex items-center gap-4 sm:gap-6 px-5 py-3.5 bg-white/95 dark:bg-[#1E1124]/95 backdrop-blur-2xl rounded-3xl border border-[#8D49A6]/30 dark:border-[#8D49A6]/50 shadow-lg shadow-purple-950/10">
      {/* Big Attention-Grabbing Digital Clock in XX:XX format */}
      <div className="flex items-center font-mono font-black text-3xl sm:text-4xl lg:text-[2.6rem] text-[#4B075F] dark:text-white tracking-wider tabular-nums leading-none">
        <span>{hours}</span>
        <span className="text-[#D914C8] mx-1 animate-pulse drop-shadow-[0_0_12px_rgba(217,20,200,0.6)]">:</span>
        <span>{minutes}</span>
      </div>

      <div className="h-10 w-[1.5px] bg-[#E8DFEB] dark:bg-[#49364F]" />

      {/* Date, Calendar & Day */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#241329] dark:text-white">
          <Calendar className="w-3.5 h-3.5 text-[#8D49A6] shrink-0" />
          <span className="truncate">{dateStr}</span>
        </div>
        <div className="text-xs font-bold text-[#D914C8] capitalize mt-0.5">
          {dayName}
        </div>
      </div>
    </div>
  )
}
const CompactWeatherCard = PanoClockCalendarCard

// Grid App Item Component (Proportioned, Touch-Friendly for Smartboards in Single Row)
const GridItem = ({ item, onAction }: { item: AppItem; onAction: (app: AppItem) => void }) => {
  const IconComponent = (Icons as any)[item.icon || 'Board'] || Icons.Board

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={item.title}
      data-grid-item="app-item"
      onClick={() => onAction(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onAction(item)
        } else if (e.key.startsWith('Arrow')) {
          handleGridArrowNav(e, 'app-item')
        }
      }}
      onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })}
      className="flex flex-col items-center gap-2.5 sm:gap-3 w-full cursor-pointer group relative select-none rounded-3xl p-1 focus:outline-hidden focus-visible:ring-4 focus-visible:ring-[#8D49A6] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 transition-all"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <motion.div
        whileHover={{ scale: 1.08, y: -6 }}
        whileTap={{ scale: 0.94 }}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl ${item.color} shadow-lg shadow-purple-950/20 flex items-center justify-center relative transition-all duration-300 ring-1 ring-white/30 border-2 border-white/25 group-hover:shadow-2xl`}
      >
        {/* Inner gradient highlight */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />
        </div>

        <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 ${item.iconColor} z-10 pointer-events-none drop-shadow-md`}>
          <IconComponent />
        </div>

        {/* Badge */}
        {item.badge && (
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white text-[10px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900 z-20 whitespace-nowrap">
            {item.badge}
          </span>
        )}
      </motion.div>
      <span className="font-black text-[#241329] dark:text-white text-xs sm:text-sm md:text-base tracking-tight drop-shadow-xs truncate block px-1 w-full text-center pointer-events-none">
        {item.title}
      </span>
    </div>
  )
}

// Smartboard Classroom Interactive Tools (Timer, Random Student Picker, Attention Chime)
function SmartboardClassroomTools({ selectedClass }: { selectedClass: ClassroomItem | null }) {
  // 1. Timer State
  const [timerSeconds, setTimerSeconds] = useState(300) // 5 minutes default
  const [timerInitial, setTimerInitial] = useState(300)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // 2. Student Picker State
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
  const [isPickingStudent, setIsPickingStudent] = useState(false)

  // Audio helper for timer alarm & attention chime using Web Audio API
  const playChimeSound = useCallback((frequency1 = 880, frequency2 = 1174.66) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const now = ctx.currentTime

      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(frequency1, now)
      gain1.gain.setValueAtTime(0.25, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.7)

      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(frequency2, now + 0.14)
      gain2.gain.setValueAtTime(0.3, now + 0.14)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.14)
      osc2.stop(now + 1.2)
    } catch (_) {}
  }, [])

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            playChimeSound(660, 880)
            toast.success('Süre Doldu!', { icon: '⏰' })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, timerSeconds, playChimeSound])

  const setTimerPreset = (secs: number) => {
    setIsTimerRunning(false)
    setTimerInitial(secs)
    setTimerSeconds(secs)
  }

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // 3. Smartboard Touch Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0')
  const [calcEquation, setCalcEquation] = useState('')
  const [calcPrev, setCalcPrev] = useState<number | null>(null)
  const [calcOp, setCalcOp] = useState<string | null>(null)
  const [calcResetOnNext, setCalcResetOnNext] = useState(false)

  // 4. Student Picker Animation States
  const [rollingName, setRollingName] = useState('')
  const [isWinnerCelebration, setIsWinnerCelebration] = useState(false)

  // Calculator Handlers (Touch & Smartboard optimized)
  const handleCalcDigit = (d: string) => {
    if (calcResetOnNext || calcDisplay === '0') {
      setCalcDisplay(d)
      setCalcResetOnNext(false)
    } else {
      if (calcDisplay.length < 10) {
        setCalcDisplay((prev) => prev + d)
      }
    }
  }

  const handleCalcDot = () => {
    if (calcResetOnNext) {
      setCalcDisplay('0.')
      setCalcResetOnNext(false)
      return
    }
    if (!calcDisplay.includes('.')) {
      setCalcDisplay((prev) => prev + '.')
    }
  }

  const handleCalcOp = (op: string) => {
    const current = parseFloat(calcDisplay)
    if (calcPrev !== null && calcOp && !calcResetOnNext) {
      let res = calcPrev
      if (calcOp === '+') res = calcPrev + current
      else if (calcOp === '-') res = calcPrev - current
      else if (calcOp === '×') res = calcPrev * current
      else if (calcOp === '÷') res = current !== 0 ? calcPrev / current : 0
      res = Number(res.toFixed(4))
      setCalcPrev(res)
      setCalcDisplay(String(res))
      setCalcEquation(`${res} ${op}`)
    } else {
      setCalcPrev(current)
      setCalcEquation(`${current} ${op}`)
    }
    setCalcOp(op)
    setCalcResetOnNext(true)
  }

  const handleCalcEquals = () => {
    if (calcPrev === null || !calcOp) return
    const current = parseFloat(calcDisplay)
    let res = calcPrev
    if (calcOp === '+') res = calcPrev + current
    else if (calcOp === '-') res = calcPrev - current
    else if (calcOp === '×') res = calcPrev * current
    else if (calcOp === '÷') res = current !== 0 ? calcPrev / current : 0
    res = Number(res.toFixed(4))
    setCalcEquation(`${calcPrev} ${calcOp} ${current} =`)
    setCalcDisplay(String(res))
    setCalcPrev(null)
    setCalcOp(null)
    setCalcResetOnNext(true)
  }

  const handleCalcClear = () => {
    setCalcDisplay('0')
    setCalcEquation('')
    setCalcPrev(null)
    setCalcOp(null)
    setCalcResetOnNext(false)
  }

  const handleCalcBackspace = () => {
    if (calcResetOnNext) return
    if (calcDisplay.length > 1) {
      setCalcDisplay((prev) => prev.slice(0, -1))
    } else {
      setCalcDisplay('0')
    }
  }

  const handleCalcPercent = () => {
    const val = parseFloat(calcDisplay) / 100
    setCalcDisplay(String(Number(val.toFixed(4))))
  }

  // Memoized pool of students for the active class from single source of truth
  const candidateStudents = useMemo(() => {
    const allStudents = getSingleSourceOfTruthStudents(30)
    const classCode = selectedClass ? normalizeClassCode(selectedClass.name.replace('Şubesi', '').trim()) : ''
    const pool = allStudents.filter((s) => {
      if (!classCode) return true
      return normalizeClassCode(s.className) === classCode
    })
    return pool.length > 0 ? pool : allStudents
  }, [selectedClass])

  // Student Picker from Single Source of Truth with Progressive Deceleration Animation
  const handlePickStudent = () => {
    if (isPickingStudent) return
    setIsPickingStudent(true)
    setIsWinnerCelebration(false)

    const candidateList = candidateStudents

    // Progressive easing intervals: fast at start, slows down smoothly
    const intervals = [40, 45, 55, 70, 90, 115, 145, 185, 235, 300, 380, 480, 600]
    let step = 0

    const runStep = () => {
      const randIdx = Math.floor(Math.random() * candidateList.length)
      const cand = candidateList[randIdx]
      setSelectedStudent(cand)
      setRollingName(cand.name)

      // Light tick audio tone
      playChimeSound(550 + step * 25, 0)

      step++
      if (step < intervals.length) {
        setTimeout(runStep, intervals[step])
      } else {
        // Final Winner
        const finalWinner = candidateList[Math.floor(Math.random() * candidateList.length)]
        setSelectedStudent(finalWinner)
        setRollingName(finalWinner.name)
        setIsPickingStudent(false)
        setIsWinnerCelebration(true)
        playChimeSound(523.25, 659.25) // C5 to E5 triumph chime
        toast.success(`🎉 Tebrikler! Söz Hakkı: ${finalWinner.name}`, { icon: '🏆', duration: 3000 })
      }
    }

    runStep()
  }

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-4 pl-1">
        <h2 className="text-xs sm:text-sm font-black text-[#514458] dark:text-slate-400 uppercase tracking-wider">
          İnteraktif Sınıf Araçları
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* 1. Classroom Timer */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-[#1E1124]/95 backdrop-blur-xl border border-[#E8DFEB] dark:border-[#49364F] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#E9D5FF] flex items-center justify-center font-bold">
                  <Timer className="w-4 h-4" />
                </div>
                <span className="font-black text-sm text-[#241329] dark:text-white">Kronometre</span>
              </div>
              <div className="flex items-center gap-1">
                {[
                  { label: '3 Dk', sec: 180 },
                  { label: '5 Dk', sec: 300 },
                  { label: '10 Dk', sec: 600 },
                  { label: '15 Dk', sec: 900 },
                ].map((p) => (
                  <button
                    key={p.sec}
                    type="button"
                    onClick={() => setTimerPreset(p.sec)}
                    className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                      timerInitial === p.sec && !isTimerRunning
                        ? 'bg-[#4B075F] text-white shadow-xs'
                        : 'bg-[#FAF5FC] dark:bg-[#2A1833] text-[#514458] dark:text-slate-300 hover:bg-[#F0D8FA]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Big Digital Display & Progress */}
            <div className="text-center py-2.5">
              <span
                className={`font-mono text-4xl sm:text-5xl font-black tracking-widest drop-shadow-xs ${
                  timerSeconds === 0
                    ? 'text-rose-600 animate-bounce'
                    : isTimerRunning
                    ? 'text-[#4B075F] dark:text-white'
                    : 'text-[#514458] dark:text-slate-300'
                }`}
              >
                {formatTimer(timerSeconds)}
              </span>

              {/* Visual Progress Bar */}
              <div className="w-full max-w-[200px] mx-auto h-2 rounded-full bg-[#FAF5FC] dark:bg-[#2A1833] overflow-hidden mt-2.5 border border-[#E8DFEB]/80 dark:border-[#49364F]/80">
                <div
                  className="h-full bg-brand-gradient transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, (timerSeconds / timerInitial) * 100))}%` }}
                />
              </div>

              {/* Quick minute modifiers */}
              <div className="flex items-center justify-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={() => setTimerSeconds((s) => Math.max(0, s - 60))}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF5FC] dark:bg-[#2A1833] hover:bg-[#F0D8FA] text-[10.5px] font-bold text-[#4B075F] dark:text-[#E9D5FF] border border-[#E8DFEB] dark:border-[#49364F] active:scale-95 transition-all cursor-pointer"
                >
                  -1 Dk
                </button>
                <button
                  type="button"
                  onClick={() => setTimerSeconds((s) => s + 60)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF5FC] dark:bg-[#2A1833] hover:bg-[#F0D8FA] text-[10.5px] font-bold text-[#4B075F] dark:text-[#E9D5FF] border border-[#E8DFEB] dark:border-[#49364F] active:scale-95 transition-all cursor-pointer"
                >
                  +1 Dk
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#E8DFEB] dark:border-[#49364F]">
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="flex-1 py-2.5 rounded-xl bg-brand-gradient text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-white" />
                  <span className="text-white">Durdur</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-white" />
                  <span className="text-white">Başlat</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTimerRunning(false)
                setTimerSeconds(timerInitial)
              }}
              className="px-3.5 py-2.5 rounded-xl bg-[#FAF5FC] dark:bg-[#2A1833] text-[#4B075F] dark:text-[#E9D5FF] border border-[#E8DFEB] dark:border-[#49364F] hover:bg-[#F0D8FA] transition-all cursor-pointer"
              title="Sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Random Student Picker */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-[#1E1124]/95 backdrop-blur-xl border border-[#E8DFEB] dark:border-[#49364F] shadow-sm flex flex-col justify-between relative overflow-hidden">
          {/* Ambient Glow on Celebration */}
          {isWinnerCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0.2] }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-gradient-to-br from-[#D914C8]/20 via-[#8D49A6]/20 to-transparent pointer-events-none"
            />
          )}

          <div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#E9D5FF] flex items-center justify-center font-bold">
                  <Dice5 className={`w-4 h-4 ${isPickingStudent ? 'animate-spin' : ''}`} />
                </div>
                <span className="font-black text-sm text-[#241329] dark:text-white">Soru & Söz Hakkı</span>
              </div>
            </div>

            {/* Selected Student Display with High-Impact Animation */}
            <div className="min-h-[120px] flex flex-col items-center justify-center text-center py-2 relative z-10">
              {isPickingStudent ? (
                <motion.div
                  key="rolling"
                  initial={{ scale: 0.9, opacity: 0.5 }}
                  animate={{ scale: [0.95, 1.05, 0.95], opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 0.2 }}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-[#350444] dark:to-[#4B075F] border border-[#8D49A6]/40 w-full shadow-inner"
                >
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#8D49A6] dark:text-[#F0D8FA] block animate-pulse">
                    Öğrenci Seçiliyor...
                  </span>
                  <div className="font-mono text-xl font-black text-[#4B075F] dark:text-white truncate mt-1">
                    {rollingName || '...'}
                  </div>
                </motion.div>
              ) : selectedStudent ? (
                <motion.div
                  key={selectedStudent.id || 'winner'}
                  initial={{ scale: 0.8, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                  className="space-y-1.5 w-full"
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white text-[10.5px] font-black shadow-md shadow-pink-900/20">
                    <Trophy size={12} className="text-yellow-300" />
                    <span>Söz Hakkı Sende!</span>
                  </div>
                  <div className="font-black text-lg sm:text-xl text-[#241329] dark:text-white truncate">
                    {selectedStudent.name}
                  </div>
                  <p className="text-[11px] font-bold text-[#8D49A6] dark:text-[#E9D5FF]">
                    Öğrenci No: {selectedStudent.studentNo || '101'} • Sınıf: {selectedStudent.className || '1/A'}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-2 py-1">
                  <div className="w-11 h-11 rounded-2xl bg-[#F0D8FA]/80 dark:bg-[#350444]/60 mx-auto flex items-center justify-center text-[#8D49A6]">
                    <Dice5 size={22} />
                  </div>
                  <p className="text-xs text-[#514458] dark:text-slate-300 font-bold">
                    Tahtaya Kaldırma & Soru Çarkı
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF5FC] dark:bg-[#2A1833] border border-[#E8DFEB] dark:border-[#49364F] text-[10.5px] font-bold text-[#8D49A6] dark:text-[#E9D5FF]">
                    <Users size={11} />
                    <span>{candidateStudents.length} Öğrenci Hazır</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t border-[#E8DFEB] dark:border-[#49364F] relative z-10">
            <button
              type="button"
              disabled={isPickingStudent}
              onClick={handlePickStudent}
              className="w-full py-2.5 rounded-xl bg-brand-gradient text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Dice5 className={`w-3.5 h-3.5 text-white ${isPickingStudent ? 'animate-spin' : ''}`} />
              <span className="text-white">
                {isPickingStudent ? 'Çark Dönüyor...' : selectedStudent ? '🎲 Başka Öğrenci Seç' : '🎲 Rastgele Öğrenci Seç'}
              </span>
            </button>
          </div>
        </div>

        {/* 3. Dokunmatik Akıllı Tahta Hesap Makinesi */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-[#1E1124]/95 backdrop-blur-xl border border-[#E8DFEB] dark:border-[#49364F] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#E9D5FF] flex items-center justify-center font-bold">
                  <Calculator className="w-4 h-4" />
                </div>
                <span className="font-black text-sm text-[#241329] dark:text-white">Hesap Makinesi</span>
              </div>
              <button
                type="button"
                onClick={handleCalcClear}
                className="text-[10px] font-bold text-[#D914C8] hover:text-[#8D49A6] bg-[#FAF5FC] dark:bg-[#2A1833] px-2 py-0.5 rounded-lg border border-[#E8DFEB] dark:border-[#49364F] cursor-pointer active:scale-95 transition-all"
              >
                Sıfırla
              </button>
            </div>

            {/* Calculator Digital Screen */}
            <div className="p-2 rounded-xl bg-slate-900 text-white font-mono text-right border border-white/10 shadow-inner mb-2">
              <div className="text-[10px] text-slate-400 h-3.5 truncate">
                {calcEquation || '\u00A0'}
              </div>
              <div className="text-lg sm:text-xl font-black text-emerald-400 truncate tracking-tight">
                {calcDisplay}
              </div>
            </div>

            {/* Touch Keypad */}
            <div className="grid grid-cols-4 gap-1 text-xs font-black">
              {/* Row 1 */}
              <button
                type="button"
                onClick={handleCalcClear}
                className="h-7 sm:h-7.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 active:scale-90 transition-transform cursor-pointer"
              >
                C
              </button>
              <button
                type="button"
                onClick={handleCalcBackspace}
                className="h-7 sm:h-7.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 active:scale-90 transition-transform cursor-pointer"
              >
                ⌫
              </button>
              <button
                type="button"
                onClick={handleCalcPercent}
                className="h-7 sm:h-7.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 active:scale-90 transition-transform cursor-pointer"
              >
                %
              </button>
              <button
                type="button"
                onClick={() => handleCalcOp('÷')}
                className="h-7 sm:h-7.5 rounded-lg bg-[#F0D8FA] hover:bg-[#E8DFEB] dark:bg-[#350444] text-[#4B075F] dark:text-[#E9D5FF] active:scale-90 transition-transform cursor-pointer"
              >
                ÷
              </button>

              {/* Row 2 */}
              <button
                type="button"
                onClick={() => handleCalcDigit('7')}
                className="h-7 sm:h-7.5 rounded-lg bg-white dark:bg-[#2A1833] text-[#241329] dark:text-white border border-[#E8DFEB] dark:border-[#49364F] active:scale-90 transition-transform cursor-pointer"
              >
                7
              </button>
              <button
                type="button"
                onClick={() => handleCalcDigit('8')}
                className="h-7 sm:h-7.5 rounded-lg bg-white dark:bg-[#2A1833] text-[#241329] dark:text-white border border-[#E8DFEB] dark:border-[#49364F] active:scale-90 transition-transform cursor-pointer"
              >
                8
              </button>
              <button
                type="button"
                onClick={() => handleCalcDigit('9')}
                className="h-7 sm:h-7.5 rounded-lg bg-white dark:bg-[#2A1833] text-[#241329] dark:text-white border border-[#E8DFEB] dark:border-[#49364F] active:scale-90 transition-transform cursor-pointer"
              >
                9
              </button>
              <button
                type="button"
                onClick={() => handleCalcOp('×')}
                className="h-7 sm:h-7.5 rounded-lg bg-[#F0D8FA] hover:bg-[#E8DFEB] dark:bg-[#350444] text-[#4B075F] dark:text-[#E9D5FF] active:scale-90 transition-transform cursor-pointer"
              >
                ×
              </button>

              {/* Row 3 */}
              <button
                type="button"
                onClick={() => handleCalcDigit('4')}
                className="h-7 sm:h-7.5 rounded-lg bg-white dark:bg-[#2A1833] text-[#241329] dark:text-white border border-[#E8DFEB] dark:border-[#49364F] active:scale-90 transition-transform cursor-pointer"
              >
                4
              </button>
              <button
                type="button"
                onClick={() => handleCalcDigit('5')}
                className="h-7 sm:h-7.5 rounded-lg bg-white dark:bg-[#2A1833] text-[#241329] dark:text-white border border-[#E8DFEB] dark:border-[#49364F] active:scale-90 transition-transform cursor-pointer"
              >
                5
              </button>
              <button
                type="button"
                onClick={() => handleCalcDigit('6')}
                className="h-7 sm:h-7.5 rounded-lg bg-white dark:bg-[#2A1833] text-[#241329] dark:text-white border border-[#E8DFEB] dark:border-[#49364F] active:scale-90 transition-transform cursor-pointer"
              >
                6
              </button>
              <button
                type="button"
                onClick={() => handleCalcOp('-')}
                className="h-7 sm:h-7.5 rounded-lg bg-[#F0D8FA] hover:bg-[#E8DFEB] dark:bg-[#350444] text-[#4B075F] dark:text-[#E9D5FF] active:scale-90 transition-transform cursor-pointer"
              >
                -
              </button>

              {/* Row 4 */}
              <button
                type="button"
                onClick={() => handleCalcDigit('1')}
                className="h-7 sm:h-7.5 rounded-lg bg-white dark:bg-[#2A1833] text-[#241329] dark:text-white border border-[#E8DFEB] dark:border-[#49364F] active:scale-90 transition-transform cursor-pointer"
              >
                1
              </button>
              <button
                type="button"
                onClick={() => handleCalcDigit('2')}
                className="h-7 sm:h-7.5 rounded-lg bg-white dark:bg-[#2A1833] text-[#241329] dark:text-white border border-[#E8DFEB] dark:border-[#49364F] active:scale-90 transition-transform cursor-pointer"
              >
                2
              </button>
              <button
                type="button"
                onClick={() => handleCalcDigit('3')}
                className="h-7 sm:h-7.5 rounded-lg bg-white dark:bg-[#2A1833] text-[#241329] dark:text-white border border-[#E8DFEB] dark:border-[#49364F] active:scale-90 transition-transform cursor-pointer"
              >
                3
              </button>
              <button
                type="button"
                onClick={() => handleCalcOp('+')}
                className="h-7 sm:h-7.5 rounded-lg bg-[#F0D8FA] hover:bg-[#E8DFEB] dark:bg-[#350444] text-[#4B075F] dark:text-[#E9D5FF] active:scale-90 transition-transform cursor-pointer"
              >
                +
              </button>

              {/* Row 5 */}
              <button
                type="button"
                onClick={() => handleCalcDigit('0')}
                className="h-7 sm:h-7.5 rounded-lg bg-white dark:bg-[#2A1833] text-[#241329] dark:text-white border border-[#E8DFEB] dark:border-[#49364F] active:scale-90 transition-transform cursor-pointer col-span-2"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleCalcDot}
                className="h-7 sm:h-7.5 rounded-lg bg-white dark:bg-[#2A1833] text-[#241329] dark:text-white border border-[#E8DFEB] dark:border-[#49364F] active:scale-90 transition-transform cursor-pointer"
              >
                ,
              </button>
              <button
                type="button"
                onClick={handleCalcEquals}
                className="h-7 sm:h-7.5 rounded-lg bg-brand-gradient text-white active:scale-90 transition-transform cursor-pointer shadow-xs"
              >
                =
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const NeonGlass3DLockScreen = PanoLockScreen

// Pano Settings Drawer / Modal
const PanoSettingsModal = ({
  isOpen,
  onClose,
  settings,
  onSave
}: {
  isOpen: boolean
  onClose: () => void
  settings: PanoSettings
  onSave: (newSettings: PanoSettings) => void
}) => {
  const [pin, setPin] = useState(settings.pin)
  const [idleTimeout, setIdleTimeout] = useState(settings.idleTimeout)
  const [unlockType, setUnlockType] = useState(settings.unlockType)
  const [quotes, setQuotes] = useState<QuoteItem[]>(() => {
    const raw = settings.quotes && settings.quotes.length > 0 ? settings.quotes : DEFAULT_PANO_QUOTES
    return raw.map(normalizeQuote)
  })
  const [newQuoteText, setNewQuoteText] = useState('')
  const [newQuoteAuthor, setNewQuoteAuthor] = useState('')

  if (!isOpen) return null

  const handleAddQuote = () => {
    if (!newQuoteText.trim()) return
    setQuotes([...quotes, { text: newQuoteText.trim(), author: newQuoteAuthor.trim() }])
    setNewQuoteText('')
    setNewQuoteAuthor('')
  }

  const handleDeleteQuote = (index: number) => {
    setQuotes(quotes.filter((_, i) => i !== index))
  }

  const handleUpdateQuote = (index: number, field: 'text' | 'author', val: string) => {
    const updated = [...quotes]
    updated[index] = { ...updated[index], [field]: val }
    setQuotes(updated)
  }

  const handleSaveAll = () => {
    onSave({
      pin,
      idleTimeout,
      unlockType,
      quotes: quotes.filter(q => q.text.trim().length > 0)
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-white">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base">Pano ve Kilit Ekranı Ayarları</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Şifre, inaktivite zamanlayıcısı ve kilit içeriklerini yapılandırın.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* 1. Kilit PIN Şifresi */}
          <div className="space-y-2">
            <label className="font-extrabold text-sm flex items-center gap-1.5 text-slate-900 dark:text-white">
              <KeyRound className="w-4 h-4 text-indigo-500" />
              <span>Pano Kilit Şifresi (PIN)</span>
            </label>
            <p className="text-slate-500">Boş bırakırsanız tek tıkla şifresiz açılır; şifre girerseniz kilit açılırken istenir.</p>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Örn: 1234 (İsteğe bağlı PIN)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono tracking-widest outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 2. Kilit Ekranı Tercihi */}
          <div className="space-y-2">
            <label className="font-extrabold text-sm flex items-center gap-1.5 text-slate-900 dark:text-white">
              <Unlock className="w-4 h-4 text-indigo-500" />
              <span>Kilit Ekranı Tercihi</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'pin', title: 'PIN Tuş Takımı', desc: 'Rakam tuşları ile güvenli giriş' },
                { id: 'slide', title: 'Kaydırmalı (Slide)', desc: 'Sağa kaydırarak anında aç' }
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setUnlockType(opt.id as any)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    unlockType === opt.id
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <p className="font-extrabold text-xs">{opt.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Ne Kadar Süre Etkisiz Kalırsa Kilitleneceği */}
          <div className="space-y-2">
            <label className="font-extrabold text-sm flex items-center gap-1.5 text-slate-900 dark:text-white">
              <Lock className="w-4 h-4 text-indigo-500" />
              <span>Otomatik Kilit Süresi (İnaktivite)</span>
            </label>
            <p className="text-slate-500">Pano ne kadar süre dokunulmazsa otomatik olarak kilit ekranına geçsin?</p>
            <select
              value={idleTimeout}
              onChange={(e) => setIdleTimeout(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
            >
              <option value={30}>30 Saniye (Test / Hızlı)</option>
              <option value={60}>1 Dakika</option>
              <option value={120}>2 Dakika</option>
              <option value={300}>5 Dakika (Önerilen)</option>
              <option value={600}>10 Dakika</option>
              <option value={900}>15 Dakika</option>
              <option value={0}>Asla (Otomatik Kilitleme Kapalı)</option>
            </select>
          </div>

          {/* 4. Kilit Ekranı İçerik Metinleri & Yazarları */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-sm flex items-center gap-1.5 text-slate-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Kilit Ekranı Sözleri & Yazarları</span>
              </label>
              <button
                type="button"
                onClick={() => setQuotes(DEFAULT_PANO_QUOTES)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
              >
                Varsayılanları Yükle
              </button>
            </div>
            <p className="text-slate-500">Sözün karşısına yazarını yazabilirsiniz (yazar alanı boş bırakılırsa ekranda sadece söz görünür):</p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {quotes.map((q, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-mono text-slate-400 w-5 text-center shrink-0 hidden sm:inline">{idx + 1}.</span>
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => handleUpdateQuote(idx, 'text', e.target.value)}
                    placeholder="Özlü söz veya içerik..."
                    className="flex-1 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={q.author || ''}
                    onChange={(e) => handleUpdateQuote(idx, 'author', e.target.value)}
                    placeholder="Yazarı (İsteğe bağlı)"
                    className="w-full sm:w-48 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteQuote(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer shrink-0 self-end sm:self-center"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Yeni Madde Ekle Formu */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
              <input
                type="text"
                value={newQuoteText}
                onChange={(e) => setNewQuoteText(e.target.value)}
                placeholder="Yeni özlü söz metni..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={newQuoteAuthor}
                onChange={(e) => setNewQuoteAuthor(e.target.value)}
                placeholder="Yazarı (İsteğe bağlı)"
                className="w-full sm:w-48 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddQuote}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Ekle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200/50 transition cursor-pointer"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md transition cursor-pointer"
          >
            Ayarları Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}

// Initial Class Selection Modal
const ClassSelectionModal = ({
  isOpen,
  onClose,
  classrooms,
  selectedClassId,
  onSelect
}: {
  isOpen: boolean
  onClose: () => void
  classrooms: ClassroomItem[]
  selectedClassId: number
  onSelect: (item: ClassroomItem) => void
}) => {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-[240] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in-50 duration-200 select-none"
    >
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl flex flex-col overflow-hidden text-slate-800 dark:text-white">
        {/* Touch Friendly Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/30">
            <School className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Ders Başlıyor! Lütfen Sınıfınızı Seçin</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Akıllı tahta, öğrenci listesi ve ödevler seçtiğiniz şubeye göre otomatik yapılandırılır.
          </p>
        </div>

        <div data-grid-container="modal-classes" className="p-6 space-y-3 max-h-[70vh] overflow-y-auto overscroll-contain">
          {classrooms.map((c) => {
            const isSelected = c.id === selectedClassId
            return (
              <div
                key={c.id}
                tabIndex={0}
                role="button"
                aria-label={`${c.name} seçimi`}
                data-grid-item="modal-class-item"
                onClick={() => {
                  onSelect(c)
                  onClose()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(c)
                    onClose()
                  } else if (e.key.startsWith('Arrow')) {
                    handleGridArrowNav(e, 'modal-class-item')
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    onClose()
                  }
                }}
                onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer focus:outline-hidden focus-visible:ring-4 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-white shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {c.name.split(' ')[0]}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{c.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {c.gradeLevel} • {c.studentCount} Kayıtlı Öğrenci • {c.boardCount} Tahta
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F17AE6] border border-[#E8DFEB] dark:border-[#49364F]">
                    {c.attendance} Katılım
                  </span>
                  {isSelected && <Check className="w-5 h-5 text-[#4B075F] dark:text-[#D914C8]" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Embedded EduOS Application Window (Fullscreen modal embedding the target page with chrome=none)
const EduOSWindow = ({
  windowState,
  orgslug,
  onClose,
  onToggleMaximize,
  onReload,
  onUserActivity
}: {
  windowState: WindowState
  orgslug: string
  onClose: () => void
  onToggleMaximize: () => void
  onReload: () => void
  onUserActivity?: () => void
}) => {
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const app = windowState.app

  const targetPath = windowState.currentPath || app.path || `/dash`
  const separator = targetPath.includes('?') ? '&' : '?'

  // Only /board/* and /games* are top-level routes without /orgs/ prefix.
  // Everything else (including /dash/*, /library*, /orgs/*) needs the org prefix.
  const isAlreadyOrgPath = targetPath.startsWith('/orgs/')
  const isTrulyTopLevel =
    targetPath.startsWith('/board') ||
    targetPath.startsWith('/games')

  const fullAppUrl = isAlreadyOrgPath || isTrulyTopLevel
    ? `${targetPath}${separator}chrome=none&pano=1`
    : `/orgs/${orgslug}${targetPath}${separator}chrome=none&pano=1`

  const IconComponent = (Icons as any)[app.icon || 'Board'] || Icons.Board

  const attachIframeActivityListeners = () => {
    try {
      const iframe = iframeRef.current
      if (!iframe) return
      const doc = iframe.contentDocument
      const win = iframe.contentWindow
      if (doc && win && onUserActivity) {
        const events = ['mousemove', 'mousedown', 'mouseup', 'pointermove', 'pointerdown', 'pointerup', 'touchstart', 'touchmove', 'touchend', 'keydown', 'scroll', 'click']
        events.forEach(ev => {
          doc.addEventListener(ev, onUserActivity, { capture: true, passive: true })
          win.addEventListener(ev, onUserActivity, { capture: true, passive: true })
        })
      }
    } catch (_) {}
  }

  useEffect(() => {
    attachIframeActivityListeners()
  }, [windowState.iframeKey])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      onPointerDownCapture={onUserActivity}
      onMouseMoveCapture={onUserActivity}
      onTouchStartCapture={onUserActivity}
      className="fixed z-50 flex flex-col bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 inset-0 w-full h-full rounded-none"
    >
      {/* Window TitleBar */}
      <div className="w-full h-11 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-xl shrink-0 select-none">
        {/* Window Close Button - Visible Red Circle with clear X */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all flex items-center justify-center cursor-pointer shadow-xs hover:scale-105 active:scale-95"
            title="Kapat"
          >
            <X className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          </button>
        </div>

        {/* Center Title */}
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 ${app.iconColor || 'text-indigo-600'}`}>
            <IconComponent />
          </div>
          <span className="font-bold text-xs text-slate-700 dark:text-slate-200 tracking-wide">
            {app.title}
          </span>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onReload}
            className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Yenile"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={targetPath.startsWith('/orgs/') || targetPath.startsWith('/board') || targetPath.startsWith('/games') ? targetPath : `/orgs/${orgslug}${targetPath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Yeni Sekmede Aç"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Body: Embedded iframe with chrome=none */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-white dark:bg-slate-900">
        {!iframeLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
            <div className={`w-14 h-14 ${app.color} rounded-2xl flex items-center justify-center shadow-lg mb-3 animate-pulse text-white p-3`}>
              <IconComponent />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="font-bold text-xs text-slate-600 dark:text-slate-400">{app.title} hazırlanıyor...</p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          key={windowState.iframeKey}
          src={fullAppUrl}
          loading="eager"
          onLoad={() => {
            setIframeLoaded(true)
            attachIframeActivityListeners()
          }}
          className="w-full h-full border-0 bg-white dark:bg-slate-900 block"
          allow="camera; microphone; fullscreen; clipboard-write; display-capture; accelerometer; autoplay; encrypted-media; gyroscope"
        />
      </div>
    </motion.div>
  )
}

function MinusIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  )
}

// New Blank Board Modal for Class (Date First, Name Under It)
const NewBoardModal = ({
  isOpen,
  onClose,
  className,
  classId,
  orgId,
  onBoardCreated,
}: {
  isOpen: boolean
  onClose: () => void
  className: string
  classId: number
  orgId: number
  onBoardCreated: (board: any) => void
}) => {
  const [boardDate, setBoardDate] = useState(() => new Date().toISOString().split('T')[0])
  const [boardName, setBoardName] = useState(`${className} - Canlı Ders Tahtası`)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setBoardDate(new Date().toISOString().split('T')[0])
      setBoardName(`${className} - Canlı Ders Tahtası`)
    }
  }, [isOpen, className])

  if (!isOpen) return null

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!boardName.trim()) {
      toast.error('Lütfen tahta adını giriniz')
      return
    }
    setIsSubmitting(true)
    try {
      const created = await createBoard(orgId, {
        name: boardName.trim(),
        board_date: boardDate,
        blank: true,
        usergroup_id: classId,
      })
      toast.success('Yeni boş tahta hazırlandı!')
      onBoardCreated(created)
      onClose()
    } catch (err) {
      console.error('Board creation error:', err)
      toast.error('Tahta oluşturulurken hata meydana geldi')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in-50 duration-200 select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden text-slate-800 dark:text-white">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Yeni Akıllı Tahta Başlat</h2>
              <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">{className}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-4">
          {/* 1. Tarih (ÖNCE TARİH) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>1. Tahta Tarihi</span>
            </label>
            <input
              type="date"
              value={boardDate}
              onChange={(e) => setBoardDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* 2. Tahta Adı (ALTINDA TAHTA ADI) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Presentation className="w-3.5 h-3.5 text-indigo-600" />
              <span>2. Tahta Adı</span>
            </label>
            <input
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Örn: 1-A Türkçe Dersi Canlı Tahta"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
              required
              autoFocus
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Presentation className="w-4 h-4" />
              <span>{isSubmitting ? 'Hazırlanıyor...' : 'Boş Tahtayı Başlat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Interactive Mock Exam Modal
// Standalone Web Audio Chime Helper
function playAudioChime(frequency1 = 880, frequency2 = 1174.66) {
  try {
    if (typeof window === 'undefined') return
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(frequency1, now)
    gain1.gain.setValueAtTime(0.25, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.65)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.65)

    if (frequency2) {
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(frequency2, now + 0.12)
      gain2.gain.setValueAtTime(0.25, now + 0.12)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.12)
      osc2.stop(now + 0.85)
    }
  } catch (_) {}
}

interface LiveExamQuestionItem {
  id: string
  text: string
  type?: 'single' | 'multiple' | 'boolean' | 'fill'
  options: { id: string; text: string }[]
  correctOptionId: string
  correctOptionIds?: string[]
  correctAnswerText?: string
  points?: number
}

interface LiveExamData {
  id: string
  title: string
  boardId: string
  createdAt: number
  teacherName: string
  questions: LiveExamQuestionItem[]
}

const DEFAULT_PANO_EXAM: LiveExamData = {
  id: 'curriculum_default',
  title: 'Haftalık İnteraktif Kazanım Değerlendirmesi',
  boardId: '1A-01',
  createdAt: Date.now(),
  teacherName: 'Zümre Kurulu',
  questions: [
    {
      id: 'q1',
      type: 'single',
      text: 'Aşağıdaki sayılardan hangisi 4 basamaklı en küçük çift doğal sayıdır?',
      options: [
        { id: 'A', text: '1000' },
        { id: 'B', text: '1002' },
        { id: 'C', text: '1001' },
        { id: 'D', text: '1020' },
      ],
      correctOptionId: 'A',
      points: 25,
    },
    {
      id: 'q2',
      type: 'multiple',
      text: 'Aşağıdaki sayılardan hangileri hem 2’ye hem de 3’e kalansız bölünebilir (6’nın katlarıdır)?',
      options: [
        { id: 'A', text: '12' },
        { id: 'B', text: '18' },
        { id: 'C', text: '25' },
        { id: 'D', text: '30' },
      ],
      correctOptionId: 'A',
      correctOptionIds: ['A', 'B', 'D'],
      points: 25,
    },
    {
      id: 'q3',
      type: 'boolean',
      text: 'Dünya, Güneş Sistemi’nde üzerinde yaşam olduğu kanıtlanan tek gezegendir.',
      options: [
        { id: 'A', text: 'DOĞRU' },
        { id: 'B', text: 'YANLIŞ' },
      ],
      correctOptionId: 'A',
      points: 25,
    },
    {
      id: 'q4',
      type: 'fill',
      text: 'Türkiye Cumhuriyeti’nin başkenti _______ ilidir.',
      options: [
        { id: 'A', text: 'Ankara' },
        { id: 'B', text: 'İstanbul' },
        { id: 'C', text: 'İzmir' },
        { id: 'D', text: 'Bursa' },
      ],
      correctOptionId: 'A',
      correctAnswerText: 'Ankara',
      points: 25,
    },
  ],
}

// Interactive Pano Live Exam Modal (High-Visibility Smartboard Quiz)
function MockExamModal({
  isOpen,
  onClose,
  className,
  boardId = '1A-01',
  students = [],
}: {
  isOpen: boolean
  onClose: () => void
  className: string
  boardId?: string
  students?: any[]
}) {
  const [activeQuestion, setActiveQuestion] = useState(0)
  const [questionAnswers, setQuestionAnswers] = useState<
    Record<
      number,
      {
        selectedId?: string
        selectedIds?: string[]
        isCorrect: boolean
        studentName?: string
        summaryText?: string
      }
    >
  >({})
  const [questionStudents, setQuestionStudents] = useState<Record<number, string>>({})
  const [isRollingStudent, setIsRollingStudent] = useState(false)
  const [rollingName, setRollingName] = useState<string>('')
  const [isFinished, setIsFinished] = useState(false)

  // Transient selection states for interactive questions
  const [selectedMultipleIds, setSelectedMultipleIds] = useState<string[]>([])
  const [selectedFillWord, setSelectedFillWord] = useState<string>('')

  // Dynamic Exam loaded from Teacher Screen or Default
  const [examData, setExamData] = useState<LiveExamData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved =
          localStorage.getItem(`oxonom_pano_exam_${boardId}`) ||
          localStorage.getItem('oxonom_pano_active_exam')
        if (saved) return JSON.parse(saved)
      } catch (_) {}
    }
    return DEFAULT_PANO_EXAM
  })

  // Synchronize on mount and storage events
  useEffect(() => {
    const loadExam = () => {
      if (typeof window !== 'undefined') {
        try {
          const saved =
            localStorage.getItem(`oxonom_pano_exam_${boardId}`) ||
            localStorage.getItem('oxonom_pano_active_exam')
          if (saved) {
            setExamData(JSON.parse(saved))
          }
        } catch (_) {}
      }
    }
    loadExam()
    window.addEventListener('oxonom_pano_exam_updated', loadExam)
    window.addEventListener('storage', loadExam)
    return () => {
      window.removeEventListener('oxonom_pano_exam_updated', loadExam)
      window.removeEventListener('storage', loadExam)
    }
  }, [boardId])

  const questions =
    examData?.questions && examData.questions.length > 0
      ? examData.questions
      : DEFAULT_PANO_EXAM.questions
  const curQ = questions[activeQuestion] || questions[0]
  const qType = curQ.type || 'single'
  const currentAnswer = questionAnswers[activeQuestion]
  const currentAssignedStudent = questionStudents[activeQuestion] || rollingName

  // Reset interactive selections on question change
  useEffect(() => {
    setSelectedMultipleIds([])
    setSelectedFillWord('')
  }, [activeQuestion])

  // Student Picker with Fast Rolling Animation
  const handlePickStudent = useCallback(() => {
    if (isRollingStudent) return
    setIsRollingStudent(true)

    const candidateList =
      students && students.length > 0
        ? students
        : [
            { name: 'Ahmet Yılmaz' },
            { name: 'Zeynep Kaya' },
            { name: 'Mehmet Demir' },
            { name: 'Elif Çelik' },
            { name: 'Can Özkan' },
            { name: 'Selin Arslan' },
            { name: 'Burak Koç' },
            { name: 'Ayşe Şahin' },
            { name: 'Emir Yıldız' },
            { name: 'Fatma Aydın' },
          ]

    const intervals = [35, 45, 60, 80, 110, 150, 200, 270, 360, 480]
    let step = 0

    const run = () => {
      const pick = candidateList[Math.floor(Math.random() * candidateList.length)]
      setRollingName(pick.name)
      playAudioChime(550 + step * 30, 0)
      step++
      if (step < intervals.length) {
        setTimeout(run, intervals[step])
      } else {
        const finalWinner = candidateList[Math.floor(Math.random() * candidateList.length)]
        setRollingName(finalWinner.name)
        setQuestionStudents((prev) => ({ ...prev, [activeQuestion]: finalWinner.name }))
        setIsRollingStudent(false)
        playAudioChime(523.25, 659.25)
        toast.success(`🎉 Soru Cevaplayıcısı: ${finalWinner.name}`, { icon: '🏆', duration: 2500 })
      }
    }
    run()
  }, [isRollingStudent, students, activeQuestion])

  // AUTO-ROLL EFFECT: Automatically pick random student when question opens/changes if unassigned
  useEffect(() => {
    if (!isOpen || isFinished) return
    if (!questionStudents[activeQuestion] && !questionAnswers[activeQuestion]) {
      const timer = setTimeout(() => {
        handlePickStudent()
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [activeQuestion, isOpen, isFinished, questionStudents, questionAnswers, handlePickStudent])

  // 1. Single Choice Selection Handler
  const handleSelectSingleOption = (optId: string) => {
    if (currentAnswer) return

    const isCorrect = optId === curQ.correctOptionId
    if (isCorrect) {
      playAudioChime(523.25, 659.25)
    } else {
      playAudioChime(260, 180)
    }

    const assigned = currentAssignedStudent || 'Öğrenci'
    setQuestionAnswers((prev) => ({
      ...prev,
      [activeQuestion]: {
        selectedId: optId,
        isCorrect,
        studentName: assigned,
        summaryText: `${optId} Şıkkı`,
      },
    }))
  }

  // 2. Multiple Choice Handler
  const handleToggleMultipleOption = (optId: string) => {
    if (currentAnswer) return
    setSelectedMultipleIds((prev) =>
      prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
    )
  }

  const handleConfirmMultiple = () => {
    if (currentAnswer || selectedMultipleIds.length === 0) return

    const correctList =
      curQ.correctOptionIds && curQ.correctOptionIds.length > 0
        ? curQ.correctOptionIds
        : [curQ.correctOptionId || 'A']

    const isCorrect =
      selectedMultipleIds.length === correctList.length &&
      selectedMultipleIds.every((id) => correctList.includes(id))

    if (isCorrect) {
      playAudioChime(523.25, 659.25)
    } else {
      playAudioChime(260, 180)
    }

    const assigned = currentAssignedStudent || 'Öğrenci'
    setQuestionAnswers((prev) => ({
      ...prev,
      [activeQuestion]: {
        selectedIds: selectedMultipleIds,
        selectedId: selectedMultipleIds.join(', '),
        isCorrect,
        studentName: assigned,
        summaryText: `Seçim: ${selectedMultipleIds.join(', ')}`,
      },
    }))
  }

  // 3. Boolean (True/False) Handler
  const handleSelectBoolean = (optId: string) => {
    if (currentAnswer) return
    const isCorrect = optId === (curQ.correctOptionId || 'A')
    if (isCorrect) {
      playAudioChime(523.25, 659.25)
    } else {
      playAudioChime(260, 180)
    }

    const assigned = currentAssignedStudent || 'Öğrenci'
    const chosenText = optId === 'A' ? 'DOĞRU' : 'YANLIŞ'
    setQuestionAnswers((prev) => ({
      ...prev,
      [activeQuestion]: {
        selectedId: optId,
        isCorrect,
        studentName: assigned,
        summaryText: chosenText,
      },
    }))
  }

  // 4. Fill in the Blank Handler
  const handleSelectFillWord = (word: string) => {
    if (currentAnswer) return
    setSelectedFillWord(word)
  }

  const handleConfirmFill = () => {
    if (currentAnswer || !selectedFillWord) return

    const targetAnswer = (
      curQ.correctAnswerText ||
      curQ.options.find((o) => o.id === curQ.correctOptionId)?.text ||
      ''
    ).trim().toLowerCase()

    const isCorrect = selectedFillWord.trim().toLowerCase() === targetAnswer

    if (isCorrect) {
      playAudioChime(523.25, 659.25)
    } else {
      playAudioChime(260, 180)
    }

    const assigned = currentAssignedStudent || 'Öğrenci'
    setQuestionAnswers((prev) => ({
      ...prev,
      [activeQuestion]: {
        selectedId: selectedFillWord,
        isCorrect,
        studentName: assigned,
        summaryText: `Kelime: ${selectedFillWord}`,
      },
    }))
  }

  // Summary Metrics
  const totalAnswered = Object.keys(questionAnswers).length
  const correctCount = Object.values(questionAnswers).filter((a) => a.isCorrect).length
  const incorrectCount = totalAnswered - correctCount
  const successPercentage = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl md:max-w-5xl max-h-[96vh] rounded-3xl bg-white/98 dark:bg-[#1A1020]/98 backdrop-blur-3xl border-2 border-[#8D49A6]/40 dark:border-[#8D49A6]/60 shadow-2xl p-4 sm:p-5 text-left select-none flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-[#E8DFEB] dark:border-[#49364F]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4B075F] to-[#8D49A6] text-white flex items-center justify-center shadow-md shadow-purple-950/20 shrink-0">
                  <FileQuestion className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-[#241329] dark:text-white">
                      {examData.title}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-black">
                      CANLI DERSLİK
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#716779] dark:text-[#C58ADB] font-semibold">
                    {className || '1/A Sınıfı'} • Akıllı Tahta: {boardId} • {questions.length} Soru
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 dark:bg-[#2D1636] dark:hover:bg-rose-950/60 dark:text-slate-300 dark:hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content: Step-by-Step Questions or Final Summary */}
            {!isFinished ? (
              <div className="space-y-2.5 flex-1 flex flex-col justify-between overflow-hidden">
                {/* 1. ÖĞRENCİ SEÇİM SAHNESİ */}
                <div className="relative overflow-hidden rounded-2xl p-2.5 sm:p-3 bg-gradient-to-r from-[#4B075F] via-[#7B2CBF] to-[#D914C8] text-white shadow-md border border-white/20">
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-pink-100 flex items-center gap-1 border border-white/25">
                          <Sparkles className="w-3 h-3 text-yellow-300" />
                          {isRollingStudent
                            ? 'ŞANSLI ÖĞRENCİ BELİRLENİYOR...'
                            : 'SÖZ HAKKI SIRASI • TAHTAYA DAVET EDİLDİ ✨'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isRollingStudent ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide font-mono animate-pulse">
                              {rollingName || 'Öğrenci Seçiliyor...'}
                            </span>
                            <Dice5 className="w-5 h-5 text-amber-300 animate-spin" />
                          </div>
                        ) : currentAssignedStudent ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-sm tracking-tight">
                              {currentAssignedStudent}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-black">
                              🎤 Sıra Sende!
                            </span>
                          </div>
                        ) : (
                          <span className="text-base font-bold text-white/80">
                            Öğrenci belirleniyor...
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePickStudent}
                        disabled={isRollingStudent || !!currentAnswer}
                        className="px-3.5 py-1.5 rounded-xl bg-white text-[#4B075F] hover:bg-amber-100 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Dice5 className={`w-3.5 h-3.5 text-[#8D49A6] ${isRollingStudent ? 'animate-spin' : ''}`} />
                        <span>{isRollingStudent ? 'Çark Dönüyor...' : '🎲 Başka Öğrenci Seç'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Step Progress Bar */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {questions.map((_, idx) => {
                      const ans = questionAnswers[idx]
                      const isActive = activeQuestion === idx
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveQuestion(idx)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                            isActive
                              ? 'bg-[#4B075F] text-white ring-2 ring-[#8D49A6]/40 shadow-sm scale-105'
                              : ans
                              ? ans.isCorrect
                                ? 'bg-emerald-500 text-white'
                                : 'bg-rose-500 text-white'
                              : 'bg-slate-100 dark:bg-[#2D1636] text-slate-600 dark:text-slate-300 hover:bg-[#F0D8FA]'
                          }`}
                        >
                          {ans ? (ans.isCorrect ? '✓' : '✗') : idx + 1}
                        </button>
                      )
                    })}
                  </div>

                  <span className="text-xs font-black text-[#8D49A6] dark:text-[#F17AE6]">
                    Soru {activeQuestion + 1} / {questions.length}
                  </span>
                </div>

                {/* 3. Soru Kutusu */}
                <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-[#FAF5FC] via-white to-[#F9F5FA] dark:from-[#261730] dark:via-[#1E1124] dark:to-[#17101C] border border-[#8D49A6]/30 dark:border-[#8D49A6]/50 shadow-xs">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#8D49A6] dark:text-[#E9D5FF]">
                      SORU {activeQuestion + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#E9D5FF]">
                      {qType === 'multiple'
                        ? '☑️ Çoklu Seçmeli'
                        : qType === 'boolean'
                        ? '⚖️ Doğru / Yanlış'
                        : qType === 'fill'
                        ? '✍️ Boşluk Doldurma'
                        : '🎯 Çoktan Seçmeli'}
                    </span>
                  </div>

                  {/* Soru Metni: Boşluk doldurma ise boşluk alanı vurgulu */}
                  {qType === 'fill' ? (
                    <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-950 dark:text-white leading-snug">
                      {curQ.text.includes('_______') ? (
                        <>
                          {curQ.text.split('_______')[0]}
                          <span
                            className={`inline-flex items-center px-3 py-0.5 mx-1.5 rounded-xl border-2 font-black transition-all ${
                              currentAnswer
                                ? currentAnswer.isCorrect
                                  ? 'bg-emerald-500 text-white border-emerald-400'
                                  : 'bg-rose-500 text-white border-rose-400'
                                : selectedFillWord
                                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300/40 animate-pulse'
                                : 'bg-purple-100 dark:bg-purple-950/70 border-dashed border-purple-500 text-purple-700 dark:text-purple-300'
                            }`}
                          >
                            {selectedFillWord || '_______ (Seçiniz)'}
                          </span>
                          {curQ.text.split('_______')[1]}
                        </>
                      ) : (
                        curQ.text
                      )}
                    </h3>
                  ) : (
                    <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-950 dark:text-white leading-snug">
                      {curQ.text}
                    </h3>
                  )}
                </div>

                {/* 4. TÜRE ÖZEL CEVAP SEÇİM ALANI */}

                {/* 4A. DOĞRU / YANLIŞ SEÇENEKLERİ */}
                {qType === 'boolean' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* DOĞRU BUTONU */}
                    {(() => {
                      const isSelected = currentAnswer?.selectedId === 'A'
                      const isCorrectChoice = (curQ.correctOptionId || 'A') === 'A'
                      const isAnswered = !!currentAnswer

                      let style =
                        'bg-white dark:bg-[#261730]/90 border-2 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                      if (isAnswered) {
                        if (isSelected) {
                          style = currentAnswer.isCorrect
                            ? 'bg-emerald-600 border-2 border-emerald-400 text-white shadow-xl shadow-emerald-600/30 ring-4 ring-emerald-400'
                            : 'bg-rose-600 border-2 border-rose-400 text-white shadow-xl shadow-rose-600/30 ring-4 ring-rose-400'
                        } else if (isCorrectChoice) {
                          style =
                            'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/40 animate-pulse'
                        } else {
                          style = 'opacity-40 border-slate-200 dark:border-slate-800'
                        }
                      }

                      return (
                        <motion.button
                          type="button"
                          whileHover={!isAnswered ? { scale: 1.01 } : {}}
                          whileTap={!isAnswered ? { scale: 0.99 } : {}}
                          onClick={() => handleSelectBoolean('A')}
                          disabled={isAnswered}
                          className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${style}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                              ✓
                            </div>
                            <div className="text-left">
                              <span className="block text-base sm:text-lg font-black">DOĞRU</span>
                              <span className="text-[11px] opacity-80 font-bold">Önerme doğru</span>
                            </div>
                          </div>
                          <span className="text-base font-black opacity-60">A</span>
                        </motion.button>
                      )
                    })()}

                    {/* YANLIŞ BUTONU */}
                    {(() => {
                      const isSelected = currentAnswer?.selectedId === 'B'
                      const isCorrectChoice = (curQ.correctOptionId || 'A') === 'B'
                      const isAnswered = !!currentAnswer

                      let style =
                        'bg-white dark:bg-[#261730]/90 border-2 border-rose-500/30 hover:border-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20'
                      if (isAnswered) {
                        if (isSelected) {
                          style = currentAnswer.isCorrect
                            ? 'bg-emerald-600 border-2 border-emerald-400 text-white shadow-xl shadow-emerald-600/30 ring-4 ring-emerald-400'
                            : 'bg-rose-600 border-2 border-rose-400 text-white shadow-xl shadow-rose-600/30 ring-4 ring-rose-400'
                        } else if (isCorrectChoice) {
                          style =
                            'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/40 animate-pulse'
                        } else {
                          style = 'opacity-40 border-slate-200 dark:border-slate-800'
                        }
                      }

                      return (
                        <motion.button
                          type="button"
                          whileHover={!isAnswered ? { scale: 1.01 } : {}}
                          whileTap={!isAnswered ? { scale: 0.99 } : {}}
                          onClick={() => handleSelectBoolean('B')}
                          disabled={isAnswered}
                          className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${style}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                              ✗
                            </div>
                            <div className="text-left">
                              <span className="block text-base sm:text-lg font-black">YANLIŞ</span>
                              <span className="text-[11px] opacity-80 font-bold">Önerme yanlış</span>
                            </div>
                          </div>
                          <span className="text-base font-black opacity-60">B</span>
                        </motion.button>
                      )
                    })()}
                  </div>
                )}

                {/* 4B. BOŞLUK DOLDURMA KELİME HAVUZU */}
                {qType === 'fill' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-800 flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs sm:text-sm font-black text-[#4B075F] dark:text-[#E9D5FF]">
                        Kelime Havuzundan Doğru Kelimeye Dokunun:
                      </span>
                      {selectedFillWord && !currentAnswer && (
                        <button
                          type="button"
                          onClick={handleConfirmFill}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs sm:text-sm font-black shadow-md hover:opacity-95 active:scale-95 cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <span>✓ Boşluğu Doldur & Onayla</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {curQ.options.map((opt) => {
                        const isSelected = selectedFillWord === opt.text
                        const isAnswered = !!currentAnswer
                        const targetAnswer = (
                          curQ.correctAnswerText ||
                          curQ.options.find((o) => o.id === curQ.correctOptionId)?.text ||
                          ''
                        )
                          .trim()
                          .toLowerCase()
                        const isCorrectWord = opt.text.trim().toLowerCase() === targetAnswer

                        let btnStyle =
                          'bg-white dark:bg-[#261730] border-2 border-[#E8DFEB] dark:border-[#49364F] hover:border-[#8D49A6]'
                        if (isAnswered) {
                          if (isSelected) {
                            btnStyle = currentAnswer.isCorrect
                              ? 'bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-400'
                              : 'bg-rose-600 text-white border-rose-400 ring-4 ring-rose-400'
                          } else if (isCorrectWord) {
                            btnStyle =
                              'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-2 border-emerald-500 animate-pulse'
                          } else {
                            btnStyle = 'opacity-40'
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-amber-400 text-slate-950 border-amber-500 ring-4 ring-amber-300'
                        }

                        return (
                          <motion.button
                            key={opt.id}
                            type="button"
                            whileHover={!isAnswered ? { scale: 1.02 } : {}}
                            whileTap={!isAnswered ? { scale: 0.98 } : {}}
                            onClick={() => handleSelectFillWord(opt.text)}
                            disabled={isAnswered}
                            className={`p-4 sm:p-5 rounded-2xl font-black text-base sm:text-lg text-center cursor-pointer transition-all shadow-xs ${btnStyle}`}
                          >
                            {opt.text}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 4C. ÇOKLU SEÇMELİ ŞIKLAR */}
                {qType === 'multiple' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex-wrap gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#4B075F] dark:text-[#E9D5FF]">
                        Doğru olduğunu düşündüğünüz tüm şıkları işaretleyin ({selectedMultipleIds.length} şık seçildi):
                      </span>
                      {!currentAnswer && (
                        <button
                          type="button"
                          disabled={selectedMultipleIds.length === 0}
                          onClick={handleConfirmMultiple}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-40 text-white text-xs sm:text-sm font-black shadow-md hover:opacity-95 active:scale-95 cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <span>✓ Seçimleri Onayla</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {curQ.options.map((opt) => {
                        const isSelected = selectedMultipleIds.includes(opt.id)
                        const targetIds = curQ.correctOptionIds || [curQ.correctOptionId || 'A']
                        const isTargetCorrect = targetIds.includes(opt.id)
                        const isAnswered = !!currentAnswer

                        let buttonStyle =
                          'bg-white dark:bg-[#261730]/90 text-slate-900 dark:text-white border-2 border-[#E8DFEB] dark:border-[#49364F]'
                        let badgeStyle =
                          'bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#E9D5FF]'

                        if (isAnswered) {
                          if (isSelected) {
                            if (isTargetCorrect) {
                              buttonStyle =
                                'bg-emerald-600 border-2 border-emerald-500 text-white ring-4 ring-emerald-400'
                              badgeStyle = 'bg-white text-emerald-700'
                            } else {
                              buttonStyle =
                                'bg-rose-600 border-2 border-rose-500 text-white ring-4 ring-rose-400'
                              badgeStyle = 'bg-white text-rose-700'
                            }
                          } else if (isTargetCorrect) {
                            buttonStyle =
                              'bg-emerald-500/15 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/40 animate-pulse'
                            badgeStyle = 'bg-emerald-600 text-white'
                          } else {
                            buttonStyle = 'opacity-40 border-slate-200 dark:border-slate-800'
                          }
                        } else if (isSelected) {
                          buttonStyle =
                            'bg-[#FAF5FC] dark:bg-[#350444] border-2 border-[#8D49A6] ring-4 ring-[#8D49A6]/20'
                          badgeStyle = 'bg-brand-gradient text-white shadow-xs'
                        }

                        return (
                          <motion.button
                            key={opt.id}
                            type="button"
                            whileHover={!isAnswered ? { scale: 1.01 } : {}}
                            whileTap={!isAnswered ? { scale: 0.99 } : {}}
                            onClick={() => handleToggleMultipleOption(opt.id)}
                            disabled={isAnswered}
                            className={`p-2.5 sm:p-3 rounded-xl flex items-center gap-3 transition-all text-left cursor-pointer ${buttonStyle}`}
                          >
                            <span
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs transition-colors ${badgeStyle}`}
                            >
                              {isAnswered && isSelected
                                ? isTargetCorrect
                                  ? '✓'
                                  : '✗'
                                : isAnswered && isTargetCorrect
                                ? '✓'
                                : isSelected
                                ? '✓ ' + opt.id
                                : opt.id}
                            </span>
                            <span className="text-xs sm:text-sm font-bold flex-1 leading-snug">
                              {opt.text}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 4D. ÇOKTAN SEÇMELİ ŞIKLAR (TEK DOĞRU) */}
                {qType === 'single' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                    {curQ.options.map((opt) => {
                      const isSelected = currentAnswer?.selectedId === opt.id
                      const isCorrectAnswer = opt.id === curQ.correctOptionId
                      const isAnswered = !!currentAnswer

                      let buttonStyle =
                        'bg-white dark:bg-[#261730]/90 text-slate-900 dark:text-white border-2 border-[#E8DFEB] dark:border-[#49364F] hover:border-[#8D49A6]'
                      let badgeStyle = 'bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#E9D5FF]'

                      if (isAnswered) {
                        if (isSelected) {
                          if (currentAnswer.isCorrect) {
                            buttonStyle =
                              'bg-emerald-600 border-2 border-emerald-500 text-white shadow-xl shadow-emerald-600/30 ring-4 ring-emerald-400 scale-[1.02]'
                            badgeStyle = 'bg-white text-emerald-700'
                          } else {
                            buttonStyle =
                              'bg-rose-600 border-2 border-rose-500 text-white shadow-xl shadow-rose-600/30 ring-4 ring-rose-400'
                            badgeStyle = 'bg-white text-rose-700'
                          }
                        } else if (isCorrectAnswer) {
                          buttonStyle =
                            'bg-emerald-500/15 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/40 animate-pulse'
                          badgeStyle = 'bg-emerald-600 text-white'
                        } else {
                          buttonStyle = 'opacity-40 border-slate-200 dark:border-slate-800'
                        }
                      }

                      return (
                        <motion.button
                          key={opt.id}
                          type="button"
                          whileHover={!isAnswered ? { scale: 1.01 } : {}}
                          whileTap={!isAnswered ? { scale: 0.99 } : {}}
                          onClick={() => handleSelectSingleOption(opt.id)}
                          disabled={isAnswered}
                          className={`p-2.5 sm:p-3 rounded-xl flex items-center gap-3 transition-all text-left cursor-pointer ${buttonStyle}`}
                        >
                          <span
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs transition-colors ${badgeStyle}`}
                          >
                            {isAnswered && isSelected
                              ? currentAnswer.isCorrect
                                ? '✓'
                                : '✗'
                              : isAnswered && isCorrectAnswer
                              ? '✓'
                              : opt.id}
                          </span>

                          <span className="text-xs sm:text-sm font-bold flex-1 leading-snug">
                            {opt.text}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                )}

                {/* 5. Cevaplama Sonuç Bildirim Alanı (Doğru / Yanlış Animasyonu) */}
                {currentAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`p-2.5 sm:p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      currentAnswer.isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0 ${
                          currentAnswer.isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      >
                        {currentAnswer.isCorrect ? '✓' : '✗'}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black">
                          {currentAnswer.isCorrect
                            ? `🎉 Harika! Doğru Cevap (${currentAnswer.studentName || 'Öğrenci'} Bildi)`
                            : `❌ Yanlış Cevap — ${
                                qType === 'multiple'
                                  ? `Doğru şıklar: ${(curQ.correctOptionIds || [curQ.correctOptionId || 'A']).join(', ')}`
                                  : qType === 'boolean'
                                  ? `Doğru cevap: ${(curQ.correctOptionId || 'A') === 'A' ? 'DOĞRU' : 'YANLIŞ'}`
                                  : qType === 'fill'
                                  ? `Doğru kelime: ${curQ.correctAnswerText || curQ.options.find((o) => o.id === curQ.correctOptionId)?.text}`
                                  : `Doğru seçenek: ${curQ.correctOptionId} şıkkı`
                              }`}
                        </h4>
                        <p className="text-[11px] sm:text-xs font-semibold opacity-90">
                          {currentAnswer.isCorrect
                            ? 'Tebrikler! Bir sonraki soruya geçildiğinde yeni öğrenci otomatik seçilecektir.'
                            : `${currentAnswer.studentName || 'Öğrenci'} için doğru çözüm sınıfla paylaşıldı.`}
                        </p>
                      </div>
                    </div>

                    {/* Next step button */}
                    {activeQuestion < questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setActiveQuestion((q) => q + 1)}
                        className="px-4 py-2 rounded-xl bg-brand-gradient text-white text-xs sm:text-sm font-black shadow hover:opacity-95 transition-all cursor-pointer shrink-0"
                      >
                        Sonraki Soru →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsFinished(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black shadow transition-all cursor-pointer shrink-0"
                      >
                        Sonuçları Gör 📊
                      </button>
                    )}
                  </motion.div>
                )}

                {/* Bottom navigation */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#E8DFEB] dark:border-[#49364F]">
                  <button
                    type="button"
                    disabled={activeQuestion === 0}
                    onClick={() => setActiveQuestion((q) => Math.max(0, q - 1))}
                    className="px-4 py-2 rounded-xl border border-[#E8DFEB] dark:border-[#49364F] text-xs sm:text-sm font-bold text-[#514458] dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                  >
                    ← Önceki Soru
                  </button>

                  <div className="text-xs font-bold text-slate-400">
                    Cevaplanan: {totalAnswered} / {questions.length}
                  </div>

                  {activeQuestion < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setActiveQuestion((q) => Math.min(questions.length - 1, q + 1))}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                    >
                      Geç →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsFinished(true)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                    >
                      Sınavı Tamamla ✓
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* ──────────────────────────────────────────────────────── */
              /* 6. DETAYLI SINAV SONU RAPORU VE ÖĞRENCİ LİSTESİ         */
              /* ──────────────────────────────────────────────────────── */
              <div className="space-y-6">
                {/* Celebration Hero */}
                <div className="text-center py-4 space-y-3">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/30">
                    <Trophy className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    Sınav Başarıyla Tamamlandı!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {className} sınıfı için interaktif sınav değerlendirmesi sonuçlandı.
                  </p>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30">
                    <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                      Doğru
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      {correctCount}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30">
                    <span className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400">
                      Yanlış
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
                      {incorrectCount}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-500/30">
                    <span className="text-xs font-bold uppercase text-[#8D49A6] dark:text-[#E9D5FF]">
                      Başarı Oranı
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-[#8D49A6] dark:text-[#E9D5FF] mt-1">
                      %{successPercentage}
                    </div>
                  </div>
                </div>

                {/* Kimler Bildi & Kimler Bilemedi Detaylı Listesi */}
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#8D49A6]" />
                    <span>Öğrenci Soru Değerlendirme Çizelgesi</span>
                  </h4>

                  <div className="space-y-2.5">
                    {questions.map((q, qIndex) => {
                      const res = questionAnswers[qIndex]
                      const student = res?.studentName || questionStudents[qIndex] || 'Belirlenmedi'
                      const isCorrect = res?.isCorrect
                      const questionType = q.type || 'single'

                      return (
                        <div
                          key={q.id || qIndex}
                          className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isCorrect
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/40'
                              : res
                              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-500/40'
                              : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center justify-center shrink-0">
                              #{qIndex + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                                  {q.text}
                                </p>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {questionType === 'multiple'
                                    ? 'Çoklu'
                                    : questionType === 'boolean'
                                    ? 'D/Y'
                                    : questionType === 'fill'
                                    ? 'Boşluk'
                                    : 'Test'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Cevaplayan Öğrenci: <strong className="text-slate-800 dark:text-slate-200">{student}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {res ? (
                              isCorrect ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs">
                                  ✓ Bildi ({res.summaryText || res.selectedId})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-600 text-white font-black text-xs">
                                  ✗ Bilemedi ({res.summaryText || res.selectedId})
                                </span>
                              )
                            ) : (
                              <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                                Yanıtlanmadı
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Summary Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8DFEB] dark:border-[#49364F]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFinished(false)
                      setQuestionAnswers({})
                      setQuestionStudents({})
                      setActiveQuestion(0)
                    }}
                    className="px-6 py-2.5 rounded-xl border border-[#E8DFEB] dark:border-[#49364F] text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    🔄 Sınavı Yeniden Başlat
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-brand-gradient text-white text-xs sm:text-sm font-black shadow-md hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    Pano Ekranına Dön ✓
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Interactive Mock Explore Modal
function MockExploreModal({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<string>('solar')

  const items = [
    {
      id: 'solar',
      title: 'Güneş Sistemi & 3D Gezegenler',
      category: 'Uzay & Astronomi',
      icon: '🪐',
      color: 'from-[#4B075F] to-[#8D49A6]',
      desc: 'Güneş Sistemi’ndeki 8 gezegenin yörüngelerini, kütlelerini ve özelliklerini 3 boyutlu simülasyonla inceleyin.',
      tags: ['Astronomi', '3D Model', 'İnteraktif']
    },
    {
      id: 'periodic',
      title: 'Periyodik Tablo & Element Laboratuvarı',
      category: 'Kimya',
      icon: '⚗️',
      color: 'from-[#620B79] to-[#8D49A6]',
      desc: '118 elementin elektron dizilimlerini, atom numaralarını ve reaksiyon türlerini dokunmatik ekranda deneyimleyin.',
      tags: ['Atom', 'Molekül', 'Deney']
    },
    {
      id: 'anatomy',
      title: 'İnsan Anatomisi & 3D Organlar',
      category: 'Biyoloji',
      icon: '🫀',
      color: 'from-[#8D49A6] to-[#D914C8]',
      desc: 'Kalp, beyin, iskelet ve kas sistemlerini katman katman açarak anatomi atlasında keşfe çıkın.',
      tags: ['Sağlık', 'Biyoloji', 'Sistemler']
    },
    {
      id: 'geometry',
      title: 'Geometrik Cisimler & Hacim Simülatörü',
      category: 'Matematik',
      icon: '📐',
      color: 'from-[#D914C8] to-[#F17AE6]',
      desc: 'Prizmalar, piramitler ve silindirlerin açınımlarını döndürerek hacim ve yüzey alanı bağıntılarını görün.',
      tags: ['Geometri', 'Hacim', '3 Boyut']
    }
  ]

  const activeModule = items.find((m) => m.id === activeTab) || items[0]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white/95 dark:bg-[#1E1124]/95 backdrop-blur-2xl border border-[#8D49A6]/30 dark:border-[#8D49A6]/50 shadow-2xl p-5 sm:p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E8DFEB] dark:border-[#49364F]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8D49A6] to-[#D914C8] text-white flex items-center justify-center shadow-md">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-[#241329] dark:text-white">
                      Oxonom Keşfet & İnteraktif Laboratuvar
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF5FC] dark:bg-[#350444] border border-[#E8DFEB] dark:border-[#49364F] text-[10px] font-black text-[#8D49A6] dark:text-[#E9D5FF]">
                      MOCK
                    </span>
                  </div>
                  <p className="text-xs text-[#716779] dark:text-[#C58ADB]">
                    Akıllı tahta için dokunmatik 3D simülasyon ve fen atölyeleri
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 dark:bg-[#2D1636] dark:hover:bg-rose-950/60 dark:text-slate-300 dark:hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of Modules */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
              {items.map((it) => {
                const isSelected = it.id === activeTab
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => setActiveTab(it.id)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF5FC] dark:bg-[#2D1636] border-[#8D49A6] shadow-sm ring-2 ring-[#8D49A6]/50'
                        : 'bg-white/80 dark:bg-[#211729]/80 border-[#E8DFEB] dark:border-[#49364F] hover:bg-[#FAF5FC]/60'
                    }`}
                  >
                    <span className="text-2xl">{it.icon}</span>
                    <span className="text-[11px] font-black text-[#241329] dark:text-white truncate w-full">
                      {it.category}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Active Module Detail Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FAF5FC] to-white dark:from-[#261730] dark:to-[#1C1024] border border-[#E8DFEB] dark:border-[#49364F] space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeModule.color} text-white flex items-center justify-center text-2xl shadow-md`}>
                  {activeModule.icon}
                </div>
                <div>
                  <h3 className="text-base font-black text-[#241329] dark:text-white">
                    {activeModule.title}
                  </h3>
                  <span className="text-xs font-bold text-[#8D49A6] dark:text-[#E9D5FF]">
                    {activeModule.category} Atölyesi
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#514458] dark:text-slate-300 leading-relaxed">
                {activeModule.desc}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                {activeModule.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#350444] border border-[#E8DFEB] dark:border-[#49364F] text-[10.5px] font-bold text-[#4B075F] dark:text-[#E9D5FF]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => toast.success(`${activeModule.title} simülasyonu başlatıldı! (Mock)`)}
                  className="px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
                >
                  Simülasyonu Başlat 🚀
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// MAIN PANO COMPONENT
export default function PanoClient() {
  const router = useRouter()
  const params = useParams() as any
  const session = useLHSession() as any
  const org = useOrg() as any
  const [pairedSession, setPairedSession] = useState<TeacherPairData | null>(null)
  const orgslug = params?.orgslug || pairedSession?.orgSlug || org?.org_slug || 'oxonom'
  const user = session?.data?.user

  // Check role: Pano is strictly for teachers!
  const email = (user?.email || '').toLowerCase()
  const userRole = (user?.role || '').toLowerCase()
  const roles = session?.data?.roles || []
  const isTeacher = email.includes('ogretmen') || userRole === 'teacher' || roles.some((r: any) => r?.role?.name?.toLowerCase() === 'teacher')
  const isStudent = email.includes('ogrenci') || userRole === 'student' || roles.some((r: any) => r?.role?.name?.toLowerCase() === 'student')
  const isAdmin = (user?.is_superadmin || email.includes('idare') || email.includes('admin') || userRole === 'admin' || userRole === 'manager') && !email.includes('ogretmen')

  const effectiveUser = pairedSession || user
  const displayName =
    (effectiveUser?.first_name ? `${effectiveUser.first_name} ${effectiveUser.last_name || ''}`.trim() : '') ||
    effectiveUser?.full_name ||
    effectiveUser?.name ||
    (isAdmin ? 'Yönetici' : isStudent ? 'Öğrenci' : 'Öğretmen') ||
    effectiveUser?.username ||
    'Kullanıcı'

  // Settings State
  const [settings, setSettings] = useState<PanoSettings>(DEFAULT_SETTINGS)
  // Paired Session Management (Standby Screen & QR/OTP Pairing)
  const [isSessionHydrated, setIsSessionHydrated] = useState(false)
  const [forceStandby, setForceStandby] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oxonom_pano_force_standby') === 'true'
    }
    return false
  })
  const searchParams = useSearchParams()

  // Active Pano Session ID for shared state sync
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const qSession = searchParams?.get('session')
      const storedSession = localStorage.getItem('oxonom_pano_active_session_id')
      if (qSession) {
        if (storedSession !== qSession) {
          localStorage.removeItem('oxonom_pano_selected_class_id')
        }
        localStorage.setItem('oxonom_pano_active_session_id', qSession)
        return qSession
      }
      return storedSession
    }
    return null
  })

  // Active Paired Board Session from Principal Portal (Multi-Tenant)
  const [pairedBoard, setPairedBoard] = useState<BoardPairingInfo | null>(() => {
    if (typeof window !== 'undefined') {
      return getActivePairedBoardSession()
    }
    return null
  })

  // Classrooms list
  const [classrooms, setClassrooms] = useState<ClassroomItem[]>(DEFAULT_CLASSROOMS)

  // Hardware Board & Pano ID (supports short clean path /pano/1A-01 or legacy query ?id=1A-01)
  const routeBoardId = (params?.boardId as string) || (params?.id as string) || ''
  const rawIdParam = routeBoardId || searchParams?.get('id') || searchParams?.get('boardId') || ''
  const panoIdParam = searchParams?.get('panoId') || ''
  const tahtaIdParam = searchParams?.get('tahtaId') || searchParams?.get('boardNo') || ''

  // Auto-pair if code is provided in URL query (?code=... or ?board=... or /pano/PANO-4A-8392)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const qCode = (searchParams?.get('code') || searchParams?.get('board') || rawIdParam || '').trim()
    if (qCode && (!pairedBoard || pairedBoard.code.toUpperCase() !== qCode.toUpperCase())) {
      const res = pairBoardWithCode(qCode)
      if (res.success && res.board) {
        setPairedBoard(res.board)
      }
    }
  }, [searchParams, rawIdParam, pairedBoard])

  // Multi-window & live storage sync for paired board updates
  useEffect(() => {
    const handleBoardSync = () => {
      const current = getActivePairedBoardSession()
      setPairedBoard(current)
    }
    window.addEventListener('oxonom_boards_updated', handleBoardSync)
    window.addEventListener('storage', handleBoardSync)
    return () => {
      window.removeEventListener('oxonom_boards_updated', handleBoardSync)
      window.removeEventListener('storage', handleBoardSync)
    }
  }, [])


  const resolveBoardIdentity = useCallback((rawInput?: string, pInput?: string, tInput?: string): { panoId: string; boardNo: string } => {
    let pano = '1A'
    let board = '01'
    const candidate = (rawInput || (typeof window !== 'undefined' ? localStorage.getItem('oxonom_active_board_id') : '') || '1A-01').trim()
    const clean = decodeURIComponent(candidate).toUpperCase()

    if (clean.includes('-')) {
      const parts = clean.split('-').filter(Boolean)
      if (parts.length >= 3 && /^[1-9][0-9]?$/.test(parts[0]) && /^[A-Z]$/.test(parts[1])) {
        pano = `${parts[0]}${parts[1]}`
        board = parts.slice(2).join('-') || '01'
      } else if (parts.length === 2 && /^[1-9][0-9]?$/.test(parts[0]) && /^[A-Z]$/.test(parts[1])) {
        pano = `${parts[0]}${parts[1]}`
        board = '01'
      } else if (parts.length >= 2) {
        pano = parts[0]
        board = parts.slice(1).join('-') || '01'
      } else {
        pano = parts[0] || '1A'
        board = '01'
      }
    } else {
      const matchWithNum = clean.match(/^([1-9][0-9]?[A-Z])([0-9]{2})$/)
      if (matchWithNum) {
        pano = matchWithNum[1]
        board = matchWithNum[2]
      } else {
        pano = clean || '1A'
        board = '01'
      }
    }

    if (pInput) pano = pInput.trim().toUpperCase()
    if (tInput) board = tInput.trim().toUpperCase()

    return { panoId: pano, boardNo: board }
  }, [])

  const [boardIdentity, setBoardIdentity] = useState<{ panoId: string; boardNo: string }>(() => {
    return resolveBoardIdentity(rawIdParam, panoIdParam, tahtaIdParam)
  })

  useEffect(() => {
    if (rawIdParam || panoIdParam || tahtaIdParam) {
      const resolved = resolveBoardIdentity(rawIdParam, panoIdParam, tahtaIdParam)
      setBoardIdentity(resolved)
      if (typeof window !== 'undefined') {
        localStorage.setItem('oxonom_active_board_id', `${resolved.panoId}-${resolved.boardNo}`)
      }
    }
  }, [rawIdParam, panoIdParam, tahtaIdParam, resolveBoardIdentity])


  // Prevent any lingering dark mode class on document.documentElement from affecting the rest of the site
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Handle remote session termination (logout on either device)
  const handleRemoteSessionClosed = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oxonom_pano_paired_session')
      localStorage.removeItem('oxonom_pano_active_session_id')
      localStorage.removeItem('oxonom_pano_is_locked')
      localStorage.removeItem('oxonom_pano_selected_class_id')
      localStorage.removeItem('oxonom_pano_device_token')
      localStorage.setItem('oxonom_pano_force_standby', 'true')
    }

    if (typeof document !== 'undefined') {
      document.cookie = 'LH_session=; path=/; max-age=0'
      document.cookie = 'LH_org=; path=/; max-age=0'
    }

    setPairedSession(null)
    setActiveSessionId(null)
    sessionInitializedRef.current = false
    setForceStandby(true)
    setIsProfileOpen(false)

    const isCurrentPhone = searchParams?.get('device') === 'phone' || (typeof window !== 'undefined' && (sessionStorage.getItem('oxonom_pano_device_type') === 'phone' || localStorage.getItem('oxonom_pano_device_type') === 'phone'))
    if (isCurrentPhone) {
      toast('Akıllı tahta oturumu sonlandırıldı.', { icon: 'ℹ️' })
      router.push('/dash/connect-board')
    } else {
      toast('Öğretmen oturumu kapattı.', { icon: 'ℹ️' })
    }

    if (session?.update) {
      session.update(true).catch(() => {})
    }
  }, [router, searchParams, session])

  // Board UI State Hook (local-only — no remote sync)
  const {
    selectedClass,
    setSelectedClass,
    openWindows,
    setOpenWindows,
    activeWindowId,
    setActiveWindowId,
    activeWindow,
    isLocked,
    setIsLocked,
    isClassModalOpen,
    setIsClassModalOpen,
    isNewBoardModalOpen,
    setIsNewBoardModalOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    dispatch,
    handleSelectClass,
    openAppInWindow,
    handleCloseWindow,
    handleToggleMaximizeWindow,
    handleReloadWindow,
    lockPano,
    unlockPano,
    handleToggleBoardLockFromPhone,
  } = usePanoSync({
    activeSessionId,
    classrooms,
    defaultClassrooms: DEFAULT_CLASSROOMS,
    onSessionClosed: handleRemoteSessionClosed,
    onClassrooms: setClassrooms,
  })

  // Synchronize boardIdentity strictly whenever selectedClass changes so that each class branch has its own isolated, persistent board
  useEffect(() => {
    if (!selectedClass) return
    const targetBoard = getClassBoardIdentity(selectedClass)
    if (boardIdentity.panoId !== targetBoard.panoId || boardIdentity.boardNo !== targetBoard.boardNo) {
      setBoardIdentity(targetBoard)
      if (typeof window !== 'undefined') {
        const fullId = `${targetBoard.panoId}-${targetBoard.boardNo}`
        localStorage.setItem('oxonom_active_board_id', fullId)
        localStorage.setItem('oxonom_pano_selected_class_id', String(selectedClass.id))
        // Silently update browser URL if on /pano/[boardId] or /pano without triggering a page reload
        if (window.location.pathname.startsWith('/pano') && !window.location.pathname.endsWith('/tahta')) {
          const currentUrl = new URL(window.location.href)
          window.history.replaceState({}, '', `/pano/${encodeURIComponent(fullId)}${currentUrl.search}`)
        }
      }
    }
  }, [selectedClass, boardIdentity.panoId, boardIdentity.boardNo])

  // Keep selectedClass properties (studentCount, subject, schoolName, attendance) in sync with live classroom data
  useEffect(() => {
    if (!selectedClass) return
    const norm = normalizeClassCode(selectedClass.code || selectedClass.name)
    const liveCls = classrooms.find(c => normalizeClassCode(c.code || c.name) === norm)
    if (liveCls && (
      selectedClass.studentCount !== liveCls.studentCount ||
      selectedClass.subject !== liveCls.subject ||
      selectedClass.attendance !== liveCls.attendance ||
      selectedClass.schoolName !== liveCls.schoolName
    )) {
      setSelectedClass(prev => prev ? {
        ...prev,
        studentCount: liveCls.studentCount,
        subject: liveCls.subject,
        attendance: liveCls.attendance,
        schoolName: liveCls.schoolName,
      } : prev)
    }
  }, [classrooms, selectedClass, setSelectedClass])

  // Board is always the board — no phone remote control mode
  const isPhone = false
  const connectionStatus = 'connected' as const

  // Handle successful pairing from Standby Screen - isolates device strictly to mobile teacher session
  const handlePaired = async (teacherData: TeacherPairData) => {
    sessionInitializedRef.current = true
    setPairedSession(teacherData)
    setIsPhoneConnected(true)
    setForceStandby(false)

    const sId = (teacherData as any).sessionId || searchParams?.get('session') || ''
    if (sId) {
      setActiveSessionId(sId)
    }

    // Isolate device session strictly to mobile teacher: clear stale sessions & establish teacher session
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oxonom_pano_force_standby')
      if (sId) {
        localStorage.setItem('oxonom_pano_active_session_id', sId)
      }
      localStorage.setItem('oxonom_pano_paired_session', JSON.stringify(teacherData))
      if (teacherData.settings) {
        localStorage.setItem('oxonom_pano_settings', JSON.stringify(teacherData.settings))
      }
      localStorage.removeItem('oxonom_active_admin_session')
      localStorage.removeItem('oxonom_admin_session')
      localStorage.removeItem('admin_user')
      localStorage.removeItem('learnhouse_admin_session')
      try {
        const bc = new BroadcastChannel('learnhouse_auth_sync')
        bc.postMessage({ type: 'LOGIN' })
        bc.close()
      } catch (_) {}
    }

    if (teacherData.settings) {
      setSettings(teacherData.settings)
    } else if (teacherData.lock_pin) {
      setSettings(prev => ({ ...prev, pin: teacherData.lock_pin || '' }))
    }

    if (teacherData.classrooms && Array.isArray(teacherData.classrooms) && teacherData.classrooms.length > 0) {
      setClassrooms(teacherData.classrooms)
    }

    // Mandatory class selection: do not auto-select any class on pairing
    setSelectedClass(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oxonom_pano_selected_class_id')
    }

    setIsLocked(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oxonom_pano_is_locked')
    }

    // Set client-side cookies immediately
    if (typeof document !== 'undefined') {
      const oSlug = teacherData.orgSlug || 'oxonom'
      document.cookie = `LH_session=1; path=/; max-age=2592000; SameSite=Lax`
      document.cookie = `LH_org=${oSlug}; path=/; max-age=2592000; SameSite=Lax`
    }

    // Call claim endpoint to ensure HTTP-only auth cookies (LH_access, LH_refresh) are firmly established
    try {
      await fetch('/api/pano/pair/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherData }),
      })
    } catch (_) {}

    // Update active React session context
    if (session?.update) {
      session.update(true).catch(() => {})
    }

    toast.success(`Hoş geldiniz Sayın ${teacherData.first_name || teacherData.username || 'Öğretmenim'}!`)
  }

  // Logout modal state: 'closed' | 'ask_save' | 'confirm_discard'
  const [logoutModalStep, setLogoutModalStep] = useState<'closed' | 'ask_save' | 'confirm_discard'>('closed')
  const [isSavingBoard, setIsSavingBoard] = useState(false)

  // Completely logs out of the device, server session, and clears all cookies
  const executeFullDeviceLogout = async () => {
    try {
      if (activeSessionId) {
        await fetch('/api/pano/pair/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: activeSessionId, target: 'both' }),
        })
      }
    } catch (_) {}

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (_) {}

    // Wipe all browser cookies and auth caches completely
    clearAllClientAuthCookies()

    if (typeof window !== 'undefined') {
      localStorage.removeItem('oxonom_pano_paired_session')
      localStorage.removeItem('oxonom_pano_active_session_id')
      localStorage.removeItem('oxonom_pano_is_locked')
      localStorage.removeItem('oxonom_pano_selected_class_id')
      localStorage.removeItem('oxonom_selected_class')
      localStorage.removeItem('oxonom_active_admin_session')
      localStorage.removeItem('oxonom_admin_session')
      localStorage.removeItem('admin_user')
      localStorage.removeItem('learnhouse_admin_session')
      localStorage.setItem('oxonom_pano_force_standby', 'true')

      try {
        const bc = new BroadcastChannel('learnhouse_auth_sync')
        bc.postMessage({ type: 'LOGOUT' })
        bc.close()
      } catch (_) {}

      window.dispatchEvent(new Event('oxonom_pano_sync'))
      window.dispatchEvent(new Event('storage'))
    }

    disconnectActiveBoard()
    setPairedBoard(null)
    setPairedSession(null)
    setActiveSessionId(null)
    setSelectedClass(null)
    setOpenWindows([])
    setActiveWindowId(null)
    setIsLocked(false)
    setIsProfileOpen(false)
    sessionInitializedRef.current = false
    setForceStandby(true)

    if (session?.update) {
      session.update(true).catch(() => {})
    }

    toast.success('Pano ve cihaz oturumu tamamen kapatıldı.')

    // Complete hard reload/redirect to /pano so the browser memory & iframes cleanly reset
    if (typeof window !== 'undefined') {
      window.location.href = '/pano'
    }
  }

  // Save current board to classroom history and perform full device logout
  const handleSaveAndLogout = async () => {
    setIsSavingBoard(true)
    try {
      const cls = selectedClassRef.current || selectedClass
      const targetClassName = cls?.name || 'Sınıf'
      const targetClassId = cls?.id || 1
      const now = new Date()
      const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      const boardTitle = `${targetClassName} - Canlı Ders Tahtası (${dateStr})`
      const boardId = `board_${Date.now()}`

      if (typeof window !== 'undefined') {
        // 1. Save into oxonom_custom_boards (Classroom Board History)
        try {
          const rawCustom = localStorage.getItem('oxonom_custom_boards')
          const existingCustom = rawCustom ? JSON.parse(rawCustom) : []
          const newCustomBoard = {
            id: Date.now(),
            board_uuid: boardId,
            name: boardTitle,
            board_date: now.toISOString().split('T')[0],
            date: dateStr,
            time: timeStr,
            usergroup_id: targetClassId,
            className: targetClassName,
            teacher_name: displayName,
            createdAt: Date.now(),
            lastOpenedAt: Date.now(),
          }
          localStorage.setItem('oxonom_custom_boards', JSON.stringify([newCustomBoard, ...existingCustom]))
        } catch (_) {}

        // 2. Save into oxonom_m_boards (Mobile Quick Access and Boards View)
        try {
          const rawM = localStorage.getItem('oxonom_m_boards')
          const existingM = rawM ? JSON.parse(rawM) : []
          const newMBoard = {
            id: boardId,
            title: boardTitle,
            subject: 'SINIF PANOSU',
            subjectLabel: 'Ders Tahtası',
            description: `${targetClassName} akıllı tahtasında işlenen ve kaydedilen ders çizimleri`,
            teacherName: displayName,
            date: dateStr,
            time: timeStr,
            studentCount: cls?.studentCount || 28,
            className: targetClassName,
            isOpen: false,
            url: `/board/${boardId}`,
            isPublic: true,
            hasPin: false,
            accentColor: '#10B981',
            createdAt: Date.now(),
            lastOpenedAt: Date.now(),
            usergroupId: targetClassId,
          }
          localStorage.setItem('oxonom_m_boards', JSON.stringify([newMBoard, ...existingM]))
        } catch (_) {}

        // 3. Update Classroom board counts in UI
        if (cls) {
          setSelectedClass((prev: any) => prev ? ({ ...prev, boardCount: (prev.boardCount || 0) + 1 }) : null)
          setClassrooms((prev: any) => prev.map((c: any) => c.id === cls.id ? { ...c, boardCount: (c.boardCount || 0) + 1 } : c))
        }

        // 4. Notify all tabs & devices
        window.dispatchEvent(new Event('oxonom_pano_sync'))
        window.dispatchEvent(new Event('storage'))
      }

      // 5. Backend board creation call (non-blocking)
      try {
        if (org?.id) {
          await createBoard(org.id, {
            name: boardTitle,
            board_date: now.toISOString().split('T')[0],
            usergroup_id: targetClassId,
          }).catch(() => {})
        }
      } catch (_) {}

      toast.success('Ders tahtanız sınıf geçmişine kaydedildi! 🎨✨')
    } catch (e) {
      console.error('Error saving board before logout:', e)
    } finally {
      setIsSavingBoard(false)
      setLogoutModalStep('closed')
      await executeFullDeviceLogout()
    }
  }

  // Discard changes and perform full device logout
  const handleDiscardAndLogout = async () => {
    setLogoutModalStep('closed')
    toast('Tahta kaydedilmeden çıkış yapıldı.', { icon: '👋' })
    await executeFullDeviceLogout()
  }

  // Intercept normal logout triggers and open the cute modal
  const handleLogout = () => {
    setIsProfileOpen(false)
    setLogoutModalStep('ask_save')
  }


  // Load Saved Settings & Selected Class from localStorage (strictly ONCE on initial mount)
  const initialMountHydratedRef = useRef(false)
  useEffect(() => {
    if (initialMountHydratedRef.current) return
    initialMountHydratedRef.current = true

    if (typeof window !== 'undefined') {
      const savedPair = localStorage.getItem('oxonom_pano_paired_session')
      if (savedPair) {
        try {
          const parsed: TeacherPairData = JSON.parse(savedPair)
          setPairedSession(parsed)
          if (parsed.settings) {
            setSettings(parsed.settings)
          } else if (parsed.lock_pin) {
            setSettings(prev => ({ ...prev, pin: parsed.lock_pin || '' }))
          }
          if (parsed.classrooms && Array.isArray(parsed.classrooms) && parsed.classrooms.length > 0) {
            setClassrooms(parsed.classrooms)
          }

          // Ensure cookies are intact on the board browser even after browser restart
          const hasMarker = document.cookie.split('; ').some((c) => c.startsWith('LH_session='))
          if (!hasMarker) {
            fetch('/api/pano/pair/claim', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ teacherData: parsed }),
            }).then(() => {
              const oSlug = parsed.orgSlug || 'oxonom'
              document.cookie = `LH_session=1; path=/; max-age=2592000; SameSite=Lax`
              document.cookie = `LH_org=${oSlug}; path=/; max-age=2592000; SameSite=Lax`
              if (session?.update) session.update(true).catch(() => {})
            }).catch(() => {})
          }
        } catch (_) {}
      }
      setIsSessionHydrated(true)

      const saved = localStorage.getItem('oxonom_pano_settings')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.quotes && Array.isArray(parsed.quotes)) {
            parsed.quotes = parsed.quotes.map(normalizeQuote)
          }
          setSettings(parsed)
        } catch (_) {}
      } else {
        const legacyPin = localStorage.getItem('oxonom_pano_lock_pin')
        if (legacyPin) {
          setSettings(prev => ({ ...prev, pin: legacyPin }))
        }
      }

      const savedClassId = localStorage.getItem('oxonom_pano_selected_class_id')
      let foundClass: ClassroomItem | null = null

      // Priority 1: If an explicit boardId is in the URL (e.g. /pano/2B-01), match that classroom first
      if (rawIdParam) {
        const resolved = resolveBoardIdentity(rawIdParam, panoIdParam, tahtaIdParam)
        const normPano = resolved.panoId.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
        foundClass = classrooms.find((c) => {
          const normName = c.name.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
          const normCode = (c.gradeLevel || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase()
          return normName.includes(normPano) || normPano.includes(normName) || normCode.includes(normPano)
        }) || null
      }

      // Priority 2: Check saved selected class ID
      if (!foundClass && savedClassId) {
        let teacherClasses = classrooms
        if (savedPair) {
          try {
            const p = JSON.parse(savedPair)
            if (p.classrooms && Array.isArray(p.classrooms) && p.classrooms.length > 0) {
              teacherClasses = p.classrooms
            }
          } catch (_) {}
        }
        foundClass = teacherClasses.find((c: ClassroomItem) => c.id === Number(savedClassId)) || null
      }

      // Priority 3: Check global selected class
      if (!foundClass) {
        try {
          const globalSaved = localStorage.getItem('oxonom_selected_class')
          if (globalSaved) {
            const parsed = JSON.parse(globalSaved)
            foundClass = classrooms.find((c) => c.id === parsed.id || c.name === parsed.name || (parsed.code && c.name?.includes(parsed.code))) || null
          }
        } catch (_) {}
      }

      // Priority 4: Fallback match with boardIdentity
      if (!foundClass && boardIdentity?.panoId) {
        const normPano = boardIdentity.panoId.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
        foundClass = classrooms.find((c) => {
          const normName = c.name.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
          return normName.includes(normPano) || normPano.includes(normName)
        }) || null
      }

      const initialClass = foundClass || classrooms[0] || null
      setSelectedClass(initialClass)
      if (initialClass) {
        const targetBoard = getClassBoardIdentity(initialClass)
        setBoardIdentity(targetBoard)
        if (typeof window !== 'undefined') {
          localStorage.setItem('oxonom_active_board_id', `${targetBoard.panoId}-${targetBoard.boardNo}`)
          localStorage.setItem('oxonom_pano_selected_class_id', String(initialClass.id))
        }
      }
    }
  }, [])

  const saveSettings = (newSettings: PanoSettings) => {
    setSettings(newSettings)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_pano_settings', JSON.stringify(newSettings))
    }
  }


  // User Activity Tracker for Auto-Lock
  const lastActivityRef = useRef<number>(Date.now())

  const recordActivity = () => {
    lastActivityRef.current = Date.now()
  }

  // Reset activity on lock change (unlocking resets timer)
  useEffect(() => {
    if (!isLocked) {
      lastActivityRef.current = Date.now()
    }
  }, [isLocked])

  // Inactivity Auto-Lock Timer: Strictly locks only if untouched for the full duration
  useEffect(() => {
    if (!settings.idleTimeout || settings.idleTimeout <= 0 || isLocked) return

    const events = [
      'mousemove',
      'mousedown',
      'mouseup',
      'pointermove',
      'pointerdown',
      'pointerup',
      'touchstart',
      'touchmove',
      'touchend',
      'keydown',
      'keyup',
      'keypress',
      'scroll',
      'wheel',
      'click',
      'dblclick',
      'contextmenu',
      'focus'
    ]

    const handleUserAction = () => {
      lastActivityRef.current = Date.now()
    }

    events.forEach(ev => {
      window.addEventListener(ev, handleUserAction, { capture: true, passive: true })
    })

    // Periodic check every 1 second
    const interval = setInterval(() => {
      if (isLocked) return
      const elapsedSeconds = (Date.now() - lastActivityRef.current) / 1000
      if (elapsedSeconds >= settings.idleTimeout) {
        lockPano()
      }
    }, 1000)

    return () => {
      clearInterval(interval)
      events.forEach(ev => {
        window.removeEventListener(ev, handleUserAction, { capture: true } as any)
      })
    }
  }, [settings.idleTimeout, isLocked])



  // Native Fullscreen State & Auto-Fullscreen on load / first touch
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    const triggerAutoFullscreen = () => {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {})
      }
    }

    // Try immediately on mount
    triggerAutoFullscreen()

    // Also trigger on first user touch/click if restricted by browser security policy
    window.addEventListener('pointerdown', triggerAutoFullscreen, { once: true })

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      window.removeEventListener('pointerdown', triggerAutoFullscreen)
    }
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen toggle error:', err)
    }
  }

  // Global D-pad / Keyboard Back & Escape Listener
  useEffect(() => {
    const handleGlobalBackEscape = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs
      const active = document.activeElement
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) {
        if (e.key === 'Escape') {
          ;(active as HTMLElement).blur()
        }
        return
      }

      if (e.key === 'Escape') {
        if (isClassModalOpen || isNewBoardModalOpen || isSettingsOpen) {
          e.preventDefault()
          dispatch({ type: 'CLOSE_MODAL' })
        } else if (activeWindowId) {
          e.preventDefault()
          handleCloseWindow(activeWindowId)
        }
      }
    }

    window.addEventListener('keydown', handleGlobalBackEscape)
    return () => window.removeEventListener('keydown', handleGlobalBackEscape)
  }, [isClassModalOpen, isNewBoardModalOpen, isSettingsOpen, activeWindowId, dispatch])

  // Auto-fullscreen on load / first touch
  useEffect(() => {
    const triggerFullscreen = async () => {
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen()
        } catch (_) {}
      }
      window.removeEventListener('pointerdown', triggerFullscreen)
      window.removeEventListener('touchstart', triggerFullscreen)
      window.removeEventListener('click', triggerFullscreen)
    }

    // Try immediately on mount (works in kiosk modes / PWAs)
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {})
      }
    } catch (_) {}

    // Auto-trigger on first interaction
    window.addEventListener('pointerdown', triggerFullscreen, { once: true, passive: true })
    window.addEventListener('touchstart', triggerFullscreen, { once: true, passive: true })
    window.addEventListener('click', triggerFullscreen, { once: true, passive: true })

    return () => {
      window.removeEventListener('pointerdown', triggerFullscreen)
      window.removeEventListener('touchstart', triggerFullscreen)
      window.removeEventListener('click', triggerFullscreen)
    }
  }, [])

  // Zoom Prevention (Touchscreens, Smartboards & Desktop Pinch/Wheel Zoom)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault()
      }
    }

    const handleGesture = (e: Event) => {
      e.preventDefault()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
        e.preventDefault()
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('gesturestart', handleGesture, { passive: false })
    window.addEventListener('gesturechange', handleGesture, { passive: false })
    window.addEventListener('gestureend', handleGesture, { passive: false })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('gesturestart', handleGesture)
      window.removeEventListener('gesturechange', handleGesture)
      window.removeEventListener('gestureend', handleGesture)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleNewBoardCreated = (createdBoard: any) => {
    if (!selectedClass) return
    const cleanUuid = (createdBoard.board_uuid || `board_${createdBoard.id}`).replace('board_', '')
    setSelectedClass(prev => prev ? ({
      ...prev,
      boardCount: (prev.boardCount || 0) + 1
    }) : null)
    setClassrooms(prev => prev.map(c => c.id === selectedClass.id ? { ...c, boardCount: (c.boardCount || 0) + 1 } : c))

    dispatch({
      type: 'OPEN_APP',
      app: {
        id: `board_${cleanUuid}`,
        type: 'app',
        title: `${createdBoard.name} (${selectedClass.name})`,
        icon: 'Board',
        color: 'bg-blue-600',
        iconColor: 'text-white',
        path: `/board/${cleanUuid}`
      }
    })
  }

  // TopBar Profile Dropdown State
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Disconnect active paired board (flips status back to offline / red in Principal portal)
  const handleDisconnectBoard = useCallback(() => {
    if (
      confirm(
        `"${pairedBoard?.name || 'Pano'}" bağlantısını sonlandırmak ve panoyu çevrimdışı (kırmızı) yapmak istediğinize emin misiniz?`
      )
    ) {
      disconnectActiveBoard()
      setPairedBoard(null)
      setSelectedClass(null)
      setIsProfileOpen(false)
      toast.success('Pano oturumu kapatıldı. Pano pasif duruma alındı.')
    }
  }, [pairedBoard, setSelectedClass])

  // Synchronize multi-tenant school classes and auto-select assigned classroom when paired
  useEffect(() => {
    if (!pairedBoard) return

    // 1. Try loading isolated classes for this school
    const tenantClasses = getTenantClasses(pairedBoard.schoolCode)
    if (Array.isArray(tenantClasses) && tenantClasses.length > 0) {
      const formattedClasses: ClassroomItem[] = tenantClasses.map((c: any, idx: number) => {
        const numericId = typeof c.id === 'number' ? c.id : (parseInt(String(c.id).replace(/\D/g, ''), 10) || (idx + 101))
        return {
          id: numericId,
          name: c.name || c.code || String(c.id),
          code: c.code || c.name,
          gradeLevel: c.grade_level || c.name.match(/\d+/)?.[0] || '1',
          studentCount: c.student_count || c.students?.length || 24,
          boardCount: 1,
          attendance: 'Alınmadı',
          teacherName: c.teacher_name || 'Sınıf Öğretmeni',
          subject: c.subject || 'Derslik',
          schoolName: pairedBoard.schoolName,
        }
      })
      setClassrooms(formattedClasses)

      if (pairedBoard.classroom) {
        const normTarget = normalizeClassCode(pairedBoard.classroom)
        const match = formattedClasses.find(
          (cls) => normalizeClassCode(cls.code || cls.name) === normTarget
        )
        if (match) {
          setSelectedClass(match)
        } else {
          const autoId = parseInt(pairedBoard.classroom.replace(/\D/g, ''), 10) || 901
          const autoItem: ClassroomItem = {
            id: autoId,
            name: `${pairedBoard.classroom} Sınıfı`,
            code: pairedBoard.classroom,
            gradeLevel: pairedBoard.classroom.match(/\d+/)?.[0] || '1',
            studentCount: 24,
            boardCount: 1,
            attendance: 'Alınmadı',
            teacherName: 'Sınıf Öğretmeni',
            subject: 'Sınıf Dersi',
            schoolName: pairedBoard.schoolName,
          }
          setClassrooms([autoItem, ...formattedClasses])
          setSelectedClass(autoItem)
        }
      }
    } else if (pairedBoard.classroom) {
      const singleId = parseInt(pairedBoard.classroom.replace(/\D/g, ''), 10) || 901
      const singleItem: ClassroomItem = {
        id: singleId,
        name: `${pairedBoard.classroom} Sınıfı`,
        code: pairedBoard.classroom,
        gradeLevel: pairedBoard.classroom.match(/\d+/)?.[0] || '1',
        studentCount: 24,
        boardCount: 1,
        attendance: 'Alınmadı',
        teacherName: 'Sınıf Öğretmeni',
        subject: 'Sınıf Dersi',
        schoolName: pairedBoard.schoolName,
      }
      setClassrooms([singleItem])
      setSelectedClass(singleItem)
    }
  }, [pairedBoard, setSelectedClass])

  // Live Dynamic Class Stats (User Rule: "Pano ekranında veriler hep güncel olmalı sayfayı yenilemek gerekmemeli")
  const [dataSyncTrigger, setDataSyncTrigger] = useState(0)

  useEffect(() => {
    const handleSync = () => {
      setDataSyncTrigger((prev) => prev + 1)
      setClassrooms(buildPanoClassrooms())
    }

    // Custom App Events
    window.addEventListener('oxonom_assignments_updated', handleSync)
    window.addEventListener('oxonom_boards_updated', handleSync)
    window.addEventListener('oxonom_attendance_updated', handleSync)
    window.addEventListener('oxonom_pano_sync', handleSync)
    window.addEventListener('oxonom_student_updated', handleSync)
    window.addEventListener('oxonom_admin_students_updated', handleSync)
    window.addEventListener('oxonom_school_updated', handleSync)
    window.addEventListener('oxonom_principal_updated', handleSync)

    // Storage Event (catches changes made by child iframes or other tabs to localStorage)
    const handleStorage = (e: StorageEvent) => {
      if (
        !e.key ||
        e.key.includes('board') ||
        e.key.includes('assignment') ||
        e.key.includes('attendance') ||
        e.key.includes('student') ||
        e.key.includes('school') ||
        e.key.includes('principal') ||
        e.key.includes('pano')
      ) {
        handleSync()
      }
    }
    window.addEventListener('storage', handleStorage)

    // Window PostMessage Event from embedded iframe widgets
    const handleMessage = (e: MessageEvent) => {
      if (e.data && (e.data.type === 'oxonom_data_updated' || e.data.type === 'oxonom_assignments_updated' || e.data.type === 'oxonom_boards_updated')) {
        handleSync()
      }
    }
    window.addEventListener('message', handleMessage)

    // Heartbeat: every 2.5 seconds to guarantee 100% up-to-date live data without manual F5
    const heartbeat = setInterval(handleSync, 2500)

    return () => {
      window.removeEventListener('oxonom_assignments_updated', handleSync)
      window.removeEventListener('oxonom_boards_updated', handleSync)
      window.removeEventListener('oxonom_attendance_updated', handleSync)
      window.removeEventListener('oxonom_pano_sync', handleSync)
      window.removeEventListener('oxonom_student_updated', handleSync)
      window.removeEventListener('oxonom_admin_students_updated', handleSync)
      window.removeEventListener('oxonom_school_updated', handleSync)
      window.removeEventListener('oxonom_principal_updated', handleSync)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('message', handleMessage)
      clearInterval(heartbeat)
    }
  }, [])

  const liveBoardCount = useMemo(() => {
    if (!selectedClass) return 0
    let customCount = 0
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oxonom_custom_boards')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            customCount = parsed.filter((b: any) => Number(b.usergroup_id) === Number(selectedClass.id)).length
          }
        }
      } catch (_) {}
    }
    return customCount
  }, [selectedClass, dataSyncTrigger])

  const liveAssignmentCount = useMemo(() => {
    if (!selectedClass) return 0
    let count = 0
    try {
      const classItem = ALL_CLASSROOMS.find(c => c.id === selectedClass.id) || {
        id: selectedClass.id,
        code: selectedClass.name.replace(/[^0-9A-Z-]/gi, ''),
        name: selectedClass.name,
        grade_level: selectedClass.gradeLevel,
        teacher_name: selectedClass.teacherName || 'Öğretmen',
        org_id: 10,
      }
      const asgs = generateClassroomAssignments(classItem as any)
      count = asgs.length
    } catch (_) {
      count = 0
    }
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oxonom_custom_school_assignments_v2')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            const customClassAsgs = parsed.filter((a: any) =>
              !a.usergroup_ids || a.usergroup_ids.length === 0 || a.usergroup_ids.includes(selectedClass.id)
            )
            count += customClassAsgs.length
          }
        }
      } catch (_) {}
    }
    return count
  }, [selectedClass, dataSyncTrigger])

  // Single Source of Truth Student Pool for selected class
  const candidateStudents = useMemo(() => {
    const allStudents = getSingleSourceOfTruthStudents(30)
    const classCode = selectedClass ? normalizeClassCode(selectedClass.code || selectedClass.name.replace('Şubesi', '').trim()) : ''
    return allStudents.filter((s: any) => {
      if (!classCode) return false
      const sNorm = normalizeClassCode(s.className || '')
      return sNorm === classCode || sNorm.replace('-', '/') === classCode.replace('-', '/')
    })
  }, [selectedClass, dataSyncTrigger])

  const liveStudentCount = candidateStudents.length

  const liveAttendance = useMemo(() => {
    if (!selectedClass) {
      return { rateStr: '-', isTaken: false, presentCount: 0, totalCount: 0, detail: 'Sınıf seçilmedi' }
    }
    if (typeof window !== 'undefined') {
      try {
        const classCode = selectedClass.code || selectedClass.name
        const att = getAttendanceForClass(classCode, getTodayDateString())
        if (att && att.taken) {
          const rate = att.totalCount > 0 ? Math.round((att.presentCount / att.totalCount) * 100) : 100
          return {
            rateStr: `%${rate}`,
            isTaken: true,
            presentCount: att.presentCount,
            totalCount: att.totalCount,
            detail: `Bugün Alındı (${att.presentCount}/${att.totalCount})`,
          }
        }
      } catch (_) {}
    }
    return {
      rateStr: liveStudentCount > 0 ? 'Alınmadı' : '-',
      isTaken: false,
      presentCount: 0,
      totalCount: liveStudentCount,
      detail: liveStudentCount > 0 ? 'Bugünkü yoklama bekleniyor' : 'Kayıtlı öğrenci yok',
    }
  }, [selectedClass, liveStudentCount, dataSyncTrigger])

  const currentSchoolName = useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        const rawInfo = localStorage.getItem('oxonom_school_info')
        if (rawInfo) {
          const parsed = JSON.parse(rawInfo)
          if (parsed.officialName) return parsed.officialName
        }
        const rawProf = localStorage.getItem('oxonom_principal_profile')
        if (rawProf) {
          const parsed = JSON.parse(rawProf)
          if (parsed.schoolName) return parsed.schoolName
        }
      } catch (_) {}
    }
    if (selectedClass?.schoolName) return selectedClass.schoolName
    if (org?.name) return org.name
    const gradeNum = parseInt(selectedClass?.gradeLevel || '', 10) || 1
    return gradeNum <= 4 ? 'Necla Görer İlkokulu' : 'Şair Fevzi Kutlu Kalkancı Ortaokulu'
  }, [org, selectedClass, dataSyncTrigger])

  const teacherDisplayLabel = useMemo(() => {
    const tName = selectedClass?.teacherName || displayName || 'Öğretmen'
    const gradeNum = parseInt(selectedClass?.gradeLevel || '', 10) || 1
    const isPrimary = gradeNum <= 4
    const subj = selectedClass?.subject || (isPrimary ? 'Sınıf Öğretmeni' : 'Branş Öğretmeni')
    
    if (isPrimary || subj === 'Sınıf Öğretmeni') {
      return { role: 'Sınıf Öğretmeni', name: tName, detail: '' }
    }
    return { role: 'Sınıf Rehber Öğretmeni', name: tName, detail: `(${subj})` }
  }, [selectedClass, displayName])

  // Modal states for interactive animated windows
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false)
  const [isExamModalOpen, setIsExamModalOpen] = useState(false)
  const [isExploreModalOpen, setIsExploreModalOpen] = useState(false)

  // Incoming file sent by teacher to this board
  const [incomingSharedFile, setIncomingSharedFile] = useState<{
    id: string
    boardId: string
    name: string
    size: number
    type: string
    url: string
    uploadedAt: number
    sender: string
    note?: string
  } | null>(null)

  useEffect(() => {
    let timer: any = null
    const handleFileIncoming = (e?: any) => {
      if (typeof window === 'undefined') return
      try {
        const fullId = `${boardIdentity.panoId}-${boardIdentity.boardNo}`
        const file = e?.detail || JSON.parse(localStorage.getItem(`oxonom_pano_latest_file`) || 'null')
        if (file && (file.boardId === fullId || file.boardId === boardIdentity.panoId)) {
          setIncomingSharedFile(file)
          if (timer) clearTimeout(timer)
          timer = setTimeout(() => {
            setIncomingSharedFile(null)
          }, 10000)
        }
      } catch (_) {}
    }

    window.addEventListener('oxonom_pano_file_shared', handleFileIncoming)
    window.addEventListener('storage', handleFileIncoming)
    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener('oxonom_pano_file_shared', handleFileIncoming)
      window.removeEventListener('storage', handleFileIncoming)
    }
  }, [boardIdentity.panoId, boardIdentity.boardNo])

  // Exactly 4 Apps requested: Akıllı Tahta - Araçlar - Sınav (mock) - Keşfet (mock)
  const apps: AppItem[] = useMemo(() => [
    {
      id: 'board',
      type: 'app',
      title: 'Akıllı Tahta',
      icon: 'Board',
      color: 'bg-brand-gradient',
      iconColor: 'text-white',
      badge: `${boardIdentity.panoId}-${boardIdentity.boardNo}`,
      path: `/pano/${boardIdentity.panoId}-${boardIdentity.boardNo}/tahta`
    },
    {
      id: 'tools',
      type: 'app',
      title: 'Araçlar',
      icon: 'Tools',
      color: 'bg-gradient-to-br from-[#4B075F] to-[#701A75]',
      iconColor: 'text-white',
      badge: 'İnteraktif',
      path: '#tools'
    },
    {
      id: 'exam',
      type: 'app',
      title: 'Sınav',
      icon: 'Exam',
      color: 'bg-gradient-to-br from-[#620B79] to-[#8D49A6]',
      iconColor: 'text-white',
      badge: 'Canlı',
      path: '#exam'
    },
    {
      id: 'explore',
      type: 'app',
      title: 'Keşfet',
      icon: 'Explore',
      color: 'bg-gradient-to-br from-[#8D49A6] to-[#D914C8]',
      iconColor: 'text-white',
      badge: 'Atölye',
      path: '#explore'
    }
  ], [boardIdentity.panoId, boardIdentity.boardNo])

  // Check active session (all profiles: teacher, admin, student, smartboard supported)
  const hasActiveTeacher = !forceStandby
  const [isPhoneConnected, setIsPhoneConnected] = useState<boolean>(false)
  const processedActionIds = useRef<Set<string>>(new Set())

  // Stable refs for event listeners and SSE actions to prevent stale closures and reconnection thrashing
  const selectedClassRef = useRef(selectedClass)
  const openWindowsRef = useRef(openWindows)
  const activeWindowIdRef = useRef(activeWindowId)
  const isLockedRef = useRef(isLocked)
  const appsRef = useRef(apps)

  useEffect(() => { selectedClassRef.current = selectedClass }, [selectedClass])
  useEffect(() => { openWindowsRef.current = openWindows }, [openWindows])
  useEffect(() => { activeWindowIdRef.current = activeWindowId }, [activeWindowId])
  useEffect(() => { isLockedRef.current = isLocked }, [isLocked])
  useEffect(() => { appsRef.current = apps }, [apps])

  const [isRemotePairModalOpen, setIsRemotePairModalOpen] = useState(false)
  const [remoteQrDataUrl, setRemoteQrDataUrl] = useState('')
  const [pairingCode, setPairingCode] = useState('')
  const sessionInitializedRef = useRef(false)
  const isEnsuringSessionRef = useRef(false)

  // Ensure board has a STABLE active verified session for remote pairing (One-shot, non-looping)
  useEffect(() => {
    if (!hasActiveTeacher) return
    if (pairedSession || sessionInitializedRef.current) {
      sessionInitializedRef.current = true
      return
    }

    let isCancelled = false
    const ensureValidSession = async () => {
      if (isEnsuringSessionRef.current) return
      isEnsuringSessionRef.current = true

      try {
        const storedSessionId =
          activeSessionId ||
          (typeof window !== 'undefined' ? localStorage.getItem('oxonom_pano_active_session_id') : null)

        if (storedSessionId) {
          try {
            const chk = await fetch(`/api/pano/pair/session?sessionId=${encodeURIComponent(storedSessionId)}`)
            if (chk.ok) {
              const data = await chk.json()
              const sessionObj = data.session || (data.success && data.status ? data : null)
              if (sessionObj && sessionObj.status !== 'closed' && sessionObj.status !== 'expired') {
                if (!isCancelled) {
                  if (sessionObj.code) setPairingCode(sessionObj.code)
                  if (!activeSessionId) setActiveSessionId(storedSessionId)
                  sessionInitializedRef.current = true
                }
                return
              }
            }
          } catch (_) {}
        }
      } catch (_) {
      } finally {
        isEnsuringSessionRef.current = false
      }
    }

    ensureValidSession()
    return () => { isCancelled = true }
  }, [hasActiveTeacher, pairedSession])

  // Generate QR code for remote control pairing whenever activeSessionId is available or modal opens
  useEffect(() => {
    if (!activeSessionId) return
    let isCancelled = false

    if (isRemotePairModalOpen && !pairingCode) {
      fetch(`/api/pano/pair/session?sessionId=${encodeURIComponent(activeSessionId)}`)
        .then(r => r.json())
        .then(d => {
          if (!isCancelled && d.code) setPairingCode(d.code)
        })
        .catch(() => {})
    }

    const updateQr = async () => {
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const tok = typeof window !== 'undefined' ? localStorage.getItem('oxonom_pano_device_token') || '' : ''
        const qrTarget = `${origin}/remote?session=${encodeURIComponent(activeSessionId)}${tok ? `&token=${encodeURIComponent(tok)}` : ''}`
        const url = await QRCode.toDataURL(qrTarget, {
          width: 320,
          margin: 1.5,
          color: { dark: '#09090b', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        })
        if (!isCancelled) {
          setRemoteQrDataUrl(url)
        }
      } catch (_) {}
    }
    updateQr()
    return () => { isCancelled = true }
  }, [activeSessionId, isRemotePairModalOpen, pairingCode])

  // Handle incoming remote commands from paired mobile phone
  const handleRemoteAction = useCallback((msg: RemoteActionMessage) => {
    if (!msg || !msg.action) return

    const actionId = msg.id || (msg as any).actionId
    if (actionId) {
      if (processedActionIds.current.has(actionId)) return
      processedActionIds.current.add(actionId)
      if (processedActionIds.current.size > 400) {
        const first = Array.from(processedActionIds.current).slice(0, 150)
        first.forEach(id => processedActionIds.current.delete(id))
      }
    }

    const { action, payload } = msg
    recordActivity()
    setIsPhoneConnected(true)

    const currentClass = selectedClassRef.current

    // Sınıf seçilmeden kumanda aktif olmasın — sadece SELECT_CLASS veya sistem komutlarına izin ver
    if (!currentClass && action !== 'SELECT_CLASS' && action !== 'LOCK' && action !== 'UNLOCK' && action !== 'HOME') {
      setIsClassModalOpen(true)
      toast.error('Lütfen önce ders yapacağınız sınıfı seçin.')
      return
    }

    switch (action) {
      case 'HOME': {
        const curWinId = activeWindowIdRef.current
        if (curWinId) {
          handleCloseWindow(curWinId)
        }
        setIsClassModalOpen(false)
        setIsNewBoardModalOpen(false)
        setIsSettingsOpen(false)
        setIsRemotePairModalOpen(false)
        toast('Ana Ekrana Dönüldü', { icon: '🏠' })
        break
      }
      case 'BACK':
      case 'CLOSE_WINDOW': {
        const curWinId = activeWindowIdRef.current
        if (curWinId) {
          handleCloseWindow(curWinId)
          toast('Pencere Kapatıldı', { icon: '◀️' })
        } else {
          setIsClassModalOpen(false)
          setIsNewBoardModalOpen(false)
          setIsSettingsOpen(false)
          setIsRemotePairModalOpen(false)
        }
        break
      }
      case 'RELOAD_WINDOW': {
        const curWinId = activeWindowIdRef.current
        if (curWinId) {
          handleReloadWindow(curWinId)
          toast('Pencere Yenilendi', { icon: '🔄' })
        }
        break
      }
      case 'FULLSCREEN': {
        if (screenfull.isEnabled && !screenfull.isFullscreen) {
          screenfull.request().catch(() => {})
          toast('Tam Ekran Moduna Geçildi', { icon: '⛶' })
        }
        break
      }
      case 'EXIT_FULLSCREEN': {
        if (screenfull.isEnabled && screenfull.isFullscreen) {
          screenfull.exit().catch(() => {})
          toast('Tam Ekrandan Çıkıldı', { icon: '🗗' })
        }
        break
      }
      case 'LOCK': {
        lockPano()
        toast('Tahta Kilitlendi', { icon: '🔒' })
        break
      }
      case 'UNLOCK': {
        unlockPano()
        toast('Tahta Kilidi Açıldı', { icon: '🔓' })
        break
      }
      case 'SELECT_CLASS': {
        const targetId = payload?.classId
        if (targetId) {
          const cls =
            payload?.class ||
            classrooms.find(c => String(c.id) === String(targetId)) ||
            ALL_CLASSROOMS.find(c => String(c.id) === String(targetId)) ||
            DEFAULT_CLASSROOMS.find(c => String(c.id) === String(targetId))
          if (cls) {
            selectedClassRef.current = cls
            handleSelectClass(cls)
            toast.success(`${cls.name} sınıfı seçildi`)
          }
        } else {
          selectedClassRef.current = null
          handleSelectClass(null as any)
          setIsClassModalOpen(true)
        }
        break
      }
      case 'OPEN_WHITEBOARD': {
        if (!currentClass) {
          setIsClassModalOpen(true)
          toast.error('Lütfen önce ders yapacağınız sınıfı seçin.')
          break
        }
        const boardApp = appsRef.current.find(a => a.id === 'board') || {
          id: 'board',
          type: 'app',
          title: 'Akıllı Tahta',
          icon: 'Board',
          color: 'bg-blue-600',
          iconColor: 'text-white',
          path: `/dash/boards?usergroupId=${currentClass.id}`
        }
        openAppInWindow(boardApp as any)
        toast.success('Akıllı Tahta Açıldı', { icon: '📋' })
        break
      }
      case 'OPEN_ATTENDANCE': {
        if (!currentClass) {
          setIsClassModalOpen(true)
          toast.error('Lütfen önce ders yapacağınız sınıfı seçin.')
          break
        }
        openAppInWindow({
          id: 'class_attendance',
          type: 'app',
          title: `${currentClass.name} - Günlük Yoklama`,
          icon: 'Attendance',
          color: 'bg-purple-600',
          iconColor: 'text-white',
          path: `/dash/classrooms/${currentClass.id}?tab=attendance&onlyTab=1`
        })
        toast.success('Günlük Yoklama Açıldı', { icon: '👥' })
        break
      }
      case 'OPEN_ASSIGNMENTS': {
        if (!currentClass) {
          setIsClassModalOpen(true)
          toast.error('Lütfen önce ders yapacağınız sınıfı seçin.')
          break
        }
        const hwApp = appsRef.current.find(a => a.id === 'homework') || {
          id: 'homework',
          type: 'app',
          title: 'Ev Ödevleri',
          icon: 'Homework',
          color: 'bg-emerald-600',
          iconColor: 'text-white',
          path: `/dash/assignments?usergroupId=${currentClass.id}`
        }
        openAppInWindow(hwApp as any)
        toast.success('Ev Ödevleri Açıldı', { icon: '📝' })
        break
      }
      case 'OPEN_PLAYGROUNDS': {
        if (!currentClass) {
          setIsClassModalOpen(true)
          toast.error('Lütfen önce ders yapacağınız sınıfı seçin.')
          break
        }
        const pgApp = appsRef.current.find(a => a.id === 'playgrounds')
        if (pgApp) {
          openAppInWindow(pgApp)
          toast.success('İnteraktif Modüller Açıldı', { icon: '✨' })
        }
        break
      }
      case 'OPEN_GAMES': {
        if (!currentClass) {
          setIsClassModalOpen(true)
          toast.error('Lütfen önce ders yapacağınız sınıfı seçin.')
          break
        }
        const gamesApp = appsRef.current.find(a => a.id === 'games')
        if (gamesApp) {
          openAppInWindow(gamesApp)
          toast.success('Eğitici Oyunlar Açıldı', { icon: '🎮' })
        }
        break
      }
      case 'OPEN_LIBRARY': {
        if (!currentClass) {
          setIsClassModalOpen(true)
          toast.error('Lütfen önce ders yapacağınız sınıfı seçin.')
          break
        }
        const libApp = appsRef.current.find(a => a.id === 'library')
        if (libApp) {
          openAppInWindow(libApp)
          toast.success('Kaynaklar Açıldı', { icon: '📚' })
        }
        break
      }
      case 'NEXT_PAGE':
      case 'PREVIOUS_PAGE':
      case 'PEN':
      case 'ERASER':
      case 'UNDO':
      case 'REDO':
      case 'ZOOM_IN':
      case 'ZOOM_OUT': {
        try {
          const iframe = document.querySelector('iframe') as HTMLIFrameElement | null
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'OXONOM_REMOTE_ACTION',
              action,
              payload,
            }, '*')
            if (action === 'NEXT_PAGE') {
              iframe.contentWindow.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', keyCode: 39, bubbles: true }))
            } else if (action === 'PREVIOUS_PAGE') {
              iframe.contentWindow.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', keyCode: 37, bubbles: true }))
            }
          }
        } catch (_) {}
        window.dispatchEvent(new CustomEvent('oxonom_remote_action', { detail: { action, payload } }))
        break
      }
    }
  }, [
    handleCloseWindow,
    handleReloadWindow,
    lockPano,
    unlockPano,
    handleSelectClass,
    openAppInWindow,
    classrooms,
  ])

  const handleRemoteActionRef = useRef(handleRemoteAction)
  useEffect(() => {
    handleRemoteActionRef.current = handleRemoteAction
  }, [handleRemoteAction])

  // Smart Board Realtime SSE Connection + Fast HTTP Polling for Remote Phone Commands (Dual-Channel)
  useEffect(() => {
    if (!activeSessionId || !hasActiveTeacher) return

    let sse: EventSource | null = null
    let pollInterval: NodeJS.Timeout | null = null
    let isCancelled = false
    let lastPollTime = Date.now() - 3000

    const tok = typeof window !== 'undefined' ? localStorage.getItem('oxonom_pano_device_token') || '' : ''

    const connectSSE = () => {
      try {
        const sseUrl = `/api/pano/pair/stream?sessionId=${encodeURIComponent(activeSessionId)}${tok ? `&token=${encodeURIComponent(tok)}` : ''}`
        sse = new EventSource(sseUrl)

        sse.onopen = () => {
          // Connected to stream
        }

        sse.addEventListener('remote_connected', () => {
          if (!isCancelled) {
            setIsPhoneConnected(true)
          }
        })

        sse.addEventListener('paired', () => {
          if (!isCancelled) {
            setIsPhoneConnected(true)
          }
        })

        sse.addEventListener('remote_action', (event: MessageEvent) => {
          if (isCancelled) return
          try {
            const actionMsg: RemoteActionMessage = JSON.parse(event.data)
            handleRemoteActionRef.current(actionMsg)
            setIsPhoneConnected(true)
          } catch (err) {
            console.error('[PanoClient] Failed to parse remote_action:', err)
          }
        })

        sse.addEventListener('session_closed', () => {
          if (isCancelled) return
          setIsPhoneConnected(false)
          handleRemoteSessionClosed()
        })

        sse.onerror = () => {
          // SSE automatically reconnects in browser; backup polling ensures zero latency
        }
      } catch (err) {
        console.warn('[PanoClient] SSE initialization error:', err)
      }
    }

    // Backup Fast HTTP Polling (every 300ms) to guarantee cross-lambda delivery on Serverless
    const startPollingBackup = () => {
      pollInterval = setInterval(async () => {
        if (isCancelled) return
        try {
          const res = await fetch(`/api/remote/pending?sessionId=${encodeURIComponent(activeSessionId)}${tok ? `&token=${encodeURIComponent(tok)}` : ''}&role=board&since=${lastPollTime}`)
          if (res.ok) {
            const data = await res.json()
            if (data.serverTime) {
              lastPollTime = Math.max(lastPollTime, data.serverTime - 1000)
            }
            if (typeof data.isPhoneConnected === 'boolean') {
              setIsPhoneConnected(data.isPhoneConnected)
            } else if (data.status === 'paired') {
              setIsPhoneConnected(true)
            }
            if (Array.isArray(data.actions) && data.actions.length > 0) {
              setIsPhoneConnected(true)
              for (const act of data.actions) {
                handleRemoteActionRef.current(act)
              }
            }
          } else if (res.status === 410 || res.status === 401 || res.status === 404) {
            setIsPhoneConnected(false)
            handleRemoteSessionClosed()
          }
        } catch (_) {}
      }, 300)
    }

    connectSSE()
    startPollingBackup()

    return () => {
      isCancelled = true
      if (sse) {
        sse.close()
      }
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [activeSessionId, hasActiveTeacher, handleRemoteSessionClosed])

  // While checking local storage on initial mount, show clean dark splash
  if (!isSessionHydrated) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-[#070304] flex items-center justify-center select-none">
        <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 1. Akıllı Tahta Eşleştirme Giriş Ekranı (Multi-Tenant Pano Pairing Gate)
  if (!pairedBoard) {
    return (
      <PanoPairingGate
        initialCode={(searchParams?.get('code') || searchParams?.get('board') || rawIdParam || '').toUpperCase()}
        onSuccess={(board) => {
          setPairedBoard(board)
          toast.success(`"${board.schoolName} - ${board.classroom || board.name}" panosuna bağlanıldı! 🚀`)
        }}
      />
    )
  }

  // apps is already memoized above and ready for rendering and remote control


  return (
    <div
      onPointerDownCapture={recordActivity}
      onTouchStartCapture={recordActivity}
      className={`fixed inset-0 w-screen h-screen flex flex-col relative overflow-hidden bg-[#FCF9FD] dark:bg-[#150B1B] font-sans select-none m-0 p-0 z-10 touch-manipulation overscroll-none ${isPhone ? 'pb-24' : ''}`}
      style={{
        backgroundImage: `
          radial-gradient(at 15% 10%, rgba(75, 7, 95, 0.08) 0px, transparent 45%),
          radial-gradient(at 85% 15%, rgba(141, 73, 166, 0.08) 0px, transparent 45%),
          radial-gradient(at 50% 85%, rgba(217, 20, 200, 0.05) 0px, transparent 50%),
          radial-gradient(at 90% 85%, rgba(75, 7, 95, 0.06) 0px, transparent 45%)
        `,
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'pan-x pan-y',
        overscrollBehavior: 'none'
      }}
    >
      {/* ── ANIMATED SUBTLE BACKGROUND PATTERNS (Göz yormayan, dinamik desenler) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Ambient Pulsing Glow Orbs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#4B075F]/10 dark:bg-[#4B075F]/20 blur-[130px] animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-[550px] h-[550px] rounded-full bg-[#8D49A6]/10 dark:bg-[#8D49A6]/20 blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] rounded-full bg-[#D914C8]/08 dark:bg-[#D914C8]/15 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />

        {/* Floating Subtle Geometric SVGs with smooth drifting animations */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] dark:opacity-[0.11]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pano-dot-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="currentColor" className="text-[#8D49A6]" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pano-dot-grid)" />
        </svg>

        {/* Floating Educational / Mathematical Glyphs */}
        <div className="absolute inset-0 select-none overflow-hidden font-mono font-black text-xl text-[#8D49A6]/15 dark:text-[#F0D8FA]/20">
          <span className="absolute top-[12%] left-[8%] animate-bounce" style={{ animationDuration: '6s' }}>+</span>
          <span className="absolute top-[28%] right-[10%] animate-pulse" style={{ animationDuration: '7s' }}>∑</span>
          <span className="absolute top-[65%] left-[5%] animate-bounce" style={{ animationDuration: '9s' }}>×</span>
          <span className="absolute top-[75%] right-[15%] animate-pulse" style={{ animationDuration: '8s' }}>π</span>
          <span className="absolute top-[18%] left-[45%] animate-bounce" style={{ animationDuration: '11s' }}>÷</span>
          <span className="absolute top-[85%] left-[60%] animate-pulse" style={{ animationDuration: '10s' }}>√</span>
          <span className="absolute top-[42%] left-[92%] animate-bounce" style={{ animationDuration: '12s' }}>%</span>
          <span className="absolute top-[55%] left-[18%] animate-pulse" style={{ animationDuration: '13s' }}>∞</span>
        </div>
      </div>

      {/* 1. PROFESSIONAL 3D NEON GLASS LOCK SCREEN (ONLY ON BOARD) */}
      <AnimatePresence>
        {isLocked && !isPhone && (
          <PanoLockScreen
            user={effectiveUser}
            org={org}
            settings={settings}
            selectedClass={selectedClass}
            onUnlock={unlockPano}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>

      {/* Phone Lock Status Banner */}
      {isPhone && isLocked && (
        <div className="z-40 bg-amber-500/95 dark:bg-amber-600/95 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 animate-pulse text-slate-950" />
            <span>Akıllı Tahta Kilitli (Kilit Ekranı devrede)</span>
          </div>
          <button
            onClick={handleToggleBoardLockFromPhone}
            className="px-2.5 py-1 bg-black/20 hover:bg-black/30 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all text-slate-950"
          >
            Kilidi Aç
          </button>
        </div>
      )}

      {/* 2. CENTERED BRANDING & MULTI-TENANT PANO BAR */}
      <div className="w-full pt-3 pb-1 px-4 sm:px-6 flex items-center justify-center relative z-30 shrink-0">
        {/* School & Classroom Identity (Multi-Tenant) */}
        {pairedBoard && (
          <div className="absolute left-4 sm:left-6 top-3 flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-[#241329]/90 backdrop-blur-md border border-[#E8DFEB] dark:border-[#49364F] shadow-2xs flex items-center gap-2 text-xs font-bold text-[#241329] dark:text-white">
              <School className="w-4 h-4 text-[#D914C8] shrink-0" />
              <span className="hidden sm:inline font-black text-xs sm:text-sm">{pairedBoard.schoolName}</span>
              {pairedBoard.classroom && (
                <span className="px-2 py-0.5 rounded-md bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] text-[11px] font-black">
                  {pairedBoard.classroom} Sınıfı
                </span>
              )}
              <span className="font-mono text-[10px] text-[#716779] dark:text-[#C58ADB] font-bold px-1.5 py-0.5 rounded bg-[#FAF5FC] dark:bg-[#1E1124] border border-[#E8DFEB] dark:border-[#3A2942] hidden md:inline">
                {pairedBoard.code}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold ml-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Canlı
              </span>
            </div>
          </div>
        )}

        {/* Centered Brand Logo */}
        <Link href={getUriWithOrg(orgslug, '/')} className="flex items-center group cursor-pointer" title="Ana Sayfaya Dön">
          <div className="h-10 sm:h-12 flex items-center group-hover:scale-105 transition-transform">
            <img
              src="/oxonom-logo-light.png"
              alt="Oxonom Edu"
              className="h-8 sm:h-10 md:h-11 w-auto object-contain dark:hidden transition-all drop-shadow-xs"
            />
            <img
              src="/oxonom-logo-dark.png"
              alt="Oxonom Edu"
              className="h-8 sm:h-10 md:h-11 w-auto object-contain hidden dark:block transition-all drop-shadow-xs"
            />
          </div>
        </Link>

        {/* Discreet Top Right Controls */}
        <div className="absolute right-4 sm:right-6 top-3 flex items-center gap-2" ref={popupRef}>
          {pairedBoard && (
            <button
              onClick={handleDisconnectBoard}
              className="h-8 sm:h-9 px-3 rounded-2xl bg-white/90 dark:bg-[#241329]/90 backdrop-blur-md shadow-2xs flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer border border-rose-200 dark:border-rose-900/50 text-xs font-bold"
              title="Panodan Çıkış Yap (Çevrimdışı Yap)"
            >
              <Power className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Panodan Çıkış</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-white/80 dark:bg-[#241329]/80 shadow-2xs flex items-center justify-center text-[#514458] dark:text-slate-300 hover:bg-[#FAF5FC] dark:hover:bg-[#350444]/50 hover:text-[#4B075F] dark:hover:text-[#E9D5FF] transition-colors cursor-pointer border border-[#E8DFEB] dark:border-[#49364F]"
              title="Donanım Ayarları & Ekranı Kilitle"
            >
              <Lock className="w-4 h-4 text-[#8D49A6]" />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", duration: 0.2 }}
                  className="absolute right-0 top-11 w-64 bg-white/95 dark:bg-[#1E1124]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-[#E8DFEB] dark:border-[#49364F] overflow-hidden flex flex-col z-[100]"
                >
                  <div className="p-3 bg-brand-gradient text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Tv className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-white/80">Akıllı Tahta</div>
                        <div className="text-xs font-black text-white">{pairedBoard?.code || `${boardIdentity.panoId}-${boardIdentity.boardNo}`}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Canlı
                    </span>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => { dispatch({ type: 'OPEN_MODAL', modalId: 'settings' }); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FAF5FC] dark:hover:bg-[#2D1636] text-[#514458] dark:text-slate-200 hover:text-[#4B075F] text-xs font-semibold transition-colors cursor-pointer text-left"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#8D49A6]" />
                      <span>Pano Donanım Ayarları</span>
                    </button>
                    <button
                      onClick={() => { setIsClassModalOpen(true); dispatch({ type: 'OPEN_MODAL', modalId: 'class_selection' }); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FAF5FC] dark:hover:bg-[#2D1636] text-[#514458] dark:text-slate-200 hover:text-[#4B075F] text-xs font-semibold transition-colors cursor-pointer text-left"
                    >
                      <School className="w-3.5 h-3.5 text-[#8D49A6]" />
                      <span>Şube / Sınıf Değiştir</span>
                    </button>
                    <button
                      onClick={() => { lockPano(); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FAF5FC] dark:hover:bg-[#2D1636] text-[#514458] dark:text-slate-200 hover:text-[#4B075F] text-xs font-semibold transition-colors cursor-pointer text-left"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#8D49A6]" />
                      <span>Ekranı Kilitle</span>
                    </button>
                    <button
                      onClick={handleDisconnectBoard}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer text-left border-t border-[#E8DFEB] dark:border-[#3A2942] mt-1 pt-2"
                    >
                      <Power className="w-3.5 h-3.5 text-rose-500" />
                      <span>Panodan Çıkış / Eşleştirmeyi Kapat</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: MANDATORY CLASS SELECTION (EĞER SINIF SEÇİLMEMİŞSE) VEYA PANO DESKTOP */}
      {!selectedClass ? (
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] px-4 sm:px-8 md:px-12 py-8 flex flex-col items-center">
          <div data-grid-container="class-cards" className="max-w-6xl w-full mx-auto my-auto space-y-6">
            
            {/* Header Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-6 sm:p-8 text-center space-y-3"
            >
              {/* Ambient decorative glow */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-500/10 via-emerald-500/10 to-transparent blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shadow-inner mb-3">
                  <School className="w-8 h-8" />
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-black tracking-wide mb-2 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  <span>🖥️ AKILLI TAHTA OS • PANO: {boardIdentity.panoId} • TAHTA NO: {boardIdentity.boardNo}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
                  Ders Başlıyor! Lütfen Sınıfınızı Seçin
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed mt-1">
                  İşlem yapmak istediğiniz şubeye dokunun. Seçiminiz akıllı tahta ve kumanda telefonunuz arasında anlık olarak senkronize edilecek (&lt; 300 ms) ve Pano OS ders alanı açılacaktır.
                </p>
              </div>
            </motion.div>

            {/* Class Cards Grid */}
            {groupClassroomsByGrade(classrooms && classrooms.length > 0 ? classrooms : DEFAULT_CLASSROOMS).map((group) => (
              <section key={group.grade} className="space-y-3">
                <h2 className="text-sm sm:text-base font-black text-slate-700 dark:text-slate-200 px-1 flex items-center gap-2">
                  <span>{group.grade}</span>
                  <span className="text-xs font-bold text-slate-400">({group.items.length} şube)</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.items.map((c) => (
                    <motion.div
                        key={c.id}
                        tabIndex={0}
                        role="button"
                        aria-label={`${c.name} - ${c.gradeLevel}`}
                        data-grid-item="class-card"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectClass(c)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleSelectClass(c)
                          } else if (e.key.startsWith('Arrow')) {
                            handleGridArrowNav(e, 'class-card')
                          }
                        }}
                        onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })}
                        className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-[#F0D8FA]/30 dark:hover:bg-[#350444]/40 border-2 border-slate-200/80 dark:border-slate-800 hover:border-[#8D49A6] dark:hover:border-[#D914C8] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between text-left cursor-pointer group select-none focus:outline-hidden focus-visible:ring-4 focus-visible:ring-[#8D49A6] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                      >
                        <div className="flex items-start justify-between gap-3 w-full mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-brand-gradient text-white flex items-center justify-center font-black text-base shadow-md shadow-purple-950/20 group-hover:scale-105 transition-transform">
                              {c.name.split(' ')[0]}
                            </div>
                            <div>
                              <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-[#4B075F] dark:group-hover:text-[#F17AE6] transition-colors">
                                {c.name}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                {c.gradeLevel} • {c.teacherName || displayName}
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F17AE6] border border-[#E8DFEB] dark:border-[#49364F] shrink-0">
                            {c.attendance || '%100'}
                          </span>
                        </div>
      
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 w-full">
                          <div className="flex items-center gap-3 font-medium">
                            <span>👥 <strong>{c.studentCount}</strong> Öğrenci</span>
                            <span>📋 <strong>{c.boardCount}</strong> Tahta</span>
                          </div>
                          <span className="text-[#4B075F] dark:text-[#F17AE6] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            <span>Seç</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </motion.div>
                  ))}
                </div>
              </section>
            ))}

            {/* Bottom Status Indicator */}
            <div className="text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Canlı eşleşme aktif • Tahtadan veya telefondan yapılan seçim anında her iki ekranda da açılır.</span>
            </div>

          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-8 md:px-12 py-6">
          <div className="max-w-6xl mx-auto w-full space-y-6">

          {/* Top Row: Greeting & Prominent Clock/Calendar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <span className="text-xl sm:text-2xl font-black text-[#241329] dark:text-slate-100 tracking-tight">
                  Akıllı Tahta
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-brand-gradient text-white shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {boardIdentity.panoId}-{boardIdentity.boardNo}
                  </span>
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#8D49A6] dark:text-[#E9D5FF] italic mt-1.5">
                “Yeni Nesil Sizin Eseriniz Olacaktır!” — Gazi Mustafa Kemal Atatürk
              </p>
            </div>
            <CompactWeatherCard />
          </div>

          {/* ======================================================== */}
          {/* HERO ALANI (MODERN, GLASSMORPHIC & CORPORATE PALETTE)    */}
          {/* ======================================================== */}
          <div className="p-[1.5px] rounded-[2.2rem] sm:rounded-[2.6rem] bg-gradient-to-r from-[#4B075F]/35 via-[#8D49A6]/30 to-[#D914C8]/30 shadow-xl shadow-purple-950/5">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-[2.1rem] sm:rounded-[2.5rem] bg-white/95 dark:bg-[#1E1124]/95 backdrop-blur-2xl p-6 sm:p-8 space-y-6"
            >
              {/* Ambient decorative glow */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-gradient-to-br from-[#4B075F]/15 via-[#8D49A6]/10 to-transparent blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 rounded-full bg-gradient-to-tr from-[#8D49A6]/15 via-[#D914C8]/10 to-transparent blur-3xl pointer-events-none" />

              {/* Header: Class Name, Pano ID & Tahta ID, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-3xl sm:text-4xl font-black text-[#241329] dark:text-white tracking-tight">
                      {selectedClass.name}
                    </h2>

                    {/* Donanım Kimlik Rozeti (Pano ID & Tahta ID) */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-2xl bg-gradient-to-r from-[#4B075F] to-[#8D49A6] text-white text-xs font-black shadow-sm border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>PANO: <span className="text-white">{boardIdentity.panoId}</span></span>
                      <span className="text-white/40">|</span>
                      <span>TAHTA: <span className="text-pink-200">{boardIdentity.boardNo}</span></span>
                    </div>

                    <button
                      onClick={() => {
                        setIsClassModalOpen(true)
                        dispatch({ type: 'OPEN_MODAL', modalId: 'class_selection' })
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FAF5FC] hover:bg-[#F0D8FA] dark:bg-[#2A1833] dark:hover:bg-[#350444] text-[#4B075F] dark:text-[#E9D5FF] border border-[#E8DFEB] dark:border-[#49364F] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                    >
                      <span>Şube Değiştir</span>
                      <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#514458] dark:text-slate-400 font-medium flex-wrap">
                    <span>Kurum: <strong className="text-[#241329] dark:text-slate-200">{currentSchoolName}</strong></span>
                    <span className="text-[#8D49A6]">•</span>
                    <span>Donanım No: <strong className="text-[#D914C8]">{boardIdentity.panoId}-{boardIdentity.boardNo}</strong></span>
                    <span className="text-[#8D49A6]">•</span>
                    <span>{teacherDisplayLabel.role}: <strong className="text-[#4B075F] dark:text-[#E9D5FF]">{teacherDisplayLabel.name}</strong>{teacherDisplayLabel.detail ? <span className="text-[#8D49A6] dark:text-purple-300 font-normal"> {teacherDisplayLabel.detail}</span> : ''}</span>
                  </div>
                </div>
              </div>

              {/* 3 Stat Cards in Harmonious Brand Theme (Kademe, Öğrenci, Günlük Devam) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 relative z-10">
                {/* 1. KADEME */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FCF9FD] to-[#FAF5FC] dark:from-[#261730] dark:to-[#1C1024] border border-[#E8DFEB] dark:border-[#49364F] flex items-center gap-3.5 transition-all hover:border-[#8D49A6]/60 shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#4B075F]/10 dark:bg-[#4B075F]/40 border border-[#4B075F]/20 flex items-center justify-center text-[#4B075F] dark:text-[#E9D5FF] shrink-0">
                    <School className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">KADEME</span>
                    <span className="text-base sm:text-lg font-black text-[#241329] dark:text-white">{selectedClass.gradeLevel}</span>
                  </div>
                </div>

                {/* 2. ÖĞRENCİ */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FCF9FD] to-[#FAF5FC] dark:from-[#261730] dark:to-[#1C1024] border border-[#E8DFEB] dark:border-[#49364F] flex items-center gap-3.5 transition-all hover:border-[#8D49A6]/60 shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#8D49A6]/10 dark:bg-[#8D49A6]/40 border border-[#8D49A6]/20 flex items-center justify-center text-[#8D49A6] dark:text-[#F0D8FA] shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">ÖĞRENCİ</span>
                    <span className="text-base sm:text-lg font-black text-[#4B075F] dark:text-[#F0D8FA]">{liveStudentCount} Kayıtlı</span>
                  </div>
                </div>

                {/* 3. GÜNLÜK DEVAM */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FCF9FD] to-[#FAF5FC] dark:from-[#261730] dark:to-[#1C1024] border border-[#E8DFEB] dark:border-[#49364F] flex items-center gap-3.5 transition-all hover:border-emerald-500/60 shadow-2xs">
                  <div className={`w-12 h-12 rounded-2xl ${liveAttendance.isTaken ? 'bg-emerald-500/10 dark:bg-emerald-500/40 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300' : 'bg-amber-500/10 dark:bg-amber-500/40 border border-amber-500/20 text-amber-600 dark:text-amber-400'} flex items-center justify-center shrink-0`}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">GÜNLÜK DEVAM</span>
                    <span className={`text-base sm:text-lg font-black ${liveAttendance.isTaken ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{liveAttendance.rateStr}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ======================================================== */}
          {/* APPS & SHORTCUTS (4 İKON: TAHTA, ARAÇLAR, SINAV, KEŞFET) */}
          {/* ======================================================== */}
          <div className="pt-2">
            <h2 className="text-xs sm:text-sm font-black text-[#514458] dark:text-slate-400 uppercase tracking-wider mb-4 pl-1">
              Uygulamalar
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 w-full max-w-4xl mx-auto">
              {apps.map((item) => (
                <GridItem
                  key={item.id}
                  item={item}
                  onAction={(app) => {
                    if (app.id === 'board') {
                      router.push(`/pano/${boardIdentity.panoId}-${boardIdentity.boardNo}/tahta`)
                    } else if (app.id === 'tools') {
                      setIsToolsModalOpen(true)
                    } else if (app.id === 'exam') {
                      setIsExamModalOpen(true)
                    } else if (app.id === 'explore') {
                      setIsExploreModalOpen(true)
                    } else {
                      openAppInWindow(app)
                    }
                  }}
                />
              ))}
            </div>

            {/* AKILLI TAHTAYA AKTARILDI BİLDİRİMİ (UYGULAMALARIN HEMEN ALTINDA) */}
            <AnimatePresence>
              {incomingSharedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 14, scale: 0.98 }}
                  className="w-full max-w-4xl mx-auto mt-6 p-4 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-[#1E1124]/95 backdrop-blur-xl border-2 border-emerald-500/50 shadow-xl shadow-emerald-950/15 flex items-center justify-between gap-4 text-[#241329] dark:text-white"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                      <ImageIcon size={20} />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-[340px]">
                          {incomingSharedFile.name}
                        </span>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          Akıllı Tahtaya Aktarıldı
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {incomingSharedFile.sender} tarafından tahtaya aktarıldı.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/pano/${boardIdentity.panoId}-${boardIdentity.boardNo}/tahta?import=latest`}
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          try {
                            localStorage.removeItem('oxonom_pano_latest_file')
                            localStorage.removeItem(`oxonom_whiteboard_incoming_${boardIdentity.panoId}-${boardIdentity.boardNo}`)
                          } catch (_) {}
                        }
                        setIncomingSharedFile(null)
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-950/20 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      <span>Tahtada Aç 🎨</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          try {
                            localStorage.removeItem('oxonom_pano_latest_file')
                            localStorage.removeItem(`oxonom_whiteboard_incoming_${boardIdentity.panoId}-${boardIdentity.boardNo}`)
                          } catch (_) {}
                        }
                        setIncomingSharedFile(null)
                      }}
                      className="w-8 h-8 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                      title="Kapat ve Kaldır"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
      )}

      {/* 4. INITIAL & ON-DEMAND CLASS SELECTION MODAL */}
      <ClassSelectionModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false)
          dispatch({ type: 'CLOSE_MODAL' })
        }}
        classrooms={classrooms && classrooms.length > 0 ? classrooms : DEFAULT_CLASSROOMS}
        selectedClassId={selectedClass?.id || 0}
        onSelect={(c) => {
          handleSelectClass(c)
          setIsClassModalOpen(false)
          toast.success(`${c.name} seçildi! 📚`)
        }}
      />

      {/* NEW BLANK BOARD MODAL */}
      <NewBoardModal
        isOpen={isNewBoardModalOpen}
        onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
        className={selectedClass?.name || ''}
        classId={selectedClass?.id || 0}
        orgId={org?.id || 1}
        onBoardCreated={handleNewBoardCreated}
      />

      {/* 5. PANO SETTINGS MODAL */}
      <PanoSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
        settings={settings}
        onSave={saveSettings}
      />

      {/* ANIMATED TOOLS MODAL (ARAÇLAR PENCERESİ) */}
      <AnimatePresence>
        {isToolsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            onClick={() => setIsToolsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white/95 dark:bg-[#1E1124]/95 backdrop-blur-2xl border border-[#8D49A6]/30 dark:border-[#8D49A6]/50 shadow-2xl p-5 sm:p-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E8DFEB] dark:border-[#49364F]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-gradient text-white flex items-center justify-center shadow-md">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-[#241329] dark:text-white">
                      İnteraktif Sınıf Araçları
                    </h2>
                    <p className="text-xs text-[#716779] dark:text-[#C58ADB]">
                      Kronometre, Soru & Söz Hakkı, Dokunmatik Hesap Makinesi
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsToolsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 dark:bg-[#2D1636] dark:hover:bg-rose-950/60 dark:text-slate-300 dark:hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tools Content */}
              <SmartboardClassroomTools selectedClass={selectedClass} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PANO LIVE EXAM MODAL */}
      <MockExamModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        className={selectedClass?.name || '1/A Sınıfı'}
        boardId={`${boardIdentity.panoId}-${boardIdentity.boardNo}`}
        students={candidateStudents}
      />

      {/* INCOMING WHITEBOARD MATERIAL NOTIFICATION (NON-INTRUSIVE) */}

      {/* MOCK EXPLORE MODAL */}
      <MockExploreModal
        isOpen={isExploreModalOpen}
        onClose={() => setIsExploreModalOpen(false)}
      />

      {/* 8. MOBIL UZAKTAN KUMANDA EŞLEŞTİRME MODALI (QR & PIN) */}
      <AnimatePresence>
        {isRemotePairModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsRemotePairModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-[#121215] rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden text-center"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white relative">
                <button
                  type="button"
                  onClick={() => setIsRemotePairModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-3">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black tracking-tight">Mobil Uzaktan Kumanda</h3>
                <p className="text-xs text-indigo-200/80 mt-1 max-w-xs mx-auto">
                  Telefonunuzun kamerasıyla QR kodu tarayın, anında akıllı tahta kumandasına dönüşsün.
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center">
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-200/80 inline-block">
                    {remoteQrDataUrl ? (
                      <img src={remoteQrDataUrl} alt="Eşleştirme QR Kodu" className="w-52 h-52 object-contain" />
                    ) : (
                      <div className="w-52 h-52 flex items-center justify-center text-gray-400">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* 6-Digit PIN Code */}
                  {pairingCode && (
                    <div className="mt-4 text-center">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">veya 6 Haneli Eşleştirme Kodu</span>
                      <span className="font-mono text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-4 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                        {pairingCode.slice(0, 3)} {pairingCode.slice(3)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Connection Status Pill */}
                <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 ${
                  isPhoneConnected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${isPhoneConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span>
                    {isPhoneConnected
                      ? 'Mobil Kumanda Bağlı & Senkronize (Hazır)'
                      : 'Telefon Bekleniyor... Kameranızı QR koda tutun'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSessionId) {
                        const tok = typeof window !== 'undefined' ? localStorage.getItem('oxonom_pano_device_token') || '' : ''
                        window.open(`/remote?session=${encodeURIComponent(activeSessionId)}${tok ? `&token=${encodeURIComponent(tok)}` : ''}`, '_blank')
                      }
                    }}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-black text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Kumandayı Test Et</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRemotePairModalOpen(false)}
                    className="px-5 py-3 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. APPLICATION WINDOWS WITH FAST KEEP-ALIVE CACHE (HIZ OPTİMİZASYONU) */}
      {openWindows.map((win) => {
        const isVisible = activeWindowId === win.app.id
        return (
          <div
            key={win.app.id}
            style={{ display: isVisible ? 'block' : 'none' }}
          >
            <EduOSWindow
              windowState={win}
              orgslug={orgslug}
              onClose={() => handleCloseWindow(win.app.id)}
              onToggleMaximize={() => handleToggleMaximizeWindow(win.app.id)}
              onReload={() => handleReloadWindow(win.app.id)}
              onUserActivity={recordActivity}
            />
          </div>
        )
      })}

      {/* Background Pre-Warming of Shortcut Routes for 0-latency Window Opens */}
      {selectedClass && (
        <div className="hidden" aria-hidden="true">
          <link rel="prefetch" href={`/orgs/${orgslug}/dash/classrooms/${selectedClass.id}?tab=attendance&onlyTab=1&chrome=none&pano=1`} />
          <link rel="prefetch" href={`/orgs/${orgslug}/dash/boards?usergroupId=${selectedClass.id}&chrome=none&pano=1`} />
          <link rel="prefetch" href={`/orgs/${orgslug}/dash/assignments?usergroupId=${selectedClass.id}&chrome=none&pano=1`} />
          <link rel="prefetch" href={`/games?chrome=none&pano=1`} />
        </div>
      )}

      {/* 7. MOBILE BOTTOM DOCK (ÖĞRETMEN TELEFONU KONTROL DOCK'U) */}
      {isPhone && (
        <div className="fixed bottom-0 inset-x-0 z-[60] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-slate-950/85 backdrop-blur-2xl border-t border-white/10 shadow-2xl flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleToggleBoardLockFromPhone}
            className={`flex-1 max-w-[220px] py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
              isLocked
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80'
            }`}
          >
            {isLocked ? (
              <>
                <Unlock className="w-4 h-4 text-slate-950" />
                <span>Tahta Kilidini Aç</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Ekranı Kilitle</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* SEVİMLİ VE ANİMASYONLU TAHTA KAYDETME & ÇIKIŞ POPUP MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {logoutModalStep !== 'closed' && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => {
                if (!isSavingBoard) setLogoutModalStep('closed')
              }}
            />

            {logoutModalStep === 'ask_save' && (
              <motion.div
                key="modal_ask_save"
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -20 }}
                transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 shadow-2xl border border-indigo-100 dark:border-indigo-900/40 text-center overflow-hidden z-10"
              >
                {/* Cute Floating Decorative Bubbles */}
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-200/40 dark:bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-emerald-200/40 dark:bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

                {/* Animated Cute Bouncy Icon */}
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                  className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-5 relative"
                >
                  <Presentation className="w-10 h-10" />
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], rotate: [0, 15, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-md font-black text-xs"
                  >
                    ✨
                  </motion.div>
                </motion.div>

                {/* Class Badge */}
                {selectedClass && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-black mb-3">
                    <School className="w-3.5 h-3.5" />
                    <span>{selectedClass.name}</span>
                  </div>
                )}

                {/* Question Title */}
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  Ders Tahtanız Kaydedilsin mi? 🎨
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-2 leading-relaxed max-w-sm mx-auto">
                  Ders boyunca tahtaya yazdığınız notları ve çizimleri <strong>{selectedClass?.name || 'sınıf'} geçmişine</strong> ekleyip kaydedelim mi?
                </p>

                {/* Action Buttons */}
                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={isSavingBoard}
                    onClick={() => setLogoutModalStep('confirm_discard')}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <X className="w-4 h-4 opacity-70" />
                    <span>Hayır</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSavingBoard}
                    onClick={handleSaveAndLogout}
                    className="flex-1 py-3.5 px-5 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-sm shadow-lg shadow-purple-950/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    {isSavingBoard ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Kaydediliyor...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Evet, Kaydet ve Çık</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {logoutModalStep === 'confirm_discard' && (
              <motion.div
                key="modal_confirm_discard"
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -20 }}
                transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 shadow-2xl border border-amber-200 dark:border-amber-900/40 text-center overflow-hidden z-10"
              >
                {/* Cute Floating Decorative Glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-200/40 dark:bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-rose-200/40 dark:bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />

                {/* Animated Curious / Questioning Icon */}
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [-4, 4, -4] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 mb-5 relative"
                >
                  <span className="text-3xl select-none">🥺</span>
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-slate-800 text-amber-500 flex items-center justify-center shadow-md font-black text-xs"
                  >
                    ❓
                  </motion.div>
                </motion.div>

                {/* Question Title */}
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  Emin misiniz? 🎨
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-2 leading-relaxed max-w-sm mx-auto">
                  Kaydedilmeyen tahta çizimleri ve ders içerikleri <strong>silinecektir</strong>. Yine de kaydetmeden oturumu kapatmak istediğinize emin misiniz?
                </p>

                {/* Action Buttons */}
                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setLogoutModalStep('ask_save')}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Vazgeç, Geri Dön</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDiscardAndLogout}
                    className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Kaydetmeden Çıkış Yap</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
