// apps/web/app/superadmin/schools/page.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client'

export interface RegisteredSchool {
  id: string | number
  name: string
  code: string
  city: string
  district: string
  level: string
  studentCount: number
  teacherCount: number
  principalName: string
  phone: string
  email: string
  status: 'active' | 'pending' | 'suspended'
  licenseExpires: string
  planType: string
}

const DEFAULT_SCHOOLS: RegisteredSchool[] = [
  {
    id: 'sch-1',
    name: 'Oxonom Merkez İlkokulu & Ortaokulu',
    code: '741295',
    city: 'İstanbul',
    district: 'Beşiktaş',
    level: 'İlkokul (1-4) & Ortaokul (5-8)',
    studentCount: 720,
    teacherCount: 42,
    principalName: 'Kemal SOYSAL',
    phone: '+90 (212) 500 28 03',
    email: 'bilgi@oxonom.com',
    status: 'active',
    licenseExpires: '31.12.2027',
    planType: 'Enterprise Pro',
  },
  {
    id: 'sch-2',
    name: 'Kadıköy Atatürk İlkokulu',
    code: '741302',
    city: 'İstanbul',
    district: 'Kadıköy',
    level: 'İlkokul (1-4. Sınıflar)',
    studentCount: 540,
    teacherCount: 32,
    principalName: 'Selim AKTAŞ',
    phone: '+90 (216) 345 10 20',
    email: 'kadikoy.ataturk@meb.k12.tr',
    status: 'active',
    licenseExpires: '30.06.2027',
    planType: 'Standart Okul',
  },
  {
    id: 'sch-3',
    name: 'Çankaya Bilim ve Sanat Koleji',
    code: '741819',
    city: 'Ankara',
    district: 'Çankaya',
    level: 'K-12 (İlkokul, Ortaokul)',
    studentCount: 960,
    teacherCount: 58,
    principalName: 'Zeynep YILMAZ',
    phone: '+90 (312) 440 80 90',
    email: 'iletisim@cankayabilim.k12.tr',
    status: 'active',
    licenseExpires: '15.09.2027',
    planType: 'Enterprise Pro',
  },
  {
    id: 'sch-4',
    name: 'Nilüfer Gelişim Akademisi İlkokulu',
    code: '742110',
    city: 'Bursa',
    district: 'Nilüfer',
    level: 'İlkokul (1-4. Sınıflar)',
    studentCount: 380,
    teacherCount: 24,
    principalName: 'Murat ERDOĞAN',
    phone: '+90 (224) 211 44 55',
    email: 'bursa@nilufergelisim.com',
    status: 'pending',
    licenseExpires: '01.09.2027',
    planType: 'Deneme Lisansı (14 Gün)',
  },
]

