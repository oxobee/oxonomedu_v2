'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  Award,
  Play,
  RotateCcw,
  Zap,
  Clock,
  Brain,
  Layers,
  ChevronRight,
  Star,
} from 'lucide-react';
import JsonLd from '@components/Promo/JsonLd';
import { Lessons3DIcon } from '@components/Promo/StudentInteractiveTabs';

export default function DerslerimPage() {
  
  const [activeSubject, setActiveSubject] = useState(0);

  const subjects = [
    {
      name: 'Matematik',
      code: 'MAT-802',
      unit: '3. Ünite: Doğrusal Denklemler & Eğim',
      progress: 88,
      topicsCount: 14,
      completedCount: 12,
      lastScore: '95 Puan',
      badge: 'Çok İyi',
      color: 'from-blue-600 to-indigo-600',
      lightBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      name: 'Fen Bilimleri',
      code: 'FEN-804',
      unit: '2. Ünite: DNA ve Genetik Kod',
      progress: 92,
      topicsCount: 10,
      completedCount: 9,
      lastScore: '100 Puan',
      badge: 'Mükemmel',
      color: 'from-emerald-600 to-teal-600',
      lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      name: 'Türkçe',
      code: 'TUR-801',
      unit: '4. Ünite: Cümlede Anlam & Paragraf Taktikleri',
      progress: 85,
      topicsCount: 16,
      completedCount: 13,
      lastScore: '90 Puan',
      badge: 'Başarılı',
      color: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      name: 'İngilizce',
      code: 'ENG-803',
      unit: 'Unit 5: The Internet & Communication',
      progress: 96,
      topicsCount: 12,
      completedCount: 11,
      lastScore: '98 Puan',
      badge: 'Lider',
      color: 'from-purple-600 to-pink-600',
      lightBg: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  return (
    <div className="pt-32 pb-24 bg-[#FCF9FD] min-h-screen relative overflow-hidden">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Oxonom Edu Derslerim Modülü',
          applicationCategory: 'EducationalSoftware',
          description:
            'Tüm MEB ders müfredatı, konu özetleri, interaktif pekiştirme testleri ve akıllı ilerleme çemberleri.',
        }}
      />

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-br from-blue-500/10 via-[#8D49A6]/5 to-[#D914C8]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#8D49A6] uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-[#4B075F] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-[#514458]">Öğrenci Özellikleri</span>
          <span>/</span>
          <span className="text-[#4B075F]">Derslerim</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 shadow-xs">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              MÜFREDATLA %100 BİREBİR UYUMLU
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-[#241329] tracking-tight leading-[1.1] mb-6">
              Derslerim: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-[#8D49A6] to-[#D914C8]">
                İnteraktif Tekrar ve Tam Öğrenme
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#514458] font-medium leading-relaxed mb-8">
              Okulda işlenen tüm geçmiş ve güncel konulara tek tıkla dilediğiniz an ulaşın. İnteraktif testler çözerek evde pratik yapın, eksiklerinizi anında tespit edin ve akıllı istatistiklerle hedefinize adım adım yaklaşın.
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
                <div className="text-2xl font-black text-blue-600">312+</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Ders & Ünite Modülü</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#4B075F]">15.000+</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">İnteraktif Alıştırma</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600">7/24 AI</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Soru Çözüm Eğitmeni</div>
              </div>
            </div>
          </div>

          {/* Interactive Simulator */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-[#E8DFEB] shadow-2xl shadow-[#4B075F]/15 overflow-hidden">
              <div className="bg-[#241329] px-5 py-4 flex items-center justify-between text-white border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-blue-300 font-semibold ml-2">edu.oxonom.com/derslerim</span>
                </div>
                <span className="text-[11px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Dönem: 2026-2027
                </span>
              </div>

              {/* Subject Tabs */}
              <div className="p-4 bg-[#FCF9FD] border-b border-[#E8DFEB] flex gap-2 overflow-x-auto scrollbar-hide">
                {subjects.map((sub, i) => (
                  <button
                    key={sub.code}
                    onClick={() => setActiveSubject(i)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeSubject === i
                        ? 'bg-[#4B075F] text-white shadow-xs'
                        : 'bg-white text-[#514458] border border-[#E8DFEB] hover:bg-gray-50'
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>

              {/* Subject Detail View */}
              <div className="p-6 bg-white space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#716779] block">
                      {subjects[activeSubject].code}
                    </span>
                    <h3 className="text-xl font-bold text-[#241329] mt-0.5">
                      {subjects[activeSubject].name}
                    </h3>
                    <p className="text-xs text-[#514458] font-medium mt-1">
                      {subjects[activeSubject].unit}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${subjects[activeSubject].lightBg}`}>
                    {subjects[activeSubject].badge}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="p-4 rounded-2xl bg-[#FCF9FD] border border-[#E8DFEB] space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#241329]">Müfredat İlerlemesi</span>
                    <span className="text-blue-600">{subjects[activeSubject].progress}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-[#8D49A6] rounded-full transition-all duration-500"
                      style={{ width: `${subjects[activeSubject].progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#716779] font-medium pt-1">
                    <span>{subjects[activeSubject].completedCount} / {subjects[activeSubject].topicsCount} Konu Tamamlandı</span>
                    <span>Son Başarı: {subjects[activeSubject].lastScore}</span>
                  </div>
                </div>

                {/* Next Steps Buttons */}
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-[#E8DFEB] hover:border-blue-400/50 bg-white flex items-center justify-between text-xs transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div>
                        <span className="font-bold text-[#241329] block">Kaldığın Yerden Devam Et</span>
                        <span className="text-[11px] text-[#716779]">Eğim Hesaplama ve Grafik Çizimi</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#716779] group-hover:text-blue-600 transition-colors" />
                  </div>

                  <div className="p-3 rounded-xl border border-[#E8DFEB] hover:border-emerald-400/50 bg-white flex items-center justify-between text-xs transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-[#241329] block">Pekiştirme Testi Çöz</span>
                        <span className="text-[11px] text-[#716779]">10 Soru • 15 Dakika • Seviye: Orta</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#716779] group-hover:text-emerald-600 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#FCF9FD] border-t border-[#E8DFEB] flex items-center justify-between text-xs font-bold text-[#4B075F]">
                <span>7/24 Takıldığın Soruya AI Çözümü</span>
                <span className="text-emerald-600 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Anında Aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-blue-600">ÖĞRENME METODOLOJİSİ</span>
            <h2 className="text-3xl font-display font-bold text-[#241329] mt-2">
              Ezber Değil, Kalıcı ve Anlayarak Öğrenme
            </h2>
            <p className="text-sm text-[#716779] font-medium mt-2">
              Pedagojik olarak yapılandırılmış Oxonom döngüsüyle konular kafanıza tam oturur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-blue-400/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#241329] mb-2">Mikro Konu Anlatımları</h3>
              <p className="text-sm text-[#514458] font-medium leading-relaxed">
                Uzun ve sıkıcı ders videoları yerine 5-7 dakikalık konsantre mikro öğrenme adımları ve görsel infografikler.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-[#8D49A6]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#241329] mb-2">Yapay Zekâ Soru Asistanı</h3>
              <p className="text-sm text-[#514458] font-medium leading-relaxed">
                Takıldığınız sorunun fotoğrafını çekin veya yazın; doğrudan cevabı vermek yerine adım adım düşünme yolunu göstersin.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-emerald-400/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#241329] mb-2">Akıllı İlerleme Çemberleri</h3>
              <p className="text-sm text-[#514458] font-medium leading-relaxed">
                Hangi derste hangi kazanımdan tam puan aldığınızı ve hangi konuya biraz daha ağırlık vermeniz gerektiğini canlı görün.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-white rounded-3xl border border-[#E8DFEB] p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-[#241329] mb-3">
              Derslerinizi Akıllı Tekrar ile Bir Üst Seviyeye Taşıyın
            </h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              14 gün ücretsiz deneme fırsatıyla tüm ders ve üniteleri dilediğiniz gibi keşfedin.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <a
              href="https://edu.oxonom.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold text-sm shadow-lg shadow-[#4B075F]/20 transition-all flex items-center gap-2"
            >
              <span>Öğrenci Girişi Yap</span>
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
