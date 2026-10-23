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
  PenTool,
  RefreshCw,
  Clock,
  Layers,
  BookOpen,
  Share2,
  Download,
  GraduationCap,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import JsonLd from '@components/Promo/JsonLd';
import { SmartBoard3DIcon } from '@components/Promo/StudentInteractiveTabs';

export default function AkilliTahtaPage() {
  
  const [activeBoardSlide, setActiveBoardSlide] = useState(0);

  const boardSlides = [
    {
      title: 'Matematik: Türev & İntegral Uygulamaları',
      teacher: 'Mehmet Öğretmen (11-A)',
      timestamp: 'Bugün 10:45',
      formula: 'f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}',
      notes: 'Zümre ortak sınavında bu grafiğin maksimum noktası kesin çıkacak. Çizgili alana dikkat!',
      tags: ['Analiz', 'Türev', 'Kritik Noktalar'],
    },
    {
      title: 'Fizik: İki Boyutta Bağıl Hareket',
      teacher: 'Ayşe Öğretmen (11-A)',
      timestamp: 'Dün 14:15',
      formula: '\\vec{v}_{bağıl} = \\vec{v}_{gözlenen} - \\vec{v}_{gözlemci}',
      notes: 'Akıntıya dik yüzen yüzücünün karşı kıyıya çıkış süresi sadece düşey hıza bağlıdır!',
      tags: ['Vektörler', 'Mekanik', 'Bağıl Hız'],
    },
    {
      title: 'Kimya: Gaz Yasaları & İdeal Gaz Denklemi',
      teacher: 'Burak Öğretmen (11-A)',
      timestamp: 'Salı 11:20',
      formula: 'P \\cdot V = n \\cdot R \\cdot T',
      notes: 'Kritik sıcaklık üzerindeki gazlar basınçla sıvılaştırılamaz.',
      tags: ['Gazlar', 'Kelvin', 'Mol'],
    },
  ];

  return (
    <div className="pt-32 pb-24 bg-[#FCF9FD] min-h-screen relative overflow-hidden">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Oxonom Edu Akıllı Tahta Senkronizasyonu',
          applicationCategory: 'EducationalSoftware',
          description:
            'Öğretmenin akıllı tahtaya yazdığı tüm içeriklerin anında öğrenci profiline aktarılması ve evde tekrar imkanı.',
          offers: {
            '@type': 'Offer',
            price: '200',
            priceCurrency: 'TRY',
          },
        }}
      />

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-br from-[#4B075F]/10 via-[#8D49A6]/5 to-[#D914C8]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#8D49A6] uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-[#4B075F] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-[#514458]">Öğrenci Özellikleri</span>
          <span>/</span>
          <span className="text-[#4B075F]">Akıllı Tahta</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              CANLI OKUL & TAHTA ENTEGRASYONU
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-[#241329] tracking-tight leading-[1.1] mb-6">
              Gerçekten Akıllı Tahta: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8]">
                Sınıftaki Eğitimi Eve Taşıyın
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#514458] font-medium leading-relaxed mb-8">
              Öğretmeninizin sınıfta tahtaya yazdığı her formül, çizim ve soru çözümü milisaniyeler içinde dijitalleşerek doğrudan öğrenci profiline kaydedilir. Artık tahtanın fotoğrafını çekmeye veya derste yetişemediğiniz notları kaçırmaya son!
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <a
                href="https://edu.oxonom.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#4B075F] to-[#8D49A6] text-white font-bold text-sm shadow-lg shadow-[#4B075F]/20 hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span>Demo Hesap İncele</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <Link
                href="/paketler"
                className="px-6 py-3.5 rounded-xl bg-white border border-[#E8DFEB] text-[#4B075F] font-bold text-sm hover:border-[#8D49A6] transition-all flex items-center gap-2 shadow-xs"
              >
                <span>Paketleri ve Fiyatları Gör</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E8DFEB]">
              <div>
                <div className="text-2xl font-black text-[#4B075F]">0 sn</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Anlık Senkronizasyon</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600">%100</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Eksiksiz Not Arşivi</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#D914C8]">LaTeX & Çizim</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Vektörel Netlik</div>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-[#E8DFEB] shadow-2xl shadow-[#4B075F]/15 overflow-hidden">
              <div className="bg-[#241329] px-5 py-4 flex items-center justify-between text-white border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-emerald-400 font-semibold ml-2">● Canlı Tahta Senkronu</span>
                </div>
                <span className="text-[11px] text-white/60 font-mono">CRDT v2.4</span>
              </div>

              {/* Board Screen simulation */}
              <div className="p-6 bg-gradient-to-b from-[#022C22] to-[#064E3B] text-white min-h-[340px] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/30">
                      {boardSlides[activeBoardSlide].teacher}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-200/70">
                      {boardSlides[activeBoardSlide].timestamp}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3">
                    {boardSlides[activeBoardSlide].title}
                  </h3>

                  {/* Formula Box */}
                  <div className="p-4 rounded-xl bg-black/30 border border-emerald-400/30 font-mono text-center text-amber-300 text-sm sm:text-base my-3 backdrop-blur-sm shadow-inner">
                    {boardSlides[activeBoardSlide].formula}
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/20 text-xs text-emerald-100/90 leading-relaxed">
                    <span className="font-bold text-amber-300">Öğretmen Notu: </span>
                    {boardSlides[activeBoardSlide].notes}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-emerald-500/20 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {boardSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveBoardSlide(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          activeBoardSlide === i ? 'bg-amber-400 w-6' : 'bg-white/30 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[11px] text-emerald-200/80 font-medium">
                    {activeBoardSlide + 1} / {boardSlides.length} Ders Kaydı
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-white border-t border-[#E8DFEB] flex items-center justify-between text-xs text-[#514458]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-[#241329]">Öğrenci Profiline Kaydedildi</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-[#FCF9FD] rounded-lg border border-[#E8DFEB] text-[#4B075F] transition-all" title="İndir">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-2 hover:bg-[#FCF9FD] rounded-lg border border-[#E8DFEB] text-[#4B075F] transition-all" title="Paylaş">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#8D49A6]">ÖĞRENCİ AVANTAJLARI</span>
            <h2 className="text-3xl font-display font-bold text-[#241329] mt-2">
              Okul ve Ev Arasındaki Kesintisiz Köprü
            </h2>
            <p className="text-sm text-[#716779] font-medium mt-2">
              Oxonom Edu anlaşmalı okullarda sınıftaki akıllı tahta doğrudan öğrenci bulutuna bağlanır.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-[#8D49A6]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#241329] mb-2">Otomatik & Sessiz Senkronizasyon</h3>
              <p className="text-sm text-[#514458] font-medium leading-relaxed">
                Öğretmen tahtada yeni bir sayfaya geçtiğinde veya dersi bitirdiğinde öğrencinin profilinde ilgili ders klasörüne o günün tarihiyle otomatik arşivlenir.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-[#8D49A6]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FCE8FA] text-[#4B075F] flex items-center justify-center mb-4">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#241329] mb-2">Kişisel Dijital Defter Ekleme</h3>
              <p className="text-sm text-[#514458] font-medium leading-relaxed">
                Öğretmenin yazdıklarının üzerine evde kendi notlarınızı ekleyebilir, fosforlu kalemle önemli yerleri çizebilir ve kişiselleştirilmiş ders özetleri çıkarabilirsiniz.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-[#8D49A6]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#241329] mb-2">Sınav Döneminde Hızlı Tekrar</h3>
              <p className="text-sm text-[#514458] font-medium leading-relaxed">
                Yazılı sınav haftalarında haftalar öncesinde tahtaya yazılmış zorlu soru çözümlerine tek tıkla arama yaparak ulaşabilir, eksiklerinizi anında kapatabilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Flow */}
        <div className="bg-gradient-to-br from-[#241329] to-[#3B0748] rounded-3xl p-8 md:p-12 text-white mb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D914C8]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mb-10 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#D914C8]">NASIL ÇALIŞIR?</span>
            <h2 className="text-3xl font-display font-bold mt-2">3 Adımda Tahtadan Ekrana</h2>
            <p className="text-sm text-white/70 font-medium mt-2">
              Karmaşık kablolara veya flaş belleklere gerek yok. Tamamen bulut tabanlı ve güvenli.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4B075F] to-[#8D49A6] text-white font-black flex items-center justify-center text-lg mb-4">
                1
              </div>
              <h4 className="font-bold text-base mb-2">Öğretmen Sınıfta Anlatır</h4>
              <p className="text-xs text-white/70 leading-relaxed font-medium">
                Öğretmen sınıftaki akıllı tahtada dersini işlerken Hocuspocus CRDT motoru her çizgiyi ve formülü vektörel olarak dijitalleştirir.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8D49A6] to-[#D914C8] text-white font-black flex items-center justify-center text-lg mb-4">
                2
              </div>
              <h4 className="font-bold text-base mb-2">Öğrenci Kütüğüne Aktarılır</h4>
              <p className="text-xs text-white/70 leading-relaxed font-medium">
                Ders sonlandığında o şubedeki kayıtlı tüm öğrencilerin paneline ders adı, ünite ve konu etiketiyle hazır hale getirilir.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D914C8] to-[#FCE8FA] text-[#241329] font-black flex items-center justify-center text-lg mb-4">
                3
              </div>
              <h4 className="font-bold text-base mb-2">Evde Rahatça Tekrar Edin</h4>
              <p className="text-xs text-white/70 leading-relaxed font-medium">
                Bilgisayarınızdan, tabletinizden veya cep telefonunuzdan dilediğiniz an tahtayı açıp sınıftaymış gibi dersi baştan gözden geçirin.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-white rounded-3xl border border-[#E8DFEB] p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-[#241329] mb-3">
              Akıllı Tahta Senkronizasyonunu Hemen Deneyin
            </h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              14 gün boyunca ücretsiz demo hesabı oluşturun, sınıftaki eğitimin eve nasıl kesintisiz taşındığını kendi gözlerinizle görün.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <a
              href="https://edu.oxonom.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold text-sm shadow-lg shadow-[#4B075F]/20 transition-all flex items-center gap-2"
            >
              <span>Ücretsiz Demo Başlat</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <Link
              href="/paketler"
              className="px-6 py-3.5 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB] text-[#4B075F] font-bold text-sm hover:border-[#8D49A6] transition-all"
            >
              Paketleri İncele
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
