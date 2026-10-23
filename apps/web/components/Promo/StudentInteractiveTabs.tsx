'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  Award,
  Zap,
  TrendingUp,
  RotateCcw,
  Check,
  Star,
  Flame,
  Bookmark,
  Highlighter,
  Trophy,
  Play,
  Brain,
  GraduationCap,
  FileText,
  AlertTriangle,
  Crown,
  Search,
  MessageSquare,
  Activity,
  Layers,
  Gamepad2,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
// ULTRA-PROFESSIONAL 3D VECTOR ICONS (IconScout / Apple Design Style)
// ══════════════════════════════════════════════════════════════════════════════

export function SmartBoard3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="boardFrame" x1="4" y1="4" x2="44" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#374151" />
          <stop offset="1" stopColor="#111827" />
        </linearGradient>
        <linearGradient id="boardSurface" x1="8" y1="8" x2="40" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#065F46" />
          <stop offset="1" stopColor="#022C22" />
        </linearGradient>
        <linearGradient id="glowLine" x1="12" y1="14" x2="36" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
        <filter id="shadow3D" x="0" y="2" width="48" height="46" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>
      <g filter="url(#shadow3D)">
        <path d="M12 36L8 44M36 36L40 44" stroke="#4B5563" strokeWidth="3" strokeLinecap="round" />
        <rect x="4" y="6" width="40" height="28" rx="4" fill="url(#boardFrame)" stroke="#6B7280" strokeWidth="1" />
        <rect x="7" y="9" width="34" height="22" rx="2" fill="url(#boardSurface)" />
        <path d="M12 25L18 16L24 25Z" stroke="url(#glowLine)" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M26 16C28 14 32 14 34 16C36 18 32 20 30 22C29 23 29 24 29 25" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="29" cy="28" r="0.8" fill="#FDE047" />
        <circle cx="37" cy="12" r="2" fill="#D914C8" />
        <circle cx="37" cy="12" r="3" stroke="#D914C8" strokeWidth="0.8" opacity="0.6" />
        <rect x="16" y="33" width="16" height="2.5" rx="1.2" fill="#9CA3AF" />
      </g>
    </svg>
  );
}


export function Lessons3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bookCover1" x1="6" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="pagesGrad" x1="8" y1="14" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F3F4F6" />
        </linearGradient>
      </defs>
      <rect x="6" y="24" width="34" height="15" rx="3" fill="url(#bookCover1)" />
      <path d="M8 27H40V36H8C6.9 36 6 35.1 6 34V29C6 27.9 6.9 27 8 27Z" fill="url(#pagesGrad)" />
      <path d="M24 10C18 7 11 8 8 10V28C11 26 18 25 24 28C30 25 37 26 40 28V10C37 8 30 7 24 10Z" fill="url(#pagesGrad)" stroke="#E5E7EB" strokeWidth="1" />
      <path d="M24 10V28" stroke="#D1D5DB" strokeWidth="1.5" />
      <path d="M12 15H20M12 19H18M28 15H36M28 19H34" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 6V16L24 14.5L26 16V6H22Z" fill="#F59E0B" />
      <circle cx="38" cy="8" r="3" fill="#FBBF24" />
      <path d="M38 4V12M34 8H42" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}


export function Exams3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="clipboardWood" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="examPaper" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F9FAFB" />
        </linearGradient>
      </defs>
      <rect x="8" y="6" width="32" height="38" rx="4" fill="url(#clipboardWood)" />
      <rect x="11" y="10" width="26" height="32" rx="2" fill="url(#examPaper)" />
      <rect x="18" y="4" width="12" height="5" rx="2" fill="#4B5563" />
      <circle cx="24" cy="6.5" r="1.5" fill="#9CA3AF" />
      <line x1="15" y1="18" x2="30" y2="18" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
      <line x1="15" y1="24" x2="27" y2="24" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
      <line x1="15" y1="30" x2="24" y2="30" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 22L32 24L36 20" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 28L30 30L34 26" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="34" cy="36" r="7" fill="#EF4444" />
      <text x="34" y="39" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="sans-serif">A+</text>
    </svg>
  );
}


export function Agenda3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="calTop" x1="6" y1="6" x2="42" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="calBody" x1="6" y1="18" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F3F4F6" />
        </linearGradient>
      </defs>
      <rect x="7" y="9" width="34" height="34" rx="5" fill="#EDE9FE" />
      <rect x="6" y="8" width="36" height="34" rx="5" fill="url(#calBody)" stroke="#E5E7EB" strokeWidth="1" />
      <path d="M6 13C6 10.2 8.2 8 11 8H37C39.8 8 42 10.2 42 13V18H6V13Z" fill="url(#calTop)" />
      <rect x="12" y="5" width="3" height="6" rx="1.5" fill="#4B5563" />
      <rect x="23" y="5" width="3" height="6" rx="1.5" fill="#4B5563" />
      <rect x="33" y="5" width="3" height="6" rx="1.5" fill="#4B5563" />
      <rect x="10" y="22" width="6" height="5" rx="1.5" fill="#DDD6FE" />
      <rect x="18" y="22" width="6" height="5" rx="1.5" fill="#DDD6FE" />
      <rect x="26" y="22" width="6" height="5" rx="1.5" fill="#C4B5FD" />
      <rect x="34" y="22" width="4" height="5" rx="1.5" fill="#DDD6FE" />
      <rect x="10" y="29" width="6" height="5" rx="1.5" fill="#DDD6FE" />
      <rect x="18" y="29" width="6" height="5" rx="1.5" fill="#D914C8" />
      <rect x="26" y="29" width="6" height="5" rx="1.5" fill="#DDD6FE" />
      <g transform="translate(24, 24) rotate(45)">
        <rect x="0" y="0" width="4" height="14" rx="1" fill="#F59E0B" />
        <path d="M0 14L2 17L4 14Z" fill="#1F2937" />
      </g>
    </svg>
  );
}


export function Progress3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bar1" x1="8" y1="28" x2="16" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93C5FD" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="bar2" x1="18" y1="20" x2="26" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C084FC" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="bar3" x1="28" y1="12" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F472B6" />
          <stop offset="1" stopColor="#D914C8" />
        </linearGradient>
        <linearGradient id="arrowGrad" x1="6" y1="26" x2="42" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#34D399" />
        </linearGradient>
      </defs>
      <rect x="4" y="38" width="40" height="4" rx="2" fill="#E5E7EB" />
      <rect x="8" y="26" width="7" height="12" rx="2.5" fill="url(#bar1)" />
      <rect x="18" y="18" width="7" height="20" rx="2.5" fill="url(#bar2)" />
      <rect x="28" y="10" width="7" height="28" rx="2.5" fill="url(#bar3)" />
      <path d="M8 26L19 15L27 20L38 8" stroke="url(#arrowGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 8H38V14" stroke="url(#arrowGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="38" cy="8" r="2" fill="#10B981" />
    </svg>
  );
}


