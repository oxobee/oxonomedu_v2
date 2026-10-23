'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FileCheck,
  Sparkles,
  BookmarkCheck,
  TrendingUp,
  MessageSquare,
  Calendar,
  Settings,
  LayoutGrid,
  Sun,
  Moon,
  LogOut,
  X,
  Award,
  ChevronRight,
  ShieldCheck,
  User,
  Bell,
  Search,
  Flame,
  Gem,
  Crown,
} from 'lucide-react'
import { STUDENT_MENU_CONFIG, type StudentMenuItem } from '@/lib/student/studentMenuConfig'
import { signOut } from '@components/Contexts/AuthContext'
import {
  DEFAULT_STUDENT_PROFILE,
  getSynchronizedStudentProfile,
  type StudentProfile,
} from '@/lib/student/studentData'
import HeaderLiveClock from '@components/Common/HeaderLiveClock'
import HeaderNotificationDropdown from '@components/Notifications/HeaderNotificationDropdown'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import OxonomPlusModal from '@components/Student/modals/OxonomPlusModal'
import { startDemoAutoResetWatcher, resetAllDemoData } from '@/lib/demo/demoResetEngine'

// Real 3D Owl Mascot Icon matching user's uploaded corporate mascot
export function OxoMascotIcon({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/oxonom-hero-owl.png"
        alt="Oxonom Maskot"
        className="w-full h-full object-contain drop-shadow-md select-none"
      />
    </div>
  )
}

interface StudentLayoutProps {
  children: React.ReactNode
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const pathname = usePathname() || '/student/dashboard'
  const currentMenuItem = STUDENT_MENU_CONFIG.find(
    (m) => m.path === pathname || (m.path !== '/student/dashboard' && pathname.startsWith(m.path))
  )
  const { theme, toggleTheme } = useMobileTheme()

