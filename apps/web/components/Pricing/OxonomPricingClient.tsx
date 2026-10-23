'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
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
  Coffee,
  GraduationCap,
  Calculator,
  HelpCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Smartphone,
  Flame,
  BadgePercent,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FaqItem {
  q: string
  a: string
}

const FAQS: FaqItem[] = [
  {
    q: '14 günlük ücretsiz deneme için kredi kartı bilgisi girmem gerekiyor mu?',
    a: 'Kesinlikle hayır! İlk 14 gün boyunca hiçbir kredi kartı, banka kartı veya ödeme bilgisi vermeden tüm Oxonom EDU özelliklerini sıfır risk ile hemen kullanmaya başlayabilirsiniz.',
  },
  {
    q: '“9 Ay Öde 12 Ay Kullan” kampanyası nasıl işliyor?',
    a: 'Eğitim-öğretim dönemi olan 9 ay için aylık sadece 200 ₺ (toplam 1.800 ₺) ödersiniz ve sistemimiz size ekstra 3 ayı (yaz tatili telafi ve hazırlık kampı dönemi dahil) tamamen hediye eder. Böylece tam 365 gün boyunca kesintisiz tam erişim kazanırsınız.',
  },
  {
    q: 'Aylık paketten 9 aylık pakete sonradan geçebilir miyim?',
    a: 'Evet, dilediğiniz zaman öğrenci panelinizden veya veli ayarlarından kampanya koşullarını kaybetmeden 9 aylık pakete yükseltme yapabilirsiniz.',
  },
  {
    q: 'Yapay Zekâ Eğitmen MEB müfredatına uygun mu?',
    a: 'Evet. Oxonom EDU yapay zekâsı MEB Talim ve Terbiye Kurulu kazanımları, zümre öğretmenlerinin soru kalıpları ve açık uçlu sınav formatlarına göre özel olarak eğitilmiştir. Yanıtlar ezberletmez, adım adım anlatır.',
  },
  {
    q: 'Aynı hesabı hem telefondan hem tabletten kullanabilir miyim?',
    a: 'Evet! Oxonom EDU web, tablet, akıllı tahta ve akıllı telefonlarla %100 uyumludur. Notlarınız, okuduğunuz kitaplar ve test sonuçlarınız tüm cihazlarınızda anlık olarak senkronize edilir.',
  },
  {
    q: 'Memnun kalmazsam iptal süreci nasıl çalışır?',
    a: 'İlk 14 gün içinde tek tıkla hiçbir soru sorulmadan deneme sürenizi sonlandırabilirsiniz. Aylık paketlerde dilediğiniz ay yenilemeyi durdurabilirsiniz.',
  },
]

