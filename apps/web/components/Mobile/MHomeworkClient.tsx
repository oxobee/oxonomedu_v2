'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  CheckCircle2,
  CheckSquare,
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
  Plus,
  PenTool,
  HelpCircle,
  BookOpen,
  Upload,
  Paperclip,
  User,
  FileCheck,
  Trash2,
  Pencil,
  ShieldCheck,
  Lock,
  Unlock,
  Settings,
  AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileFloatingDock from '@components/Mobile/MobileFloatingDock'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import { ALL_INITIAL_STUDENTS, type MStudentItem } from '@components/Mobile/MStudentClient'
import {
  DEFAULT_SCHOOL_ASSIGNMENTS,
  getStoredCustomAssignments,
  saveStoredCustomAssignment,
  deleteStoredCustomAssignment,
  fetchAssignmentsFromServer,
  markHomeworkAsDeleted,
  getDeletedHomeworkIds,
  type SchoolAssignmentItem,
  type QuizQuestion,
} from '@services/school_assignments/school_assignments'
import QuizQuestionBuilder, { DEFAULT_TEMPLATE_QUESTIONS } from './QuizQuestionBuilder'
import { normalizeClassCode } from '@services/demo/attendanceService'
import { ALL_CLASSROOMS } from '@services/demo/schoolDirectory'

export interface HomeworkItem {
  id: string
  assignment_uuid?: string
  title: string
  shortTitle: string
  subject: 'Türkçe' | 'Matematik' | 'Hayat Bilgisi' | 'Fen Bilimleri' | 'Görsel Sanatlar' | 'İngilizce' | 'Sosyal Bilgiler' | string
  category: 'READING' | 'MATH' | 'SCIENCE' | 'LIFE_STUDIES' | 'ART' | 'ENGLISH' | 'WHITEBOARD' | 'WORKSHEET' | 'QUIZ' | string
  tool_type?: 'WHITEBOARD' | 'WORKSHEET' | 'QUIZ' | 'READING' | 'PROJECT'
  tool_data?: Record<string, any>
  quiz_questions?: QuizQuestion[]
  target_type?: 'CLASS' | 'INDIVIDUAL'
  target_student_id?: string
  target_student_name?: string
  attached_file_name?: string
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
  permissions?: {
    allowLateSubmission?: boolean
    allowResubmission?: boolean
    allowFileUpload?: boolean
    parentNotification?: boolean
    accessScope?: 'CLASS' | 'INDIVIDUAL' | 'DRAFT'
  }
}

interface SubmissionRecord {
  studentId: string
  score: number
  feedback: string
  submittedAt: string
  status: 'submitted' | 'late' | 'not_submitted'
  content?: string
  fileName?: string
}

const DEFAULT_TEMPLATES = [
  'Harika bir çalışma, tebrik ederim!',
  'Çözüm adımların doğru ve anlaşılır, eline sağlık.',
  'Çözümün genel olarak başarılı, küçük eksikler var.',
  'Eksik kısımları tamamlayıp tekrar inceleyebilirsin.',
]

const QUICK_SCORES = [100, 95, 90, 85, 75, 60, 50]

export interface BranchOption {
  id: string
  title: string
  code: string
  desc: string
  grade: string
  gradeNumber?: number
  category: 'ALL' | 'PRIMARY' | 'MIDDLE' | 'HIGH'
  isAll: boolean
  teacherName: string
  studentCount: number
}

const BRANCH_TEACHERS_CATALOG = [
  { name: 'Özlem ZOR', branch: 'Sınıf Öğretmeni (1/A)' },
  { name: 'Beyzanur SALMANLI', branch: 'Sınıf Öğretmeni' },
  { name: 'Özge KABA', branch: 'Sınıf Öğretmeni' },
  { name: 'İpek ŞAHİN', branch: 'Sınıf Öğretmeni' },
  { name: 'Meryem MACİT', branch: 'Sınıf Öğretmeni' },
  { name: 'Hilal KAYA', branch: 'Sınıf Öğretmeni' },
  { name: 'Sümeyra Nur TAŞDEMİR', branch: 'Sınıf Öğretmeni' },
  { name: 'Aslı ERGÜN', branch: 'Sınıf Öğretmeni' },
  { name: 'Zeliha EMAN', branch: 'Sınıf Öğretmeni' },
  { name: 'Mehmet Akif YEŞİLYURT', branch: 'Sınıf Öğretmeni' },
  { name: 'Ayşe GÜLER', branch: 'Sınıf Öğretmeni' },
  { name: 'Fatma ÇELİK', branch: 'Sınıf Öğretmeni' },
  { name: 'Murat YILDIZ', branch: 'Sınıf Öğretmeni' },
  { name: 'Selin KOÇ', branch: 'Sınıf Öğretmeni' },
  { name: 'Gökhan ŞAHİN', branch: 'Sınıf Öğretmeni' },
  { name: 'Zeynep AKTAŞ', branch: 'Sınıf Öğretmeni' },
  { name: 'Orkun AYDIN', branch: 'Matematik Zümresi' },
  { name: 'Beritan ŞENATEŞ', branch: 'Fen Bilimleri Zümresi' },
  { name: 'Deniz ARSLAN', branch: 'Sosyal Bilgiler Zümresi' },
  { name: 'Canan YILDIRIM', branch: 'İngilizce Zümresi' },
  { name: 'Murat DEMİR', branch: 'Bilişim Teknolojileri' },
  { name: 'Gülşah ÖZTÜRK', branch: 'Görsel Sanatlar' },
  { name: 'Selim AKSOY', branch: 'Beden Eğitimi' },
  { name: 'Ebru TEKNECİ', branch: 'Türkçe / Edebiyat' },
]

export function generateAllBranchOptions(): BranchOption[] {
  const options: BranchOption[] = [
    {
      id: 'all',
      title: 'Tüm Şubeler',
      code: 'ALL',
      desc: 'Oxonom Okulları · Bütün Sınıf ve Şubeler (Tüm Ödevler)',
      grade: 'Tüm Sınıflar',
      category: 'ALL',
      isAll: true,
      teacherName: 'Tüm Öğretmenler',
      studentCount: 1,
    },
  ]

  const letters = ['A', 'B', 'C', 'D']
  let idx = 0

  for (let g = 1; g <= 8; g++) {
    for (const b of letters) {
      const code = `${g}/${b}`
      const is1A = g === 1 && b === 'A'
      const teacher = is1A ? BRANCH_TEACHERS_CATALOG[0] : BRANCH_TEACHERS_CATALOG[idx % BRANCH_TEACHERS_CATALOG.length]
      const category: 'PRIMARY' | 'MIDDLE' = g <= 4 ? 'PRIMARY' : 'MIDDLE'

      options.push({
        id: `branch-${g}-${b.toLowerCase()}`,
        title: `${code} Şubesi`,
        code,
        desc: is1A
          ? 'Sınıf Rehber Öğretmeni: Özlem ZOR · 1 Kayıtlı Öğrenci (Erçil UĞURLU)'
          : `Sınıf Rehber Öğretmeni: ${teacher.name} (${teacher.branch})`,
        grade: `${g}. Sınıf`,
        gradeNumber: g,
        category,
        isAll: false,
        teacherName: teacher.name,
        studentCount: is1A ? 1 : 0,
      })
      idx++
    }
  }

  // Map all authentic school classrooms (1-A through 12-B) from ALL_CLASSROOMS
  ALL_CLASSROOMS.forEach((c) => {
    const norm = normalizeClassCode(c.code)
    const exists = options.some((o) => normalizeClassCode(o.code) === norm)
    if (!exists) {
      const gNum = parseInt(norm.split('/')[0] || '1', 10)
      const category: 'PRIMARY' | 'MIDDLE' | 'HIGH' = gNum <= 4 ? 'PRIMARY' : gNum <= 8 ? 'MIDDLE' : 'HIGH'
      options.push({
        id: `branch-all-${c.id}`,
        title: c.name,
        code: c.code,
        desc: `Sınıf Rehber Öğretmeni: ${c.teacher_name} (${c.subject || 'Rehberlik'})`,
        grade: c.grade_level || `${gNum}. Sınıf`,
        gradeNumber: gNum,
        category,
        isAll: false,
        teacherName: c.teacher_name,
        studentCount: c.student_count || 1,
      })
    }
  })

  // Synchronize dynamic custom classes from localStorage if created in principal panel
  if (typeof window !== 'undefined') {
    try {
      const raw =
        localStorage.getItem('oxonom_admin_classes_30') ||
        localStorage.getItem('oxonom_admin_classes_10') ||
        localStorage.getItem('oxonom_school_classes')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          parsed.forEach((c: any) => {
            const rawCode = c.code || c.name || ''
            const norm = normalizeClassCode(rawCode)
            const exists = options.some(
              (o) => normalizeClassCode(o.code) === norm || normalizeClassCode(o.title) === norm
            )
            if (!exists && norm) {
              const gNum = parseInt(norm.split('/')[0] || '1', 10)
              options.push({
                id: `branch-custom-${c.id || norm.replace(/\//g, '-')}`,
                title: c.name || `${norm} Şubesi`,
                code: norm,
                desc:
                  c.description ||
                  (c.teacherName ? `Sınıf Rehber Öğretmeni: ${c.teacherName}` : 'Oxonom Okulları Şubesi'),
                grade: c.gradeLevel || `${gNum}. Sınıf`,
                gradeNumber: isNaN(gNum) ? undefined : gNum,
                category: gNum <= 4 ? 'PRIMARY' : gNum <= 8 ? 'MIDDLE' : 'HIGH',
                isAll: false,
                teacherName: c.teacherName || 'Rehber Öğretmen',
                studentCount: c.studentCount || 0,
              })
            }
          })
        }
      }
    } catch (_) {}
  }

  return options
}

const BRANCH_OPTIONS = generateAllBranchOptions()

