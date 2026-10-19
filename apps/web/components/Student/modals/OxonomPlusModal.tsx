'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
} from 'lucide-react'
import toast from 'react-hot-toast'

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
  if (!isOpen) return null

  const handleCtaClick = () => {
    toast.success('Harika seçim! Oxonom Plus erken erişim talebiniz alındı.', {
      duration: 3500,
      icon: '💎',
    })
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
          <div className="overflow-y-auto p-5 sm:p-7 space-y-5 custom-scrollbar">
            {/* Header Badge */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE8FA] dark:bg-[#350444]/60 border border-[#D914C8]/30 text-[#8D49A6] dark:text-[#F17AE6] text-xs font-black tracking-wide shadow-xs">
                <Sparkles size={13} className="text-[#D914C8] dark:text-[#F17AE6]" />
                <span>SINIRLI SÜREYE ÖZEL %78 İNDİRİM</span>
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

            {/* Price Box with Continuous Brand Gradient Border */}
            <div className="relative rounded-[26px] p-[1.5px] bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8] shadow-md shadow-[#4B075F]/10">
              <div className="rounded-[24px] bg-gradient-to-br from-[#FCF9FD] via-white to-[#F7F0FA] dark:from-[#211729] dark:via-[#1A1122] dark:to-[#251830] p-4.5 sm:p-5 flex items-center justify-between gap-4 border border-[#E8DFEB]/60 dark:border-[#49364F]/50">
                <div>
                  <div className="text-[11px] font-black text-[#716779] dark:text-[#B5A5BD] uppercase tracking-wider">
                    Özel Dönemlik Üyelik
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm sm:text-base font-extrabold text-[#716779]/80 dark:text-[#B5A5BD]/70 line-through decoration-rose-500/70">
                      899 ₺
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8] dark:from-[#F17AE6] dark:via-[#C58ADB] dark:to-white">
                      199 ₺
                    </span>
                    <span className="text-xs font-bold text-[#514458] dark:text-[#D2C5D8]">
                      / Dönemlik
                    </span>
                  </div>
                  <div className="text-[10.5px] text-[#16805D] dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                    <Check size={12} className="stroke-[3]" />
                    <span>Günde sadece 1.1 ₺ · İstediğin an iptal et</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#FCE8FA] dark:bg-[#350444] text-[#B90FAB] dark:text-[#F17AE6] text-xs font-black border border-[#D914C8]/30 shadow-xs">
                    700 ₺ Tasarruf
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-2.5">
              <div className="text-xs font-black text-[#241329] dark:text-[#FCF9FD] uppercase tracking-wider">
                Plus ile Neler Kazanacaksın?
              </div>

              <div className="space-y-2">
                {PLUS_BENEFITS.map((b, i) => {
                  const Icon = b.icon
                  return (
                    <div
                      key={i}
                      className="p-3 sm:p-3.5 rounded-2xl bg-[#FCF9FD] hover:bg-[#F7F0FA] dark:bg-[#211729]/90 dark:hover:bg-[#2D2035] border border-[#E8DFEB] dark:border-[#49364F] flex items-start gap-3 transition-colors shadow-xs"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center shrink-0 mt-0.5 border border-[#8D49A6]/20 shadow-xs">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#241329] dark:text-[#FCF9FD] leading-tight">
                          {b.title}
                        </div>
                        <div className="text-[10.5px] text-[#514458] dark:text-[#D2C5D8] leading-relaxed mt-0.5">
                          {b.desc}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 py-1 text-[11px] font-bold text-[#514458] dark:text-[#D2C5D8] text-center">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-[#F5C542] text-[#F5C542]" />
                ))}
              </div>
              <span>4.9 / 5 · 12.000+ Öğrenci & Veli Onayladı</span>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCtaClick}
                className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-sm sm:text-base tracking-wide shadow-xl shadow-[#4B075F]/30 hover:shadow-2xl hover:shadow-[#4B075F]/40 border border-white/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Sparkles size={16} className="text-[#FCE8FA] group-hover:rotate-12 transition-transform" />
                <span>Hemen Plus&apos;a Geç — 199 ₺</span>
                <ChevronRight size={18} strokeWidth={2.8} className="text-[#FCE8FA] group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-[10.5px] text-[#716779] dark:text-[#B5A5BD] text-center font-medium flex items-center justify-center gap-1.5 pt-0.5">
                <ShieldCheck size={13} className="text-[#16805D] dark:text-emerald-400 shrink-0" />
                <span>Kredi kartı, banka kartı ve okul veli faturası ile 3D Secure güvenli ödeme</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
