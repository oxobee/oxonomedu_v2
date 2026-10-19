'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Settings,
  User,
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  LogOut,
  Save,
  Lock,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  Award,
  Sparkles,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react'
import { DEFAULT_STUDENT_PROFILE, getSynchronizedStudentProfile, type StudentProfile } from '@/lib/student/studentData'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import { signOut } from '@components/Contexts/AuthContext'
import MockBadge from '@components/Common/MockBadge'
import toast from 'react-hot-toast'

interface StudentSettingsViewProps {
  initialTab?: 'all' | 'profile' | 'notifications' | 'accessibility' | 'security'
}

export default function StudentSettingsView({
  initialTab = 'profile',
}: StudentSettingsViewProps) {
  const { theme, toggleTheme } = useMobileTheme()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'accessibility' | 'security'>(
    initialTab === 'all' ? 'profile' : initialTab
  )
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE)

  React.useEffect(() => {
    const sync = () => {
      setProfile(getSynchronizedStudentProfile())
    }
    sync()

    window.addEventListener('oxonom_student_updated', sync)
    window.addEventListener('oxonom_teacher_profile_updated', sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener('oxonom_student_updated', sync)
      window.removeEventListener('oxonom_teacher_profile_updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  // Notification toggles
  const [notifHomework, setNotifHomework] = useState(true)
  const [notifExams, setNotifExams] = useState(true)
  const [notifAnnouncements, setNotifAnnouncements] = useState(true)

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Öğrenci tercihleri ve ayarları başarıyla kaydedildi.')
  }

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('oxonom_student_profile')
        localStorage.removeItem('oxonom_current_role')
      } catch (_) {}
    }
    await signOut()
    window.location.href = '/loginv2'
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold mb-2">
            <Settings size={14} />
            <span>Hesap ve Tercihler</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Profilim ve Ayarlar
            </h1>
            <MockBadge label="Canlı Senkronize" />
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Öğrenci kimlik bilgileri, veli irtibatı, bildirim tercihleri ve güvenlik.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-[#131C31] border border-gray-200/80 dark:border-gray-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Öğrenci Profili
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Bildirimler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('accessibility')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'accessibility'
                ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Tema & Görünüm
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Güvenlik
          </button>
        </div>
      </div>

      {/* Tab 1: Profile (Resmi Öğrenci Kütük Kayıtları — /principal/students ile %100 Birebir Eşleşen Alanlar) */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Identity Pass Card */}
          <div className="p-6 lg:p-8 rounded-3xl bg-brand-gradient-dark text-white shadow-xl shadow-purple-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-purple-400/30 relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl text-white border border-white/20 shrink-0 shadow-inner">
                {(profile.firstName?.slice(0, 1) || 'E') + (profile.lastName?.slice(0, 1) || 'U')}
              </div>
              <div>
                <div className="text-xl font-black">{profile.name}</div>
                <div className="text-xs text-purple-200 mt-0.5">
                  {profile.schoolName || 'Oxonom Okulları'} · {profile.className} Şubesi
                </div>
                <div className="text-[11px] font-semibold text-purple-200 mt-1 flex items-center gap-2">
                  <Award size={13} />
                  <span>Okul No: {profile.studentNo} · TC: {profile.tcNo}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950 font-black">
                    MERNİS ONAYLI
                  </span>
                </div>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold shrink-0 text-white relative z-10 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-300" />
              <span>{profile.disciplineStatus}</span>
            </div>
          </div>

          {/* 1. KİMLİK & NÜFUS BİLGİLERİ (MERNİS RESMİ KÜTÜK) */}
          <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <User size={18} className="text-[#8D49A6]" />
                  <span>1. Kimlik & Nüfus Bilgileri (MERNİS Onaylı)</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Nüfus ve Vatandaşlık İşleri Genel Müdürlüğü ile senkronize resmi kayıtlar.
                </p>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
                Doğrulanmış Kayıt
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                  <Lock size={10} />
                  T.C. Kimlik Numarası
                </span>
                <div className="font-extrabold text-gray-900 dark:text-white font-mono flex items-center gap-2">
                  <span>{profile.tcNo}</span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black">
                    MERNİS ONAYLI
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                  <Lock size={10} />
                  Adı Soyadı
                </span>
                <div className="font-black text-gray-900 dark:text-white">{profile.name}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Cinsiyet & Kan Grubu</span>
                <div className="font-bold text-gray-900 dark:text-white">
                  {profile.gender || 'Erkek'} · <span className="text-red-600 dark:text-red-400 font-extrabold">{profile.bloodType || 'A Rh+'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Doğum Tarihi & Yeri</span>
                <div className="font-extrabold text-gray-900 dark:text-white">
                  {profile.birthDate || '15.06.2010'} (Kadıköy / İstanbul)
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Kronik Sağlık & Alerji</span>
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {profile.specialHealthNote || 'Herhangi bir sağlık engeli veya alerjisi bulunmamaktadır.'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Özel Eğitim / BEP & RAM Durumu</span>
                <div className="font-bold text-gray-700 dark:text-gray-300">
                  Standart Müfredat (BEP Raporu Yok)
                </div>
              </div>
            </div>
          </div>

          {/* 2. AKADEMİK & OKUL KÜTÜK BİLGİLERİ */}
          <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <GraduationCap size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <span>2. Akademik & Okul Kütük Bilgileri</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Okul müdürlüğü ve MEB e-Okul resmi kayıtları.
                </p>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
                e-Okul Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Kayıtlı Kurum</span>
                <div className="font-extrabold text-gray-900 dark:text-white">{profile.schoolName || 'Oxonom Okulları'}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Sınıf & Şube</span>
                <div className="font-extrabold text-[#4B075F] dark:text-[#C58ADB]">{profile.className} Şubesi (Derslik 101)</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Okul Numarası</span>
                <div className="font-black text-gray-900 dark:text-white font-mono">{profile.studentNo}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Sınıf Rehber Öğretmeni</span>
                <div className="font-bold text-gray-900 dark:text-white">{profile.mentorTeacher}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Kayıt Türü & Tarihi</span>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Yeni Kayıt · {profile.enrollmentDate || '01.09.2024'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Servis & Yemekhane</span>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Servis Yok · Öğle Yemeği + İkindi Kahvaltısı
                </div>
              </div>
            </div>
          </div>

          {/* 3. EBEVEYN & VELİ BİLGİLERİ */}
          <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <span>3. Ebeveyn & Veli İletişim Bilgileri</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Öğrenci işleri ve acil durum veli irtibat kütüğü.
                </p>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
                1. Derece Yakınlar
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Anne */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Anne Bilgileri</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300">
                    Öz Anne
                  </span>
                </div>
                <div className="font-black text-gray-900 dark:text-white text-sm">
                  {profile.parentName || 'Ebru UĞURLU'}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  Meslek: Mimar
                </div>
                <div className="flex items-center gap-2 text-[#4B075F] dark:text-[#C58ADB] font-bold">
                  <Phone size={13} />
                  <span>{profile.parentPhone || '+90 532 999 1100'}</span>
                </div>
              </div>

              {/* Baba */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Baba Bilgileri</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                    Öz Baba · Yasal Veli
                  </span>
                </div>
                <div className="font-black text-gray-900 dark:text-white text-sm">
                  {profile.secondParentName || 'Dr. Uğur UĞURLU'}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  Meslek: Kurum Müdürü
                </div>
                <div className="flex items-center gap-2 text-[#4B075F] dark:text-[#C58ADB] font-bold">
                  <Phone size={13} />
                  <span>{profile.secondParentPhone || '+90 532 999 2200'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. İKAMETGAH & ACİL DURUM İLETİŞİMİ */}
          <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin size={18} className="text-rose-500" />
                  <span>4. İkametgah & Acil Durum İletişimi</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Öğrencinin ikamet ettiği adres ve acil durumlarda ilk aranacak kişi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#8D49A6]" />
                  Kayıtlı Ev / İkamet Adresi
                </span>
                <div className="font-bold text-gray-900 dark:text-white leading-relaxed">
                  {profile.address || 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul'}
                </div>
                <div className="text-[10px] text-gray-400">Nüfus Müdürlüğü MERNİS onaylı yerleşim yeri</div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
                  <Phone size={12} className="text-rose-500" />
                  Acil Durum İletişim Numarası
                </span>
                <div className="font-extrabold text-gray-900 dark:text-white text-sm">
                  {profile.emergencyPhone || '+90 532 999 2200'}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Öncelikli arama veli ve kurum koordinatörü
                </div>
              </div>
            </div>
          </div>

          {/* 5. RESMİ EVRAK DURUMU */}
          <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <span>5. Resmi Evrak Kayıtları (Müdürlük & MEB e-Okul)</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Kayıt kütüğünde yer alan ve okul idaresi tarafından onaylanmış resmi belgeler.
                </p>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
                Evraklar Tam
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Nüfus Cüzdanı Sureti</span>
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>MERNİS Onaylı</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">İkametgah Belgesi</span>
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Onaylı</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Aşı & Sağlık Raporu</span>
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Sağlık Ocağı Onaylı</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">MEB e-Okul Kütük Kaydı</span>
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Aktif ve Onaylı</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Notifications */}
      {activeTab === 'notifications' && (
        <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Bildirim ve Uyarı Tercihleri
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Hangi durumlarda anlık push bildirimi ve e-posta almak istediğinizi belirleyin.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  Yeni Ödev ve Görev Bildirimleri
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Öğretmen yeni bir ödev tanımladığında veya son teslim yaklaştığında uyar
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifHomework}
                onChange={() => setNotifHomework(!notifHomework)}
                className="w-5 h-5 accent-cyan-600 rounded-md cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  Sınav Tarihi ve Sonuç Bildirimleri
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Sınav takviminde değişiklik olduğunda veya sınav notu yayımlandığında bildir
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifExams}
                onChange={() => setNotifExams(!notifExams)}
                className="w-5 h-5 accent-cyan-600 rounded-md cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  Okul ve Zümre Duyuruları
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Müdürlük ve 9-A rehber öğretmeninden gelen resmi duyurular
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifAnnouncements}
                onChange={() => setNotifAnnouncements(!notifAnnouncements)}
                className="w-5 h-5 accent-cyan-600 rounded-md cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Tercihleri Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Accessibility & Theme */}
      {activeTab === 'accessibility' && (
        <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Görünüm, Tema ve Erişilebilirlik
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Arayüz parlaklığı, renk teması ve yazı boyutu tercihleri.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                Arayüz Teması: {theme === 'dark' ? 'Koyu Mod (Dark)' : 'Açık Mod (Light)'}
              </div>
              <div className="text-[11px] text-gray-400">
                Göz yormayan karanlık mod ile aydınlık çalışma ortamı arasında geçiş yapın
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'security' && (
        <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Güvenlik ve Oturum Yönetimi
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Aktif öğrenci oturumu, parola güncelleme ve çıkış işlemleri.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-3">
            <ShieldCheck size={24} className="text-emerald-500 shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-emerald-900 dark:text-emerald-200">
                Güvenli SSL Bağlantısı Aktif
              </div>
              <div className="text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                Öğrenci oturumunuz uçtan uca şifrelenmiştir ve KVKK güvenlik standartlarına uygundur.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div className="text-xs text-gray-400">
              Bu cihazdaki aktif öğrenci oturumunu sonlandırmak için:
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Oturumu Kapat</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
