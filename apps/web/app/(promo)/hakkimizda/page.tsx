'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import JsonLd from '@components/Promo/JsonLd';
import { 
  GraduationCap, 
  BookOpen, 
  School, 
  PenTool, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Target, 
  Award,
  Users,
  CheckCircle2
} from 'lucide-react';

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "Oxonom Edu Hakkımızda",
    "description": "Oxonom Edu, K-12 okulları, kolejler, öğretmenler ve öğrenciler için yeni nesil akıllı okul yönetim sistemi, canlı interaktif tahta ve pedagojik eğitim atölyeleri sunan dijital eğitim platformudur.",
    "url": "https://oxonomedu.vercel.app/hakkimizda",
    "inLanguage": "tr"
  };

  
  return (
    <div className="pt-32 pb-24 bg-[#FCF9FD] min-h-screen relative overflow-hidden">
      <JsonLd data={aboutSchema} />
      
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#4B075F]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* HERO SECTION */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E8DFEB] text-[#4B075F] rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 shadow-xs"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#D914C8]" />
            DİJİTAL EĞİTİM PLATFORMU
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold text-[#241329] mb-8 tracking-tight leading-[1.1] max-w-4xl mx-auto"
          >
            Öğrenmenin ve Okul Yönetiminin <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8]">
              Yeni Nesli: Oxonom Edu
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-xl text-[#514458] max-w-3xl mx-auto font-medium leading-relaxed"
          >
            İleri düzey eğitim teknolojilerini pedagojik standartlarla harmanlayarak; 
            okulların, öğretmenlerin ve öğrencilerin öğrenme deneyimini kökten dönüştürüyoruz.
          </motion.p>
        </div>

        {/* CORE ECOSYSTEM GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-32">
          <motion.div 
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="space-y-8"
          >
            <h2 className="text-3xl font-display font-bold text-[#241329] leading-tight">
              Yalnızca bir LMS değil,<br/>
              Kapsamlı Bir <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4B075F] to-[#D914C8]">Öğrenme Ekosistemi</span>
            </h2>
            <p className="text-[#514458] leading-relaxed font-medium">
              Eğitimde dijitalleşme yalnızca kağıtları PDF'e çevirmek değildir. Oxonom Edu; sınıf içinde interaktif akıllı tahta deneyimi sunarken, sınıf dışında MEB uyumlu pedagojik atölyeler ve tek tıkla yoklama/karne motoru ile okulun tüm paydaşlarını tek platformda buluşturur.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-[#FCE8FA] text-[#4B075F] flex items-center justify-center shrink-0 shadow-xs">
                  <PenTool className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#241329]">Sonsuz Tuval & Akıllı Tahta</h4>
                  <p className="text-sm text-[#716779] mt-1">LaTeX matematik formülleri, PDF üzerinde doğrudan soru çözümü ve gecikmesiz CRDT eşzamanlı çalışma mimarisi.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-[#F0D8FA] text-[#8D49A6] flex items-center justify-center shrink-0 shadow-xs">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#241329]">Pedagojik Eğitim Atölyeleri</h4>
                  <p className="text-sm text-[#716779] mt-1">60 saniyelik canlı WPM ölçümlü Hızlı Okuma, MEB 4 çizgili harf yönü kılavuzu ve sesli İngilizce kelime oyunları.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Visual Showcase Card */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative h-[480px] w-full rounded-[3rem] bg-gradient-to-br from-[#4B075F] via-[#350444] to-[#241329] p-8 overflow-hidden shadow-2xl flex items-center justify-center text-white border border-[#4B075F]/30"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
            <div className="absolute -inset-10 bg-white/5 backdrop-blur-3xl rounded-[4rem] transform rotate-12 scale-110 pointer-events-none" />
            
            <div className="relative z-10 text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#8D49A6] to-[#D914C8] text-white mx-auto flex items-center justify-center shadow-2xl shadow-[#D914C8]/30">
                <GraduationCap className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold">Öğrenmenin Yeni Nesli</h3>
              <p className="text-sm text-white/70 max-w-xs mx-auto font-medium">
                "Daha iyi bir gelecek, doğru eğitimle mümkün. Hayallerine giden yolda yanındayız!"
              </p>
              <div className="pt-4 flex justify-center gap-3 text-xs font-bold">
                <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">K-12 Uyumlu</span>
                <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">Sonsuz Tuval</span>
                <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">Canlı WPM</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* STATS BANNER */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-32">
          {[
            { value: '48+', label: 'Aktif Okul & Kampüs' },
            { value: '1.420+', label: 'Kayıtlı Öğrenci' },
            { value: '18.650+', label: 'Tamamlanan Ders' },
            { value: '%99.4', label: 'Platform Memnuniyeti' },
          ].map((st) => (
            <div key={st.label} className="p-6 rounded-3xl bg-white border border-[#E8DFEB] shadow-xs text-center">
              <span className="text-3xl md:text-4xl font-black text-[#4B075F] block mb-1">{st.value}</span>
              <span className="text-xs font-bold text-[#716779] uppercase tracking-wider">{st.label}</span>
            </div>
          ))}
        </div>

        {/* VISION & MISSION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E8DFEB] shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FCE8FA] text-[#4B075F] flex items-center justify-center mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[#241329] mb-3">Misyonumuz</h3>
            <p className="text-[#514458] leading-relaxed font-medium text-sm">
              Öğretmenlerin manuel evrak, yoklama ve formül çizimi gibi zaman kayıplarını sıfıra indirerek öğrenci rehberliğine odaklanmalarını sağlamak; öğrencilere ise oyunlaştırılmış ve modern eğitim atölyeleriyle okuma, yazma ve problem çözme sevgisi kazandırmak.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E8DFEB] shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#F0D8FA] text-[#8D49A6] flex items-center justify-center mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[#241329] mb-3">Vizyonumuz</h3>
            <p className="text-[#514458] leading-relaxed font-medium text-sm">
              Türkiye'den başlayarak dünyanın dört bir yanındaki K-12 okullarını, kolejleri ve eğitim kurumlarını geleceğin akıllı kampüs altyapısıyla buluşturmak; her çocuğun potansiyelini en üst düzeye çıkaran global bir eğitim standardı oluşturmak.
            </p>
          </motion.div>
        </div>

        {/* CTA Banner */}
        <div className="text-center p-10 md:p-16 rounded-3xl bg-[#241329] text-white border border-[#4B075F]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D914C8]/15 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-2xl md:text-4xl font-display font-bold mb-4 relative z-10">
            Geleceğin Dijital Okuluna Katılın
          </h3>
          <p className="text-white/70 max-w-xl mx-auto mb-8 font-medium text-sm relative z-10">
            Canlı demo okulumuzu anında inceleyin veya okulunuz için özel teklif isteyin.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <a
              href="https://edu.oxonom.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#D914C8] text-white rounded-xl font-bold text-sm hover:bg-[#8D49A6] transition-all shadow-xl shadow-[#D914C8]/30 flex items-center gap-2"
            >
              <GraduationCap className="w-5 h-5" /> Canlı Demoyu Başlat
            </a>
            <Link
              href="/paketler"
              className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2"
            >
              Lisans Paketleri <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
