'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FolderOpen,
  BookOpen,
  FileText,
  Gamepad2,
  Tv,
  Search,
  Download,
  ExternalLink,
  Tag,
  GraduationCap,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface LibraryDocItem {
  id: string
  title: string
  subject: string
  grade: string
  category: 'curriculum' | 'document' | 'interactive'
  format: string
  size: string
  downloads: number
  description: string
}

export default function TeacherLibraryView() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'curriculum' | 'document' | 'interactive'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Authentic school library resources
  const RESOURCES: LibraryDocItem[] = [
    {
      id: 'res-1',
      title: 'MEB 9. Sınıf Türk Dili ve Edebiyatı Yıllık Planı',
      subject: 'Türk Dili ve Edebiyatı',
      grade: '9. Sınıf',
      category: 'curriculum',
      format: 'PDF',
      size: '2.4 MB',
      downloads: 142,
      description: '2026-2027 Eğitim Öğretim Yılı MEB müfredatı haftalık kazanım ve değerlendirme planı.',
    },
    {
      id: 'res-2',
      title: 'Paragraf Çözüm Teknikleri ve Taktik Föyü',
      subject: 'Türk Dili ve Edebiyatı',
      grade: '9. Sınıf',
      category: 'document',
      format: 'PDF',
      size: '1.8 MB',
      downloads: 89,
      description: 'Düşünceyi geliştirme yolları ve soru çözüm stratejileri öğretmen ders föyü.',
    },
    {
      id: 'res-3',
      title: '5. Sınıf Türkçe Sözcükte Anlam Çalışma Kartları',
      subject: 'Türkçe',
      grade: '5. Sınıf',
      category: 'document',
      format: 'PDF',
      size: '3.1 MB',
      downloads: 110,
      description: 'Gerçek, mecaz ve terim anlamlı sözcükler için sınıf içi etkinlik kartları.',
    },
    {
      id: 'res-4',
      title: '1 Dakikada Hızlı Okuma ve Anlama Simülasyonu',
      subject: 'Türkçe & Edebiyat',
      grade: 'Tüm Kademeler',
      category: 'interactive',
      format: 'İnteraktif',
      size: 'Web Oyunu',
      downloads: 320,
      description: 'Akıllı tahtada oynatılabilir hızlandırılmış okuma ve odaklanma egzersizi.',
    },
    {
      id: 'res-5',
      title: 'İngilizce Kelime Eşleştirme Atölyesi',
      subject: 'İngilizce',
      grade: '5. Sınıf',
      category: 'interactive',
      format: 'İnteraktif',
      size: 'Web Oyunu',
      downloads: 245,
      description: 'Görsel destekli İngilizce kelime havuzu ve tahta etkileşimli çark oyunu.',
    },
  ]

  const filteredResources = useMemo(() => {
    return RESOURCES.filter((res) => {
      if (selectedCategory !== 'all' && res.category !== selectedCategory) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        return (
          res.title.toLowerCase().includes(q) ||
          res.subject.toLowerCase().includes(q) ||
          res.description.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [selectedCategory, searchQuery])

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <FolderOpen size={15} />
            <span>Ders Materyalleri & Dijital Kaynak Havuzu</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Eğitim Kütüphanesi
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Müfredat dokümanları, ders notları, çalışma kağıtları ve simülasyonlar
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Materyal veya konu ara..."
            className="w-full h-10 pl-9 pr-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { key: 'all', label: 'Tüm Kaynaklar' },
          { key: 'curriculum', label: 'Müfredat & Yıllık Planlar' },
          { key: 'document', label: 'PDF & Ders Notları' },
          { key: 'interactive', label: 'Etkileşimli Oyunlar' },
        ].map((tab) => {
          const isSelected = selectedCategory === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedCategory(tab.key as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#4B075F] text-white shadow-sm shadow-purple-950/20'
                  : 'bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 text-gray-700 dark:text-gray-300 hover:border-[#4B075F]'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => (
          <motion.div
            key={res.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                  {res.subject}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold">
                  {res.grade}
                </span>
              </div>

              <h2 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug">
                {res.title}
              </h2>

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                {res.description}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-400">
                {res.format} • {res.size}
              </span>

              {res.category === 'interactive' ? (
                <Link
                  href="/games"
                  className="h-8 px-3 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs shadow-purple-950/20"
                >
                  <Gamepad2 size={13} />
                  <span>Oyna / Başlat</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => toast.success(`${res.title} indirildi.`)}
                  className="h-8 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={13} />
                  <span>İndir</span>
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
