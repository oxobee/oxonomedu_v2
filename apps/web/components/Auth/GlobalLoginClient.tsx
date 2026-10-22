'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  Briefcase,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Sparkles,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'
import { useAuth } from '@components/Contexts/AuthContext'
import toast, { Toaster } from 'react-hot-toast'
import { getStoredPrincipalProfile, savePrincipalProfile } from '@/lib/principal/principalProfileStorage'

type RoleType = 'principal' | 'teacher' | 'student' | 'superadmin'

interface RoleConfig {
  id: RoleType
  label: string
  subtitle: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  defaultEmail: string
  defaultPass: string
  defaultName: string
  targetRoute: string
  identifierLabel: string
  identifierPlaceholder: string
}

// SADECE MÜDÜR, ÖĞRETMEN, ÖĞRENCİ (Veli ve Hızlı Demo Girişi kaldırıldı)
const ROLES: RoleConfig[] = [
  {
    id: 'principal',
    label: 'Müdür',
    subtitle: 'Kurum Yönetimi & İdare',
    icon: Briefcase,
    defaultEmail: 'mudur@oxonom.com',
    defaultPass: 'mudur123',
    defaultName: 'Okul Müdürü',
    targetRoute: '/principal/dashboard',
    identifierLabel: 'E-Posta veya T.C. No',
    identifierPlaceholder: 'mudur@oxonom.com',
  },
  {
    id: 'teacher',
    label: 'Öğretmen',
    subtitle: 'Ders, Sınıf & Tahta',
    icon: GraduationCap,
    defaultEmail: 'ogretmen@oxonom.com',
    defaultPass: 'ogretmen123',
    defaultName: 'Ebru TEKNECİ',
    targetRoute: '/teacher/dashboard',
    identifierLabel: 'E-Posta veya T.C. No',
    identifierPlaceholder: 'ogretmen@oxonom.com',
  },
  {
    id: 'student',
    label: 'Öğrenci',
    subtitle: '9-A Şubesi · No: 101',
    icon: User,
    defaultEmail: '101',
    defaultPass: 'ogrenci123',
    defaultName: 'Erçil UĞURLU',
    targetRoute: '/student/dashboard',
    identifierLabel: 'Öğrenci No (101) veya E-Posta',
    identifierPlaceholder: '101 veya ogrenci@oxonom.com',
  },
]

