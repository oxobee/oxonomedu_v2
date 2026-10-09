'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  QrCode,
  Plus,
  CheckSquare,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Search,
  Users,
  Phone,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  ArrowRightLeft,
  Eye,
  X,
  Award,
  Sun,
  Moon,
  Save,
  Check,
  Lock,
  BookOpen,
  HeartPulse,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileFloatingDock from '@components/Mobile/MobileFloatingDock'
import ConnectBoardModal from '@components/DashboardV2/ConnectBoardModal'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import {
  getAttendanceForClass,
  saveAttendanceForClass,
  AttendanceRecord,
} from '@services/demo/attendanceService'

// Comprehensive Student Profile Interface
export interface MStudentCourseGrade {
  courseName: string
  teacherName: string
  exam1: number
  exam2: number
  performance: number
  average: number
}

export interface MStudentItem {
  id: string
  name: string
  email: string
  studentNo: string
  tcNo: string
  gender: 'Erkek' | 'Kız'
  birthDate: string
  bloodType: string
  enrollmentDate: string
  className: string
  mentorTeacher: string
  schoolName: string
  gpa: number
  classRank: number
  attendanceRate: number
  absentExcusedDays: number
  absentUnexcusedDays: number
  parentName: string
  parentPhone: string
  parentRelation: string
  parentOccupation: string
  secondParentName?: string
  secondParentPhone?: string
  secondParentRelation?: string
  emergencyContact: string
  emergencyPhone: string
  address: string
  specialHealthNote: string
  disciplineStatus: string
  notes: string
  guidanceNotes: { id: string; date: string; author: string; content: string }[]
  grades: MStudentCourseGrade[]
  status: 'active' | 'frozen'
}

// Initial realistic students list based on design template
const INITIAL_STUDENTS: MStudentItem[] = [
  {
    id: 's-1',
    name: 'Erçil UĞURLU',
    email: 'ogrenci@oxonom.com',
    studentNo: '101',
    tcNo: '10000000146',
    gender: 'Erkek',
    birthDate: '15.06.2010 (16 Yaşında)',
    bloodType: 'A Rh+',
    enrollmentDate: '01.09.2024',
    className: '9-A Şubesi',
    mentorTeacher: 'Ebru TEKNECİ (Edebiyat Öğretmeni)',
    schoolName: 'Oxonom Okulları',
    gpa: 98.8,
    classRank: 1,
    attendanceRate: 100,
    absentExcusedDays: 0,
    absentUnexcusedDays: 0,
    parentName: 'Ebru UĞURLU (Anne)',
    parentPhone: '+90 532 999 1100',
    parentRelation: 'Anne',
    parentOccupation: 'Mimar',
    secondParentName: 'Dr. Uğur UĞURLU (Baba)',
    secondParentPhone: '+90 532 999 2200',
    secondParentRelation: 'Baba (Kurum Müdürü)',
    emergencyContact: 'Dr. Uğur UĞURLU (Baba - Okul Müdürü)',
    emergencyPhone: '+90 532 999 2200',
    address: 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul',
    specialHealthNote: 'Herhangi bir kronik rahatsızlığı veya alerjisi bulunmamaktadır.',
    disciplineStatus: 'Temiz Sicil — Örnek Öğrenci Onur Belgesi',
    notes: '9-A sınıfı öğrencisi. Türk Dili ve Edebiyatı, Matematik ve Bilişim alanlarında üstün analitik ve edebi başarı.',
    guidanceNotes: [
      {
        id: 'gn-1',
        date: '28.09.2026',
        author: 'Ebru TEKNECİ (Edebiyat Öğretmeni)',
        content: 'Öğrencinin edebiyat tahlilleri, kompozisyon yeteneği ve ders içi motivasyonu en üst düzeydedir.',
      },
      {
        id: 'gn-2',
        date: '15.09.2026',
        author: 'Dr. Uğur UĞURLU (Okul Müdürü)',
        content: 'Velisi Ebru Hanım ile yapılan dönem başı akademik ve eğitim planlama görüşmesi verimli tamamlandı.',
      },
    ],
    grades: [
      { courseName: 'Türk Dili ve Edebiyatı', teacherName: 'Ebru TEKNECİ', exam1: 98, exam2: 100, performance: 100, average: 99.3 },
      { courseName: 'Matematik', teacherName: 'Ebru TEKNECİ', exam1: 96, exam2: 98, performance: 100, average: 98.0 },
      { courseName: 'Bilişim & Kodlama', teacherName: 'Ebru TEKNECİ', exam1: 100, exam2: 98, performance: 100, average: 99.0 },
      { courseName: 'Yabancı Dil (İngilizce)', teacherName: 'Yabancı Dil', exam1: 100, exam2: 98, performance: 100, average: 99.3 },
    ],
    status: 'active',
  },
]

export const ALL_INITIAL_STUDENTS: MStudentItem[] = [...INITIAL_STUDENTS]

const CLASS_OPTIONS = [
  { label: 'Tüm Sınıflar (1)', value: 'all' },
  { label: '9-A Şubesi (1)', value: '9-A Şubesi' },
]

export interface MStudentClientProps {
  hideDock?: boolean
  hideHeader?: boolean
  theme?: 'light' | 'dark'
  onToggleTheme?: () => void
}

