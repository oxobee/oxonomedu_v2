'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  CheckCircle2,
  AlertCircle,
  Building2,
  BookOpen,
  TrendingUp,
  Cpu,
  Key,
  Copy,
  Check,
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
  badge: string
  accentColor: string
  defaultEmail: string
  defaultPass: string
  defaultName: string
  targetRoute: string
  classInfo?: string
  altEmail?: string
}

const ROLES: RoleConfig[] = [
  {
    id: 'superadmin',
    label: 'Süper Admin',
    subtitle: 'Sistem & Game Studio',
    icon: ShieldCheck,
    badge: 'Root Yetkili',
    accentColor: 'from-[#D914C8] to-[#4B075F]',
    defaultEmail: 'ugurxugurlu',
    defaultPass: 'Ugur2803*',
    defaultName: 'Uğur UĞURLU',
    targetRoute: '/superadmin/gamestudio',
    altEmail: 'ugurxugurlu',
  },
  {
    id: 'principal',
    label: 'Okul Müdürü',
    subtitle: 'Kurum Yönetimi & İdare',
    icon: Briefcase,
    badge: 'Yönetim',
    accentColor: 'from-[#4B075F] to-[#8D49A6]',
    defaultEmail: 'mudur@oxonom.com',
    defaultPass: 'mudur123',
    defaultName: 'Dr. Uğur UĞURLU',
    targetRoute: '/principal/dashboard',
    altEmail: 'mudur@oxonom.com',
  },
  {
    id: 'teacher',
    label: 'Öğretmen',
    subtitle: 'Ders, Sınıf & Tahta',
    icon: GraduationCap,
    badge: 'Eğitim',
    accentColor: 'from-[#620B79] to-[#8D49A6]',
    defaultEmail: 'ogretmen@oxonom.com',
    defaultPass: 'ogretmen123',
    defaultName: 'Ebru TEKNECİ',
    targetRoute: '/teacher/dashboard',
    altEmail: 'ogretmen@oxonom.com',
  },
  {
    id: 'student',
    label: 'Öğrenci',
    subtitle: '9-A Şubesi · No: 101',
    icon: User,
    badge: '9-A · No: 101',
    accentColor: 'from-[#8D49A6] to-[#D914C8]',
    defaultEmail: '101',
    defaultPass: 'ogrenci123',
    defaultName: 'Erçil UĞURLU',
    targetRoute: '/student/dashboard',
    classInfo: '9-A Şubesi',
    altEmail: 'ogrenci@oxonom.com',
  },
  {
    id: 'parent',
    label: 'Veli',
    subtitle: 'Gelişim & Devam',
    icon: Users,
    badge: 'Veli',
    accentColor: 'from-[#4B075F] to-[#620B79]',
    defaultEmail: 'veli@oxonom.com',
    defaultPass: 'veli123',
    defaultName: 'Ayşe UĞURLU',
    targetRoute: '/m-student',
    altEmail: 'veli@oxonom.com',
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

  // Smart role switcher handler
  const handleRoleSelect = (roleId: RoleType, showFeedback = false) => {
    setSelectedRole(roleId)
    const conf = ROLES.find((r) => r.id === roleId)
    if (conf) {
      setIdentifier(conf.defaultEmail)
      setPassword(conf.defaultPass)
      if (showFeedback) {
        toast.success(
          `${conf.label} (${conf.defaultName}) giriş bilgileri dolduruldu: ${conf.defaultEmail} / ${conf.defaultPass}`,
          {
            icon: conf.id === 'student' ? '🎒' : conf.id === 'principal' ? '👔' : '🎓',
            duration: 3000,
          }
        )
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
        // Fallback for demo credentials
        console.warn('NextAuth credentials error, proceeding with client session:', res.error)
      }

      toast.success(
        isSuperadmin
          ? 'Süper Admin oturumu açıldı! Game Studio paneline yönlendiriliyorsunuz...'
          : isAdmin
          ? 'Okul Müdürü oturumu açıldı! İdare paneline yönlendiriliyorsunuz...'
          : isTeacher
          ? 'Öğretmen oturumu açıldı! Çalışma merkezine yönlendiriliyorsunuz...'
          : 'Giriş başarılı! Öğrenci paneline yönlendiriliyorsunuz...',
        {
          icon: isSuperadmin ? '⚡' : isAdmin ? '👔' : isTeacher ? '🎓' : '🎒',
        }
      )

      setTimeout(() => {
        window.location.href = targetRoute
      }, 400)
    } catch (err) {
      console.error('Login error:', err)
      // Smooth redirect on demo mode
      window.location.href = targetRoute
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#17101C] text-[#FCF9FD] font-jakarta flex flex-col justify-between relative overflow-x-hidden selection:bg-[#D914C8]/30 selection:text-white">
      <Toaster position="top-center" />

      {/* ── BACKGROUND MACRO VISUALS & ORBITAL RINGS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {/* Ambient Radiant Glow Blobs */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#4B075F]/30 blur-[140px]" />
        <div className="absolute top-1/3 right-0 w-[550px] h-[550px] rounded-full bg-[#8D49A6]/25 blur-[150px]" />
        <div className="absolute -bottom-32 left-1/4 w-[700px] h-[700px] rounded-full bg-[#D914C8]/15 blur-[160px]" />

        {/* Orbit Ring 1 - Clockwise */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 160, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 right-10 w-[720px] h-[720px] pointer-events-none opacity-25"
        >
          <svg viewBox="0 0 720 720" fill="none" className="w-full h-full">
            <circle cx="360" cy="360" r="350" stroke="#8D49A6" strokeWidth="1" strokeDasharray="4 8" />
            <circle cx="360" cy="360" r="280" stroke="#D914C8" strokeWidth="0.8" strokeDasharray="2 6" />
            <circle cx="360" cy="360" r="200" stroke="#F0D8FA" strokeWidth="0.5" strokeOpacity="0.3" />
          </svg>
        </motion.div>

        {/* Orbit Ring 2 - Counter-Clockwise */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 200, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-48 -left-48 w-[640px] h-[640px] pointer-events-none opacity-20"
        >
          <svg viewBox="0 0 640 640" fill="none" className="w-full h-full">
            <circle cx="320" cy="320" r="310" stroke="#D914C8" strokeWidth="1" strokeDasharray="5 10" />
            <circle cx="320" cy="320" r="240" stroke="#8D49A6" strokeWidth="0.6" />
          </svg>
        </motion.div>

        {/* Subtle Geometric Mesh Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* ── TOP BRAND NAVIGATION BAR ── */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-gradient flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#4B075F]/30">
            OX
          </div>
          <div>
            <div className="text-base font-black tracking-tight leading-tight flex items-center gap-2">
              <span>Oxonom EDU</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0D8FA]/15 text-[#F0D8FA] border border-[#8D49A6]/40">
                v2.0
              </span>
            </div>
            <div className="text-[10px] text-[#B5A5BD] font-semibold">
              Geleceğin Akıllı Okul Ekosistemi
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#D2C5D8] bg-[#211729]/80 border border-[#49364F] px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#D914C8] animate-pulse" />
            <span>Merkezi Giriş Kapısı</span>
          </div>

          <Link
            href="/pano"
            className="h-9 px-3.5 rounded-xl bg-[#211729]/80 hover:bg-[#2D2035] text-[#D2C5D8] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-[#49364F] hover:border-[#8D49A6]/50"
          >
            <Tv size={14} className="text-[#D914C8]" />
            <span>Pano Aç</span>
          </Link>
        </div>
      </header>

      {/* ── MAIN HERO & LOGIN SECTION (SPLIT-SCREEN ON DESKTOP) ── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ── LEFT COLUMN: HERO INFORMATION (DESKTOP) ── */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0D8FA]/10 border border-[#8D49A6]/30 text-[#F0D8FA] text-xs font-extrabold tracking-wide">
              <Sparkles size={14} className="text-[#D914C8]" />
              <span>TEK PLATFORM • TÜM ROLLER</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.15]">
                Eğitim Yönetiminde <br />
                <span className="bg-gradient-to-r from-white via-[#F0D8FA] to-[#D914C8] bg-clip-text text-transparent">
                  Yeni Nesil
                </span>{' '}
                Dijital Merkez
              </h1>
              <p className="text-sm text-[#D2C5D8] leading-relaxed max-w-lg">
                Okul müdürü idaresi, öğretmen çalışma merkezi, akıllı tahta canlı eşleşmesi ve öğrenci başarı karneleri kesintisiz ve güvenli tek bir arayüzde birleşti.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2 max-w-lg">
              <div className="p-3.5 rounded-2xl bg-[#211729]/70 border border-[#49364F]/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4B075F]/40 text-[#F0D8FA] flex items-center justify-center shrink-0 border border-[#8D49A6]/30">
                  <Briefcase size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">İdare & Kadro</div>
                  <div className="text-[10px] text-[#B5A5BD]">Ders dağılımı & mevcudiyet</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#211729]/70 border border-[#49364F]/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4B075F]/40 text-[#F0D8FA] flex items-center justify-center shrink-0 border border-[#8D49A6]/30">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Öğretmen Alanı</div>
                  <div className="text-[10px] text-[#B5A5BD]">Yoklama, ödev & notlar</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#211729]/70 border border-[#49364F]/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4B075F]/40 text-[#F0D8FA] flex items-center justify-center shrink-0 border border-[#8D49A6]/30">
                  <Tv size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Akıllı Pano</div>
                  <div className="text-[10px] text-[#B5A5BD]">Canlı pano oturumu & kontrol</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#211729]/70 border border-[#49364F]/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4B075F]/40 text-[#D914C8] flex items-center justify-center shrink-0 border border-[#8D49A6]/30">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Akademik Takip</div>
                  <div className="text-[10px] text-[#B5A5BD]">Ölçülebilir karne ve grafikler</div>
                </div>
              </div>
            </div>

            {/* ── LEFT COLUMN: SYSTEM CREDENTIALS CARD ── */}
            <div className="pt-2 max-w-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-wider text-[#D2C5D8] flex items-center gap-2">
                  <Key size={14} className="text-[#D914C8]" />
                  <span>Sistem Giriş Hesapları & Şifreleri</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0D8FA]/15 text-[#F0D8FA] border border-[#8D49A6]/40">
                  Tek Tıkla Seç
                </span>
              </div>

              {/* Superadmin Card - Prominent Neon Purple/Magenta */}
              <div
                onClick={() => handleRoleSelect('superadmin', true)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  selectedRole === 'superadmin'
                    ? 'bg-[#350444]/80 border-[#D914C8] shadow-lg shadow-[#D914C8]/30 ring-1 ring-[#D914C8]'
                    : 'bg-[#211729]/60 border-[#D914C8]/30 hover:bg-[#2D2035] hover:border-[#D914C8]/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D914C8] to-[#4B075F] text-white flex items-center justify-center shrink-0 border border-[#D914C8]/60 group-hover:scale-105 transition-transform">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">⚡ Süper Admin: Uğur UĞURLU</span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-[#D914C8]/30 text-[#FCE8FA] border border-[#D914C8]/50">
                          Root & Game Studio
                        </span>
                      </div>
                      <div className="text-[11px] text-[#D2C5D8] font-mono mt-0.5 flex items-center gap-2.5">
                        <span>Kullanıcı Adı: <strong className="text-[#F0D8FA] font-bold">ugurxugurlu</strong></span>
                        <span className="text-gray-600">•</span>
                        <span>Şifre: <strong className="text-[#45C7A2] font-bold">Ugur2803*</strong></span>
                      </div>
                      <div className="text-[10px] text-[#B5A5BD] mt-0.5">
                        Hedef Panel: <code className="text-[#D914C8]">/superadmin/gamestudio</code>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRoleSelect('superadmin', true)
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white text-[10px] font-bold shrink-0 transition-all border border-[#D914C8]/50 cursor-pointer shadow-md"
                  >
                    Bilgileri Doldur →
                  </button>
                </div>
              </div>

              {/* Student Card - Prominently Featured */}
              <div
                onClick={() => handleRoleSelect('student', true)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  selectedRole === 'student'
                    ? 'bg-[#350444]/60 border-[#D914C8]/80 shadow-lg shadow-[#4B075F]/40 ring-1 ring-[#D914C8]/60'
                    : 'bg-[#211729]/60 border-[#49364F] hover:bg-[#2D2035] hover:border-[#8D49A6]/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#4B075F]/50 text-[#F0D8FA] flex items-center justify-center shrink-0 border border-[#8D49A6]/40 group-hover:scale-105 transition-transform">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">🎒 Öğrenci: Erçil UĞURLU</span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-[#D914C8]/25 text-[#FCE8FA] border border-[#D914C8]/40">
                          9-A Sınıfı
                        </span>
                      </div>
                      <div className="text-[11px] text-[#D2C5D8] font-mono mt-0.5 flex items-center gap-2.5">
                        <span>Okul No: <strong className="text-[#F0D8FA] font-bold">101</strong></span>
                        <span className="text-gray-600">•</span>
                        <span>Şifre: <strong className="text-[#45C7A2] font-bold">ogrenci123</strong></span>
                      </div>
                      <div className="text-[10px] text-[#B5A5BD] mt-0.5">
                        Alternatif E-posta: <code className="text-[#F0D8FA]">ogrenci@oxonom.com</code>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRoleSelect('student', true)
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#4B075F] hover:bg-[#620B79] text-[#FCE8FA] text-[10px] font-bold shrink-0 transition-colors border border-[#8D49A6]/50 cursor-pointer"
                  >
                    Bilgileri Doldur →
                  </button>
                </div>
              </div>

              {/* Principal & Teacher 2-Column Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Principal Card */}
                <div
                  onClick={() => handleRoleSelect('principal', true)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
                    selectedRole === 'principal'
                      ? 'bg-[#350444]/60 border-[#8D49A6]/80 shadow-md shadow-[#4B075F]/30 ring-1 ring-[#8D49A6]/60'
                      : 'bg-[#211729]/60 border-[#49364F] hover:bg-[#2D2035] hover:border-[#8D49A6]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-[#4B075F]/40 text-[#F0D8FA] flex items-center justify-center shrink-0">
                        <Briefcase size={13} />
                      </div>
                      <span className="text-xs font-bold text-white">Müdür: Dr. Uğur U.</span>
                    </div>
                    <span className="text-[9px] font-bold text-[#F0D8FA] bg-[#4B075F]/60 px-1 py-0.2 rounded">İdare</span>
                  </div>
                  <div className="text-[10px] text-[#D2C5D8] font-mono space-y-0.5">
                    <div>E-posta: <span className="text-[#F0D8FA] font-semibold">mudur@oxonom.com</span></div>
                    <div>Şifre: <span className="text-[#45C7A2] font-bold">mudur123</span></div>
                  </div>
                </div>

                {/* Teacher Card */}
                <div
                  onClick={() => handleRoleSelect('teacher', true)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
                    selectedRole === 'teacher'
                      ? 'bg-[#350444]/60 border-[#8D49A6]/80 shadow-md shadow-[#4B075F]/30 ring-1 ring-[#8D49A6]/60'
                    : 'bg-[#211729]/60 border-[#49364F] hover:bg-[#2D2035] hover:border-[#8D49A6]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-[#4B075F]/40 text-[#F0D8FA] flex items-center justify-center shrink-0">
                        <GraduationCap size={13} />
                      </div>
                      <span className="text-xs font-bold text-white">Öğretmen: Ebru T.</span>
                    </div>
                    <span className="text-[9px] font-bold text-[#F0D8FA] bg-[#4B075F]/60 px-1 py-0.2 rounded">Eğitim</span>
                  </div>
                  <div className="text-[10px] text-[#D2C5D8] font-mono space-y-0.5">
                    <div>E-posta: <span className="text-[#F0D8FA] font-semibold">ogretmen@oxonom.com</span></div>
                    <div>Şifre: <span className="text-[#45C7A2] font-bold">ogretmen123</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: GLASSMORPHIC LOGIN CARD ── */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-[#211729]/95 backdrop-blur-2xl border border-[#49364F] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative">
              {/* Subtle Card Glow Effect */}
              <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#D914C8]/50 to-transparent" />

              {/* Card Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#D914C8]">
                    Merkezi Giriş Paneli
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-[#D2C5D8]">
                    SSL 256-Bit
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Hesabınıza Giriş Yapın
                </h2>
                <p className="text-xs text-[#B5A5BD] mt-1">
                  Rolünüzü seçin veya kullanıcı bilgilerinizi girerek devam edin
                </p>
              </div>

              {/* ── ROLE SWITCHER TABS (SLIDING ANIMATION) ── */}
              <div className="grid grid-cols-5 gap-1 p-1 bg-[#17101C] rounded-2xl border border-[#49364F] mb-6 relative">
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
                          layoutId="login-role-pill"
                          className="absolute inset-0 bg-gradient-to-r from-[#4B075F] to-[#8D49A6] rounded-xl border border-[#8D49A6]/50 shadow-md"
                          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        />
                      )}
                      <div className="relative z-20 flex flex-col items-center gap-1">
                        <Icon
                          size={16}
                          className={isSelected ? 'text-[#F0D8FA]' : 'text-[#716779]'}
                        />
                        <span
                          className={`text-[11px] font-bold truncate max-w-full ${
                            isSelected ? 'text-white' : 'text-[#B5A5BD]'
                          }`}
                        >
                          {r.label}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Active Role Mini Banner with Direct Credentials */}
              <div className="mb-5 p-3.5 rounded-2xl border border-[#49364F] bg-[#2D2035] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${activeRoleConfig.accentColor} text-white flex items-center justify-center font-extrabold text-xs shadow-md`}>
                      {activeRoleConfig.defaultName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>{activeRoleConfig.defaultName}</span>
                        {selectedRole === 'student' && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#D914C8]/30 text-[#FCE8FA]">
                            9-A
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#B5A5BD] font-medium">
                        {activeRoleConfig.subtitle}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#4B075F]/60 text-[#F0D8FA] border border-[#8D49A6]/40">
                    {activeRoleConfig.badge}
                  </span>
                </div>

                {/* Direct Credentials Display Strip */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2 text-[#D2C5D8]">
                    <span className="text-[#716779]">Giriş:</span>
                    <span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">
                      {activeRoleConfig.defaultEmail}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-[#716779]">Şifre:</span>
                    <span className="text-[#45C7A2] font-bold bg-white/10 px-1.5 py-0.5 rounded">
                      {activeRoleConfig.defaultPass}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier(activeRoleConfig.defaultEmail)
                      setPassword(activeRoleConfig.defaultPass)
                      toast.success(`${activeRoleConfig.label} bilgileri yüklendi`)
                    }}
                    className="text-[10px] font-bold text-[#D2C5D8] hover:text-[#D914C8] underline cursor-pointer"
                  >
                    Doldur
                  </button>
                </div>
              </div>

              {/* ── STUDENT SPECIAL HELPER NOTICE ── */}
              {selectedRole === 'student' && (
                <div className="mb-4 p-3 rounded-2xl bg-[#350444]/60 border border-[#8D49A6]/40 flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🎒</span>
                    <div>
                      <div className="text-[11px] font-black text-[#F0D8FA]">
                        Öğrenci Giriş Bilgileri (Erçil UĞURLU)
                      </div>
                      <div className="text-[10px] text-[#D2C5D8] font-mono mt-0.5">
                        Okul No: <strong className="text-[#FCE8FA]">101</strong> (veya <code className="text-[#F0D8FA]">ogrenci@oxonom.com</code>) • Şifre: <strong className="text-[#45C7A2]">ogrenci123</strong>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier('101')
                      setPassword('ogrenci123')
                      toast.success('Öğrenci bilgileri dolduruldu: 101 / ogrenci123', { icon: '🎒' })
                    }}
                    className="px-2 py-1 rounded-lg bg-[#4B075F] hover:bg-[#620B79] text-[#FCE8FA] text-[10px] font-bold shrink-0 transition-colors border border-[#8D49A6]/50 cursor-pointer"
                  >
                    Otomatik Gir
                  </button>
                </div>
              )}

              {/* ── LOGIN FORM ── */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Identifier Input */}
                <div>
                  <label className="text-xs font-bold text-[#D2C5D8] block mb-1.5">
                    {selectedRole === 'student'
                      ? 'Öğrenci Okul No (101) veya E-Posta'
                      : 'E-Posta, T.C. No veya Kullanıcı Adı'}
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#716779]" />
                    <input
                      type="text"
                      required
                      placeholder={selectedRole === 'student' ? '101 veya ogrenci@oxonom.com' : 'E-posta veya kullanıcı adı'}
                      value={identifier}
                      onChange={(e) => handleIdentifierChange(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 text-xs bg-[#17101C] border border-[#49364F] rounded-xl focus:outline-none focus:border-[#8D49A6] focus:ring-1 focus:ring-[#8D49A6] text-white font-medium placeholder-[#716779] transition-colors"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#D2C5D8]">Şifre</label>
                    <button
                      type="button"
                      onClick={() => toast('Şifre sıfırlama bağlantısı kurum yöneticinize iletilir.', { icon: 'ℹ️' })}
                      className="text-[11px] text-[#B5A5BD] hover:text-[#D914C8] font-medium transition-colors"
                    >
                      Şifremi Unuttum?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#716779]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 text-xs bg-[#17101C] border border-[#49364F] rounded-xl focus:outline-none focus:border-[#8D49A6] focus:ring-1 focus:ring-[#8D49A6] text-white font-medium placeholder-[#716779] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#716779] hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#17101C] border-[#49364F] text-[#8D49A6] focus:ring-[#8D49A6] focus:ring-offset-0"
                    />
                    <span className="text-xs font-medium text-[#B5A5BD]">Beni hatırla</span>
                  </label>

                  <div className="text-[11px] text-[#45C7A2] font-bold flex items-center gap-1">
                    <ShieldCheck size={13} />
                    <span>Güvenli Oturum</span>
                  </div>
                </div>

                {/* Macro Animated Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#4B075F]/35 transition-all cursor-pointer relative overflow-hidden"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Giriş Yap ve Devam Et</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </form>

              {/* ── QUICK DEMO ACCESS CHIPS (HIZLI TEST BUTONLARI) ── */}
              <div className="mt-6 pt-5 border-t border-[#49364F]/80">
                <div className="text-[10px] font-bold text-[#B5A5BD] uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Key size={12} className="text-[#D914C8]" />
                    <span>Hızlı Demo Giriş Butonları</span>
                  </div>
                  <span className="text-[#F0D8FA] font-mono text-[9px]">Tek Tıkla Doldur</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Student Chip */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('student', true)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'student'
                        ? 'bg-[#350444]/80 border-[#D914C8]/70 ring-1 ring-[#D914C8]/50 shadow-sm'
                        : 'bg-[#17101C]/80 hover:bg-[#2D2035] border-[#49364F] hover:border-[#8D49A6]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-black text-white">🎒 Öğrenci</span>
                      <span className="text-[9px] font-extrabold text-[#FCE8FA] bg-[#D914C8]/30 px-1 py-0.2 rounded">9-A</span>
                    </div>
                    <div className="text-[10px] font-bold text-[#F0D8FA] truncate">Erçil UĞURLU</div>
                    <div className="text-[9px] text-[#B5A5BD] font-mono mt-0.5 truncate">
                      No: <strong className="text-white">101</strong> · <strong className="text-[#45C7A2]">ogrenci123</strong>
                    </div>
                  </button>

                  {/* Principal Chip */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('principal', true)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'principal'
                        ? 'bg-[#350444]/80 border-[#8D49A6]/70 ring-1 ring-[#8D49A6]/50 shadow-sm'
                        : 'bg-[#17101C]/80 hover:bg-[#2D2035] border-[#49364F] hover:border-[#8D49A6]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-black text-white">👔 Müdür</span>
                      <span className="text-[9px] font-extrabold text-[#F0D8FA] bg-[#4B075F]/60 px-1 py-0.2 rounded">İdare</span>
                    </div>
                    <div className="text-[10px] font-bold text-[#F0D8FA] truncate">Dr. Uğur U.</div>
                    <div className="text-[9px] text-[#B5A5BD] font-mono mt-0.5 truncate">
                      <strong className="text-white">mudur</strong> · <strong className="text-[#45C7A2]">mudur123</strong>
                    </div>
                  </button>

                  {/* Teacher Chip */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('teacher', true)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'teacher'
                        ? 'bg-[#350444]/80 border-[#8D49A6]/70 ring-1 ring-[#8D49A6]/50 shadow-sm'
                        : 'bg-[#17101C]/80 hover:bg-[#2D2035] border-[#49364F] hover:border-[#8D49A6]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-black text-white">🎓 Öğretmen</span>
                      <span className="text-[9px] font-extrabold text-[#F0D8FA] bg-[#4B075F]/60 px-1 py-0.2 rounded">Eğitim</span>
                    </div>
                    <div className="text-[10px] font-bold text-[#F0D8FA] truncate">Ebru TEKNECİ</div>
                    <div className="text-[9px] text-[#B5A5BD] font-mono mt-0.5 truncate">
                      <strong className="text-white">ogretmen</strong> · <strong className="text-[#45C7A2]">ogretmen123</strong>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* ── MOBILE ONLY: QUICK CREDENTIALS REFERENCE CARD ── */}
            <div className="mt-4 p-4 rounded-2xl bg-[#211729]/80 border border-[#49364F] lg:hidden space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#D2C5D8]">
                <div className="flex items-center gap-1.5">
                  <Key size={13} className="text-[#D914C8]" />
                  <span>Hazır Giriş Bilgileri</span>
                </div>
                <span className="text-[10px] font-bold text-[#F0D8FA]">Öğrenci, Müdür, Öğretmen</span>
              </div>

              {/* Mobile Student Card */}
              <div
                onClick={() => handleRoleSelect('student', true)}
                className="p-3 rounded-xl bg-[#350444]/50 border border-[#8D49A6]/40 flex items-center justify-between cursor-pointer hover:bg-[#350444]/80 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🎒</span>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Öğrenci: Erçil UĞURLU</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#D914C8]/30 text-[#FCE8FA] font-bold">9-A</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#F0D8FA] mt-0.5">
                      Okul No: <strong>101</strong> • Şifre: <strong className="text-[#45C7A2]">ogrenci123</strong>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#FCE8FA] bg-[#4B075F] px-2 py-1 rounded-md border border-[#8D49A6]/50">
                  Doldur
                </span>
              </div>

              {/* Mobile Principal Card */}
              <div
                onClick={() => handleRoleSelect('principal', true)}
                className="p-3 rounded-xl bg-[#2D2035] border border-[#49364F] flex items-center justify-between cursor-pointer hover:bg-[#350444]/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">👔</span>
                  <div>
                    <div className="text-xs font-bold text-white">Müdür: Dr. Uğur UĞURLU</div>
                    <div className="text-[10px] font-mono text-[#D2C5D8] mt-0.5">
                      mudur@oxonom.com • Şifre: <strong className="text-[#45C7A2]">mudur123</strong>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#F0D8FA] bg-[#4B075F]/60 px-2 py-1 rounded-md border border-[#8D49A6]/40">
                  Doldur
                </span>
              </div>

              {/* Mobile Teacher Card */}
              <div
                onClick={() => handleRoleSelect('teacher', true)}
                className="p-3 rounded-xl bg-[#2D2035] border border-[#49364F] flex items-center justify-between cursor-pointer hover:bg-[#350444]/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🎓</span>
                  <div>
                    <div className="text-xs font-bold text-white">Öğretmen: Ebru TEKNECİ</div>
                    <div className="text-[10px] font-mono text-[#D2C5D8] mt-0.5">
                      ogretmen@oxonom.com • Şifre: <strong className="text-[#45C7A2]">ogretmen123</strong>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#F0D8FA] bg-[#4B075F]/60 px-2 py-1 rounded-md border border-[#8D49A6]/40">
                  Doldur
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center text-[11px] text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.06]">
        <div>
          © 2026 Oxonom EDU • Tüm Hakları Saklıdır. Millî Eğitim Bakanlığı Standartlarıyla Tam Uyumlu.
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <Link href="/pano" className="hover:text-white transition-colors">
            Akıllı Tahta Pano
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Gizlilik
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-white transition-colors">
            Kullanım Şartları
          </Link>
        </div>
      </footer>
    </div>
  )
}
