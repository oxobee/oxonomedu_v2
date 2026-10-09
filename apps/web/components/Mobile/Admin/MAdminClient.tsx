'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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
} from 'lucide-react'
import toast from 'react-hot-toast'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileAdminDock from './MobileAdminDock'
import MobileAdminMoreSheet from './MobileAdminMoreSheet'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
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
  const searchParams = useSearchParams()
  const { signOut } = useAuth()
  const session = useLHSession() as any
  const user = session?.data?.user

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
    name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Dr. Uğur UĞURLU',
    title: 'Okul Müdürü · Kurum Yetkilisi',
    email: user?.email || 'mudur@oxonom.com',
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
  const [editPhone, setEditPhone] = useState('+90 532 999 2200')
  const [editEmail, setEditEmail] = useState('mudur@oxonom.com')

  // Load from localStorage or session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_active_admin_session')
        if (saved) {
          const parsed = JSON.parse(saved)
          const fullName = parsed.name || (parsed.first_name ? `${parsed.first_name} ${parsed.last_name || ''}`.trim() : 'Dr. Uğur UĞURLU')
          setAdminProfile((prev) => ({
            ...prev,
            name: fullName,
            email: parsed.email || prev.email,
            phone: parsed.phone || prev.phone,
            tcNo: parsed.tcNo || prev.tcNo,
            username: parsed.username || prev.username,
            title: parsed.title || prev.title,
            loginTime: parsed.loginTime ? `Bugün, ${parsed.loginTime}` : prev.loginTime,
          }))
          setEditName(fullName)
          setEditPhone(parsed.phone || '+90 532 999 2200')
          setEditEmail(parsed.email || 'mudur@oxonom.com')
        }
      } catch (_) {}

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
  }, [])

  // Sync if session user updates
  useEffect(() => {
    if (user?.first_name) {
      const fullName = `${user.first_name} ${user.last_name || ''}`.trim()
      setAdminProfile((prev) => ({
        ...prev,
        name: fullName,
        email: user.email || prev.email,
      }))
      setEditName(fullName)
      setEditEmail(user.email || 'mudur@oxonom.com')
    }
  }, [user])

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    const updated = {
      ...adminProfile,
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
    }
    setAdminProfile(updated)
    setIsEditingProfile(false)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'oxonom_active_admin_session',
          JSON.stringify({
            ...updated,
            first_name: editName.split(' ')[0],
            last_name: editName.split(' ').slice(1).join(' '),
          })
        )
      } catch (_) {}
    }
    toast.success('Yönetici profil bilgileri başarıyla güncellendi.')
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
  const adminEmail = adminProfile.email

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState<number>(10) // 10: Necla Görer, 20: Fevzi Kalkancı

  // Personel & Öğretmen İzin Talepleri state
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 'leave-1',
      name: 'Meral ÖZDEN',
      branch: '3-F Sınıf Öğretmeni',
      type: 'Mazeret İzni',
      duration: 'Bugün (1 Gün)',
      reason: 'Ailevi mazeret izni',
      status: 'pending' as 'pending' | 'approved' | 'rejected',
    },
    {
      id: 'leave-2',
      name: 'Hivda SADAK',
      branch: '4-A Sınıf Öğretmeni',
      type: 'Sağlık Raporu',
      duration: 'Bugün - Yarın (2 Gün)',
      reason: 'Devlet Hastanesi KBB İstirahat',
      status: 'approved' as 'pending' | 'approved' | 'rejected',
    },
  ])

  const handleApproveLeave = (id: string, name: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'approved' } : l))
    )
    toast.success(`${name} öğretmeninin izin talebi onaylandı.`)
  }

  const handleRejectLeave = (id: string, name: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'rejected' } : l))
    )
    toast.error(`${name} öğretmeninin izin talebi reddedildi.`)
  }

  // ── EKSİK ATAMA VE ÇAKIŞMA YÖNETİMİ STATE ──
  const [isAssignTeacherModalOpen, setIsAssignTeacherModalOpen] = useState(false)
  const [isConflictReportModalOpen, setIsConflictReportModalOpen] = useState(false)

  // Context-aware target class & subject
  const targetMissingClass = selectedOrgId === 10 ? '3-B' : '7-B'
  const targetMissingSubject = selectedOrgId === 10 ? 'Müzik' : 'Görsel Sanatlar'

  // Available teachers for active school
  const availableTeachers = useMemo(() => {
    return getOrgTeachers(selectedOrgId)
  }, [selectedOrgId])

  // Active periods for current school
  const activePeriods = useMemo(() => {
    return selectedOrgId === 10 ? PRIMARY_PERIODS : MIDDLE_PERIODS
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
      isResolved: false,
      assignedTeacher: selectedOrgId === 10 ? 'Fatma MARANGOZ' : 'Aybüke ÇELİK',
      assignedDay: 'wed',
      assignedPeriod: 5,
      assignedRoom: selectedOrgId === 10 ? 'Müzik Dersliği' : 'Görsel Sanatlar Atölyesi',
      targetClass: targetMissingClass,
      targetSubject: targetMissingSubject,
    }
  })

  // Assign form inputs
  const [formAssignTeacher, setFormAssignTeacher] = useState('')
  const [formAssignDay, setFormAssignDay] = useState<DayKey>('wed')
  const [formAssignPeriod, setFormAssignPeriod] = useState<number>(5)
  const [formAssignRoom, setFormAssignRoom] = useState('Müzik Dersliği')
  const [formSendSms, setFormSendSms] = useState(true)
  const [formSmartBoard, setFormSmartBoard] = useState(true)

  // Current Schedule Dataset with localStorage Sync for Conflict Verification
  const [scheduleList, setScheduleList] = useState<ScheduleEntry[]>(() => {
    return INITIAL_SCHEDULE_ENTRIES
  })

  // Reload missing assignment and schedule when selectedOrgId changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedMissing = localStorage.getItem(`oxonom_admin_missing_assign_${selectedOrgId}`)
        if (savedMissing) {
          const parsed = JSON.parse(savedMissing)
          if (parsed && typeof parsed.isResolved === 'boolean') {
            setMissingAssignment(parsed)
          } else {
            setMissingAssignment({
              isResolved: false,
              assignedTeacher: selectedOrgId === 10 ? 'Fatma MARANGOZ' : 'Aybüke ÇELİK',
              assignedDay: 'wed',
              assignedPeriod: 5,
              assignedRoom: selectedOrgId === 10 ? 'Müzik Dersliği' : 'Görsel Sanatlar Atölyesi',
              targetClass: selectedOrgId === 10 ? '3-B' : '7-B',
              targetSubject: selectedOrgId === 10 ? 'Müzik' : 'Görsel Sanatlar',
            })
          }
        } else {
          setMissingAssignment({
            isResolved: false,
            assignedTeacher: selectedOrgId === 10 ? 'Fatma MARANGOZ' : 'Aybüke ÇELİK',
            assignedDay: 'wed',
            assignedPeriod: 5,
            assignedRoom: selectedOrgId === 10 ? 'Müzik Dersliği' : 'Görsel Sanatlar Atölyesi',
            targetClass: selectedOrgId === 10 ? '3-B' : '7-B',
            targetSubject: selectedOrgId === 10 ? 'Müzik' : 'Görsel Sanatlar',
          })
        }

        const savedSchedule = localStorage.getItem(`oxonom_admin_schedule_${selectedOrgId}`)
        if (savedSchedule) {
          const parsedSch = JSON.parse(savedSchedule)
          if (Array.isArray(parsedSch) && parsedSch.length > 0) {
            setScheduleList(parsedSch)
            return
          }
        }
      } catch (_) {}
    }
    setScheduleList(INITIAL_SCHEDULE_ENTRIES)
  }, [selectedOrgId])

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
    setFormAssignTeacher(missingAssignment.assignedTeacher || availableTeachers[0]?.name || '')
    setFormAssignDay(missingAssignment.assignedDay || 'wed')
    setFormAssignPeriod(missingAssignment.assignedPeriod || 5)
    setFormAssignRoom(
      missingAssignment.assignedRoom ||
        (selectedOrgId === 10 ? 'Müzik Dersliği' : 'Görsel Sanatlar Atölyesi')
    )
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
        localStorage.setItem(
          `oxonom_admin_missing_assign_${selectedOrgId}`,
          JSON.stringify(newRecord)
        )
      } catch (_) {}
    }

    // Also inject/update slot in schedule dataset
    const newEntry: ScheduleEntry = {
      id: `sc-assign-${selectedOrgId}-${Date.now()}`,
      orgId: selectedOrgId,
      day: formAssignDay,
      period: Number(formAssignPeriod),
      classCode: targetMissingClass,
      subject: targetMissingSubject,
      teacherName: formAssignTeacher,
      roomName: formAssignRoom,
      color: 'pink',
      isSmartBoardActive: formSmartBoard,
    }

    const updatedSchedule = [
      ...scheduleList.filter(
        (item) =>
          !(item.classCode === targetMissingClass && item.subject === targetMissingSubject)
      ),
      newEntry,
    ]
    setScheduleList(updatedSchedule)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `oxonom_admin_schedule_${selectedOrgId}`,
          JSON.stringify(updatedSchedule)
        )
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

  const handleResetAssignment = () => {
    const defaultTeacher = selectedOrgId === 10 ? 'Fatma MARANGOZ' : 'Aybüke ÇELİK'
    const defaultRoom = selectedOrgId === 10 ? 'Müzik Dersliği' : 'Görsel Sanatlar Atölyesi'
    const resetRecord = {
      isResolved: false,
      assignedTeacher: defaultTeacher,
      assignedDay: 'wed' as DayKey,
      assignedPeriod: 5,
      assignedRoom: defaultRoom,
      targetClass: targetMissingClass,
      targetSubject: targetMissingSubject,
    }
    setMissingAssignment(resetRecord)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`oxonom_admin_missing_assign_${selectedOrgId}`)
        const filtered = scheduleList.filter(
          (item) =>
            !(item.classCode === targetMissingClass && item.subject === targetMissingSubject)
        )
        setScheduleList(filtered)
        localStorage.setItem(
          `oxonom_admin_schedule_${selectedOrgId}`,
          JSON.stringify(filtered)
        )
      } catch (_) {}
    }
    toast('Görevlendirme kaldırıldı, durum tekrar bekliyor olarak güncellendi.', {
      icon: '🔄',
    })
  }

  const activeOrg = SCHOOL_ORGS.find((o) => o.id === selectedOrgId) || SCHOOL_ORGS[0]

  const showUnavailableToast = (featureName: string) => {
    toast(
      (t) => (
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs text-gray-900 dark:text-white">
              {featureName}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Bu modül henüz sisteme eklenmemiştir. Sırayla geliştirilmektedir.
            </div>
          </div>
        </div>
      ),
      {
        duration: 3500,
        style: {
          borderRadius: '16px',
          background: theme === 'dark' ? '#121826' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#0F172A',
          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        },
      }
    )
  }

  const getUrl = (path: string) => {
    return orgSlug ? `/orgs/${orgSlug}${path}` : path
  }

  const pageContent = (
    <div className="flex flex-col flex-1 w-full pb-6">
      {/* ── STAGGERED DASHBOARD ITEMS ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col flex-1 w-full dash-stagger-items"
      >
        {/* ── 1. OKUL / KURUM HERO KARTI (ZARİF ANİMASYONLU ÇEMBERLER & FERAH DÜZEN) ── */}
        <section className="px-4 pt-3">
          <div className="bg-[#0B0F19] rounded-[28px] p-4 sm:p-5 text-white border border-emerald-500/20 shadow-2xl relative overflow-hidden">
            {/* ── A. SUBTLE ANIMATED CONCENTRIC CIRCLE / ORBIT SYSTEM ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              {/* Gentle Emerald Glow Core */}
              <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

              {/* Primary Top-Right Concentric Orbit Rings (Slow Linear Clockwise Rotation) */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
                className="absolute -right-20 -top-20 w-96 h-96 pointer-events-none"
              >
                <svg
                  viewBox="0 0 384 384"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full opacity-30"
                >
                  {/* Circle 1 - Outer faint dashed */}
                  <circle
                    cx="192"
                    cy="192"
                    r="180"
                    stroke="#34D399"
                    strokeWidth="0.8"
                    strokeDasharray="3 6"
                    strokeOpacity="0.25"
                  />
                  {/* Circle 2 - Continuous subtle line */}
                  <circle
                    cx="192"
                    cy="192"
                    r="145"
                    stroke="#FFFFFF"
                    strokeWidth="0.7"
                    strokeOpacity="0.12"
                  />
                  {/* Circle 3 - Emerald Accent dotted */}
                  <circle
                    cx="192"
                    cy="192"
                    r="110"
                    stroke="#10B981"
                    strokeWidth="1"
                    strokeDasharray="6 8"
                    strokeOpacity="0.3"
                  />
                  {/* Circle 4 - Inner fine line */}
                  <circle
                    cx="192"
                    cy="192"
                    r="75"
                    stroke="#34D399"
                    strokeWidth="0.8"
                    strokeOpacity="0.2"
                  />
                  {/* Circle 5 - Core ring */}
                  <circle
                    cx="192"
                    cy="192"
                    r="42"
                    stroke="#34D399"
                    strokeWidth="1"
                    strokeDasharray="2 4"
                    strokeOpacity="0.35"
                  />
                  {/* Orbiting Satellite Dots */}
                  <circle cx="192" cy="12" r="2.5" fill="#34D399" fillOpacity="0.6" />
                  <circle cx="302" cy="192" r="2" fill="#10B981" fillOpacity="0.7" />
                  <circle cx="117" cy="192" r="1.5" fill="#A7F3D0" fillOpacity="0.5" />
                  <circle cx="234" cy="192" r="1.5" fill="#34D399" fillOpacity="0.8" />
                </svg>
              </motion.div>

              {/* Secondary Bottom-Left Counter-Rotating Orbit Rings */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 160, repeat: Infinity, ease: 'linear' }}
                className="absolute -left-20 -bottom-24 w-80 h-80 pointer-events-none"
              >
                <svg
                  viewBox="0 0 320 320"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full opacity-20"
                >
                  <circle
                    cx="160"
                    cy="160"
                    r="150"
                    stroke="#FFFFFF"
                    strokeWidth="0.6"
                    strokeOpacity="0.1"
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r="115"
                    stroke="#34D399"
                    strokeWidth="0.8"
                    strokeDasharray="4 8"
                    strokeOpacity="0.2"
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r="80"
                    stroke="#10B981"
                    strokeWidth="0.7"
                    strokeOpacity="0.15"
                  />
                  <circle cx="275" cy="160" r="2" fill="#34D399" fillOpacity="0.5" />
                </svg>
              </motion.div>

              {/* Gentle Breathing Center Pulse Ring */}
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.12, 0.24, 0.12],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -right-8 -top-8 w-60 h-60 rounded-full border border-emerald-400/25 pointer-events-none"
              />

              {/* Subtle Linear Grid Texture */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 100% 0%,rgba(52,211,153,0.3) 0%,rgba(10,13,21,0) 65%),linear-gradient(45deg,rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(-45deg,rgba(255,255,255,.03) 1px,transparent 1px)',
                  backgroundSize: 'auto,24px 24px,24px 24px',
                }}
              />
            </div>

            {/* ── B. LOGGED-IN ADMINISTRATOR PROFILE ROW (FERAH & TIKLANABİLİR) ── */}
            <div
              onClick={() => setIsAdminProfileModalOpen(true)}
              className="relative z-10 flex items-center justify-between gap-3 cursor-pointer group p-1 -m-1 rounded-2xl hover:bg-white/[0.04] transition-all select-none"
              title="Yönetici hesap detaylarını görüntüle"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Admin Avatar with Online Dot */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#10B981] via-[#059669] to-[#047857] text-white font-black text-sm flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform border border-emerald-400/20">
                    {adminName
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0B0F19] shadow-xs" />
                </div>

                {/* Name, Role & Account Link */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-[14px] font-black text-white group-hover:text-emerald-300 transition-colors tracking-tight leading-tight">
                      {adminName}
                    </h3>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider">
                      MÜDÜR
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 font-medium">
                    <span className="truncate">Kurum Yetkilisi</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600 shrink-0" />
                    <span className="text-emerald-400 font-bold text-[10.5px] group-hover:underline flex items-center gap-0.5 shrink-0">
                      Hesap &gt;
                    </span>
                  </div>
                </div>
              </div>

              {/* Online Status Pill */}
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full shadow-xs group-hover:border-emerald-400 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Çevrim İçi</span>
                </span>
                <span className="text-[9.5px] font-semibold text-gray-400/90 tracking-wide">
                  Tam Yetkili
                </span>
              </div>
            </div>

            {/* ── C. REFINED SUBTLE SEPARATOR ── */}
            <div className="relative z-10 my-3.5 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* ── D. ENHANCED MODERN SCHOOL SELECTOR ── */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2 px-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Building2 size={12} className="text-emerald-400" />
                  <span>Aktif Kurum Seçimi</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-lg">
                  {activeOrg.grades}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/[0.08] backdrop-blur-md">
                {/* Tab 1: Necla Görer İlkokulu */}
                <button
                  type="button"
                  onClick={() => setSelectedOrgId(10)}
                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedOrgId === 10
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <School
                      size={14}
                      className={selectedOrgId === 10 ? 'text-white' : 'text-gray-500'}
                    />
                    <span className="text-[11.5px] font-extrabold truncate">
                      Necla Görer
                    </span>
                  </div>
                  <div
                    className={`text-[9.5px] mt-1 font-medium truncate ${
                      selectedOrgId === 10 ? 'text-emerald-100' : 'text-gray-500'
                    }`}
                  >
                    1, 2, 3 ve 4. Sınıflar
                  </div>
                </button>

                {/* Tab 2: Şair Fevzi Kutlu Kalkancı Ortaokulu */}
                <button
                  type="button"
                  onClick={() => setSelectedOrgId(20)}
                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedOrgId === 20
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-950/50 border border-indigo-400/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <School
                      size={14}
                      className={selectedOrgId === 20 ? 'text-white' : 'text-gray-500'}
                    />
                    <span className="text-[11.5px] font-extrabold truncate">
                      Fevzi Kutlu
                    </span>
                  </div>
                  <div
                    className={`text-[9.5px] mt-1 font-medium truncate ${
                      selectedOrgId === 20 ? 'text-indigo-100' : 'text-gray-500'
                    }`}
                  >
                    5, 6, 7 ve 8. Sınıflar
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. OKUL İSTATİSTİKLERİ (4 ANA METRİK KARTI) ── */}
        <section className="px-4 mt-3.5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Okul İstatistikleri
            </h3>
            <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
              Canlı Veri
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Toplam Öğrenci Sayısı */}
            <Link
              href={getUrl('/m-admin-students')}
              className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-2xl p-3.5 shadow-xs hover:border-[#34D399]/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <GraduationCap size={17} />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp size={11} /> %4
                </span>
              </div>
              <div className="text-xl font-black text-gray-900 dark:text-white">
                {selectedOrgId === 10 ? '348' : '412'}
              </div>
              <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                Toplam Öğrenci
              </div>
            </Link>

            {/* 2. Toplam Öğretmen Sayısı (Aktif Link to /m-admin-teachers) */}
            <Link
              href={getUrl('/m-admin-teachers')}
              className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-2xl p-3.5 shadow-xs transition-all cursor-pointer hover:border-[#34D399]/50 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Briefcase size={17} />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Tam Kadro
                </span>
              </div>
              <div className="text-xl font-black text-gray-900 dark:text-white">
                {selectedOrgId === 10 ? '24' : '31'}
              </div>
              <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                Toplam Öğretmen
              </div>
            </Link>

            {/* 3. Sınıf ve Şube Sayısı (Aktif Link to /m-admin-classes) */}
            <Link
              href={getUrl('/m-admin-classes')}
              className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-2xl p-3.5 shadow-xs transition-all cursor-pointer hover:border-[#34D399]/50 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Building2 size={17} />
                </div>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                  {selectedOrgId === 10 ? '1–4. Sınıf' : '5–8. Sınıf'}
                </span>
              </div>
              <div className="text-xl font-black text-gray-900 dark:text-white">
                {selectedOrgId === 10 ? '12 Şube' : '16 Şube'}
              </div>
              <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                Sınıf & Şube
              </div>
            </Link>

            {/* 4. Aktif Veli Sayısı */}
            <div
              onClick={() => showUnavailableToast('Veli Yönetimi')}
              className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-2xl p-3.5 shadow-xs transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <HeartHandshake size={17} />
                </div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">%89 Aktif</span>
              </div>
              <div className="text-xl font-black text-gray-900 dark:text-white">
                {selectedOrgId === 10 ? '312' : '385'}
              </div>
              <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                Aktif Veli Sayısı
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. GÜNLÜK ÖĞRETMEN & PERSONEL DEVAMSIZLIK & İZİN ÖZETİ ── */}
        <section className="px-4 mt-4">
          <div className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <UserCheck size={17} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white">
                    Öğretmen & Personel Devamsızlık Özeti
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    Bugünkü Mesai Katılımı & İşe Geliş Analizi
                  </p>
                </div>
              </div>

              <span className="text-xs font-black text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-xl">
                %{selectedOrgId === 10 ? '91.7' : '93.5'} Görevde
              </span>
            </div>

            {/* Attendance Progress Bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden flex">
              <div
                className="bg-[#10B981] h-full"
                style={{ width: selectedOrgId === 10 ? '91.7%' : '93.5%' }}
              />
              <div
                className="bg-amber-400 h-full"
                style={{ width: selectedOrgId === 10 ? '8.3%' : '6.5%' }}
              />
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
              <div>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {selectedOrgId === 10 ? '22' : '29'}
                </div>
                <div className="text-[10px] text-gray-500 font-bold">Okulda / Görevde</div>
              </div>
              <div>
                <div className="text-sm font-black text-amber-500">2</div>
                <div className="text-[10px] text-gray-500 font-bold">İzinli / Raporlu</div>
              </div>
              <div>
                <div className="text-sm font-black text-gray-400">0</div>
                <div className="text-[10px] text-gray-500 font-bold">Mazeretsiz</div>
              </div>
            </div>

            {/* İzin Talepleri Bölümü */}
            <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <CalendarClock size={13} className="text-amber-500" />
                  <span>Personel İzin & Rapor Talepleri ({leaveRequests.length})</span>
                </span>
                <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200/40">
                  {leaveRequests.filter((l) => l.status === 'pending').length} Onay Bekliyor
                </span>
              </div>

              <div className="space-y-2">
                {leaveRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-2.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-gray-900 dark:text-white truncate">
                          {req.name}
                        </span>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {req.branch}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-0.5">
                        <span className="font-semibold text-amber-700 dark:text-amber-300">
                          {req.type}
                        </span>
                        <span> · {req.duration} ({req.reason})</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApproveLeave(req.id, req.name)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Check size={11} strokeWidth={2.5} />
                            <span>Onayla</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectLeave(req.id, req.name)}
                            className="px-2 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 font-extrabold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <X size={11} strokeWidth={2.5} />
                            <span>Reddet</span>
                          </button>
                        </>
                      ) : req.status === 'approved' ? (
                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-200/50 flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          <span>Onaylandı</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-lg border border-rose-200/50 flex items-center gap-1">
                          <AlertCircle size={11} />
                          <span>Reddedildi</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={getUrl('/m-admin-teachers')}
              className="w-full mt-3.5 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Öğretmen Kadrosu & İzinleri Detaylı İncele</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </section>

        {/* ── 4. EKSİK ATAMA VE ÇAKIŞMA UYARILARI ── */}
        <section className="px-4 mt-4 space-y-2.5">
          {/* Eksik Öğretmen / Ders Atama Uyarısı */}
          {!missingAssignment.isResolved ? (
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs transition-all">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                    Eksik Ders Atama Uyarısı
                  </span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                    Bekliyor
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-1 leading-snug">
                  <strong>{targetMissingClass} Sınıfı {targetMissingSubject} Dersi</strong> için haftalık öğretmen görevlendirmesi
                  tamamlanmamıştır.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAssignModal}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-amber-900 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-200 underline underline-offset-2 cursor-pointer transition-colors"
                >
                  <span>Öğretmen Ata</span>
                  <ChevronRight size={11} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs transition-all">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                    Öğretmen Görevlendirmesi Tamamlandı
                  </span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 flex items-center gap-0.5">
                    <Check size={10} strokeWidth={3} />
                    <span>Atandı</span>
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/80 mt-1 leading-snug">
                  <strong>{missingAssignment.targetClass} Sınıfı {missingAssignment.targetSubject} Dersi</strong> için{' '}
                  <strong>{missingAssignment.assignedTeacher}</strong> başarıyla görevlendirildi.
                </p>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400/90 mt-1.5 font-semibold flex items-center gap-2 flex-wrap">
                  <span>📅 {DAYS_LIST.find((d) => d.key === missingAssignment.assignedDay)?.label}</span>
                  <span>⏰ {missingAssignment.assignedPeriod}. Ders Saati</span>
                  <span>📍 {missingAssignment.assignedRoom}</span>
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleOpenAssignModal}
                    className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white underline underline-offset-2 cursor-pointer transition-colors"
                  >
                    <span>Görevi Düzenle / Değiştir</span>
                    <ChevronRight size={11} />
                  </button>
                  <span className="text-emerald-300 dark:text-emerald-800 text-[10px]">·</span>
                  <button
                    type="button"
                    onClick={handleResetAssignment}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 cursor-pointer transition-colors"
                  >
                    <RotateCcw size={10} />
                    <span>Sıfırla</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ders Programı Çakışma Kontrolü */}
          <div
            onClick={() => setIsConflictReportModalOpen(true)}
            className={`border rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all cursor-pointer shadow-xs active:scale-[0.99] ${
              totalConflictsCount === 0
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400'
                : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/70 hover:border-rose-400'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  totalConflictsCount === 0
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                }`}
              >
                {totalConflictsCount === 0 ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div className="min-w-0">
                <span
                  className={`text-xs font-black block truncate ${
                    totalConflictsCount === 0
                      ? 'text-emerald-900 dark:text-emerald-300'
                      : 'text-rose-900 dark:text-rose-300'
                  }`}
                >
                  Ders Programı Çakışma Durumu
                </span>
                <p
                  className={`text-[11px] mt-0.5 truncate ${
                    totalConflictsCount === 0
                      ? 'text-emerald-800/90 dark:text-emerald-400/80'
                      : 'text-rose-800/90 dark:text-rose-300/80 font-semibold'
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
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  totalConflictsCount === 0
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-200/50 dark:bg-emerald-900/50'
                    : 'text-rose-800 dark:text-rose-200 bg-rose-200 dark:bg-rose-900 animate-pulse'
                }`}
              >
                {totalConflictsCount === 0 ? 'Stabil' : `${totalConflictsCount} Çakışma`}
              </span>
              <ChevronRight
                size={14}
                className={totalConflictsCount === 0 ? 'text-emerald-600/70' : 'text-rose-600/70'}
              />
            </div>
          </div>
        </section>

        {/* ── 5. BUGÜNKÜ DERS PROGRAMI & CANLI AKIŞ ── */}
        <section className="px-4 mt-4">
          <div className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Clock size={17} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white">
                    Bugünkü Ders Programı & Akış
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    Canlı Periyot: 3. Ders (10:15 - 10:55)
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                Aktif
              </span>
            </div>

            {/* Live Class Stream */}
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.5 rounded-md text-[10px]">
                    1-A
                  </span>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">Hayat Bilgisi</div>
                    <div className="text-[10px] text-gray-500">Özlem ZOR · Derslik 101</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Tahta Bağlı
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-indigo-600 bg-indigo-100 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded-md text-[10px]">
                    2-B
                  </span>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">Matematik</div>
                    <div className="text-[10px] text-gray-500">Murat KAYA · Derslik 104</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Tahta Bağlı
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-purple-600 bg-purple-100 dark:bg-purple-950/80 px-1.5 py-0.5 rounded-md text-[10px]">
                    4-A
                  </span>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">Fen Bilimleri</div>
                    <div className="text-[10px] text-gray-500">Selin AK · Fen Lab.</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-gray-400">
                  Laboratuvar
                </span>
              </div>
            </div>

            <Link
              href={getUrl('/m-admin-schedule')}
              className="w-full mt-3 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Tüm Haftalık Programı Görüntüle</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </section>

        {/* ── 6. YAKLAŞAN SINAVLAR VE ETKİNLİKLER ── */}
        <section className="px-4 mt-4">
          <div className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Calendar size={17} />
                </div>
                <h4 className="text-xs font-black text-gray-900 dark:text-white">
                  Yaklaşan Sınavlar ve Etkinlikler
                </h4>
              </div>
              <span className="text-[10px] font-bold text-gray-400">Ekim 2026</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-black uppercase">Ekim</span>
                  <span className="text-xs font-black leading-none">12</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    4. Sınıflar İl Geneli İzleme Sınavı
                  </div>
                  <div className="text-[10px] text-gray-500">Saat 09:30 · Tüm 4. Şubeler</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-black uppercase">Ekim</span>
                  <span className="text-xs font-black leading-none">16</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    Okul-Aile Birliği Genel Kurul Toplantısı
                  </div>
                  <div className="text-[10px] text-gray-500">Saat 14:00 · Konferans Salonu</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-black uppercase">Ekim</span>
                  <span className="text-xs font-black leading-none">29</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    29 Ekim Cumhuriyet Bayramı Töreni
                  </div>
                  <div className="text-[10px] text-gray-500">Saat 10:00 · Okul Bahçesi</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. HIZLI ERİŞİM KISAYOLLARI (14 MODÜL İÇİNDEN HIZLI GEÇİŞLER) ── */}
        <section className="px-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Hızlı Erişim Modülleri
            </h3>
            <button
              type="button"
              onClick={() => setIsMoreSheetOpen(true)}
              className="text-[11px] font-bold text-[#10B981] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>Tümünü Gör (14)</span>
              <ChevronRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* 02. Öğrenci Yönetimi (Aktif) */}
            <Link
              href={getUrl('/m-admin-students')}
              className="p-3 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 flex items-center justify-between group hover:border-[#34D399]/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-xl bg-[#34D399]/15 text-[#34D399] flex items-center justify-center shrink-0">
                  <GraduationCap size={16} />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    Öğrenci Yönetimi
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Aktif Modül</div>
                </div>
              </div>
              <ArrowUpRight size={13} className="text-gray-400 group-hover:text-[#34D399] shrink-0" />
            </Link>

            {/* 10. Akıllı Tahta Yönetimi (Aktif) */}
            <Link
              href={getUrl('/m-admin-boards')}
              className="p-3 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 flex items-center justify-between group hover:border-[#34D399]/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-xl bg-[#34D399]/15 text-[#34D399] flex items-center justify-center shrink-0">
                  <Tv size={16} />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    Akıllı Tahtalar
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Aktif Modül</div>
                </div>
              </div>
              <ArrowUpRight size={13} className="text-gray-400 group-hover:text-[#34D399] shrink-0" />
            </Link>

            {/* 03. Öğretmen Kadrosu (Aktif) */}
            <Link
              href={getUrl('/m-admin-teachers')}
              className="p-3 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 flex items-center justify-between group hover:border-[#34D399]/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Briefcase size={16} />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    Öğretmen Kadrosu
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Aktif Modül</div>
                </div>
              </div>
              <ArrowUpRight size={13} className="text-gray-400 group-hover:text-[#34D399] shrink-0" />
            </Link>

            {/* 04. Ders Programı */}
            <Link
              href={getUrl('/m-admin-schedule')}
              className="p-3 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 flex items-center justify-between group hover:border-[#34D399]/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Calendar size={16} />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    Ders Programı
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Aktif Modül</div>
                </div>
              </div>
              <ArrowUpRight size={13} className="text-gray-400 group-hover:text-[#34D399] shrink-0" />
            </Link>
          </div>
        </section>

        {/* ── 8. SON İŞLEMLER (İDARİ DENETİM / AUDIT LOGS) ── */}
        <section className="px-4 mt-4">
          <div className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black text-gray-900 dark:text-white">
                Son İdari İşlemler
              </h4>
              <span className="text-[10px] font-bold text-gray-400">Denetim Günlüğü</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 pb-2.5 border-b border-gray-100 dark:border-gray-800/70">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 dark:text-white">
                    1-A Sınıfı sabah yoklaması onaylandı
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Öğretmen: Özlem ZOR · 12 dakika önce
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pb-2.5 border-b border-gray-100 dark:border-gray-800/70">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 dark:text-white">
                    4-B Akıllı Tahtası derse bağlandı
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Oturum Kodu: PANO-8842 · 35 dakika önce
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 dark:text-white">
                    Yeni öğrenci kaydı oluşturuldu (Alp ASLAN)
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Şube: 1-C · Öğrenci No: 184 · 1 saat önce
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 9. ALT BİLGİ DOCK BUTONU ── */}
        <div className="px-4 mt-4">
          <button
            type="button"
            onClick={() => setIsMoreSheetOpen(true)}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-[#131C31] dark:to-[#1E293B] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98 border border-white/10"
          >
            <Layers size={15} className="text-[#34D399]" />
            <span>Tüm İdare Menülerini Aç (01 — 14)</span>
          </button>
        </div>
      </motion.div>

      {/* ── DİĞER MODÜLLER AÇILIR ÇEKMECESİ ── */}
      <MobileAdminMoreSheet
        isOpen={isMoreSheetOpen}
        onClose={() => setIsMoreSheetOpen(false)}
        theme={theme}
        orgSlug={orgSlug}
      />

      {/* ── MODAL A: HIZLI ÖĞRETMEN & DERS GÖREVLENDİRME MODALI ── */}
      <AnimatePresence>
        {isAssignTeacherModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignTeacherModalOpen(false)}
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
                  : 'bg-white text-gray-900'
              }`}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <UserCheck size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Hızlı Öğretmen & Ders Görevlendirmesi
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      {targetMissingClass} Şubesi · {targetMissingSubject} Dersi
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAssignTeacherModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveAssignment} className="p-4 overflow-y-auto space-y-3.5 text-xs">
                {/* Info Alert */}
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
                    Bu ders için henüz haftalık sorumlu öğretmen atanmamıştır. Görevlendirilen öğretmen haftalık programa eklenecektir.
                  </div>
                </div>

                {/* 1. Öğretmen Seçimi */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                    Görevlendirilecek Öğretmen
                  </label>
                  <select
                    value={formAssignTeacher}
                    onChange={(e) => setFormAssignTeacher(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
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

                {/* 2. Gün & Periyot Seçimi */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Ders Günü
                    </label>
                    <select
                      value={formAssignDay}
                      onChange={(e) => setFormAssignDay(e.target.value as DayKey)}
                      className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      {DAYS_LIST.map((d) => (
                        <option key={d.key} value={d.key}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Ders Saati
                    </label>
                    <select
                      value={formAssignPeriod}
                      onChange={(e) => setFormAssignPeriod(Number(e.target.value))}
                      className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      {activePeriods.map((p) => (
                        <option key={p.periodNumber} value={p.periodNumber}>
                          {p.periodNumber}. Ders ({p.time})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Fiziksel Derslik / Salon */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                    Derslik / Atölye
                  </label>
                  <select
                    value={formAssignRoom}
                    onChange={(e) => setFormAssignRoom(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    {SCHOOL_ROOMS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Toggles */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 cursor-pointer">
                    <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                      Akıllı Tahta Entegrasyonu Aktif
                    </span>
                    <input
                      type="checkbox"
                      checked={formSmartBoard}
                      onChange={(e) => setFormSmartBoard(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 cursor-pointer">
                    <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                      Öğretmene SMS & Mobil Görevlendirme Bildirimi Gönder
                    </span>
                    <input
                      type="checkbox"
                      checked={formSendSms}
                      onChange={(e) => setFormSendSms(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                    />
                  </label>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAssignTeacherModalOpen(false)}
                    className="h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check size={16} strokeWidth={2.5} />
                    <span>Görevi Ata & Kaydet</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL B: HAFTALIK ÇAKIŞMA VE CANLI UYUMLULUK RAPORU MODALI ── */}
      <AnimatePresence>
        {isConflictReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConflictReportModalOpen(false)}
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
                  : 'bg-white text-gray-900'
              }`}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      totalConflictsCount === 0
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Haftalık Çakışma & Uyumluluk Raporu
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      {activeOrg.name} · Canlı Sistem Denetimi
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConflictReportModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
                {/* Status Hero Card */}
                {totalConflictsCount === 0 ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                        Haftalık Çizelge %100 Uyumlu
                      </div>
                      <div className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 mt-0.5 leading-snug">
                        0 Çakışma Tespit Edildi. Öğretmen, derslik ve zaman atamalarında hiçbir çakışma bulunmamaktadır.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
                      <AlertTriangle size={22} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-rose-900 dark:text-rose-300">
                        {totalConflictsCount} Adet Çakışma Tespit Edildi
                      </div>
                      <div className="text-[11px] text-rose-800/80 dark:text-rose-400/80 mt-0.5 leading-snug">
                        Lütfen çakışan ders saatlerini ders programı editöründen düzenleyin.
                      </div>
                    </div>
                  </div>
                )}

                {/* Conflict Details if any */}
                {totalConflictsCount > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-black text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                      Tespit Edilen Çakışma Detayları
                    </div>
                    {teacherConflicts.map((c, i) => (
                      <div
                        key={`tc-${i}`}
                        className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60"
                      >
                        <div className="font-extrabold text-rose-800 dark:text-rose-300">
                          Öğretmen: {c.teacher}
                        </div>
                        <div className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
                          {DAYS_LIST.find((d) => d.key === c.day)?.label} · {c.period}. Ders saatinde birden fazla sınıfta:
                        </div>
                        <div className="mt-1.5 flex gap-1 flex-wrap">
                          {c.entries.map((e) => (
                            <span
                              key={e.id}
                              className="px-2 py-0.5 rounded-md bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 text-[10px] font-black"
                            >
                              {e.classCode} ({e.subject})
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    {roomConflicts.map((c, i) => (
                      <div
                        key={`rc-${i}`}
                        className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60"
                      >
                        <div className="font-extrabold text-amber-800 dark:text-amber-300">
                          Derslik: {c.room}
                        </div>
                        <div className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
                          {DAYS_LIST.find((d) => d.key === c.day)?.label} · {c.period}. Ders saatinde iki sınıf aynı alanda:
                        </div>
                        <div className="mt-1.5 flex gap-1 flex-wrap">
                          {c.entries.map((e) => (
                            <span
                              key={e.id}
                              className="px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-black"
                            >
                              {e.classCode} ({e.subject})
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4 Audit Checklist Points */}
                <div className="space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Sistem Denetim Parametreleri
                  </div>

                  {/* Checklist 1: Öğretmen Zaman Denetimi */}
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={13} strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          Öğretmen Zaman Çakışması Kontrolü
                        </div>
                        <div className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                          {teacherConflicts.length === 0
                            ? 'Hiçbir öğretmen aynı saat diliminde iki farklı sınıfa yazılmamıştır.'
                            : `${teacherConflicts.length} öğretmende saat çakışması saptandı.`}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md shrink-0 ${
                        teacherConflicts.length === 0
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {teacherConflicts.length === 0 ? 'Uygun' : 'Hata'}
                    </span>
                  </div>

                  {/* Checklist 2: Fiziksel Derslik & Atölye Kontrolü */}
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={13} strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          Derslik & Laboratuvar Kapasitesi
                        </div>
                        <div className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                          {roomConflicts.length === 0
                            ? 'Müzik dersliği, Fen lab. ve Spor salonu saatleri çakışmasız planlanmıştır.'
                            : `${roomConflicts.length} derslikte eşzamanlı çakışma saptandı.`}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md shrink-0 ${
                        roomConflicts.length === 0
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {roomConflicts.length === 0 ? 'Uygun' : 'Hata'}
                    </span>
                  </div>

                  {/* Checklist 3: MEB Haftalık Zorunlu Saat Kotası */}
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={13} strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          MEB Haftalık Saat Kotası
                        </div>
                        <div className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                          Haftalık 30 saatlik müfredat programı şubelere eksiksiz dağıtılmıştır.
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                      Uyumlu
                    </span>
                  </div>

                  {/* Checklist 4: Akıllı Tahta Eşleşmesi */}
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={13} strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          Akıllı Tahta Senkronizasyonu
                        </div>
                        <div className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                          Tüm şubelerdeki sınıf panoları ders çizelgesi ile çevrimiçi bağlıdır.
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                      Senkron
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  <Link
                    href={getUrl('/m-admin-schedule')}
                    onClick={() => setIsConflictReportModalOpen(false)}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>Ders Programı Matrisini Aç</span>
                    <ArrowRight size={14} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsConflictReportModalOpen(false)}
                    className="w-full h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 transition-colors cursor-pointer text-xs"
                  >
                    Raporu Kapat
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL C: YÖNETİCİ HESAP & KİMLİK BİLGİLERİ MODALI ── */}
      <AnimatePresence>
        {isAdminProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
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
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-md max-h-[92vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900'
              }`}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span>Yönetici Hesap Bilgileri</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        MÜDÜR
                      </span>
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      MEBBİS & MERNİS Doğrulamalı Kurum Yetkili Profili
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminProfileModalOpen(false)
                    setIsEditingProfile(false)
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
                {/* 1. Administrator Hero Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900 via-[#0D1829] to-[#062419] text-white border border-emerald-500/30 relative overflow-hidden shadow-lg">
                  {/* Subtle Glow */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />

                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-gray-950 font-black text-base flex items-center justify-center shadow-lg">
                          {adminProfile.name
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-gray-900 flex items-center justify-center">
                          <Check size={9} strokeWidth={3} className="text-white" />
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-base font-black text-white leading-tight">
                            {adminProfile.name}
                          </h4>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-400 text-gray-950">
                            ONAYLI
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-300 font-bold mt-0.5">
                          {adminProfile.title}
                        </p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <School size={11} className="text-emerald-400" />
                          <span>{adminProfile.schoolName}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Badges Strip */}
                  <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center gap-1.5 flex-wrap text-[10px]">
                    <span className="px-2 py-0.5 rounded-lg bg-white/10 text-white font-semibold flex items-center gap-1">
                      <Award size={11} className="text-amber-400" />
                      <span>1. Derece Kurum Müdürü</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                      <ShieldCheck size={11} />
                      <span>2FA Güvenli Giriş</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 font-semibold">
                      MEB Sicil: 94281
                    </span>
                  </div>
                </div>

                {/* 2. Profil Düzenleme Formu OR Bilgi Kartları */}
                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Edit2 size={13} className="text-emerald-500" />
                        <span>Yönetici Bilgilerini Düzenle</span>
                      </span>
                      <span className="text-[10px] text-gray-400">Canlı Güncelleme</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                        Ad Soyad & Unvan
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                        Kurumsal E-Posta
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                        Yetkili Telefon Numarası
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="h-9 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-300 transition-colors cursor-pointer text-xs"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="submit"
                        className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5"
                      >
                        <Check size={14} strokeWidth={2.5} />
                        <span>Değişiklikleri Kaydet</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
                      Resmi Kimlik ve İletişim Bilgileri
                    </div>

                    {/* T.C. Kimlik No */}
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400 font-semibold">T.C. Kimlik No</div>
                          <div className="font-extrabold text-gray-900 dark:text-white font-mono tracking-wider">
                            {adminProfile.tcNo}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        MERNİS Doğrulandı
                      </span>
                    </div>

                    {/* Kurumsal E-Posta */}
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Mail size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-gray-400 font-semibold">Kurumsal E-Posta</div>
                          <div className="font-extrabold text-gray-900 dark:text-white truncate">
                            {adminProfile.email}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shrink-0">
                        Resmi Posta
                      </span>
                    </div>

                    {/* Telefon */}
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                          <Phone size={14} />
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400 font-semibold">Yetkili Telefon</div>
                          <div className="font-extrabold text-gray-900 dark:text-white font-mono">
                            {adminProfile.phone}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                        SMS & 2FA Aktif
                      </span>
                    </div>

                    {/* Kullanıcı Adı & Yetki */}
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                          <Building2 size={14} />
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400 font-semibold">Kullanıcı Hesabı & Yetki</div>
                          <div className="font-bold text-gray-900 dark:text-white">
                            @{adminProfile.username} · {adminProfile.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Güvenlik ve Uyumluluk Özet Kartı */}
                <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-[11px]">
                    <ShieldCheck size={14} />
                    <span>Kurumsal Güvenlik & Doğrulama Durumu</span>
                  </div>
                  <div className="text-[10.5px] text-gray-600 dark:text-gray-300 space-y-1 pl-5">
                    <div className="flex items-center gap-1.5">
                      <Check size={12} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                      <span>2 Faktörlü Kimlik Doğrulama: <strong>Etkin ve Doğrulanmış</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={12} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                      <span>MEBBİS Kurum Yönetimi: <strong>Tam Yetkili ve Aktif</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={12} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                      <span>Son Başarılı Giriş: <strong>{adminProfile.loginTime} (SSL 256-Bit)</strong></span>
                    </div>
                  </div>
                </div>

                {/* 4. Action Buttons */}
                <div className="pt-2 space-y-2">
                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="w-full h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700/80 text-gray-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-gray-200 dark:border-gray-700"
                    >
                      <Edit2 size={13} />
                      <span>Profil ve İletişim Bilgilerini Düzenle</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleAdminSignOut}
                    className="w-full h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-rose-200/60 dark:border-rose-900/40"
                  >
                    <LogOut size={14} />
                    <span>Yönetici Oturumunu Güvenle Kapat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminProfileModalOpen(false)
                      setIsEditingProfile(false)
                    }}
                    className="w-full h-9 rounded-xl bg-transparent text-gray-500 dark:text-gray-400 font-semibold hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    Pencereyi Kapat
                  </button>
                </div>
              </div>
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
      {/* ── 390px UNIFIED MOBILE APP SHELL FRAME ── */}
      <div className="w-full sm:max-w-[390px] min-h-[100dvh] bg-[#F8FAFC] dark:bg-[#0A0D15] sm:shadow-2xl relative flex flex-col pb-24 sm:border-x border-gray-200/60 dark:border-gray-800/80 overflow-x-hidden overscroll-y-none">
        {/* ── FIXED MASTER HEADER ── */}
        <MobileHeader theme={theme} onToggleTheme={toggleTheme} />

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 w-full flex flex-col">{pageContent}</main>

        {/* ── DEDICATED ADMIN FLOATING DOCK ── */}
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
