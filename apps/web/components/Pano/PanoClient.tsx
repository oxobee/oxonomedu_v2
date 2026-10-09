'use client'
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useLHSession } from '@components/Contexts/LHSessionContext'
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
  Wifi
} from 'lucide-react'
import QRCode from 'qrcode'
import {
  ALL_CLASSROOMS,
  ALL_CLASSROOM_BOARDS,
  generateClassroomBoards,
  generateClassroomAssignments,
} from '@services/demo/schoolDirectory'
import { createBoard } from '@services/boards/boards'
import toast from 'react-hot-toast'
import PanoStandbyScreen from './PanoStandbyScreen'
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
  OxonomLogo: () => (
    <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
      <rect width="36" height="36" rx="10" fill="url(#oxonom-grad)" />
      <path d="M10 18C10 13.5817 13.5817 10 18 10C22.4183 10 26 13.5817 26 18C26 22.4183 22.4183 26 18 26C13.5817 26 10 22.4183 10 18Z" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="32 10" />
      <circle cx="18" cy="18" r="4" fill="white" />
      <defs>
        <linearGradient id="oxonom-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
    </svg>
  )
}


interface QuoteItem {
  text: string
  author?: string
}

interface PanoSettings {
  pin: string
  idleTimeout: number // seconds: 0 = never, 30, 60, 120, 300, 600
  unlockType: 'pin' | 'slide'
  quotes: QuoteItem[]
}

const INITIAL_CLASSROOMS: ClassroomItem[] = ALL_CLASSROOMS.map(c => ({
  id: c.id,
  name: c.name,
  gradeLevel: c.grade_level,
  studentCount: c.student_count || 30,
  boardCount: 5,
  attendance: '%100',
  teacherName: c.teacher_name,
  subject: c.org_id === 10 ? 'Sınıf Öğretmeni' : 'Branş Öğretmeni',
}))

const DEFAULT_CLASSROOMS: ClassroomItem[] = INITIAL_CLASSROOMS.length > 0 ? INITIAL_CLASSROOMS : [
  { id: 101, name: '1-A Şubesi', gradeLevel: '1. Sınıf', studentCount: 30, boardCount: 5, attendance: '%100', teacherName: 'Ahmet Hakan', subject: 'Matematik' },
  { id: 102, name: '1-B Şubesi', gradeLevel: '1. Sınıf', studentCount: 28, boardCount: 5, attendance: '%96', teacherName: 'Ahmet Hakan', subject: 'Matematik' },
  { id: 103, name: '2-A Şubesi', gradeLevel: '2. Sınıf', studentCount: 32, boardCount: 5, attendance: '%100', teacherName: 'Ayşe Öğretmen', subject: 'Sınıf Öğretmeni' },
  { id: 104, name: '3-A Şubesi', gradeLevel: '3. Sınıf', studentCount: 29, boardCount: 5, attendance: '%98', teacherName: 'Ahmet Hakan', subject: 'Matematik' },
  { id: 105, name: '4-B Şubesi', gradeLevel: '4. Sınıf', studentCount: 31, boardCount: 5, attendance: '%95', teacherName: 'Mehmet Öğretmen', subject: 'Fen Bilimleri' }
]

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
          <span className="text-8xl sm:text-9xl md:text-[10.5rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-50 to-slate-400 drop-shadow-[0_0_35px_rgba(244,63,94,0.4)]">
            {hours}
          </span>
          <span className="text-7xl sm:text-8xl md:text-9xl font-extralight text-rose-500 mx-3 sm:mx-6 animate-pulse drop-shadow-[0_0_25px_rgba(244,63,94,0.9)]">
            :
          </span>
          <span className="text-8xl sm:text-9xl md:text-[10.5rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-50 to-slate-400 drop-shadow-[0_0_35px_rgba(244,63,94,0.4)]">
            {minutes}
          </span>
        </div>

        <div className="mt-4 px-6 py-2 rounded-full bg-slate-900/70 border border-rose-500/20 backdrop-blur-2xl text-slate-200 text-sm sm:text-base md:text-lg font-medium tracking-wide shadow-2xl flex items-center gap-2.5 ring-1 ring-white/10">
          <Calendar className="w-4 h-4 text-rose-500" />
          <span>{dateFormatted}</span>
          <span className="text-slate-500">•</span>
          <span className="text-rose-300 font-bold capitalize">{weekday}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm md:text-base hidden sm:flex items-center gap-2 ${className}`}>
      <span>{time.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      <span className="text-slate-400">•</span>
      <span className="font-bold text-slate-900 dark:text-white font-mono">{time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  )
}

// Compact Weather Card
const CompactWeatherCard = () => (
  <div className="flex items-center gap-3.5 px-4 py-2.5 bg-gradient-to-br from-white/90 to-sky-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-xl rounded-2xl border border-sky-100/90 dark:border-slate-700/60 shadow-md">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
      <CloudSun className="w-6 h-6 drop-shadow-xs" />
    </div>
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">24°C</span>
        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">İstanbul</span>
      </div>
      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
        Açık & Güneşli • Nem %45
      </p>
    </div>
  </div>
)

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
      className="flex flex-col items-center gap-2.5 sm:gap-3 w-full cursor-pointer group relative select-none rounded-3xl p-1 focus:outline-hidden focus-visible:ring-4 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 transition-all"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <motion.div
        whileHover={{ scale: 1.08, y: -6 }}
        whileTap={{ scale: 0.94 }}
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl ${item.color} shadow-lg shadow-indigo-500/20 flex items-center justify-center relative transition-all duration-300 ring-1 ring-white/30 border-2 border-white/25 group-hover:shadow-2xl`}
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
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900 z-20 whitespace-nowrap">
            {item.badge}
          </span>
        )}
      </motion.div>
      <span className="font-extrabold text-slate-800 dark:text-slate-100 text-xs sm:text-sm md:text-base tracking-tight drop-shadow-xs truncate block px-1 w-full text-center pointer-events-none">
        {item.title}
      </span>
    </div>
  )
}

