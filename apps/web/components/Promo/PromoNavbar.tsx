'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Menu, 
  X, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  School, 
  PenTool, 
  Languages, 
  CheckCircle2, 
  Tv, 
  Layers,
  Award,
  Users,
  Target,
  Zap,
  FileText,
  FolderTree,
  ExternalLink,
  ChevronRight,
  Gamepad2,
  Calendar,
  Bookmark,
  Activity,
} from 'lucide-react';
import { sectors } from '@lib/promo/constants';
import { cn } from '@lib/utils';
import { useAutoSnapScroll } from '@lib/promo/useAutoSnapScroll';
import { getNavMenus, subscribeToNavMenuUpdates, NavMenuItem } from '@lib/promo/navMenu';

function getSubMenuIcon(iconName?: string) {
  const map: Record<string, any> = {
    PenTool,
    Zap,
    FileText,
    Languages,
    School,
    Target,
    GraduationCap,
    Users,
    Award,
    Sparkles,
    BookOpen,
    Tv,
    Layers,
    FolderTree,
    Gamepad2,
    Calendar,
    Bookmark,
    Activity,
  };
  const Comp = (iconName && map[iconName]) || Sparkles;
  return <Comp className="w-4 h-4" />;
}

export default function PromoNavbar() {
  const [navMenus, setNavMenus] = useState<NavMenuItem[]>(() => getNavMenus());
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductMegaMenuOpen, setIsProductMegaMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isPackagesMegaMenuOpen, setIsPackagesMegaMenuOpen] = useState(false);
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);

  const pathname = usePathname();
  const isHome = pathname === '/';
  const headerScrolled = isScrolled || !isHome;
  const headerRef = useRef<HTMLElement | null>(null);
  const [productMegaMenuTop, setProductMegaMenuTop] = useState<number>(0);
  const productQuickStartRef = useRef<HTMLDivElement | null>(null);

  const openProductMegaMenu = () => {
    const rect = headerRef.current?.getBoundingClientRect();
    setProductMegaMenuTop(rect ? Math.round(rect.bottom) : 0);
    setIsProductMegaMenuOpen(true);
  };

  const closeProductMegaMenu = () => {
    setIsProductMegaMenuOpen(false);
  };

  useAutoSnapScroll(productQuickStartRef, { enabled: isProductMegaMenuOpen, intervalMs: 8000 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsub = subscribeToNavMenuUpdates(() => {
      setNavMenus(getNavMenus());
    });
    return unsub;
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdownId(null);
    setIsProductMegaMenuOpen(false);
    setIsMegaMenuOpen(false);
    setIsPackagesMegaMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isProductMegaMenuOpen) return;

    const updateTop = () => {
      const rect = headerRef.current?.getBoundingClientRect();
      setProductMegaMenuTop(rect ? Math.round(rect.bottom) : 0);
    };

    updateTop();
    window.addEventListener('resize', updateTop);
    window.addEventListener('scroll', updateTop, { passive: true });
    return () => {
      window.removeEventListener('resize', updateTop);
      window.removeEventListener('scroll', updateTop);
    };
  }, [isProductMegaMenuOpen, headerScrolled]);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-center',
          headerScrolled 
            ? 'py-4' 
            : 'py-6'
        )}
      >
        <div className={cn(
          "flex items-center justify-between transition-all duration-500",
          headerScrolled 
            ? "w-[95%] max-w-7xl mx-auto px-6 py-3 bg-white/95 backdrop-blur-2xl border border-[#E8DFEB] shadow-[0_8px_32px_0_rgba(75,7,95,0.08)] rounded-2xl"
            : "w-full max-w-7xl mx-auto px-6"
        )}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group relative z-50">
            <img 
              src={headerScrolled ? "/logo_light.png" : "/logo_white.png"} 
              alt="Oxonom Edu Logo" 
              className={cn(
                "transition-all duration-300 object-contain",
                headerScrolled ? "h-7" : "h-9"
              )}
            />
          </Link>

          {/* Dynamic Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-7">
            {navMenus.filter((m) => m.active).map((menu) => {
              // 1. BUILT-IN PRODUCTS MEGA MENU
              if (menu.megaMenuType === 'products') {
                return (
                  <div 
                    key={menu.id}
                    className="relative"
                    onMouseEnter={openProductMegaMenu}
                    onMouseLeave={closeProductMegaMenu}
                  >
                    <button className={cn(
                      "flex items-center gap-1.5 text-sm font-bold transition-colors group py-2",
                      headerScrolled ? "text-[#514458] hover:text-[#4B075F]" : "text-white/90 hover:text-white"
                    )}>
                      {menu.title}
                      {menu.badge && (
                        <span className="px-1.5 py-0.5 bg-[#D914C8] text-white text-[9px] font-black uppercase rounded-md tracking-wider shadow-sm ml-0.5">
                          {menu.badge}
                        </span>
                      )}
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isProductMegaMenuOpen && "rotate-180")} />
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D914C8] transition-all duration-300 group-hover:w-full" />
                    </button>

                    <AnimatePresence>
                      {isProductMegaMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.98 }}
                          style={{ top: (productMegaMenuTop || (headerScrolled ? 80 : 96)) + 14 }}
                          className="fixed inset-x-0 z-[70] px-4"
                        >
                          <div className="mx-auto w-full max-w-6xl">
                            <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_24px_48px_-12px_rgba(75,7,95,0.18)] border border-[#E8DFEB] overflow-hidden p-3">
                              <div className="grid grid-cols-12 gap-3 p-2">
                                <div className="col-span-12 md:col-span-8 rounded-xl bg-gradient-to-b from-white to-[#FCF9FD] border border-[#E8DFEB] p-5 premium-shadow relative overflow-hidden">
                                  <div className="absolute -top-12 -left-12 w-56 h-56 bg-[#4B075F]/10 rounded-full blur-3xl pointer-events-none" />

                                  <div className="relative z-10 flex items-start justify-between gap-4 mb-4">
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8D49A6]">Öğrenciler İçin Tasarlandı</p>
                                      <h4 className="text-xl font-bold text-[#241329] mt-0.5">Akıllı Eğitim Ekranı & Özellikleri</h4>
                                      <p className="text-xs text-[#716779] font-medium mt-0.5 leading-relaxed">
                                        Okul ile ev arasında kesintisiz köprü kuran akıllı tahta, interaktif dersler, sınav provaları ve dijital kütüphane.
                                      </p>
                                    </div>
                                    <Link href="/paketler"
                                      onClick={() => setIsProductMegaMenuOpen(false)}
                                      className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#4B075F] hover:text-[#D914C8] transition-colors shrink-0 pt-1"
                                    >
                                      Tüm Paketleri Gör <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                    <Link href="/akilli-tahta"
                                      onClick={() => setIsProductMegaMenuOpen(false)}
                                      className="group p-3 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB] hover:border-[#10B981]/50 hover:bg-emerald-50/30 transition-all flex items-start gap-3"
                                    >
                                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                        <Tv className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-[#241329] group-hover:text-emerald-700 transition-colors">Akıllı Tahta</h5>
                                        <p className="text-[11px] text-[#716779] font-medium leading-tight mt-0.5 line-clamp-2">
                                          Sınıftaki tahta notları anında öğrenci profiline.
                                        </p>
                                      </div>
                                    </Link>

                                    <Link href="/derslerim"
                                      onClick={() => setIsProductMegaMenuOpen(false)}
                                      className="group p-3 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB] hover:border-blue-400/50 hover:bg-blue-50/30 transition-all flex items-start gap-3"
                                    >
                                      <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-[#241329] group-hover:text-blue-700 transition-colors">Derslerim</h5>
                                        <p className="text-[11px] text-[#716779] font-medium leading-tight mt-0.5 line-clamp-2">
                                          İnteraktif konu tekrarı & akıllı başarı çemberleri.
                                        </p>
                                      </div>
                                    </Link>

                                    <Link href="/sinavlarim"
                                      onClick={() => setIsProductMegaMenuOpen(false)}
                                      className="group p-3 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB] hover:border-amber-400/50 hover:bg-amber-50/30 transition-all flex items-start gap-3"
                                    >
                                      <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                        <Target className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-[#241329] group-hover:text-amber-700 transition-colors">Sınavlarım</h5>
                                        <p className="text-[11px] text-[#716779] font-medium leading-tight mt-0.5 line-clamp-2">
                                          MEB zümre provaları & eksik konu analizi.
                                        </p>
                                      </div>
                                    </Link>

                                    <Link href="/notlarim-ajanda"
                                      onClick={() => setIsProductMegaMenuOpen(false)}
                                      className="group p-3 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB] hover:border-purple-400/50 hover:bg-purple-50/30 transition-all flex items-start gap-3"
                                    >
                                      <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-[#241329] group-hover:text-purple-700 transition-colors">Notlarım & Ajanda</h5>
                                        <p className="text-[11px] text-[#716779] font-medium leading-tight mt-0.5 line-clamp-2">
                                          Kategorize defter & haftalık ders çalışma takvimi.
                                        </p>
                                      </div>
                                    </Link>

                                    <Link href="/gelisimim"
                                      onClick={() => setIsProductMegaMenuOpen(false)}
                                      className="group p-3 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB] hover:border-emerald-400/50 hover:bg-emerald-50/30 transition-all flex items-start gap-3"
                                    >
                                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                        <Activity className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-[#241329] group-hover:text-emerald-700 transition-colors">Gelişimim</h5>
                                        <p className="text-[11px] text-[#716779] font-medium leading-tight mt-0.5 line-clamp-2">
                                          Canlı akademik röntgen & grafiksel karne takibi.
                                        </p>
                                      </div>
                                    </Link>

                                    <Link href="/kitaplik"
                                      onClick={() => setIsProductMegaMenuOpen(false)}
                                      className="group p-3 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB] hover:border-indigo-400/50 hover:bg-indigo-50/30 transition-all flex items-start gap-3"
                                    >
                                      <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                        <Layers className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-[#241329] group-hover:text-indigo-700 transition-colors">Kitaplık</h5>
                                        <p className="text-[11px] text-[#716779] font-medium leading-tight mt-0.5 line-clamp-2">
                                          312 MEB kitabı & interaktif flipbook okuyucu.
                                        </p>
                                      </div>
                                    </Link>

                                    <Link href="/oyunlar"
                                      onClick={() => setIsProductMegaMenuOpen(false)}
                                      className="group p-3 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB] hover:border-pink-400/50 hover:bg-pink-50/30 transition-all flex items-start gap-3"
                                    >
                                      <div className="w-9 h-9 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                                        <Gamepad2 className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-[#241329] group-hover:text-pink-700 transition-colors">Oyunlar</h5>
                                        <p className="text-[11px] text-[#716779] font-medium leading-tight mt-0.5 line-clamp-2">
                                          Eğlenerek öğrenmenin en keyifli hali & turnuva.
                                        </p>
                                      </div>
                                    </Link>

                                    <Link href="/instagram"
                                      onClick={() => setIsProductMegaMenuOpen(false)}
                                      className="group p-3 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB] hover:border-[#D914C8]/50 hover:bg-[#FCE8FA]/30 transition-all flex items-start gap-3"
                                    >
                                      <div className="w-9 h-9 rounded-lg bg-[#FCE8FA] text-[#D914C8] flex items-center justify-center shrink-0">
                                        <Zap className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-[#241329] group-hover:text-[#D914C8] transition-colors">Hızlı Okuma (WPM)</h5>
                                        <p className="text-[11px] text-[#716779] font-medium leading-tight mt-0.5 line-clamp-2">
                                          1 dakikalık canlı hız testi ve kelime piramitleri.
                                        </p>
                                      </div>
                                    </Link>

                                    <Link href="/web-site"
                                      onClick={() => setIsProductMegaMenuOpen(false)}
                                      className="group p-3 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB] hover:border-[#4B075F]/50 hover:bg-purple-50/30 transition-all flex items-start gap-3"
                                    >
                                      <div className="w-9 h-9 rounded-lg bg-purple-100 text-[#4B075F] flex items-center justify-center shrink-0">
                                        <School className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-[#241329] group-hover:text-[#4B075F] transition-colors">Okul & Kampüs LMS</h5>
                                        <p className="text-[11px] text-[#716779] font-medium leading-tight mt-0.5 line-clamp-2">
                                          Tüm okul idare ve zümre entegrasyonu.
                                        </p>
                                      </div>
                                    </Link>
                                  </div>
                                </div>

                                {/* Quick Start Side Showcase */}
                                <div className="col-span-12 md:col-span-4 rounded-xl bg-[#241329] text-white border border-[#4B075F]/30 overflow-hidden relative">
                                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]" />
                                  <div
                                    ref={productQuickStartRef}
                                    className="relative z-10 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                                  >
                                    {[
                                      {
                                        id: 'reading',
                                        accent: 'text-[#D914C8]',
                                        blob: 'bg-[#D914C8]/20',
                                        title: '1 Dk Hızlı Okuma & WPM',
                                        desc: 'Çocukların okuma hızını canlı ölçen, kelime sıçrama aralığını genişleten eğlenceli piramitler.',
                                        bullets: ['MEB Dik Temel Abece', 'Canlı WPM ve Kelime Sayacı', 'Sevimli Hikaye Kütüphanesi'],
                                        primaryTo: '/instagram',
                                        primaryLabel: 'Hızlı Okuma Atölyesi',
                                      },
                                      {
                                        id: 'whiteboard',
                                        accent: 'text-[#F5C542]',
                                        blob: 'bg-[#F5C542]/20',
                                        title: 'Sonsuz İnteraktif Tuval',
                                        desc: 'Silgiye gerek kalmadan sağa ve aşağı kaydırarak kesintisiz ders anlatımı ve zengin araçlar.',
                                        bullets: ['LaTeX & Geometri Çizimi', 'PDF Üzerinde Çözüm', 'Hocuspocus Canlı Senkronizasyon'],
                                        primaryTo: '/whatsapp',
                                        primaryLabel: 'Akıllı Tahta Detayı',
                                      },
                                      {
                                        id: 'school',
                                        accent: 'text-[#45C7A2]',
                                        blob: 'bg-[#45C7A2]/20',
                                        title: 'K-12 Akıllı Kampüs LMS',
                                        desc: 'Tüm okul idaresi, öğretmen, öğrenci ve veli süreçlerini tek noktada buluşturan sistem.',
                                        bullets: ['Hızlı Yoklama & GNO', 'Sınıf Katılım Kodu', 'Okul Dijital Bilgi Panosu'],
                                        primaryTo: '/web-site',
                                        primaryLabel: 'Kampüs LMS İncele',
                                      }
                                    ].map((slide) => (
                                      <div
                                        key={slide.id}
                                        className="w-full shrink-0 snap-start p-7 relative flex flex-col justify-between"
                                      >
                                        <div className={cn("absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none", slide.blob)} />

                                        <div className="relative z-10">
                                          <p className={cn("text-[10px] font-black uppercase tracking-[0.28em] mb-2", slide.accent)}>
                                            Öne Çıkan Pedagojik Atölye
                                          </p>
                                          <h4 className="text-xl font-bold mb-2">{slide.title}</h4>
                                          <p className="text-xs text-white/70 font-medium leading-relaxed mb-5">
                                            {slide.desc}
                                          </p>

                                          <div className="space-y-2 mb-6">
                                            {slide.bullets.map((t) => (
                                              <div key={t} className="flex items-start gap-2">
                                                <div className="w-5 h-5 rounded-md bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
                                                  <Sparkles className="w-3.5 h-3.5 text-[#D914C8]" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-200">{t}</span>
                                              </div>
                                            ))}
                                          </div>

                                          <div className="flex flex-col gap-2">
                                            <Link href={slide.primaryTo}
                                              onClick={() => setIsProductMegaMenuOpen(false)}
                                              className="w-full py-3 bg-[#4B075F] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#620B79] transition-all shadow-xl shadow-[#4B075F]/30 active:scale-95"
                                            >
                                              {slide.primaryLabel} <ArrowRight className="w-4 h-4" />
                                            </Link>
                                            <a
                                              href="https://edu.oxonom.com/login"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              onClick={() => setIsProductMegaMenuOpen(false)}
                                              className="w-full py-3 bg-white/10 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/15 active:scale-95"
                                            >
                                              Canlı Demo Okul <ArrowRight className="w-4 h-4" />
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/10 border border-white/15 rounded-lg text-[10px] font-bold text-white/70">
                                    Kaydır ↔
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              // 2. BUILT-IN SECTORS MEGA MENU
              if (menu.megaMenuType === 'sectors') {
                return (
                  <div 
                    key={menu.id}
                    className="relative"
                    onMouseEnter={() => setIsMegaMenuOpen(true)}
                    onMouseLeave={() => setIsMegaMenuOpen(false)}
                  >
                    <button className={cn(
                      "flex items-center gap-1.5 text-sm font-bold transition-colors group py-2",
                      headerScrolled ? "text-[#514458] hover:text-[#4B075F]" : "text-white/90 hover:text-white"
                    )}>
                      {menu.title}
                      {menu.badge && (
                        <span className="px-1.5 py-0.5 bg-[#D914C8] text-white text-[9px] font-black uppercase rounded-md tracking-wider shadow-sm ml-0.5">
                          {menu.badge}
                        </span>
                      )}
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isMegaMenuOpen && "rotate-180")} />
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D914C8] transition-all duration-300 group-hover:w-full" />
                    </button>

                    <AnimatePresence>
                      {isMegaMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.98 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[95vw] max-w-6xl bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_24px_48px_-12px_rgba(75,7,95,0.18)] border border-[#E8DFEB] overflow-hidden p-8"
                        >
                          <div className="grid grid-cols-4 gap-x-6 gap-y-4">
                            {sectors.map((sector) => (
                              <Link
                                key={sector.id}
                                href={`/sektorler/${sector.id}`}
                                onClick={() => setIsMegaMenuOpen(false)}
                                className="flex items-start gap-4 p-3 rounded-xl hover:bg-[#FCF9FD] border border-transparent hover:border-[#E8DFEB] transition-all group"
                              >
                                <div className="p-3 bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl text-[#4B075F] group-hover:bg-[#4B075F] group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                                  <sector.icon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                </div>
                                <div>
                                  <h4 className="text-[14px] font-bold text-[#241329] group-hover:text-[#4B075F] transition-colors">
                                    {sector.name}
                                  </h4>
                                  <p className="text-[11px] text-[#716779] line-clamp-1 mt-0.5 font-medium">
                                    {sector.description}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                          <div className="mt-8 pt-6 border-t border-[#E8DFEB] flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-[#FCE8FA] text-[#4B075F] rounded-2xl flex items-center justify-center shrink-0">
                                <GraduationCap className="w-6 h-6" />
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-[#241329]">MEB 2026-2027 Müfredatına Tam Uyumlu</h5>
                                <p className="text-xs text-[#716779]">K-12 tüm sınıf düzeyleri ve kademeler için hazır ders kazanımları ve şablonlar.</p>
                              </div>
                            </div>
                            <Link href="/sektorler"
                              onClick={() => setIsMegaMenuOpen(false)}
                              className="text-xs font-bold text-[#4B075F] hover:text-[#D914C8] flex items-center gap-2 group transition-colors"
                            >
                              Tüm Kademeleri ve Çözümleri Gör <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              // 3. BUILT-IN PACKAGES MEGA MENU
              if (menu.megaMenuType === 'packages') {
                return (
                  <div 
                    key={menu.id}
                    className="relative"
                    onMouseEnter={() => setIsPackagesMegaMenuOpen(true)}
                    onMouseLeave={() => setIsPackagesMegaMenuOpen(false)}
                  >
                    <button className={cn(
                      "flex items-center gap-1.5 text-sm font-bold transition-colors group py-2",
                      headerScrolled ? "text-[#514458] hover:text-[#4B075F]" : "text-white/90 hover:text-white"
                    )}>
                      {menu.title}
                      {menu.badge && (
                        <span className="px-1.5 py-0.5 bg-[#D914C8] text-white text-[9px] font-black uppercase rounded-md tracking-wider shadow-sm ml-0.5">
                          {menu.badge}
                        </span>
                      )}
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isPackagesMegaMenuOpen && "rotate-180")} />
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D914C8] transition-all duration-300 group-hover:w-full" />
                    </button>

                    <AnimatePresence>
                      {isPackagesMegaMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.98 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[680px] bg-white/95 backdrop-blur-3xl rounded-2xl shadow-[0_40px_80px_-15px_rgba(75,7,95,0.2)] border border-[#E8DFEB] overflow-hidden p-2"
                        >
                          <div className="grid grid-cols-3 gap-2">
                            <Link href="/ses-paketleri"
                              onClick={() => setIsPackagesMegaMenuOpen(false)}
                              className="group relative flex flex-col gap-3 p-6 rounded-xl hover:bg-[#FCF9FD] border border-transparent hover:border-[#E8DFEB] transition-all duration-500 overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4B075F]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                              <div className="w-12 h-12 bg-[#FCE8FA] rounded-xl flex items-center justify-center text-[#4B075F] group-hover:bg-[#4B075F] group-hover:text-white transition-all duration-500 shadow-sm">
                                <PenTool className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-[#241329] group-hover:text-[#4B075F] transition-colors mb-1">Öğretmen Paketleri</h4>
                                <p className="text-xs text-[#716779] font-medium leading-relaxed">Bireysel öğretmenler<br />için tahta ve atölyeler.</p>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-[#4B075F] uppercase tracking-widest opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                İncele <ArrowRight className="w-3 h-3" />
                              </div>
                            </Link>

                            <Link href="/mesajlasma-paketleri"
                              onClick={() => setIsPackagesMegaMenuOpen(false)}
                              className="group relative flex flex-col gap-3 p-6 rounded-xl hover:bg-[#FCF9FD] border border-transparent hover:border-[#E8DFEB] transition-all duration-500 overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D914C8]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                              <div className="w-12 h-12 bg-[#F0D8FA] rounded-xl flex items-center justify-center text-[#8D49A6] group-hover:bg-[#8D49A6] group-hover:text-white transition-all duration-500 shadow-sm">
                                <School className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-[#241329] group-hover:text-[#8D49A6] transition-colors mb-1">Okul & Kampüs</h4>
                                <p className="text-xs text-[#716779] font-medium leading-relaxed">K-12 okulları için<br />tam LMS & yönetim.</p>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-[#8D49A6] uppercase tracking-widest opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                İncele <ArrowRight className="w-3 h-3" />
                              </div>
                            </Link>

                            <Link href="/combo-paketler"
                              onClick={() => setIsPackagesMegaMenuOpen(false)}
                              className="group relative flex flex-col gap-3 p-6 rounded-xl hover:bg-[#FCE8FA]/40 transition-all duration-500 overflow-hidden bg-gradient-to-b from-[#FCE8FA]/50 to-transparent border border-[#F0D8FA]"
                            >
                              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D914C8]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                              <div className="w-12 h-12 bg-gradient-to-br from-[#4B075F] to-[#D914C8] rounded-xl flex items-center justify-center text-white shadow-sm">
                                <Award className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="inline-block px-2 py-0.5 bg-[#D914C8] text-white text-[8px] font-bold rounded-full mb-1 uppercase tracking-wider">Avantajlı</div>
                                <h4 className="text-base font-bold text-[#241329] group-hover:text-[#D914C8] transition-colors mb-1">Kampüs Plus</h4>
                                <p className="text-xs text-[#716779] font-medium leading-relaxed">LMS + Tahta + Tüm<br />Atölyeler %28 tasarruf.</p>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-[#D914C8] uppercase tracking-widest opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                İncele <ArrowRight className="w-3 h-3" />
                              </div>
                            </Link>
                          </div>
                          
                          <div className="p-6 bg-[#FCF9FD] border-t border-[#E8DFEB] flex flex-col items-center justify-center text-center">
                            <Link href="/paketler" 
                              onClick={() => setIsPackagesMegaMenuOpen(false)}
                              className="w-full py-3.5 bg-[#4B075F] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#620B79] transition-all shadow-xl shadow-[#4B075F]/20 group active:scale-95"
                            >
                              Tüm Lisans ve Paket Seçeneklerini Karşılaştır <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <p className="mt-3 text-[10px] text-[#716779] font-bold uppercase tracking-[0.2em]">ÖĞRETMEN · OKUL · KAMPÜS PLUS LİSANSLARI</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              // 4. CUSTOM MEGA MENU
              if (menu.type === 'megamenu') {
                const subItems = menu.subItems || [];
                return (
                  <div 
                    key={menu.id}
                    className="relative"
                    onMouseEnter={() => setActiveDropdownId(menu.id)}
                    onMouseLeave={() => setActiveDropdownId(null)}
                  >
                    <button className={cn(
                      "flex items-center gap-1.5 text-sm font-bold transition-colors group py-2",
                      headerScrolled ? "text-[#514458] hover:text-[#4B075F]" : "text-white/90 hover:text-white"
                    )}>
                      {menu.title}
                      {menu.badge && (
                        <span className="px-1.5 py-0.5 bg-[#D914C8] text-white text-[9px] font-black uppercase rounded-md tracking-wider shadow-sm ml-0.5">
                          {menu.badge}
                        </span>
                      )}
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", activeDropdownId === menu.id && "rotate-180")} />
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D914C8] transition-all duration-300 group-hover:w-full" />
                    </button>

                    <AnimatePresence>
                      {activeDropdownId === menu.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.98 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[90vw] max-w-4xl bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_24px_48px_-12px_rgba(75,7,95,0.18)] border border-[#E8DFEB] overflow-hidden p-6 z-[70]"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {subItems.map((sub) => (
                              <Link
                                key={sub.id}
                                href={sub.path}
                                onClick={() => setActiveDropdownId(null)}
                                className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-[#FCF9FD] border border-transparent hover:border-[#E8DFEB] transition-all group"
                              >
                                <div className="p-2.5 bg-[#FCE8FA] text-[#4B075F] group-hover:bg-[#4B075F] group-hover:text-white rounded-xl transition-colors shadow-sm shrink-0">
                                  {getSubMenuIcon(sub.icon)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="text-sm font-bold text-[#241329] group-hover:text-[#4B075F] transition-colors">{sub.title}</h4>
                                    {sub.badge && <span className="text-[9px] px-1.5 py-0.5 bg-[#D914C8] text-white rounded font-bold">{sub.badge}</span>}
                                  </div>
                                  {sub.description && <p className="text-xs text-[#716779] line-clamp-2 mt-0.5 font-medium">{sub.description}</p>}
                                </div>
                              </Link>
                            ))}
                          </div>
                          {menu.path && menu.path !== '#' && (
                            <div className="mt-4 pt-4 border-t border-[#E8DFEB] flex justify-end">
                              <Link href={menu.path}
                                onClick={() => setActiveDropdownId(null)}
                                className="text-xs font-bold text-[#4B075F] hover:text-[#D914C8] flex items-center gap-1.5"
                              >
                                Tümünü Görüntüle <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              // 5. DROPDOWN MENU
              if (menu.type === 'dropdown') {
                const subItems = menu.subItems || [];
                return (
                  <div 
                    key={menu.id}
                    className="relative"
                    onMouseEnter={() => setActiveDropdownId(menu.id)}
                    onMouseLeave={() => setActiveDropdownId(null)}
                  >
                    <button className={cn(
                      "flex items-center gap-1.5 text-sm font-bold transition-colors group py-2",
                      headerScrolled ? "text-[#514458] hover:text-[#4B075F]" : "text-white/90 hover:text-white"
                    )}>
                      {menu.title}
                      {menu.badge && (
                        <span className="px-1.5 py-0.5 bg-[#D914C8] text-white text-[9px] font-black uppercase rounded-md tracking-wider shadow-sm ml-0.5">
                          {menu.badge}
                        </span>
                      )}
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", activeDropdownId === menu.id && "rotate-180")} />
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D914C8] transition-all duration-300 group-hover:w-full" />
                    </button>

                    <AnimatePresence>
                      {activeDropdownId === menu.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.98 }}
                          className="absolute top-full left-0 mt-3 w-72 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_40px_-15px_rgba(75,7,95,0.18)] border border-[#E8DFEB] overflow-hidden p-2 z-[70]"
                        >
                          <div className="space-y-1">
                            {subItems.map((sub) => (
                              <Link
                                key={sub.id}
                                href={sub.path}
                                onClick={() => setActiveDropdownId(null)}
                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#FCF9FD] border border-transparent hover:border-[#E8DFEB] transition-all group"
                              >
                                <div className="p-2 bg-[#FCE8FA] text-[#4B075F] group-hover:bg-[#4B075F] group-hover:text-white rounded-lg transition-colors shadow-sm shrink-0">
                                  {getSubMenuIcon(sub.icon)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-[#241329] group-hover:text-[#4B075F] transition-colors">{sub.title}</span>
                                    {sub.badge && <span className="text-[9px] px-1 bg-[#D914C8] text-white rounded font-bold">{sub.badge}</span>}
                                  </div>
                                  {sub.description && <p className="text-[11px] text-[#716779] line-clamp-1 mt-0.5 font-medium">{sub.description}</p>}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              // 6. DIRECT LINK
              return (
                <Link 
                  key={menu.id}
                  href={menu.path || '#'} 
                  className={cn(
                    "text-sm font-bold transition-colors relative group flex items-center gap-1.5",
                    headerScrolled ? "text-[#514458] hover:text-[#4B075F]" : "text-white/90 hover:text-white"
                  )}
                >
                  {menu.title}
                  {menu.badge && (
                    <span className="px-1.5 py-0.5 bg-[#D914C8] text-white text-[9px] font-black uppercase rounded-md tracking-wider shadow-sm animate-pulse">
                      {menu.badge}
                    </span>
                  )}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D914C8] transition-all duration-300 group-hover:w-full" />
                </Link>
              );
            })}
          </nav>

          {/* CTA & Actions */}
          <div className="hidden lg:flex items-center gap-4 ml-8">
            <Link href="/blog" className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border",
              headerScrolled ? "border-[#E8DFEB] text-[#241329] hover:bg-[#FCF9FD]" : "border-white/20 text-white hover:bg-white/10"
            )}>
              Blog
              <span className="px-1.5 py-0.5 bg-[#D914C8] text-white text-[9px] font-black uppercase rounded-md tracking-wider shadow-sm animate-pulse">Yeni</span>
            </Link>

            <a 
              href="https://edu.oxonom.com/login" 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2",
                headerScrolled 
                  ? "bg-[#4B075F] text-white hover:bg-[#620B79] shadow-[#4B075F]/20" 
                  : "bg-white text-[#4B075F] hover:bg-[#FCF9FD] shadow-white/20"
              )}
            >
              <GraduationCap className="w-4 h-4" />
              Canlı Giriş
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={cn(
              "lg:hidden flex items-center gap-2 px-4 py-2 rounded-full z-50 transition-all font-bold text-xs shadow-lg",
              headerScrolled 
                ? "bg-white text-[#241329] border border-[#E8DFEB] shadow-sm" 
                : "bg-white/10 text-white backdrop-blur-md border border-white/20 shadow-black/10"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <>
                <X className="w-4 h-4" /> Kapat
              </>
            ) : (
              <>
                <Menu className="w-4 h-4" /> Menü
              </>
            )}
          </button>
        </div>
      </header>

      {/* Full-Screen Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white z-[60] lg:hidden flex flex-col overflow-hidden"
          >
            {/* Header inside mobile menu */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-[#E8DFEB]">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <img 
                  src="/logo_light.png" 
                  alt="Oxonom Edu Logo" 
                  className="h-7 object-contain"
                />
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center gap-2 px-4 py-2 bg-[#FCF9FD] border border-[#E8DFEB] rounded-full text-[#241329] font-bold text-xs"
              >
                <X className="w-4 h-4" /> Kapat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8">
              {/* Dynamic Main Links in Mobile */}
              <div className="flex flex-col gap-3 mb-8">
                {navMenus.filter((m) => m.active).map((menu) => {
                  // Mobile Products
                  if (menu.megaMenuType === 'products') {
                    return (
                      <div key={menu.id} className="bg-white rounded-xl border border-[#E8DFEB] p-5 premium-shadow overflow-hidden">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 bg-[#FCE8FA] border border-[#F0D8FA] rounded-xl flex items-center justify-center text-[#4B075F] shrink-0">
                              <Sparkles className="w-6 h-6 text-[#D914C8]" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-lg text-[#241329] block mb-0.5">{menu.title}</span>
                              <span className="text-xs text-[#716779] font-medium">Öğrenci Akıllı Eğitim Ekranı</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB] p-3">
                          <div className="grid grid-cols-1 gap-2">
                            <Link href="/akilli-tahta"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="group p-3 bg-white rounded-lg border border-[#E8DFEB] flex items-center justify-between gap-3 hover:bg-[#FCE8FA]/30 transition-colors"
                            >
                              <span className="flex items-center gap-3 min-w-0">
                                <span className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                  <Tv className="w-4 h-4" />
                                </span>
                                <span className="min-w-0">
                                  <span className="text-sm font-bold text-[#241329] block">Akıllı Tahta</span>
                                  <span className="text-[11px] text-[#716779] font-medium line-clamp-1">Sınıftaki tahta eve taşınır</span>
                                </span>
                              </span>
                              <ArrowRight className="w-4 h-4 text-[#716779] group-hover:text-emerald-700 transition-colors shrink-0" />
                            </Link>

                            <Link href="/derslerim"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="group p-3 bg-white rounded-lg border border-[#E8DFEB] flex items-center justify-between gap-3 hover:bg-[#FCE8FA]/30 transition-colors"
                            >
                              <span className="flex items-center gap-3 min-w-0">
                                <span className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                  <BookOpen className="w-4 h-4" />
                                </span>
                                <span className="min-w-0">
                                  <span className="text-sm font-bold text-[#241329] block">Derslerim</span>
                                  <span className="text-[11px] text-[#716779] font-medium line-clamp-1">İnteraktif tekrar & testler</span>
                                </span>
                              </span>
                              <ArrowRight className="w-4 h-4 text-[#716779] group-hover:text-blue-700 transition-colors shrink-0" />
                            </Link>

                            <Link href="/sinavlarim"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="group p-3 bg-white rounded-lg border border-[#E8DFEB] flex items-center justify-between gap-3 hover:bg-[#FCE8FA]/30 transition-colors"
                            >
                              <span className="flex items-center gap-3 min-w-0">
                                <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                  <Target className="w-4 h-4" />
                                </span>
                                <span className="min-w-0">
                                  <span className="text-sm font-bold text-[#241329] block">Sınavlarım</span>
                                  <span className="text-[11px] text-[#716779] font-medium line-clamp-1">MEB zümre açık uçlu provaları</span>
                                </span>
                              </span>
                              <ArrowRight className="w-4 h-4 text-[#716779] group-hover:text-amber-700 transition-colors shrink-0" />
                            </Link>

                            <Link href="/notlarim-ajanda"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="group p-3 bg-white rounded-lg border border-[#E8DFEB] flex items-center justify-between gap-3 hover:bg-[#FCE8FA]/30 transition-colors"
                            >
                              <span className="flex items-center gap-3 min-w-0">
                                <span className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4" />
                                </span>
                                <span className="min-w-0">
                                  <span className="text-sm font-bold text-[#241329] block">Notlarım & Ajanda</span>
                                  <span className="text-[11px] text-[#716779] font-medium line-clamp-1">Akıllı defter & çalışma takvimi</span>
                                </span>
                              </span>
                              <ArrowRight className="w-4 h-4 text-[#716779] group-hover:text-purple-700 transition-colors shrink-0" />
                            </Link>

                            <Link href="/gelisimim"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="group p-3 bg-white rounded-lg border border-[#E8DFEB] flex items-center justify-between gap-3 hover:bg-[#FCE8FA]/30 transition-colors"
                            >
                              <span className="flex items-center gap-3 min-w-0">
                                <span className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                  <Activity className="w-4 h-4" />
                                </span>
                                <span className="min-w-0">
                                  <span className="text-sm font-bold text-[#241329] block">Gelişimim</span>
                                  <span className="text-[11px] text-[#716779] font-medium line-clamp-1">Canlı röntgen & grafik karne</span>
                                </span>
                              </span>
                              <ArrowRight className="w-4 h-4 text-[#716779] group-hover:text-emerald-700 transition-colors shrink-0" />
                            </Link>

                            <Link href="/kitaplik"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="group p-3 bg-white rounded-lg border border-[#E8DFEB] flex items-center justify-between gap-3 hover:bg-[#FCE8FA]/30 transition-colors"
                            >
                              <span className="flex items-center gap-3 min-w-0">
                                <span className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                  <Layers className="w-4 h-4" />
                                </span>
                                <span className="min-w-0">
                                  <span className="text-sm font-bold text-[#241329] block">Kitaplık</span>
                                  <span className="text-[11px] text-[#716779] font-medium line-clamp-1">312 MEB ders kitabı & flipbook</span>
                                </span>
                              </span>
                              <ArrowRight className="w-4 h-4 text-[#716779] group-hover:text-indigo-700 transition-colors shrink-0" />
                            </Link>

                            <Link href="/oyunlar"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="group p-3 bg-white rounded-lg border border-[#E8DFEB] flex items-center justify-between gap-3 hover:bg-[#FCE8FA]/30 transition-colors"
                            >
                              <span className="flex items-center gap-3 min-w-0">
                                <span className="w-9 h-9 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                                  <Gamepad2 className="w-4 h-4" />
                                </span>
                                <span className="min-w-0">
                                  <span className="text-sm font-bold text-[#241329] block">Oyunlar</span>
                                  <span className="text-[11px] text-[#716779] font-medium line-clamp-1">Eğlenerek öğrenme & turnuva</span>
                                </span>
                              </span>
                              <ArrowRight className="w-4 h-4 text-[#716779] group-hover:text-pink-700 transition-colors shrink-0" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Mobile Packages
                  if (menu.megaMenuType === 'packages') {
                    return (
                      <div key={menu.id} className="relative overflow-hidden p-5 bg-white rounded-xl shadow-xl shadow-[#4B075F]/5 border border-[#E8DFEB]">
                        <div className="relative z-10 flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-[#FCE8FA] rounded-xl flex items-center justify-center text-[#4B075F] border border-[#F0D8FA] shrink-0">
                              <Award className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="font-bold text-lg text-[#241329] block mb-0.5">{menu.title}</span>
                              <span className="text-xs text-[#716779] font-medium">Öğretmen, Okul ve Kolej</span>
                            </div>
                          </div>
                        </div>

                        <div className="relative z-10 grid grid-cols-1 gap-2">
                          <Link href="/ses-paketleri" className="group p-3 bg-[#FCF9FD] rounded-lg border border-[#E8DFEB] flex items-center justify-between gap-3 hover:bg-[#FCE8FA]/30 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                            <span className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-lg bg-white border border-[#E8DFEB] flex items-center justify-center text-[#4B075F]">
                                <PenTool className="w-4 h-4" />
                              </span>
                              <span>
                                <span className="text-sm font-bold text-[#241329] block">Öğretmen Paketleri</span>
                                <span className="text-[11px] text-[#716779] font-medium">Bireysel ve sınıf lisansları</span>
                              </span>
                            </span>
                            <ArrowRight className="w-4 h-4 text-[#716779] group-hover:text-[#4B075F] transition-colors" />
                          </Link>
                          <Link href="/mesajlasma-paketleri" className="group p-3 bg-[#FCF9FD] rounded-lg border border-[#E8DFEB] flex items-center justify-between gap-3 hover:bg-[#FCE8FA]/30 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                            <span className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-lg bg-white border border-[#E8DFEB] flex items-center justify-center text-[#8D49A6]">
                                <School className="w-4 h-4" />
                              </span>
                              <span>
                                <span className="text-sm font-bold text-[#241329] block">Okul & Kampüs</span>
                                <span className="text-[11px] text-[#716779] font-medium">K-12 tüm okul yönetimi</span>
                              </span>
                            </span>
                            <ArrowRight className="w-4 h-4 text-[#716779] group-hover:text-[#8D49A6] transition-colors" />
                          </Link>
                          <Link href="/combo-paketler" className="group p-3 bg-[#FCE8FA]/50 rounded-lg border border-[#F0D8FA] flex items-center justify-between gap-3 hover:bg-[#FCE8FA] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                            <span className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-lg bg-white border border-[#F0D8FA] flex items-center justify-center text-[#D914C8]">
                                <Award className="w-4 h-4" />
                              </span>
                              <span>
                                <span className="text-sm font-bold text-[#241329] block">Kampüs Plus</span>
                                <span className="text-[11px] text-[#8D49A6] font-medium">LMS + Tahta + Tüm Atölyeler</span>
                              </span>
                            </span>
                            <ArrowRight className="w-4 h-4 text-[#D914C8] transition-colors" />
                          </Link>
                        </div>

                        <Link href="/paketler" className="relative z-10 w-full py-3 bg-[#4B075F] rounded-xl flex items-center justify-center gap-2 hover:bg-[#620B79] transition-colors text-white text-xs font-bold mt-3 active:scale-95 shadow-md" onClick={() => setIsMobileMenuOpen(false)}>
                          Tüm Paketleri Karşılaştır <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    );
                  }

                  // Mobile Sectors
                  if (menu.megaMenuType === 'sectors') {
                    return (
                      <Link 
                        key={menu.id}
                        href="/sektorler" 
                        className="flex items-center justify-between p-4 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB] font-bold text-sm text-[#241329]" 
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <GraduationCap className="w-5 h-5 text-[#4B075F]" />
                          <span>{menu.title}</span>
                          {menu.badge && <span className="px-1.5 py-0.5 bg-[#D914C8] text-white text-[9px] font-black uppercase rounded-md tracking-wider">{menu.badge}</span>}
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#716779]" />
                      </Link>
                    );
                  }

                  // Mobile Dropdown or Custom Mega Menu
                  if (menu.type === 'dropdown' || menu.type === 'megamenu') {
                    const isExpanded = mobileExpandedId === menu.id;
                    const subItems = menu.subItems || [];
                    return (
                      <div key={menu.id} className="bg-[#FCF9FD] border border-[#E8DFEB] rounded-xl overflow-hidden">
                        <button
                          onClick={() => setMobileExpandedId(isExpanded ? null : menu.id)}
                          className="w-full flex items-center justify-between p-4 font-bold text-sm text-[#241329] text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-[#4B075F]" />
                            <span>{menu.title}</span>
                            {menu.badge && <span className="px-1.5 py-0.5 bg-[#D914C8] text-white text-[9px] font-black uppercase rounded-md tracking-wider">{menu.badge}</span>}
                          </div>
                          <ChevronDown className={cn("w-4 h-4 text-[#716779] transition-transform", isExpanded && "rotate-180")} />
                        </button>
                        {isExpanded && (
                          <div className="p-3 pt-0 border-t border-[#E8DFEB] space-y-1 bg-white">
                            {subItems.map((sub) => (
                              <Link
                                key={sub.id}
                                href={sub.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#FCF9FD] text-xs font-bold text-[#241329]"
                              >
                                <div className="flex items-center gap-2">
                                  {getSubMenuIcon(sub.icon)}
                                  <span>{sub.title}</span>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-[#716779]" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Mobile Direct Link
                  return (
                    <Link 
                      key={menu.id}
                      href={menu.path || '#'} 
                      className="flex items-center justify-between p-4 rounded-xl bg-[#FCF9FD] border border-[#E8DFEB] font-bold text-sm text-[#241329]" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-[#8D49A6]" />
                        <span>{menu.title}</span>
                        {menu.badge && (
                          <span className="px-1.5 py-0.5 bg-[#D914C8] text-white text-[9px] font-black uppercase rounded-md tracking-wider shadow-sm animate-pulse">
                            {menu.badge}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#716779]" />
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Buttons */}
              <div className="pt-4 border-t border-[#E8DFEB] flex flex-col gap-3">
                <a
                  href="https://edu.oxonom.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#4B075F] text-white rounded-xl text-center font-bold text-sm shadow-xl shadow-[#4B075F]/20 flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-5 h-5" />
                  Canlı Okul Portalına Giriş Yap
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
