'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Users,
  CheckSquare,
  FileCheck,
  TrendingUp,
  Award,
  ChevronDown,
  BookOpen,
  Filter,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ALL_INITIAL_STUDENTS, type MStudentItem } from '@components/Mobile/MStudentClient'
import {
  ALL_CLASSROOMS,
  normalizeClassCode,
  getSingleSourceOfTruthStudents,
  generateClassStudents,
} from '@services/demo/schoolDirectory'

export default function TeacherReportsView() {
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const qClass = urlParams.get('class')
        if (qClass) return normalizeClassCode(qClass)
        const saved = localStorage.getItem('oxonom_selected_class')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.code) return normalizeClassCode(parsed.code)
        }
      } catch (_) {}
    }
    return ALL_CLASSROOMS[0]?.code || '1/A'
  })
  const [categoryTab, setCategoryTab] = useState<'academic' | 'attendance' | 'homework'>('academic')
  const [searchStudent, setSearchStudent] = useState<string>('')

  useEffect(() => {
    const handleClassChanged = (e: any) => {
      if (e?.detail?.code) {
        setSelectedClassId(normalizeClassCode(e.detail.code))
      }
    }
    window.addEventListener('oxonom_class_changed', handleClassChanged)
    return () => window.removeEventListener('oxonom_class_changed', handleClassChanged)
  }, [])

  const handleSelectClass = (clsCode: string) => {
    const norm = normalizeClassCode(clsCode)
    setSelectedClassId(norm)
    if (typeof window !== 'undefined') {
      try {
        const found = ALL_CLASSROOMS.find((c) => normalizeClassCode(c.code) === norm)
        if (found) {
          localStorage.setItem('oxonom_selected_class', JSON.stringify(found))
          window.dispatchEvent(new CustomEvent('oxonom_class_changed', { detail: found }))
        }
      } catch (_) {}
    }
  }

  const [students, setStudents] = useState<MStudentItem[]>(() => {
    return getSingleSourceOfTruthStudents(30)
  })

  useEffect(() => {
    const handleSync = () => {
      setStudents(getSingleSourceOfTruthStudents(30))
    }
    window.addEventListener('oxonom_student_updated', handleSync)
    window.addEventListener('oxonom_admin_students_updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('oxonom_student_updated', handleSync)
      window.removeEventListener('oxonom_admin_students_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const classStudents = useMemo(() => {
    const list = generateClassStudents(selectedClassId)
    if (list && list.length > 0) return list
    const norm = normalizeClassCode(selectedClassId)
    return students.filter((s) => {
      const sNorm = normalizeClassCode(s.className || '')
      return sNorm === norm || sNorm.replace('-', '/') === norm.replace('-', '/')
    })
  }, [students, selectedClassId])

  const targetStudent = classStudents[0] || students[0]

  // Overall class average GPA computed across all students in the class
  const classAvgGpa = useMemo(() => {
    if (!classStudents || classStudents.length === 0) return 85
    const total = classStudents.reduce((acc, st) => {
      const stAvg =
        st.grades && st.grades.length > 0
          ? st.grades.reduce((sum: number, g: any) => sum + Number(g.average || 0), 0) / st.grades.length
          : Number(st.gpa) || 85
      return acc + stAvg
    }, 0)
    return Number((total / classStudents.length).toFixed(1))
  }, [classStudents])

  // Overall class attendance rate
  const classAvgAttendance = useMemo(() => {
    if (!classStudents || classStudents.length === 0) return 96
    const total = classStudents.reduce((acc, st) => acc + (st.attendanceRate || 95), 0)
    return Math.round(total / classStudents.length)
  }, [classStudents])

  const studentGpa = classAvgGpa

  const CLASSES = useMemo(() => {
    return ALL_CLASSROOMS.map((c) => {
      const isSelected = normalizeClassCode(c.code) === normalizeClassCode(selectedClassId)
      return {
        id: c.code,
        name: c.name,
        code: c.code,
        grade_level: c.grade_level,
        course: c.org_id === 10 ? 'Sınıf Öğretmenliği' : 'Türk Dili ve Edebiyatı',
        studentCount: isSelected ? classStudents.length : c.student_count || 24,
        avgGrade: isSelected ? classAvgGpa : Math.floor(78 + (c.id % 16)),
        attendanceRate: isSelected ? classAvgAttendance : 96,
        homeworkRate: 98,
      }
    })
  }, [classAvgGpa, classAvgAttendance, classStudents.length, selectedClassId])

  const activeClass = CLASSES.find((c) => normalizeClassCode(c.code) === normalizeClassCode(selectedClassId)) || CLASSES[0]

  // Category Based Success Analysis calculated dynamically from all student grades & homework in class
  const academicCategories = useMemo(() => {
    if (!classStudents || classStudents.length === 0) {
      return [
        { title: 'Türkçe & Okuduğunu Anlama', avg: 88, icon: BookOpen, color: 'indigo' },
        { title: 'Matematik & Problem Çözme', avg: 84, icon: Award, color: 'emerald' },
        { title: 'Hayat Bilgisi & Sosyal Gelişim', avg: 91, icon: TrendingUp, color: 'sky' },
        { title: 'Sözlü, Performans & Görevler', avg: 89, icon: Sparkles, color: 'purple' },
      ]
    }

    const calcCourseAvg = (keyword: string, fallback: number) => {
      let sum = 0
      let count = 0
      classStudents.forEach((st) => {
        const matched = st.grades?.find((g: any) => g.courseName?.toLowerCase().includes(keyword.toLowerCase()))
        if (matched && matched.average) {
          sum += Number(matched.average)
          count++
        }
      })
      return count > 0 ? Number((sum / count).toFixed(1)) : fallback
    }

    return [
      { title: 'Türkçe & Okuduğunu Anlama', avg: calcCourseAvg('türkçe', 88), icon: BookOpen, color: 'indigo' },
      { title: 'Matematik & Problem Çözme', avg: calcCourseAvg('matematik', 84), icon: Award, color: 'emerald' },
      { title: 'Hayat Bilgisi & Sosyal Gelişim', avg: calcCourseAvg('hayat', 92), icon: TrendingUp, color: 'sky' },
      { title: 'Sözlü, Performans & Görevler', avg: Math.min(100, Math.round(classAvgGpa * 1.04)), icon: Sparkles, color: 'purple' },
    ]
  }, [classStudents, classAvgGpa])

  // Grade score distribution (Percentage of class calculated across all students)
  const gradeDistribution = useMemo(() => {
    if (!classStudents || classStudents.length === 0) return []
    const total = classStudents.length

    let cPekiyi = 0
    let cIyi = 0
    let cOrta = 0
    let cGelistirilmeli = 0

    classStudents.forEach((st) => {
      const g =
        st.grades && st.grades.length > 0
          ? st.grades.reduce((sum: number, gr: any) => sum + Number(gr.average || 0), 0) / st.grades.length
          : Number(st.gpa) || 85
      if (g >= 85) cPekiyi++
      else if (g >= 70) cIyi++
      else if (g >= 55) cOrta++
      else cGelistirilmeli++
    })

    return [
      { range: '85 - 100 (Pekiyi)', percent: Math.round((cPekiyi / total) * 100), count: cPekiyi, color: 'bg-emerald-500' },
      { range: '70 - 84 (İyi)', percent: Math.round((cIyi / total) * 100), count: cIyi, color: 'bg-indigo-500' },
      { range: '55 - 69 (Orta)', percent: Math.round((cOrta / total) * 100), count: cOrta, color: 'bg-amber-500' },
      { range: '0 - 54 (Geliştirilmeli)', percent: Math.round((cGelistirilmeli / total) * 100), count: cGelistirilmeli, color: 'bg-rose-500' },
    ]
  }, [classStudents])

  // Attendance breakdown calculated across all students in class
  const attendanceBreakdown = useMemo(() => {
    if (!classStudents || classStudents.length === 0) return []
    const total = classStudents.length

    let c95 = 0
    let c85 = 0
    let cLess = 0

    classStudents.forEach((st) => {
      const att = st.attendanceRate || 95
      if (att >= 95) c95++
      else if (att >= 85) c85++
      else cLess++
    })

    return [
      { label: 'Düzenli Katılanlar (%95+)', count: c95, pct: `${Math.round((c95 / total) * 100)}%`, color: 'text-emerald-600 bg-emerald-500' },
      { label: 'Normal Katılım (%85 - %94)', count: c85, pct: `${Math.round((c85 / total) * 100)}%`, color: 'text-indigo-600 bg-indigo-500' },
      { label: 'Devamsızlık Takibinde (<%85)', count: cLess, pct: `${Math.round((cLess / total) * 100)}%`, color: 'text-rose-600 bg-rose-500' },
    ]
  }, [classStudents])

  // Student summary roster (Comprehensive roster of all students in class)
  const sampleStudents = useMemo(() => {
    return classStudents
      .map((st) => {
        const studentAvg =
          st.grades && st.grades.length > 0
            ? Number((st.grades.reduce((sum: number, g: any) => sum + Number(g.average || 0), 0) / st.grades.length).toFixed(1))
            : Number(st.gpa) || 85

        const e1 = Number(st.grades?.[0]?.exam1) || 80
        const e2 = Number(st.grades?.[0]?.exam2) || e1
        const diff = e2 - e1
        const trendStr = diff >= 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`

        return {
          id: st.id,
          no: st.studentNo,
          name: st.name,
          avg: studentAvg,
          attendance: `%${st.attendanceRate || 95}`,
          hwRate: `%${Math.min(100, Math.round(studentAvg * 1.05))}`,
          trend: trendStr,
        }
      })
      .filter((s) => s.name.toLowerCase().includes(searchStudent.toLowerCase()) || s.no.includes(searchStudent))
  }, [classStudents, searchStudent])

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Ogrenci No,Ad Soyad,Sube,Akademik Not Ortalamasi,Devam Orani,Odev Basarisi\n'
    sampleStudents.forEach((st) => {
      csvContent += `${st.no},"${st.name}",${activeClass.name},${st.avg},${st.attendance},${st.hwRate}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${activeClass.id}_Sinif_Kapsamli_Rapor.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`${activeClass.name} sınıfının tüm (${sampleStudents.length}) öğrenci raporu CSV olarak indirildi.`)
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <BarChart3 size={15} />
            <span>Sınıf Bazlı İstatistik ve Grafik Raporları</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Raporlarım
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Sınıf seçerek detaylı akademik performans, yoklama istatistikleri ve ödev raporlarını inceleyin
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-10 px-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>CSV İndir</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="h-10 px-3.5 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-purple-950/20"
          >
            <Printer size={14} />
            <span>Yazdır / PDF</span>
          </button>
        </div>
      </div>

      {/* ── STEP 1: CLASS SELECTOR (ÜST KISIMDA ÖNCE SINIF SEÇİMİ) ── */}
      <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
                Raporlanacak Sınıfı Seçin
              </span>
              <span className="text-[11px] text-gray-400">
                Seçilen şubenin tüm istatistik ve grafikleri dinamik olarak yüklenir
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-xl">
            Aktif Sınıf: {activeClass.name}
          </span>
        </div>

        {/* Class Selection Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1 max-h-72 overflow-y-auto pr-1">
          {CLASSES.map((cls) => {
            const isSelected = normalizeClassCode(cls.code) === normalizeClassCode(selectedClassId)
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => handleSelectClass(cls.code)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#F0D8FA]/50 dark:bg-[#4B075F]/30 border-[#4B075F] text-gray-900 dark:text-white shadow-xs'
                    : 'bg-gray-50/50 dark:bg-[#161D2E] border-gray-200/70 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-extrabold">{cls.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-[#4B075F] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {cls.studentCount} Öğrenci
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate mb-2">
                  {cls.course}
                </div>
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-200/60 dark:border-gray-800 font-bold">
                  <span className="text-[#16805D] dark:text-[#45C7A2]">Not Ort: {cls.avgGrade}</span>
                  <span className="text-[#4B075F] dark:text-[#C58ADB]">Devam: %{cls.attendanceRate}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── STEP 2: CATEGORY TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { key: 'academic', label: 'Akademik Başarı & Sınavlar', icon: TrendingUp },
          { key: 'attendance', label: 'Sınıf Devam & Yoklama', icon: CheckSquare },
          { key: 'homework', label: 'Ödev & Görev Takibi', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = categoryTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setCategoryTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-[#4B075F] text-white shadow-xs shadow-purple-950/20'
                  : 'bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 text-gray-600 dark:text-gray-300 hover:border-[#4B075F]'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── TAB 1: AKADEMİK BAŞARI & GRAFİKLER ── */}
      {categoryTab === 'academic' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
              <div className="text-[10px] font-bold text-gray-400 uppercase">Sınıf Not Ortalaması</div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {activeClass.avgGrade} <span className="text-xs font-bold text-gray-400">/ 100</span>
              </div>
              <div className="text-[10px] text-emerald-500 font-bold mt-0.5 flex items-center gap-1">
                <TrendingUp size={11} /> Okul ortalamasının üzerinde
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
              <div className="text-[10px] font-bold text-gray-400 uppercase">En Yüksek Not</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {studentGpa} <span className="text-xs font-bold text-gray-400">/ 100</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">{targetStudent?.name || 'Ali Yağız DEMİREL'}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
              <div className="text-[10px] font-bold text-gray-400 uppercase">Tamamlanan Sınavlar</div>
              <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                {studentGpa > 0 ? '4 Adet' : '0 Adet'}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">2 Yazılı + 2 Quiz</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
              <div className="text-[10px] font-bold text-gray-400 uppercase">Başarı Değişimi</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {studentGpa >= 85 ? '+%4.2' : studentGpa >= 60 ? '%0.0' : '-%15.4'}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Önceki aya göre artış</div>
            </div>
          </div>

          {/* Categorical Breakdown & Distribution Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Subject Categories */}
            <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      Kategori Bazlı Başarı Analizi
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-400">Müfredat alanlarına göre ortalama başarı</p>
                </div>
                <Award size={18} className="text-indigo-600" />
              </div>

              <div className="space-y-3.5 pt-1">
                {academicCategories.map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-700 dark:text-gray-200">{cat.title}</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{cat.avg} / 100</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${cat.avg}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Distribution */}
            <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      Not Dağılımı ve Başarı Kümeleri
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-400">{activeClass.name} genel başarı yüzdeleri</p>
                </div>
                <BarChart3 size={18} className="text-emerald-600" />
              </div>

              <div className="space-y-3.5 pt-1">
                {gradeDistribution.map((dist, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-700 dark:text-gray-200">{dist.range}</span>
                      <span className="text-gray-900 dark:text-white">%{dist.percent} ({dist.count} Öğrenci)</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${dist.color} rounded-full transition-all duration-500`}
                        style={{ width: `${dist.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: DEVAM & YOKLAMA İSTATİSTİKLERİ ── */}
      {categoryTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {activeClass.name} Devam Oranı
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                %{activeClass.attendanceRate}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Son 30 günlük ders ortalaması</div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Ortalama Derse Katılım
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                {activeClass.studentCount > 0 ? (activeClass.studentCount * 0.95).toFixed(1) : '24.0'} / {activeClass.studentCount}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Ders başına ortalama mevcut</div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Raporlu / İzinli Gün Sayısı
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                {Math.max(1, Math.round((activeClass.studentCount || 24) * 0.3))} Gün
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Bu ay toplam izinli kayıt</div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                Sınıf Katılım Dağılımı ve Risk Durumu
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {attendanceBreakdown.map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-[#161D2E] border border-gray-100 dark:border-gray-800">
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.label}</div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{item.count} Öğrenci</div>
                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">Sınıfın {item.pct}'ü</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: ÖDEV & GÖREV TAKİBİ ── */}
      {categoryTab === 'homework' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Zamanında Teslim Oranı
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                %{activeClass.homeworkRate}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Tüm ödevlerin teslim ortalaması</div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Verilen Toplam Ödev
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                12 Görev
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Okuma, Tahta, Quiz, Kompozisyon</div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Ortalama Ödev Puanı
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                89.4 / 100
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Öğretmen değerlendirmesi ortalaması</div>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAILED STUDENT PERFORMANCE ROSTER (AŞAĞIDAKİ LİSTE) ── */}
      <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                {activeClass.name} Öğrenci Başarı ve Devam Çizelgesi
              </h3>
            </div>
            <p className="text-[11px] text-gray-400">
              Seçili şubedeki öğrencilerin karne ve istatistik özetleri
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Öğrenci veya numara ara..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Öğrenci Adı Soyadı</th>
                <th className="py-2.5 px-3 text-center">Akademik Not</th>
                <th className="py-2.5 px-3 text-center">Devam Oranı</th>
                <th className="py-2.5 px-3 text-center">Ödev Başarısı</th>
                <th className="py-2.5 px-3 text-right">Gelişim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-medium">
              {sampleStudents.map((st) => (
                <tr key={st.no} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-gray-500">{st.no}</td>
                  <td className="py-3 px-3 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-extrabold">
                      {st.name.charAt(0)}
                    </div>
                    {st.name}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                    {st.avg}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    {st.attendance}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-gray-700 dark:text-gray-300">
                    {st.hwRate}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {st.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