export default function SuperadminSchoolsPage() {
  const [schools, setSchools] = useState<RegisteredSchool[]>(DEFAULT_SCHOOLS)
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
  const [formLevel, setFormLevel] = useState('İlkokul (1-4. Sınıflar)')
  const [formPrincipal, setFormPrincipal] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPlan, setFormPlan] = useState('Standart Okul')

  // Load schools from Supabase (or fallback to storage/defaults)
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
          setSchools(data as any)
          setSupabaseStatus({ configured: true, connected: true })
          setIsLoading(false)
          return
        }
      } catch (err) {
        console.warn('Supabase fetch error, using local fallback:', err)
      }
    }

    // Fallback to local storage or defaults
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oxonom_superadmin_schools')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSchools(parsed)
            setSupabaseStatus({ configured, connected: configured })
            setIsLoading(false)
            return
          }
        }
      } catch (_) {}
    }

    setSchools(DEFAULT_SCHOOLS)
    setSupabaseStatus({ configured, connected: configured })
    setIsLoading(false)
  }

  useEffect(() => {
    fetchSchools()
  }, [])

  // Create School Handler
  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formCode.trim()) {
      toast.error('Lütfen okul adı ve kurum kodunu giriniz.')
      return
    }

    const newSchool: RegisteredSchool = {
      id: `sch-${Date.now()}`,
      name: formName.trim(),
      code: formCode.trim(),
      city: formCity,
      district: formDistrict.trim() || 'Merkez',
      level: formLevel,
      studentCount: 180,
      teacherCount: 12,
      principalName: formPrincipal.trim() || 'Belirtilmedi',
      phone: formPhone.trim() || '+90 (212) 000 00 00',
      email: formEmail.trim() || 'iletisim@okul.k12.tr',
      status: 'active',
      licenseExpires: '31.12.2027',
      planType: formPlan,
    }

    // Attempt Supabase insert
    if (supabaseStatus.configured) {
      try {
        const client = getSupabaseBrowserClient()
        await client.from('schools').insert([newSchool])
      } catch (_) {}
    }

    // Local state & persistence
    const updated = [newSchool, ...schools]
    setSchools(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_superadmin_schools', JSON.stringify(updated))
      } catch (_) {}
    }

    toast.success(`🏫 "${newSchool.name}" başarıyla sisteme kaydedildi!`)
    setIsModalOpen(false)
    setFormName('')
    setFormCode('')
    setFormDistrict('')
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
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.principalName.toLowerCase().includes(q)
      )
    })
  }, [schools, cityFilter, statusFilter, search])

  // Cities List
  const cities = useMemo(() => {
    const set = new Set(schools.map((s) => s.city))
    return Array.from(set)
  }, [schools])

  return (
    <div className="space-y-6 font-jakarta">
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#17101C] border border-[#3A2942] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#D914C8]/15 text-[#FCE8FA] border border-[#D914C8]/30">
              <Building2 size={13} />
              <span>SaaS Okul & Kurum Yönetimi</span>
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
              <span className={`w-1.5 h-1.5 rounded-full ${supabaseStatus.configured ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`} />
              <span>
                {supabaseStatus.configured
                  ? 'Supabase Veritabanı Canlı Bağlı'
                  : 'Supabase Senkronize (Local Fallback)'}
              </span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Kayıtlı Okullar & Kurumlar
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Oxonom platformuna kayıtlı lisanslı okulları listeleyin, yeni okul ekleyin ve lisans durumlarını denetleyin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={fetchSchools}
            className="h-11 px-3.5 rounded-2xl bg-[#211729] hover:bg-[#2B1D36] text-[#E0D0E8] text-xs font-bold flex items-center gap-1.5 border border-[#49364F] transition-all cursor-pointer"
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
        <div className="p-4 rounded-2xl bg-[#17101C] border border-[#3A2942]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Toplam Okul</span>
          <div className="text-2xl font-black text-white mt-1">{schools.length}</div>
          <span className="text-[10px] text-emerald-400 font-bold">Kayıtlı kurum</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#17101C] border border-[#3A2942]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Aktif Lisanslar</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {schools.filter((s) => s.status === 'active').length}
          </div>
          <span className="text-[10px] text-gray-400">Canlı kullanımda</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#17101C] border border-[#3A2942]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Toplam Öğrenci</span>
          <div className="text-2xl font-black text-[#FCE8FA] mt-1">
            {schools.reduce((acc, s) => acc + s.studentCount, 0).toLocaleString('tr-TR')}
          </div>
          <span className="text-[10px] text-[#D914C8]">Platform kapasitesi</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#17101C] border border-[#3A2942]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Öğretmenler</span>
          <div className="text-2xl font-black text-indigo-300 mt-1">
            {schools.reduce((acc, s) => acc + s.teacherCount, 0)}
          </div>
          <span className="text-[10px] text-indigo-400">Aktif eğitimci</span>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#17101C] border border-[#3A2942]">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Okul adı, kurum kodu, ilçe veya müdür ara..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#211729] border border-[#49364F] text-xs text-white placeholder-gray-400 focus:outline-hidden focus:border-[#D914C8]"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#211729] border border-[#49364F] text-xs font-bold text-white focus:outline-hidden cursor-pointer"
          >
            <option value="all">Tüm Şehirler</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#211729] border border-[#49364F] text-xs font-bold text-white focus:outline-hidden cursor-pointer"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif Lisanslar</option>
            <option value="pending">Kurulumda / Deneme</option>
          </select>
        </div>
      </div>

      {/* ── SCHOOLS GRID / LIST ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSchools.map((sch) => (
          <div
            key={sch.id}
            className="p-6 rounded-3xl bg-[#17101C] border border-[#3A2942] hover:border-[#8D49A6] transition-all space-y-4 group shadow-md"
          >
            {/* Header: School Name, Status & Code */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D914C8] to-[#4B075F] text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md">
                  {sch.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-[#FCE8FA] transition-colors leading-snug">
                    {sch.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span className="font-mono text-[#D914C8]">MEB: {sch.code}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {sch.district} / {sch.city}
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
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#211729] border border-[#49364F]/60 text-center">
              <div>
                <span className="text-[10px] text-gray-400 block">Öğrenci</span>
                <span className="text-xs font-black text-white">{sch.studentCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Öğretmen</span>
                <span className="text-xs font-black text-white">{sch.teacherCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Paket</span>
                <span className="text-[11px] font-bold text-[#FCE8FA] truncate block">
                  {sch.planType}
                </span>
              </div>
            </div>

            {/* Contact & Principal Info */}
            <div className="space-y-1.5 text-xs text-gray-300">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-gray-400">Müdür:</span>
                <strong className="text-white font-bold">{sch.principalName}</strong>
              </div>
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-gray-400">Telefon:</span>
                <span className="font-mono text-gray-300">{sch.phone}</span>
              </div>
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-gray-400">E-Posta:</span>
                <span className="text-gray-300 truncate max-w-[200px]">{sch.email}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-[#3A2942]">
                <span>Kademe: {sch.level}</span>
                <span>Bitiş: {sch.licenseExpires}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MODAL: YENİ OKUL EKLE ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-lg bg-[#17101C] rounded-3xl border border-[#49364F] shadow-2xl p-6 space-y-4 z-10 text-white max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#3A2942]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D914C8] to-[#8D49A6] flex items-center justify-center text-white">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Yeni Okul / Kurum Ekle</h3>
                    <p className="text-xs text-gray-400">Oxonom platformuna yeni okul tanımlayın.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#211729] text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateSchool} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-300">Okul Resmi Adı:</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Örn: Kadıköy Atatürk İlkokulu"
                    className="w-full h-10 px-3 rounded-xl bg-[#211729] border border-[#49364F] text-white placeholder-gray-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-300">MEB Kurum Kodu:</label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="741295"
                      className="w-full h-10 px-3 rounded-xl bg-[#211729] border border-[#49364F] text-white placeholder-gray-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-300">Şehir:</label>
                    <select
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#211729] border border-[#49364F] text-white font-bold"
                    >
                      <option value="İstanbul">İstanbul</option>
                      <option value="Ankara">Ankara</option>
                      <option value="İzmir">İzmir</option>
                      <option value="Bursa">Bursa</option>
                      <option value="Antalya">Antalya</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-300">İlçe:</label>
                    <input
                      type="text"
                      value={formDistrict}
                      onChange={(e) => setFormDistrict(e.target.value)}
                      placeholder="Örn: Beşiktaş"
                      className="w-full h-10 px-3 rounded-xl bg-[#211729] border border-[#49364F] text-white placeholder-gray-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-300">Eğitim Kademesi:</label>
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#211729] border border-[#49364F] text-white font-bold"
                    >
                      <option value="İlkokul (1-4. Sınıflar)">İlkokul (1-4. Sınıflar)</option>
                      <option value="Ortaokul (5-8. Sınıflar)">Ortaokul (5-8. Sınıflar)</option>
                      <option value="İlkokul & Ortaokul (1-8. Sınıflar)">İlkokul & Ortaokul (1-8)</option>
                      <option value="K-12 Kolej">K-12 Kolej</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-300">Okul Müdürü / Kurum Yetkilisi:</label>
                  <input
                    type="text"
                    value={formPrincipal}
                    onChange={(e) => setFormPrincipal(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full h-10 px-3 rounded-xl bg-[#211729] border border-[#49364F] text-white placeholder-gray-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-300">İletişim Telefonu:</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+90 (212) 000 00 00"
                      className="w-full h-10 px-3 rounded-xl bg-[#211729] border border-[#49364F] text-white placeholder-gray-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-300">Resmi E-Posta:</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="bilgi@okul.k12.tr"
                      className="w-full h-10 px-3 rounded-xl bg-[#211729] border border-[#49364F] text-white placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-300">Lisans Paketi:</label>
                  <select
                    value={formPlan}
                    onChange={(e) => setFormPlan(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#211729] border border-[#49364F] text-white font-bold"
                  >
                    <option value="Standart Okul">Standart Okul (1 Yıllık)</option>
                    <option value="Enterprise Pro">Enterprise Pro (Sınırsız Tahta & Game Studio)</option>
                    <option value="Deneme Lisansı (14 Gün)">Deneme Lisansı (14 Gün)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#3A2942]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#211729] text-gray-400 hover:text-white font-bold cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white font-black cursor-pointer shadow-md shadow-[#D914C8]/25 active:scale-95 transition-all"
                  >
                    Okulu Kaydet
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
