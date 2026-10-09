'use client'

import React, { useMemo, useState } from 'react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import { Breadcrumbs } from '@components/Objects/Breadcrumbs/Breadcrumbs'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Layers,
  Loader2,
  PenTool,
  Plus,
  Search,
  Sparkles,
  Users,
  ChevronDown,
  Check,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'next/navigation'
import { getUserGroups } from '@services/usergroups/usergroups'
import { getBoards } from '@services/boards/boards'
import { asArray } from '@services/utils/ts/requests'
import { ALL_CLASSROOMS } from '@services/demo/schoolDirectory'
import {
  getSchoolAssignments,
  getStudentAssignments,
  formatDueDate,
  SchoolAssignmentItem,
} from '@services/school_assignments/school_assignments'
import CreateSchoolAssignmentModal from '@components/Dashboard/Assignments/CreateSchoolAssignmentModal'
import DoAssignmentModal from '@components/Dashboard/Assignments/DoAssignmentModal'
import AssignmentSubmissionsModal from '@components/Dashboard/Assignments/AssignmentSubmissionsModal'

export default function SchoolAssignmentsPage() {
  const { t } = useTranslation()
  const session = useLHSession() as any
  const org = useOrg() as any
  const queryClient = useQueryClient()
  const access_token = session?.data?.tokens?.access_token
  const user = session?.data?.user
  const searchParams = useSearchParams()
  const usergroupIdParam = searchParams?.get('usergroupId')

  // Check if current user is student
  const isActualStudent =
    user?.email?.toLowerCase().includes('ogrenci') ||
    user?.roles?.some((r: any) => r.role === 'Student' || r.role === 'Learner')

  // View mode toggle (teachers can switch between management & student preview)
  const [viewMode, setViewMode] = useState<'teacher' | 'student'>(isActualStudent ? 'student' : 'teacher')

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isClassModalOpen, setIsClassModalOpen] = useState(false)
  const [classSearchQuery, setClassSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedAssignmentForDo, setSelectedAssignmentForDo] = useState<SchoolAssignmentItem | null>(null)
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState<SchoolAssignmentItem | null>(null)

  // Filters state - initialize from query param if available
  const [selectedUsergroupId, setSelectedUsergroupId] = useState<number | null>(() =>
    usergroupIdParam ? Number(usergroupIdParam) : null
  )

  React.useEffect(() => {
    if (usergroupIdParam) {
      setSelectedUsergroupId(Number(usergroupIdParam))
    }
  }, [usergroupIdParam])

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedToolType, setSelectedToolType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Student specific filter tab
  const [studentTab, setStudentTab] = useState<'pending' | 'submitted' | 'graded'>('pending')

  // 1. Fetch classrooms
  const { data: rawUserGroups } = useQuery({
    queryKey: ['org-classrooms', org?.id],
    queryFn: () => getUserGroups(org?.id, access_token),
    enabled: !!(org?.id && access_token),
  })
  const classrooms = useMemo(() => {
    const list = asArray<any>(rawUserGroups?.data || rawUserGroups)
    if (list && list.length > 0) return list
    return ALL_CLASSROOMS
  }, [rawUserGroups])

  // 2. Fetch boards
  const { data: rawBoards } = useQuery({
    queryKey: ['org-boards', org?.id],
    queryFn: () => getBoards(org?.id, access_token),
    enabled: !!(org?.id && access_token),
  })
  const boards = asArray<any>((rawBoards as any)?.data || rawBoards)

  // 3. Fetch school assignments (Teacher view)
  const {
    data: assignments = [],
    isLoading: isLoadingAssignments,
    refetch: refetchAssignments,
  } = useQuery({
    queryKey: [
      'school-assignments',
      org?.id,
      selectedUsergroupId,
      selectedCategory,
      selectedGradeLevel,
      selectedSubject,
      selectedToolType,
    ],
    queryFn: () =>
      getSchoolAssignments(
        org?.id,
        {
          usergroup_id: selectedUsergroupId,
          grade_category: selectedCategory,
          grade_level: selectedGradeLevel,
          subject: selectedSubject,
          tool_type: selectedToolType,
        },
        access_token
      ),
    enabled: !!(org?.id && access_token && viewMode === 'teacher'),
  })

  // 4. Fetch student assignments (Student view)
  const {
    data: studentAssignments = [],
    isLoading: isLoadingStudentAssignments,
    refetch: refetchStudentAssignments,
  } = useQuery({
    queryKey: ['student-school-assignments', org?.id, selectedUsergroupId],
    queryFn: () => getStudentAssignments(org?.id, access_token, selectedUsergroupId),
    enabled: !!(org?.id && access_token && viewMode === 'student'),
  })

  // Listen to live assignments updates across tabs/modals
  React.useEffect(() => {
    const handleUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['school-assignments'] })
      queryClient.invalidateQueries({ queryKey: ['student-school-assignments'] })
      refetchAssignments()
      refetchStudentAssignments()
    }
    window.addEventListener('oxonom_assignments_updated', handleUpdated)
    return () => window.removeEventListener('oxonom_assignments_updated', handleUpdated)
  }, [queryClient, refetchAssignments, refetchStudentAssignments])

  // Filtered teacher assignments with search
  const filteredTeacherAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        a.title.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q)
      )
    })
  }, [assignments, searchQuery])

  // Filtered student assignments by tab
  const filteredStudentAssignments = useMemo(() => {
    return studentAssignments.filter((a) => {
      const status = a.submission?.status || 'PENDING'
      if (studentTab === 'pending') return status === 'PENDING'
      if (studentTab === 'submitted') return status === 'SUBMITTED' || status === 'LATE'
      if (studentTab === 'graded') return status === 'GRADED'
      return true
    })
  }, [studentAssignments, studentTab])

  // Listen for assignment submission events to reload immediately
  React.useEffect(() => {
    const handleUpdate = () => {
      refetchAssignments()
      refetchStudentAssignments()
    }
    window.addEventListener('oxonom_assignments_updated', handleUpdate)
    return () => window.removeEventListener('oxonom_assignments_updated', handleUpdate)
  }, [refetchAssignments, refetchStudentAssignments])

  // Stats calculation
  const stats = useMemo(() => {
    const total = assignments.length
    const totalSubs = assignments.reduce((acc, a) => acc + (a.total_submissions || 0), 0)
    const gradedSubs = assignments.reduce((acc, a) => acc + (a.graded_submissions || 0), 0)
    const pendingSubs = Math.max(0, totalSubs - gradedSubs)
    return { total, totalSubs, gradedSubs, pendingSubs }
  }, [assignments])

  const renderToolBadge = (toolType: string) => {
    switch (toolType) {
      case 'WHITEBOARD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <PenTool size={12} /> Akıllı Tahta
          </span>
        )
      case 'WORKSHEET':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileText size={12} /> Çalışma Kağıdı
          </span>
        )
      case 'QUIZ':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <HelpCircle size={12} /> İnteraktif Test
          </span>
        )
      case 'READING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <BookOpen size={12} /> Okuma & Özet
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">
            <Layers size={12} /> Genel Görev
          </span>
        )
    }
  }

  return (
    <div className="flex w-full">
      <div className="px-4 sm:px-10 py-6 tracking-tighter flex flex-col space-y-6 w-full max-w-7xl mx-auto dash-stagger-items">
        {/* TOP BAR: Breadcrumbs, Title, View Switcher & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Breadcrumbs
              items={[{ label: 'Ödevler', href: '/dash/assignments', icon: <FileText size={14} /> }]}
            />
            <div className="pt-1">
              <h1 className="font-black text-2xl sm:text-3xl text-gray-900 tracking-tight">
                {viewMode === 'teacher' ? 'Okul & Sınıf Ev Ödevleri' : 'Ödevlerim & Ders Görevlerim'}
              </h1>
            </div>
            <p className="text-xs text-gray-500">
              {viewMode === 'teacher'
                ? 'Kademe, branş ve interaktif akıllı tahta bazında sınıf ödevlerini yönetin ve teslimleri inceleyin.'
                : 'Sınıfınız kapsamında verilen ödevleri görüntüleyin, akıllı tahtada çözün ve teslim edin.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {viewMode === 'teacher' && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl px-4 py-2.5 shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <Plus size={16} />
                <span>Yeni Ödev Ver</span>
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* TEACHER MANAGEMENT VIEW                                 */}
        {/* ======================================================== */}
        {viewMode === 'teacher' && (
          <>
            {/* STATS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-gray-400">Toplam Ödev</span>
                  <span className="text-xl font-black text-gray-900">{stats.total}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-gray-400">Toplam Teslim</span>
                  <span className="text-xl font-black text-blue-800">{stats.totalSubs}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-gray-400">İncelenecek</span>
                  <span className="text-xl font-black text-amber-800">{stats.pendingSubs}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-gray-400">Değerlendirildi</span>
                  <span className="text-xl font-black text-emerald-800">{stats.gradedSubs}</span>
                </div>
              </div>
            </div>

            {/* ACTION & FILTERS TOOLBAR */}
            <div className="flex flex-col gap-3">
              <div className="bg-white p-3 rounded-2xl border border-gray-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Sınıfsal Kategoriler & Şubeler Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsClassModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 shadow-2xs"
                  >
                    <Users size={15} className="text-indigo-600" />
                    <span>Sınıfsal Kategoriler & Şubeler</span>
                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                      {selectedUsergroupId
                        ? (classrooms.find((c) => c.id === selectedUsergroupId)?.name || 'Seçildi')
                        : 'Tüm Sınıflar'}
                    </span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {/* Filtrele Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isFilterOpen || selectedCategory !== 'all' || selectedSubject !== 'all' || selectedToolType !== 'all'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Filter size={15} className={isFilterOpen ? 'text-indigo-600' : 'text-slate-500'} />
                    <span>Filtrele</span>
                    {(selectedCategory !== 'all' || selectedSubject !== 'all' || selectedToolType !== 'all') && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">
                        {(selectedCategory !== 'all' ? 1 : 0) +
                          (selectedSubject !== 'all' ? 1 : 0) +
                          (selectedToolType !== 'all' ? 1 : 0)}
                      </span>
                    )}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {(selectedCategory !== 'all' ||
                    selectedSubject !== 'all' ||
                    selectedToolType !== 'all' ||
                    selectedUsergroupId !== null) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('all')
                        setSelectedSubject('all')
                        setSelectedToolType('all')
                        setSelectedUsergroupId(null)
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 transition-colors cursor-pointer"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>

                {/* Search */}
                <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ödev başlığı veya konu ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Açılır Filtre Paneli (Tüm kademeler, branşlar, ödev araçları) */}
              {isFilterOpen && (
                <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-wrap items-center gap-4 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                    {/* Kademe */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kademe</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none hover:bg-slate-100"
                      >
                        <option value="all">Tüm Kademeler (1-12)</option>
                        <option value="İlkokul (1-4)">İlkokul (1-4)</option>
                        <option value="Ortaokul (5-8)">Ortaokul (5-8)</option>
                        <option value="Lise (9-12)">Lise (9-12)</option>
                      </select>
                    </div>

                    {/* Branş / Ders */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Branş / Ders</label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none hover:bg-slate-100"
                      >
                        <option value="all">Tüm Branşlar / Dersler</option>
                        <option value="Matematik">Matematik</option>
                        <option value="Fizik">Fizik</option>
                        <option value="Kimya">Kimya</option>
                        <option value="Biyoloji">Biyoloji</option>
                        <option value="Türk Dili ve Edebiyatı">Edebiyat</option>
                        <option value="Türkçe">Türkçe</option>
                        <option value="Tarih">Tarih</option>
                        <option value="Coğrafya">Coğrafya</option>
                        <option value="İngilizce">İngilizce</option>
                      </select>
                    </div>

                    {/* Ödev Aracı */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ödev Aracı</label>
                      <select
                        value={selectedToolType}
                        onChange={(e) => setSelectedToolType(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none hover:bg-slate-100"
                      >
                        <option value="all">Tüm Ödev Araçları</option>
                        <option value="WHITEBOARD">🎨 İnteraktif Akıllı Tahta</option>
                        <option value="WORKSHEET">📝 Çalışma Kağıdı / Dosya</option>
                        <option value="QUIZ">🧪 İnteraktif Test</option>
                        <option value="READING">📖 Okuma & Özet</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SINIFSAL KATEGORİLER & ŞUBELER SEÇİM PENCERESİ */}
            <Dialog open={isClassModalOpen} onOpenChange={setIsClassModalOpen}>
              <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-6 rounded-3xl bg-white shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span>Sınıfsal Kategoriler & Şubeler</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Ödevleri filtrelemek veya incelemek istediğiniz sınıf / şubeyi seçin.
                  </DialogDescription>
                </DialogHeader>

                <div className="relative my-3">
                  <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Şube veya sınıf adı ara..."
                    value={classSearchQuery}
                    onChange={(e) => setClassSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
                  {/* Tüm Sınıflar Option */}
                  <div
                    onClick={() => {
                      setSelectedUsergroupId(null)
                      setIsClassModalOpen(false)
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedUsergroupId === null
                        ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          selectedUsergroupId === null ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Layers size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">Tüm Sınıflar ve Şubeler</h4>
                        <p className="text-[11px] text-slate-500">Filtreleme yapmadan tüm okul ödevlerini gösterir</p>
                      </div>
                    </div>
                    {selectedUsergroupId === null && <Check size={18} className="text-indigo-600" />}
                  </div>

                  {/* Classes List */}
                  {classrooms
                    .filter(
                      (c) =>
                        c.name?.toLowerCase().includes(classSearchQuery.toLowerCase()) ||
                        c.invitation_code?.toLowerCase().includes(classSearchQuery.toLowerCase())
                    )
                    .map((c) => {
                      const isSelected = selectedUsergroupId === c.id
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedUsergroupId(c.id)
                            setIsClassModalOpen(false)
                          }}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900 shadow-xs'
                              : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Users size={16} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xs text-slate-900">{c.name}</h4>
                                {c.invitation_code && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                                    {c.invitation_code}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500">Şube / Sınıf Grubu</p>
                            </div>
                          </div>
                          {isSelected && <Check size={18} className="text-indigo-600" />}
                        </div>
                      )
                    })}
                </div>
              </DialogContent>
            </Dialog>

            {/* ASSIGNMENTS LIST (TEACHER CARDS) */}
            {isLoadingAssignments ? (
              <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 size={24} className="animate-spin text-indigo-600" />
                <span className="text-xs">Ödevler yükleniyor...</span>
              </div>
            ) : filteredTeacherAssignments.length === 0 ? (
              <div className="py-16 bg-white border border-gray-200 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <FileText size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Henüz Ödev Bulunmuyor</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Seçilen filtrelere uygun ödev bulunamadı. Yeni bir interaktif ödev tanımlayarak başlayabilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                >
                  <Plus size={14} /> Yeni Ödev Oluştur
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeacherAssignments.map((asg) => (
                  <div
                    key={asg.id}
                    onClick={() => setSelectedAssignmentForSubmissions(asg)}
                    className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition-all group space-y-4 cursor-pointer"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                          {asg.subject}
                        </span>
                        {renderToolBadge(asg.tool_type)}
                      </div>

                      <h3 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors leading-snug">
                        {asg.title}
                      </h3>

                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {asg.description || 'Açıklama belirtilmedi.'}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(asg.classes || []).map((c) => (
                          <span
                            key={c.id}
                            className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {asg.due_date ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 font-bold text-[11px] shadow-2xs">
                            <Clock size={12} className="text-amber-600 animate-pulse shrink-0" />
                            <span>Son Teslim:</span>
                            <span className="font-extrabold text-amber-950 font-mono">{formatDueDate(asg.due_date)}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-semibold">
                            Süresiz
                          </span>
                        )}
                        <span className="font-bold text-gray-800 text-[11px]">
                          {asg.total_submissions || 0} Teslim • {asg.graded_submissions || 0} Notlandı
                        </span>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedAssignmentForSubmissions(asg)
                          }}
                          className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors text-center cursor-pointer text-xs flex items-center justify-center gap-1.5"
                        >
                          <FileText size={14} />
                          <span>Teslimleri İncele ({asg.total_submissions || 0})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* STUDENT ASSIGNMENTS VIEW (ÖDEVLERİM)                      */}
        {/* ======================================================== */}
        {viewMode === 'student' && (
          <div className="space-y-5">
            {/* TABS: Yapılacaklar vs Teslim Edilenler vs Notlananlar */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStudentTab('pending')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    studentTab === 'pending'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Yapılacaklar / Bekleyenler (
                  {studentAssignments.filter((a) => (a.submission?.status || 'PENDING') === 'PENDING').length}
                  )
                </button>
                <button
                  type="button"
                  onClick={() => setStudentTab('submitted')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    studentTab === 'submitted'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Teslim Ettiklerim / İnceleniyor (
                  {studentAssignments.filter((a) => a.submission?.status === 'SUBMITTED' || a.submission?.status === 'LATE').length}
                  )
                </button>
                <button
                  type="button"
                  onClick={() => setStudentTab('graded')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    studentTab === 'graded'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tamamlananlar / Notlananlar (
                  {studentAssignments.filter((a) => a.submission?.status === 'GRADED').length}
                  )
                </button>
              </div>

              <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                Sınıfınıza atanmış ödevler listelenmektedir
              </span>
            </div>

            {isLoadingStudentAssignments ? (
              <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 size={24} className="animate-spin text-indigo-600" />
                <span className="text-xs">Ödevleriniz yükleniyor...</span>
              </div>
            ) : filteredStudentAssignments.length === 0 ? (
              <div className="py-16 bg-white border border-gray-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                <h3 className="font-bold text-gray-900 text-base">Bu Kategoride Ödev Bulunmuyor</h3>
                <p className="text-xs text-gray-500">
                  {studentTab === 'pending'
                    ? 'Harika! Yapılacak bekleyen ev ödeviniz bulunmuyor.'
                    : studentTab === 'submitted'
                    ? 'Şu anda öğretmen incelemesinde olan bir ödeviniz yok.'
                    : 'Henüz notlandırılmış bir ödeviniz bulunmuyor.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudentAssignments.map((asg) => {
                  const sub = asg.submission
                  const isGraded = sub?.status === 'GRADED'
                  const isLate = sub?.is_late || sub?.status === 'LATE'
                  const isSubmitted = sub?.status === 'SUBMITTED' || isLate

                  return (
                    <div
                      key={asg.id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                            {asg.subject}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {isLate && (
                              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Clock size={11} /> Geç Teslim
                              </span>
                            )}
                            {renderToolBadge(asg.tool_type)}
                          </div>
                        </div>

                        <h3 className="font-bold text-gray-900 text-sm leading-snug">{asg.title}</h3>

                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {asg.description}
                        </p>

                        {/* If graded, show grade pill */}
                        {isGraded && (
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                            <span className="font-bold text-emerald-950 flex items-center gap-1">
                              <GraduationCap size={14} className="text-emerald-600" />
                              Not:
                            </span>
                            <span className="text-emerald-700 font-black">
                              {sub?.score} / {asg.max_score} Puan
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                        {asg.due_date ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 font-bold text-[11px] shadow-2xs">
                            <Clock size={12} className="text-amber-600 animate-pulse shrink-0" />
                            <span>Son Teslim:</span>
                            <span className="font-extrabold text-amber-950 font-mono">{formatDueDate(asg.due_date)}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-500 font-medium">Süresiz</span>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedAssignmentForDo(asg)}
                          className={`px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer ${
                            isGraded
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : isSubmitted
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                          }`}
                        >
                          {isGraded ? 'Değerlendirmeyi Gör' : isSubmitted ? 'Teslimi İncele' : 'Ödevi Çöz'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE ASSIGNMENT MODAL (TEACHER) */}
      <CreateSchoolAssignmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['school-assignments'] })
          queryClient.invalidateQueries({ queryKey: ['student-school-assignments'] })
          queryClient.invalidateQueries({ queryKey: ['org-boards'] })
          refetchAssignments()
          refetchStudentAssignments()
        }}
        orgId={org?.id}
        accessToken={access_token}
        classrooms={classrooms}
        boards={boards}
      />

      {/* DO ASSIGNMENT MODAL (STUDENT SOLVER) */}
      <DoAssignmentModal
        isOpen={!!selectedAssignmentForDo}
        onClose={() => setSelectedAssignmentForDo(null)}
        onSuccess={() => {
          refetchStudentAssignments()
          refetchAssignments()
        }}
        assignment={selectedAssignmentForDo}
        accessToken={access_token}
      />

      {/* SUBMISSIONS REVIEW & GRADING MODAL (TEACHER) */}
      {selectedAssignmentForSubmissions && (
        <AssignmentSubmissionsModal
          isOpen={!!selectedAssignmentForSubmissions}
          onClose={() => setSelectedAssignmentForSubmissions(null)}
          assignment={selectedAssignmentForSubmissions}
          accessToken={access_token}
        />
      )}
    </div>
  )
}
