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
      activeIconBg: 'bg-[#4B075F] text-white',
      inactiveBg: 'bg-[#F0D8FA] dark:bg-[#350444]',
      inactiveText: 'text-[#4B075F] dark:text-[#F0D8FA]',
    },
    {
      id: 'teachers',
      label: 'Öğretmen',
      path: '/principal/teachers',
      icon: Briefcase,
      activeIconBg: 'bg-[#4B075F] text-white',
      inactiveBg: 'bg-[#F0D8FA] dark:bg-[#350444]',
      inactiveText: 'text-[#4B075F] dark:text-[#F0D8FA]',
    },
    {
      id: 'students',
      label: 'Öğrenci',
      path: '/principal/students',
      icon: GraduationCap,
      activeIconBg: 'bg-[#4B075F] text-white',
      inactiveBg: 'bg-[#F0D8FA] dark:bg-[#350444]',
      inactiveText: 'text-[#4B075F] dark:text-[#F0D8FA]',
    },
    {
      id: 'schedule',
      label: 'Program',
      path: '/principal/schedule',
      icon: Calendar,
      activeIconBg: 'bg-[#4B075F] text-white',
      inactiveBg: 'bg-[#F0D8FA] dark:bg-[#350444]',
      inactiveText: 'text-[#4B075F] dark:text-[#F0D8FA]',
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
    <div className={`${theme} min-h-screen bg-[#FCF9FD] dark:bg-[#17101C] text-[#241329] dark:text-[#FCF9FD] font-jakarta flex flex-col lg:flex-row transition-colors duration-200`}>
      {/* ── DESKTOP SIDEBAR (lg+) ── */}
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 shrink-0 bg-white dark:bg-[#211729] border-r border-[#E8DFEB] dark:border-[#49364F] z-30 select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E8DFEB] dark:border-[#49364F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-gradient flex items-center justify-center text-white shadow-md shadow-[#4B075F]/20 font-black text-lg">
              OX
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-[#241329] dark:text-white leading-tight">
                Oxonom EDU
              </div>
              <div className="text-[10px] font-bold text-[#4B075F] dark:text-[#C58ADB] uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={11} className="text-[#D914C8]" />
                <span>Müdür & İdare Portalı</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#350444] text-[#514458] dark:text-[#D2C5D8] flex items-center justify-center transition-colors cursor-pointer border border-[#E8DFEB] dark:border-[#49364F]"
            title="Temayı Değiştir"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Principal Executive Pass / Identity Badge - Clean & Minimalist */}
        <div className="p-3 border-b border-[#E8DFEB] dark:border-[#49364F]">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-50/70 dark:bg-[#231227] border border-[#8D49A6]/15 dark:border-[#8D49A6]/30">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#4B075F] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {getPrincipalInitials(adminProfile.name)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#231227]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                {adminProfile.name}
              </div>
              <div className="text-[11px] font-medium text-[#8D49A6] dark:text-[#F0D8FA] truncate">
                {adminProfile.title || 'Okul Müdürü'}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                <Building2 size={11} className="shrink-0 text-gray-400 dark:text-gray-500" />
                <span className="truncate">{adminProfile.schoolName}</span>
              </div>
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
                          ? 'bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] border border-[#D5C5DC] dark:border-[#8D49A6]/40 shadow-xs'
                          : 'text-[#514458] dark:text-[#D2C5D8] hover:bg-[#F7F0FA] dark:hover:bg-[#2D2035] hover:text-[#241329] dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          active ? 'bg-[#4B075F] text-white' : 'text-[#716779] group-hover:text-[#4B075F]'
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
                              ? 'bg-[#C62848]/15 text-[#C62848]'
                              : 'bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA]'
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
        <div className="p-3 border-t border-[#E8DFEB] dark:border-[#49364F] flex items-center justify-between">
          <button
            type="button"
            onClick={handleAdminLogout}
            className="w-full h-9 rounded-xl hover:bg-[#FCE8ED] dark:hover:bg-[#C62848]/20 text-[#C62848] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Yönetici Çıkışı Yap</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Desktop Top Header Bar (lg+) — Sleek & Minimal */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-[#E8DFEB] dark:border-[#49364F] bg-white/80 dark:bg-[#211729]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#716779] font-medium">Müdürlük</span>
              <ChevronRight size={13} className="text-[#716779]" />
              <span className="font-extrabold text-[#241329] dark:text-white">
                {currentItem?.label || 'Genel Bakış'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Clock minimal */}
            <HeaderLiveClock theme="oxonom" variant="desktop" />

            <Link
              href="/principal/schedule"
              className="h-9 px-3 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#350444] text-[#241329] dark:text-[#FCF9FD] font-bold text-xs flex items-center gap-1.5 transition-colors border border-[#E8DFEB] dark:border-[#49364F]"
            >
              <Calendar size={13} className="text-[#4B075F] dark:text-[#C58ADB]" />
              <span>Program</span>
            </Link>

            <Link
              href="/principal/teachers"
              className="h-9 px-3 rounded-xl bg-[#4B075F] hover:bg-[#620B79] active:bg-[#350444] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs shadow-[#4B075F]/20"
            >
              <Plus size={13} />
              <span>Görevlendir</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#350444] text-[#514458] dark:text-[#D2C5D8] flex items-center justify-center transition-colors cursor-pointer border border-[#E8DFEB] dark:border-[#49364F]"
              title="Temayı Değiştir"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* Mobile Header Bar (<lg) — Sleek, Minimal & Notch Safe */}
        <header
          className="lg:hidden flex items-center justify-between px-4 pb-2.5 bg-white/95 dark:bg-[#211729]/95 border-b border-[#E8DFEB] dark:border-[#49364F] sticky top-0 z-30 backdrop-blur-md"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.65rem)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-gradient text-white font-black text-xs flex items-center justify-center shadow-xs">
              OX
            </div>
            <div>
              <div className="text-xs font-black text-[#241329] dark:text-white leading-tight">
                Oxonom EDU
              </div>
              <div className="text-[9px] font-bold text-[#4B075F] dark:text-[#C58ADB]">
                {adminProfile.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HeaderLiveClock theme="oxonom" variant="mobile" />

            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] text-[#514458] dark:text-[#D2C5D8] flex items-center justify-center cursor-pointer border border-[#E8DFEB] dark:border-[#49364F]"
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
        className="lg:hidden fixed left-1/2 -translate-x-1/2 w-[94%] max-w-[380px] bg-white/95 dark:bg-[#211729]/95 backdrop-blur-md border border-[#E8DFEB] dark:border-[#49364F] rounded-[28px] p-1.5 flex items-center justify-between shadow-2xl z-40 select-none"
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
                    className="absolute inset-0 bg-[#4B075F] dark:bg-[#F0D8FA] rounded-full shadow-md"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                  <div className="w-5 h-5 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center relative z-10">
                    <Icon size={13} className="text-[#FCE8FA] dark:text-[#4B075F]" />
                  </div>
                  <span className="text-white dark:text-[#4B075F] text-[11px] font-black relative z-10 pr-0.5">
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
          className="w-[42px] h-[42px] rounded-full bg-[#F7F0FA] dark:bg-[#2D2035] text-[#514458] dark:text-[#D2C5D8] flex items-center justify-center cursor-pointer border border-[#E8DFEB] dark:border-[#49364F]"
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
              className="relative w-full max-w-lg bg-white dark:bg-[#211729] rounded-t-3xl shadow-2xl border border-[#E8DFEB] dark:border-[#49364F] max-h-[85vh] flex flex-col z-10 overflow-hidden pb-[env(safe-area-inset-bottom)]"
            >
              <div className="p-4 border-b border-[#E8DFEB] dark:border-[#49364F] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#241329] dark:text-white">
                    Tüm Okul Yönetim Modülleri
                  </h3>
                  <p className="text-[11px] text-[#716779] mt-0.5">
                    İdare, kadro, öğrenci ve derslik araçları
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F7F0FA] dark:bg-[#2D2035] flex items-center justify-center text-[#514458] dark:text-[#D2C5D8] cursor-pointer"
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
                          ? 'bg-[#F0D8FA] dark:bg-[#350444] border-[#D5C5DC] dark:border-[#8D49A6]/50 text-[#4B075F] dark:text-[#F0D8FA]'
                          : 'bg-white dark:bg-[#2D2035] border-[#E8DFEB] dark:border-[#49364F] text-[#241329] dark:text-[#FCF9FD]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          active ? 'bg-[#4B075F] text-white' : 'bg-[#F7F0FA] dark:bg-[#211729] text-[#4B075F] dark:text-[#F0D8FA]'
                        }`}>
                          <Icon size={16} />
                        </div>
                        {item.badge && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] font-bold">
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

              <div className="p-4 border-t border-[#E8DFEB] dark:border-[#49364F] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreSheetOpen(false)
                    handleAdminLogout()
                  }}
                  className="text-xs font-bold text-[#C62848] flex items-center gap-1.5 cursor-pointer"
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
