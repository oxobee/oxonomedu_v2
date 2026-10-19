'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CheckSquare,
  Users,
  Check,
  X,
  Clock,
  Save,
  History,
  Server,
  FileCheck,
  ChevronDown,
  RotateCcw,
  Calendar,
  Filter,
  Eye,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MockBadge from '@components/Common/MockBadge'
import { ALL_INITIAL_STUDENTS, MStudentItem } from '@components/Mobile/MStudentClient'
import {
  ALL_CLASSROOMS,
  normalizeClassCode,
  ClassroomItem,
} from '@services/demo/schoolDirectory'
import {
  saveAttendanceForClass,
  getAttendanceForClass,
  getAllAttendanceHistory,
  getTodayDateString,
  formatDateTurkish,
  AttendanceRecord,
} from '@services/demo/attendanceService'

export default function TeacherAttendanceView() {
  const [selectedClass, setSelectedClass] = useState<string>(() => {
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
    return '9/A'
  })
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString())
  const [activeTab, setActiveTab] = useState<'take' | 'history'>('take')

  // History Tab Filters
  const [historyFilterDate, setHistoryFilterDate] = useState<string>('')
  const [historyFilterClass, setHistoryFilterClass] = useState<string>('all')
  const [historyList, setHistoryList] = useState<AttendanceRecord[]>(() => getAllAttendanceHistory())

  // Keep selectedClass synchronized with global class change events
  useEffect(() => {
    const handleClassChanged = (e: any) => {
      if (e?.detail?.code) {
        setSelectedClass(normalizeClassCode(e.detail.code))
      }
    }
    window.addEventListener('oxonom_class_changed', handleClassChanged)
    return () => window.removeEventListener('oxonom_class_changed', handleClassChanged)
  }, [])

  const handleSelectClass = (newCode: string) => {
    const norm = normalizeClassCode(newCode)
    setSelectedClass(norm)
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

  // Students for the selected class
  const classStudents = useMemo(() => {
    const filtered = ALL_INITIAL_STUDENTS.filter((s) => {
      const normClass = normalizeClassCode(s.className || '')
      return normClass === selectedClass || s.className?.includes(selectedClass)
    })
    return filtered.length > 0 ? filtered : ALL_INITIAL_STUDENTS
  }, [selectedClass])

  // Records state: studentId -> 'present' | 'absent'
  const [records, setRecords] = useState<Record<string, 'present' | 'absent'>>({})
  const [savedRecordForDate, setSavedRecordForDate] = useState<AttendanceRecord | null>(null)

  // Load attendance whenever selectedClass or selectedDate changes
  useEffect(() => {
    const existing = getAttendanceForClass(selectedClass, selectedDate)
    if (existing) {
      setRecords(existing.records)
      setSavedRecordForDate(existing)
    } else {
      // Default all to present
      const initial: Record<string, 'present' | 'absent'> = {}
      classStudents.forEach((s) => {
        initial[s.id] = 'present'
      })
      setRecords(initial)
      setSavedRecordForDate(null)
    }
  }, [selectedClass, selectedDate, classStudents])

  // Refresh history list when tab or updates happen
  const refreshHistory = () => {
    setHistoryList(getAllAttendanceHistory())
  }

  const toggleStudent = (id: string) => {
    setRecords((prev) => ({
      ...prev,
      [id]: prev[id] === 'absent' ? 'present' : 'absent',
    }))
  }

  const markAllPresent = () => {
    const all: Record<string, 'present' | 'absent'> = {}
    classStudents.forEach((s) => {
      all[s.id] = 'present'
    })
    setRecords(all)
    toast.success('Tüm sınıf "Burada" olarak işaretlendi.')
  }

  const handleSave = () => {
    const saved = saveAttendanceForClass(selectedClass, records, classStudents.length, selectedDate)
    setSavedRecordForDate(saved)
    refreshHistory()
    toast.success(`${formatDateTurkish(selectedDate)} yoklaması sisteme kaydedildi!`)
  }

  // Filtered history list
  const filteredHistory = useMemo(() => {
    return historyList.filter((item) => {
      if (historyFilterDate && item.date !== historyFilterDate) return false
      if (historyFilterClass !== 'all' && item.classCode !== historyFilterClass) return false
      return true
    })
  }, [historyList, historyFilterDate, historyFilterClass])

  const openHistoryItemInTakeTab = (item: AttendanceRecord) => {
    setSelectedClass(item.classCode)
    setSelectedDate(item.date)
    setActiveTab('take')
  }

  const presentCount = Object.values(records).filter((r) => r === 'present').length
  const absentCount = Object.values(records).filter((r) => r === 'absent').length

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <CheckSquare size={15} />
            <span>Sınıf İçi Devam & Yoklama Takibi</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Yoklama ve Devam
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Tarih bazlı günlük yoklama alma, sınıf mevcudu kontrolü ve geçmiş yoklama arşivini inceleme
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('take')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'take'
                ? 'bg-white dark:bg-[#1A2338] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Yoklama Al
          </button>
          <button
            type="button"
            onClick={() => {
              refreshHistory()
              setActiveTab('history')
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white dark:bg-[#1A2338] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Geçmiş Yoklamalar ({historyList.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: YOKLAMA AL ── */}
      {activeTab === 'take' && (
        <div className="space-y-4">
          {/* Controls: Class Selector, Date Picker & Quick Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4.5 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Sınıf Seçimi */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Şube:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => handleSelectClass(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold border-none text-gray-900 dark:text-white focus:ring-2 focus:ring-[#8D49A6] cursor-pointer"
                >
                  {ALL_CLASSROOMS.map((cls) => (
                    <option key={cls.id} value={cls.code}>
                      {cls.name} ({cls.grade_level})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tarih Seçimi */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Tarih:</span>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-9 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold border-none text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                {selectedDate === getTodayDateString() && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold">
                    Bugün
                  </span>
                )}
              </div>
            </div>

            {/* Stats Pill & Quick Action */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-extrabold">
                {presentCount} Burada
              </span>
              <span className="px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-extrabold">
                {absentCount} Yok
              </span>
              <button
                type="button"
                onClick={markAllPresent}
                className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold transition-colors cursor-pointer"
              >
                Tümünü Var Yap
              </button>
            </div>
          </div>

          {/* Date Status Banner */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            savedRecordForDate
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-2.5">
              {savedRecordForDate ? (
                <Check size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <div>
                <span className="font-bold">{formatDateTurkish(selectedDate)}:</span>{' '}
                {savedRecordForDate ? (
                  <span>Bu tarihe ait kayıt mevcut (Kayıt Saati: {savedRecordForDate.updatedAt}). Değişiklik yapıp yeniden kaydedebilirsiniz.</span>
                ) : (
                  <span>Bu tarihe ait henüz yoklama kaydedilmemiş. Öğrenci durumlarını belirleyip kaydedebilirsiniz.</span>
                )}
              </div>
            </div>

            {selectedDate !== getTodayDateString() && (
              <button
                type="button"
                onClick={() => setSelectedDate(getTodayDateString())}
                className="text-xs font-bold underline cursor-pointer shrink-0"
              >
                Bugüne Dön
              </button>
            )}
          </div>

          {/* Student Roster Grid */}
          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {classStudents.map((st) => {
                const isPresent = records[st.id] !== 'absent'

                return (
                  <div
                    key={st.id}
                    onClick={() => toggleStudent(st.id)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all select-none ${
                      isPresent
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isPresent
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-rose-500 text-white shadow-xs'
                      }`}>
                        {st.studentNo.slice(-2)}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {st.name}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                          No: {st.studentNo}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isPresent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-extrabold">
                          <Check size={12} strokeWidth={3} />
                          <span>Burada</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-extrabold">
                          <X size={12} strokeWidth={3} />
                          <span>Yok</span>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom Save Action */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Seçili Tarih: <span className="font-bold text-gray-800 dark:text-gray-200">{formatDateTurkish(selectedDate)}</span>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-950/20 transition-all cursor-pointer"
              >
                <Save size={16} className="text-white" />
                <span>Yoklamayı Onayla & Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: GEÇMİŞ YOKLAMALAR & TARİH FİLTRESİ ── */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-5">
          {/* History Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-white">
                <History size={17} className="text-indigo-500" />
                <span>Kaydedilmiş Yoklama Geçmişi</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Geçmiş günlere ait yoklamaları listeleyin ve istediğiniz tarihin yoklama fişini açın
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Tarih Filtresi */}
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" />
                <input
                  type="date"
                  value={historyFilterDate}
                  onChange={(e) => setHistoryFilterDate(e.target.value)}
                  className="h-8 px-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold border-none text-gray-900 dark:text-white"
                  title="Tarihe Göre Filtrele"
                />
              </div>

              {/* Şube Filtresi */}
              <select
                value={historyFilterClass}
                onChange={(e) => setHistoryFilterClass(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold border-none text-gray-900 dark:text-white focus:ring-2 focus:ring-[#8D49A6] cursor-pointer"
              >
                <option value="all">Tüm Şubeler</option>
                {ALL_CLASSROOMS.map((cls) => (
                  <option key={cls.id} value={cls.code}>
                    {cls.name}
                  </option>
                ))}
              </select>

              {historyFilterDate && (
                <button
                  type="button"
                  onClick={() => setHistoryFilterDate('')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Tüm Günler
                </button>
              )}
            </div>
          </div>

          {/* History Records List */}
          {filteredHistory.length > 0 ? (
            <div className="space-y-3">
              {filteredHistory.map((item, idx) => {
                const percent = Math.round(((item.presentCount || 0) / (item.totalCount || 1)) * 100)

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#161D2E] border border-gray-200/60 dark:border-gray-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">
                          {formatDateTurkish(item.date)}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.classCode} • Kayıt Saati: {item.updatedAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                          {item.presentCount} Mevcut
                        </span>
                        {item.absentCount > 0 ? (
                          <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold">
                            {item.absentCount} Devamsız
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                            Tam Katılım (%100)
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => openHistoryItemInTakeTab(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Yoklamayı Aç</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs">
              <Calendar size={28} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              Seçilen kriterlere uygun yoklama kaydı bulunamadı.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
