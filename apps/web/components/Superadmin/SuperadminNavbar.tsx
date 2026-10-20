'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Monitor,
  LayoutDashboard,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  School,
  Sliders,
  Layers,
  Gamepad2,
} from 'lucide-react'

export default function SuperadminNavbar() {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'Game Studio',
      path: '/superadmin/gamestudio',
      icon: Gamepad2,
      badge: 'Oyunlar',
    },
    {
      label: 'OS Ayarları (Afiş & Slider)',
      path: '/superadmin/os-settings',
      icon: Sliders,
      badge: 'Ana Menü',
    },
    {
      label: 'Genel Bakış',
      path: '/superadmin',
      icon: LayoutDashboard,
    },
  ]

  return (
    <header className="sticky top-0 z-40 bg-[#10141E]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <Link
            href="/superadmin"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              SA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white">
                  OXONOM <span className="text-amber-400">SUPERADMIN</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest">
                  Root
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">
                Öğretmen OS & Dijital Ekosistem Yönetimi
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
                    ? 'bg-amber-500 text-black shadow-md font-black'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                      active ? 'bg-black/20 text-black' : 'bg-amber-500/20 text-amber-300'
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
          {/* Launch Teacher Desktop OS in new tab */}
          <Link
            href="/teacher/desktop-os"
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-950/20"
            title="Öğretmen Masaüstü OS Arayüzünü Yeni Sekmede Canlı Aç"
          >
            <Monitor size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">Öğretmen OS'i Aç</span>
            <ExternalLink size={11} className="opacity-75" />
          </Link>

          {/* School Principal Portal Link */}
          <Link
            href="/principal/dashboard"
            className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10"
            title="Müdür Portalı"
          >
            <School size={14} className="text-gray-400" />
            <span className="hidden md:inline">Müdür Portalı</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
