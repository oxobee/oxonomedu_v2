'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Save,
  Volume2,
  Users,
  Layers,
  X,
  QrCode,
  ArrowRight,
  Sparkles,
  ExternalLink,
  RotateCcw,
  BookOpenCheck,
  Calendar,
  Filter,
  ArrowUpDown,
  BookMarked,
  Check,
  Sun,
  Moon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileFloatingDock from '@components/Mobile/MobileFloatingDock'
import ConnectBoardModal from '@components/DashboardV2/ConnectBoardModal'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import { ALL_INITIAL_STUDENTS, type MStudentItem } from '@components/Mobile/MStudentClient'
import {
  DEFAULT_SCHOOL_ASSIGNMENTS,
  getStoredCustomAssignments,
  type SchoolAssignmentItem,
} from '@services/school_assignments/school_assignments'

export interface HomeworkItem {
  id: string
  assignment_uuid?: string
  title: string
  shortTitle: string
  subject: 'Türkçe' | 'Matematik' | 'Hayat Bilgisi' | 'Fen Bilimleri' | 'Görsel Sanatlar' | 'İngilizce' | 'Sosyal Bilgiler'
  category: 'READING' | 'MATH' | 'SCIENCE' | 'LIFE_STUDIES' | 'ART' | 'ENGLISH' | 'WHITEBOARD' | 'WORKSHEET' | 'QUIZ'
  tool_type?: 'WHITEBOARD' | 'WORKSHEET' | 'QUIZ' | 'READING' | 'PROJECT'
  board_uuid?: string
  className: string
  assignedDate: string
  dueDate: string
  assignedTimestamp: number
  dueTimestamp: number
  description: string
  period: 'this_week' | 'past' | 'upcoming'
  periodLabel: string
  accentColor: 'rose' | 'blue' | 'emerald' | 'amber' | 'purple'
  max_score?: number
  teacher_name?: string
}

interface SubmissionRecord {
  studentId: string
  score: number
  feedback: string
  submittedAt: string
  status: 'submitted' | 'late' | 'not_submitted'
}

const DEFAULT_TEMPLATES = [
  'Harika bir çalışma, tebrik ederim!',
  'Çözüm adımların doğru ve anlaşılır, eline sağlık.',
  'Çözümün genel olarak başarılı, küçük eksikler var.',
  'Eksik kısımları tamamlayıp tekrar inceleyebilirsin.',
]

const QUICK_SCORES = [100, 95, 90, 85, 75, 60, 50]

const BRANCH_OPTIONS = [
  { id: 'all', title: 'Tüm Sınıflar ve Şubeler', desc: 'Filtreleme yapmadan tüm okul ödevlerini gösterir', isAll: true },
  { id: '1-A', title: '1-A Şubesi', desc: 'Öğretmen: Özlem ZOR (30 Öğrenci)', isAll: false },
  { id: '1-B', title: '1-B Şubesi', desc: 'Öğretmen: Beyzanur SALMANLI (30 Öğrenci)', isAll: false },
  { id: '1-C', title: '1-C Şubesi', desc: 'Öğretmen: Özge KABA (30 Öğrenci)', isAll: false },
  { id: '1-D', title: '1-D Şubesi', desc: 'Öğretmen: Hande YILDIZ (30 Öğrenci)', isAll: false },
  { id: '1-E', title: '1-E Şubesi', desc: 'Öğretmen: Serkan ÇELİK (30 Öğrenci)', isAll: false },
  { id: '1-F', title: '1-F Şubesi', desc: 'Öğretmen: Merve AKSOY (30 Öğrenci)', isAll: false },
  { id: '1-G', title: '1-G Şubesi', desc: 'Öğretmen: Tolga DEMİR (30 Öğrenci)', isAll: false },
]

