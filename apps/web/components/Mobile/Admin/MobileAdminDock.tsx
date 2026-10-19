'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  Calendar,
  Grid,
} from 'lucide-react'
import toast from 'react-hot-toast'

export type AdminDockTab = 'home' | 'student' | 'teachers' | 'schedule' | 'classes' | 'more'

interface MobileAdminDockProps {
  activeTab?: AdminDockTab
  onOpenMoreSheet?: () => void
  orgSlug?: string
  theme?: 'light' | 'dark'
}

export default function MobileAdminDock({
  activeTab = 'home',
  onOpenMoreSheet,
  orgSlug,
  theme = 'dark',
}: MobileAdminDockProps) {
  const getPath = (tab: 'home' | 'student' | 'teachers' | 'schedule') => {
    const prefix = orgSlug ? `/orgs/${orgSlug}` : ''
    if (tab === 'home') return `${prefix}/principal/dashboard`
    if (tab === 'student') return `${prefix}/principal/students`
    if (tab === 'teachers') return `${prefix}/principal/teachers`
    if (tab === 'schedule') return `${prefix}/principal/schedule`
    return `${prefix}/principal/dashboard`
  }

  const showUnavailableToast = (moduleName: string) => {
    toast(
      `✨ ${moduleName} modülü henüz sisteme eklenmemiştir. Sırayla geliştirilmektedir.`,
      {
        icon: '⏳',
        style: {
          borderRadius: '16px',
          background: theme === 'dark' ? '#121826' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#0F172A',
          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          fontSize: '12px',
          fontWeight: 600,
        },
      }
    )
  }

  return (
    <nav
      className="fixed safe-dock-bottom left-1/2 -translate-x-1/2 w-[94%] max-w-[365px] bg-white/95 dark:bg-[#211729]/95 backdrop-blur-md border border-[#E8DFEB]/90 dark:border-[#49364F]/90 rounded-[30px] p-1.5 flex items-center justify-between shadow-2xl z-40 select-none"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
      aria-label="İdare Paneli Menüsü"
    >
      {/* ── 1. ANA SAYFA (01. Ana Sayfa) ── */}
      <Link
        href={getPath('home')}
        aria-label="Yönetim Dashboard"
        className="relative flex items-center justify-center h-[48px] rounded-full"
      >
        {activeTab === 'home' ? (
          <div className="relative flex items-center gap-1.5 h-full px-3.5 rounded-full z-10">
            <motion.div
              layoutId="admin-dock-active-pill"
              className="absolute inset-0 bg-[#4B075F] dark:bg-white rounded-full shadow-lg"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
            <motion.div
              whileHover={{ rotate: 8, scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              className="w-5 h-5 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center relative z-10"
            >
              <LayoutDashboard size={13} className="text-[#D914C8] dark:text-[#4B075F]" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white dark:text-[#241329] text-[12px] font-extrabold relative z-10 pr-0.5 select-none"
            >
              Ana Sayfa
            </motion.span>
          </div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            className="w-[42px] h-[42px] rounded-full bg-[#F7F0FA] dark:bg-[#2D2035] text-[#716779] dark:text-[#D2C5D8] hover:text-[#4B075F] dark:hover:text-[#F17AE6] flex items-center justify-center transition-colors"
          >
            <LayoutDashboard size={19} strokeWidth={1.9} />
          </motion.div>
        )}
      </Link>

      {/* ── 2. ÖĞRENCİLER (02. Öğrenci Yönetimi - Sistemde Mevcut) ── */}
      <Link
        href={getPath('student')}
        aria-label="Öğrenci Yönetimi"
        className="relative flex items-center justify-center h-[48px] rounded-full"
      >
        {activeTab === 'student' ? (
          <div className="relative flex items-center gap-1.5 h-full px-3.5 rounded-full z-10">
            <motion.div
              layoutId="admin-dock-active-pill"
              className="absolute inset-0 bg-[#4B075F] dark:bg-white rounded-full shadow-lg"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
            <motion.div
              whileHover={{ rotate: 8, scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              className="w-5 h-5 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center relative z-10"
            >
              <GraduationCap size={13} className="text-[#D914C8] dark:text-[#4B075F]" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white dark:text-[#241329] text-[12px] font-extrabold relative z-10 pr-0.5 select-none"
            >
              Öğrenciler
            </motion.span>
          </div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            className="w-[42px] h-[42px] rounded-full bg-[#F7F0FA] dark:bg-[#2D2035] text-[#716779] dark:text-[#D2C5D8] hover:text-[#4B075F] dark:hover:text-[#F17AE6] flex items-center justify-center transition-colors"
          >
            <GraduationCap size={19} strokeWidth={1.9} />
          </motion.div>
        )}
      </Link>

      {/* ── 3. ÖĞRETMENLER (03. Öğretmen ve Personel Yönetimi - Aktif) ── */}
      <Link
        href={getPath('teachers')}
        aria-label="Öğretmen ve Personel Yönetimi"
        className="relative flex items-center justify-center h-[48px] rounded-full"
      >
        {activeTab === 'teachers' ? (
          <div className="relative flex items-center gap-1.5 h-full px-3.5 rounded-full z-10">
            <motion.div
              layoutId="admin-dock-active-pill"
              className="absolute inset-0 bg-[#4B075F] dark:bg-white rounded-full shadow-lg"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
            <motion.div
              whileHover={{ rotate: 8, scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              className="w-5 h-5 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center relative z-10"
            >
              <Briefcase size={13} className="text-[#D914C8] dark:text-[#4B075F]" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white dark:text-[#241329] text-[12px] font-extrabold relative z-10 pr-0.5 select-none"
            >
              Öğretmenler
            </motion.span>
          </div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            className="w-[42px] h-[42px] rounded-full bg-[#F7F0FA] dark:bg-[#2D2035] text-[#716779] dark:text-[#D2C5D8] hover:text-[#4B075F] dark:hover:text-[#F17AE6] flex items-center justify-center transition-colors"
          >
            <Briefcase size={19} strokeWidth={1.9} />
          </motion.div>
        )}
      </Link>

      {/* ── 4. DERS PROGRAMI (04. Ders Programı Yönetimi - Aktif) ── */}
      <Link
        href={getPath('schedule')}
        aria-label="Ders Programı Yönetimi"
        className="relative flex items-center justify-center h-[48px] rounded-full"
      >
        {activeTab === 'schedule' ? (
          <div className="relative flex items-center gap-1.5 h-full px-3.5 rounded-full z-10">
            <motion.div
              layoutId="admin-dock-active-pill"
              className="absolute inset-0 bg-[#4B075F] dark:bg-white rounded-full shadow-lg"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
            <motion.div
              whileHover={{ rotate: 8, scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              className="w-5 h-5 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center relative z-10"
            >
              <Calendar size={13} className="text-[#D914C8] dark:text-[#4B075F]" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white dark:text-[#241329] text-[12px] font-extrabold relative z-10 pr-0.5 select-none"
            >
              Program
            </motion.span>
          </div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            className="w-[42px] h-[42px] rounded-full bg-[#F7F0FA] dark:bg-[#2D2035] text-[#716779] dark:text-[#D2C5D8] hover:text-[#4B075F] dark:hover:text-[#F17AE6] flex items-center justify-center relative transition-colors"
          >
            <Calendar size={19} strokeWidth={1.9} />
          </motion.div>
        )}
      </Link>

      {/* ── 5. DİĞER (05-14 Modülleri Açan Mobil Liste Çekmecesi) ── */}
      <button
        type="button"
        onClick={onOpenMoreSheet}
        aria-label="Diğer İdare Menüleri (05-14)"
        className="relative flex items-center justify-center h-[48px] rounded-full cursor-pointer"
      >
        <motion.div
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.88 }}
          className="w-[42px] h-[42px] rounded-full bg-[#F0D8FA] dark:bg-[#4B075F]/40 text-[#4B075F] dark:text-[#C58ADB] hover:text-[#D914C8] flex items-center justify-center transition-colors shadow-xs"
        >
          <Grid size={19} strokeWidth={2} />
        </motion.div>
      </button>
    </nav>
  )
}
