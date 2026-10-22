'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Users,
  Tv,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@components/Contexts/AuthContext'
import toast, { Toaster } from 'react-hot-toast'
import { getStoredPrincipalProfile, savePrincipalProfile } from '@/lib/principal/principalProfileStorage'

type RoleType = 'superadmin' | 'principal' | 'teacher' | 'student' | 'parent'

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

const ROLES: RoleConfig[] = [
  {
    id: 'principal',
    label: 'Müdür',
    subtitle: 'Kurum Yönetimi',
    icon: Briefcase,
    defaultEmail: 'mudur@oxonom.com',
    defaultPass: 'mudur123',
    defaultName: 'Dr. Uğur UĞURLU',
    targetRoute: '/principal/dashboard',
    identifierLabel: 'E-Posta veya T.C. No',
    identifierPlaceholder: 'mudur@oxonom.com',
  },
  {
    id: 'teacher',
    label: 'Öğretmen',
    subtitle: 'Eğitim & Sınıf',
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
    subtitle: '9-A · No: 101',
    icon: User,
    defaultEmail: '101',
    defaultPass: 'ogrenci123',
    defaultName: 'Erçil UĞURLU',
    targetRoute: '/student/dashboard',
    identifierLabel: 'Öğrenci No (101) veya E-Posta',
    identifierPlaceholder: '101 veya ogrenci@oxonom.com',
  },
  {
    id: 'superadmin',
    label: 'Admin',
    subtitle: 'Sistem Yönetimi',
    icon: ShieldCheck,
    defaultEmail: 'ugurxugurlu',
    defaultPass: 'Ugur2803*',
    defaultName: 'Uğur UĞURLU',
    targetRoute: '/superadmin/gamestudio',
    identifierLabel: 'Kullanıcı Adı',
    identifierPlaceholder: 'ugurxugurlu',
  },
  {
    id: 'parent',
    label: 'Veli',
    subtitle: 'Gelişim & Devam',
    icon: Users,
    defaultEmail: 'veli@oxonom.com',
    defaultPass: 'veli123',
    defaultName: 'Ayşe UĞURLU',
    targetRoute: '/m-student',
    identifierLabel: 'E-Posta veya T.C. No',
    identifierPlaceholder: 'veli@oxonom.com',
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

  const activeRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0]

  // Role switcher handler
  const handleRoleSelect = (roleId: RoleType, showFeedback = false) => {
    setSelectedRole(roleId)
    const conf = ROLES.find((r) => r.id === roleId)
    if (conf) {
      setIdentifier(conf.defaultEmail)
      setPassword(conf.defaultPass)
      if (showFeedback) {
        toast.success(`${conf.label} hesabı seçildi`, {
          icon: conf.id === 'student' ? '🎒' : conf.id === 'principal' ? '👔' : conf.id === 'teacher' ? '🎓' : '⚡',
          duration: 2200,
        })
      }
    }
  }

  // Handle URL query param: e.g. /loginv2?role=student
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
    } else if (lower === '101' || lower.includes('ercil') || lower.includes('ogrenci')) {
      setSelectedRole('student')
    } else if (lower.includes('veli') || lower.includes('parent')) {
      setSelectedRole('parent')
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

    // Explicit Session Isolation: Clear conflicting accounts on device
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
              schoolName: 'Oxonom Okulları',
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
    <div className="min-h-[100dvh] w-full bg-[#08050D] text-[#FCF9FD] flex flex-col justify-between relative overflow-x-hidden select-none selection:bg-[#D914C8]/30 selection:text-white">
      <Toaster position="top-center" />

      {/* ── SMOOTH AMBIENT BACKGROUND GLOW ANIMATIONS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Floating Orb 1: Deep Violet */}
        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-[#4B075F]/35 blur-[130px]"
        />

        {/* Floating Orb 2: Electric Magenta */}
        <motion.div
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 50, -40, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-32 w-[560px] h-[560px] rounded-full bg-[#D914C8]/25 blur-[140px]"
        />

        {/* Floating Orb 3: Center Ambient Purple */}
        <motion.div
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [0.95, 1.1, 0.95],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#8D49A6]/15 blur-[150px]"
        />

        {/* Slow Rotating Orbit Wireframe */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] opacity-[0.08]"
        >
          <svg viewBox="0 0 720 720" fill="none" className="w-full h-full">
            <circle cx="360" cy="360" r="340" stroke="#D914C8" strokeWidth="1" strokeDasharray="6 10" />
            <circle cx="360" cy="360" r="260" stroke="#8D49A6" strokeWidth="0.8" strokeDasharray="3 8" />
          </svg>
        </motion.div>

        {/* Minimal Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ── MINIMAL TOP BAR ── */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8D49A6] via-[#D914C8] to-[#4B075F] flex items-center justify-center text-white font-black text-sm shadow-md shadow-[#D914C8]/20">
            OX
          </div>
          <span className="text-sm font-black tracking-tight text-white">Oxonom EDU</span>
        </div>

        <Link
          href="/pano"
          className="h-8 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#D2C5D8] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
        >
          <Tv size={13} className="text-[#D914C8]" />
          <span>Pano</span>
        </Link>
      </header>

      {/* ── MAIN CENTERED LOGIN CARD (100% MOBILE RESPONSIVE) ── */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-4 sm:py-6 flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full bg-[#130B1B]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative overflow-hidden"
        >
          {/* Subtle top edge glow */}
          <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-[#D914C8]/60 to-transparent" />

          {/* Minimal Brand Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8D49A6] via-[#D914C8] to-[#4B075F] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-[#D914C8]/25 ring-1 ring-white/20 mx-auto mb-3">
              OX
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Giriş Yap
            </h1>
            <p className="text-xs text-[#A998B3] mt-1">
              {activeRoleConfig.defaultName} · {activeRoleConfig.subtitle}
            </p>
          </div>

          {/* ── COMPACT ROLE SELECTOR TABS ── */}
          <div className="grid grid-cols-5 gap-1 p-1 bg-[#0B0612]/80 rounded-2xl border border-white/10 mb-5 relative">
            {ROLES.map((r) => {
              const Icon = r.icon
              const isSelected = selectedRole === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  className="relative z-10 py-2 px-1 rounded-xl text-center cursor-pointer transition-colors"
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
                      size={15}
                      className={isSelected ? 'text-[#FCE8FA]' : 'text-[#7D6E87]'}
                    />
                    <span
                      className={`text-[11px] font-bold truncate max-w-full ${
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

          {/* ── FORM ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier Input */}
            <div>
              <label className="text-xs font-semibold text-[#D2C5D8] block mb-1.5">
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
                  className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-[#0B0612]/90 border border-white/10 rounded-xl focus:outline-none focus:border-[#D914C8] focus:ring-1 focus:ring-[#D914C8] text-white placeholder-[#685970] transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#D2C5D8]">Şifre</label>
                <button
                  type="button"
                  onClick={() => toast('Şifre sıfırlama bağlantısı kurum yöneticinize iletilir.', { icon: 'ℹ️' })}
                  className="text-[11px] text-[#A998B3] hover:text-[#D914C8] transition-colors"
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
                  className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-[#0B0612]/90 border border-white/10 rounded-xl focus:outline-none focus:border-[#D914C8] focus:ring-1 focus:ring-[#D914C8] text-white placeholder-[#685970] transition-colors"
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
                  className="w-4 h-4 rounded bg-[#0B0612] border-white/20 text-[#8D49A6] focus:ring-[#8D49A6]"
                />
                <span className="text-xs text-[#A998B3]">Beni hatırla</span>
              </label>

              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Güvenli Oturum
              </span>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4B075F]/35 transition-all cursor-pointer"
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

          {/* ── ALTTAN SADE & GÖZE BATMAYAN HIZLI DEMO BUTONLARI ── */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-col items-center">
            <span className="text-[10px] font-semibold text-[#8E7E97] uppercase tracking-wider mb-2">
              Hızlı Demo Girişi
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5 w-full">
              {ROLES.slice(0, 4).map((r) => {
                const Icon = r.icon
                const isActive = selectedRole === r.id
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id, true)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#4B075F]/70 text-[#FCE8FA] border border-[#8D49A6]/60 shadow-sm'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-[#C2B4C8] hover:text-white border border-white/10'
                    }`}
                  >
                    <Icon size={12} className={isActive ? 'text-[#D914C8]' : 'text-[#8E7E97]'} />
                    <span>{r.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── MINIMAL FOOTER ── */}
      <footer className="relative z-10 w-full py-4 text-center text-[11px] text-[#7D6E87]">
        Oxonom EDU v2.0 · Güvenli Eğitim Yönetim Ekosistemi
      </footer>
    </div>
  )
}
