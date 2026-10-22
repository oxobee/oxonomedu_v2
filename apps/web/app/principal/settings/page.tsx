'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  User,
  Lock,
  Save,
  CheckCircle2,
  LogOut,
  Bell,
  Sparkles,
  School,
  MapPin,
  Globe,
  Hash,
  Award,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { signOut } from '@components/Contexts/AuthContext'
import {
  getStoredPrincipalProfile,
  savePrincipalProfile,
  getStoredSchoolInfo,
  saveSchoolInfo,
  getPrincipalInitials,
} from '@/lib/principal/principalProfileStorage'

export default function PrincipalSettingsPage() {
  // Principal Profile
  const [profile, setProfile] = useState({
    name: 'Dr. Uğur UĞURLU',
    title: 'Okul Müdürü · Kurum Yetkilisi',
    email: 'mudur@oxonom.com',
    tcNo: '10000000146',
    phone: '+90 532 999 2200',
    twoFactorActive: true,
  })

  // Official School Details
  const [schoolInfo, setSchoolInfo] = useState({
    officialName: 'Necla Görer İlkokulu',
    institutionCode: '741295',
    educationLevel: 'İlkokul (1-4. Sınıflar)',
    city: 'İstanbul',
    district: 'Kadıköy',
    address: 'Fenerbahçe Mah. Lale Sk. No:14 Kadıköy / İstanbul',
    schoolPhone: '+90 (216) 414 10 20',
    schoolEmail: 'bilgi@neclagorer.k12.tr',
    website: 'https://neclagorer.k12.tr',
    term: '2025-2026 Bahar Dönemi',
  })

  const [twoFactor, setTwoFactor] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(true)

  useEffect(() => {
    const loadData = () => {
      const storedProfile = getStoredPrincipalProfile()
      const storedSchool = getStoredSchoolInfo()

      setProfile({
        name: storedProfile.name,
        title: storedProfile.title,
        email: storedProfile.email,
        tcNo: storedProfile.tcNo,
        phone: storedProfile.phone,
        twoFactorActive: storedProfile.twoFactorActive,
      })
      setTwoFactor(storedProfile.twoFactorActive)
      setSchoolInfo((prev) => ({
        ...prev,
        ...storedSchool,
        officialName: storedProfile.schoolName || storedSchool.officialName,
      }))
    }

    loadData()
    window.addEventListener('oxonom_admin_updated', loadData)
    window.addEventListener('oxonom_principal_updated', loadData)
    window.addEventListener('oxonom_school_updated', loadData)
    window.addEventListener('storage', loadData)

    return () => {
      window.removeEventListener('oxonom_admin_updated', loadData)
      window.removeEventListener('oxonom_principal_updated', loadData)
      window.removeEventListener('oxonom_school_updated', loadData)
      window.removeEventListener('storage', loadData)
    }
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    const updatedSchool = saveSchoolInfo({
      ...schoolInfo,
      officialName: schoolInfo.officialName.trim(),
    })

    const updatedProfile = savePrincipalProfile({
      name: profile.name.trim(),
      title: profile.title.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
      tcNo: profile.tcNo.trim(),
      twoFactorActive: twoFactor,
      schoolName: schoolInfo.officialName.trim(),
    })

    setProfile({
      name: updatedProfile.name,
      title: updatedProfile.title,
      email: updatedProfile.email,
      tcNo: updatedProfile.tcNo,
      phone: updatedProfile.phone,
      twoFactorActive: updatedProfile.twoFactorActive,
    })
    setSchoolInfo(updatedSchool)

    toast.success('Okul resmi bilgileri ve yönetici ayarları kalıcı olarak kaydedildi!')
  }

  const handleAdminLogout = async () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('oxonom_active_admin_session')
        localStorage.removeItem('oxonom_current_role')
      } catch (_) {}
    }
    toast.success('Yönetici oturumu kapatıldı.')
    await signOut()
    window.location.href = '/login'
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">
            <Settings size={15} />
            <span>Kurumsal İdare & Güvenlik</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Okul & Kurum Bilgileri ve Profil Ayarları
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Okul resmi adı, MEB kurum kodu, iletişim kanalları, müdür kimliği ve güvenlik tercihleri
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdminLogout}
          className="h-10 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer border border-rose-200 dark:border-rose-900/40 self-start sm:self-auto"
        >
          <LogOut size={14} />
          <span>Oturumu Kapat</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Profile & Status Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-emerald-500/20">
              {getPrincipalInitials(profile.name)}
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-white">{profile.name}</h2>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{profile.title}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{schoolInfo.officialName}</p>
            </div>

            <div className="w-full pt-4 border-t border-gray-100 dark:border-gray-800/80 space-y-2.5 text-left text-xs">
              <div className="flex items-center justify-between text-gray-500">
                <span>Yetki Düzeyi</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">1. Derece Baş Yönetici</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>MEB Kurum Kodu</span>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{schoolInfo.institutionCode}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>T.C. Kimlik</span>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{profile.tcNo}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>Sistem Durumu</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Çevrimiçi Aktif
                </span>
              </div>
            </div>
          </div>

          {/* Quick Notification Settings */}
          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell size={16} className="text-emerald-600" />
              <span>Bildirim Tercihleri</span>
            </h3>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#161D2E] border border-gray-100 dark:border-gray-800">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  SMS / E-Posta İkazları
                </div>
                <div className="text-[10px] text-gray-400">Kritik devamsızlık ve acil durum uyarıları</div>
              </div>
              <button
                type="button"
                onClick={() => setSmsNotifications(!smsNotifications)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  smsNotifications ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <motion.div
                  className="w-4.5 h-4.5 rounded-full bg-white shadow-xs absolute top-0.5 left-0.5"
                  animate={{ x: smsNotifications ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Edit School Details & Manager Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Official School Information */}
          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 size={16} className="text-emerald-600" />
              <span>Okul ve Kurum Resmi Bilgileri</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Okulun Resmi Adı (Kurum Tabelası & Rapor Anteti)
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-3 text-gray-400" size={15} />
                  <input
                    type="text"
                    required
                    value={schoolInfo.officialName}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, officialName: e.target.value })}
                    className="w-full h-10 pl-9 pr-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                    placeholder="Örn: Necla Görer İlkokulu"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  MEB Kurum Kodu
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 text-gray-400" size={15} />
                  <input
                    type="text"
                    required
                    value={schoolInfo.institutionCode}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, institutionCode: e.target.value })}
                    className="w-full h-10 pl-9 pr-3 text-xs font-mono bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                    placeholder="741295"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Eğitim Kademesi / Okul Türü
                </label>
                <input
                  type="text"
                  value={schoolInfo.educationLevel}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, educationLevel: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  İl
                </label>
                <input
                  type="text"
                  value={schoolInfo.city}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, city: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  İlçe
                </label>
                <input
                  type="text"
                  value={schoolInfo.district}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, district: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Resmi Kurum Adresi
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={15} />
                  <input
                    type="text"
                    value={schoolInfo.address}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                    className="w-full h-10 pl-9 pr-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Kurumsal Telefon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={15} />
                  <input
                    type="tel"
                    value={schoolInfo.schoolPhone}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolPhone: e.target.value })}
                    className="w-full h-10 pl-9 pr-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Kurumsal E-Posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={15} />
                  <input
                    type="email"
                    value={schoolInfo.schoolEmail}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolEmail: e.target.value })}
                    className="w-full h-10 pl-9 pr-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Kurumsal Web Sitesi
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 text-gray-400" size={15} />
                  <input
                    type="url"
                    value={schoolInfo.website}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, website: e.target.value })}
                    className="w-full h-10 pl-9 pr-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Manager Profile Information */}
          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <User size={16} className="text-emerald-600" />
              <span>Müdür ve Yetkili Profil Ayarları</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Müdür Adı Soyadı
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Resmi Görev / Ünvan
                </label>
                <input
                  type="text"
                  required
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  T.C. Kimlik Numarası
                </label>
                <input
                  type="text"
                  maxLength={11}
                  required
                  value={profile.tcNo}
                  onChange={(e) => setProfile({ ...profile, tcNo: e.target.value })}
                  className="w-full h-10 px-3.5 text-xs font-mono bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Yetkili İletişim Telefonu
                </label>
                <input
                  type="tel"
                  required
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Yetkili E-Posta
                </label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full h-10 px-3.5 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Security & 2FA */}
          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Güvenlik ve İki Adımlı Doğrulama (2FA)</span>
            </h3>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#161D2E] border border-gray-100 dark:border-gray-800">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  SMS / Authenticator ile İki Adımlı Giriş (2FA)
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Her yeni oturum açılışında kayıtlı yetkili telefonunuza tek kullanımlık güvenlik kodu gönderilir.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTwoFactor(!twoFactor)}
                className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                  twoFactor ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 left-0.5"
                  animate={{ x: twoFactor ? 22 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <Save size={15} />
              <span>Tüm Bilgileri Kaydet ve Güncelle</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
