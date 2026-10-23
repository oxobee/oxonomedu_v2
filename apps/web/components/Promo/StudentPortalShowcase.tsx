'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  GraduationCap,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import StudentInteractiveTabs from '@components/Promo/StudentInteractiveTabs';
import {
  getStudentShowcaseSettings,
  subscribeToStudentShowcaseUpdates,
  StudentShowcaseSettings,
} from '@lib/promo/studentShowcase';

export default function StudentPortalShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<StudentShowcaseSettings>(getStudentShowcaseSettings);

  useEffect(() => {
    const unsubscribe = subscribeToStudentShowcaseUpdates((newSettings) => {
      setSettings(newSettings);
    });
    return unsubscribe;
  }, []);

  // 3D Scroll Parallax Transforms
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
    restDelta: 0.001,
  });

  // 3D Perspective Rotation on Scroll (Tilted to Flat & Crisp)
  const rotateX = useTransform(smoothProgress, [0, 1], [14, 0]);
  const scale = useTransform(smoothProgress, [0, 1], [0.94, 1]);
  const translateY = useTransform(smoothProgress, [0, 1], [60, 0]);

  return (
    <section
      ref={containerRef}
      className="relative bg-[#FCF9FD] py-16 sm:py-20 lg:py-28 border-t border-[#E8DFEB]/80 overflow-hidden"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-[#4B075F]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-[#D914C8]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4B075F08_1px,transparent_1px),linear-gradient(to_bottom,#4B075F08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header: Single-line, compact and smaller as requested */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCE8FA] border border-[#F0D8FA] mb-3.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#D914C8] animate-ping" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#4B075F]">
              {settings.badgeText || 'YENİ NESİL ÖĞRENCİ PORTALI'}
            </span>
          </div>

          {/* Üstte küçük 'Öğrenciler İçin Tasarlanmış', bir alt satırda büyük ve dikkat çekici 'Akıllı Eğitim Ekranı' */}
          <h2 className="text-center tracking-tight leading-[1.15]">
            <span className="block text-sm sm:text-base lg:text-lg font-bold text-[#716779] mb-1.5 uppercase tracking-wider">
              Öğrenciler İçin Tasarlanmış
            </span>
            <span className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8]">
              Akıllı Eğitim Ekranı
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-[#716779] mt-3 leading-relaxed font-medium max-w-2xl mx-auto">
            {settings.sectionSubtitle}
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            <a
              href={settings.ctaUrl || 'https://edu.oxonom.com/login'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#4B075F] hover:bg-[#620B79] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-[#4B075F]/20 flex items-center gap-2 active:scale-95 group"
            >
              <GraduationCap className="w-4 h-4 text-[#FCE8FA]" />
              <span>{settings.ctaText || 'Demo Hesap İncele'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* ═══ 3D SCROLL PERSPECTIVE MOCKUP (Updated dynamically from /superadmin) ═══ */}
        <div style={{ perspective: '1400px' }} className="relative mb-14 sm:mb-20">
          <motion.div
            style={{
              rotateX,
              scale,
              y: translateY,
              transformStyle: 'preserve-3d',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className="relative rounded-2xl sm:rounded-3xl border border-[#E8DFEB] shadow-[0_30px_90px_-20px_rgba(75,7,95,0.25)] overflow-hidden bg-white transition-shadow duration-500 hover:shadow-[0_35px_110px_-15px_rgba(75,7,95,0.35)]"
          >
            {/* macOS / Modern Browser Chrome Bar */}
            <div className="bg-[#241329] px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-white/10 select-none">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="w-3 h-3 rounded-full bg-[#EF4444] shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B] shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-[#10B981] shadow-sm" />
                <div className="h-4 w-px bg-white/20 mx-2 hidden sm:block" />
                <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3.5 py-1 rounded-lg text-xs text-white/90 font-mono shadow-inner">
                  <span className="text-[#45C7A2]">🔒</span>
                  <span>edu.oxonom.com/ogrenci-portali</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#16805D]/20 text-[#45C7A2] border border-[#16805D]/30 font-bold text-[10px] hidden md:inline">
                  ● Canlı Öğrenci Portalı
                </span>
                <span className="text-white/60 text-xs font-mono hidden sm:inline">
                  24 Ekim 2026 · Cumartesi
                </span>
                <a
                  href={settings.ctaUrl || 'https://edu.oxonom.com/login'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-[#D914C8] hover:bg-[#8D49A6] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{settings.ctaText || 'Demo Hesap İncele'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* High-Resolution Student Portal Screenshot */}
            <div className="relative bg-[#F9F7FA] overflow-hidden">
              <img
                src={settings.portalImageUrl || '/student-portal-desktop.png'}
                alt="Oxonom EDU Öğrenci Portalı Arayüzü"
                className="w-full h-auto block select-none"
                style={{
                  imageRendering: 'auto',
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* ═══ INTERACTIVE 3D ICON TAB MENU & DEMO SCREENS ═══ */}
        <StudentInteractiveTabs />
      </div>
    </section>
  );
}
