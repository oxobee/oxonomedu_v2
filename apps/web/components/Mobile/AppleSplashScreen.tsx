// apps/web/components/Mobile/AppleSplashScreen.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Modern Oxonom EDU Splash & Loading Screen
 * Features:
 * - Deep OLED canvas (#08050D) with vibrant Oxonom Magenta/Purple ambient glow
 * - Official modern Oxonom Logo & Icon
 * - Smooth Apple-style spring scale-in & silky fade-out
 * - Sleek indeterminate gradient progress beam & live status badge
 */
export default function AppleSplashScreen() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Show once per session so subsequent page browsing stays instant
      const hasSeenSplash = sessionStorage.getItem('oxonom_splash_seen_v2')
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true

      if (!hasSeenSplash || isStandalone) {
        setIsVisible(true)
        sessionStorage.setItem('oxonom_splash_seen_v2', 'true')

        // Display for 1.35 seconds then smoothly fade out
        const timer = setTimeout(() => {
          setIsVisible(false)
        }, 1350)

        return () => clearTimeout(timer)
      }
    }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="oxonom-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[999999] bg-[#08050D] flex flex-col items-center justify-center select-none pointer-events-none overflow-hidden"
          style={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          {/* Ambient Oxonom Magenta & Purple Atmospheric Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.25, 0.4, 0.25],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-[#D914C8]/30 via-[#8D49A6]/25 to-[#4B075F]/35 blur-[120px]"
            />
          </div>

          {/* Centered Modern Brand Logo & Loader Container */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4">
            {/* Animated Brand Emblem with Glowing Ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1], // Apple spring curve
              }}
              className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center mb-6"
            >
              {/* Outer Pulsing Glow Ring */}
              <motion.div
                initial={{ opacity: 0.3, scale: 0.95 }}
                animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.95, 1.12, 0.95] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#D914C8]/30 to-[#4B075F]/30 blur-lg"
              />

              {/* Glass Emblem Badge */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/15 p-4 flex items-center justify-center shadow-2xl shadow-[#D914C8]/25">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/oxonom-icon-colored.png"
                  alt="Oxonom EDU"
                  className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(217,20,200,0.5)]"
                />
              </div>
            </motion.div>

            {/* Official Logo Brand Typography */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center space-y-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/oxonom-logo-dark.png"
                alt="Oxonom EDU"
                className="h-9 sm:h-11 w-auto object-contain drop-shadow-[0_8px_20px_rgba(217,20,200,0.3)]"
              />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D914C8] animate-ping" />
                <span className="text-[11px] font-bold tracking-wider text-[#F0D8FA] uppercase">
                  Geleceğin Akıllı Okul Ekosistemi
                </span>
              </div>

              {/* Apple / Tesla Style Modern Indeterminate Progress Bar */}
              <div className="w-44 h-1 rounded-full bg-white/10 overflow-hidden mt-2 relative">
                <motion.div
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-full h-full bg-gradient-to-r from-transparent via-[#D914C8] to-transparent shadow-[0_0_12px_#D914C8]"
                />
              </div>
            </motion.div>
          </div>

          {/* Bottom iOS home bar clearance */}
          <div className="absolute bottom-6 w-32 h-1 rounded-full bg-white/15" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