export function Library3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shelfWood" x1="4" y1="36" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B45309" />
          <stop offset="1" stopColor="#78350F" />
        </linearGradient>
      </defs>
      <rect x="4" y="36" width="40" height="5" rx="2" fill="url(#shelfWood)" />
      <rect x="8" y="14" width="6" height="22" rx="1.5" fill="#3B82F6" />
      <rect x="10" y="18" width="2" height="14" fill="#93C5FD" />
      <rect x="16" y="10" width="6" height="26" rx="1.5" fill="#10B981" />
      <rect x="18" y="14" width="2" height="18" fill="#A7F3D0" />
      <rect x="24" y="16" width="6" height="20" rx="1.5" fill="#8B5CF6" />
      <g transform="translate(32, 12) rotate(12)">
        <rect x="0" y="0" width="6" height="24" rx="1.5" fill="#EC4899" />
        <rect x="2" y="3" width="2" height="18" fill="#FBCFE8" />
      </g>
      <circle cx="22" cy="7" r="4" fill="#FBBF24" />
      <path d="M22 4V10M19 7H25" stroke="#FFF" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}


export function Games3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gamepadBody" x1="6" y1="12" x2="42" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#312E81" />
        </linearGradient>
      </defs>
      <path
        d="M14 14C8 14 5 19 5 26C5 33 9 38 14 36L19 32H29L34 36C39 38 43 33 43 26C43 19 40 14 34 14H14Z"
        fill="url(#gamepadBody)"
      />
      <rect x="11" y="21" width="8" height="3" rx="1" fill="#E0E7FF" />
      <rect x="13.5" y="18.5" width="3" height="8" rx="1" fill="#E0E7FF" />
      <circle cx="31" cy="22.5" r="2" fill="#10B981" />
      <circle cx="35" cy="19.5" r="2" fill="#F59E0B" />
      <circle cx="35" cy="25.5" r="2" fill="#EC4899" />
      <circle cx="39" cy="22.5" r="2" fill="#3B82F6" />
      <circle cx="24" cy="20" r="1.5" fill="#34D399" />
      <path d="M24 7L25 10L28 11L25 12L24 15L23 12L20 11L23 10Z" fill="#FDE047" />
    </svg>
  );
}

export const Notes3DIcon = Agenda3DIcon;
export const Growth3DIcon = Progress3DIcon;



// ══════════════════════════════════════════════════════════════════════════════
// DATA STRUCTURE FOR THE 7 STUDENT MODULES
// ══════════════════════════════════════════════════════════════════════════════

export interface TabModuleItem {
  id: string;
  tabLabel: string;
  IconComponent: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  desc: string;
  steps: {
    number: string;
    text: string;
  }[];
  demoUrl: string;
  statusBadge: string;
  accentColor: string;
}