export default function OxonomPricingClient() {
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly')
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const handleStartTrial = (planName: string) => {
    toast.success(`Tebrikler! ${planName} için 14 günlük ücretsiz denemeniz başlatıldı.`, {
      icon: '🎉',
      duration: 4000,
    })
  }

  return (
    <div className="min-h-screen bg-[#FCF9FD] dark:bg-[#0A0512] text-[#241329] dark:text-[#FCF9FD] font-jakarta selection:bg-[#D914C8]/30 selection:text-[#241329] dark:selection:text-white transition-colors duration-200">
      {/* ── TOP AMBIENT CONTINUOUS GLOW (NO FLICKER) ── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[380px] bg-gradient-to-b from-[#8D49A6]/15 via-[#D914C8]/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0E0617]/80 backdrop-blur-md border-b border-[#E8DFEB] dark:border-[#2D1B36]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/student/dashboard" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#4B075F] via-[#8D49A6] to-[#D914C8] p-[1.5px] shadow-md shadow-[#4B075F]/20">
              <div className="w-full h-full rounded-[14px] bg-[#1A1122] flex items-center justify-center overflow-hidden">
                <Image
                  src="/oxonom-logo-light.png"
                  alt="Oxonom EDU"
                  width={28}
                  height={28}
                  className="object-contain drop-shadow-xs"
                />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-black tracking-tight text-[#241329] dark:text-white flex items-center gap-1.5">
                <span>OXONOM</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8D49A6] to-[#D914C8]">
                  EDU
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FCE8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#F17AE6] border border-[#D914C8]/25">
                  PLUS
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link
              href="/student/courses"
              className="text-xs sm:text-sm font-bold text-[#514458] dark:text-[#D2C5D8] hover:text-[#4B075F] dark:hover:text-[#F17AE6] transition-colors px-3 py-2 rounded-xl hover:bg-[#F7F0FA] dark:hover:bg-[#1F1429]"
            >
              Derslerime Dön
            </Link>

            <button
              type="button"
              onClick={() => handleStartTrial('14 Günlük Ücretsiz Deneme')}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-brand-gradient text-white text-xs sm:text-sm font-black shadow-md shadow-[#4B075F]/25 hover:opacity-95 transition-all cursor-pointer"
            >
              Ücretsiz Dene
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION WITH 3D CAMPAIGN BANNER ── */}
      <section className="pt-10 pb-8 sm:pt-16 sm:pb-12 px-4 sm:px-6 max-w-6xl mx-auto text-center space-y-6">
        {/* Risk-free Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FCF9FD] dark:bg-[#211729] border border-[#D914C8]/40 shadow-xs text-xs font-black text-[#8D49A6] dark:text-[#F17AE6]">
          <Gift size={14} className="text-[#D914C8]" />
          <span>KREDİ KARTI GEREKMEDEN İLK 14 GÜN TAMAMEN ÜCRETSİZ</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#241329] dark:text-white leading-[1.15]">
            Özel Ders Kalitesinde Eğitim,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8] dark:from-[#F17AE6] dark:via-[#C58ADB] dark:to-white">
              Her Öğrencinin Cebinde.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#514458] dark:text-[#D2C5D8] leading-relaxed max-w-2xl mx-auto font-medium">
            312 MEB kitabı, 7/24 kişisel yapay zekâ soru koçu, okul yazılı sınav tahminleri ve
            etkileşimli testler. Notlarını yükselt, geleceğine güvenle adım at.
          </p>
        </div>

        {/* ── 3D HIGHLIGHT CAMPAIGN CARD (9 AY ÖDE 12 AY KULLAN) ── */}
        <div className="pt-4 max-w-3xl mx-auto">
          <div className="relative rounded-[32px] p-[2px] bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8] shadow-[0_25px_60px_-15px_rgba(75,7,95,0.35)]">
            <div className="rounded-[30px] bg-gradient-to-br from-[#FCF9FD] via-white to-[#F7F0FA] dark:from-[#211729] dark:via-[#1A1122] dark:to-[#2B1736] p-6 sm:p-8 text-left border border-[#E8DFEB]/80 dark:border-[#49364F]/50 relative overflow-hidden">
              {/* Background ambient sheen */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#D914C8]/15 via-[#8D49A6]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-3 max-w-xl">
                  {/* 3D Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#4B075F] to-[#8D49A6] text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                    <Flame size={14} className="text-amber-300" />
                    <span>Büyük Yıl Kampanyası</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-[#241329] dark:text-white tracking-tight">
                    9 Ay Öde, 12 Ay Kesintisiz Kullan!
                  </h2>

                  <p className="text-xs sm:text-sm text-[#514458] dark:text-[#D2C5D8] font-medium leading-relaxed">
                    Okul dönemi boyunca ve yaz tatilinde kesintisiz tam erişim! Toplam{' '}
                    <strong className="text-[#4B075F] dark:text-[#F17AE6]">3 ay ücretsiz hediye</strong>{' '}
                    ediyoruz. 400 ₺ yerine sadece{' '}
                    <strong className="text-[#241329] dark:text-white">200 ₺ / Ay</strong> ile yılda{' '}
                    <strong className="text-[#16805D] dark:text-emerald-400">2.400 ₺ tasarruf</strong> edin.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-bold text-[#241329] dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-[#16805D] dark:text-emerald-400" />
                      İlk 14 Gün Ücretsiz
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-[#16805D] dark:text-emerald-400" />
                      Kredi Kartı Gerekmez
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-[#16805D] dark:text-emerald-400" />
                      İstediğin An İptal
                    </span>
                  </div>
                </div>

                {/* Price Display & Quick CTA */}
                <div className="shrink-0 sm:text-right space-y-3 p-4.5 rounded-2xl bg-[#FCF9FD] dark:bg-[#1A1122]/90 border border-[#E8DFEB] dark:border-[#49364F]">
                  <div className="text-[11px] font-black uppercase text-[#716779] dark:text-[#B5A5BD] tracking-wider">
                    Özel Kampanya Fiyatı
                  </div>

                  <div className="flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
                    <div className="text-xs sm:text-sm font-bold text-[#716779] dark:text-[#B5A5BD] line-through decoration-rose-500">
                      400 ₺ / Ay
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8] dark:from-[#F17AE6] dark:via-[#C58ADB] dark:to-white">
                      200 ₺
                    </div>
                    <div className="text-[11px] font-bold text-[#514458] dark:text-[#D2C5D8]">
                      / Ay (Toplam 1.800 ₺)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartTrial('9 Aylık Süper Paket (12 Ay Kullanım)')}
                    className="w-full py-3 px-5 rounded-xl bg-brand-gradient text-white text-xs font-black shadow-lg shadow-[#4B075F]/30 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>14 Gün Ücretsiz Başla</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ECONOMIC REALITY COMPARISON (GÜNÜMÜZ ŞARTLARINDA NE KADAR UCUZ?) ── */}
      <section className="py-10 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-[#241329] dark:text-white tracking-tight">
            Günümüz Şartlarında Ne Kadar Ucuz?
          </h2>
          <p className="text-xs sm:text-sm text-[#514458] dark:text-[#D2C5D8] max-w-xl mx-auto">
            Geleneksel eğitim masrafları tırmanırken Oxonom EDU aile bütçenizi korur, öğrencinize sınırsız imkan tanır.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Kahve Fiyatı */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#FCE8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#F17AE6] flex items-center justify-center shrink-0">
              <Coffee size={20} />
            </div>
            <h3 className="text-base font-black text-[#241329] dark:text-white">
              Günde Sadece 4.9 ₺
            </h3>
            <p className="text-xs text-[#514458] dark:text-[#D2C5D8] leading-relaxed">
              Bir fincan kahvenin üçte biri maliyetine, çocuğunuza her gün 7/24 özel ders ve MEB kitap desteği sağlayın.
            </p>
          </div>

          {/* Card 2: 1 Saatlik Özel Ders vs Tüm Yıl */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#FCE8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#F17AE6] flex items-center justify-center shrink-0">
              <GraduationCap size={20} />
            </div>
            <h3 className="text-base font-black text-[#241329] dark:text-white">
              1 Saat Özel Ders = Tüm Yıl Oxonom
            </h3>
            <p className="text-xs text-[#514458] dark:text-[#D2C5D8] leading-relaxed">
              Günümüzde tek bir saatlik özel ders 1.500 ₺ - 2.500 ₺ iken, Oxonom EDU ile 12 ay boyunca sınırsız yapay zekâ eğitimi 1.800 ₺.
            </p>
          </div>

          {/* Card 3: Test Kitabı Tasarrufu */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#FCE8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#F17AE6] flex items-center justify-center shrink-0">
              <BookOpen size={20} />
            </div>
            <h3 className="text-base font-black text-[#241329] dark:text-white">
              Kitap Masraflarına Son
            </h3>
            <p className="text-xs text-[#514458] dark:text-[#D2C5D8] leading-relaxed">
              Dönemlik 5-6 farklı soru bankası almak 3.000 ₺&apos;yi aşıyor. Oxonom&apos;da 312 MEB kitabı ve interaktif soru bankası dahil.
            </p>
          </div>

          {/* Card 4: Zaman & Ulaşım Tasarrufu */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#FCE8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#F17AE6] flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <h3 className="text-base font-black text-[#241329] dark:text-white">
              Trafikte Sıfır Kayıp
            </h3>
            <p className="text-xs text-[#514458] dark:text-[#D2C5D8] leading-relaxed">
              Dershane yollarında vakit kaybetmeyin. Takıldığınız soruyu anında sisteme yükleyin, çözüm birkaç saniye içinde ekranınızda olsun.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2 PLANS SIDE-BY-SIDE (AYLIK vs 9 AYLIK SÜPER PAKET) ── */}
      <section className="py-10 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#F17AE6] text-xs font-black">
            <BadgePercent size={14} />
            <span>ŞEFFAF & TAAHHÜTSÜZ FİYATLANDIRMA</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-[#241329] dark:text-white tracking-tight">
            İhtiyacınıza Uygun Paketi Seçin
          </h2>

          <p className="text-xs sm:text-sm text-[#514458] dark:text-[#D2C5D8] max-w-lg mx-auto">
            Her iki pakette de ilk 14 gün ücretsizdir. Kredi kartı gerekmez, risk almadan deneyin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* ── PLAN 1: AYLIK STANDART PLAN ── */}
          <div className="rounded-[28px] p-6 sm:p-8 bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-black uppercase text-[#716779] dark:text-[#B5A5BD] tracking-wider">
                  Esnek & Taahhütsüz
                </span>
                <h3 className="text-2xl font-black text-[#241329] dark:text-white mt-1">
                  Aylık Paket
                </h3>
                <p className="text-xs text-[#514458] dark:text-[#D2C5D8] mt-1 font-medium">
                  Aylık periyotta ödeme yapmak isteyen öğrenciler ve veliler için.
                </p>
              </div>

              {/* Price */}
              <div className="pt-2 pb-1 border-b border-[#E8DFEB] dark:border-[#2D1B36]">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-[#241329] dark:text-white">
                    400 ₺
                  </span>
                  <span className="text-xs font-bold text-[#514458] dark:text-[#D2C5D8]">
                    / Ay
                  </span>
                </div>
                <div className="text-[11px] text-[#716779] dark:text-[#B5A5BD] mt-1 font-semibold">
                  Aylık yenilenir · Dilediğin an tek tıkla iptal et
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-black text-[#241329] dark:text-white uppercase tracking-wider">
                  Paket İçeriği:
                </div>
                <ul className="space-y-2.5 text-xs text-[#514458] dark:text-[#D2C5D8]">
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#16805D] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>14 Gün Ücretsiz Deneme</strong> (Kredi kartı gerekmez)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#16805D] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>312 MEB Ders Kitabı</strong> ve etkileşimli flipbook</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#16805D] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Temel Yapay Zekâ Soru Çözümü (Günlük 20 soru)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#16805D] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Konu Anlatım ve Çözüm Videoları</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#16805D] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Standart Haftalık Kazanım Testleri</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#16805D] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Web, Tablet ve Mobil Erişim</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStartTrial('Aylık Paket')}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#F7F0FA] hover:bg-[#F0D8FA] dark:bg-[#251830] dark:hover:bg-[#350444] text-[#4B075F] dark:text-[#F17AE6] font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer border border-[#E8DFEB] dark:border-[#49364F] flex items-center justify-center gap-2"
            >
              <span>Aylık Planla 14 Gün Ücretsiz Başla</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* ── PLAN 2: 9 AYLIK SÜPER PAKET (12 AY KULLANIM - 3D SHEEN & ÖNERİLEN) ── */}
          <div className="relative rounded-[32px] p-[2.5px] bg-gradient-to-br from-[#4B075F] via-[#8D49A6] to-[#D914C8] shadow-[0_25px_60px_-15px_rgba(217,20,200,0.35)] flex flex-col justify-between">
            {/* Top 3D Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 z-20">
              <Crown size={13} className="fill-white" />
              <span>EN ÇOK TERCİH EDİLEN & %50 İNDİRİM</span>
            </div>

            <div className="rounded-[30px] bg-gradient-to-b from-[#FCF9FD] via-white to-[#F7F0FA] dark:from-[#211729] dark:via-[#1A1122] dark:to-[#2A1633] p-6 sm:p-8 flex flex-col justify-between space-y-6 h-full relative overflow-hidden">
              {/* Subtle ambient light */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D914C8]/15 via-[#8D49A6]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-[#8D49A6] dark:text-[#F17AE6] tracking-wider">
                    <Sparkles size={13} />
                    <span>9 Ay Öde 12 Ay Kullan</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#241329] dark:text-white mt-1">
                    9 Aylık Süper Paket
                  </h3>
                  <p className="text-xs text-[#514458] dark:text-[#D2C5D8] mt-1 font-medium">
                    12 ay boyunca kesintisiz tam erişim. 3 ay yaz tatili kampı tamamen hediye!
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 pb-1 border-b border-[#E8DFEB] dark:border-[#3A2845]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-extrabold text-[#716779] dark:text-[#B5A5BD] line-through decoration-rose-500">
                      400 ₺
                    </span>
                    <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8] dark:from-[#F17AE6] dark:via-[#C58ADB] dark:to-white">
                      200 ₺
                    </span>
                    <span className="text-xs font-bold text-[#514458] dark:text-[#D2C5D8]">
                      / Ay
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-1.5 font-bold">
                    <span className="text-[#241329] dark:text-white">
                      Toplam 1.800 ₺ (Yıllık 2.400 ₺ Tasarruf)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#FCE8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#F17AE6] text-[10px]">
                      Günde 4.9 ₺
                    </span>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-black text-[#241329] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#D914C8]" />
                    <span>Aylık Paketteki Her Şey, Artı Olarak:</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[#241329] dark:text-[#FCF9FD] font-medium">
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#8D49A6] to-[#D914C8] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span>
                        <strong>12 Ay Boyunca Kesintisiz Tam Erişim:</strong> 9 ay öde, 3 ay yaz dönemi hediye!
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#8D49A6] to-[#D914C8] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span>
                        <strong>Sınırsız 7/24 Yapay Zekâ Eğitmen:</strong> Soru sınırı olmadan adım adım anlatım.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#8D49A6] to-[#D914C8] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span>
                        <strong>MEB Zümre Sınav Tahminleri:</strong> Yazılı sınavlar için birebir açık uçlu soru havuzu.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#8D49A6] to-[#D914C8] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span>
                        <strong>Çevrimdışı Flipbook Okuma Modu:</strong> İnternet olmadan da tüm ders kitapları hazır.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#8D49A6] to-[#D914C8] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span>
                        <strong>Oxonom Game Studio:</strong> Pedagojik eğitici zeka oyunlarına sınırsız katılım.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#8D49A6] to-[#D914C8] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span>
                        <strong>Veli Gelişim & Başarı Analitiği:</strong> Haftalık ilerleme ve eksik konu raporları.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Primary CTA */}
              <div className="space-y-2 pt-2 relative z-10">
                <button
                  type="button"
                  onClick={() => handleStartTrial('9 Aylık Süper Paket (12 Ay Kullanım)')}
                  className="w-full py-4 px-6 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-sm tracking-wide shadow-xl shadow-[#4B075F]/35 transition-all cursor-pointer flex items-center justify-center gap-2 group border border-white/20"
                >
                  <Sparkles size={16} className="text-[#FCE8FA]" />
                  <span>12 Ay Avantajıyla 14 Gün Ücretsiz Başla</span>
                  <ChevronRight size={18} strokeWidth={2.8} className="text-[#FCE8FA] group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="text-[11px] text-[#716779] dark:text-[#B5A5BD] text-center font-semibold flex items-center justify-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#16805D] dark:text-emerald-400" />
                  <span>İlk 14 gün kredi kartı gerekmez · 0 Risk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY OXONOM EDU? PEDAGOGICAL BENEFITS ── */}
      <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="p-8 sm:p-12 rounded-[32px] bg-gradient-to-br from-white via-[#FCF9FD] to-[#F7F0FA] dark:from-[#1A1122] dark:via-[#140D1D] dark:to-[#251830] border border-[#E8DFEB] dark:border-[#3A2845] space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-[#241329] dark:text-white tracking-tight">
              Öğrenciler Neden Oxonom EDU Kullanmalı?
            </h2>
            <p className="text-xs sm:text-sm text-[#514458] dark:text-[#D2C5D8]">
              Klasik ezberci sistemler yerine, öğrencinin hızına uyum sağlayan yeni nesil öğrenme platformu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#3A2845] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center font-black">
                🧠
              </div>
              <h3 className="text-sm font-black text-[#241329] dark:text-white">
                Kişiselleştirilmiş Öğrenme Hızı
              </h3>
              <p className="text-xs text-[#514458] dark:text-[#D2C5D8] leading-relaxed">
                Her öğrencinin anlama süresi farklıdır. Yapay zekâ, öğrencinin takıldığı yerleri tespit eder ve seviyeye uygun ek alıştırmalar sunar.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#3A2845] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center font-black">
                📈
              </div>
              <h3 className="text-sm font-black text-[#241329] dark:text-white">
                Okul Yazılılarında %40+ Başarı Artışı
              </h3>
              <p className="text-xs text-[#514458] dark:text-[#D2C5D8] leading-relaxed">
                MEB zümre öğretmenleri tarafından hazırlanan sınav simülasyonları ile öğrenciler okul sınavlarından önce birebir provasını yapar.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#3A2845] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center font-black">
                🎒
              </div>
              <h3 className="text-sm font-black text-[#241329] dark:text-white">
                Sırt Çantası Hafifliği
              </h3>
              <p className="text-xs text-[#514458] dark:text-[#D2C5D8] leading-relaxed">
                Onlarca ağır ders kitabını taşımaya gerek yok. Tüm MEB müfredatı interaktif dijital flipbook formatında tablette veya telefonda.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#3A2845] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center font-black">
                🎮
              </div>
              <h3 className="text-sm font-black text-[#241329] dark:text-white">
                Oyunlaştırılmış Motivasyon
              </h3>
              <p className="text-xs text-[#514458] dark:text-[#D2C5D8] leading-relaxed">
                Oxonom Game Studio sayesinde öğrenciler matematik ve Türkçe kavramlarını eğlenceli mini oyunlarla pekiştirir, sıkılmadan öğrenir.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#3A2845] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center font-black">
                🔒
              </div>
              <h3 className="text-sm font-black text-[#241329] dark:text-white">
                %100 Güvenli & Reklamsız
              </h3>
              <p className="text-xs text-[#514458] dark:text-[#D2C5D8] leading-relaxed">
                Hiçbir üçüncü taraf reklam, dikkat dağıtıcı banner veya uygunsuz içerik barındırmaz. Sadece ve sadece eğitime odaklanma alanı.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#3A2845] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center font-black">
                📊
              </div>
              <h3 className="text-sm font-black text-[#241329] dark:text-white">
                Şeffaf Veli Gelişim Paneli
              </h3>
              <p className="text-xs text-[#514458] dark:text-[#D2C5D8] leading-relaxed">
                Anne ve babalar çocuklarının hangi derste ne kadar ilerlediğini, çözülen soru sayısını ve başarı oranlarını anlık olarak takip edebilir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section className="py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-[#241329] dark:text-white tracking-tight">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-xs sm:text-sm text-[#514458] dark:text-[#D2C5D8]">
            Aklınıza takılan soruların yanıtları burada.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index
            return (
              <div
                key={index}
                className="rounded-2xl bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-black text-sm text-[#241329] dark:text-white cursor-pointer hover:bg-[#FCF9FD] dark:hover:bg-[#211729]"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle size={16} className="text-[#8D49A6] dark:text-[#F17AE6] shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronRight
                    size={17}
                    className={`shrink-0 text-[#716779] transition-transform duration-200 ${
                      isOpen ? 'rotate-90 text-[#4B075F] dark:text-[#F17AE6]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-[#514458] dark:text-[#D2C5D8] leading-relaxed border-t border-[#E8DFEB]/60 dark:border-[#2D1B36] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── BOTTOM CTA BANNER ── */}
      <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="relative rounded-[32px] p-[2px] bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8] shadow-[0_20px_50px_rgba(75,7,95,0.25)]">
          <div className="rounded-[30px] bg-gradient-to-br from-[#241329] via-[#1A1122] to-[#2B1736] p-8 sm:p-12 text-center text-white space-y-5 relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#FCE8FA]">
              <Sparkles size={13} />
              <span>Sıfır Risk · Hemen Başlayın</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight max-w-2xl mx-auto">
              Başarınızı Şansa Bırakmayın. İlk 14 Gün Kredi Kartsız Ücretsiz Deneyin!
            </h2>

            <p className="text-xs sm:text-sm text-[#D2C5D8] max-w-xl mx-auto">
              Oxonom EDU ile okulda, evde ve sınavlarda fark yaratın. 9 Ay Öde 12 Ay Kullan kampanyasıyla en yüksek tasarruftan faydalanın.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleStartTrial('9 Aylık Süper Paket (12 Ay Kullanım)')}
                className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-sm tracking-wide shadow-xl shadow-[#4B075F]/40 transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/20"
              >
                <span>Hemen 14 Gün Ücretsiz Başla</span>
                <ChevronRight size={18} strokeWidth={2.8} />
              </button>

              <Link
                href="/student/courses"
                className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all border border-white/15 text-center"
              >
                Dersleri İncele
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#E8DFEB] dark:border-[#2D1B36] py-8 px-4 text-center text-xs text-[#716779] dark:text-[#B5A5BD]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#241329] dark:text-white">Oxonom Education Inc.</span>
            <span>•</span>
            <span>Tüm Hakları Saklıdır © {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-semibold">
            <Link href="/privacy" className="hover:text-[#4B075F] dark:hover:text-[#F17AE6]">Gizlilik Politikası</Link>
            <Link href="/terms" className="hover:text-[#4B075F] dark:hover:text-[#F17AE6]">Kullanım Koşulları</Link>
            <Link href="/contact" className="hover:text-[#4B075F] dark:hover:text-[#F17AE6]">İletişim & Destek</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