// Real school assignments across classes covering all assignment combinations
const INITIAL_HOMEWORKS: HomeworkItem[] = [
  // ── 1/A ŞUBESİ (AKTİF VE BİRİNCİL ŞUBE) ──
  {
    id: 'hw-1a-math-1',
    assignment_uuid: 'asg_ritmik_sayma_01',
    title: '1-A Matematik: Ritmik Sayma & Sayı Doğrusu Etkinliği',
    shortTitle: 'Ritmik Sayma & Sayı Doğrusu',
    subject: 'Matematik',
    category: 'WHITEBOARD',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_ritmik_sayma_1a',
    className: '1/A Şubesi',
    assignedDate: '12.10.2026',
    dueDate: '19.10.2026',
    assignedTimestamp: Date.now() - 3 * 86400000,
    dueTimestamp: Date.now() + 2 * 86400000,
    description: '1’er ve 2’şer ileriye doğru ritmik sayma kurallarını sayı doğrusunda zıplayarak tamamlayınız.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'emerald',
    max_score: 100,
    teacher_name: 'Özlem ZOR',
  },
  {
    id: 'hw-1a-reading-1',
    assignment_uuid: 'asg_hizli_okuma_02',
    title: '1-A Türkçe: 1 Dk Hızlı Okuma & Kelime Sayacı Çalışması',
    shortTitle: '1 Dk Hızlı Okuma',
    subject: 'Türkçe',
    category: 'READING',
    tool_type: 'READING',
    className: '1/A Şubesi',
    assignedDate: '10.10.2026',
    dueDate: '17.10.2026',
    assignedTimestamp: Date.now() - 5 * 86400000,
    dueTimestamp: Date.now() + 1 * 86400000,
    description: 'Verilen metni 1 dakika boyunca sesli okuyarak kelime sayacını başlatınız ve okuma puanınızı kaydediniz.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'rose',
    max_score: 100,
    teacher_name: 'Özlem ZOR',
  },
  {
    id: 'hw-1a-worksheet-1',
    assignment_uuid: 'asg_harf_cizgi_03',
    title: '1-A Türkçe: Harf Çizgi & Yazılış Yönü Atölyesi',
    shortTitle: 'Harf Çizgi & Yazılış Yönü',
    subject: 'Türkçe',
    category: 'WORKSHEET',
    tool_type: 'WORKSHEET',
    className: '1/A Şubesi',
    assignedDate: '06.10.2026',
    dueDate: '13.10.2026',
    assignedTimestamp: Date.now() - 8 * 86400000,
    dueTimestamp: Date.now() - 1 * 86400000,
    description: 'MEB standart dik temel harfleri ok yönlerini takip ederek tamamlayınız.',
    period: 'past',
    periodLabel: 'Geçen Hafta',
    accentColor: 'amber',
    max_score: 100,
    teacher_name: 'Özlem ZOR',
  },
  {
    id: 'hw-1a-hayat-1',
    assignment_uuid: 'asg_hayat_bilgisi_nezaket',
    title: '1-A Hayat Bilgisi: Okulumuzda Hayat ve Görgü Kuralları',
    shortTitle: 'Okulumuzda Hayat & Görgü',
    subject: 'Hayat Bilgisi',
    category: 'QUIZ',
    tool_type: 'QUIZ',
    quiz_questions: DEFAULT_TEMPLATE_QUESTIONS,
    className: '1/A Şubesi',
    assignedDate: '14.10.2026',
    dueDate: '21.10.2026',
    assignedTimestamp: Date.now() - 1 * 86400000,
    dueTimestamp: Date.now() + 4 * 86400000,
    description: 'Sınıf içi dayanışma, nezaket kuralları ve okul kaynaklarını koruma interaktif değerlendirme testi.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'blue',
    max_score: 100,
    teacher_name: 'Özlem ZOR',
  },

  // ── 9-A ŞUBESİ (TÜRK DİLİ & EDEBİYAT) ──
  {
    id: 'hw-reading-1',
    assignment_uuid: 'asg_dede_korkut_okuma',
    title: 'Dede Korkut Hikâyeleri Metin Tahlili & Karakter İncelemesi',
    shortTitle: 'Dede Korkut Tahlili',
    subject: 'Türkçe',
    category: 'READING',
    tool_type: 'READING',
    className: '9-A Şubesi',
    assignedDate: '06.10.2026',
    dueDate: '11.10.2026',
    assignedTimestamp: Date.now() - 6 * 86400000,
    dueTimestamp: Date.now() - 1 * 86400000,
    description: 'Dede Korkut destanlarından "Dirse Han Oğlu Boğaç Han" boyunun ana fikri, olay örgüsü ve kültürel motiflerinin tahlili.',
    period: 'past',
    periodLabel: 'Geçen Hafta',
    accentColor: 'emerald',
    max_score: 100,
    teacher_name: 'Ebru TEKNECİ',
  },
  {
    id: 'hw-whiteboard-1',
    assignment_uuid: 'asg_edebi_sanatlar_tahta',
    title: 'Edebi Sanatlar & Teşbih-Mecaz Kavram Haritası Çizimi',
    shortTitle: 'Edebi Sanatlar Çizimi',
    subject: 'Türkçe',
    category: 'WHITEBOARD',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_edebi_sanatlar_9a',
    className: '9-A Şubesi',
    assignedDate: '08.10.2026',
    dueDate: '13.10.2026',
    assignedTimestamp: Date.now() - 4 * 86400000,
    dueTimestamp: Date.now() + 1 * 86400000,
    description: 'Akıllı tahta üzerinde teşbih, istiare, teşhis ve tezat sanatlarını örnekleyen görsel kavram haritasının tamamlanması.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'purple',
    max_score: 100,
    teacher_name: 'Ebru TEKNECİ',
  },
  {
    id: 'hw-quiz-1',
    assignment_uuid: 'asg_paragraf_anlam_test',
    title: 'Sözcükte Anlam & Paragrafta Ana Düşünce Değerlendirme Quiz',
    shortTitle: 'Paragraf Anlam Testi',
    subject: 'Türkçe',
    category: 'QUIZ',
    tool_type: 'QUIZ',
    className: '9-A Şubesi',
    assignedDate: '09.10.2026',
    dueDate: '14.10.2026',
    assignedTimestamp: Date.now() - 3 * 86400000,
    dueTimestamp: Date.now() + 2 * 86400000,
    description: '15 soruluk çoktan seçmeli paragraf analiz ve akıl yürütme tarama testi.',
    quiz_questions: DEFAULT_TEMPLATE_QUESTIONS,
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'blue',
    max_score: 100,
    teacher_name: 'Ebru TEKNECİ',
  },
  {
    id: 'hw-worksheet-1',
    assignment_uuid: 'asg_tanzimat_siir_inceleme',
    title: 'Tanzimat Dönemi Şiir İncelemesi & Karşılaştırmalı Kompozisyon',
    shortTitle: 'Şiir İnceleme & Kompozisyon',
    subject: 'Türkçe',
    category: 'WORKSHEET',
    tool_type: 'WORKSHEET',
    className: '9-A Şubesi',
    assignedDate: '05.10.2026',
    dueDate: '12.10.2026',
    assignedTimestamp: Date.now() - 7 * 86400000,
    dueTimestamp: Date.now(),
    description: 'Namık Kemal ve Şinasi şiirlerinin biçim, tema ve dil özellikleri açısından karşılaştırmalı analizi.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'amber',
    max_score: 100,
    teacher_name: 'Ebru TEKNECİ',
  },
  {
    id: 'hw-math-1',
    assignment_uuid: 'asg_kumeler_mantik_calisma',
    title: 'Kümeler, Önermeler ve Bileşik Önermeler Problem Çalışması',
    shortTitle: 'Kümeler & Mantık Problemleri',
    subject: 'Matematik',
    category: 'MATH',
    tool_type: 'WORKSHEET',
    className: '9-A Şubesi',
    assignedDate: '07.10.2026',
    dueDate: '13.10.2026',
    assignedTimestamp: Date.now() - 5 * 86400000,
    dueTimestamp: Date.now() + 1 * 86400000,
    description: 'Doğruluk tabloları ve küme işlemleri içeren 10 adet analitik matematik problemi.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'rose',
    max_score: 100,
    teacher_name: 'Ebru TEKNECİ',
  },
]

const DEFAULT_INITIAL_SUBMISSIONS: Record<string, Record<string, SubmissionRecord>> = {
  'hw-1a-math-1': {
    's-1': {
      studentId: 's-1',
      score: 100,
      feedback: 'Ritmik sayma adımlarını eksiksiz ve çok hızlı tamamladın, tebrikler!',
      submittedAt: '15.10.2026 14:20',
      status: 'submitted',
      content: '1’er ve 2’şer ileriye doğru ritmik sayma başarıyla tamamlandı.',
    },
  },
  'hw-1a-reading-1': {
    's-1': {
      studentId: 's-1',
      score: 98,
      feedback: 'Harika bir okuma performansı! Dakikada 88 kelime hatasız okundu.',
      submittedAt: '14.10.2026 10:15',
      status: 'submitted',
      content: '1 Dk okuma tamamlandı: 88 kelime okundu.',
    },
  },
  'hw-1a-worksheet-1': {
    's-1': {
      studentId: 's-1',
      score: 95,
      feedback: 'Harf yönleri ve çizgi disiplini gayet başarılı.',
      submittedAt: '10.10.2026 11:00',
      status: 'submitted',
      content: 'Dik temel harf çalışma kağıdı tamamlandı.',
    },
  },
  'hw-reading-1': {
    's-1': {
      studentId: 's-1',
      score: 100,
      feedback: 'Harika bir metin tahlili! Kültürel motifleri ve karakter çatışmalarını çok derinlikli analiz etmişsin. Tebrik ederim.',
      submittedAt: '10.10.2026 16:30',
      status: 'submitted',
      content: 'Dede Korkut hikâyelerinden Dirse Han Oğlu Boğaç Han boyunun teması, kahramanlık ve erdem çatışması açısından incelenmiştir.',
    },
  },
}

