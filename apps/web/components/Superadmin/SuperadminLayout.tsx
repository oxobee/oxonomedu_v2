// apps/web/components/Superadmin/SuperadminLayout.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gamepad2,
  ShieldCheck,
  LayoutDashboard,
  Settings,
  Users,
  LogOut,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  PlusCircle,
  BarChart3,
  Layers,
  GraduationCap,
} from 'lucide-react'

interface SuperadminLayoutProps {
  children: React.ReactNode
}

export default function SuperadminLayout({ children }: SuperadminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [adminUser, setAdminUser] = useState<{ username: string; name: string } | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('oxonom_superadmin_session')
      if (raw) {
        setAdminUser(JSON.parse(raw))
      } else {
        setAdminUser({ username: 'ugurxugurlu', name: 'Uğur UĞURLU' })
      }
    } catch {
      setAdminUser({ username: 'ugurxugurlu', name: 'Uğur UĞURLU' })
    }
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oxonom_superadmin_session')
      localStorage.removeItem('oxonom_current_role')
      window.location.href = '/loginv2'
    }
  }

  const navItems = [
    {
      label: 'Game Studio',
      path: '/superadmin/gamestudio',
      icon: Gamepad2,
      badge: 'Canlı',
      description: 'Oyun yönetimi, katalog, sınıf & ders atamaları',
    },
    {
      label: 'Öğrenci Portalı Görünümü',
      path: '/student/gamestudio',
      icon: GraduationCap,
      external: true,
      description: 'Öğrenci gözünden Game Studio mağazası',
    },
    {
      label: 'Öğretmen Portalı Görünümü',
      path: '/teacher/gamestudio',
      icon: Users,
      external: true,
      description: 'Öğretmen gözünden Game Studio mağazası',
    },
    {
      label: 'Müdür Paneli Görünümü',
      path: '/principal/gamestudio',
      icon: ShieldCheck,
      external: true,
      description: 'Müdür sınıf yetkilendirme ekranı',
    },
  ]

  return (
    <div className="min-h-screen bg-[#110B17] text-[#FCF9FD] font-jakarta flex flex-col selection:bg-[#D914C8]/30 selection:text-white">
      {/* ── TOP HEADER ── */}
      <header className="sticky top-0 z-40 bg-[#17101C]/90 backdrop-blur-xl border-b border-[#3A2942] px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#211729] text-[#E0D0E8] border border-[#49364F]"
          >
            {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link href="/superadmin/gamestudio" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D914C8] to-[#4B075F] flex items-center justify-center text-white shadow-lg shadow-[#D914C8]/25 border border-[#D914C8]/50 group-hover:scale-105 transition-transform">
              <Gamepad2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-[#FCE8FA] to-[#D914C8] bg-clip-text text-transparent">
                  OXONOM GAME STUDIO
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#D914C8]/25 text-[#F0D8FA] border border-[#D914C8]/40 tracking-wider">
                  Superadmin
                </span>
              </div>
              <p className="text-[11px] text-[#A898B0] hidden sm:block">
                Eğitsel Oyun Yönetim & Prodüksiyon Merkezi
              </p>
            </div>
          </Link>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#211729]/80 border border-[#49364F]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#45C7A2] animate-pulse" />
            <div className="text-left text-xs">
              <div className="font-bold text-white leading-none">
                {adminUser?.name || 'Uğur UĞURLU'}
              </div>
              <div className="text-[10px] text-[#A898B0] font-mono leading-none mt-0.5">
                @{adminUser?.username || 'ugurxugurlu'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Güvenli Çıkış Yap"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2E1829] hover:bg-[#3D1E36] text-[#FFA8D8] border border-[#8D2B60]/40 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="w-64 shrink-0 bg-[#17101C] border-r border-[#3A2942] p-4 hidden lg:flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#96839F] px-3 mb-2">
                Stüdyo Yönetimi
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.path || (item.path !== '/superadmin/gamestudio' && pathname.startsWith(item.path))
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      target={item.external ? '_blank' : undefined}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#4B075F] to-[#7B1D8C] text-white shadow-md shadow-[#4B075F]/40 border border-[#D914C8]/40'
                          : 'text-[#D2C5D8] hover:bg-[#251A2E] hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? 'text-[#FCE8FA]' : 'text-[#8D49A6]'} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#D914C8]/30 text-[#FCE8FA] border border-[#D914C8]/40">
                          {item.badge}
                        </span>
                      )}
                      {item.external && <ExternalLink size={12} className="text-[#8D49A6]" />}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Quick Architecture Note */}
            <div className="p-3.5 rounded-2xl bg-[#211729]/70 border border-[#3A2942] text-xs">
              <div className="flex items-center gap-2 text-[#D914C8] font-bold mb-1">
                <Sparkles size={14} />
                <span>Gerçek Zamanlı Senkron</span>
              </div>
              <p className="text-[11px] text-[#A898B0] leading-relaxed">
                Superadmin panelinde yapılan oyun düzenlemeleri, silme ve aktif/pasif değişiklikleri anında Öğrenci, Öğretmen ve Müdür panellerine yansır.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#3A2942]">
            <div className="flex items-center justify-between text-[11px] text-[#A898B0]">
              <span>Oxonom Edu Core v2.4</span>
              <span className="text-[#45C7A2] font-semibold">Aktif</span>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, x: -280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -280 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#17101C] border-r border-[#3A2942] p-5 shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#3A2942] mb-4">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="text-[#D914C8]" size={22} />
                    <span className="font-black text-sm text-white">GAME STUDIO</span>
                  </div>
                  <button
                    onClick={() => setIsMobileNavOpen(false)}
                    className="p-1 rounded-lg text-[#A898B0] hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.path
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setIsMobileNavOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold ${
                          isActive
                            ? 'bg-[#4B075F] text-white border border-[#D914C8]/50'
                            : 'text-[#D2C5D8] hover:bg-[#251A2E]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </div>
                        {item.external && <ExternalLink size={12} />}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-[#2E1829] text-[#FFA8D8] text-xs font-bold border border-[#8D2B60]/40 flex items-center justify-center gap-2"
              >
                <LogOut size={14} />
                <span>Çıkış Yap</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
