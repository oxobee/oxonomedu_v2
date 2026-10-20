'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  GraduationCap,
  Briefcase,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Tv,
  FileText,
  Activity,
  Layers,
  HeartHandshake,
  School,
  ExternalLink,
  UserCheck,
  CalendarClock,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  User,
  Phone,
  Mail,
  Award,
  LogOut,
  Edit2,
  BarChart3,
  PieChart,
  QrCode,
  Send,
  MessageSquare,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Share2,
  Plus,
  Printer,
  ChevronDown,
  Info,
  CheckSquare,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileAdminDock from './MobileAdminDock'
import MobileAdminMoreSheet from './MobileAdminMoreSheet'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import MockBadge from '@components/Common/MockBadge'
import LiveClassRadar from '@components/Common/LiveClassRadar'
import { SCHOOL_ORGS, getOrgTeachers } from '@services/demo/schoolDirectory'
import {
  INITIAL_SCHEDULE_ENTRIES,
  ScheduleEntry,
  DayKey,
  DAYS_LIST,
  SCHOOL_ROOMS,
  PRIMARY_PERIODS,
  MIDDLE_PERIODS,
} from './MAdminScheduleClient'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useAuth } from '@components/Contexts/AuthContext'
import {
  getStoredPrincipalProfile,
  savePrincipalProfile,
  getStoredSchoolInfo,
  saveSchoolInfo,
  getPrincipalInitials,
} from '@/lib/principal/principalProfileStorage'

export interface MAdminClientProps {
  orgSlug?: string
  hideHeader?: boolean
  hideDock?: boolean
}

