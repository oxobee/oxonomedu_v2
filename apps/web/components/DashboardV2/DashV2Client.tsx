'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronRight,
  Tv,
  BookOpenCheck,
  Users,
  FolderOpen,
  LayoutGrid,
  QrCode,
  LogOut,
  Sparkles,
  ExternalLink,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Gamepad2,
  Monitor,
  Settings,
  GraduationCap,
  Calendar,
  Layers,
  ArrowUpRight,
  FileText,
  Sun,
  Moon,
  User,
  CheckSquare,
  Home,
  Compass,
  Lock,
  Smartphone,
  RotateCw,
  Upload,
  ShieldCheck,
  FileCheck,
  X,
  BarChart3,
  BookOpen,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileFloatingDock from '@components/Mobile/MobileFloatingDock'
import { signOut, useAuth } from '@components/Contexts/AuthContext'
import { useOrg } from '@components/Contexts/OrgContext'
import {
  ALL_CLASSROOMS,
  ClassroomItem,
} from '@services/demo/schoolDirectory'
import { getClassroomBoards } from '@services/boards/boards'
import {
  getSchoolAssignments,
  SchoolAssignmentItem,
  formatDueDate,
} from '@services/school_assignments/school_assignments'
import ClassSelectorSheet from './ClassSelectorSheet'
import TeacherNotesModal from './TeacherNotesModal'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import {
  getAttendanceForClass,
  normalizeClassCode,
  AttendanceRecord,
} from '@services/demo/attendanceService'
import MockBadge from '@components/Common/MockBadge'
import LiveClassRadar from '@components/Common/LiveClassRadar'

export interface DashV2ClientProps {
  hideDock?: boolean
  hideHeader?: boolean
  theme?: 'light' | 'dark'
  onToggleTheme?: () => void
}

