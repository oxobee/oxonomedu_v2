// apps/web/app/superadmin/schools/page.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Users,
  Database,
  RefreshCw,
  X,
  Filter,
  Sparkles,
  ChevronRight,
  BarChart3,
  Globe,
  SlidersHorizontal,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Copy,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client'
import {
  SchoolDetail,
  getAllSchools,
  addNewSchool,
  saveAllSchools,
  normalizeSchool,
} from '@/lib/schools/schoolData'

export default function SuperadminSchoolsPage() {
  const router = useRouter()
  const [schools, setSchools] = useState<SchoolDetail[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [supabaseStatus, setSupabaseStatus] = useState<{ configured: boolean; connected: boolean }>({
    configured: false,
    connected: false,
  })

  // Filters
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formCity, setFormCity] = useState('İstanbul')
  const [formDistrict, setFormDistrict] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formLevel, setFormLevel] = useState('İlkokul (1-4) & Ortaokul (5-8)')
  const [formType, setFormType] = useState('MEB Resmi İlkokulu & Ortaokulu')
  const [formPrincipal, setFormPrincipal] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPrincipalPassword, setFormPrincipalPassword] = useState('Oxonom2026!')
  const [showPassword, setShowPassword] = useState(false)
  const [formPlan, setFormPlan] = useState<'Enterprise Pro' | 'Standart Okul' | 'Deneme Lisansı (14 Gün)'>('Enterprise Pro')
  const [formStudentCount, setFormStudentCount] = useState<number>(360)
  const [formTeacherCount, setFormTeacherCount] = useState<number>(24)

  // Load schools
  const fetchSchools = async () => {
    setIsLoading(true)
    const configured = isSupabaseConfigured()

    if (configured) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client
          .from('schools')
          .select('*')
          .order('name', { ascending: true })

        if (!error && Array.isArray(data) && data.length > 0) {
          // Normalize rows from Supabase to guarantee complete SchoolDetail shape
          const normalized = data.map(normalizeSchool)
          setSchools(normalized)
          setSupabaseStatus({ configured: true, connected: true })
          setIsLoading(false)
          return
        }
      } catch (err) {
        console.warn('Supabase fetch error, using local fallback:', err)
      }
    }

    // Local storage / initial schools
    const loaded = getAllSchools().map(normalizeSchool)
    setSchools(loaded)
    setSupabaseStatus({ configured, connected: configured })
    setIsLoading(false)
  }

  useEffect(() => {
    fetchSchools()
  }, [])

  // Handle Create School
  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formName.trim() || !formCode.trim()) {
      toast.error('Lütfen okul adı ve MEB kurum kodunu giriniz.')
      return
    }

    // Check duplicate code
    if (schools.some((s) => (s.code || '').toLowerCase() === formCode.trim().toLowerCase())) {
      toast.error(`"${formCode}" MEB koduna sahip bir okul zaten kayıtlı!`)
      return
    }

    const created = addNewSchool({
      name: formName.trim(),
      code: formCode.trim(),
      city: formCity,
      district: formDistrict.trim() || 'Merkez',
      address: formAddress.trim(),
      level: formLevel,
      type: formType,
      principalName: formPrincipal.trim() || 'Okul Müdürü',
      principalPhone: formPhone.trim() || '+90 (212) 000 00 00',
      principalEmail: formEmail.trim() || 'bilgi@okul.k12.tr',
      principalPassword: formPrincipalPassword.trim() || 'Oxonom2026!',
      planType: formPlan,
      studentCount: Number(formStudentCount) || 240,
      teacherCount: Number(formTeacherCount) || 16,
    })

    // Attempt Supabase insert if configured
    if (supabaseStatus.configured) {
      try {
        const client = getSupabaseBrowserClient()
        await client.from('schools').insert([created])
      } catch (_) {}
    }

    setSchools([created, ...schools])
    toast.success(`🏫 "${created.name}" başarıyla sisteme kaydedildi!`)
    setIsModalOpen(false)

    // Reset Form
    setFormName('')
    setFormCode('')
    setFormDistrict('')
    setFormAddress('')
    setFormPrincipal('')
    setFormPhone('')
    setFormEmail('')
  }

  // Filtered List
  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      if (cityFilter !== 'all' && s.city !== cityFilter) return false
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (!search.trim()) return true
      const q = search.toLowerCase()
      const pName = s.principal?.name || (s as any).principalName || ''
      const sName = s.name || ''
      const sCode = s.code || ''
      const sDistrict = s.district || ''
      return (
        sName.toLowerCase().includes(q) ||
        sCode.includes(q) ||
        sDistrict.toLowerCase().includes(q) ||
        pName.toLowerCase().includes(q)
      )
    })
  }, [schools, cityFilter, statusFilter, search])

  // Cities List
  const cities = useMemo(() => {
    const set = new Set(schools.map((s) => s.city || 'İstanbul'))
    return Array.from(set)
  }, [schools])

  // Total summary stats
  const totalStats = useMemo(() => {
    return schools.reduce(
      (acc, s) => {
        acc.totalStudents += s.stats?.totalStudents || (s as any).studentCount || 0
        acc.totalTeachers += s.stats?.totalTeachers || (s as any).teacherCount || 0
        acc.totalSchools += 1
        if (s.status === 'active') acc.activeSchools += 1
        return acc
      },
      { totalStudents: 0, totalTeachers: 0, totalSchools: 0, activeSchools: 0 }
    )
  }, [schools])

  return (
    <div className="space-y-6 font-jakarta pb-20">
      <Toaster position="top-right" />

      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#17101E] border border-[#2E1E3B] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#D914C8]/15 text-[#FCE8FA] border border-[#D914C8]/30">
              <Building2 size={13} />
              <span>SaaS Kurum & Okul Yönetimi</span>
            </span>

            {/* Supabase Status Pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                supabaseStatus.configured
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
              }`}
            >
              <Database size={12} />
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  supabaseStatus.configured ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'
                }`}
              />
              <span>
                {supabaseStatus.configured
                  ? 'Supabase PostgreSQL Canlı'
                  : 'Sistem Veritabanı Aktif'}
              </span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Kayıtlı Okullar & Kurumlar
          </h1>
          <p className="text-xs sm:text-sm text-[#A998B3]">
            Oxonom platformundaki lisanslı okulları yönetin. İlgili okul kartına tıklayarak tüm öğretmen, öğrenci, müdür, personel ve istatistik detaylarını görüntüleyin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={fetchSchools}
            className="h-11 px-3.5 rounded-2xl bg-[#20152B] hover:bg-[#2B1D36] text-[#FCF9FD] text-xs font-bold flex items-center gap-1.5 border border-[#2E1E3B] transition-all cursor-pointer"
            title="Yenile"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Yenile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-5 rounded-2xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-[#D914C8]/25 cursor-pointer active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>+ Yeni Okul Ekle</span>
          </button>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <span className="text-[11px] font-bold text-[#A998B3] flex items-center gap-1.5">
            <Building2 size={13} className="text-[#D914C8]" />
            Toplam Kayıtlı Okul
          </span>
          <div className="text-2xl font-black text-white">{totalStats.totalSchools}</div>
          <span className="text-[10px] text-emerald-400 font-bold block">
            {totalStats.activeSchools} Aktif Lisanslı
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <span className="text-[11px] font-bold text-[#A998B3] flex items-center gap-1.5">
            <Users size={13} className="text-sky-400" />
            Toplam Öğrenci
          </span>
          <div className="text-2xl font-black text-white">
            {totalStats.totalStudents.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#A998B3] block">Tüm şubeler dahil</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <span className="text-[11px] font-bold text-[#A998B3] flex items-center gap-1.5">
            <GraduationCap size={13} className="text-purple-400" />
            Öğretmen Kadrosu
          </span>
          <div className="text-2xl font-black text-white">
            {totalStats.totalTeachers.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#A998B3] block">Aktif Branş Eğitmeni</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] space-y-1">
          <span className="text-[11px] font-bold text-[#A998B3] flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            Hizmet Devamlılığı
          </span>
          <div className="text-2xl font-black text-emerald-400">%99.98</div>
          <span className="text-[10px] text-[#A998B3] block">SaaS SLA Uptime</span>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="p-4 rounded-2xl bg-[#17101E] border border-[#2E1E3B] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A998B3]" />
          <input
            type="text"
            placeholder="Okul adı, MEB kodu, ilçe veya müdür ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-xs text-white placeholder-[#A998B3] focus:outline-hidden focus:border-[#D914C8] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-xs font-bold text-white focus:outline-hidden cursor-pointer"
          >
            <option value="all">Tüm Şehirler ({cities.length})</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-xs font-bold text-white focus:outline-hidden cursor-pointer"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif Lisanslar</option>
            <option value="pending">Kurulumda / Deneme</option>
          </select>
        </div>
      </div>

      {/* ── SCHOOLS GRID (CLICKABLE DEDICATED PAGE CARDS) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSchools.map((sch) => (
          <div
            key={sch.id}
            onClick={() => router.push(`/superadmin/schools/${sch.id}`)}
            className="p-6 rounded-3xl bg-[#17101E] border border-[#2E1E3B] hover:border-[#D914C8] transition-all space-y-4 group shadow-md cursor-pointer relative overflow-hidden"
          >
            {/* Ambient hover glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D914C8]/5 group-hover:bg-[#D914C8]/15 rounded-full blur-2xl transition-all pointer-events-none" />

            {/* Header: School Name, Status & Code */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D914C8] to-[#6A1689] text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  {(sch.name || 'O').charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-[#FCE8FA] transition-colors leading-snug">
                    {sch.name || 'İsimsiz Okul'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#A998B3] mt-0.5">
                    <span className="font-mono text-[#D914C8] font-bold">MEB: {sch.code || '—'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {sch.district || 'Merkez'} / {sch.city || 'İstanbul'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {sch.status === 'active' ? (
                  <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    <span>Aktif</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Clock size={11} />
                    <span>Kurulumda</span>
                  </span>
                )}
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-[#20152B] border border-[#2E1E3B]/80 text-center relative z-10">
              <div>
                <span className="text-[10px] text-[#A998B3] block">Öğrenci</span>
                <span className="text-xs font-black text-white">
                  {sch.stats?.totalStudents ?? (sch as any).studentCount ?? 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#A998B3] block">Öğretmen</span>
                <span className="text-xs font-black text-white">
                  {sch.stats?.totalTeachers ?? (sch as any).teacherCount ?? 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#A998B3] block">Personel</span>
                <span className="text-xs font-black text-white">{(sch.staff?.length || 0) + 1}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#A998B3] block">Paket</span>
                <span className="text-[11px] font-bold text-[#FCF9FD] truncate block">
                  {sch.licensePlan || (sch as any).planType || 'Standart'}
                </span>
              </div>
            </div>

            {/* Contact & Principal Info */}
            <div className="space-y-1.5 text-xs text-[#FCF9FD] relative z-10">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-[#A998B3]">Okul Müdürü:</span>
                <strong className="text-white font-bold">
                  {sch.principal?.name || (sch as any).principalName || 'Okul Müdürü'}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-[#A998B3]">Müdür Telefonu:</span>
                <span className="font-mono text-[#D0C0D9]">
                  {sch.principal?.phone || sch.phone || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-[#A998B3]">Müdür E-Posta:</span>
                <span className="text-[#D0C0D9] truncate max-w-[200px]">
                  {sch.principal?.email || sch.email || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#A998B3] pt-2 border-t border-[#2E1E3B]">
                <span>Kademe: {sch.level || 'İlkokul'}</span>
                <span>Lisans Bitiş: {sch.licenseExpires || '31.12.2027'}</span>
              </div>
            </div>

            {/* Card Footer Action: Dedicated Page Button */}
            <div className="pt-2 border-t border-[#2E1E3B]/80 flex items-center justify-between text-xs font-bold text-[#D914C8] group-hover:text-white transition-colors relative z-10">
              <span className="flex items-center gap-1">
                <BarChart3 size={14} />
                <span>Okuldaki Tüm İşlem & Personel İstatistiklerini Gör</span>
              </span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Sayfayı Aç</span>
                <ChevronRight size={14} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-[#17101E] border border-[#2E1E3B] space-y-3">
          <Building2 size={32} className="mx-auto text-[#A998B3]" />
          <h3 className="text-base font-bold text-white">Aranan kriterlere uygun okul bulunamadı</h3>
          <p className="text-xs text-[#A998B3]">
            Arama terimini değiştirebilir veya yeni bir okul ekleyebilirsiniz.
          </p>
        </div>
      )}

      {/* ── MODAL: YENİ OKUL EKLE ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-xl bg-[#17101E] rounded-3xl border border-[#2E1E3B] shadow-2xl p-6 sm:p-8 space-y-5 z-10 text-white max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#2E1E3B]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D914C8] to-[#8D49A6] flex items-center justify-center text-white">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Yeni Okul / Kurum Ekle</h3>
                    <p className="text-xs text-[#A998B3]">
                      Oxonom ekosistemine yeni bir okul kaydı oluşturun.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-[#20152B] hover:bg-[#2B1D36] text-[#A998B3] hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateSchool} className="space-y-4 text-xs">
                {/* Okul Adı & Kod */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-gray-300">Okul / Kurum Tam Adı *</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Kadıköy Maarif Koleji"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-white placeholder-[#A998B3] focus:outline-hidden focus:border-[#D914C8]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-300">MEB / Kurum Kodu *</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: 742999"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#20152B] border border-[#2E1E3B] font-mono text-white placeholder-[#A998B3] focus:outline-hidden focus:border-[#D914C8]"
                    />
                  </div>
                </div>

                {/* İl, İlçe ve Tür */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-300">İl</label>
                    <select
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="İstanbul">İstanbul</option>
                      <option value="Ankara">Ankara</option>
                      <option value="İzmir">İzmir</option>
                      <option value="Bursa">Bursa</option>
                      <option value="Antalya">Antalya</option>
                      <option value="Kocaeli">Kocaeli</option>
                      <option value="Eskişehir">Eskişehir</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-300">İlçe</label>
                    <input
                      type="text"
                      placeholder="Örn: Kadıköy"
                      value={formDistrict}
                      onChange={(e) => setFormDistrict(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-white placeholder-[#A998B3] focus:outline-hidden focus:border-[#D914C8]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-300">Kurum Türü</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="MEB Resmi İlkokulu">MEB Resmi İlkokulu</option>
                      <option value="MEB Resmi Ortaokulu">MEB Resmi Ortaokulu</option>
                      <option value="MEB Resmi İlkokulu & Ortaokulu">MEB Resmi İlkokulu & Ortaokulu</option>
                      <option value="Özel K-12 Koleji">Özel K-12 Koleji</option>
                      <option value="Özel İlkokul">Özel İlkokul</option>
                    </select>
                  </div>
                </div>

                {/* Eğitim Kademesi ve Lisans Planı */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-300">Eğitim Kademesi</label>
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="İlkokul (1-4) & Ortaokul (5-8)">İlkokul (1-4) & Ortaokul (5-8)</option>
                      <option value="İlkokul (1-4. Sınıflar)">İlkokul (1-4. Sınıflar)</option>
                      <option value="Ortaokul (5-8. Sınıflar)">Ortaokul (5-8. Sınıflar)</option>
                      <option value="K-12 (Tüm Kademeler)">K-12 (Tüm Kademeler)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-300">Lisans Paketi</label>
                    <select
                      value={formPlan}
                      onChange={(e) => setFormPlan(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="Enterprise Pro">Enterprise Pro (Tüm Modüller)</option>
                      <option value="Standart Okul">Standart Okul (Temel Eğitim)</option>
                      <option value="Deneme Lisansı (14 Gün)">Deneme Lisansı (14 Gün)</option>
                    </select>
                  </div>
                </div>

                {/* Okul Müdürü (Yetkili) Bilgileri */}
                <div className="p-4 rounded-2xl bg-[#20152B] border border-[#2E1E3B] space-y-3">
                  <span className="text-[11px] font-black uppercase text-[#D914C8] block">
                    Okul Yetkilisi (Müdür) Bilgileri
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-300">Müdür Adı Soyadı *</label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Kemal SOYSAL"
                        value={formPrincipal}
                        onChange={(e) => setFormPrincipal(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg bg-[#17101E] border border-[#2E1E3B] text-white placeholder-[#A998B3] focus:outline-hidden focus:border-[#D914C8]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-300">Yetkili Telefonu</label>
                      <input
                        type="text"
                        placeholder="+90 (532) 000 00 00"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg bg-[#17101E] border border-[#2E1E3B] font-mono text-white placeholder-[#A998B3] focus:outline-hidden focus:border-[#D914C8]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-300">Yetkili E-Postası</label>
                      <input
                        type="email"
                        placeholder="mudur@okul.k12.tr"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg bg-[#17101E] border border-[#2E1E3B] text-white placeholder-[#A998B3] focus:outline-hidden focus:border-[#D914C8]"
                      />
                    </div>
                  </div>

                  {/* Giriş Şifresi Tanımlama */}
                  <div className="pt-2.5 border-t border-[#2E1E3B] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-200 flex items-center gap-1.5">
                        <Lock size={12} className="text-[#D914C8]" />
                        <span>Müdür Giriş Şifresi (Geçici Şifre) *</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormPrincipalPassword(`Oxo${Math.floor(1000 + Math.random() * 9000)}!`)}
                        className="text-[10.5px] font-bold text-[#D914C8] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw size={10} />
                        <span>Rastgele Şifre Üret</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Örn: Oxonom2026!"
                        value={formPrincipalPassword}
                        onChange={(e) => setFormPrincipalPassword(e.target.value)}
                        className="w-full h-9 px-3 pr-10 rounded-lg bg-[#17101E] border border-[#2E1E3B] font-mono text-white placeholder-[#A998B3] focus:outline-hidden focus:border-[#D914C8]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A998B3] hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    <div className="flex items-start gap-1.5 text-[10.5px] text-[#A998B3] pt-0.5">
                      <ShieldCheck size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        Müdür bu şifreyle ilk kez giriş yaptığında, sistem güvenliği için şifresini değiştireceği ekran zorunlu olarak açılacaktır. Ardından boş (öğrenci/öğretmensiz) temiz bir başlangıç profili karşılayacaktır.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tahmini Kapasite */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-300">Öğrenci Kapasitesi</label>
                    <input
                      type="number"
                      min={10}
                      max={5000}
                      value={formStudentCount}
                      onChange={(e) => setFormStudentCount(Number(e.target.value))}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-white focus:outline-hidden focus:border-[#D914C8]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-300">Öğretmen Sayısı</label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={formTeacherCount}
                      onChange={(e) => setFormTeacherCount(Number(e.target.value))}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#20152B] border border-[#2E1E3B] text-white focus:outline-hidden focus:border-[#D914C8]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2E1E3B]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#20152B] hover:bg-[#2B1D36] text-[#A998B3] hover:text-white font-bold transition-all cursor-pointer"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white font-black shadow-lg shadow-[#D914C8]/25 transition-all cursor-pointer"
                  >
                    Okulu Sisteme Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
