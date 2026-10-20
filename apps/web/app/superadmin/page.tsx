import React from 'react'
import Link from 'next/link'
import {
  Sliders,
  Monitor,
  ExternalLink,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Tv,
  CheckSquare,
  ArrowRight,
  Gamepad2,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function SuperadminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#D914C8]/25 via-purple-900/30 to-[#8D49A6]/25 border border-white/10 p-6 sm:p-10 backdrop-blur-xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D914C8]/20 text-[#F0D8FA] border border-[#D914C8]/30 text-xs font-black uppercase tracking-wider">
            <Sparkles size={13} />
            <span>Süper Yönetici Paneli</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Game Studio & Öğretmen OS Yönetimi
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Bu alandan Game Studio eğitici oyun kataloğunu ve Öğretmen Masaüstü İşletim Sistemi (<code className="text-[#F0D8FA] font-mono text-xs">/teacher/desktop-os</code>) için film afişi görsellerini, kategorileri ve hem Web hem Mobil Hero Slider bannerlarını yönetebilirsiniz.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/superadmin/gamestudio"
              className="h-11 px-6 rounded-2xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white font-black text-sm flex items-center gap-2 transition-all hover:scale-105 shadow-xl shadow-[#D914C8]/30"
            >
              <Gamepad2 size={18} />
              <span>Game Studio Paneline Git</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/superadmin/os-settings"
              className="h-11 px-6 rounded-2xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white font-black text-sm flex items-center gap-2 transition-all hover:scale-105 shadow-xl shadow-[#D914C8]/25"
            >
              <Sliders size={16} />
              <span>OS Settings Menüsüne Git</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/teacher/desktop-os"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center gap-2 transition-all border border-white/10"
            >
              <Monitor size={16} className="text-[#D914C8]" />
              <span>Canlı OS Ekranını Aç</span>
              <ExternalLink size={13} className="opacity-70" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-[#141926] border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
            <Gamepad2 size={22} />
          </div>
          <h2 className="text-base font-extrabold text-white">Game Studio Kataloğu</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Matematik, Fen, Kodlama ve Türkçe oyunlarını yükleyin, kapak görsellerini düzenleyin ve aktif/pasif yapın.
          </p>
          <div className="text-[11px] font-mono text-fuchsia-300/80 bg-black/30 p-2 rounded-xl">
            Durum: Canlı Mağaza & İzinler
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#141926] border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ImageIcon size={22} />
          </div>
          <h2 className="text-base font-extrabold text-white">Film Afişi Kısayolları</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Yoklama Al, Akıllı Tahta, Sınav ve diğer tüm araçları standart ikonlar yerine Netflix / dijital yayın tarzı afiş görselleriyle donatın.
          </p>
          <div className="text-[11px] font-mono text-amber-300/80 bg-black/30 p-2 rounded-xl">
            Önerilen Boyut: 600x900px (2:3 dikey)
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#141926] border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Tv size={22} />
          </div>
          <h2 className="text-base font-extrabold text-white">Web & Mobil Hero Slider</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Masaüstünün en üstünde yer alan sinematik duyuru ve öne çıkan içerik slaytlarını ayrı web ve mobil boyutlarıyla düzenleyin.
          </p>
          <div className="text-[11px] font-mono text-amber-300/80 bg-black/30 p-2 rounded-xl">
            Web: 1920x800px · Mobil: 800x1200px
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#141926] border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers size={22} />
          </div>
          <h2 className="text-base font-extrabold text-white">Pencereli OS Ekranı</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Öğretmen afişe tıkladığında harici sayfaya gitmek yerine OS penceresinde açılır; yoklama, tahta veya sınav doğrudan pencere içinde çalışır.
          </p>
          <div className="text-[11px] font-mono text-emerald-300/80 bg-black/30 p-2 rounded-xl">
            Durum: 13 Tam Fonksiyonel Pencere
          </div>
        </div>
      </div>
    </div>
  )
}
