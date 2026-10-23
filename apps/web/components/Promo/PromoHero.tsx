'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  GraduationCap,
  BookOpen,
  School,
  PenTool,
  Award,
  Users,
  LayoutDashboard,
  Sparkles,
  Languages,
  ClipboardCheck,
  LineChart,
  Monitor,
  ShieldCheck,
  Layers,
  Zap,
  Lightbulb,
  CheckCircle2,
  CalendarDays,
  Target,
  Clock,
  Play,
  Pause,
  Flame,
  Star,
  Activity,
  Tv,
  FileText,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Rocket
} from 'lucide-react';
import {
  HeroBanner,
  HeroSliderSettings,
  READY_BADGE_ICONS,
  getHeroBanners,
  getHeroSliderSettings,
  subscribeToBannerUpdates
} from '@lib/promo/heroBanners';
import StudentPortalShowcase from './StudentPortalShowcase';

function renderBadgeIcon(iconKey?: string, defaultImg?: string) {
  const found = READY_BADGE_ICONS.find((item) => item.id === iconKey);
  if (found) {
    if (found.type === 'image') {
      return (
        <img
          src={found.value}
          alt={found.name}
          className="w-full h-full object-contain"
        />
      );
    }
    if (found.type === 'lucide') {
      const LucideIconsMap: Record<string, any> = {
        GraduationCap,
        Sparkles,
        Zap,
        PenTool,
        BookOpen,
        Award,
        School,
        Target,
        ShieldCheck,
        Rocket,
        Star,
        Flame,
      };
      const IconComp = LucideIconsMap[found.value] || Sparkles;
      return <IconComp className="w-4 h-4" style={{ color: found.color || '#4B075F' }} />;
    }
  }
  if (iconKey && (iconKey.startsWith('/') || iconKey.startsWith('http') || iconKey.startsWith('data:'))) {
    return <img src={iconKey} alt="Badge" className="w-full h-full object-contain" />;
  }
  return <img src={defaultImg || '/badge_14gun.png'} alt="Badge" className="w-full h-full object-contain" />;
}

