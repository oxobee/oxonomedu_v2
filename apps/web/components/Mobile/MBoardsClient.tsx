'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tv,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  Search,
  BookOpen,
  Calendar,
  X,
  Settings,
  ArrowRight,
  Globe,
  Lock,
  Copy,
  ExternalLink,
  Trash2,
  Save,
  Check,
  QrCode,
  Sun,
  Moon,
  Sparkles,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileFloatingDock from '@components/Mobile/MobileFloatingDock'
import ConnectBoardModal from '@components/DashboardV2/ConnectBoardModal'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'

export interface BoardItem {
  id: string
  title: string
  subject: 'TÜRKÇE' | 'MATEMATİK' | 'HAYAT BİLGİSİ' | 'GÖRSEL SANATLAR' | 'SINIF PANOSU'
  subjectLabel: string
  description: string
  teacherName: string
  date: string
  time: string
  studentCount: number
  className: string
  isOpen: boolean
  url: string
  isPublic: boolean
  hasPin: boolean
  pinCode?: string
  accentColor: string
}

const INITIAL_BOARDS: BoardItem[] = [
  {
    id: 'b-1',
    title: '1-A Türkçe: Okuma & Anlama ve Cümle Bilgisi',
    subject: 'TÜRKÇE',
    subjectLabel: 'TÜRKÇE',
    description: 'Öğretmen: Özlem ZOR. 5N1K etkinlikleri, harf-hece çalışmaları ve hızlı okuma tahtası.',
    teacherName: 'Özlem ZOR',
    date: '9 Ekim 2026',
    time: 'Bugün, 09:30',
    studentCount: 30,
    className: '1-A Şubesi',
    isOpen: true,
    url: 'http://localhost:3000/board/board_6be7ebed-4c00-4243-9a9b-ffef9933803b',
    isPublic: true,
    hasPin: false,
    accentColor: 'rose',
  },
  {
    id: 'b-2',
    title: '1-A Matematik: Ritmik Sayma & Dört İşlem Atölyesi',
    subject: 'MATEMATİK',
    subjectLabel: 'MATEMATİK',
    description: 'Öğretmen: Özlem ZOR. Basamak değerleri, problem çözme stratejileri ve zihinden işlemler.',
    teacherName: 'Özlem ZOR',
    date: '9 Ekim 2026',
    time: 'Bugün, 11:15',
    studentCount: 30,
    className: '1-A Şubesi',
    isOpen: true,
    url: 'http://localhost:3000/board/101_matematik',
    isPublic: true,
    hasPin: false,
    accentColor: 'blue',
  },
  {
    id: 'b-3',
    title: '1-A Hayat Bilgisi: Dünyamız ve Canlılar',
    subject: 'HAYAT BİLGİSİ',
    subjectLabel: 'HAYAT BİLGİSİ',
    description: 'Öğretmen: Özlem ZOR. Mevsimler, doğa olayları, sağlıklı yaşam ve çevre bilinci.',
    teacherName: 'Özlem ZOR',
    date: '9 Ekim 2026',
    time: 'Dün, 14:00',
    studentCount: 30,
    className: '1-A Şubesi',
    isOpen: true,
    url: 'http://localhost:3000/board/101_hayatbilgisi',
    isPublic: true,
    hasPin: false,
    accentColor: 'emerald',
  },
  {
    id: 'b-4',
    title: '1-A Görsel Sanatlar & Bilişim: Çizim ve Tasarım',
    subject: 'GÖRSEL SANATLAR',
    subjectLabel: 'GÖRSEL SANATLAR',
    description: 'Öğretmen: Özlem ZOR. Dijital resim, renk teorisi, serbest etkinlikler ve kodlama atölyesi.',
    teacherName: 'Özlem ZOR',
    date: '9 Ekim 2026',
    time: 'Dün, 14:00',
    studentCount: 30,
    className: '1-A Şubesi',
    isOpen: true,
    url: 'http://localhost:3000/board/101_gorsel',
    isPublic: true,
    hasPin: false,
    accentColor: 'amber',
  },
]