export const STUDENT_TAB_MODULES: TabModuleItem[] = [
  {
    id: 'akilli-tahta',
    tabLabel: 'Akıllı Tahta',
    IconComponent: SmartBoard3DIcon,
    title: 'Gerçekten Akıllı Tahta',
    subtitle: 'Sınıftaki Eğitimi Eve Taşıyın',
    desc: 'Tahtaya yazılanların anında dijitalleşip öğrenci profiline kaydedilmesi ve kesintisiz okul-ev köprüsü.',
    steps: [
      { number: '1', text: 'Öğretmen tahtaya yazdığı an çizim ve notlar yapay zekayla taranır' },
      { number: '2', text: 'Öğrencinin ders profiline, tarih ve konu başlığıyla otomatik kaydedilir' },
      { number: '3', text: 'Evde akşam tekrarında hiçbir detay kaçmadan ders baştan izlenebilir' },
    ],
    demoUrl: 'edu.oxonom.com/akilli-tahta-senkronizasyon',
    statusBadge: '● Canlı Tahta Senkronu Aktif',
    accentColor: '#10B981',
  },
  {
    id: 'derslerim',
    tabLabel: 'Derslerim',
    IconComponent: Lessons3DIcon,
    title: 'Derslerim',
    subtitle: 'İnteraktif Tekrar ve Tam Öğrenme',
    desc: 'Geçmiş/güncel konular, evde interaktif testler ve akıllı öğrenme istatistikleri.',
    steps: [
      { number: '1', text: 'Okulda işlenen tüm geçmiş ve güncel müfredat konularına sınırsız erişim' },
      { number: '2', text: 'Konu sonu interaktif alıştırmalarla bilginin anında pekiştirilmesi' },
      { number: '3', text: 'Hangi konuda ne kadar ilerlediğinizi gösteren akıllı başarı çemberleri' },
    ],
    demoUrl: 'edu.oxonom.com/derslerim-tekrar',
    statusBadge: '● %98.5 Konu Tamamlama',
    accentColor: '#3B82F6',
  },
  {
    id: 'sinavlarim',
    tabLabel: 'Sınavlarım',
    IconComponent: Exams3DIcon,
    title: 'Sınavlarım',
    subtitle: 'Performans Analizi ve Hedef Takibi',
    desc: 'Tüm sınavların tek merkezden yönetimi, detaylı sonuç raporları ve eksik konu tespiti.',
    steps: [
      { number: '1', text: 'Geçmiş ve yaklaşan tüm sınavlar tek bir merkezi takvimde listelenir' },
      { number: '2', text: 'Doğru-yanlış-boş dökümü ve sınıf/okul başarı sıralaması anında görülür' },
      { number: '3', text: 'Eksik konular yapay zeka tarafından tespit edilip çalışma listesine eklenir' },
    ],
    demoUrl: 'edu.oxonom.com/sinav-performans-raporu',
    statusBadge: '● Sınıf 1.’si · Üstün Başarı',
    accentColor: '#EF4444',
  },
  {
    id: 'notlarim-ajanda',
    tabLabel: 'Notlarım & Ajanda',
    IconComponent: Agenda3DIcon,
    title: 'Notlarım & Ajanda',
    subtitle: 'Düzenli Çalışma, Planlı İlerleme',
    desc: 'Akıllı kategorize notlar, tahta notu arşivi ve ajanda takvim planlaması.',
    steps: [
      { number: '1', text: 'Ders çalışırken alınan notlar renkli etiketlerle kategorize edilir' },
      { number: '2', text: 'Tahta kayıtlarından seçilen önemli formüller ve özetler yapıştırılır' },
      { number: '3', text: 'Haftalık ders programı ve sınav ajandası ile zaman verimli yönetilir' },
    ],
    demoUrl: 'edu.oxonom.com/ajanda-ve-notlar',
    statusBadge: '● Haftalık Plan Aktif',
    accentColor: '#8B5CF6',
  },
  {
    id: 'gelisimim',
    tabLabel: 'Gelişimim',
    IconComponent: Progress3DIcon,
    title: 'Gelişimim',
    subtitle: 'Canlı ve Grafiksel Performans Takibi',
    desc: 'Akademik röntgen, sınav/sözlü/ders başarı grafik ve istatistik raporları.',
    steps: [
      { number: '1', text: 'Sınav, sözlü ve ödev notlarının grafiksel akademik röntgeni çıkarılır' },
      { number: '2', text: 'Ders bazlı net artışı ve haftalık çalışma süresi karşılaştırmalı izlenir' },
      { number: '3', text: 'Öğrencinin güçlü yanları pekiştirilir, zayıf alanları için rehberlik verilir' },
    ],
    demoUrl: 'edu.oxonom.com/gelisimim-ve-karne',
    statusBadge: '● Canlı Akademik Durum',
    accentColor: '#D914C8',
  },
  {
    id: 'kitaplik',
    tabLabel: 'Kitaplık',
    IconComponent: Library3DIcon,
    title: 'Kitaplık',
    subtitle: 'Yaşa ve Seviyeye Özel Dijital Kütüphane',
    desc: 'Yaşa ve seviyeye uygun e-kitaplar, altını çizme ve kişisel çalışma notları oluşturma.',
    steps: [
      { number: '1', text: 'Öğrencinin yaşına ve sınıf seviyesine göre pedagojik onaylı e-kitaplar' },
      { number: '2', text: 'Renkli fosforlu kalemle altını çizme ve sayfa içi not alma araçları' },
      { number: '3', text: 'Okuma hızı ve bitirilen kitap sayılarıyla okuma alışkanlığı motivasyonu' },
    ],
    demoUrl: 'edu.oxonom.com/dijital-kutuphane',
    statusBadge: '● 42 Pedagojik E-Kitap',
    accentColor: '#B45309',
  },
  {
    id: 'oyunlar',
    tabLabel: 'Oyunlar',
    IconComponent: Games3DIcon,
    title: 'Oyunlar',
    subtitle: 'Eğlenerek Öğrenmenin En Keyifli Hali',
    desc: 'Sıkıcı ezberler yerine yaş grubuna özel eğitici oyunlar ve bilişsel beceri gelişimi.',
    steps: [
      { number: '1', text: 'Sınıf seviyesine uyarlanmış matematik, hafıza ve kelime oyunları' },
      { number: '2', text: 'Çocuklar oyun oynarken farkında olmadan analitik düşünme becerisi kazanır' },
      { number: '3', text: 'Puanlar, seviye atlama rozetleri ve eğlenceli görevlerle tam motivasyon' },
    ],
    demoUrl: 'edu.oxonom.com/egitici-oyunlar',
    statusBadge: '● Oyunla Öğrenme Modu',
    accentColor: '#F43F5E',
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// DEMO 1: AKILLI TAHTA
// ══════════════════════════════════════════════════════════════════════════════
function SmartBoardDemo() {
  const [activeBoardTool, setActiveBoardTool] = useState<'drawing' | 'notes' | 'summary'>('drawing');
  return (
    <div className="p-4 sm:p-5 bg-[#0E1B17] text-white rounded-b-2xl select-none">
      <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-300">
            Ders: Matematik · Konu: Üçgende İç Açılar
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
          Sayfa 2 / 4
        </span>
      </div>

      <div className="py-4">
        {activeBoardTool === 'drawing' && (
          <div className="bg-[#08231C]/90 rounded-xl p-4 border border-emerald-800/40 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-emerald-200 font-mono">Teorem: A + B + C = 180°</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold">
                Dijitalleştirildi
              </span>
            </div>
            <div className="flex items-center justify-center my-2">
              <svg width="200" height="95" viewBox="0 0 220 110">
                <polygon points="110,15 25,95 195,95" fill="none" stroke="#34D399" strokeWidth="2.5" />
                <text x="110" y="38" fill="#FDE047" fontSize="12" fontWeight="bold" textAnchor="middle">70°</text>
                <text x="50" y="88" fill="#60A5FA" fontSize="12" fontWeight="bold">60°</text>
                <text x="155" y="88" fill="#F472B6" fontSize="12" fontWeight="bold">50°</text>
                <circle cx="110" cy="15" r="3" fill="#34D399" />
                <circle cx="25" cy="95" r="3" fill="#34D399" />
                <circle cx="195" cy="95" r="3" fill="#34D399" />
                <text x="110" y="10" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">A</text>
                <text x="12" y="100" fill="#FFF" fontSize="11" fontWeight="bold">B</text>
                <text x="202" y="100" fill="#FFF" fontSize="11" fontWeight="bold">C</text>
              </svg>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/30 text-xs text-emerald-100 flex items-center justify-between">
              <span>📌 <strong>Öğretmen Notu:</strong> "Yarınki sınavda soru 3 bu kuraldan gelecek!"</span>
              <span className="text-[10px] text-emerald-400 font-bold shrink-0 ml-2">Önemli</span>
            </div>
          </div>
        )}

        {activeBoardTool === 'notes' && (
          <div className="bg-[#08231C]/90 rounded-xl p-4 border border-emerald-800/40 text-xs space-y-2">
            <div className="font-bold text-emerald-300">Öğrenci Akıllı Not Defteri</div>
            <p className="text-gray-300 leading-relaxed">
              • Üçgenin iç açıları toplamı her zaman <strong>180 derece</strong>dir.<br />
              • Bir dış açı, komşu olmayan iki iç açının toplamına eşittir.<br />
              • Eşkenar üçgenin her bir iç açısı 60 derecedir.
            </p>
          </div>
        )}

        {activeBoardTool === 'summary' && (
          <div className="bg-[#08231C]/90 rounded-xl p-4 border border-emerald-800/40 text-center py-6">
            <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2 animate-bounce" />
            <h5 className="font-bold text-white text-sm">Ders Özeti Çıkarıldı</h5>
            <p className="text-xs text-emerald-200/90 max-w-sm mx-auto mt-1">
              Tahtadaki 14 satır not ve formüller 3 temel çalışma kartına dönüştürüldü.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-emerald-900/60 text-xs">
        <div className="flex items-center gap-1.5 bg-emerald-950/80 p-1 rounded-lg border border-emerald-800/40">
          <button
            onClick={() => setActiveBoardTool('drawing')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
              activeBoardTool === 'drawing' ? 'bg-emerald-500 text-black' : 'text-emerald-300'
            }`}
          >
            Çizim
          </button>
          <button
            onClick={() => setActiveBoardTool('notes')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
              activeBoardTool === 'notes' ? 'bg-emerald-500 text-black' : 'text-emerald-300'
            }`}
          >
            Notlar
          </button>
          <button
            onClick={() => setActiveBoardTool('summary')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
              activeBoardTool === 'summary' ? 'bg-emerald-500 text-black' : 'text-emerald-300'
            }`}
          >
            Özet
          </button>
        </div>
        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
          <Check className="w-3.5 h-3.5" /> Bulutta Senkron
        </span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DEMO 2: DERSLERİM
// ══════════════════════════════════════════════════════════════════════════════
function LessonsDemo() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  return (
    <div className="p-4 sm:p-5 bg-white rounded-b-2xl select-none">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-xs font-bold text-gray-800">Derslerim · 4. Sınıf Matematik</span>
        </div>
        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
          İlerleme: %88
        </span>
      </div>

      <div className="py-3">
        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
            Hızlı Pekiştirme Sorusu
          </span>
          <h5 className="text-xs sm:text-sm font-bold text-gray-900 mb-3">
            18'den başlayıp dörder ileriye doğru ritmik saydığımızda 3. sırada hangi sayıyı söyleriz?
          </h5>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'A) 22', correct: false },
              { label: 'B) 26', correct: true },
              { label: 'C) 30', correct: false },
              { label: 'D) 32', correct: false },
            ].map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              let btnClass = 'bg-white border-gray-200 text-gray-700 hover:border-blue-300';
              if (isSelected) {
                btnClass = opt.correct ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white';
              }
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedAnswer(idx);
                    setIsAnswered(true);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${btnClass}`}
                >
                  <span>{opt.label}</span>
                  {isSelected && opt.correct && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-3 p-2 rounded-xl bg-white border border-blue-200 text-xs text-blue-900 font-semibold flex items-center justify-between">
              <span>{selectedAnswer === 1 ? '🎉 Harika! 18 -> 22 -> 26 doğru!' : '💡 Tekrar dene: 18 + 4 = 22, 22 + 4 = 26.'}</span>
              <button
                onClick={() => {
                  setSelectedAnswer(null);
                  setIsAnswered(false);
                }}
                className="text-[11px] text-blue-600 underline font-bold"
              >
                Sıfırla
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center text-xs">
        <div className="p-2 rounded-xl bg-gray-50 font-bold text-blue-600">Matematik %92</div>
        <div className="p-2 rounded-xl bg-gray-50 font-bold text-emerald-600">Fen Bilgisi %85</div>
        <div className="p-2 rounded-xl bg-gray-50 font-bold text-purple-600">Türkçe %96</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DEMO 3: SINAVLARIM
// ══════════════════════════════════════════════════════════════════════════════
function ExamsDemo() {
  return (
    <div className="p-4 sm:p-5 bg-white rounded-b-2xl select-none">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-xs font-bold text-gray-800">Sınav Karnesi & Deneme Analizi</span>
        </div>
        <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
          Şube 1.’si 🏆
        </span>
      </div>

      <div className="py-3">
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-center">
            <span className="text-[10px] font-bold text-rose-600">Son Sınav</span>
            <div className="text-lg font-black text-rose-700">98.5</div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-center">
            <span className="text-[10px] font-bold text-purple-600">Toplam Net</span>
            <div className="text-lg font-black text-purple-700">48.75</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <span className="text-[10px] font-bold text-emerald-600">Başarı</span>
            <div className="text-lg font-black text-emerald-700">%97.5</div>
          </div>
        </div>

        <div className="space-y-1.5 bg-gray-50 p-2.5 rounded-xl text-xs">
          <div className="flex justify-between font-bold text-gray-700">
            <span>Matematik: Doğal Sayılar</span>
            <span className="text-emerald-600">20/20 (%100)</span>
          </div>
          <div className="flex justify-between font-bold text-gray-700">
            <span>Fen Bilimleri: Kuvvet</span>
            <span className="text-blue-600">14/15 (%93)</span>
          </div>
          <div className="flex justify-between font-bold text-gray-700">
            <span>Türkçe: Ana Fikir</span>
            <span className="text-purple-600">15/15 (%100)</span>
          </div>
        </div>
      </div>

      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between text-amber-900 font-medium">
        <span>⏰ <strong>Sıradaki:</strong> İl Geneli Matematik Denemesi · 3 Gün Kaldı</span>
        <span className="text-[10px] font-bold text-amber-700 underline">Hazırlık Çöz</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DEMO 4: NOTLARIM & AJANDA
// ══════════════════════════════════════════════════════════════════════════════
function AgendaDemo() {
  const [selectedDay, setSelectedDay] = useState('Sal');
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum'];

  const schedule: Record<string, string[]> = {
    Pzt: ['Matematik (101)', 'Türkçe (204)', 'Fen Bilimleri (Lab)', 'İngilizce'],
    Sal: ['Robotik Kodlama', 'Matematik', 'Hayat Bilgisi', 'Görsel Sanatlar'],
    Çar: ['Fen Bilimleri', 'Türkçe', 'Sosyal Bilgiler', 'Satranç'],
    Per: ['Türkçe', 'İngilizce', 'Matematik', 'Drama'],
    Cum: ['Genel Tekrar', 'Deneme Sınavı', 'Haftalık Değerlendirme', 'Oyun Saati'],
  };

  return (
    <div className="p-4 sm:p-5 bg-white rounded-b-2xl select-none">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span className="text-xs font-bold text-gray-800">Haftalık Ders ve Çalışma Ajandası</span>
        </div>
        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
          Ekim 2026
        </span>
      </div>

      <div className="py-3">
        <div className="flex items-center gap-1.5 mb-3">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedDay === day
                  ? 'bg-[#4B075F] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {schedule[selectedDay].map((lesson, idx) => (
            <div key={idx} className="p-2 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[#4B075F] text-white text-[9px] font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <span className="font-bold text-gray-800 truncate">{lesson}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between text-amber-900">
        <span>📌 <strong>Not:</strong> Cuma günkü proje ödevi için 2 konu özeti tamamlandı.</span>
        <span className="px-2 py-0.5 rounded bg-amber-200 text-[10px] font-bold">Aktif</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DEMO 5: GELİŞİMİM (TAM EKLENEN EKRAN — ANIMASYONLU VE İNTERAKTİF!)
// ══════════════════════════════════════════════════════════════════════════════
function ProgressDemo() {
  const [activeSubTab, setActiveSubTab] = useState<'dersler' | 'analiz' | 'gorusler'>('dersler');

  const courseList = [
    { name: 'Türkçe', teacher: 'Bahar ÇETİN', s1: 98, s2: 100, sozlu: 100, ort: 99.2, status: 'Geçti', isDanger: false },
    { name: 'Matematik', teacher: 'Bahar ÇETİN', s1: 96, s2: 100, sozlu: 98, ort: 98.0, status: 'Geçti', isDanger: false },
    { name: 'Hayat Bilgisi', teacher: 'Bahar ÇETİN', s1: 98, s2: 98, sozlu: 100, ort: 98.4, status: 'Geçti', isDanger: false },
    { name: 'Yabancı Dil (İngilizce)', teacher: 'Aylin DERİN', s1: 95, s2: 98, sozlu: 100, ort: 97.2, status: 'Geçti', isDanger: false },
    { name: 'Görsel Sanatlar', teacher: 'Melisa ERSOY', s1: 95, s2: 98, sozlu: 100, ort: 97.2, status: 'Geçti', isDanger: false },
    { name: 'Müzik', teacher: 'Bahar ÇETİN', s1: 96, s2: 98, sozlu: 100, ort: 97.6, status: 'Geçti', isDanger: false },
    { name: 'Beden Eğitimi ve Oyun', teacher: 'Volkan ŞAHİNER', s1: 100, s2: 100, sozlu: 100, ort: 100.0, status: 'Geçti', isDanger: false },
    { name: 'Türk Dili ve Edebiyatı', teacher: 'Ebru TEKNECİ', s1: '-', s2: 1, sozlu: '-', ort: 1.0, status: 'Kritik', isDanger: true },
  ];

  return (
    <div className="p-3 sm:p-5 bg-[#FAF8FB] text-[#241329] rounded-b-2xl select-none space-y-4">
      {/* ─── TOP HEADER: Student Profile & Badge ─── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 rounded-2xl bg-white border border-[#E8DFEB] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FCE8FA] text-[#4B075F] text-[10px] font-black uppercase tracking-wider mb-1">
            <TrendingUp className="w-3 h-3 text-[#D914C8]" />
            <span>Akademik Gelişim & Başarı Karnesi</span>
          </div>
          <h4 className="text-base sm:text-lg font-black text-[#241329] tracking-tight">
            Gelişimim ve Akademik Durumum
          </h4>
          <p className="text-[11px] text-[#716779] font-medium">
            Ders notları, gelişim analizleri ve öğretmen değerlendirmelerinin güncel özeti.
          </p>
        </div>

        {/* Student Avatar Pill */}
        <div className="flex items-center gap-2.5 bg-[#FCF9FD] border border-[#E8DFEB] px-3 py-1.5 rounded-2xl shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4B075F] to-[#D914C8] text-white font-black text-xs flex items-center justify-center shadow-xs">
            AY
          </div>
          <div className="text-left">
            <div className="text-xs font-black text-[#241329]">Ali Yağız DEMİREL</div>
            <div className="text-[10px] font-medium text-[#716779]">1/A · No: 101</div>
          </div>
        </div>
      </motion.div>

      {/* ─── 4 METRIC STAT CARDS (ANIMATED STAGGER) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: 'NOT ORTALAMASI', val: '86.1', sub: '/100', badge: '🌱 Takdir Seviyesi', badgeColor: 'text-emerald-700' },
          { label: 'SINIF SIRALAMASI', val: '1. Sıra', sub: '', badge: '1/A Sınıfı', badgeColor: 'text-[#4B075F]' },
          { label: 'DERS KATILIMI', val: '%100', sub: '', badge: '✓ Tam Devam', badgeColor: 'text-emerald-700' },
          { label: 'ÖDEV BAŞARISI', val: '%40', sub: '', badge: '📄 2/5 Teslim · 99 Ort', badgeColor: 'text-purple-700' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.3 }}
            className="p-3 rounded-2xl bg-white border border-[#E8DFEB] shadow-xs hover:border-[#8D49A6]/40 transition-all"
          >
            <span className="text-[9px] font-black tracking-wider text-[#716779] uppercase block mb-1">
              {stat.label}
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#241329] tracking-tight leading-none mb-1">
              {stat.val} <span className="text-xs text-gray-400 font-normal">{stat.sub}</span>
            </div>
            <span className={`text-[10px] font-bold ${stat.badgeColor}`}>
              {stat.badge}
            </span>
          </motion.div>
        ))}
      </div>

      {/* ─── SUB-TABS (Dersler & Notlar / Gelişim & Analiz / Öğretmen Görüşleri) ─── */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('dersler')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'dersler'
              ? 'bg-[#241329] text-white shadow-xs'
              : 'bg-white text-[#716779] border border-[#E8DFEB] hover:bg-[#FCF9FD]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Dersler & Notlar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('analiz')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'analiz'
              ? 'bg-[#241329] text-white shadow-xs'
              : 'bg-white text-[#716779] border border-[#E8DFEB] hover:bg-[#FCF9FD]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-[#D914C8]" />
          <span>Gelişim & Analiz</span>
          <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">
            1
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('gorusler')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'gorusler'
              ? 'bg-[#241329] text-white shadow-xs'
              : 'bg-white text-[#716779] border border-[#E8DFEB] hover:bg-[#FCF9FD]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Öğretmen Görüşleri</span>
          <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-black flex items-center justify-center">
            3
          </span>
        </button>
      </div>

      {/* ─── TAB CONTENT WITH ANIMATIONS ─── */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'dersler' && (
          <motion.div
            key="dersler"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl bg-white border border-[#E8DFEB] shadow-xs p-3.5 sm:p-4 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFEB] mb-3">
              <div>
                <h5 className="text-xs sm:text-sm font-black text-[#241329] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#4B075F]" />
                  <span>Ders Başarı ve Sınav Notları (1/A)</span>
                </h5>
                <p className="text-[10px] text-[#716779]">
                  1. Yazılı, 2. Yazılı, sözlü ve performans değerlendirmeleri
                </p>
              </div>
              <span className="text-xs font-black text-[#4B075F] bg-[#FCE8FA] px-2.5 py-0.5 rounded-full">
                Genel Ort: 86.1
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-[#716779] border-b border-gray-100 text-[10px] uppercase font-bold">
                    <th className="py-2 pr-3">Ders Adı</th>
                    <th className="py-2 px-2 hidden sm:table-cell">Öğretmen</th>
                    <th className="py-2 px-2 text-center">1. Sınav</th>
                    <th className="py-2 px-2 text-center">2. Sınav</th>
                    <th className="py-2 px-2 text-center">Sözlü / Perf.</th>
                    <th className="py-2 px-2 text-center">Dönem Ort.</th>
                    <th className="py-2 pl-2 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courseList.map((course, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.25 }}
                      className="hover:bg-[#FCF9FD] transition-colors"
                    >
                      <td className="py-2.5 pr-3 font-bold text-[#241329] whitespace-nowrap">
                        {course.name}
                      </td>
                      <td className="py-2.5 px-2 text-[#716779] whitespace-nowrap hidden sm:table-cell">
                        {course.teacher}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-gray-800">
                        {course.s1}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-gray-800">
                        {course.s2}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-purple-700">
                        {course.sozlu}
                      </td>
                      <td
                        className={`py-2.5 px-2 text-center font-black ${
                          course.isDanger ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {course.ort.toFixed(1)}
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            course.isDanger
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {course.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'analiz' && (
          <motion.div
            key="analiz"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {/* Progress Bars Card (Matching Image 3!) */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8DFEB] shadow-xs">
              <h5 className="text-xs font-black text-[#241329] mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Ders Başarı Göstergeleri</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { name: 'Türkçe', ort: '99.2 Ort', pct: 99.2, isDanger: false },
                  { name: 'Matematik', ort: '98 Ort', pct: 98, isDanger: false },
                  { name: 'Hayat Bilgisi', ort: '98.4 Ort', pct: 98.4, isDanger: false },
                  { name: 'Yabancı Dil (İngilizce)', ort: '97.2 Ort', pct: 97.2, isDanger: false },
                  { name: 'Görsel Sanatlar', ort: '97.2 Ort', pct: 97.2, isDanger: false },
                  { name: 'Müzik', ort: '97.6 Ort', pct: 97.6, isDanger: false },
                  { name: 'Beden Eğitimi ve Oyun', ort: '100 Ort', pct: 100, isDanger: false },
                  { name: 'Türk Dili ve Edebiyatı', ort: '1 Ort', pct: 1, isDanger: true },
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-gray-800 text-[11px]">{item.name}</span>
                      <span
                        className={`font-black text-[11px] ${
                          item.isDanger ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {item.ort}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className={`h-full rounded-full ${
                          item.isDanger ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom 2 metric cards (Devam & Ödev) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFEB] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Devam ve Katılım Durumu
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    %100 Katılım
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <span className="text-[9px] text-gray-400 block">Özürsüz</span>
                    <strong className="font-black text-gray-800">0 Gün</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">
                    <span className="text-[9px] text-gray-400 block">İzinli</span>
                    <strong className="font-black text-gray-800">0 Gün</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <span className="text-[9px] text-emerald-700 block">Toplam</span>
                    <strong className="font-black text-emerald-700">0 Gün</strong>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFEB] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-600" /> Ödev Teslim İstatistikleri
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                    %40 Teslim Oranı
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <span className="text-[9px] text-gray-400 block">Toplam</span>
                    <strong className="font-black text-gray-800">5 Ödev</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <span className="text-[9px] text-emerald-700 block">Teslim Edilen</span>
                    <strong className="font-black text-emerald-700">2 Ödev</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50">
                    <span className="text-[9px] text-amber-700 block">Bekleyen</span>
                    <strong className="font-black text-amber-700">3 Ödev</strong>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'gorusler' && (
          <motion.div
            key="gorusler"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-2.5"
          >
            {[
              {
                teacher: 'Bahar ÇETİN',
                role: 'Sınıf Öğretmeni',
                note: 'Ali Yağız ders içi aktifliği, ritmik sayma ve okuma çalışmalarındaki hızıyla sınıf birinciliğini hak ediyor.',
                star: '5.0',
              },
              {
                teacher: 'Aylin DERİN',
                role: 'Yabancı Dil Öğretmeni',
                note: 'Kelime haznesi ve telaffuz çalışmaları çok başarılı. İnteraktif hikaye çalışmalarına tam katılım gösteriyor.',
                star: '5.0',
              },
              {
                teacher: 'Volkan ŞAHİNER',
                role: 'Beden Eğitimi & Oyun',
                note: 'Takım sporlarında kurallara tam uyumlu, arkadaşlarına karşı saygılı ve yardımsever.',
                star: '5.0',
              },
            ].map((g, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-white border border-[#E8DFEB] shadow-xs text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FCE8FA] text-[#4B075F] text-[10px] font-black flex items-center justify-center">
                      {g.teacher[0]}
                    </span>
                    <div>
                      <strong className="font-bold text-[#241329]">{g.teacher}</strong>
                      <span className="text-[10px] text-[#716779] ml-1.5">({g.role})</span>
                    </div>
                  </div>
                  <span className="text-amber-500 font-bold text-[11px] flex items-center gap-0.5">
                    ★ {g.star}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed font-medium pl-8">{g.note}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DEMO 6: KİTAPLIK
// ══════════════════════════════════════════════════════════════════════════════
function LibraryDemo() {
  const [highlighted, setHighlighted] = useState(false);

  return (
    <div className="p-4 sm:p-5 bg-white rounded-b-2xl select-none">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
          <span className="text-xs font-bold text-gray-800">Dijital Kütüphane & E-Okuyucu</span>
        </div>
        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
          Pedagojik Onaylı · 4. Sınıf
        </span>
      </div>

      <div className="py-3">
        <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 shadow-xs relative">
          <div className="flex items-center justify-between mb-3 text-xs border-b border-amber-200/50 pb-2">
            <span className="font-bold text-amber-900">Kitap: Küçük Bilim İnsanının Maceraları (Sayfa 24)</span>
            <button
              onClick={() => setHighlighted(!highlighted)}
              className="px-2.5 py-1 rounded-lg bg-yellow-200 hover:bg-yellow-300 text-amber-900 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Highlighter className="w-3 h-3 text-amber-800" />
              <span>{highlighted ? 'Vurguyu Kaldır' : 'Fosforlu Kalemle Çiz'}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-serif">
            "Denizlerin derinliklerindeki mercan resifleri, sadece su altı canlıları için değil, gezegenimizin
            oksijen dengesi için de hayati öneme sahiptir.{' '}
            <span
              className={`transition-all duration-300 ${
                highlighted ? 'bg-yellow-300/80 px-1 py-0.5 rounded font-bold' : ''
              }`}
            >
              Her bir mercan kolonisi, binlerce küçük organizmanın yüzyıllar süren uyumunun bir kanıtıdır.
            </span>{' '}
            Bunu öğrenen Ali, doğanın bu mucizesini defterine heyecanla çizmeye başladı."
          </p>

          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>Okuma İlerlemesi: %42</span>
            <span>Kalan Süre: ~8 dk</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
          <span className="text-gray-600 font-medium">Bu Ay Okunan:</span>
          <span className="font-bold text-amber-700">4 Kitap (186 Sayfa)</span>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
          <span className="text-gray-600 font-medium">Alınan Notlar:</span>
          <span className="font-bold text-purple-700">12 Akıllı Kart</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DEMO 7: OYUNLAR (TAM EKLENEN EKRAN — BİREBİR TASARIM & KART ANİMASYONLARI!)
// ══════════════════════════════════════════════════════════════════════════════
function GamesDemo() {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [playToast, setPlayToast] = useState<string | null>(null);

  const categories = [
    { id: 'Tümü', label: 'Tümü', isCrown: true },
    { id: 'Matematik', label: 'Matematik' },
    { id: 'Fen Bilimleri', label: 'Fen Bilimleri' },
    { id: 'Türkçe', label: 'Türkçe' },
    { id: 'Yabancı Dil', label: 'Yabancı Dil' },
    { id: 'Bilişim & Kodlama', label: 'Bilişim & Kodlama' },
    { id: 'Sosyal Bilgiler', label: 'Sosyal Bilgiler' },
    { id: 'Zeka & Mantık', label: 'Zeka & Mantık' },
  ];

  const trendGames = [
    {
      rank: '#1',
      title: 'Sayı Kaşifleri: Kayıp Kristaller',
      category: 'Matematik',
      rating: '4.98',
      img: '/games/card-kale.png',
    },
    {
      rank: '#2',
      title: '2048: Sayı & Mantık Bulmacası',
      category: 'Zeka & Mantık',
      rating: '4.95',
      img: '/games/2048-sayi-mantik-bulmacasi.png',
    },
    {
      rank: '#3',
      title: 'Hafıza Kartları: Çiftini Bul',
      category: 'Zeka & Mantık',
      rating: '4.92',
      img: '/games/hafiza-kartlari-ciftini-bul.png',
    },
  ];

  const allGames = [
    {
      id: 'space',
      title: 'Space Adventure',
      subjectBadge: 'MATEMATİK',
      statusBadge: 'YENİ & ÖNE ÇIKAN',
      img: '/games/card-space-adventure.png',
      rating: '4.96',
    },
    {
      id: '2048',
      title: 'Sayı & Mantık Bulmacası',
      subjectBadge: 'ZEKA & MANTIK',
      statusBadge: 'POPÜLER & ZEKA',
      img: '/games/card-2048.png',
      rating: '4.95',
    },
    {
      id: 'kale',
      title: 'Matematik Krallığı',
      subjectBadge: 'MATEMATİK',
      statusBadge: 'EDİTÖRÜN SEÇİMİ',
      img: '/games/card-kale.png',
      rating: '4.98',
    },
    {
      id: 'hafiza',
      title: 'Hafıza Kartları & Çiftini Bul',
      subjectBadge: 'ZEKA & MANTIK',
      statusBadge: 'ÇOK SEVİLEN',
      img: '/games/card-hafiza.png',
      rating: '4.92',
    },
  ];

  const handlePlayClick = (gameTitle: string) => {
    setPlayToast(`🎮 ${gameTitle} başlatılıyor... İyi eğlenceler!`);
    setTimeout(() => setPlayToast(null), 3000);
  };

  return (
    <div className="p-3 sm:p-5 bg-[#FAF8FB] text-[#241329] rounded-b-2xl select-none space-y-4">
      {/* ─── 1. TOP FEATURED GAME HERO BANNER (Matching Image 1!) ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl sm:rounded-3xl overflow-hidden relative shadow-lg border border-[#E8DFEB] bg-[#1A0A2A]"
      >
        <img
          src="/games/hafiza-banner.png"
          alt="Hafıza Kartları: Çiftini Bul"
          className="w-full h-auto block max-h-[260px] sm:max-h-[300px] object-cover"
        />

        {/* Interactive Action Overlay on bottom-left for direct clicking */}
        <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={() => handlePlayClick('Hafıza Kartları: Çiftini Bul')}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:from-[#E026D0] hover:to-[#A055BB] text-white text-xs sm:text-sm font-black shadow-lg flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Hemen Oyna</span>
          </button>
          <button
            type="button"
            onClick={() => handlePlayClick('Hafıza Kartları Detayları')}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
          >
            Detayları İncele
          </button>
        </div>

        {/* Carousel Dots on Bottom Right */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D914C8]" />
          <span className="w-2 h-2 rounded-full bg-white/40" />
          <span className="w-2 h-2 rounded-full bg-white/40" />
        </div>
      </motion.div>

      {/* ─── 2. CATEGORY FILTER PILLS ─── */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white shadow-xs'
                  : 'bg-white text-[#716779] border border-[#E8DFEB] hover:bg-[#FCF9FD]'
              }`}
            >
              {cat.isCrown && <Crown className="w-3 h-3 inline-block mr-1 text-yellow-300 fill-current" />}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── 3. TREND OLANLAR SECTION (3 HORIZONTAL CARDS) ─── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-xs sm:text-sm font-black text-[#241329] flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#D914C8]" />
            <span>Trend Olanlar</span>
          </h5>
          <span className="text-[10px] text-[#716779] font-medium">Bu hafta en çok oynananlar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {trendGames.map((game, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
              className="p-2.5 rounded-2xl bg-white border border-[#E8DFEB] shadow-xs hover:border-[#8D49A6]/40 hover:shadow-md transition-all flex items-center justify-between gap-2.5 group"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="text-xs font-black text-gray-400 font-mono w-4 shrink-0">
                  {game.rank}
                </span>
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 group-hover:scale-105 transition-transform">
                  <img src={game.img} alt={game.title} className="w-full h-full object-cover" />
                </div>
                <div className="overflow-hidden">
                  <h6 className="text-[11px] font-black text-[#241329] truncate leading-tight group-hover:text-[#4B075F] transition-colors">
                    {game.title}
                  </h6>
                  <p className="text-[10px] text-[#716779] font-medium mt-0.5">
                    {game.category} · <span className="text-amber-500 font-bold">★ {game.rating}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handlePlayClick(game.title)}
                className="px-3 py-1 rounded-xl bg-purple-50 hover:bg-[#4B075F] text-[#4B075F] hover:text-white text-[11px] font-black transition-colors shrink-0 cursor-pointer"
              >
                Oyna
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── 4. TÜM EĞİTİCİ OYUNLAR GRID (4+ RICH CARDS) ─── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h5 className="text-xs sm:text-sm font-black text-[#241329] flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-[#8D49A6]" />
            <span>Tüm Eğitici Oyunlar (7 Oyun)</span>
          </h5>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {allGames.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.92, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.06, duration: 0.3 }}
              onClick={() => handlePlayClick(game.title)}
              className="rounded-2xl overflow-hidden bg-white border border-[#E8DFEB] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative aspect-video sm:aspect-square overflow-hidden bg-slate-900">
                <img
                  src={game.img}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Badges Overlay */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white border border-white/20">
                    {game.subjectBadge}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white shadow-xs">
                    {game.statusBadge}
                  </span>
                </div>

                {/* Rating on bottom right */}
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-bold text-amber-400">
                  ★ {game.rating}
                </span>
              </div>

              <div className="p-2 sm:p-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-[#241329] group-hover:text-[#4B075F] truncate transition-colors">
                  {game.title}
                </span>
                <span className="w-5 h-5 rounded-full bg-purple-50 text-[#4B075F] group-hover:bg-[#4B075F] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <Play className="w-2.5 h-2.5 fill-current" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Play Toast Alert */}
      {playToast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-2.5 rounded-xl bg-gradient-to-r from-[#4B075F] to-[#D914C8] text-white text-xs font-bold text-center shadow-lg animate-bounce"
        >
          {playToast}
        </motion.div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function StudentInteractiveTabs() {
  const [activeTabId, setActiveTabId] = useState<string>(STUDENT_TAB_MODULES[0].id);

  const activeModule =
    STUDENT_TAB_MODULES.find((m) => m.id === activeTabId) || STUDENT_TAB_MODULES[0];

  const renderDemoScreen = () => {
    switch (activeModule.id) {
      case 'akilli-tahta':
        return <SmartBoardDemo />;
      case 'derslerim':
        return <LessonsDemo />;
      case 'sinavlarim':
        return <ExamsDemo />;
      case 'notlarim-ajanda':
        return <AgendaDemo />;
      case 'gelisimim':
        return <ProgressDemo />;
      case 'kitaplik':
        return <LibraryDemo />;
      case 'oyunlar':
        return <GamesDemo />;
      default:
        return <SmartBoardDemo />;
    }
  };

  return (
    <div className="w-full">
      {/* ═══ 1. HORIZONTAL 3D ICON TAB BAR (Styled identically to reference image!) ═══ */}
      <div className="mb-8">
        <div className="bg-[#F8F6FA] p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border border-[#E8DFEB] shadow-xs">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1">
            {STUDENT_TAB_MODULES.map((mod) => {
              const isActive = mod.id === activeTabId;
              const IconComp = mod.IconComponent;

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveTabId(mod.id)}
                  className={`group relative flex-1 min-w-[105px] sm:min-w-[125px] py-3 px-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white shadow-[0_6px_20px_rgba(75,7,95,0.08)] ring-1 ring-black/5'
                      : 'hover:bg-white/60 text-[#716779] opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Icon */}
                  <div className="mb-2 transition-transform duration-200 group-hover:scale-105">
                    <IconComp className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-xs sm:text-sm font-bold tracking-tight text-center leading-tight transition-colors ${
                      isActive ? 'text-[#241329]' : 'text-[#716779] group-hover:text-[#4B075F]'
                    }`}
                  >
                    {mod.tabLabel}
                  </span>

                  {/* Active Blue/Brand Underline Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-1 w-8 h-1 rounded-full bg-[#4B075F]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ 2. TWO-COLUMN INTERACTIVE SHOWCASE CARD ═══ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeModule.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl bg-white border border-[#E8DFEB] shadow-[0_20px_60px_-15px_rgba(75,7,95,0.08)] overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 p-5 sm:p-7 lg:p-9">
            {/* ═══ LEFT COLUMN: Feature Information & 3 Steps ═══ */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Title */}
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#241329] tracking-tight leading-tight mb-2">
                  {activeModule.title}
                </h3>

                {/* Subtitle / Punchline */}
                <p className="text-sm sm:text-base font-bold text-[#8D49A6] mb-3">
                  {activeModule.subtitle}
                </p>

                {/* Full Description */}
                <p className="text-xs sm:text-sm text-[#716779] leading-relaxed font-medium mb-6">
                  {activeModule.desc}
                </p>

                {/* 3 Interactive Benefit / Checklist Steps */}
                <div className="space-y-3 mb-6">
                  {activeModule.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-[#FCF9FD] border border-[#E8DFEB]/80"
                    >
                      <span className="w-7 h-7 rounded-full bg-[#4B075F] text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        {step.number}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[#241329] leading-snug">
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-[#E8DFEB]/70 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={`/${activeModule.id}`}
                  className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#4B075F]/15 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <span>Detaylı Bilgi</span>
                  <ChevronRight className="w-4 h-4 text-white/80" />
                </Link>
                <a
                  href="https://edu.oxonom.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#FCF9FD] hover:bg-[#FCE8FA] text-[#4B075F] font-bold text-xs sm:text-sm border border-[#E8DFEB] transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>Demo Hesap İncele</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* ═══ RIGHT COLUMN: Simulated Browser / Demo Window ═══ */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="rounded-2xl border border-gray-200/90 shadow-xl overflow-hidden bg-white">
                {/* Browser Chrome Header (Traffic light + URL) */}
                <div className="bg-[#241329] px-4 py-3 flex items-center justify-between border-b border-white/10 select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                    <div className="h-4 w-px bg-white/20 mx-2 hidden sm:block" />
                    <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg text-xs text-white/90 font-mono">
                      <span className="text-[#45C7A2]">🔒</span>
                      <span>{activeModule.demoUrl}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#16805D]/25 text-[#45C7A2] border border-[#16805D]/30 font-bold text-[10px]">
                      {activeModule.statusBadge}
                    </span>
                  </div>
                </div>

                {/* Simulated Screen Content with smooth scroll container */}
                <div className="max-h-[520px] sm:max-h-[580px] overflow-y-auto scrollbar-hide">
                  {renderDemoScreen()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
