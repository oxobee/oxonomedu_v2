'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import JsonLd from '@components/Promo/JsonLd';
import { 
  Puzzle, Globe, Zap, ArrowRight, School, 
  Calendar, Layers, Cloud, Smartphone, LayoutGrid,
  CheckCircle2, Tv, Database, Video, Monitor
} from 'lucide-react';

const INTEGRATIONS = [
  // Eğitim & LMS
  { id: 'e-okul', name: 'MEB E-Okul', category: 'Eğitim & LMS', icon: School, bg: 'bg-[#4B075F]/10', color: 'text-[#4B075F]', desc: 'Öğrenci kütük listeleri ve dönem sonu notlarını tek tıkla Excel/CSV ile senkronize eder.' },
  { id: 'classroom', name: 'Google Classroom', category: 'Eğitim & LMS', icon: Globe, bg: 'bg-[#16805D]/10', color: 'text-[#16805D]', desc: 'Sınıf listelerinizi ve ödev içeriklerinizi Google Workspace for Education ile bağlar.' },
  { id: 'teams-edu', name: 'Microsoft Teams Edu', category: 'Eğitim & LMS', icon: Layers, bg: 'bg-[#2563EB]/10', color: 'text-[#2563EB]', desc: 'Ders takvimleri, ödev teslimleri ve sınıf kanalları ile doğrudan entegrasyon.' },
  { id: 'moodle', name: 'Moodle & Canvas', category: 'Eğitim & LMS', icon: LayoutGrid, bg: 'bg-[#B86B00]/10', color: 'text-[#B86B00]', desc: 'LMS standartlarında SCORM ve ders materyali senkronizasyonu sağlar.' },

  // Canlı Ders & Video
  { id: 'zoom', name: 'Zoom Education', category: 'Canlı Ders & Video', icon: Video, bg: 'bg-[#2563EB]/10', color: 'text-[#2563EB]', desc: 'Uzaktan eğitim derslerinde akıllı tahta oturumunu tek tıkla Zoom odasına yansıtır.' },
  { id: 'meet', name: 'Google Meet', category: 'Canlı Ders & Video', icon: Video, bg: 'bg-[#16805D]/10', color: 'text-[#16805D]', desc: 'Öğrenci ve veli toplantılarını doğrudan platform takviminden başlatır.' },

  // Akıllı Donanım & Tahta
  { id: 'vestel-board', name: 'Vestel & Arçelik Tahta', category: 'Donanım & Tahta', icon: Monitor, bg: 'bg-[#4B075F]/10', color: 'text-[#4B075F]', desc: 'Milli Eğitim okullarındaki etkileşimli akıllı tahtalarda sıfır kurulumla tarayıcıdan çalışır.' },
  { id: 'promethean', name: 'Promethean & SMART', category: 'Donanım & Tahta', icon: Monitor, bg: 'bg-[#8D49A6]/10', color: 'text-[#8D49A6]', desc: 'Basınca duyarlı kalem ve çoklu dokunmatik hareketleri (gesture) gecikmesiz destekler.' },
  { id: 'tablet', name: 'iPad & Android Tablet', category: 'Donanım & Tahta', icon: Smartphone, bg: 'bg-[#D914C8]/10', color: 'text-[#D914C8]', desc: 'Apple Pencil ve stylus kalem desteğiyle öğrencilerin defter gibi kullanmasını sağlar.' },
  { id: 'panotv', name: 'Koridor Pano TV', category: 'Donanım & Tahta', icon: Tv, bg: 'bg-[#B86B00]/10', color: 'text-[#B86B00]', desc: 'Okul koridorlarındaki TV ekranlarına yemek menüsü, duyuru ve nöbetçi listesini anlık basar.' },

  // Altyapı & Senkronizasyon
  { id: 'hocuspocus', name: 'Hocuspocus & Yjs CRDT', category: 'Altyapı', icon: Zap, bg: 'bg-[#D914C8]/10', color: 'text-[#D914C8]', desc: 'Tüm sınıfın aynı tahta üzerinde çakışmasız ve anlık çizim yapmasını sağlayan CRDT sunucusu.' },
  { id: 'postgres', name: 'PostgreSQL 16 & pgvector', category: 'Altyapı', icon: Database, bg: 'bg-[#2563EB]/10', color: 'text-[#2563EB]', desc: 'Öğrenci kütüğü ve müfredat verilerini şifreli ve yüksek performanslı depolama altyapısı.' },
  { id: 'redis', name: 'Redis 7 Cache & Pub/Sub', category: 'Altyapı', icon: Database, bg: 'bg-[#C62848]/10', color: 'text-[#C62848]', desc: 'Canlı oturumlar ve anlık bildirim kuyrukları için ultra hızlı önbellek mimarisi.' },

  // Veli & İletişim
  { id: 'whatsapp-edu', name: 'WhatsApp Veli Bildirim', category: 'Veli & İletişim', icon: Smartphone, bg: 'bg-[#16805D]/10', color: 'text-[#16805D]', desc: 'Yoklama devamsızlık durumu ve haftalık gelişim özetini veliye otomatik mesaj atar.' },
  { id: 'sms-api', name: 'Netgsm & İletimerkezi SMS', category: 'Veli & İletişim', icon: Zap, bg: 'bg-[#4B075F]/10', color: 'text-[#4B075F]', desc: 'Acil duyurular ve resmi okul SMS başlığıyla tüm velilere anlık SMS gönderir.' },
];

