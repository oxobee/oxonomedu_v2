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
  Activity,
  AlertCircle,
  HelpCircle,
  Target,
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

export type ProgressTabType = 'grades' | 'analysis' | 'guidance'

interface StudentProgressViewProps {
  initialTab?: string
}

export default function StudentProgressView({
  initialTab = 'grades',
}: StudentProgressViewProps) {
  const [activeTab, setActiveTab] = useState<ProgressTabType>(() => {
    if (
      initialTab === 'improvement' ||
      initialTab === 'charts' ||
      initialTab === 'goals' ||
      initialTab === 'achievements'
    ) {
      return 'analysis'
    }
    if (initialTab === 'guidance') return 'guidance'
    return 'grades'
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

  // Academic Improvement Analysis
  const courseAnalysis = useMemo(() => {
    return courseGrades.map((c: any) => {
      const e1Num =
        c.exam1 !== undefined && c.exam1 !== null && String(c.exam1) !== ''
          ? Number(c.exam1)
          : null
      const e2Num =
        c.exam2 !== undefined && c.exam2 !== null && String(c.exam2) !== ''
          ? Number(c.exam2)
          : null
      const perfNum =
        c.performance !== undefined && c.performance !== null && String(c.performance) !== ''
          ? Number(c.performance)
          : null
      const avgNum =
        c.average !== undefined && c.average !== null && !isNaN(Number(c.average))
          ? Number(c.average)
          : null

      const hasGrades = avgNum !== null || e1Num !== null || e2Num !== null || perfNum !== null
      const diff = e1Num !== null && e2Num !== null ? e2Num - e1Num : null
      const isDeclining = diff !== null && diff < 0
      const isImproving = diff !== null && diff > 0
      const isStable = diff !== null && diff === 0

      const isCritical =
        (avgNum !== null && avgNum < 50) ||
        (e1Num !== null && e1Num < 50) ||
        (e2Num !== null && e2Num < 50)
      const isWarning = (avgNum !== null && avgNum >= 50 && avgNum < 70) || isDeclining
      const isExcellent = avgNum !== null && avgNum >= 85
      const needAttention = isCritical || isWarning

      let diagnosis = ''
      let recommendation = ''

      if (!hasGrades) {
        diagnosis = 'Henüz sınav veya performans notu girilmedi.'
        recommendation = 'Ders programına uygun şekilde konu tekrarlarına devam ediniz.'
      } else if (isCritical) {
        diagnosis = `Not ortalaması (${avgNum ?? '-'}) başarı eşiğinin altındadır.`
        recommendation = 'Öğretmen ile telafi çalışması planlanmalı ve eksik konular tekrar edilmelidir.'
      } else if (isDeclining) {
        diagnosis = `Son sınavda ${Math.abs(diff!)} puanlık düşüş gözlemlendi.`
        recommendation = 'Son işlenen üniteler gözden geçirilmeli, pekiştirme testleri çözülmelidir.'
      } else if (isWarning) {
        diagnosis = `Ders ortalaması (${avgNum}) geçer seviyede, ancak hedefin altındadır.`
        recommendation = 'Haftalık soru çözüm sayısı artırılmalı ve etütlere katılım sağlanmalıdır.'
      } else if (isExcellent) {
        diagnosis = isImproving
          ? `+${diff} puanlık artışla güçlü bir başarı grafiği yakalandı.`
          : `Ders ortalaması (${avgNum}) üstün başarı seviyesindedir.`
        recommendation = 'Mevcut çalışma disiplini korunmalı ve ileri düzey sorularla desteklenmelidir.'
      } else {
        diagnosis = `Ders performansı dengeli ve başarılı seviyededir (${avgNum} Ort).`
        recommendation = 'Düzenli tekrar ile mevcut başarı seviyesi korunmalıdır.'
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

  const attentionCourses = useMemo(() => {
    return courseAnalysis.filter((c) => c.hasGrades && c.needAttention)
  }, [courseAnalysis])

  const topCourses = useMemo(() => {
    return courseAnalysis.filter((c) => c.hasGrades && (c.isExcellent || (c.average !== null && c.average >= 75)))
  }, [courseAnalysis])

  const homeworkStats = useMemo(() => {
    const total = assignments.length
    const completed = assignments.filter((a) => {
      const id = String(a.assignment_uuid || a.id)
      return !!submissions[id]
    }).length
    const pending = Math.max(0, total - completed)
    const rate = total > 0 ? Math.round((completed / total) * 100) : 100

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

  const positiveNotes = useMemo(() => {
    return guidanceNotes.filter(
      (n) =>
        !n.content.toLowerCase().includes('uyarı') &&
        !n.content.toLowerCase().includes('kritik') &&
        !n.content.toLowerCase().includes('etüt')
    )
  }, [guidanceNotes])

  const attentionGuidanceNotes = useMemo(() => {
    const list: { id: string; author: string; date: string; content: string; isCritical: boolean }[] = []

    guidanceNotes.forEach((n) => {
      const lower = n.content.toLowerCase()
      if (
        lower.includes('uyarı') ||
        lower.includes('kritik') ||
        lower.includes('etüt') ||
        lower.includes('odaklan')
      ) {
        list.push({
          id: n.id,
          author: n.author,
          date: n.date,
          content: n.content,
          isCritical: lower.includes('kritik'),
        })
      }
    })

    courseAnalysis.forEach((ca, idx) => {
      if (ca.isCritical) {
        list.push({
          id: `crit-alert-${idx}`,
          author: `${ca.teacherName || 'Zümre Öğretmeni'} (${ca.courseName})`,
          date: 'Akademik Durum',
          content: `${ca.courseName} dersinde not ortalaması kritik eşiktedir. Eksik kazanımları tamamlamak için telafi çalışması tavsiye edilir.`,
          isCritical: true,
        })
      } else if (ca.isDeclining) {
        list.push({
          id: `decline-alert-${idx}`,
          author: `${ca.teacherName || 'Zümre Öğretmeni'} (${ca.courseName})`,
          date: 'Akademik Durum',
          content: `${ca.courseName} dersinde son sınavda ${Math.abs(ca.diff!)} puanlık düşüş kaydedildi. Pekiştirme testi çözülmesi önerilir.`,
          isCritical: false,
        })
      }
    })

    return list
  }, [guidanceNotes, courseAnalysis])

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
        label: 'Takdir Seviyesi',
        badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        rankCaption: 'Sınıf 1 / 30 (En Yüksek Başarı)',
      }
    }
    if (gpa >= 70) {
      return {
        label: 'Teşekkür Seviyesi',
        badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
        rankCaption: `Sınıf ${profile.classRank} / 30 (Başarılı)`,
      }
    }
    if (gpa >= 50) {
      return {
        label: 'Geçer Seviye',
        badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        rankCaption: `Sınıf ${profile.classRank} / 30 (Gelişim Takibinde)`,
      }
    }
    return {
      label: 'Kritik Seviye',
      badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
      rankCaption: `Sınıf ${profile.classRank} / 30 (Destek Gerekli)`,
    }
  }, [profile.gpa, profile.classRank, profile.className, profile.studentNo])

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-jakarta">
      {/* ── HERO BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs"
      >
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-[#4B075F] dark:text-[#C58ADB] text-xs font-bold">
            <TrendingUp size={14} />
            <span>Akademik Gelişim & Başarı Karnesi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Gelişimim ve Akademik Durumum
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Ders notları, gelişim analizleri ve öğretmen değerlendirmelerinin güncel özeti.
          </p>
        </div>

        {/* Student Mini Card */}
        <div className="flex items-center gap-3 p-3 sm:px-4 rounded-2xl bg-[#F0D8FA]/50 dark:bg-[#2D2035]/60 border border-[#D5C5DC]/60 dark:border-[#49364F] self-start md:self-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4B075F] to-[#8D49A6] text-white font-black text-sm flex items-center justify-center shadow-xs">
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
      </motion.div>

      {/* ── KPI METRICS (4 KART) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* GPA */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase truncate">
            Not Ortalaması
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            {profile.gpa > 0 ? profile.gpa : '-'}{' '}
            {profile.gpa > 0 && <span className="text-xs font-normal text-gray-400">/ 100</span>}
          </div>
          <div
            className={`text-[11px] font-bold flex items-center gap-1 truncate ${
              profile.gpa >= 85
                ? 'text-emerald-600 dark:text-emerald-400'
                : profile.gpa >= 70
                ? 'text-blue-600 dark:text-blue-400'
                : profile.gpa >= 50
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            <Award size={13} className="shrink-0" />
            <span className="truncate">{academicLevelMeta.label}</span>
          </div>
        </div>

        {/* Sınıf Sıralaması */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase truncate">
            Sınıf Sıralaması
          </div>
          <div
            className={`text-xl sm:text-2xl font-black ${
              profile.classRank <= 3
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-[#4B075F] dark:text-[#C58ADB]'
            }`}
          >
            {profile.classRank}. Sıra
          </div>
          <div className="text-[11px] text-gray-500 font-semibold truncate">
            {profile.className} Sınıfı
          </div>
        </div>

        {/* Devamlılık */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase truncate">
            Ders Katılımı
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            %{profile.attendanceRate}
          </div>
          <div className="text-[11px] text-gray-500 font-semibold flex items-center gap-1 truncate">
            <CheckCircle2
              size={13}
              className={`shrink-0 ${profile.absentDays === 0 ? 'text-emerald-500' : 'text-amber-500'}`}
            />
            <span className="truncate">
              {profile.absentDays === 0 ? 'Tam Devam' : `${profile.absentDays} Gün İzinli/Devamsız`}
            </span>
          </div>
        </div>

        {/* Ödev Teslim */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase truncate">
            Ödev Başarısı
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#4B075F] dark:text-[#C58ADB]">
            %{homeworkStats.rate}
          </div>
          <div className="text-[11px] text-gray-500 font-semibold flex items-center gap-1 truncate">
            <FileText size={13} className="shrink-0 text-[#8D49A6]" />
            <span className="truncate">
              {homeworkStats.completed}/{homeworkStats.total} Teslim
              {homeworkStats.homeworkScoreAvg !== null && ` • ${homeworkStats.homeworkScoreAvg} Ort`}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3 ANLAŞILIR TAB BUTONU ── */}
      <div className="flex items-center gap-2 border-b border-gray-200/80 dark:border-gray-800/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('grades')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'grades'
              ? 'bg-[#4B075F] text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          <BookOpen size={15} />
          <span>Dersler & Notlar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analysis')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'analysis'
              ? 'bg-[#4B075F] text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          <BarChart2 size={15} />
          <span>Gelişim & Analiz</span>
          {attentionCourses.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
              {attentionCourses.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guidance')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'guidance'
              ? 'bg-[#4B075F] text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          <Sparkles size={15} />
          <span>Öğretmen Görüşleri</span>
          {positiveNotes.length + attentionGuidanceNotes.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#8D49A6] text-white text-[10px] font-black">
              {positiveNotes.length + attentionGuidanceNotes.length}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB 1: DERSLER & NOTLAR ── */}
      {activeTab === 'grades' && (
        <div className="space-y-5">
          {/* Not Çizelgesi Tablosu */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-[#8D49A6]" />
                  <span>Ders Başarı ve Sınav Notları ({profile.className})</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  1. Yazılı, 2. Yazılı, sözlü ve performans değerlendirmeleri
                </p>
              </div>
              <span className="text-xs font-black text-[#4B075F] dark:text-[#C58ADB] font-mono">
                Genel Ort: {profile.gpa > 0 ? profile.gpa : '-'}
              </span>
            </div>

            <div className="w-full overflow-x-auto touch-pan-x">
              <table className="w-full text-left text-xs min-w-[560px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 font-bold">
                    <th className="pb-2.5">Ders Adı</th>
                    <th className="pb-2.5">Öğretmen</th>
                    <th className="pb-2.5 text-center">1. Sınav</th>
                    <th className="pb-2.5 text-center">2. Sınav</th>
                    <th className="pb-2.5 text-center">Sözlü / Perf.</th>
                    <th className="pb-2.5 text-right">Dönem Ort.</th>
                    <th className="pb-2.5 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-semibold">
                  {courseGrades.map((c: any) => {
                    const title = c.courseName || c.name
                    const teacher = c.teacherName || c.teacher || 'Ders Öğretmeni'
                    const e1 = c.exam1 !== undefined && c.exam1 !== null && String(c.exam1) !== '' ? c.exam1 : '-'
                    const e2 = c.exam2 !== undefined && c.exam2 !== null && String(c.exam2) !== '' ? c.exam2 : '-'
                    const perf = c.performance !== undefined && c.performance !== null && String(c.performance) !== '' ? c.performance : '-'
                    const avgNum = c.average !== undefined && c.average !== null && !isNaN(Number(c.average)) ? Number(c.average) : null
                    const avgStr = avgNum !== null ? avgNum.toFixed(1) : '-'

                    return (
                      <tr key={title} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="py-3 font-bold text-gray-900 dark:text-white">{title}</td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">{teacher}</td>
                        <td className="py-3 text-center font-mono font-bold">{e1}</td>
                        <td className="py-3 text-center font-mono font-bold">{e2}</td>
                        <td className="py-3 text-center font-mono font-bold text-purple-600 dark:text-purple-400">{perf}</td>
                        <td
                          className={`py-3 text-right font-black text-sm font-mono ${
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
                        <td className="py-3 text-right">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                              avgNum === null
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                : avgNum >= 50
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                            }`}
                          >
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

          {/* Görsel Ders Başarı Çubukları */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity size={16} className="text-[#8D49A6]" />
              <span>Ders Başarı Göstergeleri</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {courseAnalysis.map((c) => {
                const score = c.average !== null ? c.average : null
                const percent = score !== null ? Math.max(5, Math.min(100, score)) : 0

                return (
                  <div
                    key={c.courseName}
                    className="p-3.5 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-800/30 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-900 dark:text-white truncate">{c.courseName}</span>
                      <span
                        className={`font-mono text-xs ${
                          score === null
                            ? 'text-gray-400'
                            : score >= 85
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : score >= 50
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {score !== null ? `${score} Ort` : 'Bekliyor'}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          score === null
                            ? 'bg-transparent'
                            : score >= 85
                            ? 'bg-emerald-500'
                            : score >= 50
                            ? 'bg-[#4B075F]'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Devamsızlık ve Ödev Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Devamsızlık Özeti */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <UserCheck size={16} className="text-emerald-500" />
                  <span>Devam ve Katılım Durumu</span>
                </h4>
                <span className="text-xs font-bold text-emerald-600">
                  %{profile.attendanceRate} Katılım
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Özürsüz</div>
                  <div className="text-sm font-black text-gray-900 dark:text-white font-mono">
                    {profile.absentUnexcusedDays || 0} Gün
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">İzinli</div>
                  <div className="text-sm font-black text-gray-900 dark:text-white font-mono">
                    {profile.absentExcusedDays || 0} Gün
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400">
                  <div className="text-[10px] uppercase font-bold">Toplam</div>
                  <div className="text-sm font-black font-mono">
                    {profile.absentDays} Gün
                  </div>
                </div>
              </div>
            </div>

            {/* Ödev Teslim Özeti */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <FileText size={16} className="text-[#8D49A6]" />
                  <span>Ödev Teslim İstatistikleri</span>
                </h4>
                <span className="text-xs font-bold text-[#4B075F] dark:text-[#C58ADB]">
                  %{homeworkStats.rate} Teslim Oranı
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Toplam</div>
                  <div className="text-sm font-black text-gray-900 dark:text-white font-mono">
                    {homeworkStats.total} Ödev
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400">
                  <div className="text-[10px] uppercase font-bold">Teslim Edilen</div>
                  <div className="text-sm font-black font-mono">
                    {homeworkStats.completed} Ödev
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400">
                  <div className="text-[10px] uppercase font-bold">Bekleyen</div>
                  <div className="text-sm font-black font-mono">
                    {homeworkStats.pending} Ödev
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: GELİŞİM & ANALİZ ── */}
      {activeTab === 'analysis' && (
        <div className="space-y-5">
          {/* Dikkat ve Gelişim Gerektiren Dersler */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  <span>Çalışılması ve Pekiştirilmesi Gereken Dersler</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Düşüş trendindeki veya ek tekrar ihtiyacı olan derslerin analizi
                </p>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-xl ${
                  attentionCourses.length > 0
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {attentionCourses.length > 0
                  ? `${attentionCourses.length} Derste Dikkat Gerekiyor`
                  : 'Tüm Dersler Hedef Seviyede'}
              </span>
            </div>

            {attentionCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {attentionCourses.map((item) => (
                  <div
                    key={item.courseName}
                    className={`p-4 rounded-2xl border space-y-2.5 ${
                      item.isCritical
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                        : 'bg-amber-50/30 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-sm text-gray-900 dark:text-white">
                        {item.courseName}
                      </div>
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1 ${
                          item.isCritical
                            ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {item.isDeclining ? (
                          <TrendingDown size={13} />
                        ) : (
                          <AlertCircle size={13} />
                        )}
                        <span>{item.average !== null ? `${item.average} Ort` : 'Kritik'}</span>
                      </span>
                    </div>

                    <div className="text-xs text-gray-700 dark:text-gray-300">
                      <strong>Durum: </strong> {item.diagnosis}
                    </div>

                    <div className="text-xs text-[#4B075F] dark:text-[#C58ADB] bg-white/70 dark:bg-[#121826]/70 p-2.5 rounded-xl border border-gray-200/40 dark:border-gray-800/40">
                      <strong>Öneri: </strong> {item.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 text-center space-y-1">
                <CheckCircle2 size={24} className="text-emerald-500 mx-auto" />
                <div className="text-sm font-extrabold text-emerald-800 dark:text-emerald-200">
                  Tüm derslerde başarı grafiğiniz stabil ve güçlü!
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  Kritik düşüş veya telafi gerektiren bir ders bulunmuyor.
                </div>
              </div>
            )}
          </div>

          {/* Güçlü Olduğum Dersler */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Award size={18} className="text-emerald-500" />
                <span>En Başarılı ve Güçlü Olduğum Dersler</span>
              </h2>
              <span className="text-xs font-bold text-emerald-600">
                {topCourses.length} Başarılı Ders
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topCourses.map((c) => (
                <div
                  key={c.courseName}
                  className="p-3.5 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/15 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-black text-gray-900 dark:text-white">
                      {c.courseName}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {c.teacherName || 'Ders Öğretmeni'}
                    </div>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-mono">
                    {c.average} Ort
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: ÖĞRETMEN GÖRÜŞLERİ ── */}
      {activeTab === 'guidance' && (
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" />
                <span>Öğretmen ve Rehberlik Değerlendirmeleri</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Sınıf öğretmeni ve zümre öğretmenlerinin akademik gözlemleri
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400">
              {positiveNotes.length + attentionGuidanceNotes.length} Kayıt
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pozitif Gözlemler */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Güçlü Akademik Yönler & Takdirler</span>
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
                    Henüz kayıtlı pozitif görüş bulunmuyor.
                  </div>
                )}
              </div>
            </div>

            {/* Gelişim Tavsiyeleri */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={14} />
                <span>Gelişim Odaklı Yönlendirmeler</span>
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
                        <span
                          className={`font-extrabold ${
                            note.isCritical
                              ? 'text-rose-900 dark:text-rose-200'
                              : 'text-amber-900 dark:text-amber-200'
                          }`}
                        >
                          {note.author}
                        </span>
                        <span
                          className={`text-[10px] font-mono ${
                            note.isCritical
                              ? 'text-rose-700 dark:text-rose-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
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
                    Şu an dikkat edilmesi gereken olumsuz bir bildirim bulunmuyor.
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
