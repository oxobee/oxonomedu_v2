// apps/web/components/Pano/PanoExploreModal.tsx
'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  Tv,
  X,
  Search,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  ExternalLink,
  Sparkles,
  Play,
  Compass,
  BookOpen,
  Atom,
  ChevronRight,
  Maximize2,
} from 'lucide-react'

// YouTube Official Red Icon SVG
const YouTubeIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path
      fill="#FF0000"
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
    />
    <path fill="#FFFFFF" d="m9.545 15.568 6.273-3.568-6.273-3.568z" />
  </svg>
)

// Retro / Modern Cute TV Icon SVG
const CuteTvIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="15" x="2" y="7" rx="3" />
    <polyline points="17 2 12 7 7 2" />
    <circle cx="17" cy="11" r="1" fill="currentColor" />
    <circle cx="17" cy="15" r="1" fill="currentColor" />
    <line x1="6" y1="11" x2="13" y2="11" />
    <line x1="6" y1="15" x2="13" y2="15" />
  </svg>
)

interface PanoExploreModalProps {
  isOpen: boolean
  onClose: () => void
}

type ActiveView = 'menu' | 'browser' | 'youtube' | 'tv_coming_soon'

// 1. ve 2. Sınıflara Uygun Türkçe Eğitici Video Kısayolları
const FIRST_SECOND_GRADE_VIDEOS = [
  {
    id: 'D0Wp2n0eGjY',
    category: '1. Sınıf Türkçe',
    title: '🔤 Harfleri & Sesleri Öğreniyorum',
    desc: 'ELAKİN grubu harf sesleri animasyonlu eğitim şarkısı',
  },
  {
    id: '2Vv-BfVoq4g',
    category: '1. Sınıf Matematik',
    title: '🔢 Ritmik Sayma Şarkısı',
    desc: '10’ar, 5’er ve 2’şer eğlenceli ritmik sayma',
  },
  {
    id: 'libKVRa01L8',
    category: '2. Sınıf Matematik',
    title: '✖️ Çarpım Tablosu Şarkısı',
    desc: '2’ler, 3’ler, 4’ler ve 5’ler ritimli kolay ezber',
  },
  {
    id: 'QdcI5_e-WwU',
    category: 'Hayat Bilgisi',
    title: '🍎 Sağlıklı Yaşam ve Hijyen',
    desc: 'El yıkama, diş fırçalama ve dengeli beslenme',
  },
  {
    id: 'jfKfPfyJRdk',
    category: 'Değerler Eğitimi',
    title: '🤝 Sihirli Nezaket Kelimeleri',
    desc: 'Lütfen, teşekkür ederim, özür dilerim eğitimi',
  },
  {
    id: 'Z1BCujX3pw8',
    category: 'Fen & Deney',
    title: '🧪 TÜBİTAK Meraklı Minik Deneyleri',
    desc: 'İlkokul öğrencileri için güvenli ev/okul deneyleri',
  },
  {
    id: 'zxIpA5nF_LY',
    category: 'İngilizce',
    title: '🇬🇧 Renkler & Sayılar (Colors & Numbers)',
    desc: '1-2. Sınıf eğlenceli İngilizce çocuk şarkısı',
  },
  {
    id: '8y_mY3K7Fvg',
    category: 'Müzik & Hareket',
    title: '🏃‍♂️ Beden Eğitimi & Isınma Dansı',
    desc: 'Sınıfta ve tahta önünde hareketli ritim oyunu',
  },
]

