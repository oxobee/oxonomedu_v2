'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  Download,
  Tv,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Terminal,
  HelpCircle,
  Layers,
  GraduationCap,
  PenTool,
  School,
  Monitor,
  Check,
  Apple,
  Cpu,
} from 'lucide-react';
import JsonLd from '@components/Promo/JsonLd';

// Ultra-clean Brand Windows SVG Logo
function WindowsIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  );
}

// Ultra-clean Pardus / Linux Tux SVG Logo
function LinuxPardusIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12.002 0c-3.14 0-5.69 2.548-5.69 5.688 0 1.25.408 2.408 1.1 3.344C6.544 9.946 6 11.233 6 12.668c0 1.488.6 2.825 1.558 3.791C6.602 17.433 6 18.783 6 20.25c0 1.517.65 2.25 1.75 2.25 1.83 0 3.31-2.12 4.252-4.08.942 1.96 2.422 4.08 4.252 4.08 1.1 0 1.75-.733 1.75-2.25 0-1.467-.602-2.817-1.558-3.791.958-.966 1.558-2.303 1.558-3.791 0-1.435-.544-2.722-1.412-3.636.692-.936 1.1-2.094 1.1-3.344 0-3.14-2.55-5.688-5.69-5.688zm-.002 3c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3z" />
    </svg>
  );
}

// Google Play Badge Icon
function AndroidPlayIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M3.609 1.814L13.792 12 3.61 22.186c-.37-.282-.61-.75-.61-1.312V3.126c0-.562.24-1.03.61-1.312zm11.393 11.393l2.671 2.671-12.015 6.866 9.344-9.537zM4.658 3.064l12.015 6.866-2.671 2.671-9.344-9.537zm13.753 7.857l2.846 1.626c.725.414.725 1.09 0 1.506l-2.846 1.626-2.122-2.379 2.122-2.379z" />
    </svg>
  );
}

