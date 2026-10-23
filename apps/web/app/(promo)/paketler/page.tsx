'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Tv,
  BookOpen,
  Target,
  FileText,
  Activity,
  Layers,
  Gamepad2,
  Zap,
  ShieldCheck,
  HelpCircle,
  Clock,
  Award,
  GraduationCap,
  Users,
} from 'lucide-react';
import JsonLd from '@components/Promo/JsonLd';

export default function PackagesPage() {
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  // Both monthly and yearly packages share the EXACT SAME feature set as instructed
  const studentFeatures = [
    {
      title: 'Infinite Canvas Akıllı Tahta',
      desc: 'Öğretmenin tahtaya yazdığı tüm formüller, çizimler ve soru çözümleri anında profilinize kaydedilir.',
      icon: Tv,
    },
    {
      title: '1 Dk Hızlı Okuma & Canlı WPM',
      desc: 'Takistoskop, kelime piramitleri, ses tanıma ve MEB Dik Abece ile okuma hızını canlı ölçme.',
      icon: Zap,
    },
    {
      title: 'MEB Kılavuz Çizgili Harf Çizgi Labı',
      desc: 'Harf yönü animasyonları, 4 çizgili kılavuz defter tuvali ve ilkokul çizim atölyesi.',
      icon: FileText,
    },
    {
      title: 'İngilizce Görsel Macera & Kelime Kartları',
      desc: '8 tematik ünite, native Amerikan/İngiliz telaffuz sesleri ve interaktif görsel kelime oyunları.',
      icon: BookOpen,
    },
    {
      title: '312 MEB Ders Kitabı & Flipbook',
      desc: 'Tüm MEB ders kitapları, akıllı fosforlu kalem, sayfa üzerine dijital not alma ve çevrimdışı okuma.',
      icon: Layers,
    },
    {
      title: '7/24 Kişisel Yapay Zekâ Eğitmen',
      desc: 'Fotoğrafını çek veya yaz; takıldığın soruda anında adım adım pedagojik soru çözüm rehberliği.',
      icon: Sparkles,
    },
    {
      title: 'MEB Zümre Açık Uçlu Sınav Tahminleri',
      desc: 'MEB Senaryo 1 ve Senaryo 2 ortak yazılı sınav tahminleri, çözümlü denemeler ve madde analizi.',
      icon: Target,
    },
    {
      title: 'Oxonom Game Studio Eğitsel Oyunları',
      desc: 'Matematik 2048, Kelime Avcısı, Hafıza Kartı, Uzay Macerası ve haftalık okul turnuvaları.',
      icon: Gamepad2,
    },
    {
      title: 'Canlı ve Grafiksel Akademik Röntgen',
      desc: 'Sınavlar, sözlüler, ders başarı grafikleri, devamsızlık ve karne hedef simülatörü.',
      icon: Activity,
    },
    {
      title: 'Notlarım & Akıllı Çalışma Ajandası',
      desc: 'Tahta notu senkronu, kişisel ders defteri, ödev hatırlatıcı ve haftalık etüt planlaması.',
      icon: Clock,
    },
    {
      title: 'Okul ve Tahta Tam Entegrasyonu',
      desc: 'Oxonom Edu anlaşmalı okullarla kesintisiz veri aktarımı, sınıf yoklaması ve veli entegrasyonu.',
      icon: ShieldCheck,
    },
    {
      title: 'Veli & Öğrenci Çift Taraflı Şeffaf Portal',
      desc: 'Dönem sonu sürprizi olmadan veli ve öğrenci için anlık gelişim grafikleri ve bildirimler.',
      icon: Users,
    },
  ];

  const faqs = [
    {
      q: '14 günlük ücretsiz deneme nasıl işler? Kredi kartı gerekir mi?',
      a: 'Asla kredi kartı bilgisi istenmez. Kayıt olduğunuz an 14 gün boyunca Akıllı Tahta, Derslerim, Sınavlarım ve Oyunlar dahil tüm modüller sınırsız olarak profilinize açılır.',
    },
    {
      q: 'Aylık ve yıllık paket arasında içerik veya özellik farkı var mı?',
      a: 'Hayır, kesinlikle hiçbir içerik farkı yoktur. Her iki pakette de tüm 12 modül ve özellik %100 eksiksiz sunulur. Yıllık pakette "9 Ay Öde 12 Ay Kullan" avantajıyla 3 ay yaz kampı hediye edilir ve %50 tasarruf sağlarsınız.',
    },
    {
      q: 'Okulumuzun akıllı tahtasıyla nasıl entegre oluyor?',
      a: 'Oxonom Edu anlaşmalı okullarda sınıftaki akıllı tahta doğrudan öğrencinin şube kütüğüne bağlıdır. Öğretmen tahtada dersi anlattığında notlar öğrencinin profiline otomatik olarak arşivlenir.',
    },
    {
      q: 'Öğrenci birden fazla cihazdan giriş yapabilir mi?',
      a: 'Evet, öğrenci bilgisayardan, tabletten ve cep telefonundan dilediği an aynı hesapla giriş yapabilir. Tüm notlar ve çözülen testler bulutta anlık olarak senkronize edilir.',
    },
  ];

  return (
    <div className="pt-32 pb-24 bg-[#FCF9FD] min-h-screen relative overflow-hidden">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Oxonom Edu Öğrenci Akıllı Eğitim Paketi',
          description:
            'Öğrenciler için akıllı tahta senkronu, MEB kitapları, zümre sınav provaları ve 7/24 yapay zekâ eğitmen paketi.',
          offers: [
            {
              '@type': 'Offer',
              price: '400',
              priceCurrency: 'TRY',
              priceValidUntil: '2027-12-31',
              description: 'Aylık Öğrenci Paketi',
            },
            {
              '@type': 'Offer',
              price: '1800',
              priceCurrency: 'TRY',
              priceValidUntil: '2027-12-31',
              description: 'Yıllık Süper Öğrenci Paketi (9 Ay Öde 12 Ay Kullan)',
            },
          ],
        }}
      />

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-br from-[#4B075F]/10 via-[#8D49A6]/5 to-[#D914C8]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#8D49A6] uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-[#4B075F] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-[#4B075F]">Paketler & Fiyatlandırma</span>
        </div>

        {/* Hero Section with 14-day Mascot Badge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16 lg:mb-20">
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FCE8FA] border border-[#F0D8FA] text-[#4B075F] rounded-full text-[11px] font-black uppercase tracking-widest mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D914C8]" />
              ŞEFFAF VE TAAHHÜTSÜZ ÖĞRENCİ LİSANSLARI
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-[#241329] tracking-tight leading-[1.08] mb-6">
              Öğrenciler İçin Tasarlanmış <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8]">
                Akıllı Eğitim Ekranı Paketleri
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#514458] font-medium leading-relaxed max-w-2xl mb-8">
              1. sınıftan 8. sınıfa kadar tüm okul müfredatı, sınıftaki akıllı tahtanın eve canlı aktarımı, MEB açık uçlu sınav provaları ve 7/24 yapay zekâ eğitmen desteği tek pakette. Aylık ve yıllık paketlerimiz <strong className="text-[#241329]">birebir aynı zengin özelliklere</strong> sahiptir.
            </p>

            {/* Quick trust badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#E8DFEB]/80 text-left">
              <div className="p-3 rounded-2xl bg-white border border-[#E8DFEB] shadow-xs">
                <span className="text-xs font-bold text-[#241329] block">1-8. Sınıf MEB</span>
                <span className="text-[11px] text-[#716779] font-medium">Tam Uyumlu</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#E8DFEB] shadow-xs">
                <span className="text-xs font-bold text-emerald-700 block">Kartsız Deneme</span>
                <span className="text-[11px] text-[#716779] font-medium">İlk 14 Gün 0 Risk</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#E8DFEB] shadow-xs">
                <span className="text-xs font-bold text-[#4B075F] block">Tahta Senkronu</span>
                <span className="text-[11px] text-[#716779] font-medium">Canlı Sınıf Notu</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#E8DFEB] shadow-xs">
                <span className="text-xs font-bold text-[#D914C8] block">7/24 AI Eğitmen</span>
                <span className="text-[11px] text-[#716779] font-medium">Soru Çözümü</span>
              </div>
            </div>
          </div>

          {/* 14-Day Free Mascot Badge Display - High End 3D Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md group">
              {/* Outer Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#4B075F]/30 via-[#D914C8]/25 to-[#8D49A6]/30 rounded-[2.5rem] blur-2xl group-hover:scale-105 transition-transform duration-500 pointer-events-none" />

              <div className="relative rounded-[2.5rem] bg-gradient-to-b from-white via-[#FCF9FD] to-[#FCE8FA]/40 border-2 border-[#D914C8]/30 p-7 sm:p-9 shadow-2xl shadow-[#4B075F]/15 text-center overflow-hidden">
                {/* Floating Top Pill */}
                <div className="absolute -top-1 right-8 bg-gradient-to-r from-[#4B075F] to-[#D914C8] text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-b-xl shadow-md">
                  ✨ 14 GÜN TAMAMEN ÜCRETSİZ
                </div>

                {/* Big Mascot Badge */}
                <div className="relative my-3 flex justify-center">
                  <div className="w-48 sm:w-56 h-auto drop-shadow-[0_15px_30px_rgba(217,20,200,0.3)] transition-transform duration-300 group-hover:scale-105">
                    <img
                      src="/mascot/mascot-14gun-badge.png"
                      alt="14 Gün Ücretsiz Deneme Rozeti"
                      className="w-full h-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/badge_14gun.png';
                      }}
                    />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-[#241329] tracking-tight">
                  14 Gün Ücretsiz Deneyin
                </h3>
                <p className="text-xs sm:text-sm text-[#514458] font-medium mt-1.5 leading-relaxed max-w-xs mx-auto">
                  Kredi kartı bilgisi gerekmez. Kayıt olun ve tüm 12 öğrenci modülünü anında keşfedin.
                </p>

                {/* Trust mini-pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4 mb-6 text-[11px] font-bold text-[#4B075F]">
                  <span className="bg-[#FCE8FA] px-2.5 py-1 rounded-lg border border-[#F0D8FA]">
                    ✓ Kredi Kartı Yok
                  </span>
                  <span className="bg-[#FCE8FA] px-2.5 py-1 rounded-lg border border-[#F0D8FA]">
                    ✓ Anında Aktivasyon
                  </span>
                  <span className="bg-[#FCE8FA] px-2.5 py-1 rounded-lg border border-[#F0D8FA]">
                    ✓ Sıfır Risk
                  </span>
                </div>

                <a
                  href="https://edu.oxonom.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8] hover:opacity-95 text-white text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-[#4B075F]/25 active:scale-98 transition-all"
                >
                  <span>Hemen Ücretsiz Başla</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Toggle (Monthly / Yearly) */}
        <div className="flex flex-col items-center justify-center mb-16">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white border border-[#E8DFEB] shadow-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#4B075F] text-white shadow-sm'
                  : 'text-[#716779] hover:text-[#241329]'
              }`}
            >
              Aylık Ödeme
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-[#4B075F] to-[#D914C8] text-white shadow-sm'
                  : 'text-[#716779] hover:text-[#241329]'
              }`}
            >
              <span>Yıllık Ödeme (9 Ay Öde 12 Ay Kullan)</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-400 text-[#241329]">
                %50 İndirim
              </span>
            </button>
          </div>
          <p className="text-xs text-[#716779] font-medium mt-3">
            {billingCycle === 'yearly'
              ? '✨ 9 Ay Öde 12 Ay Kullan: 3 ay yaz dönemi hediye! Toplam 1.800 ₺ / Yıllık.'
              : '⚡ İstediğiniz an iptal edilebilir, taahhütsüz esnek aylık abonelik.'}
          </p>
        </div>

        {/* Side-by-Side Pricing Cards: Monthly vs Yearly */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
          {/* Card 1: Aylık Paket */}
          <div className="bg-white rounded-3xl border border-[#E8DFEB] p-8 md:p-10 shadow-lg hover:border-[#8D49A6]/40 transition-all flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-[#514458]">
                  Esnek Abonelik
                </span>
                <span className="text-xs text-[#716779] font-medium">Taahhütsüz</span>
              </div>

              <h2 className="text-2xl font-bold text-[#241329] mb-2">Aylık Öğrenci Paketi</h2>
              <p className="text-xs text-[#514458] font-medium leading-relaxed mb-6">
                Ay ay ödemek isteyen ve esnekliği tercih eden öğrenciler için tam erişim paketi.
              </p>

              {/* Price */}
              <div className="p-6 rounded-2xl bg-[#FCF9FD] border border-[#E8DFEB] mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#241329]">400 ₺</span>
                  <span className="text-sm font-bold text-[#716779]">/ Ay</span>
                </div>
                <p className="text-[11px] text-[#716779] font-medium mt-1">
                  Her ay yenilenir, dilediğiniz zaman tek tıkla iptal edebilirsiniz.
                </p>
              </div>

              {/* Key Features header */}
              <div className="text-xs font-bold uppercase tracking-wider text-[#4B075F] mb-3">
                Pakete Dahil Tüm Özellikler:
              </div>

              {/* Features list (identical to annual) */}
              <div className="space-y-3 mb-8">
                {studentFeatures.slice(0, 7).map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#241329]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{feat.title}</span>
                      <p className="text-[11px] text-[#716779] font-medium leading-tight mt-0.5">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <a
                href="https://edu.oxonom.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl font-bold text-sm bg-white border-2 border-[#4B075F] text-[#4B075F] hover:bg-[#4B075F] hover:text-white transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Aylık Paketle Başla (14 Gün Ücretsiz)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card 2: Yıllık Süper Paket (Highlight) */}
          <div className="bg-gradient-to-b from-white to-[#FCF9FD] rounded-3xl border-2 border-[#D914C8] p-8 md:p-10 shadow-2xl shadow-[#4B075F]/15 transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-[#D914C8] to-[#4B075F] text-white text-[10px] font-black uppercase tracking-wider px-5 py-1.5 rounded-bl-2xl shadow-sm">
              En Çok Tercih Edilen • 3 Ay Hediye
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FCE8FA] text-[#D914C8] border border-[#F0D8FA]">
                  9 Ay Öde 12 Ay Kullan
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#241329] mb-2">
                Yıllık Süper Öğrenci Paketi
              </h2>
              <p className="text-xs text-[#514458] font-medium leading-relaxed mb-6">
                Yaz kampı ve tüm yıl kesintisiz tam öğrenme döngüsü. 9 ay fiyatına 12 ay kullanım!
              </p>

              {/* Price */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FCE8FA]/60 to-purple-50/60 border border-[#D914C8]/30 mb-6 relative">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#D914C8]">200 ₺</span>
                  <span className="text-sm font-bold text-[#716779]">/ Ay</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-[#241329]">Yıllık 1.800 ₺</span>
                  <span className="text-xs text-gray-400 line-through">4.800 ₺</span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    2.400 ₺ Tasarruf
                  </span>
                </div>
              </div>

              {/* Key Features header */}
              <div className="text-xs font-bold uppercase tracking-wider text-[#D914C8] mb-3">
                Pakete Dahil Tüm Özellikler (%100 Birebir Aynı):
              </div>

              {/* Features list (identical to monthly) */}
              <div className="space-y-3 mb-8">
                {studentFeatures.slice(0, 7).map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#241329]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{feat.title}</span>
                      <p className="text-[11px] text-[#716779] font-medium leading-tight mt-0.5">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <a
                href="https://edu.oxonom.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8] text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#4B075F]/20"
              >
                <span>Yıllık Paketi Seç (14 Gün Ücretsiz)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Detailed Full Features Comparison Table */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#8D49A6]">ÖZELLİK KARŞILAŞTIRMASI</span>
            <h2 className="text-3xl font-display font-bold text-[#241329] mt-2">
              Aylık ve Yıllık Paketlerde %100 Eşit İçerik
            </h2>
            <p className="text-sm text-[#716779] font-medium mt-2">
              Oxonom Edu'da özellik kısıtlaması yoktur. Yalnızca ödeme periyodunuzu seçersiniz.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E8DFEB] shadow-xl overflow-hidden">
            <div className="grid grid-cols-12 bg-[#241329] text-white p-4 sm:p-5 text-xs font-bold border-b border-white/10">
              <div className="col-span-6 sm:col-span-7">Öğrenci Modülü & Özellik</div>
              <div className="col-span-3 sm:col-span-2.5 text-center">Aylık Paket (400 ₺)</div>
              <div className="col-span-3 sm:col-span-2.5 text-center text-amber-300">Yıllık Paket (200 ₺)</div>
            </div>

            <div className="divide-y divide-[#E8DFEB]">
              {studentFeatures.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="grid grid-cols-12 p-4 sm:p-5 text-xs items-center hover:bg-[#FCF9FD] transition-colors"
                  >
                    <div className="col-span-6 sm:col-span-7 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FCF9FD] border border-[#E8DFEB] text-[#4B075F] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-[#241329] block">{item.title}</span>
                        <span className="text-[11px] text-[#716779] hidden sm:block mt-0.5">{item.desc}</span>
                      </div>
                    </div>

                    <div className="col-span-3 sm:col-span-2.5 flex justify-center">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sınırsız
                      </span>
                    </div>

                    <div className="col-span-3 sm:col-span-2.5 flex justify-center">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sınırsız
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#8D49A6]">SIKÇA SORULAN SORULAR</span>
            <h2 className="text-3xl font-display font-bold text-[#241329] mt-2">
              Paketler Hakkında Merak Edilenler
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-[#E8DFEB] shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FCE8FA] text-[#4B075F] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ?
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#241329] mb-1.5">{faq.q}</h4>
                    <p className="text-xs sm:text-sm text-[#514458] font-medium leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-gradient-to-br from-[#241329] via-[#350444] to-[#4B075F] rounded-[2.5rem] p-8 sm:p-12 md:p-16 text-white shadow-2xl relative overflow-hidden border border-[#D914C8]/30 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Background Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D914C8]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4B075F]/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

          <div className="relative z-10 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D914C8]/20 border border-[#D914C8]/40 text-xs font-black uppercase tracking-widest text-[#FCE8FA] mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#D914C8]" />
              HEMEN BAŞLAYIN · SIFIR RİSK
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white mt-1 mb-3 leading-tight tracking-tight">
              14 Gün Boyunca <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-[#FCE8FA]">
                Sıfır Riskle Deneyin!
              </span>
            </h3>
            <p className="text-sm sm:text-base text-white/80 font-medium leading-relaxed mb-6">
              Öğrencinizin okul başarısındaki somut değişimi görmek için hemen ücretsiz hesap oluşturun. Kredi kartı gerekmez, taahhüt yok, dilediğiniz an tek tıkla iptal.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-white/85">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Kredi Kartı Gerekmez
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 1-8. Sınıf Tam Erişim
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Anında Aktivasyon
              </span>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4 shrink-0 w-full md:w-auto">
            {/* Super Enlarged 3D Mascot Badge */}
            <div className="w-64 sm:w-80 md:w-96 lg:w-[420px] max-w-full drop-shadow-[0_25px_50px_rgba(217,20,200,0.45)] select-none">
              <img
                src="/mascot/mascot-14gun-badge.png"
                alt="Oxonom Edu 14 Gün Ücretsiz Rozet"
                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
            <a
              href="https://edu.oxonom.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-[#D914C8] via-[#B811AA] to-[#8D49A6] text-white font-black text-sm shadow-xl shadow-[#D914C8]/40 hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95 text-center"
            >
              <span>14 Gün Ücretsiz Başla</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