export function getMergedSubmissions(homeworks?: HomeworkItem[]): Record<string, Record<string, SubmissionRecord>> {
  const result: Record<string, Record<string, SubmissionRecord>> = {}

  // 1. Initial submissions baseline
  Object.keys(DEFAULT_INITIAL_SUBMISSIONS).forEach((key) => {
    result[key] = { ...DEFAULT_INITIAL_SUBMISSIONS[key] }
  })

  if (typeof window === 'undefined') return result

  // 2. Read teacher storage
  try {
    const teacherRaw = localStorage.getItem('m_homework_submissions_v2')
    if (teacherRaw) {
      const parsed = JSON.parse(teacherRaw)
      if (parsed && typeof parsed === 'object') {
        Object.keys(parsed).forEach((k) => {
          result[k] = { ...(result[k] || {}), ...parsed[k] }
        })
      }
    }
  } catch (_) {}

  // 3. Read live student submissions from oxonom_student_submissions_ercil
  try {
    const studentRaw = localStorage.getItem('oxonom_student_submissions_ercil')
    if (studentRaw) {
      const parsed = JSON.parse(studentRaw)
      if (parsed && typeof parsed === 'object') {
        Object.entries(parsed).forEach(([asgId, sSub]: [string, any]) => {
          if (!sSub) return
          const record: SubmissionRecord = {
            studentId: 's-1',
            score: sSub.score !== undefined && sSub.score !== null ? Number(sSub.score) : 100,
            feedback: sSub.feedback || (sSub.content ? `Öğrenci Yanıtı: ${sSub.content}` : 'Ödev teslim edildi.'),
            submittedAt: sSub.submittedAt || new Date().toLocaleString('tr-TR'),
            status: 'submitted',
            content: sSub.content,
            fileName: sSub.fileName,
          }

          if (!result[asgId]) result[asgId] = {}
          result[asgId]['s-1'] = record

          if (homeworks && homeworks.length > 0) {
            const match = homeworks.find(
              (hw) =>
                hw.id === asgId ||
                hw.assignment_uuid === asgId ||
                String(hw.id) === String(asgId) ||
                String(hw.assignment_uuid) === String(asgId) ||
                (hw.tool_type === 'QUIZ' && (asgId.includes('quiz') || asgId.includes('test'))) ||
                (hw.tool_type === 'WHITEBOARD' && (asgId.includes('tahta') || asgId.includes('haritasi'))) ||
                (hw.tool_type === 'READING' && (asgId.includes('okuma') || asgId.includes('tahlil')))
            )
            if (match) {
              if (match.id) {
                if (!result[match.id]) result[match.id] = {}
                result[match.id]['s-1'] = record
              }
              if (match.assignment_uuid) {
                if (!result[match.assignment_uuid]) result[match.assignment_uuid] = {}
                result[match.assignment_uuid]['s-1'] = record
              }
            }
          }
        })
      }
    }
  } catch (_) {}

  return result
}

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
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>(() => generateAllBranchOptions())
  const [selectedBranch, setSelectedBranch] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const qClass = urlParams.get('class')
        if (qClass) return `${normalizeClassCode(qClass)} Şubesi`
        const savedGlobal = localStorage.getItem('oxonom_selected_class')
        if (savedGlobal) {
          const parsed = JSON.parse(savedGlobal)
          if (parsed.name) return parsed.name
          if (parsed.code) return `${normalizeClassCode(parsed.code)} Şubesi`
        }
        const saved = localStorage.getItem('oxonom_teacher_active_branch')
        if (saved) return saved
      } catch (_) {}
    }
    return '9-A Şubesi'
  })
  const [selectedGradeCategory, setSelectedGradeCategory] = useState<string>('ALL')
  const [createTargetClass, setCreateTargetClass] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedGlobal = localStorage.getItem('oxonom_selected_class')
        if (savedGlobal) {
          const parsed = JSON.parse(savedGlobal)
          if (parsed.name) return parsed.name
          if (parsed.code) return `${normalizeClassCode(parsed.code)} Şubesi`
        }
        const saved = localStorage.getItem('oxonom_teacher_active_branch')
        if (saved && saved !== 'Tüm Şubeler') return saved
      } catch (_) {}
    }
    return '9-A Şubesi'
  })
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false)
  const [branchSearch, setBranchSearch] = useState('')

  useEffect(() => {
    const handleClassChanged = (e: any) => {
      if (e?.detail?.name) {
        setSelectedBranch(e.detail.name)
        setCreateTargetClass(e.detail.name)
      } else if (e?.detail?.code) {
        const val = `${normalizeClassCode(e.detail.code)} Şubesi`
        setSelectedBranch(val)
        setCreateTargetClass(val)
      }
    }
    window.addEventListener('oxonom_class_changed', handleClassChanged)
    return () => window.removeEventListener('oxonom_class_changed', handleClassChanged)
  }, [])

  // Homework Selector Modal state
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false)
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string>('')
  const [homeworkDateFilter, setHomeworkDateFilter] = useState<'all' | 'this_week' | 'past' | 'upcoming'>('all')
  const [homeworkSearch, setHomeworkSearch] = useState('')
  const [homeworkSortBy, setHomeworkSortBy] = useState<'newest' | 'due' | 'subject'>('newest')

  // Assignment Creation Form State
  const [assignmentVersion, setAssignmentVersion] = useState(0)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createTargetType, setCreateTargetType] = useState<'CLASS' | 'INDIVIDUAL'>('CLASS')
  const [createTargetStudentId, setCreateTargetStudentId] = useState<string>('s-1')
  const [createTitle, setCreateTitle] = useState('')
  const [createSubject, setCreateSubject] = useState('Türk Dili ve Edebiyatı')
  const [createToolType, setCreateToolType] = useState<'WHITEBOARD' | 'WORKSHEET' | 'QUIZ' | 'READING'>('WORKSHEET')
  const [createDueDate, setCreateDueDate] = useState('2026-10-20T23:59')
  const [createMaxScore, setCreateMaxScore] = useState(100)
  const [createDescription, setCreateDescription] = useState('')

  // Tool Type Specific Dynamic States
  const [createWorksheetFileName, setCreateWorksheetFileName] = useState('')
  const [createWhiteboardTopic, setCreateWhiteboardTopic] = useState('Teşbih & İstiare Kavram Haritası')
  const [createWhiteboardCanvasType, setCreateWhiteboardCanvasType] = useState('İnteraktif Çizim Tuvali')
  const [createReadingBook, setCreateReadingBook] = useState('')
  const [createReadingPages, setCreateReadingPages] = useState('')
  const [createReadingQuestions, setCreateReadingQuestions] = useState('')
  const [createQuizQuestionCount, setCreateQuizQuestionCount] = useState(10)
  const [createQuizDifficulty, setCreateQuizDifficulty] = useState<'Kolay' | 'Orta' | 'İleri'>('Orta')
  const [createQuizQuestions, setCreateQuizQuestions] = useState<QuizQuestion[]>(DEFAULT_TEMPLATE_QUESTIONS)
  const [editQuizQuestions, setEditQuizQuestions] = useState<QuizQuestion[]>([])

  // ── Assignment Edit Modal State ──
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingHomework, setEditingHomework] = useState<HomeworkItem | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSubject, setEditSubject] = useState('Türk Dili ve Edebiyatı')
  const [editToolType, setEditToolType] = useState<'WHITEBOARD' | 'WORKSHEET' | 'QUIZ' | 'READING' | 'PROJECT'>('WORKSHEET')
  const [editDueDate, setEditDueDate] = useState('2026-10-25T23:59')
  const [editMaxScore, setEditMaxScore] = useState(100)
  const [editDescription, setEditDescription] = useState('')
  const [editTargetType, setEditTargetType] = useState<'CLASS' | 'INDIVIDUAL'>('CLASS')
  const [editTargetStudentId, setEditTargetStudentId] = useState('s-1')
  const [editTargetStudentName, setEditTargetStudentName] = useState('Erçil UĞURLU')

  // ── Assignment Permissions (Yetkilendirme) Modal State ──
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [permissionHomework, setPermissionHomework] = useState<HomeworkItem | null>(null)
  const [permScope, setPermScope] = useState<'CLASS' | 'INDIVIDUAL' | 'DRAFT'>('CLASS')
  const [permStudentId, setPermStudentId] = useState('s-1')
  const [permAllowLate, setPermAllowLate] = useState(true)
  const [permAllowResubmit, setPermAllowResubmit] = useState(true)
  const [permAllowFileUpload, setPermAllowFileUpload] = useState(true)
  const [permParentNotification, setPermParentNotification] = useState(true)

  // ── Assignment Delete Modal State ──
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingHomework, setDeletingHomework] = useState<HomeworkItem | null>(null)

  // Seed default authentic assignments if storage is empty
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchAssignmentsFromServer()
        .then(() => setAssignmentVersion((v) => v + 1))
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    const handleUpdate = () => {
      setAssignmentVersion((v) => v + 1)
    }
    window.addEventListener('oxonom_assignments_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('oxonom_assignments_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const handleCreateAssignment = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!createTitle.trim()) {
      toast.error('Lütfen ödev başlığı giriniz.')
      return
    }

    const targetStudent = ALL_INITIAL_STUDENTS.find((s) => s.id === createTargetStudentId) || ALL_INITIAL_STUDENTS[0]
    const isIndividual = createTargetType === 'INDIVIDUAL'

    let detailedDesc = createDescription.trim()
    if (createToolType === 'READING') {
      const parts = []
      if (createReadingBook) parts.push(`Kitap / Eser: ${createReadingBook}`)
      if (createReadingPages) parts.push(`Sayfa Aralığı: ${createReadingPages}`)
      if (createReadingQuestions) parts.push(`Tahlil Soruları: ${createReadingQuestions}`)
      if (parts.length > 0) detailedDesc = `${parts.join(' · ')}${detailedDesc ? `\n\n${detailedDesc}` : ''}`
    } else if (createToolType === 'QUIZ') {
      detailedDesc = `Soru Sayısı: ${createQuizQuestions.length} Soru · Seviye: ${createQuizDifficulty}${detailedDesc ? `\n\n${detailedDesc}` : ''}`
    } else if (createToolType === 'WHITEBOARD') {
      detailedDesc = `Tuval Tipi: ${createWhiteboardCanvasType} · Konu: ${createWhiteboardTopic}${detailedDesc ? `\n\n${detailedDesc}` : ''}`
    } else if (createToolType === 'WORKSHEET' && createWorksheetFileName) {
      detailedDesc = `Ekli Çalışma Belgesi: ${createWorksheetFileName}${detailedDesc ? `\n\n${detailedDesc}` : ''}`
    }

    const targetClassName = isIndividual ? (targetStudent.className || '1/A Şubesi') : createTargetClass
    const targetNormCode = normalizeClassCode(targetClassName)
    const targetBranchObj = branchOptions.find(
      (b) => b.title === targetClassName || normalizeClassCode(b.code) === targetNormCode
    )

    const newId = Date.now()
    const newAsg: SchoolAssignmentItem = {
      id: newId,
      assignment_uuid: `asg_${newId}`,
      title: createTitle.trim(),
      description: detailedDesc.trim() || 'Öğretmen tarafından tanımlanan ödev görevi.',
      grade_level: targetBranchObj?.grade || '1. Sınıf',
      grade_category:
        targetBranchObj?.category === 'PRIMARY'
          ? 'İlkokul (1-4)'
          : targetBranchObj?.category === 'MIDDLE'
          ? 'Ortaokul (5-8)'
          : 'Lise (9-12)',
      subject: createSubject,
      tool_type: createToolType,
      quiz_questions: createToolType === 'QUIZ' ? createQuizQuestions : undefined,
      tool_data: {
        targetType: createTargetType,
        targetStudentId: isIndividual ? targetStudent.id : null,
        targetStudentName: isIndividual ? targetStudent.name : null,
        attachedFileName: createWorksheetFileName || null,
        readingBook: createReadingBook || null,
        readingPages: createReadingPages || null,
        readingQuestions: createReadingQuestions || null,
        quizQuestionCount: createQuizQuestions.length,
        quizDifficulty: createQuizDifficulty || null,
        quizQuestions: createToolType === 'QUIZ' ? createQuizQuestions : undefined,
        whiteboardTopic: createWhiteboardTopic || null,
        whiteboardCanvasType: createWhiteboardCanvasType || null,
      },
      classes: [{ id: Date.now(), name: targetClassName, code: targetNormCode }],
      due_date: createDueDate || '2026-10-20T23:59:00',
      max_score: Number(createMaxScore) || 100,
      published: true,
      teacher_name: targetBranchObj?.teacherName || 'Özlem ZOR',
      creation_date: new Date().toISOString(),
    }

    saveStoredCustomAssignment(newAsg)

    // Sync to student storage so student screen instantly reads it
    if (typeof window !== 'undefined') {
      try {
        const studentKey = 'oxonom_student_homeworks_3001'
        const existing = localStorage.getItem(studentKey)
        const parsed = existing ? JSON.parse(existing) : []
        localStorage.setItem(studentKey, JSON.stringify([newAsg, ...parsed.filter((p: any) => p.id !== newAsg.id)]))
        window.dispatchEvent(new CustomEvent('oxonom_student_homeworks_updated', { detail: newAsg }))
      } catch (_) {}
    }

    setAssignmentVersion((v) => v + 1)
    setSelectedHomeworkId(String(newId))
    setIsCreateModalOpen(false)
    setCreateTitle('')
    setCreateDescription('')
    setCreateWorksheetFileName('')
    setCreateReadingBook('')
    setCreateReadingPages('')
    setCreateReadingQuestions('')

    if (isIndividual) {
      toast.success(`Yeni ödev oluşturuldu ve ${targetStudent.name} öğrencisine atandı!`, { duration: 4000, icon: '🎉' })
    } else {
      toast.success(`Yeni ödev başarıyla oluşturuldu ve ${targetClassName} şubesine atandı!`, { duration: 4000, icon: '🎉' })
    }
  }

  // Real merged school assignments (Custom created only for new accounts)
  const allSchoolHomeworks = useMemo(() => {
    const customList = getStoredCustomAssignments()
    const rawDeleted = typeof window !== 'undefined' ? localStorage.getItem('oxonom_deleted_homework_ids') : null
    const deletedIds: string[] = rawDeleted ? JSON.parse(rawDeleted) : []

    const convertedCustom: HomeworkItem[] = customList
      .filter((asg) => !deletedIds.includes(String(asg.id)) && !deletedIds.includes(asg.assignment_uuid))
      .map((asg) => {
        const className = asg.classes?.[0]?.name || asg.grade_level || '1/A Şubesi'
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
          subject: (asg.subject as any) || 'Türkçe',
          category: (asg.tool_type as any) || 'WHITEBOARD',
          tool_type: asg.tool_type,
          tool_data: asg.tool_data,
          quiz_questions: asg.quiz_questions || asg.tool_data?.quizQuestions,
          target_type: (asg.tool_data?.targetType as any) || 'CLASS',
          target_student_id: asg.tool_data?.targetStudentId || undefined,
          target_student_name: asg.tool_data?.targetStudentName || undefined,
          attached_file_name: asg.tool_data?.attachedFileName || undefined,
          board_uuid: asg.board_uuid,
          className,
          assignedDate: new Date(assignedMs).toLocaleDateString('tr-TR'),
          dueDate: asg.due_date ? new Date(asg.due_date).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '15.10.2026 23:59',
          assignedTimestamp: assignedMs,
          dueTimestamp: dueMs,
          description: asg.description || 'Öğretmen tarafından tanımlanan ödev görevi.',
          period,
          periodLabel,
          accentColor: asg.subject === 'Türkçe' || asg.subject.includes('Edebiyat') ? 'rose' : asg.subject === 'Hayat Bilgisi' ? 'emerald' : 'blue',
          max_score: asg.max_score || 100,
          teacher_name: asg.teacher_name || 'Ebru TEKNECİ',
          permissions: asg.tool_data?.permissions,
        }
      })

    const combined: HomeworkItem[] = [...convertedCustom]
    INITIAL_HOMEWORKS.forEach((initHw) => {
      if (
        !deletedIds.includes(initHw.id) &&
        !deletedIds.includes(initHw.assignment_uuid || '') &&
        !combined.some(
          (c) =>
            c.id === initHw.id ||
            c.assignment_uuid === initHw.assignment_uuid ||
            c.title === initHw.title
        )
      ) {
        combined.push(initHw)
      }
    })

    return combined
  }, [assignmentVersion])

  // Branch-specific students roster
  const students = useMemo(() => {
    if (selectedBranch === 'all' || selectedBranch === 'Tüm Şubeler' || selectedBranch === 'Tüm Sınıflar ve Şubeler') {
      return ALL_INITIAL_STUDENTS
    }
    const filtered = ALL_INITIAL_STUDENTS.filter((s) => s.className === selectedBranch || s.className?.includes('9-A'))
    return filtered.length > 0 ? filtered : ALL_INITIAL_STUDENTS
  }, [selectedBranch])

  const [selectedStudentId, setSelectedStudentId] = useState<string>('s-1')
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'on_time' | 'late' | 'not_submitted'>('all')

  // Submissions Map: Record<homeworkId, Record<studentId, SubmissionRecord>>
  const [allSubmissions, setAllSubmissions] = useState<Record<string, Record<string, SubmissionRecord>>>(() => {
    return getMergedSubmissions(INITIAL_HOMEWORKS)
  })

  // Live real-time sync with student submissions across tabs and storage events
  useEffect(() => {
    const syncSubmissions = () => {
      setAllSubmissions(getMergedSubmissions(allSchoolHomeworks))
    }
    syncSubmissions()

    window.addEventListener('oxonom_student_submission_updated', syncSubmissions)
    window.addEventListener('oxonom_student_homeworks_updated', syncSubmissions)
    window.addEventListener('oxonom_assignments_updated', syncSubmissions)
    window.addEventListener('storage', syncSubmissions)

    return () => {
      window.removeEventListener('oxonom_student_submission_updated', syncSubmissions)
      window.removeEventListener('oxonom_student_homeworks_updated', syncSubmissions)
      window.removeEventListener('oxonom_assignments_updated', syncSubmissions)
      window.removeEventListener('storage', syncSubmissions)
    }
  }, [allSchoolHomeworks])

  // Sync active homework when selectedHomeworkId changes (returns null if empty)
  const currentHomework = useMemo(() => {
    if (allSchoolHomeworks.length === 0) return null
    if (selectedHomeworkId) {
      const match = allSchoolHomeworks.find((hw) => hw.id === selectedHomeworkId)
      if (match) return match
    }
    // If a specific branch is selected, prioritize homeworks belonging to that branch
    if (selectedBranch !== 'Tüm Şubeler' && selectedBranch !== 'all' && selectedBranch !== 'Tüm Sınıflar ve Şubeler') {
      const normSelected = normalizeClassCode(selectedBranch)
      const branchMatch = allSchoolHomeworks.find((hw) => normalizeClassCode(hw.className) === normSelected)
      if (branchMatch) return branchMatch
    }
    return allSchoolHomeworks[0]
  }, [allSchoolHomeworks, selectedHomeworkId, selectedBranch])

  // Current Homework's Submissions Map (checks both ID and assignment_uuid)
  const currentSubmissions = useMemo(() => {
    if (!currentHomework) return {}
    const byId = allSubmissions[currentHomework.id] || {}
    const byUuid = currentHomework.assignment_uuid ? (allSubmissions[currentHomework.assignment_uuid] || {}) : {}
    return { ...byId, ...byUuid }
  }, [allSubmissions, currentHomework])

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
        window.dispatchEvent(new CustomEvent('oxonom_homework_evaluations_updated', { detail: newAll }))
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
    if (!selectedStudent || !currentHomework) return
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
      ...(currentHomework.assignment_uuid ? { [currentHomework.assignment_uuid]: updatedHwSubmissions } : {}),
    }

    saveAllSubmissions(updatedAll)

    // Bridge into student submissions storage if grading Erçil (s-1)
    if (selectedStudent && selectedStudent.id === 's-1') {
      try {
        const raw = localStorage.getItem('oxonom_student_submissions_ercil')
        const currentStudentSubs = raw ? JSON.parse(raw) : {}
        const key = currentHomework?.assignment_uuid || currentHomework?.id
        if (key) {
          currentStudentSubs[key] = {
            assignmentId: key,
            submittedAt: timeFormatted,
            content: currentFeedback || 'Öğretmen değerlendirdi.',
            status: 'graded',
            score: currentScore,
            feedback: currentFeedback,
          }
          localStorage.setItem('oxonom_student_submissions_ercil', JSON.stringify(currentStudentSubs))
          window.dispatchEvent(new CustomEvent('oxonom_student_submission_updated', { detail: currentStudentSubs[key] }))
        }
      } catch (_) {}
    }

    toast.success(`${selectedStudent?.name || 'Öğrenci'} için ${currentScore} puan ve geri bildirim kaydedildi!`, {
      icon: '🎉',
      duration: 3500,
    })
  }

  // Filtered branches for the branch modal
  const filteredBranches = useMemo(() => {
    let list = branchOptions
    if (selectedGradeCategory === 'PRIMARY') {
      list = list.filter((b) => b.isAll || b.category === 'PRIMARY')
    } else if (selectedGradeCategory === 'MIDDLE') {
      list = list.filter((b) => b.isAll || b.category === 'MIDDLE')
    } else if (selectedGradeCategory === 'HIGH') {
      list = list.filter((b) => b.isAll || b.category === 'HIGH')
    } else if (selectedGradeCategory !== 'ALL') {
      const gNum = parseInt(selectedGradeCategory, 10)
      list = list.filter((b) => b.isAll || b.gradeNumber === gNum || b.grade?.startsWith(`${gNum}.`))
    }

    if (!branchSearch.trim()) return list
    const q = branchSearch.trim().toLowerCase()
    return list.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.desc.toLowerCase().includes(q) ||
        b.grade.toLowerCase().includes(q) ||
        b.teacherName?.toLowerCase().includes(q)
    )
  }, [branchOptions, selectedGradeCategory, branchSearch])

  // Filtered and Sorted Homework Items for the Homework Selection Modal
  const classHomeworks = useMemo(() => {
    // 1. Branch filter with normalized code comparison
    let list = allSchoolHomeworks
    if (selectedBranch !== 'Tüm Şubeler' && selectedBranch !== 'all' && selectedBranch !== 'Tüm Sınıflar ve Şubeler') {
      const normSelected = normalizeClassCode(selectedBranch)
      list = list.filter((hw) => normalizeClassCode(hw.className) === normSelected)
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
    const normSelected = normalizeClassCode(selectedBranch)
    const list =
      selectedBranch === 'Tüm Şubeler' || selectedBranch === 'all' || selectedBranch === 'Tüm Sınıflar ve Şubeler'
        ? allSchoolHomeworks
        : allSchoolHomeworks.filter((hw) => normalizeClassCode(hw.className) === normSelected)

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

  // ── 1. Ödev Düzenleme Aksiyonları ──
  const handleOpenEditModal = (hw: HomeworkItem) => {
    setEditingHomework(hw)
    setEditTitle(hw.title)
    setEditSubject(hw.subject)
    setEditToolType(((hw.tool_type as any) || (hw.category as any) || 'WORKSHEET') as any)
    let dVal = '2026-10-25T23:59'
    if (hw.dueTimestamp) {
      const d = new Date(hw.dueTimestamp)
      const yr = d.getFullYear()
      const mo = String(d.getMonth() + 1).padStart(2, '0')
      const da = String(d.getDate()).padStart(2, '0')
      const hr = String(d.getHours()).padStart(2, '0')
      const mi = String(d.getMinutes()).padStart(2, '0')
      dVal = `${yr}-${mo}-${da}T${hr}:${mi}`
    }
    setEditDueDate(dVal)
    setEditMaxScore(hw.max_score || 100)
    setEditDescription(hw.description)
    setEditTargetType(hw.target_type || 'CLASS')
    setEditTargetStudentId(hw.target_student_id || 's-1')
    setEditTargetStudentName(hw.target_student_name || 'Erçil UĞURLU')
    const hwQuestions =
      hw.quiz_questions ||
      (hw.tool_data?.quizQuestions as QuizQuestion[]) ||
      DEFAULT_TEMPLATE_QUESTIONS
    setEditQuizQuestions(hwQuestions)
    setIsEditModalOpen(true)
  }

  const handleSaveEditHomework = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingHomework) return
    if (!editTitle.trim()) {
      toast.error('Lütfen geçerli bir ödev başlığı girin.')
      return
    }

    const updatedAsg: SchoolAssignmentItem = {
      id: Number(editingHomework.id.replace(/\D/g, '')) || Date.now(),
      assignment_uuid: editingHomework.assignment_uuid || `asg_${editingHomework.id}`,
      title: editTitle.trim(),
      description: editDescription.trim() || 'Öğretmen tarafından güncellenen ödev.',
      grade_level: '9. Sınıf',
      grade_category: 'Lise (9-12)',
      subject: editSubject,
      tool_type: editToolType as any,
      quiz_questions: editToolType === 'QUIZ' ? editQuizQuestions : undefined,
      tool_data: {
        ...(editingHomework.tool_data || {}),
        targetType: editTargetType,
        targetStudentId: editTargetType === 'INDIVIDUAL' ? editTargetStudentId : null,
        targetStudentName: editTargetType === 'INDIVIDUAL' ? editTargetStudentName : null,
        permissions: editingHomework.permissions,
        quizQuestions: editToolType === 'QUIZ' ? editQuizQuestions : undefined,
        quizQuestionCount: editToolType === 'QUIZ' ? editQuizQuestions.length : undefined,
      },
      classes: [{ id: 101, name: editingHomework.className || '9-A Şubesi', code: '9/A' }],
      due_date: editDueDate || '2026-10-25T23:59:00',
      max_score: Number(editMaxScore) || 100,
      published: true,
      teacher_name: editingHomework.teacher_name || 'Ebru TEKNECİ',
      creation_date: new Date(editingHomework.assignedTimestamp || Date.now()).toISOString(),
    }

    saveStoredCustomAssignment(updatedAsg)

    // Sync to student storage
    if (typeof window !== 'undefined') {
      try {
        const studentKey = 'oxonom_student_homeworks_3001'
        const existing = localStorage.getItem(studentKey)
        const parsed = existing ? JSON.parse(existing) : []
        const filtered = parsed.filter(
          (p: any) => String(p.id) !== String(updatedAsg.id) && p.assignment_uuid !== updatedAsg.assignment_uuid
        )
        localStorage.setItem(studentKey, JSON.stringify([updatedAsg, ...filtered]))
        window.dispatchEvent(new CustomEvent('oxonom_student_homeworks_updated', { detail: updatedAsg }))
      } catch (_) {}
    }

    setAssignmentVersion((v) => v + 1)
    toast.success(`"${editTitle}" ödevi başarıyla güncellendi!`, { icon: '✏️' })
    setIsEditModalOpen(false)
    setEditingHomework(null)
  }

  // ── 2. Ödev Yetkilendirme (Permissions) Aksiyonları ──
  const handleOpenPermissionModal = (hw: HomeworkItem) => {
    setPermissionHomework(hw)
    setPermScope((hw.target_type as any) || 'CLASS')
    setPermStudentId(hw.target_student_id || 's-1')
    setPermAllowLate(hw.permissions?.allowLateSubmission ?? true)
    setPermAllowResubmit(hw.permissions?.allowResubmission ?? true)
    setPermAllowFileUpload(hw.permissions?.allowFileUpload ?? true)
    setPermParentNotification(hw.permissions?.parentNotification ?? true)
    setIsPermissionModalOpen(true)
  }

  const handleSavePermissions = (e: React.FormEvent) => {
    e.preventDefault()
    if (!permissionHomework) return

    const targetStudent = ALL_INITIAL_STUDENTS.find((s) => s.id === permStudentId) || ALL_INITIAL_STUDENTS[0]
    const permissionsObj = {
      allowLateSubmission: permAllowLate,
      allowResubmission: permAllowResubmit,
      allowFileUpload: permAllowFileUpload,
      parentNotification: permParentNotification,
      accessScope: permScope,
    }

    const updatedAsg: SchoolAssignmentItem = {
      id: Number(permissionHomework.id.replace(/\D/g, '')) || Date.now(),
      assignment_uuid: permissionHomework.assignment_uuid || `asg_${permissionHomework.id}`,
      title: permissionHomework.title,
      description: permissionHomework.description,
      grade_level: '9. Sınıf',
      grade_category: 'Lise (9-12)',
      subject: permissionHomework.subject,
      tool_type: (permissionHomework.tool_type as any) || 'WORKSHEET',
      tool_data: {
        ...(permissionHomework.tool_data || {}),
        targetType: permScope === 'DRAFT' ? 'CLASS' : permScope,
        targetStudentId: permScope === 'INDIVIDUAL' ? targetStudent.id : null,
        targetStudentName: permScope === 'INDIVIDUAL' ? targetStudent.name : null,
        permissions: permissionsObj,
      },
      classes: [{ id: 101, name: permissionHomework.className || '9-A Şubesi', code: '9/A' }],
      due_date: new Date(permissionHomework.dueTimestamp || Date.now() + 7 * 86400000).toISOString(),
      max_score: permissionHomework.max_score || 100,
      published: permScope !== 'DRAFT',
      teacher_name: permissionHomework.teacher_name || 'Ebru TEKNECİ',
      creation_date: new Date(permissionHomework.assignedTimestamp || Date.now()).toISOString(),
    }

    saveStoredCustomAssignment(updatedAsg)

    // Sync to student storage
    if (typeof window !== 'undefined') {
      try {
        const studentKey = 'oxonom_student_homeworks_3001'
        const existing = localStorage.getItem(studentKey)
        const parsed = existing ? JSON.parse(existing) : []
        const filtered = parsed.filter(
          (p: any) => String(p.id) !== String(updatedAsg.id) && p.assignment_uuid !== updatedAsg.assignment_uuid
        )
        if (permScope !== 'DRAFT') {
          localStorage.setItem(studentKey, JSON.stringify([updatedAsg, ...filtered]))
        } else {
          localStorage.setItem(studentKey, JSON.stringify(filtered))
        }
        window.dispatchEvent(new CustomEvent('oxonom_student_homeworks_updated', { detail: updatedAsg }))
      } catch (_) {}
    }

    setAssignmentVersion((v) => v + 1)
    toast.success(`"${permissionHomework.title}" ödev erişim ve yetki ayarları güncellendi!`, { icon: '🛡️' })
    setIsPermissionModalOpen(false)
    setPermissionHomework(null)
  }

  // ── 3. Ödev Silme (Delete) Aksiyonları ──
  const handleOpenDeleteModal = (hw: HomeworkItem) => {
    setDeletingHomework(hw)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDeleteHomework = () => {
    if (!deletingHomework) return
    const hwId = deletingHomework.id
    const hwUuid = deletingHomework.assignment_uuid || deletingHomework.id

    // 1. Delete from stored custom assignments
    deleteStoredCustomAssignment(hwUuid)

    // 2. Mark as deleted in localStorage so initial homeworks are also omitted
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oxonom_deleted_homework_ids')
        const deleted: string[] = raw ? JSON.parse(raw) : []
        if (!deleted.includes(hwId)) deleted.push(hwId)
        if (hwUuid && !deleted.includes(hwUuid)) deleted.push(hwUuid)
        localStorage.setItem('oxonom_deleted_homework_ids', JSON.stringify(deleted))

        // Clean from student storage
        const studentKey = 'oxonom_student_homeworks_3001'
        const existing = localStorage.getItem(studentKey)
        if (existing) {
          const parsed = JSON.parse(existing)
          const updated = parsed.filter((p: any) => p.id !== hwId && p.assignment_uuid !== hwUuid)
          localStorage.setItem(studentKey, JSON.stringify(updated))
        }

        window.dispatchEvent(new CustomEvent('oxonom_assignments_updated', { detail: { id: hwId } }))
        window.dispatchEvent(new CustomEvent('oxonom_student_homeworks_updated', { detail: { id: hwId } }))
      } catch (_) {}
    }

    // Switch selected homework if deleting the active one
    const remaining = allSchoolHomeworks.filter((h) => h.id !== hwId && h.assignment_uuid !== hwUuid)
    if (remaining.length > 0) {
      setSelectedHomeworkId(remaining[0].id)
    } else {
      setSelectedHomeworkId('')
    }

    setAssignmentVersion((v) => v + 1)
    toast.success(`"${deletingHomework.title}" ödevi başarıyla silindi.`, { icon: '🗑️' })
    setIsDeleteModalOpen(false)
    setDeletingHomework(null)
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

        {/* ── 2. HERO / ASSIGNMENT INFO CARD & EMPTY STATE ── */}
        {!currentHomework ? (
          <div className="mx-4 my-8 bg-white dark:bg-[#111624] border border-dashed border-gray-200 dark:border-white/10 rounded-[26px] p-8 text-center flex flex-col items-center justify-center gap-3.5 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-[#6366F1] dark:text-indigo-300 flex items-center justify-center">
              <CheckSquare size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Henüz Verilmiş Bir Ödev Bulunmuyor
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                {selectedBranch} için henüz tanımlanmış bir ödev görevi bulunmuyor. Yeni bir ödev veya çalışma oluşturduğunuzda öğrenci teslimleri ve değerlendirmeleri burada listelenecektir.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  if (selectedBranch !== 'Tüm Şubeler') {
                    setCreateTargetClass(selectedBranch)
                  }
                  setIsCreateModalOpen(true)
                }}
                className="px-4 py-2.5 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-950/20 active:scale-95 transition-all cursor-pointer"
              >
                <Plus size={15} strokeWidth={2.5} className="text-white" />
                <span>Yeni Ödev Tanımla</span>
              </button>
              <Link
                href={`/teacher/classes?class=${encodeURIComponent(normalizeClassCode(selectedBranch))}`}
                className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Öğrenci Listesi</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── TOP PROMINENT ACTION BAR / WEB TOOLBAR (IMAGE 1 GÖRÜNÜR & WEB UYUMLU ALAN) ── */}
            <div className="mx-4 mt-3 bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Sol: Başlık ve Bilgi */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#F0D8FA] border border-[#8D49A6]/30 text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center shrink-0">
                  <BookOpenCheck size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#4B075F] dark:text-[#C58ADB]">
                      Ödev & Değerlendirme Portalı
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      {currentHomework.subject}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-tight">
                    {selectedBranch} Ödev ve Çalışma Görevleri
                  </h2>
                </div>
              </div>

              {/* Sağ: İstenen 3 Belirgin Kontrol (Sınıf Seçici, Ödev Seçici, Yeni Ödev Ver) */}
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap xl:flex-nowrap min-w-0">
                {/* 1. Sınıf Seçimi Butonu */}
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(true)}
                  className="flex-1 sm:flex-none h-11 px-3.5 sm:px-4 rounded-xl bg-gray-100 hover:bg-gray-200/80 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 group shrink-0"
                  title="Sınıf / Şube Değiştir"
                >
                  <Users size={16} className="text-[#4B075F] dark:text-[#C58ADB] group-hover:scale-110 transition-transform" />
                  <span>{selectedBranch}</span>
                  <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white transition-colors" />
                </button>

                {/* 2. Ödev Seç Butonu */}
                <button
                  type="button"
                  onClick={() => setIsHomeworkModalOpen(true)}
                  className="flex-1 sm:flex-none h-11 px-3.5 sm:px-4 rounded-xl bg-[#F0D8FA]/70 hover:bg-[#F0D8FA] dark:bg-[#2D2035] dark:hover:bg-[#350444]/60 border border-[#8D49A6]/30 text-[#4B075F] dark:text-[#C58ADB] text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 group shrink-0"
                  title="Bu sınıfa ait ödevleri seç ve tarihsel filtrele"
                >
                  <BookOpenCheck size={16} className="text-[#4B075F] dark:text-[#C58ADB] group-hover:scale-110 transition-transform" />
                  <span>Ödev Seç</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-[#4B075F] text-[10px] font-black text-white">
                    {classHomeworks.length}
                  </span>
                  <ChevronDown size={14} className="text-[#8D49A6] group-hover:text-[#4B075F] dark:group-hover:text-[#C58ADB] transition-colors" />
                </button>

                {/* 3. Yeni Ödev Ver Butonu (Geniş, Yüksek Görünürlüklü Mor Buton) */}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedBranch !== 'Tüm Şubeler') {
                      setCreateTargetClass(selectedBranch)
                    }
                    setIsCreateModalOpen(true)
                  }}
                  className="w-full sm:w-auto h-11 px-4 sm:px-5 rounded-xl bg-brand-gradient hover:opacity-95 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md shadow-purple-950/20 active:scale-95 transition-all cursor-pointer border border-white/20 group shrink-0 whitespace-nowrap"
                  title={`${selectedBranch} İçin Yeni Ödev Tanımla`}
                >
                  <Plus size={16} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-200" />
                  <span>+ Yeni Ödev Ver</span>
                </button>
              </div>
            </div>

            {/* ── HERO / AKTİF ÖDEV KARTI (Oxonom Edu Brand Gradient Dark) ── */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ contain: 'paint' }}
              className="mx-4 mt-3 bg-brand-gradient-dark text-white rounded-[26px] sm:rounded-[30px] p-5 sm:p-6 flex flex-col gap-4.5 shadow-[0_16px_45px_rgba(75,7,95,0.25)] border border-[#8D49A6]/30 dark:border-[#8D49A6]/20 relative overflow-hidden"
            >
              {/* Animated Background Subtle Concentric Circles */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none opacity-25 overflow-hidden">
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
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-2xl pointer-events-none" />

              {/* Header: Title & Meta Badges */}
              <div className="flex items-start gap-3.5 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 mt-0.5 backdrop-blur-md">
                  <FileText size={22} strokeWidth={1.9} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 text-[10.5px] font-extrabold uppercase tracking-wide backdrop-blur-md">
                      {currentHomework.subject}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/25 text-cyan-100 border border-cyan-300/40 text-[10.5px] font-bold">
                      {currentHomework.category}
                    </span>
                    {currentHomework.target_type === 'INDIVIDUAL' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white/95 border border-white/25 text-[10.5px] font-bold flex items-center gap-1">
                        <User size={11} />
                        <span>Bireysel: {currentHomework.target_student_name || 'Öğrenci'}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white/95 border border-white/25 text-[10.5px] font-bold flex items-center gap-1">
                        <Users size={11} />
                        <span>Tüm Sınıf ({currentHomework.className || selectedBranch})</span>
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400/25 text-amber-200 border border-amber-300/40 text-[10.5px] font-bold flex items-center gap-1">
                      <Clock size={11} />
                      <span>Son Teslim: {currentHomework.dueDate}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsHomeworkModalOpen(true)}
                    className="text-left group flex items-center gap-2 w-full cursor-pointer"
                    title="Ödevi değiştirmek için tıklayın"
                  >
                    <h1 className="text-base sm:text-xl leading-snug font-extrabold tracking-tight text-white m-0 group-hover:text-cyan-200 transition-colors">
                      {currentHomework.title} — Teslim ve Değerlendirme
                    </h1>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 group-hover:bg-white/25 text-white/90 text-[10px] font-bold transition-all border border-white/20">
                      <ArrowUpDown size={10} />
                      <span>Değiştir</span>
                    </span>
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-[13px] leading-relaxed text-blue-100/90 m-0 relative z-10">
                {currentHomework.description}
              </p>

              {/* 4 Stat Boxes (Clean contrast & frosted glass) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 relative z-10">
                <div className="bg-white/12 dark:bg-black/25 backdrop-blur-md border border-white/20 rounded-[18px] py-3 px-2 text-center shadow-xs">
                  <div className="text-[22px] font-black text-white leading-tight">
                    {stats.total}
                  </div>
                  <div className="text-[10px] font-extrabold tracking-wider text-blue-100/80 mt-1">
                    TOPLAM ÖĞRENCİ
                  </div>
                </div>

                <div className="bg-emerald-500/15 dark:bg-emerald-950/40 backdrop-blur-md border border-emerald-400/35 rounded-[18px] py-3 px-2 text-center shadow-xs">
                  <div className="text-[22px] font-black text-[#A7F3D0] leading-tight">
                    {stats.onTime}
                  </div>
                  <div className="text-[10px] font-extrabold tracking-wider text-emerald-200 mt-1">
                    ZAMANINDA TESLİM
                  </div>
                </div>

                <div className="bg-amber-500/15 dark:bg-amber-950/40 backdrop-blur-md border border-amber-400/35 rounded-[18px] py-3 px-2 text-center shadow-xs">
                  <div className="text-[22px] font-black text-[#FDE68A] leading-tight">
                    {stats.late}
                  </div>
                  <div className="text-[10px] font-extrabold tracking-wider text-amber-200 mt-1">
                    GEÇ TESLİM
                  </div>
                </div>

                <div className="bg-rose-500/15 dark:bg-rose-950/40 backdrop-blur-md border border-rose-400/35 rounded-[18px] py-3 px-2 text-center shadow-xs">
                  <div className="text-[22px] font-black text-[#FECDD3] leading-tight">
                    {stats.notSubmitted}
                  </div>
                  <div className="text-[10px] font-extrabold tracking-wider text-rose-200 mt-1">
                    TESLİM BEKLEYEN
                  </div>
                </div>
              </div>
            </motion.section>

        {/* ── MAIN CONTENT SECTIONS (RESPONSIVE WEB 2-COLUMN GRID) ── */}
        <main className="flex-1 px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
            {/* SOL SÜTUN (5/12): ÖĞRENCİ SEÇİMİ, LİSTESİ & KÜNYESİ */}
            <div className="lg:col-span-5 space-y-4">

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
        </div>

        {/* SAĞ SÜTUN (7/12): ÖĞRENCİ YANITI, AKILLI TAHTA ÇÖZÜMÜ & DEĞERLENDİRME */}
        <div className="lg:col-span-7 space-y-4">
          {/* ── 5. SECTION: ÖĞRENCİ YANITI & ÇÖZÜM (AUTHENTIC & LIVE SYNCED) ── */}
          <section className="bg-white dark:bg-[#111624] border border-[#E7EBF2] dark:border-white/10 rounded-[22px] p-4 shadow-sm flex flex-col gap-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[12px] font-extrabold tracking-wider text-[#0F172A] dark:text-white">
                <FileText size={18} className="text-[#4B075F] dark:text-[#C58ADB]" />
                <span>ÖĞRENCİ YANITI & ÇÖZÜM DETAYI</span>
              </div>

              <span className="h-[26px] inline-flex items-center px-2.5 rounded-[13px] bg-[#F0D8FA] dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB] text-[10px] font-extrabold whitespace-nowrap border border-[#8D49A6]/20">
                {currentHomework.tool_type || currentHomework.category}
              </span>
            </div>

            {/* Öğrenci Teslim Durum Özeti */}
            {isCurrentSubmitted ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Ödev Başarıyla Teslim Edildi</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    {currentSubmissions[selectedStudent?.id]?.submittedAt}
                  </span>
                </div>

                {/* Ekli Dosya Varsa */}
                {currentSubmissions[selectedStudent?.id]?.fileName && (
                  <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F0D8FA]/40 dark:bg-[#2D2035] border border-[#8D49A6]/30">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#F0D8FA] text-[#4B075F] flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-gray-900 dark:text-white truncate">
                          {currentSubmissions[selectedStudent?.id]?.fileName}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          Öğrenci Tarafından Yüklenen Belge
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#4B075F] text-white text-[10.5px] font-bold shrink-0">
                      Ekli Dosya
                    </span>
                  </div>
                )}

                {/* Yanıt İçeriği (Quiz Sonucu veya Metin) */}
                {(() => {
                  const content = currentSubmissions[selectedStudent?.id]?.content || currentSubmissions[selectedStudent?.id]?.feedback
                  if (!content) return null

                  // Try parse as Quiz Answers JSON
                  let parsedQuiz: Record<string, any> | null = null
                  try {
                    const parsed = JSON.parse(content)
                    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                      parsedQuiz = parsed
                    }
                  } catch (_) {}

                  if (parsedQuiz) {
                    const keys = Object.keys(parsedQuiz)
                    return (
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151c2e] border border-slate-200 dark:border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-gray-900 dark:text-white">
                            İnteraktif Sınav / Test Cevapları
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-black">
                            {keys.length} Soru Yanıtlandı
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {keys.map((k, idx) => (
                            <div key={k} className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-between">
                              <span className="font-bold text-gray-600 dark:text-gray-400">Soru {idx + 1}:</span>
                              <span className="font-black text-[#4B075F] dark:text-[#C58ADB]">
                                {typeof parsedQuiz![k] === 'boolean'
                                  ? parsedQuiz![k] ? 'Doğru' : 'Yanlış'
                                  : typeof parsedQuiz![k] === 'object'
                                  ? 'Eşleştirildi'
                                  : String(parsedQuiz![k])}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151c2e] border border-slate-200 dark:border-white/10 space-y-1.5">
                      <span className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Öğrenci Yanıtı & Çözüm Metni:
                      </span>
                      <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                        {content}
                      </p>
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-dashed border-rose-300 dark:border-rose-900/60 flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertCircle size={18} />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-rose-800 dark:text-rose-300">
                    Öğrenci Henüz Ödev Göndermedi
                  </span>
                  <p className="text-[11px] text-rose-600/80 dark:text-rose-400 max-w-xs leading-relaxed">
                    {selectedStudent?.name} bu görevi henüz teslim etmedi. Öğrenci kendi portalından ödevi teslim ettiğinde yanıtları ve ekleri anında burada görüntülenecektir.
                  </p>
                </div>
              </div>
            )}

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
        </div>
      </div>
    </main>
      </>
    )}
  </motion.div>

        {/* ── 8. MODAL: ÖDEV SEÇİMİ VE TARİHSEL FİLTRELEME (WEB VE MOBİL UYUMLU) ── */}
        <AnimatePresence>
          {isHomeworkModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsHomeworkModalOpen(false)}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
              />

              {/* Responsive Web / Mobile Modal Dialog */}
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full max-w-[440px] sm:max-w-xl mx-auto bg-white dark:bg-[#111624] text-[#0F172A] dark:text-white rounded-t-[30px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden pb-8 sm:pb-6"
              >
                {/* Drag Handle (Mobile Only) */}
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />

                {/* Modal Header */}
                <div className="flex items-start justify-between gap-3 shrink-0 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-[#F0D8FA] border border-[#8D49A6]/30 text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center shrink-0">
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

                {/* ── YENİ ÖDEV OLUŞTUR BUTONU ── */}
                <div className="mb-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsHomeworkModalOpen(false)
                      if (selectedBranch !== 'Tüm Şubeler') {
                        setCreateTargetClass(selectedBranch)
                      }
                      setIsCreateModalOpen(true)
                    }}
                    className="w-full py-2.5 px-3 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-950/20 transition-all cursor-pointer"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    <span>+ Yeni Ödev Oluştur ({selectedBranch})</span>
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
                      const isSelected = hw.id === currentHomework?.id
                      const hwSubs = {
                        ...(allSubmissions[hw.id] || {}),
                        ...(hw.assignment_uuid ? allSubmissions[hw.assignment_uuid] || {} : {}),
                      }
                      const subCount = Object.keys(hwSubs).length

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
                              ? 'border-[1.5px] border-[#4B075F] bg-[#F0D8FA]/50 dark:bg-[#2D2035] shadow-xs'
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

                              {hw.target_type === 'INDIVIDUAL' ? (
                                <span className="h-[22px] inline-flex items-center gap-1 px-2 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                                  <User size={10} />
                                  <span>Bireysel: {hw.target_student_name || 'Öğrenci'}</span>
                                </span>
                              ) : (
                                <span className="h-[22px] inline-flex items-center gap-1 px-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-[10px] font-bold">
                                  <Clock size={10} />
                                  <span>{hw.periodLabel}</span>
                                </span>
                              )}
                            </div>

                            {isSelected ? (
                              <span className="h-[22px] inline-flex items-center gap-1 px-2 rounded-full bg-[#4B075F] text-white text-[10.5px] font-extrabold shadow-xs">
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

                          {/* Action & Permission Toolbar */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5 mt-0.5 gap-2 flex-wrap">
                            {/* Yetki Durumu Rozeti */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="h-[22px] inline-flex items-center gap-1 px-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                                <ShieldCheck size={11} className="text-emerald-500" />
                                <span>
                                  {hw.target_type === 'INDIVIDUAL'
                                    ? `Özel: ${hw.target_student_name || 'Öğrenci'}`
                                    : 'Tüm Sınıf Yetkili'}
                                </span>
                              </span>
                              {hw.permissions?.allowLateSubmission && (
                                <span className="h-[22px] inline-flex items-center px-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[9.5px] font-bold">
                                  Geç Teslim İzinli
                                </span>
                              )}
                            </div>

                            {/* Butonlar: Düzenle, Yetkiler, Sil */}
                            <div className="flex items-center gap-1 shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleOpenPermissionModal(hw)}
                                className="h-[27px] px-2 rounded-[9px] bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Ödev Yetkilendirme & Erişim Ayarları"
                              >
                                <ShieldCheck size={12} strokeWidth={2.2} />
                                <span>Yetkiler</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(hw)}
                                className="h-[27px] px-2 rounded-[9px] bg-gray-100 dark:bg-white/10 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-gray-700 dark:text-gray-300 hover:text-indigo-600 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Ödevi Düzenle"
                              >
                                <Pencil size={12} strokeWidth={2.2} />
                                <span>Düzenle</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(hw)}
                                className="h-[27px] px-2 rounded-[9px] bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Ödevi Sil"
                              >
                                <Trash2 size={12} strokeWidth={2.2} />
                                <span>Sil</span>
                              </button>
                            </div>
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

        {/* ── MODAL: ÖDEV DÜZENLEME ── */}
        <AnimatePresence>
          {isEditModalOpen && editingHomework && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditModalOpen(false)}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
              />
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full max-w-[480px] sm:max-w-2xl mx-auto bg-white dark:bg-[#111624] text-[#0F172A] dark:text-white rounded-t-[30px] sm:rounded-3xl p-5 sm:p-7 shadow-2xl z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden pb-8 sm:pb-6"
              >
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />

                <div className="flex items-start justify-between gap-3 shrink-0 mb-4 pb-3 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Pencil size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight m-0">
                        Ödevi Düzenle
                      </h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 m-0">
                        {editingHomework.className} • Bilgileri güncelleyin
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black shrink-0 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <form onSubmit={handleSaveEditHomework} className="flex-1 overflow-y-auto space-y-4 pr-1">
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Ödev Başlığı
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full h-11 px-3.5 text-xs font-semibold bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                      placeholder="Ödev başlığı..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Ders / Branş
                      </label>
                      <select
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        className="w-full h-11 px-3 text-xs font-semibold bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                      >
                        <option value="Türk Dili ve Edebiyatı">Türk Dili ve Edebiyatı</option>
                        <option value="Türkçe">Türkçe</option>
                        <option value="Matematik">Matematik</option>
                        <option value="Fen Bilimleri">Fen Bilimleri</option>
                        <option value="Tarih">Tarih</option>
                        <option value="Coğrafya">Coğrafya</option>
                        <option value="İngilizce">İngilizce</option>
                        <option value="Hayat Bilgisi">Hayat Bilgisi</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Ödev Formatı / Araç
                      </label>
                      <select
                        value={editToolType}
                        onChange={(e) => setEditToolType(e.target.value as any)}
                        className="w-full h-11 px-3 text-xs font-semibold bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                      >
                        <option value="WORKSHEET">Çalışma Kâğıdı / Metin</option>
                        <option value="QUIZ">Çoktan Seçmeli Quiz</option>
                        <option value="WHITEBOARD">Akıllı Tahta / Çizim</option>
                        <option value="READING">Okuma & Tahlil</option>
                        <option value="PROJECT">Dönem Projesi</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Ödev Açıklaması & Kazanım Yönergeleri
                    </label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full p-3 text-xs bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white leading-relaxed"
                      placeholder="Öğrencinin yapması gerekenler..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Son Teslim Tarihi ve Saati
                      </label>
                      <input
                        type="datetime-local"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="w-full h-11 px-3 text-xs bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Maksimum Puan
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={editMaxScore}
                        onChange={(e) => setEditMaxScore(Number(e.target.value))}
                        className="w-full h-11 px-3 text-xs bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Test & Quiz Parametreleri (Sorular & Şıklar) */}
                  {editToolType === 'QUIZ' && (
                    <QuizQuestionBuilder
                      questions={editQuizQuestions}
                      onChange={setEditQuizQuestions}
                      maxScore={Number(editMaxScore) || 100}
                    />
                  )}

                  {/* Hedef Kitle Seçimi */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                      Hedef Kitle
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditTargetType('CLASS')}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-colors cursor-pointer ${
                          editTargetType === 'CLASS'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                            : 'bg-white dark:bg-[#182033] border-gray-200 dark:border-gray-700 text-gray-600'
                        }`}
                      >
                        <div>👥 Tüm Sınıf (9-A)</div>
                        <div className="text-[10px] font-normal text-gray-400 mt-0.5">Sınıftaki herkese açık</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditTargetType('INDIVIDUAL')}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-colors cursor-pointer ${
                          editTargetType === 'INDIVIDUAL'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                            : 'bg-white dark:bg-[#182033] border-gray-200 dark:border-gray-700 text-gray-600'
                        }`}
                      >
                        <div>👤 Bireysel Öğrenci</div>
                        <div className="text-[10px] font-normal text-gray-400 mt-0.5">Tek öğrenciye özel</div>
                      </button>
                    </div>

                    {editTargetType === 'INDIVIDUAL' && (
                      <div className="mt-2.5">
                        <select
                          value={editTargetStudentId}
                          onChange={(e) => {
                            setEditTargetStudentId(e.target.value)
                            const sObj = ALL_INITIAL_STUDENTS.find((s) => s.id === e.target.value)
                            if (sObj) setEditTargetStudentName(sObj.name)
                          }}
                          className="w-full h-11 px-3 text-xs bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                        >
                          {ALL_INITIAL_STUDENTS.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.studentNo || s.id})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-white/10 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="h-10 px-4 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="h-10 px-5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs shadow-indigo-500/20"
                    >
                      Değişiklikleri Kaydet
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── MODAL: ÖDEV YETKİLENDİRME & ERİŞİM AYARLARI ── */}
        <AnimatePresence>
          {isPermissionModalOpen && permissionHomework && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPermissionModalOpen(false)}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
              />
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full max-w-[480px] sm:max-w-xl mx-auto bg-white dark:bg-[#111624] text-[#0F172A] dark:text-white rounded-t-[30px] sm:rounded-3xl p-5 sm:p-7 shadow-2xl z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden pb-8 sm:pb-6"
              >
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />

                <div className="flex items-start justify-between gap-3 shrink-0 mb-4 pb-3 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldCheck size={22} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight m-0">
                        Ödev Yetkilendirme & Erişim Ayarları
                      </h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 m-0 line-clamp-1">
                        {permissionHomework.title}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPermissionModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black shrink-0 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <form onSubmit={handleSavePermissions} className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {/* Yetki Kapsamı */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                      1. Erişim Yetkisi Kapsamı (Kimler Yetkili?)
                    </label>
                    <div className="space-y-2">
                      <div
                        onClick={() => setPermScope('CLASS')}
                        className={`p-3 rounded-2xl border cursor-pointer transition-colors flex items-center justify-between ${
                          permScope === 'CLASS'
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                            : 'bg-white dark:bg-[#182033] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Users size={18} className="text-emerald-600 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">Tüm Sınıf Yetkili (9-A Şubesi)</div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">Şubedeki tüm öğrenciler ödevi görüntüler ve teslim eder</div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${permScope === 'CLASS' ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'}`}>
                          {permScope === 'CLASS' && <Check size={11} className="text-white" />}
                        </div>
                      </div>

                      <div
                        onClick={() => setPermScope('INDIVIDUAL')}
                        className={`p-3 rounded-2xl border cursor-pointer transition-colors flex items-center justify-between ${
                          permScope === 'INDIVIDUAL'
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200'
                            : 'bg-white dark:bg-[#182033] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <User size={18} className="text-indigo-600 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">Bireysel / Özel Yetkilendirme</div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">Yalnızca seçilen öğrenci için bireysel çalışma (BEP / Takviye)</div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${permScope === 'INDIVIDUAL' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                          {permScope === 'INDIVIDUAL' && <Check size={11} className="text-white" />}
                        </div>
                      </div>

                      {permScope === 'INDIVIDUAL' && (
                        <div className="pl-4 pt-1">
                          <select
                            value={permStudentId}
                            onChange={(e) => setPermStudentId(e.target.value)}
                            className="w-full h-10 px-3 text-xs bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                          >
                            {ALL_INITIAL_STUDENTS.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.studentNo || s.id})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div
                        onClick={() => setPermScope('DRAFT')}
                        className={`p-3 rounded-2xl border cursor-pointer transition-colors flex items-center justify-between ${
                          permScope === 'DRAFT'
                            ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200'
                            : 'bg-white dark:bg-[#182033] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Lock size={18} className="text-amber-600 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">Zümre İncelemesi / Taslak Yetkisi</div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">Öğrencilere kapalı, sadece öğretmen panelinde görünür</div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${permScope === 'DRAFT' ? 'border-amber-600 bg-amber-600' : 'border-gray-300'}`}>
                          {permScope === 'DRAFT' && <Check size={11} className="text-white" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Öğrenci Teslim & Gönderim Yetkileri */}
                  <div className="pt-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">
                      2. Öğrenci Teslim & Gönderim Yetkileri
                    </label>
                    <div className="space-y-2">
                      {/* Geç Teslim İzni */}
                      <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#182033] flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">Geç Teslim İzni</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">Son teslim saatinden sonra mazeretli teslime izin ver</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={permAllowLate}
                          onChange={(e) => setPermAllowLate(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                        />
                      </label>

                      {/* Yeniden Teslim / Düzenleme */}
                      <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#182033] flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">Yeniden Teslim & Düzeltme İzni</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">Öğrenci teslim ettiği cevabı son tarihe kadar güncelleyebilsin</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={permAllowResubmit}
                          onChange={(e) => setPermAllowResubmit(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                        />
                      </label>

                      {/* Harici Dosya / PDF Yükleme */}
                      <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#182033] flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">Harici Dosya / Defter Fotoğrafı İzni</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">Öğrenci cihazından PDF veya fotoğraf ekleyebilsin</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={permAllowFileUpload}
                          onChange={(e) => setPermAllowFileUpload(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                        />
                      </label>

                      {/* Veli Bildirimi */}
                      <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#182033] flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">Veli SMS & Bildirim Entegrasyonu</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">Ödev teslim edilmediğinde veliye otomatik bildirim iletilsin</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={permParentNotification}
                          onChange={(e) => setPermParentNotification(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-white/10 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsPermissionModalOpen(false)}
                      className="h-10 px-4 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="h-10 px-5 rounded-xl text-xs font-bold bg-brand-gradient hover:opacity-95 text-white transition-all cursor-pointer shadow-md shadow-purple-950/20"
                    >
                      Yetkileri Kaydet
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── MODAL: ÖDEV SİLME ONAYI ── */}
        <AnimatePresence>
          {isDeleteModalOpen && deletingHomework && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDeleteModalOpen(false)}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md bg-white dark:bg-[#111624] text-[#0F172A] dark:text-white rounded-3xl p-6 shadow-2xl z-10 space-y-4"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/10">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 size={20} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                      Ödevi Sil
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Bu işlem kalıcıdır ve geri alınamaz
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1.5">
                  <div className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    &quot;{deletingHomework.title}&quot;
                  </div>
                  <p className="text-[11.5px] text-rose-700 dark:text-rose-300 leading-relaxed">
                    Bu ödev ve öğrencilerin yapmış olduğu tüm teslim kayıtları sistemden kalıcı olarak silinecektir.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="h-10 px-4 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteHomework}
                    className="h-10 px-5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-xs shadow-rose-500/20"
                  >
                    Evet, Kalıcı Olarak Sil
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── 9. MODAL: YENİ ÖDEV TANIMLA VE YAYINLA (WEB VE MOBİL UYUMLU) ── */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCreateModalOpen(false)}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
              />

              {/* Responsive Modal Dialog */}
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full max-w-[480px] sm:max-w-2xl mx-auto bg-white dark:bg-[#111624] text-[#0F172A] dark:text-white rounded-t-[30px] sm:rounded-3xl p-5 sm:p-7 shadow-2xl z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden pb-8 sm:pb-6"
              >
                {/* Drag Handle (Mobile Only) */}
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />

                {/* Header */}
                <div className="flex items-start justify-between gap-3 shrink-0 mb-4 pb-3 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-[#4B075F]/15 text-[#8D49A6] dark:text-[#C58ADB] flex items-center justify-center shrink-0">
                      <Plus size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight m-0">
                        Yeni Ödev Oluştur
                      </h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 m-0">
                        {createTargetClass} için yeni ödev ve çalışma görevi tanımlayın
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-black shrink-0 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Scrollable Form */}
                <form onSubmit={handleCreateAssignment} className="flex-1 overflow-y-auto pr-0.5 space-y-4">
                  {/* Sınıf & Ders Seçimi 2 Sütun Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Sınıf & Şube Bilgisi */}
                    <div className="p-3 rounded-2xl bg-[#F0D8FA]/40 dark:bg-[#4B075F]/20 border border-[#8D49A6]/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-[#8D49A6] dark:text-[#C58ADB]" />
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Hedef Şube</span>
                      </div>
                      <span className="text-xs font-black text-[#4B075F] dark:text-[#C58ADB] bg-[#4B075F]/15 px-2.5 py-0.5 rounded-full">
                        {createTargetClass}
                      </span>
                    </div>

                    {/* Ders Seçimi */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Ders / Zümre
                      </label>
                      <select
                        value={createSubject}
                        onChange={(e) => setCreateSubject(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="Türk Dili ve Edebiyatı">Türk Dili ve Edebiyatı</option>
                        <option value="Matematik">Matematik</option>
                        <option value="Tarih">Tarih</option>
                        <option value="Fizik">Fizik</option>
                        <option value="Kimya">Kimya</option>
                        <option value="Biyoloji">Biyoloji</option>
                        <option value="İngilizce">İngilizce</option>
                        <option value="Coğrafya">Coğrafya</option>
                        <option value="Felsefe">Felsefe</option>
                        <option value="Bilişim & Kodlama">Bilişim & Kodlama</option>
                      </select>
                    </div>
                  </div>

                  {/* ── ATAMA KAPSAMI: TÜM SINIF VEYA BİREYSEL ÖĞRENCİ ── */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Ödev Atama Kapsamı
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCreateTargetType('CLASS')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          createTargetType === 'CLASS'
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                            : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            createTargetType === 'CLASS'
                              ? 'bg-indigo-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <Users size={16} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-xs block leading-tight truncate">Tüm Sınıfa Ata</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5 truncate">{createTargetClass} genelinde</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCreateTargetType('INDIVIDUAL')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          createTargetType === 'INDIVIDUAL'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                            : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            createTargetType === 'INDIVIDUAL'
                              ? 'bg-emerald-500 text-[#0A0D15]'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <User size={16} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-xs block leading-tight truncate">Bireysel Öğrenci</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5 truncate">Özel seçilen öğrenciye</span>
                        </div>
                      </button>
                    </div>

                    {/* Sınıf Seçici (Eğer Tüm Sınıf seçildiyse) */}
                    {createTargetType === 'CLASS' && (
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 space-y-1.5 mt-2">
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Users size={14} className="text-indigo-600 dark:text-indigo-400" />
                            <span>Ödevin Atanacağı Sınıf / Şube</span>
                          </span>
                          <span className="text-[10px] text-gray-400 font-normal">1-8. Sınıf ve Tüm Şubeler</span>
                        </label>
                        <select
                          value={createTargetClass}
                          onChange={(e) => setCreateTargetClass(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                          {branchOptions
                            .filter((b) => !b.isAll)
                            .map((br) => (
                              <option key={br.id} value={br.title}>
                                {br.title} ({br.grade} · {br.teacherName})
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* Bireysel Öğrenci Seçici (Eğer Bireysel seçildiyse) */}
                    {createTargetType === 'INDIVIDUAL' && (
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 space-y-1.5 mt-2">
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <GraduationCap size={14} className="text-emerald-600 dark:text-emerald-400" />
                          <span>Ödevin Atanacağı Öğrenci</span>
                        </label>
                        <select
                          value={createTargetStudentId}
                          onChange={(e) => setCreateTargetStudentId(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          {ALL_INITIAL_STUDENTS.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.name} (No: {st.studentNo}) — {st.className || '1/A Şubesi'}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* ── ÖDEV BAŞLIĞI (ZORUNLU VE BELİRGİN ALAN) ── */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center justify-between">
                      <span>Ödev Başlığı</span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">* Zorunlu</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createTitle}
                      onChange={(e) => setCreateTitle(e.target.value)}
                      placeholder="Örn: Tanzimat Dönemi Şiir İncelemesi & Karşılaştırmalı Kompozisyon"
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400"
                    />
                  </div>

                  {/* Ödev Türü (4 Cards) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Ödev Çalışma Türü
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'WORKSHEET', label: 'Çalışma Kâğıdı', icon: FileText, desc: 'Metin, föy & döküman' },
                        { id: 'WHITEBOARD', label: 'Akıllı Tahta', icon: PenTool, desc: 'Çizim & interaktif tuval' },
                        { id: 'READING', label: 'Okuma & Tahlil', icon: BookOpen, desc: 'Metin incelemesi & analiz' },
                        { id: 'QUIZ', label: 'Test & Quiz', icon: HelpCircle, desc: 'Çoktan seçmeli sorular' },
                      ].map((type) => {
                        const Icon = type.icon
                        const isSelected = createToolType === type.id
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setCreateToolType(type.id as any)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                                : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold text-xs">
                              <Icon size={14} className={isSelected ? 'text-emerald-600' : 'text-gray-400'} />
                              <span>{type.label}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{type.desc}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* ── ÖDEV ÇALIŞMA TÜRÜNE GÖRE DİNAMİK YÜKLEME VE DETAY ALANLARI ── */}
                  {createToolType === 'WORKSHEET' && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                          <FileText size={15} className="text-indigo-600 dark:text-indigo-400" />
                          <span>Çalışma Kâğıdı / Döküman Yükleme</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                          PDF / Word / Görsel
                        </span>
                      </div>

                      {/* Dosya Yükleme Dropzone */}
                      <div className="relative border-2 border-dashed border-indigo-300 dark:border-indigo-700/60 rounded-xl p-3.5 text-center bg-white/70 dark:bg-gray-900/50 hover:bg-white transition-colors">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setCreateWorksheetFileName(file.name)
                              toast.success(`"${file.name}" çalışma kâğıdı olarak eklendi!`)
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        {createWorksheetFileName ? (
                          <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileCheck size={18} className="text-emerald-600 shrink-0" />
                              <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {createWorksheetFileName}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setCreateWorksheetFileName('')
                              }}
                              className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-950/50"
                            >
                              Kaldır
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 cursor-pointer">
                            <Upload size={20} className="text-indigo-600 dark:text-indigo-400 mb-0.5" />
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                              Çalışma Belgesi Yüklemek İçin Tıklayın
                            </span>
                            <span className="text-[10px] text-gray-400">
                              veya sürükleyip buraya bırakın (PDF, Word, PNG)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Hazır Hızlı Şablonlar */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">Örnek Şablonlar:</span>
                        {['Tanzimat_Siir_Tahlili.pdf', 'Paragraf_Analiz_Foyu.pdf'].map((tpl) => (
                          <button
                            key={tpl}
                            type="button"
                            onClick={() => {
                              setCreateWorksheetFileName(tpl)
                              toast.success(`"${tpl}" şablonu seçildi!`)
                            }}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 cursor-pointer"
                          >
                            + {tpl}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {createToolType === 'WHITEBOARD' && (
                    <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                          <PenTool size={15} className="text-teal-600 dark:text-teal-400" />
                          <span>Akıllı Tahta Tuvali & Çizim Alanı</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                          İnteraktif Çözüm
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                            Tuval Şablonu
                          </label>
                          <select
                            value={createWhiteboardCanvasType}
                            onChange={(e) => setCreateWhiteboardCanvasType(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white"
                          >
                            <option value="İnteraktif Çizim Tuvali">İnteraktif Çizim Tuvali</option>
                            <option value="Kavram Haritası Şeması">Kavram Haritası Şeması</option>
                            <option value="Kareli Problem Çözüm Izgarası">Kareli Problem Çözüm Izgarası</option>
                            <option value="Çizgili Not ve Kompozisyon">Çizgili Not ve Kompozisyon</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                            Tahta Çizim Konusu
                          </label>
                          <input
                            type="text"
                            value={createWhiteboardTopic}
                            onChange={(e) => setCreateWhiteboardTopic(e.target.value)}
                            placeholder="Örn: Edebi Sanatlar Zihin Haritası"
                            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80 leading-relaxed bg-white/70 dark:bg-gray-900/40 p-2.5 rounded-xl border border-teal-200/50 dark:border-teal-800/40">
                        💡 <strong>Öğrenci Deneyimi:</strong> Öğrenci bu ödevi açtığında doğrudan akıllı tahta çizim tuvali açılarak kalem, şekiller ve metin araçlarıyla çözümünü yapabilecektir.
                      </p>
                    </div>
                  )}

                  {createToolType === 'READING' && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                          <BookOpen size={15} className="text-amber-600 dark:text-amber-400" />
                          <span>Okuma & Metin Tahlili Detayları</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                          Edebiyat / Tahlil
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                            Okunacak Kitap / Eser Adı
                          </label>
                          <input
                            type="text"
                            value={createReadingBook}
                            onChange={(e) => setCreateReadingBook(e.target.value)}
                            placeholder="Örn: Dede Korkut Hikâyeleri"
                            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                            Sayfa / Bölüm Aralığı
                          </label>
                          <input
                            type="text"
                            value={createReadingPages}
                            onChange={(e) => setCreateReadingPages(e.target.value)}
                            placeholder="Örn: Sayfa 25 - 60 (Boğaç Han)"
                            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                          Tahlil ve Odak Soruları
                        </label>
                        <input
                          type="text"
                          value={createReadingQuestions}
                          onChange={(e) => setCreateReadingQuestions(e.target.value)}
                          placeholder="Örn: Ana çatışma, karakter motivasyonları ve kültürel motifler"
                          className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {createToolType === 'QUIZ' && (
                    <QuizQuestionBuilder
                      questions={createQuizQuestions}
                      onChange={setCreateQuizQuestions}
                      maxScore={Number(createMaxScore) || 100}
                    />
                  )}

                  {/* Son Teslim Tarihi & Puan */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Son Teslim Tarihi
                      </label>
                      <input
                        type="datetime-local"
                        value={createDueDate}
                        onChange={(e) => setCreateDueDate(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Maksimum Puan
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={createMaxScore}
                        onChange={(e) => setCreateMaxScore(Number(e.target.value))}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Açıklama & Yönergeler */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Ödev Açıklaması ve Öğrenci Yönergeleri
                    </label>
                    <textarea
                      rows={3}
                      value={createDescription}
                      onChange={(e) => setCreateDescription(e.target.value)}
                      placeholder="Ödevin nasıl çözüleceği ve beklentiler hakkında notlar..."
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full h-12 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-950/20 active:scale-98 transition-all cursor-pointer"
                    >
                      <Plus size={18} strokeWidth={2.5} className="text-white" />
                      <span>
                        {createTargetType === 'INDIVIDUAL'
                          ? `Ödevi Oluştur ve ${
                              ALL_INITIAL_STUDENTS.find((s) => s.id === createTargetStudentId)?.name || 'Öğrenciye'
                            }'ya Ata`
                          : `Ödevi Oluştur ve ${createTargetClass} Şubesine Ata`}
                      </span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── 10. MODAL: SINIFSAL KATEGORİLER & ŞUBELER (WEB VE MOBİL UYUMLU) ── */}
        <AnimatePresence>
          {isBranchModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsBranchModalOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              />

              {/* Responsive Modal Dialog */}
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full max-w-[500px] sm:max-w-xl mx-auto bg-white dark:bg-[#111624] text-[#0F172A] dark:text-white rounded-t-[30px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 flex flex-col gap-3.5 pb-8 sm:pb-6 max-h-[88vh] overflow-hidden"
              >
                {/* Drag Handle Pill (Mobile Only) */}
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-1 shrink-0 sm:hidden" />

                {/* Modal Header */}
                <div className="flex items-start justify-between gap-3 shrink-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-[#0A0D15] dark:bg-white/10 text-[#34D399] flex items-center justify-center shrink-0">
                      <Users size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight m-0">
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
                <div className="flex items-center gap-2.5 h-[46px] px-3.5 rounded-[16px] border border-emerald-400/80 dark:border-emerald-600/60 bg-emerald-50/20 dark:bg-emerald-950/20 shrink-0">
                  <Search size={18} className="text-gray-500 dark:text-gray-400 shrink-0" />
                  <input
                    type="search"
                    value={branchSearch}
                    onChange={(e) => setBranchSearch(e.target.value)}
                    placeholder="Şube veya sınıf adı ara... (Örn: 1/A, 4, Ebru)"
                    className="flex-1 bg-transparent border-0 outline-hidden text-[13px] text-gray-900 dark:text-white placeholder-gray-400 font-medium"
                  />
                  {branchSearch && (
                    <button
                      type="button"
                      onClick={() => setBranchSearch('')}
                      className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Grade & Level Filter Chips (Horizontal Scroll) */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1 shrink-0 -mx-1 px-1">
                  {[
                    { id: 'ALL', label: `Tümü (${branchOptions.length})` },
                    { id: 'PRIMARY', label: 'İlkokul (1-4)' },
                    { id: 'MIDDLE', label: 'Ortaokul (5-8)' },
                    { id: '1', label: '1. Sınıf' },
                    { id: '2', label: '2. Sınıf' },
                    { id: '3', label: '3. Sınıf' },
                    { id: '4', label: '4. Sınıf' },
                    { id: '5', label: '5. Sınıf' },
                    { id: '6', label: '6. Sınıf' },
                    { id: '7', label: '7. Sınıf' },
                    { id: '8', label: '8. Sınıf' },
                    { id: 'HIGH', label: '9. Sınıf / Lise' },
                  ].map((tab) => {
                    const isActive = selectedGradeCategory === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedGradeCategory(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-brand-gradient text-white shadow-xs font-bold'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-white/10'
                        }`}
                      >
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                {/* Information Header / Result Count */}
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 dark:text-gray-500 px-1 shrink-0">
                  <span>{filteredBranches.length} Şube Listeleniyor</span>
                  <span className="text-[#8D49A6] dark:text-[#C58ADB] truncate max-w-[200px]">
                    Aktif: {selectedBranch}
                  </span>
                </div>

                {/* Options List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-[380px]">
                  {filteredBranches.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-bold m-0">
                        Arama kriterine uygun şube bulunamadı.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setBranchSearch('')
                          setSelectedGradeCategory('ALL')
                        }}
                        className="text-xs font-bold text-[#8D49A6] dark:text-[#C58ADB] hover:underline cursor-pointer"
                      >
                        Filtreleri Temizle
                      </button>
                    </div>
                  ) : (
                    filteredBranches.map((branch) => {
                      const isSelected =
                        branch.isAll
                          ? selectedBranch === 'Tüm Şubeler' || selectedBranch === 'all'
                          : selectedBranch === branch.title || normalizeClassCode(selectedBranch) === normalizeClassCode(branch.code)

                      const isPrimary = branch.category === 'PRIMARY'
                      const isMiddle = branch.category === 'MIDDLE'

                      return (
                        <div
                          key={branch.id}
                          onClick={() => {
                            const newBranch = branch.isAll ? 'Tüm Şubeler' : branch.title
                            setSelectedBranch(newBranch)
                            if (typeof window !== 'undefined') {
                              try {
                                localStorage.setItem('oxonom_teacher_active_branch', newBranch)
                                if (!branch.isAll) {
                                  const found = ALL_CLASSROOMS.find((c) => c.name === branch.title || normalizeClassCode(c.code) === normalizeClassCode(branch.code))
                                  if (found) {
                                    localStorage.setItem('oxonom_selected_class', JSON.stringify(found))
                                    window.dispatchEvent(new CustomEvent('oxonom_class_changed', { detail: found }))
                                  }
                                }
                              } catch (_) {}
                            }
                            setIsBranchModalOpen(false)

                            // If newBranch is not Tüm Şubeler, sync createTargetClass
                            if (!branch.isAll) {
                              setCreateTargetClass(newBranch)
                            }

                            // If currently selected homework doesn't belong to newly selected branch, pick first one
                            if (newBranch !== 'Tüm Şubeler') {
                              const normNew = normalizeClassCode(newBranch)
                              const match = allSchoolHomeworks.find(
                                (hw) => normalizeClassCode(hw.className) === normNew
                              )
                              if (match) {
                                setSelectedHomeworkId(match.id)
                              }
                            }
                            toast.success(`${branch.title} seçildi`)
                          }}
                          className={`p-3 sm:p-3.5 rounded-[18px] flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[1.5px] border-[#8D49A6] bg-[#F0D8FA]/50 dark:bg-[#4B075F]/30 shadow-xs'
                              : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161c2d] hover:border-gray-300 dark:hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {branch.isAll ? (
                              <div className="w-10 h-10 rounded-[14px] bg-[#0A0D15] dark:bg-black text-[#34D399] flex items-center justify-center shrink-0">
                                <Layers size={19} strokeWidth={2.2} />
                              </div>
                            ) : isPrimary ? (
                              <div className="w-10 h-10 rounded-[14px] bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-black text-xs sm:text-sm flex items-center justify-center shrink-0">
                                {branch.code}
                              </div>
                            ) : isMiddle ? (
                              <div className="w-10 h-10 rounded-[14px] bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-black text-xs sm:text-sm flex items-center justify-center shrink-0">
                                {branch.code}
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-[14px] bg-purple-50 dark:bg-purple-950/70 border border-purple-200/60 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-black text-xs sm:text-sm flex items-center justify-center shrink-0">
                                {branch.code}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[14px] font-extrabold text-gray-900 dark:text-white leading-tight truncate">
                                  {branch.title}
                                </span>
                                {!branch.isAll && (
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      isPrimary
                                        ? 'bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200'
                                        : isMiddle
                                        ? 'bg-indigo-100/80 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200'
                                        : 'bg-purple-100/80 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
                                    }`}
                                  >
                                    {branch.grade}
                                  </span>
                                )}
                                {branch.studentCount > 0 && (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-100/80 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200">
                                    {branch.studentCount} Öğrenci
                                  </span>
                                )}
                              </div>
                              <span className="block text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                                {branch.desc}
                              </span>
                            </div>
                          </div>

                          {isSelected ? (
                            <div className="w-6 h-6 rounded-full text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <CheckCircle2 size={21} strokeWidth={2.4} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-700 shrink-0 opacity-40 group-hover:opacity-100" />
                          )}
                        </div>
                      )
                    })
                  )}
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
    <div className={`${theme} min-h-[100dvh] w-full bg-[#0A0D15] sm:bg-[#E2E8F0] sm:dark:bg-[#06090F] flex justify-center selection:bg-[#34D399]/30 selection:text-emerald-950 transition-colors duration-300 font-jakarta overscroll-none`}>
      <div className="w-full sm:max-w-[390px] min-h-[100dvh] bg-[#F8FAFC] dark:bg-[#0A0D15] sm:shadow-2xl relative flex flex-col pb-24 sm:border-x border-gray-200/60 dark:border-gray-800/80 overflow-x-hidden overscroll-y-none">
        <MobileHeader theme={theme} onToggleTheme={toggleTheme} />
        {pageContent}
        {!hideDock && <MobileFloatingDock activeTab="assignments" />}
      </div>
    </div>
  )
}
