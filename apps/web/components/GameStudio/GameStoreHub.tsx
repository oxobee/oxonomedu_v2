// apps/web/components/GameStudio/GameStoreHub.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gamepad2,
  Sparkles,
  Flame,
  Star,
  Search,
  Filter,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Play,
  Share2,
  ChevronRight,
  ChevronLeft,
  X,
  Clock,
  Layers,
  Award,
  Zap,
  Tag,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import {
  EducationalGame,
  getAvailableGamesForRole,
  ALL_GRADE_OPTIONS,
  ALL_SUBJECT_OPTIONS,
  ALL_CATEGORIES,
} from '@/lib/gamestudio/gameStorage'

interface GameStoreHubProps {
  role: 'student' | 'teacher'
  userGrade?: string
  backPath?: string
}

export default function GameStoreHub({
  role,
  userGrade = '1/A',
  backPath = role === 'student' ? '/student/dashboard' : '/teacher/dashboard',
}: GameStoreHubProps) {
  const [games, setGames] = useState<EducationalGame[]>(() => {
    return getAvailableGamesForRole(role, userGrade)
  })
  const [selectedGame, setSelectedGame] = useState<EducationalGame | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('Tümü')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedAge, setSelectedAge] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular')
  const [heroIndex, setHeroIndex] = useState(0)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const refreshGames = () => {
    const list = getAvailableGamesForRole(role, userGrade)
    setGames(list)
  }

  useEffect(() => {
    refreshGames()
    const handleUpdate = () => refreshGames()
    window.addEventListener('oxonom_games_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('oxonom_games_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [role, userGrade])

  // Featured Spotlight Games (Hero Banner)
  const featuredGames = useMemo(() => {
    const spotlights = games.filter((g) => g.badge || g.rating >= 4.8)
    return spotlights.length > 0 ? spotlights.slice(0, 4) : games.slice(0, 4)
  }, [games])

  // Hero Auto Rotation
  useEffect(() => {
    if (featuredGames.length <= 1) return
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % featuredGames.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [featuredGames])

  // Filter and Sort Games
  const filteredGames = useMemo(() => {
    return games
      .filter((g) => {
        const matchesCategory =
          activeCategory === 'Tümü' || g.category === activeCategory

        const matchesSearch =
          searchQuery.trim() === '' ||
          g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          g.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesGrade =
          selectedGrade === 'all' ||
          g.targetGrades.includes(selectedGrade) ||
          g.targetGrades.includes('Tüm Sınıflar')

        const matchesSubject =
          selectedSubject === 'all' || g.subjects.includes(selectedSubject)

        const matchesAge =
          selectedAge === 'all' || g.ageRange.includes(selectedAge)

        return matchesCategory && matchesSearch && matchesGrade && matchesSubject && matchesAge
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return (b.playsCount || 0) - (a.playsCount || 0)
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
        if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt)
        return 0
      })
  }, [games, activeCategory, searchQuery, selectedGrade, selectedSubject, selectedAge, sortBy])

  const playRoutePrefix = role === 'student' ? '/student/gamestudio/play' : '/teacher/gamestudio/play'

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-[1520px] mx-auto space-y-8 pb-20 font-jakarta selection:bg-[#D914C8]/30 selection:text-white select-none">
      {/* ── STORE HEADER & SEARCH ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D914C8] to-[#4B075F] flex items-center justify-center text-white shadow-md shadow-[#D914C8]/25">
              <Gamepad2 size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#241329] dark:text-white tracking-tight">
              Oxonom Game Studio
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#D914C8]/15 dark:bg-[#D914C8]/25 text-[#D914C8] dark:text-[#FCE8FA] border border-[#D914C8]/30">
              Eğitici Oyun Mağazası
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#716779] dark:text-[#B5A5BD]">
            {role === 'student'
              ? `${userGrade} müfredatına özel seçilmiş eğlenceli ve öğretici oyunlar.`
              : 'Öğrencileriniz için ders kazanımlı, müfredata entegre oyun kütüphanesi.'}
          </p>
        </div>

        {/* Search & Mobile Filter Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Oyun, ders veya konu ara..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1D172A] border border-white/10 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-hidden focus:border-[#D914C8] shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
              isFilterOpen || selectedGrade !== 'all' || selectedSubject !== 'all'
                ? 'bg-[#4B075F] border-[#D914C8] text-white'
                : 'bg-[#1D172A] border-white/10 text-gray-300 hover:text-white'
            }`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filtreler</span>
          </button>
        </div>
      </div>

      {/* ── EXPANDABLE FILTER DRAWER ── */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-3xl bg-[#1E1426] border border-[#3A2942] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              {/* Sınıf Filtresi */}
              <div>
                <label className="block text-[11px] font-bold text-[#A898B0] mb-1">
                  Hitap Ettiği Sınıf
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-white focus:outline-none focus:border-[#D914C8]"
                >
                  <option value="all">Tüm Sınıflar</option>
                  {ALL_GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ders Filtresi */}
              <div>
                <label className="block text-[11px] font-bold text-[#A898B0] mb-1">
                  İlgili Ders
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-white focus:outline-none focus:border-[#D914C8]"
                >
                  <option value="all">Tüm Dersler</option>
                  {ALL_SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Yaş Aralığı */}
              <div>
                <label className="block text-[11px] font-bold text-[#A898B0] mb-1">
                  Yaş Grubu
                </label>
                <select
                  value={selectedAge}
                  onChange={(e) => setSelectedAge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-white focus:outline-none focus:border-[#D914C8]"
                >
                  <option value="all">Tüm Yaşlar</option>
                  <option value="7">7 - 9 Yaş</option>
                  <option value="10">10 - 12 Yaş</option>
                  <option value="13">13 - 15 Yaş</option>
                  <option value="16">16+ Yaş</option>
                </select>
              </div>

              {/* Sıralama */}
              <div>
                <label className="block text-[11px] font-bold text-[#A898B0] mb-1">
                  Sıralama Ölçütü
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-white focus:outline-none focus:border-[#D914C8]"
                >
                  <option value="popular">En Çok Oynananlar (Popüler)</option>
                  <option value="rating">En Yüksek Puanlılar (Yıldız)</option>
                  <option value="newest">En Yeni Eklenenler</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SPOTLIGHT HERO CAROUSEL (EXACT SCREENSHOT STYLE) ── */}
      {featuredGames.length > 0 && (
        <section className="relative w-full rounded-3xl lg:rounded-[32px] overflow-hidden bg-[#161224] border border-[#312547]/60 shadow-2xl transition-all">
          <div className="relative min-h-[380px] sm:min-h-[440px] lg:min-h-[460px] w-full flex items-center overflow-hidden">
            <AnimatePresence mode="wait">
              {featuredGames.map((game, idx) => {
                if (idx !== heroIndex) return null
                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute inset-0 flex items-center"
                  >
                    <img
                      src={game.bannerImage || game.coverImage}
                      alt={game.title}
                      className="absolute inset-0 w-full h-full object-cover object-right"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#161224] via-[#161224]/85 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161224] via-transparent to-transparent sm:hidden" />

                    {/* Content Overlay */}
                    <div className="relative z-10 w-full max-w-2xl p-6 sm:p-10 lg:p-12 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#D914C8] to-[#9B1BBF] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-[#D914C8]/30">
                          {game.badge || 'EDİTÖRÜN SEÇİMİ'}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold border border-white/15 backdrop-blur-xs">
                          {game.category}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-black/60 text-amber-300 text-xs font-extrabold border border-white/15 backdrop-blur-xs flex items-center gap-1">
                          <Star size={12} fill="currentColor" />
                          <span>{game.rating}</span>
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                        {game.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl drop-shadow-xs line-clamp-3">
                        {game.description}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <Link
                          href={`${playRoutePrefix}/${game.id}`}
                          className="h-12 px-7 rounded-2xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white font-black text-sm flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#D914C8]/30 cursor-pointer group"
                        >
                          <Play size={16} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                          <span>Hemen Oyna</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setSelectedGame(game)}
                          className="h-12 px-6 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm flex items-center gap-2 backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                        >
                          Detayları İncele
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Carousel Navigation Indicators */}
            <div className="absolute bottom-6 right-6 sm:right-10 z-20 flex items-center gap-1.5">
              {featuredGames.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setHeroIndex(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === heroIndex ? 'w-6 bg-[#D914C8]' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CATEGORY QUICK CHIPS (MATCHING SCREENSHOT) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
        {['Tümü', ...ALL_CATEGORIES].map((cat) => {
          const isSelected = activeCategory === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white font-black shadow-lg shadow-[#D914C8]/30 scale-102'
                  : 'bg-[#1C152B] hover:bg-[#281F3D] text-gray-200 border border-white/10'
              }`}
            >
              {cat === 'Tümü' ? '👑 Tümü' : cat}
            </button>
          )
        })}
      </div>

      {/* ── TOP CHARTS: EN ÇOK OYNANANLAR (MATCHING SCREENSHOT) ── */}
      {activeCategory === 'Tümü' && searchQuery === '' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-[#D914C8]" />
              <h3 className="text-base sm:text-lg font-black text-[#241329] dark:text-white">Trend Olanlar</h3>
            </div>
            <span className="text-xs text-[#716779] dark:text-gray-400">Bu hafta en çok oynananlar</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {games.slice(0, 3).map((game, idx) => (
              <motion.div
                key={game.id}
                whileHover={{ y: -2 }}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#1C152B] border border-white/10 hover:border-[#D914C8]/60 transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-[#D914C8]/10"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="text-sm font-black text-gray-400 font-mono">#{idx + 1}</span>
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    className="w-13 h-13 rounded-xl object-cover shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-black text-white truncate group-hover:text-[#F0D8FA] transition-colors">
                      {game.title}
                    </h4>
                    <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <span>{game.category}</span>
                      <span>•</span>
                      <span className="flex items-center text-amber-300 font-bold">
                        <Star size={10} className="fill-amber-300 mr-0.5" />
                        {game.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`${playRoutePrefix}/${game.id}`}
                  className="h-8 px-4 rounded-full bg-white/10 group-hover:bg-gradient-to-r group-hover:from-[#D914C8] group-hover:to-[#8D49A6] text-white font-extrabold text-xs transition-all shrink-0 border border-white/15 flex items-center justify-center"
                >
                  Oyna
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── MAIN GAMES GRID (MATCHING SCREENSHOT) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#D914C8]" />
            <h3 className="text-base sm:text-lg font-black text-[#241329] dark:text-white">
              {activeCategory === 'Tümü' ? 'Tüm Eğitici Oyunlar' : `${activeCategory} Oyunları`}
            </h3>
            <span className="text-xs text-[#716779] dark:text-gray-400">({filteredGames.length} Oyun)</span>
          </div>
        </div>

        {filteredGames.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#1C152B] border border-white/10">
            <Gamepad2 size={40} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-base font-bold text-white">Seçilen kriterlerde oyun bulunamadı</h3>
            <p className="text-xs text-gray-400 mt-1">
              Filtreleri temizleyerek diğer kategorilere göz atabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredGames.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl bg-[#161224] border border-white/10 hover:border-[#D914C8]/80 overflow-hidden flex flex-col justify-between shadow-lg shadow-black/40 group transition-all"
              >
                <div>
                  {/* Card Image */}
                  <div className="relative aspect-[16/10] w-full bg-[#0E0917] overflow-hidden">
                    <img
                      src={game.coverImage}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161224] via-transparent to-black/40" />

                    {/* Top Badges (Matching Screenshot: Left Category + Right Highlight) */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[9px] font-black uppercase text-gray-200 border border-white/15">
                        {game.category}
                      </span>
                      {game.badge && (
                        <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white text-[9px] font-black uppercase tracking-wider shadow-md">
                          {game.badge}
                        </span>
                      )}
                    </div>

                    {/* Floating Play Button on Hover */}
                    <Link
                      href={`${playRoutePrefix}/${game.id}`}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer z-10"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#D914C8] to-[#8D49A6] flex items-center justify-center text-white shadow-xl shadow-[#D914C8]/50 transform scale-75 group-hover:scale-100 transition-transform">
                        <Play size={20} fill="currentColor" className="ml-0.5" />
                      </div>
                    </Link>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="flex items-center gap-1 font-bold text-amber-300">
                        <Star size={11} fill="currentColor" />
                        {game.rating}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {game.playsCount.toLocaleString('tr-TR')} oynama
                      </span>
                    </div>

                    <h4 className="font-black text-sm text-white line-clamp-1 group-hover:text-[#F0D8FA] transition-colors">
                      {game.title}
                    </h4>

                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                      {game.shortDescription}
                    </p>

                    {/* Class & Subject Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {game.targetGrades.slice(0, 2).map((tg) => (
                        <span
                          key={tg}
                          className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10"
                        >
                          {tg}
                        </span>
                      ))}
                      {game.targetGrades.length > 2 && (
                        <span className="text-[9px] text-gray-400 px-1 py-0.5">
                          +{game.targetGrades.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-3.5 bg-black/30 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGame(game)}
                    className="text-[11px] font-bold text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Detaylar
                  </button>

                  <Link
                    href={`${playRoutePrefix}/${game.id}`}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white font-extrabold text-xs shadow-md shadow-[#D914C8]/25 transition-all"
                  >
                    <Play size={12} fill="currentColor" />
                    <span>Oyna</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── GAME DETAIL SHEET / MODAL (APP STORE PRODUCT PAGE STYLE) ── */}
      <AnimatePresence>
        {selectedGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1E1426] border border-[#49364F] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 relative"
            >
              {/* Top Banner Cover */}
              <div className="relative h-52 sm:h-64 w-full bg-[#17101C]">
                <img
                  src={selectedGame.bannerImage || selectedGame.coverImage}
                  alt={selectedGame.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E1426] via-[#1E1426]/50 to-transparent" />

                <button
                  onClick={() => setSelectedGame(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8 space-y-5 -mt-12 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#3A2942]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#4B075F] text-[#FCE8FA] text-[10px] font-bold border border-[#8D49A6]">
                        {selectedGame.category}
                      </span>
                      <span className="text-xs text-[#A898B0]">v{selectedGame.version}</span>
                    </div>
                    <h2 className="text-2xl font-black text-white leading-tight">
                      {selectedGame.title}
                    </h2>
                    <p className="text-xs text-[#A898B0] mt-0.5">
                      Geliştirici: <strong className="text-white">{selectedGame.developer}</strong>
                    </p>
                  </div>

                  <Link
                    href={`${playRoutePrefix}/${selectedGame.id}`}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white font-extrabold text-sm shadow-xl shadow-[#D914C8]/30 transition-all cursor-pointer shrink-0"
                  >
                    <Play size={16} className="fill-white" />
                    <span>HEMEN OYNA</span>
                  </Link>
                </div>

                {/* Rating & Stats Strip */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#17101C] border border-[#3A2942] text-center">
                  <div>
                    <div className="text-[10px] text-[#A898B0]">Puan</div>
                    <div className="text-sm font-black text-white flex items-center justify-center gap-1 mt-0.5">
                      <Star size={13} className="text-yellow-400 fill-yellow-400" />
                      <span>{selectedGame.rating}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#A898B0]">Yaş Uygunluğu</div>
                    <div className="text-sm font-black text-white mt-0.5">
                      {selectedGame.ageRange}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#A898B0]">Oynanma Sayısı</div>
                    <div className="text-sm font-black text-[#45C7A2] mt-0.5">
                      {selectedGame.playsCount.toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-[#D2C5D8] tracking-wider mb-1.5">
                    Oyun Açıklaması & Konsept
                  </h4>
                  <p className="text-xs text-[#C4B3CD] leading-relaxed">
                    {selectedGame.description}
                  </p>
                </div>

                {/* Educational Learning Objectives */}
                {selectedGame.learningObjectives && selectedGame.learningObjectives.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#D2C5D8] tracking-wider mb-2 flex items-center gap-1.5">
                      <Award size={14} className="text-[#D914C8]" />
                      <span>Kazanımlar & Pedagojik Beceriler</span>
                    </h4>
                    <div className="space-y-1.5">
                      {selectedGame.learningObjectives.map((obj, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#E0D0E8]">
                          <CheckCircle2 size={14} className="text-[#45C7A2] shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Classes & Subjects */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="text-[11px] font-bold text-[#A898B0] mb-1">
                      Hitap Ettiği Sınıflar:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedGame.targetGrades.map((tg) => (
                        <span
                          key={tg}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#2B1D36] text-[#E0D0E8] border border-[#49364F]"
                        >
                          {tg}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-[#A898B0] mb-1">İlgili Dersler:</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedGame.subjects.map((sub) => (
                        <span
                          key={sub}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#4B075F]/40 text-[#FCE8FA] border border-[#8D49A6]/40"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
