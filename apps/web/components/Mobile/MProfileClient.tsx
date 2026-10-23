'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  Camera,
  Trash2,
  Calendar,
  CreditCard,
  FileCheck,
  CalendarClock,
  Download,
  Copy,
  Plus,
  X,
  FileText,
  DollarSign,
  Heart,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { submitProfileChangeRequest } from '@/lib/profile/profileChangeRequests'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileFloatingDock from '@components/Mobile/MobileFloatingDock'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { signOut, useAuth } from '@components/Contexts/AuthContext'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import { ALL_CLASSROOMS } from '@services/demo/schoolDirectory'

export interface MProfileClientProps {
  hideDock?: boolean
  hideHeader?: boolean
  theme?: 'light' | 'dark'
  onToggleTheme?: () => void
  initialSubTab?: 'ozluk' | 'gorev' | 'izin' | 'maas' | 'belgeler' | 'security'
  onBackToHome?: () => void
}

export type ProfileTabKey = 'ozluk' | 'gorev' | 'izin' | 'maas' | 'belgeler' | 'security'

export default function MProfileClient({
  hideDock = false,
  hideHeader = false,
  theme: propTheme,
  onToggleTheme: propToggleTheme,
  initialSubTab = 'ozluk',
  onBackToHome,
}: MProfileClientProps = {}) {
  const { signOut: authSignOut } = useAuth()
  const session = useLHSession() as any
  const user = session?.data?.user

  // Active categorical tab matching teacher screenshots
  const [activeSubTab, setActiveSubTab] = useState<ProfileTabKey>(initialSubTab)

  // Synchronized theme state
  const { theme: internalTheme, toggleTheme: internalToggleTheme } = useMobileTheme()
  const theme = propTheme || internalTheme
  const toggleTheme = propToggleTheme || internalToggleTheme

  // Avatar State & File Input Ref
  const [avatarImage, setAvatarImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  // ── 1. ÖZLÜK & KÜNYE STATE ──
  const [firstName, setFirstName] = useState('Ebru')
  const [lastName, setLastName] = useState('TEKNECİ')
  const [username, setUsername] = useState('ogretmen')
  const [email, setEmail] = useState('ogretmen@oxonom.com')
  const [phone, setPhone] = useState('+90 533 280 0399')
  const [tcNo, setTcNo] = useState('20000002803')
  const [birthDate, setBirthDate] = useState('1990-05-14 (36 Yaşında)')
  const [bloodType, setBloodType] = useState('A Rh+')
  const [graduationFaculty, setGraduationFaculty] = useState('Boğaziçi Üniversitesi Türk Dili ve Edebiyatı')
  const [graduationDiploma, setGraduationDiploma] = useState('2016 · DIP-84920')
  const [mebbisNo, setMebbisNo] = useState('MEB-34019284')
  const [address, setAddress] = useState('Beşiktaş / İstanbul')
  const [emergencyContact, setEmergencyContact] = useState('Eşi · +90 533 280 0399')
  const [bio, setBio] = useState(() => `Türk Dili ve Edebiyatı Öğretmeni · ${ALL_CLASSROOMS[0]?.code || '1/A'} Sınıf Rehber Öğretmeni · Oxonom Okulları`)

  // ── 2. GÖREV & DERSLER STATE ──
  const [branchTitle, setBranchTitle] = useState('Türk Dili ve Edebiyatı (Edebiyat Öğretmeni)')
  const [titleLevel, setTitleLevel] = useState('Uzman Öğretmen (9 Yıl)')
  const [employmentType, setEmploymentType] = useState('Kadrolu · MEB Kadrosu')
  const [homeroomClass, setHomeroomClass] = useState(() => `${ALL_CLASSROOMS[0]?.code || '1/A'} Şubesi`)
  const [weeklyLessonHours, setWeeklyLessonHours] = useState('30 Saat / Hafta')
  const [lessonDistribution, setLessonDistribution] = useState('15 Saat Maaş Karşılığı + 15 Saat Ek Ders')
  const [teachingClasses, setTeachingClasses] = useState(() => ALL_CLASSROOMS[0]?.code || '1/A')
  const [dutyDayLocation, setDutyDayLocation] = useState('Salı · 1. Kat Koridor & Bahçe Kapısı')
  const [clubAdvisory, setClubAdvisory] = useState('Satranç ve Akıl Oyunları Kulübü')
  const [workingHours, setWorkingHours] = useState('08:30 – 15:30 (Pazartesi – Cuma)')

  // ── 3. İZİN VE MESAİ STATE ──
  const [annualLeaveLeft, setAnnualLeaveLeft] = useState(16)
  const [excuseLeaveLeft, setExcuseLeaveLeft] = useState(8)
  const [medicalLeaveDays, setMedicalLeaveDays] = useState(2)
  const [isAddLeaveModalOpen, setIsAddLeaveModalOpen] = useState(false)
  const [newLeaveType, setNewLeaveType] = useState('Mazeret İzni')
  const [newLeaveDays, setNewLeaveDays] = useState(1)
  const [newLeaveDate, setNewLeaveDate] = useState('2026-10-15')
  const [newLeaveDesc, setNewLeaveDesc] = useState('')
  const [leaveHistory, setLeaveHistory] = useState([
    { id: 'lv-1', type: 'Mazeret İzni', days: '1 Gün', date: '12.02.2026', desc: 'Ailevi mazeret izni', status: 'Onaylandı' },
    { id: 'lv-2', type: 'Hizmetiçi Eğitim İzni', days: '2 Gün', date: '24.11.2025', desc: 'MEB ÖBA Dijital Eğitim Semineri', status: 'Onaylandı' },
    { id: 'lv-3', type: 'Sağlık Raporu', days: '2 Gün', date: '10.10.2025', desc: 'Devlet Hastanesi KBB İstirahat', status: 'Raporlu' },
  ])

  // ── 4. MAAŞ, AVANS & EK DERS STATE ──
  const [netSalary, setNetSalary] = useState('₺72.000 / Net')
  const [baseSalary, setBaseSalary] = useState('₺52.450')
  const [extraLessonPay, setExtraLessonPay] = useState('₺19.550')
  const [bankName, setBankName] = useState('Vakıfbank Kadıköy Şubesi')
  const [ibanNo, setIbanNo] = useState('TR45 0001 5001 5800 7392 1891 02')
  const [isAddAdvanceModalOpen, setIsAddAdvanceModalOpen] = useState(false)
  const [advanceAmount, setAdvanceAmount] = useState('10000')
  const [advanceNote, setAdvanceNote] = useState('')
  const [advanceList, setAdvanceList] = useState<any[]>([])

  // ── 5. ÖZLÜK BELGELERİ STATE ──
  const [documentsList, setDocumentsList] = useState([
    { id: 'doc-1', title: 'Lisans Diploması & Not Dökümü (Transkript)', size: 'PDF · 2.1 MB', status: 'Onaylı', color: 'emerald' },
    { id: 'doc-2', title: 'Pedagojik Formasyon Sertifikası', size: 'PDF · 1.4 MB', status: 'Onaylı', color: 'emerald' },
    { id: 'doc-3', title: 'Adli Sicil ve Arşiv Kayıt Belgesi (E-Devlet Barkodlu)', size: 'PDF · 650 KB', status: 'Doğrulandı', color: 'blue' },
    { id: 'doc-4', title: 'Sağlık Kurulu Heyet Raporu (Öğretmenlik)', size: 'PDF · 1.2 MB', status: 'Onaylı', color: 'blue' },
    { id: 'doc-5', title: 'Hizmet Sözleşmesi & SGK İşe Giriş Bildirgesi', size: 'PDF · 890 KB', status: 'İmzalı', color: 'emerald' },
  ])

  // ── 6. GÜVENLİK STATE ──
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)

  // Load from session or local storage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedProfile = localStorage.getItem('oxonom_teacher_profile')
        if (savedProfile) {
          const p = JSON.parse(savedProfile)
          if (p.firstName) setFirstName(p.firstName)
          if (p.lastName) setLastName(p.lastName)
          if (p.email) setEmail(p.email)
          if (p.phone) setPhone(p.phone)
          if (p.tcNo) setTcNo(p.tcNo)
          if (p.birthDate) setBirthDate(p.birthDate)
          if (p.bloodType) setBloodType(p.bloodType)
          if (p.graduationFaculty) setGraduationFaculty(p.graduationFaculty)
          if (p.graduationDiploma) setGraduationDiploma(p.graduationDiploma)
          if (p.mebbisNo) setMebbisNo(p.mebbisNo)
          if (p.address) setAddress(p.address)
          if (p.emergencyContact) setEmergencyContact(p.emergencyContact)
          if (p.bio) setBio(p.bio)
          if (p.branchTitle) setBranchTitle(p.branchTitle)
          if (p.titleLevel) setTitleLevel(p.titleLevel)
          if (p.homeroomClass) setHomeroomClass(p.homeroomClass)
          if (p.bankName) setBankName(p.bankName)
          if (p.ibanNo) setIbanNo(p.ibanNo)
          if (p.avatarImage) setAvatarImage(p.avatarImage)
          if (Array.isArray(p.leaveHistory)) setLeaveHistory(p.leaveHistory)
          if (Array.isArray(p.advanceList)) setAdvanceList(p.advanceList)
        }
      } catch (_) {}
    }
  }, [])

  // Universal Save Function with Feedback
  const handleSaveAllProfile = () => {
    try {
      const fullProfile = {
        firstName,
        lastName,
        username,
        email,
        phone,
        tcNo,
        birthDate,
        bloodType,
        graduationFaculty,
        graduationDiploma,
        mebbisNo,
        address,
        emergencyContact,
        bio,
        branchTitle,
        titleLevel,
        employmentType,
        homeroomClass,
        weeklyLessonHours,
        lessonDistribution,
        teachingClasses,
        dutyDayLocation,
        clubAdvisory,
        workingHours,
        annualLeaveLeft,
        excuseLeaveLeft,
        medicalLeaveDays,
        leaveHistory,
        netSalary,
        baseSalary,
        extraLessonPay,
        bankName,
        ibanNo,
        advanceList,
        avatarImage,
        updatedAt: new Date().toISOString(),
      }

      submitProfileChangeRequest({
        targetRole: 'teacher',
        requesterId: 'teacher-1',
        requesterName: `${firstName} ${lastName}`.trim() || 'Bahar ÇETİN',
        requesterIdentifier: `${homeroomClass || '1/A'} Sınıf Öğretmeni`,
        changes: [
          { fieldKey: 'phone', fieldLabel: 'Telefon Numarası', oldValue: '+90 (532) 111 22 33', newValue: phone },
          { fieldKey: 'email', fieldLabel: 'E-Posta Adresi', oldValue: 'ogretmen@oxonom.com', newValue: email },
          { fieldKey: 'address', fieldLabel: 'İkamet Adresi', oldValue: 'Kadıköy / İstanbul', newValue: address },
          { fieldKey: 'branchTitle', fieldLabel: 'Branş / Görev', oldValue: 'Sınıf Öğretmeni', newValue: branchTitle },
        ],
        payload: fullProfile,
      })

      if (typeof window !== 'undefined') {
        localStorage.setItem('oxonom_teacher_profile', JSON.stringify(fullProfile))
        window.dispatchEvent(
          new CustomEvent('oxonom_teacher_profile_updated', { detail: fullProfile })
        )
      }

      toast.success('📋 Profil güncellemeleriniz kaydedildi ve onay için Okul Müdürlüğüne iletildi!', {
        id: 'teacher-profile-save-success',
        duration: 5000,
        icon: '📋',
      })
    } catch (e) {
      toast.error('Güncelleme sırasında bir hata oluştu. Lütfen tekrar deneyin.', {
        id: 'teacher-profile-save-error',
      })
    }
  }

  // Handle Avatar Change
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası seçin.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setAvatarImage(dataUrl)
      toast.success('Profil fotoğrafı seçildi.')
    }
    reader.readAsDataURL(file)
  }

  // Copy IBAN Helper
  const handleCopyIban = () => {
    navigator.clipboard.writeText(ibanNo.replace(/\s+/g, ''))
    toast.success('IBAN panoya kopyalandı!')
  }

  // Handle Add Leave
  const handleAddLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newEntry = {
      id: `lv-${Date.now()}`,
      type: newLeaveType,
      days: `${newLeaveDays} Gün`,
      date: newLeaveDate,
      desc: newLeaveDesc.trim() || 'Personel izin talebi',
      status: 'Onaylandı',
    }
    setLeaveHistory([newEntry, ...leaveHistory])
    if (newLeaveType === 'Yıllık İzin') {
      setAnnualLeaveLeft((prev) => Math.max(0, prev - newLeaveDays))
    } else if (newLeaveType === 'Mazeret İzni') {
      setExcuseLeaveLeft((prev) => Math.max(0, prev - newLeaveDays))
    }
    setIsAddLeaveModalOpen(false)
    setNewLeaveDesc('')
    toast.success('Yeni izin talebi sisteme işlendi!')
  }

  // Handle Add Advance
  const handleAddAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newEntry = {
      id: `adv-${Date.now()}`,
      amount: `₺${Number(advanceAmount).toLocaleString('tr-TR')}`,
      date: new Date().toLocaleDateString('tr-TR'),
      note: advanceNote || 'Avans talebi',
      status: 'İnceleniyor',
    }
    setAdvanceList([newEntry, ...advanceList])
    setIsAddAdvanceModalOpen(false)
    setAdvanceNote('')
    toast.success('Avans talebi muhasebeye iletildi!')
  }

  // Handle Document Upload
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      size: `PDF · ${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      status: 'Onaylı',
      color: 'emerald',
    }
    setDocumentsList([newDoc, ...documentsList])
    toast.success(`"${file.name}" MEBBİS arşivine yüklendi!`)
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

  return (
    <div className="flex flex-col flex-1 w-full font-jakarta pb-12">
      {/* ── TOP HEADER / IDENTITY HERO ── */}
      <section className="mx-4 mt-3 bg-[#0A0D15] text-white rounded-[26px] p-5 shadow-xl border border-white/5 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 100% 0%,rgba(255,255,255,.15) 0%,rgba(255,255,255,0) 60%),linear-gradient(45deg,rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(-45deg,rgba(255,255,255,.04) 1px,transparent 1px)',
            backgroundSize: 'auto,24px 24px,24px 24px',
          }}
        />

        {/* Teacher Identity Row */}
        <div className="relative z-10 flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer group shrink-0"
              title="Profil resmini değiştirmek için dokunun"
            >
              {avatarImage ? (
                <img
                  src={avatarImage}
                  alt={`${firstName} ${lastName}`}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 shadow-md group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-white/25 text-slate-300 flex items-center justify-center shrink-0 shadow-md group-hover:border-emerald-400 transition-colors">
                  <User size={28} strokeWidth={1.8} />
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-gray-900 flex items-center justify-center shadow-xs border-2 border-[#0A0D15] group-hover:scale-110 transition-transform">
                <Camera size={10} strokeWidth={2.5} />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight truncate">
                  {firstName} {lastName}
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-[#0A0D15]">
                  Aktif Görevde
                </span>
              </div>
              <div className="text-xs text-slate-300 font-medium mt-0.5 truncate">
                {branchTitle} · <span className="text-emerald-400 font-bold">{homeroomClass}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveAllProfile}
            className="hidden sm:inline-flex h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] text-xs font-black items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Save size={14} />
            <span>Tümünü Kaydet</span>
          </button>
        </div>

        {/* ── 5 KATEGORİSEL SEKMELER PİLLS (Birebir Ekran Görüntüleri) ── */}
        <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 py-1">
          {[
            { id: 'ozluk', label: 'Özlük & Künye', icon: User },
            { id: 'gorev', label: 'Görev & Dersler', icon: Briefcase },
            { id: 'izin', label: 'İzin Talepleri & Mesai', icon: CalendarClock },
            { id: 'maas', label: 'Maaş, Avans & Ek Ders', icon: CreditCard },
            { id: 'belgeler', label: 'Özlük Belgeleri', icon: FileCheck },
            { id: 'security', label: 'Güvenlik', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeSubTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as ProfileTabKey)}
                className={`h-9 px-3.5 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-[#0A0D15] shadow-md shadow-emerald-500/20'
                    : 'bg-white/10 hover:bg-white/15 text-white/90'
                }`}
              >
                <Icon size={14} strokeWidth={2.2} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleDocumentUpload}
        className="hidden"
      />

      {/* ── TAB CONTENTS ── */}
      <main className="flex-1 px-4 pt-4 space-y-4">
        {/* ========================================================= */}
        {/* ── TAB 1: ÖZLÜK & KÜNYE (1. Görsel Birebir) ── */}
        {/* ========================================================= */}
        {activeSubTab === 'ozluk' && (
          <motion.div
            key="subtab-ozluk"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Künye Bilgileri Tablosu / Kartları */}
            <div className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-5 shadow-sm divide-y divide-gray-100 dark:divide-gray-800/80">
              {/* T.C. Kimlik No */}
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">T.C. Kimlik No</span>
                <input
                  type="text"
                  value={tcNo}
                  onChange={(e) => setTcNo(e.target.value)}
                  className="text-xs sm:text-sm font-mono font-black text-gray-900 dark:text-white bg-transparent border-none text-left sm:text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded p-1"
                />
              </div>

              {/* Doğum Tarihi & Yaş */}
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Doğum Tarihi & Yaş</span>
                <input
                  type="text"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white bg-transparent border-none text-left sm:text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded p-1"
                />
              </div>

              {/* Kan Grubu */}
              <div className="py-3 flex items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Kan Grubu</span>
                <div className="flex items-center gap-2">
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="text-xs font-black text-rose-600 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl px-2.5 py-1 focus:outline-none cursor-pointer"
                  >
                    <option value="A Rh+">A Rh+</option>
                    <option value="A Rh-">A Rh-</option>
                    <option value="B Rh+">B Rh+</option>
                    <option value="B Rh-">B Rh-</option>
                    <option value="AB Rh+">AB Rh+</option>
                    <option value="AB Rh-">AB Rh-</option>
                    <option value="0 Rh+">0 Rh+</option>
                    <option value="0 Rh-">0 Rh-</option>
                  </select>
                </div>
              </div>

              {/* Mezuniyet & Fakülte */}
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Mezuniyet & Fakülte</span>
                <input
                  type="text"
                  value={graduationFaculty}
                  onChange={(e) => setGraduationFaculty(e.target.value)}
                  className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white bg-transparent border-none text-left sm:text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded p-1 flex-1 sm:max-w-md"
                />
              </div>

              {/* Mezuniyet Yılı & Diploma */}
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Mezuniyet Yılı & Diploma</span>
                <input
                  type="text"
                  value={graduationDiploma}
                  onChange={(e) => setGraduationDiploma(e.target.value)}
                  className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white bg-transparent border-none text-left sm:text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded p-1"
                />
              </div>

              {/* MEBBİS Sicil No */}
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">MEBBİS Sicil No</span>
                <input
                  type="text"
                  value={mebbisNo}
                  onChange={(e) => setMebbisNo(e.target.value)}
                  className="text-xs sm:text-sm font-mono font-bold text-gray-900 dark:text-white bg-transparent border-none text-left sm:text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded p-1"
                />
              </div>

              {/* İkametgah Adresi */}
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">İkametgah Adresi</span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white bg-transparent border-none text-left sm:text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded p-1 flex-1 sm:max-w-xs"
                />
              </div>

              {/* Acil Durum İletişim */}
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Acil Durum İletişim</span>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white bg-transparent border-none text-left sm:text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded p-1 flex-1 sm:max-w-xs"
                />
              </div>

              {/* İletişim Telefonu & E-posta */}
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Kişisel Telefon & E-Posta</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-xs font-bold text-gray-900 dark:text-white bg-transparent border-none text-left sm:text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded p-1"
                  />
                  <span className="text-gray-400">·</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs font-bold text-gray-900 dark:text-white bg-transparent border-none text-left sm:text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded p-1"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* ── TAB 2: GÖREV & DERSLER (2. Görsel Birebir) ── */}
        {/* ========================================================= */}
        {activeSubTab === 'gorev' && (
          <motion.div
            key="subtab-gorev"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Akademik Görevlendirme Hero Card */}
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                  Akademik Görevlendirme
                </h3>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-[#0A0D15]">
                  Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">
                    Branş & Unvan
                  </span>
                  <input
                    type="text"
                    value={branchTitle}
                    onChange={(e) => setBranchTitle(e.target.value)}
                    className="text-sm font-black text-gray-900 dark:text-white bg-transparent border-none w-full p-0 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded mt-0.5"
                  />
                  <input
                    type="text"
                    value={titleLevel}
                    onChange={(e) => setTitleLevel(e.target.value)}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-transparent border-none w-full p-0 focus:outline-none rounded mt-0.5"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">
                    Kadro Şekli
                  </span>
                  <input
                    type="text"
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="text-sm font-black text-gray-900 dark:text-white bg-transparent border-none w-full p-0 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded mt-0.5"
                  />
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mt-0.5">
                    MEB Kadrosu
                  </span>
                </div>
              </div>
            </div>

            {/* Görev & Ders Dağılımı Tablosu */}
            <div className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-5 shadow-sm divide-y divide-gray-100 dark:divide-gray-800/80">
              {/* Sınıf Rehberliği */}
              <div className="py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Sınıf Rehberliği</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {homeroomClass}
                </span>
              </div>

              {/* Haftalık Toplam Ders */}
              <div className="py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Haftalık Toplam Ders</span>
                <span className="text-sm font-black text-gray-900 dark:text-white">
                  {weeklyLessonHours}
                </span>
              </div>

              {/* Ders Dağılımı */}
              <div className="py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Ders Dağılımı</span>
                <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                  {lessonDistribution}
                </span>
              </div>

              {/* Girdiği Şubeler */}
              <div className="py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Girdiği Şubeler</span>
                <span className="text-sm font-black text-gray-900 dark:text-white">
                  {teachingClasses}
                </span>
              </div>

              {/* Haftalık Nöbet Günü & Yeri */}
              <div className="py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Haftalık Nöbet Günü & Yeri</span>
                <span className="text-xs sm:text-sm font-black text-purple-600 dark:text-purple-400">
                  {dutyDayLocation}
                </span>
              </div>

              {/* Kulüp Danışmanlığı */}
              <div className="py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Kulüp Danışmanlığı</span>
                <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                  {clubAdvisory}
                </span>
              </div>

              {/* Mesai Saatleri */}
              <div className="py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Mesai Saatleri</span>
                <span className="text-xs sm:text-sm font-mono font-black text-gray-900 dark:text-white">
                  {workingHours}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* ── TAB 3: İZİN TALEPLERİ & MESAİ (3. Görsel Birebir) ── */}
        {/* ========================================================= */}
        {activeSubTab === 'izin' && (
          <motion.div
            key="subtab-izin"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* 3 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Yıllık İzin */}
              <div className="p-4 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-center">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {annualLeaveLeft}
                </div>
                <div className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 mt-1">
                  Kalan Yıllık İzin
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                  (20 Gün Hak)
                </div>
              </div>

              {/* Mazeret İzni */}
              <div className="p-4 rounded-3xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-center">
                <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                  {excuseLeaveLeft}
                </div>
                <div className="text-xs font-extrabold text-blue-900 dark:text-blue-200 mt-1">
                  Mazeret İzni
                </div>
                <div className="text-[10px] text-blue-700 dark:text-blue-400 font-medium mt-0.5">
                  (10 Gün Hak)
                </div>
              </div>

              {/* Sağlık Raporu */}
              <div className="p-4 rounded-3xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 text-center">
                <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
                  {medicalLeaveDays} Gün
                </div>
                <div className="text-xs font-extrabold text-purple-900 dark:text-purple-200 mt-1">
                  Sağlık Raporu
                </div>
                <div className="text-[10px] text-purple-700 dark:text-purple-400 font-medium mt-0.5">
                  (Bu Dönem)
                </div>
              </div>
            </div>

            {/* İdare İzin Tanımlama Barı */}
            <div className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock size={18} className="text-emerald-600" />
                <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                  İdare İzin Tanımlama
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsAddLeaveModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Yeni İzin Ekle</span>
              </button>
            </div>

            {/* Son İzin ve Rapor Geçmişi */}
            <div className="space-y-2.5">
              <span className="text-xs font-black tracking-wider text-gray-500 dark:text-gray-400 uppercase block px-1">
                SON İZİN VE RAPOR GEÇMİŞİ ({leaveHistory.length})
              </span>

              {leaveHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                        {item.type}
                      </span>
                      <span className="text-[11px] text-gray-400 font-bold">· {item.days}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.date} — {item.desc}
                    </p>
                  </div>

                  <span
                    className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                      item.status === 'Onaylandı'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* ── TAB 4: MAAŞ, AVANS & EK DERS (4. Görsel Birebir) ── */}
        {/* ========================================================= */}
        {activeSubTab === 'maas' && (
          <motion.div
            key="subtab-maas"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Aylık Net Tahakkuk Banner */}
            <div className="bg-emerald-600 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black tracking-wider uppercase opacity-90">
                  AYLIK NET TAHAKKUK
                </span>
                <span className="text-[11px] font-black bg-white/20 px-2.5 py-0.5 rounded-full">
                  1/4 Derece · Uzman
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                {netSalary}
              </div>

              <div className="pt-3 border-t border-white/20 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] opacity-80 block uppercase">Net Taban Maaş</span>
                  <span className="text-sm font-black mt-0.5 block">{baseSalary}</span>
                </div>
                <div>
                  <span className="text-[10px] opacity-80 block uppercase">Ek Ders + Tazminat</span>
                  <span className="text-sm font-black mt-0.5 block">{extraLessonPay}</span>
                </div>
              </div>
            </div>

            {/* Banka & IBAN Kartı */}
            <div className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-4.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block">
                  Maaş Bankası
                </span>
                <span className="text-sm font-black text-gray-900 dark:text-white mt-0.5 block">
                  {bankName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400">
                  {ibanNo}
                </span>
                <button
                  type="button"
                  onClick={handleCopyIban}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
                  title="IBAN Kopyala"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            {/* E-Bordro Geçmişi (Son 3 Ay) */}
            <div className="space-y-2.5">
              <span className="text-xs font-black tracking-wider text-gray-500 dark:text-gray-400 uppercase block px-1">
                E-BORDRO GEÇMİŞİ (SON 3 AY)
              </span>

              {[
                { title: 'Mart 2026 Bordrosu', meta: '₺72.000 · 420 KB · Onaylı' },
                { title: 'Şubat 2026 Bordrosu', meta: '₺71.450 · 418 KB · Onaylı' },
                { title: 'Ocak 2026 Bordrosu', meta: '₺68.900 · 415 KB · Onaylı' },
              ].map((bordro, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                        {bordro.title}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{bordro.meta}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toast.success(`${bordro.title} PDF olarak indiriliyor...`)}
                    className="h-8 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download size={13} />
                    <span>İndir</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Avans Talepleri & Ödemeler */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  AVANS TALEPLERİ & ÖDEMELER
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddAdvanceModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] text-[11px] font-black flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus size={12} strokeWidth={2.5} />
                  <span>Yeni Avans Tanımla</span>
                </button>
              </div>

              {advanceList.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-white dark:bg-[#121826] border border-dashed border-gray-200 dark:border-gray-800 text-xs text-gray-400">
                  Bu personele ait kayıtlı avans bulunmamaktadır.
                </div>
              ) : (
                advanceList.map((adv) => (
                  <div
                    key={adv.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-black text-gray-900 dark:text-white block">{adv.amount}</span>
                      <span className="text-gray-400 text-[11px]">{adv.date} — {adv.note}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      {adv.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Ek Ders, Nöbet & Mesai Dökümü (Aylık) */}
            <div className="space-y-2.5">
              <span className="text-xs font-black tracking-wider text-gray-500 dark:text-gray-400 uppercase block px-1">
                EK DERS, NÖBET & MESAİ DÖKÜMÜ (AYLIK)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">
                    Haftalık Ek Ders
                  </span>
                  <div className="text-sm sm:text-base font-black text-gray-900 dark:text-white mt-0.5">
                    6 Saat / Hafta
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    ~₺4.800 / Ay
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">
                    Nöbet Görevi
                  </span>
                  <div className="text-sm sm:text-base font-black text-gray-900 dark:text-white mt-0.5">
                    1 Gün / Hafta
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    ~₺1.800 / Ay
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* ── TAB 5: ÖZLÜK BELGELERİ (5. Görsel Birebir) ── */}
        {/* ========================================================= */}
        {activeSubTab === 'belgeler' && (
          <motion.div
            key="subtab-belgeler"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                MEBBİS & KURUM ARŞİV BELGELERİ ({documentsList.length})
              </span>

              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Yeni Belge Yükle</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {documentsList.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        doc.color === 'blue'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      <FileCheck size={18} />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{doc.size}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-black px-2.5 py-0.5 rounded-full shrink-0 ${
                      doc.color === 'blue'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* ── TAB 6: GÜVENLİK ── */}
        {/* ========================================================= */}
        {activeSubTab === 'security' && (
          <motion.div
            key="subtab-security"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-gray-900 dark:text-white">Şifre Değiştir</h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Mevcut Şifre</label>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Mevcut şifreniz"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Yeni Şifre</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Yeni şifreniz (en az 6 karakter)"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleUpdatePassword}
                className="w-full h-11 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-black cursor-pointer hover:opacity-90 transition-opacity"
              >
                Şifreyi Güncelle
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STICKY / BOTTOM "TÜM BİLGİLERİ KAYDET VE GÜNCELLE" BUTTON ── */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleSaveAllProfile}
            className="w-full h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] text-sm font-black flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer border border-emerald-400"
          >
            <Save size={18} strokeWidth={2.5} />
            <span>Tüm Bilgileri Kaydet ve Güncelle</span>
          </button>
        </div>
      </main>

      {/* ── MODAL: YENİ İZİN EKLE ── */}
      <AnimatePresence>
        {isAddLeaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddLeaveModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="text-base font-black text-gray-900 dark:text-white">Yeni İzin / Rapor Talebi</h3>
                <button
                  type="button"
                  onClick={() => setIsAddLeaveModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAddLeaveSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">İzin Türü</label>
                  <select
                    value={newLeaveType}
                    onChange={(e) => setNewLeaveType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                  >
                    <option value="Mazeret İzni">Mazeret İzni</option>
                    <option value="Yıllık İzin">Yıllık İzin</option>
                    <option value="Sağlık Raporu">Sağlık Raporu</option>
                    <option value="Hizmetiçi Eğitim İzni">Hizmetiçi Eğitim İzni</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Tarih</label>
                    <input
                      type="date"
                      value={newLeaveDate}
                      onChange={(e) => setNewLeaveDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Gün Sayısı</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={newLeaveDays}
                      onChange={(e) => setNewLeaveDays(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Açıklama / Mazeret</label>
                  <textarea
                    rows={2}
                    value={newLeaveDesc}
                    onChange={(e) => setNewLeaveDesc(e.target.value)}
                    placeholder="İzin gerekçesi..."
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] font-black"
                  >
                    Talebi Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: YENİ AVANS TALEBİ ── */}
      <AnimatePresence>
        {isAddAdvanceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddAdvanceModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="text-base font-black text-gray-900 dark:text-white">Yeni Avans Talebi</h3>
                <button
                  type="button"
                  onClick={() => setIsAddAdvanceModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAddAdvanceSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Avans Tutarı (TL)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Gerekçe / Not</label>
                  <textarea
                    rows={2}
                    value={advanceNote}
                    onChange={(e) => setAdvanceNote(e.target.value)}
                    placeholder="Maaştan mahsup edilecek avans notu..."
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] font-black"
                  >
                    Avans Talebini Gönder
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
