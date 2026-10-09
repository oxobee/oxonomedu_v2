'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

/**
 * Apple-style PWA Launch / Splash Screen
 * Features:
 * - OLED deep dark canvas (#0A0D15)
 * - Ultra-crisp centered pure white vector icon
 * - Apple spring scale-in with soft atmospheric radial aura
 * - Silky smooth fade-out and unmount
 * - Triggered on app launch (once per session to keep transitions snappy)
 */
export default function AppleSplashScreen() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Show once per session so in-app page browsing stays instant
    const hasSeenSplash = sessionStorage.getItem('oxonom_pwa_splash_seen')
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    // Always show in standalone or on first visit of the session
    if (!hasSeenSplash || isStandalone) {
      setIsVisible(true)
      sessionStorage.setItem('oxonom_pwa_splash_seen', 'true')

      // Smooth Apple-like timing: 1.35s display, then fade out
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 1350)

      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="apple-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[999999] bg-[#0A0D15] flex flex-col items-center justify-center select-none pointer-events-none overflow-hidden"
          style={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          {/* Subtle Apple-style atmospheric aura */}
          <div className="absolute w-[320px] h-[320px] rounded-full bg-gradient-to-tr from-indigo-500/10 via-teal-500/15 to-transparent blur-3xl pointer-events-none" />

          {/* Centered White Icon Container */}
          <div className="relative flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.76, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1], // Apple fluid spring curve
              }}
              className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center"
            >
              {/* Soft pulse ring */}
              <motion.div
                initial={{ opacity: 0.2, scale: 0.9 }}
                animate={{ opacity: [0.2, 0.45, 0.2], scale: [0.9, 1.08, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full border border-white/20 blur-[1px]"
              />

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/pwa-icon.svg"
                alt="Oxonom EDU"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-[0_8px_30px_rgba(255,255,255,0.25)]"
              />
            </motion.div>

            {/* Apple-style minimalist typography */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex flex-col items-center text-center"
            >
              <span className="font-extrabold text-base tracking-[0.2em] text-white/95 uppercase">
                OXONOM <span className="text-teal-400">EDU</span>
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 mt-1 uppercase font-medium">
                Akıllı Okul Portalı
              </span>
            </motion.div>
          </div>

          {/* Bottom Minimal iOS home bar clearance */}
          <div className="absolute bottom-6 w-32 h-1 rounded-full bg-white/20" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
