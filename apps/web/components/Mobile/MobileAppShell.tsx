'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import DashV2Client from '@components/DashboardV2/DashV2Client'
import MStudentClient from '@components/Mobile/MStudentClient'
import MBoardsClient from '@components/Mobile/MBoardsClient'
import MHomeworkClient from '@components/Mobile/MHomeworkClient'
import MProfileClient from '@components/Mobile/MProfileClient'
import MobileFloatingDock, { DockTabType } from '@components/Mobile/MobileFloatingDock'

export interface MobileAppShellProps {
  initialTab?: DockTabType
  orgSlug?: string
}

function getPathForTab(tab: DockTabType, orgSlug?: string): string {
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

function getTabFromPath(pathname: string): DockTabType {
  if (pathname.includes('/m-student')) return 'student'
  if (pathname.includes('/m-boards')) return 'boards'
  if (pathname.includes('/m-homework')) return 'assignments'
  if (pathname.includes('/m-profile') || pathname.includes('/account')) return 'profile'
  return 'home'
}

export default function MobileAppShell({ initialTab = 'home', orgSlug }: MobileAppShellProps) {
  const [activeTab, setActiveTab] = useState<DockTabType>(initialTab)
  const [mountedTabs, setMountedTabs] = useState<Set<DockTabType>>(() => new Set([initialTab]))

  // Native app scroll position memory across tabs
  const scrollPositions = useRef<Partial<Record<DockTabType, number>>>({})

  // On client hydration, sync active tab with current URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlTab = getTabFromPath(window.location.pathname)
      if (urlTab !== activeTab) {
        setActiveTab(urlTab)
        setMountedTabs((prev) => new Set([...prev, urlTab]))
      }
    }
  }, [])

  // Instant 0ms Tab Switching
  const switchTab = useCallback(
    (newTab: DockTabType) => {
      if (newTab === activeTab) return

      // 1. Remember scroll position of current screen
      if (typeof window !== 'undefined') {
        scrollPositions.current[activeTab] = window.scrollY
      }

      // 2. Ensure target screen is mounted in memory
      setMountedTabs((prev) => {
        if (prev.has(newTab)) return prev
        const next = new Set(prev)
        next.add(newTab)
        return next
      })

      // 3. Switch active view in 0ms (no reload, no unmount)
      setActiveTab(newTab)

      // 4. Update browser URL silently (bookmark & history friendly)
      if (typeof window !== 'undefined') {
        const targetUrl = getPathForTab(newTab, orgSlug)
        window.history.pushState({ tab: newTab }, '', targetUrl)

        // 5. Restore scroll position of target screen
        requestAnimationFrame(() => {
          const savedY = scrollPositions.current[newTab] || 0
          window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior })
        })
      }
    },
    [activeTab, orgSlug]
  )

  // Background preloading: Mount remaining tabs after initial paint for instant subsequent switches
  useEffect(() => {
    const timer = setTimeout(() => {
      setMountedTabs(new Set(['home', 'student', 'boards', 'assignments', 'profile']))
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Browser Back / Forward Button Handling
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return
      const currentTab = getTabFromPath(window.location.pathname)
      setMountedTabs((prev) => {
        if (prev.has(currentTab)) return prev
        const next = new Set(prev)
        next.add(currentTab)
        return next
      })
      setActiveTab(currentTab)
      requestAnimationFrame(() => {
        const savedY = scrollPositions.current[currentTab] || 0
        window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior })
      })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Event Delegation: Intercept any internal links inside components to switch tabs seamlessly
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest('a')
    if (!target) return
    const href = target.getAttribute('href')
    if (!href) return

    // Ignore external, hash links, or target="_blank"
    if (
      target.getAttribute('target') === '_blank' ||
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('#')
    ) {
      return
    }

    if (href.endsWith('/dashv2') || href === '/dashv2') {
      e.preventDefault()
      switchTab('home')
    } else if (href.endsWith('/m-student') || href === '/m-student') {
      e.preventDefault()
      switchTab('student')
    } else if (href.endsWith('/m-boards') || href === '/m-boards') {
      e.preventDefault()
      switchTab('boards')
    } else if (href.endsWith('/m-homework') || href === '/m-homework') {
      e.preventDefault()
      switchTab('assignments')
    } else if (
      href.endsWith('/m-profile') ||
      href === '/m-profile' ||
      href.endsWith('/account') ||
      href === '/account'
    ) {
      e.preventDefault()
      switchTab('profile')
    }
  }

  return (
    <div
      onClick={handleContainerClick}
      className="relative min-h-[100dvh] w-full bg-[#0A0D15] selection:bg-[#34D399]/30"
    >
      {/* ── 1. ANA SAYFA (DASH V2) ── */}
      {mountedTabs.has('home') && (
        <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
          <DashV2Client hideDock />
        </div>
      )}

      {/* ── 2. ÖĞRENCİLER (M-STUDENT) ── */}
      {mountedTabs.has('student') && (
        <div style={{ display: activeTab === 'student' ? 'block' : 'none' }}>
          <MStudentClient hideDock />
        </div>
      )}

      {/* ── 3. AKILLI TAHTA (M-BOARDS) ── */}
      {mountedTabs.has('boards') && (
        <div style={{ display: activeTab === 'boards' ? 'block' : 'none' }}>
          <MBoardsClient hideDock />
        </div>
      )}

      {/* ── 4. ÖDEVLER (M-HOMEWORK) ── */}
      {mountedTabs.has('assignments') && (
        <div style={{ display: activeTab === 'assignments' ? 'block' : 'none' }}>
          <MHomeworkClient hideDock />
        </div>
      )}

      {/* ── 5. PROFİL (M-PROFILE) ── */}
      {mountedTabs.has('profile') && (
        <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
          <MProfileClient hideDock onBackToHome={() => switchTab('home')} />
        </div>
      )}

      {/* ── SINGLE PERSISTENT FLOATING DOCK (Zero unmount, smooth spring morphing) ── */}
      <MobileFloatingDock activeTab={activeTab} onTabChange={switchTab} orgSlug={orgSlug} />
    </div>
  )
}
