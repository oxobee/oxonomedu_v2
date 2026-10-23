'use client';
import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

export default function PromoFooter() {
  return (
    <footer className="bg-[#241329] text-white pt-24 pb-12 relative overflow-hidden border-t border-[#4B075F]/30">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D914C8]/50 to-transparent" />
      <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-[#4B075F]/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D914C8]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <img 
                src="/logo_white.png" 
                alt="Oxonom Edu Logo" 
                className="h-8 object-contain"
              />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed font-medium max-w-sm">
              Yenilikçi eğitim teknolojileri, sonsuz tuval akıllı tahta ve MEB müfredatına tam uyumlu interaktif pedagojik atölyelerle geleceğin okulunu bugünden inşa ediyoruz.
            </p>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 max-w-sm">
              <p className="text-xs font-bold text-[#FCE8FA]">"Daha iyi bir gelecek, doğru eğitimle mümkün."</p>
              <p className="text-[11px] text-white/50 mt-1">Hayallerine giden yolda yanındayız!</p>
            </div>
            <div className="flex gap-3">
              {[
                { Icon: InstagramIcon, href: 'https://instagram.com/oxonomedu', label: 'Oxonom Edu Instagram' },
                { Icon: FacebookIcon, href: 'https://facebook.com/oxonomedu', label: 'Oxonom Edu Facebook' },
                { Icon: TwitterIcon, href: 'https://x.com/oxonomedu', label: 'Oxonom Edu X' },
                { Icon: YoutubeIcon, href: 'https://youtube.com/@oxonomedu', label: 'Oxonom Edu YouTube' }
              ].map(({ Icon, href, label }, i) => (
                <a 
                  key={i} 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={label} 
                  className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#4B075F] hover:border-[#D914C8]/50 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-sm"
                >
                  <Icon className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Modüller */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#D914C8]">Modüller</h4>
            <ul className="space-y-2.5 text-xs font-medium text-white/70">
              <li><Link href="/web-site" className="hover:text-white transition-colors">Akıllı Okul & LMS</Link></li>
              <li><Link href="/whatsapp" className="hover:text-white transition-colors">İnteraktif Akıllı Tahta</Link></li>
              <li><Link href="/instagram" className="hover:text-white transition-colors">1 Dk Hızlı Okuma</Link></li>
              <li><Link href="/facebook" className="hover:text-white transition-colors">MEB Harf Çizgi Atölyesi</Link></li>
              <li><Link href="/facebook" className="hover:text-white transition-colors">İngilizce Görsel Macera</Link></li>
            </ul>
          </div>

          {/* Kademeler */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#D914C8]">Kademeler</h4>
            <ul className="space-y-2.5 text-xs font-medium text-white/70">
              <li><Link href="/sektorler/ilkokul" className="hover:text-white transition-colors">İlkokul (1-4. Sınıf)</Link></li>
              <li><Link href="/sektorler/ortaokul" className="hover:text-white transition-colors">Ortaokul (5-8. Sınıf)</Link></li>
              <li><Link href="/sektorler/ortaokul" className="hover:text-white transition-colors">LGS Hazırlık (8. Sınıf)</Link></li>
              <li><Link href="/sektorler/ogretmen-zumre" className="hover:text-white transition-colors">Öğretmen & Zümre</Link></li>
              <li><Link href="/web-site" className="hover:text-white transition-colors">Akıllı Okul & Kampüs</Link></li>
            </ul>
          </div>

          {/* Lisanslar */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#D914C8]">Lisanslar</h4>
            <ul className="space-y-2.5 text-xs font-medium text-white/70">
              <li><Link href="/ses-paketleri" className="hover:text-white transition-colors">Öğretmen Paketleri</Link></li>
              <li><Link href="/mesajlasma-paketleri" className="hover:text-white transition-colors">Okul & Kampüs Lisansı</Link></li>
              <li><Link href="/combo-paketler" className="hover:text-white transition-colors">Kampüs Plus Hibrit</Link></li>
              <li><Link href="/paketler" className="hover:text-white transition-colors">Tüm Lisansları Karşılaştır</Link></li>
            </ul>
          </div>

          {/* İletişim & Kurumsal */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#D914C8]">Kurumsal</h4>
            <ul className="space-y-2.5 text-xs font-medium text-white/70">
              <li><Link href="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link href="/indir" className="hover:text-white transition-colors">Uygulamaları İndir</Link></li>
              <li><Link href="/entegrasyonlar" className="hover:text-white transition-colors">Entegrasyonlar</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Eğitim Blogu</Link></li>
              <li><a href="https://edu.oxonom.com/login" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-[#D914C8]" /> Canlı Giriş</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© 2026 Oxonom Edu (LearnHouze v2.0). Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">KVKK Aydınlatma Metni</span>
            <span className="hover:text-white transition-colors cursor-pointer">Gizlilik & Güvenlik</span>
            <span className="hover:text-white transition-colors cursor-pointer">Kullanım Şartları</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
