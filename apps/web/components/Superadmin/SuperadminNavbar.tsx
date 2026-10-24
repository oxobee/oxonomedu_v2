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
  Building2,
  Shield,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
      badge: 'Slider',
    },
    {
      label: 'Okul Yönetimi',
      path: '/superadmin/schools',
      icon: Building2,
      badge: 'MEB',
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
    <header className="sticky top-0 z-40 bg-[#0B0D13]/90 backdrop-blur-md border-b border-border/40 px-4 sm:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <Link
            href="/superadmin"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#D914C8] to-[#4B075F] p-1 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs shadow-[#D914C8]/30">
              <img
                src="/oxonom-icon-white.png"
                alt="Oxonom EDU"
                className="w-full h-full object-contain select-none"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white">
                  OXONOM <span className="text-[#D914C8]">SUPERADMIN</span>
                </span>
                <Badge
                  variant="outline"
                  className="px-1.5 py-0 text-[9px] font-black uppercase tracking-wider border-[#D914C8]/40 bg-[#D914C8]/10 text-[#FCE8FA]"
                >
                  Root
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium hidden sm:block">
                Platform Konsolu & Kurum Yönetimi
              </p>
            </div>
          </Link>
        </div>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.path

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                <Icon size={14} className={active ? 'text-primary-foreground' : 'text-muted-foreground'} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[8.5px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                      active
                        ? 'bg-black/20 text-white'
                        : 'bg-[#D914C8]/15 text-[#FCE8FA] border border-[#D914C8]/30'
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
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border border-transparent hover:border-border/60"
          >
            <Link href="/" target="_blank" title="Tanıtım Sayfasını Canlı Gör">
              <ExternalLink size={13} className="text-[#D914C8]" />
              <span className="hidden sm:inline">Siteyi Gör</span>
            </Link>
          </Button>

          {/* School Principal Portal Link */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border border-transparent hover:border-border/60"
          >
            <Link href="/principal/dashboard" title="Müdür Portalı">
              <School size={13} />
              <span className="hidden lg:inline">Müdür Portalı</span>
            </Link>
          </Button>

          {/* Logout */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="h-8 px-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20"
            title="Süper Admin Çıkışı"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Çıkış</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
