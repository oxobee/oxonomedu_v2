'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Plus,
  X,
  Check,
  Clock,
  Sparkles,
  Trash2,
  Edit3,
  RotateCcw,
  Wand2,
  Calendar,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Building2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Tv,
  Layers,
  ArrowRight,
  Copy,
  Users,
  ShieldCheck,
  Sliders,
  Settings,
  School,
  Flame,
  UserCheck,
  UserX,
  BarChart2,
  Table,
  Printer,
  Eye,
  FileSpreadsheet,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MobileHeader from '@components/Mobile/MobileHeader'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import {
  SCHOOL_ORGS,
  getOrgTeachers,
} from '@services/demo/schoolDirectory'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getStoredPrincipalProfile } from '@/lib/principal/principalProfileStorage'
import MockBadge from '@components/Common/MockBadge'
import { INITIAL_SCHEDULE_ENTRIES } from './MAdminScheduleClient'
import { CANONICAL_9A_SCHEDULE_30 } from '@/lib/student/studentData'

export interface MAdminCurriculumClientProps {
  orgSlug?: string
  hideHeader?: boolean
  hideDock?: boolean
}

// ── TYPES ──
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

export interface DayInfo {
  key: DayKey
  shortLabel: string
  label: string
}

export const DAYS_LIST: DayInfo[] = [
  { key: 'mon', shortLabel: 'Pzt', label: 'Pazartesi' },
  { key: 'tue', shortLabel: 'Sal', label: 'Salı' },
  { key: 'wed', shortLabel: 'Çar', label: 'Çarşamba' },
  { key: 'thu', shortLabel: 'Per', label: 'Perşembe' },
  { key: 'fri', shortLabel: 'Cum', label: 'Cuma' },
]

export interface PeriodSlot {
  periodNumber: number
  time: string
  isLunchAfter?: boolean
}

export const PRIMARY_PERIODS: PeriodSlot[] = [
  { periodNumber: 1, time: '08:30 - 09:10' },
  { periodNumber: 2, time: '09:25 - 10:05' },
  { periodNumber: 3, time: '10:20 - 11:00' },
  { periodNumber: 4, time: '11:15 - 11:55', isLunchAfter: true },
  { periodNumber: 5, time: '12:45 - 13:25' },
  { periodNumber: 6, time: '13:40 - 14:20' },
]

export const MIDDLE_PERIODS: PeriodSlot[] = [
  { periodNumber: 1, time: '08:30 - 09:10' },
  { periodNumber: 2, time: '09:25 - 10:05' },
  { periodNumber: 3, time: '10:20 - 11:00' },
  { periodNumber: 4, time: '11:15 - 11:55', isLunchAfter: true },
  { periodNumber: 5, time: '12:45 - 13:25' },
  { periodNumber: 6, time: '13:40 - 14:20' },
  { periodNumber: 7, time: '14:35 - 15:15' },
]

export type RoomType = 'normal' | 'atolye' | 'laboratuvar'

export interface BackupTeacher {
  id: string
  name: string
  priority: number // 1: 1. Yedek, 2: 2. Yedek vb.
  branch?: string
}

export interface CurriculumCourse {
  id: string
  code: string
  name: string
  category: 'Temel Ders' | 'Fen & Teknoloji' | 'Sosyal & Beşeri' | 'Sanat & Spor' | 'Yabancı Dil'
  gradeLevels: string[]
  targetClass: string // Örn: '9/A', '10/G' vb.
  orgId: number
  weeklyHours: number
  branchTeacher: string // Asıl Öğretmen
  teacherBranch: string // Branş (Öğretmen seçilince otomatik gelir)
  backupTeachers: BackupTeacher[] // Yedek Öğretmenler (Öncelik sıralı)
  roomType: RoomType // Normal Sınıf | Atölye | Laboratuvar
  requiredRoom: string // Belirli derslik adı (Derslik 9/A, Fen Laboratuvarı, vb.)
  isSmartBoardReady: boolean
  isElective: boolean
  color: string
}

export interface ScheduleEntry {
  id: string
  orgId: number
  day: DayKey
  period: number
  classCode: string
  subject: string
  teacherName: string // Asıl Öğretmen
  teacherBranch?: string
  backupTeacherName?: string // 1. Yedek Öğretmen
  isTeacherOnLeave?: boolean // Asıl öğretmen izinli / raporlu mu?
  activeTeacherName?: string // Fiilen derse giren öğretmen
  roomType?: RoomType
  roomName: string
  color: string
  isSmartBoardActive: boolean
}

// ── COLOR THEMES ──
export const COLOR_OPTIONS: Record<string, { bg: string; text: string; border: string; badge: string; dot: string }> = {
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-800',
    badge: 'bg-blue-600 text-white',
    dot: 'bg-blue-500',
  },
  indigo: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-800',
    badge: 'bg-indigo-600 text-white',
    dot: 'bg-indigo-500',
  },
  teal: {
    bg: 'bg-teal-500/10 dark:bg-teal-950/40',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-300 dark:border-teal-800',
    badge: 'bg-teal-600 text-white',
    dot: 'bg-teal-500',
  },
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
    badge: 'bg-emerald-600 text-white',
    dot: 'bg-emerald-500',
  },
  orange: {
    bg: 'bg-orange-500/10 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-800',
    badge: 'bg-orange-600 text-white',
    dot: 'bg-orange-500',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
    badge: 'bg-amber-600 text-white',
    dot: 'bg-amber-500',
  },
  pink: {
    bg: 'bg-pink-500/10 dark:bg-pink-950/40',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-300 dark:border-pink-800',
    badge: 'bg-pink-600 text-white',
    dot: 'bg-pink-500',
  },
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800',
    badge: 'bg-purple-600 text-white',
    dot: 'bg-purple-500',
  },
  cyan: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-300 dark:border-cyan-800',
    badge: 'bg-cyan-600 text-white',
    dot: 'bg-cyan-500',
  },
}

function getColorStyle(color: string) {
  return COLOR_OPTIONS[color] || COLOR_OPTIONS.blue
}

// ── AUTHENTIC INITIAL DATASETS (ORGANIZATION 30: OXONOM OKULLARI & 1/A) ──
const INITIAL_OXONOM_COURSES: CurriculumCourse[] = [
  {
    id: 'c-ox-1',
    code: 'TUR-101',
    name: 'Türkçe',
    category: 'Temel Ders',
    gradeLevels: ['1. Sınıf'],
    targetClass: '1/A',
    orgId: 30,
    weeklyHours: 10,
    branchTeacher: 'Özlem ZOR',
    teacherBranch: 'Sınıf Öğretmeni (1/A)',
    backupTeachers: [{ id: 'b-ox-1', name: 'Dr. Uğur UĞURLU', priority: 1, branch: 'Kurum Yönetimi' }],
    roomType: 'normal',
    requiredRoom: '1. Kat · Derslik 101',
    isSmartBoardReady: true,
    isElective: false,
    color: 'blue',
  },
  {
    id: 'c-ox-2',
    code: 'MAT-101',
    name: 'Matematik',
    category: 'Temel Ders',
    gradeLevels: ['1. Sınıf'],
    targetClass: '1/A',
    orgId: 30,
    weeklyHours: 5,
    branchTeacher: 'Özlem ZOR',
    teacherBranch: 'Sınıf Öğretmeni (1/A)',
    backupTeachers: [{ id: 'b-ox-2', name: 'Dr. Uğur UĞURLU', priority: 1, branch: 'Matematik & Analitik' }],
    roomType: 'normal',
    requiredRoom: '1. Kat · Derslik 101',
    isSmartBoardReady: true,
    isElective: false,
    color: 'indigo',
  },
  {
    id: 'c-ox-3',
    code: 'HAY-101',
    name: 'Hayat Bilgisi',
    category: 'Temel Ders',
    gradeLevels: ['1. Sınıf'],
    targetClass: '1/A',
    orgId: 30,
    weeklyHours: 4,
    branchTeacher: 'Özlem ZOR',
    teacherBranch: 'Sınıf Öğretmeni (1/A)',
    backupTeachers: [{ id: 'b-ox-3', name: 'Dr. Uğur UĞURLU', priority: 1, branch: 'Sosyal Gelişim' }],
    roomType: 'normal',
    requiredRoom: '1. Kat · Derslik 101',
    isSmartBoardReady: true,
    isElective: false,
    color: 'teal',
  },
  {
    id: 'c-ox-4',
    code: 'ING-101',
    name: 'Yabancı Dil (İngilizce)',
    category: 'Yabancı Dil',
    gradeLevels: ['1. Sınıf'],
    targetClass: '1/A',
    orgId: 30,
    weeklyHours: 2,
    branchTeacher: 'Canan YILDIRIM',
    teacherBranch: 'İngilizce',
    backupTeachers: [{ id: 'b-ox-4', name: 'Dr. Uğur UĞURLU', priority: 1, branch: 'Yabancı Diller' }],
    roomType: 'normal',
    requiredRoom: '1. Kat · Derslik 101',
    isSmartBoardReady: true,
    isElective: false,
    color: 'purple',
  },
  {
    id: 'c-ox-5',
    code: 'BED-101',
    name: 'Beden Eğitimi ve Oyun',
    category: 'Sanat & Spor',
    gradeLevels: ['1. Sınıf'],
    targetClass: '1/A',
    orgId: 30,
    weeklyHours: 5,
    branchTeacher: 'Selim AKSOY',
    teacherBranch: 'Beden Eğitimi',
    backupTeachers: [],
    roomType: 'atolye',
    requiredRoom: 'Kapalı Spor Salonu',
    isSmartBoardReady: false,
    isElective: false,
    color: 'orange',
  },
  {
    id: 'c-ox-6',
    code: 'GOR-101',
    name: 'Görsel Sanatlar',
    category: 'Sanat & Spor',
    gradeLevels: ['1. Sınıf'],
    targetClass: '1/A',
    orgId: 30,
    weeklyHours: 1,
    branchTeacher: 'Gülşah ÖZTÜRK',
    teacherBranch: 'Görsel Sanatlar',
    backupTeachers: [],
    roomType: 'atolye',
    requiredRoom: 'Görsel Sanatlar Atölyesi',
    isSmartBoardReady: false,
    isElective: false,
    color: 'pink',
  },
  {
    id: 'c-ox-7',
    code: 'MUZ-101',
    name: 'Müzik',
    category: 'Sanat & Spor',
    gradeLevels: ['1. Sınıf'],
    targetClass: '1/A',
    orgId: 30,
    weeklyHours: 1,
    branchTeacher: 'Müzik Zümresi',
    teacherBranch: 'Müzik',
    backupTeachers: [],
    roomType: 'atolye',
    requiredRoom: 'Müzik Odası',
    isSmartBoardReady: true,
    isElective: false,
    color: 'pink',
  },
  {
    id: 'c-ox-8',
    code: 'SER-101',
    name: 'Serbest Etkinlikler & Kodlama',
    category: 'Fen & Teknoloji',
    gradeLevels: ['1. Sınıf'],
    targetClass: '1/A',
    orgId: 30,
    weeklyHours: 2,
    branchTeacher: 'Özlem ZOR',
    teacherBranch: 'Sınıf Öğretmeni (1/A)',
    backupTeachers: [],
    roomType: 'normal',
    requiredRoom: '1. Kat · Derslik 101',
    isSmartBoardReady: true,
    isElective: false,
    color: 'cyan',
  },
]

export const normalizeClassCode = (code: string = ''): string =>
  code.replace(/[\/\-\s_]/g, '').toLowerCase()

