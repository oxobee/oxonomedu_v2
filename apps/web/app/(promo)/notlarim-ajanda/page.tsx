'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Clock,
  Bookmark,
  Highlighter,
  Check,
  Plus,
  Tag,
  Folder,
  Layers,
  Search,
} from 'lucide-react';
import JsonLd from '@components/Promo/JsonLd';
import { Notes3DIcon } from '@components/Promo/StudentInteractiveTabs';

export default function NotlarimAjandaPage() {
  
  const [activeCategory, setActiveCategory] = useState<'hepsi' | 'tahta' | 'kisisel' | 'odev'>('hepsi');

  const notesList = [
    {
      id: 1,
      title: 'Türev Formülleri & Maks-Min Notları',
      category: 'tahta',
      badge: 'Akıllı Tahtadan Senkron',
      course: 'Matematik',
      date: 'Bugün 11:20',
      preview: 'Öğretmenin çizdiği f\'(x)=0 kritik noktalar grafiği ve yerel ekstremum tablosu kaydedildi.',
      color: 'border-emerald-200 bg-emerald-50/40 text-emerald-800',
    },
    {
      id: 2,
      title: 'DNA Eşlenmesi & Enzim Basamakları',
      category: 'kisisel',
      badge: 'Kişisel Defter',
      course: 'Fen Bilimleri',
      date: 'Dün 16:45',
      preview: 'Helikaz enzimi hidrojen bağlarını koparır, DNA Polimeraz yeni zinciri 5\'->3\' yönünde sentezler.',
      color: 'border-purple-200 bg-purple-50/40 text-purple-800',
    },
    {
      id: 3,
      title: 'Cümle Türleri Çalışma Kağıdı',
      category: 'odev',
      badge: 'Ödev & Görev',
      course: 'Türkçe',
      date: 'Cuma 18:00',
      preview: 'Sayfa 84-88 arası bağlı ve sıralı cümle örnekleri tamamlanacak.',
      color: 'border-amber-200 bg-amber-50/40 text-amber-800',
    },
  ];

  const filteredNotes = activeCategory === 'hepsi'
    ? notesList
    : notesList.filter((n) => n.category === activeCategory);

  return (
    <div className="pt-32 pb-24 bg-[#FCF9FD] min-h-screen relative overflow-hidden">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Oxonom Edu Notlarım & Ajanda Modülü',
          applicationCategory: 'EducationalSoftware',
          description:
            'Akıllı kategorize ders notları, tahta notu arşivi, ödev ajandası ve haftalık planlama takvimi.',
        }}
      />

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-br from-purple-500/10 via-[#8D49A6]/5 to-[#D914C8]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#8D49A6] uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-[#4B075F] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-[#514458]">Öğrenci Özellikleri</span>
          <span>/</span>
          <span className="text-[#4B075F]">Notlarım & Ajanda</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 shadow-xs">
              <Bookmark className="w-3.5 h-3.5 text-purple-600" />
              AKILLI DİJİTAL DEFTER & PLANLAYICI
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-[#241329] tracking-tight leading-[1.1] mb-6">
              Notlarım & Ajanda: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-[#8D49A6] to-[#D914C8]">
                Düzenli Çalışma, Planlı İlerleme
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#514458] font-medium leading-relaxed mb-8">
              Ders çalışırken aldığınız tüm notları akıllı kategoriler halinde tek bir yerde toplayın. Akıllı tahtada unutmak istemediğiniz önemli detayları kaydedin. Ajandanıza çalışma etkinlikleri ekleyerek zamanınızı çok daha verimli ve planlı yönetin.
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
                <div className="text-2xl font-black text-purple-600">Sınırsız</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Bulut Defter Kapasitesi</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#4B075F]">Akıllı Arama</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Tüm Notlarda Anında Bul</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600">Tam Entegre</div>
                <div className="text-xs text-[#716779] font-medium mt-0.5">Tahta & Ödev Senkronu</div>
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
                  <span className="text-xs font-mono text-purple-300 font-semibold ml-2">edu.oxonom.com/notlarim</span>
                </div>
                <button className="text-[11px] bg-[#4B075F] text-white px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold">
                  <Plus className="w-3 h-3" /> Yeni Not
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="p-3 bg-[#FCF9FD] border-b border-[#E8DFEB] flex gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setActiveCategory('hepsi')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeCategory === 'hepsi' ? 'bg-[#4B075F] text-white' : 'text-[#716779] hover:bg-gray-100'
                  }`}
                >
                  Hepsi ({notesList.length})
                </button>
                <button
                  onClick={() => setActiveCategory('tahta')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeCategory === 'tahta' ? 'bg-[#4B075F] text-white' : 'text-[#716779] hover:bg-gray-100'
                  }`}
                >
                  Tahta Notları
                </button>
                <button
                  onClick={() => setActiveCategory('kisisel')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeCategory === 'kisisel' ? 'bg-[#4B075F] text-white' : 'text-[#716779] hover:bg-gray-100'
                  }`}
                >
                  Kişisel
                </button>
                <button
                  onClick={() => setActiveCategory('odev')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeCategory === 'odev' ? 'bg-[#4B075F] text-white' : 'text-[#716779] hover:bg-gray-100'
                  }`}
                >
                  Ödevler
                </button>
              </div>

              {/* Notes List */}
              <div className="p-5 bg-white space-y-3 max-h-[360px] overflow-y-auto">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-4 rounded-2xl border transition-all hover:shadow-md cursor-pointer ${note.color}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 border border-current">
                        {note.badge}
                      </span>
                      <span className="text-[11px] font-mono opacity-70">
                        {note.date}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#241329] mb-1">
                      {note.title}
                    </h4>

                    <p className="text-xs text-[#514458] font-medium leading-relaxed mb-2">
                      {note.preview}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-bold pt-2 border-t border-black/5">
                      <span className="text-[#8D49A6]">{note.course}</span>
                      <span className="text-[#4B075F] flex items-center gap-1 hover:underline">
                        Görüntüle <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#FCF9FD] border-t border-[#E8DFEB] flex items-center justify-between text-xs">
                <span className="text-[#716779] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#4B075F]" />
                  Ajandada 3 aktif etkinlik var
                </span>
                <span className="text-[#4B075F] font-bold">Haftalık Görünüm</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-purple-400/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Folder className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#241329] mb-2">Akıllı Klasörleme</h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Ders, ünite, etiket ve tarihe göre notlarınızı otomatik düzenler. Sınav haftasında aradığınız bilgiye anında ulaşırsınız.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-[#8D49A6]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FCE8FA] text-[#4B075F] flex items-center justify-center mb-4">
              <Highlighter className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#241329] mb-2">Fosforlu Kalem & Sayfa Eki</h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              PDF ders kitaplarının ve akıllı tahta sayfalarının dilediğiniz yerini fosforlu kalemle çizin, sayfa kenarına yapışkan not iliştirin.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DFEB] p-6 shadow-xs hover:border-emerald-400/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#241329] mb-2">Çalışma Ajandası & Hatırlatıcı</h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Günlük etüt planınızı, ödev teslim günlerini ve deneme sınavlarını ajandanıza ekleyin; Oxonom size zamanında hatırlatsın.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-3xl border border-[#E8DFEB] p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-[#241329] mb-3">
              Daha Düzenli, Daha Başarılı Bir Çalışma Rutini
            </h3>
            <p className="text-sm text-[#514458] font-medium leading-relaxed">
              Oxonom Edu Notlarım & Ajanda ile dağınık defter sayfalarına son verin, tüm notlarınızı cebinizde taşıyın.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <a
              href="https://edu.oxonom.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold text-sm shadow-lg shadow-[#4B075F]/20 transition-all flex items-center gap-2"
            >
              <span>Demo Girişi Yap</span>
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
