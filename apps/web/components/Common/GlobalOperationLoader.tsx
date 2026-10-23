'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useSearchParams } from 'next/navigation'

interface LoadingEventDetail {
  title?: string
  subtitle?: string
  timeoutMs?: number
}

/**
 * Global helper to trigger the transition/operation loader from anywhere in client code.
 */
export function startGlobalLoader(
  title = 'İşleminiz gerçekleşiyor...',
  subtitle = 'Lütfen bekleyiniz, sayfa hazırlanıyor...'
) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<LoadingEventDetail>('oxonom_start_loading', {
        detail: { title, subtitle },
      })
    )
  }
}

/**
 * Global helper to dismiss the transition/operation loader.
 */
export function stopGlobalLoader() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('oxonom_stop_loading'))
  }
}

export default function GlobalOperationLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isVisible, setIsVisible] = useState(false)
  const [title, setTitle] = useState('İşleminiz gerçekleşiyor...')
  const [subtitle, setSubtitle] = useState('Lütfen bekleyiniz, sayfa hazırlanıyor...')
  const [showCloseButton, setShowCloseButton] = useState(false)

  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null)
  const closeBtnTimerRef = useRef<NodeJS.Timeout | null>(null)
  const navTriggerRef = useRef<boolean>(false)
  const lastPathnameRef = useRef<string>(pathname)
  const lastSearchRef = useRef<string>(searchParams?.toString() || '')

  const hideLoader = useCallback(() => {
    setIsVisible(false)
    setShowCloseButton(false)
    navTriggerRef.current = false
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current)
      safetyTimerRef.current = null
    }
    if (closeBtnTimerRef.current) {
      clearTimeout(closeBtnTimerRef.current)
      closeBtnTimerRef.current = null
    }
  }, [])

  const showLoader = useCallback((t?: string, s?: string, maxWait = 7000) => {
    setTitle(t || 'İşleminiz gerçekleşiyor...')
    setSubtitle(s || 'Lütfen bekleyiniz, sayfa hazırlanıyor...')
    setIsVisible(true)
    setShowCloseButton(false)

    // Clear any previous timers
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
    if (closeBtnTimerRef.current) clearTimeout(closeBtnTimerRef.current)

    // Show a graceful close button after 3.5 seconds in case backend takes time
    closeBtnTimerRef.current = setTimeout(() => {
      setShowCloseButton(true)
    }, 3500)

    // Auto dismiss after safety limit (e.g. 7s) to guarantee never trapping user
    safetyTimerRef.current = setTimeout(() => {
      hideLoader()
    }, maxWait)
  }, [hideLoader])

  // Handle route changes
  useEffect(() => {
    const currentSearch = searchParams?.toString() || ''
    if (
      lastPathnameRef.current !== pathname ||
      lastSearchRef.current !== currentSearch
    ) {
      lastPathnameRef.current = pathname
      lastSearchRef.current = currentSearch

      // If loader was shown due to internal link navigation, hide it quickly
      if (navTriggerRef.current) {
        const timer = setTimeout(() => {
          hideLoader()
        }, 150)
        return () => clearTimeout(timer)
      }
    }
  }, [pathname, searchParams, hideLoader])

  // Listen for custom events
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStart = (e: Event) => {
      const customEvent = e as CustomEvent<LoadingEventDetail>
      const detail = customEvent.detail || {}
      showLoader(detail.title, detail.subtitle, detail.timeoutMs || 7000)
    }

    const handleStop = () => {
      hideLoader()
    }

    // Intercept clicks on links for smooth menu/route transitions
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor
      const target = (e.target as HTMLElement)?.closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Ignore external or non-nav links
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        target.target === '_blank' ||
        target.getAttribute('download') !== null ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        e.defaultPrevented
      ) {
        return
      }

      // Check if it's an internal link
      const isInternal = href.startsWith('/') || href.startsWith(window.location.origin)
      if (!isInternal) return

      try {
        const parsed = new URL(href, window.location.origin)
        const isSamePage =
          parsed.pathname === window.location.pathname &&
          parsed.search === window.location.search

        if (isSamePage) return

        // Intercept navigation
        navTriggerRef.current = true
        showLoader(
          'İşleminiz gerçekleşiyor...',
          'Menü hazırlanıyor, lütfen bekleyiniz...',
          6000
        )
      } catch (_) {}
    }

    window.addEventListener('oxonom_start_loading', handleStart)
    window.addEventListener('oxonom_stop_loading', handleStop)
    document.addEventListener('click', handleDocumentClick, true)

    return () => {
      window.removeEventListener('oxonom_start_loading', handleStart)
      window.removeEventListener('oxonom_stop_loading', handleStop)
      document.removeEventListener('click', handleDocumentClick, true)
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
      if (closeBtnTimerRef.current) clearTimeout(closeBtnTimerRef.current)
    }
  }, [showLoader, hideLoader])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="oxonom-global-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#08050D]/85 backdrop-blur-md select-none"
        >
          {/* Ambient Glow Aura */}
          <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-[#D914C8]/25 to-[#4B075F]/35 blur-3xl pointer-events-none -translate-y-4" />

          {/* Dialog Container */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative z-10 w-[92%] max-w-sm rounded-[28px] bg-[#120B1E]/95 border border-[#D914C8]/30 shadow-[0_25px_60px_rgba(217,20,200,0.25)] p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden"
          >
            {/* Top Glowing Accent Line */}
            <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#D914C8] to-transparent opacity-80" />

            {/* Emblem with animated pulsing ring */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-4">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#D914C8]/40 to-[#7E0C87]/40 blur-xl"
              />

              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/15 p-2.5 flex items-center justify-center shadow-lg backdrop-blur-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/oxonom-icon-colored.png"
                  alt="Oxonom"
                  className="w-full h-full object-contain drop-shadow-[0_2px_10px_rgba(217,20,200,0.5)]"
                />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center justify-center gap-1.5">
              <span className="bg-gradient-to-r from-white via-white/95 to-[#F17AE6] bg-clip-text text-transparent">
                {title}
              </span>
            </h3>

            {/* Subtitle */}
            <p className="text-xs sm:text-[13px] text-purple-200/70 font-medium mt-1.5 line-clamp-2 max-w-[260px]">
              {subtitle}
            </p>

            {/* Progress shimmer track */}
            <div className="w-44 sm:w-52 h-1.5 rounded-full bg-white/10 overflow-hidden relative mt-5">
              <motion.div
                animate={{ x: ['-100%', '150%'] }}
                transition={{
                  duration: 1.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-28 h-full bg-gradient-to-r from-transparent via-[#D914C8] to-transparent rounded-full"
              />
            </div>

            {/* Dismiss button fallback after 3.5s */}
            {showCloseButton && (
              <motion.button
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                type="button"
                onClick={hideLoader}
                className="mt-4 text-[11px] font-bold text-white/50 hover:text-white/80 transition-colors underline cursor-pointer"
              >
                Kapat / İptal Et
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
