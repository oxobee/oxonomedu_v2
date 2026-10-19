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
  Flame,
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
          className="fixed inset-0 bg-[#060A14]/75 backdrop-blur-md transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg my-auto rounded-[32px] overflow-hidden bg-gradient-to-b from-white via-white to-blue-50/40 dark:from-[#111A2E] dark:via-[#0F172A] dark:to-[#090F1D] border border-amber-200/60 dark:border-amber-500/30 shadow-[0_24px_70px_rgba(29,119,255,0.22)] z-10 flex flex-col max-h-[90vh]"
        >
          {/* Subtle Ambient Continuous Radial Glow (NO blinking, smooth gradient) */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-amber-400/25 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-blue-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors z-20 cursor-pointer shadow-xs"
            aria-label="Kapat"
          >
            <X size={17} />
          </button>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-5 sm:p-7 space-y-5 custom-scrollbar">
            {/* Header Badge */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-400/40 text-amber-700 dark:text-amber-300 text-xs font-black tracking-wide">
                <Sparkles size={13} className="text-amber-500" />
                <span>SINIRLI SÜREYE ÖZEL %78 İNDİRİM</span>
              </div>

              {/* Title & Crown */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                  <Crown size={26} className="fill-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    Oxonom Plus Premium
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    Okulda ve sınavda zirveye oynayan öğrenciler için
                  </p>
                </div>
              </div>
            </div>

            {/* Price Box with Continuous Gradient Border */}
            <div className="relative rounded-3xl p-[2px] bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 shadow-md">
              <div className="rounded-[22px] bg-white dark:bg-[#121B32] p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                    Özel Dönemlik Üyelik
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm sm:text-base font-extrabold text-slate-400 dark:text-slate-500 line-through">
                      899 ₺
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 dark:from-amber-400 dark:to-yellow-300">
                      199 ₺
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      / Dönemlik
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                    Günde sadece 1.1 ₺ · İstediğin an iptal et
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="inline-block px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black border border-amber-500/20">
                    700 ₺ Tasarruf
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-2.5">
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Plus ile Neler Kazanacaksın?
              </div>

              <div className="space-y-2">
                {PLUS_BENEFITS.map((b, i) => {
                  const Icon = b.icon
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-slate-50/80 dark:bg-[#141F38]/80 border border-slate-100 dark:border-blue-900/30 flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#F0D8FA] dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {b.title}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                          {b.desc}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 text-center">
              <div className="flex text-amber-400">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
              <span>4.9 / 5 · 12.000+ Öğrenci & Veli Onayladı</span>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCtaClick}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-sm tracking-wide shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Hemen Plus&apos;a Geç — 199 ₺</span>
                <ChevronRight size={17} strokeWidth={3} />
              </button>

              <div className="text-[10px] text-slate-400 text-center font-medium">
                Kredi kartı, banka kartı ve okul veli faturası ile 3D Secure güvenli ödeme
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
