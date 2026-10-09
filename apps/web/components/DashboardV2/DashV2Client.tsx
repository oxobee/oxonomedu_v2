'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
import ConnectBoardModal from './ConnectBoardModal'
import TeacherNotesModal from './TeacherNotesModal'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import {
  getAttendanceForClass,
  AttendanceRecord,
} from '@services/demo/attendanceService'

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
    // Default to 1-A (Özlem ZOR) as shown in the screenshot
    return ALL_CLASSROOMS.find((c) => c.code === '1-A') || ALL_CLASSROOMS[0]
  })

  // Modal Dialog States
  const [isClassSheetOpen, setIsClassSheetOpen] = useState(false)
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
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
    return getAttendanceForClass(selectedClass?.code || '1-A')
  })

  useEffect(() => {
    const refreshAttendance = () => {
      const data = getAttendanceForClass(selectedClass?.code || '1-A')
      setAttendanceData(data)
    }

    refreshAttendance()

    const handleAttendanceUpdated = (e: any) => {
      if (!e?.detail?.classCode || e.detail.classCode === selectedClass?.code) {
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

  // Boards for selected class (Synced from local storage / demo)
  const [localBoards, setLocalBoards] = useState<any[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oxonom_m_boards')
        if (raw) {
          setLocalBoards(JSON.parse(raw))
        }
      } catch (_) {}
    }
  }, [selectedClass?.code])

  const classBoards = useMemo(() => {
    const code = selectedClass?.code || '9-A'
    const fromStorage = localBoards.filter((b) => {
      const matchClass =
        b.className?.toLowerCase().includes(code.toLowerCase()) ||
        b.title?.toLowerCase().includes(code.toLowerCase()) ||
        b.title?.toLowerCase().includes('sınıf panosu')
      return matchClass
    })
    return fromStorage
  }, [localBoards, selectedClass?.code])

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
          return list
        }
      } catch (_) {}
      return []
    },
    refetchInterval: 3500,
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
          className="flex flex-col gap-4 p-4 w-full"
        >
          {/* ── HERO ALANI (Dark #0A0D15 Rounded Card matching screenshot) ── */}
          <motion.section
            variants={itemVariants}
            className="w-full bg-[#0A0D15] rounded-[30px] p-5 sm:p-6 space-y-4 sm:space-y-5 text-white shadow-xl border border-white/5 relative overflow-hidden"
          >
            {/* Animated Background Subtle Concentric Circles (Matching Profile visual language) */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none opacity-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
                className="w-full h-full relative"
              >
                <div className="absolute inset-0 rounded-full border border-teal-400/40" />
                <div className="absolute inset-6 rounded-full border border-white/10 border-dashed" />
                <div className="absolute inset-12 rounded-full border border-teal-400/30" />
              </motion.div>
            </div>

            {/* Subtle gradient sheen behind hero */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Top Row: Tag & Greetings on Left + Prominent Clickable Account Link on Right */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="space-y-1.5 min-w-0 flex-1">
                <span className="text-[11px] font-extrabold tracking-widest text-[#34D399] uppercase block">
                  ÖĞRETMEN ÇALIŞMA ALANI
                </span>
                <div className="text-xs sm:text-sm text-gray-400 font-medium leading-none pt-0.5">
                  Hoş Geldiniz,
                </div>
                <h1 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight leading-tight font-serif-display truncate">
                  {teacherName}
                </h1>
                <p className="text-[11px] text-gray-400 font-medium truncate">
                  {teacherProfile?.branch || 'Türk Dili ve Edebiyatı'} · Oxonom Okulları
                </p>
              </div>

              {/* Prominent, Clearly Noticeable & Clickable Account / Profile Button */}
              <Link
                href="/m-profile"
                className="group flex items-center gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 backdrop-blur-md transition-all shadow-md shrink-0 cursor-pointer"
                title="Hesap ve Profil Ayarları"
              >
                <div className="relative">
                  {teacherProfile?.avatarUrl || teacherProfile?.avatarImage ? (
                    <img
                      src={teacherProfile.avatarUrl || teacherProfile.avatarImage}
                      alt={teacherName}
                      className="w-10 h-10 rounded-xl object-cover border border-emerald-400/50 shadow-sm group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-[#0A0D15] flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                      {teacherInitials}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0A0D15]" />
                </div>
                <div className="text-left hidden xs:block sm:block pr-1">
                  <div className="text-[10px] text-gray-300 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span>Hesabım</span>
                    <Settings size={11} className="text-[#34D399] group-hover:rotate-45 transition-transform" />
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-[#34D399] transition-colors flex items-center gap-0.5">
                    <span>Profil</span>
                    <ChevronRight size={13} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Incomplete Profile Alert Banner (If profile completion is pending) */}
            {teacherProfile?.profileCompleted === false && (
              <div className="relative z-10 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <AlertCircle size={16} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-extrabold text-amber-200">
                      Profil & Evrak Tamamlama Bekleniyor
                    </div>
                    <div className="text-[11px] text-amber-300/80 truncate">
                      MEB resmi kaydınız için evraklarınızı yükleyin
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOnboardingModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-950 font-black text-xs shrink-0 active:scale-95 transition-all shadow-sm cursor-pointer"
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
                className="flex-1 bg-[#141824] hover:bg-[#1A2234] border border-white/10 rounded-2xl py-2.5 px-3.5 flex items-center justify-between text-left cursor-pointer active:scale-[0.98] transition-all shadow-inner group h-[50px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7.5 h-7.5 rounded-lg bg-teal-500/10 text-[#34D399] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <GraduationCap size={17} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 block leading-tight font-medium">
                      Sınıf
                    </span>
                    <span className="text-sm font-bold text-white block leading-tight truncate">
                      {selectedClass.code}
                    </span>
                  </div>
                </div>
                <ChevronDown size={15} className="text-gray-400 shrink-0 group-hover:text-white transition-colors" />
              </button>

              {/* Notlar Butonu (Bright Mint/Teal Button matching screenshot) */}
              <button
                type="button"
                onClick={() => setIsNotesModalOpen(true)}
                className="bg-[#34D399] hover:bg-[#2ee59d] text-[#0A0D15] font-bold text-sm px-4.5 py-2.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-md shrink-0 h-[50px]"
              >
                <FileText size={16} strokeWidth={2.5} className="text-[#0A0D15]" />
                <span>Notlar</span>
              </button>
            </div>
          </motion.section>

          {/* ── CARD 1: ÖĞRENCİ, AKILLI TAHTA & YOKLAMA ── */}
          <motion.section
            variants={itemVariants}
            className="w-full bg-white dark:bg-[#121826] rounded-[28px] p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4"
          >
            {/* Top Row: 2 Metrics */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800">
              {/* Metric 1: Öğrenci */}
              <Link
                href="/m-student"
                className="pr-4 flex flex-col active:scale-98 transition-transform group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight group-hover:text-purple-600 transition-colors">
                    {selectedClass.student_count || 30}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] dark:bg-purple-950/60 text-[#6366F1] dark:text-purple-300 flex items-center justify-center">
                    <Users size={17} />
                  </div>
                </div>
                <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white mt-1">
                  Öğrenci
                </span>
                <span className="text-[11px] text-gray-400 font-normal">
                  Kayıtlı ve aktif
                </span>
              </Link>

              {/* Metric 2: Akıllı Tahta (Links to /m-boards) */}
              <Link
                href="/m-boards"
                className="pl-4 flex flex-col active:scale-98 transition-transform group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight group-hover:text-teal-600 transition-colors">
                    {classBoards.length}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#E6F9F5] dark:bg-teal-950/60 text-[#0D9488] dark:text-teal-300 flex items-center justify-center">
                    <Tv size={17} />
                  </div>
                </div>
                <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white mt-1">
                  Akıllı Tahta
                </span>
                <span className="text-[11px] text-gray-400 font-normal flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block animate-pulse" />
                  {isBoardConnected ? 'Bağlantı Aktif' : 'Kullanıma hazır'}
                </span>
              </Link>
            </div>

            {/* Yoklama Divider: Dinamik Canlı Veri veya "YOKLAMA YAPILMADI" Uyarısı */}
            <div className="border-t border-gray-100 dark:border-gray-800/80 pt-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">Yoklama</span>
                  {attendanceData?.taken ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      Tamamlandı • {attendanceData.updatedAt}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      Bekliyor
                    </span>
                  )}
                </div>
                <span className="text-gray-400 text-xs">
                  Toplam {attendanceData?.totalCount || selectedClass.student_count || 30} öğrenci
                </span>
              </div>

              {!attendanceData || !attendanceData.taken ? (
                /* ── YOKLAMA YAPILMADI UYARI KARTI (Temayla Uyumlu, Tıklanınca Yoklamaya Gider) ── */
                <Link
                  href={`/m-student?openAttendance=true&class=${selectedClass.code}`}
                  className="w-full p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 flex items-center justify-between gap-3 active:scale-[0.98] transition-all group cursor-pointer hover:bg-amber-500/15"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <AlertCircle size={20} className="animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-wide text-amber-700 dark:text-amber-300 uppercase">
                          YOKLAMA YAPILMADI
                        </span>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      </div>
                      <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 font-medium truncate mt-0.5">
                        Bugünkü yoklamayı başlatmak için dokunun
                      </p>
                    </div>
                  </div>
                  <div className="h-8 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#0A0D15] font-black text-xs flex items-center gap-1 shrink-0 shadow-sm transition-colors">
                    <span>Yoklama Al</span>
                    <ChevronRight size={13} strokeWidth={2.5} />
                  </div>
                </Link>
              ) : (
                /* ── CANLI YOKLAMA ÇUBUĞU & KUTULARI (Görsel Tasarıma Birebir Uygun) ── */
                <div className="space-y-3">
                  {/* Split Continuous Progress Bar */}
                  <div className="w-full h-3 bg-gray-100 dark:bg-[#1E293B] rounded-full overflow-hidden flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          ((attendanceData.presentCount || 0) /
                            (attendanceData.totalCount || selectedClass.student_count || 30)) *
                          100
                        }%`,
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-[#10B981] dark:bg-[#34D399] rounded-l-full"
                      title={`${attendanceData.presentCount} Mevcut`}
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          ((attendanceData.absentCount || 0) /
                            (attendanceData.totalCount || selectedClass.student_count || 30)) *
                          100
                        }%`,
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                      className="h-full bg-[#EF4444] rounded-r-full"
                      title={`${attendanceData.absentCount} Eksik`}
                    />
                  </div>

                  {/* Dual Badges: [X Mevcut] / [Y Eksik] */}
                  <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                    <Link
                      href={`/m-student?openAttendance=true&class=${selectedClass.code}`}
                      className="bg-[#E8F8F0] dark:bg-[#06241D] text-[#059669] dark:text-[#34D399] font-bold text-xs py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-2xl flex items-center gap-2 border border-emerald-200/60 dark:border-emerald-600/30 active:scale-98 transition-all hover:border-emerald-500"
                    >
                      <span className="text-lg sm:text-xl font-black text-[#059669] dark:text-[#34D399]">
                        {attendanceData.presentCount}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#059669] dark:text-[#34D399]">
                        Mevcut
                      </span>
                    </Link>
                    <Link
                      href={`/m-student?openAttendance=true&class=${selectedClass.code}`}
                      className="bg-[#FDECEC] dark:bg-[#250F16] text-[#DC2626] dark:text-[#F87171] font-bold text-xs py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-2xl flex items-center gap-2 border border-rose-200/60 dark:border-rose-600/30 active:scale-98 transition-all hover:border-rose-500"
                    >
                      <span className="text-lg sm:text-xl font-black text-[#DC2626] dark:text-[#F87171]">
                        {attendanceData.absentCount}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#DC2626] dark:text-[#F87171]">
                        Eksik
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          {/* ── SECTION DIVIDER: HIZLI ERİŞİM & ÇALIŞMA ALANI ── */}
          <motion.div variants={itemVariants} className="pt-2 pb-0.5 px-1 flex items-center gap-2.5">
            <div className="w-4 h-1 bg-[#34D399] rounded-full" />
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-gray-500 dark:text-gray-400">
              HIZLI ERİŞİM & ÇALIŞMA ALANI
            </span>
            <div className="flex-1 h-[1px] bg-gray-200/80 dark:bg-gray-800" />
          </motion.div>

          {/* ── CARD 2: AKILLI TAHTALAR ── */}
          <motion.section
            variants={itemVariants}
            className="w-full bg-white dark:bg-[#121826] rounded-[26px] p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3.5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E6F9F5] dark:bg-teal-950/60 text-[#0D9488] dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Tv size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    Akıllı Tahtalar
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedClass.code} Sınıf Tahtası · Hazır
                  </p>
                </div>
              </div>

              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs px-2.5 py-1 rounded-full">
                {classBoards.length} tahta
              </span>
            </div>

            {/* Featured Subcard (Shows the latest created board for the selected class with Date & Time, or Empty State) */}
            {latestClassBoard ? (
              <div className="bg-[#F8FAFC] dark:bg-[#0A0D15] p-4 rounded-2xl border border-gray-200/60 dark:border-gray-800/80 space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-snug">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0 animate-pulse" />
                    <span className="truncate">{latestClassBoard.title}</span>
                  </div>

                  {/* Date & Time clearly displayed as requested */}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                      <Clock size={11} />
                      <span>{latestClassBoard.time}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      <Calendar size={11} />
                      <span>{latestClassBoard.date}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    {latestClassBoard.description || 'İnteraktif çizim ve ders sunumu için hazır'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const url = latestClassBoard.url || `/board/${latestClassBoard.id}`
                    window.open(url, '_blank')
                  }}
                  className="w-full py-3 px-4 bg-[#111827] dark:bg-[#1E293B] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 transition-all"
                >
                  <span>Tahtayı Aç</span>
                  <ArrowUpRight size={15} />
                </button>
              </div>
            ) : (
              <div className="bg-[#F8FAFC] dark:bg-[#0A0D15] p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800/80 text-center flex flex-col items-center justify-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Tv size={20} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                    Henüz Ders Tahtası Oluşturulmadı
                  </h4>
                  <p className="text-[11px] text-gray-400 max-w-xs">
                    Sınıfınız için ilk akıllı ders tahtasını oluşturup derse hemen başlayabilirsiniz.
                  </p>
                </div>
                <Link
                  href="/m-boards?new=true"
                  className="mt-1 px-3.5 py-2 rounded-xl bg-[#34D399] hover:bg-[#2ee59d] text-[#0A0D15] font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  <span>+ İlk Tahtayı Oluştur</span>
                </Link>
              </div>
            )}

            {/* Bottom Links */}
            <div className="flex items-center justify-between pt-1 px-1 text-xs">
              <Link
                href="/m-boards?new=true"
                className="text-[#0D9488] dark:text-teal-400 font-bold hover:underline"
              >
                + Yeni Tahta Oluştur
              </Link>
              <Link
                href="/m-boards"
                className="text-gray-600 dark:text-gray-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Tüm Tahtaları Gör</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </motion.section>

          {/* ── CARD 3: VERİLEN ÖDEVLER ── */}
          <motion.section
            variants={itemVariants}
            className="w-full bg-white dark:bg-[#121826] rounded-[24px] p-4.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between gap-3.5"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#EEF0FF] dark:bg-purple-950/60 text-[#6366F1] dark:text-purple-300 flex items-center justify-center shrink-0">
                <CheckSquare size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  Verilen Ödevler
                </h3>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {assignments.length > 0 ? `${assignments.length} aktif · Teslimler sürüyor` : 'Henüz ödev verilmedi'}
                </p>
              </div>
            </div>

            <Link
              href="/m-homework"
              className="bg-[#EEF0FF] dark:bg-indigo-950/50 text-[#4338CA] dark:text-indigo-300 font-bold text-xs px-4 py-2 rounded-full flex items-center gap-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shrink-0"
            >
              <span>Ödevlere Git</span>
              <ChevronRight size={13} />
            </Link>
          </motion.section>

          {/* ── CARD 4: SINIFLAR & ŞUBELER ── */}
          <motion.section
            variants={itemVariants}
            className="w-full bg-white dark:bg-[#121826] rounded-[24px] p-4.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between gap-3.5"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF4ED] dark:bg-orange-950/60 text-[#EA580C] dark:text-orange-300 flex items-center justify-center shrink-0">
                <Users size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  Sınıflar & Şubeler
                </h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {siblingClassrooms.map((cls) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => handleSelectClass(cls)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                        cls.code === selectedClass.code
                          ? 'bg-[#FFF4ED] dark:bg-orange-950/50 border border-[#FDBA74] dark:border-orange-700 text-[#C2410C] dark:text-orange-200'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium'
                      }`}
                    >
                      {cls.code} (30)
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsClassSheetOpen(true)}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0 cursor-pointer"
              title="Tüm Sınıfları Gör"
            >
              <ChevronRight size={15} />
            </button>
          </motion.section>

          {/* ── CARD 5: KAYNAKLAR & ARŞİV ── */}
          <motion.section
            variants={itemVariants}
            className="w-full bg-white dark:bg-[#121826] rounded-[24px] p-4.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between gap-3.5"
          >
            <Link href="/dash/library" className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] dark:bg-sky-950/60 text-[#2563EB] dark:text-sky-300 flex items-center justify-center shrink-0">
                <FolderOpen size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  Kaynaklar & Arşiv
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                  Ders içerikleri, çalışma kağıtları, etkinlikler
                </p>
              </div>
            </Link>

            <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs px-3 py-1 rounded-full shrink-0">
              124 kaynak
            </span>
          </motion.section>

          {/* ── SECTION: AÇIK AKILLI TAHTALARIM (QR İLE BAĞLANILAN OTURUMLAR) ── */}
          <motion.section variants={itemVariants} className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <QrCode size={16} className="text-emerald-500" />
                    <span>Açık Akıllı Tahtalarım</span>
                  </h2>
                  {activeQrBoards.length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {activeQrBoards.length} QR Oturumu Açık
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      0 Açık Oturum
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  QR kod ile bağlandığınız ve açık kalan akıllı tahta oturumları
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsConnectModalOpen(true)}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus size={13} />
                <span>Tahtaya Bağlan</span>
              </button>
            </div>

            {/* Content: Active QR Sessions or Connect Prompt */}
            {activeQrBoards.length > 0 ? (
              <div className="space-y-2.5">
                {activeQrBoards.map((board) => {
                  const isCurrentLocking = lockingSessionId === board.sessionId
                  const isCurrentLoggingOut = loggingOutSessionId === board.sessionId
                  const remoteUrl = `/remote?session=${encodeURIComponent(board.sessionId)}`

                  return (
                    <div
                      key={board.sessionId}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#121826] border border-emerald-500/30 dark:border-emerald-500/20 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col gap-3 group"
                    >
                      {/* Top Row: Board Identity & Live Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Tv size={17} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs sm:text-[13px] font-bold text-gray-900 dark:text-white truncate">
                              {board.boardName || 'Oxonom Akıllı Tahta'}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                Kod: {board.code}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                • {board.className || selectedClass?.name || '1-A Şubesi'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full shrink-0 border border-emerald-200/50 dark:border-emerald-800/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          QR ile Açık
                        </span>
                      </div>

                      {/* Info Row: Teacher & Status */}
                      <div className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <GraduationCap size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="font-medium text-gray-900 dark:text-gray-200 truncate">
                            {board.teacherName || teacherName}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                          Oturum Aktif
                        </span>
                      </div>

                      {/* Action Buttons: Remote Control, Lock Board, Logout */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {/* 1. Kumandayı Aç */}
                        <a
                          href={remoteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs"
                          title="Telefon Kumandasını Aç"
                        >
                          <Smartphone size={13} />
                          <span>Kumanda</span>
                        </a>

                        {/* 2. Tahtayı Kilitle */}
                        <button
                          type="button"
                          onClick={() => handleLockBoard(board.sessionId)}
                          disabled={isCurrentLocking}
                          className="py-2 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 active:scale-95 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/50 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                          title="Akıllı Tahtayı Kilitle"
                        >
                          {isCurrentLocking ? (
                            <RotateCw size={13} className="animate-spin text-amber-600" />
                          ) : (
                            <Lock size={13} />
                          )}
                          <span>Kilitle</span>
                        </button>

                        {/* 3. Oturumu Kapat */}
                        <button
                          type="button"
                          onClick={() => handleLogoutBoard(board.sessionId)}
                          disabled={isCurrentLoggingOut}
                          className="py-2 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                          title="Tahtadaki Oturumu Kapat"
                        >
                          {isCurrentLoggingOut ? (
                            <RotateCw size={13} className="animate-spin text-rose-600" />
                          ) : (
                            <LogOut size={13} />
                          )}
                          <span>Çıkış</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Empty State: Interactive QR Connect Prompt */
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <QrCode size={24} />
                </div>

                <div className="max-w-xs space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                    Açık QR Oturumu Bulunmuyor
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    Sınıftaki akıllı tahtayı telefonunuzdan yönetmek için tahta ekranında gösterilen QR kodu okutun veya 6 haneli kodu girin.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsConnectModalOpen(true)}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <QrCode size={14} />
                    <span>QR ile Tahtaya Bağlan</span>
                  </button>

                  <a
                    href="/pano"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                    title="Yeni bir akıllı tahta (Pano) sekmesi aç"
                  >
                    <span>Tahta Aç</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            )}
          </motion.section>

          {/* ── SECTION: TAHTAYA BAĞLAN CTA BUTONU ── */}
          <motion.section variants={itemVariants} className="pt-2">
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="w-full p-4 rounded-2xl bg-[#0A0D15] dark:bg-[#131C31] hover:bg-black text-white flex items-center justify-between gap-3.5 shadow-md active:scale-98 transition-all cursor-pointer group border border-gray-800/80"
            >
              <div className="flex items-center gap-3.5 min-w-0 text-left">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-[#34D399] shrink-0 group-hover:scale-105 transition-transform">
                  <QrCode size={22} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-white tracking-tight">
                      Tahtaya Bağlan
                    </span>
                    {isBoardConnected && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#10B981] text-white">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    QR kod veya 6 haneli kod ile bağlanın
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                <ArrowUpRight size={16} className="text-white" />
              </div>
            </button>
          </motion.section>

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

      <ConnectBoardModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
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
