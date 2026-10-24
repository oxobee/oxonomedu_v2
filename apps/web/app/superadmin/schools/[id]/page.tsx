// apps/web/app/superadmin/schools/[id]/page.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  GraduationCap,
  Users,
  UserCheck,
  Briefcase,
  Layers,
  Award,
  Sparkles,
  ExternalLink,
  Calendar,
  KeyRound,
  FileText,
  Search,
  Filter,
  BarChart3,
  HardDrive,
  Cpu,
  History,
  Check,
  Plus,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  FolderSync,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import {
  SchoolDetail,
  getSchoolById,
  getAllSchools,
  saveAllSchools,
  normalizeSchool,
} from '@/lib/schools/schoolData'

export default function SuperadminSchoolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const schoolId = (params?.id as string) || ''

  const [school, setSchool] = useState<SchoolDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'leadership' | 'teachers' | 'students' | 'license' | 'logs'
  >('overview')

  // Search and filter states inside tabs
  const [teacherSearch, setTeacherSearch] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [studentGradeFilter, setStudentGradeFilter] = useState('all')

  useEffect(() => {
    if (!schoolId) return
    setIsLoading(true)
    const found = getSchoolById(schoolId)
    if (found) {
      setSchool(normalizeSchool(found))
    } else {
      // If not found in memory, try loading from all
      const all = getAllSchools()
      const fallback = all.find(
        (s) =>
          (s.id || '').toLowerCase() === schoolId.toLowerCase() ||
          (s.code || '').toLowerCase() === schoolId.toLowerCase()
      )
      setSchool(fallback ? normalizeSchool(fallback) : null)
    }
    setIsLoading(false)
  }, [schoolId])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-3 border-[#D914C8] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#A998B3]">Okul verileri ve istatistikleri yükleniyor...</p>
      </div>
    )
  }

  if (!school) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-6 bg-[#17101E] border border-[#2E1E3B] rounded-3xl mt-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Okul Bulunamadı</h2>
          <p className="text-sm text-[#A998B3]">
            İstenen okul ID ({schoolId}) ile eşleşen bir kayıt sistemde bulunamadı. Silinmiş veya kodu değişmiş olabilir.
          </p>
        </div>
        <Link
          href="/superadmin/schools"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white font-bold text-sm shadow-lg hover:brightness-110 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Okul Listesine Geri Dön</span>
        </Link>
      </div>
    )
  }

  // Filtered teachers
  const filteredTeachers = (school.teachers || []).filter(
    (t) =>
      (t.name || '').toLowerCase().includes(teacherSearch.toLowerCase()) ||
      (t.branch || '').toLowerCase().includes(teacherSearch.toLowerCase()) ||
      (t.classroom && t.classroom.toLowerCase().includes(teacherSearch.toLowerCase()))
  )

  // Filtered students
  const filteredStudents = (school.students || []).filter((s) => {
    if (studentGradeFilter !== 'all' && s.grade !== studentGradeFilter) return false
    if (!studentSearch.trim()) return true
    const q = studentSearch.toLowerCase()
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.studentNumber || '').includes(q) ||
      (s.parentName || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 pb-20 font-jakarta">
      <Toaster position="top-right" />

      {/* ── BREADCRUMB & TOP NAV ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#A998B3] flex-wrap">
          <Link
            href="/superadmin"
            className="hover:text-white transition-colors flex items-center gap-1 font-semibold"
          >
            Süper Admin
          </Link>
          <ChevronRight size={13} className="text-[#49364F]" />
          <Link
            href="/superadmin/schools"
            className="hover:text-white transition-colors flex items-center gap-1 font-semibold"
          >
            Okullar & Kurumlar
          </Link>
          <ChevronRight size={13} className="text-[#49364F]" />
          <span className="text-[#FCF9FD] font-bold truncate max-w-[240px]">
            {school.name}
          </span>
        </div>

        <Link
          href="/superadmin/schools"
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F1429] hover:bg-[#2B1D36] border border-[#2E1E3B] text-[#FCF9FD] text-xs font-bold transition-all"
        >
          <ArrowLeft size={14} />
          <span>Tüm Okullara Dön</span>
        </Link>
      </div>

      {/* ── INSTITUTION HEADER BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#17101E] via-[#21142C] to-[#17101E] border border-[#2E1E3B] p-6 lg:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D914C8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#D914C8] to-[#6A1689] flex items-center justify-center text-white font-black text-2xl sm:text-3xl shrink-0 shadow-xl shadow-[#D914C8]/25 border border-[#FCF9FD]/20">
              {school.name.charAt(0)}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#D914C8]/15 text-[#FCE8FA] border border-[#D914C8]/30">
                  MEB / KOD: {school.code}
                </span>

                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#2B1D36] text-[#D0C0D9] border border-[#49364F]">
                  {school.type}
                </span>

                {school.status === 'active' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={12} />
                    <span>Aktif Kurum</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Clock size={12} />
                    <span>Kurulum / Deneme</span>
                  </span>
                )}

                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {school.licensePlan}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {school.name}
              </h1>

              <div className="flex items-center gap-4 text-xs text-[#A998B3] flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-[#D914C8]" />
                  {school.district} / {school.city}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone size={13} className="text-emerald-400" />
                  {school.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail size={13} className="text-sky-400" />
                  {school.email}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 flex-wrap lg:self-center">
            <Link
              href="/principal"
              target="_blank"
              className="px-4 py-2.5 rounded-2xl bg-[#21142C] hover:bg-[#2B1D36] text-[#FCF9FD] text-xs font-bold border border-[#49364F] flex items-center gap-1.5 transition-all shadow-sm"
              title="Bu kurumun müdür panelini yeni sekmede aç"
            >
              <ExternalLink size={14} className="text-[#D914C8]" />
              <span>Müdür Portalı</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                toast.success(`"${school.name}" için son sistem senkronizasyonu tamamlandı.`)
              }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-[#D914C8]/25 transition-all cursor-pointer active:scale-95"
            >
              <FolderSync size={14} />
              <span>Verileri Senkronize Et</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── HIGH-LEVEL KPI RIBBON (REAL DATA STATS) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* KPI 1: Toplam Öğrenci */}
        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A998B3]">
            <span className="font-bold">Toplam Öğrenci</span>
            <Users size={14} className="text-[#D914C8]" />
          </div>
          <div className="text-2xl font-black text-white">{school.stats.totalStudents}</div>
          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <span>%{school.stats.attendanceRate} Devamlılık</span>
          </div>
        </div>

        {/* KPI 2: Öğretmen Kadrosu */}
        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A998B3]">
            <span className="font-bold">Öğretmen Kadrosu</span>
            <GraduationCap size={14} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{school.stats.totalTeachers}</div>
          <div className="text-[11px] text-[#A998B3]">
            {school.stats.activeTeachers} Aktif Görevde
          </div>
        </div>

        {/* KPI 3: İdare & Personel */}
        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A998B3]">
            <span className="font-bold">İdare & Personel</span>
            <Briefcase size={14} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{school.stats.totalStaff + 1}</div>
          <div className="text-[11px] text-[#A998B3]">Müdür & İdari Kadro</div>
        </div>

        {/* KPI 4: Sınıf / Şube */}
        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A998B3]">
            <span className="font-bold">Toplam Şube</span>
            <Layers size={14} className="text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">{(school.classrooms || []).length}</div>
          <div className="text-[11px] text-[#A998B3]">Aktif Derslik</div>
        </div>

        {/* KPI 5: Genel Başarı Ortalaması */}
        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A998B3]">
            <span className="font-bold">Akademik Başarı</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {school.stats.academicAverage} / 100
          </div>
          <div className="text-[11px] text-[#A998B3]">Sınav Ortalaması</div>
        </div>

        {/* KPI 6: AI Kredi & Lisans */}
        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A998B3]">
            <span className="font-bold">AI Soru Kotası</span>
            <Sparkles size={14} className="text-fuchsia-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {Math.round((school.stats.aiTokensUsed / school.stats.aiTokensLimit) * 100)}%
          </div>
          <div className="text-[11px] text-[#A998B3]">
            {school.stats.aiTokensUsed.toLocaleString()} / {school.stats.aiTokensLimit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#17101E] border border-[#2E1E3B] overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white shadow-md'
              : 'text-[#A998B3] hover:text-white hover:bg-[#20152B]'
          }`}
        >
          <BarChart3 size={15} />
          <span>Genel Bakış & İstatistikler</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leadership')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'leadership'
              ? 'bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white shadow-md'
              : 'text-[#A998B3] hover:text-white hover:bg-[#20152B]'
          }`}
        >
          <ShieldCheck size={15} />
          <span>Okul Müdürü & İdari Kadro ({(school.staff || []).length + 1})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'teachers'
              ? 'bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white shadow-md'
              : 'text-[#A998B3] hover:text-white hover:bg-[#20152B]'
          }`}
        >
          <GraduationCap size={15} />
          <span>Öğretmenler ({(school.teachers || []).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'students'
              ? 'bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white shadow-md'
              : 'text-[#A998B3] hover:text-white hover:bg-[#20152B]'
          }`}
        >
          <Users size={15} />
          <span>Öğrenciler & Sınıflar ({(school.students || []).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('license')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'license'
              ? 'bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white shadow-md'
              : 'text-[#A998B3] hover:text-white hover:bg-[#20152B]'
          }`}
        >
          <Cpu size={15} />
          <span>Lisans, Modüller & Kotalar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white shadow-md'
              : 'text-[#A998B3] hover:text-white hover:bg-[#20152B]'
          }`}
        >
          <History size={15} />
          <span>Okul İçi İşlem Logları ({(school.activityLogs || []).length})</span>
        </button>
      </div>

      {/* ── TAB 1: GENEL BAKIŞ & İSTATİSTİKLER ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sınıf / Şube Dağılımı ve Başarı Tablosu */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-[#17101E] border border-[#2E1E3B] space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#2E1E3B]">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Layers size={17} className="text-[#D914C8]" />
                    <span>Şube ve Sınıf Bazlı İstatistikler</span>
                  </h3>
                  <p className="text-xs text-[#A998B3] mt-0.5">
                    Aktif şubeler, sınıf mevcudu, şube rehber öğretmeni ve dönemlik başarı ortalamaları
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#21142C] text-[#D0C0D9] border border-[#2E1E3B]">
                  {(school.classrooms || []).length} Şube
                </span>
              </div>

              <div className="space-y-3">
                {(school.classrooms || []).map((cls, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#20152B] border border-[#2E1E3B]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#8D49A6]/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#17101E] border border-[#2E1E3B] flex items-center justify-center font-black text-white text-sm">
                        {cls.grade}
                      </div>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-2">
                          <span>{cls.level}</span>
                          <span className="text-[10px] text-[#A998B3]">• Sınıf Rehber: {cls.headTeacher}</span>
                        </div>
                        <div className="text-[11px] text-[#A998B3] mt-0.5">
                          Öğrenci Mevcudu: <strong className="text-white font-bold">{cls.studentCount}</strong> öğrenci
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-[10px] text-[#A998B3] block">Başarı Notu</span>
                        <span className="text-xs font-black text-emerald-400">
                          {cls.averageScore} / 100
                        </span>
                      </div>

                      {/* Mini Bar */}
                      <div className="w-24 bg-[#17101E] h-2 rounded-full overflow-hidden border border-[#2E1E3B]">
                        <div
                          className="bg-gradient-to-r from-[#D914C8] to-[#45C7A2] h-full rounded-full"
                          style={{ width: `${Math.min(100, cls.averageScore)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sağ Sütun: Okul Künyesi & İletişim Detayları */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#17101E] border border-[#2E1E3B] space-y-4 shadow-sm">
                <h3 className="text-sm font-black text-white flex items-center gap-2 pb-3 border-b border-[#2E1E3B]">
                  <Building2 size={16} className="text-[#D914C8]" />
                  <span>Resmi Kurum Künyesi</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] text-[#A998B3] block">Resmi Kurum Adı</span>
                    <span className="font-bold text-white">{school.name}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#A998B3] block">MEB Kurum Kodu</span>
                    <span className="font-mono font-black text-[#D914C8] text-sm">{school.code}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#A998B3] block">Eğitim Kademesi</span>
                    <span className="font-semibold text-white">{school.level}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#A998B3] block">Açık Adres</span>
                    <span className="font-normal text-[#FCF9FD]">{school.address}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#A998B3] block">Resmi Web Sitesi</span>
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sky-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <Globe size={12} />
                      <span>{school.website}</span>
                    </a>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#A998B3] block">Sisteme Kayıt Tarihi</span>
                    <span className="font-bold text-white">{school.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Depolama & Sunucu İstatistikleri */}
              <div className="p-6 rounded-3xl bg-[#17101E] border border-[#2E1E3B] space-y-4 shadow-sm">
                <h3 className="text-sm font-black text-white flex items-center gap-2 pb-3 border-b border-[#2E1E3B]">
                  <HardDrive size={16} className="text-sky-400" />
                  <span>Bulut Depolama & Kaynaklar</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#A998B3]">Kullanılan Disk Alanı</span>
                      <span className="font-bold text-white">
                        {(school.stats.storageUsedMb / 1024).toFixed(1)} GB /{' '}
                        {(school.stats.storageLimitMb / 1024).toFixed(0)} GB
                      </span>
                    </div>
                    <div className="w-full bg-[#20152B] h-2.5 rounded-full overflow-hidden border border-[#2E1E3B]">
                      <div
                        className="bg-sky-500 h-full rounded-full"
                        style={{
                          width: `${(school.stats.storageUsedMb / school.stats.storageLimitMb) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#2E1E3B] flex items-center justify-between text-xs text-[#A998B3]">
                    <span>Bu Ay Tamamlanan Ders:</span>
                    <strong className="text-white font-bold">{school.stats.completedLessonsThisMonth} Ders</strong>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#A998B3]">
                    <span>Haftalık Aktif Kullanıcı:</span>
                    <strong className="text-emerald-400 font-bold">{school.stats.weeklyActiveUsers} Kişi</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: OKUL MÜDÜRÜ & İDARİ KADRO ── */}
      {activeTab === 'leadership' && (
        <div className="space-y-6">
          {/* Okul Müdürü Vurgulu Kartı */}
          <div className="p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-[#21142C] via-[#17101E] to-[#21142C] border-2 border-[#D914C8]/40 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2E1E3B]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D914C8] to-[#8D49A6] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#D914C8]/30">
                  {(school.principal?.name || 'M').charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#D914C8]/20 text-[#FCE8FA] border border-[#D914C8]/40">
                      1. Derece Kurum Baş Yetkilisi
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Aktif Görevde
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {school.principal?.name || 'Okul Müdürü'}
                  </h2>
                  <p className="text-xs text-[#A998B3]">{school.principal?.title || 'Okul Yetkilisi'}</p>
                </div>
              </div>

              <Link
                href="/principal"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white text-xs font-bold shadow-md hover:brightness-110 transition-all self-start sm:self-center"
              >
                <ExternalLink size={14} />
                <span>Müdür Olarak Giriş Yap</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
                <span className="text-[10.5px] text-[#A998B3] block">T.C. Kimlik No</span>
                <span className="font-mono font-bold text-white tracking-wider">
                  {school.principal?.tcNo || '—'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
                <span className="text-[10.5px] text-[#A998B3] block">Yetkili Telefonu</span>
                <span className="font-mono font-bold text-white">
                  {school.principal?.phone || school.phone || '—'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
                <span className="text-[10.5px] text-[#A998B3] block">Kurumsal E-Posta</span>
                <span className="font-mono font-bold text-white truncate block">
                  {school.principal?.email || school.email || '—'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
                <span className="text-[10.5px] text-[#A998B3] block">Göreve Başlama Tarihi</span>
                <span className="font-bold text-white">
                  {school.principal?.appointmentDate || school.createdAt || '01.09.2023'}
                </span>
              </div>
            </div>
          </div>

          {/* İdari & Destek Personeli Listesi */}
          <div className="p-6 rounded-3xl bg-[#17101E] border border-[#2E1E3B] space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#2E1E3B]">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Briefcase size={17} className="text-indigo-400" />
                  <span>Müdür Yardımcıları & İdari Personel</span>
                </h3>
                <p className="text-xs text-[#A998B3] mt-0.5">
                  Okulun yönetim kadrosu, PDR rehberlik servisi ve destek personeli
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#21142C] text-[#D0C0D9] border border-[#2E1E3B]">
                {(school.staff || []).length} Personel
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(school.staff || []).map((stf) => (
                <div
                  key={stf.id}
                  className="p-4 rounded-2xl bg-[#20152B] border border-[#2E1E3B] space-y-3 hover:border-[#8D49A6]/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#17101E] border border-[#2E1E3B] flex items-center justify-center font-bold text-white text-sm">
                        {stf.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{stf.name}</h4>
                        <span className="text-[11px] text-[#A998B3] block">{stf.role}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        stf.category === 'yonetim'
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : stf.category === 'pdr'
                          ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {stf.category.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-[#A998B3] pt-2 border-t border-[#2E1E3B]/80">
                    <div className="flex items-center justify-between">
                      <span>Telefon:</span>
                      <span className="font-mono text-white">{stf.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>E-Posta:</span>
                      <span className="text-white truncate max-w-[160px]">{stf.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mesai:</span>
                      <span className="text-white">{stf.shift}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: ÖĞRETMENLER ── */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[#17101E] border border-[#2E1E3B] space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#2E1E3B]">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <GraduationCap size={18} className="text-[#D914C8]" />
                  <span>Kayıtlı Öğretmen Kadrosu</span>
                </h3>
                <p className="text-xs text-[#A998B3] mt-0.5">
                  Okulda aktif ders veren tüm branş ve sınıf öğretmenleri
                </p>
              </div>

              {/* Teacher Search */}
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A998B3]" />
                <input
                  type="text"
                  placeholder="Öğretmen adı veya branş ara..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3.5 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-xs text-white placeholder-[#A998B3] focus:outline-hidden focus:border-[#D914C8]"
                />
              </div>
            </div>

            {/* Teacher Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2E1E3B] text-[#A998B3] font-bold">
                    <th className="py-3 px-3">Öğretmen Adı</th>
                    <th className="py-3 px-3">Branş</th>
                    <th className="py-3 px-3">Sorumlu Olduğu Şube</th>
                    <th className="py-3 px-3">Haftalık Ders</th>
                    <th className="py-3 px-3">İletişim</th>
                    <th className="py-3 px-3">Son Giriş</th>
                    <th className="py-3 px-3 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E1E3B]/60">
                  {filteredTeachers.map((tch) => (
                    <tr key={tch.id} className="hover:bg-[#20152B]/60 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#D914C8]/30 to-[#8D49A6]/30 border border-[#D914C8]/40 text-white font-bold text-xs flex items-center justify-center">
                            {tch.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-black text-white block">{tch.name}</span>
                            <span className="text-[10px] text-[#A998B3] font-mono">{tch.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-white">
                        <span className="px-2 py-0.5 rounded-md bg-[#20152B] border border-[#2E1E3B] text-[#D0C0D9]">
                          {tch.branch}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-[#A998B3] font-medium">
                        {tch.classroom || '—'}
                      </td>

                      <td className="py-3.5 px-3 font-bold text-white">
                        {tch.lessonCount} Saat / Hafta
                      </td>

                      <td className="py-3.5 px-3 space-y-0.5">
                        <div className="font-mono text-[11px] text-white">{tch.phone}</div>
                        <div className="text-[10px] text-[#A998B3] truncate max-w-[150px]">{tch.email}</div>
                      </td>

                      <td className="py-3.5 px-3 text-[#A998B3] font-medium">
                        {tch.lastLogin}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 size={10} />
                          <span>Aktif</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTeachers.length === 0 && (
                <div className="text-center py-8 text-xs text-[#A998B3]">
                  Arama kriterlerinize uygun öğretmen bulunamadı.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: ÖĞRENCİLER & SINIFLAR ── */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[#17101E] border border-[#2E1E3B] space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#2E1E3B]">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Users size={18} className="text-[#D914C8]" />
                  <span>Kayıtlı Öğrenci Listesi</span>
                </h3>
                <p className="text-xs text-[#A998B3] mt-0.5">
                  Öğrenci numaraları, veli iletişim bilgileri ve akademik durumları
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <select
                  value={studentGradeFilter}
                  onChange={(e) => setStudentGradeFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-xs font-bold text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Tüm Şubeler</option>
                  {(school.classrooms || []).map((c) => (
                    <option key={c.grade} value={c.grade}>
                      {c.grade} Şubesi
                    </option>
                  ))}
                </select>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A998B3]" />
                  <input
                    type="text"
                    placeholder="Öğrenci veya veli ara..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full h-10 pl-9 pr-3.5 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-xs text-white placeholder-[#A998B3] focus:outline-hidden focus:border-[#D914C8]"
                  />
                </div>
              </div>
            </div>

            {/* Student Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2E1E3B] text-[#A998B3] font-bold">
                    <th className="py-3 px-3">No</th>
                    <th className="py-3 px-3">Öğrenci Adı Soyadı</th>
                    <th className="py-3 px-3">Şube</th>
                    <th className="py-3 px-3">Veli Bilgisi</th>
                    <th className="py-3 px-3">Veli Telefonu</th>
                    <th className="py-3 px-3">Başarı (GPA)</th>
                    <th className="py-3 px-3">Devamlılık</th>
                    <th className="py-3 px-3 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E1E3B]/60">
                  {filteredStudents.map((stu) => (
                    <tr key={stu.id} className="hover:bg-[#20152B]/60 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-[#D914C8]">
                        #{stu.studentNumber}
                      </td>

                      <td className="py-3.5 px-3 font-black text-white">
                        {stu.name}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#20152B] border border-[#2E1E3B] font-bold text-white">
                          {stu.grade}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-[#FCF9FD] font-semibold">
                        {stu.parentName}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[#A998B3]">
                        {stu.parentPhone}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-black text-emerald-400">
                          {stu.gpa} / 100
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-white">
                        %{stu.attendanceRate}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 size={10} />
                          <span>Kayıtlı</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-xs text-[#A998B3]">
                  Arama kriterlerinize uygun öğrenci bulunamadı.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: LİSANS, MODÜLLER & KOTALAR ── */}
      {activeTab === 'license' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lisans Durumu ve Geçerlilik */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-[#17101E] border border-[#2E1E3B] space-y-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#2E1E3B]">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#D914C8]" />
                    <span>SaaS Kurumsal Lisans Paketi</span>
                  </h3>
                  <p className="text-xs text-[#A998B3] mt-0.5">
                    Kurumun aktif lisans süresi, geçerlilik aralığı ve paket yetkileri
                  </p>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white">
                  {school.licensePlan}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#20152B] border border-[#2E1E3B] space-y-1">
                  <span className="text-[11px] text-[#A998B3] block">Lisans Başlangıcı</span>
                  <span className="text-sm font-bold text-white">{school.licenseStart}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#20152B] border border-[#2E1E3B] space-y-1">
                  <span className="text-[11px] text-[#A998B3] block">Lisans Bitiş Tarihi</span>
                  <span className="text-sm font-bold text-[#FCF9FD]">{school.licenseExpires}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#20152B] border border-[#2E1E3B] space-y-1">
                  <span className="text-[11px] text-[#A998B3] block">Öğrenci Lisans Kotası</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {school.stats.totalStudents} / 1000 Kapasite
                  </span>
                </div>
              </div>

              {/* Modül Yetkileri Listesi */}
              <div className="space-y-3 pt-3 border-t border-[#2E1E3B]">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#A998B3]">
                  Açık Olan Kurumsal Modüller
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#20152B] border border-[#2E1E3B] flex items-center justify-between">
                    <span className="text-xs font-bold text-white">🎮 Game Studio Eğitici Oyunlar</span>
                    <span className="text-[10px] font-black text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30">
                      Aktif
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#20152B] border border-[#2E1E3B] flex items-center justify-between">
                    <span className="text-xs font-bold text-white">🤖 AI Soru & Sınav Motoru</span>
                    <span className="text-[10px] font-black text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30">
                      Aktif
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#20152B] border border-[#2E1E3B] flex items-center justify-between">
                    <span className="text-xs font-bold text-white">📺 Akıllı Tahta Entegrasyonu</span>
                    <span className="text-[10px] font-black text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30">
                      Aktif
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#20152B] border border-[#2E1E3B] flex items-center justify-between">
                    <span className="text-xs font-bold text-white">👨‍👩‍👧 Veli Portalı & SMS Bildirimleri</span>
                    <span className="text-[10px] font-black text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30">
                      Aktif
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#20152B] border border-[#2E1E3B] flex items-center justify-between">
                    <span className="text-xs font-bold text-white">🔄 MEB E-Okul Senkronizasyonu</span>
                    <span className="text-[10px] font-black text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30">
                      Aktif
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#20152B] border border-[#2E1E3B] flex items-center justify-between">
                    <span className="text-xs font-bold text-white">📊 Kurumsal Analitik Pro</span>
                    <span className="text-[10px] font-black text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30">
                      Aktif
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI ve Depolama Kotaları */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#17101E] border border-[#2E1E3B] space-y-4 shadow-sm">
                <h3 className="text-sm font-black text-white flex items-center gap-2 pb-3 border-b border-[#2E1E3B]">
                  <Sparkles size={16} className="text-[#D914C8]" />
                  <span>Yapay Zeka Soru Üretim Kotası</span>
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#A998B3]">Kullanılan Kredi:</span>
                    <span className="font-black text-white">
                      {school.stats.aiTokensUsed.toLocaleString()} / {school.stats.aiTokensLimit.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-full bg-[#20152B] h-3 rounded-full overflow-hidden border border-[#2E1E3B]">
                    <div
                      className="bg-gradient-to-r from-[#D914C8] to-[#8D49A6] h-full rounded-full"
                      style={{
                        width: `${(school.stats.aiTokensUsed / school.stats.aiTokensLimit) * 100}%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-[#A998B3] leading-relaxed">
                    Öğretmenler ders ve sınav hazırlarken MEB müfredatına uygun soru üretiminde bu krediyi kullanır. Kredi dönem sonunda yenilenir.
                  </p>
                </div>
              </div>

              {/* Hızlı İşlem Butonları */}
              <div className="p-6 rounded-3xl bg-[#17101E] border border-[#2E1E3B] space-y-3 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#A998B3]">
                  Lisans Aksiyonları
                </h4>

                <button
                  type="button"
                  onClick={() => {
                    toast.success('Lisans süresi +1 yıl başarıyla uzatıldı.')
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#20152B] hover:bg-[#2B1D36] text-white text-xs font-bold border border-[#2E1E3B] transition-all cursor-pointer"
                >
                  Lisansı +1 Yıl Uzat
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toast.success('+25.000 AI Soru Kredisi tanımlandı.')
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#20152B] hover:bg-[#2B1D36] text-white text-xs font-bold border border-[#2E1E3B] transition-all cursor-pointer"
                >
                  Ek AI Kredisi Tanımla (+25K)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: İŞLEM VE GÜVENLİK LOGLARI ── */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[#17101E] border border-[#2E1E3B] space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#2E1E3B]">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <History size={18} className="text-[#D914C8]" />
                  <span>Okul İçi Tüm İşlem ve Güvenlik Denetim Logları</span>
                </h3>
                <p className="text-xs text-[#A998B3] mt-0.5">
                  Müdür, öğretmen ve sistem otomasyonları tarafından gerçekleştirilen tüm işlemler kronolojik olarak kayıt altındadır.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#21142C] text-[#D0C0D9] border border-[#2E1E3B]">
                {(school.activityLogs || []).length} İşlem Kaydı
              </span>
            </div>

            <div className="space-y-3">
              {(school.activityLogs || []).map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-[#20152B] border border-[#2E1E3B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#8D49A6]/50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#17101E] border border-[#2E1E3B] flex items-center justify-center shrink-0 mt-0.5">
                      {log.category === 'not_girisi' && <FileText size={16} className="text-emerald-400" />}
                      {log.category === 'yoklama' && <UserCheck size={16} className="text-sky-400" />}
                      {log.category === 'sinav' && <Award size={16} className="text-[#D914C8]" />}
                      {log.category === 'sistem' && <HardDrive size={16} className="text-amber-400" />}
                      {log.category === 'lisans' && <ShieldCheck size={16} className="text-purple-400" />}
                      {log.category === 'kullanici' && <Users size={16} className="text-indigo-400" />}
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white leading-relaxed">
                        {log.action}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#A998B3]">
                        <span className="font-semibold text-[#FCF9FD]">{log.actor}</span>
                        <span>•</span>
                        <span>{log.role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span className="text-[11px] font-mono text-[#A998B3] flex items-center gap-1">
                      <Clock size={12} />
                      {log.timestamp}
                    </span>

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Başarılı
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
