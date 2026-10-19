'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Users,
  Calendar,
  Tv,
  BookOpen,
  BarChart3,
  Settings,
  X,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  Send,
  Bell,
  Grid,
  Check,
} from 'lucide-react'
import { PRINCIPAL_MENU_CONFIG, PRINCIPAL_CATEGORIES, getPrincipalMenuItemByPath } from '@/lib/principal/principalMenuConfig'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { signOut } from '@components/Contexts/AuthContext'
import toast from 'react-hot-toast'
import { getStoredPrincipalProfile, getPrincipalInitials } from '@/lib/principal/principalProfileStorage'
import HeaderLiveClock from '@components/Common/HeaderLiveClock'

interface PrincipalLayoutProps {
  children: React.ReactNode
}

export default function PrincipalLayout({ children }: PrincipalLayoutProps) {
  const pathname = usePathname() || '/principal/dashboard'
  const router = useRouter()
  const { theme, toggleTheme } = useMobileTheme()
  const session = useLHSession() as any
  const user = session?.data?.user

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)

  // Principal profile state (Authentic persistent identity)
  const [adminProfile, setAdminProfile] = useState<{
    name: string
    title: string
    schoolName: string
  }>({
    name: 'Dr. Uğur UĞURLU',
    title: 'Okul Müdürü · Kurum Yetkilisi',
    schoolName: 'Necla Görer İlkokulu',
  })

  // Dynamic counts for menu badges to completely eliminate mock data
  const [counts, setCounts] = useState({
    teachers: '1 Öğretmen',
    students: '1 Öğrenci',
    classes: '1 Sınıf (9/A)',
  })

  useEffect(() => {
    const loadAdminSessionAndCounts = () => {
      if (typeof window !== 'undefined') {
        try {
          const profile = getStoredPrincipalProfile()
          setAdminProfile({
            name: profile.name,
            title: profile.title,
            schoolName: profile.schoolName,
          })

          const org = 30
          // Teachers dynamic count
          const rawTeachers = localStorage.getItem(`oxonom_admin_teachers_${org}`)
          const teachers = rawTeachers ? JSON.parse(rawTeachers) : null
          const tCount = Array.isArray(teachers) && teachers.length > 0 ? teachers.length : 1

          // Students dynamic count
          const rawStudents = localStorage.getItem(`oxonom_admin_students_${org}`)
          const students = rawStudents ? JSON.parse(rawStudents) : null
          const sCount = Array.isArray(students) && students.length > 0 ? students.length : 1

          // Classes dynamic count
          const rawClasses = localStorage.getItem(`oxonom_admin_classes_${org}`)
          const classes = rawClasses ? JSON.parse(rawClasses) : null
          const cCount = Array.isArray(classes) && classes.length > 0 ? classes.length : 1

          setCounts({
            teachers: `${tCount} Öğretmen`,
            students: `${sCount} Öğrenci`,
            classes: `${cCount} Sınıf`,
          })
        } catch (_) {}
      }
    }
    loadAdminSessionAndCounts()
    window.addEventListener('oxonom_admin_updated', loadAdminSessionAndCounts)
    window.addEventListener('oxonom_principal_updated', loadAdminSessionAndCounts)
    window.addEventListener('oxonom_school_updated', loadAdminSessionAndCounts)
    window.addEventListener('oxonom_classes_updated', loadAdminSessionAndCounts)
    window.addEventListener('oxonom_teachers_updated', loadAdminSessionAndCounts)
    window.addEventListener('storage', loadAdminSessionAndCounts)
    return () => {
      window.removeEventListener('oxonom_admin_updated', loadAdminSessionAndCounts)
      window.removeEventListener('oxonom_principal_updated', loadAdminSessionAndCounts)
      window.removeEventListener('oxonom_school_updated', loadAdminSessionAndCounts)
      window.removeEventListener('oxonom_classes_updated', loadAdminSessionAndCounts)
      window.removeEventListener('oxonom_teachers_updated', loadAdminSessionAndCounts)
      window.removeEventListener('storage', loadAdminSessionAndCounts)
    }
  }, [])

  const currentItem = getPrincipalMenuItemByPath(pathname)

  const isCurrentPathActive = (itemPath: string) => {
    if (itemPath === '/principal/dashboard' || itemPath === '/principal') {
      return pathname === '/principal' || pathname === '/principal/dashboard' || pathname === '/dashv2' || pathname === '/m-admin'
    }
    return pathname.startsWith(itemPath)
  }

  // Mobile dock tab definitions
  const mobileDockTabs = [
    {
      id: 'dashboard',
      label: 'İdare',
      path: '/principal/dashboard',
      icon: LayoutDashboard,
      activeIconBg: 'bg-[#112920] dark:bg-emerald-100 text-[#34D399] dark:text-emerald-700',
      inactiveBg: 'bg-[#E3F3EF] dark:bg-emerald-950/60',
      inactiveText: 'text-[#0F766E] dark:text-emerald-300',
    },
    {
      id: 'teachers',
      label: 'Öğretmen',
      path: '/principal/teachers',
      icon: Briefcase,
      activeIconBg: 'bg-[#1C2036] dark:bg-indigo-100 text-[#818CF8] dark:text-indigo-700',
      inactiveBg: 'bg-[#EDF0FD] dark:bg-indigo-950/60',
      inactiveText: 'text-[#4338CA] dark:text-indigo-300',
    },
    {
      id: 'students',
      label: 'Öğrenci',
      path: '/principal/students',
      icon: GraduationCap,
      activeIconBg: 'bg-[#291A36] dark:bg-fuchsia-100 text-[#E879F9] dark:text-fuchsia-700',
      inactiveBg: 'bg-[#F9EDFD] dark:bg-fuchsia-950/60',
      inactiveText: 'text-[#86198F] dark:text-fuchsia-300',
    },
    {
      id: 'schedule',
      label: 'Program',
      path: '/principal/schedule',
      icon: Calendar,
      activeIconBg: 'bg-[#2B2314] dark:bg-amber-100 text-[#FBBF24] dark:text-amber-700',
      inactiveBg: 'bg-[#FEF6E7] dark:bg-amber-950/60',
      inactiveText: 'text-[#B45309] dark:text-amber-300',
    },
  ]

  const handleAdminLogout = async () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('oxonom_active_admin_session')
        localStorage.removeItem('oxonom_current_role')
      } catch (_) {}
    }
    toast.success('Yönetici oturumu güvenle kapatıldı.')
    await signOut()
    window.location.href = '/loginv2'
  }

  return (
    <div className={`${theme} min-h-screen bg-[#F8FAFC] dark:bg-[#0A0D15] text-gray-900 dark:text-white font-jakarta flex flex-col lg:flex-row transition-colors duration-200`}>
      {/* ── DESKTOP SIDEBAR (lg+) ── */}
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 shrink-0 bg-white dark:bg-[#0E1526] border-r border-gray-200/80 dark:border-gray-800/80 z-30 select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-black text-lg">
              OX
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                Oxonom EDU
              </div>
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={11} />
                <span>Müdür & İdare Portalı</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Temayı Değiştir"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Principal Executive Pass / Identity Badge (Prestijli & Farklı Tasarım) */}
        <div className="p-3.5 border-b border-gray-100 dark:border-gray-800/80">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#0E1A38] to-[#06241C] text-white p-3.5 shadow-md shadow-emerald-950/20 border border-emerald-500/25">
            {/* Ambient background glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-emerald-500/15 blur-xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-teal-500/15 blur-lg pointer-events-none" />

            {/* Top row: Authority badge & status */}
            <div className="flex items-center justify-between gap-2 mb-2.5 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                <ShieldCheck size={11} className="text-emerald-400" />
                <span>MEB Kurum Yetkilisi</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Çevrimiçi</span>
              </div>
            </div>

            {/* Main identity row */}
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 p-[1.5px] shadow-sm">
                  <div className="w-full h-full rounded-[10px] bg-[#0F172A] flex items-center justify-center font-black text-sm text-emerald-300">
                    {getPrincipalInitials(adminProfile.name)}
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0F172A] flex items-center justify-center">
                  <Check size={8} className="text-white stroke-[3]" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-extrabold tracking-tight text-white truncate">
                  {adminProfile.name}
                </div>
                <div className="text-[10px] font-bold text-emerald-300/90 truncate flex items-center gap-1 mt-0.5">
                  <span>{adminProfile.title}</span>
                </div>
                <div className="text-[9px] text-gray-300/80 truncate mt-1 flex items-center gap-1 font-medium">
                  <Building2 size={10} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{adminProfile.schoolName}</span>
                </div>
              </div>
            </div>

            {/* Bottom quick meta */}
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-semibold text-gray-300/80 relative z-10">
              <span className="flex items-center gap-1">
                <span className="text-emerald-400 font-bold">Yetki:</span> Tam Yönetici
              </span>
              <span className="text-emerald-400/90">34OXON01</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu (Categorized) without scrollbar */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-none">
          {PRINCIPAL_CATEGORIES.map((cat) => {
            const catItems = PRINCIPAL_MENU_CONFIG.filter((m) => !m.hidden && m.category === cat.id)
            if (catItems.length === 0) return null

            return (
              <div key={cat.id} className="space-y-1">
                <div className="px-3 pt-1 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {cat.title}
                </div>
                {catItems.map((item) => {
                  const Icon = item.icon
                  const active = isCurrentPathActive(item.path)
                  const isPassive = item.status === 'passive'

                  if (isPassive) {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          toast(
                            (t) => (
                              <div className="space-y-1">
                                <div className="font-extrabold text-xs text-amber-500 flex items-center gap-1.5">
                                  <Sparkles size={14} />
                                  <span>{item.label} (Geliştirme Aşamasında)</span>
                                </div>
                                <div className="text-[11px] text-gray-600 dark:text-gray-300">
                                  {item.description}
                                </div>
                                {item.missingDependency && (
                                  <div className="text-[10px] text-gray-400 italic">
                                    Bağımlılık: {item.missingDependency}
                                  </div>
                                )}
                              </div>
                            ),
                            {
                              duration: 4000,
                              style: {
                                borderRadius: '16px',
                                background: theme === 'dark' ? '#121826' : '#ffffff',
                                color: theme === 'dark' ? '#ffffff' : '#0F172A',
                                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                              },
                            }
                          )
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-gray-400 dark:text-gray-500 hover:bg-gray-100/50 dark:hover:bg-gray-800/40 transition-all cursor-pointer opacity-75 hover:opacity-100 text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500">
                            <Icon size={14} />
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-400">
                          {item.badge || 'Pasif'}
                        </span>
                      </button>
                    )
                  }

                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          active ? 'bg-emerald-600 text-white' : 'text-gray-400 group-hover:text-gray-600'
                        }`}>
                          <Icon size={14} />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>

                      {(() => {
                        let badgeText = item.badge
                        if (item.id === 'teachers') badgeText = counts.teachers
                        if (item.id === 'students') badgeText = counts.students
                        if (item.id === 'classes') badgeText = counts.classes

                        if (!badgeText) return null

                        return (
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                            badgeText === 'Canlı'
                              ? 'bg-rose-500/10 text-rose-500'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {badgeText}
                          </span>
                        )
                      })()}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>


        {/* Desktop Logout Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handleAdminLogout}
            className="w-full h-9 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Yönetici Çıkışı Yap</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Desktop Top Header Bar (lg+) — Sleek & Minimal */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-[#0E1526]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 font-medium">Müdürlük</span>
              <ChevronRight size={13} className="text-gray-400" />
              <span className="font-extrabold text-gray-900 dark:text-white">
                {currentItem?.label || 'Genel Bakış'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Clock minimal */}
            <HeaderLiveClock theme="emerald" variant="desktop" />

            <Link
              href="/principal/schedule"
              className="h-9 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-colors border border-gray-200/60 dark:border-gray-700/60"
            >
              <Calendar size={13} />
              <span>Program</span>
            </Link>

            <Link
              href="/principal/teachers"
              className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs shadow-emerald-500/20"
            >
              <Plus size={13} />
              <span>Görevlendir</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer border border-gray-200/60 dark:border-gray-700/60"
              title="Temayı Değiştir"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* Mobile Header Bar (<lg) — Sleek, Minimal & Notch Safe */}
        <header
          className="lg:hidden flex items-center justify-between px-4 pb-2.5 bg-white/95 dark:bg-[#0E1526]/95 border-b border-gray-200/80 dark:border-gray-800/80 sticky top-0 z-30 backdrop-blur-md"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.65rem)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              OX
            </div>
            <div>
              <div className="text-xs font-black text-gray-900 dark:text-white leading-tight">
                Oxonom EDU
              </div>
              <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                {adminProfile.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HeaderLiveClock theme="emerald" variant="mobile" />

            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* Page Content Body (Fluid & Web-Compatible) */}
        <main className="flex-1 w-full min-w-0 pb-24 lg:pb-10 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* ── MOBILE BOTTOM FLOATING DOCK (<lg) ── */}
      <nav
        className="lg:hidden fixed left-1/2 -translate-x-1/2 w-[94%] max-w-[380px] bg-white/95 dark:bg-[#0E1526]/95 backdrop-blur-md border border-gray-200/90 dark:border-gray-800/90 rounded-[28px] p-1.5 flex items-center justify-between shadow-2xl z-40 select-none"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.65rem)' }}
      >
        {mobileDockTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = isCurrentPathActive(tab.path)
          return (
            <Link
              key={tab.id}
              href={tab.path}
              className="relative flex items-center justify-center h-[46px] rounded-full"
            >
              {isActive ? (
                <div className="relative flex items-center gap-1.5 h-full px-3.5 rounded-full z-10">
                  <motion.div
                    layoutId="principal-dock-pill"
                    className="absolute inset-0 bg-[#0A0D15] dark:bg-white rounded-full shadow-md"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                  <div className="w-5 h-5 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center relative z-10">
                    <Icon size={13} className="text-[#34D399] dark:text-[#0A0D15]" />
                  </div>
                  <span className="text-white dark:text-[#0A0D15] text-[11px] font-black relative z-10 pr-0.5">
                    {tab.label}
                  </span>
                </div>
              ) : (
                <div className={`w-[42px] h-[42px] rounded-full ${tab.inactiveBg} ${tab.inactiveText} flex items-center justify-center transition-colors`}>
                  <Icon size={18} />
                </div>
              )}
            </Link>
          )
        })}

        {/* More Modules Button */}
        <button
          type="button"
          onClick={() => setIsMoreSheetOpen(true)}
          className="w-[42px] h-[42px] rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center cursor-pointer"
          title="Tüm İdari Modüller"
        >
          <Grid size={18} />
        </button>
      </nav>

      {/* ── MOBILE "DAHA FAZLA" MODÜL ÇEKMECESİ ── */}
      <AnimatePresence>
        {isMoreSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreSheetOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1526] rounded-t-3xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[85vh] flex flex-col z-10 overflow-hidden pb-[env(safe-area-inset-bottom)]"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Tüm Okul Yönetim Modülleri
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    İdare, kadro, öğrenci ve derslik araçları
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2.5 custom-scrollbar">
                {PRINCIPAL_MENU_CONFIG.filter((m) => !m.hidden).map((item) => {
                  const Icon = item.icon
                  const active = isCurrentPathActive(item.path)
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={() => setIsMoreSheetOpen(false)}
                      className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                        active
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-white dark:bg-[#131C31] border-gray-200/60 dark:border-gray-800/60 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          active ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}>
                          <Icon size={16} />
                        </div>
                        {item.badge && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold leading-tight">
                        {item.label}
                      </div>
                    </Link>
                  )
                })}
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreSheetOpen(false)
                    handleAdminLogout()
                  }}
                  className="text-xs font-bold text-rose-500 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Yönetici Oturumunu Kapat</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
