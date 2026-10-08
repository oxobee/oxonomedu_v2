'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronRight,
  Tv,
  BookOpenCheck,
  Users,
  FolderOpen,
  LayoutGrid,
  QrCode,
  LogOut,
  Sparkles,
  ExternalLink,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Gamepad2,
  Monitor,
  Settings,
  GraduationCap,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { signOut } from '@components/Contexts/AuthContext'
import { useOrg } from '@components/Contexts/OrgContext'
import {
  ALL_CLASSROOMS,
  ClassroomItem,
} from '@services/demo/schoolDirectory'
import { getClassroomBoards } from '@services/boards/boards'
import {
  getSchoolAssignments,
  SchoolAssignmentItem,
  formatDueDate,
} from '@services/school_assignments/school_assignments'
import ClassSelectorSheet from './ClassSelectorSheet'
import ConnectBoardModal from './ConnectBoardModal'
import AttendanceSparkline from './AttendanceSparkline'

export default function DashV2Client() {
  const router = useRouter()
  const org = useOrg() as any
  const session = useLHSession() as any
  const user = session?.data?.user
  const token = session?.data?.tokens?.access_token

  // 1. Selected Class State (Persisted in localStorage)
  const [selectedClass, setSelectedClass] = useState<ClassroomItem>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_selected_class')
        if (saved) {
          const parsed = JSON.parse(saved)
          const found = ALL_CLASSROOMS.find((c) => c.id === parsed.id || c.code === parsed.code)
          if (found) return found
        }
      } catch (_) {}
    }
    // Default to 4-A or first classroom
    return ALL_CLASSROOMS.find((c) => c.code === '4-A') || ALL_CLASSROOMS[0]
  })

  // Modal States
  const [isClassSheetOpen, setIsClassSheetOpen] = useState(false)
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<'boards' | 'assignments' | null>('boards')

  // Save selected class to localStorage & notify
  const handleSelectClass = (cls: ClassroomItem) => {
    setSelectedClass(cls)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_selected_class', JSON.stringify(cls))
        window.dispatchEvent(new CustomEvent('oxonom_class_changed', { detail: cls }))
      } catch (_) {}
    }
  }

  // 2. Teacher Name Resolution
  const teacherName = useMemo(() => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} Öğretmen`
    }
    if (user?.first_name) {
      return `${user.first_name} Öğretmen`
    }
    if (selectedClass?.teacher_name) {
      const parts = selectedClass.teacher_name.split(' ')
      return `${parts[0]} Öğretmen`
    }
    return 'Uğur Öğretmen'
  }, [user, selectedClass])

  // 3. Fetch Boards for Active Classroom
  const { data: boardsData, isLoading: isBoardsLoading } = useQuery({
    queryKey: ['classroom-boards-v2', selectedClass?.id],
    queryFn: () => getClassroomBoards(selectedClass.id, token),
    staleTime: 30_000,
  })
  const boards: any[] = Array.isArray(boardsData) ? boardsData : []
  const activeBoard = boards[0]

  // 4. Fetch Assignments for Active Classroom
  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useQuery({
    queryKey: ['classroom-assignments-v2', selectedClass?.id],
    queryFn: () =>
      getSchoolAssignments(
        org?.id || 10,
        { usergroup_id: selectedClass?.id },
        token || ''
      ),
    staleTime: 30_000,
  })
  const assignments: SchoolAssignmentItem[] = Array.isArray(assignmentsData) ? assignmentsData : []

  // Assignments Statistics
  const activeAssignmentsCount = assignments.length || 8
  const dueTodayCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return assignments.filter((a) => a.due_date && a.due_date.startsWith(todayStr)).length
  }, [assignments])

  // 5. Active Paired Board Query
  const { data: activeBoardsData } = useQuery({
    queryKey: ['pano-active-boards-v2'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/pano/pair/active-boards')
        if (res.ok) {
          const data = await res.json()
          return data.activeBoards || []
        }
      } catch (_) {}
      return []
    },
    refetchInterval: 12_000,
  })
  const pairedBoard = Array.isArray(activeBoardsData) && activeBoardsData.length > 0 ? activeBoardsData[0] : null
  const isBoardConnected = Boolean(pairedBoard)

  // 6. Attendance Rate
  const attendanceRate = 92 // %92 default as requested
  const sparklineData = [98, 94, 91, 96, 92]

  // 7. Sınıflar Summary
  const siblingClassrooms = useMemo(() => {
    const grade = selectedClass.grade_level
    return ALL_CLASSROOMS.filter((c) => c.grade_level === grade).slice(0, 3)
  }, [selectedClass])

  // Logout Handler
  const handleSignOut = async () => {
    try {
      await fetch('/api/pano/pair/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'both' }),
      })
    } catch (_) {}
    toast.success('Oturum başarıyla kapatıldı.')
    await signOut({ redirect: true, callbackUrl: '/auth/login' })
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#FFFFFF] text-[#111827] flex flex-col items-center select-none selection:bg-indigo-50 selection:text-indigo-900 pb-[env(safe-area-inset-bottom)]">
      {/* ── STICKY TOP BAR: Sınıf / Şube Seçici ── */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 px-4 sm:px-6 transition-all">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Sınıf / Şube Seçim Butonu (Mobile-App Component) */}
          <button
            type="button"
            onClick={() => setIsClassSheetOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 -ml-1 rounded-2xl hover:bg-[#F8FAFC] active:scale-[0.98] transition-all cursor-pointer border border-transparent hover:border-[#E5E7EB] focus:outline-none"
            aria-label="Sınıf ve Şube Değiştir"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {selectedClass.code}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-[#111827] leading-tight">
                  {selectedClass.code}
                </span>
                <ChevronDown size={14} className="text-[#64748B]" />
              </div>
              <span className="text-[11px] text-[#64748B] block leading-none font-medium">
                {selectedClass.grade_level || 'Sınıfım'}
              </span>
            </div>
          </button>

          {/* Sağ Alan: Kampüs / Okul Rozeti & Hızlı Durum */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#F8FAFC] text-[#64748B] border border-[#E5E7EB]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {org?.name || 'Oxonom EDU'}
            </span>

            {/* Hızlı QR Modal Tetikleyici */}
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="p-2 rounded-xl bg-[#F8FAFC] hover:bg-gray-100 text-[#111827] active:scale-[0.96] transition-all cursor-pointer border border-[#E5E7EB]"
              title="Hızlı Tahta Eşleşmesi"
            >
              <QrCode size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ── ANA ÇALIŞMA ALANI CONTAINER ── */}
      <main className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl px-4 sm:px-6 pt-5 pb-12 flex flex-col gap-6 flex-1">
        {/* ── 1. HERO ALANI (Greeting & Overview) ── */}
        <section className="space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-0.5">
              Öğretmen Çalışma Alanı
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
              Hoş Geldiniz, {teacherName}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
              <span className="font-semibold text-gray-800">{selectedClass.name}</span> •{' '}
              {selectedClass.student_count || 24} Öğrenci · {boards.length || 1} Akıllı Tahta
            </p>
          </div>

          {/* ── 2. HERO İÇERİSİNDE SINIF ÖZETİ (Yatay Bilgi Satırı - Inline Metrics) ── */}
          <div className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-3xl p-4 sm:p-5">
            <div className="grid grid-cols-3 divide-x divide-gray-200/80">
              {/* Segment 1: Öğrenci */}
              <Link
                href="/dash/students"
                className="px-2 sm:px-4 flex flex-col justify-center active:scale-[0.98] transition-transform group"
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight group-hover:text-emerald-700 transition-colors">
                  {selectedClass.student_count || 24}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-700 mt-0.5">
                  Öğrenci
                </div>
                <div className="text-[11px] text-[#64748B] hidden sm:block">
                  Kayıtlı ve aktif
                </div>
              </Link>

              {/* Segment 2: Akıllı Tahta */}
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'boards' ? null : 'boards')}
                className="px-2 sm:px-4 flex flex-col justify-center text-left active:scale-[0.98] transition-transform cursor-pointer group"
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight group-hover:text-emerald-700 transition-colors">
                  {boards.length || 1}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-700 mt-0.5 flex items-center gap-1.5">
                  <span>Akıllı Tahta</span>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isBoardConnected ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-600'
                    }`}
                  />
                </div>
                <div className="text-[11px] text-[#64748B] hidden sm:block">
                  {isBoardConnected ? 'Bağlantı Aktif' : 'Kullanıma Hazır'}
                </div>
              </button>

              {/* Segment 3: Yoklama */}
              <Link
                href="/dash/students"
                className="px-2 sm:px-4 flex flex-col justify-center active:scale-[0.98] transition-transform group"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
                    %{attendanceRate}
                  </span>
                  <AttendanceSparkline
                    data={sparklineData}
                    width={56}
                    height={18}
                    className="hidden sm:inline-flex"
                  />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-700 mt-0.5">
                  Yoklama
                </div>
                {/* Mini Progress Bar Indicator */}
                <div className="mt-1 w-full max-w-[80px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${attendanceRate}%` }}
                  />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ── 3. ANA HIZLI ERİŞİM ALANI (5 Core Navigation Shortcuts) ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Hızlı Erişim & Çalışma Alanı
            </h2>
          </div>

          <div className="space-y-2.5">
            {/* 1. AKILLI TAHTALAR (Expandable & Highlighted) */}
            <div className="bg-white border border-[#E5E7EB] hover:border-gray-300 rounded-2xl transition-all shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'boards' ? null : 'boards')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Tv size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#111827]">Akıllı Tahtalar</h3>
                    <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="truncate">
                        {selectedClass.code} Sınıf Tahtası · {isBoardConnected ? 'Bağlı' : 'Hazır'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[#64748B]">
                  <span className="text-xs font-semibold text-gray-500 hidden sm:inline">
                    {boards.length} tahta
                  </span>
                  <motion.div
                    animate={{ rotate: expandedSection === 'boards' ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </div>
              </button>

              {/* Expandable Content */}
              <AnimatePresence>
                {expandedSection === 'boards' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden border-t border-gray-100 bg-[#F8FAFC]/50"
                  >
                    <div className="p-4 space-y-3">
                      {/* Active Board Card */}
                      <div className="p-3.5 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900 truncate">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">
                              {activeBoard?.name || `${selectedClass.code} Ana Ders Tahtası`}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500 block mt-0.5">
                            {isBoardConnected
                              ? `Bağlı Cihaz: ${pairedBoard?.deviceName || 'Akıllı Tahta'}`
                              : 'İnteraktif çizim ve ders sunumu için hazır'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const boardUuid = activeBoard?.board_uuid || 'board_6be7ebed-4c00-4243-9a9b-ffef9933803b'
                              window.open(`/board/${boardUuid}`, '_blank')
                            }}
                            className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <span>Tahtayı Aç</span>
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <Link
                          href="/dash/boards?new=true"
                          className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 py-1"
                        >
                          <Plus size={14} />
                          <span>Yeni Tahta Oluştur</span>
                        </Link>

                        <Link
                          href="/dash/boards"
                          className="font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 py-1"
                        >
                          <span>Tüm Tahtaları Gör</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. VERİLEN ÖDEVLER */}
            <div className="bg-white border border-[#E5E7EB] hover:border-gray-300 rounded-2xl transition-all shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'assignments' ? null : 'assignments')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                    <BookOpenCheck size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#111827]">Verilen Ödevler</h3>
                    <p className="text-xs text-[#64748B] truncate mt-0.5">
                      {activeAssignmentsCount} aktif · {dueTodayCount > 0 ? `${dueTodayCount} bugün teslim` : 'Teslimler sürüyor'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[#64748B]">
                  <Link
                    href="/dash/assignments"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-semibold text-indigo-700 hover:underline hidden sm:inline"
                  >
                    Ödevlere Git
                  </Link>
                  <motion.div
                    animate={{ rotate: expandedSection === 'assignments' ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </div>
              </button>

              {/* Expandable Assignment List */}
              <AnimatePresence>
                {expandedSection === 'assignments' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden border-t border-gray-100 bg-[#F8FAFC]/50"
                  >
                    <div className="p-4 space-y-2.5">
                      {assignments.slice(0, 3).map((asg) => (
                        <div
                          key={asg.id}
                          onClick={() => router.push('/dash/assignments')}
                          className="p-3 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between gap-2 cursor-pointer hover:border-gray-300 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
                                {asg.subject}
                              </span>
                              <span className="text-xs font-bold text-gray-900 truncate">
                                {asg.title}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                              <Clock size={11} />
                              Son Teslim: {formatDueDate(asg.due_date)}
                            </span>
                          </div>

                          <ChevronRight size={15} className="text-gray-400 shrink-0" />
                        </div>
                      ))}

                      <div className="pt-1 flex justify-end">
                        <Link
                          href="/dash/assignments"
                          className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 py-1"
                        >
                          <span>Tüm Ödevleri İncele</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. SINIFLAR */}
            <Link
              href="/dash/classrooms"
              className="p-4 bg-white border border-[#E5E7EB] hover:border-gray-300 rounded-2xl flex items-center justify-between transition-all shadow-xs cursor-pointer active:scale-[0.99] group block"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Users size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#111827]">Sınıflar & Şubeler</h3>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="text-xs text-[#64748B]">
                      {siblingClassrooms.length} şube aktif:
                    </span>
                    {siblingClassrooms.map((cls) => (
                      <span
                        key={cls.id}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          cls.code === selectedClass.code
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {cls.code} ({cls.student_count || 24})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <ChevronRight
                size={18}
                className="text-[#64748B] group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </Link>

            {/* 4. KAYNAKLAR */}
            <Link
              href="/dash/library"
              className="p-4 bg-white border border-[#E5E7EB] hover:border-gray-300 rounded-2xl flex items-center justify-between transition-all shadow-xs cursor-pointer active:scale-[0.99] group block"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <FolderOpen size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#111827]">Kaynaklar & Arşiv</h3>
                  <p className="text-xs text-[#64748B] truncate mt-0.5">
                    Ders içerikleri, çalışma kağıtları, etkinlikler
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                  124 kaynak
                </span>
                <ChevronRight
                  size={18}
                  className="text-[#64748B] group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </div>
            </Link>

            {/* 5. MODÜLLER & HIZLI ARAÇLAR */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    <LayoutGrid size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">Eğitim Modülleri</h3>
                    <p className="text-[11px] text-[#64748B]">Hızlı araçlar ve modül başlatıcılar</p>
                  </div>
                </div>
              </div>

              {/* Interactive App Modules Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                <Link
                  href="/dash/students"
                  className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-gray-100 border border-gray-100 flex items-center gap-2.5 transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                    📋
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-900 block truncate">Yoklama</span>
                    <span className="text-[10px] text-gray-500 block truncate">Devamsızlık</span>
                  </div>
                </Link>

                <Link
                  href="/dash/boards"
                  className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-gray-100 border border-gray-100 flex items-center gap-2.5 transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-bold">
                    🖊️
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-900 block truncate">Akıllı Tahta</span>
                    <span className="text-[10px] text-gray-500 block truncate">İnteraktif Tuval</span>
                  </div>
                </Link>

                <Link
                  href="/dash/assignments"
                  className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-gray-100 border border-gray-100 flex items-center gap-2.5 transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                    📚
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-900 block truncate">Ödevler</span>
                    <span className="text-[10px] text-gray-500 block truncate">Değerlendirme</span>
                  </div>
                </Link>

                <Link
                  href="/games"
                  className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-gray-100 border border-gray-100 flex items-center gap-2.5 transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center text-xs font-bold">
                    🎮
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-900 block truncate">Zeka Oyunları</span>
                    <span className="text-[10px] text-gray-500 block truncate">Atölye</span>
                  </div>
                </Link>

                <Link
                  href="/pano"
                  className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-gray-100 border border-gray-100 flex items-center gap-2.5 transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center text-xs font-bold">
                    🖥️
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-900 block truncate">Pano Modu</span>
                    <span className="text-[10px] text-gray-500 block truncate">Tahta Ekranı</span>
                  </div>
                </Link>

                <Link
                  href="/dash/org/settings/general"
                  className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-gray-100 border border-gray-100 flex items-center gap-2.5 transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <span className="w-7 h-7 rounded-lg bg-gray-200 text-gray-800 flex items-center justify-center text-xs font-bold">
                    ⚙️
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-900 block truncate">Ayarlar</span>
                    <span className="text-[10px] text-gray-500 block truncate">Okul Yönetimi</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. "TAHTAYA BAĞLAN" CTA BUTONU (Primary Tactile Action) ── */}
        <section className="pt-2">
          <button
            type="button"
            onClick={() => setIsConnectModalOpen(true)}
            className="w-full p-4 sm:p-5 rounded-3xl bg-gray-900 hover:bg-black text-white flex items-center justify-between gap-4 shadow-md active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0 text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <QrCode size={24} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Tahtaya Bağlan
                  </h3>
                  {isBoardConnected && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white">
                      Aktif Bağlantı
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-300/90 truncate mt-0.5">
                  Akıllı tahtaya QR kod veya 6 haneli kod ile anında bağlanın
                </p>
              </div>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
              <ArrowUpRight size={18} className="text-white" />
            </div>
          </button>
        </section>

        {/* ── 5. OTURUMU KAPAT (Subtle Bottom Action) ── */}
        <footer className="pt-4 pb-6 flex flex-col items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-rose-600 active:text-rose-700 transition-colors cursor-pointer rounded-xl hover:bg-gray-50"
          >
            <LogOut size={14} />
            <span>Oturumu Kapat</span>
          </button>
          <span className="text-[10px] text-gray-400">
            Oxonom EDU v2.0 • Mobil ve Web Çalışma Alanı
          </span>
        </footer>
      </main>

      {/* ── NATIVE BOTTOM SHEET / MODAL BİLEŞENLERİ ── */}
      <ClassSelectorSheet
        isOpen={isClassSheetOpen}
        onClose={() => setIsClassSheetOpen(false)}
        classrooms={ALL_CLASSROOMS}
        selectedClass={selectedClass}
        onSelect={handleSelectClass}
      />

      <ConnectBoardModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </div>
  )
}
