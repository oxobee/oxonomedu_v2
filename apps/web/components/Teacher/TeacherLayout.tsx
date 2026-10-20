'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Users,
  Tv,
  CheckSquare,
  LayoutGrid,
  Calendar,
  BookOpen,
  Award,
  Sparkles,
  FolderOpen,
  MessageSquare,
  TrendingUp,
  FileText,
  BarChart3,
  Settings,
  X,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react'
import { TEACHER_MENU_CONFIG, getMenuItemByPath } from '@/lib/teacher/teacherMenuConfig'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { signOut } from '@components/Contexts/AuthContext'
import HeaderLiveClock from '@components/Common/HeaderLiveClock'

interface TeacherLayoutProps {
  children: React.ReactNode
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  const pathname = usePathname() || '/teacher/dashboard'
  const currentItem = getMenuItemByPath(pathname)
  const { theme, toggleTheme } = useMobileTheme()
  const session = useLHSession() as any
  const user = session?.data?.user

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)

  // Teacher identity details (Authentic teacher profile, never mixes with principal)
  const [teacherProfile, setTeacherProfile] = useState<{ name: string; branch: string }>({
    name: 'Ebru TEKNECİ',
    branch: 'Türk Dili ve Edebiyatı · Rehberlik',
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_teacher_profile')
        if (saved) {
          const parsed = JSON.parse(saved)
          setTeacherProfile({
            name: `${parsed.firstName || parsed.name || 'Ebru'} ${parsed.lastName || 'TEKNECİ'}`.trim(),
            branch: parsed.branch || 'Türk Dili ve Edebiyatı · Rehberlik',
          })
          return
        }
      } catch (_) {}
      const isPrincipal = (user?.email || '').includes('mudur') || user?.role === 'admin'
      if (user?.first_name && !isPrincipal) {
        setTeacherProfile({
          name: `${user.first_name} ${user.last_name || ''}`.trim(),
          branch: 'Türk Dili ve Edebiyatı · Rehberlik',
        })
      }
    }
  }, [user])

  const teacherName = teacherProfile.name
  const teacherBranch = teacherProfile.branch

  const isCurrentPathActive = (targetPath: string) => {
    if (targetPath === '/teacher/dashboard') {
      return pathname === '/teacher/dashboard' || pathname === '/teacher'
    }
    return pathname.startsWith(targetPath)
  }

  // Visual definition matching the requested mobile dock design
  const DOCK_NAV_ITEMS = [
    {
      id: 'dashboard',
      label: 'Ana Sayfa',
      path: '/teacher/dashboard',
      icon: Home,
      activeIconBg: 'bg-white/15 dark:bg-black/10 text-[#D914C8] dark:text-[#4B075F]',
      inactiveBg: 'bg-[#F7F0FA] dark:bg-[#2D2035]',
      inactiveText: 'text-[#716779] dark:text-[#D2C5D8]',
    },
    {
      id: 'classes',
      label: 'Sınıflarım',
      path: '/teacher/classes',
      icon: Users,
      activeIconBg: 'bg-white/15 dark:bg-black/10 text-[#D914C8] dark:text-[#4B075F]',
      inactiveBg: 'bg-[#F7F0FA] dark:bg-[#2D2035]',
      inactiveText: 'text-[#716779] dark:text-[#D2C5D8]',
    },
    {
      id: 'assignments',
      label: 'Ödevler',
      path: '/teacher/assignments',
      icon: BookOpen,
      activeIconBg: 'bg-white/15 dark:bg-black/10 text-[#D914C8] dark:text-[#4B075F]',
      inactiveBg: 'bg-[#F7F0FA] dark:bg-[#2D2035]',
      inactiveText: 'text-[#716779] dark:text-[#D2C5D8]',
    },
    {
      id: 'attendance',
      label: 'Yoklama',
      path: '/teacher/attendance',
      icon: CheckSquare,
      activeIconBg: 'bg-white/15 dark:bg-black/10 text-[#D914C8] dark:text-[#4B075F]',
      inactiveBg: 'bg-[#F7F0FA] dark:bg-[#2D2035]',
      inactiveText: 'text-[#716779] dark:text-[#D2C5D8]',
    },
  ]

  // Filter out hidden modules (e.g. AI Assistant for now)
  const visibleMenuItems = TEACHER_MENU_CONFIG.filter((item) => !item.hidden)

  const isDesktopOS = pathname === '/teacher/desktop-os'

  if (isDesktopOS) {
    return (
      <div className={`${theme} min-h-screen w-full font-jakarta bg-[#0D1117]`}>
        {children}
      </div>
    )
  }

  return (
    <div className={`${theme} min-h-screen bg-[#FCF9FD] dark:bg-[#17101C] text-[#241329] dark:text-[#FCF9FD] font-jakarta flex flex-col lg:flex-row transition-colors duration-200`}>
      {/* ── DESKTOP SIDEBAR (lg+) ── */}
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 shrink-0 bg-white dark:bg-[#211729] border-r border-[#E8DFEB] dark:border-[#49364F] z-30 select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E8DFEB] dark:border-[#49364F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-gradient flex items-center justify-center text-white shadow-md font-black text-lg">
              OX
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-[#241329] dark:text-white leading-tight">
                Oxonom EDU
              </div>
              <div className="text-[10px] font-bold text-[#8D49A6] dark:text-[#C58ADB] uppercase tracking-wider">
                Öğretmen Portalı
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#716779] dark:text-[#D2C5D8] flex items-center justify-center transition-colors cursor-pointer"
            title="Temayı Değiştir"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Teacher Identity Box */}
        <div className="p-4 mx-3 my-2 rounded-2xl bg-[#F7F0FA] dark:bg-[#2D2035] border border-[#E8DFEB] dark:border-[#49364F] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0D8FA] dark:bg-[#4B075F]/30 text-[#4B075F] dark:text-[#C58ADB] font-extrabold text-sm flex items-center justify-center shrink-0 border border-[#8D49A6]/20">
            {teacherName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-[#241329] dark:text-white truncate">
              {teacherName}
            </div>
            <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] truncate">
              {teacherBranch}
            </div>
          </div>
        </div>

        {/* Ordered Navigation Categories without scrollbar */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-none">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon
            const active = isCurrentPathActive(item.path)
            const isPassive = item.status === 'passive'

            return (
              <Link
                key={item.id}
                href={item.path}
                target={item.openInNewTab ? '_blank' : undefined}
                rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#F0D8FA] dark:bg-[#4B075F]/40 text-[#4B075F] dark:text-[#FCF9FD] shadow-xs'
                    : isPassive
                    ? 'text-[#716779]/60 dark:text-[#B5A5BD]/50 hover:bg-[#F7F0FA] dark:hover:bg-[#2D2035]/40'
                    : 'text-[#514458] dark:text-[#D2C5D8] hover:bg-[#F7F0FA] dark:hover:bg-[#2D2035] hover:text-[#241329] dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    size={17}
                    className={`shrink-0 transition-colors ${
                      active
                        ? 'text-[#4B075F] dark:text-[#D914C8]'
                        : isPassive
                        ? 'text-[#716779]/50 dark:text-[#B5A5BD]/40'
                        : 'text-[#716779] dark:text-[#B5A5BD] group-hover:text-[#4B075F] dark:group-hover:text-white'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      {item.badge}
                      {item.openInNewTab && <ExternalLink size={9} />}
                    </span>
                  )}
                  {isPassive && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#FFF3D9] dark:bg-[#B86B00]/20 text-[#B86B00] dark:text-[#F5C542] font-semibold">
                      Geliştirme
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#E8DFEB] dark:border-[#49364F] space-y-1.5">
          <button
            type="button"
            onClick={async () => {
              if (typeof window !== 'undefined') {
                try {
                  localStorage.removeItem('oxonom_teacher_profile')
                  localStorage.removeItem('oxonom_teacher_profile_completed')
                  localStorage.removeItem('oxonom_current_role')
                } catch (_) {}
              }
              await signOut()
              window.location.href = '/loginv2'
            }}
            className="w-full h-9 px-3 rounded-xl hover:bg-[#FCE8ED] dark:hover:bg-[#C62848]/20 text-[#716779] hover:text-[#C62848] dark:hover:text-[#F17AE6] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Oturumu Kapat</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Desktop Top Header Bar (lg+) — Sleek & Minimal */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-[#E8DFEB] dark:border-[#49364F] bg-white/80 dark:bg-[#211729]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#716779] font-medium">Öğretmen</span>
              <ChevronRight size={13} className="text-[#716779]" />
              <span className="font-extrabold text-[#241329] dark:text-white">
                {currentItem?.label || 'Dersler & Yoklama'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Clock minimal */}
            <HeaderLiveClock theme="oxonom" variant="desktop" />

            <Link
              href="/teacher/desktop-os"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3 rounded-xl bg-[#D914C8]/15 hover:bg-[#D914C8]/25 text-[#D914C8] dark:text-[#F0D8FA] font-extrabold text-xs flex items-center gap-1.5 transition-colors border border-[#D914C8]/30 shadow-xs"
              title="Öğretmen Masaüstü İşletim Sistemini Yeni Sekmede Aç"
            >
              <LayoutGrid size={13} />
              <span>Masaüstü OS</span>
              <ExternalLink size={10} className="opacity-70" />
            </Link>

            <Link
              href="/teacher/schedule"
              className="h-9 px-3 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#241329] dark:text-[#FCF9FD] font-bold text-xs flex items-center gap-1.5 transition-colors border border-[#E8DFEB] dark:border-[#49364F]"
            >
              <Calendar size={13} />
              <span>Program</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#716779] dark:text-[#D2C5D8] flex items-center justify-center transition-colors cursor-pointer border border-[#E8DFEB] dark:border-[#49364F]"
              title="Temayı Değiştir"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* ── MOBILE HEADER (<lg) — Sleek, Minimal & Notch Safe ── */}
        <header
          className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-[#211729]/95 backdrop-blur-md border-b border-[#E8DFEB] dark:border-[#49364F] px-4 pb-2.5 flex items-center justify-between"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.65rem)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center text-white shadow-xs font-black text-xs">
              OX
            </div>
            <div>
              <div className="text-xs font-extrabold text-[#241329] dark:text-white leading-tight">
                Oxonom EDU
              </div>
              <div className="text-[9px] font-bold text-[#8D49A6] dark:text-[#C58ADB]">
                {teacherName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/teacher/desktop-os"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-2 rounded-lg bg-[#D914C8]/15 text-[#D914C8] dark:text-[#F0D8FA] font-bold text-[11px] flex items-center gap-1 border border-[#D914C8]/30"
              title="Masaüstü OS"
            >
              <LayoutGrid size={12} />
              <span>Masaüstü</span>
              <ExternalLink size={9} className="opacity-70" />
            </Link>

            <HeaderLiveClock theme="oxonom" variant="mobile" />

            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg bg-[#F7F0FA] dark:bg-[#2D2035] text-[#716779] dark:text-[#D2C5D8] flex items-center justify-center cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex-1 min-w-0 pb-28 lg:pb-8 flex flex-col overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* ── MOBILE FLOATING BOTTOM DOCK (Visual Matched to Design Mockup) ── */}
      <nav
        className="lg:hidden fixed safe-dock-bottom left-1/2 -translate-x-1/2 w-[95%] max-w-[400px] bg-white/95 dark:bg-[#211729]/95 backdrop-blur-xl border border-[#E8DFEB]/90 dark:border-[#49364F]/90 rounded-full px-2 py-1.5 flex items-center justify-between gap-1 shadow-2xl z-40 select-none"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
        aria-label="Öğretmen alt menü"
      >
        {/* Navigation Items (Ana Sayfa, Sınıflarım, Akıllı Tahta, Yoklama) */}
        {DOCK_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = isCurrentPathActive(item.path)

          if (isActive) {
            return (
              <Link
                key={item.id}
                href={item.path}
                className="h-11 px-3.5 rounded-full bg-[#4B075F] dark:bg-white text-white dark:text-[#241329] flex items-center gap-2 font-bold text-xs shadow-md shrink-0 transition-all"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.activeIconBg}`}>
                  <Icon size={15} strokeWidth={2.4} />
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
              <Icon size={19} strokeWidth={2.2} />
            </Link>
          )
        })}

        {/* 5th Item: "Daha Fazla" (replaces profile, opens drawer) */}
        <button
          type="button"
          onClick={() => setIsMoreSheetOpen(true)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer hover:scale-105 active:scale-95 ${
            isMoreSheetOpen
              ? 'bg-[#F0D8FA] text-[#4B075F] font-bold'
              : 'bg-[#F7F0FA] dark:bg-[#2D2035] text-[#716779] dark:text-[#D2C5D8]'
          }`}
          title="Daha Fazla Modül"
        >
          <LayoutGrid size={19} strokeWidth={2.2} />
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
              className="relative w-full max-w-lg bg-white dark:bg-[#211729] rounded-t-3xl shadow-2xl border border-[#E8DFEB] dark:border-[#49364F] max-h-[85vh] flex flex-col z-10 overflow-hidden pb-[env(safe-area-inset-bottom)]"
            >
              {/* Header */}
              <div className="p-4.5 border-b border-[#E8DFEB] dark:border-[#49364F] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#241329] dark:text-white">
                    Tüm Öğretmen Modülleri
                  </h3>
                  <p className="text-[11px] text-[#716779] dark:text-[#B5A5BD] mt-0.5">
                    Kapsamlı çalışma alanları ve araçlar
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

              {/* Modules Grid */}
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2.5 custom-scrollbar">
                {visibleMenuItems.map((item) => {
                  const Icon = item.icon
                  const active = isCurrentPathActive(item.path)
                  const isPassive = item.status === 'passive'

                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      target={item.openInNewTab ? '_blank' : undefined}
                      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                      onClick={() => setIsMoreSheetOpen(false)}
                      className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                        active
                          ? 'bg-[#F0D8FA] dark:bg-[#4B075F]/30 border-[#8D49A6]/40 text-[#4B075F] dark:text-[#FCF9FD]'
                          : isPassive
                          ? 'bg-[#F7F0FA]/50 dark:bg-[#17101C]/60 border-[#E8DFEB]/50 dark:border-[#49364F]/50 text-[#716779]/60 dark:text-[#B5A5BD]/50'
                          : 'bg-[#FCF9FD] dark:bg-[#17101C] border-[#E8DFEB] dark:border-[#49364F] text-[#514458] dark:text-[#D2C5D8] hover:border-[#8D49A6]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          active
                            ? 'bg-[#4B075F] text-white'
                            : isPassive
                            ? 'bg-[#E8DFEB]/50 dark:bg-[#2D2035] text-[#716779]'
                            : 'bg-[#F0D8FA] dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB]'
                        }`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex items-center gap-1">
                          {item.badge && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                              {item.badge}
                              {item.openInNewTab && <ExternalLink size={8} />}
                            </span>
                          )}
                          {isPassive && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-[#FFF3D9] dark:bg-[#B86B00]/20 text-[#B86B00] dark:text-[#F5C542] font-bold">
                              Pasif
                            </span>
                          )}
                        </div>
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
                        localStorage.removeItem('oxonom_teacher_profile')
                        localStorage.removeItem('oxonom_teacher_profile_completed')
                        localStorage.removeItem('oxonom_current_role')
                      } catch (_) {}
                    }
                    await signOut()
                    window.location.href = '/loginv2'
                  }}
                  className="text-xs font-bold text-[#C62848] dark:text-[#F17AE6] flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Oturumu Kapat</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