// 3D Neon Glass Lock Screen with Red Crimson Theme & Mechanical Numpad Popup
const NeonGlass3DLockScreen = ({
  user,
  org,
  settings,
  onUnlock,
  onLogout
}: {
  user: any
  org: any
  settings: PanoSettings
  onUnlock: () => void
  onLogout?: () => void
}) => {
  const [pinInput, setPinInput] = useState('')
  const [hasError, setHasError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [sliderProgress, setSliderProgress] = useState(0)
  const [isNumpadOpen, setIsNumpadOpen] = useState(false)
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const actualPin = settings.pin ? String(settings.pin).trim() : ''
  const targetPinLength = actualPin.length > 0 ? actualPin.length : 4

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    }
  }, [])

  // Prevent scrollbar on body and document while lock screen is active
  useEffect(() => {
    const origBody = document.body.style.overflow
    const origHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = origBody
      document.documentElement.style.overflow = origHtml
    }
  }, [])

  // Quotes State - slow, comfortable rotation (11 seconds)
  const quotes: QuoteItem[] = (settings.quotes && settings.quotes.length > 0 ? settings.quotes : DEFAULT_PANO_QUOTES).map(normalizeQuote)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % quotes.length)
    }, 11000)
    return () => clearInterval(timer)
  }, [quotes.length])

  const activeQuote = quotes[currentQuoteIndex % quotes.length] || quotes[0]

  const handleKeyClick = (digit: string) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(12) } catch (_) {}
    }

    if (isVerifying || isSuccess) return

    // If there was an error showing, clear it immediately and start a fresh input with this digit
    if (hasError) {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
      setHasError(false)
      const next = digit
      setPinInput(next)
      checkPin(next)
      return
    }

    // Never exceed the target pin length!
    if (pinInput.length >= targetPinLength) return

    const next = pinInput + digit
    setPinInput(next)
    checkPin(next)
  }

  const handleDelete = () => {
    if (isSuccess || isVerifying) return
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10) } catch (_) {}
    }
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    setHasError(false)
    setPinInput(prev => prev.slice(0, -1))
  }

  const handleClear = () => {
    if (isSuccess || isVerifying) return
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    setHasError(false)
    setPinInput('')
  }

  const checkPin = (current: string) => {
    if (!actualPin) {
      setIsNumpadOpen(false)
      onUnlock()
      return
    }

    if (current.length === targetPinLength) {
      if (current === actualPin) {
        setIsSuccess(true)
        setIsVerifying(true)
        if (typeof window !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate([30, 40, 30]) } catch (_) {}
        }
        setTimeout(() => {
          setIsNumpadOpen(false)
          setIsSuccess(false)
          setIsVerifying(false)
          setPinInput('')
          onUnlock()
        }, 400)
      } else {
        setHasError(true)
        setIsVerifying(true)
        if (typeof window !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate([40, 60, 40]) } catch (_) {}
        }
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
        errorTimeoutRef.current = setTimeout(() => {
          setPinInput('')
          setHasError(false)
          setIsVerifying(false)
        }, 650)
      }
    }
  }

  // Keyboard shortcut listener: Any numeric key opens numpad popup & types
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        setIsNumpadOpen(true)
        handleKeyClick(e.key)
      } else if (e.key === 'Backspace') {
        handleDelete()
      } else if (e.key === 'Escape') {
        setIsNumpadOpen(false)
      } else if (e.key === 'Enter') {
        if (!actualPin) {
          setIsNumpadOpen(false)
          onUnlock()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pinInput, actualPin, targetPinLength, hasError, isVerifying, isSuccess])

  const handleScreenTap = () => {
    if (settings.unlockType === 'slide') return
    if (!actualPin) {
      onUnlock()
      return
    }
    setIsNumpadOpen(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
      transition={{ type: "spring", damping: 28, stiffness: 200 }}
      onClick={handleScreenTap}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden h-screen w-screen max-h-screen max-w-screen font-sans [&::-webkit-scrollbar]:hidden cursor-pointer"
      style={{
        background: 'radial-gradient(ellipse at 50% 15%, #251014 0%, #15090b 50%, #070304 100%)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Eye-Friendly High-Tech Refined Dot Pattern with Subtle Red Ruby Hue */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.12) 1.2px, transparent 0),
            radial-gradient(circle at 19px 19px, rgba(244, 63, 94, 0.12) 1.2px, transparent 0)
          `,
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 20%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0.3) 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 20%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0.3) 100%)'
        }}
      />

      {/* Ambient Red Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[260px] bg-red-600/12 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header / Oturumu Kapat Button */}
      {onLogout && (
        <div className="absolute top-5 right-5 z-40">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onLogout()
            }}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.07] hover:bg-rose-500/25 active:bg-rose-500/35 border border-white/10 hover:border-rose-400/40 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer shadow-lg"
            title="Oturumu Kapat ve Eşleştirme Ekranına Dön"
          >
            <div className="w-3.5 h-3.5 opacity-80"><Icons.LogOut /></div>
            <span className="hidden sm:inline">Oturumu Kapat</span>
          </button>
        </div>
      )}

      {/* Top Header Spacer */}
      <div className="w-full h-2 shrink-0 pointer-events-none" />

      {/* Center Master Display */}
      <div className="relative z-10 flex flex-col items-center max-w-5xl w-full my-auto text-center px-4">
        {/* Futuristic Giant Clock (xx:xx format in Red Crimson Theme) */}
        <Clock detailed={true} />

        {/* Cinematic Animated Quotes Display (Large, No Header, Author in Separate Element Below) */}
        <div className="w-full max-w-4xl my-6 sm:my-8 px-4 flex flex-col items-center text-center">
          <div className="min-h-[100px] sm:min-h-[120px] flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuoteIndex}
                initial={{ opacity: 0, y: 20, scale: 0.96, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, scale: 0.98, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center text-center w-full"
              >
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white text-center leading-snug tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] max-w-4xl">
                  {activeQuote.text}
                </p>
                {activeQuote.author && activeQuote.author.trim() !== '' && (
                  <span className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl font-semibold text-rose-300/90 tracking-wide drop-shadow-md">
                    — {activeQuote.author.trim()}
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Footer Section: Static Unlock Button + OXONOM TECHNOLOGY with Sweeping Glow */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full pb-4 sm:pb-8 select-none shrink-0 space-y-6">
        {/* Kilidi Açmak İçin Dokunun Butonu (OXONOM TECHNOLOGY'nin üstünde sabit) */}
        {settings.unlockType === 'slide' ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs flex flex-col items-center"
          >
            <div className="relative w-full h-14 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center p-1.5 overflow-hidden shadow-inner">
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 230 }}
                dragElastic={0.1}
                onDrag={(_, info) => {
                  const progress = Math.min(Math.max(info.point.x / 230, 0), 1)
                  setSliderProgress(progress)
                }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 180) {
                    onUnlock()
                  }
                  setSliderProgress(0)
                }}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing z-20"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-300 pointer-events-none tracking-wider">
                Kilidi Açmak İçin Kaydırın ➔
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                handleScreenTap()
              }}
              className="px-9 py-3.5 rounded-full bg-white/[0.08] hover:bg-rose-500/20 active:bg-rose-500/30 border border-white/20 hover:border-rose-400/60 backdrop-blur-xl text-white font-bold text-sm sm:text-base flex items-center gap-3 shadow-2xl shadow-rose-950/40 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-rose-500/30 text-rose-300 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <span className="tracking-wide">Kilidi Açmak İçin Dokunun</span>
            </motion.button>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Ekrana dokunarak veya tuş takımından şifrenizi girebilirsiniz</p>
          </div>
        )}

        {/* OXONOM TECHNOLOGY with left-to-right animated sweeping neon glow */}
        <div className="relative overflow-hidden py-1 px-6 flex items-center justify-center">
          <span className="font-mono text-xs sm:text-sm md:text-base font-black text-rose-200/90 uppercase tracking-[0.45em] sm:tracking-[0.6em] drop-shadow-[0_2px_15px_rgba(244,63,94,0.35)] relative z-10">
            O X O N O M &nbsp; T E C H N O L O G Y
          </span>
          <motion.div
            initial={{ x: '-160%' }}
            animate={{ x: '260%' }}
            transition={{
              repeat: Infinity,
              duration: 3.2,
              ease: "easeInOut",
              repeatDelay: 2
            }}
            className="absolute inset-y-0 w-28 bg-gradient-to-r from-transparent via-rose-300/80 to-transparent blur-xs pointer-events-none mix-blend-screen z-20"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* NUMPAD POPUP MODAL (Wider, Mechanical Feel, Shake on Error, Green Glow on Success) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isNumpadOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              e.stopPropagation()
              setIsNumpadOpen(false)
            }}
            className="fixed inset-0 z-[230] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl select-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={
                hasError
                  ? { x: [-16, 16, -12, 12, -6, 6, 0], scale: 1, y: 0, opacity: 1 }
                  : { x: 0, scale: 1, y: 0, opacity: 1 }
              }
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative flex flex-col items-center p-8 sm:p-10 rounded-3xl bg-slate-900/95 ring-1 ring-white/10 max-w-md w-full sm:w-[420px] transition-all duration-300 ${
                isSuccess
                  ? 'border-2 border-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.8)]'
                  : 'border border-rose-500/30 shadow-[0_25px_70px_rgba(244,63,94,0.25)]'
              }`}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsNumpadOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500/20 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>

              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg transition-colors ${
                  isSuccess
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 shadow-emerald-950/50'
                    : 'bg-rose-500/20 border border-rose-500/30 text-rose-400 shadow-rose-950/50'
                }`}
              >
                {isSuccess ? <Unlock className="w-7 h-7 animate-pulse text-emerald-400" /> : <Lock className="w-6 h-6" />}
              </div>

              <h3 className={`font-black text-lg mb-1 transition-colors ${isSuccess ? 'text-emerald-400 animate-pulse' : 'text-white'}`}>
                {isSuccess ? 'Pano Açılıyor...' : 'Pano PIN Girişi'}
              </h3>
              <p className="text-xs text-slate-400 mb-6 text-center">
                {settings.pin ? `${settings.pin.length} haneli şifrenizi girin` : 'Şifresiz hızlı giriş için dokunun'}
              </p>

              {/* PIN Status Dots */}
              <div className="flex items-center gap-4 mb-7">
                {Array.from({ length: settings.pin.length || 4 }).map((_, i) => {
                  const isFilled = i < pinInput.length
                  return (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        isFilled
                          ? isSuccess
                            ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 border border-emerald-200 scale-125 shadow-[0_0_20px_rgba(16,185,129,1)]'
                            : 'bg-gradient-to-tr from-rose-500 to-red-400 border border-rose-200 scale-125 shadow-[0_0_15px_rgba(244,63,94,0.9)]'
                          : 'border border-white/30 bg-white/5'
                      } ${hasError ? '!border-red-500 !bg-red-500 animate-bounce' : ''}`}
                    />
                  )
                })}
              </div>

              {hasError && (
                <p className="text-red-400 text-xs font-bold mb-4 animate-pulse">
                  Hatalı PIN Kodu! Tekrar deneyin.
                </p>
              )}

              {/* Realistic Mechanical Keypad Grid (Wider, matching Image 1) */}
              <div data-grid-container="lock-numpad" className="grid grid-cols-3 gap-3.5 sm:gap-4 w-full">
                {[
                  { num: '1', sub: '' },
                  { num: '2', sub: 'ABC' },
                  { num: '3', sub: 'DEF' },
                  { num: '4', sub: 'GHI' },
                  { num: '5', sub: 'JKL' },
                  { num: '6', sub: 'MNO' },
                  { num: '7', sub: 'PQRS' },
                  { num: '8', sub: 'TUV' },
                  { num: '9', sub: 'WXYZ' }
                ].map(({ num, sub }) => (
                  <button
                    key={num}
                    type="button"
                    tabIndex={0}
                    data-grid-item="lock-numpad-key"
                    aria-label={`Rakam ${num}`}
                    onClick={() => handleKeyClick(num)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleKeyClick(num)
                      } else if (e.key.startsWith('Arrow')) {
                        handleGridArrowNav(e, 'lock-numpad-key')
                      } else if (e.key === 'Escape') {
                        e.preventDefault()
                        setIsNumpadOpen(false)
                      }
                    }}
                    onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })}
                    className="h-16 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-700/80 via-slate-800 to-slate-900 border-t border-l border-white/20 border-r border-b border-black/80 shadow-[0_4px_0_#1e0a0e,0_8px_15px_rgba(0,0,0,0.6)] active:translate-y-1 active:shadow-[0_0px_0_#1e0a0e,0_2px_5px_rgba(0,0,0,0.6)] active:border-rose-400/80 active:bg-rose-950/40 focus:outline-hidden focus-visible:ring-4 focus-visible:ring-rose-500 focus-visible:ring-offset-2 transition-all duration-75 text-white flex flex-col items-center justify-center cursor-pointer group"
                  >
                    <span className="font-mono text-2xl font-black group-hover:text-rose-300 transition-colors drop-shadow-xs">
                      {num}
                    </span>
                    {sub && (
                      <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase -mt-0.5 group-hover:text-rose-200">
                        {sub}
                      </span>
                    )}
                  </button>
                ))}

                {/* Bottom row: Clear, 0, Delete */}
                <button
                  type="button"
                  tabIndex={0}
                  data-grid-item="lock-numpad-key"
                  aria-label="Temizle"
                  onClick={handleClear}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleClear()
                    } else if (e.key.startsWith('Arrow')) {
                      handleGridArrowNav(e, 'lock-numpad-key')
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      setIsNumpadOpen(false)
                    }
                  }}
                  onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })}
                  className="h-16 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900 border-t border-l border-white/10 border-r border-b border-black/80 shadow-[0_4px_0_#1e0a0e,0_6px_10px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none focus:outline-hidden focus-visible:ring-4 focus-visible:ring-rose-500 focus-visible:ring-offset-2 text-slate-400 hover:text-white text-sm font-bold flex items-center justify-center cursor-pointer transition-all"
                  title="Temizle"
                >
                  C
                </button>

                <button
                  type="button"
                  tabIndex={0}
                  data-grid-item="lock-numpad-key"
                  aria-label="Rakam 0"
                  onClick={() => handleKeyClick('0')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleKeyClick('0')
                    } else if (e.key.startsWith('Arrow')) {
                      handleGridArrowNav(e, 'lock-numpad-key')
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      setIsNumpadOpen(false)
                    }
                  }}
                  onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })}
                  className="h-16 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-700/80 via-slate-800 to-slate-900 border-t border-l border-white/20 border-r border-b border-black/80 shadow-[0_4px_0_#1e0a0e,0_8px_15px_rgba(0,0,0,0.6)] active:translate-y-1 active:shadow-[0_0px_0_#1e0a0e,0_2px_5px_rgba(0,0,0,0.6)] active:border-rose-400/80 active:bg-rose-950/40 focus:outline-hidden focus-visible:ring-4 focus-visible:ring-rose-500 focus-visible:ring-offset-2 transition-all duration-75 text-white flex flex-col items-center justify-center cursor-pointer group"
                >
                  <span className="font-mono text-2xl font-black group-hover:text-rose-300 transition-colors drop-shadow-xs">
                    0
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase -mt-0.5">
                    +
                  </span>
                </button>

                <button
                  type="button"
                  tabIndex={0}
                  data-grid-item="lock-numpad-key"
                  aria-label="Sil"
                  onClick={handleDelete}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleDelete()
                    } else if (e.key.startsWith('Arrow')) {
                      handleGridArrowNav(e, 'lock-numpad-key')
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      setIsNumpadOpen(false)
                    }
                  }}
                  onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })}
                  className="h-16 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-700/80 via-slate-800 to-slate-900 border-t border-l border-white/20 border-r border-b border-black/80 shadow-[0_4px_0_#1e0a0e,0_8px_15px_rgba(0,0,0,0.6)] active:translate-y-1 active:shadow-[0_0px_0_#1e0a0e,0_2px_5px_rgba(0,0,0,0.6)] active:border-rose-400/80 active:bg-rose-950/40 focus:outline-hidden focus-visible:ring-4 focus-visible:ring-rose-500 focus-visible:ring-offset-2 transition-all duration-75 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer group"
                  title="Sil"
                >
                  <Delete className="w-6 h-6 text-slate-400 group-hover:text-rose-400 transition-colors" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

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
    <div className="fixed inset-0 z-[240] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in-50 duration-200 select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl flex flex-col overflow-hidden text-slate-800 dark:text-white">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/30">
            <School className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Ders Başlıyor! Lütfen Sınıfınızı Seçin</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Akıllı tahta, öğrenci listesi, yoklama ve ödevler seçtiğiniz şubeye göre otomatik yapılandırılır.
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
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {c.attendance} Katılım
                  </span>
                  {isSelected && <Check className="w-5 h-5 text-indigo-600" />}
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

  // Classrooms list
  const [classrooms, setClassrooms] = useState<ClassroomItem[]>(DEFAULT_CLASSROOMS)

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

  // Board is always the board — no phone remote control mode
  const isPhone = false
  const connectionStatus = 'connected' as const

  // Handle successful pairing from Standby Screen
  const handlePaired = async (teacherData: TeacherPairData) => {
    setPairedSession(teacherData)
    setIsPhoneConnected(true)
    setForceStandby(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oxonom_pano_force_standby')
    }

    const sId = (teacherData as any).sessionId || searchParams?.get('session') || ''
    if (sId) {
      setActiveSessionId(sId)
      if (typeof window !== 'undefined') {
        localStorage.setItem('oxonom_pano_active_session_id', sId)
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_pano_paired_session', JSON.stringify(teacherData))
    }
    if (teacherData.settings) {
      setSettings(teacherData.settings)
      if (typeof window !== 'undefined') {
        localStorage.setItem('oxonom_pano_settings', JSON.stringify(teacherData.settings))
      }
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

  // Handle Logout -> clears local state, calls backend logout, resets to Standby Screen or redirects
  const handleLogout = async () => {
    try {
      await fetch('/api/pano/pair/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSessionId }),
      })
    } catch (_) {}

    if (typeof window !== 'undefined') {
      localStorage.removeItem('oxonom_pano_paired_session')
      localStorage.removeItem('oxonom_pano_active_session_id')
      localStorage.removeItem('oxonom_pano_is_locked')
      localStorage.removeItem('oxonom_pano_selected_class_id')
      localStorage.setItem('oxonom_pano_force_standby', 'true')
    }

    if (typeof document !== 'undefined') {
      document.cookie = 'LH_session=; path=/; max-age=0'
      document.cookie = 'LH_org=; path=/; max-age=0'
    }

    setPairedSession(null)
    setActiveSessionId(null)
    setSelectedClass(null)
    setOpenWindows([])
    setActiveWindowId(null)
    setIsLocked(false)
    setIsProfileOpen(false)
    sessionInitializedRef.current = false

    if (session?.update) {
      session.update(true).catch(() => {})
    }

    if (isPhone) {
      toast.success('Pano oturumu kapatıldı.')
      router.push('/dash/connect-board')
    } else {
      setForceStandby(true)
      toast.success('Pano oturumu kapatıldı.')
    }
  }


  // Load Saved Settings & Selected Class from localStorage
  useEffect(() => {
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
      if (savedClassId) {
        let teacherClasses = classrooms
        if (savedPair) {
          try {
            const p = JSON.parse(savedPair)
            if (p.classrooms && Array.isArray(p.classrooms) && p.classrooms.length > 0) {
              teacherClasses = p.classrooms
            }
          } catch (_) {}
        }
        const found = teacherClasses.find((c: ClassroomItem) => c.id === Number(savedClassId))
        if (found) {
          setSelectedClass(found)
        } else {
          setSelectedClass(null)
          localStorage.removeItem('oxonom_pano_selected_class_id')
        }
      } else {
        setSelectedClass(null)
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



  // Native Fullscreen State & Toggle
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
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

  // Live Dynamic Class Stats (User Rule: "Pano ekranında veriler hep güncel olmalı sayfayı yenilemek gerekmemeli")
  const [dataSyncTrigger, setDataSyncTrigger] = useState(0)

  useEffect(() => {
    const handleSync = () => {
      setDataSyncTrigger((prev) => prev + 1)
    }

    // Custom App Events
    window.addEventListener('oxonom_assignments_updated', handleSync)
    window.addEventListener('oxonom_boards_updated', handleSync)
    window.addEventListener('oxonom_attendance_updated', handleSync)
    window.addEventListener('oxonom_pano_sync', handleSync)

    // Storage Event (catches changes made by child iframes or other tabs to localStorage)
    const handleStorage = (e: StorageEvent) => {
      if (
        !e.key ||
        e.key.includes('board') ||
        e.key.includes('assignment') ||
        e.key.includes('attendance') ||
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
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('message', handleMessage)
      clearInterval(heartbeat)
    }
  }, [])

  const liveBoardCount = useMemo(() => {
    if (!selectedClass) return 5
    const defaultCount = ALL_CLASSROOM_BOARDS.filter(b => b.usergroup_id === selectedClass.id).length
    let customCount = 0
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oxonom_custom_boards')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            customCount = parsed.filter((b: any) => b.usergroup_id === selectedClass.id).length
          }
        }
      } catch (_) {}
    }
    const computedTotal = Math.max(5, (defaultCount || 5) + customCount)
    return (selectedClass.boardCount && selectedClass.boardCount > computedTotal) ? selectedClass.boardCount : computedTotal
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

  const [savedAttendanceRate, setSavedAttendanceRate] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedClass) return
    const checkAttendance = () => {
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(`oxonom_attendance_${selectedClass.id}`)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed && parsed.rate !== undefined) {
              setSavedAttendanceRate(`%${parsed.rate}`)
              return
            }
          }
        } catch (_) {}
      }
      setSavedAttendanceRate(null)
    }
    checkAttendance()
  }, [selectedClass, dataSyncTrigger])

  const liveAttendanceRate = useMemo(() => {
    if (savedAttendanceRate) return savedAttendanceRate
    if (selectedClass?.attendance) return selectedClass.attendance
    return '%100'
  }, [savedAttendanceRate, selectedClass])

  // The 5 Apps requested in exact order: Akıllı Tahta - Ödevler - Modüller - Kaynaklar - Oyunlar
  const apps: AppItem[] = useMemo(() => [
    {
      id: 'board',
      type: 'app',
      title: 'Akıllı Tahta',
      icon: 'Board',
      color: 'bg-blue-600',
      iconColor: 'text-white',
      badge: selectedClass ? `${liveBoardCount} Tahta` : undefined,
      path: selectedClass ? `/dash/boards?usergroupId=${selectedClass.id}` : `/dash/boards`
    },
    {
      id: 'homework',
      type: 'app',
      title: 'Ödevler',
      icon: 'Homework',
      color: 'bg-purple-600',
      iconColor: 'text-white',
      badge: `${liveAssignmentCount} Aktif`,
      path: selectedClass ? `/dash/assignments?usergroupId=${selectedClass.id}` : `/dash/assignments`
    },
    {
      id: 'playgrounds',
      type: 'app',
      title: 'Modüller',
      icon: 'Playgrounds',
      color: 'bg-emerald-600',
      iconColor: 'text-white',
      badge: 'İnteraktif',
      path: `/dash/playgrounds`
    },
    {
      id: 'library',
      type: 'app',
      title: 'Kaynaklar',
      icon: 'Attendance',
      color: 'bg-orange-500',
      iconColor: 'text-white',
      path: `/library`
    },
    {
      id: 'games',
      type: 'app',
      title: 'Oyunlar',
      icon: 'Games',
      color: 'bg-indigo-600',
      iconColor: 'text-white',
      badge: 'Atölye',
      path: `/games`
    }
  ], [selectedClass, liveBoardCount, liveAssignmentCount])

  // Check active teacher session (paired via QR/OTP or directly logged in)
  const hasActiveTeacher = !forceStandby && (!!pairedSession || (!!user && isTeacher))
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
    if (sessionInitializedRef.current) return

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

        // Only create a new session if no valid active session exists
        const teacherPayload = pairedSession || (user ? {
          id: user.id,
          username: user.username || user.email,
          email: user.email,
          first_name: user.first_name || 'Öğretmen',
          last_name: user.last_name || '',
          orgSlug: orgslug,
          classrooms: classrooms,
          selectedClassId: selectedClassRef.current?.id || null,
          activeClassName: selectedClassRef.current?.name || '',
        } : null)

        const res = await fetch('/api/pano/pair/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacherData: teacherPayload,
            ttlMs: 45 * 60 * 1000,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success && data.session && !isCancelled) {
            const newSessId = data.session.sessionId
            setActiveSessionId(newSessId)
            if (data.session.code) setPairingCode(data.session.code)
            sessionInitializedRef.current = true
            if (typeof window !== 'undefined') {
              localStorage.setItem('oxonom_pano_active_session_id', newSessId)
              if (data.session.boardDeviceToken) {
                localStorage.setItem('oxonom_pano_device_token', data.session.boardDeviceToken)
              }
            }
          }
        }
      } catch (_) {
      } finally {
        isEnsuringSessionRef.current = false
      }
    }

    ensureValidSession()
    return () => { isCancelled = true }
  }, [hasActiveTeacher])

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

  // 1. Akıllı Tahta Bekleme Ekranı (Standby Screen):
  // Eğer sistemde aktif bir öğretmen oturumu yoksa, Standby Ekranı gösterilir!
  if (!hasActiveTeacher) {
    return <PanoStandbyScreen onPaired={handlePaired} />
  }

  // User Guard: Only Teachers can access Pano (if logged in with non-teacher account and not paired)
  if (!pairedSession && user && (isStudent || isAdmin)) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white font-sans select-none">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Pano Modu Öğretmenlere Özeldir</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Oxonom Edu Pano OS akıllı tahta ve sınıf etkileşimi için yalnızca öğretmen profillerine açıktır.
            {isStudent ? ' Öğrenci hesabınızla panoya erişemezsiniz.' : ' İdare ve müdür hesapları yönetim panelini kullanmalıdır.'}
          </p>
          <Link
            href="/dash"
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all text-center"
          >
            Yönetim Paneline Dön
          </Link>
        </div>
      </div>
    )
  }

  const effectiveUser = pairedSession || user
  const displayName =
    (effectiveUser?.first_name ? `${effectiveUser.first_name} ${effectiveUser.last_name || ''}`.trim() : '') ||
    effectiveUser?.full_name ||
    effectiveUser?.name ||
    selectedClass?.teacherName ||
    effectiveUser?.username ||
    'Öğretmen'

  // apps is already memoized above and ready for rendering and remote control


  return (
    <div
      onPointerDownCapture={recordActivity}
      onTouchStartCapture={recordActivity}
      className={`fixed inset-0 w-screen h-screen flex flex-col relative overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans select-none m-0 p-0 z-10 touch-manipulation overscroll-none ${isPhone ? 'pb-24' : ''}`}
      style={{
        backgroundImage: `
          radial-gradient(at 35% 15%, hsla(228,100%,74%,0.16) 0px, transparent 50%),
          radial-gradient(at 80% 5%, hsla(189,100%,56%,0.16) 0px, transparent 50%),
          radial-gradient(at 10% 60%, hsla(355,100%,93%,0.22) 0px, transparent 50%)
        `,
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'pan-x pan-y',
        overscrollBehavior: 'none'
      }}
    >
      {/* 1. PROFESSIONAL 3D NEON GLASS LOCK SCREEN (ONLY ON BOARD) */}
      <AnimatePresence>
        {isLocked && !isPhone && (
          <NeonGlass3DLockScreen
            user={effectiveUser}
            org={org}
            settings={settings}
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

      {/* 2. TOPBAR */}
      <div className="w-full px-4 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center z-40 relative border-b border-white/40 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shrink-0">
        {/* Left: Brand Logo */}
        <div className="flex items-center">
          <Link href={getUriWithOrg(orgslug, '/')} className="flex items-center group cursor-pointer" title="Ana Sayfaya Dön">
            <div className="h-10 sm:h-12 flex items-center group-hover:scale-105 transition-transform">
              <img
                src="/oxonom_edu_logo.png"
                alt="Oxonom Edu"
                className="h-9 sm:h-11 md:h-12 w-auto object-contain dark:invert transition-all drop-shadow-xs"
              />
            </div>
          </Link>
        </div>

        {/* Center: Live Clock */}
        <Clock />

        {/* Right: Connection Status, Settings, Lock, Profile */}
        <div className="flex items-center gap-2.5 relative" ref={popupRef}>
          {/* Realtime Phone Remote Connection Status Pill (Interactive Modal Trigger) */}
          {/* Mobil Uzaktan Kumanda Butonu (Kullanıcı İsteği ile Şimdilik Gizlendi) */}
          {false && activeSessionId && (
            <button
              type="button"
              onClick={() => setIsRemotePairModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide border shadow-xs transition-all cursor-pointer select-none ${
                isPhoneConnected
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 ring-1 ring-emerald-500/20'
                  : 'bg-indigo-50/80 dark:bg-slate-800/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
              }`}
              title="Mobil uzaktan kumanda bağlantı durumunu ve QR kodunu görüntüle"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isPhoneConnected
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className="hidden sm:inline">
                {isPhoneConnected ? '📱 Telefon Bağlı' : '📱 Kumanda Bağla'}
              </span>
            </button>
          )}
          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-xs flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors cursor-pointer border border-white/60 dark:border-slate-700"
            title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4 text-indigo-500" /> : <Maximize className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Lock Screen Button */}
          <button
            onClick={lockPano}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-xs flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors cursor-pointer border border-white/60 dark:border-slate-700"
            title="Ekranı Kilitle"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Profile Pill */}
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full shadow-xs cursor-pointer transition-all border ${
              isProfileOpen
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-200'
                : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border-white/60 dark:border-slate-700'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center shadow-inner">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs hidden sm:block truncate max-w-[120px]">
              {displayName}
            </span>
          </div>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.25 }}
                className="absolute right-0 top-12 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 dark:border-slate-800 overflow-hidden flex flex-col z-[100]"
              >
                <div className="p-3.5 bg-slate-50/60 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-800 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 dark:text-white text-xs leading-tight truncate">{displayName}</h4>
                    <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">Sınıf Öğretmeni</p>
                  </div>
                </div>
                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => { dispatch({ type: 'OPEN_MODAL', modalId: 'settings' }); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer text-left"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Pano Ayarları</span>
                  </button>
                  <button
                    onClick={() => { dispatch({ type: 'OPEN_MODAL', modalId: 'class_selection' }); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer text-left"
                  >
                    <School className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Şube / Sınıf Değiştir</span>
                  </button>
                  <Link
                    href={getUriWithOrg(orgslug, '/dash')}
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Yönetim Paneline Git</span>
                  </Link>
                  <button
                    onClick={() => { lockPano(); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer text-left"
                  >
                    <Lock className="w-3.5 h-3.5 opacity-70" />
                    <span>Ekranı Kilitle</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors cursor-pointer text-left"
                  >
                    <div className="w-3.5 h-3.5 opacity-70"><Icons.LogOut /></div>
                    <span>Oturumu Kapat</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                  {isPhone ? '📱 KUMANDA MODU • ZORUNLU SINIF SEÇİMİ' : '🖥️ AKILLI TAHTA • ZORUNLU SINIF SEÇİMİ'}
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
                        className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 border-2 border-slate-200/80 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between text-left cursor-pointer group select-none focus:outline-hidden focus-visible:ring-4 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                      >
                        <div className="flex items-start justify-between gap-3 w-full mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                              {c.name.split(' ')[0]}
                            </div>
                            <div>
                              <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {c.name}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                {c.gradeLevel} • {c.teacherName || displayName}
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                            {c.attendance || '%100'}
                          </span>
                        </div>
      
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 w-full">
                          <div className="flex items-center gap-3 font-medium">
                            <span>👥 <strong>{c.studentCount}</strong> Öğrenci</span>
                            <span>📋 <strong>{c.boardCount}</strong> Tahta</span>
                          </div>
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
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

          {/* Top Row: Greeting & Compact Weather */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <span className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-300 tracking-tight">
                  Merhaba,
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 border border-indigo-500/25 shadow-xs backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 dark:from-indigo-400 dark:via-purple-300 dark:to-indigo-300 bg-clip-text text-transparent tracking-tight">
                    {displayName}
                  </span>
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 italic mt-1.5">
                “Yeni Nesil Sizin Eseriniz Olacaktır!”
              </p>
            </div>
            <CompactWeatherCard />
          </div>

          {/* ======================================================== */}
          {/* HERO ALANI (MODERN, GLASSMORPHIC & EXPANDED)            */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-6 sm:p-8 space-y-6"
          >
            {/* Ambient decorative glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 rounded-full bg-gradient-to-tr from-blue-500/10 via-emerald-500/10 to-transparent blur-3xl pointer-events-none" />

            {/* Header: Class Name & Teacher Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
                    {selectedClass.name}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-black shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Aktif Sınıf
                  </span>
                  <button
                    onClick={() => dispatch({ type: 'OPEN_MODAL', modalId: 'class_selection' })}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                  >
                    <span>Şube Değiştir</span>
                    <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                  <span>Kurum: <strong className="text-slate-800 dark:text-slate-200">{org?.name || 'Necla Görer İlkokulu'}</strong></span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span>Sınıf Öğretmeni: <strong className="text-indigo-600 dark:text-indigo-400">{selectedClass.teacherName || displayName} ({selectedClass.subject || 'Matematik'})</strong></span>
                </div>
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 relative z-10">
              {/* 1. KADEME */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-slate-50/60 dark:from-slate-800/60 dark:to-indigo-950/20 border border-indigo-100/80 dark:border-slate-800 flex items-center gap-3.5 transition-all hover:border-indigo-300">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">KADEME</span>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{selectedClass.gradeLevel}</span>
                </div>
              </div>

              {/* 2. ÖĞRENCİ */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-slate-50/60 dark:from-slate-800/60 dark:to-emerald-950/20 border border-emerald-100/80 dark:border-slate-800 flex items-center gap-3.5 transition-all hover:border-emerald-300">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">ÖĞRENCİ</span>
                  <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400">{selectedClass.studentCount} Kayıtlı</span>
                </div>
              </div>

              {/* 3. TAHTA */}
              <div
                onClick={() => {
                  openAppInWindow({
                    id: 'past_boards',
                    type: 'app',
                    title: `${selectedClass.name} - Geçmiş Tahtalar`,
                    icon: 'Board',
                    color: 'bg-blue-600',
                    iconColor: 'text-white',
                    badge: `${liveBoardCount} Tahta`,
                    path: `/dash/boards?usergroupId=${selectedClass.id}`
                  })
                }}
                className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50/60 to-slate-50/60 dark:from-slate-800/60 dark:to-cyan-950/20 border border-cyan-100/80 dark:border-slate-800 flex items-center gap-3.5 cursor-pointer hover:border-cyan-400 transition-all hover:-translate-y-0.5"
                title="Sınıfın geçmiş tahtalarını aç"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                  <Presentation className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">TAHTA</span>
                  <span className="text-base sm:text-lg font-black text-cyan-700 dark:text-cyan-400">{liveBoardCount} Aktif</span>
                </div>
              </div>

              {/* 4. YOKLAMA */}
              <div
                onClick={() => {
                  openAppInWindow({
                    id: 'class_attendance',
                    type: 'app',
                    title: `${selectedClass.name} - Günlük Yoklama`,
                    icon: 'Attendance',
                    color: 'bg-purple-600',
                    iconColor: 'text-white',
                    path: `/dash/classrooms/${selectedClass.id}?tab=attendance&onlyTab=1`
                  })
                }}
                className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/60 to-slate-50/60 dark:from-slate-800/60 dark:to-purple-950/20 border border-purple-100/80 dark:border-slate-800 flex items-center gap-3.5 cursor-pointer hover:border-purple-400 transition-all hover:-translate-y-0.5"
                title="Yoklama listesini aç"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">YOKLAMA</span>
                  <span className="text-base sm:text-lg font-black text-purple-700 dark:text-purple-400">{liveAttendanceRate} Katılım</span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* HERO ALTINDAKİ BUTONLAR (GENİŞ & DOLDURAN 3'LÜ GRID)    */}
            {/* ======================================================== */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
                {/* 1. Tahtalar Butonu */}
                <button
                  type="button"
                  onClick={() => {
                    openAppInWindow({
                      id: 'past_boards',
                      type: 'app',
                      title: `${selectedClass.name} - Geçmiş Tahtalar`,
                      icon: 'Board',
                      color: 'bg-blue-600',
                      iconColor: 'text-white',
                      badge: `${selectedClass.boardCount} Tahta`,
                      path: `/dash/boards?usergroupId=${selectedClass.id}`
                    })
                  }}
                  className="w-full px-5 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 to-blue-50/80 dark:from-indigo-950/40 dark:to-blue-950/30 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/80 hover:bg-indigo-100/90 dark:hover:bg-indigo-900/60 transition-all flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Presentation className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-black">Tahtalar</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs bg-indigo-200/80 dark:bg-indigo-900/80 text-indigo-900 dark:text-indigo-200 font-black">
                    {liveBoardCount} Tahta
                  </span>
                </button>

                {/* 2. Yoklama Butonu */}
                <button
                  type="button"
                  onClick={() => {
                    openAppInWindow({
                      id: 'class_attendance',
                      type: 'app',
                      title: `${selectedClass.name} - Günlük Yoklama`,
                      icon: 'Attendance',
                      color: 'bg-purple-600',
                      iconColor: 'text-white',
                      path: `/dash/classrooms/${selectedClass.id}?tab=attendance&onlyTab=1`
                    })
                  }}
                  className="w-full px-5 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-purple-50/90 to-pink-50/80 dark:from-purple-950/40 dark:to-pink-950/30 text-purple-700 dark:text-purple-300 font-bold border border-purple-200/80 dark:border-purple-800/80 hover:bg-purple-100/90 dark:hover:bg-purple-900/60 transition-all flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-black">Yoklama</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs bg-purple-200/80 dark:bg-purple-900/80 text-purple-900 dark:text-purple-200 font-black">
                    {liveAttendanceRate}
                  </span>
                </button>

                {/* 3. Ödevler Butonu */}
                <button
                  type="button"
                  onClick={() => {
                    const hwApp = apps.find(a => a.id === 'homework')
                    if (hwApp) openAppInWindow(hwApp)
                  }}
                  className="w-full px-5 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/30 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/60 transition-all flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-black">Ödevler</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 font-black">
                    {liveAssignmentCount} Aktif
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* APPS & SHORTCUTS (TEK SIRA 5 İKON)                       */}
          {/* ======================================================== */}
          <div className="pt-2">
            <h2 className="text-xs sm:text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 pl-1">
              Uygulamalar
            </h2>

            <div className="grid grid-cols-5 gap-3 sm:gap-4 md:gap-6 w-full max-w-5xl mx-auto">
              {apps.map((item) => (
                <GridItem
                  key={item.id}
                  item={item}
                  onAction={(app) => {
                    if (app.id === 'board') {
                      dispatch({ type: 'OPEN_MODAL', modalId: 'new_board' })
                    } else {
                      openAppInWindow(app)
                    }
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
      )}

      {/* 4. INITIAL & ON-DEMAND CLASS SELECTION MODAL */}
      <ClassSelectionModal
        isOpen={isClassModalOpen}
        onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
        classrooms={classrooms}
        selectedClassId={selectedClass?.id || 0}
        onSelect={handleSelectClass}
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

          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 max-w-[220px] py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer shadow-lg shadow-rose-600/30 active:scale-95 border border-rose-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Oturumu Kapat</span>
          </button>
        </div>
      )}
    </div>
  )
}
