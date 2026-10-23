'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Zap,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  ChevronRight,
  HelpCircle,
  Brain,
  TrendingUp,
  Backpack,
  Gamepad2,
  Lock,
  BarChart3,
  Coffee,
  GraduationCap,
  BookOpen,
  Car,
  Gift,
  CheckCircle2,
} from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: '14 günlük ücretsiz deneme için kredi kartı bilgisi girmem gerekiyor mu?',
    a: 'Kesinlikle hayır! İlk 14 gün boyunca hiçbir kredi kartı, banka kartı veya ödeme bilgisi vermeden tüm Oxonom EDU özelliklerini sıfır risk ile hemen kullanmaya başlayabilirsiniz.',
  },
  {
    q: '“9 Ay Öde 12 Ay Kullan” kampanyası nasıl işliyor?',
    a: 'Yalnızca okul dönemi olan 9 ay için aylık 200 ₺ (yıllık toplam 1.800 ₺) ödersiniz ve sistemimiz size ekstra 3 ayı (yaz tatili telafi ve hazırlık kampı dönemi dahil) tamamen hediye eder. Böylece tam 365 gün boyunca kesintisiz tam erişim kazanırsınız.',
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
    a: 'İlk 14 gün içinde tek tıkla hiçbir soru sorulmadan deneme sürenizi sonlandırabilirsiniz. Aylık paketlerde dilediğiniz an tek tıkla üyeliğinizi iptal edebilirsiniz.',
  },
];

const FULL_FEATURES = [
  {
    title: 'Infinite Canvas Akıllı Tahta',
    desc: 'Öğretmenin tahtaya yazdığı tüm formüller, çizimler ve notlar anında profilinize kaydedilir',
  },
  {
    title: '1 Dk Hızlı Okuma & Canlı WPM',
    desc: 'Takistoskop, kelime piramitleri, ses tanıma ve MEB Dik Abece ile okuma hızını canlı ölçme',
  },
  {
    title: 'MEB Kılavuz Çizgili Harf Çizgi Labı',
    desc: 'Harf yönü animasyonları, 4 çizgili kılavuz defter tuvali ve ilkokul çizim atölyesi',
  },
  {
    title: 'İngilizce Görsel Macera & Kelime Kartları',
    desc: '8 tematik ünite, native Amerikan/İngiliz telaffuz sesleri ve interaktif kelime oyunları',
  },
  {
    title: '312 MEB Ders Kitabı & Flipbook',
    desc: 'Tüm MEB ders kitapları, akıllı fosforlu kalem, sayfa üzerine dijital not alma ve çevrimdışı okuma',
  },
  {
    title: '7/24 Kişisel Yapay Zekâ Eğitmen',
    desc: 'Fotoğrafını çek veya yaz; takıldığın soruda anında adım adım pedagojik soru çözüm rehberliği',
  },
  {
    title: 'MEB Zümre Açık Uçlu Sınav Tahminleri',
    desc: 'MEB Senaryo 1 ve 2 ortak yazılı sınav tahminleri, çözümlü denemeler ve madde analizi',
  },
  {
    title: 'Oxonom Game Studio Eğitsel Oyunları',
    desc: 'Matematik 2048, Kelime Avcısı, Hafıza Kartı, Uzay Macerası ve haftalık okul turnuvaları',
  },
  {
    title: 'Canlı ve Grafiksel Akademik Röntgen',
    desc: 'Sınavlar, sözlüler, ders başarı grafikleri, devamsızlık ve karne hedef simülatörü',
  },
  {
    title: 'Notlarım & Akıllı Çalışma Ajandası',
    desc: 'Tahta notu senkronu, kişisel ders defteri, ödev hatırlatıcı ve haftalık etüt planlaması',
  },
  {
    title: 'Okul ve Tahta Tam Entegrasyonu',
    desc: 'Oxonom Edu anlaşmalı okullarla kesintisiz veri aktarımı, sınıf yoklaması ve veli entegrasyonu',
  },
  {
    title: 'Veli & Öğrenci Çift Taraflı Şeffaf Portal',
    desc: 'Dönem sonu sürprizi olmadan veli ve öğrenci için anlık gelişim grafikleri ve bildirimler',
  },
];