// Real school assignments across classes with authentic board UUIDs
const INITIAL_HOMEWORKS: HomeworkItem[] = [
  // ── 1-A ŞUBESİ ──
  {
    id: 'hw-1a-1',
    assignment_uuid: 'asg_ritmik_sayma_01',
    title: '1-A Matematik: Ritmik Sayma & Sayı Doğrusu Etkinliği',
    shortTitle: 'Ritmik Sayma & Sayı Doğrusu',
    subject: 'Matematik',
    category: 'MATH',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_6be7ebed-4c00-4243-9a9b-ffef9933803b',
    className: '1-A Şubesi',
    assignedDate: '08.10.2026',
    dueDate: '15.10.2026 23:59',
    assignedTimestamp: new Date('2026-10-08').getTime(),
    dueTimestamp: new Date('2026-10-15T23:59:00').getTime(),
    description: '1’er ve 2’şer ileriye doğru ritmik sayma kurallarını akıllı tahtada sayı doğrusunda zıplayarak tamamlayınız.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'blue',
    teacher_name: 'Özlem ZOR',
  },
  {
    id: 'hw-1a-2',
    assignment_uuid: 'asg_hizli_okuma_02',
    title: '1-A Türkçe: 1 Dk Hızlı Okuma & Kelime Sayacı Çalışması',
    shortTitle: '1 Dk Hızlı Okuma & Kelime Sayacı',
    subject: 'Türkçe',
    category: 'READING',
    tool_type: 'READING',
    className: '1-A Şubesi',
    assignedDate: '07.10.2026',
    dueDate: '14.10.2026 23:59',
    assignedTimestamp: new Date('2026-10-07').getTime(),
    dueTimestamp: new Date('2026-10-14T23:59:00').getTime(),
    description: 'Verilen metni 1 dakika boyunca sesli okuyarak kelime sayacını başlatınız ve puanınızı kaydediniz.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'rose',
    teacher_name: 'Özlem ZOR',
  },
  {
    id: 'hw-1a-3',
    assignment_uuid: 'asg_harf_cizgi_03',
    title: '1-A Türkçe: Harf Çizgi & Yazılış Yönü Atölyesi (Dik Temel Harfler)',
    shortTitle: 'Harf Çizgi & Yazılış Yönü Atölyesi',
    subject: 'Türkçe',
    category: 'READING',
    tool_type: 'WORKSHEET',
    className: '1-A Şubesi',
    assignedDate: '06.10.2026',
    dueDate: '13.10.2026 23:59',
    assignedTimestamp: new Date('2026-10-06').getTime(),
    dueTimestamp: new Date('2026-10-13T23:59:00').getTime(),
    description: 'MEB standart dik temel harfleri ok yönlerini takip ederek tamamlayınız.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'rose',
    teacher_name: 'Özlem ZOR',
  },
  {
    id: 'hw-1a-4',
    title: '1-A Hayat Bilgisi: Sağlıklı Yaşam ve Dengeli Beslenme Tablosu',
    shortTitle: 'Sağlıklı Yaşam & Dengeli Beslenme',
    subject: 'Hayat Bilgisi',
    category: 'LIFE_STUDIES',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_101_hayat',
    className: '1-A Şubesi',
    assignedDate: '28.09.2026',
    dueDate: '05.10.2026 23:59',
    assignedTimestamp: new Date('2026-09-28').getTime(),
    dueTimestamp: new Date('2026-10-05T23:59:00').getTime(),
    description: 'Haftalık sağlıklı beslenme, uyku ve hijyen günlüğünü akıllı tahta tablosuna işleyiniz.',
    period: 'past',
    periodLabel: 'Geçen Hafta',
    accentColor: 'emerald',
    teacher_name: 'Özlem ZOR',
  },
  {
    id: 'hw-1a-5',
    title: '1-A Görsel Sanatlar & Bilişim: Çizim ve Tasarım Atölyesi',
    shortTitle: 'Çizim ve Tasarım Atölyesi',
    subject: 'Görsel Sanatlar',
    category: 'ART',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_101_sanat',
    className: '1-A Şubesi',
    assignedDate: '20.09.2026',
    dueDate: '27.09.2026 23:59',
    assignedTimestamp: new Date('2026-09-20').getTime(),
    dueTimestamp: new Date('2026-09-27T23:59:00').getTime(),
    description: 'Dijital resim, renk teorisi ve serbest çizim tuvali üzerinde geometrik desenler oluşturunuz.',
    period: 'past',
    periodLabel: 'Eylül Ayı',
    accentColor: 'purple',
    teacher_name: 'Özlem ZOR',
  },
  {
    id: 'hw-1a-6',
    title: '1-A Matematik: Basit Toplama ve Çıkarma Problemleri',
    shortTitle: 'Toplama & Çıkarma Problemleri',
    subject: 'Matematik',
    category: 'MATH',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_6be7ebed-4c00-4243-9a9b-ffef9933803b',
    className: '1-A Şubesi',
    assignedDate: '12.10.2026',
    dueDate: '19.10.2026 23:59',
    assignedTimestamp: new Date('2026-10-12').getTime(),
    dueTimestamp: new Date('2026-10-19T23:59:00').getTime(),
    description: 'Görsel nesneler ve sayı çubukları ile 20’ye kadar toplama-çıkarma problem adımlarını akıllı tahtada çözünüz.',
    period: 'upcoming',
    periodLabel: 'Gelecek Hafta',
    accentColor: 'blue',
    teacher_name: 'Özlem ZOR',
  },

  // ── 1-B ŞUBESİ ──
  {
    id: 'hw-1b-1',
    title: '1-B Matematik: Doğal Sayılar ve Onluk-Birlik Blokları',
    shortTitle: 'Doğal Sayılar & Onluk-Birlik',
    subject: 'Matematik',
    category: 'MATH',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_102_mat',
    className: '1-B Şubesi',
    assignedDate: '08.10.2026',
    dueDate: '15.10.2026 23:59',
    assignedTimestamp: new Date('2026-10-08').getTime(),
    dueTimestamp: new Date('2026-10-15T23:59:00').getTime(),
    description: 'Onluk taban bloklarını kullanarak iki basamaklı sayıları modelleyiniz ve basamak değerlerini gösteriniz.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'blue',
    teacher_name: 'Beyzanur SALMANLI',
  },
  {
    id: 'hw-1b-2',
    title: '1-B Türkçe: Okuduğunu Anlama ve Görsel Okuma',
    shortTitle: 'Okuduğunu Anlama & Görsel Okuma',
    subject: 'Türkçe',
    category: 'READING',
    tool_type: 'READING',
    className: '1-B Şubesi',
    assignedDate: '07.10.2026',
    dueDate: '14.10.2026 23:59',
    assignedTimestamp: new Date('2026-10-07').getTime(),
    dueTimestamp: new Date('2026-10-14T23:59:00').getTime(),
    description: 'Kısa hikayeyi okuyup 5N1K sorularını yanıtlayınız.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'rose',
    teacher_name: 'Beyzanur SALMANLI',
  },
  {
    id: 'hw-1b-3',
    title: '1-B Hayat Bilgisi: Okul Kuralları & Güvenli Yaşam',
    shortTitle: 'Okul Kuralları & Güvenli Yaşam',
    subject: 'Hayat Bilgisi',
    category: 'LIFE_STUDIES',
    tool_type: 'WORKSHEET',
    className: '1-B Şubesi',
    assignedDate: '29.09.2026',
    dueDate: '06.10.2026 23:59',
    assignedTimestamp: new Date('2026-09-29').getTime(),
    dueTimestamp: new Date('2026-10-06T23:59:00').getTime(),
    description: 'Sınıf kuralları ve acil durumlarda yapılacaklar listesini eşleştiriniz.',
    period: 'past',
    periodLabel: 'Geçen Hafta',
    accentColor: 'emerald',
    teacher_name: 'Beyzanur SALMANLI',
  },

  // ── 1-C ŞUBESİ ──
  {
    id: 'hw-1c-1',
    title: '1-C Matematik: Geometrik Cisimler ve Şekiller',
    shortTitle: 'Geometrik Cisimler & Şekiller',
    subject: 'Matematik',
    category: 'MATH',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_103_mat',
    className: '1-C Şubesi',
    assignedDate: '08.10.2026',
    dueDate: '15.10.2026 23:59',
    assignedTimestamp: new Date('2026-10-08').getTime(),
    dueTimestamp: new Date('2026-10-15T23:59:00').getTime(),
    description: 'Küp, prizma ve silindir modellerini akıllı tahta üzerinde döndürerek köşe ve yüzlerini belirleyiniz.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'blue',
    teacher_name: 'Özge KABA',
  },
  {
    id: 'hw-1c-2',
    title: '1-C Türkçe: Hece Bilgisi ve Anlamlı Sözcük Türetme',
    shortTitle: 'Hece Bilgisi & Anlamlı Sözcükler',
    subject: 'Türkçe',
    category: 'READING',
    tool_type: 'WORKSHEET',
    className: '1-C Şubesi',
    assignedDate: '12.10.2026',
    dueDate: '19.10.2026 23:59',
    assignedTimestamp: new Date('2026-10-12').getTime(),
    dueTimestamp: new Date('2026-10-19T23:59:00').getTime(),
    description: 'Verilen karışık hecelerden anlamlı sözcükler kurarak cümle içinde kullanınız.',
    period: 'upcoming',
    periodLabel: 'Gelecek Hafta',
    accentColor: 'rose',
    teacher_name: 'Özge KABA',
  },

  // ── 1-D ŞUBESİ ──
  {
    id: 'hw-1d-1',
    title: '1-D Matematik: Paralarımız ve Alışveriş Problemleri',
    shortTitle: 'Paralarımız & Alışveriş',
    subject: 'Matematik',
    category: 'MATH',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_104_mat',
    className: '1-D Şubesi',
    assignedDate: '07.10.2026',
    dueDate: '14.10.2026 23:59',
    assignedTimestamp: new Date('2026-10-07').getTime(),
    dueTimestamp: new Date('2026-10-14T23:59:00').getTime(),
    description: 'Madeni paralarımızla basit market alışverişi hesaplamalarını akıllı tahtada yapınız.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'blue',
    teacher_name: 'Hande YILDIZ',
  },

  // ── 1-E ŞUBESİ ──
  {
    id: 'hw-1e-1',
    title: '1-E Hayat Bilgisi: Ailemiz ve Evimizdeki Sorumluluklar',
    shortTitle: 'Ailemiz & Sorumluluklar',
    subject: 'Hayat Bilgisi',
    category: 'LIFE_STUDIES',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_105_hayat',
    className: '1-E Şubesi',
    assignedDate: '06.10.2026',
    dueDate: '13.10.2026 23:59',
    assignedTimestamp: new Date('2026-10-06').getTime(),
    dueTimestamp: new Date('2026-10-13T23:59:00').getTime(),
    description: 'Evde yardımlaşma tablosunu hazırlayıp akıllı tahtada paylaşınız.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'emerald',
    teacher_name: 'Serkan ÇELİK',
  },

  // ── 1-F ŞUBESİ ──
  {
    id: 'hw-1f-1',
    title: '1-F Matematik: Zamanı Ölçme ve Saat Okuma',
    shortTitle: 'Zamanı Ölçme & Saat Okuma',
    subject: 'Matematik',
    category: 'MATH',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_106_mat',
    className: '1-F Şubesi',
    assignedDate: '08.10.2026',
    dueDate: '15.10.2026 23:59',
    assignedTimestamp: new Date('2026-10-08').getTime(),
    dueTimestamp: new Date('2026-10-15T23:59:00').getTime(),
    description: 'Tam ve yarım saatleri analog saat üzerinde akrep ve yelkovanı ayarlayarak gösteriniz.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'blue',
    teacher_name: 'Merve AKSOY',
  },

  // ── 1-G ŞUBESİ ──
  {
    id: 'hw-1g-1',
    title: '1-G Türkçe: Masal Analizi ve 5N1K Çözümlemesi',
    shortTitle: 'Masal Analizi & 5N1K',
    subject: 'Türkçe',
    category: 'READING',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_107_turkce',
    className: '1-G Şubesi',
    assignedDate: '07.10.2026',
    dueDate: '14.10.2026 23:59',
    assignedTimestamp: new Date('2026-10-07').getTime(),
    dueTimestamp: new Date('2026-10-14T23:59:00').getTime(),
    description: 'Okunan masalın kahramanlarını ve olay örgüsünü akıllı tahta kavram haritasında birleştiriniz.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'rose',
    teacher_name: 'Tolga DEMİR',
  },
]

