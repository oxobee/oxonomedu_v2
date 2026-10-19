'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Award,
  Users,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  FileText,
  Plus,
  Send,
  X,
  ChevronRight,
  TrendingDown,
  BarChart2,
  PieChart,
  UserCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MockBadge from '@components/Common/MockBadge'
import { ALL_INITIAL_STUDENTS, MStudentItem } from '@components/Mobile/MStudentClient'

export default function TeacherProgressView() {
  const [selectedClass, setSelectedClass] = useState('9-A Şubesi')
  const [search, setSearch] = useState('')

  // Active Teacher details for signing guidance notes
  const [teacherName, setTeacherName] = useState('Ebru TEKNECİ')
  const [teacherBranch, setTeacherBranch] = useState('Türk Dili ve Edebiyatı · Rehberlik')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_teacher_profile')
        if (saved) {
          const parsed = JSON.parse(saved)
          setTeacherName(`${parsed.firstName || parsed.name || 'Ebru'} ${parsed.lastName || 'TEKNECİ'}`.trim())
          if (parsed.branch) setTeacherBranch(parsed.branch)
        }
      } catch (_) {}
    }
  }, [])

  // Student state with persistence
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

  // Keep students reactive with storage and update events
  useEffect(() => {
    const handleSync = () => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('oxonom_m_students_v3')
          if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setStudents(parsed)
              setSelectedStudent((prev) => {
                if (!prev) return null
                return parsed.find((s: MStudentItem) => s.id === prev.id) || prev
              })
            }
          }
        } catch (_) {}
      }
    }
    window.addEventListener('oxonom_student_updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('oxonom_student_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // Selected student for detailed progress & guidance modal
  const [selectedStudent, setSelectedStudent] = useState<MStudentItem | null>(null)
  const [newGuidanceNote, setNewGuidanceNote] = useState('')

  // Filter students by selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass === '9-A Şubesi' || selectedClass === '9-A') {
        return s.className === '9-A Şubesi' || s.className.startsWith('9-A')
      }
      return s.className === selectedClass
    })
  }, [students, selectedClass])

  const filteredStudents = useMemo(() => {
    return classStudents.filter((s) => {
      if (!search.trim()) return true
      return s.name.toLowerCase().includes(search.toLowerCase()) || s.studentNo.includes(search)
    })
  }, [classStudents, search])

  // Add new guidance note
  const handleAddGuidanceNote = () => {
    if (!newGuidanceNote.trim() || !selectedStudent) return

    const now = new Date()
    const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const noteAuthor = `${teacherName} (${teacherBranch})`

    const newNote = {
      id: `gn-${Date.now()}`,
      date: dateStr,
      author: noteAuthor,
      content: newGuidanceNote.trim(),
    }

    const updated = students.map((st) => {
      if (st.id === selectedStudent.id) {
        const updatedNotes = [newNote, ...(st.guidanceNotes || [])]
        return {
          ...st,
          guidanceNotes: updatedNotes,
        }
      }
      return st
    })

    setStudents(updated)
    setSelectedStudent((prev) => (prev ? { ...prev, guidanceNotes: [newNote, ...(prev.guidanceNotes || [])] } : null))
    setNewGuidanceNote('')

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_m_students_v3', JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('oxonom_student_updated'))
      } catch (_) {}
    }

    toast.success(`📝 Rehberlik notu ${teacherName} imzasıyla başarıyla kaydedildi!`)
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <TrendingUp size={15} />
            <span>Akademik Gelişim & Pedagojik Rehberlik</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Öğrenci Gelişimi ve Rehberlik
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Sınıf seçin, öğrenci bazlı grafiksel not ve devamsızlık analizlerini inceleyin ve rehberlik notu ekleyin
          </p>
        </div>

        {/* Sınıf Seçimi */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Şube:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-10 px-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="9-A Şubesi">9-A Şubesi (Rehberlik Şubesi)</option>
            <option value="9-B Şubesi">9-B Şubesi</option>
            <option value="1-A Şubesi">1-A Şubesi</option>
          </select>
        </div>
      </div>

      {/* ── SEARCH & STATS ── */}
      <div className="p-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${selectedClass} öğrencisi ara...`}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0">
          Kayıtlı: <strong className="text-gray-900 dark:text-white">{filteredStudents.length} Öğrenci</strong>
        </span>
      </div>

      {/* ── STUDENTS CARDS GRID ── */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((st) => (
            <div
              key={st.id}
              onClick={() => setSelectedStudent(st)}
              className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs hover:border-[#4B075F] dark:hover:border-[#C58ADB] transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-brand-gradient text-white font-black text-sm flex items-center justify-center shadow-sm shadow-purple-950/20">
                      {st.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-[#4B075F] dark:group-hover:text-[#C58ADB] transition-colors">
                        {st.name}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                        No: {st.studentNo} • T.C.: {st.tcNo}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    %{st.attendanceRate} Devam
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                    <span className="text-gray-400 text-[10px] block">Genel Başarı</span>
                    <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                      {st.grades && st.grades.length > 0
                        ? Number((st.grades.reduce((sum, g) => sum + (Number(g.average) || 0), 0) / st.grades.length).toFixed(1))
                        : (st.gpa ?? 0)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                    <span className="text-gray-400 text-[10px] block">Rehberlik Kaydı</span>
                    <span className="font-extrabold text-xs text-gray-800 dark:text-gray-200">
                      {st.guidanceNotes?.length || 0} Gözlem
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Gelişim & Not Detaylarını Gör</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-12 text-center text-xs text-gray-400">
          Bu şubede henüz kayıtlı öğrenci bulunmuyor.
        </div>
      )}

      {/* ── DETAILED STUDENT PROGRESS & GUIDANCE MODAL ── */}
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
              className="relative w-full max-w-3xl bg-white dark:bg-[#0E1526] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] flex flex-col z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-gradient text-white font-black text-base flex items-center justify-center shadow-md shadow-purple-950/20">
                    {selectedStudent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                      {selectedStudent.name} — Bireysel Gelişim Kartı
                    </h3>
                    <p className="text-xs text-gray-400">
                      {selectedStudent.className} • No: {selectedStudent.studentNo} • T.C.: {selectedStudent.tcNo}
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

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* 1. AKADEMİK NOTLAR (GRAFİKSEL VE İSTATİSTİKSEL) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <BarChart2 size={15} className="text-indigo-500" />
                      <span>Akademik Notlar & Başarı İstatistikleri</span>
                    </h4>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                      Genel Ortalama: {selectedStudent.grades && selectedStudent.grades.length > 0
                        ? Number((selectedStudent.grades.reduce((sum, g) => sum + (Number(g.average) || 0), 0) / selectedStudent.grades.length).toFixed(1))
                        : (selectedStudent.gpa ?? 0)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(selectedStudent.grades || []).map((grade, idx) => {
                      const e1 = Number(grade.exam1) || 0
                      const e2 = grade.exam2 !== undefined ? Number(grade.exam2) : e1
                      const diff = e2 - e1
                      const isUp = diff >= 0
                      const avgNum = Number(grade.average) || 0
                      const isCritical = avgNum < 50

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border space-y-2 transition-colors ${
                            isCritical
                              ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40'
                              : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-800/60'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-gray-900 dark:text-white">{grade.courseName}</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-extrabold flex items-center gap-0.5 ${
                                isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                              }`}>
                                {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                <span>{isUp ? `+${diff}` : diff}</span>
                              </span>
                              <strong className={`text-sm font-black ${
                                isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'
                              }`}>
                                {grade.average}
                              </strong>
                            </div>
                          </div>

                          {/* Graphical Bar */}
                          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div
                              style={{ width: `${Math.max(2, Math.min(100, avgNum))}%` }}
                              className={`h-full rounded-full ${
                                isCritical
                                  ? 'bg-rose-500'
                                  : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                              }`}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5 font-mono">
                            <span>1. Sınav: {grade.exam1}</span>
                            <span>2. Sınav: {grade.exam2}</span>
                            <span>Perf: {grade.performance}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 2. DEVAMSIZLIK DURUMU (GRAFİKSEL VE İSTATİSTİKSEL) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <UserCheck size={15} className="text-emerald-500" />
                    <span>Devamsızlık & Okul Devam İstatistikleri</span>
                  </h4>

                  <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                        <span>Ders Katılım Oranı: %{selectedStudent.attendanceRate}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                          Kusursuz Devam
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        Öğrenci 2026-2027 Güz Döneminde toplam 120 ders saatinin tamamına katılmıştır.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-center">
                      <div className="px-3 py-2 rounded-xl bg-white dark:bg-[#0E1526] border border-emerald-200/60">
                        <span className="text-gray-400 text-[10px] block">Özürsüz</span>
                        <strong className="text-xs font-black text-gray-900 dark:text-white">
                          {selectedStudent.absentUnexcusedDays} Gün
                        </strong>
                      </div>
                      <div className="px-3 py-2 rounded-xl bg-white dark:bg-[#0E1526] border border-emerald-200/60">
                        <span className="text-gray-400 text-[10px] block">Özürlü</span>
                        <strong className="text-xs font-black text-gray-900 dark:text-white">
                          {selectedStudent.absentExcusedDays} Gün
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. REHBERLİK NOTU EKLEME ALANI (ÖĞRETMEN İMZASIYLA) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <FileText size={15} className="text-purple-500" />
                      <span>Pedagojik Rehberlik ve Gözlem Notları</span>
                    </h4>
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                      İmzalayan: {teacherName}
                    </span>
                  </div>

                  {/* Add Note Input */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 space-y-2">
                    <textarea
                      value={newGuidanceNote}
                      onChange={(e) => setNewGuidanceNote(e.target.value)}
                      rows={2}
                      placeholder={`Öğrenci hakkında rehberlik veya ders içi gözlem notu yazın... (Kayıt ${teacherName} adına yapılacaktır)`}
                      className="w-full p-3 rounded-xl bg-white dark:bg-[#0E1526] text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">
                        * Kaydedilen not öğrenci dosyasına kalıcı pedagojik kayıt olarak işlenir.
                      </span>
                      <button
                        type="button"
                        onClick={handleAddGuidanceNote}
                        disabled={!newGuidanceNote.trim()}
                        className="px-4 py-2 rounded-xl bg-brand-gradient hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-purple-950/20 transition-all cursor-pointer"
                      >
                        <Send size={12} />
                        <span>Rehberlik Notunu Kaydet</span>
                      </button>
                    </div>
                  </div>

                  {/* Existing Notes List */}
                  <div className="space-y-2">
                    {(selectedStudent.guidanceNotes || []).map((note) => (
                      <div
                        key={note.id}
                        className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-800/60 space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{note.author}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{note.date}</span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                          {note.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
