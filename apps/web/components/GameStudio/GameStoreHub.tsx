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
  userGrade = '9-A',
  backPath = role === 'student' ? '/student/dashboard' : '/teacher/dashboard',
}: GameStoreHubProps) {
  const [games, setGames] = useState<EducationalGame[]>([])
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
    return games.filter((g) => g.badge || g.rating >= 4.8).slice(0, 4)
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
    <div className="space-y-8 pb-16 font-jakarta selection:bg-[#D914C8]/30 selection:text-white">
      {/* ── STORE HEADER & SEARCH ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D914C8] to-[#4B075F] flex items-center justify-center text-white shadow-md shadow-[#D914C8]/25">
              <Gamepad2 size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Oxonom Game Studio
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#D914C8]/20 text-[#FCE8FA] border border-[#D914C8]/30">
              Eğitici Oyun Mağazası
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#B5A5BD]">
            {role === 'student'
              ? `${userGrade} müfredatına özel seçilmiş eğlenceli ve öğretici oyunlar.`
              : 'Öğrencileriniz için ders kazanımlı, müfredata entegre oyun kütüphanesi.'}
          </p>
        </div>

        {/* Search & Mobile Filter Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A898B0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Oyun, ders veya konu ara..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1E1426] border border-[#3A2942] text-xs sm:text-sm text-white placeholder-[#716779] focus:outline-none focus:border-[#D914C8] shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A898B0] hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isFilterOpen || selectedGrade !== 'all' || selectedSubject !== 'all'
                ? 'bg-[#4B075F] border-[#D914C8] text-white'
                : 'bg-[#1E1426] border-[#3A2942] text-[#D2C5D8] hover:text-white'
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

      {/* ── SPOTLIGHT HERO CAROUSEL (PLAY STORE / APP STORE STYLE) ── */}
      {featuredGames.length > 0 && (
        <div className="relative rounded-3xl overflow-hidden border border-[#49364F]/80 shadow-2xl bg-[#17101C]">
          <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {featuredGames.map((game, idx) => {
                if (idx !== heroIndex) return null
                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute inset-0"
                  >
                    <img
                      src={game.bannerImage || game.coverImage}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#110B17] via-[#110B17]/60 to-black/30" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#110B17]/90 via-[#110B17]/40 to-transparent" />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-6 sm:p-8 md:p-10 flex flex-col justify-end max-w-2xl space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {game.badge && (
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg">
                            {game.badge}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-xs font-bold text-[#FCE8FA] border border-white/10">
                          {game.category}
                        </span>
                        <span className="text-[10px] sm:text-xs font-semibold text-[#C4B3CD] flex items-center gap-1">
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          <span>{game.rating}</span>
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                        {game.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-[#D2C5D8] line-clamp-2 max-w-xl leading-relaxed">
                        {game.description}
                      </p>

                      <div className="flex items-center gap-3 pt-2">
                        <Link
                          href={`${playRoutePrefix}/${game.id}`}
                          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-[#D914C8]/30 transition-all cursor-pointer group"
                        >
                          <Play size={16} className="fill-white group-hover:scale-110 transition-transform" />
                          <span>Hemen Oyna</span>
                        </Link>

                        <button
                          onClick={() => setSelectedGame(game)}
                          className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/15 transition-all cursor-pointer"
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
            <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-20">
              {featuredGames.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === heroIndex ? 'w-8 bg-[#D914C8]' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORY QUICK CHIPS (HORIZONTAL SCROLLABLE ON MOBILE) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
        {['Tümü', ...ALL_CATEGORIES].map((cat) => {
          const isSelected = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white shadow-lg shadow-[#D914C8]/25 scale-105'
                  : 'bg-[#1E1426] text-[#A898B0] hover:text-white hover:bg-[#2B1D36] border border-[#3A2942]'
              }`}
            >
              {cat === 'Tümü' ? '🌟 Tümü' : cat}
            </button>
          )
        })}
      </div>

      {/* ── TOP CHARTS: EN ÇOK OYNANANLAR ── */}
      {activeCategory === 'Tümü' && searchQuery === '' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-[#FF9D42]" />
              <h3 className="text-lg font-black text-white">Trend Olanlar</h3>
            </div>
            <span className="text-xs text-[#A898B0]">Bu hafta en çok oynananlar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.slice(0, 3).map((game, idx) => (
              <motion.div
                key={game.id}
                whileHover={{ y: -4 }}
                className="p-3.5 rounded-2xl bg-[#1E1426] border border-[#3A2942] hover:border-[#8D49A6] transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-xl text-[#716779] w-5 text-center">
                    #{idx + 1}
                  </span>
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#49364F]">
                    <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-[#D914C8] transition-colors">
                      {game.title}
                    </h4>
                    <div className="text-[11px] text-[#A898B0] flex items-center gap-2 mt-0.5">
                      <span>{game.category}</span>
                      <span>•</span>
                      <span className="flex items-center text-yellow-400">
                        <Star size={10} className="fill-yellow-400 mr-0.5" />
                        {game.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`${playRoutePrefix}/${game.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2B1D36] hover:bg-[#D914C8] text-white text-xs font-bold transition-all border border-[#49364F] shrink-0"
                >
                  Oyna
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN GAMES GRID ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#D914C8]" />
            <h3 className="text-lg font-black text-white">
              {activeCategory === 'Tümü' ? 'Tüm Eğitici Oyunlar' : `${activeCategory} Oyunları`}
            </h3>
            <span className="text-xs text-[#A898B0]">({filteredGames.length} Oyun)</span>
          </div>
        </div>

        {filteredGames.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#1E1426] border border-[#3A2942]">
            <Gamepad2 size={40} className="mx-auto text-[#716779] mb-3" />
            <h3 className="text-base font-bold text-white">Seçilen kriterlerde oyun bulunamadı</h3>
            <p className="text-xs text-[#A898B0] mt-1">
              Filtreleri temizleyerek diğer kategorilere göz atabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredGames.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl bg-[#1E1426] border border-[#3A2942] hover:border-[#8D49A6] overflow-hidden flex flex-col justify-between shadow-lg shadow-black/40 group"
              >
                <div>
                  {/* Card Image */}
                  <div className="relative h-44 w-full bg-[#17101C] overflow-hidden">
                    <img
                      src={game.coverImage}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E1426] via-transparent to-black/40" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[9px] font-black uppercase text-[#FCE8FA] border border-white/10">
                        {game.category}
                      </span>
                      {game.badge && (
                        <span className="px-2 py-0.5 rounded-lg bg-[#D914C8] text-white text-[9px] font-black uppercase tracking-wider shadow">
                          {game.badge}
                        </span>
                      )}
                    </div>

                    {/* Floating Play Button on Hover */}
                    <Link
                      href={`${playRoutePrefix}/${game.id}`}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D914C8] to-[#8D49A6] flex items-center justify-center text-white shadow-xl shadow-[#D914C8]/50 transform scale-75 group-hover:scale-100 transition-transform">
                        <Play size={20} className="fill-white translate-x-0.5" />
                      </div>
                    </Link>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#A898B0]">
                      <span className="flex items-center gap-1 font-bold text-white">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        {game.rating}
                      </span>
                      <span className="text-[10px] font-mono">
                        {game.playsCount.toLocaleString('tr-TR')} oynama
                      </span>
                    </div>

                    <h4 className="font-black text-sm text-white line-clamp-1 group-hover:text-[#D914C8] transition-colors">
                      {game.title}
                    </h4>

                    <p className="text-xs text-[#A898B0] line-clamp-2 leading-relaxed">
                      {game.shortDescription}
                    </p>

                    {/* Class & Subject Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {game.targetGrades.slice(0, 2).map((tg) => (
                        <span
                          key={tg}
                          className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-[#2B1D36] text-[#E0D0E8] border border-[#49364F]"
                        >
                          {tg}
                        </span>
                      ))}
                      {game.targetGrades.length > 2 && (
                        <span className="text-[9px] text-[#A898B0] px-1 py-0.2">
                          +{game.targetGrades.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-3.5 bg-[#17101C]/80 border-t border-[#3A2942] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedGame(game)}
                    className="text-[11px] font-bold text-[#A898B0] hover:text-white transition-colors cursor-pointer"
                  >
                    Detaylar
                  </button>

                  <Link
                    href={`${playRoutePrefix}/${game.id}`}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white font-extrabold text-xs shadow-md shadow-[#D914C8]/25 transition-all"
                  >
                    <Play size={12} className="fill-white" />
                    <span>Oyna</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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
