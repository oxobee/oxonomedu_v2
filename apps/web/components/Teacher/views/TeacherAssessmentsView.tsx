'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award,
  Users,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  Save,
  BookOpen,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Plus,
  Trash2,
  Clock,
  MapPin,
  X,
  UserCheck,
  FileCheck,
  AlertCircle,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ALL_INITIAL_STUDENTS, MStudentItem } from '@components/Mobile/MStudentClient'
import {
  SchoolExamItem,
  CANONICAL_SCHOOL_EXAMS,
  getStoredSchoolExams,
  saveStoredSchoolExams,
  pushExamToServer,
  deleteExamFromServer,
  fetchExamsFromServer,
} from '@/lib/teacher/teacherAgendaStorage'

const COURSES = [
  'Türk Dili ve Edebiyatı',
  'Matematik',
  'Bilişim & Kodlama',
  'Yabancı Dil (İngilizce)',
  'Fizik & Fen Bilimleri',
  'Tarih',
  'Coğrafya',
  'Felsefe',
  'Tüm Dersler',
]

import { ALL_CLASSROOMS, normalizeClassCode } from '@services/demo/schoolDirectory'

const EXAM_TYPE_OPTIONS = [
  { id: 'exam', label: 'Yazılı Sınav', badgeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30', dot: 'bg-indigo-500' },
  { id: 'oral', label: 'Sözlü Sınav', badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30', dot: 'bg-amber-500' },
  { id: 'quiz', label: 'Quiz', badgeBg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30', dot: 'bg-cyan-500' },
  { id: 'performance', label: 'Performans / Proje', badgeBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30', dot: 'bg-purple-500' },
  { id: 'mock', label: 'Deneme Sınavı', badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30', dot: 'bg-rose-500' },
]

export default function TeacherAssessmentsView() {
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const qClass = urlParams.get('class')
        if (qClass) {
          const match = ALL_CLASSROOMS.find((c) => normalizeClassCode(c.code) === normalizeClassCode(qClass))
          if (match) return match.name
        }
        const saved = localStorage.getItem('oxonom_selected_class')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.name) return parsed.name
          if (parsed.code) {
            const match = ALL_CLASSROOMS.find((c) => normalizeClassCode(c.code) === normalizeClassCode(parsed.code))
            if (match) return match.name
          }
        }
      } catch (_) {}
    }
    return '9-A Şubesi'
  })
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleClassChanged = (e: any) => {
      if (e?.detail?.name) {
        setSelectedClass(e.detail.name)
      } else if (e?.detail?.code) {
        const found = ALL_CLASSROOMS.find((c) => normalizeClassCode(c.code) === normalizeClassCode(e.detail.code))
        if (found) setSelectedClass(found.name)
      }
    }
    window.addEventListener('oxonom_class_changed', handleClassChanged)
    return () => window.removeEventListener('oxonom_class_changed', handleClassChanged)
  }, [])

  const handleSelectClass = (name: string) => {
    setSelectedClass(name)
    if (typeof window !== 'undefined' && name !== 'all') {
      try {
        const found = ALL_CLASSROOMS.find((c) => c.name === name || c.code === name)
        if (found) {
          localStorage.setItem('oxonom_selected_class', JSON.stringify(found))
          window.dispatchEvent(new CustomEvent('oxonom_class_changed', { detail: found }))
        }
      } catch (_) {}
    }
  }

  // Exams State
  const [exams, setExams] = useState<SchoolExamItem[]>([])

  // Students State
  const [students, setStudents] = useState<MStudentItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_m_students_v3')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (_) {}
    }
    return ALL_INITIAL_STUDENTS
  })

  // Modals State
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false)
  const [gradingExam, setGradingExam] = useState<SchoolExamItem | null>(null)
  const [gradingScores, setGradingScores] = useState<Record<string, number | string>>({})

  // Form State for New Exam
  const [newTitle, setNewTitle] = useState('')
  const [newCourse, setNewCourse] = useState('Türk Dili ve Edebiyatı')
  const [newClass, setNewClass] = useState('9-A Şubesi')
  const [newType, setNewType] = useState<'exam' | 'oral' | 'quiz' | 'performance' | 'mock'>('exam')
  const [newDate, setNewDate] = useState('2026-10-30')
  const [newTime, setNewTime] = useState('10:20 - 11:00')
  const [newDuration, setNewDuration] = useState(40)
  const [newLocation, setNewLocation] = useState('Derslik 101')
  const [newScope, setNewScope] = useState('')

  // Active Teacher details
  const [teacherName, setTeacherName] = useState('Ebru TEKNECİ')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_teacher_profile')
        if (saved) {
          const parsed = JSON.parse(saved)
          setTeacherName(`${parsed.firstName || parsed.name || 'Ebru'} ${parsed.lastName || 'TEKNECİ'}`.trim())
        }
      } catch (_) {}
    }
  }, [])

  // Sync exams
  const syncExams = () => {
    const list = getStoredSchoolExams()
    setExams(list)
  }

  useEffect(() => {
    syncExams()
    fetchExamsFromServer().then((srvExams: SchoolExamItem[]) => {
      if (Array.isArray(srvExams)) {
        setExams(srvExams)
      }
    })
    window.addEventListener('oxonom_exam_calendar_updated', syncExams)
    window.addEventListener('oxonom_student_updated', () => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('oxonom_m_students_v3')
          if (saved) setStudents(JSON.parse(saved))
        } catch (_) {}
      }
    })
    window.addEventListener('storage', syncExams)
    return () => {
      window.removeEventListener('oxonom_exam_calendar_updated', syncExams)
      window.removeEventListener('storage', syncExams)
    }
  }, [])

  // Filter students for selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass === 'all') return true
      if (selectedClass === '9-A Şubesi' || selectedClass === '9-A') {
        return s.className === '9-A Şubesi' || s.className.startsWith('9-A')
      }
      return s.className === selectedClass
    })
  }, [students, selectedClass])

  // Filter exams
  const filteredExams = useMemo(() => {
    return exams.filter((ex) => {
      // Class filter
      if (selectedClass !== 'all') {
        const exClass = ex.className || '9-A'
        const matchClass =
          exClass === 'Tüm Sınıflar' ||
          exClass === selectedClass ||
          selectedClass.startsWith(exClass) ||
          exClass.startsWith(selectedClass.replace(' Şubesi', ''))
        if (!matchClass) return false
      }

      // Type filter
      if (filterType !== 'all') {
        const t = (ex.type || '').toLowerCase()
        const lbl = (ex.examTypeLabel || '').toLowerCase()
        if (filterType === 'oral' && t !== 'oral' && !lbl.includes('sözlü')) return false
        if (filterType === 'quiz' && t !== 'quiz' && !lbl.includes('quiz')) return false
        if (filterType === 'performance' && t !== 'performance' && !lbl.includes('performans')) return false
        if (filterType === 'mock' && t !== 'mock' && !lbl.includes('deneme')) return false
        if (filterType === 'exam' && t !== 'exam' && t !== 'common' && !lbl.includes('yazılı')) return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          ex.title.toLowerCase().includes(q) ||
          ex.courseName.toLowerCase().includes(q) ||
          (ex.scope && ex.scope.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [exams, selectedClass, filterType, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const total = exams.length
    const completed = exams.filter((e) => e.status === 'completed' || (e.scores && Object.keys(e.scores).length > 0)).length
    const upcoming = total - completed
    return { total, completed, upcoming }
  }, [exams])

  // Helper for type details
  const getTypeMeta = (exam: SchoolExamItem) => {
    const t = (exam.type || '').toLowerCase()
    const lbl = (exam.examTypeLabel || '').toLowerCase()
    if (t === 'oral' || lbl.includes('sözlü')) {
      return {
        label: 'Sözlü Sınav',
        badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
        dot: 'bg-amber-500',
      }
    }
    if (t === 'quiz' || lbl.includes('quiz')) {
      return {
        label: 'Quiz',
        badgeClass: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
        dot: 'bg-cyan-500',
      }
    }
    if (t === 'performance' || lbl.includes('performans')) {
      return {
        label: 'Performans / Proje',
        badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
        dot: 'bg-purple-500',
      }
    }
    if (t === 'mock' || lbl.includes('deneme')) {
      return {
        label: 'Deneme Sınavı',
        badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
        dot: 'bg-rose-500',
      }
    }
    return {
      label: 'Yazılı Sınav',
      badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      dot: 'bg-indigo-500',
    }
  }

  // Handle Add New Exam
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      toast.error('Lütfen sınav başlığı giriniz.')
      return
    }

    const typeConfig = EXAM_TYPE_OPTIONS.find((o) => o.id === newType)
    const typeLabel = typeConfig ? typeConfig.label : 'Yazılı Sınav'

    const newExam: SchoolExamItem = {
      id: `exam-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      title: newTitle.trim(),
      courseName: newCourse,
      className: newClass.replace(' Şubesi', ''),
      type: newType,
      examTypeLabel: typeLabel,
      date: newDate,
      time: newTime,
      durationMinutes: Number(newDuration) || 40,
      location: newLocation || 'Derslik 101',
      teacherName: teacherName,
      scope: newScope.trim() || undefined,
      isPublished: true,
      status: 'upcoming',
      scores: {},
      createdAt: new Date().toISOString(),
    }

    const updated = [newExam, ...exams]
    saveStoredSchoolExams(updated)
    setExams(updated)
    await pushExamToServer(newExam)

    toast.success(`🎉 ${typeLabel} ("${newTitle}") başarıyla oluşturuldu ve öğrenci panellerine yansıtıldı!`)
    setIsNewExamModalOpen(false)
    setNewTitle('')
    setNewScope('')
  }

  // Handle Delete Exam
  const handleDeleteExam = async (id: string, title: string) => {
    if (!confirm(`"${title}" sınavını silmek istediğinize emin misiniz?`)) return
    const updated = exams.filter((e) => e.id !== id)
    saveStoredSchoolExams(updated)
    setExams(updated)
    await deleteExamFromServer(id)
    toast.success(`"${title}" sınavı veritabanından kalıcı olarak silindi.`)
  }

  // Eligible students for currently grading exam
  const gradingEligibleStudents = useMemo(() => {
    if (!gradingExam) return []
    return students.filter((s) => {
      if (!gradingExam.className || gradingExam.className === 'all') return true
      const target = gradingExam.className.replace(' Şubesi', '')
      return s.className.includes(target)
    })
  }, [students, gradingExam])

  // Open Grading Modal
  const handleOpenGrading = (exam: SchoolExamItem) => {
    setGradingExam(exam)
    const initialScores: Record<string, number | string> = {}
    
    const targetStudents = students.filter((s) => {
      if (!exam.className || exam.className === 'all') return true
      const target = exam.className.replace(' Şubesi', '')
      return s.className.includes(target)
    })

    targetStudents.forEach((st) => {
      // Look in exam.scores first
      if (exam.scores && exam.scores[st.id] !== undefined) {
        initialScores[st.id] = exam.scores[st.id]
      } else {
        // Fallback to student grades for this course
        const grade = st.grades?.find((g) => g.courseName === exam.courseName)
        if (grade) {
          if (exam.type === 'oral' || (exam.examTypeLabel || '').includes('sözlü') || exam.type === 'performance') {
            initialScores[st.id] = grade.performance !== undefined && grade.performance !== null ? grade.performance : ''
          } else if (exam.title.includes('2.') || (exam.period && exam.period > 2)) {
            initialScores[st.id] = grade.exam2 !== undefined && grade.exam2 !== null ? grade.exam2 : ''
          } else {
            initialScores[st.id] = grade.exam1 !== undefined && grade.exam1 !== null ? grade.exam1 : ''
          }
        } else {
          initialScores[st.id] = ''
        }
      }
    })
    setGradingScores(initialScores)
  }

  // Save Grades
  const handleSaveGrading = () => {
    if (!gradingExam) return

    const numScores: Record<string, number> = {}
    Object.entries(gradingScores).forEach(([stId, val]) => {
      if (val !== '' && !isNaN(Number(val))) {
        numScores[stId] = Number(val)
      }
    })

    // Update exam object
    let updatedExamToPush: SchoolExamItem | null = null
    const updatedExams = exams.map((ex) => {
      if (ex.id === gradingExam.id) {
        updatedExamToPush = {
          ...ex,
          scores: numScores,
          status: 'completed' as const,
        }
        return updatedExamToPush
      }
      return ex
    })

    // Also update student records in oxonom_m_students_v3
    const updatedStudents = students.map((st) => {
      const studentScore = numScores[st.id]
      if (studentScore === undefined) return st

      const existingGrades = [...(st.grades || [])]
      const courseIndex = existingGrades.findIndex((g) => g.courseName === gradingExam.courseName)

      if (courseIndex >= 0) {
        const cur = { ...existingGrades[courseIndex] }
        if (gradingExam.type === 'oral' || (gradingExam.examTypeLabel || '').includes('sözlü')) {
          cur.performance = studentScore
        } else if (gradingExam.type === 'performance') {
          cur.performance = studentScore
        } else if (gradingExam.title.includes('2.')) {
          cur.exam2 = studentScore
        } else {
          cur.exam1 = studentScore
        }

        const e1 = cur.exam1 !== undefined && cur.exam1 !== null ? Number(cur.exam1) : studentScore
        const e2 = cur.exam2 !== undefined && cur.exam2 !== null ? Number(cur.exam2) : e1
        const perf = cur.performance !== undefined && cur.performance !== null ? Number(cur.performance) : e1
        cur.average = Number(((e1 * 0.4) + (e2 * 0.4) + (perf * 0.2)).toFixed(1))
        existingGrades[courseIndex] = cur
      } else {
        existingGrades.push({
          courseName: gradingExam.courseName,
          teacherName: teacherName,
          exam1: studentScore,
          exam2: studentScore,
          performance: studentScore,
          average: studentScore,
        })
      }

      // Recalculate GPA
      const totalAvg = existingGrades.reduce((sum, g) => sum + (Number(g.average) || 0), 0)
      const newGpa = Number((totalAvg / (existingGrades.length || 1)).toFixed(1))
      const newRank = newGpa >= 85 ? 1 : newGpa >= 60 ? 14 : 30

      return {
        ...st,
        grades: existingGrades,
        gpa: newGpa,
        classRank: newRank,
      }
    })

    // Persist
    saveStoredSchoolExams(updatedExams)
    setExams(updatedExams)
    setStudents(updatedStudents)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_m_students_v3', JSON.stringify(updatedStudents))

        // Also update student profile if matching
        const rawProfile = localStorage.getItem('oxonom_student_profile')
        if (rawProfile) {
          const prof = JSON.parse(rawProfile)
          const matchedSt = updatedStudents.find((s) => s.id === prof.id || s.studentNo === prof.studentNo)
          if (matchedSt) {
            prof.gpa = matchedSt.gpa
            prof.classRank = matchedSt.classRank
            prof.grades = matchedSt.grades
            localStorage.setItem('oxonom_student_profile', JSON.stringify(prof))
          }
        }

        // Also update principal students list
        const rawAdmin = localStorage.getItem('oxonom_admin_students_list_30')
        if (rawAdmin) {
          const aList = JSON.parse(rawAdmin)
          if (Array.isArray(aList)) {
            const updatedAList = aList.map((a: any) => {
              const matchedSt = updatedStudents.find((s) => s.id === a.id || s.studentNo === a.studentNo)
              if (matchedSt) {
                return {
                  ...a,
                  gpa: matchedSt.gpa,
                  classRank: matchedSt.classRank,
                  grades: matchedSt.grades,
                }
              }
              return a
            })
            localStorage.setItem('oxonom_admin_students_list_30', JSON.stringify(updatedAList))
          }
        }

        window.dispatchEvent(new CustomEvent('oxonom_student_updated'))
        window.dispatchEvent(new CustomEvent('oxonom_admin_students_updated'))
      } catch (_) {}
    }

    // Persist updated exam with scores to real database
    if (updatedExamToPush) {
      pushExamToServer(updatedExamToPush).catch(console.error)
    }

    toast.success(`📝 ${gradingExam.title} notları kaydedildi ve veritabanına işlendi!`)
    setGradingExam(null)
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <Award size={15} />
            <span>Ölçme, Değerlendirme & Sınav Yönetimi</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Sınavlar ve Notlar
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Sınav türlerini (yazılı, sözlü, quiz vb.) belirleyin, sınav oluşturun ve öğrenci notlarını girin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewExamModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={16} />
          <span>Yeni Sınav Ekle</span>
        </button>
      </div>

      {/* ── QUICK STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-gray-400 uppercase">Toplam Sınav & Değerlendirme</div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.total} Sınav</div>
          <div className="text-[11px] text-gray-500">Tüm dönem boyunca</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-gray-400 uppercase">Puanlanmış / Tamamlanan</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.completed} Sınav</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Notları girildi & onaylandı</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-gray-400 uppercase">Yaklaşan / Not Bekleyen</div>
          <div className="text-2xl font-black text-amber-500">{stats.upcoming} Sınav</div>
          <div className="text-[11px] text-amber-600 font-semibold">Gelecek sınav takvimi</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-gray-400 uppercase">Kayıtlı Öğrenci Sayısı</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{classStudents.length} Öğrenci</div>
          <div className="text-[11px] text-gray-500">{selectedClass} bünyesinde</div>
        </div>
      </div>

      {/* ── FILTER & CONTROLS BAR ── */}
      <div className="p-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Sınıf Seçimi */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0">Şube:</span>
            <select
              value={selectedClass}
              onChange={(e) => handleSelectClass(e.target.value)}
              className="h-10 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#8D49A6] cursor-pointer"
            >
              <option value="all">Tüm Şubeler</option>
              {ALL_CLASSROOMS.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  {cls.name} ({cls.grade_level})
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sınav adı, ders veya konu ara..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar border-t border-gray-100 dark:border-gray-800/80">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Tüm Sınavlar ({exams.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('exam')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'exam'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Yazılı Sınavlar
          </button>
          <button
            type="button"
            onClick={() => setFilterType('oral')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'oral'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Sözlü Sınavlar
          </button>
          <button
            type="button"
            onClick={() => setFilterType('quiz')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'quiz'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Quizler
          </button>
          <button
            type="button"
            onClick={() => setFilterType('performance')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'performance'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Performans & Proje
          </button>
          <button
            type="button"
            onClick={() => setFilterType('mock')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'mock'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Deneme Sınavları
          </button>
        </div>
      </div>

      {/* ── EXAMS CARDS GRID (MEVCUT SINAVLAR KART ŞEKLİNDE) ── */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((exam) => {
            const meta = getTypeMeta(exam)
            const hasScores = exam.scores && Object.keys(exam.scores).length > 0
            const scoredCount = hasScores ? Object.keys(exam.scores!).length : 0

            return (
              <div
                key={exam.id}
                className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Exam Type Badge & Class */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${meta.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      <span>{meta.label}</span>
                    </span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {exam.className} Şubesi
                    </span>
                  </div>

                  {/* Course & Title */}
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                      {exam.courseName}
                    </div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white mt-0.5 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {exam.title}
                    </h3>
                  </div>

                  {/* Metadata Box */}
                  <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <Calendar size={13} />
                        Tarih:
                      </span>
                      <span className="font-extrabold text-gray-900 dark:text-white font-mono">
                        {exam.date}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <Clock size={13} />
                        Saat:
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white font-mono">
                        {exam.time} ({exam.durationMinutes} Dk)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <MapPin size={13} />
                        Yer:
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                        {exam.location}
                      </span>
                    </div>
                  </div>

                  {/* Scope / Description */}
                  {exam.scope && (
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 line-clamp-2">
                      <strong className="text-gray-700 dark:text-gray-300 font-bold">Kapsam: </strong>
                      {exam.scope}
                    </div>
                  )}

                  {/* Grading Status Badge */}
                  <div className="flex items-center justify-between pt-1">
                    {hasScores ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-xl">
                        <CheckCircle2 size={13} />
                        <span>Puanlandı ({scoredCount} Öğrenci)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-xl">
                        <Clock size={13} />
                        <span>Not Girişi Bekliyor</span>
                      </span>
                    )}

                    <span className="text-[11px] font-bold text-gray-400">
                      {exam.teacherName}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenGrading(exam)}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Award size={14} />
                    <span>{hasScores ? 'Notları Düzenle' : 'Notları Gir'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteExam(exam.id, exam.title)}
                    title="Sınavı Sil"
                    className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 text-xs text-gray-400 space-y-2">
          <AlertCircle size={30} className="mx-auto text-gray-300 dark:text-gray-600" />
          <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">Sınav Kaydı Bulunamadı</h4>
          <p>Seçili filtre veya şubeye ait henüz sınav oluşturulmamış.</p>
        </div>
      )}

      {/* ── MODAL 1: YENİ SINAV EKLEME MODALI ── */}
      <AnimatePresence>
        {isNewExamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewExamModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1526] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[92vh] flex flex-col z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    Yeni Sınav & Değerlendirme Oluştur
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Sınav türünü seçip tarih ve konu kapsamını belirleyin
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewExamModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateExam} className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* 1. Sınav Türü Seçimi (ZORUNLU) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Sınav Türü (Zorunlu):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EXAM_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setNewType(opt.id as any)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer border ${
                          newType === opt.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Sınav Başlığı */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Sınav Başlığı:
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Örn: 1. Dönem 1. Yazılı Sınavı veya Şiir Tahlili Quizi"
                    required
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 3. Ders ve Sınıf */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Ders:
                    </label>
                    <select
                      value={newCourse}
                      onChange={(e) => setNewCourse(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {COURSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Sınıf / Şube:
                    </label>
                    <select
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#8D49A6] cursor-pointer"
                    >
                      {ALL_CLASSROOMS.map((cls) => (
                        <option key={cls.id} value={cls.name}>
                          {cls.name}
                        </option>
                      ))}
                      <option value="Tüm Sınıflar">Tüm Sınıflar (Ortak)</option>
                    </select>
                  </div>
                </div>

                {/* 4. Tarih ve Saat */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Sınav Tarihi:
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Sınav Saati:
                    </label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="Örn: 10:20 - 11:00"
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* 5. Süre ve Salon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Süre (Dakika):
                    </label>
                    <input
                      type="number"
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Sınav Yeri / Salon:
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Örn: Derslik 101"
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* 6. Konu Kapsamı */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Konu Kapsamı & Kazanımlar:
                  </label>
                  <textarea
                    rows={3}
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    placeholder="Sınavda çıkacak üniteler, kazanımlar veya açıklama..."
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-normal text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsNewExamModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    Sınavı Kaydet & Yayınla
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: NOT GİRİŞİ & PUANLAMA MODALI ── */}
      <AnimatePresence>
        {gradingExam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGradingExam(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0E1526] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] flex flex-col z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {gradingExam.examTypeLabel || 'Sınav'}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      {gradingExam.courseName}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white mt-1">
                    {gradingExam.title} — Not Girişi
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {gradingExam.className} Şubesi öğrencilerinin notlarını girip karneye işleyin
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setGradingExam(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Students List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {gradingEligibleStudents.map((st, idx) => {
                  const currentScore = gradingScores[st.id] ?? ''
                  const stGpa = st.grades && st.grades.length > 0
                    ? Number((st.grades.reduce((sum, g) => sum + (Number(g.average) || 0), 0) / st.grades.length).toFixed(1))
                    : (st.gpa ?? 0)

                  return (
                    <div
                      key={st.id}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {st.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <span>{st.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">No: {st.studentNo}</span>
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            Genel Ort: {stGpa} • %{st.attendanceRate} Devam
                          </div>
                        </div>
                      </div>

                      {/* Score Input & Quick Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <div className="flex items-center gap-1">
                          {[100, 85, 70, 50, 1].map((pts) => (
                            <button
                              key={pts}
                              type="button"
                              onClick={() => setGradingScores((prev) => ({ ...prev, [st.id]: pts }))}
                              className={`px-2 py-1 rounded-lg text-[10px] font-black border transition-colors cursor-pointer ${
                                pts === 1
                                  ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-500 hover:text-white dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600'
                              }`}
                            >
                              {pts}
                            </button>
                          ))}
                        </div>

                        <div className="relative w-16">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={currentScore}
                            onChange={(e) => {
                              const val = e.target.value
                              if (val === '') {
                                setGradingScores((prev) => ({ ...prev, [st.id]: '' }))
                                return
                              }
                              const num = Number(val)
                              if (!isNaN(num) && num >= 0 && num <= 100) {
                                setGradingScores((prev) => ({ ...prev, [st.id]: num }))
                              }
                            }}
                            className="w-full h-9 px-2 text-center rounded-xl bg-white dark:bg-gray-900 font-black text-xs text-indigo-600 dark:text-indigo-400 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                            placeholder="0-100"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-bold">
                  {gradingEligibleStudents.length} Öğrenci Notlandırılıyor
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGradingExam(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGrading}
                    className="px-5 py-2.5 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-950/20 cursor-pointer"
                  >
                    <Save size={15} className="text-white" />
                    <span>Notları Kaydet & Dosyaya İşle</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
