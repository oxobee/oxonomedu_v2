'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Calendar,
  Sparkles,
  BarChart2,
  AlertTriangle,
  FileText,
  UserCheck,
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  Percent,
  Layers,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Activity,
} from 'lucide-react'
import {
  DEFAULT_STUDENT_PROFILE,
  getSynchronizedStudentProfile,
  getSynchronizedGuidanceNotes,
  getSynchronizedStudentAssignments,
  getStudentSubmissions,
  type StudentProfile,
  type GuidanceNoteItem,
} from '@/lib/student/studentData'
import { fetchExamsFromServer } from '@/lib/teacher/teacherAgendaStorage'

export type ProgressTabType =
  | 'all'
  | 'improvement'
  | 'charts'
  | 'grades'
  | 'homework'
  | 'attendance'
  | 'guidance'
  | 'subjects'

interface StudentProgressViewProps {
  initialTab?: ProgressTabType | string
}

export default function StudentProgressView({
  initialTab = 'all',
}: StudentProgressViewProps) {
  const [activeTab, setActiveTab] = useState<ProgressTabType>(() => {
    if (initialTab === 'subjects') return 'charts'
    if (initialTab === 'achievements' || initialTab === 'goals') return 'improvement'
    return (initialTab as ProgressTabType) || 'all'
  })

  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE)
  const [guidanceNotes, setGuidanceNotes] = useState<GuidanceNoteItem[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<Record<string, any>>({})

  useEffect(() => {
    const sync = () => {
      setProfile(getSynchronizedStudentProfile())
      setGuidanceNotes(getSynchronizedGuidanceNotes())
      setAssignments(getSynchronizedStudentAssignments())
      setSubmissions(getStudentSubmissions())
    }
    sync()

    // Sync remote exams to update student grades reactively
    fetchExamsFromServer().then(() => {
      sync()
    })

    window.addEventListener('oxonom_student_updated', sync)
    window.addEventListener('oxonom_teacher_profile_updated', sync)
    window.addEventListener('oxonom_attendance_updated', sync)
    window.addEventListener('oxonom_assignments_updated', sync)
    window.addEventListener('oxonom_student_submission_updated', sync)
    window.addEventListener('oxonom_exam_calendar_updated', sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener('oxonom_student_updated', sync)
      window.removeEventListener('oxonom_teacher_profile_updated', sync)
      window.removeEventListener('oxonom_attendance_updated', sync)
      window.removeEventListener('oxonom_assignments_updated', sync)
      window.removeEventListener('oxonom_student_submission_updated', sync)
      window.removeEventListener('oxonom_exam_calendar_updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  // Raw course grades from profile
  const courseGrades = useMemo(() => {
    return profile.grades && profile.grades.length > 0 ? profile.grades : []
  }, [profile.grades])

  // Academic Improvement Analysis (Kötü veya kötüye giden dersler ve gelişim analizleri)
  const courseAnalysis = useMemo(() => {
    return courseGrades.map((c: any) => {
      const e1Num = c.exam1 !== undefined && c.exam1 !== null && String(c.exam1) !== '' ? Number(c.exam1) : null
      const e2Num = c.exam2 !== undefined && c.exam2 !== null && String(c.exam2) !== '' ? Number(c.exam2) : null
      const perfNum = c.performance !== undefined && c.performance !== null && String(c.performance) !== '' ? Number(c.performance) : null
      const avgNum = c.average !== undefined && c.average !== null && !isNaN(Number(c.average)) ? Number(c.average) : null

      const hasGrades = avgNum !== null || e1Num !== null || e2Num !== null || perfNum !== null
      const diff = e1Num !== null && e2Num !== null ? e2Num - e1Num : null
      const isDeclining = diff !== null && diff < 0
      const isImproving = diff !== null && diff > 0
      const isStable = diff !== null && diff === 0

      const isCritical = (avgNum !== null && avgNum < 50) || (e1Num !== null && e1Num < 50) || (e2Num !== null && e2Num < 50)
      const isWarning = (avgNum !== null && avgNum >= 50 && avgNum < 70) || isDeclining
      const isExcellent = avgNum !== null && avgNum >= 85
      const needAttention = isCritical || isWarning

      let diagnosis = ''
      let recommendation = ''

      if (!hasGrades) {
        diagnosis = `${c.courseName} dersinde henüz sınav veya performans puanı girilmemiştir.`
        recommendation = 'Planlanan sınav takvimine uygun şekilde konu tekrarlarına devam edilmelidir.'
      } else if (isCritical) {
        const scoreStr = [
          e1Num !== null ? `1. Sınav: ${e1Num}` : null,
          e2Num !== null ? `2. Sınav: ${e2Num}` : null,
          avgNum !== null ? `Ort: ${avgNum}` : null,
        ]
          .filter(Boolean)
          .join(' • ')
        diagnosis = `${c.courseName} dersinde alınan puanlar (${scoreStr}) kritik başarı sınırının altındadır. Temel kazanım eksikleri tespit edilmiştir.`
        recommendation = 'Ders öğretmeni ile acil birebir telafi etüdü planlanmalı, temel konu anlatımları ve eksik kazanım testleri sıfırdan çözülmelidir.'
      } else if (isDeclining) {
        diagnosis = `${c.courseName} dersinde 1. sınavdan (${e1Num}) 2. sınava (${e2Num}) ${Math.abs(diff!)} puanlık düşüş gözlemlenmiştir.`
        recommendation = 'Son işlenen üniteler tekrar edilmeli, soru bankasından pekiştirme testleri çözülmeli ve etütlere katılım sağlanmalıdır.'
      } else if (isWarning) {
        diagnosis = `${c.courseName} dersi ortalaması ${avgNum} puan olup geçer seviyededir ancak hedeflenen başarı düzeyinin altındadır.`
        recommendation = 'Haftalık soru çözüm sayısı artırılmalı ve soru çözüm saatlerine aktif katılım sağlanmalıdır.'
      } else if (isExcellent) {
        diagnosis = isImproving
          ? `${c.courseName} dersinde 1. sınavdan (${e1Num}) 2. sınava (${e2Num}) +${diff} puanlık yükselişle güçlü bir başarı yakalandı.`
          : `${c.courseName} dersi ortalaması ${avgNum} seviyesinde üstün akademik başarı göstermektedir.`
        recommendation = 'Mevcut ders çalışma disiplini sürdürülmeli ve ileri düzey soru çözümleriyle başarı pekiştirilmelidir.'
      } else {
        diagnosis = `${c.courseName} dersi başarısı hedef seviyenin üzerinde dengeli şekilde korunmaktadır (${avgNum} Ort).`
        recommendation = 'Düzenli tekrar ve ünite sonu değerlendirme testleriyle başarı pekiştirilmelidir.'
      }

      return {
        ...c,
        average: avgNum,
        exam1Num: e1Num,
        exam2Num: e2Num,
        perfNum,
        diff,
        hasGrades,
        isDeclining,
        isImproving,
        isStable,
        isCritical,
        isWarning,
        isExcellent,
        needAttention,
        diagnosis,
        recommendation,
      }
    })
  }, [courseGrades])

  // Filter declining or attention-needed courses
  const attentionCourses = useMemo(() => {
    return courseAnalysis.filter((c) => c.hasGrades && c.needAttention)
  }, [courseAnalysis])

  // Real Homework stats strictly calculated from submissions
  const homeworkStats = useMemo(() => {
    const total = assignments.length
    const completed = assignments.filter((a) => {
      const id = String(a.assignment_uuid || a.id)
      return !!submissions[id]
    }).length
    const pending = Math.max(0, total - completed)
    const rate = total > 0 ? Math.round((completed / total) * 100) : 100

    // Calculate real average score of submitted and graded homeworks
    const scoredSubmissions = Object.values(submissions).filter(
      (s: any) => s && s.score !== undefined && s.score !== null && !isNaN(Number(s.score))
    )
    const homeworkScoreAvg =
      scoredSubmissions.length > 0
        ? Number(
            (
              scoredSubmissions.reduce((acc: number, s: any) => acc + Number(s.score), 0) /
              scoredSubmissions.length
            ).toFixed(1)
          )
        : null

    return { total, completed, pending, rate, homeworkScoreAvg }
  }, [assignments, submissions])

  // Guidance notes categorized by sentiment
  const positiveNotes = useMemo(() => {
    return guidanceNotes.filter(
      (n) => !n.content.toLowerCase().includes('uyarı') && !n.content.toLowerCase().includes('kritik') && !n.content.toLowerCase().includes('etüt')
    )
  }, [guidanceNotes])

  // Dynamic pedagogical guidance notes derived from real grades
  const attentionGuidanceNotes = useMemo(() => {
    const list: { id: string; author: string; date: string; content: string; isCritical: boolean }[] = []

    // Add teacher guidance notes that indicate warnings
    guidanceNotes.forEach((n) => {
      const lower = n.content.toLowerCase()
      if (lower.includes('uyarı') || lower.includes('kritik') || lower.includes('etüt') || lower.includes('odaklan')) {
        list.push({
          id: n.id,
          author: n.author,
          date: n.date,
          content: n.content,
          isCritical: lower.includes('kritik'),
        })
      }
    })

    // Dynamically inject pedagogical feedback for critical or declining subjects
    courseAnalysis.forEach((ca, idx) => {
      if (ca.isCritical) {
        list.push({
          id: `crit-alert-${idx}`,
          author: `${ca.teacherName || 'Zümre Öğretmeni'} (${ca.courseName})`,
          date: 'Güncel Akademik Kayıt',
          content: `${ca.courseName} dersinde dönem ortalaması (${ca.average}/100) kritik seviyededir. Öğrencinin temel kazanım açıklarını telafi etmek üzere birebir destek etüdü programı önerilmektedir.`,
          isCritical: true,
        })
      } else if (ca.isDeclining) {
        list.push({
          id: `decline-alert-${idx}`,
          author: `${ca.teacherName || 'Zümre Öğretmeni'} (${ca.courseName})`,
          date: 'Güncel Akademik Kayıt',
          content: `${ca.courseName} dersinde son sınavda ${Math.abs(ca.diff!)} puanlık düşüş tespit edilmiştir. İlgili konularda soru çözümü pekiştirmesi tavsiye edilir.`,
          isCritical: false,
        })
      }
    })

    return list
  }, [guidanceNotes, courseAnalysis])

  // Academic status level badge
  const academicLevelMeta = useMemo(() => {
    const gpa = profile.gpa
    if (gpa === 0) {
      return {
        label: 'Not Girişi Sürecinde',
        badgeBg: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        rankCaption: `${profile.className} • No: ${profile.studentNo}`,
      }
    }
    if (gpa >= 85) {
      return {
        label: 'Takdir Belgesi Seviyesi',
        badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        rankCaption: 'Sınıf 1 / 30 (En Yüksek Başarı)',
      }
    }
    if (gpa >= 70) {
      return {
        label: 'Teşekkür Belgesi Seviyesi',
        badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
        rankCaption: `Sınıf ${profile.classRank} / 30 (Başarılı Seviye)`,
      }
    }
    if (gpa >= 50) {
      return {
        label: 'Geçer Not / Geliştirilmeli',
        badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        rankCaption: `Sınıf ${profile.classRank} / 30 (Gelişim Takibinde)`,
      }
    }
    return {
      label: 'Kritik Seviye / Etüt Takibinde',
      badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
      rankCaption: `Sınıf ${profile.classRank} / 30 (Akademik Destek Zorunlu)`,
    }
  }, [profile.gpa, profile.classRank, profile.className, profile.studentNo])

  return (
    <div className="w-full max-w-full overflow-x-hidden p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-jakarta select-none">
      {/* ── HEADER BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-[28px] sm:rounded-3xl p-4.5 sm:p-6 shadow-sm"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <TrendingUp size={14} />
            <span>Akademik Gelişim & Bireysel Teşhis</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Gelişimim ve Akademik Durumum
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Öğretmen paneliyle canlı eşitlenen ders notları, gelişim analizi, ödev istatistikleri ve rehberlik görüşleri.
          </p>
        </div>

        {/* Student Badge Pill */}
        <div className="flex items-center gap-3">
          <div className="p-3 sm:p-3.5 px-3.5 sm:px-4 rounded-2xl bg-[#F0D8FA]/60 dark:bg-[#2D2035] border border-[#D5C5DC]/60 dark:border-[#49364F] flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-brand-gradient text-white font-black text-sm flex items-center justify-center shadow-xs">
              {profile.firstName.slice(0, 1)}
              {profile.lastName.slice(0, 1)}
            </div>
            <div>
              <div className="text-xs font-extrabold text-gray-900 dark:text-white">
                {profile.name}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                {profile.className} • No: {profile.studentNo}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── KPI METRICS CARDS (GERÇEK DİNAMİK VERİLERLE, 2 SÜTUN MOBİL) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* 1. GPA */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1"
        >
          <div className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase truncate">Genel Not Ortalaması</div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            {profile.gpa > 0 ? profile.gpa : '-'} {profile.gpa > 0 && <span className="text-xs font-normal text-gray-400">/ 100</span>}
          </div>
          <div className={`text-[10.5px] sm:text-[11px] font-bold flex items-center gap-1 truncate ${
            profile.gpa >= 85
              ? 'text-emerald-600 dark:text-emerald-400'
              : profile.gpa >= 70
              ? 'text-blue-600 dark:text-blue-400'
              : profile.gpa >= 50
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}>
            <Award size={13} className="shrink-0" />
            <span className="truncate">{academicLevelMeta.label}</span>
          </div>
        </motion.div>

        {/* 2. Sınıf Sıralaması */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1"
        >
          <div className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase truncate">Sınıf Başarı Sırası</div>
          <div className={`text-xl sm:text-2xl font-black ${
            profile.classRank <= 3 ? 'text-cyan-600 dark:text-cyan-400' : profile.classRank <= 15 ? 'text-[#4B075F] dark:text-[#C58ADB]' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {profile.classRank}. Sıra <span className="text-xs font-normal text-gray-400">({profile.className})</span>
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-gray-500 font-semibold truncate">
            {academicLevelMeta.rankCaption}
          </div>
        </motion.div>

        {/* 3. Devamlılık */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1"
        >
          <div className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase truncate">Ders Katılım Oranı</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            %{profile.attendanceRate}
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-gray-500 font-semibold flex items-center gap-1 truncate">
            <CheckCircle2 size={13} className={`shrink-0 ${profile.absentDays === 0 ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span className="truncate">{profile.absentDays === 0 ? '0 Gün (Kusursuz)' : `${profile.absentDays} Gün Devamsızlık`}</span>
          </div>
        </motion.div>

        {/* 4. Ödev Teslim Oranı */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1"
        >
          <div className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase truncate">Ödev Teslim Başarısı</div>
          <div className="text-xl sm:text-2xl font-black text-[#4B075F] dark:text-[#C58ADB]">
            %{homeworkStats.rate}
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-[#4B075F] dark:text-[#C58ADB] font-bold flex items-center gap-1 truncate">
            <FileText size={13} className="shrink-0" />
            <span className="truncate">
              {homeworkStats.completed}/{homeworkStats.total} Teslim
              {homeworkStats.homeworkScoreAvg !== null && ` • ${homeworkStats.homeworkScoreAvg} Ort`}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── TAB NAVİGASYON ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-gray-200/80 dark:border-gray-800/80">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'all'
              ? 'bg-[#4B075F] text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
          }`}
        >
          Genel Bakış
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('improvement')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'improvement'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
          }`}
        >
          <AlertTriangle size={14} />
          <span>Çalışması Gereken Alanlar & Analiz</span>
          {attentionCourses.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ml-1">
              {attentionCourses.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('charts')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'charts'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
          }`}
        >
          <BarChart2 size={14} />
          <span>Ders Başarı Grafikleri</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grades')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'grades'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
          }`}
        >
          Yazılı & Sözlü Not Çizelgesi
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('homework')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'homework'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
          }`}
        >
          Ödev İstatistikleri
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
          }`}
        >
          Devamsızlık Durumu
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guidance')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'guidance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
          }`}
        >
          Öğretmen Görüşleri
        </button>
      </div>

      {/* ── BÖLÜM 1: ÇALIŞMASI GEREKEN ALANLAR & AKADEMİK TEŞHİS ── */}
      {(activeTab === 'all' || activeTab === 'improvement') && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  <span>Çalışması Gereken Alanlar & Akademik Teşhis</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Gerçek sınav sonuçlarına göre zayıf veya düşüş trendindeki dersler ve çalışma tavsiyeleri
                </p>
              </div>

              <span className={`text-xs font-bold px-3 py-1 rounded-xl self-start sm:self-auto ${
                attentionCourses.length > 0
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
              }`}>
                {attentionCourses.length > 0 ? `${attentionCourses.length} Derste Kritik / Dikkat Durumu` : 'Tüm Dersler Hedef Seviyede'}
              </span>
            </div>

            {/* Düşüş ve Dikkat Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseAnalysis.map((item) => {
                const isDown = item.isDeclining

                return (
                  <div
                    key={item.courseName}
                    className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                      item.isCritical
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300/80 dark:border-rose-800/60'
                        : isDown
                        ? 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-300/80 dark:border-amber-800/60'
                        : 'bg-gray-50/60 dark:bg-gray-800/30 border-gray-200/60 dark:border-gray-800/60'
                    }`}
                  >
                    {/* Header: Course name & Trend pill */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                          {item.courseName}
                        </h4>
                        <span className="text-[11px] text-gray-400">
                          {item.teacherName}
                        </span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl ${
                            item.isCritical
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                              : isDown
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                              : item.isExcellent
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                          }`}
                        >
                          {item.isCritical ? (
                            <AlertTriangle size={14} />
                          ) : isDown ? (
                            <TrendingDown size={14} />
                          ) : (
                            <TrendingUp size={14} />
                          )}
                          <span>
                            {item.isCritical
                              ? `Kritik (${item.average ?? '-'} Ort)`
                              : item.diff !== null && item.diff > 0
                              ? `+${item.diff} Puan Artış`
                              : item.diff !== null && item.diff < 0
                              ? `${item.diff} Puan Düşüş`
                              : item.average !== null
                              ? `${item.average} Ort`
                              : 'Puan Bekleniyor'}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Sınavlar Karşılaştırma Grafiği (1. Sınav vs 2. Sınav) - Sadece Sınav Varsa Görünür */}
                    {(item.exam1Num !== null || item.exam2Num !== null) && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          <span>1. Sınav: {item.exam1Num !== null ? `${item.exam1Num} Puan` : 'Girilmedi'}</span>
                          <span>2. Sınav: {item.exam2Num !== null ? `${item.exam2Num} Puan` : 'Girilmedi'}</span>
                        </div>

                        {/* Visual Graphic Bars */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div
                                style={{ width: `${item.exam1Num !== null ? Math.max(3, Math.min(100, item.exam1Num)) : 0}%` }}
                                className={`h-full rounded-full transition-all duration-500 ${
                                  item.exam1Num === null
                                    ? 'bg-transparent'
                                    : item.exam1Num < 50
                                    ? 'bg-rose-500'
                                    : 'bg-[#4B075F]'
                                }`}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 mt-0.5 block font-mono">
                              {item.exam1Num !== null ? `${item.exam1Num} / 100` : 'Girilmedi'}
                            </span>
                          </div>

                          <div>
                            <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div
                                style={{ width: `${item.exam2Num !== null ? Math.max(3, Math.min(100, item.exam2Num)) : 0}%` }}
                                className={`h-full rounded-full transition-all duration-500 ${
                                  item.exam2Num === null
                                    ? 'bg-transparent'
                                    : item.exam2Num < 50
                                    ? 'bg-rose-500'
                                    : isDown
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 mt-0.5 block font-mono">
                              {item.exam2Num !== null ? `${item.exam2Num} / 100` : 'Girilmedi'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Diagnostic Advice */}
                    <div className="p-3 rounded-xl bg-white dark:bg-[#121826] border border-gray-200/50 dark:border-gray-700/50 space-y-1.5 text-xs">
                      <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                        <AlertCircle
                          size={14}
                          className={`shrink-0 mt-0.5 ${
                            item.isCritical ? 'text-rose-500' : isDown ? 'text-amber-500' : 'text-emerald-500'
                          }`}
                        />
                        <span>{item.diagnosis}</span>
                      </div>

                      <div className={`text-[11px] font-medium p-2 rounded-lg border leading-relaxed ${
                        item.isCritical
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/50'
                          : 'bg-[#F0D8FA]/50 dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB] border-[#D5C5DC]/50 dark:border-[#49364F]'
                      }`}>
                        <strong className="font-bold">Önerilen Çalışma Planı: </strong>
                        {item.recommendation}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── BÖLÜM 2: DERS BAŞARI GRAFİKLERİ & KARŞILAŞTIRMALI NOT DAĞILIMI ── */}
      {(activeTab === 'all' || activeTab === 'charts') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart2 size={18} className="text-[#8D49A6]" />
                <span>Ders Başarı ve Not Dağılım Grafikleri</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Tüm derslerin dönem ortalamalarının ve sınav puanlarının grafiksel karşılaştırması
              </p>
            </div>

            <span className="text-xs font-black text-[#4B075F] dark:text-[#C58ADB] font-mono">
              Genel Başarı Ort: {profile.gpa > 0 ? `${profile.gpa} / 100` : 'Hesaplanıyor'}
            </span>
          </div>

          {/* Ders Başarı Grafikleri: MOBİLDE YATAY PERFORMANS KARTLARI, MASAÜSTÜNDE DİKEY KARŞILAŞTIRMA */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Activity size={14} className="text-[#8D49A6]" />
              <span>Ders Ortalamaları Başarı Grafiği (0 - 100 Puan)</span>
            </h3>

            {/* ── MOBİL GÖRÜNÜM: Yatay Kartlar ve Canlı İlerleme Çubukları (Taşmasız, %100 Uyumlu) ── */}
            <div className="block sm:hidden space-y-2.5">
              {courseAnalysis.map((c) => {
                const score = c.average !== null ? c.average : null
                const percent = score !== null ? Math.max(4, Math.min(100, score)) : 0
                const theme =
                  score === null
                    ? { bg: 'bg-gray-50 dark:bg-gray-800/40', bar: 'bg-gray-300 dark:bg-gray-600', text: 'text-gray-500', pill: 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300', status: 'Girilmedi' }
                    : score >= 85
                    ? { bg: 'bg-emerald-50/50 dark:bg-emerald-950/20', bar: 'bg-gradient-to-r from-emerald-500 to-teal-400', text: 'text-emerald-700 dark:text-emerald-300', pill: 'bg-emerald-500 text-white', status: 'Takdir Seviyesi' }
                    : score >= 70
                    ? { bg: 'bg-[#F0D8FA]/30 dark:bg-[#2D2035]/50', bar: 'bg-gradient-to-r from-[#4B075F] to-[#8D49A6]', text: 'text-[#4B075F] dark:text-[#C58ADB]', pill: 'bg-[#4B075F] text-white', status: 'Başarılı' }
                    : score >= 50
                    ? { bg: 'bg-amber-50/50 dark:bg-amber-950/20', bar: 'bg-gradient-to-r from-amber-500 to-orange-400', text: 'text-amber-700 dark:text-amber-300', pill: 'bg-amber-500 text-white', status: 'Geçer Seviye' }
                    : { bg: 'bg-rose-50/50 dark:bg-rose-950/20', bar: 'bg-gradient-to-r from-rose-500 to-red-500', text: 'text-rose-700 dark:text-rose-300', pill: 'bg-rose-500 text-white', status: 'Kritik Seviye' }

                return (
                  <div
                    key={c.courseName}
                    className={`p-3.5 rounded-2xl border border-gray-200/70 dark:border-gray-800/70 ${theme.bg} space-y-2.5`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-gray-900 dark:text-white truncate">
                          {c.courseName}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {c.teacherName || 'Ders Öğretmeni'}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[10.5px] font-black px-2 py-0.5 rounded-lg ${theme.pill}`}>
                          {score !== null ? `${score} Ort` : 'Girilmedi'}
                        </span>
                        <span className={`text-[9.5px] font-bold ${theme.text}`}>
                          {theme.status}
                        </span>
                      </div>
                    </div>

                    {/* Horizontal Animated Gauge Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-2.5 rounded-full bg-gray-200/80 dark:bg-gray-700/80 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${theme.bar}`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono">
                        <span>0 Puan</span>
                        {c.exam1Num !== null || c.exam2Num !== null ? (
                          <span className="text-slate-600 dark:text-slate-300 font-sans font-semibold">
                            {c.exam1Num !== null && `1. Sınav: ${c.exam1Num}`}
                            {c.exam1Num !== null && c.exam2Num !== null && ' · '}
                            {c.exam2Num !== null && `2. Sınav: ${c.exam2Num}`}
                          </span>
                        ) : null}
                        <span>100 Puan</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── MASAÜSTÜ GÖRÜNÜMÜ: Dikey Bar Karşılaştırması ── */}
            <div className="hidden sm:block p-6 rounded-2xl bg-gray-50/70 dark:bg-gray-800/30 border border-gray-200/60 dark:border-gray-800/60">
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3 items-end min-h-[220px] pt-8">
                {courseAnalysis.map((c) => {
                  const score = c.average !== null ? c.average : 0
                  const heightPercent = c.average !== null ? Math.max(8, Math.min(100, score)) : 4

                  return (
                    <div key={c.courseName} className="flex flex-col items-center gap-2 group">
                      {/* Score Badge */}
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md font-mono ${
                        c.average === null
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                          : c.average >= 85
                          ? 'bg-emerald-500 text-white'
                          : c.average >= 70
                          ? 'bg-blue-500 text-white'
                          : c.average >= 50
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}>
                        {c.average !== null ? c.average : '-'}
                      </span>

                      {/* Bar Container */}
                      <div className="w-full max-w-[36px] h-36 bg-gray-200/70 dark:bg-gray-700/60 rounded-xl overflow-hidden flex flex-col justify-end p-1">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`w-full rounded-lg transition-all ${
                            c.average === null
                              ? 'bg-gray-300 dark:bg-gray-600'
                              : c.average >= 85
                              ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                              : c.average >= 70
                              ? 'bg-gradient-to-t from-blue-600 to-blue-400'
                              : c.average >= 50
                              ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                              : 'bg-gradient-to-t from-rose-600 to-rose-400'
                          }`}
                        />
                      </div>

                      {/* Course Label */}
                      <span className="text-[10px] font-extrabold text-gray-700 dark:text-gray-300 text-center leading-tight line-clamp-2 min-h-[24px]">
                        {c.courseName.replace(' & Fen Bilimleri', '').replace(' (İngilizce)', '')}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-6 mt-4 border-t border-gray-200/60 dark:border-gray-700/60 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>85 - 100: Üstün Başarı</span>
                </span>
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>70 - 84: Başarılı</span>
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>50 - 69: Geçer Seviye</span>
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>0 - 49: Kritik / Başarısız</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BÖLÜM 3: TÜM YAZILI, SÖZLÜ VE PERFORMANS NOTLARI (KARNE ÇİZELGESİ) ── */}
      {(activeTab === 'all' || activeTab === 'grades') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart2 size={18} className="text-indigo-500" />
                <span>Yazılı, Sözlü ve Performans Not Çizelgesi ({profile.className})</span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Öğretmen paneli tarafından girilen resmi MEB yazılı, sözlü ve performans puanları
              </p>
            </div>

            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">
              Ağırlıklı Genel Ort: {profile.gpa > 0 ? profile.gpa : '-'}
            </span>
          </div>

          <div className="w-full max-w-full overflow-x-auto touch-pan-x custom-scrollbar">
            <table className="w-full text-left text-xs min-w-[580px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 font-bold">
                  <th className="pb-3">Ders Adı</th>
                  <th className="pb-3">Ders Öğretmeni</th>
                  <th className="pb-3 text-center">1. Yazılı</th>
                  <th className="pb-3 text-center">2. Yazılı</th>
                  <th className="pb-3 text-center">Sözlü Sınav</th>
                  <th className="pb-3 text-center">Performans</th>
                  <th className="pb-3 text-right">Dönem Notu</th>
                  <th className="pb-3 text-right">Başarı Durumu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-semibold">
                {courseGrades.map((c: any) => {
                  const courseTitle = c.courseName || c.name
                  const teacher = c.teacherName || c.teacher || 'Ders Öğretmeni'
                  const e1 = c.exam1 !== undefined && c.exam1 !== null && String(c.exam1) !== '' ? c.exam1 : '-'
                  const e2 = c.exam2 !== undefined && c.exam2 !== null && String(c.exam2) !== '' ? c.exam2 : '-'
                  const perf = c.performance !== undefined && c.performance !== null && String(c.performance) !== '' ? c.performance : '-'
                  const oral = c.performance !== undefined && c.performance !== null && String(c.performance) !== '' ? c.performance : '-'

                  const avgNum = c.average !== undefined && c.average !== null && !isNaN(Number(c.average)) ? Number(c.average) : null
                  const avgStr = avgNum !== null ? avgNum.toFixed(1) : '-'

                  return (
                    <tr key={courseTitle} className="hover:bg-gray-50/70 dark:hover:bg-[#131C31]/50 transition-colors">
                      <td className="py-3.5 font-bold text-gray-900 dark:text-white">{courseTitle}</td>
                      <td className="py-3.5 text-gray-500 dark:text-gray-400">{teacher}</td>
                      <td className="py-3.5 text-center font-mono font-bold">{e1}</td>
                      <td className="py-3.5 text-center font-mono font-bold">{e2}</td>
                      <td className="py-3.5 text-center font-mono font-bold text-amber-600 dark:text-amber-400">{oral}</td>
                      <td className="py-3.5 text-center font-mono font-bold text-purple-600 dark:text-purple-400">{perf}</td>
                      <td
                        className={`py-3.5 text-right font-black text-sm font-mono ${
                          avgNum === null
                            ? 'text-gray-400'
                            : avgNum >= 85
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : avgNum >= 50
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {avgStr}
                      </td>
                      <td className="py-3.5 text-right font-mono">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          avgNum === null
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                            : avgNum >= 50
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                        }`}>
                          {avgNum === null ? 'Bekliyor' : avgNum >= 50 ? 'Geçti' : 'Kritik'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BÖLÜM 4: ÖDEV SONUÇ İSTATİSTİKLERİ (GERÇEK VERİLERLE) ── */}
      {(activeTab === 'all' || activeTab === 'homework') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-indigo-500" />
                <span>Ödev Sonuç ve Teslim İstatistikleri</span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Öğretmenler tarafından atanan ev ödevleri, araştırma föyleri ve teslim durumu
              </p>
            </div>

            <span className="text-xs font-black px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 self-start sm:self-auto">
              %{homeworkStats.rate} Teslim Oranı
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
              <span className="text-[10px] font-bold text-gray-400 block uppercase">Toplam Ödev</span>
              <span className="text-lg font-black text-gray-900 dark:text-white">{homeworkStats.total} Görev</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block uppercase">Teslim Edilen</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{homeworkStats.completed} Görev</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block uppercase">Bekleyen</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">{homeworkStats.pending} Görev</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60">
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 block uppercase">Ödev Puan Ort.</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                {homeworkStats.homeworkScoreAvg !== null ? `${homeworkStats.homeworkScoreAvg} / 100` : 'Puan Bekleniyor'}
              </span>
            </div>
          </div>

          {/* List of assignments */}
          <div className="space-y-2.5 pt-2">
            {assignments.slice(0, 4).map((asg: any) => {
              const id = String(asg.assignment_uuid || asg.id)
              const sub = submissions[id]
              const isDone = !!sub
              const score = sub && sub.score !== undefined ? sub.score : null

              return (
                <div
                  key={id}
                  className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {isDone ? <Check size={16} /> : <Clock size={16} />}
                    </div>
                    <div>
                      <div className="font-extrabold text-gray-900 dark:text-white">
                        {asg.title}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {asg.subject_name || asg.subject || 'Ders Ödevi'} • Teslim Tarihi: {asg.due_date ? asg.due_date.split('T')[0] : 'Dönem İçi'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-xl shrink-0 ${
                      isDone
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {isDone ? (score !== null ? `Teslim Edildi • ${score} Puan` : 'Teslim Edildi • Not Bekliyor') : 'Teslim Bekliyor'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── BÖLÜM 5: DEVAMSIZLIK İSTATİSTİKLERİ ── */}
      {(activeTab === 'all' || activeTab === 'attendance') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <UserCheck size={18} className="text-emerald-500" />
                <span>Devamsızlık & Okul Devam İstatistikleri</span>
              </h2>
              <p className="text-[11px] text-gray-400">
                2026-2027 Eğitim Öğretim Yılı MEB resmi devamsızlık ve izin takibi
              </p>
            </div>

            <span className={`text-xs font-black px-3 py-1 rounded-xl ${
              profile.absentDays === 0
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
            }`}>
              {profile.absentDays === 0 ? 'Kusursuz Devam' : `${profile.absentDays} Gün Devamsızlık`}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <span>Ders Katılım Oranı: %{profile.attendanceRate}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  profile.absentDays === 0 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {profile.absentDays === 0 ? 'Sıfır Devamsızlık' : `${profile.absentDays} Gün Kayıt`}
                </span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {profile.absentDays === 0
                  ? 'Öğrenci dönem başından itibaren derslerin tamamına eksiksiz katılım sağlamıştır.'
                  : `Öğrencinin toplam ${profile.absentDays} gün devamsızlığı bulunmaktadır.`}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-center">
              <div className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0E1526] border border-emerald-200/60 shadow-xs">
                <span className="text-gray-400 text-[10px] block font-bold uppercase">Özürsüz</span>
                <strong className="text-xs font-black text-gray-900 dark:text-white font-mono">
                  {profile.absentUnexcusedDays || 0} Gün
                </strong>
                <span className="text-[9px] text-gray-400 block font-mono">Hak: 10 Gün</span>
              </div>

              <div className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0E1526] border border-emerald-200/60 shadow-xs">
                <span className="text-gray-400 text-[10px] block font-bold uppercase">Özürlü / İzinli</span>
                <strong className="text-xs font-black text-gray-900 dark:text-white font-mono">
                  {profile.absentExcusedDays || 0} Gün
                </strong>
                <span className="text-[9px] text-gray-400 block font-mono">Hak: 20 Gün</span>
              </div>

              <div className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0E1526] border border-emerald-200/60 shadow-xs">
                <span className="text-gray-400 text-[10px] block font-bold uppercase">Toplam Devamsızlık</span>
                <strong className={`text-xs font-black font-mono ${
                  profile.absentDays === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {profile.absentDays} Gün
                </strong>
                <span className={`text-[9px] block ${profile.absentDays > 7 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {profile.absentDays > 7 ? 'Risk Seviyesinde' : 'Risk Yok'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BÖLÜM 6: ÖĞRETMEN POZİTİF / DİKKAT EDİLMESİ GEREKEN GÖRÜŞLERİ ── */}
      {(activeTab === 'all' || activeTab === 'guidance') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" />
                <span>Öğretmen Değerlendirmeleri ve Pedagojik Görüşler</span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Sınıf rehber öğretmeni, zümre başkanları ve okul idaresinin resmi pedagojik değerlendirmeleri
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400">
              {positiveNotes.length + attentionGuidanceNotes.length} Kayıtlı Görüş
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Pozitif Görüşler (Güçlü Yönler) */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Pozitif Gözlemler & Güçlü Akademik Yönler</span>
              </h4>

              <div className="space-y-2.5">
                {positiveNotes.length > 0 ? (
                  positiveNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-emerald-900 dark:text-emerald-200">
                          {note.author}
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                          {note.date}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 text-xs text-gray-400 text-center">
                    Henüz kayıtlı pozitif rehberlik görüşü bulunmamaktadır.
                  </div>
                )}
              </div>
            </div>

            {/* 2. Geliştirilmesi / Dikkat Edilmesi Gereken Öğretmen Tavsiyeleri */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={14} />
                <span>Gelişim Odaklı Görüşler & Dikkat Tavsiyeleri</span>
              </h4>

              <div className="space-y-2.5">
                {attentionGuidanceNotes.length > 0 ? (
                  attentionGuidanceNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-4 rounded-2xl border space-y-1.5 ${
                        note.isCritical
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-800/60'
                          : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-extrabold ${
                          note.isCritical ? 'text-rose-900 dark:text-rose-200' : 'text-amber-900 dark:text-amber-200'
                        }`}>
                          {note.author}
                        </span>
                        <span className={`text-[10px] font-mono ${
                          note.isCritical ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'
                        }`}>
                          {note.date}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 text-xs text-gray-400 text-center">
                    Şu an dikkat edilmesi gereken olumsuz bir pedagojik not bulunmamaktadır.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