export default function PromoHero({
  copy,
}: {
  copy?: {
    heroBadge: string;
    heroTitle: string;
    heroDescription: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
}) {
  // Dynamic Banners & Slider State
  const [banners, setBanners] = useState<HeroBanner[]>(() => getHeroBanners());
  const [settings, setSettings] = useState<HeroSliderSettings>(() => getHeroSliderSettings());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Subscribe to live banner updates from /superadmin
  useEffect(() => {
    const unsubscribe = subscribeToBannerUpdates(() => {
      const updatedBanners = getHeroBanners();
      const updatedSettings = getHeroSliderSettings();
      setBanners(updatedBanners);
      setSettings(updatedSettings);
      setCurrentIndex((prev) => (prev >= updatedBanners.length ? 0 : prev));
    });
    return unsubscribe;
  }, []);

  const activeBanners = banners.filter((b) => b.active);
  const safeBanners = activeBanners.length > 0 ? activeBanners : banners;
  const currentBanner = safeBanners[currentIndex % safeBanners.length];

  // Auto-slide Timer & Progress Bar
  useEffect(() => {
    if (!settings.autoPlay || safeBanners.length <= 1 || isPaused) {
      return;
    }

    const intervalTimeMs = Math.max(2, settings.intervalSeconds) * 1000;
    const stepMs = 50;
    const stepPercent = (stepMs / intervalTimeMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((idx) => (idx + 1) % safeBanners.length);
          return 0;
        }
        return prev + stepPercent;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [settings.autoPlay, settings.intervalSeconds, safeBanners.length, isPaused, currentIndex]);

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % safeBanners.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + safeBanners.length) % safeBanners.length);
  };

  const handleSelectSlide = (idx: number) => {
    setProgress(0);
    setCurrentIndex(idx);
  };

  const isSlide = settings.transitionEffect === 'slide';

  const textVariants: any = isSlide
    ? {
        initial: { opacity: 0, x: -35, filter: 'blur(3px)' },
        animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, x: 25, filter: 'blur(3px)', transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] } },
      }
    : {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
        exit: { opacity: 0, y: -15, transition: { duration: 0.3, ease: 'easeIn' } },
      };

  const visualVariants: any = isSlide
    ? {
        initial: { opacity: 0, x: 40, scale: 0.92 },
        animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, x: -40, scale: 0.92, transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] } },
      }
    : {
        initial: { opacity: 0, scale: 0.92 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
        exit: { opacity: 0, scale: 0.92, transition: { duration: 0.3, ease: 'easeIn' } },
      };

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);

  const text = copy ?? {
    heroBadge: '🎓 YENİ NESİL DİJİTAL EĞİTİM PLATFORMU',
    heroTitle: 'Öğrenmenin yeni nesli.',
    heroDescription: 'Daha fazlasını keşfet, geleceğini sen tasarla. K-12 okulları, kolejler, öğretmenler ve öğrenciler için hepsi bir arada akıllı okul yönetim sistemi, canlı interaktif tahta ve MEB uyumlu pedagojik eğitim atölyeleri.',
    ctaPrimary: 'Canlı Okul Portalını Keşfet',
    ctaSecondary: 'Modülleri & Atölyeleri İncele',
  };

  return (
    <>
      {/* ═══ FULL SCREEN PURPLE HERO BANNER (Webde Tam Ekran) ═══ */}
      <section
        className="relative min-h-[100dvh] w-full flex flex-col justify-between overflow-hidden text-white pt-24 pb-8 sm:pt-32 sm:pb-12 lg:pt-36 lg:pb-12"
        style={{
          background: 'linear-gradient(135deg, #4B075F 0%, #350444 40%, #241329 100%)',
        }}
      >
        {/* Ambient Lights & Texture */}
        <motion.div style={{ y: y1 }} className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-[#D914C8]/20 rounded-full blur-[140px] pointer-events-none" />
        <motion.div style={{ y: y2 }} className="absolute bottom-0 left-[5%] w-[450px] h-[450px] bg-[#8D49A6]/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-10 w-full flex-grow flex flex-col justify-center relative z-10 my-auto">
          {/* 2-Column Animated Hero Slider (Mobilde Görsel Üstte, Webde Tam Ekran) */}
          <div
            className="relative flex flex-col justify-center my-auto py-4 sm:py-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-16 items-center w-full"
              >
                {/* Visual Column: Mobilde Üstte (order-1), Masaüstünde Sağda (lg:order-2, 60% Genişlik) */}
                <motion.div
                  variants={visualVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="order-1 lg:order-2 lg:col-span-6 xl:col-span-7 flex flex-col items-center justify-center relative select-none w-full py-4 lg:py-2"
                >
                  <div className="absolute w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] lg:w-[720px] lg:h-[720px] xl:w-[850px] xl:h-[850px] bg-gradient-to-t from-[#D914C8]/40 via-[#8D49A6]/30 to-transparent rounded-full blur-[130px] pointer-events-none" />
                  <motion.div
                    animate={{
                      y: [0, -14, 0],
                      rotate: [0, 1.2, -1.2, 0],
                    }}
                    transition={{
                      duration: 4.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="relative max-w-full flex items-center justify-center"
                  >
                    <img
                      src={currentBanner.imageUrl}
                      alt={currentBanner.title}
                      className="w-72 sm:w-96 md:w-[460px] lg:w-[620px] xl:w-[720px] 2xl:w-[820px] max-w-full max-h-[580px] lg:max-h-[700px] xl:max-h-[780px] h-auto object-contain relative z-10 drop-shadow-[0_35px_60px_rgba(75,7,95,0.7)] transition-transform duration-300 hover:scale-[1.03]"
                    />
                  </motion.div>
                </motion.div>

                {/* Text Column: Mobilde Altta (order-2), Masaüstünde Solda (lg:order-1) */}
                <motion.div
                  variants={textVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="order-2 lg:order-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-center text-center lg:text-left items-center lg:items-start"
                >
                  {/* Badge with Custom / Ready Icon */}
                  <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 pl-1.5 pr-4 py-1 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md mb-4 sm:mb-5 shadow-md hover:bg-white/15 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                      {renderBadgeIcon(currentBanner.badgeIcon, currentBanner.imageUrl)}
                    </div>
                    <span className="h-2 w-2 rounded-full bg-[#D914C8] animate-ping" />
                    <span>{currentBanner.badge}</span>
                  </div>

                  {/* Title with Gradient Highlight */}
                  <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.12] sm:leading-[1.08] tracking-tight">
                    {currentBanner.title}{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FCE8FA] to-[#D914C8]">
                      {currentBanner.highlightText}
                    </span>
                  </h1>

                  {/* Description */}
                  <p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base lg:text-lg font-medium leading-relaxed text-white/85">
                    {currentBanner.description}
                  </p>

                  {/* Action CTAs */}
                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <a
                      href={currentBanner.primaryCtaUrl}
                      target={currentBanner.primaryCtaUrl.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 bg-[#D914C8] hover:bg-[#620B79] text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-[#D914C8]/30 flex items-center justify-center gap-2 active:scale-95 group"
                    >
                      <GraduationCap className="w-5 h-5" />
                      <span>{currentBanner.primaryCtaText}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <Link
                      href={currentBanner.secondaryCtaUrl}
                      className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-sm transition-all backdrop-blur-md flex items-center justify-center gap-2 active:scale-95"
                    >
                      <BookOpen className="w-5 h-5" />
                      <span>{currentBanner.secondaryCtaText}</span>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Navigation Bar & Timing Progress Bar */}
            {safeBanners.length > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 relative z-20">
                {/* Prev / Next & Indicators */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md active:scale-95"
                    title="Önceki Banner"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Dot Pagination */}
                  <div className="flex items-center gap-2">
                    {safeBanners.map((b, idx) => {
                      const active = idx === currentIndex % safeBanners.length;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleSelectSlide(idx)}
                          className={`transition-all rounded-full ${
                            active
                              ? 'w-7 h-2.5 bg-[#D914C8] shadow-md shadow-[#D914C8]/40'
                              : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'
                          }`}
                          title={`${idx + 1}. Banner`}
                        />
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md active:scale-95"
                    title="Sonraki Banner"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Play / Pause Toggle */}
                  {settings.autoPlay && (
                    <button
                      type="button"
                      onClick={() => setIsPaused(!isPaused)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all ml-1"
                      title={isPaused ? 'Oynat' : 'Duraklat'}
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Countdown Progress & Admin Link */}
                <div className="flex items-center gap-4">
                  {settings.autoPlay && !isPaused && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-white/60 font-mono">
                        Otomatik: {settings.intervalSeconds}s
                      </span>
                      <div className="w-24 h-1.5 bg-white/15 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#D914C8] to-[#8D49A6] transition-all duration-75"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Link
                    href="/superadmin"
                    className="text-[11px] text-[#FCE8FA] hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all"
                    title="Hero Banner Yönetim Paneli"
                  >
                    <Sliders className="w-3 h-3 text-[#D914C8]" />
                    <span>Banner Yönetimi</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ ÖĞRENCİ EKRANI MOCKUP & PORTAL SHOWCASE ═══ */}
      <StudentPortalShowcase />
    </>
  );
}
