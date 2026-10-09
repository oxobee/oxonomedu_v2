'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sun, Moon, Bell } from 'lucide-react'
import MobileNotificationSheet from './MobileNotificationSheet'

interface MobileHeaderProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  unreadCount?: number
  className?: string
}

/**
 * Unified Mobile Header for Oxonom EDU
 * - Pinned / sticky top with seamless background overscroll
 * - Larger high-contrast logo without altering header box height
 * - Native app feel with backdrop blur & crisp borders
 * - Notification bell with categorized mobile drawer
 */
export default function MobileHeader({
  theme,
  onToggleTheme,
  unreadCount = 3,
  className = '',
}: MobileHeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  return (
    <>
      <header
        className={`w-full sticky top-0 z-40 transition-colors select-none ${
          theme === 'dark'
            ? 'bg-[#0A0D15]/95 text-white border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
            : 'bg-white/95 text-gray-900 border-b border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
        } backdrop-blur-md safe-header-pt pb-2.5 px-4 sm:px-5 flex items-center justify-between relative before:absolute before:-top-96 before:inset-x-0 before:h-96 ${
          theme === 'dark' ? 'before:bg-[#0A0D15]' : 'before:bg-white'
        } before:pointer-events-none ${className}`}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.65rem)',
          ...(theme === 'dark'
            ? {
                backgroundImage:
                  'linear-gradient(45deg,rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(-45deg,rgba(255,255,255,.04) 1px,transparent 1px)',
                backgroundSize: '24px 24px',
              }
            : {
                backgroundImage:
                  'linear-gradient(45deg,rgba(0,0,0,.02) 1px,transparent 1px),linear-gradient(-45deg,rgba(0,0,0,.02) 1px,transparent 1px)',
                backgroundSize: '24px 24px',
              }),
        }}
      >
        {/* Brand Logo (Enlarged with crisp object-contain, fits perfectly within compact header height) */}
        <Link
          href="/dashv2"
          aria-label="Oxonom EDU Ana Sayfa"
          className="flex items-center active:scale-95 transition-transform py-0.5"
        >
          <img
            src={theme === 'dark' ? '/oxonom-edu-logo-transparent.png' : '/oxonom_edu_logo_black.png'}
            alt="OXONOM edu."
            className="h-11 sm:h-12 max-h-[46px] w-auto object-contain drop-shadow-xs"
          />
        </Link>

        {/* Right Actions: Theme Toggle + Notification Bell (Native App Feel) */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={onToggleTheme}
            className={`w-[40px] h-[40px] rounded-[13px] flex items-center justify-center transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-white/10 hover:bg-white/15 text-gray-200 border border-white/10'
                : 'bg-gray-100 hover:bg-gray-200/80 text-gray-700 border border-gray-200/80 shadow-2xs'
            }`}
            title={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
            aria-label="Tema Değiştir"
          >
            {theme === 'dark' ? (
              <Sun size={17} className="text-amber-300" />
            ) : (
              <Moon size={17} className="text-gray-700" />
            )}
          </motion.button>

          {/* Notification Button (Replacing QR Button as requested) */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => setIsNotificationOpen(true)}
            aria-label="Bildirimler"
            className={`w-[42px] h-[42px] rounded-[13px] relative flex items-center justify-center cursor-pointer transition-all shadow-xs ${
              theme === 'dark'
                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200/80'
            }`}
          >
            <Bell size={19} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm border-2 border-white dark:border-[#0A0D15]">
                {unreadCount}
              </span>
            )}
          </motion.button>
        </div>
      </header>

      {/* Categorized Notification Drawer Sheet */}
      <MobileNotificationSheet
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        theme={theme}
      />
    </>
  )
}