export default function PricingTables() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <section
      id="fiyatlandirma"
      className="py-16 sm:py-24 lg:py-28 bg-[#FCF9FD] relative overflow-hidden border-t border-[#E8DFEB]/80"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4B075F]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D914C8]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4B075F08_1px,transparent_1px),linear-gradient(to_bottom,#4B075F08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ═══ 1. HERO PROMO HEADER ═══ */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FCE8FA] border border-[#F0D8FA] mb-4 shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#D914C8] animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-[#4B075F]">
              9 AY ÖDE 12 AY KULLAN · İLK 14 GÜN KARTSIZ ÜCRETSİZ
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#241329] tracking-tight leading-tight"
          >
            Özel Ders Kalitesinde Eğitim,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8]">
              Her Öğrencinin Cebinde.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-[#716779] mt-4 leading-relaxed font-medium max-w-2xl mx-auto"
          >
            312 MEB ders kitabı, 7/24 kişisel yapay zekâ eğitmen desteği, yazılı sınav tahminleri ve eğitsel oyunlar tek platformda.{' '}
            <strong className="text-[#241329]">9 ay ödeyip tam 12 ay kesintisiz kullanın</strong>, ilk 14 gün kredi kartı gerekmeden ücretsiz deneyin.
          </motion.p>

          {/* Guarantee Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-bold text-[#4B075F]">
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E8DFEB] shadow-xs flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#16805D]" /> Kart Bilgisi Gerekmez
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E8DFEB] shadow-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#D914C8]" /> Anında Aktivasyon
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E8DFEB] shadow-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4B075F]" /> İstediğin An İptal
            </span>
          </div>
        </div>

        {/* ═══ 2. BÜYÜK YIL KAMPANYASI HERO BANNER CARD ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 sm:mb-20 rounded-3xl bg-gradient-to-br from-[#241329] via-[#350444] to-[#4B075F] text-white p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden border border-white/10"
        >
          {/* Decorative ambient radial light */}
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D914C8]/30 via-transparent to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[#FCE8FA] text-xs font-bold uppercase tracking-wider mb-4">
                <Gift className="w-3.5 h-3.5 text-[#D914C8]" />
                <span>Büyük Yıl Kampanyası — 9 Ay Öde 12 Ay Kullan</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                9 Ay Öde, 12 Ay Kesintisiz Kullan!
              </h3>

              <p className="text-xs sm:text-sm text-white/85 mt-3 leading-relaxed font-medium max-w-xl">
                Okul dönemi boyunca ve yaz tatilinde kesintisiz tam erişim! Yalnızca 9 ay için ödeme yaparsınız, tam 12 ay (365 gün) boyunca tüm özelliklerden sınırsızca yararlanırsınız.{' '}
                <strong className="text-white">Toplam +3 ay yaz tatili ve telafi dönemi tamamen ücretsiz hediye edilir.</strong>
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold text-white/90">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
                  <Check className="w-3.5 h-3.5 text-[#45C7A2]" /> 9 Ay Öde 12 Ay Kullan
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
                  <Check className="w-3.5 h-3.5 text-[#45C7A2]" /> İlk 14 Gün Ücretsiz
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
                  <Check className="w-3.5 h-3.5 text-[#45C7A2]" /> Kart Bilgisi Gerekmez
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-white/20 text-center flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FCE8FA]">
                  Özel Kampanya Fiyatı
                </span>
                <div className="mt-2 flex items-center justify-center gap-3">
                  <span className="text-lg line-through text-white/50 font-bold">400 ₺ / Ay</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">200 ₺</span>
                    <span className="text-xs text-white/80 font-bold">/ Ay</span>
                  </div>
                </div>
                <div className="text-xs text-white/90 font-medium mt-1">
                  (Toplam 1.800 ₺ · Yıllık 2.400 ₺ Tasarruf)
                </div>
                <div className="mt-2 inline-block px-3 py-1 rounded-full bg-[#D914C8] text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                  Günde Sadece 4.9 ₺ · %50 Tasarruf
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="https://edu.oxonom.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-[#FCE8FA] text-[#4B075F] font-black text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 group cursor-pointer"
                >
                  <span>14 Gün Ücretsiz Başla</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <p className="text-[10px] text-white/60 mt-2 font-mono">
                  İlk 14 gün ücretsiz · Kredi kartı gerekmez
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ 3. GÜNÜMÜZ ŞARTLARINDA NE KADAR UCUZ? (4 DEĞER KARTI) ═══ */}
        <div className="mb-16 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-black text-[#241329] tracking-tight">
              Günümüz Şartlarında Ne Kadar Ucuz?
            </h3>
            <p className="text-xs sm:text-sm text-[#716779] mt-2 font-medium">
              Geleneksel eğitim masrafları tırmanırken Oxonom EDU aile bütçenizi korur, öğrencinize sınırsız imkan tanır.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E8DFEB] shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <Coffee className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-[#241329] mb-1.5">Günde Sadece 4.9 ₺</h4>
              <p className="text-xs text-[#716779] leading-relaxed font-medium">
                Bir fincan kahvenin üçte biri maliyetine, çocuğunuza her gün 7/24 özel ders ve MEB kitap desteği sağlayın.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8DFEB] shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#4B075F] flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-[#241329] mb-1.5">1 Saat Özel Ders = Tüm Yıl Oxonom</h4>
              <p className="text-xs text-[#716779] leading-relaxed font-medium">
                Günümüzde tek bir saatlik özel ders 1.500 ₺ - 2.500 ₺ iken, Oxonom EDU ile 12 ay boyunca sınırsız eğitim 1.800 ₺.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8DFEB] shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-[#241329] mb-1.5">Kitap Masraflarına Son</h4>
              <p className="text-xs text-[#716779] leading-relaxed font-medium">
                Dönemlik 5-6 farklı soru bankası almak 3.000 ₺'yi aşıyor. Oxonom'da 312 MEB kitabı ve interaktif soru bankası dahil.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8DFEB] shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Car className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-[#241329] mb-1.5">Trafikte Sıfır Kayıp</h4>
              <p className="text-xs text-[#716779] leading-relaxed font-medium">
                Dershane yollarında vakit kaybetmeyin. Takıldığınız soruyu anında sisteme yükleyin, çözüm birkaç saniye içinde ekranınızda olsun.
              </p>
            </div>
          </div>
        </div>

        {/* ═══ 4. ŞEFFAF & TAAHHÜTSÜZ FİYATLANDIRMA (2 PAKET KARTI) ═══ */}
        <div className="mb-16 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-[#4B075F] bg-[#FCE8FA] px-3.5 py-1 rounded-full">
              ŞEFFAF & TAAHHÜTSÜZ FİYATLANDIRMA
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#241329] tracking-tight mt-3">
              İhtiyacınıza Uygun Paketi Seçin
            </h3>
            <p className="text-xs sm:text-sm text-[#716779] mt-2 font-medium">
              Her iki pakette de tüm özellikler eksiksiz ve sınırsızdır. 9 aylık paket ile 9 ay ödeyip 12 ay kesintisiz kullanın!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            {/* PAKET 1: Esnek & Taahhütsüz Aylık Paket */}
            <div className="p-7 sm:p-9 rounded-3xl bg-white border border-[#E8DFEB] shadow-lg flex flex-col justify-between hover:border-[#8D49A6]/40 transition-all">
              <div>
                <div className="border-b border-[#E8DFEB] pb-5 mb-5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#8D49A6]">
                    Esnek & Taahhütsüz
                  </span>
                  <h4 className="text-2xl font-black text-[#241329] mt-1">Aylık Paket</h4>
                  <p className="text-xs text-[#716779] mt-1">
                    Aylık periyotta ödeme yapmak isteyen öğrenciler ve veliler için.
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black text-[#4B075F] tracking-tight">400 ₺</span>
                    <span className="text-xs font-bold text-[#716779]">/ Ay</span>
                  </div>
                  <p className="text-[11px] text-[#716779] font-medium mt-1">
                    Aylık yenilenir · Dilediğin an tek tıkla iptal et
                  </p>
                </div>

                {/* Features List */}
                <div className="mb-8">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#716779] block mb-3">
                    Paket İçeriği (Tam Erişim):
                  </span>
                  <ul className="space-y-3 text-xs">
                    {FULL_FEATURES.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-[#241329] font-medium leading-snug">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </span>
                        <div>
                          <strong className="font-bold text-[#241329]">{feat.title}: </strong>
                          <span className="text-[#716779]">{feat.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-5 border-t border-[#E8DFEB]">
                <a
                  href="https://edu.oxonom.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#FCF9FD] hover:bg-[#FCE8FA] text-[#4B075F] font-bold text-xs sm:text-sm border border-[#E8DFEB] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs"
                >
                  <span>Aylık Planla 14 Gün Ücretsiz Başla</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <p className="text-[10px] text-center text-[#716779] mt-2">
                  İlk 14 gün ücretsiz · Kredi kartı gerekmez
                </p>
              </div>
            </div>

            {/* PAKET 2: 9 Aylık Süper Paket (EN POPÜLER) */}
            <div className="p-7 sm:p-9 rounded-3xl bg-gradient-to-b from-[#FAF4FC] via-white to-white border-2 border-[#4B075F] shadow-2xl shadow-[#4B075F]/15 flex flex-col justify-between relative">
              {/* Floating Top Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8] text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5" />
                <span>9 AY ÖDE, 12 AY KULLAN · %50 İNDİRİM</span>
              </div>

              <div>
                <div className="border-b border-[#E8DFEB] pb-5 mb-5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#D914C8]">
                      3 Ay Ücretsiz Hediye Kampanyası
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D914C8] text-white font-black">
                      %50 Tasarruf
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-[#241329] mt-1">9 Aylık Süper Paket</h4>
                  <p className="text-xs text-[#716779] mt-1">
                    12 ay boyunca kesintisiz tam erişim. 3 ay yaz tatili kampı tamamen hediye!
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg line-through text-[#716779]/60 font-bold">400 ₺</span>
                    <span className="text-4xl sm:text-5xl font-black text-[#4B075F] tracking-tight">200 ₺</span>
                    <span className="text-xs font-bold text-[#716779]">/ Ay</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-700 mt-1">
                    Toplam 1.800 ₺ (Yıllık 2.400 ₺ Tasarruf) · Günde 4.9 ₺
                  </p>
                  <div className="mt-3 p-3 rounded-xl bg-[#FCE8FA] border border-[#F0D8FA] text-xs text-[#4B075F] font-semibold leading-relaxed">
                    ✨ <strong>9 Ay Ödeyin, 12 Ay (Tam 365 Gün) Kullanın!</strong> Sadece okul dönemi (9 ay) için 1.800 ₺ ödersiniz, yaz tatili telafi kampı dönemi olan +3 ay tamamen hediye edilir.
                  </div>
                </div>

                {/* Features List */}
                <div className="mb-8">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#716779] block mb-3">
                    Paket İçeriği (Tam Erişim):
                  </span>
                  <ul className="space-y-3 text-xs">
                    {FULL_FEATURES.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-[#241329] font-medium leading-snug">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </span>
                        <div>
                          <strong className="font-bold text-[#241329]">{feat.title}: </strong>
                          <span className="text-[#716779]">{feat.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-5 border-t border-[#E8DFEB]">
                <a
                  href="https://edu.oxonom.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#4B075F] to-[#D914C8] hover:from-[#620B79] hover:to-[#E026D0] text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-[#4B075F]/20"
                >
                  <span>9 Ay Öde, 12 Ay Kullan — 14 Gün Ücretsiz Başla</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <p className="text-[10px] text-center text-[#716779] mt-2 font-medium">
                  İlk 14 gün kredi kartı gerekmez · 0 Risk
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ 5. ÖĞRENCİLER NEDEN OXONOM EDU KULLANMALI? (6 DEĞER KARTI) ═══ */}
        <div className="mb-16 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-black text-[#241329] tracking-tight">
              Öğrenciler Neden Oxonom EDU Kullanmalı?
            </h3>
            <p className="text-xs sm:text-sm text-[#716779] mt-2 font-medium">
              Klasik ezberci sistemler yerine, öğrencinin hızına uyum sağlayan yeni nesil öğrenme platformu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E8DFEB] shadow-xs hover:shadow-lg transition-all">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-[#4B075F] flex items-center justify-center mb-3">
                <Brain className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#241329] mb-1.5">Kişiselleştirilmiş Öğrenme Hızı</h4>
              <p className="text-xs text-[#716779] leading-relaxed font-medium">
                Her öğrencinin anlama süresi farklıdır. Yapay zekâ, takıldığın yerleri tespit eder ve seviyeye uygun ek alıştırmalar sunar.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8DFEB] shadow-xs hover:shadow-lg transition-all">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#241329] mb-1.5">Okul Yazılılarında %40+ Başarı Artışı</h4>
              <p className="text-xs text-[#716779] leading-relaxed font-medium">
                MEB zümre öğretmenleri tarafından hazırlanan sınav simülasyonları ile okul sınavlarından önce birebir prova imkânı.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8DFEB] shadow-xs hover:shadow-lg transition-all">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <Backpack className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#241329] mb-1.5">Sırt Çantası Hafifliği</h4>
              <p className="text-xs text-[#716779] leading-relaxed font-medium">
                Ağır kitapları taşımaya son. Tüm MEB müfredatı interaktif dijital flipbook formatında tablette veya telefonda elinin altında.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8DFEB] shadow-xs hover:shadow-lg transition-all">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#241329] mb-1.5">Oyunlaştırılmış Motivasyon</h4>
              <p className="text-xs text-[#716779] leading-relaxed font-medium">
                Oxonom Game Studio sayesinde matematik ve Türkçe kavramlarını eğlenceli mini oyunlarla pekiştir, sıkılmadan öğren.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8DFEB] shadow-xs hover:shadow-lg transition-all">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#241329] mb-1.5">%100 Güvenli & Reklamsız</h4>
              <p className="text-xs text-[#716779] leading-relaxed font-medium">
                Hiçbir üçüncü taraf reklam veya dikkat dağıtıcı banner barındırmaz. Sadece ve sadece eğitime odaklanma alanı.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8DFEB] shadow-xs hover:shadow-lg transition-all">
              <div className="w-11 h-11 rounded-2xl bg-fuchsia-50 text-[#D914C8] flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#241329] mb-1.5">Şeffaf Veli Gelişim Paneli</h4>
              <p className="text-xs text-[#716779] leading-relaxed font-medium">
                Anne ve babalar çocuğun hangi derste ne kadar ilerlediğini, çözülen soru sayısını ve başarı oranlarını anlık izleyebilir.
              </p>
            </div>
          </div>
        </div>

        {/* ═══ 6. SIKÇA SORULAN SORULAR (FAQ ACCORDION) ═══ */}
        <div className="mb-16 sm:mb-24 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-black text-[#241329] tracking-tight">
              Sıkça Sorulan Sorular
            </h3>
            <p className="text-xs sm:text-sm text-[#716779] mt-2 font-medium">
              Aklınıza takılan soruların yanıtları burada.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-[#E8DFEB] overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-black text-xs sm:text-sm text-[#241329] cursor-pointer hover:bg-[#FCF9FD] transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-[#8D49A6] shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-[#716779] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-90 text-[#4B075F]' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-[#716779] leading-relaxed border-t border-[#E8DFEB]/60 pt-3 font-medium">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ 7. SIFIR RİSK · HEMEN BAŞLAYIN SON BANNER ═══ */}
        <div className="rounded-3xl bg-gradient-to-r from-[#4B075F] via-[#350444] to-[#241329] text-white p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#D914C8]/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[#FCE8FA] inline-block mb-3">
              Sıfır Risk · Hemen Başlayın
            </span>

            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Başarınızı Şansa Bırakmayın.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCE8FA] to-[#D914C8]">
                9 Ay Ödeyin, 12 Ay Kullanın!
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-white/80 mt-3 font-medium leading-relaxed">
              Oxonom EDU ile okulda, evde ve sınavlarda fark yaratın. 9 Ay Öde 12 Ay Kullan kampanyasıyla en yüksek tasarruftan faydalanın.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://edu.oxonom.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-[#FCE8FA] text-[#4B075F] font-black text-xs sm:text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <span>9 Ay Öde 12 Ay Kullan — 14 Gün Ücretsiz Başla</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://edu.oxonom.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Dersleri İncele</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
