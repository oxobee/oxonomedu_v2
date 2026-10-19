'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  Share2,
  Search,
  Filter,
  ChevronRight,
  School,
  Building2,
  ArrowRight,
  Sparkles,
  Award,
  Send,
  X,
  Check,
  Eye,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Activity,
  Layers,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileAdminDock from './MobileAdminDock'
import MobileAdminMoreSheet from './MobileAdminMoreSheet'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import { SCHOOL_ORGS, getOrgTeachers } from '@services/demo/schoolDirectory'
import { getStoredPrincipalProfile } from '@/lib/principal/principalProfileStorage'
import MockBadge from '@components/Common/MockBadge'

export interface MAdminReportsClientProps {
  orgSlug?: string
  hideHeader?: boolean
  hideDock?: boolean
}

type ReportTab = 'all' | 'success' | 'attendance' | 'export'
type TermFilter = 'term1' | 'term2' | 'all'

export default function MAdminReportsClient({
  orgSlug,
  hideHeader = false,
  hideDock = false,
}: MAdminReportsClientProps) {
  const { theme, toggleTheme } = useMobileTheme()

  // ── FILTER & CONTEXT STATES ──
  const [selectedOrgId, setSelectedOrgId] = useState<number>(30)

  // Principal Dynamic Profile
  const [principalProfile, setPrincipalProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return getStoredPrincipalProfile()
      } catch (_) {}
    }
    return { name: 'Dr. Uğur UĞURLU', title: 'Okul Müdürü' }
  })

  useEffect(() => {
    const syncPrincipal = () => {
      const p = getStoredPrincipalProfile()
      setPrincipalProfile(p)
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
  const [activeTab, setActiveTab] = useState<ReportTab>('all')
  const [selectedTerm, setSelectedTerm] = useState<TermFilter>('term1')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)

  // ── MODAL STATES ──
  const [selectedClassDetail, setSelectedClassDetail] = useState<any | null>(null)
  const [selectedStudentAlert, setSelectedStudentAlert] = useState<any | null>(null)
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false)
  const [pdfReportType, setPdfReportType] = useState<string>('Genel Akademik Başarı Raporu')

  const activeOrg = SCHOOL_ORGS.find((o) => o.id === selectedOrgId) || SCHOOL_ORGS[0]

  const getUrl = (path: string) => {
    return orgSlug ? `/orgs/${orgSlug}${path}` : path
  }

  // ── DATA: CLASS SUCCESS RANKINGS ──
  const classData = useMemo(() => {
    if (selectedOrgId === 30) {
      let avg = 0
      let topSub = 'Türk Dili ve Edebiyatı'
      let riskCount = 0
      let awardCounts = { takdir: 0, tesekkur: 0, normal: 1 }
      let subjects = [
        { name: 'Türk Dili ve Edebiyatı', avg: 0 },
        { name: 'Matematik', avg: 0 },
        { name: 'Bilişim & Kodlama', avg: 0 },
      ]

      if (typeof window !== 'undefined') {
        try {
          const rawM = localStorage.getItem('oxonom_m_students_v3')
          if (rawM) {
            const parsed = JSON.parse(rawM)
            if (Array.isArray(parsed) && parsed.length > 0) {
              const s = parsed.find((st: any) => st.className?.includes('9-A') || st.className?.includes('9/A')) || parsed[0]
              if (s) {
                if (s.grades && s.grades.length > 0) {
                  const valid = s.grades.filter((g: any) => g.average !== undefined && g.average !== null && !isNaN(Number(g.average)))
                  if (valid.length > 0) {
                    avg = Number((valid.reduce((sum: number, g: any) => sum + Number(g.average), 0) / valid.length).toFixed(1))
                    subjects = valid.map((g: any) => ({ name: g.courseName, avg: Number(g.average) }))
                    const best = [...valid].sort((a: any, b: any) => Number(b.average) - Number(a.average))[0]
                    if (best) topSub = `${best.courseName} (${best.average})`
                  }
                } else if (typeof s.gpa === 'number') {
                  avg = s.gpa
                }
                if (avg < 50) {
                  riskCount = 1
                  awardCounts = { takdir: 0, tesekkur: 0, normal: 0 }
                } else if (avg >= 85) {
                  awardCounts = { takdir: 1, tesekkur: 0, normal: 0 }
                } else if (avg >= 70) {
                  awardCounts = { takdir: 0, tesekkur: 1, normal: 0 }
                }
              }
            }
          }
        } catch (_) {}
      }

      return [
        {
          code: '9/A',
          teacher: 'Ebru TEKNECİ',
          students: 24,
          average: avg > 0 ? avg : 89.2,
          attendanceRate: 98.4,
          topSubject: topSub || 'Bilişim & Kodlama (94.0)',
          riskCount,
          awardCounts: awardCounts.takdir + awardCounts.tesekkur > 0 ? awardCounts : { takdir: 14, tesekkur: 8, normal: 2 },
          subjects: subjects.some((s: any) => s.avg > 0) ? subjects : [
            { name: 'Türk Dili ve Edebiyatı', avg: 88.5 },
            { name: 'Matematik', avg: 84.0 },
            { name: 'Bilişim & Kodlama', avg: 94.0 },
            { name: 'Fizik', avg: 82.5 },
            { name: 'İngilizce', avg: 87.0 },
          ],
        },
        {
          code: '10/A',
          teacher: 'Ahmet YILMAZ',
          students: 26,
          average: 87.8,
          attendanceRate: 97.2,
          topSubject: 'Matematik (91.0)',
          riskCount: 1,
          awardCounts: { takdir: 12, tesekkur: 10, normal: 4 },
          subjects: [
            { name: 'Türk Dili ve Edebiyatı', avg: 85.0 },
            { name: 'Matematik', avg: 91.0 },
            { name: 'Bilişim & Kodlama', avg: 88.5 },
            { name: 'Fizik', avg: 84.0 },
            { name: 'İngilizce', avg: 86.0 },
          ],
        },
        {
          code: '11/B',
          teacher: 'Zeynep KARA',
          students: 25,
          average: 86.4,
          attendanceRate: 96.8,
          topSubject: 'Fizik (89.5)',
          riskCount: 0,
          awardCounts: { takdir: 11, tesekkur: 11, normal: 3 },
          subjects: [
            { name: 'Türk Dili ve Edebiyatı', avg: 86.0 },
            { name: 'Matematik', avg: 83.0 },
            { name: 'Bilişim & Kodlama', avg: 85.5 },
            { name: 'Fizik', avg: 89.5 },
            { name: 'İngilizce', avg: 84.0 },
          ],
        },
        {
          code: '12/A',
          teacher: 'Mehmet DEMİR (YKS Koçu)',
          students: 28,
          average: 90.5,
          attendanceRate: 98.6,
          topSubject: 'Matematik (93.5)',
          riskCount: 0,
          awardCounts: { takdir: 19, tesekkur: 7, normal: 2 },
          subjects: [
            { name: 'Türk Dili ve Edebiyatı', avg: 88.0 },
            { name: 'Matematik', avg: 93.5 },
            { name: 'Bilişim & Kodlama', avg: 92.0 },
            { name: 'Fizik', avg: 89.0 },
            { name: 'İngilizce', avg: 88.5 },
          ],
        },
      ]
    }
    if (selectedOrgId === 10) {
      return [
        {
          code: '4/B',
          teacher: 'Hivda SADAK',
          students: 29,
          average: 92.4,
          attendanceRate: 98.2,
          topSubject: 'Türkçe (94.6)',
          riskCount: 0,
          awardCounts: { takdir: 22, tesekkur: 6, normal: 1 },
          subjects: [
            { name: 'Türkçe', avg: 94.6 },
            { name: 'Matematik', avg: 89.8 },
            { name: 'Fen Bilimleri', avg: 93.1 },
            { name: 'Sosyal Bilgiler', avg: 92.5 },
            { name: 'İngilizce', avg: 89.2 },
          ],
        },
        {
          code: '4/A',
          teacher: 'Özlem ZOR',
          students: 28,
          average: 90.8,
          attendanceRate: 97.6,
          topSubject: 'Fen Bilimleri (92.8)',
          riskCount: 1,
          awardCounts: { takdir: 19, tesekkur: 7, normal: 2 },
          subjects: [
            { name: 'Türkçe', avg: 91.2 },
            { name: 'Matematik', avg: 87.5 },
            { name: 'Fen Bilimleri', avg: 92.8 },
            { name: 'Sosyal Bilgiler', avg: 90.4 },
            { name: 'İngilizce', avg: 88.0 },
          ],
        },
        {
          code: '3/B',
          teacher: 'Ayşe GÜL',
          students: 30,
          average: 88.6,
          attendanceRate: 96.9,
          topSubject: 'Hayat Bilgisi (91.4)',
          riskCount: 0,
          awardCounts: { takdir: 16, tesekkur: 11, normal: 3 },
          subjects: [
            { name: 'Türkçe', avg: 89.0 },
            { name: 'Matematik', avg: 84.6 },
            { name: 'Fen Bilimleri', avg: 88.2 },
            { name: 'Hayat Bilgisi', avg: 91.4 },
            { name: 'İngilizce', avg: 85.5 },
          ],
        },
        {
          code: '2/B',
          teacher: 'Büşra DEMİR',
          students: 28,
          average: 88.1,
          attendanceRate: 97.1,
          topSubject: 'Türkçe (90.2)',
          riskCount: 0,
          awardCounts: { takdir: 15, tesekkur: 10, normal: 3 },
          subjects: [
            { name: 'Türkçe', avg: 90.2 },
            { name: 'Matematik', avg: 85.0 },
            { name: 'Hayat Bilgisi', avg: 89.5 },
            { name: 'İngilizce', avg: 84.8 },
          ],
        },
        {
          code: '1/A',
          teacher: 'Gülhan DURSUN',
          students: 26,
          average: 87.4,
          attendanceRate: 98.4,
          topSubject: 'İlk Okuma & Yazma (91.0)',
          riskCount: 0,
          awardCounts: { takdir: 14, tesekkur: 9, normal: 3 },
          subjects: [
            { name: 'İlk Okuma & Yazma', avg: 91.0 },
            { name: 'Matematik', avg: 86.2 },
            { name: 'Hayat Bilgisi', avg: 88.4 },
          ],
        },
        {
          code: '1/B',
          teacher: 'Fatma KAYA',
          students: 27,
          average: 86.0,
          attendanceRate: 96.5,
          topSubject: 'Hayat Bilgisi (89.2)',
          riskCount: 1,
          awardCounts: { takdir: 13, tesekkur: 10, normal: 4 },
          subjects: [
            { name: 'İlk Okuma & Yazma', avg: 87.4 },
            { name: 'Matematik', avg: 83.8 },
            { name: 'Hayat Bilgisi', avg: 89.2 },
          ],
        },
        {
          code: '2/A',
          teacher: 'Hacer YILMAZ',
          students: 29,
          average: 85.2,
          attendanceRate: 95.8,
          topSubject: 'Hayat Bilgisi (88.0)',
          riskCount: 1,
          awardCounts: { takdir: 12, tesekkur: 12, normal: 5 },
          subjects: [
            { name: 'Türkçe', avg: 86.4 },
            { name: 'Matematik', avg: 81.2 },
            { name: 'Hayat Bilgisi', avg: 88.0 },
            { name: 'İngilizce', avg: 82.5 },
          ],
        },
        {
          code: '3/A',
          teacher: 'Mustafa KOÇ',
          students: 31,
          average: 83.5,
          attendanceRate: 94.2,
          topSubject: 'Hayat Bilgisi (86.5)',
          riskCount: 2,
          awardCounts: { takdir: 10, tesekkur: 13, normal: 8 },
          subjects: [
            { name: 'Türkçe', avg: 84.0 },
            { name: 'Matematik', avg: 79.2 },
            { name: 'Fen Bilimleri', avg: 83.1 },
            { name: 'Hayat Bilgisi', avg: 86.5 },
            { name: 'İngilizce', avg: 80.4 },
          ],
        },
      ]
    } else {
      return [
        {
          code: '8/A',
          teacher: 'Murat ARSLAN (LGS Koçu)',
          students: 28,
          average: 89.2,
          attendanceRate: 97.4,
          topSubject: 'Fen Bilimleri (91.5)',
          riskCount: 0,
          awardCounts: { takdir: 18, tesekkur: 8, normal: 2 },
          subjects: [
            { name: 'Türkçe', avg: 88.4 },
            { name: 'Matematik', avg: 84.2 },
            { name: 'Fen Bilimleri', avg: 91.5 },
            { name: 'T.C. İnkılap', avg: 92.0 },
            { name: 'İngilizce', avg: 87.5 },
          ],
        },
        {
          code: '8/B',
          teacher: 'Sibel GÜNEŞ',
          students: 29,
          average: 87.6,
          attendanceRate: 96.8,
          topSubject: 'T.C. İnkılap (90.2)',
          riskCount: 1,
          awardCounts: { takdir: 15, tesekkur: 11, normal: 3 },
          subjects: [
            { name: 'Türkçe', avg: 86.5 },
            { name: 'Matematik', avg: 81.0 },
            { name: 'Fen Bilimleri', avg: 89.0 },
            { name: 'T.C. İnkılap', avg: 90.2 },
            { name: 'İngilizce', avg: 85.8 },
          ],
        },
        {
          code: '5/A',
          teacher: 'Emel ŞAHİN',
          students: 30,
          average: 88.3,
          attendanceRate: 98.1,
          topSubject: 'Sosyal Bilgiler (91.0)',
          riskCount: 0,
          awardCounts: { takdir: 17, tesekkur: 10, normal: 3 },
          subjects: [
            { name: 'Türkçe', avg: 88.0 },
            { name: 'Matematik', avg: 85.4 },
            { name: 'Fen Bilimleri', avg: 89.1 },
            { name: 'Sosyal Bilgiler', avg: 91.0 },
            { name: 'İngilizce', avg: 86.2 },
          ],
        },
        {
          code: '7/A',
          teacher: 'Deniz KILIÇ',
          students: 27,
          average: 86.4,
          attendanceRate: 95.9,
          topSubject: 'Türkçe (88.5)',
          riskCount: 1,
          awardCounts: { takdir: 14, tesekkur: 9, normal: 4 },
          subjects: [
            { name: 'Türkçe', avg: 88.5 },
            { name: 'Matematik', avg: 80.2 },
            { name: 'Fen Bilimleri', avg: 87.4 },
            { name: 'Sosyal Bilgiler', avg: 88.1 },
            { name: 'İngilizce', avg: 84.0 },
          ],
        },
        {
          code: '6/A',
          teacher: 'Kerem ÖZTÜRK',
          students: 31,
          average: 85.1,
          attendanceRate: 96.2,
          topSubject: 'Sosyal Bilgiler (87.5)',
          riskCount: 0,
          awardCounts: { takdir: 13, tesekkur: 12, normal: 6 },
          subjects: [
            { name: 'Türkçe', avg: 85.0 },
            { name: 'Matematik', avg: 79.5 },
            { name: 'Fen Bilimleri', avg: 86.0 },
            { name: 'Sosyal Bilgiler', avg: 87.5 },
            { name: 'İngilizce', avg: 83.2 },
          ],
        },
      ]
    }
  }, [selectedOrgId])

  // ── DATA: CRITICAL ATTENDANCE ALERTS (MEB 10 GÜN SINIRI UYARILARI) ──
  const [criticalStudents, setCriticalStudents] = useState([
    {
      id: 'att-1',
      name: 'Ali KAYA',
      className: '3/A',
      unexcusedDays: 6.5,
      excusedDays: 2.0,
      totalDays: 8.5,
      parentName: 'Kemal KAYA',
      parentPhone: '+90 532 111 2233',
      lastAbsence: '08 Ekim 2026',
      status: 'sms_sent', // 'sms_sent' | 'pending' | 'meeting_done'
      note: 'Aileye ilk resmi devamsızlık mektubu ve SMS iletildi.',
    },
    {
      id: 'att-2',
      name: 'Zeynep DEMİR',
      className: '4/B',
      unexcusedDays: 5.5,
      excusedDays: 1.5,
      totalDays: 7.0,
      parentName: 'Ayşe DEMİR',
      parentPhone: '+90 533 222 3344',
      lastAbsence: '07 Ekim 2026',
      status: 'meeting_done',
      note: 'Veli ile görüşüldü; sağlık raporu aslı teslim edilecek.',
    },
    {
      id: 'att-3',
      name: 'Eren YILDIRIM',
      className: '2/A',
      unexcusedDays: 5.0,
      excusedDays: 0.5,
      totalDays: 5.5,
      parentName: 'Murat YILDIRIM',
      parentPhone: '+90 535 333 4455',
      lastAbsence: 'Bugün',
      status: 'pending',
      note: 'Yasal devamsızlık ihtar sınırı aşıldı. Bildirim bekleniyor.',
    },
    {
      id: 'att-4',
      name: 'Beren ÖZTÜRK',
      className: '7-A',
      unexcusedDays: 7.0,
      excusedDays: 3.0,
      totalDays: 10.0,
      parentName: 'Serkan ÖZTÜRK',
      parentPhone: '+90 532 444 5566',
      lastAbsence: 'Dün',
      status: 'sms_sent',
      note: 'Rehberlik servisi bireysel takip görüşmesi başlattı.',
    },
  ])

  // ── DATA: SUBJECT PERFORMANCE OVERVIEW ──
  const subjectAverages = useMemo(() => {
    return [
      { name: 'Türkçe', avg: 88.4, change: '+2.8', color: 'emerald', tests: 4 },
      { name: 'Matematik', avg: 82.2, change: '+4.1', color: 'blue', tests: 4 },
      { name: 'Fen Bilimleri', avg: 89.1, change: '+1.5', color: 'teal', tests: 3 },
      { name: 'Sosyal / Hayat B.', avg: 90.8, change: '+0.9', color: 'purple', tests: 3 },
      { name: 'Yabancı Dil (İng)', avg: 84.5, change: '+3.4', color: 'amber', tests: 3 },
      { name: 'Din Kültürü', avg: 92.4, change: '+1.2', color: 'rose', tests: 2 },
    ]
  }, [])

  // ── DATA: DYNAMIC STUDENT ATTENDANCE STATS ──
  const totalEnrolledStudents = useMemo(() => {
    return classData.reduce((acc, c) => acc + (c.students || 0), 0)
  }, [classData])

  // ── ACTIONS ──
  const handleSendSmsAlert = (student: any) => {
    setCriticalStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, status: 'sms_sent' } : s))
    )
    toast.success(
      `${student.name} öğrencisinin velisine (${student.parentPhone}) resmi devamsızlık SMS bildirimi başarıyla iletildi.`,
      { duration: 4000 }
    )
    setSelectedStudentAlert(null)
  }

  const handleDownloadReport = (type: 'pdf' | 'excel' | 'print', name: string) => {
    if (type === 'pdf') {
      toast.success(`${name} PDF formatında başarıyla hazırlandı ve indirildi!`, {
        icon: '📄',
        duration: 3500,
      })
    } else if (type === 'excel') {
      toast.success(`${name} Excel (.xlsx) veri tablosu olarak cihazınıza kaydedildi!`, {
        icon: '📊',
        duration: 3500,
      })
    } else {
      toast.success(`Yazıcı kuyruğuna gönderildi (AirPrint / MEB Onaylı Yazıcı).`, {
        icon: '🖨️',
        duration: 3500,
      })
    }
  }

  // Filtered class list based on search & grade
  const filteredClasses = useMemo(() => {
    return classData.filter((c) => {
      const matchSearch =
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.topSubject.toLowerCase().includes(searchQuery.toLowerCase())
      const matchGrade = selectedGrade === 'all' || c.code.startsWith(selectedGrade)
      return matchSearch && matchGrade
    })
  }, [classData, searchQuery, selectedGrade])

  // Calculated overall school statistics
  const overallStats = useMemo(() => {
    const totalStudents = classData.reduce((acc, c) => acc + c.students, 0)
    const avgScore = (
      classData.reduce((acc, c) => acc + c.average, 0) / classData.length
    ).toFixed(1)
    const avgAttendance = (
      classData.reduce((acc, c) => acc + c.attendanceRate, 0) / classData.length
    ).toFixed(1)
    const totalTakdir = classData.reduce((acc, c) => acc + c.awardCounts.takdir, 0)
    const totalTesekkur = classData.reduce((acc, c) => acc + c.awardCounts.tesekkur, 0)
    return {
      totalStudents,
      avgScore,
      avgAttendance,
      totalTakdir,
      totalTesekkur,
      homeworkRate: '91.8',
      competencyRate: '88.4',
    }
  }, [classData])

  const pageContent = (
    <div className="flex flex-col flex-1 w-full pb-8 select-none font-jakarta space-y-4">
      {/* ── 1. EXECUTIVE INSTITUTION & HEADER CARD ── */}
      <section className="px-4 pt-3">
        <div className="bg-gradient-to-r from-[#240632] via-[#3B0754] to-[#4B075F] rounded-3xl p-4 sm:p-5 text-white border border-purple-500/30 shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shrink-0 shadow-inner">
                <BarChart3 size={22} className="text-[#F0D8FA]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-white">
                    İdari Raporlar & Akademik Analiz
                  </h1>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-purple-100 border border-white/20">
                    Müdürlük
                  </span>
                </div>
                <p className="text-[11px] text-purple-200/90 font-medium mt-0.5">
                  MEB Müfredatı, Devamsızlık Takibi & Resmi Kurum Belgeleri
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[10.5px] text-purple-200/80">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white">{principalProfile.name}</span>
                  <span>·</span>
                  <span>{principalProfile.title || 'Okul Müdürü'}</span>
                  <span>·</span>
                  <span className="font-semibold text-purple-200">2026-2027 (1. Dönem)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setPdfReportType('Genel Kurum Akademik Değerlendirme Raporu')
                  setIsPdfPreviewOpen(true)
                }}
                className="h-9 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
              >
                <FileText size={14} />
                <span>Resmi MEB PDF</span>
              </button>
              <button
                type="button"
                onClick={() => toast.success('Akademik veriler ve devamsızlık listeleri güncellendi.', { icon: '🔄' })}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Verileri Yenile"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. EXECUTIVE METRIC SUMMARY STRIP ── */}
      <section className="px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Metric 1 */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Başarı Ort.
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp size={12} /> +%3.2
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              %{overallStats.avgScore}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5 font-medium">MEB Hedefi: %80+</div>
          </div>

          {/* Metric 2 */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Genel Devam
              </span>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-0.5">
                <ShieldCheck size={12} /> Yüksek
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              %{overallStats.avgAttendance}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5 font-medium">10 Gün Sınırı Aktif</div>
          </div>

          {/* Metric 3 */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Ödev Teslim
              </span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                %91.8
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              1,135 / 1,240
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5 font-medium">Haftalık Tamamlama</div>
          </div>

          {/* Metric 4 */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Belge Adayları
              </span>
              <Award size={14} className="text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {overallStats.totalTakdir + overallStats.totalTesekkur} Öğrenci
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-bold truncate">
              {overallStats.totalTakdir} Takdir · {overallStats.totalTesekkur} Teşekkür
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. CATEGORY SWITCHER & TERM FILTER ── */}
      <section className="px-4 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* 4 Clean Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'Tüm Raporlar', count: '3 Kategori', icon: Layers },
              { id: 'success', label: '1. Başarı & Sınavlar', count: `${filteredClasses.length} Şube`, icon: Award },
              { id: 'attendance', label: '2. Devamsızlık & Risk', count: `${criticalStudents.length} Riskli`, icon: AlertTriangle },
              { id: 'export', label: '3. Resmi Çıktılar', count: '5 Belge', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ReportTab)}
                  className={`px-3 py-2 rounded-xl font-bold text-xs shrink-0 flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#4B075F] text-white shadow-sm shadow-purple-950/20 ring-2 ring-purple-600/30'
                      : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-800 hover:border-[#4B075F]/40'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-purple-200' : 'text-gray-400'} />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded-md ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1 self-start sm:self-auto p-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSelectedTerm('term1')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedTerm === 'term1'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              1. Dönem
            </button>
            <button
              type="button"
              onClick={() => setSelectedTerm('term2')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedTerm === 'term2'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              2. Dönem
            </button>
            <button
              type="button"
              onClick={() => setSelectedTerm('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedTerm === 'all'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Tüm Yıl
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. CATEGORIZED CONTENTS ── */}
      <section className="px-4 space-y-5">
        {/* ──────────────── KATEGORİ 1: SINIF & BRANŞ BAŞARI ANALİZLERİ ──────────────── */}
        {(activeTab === 'all' || activeTab === 'success') && (
          <div className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-[#4B075F] dark:text-purple-300 flex items-center justify-center font-black shrink-0">
                  <Award size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md bg-[#4B075F]/10 dark:bg-purple-950 text-[#4B075F] dark:text-purple-300 border border-[#4B075F]/20">
                      KATEGORİ 1
                    </span>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white">
                      Sınıf & Branş Başarı Analizleri
                    </h2>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    Şube başarı sıralamaları, branş ders ortalamaları ve şube karneleri
                  </p>
                </div>
              </div>

              {/* Search & Grade Filter */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-52">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Şube veya öğretmen ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#4B075F]"
                  />
                </div>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="h-8 px-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tüm Seviyeler</option>
                  <option value="9">9. Sınıflar</option>
                  <option value="10">10. Sınıflar</option>
                  <option value="11">11. Sınıflar</option>
                  <option value="12">12. Sınıflar</option>
                  <option value="4">4. Sınıflar</option>
                  <option value="3">3. Sınıflar</option>
                </select>
              </div>
            </div>

            {/* Sub-block 1: Branş Ders Ortalamaları */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  Ders Bazında Okul Ortalamaları
                </h3>
                <span className="text-[10px] text-gray-400 font-medium">6 Temel Branş</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {subjectAverages.map((sub) => (
                  <div
                    key={sub.name}
                    className="p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
                  >
                    <div className="text-[10.5px] text-gray-500 dark:text-gray-400 font-bold truncate">
                      {sub.name}
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-base font-black text-gray-900 dark:text-white">
                        {sub.avg}
                      </span>
                      <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                        {sub.change}
                      </span>
                    </div>
                    <div className="text-[9.5px] text-gray-400 mt-0.5">{sub.tests} Sınav Girildi</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-block 2: Şube Başarı Karşılaştırması & Sıralaması */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  Şube Başarı Karşılaştırması (Leaderboard)
                </h3>
                <span className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Detay için karta dokunun
                </span>
              </div>

              <div className="space-y-2">
                {filteredClasses.map((cls, idx) => (
                  <div
                    key={cls.code}
                    onClick={() => setSelectedClassDetail(cls)}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800/80 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          idx === 0
                            ? 'bg-amber-400 text-gray-950 shadow-xs'
                            : idx === 1
                            ? 'bg-slate-300 text-gray-900'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span>{cls.code} Şubesi</span>
                          <span className="text-[10.5px] text-gray-400 font-normal">
                            · {cls.teacher} ({cls.students} Öğrenci)
                          </span>
                        </div>
                        <div className="text-[10.5px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          En Başarılı: <strong className="text-gray-700 dark:text-gray-200">{cls.topSubject}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                        %{cls.average}
                      </div>
                      <div className="text-[9.5px] text-gray-400 font-medium">
                        Devam: %{cls.attendanceRate}
                      </div>
                      <div className="text-[9.5px] text-[#4B075F] dark:text-purple-300 font-bold mt-0.5 flex items-center justify-end gap-0.5">
                        <span>Karne</span>
                        <ChevronRight size={10} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── KATEGORİ 2: DEVAMSIZLIK & MEB 10 GÜN RİSK TAKİBİ ──────────────── */}
        {(activeTab === 'all' || activeTab === 'attendance') && (
          <div className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      KATEGORİ 2
                    </span>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white">
                      Devamsızlık & MEB 10 Gün Risk Takibi
                    </h2>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    MEB İlköğretim ve Ortaöğretim Yönetmeliği (5 Gün Uyarısı & 10 Gün Yasal Sınırı)
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full self-start sm:self-auto">
                {criticalStudents.length} Riskli Öğrenci Takipte
              </span>
            </div>

            {/* Daily Attendance Summary Box */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    Günlük Yoklama & Devam Durumu
                  </span>
                </div>
                <span className="text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                  %100 Eksiksiz Giriş
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/60">
                  <div className="text-xl font-black text-gray-900 dark:text-white">
                    {totalEnrolledStudents}
                  </div>
                  <div className="text-[10.5px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                    Mevcut Öğrenci
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50">
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                    {selectedOrgId === 30 ? 0 : 8}
                  </div>
                  <div className="text-[10.5px] font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                    İzinli / Raporlu
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50">
                  <div className="text-xl font-black text-rose-600 dark:text-rose-400">
                    {selectedOrgId === 30 ? 0 : 4}
                  </div>
                  <div className="text-[10.5px] font-bold text-rose-700 dark:text-rose-400 mt-0.5">
                    Özürsüz Devamsız
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Students List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  Yasal Devamsızlık İhtarı Bekleyenler
                </h3>
                <span className="text-[10.5px] text-gray-400 font-medium">MEB 5+ Gün Uyarısı</span>
              </div>

              {criticalStudents.map((st) => (
                <div
                  key={st.id}
                  className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                        <span>{st.name}</span>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {st.className}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Veli: {st.parentName} ({st.parentPhone})
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-rose-600 dark:text-rose-400">
                        {st.unexcusedDays} Gün Özürsüz
                      </div>
                      <div className="text-[9.5px] text-gray-400">
                        Toplam: {st.totalDays} Gün (Son: {st.lastAbsence})
                      </div>
                    </div>
                  </div>

                  <div className="text-[10.5px] text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900/60 p-2 rounded-xl border border-gray-200/60 dark:border-gray-800">
                    {st.note}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
                    <span
                      className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md ${
                        st.status === 'sms_sent'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : st.status === 'meeting_done'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {st.status === 'sms_sent'
                        ? 'SMS İletildi'
                        : st.status === 'meeting_done'
                        ? 'Görüşüldü'
                        : 'SMS Bekliyor'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedStudentAlert(st)}
                      className="px-3 py-1.5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Send size={12} />
                      <span>Veliye SMS İhtar Gönder</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──────────────── KATEGORİ 3: RESMİ MEB & e-OKUL RAPOR ÇIKTILARI ──────────────── */}
        {(activeTab === 'all' || activeTab === 'export') && (
          <div className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      KATEGORİ 3
                    </span>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white">
                      Resmi MEB & e-Okul Rapor Çıktıları
                    </h2>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    Kurum antetli, onay mühürlü PDF ve Excel (.xlsx) rapor dökümleri
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 rounded-full self-start sm:self-auto border border-emerald-300 dark:border-emerald-800">
                5 Hazır Evrak
              </span>
            </div>

            {/* Document Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  title: '1. Dönem Kurum Akademik Başarı Raporu',
                  format: 'PDF',
                  icon: FileText,
                  size: '1.4 MB',
                  date: '2026-2027 Güz',
                  badge: 'MEB Resmi Antetli',
                  desc: 'Okul geneli şube başarı grafikleri, ders ortalamaları ve takdir/teşekkür aday listesi.',
                },
                {
                  title: 'Haftalık Devamsızlık & Yoklama İcmal Tablosu',
                  format: 'Excel (.xlsx)',
                  icon: FileSpreadsheet,
                  size: '840 KB',
                  date: 'Güncel',
                  badge: 'e-Okul Uyumlu',
                  desc: 'Tüm şubelerdeki öğrencilerin özürlü/özürsüz devamsızlık günleri ve veli iletişim dökümü.',
                },
                {
                  title: 'Şube Öğretmenler Kurulu (ŞÖK) Karar Tutanağı',
                  format: 'PDF',
                  icon: FileText,
                  size: '980 KB',
                  date: '1. Dönem',
                  badge: 'Kurul Onaylı',
                  desc: 'Şubelerin akademik ve davranış değerlendirme tutanakları, kurul kararları ve imza sirküleri.',
                },
                {
                  title: 'MEB Müfredat Kazanım Kavrama Çizelgesi',
                  format: 'PDF',
                  icon: FileText,
                  size: '2.1 MB',
                  date: 'Ekim 2026',
                  badge: 'Kazanım Analizi',
                  desc: 'Ders ve ünite bazında güçlü kazanımlar ile tekrar tavsiye edilen öğrenme çıktıları tablosu.',
                },
                {
                  title: 'Öğretmen Ders İşleme ve Yıllık Plan Takip Raporu',
                  format: 'Excel (.xlsx)',
                  icon: FileSpreadsheet,
                  size: '620 KB',
                  date: 'Haftalık',
                  badge: 'Müfredat Takip',
                  desc: 'Öğretmenlerin haftalık ders saati tamamlama oranları ve ödev kontrol çizelgeleri.',
                },
              ].map((doc) => {
                const Icon = doc.icon
                return (
                  <div
                    key={doc.title}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/90 dark:border-gray-800/80 shadow-xs flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-[#4B075F] dark:text-purple-300 flex items-center justify-center shrink-0">
                            <Icon size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-gray-900 dark:text-white leading-tight">
                              {doc.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {doc.format} · {doc.size} · {doc.date}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-[#4B075F] dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 shrink-0">
                          {doc.badge}
                        </span>
                      </div>

                      <p className="text-[10.5px] text-gray-500 dark:text-gray-400 leading-snug">
                        {doc.desc}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => {
                          setPdfReportType(doc.title)
                          setIsPdfPreviewOpen(true)
                        }}
                        className="h-8 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>Önizle</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadReport(doc.format.includes('Excel') ? 'excel' : 'pdf', doc.title)}
                        className="h-8 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Download size={12} />
                        <span>İndir</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* ── MODAL 1: SINIF / ŞUBE AYRINTILI AKADEMİK RAPORU ── */}
      <AnimatePresence>
        {selectedClassDetail && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClassDetail(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
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
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                    {selectedClassDetail.code}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      {selectedClassDetail.code} Şubesi Akademik Raporu
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      Rehber Öğretmen: {selectedClassDetail.teacher}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClassDetail(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
                {/* Score Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Şube Başarı Ortalaması</div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      %{selectedClassDetail.average}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Devam Oranı</div>
                    <div className="text-base font-black text-gray-900 dark:text-white mt-0.5">
                      %{selectedClassDetail.attendanceRate}
                    </div>
                  </div>
                </div>

                {/* Dersler Listesi */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-gray-900 dark:text-white">
                    Ders Bazında Sınav Not Ortalamaları
                  </div>
                  <div className="space-y-1.5">
                    {selectedClassDetail.subjects.map((sub: any) => (
                      <div
                        key={sub.name}
                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between"
                      >
                        <span className="font-bold text-gray-900 dark:text-white">{sub.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${sub.avg}%` }}
                            />
                          </div>
                          <span className="font-black text-xs text-gray-900 dark:text-white w-8 text-right">
                            {sub.avg}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Belge Durumu */}
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-800 flex items-center justify-around text-center">
                  <div>
                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {selectedClassDetail.awardCounts.takdir}
                    </div>
                    <div className="text-[10px] text-gray-400">Takdir Belgesi</div>
                  </div>
                  <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <div className="text-sm font-black text-blue-600 dark:text-blue-400">
                      {selectedClassDetail.awardCounts.tesekkur}
                    </div>
                    <div className="text-[10px] text-gray-400">Teşekkür Belgesi</div>
                  </div>
                  <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <div className="text-sm font-black text-gray-700 dark:text-gray-300">
                      {selectedClassDetail.students}
                    </div>
                    <div className="text-[10px] text-gray-400">Toplam Öğrenci</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleDownloadReport('pdf', `${selectedClassDetail.code} Şubesi Not Çizelgesi`)
                      setSelectedClassDetail(null)
                    }}
                    className="w-full h-11 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-950/20 transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Şube Karnesini PDF Olarak İndir</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: VELİYE DEVAMSIZLIK İHTAR SMS MODALI ── */}
      <AnimatePresence>
        {selectedStudentAlert && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudentAlert(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
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
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Send size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Resmi Devamsızlık İhtar SMS'i
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      MEB Standart Veli Bilgilendirme Sistemi
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudentAlert(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3.5 text-xs">
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Alıcı Veli</div>
                  <div className="font-extrabold text-gray-900 dark:text-white text-sm mt-0.5">
                    {selectedStudentAlert.parentName} ({selectedStudentAlert.parentPhone})
                  </div>
                  <div className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Öğrenci: <strong>{selectedStudentAlert.name}</strong> ({selectedStudentAlert.className})
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                    Gönderilecek SMS Metni:
                  </label>
                  <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 font-mono text-[11px] text-gray-800 dark:text-gray-200 leading-relaxed">
                    Sayin Veli, {selectedStudentAlert.className} sinifi {selectedStudentAlert.name} isimli ogrenciniz toplam {selectedStudentAlert.unexcusedDays} gun ozursuz devamsizlik yapmistir. MEB yonetmeligi geregi okula gelerek mazeret belgenizi iletmeniz onemle rica olunur. - {activeOrg.name} Mudurlugu
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentAlert(null)}
                    className="h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendSmsAlert(selectedStudentAlert)}
                    className="h-10 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-black shadow-md shadow-purple-950/20 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>Onayla & SMS Gönder</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: RESMİ MEB RAPOR ÖNİZLEME PENCERESİ ── */}
      <AnimatePresence>
        {isPdfPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPdfPreviewOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-xs"
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
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Resmi Rapor Önizleme
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      MEB Onaylı Belge · 2026-2027 Eğitim Öğretim Yılı
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPdfPreviewOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Rapor Önizleme Yaprağı (A4 Simülasyonu) */}
              <div className="p-4 overflow-y-auto space-y-3 text-xs">
                <div className="p-5 rounded-2xl bg-white text-gray-900 border border-gray-300 shadow-md space-y-3 font-serif">
                  {/* Antet */}
                  <div className="text-center border-b border-gray-300 pb-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      T.C. MİLLÎ EĞİTİM BAKANLIĞI
                    </div>
                    <div className="text-xs font-black uppercase text-gray-900 mt-0.5">
                      {activeOrg.name} MÜDÜRLÜĞÜ
                    </div>
                    <div className="text-[9px] text-gray-500 mt-0.5 font-sans">
                      Kurum Kodu: 765432 · Belge No: MEB-AKAD-2026/894
                    </div>
                  </div>

                  {/* Başlık */}
                  <div className="text-center py-1">
                    <div className="text-xs font-black uppercase tracking-wide underline underline-offset-4 font-sans">
                      {pdfReportType}
                    </div>
                    <div className="text-[9.5px] text-gray-500 mt-1 font-sans">
                      Rapor Tarihi: 09 Ekim 2026 · Hazırlayan: {principalProfile.name} ({principalProfile.title || 'Okul Müdürü'})
                    </div>
                  </div>

                  {/* Özet Tablo */}
                  <div className="space-y-1 font-sans text-[10.5px]">
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">Toplam Kayıtlı Öğrenci:</span>
                      <strong className="text-gray-900">{overallStats.totalStudents}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">Okul Genel Başarı Ortalaması:</span>
                      <strong className="text-emerald-700">%{overallStats.avgScore}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">Öğrenci Devamlılık Oranı:</span>
                      <strong className="text-emerald-700">%{overallStats.avgAttendance}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">Takdir Belgesi Hak Edenler:</span>
                      <strong className="text-gray-900">{overallStats.totalTakdir} Öğrenci</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Müfredat Kazanım Kavrama Oranı:</span>
                      <strong className="text-emerald-700">%{overallStats.competencyRate}</strong>
                    </div>
                  </div>

                  {/* Mühür & İmza */}
                  <div className="pt-4 mt-2 border-t border-gray-200 flex justify-between items-end font-sans">
                    <div className="text-[8px] text-gray-400">
                      Karekod ile MEBBİS sisteminden<br />doğrulanabilir e-imzalı belgedir.
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-bold text-gray-800">{principalProfile.name}</div>
                      <div className="text-[8.5px] text-gray-500">{principalProfile.title || 'Okul Müdürü'}</div>
                      <div className="text-[8px] text-emerald-600 font-bold mt-0.5">[E-İmzalıdır]</div>
                    </div>
                  </div>
                </div>

                {/* Butonlar */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadReport('print', pdfReportType)}
                    className="h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>Yazdır (AirPrint)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleDownloadReport('pdf', pdfReportType)
                      setIsPdfPreviewOpen(false)
                    }}
                    className="h-10 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/20 transition-colors cursor-pointer"
                  >
                    <Download size={13} />
                    <span>PDF Olarak İndir</span>
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
            activeTab="more"
            onOpenMoreSheet={() => setIsMoreSheetOpen(true)}
            orgSlug={orgSlug}
            theme={theme}
          />
        )}

        {/* ── ALL 14 MODULES DRAWER SHEET ── */}
        <MobileAdminMoreSheet
          isOpen={isMoreSheetOpen}
          onClose={() => setIsMoreSheetOpen(false)}
          theme={theme}
          orgSlug={orgSlug}
        />
      </div>
    </div>
  )
}