export default function DashV2Client({
  hideDock = false,
  hideHeader = false,
  theme: propTheme,
  onToggleTheme: propToggleTheme,
}: DashV2ClientProps = {}) {
  const router = useRouter()
  const { signOut: authSignOut } = useAuth()
  const org = useOrg() as any
  const session = useLHSession() as any
  const user = session?.data?.user
  const token = session?.data?.tokens?.access_token

  // Synchronized Mobile Theme State: 'light' | 'dark'
  const { theme: internalTheme, toggleTheme: internalToggleTheme } = useMobileTheme()
  const theme = propTheme || internalTheme
  const toggleTheme = propToggleTheme || internalToggleTheme

  // Prevent pinch-to-zoom and gesture-based zooming on mobile/trackpads
  useEffect(() => {
    const preventMultiTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }
    const preventGesture = (e: Event) => {
      e.preventDefault()
    }
    document.addEventListener('touchmove', preventMultiTouch, { passive: false })
    document.addEventListener('gesturestart', preventGesture)
    document.addEventListener('gesturechange', preventGesture)
    return () => {
      document.removeEventListener('touchmove', preventMultiTouch)
      document.removeEventListener('gesturestart', preventGesture)
      document.removeEventListener('gesturechange', preventGesture)
    }
  }, [])

  // Active Classroom State (Default to 1-A matching the exact screenshot)
  const [selectedClass, setSelectedClass] = useState<ClassroomItem>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_selected_class')
        if (saved) {
          const parsed = JSON.parse(saved)
          const found = ALL_CLASSROOMS.find((c) => c.id === parsed.id || c.code === parsed.code)
          if (found) return found
        }
      } catch (_) {}
    }
    // Default to authentic single class 9/A (Ebru TEKNECİ)
    return ALL_CLASSROOMS.find((c) => c.code === '9/A' || c.code === '9-A') || ALL_CLASSROOMS[0]
  })

  // Modal Dialog States
  const [isClassSheetOpen, setIsClassSheetOpen] = useState(false)
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)

  const handleSelectClass = (cls: ClassroomItem) => {
    setSelectedClass(cls)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_selected_class', JSON.stringify(cls))
        window.dispatchEvent(new CustomEvent('oxonom_class_changed', { detail: cls }))
      } catch (_) {}
    }
  }

  // Real Classroom Daily Attendance Synchronization
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord | null>(() => {
    return getAttendanceForClass(normalizeClassCode(selectedClass?.code || '9/A'))
  })

  useEffect(() => {
    const refreshAttendance = () => {
      const data = getAttendanceForClass(normalizeClassCode(selectedClass?.code || '9/A'))
      setAttendanceData(data)
    }

    refreshAttendance()

    const handleAttendanceUpdated = (e: any) => {
      const updatedCode = normalizeClassCode(e?.detail?.classCode)
      const currentCode = normalizeClassCode(selectedClass?.code || '9/A')
      if (!e?.detail?.classCode || updatedCode === currentCode) {
        if (e?.detail?.record) {
          setAttendanceData(e.detail.record)
        } else {
          refreshAttendance()
        }
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.includes('oxonom_daily_attendance')) {
        refreshAttendance()
      }
    }

    window.addEventListener('oxonom_attendance_updated', handleAttendanceUpdated)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('oxonom_attendance_updated', handleAttendanceUpdated)
      window.removeEventListener('storage', handleStorage)
    }
  }, [selectedClass?.code])

  // Teacher Profile state (Synced from local storage & custom events)
  const [teacherProfile, setTeacherProfile] = useState<{
    firstName?: string
    lastName?: string
    email?: string
    bio?: string
    tcNo?: string
    phone?: string
    branch?: string
    isFirstLogin?: boolean
    profileCompleted?: boolean
    avatarUrl?: string
    avatarImage?: string
  } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const readTeacherProfile = () => {
        try {
          const raw = localStorage.getItem('oxonom_teacher_profile')
          if (raw) {
            setTeacherProfile(JSON.parse(raw))
          }
        } catch (_) {}
      }
      readTeacherProfile()

      const handleTeacherUpdate = (e?: any) => {
        if (e?.detail) {
          setTeacherProfile((prev) => ({ ...prev, ...e.detail }))
        } else {
          readTeacherProfile()
        }
      }

      window.addEventListener('oxonom_teacher_profile_updated', handleTeacherUpdate)
      window.addEventListener('storage', handleTeacherUpdate)
      return () => {
        window.removeEventListener('oxonom_teacher_profile_updated', handleTeacherUpdate)
        window.removeEventListener('storage', handleTeacherUpdate)
      }
    }
  }, [])

  // Teacher Name (Always prioritizes edited profile so it never reverts)
  const teacherName = useMemo(() => {
    if (teacherProfile?.firstName) {
      return `${teacherProfile.firstName} Öğretmen`
    }
    if (user?.first_name) {
      return `${user.first_name} Öğretmen`
    }
    if (selectedClass?.teacher_name) {
      const first = selectedClass.teacher_name.split(' ')[0]
      return `${first} Öğretmen`
    }
    return 'Ebru Öğretmen'
  }, [teacherProfile, user, selectedClass])

  // Full teacher name for account link & avatar
  const teacherFullName = useMemo(() => {
    if (teacherProfile?.firstName) {
      return `${teacherProfile.firstName} ${teacherProfile.lastName || ''}`.trim()
    }
    if (user?.full_name) {
      return user.full_name
    }
    return selectedClass?.teacher_name || 'Ebru TEKNECİ'
  }, [teacherProfile, user, selectedClass])

  const teacherInitials = useMemo(() => {
    return teacherFullName
      .split(' ')
      .map((p: string) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [teacherFullName])

  // First-Login Profile Completion Modal state
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3 | 4>(1)
  const [onboardingFirstName, setOnboardingFirstName] = useState('')
  const [onboardingLastName, setOnboardingLastName] = useState('')
  const [onboardingTcNo, setOnboardingTcNo] = useState('')
  const [onboardingPhone, setOnboardingPhone] = useState('')
  const [onboardingBirthDate, setOnboardingBirthDate] = useState('14.05.1990')
  const [onboardingBloodType, setOnboardingBloodType] = useState('A Rh+')
  const [onboardingAddress, setOnboardingAddress] = useState('')
  const [onboardingEmergencyContact, setOnboardingEmergencyContact] = useState('')
  const [onboardingEmergencyPhone, setOnboardingEmergencyPhone] = useState('')
  const [onboardingUniversity, setOnboardingUniversity] = useState('Boğaziçi Üniversitesi Eğitim Fakültesi')
  const [onboardingGraduationYear, setOnboardingGraduationYear] = useState('2016')
  const [onboardingBranch, setOnboardingBranch] = useState('Türk Dili ve Edebiyatı')
  const [onboardingSicilNo, setOnboardingSicilNo] = useState('')
  const [onboardingBankName, setOnboardingBankName] = useState('Vakıfbank')
  const [onboardingIban, setOnboardingIban] = useState('')
  const [onboardingNewPass, setOnboardingNewPass] = useState('')
  const [onboardingNewPassConfirm, setOnboardingNewPassConfirm] = useState('')
  const [onboardingKvkkAccepted, setOnboardingKvkkAccepted] = useState(false)

  // Uploaded docs state
  const [uploadedDocs, setUploadedDocs] = useState<{
    diploma: boolean
    sicil: boolean
    saglik: boolean
    ikametgah: boolean
  }>({
    diploma: false,
    sicil: false,
    saglik: false,
    ikametgah: false,
  })

  // Check if profile completion is needed on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const isCompleted = localStorage.getItem('oxonom_teacher_profile_completed')
        const rawProfile = localStorage.getItem('oxonom_teacher_profile')
        let profileObj: any = null
        if (rawProfile) profileObj = JSON.parse(rawProfile)

        if (isCompleted === 'false' || profileObj?.isFirstLogin === true || profileObj?.profileCompleted === false) {
          setIsOnboardingModalOpen(true)
          if (profileObj?.firstName) setOnboardingFirstName(profileObj.firstName)
          if (profileObj?.lastName) setOnboardingLastName(profileObj.lastName)
          if (profileObj?.tcNo) setOnboardingTcNo(profileObj.tcNo)
          if (profileObj?.phone) setOnboardingPhone(profileObj.phone)
          if (profileObj?.branch) setOnboardingBranch(profileObj.branch)
        }
      } catch (_) {}
    }
  }, [])

  const handleSimulateUpload = (docKey: 'diploma' | 'sicil' | 'saglik' | 'ikametgah') => {
    toast.loading('Belge sisteme yükleniyor ve doğrulanıyor...', { id: `upload-${docKey}` })
    setTimeout(() => {
      setUploadedDocs((prev) => ({ ...prev, [docKey]: true }))
      toast.success('Belge başarıyla yüklendi ve e-Devlet doğrulaması alındı!', { id: `upload-${docKey}` })
    }, 800)
  }

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault()
    if (!onboardingFirstName.trim()) {
      toast.error('Lütfen adınızı giriniz.')
      setOnboardingStep(1)
      return
    }
    if (!onboardingTcNo.trim() || onboardingTcNo.length < 11) {
      toast.error('Lütfen 11 haneli TC Kimlik numaranızı doğrulayınız.')
      setOnboardingStep(1)
      return
    }
    if (!uploadedDocs.diploma || !uploadedDocs.sicil) {
      toast.error('Lütfen en az Diploma ve Adli Sicil belgelerinizi yükleyiniz.')
      setOnboardingStep(3)
      return
    }
    if (onboardingNewPass && onboardingNewPass !== onboardingNewPassConfirm) {
      toast.error('Yeni şifreler birbiriyle uyuşmuyor.')
      setOnboardingStep(4)
      return
    }
    if (!onboardingKvkkAccepted) {
      toast.error('Lütfen KVKK ve Kurumsal Aydınlatma Metnini onaylayınız.')
      setOnboardingStep(4)
      return
    }

    if (typeof window !== 'undefined') {
      try {
        const rawProfile = localStorage.getItem('oxonom_teacher_profile')
        const prev = rawProfile ? JSON.parse(rawProfile) : {}
        const updated = {
          ...prev,
          firstName: onboardingFirstName.trim(),
          lastName: onboardingLastName.trim(),
          tcNo: onboardingTcNo.trim(),
          phone: onboardingPhone.trim(),
          address: onboardingAddress.trim(),
          university: onboardingUniversity.trim(),
          graduationYear: onboardingGraduationYear.trim(),
          branch: onboardingBranch.trim(),
          sicilNo: onboardingSicilNo.trim(),
          bankName: onboardingBankName.trim(),
          iban: onboardingIban.trim(),
          bio: `${onboardingBranch || 'Öğretmen'} · Oxonom Okulları`,
          isFirstLogin: false,
          profileCompleted: true,
        }
        localStorage.setItem('oxonom_teacher_profile', JSON.stringify(updated))
        localStorage.setItem('oxonom_teacher_profile_completed', 'true')

        // Update in admin teachers list
        const adminTeachersRaw = localStorage.getItem('oxonom_admin_teachers_30')
        if (adminTeachersRaw) {
          const teachers = JSON.parse(adminTeachersRaw)
          const updatedTeachers = teachers.map((t: any) => {
            if (t.email?.toLowerCase() === updated.email?.toLowerCase() || t.id === updated.id) {
              return {
                ...t,
                name: `${updated.firstName} ${updated.lastName}`.trim(),
                tcNo: updated.tcNo,
                phone: updated.phone,
                branch: updated.branch,
                isFirstLogin: false,
                profileCompleted: true,
                documents: [
                  { id: 'doc-dip', name: 'Lisans_Mezuniyet_Diplomasi.pdf', type: 'Lisans Diploması', uploadDate: 'Bugün', fileSize: '2.4 MB' },
                  { id: 'doc-sic', name: 'e-Devlet_Adli_Sicil_Kaydi.pdf', type: 'Adli Sicil Kaydı', uploadDate: 'Bugün', fileSize: '1.1 MB' },
                  ...(uploadedDocs.saglik ? [{ id: 'doc-sag', name: 'Saglik_Kurulu_Raporu.pdf', type: 'Sağlık Raporu', uploadDate: 'Bugün', fileSize: '1.8 MB' }] : []),
                  ...(uploadedDocs.ikametgah ? [{ id: 'doc-ika', name: 'Yerlesim_Yeri_Belgesi.pdf', type: 'İkametgah Belgesi', uploadDate: 'Bugün', fileSize: '0.9 MB' }] : []),
                ],
              }
            }
            return t
          })
          localStorage.setItem('oxonom_admin_teachers_30', JSON.stringify(updatedTeachers))
        }

        window.dispatchEvent(new CustomEvent('oxonom_teacher_profile_updated', { detail: updated }))
        setTeacherProfile(updated)
      } catch (_) {}
    }

    setIsOnboardingModalOpen(false)
    toast.success('Tebrikler! Profiliniz ve resmi evraklarınız başarıyla tamamlandı.', { duration: 5000, icon: '🎉' })
  }

  // Helper to load and merge all saved boards (both mobile & Pano classroom boards)
  const loadMergedBoards = useCallback(() => {
    if (typeof window === 'undefined') return []
    const results: any[] = []
    const seenIds = new Set<string>()

    // 1. Read mobile boards (oxonom_m_boards)
    try {
      const rawM = localStorage.getItem('oxonom_m_boards')
      if (rawM) {
        const parsed = JSON.parse(rawM)
        if (Array.isArray(parsed)) {
          for (const b of parsed) {
            const bId = String(b.id || b.board_uuid || '')
            if (bId && !seenIds.has(bId)) {
              seenIds.add(bId)
              results.push(b)
            }
          }
        }
      }
    } catch (_) {}

    // 2. Read Pano custom boards (oxonom_custom_boards)
    try {
      const rawC = localStorage.getItem('oxonom_custom_boards')
      if (rawC) {
        const parsed = JSON.parse(rawC)
        if (Array.isArray(parsed)) {
          for (const c of parsed) {
            const cId = String(c.board_uuid || c.id || '')
            if (cId && !seenIds.has(cId)) {
              seenIds.add(cId)
              results.push({
                id: cId,
                title: c.name || c.title || 'Ders Tahtası',
                className: c.className || selectedClass?.name || 'Sınıf',
                usergroupId: c.usergroup_id,
                date: c.date || c.board_date || 'Bugün',
                time: c.time || '10:30',
                description: `${c.className || selectedClass?.name || 'Sınıf'} akıllı tahtasında kaydedilen ders çizimleri`,
                url: `/board/${cId}`,
                createdAt: c.createdAt || Date.now(),
                lastOpenedAt: c.lastOpenedAt || c.createdAt || Date.now(),
                isOpen: false,
                isPublic: true,
              })
            }
          }
        }
      }
    } catch (_) {}

    return results
  }, [selectedClass?.name])

  // Boards for selected class (Synced from local storage / demo)
  const [localBoards, setLocalBoards] = useState<any[]>([])

  useEffect(() => {
    setLocalBoards(loadMergedBoards())
    const handleSync = () => {
      setLocalBoards(loadMergedBoards())
    }
    window.addEventListener('oxonom_pano_sync', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('oxonom_pano_sync', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [loadMergedBoards, selectedClass?.code])

  // Filter and sort so the most recently opened & saved board is displayed FIRST in Quick Access
  const classBoards = useMemo(() => {
    const code = selectedClass?.code?.toLowerCase() || ''
    const cName = selectedClass?.name?.toLowerCase() || ''
    const cId = selectedClass?.id

    const matched = localBoards.filter((b) => {
      const bClass = (b.className || '').toLowerCase()
      const bTitle = (b.title || '').toLowerCase()
      const matchId = cId && (Number(b.usergroupId) === Number(cId) || Number(b.usergroup_id) === Number(cId))
      const matchCode = code && (bClass.includes(code) || bTitle.includes(code))
      const matchName = cName && (bClass.includes(cName) || bTitle.includes(cName))
      const matchPanosu = bTitle.includes('sınıf panosu')
      return matchId || matchCode || matchName || matchPanosu
    })

    // Sort descending: most recently opened & saved board comes first
    return matched.sort((a, b) => {
      const timeA = a.lastOpenedAt || a.createdAt || (a.date ? new Date(a.date).getTime() : 0) || 0
      const timeB = b.lastOpenedAt || b.createdAt || (b.date ? new Date(b.date).getTime() : 0) || 0
      return timeB - timeA
    })
  }, [localBoards, selectedClass?.code, selectedClass?.name, selectedClass?.id])

  const latestClassBoard = classBoards.length > 0 ? classBoards[0] : null

  // Fetch Classroom Assignments
  const { data: assignmentsData } = useQuery({
    queryKey: ['classroom-assignments-v2', selectedClass?.id],
    queryFn: () =>
      getSchoolAssignments(
        org?.id || 10,
        { usergroup_id: selectedClass?.id },
        token || ''
      ),
    staleTime: 30_000,
  })
  const assignments: SchoolAssignmentItem[] = Array.isArray(assignmentsData) ? assignmentsData : []

  // Check Active Paired QR Smart Boards
  const [lockingSessionId, setLockingSessionId] = useState<string | null>(null)
  const [loggingOutSessionId, setLoggingOutSessionId] = useState<string | null>(null)

  const {
    data: activeBoardsData,
    refetch: refetchActiveBoards,
  } = useQuery({
    queryKey: ['pano-active-boards-v2', user?.id, user?.email],
    queryFn: async () => {
      try {
        const storedSessionId =
          typeof window !== 'undefined'
            ? localStorage.getItem('oxonom_pano_active_session_id') ||
              sessionStorage.getItem('oxonom_pano_active_session_id') ||
              ''
            : ''

        const params = new URLSearchParams()
        if (user?.id) params.set('teacherId', String(user.id))
        else params.set('teacherId', '2')

        if (user?.email) params.set('email', user.email)
        else params.set('email', 'ogretmen@oxonom.com')

        if (storedSessionId) params.set('sessionId', storedSessionId)

        const res = await fetch(`/api/pano/pair/active-boards?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          const list = Array.isArray(data.boards)
            ? data.boards
            : Array.isArray(data.activeBoards)
            ? data.activeBoards
            : []
          if (list.length === 0 && storedSessionId && typeof window !== 'undefined') {
            localStorage.removeItem('oxonom_pano_active_session_id')
            sessionStorage.removeItem('oxonom_pano_active_session_id')
          }
          return list
        }
      } catch (_) {}
      return []
    },
    refetchInterval: 2500,
  })

  const activeQrBoards: any[] = Array.isArray(activeBoardsData) ? activeBoardsData : []
  const pairedBoard = activeQrBoards.length > 0 ? activeQrBoards[0] : null
  const isBoardConnected = Boolean(pairedBoard)

  // Listen to pairing events & localStorage updates
  useEffect(() => {
    const handleSync = () => {
      refetchActiveBoards()
    }
    window.addEventListener('oxonom_pano_sync', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('oxonom_pano_sync', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [refetchActiveBoards])

  // Remote Lock Handler
  const handleLockBoard = async (sessId: string) => {
    setLockingSessionId(sessId)
    try {
      const phoneToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('oxonom_pano_device_token') || ''
          : ''
      const res = await fetch('/api/remote/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessId,
          action: 'LOCK',
          token: phoneToken || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Akıllı tahta kilitlendi!')
      } else {
        toast.error(data.error || 'Tahta kilitlenemedi.')
      }
    } catch (_) {
      toast.error('Bağlantı hatası.')
    } finally {
      setLockingSessionId(null)
    }
  }

  // Remote Logout Handler
  const handleLogoutBoard = async (sessId: string) => {
    if (!confirm('Bu akıllı tahtadaki oturumunuzu kapatmak istediğinize emin misiniz?')) {
      return
    }
    setLoggingOutSessionId(sessId)
    try {
      const res = await fetch('/api/pano/pair/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessId,
          role: 'phone',
          target: 'board_only',
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Akıllı tahta oturumu kapatıldı.')
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('oxonom_pano_active_session_id')
          if (stored === sessId) {
            localStorage.removeItem('oxonom_pano_active_session_id')
            sessionStorage.removeItem('oxonom_pano_active_session_id')
          }
        }
        refetchActiveBoards()
      } else {
        toast.error(data.error || 'Çıkış yapılamadı.')
      }
    } catch (_) {
      toast.error('Bağlantı hatası.')
    } finally {
      setLoggingOutSessionId(null)
      refetchActiveBoards()
    }
  }

  // Sibling Classrooms (1-A, 1-B, 1-C)
  const siblingClassrooms = useMemo(() => {
    return ALL_CLASSROOMS.filter((c) => c.grade_level === selectedClass.grade_level).slice(0, 3)
  }, [selectedClass])

  // Logout Handler
  const handleSignOut = async () => {
    toast.loading('Oturum kapatılıyor...', { id: 'dashv2-logout' })
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('oxonom_pano_paired_session')
        localStorage.removeItem('oxonom_pano_active_session_id')
        localStorage.removeItem('oxonom_pano_device_token')
        localStorage.removeItem('oxonom_pano_device_type')
        localStorage.removeItem('oxonom_selected_class')
        localStorage.removeItem('oxonom_pano_selected_class_id')
        sessionStorage.clear()
      }
      await authSignOut({ redirect: true, callbackUrl: '/m-login' })
    } catch {
      await signOut({ redirect: true, callbackUrl: '/m-login' })
    }
  }

  // Stagger animation variants
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  }

  const itemVariants: any = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
  }

  const pageContent = (
    <div className="flex flex-col flex-1 w-full">

        {/* ── MAIN CONTENT CONTAINER (Spacious, Staggered entrance from Left) ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full"
        >
          {/* ── HERO ALANI (Vibrant Gradient Blue matching unified portal styling) ── */}
          <motion.section
            variants={itemVariants}
            className="w-full bg-gradient-to-br from-[#1E4FD8] via-[#1D77FF] to-[#0A58D0] dark:from-[#0E1A38] dark:via-[#162D63] dark:to-[#0F224D] rounded-[30px] p-5 sm:p-6 space-y-4 sm:space-y-5 text-white shadow-[0_16px_45px_rgba(29,119,255,0.18)] border border-blue-400/30 dark:border-blue-800/40 relative overflow-hidden"
          >
            {/* Animated Background Subtle Concentric Circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none opacity-25">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
                className="w-full h-full relative"
              >
                <div className="absolute inset-0 rounded-full border border-cyan-200/40" />
                <div className="absolute inset-6 rounded-full border border-white/20 border-dashed" />
                <div className="absolute inset-12 rounded-full border border-cyan-200/30" />
              </motion.div>
            </div>

            {/* Subtle gradient sheen behind hero */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Top Row: Tag & Greetings on Left + Prominent Clickable Account Link on Right */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="space-y-1.5 min-w-0 flex-1">
                <span className="text-[11px] font-extrabold tracking-widest text-cyan-200 uppercase block">
                  ÖĞRETMEN ÇALIŞMA ALANI
                </span>
                <div className="text-xs sm:text-sm text-blue-100 font-medium leading-none pt-0.5">
                  Hoş Geldiniz,
                </div>
                <h1 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight leading-tight font-serif-display truncate">
                  {teacherName}
                </h1>
                <p className="text-[11px] text-blue-100/90 font-medium truncate">
                  {teacherProfile?.branch || 'Türk Dili ve Edebiyatı'} · Oxonom Okulları
                </p>
              </div>

              {/* Prominent, Clearly Noticeable & Clickable Account / Profile Button */}
              <Link
                href="/teacher/settings"
                className="group flex items-center gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 backdrop-blur-md transition-all shadow-md shrink-0 cursor-pointer"
                title="Hesap ve Profil Ayarları"
              >
                <div className="relative">
                  {teacherProfile?.avatarUrl || teacherProfile?.avatarImage ? (
                    <img
                      src={teacherProfile.avatarUrl || teacherProfile.avatarImage}
                      alt={teacherName}
                      className="w-10 h-10 rounded-xl object-cover border border-cyan-300/50 shadow-sm group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white text-[#1D77FF] flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                      {teacherInitials}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-cyan-300 border-2 border-[#1D77FF]" />
                </div>
                <div className="text-left hidden xs:block sm:block pr-1">
                  <div className="text-[10px] text-cyan-100 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span>Hesabım</span>
                    <Settings size={11} className="text-cyan-200 group-hover:rotate-45 transition-transform" />
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors flex items-center gap-0.5">
                    <span>Profil</span>
                    <ChevronRight size={13} className="text-blue-100 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Incomplete Profile Alert Banner (If profile completion is pending) */}
            {teacherProfile?.profileCompleted === false && (
              <div className="relative z-10 p-3 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-200 flex items-center justify-center shrink-0">
                    <AlertCircle size={16} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-extrabold text-white">
                      Profil & Evrak Tamamlama Bekleniyor
                    </div>
                    <div className="text-[11px] text-blue-100 truncate">
                      MEB resmi kaydınız için evraklarınızı yükleyin
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOnboardingModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#1D77FF] font-black text-xs shrink-0 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Tamamla
                </button>
              </div>
            )}

            {/* Sınıf Dropdown & Notlar Butonu */}
            <div className="flex items-center gap-3 pt-1 relative z-10">
              {/* Sınıf Dropdown Pill */}
              <button
                type="button"
                onClick={() => setIsClassSheetOpen(true)}
                className="flex-1 bg-white/15 hover:bg-white/20 border border-white/20 rounded-2xl py-2.5 px-3.5 flex items-center justify-between text-left cursor-pointer active:scale-[0.98] transition-all shadow-inner group h-[50px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7.5 h-7.5 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <GraduationCap size={17} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-blue-100 block leading-tight font-medium">
                      Sınıf
                    </span>
                    <span className="text-sm font-bold text-white block leading-tight truncate">
                      {selectedClass.code}
                    </span>
                  </div>
                </div>
                <ChevronDown size={15} className="text-blue-100 shrink-0 group-hover:text-white transition-colors" />
              </button>

              {/* Notlar Butonu */}
              <button
                type="button"
                onClick={() => setIsNotesModalOpen(true)}
                className="bg-white hover:bg-blue-50 text-[#1D77FF] font-bold text-sm px-4.5 py-2.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-md shrink-0 h-[50px]"
              >
                <FileText size={16} strokeWidth={2.5} className="text-[#1D77FF]" />
                <span>Notlar</span>
              </button>
            </div>
          </motion.section>

          {/* ══════════════════════════════════════════════════════════════════════════
              CANLI DERS TAKİP RADARI & ZAMAN AKIŞI (ÖĞRETMEN)
          ══════════════════════════════════════════════════════════════════════════ */}
          <motion.div variants={itemVariants}>
            <LiveClassRadar
              role="teacher"
              initialClassCode={selectedClass.code === '9/A' ? '9-A' : selectedClass.code}
            />
          </motion.div>

          {/* ══════════════════════════════════════════════════════════════════════════
              KATEGORİ 1: GÜNLÜK SINIF VE DEVAM YÖNETİMİ
          ══════════════════════════════════════════════════════════════════════════ */}
          <motion.div variants={itemVariants} className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-[11px] tracking-wider uppercase border border-indigo-500/20">
                KATEGORİ 1
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                Günlük Sınıf ve Devam Yönetimi
              </h2>
              <div className="flex-1 h-[1px] bg-gray-200/80 dark:bg-gray-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Kart 1A: Sınıf Rehberliği & Genel Durum */}
              <div className="bg-white dark:bg-[#121826] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between gap-4 group hover:border-indigo-500/30 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Users size={19} />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                      Rehberlik Sınıfı
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-gray-900 dark:text-white">
                        {selectedClass.student_count || 1}
                      </span>
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                        Aktif Öğrenci
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">
                      {selectedClass.code} Şubesi · Türk Dili ve Edebiyatı
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      Erçil UĞURLU (No: 101)
                    </p>
                  </div>
                </div>

                <Link
                  href={`/teacher/classes?class=${encodeURIComponent(selectedClass.code)}`}
                  className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-indigo-50 dark:bg-gray-800/60 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Sınıf Listesini Görüntüle</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* Kart 1B: Canlı Günlük Yoklama Takibi */}
              <div className="bg-white dark:bg-[#121826] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between gap-4 group hover:border-emerald-500/30 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckSquare size={19} />
                    </div>
                    {attendanceData?.taken ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        Tamamlandı • {attendanceData.updatedAt}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-1 border border-amber-200/60 dark:border-amber-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                        Yoklama Bekliyor
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Günlük Sınıf Yoklaması
                      </h3>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {selectedClass.code} Şubesi için bugünkü devam kaydı
                    </p>
                  </div>

                  {attendanceData?.taken ? (
                    <div className="space-y-2 pt-1">
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                        <div
                          style={{
                            width: `${
                              ((attendanceData.presentCount || 0) /
                                (attendanceData.totalCount || selectedClass.student_count || 1)) *
                              100
                            }%`,
                          }}
                          className="h-full bg-emerald-500 rounded-l-full"
                        />
                        <div
                          style={{
                            width: `${
                              ((attendanceData.absentCount || 0) /
                                (attendanceData.totalCount || selectedClass.student_count || 1)) *
                              100
                            }%`,
                          }}
                          className="h-full bg-rose-500 rounded-r-full"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 text-center">
                          {attendanceData.presentCount} Mevcut
                        </div>
                        <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50 text-center">
                          {attendanceData.absentCount} Eksik
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-300/60 dark:border-amber-700/60 text-xs space-y-1">
                      <div className="font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertCircle size={14} className="animate-pulse" />
                        <span>Bugünkü yoklama henüz alınmadı</span>
                      </div>
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                        Dersi başlatmadan önce lütfen yoklamayı tamamlayınız.
                      </p>
                    </div>
                  )}
                </div>

                <Link
                  href={`/teacher/attendance?class=${encodeURIComponent(selectedClass.code)}`}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    attendanceData?.taken
                      ? 'bg-gray-50 hover:bg-emerald-50 dark:bg-gray-800/60 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500 hover:bg-amber-600 text-black shadow-xs'
                  }`}
                >
                  <span>{attendanceData?.taken ? 'Yoklama Detaylarını Aç' : 'Yoklama Al'}</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* Kart 1C: Bugünkü Canlı Ders Akışı */}
              <div className="bg-white dark:bg-[#121826] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between gap-4 group hover:border-sky-500/30 transition-all md:col-span-2 lg:col-span-1">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <Calendar size={19} />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/50">
                      Bugünkü Dersler
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Ders Programı Akışı
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Haftalık ders dağılımına göre planlanan saatler
                    </p>
                  </div>

                  <div className="space-y-2 pt-0.5">
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>1. Ders · Türk Dili ve Edebiyatı</span>
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 block truncate">
                          9/A Şubesi · Derslik: 9-A
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md shrink-0">
                        09:00 - 09:40
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-400" />
                          <span>2. Ders · Türk Dili ve Edebiyatı</span>
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 block truncate">
                          9/A Şubesi · Derslik: 9-A
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md shrink-0">
                        09:50 - 10:30
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/teacher/schedule"
                  className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-sky-50 dark:bg-gray-800/60 dark:hover:bg-sky-950/40 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Haftalık Programın Tamamı</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════════════════════════════════
              KATEGORİ 2: AKILLI TAHTA & İNTERAKTİF DERSLİK
          ══════════════════════════════════════════════════════════════════════════ */}
          <motion.div variants={itemVariants} className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 font-black text-[11px] tracking-wider uppercase border border-teal-500/20">
                KATEGORİ 2
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                Akıllı Tahta & İnteraktif Derslik
              </h2>
              <div className="flex-1 h-[1px] bg-gray-200/80 dark:bg-gray-800" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Kart 2A: Ders Tahtaları Tuvali */}
              <div className="bg-white dark:bg-[#121826] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                        <Tv size={19} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                          Ders Tahtaları
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {selectedClass.code} Sınıfı için interaktif ders panoları
                        </p>
                      </div>
                    </div>
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs px-2.5 py-1 rounded-full">
                      {classBoards.length} tahta
                    </span>
                  </div>

                  {latestClassBoard ? (
                    <div className="bg-gray-50 dark:bg-[#0A0D15] p-4 rounded-xl border border-gray-200/60 dark:border-gray-800/80 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                          <span className="truncate">{latestClassBoard.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                            <Clock size={10} />
                            <span>{latestClassBoard.time}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                            <Calendar size={10} />
                            <span>{latestClassBoard.date}</span>
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {latestClassBoard.description || 'İnteraktif çizim ve ders sunumu için hazır tahta.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const url = latestClassBoard.url || `/board/${latestClassBoard.id}`
                          window.open(url, '_blank')
                        }}
                        className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black dark:bg-[#1E293B] dark:hover:bg-gray-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 transition-all"
                      >
                        <span>Tahtayı Aç</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-[#0A0D15] p-6 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-center flex flex-col items-center justify-center gap-2">
                      <Tv size={24} className="text-teal-500/70" />
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        Henüz Ders Tahtası Oluşturulmadı
                      </p>
                      <p className="text-[11px] text-gray-400 max-w-xs">
                        Sınıfınız için ilk ders tahtasını oluşturup çizim yapmaya hemen başlayabilirsiniz.
                      </p>
                      <Link
                        href="/teacher/smartboard"
                        className="mt-1 px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>İlk Tahtayı Oluştur</span>
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800 text-xs">
                  <Link
                    href="/teacher/smartboard"
                    className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                  >
                    + Yeni Tahta Oluştur
                  </Link>
                  <Link
                    href="/teacher/smartboard"
                    className="text-gray-500 dark:text-gray-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Tüm Tahtalar</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Kart 2B: Açık Akıllı Tahtalarım & QR Oturum Merkezi */}
              <div className="bg-white dark:bg-[#121826] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <QrCode size={19} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                          Açık Akıllı Tahtalarım
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          QR kod ile bağlanılan aktif tahta oturumları
                        </p>
                      </div>
                    </div>
                    {activeQrBoards.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {activeQrBoards.length} Aktif
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        0 Oturum
                      </span>
                    )}
                  </div>

                  {activeQrBoards.length > 0 ? (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto">
                      {activeQrBoards.map((board) => {
                        const isCurrentLocking = lockingSessionId === board.sessionId
                        const isCurrentLoggingOut = loggingOutSessionId === board.sessionId
                        const remoteUrl = `/remote?session=${encodeURIComponent(board.sessionId)}`

                        return (
                          <div
                            key={board.sessionId}
                            className="p-3 rounded-xl bg-gray-50 dark:bg-[#0A0D15] border border-emerald-500/30 dark:border-emerald-500/20 space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                  {board.boardName || 'Oxonom Akıllı Tahta'}
                                </h4>
                                <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400">
                                  Kod: {board.code} · {board.className || selectedClass.code}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                                Oturum Aktif
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <a
                                href={remoteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                              >
                                <Smartphone size={12} />
                                <span>Kumanda</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleLockBoard(board.sessionId)}
                                disabled={isCurrentLocking}
                                className="py-1.5 px-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/50 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                              >
                                {isCurrentLocking ? (
                                  <RotateCw size={12} className="animate-spin text-amber-600" />
                                ) : (
                                  <Lock size={12} />
                                )}
                                <span>Kilitle</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLogoutBoard(board.sessionId)}
                                disabled={isCurrentLoggingOut}
                                className="py-1.5 px-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                              >
                                {isCurrentLoggingOut ? (
                                  <RotateCw size={12} className="animate-spin text-rose-600" />
                                ) : (
                                  <LogOut size={12} />
                                )}
                                <span>Çıkış</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#0A0D15] border border-dashed border-gray-200 dark:border-gray-800 text-center flex flex-col items-center justify-center gap-2">
                      <QrCode size={24} className="text-emerald-500/70" />
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        Açık QR Oturumu Bulunmuyor
                      </p>
                      <p className="text-[11px] text-gray-400 max-w-xs">
                        Tahtadaki QR kodu okutarak veya PIN kodunu girerek cep telefonunuzdan kumanda edebilirsiniz.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                  <a
                    href="/pano"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Tv size={14} />
                    <span>Dijital Okul Panosunu Görüntüle</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════════════════════════════════
              KATEGORİ 3: ÖDEVLER, DOSYALAR VE HIZLI ARAÇLAR
          ══════════════════════════════════════════════════════════════════════════ */}
          <motion.div variants={itemVariants} className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black text-[11px] tracking-wider uppercase border border-purple-500/20">
                KATEGORİ 3
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                Ödevler, Dosyalar ve Hızlı Araçlar
              </h2>
              <div className="flex-1 h-[1px] bg-gray-200/80 dark:bg-gray-800" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Kart 3A: Verilen Ödevler */}
              <div className="bg-white dark:bg-[#121826] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between gap-4 group hover:border-purple-500/30 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <BookOpen size={19} />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50">
                      {assignments.length > 0 ? `${assignments.length} Aktif Ödev` : 'Ödev Havuzu'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Verilen Ödevler ve Değerlendirme
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {selectedClass.code} Şubesi · Erçil UĞURLU için verilen ödevler, teslim durumları ve puanlama ekranı.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Son Durum:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {assignments.length > 0 ? `${assignments.length} ödev yayında` : 'Yeni ödev oluşturmaya hazır'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/teacher/assignments"
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <CheckSquare size={14} />
                    <span>Ödevlere Git</span>
                  </Link>
                </div>
              </div>

              {/* Kart 3B: Dosyalarım ve Paylaşımlar */}
              <div className="bg-white dark:bg-[#121826] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between gap-4 group hover:border-sky-500/30 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <FolderOpen size={19} />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/50">
                      Materyal Havuzu
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Dosyalarım ve Paylaşımlar
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Ders sunumları, PDF çalışma föyleri, tahta çizim çıktıları ve ders arşivi.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Bulut Depolama:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      Aktif ve Erişilebilir
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/teacher/files"
                    className="flex-1 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FolderOpen size={14} />
                    <span>Dosyaları Görüntüle</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 4'lü Hızlı Araç ve Kısayol Kartları */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <Link
                href="/teacher/schedule"
                className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-100 dark:border-gray-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col items-center text-center gap-2 group active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    Ders Programı
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Haftalık Saatler
                  </span>
                </div>
              </Link>

              <Link
                href="/teacher/reports"
                className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-100 dark:border-gray-800 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-all flex flex-col items-center text-center gap-2 group active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    Sınıf Raporları
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Devam & Başarı
                  </span>
                </div>
              </Link>

              <Link
                href="/teacher/smartboard"
                className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-100 dark:border-gray-800 shadow-xs hover:border-teal-400 dark:hover:border-teal-600 transition-all flex flex-col items-center text-center gap-2 group active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Tv size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    Akıllı Tahta
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Ders Çizimleri
                  </span>
                </div>
              </Link>

              <Link
                href="/teacher/settings"
                className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-100 dark:border-gray-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-all flex flex-col items-center text-center gap-2 group active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Settings size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    Profil & Ayarlar
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    MEB Özlük & Hesap
                  </span>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* ── FOOTER: OTURUMU KAPAT ── */}
          <footer className="pt-1 pb-1 flex flex-col items-center justify-center text-center">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-rose-500 active:text-rose-600 transition-colors cursor-pointer rounded-xl"
            >
              <LogOut size={14} />
              <span>Oturumu Kapat</span>
            </button>
          </footer>
        </motion.div>

      {/* ── DIALOGS & DRAWERS (Theme-aware) ── */}
      <ClassSelectorSheet
        isOpen={isClassSheetOpen}
        onClose={() => setIsClassSheetOpen(false)}
        classrooms={ALL_CLASSROOMS}
        selectedClass={selectedClass}
        onSelect={handleSelectClass}
        theme={theme}
      />

      <TeacherNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        classNameCode={selectedClass.code}
        theme={theme}
      />

      {/* ── MODAL: İLK GİRİŞ PROFİL TAMAMLAMA & EVRAK YÜKLEME ── */}
      <AnimatePresence>
        {isOnboardingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.25 }}
              className="w-full sm:max-w-lg bg-white dark:bg-[#121826] rounded-t-[32px] sm:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <span>İlk Giriş: Profil & Evrak Tamamlama</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                        Zorunlu MEB Kaydı
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Oxonom Okulları kadrosundaki resmi kaydınızı ve evraklarınızı onaylayın
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOnboardingModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Stepper Tabs */}
              <div className="px-4 pt-3 shrink-0">
                <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(1)}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      onboardingStep === 1
                        ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 shadow-sm font-black'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    1. Kimlik
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(2)}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      onboardingStep === 2
                        ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 shadow-sm font-black'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    2. Akademik
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(3)}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      onboardingStep === 3
                        ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 shadow-sm font-black'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    3. Belgeler
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(4)}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      onboardingStep === 4
                        ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 shadow-sm font-black'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    4. Şifre & Onay
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCompleteOnboarding} className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* ── ADIM 1: KİMLİK & İLETİŞİM ── */}
                {onboardingStep === 1 && (
                  <div className="space-y-3.5">
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200">
                      Sayın Öğretmenimiz, müdürlük tarafından oluşturulan temel bilgilerinizi teyit ediniz ve eksik iletişim bilgilerinizi tamamlayınız.
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Adınız <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={onboardingFirstName}
                          onChange={(e) => setOnboardingFirstName(e.target.value)}
                          placeholder="Adınız"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Soyadınız <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={onboardingLastName}
                          onChange={(e) => setOnboardingLastName(e.target.value)}
                          placeholder="Soyadınız"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          TC Kimlik No <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={11}
                          value={onboardingTcNo}
                          onChange={(e) => setOnboardingTcNo(e.target.value.replace(/\D/g, ''))}
                          placeholder="11 haneli TC No"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono font-bold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Cep Telefonu
                        </label>
                        <input
                          type="text"
                          value={onboardingPhone}
                          onChange={(e) => setOnboardingPhone(e.target.value)}
                          placeholder="+90 532 ..."
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Doğum Tarihi
                        </label>
                        <input
                          type="text"
                          value={onboardingBirthDate}
                          onChange={(e) => setOnboardingBirthDate(e.target.value)}
                          placeholder="GG.AA.YYYY"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Kan Grubu
                        </label>
                        <select
                          value={onboardingBloodType}
                          onChange={(e) => setOnboardingBloodType(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        >
                          <option value="A Rh+">A Rh+</option>
                          <option value="A Rh-">A Rh-</option>
                          <option value="B Rh+">B Rh+</option>
                          <option value="B Rh-">B Rh-</option>
                          <option value="AB Rh+">AB Rh+</option>
                          <option value="AB Rh-">AB Rh-</option>
                          <option value="0 Rh+">0 Rh+</option>
                          <option value="0 Rh-">0 Rh-</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        İkametgah Adresi
                      </label>
                      <input
                        type="text"
                        value={onboardingAddress}
                        onChange={(e) => setOnboardingAddress(e.target.value)}
                        placeholder="İlçe / İl (Örn: Beşiktaş / İstanbul)"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Acil Durum Yakını
                        </label>
                        <input
                          type="text"
                          value={onboardingEmergencyContact}
                          onChange={(e) => setOnboardingEmergencyContact(e.target.value)}
                          placeholder="Eşi / Babası"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Acil Durum Tel
                        </label>
                        <input
                          type="text"
                          value={onboardingEmergencyPhone}
                          onChange={(e) => setOnboardingEmergencyPhone(e.target.value)}
                          placeholder="+90 532 ..."
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(2)}
                        className="w-full h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <span>Sonraki: Akademik Bilgiler</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── ADIM 2: AKADEMİK & ÖZLÜK ── */}
                {onboardingStep === 2 && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Mezun Olunan Üniversite & Fakülte <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={onboardingUniversity}
                        onChange={(e) => setOnboardingUniversity(e.target.value)}
                        placeholder="Örn: Boğaziçi Üniversitesi Eğitim Fakültesi"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Mezuniyet Yılı
                        </label>
                        <input
                          type="text"
                          value={onboardingGraduationYear}
                          onChange={(e) => setOnboardingGraduationYear(e.target.value)}
                          placeholder="2016"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Branş / Alan
                        </label>
                        <input
                          type="text"
                          value={onboardingBranch}
                          onChange={(e) => setOnboardingBranch(e.target.value)}
                          placeholder="Türk Dili ve Edebiyatı"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-emerald-600 dark:text-emerald-400 outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        MEB Sicil / Sertifika No
                      </label>
                      <input
                        type="text"
                        value={onboardingSicilNo}
                        onChange={(e) => setOnboardingSicilNo(e.target.value)}
                        placeholder="MEB-34019284"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono font-bold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Maaş Bankası
                        </label>
                        <input
                          type="text"
                          value={onboardingBankName}
                          onChange={(e) => setOnboardingBankName(e.target.value)}
                          placeholder="Vakıfbank"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          IBAN Numarası
                        </label>
                        <input
                          type="text"
                          value={onboardingIban}
                          onChange={(e) => setOnboardingIban(e.target.value)}
                          placeholder="TR..."
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(3)}
                        className="w-full h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <span>Sonraki: Zorunlu Belgeleri Yükle</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── ADIM 3: RESMİ BELGELERİN YÜKLENMESİ ── */}
                {onboardingStep === 3 && (
                  <div className="space-y-3.5">
                    <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/50 dark:border-teal-800/40 text-xs text-teal-900 dark:text-teal-200">
                      Milli Eğitim Bakanlığı mevzuatı gereği kurumumuza ibraz edilmesi gereken resmi evrakları lütfen yükleyiniz. (PDF / JPG formatında)
                    </div>

                    {/* Belge 1: Lisans / Mezuniyet Diploması */}
                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                          uploadedDocs.diploma
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                        }`}>
                          {uploadedDocs.diploma ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-gray-900 dark:text-white truncate">
                            1. Lisans / Mezuniyet Diploması
                          </div>
                          <div className="text-[10.5px] text-gray-500 dark:text-gray-400">
                            {uploadedDocs.diploma ? 'Yüklendi (2.4 MB · MEB Onaylı)' : 'Zorunlu Belge (PDF/Görsel)'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSimulateUpload('diploma')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 active:scale-95 transition-all cursor-pointer ${
                          uploadedDocs.diploma
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                        }`}
                      >
                        {uploadedDocs.diploma ? 'Değiştir' : 'Belge Yükle'}
                      </button>
                    </div>

                    {/* Belge 2: e-Devlet Adli Sicil Kaydı */}
                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                          uploadedDocs.sicil
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                        }`}>
                          {uploadedDocs.sicil ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-gray-900 dark:text-white truncate">
                            2. e-Devlet Adli Sicil Belgesi
                          </div>
                          <div className="text-[10.5px] text-gray-500 dark:text-gray-400">
                            {uploadedDocs.sicil ? 'Yüklendi (1.1 MB · Barkodlu Doğrulandı)' : 'Zorunlu Belge (Barkodlu PDF)'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSimulateUpload('sicil')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 active:scale-95 transition-all cursor-pointer ${
                          uploadedDocs.sicil
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                        }`}
                      >
                        {uploadedDocs.sicil ? 'Değiştir' : 'Belge Yükle'}
                      </button>
                    </div>

                    {/* Belge 3: Sağlık Kurulu Raporu */}
                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                          uploadedDocs.saglik
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                        }`}>
                          {uploadedDocs.saglik ? <CheckCircle2 size={20} /> : <FileCheck size={20} />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-gray-900 dark:text-white truncate">
                            3. Sağlık Kurulu Raporu
                          </div>
                          <div className="text-[10.5px] text-gray-500 dark:text-gray-400">
                            {uploadedDocs.saglik ? 'Yüklendi (1.8 MB · Sağlık Raporu)' : 'Öğretmenlik Görevine Uygunluk'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSimulateUpload('saglik')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 active:scale-95 transition-all cursor-pointer ${
                          uploadedDocs.saglik
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                        }`}
                      >
                        {uploadedDocs.saglik ? 'Değiştir' : 'Belge Yükle'}
                      </button>
                    </div>

                    {/* Belge 4: İkametgah / Yerleşim Yeri Belgesi */}
                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                          uploadedDocs.ikametgah
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                        }`}>
                          {uploadedDocs.ikametgah ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-gray-900 dark:text-white truncate">
                            4. İkametgah / Yerleşim Yeri Belgesi
                          </div>
                          <div className="text-[10.5px] text-gray-500 dark:text-gray-400">
                            {uploadedDocs.ikametgah ? 'Yüklendi (0.9 MB · e-Devlet)' : 'e-Devlet Barkodlu İkametgah'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSimulateUpload('ikametgah')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 active:scale-95 transition-all cursor-pointer ${
                          uploadedDocs.ikametgah
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                        }`}
                      >
                        {uploadedDocs.ikametgah ? 'Değiştir' : 'Belge Yükle'}
                      </button>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(4)}
                        className="w-full h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <span>Sonraki: Kalıcı Şifre & Onay</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── ADIM 4: GÜVENLİK, ŞİFRE & ONAY ── */}
                {onboardingStep === 4 && (
                  <div className="space-y-3.5">
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200">
                      İlk girişinizde okul idaresi tarafından size tanımlanan geçici şifrenin yerine kalıcı ve güvenli şifrenizi belirleyiniz.
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Yeni Kalıcı Şifre (En az 6 karakter)
                      </label>
                      <input
                        type="password"
                        value={onboardingNewPass}
                        onChange={(e) => setOnboardingNewPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Yeni Kalıcı Şifre (Tekrar)
                      </label>
                      <input
                        type="password"
                        value={onboardingNewPassConfirm}
                        onChange={(e) => setOnboardingNewPassConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    {/* KVKK & Taahhütname */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={onboardingKvkkAccepted}
                          onChange={(e) => setOnboardingKvkkAccepted(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded-md text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                          <span className="font-bold">KVKK ve Kurumsal Aydınlatma Metni</span>'ni okudum. Yüklediğim belgelerin ve beyan ettiğim bilgilerin doğruluğunu, Oxonom Okulları bünyesinde öğretmenlik yetkisiyle kullanacağımı taahhüt ederim.
                        </span>
                      </label>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                      <button
                        type="submit"
                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
                      >
                        <CheckCircle2 size={18} />
                        <span>Profili ve Belgeleri Tamamla & Onayla</span>
                      </button>
                    </div>
                  </div>
                )}
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
    <div className={`${theme} min-h-[100dvh] w-full bg-[#0A0D15] sm:bg-[#E2E8F0] sm:dark:bg-[#06090F] flex justify-center selection:bg-[#34D399]/30 selection:text-emerald-950 transition-colors duration-300 font-jakarta overscroll-none`}>
      {/* ── 390px MOBILE APP FIRST FRAME CONTAINER ── */}
      <div
        className="w-full sm:max-w-[390px] min-h-[100dvh] bg-[#F8FAFC] dark:bg-[#0A0D15] sm:shadow-2xl relative flex flex-col pb-20 sm:border-x border-gray-200/60 dark:border-gray-800/80 overflow-x-hidden overscroll-y-none"
      >
        <MobileHeader theme={theme} onToggleTheme={toggleTheme} />
        {pageContent}
        {!hideDock && <MobileFloatingDock activeTab="home" />}
      </div>
    </div>
  )
}
