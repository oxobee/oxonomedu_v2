'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Gamepad2,
  Trophy,
  Brain,
  Star,
  Play,
  Flame,
  Award,
  Zap,
  RotateCcw,
  Users,
} from 'lucide-react';
import JsonLd from '@components/Promo/JsonLd';
import { Games3DIcon } from '@components/Promo/StudentInteractiveTabs';

export default function OyunlarPage() {
  
  const [activeCategory, setActiveCategory] = useState<'hepsi' | 'zeka' | 'matematik' | 'dil'>('hepsi');

  const games = [
    {
      title: 'Matematik 2048: Sayı Birleştir',
      desc: 'İşlem önceliği, üslü sayılar ve zihinden toplama reflekslerini eğlenceli şekilde geliştir.',
      category: 'matematik',
      plays: '12.4K Oynanma',
      rating: '4.9 ★',
      badge: 'Çok Popüler',
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    },
    {
      title: 'Kelime Avcısı: LGS & YKS Sözlük',
      desc: 'Harfleri birleştir, gizli MEB kazanım kavramlarını bul ve kelime hazineni genişlet.',
      category: 'dil',
      plays: '9.8K Oynanma',
      rating: '4.8 ★',
      badge: 'Zihin Açıcı',
      gradient: 'from-amber-500 via-orange-500 to-rose-600',
    },
    {
      title: 'Hafıza Kartları: Bilim Laboratuvarı',
      desc: 'Periyodik tablo, anatomi ve formülleri eşleştirerek görsel hafızanı güçlendir.',
      category: 'zeka',
      plays: '15.1K Oynanma',
      rating: '5.0 ★',
      badge: 'Liderler Tercihi',
      gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
    },
    {
      title: 'Uzay Macerası: Hızlı Denklem Roketi',
      desc: 'Doğru sonuçları vur, yakıtını doldur ve gezegenler arası bilmece turunu tamamla.',
      category: 'matematik',
      plays: '8.3K Oynanma',
      rating: '4.9 ★',
      badge: 'Yeni',
      gradient: 'from-purple-600 via-pink-600 to-rose-500',
    },
  ];

  const filteredGames = activeCategory === 'hepsi'
    ? games
    : games.filter((g) => g.category === activeCategory);

  return (
    <div className="pt-32 pb-24 bg-[#FCF9FD] min-h-screen relative overflow-hidden">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Oxonom Game Studio Eğitsel Oyunlar',
          applicationCategory: 'EducationalSoftware',
          description:
            'Pedagojik ve bilişsel becerileri geliştiren MEB uyumlu eğitsel oyun platformu.',
        }}
      />

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-br from-indigo-500/10 via-[#8D49A6]/5 to-[#D914C8]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#8D49A6] uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-[#4B075F] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-[#514458]">Öğrenci Özellikleri</span>
          <span>/</span>
          <span className="text-[#4B075F]">Oyunlar</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 shadow-xs">
              <Gamepad2 className="w-3.5 h-3.5 text-indigo-600" />
              OXONOM GAME STUDIO
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-[#241329] tracking-tight leading-[1.1] mb-6">
              Oyunlar: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-[#8D49A6] to-[#D914C8]">
                Eğlenerek Öğrenmenin En Keyifli Hali
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#514458] font-medium leading-relaxed mb-8">
              Sıkıcı ezberleri unutun! Öğrencinin sınıfına ve yaşına uygun özel tasarlanmış eğitici oyunlarla keyifli vakit geçirin. Eğlence ve eğitimi harmanlayan bu sistem sayesinde, çocuklar oyun oynarken farkında olmadan bilişsel becerilerini geliştirir ve yeni bilgiler edinir.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <a
                href="https://edu.oxonom.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#4B075F] to-[#8D49A6] text-white font-bold text-sm shadow-lg shadow-[#4B075F]/20 hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span>Oyunları Keşfet</span>
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
                <div className="text-2xl font-black text-indigo-600">20+ Oyun</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Pedagojik Zekâ Oyunları</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#4B075F]">Liderlik Tablosu</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Haftalık Okul Turnuvaları</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600">%100 Güvenli</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Reklamsız & Çocuk Dostu</div>
              </div>
            </div>
          </div>

          {/* Interactive Game Arena Simulator */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-[#E8DFEB] shadow-2xl shadow-[#4B075F]/15 overflow-hidden">
              <div className="bg-[#241329] px-5 py-4 flex items-center justify-between text-white border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-indigo-300 font-semibold ml-2">edu.oxonom.com/oyunlar</span>
                </div>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Turnuva Aktif
                </span>
              </div>

              {/* Category Pills */}
              <div className="p-3 bg-[#FCF9FD] border-b border-[#E8DFEB] flex gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setActiveCategory('hepsi')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeCategory === 'hepsi' ? 'bg-[#4B075F] text-white' : 'text-[#716779] hover:bg-gray-100'
                  }`}
                >
                  Hepsi
                </button>
                <button
                  onClick={() => setActiveCategory('zeka')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeCategory === 'zeka' ? 'bg-[#4B075F] text-white' : 'text-[#716779] hover:bg-gray-100'
                  }`}
                >
                  Zekâ & Hafıza
                </button>
                <button
                  onClick={() => setActiveCategory('matematik')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeCategory === 'matematik' ? 'bg-[#4B075F] text-white' : 'text-[#716779] hover:bg-gray-100'
                  }`}
                >
                  Matematik
                </button>
                <button
                  onClick={() => setActiveCategory('dil')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeCategory === 'dil' ? 'bg-[#4B075F] text-white' : 'text-[#716779] hover:bg-gray-100'
                  }`}
                >
                  Kelime & Dil
                </button>
              </div>

              {/* Games Showcase Cards */}
              <div className="p-5 bg-white space-y-3 max-h-[350px] overflow-y-auto">
                {filteredGames.map((game, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-[#E8DFEB] hover:border-indigo-400/50 bg-white transition-all hover:shadow-md cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {game.badge}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-[#716779]">
                        <span>{game.rating}</span>
                        <span>•</span>
                        <span>{game.plays}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#241329] group-hover:text-indigo-600 transition-colors">
                          {game.title}
                        </h4>
                        <p className="text-xs text-[#514458] font-medium leading-relaxed mt-1 line-clamp-2">
                          {game.desc}
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4B075F] to-[#8D49A6] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#FCF9FD] border-t border-[#E8DFEB] flex items-center justify-between text-xs font-bold text-[#4B075F]">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Haftalık Puan: 2.850 XP
                </span>
                <span className="text-indigo-600">Liderlik Sıralaması: 5.</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-indigo-400/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#241329] mb-2">Bilişsel Beceri Gelişimi</h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Oyunlar rastgele tasarlanmamıştır. Odaklanma, uzamsal düşünme, zihinden işlem ve çalışma belleğini güçlendiren pedagojik mekanikler içerir.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-[#8D49A6]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FCE8FA] text-[#4B075F] flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#241329] mb-2">Okul İçi Tatlı Rekabet</h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Kendi sınıfınız ve okulunuzdaki arkadaşlarınızla haftalık turnuvalarda yarışın, puan toplayın ve şampiyonluk rozetlerini kazanın.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-emerald-400/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#241329] mb-2">%100 Güvenli & Pedagojik</h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Hiçbir zararlı reklam, pop-up veya bağımlılık yapıcı tuzak içermez. Yalnızca eğitim ve zihinsel gelişim odaklıdır.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-3xl border border-[#E8DFEB] p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-[#241329] mb-3">
              Oynayarak Öğrenmenin Tadını Çıkarın
            </h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Oxonom Game Studio ile ders çalışmak artık bir zorunluluk değil, eğlenceli ve ödüllendirici bir deneyim.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <a
              href="https://edu.oxonom.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold text-sm shadow-lg shadow-[#4B075F]/20 transition-all flex items-center gap-2"
            >
              <span>Demo Oyunları Başlat</span>
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
