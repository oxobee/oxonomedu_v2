'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, Users, Tv, CheckSquare, User, QrCode } from 'lucide-react'
import ConnectBoardModal from '@components/DashboardV2/ConnectBoardModal'

export type DockTabType = 'home' | 'student' | 'boards' | 'assignments' | 'profile'

interface MobileFloatingDockProps {
  activeTab: DockTabType
  onTabChange?: (tab: DockTabType) => void
  orgSlug?: string
  onOpenConnectModal?: () => void
}

export default function MobileFloatingDock({
  activeTab,
  onTabChange,
  orgSlug,
  onOpenConnectModal,
}: MobileFloatingDockProps) {
  const [isInternalConnectModalOpen, setIsInternalConnectModalOpen] = useState(false)

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

  // Display 'student' tab if user is currently on students page, otherwise default to 'boards' (Akıllı Tahtalar)
  const secondTab: 'student' | 'boards' = activeTab === 'student' ? 'student' : 'boards'

  const handleOpenConnect = () => {
    if (onOpenConnectModal) {
      onOpenConnectModal()
    } else {
      setIsInternalConnectModalOpen(true)
    }
  }

  return (
    <>
      <nav
        className="fixed safe-dock-bottom left-1/2 -translate-x-1/2 w-[95%] max-w-[375px] bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-md border border-gray-200/90 dark:border-gray-800/90 rounded-[32px] p-1.5 flex items-center justify-between shadow-2xl z-40 select-none"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
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
          className="relative flex items-center justify-center h-[46px] rounded-full"
        >
          {activeTab === 'home' ? (
            <div className="relative flex items-center gap-1.5 h-full px-3 rounded-full z-10">
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
                className="text-white dark:text-[#0A0D15] text-[11.5px] font-extrabold relative z-10 pr-0.5 select-none"
              >
                Ana Sayfa
              </motion.span>
            </div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              className="w-[40px] h-[40px] rounded-full bg-[#E3F3EF] dark:bg-teal-950/60 text-[#0F766E] dark:text-teal-400 flex items-center justify-center transition-colors"
            >
              <Home size={18} strokeWidth={1.9} />
            </motion.div>
          )}
        </Link>

        {/* ── 2. TAHTALAR VEYA ÖĞRENCİLER ── */}
        <Link
          href={getPath(secondTab)}
          onClick={(e) => {
            if (onTabChange) {
              e.preventDefault()
              onTabChange(secondTab)
            }
          }}
          aria-label={secondTab === 'student' ? 'Öğrenciler' : 'Akıllı Tahtalar'}
          className="relative flex items-center justify-center h-[46px] rounded-full"
        >
          {activeTab === secondTab ? (
            <div className="relative flex items-center gap-1.5 h-full px-3 rounded-full z-10">
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
                {secondTab === 'student' ? (
                  <Users size={13} className="text-[#34D399] dark:text-emerald-600" />
                ) : (
                  <Tv size={13} className="text-[#34D399] dark:text-emerald-600" />
                )}
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -3 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-white dark:text-[#0A0D15] text-[11.5px] font-extrabold relative z-10 pr-0.5 select-none"
              >
                {secondTab === 'student' ? 'Öğrenciler' : 'Tahtalar'}
              </motion.span>
            </div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              className={`w-[40px] h-[40px] rounded-full flex items-center justify-center transition-colors shadow-2xs ${
                secondTab === 'student'
                  ? 'bg-[#ECEBFD] dark:bg-indigo-950/60 text-[#4338CA] dark:text-indigo-300'
                  : 'bg-[#E6F9F5] dark:bg-teal-950/60 text-[#0D9488] dark:text-teal-300'
              }`}
            >
              {secondTab === 'student' ? (
                <Users size={18} strokeWidth={1.9} />
              ) : (
                <Tv size={18} strokeWidth={1.9} />
              )}
            </motion.div>
          )}
        </Link>

        {/* ── 3. ORTA: BÜYÜK QR İKONU (Akıllı Tahtaya Bağlan FAB) ── */}
        <div className="relative flex items-center justify-center -my-3 px-0.5">
          <motion.button
            type="button"
            onClick={handleOpenConnect}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Akıllı Tahtaya Bağlan"
            title="Akıllı Tahtaya Bağlan (QR Kod / Kod Gir)"
            className="relative w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-[#059669] via-[#10B981] to-[#34D399] text-[#0A0D15] flex items-center justify-center shadow-[0_8px_22px_rgba(16,185,129,0.42)] border-2 border-white dark:border-[#0E131F] cursor-pointer z-30 group"
          >
            {/* Pulsating ambient ring */}
            <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-pulse pointer-events-none" />
            <QrCode
              size={24}
              strokeWidth={2.4}
              className="relative z-10 text-white transition-transform group-hover:scale-110 drop-shadow-xs"
            />
          </motion.button>
        </div>

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
          className="relative flex items-center justify-center h-[46px] rounded-full"
        >
          {activeTab === 'assignments' ? (
            <div className="relative flex items-center gap-1.5 h-full px-3 rounded-full z-10">
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
                className="text-white dark:text-[#0A0D15] text-[11.5px] font-extrabold relative z-10 pr-0.5 select-none"
              >
                Ödevler
              </motion.span>
            </div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              className="w-[40px] h-[40px] rounded-full bg-[#EEF0FF] dark:bg-indigo-950/60 text-[#6366F1] dark:text-indigo-300 flex items-center justify-center relative transition-colors shadow-2xs"
            >
              <CheckSquare size={18} strokeWidth={1.9} />
            </motion.div>
          )}
        </Link>

        {/* ── 5. PROFİL (M-PROFILE) ── */}
        <Link
          href={getPath('profile')}
          onClick={(e) => {
            if (onTabChange) {
              e.preventDefault()
              onTabChange('profile')
            }
          }}
          aria-label="Öğretmen Profili"
          className="relative flex items-center justify-center h-[46px] rounded-full"
        >
          {activeTab === 'profile' ? (
            <div className="relative flex items-center gap-1.5 h-full px-3 rounded-full z-10">
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
                <User size={13} className="text-[#34D399] dark:text-[#0A0D15]" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -3 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-white dark:text-[#0A0D15] text-[11.5px] font-extrabold relative z-10 pr-0.5 select-none"
              >
                Profil
              </motion.span>
            </div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              className="w-[40px] h-[40px] rounded-full bg-[#FDF0DC] dark:bg-orange-950/60 text-[#B45309] dark:text-orange-300 flex items-center justify-center transition-colors shadow-2xs"
            >
              <User size={18} strokeWidth={1.9} />
            </motion.div>
          )}
        </Link>
      </nav>

      {/* Akıllı Tahtaya Bağlan Modalı (Dock İçinden Doğrudan Açılabilir) */}
      <ConnectBoardModal
        isOpen={isInternalConnectModalOpen}
        onClose={() => setIsInternalConnectModalOpen(false)}
      />
    </>
  )
}