const CATEGORIES = ['Tümü', ...Array.from(new Set(INTEGRATIONS.map(i => i.category)))];

export default function IntegrationsPage() {
  
  const [activeCategory, setActiveCategory] = useState('Tümü');

  const filteredIntegrations = INTEGRATIONS.filter(item => 
    activeCategory === 'Tümü' || item.category === activeCategory
  );

  return (
    <div className="pt-32 pb-24 bg-[#FCF9FD] min-h-screen relative overflow-hidden">
      
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Entegrasyonlar - Oxonom Edu",
        "description": "Oxonom Edu'nun MEB, E-Okul, Google Classroom, akıllı tahtalar ve modern eğitim araçlarıyla kesintisiz entegrasyonu."
      }} />

      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#4B075F]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-[#E8DFEB] text-[#4B075F] rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 shadow-xs"
          >
            <Puzzle className="w-3.5 h-3.5 text-[#D914C8]" />
            TAM ENTEGRASYON VE UYUMLULUK
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold text-[#241329] mb-6 tracking-tight leading-[1.1]"
          >
            Mevcut Okul Altyapınızla <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4B075F] via-[#8D49A6] to-[#D914C8]">
              Sıfır Sürtünmeyle Uyumlu
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-[#514458] font-medium leading-relaxed"
          >
            Mevcut akıllı tahtalarınızı değiştirmeden, E-Okul listelerinizi aktararak ve Google Classroom ile senkronize kalarak dakikalar içinde kullanmaya başlayın.
          </motion.p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === category 
                  ? 'bg-[#4B075F] text-white shadow-md shadow-[#4B075F]/20' 
                  : 'bg-white text-[#716779] border border-[#E8DFEB] hover:border-[#8D49A6]/40'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          <AnimatePresence>
            {filteredIntegrations.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="bg-white rounded-3xl p-6 border border-[#E8DFEB] hover:border-[#8D49A6]/40 transition-all premium-shadow-hover flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#716779] px-2.5 py-1 bg-[#FCF9FD] rounded-full border border-[#E8DFEB]">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#241329] mb-2">{item.name}</h3>
                    <p className="text-xs text-[#514458] leading-relaxed font-medium mb-6">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E8DFEB] flex items-center justify-between text-xs font-bold text-[#4B075F]">
                    <span className="flex items-center gap-1.5 text-[#16805D]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aktif Destek
                    </span>
                    <span className="text-[#8D49A6] group-hover:translate-x-1 transition-transform">
                      Detay →
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
