'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Crown,
  Sparkles,
  Check,
  Zap,
  ShieldCheck,
  Star,
  BookOpen,
  ChevronRight,
  Gift,
  Coffee,
  GraduationCap,
  Clock,
  ArrowRight,
  CheckCircle2,
  BadgePercent,
  Flame,
  HelpCircle,
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
    q: 'Aylık paket ile 9 aylık paket arasında özellik farkı var mı?',
    a: 'Hayır, her iki pakette de tüm özellikler (312 MEB kitabı, 7/24 sınırsız yapay zekâ, sınav tahminleri, oyunlar ve veli paneli) eksiksiz olarak sunulur. 9 aylık paketin tek avantajı %50 indirim sağlaması ve 3 ayı hediye ederek 12 ay kullanım sunmasıdır.',
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

// Common 10 Features that are IDENTICAL for both Monthly and Yearly packages
const FULL_PACKAGE_FEATURES = [
  {
    title: 'İlk 14 Gün Ücretsiz Deneme',
    desc: 'Kredi kartı gerekmez, sıfır risk ile hemen başla',
  },
  {
    title: '312 MEB Ders Kitabı & Flipbook',
    desc: 'Tüm sınıf düzeylerinde resmî MEB e-kitapları',
  },
  {
    title: 'Sınırsız 7/24 Yapay Zekâ Eğitmen',
    desc: 'Fotoğraf çek veya soruyu yaz, anında adım adım çöz',
  },
  {
    title: 'MEB Zümre Sınav Tahminleri',
    desc: 'Okul yazılıları için birebir açık uçlu soru havuzu',
  },
  {
    title: 'Çevrimdışı Flipbook Okuma Modu',
    desc: 'İnternet bağlantısı olmadan da kitapları incele',
  },
  {
    title: 'Konu Anlatım & Çözüm Videoları',
    desc: 'Uzman öğretmenlerden ayrıntılı konu izahatları',
  },
  {
    title: 'Oxonom Game Studio Zeka Oyunları',
    desc: 'Pedagojik eğitici oyunlarla eğlenerek öğren',
  },
  {
    title: 'Kişisel Dijital Defterim & Notlar',
    desc: 'Kitap sayfalarına doğrudan renkli notlar bağla',
  },
  {
    title: 'Veli Gelişim & Başarı Analitiği',
    desc: 'Haftalık ilerleme ve başarı takip karnesi',
  },
  {
    title: 'Web, Tablet ve Telefonla %100 Uyum',
    desc: 'Tüm cihazlarda kesintisiz otomatik senkronizasyon',
  },
]