export interface MBoardsClientProps {
  hideDock?: boolean
  hideHeader?: boolean
  theme?: 'light' | 'dark'
  onToggleTheme?: () => void
}

export default function MBoardsClient({
  hideDock = false,
  hideHeader = false,
  theme: propTheme,
  onToggleTheme: propToggleTheme,
}: MBoardsClientProps = {}) {
  const { theme: internalTheme, toggleTheme: internalToggleTheme } = useMobileTheme()
  const theme = propTheme || internalTheme
  const toggleTheme = propToggleTheme || internalToggleTheme

  // Prevent pinch-to-zoom
  useEffect(() => {
    const preventMultiTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault()
    }
    const preventGesture = (e: Event) => e.preventDefault()
    document.addEventListener('touchmove', preventMultiTouch, { passive: false })
    document.addEventListener('gesturestart', preventGesture)
    document.addEventListener('gesturechange', preventGesture)
    return () => {
      document.removeEventListener('touchmove', preventMultiTouch)
      document.removeEventListener('gesturestart', preventGesture)
      document.removeEventListener('gesturechange', preventGesture)
    }
  }, [])

  // Boards State with LocalStorage persistence
  const [boards, setBoards] = useState<BoardItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_m_boards')
        if (saved) return JSON.parse(saved)
      } catch (_) {}
    }
    return INITIAL_BOARDS
  })

  const saveBoards = (newBoards: BoardItem[]) => {
    setBoards(newBoards)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_m_boards', JSON.stringify(newBoards))
      } catch (_) {}
    }
  }

  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all')
  const [selectedDateFilter, setSelectedDateFilter] = useState('all')

  // Modals
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false)
  const [newHasPin, setNewHasPin] = useState(false)
  const [newPinCode, setNewPinCode] = useState('1234')
  const [settingsBoard, setSettingsBoard] = useState<BoardItem | null>(null)

  // Settings Edit Form State
  const [settingsForm, setSettingsForm] = useState({
    title: '',
    date: '08.10.2026',
    isPublic: true,
    hasPin: false,
    pinCode: '',
    url: '',
  })

  // Open Settings Modal for a board
  const handleOpenSettings = (b: BoardItem) => {
    setSettingsBoard(b)
    setSettingsForm({
      title: b.title,
      date: '08.10.2026',
      isPublic: b.isPublic,
      hasPin: b.hasPin,
      pinCode: b.pinCode || '1234',
      url: b.url,
    })
  }

  // Save Settings Changes
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    if (!settingsBoard) return
    const updated = boards.map((b) =>
      b.id === settingsBoard.id
        ? {
            ...b,
            title: settingsForm.title,
            isPublic: settingsForm.isPublic,
            hasPin: settingsForm.hasPin,
            pinCode: settingsForm.hasPin ? (settingsForm.pinCode || '1234') : undefined,
          }
        : b
    )
    saveBoards(updated)
    toast.success('Tahta ayarları kaydedildi.')
    setSettingsBoard(null)
  }

  // Delete Board
  const handleDeleteBoard = (id: string) => {
    const updated = boards.filter((b) => b.id !== id)
    saveBoards(updated)
    toast.success('Tahta silindi.')
    setSettingsBoard(null)
  }

  // Copy Board URL
  const handleCopyUrl = (url: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url)
      toast.success('Bağlantı panoya kopyalandı!')
    }
  }

  // Filtered Boards
  const filteredBoards = useMemo(() => {
    return boards.filter((b) => {
      if (selectedSubjectFilter !== 'all' && b.subject !== selectedSubjectFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const mTitle = b.title.toLowerCase().includes(q)
        const mDesc = b.description.toLowerCase().includes(q)
        const mSub = b.subjectLabel.toLowerCase().includes(q)
        if (!mTitle && !mDesc && !mSub) return false
      }
      return true
    })
  }, [boards, selectedSubjectFilter, searchQuery])

  // Macro Stagger Animation Variants (Rapid fluid entrance from Left)
  const pageVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.02,
      },
    },
  }

  const macroItemVariants: any = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
    },
  }

  const pageContent = (
    <div className="flex flex-col flex-1 w-full">
      {/* ── STAGGERED PAGE CONTENT WRAPPER (Fluid Left Entrance) ── */}
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col flex-1 w-full"
      >

        {/* ── 2. HERO SECTION: AKILLI TAHTALAR & PANOLAR ── */}
        <motion.section
          variants={macroItemVariants}
          className="mx-5 mt-3 rounded-[22px] p-4 text-white flex flex-col gap-3.5 shadow-xl bg-[#0A0D15] relative overflow-hidden"
          style={{
            backgroundImage:
              'linear-gradient(45deg,rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(-45deg,rgba(255,255,255,.05) 1px,transparent 1px),radial-gradient(circle at 100% 0%,rgba(255,255,255,.1) 0%,rgba(255,255,255,0) 50%)',
            backgroundSize: '26px 26px, 26px 26px, auto',
            boxShadow: '0 12px 26px rgba(10,13,21,.2)',
          }}
        >
          {/* Animated Background Subtle Circles (Soft & non-distracting) */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none opacity-25">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full relative"
            >
              <div className="absolute inset-0 rounded-full border border-[#34D399]/30" />
              <div className="absolute inset-6 rounded-full border border-white/10 border-dashed" />
              <div className="absolute inset-12 rounded-full border border-[#34D399]/40" />
            </motion.div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <motion.span
              whileHover={{ rotate: 8, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400 }}
              aria-hidden="true"
              className="w-[42px] h-[42px] rounded-[13px] bg-[#34D399]/15 border border-[#34D399]/35 text-[#34D399] flex items-center justify-center shrink-0"
            >
              <Tv size={22} strokeWidth={1.8} />
            </motion.span>
            <h1 className="m-0 text-[19px] leading-[1.2] font-extrabold tracking-tight">
              Akıllı Tahtalar & Panolar
            </h1>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.01 }}
            type="button"
            onClick={() => setIsNewBoardModalOpen(true)}
            className="h-[46px] border-0 rounded-[14px] bg-[#34D399] hover:bg-[#2fe0a0] text-[#0A0D15] text-[13px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <Plus size={18} strokeWidth={2.4} />
            <span>Yeni Tahta Oluştur</span>
          </motion.button>
        </motion.section>

        {/* ── 3. MAIN CONTENT: ARA & FİLTRELE + PANOLAR LİSTESİ ── */}
        <main className="flex-1 px-5 py-4 flex flex-col gap-4">
          {/* ── ARA & FİLTRELE ACCORDION ── */}
          <motion.div
            variants={macroItemVariants}
            className="bg-white dark:bg-[#121826] border border-[#E7EBF2] dark:border-gray-800 rounded-[22px] shadow-sm overflow-hidden transition-all"
          >
            <div
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-3 min-h-[60px] px-4 py-2.5 cursor-pointer select-none"
            >
              <span
                aria-hidden="true"
                className="w-[38px] h-[38px] rounded-[12px] bg-[#ECEBFD] dark:bg-indigo-950/60 text-[#4338CA] dark:text-indigo-300 flex items-center justify-center shrink-0"
              >
                <SlidersHorizontal size={19} strokeWidth={1.9} />
              </span>
              <div className="flex-1 min-w-0">
                <span className="block text-[14px] font-bold text-gray-900 dark:text-white">
                  Ara & Filtrele
                </span>
                <span className="block text-[12px] text-[#5B6577] dark:text-gray-400 mt-0.5">
                  {selectedSubjectFilter === 'all' ? 'Tüm Dersler' : selectedSubjectFilter} ·{' '}
                  {selectedDateFilter === 'all' ? 'Tüm Tarihler' : selectedDateFilter}
                </span>
              </div>
              <motion.span
                animate={{ rotate: isFilterOpen ? 180 : 0 }}
                transition={{ duration: 0.22 }}
                className="w-8 h-8 rounded-full bg-[#F1F4F9] dark:bg-gray-800 text-[#5B6577] dark:text-gray-300 flex items-center justify-center shrink-0"
              >
                <ChevronDown size={16} />
              </motion.span>
            </div>

            {/* Accordion Content */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-4 pb-4 pt-1 flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800/80"
                >
                  {/* Search Input */}
                  <label className="flex items-center gap-2.5 min-h-[50px] px-3.5 rounded-[16px] bg-[#F6F8FC] dark:bg-[#161D2E] border border-[#E1E6EE] dark:border-gray-700">
                    <span className="text-[#5B6577] dark:text-gray-400">
                      <Search size={19} strokeWidth={1.8} />
                    </span>
                    <input
                      type="search"
                      aria-label="Pano veya ders ara"
                      placeholder="Pano veya ders adı ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 min-w-0 border-0 outline-hidden bg-transparent text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </label>

                  {/* DERS Filter Title */}
                  <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] text-[#5B6577] dark:text-gray-400 mt-1">
                    <BookOpen size={14} />
                    <span>DERS</span>
                  </div>

                  {/* DERS Chips */}
                  <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide -mt-1">
                    {[
                      { label: 'Tüm Dersler', val: 'all' },
                      { label: 'Türkçe', val: 'TÜRKÇE' },
                      { label: 'Matematik', val: 'MATEMATİK' },
                      { label: 'Hayat Bilgisi', val: 'HAYAT BİLGİSİ' },
                      { label: 'Görsel Sanatlar', val: 'GÖRSEL SANATLAR' },
                      { label: 'Sınıf Panosu', val: 'SINIF PANOSU' },
                    ].map((item) => {
                      const isActive = selectedSubjectFilter === item.val
                      return (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          key={item.val}
                          type="button"
                          onClick={() => setSelectedSubjectFilter(item.val)}
                          className={`shrink-0 h-[40px] px-4 rounded-[14px] text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#4338CA] text-white shadow-md'
                              : 'bg-white dark:bg-[#161D2E] border border-[#E1E6EE] dark:border-gray-700 text-[#334155] dark:text-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {item.label}
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* TARİH Filter Title */}
                  <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] text-[#5B6577] dark:text-gray-400 mt-1">
                    <Calendar size={14} />
                    <span>TARİH</span>
                  </div>

                  {/* TARİH Chips */}
                  <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide -mt-1">
                    {[
                      { label: 'Tüm Tarihler', val: 'all' },
                      { label: 'Bugün', val: 'today' },
                      { label: 'Bu Hafta', val: 'week' },
                      { label: 'Arşiv', val: 'archive' },
                    ].map((item) => {
                      const isActive = selectedDateFilter === item.val
                      return (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          key={item.val}
                          type="button"
                          onClick={() => setSelectedDateFilter(item.val)}
                          className={`shrink-0 h-[40px] px-4 rounded-[14px] text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#0A0D15] dark:bg-white text-white dark:text-[#0A0D15] shadow-md'
                              : 'bg-white dark:bg-[#161D2E] border border-[#E1E6EE] dark:border-gray-700 text-[#334155] dark:text-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {item.label}
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── 4. PANOLAR AYIRICI ── */}
          <motion.div
            variants={macroItemVariants}
            className="flex items-center gap-2.5 text-[11px] font-bold tracking-[0.08em] text-[#5B6577] dark:text-gray-400 mt-1"
          >
            <span className="w-[18px] h-[3px] rounded-[2px] bg-[#34D399]" />
            <span>PANOLAR</span>
            <span className="flex-1 h-[1px] bg-[#DDE3EC] dark:bg-gray-800" />
            <span className="tracking-normal text-[#334155] dark:text-gray-300 font-semibold">
              {filteredBoards.length} tahta
            </span>
          </motion.div>

          {/* ── 5. PANOLAR LİSTESİ WITH STAGGERED ENTRANCE ── */}
          <motion.div variants={macroItemVariants} className="flex flex-col gap-4">
            {filteredBoards.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs bg-white dark:bg-[#121826] rounded-[22px] border border-gray-100 dark:border-gray-800 p-6">
                Aramanıza uygun akıllı tahta bulunamadı.
              </div>
            ) : (
              filteredBoards.map((b, idx) => {
                // Radial gradient color according to subject
                const radialColor =
                  b.subject === 'TÜRKÇE'
                    ? 'rgba(239,68,68,.38)'
                    : b.subject === 'MATEMATİK'
                    ? 'rgba(59,130,246,.38)'
                    : b.subject === 'HAYAT BİLGİSİ'
                    ? 'rgba(16,185,129,.38)'
                    : 'rgba(245,158,11,.38)'

                const tagBg =
                  b.subject === 'TÜRKÇE'
                    ? 'bg-rose-500/20 border-rose-500/55 text-rose-200'
                    : b.subject === 'MATEMATİK'
                    ? 'bg-blue-500/20 border-blue-500/55 text-blue-200'
                    : b.subject === 'HAYAT BİLGİSİ'
                    ? 'bg-emerald-500/20 border-emerald-500/55 text-emerald-200'
                    : 'bg-amber-500/20 border-amber-500/55 text-amber-200'

                return (
                  <motion.article
                    key={b.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: idx * 0.05,
                      ease: 'easeOut',
                    }}
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    className="rounded-[26px] p-[18px] text-white flex flex-col gap-4 shadow-xl bg-[#0A0D15] relative overflow-hidden transition-shadow"
                    style={{
                      backgroundImage: `radial-gradient(circle at 100% 0%,${radialColor} 0%,transparent 55%),linear-gradient(45deg,rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(-45deg,rgba(255,255,255,.04) 1px,transparent 1px)`,
                      backgroundSize: 'auto,24px 24px,24px 24px',
                      boxShadow: '0 14px 28px rgba(10,13,21,.22)',
                    }}
                  >
                    {/* Top Row: Subject Tag + Status Badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`h-[30px] inline-flex items-center px-3.5 rounded-[15px] border text-[11px] font-extrabold tracking-[0.08em] ${tagBg}`}
                      >
                        {b.subjectLabel}
                      </span>

                      <span className="h-[28px] inline-flex items-center gap-1.5 px-2.5 rounded-[14px] bg-[#34D399] text-[#0A0D15] text-[11px] font-extrabold tracking-[0.04em] shadow-xs">
                        <Globe size={14} strokeWidth={2.2} />
                        <span>AÇIK</span>
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="flex flex-col gap-1.5">
                      <h2 className="m-0 text-[18px] leading-[1.3] font-extrabold tracking-tight text-white">
                        {b.title}
                      </h2>
                      <p className="m-0 text-[13px] leading-[1.5] text-[#B4BDCC]">
                        {b.description}
                      </p>
                    </div>

                    {/* Meta Chips */}
                    <div className="flex flex-wrap gap-2 text-[12px] font-semibold text-[#E2E8F0]">
                      <span className="inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-[15px] bg-white/10 border border-white/15">
                        <Calendar size={14} className="text-[#B4BDCC]" />
                        <span>{b.date}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-[15px] bg-white/10 border border-white/15">
                        <Sparkles size={14} className="text-[#B4BDCC]" />
                        <span>{b.time}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-[15px] bg-white/10 border border-white/15">
                        <Users size={14} className="text-[#B4BDCC]" />
                        <span>{b.studentCount} Öğrenci</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-[15px] bg-white/10 border border-white/15">
                        <Tv size={14} className="text-[#B4BDCC]" />
                        <span>{b.className}</span>
                      </span>
                    </div>

                    {/* Bottom Actions: Tahtayı Aç + Ayarlar */}
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={b.url.startsWith('http') ? b.url : `/board/${b.id}`}
                        className="flex-1 h-[48px] rounded-[16px] bg-white hover:bg-gray-100 text-[#0A0D15] text-[13px] font-extrabold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md"
                      >
                        <span>Tahtayı Aç</span>
                        <ArrowRight size={16} strokeWidth={2.4} className="text-[#047857]" />
                      </Link>

                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        type="button"
                        onClick={() => handleOpenSettings(b)}
                        aria-label="Ayarlar"
                        title="Tahta Ayarları"
                        className="w-[48px] h-[48px] rounded-[16px] border border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shrink-0 cursor-pointer transition-all"
                      >
                        <Settings size={20} strokeWidth={1.9} />
                      </motion.button>
                    </div>
                  </motion.article>
                )
              })
            )}
          </motion.div>
        </main>
      </motion.div>

      {/* ── MODAL 1: TAHTA AYARLARI (Matching screenshot media_1791502942200.png) ── */}
      <AnimatePresence>
        {settingsBoard && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsBoard(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            {/* Modal Sheet */}
            <motion.div
              initial={{ y: '100%', opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full sm:max-w-md bg-[#111624] text-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/10 max-h-[92vh] flex flex-col z-10 overflow-hidden pb-[env(safe-area-inset-bottom)]"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">
                    <SlidersHorizontal size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-extrabold text-white">Tahta Ayarları</h3>
                    <p className="text-[11px] text-gray-400 truncate max-w-[220px]">
                      {settingsBoard.className} • {settingsBoard.title}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSettingsBoard(null)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveSettings} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {/* Field 1: TAHTA ADI */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <BookOpen size={13} className="text-indigo-400" />
                    <span>TAHTA ADI</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.title}
                    onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                    className="w-full px-3.5 py-3 bg-[#182033] border border-white/10 rounded-xl text-xs text-white outline-hidden focus:border-indigo-500 font-medium"
                  />
                </div>

                {/* Field 2: DERS / TAHTA TARİHİ */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar size={13} className="text-indigo-400" />
                    <span>DERS / TAHTA TARİHİ</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={settingsForm.date}
                      onChange={(e) => setSettingsForm({ ...settingsForm, date: e.target.value })}
                      className="w-full px-3.5 py-3 bg-[#182033] border border-white/10 rounded-xl text-xs text-white outline-hidden font-medium"
                    />
                    <Calendar
                      size={16}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Field 3: ERİŞİM DURUMU */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe size={13} className="text-indigo-400" />
                    <span>ERİŞİM DURUMU</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Option A: Herkese Açık */}
                    <div
                      onClick={() => setSettingsForm({ ...settingsForm, isPublic: true })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        settingsForm.isPublic
                          ? 'border-emerald-500/80 bg-emerald-950/30'
                          : 'border-white/10 bg-[#182033] opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <Globe size={14} className="text-emerald-400" />
                          <span>Herkese Açık</span>
                        </span>
                        {settingsForm.isPublic && (
                          <Check size={14} className="text-emerald-400 stroke-[3]" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                        Sınıftaki tüm öğrenciler doğrudan tahtayı açabilir.
                      </p>
                    </div>

                    {/* Option B: Özel (Kısıtlı) */}
                    <div
                      onClick={() => setSettingsForm({ ...settingsForm, isPublic: false })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        !settingsForm.isPublic
                          ? 'border-indigo-500/80 bg-indigo-950/30'
                          : 'border-white/10 bg-[#182033] opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <Lock size={14} className="text-indigo-400" />
                          <span>Özel (Kısıtlı)</span>
                        </span>
                        {!settingsForm.isPublic && (
                          <Check size={14} className="text-indigo-400 stroke-[3]" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                        Yalnızca yetkili öğretmenler görebilir.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Field 4: Şifreleme / PIN Koruması */}
                <div className="p-3.5 rounded-xl bg-[#182033] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-300">
                      <Lock size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white block">Şifreleme / PIN Koruması</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {settingsForm.hasPin ? 'PIN ile kilitli giriş aktif.' : 'Şifresiz doğrudan giriş aktif.'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSettingsForm({ ...settingsForm, hasPin: !settingsForm.hasPin })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      settingsForm.hasPin ? 'bg-[#34D399]' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        settingsForm.hasPin ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* PIN Giriş Alanı (Şifre aktifse açılır) */}
                <AnimatePresence>
                  {settingsForm.hasPin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden space-y-2 p-3.5 rounded-xl bg-[#141b2d] border border-[#34D399]/40"
                    >
                      <label className="block text-[11px] font-bold text-[#34D399] uppercase tracking-wider flex items-center gap-1.5">
                        <Lock size={13} />
                        <span>TAHTA GİRİŞ ŞİFRESİ / PIN KODU</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Örn: 1234"
                          value={settingsForm.pinCode}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              pinCode: e.target.value.replace(/[^0-9a-zA-Z]/g, ''),
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-[#182033] border border-white/10 rounded-xl text-sm text-white font-mono tracking-widest outline-hidden focus:border-[#34D399]"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 leading-tight">
                        Öğrenciler ve misafirler bu tahtayı açarken bu şifreyi girmek zorunda olacaktır.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Field 5: PAYLAŞIM BAĞLANTISI */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Globe size={13} className="text-indigo-400" />
                    <span>PAYLAŞIM BAĞLANTISI</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={settingsForm.url}
                      className="flex-1 px-3.5 py-2.5 bg-[#182033] border border-white/10 rounded-xl text-[11px] text-gray-300 font-mono outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(settingsForm.url)}
                      className="h-[38px] px-3 bg-[#1C253B] hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <Copy size={14} />
                      <span>Kopyala</span>
                    </button>
                    <Link
                      href={settingsForm.url}
                      target="_blank"
                      className="w-[38px] h-[38px] bg-[#1C253B] hover:bg-white/15 border border-white/10 rounded-xl flex items-center justify-center text-white cursor-pointer"
                    >
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                </div>

                {/* Action: Tahtayı Sil */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleDeleteBoard(settingsBoard.id)}
                    className="h-10 px-3.5 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Trash2 size={15} />
                    <span>Tahtayı Sil</span>
                  </button>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSettingsBoard(null)}
                    className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Save size={15} />
                    <span>Değişiklikleri Kaydet</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: YENİ TAHTA OLUŞTUR ── */}
      <AnimatePresence>
        {isNewBoardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewBoardModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full sm:max-w-md bg-[#111624] text-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/10 p-5 flex flex-col z-10 pb-[env(safe-area-inset-bottom)]"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#34D399]/20 text-[#34D399] flex items-center justify-center font-bold">
                    <Plus size={18} />
                  </div>
                  <h3 className="text-sm font-extrabold text-white">Yeni Akıllı Tahta Oluştur</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewBoardModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const form = e.currentTarget as any
                  const title = form.boardTitle.value
                  const subject = form.boardSubject.value
                  if (!title.trim()) return

                  const newB: BoardItem = {
                    id: `b-${Date.now()}`,
                    title: title.trim(),
                    subject: subject as any,
                    subjectLabel: subject,
                    description: 'Öğretmen: Özlem ZOR. İnteraktif tuval ve akıllı ders panosu.',
                    teacherName: 'Özlem ZOR',
                    date: '9 Ekim 2026',
                    time: 'Bugün, Yeni',
                    studentCount: 30,
                    className: '1-A Şubesi',
                    isOpen: true,
                    url: `http://localhost:3000/board/custom_${Date.now()}`,
                    isPublic: true,
                    hasPin: newHasPin,
                    pinCode: newHasPin ? (newPinCode || '1234') : undefined,
                    accentColor: 'emerald',
                  }
                  saveBoards([newB, ...boards])
                  setIsNewBoardModalOpen(false)
                  toast.success('Yeni tahta başarıyla oluşturuldu!')
                }}
                className="py-4 space-y-3.5 text-xs"
              >
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">Tahta Başlığı *</label>
                  <input
                    name="boardTitle"
                    type="text"
                    required
                    placeholder="Örn: 1-A Fen Bilimleri: Deneyler ve Gözlem"
                    className="w-full px-3.5 py-2.5 bg-[#182033] border border-white/10 rounded-xl text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">Ders Seçimi</label>
                  <select
                    name="boardSubject"
                    className="w-full px-3.5 py-2.5 bg-[#182033] border border-white/10 rounded-xl text-white outline-hidden cursor-pointer"
                  >
                    <option value="TÜRKÇE">Türkçe</option>
                    <option value="MATEMATİK">Matematik</option>
                    <option value="HAYAT BİLGİSİ">Hayat Bilgisi</option>
                    <option value="GÖRSEL SANATLAR">Görsel Sanatlar</option>
                    <option value="SINIF PANOSU">Sınıf Panosu</option>
                  </select>
                </div>

                {/* PIN Koruması Toggle */}
                <div className="p-3 rounded-xl bg-[#182033] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Lock size={15} className="text-gray-300" />
                    <div>
                      <span className="font-bold text-xs text-white block">Şifreleme / PIN Koruması</span>
                      <span className="text-[10px] text-gray-400 block">
                        {newHasPin ? 'Şifre korumalı oluşturulacak.' : 'Şifresiz doğrudan giriş.'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewHasPin(!newHasPin)}
                    className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                      newHasPin ? 'bg-[#34D399]' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                        newHasPin ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* PIN Giriş Alanı */}
                <AnimatePresence>
                  {newHasPin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-1.5 p-3 rounded-xl bg-[#141b2d] border border-[#34D399]/40"
                    >
                      <label className="block text-[10px] font-bold text-[#34D399] uppercase tracking-wider flex items-center gap-1">
                        <Lock size={12} />
                        <span>Giriş Şifresi (PIN Kodu)</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Örn: 1234"
                        value={newPinCode}
                        onChange={(e) => setNewPinCode(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                        className="w-full px-3 py-2 bg-[#182033] border border-white/10 rounded-lg text-xs text-white font-mono tracking-widest outline-hidden focus:border-[#34D399]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-11 bg-[#34D399] hover:bg-[#2fe0a0] text-[#0A0D15] font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    <Save size={15} />
                    <span>Tahtayı Başlat & Kaydet</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: QR BAĞLANTI (Akıllı Tahta) ── */}
      <ConnectBoardModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        theme={theme}
      />
    </div>
  )

  if (hideHeader) {
    return pageContent
  }

  return (
    <div
      className={`${theme} min-h-[100dvh] w-full bg-[#0A0D15] sm:bg-[#E2E8F0] sm:dark:bg-[#06090F] flex justify-center selection:bg-[#34D399]/30 selection:text-emerald-950 transition-colors duration-300 font-jakarta overscroll-none`}
    >
      <div
        className="w-full sm:max-w-[390px] min-h-[100dvh] bg-[#F8FAFC] dark:bg-[#0A0D15] sm:shadow-2xl relative flex flex-col sm:border-x border-gray-200/60 dark:border-gray-800/80 overflow-x-hidden overscroll-y-none"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6.5rem)' }}
      >
        <MobileHeader theme={theme} onToggleTheme={toggleTheme} />
        {pageContent}
        {!hideDock && <MobileFloatingDock activeTab="boards" />}
      </div>
    </div>
  )
}
