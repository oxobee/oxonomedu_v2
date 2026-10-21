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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D914C8] to-[#8D49A6] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-[#D914C8]/25 group-hover:scale-105 transition-transform">
              SA
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
