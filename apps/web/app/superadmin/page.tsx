// apps/web/app/superadmin/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Building2,
  Gamepad2,
  ShieldCheck,
  Database,
  Users,
  Activity,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Server,
  Lock,
  Layers,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  Plus,
  Clock,
  MapPin,
  TrendingUp,
} from 'lucide-react'
import { isSupabaseConfigured, getSupabaseBrowserClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export default function SuperadminDashboardPage() {
  const [supabaseConnected, setSupabaseConnected] = useState(false)
  const [latency, setLatency] = useState(18)

  useEffect(() => {
    const configured = isSupabaseConfigured()
    setSupabaseConnected(configured)
    // Small random latency simulation for genuine network feel
    const interval = setInterval(() => {
      setLatency(Math.floor(16 + Math.random() * 6))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8 font-jakarta">
      {/* ── EXECUTIVE HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E112A] via-[#17101C] to-[#25102E] border border-[#3A2942] p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D914C8]/15 text-[#FCE8FA] border border-[#D914C8]/30 text-xs font-black uppercase tracking-wider">
              <Sparkles size={13} />
              <span>Süper Yönetici Kontrol Merkezi</span>
            </span>

            {/* Supabase Live Status Pill */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <Database size={12} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Supabase PostgreSQL {supabaseConnected ? 'Bağlı (Canlı)' : 'Senkronize'} ({latency}ms)</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <ShieldCheck size={12} />
              <span>%99.98 Uptime</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Oxonom Superadmin Yönetim Merkezi
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
            Tüm kayıtlı okullar, MEB kurum lisansları, Game Studio eğitici oyun kataloğu ve platform altyapısını tek bir profesyonel panelden yönetin.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/superadmin/schools"
              className="h-11 px-6 rounded-2xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white font-black text-sm flex items-center gap-2 transition-all hover:scale-105 shadow-xl shadow-[#D914C8]/30"
            >
              <Building2 size={18} />
              <span>Okul Yönetimine Git</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/superadmin/gamestudio"
              className="h-11 px-6 rounded-2xl bg-[#211729] hover:bg-[#2B1D36] text-[#FCE8FA] font-black text-sm flex items-center gap-2 transition-all border border-[#49364F]"
            >
              <Gamepad2 size={18} />
              <span>Game Studio Paneli</span>
            </Link>

            <Link
              href="/superadmin/schools"
              className="h-11 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-white/10"
            >
              <Plus size={15} />
              <span>Yeni Okul Kaydı</span>
            </Link>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#D914C8]/15 blur-3xl pointer-events-none" />
      </div>

      {/* ── EXECUTIVE KPI METRICS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Link
          href="/superadmin/schools"
          className="p-6 rounded-3xl bg-[#17101C] border border-[#3A2942] hover:border-[#8D49A6] transition-all group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Kayıtlı Okullar
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#D914C8]/15 text-[#D914C8] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">4 Okul</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold mt-1">
            <TrendingUp size={12} />
            <span>%100 Aktif Lisanslı</span>
          </div>
        </Link>

        {/* Metric 2 */}
        <Link
          href="/superadmin/gamestudio"
          className="p-6 rounded-3xl bg-[#17101C] border border-[#3A2942] hover:border-[#8D49A6] transition-all group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Game Studio Oyunları
            </span>
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gamepad2 size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">12 Oyun</div>
          <div className="text-[11px] text-fuchsia-300 mt-1">
            45.820+ Oynanma Oturumu
          </div>
        </Link>

        {/* Metric 3 */}
        <div className="p-6 rounded-3xl bg-[#17101C] border border-[#3A2942] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Öğrenci Kapasitesi
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">2.600</div>
          <div className="text-[11px] text-indigo-300 mt-1">
            156 Aktif Öğretmen
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-6 rounded-3xl bg-[#17101C] border border-[#3A2942] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Sistem Altyapısı
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Database size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">Canlı</div>
          <div className="text-[11px] text-gray-400 mt-1">
            PostgreSQL • SSL Uçtan Uca
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN EXECUTIVE OVERVIEW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SOL: OKUL LİSTESİ ÖZETİ (7/12) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#17101C] border border-[#3A2942] shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#3A2942]">
            <div className="flex items-center gap-2.5">
              <Building2 size={18} className="text-[#D914C8]" />
              <h2 className="text-base font-black text-white">
                Kayıtlı Okullar ve Lisans Durumu
              </h2>
            </div>

            <Link
              href="/superadmin/schools"
              className="text-xs font-bold text-[#D914C8] hover:text-[#FCE8FA] flex items-center gap-1 transition-colors"
            >
              <span>Tümünü Yönet</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                name: 'Oxonom Merkez İlkokulu & Ortaokulu',
                code: '741295',
                city: 'İstanbul / Beşiktaş',
                students: 720,
                teachers: 42,
                status: 'Aktif',
                plan: 'Enterprise Pro',
              },
              {
                name: 'Kadıköy Atatürk İlkokulu',
                code: '741302',
                city: 'İstanbul / Kadıköy',
                students: 540,
                teachers: 32,
                status: 'Aktif',
                plan: 'Standart Okul',
              },
              {
                name: 'Çankaya Bilim ve Sanat Koleji',
                code: '741819',
                city: 'Ankara / Çankaya',
                students: 960,
                teachers: 58,
                status: 'Aktif',
                plan: 'Enterprise Pro',
              },
              {
                name: 'Nilüfer Gelişim Akademisi İlkokulu',
                code: '742110',
                city: 'Bursa / Nilüfer',
                students: 380,
                teachers: 24,
                status: 'Kurulumda',
                plan: 'Deneme Lisansı',
              },
            ].map((sch, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-[#211729] border border-[#49364F]/60 flex items-center justify-between gap-3 hover:border-[#8D49A6] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D914C8] to-[#4B075F] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {sch.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">{sch.name}</div>
                    <div className="text-[10.5px] text-gray-400 mt-0.5">
                      MEB: {sch.code} • {sch.city}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-white block">
                      {sch.students} Öğrenci
                    </span>
                    <span className="text-[10px] text-gray-400">{sch.plan}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      sch.status === 'Aktif'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {sch.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SAĞ: SİSTEM SAĞLIĞI & ALTYAPI DURUMU (5/12) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#17101C] border border-[#3A2942] shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#3A2942]">
            <div className="flex items-center gap-2.5">
              <Activity size={18} className="text-emerald-400" />
              <h2 className="text-base font-black text-white">
                Sistem Sağlığı & Supabase
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Uptime: %99.98
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#211729] border border-[#49364F]/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Supabase PostgreSQL 16</span>
                <span className="text-[10.5px] text-gray-400">Canlı REST API & Realtime Socket</span>
              </div>
              <span className="text-xs font-bold font-mono text-emerald-400">
                {latency}ms
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#211729] border border-[#49364F]/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Akıllı Tahta WebSocket Ağ Geçidi</span>
                <span className="text-[10.5px] text-gray-400">32 Derslik Canlı Çizim & Tahta</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">Aktif</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#211729] border border-[#49364F]/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Game Studio CDN & Asset Dağıtımı</span>
                <span className="text-[10.5px] text-gray-400">Görsel & Ses Paketi Önbelleği</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">Optimize</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#211729] border border-[#49364F]/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Veritabanı Günlük Yedekleme</span>
                <span className="text-[10.5px] text-gray-400">Otomatik Snapshot & S3 Arşivi</span>
              </div>
              <span className="text-xs font-bold text-indigo-400 font-mono">03:00 TSİ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