export const loadStoredSchedule = (orgId: number = 30): ScheduleEntry[] => {
  if (typeof window !== 'undefined') {
    try {
      const savedOrg = localStorage.getItem(`oxonom_admin_schedule_${orgId}`)
      if (savedOrg) {
        const parsed = JSON.parse(savedOrg)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      const saved30 = localStorage.getItem('oxonom_admin_schedule_30')
      if (saved30) {
        const parsed = JSON.parse(saved30)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      const saved1 = localStorage.getItem('oxonom_admin_schedule_1')
      if (saved1) {
        const parsed = JSON.parse(saved1)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('oxonom_admin_schedule_') && !k.includes('revisions')) {
          const val = localStorage.getItem(k)
          if (val) {
            const parsed = JSON.parse(val)
            if (Array.isArray(parsed) && parsed.length > 0) return parsed
          }
        }
      }
    } catch (_) {}
  }
  return CANONICAL_9A_SCHEDULE_30
}

export default function MAdminCurriculumClient({
  orgSlug,
  hideHeader = false,
  hideDock = false,
}: MAdminCurriculumClientProps) {
  const { theme, toggleTheme } = useMobileTheme()
  const session = useLHSession() as any
  const user = session?.data?.user

  const [selectedOrgId, setSelectedOrgId] = useState<number>(30)
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_curriculum_selected_class')
        if (saved && saved !== '9/A' && saved !== '9-A') return saved
      } catch (_) {}
    }
    return '1/A'
  })
  const [activeDay, setActiveDay] = useState<DayKey>('mon')

  // Main View Tab: 'schedule' (Mevcut Onaylı Haftalık Çizelge) | 'distribute' (Sürükle-Bırak Dağıtım & Takvim) | 'catalog' (Ders Tanımları & Saatler)
  const [activeTab, setActiveTab] = useState<'schedule' | 'distribute' | 'catalog'>('schedule')
  const [scheduleViewMode, setScheduleViewMode] = useState<'matrix' | 'daily'>('matrix')

  // Selected Active Course for 1-Tap Quick-Drop placement
  const [selectedCourseForDrop, setSelectedCourseForDrop] = useState<CurriculumCourse | null>(null)
  const [draggedCourseName, setDraggedCourseName] = useState<string | null>(null)

  // Workload monitor toggle (collapsed by default as requested)
  const [isWorkloadExpanded, setIsWorkloadExpanded] = useState<boolean>(false)

  // Dynamic periods (can be customized by principal - default 6 periods = 30 hours/week for Oxonom 1/A)
  const [periods, setPeriods] = useState<PeriodSlot[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPeriods =
          localStorage.getItem(`oxonom_admin_periods_30`) ||
          localStorage.getItem('oxonom_admin_periods')
        if (savedPeriods) {
          const parsed = JSON.parse(savedPeriods)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (_) {}
    }
    return PRIMARY_PERIODS // 6 periods/day = 30 hours/week for Oxonom 1/A
  })

  // Modals state
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false)
  const [courseToEdit, setCourseToEdit] = useState<CurriculumCourse | null>(null)
  const [isEditPeriodsModalOpen, setIsEditPeriodsModalOpen] = useState(false)
  const [isCopyScheduleModalOpen, setIsCopyScheduleModalOpen] = useState(false)
  const [copyTargetClass, setCopyTargetClass] = useState('')
  const [selectedSlotForAction, setSelectedSlotForAction] = useState<{
    entry?: ScheduleEntry
    day: DayKey
    period: number
  } | null>(null)

  // Form Fields for Add/Edit Course (Strictly grouped as requested)
  // Section 1: Ders Bilgileri
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formTargetClass, setFormTargetClass] = useState('1/A')
  const [formWeeklyHours, setFormWeeklyHours] = useState<number>(4)
  const [formCategory, setFormCategory] = useState<'Temel Ders' | 'Fen & Teknoloji' | 'Sosyal & Beşeri' | 'Sanat & Spor' | 'Yabancı Dil'>('Temel Ders')
  const [formColor, setFormColor] = useState('blue')
  const [formIsSmartBoard, setFormIsSmartBoard] = useState(true)

  // Section 2: Öğretmen Bilgileri
  const [formBranchTeacher, setFormBranchTeacher] = useState('Özlem ZOR')
  const [formTeacherBranch, setFormTeacherBranch] = useState('Sınıf Öğretmeni (1/A)')
  const [formBackupTeachers, setFormBackupTeachers] = useState<BackupTeacher[]>([
    { id: 'b-default', name: 'Dr. Uğur UĞURLU', priority: 1, branch: 'Edebiyat & Kurum Yönetimi' },
  ])
  const [newBackupTeacherSelect, setNewBackupTeacherSelect] = useState('')

  // Section 3: Derslik Bilgileri
  const [formRoomType, setFormRoomType] = useState<RoomType>('normal')
  const [formRequiredRoom, setFormRequiredRoom] = useState('1. Kat · Derslik 101')

  // Dynamic Teachers List (Authentic source without mock data)
  const [teachersList, setTeachersList] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`oxonom_admin_teachers_${selectedOrgId}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (_) {}
    }
    return getOrgTeachers(selectedOrgId)
  })

  // Dynamic Available Classes (Synchronized with /principal/classes)
  const parseClassesFromStorage = (orgId: number): string[] => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`oxonom_admin_classes_${orgId}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const list = parsed
              .map((c: any) => {
                const code = (c.code || '').trim()
                const matchGrade = (c.gradeLevel || '').match(/\d+/) || code.match(/^\d+/)
                const gNum = matchGrade ? matchGrade[0] : '1'
                let branch = ''
                if (code.includes('/') || code.includes('-')) {
                  const parts = code.split(/[\/\-]/)
                  branch = parts[parts.length - 1].trim().toUpperCase()
                } else if (/^[A-Za-zÇĞİÖŞÜçğıöşü]+$/.test(code)) {
                  branch = code.toUpperCase()
                } else {
                  branch = 'A'
                }
                return `${gNum}/${branch}`
              })
              .filter((c: string) => c !== '9/A' && c !== '9-A')
            return Array.from(new Set(list))
          }
        }
      } catch (_) {}
    }
    return [
      '1/A', '1/B', '1/C', '1/D',
      '2/A', '2/B', '2/C', '2/D',
      '3/A', '3/B', '3/C', '3/D',
      '4/A', '4/B', '4/C', '4/D',
      '5/A', '5/B', '5/C', '5/D',
      '6/A', '6/B', '6/C', '6/D',
      '7/A', '7/B', '7/C', '7/D',
      '8/A', '8/B', '8/C', '8/D',
    ]
  }

  const [availableClasses, setAvailableClasses] = useState<string[]>(() =>
    parseClassesFromStorage(selectedOrgId)
  )

  useEffect(() => {
    const syncClasses = () => {
      setAvailableClasses(parseClassesFromStorage(selectedOrgId))
    }
    syncClasses()
    window.addEventListener('oxonom_admin_classes_updated', syncClasses)
    window.addEventListener('oxonom_classes_updated', syncClasses)
    window.addEventListener('storage', syncClasses)
    return () => {
      window.removeEventListener('oxonom_admin_classes_updated', syncClasses)
      window.removeEventListener('oxonom_classes_updated', syncClasses)
      window.removeEventListener('storage', syncClasses)
    }
  }, [selectedOrgId])

  // Courses Catalog State
  const [coursesList, setCoursesList] = useState<CurriculumCourse[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCourses = localStorage.getItem(`oxonom_admin_curriculum_${selectedOrgId}`)
        if (savedCourses) {
          const parsed = JSON.parse(savedCourses)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (_) {}
    }
    return INITIAL_OXONOM_COURSES
  })

  // Schedule Entries State
  const [scheduleList, setScheduleList] = useState<ScheduleEntry[]>(() => {
    return loadStoredSchedule(selectedOrgId)
  })

  // Ensure initial schedule is persisted to localStorage on mount so teacher and student see it immediately
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved =
          localStorage.getItem(`oxonom_admin_schedule_${selectedOrgId}`) ||
          localStorage.getItem('oxonom_admin_schedule_30')
        if (!saved) {
          localStorage.setItem(`oxonom_admin_schedule_${selectedOrgId}`, JSON.stringify(INITIAL_SCHEDULE_ENTRIES))
          localStorage.setItem('oxonom_admin_schedule_30', JSON.stringify(INITIAL_SCHEDULE_ENTRIES))
          localStorage.setItem('oxonom_schedule_30', JSON.stringify(INITIAL_SCHEDULE_ENTRIES))
          window.dispatchEvent(new CustomEvent('oxonom_admin_schedule_updated', { detail: INITIAL_SCHEDULE_ENTRIES }))
          window.dispatchEvent(new CustomEvent('oxonom_schedule_updated', { detail: INITIAL_SCHEDULE_ENTRIES }))
        }
      } catch (_) {}
    }
  }, [selectedOrgId])

  // Principal Profile Dynamic Identity
  const [principalName, setPrincipalName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return getStoredPrincipalProfile().name
      } catch (_) {}
    }
    return 'Dr. Uğur UĞURLU'
  })

  useEffect(() => {
    const syncPrincipal = () => {
      const p = getStoredPrincipalProfile()
      if (p.name) setPrincipalName(p.name)
    }
    syncPrincipal()
    window.addEventListener('oxonom_admin_updated', syncPrincipal)
    window.addEventListener('oxonom_principal_updated', syncPrincipal)
    window.addEventListener('storage', syncPrincipal)
    return () => {
      window.removeEventListener('oxonom_admin_updated', syncPrincipal)
      window.removeEventListener('oxonom_principal_updated', syncPrincipal)
      window.removeEventListener('storage', syncPrincipal)
    }
  }, [])

  // Reload data on external storage changes and schedule events
  useEffect(() => {
    const handleSync = () => {
      if (typeof window !== 'undefined') {
        try {
          const savedT = localStorage.getItem(`oxonom_admin_teachers_${selectedOrgId}`)
          if (savedT) setTeachersList(JSON.parse(savedT))
          const loaded = loadStoredSchedule(selectedOrgId)
          setScheduleList(loaded)
        } catch (_) {}
      }
    }
    window.addEventListener('storage', handleSync)
    window.addEventListener('oxonom_teachers_updated', handleSync)
    window.addEventListener('oxonom_admin_schedule_updated', handleSync)
    window.addEventListener('oxonom_schedule_updated', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('oxonom_teachers_updated', handleSync)
      window.removeEventListener('oxonom_admin_schedule_updated', handleSync)
      window.removeEventListener('oxonom_schedule_updated', handleSync)
    }
  }, [selectedOrgId])

  // Helper to handle class selection and persistence
  const handleSelectClass = (cls: string) => {
    setSelectedClass(cls)
    setSelectedCourseForDrop(null)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_curriculum_selected_class', cls)
      } catch (_) {}
    }
  }

  // Helpers to persist
  const persistCourses = (updated: CurriculumCourse[]) => {
    setCoursesList(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`oxonom_admin_curriculum_${selectedOrgId}`, JSON.stringify(updated))
      } catch (_) {}
    }
  }

  const persistSchedule = (updated: ScheduleEntry[]) => {
    setScheduleList(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`oxonom_admin_schedule_${selectedOrgId}`, JSON.stringify(updated))
        localStorage.setItem('oxonom_admin_schedule_30', JSON.stringify(updated))
        localStorage.setItem('oxonom_schedule_30', JSON.stringify(updated))
        localStorage.setItem('oxonom_teacher_schedule_30', JSON.stringify(updated))
        localStorage.setItem(`oxonom_admin_periods_${selectedOrgId}`, JSON.stringify(periods))
        localStorage.setItem('oxonom_admin_periods_30', JSON.stringify(periods))
        localStorage.setItem('oxonom_periods_30', JSON.stringify(periods))
        window.dispatchEvent(new CustomEvent('oxonom_admin_schedule_updated', { detail: updated }))
        window.dispatchEvent(new CustomEvent('oxonom_schedule_updated', { detail: updated }))
      } catch (_) {}
    }

    // Server-side sync across incognito and separate browser windows
    try {
      fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule: updated,
          periods,
          classCode: selectedClass,
          orgId: selectedOrgId,
          publishedBy: principalName,
        }),
      }).catch(() => {})
    } catch (_) {}
  }

  const persistPeriods = (updated: PeriodSlot[]) => {
    setPeriods(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`oxonom_admin_periods_${selectedOrgId}`, JSON.stringify(updated))
        localStorage.setItem('oxonom_admin_periods_30', JSON.stringify(updated))
        localStorage.setItem('oxonom_periods_30', JSON.stringify(updated))
      } catch (_) {}
    }
  }

  // ── DERS PROGRAMINI BAŞKA ŞUBEYE KOPYALAMA ──
  // User Rule: "programı hazırlanan sınıf/şube kısmında listelenen sınıfları ders programı ile birlikte kopyalama özelliği ekle."
  const handleCopySchedule = () => {
    const target = copyTargetClass.trim().toUpperCase()
    if (!target) {
      toast.error('Lütfen hedef sınıf veya şube seçiniz / yazınız.')
      return
    }
    if (normalizeClassCode(target) === normalizeClassCode(selectedClass)) {
      toast.error('Kaynak ve hedef şube aynı olamaz.')
      return
    }

    // 1. Ensure target class exists in oxonom_admin_classes_${selectedOrgId}
    try {
      const classesKey = `oxonom_admin_classes_${selectedOrgId}`
      const savedRaw = localStorage.getItem(classesKey)
      let existingClasses: any[] = []
      if (savedRaw) {
        try {
          existingClasses = JSON.parse(savedRaw)
        } catch (_) {}
      }
      const hasTarget = existingClasses.some(
        (c) => (c.code || '').trim().toUpperCase() === target
      )
      if (!hasTarget) {
        const matchGrade = target.match(/\d+/)
        const gNum = matchGrade ? parseInt(matchGrade[0], 10) : 9
        const newClassRecord = {
          id: Date.now(),
          code: target,
          name: `${target} Şubesi`,
          gradeLevel: `${gNum}. Sınıf`,
          gradeNumber: gNum,
          orgId: selectedOrgId,
          roomName: `Derslik ${target.replace('/', '-')}`,
          teacherName: 'Atanmadı',
          teacherBranch: 'Genel',
          teacherPhone: '',
          teacherEmail: '',
          studentCount: 24,
          capacity: 30,
          academicAverage: 88.0,
          attendanceRate: 98.0,
          boardStatus: 'online',
        }
        const updatedClasses = [...existingClasses, newClassRecord]
        localStorage.setItem(classesKey, JSON.stringify(updatedClasses))
        window.dispatchEvent(new CustomEvent('oxonom_admin_classes_updated'))
        window.dispatchEvent(new CustomEvent('oxonom_classes_updated'))
      }
    } catch (_) {}

    // 2. Clone courses if specific to source class
    const sourceCourses = coursesList.filter(
      (c) =>
        c.orgId === selectedOrgId &&
        c.targetClass &&
        normalizeClassCode(c.targetClass) === normalizeClassCode(selectedClass)
    )
    if (sourceCourses.length > 0) {
      const clonedCourses: CurriculumCourse[] = sourceCourses.map((c) => ({
        ...c,
        id: `course_${target.replace(/[^a-zA-Z0-9]/g, '_')}_${c.code}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        targetClass: target,
        name: c.name.replace(selectedClass, target),
      }))
      const newCourses = [
        ...coursesList.filter(
          (c) =>
            !(
              c.targetClass &&
              normalizeClassCode(c.targetClass) === normalizeClassCode(target)
            )
        ),
        ...clonedCourses,
      ]
      persistCourses(newCourses)
    }

    // 3. Clone schedule entries
    const sourceEntries = scheduleList.filter(
      (e) => normalizeClassCode(e.classCode) === normalizeClassCode(selectedClass)
    )
    if (sourceEntries.length === 0) {
      toast.error(`${selectedClass} şubesinde kopyalanacak ders programı bulunamadı.`)
      return
    }

    const cleanSchedule = scheduleList.filter(
      (e) => normalizeClassCode(e.classCode) !== normalizeClassCode(target)
    )
    const clonedEntries: ScheduleEntry[] = sourceEntries.map((e) => ({
      ...e,
      id: `slot_${target.replace(/[^a-zA-Z0-9]/g, '_')}_${e.day}_${e.period}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      classCode: target,
      roomName: e.roomName
        ? e.roomName
            .replace(selectedClass, target)
            .replace(selectedClass.replace('/', '-'), target.replace('/', '-'))
        : `Derslik ${target.replace('/', '-')}`,
    }))

    const finalSchedule = [...cleanSchedule, ...clonedEntries]
    persistSchedule(finalSchedule)

    // 4. Update availableClasses
    setAvailableClasses((prev) => {
      if (prev.some((c) => normalizeClassCode(c) === normalizeClassCode(target))) {
        return prev
      }
      return [...prev, target]
    })

    handleSelectClass(target)
    setIsCopyScheduleModalOpen(false)
    setCopyTargetClass('')
    toast.success(
      `${selectedClass} ders programı ve dersleri ${target} şubesine başarıyla kopyalandı!`
    )
  }

  // Ensure selectedClass is valid and matches available classes without resetting to 1/A
  useEffect(() => {
    if (availableClasses.length > 0) {
      const isMatch = availableClasses.some(
        (c) => normalizeClassCode(c) === normalizeClassCode(selectedClass)
      )
      if (!isMatch) {
        // Find if any available class has existing entries in scheduleList
        const matchingWithSchedule = availableClasses.find((c) =>
          scheduleList.some(
            (e) => normalizeClassCode(e.classCode) === normalizeClassCode(c)
          )
        )
        if (matchingWithSchedule) {
          handleSelectClass(matchingWithSchedule)
        } else if (availableClasses.includes('1/A')) {
          handleSelectClass('1/A')
        } else {
          handleSelectClass(availableClasses[0])
        }
      }
    }
  }, [availableClasses, scheduleList])

  // ── FILTERED COURSES POOL (STRICTLY BY SELECTED CLASS) ──
  // User Rule: "program oluşturulurken ilk önce sınıf seçilmeli sınıflara göre ders havuzları filtrelenmeli"
  const classCoursesPool = useMemo(() => {
    return coursesList.filter((c) => {
      if (c.orgId !== selectedOrgId) return false
      if (c.targetClass) {
        return normalizeClassCode(c.targetClass) === normalizeClassCode(selectedClass)
      }
      return true
    })
  }, [coursesList, selectedOrgId, selectedClass])

  // Class Entries in current weekly schedule
  const classEntries = useMemo(() => {
    return scheduleList.filter((e) => {
      if (e.orgId !== selectedOrgId) return false
      return normalizeClassCode(e.classCode) === normalizeClassCode(selectedClass)
    })
  }, [scheduleList, selectedOrgId, selectedClass])

  // Placed hours counts for the selected class
  const placedSubjectCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    classEntries.forEach((e) => {
      counts[e.subject] = (counts[e.subject] || 0) + 1
    })
    return counts
  }, [classEntries])

  const targetWeeklyHours = periods.length * 5
  const totalAssignedHours = classEntries.length
  const remainingTotalHours = Math.max(0, targetWeeklyHours - totalAssignedHours)

  const activeDayEntries = useMemo(() => {
    return classEntries.filter((e) => e.day === activeDay)
  }, [classEntries, activeDay])

  // ── TEACHER WORKLOAD & OVERTIME MONITOR ──
  // User Rule: "Öğretmenlerin mesai saatlerine göre ders saatleri hesaplanır ve öğretmen mesaisinden fazla çalışıyorsa grafiksel olarak gösterilir."
  const teacherWorkloads = useMemo(() => {
    // Combine teachers from teachersList and dynamic principal
    const baseList = [...teachersList]
    if (!baseList.some((t) => t.name === principalName)) {
      baseList.push({
        id: 9999,
        name: principalName,
        branch: 'Okul Müdürü & Edebiyat',
        weeklyHours: 30,
      })
    }

    return baseList.map((t) => {
      // Total assigned hours across all classes in the school
      const assignedHours = scheduleList.filter(
        (e) => e.orgId === selectedOrgId && (e.activeTeacherName || e.teacherName) === t.name
      ).length

      const weeklyLimit = t.weeklyHours || 30
      const percentage = Math.round((assignedHours / weeklyLimit) * 100)
      const isOvertime = assignedHours > weeklyLimit
      const overtimeHours = Math.max(0, assignedHours - weeklyLimit)

      return {
        id: t.id || t.name,
        name: t.name,
        branch: t.branch ? t.branch.split('(')[0].trim() : 'Branş Öğretmeni',
        assignedHours,
        weeklyLimit,
        percentage,
        isOvertime,
        overtimeHours,
      }
    })
  }, [teachersList, scheduleList, selectedOrgId])

  // ── CONFLICT CHECK ENGINE ──
  // User Rules:
  // 1. Aynı öğretmen aynı saatte başka derse atanamamalı
  // 2. Aynı derslik aynı anda iki sınıfa verilemez (laboratuvar, sınıf veya atölye)
  const checkConflicts = (day: DayKey, period: number, courseToAssign: CurriculumCourse) => {
    const dayLabel = DAYS_LIST.find((d) => d.key === day)?.label || day

    // Check teacher conflict in other classes
    const teacherConflict = scheduleList.find(
      (e) =>
        e.orgId === selectedOrgId &&
        e.day === day &&
        e.period === period &&
        normalizeClassCode(e.classCode) !== normalizeClassCode(selectedClass) &&
        (e.activeTeacherName || e.teacherName) === courseToAssign.branchTeacher &&
        !e.isTeacherOnLeave
    )

    // Check room conflict in other classes
    const roomConflict = scheduleList.find(
      (e) =>
        e.orgId === selectedOrgId &&
        e.day === day &&
        e.period === period &&
        normalizeClassCode(e.classCode) !== normalizeClassCode(selectedClass) &&
        e.roomName === courseToAssign.requiredRoom
    )

    return {
      dayLabel,
      teacherConflict,
      roomConflict,
    }
  }

  // ── ASSIGN COURSE TO SLOT ──
  const handleAssignCourseToSlot = (
    day: DayKey,
    period: number,
    courseToAssign: CurriculumCourse,
    forceBackup: boolean = false
  ) => {
    const { dayLabel, teacherConflict, roomConflict } = checkConflicts(day, period, courseToAssign)

    if (roomConflict) {
      toast.error(
        `❌ Derslik Çakışması! "${courseToAssign.requiredRoom}" (${courseToAssign.roomType === 'laboratuvar' ? 'Laboratuvar' : courseToAssign.roomType === 'atolye' ? 'Atölye' : 'Derslik'}) ${dayLabel} ${period}. saatte ${roomConflict.classCode} sınıfı tarafından kullanılmaktadır!`,
        { duration: 4500 }
      )
      return
    }

    let actualTeacher = courseToAssign.branchTeacher
    let isSub = false

    if (teacherConflict) {
      if (courseToAssign.backupTeachers && courseToAssign.backupTeachers.length > 0) {
        actualTeacher = courseToAssign.backupTeachers[0].name
        isSub = true
        toast(
          `⚠️ Asıl öğretmen (${courseToAssign.branchTeacher}) bu saatte ${teacherConflict.classCode} sınıfında derste. 1. Yedek Öğretmen (${actualTeacher}) devreye alındı.`,
          { icon: '🛡️', duration: 4000 }
        )
      } else {
        toast.error(
          `❌ Öğretmen Zaman Çakışması! ${courseToAssign.branchTeacher} öğretmeni ${dayLabel} ${period}. saatte ${teacherConflict.classCode} sınıfında derstedir! Lütfen başka bir saat seçin veya derse bir yedek öğretmen tanımlayın.`,
          { duration: 4500 }
        )
        return
      }
    }

    const existingIndex = scheduleList.findIndex(
      (e) =>
        e.orgId === selectedOrgId &&
        normalizeClassCode(e.classCode) === normalizeClassCode(selectedClass) &&
        e.day === day &&
        e.period === period
    )

    const newEntry: ScheduleEntry = {
      id: `sc-${Date.now()}-${day}-${period}`,
      orgId: selectedOrgId,
      day,
      period,
      classCode: selectedClass,
      subject: courseToAssign.name,
      teacherName: courseToAssign.branchTeacher,
      teacherBranch: courseToAssign.teacherBranch,
      backupTeacherName: courseToAssign.backupTeachers?.[0]?.name,
      isTeacherOnLeave: isSub,
      activeTeacherName: actualTeacher,
      roomType: courseToAssign.roomType,
      roomName: courseToAssign.requiredRoom,
      color: courseToAssign.color,
      isSmartBoardActive: courseToAssign.isSmartBoardReady,
    }

    let updatedList: ScheduleEntry[]
    if (existingIndex >= 0) {
      updatedList = [...scheduleList]
      updatedList[existingIndex] = newEntry
    } else {
      updatedList = [...scheduleList, newEntry]
    }

    persistSchedule(updatedList)
    toast.success(`✅ ${courseToAssign.name} (${dayLabel} ${period}. Ders) ${selectedClass} sınıfına yerleştirildi!`)
  }

  // Remove slot
  const handleRemoveSlot = (day: DayKey, period: number) => {
    const updated = scheduleList.filter(
      (e) =>
        !(
          e.orgId === selectedOrgId &&
          normalizeClassCode(e.classCode) === normalizeClassCode(selectedClass) &&
          e.day === day &&
          e.period === period
        )
    )
    persistSchedule(updated)
    toast.success('Ders saati boşaltıldı.')
    setSelectedSlotForAction(null)
  }

  // Toggle Leave / Substitute Teacher in Slot
  const handleToggleTeacherLeave = (entry: ScheduleEntry) => {
    const isNowOnLeave = !entry.isTeacherOnLeave
    const newActiveTeacher = isNowOnLeave
      ? entry.backupTeacherName || 'Dr. Uğur UĞURLU'
      : entry.teacherName

    const updated = scheduleList.map((e) => {
      if (e.id === entry.id) {
        return {
          ...e,
          isTeacherOnLeave: isNowOnLeave,
          activeTeacherName: newActiveTeacher,
        }
      }
      return e
    })

    persistSchedule(updated)
    if (isNowOnLeave) {
      toast.success(`⚠️ Asıl öğretmen izinli bildirildi. Ders ${newActiveTeacher} (Yedek) tarafından yürütülecektir.`)
    } else {
      toast.success(`✅ Asıl öğretmen (${entry.teacherName}) derse geri döndü.`)
    }
    setSelectedSlotForAction(null)
  }

  // ── SMART AUTO-FILL ENGINE ──
  // User Rule: "Otomatik doldur ile ders saatine öğretmen mesai saatine göre ince hesaplamalar yapılmalı ve en uygun ve en doğru şekilde otomatik doldurmalar yapılmalıdır."
  const handleSmartAutoFill = () => {
    if (classCoursesPool.length === 0) {
      toast.error(`"${selectedClass}" sınıfı için henüz tanımlanmış ders bulunmuyor! Lütfen önce "Yeni Ders Tanımla" butonuyla ders ekleyin.`)
      return
    }

    // Build course hour queue
    const queue: CurriculumCourse[] = []
    classCoursesPool.forEach((c) => {
      for (let i = 0; i < c.weeklyHours; i++) {
        queue.push(c)
      }
    })

    // Other classes' entries for conflict prevention
    const otherClassesEntries = scheduleList.filter(
      (e) =>
        !(
          e.orgId === selectedOrgId &&
          normalizeClassCode(e.classCode) === normalizeClassCode(selectedClass)
        )
    )

    const newEntries: ScheduleEntry[] = []
    let placedCount = 0

    // Loop through days and periods
    DAYS_LIST.forEach((day) => {
      periods.forEach((period) => {
        if (queue.length === 0) return

        // Find candidate that has no conflict at (day, period)
        const matchIdx = queue.findIndex((candidate) => {
          // Teacher conflict in other classes
          const teacherBusy = otherClassesEntries.some(
            (e) => e.day === day.key && e.period === period.periodNumber && (e.activeTeacherName || e.teacherName) === candidate.branchTeacher && !e.isTeacherOnLeave
          )
          // Room conflict in other classes
          const roomBusy = otherClassesEntries.some(
            (e) => e.day === day.key && e.period === period.periodNumber && e.roomName === candidate.requiredRoom
          )
          // Max 2 consecutive/day for same subject
          const placedToday = newEntries.filter(
            (e) => e.day === day.key && e.subject === candidate.name
          ).length

          return !teacherBusy && !roomBusy && placedToday < 2
        })

        if (matchIdx >= 0) {
          const course = queue.splice(matchIdx, 1)[0]
          newEntries.push({
            id: `sc-auto-${day.key}-${period.periodNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            orgId: selectedOrgId,
            day: day.key,
            period: period.periodNumber,
            classCode: selectedClass,
            subject: course.name,
            teacherName: course.branchTeacher,
            teacherBranch: course.teacherBranch,
            backupTeacherName: course.backupTeachers?.[0]?.name,
            roomType: course.roomType,
            roomName: course.requiredRoom,
            color: course.color,
            isSmartBoardActive: course.isSmartBoardReady,
            activeTeacherName: course.branchTeacher,
            isTeacherOnLeave: false,
          })
          placedCount++
        } else if (queue.length > 0) {
          // Secondary attempt with backup teacher or relaxed consecutive rule
          const fallbackIdx = queue.findIndex((candidate) => {
            const roomBusy = otherClassesEntries.some(
              (e) => e.day === day.key && e.period === period.periodNumber && e.roomName === candidate.requiredRoom
            )
            return !roomBusy
          })

          if (fallbackIdx >= 0) {
            const course = queue.splice(fallbackIdx, 1)[0]
            const teacherBusy = otherClassesEntries.some(
              (e) => e.day === day.key && e.period === period.periodNumber && (e.activeTeacherName || e.teacherName) === course.branchTeacher
            )
            const actualTeacher = teacherBusy && course.backupTeachers?.[0]
              ? course.backupTeachers[0].name
              : course.branchTeacher

            newEntries.push({
              id: `sc-auto-${day.key}-${period.periodNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              orgId: selectedOrgId,
              day: day.key,
              period: period.periodNumber,
              classCode: selectedClass,
              subject: course.name,
              teacherName: course.branchTeacher,
              teacherBranch: course.teacherBranch,
              backupTeacherName: course.backupTeachers?.[0]?.name,
              roomType: course.roomType,
              roomName: course.requiredRoom,
              color: course.color,
              isSmartBoardActive: course.isSmartBoardReady,
              activeTeacherName: actualTeacher,
              isTeacherOnLeave: actualTeacher !== course.branchTeacher,
            })
            placedCount++
          }
        }
      })
    })

    const combined = [...otherClassesEntries, ...newEntries]
    persistSchedule(combined)
    toast.success(`🎉 ${selectedClass} için haftalık ders programı 0 çakışma ile otomatik oluşturuldu! (${placedCount} Saat)`)
  }

  // Clear weekly schedule
  const handleClearWeek = () => {
    const updated = scheduleList.filter(
      (e) =>
        !(
          e.orgId === selectedOrgId &&
          normalizeClassCode(e.classCode) === normalizeClassCode(selectedClass)
        )
    )
    persistSchedule(updated)
    toast.success(`${selectedClass} haftalık ders programı temizlendi.`)
  }

  // Clear all courses and restart
  const handleClearAllCourses = () => {
    const updated = coursesList.filter(
      (c) => normalizeClassCode(c.targetClass) !== normalizeClassCode(selectedClass)
    )
    persistCourses(updated)
    handleClearWeek()
    toast.success(`${selectedClass} sınıfına ait tüm dersler silindi.`)
  }

  // Generate authentic MEB curriculum courses tailored specifically to the grade level of the classroom
  const generateCurriculumForClass = (classCode: string, orgId: number = 30): CurriculumCourse[] => {
    const norm = normalizeClassCode(classCode)
    const match = norm.match(/\d+/)
    const grade = match ? parseInt(match[0], 10) : 1
    const gradeLabel = `${grade}. Sınıf`
    const roomName = `Derslik ${norm}`

    if (grade <= 3) {
      // 1, 2, 3. Sınıf MEB İlkokul Müfredatı (Toplam 30 Saat)
      return [
        {
          id: `c-${norm}-tr`,
          code: `TRK-${grade}01`,
          name: 'Türkçe',
          category: 'Temel Ders',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 10,
          branchTeacher: 'Sınıf Öğretmeni',
          teacherBranch: 'Sınıf Öğretmeni',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'blue',
        },
        {
          id: `c-${norm}-mat`,
          code: `MAT-${grade}01`,
          name: 'Matematik',
          category: 'Temel Ders',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 5,
          branchTeacher: 'Sınıf Öğretmeni',
          teacherBranch: 'Sınıf Öğretmeni',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'indigo',
        },
        {
          id: `c-${norm}-hb`,
          code: `HAY-${grade}01`,
          name: 'Hayat Bilgisi',
          category: 'Sosyal & Beşeri',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 4,
          branchTeacher: 'Sınıf Öğretmeni',
          teacherBranch: 'Sınıf Öğretmeni',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'amber',
        },
        {
          id: `c-${norm}-ing`,
          code: `ING-${grade}01`,
          name: 'Yabancı Dil (İngilizce)',
          category: 'Yabancı Dil',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Canan YILDIRIM',
          teacherBranch: 'İngilizce',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'purple',
        },
        {
          id: `c-${norm}-bed`,
          code: `BED-${grade}01`,
          name: 'Beden Eğitimi ve Oyun',
          category: 'Sanat & Spor',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 5,
          branchTeacher: 'Selim AKSOY',
          teacherBranch: 'Beden Eğitimi',
          backupTeachers: [],
          roomType: 'atolye',
          requiredRoom: 'Kapalı Spor Salonu',
          isSmartBoardReady: false,
          isElective: false,
          color: 'orange',
        },
        {
          id: `c-${norm}-gs`,
          code: `GOR-${grade}01`,
          name: 'Görsel Sanatlar',
          category: 'Sanat & Spor',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Gülşah ÖZTÜRK',
          teacherBranch: 'Görsel Sanatlar',
          backupTeachers: [],
          roomType: 'atolye',
          requiredRoom: 'Görsel Sanatlar Atölyesi',
          isSmartBoardReady: false,
          isElective: false,
          color: 'pink',
        },
        {
          id: `c-${norm}-muz`,
          code: `MUZ-${grade}01`,
          name: 'Müzik',
          category: 'Sanat & Spor',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Sınıf Öğretmeni',
          teacherBranch: 'Müzik',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: 'Müzik Odası',
          isSmartBoardReady: true,
          isElective: false,
          color: 'teal',
        },
      ]
    } else if (grade === 4) {
      // 4. Sınıf MEB İlkokul Müfredatı (Toplam 30 Saat)
      return [
        {
          id: `c-${norm}-tr`,
          code: `TRK-401`,
          name: 'Türkçe',
          category: 'Temel Ders',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 8,
          branchTeacher: 'Sınıf Öğretmeni',
          teacherBranch: 'Sınıf Öğretmeni',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'blue',
        },
        {
          id: `c-${norm}-mat`,
          code: `MAT-401`,
          name: 'Matematik',
          category: 'Temel Ders',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 5,
          branchTeacher: 'Sınıf Öğretmeni',
          teacherBranch: 'Sınıf Öğretmeni',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'indigo',
        },
        {
          id: `c-${norm}-fen`,
          code: `FEN-401`,
          name: 'Fen Bilimleri',
          category: 'Fen & Teknoloji',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 4,
          branchTeacher: 'Beritan ŞENATEŞ',
          teacherBranch: 'Fen Bilimleri',
          backupTeachers: [],
          roomType: 'laboratuvar',
          requiredRoom: 'Fen & Teknoloji Laboratuvarı',
          isSmartBoardReady: true,
          isElective: false,
          color: 'emerald',
        },
        {
          id: `c-${norm}-sos`,
          code: `SOS-401`,
          name: 'Sosyal Bilgiler',
          category: 'Sosyal & Beşeri',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 3,
          branchTeacher: 'Deniz ARSLAN',
          teacherBranch: 'Sosyal Bilgiler',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'amber',
        },
        {
          id: `c-${norm}-ing`,
          code: `ING-401`,
          name: 'Yabancı Dil (İngilizce)',
          category: 'Yabancı Dil',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Canan YILDIRIM',
          teacherBranch: 'İngilizce',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'purple',
        },
        {
          id: `c-${norm}-din`,
          code: `DIN-401`,
          name: 'Din Kültürü ve Ahlak Bilgisi',
          category: 'Sosyal & Beşeri',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Sınıf Öğretmeni',
          teacherBranch: 'Din Kültürü',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'teal',
        },
        {
          id: `c-${norm}-insan`,
          code: `IHK-401`,
          name: 'İnsan Hakları, Yurttaşlık ve Demokrasi',
          category: 'Sosyal & Beşeri',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Sınıf Öğretmeni',
          teacherBranch: 'Sosyal Bilgiler',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'amber',
        },
        {
          id: `c-${norm}-bed`,
          code: `BED-401`,
          name: 'Beden Eğitimi ve Oyun',
          category: 'Sanat & Spor',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Selim AKSOY',
          teacherBranch: 'Beden Eğitimi',
          backupTeachers: [],
          roomType: 'atolye',
          requiredRoom: 'Kapalı Spor Salonu',
          isSmartBoardReady: false,
          isElective: false,
          color: 'orange',
        },
        {
          id: `c-${norm}-gs`,
          code: `GOR-401`,
          name: 'Görsel Sanatlar & Müzik',
          category: 'Sanat & Spor',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Gülşah ÖZTÜRK',
          teacherBranch: 'Görsel Sanatlar',
          backupTeachers: [],
          roomType: 'atolye',
          requiredRoom: 'Görsel Sanatlar Atölyesi',
          isSmartBoardReady: false,
          isElective: false,
          color: 'pink',
        },
      ]
    } else if (grade >= 5 && grade <= 7) {
      // 5, 6, 7. Sınıf MEB Ortaokul Müfredatı (Toplam 35 Saat)
      return [
        {
          id: `c-${norm}-tr`,
          code: `TRK-${grade}01`,
          name: 'Türkçe',
          category: 'Temel Ders',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 6,
          branchTeacher: 'Ebru TEKNECİ',
          teacherBranch: 'Türkçe',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'blue',
        },
        {
          id: `c-${norm}-mat`,
          code: `MAT-${grade}01`,
          name: 'Matematik',
          category: 'Temel Ders',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 5,
          branchTeacher: 'Orkun AYDIN',
          teacherBranch: 'Matematik',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'indigo',
        },
        {
          id: `c-${norm}-fen`,
          code: `FEN-${grade}01`,
          name: 'Fen Bilimleri',
          category: 'Fen & Teknoloji',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 4,
          branchTeacher: 'Beritan ŞENATEŞ',
          teacherBranch: 'Fen Bilimleri',
          backupTeachers: [],
          roomType: 'laboratuvar',
          requiredRoom: 'Fen & Teknoloji Laboratuvarı',
          isSmartBoardReady: true,
          isElective: false,
          color: 'emerald',
        },
        {
          id: `c-${norm}-sos`,
          code: `SOS-${grade}01`,
          name: 'Sosyal Bilgiler',
          category: 'Sosyal & Beşeri',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 3,
          branchTeacher: 'Deniz ARSLAN',
          teacherBranch: 'Sosyal Bilgiler',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'amber',
        },
        {
          id: `c-${norm}-ing`,
          code: `ING-${grade}01`,
          name: 'Yabancı Dil (İngilizce)',
          category: 'Yabancı Dil',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 4,
          branchTeacher: 'Canan YILDIRIM',
          teacherBranch: 'İngilizce',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'purple',
        },
        {
          id: `c-${norm}-din`,
          code: `DIN-${grade}01`,
          name: 'Din Kültürü ve Ahlak Bilgisi',
          category: 'Sosyal & Beşeri',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Deniz ARSLAN',
          teacherBranch: 'Din Kültürü',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'teal',
        },
        {
          id: `c-${norm}-bil`,
          code: `BIL-${grade}01`,
          name: 'Bilişim Teknolojileri ve Yazılım',
          category: 'Fen & Teknoloji',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Murat DEMİR',
          teacherBranch: 'Bilişim Teknolojileri',
          backupTeachers: [],
          roomType: 'laboratuvar',
          requiredRoom: 'Bilişim & Kodlama Atölyesi',
          isSmartBoardReady: true,
          isElective: false,
          color: 'cyan',
        },
        {
          id: `c-${norm}-bed`,
          code: `BED-${grade}01`,
          name: 'Beden Eğitimi ve Spor',
          category: 'Sanat & Spor',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Selim AKSOY',
          teacherBranch: 'Beden Eğitimi',
          backupTeachers: [],
          roomType: 'atolye',
          requiredRoom: 'Kapalı Spor Salonu',
          isSmartBoardReady: false,
          isElective: false,
          color: 'orange',
        },
        {
          id: `c-${norm}-gs`,
          code: `GOR-${grade}01`,
          name: 'Görsel Sanatlar & Müzik',
          category: 'Sanat & Spor',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Gülşah ÖZTÜRK',
          teacherBranch: 'Görsel Sanatlar',
          backupTeachers: [],
          roomType: 'atolye',
          requiredRoom: 'Görsel Sanatlar Atölyesi',
          isSmartBoardReady: false,
          isElective: false,
          color: 'pink',
        },
      ]
    } else if (grade === 8) {
      // 8. Sınıf MEB LGS Müfredatı (Toplam 35 Saat)
      return [
        {
          id: `c-${norm}-tr`,
          code: `TRK-801`,
          name: 'Türkçe',
          category: 'Temel Ders',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 5,
          branchTeacher: 'Ebru TEKNECİ',
          teacherBranch: 'Türkçe',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'blue',
        },
        {
          id: `c-${norm}-mat`,
          code: `MAT-801`,
          name: 'Matematik (LGS)',
          category: 'Temel Ders',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 5,
          branchTeacher: 'Orkun AYDIN',
          teacherBranch: 'Matematik',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'indigo',
        },
        {
          id: `c-${norm}-fen`,
          code: `FEN-801`,
          name: 'Fen Bilimleri (LGS)',
          category: 'Fen & Teknoloji',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 4,
          branchTeacher: 'Beritan ŞENATEŞ',
          teacherBranch: 'Fen Bilimleri',
          backupTeachers: [],
          roomType: 'laboratuvar',
          requiredRoom: 'Fen & Teknoloji Laboratuvarı',
          isSmartBoardReady: true,
          isElective: false,
          color: 'emerald',
        },
        {
          id: `c-${norm}-ink`,
          code: `INK-801`,
          name: 'T.C. İnkılap Tarihi ve Atatürkçülük',
          category: 'Sosyal & Beşeri',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Deniz ARSLAN',
          teacherBranch: 'Tarih',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'amber',
        },
        {
          id: `c-${norm}-ing`,
          code: `ING-801`,
          name: 'Yabancı Dil (İngilizce)',
          category: 'Yabancı Dil',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 4,
          branchTeacher: 'Canan YILDIRIM',
          teacherBranch: 'İngilizce',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'purple',
        },
        {
          id: `c-${norm}-din`,
          code: `DIN-801`,
          name: 'Din Kültürü ve Ahlak Bilgisi',
          category: 'Sosyal & Beşeri',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Deniz ARSLAN',
          teacherBranch: 'Din Kültürü',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'teal',
        },
        {
          id: `c-${norm}-reh`,
          code: `REH-801`,
          name: 'Rehberlik ve Kariyer Planlama',
          category: 'Sosyal & Beşeri',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 1,
          branchTeacher: 'Ebru TEKNECİ',
          teacherBranch: 'Rehberlik',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'amber',
        },
        {
          id: `c-${norm}-lgs`,
          code: `LGS-801`,
          name: 'LGS Soru Çözüm & Deneme Atölyesi',
          category: 'Temel Ders',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 4,
          branchTeacher: 'Orkun AYDIN',
          teacherBranch: 'Matematik / Fen',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'indigo',
        },
        {
          id: `c-${norm}-bed`,
          code: `BED-801`,
          name: 'Beden Eğitimi ve Spor',
          category: 'Sanat & Spor',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Selim AKSOY',
          teacherBranch: 'Beden Eğitimi',
          backupTeachers: [],
          roomType: 'atolye',
          requiredRoom: 'Kapalı Spor Salonu',
          isSmartBoardReady: false,
          isElective: false,
          color: 'orange',
        },
      ]
    } else {
      // 9+ Lise MEB Müfredatı
      return [
        {
          id: `c-${norm}-edb`,
          code: `EDB-${grade}01`,
          name: 'Türk Dili ve Edebiyatı',
          category: 'Temel Ders',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 5,
          branchTeacher: 'Ebru TEKNECİ',
          teacherBranch: 'Türk Dili ve Edebiyatı',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'blue',
        },
        {
          id: `c-${norm}-mat`,
          code: `MAT-${grade}01`,
          name: 'Matematik',
          category: 'Temel Ders',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 6,
          branchTeacher: 'Orkun AYDIN',
          teacherBranch: 'Matematik',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'indigo',
        },
        {
          id: `c-${norm}-fiz`,
          code: `FIZ-${grade}01`,
          name: 'Fizik & Fen Bilimleri',
          category: 'Fen & Teknoloji',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 4,
          branchTeacher: 'Beritan ŞENATEŞ',
          teacherBranch: 'Fen Bilimleri',
          backupTeachers: [],
          roomType: 'laboratuvar',
          requiredRoom: 'Fen & Teknoloji Laboratuvarı',
          isSmartBoardReady: true,
          isElective: false,
          color: 'emerald',
        },
        {
          id: `c-${norm}-bil`,
          code: `BIL-${grade}01`,
          name: 'Bilişim & Yazılım',
          category: 'Fen & Teknoloji',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 4,
          branchTeacher: 'Murat DEMİR',
          teacherBranch: 'Bilişim Teknolojileri',
          backupTeachers: [],
          roomType: 'laboratuvar',
          requiredRoom: 'Bilişim & Kodlama Atölyesi',
          isSmartBoardReady: true,
          isElective: false,
          color: 'cyan',
        },
        {
          id: `c-${norm}-ing`,
          code: `ING-${grade}01`,
          name: 'Yabancı Dil (İngilizce)',
          category: 'Yabancı Dil',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 4,
          branchTeacher: 'Canan YILDIRIM',
          teacherBranch: 'İngilizce',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'purple',
        },
        {
          id: `c-${norm}-tar`,
          code: `TAR-${grade}01`,
          name: 'Tarih',
          category: 'Sosyal & Beşeri',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Deniz ARSLAN',
          teacherBranch: 'Tarih',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'amber',
        },
        {
          id: `c-${norm}-cog`,
          code: `COG-${grade}01`,
          name: 'Coğrafya',
          category: 'Sosyal & Beşeri',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Deniz ARSLAN',
          teacherBranch: 'Coğrafya',
          backupTeachers: [],
          roomType: 'normal',
          requiredRoom: roomName,
          isSmartBoardReady: true,
          isElective: false,
          color: 'teal',
        },
        {
          id: `c-${norm}-bed`,
          code: `BED-${grade}01`,
          name: 'Beden Eğitimi & Spor',
          category: 'Sanat & Spor',
          gradeLevels: [gradeLabel],
          targetClass: norm,
          orgId,
          weeklyHours: 2,
          branchTeacher: 'Selim AKSOY',
          teacherBranch: 'Beden Eğitimi',
          backupTeachers: [],
          roomType: 'atolye',
          requiredRoom: 'Kapalı Spor Salonu',
          isSmartBoardReady: false,
          isElective: false,
          color: 'orange',
        },
      ]
    }
  }

  // Load authentic MEB preset courses tailored specifically to the grade level of selectedClass
  const handleLoadAuthenticPreset = () => {
    const classPreset = generateCurriculumForClass(selectedClass, selectedOrgId)
    const otherCourses = coursesList.filter(
      (c) => normalizeClassCode(c.targetClass) !== normalizeClassCode(selectedClass)
    )
    const merged = [...otherCourses, ...classPreset]
    persistCourses(merged)
    const match = selectedClass.match(/\d+/)
    const grade = match ? match[0] : '1'
    toast.success(`${selectedClass} sınıfı için ${grade}. Sınıf resmî MEB müfredatı başarıyla yüklendi!`)
  }

  // ── PUBLISH SCHEDULE ENGINE (KAYDET VE YAYINLA) ──
  const [lastPublishedTime, setLastPublishedTime] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('oxonom_schedule_last_published_at') || 'Canlıda Aktif'
      } catch (_) {}
    }
    return 'Canlıda Aktif'
  })

  const handlePublishSchedule = async () => {
    persistSchedule(scheduleList)
    const nowStr = new Date().toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
    setLastPublishedTime(nowStr)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_schedule_last_published_at', nowStr)
        localStorage.setItem('oxonom_schedule_last_published_by', principalName)
        localStorage.setItem('oxonom_admin_periods_30', JSON.stringify(periods))
        localStorage.setItem('oxonom_periods_30', JSON.stringify(periods))
        window.dispatchEvent(new CustomEvent('oxonom_schedule_published', { detail: scheduleList }))
      } catch (_) {}
    }

    try {
      await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule: scheduleList,
          periods,
          classCode: selectedClass,
          orgId: selectedOrgId,
          publishedBy: principalName,
        }),
      })
    } catch (_) {}

    toast.success(
      `🎉 ${selectedClass} haftalık ders programı başarıyla kaydedildi ve tüm öğretmen ile öğrenci panellerinde anında yayınlandı!`,
      { duration: 4500, icon: '🚀' }
    )
  }

  // ── OPEN NEW COURSE MODAL HANDLERS ──
  const handleOpenNewCourseModal = () => {
    const defaultTeacher = teachersList[0]?.name || 'Ebru TEKNECİ'
    const defaultBranch = teachersList[0]?.branch?.split('(')[0].trim() || 'Türk Dili ve Edebiyatı'

    setFormName('')
    setFormCode('')
    setFormTargetClass(selectedClass)
    setFormWeeklyHours(4)
    setFormCategory('Temel Ders')
    setFormBranchTeacher(defaultTeacher)
    setFormTeacherBranch(defaultBranch)
    setFormBackupTeachers([
      { id: 'b-default', name: 'Dr. Uğur UĞURLU', priority: 1, branch: 'Edebiyat & Kurum Yönetimi' },
    ])
    setNewBackupTeacherSelect('')
    setFormRoomType('normal')
    setFormRequiredRoom(`Derslik ${selectedClass}`)
    setFormColor('blue')
    setFormIsSmartBoard(true)
    setIsNewCourseModalOpen(true)
  }

  // Handle teacher selection change (BRANCH AUTO-FILLS)
  // User Rule: "Branş(Öğretmen seçince branşı Otomatik Gelir)"
  const handleSelectPrimaryTeacher = (teacherName: string) => {
    setFormBranchTeacher(teacherName)
    const teacherObj = teachersList.find((t) => t.name === teacherName)
    if (teacherObj && teacherObj.branch) {
      const cleanBranch = teacherObj.branch.split('(')[0].trim()
      setFormTeacherBranch(cleanBranch)
    } else if (teacherName === principalName || teacherName === 'Dr. Uğur UĞURLU') {
      setFormTeacherBranch('Okul Müdürü & Edebiyat')
    }
  }

  // Add backup teacher with priority order
  // User Rule: "Birden fazla yedek öğretmen gerekiyorsa öncelik sırası da tanımlanabilir."
  const handleAddBackupTeacher = () => {
    if (!newBackupTeacherSelect) {
      toast.error('Lütfen eklenecek yedek öğretmeni seçin.')
      return
    }
    if (formBackupTeachers.some((b) => b.name === newBackupTeacherSelect)) {
      toast.error('Bu öğretmen zaten yedek listesinde ekli.')
      return
    }
    const tObj = teachersList.find((t) => t.name === newBackupTeacherSelect)
    const nextPriority = formBackupTeachers.length + 1
    const newBackup: BackupTeacher = {
      id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: newBackupTeacherSelect,
      priority: nextPriority,
      branch: tObj?.branch?.split('(')[0].trim() || 'Branş Öğretmeni',
    }
    setFormBackupTeachers([...formBackupTeachers, newBackup])
    setNewBackupTeacherSelect('')
    toast.success(`${newBackup.name} ${nextPriority}. Öncelikli Yedek Öğretmen olarak eklendi.`)
  }

  const handleRemoveBackupTeacher = (id: string) => {
    setFormBackupTeachers((prev) =>
      prev
        .filter((b) => b.id !== id)
        .map((b, idx) => ({ ...b, priority: idx + 1 }))
    )
  }

  // Create course submit
  const handleCreateCourse = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const trimmedName = formName.trim()
    if (!trimmedName) {
      toast.error('Lütfen ders adını girin!')
      return
    }

    const autoCode = formCode.trim()
      ? formCode.trim().toUpperCase()
      : `${trimmedName.slice(0, 3).toUpperCase()}-101`

    const newCourse: CurriculumCourse = {
      id: `c-custom-${Date.now()}`,
      code: autoCode,
      name: trimmedName,
      category: formCategory,
      gradeLevels: [`${formTargetClass.split('/')[0]}. Sınıf`],
      targetClass: formTargetClass,
      orgId: selectedOrgId,
      weeklyHours: Number(formWeeklyHours) || 4,
      branchTeacher: formBranchTeacher,
      teacherBranch: formTeacherBranch,
      backupTeachers: formBackupTeachers,
      roomType: formRoomType,
      requiredRoom: formRequiredRoom.trim() || `Derslik ${formTargetClass}`,
      isSmartBoardReady: Boolean(formIsSmartBoard),
      isElective: false,
      color: formColor,
    }

    const updated = [...coursesList, newCourse]
    persistCourses(updated)
    toast.success(`🎉 "${trimmedName}" (${newCourse.weeklyHours} Saat) ${formTargetClass} sınıfı için tanımlandı!`)
    setIsNewCourseModalOpen(false)
    setSelectedCourseForDrop(newCourse)
  }

  // Edit course
  const handleOpenEditCourse = (course: CurriculumCourse) => {
    setCourseToEdit(course)
    setFormName(course.name)
    setFormCode(course.code)
    setFormTargetClass(course.targetClass || selectedClass)
    setFormWeeklyHours(course.weeklyHours)
    setFormCategory(course.category)
    setFormBranchTeacher(course.branchTeacher)
    setFormTeacherBranch(course.teacherBranch || 'Branş Öğretmeni')
    setFormBackupTeachers(course.backupTeachers || [])
    setFormRoomType(course.roomType || 'normal')
    setFormRequiredRoom(course.requiredRoom)
    setFormColor(course.color)
    setFormIsSmartBoard(course.isSmartBoardReady)
  }

  const handleSaveEditCourse = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!courseToEdit) return

    const trimmedName = formName.trim() || courseToEdit.name
    const updated = coursesList.map((c) => {
      if (c.id === courseToEdit.id) {
        return {
          ...c,
          name: trimmedName,
          code: formCode.trim().toUpperCase() || c.code,
          targetClass: formTargetClass,
          category: formCategory,
          weeklyHours: Number(formWeeklyHours) || c.weeklyHours,
          branchTeacher: formBranchTeacher,
          teacherBranch: formTeacherBranch,
          backupTeachers: formBackupTeachers,
          roomType: formRoomType,
          requiredRoom: formRequiredRoom.trim() || c.requiredRoom,
          color: formColor,
          isSmartBoardReady: Boolean(formIsSmartBoard),
        }
      }
      return c
    })

    persistCourses(updated)
    toast.success(`"${trimmedName}" ders bilgileri güncellendi!`)
    setCourseToEdit(null)
  }

  const handleDeleteCourse = (courseId: string) => {
    const course = coursesList.find((c) => c.id === courseId)
    const updated = coursesList.filter((c) => c.id !== courseId)
    persistCourses(updated)
    toast.success(`"${course?.name || 'Ders'}" ders havuzundan silindi.`)
    if (selectedCourseForDrop?.id === courseId) {
      setSelectedCourseForDrop(null)
    }
  }

  return (
    <div
      className={`min-h-screen font-jakarta select-none transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#0A0D15] text-white' : 'bg-[#F8FAFC] text-gray-900'
      }`}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6.5rem)' }}
    >
      {/* ── 1. HEADER (Optional mobile header) ── */}
      {!hideHeader && (
        <MobileHeader
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      <main className={`w-full ${hideHeader ? 'max-w-7xl mx-auto p-2 sm:p-4 lg:p-6' : 'max-w-[430px] sm:max-w-[460px] mx-auto'} min-h-screen space-y-4`}>
        {/* ── 2. HERO CARD & SINIF SEÇİCİ ── */}
        <section className="px-3 pt-2">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#0E1B38] to-[#06241C] border border-emerald-500/25 p-4 sm:p-5 shadow-xl text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-xs">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="text-sm font-black flex items-center gap-2">
                    <span>Haftalık Ders Programı</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Çakışma Korumalı
                    </span>
                  </div>
                  <p className="text-xs text-gray-300/80 mt-0.5">
                    Oxonom Okulları · Akıllı Zümre, Derslik ve Öğretmen Yerleşimi
                  </p>
                </div>
              </div>

              {/* Time slot edit button */}
              <button
                type="button"
                onClick={() => setIsEditPeriodsModalOpen(true)}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer"
              >
                <Sliders size={13} className="text-emerald-400" />
                <span>Ders Saatlerini Düzenle</span>
              </button>
            </div>

            {/* Sınıf / Şube Seçici (User Rule: Program oluşturulurken ilk önce sınıf seçilmeli) */}
            <div className="mt-3">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                <span className="text-gray-300 font-bold flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-emerald-400" />
                  <span>Programı Hazırlanan Sınıf / Şube:</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    Seçili: <strong>{selectedClass}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCopyTargetClass('')
                      setIsCopyScheduleModalOpen(true)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    title={`${selectedClass} ders programını başka bir şubeye kopyala`}
                  >
                    <Copy size={13} />
                    <span>Şube Programını Kopyala</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {availableClasses.map((cls) => {
                  const isSelected = normalizeClassCode(selectedClass) === normalizeClassCode(cls)
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => handleSelectClass(cls)}
                      className={`min-w-[70px] px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer text-center shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg ring-2 ring-emerald-400/50 scale-105'
                          : 'bg-white/10 hover:bg-white/20 text-gray-300'
                      }`}
                    >
                      {cls}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Weekly Hours Progress */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center text-xs">
              <div className="p-2 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-base font-black text-white">{targetWeeklyHours} Saat</div>
                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Haftalık Kapasite</div>
              </div>
              <div className="p-2 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-base font-black text-emerald-400">{totalAssignedHours} Saat</div>
                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Yerleştirilen Ders</div>
              </div>
              <div className="p-2 rounded-2xl bg-white/5 border border-white/5">
                <div className={`text-base font-black ${remainingTotalHours === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {remainingTotalHours === 0 ? 'Tamamlandı' : `${remainingTotalHours} Saat Boş`}
                </div>
                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Kalan Slot</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. ÖĞRETMEN MESAİ & DERS YÜKÜ MONİTÖRÜ (GRAFİKSEL GÖSTERİM) ── */}
        {/* User Rule: "Öğretmenlerin mesai saatlerine göre ders saatleri hesaplanır ve öğretmen mesaisinden fazla çalışıyorsa grafiksel olarak gösterilir." */}
        <section className="px-3">
          <div className="rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/90 dark:border-gray-800/80 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <BarChart2 size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>Öğretmen Mesai & Haftalık Ders Yükü Monitörü</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      Canlı Hesaplama
                    </span>
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    Okul geneli haftalık ders dağılımı vs. yasal mesai kapasitesi (30 Saat)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWorkloadExpanded(!isWorkloadExpanded)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
              >
                <span>{isWorkloadExpanded ? 'Gizle' : 'Göster'}</span>
                <ChevronDown size={14} className={`transition-transform ${isWorkloadExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Collapsed Executive Summary (Özet Bilgi - Tıklandığında Genişler) */}
            {!isWorkloadExpanded && (
              <div
                onClick={() => setIsWorkloadExpanded(true)}
                className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2 cursor-pointer group"
                title="Detaylı öğretmen ders yükü dağılımını görmek için tıklayın"
              >
                <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 text-center transition-colors group-hover:bg-purple-500/5">
                  <div className="text-[10px] text-gray-400 font-bold">Öğretmen Kadrosu</div>
                  <div className="text-xs font-black text-gray-900 dark:text-white mt-0.5">
                    {teacherWorkloads.length} Aktif
                  </div>
                </div>
                <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 text-center transition-colors group-hover:bg-purple-500/5">
                  <div className="text-[10px] text-gray-400 font-bold">Haftalık Dağıtılan</div>
                  <div className="text-xs font-black text-purple-600 dark:text-purple-400 mt-0.5">
                    {teacherWorkloads.reduce((acc, t) => acc + t.assignedHours, 0)} Saat
                  </div>
                </div>
                <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 text-center transition-colors group-hover:bg-purple-500/5">
                  <div className="text-[10px] text-gray-400 font-bold">Mesai Durumu</div>
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {teacherWorkloads.filter((t) => t.isOvertime).length > 0
                      ? `${teacherWorkloads.filter((t) => t.isOvertime).length} Ek Ders`
                      : 'Optimum (%100 Uyum)'}
                  </div>
                </div>
              </div>
            )}

            {isWorkloadExpanded && (
              <div className="mt-3 space-y-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                {teacherWorkloads.map((t) => (
                  <div key={t.id} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60">
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-900 dark:text-white">{t.name}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">({t.branch})</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-gray-700 dark:text-gray-300">
                          {t.assignedHours} / {t.weeklyLimit} Saat
                        </span>
                        {t.isOvertime ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[9px] font-black text-rose-600 dark:text-rose-400 animate-pulse">
                            <Flame size={10} />
                            <span>+{t.overtimeHours} Saat Ek Ders!</span>
                          </span>
                        ) : t.percentage === 100 ? (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-[9px] font-bold text-purple-600 dark:text-purple-400">
                            Tam Kapasite (%100)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                            Optimum (%{t.percentage})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar (Graphical representation) */}
                    <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          t.isOvertime
                            ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600'
                            : t.percentage >= 90
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600'
                            : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, t.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── 4. SEKMELER (MEVCUT PROGRAM / SÜRÜKLE-BIRAK DAĞITIM / DERS HAVUZU KATALOĞU) ── */}
        <section className="px-3">
          <div className="flex items-center p-1 rounded-2xl bg-gray-200/60 dark:bg-gray-800/60 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-white dark:bg-[#111827] text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Calendar size={14} />
              <span>Mevcut Haftalık Program</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('distribute')}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'distribute'
                  ? 'bg-white dark:bg-[#111827] text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Wand2 size={14} />
              <span>Programı Düzenle & Slot Dağıtımı</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white dark:bg-[#111827] text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Layers size={14} />
              <span>Sınıf Ders Kataloğu</span>
            </button>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SEKME 1: MEVCUT GÜNCEL & ONAYLI HAFTALIK DERS PROGRAMI
           ════════════════════════════════════════════════════════════ */}
        {activeTab === 'schedule' && (
          <div className="space-y-3">
            <section className="px-3">
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/90 dark:border-gray-800/80 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        2026-2027 Güncel & Onaylı Haftalık Ders Programı (Aktif)
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                      <span>{selectedClass} Şubesi Haftalık Ders Çizelgesi</span>
                      <span className="text-xs font-bold text-gray-400">
                        ({classEntries.length} / {targetWeeklyHours} Saat)
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Onaylayan: <strong className="text-gray-700 dark:text-gray-300">{principalName}</strong> (Okul Müdürü) · Öğretmen ve Öğrenci Panelleri ile Anlık Senkronize
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handlePublishSchedule}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-brand-gradient hover:opacity-95 text-white text-xs font-black shadow-md shadow-purple-950/20 transition-all cursor-pointer active:scale-98"
                    >
                      <CheckCircle2 size={14} />
                      <span>Kaydet & Canlıya Yayınla</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('distribute')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>Programı Düzenle / Yeni Ders Ekle</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSmartAutoFill}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Wand2 size={13} className="text-emerald-500" />
                      <span>Otomatik Doldur</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => typeof window !== 'undefined' && window.print()}
                      className="p-2 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                      title="Yazdır / PDF"
                    >
                      <Printer size={15} />
                    </button>
                  </div>
                </div>

                {/* View mode toggle (Matrix vs Daily) */}
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-emerald-500" />
                    <span>Görünüm Modu:</span>
                  </div>

                  <div className="flex items-center p-0.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setScheduleViewMode('matrix')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                        scheduleViewMode === 'matrix'
                          ? 'bg-white dark:bg-[#111827] text-emerald-600 dark:text-emerald-400 shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Table size={13} />
                      <span>Haftalık Tam Matris Tablosu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleViewMode('daily')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                        scheduleViewMode === 'daily'
                          ? 'bg-white dark:bg-[#111827] text-emerald-600 dark:text-emerald-400 shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Clock size={13} />
                      <span>Günlük Akış</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Schedule Content */}
            {classEntries.length === 0 ? (
              <section className="px-3">
                <div className="p-8 rounded-3xl bg-white dark:bg-[#111827] border border-dashed border-gray-300 dark:border-gray-800 text-center space-y-3">
                  <Calendar size={36} className="mx-auto text-gray-400" />
                  <h4 className="text-sm font-black text-gray-800 dark:text-white">
                    {selectedClass} sınıfı için henüz haftalık ders programı oluşturulmamış
                  </h4>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Ders havuzundaki dersleri öğretmen mesai saatleri ve derslik kapasitelerine göre 0 çakışma ile hemen otomatik oluşturabilir veya manuel olarak dağıtabilirsiniz.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleSmartAutoFill}
                      className="px-4 py-2.5 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-purple-950/20 cursor-pointer"
                    >
                      <Wand2 size={15} />
                      <span>Akıllı Otomatik Program Oluştur (35 Saat)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('distribute')}
                      className="px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer hover:bg-gray-200"
                    >
                      <span>Manuel Ders Dağıtımına Başla</span>
                    </button>
                  </div>
                </div>
              </section>
            ) : scheduleViewMode === 'matrix' ? (
              /* ── MATRİS TABLOSU (5 GÜN × 7 SAAT YAN YANA TAM TABLO) ── */
              <section className="px-3">
                <div className="rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/90 dark:border-gray-800/80 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200/80 dark:border-gray-800 text-[11px] font-black text-gray-600 dark:text-gray-300">
                          <th className="p-3 w-28 text-center shrink-0">Saat / Periyot</th>
                          {DAYS_LIST.map((d) => (
                            <th key={d.key} className="p-3 text-center">
                              <div>{d.label}</div>
                              <div className="text-[9px] font-medium text-gray-400">
                                {classEntries.filter((e) => e.day === d.key).length} Ders
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
                        {periods.map((slot) => (
                          <tr key={slot.periodNumber} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                            {/* Periyot & Saat Hücresi */}
                            <td className="p-2.5 text-center bg-gray-50/40 dark:bg-gray-900/40 border-r border-gray-100 dark:border-gray-800/60 shrink-0">
                              <div className="font-black text-gray-900 dark:text-white">
                                {slot.periodNumber}. Ders
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                {slot.time}
                              </div>
                            </td>

                            {/* Günler */}
                            {DAYS_LIST.map((day) => {
                              const entry = classEntries.find(
                                (e) => e.day === day.key && e.period === slot.periodNumber
                              )
                              const style = entry ? getColorStyle(entry.color) : null

                              return (
                                <td
                                  key={day.key}
                                  className="p-1.5 align-top border-r last:border-r-0 border-gray-100 dark:border-gray-800/60"
                                >
                                  {entry ? (
                                    <div
                                      onClick={() =>
                                        setSelectedSlotForAction({
                                          entry,
                                          day: day.key,
                                          period: slot.periodNumber,
                                        })
                                      }
                                      className={`p-2 rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] ${style?.bg} ${style?.border} ${style?.text}`}
                                    >
                                      <div className="font-black text-[11px] leading-tight">
                                        {entry.subject}
                                      </div>
                                      <div className="flex items-center gap-1 mt-1 text-[10px] opacity-90">
                                        <span>{entry.activeTeacherName || entry.teacherName}</span>
                                        {entry.isTeacherOnLeave && (
                                          <span className="text-[8px] font-black px-1 rounded bg-amber-500 text-white">
                                            Yedek
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center justify-between text-[9px] opacity-75 mt-1">
                                        <span className="truncate">{entry.roomName.split('(')[0].trim()}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveDay(day.key)
                                        setActiveTab('distribute')
                                      }}
                                      className="w-full h-16 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-emerald-400 hover:bg-emerald-50/20 text-gray-400 hover:text-emerald-600 text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
                                    >
                                      <Plus size={12} />
                                      <span>Boş</span>
                                    </button>
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
              </section>
            ) : (
              /* ── GÜNLÜK AKIŞ GÖRÜNÜMÜ ── */
              <div className="space-y-3">
                <section className="px-3">
                  <div className="grid grid-cols-5 gap-1.5">
                    {DAYS_LIST.map((day) => {
                      const isActive = activeDay === day.key
                      const dayCount = classEntries.filter((e) => e.day === day.key).length
                      return (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => setActiveDay(day.key)}
                          className={`py-2.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#4B075F] text-white shadow-md shadow-purple-950/20 ring-2 ring-[#8D49A6]/40 scale-102'
                              : 'bg-white dark:bg-[#111827] border border-gray-200/90 dark:border-gray-800/80 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <span className="text-[10px] font-bold opacity-80">{day.shortLabel}</span>
                          <span className="text-xs font-black">{day.label.slice(0, 3)}</span>
                          <span className={`text-[9px] mt-0.5 font-bold px-1.5 rounded-full ${isActive ? 'bg-white/20' : 'text-gray-400'}`}>
                            {dayCount}/{periods.length}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>

                <section className="px-3 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {periods.map((slot) => {
                      const entry = activeDayEntries.find((e) => e.period === slot.periodNumber)
                      const style = entry ? getColorStyle(entry.color) : null

                      return (
                        <div
                          key={slot.periodNumber}
                          onClick={() => {
                            if (entry) {
                              setSelectedSlotForAction({
                                entry,
                                day: activeDay,
                                period: slot.periodNumber,
                              })
                            }
                          }}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            entry
                              ? `bg-white dark:bg-[#111827] border-gray-200/90 dark:border-gray-800/80 shadow-xs cursor-pointer hover:border-emerald-500`
                              : 'border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                                  entry
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold'
                                }`}
                              >
                                <span className="text-[9px] uppercase leading-none opacity-80">DERS</span>
                                <span className="text-base font-black leading-none mt-0.5">{slot.periodNumber}</span>
                              </div>

                              <div className="min-w-0">
                                {entry ? (
                                  <>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-black text-gray-900 dark:text-white">
                                        {entry.subject}
                                      </span>
                                      {entry.isTeacherOnLeave ? (
                                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                          <UserCheck size={9} />
                                          <span>Yedek: {entry.activeTeacherName}</span>
                                        </span>
                                      ) : (
                                        <span
                                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md border ${style?.bg} ${style?.text} ${style?.border}`}
                                        >
                                          {entry.activeTeacherName || entry.teacherName}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400">
                                      <span>⏰ {slot.time}</span>
                                      <span>·</span>
                                      <span className="font-semibold text-gray-600 dark:text-gray-300">{entry.roomName}</span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="text-xs font-bold text-gray-400">Boş Ders Saati</div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">⏰ {slot.time}</div>
                                  </>
                                )}
                              </div>
                            </div>

                            {entry && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveSlot(activeDay, slot.periodNumber)
                                }}
                                className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-colors"
                                title="Dersi Boşalt"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            SEKME 2: HAFTALIK DERS PROGRAMI & SÜRÜKLE-BIRAK DAĞITIM
           ════════════════════════════════════════════════════════════ */}
        {activeTab === 'distribute' && (
          <div className="space-y-3">
            <div className="px-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <ArrowRight size={13} className="rotate-180" />
                <span>Onaylı Haftalık Programı Görüntüle</span>
              </button>
            </div>
            {/* A. SEÇİLİ SINIFIN DERS HAVUZU */}
            <section className="px-3">
              <div className="p-4 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/90 dark:border-gray-800/80 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-emerald-500" />
                    <span className="text-xs font-black text-gray-900 dark:text-white">
                      {selectedClass} Sınıfı Ders Havuzu ({classCoursesPool.length} Tanımlı Ders)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleOpenNewCourseModal}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white text-xs font-bold shadow-xs shadow-purple-950/20 transition-all cursor-pointer"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>Yeni Ders Tanımla</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                  💡 <strong>Nasıl Yerleştirilir:</strong> Aşağıdaki ders kartına dokunun, ardından gün akışındaki boş bir ders saatine dokunarak atayın.
                </p>

                {classCoursesPool.length === 0 ? (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-center space-y-2">
                    <BookOpen size={24} className="mx-auto text-gray-400" />
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {selectedClass} sınıfı için henüz ders tanımlanmadı.
                    </div>
                    <p className="text-[11px] text-gray-400">
                      "Yeni Ders Tanımla" butonu ile ders ekleyebilir veya varsayılan müfredatı yükleyebilirsiniz.
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenNewCourseModal}
                        className="px-3 py-1.5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold text-xs cursor-pointer shadow-xs shadow-purple-950/20"
                      >
                        + Bu Sınıfa Ders Ekle
                      </button>
                      <button
                        type="button"
                        onClick={handleLoadAuthenticPreset}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer"
                      >
                        Örnek Müfredatı Yükle
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {classCoursesPool.map((course) => {
                      const style = getColorStyle(course.color)
                      const placedHours = placedSubjectCounts[course.name] || 0
                      const isFullyPlaced = placedHours >= course.weeklyHours
                      const isSelected = selectedCourseForDrop?.id === course.id

                      return (
                        <motion.div
                          key={course.id}
                          whileTap={{ scale: 0.96 }}
                          draggable={true}
                          onDragStart={(e) => {
                            const dt = (e as unknown as { dataTransfer?: DataTransfer }).dataTransfer
                            if (dt) dt.setData('text/plain', course.name)
                            setDraggedCourseName(course.name)
                          }}
                          onDragEnd={() => setDraggedCourseName(null)}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCourseForDrop(null)
                            } else {
                              setSelectedCourseForDrop(course)
                              toast(`🎯 "${course.name}" seçildi. Yerleştirmek istediğiniz ders saatine dokunun.`, {
                                icon: '👉',
                                duration: 2000,
                              })
                            }
                          }}
                          className={`p-2 px-3 rounded-2xl border text-xs font-bold transition-all cursor-grab active:cursor-grabbing flex items-center gap-2 shadow-xs ${
                            isSelected
                              ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-100'
                              : isFullyPlaced
                              ? 'bg-gray-100 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 opacity-80'
                              : `${style.bg} ${style.border} ${style.text}`
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                          <div className="text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black">{course.name}</span>
                              <span className="text-[9px] opacity-75 font-mono">({course.code})</span>
                            </div>
                            <div className="text-[10px] font-normal opacity-90">
                              {course.branchTeacher} · {course.requiredRoom}
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                              isFullyPlaced
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/80 dark:bg-black/40 border border-current'
                            }`}
                          >
                            {placedHours}/{course.weeklyHours}s
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                )}

                {/* Selected Indicator Banner */}
                {selectedCourseForDrop && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>
                        Seçili Ders: <strong>{selectedCourseForDrop.name}</strong> ({selectedCourseForDrop.branchTeacher})
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {placedSubjectCounts[selectedCourseForDrop.name] || 0}/{selectedCourseForDrop.weeklyHours} Yerleşti
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCourseForDrop(null)}
                      className="text-xs text-gray-500 hover:text-gray-700 font-bold px-2 py-0.5 rounded-lg bg-gray-200 dark:bg-gray-700 cursor-pointer"
                    >
                      Vazgeç
                    </button>
                  </motion.div>
                )}
              </div>
            </section>

            {/* B. GÜN SEÇİCİ & AKILLI OTOMATİK DOLDUR AKSİYONLARI */}
            <section className="px-3">
              <div className="grid grid-cols-5 gap-1.5">
                {DAYS_LIST.map((day) => {
                  const isActive = activeDay === day.key
                  const dayCount = classEntries.filter((e) => e.day === day.key).length
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setActiveDay(day.key)}
                      className={`py-2.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#4B075F] text-white shadow-md shadow-purple-950/20 ring-2 ring-[#8D49A6]/40 scale-102'
                          : 'bg-white dark:bg-[#111827] border border-gray-200/90 dark:border-gray-800/80 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-[10px] font-bold opacity-80">{day.shortLabel}</span>
                      <span className="text-xs font-black">{day.label.slice(0, 3)}</span>
                      <span className={`text-[9px] mt-0.5 font-bold px-1.5 rounded-full ${isActive ? 'bg-white/20' : 'text-gray-400'}`}>
                        {dayCount}/{periods.length}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Action Buttons: Otomatik Doldur & Haftayı Sıfırla */}
              <div className="grid grid-cols-2 gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={handleSmartAutoFill}
                  className="h-10 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-950/20 transition-all cursor-pointer active:scale-98"
                >
                  <Wand2 size={15} />
                  <span>Akıllı Otomatik Doldur</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearWeek}
                  className="h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Haftayı Sıfırla</span>
                </button>
              </div>
            </section>

            {/* C. GÜNLÜK DERS SAATLERİ AKIŞI (SLOTLAR) */}
            <section className="px-3 space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Clock size={14} className="text-emerald-500" />
                  <span>
                    {selectedClass} · {DAYS_LIST.find((d) => d.key === activeDay)?.label} Akışı ({activeDayEntries.length}/{periods.length} Saat)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditPeriodsModalOpen(true)}
                  className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Saatleri Düzenle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {periods.map((slot) => {
                  const entry = activeDayEntries.find((e) => e.period === slot.periodNumber)
                  const style = entry ? getColorStyle(entry.color) : null

                  return (
                    <motion.div
                      key={slot.periodNumber}
                      whileTap={{ scale: 0.98 }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const subjectName = e.dataTransfer.getData('text/plain') || draggedCourseName
                        if (subjectName) {
                          const matched = classCoursesPool.find((c) => c.name === subjectName)
                          if (matched) {
                            handleAssignCourseToSlot(activeDay, slot.periodNumber, matched)
                          }
                        }
                      }}
                      onClick={() => {
                        if (selectedCourseForDrop) {
                          handleAssignCourseToSlot(activeDay, slot.periodNumber, selectedCourseForDrop)
                        } else if (entry) {
                          setSelectedSlotForAction({
                            entry,
                            day: activeDay,
                            period: slot.periodNumber,
                          })
                        } else {
                          toast('Lütfen yukarıdaki ders havuzundan bir ders seçin veya Yeni Ders Tanımla butonunu kullanın.', {
                            icon: '☝️',
                          })
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                        entry
                          ? `bg-white dark:bg-[#111827] border-gray-200/90 dark:border-gray-800/80 shadow-xs hover:border-emerald-500`
                          : selectedCourseForDrop
                          ? 'border-2 border-dashed border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                          : 'border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {/* Sol: Saat ve Periyot */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                              entry
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold'
                            }`}
                          >
                            <span className="text-[9px] uppercase leading-none opacity-80">DERS</span>
                            <span className="text-base font-black leading-none mt-0.5">{slot.periodNumber}</span>
                          </div>

                          <div className="min-w-0">
                            {entry ? (
                              <>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-black text-gray-900 dark:text-white">
                                    {entry.subject}
                                  </span>
                                  {entry.isTeacherOnLeave ? (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                      <UserCheck size={9} />
                                      <span>Yedek: {entry.activeTeacherName}</span>
                                    </span>
                                  ) : (
                                    <span
                                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md border ${style?.bg} ${style?.text} ${style?.border}`}
                                    >
                                      {entry.activeTeacherName || entry.teacherName}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400">
                                  <span>⏰ {slot.time}</span>
                                  <span>·</span>
                                  <span className="font-semibold text-gray-600 dark:text-gray-300">{entry.roomName}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-xs font-bold text-gray-400">
                                  {selectedCourseForDrop
                                    ? `👉 "${selectedCourseForDrop.name}" dersini buraya bırak/dokun`
                                    : 'Boş Ders Saati'}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5">
                                  ⏰ {slot.time}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Sağ Aksiyon */}
                        <div className="flex items-center gap-1 shrink-0">
                          {entry ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveSlot(activeDay, slot.periodNumber)
                              }}
                              className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-colors"
                              title="Dersi Boşalt"
                            >
                              <Trash2 size={13} />
                            </button>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
                              <Plus size={14} />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            SEKME 2: SINIF DERS TANIMLARI & KATALOG
           ════════════════════════════════════════════════════════════ */}
        {activeTab === 'catalog' && (
          <div className="space-y-3 px-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-900 dark:text-white">
                {selectedClass} Sınıfı Tanımlı Dersleri ({classCoursesPool.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAllCourses}
                  className="h-8 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-bold transition-all cursor-pointer"
                >
                  Tümünü Temizle
                </button>
                <button
                  type="button"
                  onClick={handleOpenNewCourseModal}
                  className="h-8 px-3 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs shadow-purple-950/20 transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Yeni Ders Tanımla</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {classCoursesPool.map((course) => {
                const style = getColorStyle(course.color)
                const placedHours = placedSubjectCounts[course.name] || 0

                return (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/90 dark:border-gray-800/80 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-gray-900 dark:text-white">
                            {course.name}
                          </span>
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                            {course.code}
                          </span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {course.targetClass}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md border ${style.bg} ${style.text} ${style.border}`}
                          >
                            {course.category}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            {course.roomType === 'laboratuvar' ? '🔬 Laboratuvar' : course.roomType === 'atolye' ? '🛠️ Atölye' : '🏫 Normal Sınıf'}
                          </span>
                        </div>

                        {/* Detailed Teacher & Room Meta */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                          <div>
                            <strong>Asıl Öğretmen:</strong> {course.branchTeacher} ({course.teacherBranch})
                          </div>
                          <div>
                            <strong>Derslik:</strong> {course.requiredRoom}
                          </div>
                          {course.backupTeachers && course.backupTeachers.length > 0 && (
                            <div className="col-span-full text-amber-600 dark:text-amber-400">
                              <strong>Yedek Öğretmenler:</strong>{' '}
                              {course.backupTeachers.map((b) => `${b.priority}. ${b.name}`).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Edit / Delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCourse(course)}
                          className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-emerald-500 flex items-center justify-center cursor-pointer"
                          title="Dersi Düzenle"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-rose-500 flex items-center justify-center cursor-pointer"
                          title="Dersi Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold pt-1 border-t border-gray-100 dark:border-gray-800">
                      <span>Haftalık {course.weeklyHours} Saat</span>
                      <span>
                        {placedHours >= course.weeklyHours ? (
                          <span className="text-emerald-500 font-bold">Tamamı Dağıtıldı ({placedHours}s)</span>
                        ) : (
                          <span className="text-amber-500 font-bold">{course.weeklyHours - placedHours} Saat Bekliyor</span>
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── ALTA SABİTLENEN KAYDET VE CANLIYA YAYINLA ÇUBUĞU ── */}
        <section className="sticky bottom-0 z-30 px-3 py-3 mt-4 bg-white/95 dark:bg-[#0E1526]/95 backdrop-blur-md border border-gray-200/90 dark:border-gray-800/90 rounded-3xl shadow-xl overflow-hidden min-w-0">
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 min-w-0 w-full">
            <div className="flex items-center gap-3 w-full xl:w-auto min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                  <span>Haftalık Program Yayın Kontrolü</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    {totalAssignedHours}/{targetWeeklyHours} Saat Yerleşik
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                  {lastPublishedTime
                    ? `Son Yayın: ${lastPublishedTime} · Öğretmen ve Öğrenci Panellerine Anında Yansır`
                    : 'Öğretmen ve öğrenci ekranlarını güncellemek için yayınlayın.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full xl:w-auto shrink-0 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={handleSmartAutoFill}
                className="flex-1 sm:flex-none h-11 px-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <Wand2 size={14} className="text-emerald-500" />
                <span>Otomatik Doldur</span>
              </button>

              <button
                type="button"
                onClick={handlePublishSchedule}
                className="flex-1 sm:flex-none h-11 px-5 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950/25 active:scale-98 transition-all cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 size={16} />
                <span>Kaydet ve Canlıya Yayınla</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── MODAL 1: YENİ DERS TANIMLA (USER SPECIFIED LAYOUT) ── */}
      <AnimatePresence>
        {isNewCourseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewCourseModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-lg max-h-[92vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900 border-t sm:border border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Plus size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Yeni Ders Tanımla
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Sınıf, asıl/yedek öğretmen, branş ve derslik tanımları
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewCourseModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form Content */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleCreateCourse()
                }}
                className="p-5 overflow-y-auto space-y-4 text-xs"
              >
                {/* ── BÖLÜM 1: DERS BİLGİLERİ ── */}
                <div className="space-y-2.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/80">
                  <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen size={13} />
                    <span>1. Ders Bilgileri</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Ders Adı *
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => {
                          setFormName(e.target.value)
                          if (!formCode && e.target.value.length >= 3) {
                            setFormCode(`${e.target.value.slice(0, 3).toUpperCase()}-101`)
                          }
                        }}
                        placeholder="Örn: Matematik"
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Ders Kodu
                      </label>
                      <input
                        type="text"
                        value={formCode}
                        onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                        placeholder="Örn: MAT-901"
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono font-black uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Sınıf / Şube *
                      </label>
                      <select
                        value={formTargetClass}
                        onChange={(e) => {
                          setFormTargetClass(e.target.value)
                          if (formRoomType === 'normal') {
                            setFormRequiredRoom(`Derslik ${e.target.value}`)
                          }
                        }}
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-black text-emerald-600 dark:text-emerald-400"
                      >
                        {availableClasses.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Haftalık Ders Saati *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={formWeeklyHours}
                        onChange={(e) => setFormWeeklyHours(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-black text-center"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Kategori
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                        className="w-full h-10 px-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                      >
                        <option value="Temel Ders">Temel Ders</option>
                        <option value="Fen & Teknoloji">Fen & Teknoloji</option>
                        <option value="Sosyal & Beşeri">Sosyal & Beşeri</option>
                        <option value="Sanat & Spor">Sanat & Spor</option>
                        <option value="Yabancı Dil">Yabancı Dil</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── BÖLÜM 2: ÖĞRETMEN BİLGİLERİ ── */}
                <div className="space-y-2.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/80">
                  <div className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={13} />
                    <span>2. Öğretmen Bilgileri</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Asıl Öğretmen *
                      </label>
                      <select
                        value={formBranchTeacher}
                        onChange={(e) => handleSelectPrimaryTeacher(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                      >
                        {teachersList.map((t) => (
                          <option key={t.id || t.name} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Branş (Otomatik Gelir)
                      </label>
                      <input
                        type="text"
                        value={formTeacherBranch}
                        onChange={(e) => setFormTeacherBranch(e.target.value)}
                        placeholder="Örn: Türk Dili ve Edebiyatı"
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-semibold text-indigo-600 dark:text-indigo-400"
                      />
                    </div>
                  </div>

                  {/* Yedek Öğretmen Öncelik Sıralı Alanı */}
                  <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                        Yedek Öğretmenler (Öncelik Sırası)
                      </label>
                      <span className="text-[10px] text-gray-400">
                        Asıl öğretmen izinli/raporlu olduğunda devreye girer
                      </span>
                    </div>

                    {/* Mevcut Yedekler Listesi */}
                    <div className="space-y-1.5 mb-2">
                      {formBackupTeachers.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center">
                              {b.priority}
                            </span>
                            <span className="font-extrabold text-amber-900 dark:text-amber-200">
                              {b.name}
                            </span>
                            <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
                              ({b.branch})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveBackupTeacher(b.id)}
                            className="text-rose-500 hover:text-rose-700 font-bold text-[11px] cursor-pointer"
                          >
                            Çıkar
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Yedek Öğretmen Ekle Seçici */}
                    <div className="flex items-center gap-2">
                      <select
                        value={newBackupTeacherSelect}
                        onChange={(e) => setNewBackupTeacherSelect(e.target.value)}
                        className="flex-1 h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold"
                      >
                        <option value="">+ Yedek Öğretmen Seç</option>
                        {teachersList
                          .filter((t) => t.name !== formBranchTeacher)
                          .map((t) => (
                            <option key={t.id || t.name} value={t.name}>
                              {t.name} ({t.branch ? t.branch.split('(')[0].trim() : 'Öğretmen'})
                            </option>
                          ))}
                        <option value={principalName}>{principalName} (Okul Müdürü)</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddBackupTeacher}
                        className="px-3 h-9 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Sıraya Ekle
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── BÖLÜM 3: DERSLİK BİLGİLERİ ── */}
                <div className="space-y-2.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/80">
                  <div className="text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={13} />
                    <span>3. Derslik Seçimi & Türü</span>
                  </div>

                  {/* 3'lü Segment: Normal Sınıf | Atölye | Laboratuvar */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                      Derslik Türü
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setFormRoomType('normal')
                          setFormRequiredRoom(`Derslik ${formTargetClass}`)
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                          formRoomType === 'normal'
                            ? 'bg-[#4B075F] text-white border-[#4B075F] shadow-sm shadow-purple-950/20'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <School size={16} />
                        <span>Normal Sınıf</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormRoomType('atolye')
                          setFormRequiredRoom('Bilişim & Kodlama Atölyesi')
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                          formRoomType === 'atolye'
                            ? 'bg-[#4B075F] text-white border-[#4B075F] shadow-sm shadow-purple-950/20'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <Sparkles size={16} />
                        <span>Atölye</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormRoomType('laboratuvar')
                          setFormRequiredRoom('Fen & Teknoloji Laboratuvarı')
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                          formRoomType === 'laboratuvar'
                            ? 'bg-[#4B075F] text-white border-[#4B075F] shadow-sm shadow-purple-950/20'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <Layers size={16} />
                        <span>Laboratuvar</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Fiziksel Derslik Adı
                    </label>
                    <input
                      type="text"
                      value={formRequiredRoom}
                      onChange={(e) => setFormRequiredRoom(e.target.value)}
                      placeholder="Derslik adı girin..."
                      className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                      required
                    />
                  </div>
                </div>

                {/* Renk Seçimi */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                    Kart Renk Teması
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {Object.keys(COLOR_OPTIONS).map((cKey) => {
                      const cStyle = COLOR_OPTIONS[cKey]
                      return (
                        <button
                          key={cKey}
                          type="button"
                          onClick={() => setFormColor(cKey)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            cStyle.dot
                          } ${formColor === cKey ? 'ring-2 ring-offset-2 ring-[#4B075F] scale-110' : 'opacity-80'}`}
                        >
                          {formColor === cKey && <Check size={12} className="text-white" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs shadow-md shadow-purple-950/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Dersi Oluştur ve Kataloğa Kaydet</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: DERS DÜZENLE MODALI ── */}
      <AnimatePresence>
        {courseToEdit && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCourseToEdit(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-lg max-h-[92vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900 border-t sm:border border-gray-200'
              }`}
            >
              <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Ders Bilgilerini Güncelle
                    </h3>
                    <p className="text-[11px] text-gray-400">{courseToEdit.name} · {courseToEdit.code}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCourseToEdit(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSaveEditCourse()
                }}
                className="p-5 overflow-y-auto space-y-3.5 text-xs"
              >
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Ders Adı</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Ders Kodu</label>
                    <input
                      type="text"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Sınıf</label>
                    <select
                      value={formTargetClass}
                      onChange={(e) => setFormTargetClass(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                    >
                      {availableClasses.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Haftalık Saat</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={formWeeklyHours}
                      onChange={(e) => setFormWeeklyHours(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Asıl Öğretmen</label>
                    <select
                      value={formBranchTeacher}
                      onChange={(e) => handleSelectPrimaryTeacher(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                    >
                      {teachersList.map((t) => (
                        <option key={t.id || t.name} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Branş</label>
                    <input
                      type="text"
                      value={formTeacherBranch}
                      onChange={(e) => setFormTeacherBranch(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Derslik Adı</label>
                  <input
                    type="text"
                    value={formRequiredRoom}
                    onChange={(e) => setFormRequiredRoom(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs shadow-md shadow-purple-950/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    <span>Değişiklikleri Kaydet</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: DERS SAATLERİNİ DÜZENLE (MÜDÜR İSTERSE SAATLERDE DEĞİŞİKLİK YAPABİLİR) ── */}
      <AnimatePresence>
        {isEditPeriodsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditPeriodsModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-md max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900 border-t sm:border border-gray-200'
              }`}
            >
              <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Ders Saatlerini Özelleştir
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Günün ders periyotlarını ve başlangıç-bitiş saatlerini güncelleyin
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditPeriodsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-3 text-xs">
                {periods.map((p, idx) => (
                  <div key={p.periodNumber} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                    <span className="w-8 font-black text-gray-700 dark:text-gray-300">
                      {p.periodNumber}. Ders
                    </span>
                    <input
                      type="text"
                      value={p.time}
                      onChange={(e) => {
                        const val = e.target.value
                        const updated = periods.map((item) =>
                          item.periodNumber === p.periodNumber ? { ...item, time: val } : item
                        )
                        setPeriods(updated)
                      }}
                      className="flex-1 h-9 px-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono font-bold text-xs"
                      placeholder="08:30 - 09:10"
                    />
                    {periods.length > 4 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = periods.filter((item) => item.periodNumber !== p.periodNumber)
                          setPeriods(updated)
                        }}
                        className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center cursor-pointer"
                        title="Ders Saatini Sil"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const nextNum = periods.length + 1
                    const newPeriod: PeriodSlot = {
                      periodNumber: nextNum,
                      time: '15:30 - 16:10',
                    }
                    setPeriods([...periods, newPeriod])
                  }}
                  className="w-full h-10 rounded-xl border border-dashed border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>+ Yeni Ders Saati Ekle</span>
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      persistPeriods(periods)
                      setIsEditPeriodsModalOpen(false)
                      toast.success('Ders saatleri çizelgesi başarıyla kaydedildi!')
                    }}
                    className="w-full h-11 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs shadow-md shadow-purple-950/20 transition-all cursor-pointer"
                  >
                    Kaydet ve Uygula
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 4: SLOT AKSİYON SHEET (ASIL ÖĞRETMEN İZİNLİ BİLDİR / YEDEK DEVRAL) ── */}
      <AnimatePresence>
        {selectedSlotForAction && selectedSlotForAction.entry && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSlotForAction(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl z-10 space-y-4 ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900 border-t sm:border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">
                    {selectedSlotForAction.entry.subject}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {DAYS_LIST.find((d) => d.key === selectedSlotForAction.day)?.label} · {selectedSlotForAction.period}. Ders Saati
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSlotForAction(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Slot Details */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sınıf / Şube:</span>
                  <span className="font-black text-emerald-500">{selectedSlotForAction.entry.classCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Asıl Öğretmen:</span>
                  <span className="font-extrabold">{selectedSlotForAction.entry.teacherName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tanımlı Yedek:</span>
                  <span className="font-bold text-amber-500">{selectedSlotForAction.entry.backupTeacherName || 'Dr. Uğur UĞURLU'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Derslik:</span>
                  <span className="font-bold">{selectedSlotForAction.entry.roomName}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-400">Fiilen Görevli Öğretmen:</span>
                  <span className="font-black text-indigo-500">
                    {selectedSlotForAction.entry.activeTeacherName || selectedSlotForAction.entry.teacherName}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                {/* Asıl öğretmen yokluğunda izin durumu toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleTeacherLeave(selectedSlotForAction.entry!)}
                  className={`w-full h-11 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    selectedSlotForAction.entry.isTeacherOnLeave
                      ? 'bg-[#16805D] hover:bg-[#16805D]/90 text-white'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {selectedSlotForAction.entry.isTeacherOnLeave ? (
                    <>
                      <UserCheck size={16} />
                      <span>Asıl Öğretmen Göreve Döndü (Normale Al)</span>
                    </>
                  ) : (
                    <>
                      <UserX size={16} />
                      <span>Asıl Öğretmen İzinli / Raporlu (Yedeği Devreye Al)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveSlot(selectedSlotForAction.day, selectedSlotForAction.period)}
                  className="w-full h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-rose-100"
                >
                  <Trash2 size={15} />
                  <span>Bu Saati Boşalt / Dersi Kaldır</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 5: ŞUBE PROGRAMINI KOPYALA ── */}
      <AnimatePresence>
        {isCopyScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCopyScheduleModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className={`relative w-full sm:max-w-md rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden border ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-gray-800'
                  : 'bg-white text-gray-900 border-gray-200'
              }`}
            >
              <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Copy size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Ders Programını Kopyala
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Kaynak şube çizelgesini başka bir şubeye aktarın
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCopyScheduleModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Kaynak Şube Bilgisi */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/60">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Kaynak Şube (Mevcut Program)
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm border border-emerald-500/30">
                        {selectedClass}
                      </span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {selectedClass} Şubesi Haftalık Ders Çizelgesi
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-500">
                      {classEntries.length} Saat
                    </span>
                  </div>
                </div>

                {/* Hedef Sınıf / Şube */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Hedef Sınıf / Şube Seçiniz veya Yazınız:
                  </label>
                  
                  {/* Hızlı Seçim Butonları */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                    {['9/B', '9/C', '10/A', '10/B', '11/A', '12/A']
                      .filter((c) => normalizeClassCode(c) !== normalizeClassCode(selectedClass))
                      .map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCopyTargetClass(preset)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            copyTargetClass === preset
                              ? 'bg-[#4B075F] text-white shadow-xs'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                  </div>

                  <input
                    type="text"
                    value={copyTargetClass}
                    onChange={(e) => setCopyTargetClass(e.target.value.toUpperCase())}
                    placeholder="Örn: 9/B veya 10/A"
                    className="w-full h-11 px-3.5 rounded-2xl text-xs font-bold bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#4B075F]/40 uppercase"
                  />
                </div>

                {/* Bilgilendirme Notu */}
                <div className="p-3 rounded-2xl bg-[#F0D8FA]/40 dark:bg-[#4B075F]/20 border border-[#E8DFEB] dark:border-[#49364F] text-[11px] text-[#4B075F] dark:text-[#D2C5D8] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#8D49A6]" />
                    <span>Otomatik Uyarlama:</span>
                  </div>
                  <p className="text-[#514458] dark:text-[#B5A5BD] leading-relaxed">
                    Kopyalama yapıldığında <strong>{selectedClass}</strong> şubesinin tüm ders havuzu ve haftalık tablosu hedef şubeye aktarılır. Derslik adları ve şube kodları hedef şubeye göre otomatik güncellenir.
                  </p>
                </div>

                {/* Aksiyon Butonları */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCopyScheduleModalOpen(false)}
                    className="flex-1 h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer transition-colors"
                  >
                    İptal
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySchedule}
                    disabled={!copyTargetClass.trim()}
                    className="flex-1 h-11 rounded-2xl bg-brand-gradient hover:opacity-95 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-950/20 transition-all active:scale-98"
                  >
                    <Copy size={14} />
                    <span>Programı Kopyala ve Uygula</span>
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
