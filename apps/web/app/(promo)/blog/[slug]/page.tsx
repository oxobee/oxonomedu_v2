'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Share2, 
  Clock, 
  ArrowLeft, 
  Calendar, 
  MessageCircle, 
  Check, 
  Copy, 
  GraduationCap, 
  Sparkles, 
  Bookmark, 
  ChevronRight,
  BookOpen,
  ArrowRight,
  Brain,
  Monitor,
  Gamepad2,
  CheckCircle2
} from 'lucide-react';

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
import JsonLd from '@components/Promo/JsonLd';

import { blogPosts } from '@lib/promo/constants';

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

function ArticleVisualHeader({ title, category, categorySlug }: { title: string; category: string; categorySlug: string }) {
  const Icon = getCategoryIcon(categorySlug);

  return (
    <div className="relative mb-12 aspect-[21/9] w-full min-h-[220px] md:min-h-[280px] overflow-hidden rounded-3xl border border-[#E8DFEB] bg-gradient-to-br from-[#241329] via-[#35153E] to-[#4B075F] p-6 md:p-10 shadow-xl shadow-[#4B075F]/10 flex flex-col justify-between text-white">
      {/* Pattern & glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#D914C8_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-15" />
      <motion.div 
        className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#D914C8]/30 blur-3xl pointer-events-none" 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} 
        transition={{ duration: 6, repeat: Infinity }} 
      />

      <div className="relative z-10 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#FCE8FA] border border-white/15">
          <Icon className="h-4 w-4 text-[#D914C8]" />
          {category}
        </span>
        <div className="flex items-center gap-2 text-xs font-semibold text-white/60">
          <GraduationCap className="h-5 w-5 text-white/50" />
          <span>Oxonom Edu Pedagoji Kütüphanesi</span>
        </div>
      </div>

      <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Uzman Pedagojik Rapor</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black leading-tight text-white">
            {title}
          </h2>
        </div>

        <div className="hidden sm:flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-xs text-white/90">
          <CheckCircle2 className="w-4 h-4 text-[#D914C8]" />
          <span>MEB 1-8. Sınıf Müfredatı ile Tam Uyumlu</span>
        </div>
      </div>
    </div>
  );
}

export default function BlogDetailPage() {
  const { categorySlug, slug } = useParams();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Match post by slug or categorySlug/slug combination
  const post = blogPosts.find(p => 
    p.slug === slug || 
    p.slug === categorySlug ||
    (p.categorySlug === categorySlug && p.slug === slug)
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug, categorySlug]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!post) {
    return <div className='py-32 text-center text-xl font-bold'>Yazı bulunamadı.</div>;
  }

  const canonicalUrl = `/${post.categorySlug}/${post.slug}`;

  
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.summary,
    "datePublished": "2026-10-24T00:00:00+03:00",
    "inLanguage": "tr",
    "author": [{
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.role
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Oxonom Edu",
      "url": "https://oxonomedu.vercel.app"
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Oxonom Edu: ${post.title}`;

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Find related posts (exclude current)
  const relatedPosts = blogPosts.filter(p => p.id !== post.id).slice(0, 2);

  return (
    <div className="pt-28 md:pt-36 pb-24 bg-white min-h-screen relative">
      <JsonLd data={articleSchema} />

      {/* Dynamic Top Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-[#4B075F] via-[#D914C8] to-[#FCE8FA] z-50 origin-left transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* BREADCRUMB & BACK BUTTON */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-xs font-semibold text-[#716779]">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-[#4B075F] hover:text-[#D914C8] font-bold transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Tüm Blog Yazılarına Dön</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-2 text-xs text-[#A095A6]">
            <Link href="/" className="hover:text-[#4B075F] transition-colors">Ana Sayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-[#4B075F] transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#4B075F] font-bold truncate max-w-[200px]">{post.category}</span>
          </nav>
        </div>

        {/* HEADER */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="px-3.5 py-1 bg-[#FCE8FA] text-[#4B075F] rounded-full text-xs font-bold uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-[#716779] text-xs font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {post.date}
            </span>
            <span className="text-[#716779] text-xs font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-[#241329] leading-[1.2] mb-6 tracking-tight">
            {post.title}
          </h1>

          <p className="text-lg md:text-xl text-[#514458] leading-relaxed font-normal mb-8">
            {post.summary}
          </p>

          {/* AUTHOR & SHARE BAR */}
          <div className="flex flex-wrap items-center justify-between gap-6 py-5 border-y border-[#E8DFEB]">
            <div className="flex items-center gap-3.5">
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                className="w-12 h-12 rounded-2xl bg-[#FCF9FD] border border-[#E8DFEB] p-1 object-contain"
              />
              <div>
                <div className="font-bold text-[#241329] text-sm sm:text-base">{post.author.name}</div>
                <div className="text-xs text-[#716779] font-medium">{post.author.role}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* WhatsApp Share */}
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="WhatsApp'ta Paylaş"
                className="w-9 h-9 rounded-full bg-[#FCF9FD] border border-[#E8DFEB] flex items-center justify-center text-[#716779] hover:text-[#16805D] hover:border-[#16805D]/40 transition-colors"
                title="WhatsApp'ta Paylaş"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              {/* Twitter / X Share */}
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="X'te Paylaş"
                className="w-9 h-9 rounded-full bg-[#FCF9FD] border border-[#E8DFEB] flex items-center justify-center text-[#716779] hover:text-[#2563EB] hover:border-[#2563EB]/40 transition-colors"
                title="Twitter / X'te Paylaş"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>

              {/* LinkedIn Share */}
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="LinkedIn'de Paylaş"
                className="w-9 h-9 rounded-full bg-[#FCF9FD] border border-[#E8DFEB] flex items-center justify-center text-[#716779] hover:text-[#0A66C2] hover:border-[#0A66C2]/40 transition-colors"
                title="LinkedIn'de Paylaş"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>

              {/* Copy Link Button */}
              <button 
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#FCF9FD] border border-[#E8DFEB] text-xs font-bold text-[#716779] hover:text-[#4B075F] hover:border-[#4B075F]/30 transition-colors cursor-pointer"
                title="Bağlantıyı Kopyala"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* VISUAL BANNER */}
        <ArticleVisualHeader 
          title={post.title} 
          category={post.category} 
          categorySlug={post.categorySlug} 
        />

        {/* ARTICLE BODY */}
        <article className="prose prose-purple max-w-none mb-16 text-[#352A3B]">
          <div 
            className="blog-content leading-relaxed text-base sm:text-lg [&>h2]:text-2xl [&>h2]:sm:text-3xl [&>h2]:font-display [&>h2]:font-black [&>h2]:text-[#241329] [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:pt-4 [&>h2]:border-t [&>h2]:border-[#E8DFEB]/60 [&>p]:mb-6 [&>p]:leading-relaxed [&>p]:text-[#473B4D] [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2.5 [&>ul]:mb-6 [&>ul>li]:text-[#473B4D] [&>strong]:text-[#241329] [&>strong]:font-bold"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </article>

        {/* TAGS */}
        <div className="pt-6 pb-8 border-t border-[#E8DFEB] mb-12">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#716779] mr-2">Etiketler:</span>
            {post.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1 rounded-full bg-[#FCF9FD] border border-[#E8DFEB] text-[#4B075F] text-xs font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* AUTHOR BIO BOX */}
        <div className="rounded-3xl bg-[#FCF9FD] border border-[#E8DFEB] p-6 sm:p-8 mb-16 flex flex-col sm:flex-row items-center gap-6">
          <img 
            src={post.author.avatar} 
            alt={post.author.name}
            className="w-20 h-20 rounded-2xl bg-white border border-[#E8DFEB] p-2 object-contain shadow-xs shrink-0" 
          />
          <div className="text-center sm:text-left">
            <div className="text-xs font-bold text-[#D914C8] uppercase tracking-wider mb-1">Yazar Hakkında</div>
            <h3 className="text-lg font-bold text-[#241329] mb-1">{post.author.name}</h3>
            <p className="text-xs font-semibold text-[#716779] mb-3">{post.author.role}</p>
            <p className="text-xs sm:text-sm text-[#514458] leading-relaxed">
              Oxonom Edu Pedagoji Kurulu bünyesinde 1. sınıftan 8. sınıfa kadar K-12 eğitim modelleri, akıllı tahta pedagojisi, bilişsel zekâ gelişimi ve yapay zekâ entegrasyonu üzerine akademik araştırmalar ve müfredat tasarımları yürütmektedir.
            </p>
          </div>
        </div>

        {/* RELATED ARTICLES */}
        {relatedPosts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-display font-black text-[#241329] tracking-tight">
                İlginizi Çekebilecek Diğer Yazılar
              </h3>
              <Link 
                href="/blog"
                className="text-xs sm:text-sm font-bold text-[#4B075F] hover:text-[#D914C8] transition-colors inline-flex items-center gap-1"
              >
                <span>Tümünü Gör</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((relPost) => (
                <div 
                  key={relPost.id}
                  className="rounded-2xl border border-[#E8DFEB] p-5 sm:p-6 bg-white hover:border-[#8D49A6]/40 hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FCE8FA] text-[#4B075F] text-[10px] font-bold uppercase">
                        {relPost.category}
                      </span>
                      <span className="text-[#716779] text-[11px] font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {relPost.readTime}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#241329] mb-2 group-hover:text-[#4B075F] transition-colors line-clamp-2">
                      <Link href={`/${relPost.categorySlug}/${relPost.slug}`}>
                        {relPost.title}
                      </Link>
                    </h4>

                    <p className="text-xs text-[#514458] line-clamp-2 mb-4">
                      {relPost.summary}
                    </p>
                  </div>

                  <Link 
                    href={`/${relPost.categorySlug}/${relPost.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4B075F] group-hover:text-[#D914C8] transition-colors pt-3 border-t border-[#E8DFEB]/60"
                  >
                    <span>Yazıyı Oku</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM CALL TO ACTION: 14 DAYS FREE TRIAL */}
        <div className="rounded-3xl bg-gradient-to-br from-[#241329] via-[#35153E] to-[#4B075F] p-8 md:p-10 text-white relative overflow-hidden shadow-xl shadow-[#4B075F]/15">
          <div className="absolute inset-0 bg-[radial-gradient(#D914C8_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-15" />
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#D914C8]/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <img 
                src="/mascot/mascot-14gun-badge.png" 
                alt="14 Gün Ücretsiz Deneme" 
                className="w-24 sm:w-28 h-auto object-contain drop-shadow-lg shrink-0" 
              />
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[#FCE8FA] text-xs font-black uppercase tracking-wider mb-2">
                  Taahhütsüz & Kredi Kartsız
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-black text-white mb-2 tracking-tight">
                  Akıllı Eğitim Ekranını 14 Gün Boyunca Ücretsiz Deneyin
                </h3>
                <p className="text-xs sm:text-sm text-white/80 max-w-lg leading-relaxed">
                  Çocuğunuzun okulda işlediği akıllı tahta derslerini evde interaktif tekrarla pekiştirmesi ve eksiksiz öğrenmesi için hemen başlayın.
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <Link 
                href="/paketler"
                className="inline-flex items-center justify-center w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-[#4B075F] font-bold text-sm hover:bg-[#FCE8FA] transition-all shadow-lg hover:shadow-xl"
              >
                14 Gün Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}