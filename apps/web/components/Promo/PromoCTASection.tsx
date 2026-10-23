'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Sparkles, Check } from 'lucide-react';

export default function PromoCTASection() {
  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E8DFEB] to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-[2rem] md:rounded-[3rem] bg-[#241329] p-8 sm:p-12 md:p-16 lg:p-20 overflow-hidden text-center text-white shadow-2xl border border-[#4B075F]/40"
        >
          {/* Brand Glow Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] md:w-full md:h-full bg-[#4B075F]/30 rounded-full blur-[140px]" />
            <div className="absolute -bottom-1/2 -right-1/2 w-[200%] h-[200%] md:w-full md:h-full bg-[#D914C8]/20 rounded-full blur-[140px]" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            {/* 3D Mascot with 14 Gün Ücretsiz Deneyin Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex justify-center mb-4 sm:mb-6"
            >
              <div className="w-[340px] xs:w-[380px] sm:w-[420px] md:w-[460px] lg:w-[500px] max-w-[95vw] drop-shadow-[0_25px_50px_rgba(217,20,200,0.45)] select-none">
                <img
                  src="/mascot/mascot-14gun-badge.png"
                  alt="14 Gün Ücretsiz Deneyin - Oxonom Edu Maskot"
                  className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-[#D914C8] rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 md:mb-8 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D914C8]" />
              <span>ÖĞRENCİNİN YENİ NESİL BAŞARI PLATFORMU</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 leading-[1.1] tracking-tight"
            >
              Daha iyi bir gelecek, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FCE8FA] to-[#D914C8]">
                doğru eğitimle mümkün.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-sm sm:text-base md:text-lg text-white/70 mb-8 max-w-2xl mx-auto font-medium leading-relaxed"
            >
              Hayallerine giden yolda yanındayız! Sınırsız akıllı tahta kayıtları, 7/24 kişisel yapay zekâ eğitmen desteği, 312 MEB kitabı ve eğitsel oyunlarla ders çalışmak artık çok daha keyifli. İlk 14 gün kredi kartsız ücretsiz deneyin!
            </motion.p>

            {/* Quick Guarantees */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-white/80 mb-8">
              <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
                <Check className="w-3.5 h-3.5 text-[#45C7A2]" /> Kredi Kartı Gerekmez
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
                <Check className="w-3.5 h-3.5 text-[#45C7A2]" /> Anında Sınıf Senkronizasyonu
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
                <Check className="w-3.5 h-3.5 text-[#45C7A2]" /> Dilediğin An İptal
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a
                href="https://edu.oxonom.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-[#D914C8] hover:bg-[#8D49A6] text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-[#D914C8]/30 flex items-center justify-center gap-2 active:scale-95"
              >
                <GraduationCap className="w-5 h-5" />
                <span>14 Gün Ücretsiz Başla</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#fiyatlandirma"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-bold text-sm hover:bg-white/20 transition-all backdrop-blur-md flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Öğrenci Paketlerini İncele</span>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
