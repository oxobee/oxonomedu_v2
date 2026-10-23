'use client'

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useSearchParams } from 'next/navigation'

interface LoadingEventDetail {
  timeoutMs?: number
  [key: string]: any
}

/**
 * Global helper to trigger the transition/operation loader from anywhere in client code.
 */
export function startGlobalLoader(_title?: string, _subtitle?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<LoadingEventDetail>('oxonom_start_loading'))
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

function GlobalOperationLoaderInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isVisible, setIsVisible] = useState(false)
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null)
  const navTriggerRef = useRef<boolean>(false)
  const lastPathnameRef = useRef<string>(pathname)
  const lastSearchRef = useRef<string>(searchParams?.toString() || '')

  const hideLoader = useCallback(() => {
    setIsVisible(false)
    navTriggerRef.current = false
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current)
      safetyTimerRef.current = null
    }
  }, [])

  const showLoader = useCallback((maxWait = 6000) => {
    setIsVisible(true)

    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)

    // Safety timeout to avoid getting permanently stuck
    safetyTimerRef.current = setTimeout(() => {
      hideLoader()
    }, maxWait)
  }, [hideLoader])

  // Handle route / search changes
  useEffect(() => {
    const currentSearch = searchParams?.toString() || ''
    if (
      lastPathnameRef.current !== pathname ||
      lastSearchRef.current !== currentSearch
    ) {
      lastPathnameRef.current = pathname
      lastSearchRef.current = currentSearch

      if (navTriggerRef.current) {
        const timer = setTimeout(() => {
          hideLoader()
        }, 120)
        return () => clearTimeout(timer)
      }
    }
  }, [pathname, searchParams, hideLoader])

  // Listen for custom events and internal link navigations
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStart = (e: Event) => {
      const customEvent = e as CustomEvent<LoadingEventDetail>
      const detail = customEvent.detail || {}
      showLoader(detail.timeoutMs || 6000)
    }

    const handleStop = () => {
      hideLoader()
    }

    // Intercept clicks on internal links for smooth transitions
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Ignore anchor jumps, tel, mail, downloads, external, or modifier keys
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

      const isInternal = href.startsWith('/') || href.startsWith(window.location.origin)
      if (!isInternal) return

      try {
        const parsed = new URL(href, window.location.origin)
        const isSamePage =
          parsed.pathname === window.location.pathname &&
          parsed.search === window.location.search

        if (isSamePage) return

        navTriggerRef.current = true
        showLoader(5000)
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
    }
  }, [showLoader, hideLoader])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="oxonom-minimal-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#08050D]/60 backdrop-blur-sm pointer-events-auto select-none"
        >
          {/* Minimalist Professional Loader: No background box, no text */}
          <div className="relative flex items-center justify-center">
            {/* Subtle ambient backlight aura */}
            <div className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-[#D914C8]/20 to-[#7E0C87]/20 blur-2xl pointer-events-none" />

            {/* High-precision spinning orbital ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/10 border-t-[#D914C8] border-r-[#D914C8]/40"
            />

            {/* Clean Centered Oxonom Emblem */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{
                  scale: [0.94, 1.02, 0.94],
                  opacity: [0.85, 1, 0.85],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/oxonom-icon-colored.png"
                  alt="Oxonom"
                  className="w-full h-full object-contain drop-shadow-[0_2px_10px_rgba(217,20,200,0.45)]"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function GlobalOperationLoader() {
  return (
    <Suspense fallback={null}>
      <GlobalOperationLoaderInner />
    </Suspense>
  )
}