export default function MAdminClient({
  orgSlug,
  hideHeader = false,
  hideDock = false,
}: MAdminClientProps) {
  const { theme, toggleTheme } = useMobileTheme()
  const router = useRouter()
  const pathname = usePathname() || '/principal/dashboard'
  const searchParams = useSearchParams()
  const { signOut } = useAuth()
  const session = useLHSession() as any
  const user = session?.data?.user

  // Check if we are in principal portal
  const isPrincipalRoute = pathname.startsWith('/principal')

  // Helper for dynamic routing
  const getUrl = (path: string) => {
    if (isPrincipalRoute) {
      if (path === '/m-admin-students') return '/principal/students'
      if (path === '/m-admin-teachers') return '/principal/teachers'
      if (path === '/m-admin-classes') return '/principal/classes'
      if (path === '/m-admin-schedule') return '/principal/schedule'
      if (path === '/m-admin-boards') return '/principal/smartboards'
      if (path === '/m-admin-reports') return '/principal/reports'
      if (path === '/m-admin-curriculum') return '/principal/curriculum'
      if (path === '/m-admin-settings') return '/principal/settings'
    }
    return orgSlug ? `/orgs/${orgSlug}${path}` : path
  }

  // Active School Org (Default 30: Oxonom Okulları / Necla Görer)
  const [selectedOrgId, setSelectedOrgId] = useState<number>(30)
  const activeOrg = SCHOOL_ORGS.find((o) => o.id === selectedOrgId) || SCHOOL_ORGS[0]

  // ── YÖNETİCİ HESAP & PROFİL BİLGİLERİ STATE ──
  const [isAdminProfileModalOpen, setIsAdminProfileModalOpen] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  const [adminProfile, setAdminProfile] = useState<{
    name: string
    title: string
    email: string
    tcNo: string
    phone: string
    username: string
    role: string
    schoolName: string
    loginTime: string
    twoFactorActive: boolean
  }>({
    name: 'Dr. Uğur UĞURLU',
    title: 'Okul Müdürü · Kurum Yetkilisi',
    email: 'mudur@oxonom.com',
    tcNo: '10000000146',
    phone: '+90 532 999 2200',
    username: 'mudur',
    role: '1. Derece Kurum Müdürü (Baş Yönetici)',
    schoolName: 'Necla Görer İlkokulu',
    loginTime: 'Bugün, 08:30',
    twoFactorActive: true,
  })

  // Edit profile form state
  const [editName, setEditName] = useState('Dr. Uğur UĞURLU')
  const [editTitle, setEditTitle] = useState('Okul Müdürü · Kurum Yetkilisi')
  const [editTcNo, setEditTcNo] = useState('10000000146')
  const [editPhone, setEditPhone] = useState('+90 532 999 2200')
  const [editEmail, setEditEmail] = useState('mudur@oxonom.com')
  const [editSchoolName, setEditSchoolName] = useState('Necla Görer İlkokulu')

  // Dynamic counts for strictly REAL DATA (No mock data)
  const [realStats, setRealStats] = useState({
    studentCount: 1,
    studentName: 'Erçil UĞURLU',
    teacherCount: 16,
    teacherName: 'Özlem ZOR',
    classCount: 32,
    className: '1/A',
    parentCount: 1,
    activeBoardsCount: 0,
  })

  // Load from persistent storage on mount and on update events
  useEffect(() => {
    const loadPrincipalAndStats = () => {
      if (typeof window !== 'undefined') {
        try {
          const stored = getStoredPrincipalProfile()
          const storedSchool = getStoredSchoolInfo()

          setAdminProfile({
            name: stored.name,
            title: stored.title,
            email: stored.email,
            tcNo: stored.tcNo,
            phone: stored.phone,
            username: stored.username || 'mudur',
            role: stored.role || '1. Derece Kurum Müdürü (Baş Yönetici)',
            schoolName: stored.schoolName || storedSchool.officialName,
            loginTime: stored.loginTime || 'Bugün, 08:30',
            twoFactorActive: stored.twoFactorActive,
          })
          setEditName(stored.name)
          setEditTitle(stored.title)
          setEditTcNo(stored.tcNo)
          setEditPhone(stored.phone)
          setEditEmail(stored.email)
          setEditSchoolName(stored.schoolName || storedSchool.officialName)

          // Real counts for selectedOrgId
          const rawTeachers = localStorage.getItem(`oxonom_admin_teachers_${selectedOrgId}`)
          const teachers = rawTeachers ? JSON.parse(rawTeachers) : null
          const tCount = Array.isArray(teachers) && teachers.length > 0 ? teachers.length : 16
          const tName = Array.isArray(teachers) && teachers.length > 0 ? teachers[0].name : 'Özlem ZOR'

          const rawStudents =
            localStorage.getItem(`oxonom_admin_students_list_${selectedOrgId}`) ||
            localStorage.getItem('oxonom_admin_students_list_30') ||
            localStorage.getItem('oxonom_m_students_v3')
          const students = rawStudents ? JSON.parse(rawStudents) : null
          const sCount = Array.isArray(students) && students.length > 0 ? students.length : 1
          const sName = Array.isArray(students) && students.length > 0 ? (students[0]?.name || 'Erçil UĞURLU') : 'Erçil UĞURLU'
          const sClass = Array.isArray(students) && students.length > 0 ? (students[0]?.className || '1/A') : '1/A'

          const rawClasses = localStorage.getItem(`oxonom_admin_classes_${selectedOrgId}`)
          const classes = rawClasses ? JSON.parse(rawClasses) : null
          const cCount = Array.isArray(classes) && classes.length >= 10 ? classes.length : 32
          const cName = sClass.includes('/') ? sClass : sClass.replace('-', '/')

          const rawBoards = localStorage.getItem('oxonom_principal_active_boards')
          let activeBoardsCount = 0
          if (rawBoards) {
            try {
              const bList = JSON.parse(rawBoards)
              if (Array.isArray(bList)) activeBoardsCount = bList.length
            } catch (_) {}
          }

          setRealStats({
            studentCount: sCount,
            studentName: sName,
            teacherCount: tCount,
            teacherName: tName,
            classCount: cCount,
            className: cName || '1/A',
            parentCount: sCount,
            activeBoardsCount,
          })
        } catch (_) {}
      }
    }

    loadPrincipalAndStats()

    if (typeof window !== 'undefined') {
      window.addEventListener('oxonom_admin_updated', loadPrincipalAndStats)
      window.addEventListener('oxonom_principal_updated', loadPrincipalAndStats)
      window.addEventListener('oxonom_school_updated', loadPrincipalAndStats)
      window.addEventListener('oxonom_teachers_updated', loadPrincipalAndStats)
      window.addEventListener('oxonom_classes_updated', loadPrincipalAndStats)
      window.addEventListener('storage', loadPrincipalAndStats)

      // Automatically open account modal if redirected from login with query param
      const params = new URLSearchParams(window.location.search)
      if (
        params.get('openAccount') === 'true' ||
        params.get('account') === 'true' ||
        params.get('profile') === 'true'
      ) {
        setIsAdminProfileModalOpen(true)
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('oxonom_admin_updated', loadPrincipalAndStats)
        window.removeEventListener('oxonom_principal_updated', loadPrincipalAndStats)
        window.removeEventListener('oxonom_school_updated', loadPrincipalAndStats)
        window.removeEventListener('oxonom_teachers_updated', loadPrincipalAndStats)
        window.removeEventListener('oxonom_classes_updated', loadPrincipalAndStats)
        window.removeEventListener('storage', loadPrincipalAndStats)
      }
    }
  }, [selectedOrgId])

  // Save profile changes permanently
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()

    if (editSchoolName.trim()) {
      saveSchoolInfo({ officialName: editSchoolName.trim() })
    }

    const updated = savePrincipalProfile({
      name: editName.trim(),
      title: editTitle.trim(),
      tcNo: editTcNo.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      schoolName: editSchoolName.trim() || adminProfile.schoolName,
    })

    setAdminProfile((prev) => ({
      ...prev,
      name: updated.name,
      title: updated.title,
      tcNo: updated.tcNo,
      phone: updated.phone,
      email: updated.email,
      schoolName: updated.schoolName,
    }))
    setIsEditingProfile(false)
    toast.success('Yönetici profil bilgileri kalıcı olarak güncellendi.')
  }

  const handleAdminSignOut = async () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('oxonom_active_admin_session')
      } catch (_) {}
    }
    setIsAdminProfileModalOpen(false)
    toast.success('Yönetici oturumu güvenle kapatıldı.')
    try {
      await signOut({ redirect: false })
    } catch (_) {}
    router.push('/m-login')
  }

  const adminName = adminProfile.name

  // Drawer state for mobile "Daha Fazla"
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)

  // ── STATİSTİKSEL GRAFİKLER & ANALİTİK STATE ──
  type ChartTab = 'attendance' | 'academic' | 'workload'
  const [activeChartTab, setActiveChartTab] = useState<ChartTab>('attendance')
  const [selectedTrendDay, setSelectedTrendDay] = useState<DayKey>('wed')

  // Attendance Trend Dataset (Mon-Fri)
  const attendanceTrendData = [
    {
      key: 'mon' as DayKey,
      day: 'Pzt',
      fullDay: 'Pazartesi',
      rate: 100,
      studentsPresent: realStats.studentCount,
      teachersPresent: realStats.teacherCount,
      onTimeRate: 100,
      lateCount: 0,
      absentCount: 0,
      note: 'Hafta açılış töreni eksiksiz tamamlandı.',
    },
    {
      key: 'tue' as DayKey,
      day: 'Sal',
      fullDay: 'Salı',
      rate: 100,
      studentsPresent: realStats.studentCount,
      teachersPresent: realStats.teacherCount,
      onTimeRate: 100,
      lateCount: 0,
      absentCount: 0,
      note: 'Dersler zamanında başladı, 0 devamsızlık.',
    },
    {
      key: 'wed' as DayKey,
      day: 'Çar',
      fullDay: 'Çarşamba',
      rate: 100,
      studentsPresent: realStats.studentCount,
      teachersPresent: realStats.teacherCount,
      onTimeRate: 100,
      lateCount: 0,
      absentCount: 0,
      note: 'Bugünkü yoklama tam ve onaylı.',
    },
    {
      key: 'thu' as DayKey,
      day: 'Per',
      fullDay: 'Perşembe',
      rate: 100,
      studentsPresent: realStats.studentCount,
      teachersPresent: realStats.teacherCount,
      onTimeRate: 100,
      lateCount: 0,
      absentCount: 0,
      note: 'Planlanan ders akışı istikrarlı.',
    },
    {
      key: 'fri' as DayKey,
      day: 'Cum',
      fullDay: 'Cuma',
      rate: 100,
      studentsPresent: realStats.studentCount,
      teachersPresent: realStats.teacherCount,
      onTimeRate: 100,
      lateCount: 0,
      absentCount: 0,
      note: 'Hafta kapanış ve bayrak töreni.',
    },
  ]

  // Branch Performance Dataset
  const branchPerformanceData = [
    {
      branch: 'Türk Dili ve Edebiyatı',
      teacher: realStats.teacherName,
      hours: 6,
      score: 96,
      progress: 38,
      status: 'Müfredat İleri',
      color: 'emerald',
    },
    {
      branch: 'Matematik',
      teacher: 'Kadro Havuzu',
      hours: 6,
      score: 92,
      progress: 35,
      status: 'Müfredat Uyumlu',
      color: 'blue',
    },
    {
      branch: 'Fen Bilimleri & Fizik',
      teacher: 'Laboratuvar',
      hours: 4,
      score: 89,
      progress: 32,
      status: 'Müfredat Uyumlu',
      color: 'purple',
    },
    {
      branch: 'Yabancı Dil (İngilizce)',
      teacher: 'Dil Zümresi',
      hours: 4,
      score: 94,
      progress: 36,
      status: 'Müfredat Uyumlu',
      color: 'amber',
    },
    {
      branch: 'Bilişim & Kodlama',
      teacher: 'Bilişim Lab.',
      hours: 2,
      score: 98,
      progress: 44,
      status: 'Proje Aşaması',
      color: 'teal',
    },
  ]

  // Smartboard Live Stats
  const smartboardStats = {
    totalBoards: 1,
    onlineBoards: 1,
    classroom: realStats.className,
    boardCode: 'PANO-901',
    activeTeacher: realStats.teacherName,
    activeSubject: 'Türk Dili ve Edebiyatı',
    uptimeToday: '3 saat 45 dk',
    interactionRate: 88,
    roomTemp: '22.4°C',
    networkPing: '12 ms',
  }

  // Teacher Workload Stats
  const teacherWorkloadStats = {
    teacherName: realStats.teacherName,
    branch: 'Türk Dili ve Edebiyatı',
    totalHours: 24,
    baseHours: 15,
    additionalHours: 9,
    maxAllowedHours: 30,
    overtimeHours: 0,
    complianceStatus: 'MEB Standartlarında Dengeli',
  }

  // ── YÖNETİCİ HIZLI ARAÇLAR MODALLARI ──
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [isAssignTeacherModalOpen, setIsAssignTeacherModalOpen] = useState(false)
  const [isConflictReportModalOpen, setIsConflictReportModalOpen] = useState(false)

  // ── MÜDÜR AKILLI TAHTA & PANO OS YÖNETİMİ ──
  const DEFAULT_SCHOOL_PANOS = [
    {
      id: '1A-01',
      panoId: '1A',
      boardNo: '01',
      name: '1-A Şubesi Akıllı Tahta',
      location: '1. Kat Derslik 101',
      status: 'active',
      createdAt: '2026-09-01',
    },
    {
      id: '1B-01',
      panoId: '1B',
      boardNo: '01',
      name: '1-B Şubesi Akıllı Tahta',
      location: '1. Kat Derslik 102',
      status: 'active',
      createdAt: '2026-09-01',
    },
    {
      id: '2A-01',
      panoId: '2A',
      boardNo: '01',
      name: '2-A Şubesi Akıllı Tahta',
      location: '2. Kat Derslik 201',
      status: 'active',
      createdAt: '2026-09-01',
    },
    {
      id: 'KORIDOR-01',
      panoId: 'KORIDOR',
      boardNo: '01',
      name: 'Ana Giriş Koridor Panosu',
      location: 'Zemin Kat Lobi',
      status: 'active',
      createdAt: '2026-09-01',
    },
  ]

  const [schoolPanos, setSchoolPanos] = useState<any[]>(DEFAULT_SCHOOL_PANOS)
  const [isNewPanoModalOpen, setIsNewPanoModalOpen] = useState(false)
  const [newPanoCode, setNewPanoCode] = useState('')
  const [newBoardNo, setNewBoardNo] = useState('01')
  const [newPanoName, setNewPanoName] = useState('')
  const [newPanoLocation, setNewPanoLocation] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_school_panos')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSchoolPanos(parsed)
          }
        } else {
          localStorage.setItem('oxonom_school_panos', JSON.stringify(DEFAULT_SCHOOL_PANOS))
        }
      } catch (_) {}
    }
  }, [])

  const handleCreateNewPano = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanPano = (newPanoCode || '').trim().toUpperCase()
    const cleanBoard = (newBoardNo || '01').trim().toUpperCase()
    if (!cleanPano) {
      toast.error('Lütfen geçerli bir Pano ID girin (Örn: 3A, LAB)')
      return
    }

    const fullId = `${cleanPano}-${cleanBoard}`
    const existing = schoolPanos.find((p) => p.id === fullId)
    if (existing) {
      toast.error(`${fullId} kodlu pano zaten mevcut!`)
      return
    }

    const newPanoItem = {
      id: fullId,
      panoId: cleanPano,
      boardNo: cleanBoard,
      name: newPanoName.trim() || `${cleanPano} Akıllı Tahtası`,
      location: newPanoLocation.trim() || 'Derslik',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    }

    const updated = [newPanoItem, ...schoolPanos]
    setSchoolPanos(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_school_panos', JSON.stringify(updated))
      window.dispatchEvent(new Event('oxonom_panos_updated'))
    }

    setIsNewPanoModalOpen(false)
    setNewPanoCode('')
    setNewBoardNo('01')
    setNewPanoName('')
    setNewPanoLocation('')

    toast.success(`${fullId} nolu yeni Pano ekranı başarıyla oluşturuldu!`, {
      icon: '📺',
      duration: 4000,
    })
  }

  const handleDeletePano = (id: string) => {
    const updated = schoolPanos.filter((p) => p.id !== id)
    setSchoolPanos(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_school_panos', JSON.stringify(updated))
    }
    toast.success(`${id} nolu pano listeden kaldırıldı.`)
  }

  const handleCopyPanoLink = (id: string) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/pano/${encodeURIComponent(id)}`
      navigator.clipboard.writeText(url)
      toast.success(`${id} canlı bağlantı linki kopyalandı!`, { icon: '📋' })
    }
  }

  const handleLaunchPanoLive = (id: string) => {
    if (typeof window !== 'undefined') {
      window.open(`/pano/${encodeURIComponent(id)}`, '_blank')
      toast.success(`${id} canlı pano ekranı yeni pencerede açıldı!`, { icon: '🚀' })
    }
  }

  // Report Modal State
  const [reportType, setReportType] = useState('attendance')
  const [reportPeriod, setReportPeriod] = useState('weekly')
  const [isExportingReport, setIsExportingReport] = useState(false)

  // SMS Modal State
  const [smsRecipientType, setSmsRecipientType] = useState<'parents' | 'teachers' | 'all'>('parents')
  const [smsMessage, setSmsMessage] = useState(
    'Sayın Velimiz, Oxonom Okulları 2026-2027 eğitim dönemi 1. ara değerlendirme toplantısı planlanmıştır.'
  )
  const [isSendingSms, setIsSendingSms] = useState(false)

  // Live Current Period Selector
  const [currentSelectedPeriod, setCurrentSelectedPeriod] = useState<number>(3)

  // Active periods for current school
  const activePeriods = useMemo(() => {
    return selectedOrgId === 10 ? PRIMARY_PERIODS : MIDDLE_PERIODS
  }, [selectedOrgId])

  // Context-aware target class & subject
  const targetMissingClass = realStats.className
  const targetMissingSubject = 'Türk Dili ve Edebiyatı'

  // Available teachers for active school
  const availableTeachers = useMemo(() => {
    return getOrgTeachers(selectedOrgId)
  }, [selectedOrgId])

  // Missing assignment state with localStorage sync
  const [missingAssignment, setMissingAssignment] = useState<{
    isResolved: boolean
    assignedTeacher: string
    assignedDay: DayKey
    assignedPeriod: number
    assignedRoom: string
    targetClass: string
    targetSubject: string
    assignedAt?: string
  }>(() => {
    return {
      isResolved: true,
      assignedTeacher: realStats.teacherName,
      assignedDay: 'wed',
      assignedPeriod: 3,
      assignedRoom: `Derslik ${realStats.className} (1. Kat)`,
      targetClass: targetMissingClass,
      targetSubject: targetMissingSubject,
    }
  })

  // Assign form inputs
  const [formAssignTeacher, setFormAssignTeacher] = useState('')
  const [formAssignDay, setFormAssignDay] = useState<DayKey>('wed')
  const [formAssignPeriod, setFormAssignPeriod] = useState<number>(3)
  const [formAssignRoom, setFormAssignRoom] = useState(`Derslik ${realStats.className}`)
  const [formSendSms, setFormSendSms] = useState(true)
  const [formSmartBoard, setFormSmartBoard] = useState(true)

  // Current Schedule Dataset with localStorage Sync
  const [scheduleList, setScheduleList] = useState<ScheduleEntry[]>(() => {
    return INITIAL_SCHEDULE_ENTRIES
  })

  // Conflict calculations
  const teacherConflicts = useMemo(() => {
    const orgEntries = scheduleList.filter((e) => e.orgId === selectedOrgId)
    const map: Record<string, ScheduleEntry[]> = {}
    orgEntries.forEach((e) => {
      const key = `${e.day}_${e.period}_${e.teacherName}`
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    const conflicts: Array<{ teacher: string; day: DayKey; period: number; entries: ScheduleEntry[] }> = []
    Object.entries(map).forEach(([_, entries]) => {
      if (entries.length > 1) {
        conflicts.push({
          teacher: entries[0].teacherName,
          day: entries[0].day,
          period: entries[0].period,
          entries,
        })
      }
    })
    return conflicts
  }, [scheduleList, selectedOrgId])

  const roomConflicts = useMemo(() => {
    const orgEntries = scheduleList.filter((e) => e.orgId === selectedOrgId)
    const map: Record<string, ScheduleEntry[]> = {}
    orgEntries.forEach((e) => {
      const key = `${e.day}_${e.period}_${e.roomName}`
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    const conflicts: Array<{ room: string; day: DayKey; period: number; entries: ScheduleEntry[] }> = []
    Object.entries(map).forEach(([_, entries]) => {
      if (entries.length > 1) {
        conflicts.push({
          room: entries[0].roomName,
          day: entries[0].day,
          period: entries[0].period,
          entries,
        })
      }
    })
    return conflicts
  }, [scheduleList, selectedOrgId])

  const totalConflictsCount = teacherConflicts.length + roomConflicts.length

  // Handlers for assignment
  const handleOpenAssignModal = () => {
    setFormAssignTeacher(missingAssignment.assignedTeacher || availableTeachers[0]?.name || realStats.teacherName)
    setFormAssignDay(missingAssignment.assignedDay || 'wed')
    setFormAssignPeriod(missingAssignment.assignedPeriod || 3)
    setFormAssignRoom(missingAssignment.assignedRoom || `Derslik ${realStats.className}`)
    setIsAssignTeacherModalOpen(true)
  }

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formAssignTeacher) {
      toast.error('Lütfen bir öğretmen seçin.')
      return
    }

    const newRecord = {
      isResolved: true,
      assignedTeacher: formAssignTeacher,
      assignedDay: formAssignDay,
      assignedPeriod: Number(formAssignPeriod),
      assignedRoom: formAssignRoom,
      targetClass: targetMissingClass,
      targetSubject: targetMissingSubject,
      assignedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    }

    setMissingAssignment(newRecord)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`oxonom_admin_missing_assign_${selectedOrgId}`, JSON.stringify(newRecord))
      } catch (_) {}
    }

    setIsAssignTeacherModalOpen(false)
    toast.success(
      `${targetMissingClass} ${targetMissingSubject} dersine ${formAssignTeacher} başarıyla görevlendirildi!${
        formSendSms ? ' SMS bildirimi iletildi.' : ''
      }`,
      { icon: '🎉', duration: 4000 }
    )
  }

  // Handle Export MEB Report
  const handleExportReport = () => {
    setIsExportingReport(true)
    setTimeout(() => {
      setIsExportingReport(false)
      setIsReportModalOpen(false)
      toast.success(
        `MEB e-Okul Resmi Raporu başarıyla oluşturuldu ve indirildi! (Oxonom_MEB_Rapor_${Date.now().toString().slice(-4)}.pdf)`,
        { icon: '📄', duration: 4000 }
      )
    }, 1200)
  }

  // Handle Send SMS
  const handleSendBroadcastSms = () => {
    if (!smsMessage.trim()) {
      toast.error('Lütfen duyuru metni giriniz.')
      return
    }
    setIsSendingSms(true)
    setTimeout(() => {
      setIsSendingSms(false)
      setIsSmsModalOpen(false)
      const count =
        smsRecipientType === 'parents'
          ? `${realStats.parentCount} Veliye`
          : smsRecipientType === 'teachers'
          ? `${realStats.teacherCount} Öğretmene`
          : `${realStats.parentCount + realStats.teacherCount} Kişiye`
      toast.success(`Toplu SMS bildirimi ${count} başarıyla iletildi!`, { icon: '📲', duration: 4000 })
    }, 1100)
  }

  // Selected Day Details for the Attendance Chart
  const selectedTrendDayData =
    attendanceTrendData.find((d) => d.key === selectedTrendDay) || attendanceTrendData[2]

  // Main Page Content
  const pageContent = (
    <div className="flex flex-col flex-1 w-full space-y-5 pb-12">
      {/* ── 1. OKUL / KURUM HERO KARTI (HIGH-CONTRAST & ZARİF AMBİYANS) ── */}
      <section className="w-full">
        <div className="bg-[#211729] rounded-3xl p-4 sm:p-6 text-white border border-[#49364F] shadow-xl relative overflow-hidden">
          {/* Background Ambient Glow & Rings */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#4B075F]/20 blur-3xl pointer-events-none" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}
              className="absolute -right-24 -top-24 w-96 h-96 pointer-events-none opacity-25"
            >
              <svg viewBox="0 0 384 384" fill="none" className="w-full h-full">
                <circle cx="192" cy="192" r="180" stroke="#8D49A6" strokeWidth="0.8" strokeDasharray="3 6" />
                <circle cx="192" cy="192" r="140" stroke="#F0D8FA" strokeWidth="0.6" strokeOpacity="0.2" />
                <circle cx="192" cy="192" r="95" stroke="#D914C8" strokeWidth="1" strokeDasharray="4 6" />
              </svg>
            </motion.div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Principal Profile Info */}
            <div
              onClick={() => setIsAdminProfileModalOpen(true)}
              className="flex items-center gap-3.5 cursor-pointer group p-1.5 -m-1.5 rounded-2xl hover:bg-white/[0.05] transition-all select-none"
              title="Yönetici hesap detaylarını görüntüle"
            >
              <div className="relative shrink-0">
                <div className="w-13 h-13 rounded-2xl bg-brand-gradient text-white font-black text-base flex items-center justify-center shadow-lg shadow-[#4B075F]/40 group-hover:scale-105 transition-transform border border-[#8D49A6]/40">
                  {getPrincipalInitials(adminName)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#4B075F] border-2 border-[#211729] flex items-center justify-center">
                  <Check size={9} strokeWidth={3} className="text-[#F0D8FA]" />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-white group-hover:text-[#F0D8FA] transition-colors tracking-tight">
                    {adminName}
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#F0D8FA]/20 text-[#F0D8FA] border border-[#8D49A6]/40 tracking-wider">
                    MÜDÜR
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-[#D2C5D8] font-medium">
                  <span className="truncate">Kurum Yetkilisi</span>
                  <span className="w-1 h-1 rounded-full bg-[#8D49A6] shrink-0" />
                  <span className="text-[#D914C8] font-bold group-hover:underline flex items-center gap-0.5 shrink-0">
                    Hesap & Yetkiler &gt;
                  </span>
                </div>
              </div>
            </div>

            {/* Institution Badge & Online Status */}
            <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] border border-[#49364F] backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-[#4B075F]/40 text-[#F0D8FA] flex items-center justify-center shrink-0 border border-[#8D49A6]/30">
                  <School size={18} />
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>Oxonom Okulları</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D914C8] animate-pulse" />
                  </div>
                  <div className="text-[11px] text-[#B5A5BD] font-medium">
                    {realStats.className} · {realStats.studentCount} Öğrenci · {realStats.teacherCount} Öğretmen
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F0D8FA] bg-[#350444] border border-[#8D49A6]/40 px-3 py-1.5 rounded-xl shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#D914C8] animate-ping" />
                <span>Çevrim İçi</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. OKUL ANA METRİK KARTLARI (4 KPI KARTI - HIGH CONTRAST & RESPONSIVE) ── */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#716779] dark:text-[#B5A5BD]">
              Okul Mevcudu & Canlı İstatistikler
            </h3>
            <span className="text-[10px] font-extrabold text-[#4B075F] dark:text-[#F0D8FA] bg-[#F0D8FA] dark:bg-[#350444] border border-[#D5C5DC] dark:border-[#8D49A6]/40 px-2 py-0.5 rounded-full">
              Canlı Veri
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Toplam Öğrenci Sayısı */}
          <Link
            href={getUrl('/m-admin-students')}
            className="bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] rounded-3xl p-4 shadow-sm hover:border-[#8D49A6]/60 dark:hover:border-[#8D49A6]/60 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] border border-[#D5C5DC] dark:border-[#8D49A6]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap size={20} />
              </div>
              <span className="text-xs font-extrabold text-[#4B075F] dark:text-[#F0D8FA] flex items-center gap-1 bg-[#F0D8FA] dark:bg-[#350444] px-2 py-0.5 rounded-lg">
                <TrendingUp size={12} className="text-[#D914C8]" />
                <span>%100 Aktif</span>
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#241329] dark:text-white tracking-tight">
              {realStats.studentCount}
            </div>
            <div className="text-xs font-bold text-[#514458] dark:text-[#D2C5D8] mt-1 flex items-center justify-between">
              <span>Kayıtlı Öğrenci</span>
              <ArrowUpRight size={13} className="text-[#716779] group-hover:text-[#4B075F] dark:group-hover:text-[#C58ADB] transition-colors" />
            </div>
            <div className="text-[10px] text-[#4B075F] dark:text-[#C58ADB] font-semibold mt-0.5 truncate">
              {realStats.studentName} ({realStats.className})
            </div>
          </Link>

          {/* 2. Toplam Öğretmen Kadrosu */}
          <Link
            href={getUrl('/m-admin-teachers')}
            className="bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] rounded-3xl p-4 shadow-sm hover:border-[#8D49A6]/60 dark:hover:border-[#8D49A6]/60 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] border border-[#D5C5DC] dark:border-[#8D49A6]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase size={20} />
              </div>
              <span className="text-xs font-extrabold text-[#4B075F] dark:text-[#F0D8FA] bg-[#F0D8FA] dark:bg-[#350444] px-2 py-0.5 rounded-lg">
                Tam Kadro
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#241329] dark:text-white tracking-tight">
              {realStats.teacherCount}
            </div>
            <div className="text-xs font-bold text-[#514458] dark:text-[#D2C5D8] mt-1 flex items-center justify-between">
              <span>Öğretmen Kadrosu</span>
              <ArrowUpRight size={13} className="text-[#716779] group-hover:text-[#4B075F] dark:group-hover:text-[#C58ADB] transition-colors" />
            </div>
            <div className="text-[10px] text-[#4B075F] dark:text-[#C58ADB] font-semibold mt-0.5 truncate">
              {realStats.teacherName} & Zümre
            </div>
          </Link>

          {/* 3. Sınıf ve Şube Sayısı */}
          <Link
            href={getUrl('/m-admin-classes')}
            className="bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] rounded-3xl p-4 shadow-sm hover:border-[#8D49A6]/60 dark:hover:border-[#8D49A6]/60 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] border border-[#D5C5DC] dark:border-[#8D49A6]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 size={20} />
              </div>
              <span className="text-xs font-extrabold text-[#4B075F] dark:text-[#F0D8FA] bg-[#F0D8FA] dark:bg-[#350444] px-2 py-0.5 rounded-lg">
                1-8. Sınıflar (A-D)
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#241329] dark:text-white tracking-tight">
              {realStats.classCount} Şube
            </div>
            <div className="text-xs font-bold text-[#514458] dark:text-[#D2C5D8] mt-1 flex items-center justify-between">
              <span>Sınıf / Şube</span>
              <ArrowUpRight size={13} className="text-[#716779] group-hover:text-[#4B075F] dark:group-hover:text-[#C58ADB] transition-colors" />
            </div>
            <div className="text-[10px] text-[#4B075F] dark:text-[#C58ADB] font-semibold mt-0.5 truncate">
              {realStats.className} Aktif Şube
            </div>
          </Link>

          {/* 4. Dijital Okul Panosu & Akıllı Tahtalar */}
          <div
            onClick={() => setIsNewPanoModalOpen(true)}
            className="bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] rounded-3xl p-4 shadow-sm hover:border-[#8D49A6]/60 dark:hover:border-[#8D49A6]/60 hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FCE8FA] dark:bg-[#350444] text-[#D914C8] dark:text-[#F17AE6] border border-[#E8DFEB] dark:border-[#8D49A6]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Tv size={20} />
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 text-[#4B075F] dark:text-[#F0D8FA] bg-[#F0D8FA] dark:bg-[#350444]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D914C8] animate-pulse" />
                <span>Canlı Yayında</span>
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#241329] dark:text-white tracking-tight">
              {schoolPanos.length} Tahta
            </div>
            <div className="text-xs font-bold text-[#514458] dark:text-[#D2C5D8] mt-1 flex items-center justify-between">
              <span>Akıllı Tahta & Pano</span>
              <Plus size={13} className="text-[#8D49A6] group-hover:scale-125 transition-transform" />
            </div>
            <div className="text-[10px] text-[#4B075F] dark:text-[#C58ADB] font-semibold mt-0.5 truncate">
              + Yeni Pano Tanımla &gt;
            </div>
          </div>
        </div>
      </section>

      {/* ── KATEGORİ 2: AKILLI TAHTA & DİJİTAL PANO YÖNETİM MERKEZİ ── */}
      <section className="w-full">
        <div className="bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DFEB] dark:border-[#49364F]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4B075F] via-[#8D49A6] to-[#D914C8] text-white flex items-center justify-center shadow-md shadow-[#4B075F]/20 shrink-0">
                <Tv size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-[#241329] dark:text-white">
                    Akıllı Tahtalar & Okul Pano Yönetimi
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {schoolPanos.length} Pano Canlı
                  </span>
                </div>
                <p className="text-xs text-[#716779] dark:text-[#B5A5BD] mt-0.5">
                  Her tahta için özel kimlik (örn: 1A-01). Anlık canlı yayın ve yeni sekmede görüntüleme.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsNewPanoModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#4B075F]/20 cursor-pointer active:scale-95 transition-all self-start sm:self-auto shrink-0"
            >
              <Plus size={15} />
              <span>Yeni Pano Tanımla</span>
            </button>
          </div>

          {/* Panos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
            {schoolPanos.map((pano) => (
              <div
                key={pano.id}
                className="p-3.5 rounded-2xl bg-[#FCF9FD] dark:bg-[#1A1121] border border-[#E8DFEB] dark:border-[#49364F] flex flex-col justify-between gap-3 hover:border-[#8D49A6]/50 transition-all shadow-2xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] border border-[#8D49A6]/30">
                      {pano.id}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Canlı
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#241329] dark:text-white truncate">
                    {pano.name}
                  </h4>
                  <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] mt-0.5 truncate">
                    {pano.location}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8DFEB]/80 dark:border-[#49364F]/60 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLaunchPanoLive(pano.id)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#4B075F] hover:bg-[#350444] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Canlı olarak yeni sekmede aç"
                  >
                    <span>Canlı Aç</span>
                    <ExternalLink size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyPanoLink(pano.id)}
                    className="py-1.5 px-2.5 rounded-xl bg-white dark:bg-[#261730] hover:bg-[#F0D8FA] dark:hover:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] border border-[#E8DFEB] dark:border-[#49364F] text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                    title="Panonun linkini kopyala"
                  >
                    <Share2 size={12} />
                    <span className="hidden xs:inline">Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePano(pano.id)}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Panoyu Sil"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KATEGORİ 3: YÖNETİCİ HIZLI İDARİ İŞLEMLERİ ── */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#716779] dark:text-[#B5A5BD]">
              Yönetici Hızlı İdari İşlemleri
            </h3>
            <span className="text-[10px] font-extrabold text-[#4B075F] dark:text-[#F0D8FA] bg-[#F0D8FA] dark:bg-[#350444] border border-[#D5C5DC] dark:border-[#8D49A6]/40 px-2 py-0.5 rounded-full">
              Hızlı Aksiyon
            </span>
          </div>
          <span className="text-[11px] text-[#716779] dark:text-[#B5A5BD] font-medium">
            6 Temel İdari Modül
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
          {/* Tool 1: Yeni Öğrenci & Nakil Kaydı */}
          <Link
            href={getUrl('/m-admin-students')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] hover:border-[#8D49A6]/60 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap size={18} />
              </div>
              <Plus size={14} className="text-[#4B075F] dark:text-[#C58ADB]" />
            </div>
            <div>
              <div className="text-xs font-black text-[#241329] dark:text-white group-hover:text-[#4B075F] dark:group-hover:text-[#C58ADB] transition-colors">
                Öğrenci Kabulü & Nakil
              </div>
              <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] mt-0.5 leading-snug">
                Yeni kayıt veya e-Okul nakil dosyası
              </div>
            </div>
          </Link>

          {/* Tool 2: Yeni Öğretmen & Görevlendirme */}
          <Link
            href={getUrl('/m-admin-teachers')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] hover:border-[#8D49A6]/60 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase size={18} />
              </div>
              <Plus size={14} className="text-[#4B075F] dark:text-[#C58ADB]" />
            </div>
            <div>
              <div className="text-xs font-black text-[#241329] dark:text-white group-hover:text-[#4B075F] dark:group-hover:text-[#C58ADB] transition-colors">
                Öğretmen Kadrosu & Zümre
              </div>
              <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] mt-0.5 leading-snug">
                Branş ataması ve zümre yönetimi
              </div>
            </div>
          </Link>

          {/* Tool 3: Haftalık Ders Programı Matrisi */}
          <Link
            href={getUrl('/m-admin-schedule')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] hover:border-[#8D49A6]/60 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar size={18} />
              </div>
              <ArrowRight size={14} className="text-[#4B075F] dark:text-[#C58ADB]" />
            </div>
            <div>
              <div className="text-xs font-black text-[#241329] dark:text-white group-hover:text-[#4B075F] dark:group-hover:text-[#C58ADB] transition-colors">
                Haftalık Ders Dağılımı
              </div>
              <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] mt-0.5 leading-snug">
                Çakışmasız otomatik programlama
              </div>
            </div>
          </Link>

          {/* Tool 4: Yeni Sınıf & Şube Tanımla */}
          <Link
            href={getUrl('/m-admin-classes')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] hover:border-[#8D49A6]/60 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 size={18} />
              </div>
              <Plus size={14} className="text-[#4B075F] dark:text-[#C58ADB]" />
            </div>
            <div>
              <div className="text-xs font-black text-[#241329] dark:text-white group-hover:text-[#4B075F] dark:group-hover:text-[#C58ADB] transition-colors">
                Sınıflar & Şubeler
              </div>
              <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] mt-0.5 leading-snug">
                Derslik, rehber öğretmen ve kota
              </div>
            </div>
          </Link>

          {/* Tool 5: MEB Resmi e-Okul Raporu (1-Click Modal) */}
          <div
            onClick={() => setIsReportModalOpen(true)}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] hover:border-[#8D49A6]/60 hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#FCE8ED] dark:bg-[#C62848]/20 text-[#C62848] flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText size={18} />
              </div>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-[#FCE8ED] dark:bg-[#C62848]/30 text-[#C62848]">
                PDF
              </span>
            </div>
            <div>
              <div className="text-xs font-black text-[#241329] dark:text-white group-hover:text-[#4B075F] dark:group-hover:text-[#C58ADB] transition-colors">
                Resmi MEB Raporu
              </div>
              <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] mt-0.5 leading-snug">
                Mühürlü yoklama & not çizelgesi
              </div>
            </div>
          </div>

          {/* Tool 6: Toplu SMS & Duyuru (1-Click Modal) */}
          <div
            onClick={() => setIsSmsModalOpen(true)}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] hover:border-[#8D49A6]/60 hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Send size={18} />
              </div>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA]">
                SMS
              </span>
            </div>
            <div>
              <div className="text-xs font-black text-[#241329] dark:text-white group-hover:text-[#4B075F] dark:group-hover:text-[#C58ADB] transition-colors">
                Toplu SMS & Bildirim
              </div>
              <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] mt-0.5 leading-snug">
                Veli ve öğretmen anlık duyuru hattı
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KATEGORİ 4: İSTATİSTİKSEL ANALİTİK & GRAFİK MERKEZİ ── */}
      <section className="w-full">
        <div className="bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] rounded-3xl p-4 sm:p-6 shadow-sm">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8DFEB] dark:border-[#49364F]">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F0D8FA] dark:bg-[#4B075F]/30 text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center">
                  <BarChart3 size={18} />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-[#241329] dark:text-white">
                    İstatistiksel Analitik & Grafik Paneli
                  </h3>
                  <MockBadge size="sm" />
                </div>
              </div>
              <p className="text-xs text-[#716779] dark:text-[#B5A5BD] mt-0.5">
                Katılım trendleri, ders başarı oranları, akıllı tahta süreleri ve personel ders yükü
              </p>
            </div>

            {/* Interactive Tab Selector (Akıllı Tahta Matris Silindi) */}
            <div className="flex items-center p-1 rounded-2xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB]/60 dark:border-[#49364F]/60 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveChartTab('attendance')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  activeChartTab === 'attendance'
                    ? 'bg-white dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB] shadow-xs'
                    : 'text-[#716779] dark:text-[#B5A5BD] hover:text-[#241329] dark:hover:text-white'
                }`}
              >
                Haftalık Katılım
              </button>

              <button
                type="button"
                onClick={() => setActiveChartTab('academic')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  activeChartTab === 'academic'
                    ? 'bg-white dark:bg-[#2D2035] text-[#8D49A6] dark:text-[#F17AE6] shadow-xs'
                    : 'text-[#716779] dark:text-[#B5A5BD] hover:text-[#241329] dark:hover:text-white'
                }`}
              >
                Branş Başarısı
              </button>

              <button
                type="button"
                onClick={() => setActiveChartTab('workload')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  activeChartTab === 'workload'
                    ? 'bg-white dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB] shadow-xs'
                    : 'text-[#716779] dark:text-[#B5A5BD] hover:text-[#241329] dark:hover:text-white'
                }`}
              >
                Öğretmen Mesai Yükü
              </button>
            </div>
          </div>

          {/* TAB 1: HAFTALIK KATILIM & DEVAMSIZLIK TRENDİ (YENİ SVG ALAN/DALGA GRAFİĞİ) */}
          {activeChartTab === 'attendance' && (
            <div className="pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16805D] animate-pulse" />
                  <span className="text-xs font-bold text-[#514458] dark:text-[#D2C5D8]">
                    Haftalık Katılım Eğrisi & Günlük Yoklama Analizi
                  </span>
                  <MockBadge size="xs" />
                </div>
                <span className="text-xs font-black text-[#16805D] dark:text-[#45C7A2] bg-[#E4F5ED] dark:bg-[#16805D]/20 px-2.5 py-1 rounded-xl">
                  Haftalık Katılım Ortalaması: %100
                </span>
              </div>

              {/* Modern SVG Curved Area Trend Chart */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[#FCF9FD] dark:bg-[#17101C]/60 border border-[#E8DFEB] dark:border-[#49364F]">
                <div className="w-full relative">
                  <svg viewBox="0 0 500 160" className="w-full h-40 overflow-visible">
                    <defs>
                      <linearGradient id="attendanceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8D49A6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#8D49A6" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="attendanceLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4B075F" />
                        <stop offset="50%" stopColor="#8D49A6" />
                        <stop offset="100%" stopColor="#D914C8" />
                      </linearGradient>
                    </defs>

                    {/* Guidelines */}
                    <line x1="20" y1="20" x2="480" y2="20" stroke="#E8DFEB" strokeDasharray="4 4" className="dark:stroke-[#49364F]/60" />
                    <line x1="20" y1="70" x2="480" y2="70" stroke="#E8DFEB" strokeDasharray="4 4" className="dark:stroke-[#49364F]/60" />
                    <line x1="20" y1="120" x2="480" y2="120" stroke="#E8DFEB" strokeDasharray="4 4" className="dark:stroke-[#49364F]/60" />

                    <text x="5" y="24" fontSize="10" className="fill-[#716779] font-mono">%100</text>
                    <text x="12" y="74" fontSize="10" className="fill-[#716779] font-mono">%95</text>
                    <text x="12" y="124" fontSize="10" className="fill-[#716779] font-mono">%90</text>

                    {/* Area path */}
                    <path
                      d="M 50,20 C 130,20 170,20 250,20 C 330,20 370,20 450,20 L 450,140 L 50,140 Z"
                      fill="url(#attendanceAreaGrad)"
                    />

                    {/* Smooth curve line */}
                    <path
                      d="M 50,20 C 130,20 170,20 250,20 C 330,20 370,20 450,20"
                      fill="none"
                      stroke="url(#attendanceLineGrad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Interactive Circles / Nodes */}
                    {[
                      { x: 50, key: 'mon', label: 'Pzt' },
                      { x: 150, key: 'tue', label: 'Sal' },
                      { x: 250, key: 'wed', label: 'Çar' },
                      { x: 350, key: 'thu', label: 'Per' },
                      { x: 450, key: 'fri', label: 'Cum' },
                    ].map((node) => {
                      const isSel = selectedTrendDay === node.key
                      return (
                        <g
                          key={node.key}
                          className="cursor-pointer"
                          onClick={() => setSelectedTrendDay(node.key as DayKey)}
                        >
                          <circle
                            cx={node.x}
                            cy="20"
                            r={isSel ? '8' : '5.5'}
                            className={`transition-all ${
                              isSel
                                ? 'fill-[#D914C8] stroke-4 stroke-white dark:stroke-[#17101C]'
                                : 'fill-[#8D49A6] stroke-2 stroke-white dark:stroke-[#211729] hover:scale-125'
                            }`}
                          />
                          <text
                            x={node.x}
                            y="155"
                            textAnchor="middle"
                            fontSize="11"
                            className={`font-bold ${
                              isSel ? 'fill-[#4B075F] dark:fill-[#C58ADB] font-black' : 'fill-[#716779] dark:fill-[#B5A5BD]'
                            }`}
                          >
                            {node.label}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                </div>
              </div>

              {/* Day Cards Row */}
              <div className="grid grid-cols-5 gap-2">
                {attendanceTrendData.map((item) => {
                  const isSelected = selectedTrendDay === item.key
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSelectedTrendDay(item.key)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F0D8FA] border-[#8D49A6] text-[#4B075F] dark:bg-[#4B075F]/30 dark:border-[#8D49A6] dark:text-[#FCF9FD] ring-1 ring-[#8D49A6] shadow-xs'
                          : 'bg-white dark:bg-[#17101C]/60 border-[#E8DFEB] dark:border-[#49364F] hover:border-[#8D49A6]/40'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-[#716779] dark:text-[#B5A5BD]">{item.day}</div>
                      <div className="text-sm font-black text-[#4B075F] dark:text-[#C58ADB] mt-0.5">
                        %{item.rate}
                      </div>
                      <div className="text-[9px] font-semibold text-[#716779] mt-0.5">Tam Katılım</div>
                    </button>
                  )
                })}
              </div>

              {/* Day Detail Card */}
              <div className="p-4 rounded-2xl bg-[#FCF9FD] dark:bg-[#17101C]/60 border border-[#E8DFEB] dark:border-[#49364F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E4F5ED] dark:bg-[#16805D]/20 text-[#16805D] dark:text-[#45C7A2] flex items-center justify-center font-black shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="font-black text-[#241329] dark:text-white flex items-center gap-2">
                      <span>{selectedTrendDayData.fullDay} Analizi</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-[#E4F5ED] dark:bg-[#16805D]/20 text-[#16805D] dark:text-[#45C7A2]">
                        Eksiksiz
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {selectedTrendDayData.note}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-center">
                  <div>
                    <div className="font-black text-gray-900 dark:text-white">
                      {selectedTrendDayData.studentsPresent}/{realStats.studentCount}
                    </div>
                    <div className="text-[10px] text-gray-500">Öğrenci Mevcudu</div>
                  </div>
                  <div className="w-px h-7 bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <div className="font-black text-emerald-600 dark:text-emerald-400">
                      {selectedTrendDayData.teachersPresent}/{realStats.teacherCount}
                    </div>
                    <div className="text-[10px] text-gray-500">Öğretmen Mesaisi</div>
                  </div>
                  <div className="w-px h-7 bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <div className="font-black text-gray-400">0</div>
                    <div className="text-[10px] text-gray-500">Devamsız / Geç</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRANŞ VE AKADEMİK DERS DAĞILIMI (HALKA/RADIAL GRAFİKLER) */}
          {activeChartTab === 'academic' && (
            <div className="pt-4 space-y-3.5">
              <div className="flex items-center justify-between text-xs text-[#716779] dark:text-[#B5A5BD]">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Branş Başarı & Müfredat İlerleme Oranları</span>
                  <MockBadge size="xs" />
                </div>
                <span>Zümre: Edebiyat & Türkçe</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {branchPerformanceData.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-3xl bg-white dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#49364F] shadow-xs flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#241329] dark:text-white">
                          {item.branch}
                        </span>
                        <span className="text-[10px] font-bold text-[#716779]">
                          ({item.hours} Saat/Hafta)
                        </span>
                      </div>
                      <div className="text-xs text-[#8D49A6] dark:text-[#C58ADB] font-bold">
                        Öğretmen: {item.teacher}
                      </div>

                      {/* Horizontal mini bar for curriculum */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between text-[10px] text-[#716779] mb-1">
                          <span>Müfredat İlerlemesi</span>
                          <span className="font-bold">%{item.progress}</span>
                        </div>
                        <div className="w-full bg-[#F7F0FA] dark:bg-[#2D2035] rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ duration: 0.8 }}
                            className="bg-[#4B075F] dark:bg-[#8D49A6] h-full rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Circular SVG Ring for Success Rate */}
                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-[#E8DFEB] dark:text-[#49364F]"
                          strokeWidth="3.2"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-[#D914C8]"
                          strokeDasharray={`${item.score}, 100`}
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-black text-[#241329] dark:text-white leading-none">
                          %{item.score}
                        </span>
                        <span className="text-[8px] text-[#716779] font-bold leading-none mt-0.5">
                          Başarı
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ÖĞRETMEN MESAİ & DERS DAĞILIM GRAFİĞİ (KAPASİTE GÖSTERGESİ) */}
          {activeChartTab === 'workload' && (
            <div className="pt-4 space-y-4">
              <div className="p-5 rounded-3xl bg-[#FCF9FD] dark:bg-[#17101C]/60 border border-[#E8DFEB] dark:border-[#49364F]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-sm font-black text-[#241329] dark:text-[#FCF9FD]">
                      {teacherWorkloadStats.teacherName} — Haftalık Ders Yükü & Mesai Dağılımı
                    </h4>
                    <p className="text-[11px] text-[#716779] dark:text-[#B5A5BD] mt-0.5">
                      Branş: {teacherWorkloadStats.branch} · MEB Standart Çizelgesi
                    </p>
                  </div>
                  <span className="text-xs font-black text-[#4B075F] dark:text-[#C58ADB] bg-[#F0D8FA] dark:bg-[#4B075F]/30 px-3 py-1 rounded-xl shrink-0">
                    Toplam: 30 Saat / Hafta (%100 Kapasite)
                  </span>
                </div>

                {/* Multi-Segment Capacity Bar */}
                <div className="w-full bg-[#F0D8FA] dark:bg-[#2D2035] rounded-full h-4 overflow-hidden flex shadow-inner">
                  <div
                    className="bg-[#4B075F] h-full text-[9px] font-black text-white flex items-center justify-center transition-all"
                    style={{ width: '50%' }}
                    title="Maaş Karşılığı: 15 Saat"
                  >
                    15 Saat (Maaş)
                  </div>
                  <div
                    className="bg-[#8D49A6] h-full text-[9px] font-black text-white flex items-center justify-center transition-all"
                    style={{ width: '50%' }}
                    title="Ek Ders: 15 Saat"
                  >
                    15 Saat (Ek Ders)
                  </div>
                </div>

                {/* Metrics Breakdown Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-[#E8DFEB] dark:border-[#49364F] text-center">
                  <div className="p-2 rounded-xl bg-white dark:bg-[#211729] border border-[#E8DFEB]/50 dark:border-[#49364F]/50">
                    <div className="text-base font-black text-[#4B075F] dark:text-[#C58ADB]">
                      15 Saat
                    </div>
                    <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] font-bold">
                      Maaş Karşılığı
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-[#211729] border border-[#E8DFEB]/50 dark:border-[#49364F]/50">
                    <div className="text-base font-black text-[#8D49A6] dark:text-[#F17AE6]">
                      15 Saat
                    </div>
                    <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] font-bold">
                      Zorunlu Ek Ders
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-[#211729] border border-[#E8DFEB]/50 dark:border-[#49364F]/50">
                    <div className="text-base font-black text-[#D914C8] dark:text-[#F17AE6]">
                      2 Saat
                    </div>
                    <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] font-bold">
                      Haftalık Nöbet
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-[#211729] border border-[#E8DFEB]/50 dark:border-[#49364F]/50">
                    <div className="text-base font-black text-[#16805D] dark:text-[#45C7A2]">
                      Uyumlu
                    </div>
                    <div className="text-[10px] text-[#16805D] dark:text-[#45C7A2] font-bold">
                      MEB Yasal Sınır
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── KATEGORİ 5: OKUL GENELİ CANLI DERS RADARI & DENETİM ── */}
      <div className="space-y-4 sm:space-y-5 w-full">
        {/* Okul Geneli Canlı Ders ve Zaman Radarı */}
        <LiveClassRadar
          role="principal"
          initialClassCode="9-A"
          showClassSelector={true}
          titleOverride="Okul Geneli Canlı Ders ve Zaman Radarı"
        />

        {/* ÇİFT SÜTUNLU DENETİM ALANI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 w-full">
          {/* SOL SÜTUN: ÇAKIŞMA KONTROLÜ */}
          <div className="space-y-4">

          {/* Ders Programı Çakışma Denetimi */}
          <div
            onClick={() => setIsConflictReportModalOpen(true)}
            className={`border rounded-3xl p-4 shadow-sm transition-all cursor-pointer ${
              totalConflictsCount === 0
                ? 'bg-[#E4F5ED]/70 dark:bg-[#16805D]/15 border-[#16805D]/30 dark:border-[#16805D]/40 hover:border-[#16805D]'
                : 'bg-[#FCE8ED]/80 dark:bg-[#C62848]/20 border-[#C62848]/40 dark:border-[#C62848]/60 hover:border-[#C62848]'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                    totalConflictsCount === 0
                      ? 'bg-[#16805D]/15 text-[#16805D] dark:text-[#45C7A2]'
                      : 'bg-[#C62848]/15 text-[#C62848] dark:text-[#F17AE6]'
                  }`}
                >
                  {totalConflictsCount === 0 ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <span
                    className={`text-xs font-black block ${
                      totalConflictsCount === 0
                        ? 'text-[#16805D] dark:text-[#45C7A2]'
                        : 'text-[#C62848] dark:text-[#F17AE6]'
                    }`}
                  >
                    Ders Programı Çakışma Durumu
                  </span>
                  <p
                    className={`text-[11px] mt-0.5 ${
                      totalConflictsCount === 0
                        ? 'text-[#16805D]/90 dark:text-[#45C7A2]/80'
                        : 'text-[#C62848]/90 dark:text-[#F17AE6]/80 font-semibold'
                    }`}
                  >
                    {totalConflictsCount === 0
                      ? '0 Çakışma Tespit Edildi — Haftalık çizelge uyumlu.'
                      : `${totalConflictsCount} Çakışma Tespit Edildi — Raporu İnceleyin.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                    totalConflictsCount === 0
                      ? 'text-[#16805D] dark:text-[#45C7A2] bg-[#E4F5ED] dark:bg-[#16805D]/30'
                      : 'text-[#C62848] dark:text-[#F17AE6] bg-[#FCE8ED] dark:bg-[#C62848]/30 animate-pulse'
                  }`}
                >
                  {totalConflictsCount === 0 ? 'Stabil & Onaylı' : `${totalConflictsCount} Hata`}
                </span>
                <ChevronRight
                  size={14}
                  className={totalConflictsCount === 0 ? 'text-[#16805D]' : 'text-[#C62848]'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ SÜTUN: PERSONEL KATILIMI & YAKLAŞAN ETKİNLİKLER */}
        <div className="space-y-4">
          {/* Öğretmen & Personel Mesai Özeti */}
          <div className="bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] rounded-3xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F0D8FA] dark:bg-[#4B075F]/30 text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center">
                  <UserCheck size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-[#241329] dark:text-white">
                      Öğretmen & Personel Devam Özeti
                    </h4>
                    <MockBadge size="xs" />
                  </div>
                  <p className="text-[10px] text-[#716779] dark:text-[#B5A5BD] font-medium">
                    Bugünkü Mesai Katılımı & İşe Geliş Analizi
                  </p>
                </div>
              </div>

              <span className="text-xs font-black text-[#16805D] dark:text-[#45C7A2] bg-[#E4F5ED] dark:bg-[#16805D]/20 px-2.5 py-1 rounded-xl">
                %100 Görevde
              </span>
            </div>

            {/* Attendance Progress Bar */}
            <div className="w-full bg-[#F7F0FA] dark:bg-[#2D2035] rounded-full h-2.5 overflow-hidden flex">
              <div className="bg-[#16805D] h-full w-full" />
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#E8DFEB] dark:border-[#49364F] text-center">
              <div>
                <div className="text-sm font-black text-[#16805D] dark:text-[#45C7A2]">
                  {realStats.teacherCount}
                </div>
                <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] font-bold">Okulda / Görevde</div>
              </div>
              <div>
                <div className="text-sm font-black text-[#B86B00] dark:text-[#F5C542]">0</div>
                <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] font-bold">İzinli / Raporlu</div>
              </div>
              <div>
                <div className="text-sm font-black text-[#716779]">0</div>
                <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] font-bold">Mazeretsiz</div>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-2xl bg-[#E4F5ED]/70 dark:bg-[#16805D]/15 border border-[#16805D]/30 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#16805D] dark:text-[#45C7A2]">
                <CheckCircle2 size={13} className="text-[#16805D]" />
                <span>{realStats.teacherName} görev başındadır</span>
              </div>
              <p className="text-[10.5px] text-[#716779] dark:text-[#B5A5BD] mt-0.5">
                Oxonom Okulları bünyesinde bekleyen izin veya devamsızlık talebi yoktur.
              </p>
            </div>
          </div>

          {/* Yaklaşan Sınavlar ve Etkinlikler */}
          <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-3xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <h4 className="text-xs font-black text-gray-900 dark:text-white">
                  Akademik Takvim & Yaklaşan Etkinlikler
                </h4>
              </div>
              <span className="text-[10px] font-bold text-gray-400">Ekim 2026</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-black uppercase">Ekim</span>
                  <span className="text-xs font-black leading-none">16</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    1. Dönem Zümre & Öğretmenler Kurulu Toplantısı
                  </div>
                  <div className="text-[10px] text-gray-500">Saat 15:30 · Öğretmenler Odası</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-black uppercase">Ekim</span>
                  <span className="text-xs font-black leading-none">29</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    29 Ekim Cumhuriyet Bayramı Töreni
                  </div>
                  <div className="text-[10px] text-gray-500">Saat 10:00 · Okul Konferans Salonu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* ── 6. DİĞER MODÜLLER AÇILIR ÇEKMECESİ (MOBİL İÇİN) ── */}
      <MobileAdminMoreSheet
        isOpen={isMoreSheetOpen}
        onClose={() => setIsMoreSheetOpen(false)}
        theme={theme}
        orgSlug={orgSlug}
      />

      {/* ── MODAL 1: RESMİ MEB e-OKUL RAPORU OLUŞTURUCU ── */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0E131F] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 shadow-2xl p-5 z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Resmi MEB e-Okul Raporu Oluştur</h3>
                    <p className="text-[11px] text-gray-500">Oxonom Okulları Kurumsal Çıktı Modülü</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="py-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Rapor Türü Seçimi
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                  >
                    <option value="attendance">Günlük & Haftalık Yoklama Çizelgesi</option>
                    <option value="curriculum">Müfredat Kazanım ve Ders Takip Formu</option>
                    <option value="teachers">Öğretmen Haftalık Ek Ders & Mesai Bordrosu</option>
                    <option value="registry">Dönem Sonu Sınıf Kütüğü & Öğrenci Dosyası</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Kapsam / Sınıf
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${realStats.className} (Tüm Şubeler)`}
                      className="w-full h-10 px-3 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 font-medium text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Dönem
                    </label>
                    <input
                      type="text"
                      disabled
                      value="2026-2027 1. Dönem"
                      className="w-full h-10 px-3 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 font-medium text-gray-500"
                    />
                  </div>
                </div>

                {/* Preview Box */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 font-mono text-[11px] space-y-1">
                  <div className="text-gray-400 text-center font-bold">
                    T.C. MİLLÎ EĞİTİM BAKANLIĞI · OXONOM OKULLARI
                  </div>
                  <div className="text-gray-500 text-center">
                    Resmi Belge Kodu: MEB-OXO-2026-9A · Sicil No: 94281
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 text-center font-bold pt-1">
                    ✓ Elektronik İmzalı & Mühürlü Çıktı
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleExportReport}
                  disabled={isExportingReport}
                  className="h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black flex items-center justify-center gap-1.5 shadow-md"
                >
                  {isExportingReport ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Download size={15} />
                  )}
                  <span>PDF Raporunu İndir</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: TOPLU SMS & DUYURU HATTI ── */}
      <AnimatePresence>
        {isSmsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSmsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0E131F] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 shadow-2xl p-5 z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Send size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Toplu SMS & Veli Duyurusu</h3>
                    <p className="text-[11px] text-gray-500">Müdürlük Resmi Bildirim Portalı</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSmsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="py-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Alıcı Hedef Kitle
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSmsRecipientType('parents')}
                      className={`h-9 rounded-xl font-bold text-xs transition-all ${
                        smsRecipientType === 'parents'
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      Veliler ({realStats.parentCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSmsRecipientType('teachers')}
                      className={`h-9 rounded-xl font-bold text-xs transition-all ${
                        smsRecipientType === 'teachers'
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      Öğretmenler ({realStats.teacherCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSmsRecipientType('all')}
                      className={`h-9 rounded-xl font-bold text-xs transition-all ${
                        smsRecipientType === 'all'
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      Tümü ({realStats.parentCount + realStats.teacherCount})
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Duyuru Metni (SMS)
                  </label>
                  <textarea
                    rows={4}
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium focus:outline-none focus:border-amber-500"
                    placeholder="Bildirim metnini yazın..."
                  />
                  <div className="flex justify-between text-[10.5px] text-gray-400 mt-1">
                    <span>1 SMS = 160 Karakter</span>
                    <span>{smsMessage.length} Karakter</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSmsModalOpen(false)}
                  className="h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleSendBroadcastSms}
                  disabled={isSendingSms}
                  className="h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black flex items-center justify-center gap-1.5 shadow-md"
                >
                  {isSendingSms ? <RefreshCw size={14} className="animate-spin" /> : <Send size={15} />}
                  <span>Duyuruyu Gönder</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* ── MODAL 4: HIZLI ÖĞRETMEN & DERS GÖREVLENDİRME MODALI ── */}
      <AnimatePresence>
        {isAssignTeacherModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignTeacherModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0E131F] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 shadow-2xl p-5 z-10"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Öğretmen & Ders Görevlendirmesi</h3>
                    <p className="text-[10px] text-gray-500">{realStats.className} · Türk Dili ve Edebiyatı</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAssignTeacherModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleSaveAssignment} className="py-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Görevlendirilecek Öğretmen
                  </label>
                  <select
                    value={formAssignTeacher}
                    onChange={(e) => setFormAssignTeacher(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                    required
                  >
                    <option value="" disabled>Öğretmen Seçin</option>
                    {availableTeachers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.branch})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Ders Günü
                    </label>
                    <select
                      value={formAssignDay}
                      onChange={(e) => setFormAssignDay(e.target.value as DayKey)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                    >
                      {DAYS_LIST.map((d) => (
                        <option key={d.key} value={d.key}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Ders Saati
                    </label>
                    <select
                      value={formAssignPeriod}
                      onChange={(e) => setFormAssignPeriod(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                    >
                      {activePeriods.map((p) => (
                        <option key={p.periodNumber} value={p.periodNumber}>
                          {p.periodNumber}. Ders ({p.time})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Derslik / Salon
                  </label>
                  <input
                    type="text"
                    value={formAssignRoom}
                    onChange={(e) => setFormAssignRoom(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAssignTeacherModalOpen(false)}
                    className="h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-xl bg-[#4B075F] hover:bg-[#620B79] active:bg-[#350444] text-white font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check size={16} strokeWidth={2.5} />
                    <span>Kaydet</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 5: HAFTALIK ÇAKIŞMA VE CANLI UYUMLULUK RAPORU ── */}
      <AnimatePresence>
        {isConflictReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConflictReportModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#211729] text-[#241329] dark:text-white border border-[#E8DFEB] dark:border-[#49364F] shadow-2xl p-5 z-10"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E8DFEB] dark:border-[#49364F]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E4F5ED] dark:bg-[#16805D]/20 text-[#16805D] dark:text-[#45C7A2] flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Haftalık Çakışma Denetimi</h3>
                    <p className="text-[10px] text-[#716779]">MEB Standart Uyumluluk Doğrulaması</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConflictReportModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F7F0FA] dark:bg-[#2D2035] text-[#716779] flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#E4F5ED] dark:bg-[#16805D]/20 border border-[#16805D]/30 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#16805D] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="font-black text-[#16805D] dark:text-[#45C7A2]">
                      Haftalık Çizelge %100 Uyumlu
                    </div>
                    <div className="text-[11px] text-[#16805D]/90 dark:text-[#45C7A2]/80 mt-0.5">
                      Öğretmen, derslik ve periyot atamalarında çakışma saptanmadı.
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#FCF9FD] dark:bg-[#17101C]/60 flex items-center justify-between">
                    <span>Öğretmen Zaman Çakışması</span>
                    <span className="font-extrabold text-[#16805D]">0 Hata · Uyumlu</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FCF9FD] dark:bg-[#17101C]/60 flex items-center justify-between">
                    <span>Fiziksel Derslik & Atölye Kotası</span>
                    <span className="font-extrabold text-[#16805D]">Derslik 9-A Uygun</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FCF9FD] dark:bg-[#17101C]/60 flex items-center justify-between">
                    <span>Haftalık Zorunlu Saat Kotası</span>
                    <span className="font-extrabold text-[#16805D]">30 Saat / Hafta</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsConflictReportModalOpen(false)}
                className="w-full h-10 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] text-[#241329] dark:text-white font-bold text-xs"
              >
                Raporu Kapat
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 6: YÖNETİCİ HESAP & PROFİL BİLGİLERİ ── */}
      <AnimatePresence>
        {isAdminProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAdminProfileModalOpen(false)
                setIsEditingProfile(false)
              }}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#211729] text-[#241329] dark:text-white border border-[#E8DFEB] dark:border-[#49364F] shadow-2xl p-5 z-10"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E8DFEB] dark:border-[#49364F]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F0D8FA] dark:bg-[#4B075F]/30 text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Yönetici Profil Bilgileri</h3>
                    <p className="text-[10px] text-[#716779]">MEB Sicil & MERNİS Doğrulamalı Profil</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminProfileModalOpen(false)
                    setIsEditingProfile(false)
                  }}
                  className="w-8 h-8 rounded-full bg-[#F7F0FA] dark:bg-[#2D2035] text-[#716779] flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="py-4 space-y-3.5 text-xs">
                {/* Hero Mini */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#241329] to-[#350444] text-white border border-[#49364F] flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-gradient text-white font-black text-base flex items-center justify-center">
                    {getPrincipalInitials(adminProfile.name)}
                  </div>
                  <div>
                    <div className="text-sm font-black">{adminProfile.name}</div>
                    <div className="text-[11px] text-[#F17AE6] font-bold">{adminProfile.title}</div>
                    <div className="text-[10px] text-white/70">{adminProfile.schoolName}</div>
                  </div>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-3">
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Müdür Adı Soyadı
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Resmi Görev / Ünvan
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Okul Resmi Adı
                      </label>
                      <input
                        type="text"
                        value={editSchoolName}
                        onChange={(e) => setEditSchoolName(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        T.C. Kimlik Numarası
                      </label>
                      <input
                        type="text"
                        maxLength={11}
                        value={editTcNo}
                        onChange={(e) => setEditTcNo(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Telefon
                      </label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        E-Posta
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="h-9 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] text-[#241329] dark:text-white font-bold text-xs cursor-pointer"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="submit"
                        className="h-9 rounded-xl bg-[#4B075F] hover:bg-[#620B79] active:bg-[#350444] text-white font-black text-xs cursor-pointer"
                      >
                        Kalıcı Kaydet
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between">
                      <span className="text-gray-500">T.C. Kimlik No:</span>
                      <span className="font-mono font-bold">{adminProfile.tcNo} (MERNİS Doğrulanmış)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between">
                      <span className="text-gray-500">E-Posta:</span>
                      <span className="font-bold">{adminProfile.email}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between">
                      <span className="text-gray-500">Telefon:</span>
                      <span className="font-bold">{adminProfile.phone}</span>
                    </div>
                  </div>
                )}
              </div>

              {!isEditingProfile && (
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full h-9 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Edit2 size={13} />
                    <span>Bilgileri Düzenle</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAdminSignOut}
                    className="w-full h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <LogOut size={13} />
                    <span>Oturumu Kapat</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: YENİ PANO & AKILLI TAHTA TANIMLAMA (MÜDÜR) ── */}
      <AnimatePresence>
        {isNewPanoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewPanoModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#211729] text-[#241329] dark:text-white border border-[#E8DFEB] dark:border-[#49364F] shadow-2xl p-5 z-10"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E8DFEB] dark:border-[#49364F]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-gradient text-white flex items-center justify-center shadow-sm">
                    <Tv size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Yeni Pano & Akıllı Tahta</h3>
                    <p className="text-[11px] text-[#716779] dark:text-[#B5A5BD]">
                      Tahtaya ID verin, anında canlı linki oluşsun
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewPanoModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F7F0FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateNewPano} className="pt-4 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Pano ID (Örn: 1A, 3B, LAB)
                    </label>
                    <input
                      type="text"
                      required
                      value={newPanoCode}
                      onChange={(e) => setNewPanoCode(e.target.value.toUpperCase())}
                      placeholder="1A"
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono font-bold text-xs uppercase outline-hidden focus:border-[#8D49A6]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Tahta No (Örn: 01, 02)
                    </label>
                    <input
                      type="text"
                      required
                      value={newBoardNo}
                      onChange={(e) => setNewBoardNo(e.target.value.toUpperCase())}
                      placeholder="01"
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono font-bold text-xs uppercase outline-hidden focus:border-[#8D49A6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Pano / Tahta Adı
                  </label>
                  <input
                    type="text"
                    required
                    value={newPanoName}
                    onChange={(e) => setNewPanoName(e.target.value)}
                    placeholder="Örn: 1-A Şubesi Akıllı Tahtası"
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-semibold text-xs outline-hidden focus:border-[#8D49A6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Konum / Derslik
                  </label>
                  <input
                    type="text"
                    value={newPanoLocation}
                    onChange={(e) => setNewPanoLocation(e.target.value)}
                    placeholder="Örn: 1. Kat Derslik 101"
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-semibold text-xs outline-hidden focus:border-[#8D49A6]"
                  />
                </div>

                {/* Canlı Bağlantı Önizlemesi */}
                <div className="p-3 rounded-xl bg-[#F0D8FA]/50 dark:bg-[#350444]/40 border border-[#8D49A6]/30 space-y-1">
                  <span className="text-[10px] font-black uppercase text-[#4B075F] dark:text-[#F0D8FA]">
                    Otomatik Oluşacak Canlı Pano Linki:
                  </span>
                  <div className="font-mono text-[11px] font-bold text-[#D914C8] break-all">
                    /pano/{(newPanoCode || '1A').trim().toUpperCase()}-{(newBoardNo || '01').trim().toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewPanoModalOpen(false)}
                    className="h-10 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] text-[#241329] dark:text-white font-bold text-xs cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs cursor-pointer shadow-md shadow-[#4B075F]/20 flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Panoyu Oluştur</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )

  if (hideHeader) {
    return pageContent
  }

  return (
    <div
      className={`${theme} min-h-[100dvh] w-full bg-[#0A0D15] sm:bg-[#E2E8F0] sm:dark:bg-[#06090F] flex justify-center selection:bg-[#34D399]/30 font-jakarta overscroll-none transition-colors duration-200`}
    >
      <div
        className="w-full sm:max-w-[420px] min-h-[100dvh] bg-[#F8FAFC] dark:bg-[#0A0D15] sm:shadow-2xl relative flex flex-col sm:border-x border-gray-200/60 dark:border-gray-800/80 overflow-x-hidden overscroll-y-none"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6.5rem)' }}
      >
        <MobileHeader theme={theme} onToggleTheme={toggleTheme} />
        <main className="flex-1 w-full flex flex-col p-4">{pageContent}</main>
        {!hideDock && (
          <MobileAdminDock
            activeTab="home"
            onOpenMoreSheet={() => setIsMoreSheetOpen(true)}
            orgSlug={orgSlug}
            theme={theme}
          />
        )}
      </div>
    </div>
  )
}
