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
  Bookmark,
  Highlighter,
  Search,
  Star,
  Eye,
  Layers,
  GraduationCap,
  Download,
  Share2,
} from 'lucide-react';
import JsonLd from '@components/Promo/JsonLd';
import { Library3DIcon } from '@components/Promo/StudentInteractiveTabs';

export default function KitaplikPage() {
  
  const [activeCategory, setActiveCategory] = useState<'meb' | 'klasik' | 'bilim'>('meb');

  const books = [
    {
      title: '8. Sınıf Matematik Ders Kitabı',
      author: 'MEB Devlet Kitapları',
      grade: '8. Sınıf',
      pages: 284,
      readPercent: 68,
      coverColor: 'from-blue-600 to-indigo-700',
      tag: 'MEB Müfredat',
      cat: 'meb',
    },
    {
      title: 'Küçük Prens (Sesli & Resimli)',
      author: 'Antoine de Saint-Exupéry',
      grade: 'K-12 Tüm Kademeler',
      pages: 112,
      readPercent: 100,
      coverColor: 'from-amber-500 to-orange-600',
      tag: 'Dünya Klasiği',
      cat: 'klasik',
    },
    {
      title: 'Yapay Zekâ ve Geleceğin Meslekleri',
      author: 'Oxonom Bilim Dizisi',
      grade: '7-12. Sınıf',
      pages: 96,
      readPercent: 42,
      coverColor: 'from-purple-600 to-pink-600',
      tag: 'Popüler Bilim',
      cat: 'bilim',
    },
    {
      title: '8. Sınıf Fen Bilimleri Ders Kitabı',
      author: 'MEB Devlet Kitapları',
      grade: '8. Sınıf',
      pages: 260,
      readPercent: 85,
      coverColor: 'from-emerald-600 to-teal-700',
      tag: 'MEB Müfredat',
      cat: 'meb',
    },
  ];

  const filteredBooks = books.filter((b) => b.cat === activeCategory || activeCategory === 'meb');

  return (
    <div className="pt-32 pb-24 bg-[#FCF9FD] min-h-screen relative overflow-hidden">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Oxonom Edu Dijital Kitaplık',
          applicationCategory: 'EducationalSoftware',
          description:
            '312 MEB ders kitabı flipbook kütüphanesi, sesli hikayeler, dünya klasikleri ve sayfa üstü dijital not alma.',
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
          <span className="text-[#4B075F]">Kitaplık</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 shadow-xs">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              312 MEB KİTABI & DİJİTAL FLIPBOOK
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-[#241329] tracking-tight leading-[1.1] mb-6">
              Kitaplık: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-[#8D49A6] to-[#D914C8]">
                Yaşa ve Seviyeye Özel Dijital Kütüphane
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#514458] font-medium leading-relaxed mb-8">
              Öğrencinin yaş grubuna ve sınıf seviyesine en uygun, pedagojik olarak incelenmiş yüzlerce eğitici kitaba sınırsız erişim sağlayın. Okuma deneyiminizi zenginleştirin, dilediğiniz yerin altını çizin ve kendi çalışma notlarınızı oluşturun.
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
                <div className="text-2xl font-black text-indigo-600">312 Kitap</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Tüm MEB Ders Kitapları</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#4B075F]">Flipbook</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Gerçek Sayfa Çevirme Hissi</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600">Fosforlu Kalem</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Sayfa Üstü Dijital Not</div>
              </div>
            </div>
          </div>

          {/* Interactive Bookshelf Simulator */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-[#E8DFEB] shadow-2xl shadow-[#4B075F]/15 overflow-hidden">
              <div className="bg-[#241329] px-5 py-4 flex items-center justify-between text-white border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-indigo-300 font-semibold ml-2">edu.oxonom.com/kitaplik</span>
                </div>
                <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Kütüphane
                </span>
              </div>

              {/* Category Pills */}
              <div className="p-3 bg-[#FCF9FD] border-b border-[#E8DFEB] flex gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setActiveCategory('meb')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeCategory === 'meb' ? 'bg-[#4B075F] text-white' : 'text-[#716779] hover:bg-gray-100'
                  }`}
                >
                  MEB Kitapları
                </button>
                <button
                  onClick={() => setActiveCategory('klasik')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeCategory === 'klasik' ? 'bg-[#4B075F] text-white' : 'text-[#716779] hover:bg-gray-100'
                  }`}
                >
                  Dünya Klasikleri
                </button>
                <button
                  onClick={() => setActiveCategory('bilim')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeCategory === 'bilim' ? 'bg-[#4B075F] text-white' : 'text-[#716779] hover:bg-gray-100'
                  }`}
                >
                  Bilim & Teknoloji
                </button>
              </div>

              {/* Book Grid */}
              <div className="p-5 bg-white space-y-3 max-h-[350px] overflow-y-auto">
                {filteredBooks.map((book, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-[#E8DFEB] hover:border-indigo-400/50 bg-white flex items-center gap-4 transition-all hover:shadow-md cursor-pointer group"
                  >
                    <div className={`w-14 h-20 rounded-xl bg-gradient-to-br ${book.coverColor} text-white flex flex-col justify-between p-2 shrink-0 shadow-md`}>
                      <span className="text-[8px] font-bold opacity-80 uppercase tracking-tighter">Oxonom</span>
                      <BookOpen className="w-4 h-4 opacity-90 mx-auto" />
                      <span className="text-[8px] font-mono text-center opacity-80">{book.pages}s</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {book.tag}
                        </span>
                        <span className="text-[11px] text-[#716779] font-medium">{book.grade}</span>
                      </div>

                      <h4 className="text-xs font-bold text-[#241329] truncate group-hover:text-indigo-600 transition-colors">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-[#716779] truncate">{book.author}</p>

                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${book.readPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-indigo-600">
                          %{book.readPercent}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-[#716779] group-hover:text-[#4B075F]">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#FCF9FD] border-t border-[#E8DFEB] flex items-center justify-between text-xs font-bold text-[#4B075F]">
                <span>Fosforlu Kalem & Sayfa Notları Senkron</span>
                <span className="text-indigo-600 flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5" /> Çevrimdışı Okuma
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-indigo-400/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#241329] mb-2">İnteraktif Flipbook Teknolojisi</h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              PDF ağırlığı ve yavaşlığı yok. Gerçek kitap gibi sayfa çevirme hissi, akıcı zoom ve sıfır gecikme ile konforlu okuma.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-[#8D49A6]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FCE8FA] text-[#4B075F] flex items-center justify-center mb-4">
              <Highlighter className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#241329] mb-2">Sayfa Üzerine Not ve Çizim</h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Önemli tanımların altını farklı renklerle çizin, sayfa kenarlarına sorular yazın ve bu notları çalışma ajandanızla eşleyin.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-emerald-400/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#241329] mb-2">Hızlı Okuma Modu Entegrasyonu</h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Kitaplıktaki tüm metinleri 1 Dk Hızlı Okuma ve takistoskop atölyesine aktararak okuma hızınızı (WPM) adım adım artırın.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-3xl border border-[#E8DFEB] p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-[#241329] mb-3">
              Yüzlerce Kitaba Tek Tıkla Ulaşın
            </h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Çantanızda ağır kitaplar taşımak yerine tüm MEB ders kitaplarını tabletinizde ve bilgisayarınızda açın.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <a
              href="https://edu.oxonom.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold text-sm shadow-lg shadow-[#4B075F]/20 transition-all flex items-center gap-2"
            >
              <span>Demo Kitaplığı Aç</span>
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