export default function MStudentClient({
  hideDock = false,
  hideHeader = false,
  theme: propTheme,
  onToggleTheme: propToggleTheme,
}: MStudentClientProps = {}) {
  const router = useRouter()
  // Synchronized Theme state
  const { theme: internalTheme, toggleTheme: internalToggleTheme } = useMobileTheme()
  const theme = propTheme || internalTheme
  const toggleTheme = propToggleTheme || internalToggleTheme

  // Prevent pinch-to-zoom & gestures on mobile
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

  const searchParams = useSearchParams()

  // Students state with LocalStorage persistence (v3 ensures full 210 students)
  const [students, setStudents] = useState<MStudentItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_m_students_v3')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length >= 210) return parsed
        }
      } catch (_) {}
    }
    return ALL_INITIAL_STUDENTS
  })

  const saveStudents = (newStudents: MStudentItem[]) => {
    setStudents(newStudents)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_m_students_v3', JSON.stringify(newStudents))
      } catch (_) {}
    }
  }

  // Search & Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'frozen'>('all')
  const [selectedClassFilter, setSelectedClassFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      const classParam = new URLSearchParams(window.location.search).get('class')
      if (classParam) {
        return classParam.includes('Şubesi') ? classParam : `${classParam} Şubesi`
      }
    }
    return '1-A Şubesi'
  })

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<MStudentItem | null>(null)
  const [activeProfileTab, setActiveProfileTab] = useState<'identity' | 'academic' | 'attendance' | 'parent'>('identity')
  const [transferTargetStudent, setTransferTargetStudent] = useState<MStudentItem | null>(null)

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (selectedClassFilter !== 'all' && s.className !== selectedClassFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = s.name.toLowerCase().includes(q)
        const matchNo = s.studentNo.toLowerCase().includes(q)
        const matchTc = s.tcNo.toLowerCase().includes(q)
        const matchParent = s.parentName.toLowerCase().includes(q)
        const matchPhone = s.parentPhone.toLowerCase().includes(q)
        const matchEmail = s.email.toLowerCase().includes(q)
        if (!matchName && !matchNo && !matchTc && !matchParent && !matchPhone && !matchEmail) {
          return false
        }
      }
      return true
    })
  }, [students, statusFilter, selectedClassFilter, searchQuery])

  // Active class code
  const activeClassCode = selectedClassFilter === 'all' ? '1-A' : selectedClassFilter.replace(' Şubesi', '')

  // Attendance Records with real class sync
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'present' | 'absent'>>(() => {
    const existing = getAttendanceForClass('1-A')
    return existing?.records || {}
  })

  // Auto-open attendance if requested from URL query
  useEffect(() => {
    const shouldOpen = searchParams?.get('openAttendance') === 'true'
    const classParam = searchParams?.get('class')
    if (classParam) {
      setSelectedClassFilter(classParam.includes('Şubesi') ? classParam : `${classParam} Şubesi`)
    }
    if (shouldOpen) {
      const code = classParam ? classParam.replace(' Şubesi', '') : activeClassCode
      const existing = getAttendanceForClass(code)
      if (existing) {
        setAttendanceRecords(existing.records)
      }
      setIsAttendanceModalOpen(true)
    }
  }, [searchParams])

  // Long press timer ref & flag
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const isLongPressRef = React.useRef(false)

  const handlePointerDown = (studentId: string, studentName: string) => {
    isLongPressRef.current = false
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      setAttendanceRecords((prev) => ({ ...prev, [studentId]: 'absent' }))
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(60)
      }
      toast.error(`${studentName} "Yok" olarak işaretlendi`, { id: `att-${studentId}`, duration: 1500 })
    }, 420)
  }

  const handlePointerUp = (studentId: string, studentName: string) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
    if (!isLongPressRef.current) {
      setAttendanceRecords((prev) => ({ ...prev, [studentId]: 'present' }))
      toast.success(`${studentName} "Burada" olarak işaretlendi`, { id: `att-${studentId}`, duration: 1200 })
    }
  }

  const handlePointerCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
  }

  const handleSaveAttendance = () => {
    const classStudents = students.filter(
      (s) => (selectedClassFilter === 'all' || s.className === selectedClassFilter) && s.status === 'active'
    )
    saveAttendanceForClass(activeClassCode, attendanceRecords, classStudents.length)
    setIsAttendanceModalOpen(false)
    toast.success('Yoklama başarıyla kaydedildi! Ana sayfaya yönlendiriliyorsunuz...', {
      icon: '✅',
      duration: 2500,
    })
    setTimeout(() => {
      router.push('/dashv2')
    }, 450)
  }

  const handleMarkAllPresent = () => {
    const classStudents = students.filter(
      (s) => (selectedClassFilter === 'all' || s.className === selectedClassFilter) && s.status === 'active'
    )
    const newRecords: Record<string, 'present' | 'absent'> = {}
    classStudents.forEach((s) => {
      newRecords[s.id] = 'present'
    })
    setAttendanceRecords(newRecords)
    toast.success('Tüm sınıf "Burada" olarak işaretlendi.')
  }

  // Handle Toggle Status (Active / Frozen)
  const handleToggleStatus = (student: MStudentItem) => {
    const nextStatus: 'active' | 'frozen' = student.status === 'active' ? 'frozen' : 'active'
    const updated: MStudentItem[] = students.map((s) => (s.id === student.id ? { ...s, status: nextStatus } : s))
    saveStudents(updated)
    toast.success(
      nextStatus === 'frozen'
        ? `${student.name} kaydı donduruldu.`
        : `${student.name} kaydı tekrar aktifleştirildi.`
    )
  }

  // Handle Transfer Class
  const handleTransfer = (newClassName: string) => {
    if (!transferTargetStudent) return
    const updated = students.map((s) =>
      s.id === transferTargetStudent.id
        ? {
            ...s,
            className: newClassName,
            mentorTeacher:
              newClassName === '1-A Şubesi'
                ? 'Özlem ZOR'
                : newClassName === '1-B Şubesi'
                ? 'Beyzanur SALMANLI'
                : 'Sınıf Öğretmeni',
          }
        : s
    )
    saveStudents(updated)
    toast.success(`${transferTargetStudent.name} ${newClassName} şubesine nakledildi.`)
    setTransferTargetStudent(null)
  }

  // Staggered macro animations configuration (Rapid fluid entrance from Left)
  const pageVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.02,
      },
    },
  }

  const macroItemVariants: any = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
    },
  }

  const pageContent = (
    <div className="flex flex-col flex-1 w-full">
      {/* ── STAGGERED PAGE CONTENT WRAPPER (Fluid Left Entrance) ── */}
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col flex-1 w-full"
      >

        {/* ── 2. TOP HERO SECTION: ÖĞRENCİ İŞLERİ & SINIF DAĞILIMI ── */}
        <motion.section
          variants={macroItemVariants}
          className="mx-5 mt-4 rounded-[22px] p-4 text-white flex flex-col gap-3.5 shadow-xl bg-[#0A0D15] relative overflow-hidden"
          style={{
            backgroundImage:
              'linear-gradient(45deg,rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(-45deg,rgba(255,255,255,.05) 1px,transparent 1px),radial-gradient(circle at 100% 0%,rgba(255,255,255,.1) 0%,rgba(255,255,255,0) 50%)',
            backgroundSize: '26px 26px, 26px 26px, auto',
            boxShadow: '0 12px 26px rgba(10,13,21,.2)',
          }}
        >
          <div className="flex items-center gap-3">
            <motion.span
              whileHover={{ rotate: 10, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400 }}
              aria-hidden="true"
              className="w-[42px] h-[42px] rounded-[13px] bg-[#34D399]/15 border border-[#34D399]/35 text-[#34D399] flex items-center justify-center shrink-0"
            >
              <GraduationCap size={22} strokeWidth={1.8} />
            </motion.span>
            <h1 className="m-0 text-[18px] leading-[1.2] font-extrabold tracking-tight">
              Öğrenci İşleri & Sınıf Dağılımı
            </h1>
          </div>

          <div className="pt-0.5">
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.01 }}
              type="button"
              onClick={() => {
                const existing = getAttendanceForClass(activeClassCode)
                if (existing) {
                  setAttendanceRecords(existing.records)
                }
                setIsAttendanceModalOpen(true)
              }}
              className="w-full h-[48px] border-0 rounded-[16px] bg-[#34D399] hover:bg-[#2fe0a0] text-[#0A0D15] text-[14px] font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <CheckSquare size={19} strokeWidth={2.4} />
              <span>Sınıf Yoklamasını Başlat / İncele</span>
            </motion.button>
          </div>
        </motion.section>

        {/* ── 3. MAIN CONTENT AREA ── */}
        <main className="flex-1 px-5 py-4 flex flex-col gap-4">
          {/* ── ARA & FİLTRELE ACCORDION ── */}
          <motion.div
            variants={macroItemVariants}
            className="bg-white dark:bg-[#121826] border border-[#E7EBF2] dark:border-gray-800 rounded-[22px] shadow-sm overflow-hidden transition-all"
          >
            <div
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-3 min-h-[60px] px-4 py-2.5 cursor-pointer select-none"
            >
              <span
                aria-hidden="true"
                className="w-[38px] h-[38px] rounded-[12px] bg-[#ECEBFD] dark:bg-indigo-950/60 text-[#4338CA] dark:text-indigo-300 flex items-center justify-center shrink-0"
              >
                <SlidersHorizontal size={19} strokeWidth={1.9} />
              </span>
              <div className="flex-1 min-w-0">
                <span className="block text-[14px] font-bold text-gray-900 dark:text-white">
                  Ara & Filtrele
                </span>
                <span className="block text-[12px] text-[#5B6577] dark:text-gray-400 mt-0.5">
                  {selectedClassFilter === 'all' ? 'Tüm Sınıflar' : selectedClassFilter} ·{' '}
                  {statusFilter === 'all'
                    ? 'Tüm Durumlar'
                    : statusFilter === 'active'
                    ? 'Aktif'
                    : 'Dondurulmuş'}
                </span>
              </div>
              <motion.span
                animate={{ rotate: isFilterOpen ? 180 : 0 }}
                transition={{ duration: 0.22 }}
                className="w-8 h-8 rounded-full bg-[#F1F4F9] dark:bg-gray-800 text-[#5B6577] dark:text-gray-300 flex items-center justify-center shrink-0"
              >
                <ChevronDown size={16} />
              </motion.span>
            </div>

            {/* Accordion Content with Spring Height */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="px-4 pb-4 pt-1 flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800/80"
                >
                  {/* Search Input */}
                  <label className="flex items-center gap-2.5 min-h-[50px] px-3.5 rounded-[16px] bg-[#F6F8FC] dark:bg-[#161D2E] border border-[#E1E6EE] dark:border-gray-700">
                    <span className="text-[#5B6577] dark:text-gray-400">
                      <Search size={19} strokeWidth={1.8} />
                    </span>
                    <input
                      type="search"
                      aria-label="Öğrenci ara"
                      placeholder="Öğrenci no, ad, T.C., veli, telefon ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 min-w-0 border-0 outline-hidden bg-transparent text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </label>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2.5 min-h-[50px] px-3.5 rounded-[16px] bg-[#F6F8FC] dark:bg-[#161D2E] border border-[#E1E6EE] dark:border-gray-700">
                    <select
                      aria-label="Durum"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full border-0 outline-hidden bg-transparent text-[14px] font-semibold text-gray-900 dark:text-white cursor-pointer"
                    >
                      <option value="all" className="dark:bg-[#161D2E]">
                        Tüm Durumlar
                      </option>
                      <option value="active" className="dark:bg-[#161D2E]">
                        Aktif
                      </option>
                      <option value="frozen" className="dark:bg-[#161D2E]">
                        Dondurulmuş
                      </option>
                    </select>
                  </div>

                  {/* Class Tabs Scroll */}
                  <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
                    {CLASS_OPTIONS.map((cls) => {
                      const isActive = selectedClassFilter === cls.value
                      return (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          key={cls.value}
                          type="button"
                          onClick={() => setSelectedClassFilter(cls.value)}
                          className={`shrink-0 h-[40px] px-4 rounded-[14px] text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#0A0D15] dark:bg-white text-white dark:text-[#0A0D15] shadow-md'
                              : 'bg-white dark:bg-[#161D2E] border border-[#E1E6EE] dark:border-gray-700 text-[#334155] dark:text-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {cls.label}
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── 4. ÖĞRENCİ LİSTESİ BÖLÜM AYIRICI ── */}
          <motion.div
            variants={macroItemVariants}
            className="flex items-center gap-2.5 text-[11px] font-bold tracking-[0.08em] text-[#5B6577] dark:text-gray-400 mt-1"
          >
            <span className="w-[18px] h-[3px] rounded-[2px] bg-[#34D399]" />
            <span>ÖĞRENCİ LİSTESİ</span>
            <span className="flex-1 h-[1px] bg-[#DDE3EC] dark:bg-gray-800" />
            <span className="tracking-normal text-[#334155] dark:text-gray-300 font-semibold">
              {filteredStudents.length} öğrenci
            </span>
          </motion.div>

          {/* ── 5. ÖĞRENCİ KARTLARI LİSTESİ WITH STAGGERED ENTRANCE ── */}
          <motion.div variants={macroItemVariants} className="flex flex-col gap-4">
            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs bg-white dark:bg-[#121826] rounded-[22px] border border-gray-100 dark:border-gray-800 p-6">
                Aramanıza uygun öğrenci bulunamadı.
              </div>
            ) : (
              filteredStudents.map((student, idx) => {
                const initialLetter = student.name.charAt(0).toUpperCase()
                const isActive = student.status === 'active'

                return (
                  <motion.article
                    key={student.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: idx * 0.04,
                      ease: 'easeOut',
                    }}
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    className="bg-white dark:bg-[#121826] border border-[#E7EBF2] dark:border-gray-800 rounded-[22px] shadow-xs p-4 flex flex-col gap-3.5 transition-shadow hover:shadow-md"
                    style={{
                      boxShadow: '0 1px 2px rgba(15,23,42,.04),0 8px 18px rgba(15,23,42,.05)',
                    }}
                  >
                    {/* Header Row: Avatar, Name & Status Badge */}
                    <div className="flex items-center gap-3">
                      <motion.span
                        whileHover={{ scale: 1.06, rotate: 4 }}
                        transition={{ type: 'spring', stiffness: 350 }}
                        aria-hidden="true"
                        className="w-[46px] h-[46px] rounded-[15px] bg-gradient-to-br from-[#34D399] to-[#0F766E] text-white text-[18px] font-extrabold flex items-center justify-center shrink-0 shadow-xs cursor-default"
                      >
                        {initialLetter}
                      </motion.span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-bold leading-tight text-gray-900 dark:text-white truncate">
                          {student.name}
                        </div>
                        <div className="text-[12px] text-[#5B6577] dark:text-gray-400 mt-0.5 truncate">
                          {student.email}
                        </div>
                      </div>

                      {/* Status Badge with Micro Pulsing Radar Dot */}
                      <span
                        className={`flex items-center gap-1.5 h-[28px] px-2.5 rounded-full text-[12px] font-bold shrink-0 ${
                          isActive
                            ? 'bg-[#E8F6F0] dark:bg-emerald-950/60 text-[#047857] dark:text-[#34D399]'
                            : 'bg-[#FEF2F2] dark:bg-red-950/60 text-[#DC2626] dark:text-red-400'
                        }`}
                      >
                        {isActive ? (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                        ) : (
                          <PauseCircle size={14} strokeWidth={2.2} />
                        )}
                        <span>{isActive ? 'Aktif' : 'Dondurulmuş'}</span>
                      </span>
                    </div>

                    {/* 2x2 Info Grid */}
                    <div className="bg-[#F6F8FC] dark:bg-[#161D2E] border border-[#E9EDF4] dark:border-gray-800/80 rounded-[16px] p-3.5 grid grid-cols-2 gap-y-3.5 gap-x-3">
                      {/* 1. NO / T.C. */}
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.08em] text-[#5B6577] dark:text-gray-400">
                          NO / T.C.
                        </div>
                        <div className="text-[13px] font-bold text-gray-900 dark:text-white mt-1">
                          {student.studentNo}
                        </div>
                        <div className="text-[11px] text-[#5B6577] dark:text-gray-400 mt-0.5 font-mono">
                          TC: {student.tcNo}
                        </div>
                      </div>

                      {/* 2. SINIF & REHBER */}
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.08em] text-[#5B6577] dark:text-gray-400">
                          SINIF & REHBER
                        </div>
                        <div className="mt-1">
                          <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-[9px] bg-[#ECEBFD] dark:bg-indigo-950/70 text-[#3730A3] dark:text-indigo-300">
                            {student.className}
                          </span>
                        </div>
                        <div className="text-[12px] text-[#5B6577] dark:text-gray-400 mt-0.5 truncate">
                          {student.mentorTeacher}
                        </div>
                      </div>

                      {/* 3. AKADEMİK / DEVAM */}
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.08em] text-[#5B6577] dark:text-gray-400">
                          AKADEMİK / DEVAM
                        </div>
                        <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-900 dark:text-white mt-1">
                          <span className="text-[#B45309] dark:text-amber-400">
                            <Award size={15} strokeWidth={1.9} />
                          </span>
                          <span>GNO: {student.gpa}</span>
                        </div>
                        <div className="text-[12px] font-bold text-[#047857] dark:text-emerald-400 mt-0.5">
                          Devam: %{student.attendanceRate}
                        </div>
                      </div>

                      {/* 4. VELİ İLETİŞİM */}
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.08em] text-[#5B6577] dark:text-gray-400">
                          VELİ İLETİŞİM
                        </div>
                        <div className="text-[13px] font-bold text-gray-900 dark:text-white mt-1 leading-[1.3] truncate">
                          {student.parentName}
                        </div>
                        <div className="flex items-center gap-1 text-[12px] text-[#5B6577] dark:text-gray-400 mt-0.5">
                          <Phone size={12} strokeWidth={1.9} />
                          <span className="truncate">{student.parentPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Row (NO EDIT BUTTON - restricted to School Principal) */}
                    <div className="flex items-center gap-2 pt-0.5">
                      {/* Nakil / Sınıf Değiştir */}
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        type="button"
                        onClick={() => setTransferTargetStudent(student)}
                        aria-label="Nakil / sınıf değiştir"
                        title="Nakil / Sınıf Değiştir"
                        className="w-[44px] h-[44px] rounded-[14px] bg-[#F1F4F9] dark:bg-[#161D2E] hover:bg-[#E5EAF3] dark:hover:bg-gray-700 text-[#334155] dark:text-gray-300 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                      >
                        <ArrowRightLeft size={19} strokeWidth={1.9} />
                      </motion.button>

                      {/* Kaydı Dondur / Aktifleştir */}
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        type="button"
                        onClick={() => handleToggleStatus(student)}
                        aria-label="Kaydı dondur"
                        title={student.status === 'active' ? 'Kaydı Dondur' : 'Kaydı Aktifleştir'}
                        className="w-[44px] h-[44px] rounded-[14px] bg-[#F1F4F9] dark:bg-[#161D2E] hover:bg-[#E5EAF3] dark:hover:bg-gray-700 text-[#334155] dark:text-gray-300 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                      >
                        {student.status === 'active' ? (
                          <PauseCircle size={19} strokeWidth={1.9} />
                        ) : (
                          <PlayCircle size={19} strokeWidth={1.9} className="text-[#34D399]" />
                        )}
                      </motion.button>

                      {/* Profil Button (Full Details with Micro Spring) */}
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        onClick={() => {
                          setSelectedStudentForProfile(student)
                          setActiveProfileTab('identity')
                        }}
                        className="flex-1 h-[44px] rounded-[14px] bg-[#ECEBFD] dark:bg-indigo-950/70 hover:bg-[#DFDCFC] dark:hover:bg-indigo-900/80 text-[#4338CA] dark:text-indigo-300 text-[13px] font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                      >
                        <Eye size={18} strokeWidth={1.9} />
                        <span>Profil</span>
                      </motion.button>
                    </div>
                  </motion.article>
                )
              })
            )}
          </motion.div>
        </main>
      </motion.div>

      {/* ── MODAL 1: ÖĞRENCİ TÜM BİLGİLERİ (BÜTÜN DETAYLAR - DÜZENLEME BUTONSUZ) ── */}
      <AnimatePresence>
        {selectedStudentForProfile && (
          <div className={`${theme} fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta`}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudentForProfile(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Modal Sheet */}
            <motion.div
              initial={{ y: '100%', opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full sm:max-w-md bg-white dark:bg-[#0E1526] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] flex flex-col z-10 overflow-hidden pb-[env(safe-area-inset-bottom)]"
            >
              {/* Drag Handle */}
              <div className="pt-2.5 pb-1 flex justify-center sm:hidden">
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>

              {/* Profile Header */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#34D399] to-[#0F766E] text-white text-xl font-black flex items-center justify-center shadow-md">
                    {selectedStudentForProfile.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                      {selectedStudentForProfile.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-500 font-mono">
                        No: {selectedStudentForProfile.studentNo}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedStudentForProfile.className}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudentForProfile(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Navigation Tabs with Morph Indicator */}
              <div className="flex items-center justify-between px-3 pt-2 pb-1 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold overflow-x-auto scrollbar-hide">
                {[
                  { key: 'identity', label: 'Kimlik & Künye' },
                  { key: 'academic', label: 'Akademik & Dersler' },
                  { key: 'attendance', label: 'Devam & Sağlık' },
                  { key: 'parent', label: 'Veli & Rehberlik' },
                ].map((tab) => {
                  const isCur = activeProfileTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveProfileTab(tab.key as any)}
                      className={`relative px-3 py-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                        isCur
                          ? 'text-gray-900 dark:text-white font-extrabold'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium'
                      }`}
                    >
                      {isCur && (
                        <motion.div
                          layoutId="profileActiveTab"
                          className="absolute inset-0 bg-gray-100 dark:bg-gray-800/80 rounded-xl -z-10"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Profile Body (Scrollable with rich data) */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {/* ── TAB 1: KİMLİK & KÜNYE BİLGİLERİ ── */}
                {activeProfileTab === 'identity' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3.5"
                  >
                    <div className="p-4 rounded-2xl bg-[#F6F8FC] dark:bg-[#131C31] border border-gray-100 dark:border-gray-800 space-y-3">
                      <span className="font-extrabold text-[11px] text-gray-400 tracking-wider uppercase block">
                        RESMİ ÖĞRENCİ KİMLİK BİLGİLERİ
                      </span>
                      <div className="grid grid-cols-2 gap-3 text-gray-800 dark:text-gray-200">
                        <div>
                          <span className="text-gray-400 block text-[10px]">T.C. Kimlik No</span>
                          <span className="font-mono font-bold text-sm">{selectedStudentForProfile.tcNo}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Öğrenci No</span>
                          <span className="font-bold text-sm">{selectedStudentForProfile.studentNo}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Cinsiyet</span>
                          <span className="font-bold">{selectedStudentForProfile.gender}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Doğum Tarihi / Yaş</span>
                          <span className="font-bold">{selectedStudentForProfile.birthDate}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Kan Grubu</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {selectedStudentForProfile.bloodType}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Kayıt Tarihi</span>
                          <span className="font-bold">{selectedStudentForProfile.enrollmentDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F6F8FC] dark:bg-[#131C31] border border-gray-100 dark:border-gray-800 space-y-3">
                      <span className="font-extrabold text-[11px] text-gray-400 tracking-wider uppercase block">
                        OKUL VE ŞUBE DAĞILIMI
                      </span>
                      <div className="grid grid-cols-2 gap-3 text-gray-800 dark:text-gray-200">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Okul</span>
                          <span className="font-bold">{selectedStudentForProfile.schoolName}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Sınıf & Şube</span>
                          <span className="font-bold text-[#4338CA] dark:text-indigo-400">
                            {selectedStudentForProfile.className}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Sınıf Rehber Öğretmeni</span>
                          <span className="font-bold">{selectedStudentForProfile.mentorTeacher}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Disiplin Durumu</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {selectedStudentForProfile.disciplineStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F6F8FC] dark:bg-[#131C31] border border-gray-100 dark:border-gray-800 space-y-1.5">
                      <span className="font-extrabold text-[11px] text-gray-400 tracking-wider uppercase block">
                        İKAMETGÂH ADRESİ
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                        {selectedStudentForProfile.address}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ── TAB 2: AKADEMİK VE DERSLER ── */}
                {activeProfileTab === 'academic' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3.5"
                  >
                    {/* Top Stat Cards */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 text-center">
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block">
                          GNO
                        </span>
                        <span className="text-lg font-black text-amber-900 dark:text-amber-200">
                          {selectedStudentForProfile.gpa}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60 text-center">
                        <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold block">
                          Sıralama
                        </span>
                        <span className="text-lg font-black text-purple-900 dark:text-purple-200">
                          #{selectedStudentForProfile.classRank}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-center">
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                          Ödevler
                        </span>
                        <span className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                          %100
                        </span>
                      </div>
                    </div>

                    {/* Detailed Course Grades Table */}
                    <div className="p-4 rounded-2xl bg-[#F6F8FC] dark:bg-[#131C31] border border-gray-100 dark:border-gray-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[11px] text-gray-400 tracking-wider uppercase block">
                          DERS BAZLI NOT VE BAŞARI DURUMU
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">1. Dönem</span>
                      </div>

                      <div className="space-y-2.5">
                        {selectedStudentForProfile.grades?.map((g) => (
                          <div
                            key={g.courseName}
                            className="p-3 rounded-xl bg-white dark:bg-[#161D2E] border border-gray-100 dark:border-gray-800 flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-gray-900 dark:text-white block">
                                {g.courseName}
                              </span>
                              <span className="text-[10px] text-gray-400 block mt-0.5">
                                Sınav 1: {g.exam1} · Sınav 2: {g.exam2} · Perf: {g.performance}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-sm text-[#059669] dark:text-[#34D399]">
                                {g.average.toFixed(1)}
                              </span>
                              <span className="text-[9px] text-gray-400 block">Ortalama</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Teacher Notes */}
                    <div className="p-4 rounded-2xl bg-[#F6F8FC] dark:bg-[#131C31] border border-gray-100 dark:border-gray-800 space-y-1.5">
                      <span className="font-extrabold text-[11px] text-gray-400 tracking-wider uppercase block">
                        ÖĞRETMEN GÖZLEM VE GELİŞİM NOTU
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                        {selectedStudentForProfile.notes}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ── TAB 3: DEVAM VE SAĞLIK ── */}
                {activeProfileTab === 'attendance' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3.5"
                  >
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">
                          Devamlılık Oranı
                        </span>
                        <span className="text-xl font-black text-emerald-900 dark:text-emerald-200">
                          %{selectedStudentForProfile.attendanceRate}
                        </span>
                      </div>
                      <div className="w-full bg-emerald-200/70 dark:bg-emerald-900/60 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${selectedStudentForProfile.attendanceRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F6F8FC] dark:bg-[#131C31] border border-gray-100 dark:border-gray-800 space-y-3">
                      <span className="font-extrabold text-[11px] text-gray-400 tracking-wider uppercase block">
                        DEVAMSIZLIK İSTATİSTİKLERİ
                      </span>
                      <div className="grid grid-cols-2 gap-3 text-gray-800 dark:text-gray-200">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Özürlü Devamsızlık</span>
                          <span className="font-bold text-sm">
                            {selectedStudentForProfile.absentExcusedDays} Gün
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Özürsüz Devamsızlık</span>
                          <span className="font-bold text-sm">
                            {selectedStudentForProfile.absentUnexcusedDays} Gün
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Toplam Devamsızlık</span>
                          <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                            {selectedStudentForProfile.absentExcusedDays +
                              selectedStudentForProfile.absentUnexcusedDays}{' '}
                            Gün
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Kalan İzin Hakkı</span>
                          <span className="font-bold text-sm">10 Gün</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F6F8FC] dark:bg-[#131C31] border border-gray-100 dark:border-gray-800 space-y-2">
                      <span className="font-extrabold text-[11px] text-gray-400 tracking-wider uppercase block">
                        ÖZEL SAĞLIK VE ALERJİ BİLGİSİ
                      </span>
                      <div className="flex items-start gap-2.5">
                        <HeartPulse size={16} className="text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                          {selectedStudentForProfile.specialHealthNote}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── TAB 4: VELİ VE REHBERLİK ── */}
                {activeProfileTab === 'parent' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3.5"
                  >
                    {/* Primary Parent */}
                    <div className="p-4 rounded-2xl bg-[#F6F8FC] dark:bg-[#131C31] border border-gray-100 dark:border-gray-800 space-y-2.5">
                      <span className="font-extrabold text-[11px] text-gray-400 tracking-wider uppercase block">
                        1. DERECE VELİ
                      </span>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">
                            {selectedStudentForProfile.parentName}
                          </p>
                          <p className="text-gray-500 text-[11px] mt-0.5">
                            Meslek: {selectedStudentForProfile.parentOccupation}
                          </p>
                          <p className="text-gray-500 font-mono text-[11px] mt-0.5">
                            {selectedStudentForProfile.parentPhone}
                          </p>
                        </div>
                        <a
                          href={`tel:${selectedStudentForProfile.parentPhone}`}
                          className="px-3.5 py-2 rounded-xl bg-[#34D399] hover:bg-[#2fd398] text-[#0A0D15] font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-transform"
                        >
                          <Phone size={14} />
                          <span>Ara</span>
                        </a>
                      </div>
                    </div>

                    {/* Secondary Parent if exists */}
                    {selectedStudentForProfile.secondParentName && (
                      <div className="p-4 rounded-2xl bg-[#F6F8FC] dark:bg-[#131C31] border border-gray-100 dark:border-gray-800 space-y-2.5">
                        <span className="font-extrabold text-[11px] text-gray-400 tracking-wider uppercase block">
                          2. DERECE VELİ
                        </span>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                              {selectedStudentForProfile.secondParentName}
                            </p>
                            <p className="text-gray-500 font-mono text-[11px] mt-0.5">
                              {selectedStudentForProfile.secondParentPhone}
                            </p>
                          </div>
                          {selectedStudentForProfile.secondParentPhone && (
                            <a
                              href={`tel:${selectedStudentForProfile.secondParentPhone}`}
                              className="px-3.5 py-2 rounded-xl bg-[#34D399] hover:bg-[#2fd398] text-[#0A0D15] font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-transform"
                            >
                              <Phone size={14} />
                              <span>Ara</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Guidance notes log */}
                    <div className="p-4 rounded-2xl bg-[#F6F8FC] dark:bg-[#131C31] border border-gray-100 dark:border-gray-800 space-y-2.5">
                      <span className="font-extrabold text-[11px] text-gray-400 tracking-wider uppercase block">
                        REHBERLİK SERVİSİ GÖRÜŞME KAYITLARI
                      </span>
                      {selectedStudentForProfile.guidanceNotes &&
                      selectedStudentForProfile.guidanceNotes.length > 0 ? (
                        <div className="space-y-2">
                          {selectedStudentForProfile.guidanceNotes.map((gn) => (
                            <div
                              key={gn.id}
                              className="p-3 rounded-xl bg-white dark:bg-[#161D2E] border border-gray-100 dark:border-gray-800 text-[11px]"
                            >
                              <div className="flex items-center justify-between text-gray-400 mb-1">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                  {gn.author}
                                </span>
                                <span>{gn.date}</span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                {gn.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-[11px]">
                          Henüz kayıtlı rehberlik görüşmesi bulunmamaktadır.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}


              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: PRATİK GÜNLÜK YOKLAMA (TEK TIK: BURADA, BASILI TUT: YOK) ── */}
      <AnimatePresence>
        {isAttendanceModalOpen && (
          <div className={`${theme} fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta`}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAttendanceModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full sm:max-w-md bg-white dark:bg-[#0E1526] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[88vh] flex flex-col z-10 overflow-hidden pb-[env(safe-area-inset-bottom)]"
            >
              {/* Header */}
              <div className="p-4.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Günlük Sınıf Yoklaması</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                      {selectedClassFilter === 'all' ? '1-A Şubesi' : selectedClassFilter}
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Practical Gesture Guide Banner & Quick Actions */}
              <div className="px-4 py-2.5 bg-gray-50 dark:bg-[#131C31] border-b border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                      {
                        students.filter(
                          (s) =>
                            (selectedClassFilter === 'all' || s.className === selectedClassFilter) &&
                            s.status === 'active' &&
                            attendanceRecords[s.id] !== 'absent'
                        ).length
                      }{' '}
                      Mevcut
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-extrabold text-xs">
                      {
                        students.filter(
                          (s) =>
                            (selectedClassFilter === 'all' || s.className === selectedClassFilter) &&
                            s.status === 'active' &&
                            attendanceRecords[s.id] === 'absent'
                        ).length
                      }{' '}
                      Eksik
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleMarkAllPresent}
                    className="text-[11px] font-bold text-[#4338CA] dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Hepsini Var İşaretle
                  </button>
                </div>

                <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#34D399] shrink-0" />
                  <span>
                    <strong>Tek Tık:</strong> Burada (Yeşil) · <strong>Basılı Tut:</strong> Yok (Kırmızı)
                  </span>
                </div>
              </div>

              {/* Real Classroom Students List */}
              <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                {students
                  .filter(
                    (s) =>
                      (selectedClassFilter === 'all' || s.className === selectedClassFilter) &&
                      s.status === 'active'
                  )
                  .map((st) => {
                    const status = attendanceRecords[st.id]
                    const isPresent = status === 'present'
                    const isAbsent = status === 'absent'

                    return (
                      <div
                        key={st.id}
                        onPointerDown={() => handlePointerDown(st.id, st.name)}
                        onPointerUp={() => handlePointerUp(st.id, st.name)}
                        onPointerCancel={handlePointerCancel}
                        onContextMenu={(e) => e.preventDefault()}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer select-none flex items-center justify-between gap-3 active:scale-[0.98] ${
                          isPresent
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-xs'
                            : isAbsent
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-950 dark:text-rose-100 shadow-xs'
                            : 'bg-white dark:bg-[#131C31] border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                              isPresent
                                ? 'bg-emerald-500 text-white'
                                : isAbsent
                                ? 'bg-rose-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {st.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs block truncate">{st.name}</span>
                            <span className="text-[10px] text-gray-400 block font-mono">
                              {st.studentNo} • {st.className}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isPresent ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500 text-white flex items-center gap-1 shadow-xs">
                              <Check size={12} strokeWidth={3} />
                              <span>Burada</span>
                            </span>
                          ) : isAbsent ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500 text-white flex items-center gap-1 shadow-xs">
                              <X size={12} strokeWidth={3} />
                              <span>Yok</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-0.5">
                              Tıkla: Var / Basılı Tut: Yok
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>

              {/* Submit CTA */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={handleSaveAttendance}
                  className="w-full h-11 bg-[#34D399] hover:bg-[#2fe0a0] text-[#0A0D15] font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Save size={16} />
                  <span>Yoklamayı Onayla & Sisteme Kaydet</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 5: QR BAĞLANTI (Akıllı Tahta) ── */}
      <ConnectBoardModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        theme={theme}
      />
    </div>
  )

  if (hideHeader) {
    return pageContent
  }

  return (
    <div
      className={`${theme} min-h-[100dvh] w-full bg-[#0A0D15] sm:bg-[#E2E8F0] sm:dark:bg-[#06090F] flex justify-center selection:bg-[#34D399]/30 selection:text-emerald-950 transition-colors duration-300 font-jakarta overscroll-none`}
    >
      <div
        className="w-full sm:max-w-[390px] min-h-[100dvh] bg-[#F8FAFC] dark:bg-[#0A0D15] sm:shadow-2xl relative flex flex-col pb-24 sm:border-x border-gray-200/60 dark:border-gray-800/80 overflow-x-hidden overscroll-y-none"
      >
        <MobileHeader theme={theme} onToggleTheme={toggleTheme} />
        {pageContent}
        {!hideDock && <MobileFloatingDock activeTab="student" />}
      </div>
    </div>
  )
}
