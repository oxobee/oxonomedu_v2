'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { blogPosts } from '@lib/promo/constants';
import { 
  Search, 
  Sparkles, 
  Clock, 
  GraduationCap, 
  Calendar, 
  ArrowRight, 
  BookOpen, 
  Brain, 
  Monitor, 
  Gamepad2, 
  CheckCircle2,
  TrendingUp,
  Tag
} from 'lucide-react';
import JsonLd from '@components/Promo/JsonLd';

function getCategoryIcon(categorySlug: string) {
  switch (categorySlug) {
    case 'egitim-teknolojileri':
      return Monitor;
    case 'pedagoji-ve-yapay-zeka':
      return Brain;
    case 'bilissel-gelisim':
      return Gamepad2;
    default:
      return BookOpen;
  }
}

function BlogCardVisual({ categorySlug, title, index }: { categorySlug: string; title: string; index: number }) {
  const Icon = getCategoryIcon(categorySlug);

  return (
    <div className="relative aspect-[16/9] overflow-hidden border-b border-[#E8DFEB] bg-gradient-to-br from-[#241329] via-[#35153E] to-[#4B075F] p-6 text-white group-hover:scale-[1.01] transition-transform duration-500">
      {/* Background patterned overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#D914C8_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
      
      {/* Glow effect */}
      <motion.div
        className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#D914C8]/30 blur-2xl pointer-events-none"
        animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4.5, repeat: Infinity, delay: index * 0.3 }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
            <Icon className="h-4 w-4 text-[#FCE8FA]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-white">Oxonom Edu Pedagoji</span>
          </div>
          <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">1-8. Sınıf</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="text-[11px] font-bold text-[#FCE8FA]/90">Uzman Makalesi</span>
          </div>
          <h3 className="line-clamp-2 text-base md:text-lg font-bold leading-snug text-white group-hover:text-[#FCE8FA] transition-colors">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryList = [
    { id: 'all', label: 'Tüm Yazılar' },
    { id: 'Eğitim Teknolojileri', label: 'Eğitim Teknolojileri' },
    { id: 'Pedagoji & Yapay Zekâ', label: 'Pedagoji & Yapay Zekâ' },
    { id: 'Bilişsel Gelişim & Oyun', label: 'Bilişsel Gelişim & Oyun' },
  ];

  const filteredPosts = [...blogPosts].reverse().filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find(p => p.featured) || blogPosts[0];

  return (
    <div className="pt-28 md:pt-36 pb-24 bg-[#FCF9FD] min-h-screen relative overflow-hidden">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Oxonom Edu Pedagoji & Teknoloji Blogu",
        "url": "https://oxonomedu.vercel.app/blog",
        "description": "Eğitimde teknolojinin önemi, MEB müfredatına tam uyumlu akıllı tahta entegrasyonu ve bilişsel gelişim makaleleri."
      }} />

      {/* Background Decorative Blurs */}
      <div className="absolute top-12 right-0 w-[550px] h-[550px] bg-[#4B075F]/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-96 left-0 w-[450px] h-[450px] bg-[#D914C8]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-[#E8DFEB] text-[#4B075F] rounded-full text-xs font-bold uppercase tracking-widest mb-4 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D914C8]" />
            EĞİTİMDE TEKNOLOJİ & PEDAGOJİ
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-[#241329] mb-5 tracking-tight leading-[1.18]"
          >
            Eğitimde Teknolojinin Gücü ve Bilişsel Gelişim
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#514458] text-base sm:text-lg font-medium leading-relaxed"
          >
            1. sınıftan 8. sınıfa akıllı tahta entegrasyonu, yapay zekâ destekli bireysel öğrenme ve bilişsel gelişim atölyeleri üzerine uzman rehberler.
          </motion.p>
        </div>

        {/* FEATURED POST BANNER (Only on all/empty search) */}
        {activeCategory === 'all' && !searchQuery && featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-14"
          >
            <div className="relative rounded-3xl bg-gradient-to-br from-[#241329] via-[#35153E] to-[#4B075F] border border-[#8D49A6]/30 overflow-hidden shadow-xl shadow-[#4B075F]/15 group">
              {/* Pattern and glow */}
              <div className="absolute inset-0 bg-[radial-gradient(#D914C8_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-15" />
              <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#D914C8]/25 blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 md:p-12">
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D914C8]/30 border border-[#D914C8]/40 text-[#FCE8FA] text-xs font-black uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> Öne Çıkan Baş Makale
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold">
                      {featuredPost.category}
                    </span>
                    <span className="text-xs text-white/60 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white mb-4 leading-tight group-hover:text-[#FCE8FA] transition-colors">
                    <Link href={`/${featuredPost.categorySlug}/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h2>

                  <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-6 font-normal line-clamp-3">
                    {featuredPost.summary}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/15">
                    <div className="flex items-center gap-3">
                      <img 
                        src={featuredPost.author.avatar} 
                        alt={featuredPost.author.name}
                        className="w-10 h-10 rounded-full bg-white/20 p-1 border border-white/30 object-contain" 
                      />
                      <div>
                        <div className="text-sm font-bold text-white">{featuredPost.author.name}</div>
                        <div className="text-xs text-white/60">{featuredPost.author.role}</div>
                      </div>
                    </div>

                    <Link 
                      href={`/${featuredPost.categorySlug}/${featuredPost.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#4B075F] font-bold text-xs sm:text-sm hover:bg-[#FCE8FA] transition-all shadow-md group/btn"
                    >
                      <span>Makaleyi Oku</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-full max-w-sm rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 text-white shadow-2xl relative">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/15">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-[#FCE8FA]" />
                        <span className="text-xs font-bold uppercase tracking-wider">Pedagojik Özet</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Doğrulanmış
                      </span>
                    </div>

                    <ul className="space-y-3 text-xs sm:text-sm text-white/90">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#D914C8] shrink-0 mt-0.5" />
                        <span>Sınıftaki tahta notlarının evdeki öğrenci profiline canlı senkronu</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#D914C8] shrink-0 mt-0.5" />
                        <span>Ebbinghaus unutma eğrisini kıran günlük akıllı tekrar döngüsü</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#D914C8] shrink-0 mt-0.5" />
                        <span>1. sınıftan 8. sınıfa kadar kesintisiz akademik başarı takibi</span>
                      </li>
                    </ul>

                    <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/70">
                      <span>Yayın: {featuredPost.date}</span>
                      <span className="font-semibold text-[#FCE8FA]">Kalıcı Öğrenme</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* FILTERS & SEARCH BAR */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 mb-10">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-3 md:pb-0 scrollbar-none">
            {categoryList.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id 
                    ? 'bg-[#4B075F] text-white shadow-md shadow-[#4B075F]/25 scale-[1.02]' 
                    : 'bg-white text-[#716779] hover:bg-[#FCF9FD] hover:text-[#4B075F] border border-[#E8DFEB]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716779]" />
            <input 
              type="text" 
              placeholder="Makale, konu veya etiket ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#E8DFEB] text-xs font-medium text-[#241329] placeholder:text-[#A095A6] focus:outline-none focus:border-[#4B075F] focus:ring-2 focus:ring-[#4B075F]/15 transition-all shadow-xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#716779] hover:text-[#4B075F]"
              >
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* POSTS GRID */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8DFEB] p-8">
            <BookOpen className="w-12 h-12 text-[#716779] mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-bold text-[#241329] mb-1">Aradığınız kriterlere uygun makale bulunamadı</h3>
            <p className="text-sm text-[#716779] mb-6">Lütfen farklı bir arama terimi deneyin veya filtreleri temizleyin.</p>
            <button 
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="px-5 py-2 bg-[#4B075F] text-white rounded-full text-xs font-bold hover:bg-[#35153E] transition-colors"
            >
              Filtreleri Sıfırla
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mb-16">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, index) => (
                <motion.article 
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  className="bg-white rounded-3xl border border-[#E8DFEB] overflow-hidden flex flex-col group hover:border-[#8D49A6]/50 hover:shadow-xl hover:shadow-[#4B075F]/10 transition-all duration-300"
                >
                  <Link href={`/${post.categorySlug}/${post.slug}`} className="block overflow-hidden">
                    <BlogCardVisual categorySlug={post.categorySlug} title={post.title} index={index} />
                  </Link>

                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs mb-3.5">
                        <span className="px-3 py-1 bg-[#FCE8FA] text-[#4B075F] rounded-full font-bold text-[10px] uppercase tracking-wide">
                          {post.category}
                        </span>
                        <span className="text-[#716779] flex items-center gap-1 font-semibold text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-[#716779]" />
                          {post.readTime}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-lg font-bold text-[#241329] mb-3 group-hover:text-[#4B075F] transition-colors line-clamp-2 leading-snug">
                        <Link href={`/${post.categorySlug}/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h2>

                      {/* Summary */}
                      <p className="text-xs text-[#514458] leading-relaxed line-clamp-3 mb-5 font-normal">
                        {post.summary}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {post.tags.slice(0, 3).map((tag, tIdx) => (
                          <span key={tIdx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FCF9FD] border border-[#E8DFEB] text-[#716779]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Author & Footer */}
                    <div className="pt-4 border-t border-[#E8DFEB] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={post.author.avatar} 
                          alt={post.author.name}
                          className="w-7 h-7 rounded-full bg-[#FCE8FA] p-0.5 object-contain" 
                        />
                        <div className="text-[11px] font-semibold text-[#241329]">
                          {post.author.name}
                        </div>
                      </div>

                      <Link 
                        href={`/${post.categorySlug}/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#4B075F] group-hover:text-[#D914C8] transition-colors"
                      >
                        <span>İncele</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ELEGANT SUBTLE 14-DAY FREE TRIAL BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-gradient-to-r from-white via-[#FCF9FD] to-[#FCE8FA]/60 border border-[#E8DFEB] p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <img 
                src="/mascot/mascot-14gun-badge.png" 
                alt="Oxonom Edu 14 Gün Ücretsiz Deneme" 
                className="w-24 sm:w-28 h-auto object-contain drop-shadow-md shrink-0"
              />
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4B075F]/10 text-[#4B075F] text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#D914C8]" />
                  Öğrenci ve Veli İçin Fırsat
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-black text-[#241329] mb-2 tracking-tight">
                  Çocuğunuzun Ders Başarısını 14 Gün Ücretsiz Deneyimleyin
                </h3>
                <p className="text-xs sm:text-sm text-[#514458] max-w-xl font-normal leading-relaxed">
                  Okul ile tam entegre akıllı tahta ders tekrarları, interaktif oyunlar ve yapay zekâ eğitmen desteğini kredi kartsız test edin.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                href="/paketler"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#4B075F] text-white font-bold text-xs sm:text-sm hover:bg-[#35153E] transition-all text-center shadow-md shadow-[#4B075F]/20"
              >
                14 Gün Ücretsiz Dene
              </Link>
              <Link
                href="/akilli-tahta"
                className="w-full sm:w-auto px-5 py-3 rounded-full bg-white text-[#4B075F] border border-[#E8DFEB] font-bold text-xs sm:text-sm hover:bg-[#FCF9FD] transition-all text-center"
              >
                Sistemi İncele
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}