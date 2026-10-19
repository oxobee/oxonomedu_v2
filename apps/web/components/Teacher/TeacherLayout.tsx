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
      activeIconBg: 'bg-[#162920] dark:bg-emerald-100 text-[#10B981] dark:text-emerald-700',
      inactiveBg: 'bg-[#F3F4F6] dark:bg-gray-800',
      inactiveText: 'text-gray-700 dark:text-gray-300',
    },
    {
      id: 'classes',
      label: 'Sınıflarım',
      path: '/teacher/classes',
      icon: Users,
      activeIconBg: 'bg-[#201A38] dark:bg-purple-100 text-[#818CF8] dark:text-purple-700',
      inactiveBg: 'bg-[#F0EEFF] dark:bg-indigo-950/60',
      inactiveText: 'text-[#6366F1] dark:text-indigo-300',
    },
    {
      id: 'assignments',
      label: 'Ödevler',
      path: '/teacher/assignments',
      icon: BookOpen,
      activeIconBg: 'bg-[#112926] dark:bg-teal-100 text-[#2DD4BF] dark:text-teal-700',
      inactiveBg: 'bg-[#E6F9F5] dark:bg-teal-950/60',
      inactiveText: 'text-[#0D9488] dark:text-teal-300',
    },
    {
      id: 'attendance',
      label: 'Yoklama',
      path: '/teacher/attendance',
      icon: CheckSquare,
      activeIconBg: 'bg-[#1E2342] dark:bg-blue-100 text-[#6366F1] dark:text-blue-700',
      inactiveBg: 'bg-[#EEF2FF] dark:bg-blue-950/60',
      inactiveText: 'text-[#4F46E5] dark:text-blue-300',
    },
  ]

  // Filter out hidden modules (e.g. AI Assistant for now)
  const visibleMenuItems = TEACHER_MENU_CONFIG.filter((item) => !item.hidden)

  return (
    <div className={`${theme} min-h-screen bg-[#F8FAFC] dark:bg-[#0A0D15] text-gray-900 dark:text-white font-jakarta flex flex-col lg:flex-row transition-colors duration-200`}>
      {/* ── DESKTOP SIDEBAR (lg+) ── */}
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 shrink-0 bg-white dark:bg-[#0E1526] border-r border-gray-200/80 dark:border-gray-800/80 z-30 select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-black text-lg">
              OX
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                Oxonom EDU
              </div>
              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Öğretmen Portalı
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

        {/* Teacher Identity Box */}
        <div className="p-4 mx-3 my-2 rounded-2xl bg-gradient-to-br from-[#F1F4F9] to-white dark:from-[#131C31] dark:to-[#0F172A] border border-gray-200/60 dark:border-gray-800/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-extrabold text-sm flex items-center justify-center shrink-0 border border-indigo-500/20">
            {teacherName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {teacherName}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
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
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : isPassive
                    ? 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    size={17}
                    className={`shrink-0 transition-colors ${
                      active
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : isPassive
                        ? 'text-gray-400 dark:text-gray-600'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {isPassive && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold shrink-0">
                    Geliştirme
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800/80 space-y-1.5">
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
            className="w-full h-9 px-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Oturumu Kapat</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Desktop Top Header Bar (lg+) — Sleek & Minimal */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-[#0E1526]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 font-medium">Öğretmen</span>
              <ChevronRight size={13} className="text-gray-400" />
              <span className="font-extrabold text-gray-900 dark:text-white">
                {currentItem?.label || 'Dersler & Yoklama'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Clock minimal */}
            <HeaderLiveClock theme="indigo" variant="desktop" />

            <Link
              href="/teacher/schedule"
              className="h-9 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-colors border border-gray-200/60 dark:border-gray-700/60"
            >
              <Calendar size={13} />
              <span>Program</span>
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

        {/* ── MOBILE HEADER (<lg) — Sleek, Minimal & Notch Safe ── */}
        <header
          className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-[#0E1526]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 px-4 pb-2.5 flex items-center justify-between"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.65rem)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-xs font-black text-xs">
              OX
            </div>
            <div>
              <div className="text-xs font-extrabold text-gray-900 dark:text-white leading-tight">
                Oxonom EDU
              </div>
              <div className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                {teacherName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HeaderLiveClock theme="indigo" variant="mobile" />

            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center cursor-pointer"
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
        className="lg:hidden fixed safe-dock-bottom left-1/2 -translate-x-1/2 w-[95%] max-w-[400px] bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-xl border border-gray-200/90 dark:border-gray-800/90 rounded-full px-2 py-1.5 flex items-center justify-between gap-1 shadow-2xl z-40 select-none"
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
                className="h-11 px-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center gap-2 font-bold text-xs shadow-md shrink-0 transition-all"
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
              ? 'bg-[#FDE68A] text-[#B45309] font-bold'
              : 'bg-[#FFF4E5] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-300'
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
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1526] rounded-t-3xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[85vh] flex flex-col z-10 overflow-hidden pb-[env(safe-area-inset-bottom)]"
            >
              {/* Header */}
              <div className="p-4.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Tüm Öğretmen Modülleri
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Kapsamlı çalışma alanları ve araçlar
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
                      onClick={() => setIsMoreSheetOpen(false)}
                      className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                        active
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300'
                          : isPassive
                          ? 'bg-gray-50/50 dark:bg-[#12192B] border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500'
                          : 'bg-white dark:bg-[#131C31] border-gray-200/60 dark:border-gray-800/60 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          active
                            ? 'bg-indigo-600 text-white'
                            : isPassive
                            ? 'bg-gray-200/50 dark:bg-gray-800 text-gray-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}>
                          <Icon size={16} />
                        </div>
                        {isPassive && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                            Pasif
                          </span>
                        )}
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
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
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
                  className="text-xs font-bold text-rose-500 flex items-center gap-1.5 cursor-pointer"
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
