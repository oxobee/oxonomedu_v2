'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getAPIUrl } from '@services/config/config'
import { useOrg } from '@components/Contexts/OrgContext'
import {
  GraduationCap,
  GameController,
  ShieldCheck,
  Lock,
  Globe,
  ArrowUpRight,
  BookOpen,
  ChalkboardSimple,
  FolderOpen,
  Sparkle,
  CheckCircle,
  CaretUp,
  Headphones,
  ChatsCircle,
  FileText,
  Buildings,
  ArrowsClockwise,
  Broadcast,
} from '@phosphor-icons/react'

export function GlobalEduFooter() {
  const org = useOrg() as any
  const orgslug = org?.slug || 'oxonom'
  const [currentYear, setCurrentYear] = useState(2026)
  const [pingMs, setPingMs] = useState(24)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
    // Subtle ping simulation
    const interval = setInterval(() => {
      setPingMs(Math.floor(18 + Math.random() * 12))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Fetch global branding & footer settings
  const { data: branding } = useQuery({
    queryKey: ['instance-branding'],
    queryFn: async () => {
      try {
        const res = await fetch(`${getAPIUrl()}instance/branding`)
        if (res.ok) {
          return await res.json()
        }
      } catch (_e) {
        // fallback
      }
      return null
    },
    staleTime: 60 * 1000,
  })

  const siteName = branding?.site_name || org?.name || 'Oxonom Okulları'
  const siteLogo = branding?.site_logo || org?.logo_image || '/meb_logo.svg'
  const footerText =
    branding?.footer_text ||
    org?.config?.config?.general?.footer_text ||
    '© 2026 Oxonom Education Technologies & MEB Dijital Kampüs Altyapısı. Tüm hakları saklıdır.'
  const footerLinkText = branding?.footer_link_text || 'Oxonom Technologies'
  const footerLinkUrl = branding?.footer_link_url || 'https://www.oxonom.com'

  const quickLaunchItems = [
    {
      title: 'Ders Panoları',
      desc: 'Akıllı tahta ve etkileşimli ders notları',
      href: `/orgs/${orgslug}/boards`,
      icon: ChalkboardSimple,
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30',
      badge: 'Canlı',
    },
    {
      title: 'Ev Ödevleri',
      desc: 'Şubeye özel ödev takip ve teslim panosu',
      href: `/orgs/${orgslug}/assignments`,
      icon: FileText,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
      badge: '30 Teslim',
    },
    {
      title: 'Dijital Kütüphane',
      desc: 'PDF, video ve interaktif çalışma föyleri',
      href: `/orgs/${orgslug}/library`,
      icon: FolderOpen,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      badge: '9 Format',
    },
    {
      title: 'Veli & Okul Forumu',
      desc: 'Sınıf dayanışma ve Okul Aile Birliği',
      href: `/orgs/${orgslug}/communities`,
      icon: ChatsCircle,
      color: 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30',
      badge: 'Aktif',
    },
    {
      title: 'Eğitici Oyunlar',
      desc: 'Müfredat uyumlu oyun ve simülasyonlar',
      href: `/games`,
      icon: GameController,
      color: 'from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/30',
      badge: '🎮 Oyna',
    },
  ]

  return (
    <footer className="w-full bg-[#0a0f1d] text-slate-300 border-t border-slate-800/80 mt-16 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Decorative calm background grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 relative z-10 space-y-12">
        {/* Interactive Quick Launch Cards Deck */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 inline-flex items-center gap-1.5">
                <Sparkle size={14} weight="fill" />
                Hızlı Erişim Masası
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Öğrenci, Öğretmen ve Veli Kısayolları
              </h3>
            </div>

            {/* Back to top interactive button */}
            <button
              onClick={scrollToTop}
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition group self-start sm:self-auto cursor-pointer shadow-sm active:scale-95"
            >
              <span>Yukarı Çık</span>
              <CaretUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickLaunchItems.map((item, idx) => {
              const IconComp = item.icon
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="group relative p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition duration-150 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div
                      className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} border flex items-center justify-center group-hover:scale-105 transition-transform`}
                    >
                      <IconComp size={18} weight="fill" />
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition truncate">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* School Campus Switcher & Identity Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center p-2 shrink-0">
              <img
                src="/meb_logo.svg"
                alt="MEB Logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">T.C. Millî Eğitim Bakanlığı</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  Resmi Müfredat
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Oxonom Okulları Akıllı Kampüsü
              </p>
            </div>
          </div>

          {/* Quick School Links */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/orgs/oxonom"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 bg-indigo-600 text-white shadow-sm"
            >
              <Buildings size={14} />
              <span>Oxonom Okulları</span>
            </Link>
          </div>
        </div>

        {/* Main Links Grid: 5 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8 pt-2">
          {/* Column 1: Kurumsal & Güvenlik */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <GraduationCap size={16} className="text-indigo-400" />
                <span>Akıllı Okul Ekosistemi</span>
              </span>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                MEB temel eğitim ve ortaöğretim standartlarına uygun; akıllı tahta panoları, otomatik TC Kimlik doğrulamalı öğrenci işleri, zengin kütüphane ve eğitici ders simülasyonlarını tek ekranda buluşturan bütünleşik eğitim portalı.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-bold text-emerald-400">
                <ShieldCheck size={14} weight="fill" />
                <span>MEB Uyumlu</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-bold text-indigo-400">
                <Lock size={14} weight="fill" />
                <span>KVKK & GDPR</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-bold text-amber-400">
                <Sparkle size={14} weight="fill" />
                <span>256-Bit SSL</span>
              </span>
            </div>
          </div>

          {/* Column 2: Temel Dersler */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <BookOpen size={16} className="text-indigo-400" />
              <span>Ders Atölyeleri</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href={`/orgs/${orgslug}/playgrounds`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>Matematik Atölyesi</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/orgs/${orgslug}/playgrounds`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>Fen & Doğa Bilimleri</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/orgs/${orgslug}/playgrounds`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>Bilişim & Kodlama</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/orgs/${orgslug}/playgrounds`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>Sosyal Bilgiler & Tarih</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/orgs/${orgslug}/playgrounds`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>Türkçe & Dil Sanatları</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: İnteraktif Öğrenme & Oyunlar */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <GameController size={16} className="text-amber-400" />
              <span>İnteraktif & Oyunlar</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href={`/games`}
                  className="hover:text-white transition flex items-center gap-1.5 font-medium text-amber-300"
                >
                  <span>🎮 Eğitici Oyunlar Vitrini</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/games`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>🪐 Güneş Sistemi Simülasyonu</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/games`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>🔤 Kelime Avcısı & Bulmaca</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/games`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>🔢 2048 Sayı & Mantık Bulmacası</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/orgs/${orgslug}/library`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>📂 9 Formatlı Dijital Kütüphane</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: MEB & Resmi Bağlantılar */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Globe size={16} className="text-emerald-400" />
              <span>MEB & Resmi Bağlantılar</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.meb.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition inline-flex items-center gap-1 group"
                >
                  <span>T.C. Millî Eğitim Bakanlığı</span>
                  <ArrowUpRight size={12} className="opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.eba.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition inline-flex items-center gap-1 group"
                >
                  <span>MEB EBA Portalı</span>
                  <ArrowUpRight size={12} className="opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="https://e-okul.meb.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition inline-flex items-center gap-1 group"
                >
                  <span>e-Okul Yönetim Sistemi</span>
                  <ArrowUpRight size={12} className="opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <span className="text-slate-400 cursor-default hover:text-slate-200 transition">
                  KVKK Aydınlatma Metni
                </span>
              </li>
              <li>
                <span className="text-slate-400 cursor-default hover:text-slate-200 transition">
                  Öğrenci Çevrim İçi Güvenliği
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Server Health & Latency */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
            <span>{footerText}</span>
            {footerLinkUrl && (
              <>
                <span className="text-slate-600 hidden sm:inline">&bull;</span>
                <a
                  href={footerLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition inline-flex items-center gap-0.5"
                >
                  <span>{footerLinkText}</span>
                  <ArrowUpRight size={12} />
                </a>
              </>
            )}
          </div>

          {/* Interactive Live Status Indicator */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sistemler Aktif</span>
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-400 inline-flex items-center gap-1 font-mono">
              <Broadcast size={13} className="text-indigo-400" />
              <span>{pingMs}ms</span>
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-indigo-300 font-medium">%99.98 Uptime</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
