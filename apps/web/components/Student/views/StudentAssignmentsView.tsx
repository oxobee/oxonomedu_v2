'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  ArrowRight,
  Upload,
  User,
  Sparkles,
  Paperclip,
} from 'lucide-react'
import {
  getStoredCustomAssignments,
  DEFAULT_SCHOOL_ASSIGNMENTS,
  type SchoolAssignmentItem,
} from '@services/school_assignments/school_assignments'
import {
  getStudentSubmissions,
  saveStudentSubmission,
  getSynchronizedStudentAssignments,
  getSynchronizedStudentProfile,
  type StudentSubmission,
  type StudentProfile,
  DEFAULT_STUDENT_PROFILE,
} from '@/lib/student/studentData'
import MockBadge from '@components/Common/MockBadge'

export default function StudentAssignmentsView() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [assignments, setAssignments] = useState<SchoolAssignmentItem[]>([])
  const [submissions, setSubmissions] = useState<Record<string, StudentSubmission>>({})
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE)

  // Load assignments and student submissions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sync = () => {
        setAssignments(getSynchronizedStudentAssignments())
        setSubmissions(getStudentSubmissions())
        setProfile(getSynchronizedStudentProfile())
      }
      sync()

      // Fetch fresh assignments from server database
      import('@services/school_assignments/school_assignments').then(({ fetchAssignmentsFromServer }) => {
        fetchAssignmentsFromServer().then(() => sync()).catch(() => {})
      })

      window.addEventListener('oxonom_assignments_updated', sync)
      window.addEventListener('oxonom_student_homeworks_updated', sync)
      window.addEventListener('oxonom_student_submission_updated', sync)
      window.addEventListener('oxonom_student_updated', sync)
      window.addEventListener('storage', sync)

      return () => {
        window.removeEventListener('oxonom_assignments_updated', sync)
        window.removeEventListener('oxonom_student_homeworks_updated', sync)
        window.removeEventListener('oxonom_student_submission_updated', sync)
        window.removeEventListener('oxonom_student_updated', sync)
        window.removeEventListener('storage', sync)
      }
    }
  }, [])

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      const id = String(asg.assignment_uuid || asg.id)
      const isSubmitted = !!submissions[id]

      if (activeTab === 'pending' && isSubmitted) return false
      if (activeTab === 'completed' && !isSubmitted) return false

      const asgSub = (asg as any).subject_name || asg.subject
      if (selectedSubject !== 'all' && asgSub !== selectedSubject) return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const titleMatch = (asg.title || '').toLowerCase().includes(query)
        const descMatch = (asg.description || '').toLowerCase().includes(query)
        const teacherMatch = (asg.teacher_name || '').toLowerCase().includes(query)
        return titleMatch || descMatch || teacherMatch
      }

      return true
    })
  }, [assignments, submissions, activeTab, selectedSubject, searchQuery])

  // Count badges
  const pendingCount = useMemo(() => {
    return assignments.filter((a) => !submissions[String(a.assignment_uuid || a.id)]).length
  }, [assignments, submissions])

  const completedCount = useMemo(() => {
    return assignments.filter((a) => !!submissions[String(a.assignment_uuid || a.id)]).length
  }, [assignments, submissions])

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <BookOpen size={14} />
            <span>Akademik Çalışmalar</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Ödevlerim ve Çalışmalarım
            </h1>
            <MockBadge label="Canlı Senkronize" />
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Öğretmenlerin {profile.className} şubesi ve senin için tanımladığı ders görevleri, çalışma föyleri ve teslim durumu.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-[#131C31] border border-gray-200/80 dark:border-gray-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white dark:bg-[#0E1526] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Bekleyenler ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-[#0E1526] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Tamamlananlar ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-[#0E1526] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Tümü ({assignments.length})
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0E1526] p-3 rounded-2xl border border-gray-200/80 dark:border-gray-800/80">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Ödev başlığı, ders veya öğretmen ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="all">Tüm Dersler</option>
            <option value="Türkçe">Türkçe / Edebiyat</option>
            <option value="Matematik">Matematik</option>
            <option value="Fen Bilimleri">Fen Bilimleri</option>
            <option value="İngilizce">İngilizce</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((asg) => {
            const id = String(asg.assignment_uuid || asg.id)
            const sub = submissions[id]
            const isCompleted = !!sub

            return (
              <Link
                key={id}
                href={`/student/assignments/${id}`}
                className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:border-emerald-400/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Status & Subject Pill */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                        {(asg as any).subject_name || asg.subject || 'Edebiyat'}
                      </span>
                      {asg.target_type === 'INDIVIDUAL' || (asg as any).tool_data?.targetType === 'INDIVIDUAL' ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          🎯 Sana Özel
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          👥 9-A Şubesi
                        </span>
                      )}
                    </div>
                    {isCompleted ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>Teslim Edildi</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Clock size={12} />
                        <span>Bekliyor</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {asg.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                      {asg.description || 'Ödev açıklaması ve detaylı talimatları incelemek için dokunun.'}
                    </p>
                  </div>

                  {/* Details box */}
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/40 dark:border-gray-800/40 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <span>Öğretmen:</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {asg.teacher_name || 'Bahar ÇETİN'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <span>Son Teslim:</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {asg.due_date ? String(asg.due_date).slice(0, 10) : '24 Ekim 2026'}
                      </span>
                    </div>
                    {isCompleted && sub?.score !== undefined && (
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold pt-1 border-t border-gray-200/40 dark:border-gray-800/40">
                        <span>Puan:</span>
                        <span>{sub.score} / 100</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer action */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>{isCompleted ? 'Ödev Detayı ve Puanı' : 'Ödevi Çöz & Teslim Et'}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })
        ) : (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80">
            <BookOpen size={32} className="mx-auto text-gray-400 mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Bu kriterde ödev bulunmuyor</h3>
            <p className="text-xs text-gray-400 mt-1">Filtreleri değiştirerek tekrar deneyebilirsiniz.</p>
          </div>
        )}
      </div>
    </div>
  )
}
