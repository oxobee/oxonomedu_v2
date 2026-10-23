'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Megaphone,
  Send,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  Pin,
  Sparkles,
  Search,
  Plus,
  ShieldCheck,
  GraduationCap,
  AlertTriangle,
  Flame,
  Info,
  X,
  Building,
  Check,
  UserCheck,
  Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  resolveAnnouncementVariables,
  saveSynchronizedStudentAnnouncement,
} from '@/lib/student/studentData'
import { ALL_CLASSROOMS, getSingleSourceOfTruthStudents } from '@services/demo/schoolDirectory'

export interface TeacherAnnouncement {
  id: string
  title: string
  content: string
  author: string
  authorRole: string
  date: string
  priority?: 'low' | 'normal' | 'important' | 'emergency'
  targetType?: 'all' | 'classes' | 'students'
  targetSummary?: string
  isPinned?: boolean
  category?: 'academic' | 'administrative' | 'activity' | 'guidance'
}

const DEFAULT_TEACHER_ANNOUNCEMENTS: TeacherAnnouncement[] = [
  {
    id: 'ann-t-1',
    title: 'Öğretmenler Kurulu ve 1. Dönem Zümre Değerlendirmesi',
    content:
      'Değerli Öğretmenlerimiz; Ara sınav öncesi soru hazırlama ve kazanım değerlendirme toplantısı yarın saat 16:30\'da Öğretmenler Odasında yapılacaktır. Taslak kazanım formlarıyla katılım rica olunur.',
    author: 'Kemal SOYSAL',
    authorRole: 'Okul Müdürü',
    date: 'Bugün, 09:30',
    priority: 'important',
    targetType: 'all',
    targetSummary: 'Tüm Öğretmenler & Personel',
    isPinned: true,
    category: 'administrative',
  },
  {
    id: 'ann-t-2',
    title: '1/A Şubesi Dönem Ortası Akademik Başarı ve Uyum Tebrik Bildirimi',
    content:
      '1/A şubemiz Türkçe, Matematik ve Hayat Bilgisi derslerindeki üstün performansıyla okulumuzun birinci şubesi olarak devam etmektedir. Sınıf öğretmenimiz ve öğrencilerimizi tebrik eder, başarılarının devamını dilerim.',
    author: 'Kemal SOYSAL',
    authorRole: 'Okul Müdürü',
    date: 'Dün, 14:20',
    priority: 'normal',
    targetType: 'classes',
    targetSummary: '1/A Şubesi',
    isPinned: false,
    category: 'academic',
  },
  {
    id: 'ann-t-3',
    title: 'MEB Yeni Maarif Modeli Dijital Föyleri ve Akıllı Tahta Güncellemesi',
    content:
      'Dersliklerimizde bulunan akıllı tahtalar ve mobil uygulamaya yeni çalışma föyleri ve ders kitapları yüklenmiştir. Derslerinizde güvenle kullanabilirsiniz.',
    author: 'Oxonom Bilim Koordinatörlüğü',
    authorRole: 'Akademik Koordinatörlük',
    date: '11 Ekim 2026',
    priority: 'normal',
    targetType: 'all',
    targetSummary: 'Tüm Sınıflar (1/A - 8/D)',
    isPinned: false,
    category: 'academic',
  },
]

