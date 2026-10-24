'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  ExternalLink,
  School,
  Database,
  Sparkles,
} from 'lucide-react'
import SuperadminSidebar from './SuperadminSidebar'
import { Button } from '@/components/ui/button'

interface SuperadminShellProps {
  children: React.ReactNode
}

export default function SuperadminShell({ children }: SuperadminShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Format page name from route
  const getPageTitle = () => {
    if (pathname.includes('/schools')) return 'Okul Yönetimi & Lisanslar'
    if (pathname.includes('/gamestudio')) return 'Game Studio Oyun Kataloğu'
    if (pathname.includes('/banners')) return 'Hero Slider & Tanıtım'
    return 'Yönetim Konsolu (Genel Bakış)'
  }

  return (
    <div
      className="dark min-h-screen bg-[#0B0D13] text-[#FCF9FD] flex font-jakarta selection:bg-[#D914C8]/30 selection:text-white"
      style={{
        // Force dark theme tokens for shadcn UI components across the entire tree
        ['--background' as any]: '273 27% 8.6%',
        ['--foreground' as any]: '285 50% 98.4%',
        ['--card' as any]: '273 28% 12.5%',
        ['--card-foreground' as any]: '285 50% 98.4%',
        ['--popover' as any]: '276 25% 16.7%',
        ['--popover-foreground' as any]: '285 50% 98.4%',
        ['--muted' as any]: '273 28% 16%',
        ['--muted-foreground' as any]: '279 14% 69.4%',
        ['--border' as any]: '282 19% 22%',
        ['--input' as any]: '282 19% 22%',
        ['--primary' as any]: '306 83% 71%',
        ['--primary-foreground' as any]: '273 27% 8.6%',
      }}
    >
      {/* ── DESKTOP SIDEBAR (FIXED LEFT, CATEGORIZED) ── */}
      <div className="hidden lg:block w-64 xl:w-72 shrink-0 h-screen sticky top-0 z-30">
        <SuperadminSidebar />
      </div>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl">
            <SuperadminSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA (RIGHT) ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#0B0D13]">
        {/* Top Navbar / Header Bar */}
        <header className="sticky top-0 z-20 h-14 bg-[#120B1C]/90 backdrop-blur-md border-b border-[#2E1E3B] px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10"
              aria-label="Menüyü Aç"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#A998B3] uppercase tracking-wider hidden sm:inline">
                Superadmin
              </span>
              <span className="text-[#514458] hidden sm:inline">/</span>
              <h2 className="text-xs sm:text-sm font-bold text-white truncate">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Quick Header Right Actions */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10.5px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>PostgreSQL Canlı</span>
            </span>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-[#D2C5D8] hover:text-white hover:bg-[#1E132B]"
            >
              <Link href="/principal/dashboard" target="_blank" title="Müdür Portalı">
                <School size={13} />
                <span className="hidden md:inline ml-1">Müdür Portalı</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-[#D2C5D8] hover:text-white hover:bg-[#1E132B]"
            >
              <Link href="/" target="_blank" title="Tanıtım Sayfasını Gör">
                <ExternalLink size={13} className="text-[#D914C8]" />
                <span className="hidden sm:inline ml-1">Siteyi Gör</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
