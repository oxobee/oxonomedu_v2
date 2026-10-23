'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Crown,
  Sparkles,
  Check,
  X,
  Zap,
  ShieldCheck,
  Star,
  BookOpen,
  TrendingUp,
  Award,
  ChevronRight,
  Gift,
} from 'lucide-react'

interface OxonomPlusModalProps {
  isOpen: boolean
  onClose: () => void
}

const PLUS_BENEFITS = [
  {
    icon: BookOpen,
    title: '312 MEB Kitabı & Etkileşimli Flipbook',
    desc: 'Tüm ders kitapları, flipbook animasyonları, sayfa içi notlar ve offline okuma modu.',
  },
  {
    icon: Zap,
    title: '7/24 Yapay Zekâ Eğitmen Desteği',
    desc: 'Takıldığın soruyu sor, anında adım adım çözümü ve püf noktalarını öğren.',
  },
  {
    icon: TrendingUp,
    title: 'Sınav Başarı Radarı & Soru Tahminleri',
    desc: 'Yazılı sınavlar için zümre öğretmenleri soru kalıpları ve deneme analizleri.',
  },
  {
    icon: Award,
    title: 'Sınırsız Defter Notu & Akıllı Planlayıcı',
    desc: 'Kitap sayfalarına doğrudan not bağlama ve çalışma hedeflerini takvime işleme.',
  },
  {
    icon: ShieldCheck,
    title: '%100 Reklamsız, Güvenli ve Süper Hızlı',
    desc: 'Okulda, evde veya akıllı tahtada dikkatin dağılmadan kesintisiz odaklanma.',
  },
]

