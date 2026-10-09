'use client'

import { useState, useEffect, useCallback } from 'react'

export type MobileTheme = 'light' | 'dark'

export function useMobileTheme(initialOverride?: MobileTheme) {
  const [theme, setTheme] = useState<MobileTheme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_dash_theme') as MobileTheme | null
        if (saved === 'light' || saved === 'dark') return saved
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
      } catch (_) {}
    }
    return initialOverride || 'dark'
  })

  // Sync on mount & listen to cross-component and cross-tab updates
  useEffect(() => {
    if (typeof window === 'undefined') return

    const getResolvedTheme = (): MobileTheme => {
      try {
        const saved = localStorage.getItem('oxonom_dash_theme') as MobileTheme | null
        if (saved === 'light' || saved === 'dark') return saved
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      } catch (_) {
        return 'dark'
      }
    }

    const current = getResolvedTheme()
    setTheme(current)
    document.documentElement.classList.toggle('dark', current === 'dark')

    const handleCustomThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<MobileTheme>
      const nextTheme = customEvent.detail || getResolvedTheme()
      setTheme(nextTheme)
      document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'oxonom_dash_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        const nextTheme = e.newValue as MobileTheme
        setTheme(nextTheme)
        document.documentElement.classList.toggle('dark', nextTheme === 'dark')
      }
    }

    window.addEventListener('oxonom_theme_change', handleCustomThemeChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('oxonom_theme_change', handleCustomThemeChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: MobileTheme = prev === 'light' ? 'dark' : 'light'
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('oxonom_dash_theme', next)
          document.documentElement.classList.toggle('dark', next === 'dark')
          window.dispatchEvent(new CustomEvent('oxonom_theme_change', { detail: next }))
        } catch (_) {}
      }
      return next
    })
  }, [])

  return { theme, toggleTheme, setTheme }
}
