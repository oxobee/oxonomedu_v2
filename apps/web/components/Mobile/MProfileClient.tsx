'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCode,
  ChevronLeft,
  Settings,
  User,
  Lock,
  Upload,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  LogOut,
  Monitor,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Save,
  Briefcase,
  GraduationCap,
  Building,
  Phone,
  Mail,
  Clock,
  MapPin,
  BookOpen,
  Award,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ConnectBoardModal from '@components/DashboardV2/ConnectBoardModal'
import MobileFloatingDock from '@components/Mobile/MobileFloatingDock'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { signOut, useAuth } from '@components/Contexts/AuthContext'

interface MProfileClientProps {
  hideDock?: boolean
  initialSubTab?: 'general' | 'profile' | 'security'
  onBackToHome?: () => void
}

export default function MProfileClient({
  hideDock = false,
  initialSubTab = 'general',
  onBackToHome,
}: MProfileClientProps) {
  const { signOut: authSignOut } = useAuth()
  const session = useLHSession() as any
  const user = session?.data?.user

  // Active sub-tab in Profile: 'general' (Genel), 'profile' (Profil), 'security' (Güvenlik)
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'profile' | 'security'>(initialSubTab)

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('oxonom_dash_theme') as 'light' | 'dark' | null
      const isDark =
        savedTheme === 'dark' ||
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
      setTheme(isDark ? 'dark' : 'light')
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_dash_theme', next)
      document.documentElement.classList.toggle('dark', next === 'dark')
    }
  }

  // Connect board modal state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)

  // General Form States
  const [email, setEmail] = useState('neclagorer@oxonom.com')
  const [username, setUsername] = useState('ogretmen')
  const [firstName, setFirstName] = useState('Özlem')
  const [lastName, setLastName] = useState('ZOR')
  const [bio, setBio] = useState('1-A Sınıfı Öğretmeni · Oxonom İlkokul Dijital Eğitim Sorumlusu')
  const [extraDetails, setExtraDetails] = useState<string[]>([
    'Zümre Başkanı',
    'Temel Eğitim Uzmanı',
    'Akıllı Tahta Koordinatörü',
  ])

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)

  // Load from session or local storage if available
  useEffect(() => {
    if (user?.first_name) setFirstName(user.first_name)
    if (user?.last_name) setLastName(user.last_name)
    if (user?.email) setEmail(user.email)
    if (user?.username) setUsername(user.username)

    if (typeof window !== 'undefined') {
      try {
        const savedProfile = localStorage.getItem('oxonom_teacher_profile')
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile)
          if (parsed.email) setEmail(parsed.email)
          if (parsed.username) setUsername(parsed.username)
          if (parsed.firstName) setFirstName(parsed.firstName)
          if (parsed.lastName) setLastName(parsed.lastName)
          if (parsed.bio) setBio(parsed.bio)
          if (Array.isArray(parsed.extraDetails)) setExtraDetails(parsed.extraDetails)
        }
      } catch (_) {}
    }
  }, [user])

  // Save General Profile Changes
  const handleSaveGeneral = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'oxonom_teacher_profile',
        JSON.stringify({
          email,
          username,
          firstName,
          lastName,
          bio,
          extraDetails,
        })
      )
    }
    toast.success('Hesap bilgileri başarıyla kaydedildi!')
  }

  // Add detail tags
  const handleAddDetail = (type: 'Genel' | 'Akademik' | 'Profesyonel') => {
    const sampleDetails = {
      Genel: 'Rehberlik Koordinatörü',
      Akademik: 'Hacettepe Üniv. Sınıf Öğretmenliği',
      Profesyonel: 'MEB Sertifikalı Eğitmen',
    }
    const val = sampleDetails[type]
    if (!extraDetails.includes(val)) {
      setExtraDetails([...extraDetails, val])
      toast.success(`${type} detay eklendi.`)
    }
  }

  const handleClearDetails = () => {
    setExtraDetails([])
    toast.success('Tüm ek detaylar temizlendi.')
  }

  // Change Password
  const handleUpdatePassword = () => {
    if (!currentPassword) {
      toast.error('Lütfen mevcut şifrenizi girin.')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır.')
      return
    }
    toast.success('Şifreniz başarıyla güncellendi! Güvenlik gereği oturum yenileniyor...')
    setTimeout(() => {
      signOut({ redirect: true, callbackUrl: '/m-login' })
    }, 1500)
  }

  // Handle Logout
  const handleSignOutClick = async () => {
    toast.loading('Oturum kapatılıyor...', { id: 'logout-toast' })
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('oxonom_pano_paired_session')
        localStorage.removeItem('oxonom_pano_active_session_id')
        localStorage.removeItem('oxonom_pano_device_token')
        localStorage.removeItem('oxonom_pano_device_type')
        localStorage.removeItem('oxonom_selected_class')
        localStorage.removeItem('oxonom_pano_selected_class_id')
        sessionStorage.clear()
      }
      await authSignOut({ redirect: true, callbackUrl: '/m-login' })
    } catch {
      await signOut({ redirect: true, callbackUrl: '/m-login' })
    }
  }

  return (
    <div
      className={`${theme} min-h-[100dvh] w-full bg-[#F3F5F8] dark:bg-[#0A0D15] font-jakarta text-[#0F172A] dark:text-white flex justify-center selection:bg-[#34D399]/30 transition-colors duration-200`}
    >
      <div className="w-full max-w-[430px] min-h-screen flex flex-col relative pb-28">
        {/* ── 1. UNIFIED MOBILE HEADER (Static / Fixed: Adaptive Light with Black Logo / Dark with White Logo) ── */}
        <header
          className="w-full bg-white dark:bg-[#0A0D15] pt-[max(1rem,env(safe-area-inset-top))] pb-3.5 px-5 flex items-center justify-between text-gray-900 dark:text-white rounded-b-[10px] sticky top-0 z-30 relative before:absolute before:-top-96 before:inset-x-0 before:h-96 before:bg-white dark:before:bg-[#0A0D15] before:pointer-events-none border-b border-gray-200/80 dark:border-transparent shadow-xs dark:shadow-none transition-colors"
          style={
            theme === 'dark'
              ? {
                  backgroundImage:
                    'linear-gradient(45deg,rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(-45deg,rgba(255,255,255,.05) 1px,transparent 1px)',
                  backgroundSize: '26px 26px',
                }
              : {
                  backgroundImage:
                    'linear-gradient(45deg,rgba(0,0,0,.025) 1px,transparent 1px),linear-gradient(-45deg,rgba(0,0,0,.025) 1px,transparent 1px)',
                  backgroundSize: '26px 26px',
                }
          }
        >
          <div className="flex items-center gap-2">
            <Link href="/dashv2" className="flex items-center active:scale-95 transition-transform py-0.5">
              <img
                src={theme === 'dark' ? '/oxonom-edu-logo-transparent.png' : '/oxonom_edu_logo_black.png'}
                alt="OXONOM edu."
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-transparent flex items-center justify-center transition-all cursor-pointer"
              title={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
            >
              {theme === 'dark' ? (
                <Sun size={15} className="text-amber-300" />
              ) : (
                <Moon size={15} className="text-gray-700" />
              )}
            </button>

            {/* QR Connect Button */}
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              aria-label="QR kod ile bağlan"
              className="w-[46px] h-[46px] rounded-[14px] border border-gray-200/80 dark:border-white/20 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-white flex items-center justify-center cursor-pointer transition-all shadow-xs"
            >
              <QrCode size={21} strokeWidth={1.8} />
            </button>
          </div>
        </header>

        {/* ── STAGGERED PAGE CONTENT WRAPPER (Fluid Left Entrance) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col flex-1 w-full dash-stagger-items"
        >

        {/* ── 2. SUBBAR & BREADCRUMB ── */}
        <div className="px-5 pt-4 flex items-center gap-2.5">
          {/* Back Button */}
          <Link
            href="/dashv2"
            onClick={(e) => {
              if (onBackToHome) {
                e.preventDefault()
                onBackToHome()
              }
            }}
            aria-label="Geri"
            className="w-10 h-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121826] text-gray-800 dark:text-gray-200 flex items-center justify-center shrink-0 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
          >
            <ChevronLeft size={20} strokeWidth={2.2} />
          </Link>

          {/* Breadcrumb Pill */}
          <nav aria-label="Konum" className="flex-1 min-w-0 flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <Link
              href="/dashv2"
              onClick={(e) => {
                if (onBackToHome) {
                  e.preventDefault()
                  onBackToHome()
                }
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Ana Sayfa
            </Link>
            <span className="text-gray-400">/</span>
            <span className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white font-bold shadow-xs truncate">
              <Settings size={13} className="text-[#4338CA] dark:text-indigo-400 shrink-0" />
              <span className="truncate">Hesap Ayarları</span>
            </span>
          </nav>

          {/* Class Pill */}
          <span className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-[#E3F3EF] dark:bg-emerald-950/60 text-[#0F766E] dark:text-emerald-300 text-xs font-black shrink-0 border border-emerald-200/40 dark:border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            1-A
          </span>
        </div>

        {/* ── 3. HERO PROFILE CARD WITH 3 SUB-TABS (Matching Reference Mockups) ── */}
        <section className="mx-5 mt-3.5 bg-[#0A0D15] rounded-3xl p-4 sm:p-4.5 text-white flex flex-col gap-3.5 shadow-xl border border-gray-800/80 relative overflow-hidden">
          {/* Subtle grid pattern & glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(45deg,rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(-45deg,rgba(255,255,255,.05) 1px,transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Teacher Identity Row */}
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-white/25 text-slate-300 flex items-center justify-center shrink-0 shadow-md">
              <User size={28} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-tight truncate">
                {firstName} {lastName}
              </h1>
              <div className="text-xs text-slate-300 font-medium mt-0.5">
                @{username} · <span className="text-emerald-400 font-semibold">Öğretmen</span>
              </div>
            </div>
          </div>

          {/* 3 Sub-Tabs Switcher Bar */}
          <div className="relative z-10 grid grid-cols-3 gap-2 p-1 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
            {/* 1. Genel */}
            <button
              type="button"
              onClick={() => setActiveSubTab('general')}
              className={`h-10 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'general'
                  ? 'bg-[#34D399] text-[#0A0D15] shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Settings size={14} strokeWidth={2} />
              <span>Genel</span>
            </button>

            {/* 2. Profil */}
            <button
              type="button"
              onClick={() => setActiveSubTab('profile')}
              className={`h-10 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'profile'
                  ? 'bg-[#34D399] text-[#0A0D15] shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <User size={14} strokeWidth={2} />
              <span>Profil</span>
            </button>

            {/* 3. Güvenlik */}
            <button
              type="button"
              onClick={() => setActiveSubTab('security')}
              className={`h-10 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'security'
                  ? 'bg-[#34D399] text-[#0A0D15] shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Lock size={14} strokeWidth={2} />
              <span>Güvenlik</span>
            </button>
          </div>
        </section>

        {/* ── 4. TAB CONTENTS ── */}
        <main className="flex-1 px-5 pt-3.5 space-y-4">
          {/* ========================================================= */}
          {/* ── TAB 1: GENEL (Matching Settings.dc.html Reference) ── */}
          {/* ========================================================= */}
          {activeSubTab === 'general' && (
            <motion.div
              key="subtab-general"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* Section Header */}
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  <span className="w-4 h-1 rounded-full bg-[#34D399]" />
                  <span>HESAP AYARLARI</span>
                  <span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Kişisel bilgilerinizi ve tercihlerinizi yönetin
                </p>
              </div>

              {/* Card 1: Profil Resmi */}
              <section className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-4 shadow-sm flex items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 text-slate-300 flex items-center justify-center shrink-0 shadow-md">
                  <User size={46} strokeWidth={1.5} />
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="text-xs sm:text-[13px] font-extrabold text-gray-900 dark:text-white">
                    Profil Resmi
                  </div>

                  <button
                    type="button"
                    onClick={() => toast.success('Avatar yükleme penceresi açıldı.')}
                    className="h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2234] text-gray-900 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors shadow-2xs"
                  >
                    <Upload size={14} className="text-gray-500 dark:text-gray-400" />
                    <span>Avatarı Değiştir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.success('Yapay zeka avatarınız oluşturuluyor...')}
                    className="h-9 px-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/40 text-[#4338CA] dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                  >
                    <Sparkles size={14} />
                    <span>Generate with AI</span>
                  </button>

                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Info size={12} />
                    <span>Önerilen boyut 100x100</span>
                  </div>
                </div>
              </section>

              {/* Card 2: Form Bilgileri */}
              <section className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col gap-3.5">
                {/* E-posta */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-900 dark:text-white block">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta"
                    className="w-full h-12 px-3.5 rounded-2xl bg-[#F6F8FC] dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Kullanıcı adı */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-900 dark:text-white block">
                    Kullanıcı adı
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Kullanıcı adınız"
                    className="w-full h-12 px-3.5 rounded-2xl bg-[#F6F8FC] dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Ad - Soyad (2 Sütun) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900 dark:text-white block">
                      Ad
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Adınız"
                      className="w-full h-12 px-3.5 rounded-2xl bg-[#F6F8FC] dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900 dark:text-white block">
                      Soyad
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Soyadınız"
                      className="w-full h-12 px-3.5 rounded-2xl bg-[#F6F8FC] dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white outline-hidden focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Biyografi */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-gray-900 dark:text-white">
                      Biyografi
                    </label>
                    <span className="text-gray-400 font-medium">
                      ({Math.max(0, 400 - bio.length)} karakter kaldı)
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 400))}
                    placeholder="Bize kendinizden bahsedin..."
                    className="w-full p-3.5 rounded-2xl bg-[#F6F8FC] dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-900 dark:text-white outline-hidden focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>
              </section>

              {/* Card 3: Ek Detaylar */}
              <section className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                    Ek Detaylar
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {extraDetails.length} etiket
                  </span>
                </div>

                {/* Mevcut Etiketler */}
                {extraDetails.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {extraDetails.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-bold"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => setExtraDetails(extraDetails.filter((_, i) => i !== idx))}
                          className="hover:text-rose-500 text-gray-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Eylemler: Tümünü Temizle & Detay Ekle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClearDetails}
                    className="flex-1 h-10 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-[#121826] text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    Tümünü Temizle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDetail('Genel')}
                    className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121826] text-gray-900 dark:text-white text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Detay Ekle
                  </button>
                </div>

                {/* Hızlı Ekleme Butonları */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAddDetail('Genel')}
                    className="h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F6F8FC] dark:bg-[#0E131F] text-gray-900 dark:text-white text-xs font-bold flex items-center gap-2 hover:border-indigo-400 transition-colors"
                  >
                    <Briefcase size={14} className="text-[#4338CA] dark:text-indigo-400" />
                    <span>Genel Ekle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDetail('Akademik')}
                    className="h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F6F8FC] dark:bg-[#0E131F] text-gray-900 dark:text-white text-xs font-bold flex items-center gap-2 hover:border-indigo-400 transition-colors"
                  >
                    <GraduationCap size={15} className="text-[#4338CA] dark:text-indigo-400" />
                    <span>Akademik Ekle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDetail('Profesyonel')}
                    className="h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F6F8FC] dark:bg-[#0E131F] text-gray-900 dark:text-white text-xs font-bold flex items-center gap-2 hover:border-indigo-400 transition-colors"
                  >
                    <Award size={15} className="text-[#4338CA] dark:text-indigo-400" />
                    <span>Profesyonel Ekle</span>
                  </button>
                </div>
              </section>

              {/* Değişiklikleri Kaydet Butonu */}
              <button
                type="button"
                onClick={handleSaveGeneral}
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#0A0D15] to-[#1E293B] dark:from-[#131c31] dark:to-[#1e293b] text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-98 transition-all cursor-pointer border border-gray-800/80"
              >
                <Save size={18} className="text-[#34D399]" />
                <span>Değişiklikleri Kaydet</span>
              </button>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* ── TAB 2: PROFİL (Öğretmen Kartı ve Kurum Bilgileri) ── */}
          {/* ========================================================= */}
          {activeSubTab === 'profile' && (
            <motion.div
              key="subtab-profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* Section Header */}
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  <span className="w-4 h-1 rounded-full bg-[#34D399]" />
                  <span>KURUM & GÖREV KİMLİĞİ</span>
                  <span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Resmi okul kaydı, görevli şube ve yetki bilgileri
                </p>
              </div>

              {/* Okul & Görev Detayları Kartı */}
              <section className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Building size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-gray-900 dark:text-white">
                      Necla Görer İlkokulu
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      MEB Temel Eğitim Genel Müdürlüğü
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-[#F6F8FC] dark:bg-[#0E131F] border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">
                      GÖREV
                    </span>
                    <span className="font-extrabold text-gray-900 dark:text-white mt-0.5 block">
                      Sınıf Öğretmeni
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F6F8FC] dark:bg-[#0E131F] border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">
                      ŞUBE
                    </span>
                    <span className="font-extrabold text-gray-900 dark:text-white mt-0.5 block">
                      1-A Şubesi (30 Öğrenci)
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F6F8FC] dark:bg-[#0E131F] border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">
                      BAŞLANGIÇ
                    </span>
                    <span className="font-extrabold text-gray-900 dark:text-white mt-0.5 block">
                      2018 · 8. Hizmet Yılı
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F6F8FC] dark:bg-[#0E131F] border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">
                      SİCİL NO
                    </span>
                    <span className="font-mono font-extrabold text-gray-900 dark:text-white mt-0.5 block">
                      MEB-342019
                    </span>
                  </div>
                </div>
              </section>

              {/* İletişim & Veli Görüşme Kartı */}
              <section className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                  İLETİŞİM & VELİ RANDEVULARI
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                    <Mail size={15} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">ozlem.zor@meb.k12.tr</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                    <Phone size={15} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">+90 (532) 555 01 23</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                    <Clock size={15} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Veli Görüşme: Çarşamba 13:30 - 15:00
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                    <MapPin size={15} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Derslik: A Blok · Zemin Kat · 101 Nolu Salon
                    </span>
                  </div>
                </div>
              </section>

              {/* Aktif Dersler Kartı */}
              <section className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                  VERİLEN BRANŞ DERSLERİ
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40 flex items-center gap-2">
                    <BookOpen size={14} />
                    <span>Türkçe (1-A)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 flex items-center gap-2">
                    <BookOpen size={14} />
                    <span>Matematik (1-A)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-2">
                    <BookOpen size={14} />
                    <span>Hayat Bilgisi (1-A)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 flex items-center gap-2">
                    <BookOpen size={14} />
                    <span>Görsel Sanatlar (1-A)</span>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* ── TAB 3: GÜVENLİK (Matching Security.dc.html Reference) ─ */}
          {/* ========================================================= */}
          {activeSubTab === 'security' && (
            <motion.div
              key="subtab-security"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* Section Header 1 */}
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  <span className="w-4 h-1 rounded-full bg-[#34D399]" />
                  <span>MEVCUT OTURUM</span>
                  <span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Şu anda giriş yaptığınız cihaz
                </p>
              </div>

              {/* Card 1: Mevcut Oturum */}
              <section className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E4F0FC] dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Monitor size={20} strokeWidth={1.8} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
                    Chrome · macOS
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    <span>Bu cihaz</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOutClick}
                  className="h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2234] text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                >
                  <LogOut size={14} />
                  <span>Çıkış yap</span>
                </button>
              </section>

              {/* Section Header 2 */}
              <div className="pt-1">
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  <span className="w-4 h-1 rounded-full bg-[#34D399]" />
                  <span>ŞİFRE DEĞİŞTİR</span>
                  <span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Hesabınızı güvende tutmak için şifrenizi güncelleyin
                </p>
              </div>

              {/* Card 2: Şifre Değiştir Formu */}
              <section className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col gap-3.5">
                {/* Mevcut Şifre */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-900 dark:text-white block">
                    Mevcut Şifre
                  </label>
                  <div className="flex items-center h-12 px-3.5 rounded-2xl bg-[#F6F8FC] dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Mevcut şifreniz"
                      className="flex-1 bg-transparent text-sm font-semibold text-gray-900 dark:text-white outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Yeni Şifre */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-900 dark:text-white block">
                    Yeni Şifre
                  </label>
                  <div className="flex items-center h-12 px-3.5 rounded-2xl bg-[#F6F8FC] dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Yeni şifreniz"
                      className="flex-1 bg-transparent text-sm font-semibold text-gray-900 dark:text-white outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Uyarı Kutusu */}
                <div className="flex items-center gap-2.5 bg-[#FDF6E3] dark:bg-amber-950/40 border border-[#F5D9A8] dark:border-amber-800/60 rounded-2xl p-3 text-[#92400E] dark:text-amber-200 text-xs font-bold leading-relaxed">
                  <AlertTriangle size={18} className="shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Şifrenizi değiştirdikten sonra tüm cihazlardan çıkış yapılacaksınız</span>
                </div>

                {/* Şifreyi Güncelle Butonu */}
                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#0A0D15] to-[#1E293B] dark:from-[#131c31] dark:to-[#1e293b] text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-98 transition-all cursor-pointer border border-gray-800/80"
                >
                  <Lock size={16} className="text-[#34D399]" />
                  <span>Şifreyi Güncelle</span>
                </button>
              </section>

              {/* Section Header 3 */}
              <div className="pt-1">
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  <span className="w-4 h-1 rounded-full bg-[#34D399]" />
                  <span>İKİ FAKTÖRLÜ KİMLİK DOĞRULAMA</span>
                  <span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Giriş yaptığınızda kimlik doğrulama uygulamanızdan tek kullanımlık bir kod isteyin
                </p>
              </div>

              {/* Card 3: 2FA */}
              <section className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#F1F4F9] dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                    <Shield size={20} strokeWidth={1.8} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                        {is2FAEnabled ? 'Etkinleştirildi' : 'Etkinleştirilmedi'}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          is2FAEnabled
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-[#FDF0DC] text-[#92400E] dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {is2FAEnabled ? 'AÇIK' : 'KAPALI'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      Hesabınızı korumak için, oturum açarken kimlik doğrulama uygulamanızdan tek
                      kullanımlık bir kod da isteyin.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIs2FAEnabled(!is2FAEnabled)
                    toast.success(
                      !is2FAEnabled
                        ? 'İki faktörlü kimlik doğrulama (2FA) aktifleştirildi.'
                        : 'İki faktörlü kimlik doğrulama devre dışı bırakıldı.'
                    )
                  }}
                  className="w-full h-12 rounded-2xl bg-[#34D399] hover:bg-[#2fe0a0] active:scale-98 text-[#0A0D15] text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <ShieldCheck size={18} strokeWidth={2.2} />
                  <span>{is2FAEnabled ? '2FA Durumunu Güncelle' : 'Onayla'}</span>
                </button>
              </section>
            </motion.div>
          )}

          {/* ── EN ALT KISIM: OTURUMU KAPAT BUTONU (KIRMIZI ŞIK TASARIM) ── */}
          <section className="pt-2 pb-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSignOutClick}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-rose-500/25 dark:shadow-rose-950/50 border border-rose-400/30 active:shadow-sm transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                <LogOut size={16} className="text-white" />
              </div>
              <span>Oturumu Kapat</span>
            </motion.button>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-2.5 font-medium">
              Oxonom EDU oturumunuz bu cihazda güvenle sonlandırılır.
            </p>
          </section>
        </main>
      </motion.div>

      {/* ── 5. SINGLE DOCK (WHEN RENDERED STANDALONE) ── */}
      {!hideDock && <MobileFloatingDock activeTab="profile" />}

        {/* ── 6. CONNECT BOARD MODAL ── */}
        <ConnectBoardModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
          theme={theme}
        />
      </div>
    </div>
  )
}
