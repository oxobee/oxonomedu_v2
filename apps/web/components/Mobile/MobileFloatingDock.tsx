'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, Users, Tv, CheckSquare, User } from 'lucide-react'

export type DockTabType = 'home' | 'student' | 'boards' | 'assignments' | 'profile'

interface MobileFloatingDockProps {
  activeTab: DockTabType
  onTabChange?: (tab: DockTabType) => void
  orgSlug?: string
}

export default function MobileFloatingDock({ activeTab, onTabChange, orgSlug }: MobileFloatingDockProps) {
  const getPath = (tab: DockTabType) => {
    const prefix = orgSlug ? `/orgs/${orgSlug}` : ''
    switch (tab) {
      case 'home':
        return `${prefix}/dashv2`
      case 'student':
        return `${prefix}/m-student`
      case 'boards':
        return `${prefix}/m-boards`
      case 'assignments':
        return `${prefix}/m-homework`
      case 'profile':
        return `${prefix}/m-profile`
      default:
        return `${prefix}/dashv2`
    }
  }

  return (
    <nav
      className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-[365px] bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-md border border-gray-200/90 dark:border-gray-800/90 rounded-[30px] p-1.5 flex items-center justify-between shadow-2xl z-40 select-none"
      aria-label="Ana gezinme menüsü"
    >
      {/* ── 1. ANA SAYFA ── */}
      <Link
        href={getPath('home')}
        onClick={(e) => {
          if (onTabChange) {
            e.preventDefault()
            onTabChange('home')
          }
        }}
        aria-label="Ana Sayfa"
        className="relative flex items-center justify-center h-[48px] rounded-full"
      >
        {activeTab === 'home' ? (
          <div className="relative flex items-center gap-1.5 h-full px-3.5 rounded-full z-10">
            {/* Morphing active pill background */}
            <motion.div
              layoutId="dock-active-pill"
              className="absolute inset-0 bg-[#0A0D15] dark:bg-white rounded-full shadow-lg"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              style={{
                backgroundImage:
                  'linear-gradient(45deg,rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(-45deg,rgba(255,255,255,.06) 1px,transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            />
            <motion.div
              whileHover={{ rotate: 8, scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              className="w-5 h-5 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center relative z-10"
            >
              <Home size={13} className="text-[#34D399] dark:text-[#0A0D15]" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white dark:text-[#0A0D15] text-[12px] font-extrabold relative z-10 pr-0.5 select-none"
            >
              Ana Sayfa
            </motion.span>
          </div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            className="w-[42px] h-[42px] rounded-full bg-[#E3F3EF] dark:bg-teal-950/60 text-[#0F766E] dark:text-teal-400 flex items-center justify-center transition-colors"
          >
            <Home size={19} strokeWidth={1.9} />
          </motion.div>
        )}
      </Link>

      {/* ── 2. ÖĞRENCİLER (M-STUDENT) ── */}
      <Link
        href={getPath('student')}
        onClick={(e) => {
          if (onTabChange) {
            e.preventDefault()
            onTabChange('student')
          }
        }}
        aria-label="Öğrenciler"
        className="relative flex items-center justify-center h-[48px] rounded-full"
      >
        {activeTab === 'student' ? (
          <div className="relative flex items-center gap-1.5 h-full px-3.5 rounded-full z-10">
            <motion.div
              layoutId="dock-active-pill"
              className="absolute inset-0 bg-[#0A0D15] dark:bg-white rounded-full shadow-lg"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              style={{
                backgroundImage:
                  'linear-gradient(45deg,rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(-45deg,rgba(255,255,255,.06) 1px,transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            />
            <motion.div
              whileHover={{ rotate: 8, scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              className="w-5 h-5 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center relative z-10"
            >
              <Users size={13} className="text-[#34D399] dark:text-emerald-600" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white dark:text-[#0A0D15] text-[12px] font-extrabold relative z-10 pr-0.5 select-none"
            >
              Öğrenciler
            </motion.span>
          </div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            className="w-[42px] h-[42px] rounded-full bg-[#ECEBFD] dark:bg-indigo-950/60 text-[#4338CA] dark:text-indigo-300 flex items-center justify-center transition-colors"
          >
            <Users size={19} strokeWidth={1.9} />
          </motion.div>
        )}
      </Link>

      {/* ── 3. AKILLI TAHTA (M-BOARDS) ── */}
      <Link
        href={getPath('boards')}
        onClick={(e) => {
          if (onTabChange) {
            e.preventDefault()
            onTabChange('boards')
          }
        }}
        aria-label="Akıllı Tahtalar & Panolar"
        className="relative flex items-center justify-center h-[48px] rounded-full"
      >
        {activeTab === 'boards' ? (
          <div className="relative flex items-center gap-1.5 h-full px-3.5 rounded-full z-10">
            <motion.div
              layoutId="dock-active-pill"
              className="absolute inset-0 bg-[#0A0D15] dark:bg-white rounded-full shadow-lg"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              style={{
                backgroundImage:
                  'linear-gradient(45deg,rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(-45deg,rgba(255,255,255,.06) 1px,transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            />
            <motion.div
              whileHover={{ rotate: 8, scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              className="w-5 h-5 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center relative z-10"
            >
              <Tv size={13} className="text-[#34D399] dark:text-emerald-600" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white dark:text-[#0A0D15] text-[12px] font-extrabold relative z-10 pr-0.5 select-none"
            >
              Tahtalar
            </motion.span>
          </div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            className="w-[42px] h-[42px] rounded-full bg-[#E6F9F5] dark:bg-teal-950/60 text-[#0D9488] dark:text-teal-300 flex items-center justify-center transition-colors shadow-xs"
          >
            <Tv size={19} strokeWidth={2} className="text-[#0D9488] dark:text-teal-300" />
          </motion.div>
        )}
      </Link>

      {/* ── 4. ÖDEVLER (M-HOMEWORK) ── */}
      <Link
        href={getPath('assignments')}
        onClick={(e) => {
          if (onTabChange) {
            e.preventDefault()
            onTabChange('assignments')
          }
        }}
        aria-label="Ödevler"
        className="relative flex items-center justify-center h-[48px] rounded-full"
      >
        {activeTab === 'assignments' ? (
          <div className="relative flex items-center gap-1.5 h-full px-3.5 rounded-full z-10">
            <motion.div
              layoutId="dock-active-pill"
              className="absolute inset-0 bg-[#0A0D15] dark:bg-white rounded-full shadow-lg"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              style={{
                backgroundImage:
                  'linear-gradient(45deg,rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(-45deg,rgba(255,255,255,.06) 1px,transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            />
            <motion.div
              whileHover={{ rotate: 8, scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              className="w-5 h-5 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center relative z-10"
            >
              <CheckSquare size={13} className="text-[#34D399] dark:text-emerald-600" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white dark:text-[#0A0D15] text-[12px] font-extrabold relative z-10 pr-0.5 select-none"
            >
              Ödevler
            </motion.span>
          </div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            className="w-[42px] h-[42px] rounded-full bg-[#EEF0FF] dark:bg-indigo-950/60 text-[#6366F1] dark:text-indigo-300 flex items-center justify-center relative transition-colors shadow-xs"
          >
            <CheckSquare size={19} strokeWidth={1.9} />
          </motion.div>
        )}
      </Link>

      {/* ── 5. PROFİL ── */}
      <Link
        href={getPath('profile')}
        onClick={(e) => {
          if (onTabChange) {
            e.preventDefault()
            onTabChange('profile')
          }
        }}
        aria-label="Öğretmen Profili"
        className="relative flex items-center justify-center h-[48px] rounded-full"
      >
        {activeTab === 'profile' ? (
          <div className="relative flex items-center gap-1.5 h-full px-3.5 rounded-full z-10">
            <motion.div
              layoutId="dock-active-pill"
              className="absolute inset-0 bg-[#0A0D15] dark:bg-white rounded-full shadow-lg"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
            <User size={15} className="text-[#34D399] dark:text-emerald-600 relative z-10" />
            <motion.span
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white dark:text-[#0A0D15] text-[12px] font-extrabold relative z-10 pr-0.5"
            >
              Profil
            </motion.span>
          </div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            className="w-[42px] h-[42px] rounded-full bg-[#FDF0DC] dark:bg-orange-950/60 text-[#B45309] dark:text-orange-300 flex items-center justify-center transition-colors"
          >
            <User size={19} strokeWidth={1.9} />
          </motion.div>
        )}
      </Link>
    </nav>
  )
}
