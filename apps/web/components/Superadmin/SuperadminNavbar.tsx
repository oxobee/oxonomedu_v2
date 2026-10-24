'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ExternalLink,
  School,
  Sliders,
  Gamepad2,
  LogOut,
} from 'lucide-react'

export default function SuperadminNavbar() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      label: 'Genel Bakış',
      path: '/superadmin',
      icon: LayoutDashboard,
    },
    {
      label: 'Slider & Tanıtım',
      path: '/superadmin/banners',
      icon: Sliders,
      badge: 'Slider & Promo',
    },
    {
      label: 'Okul Yönetimi',
      path: '/superadmin/schools',
      icon: School,
    },
    {
      label: 'Game Studio',
      path: '/superadmin/gamestudio',
      icon: Gamepad2,
      badge: 'Oyunlar',
    },
  ]

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oxonom_superadmin_session')
      localStorage.removeItem('oxonom_current_role')
      sessionStorage.removeItem('oxonom_superadmin_auth')
    }
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-[#10141E]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <Link
            href="/superadmin"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/oxonom-icon-white.png"
                alt="Oxonom EDU"
                className="w-8 h-8 object-contain select-none"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white">
                  OXONOM <span className="text-[#D914C8]">SUPERADMIN</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#D914C8]/20 text-[#F0D8FA] border border-[#D914C8]/40 uppercase tracking-widest">
                  Root
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">
                Oxonom Dijital Ekosistem Yönetimi
              </p>
            </div>
          </Link>
        </div>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.path

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white shadow-md font-black'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                      active ? 'bg-black/20 text-white' : 'bg-[#D914C8]/20 text-[#F0D8FA]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Canlı Tanıtım Sayfası */}
          <Link
            href="/"
            target="_blank"
            className="h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10"
            title="Tanıtım Sayfasını Canlı Gör"
          >
            <ExternalLink size={14} className="text-[#D914C8]" />
            <span className="hidden sm:inline">Siteyi Gör</span>
          </Link>

          {/* School Principal Portal Link */}
          <Link
            href="/principal/dashboard"
            className="h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10"
            title="Müdür Portalı"
          >
            <School size={14} className="text-gray-400" />
            <span className="hidden lg:inline">Müdür Portalı</span>
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="h-9 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-red-500/20 cursor-pointer"
            title="Süper Admin Çıkışı"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </div>
    </header>
  )
}
