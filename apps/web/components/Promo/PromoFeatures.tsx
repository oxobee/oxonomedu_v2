'use client';
import { motion } from 'framer-motion';
import { 
  PenTool, 
  BookOpen, 
  School, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Zap, 
  GraduationCap, 
  Users, 
  CheckCircle2, 
  Languages,
  Activity,
  Award,
  Link2,
  CalendarCheck,
  Smartphone
} from 'lucide-react';

const features = [
  {
    title: 'Yeni Nesil Akıllı Tahta',
    subtitle: 'Sınıftan Eve Kesintisiz Senkronizasyon',
    description: 'Öğretmeninizin okulda akıllı tahtaya yazdığı tüm formüller, ders çizimleri ve soru çözümleri anında öğrencinin profiline kaydedilir. Ders sonrasında hiçbir not kaybolmaz; okul ile ev arasında kesintisiz, evrensel bir öğrenme köprüsü kurulur.',
    icon: PenTool,
    color: 'bg-gradient-to-br from-[#4B075F] to-[#8D49A6] text-white shadow-[#4B075F]/30',
    borderColor: 'hover:border-[#4B075F]/40',
    bgGradient: 'from-[#FCE8FA]/50 to-transparent',
    details: ['Sınıf-Ev Canlı Senkronu', 'Tahta Notu Arşivi', 'Otomatik Ders Kaydı']
  },
  {
    title: 'Pedagojik Eğitim Atölyeleri',
    subtitle: 'Oyunlaştırılmış Öğrenme ve Zeka Becerileri',
    description: 'MEB müfredatıyla tam uyumlu 1 Dk Hızlı Okuma (WPM), MEB 4 çizgili dik temel harf kılavuzu, 8 kategorili sesli İngilizce ve eğitsel zeka oyunları. Öğrencinin okuldaki başarısını evde pekiştiren, sıkılmadan eğlenerek öğreten pedagojik araçlar.',
    icon: BookOpen,
    color: 'bg-gradient-to-br from-[#8D49A6] to-[#D914C8] text-white shadow-[#D914C8]/30',
    borderColor: 'hover:border-[#D914C8]/40',
    bgGradient: 'from-[#F0D8FA]/50 to-transparent',
    details: ['MEB Müfredat Uyumu', 'Oyunla Öğrenme', 'Bilişsel Beceri Gelişimi']
  },
  {
    title: 'K-12 Akıllı Kampüs Entegrasyonu',
    subtitle: 'Anlaşmalı Okullarla %100 Uyumlu Yönetim',
    description: 'Oxonom Education anlaşmalı okullarla tam entegre çalışır. Öğrenci devamsızlık durumu, sınav sonuçları, rehberlik notları ve öğretmen değerlendirmeleri okuldaki yönetim sisteminden doğrudan öğrenci ve veli paneline anlık yansır.',
    icon: School,
    color: 'bg-gradient-to-br from-[#350444] to-[#4B075F] text-white shadow-[#350444]/30',
    borderColor: 'hover:border-[#4B075F]/40',
    bgGradient: 'from-[#FCE8FA]/50 to-transparent',
    details: ['Okulla Tam Entegre', 'Canlı Devamsızlık & Karne', 'Rehberlik & Öğretmen Notları']
  }
];

const secondaryFeatures = [
  { 
    icon: Link2, 
    title: 'Anlaşmalı Okullarla %100 Entegre', 
    desc: 'Öğrencinin şubesi, dersleri ve öğretmen notları okul yönetim sistemiyle anlık eşleşir.' 
  },
  { 
    icon: Layers, 
    title: 'MEB 2026-2027 Evrensel Uyumu', 
    desc: 'Tüm sınıf düzeyleri, ders kazanımları ve güncel MEB müfredatıyla tam uyumludur.' 
  },
  { 
    icon: CalendarCheck, 
    title: 'Canlı Devamsızlık & Yoklama', 
    desc: 'Sınıfta alınan yoklama tek saniyede öğrenci profiline ve veli paneline yansır.' 
  },
  { 
    icon: Activity, 
    title: 'Akademik Röntgen & Başarı Karnesi', 
    desc: 'Sınavlar, sözlü notları ve ödev teslim performansı grafiklerle anlık izlenir.' 
  },
  { 
    icon: Award, 
    title: 'Rehberlik & Öğretmen Görüşleri', 
    desc: 'Rehberlik servisinin ve branş öğretmenlerinin tavsiye notları doğrudan öğrenciye iletilir.' 
  },
  { 
    icon: Smartphone, 
    title: 'Web, Tablet ve Cepte Kesintisiz', 
    desc: 'Akıllı tahtadan eve, tabletten telefona kadar tek hesapla her yerde kesintisiz erişim.' 
  },
];

export default function PromoFeatures() {
  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden border-t border-[#E8DFEB]/80">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E8DFEB] to-transparent" />
      <div className="absolute top-1/4 -right-64 w-[500px] h-[500px] bg-[#4B075F]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-64 w-[500px] h-[500px] bg-[#D914C8]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FCF9FD] border border-[#E8DFEB] text-[#4B075F] rounded-full text-xs font-black uppercase tracking-wider mb-4 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D914C8]" />
            <span>TAM ENTEGRE EĞİTİM EKOSİSTEMİ</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-[#241329] mb-4 tracking-tight leading-tight"
          >
            Okul Yönetiminden Akıllı Tahtaya<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8]">
              Her Şey Öğrenci İçin Tam Entegre
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-[#716779] max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Oxonom Education anlaşmalı okullarda; öğrenci devamsızlığı, başarı durumu, rehberlik notları ve eğitsel oyunlar okuldaki yönetim sisteminden akıllı tahtaya kadar %100 senkronize çalışır.
          </motion.p>
        </div>

        {/* 3 Main Highlight Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-14 md:mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group relative rounded-3xl p-7 sm:p-8 bg-gradient-to-b ${feature.bgGradient} border border-[#E8DFEB] ${feature.borderColor} transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between`}
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-[#241329] mb-1 group-hover:text-[#4B075F] transition-colors leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-xs font-bold text-[#8D49A6] mb-3">
                    {feature.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-[#716779] leading-relaxed mb-6 font-medium">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E8DFEB]/80 flex flex-wrap gap-1.5">
                  {feature.details.map((detail, dIdx) => (
                    <span 
                      key={dIdx} 
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#E8DFEB] text-[11px] font-bold text-[#4B075F] group-hover:border-[#4B075F]/30 transition-colors shadow-2xs"
                    >
                      {detail}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 6 Grid Core Capabilities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {secondaryFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-[#FCF9FD] border border-[#E8DFEB] hover:border-[#4B075F]/30 hover:bg-white hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DFEB] text-[#4B075F] group-hover:bg-[#4B075F] group-hover:text-white flex items-center justify-center shrink-0 shadow-xs transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#241329] mb-1 group-hover:text-[#4B075F] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#716779] leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