export interface MHomeworkClientProps {
  hideDock?: boolean
  hideHeader?: boolean
  theme?: 'light' | 'dark'
  onToggleTheme?: () => void
}

export default function MHomeworkClient({
  hideDock = false,
  hideHeader = false,
  theme: propTheme,
  onToggleTheme: propToggleTheme,
}: MHomeworkClientProps = {}) {
  // Synchronized theme state for unified header and UI styling
  const { theme: internalTheme, toggleTheme: internalToggleTheme } = useMobileTheme()
  const theme = propTheme || internalTheme
  const toggleTheme = propToggleTheme || internalToggleTheme

  // Prevent pinch-to-zoom & gesture changes
  useEffect(() => {
    const preventMultiTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault()
    }
    const preventGesture = (e: Event) => e.preventDefault()
    document.addEventListener('touchmove', preventMultiTouch, { passive: false })
    document.addEventListener('gesturestart', preventGesture)
    document.addEventListener('gesturechange', preventGesture)
    return () => {
      document.removeEventListener('touchmove', preventMultiTouch)
      document.removeEventListener('gesturestart', preventGesture)
      document.removeEventListener('gesturechange', preventGesture)
    }
  }, [])

  // Branch & Modals
  const [selectedBranch, setSelectedBranch] = useState('1-A Şubesi')
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false)
  const [branchSearch, setBranchSearch] = useState('')
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)

  // Homework Selector Modal state
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false)
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string>('hw-1a-1')
  const [homeworkDateFilter, setHomeworkDateFilter] = useState<'all' | 'this_week' | 'past' | 'upcoming'>('all')
  const [homeworkSearch, setHomeworkSearch] = useState('')
  const [homeworkSortBy, setHomeworkSortBy] = useState<'newest' | 'due' | 'subject'>('newest')

  // Real merged school assignments (Default + Stored Custom + Curricular)
  const allSchoolHomeworks = useMemo(() => {
    const customList = getStoredCustomAssignments()
    const convertedCustom: HomeworkItem[] = customList.map((asg) => {
      const className = asg.classes?.[0]?.name || `${asg.grade_level || '1'}-A Şubesi`
      const assignedMs = asg.creation_date ? new Date(asg.creation_date).getTime() : Date.now()
      const dueMs = asg.due_date ? new Date(asg.due_date).getTime() : Date.now() + 7 * 86400000
      const now = Date.now()
      let period: 'this_week' | 'past' | 'upcoming' = 'this_week'
      let periodLabel = 'Bu Hafta'
      if (dueMs < now) {
        period = 'past'
        periodLabel = 'Geçmiş'
      } else if (dueMs > now + 7 * 86400000) {
        period = 'upcoming'
        periodLabel = 'Gelecek'
      }

      return {
        id: String(asg.id || asg.assignment_uuid),
        assignment_uuid: asg.assignment_uuid,
        title: asg.title,
        shortTitle: asg.title.split(':')?.[1]?.trim() || asg.title,
        subject: (asg.subject as any) || 'Matematik',
        category: (asg.tool_type as any) || 'WHITEBOARD',
        tool_type: asg.tool_type,
        board_uuid: asg.board_uuid,
        className,
        assignedDate: new Date(assignedMs).toLocaleDateString('tr-TR'),
        dueDate: asg.due_date ? new Date(asg.due_date).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '15.10.2026 23:59',
        assignedTimestamp: assignedMs,
        dueTimestamp: dueMs,
        description: asg.description || 'Öğretmen tarafından tanımlanan ödev görevi.',
        period,
        periodLabel,
        accentColor: asg.subject === 'Türkçe' ? 'rose' : asg.subject === 'Hayat Bilgisi' ? 'emerald' : 'blue',
        max_score: asg.max_score || 100,
        teacher_name: asg.teacher_name || 'Sınıf Öğretmeni',
      }
    })

    return [...convertedCustom, ...INITIAL_HOMEWORKS]
  }, [])

  // Branch-specific students roster (Each branch now has full 30 students!)
  const students = useMemo(() => {
    if (selectedBranch === 'all' || selectedBranch === 'Tüm Şubeler' || selectedBranch === 'Tüm Sınıflar ve Şubeler') {
      return ALL_INITIAL_STUDENTS
    }
    const filtered = ALL_INITIAL_STUDENTS.filter((s) => s.className === selectedBranch)
    return filtered.length > 0 ? filtered : ALL_INITIAL_STUDENTS.filter((s) => s.className === '1-A Şubesi')
  }, [selectedBranch])

  const [selectedStudentId, setSelectedStudentId] = useState<string>('s-1')
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'on_time' | 'late' | 'not_submitted'>('all')

  // Submissions Map: Record<homeworkId, Record<studentId, SubmissionRecord>>
  const [allSubmissions, setAllSubmissions] = useState<Record<string, Record<string, SubmissionRecord>>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('m_homework_submissions_v2')
        if (saved) return JSON.parse(saved)
      } catch (err) {
        console.warn('Could not restore submissions from localStorage:', err)
      }
    }
    return {}
  })

  // Sync active homework when selectedHomeworkId changes
  const currentHomework = useMemo(() => {
    return allSchoolHomeworks.find((hw) => hw.id === selectedHomeworkId) || allSchoolHomeworks[0]
  }, [allSchoolHomeworks, selectedHomeworkId])

  // Current Homework's Submissions Map
  const currentSubmissions = useMemo(() => {
    return allSubmissions[currentHomework.id] || {}
  }, [allSubmissions, currentHomework.id])

  // Grading form state for the currently active student
  const [currentScore, setCurrentScore] = useState<number>(100)
  const [currentFeedback, setCurrentFeedback] = useState<string>('')
  const carouselRef = useRef<HTMLDivElement>(null)

  // Sync grading input when selected student or homework changes
  useEffect(() => {
    const existing = currentSubmissions[selectedStudentId]
    if (existing) {
      setCurrentScore(existing.score)
      setCurrentFeedback(existing.feedback || '')
    } else {
      setCurrentScore(100)
      setCurrentFeedback('')
    }
  }, [selectedStudentId, currentSubmissions])

  // Persist submissions
  const saveAllSubmissions = (newAll: Record<string, Record<string, SubmissionRecord>>) => {
    setAllSubmissions(newAll)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('m_homework_submissions_v2', JSON.stringify(newAll))
      } catch (err) {
        console.warn('Failed to save submissions:', err)
      }
    }
  }

  // Selected Student Object
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0]
  }, [students, selectedStudentId])

  // Selected Student Index in list
  const selectedIndex = useMemo(() => {
    return students.findIndex((s) => s.id === selectedStudentId)
  }, [students, selectedStudentId])

  // Scroll carousel into view when student changes
  const handleSelectStudent = (id: string, index?: number) => {
    setSelectedStudentId(id)
    if (carouselRef.current && typeof index === 'number') {
      const cardWidth = 330
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      })
    }
  }

  // Filtered Students for the full list view
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.studentNo.toLowerCase().includes(studentSearch.toLowerCase())
      if (!matchesSearch) return false

      const sub = currentSubmissions[s.id]
      if (filterTab === 'on_time') return sub?.status === 'submitted'
      if (filterTab === 'late') return sub?.status === 'late'
      if (filterTab === 'not_submitted') return !sub || sub.status === 'not_submitted'
      return true
    })
  }, [students, studentSearch, filterTab, currentSubmissions])

  // Statistics calculation for the current homework
  const stats = useMemo(() => {
    const total = students.length
    let onTime = 0
    let late = 0
    Object.values(currentSubmissions).forEach((sub) => {
      if (sub.status === 'submitted') onTime++
      if (sub.status === 'late') late++
    })
    const notSubmitted = total - (onTime + late)
    return { total, onTime, late, notSubmitted }
  }, [students.length, currentSubmissions])

  // Handle Save Evaluation
  const handleSaveEvaluation = () => {
    if (!selectedStudent) return
    const now = new Date()
    const timeFormatted = `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`

    const newRecord: SubmissionRecord = {
      studentId: selectedStudent.id,
      score: currentScore,
      feedback: currentFeedback.trim(),
      submittedAt: timeFormatted,
      status: 'submitted',
    }

    const updatedHwSubmissions = {
      ...currentSubmissions,
      [selectedStudent.id]: newRecord,
    }

    const updatedAll = {
      ...allSubmissions,
      [currentHomework.id]: updatedHwSubmissions,
    }

    saveAllSubmissions(updatedAll)
    toast.success(`${selectedStudent.name} için ${currentScore} puan ve geri bildirim kaydedildi!`, {
      icon: '🎉',
      duration: 3500,
    })
  }

  // Filtered branches for the branch modal
  const filteredBranches = useMemo(() => {
    if (!branchSearch.trim()) return BRANCH_OPTIONS
    return BRANCH_OPTIONS.filter((b) =>
      b.title.toLowerCase().includes(branchSearch.toLowerCase())
    )
  }, [branchSearch])

  // Filtered and Sorted Homework Items for the Homework Selection Modal
  const classHomeworks = useMemo(() => {
    // 1. Branch filter
    let list = allSchoolHomeworks
    if (selectedBranch !== 'Tüm Şubeler' && selectedBranch !== 'all' && selectedBranch !== 'Tüm Sınıflar ve Şubeler') {
      list = list.filter((hw) => hw.className === selectedBranch)
    }

    // 2. Chronological/period filter
    if (homeworkDateFilter !== 'all') {
      list = list.filter((hw) => hw.period === homeworkDateFilter)
    }

    // 3. Search query filter
    if (homeworkSearch.trim()) {
      const q = homeworkSearch.toLowerCase()
      list = list.filter(
        (hw) =>
          hw.title.toLowerCase().includes(q) ||
          hw.subject.toLowerCase().includes(q) ||
          hw.description.toLowerCase().includes(q)
      )
    }

    // 4. Sorting
    const sorted = [...list]
    if (homeworkSortBy === 'newest') {
      sorted.sort((a, b) => b.assignedTimestamp - a.assignedTimestamp)
    } else if (homeworkSortBy === 'due') {
      sorted.sort((a, b) => a.dueTimestamp - b.dueTimestamp)
    } else if (homeworkSortBy === 'subject') {
      sorted.sort((a, b) => a.subject.localeCompare(b.subject, 'tr'))
    }

    return sorted
  }, [allSchoolHomeworks, selectedBranch, homeworkDateFilter, homeworkSearch, homeworkSortBy])

  // Homework count metrics for tabs
  const homeworkMetrics = useMemo(() => {
    const list =
      selectedBranch === 'Tüm Şubeler' || selectedBranch === 'all' || selectedBranch === 'Tüm Sınıflar ve Şubeler'
        ? allSchoolHomeworks
        : allSchoolHomeworks.filter((hw) => hw.className === selectedBranch)

    return {
      all: list.length,
      this_week: list.filter((hw) => hw.period === 'this_week').length,
      past: list.filter((hw) => hw.period === 'past').length,
      upcoming: list.filter((hw) => hw.period === 'upcoming').length,
    }
  }, [allSchoolHomeworks, selectedBranch])

  // Change selected homework
  const handleSelectHomework = (hw: HomeworkItem) => {
    setSelectedHomeworkId(hw.id)
    setIsHomeworkModalOpen(false)
    toast.success(`"${hw.shortTitle}" ödevi seçildi!`, {
      icon: '📚',
      duration: 3000,
    })
  }

  const isCurrentSubmitted = !!currentSubmissions[selectedStudent?.id]

  const pageContent = (
    <div className="flex flex-col flex-1 w-full">
      {/* ── STAGGERED PAGE CONTENT WRAPPER (Fluid Left Entrance) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col flex-1 w-full dash-stagger-items"
      >

        {/* ── 2. HERO / ASSIGNMENT INFO CARD ── */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mt-3 bg-[#0A0D15] text-white rounded-[22px] p-4 flex flex-col gap-3.5 shadow-xl border border-white/5 relative overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(circle at 100% 0%,rgba(255,255,255,.12) 0%,rgba(255,255,255,0) 55%),linear-gradient(45deg,rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(-45deg,rgba(255,255,255,.04) 1px,transparent 1px)',
            backgroundSize: 'auto,26px 26px,26px 26px',
          }}
        >
          {/* Title Row & Selectors */}
          <div className="flex items-start gap-3">
            <div className="w-[42px] h-[42px] rounded-[13px] bg-[#34D399]/15 border border-[#34D399]/35 text-[#34D399] flex items-center justify-center shrink-0 mt-0.5">
              <FileText size={22} strokeWidth={1.9} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Şube Seçimi Butonu */}
                  <button
                    type="button"
                    onClick={() => setIsBranchModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-[10.5px] font-bold text-[#34D399] transition-colors cursor-pointer"
                    title="Sınıf / Şube Değiştir"
                  >
                    <Users size={11} />
                    <span>{selectedBranch}</span>
                    <ChevronDown size={11} className="text-white/70" />
                  </button>

                  {/* Ödev Seç Butonu (Yeni İstek) */}
                  <button
                    type="button"
                    onClick={() => setIsHomeworkModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4338CA]/35 hover:bg-[#4338CA]/55 border border-[#4338CA]/60 text-[10.5px] font-extrabold text-indigo-200 transition-all cursor-pointer shadow-xs active:scale-95 group"
                    title="Bu sınıfa ait ödevleri seç ve tarihsel filtrele"
                  >
                    <BookOpenCheck size={12} className="text-[#34D399] group-hover:scale-110 transition-transform" />
                    <span>Ödev Seç</span>
                    <ChevronDown size={11} className="text-indigo-300" />
                  </button>
                </div>

                <span className="text-[10px] font-bold text-gray-400 shrink-0">
                  Ders: {currentHomework.subject}
                </span>
              </div>

              {/* Tıklanabilir Ödev Başlığı */}
              <button
                type="button"
                onClick={() => setIsHomeworkModalOpen(true)}
                className="text-left group flex items-start gap-1 w-full cursor-pointer"
                title="Ödevi değiştirmek için tıklayın"
              >
                <h1 className="text-[15px] leading-[1.3] font-extrabold tracking-tight text-white m-0 group-hover:text-emerald-300 transition-colors">
                  {currentHomework.title} — Teslim ve Değerlendirme
                </h1>
              </button>
            </div>
          </div>

          <p className="text-[12px] leading-[1.5] text-[#B4BDCC] m-0">
            {currentHomework.description}
          </p>

          {/* 4 Stat Boxes */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="bg-white/7 border border-white/12 rounded-[14px] py-2 px-1 text-center">
              <div className="text-[19px] font-extrabold text-white leading-tight">
                {stats.total}
              </div>
              <div className="text-[9px] font-bold tracking-wider text-[#B4BDCC] mt-1">
                TOPLAM
              </div>
            </div>

            <div className="bg-white/7 border border-white/12 rounded-[14px] py-2 px-1 text-center">
              <div className="text-[19px] font-extrabold text-[#6EE7B7] leading-tight">
                {stats.onTime}
              </div>
              <div className="text-[9px] font-bold tracking-wider text-[#B4BDCC] mt-1">
                ZAMANINDA
              </div>
            </div>

            <div className="bg-white/7 border border-white/12 rounded-[14px] py-2 px-1 text-center">
              <div className="text-[19px] font-extrabold text-[#FCD34D] leading-tight">
                {stats.late}
              </div>
              <div className="text-[9px] font-bold tracking-wider text-[#B4BDCC] mt-1">
                GEÇ
              </div>
            </div>

            <div className="bg-white/7 border border-white/12 rounded-[14px] py-2 px-1 text-center">
              <div className="text-[19px] font-extrabold text-[#FCA5A5] leading-tight">
                {stats.notSubmitted}
              </div>
              <div className="text-[9px] font-bold tracking-wider text-[#B4BDCC] mt-1">
                ETMEYEN
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── MAIN CONTENT SECTIONS ── */}
        <main className="flex-1 px-4 py-4 flex flex-col gap-4">

          {/* ── 3. SECTION: ÖĞRENCİ SEÇ (CAROUSEL & COLLAPSIBLE LIST) ── */}
          <div className="flex items-center gap-2.5 text-[11px] font-bold tracking-wider text-[#5B6577] dark:text-gray-400 mt-1">
            <span className="w-4.5 h-[3px] rounded-full bg-[#34D399]" />
            <span>ÖĞRENCİ</span>
            <span className="flex-1 h-px bg-[#DDE3EC] dark:bg-gray-800" />
            <span className="tracking-normal text-[#334155] dark:text-gray-300 font-semibold">
              {students.length} öğrenci
            </span>
          </div>

          <section className="bg-white dark:bg-[#111624] border border-[#E7EBF2] dark:border-white/10 rounded-[22px] shadow-sm overflow-hidden transition-colors">
            {/* Header: Clickable / Toggle Dropdown */}
            <div
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="p-4 flex flex-col gap-3 cursor-pointer select-none border-b border-[#E7EBF2]/60 dark:border-white/5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-[38px] h-[38px] rounded-[12px] bg-[#ECEBFD] dark:bg-indigo-950/60 text-[#4338CA] dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <Users size={19} strokeWidth={2} />
                  </div>
                  <div>
                    <span className="block text-[14px] font-bold text-gray-900 dark:text-white leading-tight">
                      Öğrenci Seç
                    </span>
                    <span className="block text-[12px] text-[#5B6577] dark:text-gray-400 mt-0.5">
                      {selectedIndex + 1} / {students.length} · Tüm öğrenciler
                    </span>
                  </div>
                </div>

                <div
                  className={`w-8 h-8 rounded-full bg-[#F1F4F9] dark:bg-white/10 text-[#5B6577] dark:text-gray-300 flex items-center justify-center transition-transform duration-200 ${
                    isDetailsOpen ? 'rotate-180' : ''
                  }`}
                >
                  <ChevronDown size={16} strokeWidth={2.4} />
                </div>
              </div>

              {/* Horizontal Snap Carousel */}
              <div
                ref={carouselRef}
                className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-1 -mx-4 px-4 scroll-smooth"
              >
                {students.map((student, idx) => {
                  const isSelected = student.id === selectedStudentId
                  const sub = currentSubmissions[student.id]
                  const isSubmitted = sub?.status === 'submitted'
                  const initial = student.name.charAt(0).toUpperCase()

                  return (
                    <div
                      key={student.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectStudent(student.id, idx)
                      }}
                      className={`flex-none w-[86%] max-w-[295px] snap-start rounded-[18px] p-3 flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[1.5px] border-[#4338CA] bg-[#F4F5FF] dark:bg-[#1a1f33] shadow-md'
                          : 'border border-[#E7EBF2] dark:border-white/10 bg-white dark:bg-[#141b2c] hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-[#E9EDF4] dark:bg-white/15 text-[#334155] dark:text-white text-[16px] font-black flex items-center justify-center shrink-0">
                        {initial}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-0.5 items-start">
                        <span className="text-[13.5px] font-bold text-gray-900 dark:text-white truncate w-full">
                          {student.name}
                        </span>
                        <span className="text-[11px] text-[#5B6577] dark:text-gray-400">
                          Son Teslim: {currentHomework.dueDate}
                        </span>

                        <div className="mt-1">
                          {isSubmitted ? (
                            <span className="h-[22px] inline-flex items-center gap-1 px-2.5 rounded-full bg-[#E8F6F0] dark:bg-emerald-950/70 border border-[#BFE8D5] dark:border-emerald-800 text-[#047857] dark:text-emerald-300 text-[10.5px] font-bold whitespace-nowrap">
                              <CheckCircle2 size={11} />
                              <span>Teslim Edildi ({sub.score} Puan)</span>
                            </span>
                          ) : (
                            <span className="h-[22px] inline-flex items-center px-2.5 rounded-full bg-[#FDEBEB] dark:bg-rose-950/70 border border-[#F8CACA] dark:border-rose-900 text-[#B91C1C] dark:text-rose-300 text-[10.5px] font-bold whitespace-nowrap">
                              Teslim Etmedi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Carousel Pagination Dots */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {students.slice(0, 6).map((_, i) => (
                  <span
                    key={i}
                    className={`transition-all ${
                      i === (selectedIndex % 6)
                        ? 'w-4.5 h-1.5 rounded-full bg-[#4338CA]'
                        : 'w-1.5 h-1.5 rounded-full bg-[#D5DBE5] dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              <span className="text-center text-[11px] text-[#5B6577] dark:text-gray-400">
                Kaydırarak öğrenciler arasında geçiş yapın · Listeyi açmak için dokunun
              </span>
            </div>

            {/* Expanded Detailed Student Filter & List */}
            <AnimatePresence>
              {isDetailsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="p-4 flex flex-col gap-3 bg-[#FAFCFF] dark:bg-[#0f1422] border-t border-[#E7EBF2] dark:border-white/10"
                >
                  {/* Filter Pills */}
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide py-0.5">
                    <button
                      type="button"
                      onClick={() => setFilterTab('all')}
                      className={`h-[36px] px-3.5 rounded-[12px] text-[11.5px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                        filterTab === 'all'
                          ? 'bg-[#0A0D15] dark:bg-white text-white dark:text-[#0A0D15]'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Tümü ({stats.total})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab('on_time')}
                      className={`h-[36px] px-3.5 rounded-[12px] text-[11.5px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                        filterTab === 'on_time'
                          ? 'bg-[#047857] text-white'
                          : 'bg-[#E8F6F0] dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border border-[#BFE8D5] dark:border-emerald-800'
                      }`}
                    >
                      Zamanında ({stats.onTime})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab('late')}
                      className={`h-[36px] px-3.5 rounded-[12px] text-[11.5px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                        filterTab === 'late'
                          ? 'bg-[#B45309] text-white'
                          : 'bg-[#FDF0DC] dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 border border-[#F5D9A8] dark:border-amber-800'
                      }`}
                    >
                      Geç ({stats.late})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab('not_submitted')}
                      className={`h-[36px] px-3.5 rounded-[12px] text-[11.5px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                        filterTab === 'not_submitted'
                          ? 'bg-[#B91C1C] text-white'
                          : 'bg-[#FDEBEB] dark:bg-rose-950/60 text-[#B91C1C] dark:text-rose-300 border border-[#F8CACA] dark:border-rose-900'
                      }`}
                    >
                      Etmeyenler ({stats.notSubmitted})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="flex items-center gap-2.5 h-[46px] px-3.5 rounded-[14px] bg-white dark:bg-[#182033] border border-[#E1E6EE] dark:border-white/10 shadow-xs">
                    <Search size={17} className="text-[#5B6577] dark:text-gray-400 shrink-0" />
                    <input
                      type="search"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Öğrenci ara..."
                      className="flex-1 bg-transparent border-0 outline-hidden text-[13px] text-gray-900 dark:text-white placeholder-gray-400"
                    />
                    {studentSearch && (
                      <button
                        type="button"
                        onClick={() => setStudentSearch('')}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Vertical Student List */}
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {filteredStudents.map((st, i) => {
                      const isSel = st.id === selectedStudentId
                      const sub = currentSubmissions[st.id]
                      const isSub = sub?.status === 'submitted'

                      return (
                        <div
                          key={st.id}
                          onClick={() => handleSelectStudent(st.id, i)}
                          className={`p-3 rounded-[16px] flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isSel
                              ? 'border-[1.5px] border-[#4338CA] bg-[#F4F5FF] dark:bg-[#1a2137]'
                              : 'border border-[#E7EBF2] dark:border-white/5 bg-white dark:bg-[#141b2c] hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[#E9EDF4] dark:bg-white/15 text-[#334155] dark:text-white text-[14px] font-black flex items-center justify-center shrink-0">
                              {st.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="block text-[13px] font-bold text-gray-900 dark:text-white truncate">
                                {st.name}
                              </span>
                              <span className="block text-[10.5px] text-[#5B6577] dark:text-gray-400">
                                Son Teslim: {currentHomework.dueDate}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`h-[24px] inline-flex items-center px-2.5 rounded-full text-[10.5px] font-bold shrink-0 ${
                              isSub
                                ? 'bg-[#E8F6F0] dark:bg-emerald-950/70 border border-[#BFE8D5] text-[#047857] dark:text-emerald-300'
                                : 'bg-[#FDEBEB] dark:bg-rose-950/70 border border-[#F8CACA] text-[#B91C1C] dark:text-rose-300'
                            }`}
                          >
                            {isSub ? `Teslim Edildi (${sub.score})` : 'Teslim Etmedi'}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <span className="text-center text-[11px] text-[#5B6577] dark:text-gray-400">
                    +{Math.max(0, students.length - 5)} öğrenci daha · listeyi kaydırın
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ── 4. SECTION: SEÇİLİ ÖĞRENCİ ── */}
          <div className="flex items-center gap-2.5 text-[11px] font-bold tracking-wider text-[#5B6577] dark:text-gray-400 mt-1">
            <span className="w-4.5 h-[3px] rounded-full bg-[#34D399]" />
            <span>SEÇİLİ ÖĞRENCİ</span>
            <span className="flex-1 h-px bg-[#DDE3EC] dark:bg-gray-800" />
          </div>

          <motion.section
            key={`${selectedStudent?.id}-${currentHomework.id}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-[#111624] border border-[#E7EBF2] dark:border-white/10 rounded-[22px] p-4 shadow-sm flex flex-col gap-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight truncate m-0">
                  {selectedStudent?.name}
                </h2>
                <p className="text-[12px] text-[#5B6577] dark:text-gray-400 mt-1 m-0">
                  Sınıf: {selectedStudent?.className || selectedBranch} · Kullanıcı Adı: @{selectedStudent?.email?.split('@')[0] || 'ogrenci'}
                </p>
              </div>

              <span
                className={`h-[28px] inline-flex items-center px-3 rounded-[14px] text-[11px] font-extrabold whitespace-nowrap shrink-0 ${
                  isCurrentSubmitted
                    ? 'bg-[#E8F6F0] dark:bg-emerald-950/70 border border-[#BFE8D5] text-[#047857] dark:text-emerald-300'
                    : 'bg-[#FDEBEB] dark:bg-rose-950/70 border border-[#F8CACA] text-[#B91C1C] dark:text-rose-300'
                }`}
              >
                {isCurrentSubmitted ? 'Teslim Edildi' : 'Teslim Edilmedi'}
              </span>
            </div>

            <div className="bg-[#F6F8FC] dark:bg-[#161c2d] border border-[#E9EDF4] dark:border-white/5 rounded-[16px] p-3.5 grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-[#5B6577] dark:text-gray-400 font-semibold">
                  Son Teslim Tarihi:
                </span>
                <span className="block text-[13px] font-bold text-gray-900 dark:text-white mt-1">
                  {currentHomework.dueDate}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-[#5B6577] dark:text-gray-400 font-semibold">
                  Teslim Zamanı:
                </span>
                <span className="block text-[13px] font-bold text-gray-900 dark:text-white mt-1">
                  {currentSubmissions[selectedStudent?.id]?.submittedAt || '—'}
                </span>
              </div>
            </div>

            {isCurrentSubmitted ? (
              <div className="flex items-center gap-2.5 bg-[#E8F6F0] dark:bg-emerald-950/50 border border-[#BFE8D5] dark:border-emerald-800 rounded-[16px] p-3 text-[#047857] dark:text-emerald-300 text-[12.5px] font-bold leading-snug">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Ödev teslim edildi ve puanlandırıldı ({currentSubmissions[selectedStudent.id]?.score} Puan).</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 bg-[#FDEBEB] dark:bg-rose-950/50 border border-[#F8CACA] dark:border-rose-900 rounded-[16px] p-3 text-[#B91C1C] dark:text-rose-300 text-[12.5px] font-bold leading-snug">
                <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <span>Ödev Henüz Teslim Edilmedi — Son teslim tarihi: {currentHomework.dueDate}</span>
              </div>
            )}
          </motion.section>

          {/* ── 5. SECTION: ÖĞRENCİ YANITI & ÇÖZÜM ── */}
          <section className="bg-white dark:bg-[#111624] border border-[#E7EBF2] dark:border-white/10 rounded-[22px] p-4 shadow-sm flex flex-col gap-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[12px] font-extrabold tracking-wider text-[#0F172A] dark:text-white">
                <FileText size={18} className="text-[#4338CA] dark:text-indigo-400" />
                <span>ÖĞRENCİ YANITI & ÇÖZÜM</span>
              </div>

              <span className="h-[26px] inline-flex items-center px-2.5 rounded-[13px] bg-[#ECEBFD] dark:bg-indigo-950/60 text-[#3730A3] dark:text-indigo-300 text-[10px] font-extrabold whitespace-nowrap">
                Kategori: {currentHomework.category}
              </span>
            </div>

            <div className="flex items-center gap-2.5 bg-[#FDF6E3] dark:bg-amber-950/40 border border-[#F5D9A8] dark:border-amber-800/80 rounded-[16px] p-3 text-[#92400E] dark:text-amber-300 text-[12.5px] font-bold">
              <Volume2 size={18} className="shrink-0" />
              <span>Öğrenci ses kaydı iletmedi.</span>
            </div>

            <div className="bg-[#F6F8FC] dark:bg-[#161c2d] border border-[#E1E6EE] dark:border-white/5 rounded-[16px] p-3.5 text-[#5B6577] dark:text-gray-400 text-[13px] italic leading-relaxed">
              Öğrenci henüz sisteme bir yanıt veya açıklama notu iletmedi.
            </div>

            {/* Whiteboard solution button — opens specific board in new tab */}
            {currentHomework.board_uuid ? (
              <a
                href={`/board/${currentHomework.board_uuid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-3 rounded-[14px] bg-[#EEF0FF] dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-[#4338CA] dark:text-indigo-300 text-[12.5px] font-extrabold flex items-center justify-center gap-2 transition-colors border border-indigo-200 dark:border-indigo-800 shadow-xs cursor-pointer active:scale-98"
              >
                <ExternalLink size={15} />
                <span>Akıllı Tahta Çözümünü & Çizimini İncele (Yeni Sekme)</span>
              </a>
            ) : currentHomework.tool_type === 'WHITEBOARD' || currentHomework.category === 'WHITEBOARD' ? (
              <a
                href="/board/board_6be7ebed-4c00-4243-9a9b-ffef9933803b"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-3 rounded-[14px] bg-[#EEF0FF] dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-[#4338CA] dark:text-indigo-300 text-[12.5px] font-extrabold flex items-center justify-center gap-2 transition-colors border border-indigo-200 dark:border-indigo-800 shadow-xs cursor-pointer active:scale-98"
              >
                <ExternalLink size={15} />
                <span>Akıllı Tahta Çözümünü & Çizimini İncele (Yeni Sekme)</span>
              </a>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="bg-[#F8FAFC] dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[14px] p-2.5 text-center text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  Bu ödev okuma / çalışma yaprağı etkinliği olarak tanımlanmıştır.
                </div>
                <a
                  href="/board/board_6be7ebed-4c00-4243-9a9b-ffef9933803b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-[12px] bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-gray-200 text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-gray-200 dark:border-white/10 cursor-pointer active:scale-98"
                >
                  <ExternalLink size={13} />
                  <span>Akıllı Tahta Çizim Tuvalini Aç (Yeni Sekme)</span>
                </a>
              </div>
            )}
          </section>

          {/* ── 6. SECTION: DEĞERLENDİRME & PUANLAMA ── */}
          <section className="bg-[#F6F7FF] dark:bg-[#13192b] border border-[#E3E7FA] dark:border-indigo-950/80 rounded-[22px] p-4 shadow-sm flex flex-col gap-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[12px] font-extrabold tracking-wider text-gray-900 dark:text-white">
                <GraduationCap size={20} className="text-[#4338CA] dark:text-indigo-400" />
                <span>DEĞERLENDİRME & PUANLAMA</span>
              </div>
            </div>

            <span className="self-start h-[28px] inline-flex items-center px-3 rounded-[14px] bg-[#FDF6E3] dark:bg-amber-950/60 border border-[#F5D9A8] dark:border-amber-800 text-[#92400E] dark:text-amber-300 text-[11px] font-bold">
              Sınıf içi / Fiziksel Teslim Notlandırma
            </span>

            {/* Quick Score Selection */}
            <div>
              <div className="text-[11px] font-extrabold tracking-wider text-[#5B6577] dark:text-gray-400 mb-2">
                HIZLI PUAN SEÇİMİ
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_SCORES.map((score) => {
                  const isScoreActive = currentScore === score
                  return (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setCurrentScore(score)}
                      className={`h-[38px] px-3.5 rounded-[13px] text-[12.5px] font-extrabold transition-all cursor-pointer ${
                        isScoreActive
                          ? 'bg-[#4338CA] text-white shadow-md shadow-[#4338CA]/25 scale-102'
                          : 'border border-[#D9DEFB] dark:border-white/10 bg-white dark:bg-[#1c2438] text-[#4338CA] dark:text-indigo-300 hover:bg-indigo-50'
                      }`}
                    >
                      {score} Puan
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Score Input */}
            <div>
              <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-2">
                Verilen Puan (Max: 100) *
              </label>
              <div className="h-[52px] px-4 rounded-[16px] bg-white dark:bg-[#1c2438] border border-[#D9DEFB] dark:border-white/10 flex items-center justify-between shadow-xs">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={currentScore}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val >= 0 && val <= 100) setCurrentScore(val)
                  }}
                  className="text-[20px] font-extrabold text-[#4338CA] dark:text-indigo-400 bg-transparent border-0 outline-hidden w-24"
                />
                <span className="text-[14px] font-semibold text-[#5B6577] dark:text-gray-400">
                  / 100
                </span>
              </div>
            </div>

            {/* Teacher Feedback Note */}
            <div>
              <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-2">
                Öğretmen Geri Bildirim Notu
              </label>
              <textarea
                value={currentFeedback}
                onChange={(e) => setCurrentFeedback(e.target.value)}
                placeholder="Öğrenciye çözümüne dair yönlendirici geri bildirim yazın..."
                className="w-full h-[90px] p-3 rounded-[16px] bg-white dark:bg-[#1c2438] border border-[#D9DEFB] dark:border-white/10 text-[13px] text-[#0F172A] dark:text-white placeholder-gray-400 resize-none outline-hidden focus:border-[#4338CA]"
              />
            </div>

            {/* Ready-made templates */}
            <div>
              <div className="text-[12px] font-bold text-[#5B6577] dark:text-gray-400 mb-2">
                Hazır Şablonlar:
              </div>
              <div className="flex flex-col gap-2">
                {DEFAULT_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentFeedback(tpl)}
                    className="w-full text-left h-[34px] px-3 rounded-[12px] bg-white dark:bg-[#1c2438] border border-[#E1E6EE] dark:border-white/10 text-[11.5px] font-semibold text-[#334155] dark:text-gray-300 truncate hover:border-[#4338CA] dark:hover:border-indigo-400 transition-colors cursor-pointer"
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSaveEvaluation}
              className="mt-1 h-[52px] rounded-[16px] text-white text-[13px] font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-black/20 cursor-pointer transition-all border border-white/10"
              style={{
                background: 'linear-gradient(135deg, #0A0D15, #1E293B)',
              }}
            >
              <Save size={18} className="text-[#34D399]" />
              <span>Puanı ve Geri Bildirimi Kaydet</span>
            </motion.button>
          </section>

        </main>
      </motion.div>

        {/* ── 8. MODAL: ÖDEV SEÇİMİ VE TARİHSEL FİLTRELEME (İSTENEN YENİ MODAL) ── */}
        <AnimatePresence>
          {isHomeworkModalOpen && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsHomeworkModalOpen(false)}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
              />

              {/* Bottom Sheet Drawer */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full max-w-[410px] mx-auto bg-white dark:bg-[#111624] text-[#0F172A] dark:text-white rounded-t-[30px] p-5 shadow-2xl z-10 flex flex-col max-h-[88vh] overflow-hidden pb-8"
              >
                {/* Drag Handle */}
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-2 shrink-0" />

                {/* Modal Header */}
                <div className="flex items-start justify-between gap-3 shrink-0 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-[#0A0D15] dark:bg-white/10 text-[#34D399] flex items-center justify-center shrink-0">
                      <BookOpenCheck size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-extrabold text-gray-900 dark:text-white leading-tight m-0">
                        Sınıf Ödevleri Seçimi
                      </h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 m-0">
                        {selectedBranch} için verilen tüm ödevler arasından seçim yapın.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsHomeworkModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-black shrink-0 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* ── TARİHSEL FİLTRELEME SEKMELERİ (shrink-0, no collision) ── */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 shrink-0 mb-3">
                  <button
                    type="button"
                    onClick={() => setHomeworkDateFilter('all')}
                    className={`h-[38px] px-3.5 rounded-[12px] text-[12px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      homeworkDateFilter === 'all'
                        ? 'bg-[#0A0D15] dark:bg-white text-white dark:text-[#0A0D15]'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Tümü ({homeworkMetrics.all})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomeworkDateFilter('this_week')}
                    className={`h-[38px] px-3.5 rounded-[12px] text-[12px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      homeworkDateFilter === 'this_week'
                        ? 'bg-[#4338CA] text-white shadow-xs'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4338CA] dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    Bu Hafta ({homeworkMetrics.this_week})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomeworkDateFilter('past')}
                    className={`h-[38px] px-3.5 rounded-[12px] text-[12px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      homeworkDateFilter === 'past'
                        ? 'bg-[#B45309] text-white shadow-xs'
                        : 'bg-[#FDF0DC] dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 border border-[#F5D9A8] dark:border-amber-800'
                    }`}
                  >
                    Geçmiş Haftalar ({homeworkMetrics.past})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomeworkDateFilter('upcoming')}
                    className={`h-[38px] px-3.5 rounded-[12px] text-[12px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      homeworkDateFilter === 'upcoming'
                        ? 'bg-[#047857] text-white shadow-xs'
                        : 'bg-[#E8F6F0] dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border border-[#BFE8D5] dark:border-emerald-800'
                    }`}
                  >
                    Gelecek ({homeworkMetrics.upcoming})
                  </button>
                </div>

                {/* ── ARAMA VE SIRALAMA ÇUBUĞU (shrink-0) ── */}
                <div className="flex items-center gap-2 shrink-0 mb-3">
                  <div className="flex-1 flex items-center gap-2.5 h-[44px] px-3.5 rounded-[14px] border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-[#182033]">
                    <Search size={16} className="text-gray-400 shrink-0" />
                    <input
                      type="search"
                      value={homeworkSearch}
                      onChange={(e) => setHomeworkSearch(e.target.value)}
                      placeholder="Ödev adı veya ders ara..."
                      className="flex-1 bg-transparent border-0 outline-hidden text-[12.5px] text-gray-900 dark:text-white placeholder-gray-400"
                    />
                    {homeworkSearch && (
                      <button
                        type="button"
                        onClick={() => setHomeworkSearch('')}
                        className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Sıralama Seçici */}
                  <div className="relative shrink-0">
                    <select
                      value={homeworkSortBy}
                      onChange={(e) => setHomeworkSortBy(e.target.value as any)}
                      className="h-[44px] pl-2.5 pr-6 rounded-[14px] border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-[#182033] text-[11.5px] font-bold text-gray-700 dark:text-gray-300 outline-hidden cursor-pointer appearance-none"
                    >
                      <option value="newest">En Yeni Tarih</option>
                      <option value="due">Son Teslim</option>
                      <option value="subject">Ders Adı</option>
                    </select>
                    <ArrowUpDown size={12} className="absolute right-2 top-4 pointer-events-none text-gray-400" />
                  </div>
                </div>

                {/* ── ÖDEVLER LİSTESİ (Scrollable cleanly) ── */}
                <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-2.5 pr-0.5">
                  {classHomeworks.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-xs rounded-2xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10">
                      Seçilen kriterlere uygun ödev bulunamadı.
                    </div>
                  ) : (
                    classHomeworks.map((hw) => {
                      const isSelected = hw.id === currentHomework.id
                      const subCount = Object.keys(allSubmissions[hw.id] || {}).length

                      // Tag Colors
                      const tagClass =
                        hw.subject === 'Türkçe'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                          : hw.subject === 'Matematik'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-900'
                          : hw.subject === 'Hayat Bilgisi'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                          : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-900'

                      return (
                        <div
                          key={hw.id}
                          onClick={() => handleSelectHomework(hw)}
                          className={`p-3.5 rounded-[18px] flex flex-col gap-2.5 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[1.5px] border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-xs'
                              : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161c2d] hover:border-gray-300'
                          }`}
                        >
                          {/* Top Row: Subject Pill + Period Pill + Check icon */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`h-[22px] inline-flex items-center px-2 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${tagClass}`}
                              >
                                {hw.subject}
                              </span>

                              <span className="h-[22px] inline-flex items-center gap-1 px-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-[10px] font-bold">
                                <Clock size={10} />
                                <span>{hw.periodLabel}</span>
                              </span>
                            </div>

                            {isSelected ? (
                              <span className="h-[22px] inline-flex items-center gap-1 px-2 rounded-full bg-emerald-500 text-white text-[10.5px] font-extrabold shadow-xs">
                                <Check size={11} strokeWidth={2.5} />
                                <span>Aktif</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-gray-400">
                                {subCount > 0 ? `${subCount} Teslim` : '0 Teslim'}
                              </span>
                            )}
                          </div>

                          {/* Homework Title */}
                          <div>
                            <h4 className="text-[13.5px] font-extrabold text-gray-900 dark:text-white leading-snug m-0">
                              {hw.title}
                            </h4>
                            <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1 m-0 line-clamp-2">
                              {hw.description}
                            </p>
                          </div>

                          {/* Bottom Row: Dates */}
                          <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-white/5 text-[10.5px] text-gray-500 dark:text-gray-400 font-semibold">
                            <span>Veriliş: {hw.assignedDate}</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">
                              Son Teslim: {hw.dueDate}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── 9. MODAL: SINIFSAL KATEGORİLER & ŞUBELER ── */}
        <AnimatePresence>
          {isBranchModalOpen && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsBranchModalOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              />

              {/* Bottom Sheet Drawer */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full max-w-[410px] mx-auto bg-white dark:bg-[#111624] text-[#0F172A] dark:text-white rounded-t-[30px] p-5 shadow-2xl z-10 flex flex-col gap-3.5 pb-8 max-h-[85vh] overflow-y-auto"
              >
                {/* Drag Handle Pill */}
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-1" />

                {/* Modal Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-[#0A0D15] dark:bg-white/10 text-[#34D399] flex items-center justify-center shrink-0">
                      <Users size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-extrabold text-gray-900 dark:text-white leading-tight m-0">
                        Sınıfsal Kategoriler & Şubeler
                      </h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 m-0">
                        Ödevleri filtrelemek veya incelemek istediğiniz sınıf / şubeyi seçin.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBranchModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-black shrink-0 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Search Input */}
                <div className="flex items-center gap-2.5 h-[48px] px-3.5 rounded-[16px] border border-emerald-400 dark:border-emerald-600/60 bg-emerald-50/20 dark:bg-emerald-950/20 mt-1">
                  <Search size={18} className="text-gray-500 dark:text-gray-400 shrink-0" />
                  <input
                    type="search"
                    value={branchSearch}
                    onChange={(e) => setBranchSearch(e.target.value)}
                    placeholder="Şube veya sınıf adı ara..."
                    className="flex-1 bg-transparent border-0 outline-hidden text-[13px] text-gray-900 dark:text-white placeholder-gray-400"
                  />
                  {branchSearch && (
                    <button
                      type="button"
                      onClick={() => setBranchSearch('')}
                      className="text-gray-400 p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Options List */}
                <div className="flex flex-col gap-2.5 mt-1">
                  {filteredBranches.map((branch) => {
                    const isSelected =
                      branch.isAll
                        ? selectedBranch === 'Tüm Şubeler'
                        : selectedBranch === branch.title

                    return (
                      <div
                        key={branch.id}
                        onClick={() => {
                          const newBranch = branch.isAll ? 'Tüm Şubeler' : branch.title
                          setSelectedBranch(newBranch)
                          setIsBranchModalOpen(false)

                          // If the currently selected homework doesn't belong to the newly selected branch, pick the first one from that branch
                          if (newBranch !== 'Tüm Şubeler') {
                            const firstMatch = INITIAL_HOMEWORKS.find((hw) => hw.className === newBranch)
                            if (firstMatch && firstMatch.id !== selectedHomeworkId) {
                              setSelectedHomeworkId(firstMatch.id)
                            }
                          }
                          toast.success(`${branch.title} seçildi`)
                        }}
                        className={`p-3.5 rounded-[18px] flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[1.5px] border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                            : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161c2d] hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {branch.isAll ? (
                            <div className="w-10 h-10 rounded-[14px] bg-[#0A0D15] dark:bg-black text-[#34D399] flex items-center justify-center shrink-0">
                              <Layers size={19} strokeWidth={2.2} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-[14px] bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0">
                              <Users size={19} strokeWidth={2} />
                            </div>
                          )}

                          <div className="min-w-0">
                            <span className="block text-[14px] font-extrabold text-gray-900 dark:text-white leading-tight truncate">
                              {branch.title}
                            </span>
                            <span className="block text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              {branch.desc}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={20} strokeWidth={2.4} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── 10. MODAL: QR TAHTAYA BAĞLAN ── */}
        <ConnectBoardModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          theme={theme}
        />
    </div>
  )

  if (hideHeader) {
    return pageContent
  }

  return (
    <div className={`${theme} min-h-[100dvh] w-full bg-[#0A0D15] sm:bg-[#E2E8F0] sm:dark:bg-[#06090F] flex justify-center selection:bg-[#34D399]/30 selection:text-emerald-950 transition-colors duration-300 font-jakarta overscroll-none`}>
      <div className="w-full sm:max-w-[390px] min-h-[100dvh] bg-[#F8FAFC] dark:bg-[#0A0D15] sm:shadow-2xl relative flex flex-col pb-24 sm:border-x border-gray-200/60 dark:border-gray-800/80 overflow-x-hidden overscroll-y-none">
        <MobileHeader theme={theme} onToggleTheme={toggleTheme} />
        {pageContent}
        {!hideDock && <MobileFloatingDock activeTab="assignments" />}
      </div>
    </div>
  )
}
