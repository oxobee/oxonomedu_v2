'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutGrid,
  FileCheck2,
  Sparkles,
  ScanLine,
  Presentation,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  BookOpen,
  HelpCircle,
  GraduationCap,
  ExternalLink,
} from 'lucide-react'

interface ModuleItem {
  id: string
  title: string
  subtitle: string
  description: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  category: 'Ölçme & Değerlendirme' | 'Yapay Zekâ' | 'Ders Materyali'
  status: 'active' | 'coming_soon' | 'in_development'
  badgeText: string
  href?: string
  features: string[]
  accentColor: string
}

const MODULES_LIST: ModuleItem[] = [
  {
    id: 'sinav-olusturma',
    title: 'Sınav Oluşturma',
    subtitle: 'Akıllı Dizgi Masası & Test Stüdyosu',
    description:
      'PDF ve görsel formatındaki sorulardan anında soru kırpın; akıllı yerleşim algoritmasıyla soruları A4 formatında 2 sütunlu estetik sınav kağıdına dizin.',
    icon: FileCheck2,
    category: 'Ölçme & Değerlendirme',
    status: 'active',
    badgeText: 'Aktif Modül',
    href: '/teacher/modules/sinav-olusturma',
    features: [
      'PDF & Görselden Soru Kırpma',
      'Akıllı A4 Otomatik Yerleşim',
      'Çoklu Sayfa & Dizgi Masası',
      'Baskıya Hazır PDF & Çözüm Anahtarı',
    ],
    accentColor: '#D914C8',
  },
  {
    id: 'ai-question-generator',
    title: 'Yapay Zekâ Soru Asistanı',
    subtitle: 'Kazanım Odaklı Soru Üretici',
    description:
      'MEB müfredatı ve ders kazanımlarıyla tam uyumlu, beceri temelli çoktan seçmeli, açık uçlu ve yeni nesil soru varyasyonları üretir.',
    icon: Sparkles,
    category: 'Yapay Zekâ',
    status: 'coming_soon',
    badgeText: 'Çok Yakında',
    features: [
      'MEB Müfredat Kazanım Eşleştirme',
      'Zorluk Düzeyi & Taksonomi Ayarı',
      'Otomatik Çözüm ve Cevap Açıklaması',
      'Soru Bankasına Tek Tıkla Aktarım',
    ],
    accentColor: '#8D49A6',
  },
  {
    id: 'optical-scanner',
    title: 'Optik Okuyucu & Analiz',
    subtitle: 'Mobil & Kamera Tabanlı Değerlendirme',
    description:
      'Akıllı telefon kamerası veya tarayıcı ile sınav optik kağıtlarını saniyeler içinde okur; sınıf karnesi ve kazanım eksiklik analizini otomatik hesaplar.',
    icon: ScanLine,
    category: 'Ölçme & Değerlendirme',
    status: 'in_development',
    badgeText: 'Geliştirme Aşamasında',
    features: [
      'Kamera ile Anlık Optik Okuma',
      'Kazanım Bazlı Başarı Analizi',
      'e-Okul Uyumlu Not Çıktısı',
      'Öğrenci Karnesi & Veli Raporu',
    ],
    accentColor: '#4B075F',
  },
  {
    id: 'interactive-presentation',
    title: 'Ders Sunumu & Materyal Üretici',
    subtitle: 'Akıllı Tahta İnteraktif İçerik Seti',
    description:
      'Ders konusunu ve sınıf seviyesini seçin; akıllı tahtayla tam entegre çalışan interaktif slaytlar, kavram haritaları ve mini quizler oluşturun.',
    icon: Presentation,
    category: 'Ders Materyali',
    status: 'coming_soon',
    badgeText: 'Planlanan Modül',
    features: [
      'Akıllı Tahta Dokunmatik Uyumlu',
      'İnteraktif Sürükle-Bırak Etkinlikleri',
      'Kavram & Zihin Haritaları',
      'PDF & PPTX Dışa Aktarma',
    ],
    accentColor: '#0084FF',
  },
]