export default function OxonomPricingClient() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const handleStartTrial = (planName: string) => {
    toast.success(`Tebrikler! ${planName} için 14 günlük ücretsiz denemeniz başlatıldı.`, {
      icon: '🎉',
      duration: 4000,
    })
  }

  const scrollToPlans = () => {
    const el = document.getElementById('pricing-plans-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-[#FCF9FD] dark:bg-[#0A0512] text-[#241329] dark:text-[#FCF9FD] font-jakarta selection:bg-[#D914C8]/30 selection:text-[#241329] dark:selection:text-white transition-colors duration-200">
      {/* ── TOP AMBIENT CONTINUOUS GLOW (NO FLICKER) ── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-[#8D49A6]/20 via-[#D914C8]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ── 1. HERO SECTION WITH PROMINENT "14 GÜN ÜCRETSİZ DENE" GRAPHIC ── */}
      <section className="pt-6 pb-8 sm:pt-10 sm:pb-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="rounded-[32px] p-6 sm:p-10 lg:p-12 bg-white/70 dark:bg-[#1A1122]/70 backdrop-blur-md border border-[#E8DFEB] dark:border-[#3A2845] shadow-[0_15px_45px_rgba(75,7,95,0.06)] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Subtle decorative glow behind mascot */}
          <div className="absolute top-1/2 -right-16 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#8D49A6]/25 via-[#D914C8]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Left Hero Content */}
          <div className="space-y-4 sm:space-y-5 max-w-xl text-center lg:text-left z-10">
            {/* Risk-free Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCE8FA] dark:bg-[#350444]/60 border border-[#D914C8]/35 text-[#8D49A6] dark:text-[#F17AE6] text-xs font-black shadow-xs">
              <Gift size={15} className="text-[#D914C8] dark:text-[#F17AE6]" />
              <span>KREDİ KARTI GEREKMEDEN İLK 14 GÜN TAMAMEN ÜCRETSİZ</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#241329] dark:text-white leading-[1.15]">
              Özel Ders Kalitesinde Eğitim,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8] dark:from-[#F17AE6] dark:via-[#C58ADB] dark:to-white">
                Her Öğrencinin Cebinde.
              </span>
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#514458] dark:text-[#D2C5D8] leading-relaxed font-medium">
              312 MEB ders kitabı, 7/24 kişisel yapay zekâ eğitmen desteği, yazılı sınav tahminleri ve
              eğitsel oyunlar tek platformda. İlk 14 gün hiçbir ücret ödemeden ve kart gerekmeden deneyin.
            </p>

            {/* Trust Checkmarks */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-1 text-xs font-bold text-[#241329] dark:text-white">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#16805D] dark:text-emerald-400" />
                <span>Kart Bilgisi Gerekmez</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#16805D] dark:text-emerald-400" />
                <span>Anında Aktivasyon</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#16805D] dark:text-emerald-400" />
                <span>İstediğin An İptal</span>
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <button
                type="button"
                onClick={() => handleStartTrial('14 Günlük Ücretsiz Deneme')}
                className="w-full sm:w-auto py-3.5 px-7 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-[#4B075F]/30 hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/20"
              >
                <Sparkles size={16} className="text-[#FCE8FA]" />
                <span>14 Gün Ücretsiz Başla</span>
                <ChevronRight size={17} strokeWidth={2.8} />
              </button>

              <button
                type="button"
                onClick={scrollToPlans}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-[#FCF9FD] dark:bg-[#251830] hover:bg-[#F0D8FA] dark:hover:bg-[#350444] text-[#4B075F] dark:text-[#F17AE6] font-bold text-xs sm:text-sm border border-[#E8DFEB] dark:border-[#49364F] transition-all cursor-pointer text-center"
              >
                Planları ve Fiyatları İncele
              </button>
            </div>
          </div>

          {/* Right Hero Visual: 3D Mascot "14 Gün Ücretsiz Deneyin" Graphic */}
          <div className="relative shrink-0 flex items-center justify-center z-10">
            <div className="relative w-72 sm:w-84 md:w-96 lg:w-[420px] max-w-full">
              <Image
                src="/14-gun-ucretsiz-dene.png"
                alt="14 Gün Ücretsiz Deneyin - Oxonom EDU"
                width={500}
                height={350}
                priority
                className="w-full h-auto object-contain drop-shadow-[0_20px_45px_rgba(75,7,95,0.35)] select-none transition-transform hover:scale-[1.02] duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. HIGH-IMPACT 3D CAMPAIGN CARD: 9 AY ÖDE 12 AY KULLAN ── */}
      <section className="py-6 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="relative rounded-[36px] p-[2.5px] bg-gradient-to-r from-[#D914C8] via-[#8D49A6] to-[#4B075F] shadow-[0_28px_80px_-15px_rgba(217,20,200,0.45)]">
          <div className="rounded-[34px] bg-gradient-to-br from-[#2D123B] via-[#1A0C22] to-[#360945] p-6 sm:p-9 lg:p-10 text-white relative overflow-hidden border border-white/15">
            {/* Ambient Background Sheen */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#D914C8]/30 via-[#8D49A6]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#4B075F]/40 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              {/* Left Info Column */}
              <div className="space-y-4 max-w-xl">
                {/* 3D Metallic Badge */}
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D914C8] via-[#8D49A6] to-[#4B075F] text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-[#D914C8]/30 border border-white/30">
                  <Flame size={14} className="text-amber-300 fill-amber-300" />
                  <span>Büyük Yıl Kampanyası — %50 İndirim & 3 Ay Hediye</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  9 Ay Öde, 12 Ay Kesintisiz Kullan!
                </h2>

                <p className="text-xs sm:text-sm text-[#FCF9FD]/90 font-medium leading-relaxed">
                  Okul dönemi boyunca ve yaz tatilinde kesintisiz tam erişim! Toplam{' '}
                  <strong className="text-[#F17AE6] font-black">3 ay ücretsiz hediye</strong> ediyoruz.{' '}
                  400 ₺ yerine sadece{' '}
                  <strong className="text-white font-black">200 ₺ / Ay</strong> ile yılda{' '}
                  <strong className="text-emerald-300 font-black">2.400 ₺ tasarruf</strong> edin.
                </p>

                {/* Micro Perks Strip */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-bold text-white/95">
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/15">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>İlk 14 Gün Ücretsiz</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/15">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>Kredi Kartı Gerekmez</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/15">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>İstediğin An İptal</span>
                  </span>
                </div>
              </div>

              {/* Right 3D Price Showcase Box */}
              <div className="shrink-0 p-5 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4 text-center sm:text-right min-w-[260px]">
                <div className="text-[11px] font-black uppercase text-[#FCE8FA] tracking-wider text-center sm:text-right">
                  Özel Kampanya Fiyatı
                </div>

                <div className="flex sm:flex-col items-baseline justify-center sm:items-end gap-2 sm:gap-0">
                  <div className="text-sm sm:text-base font-extrabold text-white/60 line-through decoration-rose-400 decoration-2">
                    400 ₺ / Ay
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FCE8FA] to-[#F17AE6] drop-shadow-sm">
                    200 ₺
                  </div>
                  <div className="text-xs font-bold text-white/80">
                    / Ay (Toplam 1.800 ₺)
                  </div>
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10.5px] font-black">
                  Günde Sadece 4.9 ₺ · %50 Tasarruf
                </div>

                <button
                  type="button"
                  onClick={() => handleStartTrial('9 Aylık Süper Paket (12 Ay Kullanım)')}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:opacity-95 text-white font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-[#D914C8]/40 transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/30"
                >
                  <span>14 Gün Ücretsiz Başla</span>
                  <ChevronRight size={17} strokeWidth={2.8} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. ECONOMIC REALITY COMPARISON (GÜNÜMÜZ ŞARTLARINDA NE KADAR UCUZ?) ── */}
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
          {/* Card 1 */}
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

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#FCE8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#F17AE6] flex items-center justify-center shrink-0">
              <GraduationCap size={20} />
            </div>
            <h3 className="text-base font-black text-[#241329] dark:text-white">
              1 Saat Özel Ders = Tüm Yıl Oxonom
            </h3>
            <p className="text-xs text-[#514458] dark:text-[#D2C5D8] leading-relaxed">
              Günümüzde tek bir saatlik özel ders 1.500 ₺ - 2.500 ₺ iken, Oxonom EDU ile 12 ay boyunca sınırsız eğitim 1.800 ₺.
            </p>
          </div>

          {/* Card 3 */}
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

          {/* Card 4 */}
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

      {/* ── 4. 2 PACKAGES SIDE-BY-SIDE (AYLIK vs 9 AYLIK) — CONTENTS ARE 100% IDENTICAL ── */}
      <section id="pricing-plans-section" className="py-10 px-4 sm:px-6 max-w-5xl mx-auto scroll-mt-20">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FCE8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#F17AE6] text-xs font-black">
            <BadgePercent size={14} />
            <span>ŞEFFAF & TAAHHÜTSÜZ FİYATLANDIRMA</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-[#241329] dark:text-white tracking-tight">
            İhtiyacınıza Uygun Paketi Seçin
          </h2>

          <p className="text-xs sm:text-sm text-[#514458] dark:text-[#D2C5D8] max-w-lg mx-auto">
            Her iki pakette de tüm özellikler eksiksiz ve sınırsızdır. 9 aylık paket ile %50 tasarruf edin ve 3 ayı hediye kazanın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* ── PLAN 1: AYLIK STANDART PLAN ── */}
          <div className="rounded-[30px] p-6 sm:p-8 bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] shadow-sm flex flex-col justify-between space-y-6">
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
                  <span className="text-4xl sm:text-5xl font-black text-[#241329] dark:text-white">
                    400 ₺
                  </span>
                  <span className="text-xs font-bold text-[#514458] dark:text-[#D2C5D8]">
                    / Ay
                  </span>
                </div>
                <div className="text-[11px] text-[#716779] dark:text-[#B5A5BD] mt-1.5 font-semibold">
                  Aylık yenilenir · Dilediğin an tek tıkla iptal et
                </div>
              </div>

              {/* Feature Checklist — IDENTICAL TO 9-MONTH PACKAGE */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-black text-[#241329] dark:text-white uppercase tracking-wider">
                  Paket İçeriği (Tam Erişim):
                </div>
                <ul className="space-y-2.5 text-xs text-[#514458] dark:text-[#D2C5D8]">
                  {FULL_PACKAGE_FEATURES.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check size={16} className="text-[#16805D] dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#241329] dark:text-white">{feat.title}:</strong> {feat.desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleStartTrial('Aylık Paket')}
                className="w-full py-4 px-6 rounded-2xl bg-[#F7F0FA] hover:bg-[#F0D8FA] dark:bg-[#251830] dark:hover:bg-[#350444] text-[#4B075F] dark:text-[#F17AE6] font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer border border-[#E8DFEB] dark:border-[#49364F] flex items-center justify-center gap-2"
              >
                <span>Aylık Planla 14 Gün Ücretsiz Başla</span>
                <ArrowRight size={16} />
              </button>
              <div className="text-[10.5px] text-[#716779] dark:text-[#B5A5BD] text-center font-medium">
                İlk 14 gün ücretsiz · Kredi kartı gerekmez
              </div>
            </div>
          </div>

          {/* ── PLAN 2: 9 AYLIK SÜPER PAKET (12 AY KULLANIM - 3D SHEEN & ÖNERİLEN) ── */}
          <div className="relative rounded-[32px] p-[2.5px] bg-gradient-to-br from-[#4B075F] via-[#8D49A6] to-[#D914C8] shadow-[0_25px_70px_-15px_rgba(217,20,200,0.4)] flex flex-col justify-between">
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
                    <span>9 Ay Öde 12 Ay Kesintisiz Kullan</span>
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

                {/* Feature Checklist — IDENTICAL CONTENTS TO MONTHLY */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-black text-[#241329] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#D914C8]" />
                    <span>Paket İçeriği (Tam Erişim):</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[#241329] dark:text-[#FCF9FD] font-medium">
                    {FULL_PACKAGE_FEATURES.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#8D49A6] to-[#D914C8] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span>
                          <strong>{feat.title}:</strong> {feat.desc}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Primary CTA */}
              <div className="space-y-2 pt-2 relative z-10">
                <button
                  type="button"
                  onClick={() => handleStartTrial('9 Aylık Süper Paket (12 Ay Kullanım)')}
                  className="w-full py-4 px-6 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-[#4B075F]/35 transition-all cursor-pointer flex items-center justify-center gap-2 group border border-white/20"
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

      {/* ── 5. WHY OXONOM EDU? PEDAGOGICAL BENEFITS ── */}
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
                Her öğrencinin anlama süresi farklıdır. Yapay zekâ, takıldığın yerleri tespit eder ve seviyeye uygun ek alıştırmalar sunar.
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
                MEB zümre öğretmenleri tarafından hazırlanan sınav simülasyonları ile okul sınavlarından önce birebir prova imkânı.
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
                Ağır kitapları taşımaya son. Tüm MEB müfredatı interaktif dijital flipbook formatında tablette veya telefonda elinin altında.
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
                Oxonom Game Studio sayesinde matematik ve Türkçe kavramlarını eğlenceli mini oyunlarla pekiştir, sıkılmadan öğren.
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
                Hiçbir üçüncü taraf reklam veya dikkat dağıtıcı banner barındırmaz. Sadece ve sadece eğitime odaklanma alanı.
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
                Anne ve babalar çocuğun hangi derste ne kadar ilerlediğini, çözülen soru sayısını ve başarı oranlarını anlık izleyebilir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FAQ ACCORDION ── */}
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

      {/* ── 7. BOTTOM CTA BANNER ── */}
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
                className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-[#4B075F]/40 transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/20"
              >
                <span>Hemen 14 Gün Ücretsiz Başla</span>
                <ChevronRight size={18} strokeWidth={2.8} />
              </button>

              <Link
                href="/student/courses"
                className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm transition-all border border-white/15 text-center"
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
