'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import JsonLd from './JsonLd';

const faqs = [
  {
    question: 'Oxonom Edu dijital eğitim platformu nedir ve neleri kapsar?',
    answer: 'Oxonom Edu; K-12 okulları, kolejler ve öğretmenler için tasarlanmış yeni nesil bir akıllı kampüs ekosistemidir. Sonsuz tuval akıllı tahta (Infinite Canvas), 1 Dk Hızlı Okuma WPM atölyesi, MEB 4 çizgili harf yazılış yönü kılavuzu, sesli İngilizce kelime maceraları, hızlı K-12 yoklama motoru ve dönemlik GNO karne sistemini tek çatı altında sunar.'
  },
  {
    question: 'MEB 2026-2027 müfredatına ve E-Okul formatına uyumlu mu?',
    answer: 'Evet. İlkokul 1-4. sınıf MEB Dik Temel Abece yazı fontları, 4 çizgili 3 aralıklı kılavuz satır defteri ve kazanım hedefleri Talim Terbiye Kurulu standartlarına tam uyumludur. Kütük ve not listeleri Excel veya CSV formatında tek tıkla içe ve dışa aktarılabilir.'
  },
  {
    question: 'Sınıftaki akıllı tahtalarda ve tabletlerde nasıl çalışır?',
    answer: 'Oxonom Edu %100 web tabanlıdır ve PWA (Progressive Web App) desteği barındırır. Okulunuzdaki Vestel, Arçelik, Promethean veya SMART akıllı tahtalarda, dokunmatik ekranlarda, iPad ve Android tabletlerde hiçbir ek yazılım gerektirmeden tarayıcıdan anında açılır.'
  },
  {
    question: 'Öğrenciler sınıflara ve derslere nasıl bağlanır?',
    answer: 'Öğretmen sınıfını açtığında sistem tek tıkla 6 haneli bir Sınıf Katılım Kodu üretir. Öğrenciler bu kodu girerek doğrudan kendi şubesine, akıllı tahtaya ve ödev merkezine otomatik olarak bağlanır.'
  },
  {
    question: 'Akıllı tahtada eşzamanlı çalışma (Collab) nasıl gerçekleşir?',
    answer: 'Hocuspocus Server ve Yjs CRDT mimarisi ile öğretmen ve öğrenciler tahtaya canlı olarak bağlanabilir. Öğretmen dilediğinde bir öğrenciye tahtada çizim yetkisi vererek soruyu birlikte çözebilir.'
  },
  {
    question: 'Öğrenci ve okul verileri güvende mi?',
    answer: 'Evet. Tüm veriler PostgreSQL 16 veritabanında uçtan uca şifrelemeyle korunur, KVKK ve veri koruma mevzuatına %100 tam uyumludur. Verileriniz asla üçüncü taraflarla paylaşılmaz.'
  }
];

export default function PromoFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-20 md:py-32 bg-white relative overflow-hidden border-t border-[#E8DFEB]">
      <JsonLd data={faqSchema} />
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#4B075F]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FCF9FD] border border-[#E8DFEB] text-[#4B075F] rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#D914C8]" />
            MERAK EDİLENLER
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-[#241329] mb-4 tracking-tight">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-[#716779] text-base font-medium max-w-xl mx-auto">
            Oxonom Edu akıllı okul yönetimi, tahta sistemi ve pedagojik atölyeler hakkında tüm yanıtlar.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? 'bg-[#FCF9FD] border-[#8D49A6]/40 shadow-md shadow-[#4B075F]/5' 
                    : 'bg-white border-[#E8DFEB] hover:border-[#D5C5DC]'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-[#241329]"
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-[#FCE8FA] text-[#4B075F]' : 'bg-[#FCF9FD] text-[#716779]'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-sm text-[#514458] leading-relaxed font-medium border-t border-[#E8DFEB]/60 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