export default function GlobalLoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()

  const [selectedRole, setSelectedRole] = useState<RoleType>('principal')
  const [identifier, setIdentifier] = useState('mudur@oxonom.com')
  const [password, setPassword] = useState('mudur123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [principalDisplayName, setPrincipalDisplayName] = useState('Okul Müdürü')

  useEffect(() => {
    try {
      const p = getStoredPrincipalProfile()
      if (p && p.name) {
        setPrincipalDisplayName(p.name)
      }
    } catch (_) {}
  }, [])

  const activeRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0]

  // Role switcher handler
  const handleRoleSelect = (roleId: RoleType) => {
    setSelectedRole(roleId)
    const conf = ROLES.find((r) => r.id === roleId)
    if (conf) {
      setIdentifier(conf.defaultEmail)
      setPassword(conf.defaultPass)
    }
  }

  // Handle URL query param: e.g. /login?role=student
  useEffect(() => {
    const roleParam = searchParams.get('role') as RoleType | null
    if (roleParam && ROLES.some((r) => r.id === roleParam)) {
      handleRoleSelect(roleParam)
    }
  }, [searchParams])

  // Auto-detect role as user types
  const handleIdentifierChange = (val: string) => {
    setIdentifier(val)
    const lower = val.toLowerCase().trim()
    if (lower === 'ugurxugurlu' || lower.includes('superadmin') || lower === 'root' || lower === '0') {
      setSelectedRole('superadmin')
    } else if (lower.includes('mudur') || lower.includes('admin') || lower === '1') {
      setSelectedRole('principal')
    } else if (lower.includes('ogretmen') || lower.includes('teacher') || lower === '2') {
      setSelectedRole('teacher')
    } else if (lower === '101' || lower.includes('ercil') || lower.includes('ogrenci') || lower === '3') {
      setSelectedRole('student')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !password.trim()) {
      toast.error('Lütfen kullanıcı adı / e-posta ve şifrenizi giriniz.')
      return
    }

    setIsLoading(true)
    const lowerIdent = identifier.toLowerCase().trim()

    // Determine target based on selected role & identifier
    const isSuperadmin =
      selectedRole === 'superadmin' ||
      lowerIdent === 'ugurxugurlu' ||
      lowerIdent.includes('superadmin') ||
      lowerIdent === 'root'
    const isAdmin =
      !isSuperadmin &&
      (selectedRole === 'principal' || lowerIdent.includes('mudur') || lowerIdent.includes('admin'))
    const isTeacher =
      selectedRole === 'teacher' || lowerIdent.includes('ogretmen') || lowerIdent.includes('teacher')
    const isStudent = selectedRole === 'student' || lowerIdent === '101' || lowerIdent.includes('ogrenci')

    let targetRoute = '/principal/dashboard'
    if (isSuperadmin) {
      targetRoute = '/superadmin/gamestudio'
    } else if (isAdmin) {
      targetRoute = '/principal/dashboard'
    } else if (isTeacher) {
      targetRoute = '/teacher/dashboard'
    } else if (isStudent) {
      targetRoute = '/student/dashboard'
    }

    // Explicit Session Isolation
    if (typeof window !== 'undefined') {
      try {
        if (isSuperadmin) {
          localStorage.removeItem('oxonom_teacher_profile')
          localStorage.removeItem('oxonom_teacher_profile_completed')
          localStorage.setItem('oxonom_current_role', 'superadmin')
          localStorage.setItem(
            'oxonom_superadmin_session',
            JSON.stringify({
              username: 'ugurxugurlu',
              name: 'Uğur UĞURLU',
              role: 'superadmin',
              loginTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            })
          )
        } else if (isAdmin) {
          localStorage.removeItem('oxonom_teacher_profile')
          localStorage.removeItem('oxonom_teacher_profile_completed')
          localStorage.setItem('oxonom_current_role', 'admin')

          const existingProfile = getStoredPrincipalProfile()
          savePrincipalProfile({
            ...existingProfile,
            loginTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          })
        } else if (isTeacher) {
          localStorage.removeItem('oxonom_active_admin_session')
          localStorage.setItem('oxonom_current_role', 'teacher')
          localStorage.setItem(
            'oxonom_teacher_profile',
            JSON.stringify({
              id: 2,
              email: 'ogretmen@oxonom.com',
              username: 'ogretmen',
              firstName: 'Ebru',
              lastName: 'TEKNECİ',
              name: 'Ebru TEKNECİ',
              tcNo: '10000000204',
              phone: '+90 532 999 3300',
              branch: 'Türk Dili ve Edebiyatı · Rehberlik',
              bio: 'Türk Dili ve Edebiyatı Öğretmeni · 9-A Sınıf Rehber Öğretmeni · Oxonom Okulları',
              extraDetails: [
                'Edebiyat Zümre Başkanı',
                '9-A Rehber Öğretmeni',
                'Akıllı Tahta Koordinatörü',
              ],
              isFirstLogin: false,
              profileCompleted: true,
            })
          )
        } else if (isStudent) {
          localStorage.removeItem('oxonom_active_admin_session')
          localStorage.removeItem('oxonom_teacher_profile')
          localStorage.setItem('oxonom_current_role', 'student')

          let currentGpa = 0
          let currentRank = 1
          let currentStatus = 'Temiz Sicil'
          try {
            const rawM = localStorage.getItem('oxonom_m_students_v3')
            if (rawM) {
              const parsedM = JSON.parse(rawM)
              if (Array.isArray(parsedM)) {
                const found = parsedM.find((s: any) => s.id === 's-1' || s.studentNo === '101')
                if (found) {
                  if (typeof found.gpa === 'number') currentGpa = found.gpa
                  if (typeof found.classRank === 'number') currentRank = found.classRank
                  if (found.disciplineStatus) currentStatus = found.disciplineStatus
                }
              }
            }
          } catch (_) {}

          localStorage.setItem(
            'oxonom_student_profile',
            JSON.stringify({
              id: 's-1',
              name: 'Erçil UĞURLU',
              firstName: 'Erçil',
              lastName: 'UĞURLU',
              email: 'ogrenci@oxonom.com',
              studentNo: '101',
              tcNo: '10000000146',
              gender: 'Erkek',
              birthDate: '15.06.2010 (16 Yaşında)',
              bloodType: 'A Rh+',
              enrollmentDate: '01.09.2024',
              className: '9-A',
              gradeLevel: '9. Sınıf',
              mentorTeacher: 'Ebru TEKNECİ (Türk Dili ve Edebiyatı)',
              schoolName: 'Necla Görer İlkokulu',
              gpa: currentGpa,
              classRank: currentRank,
              attendanceRate: 100,
              absentDays: 0,
              parentName: 'Ebru UĞURLU',
              parentPhone: '+90 532 999 1100',
              parentRelation: 'Anne (Mimar)',
              secondParentName: 'Dr. Uğur UĞURLU',
              secondParentPhone: '+90 532 999 2200',
              secondParentRelation: 'Baba (Kurum Müdürü)',
              emergencyPhone: '+90 532 999 2200',
              address: 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul',
              disciplineStatus: currentStatus,
            })
          )
        }
      } catch (_) {}
    }

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: identifier,
        password: password,
        callbackUrl: targetRoute,
      })

      if (res && !res.ok) {
        console.warn('NextAuth credentials notice, continuing session:', res.error)
      }

      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...', {
        icon: isSuperadmin ? '⚡' : isAdmin ? '👔' : isTeacher ? '🎓' : '🎒',
      })

      setTimeout(() => {
        window.location.href = targetRoute
      }, 350)
    } catch (err) {
      console.error('Login error:', err)
      window.location.href = targetRoute
    }
  }

  return (
    <div className="h-screen max-h-screen w-full bg-[#08050D] text-[#FCF9FD] flex flex-col lg:flex-row overflow-hidden select-none selection:bg-[#D914C8]/30 selection:text-white">
      <Toaster position="top-center" />

      {/* ── AMBIENT BACKGROUND GLOW ANIMATIONS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-[#4B075F]/35 blur-[130px]"
        />
        <motion.div
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-32 w-[560px] h-[560px] rounded-full bg-[#D914C8]/25 blur-[140px]"
        />
        <motion.div
          animate={{
            opacity: [0.12, 0.25, 0.12],
            scale: [0.95, 1.08, 0.95],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#8D49A6]/15 blur-[150px]"
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ── SOL TARAF: GİRİŞ YAPMA FORMU (PANO BUTONU YOK, HIZLI DEMO YOK, KAYIT OL BUTONU VAR) ── */}
      <div className="w-full lg:w-[48%] xl:w-[44%] 2xl:w-[40%] h-full flex flex-col justify-between p-5 sm:p-7 lg:p-10 z-10 relative overflow-y-auto lg:overflow-hidden border-r border-white/5 bg-[#0A0512]/60 backdrop-blur-xl">
        {/* Masaüstünde sol üstte zarif logo */}
        <header className="w-full hidden lg:flex items-center justify-start pb-2 shrink-0">
          <Link href="/login" className="group flex items-center gap-2 cursor-pointer">
            <img
              src="/oxonom-logo-dark.png"
              alt="Oxonom EDU"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </Link>
        </header>

        {/* Orta Kısım: Giriş Formu ve Rol Seçici */}
        <div className="flex-1 flex flex-col justify-center max-w-sm sm:max-w-md w-full mx-auto py-2">
          {/* Mobilde Formun Tam Üstünde Ortalı, Dengeli ve 3x Büyük Logo */}
          <div className="flex lg:hidden justify-center items-center mb-6 pt-1">
            <Link href="/login" className="flex items-center justify-center cursor-pointer">
              <img
                src="/oxonom-logo-dark.png"
                alt="Oxonom EDU"
                className="h-16 sm:h-20 w-auto max-w-[85vw] sm:max-w-[340px] object-contain drop-shadow-2xl transition-transform active:scale-95"
              />
            </Link>
          </div>
          {/* Başlık */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#D914C8] mb-1">
              <Sparkles size={13} />
              <span>Giriş Portalı</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Hesabınıza Giriş Yapın
            </h1>
            <p className="text-xs text-[#A998B3] mt-0.5">
              {selectedRole === 'principal'
                ? `${principalDisplayName} · Kurum Yönetimi`
                : `${activeRoleConfig.defaultName} · ${activeRoleConfig.subtitle}`}
            </p>
          </div>

          {/* SADECE MÜDÜR, ÖĞRETMEN, ÖĞRENCİ SEÇİM BUTONLARI */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#130B1B] rounded-2xl border border-white/10 mb-4 relative shadow-inner">
            {ROLES.map((r) => {
              const Icon = r.icon
              const isSelected = selectedRole === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  className="relative z-10 py-2.5 px-2 rounded-xl text-center cursor-pointer transition-colors"
                >
                  {isSelected && (
                    <motion.div
                      layoutId="loginRolePill"
                      className="absolute inset-0 bg-gradient-to-r from-[#4B075F] to-[#8D49A6] rounded-xl border border-white/20 shadow-md"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <div className="relative z-20 flex flex-col items-center gap-1">
                    <Icon
                      size={16}
                      className={isSelected ? 'text-[#FCE8FA]' : 'text-[#7D6E87]'}
                    />
                    <span
                      className={`text-xs font-bold truncate max-w-full ${
                        isSelected ? 'text-white' : 'text-[#9A8C9E]'
                      }`}
                    >
                      {r.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Identifier Input */}
            <div>
              <label className="text-xs font-semibold text-[#D2C5D8] block mb-1">
                {activeRoleConfig.identifierLabel}
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D6E87]" />
                <input
                  type="text"
                  required
                  placeholder={activeRoleConfig.identifierPlaceholder}
                  value={identifier}
                  onChange={(e) => handleIdentifierChange(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-[#12081C] border border-white/10 rounded-xl focus:outline-none focus:border-[#D914C8] focus:ring-1 focus:ring-[#D914C8] text-white placeholder-[#685970] transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#D2C5D8]">Şifre</label>
                <button
                  type="button"
                  onClick={() => toast('Şifre sıfırlama talebiniz kurum yöneticisine iletilir.', { icon: 'ℹ️' })}
                  className="text-[11px] text-[#A998B3] hover:text-[#D914C8] transition-colors cursor-pointer"
                >
                  Şifremi unuttum?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D6E87]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-[#12081C] border border-white/10 rounded-xl focus:outline-none focus:border-[#D914C8] focus:ring-1 focus:ring-[#D914C8] text-white placeholder-[#685970] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7D6E87] hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#12081C] border-white/20 text-[#8D49A6] focus:ring-[#8D49A6]"
                />
                <span className="text-xs text-[#A998B3]">Beni hatırla</span>
              </label>

              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck size={12} />
                <span>SSL 256-Bit</span>
              </span>
            </div>

            {/* Giriş Yap Butonu */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4B075F]/35 transition-all cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </form>

          {/* SEPERATÖR VE KAYIT OL BUTONU (HIZLI DEMO GİRİŞİ KALDIRILDI) */}
          <div className="mt-5">
            <div className="relative flex items-center justify-center mb-4">
              <div className="w-full border-t border-white/10" />
              <span className="absolute px-3 bg-[#0A0512] text-[11px] font-semibold text-[#8E7E97]">
                veya
              </span>
            </div>

            <button
              type="button"
              onClick={() => toast('Kayıt olma ekranı çok yakında hizmete açılacaktır.', { icon: '✨' })}
              className="w-full h-11 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-[#4B075F]/30 text-[#D2C5D8] hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/10 hover:border-[#8D49A6]/50 transition-all cursor-pointer"
            >
              <UserPlus size={15} className="text-[#D914C8]" />
              <span>Yeni Hesap Oluştur / Kayıt Ol</span>
            </button>
          </div>
        </div>

        {/* Alt Kısım: Minimal Telif Yazısı */}
        <footer className="w-full text-center text-[10px] text-[#7D6E87] pt-2 shrink-0">
          Oxonom EDU v2.0 · Güvenli Eğitim Yönetim Ekosistemi
        </footer>
      </div>

      {/* ── SAĞ TARAF: BÜYÜK LOGO (KUTU KALDIRILDI, LOGO DOĞRUDAN AURADA PARLIYOR) ── */}
      <div className="hidden lg:flex flex-1 h-full items-center justify-center relative p-8 xl:p-12 overflow-hidden bg-gradient-to-br from-[#12081C]/90 via-[#0A0512] to-[#050208] z-10">
        {/* Sağ Alan Merkez Işık Küresi */}
        <div className="absolute w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-[#D914C8]/25 via-[#8D49A6]/20 to-[#4B075F]/25 blur-[120px] pointer-events-none" />

        {/* Dekoratif Yavaş Dönen Yörünge Çizgileri */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 160, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[680px] h-[680px] pointer-events-none opacity-20"
        >
          <svg viewBox="0 0 680 680" fill="none" className="w-full h-full">
            <circle cx="340" cy="340" r="320" stroke="#D914C8" strokeWidth="1" strokeDasharray="6 12" />
            <circle cx="340" cy="340" r="240" stroke="#8D49A6" strokeWidth="0.8" strokeDasharray="4 8" />
            <circle cx="340" cy="340" r="160" stroke="#F0D8FA" strokeWidth="0.5" strokeOpacity="0.4" />
          </svg>
        </motion.div>

        {/* Ekrana Uyumlu Büyük Logo (Arkasında dikdörtgen kutu olmadan serbest parıldayan yapı) */}
        <motion.div
          animate={{
            y: [-6, 6, -6],
            scale: [1, 1.015, 1],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-20 flex flex-col items-center justify-center max-w-xl w-full text-center px-4"
        >
          <img
            src="/oxonom-logo-dark.png"
            alt="Oxonom EDU"
            className="w-full max-w-[460px] xl:max-w-[520px] 2xl:max-w-[580px] h-auto object-contain drop-shadow-[0_20px_50px_rgba(217,20,200,0.4)]"
          />

          {/* Alt Rozet Bilgileri */}
          <div className="mt-8 flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#4B075F]/50 text-[#FCE8FA] border border-[#8D49A6]/40 shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D914C8] animate-pulse" />
              <span>Geleceğin Akıllı Okul Ekosistemi</span>
            </span>
            <span className="text-xs text-[#A998B3] font-medium hidden xl:inline-block">
              İdare · Öğretmen · Öğrenci · Akıllı Pano
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