export default function TeacherModulesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['Tümü', 'Ölçme & Değerlendirme', 'Yapay Zekâ', 'Ders Materyali']

  const filteredModules = MODULES_LIST.filter((mod) => {
    const matchesCat = selectedCategory === 'Tümü' || mod.category === selectedCategory
    const matchesSearch =
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 font-jakarta">
      {/* ── HEADER BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#4B075F] via-[#620B79] to-[#8D49A6] text-white p-6 sm:p-8 shadow-xl border border-white/10">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#D914C8]/20 blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white/95">
            <LayoutGrid size={14} className="text-[#FCE8FA]" />
            <span>Oxonom Edu Modül Ekosistemi</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Öğretmen Modülleri & Araç Seti
          </h1>

          <p className="text-sm sm:text-base text-white/80 leading-relaxed">
            Ders hazırlığı, soru tasarımı, sınav dizgisi ve sınıf içi ölçme-değerlendirme süreçlerinizi
            hızlandıran entegre profesyonel araçlar tek bir merkezde.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-white/90">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>1 Aktif Modül</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              <Sparkles size={14} className="text-[#FCE8FA]" />
              <span>Genişletilebilir Modüler Mimari</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#211729] p-3 rounded-2xl border border-[#E8DFEB] dark:border-[#49364F] shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#4B075F] text-white shadow-xs'
                  : 'bg-[#F7F0FA] dark:bg-[#2D2035] text-[#514458] dark:text-[#D2C5D8] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#716779] dark:text-[#B5A5BD]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Modüllerde ara..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] border border-transparent focus:border-[#8D49A6] text-xs font-medium text-[#241329] dark:text-white placeholder-[#716779] focus:outline-hidden transition-all"
          />
        </div>
      </div>

      {/* ── MODULE CARDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {filteredModules.map((module) => {
          const Icon = module.icon
          const isActive = module.status === 'active'

          return (
            <motion.div
              key={module.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 border transition-all ${
                isActive
                  ? 'bg-white dark:bg-[#211729] border-[#E8DFEB] dark:border-[#49364F] hover:border-[#D914C8]/50 shadow-sm hover:shadow-lg'
                  : 'bg-white/60 dark:bg-[#211729]/60 border-[#E8DFEB]/60 dark:border-[#49364F]/60'
              }`}
            >
              <div className="space-y-4">
                {/* Top Row: Icon + Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs transition-transform ${
                      isActive
                        ? 'bg-linear-to-br from-[#4B075F] to-[#8D49A6] text-white shadow-[#4B075F]/20'
                        : 'bg-[#F7F0FA] dark:bg-[#2D2035] text-[#716779] dark:text-[#B5A5BD]'
                    }`}
                  >
                    <Icon size={26} />
                  </div>

                  <div>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {module.badgeText}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-[#8D49A6] dark:text-[#C58ADB] border border-[#8D49A6]/20 text-xs font-bold">
                        <Clock size={12} />
                        {module.badgeText}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#8D49A6] dark:text-[#C58ADB] mb-1">
                    {module.category}
                  </div>
                  <h3 className="text-xl font-extrabold text-[#241329] dark:text-white leading-tight">
                    {module.title}
                  </h3>
                  <div className="text-xs font-semibold text-[#716779] dark:text-[#B5A5BD] mt-0.5">
                    {module.subtitle}
                  </div>
                  <p className="text-xs sm:text-sm text-[#514458] dark:text-[#D2C5D8] mt-3 leading-relaxed">
                    {module.description}
                  </p>
                </div>

                {/* Feature Bullet Points */}
                <div className="pt-2 space-y-1.5 border-t border-[#E8DFEB]/70 dark:border-[#49364F]/70">
                  {module.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#514458] dark:text-[#D2C5D8]">
                      <CheckCircle2
                        size={14}
                        className={isActive ? 'text-[#D914C8] shrink-0' : 'text-[#716779]/50 shrink-0'}
                      />
                      <span className="font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                {isActive && module.href ? (
                  <Link
                    href={module.href}
                    className="w-full h-11 px-4 rounded-xl bg-linear-to-r from-[#4B075F] to-[#8D49A6] hover:from-[#620B79] hover:to-[#D914C8] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer group"
                  >
                    <span>Modülü Başlat</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full h-11 px-4 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] text-[#716779] dark:text-[#B5A5BD] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                  >
                    <span>Pek Yakında Kullanıma Açılacak</span>
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
