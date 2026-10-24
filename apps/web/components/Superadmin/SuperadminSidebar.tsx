'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Gamepad2,
  Sliders,
  School,
  GraduationCap,
  Users,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Database,
  Sparkles,
  ChevronRight,
  Activity,
  Layers,
  Server,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface SuperadminSidebarProps {
  onCloseMobile?: () => void
}

interface NavCategory {
  title: string
  items: {
    label: string
    path: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    badge?: string
    badgeColor?: string
    external?: boolean
  }[]
}

const SUPERADMIN_NAV_CATEGORIES: NavCategory[] = [
  {
    title: 'YÖNETİM & METRİKLER',
    items: [
      {
        label: 'Genel Bakış (Dashboard)',
        path: '/superadmin',
        icon: LayoutDashboard,
      },
      {
        label: 'Sunucu & Altyapı Sağlığı',
        path: '/superadmin/infrastructure',
        icon: Server,
        badge: 'Canlı',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      },
    ],
  },
  {
    title: 'KURUM & OKULLAR',
    items: [
      {
        label: 'Okul Yönetimi & Lisanslar',
        path: '/superadmin/schools',
        icon: Building2,
        badge: 'MEB',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      },
    ],
  },
  {
    title: 'İÇERİK & EĞİTİM ATÖLYELERİ',
    items: [
      {
        label: 'Game Studio Oyun Kataloğu',
        path: '/superadmin/gamestudio',
        icon: Gamepad2,
        badge: '12 Oyun',
        badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
      },
      {
        label: 'Tanıtım & Hero Slider',
        path: '/superadmin/banners',
        icon: Sliders,
        badge: 'Slider',
        badgeColor: 'bg-[#D914C8]/20 text-[#FCE8FA] border-[#D914C8]/30',
      },
    ],
  },
  {
    title: 'CANLI GÖRÜNÜM & PORTALLAR',
    items: [
      {
        label: 'Okul Müdürü Portalı',
        path: '/principal/dashboard',
        icon: School,
        external: true,
      },
      {
        label: 'Öğretmen Portalı',
        path: '/teacher/dashboard',
        icon: GraduationCap,
        external: true,
      },
      {
        label: 'Öğrenci Portalı',
        path: '/student/dashboard',
        icon: Users,
        external: true,
      },
      {
        label: 'Canlı Tanıtım Sitesi',
        path: '/',
        icon: ExternalLink,
        external: true,
      },
    ],
  },
]

export default function SuperadminSidebar({ onCloseMobile }: SuperadminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oxonom_superadmin_session')
      localStorage.removeItem('oxonom_current_role')
      sessionStorage.removeItem('oxonom_superadmin_auth')
    }
    router.push('/login')
  }

  const isItemActive = (itemPath: string) => {
    if (itemPath === '/superadmin') {
      return pathname === '/superadmin'
    }
    return pathname.startsWith(itemPath)
  }

  return (
    <aside className="w-64 xl:w-72 h-full flex flex-col justify-between bg-[#120B1C] border-r border-[#2E1E3B] text-white select-none">
      {/* ── TOP: BRAND & LOGO ── */}
      <div>
        <div className="p-4 sm:p-5 border-b border-[#2E1E3B] flex items-center justify-between">
          <Link
            href="/superadmin"
            onClick={onCloseMobile}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D914C8] to-[#4B075F] p-1.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-lg shadow-[#D914C8]/25 border border-[#D914C8]/40">
              <img
                src="/oxonom-icon-white.png"
                alt="Oxonom"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white">
                  OXONOM <span className="text-[#D914C8]">SUPERADMIN</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#D914C8]/25 text-[#FCE8FA] border border-[#D914C8]/40 uppercase tracking-widest">
                  Root
                </span>
              </div>
              <p className="text-[10px] text-[#A998B3] truncate font-medium mt-0.5">
                Sistem & Kurum Konsolu
              </p>
            </div>
          </Link>

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              aria-label="Menüyü Kapat"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── MIDDLE: CATEGORIZED NAVIGATION LIST ── */}
        <div className="p-3.5 space-y-5 overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
          {SUPERADMIN_NAV_CATEGORIES.map((category) => (
            <div key={category.title} className="space-y-1">
              <div className="px-3 py-1 text-[9.5px] font-black uppercase tracking-wider text-[#A998B3]/70">
                {category.title}
              </div>
              <nav className="space-y-0.5">
                {category.items.map((item) => {
                  const Icon = item.icon
                  const active = isItemActive(item.path)

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      onClick={item.external ? undefined : onCloseMobile}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-gradient-to-r from-[#4B075F] to-[#7B1D8C] text-white shadow-md shadow-[#4B075F]/30 border border-[#D914C8]/40'
                          : 'text-[#D2C5D8] hover:bg-[#1E132B] hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          size={15}
                          className={`shrink-0 transition-colors ${
                            active ? 'text-[#FCE8FA]' : 'text-[#8D49A6] group-hover:text-[#D914C8]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span
                            className={`text-[8.5px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wide ${
                              item.badgeColor || 'bg-[#D914C8]/20 text-[#FCE8FA] border-[#D914C8]/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.external && (
                          <ExternalLink size={11} className="text-[#8D49A6] group-hover:text-white/80" />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM: SYSTEM HEALTH PILL & USER / LOGOUT ── */}
      <div className="p-3.5 border-t border-[#2E1E3B] bg-[#0E0817]/60 space-y-3">
        {/* Supabase status badge */}
        <div className="p-2.5 rounded-xl bg-[#1A1125] border border-[#2E1E3B] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="truncate">
              <span className="font-bold text-white block truncate">PostgreSQL Canlı</span>
              <span className="text-[10px] text-gray-400">Supabase Frankfurt</span>
            </div>
          </div>
          <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
            %99.98
          </span>
        </div>

        {/* User Card & Logout Button */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#D914C8] to-[#4B075F] text-white font-black text-xs flex items-center justify-center shrink-0 border border-white/10">
              K
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Kemal SOYSAL</div>
              <div className="text-[10px] text-[#A998B3] truncate">root.superadmin</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Süper Admin Çıkışı"
            className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-colors cursor-pointer shrink-0"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
