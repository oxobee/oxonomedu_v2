'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  GraduationCap,
  Sparkles,
  School,
  Check,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Layers,
  ChevronRight,
  UserCheck,
  RefreshCw,
} from 'lucide-react'
import {
  SCHOOL_ORGS,
  ALL_CLASSROOMS,
  DEMO_STUDENT,
  ClassroomItem,
  getActiveClassroom,
} from '@services/demo/schoolDirectory'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface DemoClassSwitcherProps {
  currentActiveClass?: string
  onClassChange?: (newClass: ClassroomItem) => void
  compact?: boolean
}

export default function DemoClassSwitcher({
  currentActiveClass,
  onClassChange,
  compact = false,
}: DemoClassSwitcherProps) {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [activeCode, setActiveCode] = useState<string>('1-A')
  const [selectedSchoolTab, setSelectedSchoolTab] = useState<number>(10) // 10: İlkokul, 20: Ortaokul

  // Read active class from cookie or localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const cookieMatch = document.cookie.match(/oxonom_demo_student_active_class=([^;]+)/)
    const saved = cookieMatch ? decodeURIComponent(cookieMatch[1]) : localStorage.getItem('oxonom_demo_student_active_class')
    if (saved) {
      setActiveCode(saved)
    } else if (currentActiveClass) {
      setActiveCode(currentActiveClass)
    }
  }, [currentActiveClass])

  const activeClassItem = useMemo(() => {
    return getActiveClassroom(activeCode)
  }, [activeCode])

  // Automatically switch tabs depending on active class
  useEffect(() => {
    if (activeClassItem.org_id) {
      setSelectedSchoolTab(activeClassItem.org_id)
    }
  }, [activeClassItem])

  const handleSelectClass = (cls: ClassroomItem) => {
    setActiveCode(cls.code)
    if (typeof window !== 'undefined') {
      document.cookie = `oxonom_demo_student_active_class=${encodeURIComponent(cls.code)}; path=/; max-age=31536000; SameSite=Lax`
      localStorage.setItem('oxonom_demo_student_active_class', cls.code)
    }

    // Invalidate queries so that all classroom, board, and assignment data updates immediately
    queryClient.invalidateQueries({ queryKey: ['org-classrooms'] })
    queryClient.invalidateQueries({ queryKey: ['org-boards'] })
    queryClient.invalidateQueries({ queryKey: ['school-assignments'] })
    queryClient.invalidateQueries({ queryKey: ['usergroups'] })
    queryClient.invalidateQueries({ queryKey: ['my-classes'] })
    queryClient.invalidateQueries({ queryKey: ['students'] })
    queryClient.invalidateQueries({ queryKey: ['orgs'] })

    if (onClassChange) {
      onClassChange(cls)
    }

    toast.success(
      `🎓 Sınıfınız başarıyla ${cls.name} (${cls.school_name} — Öğretmen: ${cls.teacher_name}) olarak güncellendi!`,
      { duration: 4000 }
    )
    setIsOpen(false)
  }

  // Filter classrooms by selected school tab
  const currentSchoolClasses = useMemo(() => {
    return ALL_CLASSROOMS.filter((c) => c.org_id === selectedSchoolTab)
  }, [selectedSchoolTab])

  // Group classrooms by grade level (1. Sınıf, 2. Sınıf etc.)
  const groupedClasses = useMemo(() => {
    const groups: Record<string, ClassroomItem[]> = {}
    currentSchoolClasses.forEach((c) => {
      if (!groups[c.grade_level]) groups[c.grade_level] = []
      groups[c.grade_level].push(c)
    })
    return groups
  }, [currentSchoolClasses])

  // Compact floating badge view
  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-gradient hover:opacity-95 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <GraduationCap size={15} className="text-white" />
          <span className="text-white">Sınıfım: {activeClassItem.code}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-white">Değiştir</span>
        </button>

        {renderModal()}
      </>
    )
  }

  // Full Hero Card View for /home
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-[#4B075F]/10 via-[#8D49A6]/5 to-[#D914C8]/10 p-6 sm:p-7 mb-6 shadow-sm">
      {/* Top Row: Demo Student Profile & School Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-purple-200/60 dark:border-purple-800/60">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-[#4B075F] text-white shadow-xs">
            <Sparkles size={14} className="text-white" />
            <span className="text-white">Demo Öğrenci Hesabı</span>
          </span>
          <span className="text-sm font-black text-purple-950 dark:text-purple-100">
            {DEMO_STUDENT.name}
          </span>
          <span className="text-xs font-mono font-bold text-purple-900 dark:text-purple-200 bg-white/90 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded-lg shadow-2xs">
            Okul No: {DEMO_STUDENT.studentNo} • T.C.: {DEMO_STUDENT.tcNo}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-950 shadow-2xs flex items-center gap-1.5">
            <School size={14} className="text-emerald-600" />
            <span>{activeClassItem.school_name}</span>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-100/80 text-emerald-900 text-xs font-bold">
            {activeClassItem.grade_level}
          </span>
        </div>
      </div>

      {/* Middle Row: Active Class & Action Buttons */}
      <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
            Seçili Sınıfınız
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {activeClassItem.name}
            </h3>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
              Aktif Şube
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
          >
            <RefreshCw size={15} />
            <span>Sınıfımı Değiştir (58 Şube)</span>
          </button>

          <Link
            href={`/orgs/${activeClassItem.school_slug}/boards`}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <BookOpen size={15} className="text-emerald-600" />
            <span>Ders Panoları</span>
          </Link>

          <Link
            href={`/orgs/${activeClassItem.school_slug}/dash/assignments`}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <ClipboardList size={15} className="text-emerald-600" />
            <span>Ödevlerim (3)</span>
          </Link>
        </div>
      </div>

      {/* Bottom Row: Detailed Info Chips with whitespace-nowrap so they never squash */}
      <div className="pt-4 border-t border-emerald-200/70 flex flex-wrap items-center gap-2.5 text-xs text-gray-700">
        <div className="inline-flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs whitespace-nowrap">
          <span className="text-gray-400 font-medium">Öğretmen:</span>
          <span className="font-extrabold text-gray-900">{activeClassItem.teacher_name}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs whitespace-nowrap">
          <span className="text-gray-400 font-medium">Veliler:</span>
          <span className="font-bold text-gray-900">Ebru & Kemal SOYSAL</span>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs whitespace-nowrap">
          <span className="text-gray-400 font-medium">Sınıf Mevcudu:</span>
          <span className="font-bold text-gray-900">30 Öğrenci</span>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs whitespace-nowrap">
          <span className="text-gray-400 font-medium">Katılım Kodu:</span>
          <span className="font-mono font-bold text-emerald-800">{activeClassItem.join_code}</span>
        </div>
      </div>

      {renderModal()}
    </div>
  )

  function renderModal() {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white border border-gray-200 shadow-2xl rounded-3xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-brand-gradient px-6 py-5 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                  <GraduationCap size={22} className="text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>Demo Sınıfını Değiştir</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                      58 MEB Şubesi
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-purple-100 mt-0.5 font-medium">
                    Demo öğrenci olarak istediğiniz sınıfı seçin. Seçtiğiniz sınıfın öğretmeni, ders tahtaları ve ödevleri anında yüklenecektir.
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* School Switch Tabs */}
            <div className="mt-4 flex gap-2 p-1 rounded-2xl bg-black/15 backdrop-blur-md">
              {SCHOOL_ORGS.map((school) => {
                const isActiveTab = selectedSchoolTab === school.id
                return (
                  <button
                    key={school.id}
                    type="button"
                    onClick={() => setSelectedSchoolTab(school.id)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isActiveTab
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <School size={14} className={isActiveTab ? 'text-emerald-600' : 'text-white/70'} />
                    <span>{school.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isActiveTab ? 'bg-emerald-100 text-emerald-800' : 'bg-white/20 text-white'}`}>
                      {school.grades}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Classroom Selection Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {Object.entries(groupedClasses).map(([gradeLevel, classes]) => (
              <div key={gradeLevel} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    {gradeLevel}
                  </h4>
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-[11px] font-bold text-gray-600">
                    {classes.length} Şube
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {classes.map((cls) => {
                    const isSelected = activeCode === cls.code
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => handleSelectClass(cls)}
                        className={`p-3 rounded-2xl border text-start transition-all relative flex flex-col justify-between group cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20'
                            : 'border-gray-200/90 bg-white hover:border-emerald-400 hover:bg-gray-50/60 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <span className={`text-base font-black tracking-tight ${isSelected ? 'text-emerald-950' : 'text-gray-900'}`}>
                            {cls.code} Şubesi
                          </span>
                          {isSelected ? (
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 flex items-center justify-center transition-colors shrink-0">
                              <ChevronRight size={12} />
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs font-bold text-gray-800 truncate">
                            {cls.teacher_name}
                          </div>
                          <div className="text-[11px] text-gray-600 flex items-center justify-between">
                            <span>Mevcut: 30</span>
                            <span className="font-mono text-[10px]">{cls.join_code}</span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
            <div className="text-xs text-gray-600">
              Şu an seçili: <strong className="text-emerald-900 font-extrabold">{activeClassItem.name} ({activeClassItem.teacher_name})</strong>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
}