export default function PanoExploreModal({ isOpen, onClose }: PanoExploreModalProps) {
  const [activeView, setActiveView] = useState<ActiveView>('menu')

  // Browser State
  const [urlInput, setUrlInput] = useState('')
  const [currentUrl, setCurrentUrl] = useState('')
  const [browserHistory, setBrowserHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [iframeKey, setIframeKey] = useState(0)

  // YouTube State (In-App Search & 1-2. Sınıf Eğitici Kısayollar)
  const [ytQuery, setYtQuery] = useState('')
  const [ytSearchQuery, setYtSearchQuery] = useState('')
  const [ytVideoId, setYtVideoId] = useState('D0Wp2n0eGjY') // 1. Sınıf Türkçe harf şarkısı

  const navigateTo = (input: string) => {
    let target = input.trim()
    if (!target) return

    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = `https://${target}`
      } else {
        target = `https://www.google.com/search?igu=1&q=${encodeURIComponent(target)}`
      }
    }

    setUrlInput(target)
    setCurrentUrl(target)
    setIframeKey((prev) => prev + 1)

    const nextHistory = [...browserHistory.slice(0, historyIndex + 1), target]
    setBrowserHistory(nextHistory)
    setHistoryIndex(nextHistory.length - 1)
  }

  const handleBrowserBack = () => {
    if (historyIndex > 0) {
      const prev = browserHistory[historyIndex - 1]
      setHistoryIndex(historyIndex - 1)
      setUrlInput(prev)
      setCurrentUrl(prev)
      setIframeKey((k) => k + 1)
    }
  }

  const handleBrowserForward = () => {
    if (historyIndex < browserHistory.length - 1) {
      const next = browserHistory[historyIndex + 1]
      setHistoryIndex(historyIndex + 1)
      setUrlInput(next)
      setCurrentUrl(next)
      setIframeKey((k) => k + 1)
    }
  }

  const handleBrowserHome = () => {
    setCurrentUrl('')
    setUrlInput('')
  }

  const handleBrowserReload = () => {
    setIframeKey((k) => k + 1)
  }

  const handleCloseAll = () => {
    setActiveView('menu')
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        {/* ============================================================ */}
        {/* 1. ANA KEŞFET MENÜSÜ: TARAYICI - YOUTUBE - TV SEÇİMİ         */}
        {/* ============================================================ */}
        {activeView === 'menu' && (
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
            className="relative w-full max-w-4xl rounded-[2.5rem] bg-white/95 dark:bg-[#1A0E24]/95 backdrop-blur-2xl border border-[#8D49A6]/30 dark:border-[#8D49A6]/50 shadow-2xl p-6 sm:p-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#E8DFEB] dark:border-[#3A2942]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8D49A6] to-[#D914C8] text-white flex items-center justify-center shadow-lg shadow-[#D914C8]/25">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#241329] dark:text-white tracking-tight">
                    Oxonom Keşfet & Medya Merkezi
                  </h2>
                  <p className="text-xs sm:text-sm text-[#716779] dark:text-[#C58ADB] mt-0.5">
                    Akıllı tahtada internet tarayıcısı, eğitici YouTube videoları ve okul TV yayını
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseAll}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 dark:bg-[#2D1636] dark:hover:bg-rose-950/60 dark:text-slate-300 dark:hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Main Apps: Tarayıcı - YouTube - TV */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* 1. Tarayıcı (Web Browser) */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveView('browser')
                  handleBrowserHome()
                }}
                className="p-6 rounded-3xl bg-gradient-to-br from-[#F7F0FA] to-white dark:from-[#261533] dark:to-[#1C0E26] border-2 border-[#8D49A6]/30 hover:border-[#8D49A6] dark:border-[#49364F] dark:hover:border-[#D914C8] shadow-md hover:shadow-xl transition-all flex flex-col items-center text-center group cursor-pointer text-left"
              >
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#4B075F] via-[#8D49A6] to-[#D914C8] text-white flex items-center justify-center shadow-lg shadow-[#4B075F]/30 mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-black text-[#241329] dark:text-white tracking-tight">
                  İnternet Tarayıcısı
                </h3>
                <p className="text-xs text-[#716779] dark:text-[#C4B3CD] mt-1.5 leading-relaxed">
                  Google arama motoru, eğitim portalları ve web sitelerini akıllı tahtada açın.
                </p>
                <div className="mt-4 px-3 py-1 rounded-full bg-[#8D49A6]/15 text-[#4B075F] dark:text-[#E9D5FF] text-[11px] font-black flex items-center gap-1">
                  <span>Google ile Ara</span>
                  <ChevronRight size={13} />
                </div>
              </motion.button>

              {/* 2. YouTube */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView('youtube')}
                className="p-6 rounded-3xl bg-gradient-to-br from-[#F7F0FA] to-white dark:from-[#261533] dark:to-[#1C0E26] border-2 border-[#8D49A6]/30 hover:border-red-500 dark:border-[#49364F] dark:hover:border-red-500 shadow-md hover:shadow-xl transition-all flex flex-col items-center text-center group cursor-pointer text-left"
              >
                <div className="w-16 h-16 rounded-3xl bg-white dark:bg-black/50 border border-slate-200 dark:border-slate-800 text-red-600 flex items-center justify-center shadow-lg shadow-red-600/20 mb-4 group-hover:scale-110 transition-transform">
                  <YouTubeIcon className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-black text-[#241329] dark:text-white tracking-tight">
                  YouTube
                </h3>
                <p className="text-xs text-[#716779] dark:text-[#C4B3CD] mt-1.5 leading-relaxed">
                  Ders videoları, bilimsel deneyler ve belgeselleri doğrudan tahtada oynatın.
                </p>
                <div className="mt-4 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[11px] font-black flex items-center gap-1">
                  <span>Videoları Aç</span>
                  <ChevronRight size={13} />
                </div>
              </motion.button>

              {/* 3. TV */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView('tv_coming_soon')}
                className="p-6 rounded-3xl bg-gradient-to-br from-[#F7F0FA] to-white dark:from-[#261533] dark:to-[#1C0E26] border-2 border-[#8D49A6]/30 hover:border-[#D914C8] dark:border-[#49364F] dark:hover:border-[#D914C8] shadow-md hover:shadow-xl transition-all flex flex-col items-center text-center group cursor-pointer text-left"
              >
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#8D49A6] via-[#D914C8] to-[#F17AE6] text-white flex items-center justify-center shadow-lg shadow-[#D914C8]/30 mb-4 group-hover:scale-110 transition-transform">
                  <CuteTvIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-black text-[#241329] dark:text-white tracking-tight">
                  Okul TV
                </h3>
                <p className="text-xs text-[#716779] dark:text-[#C4B3CD] mt-1.5 leading-relaxed">
                  Canlı okul içi yayınlar, teneffüs müzikleri ve eğitici televizyon kanalları.
                </p>
                <div className="mt-4 px-3 py-1 rounded-full bg-[#D914C8]/15 text-[#D914C8] text-[11px] font-black flex items-center gap-1">
                  <span>Canlı Yayın</span>
                  <Sparkles size={13} />
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* 2. İNTERNET TARAYICISI (BROWSER & GOOGLE ARAMA MOTORU)       */}
        {/* ============================================================ */}
        {activeView === 'browser' && (
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="w-full max-w-6xl h-[92vh] flex flex-col rounded-[2rem] bg-white dark:bg-[#1A0E24] border border-[#8D49A6]/40 shadow-2xl overflow-hidden"
          >
            {/* Browser Navigation Toolbar */}
            <div className="px-3 sm:px-5 py-3 bg-[#F7F0FA] dark:bg-[#261533] border-b border-[#E8DFEB] dark:border-[#3A2942] flex items-center justify-between gap-2.5">
              {/* Back / Forward / Refresh / Home buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleBrowserBack}
                  disabled={historyIndex <= 0}
                  className="w-8 h-8 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#514458] dark:text-[#D2C5D8] disabled:opacity-30 cursor-pointer"
                  title="Geri"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleBrowserForward}
                  disabled={historyIndex >= browserHistory.length - 1}
                  className="w-8 h-8 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#514458] dark:text-[#D2C5D8] disabled:opacity-30 cursor-pointer"
                  title="İleri"
                >
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleBrowserReload}
                  className="w-8 h-8 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#514458] dark:text-[#D2C5D8] cursor-pointer"
                  title="Sayfayı Yenile"
                >
                  <RotateCw size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleBrowserHome}
                  className="w-8 h-8 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#514458] dark:text-[#D2C5D8] cursor-pointer"
                  title="Arama Motoru Ana Sayfası"
                >
                  <Home size={16} />
                </button>
              </div>

              {/* URL & Search Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  navigateTo(urlInput)
                }}
                className="flex-1 max-w-2xl relative"
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8D49A6]">
                  <Search size={15} />
                </div>
                <input
                  type="text"
                  placeholder="Google'da arayın veya bir web adresi yazın (örn: eba.gov.tr, wikipedia.org)..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-9 pr-20 py-2 rounded-xl bg-white dark:bg-[#1A0E24] border border-[#D5C5DC] dark:border-[#49364F] text-xs font-semibold text-[#241329] dark:text-white placeholder:text-[#A898B0] focus:outline-none focus:border-[#D914C8]"
                />
                <button
                  type="submit"
                  className="absolute inset-y-1 right-1 px-3 rounded-lg bg-brand-gradient text-white text-[11px] font-black cursor-pointer hover:opacity-90"
                >
                  Ara / Git
                </button>
              </form>

              {/* Actions: Open Tab & Close */}
              <div className="flex items-center gap-1.5">
                {currentUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(currentUrl, '_blank')}
                    className="w-8 h-8 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#514458] dark:text-[#D2C5D8] cursor-pointer"
                    title="Yeni Sekmede Aç"
                  >
                    <ExternalLink size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveView('menu')}
                  className="w-8 h-8 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-center text-slate-500 hover:text-rose-600 cursor-pointer"
                  title="Menüye Dön"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Browser Content Area */}
            <div className="flex-1 bg-[#FCF9FD] dark:bg-[#150B1B] overflow-hidden relative">
              {!currentUrl ? (
                /* Search Engine Homepage (Google-style with Oxonom palette) */
                <div className="h-full w-full flex flex-col items-center justify-center p-6 overflow-y-auto">
                  <div className="w-full max-w-xl text-center space-y-6">
                    {/* Brand / Google Header */}
                    <div className="flex flex-col items-center">
                      <div className="h-12 flex items-center gap-2 mb-2">
                        <span className="text-4xl font-black tracking-tight text-[#4B075F] dark:text-[#F0D8FA]">
                          O<span className="text-red-500">x</span>
                          <span className="text-amber-500">o</span>
                          <span className="text-blue-500">n</span>
                          <span className="text-emerald-500">o</span>
                          <span className="text-[#D914C8]">m</span>
                        </span>
                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#8D49A6]/20 text-[#D914C8] uppercase">
                          Arama
                        </span>
                      </div>
                      <p className="text-xs text-[#716779] dark:text-[#C58ADB]">
                        Eğitim odaklı, güvenli internet arama motoru
                      </p>
                    </div>

                    {/* Central Big Search Box */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        navigateTo(urlInput)
                      }}
                      className="relative w-full shadow-lg rounded-2xl overflow-hidden"
                    >
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8D49A6]">
                        <Search size={18} />
                      </div>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Google'da aramak için bir kelime veya konu yazın..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white dark:bg-[#261533] border-2 border-[#8D49A6]/40 focus:border-[#D914C8] text-sm font-semibold text-[#241329] dark:text-white placeholder:text-[#A898B0] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="absolute inset-y-1.5 right-1.5 px-4 rounded-xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white text-xs font-black shadow-md cursor-pointer hover:brightness-110"
                      >
                        Google'da Ara
                      </button>
                    </form>

                    {/* Educational Shortcuts */}
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-bold text-[#716779] dark:text-[#A898B0] uppercase tracking-wider">
                        Popüler Eğitim Bağlantıları
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {[
                          { name: '📚 EBA (Eğitim Bilişim Ağı)', url: 'https://www.eba.gov.tr' },
                          { name: '🏛️ MEB Resmi Portalı', url: 'https://www.meb.gov.tr' },
                          { name: '🔬 TÜBİTAK Bilim Genç', url: 'https://bilimgenc.tubitak.gov.tr' },
                          { name: '📖 Vikipedi (Türkçe)', url: 'https://tr.wikipedia.org' },
                          { name: '🧪 PhET Simülasyonları', url: 'https://phet.colorado.edu/tr/' },
                        ].map((b) => (
                          <button
                            key={b.name}
                            type="button"
                            onClick={() => navigateTo(b.url)}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#261533] hover:bg-[#F0D8FA] dark:hover:bg-[#350444] border border-[#E8DFEB] dark:border-[#49364F] text-xs font-semibold text-[#4B075F] dark:text-[#E9D5FF] transition-all cursor-pointer shadow-2xs hover:scale-105"
                          >
                            {b.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Live Embedded Web Frame */
                <div className="w-full h-full relative">
                  <iframe
                    key={iframeKey}
                    src={currentUrl}
                    title="İnternet Tarayıcısı"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    className="w-full h-full border-none bg-white"
                  />
                  {/* Floating external open helper bar in case iframe is restricted */}
                  <div className="absolute bottom-3 right-3 z-30">
                    <button
                      type="button"
                      onClick={() => window.open(currentUrl, '_blank')}
                      className="px-3.5 py-2 rounded-xl bg-[#241329]/90 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-xl flex items-center gap-1.5 hover:bg-[#4B075F] cursor-pointer"
                    >
                      <span>Web Sitesini Yeni Sekmede Aç</span>
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* 3. YOUTUBE OYNATICI & EĞİTİCİ İÇERİK PORTALI                */}
        {/* ============================================================ */}
        {activeView === 'youtube' && (
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="w-full max-w-5xl h-[88vh] flex flex-col rounded-[2rem] bg-white dark:bg-[#1A0E24] border border-red-500/40 shadow-2xl overflow-hidden"
          >
            {/* YouTube Toolbar */}
            <div className="px-4 py-3 bg-[#F7F0FA] dark:bg-[#261533] border-b border-[#E8DFEB] dark:border-[#3A2942] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <YouTubeIcon className="w-6 h-6 text-red-600" />
                <span className="font-black text-sm text-[#241329] dark:text-white">
                  YouTube Eğitim
                </span>
              </div>

              {/* YouTube Search Form (In-Modal Search) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (ytQuery.trim()) {
                    setYtSearchQuery(ytQuery.trim())
                  }
                }}
                className="flex-1 max-w-lg relative"
              >
                <input
                  type="text"
                  placeholder="YouTube'da konu veya video arayın..."
                  value={ytQuery}
                  onChange={(e) => setYtQuery(e.target.value)}
                  className="w-full pl-3 pr-20 py-1.5 rounded-xl bg-white dark:bg-[#1A0E24] border border-[#D5C5DC] dark:border-[#49364F] text-xs font-semibold text-[#241329] dark:text-white placeholder:text-[#A898B0] focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="absolute inset-y-1 right-1 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-black cursor-pointer"
                >
                  Ara
                </button>
              </form>

              <button
                type="button"
                onClick={() => setActiveView('menu')}
                className="w-8 h-8 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-center text-slate-500 hover:text-rose-600 cursor-pointer"
                title="Menüye Dön"
              >
                <X size={17} />
              </button>
            </div>

            {/* YouTube Video Player & 1-2. Sınıf Eğitici İçerikler */}
            <div className="flex-1 p-4 overflow-y-auto bg-black flex flex-col items-center justify-between relative">
              <iframe
                src={
                  ytSearchQuery
                    ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(ytSearchQuery)}&autoplay=1&rel=0`
                    : `https://www.youtube.com/embed/${ytVideoId || 'D0Wp2n0eGjY'}?autoplay=1&rel=0`
                }
                title="YouTube Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full max-w-4xl h-[50vh] sm:h-[55vh] rounded-2xl shadow-2xl shrink-0"
              />

              {/* 1. ve 2. Sınıflara Uygun Türkçe Eğitici Video Kısayolları */}
              <div className="w-full max-w-4xl mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-white/90 font-bold px-1">
                  <span>🎯 1. ve 2. Sınıf Eğitici Video Kısayolları</span>
                  {ytSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setYtSearchQuery('')
                        setYtVideoId('D0Wp2n0eGjY')
                      }}
                      className="text-[11px] text-red-400 hover:underline cursor-pointer"
                    >
                      Aramayı Sıfırla & Kısayollara Dön
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FIRST_SECOND_GRADE_VIDEOS.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setYtSearchQuery('')
                        setYtVideoId(v.id)
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                        !ytSearchQuery && ytVideoId === v.id
                          ? 'bg-red-600/40 border-red-500 text-white shadow-md'
                          : 'bg-white/10 hover:bg-white/15 border-white/10 text-slate-200'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-black uppercase text-red-400 block">{v.category}</span>
                        <h4 className="text-xs font-bold text-white line-clamp-1 leading-tight">{v.title}</h4>
                      </div>
                      <span className="text-[10px] text-white/60 line-clamp-1">{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* 4. SEVİMLİ "ÇOK YAKINDA! 📺✨" OKUL TV EKRANI                */}
        {/* ============================================================ */}
        {activeView === 'tv_coming_soon' && (
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            className="relative w-full max-w-lg rounded-[2.5rem] bg-white dark:bg-[#1E1124] border border-[#D914C8]/40 shadow-2xl p-8 text-center overflow-hidden"
          >
            {/* Cute Decorative Ambient Bubbles */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-[#D914C8]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-[#8D49A6]/20 rounded-full blur-2xl pointer-events-none" />

            {/* Animated Bouncy Mascot TV Icon */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
              className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#8D49A6] via-[#D914C8] to-[#F17AE6] text-white flex items-center justify-center shadow-xl shadow-[#D914C8]/30 mb-5 relative"
            >
              <CuteTvIcon className="w-12 h-12 text-white" />
              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-md font-black text-sm"
              >
                ✨
              </motion.div>
            </motion.div>

            {/* Title & Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D914C8]/15 text-[#D914C8] text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles size={13} />
              <span>Çok Yakında!</span>
            </div>

            <h3 className="text-2xl font-black text-[#241329] dark:text-white tracking-tight">
              Oxonom Okul TV
            </h3>

            <p className="text-xs sm:text-sm text-[#716779] dark:text-[#C58ADB] font-medium mt-2.5 leading-relaxed max-w-sm mx-auto">
              Okul içi canlı yayınlar, teneffüs müzik listeleri, ders anlatım kanalları ve okul kutlama yayınları çok yakında akıllı tahtanızda yayında olacak! 📺🎉
            </p>

            {/* Action Button */}
            <div className="mt-7">
              <button
                type="button"
                onClick={() => setActiveView('menu')}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 active:scale-98 text-white font-black text-sm shadow-lg shadow-[#D914C8]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Harika, Heyecanla Bekliyoruz! ✨</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  )
}