export default function TeacherCommunicationView() {
  const [announcements, setAnnouncements] = useState<TeacherAnnouncement[]>(DEFAULT_TEACHER_ANNOUNCEMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'administrative' | 'classes' | 'urgent'>('all')

  // Modal State
  const [showNewModal, setShowNewModal] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formPriority, setFormPriority] = useState<'normal' | 'important' | 'emergency'>('normal')
  const [formTargetType, setFormTargetType] = useState<'all' | 'classes' | 'students'>('classes')
  const [selectedClassCodes, setSelectedClassCodes] = useState<string[]>(['1/A'])
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [studentSearch, setStudentSearch] = useState('')

  // Roster of students for person selection
  const allStudents = useMemo(() => {
    return getSingleSourceOfTruthStudents(40)
  }, [])

  const filteredModalStudents = useMemo(() => {
    if (!studentSearch.trim()) return allStudents.slice(0, 10)
    const q = studentSearch.toLowerCase()
    return allStudents.filter(
      (s) => s.name.toLowerCase().includes(q) || s.studentNo.includes(q) || s.className?.toLowerCase().includes(q)
    )
  }, [allStudents, studentSearch])

  const syncTeacherAnnouncements = () => {
    try {
      const raw = localStorage.getItem('oxonom_teacher_announcements')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const resolved = parsed.map((item: any) => ({
            ...item,
            title: resolveAnnouncementVariables(item.title || ''),
            content: resolveAnnouncementVariables(item.content || ''),
          }))
          setAnnouncements(resolved)
          return
        }
      }
    } catch (_) {}
    setAnnouncements(DEFAULT_TEACHER_ANNOUNCEMENTS)
  }

  useEffect(() => {
    syncTeacherAnnouncements()
    window.addEventListener('oxonom_teacher_announcements_updated', syncTeacherAnnouncements)
    window.addEventListener('storage', syncTeacherAnnouncements)
    return () => {
      window.removeEventListener('oxonom_teacher_announcements_updated', syncTeacherAnnouncements)
      window.removeEventListener('storage', syncTeacherAnnouncements)
    }
  }, [])

  const handleToggleClass = (code: string) => {
    if (selectedClassCodes.includes(code)) {
      if (selectedClassCodes.length > 1) {
        setSelectedClassCodes(selectedClassCodes.filter((c) => c !== code))
      }
    } else {
      setSelectedClassCodes([...selectedClassCodes, code])
    }
  }

  const handleToggleStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((sId) => sId !== id))
    } else {
      setSelectedStudentIds([...selectedStudentIds, id])
    }
  }

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error('Lütfen başlık ve metin giriniz.')
      return
    }

    let targetSummaryText = 'Tüm Okul'
    if (formTargetType === 'classes') {
      targetSummaryText = `${selectedClassCodes.join(', ')} Şubeleri`
    } else if (formTargetType === 'students') {
      const names = allStudents
        .filter((s) => selectedStudentIds.includes(s.id))
        .map((s) => s.name)
      targetSummaryText = names.length > 0 ? names.join(', ') : 'Seçili Öğrenciler'
    }

    const resolvedTitle = resolveAnnouncementVariables(formTitle.trim())
    const resolvedContent = resolveAnnouncementVariables(formContent.trim())

    const newAnn: TeacherAnnouncement = {
      id: `ann-t-${Date.now()}`,
      title: resolvedTitle,
      content: resolvedContent,
      author: 'Bahar ÇETİN',
      authorRole: '1/A Sınıf Öğretmeni',
      date: 'Bugün, ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      priority: formPriority,
      targetType: formTargetType,
      targetSummary: targetSummaryText,
      isPinned: formPriority === 'emergency',
      category: 'academic',
    }

    const updated = [newAnn, ...announcements]
    setAnnouncements(updated)
    try {
      localStorage.setItem('oxonom_teacher_announcements', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('oxonom_teacher_announcements_updated'))
    } catch (_) {}

    // Also sync to Student Portal
    try {
      saveSynchronizedStudentAnnouncement({
        id: `ann-s-${Date.now()}`,
        title: resolvedTitle,
        author: 'Bahar ÇETİN',
        authorRole: '1/A Sınıf Öğretmeni',
        date: 'Bugün, ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        category: formPriority === 'emergency' ? 'emergency' : 'general',
        priority: formPriority,
        content: resolvedContent,
        isPinned: formPriority === 'emergency',
      })
    } catch (_) {}

    toast.success('Duyurunuz hedef kitleye başarıyla iletildi!')
    setFormTitle('')
    setFormContent('')
    setFormPriority('normal')
    setShowNewModal(false)
  }

  // Filtered List
  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      // Tab filter
      if (activeTab === 'administrative' && a.category !== 'administrative') return false
      if (activeTab === 'classes' && a.targetType !== 'classes' && a.targetType !== 'students') return false
      if (activeTab === 'urgent' && a.priority !== 'important' && a.priority !== 'emergency') return false

      // Search filter
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        (a.targetSummary && a.targetSummary.toLowerCase().includes(q))
      )
    })
  }, [announcements, activeTab, searchQuery])

  // Stats
  const urgentCount = announcements.filter((a) => a.priority === 'emergency' || a.priority === 'important').length
  const classCount = announcements.filter((a) => a.targetType === 'classes' || a.targetType === 'students').length

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-jakarta">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0D8FA] dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB] text-xs font-black mb-2 border border-[#8D49A6]/20">
            <Megaphone size={14} />
            <span>İletişim & Duyuru Merkezi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Okul İçi Duyurular & Bilgilendirmeler
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Okul müdürlüğünden gelen idari duyurular, zümre kararları, şube duyuruları ve veli bilgilendirmeleri.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs shadow-md shadow-purple-950/20 transition-all cursor-pointer self-start sm:self-center active:scale-95"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>+ Yeni Duyuru Yayınla</span>
        </button>
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Toplam Duyuru</div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">
            {announcements.length}
          </div>
          <span className="text-[10px] text-gray-500">Yayında aktif</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Sınıf & Öğrenci</div>
          <div className="text-xl sm:text-2xl font-black text-[#4B075F] dark:text-[#C58ADB] mt-1">
            {classCount}
          </div>
          <span className="text-[10px] text-[#8D49A6]">Öğrenciye iletilen</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Önemli & Acil</div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {urgentCount}
          </div>
          <span className="text-[10px] text-amber-500 font-bold">Yüksek öncelikli</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Okul Yönetimi</div>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {announcements.filter((a) => a.category === 'administrative').length}
          </div>
          <span className="text-[10px] text-indigo-500">Müdürlük bildirimleri</span>
        </div>
      </div>

      {/* ── FILTER TABS & SEARCH BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white dark:bg-[#121826] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Tüm Duyurular ({announcements.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('classes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'classes'
                ? 'bg-white dark:bg-[#121826] text-[#4B075F] dark:text-[#C58ADB] shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Sınıf & Öğrenci Duyuruları
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('administrative')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'administrative'
                ? 'bg-white dark:bg-[#121826] text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            İdari & Müdürlük
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('urgent')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'urgent'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Önemli & Acil ({urgentCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Duyurularda ara..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#8D49A6]"
          />
        </div>
      </div>

      {/* ── ANNOUNCEMENTS LIST ── */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((ann) => {
            let priorityBadge = null
            if (ann.priority === 'emergency') {
              priorityBadge = (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                  <Flame size={12} className="text-rose-500" />
                  <span>Acil / Kritik</span>
                </span>
              )
            } else if (ann.priority === 'important') {
              priorityBadge = (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle size={12} className="text-amber-500" />
                  <span>Önemli</span>
                </span>
              )
            } else {
              priorityBadge = (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span>Normal</span>
                </span>
              )
            }

            return (
              <div
                key={ann.id}
                className={`p-6 rounded-3xl bg-white dark:bg-[#121826] border transition-all shadow-xs space-y-3 ${
                  ann.priority === 'emergency'
                    ? 'border-rose-400/80 dark:border-rose-800/80 bg-rose-50/10'
                    : ann.isPinned
                    ? 'border-[#8D49A6]/40 ring-1 ring-[#8D49A6]/20'
                    : 'border-gray-200/80 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                {/* Top Row: Author, Role, Target & Priority */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-gradient text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      {ann.author.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{ann.author}</span>
                        {ann.isPinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4B075F] dark:text-[#C58ADB] bg-[#F0D8FA] dark:bg-[#2D2035] px-2 py-0.2 rounded-md">
                            <Pin size={10} />
                            <span>Sabit Duyuru</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                        <span>{ann.authorRole}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {ann.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Target Badge */}
                    {ann.targetSummary && (
                      <span className="text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                        <Users size={11} />
                        <span>{ann.targetSummary}</span>
                      </span>
                    )}

                    {/* Urgency Badge */}
                    {priorityBadge}
                  </div>
                </div>

                {/* Content */}
                <div className="pt-1">
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {ann.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-1.5 whitespace-pre-line">
                    {ann.content}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 text-xs text-gray-400">
            Filtreye uygun duyuru bulunamadı.
          </div>
        )}
      </div>

      {/* ── MODAL: YENİ DUYURU YAYINLA (DETAYLI & ÇOKLU HEDEF SEÇİMLİ) ── */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0E1526] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-brand-gradient text-white flex items-center justify-center shrink-0">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    Yeni Duyuru & Bildirim Yayınla
                  </h3>
                  <p className="text-xs text-gray-400">
                    Sınıf(lar) veya belirli öğrenci(ler) seçerek hedefli duyuru oluşturun.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAnnouncement} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* 1. Hedef Kitle Türü */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-gray-900 dark:text-white block">
                  1. Hedef Kitle Seçimi:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormTargetType('classes')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      formTargetType === 'classes'
                        ? 'bg-[#F0D8FA] dark:bg-[#2D2035] border-[#8D49A6] text-[#4B075F] dark:text-[#C58ADB] font-black ring-1 ring-[#8D49A6]'
                        : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Building size={14} />
                      <span>Sınıf / Şube</span>
                    </div>
                    <span className="text-[10px] opacity-70 block mt-0.5">Bir veya birden fazla sınıf</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTargetType('students')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      formTargetType === 'students'
                        ? 'bg-[#F0D8FA] dark:bg-[#2D2035] border-[#8D49A6] text-[#4B075F] dark:text-[#C58ADB] font-black ring-1 ring-[#8D49A6]'
                        : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <UserCheck size={14} />
                      <span>Kişi / Öğrenci</span>
                    </div>
                    <span className="text-[10px] opacity-70 block mt-0.5">Özel öğrenci seçimi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTargetType('all')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      formTargetType === 'all'
                        ? 'bg-[#F0D8FA] dark:bg-[#2D2035] border-[#8D49A6] text-[#4B075F] dark:text-[#C58ADB] font-black ring-1 ring-[#8D49A6]'
                        : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Users size={14} />
                      <span>Tüm Okul</span>
                    </div>
                    <span className="text-[10px] opacity-70 block mt-0.5">Tüm öğretmen & veliler</span>
                  </button>
                </div>
              </div>

              {/* Sınıf Çoklu Seçim Alanı */}
              {formTargetType === 'classes' && (
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">
                      Hedef Sınıfları Seçiniz (Birden fazla seçilebilir):
                    </span>
                    <span className="text-[10px] text-brand-purple font-bold">
                      {selectedClassCodes.length} Sınıf Seçildi
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {ALL_CLASSROOMS.map((cls) => {
                      const isSelected = selectedClassCodes.includes(cls.code)
                      return (
                        <button
                          key={cls.code}
                          type="button"
                          onClick={() => handleToggleClass(cls.code)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'bg-[#4B075F] text-white shadow-xs'
                              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {cls.code}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Öğrenci Çoklu Seçim Alanı */}
              {formTargetType === 'students' && (
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">
                      Hedef Öğrenciyi / Öğrencileri Seçiniz:
                    </span>
                    <span className="text-[10px] text-brand-purple font-bold">
                      {selectedStudentIds.length} Öğrenci Seçildi
                    </span>
                  </div>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Öğrenci adı veya numarasıyla ara..."
                    className="w-full h-8 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs"
                  />
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {filteredModalStudents.map((st) => {
                      const isSelected = selectedStudentIds.includes(st.id)
                      return (
                        <div
                          key={st.id}
                          onClick={() => handleToggleStudent(st.id)}
                          className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-900 dark:text-purple-200 font-bold'
                              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{st.name}</span>
                            <span className="text-[10px] text-gray-400">({st.className || '1/A'} · No: {st.studentNo})</span>
                          </div>
                          {isSelected && <Check size={14} className="text-[#4B075F] dark:text-[#C58ADB]" />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 2. Aciliyet / Öncelik Seçimi */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-gray-900 dark:text-white block">
                  2. Konu Aciliyeti & Öncelik Düzeyi:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormPriority('normal')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      formPriority === 'normal'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-black ring-1 ring-emerald-500'
                        : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <CheckCircle2 size={15} className="text-emerald-500" />
                    <div>
                      <span className="block font-bold">Normal</span>
                      <span className="text-[9.5px] opacity-70 block">Standart bildirim</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormPriority('important')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      formPriority === 'important'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-black ring-1 ring-amber-500'
                        : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <AlertTriangle size={15} className="text-amber-500" />
                    <div>
                      <span className="block font-bold">Önemli</span>
                      <span className="text-[9.5px] opacity-70 block">Dikkat gerektiren</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormPriority('emergency')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      formPriority === 'emergency'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 font-black ring-1 ring-rose-500'
                        : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Flame size={15} className="text-rose-500" />
                    <div>
                      <span className="block font-bold">Acil / Kritik</span>
                      <span className="text-[9.5px] opacity-70 block">Üstte sabitlenir</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Başlık */}
              <div className="space-y-1">
                <label className="font-extrabold text-gray-900 dark:text-white block">
                  3. Duyuru Başlığı:
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Örn: 1. Dönem Matematik Föyleri ve Proje Teslimleri Hakkında"
                  className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-bold"
                />
              </div>

              {/* 4. Metin */}
              <div className="space-y-1">
                <label className="font-extrabold text-gray-900 dark:text-white block">
                  4. Duyuru İçeriği & Detaylar:
                </label>
                <textarea
                  rows={4}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Duyuru içeriğini, öğrenci ve velilere iletilecek mesajı yazınız..."
                  className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white leading-relaxed font-medium"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-black cursor-pointer transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>Duyuruyu Yayınla</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