export default function OxonomPlusModal({ isOpen, onClose }: OxonomPlusModalProps) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly')

  if (!isOpen) return null

  const handleCtaClick = () => {
    onClose()
    if (typeof window !== 'undefined') {
      router.push('/student/pricing')
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-jakarta">
        {/* Backdrop with high quality blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0E0617]/75 backdrop-blur-md transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg my-auto rounded-[32px] overflow-hidden bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#49364F] shadow-[0_24px_70px_rgba(75,7,95,0.22)] z-10 flex flex-col max-h-[92vh]"
        >
          {/* Subtle Ambient Continuous Radial Glows */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-[#8D49A6]/20 via-[#D914C8]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-[#4B075F]/15 via-[#8D49A6]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D914C8]/50 to-transparent pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F7F0FA] hover:bg-[#F0D8FA] dark:bg-[#2D2035] dark:hover:bg-[#350444] text-[#514458] dark:text-[#D2C5D8] hover:text-[#4B075F] dark:hover:text-[#F17AE6] flex items-center justify-center transition-colors z-20 cursor-pointer shadow-xs border border-[#E8DFEB] dark:border-[#49364F]"
            aria-label="Kapat"
          >
            <X size={17} />
          </button>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-5 sm:p-7 space-y-4.5 custom-scrollbar">
            {/* Header Badge */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE8FA] dark:bg-[#350444]/60 border border-[#D914C8]/30 text-[#8D49A6] dark:text-[#F17AE6] text-xs font-black tracking-wide shadow-xs">
                <Sparkles size={13} className="text-[#D914C8] dark:text-[#F17AE6]" />
                <span>9 AY ÖDE 12 AY KULLAN — %50 İNDİRİM</span>
              </div>

              {/* Title & Crown */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4B075F] via-[#8D49A6] to-[#D914C8] text-white flex items-center justify-center shadow-lg shadow-[#4B075F]/30 shrink-0 border border-white/20">
                  <Crown size={24} className="fill-white text-white drop-shadow-xs" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#241329] dark:text-[#FCF9FD] tracking-tight leading-none">
                    Oxonom Plus Premium
                  </h2>
                  <p className="text-xs text-[#514458] dark:text-[#D2C5D8] font-semibold mt-1">
                    Okulda ve sınavda zirveye oynayan öğrenciler için
                  </p>
                </div>
              </div>
            </div>

            {/* Free Trial Banner */}
            <div className="p-3 rounded-2xl bg-[#FCF9FD] dark:bg-[#251830] border border-[#D914C8]/25 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8D49A6] to-[#D914C8] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Gift size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-[#4B075F] dark:text-[#F17AE6]">
                  İlk 14 Gün Ücretsiz Deneyin!
                </div>
                <div className="text-[11px] text-[#514458] dark:text-[#D2C5D8]">
                  Kredi kartı gerekmez. Sıfır risk ile tüm özellikleri hemen keşfedin.
                </div>
              </div>
            </div>

            {/* Pricing Packages Selection (Aylık vs 9 Aylık) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: 9 Aylık Kampanya (Önerilen) */}
              <div
                onClick={() => setSelectedPlan('yearly')}
                className={`relative rounded-2xl p-4 cursor-pointer transition-all border ${
                  selectedPlan === 'yearly'
                    ? 'bg-gradient-to-br from-[#FCF9FD] via-white to-[#F7F0FA] dark:from-[#211729] dark:via-[#1A1122] dark:to-[#2D1B36] border-[#D914C8] shadow-md shadow-[#4B075F]/15 ring-2 ring-[#D914C8]/30'
                    : 'bg-[#FCF9FD] dark:bg-[#211729]/80 border-[#E8DFEB] dark:border-[#49364F] opacity-85 hover:opacity-100'
                }`}
              >
                <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#8D49A6] to-[#D914C8] text-white text-[9.5px] font-black uppercase tracking-wider shadow-xs">
                  En Avantajlı
                </div>

                <div className="text-[11px] font-black text-[#4B075F] dark:text-[#F17AE6] uppercase">
                  9 Aylık Paket
                </div>
                <div className="text-[10px] text-[#16805D] dark:text-emerald-400 font-bold">
                  +3 Ay Hediye (12 Ay Kullanım)
                </div>

                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#241329] dark:text-white">
                    200 ₺
                  </span>
                  <span className="text-xs text-[#514458] dark:text-[#D2C5D8] font-bold">
                    / Ay
                  </span>
                </div>

                <div className="mt-1 text-[11px] font-semibold text-[#514458] dark:text-[#D2C5D8]">
                  Toplam <span className="font-bold text-[#241329] dark:text-white">1.800 ₺</span> (400 ₺ yerine)
                </div>
                <div className="mt-1 text-[10px] text-[#8D49A6] dark:text-[#F17AE6] font-bold">
                  %50 Tasarruf
                </div>
              </div>

              {/* Option 2: Aylık Paket */}
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`relative rounded-2xl p-4 cursor-pointer transition-all border ${
                  selectedPlan === 'monthly'
                    ? 'bg-gradient-to-br from-[#FCF9FD] via-white to-[#F7F0FA] dark:from-[#211729] dark:via-[#1A1122] dark:to-[#2D1B36] border-[#D914C8] shadow-md shadow-[#4B075F]/15 ring-2 ring-[#D914C8]/30'
                    : 'bg-[#FCF9FD] dark:bg-[#211729]/80 border-[#E8DFEB] dark:border-[#49364F] opacity-85 hover:opacity-100'
                }`}
              >
                <div className="text-[11px] font-black text-[#716779] dark:text-[#B5A5BD] uppercase">
                  Standart Aylık
                </div>
                <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] font-semibold">
                  Taahhütsüz esnek plan
                </div>

                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#241329] dark:text-white">
                    400 ₺
                  </span>
                  <span className="text-xs text-[#514458] dark:text-[#D2C5D8] font-bold">
                    / Ay
                  </span>
                </div>

                <div className="mt-1 text-[11px] font-semibold text-[#514458] dark:text-[#D2C5D8]">
                  Her ay yenilenir
                </div>
                <div className="mt-1 text-[10px] text-[#716779] dark:text-[#B5A5BD] font-bold">
                  İstediğin an iptal et
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-2">
              <div className="text-xs font-black text-[#241329] dark:text-[#FCF9FD] uppercase tracking-wider">
                Oxonom Plus ile Neler Kazanacaksın?
              </div>

              <div className="space-y-1.5">
                {PLUS_BENEFITS.slice(0, 3).map((b, i) => {
                  const Icon = b.icon
                  return (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[#FCF9FD] dark:bg-[#211729]/90 border border-[#E8DFEB] dark:border-[#49364F] flex items-start gap-2.5 shadow-xs"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center shrink-0 mt-0.5 border border-[#8D49A6]/20">
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#241329] dark:text-[#FCF9FD] leading-tight">
                          {b.title}
                        </div>
                        <div className="text-[10.5px] text-[#514458] dark:text-[#D2C5D8] leading-tight mt-0.5">
                          {b.desc}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-[#514458] dark:text-[#D2C5D8] text-center">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-[#F5C542] text-[#F5C542]" />
                ))}
              </div>
              <span>4.9 / 5 · 12.000+ Öğrenci & Veli Onayladı</span>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCtaClick}
                className="w-full py-3.5 px-6 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-sm tracking-wide shadow-xl shadow-[#4B075F]/30 hover:shadow-2xl hover:shadow-[#4B075F]/40 border border-white/20 transition-all cursor-pointer group flex items-center justify-center gap-2"
              >
                <Sparkles size={16} className="text-[#FCE8FA]" />
                <span>
                  {selectedPlan === 'yearly'
                    ? '9 Ay Öde 12 Ay Kullan — Detayları Gör'
                    : 'Aylık Planı İncele & 14 Gün Ücretsiz Başla'}
                </span>
                <ChevronRight size={18} strokeWidth={2.8} className="text-[#FCE8FA] group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-[10.5px] text-[#716779] dark:text-[#B5A5BD] text-center font-medium flex items-center justify-center gap-1.5 pt-0.5">
                <ShieldCheck size={13} className="text-[#16805D] dark:text-emerald-400 shrink-0" />
                <span>İlk 14 gün ücretsiz · Kredi kartı gerekmez · İstediğin an iptal et</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