  const isPricingPage = pathname === '/student/pricing' || pathname.startsWith('/student/pricing')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isPricingPage)

  useEffect(() => {
    if (pathname === '/student/pricing' || pathname.startsWith('/student/pricing')) {
      setIsSidebarCollapsed(true)
    }
  }, [pathname])

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)
  const [isPlusModalOpen, setIsPlusModalOpen] = useState(false)
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE)
  const [searchQuery, setSearchQuery] = useState('')

  // Load student profile synchronized with teacher records
  useEffect(() => {
    const stopWatcher = startDemoAutoResetWatcher()

    const syncProfile = () => {
      setProfile(getSynchronizedStudentProfile())
    }
    syncProfile()

    window.addEventListener('oxonom_demo_reset', syncProfile)
    window.addEventListener('oxonom_student_updated', syncProfile)
    window.addEventListener('oxonom_teacher_profile_updated', syncProfile)
    window.addEventListener('oxonom_attendance_updated', syncProfile)
    window.addEventListener('storage', syncProfile)

    return () => {
      stopWatcher()
      window.removeEventListener('oxonom_demo_reset', syncProfile)
      window.removeEventListener('oxonom_student_updated', syncProfile)
      window.removeEventListener('oxonom_teacher_profile_updated', syncProfile)
      window.removeEventListener('oxonom_attendance_updated', syncProfile)
      window.removeEventListener('storage', syncProfile)
    }
  }, [])

  const isCurrentPathActive = (targetPath: string) => {
    if (targetPath === '/student/dashboard') {
      return pathname === '/student/dashboard' || pathname === '/student'
    }
    return pathname.startsWith(targetPath)
  }

  // Mobile Bottom Dock: 4 Main Items + 1 "Daha Fazla" Drawer Button
  const DOCK_ITEMS = [
    {
      id: 'dashboard',
      label: 'Ana Sayfa',
      path: '/student/dashboard',
      icon: LayoutDashboard,
      activeIconBg: 'bg-white/15 text-[#D914C8]',
      inactiveBg: 'bg-[#F7F0FA] dark:bg-[#2D2035]',
      inactiveText: 'text-[#716779] dark:text-[#D2C5D8]',
    },
    {
      id: 'courses',
      label: 'Derslerim',
      path: '/student/courses',
      icon: GraduationCap,
      activeIconBg: 'bg-white/15 text-[#D914C8]',
      inactiveBg: 'bg-[#F7F0FA] dark:bg-[#2D2035]',
      inactiveText: 'text-[#716779] dark:text-[#D2C5D8]',
    },
    {
      id: 'assignments',
      label: 'Ödevlerim',
      path: '/student/assignments',
      icon: BookOpen,
      activeIconBg: 'bg-white/15 text-[#D914C8]',
      inactiveBg: 'bg-[#F7F0FA] dark:bg-[#2D2035]',
      inactiveText: 'text-[#716779] dark:text-[#D2C5D8]',
    },
    {
      id: 'learn',
      label: 'Keşfet',
      path: '/student/learn',
      icon: Sparkles,
      activeIconBg: 'bg-white/15 text-[#D914C8]',
      inactiveBg: 'bg-[#F7F0FA] dark:bg-[#2D2035]',
      inactiveText: 'text-[#716779] dark:text-[#D2C5D8]',
    },
  ]

  // Secondary items under "Daha Fazla"
  const MORE_ITEMS = STUDENT_MENU_CONFIG.filter(
    (item) => !['dashboard', 'courses', 'assignments', 'learn'].includes(item.id)
  )

  // XP calculation based on GPA and attendance
  const studentXp = Math.round(profile.gpa * 10 + profile.attendanceRate * 2.5) || 750

  return (
    <div
      className={`${theme} min-h-screen w-full max-w-full overflow-x-hidden bg-[#FCF9FD] dark:bg-[#17101C] text-[#241329] dark:text-[#FCF9FD] font-jakarta flex flex-col lg:flex-row transition-colors duration-200 antialiased`}
    >
      {/* ── DESKTOP SIDEBAR (lg+) — Lingora Claymorphic SaaS Style (Collapsible with Elastic Animation) ── */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen shrink-0 bg-white dark:bg-[#211729] border-r border-[#E8DFEB] dark:border-[#49364F] z-30 select-none shadow-[2px_0_24px_rgba(75,7,95,0.03)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isSidebarCollapsed ? 'w-[76px]' : 'w-[270px] xl:w-[280px]'
        }`}
      >
        {/* Elastic Expand/Collapse Toggle Pill on Right Edge */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3.5 top-6 w-7 h-7 rounded-full bg-white dark:bg-[#2D2035] border border-[#E8DFEB] dark:border-[#49364F] shadow-md flex items-center justify-center text-[#4B075F] dark:text-[#F17AE6] hover:scale-110 active:scale-95 transition-all z-40 cursor-pointer"
          title={isSidebarCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
        >
          <ChevronRight
            size={14}
            strokeWidth={2.8}
            className={`transition-transform duration-300 ${isSidebarCollapsed ? '' : 'rotate-180'}`}
          />
        </button>

        {/* Brand Header with Oxonom EDU Official Logo/Icon */}
        <div
          className={`p-4 flex items-center border-b border-[#E8DFEB] dark:border-[#49364F] transition-all ${
            isSidebarCollapsed ? 'justify-center' : 'justify-start gap-2.5 px-5'
          }`}
        >
          <Link href="/student/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <img
                src={theme === 'dark' ? '/oxonom-icon-white.png' : '/oxonom-icon-colored.png'}
                alt="Oxonom EDU"
                className="w-9 h-9 object-contain select-none group-hover:scale-105 transition-transform"
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden whitespace-nowrap animate-fade-in">
                <div className="text-base font-black tracking-tight text-[#241329] dark:text-white leading-tight">
                  Oxonom EDU
                </div>
                <div className="text-[10px] font-bold text-[#8D49A6] dark:text-[#C58ADB] tracking-wide">
                  Öğrenci Portalı
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items — Grouped by Category without scrollbar */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-3 scrollbar-none">
          {(['DERSLERİM & ÇALIŞMALAR', 'PLANLAMA & GELİŞİM', 'KAYNAKLAR & İLETİŞİM', 'DİĞER'] as const).map((cat) => {
            const catItems = STUDENT_MENU_CONFIG.filter((item) => (item.category || 'DERSLERİM & ÇALIŞMALAR') === cat)
            if (catItems.length === 0) return null

            return (
              <div key={cat} className="space-y-1">
                {isSidebarCollapsed ? (
                  <div className="my-2 mx-auto w-6 h-[1px] bg-[#E8DFEB]/80 dark:bg-[#49364F]/80" />
                ) : (
                  <div className="px-3 pt-1 pb-1 text-[9.5px] font-black tracking-wider text-[#8D49A6] dark:text-[#C58ADB] uppercase">
                    {cat}
                  </div>
                )}
                {catItems.map((item) => {
                  const Icon = item.icon
                  const active = isCurrentPathActive(item.path)
                  const isPassive = item.status === 'passive'

                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      title={item.label}
                      className={`group flex items-center ${
                        isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                      } rounded-xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-[#F0D8FA] dark:bg-[#4B075F]/40 text-[#4B075F] dark:text-[#FCF9FD] shadow-xs'
                          : isPassive
                          ? 'text-[#716779]/60 dark:text-[#B5A5BD]/50 hover:bg-[#F7F0FA] dark:hover:bg-[#2D2035]/40'
                          : 'text-[#514458] dark:text-[#D2C5D8] hover:bg-[#F7F0FA] dark:hover:bg-[#2D2035] hover:text-[#241329] dark:hover:text-white'
                      }`}
                    >
                      <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5 min-w-0'}`}>
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            active
                              ? 'bg-[#4B075F]/10 dark:bg-[#D914C8]/20 text-[#4B075F] dark:text-[#D914C8]'
                              : 'text-[#716779] dark:text-[#B5A5BD] group-hover:text-[#4B075F] dark:group-hover:text-white'
                          }`}
                        >
                          <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                        </div>
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isSidebarCollapsed && (
                        <div className="flex items-center gap-1 shrink-0">
                          {item.badge && (
                            <span className="text-[8.5px] px-1.5 py-0.5 rounded-md font-bold bg-purple-500/15 text-[#8D49A6] dark:text-[#F0D8FA]">
                              {item.badge}
                            </span>
                          )}
                          {isPassive && !item.badge && (
                            <span className="text-[8.5px] px-1.5 py-0.5 rounded-md bg-[#FFF3D9] dark:bg-[#B86B00]/20 text-[#B86B00] dark:text-[#F5C542] font-semibold">
                              Yakında
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* Oxonom Plus / PRO Promo Card (Opens Animated Modal) */}
        <div className={isSidebarCollapsed ? 'px-2 pb-2 flex justify-center' : 'px-4 pb-2'}>
          {isSidebarCollapsed ? (
            <div
              onClick={() => setIsPlusModalOpen(true)}
              title="Oxonom Plus Kampanyası"
              className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center cursor-pointer shadow-md shadow-[#4B075F]/30 hover:scale-105 active:scale-95 transition-all text-white"
            >
              <Crown size={18} className="fill-white" />
            </div>
          ) : (
            <div
              onClick={() => setIsPlusModalOpen(true)}
              className="p-3.5 rounded-3xl bg-gradient-to-b from-[#FCF9FD] via-[#F7F0FA] to-[#F0D8FA] dark:from-[#211729] dark:via-[#2D2035] dark:to-[#350444] border border-[#8D49A6]/40 dark:border-[#49364F] relative overflow-hidden shadow-xs cursor-pointer hover:border-[#D914C8] transition-all group"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#F0D8FA] dark:bg-[#4B075F]/40 text-[#D914C8] flex items-center justify-center shrink-0">
                    <Crown size={14} className="fill-[#D914C8] text-[#D914C8]" />
                  </div>
                  <span className="text-xs font-black text-[#241329] dark:text-white">
                    Oxonom Plus
                  </span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-gradient text-white font-black shadow-xs">
                  200 ₺/ay
                </span>
              </div>
              <p className="text-[10px] text-[#514458] dark:text-[#D2C5D8] leading-snug mb-2.5">
                9 ay öde, 12 ay kesintisiz kullan! 3 ay hediye ile tüm MEB kitapları ve yapay zekâ cebinde.
              </p>
              <button
                type="button"
                className="w-full py-2 rounded-xl bg-brand-gradient text-white font-extrabold text-[11px] text-center block shadow-sm shadow-[#4B075F]/20 transition-all group-hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
              >
                Planları İncele
              </button>
            </div>
          )}
        </div>

        {/* User Profile Pill at Bottom (Alex Level 12 style) */}
        <div className={`p-3 border-t border-[#E8DFEB] dark:border-[#49364F] ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
          {isSidebarCollapsed ? (
            <Link
              href="/student/settings"
              title={`${profile.name} (${profile.className})`}
              className="relative group block"
            >
              <div className="w-10 h-10 rounded-full bg-brand-gradient text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                {profile.firstName.slice(0, 1)}
                {profile.lastName.slice(0, 1)}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#16805D] ring-2 ring-white dark:ring-[#211729]" />
            </Link>
          ) : (
            <div className="p-2 rounded-2xl bg-[#F7F0FA] dark:bg-[#2D2035] border border-[#E8DFEB] dark:border-[#49364F] flex items-center justify-between gap-2.5">
              <Link
                href="/student/settings"
                className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity"
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-brand-gradient text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {profile.firstName.slice(0, 1)}
                    {profile.lastName.slice(0, 1)}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#16805D] ring-2 ring-white dark:ring-[#211729]" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-[#241329] dark:text-white truncate">
                    {profile.name}
                  </div>
                  <div className="text-[10px] font-bold text-[#8D49A6] dark:text-[#C58ADB] truncate flex items-center gap-1">
                    <span>{profile.className}</span>
                    <span>•</span>
                    <span>Seviye {Math.max(1, Math.round(profile.gpa / 10))}</span>
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-0.5 shrink-0">
                <Link
                  href="/student/settings"
                  className="w-7 h-7 rounded-lg hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#716779] hover:text-[#4B075F] dark:hover:text-white flex items-center justify-center transition-colors"
                  title="Ayarlar"
                >
                  <Settings size={14} />
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    if (typeof window !== 'undefined') {
                      try {
                        localStorage.removeItem('oxonom_student_profile')
                        localStorage.removeItem('oxonom_current_role')
                      } catch (_) {}
                    }
                    await signOut()
                    window.location.href = '/login'
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-[#FCE8ED] dark:hover:bg-[#C62848]/20 text-[#716779] hover:text-[#C62848] dark:hover:text-[#F17AE6] flex items-center justify-center transition-colors cursor-pointer"
                  title="Oturumu Kapat"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isSidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[270px] xl:pl-[280px]'
        }`}
      >
        {/* Desktop Top Header Bar (lg+) — Sleek & Minimal */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-[#E8DFEB] dark:border-[#49364F] bg-white/80 dark:bg-[#211729]/80 backdrop-blur-xl sticky top-0 z-20 select-none">
          {/* Rounded Pill Search Input */}
          <div className="relative w-72 xl:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#716779]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ders, ödev, konu veya kitap ara..."
              className="w-full h-9 pl-9 pr-4 rounded-xl bg-[#FCF9FD] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#49364F] text-xs font-semibold text-[#241329] dark:text-[#FCF9FD] placeholder-[#716779] focus:outline-none focus:ring-2 focus:ring-[#8D49A6]/30 transition-all"
            />
          </div>

          {/* Right Status (Minimal Clock, Notification, Theme, Profile) */}
          <div className="flex items-center gap-2.5">
            {/* Demo Reset Indicator & Trigger */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Demo Modu (30 dk Sıfırlama)</span>
              <button
                type="button"
                onClick={() => resetAllDemoData({ force: true, notify: true })}
                title="Demo verilerini şimdi sıfırla"
                className="ml-1 px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold transition-all cursor-pointer"
              >
                Yenile
              </button>
            </div>

            <HeaderLiveClock theme="oxonom" variant="desktop" />

            {/* Notification Dropdown with Elastic Popup & Audio */}
            <HeaderNotificationDropdown communicationRoute="/student/communication" />

            {/* Quick Theme Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] border border-[#E8DFEB] dark:border-[#49364F] flex items-center justify-center text-[#716779] dark:text-[#D2C5D8] hover:text-[#4B075F] dark:hover:text-white transition-colors cursor-pointer"
              title="Temayı Değiştir"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* ── MOBILE HEADER (<lg) — Sleek, Minimal, Notch Safe ── */}
        <header
          className="lg:hidden sticky top-0 z-30 bg-white/90 dark:bg-[#211729]/90 backdrop-blur-xl border-b border-[#E8DFEB] dark:border-[#49364F] px-4 pb-2.5 flex items-center justify-between select-none"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <img
                src={theme === 'dark' ? '/oxonom-icon-white.png' : '/oxonom-icon-colored.png'}
                alt="Oxonom EDU"
                className="w-10 h-10 object-contain select-none"
              />
            </div>
            <div className="text-xs font-black text-[#241329] dark:text-white leading-none">
              Oxonom EDU
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HeaderLiveClock theme="oxonom" variant="mobile" />

            {/* Notification Dropdown with Elastic Popup & Audio */}
            <HeaderNotificationDropdown communicationRoute="/student/communication" />

            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full bg-[#F7F0FA] dark:bg-[#2D2035] text-[#716779] dark:text-[#D2C5D8] flex items-center justify-center cursor-pointer"
              title="Temayı Değiştir"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </header>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden pb-28 lg:pb-12 flex flex-col">
          {children}
        </main>
      </div>

      {/* ── MOBILE FLOATING BOTTOM DOCK — Lingora Pill Aesthetics ── */}
      <nav
        className="lg:hidden fixed safe-dock-bottom left-1/2 -translate-x-1/2 w-[92%] max-w-[390px] bg-white/95 dark:bg-[#211729]/95 backdrop-blur-2xl border border-[#E8DFEB]/90 dark:border-[#49364F]/90 rounded-full px-2 py-1.5 flex items-center justify-between gap-1 shadow-[0_12px_40px_rgba(75,7,95,0.12)] z-40 select-none"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
        aria-label="Öğrenci alt menü"
      >
        {/* 4 Primary Navigation Items */}
        {DOCK_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = isCurrentPathActive(item.path)

          if (isActive) {
            return (
              <Link
                key={item.id}
                href={item.path}
                className="h-11 px-3.5 rounded-full bg-[#4B075F] text-white flex items-center gap-2 font-black text-xs shadow-md shadow-[#4B075F]/25 shrink-0 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon size={14} strokeWidth={2.6} />
                </div>
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer hover:scale-105 active:scale-95 ${item.inactiveBg} ${item.inactiveText}`}
              title={item.label}
            >
              <Icon size={18} strokeWidth={2.2} />
            </Link>
          )
        })}

        {/* 5th Item: "Daha Fazla" Drawer Toggle */}
        <button
          type="button"
          onClick={() => setIsMoreSheetOpen(true)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer hover:scale-105 active:scale-95 ${
            isMoreSheetOpen
              ? 'bg-[#F0D8FA] text-[#4B075F]'
              : 'bg-[#F7F0FA] dark:bg-[#2D2035] text-[#716779] dark:text-[#D2C5D8]'
          }`}
          title="Daha Fazla Modül"
        >
          <LayoutGrid size={18} strokeWidth={2.2} />
        </button>
      </nav>

      {/* ── MOBILE "DAHA FAZLA" BOTTOM SHEET ── */}
      <AnimatePresence>
        {isMoreSheetOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center font-jakarta">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreSheetOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sheet Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#211729] rounded-t-[32px] shadow-2xl border border-[#E8DFEB] dark:border-[#49364F] max-h-[85vh] flex flex-col z-10 overflow-hidden pb-[env(safe-area-inset-bottom)]"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[#E8DFEB] dark:border-[#49364F] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#241329] dark:text-white">
                    Öğrenci Modülleri
                  </h3>
                  <p className="text-[11px] text-[#716779] dark:text-[#B5A5BD] mt-0.5">
                    Kitaplık, sınavlar, gelişim ve planlayıcı
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F7F0FA] dark:bg-[#2D2035] flex items-center justify-center text-[#716779] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mobile Oxonom Plus Promo Card in Drawer */}
              <div className="px-4 pt-3">
                <div
                  onClick={() => {
                    setIsMoreSheetOpen(false)
                    setIsPlusModalOpen(true)
                  }}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FCF9FD] to-[#F0D8FA] dark:from-[#211729] dark:to-[#350444] border border-[#8D49A6]/40 dark:border-[#49364F] flex items-center justify-between cursor-pointer shadow-xs active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-gradient text-white flex items-center justify-center shadow-xs shrink-0">
                      <Crown size={18} className="fill-white" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#241329] dark:text-white flex items-center gap-1.5">
                        <span>Oxonom Plus</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#4B075F] text-white font-black">
                          199 ₺
                        </span>
                      </div>
                      <div className="text-[10px] text-[#514458] dark:text-[#D2C5D8]">
                        <span className="line-through text-[#716779]">899 ₺</span> yerine %78 indirim fırsatı
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={17} className="text-[#8D49A6] shrink-0" />
                </div>
              </div>

              {/* Modules Grid */}
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2.5 scrollbar-none">
                {MORE_ITEMS.map((item) => {
                  const Icon = item.icon
                  const active = isCurrentPathActive(item.path)
                  const isPassive = item.status === 'passive'

                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={() => setIsMoreSheetOpen(false)}
                      className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                        active
                          ? 'bg-[#F0D8FA] dark:bg-[#4B075F]/30 border-[#8D49A6]/40 text-[#4B075F] dark:text-[#FCF9FD]'
                          : isPassive
                          ? 'bg-[#F7F0FA]/60 dark:bg-[#17101C]/60 border-[#E8DFEB]/60 dark:border-[#49364F]/50 text-[#716779]/60'
                          : 'bg-[#FCF9FD] dark:bg-[#17101C] border-[#E8DFEB] dark:border-[#49364F] text-[#514458] dark:text-[#D2C5D8] hover:border-[#8D49A6]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            active
                              ? 'bg-[#4B075F] text-white shadow-xs'
                              : 'bg-[#F0D8FA] dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB]'
                          }`}
                        >
                          <Icon size={17} />
                        </div>
                        {item.badge ? (
                          <span className="text-[8px] px-2 py-0.5 rounded-full bg-purple-500/15 text-[#8D49A6] dark:text-[#F0D8FA] font-bold">
                            {item.badge}
                          </span>
                        ) : isPassive ? (
                          <span className="text-[8px] px-2 py-0.5 rounded-full bg-[#FFF3D9] dark:bg-[#B86B00]/20 text-[#B86B00] dark:text-[#F5C542] font-bold">
                            Yakında
                          </span>
                        ) : null}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">
                          {item.label}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Bottom Quick Logout */}
              <div className="p-4 border-t border-[#E8DFEB] dark:border-[#49364F] flex items-center justify-between">
                <button
                  type="button"
                  onClick={async () => {
                    setIsMoreSheetOpen(false)
                    if (typeof window !== 'undefined') {
                      try {
                        localStorage.removeItem('oxonom_student_profile')
                        localStorage.removeItem('oxonom_current_role')
                      } catch (_) {}
                    }
                    await signOut()
                    window.location.href = '/login'
                  }}
                  className="text-xs font-black text-[#C62848] dark:text-[#F17AE6] flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Oturumu Kapat</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── OXONOM PLUS ANIMATED PROMO MODAL ── */}
      <OxonomPlusModal
        isOpen={isPlusModalOpen}
        onClose={() => setIsPlusModalOpen(false)}
      />
    </div>
  )
}
