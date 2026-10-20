'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  GraduationCap,
  Award,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Heart,
  ShieldCheck,
  FileText,
  X,
  ChevronRight,
  UserCheck,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Edit3,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { MStudentItem, MStudentCourseGrade } from '@components/Mobile/MStudentClient'
import MockBadge from '@components/Common/MockBadge'
import {
  ALL_CLASSROOMS,
  normalizeClassCode,
  getSingleSourceOfTruthStudents,
} from '@services/demo/schoolDirectory'

interface ClassOption {
  code: string
  name: string
  branch: string
  teacher: string
  studentCount: number
  avgGpa: number
}

export default function TeacherClassesView() {
  const searchParams = useSearchParams()
  const classFromQuery = searchParams.get('class')

  // Reactive students list from single source of truth
  const [students, setStudents] = useState<MStudentItem[]>(() => {
    return getSingleSourceOfTruthStudents(30)
  })

  // Selected Class State (null = prompt teacher to select class)
  const [selectedClass, setSelectedClass] = useState<string | null>(() => {
    if (classFromQuery) {
      const match = ALL_CLASSROOMS.find(
        (c) => c.code.toLowerCase() === classFromQuery.toLowerCase() || c.name.toLowerCase() === classFromQuery.toLowerCase()
      )
      if (match) return match.name
    }
    return null
  })

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'frozen'>('all')

  // Selected student for detailed modal
  const [selectedStudent, setSelectedStudent] = useState<MStudentItem | null>(null)
  const [activeProfileTab, setActiveProfileTab] = useState<'identity' | 'academic' | 'attendance' | 'parent'>('identity')

  // Grade Editing State inside Student Profile
  const [isEditingGrades, setIsEditingGrades] = useState(false)
  const [editableGrades, setEditableGrades] = useState<MStudentCourseGrade[]>([])

  // Keep students reactive with storage events
  useEffect(() => {
    const handleUpdate = () => {
      const fresh = getSingleSourceOfTruthStudents(30)
      setStudents(fresh)
      setSelectedStudent((prev) => {
        if (!prev) return null
        return fresh.find((s: any) => s.id === prev.id) || prev
      })
    }

    window.addEventListener('oxonom_student_updated', handleUpdate)
    window.addEventListener('oxonom_admin_students_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('oxonom_student_updated', handleUpdate)
      window.removeEventListener('oxonom_admin_students_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  // Sync with searchParams if it changes
  useEffect(() => {
    if (classFromQuery) {
      const match = ALL_CLASSROOMS.find(
        (c) => c.code.toLowerCase() === classFromQuery.toLowerCase() || c.name.toLowerCase() === classFromQuery.toLowerCase()
      )
      if (match) {
        setSelectedClass(match.name)
      }
    }
  }, [classFromQuery])

  // Dynamic Class Options with live student counts and computed average GPAs
  const availableClasses = useMemo(() => {
    return ALL_CLASSROOMS.map((cls) => {
      const clsStudents = students.filter((st) => {
        const sCode = normalizeClassCode(st.className)
        const cCode = normalizeClassCode(cls.code)
        return sCode === cCode || sCode.replace('-', '/') === cCode.replace('-', '/')
      })
      const count = clsStudents.length
      let avgGpa = 0
      if (count > 0) {
        const total = clsStudents.reduce((sum, st) => {
          let stGpa = typeof st.gpa === 'number' ? st.gpa : Number(st.gpa) || 0
          if (st.grades && st.grades.length > 0) {
            const gradeSum = st.grades.reduce((s, g) => s + (Number(g.average) || 0), 0)
            stGpa = Number((gradeSum / st.grades.length).toFixed(1))
          }
          return sum + stGpa
        }, 0)
        avgGpa = Number((total / count).toFixed(1))
      }
      return {
        code: cls.code,
        name: cls.name,
        branch: `${cls.grade_level} · Sınıf Rehberliği`,
        teacher: cls.teacher_name,
        studentCount: count,
        avgGpa,
      }
    })
  }, [students])

  // Students for the active selected class
  const classStudents = useMemo(() => {
    if (!selectedClass) return []
    const norm = normalizeClassCode(selectedClass)
    return students.filter((st) => {
      const sNorm = normalizeClassCode(st.className || '')
      return sNorm === norm || sNorm.replace('-', '/') === norm.replace('-', '/')
    })
  }, [students, selectedClass])

  // Filtered by search & status
  const filteredStudents = useMemo(() => {
    return classStudents.filter((st) => {
      if (statusFilter !== 'all' && st.status !== statusFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = st.name.toLowerCase().includes(q)
        const matchNo = st.studentNo.toLowerCase().includes(q)
        const matchTc = st.tcNo.toLowerCase().includes(q)
        const matchParent = st.parentName.toLowerCase().includes(q)
        if (!matchName && !matchNo && !matchTc && !matchParent) return false
      }
      return true
    })
  }, [classStudents, statusFilter, searchQuery])

  // Compute selected student's real dynamic GPA
  const selectedStudentGpa = useMemo(() => {
    if (!selectedStudent) return 0
    if (selectedStudent.grades && selectedStudent.grades.length > 0) {
      const sum = selectedStudent.grades.reduce((acc, g) => acc + (Number(g.average) || 0), 0)
      return Number((sum / selectedStudent.grades.length).toFixed(1))
    }
    return typeof selectedStudent.gpa === 'number' ? selectedStudent.gpa : (Number(selectedStudent.gpa) || 0)
  }, [selectedStudent])

  // Compute selected student's dynamic class rank
  const selectedStudentRankText = useMemo(() => {
    if (selectedStudentGpa >= 85) return 'Sınıf Sıralaması: 1 / 30 (Onur Derecesi)'
    if (selectedStudentGpa >= 60) return 'Sınıf Sıralaması: 14 / 30 (Orta Düzey)'
    return 'Sınıf Sıralaması: 30 / 30 (Kritik Takip / Destek Gerekli)'
  }, [selectedStudentGpa])

  // Initialize edit grades state when opening modal or tab
  const handleStartEditingGrades = () => {
    if (!selectedStudent) return
    const current = (selectedStudent.grades || []).map((g) => ({ ...g }))
    setEditableGrades(current)
    setIsEditingGrades(true)
  }

  // Update a single field in editable grades
  const handleGradeFieldChange = (index: number, field: 'exam1' | 'exam2' | 'performance', val: string) => {
    setEditableGrades((prev) => {
      const next = [...prev]
      const cur = { ...next[index] }
      const num = val === '' ? 0 : Math.min(100, Math.max(0, Number(val) || 0))
      cur[field] = num
      const e1 = cur.exam1 ?? 0
      const e2 = cur.exam2 ?? e1
      const perf = cur.performance ?? e1
      cur.average = Number(((e1 * 0.4) + (e2 * 0.4) + (perf * 0.2)).toFixed(1))
      next[index] = cur
      return next
    })
  }

  // Quick fill all scores (e.g. 1 point for user testing or 100)
  const handleQuickFillAll = (score: number) => {
    setEditableGrades((prev) => {
      return prev.map((g) => {
        const e1 = score
        const e2 = score
        const perf = score
        const avg = Number(((e1 * 0.4) + (e2 * 0.4) + (perf * 0.2)).toFixed(1))
        return {
          ...g,
          exam1: e1,
          exam2: e2,
          performance: perf,
          average: avg,
        }
      })
    })
  }

  // Save edited grades
  const handleSaveEditedGrades = () => {
    if (!selectedStudent) return

    const totalAvg = editableGrades.reduce((acc, g) => acc + (Number(g.average) || 0), 0)
    const newGpa = editableGrades.length > 0 ? Number((totalAvg / editableGrades.length).toFixed(1)) : 0
    const newRank = newGpa >= 85 ? 1 : newGpa >= 60 ? 14 : 30

    const updated = students.map((st) => {
      if (st.id === selectedStudent.id) {
        return {
          ...st,
          grades: editableGrades,
          gpa: newGpa,
          classRank: newRank,
        }
      }
      return st
    })

    setStudents(updated)
    setSelectedStudent((prev) => (prev ? { ...prev, grades: editableGrades, gpa: newGpa, classRank: newRank } : null))
    setIsEditingGrades(false)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_m_students_v3', JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('oxonom_student_updated'))
      } catch (_) {}
    }

    toast.success(`📝 ${selectedStudent.name} akademik notları başarıyla kaydedildi! (Yeni Ort: ${newGpa})`)
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* ── SCREEN 1: CLASS SELECTION PROMPT (When No Class is Selected) ── */}
      {!selectedClass ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-2">
              <Users size={16} />
              <span>Öğretmen Sınıf & Öğrenci Yönetimi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Sınıfınızı Seçin
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
              Öğrenci listesini ve akademik bilgileri görüntülemek için lütfen sorumlu olduğunuz şubelerden birini seçiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableClasses.map((cls, idx) => {
              const isLead = idx === 0 || cls.code === availableClasses[0]?.code

              return (
                <div
                  key={cls.code}
                  onClick={() => setSelectedClass(cls.name)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-lg ${
                    isLead
                      ? 'bg-gradient-to-br from-indigo-50/60 to-white dark:from-[#131C31] dark:to-[#0F172A] border-indigo-200 dark:border-indigo-800/70 hover:border-indigo-400'
                      : 'bg-white dark:bg-[#121826] border-gray-200/70 dark:border-gray-800/70 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-12 h-12 rounded-2xl bg-brand-gradient text-white font-black text-base flex items-center justify-center shadow-md shadow-purple-950/20 group-hover:scale-105 transition-transform">
                        {cls.code}
                      </span>
                      {isLead && (
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                          <Sparkles size={11} />
                          <span>Rehber Şube</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                      {cls.branch}
                    </p>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                        <span>Kayıtlı Öğrenci:</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {cls.studentCount} Öğrenci
                        </span>
                      </div>
                      {cls.studentCount > 0 && (
                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                          <span>Başarı Ortalaması:</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            {cls.avgGpa}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <span>Sınıfı Aç & Öğrencileri Gör</span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ── SCREEN 2: ACTIVE CLASS SELECTED & STUDENT LIST ── */
        <div className="space-y-6">
          {/* Active Class Header Card */}
          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[11px]">
                  Seçili Şube
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 font-semibold">
                  Sınıf Rehberliği: Ebru TEKNECİ
                </span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>{selectedClass}</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  {classStudents.length} Kayıtlı Öğrenci
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedClass(null)}
                className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Sınıfı Değiştir</span>
              </button>

              <Link
                href={`/teacher/attendance?class=${encodeURIComponent(selectedClass)}`}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] text-xs font-black flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <UserCheck size={14} />
                <span>Yoklama Al</span>
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Öğrenci adı, okul no (101) veya T.C. ile ara..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-[#4B075F] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Tümü ({classStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-[#4B075F] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Aktif
              </button>
            </div>
          </div>

          {/* Student List */}
          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredStudents.map((st) => (
                <div
                  key={st.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
                      {st.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                          {st.name}
                        </h3>
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Aktif Öğrenci</span>
                        </span>
                        {(() => {
                          let stGpa = typeof st.gpa === 'number' ? st.gpa : Number(st.gpa) || 0
                          if (st.grades && st.grades.length > 0) {
                            const sum = st.grades.reduce((acc, g) => acc + (Number(g.average) || 0), 0)
                            stGpa = Number((sum / st.grades.length).toFixed(1))
                          }
                          const isHonors = stGpa >= 85
                          const isWarning = stGpa < 60
                          return (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                isHonors
                                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                                  : isWarning
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                              }`}
                            >
                              {isHonors ? "Sınıf 1.'si" : isWarning ? 'Kritik Seviye' : 'Akademik Başarı'} (Ort: {stGpa})
                            </span>
                          )
                        })()}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>Okul No: <strong className="text-gray-800 dark:text-gray-200 font-mono">{st.studentNo}</strong></span>
                        <span>T.C.: <strong className="text-gray-800 dark:text-gray-200 font-mono">{st.tcNo}</strong></span>
                        <span>Şube: <strong className="text-gray-800 dark:text-gray-200">{st.className}</strong></span>
                      </div>

                      <div className="pt-2 text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <Users size={14} className="text-indigo-500" />
                        <span>Veli: <strong>{st.parentName}</strong> ({st.parentPhone})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudent(st)
                        setActiveProfileTab('identity')
                      }}
                      className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText size={15} />
                      <span>Öğrenci Dosyasını İncele</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-12 text-center space-y-3">
              <Users size={32} className="mx-auto text-gray-300 dark:text-gray-600" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Bu şubede henüz kayıtlı öğrenci bulunmuyor
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {selectedClass} şubesine ait öğrenci kaydı bulunamadı. Lütfen başka bir şube seçiniz.
              </p>
              <button
                type="button"
                onClick={() => setSelectedClass(null)}
                className="mt-2 px-4 py-2 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold text-xs cursor-pointer shadow-xs shadow-purple-950/20 transition-colors"
              >
                Tüm Sınıflara Dön
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STUDENT PROFILE DETAIL DRAWER / MODAL ── */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0E1526] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] flex flex-col z-10 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-brand-gradient text-white font-black text-base flex items-center justify-center shadow-md shadow-purple-950/20">
                    {selectedStudent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">
                      No: {selectedStudent.studentNo} • T.C.: {selectedStudent.tcNo}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-5 pt-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveProfileTab('identity')}
                  className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeProfileTab === 'identity'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Kimlik & Genel
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProfileTab('academic')}
                  className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeProfileTab === 'academic'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Akademik Notlar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProfileTab('attendance')}
                  className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeProfileTab === 'attendance'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Devam & Yoklama
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProfileTab('parent')}
                  className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeProfileTab === 'parent'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Veli & Rehberlik
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeProfileTab === 'identity' && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                      <div>
                        <div className="text-gray-400 text-[11px]">Doğum Tarihi:</div>
                        <div className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedStudent.birthDate}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-[11px]">Kan Grubu:</div>
                        <div className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedStudent.bloodType}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-[11px]">Kayıt Tarihi:</div>
                        <div className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedStudent.enrollmentDate}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-[11px]">Cinsiyet:</div>
                        <div className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedStudent.gender}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 space-y-2">
                      <div className="text-gray-400 text-[11px]">İkametgâh Adresi:</div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{selectedStudent.address}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 space-y-1">
                      <div className="text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">Öğrenci Disiplin & Sicil Durumu:</div>
                      <div className="text-emerald-900 dark:text-emerald-200 font-semibold">{selectedStudent.disciplineStatus}</div>
                    </div>
                  </div>
                )}

                {activeProfileTab === 'academic' && (
                  <div className="space-y-4 text-xs">
                    {!isEditingGrades ? (
                      <>
                        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="font-black text-sm text-indigo-950 dark:text-indigo-200">
                              Genel Akademik Not Ortalaması
                            </div>
                            <div className="text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold mt-0.5">
                              {selectedStudentRankText}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 self-end sm:self-auto">
                            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                              {selectedStudentGpa}
                            </div>
                            <button
                              type="button"
                              onClick={handleStartEditingGrades}
                              className="px-3 py-1.5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                              <Edit3 size={13} />
                              <span>Notları Düzenle</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {(selectedStudent.grades || []).map((gr, idx) => {
                            const avgNum = Number(gr.average) || 0
                            const isHigh = avgNum >= 85
                            const isMid = avgNum >= 50 && avgNum < 85
                            const isLow = avgNum < 50

                            return (
                              <div
                                key={idx}
                                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
                                  isLow
                                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/50'
                                    : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200/60 dark:border-gray-800'
                                }`}
                              >
                                <div>
                                  <div className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span>{gr.courseName}</span>
                                    {isLow && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500 text-white font-bold">
                                        Kritik Seviye
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                                    1. Sınav: <strong>{gr.exam1}</strong> • 2. Sınav: <strong>{gr.exam2}</strong> • Performans: <strong>{gr.performance}</strong>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span
                                    className={`font-black text-sm font-mono ${
                                      isHigh
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : isMid
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-rose-600 dark:text-rose-400'
                                    }`}
                                  >
                                    {gr.average}
                                  </span>
                                  <span className="text-[10px] text-gray-400 block">Ortalama</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    ) : (
                      /* ── INLINE GRADE EDITING MODE ── */
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="font-black text-sm text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                              <Edit3 size={15} />
                              <span>Akademik Notları Düzenle</span>
                            </div>
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                              Ders puanlarını değiştirin. Ortalamalar MEB formülüne (S1*0.4 + S2*0.4 + P*0.2) göre canlı hesaplanır.
                            </p>
                          </div>

                          {/* Quick test buttons */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-gray-500">Hızlı Doldur:</span>
                            <button
                              type="button"
                              onClick={() => handleQuickFillAll(1)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] cursor-pointer"
                              title="Tüm notları 1 yaparak test et"
                            >
                              Tümünü 1 Yap
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickFillAll(85)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-[10px] cursor-pointer"
                            >
                              Tümünü 85 Yap
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickFillAll(100)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] cursor-pointer"
                            >
                              Tümünü 100 Yap
                            </button>
                          </div>
                        </div>

                        {/* Editable courses grid */}
                        <div className="space-y-3">
                          {editableGrades.map((gr, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200/70 dark:border-gray-700 space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-gray-900 dark:text-white">
                                  {gr.courseName}
                                </span>
                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">
                                  Ders Ortalaması: {gr.average}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-[10px] font-bold text-gray-400 block mb-1">
                                    1. Sınav (%40)
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={gr.exam1}
                                    onChange={(e) => handleGradeFieldChange(idx, 'exam1', e.target.value)}
                                    className="w-full h-8 px-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono font-bold text-xs text-center focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-gray-400 block mb-1">
                                    2. Sınav (%40)
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={gr.exam2}
                                    onChange={(e) => handleGradeFieldChange(idx, 'exam2', e.target.value)}
                                    className="w-full h-8 px-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono font-bold text-xs text-center focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-gray-400 block mb-1">
                                    Performans (%20)
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={gr.performance}
                                    onChange={(e) => handleGradeFieldChange(idx, 'performance', e.target.value)}
                                    className="w-full h-8 px-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono font-bold text-xs text-center focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Save / Cancel buttons */}
                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingGrades(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          >
                            İptal Et
                          </button>

                          <button
                            type="button"
                            onClick={handleSaveEditedGrades}
                            className="px-5 py-2.5 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-purple-950/20 cursor-pointer"
                          >
                            <Save size={15} />
                            <span>Notları Kaydet & Ortalamayı Güncelle</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeProfileTab === 'attendance' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                      <div>
                        <div className="text-emerald-800 dark:text-emerald-300 font-bold">Ders Devam Oranı</div>
                        <div className="text-emerald-600 dark:text-emerald-400 text-[11px]">Özürsüz Devamsızlık: 0 Gün</div>
                      </div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">%100</div>
                    </div>
                    <p className="text-gray-400 text-[11px]">
                      Öğrenci 2026-2027 Güz Döneminde tüm derslere eksiksiz olarak katılmıştır.
                    </p>
                  </div>
                )}

                {activeProfileTab === 'parent' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 space-y-2">
                      <div className="font-bold text-gray-900 dark:text-white">1. Veli (Anne)</div>
                      <div className="text-gray-600 dark:text-gray-300">{selectedStudent.parentName} ({selectedStudent.parentOccupation})</div>
                      <div className="text-indigo-600 dark:text-indigo-400 font-mono">{selectedStudent.parentPhone}</div>
                    </div>

                    {selectedStudent.secondParentName && (
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 space-y-2">
                        <div className="font-bold text-gray-900 dark:text-white">2. Veli (Baba)</div>
                        <div className="text-gray-600 dark:text-gray-300">{selectedStudent.secondParentName}</div>
                        <div className="text-indigo-600 dark:text-indigo-400 font-mono">{selectedStudent.secondParentPhone}</div>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 space-y-2">
                      <div className="font-bold text-purple-900 dark:text-purple-200">Rehberlik Pedagojik Gözlem Kaydı:</div>
                      {selectedStudent.guidanceNotes.map((gn) => (
                        <div key={gn.id} className="text-[11px] text-purple-950 dark:text-purple-300 pt-1 border-t border-purple-200/40">
                          <span className="font-bold">{gn.author} ({gn.date}):</span> {gn.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