export default function DownloadPage() {
  
  const [activeTab, setActiveTab] = useState<'hepsi' | 'tahta' | 'mobil'>('hepsi');

  const mobileApps = [
    {
      id: 'app-student',
      title: 'Öğrenci Uygulaması',
      subtitle: 'Oxonom Öğrenci',
      desc: 'Ders tekrarları, 7/24 AI soru çözüm asistanı, 312 MEB kitabı, ödev ajandası ve eğitsel zeka oyunları her an cebinizde.',
      icon: GraduationCap,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Çok Yakında',
      features: ['7/24 Soru Çözüm Asistanı', 'Canlı Karne & Röntgen', 'Çevrimdışı E-Kitap Okuyucu'],
    },
    {
      id: 'app-teacher',
      title: 'Öğretmen Uygulaması',
      subtitle: 'Oxonom Öğretmen',
      desc: 'Sınıf yoklaması, akıllı tahtayı uzaktan kumanda etme, anlık ödev atama, zümre soru bankası ve veli bildirim kanalı.',
      icon: PenTool,
      color: 'from-purple-600 to-pink-600',
      badge: 'Çok Yakında',
      features: ['Tahta Uzaktan Kontrolü', 'Hızlı Sınıf Yoklaması', 'Zümre Ortak Sınav Hazırlığı'],
    },
    {
      id: 'app-admin',
      title: 'İdare & Yönetim Uygulaması',
      subtitle: 'Oxonom Kampüs İdare',
      desc: 'K-12 okul şube kütüğü, dönemlik karne ve devamsızlık analizleri, genel duyurular ve kampüs LMS yönetim konsolu.',
      icon: School,
      color: 'from-emerald-600 to-teal-700',
      badge: 'Çok Yakında',
      features: ['Şube & Öğrenci Kütüğü', 'Anlık Devamsızlık Takibi', 'Toplu Veli Duyuru Sistemi'],
    },
  ];

  return (
    <div className="pt-32 pb-24 bg-[#FCF9FD] min-h-screen relative overflow-hidden">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Oxonom Edu Akıllı Tahta ve Mobil Uygulamalar',
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Windows, Pardus Linux, iOS, Android',
          description:
            'Akıllı tahta, öğrenci, öğretmen ve okul idaresi için yerel masaüstü ve mobil uygulamalar.',
        }}
      />

      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-br from-[#4B075F]/10 via-[#8D49A6]/5 to-[#D914C8]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#8D49A6] uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-[#4B075F] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-[#4B075F]">Uygulamaları İndir</span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FCE8FA] border border-[#F0D8FA] text-[#4B075F] rounded-full text-[11px] font-black uppercase tracking-widest mb-6 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D914C8]" />
            OXONOM EDU UYGULAMA MERKEZİ
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-[#241329] tracking-tight leading-[1.08] mb-6"
          >
            Eğitimi Her Ekrana Taşıyın: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8]">
              Masaüstü ve Mobil Uygulamalar
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-[#514458] font-medium leading-relaxed max-w-2xl mx-auto mb-8"
          >
            Sınıflardaki akıllı tahtalardan evdeki bilgisayarlara ve cebinizdeki telefonlara kadar kesintisiz, hızlı ve güvenli öğrenme ekosistemi.
          </motion.p>

          {/* Quick Platform Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-bold text-[#514458]">
            <span className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFEB] shadow-xs flex items-center gap-1.5">
              <WindowsIcon className="w-3.5 h-3.5 text-blue-600" /> Windows (İndirilebilir)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFEB] shadow-xs flex items-center gap-1.5">
              <LinuxPardusIcon className="w-3.5 h-3.5 text-amber-600" /> Pardus ETAP (İndirilebilir)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-[#4B075F] border border-purple-200 shadow-xs flex items-center gap-1.5">
              <Apple className="w-3.5 h-3.5" /> iOS (Çok Yakında)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs flex items-center gap-1.5">
              <AndroidPlayIcon className="w-3.5 h-3.5 text-emerald-600" /> Android (Çok Yakında)
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white border border-[#E8DFEB] shadow-md">
            <button
              onClick={() => setActiveTab('hepsi')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'hepsi'
                  ? 'bg-[#4B075F] text-white shadow-sm'
                  : 'text-[#716779] hover:text-[#241329]'
              }`}
            >
              Tüm Uygulamalar
            </button>
            <button
              onClick={() => setActiveTab('tahta')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'tahta'
                  ? 'bg-[#4B075F] text-white shadow-sm'
                  : 'text-[#716779] hover:text-[#241329]'
              }`}
            >
              Akıllı Tahta (Windows & Pardus)
            </button>
            <button
              onClick={() => setActiveTab('mobil')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'mobil'
                  ? 'bg-[#4B075F] text-white shadow-sm'
                  : 'text-[#716779] hover:text-[#241329]'
              }`}
            >
              Mobil Uygulamalar (Yakında)
            </button>
          </div>
        </div>

        {/* ═══ SECTION 1: AKILLI TAHTA MASAÜSTÜ UYGULAMASI (WINDOWS & PARDUS) ═══ */}
        {(activeTab === 'hepsi' || activeTab === 'tahta') && (
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#241329]">
                  Akıllı Tahta Masaüstü Uygulaması
                </h2>
                <p className="text-xs text-[#716779] font-medium">
                  Sınıflardaki interaktif tahtalar ve kişisel bilgisayarlar için yerel, yüksek performanslı sürüm.
                </p>
              </div>
            </div>

            {/* Featured App Big Card */}
            <div className="rounded-[2.5rem] bg-gradient-to-br from-[#241329] via-[#350444] to-[#4B075F] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-[#D914C8]/30">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#D914C8]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-400/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    v2.4.1 Güncel Sürüm (Yayında)
                  </div>

                  <h3 className="text-3xl sm:text-4xl font-display font-black mb-4">
                    Oxonom Akıllı Tahta
                  </h3>

                  <p className="text-sm sm:text-base text-white/80 font-medium leading-relaxed mb-6">
                    Milli Eğitim Bakanlığı Fatih Projesi ve Pardus ETAP akıllı tahtalarıyla %100 tam uyumlu yerli yazılım. Infinite Canvas, LaTeX formül motoru, el yazısı yumuşatma, MEB kılavuz çizgileri ve çevrimdışı çalışma desteğiyle sınıfta sıfır gecikme!
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 text-xs font-semibold text-white/85">
                    <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Sıfır Gecikme (60 FPS)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Çevrimdışı Çalışma</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Öğrenci Profili Senkronu</span>
                    </div>
                  </div>

                  {/* 2 Download Options: Windows & Pardus */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {/* Windows Option */}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Oxonom Akıllı Tahta Windows v2.4.1 indirme bağlantısı hazırlanıyor.');
                      }}
                      className="flex-1 py-4 px-6 rounded-2xl bg-white text-[#241329] hover:bg-gray-100 transition-all font-bold text-sm shadow-xl flex items-center justify-between group active:scale-98"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                          <WindowsIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <span className="block text-xs text-[#716779] font-medium">Windows İçin İndir</span>
                          <span className="block text-sm font-black text-[#241329]">Windows 10 / 11 (.exe)</span>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                    </a>

                    {/* Pardus / Linux Option */}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Oxonom Akıllı Tahta Pardus ETAP (.deb) paketi indirme bağlantısı hazırlanıyor.');
                      }}
                      className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white hover:opacity-95 transition-all font-bold text-sm shadow-xl flex items-center justify-between group active:scale-98"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-md backdrop-blur-sm">
                          <LinuxPardusIcon className="w-5 h-5 text-amber-300" />
                        </div>
                        <div className="text-left">
                          <span className="block text-xs text-white/80 font-medium">Pardus / Linux İçin İndir</span>
                          <span className="block text-sm font-black text-white">Pardus ETAP (.deb)</span>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-white group-hover:translate-y-0.5 transition-transform" />
                    </a>
                  </div>

                  <p className="text-[11px] text-white/60 font-medium mt-3 text-center sm:text-left">
                    * 64-bit işletim sistemleri için uygundur. Ücretsiz deneme hesabı veya öğretmen hesabıyla doğrudan giriş yapabilirsiniz.
                  </p>
                </div>

                {/* Right Side Mockup Graphic */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="relative w-full max-w-sm rounded-2xl bg-black/40 border border-white/15 p-5 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span className="text-xs font-mono text-emerald-300 ml-2">Oxonom Board v2.4.1</span>
                      </div>
                      <span className="text-[10px] text-white/60 font-mono">PARDUS ETAP OK</span>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[#8D49A6] block font-bold mb-1">// Donanım Optimizasyonu</span>
                        <p className="text-white/80 text-[11px]">Akıllı tahta dokunmatik paneli ve çift kalem desteği aktif.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[#D914C8] block font-bold mb-1">// Yerel Kurulum Paketi</span>
                        <div className="flex justify-between text-[11px] text-white/70">
                          <span>Windows (.exe): 84 MB</span>
                          <span>Pardus (.deb): 79 MB</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Dijital İmzalı & MEB Güvenlik Standartlarına Tam Uyumlu</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ SECTION 2: MOBİL UYGULAMALAR (IOS & ANDROID - ÇOK YAKINDA) ═══ */}
        {(activeTab === 'hepsi' || activeTab === 'mobil') && (
          <div className="mb-24">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FCE8FA] text-[#4B075F] flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#241329]">
                    Mobil Uygulamalar (iOS & Android)
                  </h2>
                  <p className="text-xs text-[#716779] font-medium">
                    Öğrenci, öğretmen ve idare için özel tasarlanmış mobil uygulamalar çok yakında App Store ve Google Play'de!
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Çok Yakında Mağazalarda
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {mobileApps.map((app) => {
                const Icon = app.icon;
                return (
                  <div
                    key={app.id}
                    className="rounded-3xl bg-white border border-[#E8DFEB] p-8 shadow-lg hover:border-[#8D49A6]/40 transition-all flex flex-col justify-between relative group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${app.color} text-white flex items-center justify-center shadow-md`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          {app.badge}
                        </span>
                      </div>

                      <span className="text-[10px] font-black uppercase tracking-wider text-[#8D49A6] block">
                        {app.subtitle}
                      </span>
                      <h3 className="text-2xl font-bold text-[#241329] mt-0.5 mb-3">
                        {app.title}
                      </h3>
                      <p className="text-xs text-[#514458] font-medium leading-relaxed mb-6">
                        {app.desc}
                      </p>

                      <div className="space-y-2.5 pt-6 border-t border-[#E8DFEB] mb-8">
                        {app.features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-bold text-[#241329]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* App Store & Google Play Buttons (Disabled / Coming Soon) */}
                    <div className="space-y-2.5 pt-4 border-t border-[#E8DFEB]/70">
                      <div className="w-full py-3 px-4 rounded-xl bg-gray-50 border border-gray-200 text-[#514458] flex items-center justify-between text-xs font-bold cursor-not-allowed select-none opacity-85">
                        <div className="flex items-center gap-2.5">
                          <Apple className="w-4 h-4 text-[#241329]" />
                          <span>App Store (iOS)</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-gray-200 text-[#716779] font-black">
                          Çok Yakında
                        </span>
                      </div>

                      <div className="w-full py-3 px-4 rounded-xl bg-gray-50 border border-gray-200 text-[#514458] flex items-center justify-between text-xs font-bold cursor-not-allowed select-none opacity-85">
                        <div className="flex items-center gap-2.5">
                          <AndroidPlayIcon className="w-4 h-4 text-emerald-600" />
                          <span>Google Play (Android)</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-gray-200 text-[#716779] font-black">
                          Çok Yakında
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ SECTION 3: SYSTEM REQUIREMENTS & PARDUS ETAP INSTALLATION GUIDE ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          {/* Pardus Installation Guide */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8DFEB] p-8 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#241329]">
                  Pardus ETAP Akıllı Tahta Kurulum Rehberi
                </h3>
                <p className="text-xs text-[#716779] font-medium">
                  3 adımda okulunuzdaki tüm Pardus akıllı tahtalara tek tıkla kurulum yapın.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-medium text-[#514458]">
              <div className="p-4 rounded-2xl bg-[#FCF9FD] border border-[#E8DFEB] flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#4B075F] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-[#241329] block font-bold mb-0.5">.deb Kurulum Dosyasını İndirin</strong>
                  <span>Yukarıdaki Pardus / Linux butonuna tıklayarak en güncel .deb paketini akıllı tahtanıza kaydedin.</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FCF9FD] border border-[#E8DFEB] flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#4B075F] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-[#241329] block font-bold mb-0.5">Pardus Paket Kurucu ile Açın</strong>
                  <span>İndirilen dosyaya çift tıklayarak Pardus ETAP dahili paket kurucusunu başlatın ve "Paketi Kur" butonuna basın.</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FCF9FD] border border-[#E8DFEB] flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#4B075F] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-[#241329] block font-bold mb-0.5">Öğretmen Hesabınızla Giriş Yapın</strong>
                  <span>Uygulamalar menüsünden Oxonom Akıllı Tahta'yı başlatın; okul hesabınızla oturum açarak dersinizi hemen başlatın.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Minimum Requirements */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8DFEB] p-8 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#4B075F] flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#241329]">
                    Sistem Gereksinimleri
                  </h3>
                  <p className="text-xs text-[#716779] font-medium">
                    Tüm standart K-12 akıllı tahtalarında akıcı çalışır.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-[#E8DFEB] text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#716779] font-medium">İşletim Sistemi</span>
                  <span className="font-bold text-[#241329]">Windows 10/11 & Pardus 21+</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#716779] font-medium">Bellek (RAM)</span>
                  <span className="font-bold text-[#241329]">En az 2 GB (4 GB önerilir)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#716779] font-medium">Depolama Alanı</span>
                  <span className="font-bold text-[#241329]">250 MB boş disk alanı</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#716779] font-medium">Ekran Desteği</span>
                  <span className="font-bold text-[#241329]">Dokunmatik, Stylus Kalem & Mouse</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#716779] font-medium">İnternet Bağlantısı</span>
                  <span className="font-bold text-emerald-700">Gerekmez (Çevrimdışı Çalışır)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>MEB Fatih Projesi Faz 1, 2 ve 3 akıllı tahtalarının tümüyle %100 uyumludur.</span>
            </div>
          </div>
        </div>

        {/* ═══ BOTTOM CTA BANNER ═══ */}
        <div className="bg-gradient-to-br from-[#241329] via-[#350444] to-[#4B075F] rounded-[2.5rem] p-8 sm:p-12 md:p-16 text-white shadow-2xl relative overflow-hidden border border-[#D914C8]/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D914C8]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D914C8]/20 border border-[#D914C8]/40 text-xs font-black uppercase tracking-widest text-[#FCE8FA] mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#D914C8]" />
              14 GÜN ÜCRETSİZ DENEYİN
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white mt-1 mb-3 leading-tight tracking-tight">
              Akıllı Tahtayı Sınıfınızda <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-[#FCE8FA]">
                Hemen Test Edin!
              </span>
            </h3>
            <p className="text-sm sm:text-base text-white/80 font-medium leading-relaxed mb-6">
              Uygulamayı indirin, 14 gün boyunca kredi kartsız sıfır risk ile tüm sınıfınızda deneyimleyin.
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4 shrink-0 w-full md:w-auto">
            <div className="w-64 sm:w-80 md:w-96 lg:w-[400px] max-w-full drop-shadow-[0_25px_50px_rgba(217,20,200,0.45)] select-none">
              <img
                src="/mascot/mascot-14gun-badge.png"
                alt="Oxonom Edu 14 Gün Ücretsiz Rozet"
                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <a
                href="https://edu.oxonom.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D914C8] via-[#B811AA] to-[#8D49A6] text-white font-black text-sm shadow-xl shadow-[#D914C8]/40 hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>14 Gün Ücretsiz Başla</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <Link
                href="/paketler"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 text-white border border-white/20 font-bold text-sm hover:bg-white/20 transition-all text-center"
              >
                Paketleri İncele
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
