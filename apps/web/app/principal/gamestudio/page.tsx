// apps/web/app/principal/gamestudio/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Gamepad2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Users,
  GraduationCap,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
  Sliders,
  Check,
  Building2,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import {
  EducationalGame,
  getAllGames,
  getPrincipalConfigs,
  setPrincipalGameConfig,
  PrincipalGameConfig,
  ALL_GRADE_OPTIONS,
} from '@/lib/gamestudio/gameStorage'

const SCHOOL_CLASSES = [
  'Tüm Sınıflar',
  '9-A (Ali Yağız DEMİREL)',
  '9-B',
  '10-A',
  '10-B',
  '11-A',
  '12-A',
  '5. Sınıf',
  '6. Sınıf',
  '7. Sınıf',
  '8. Sınıf',
]

export default function PrincipalGameStudioPage() {
  const [games, setGames] = useState<EducationalGame[]>([])
  const [configs, setConfigs] = useState<Record<string, PrincipalGameConfig>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'passive'>('all')

  const refreshData = () => {
    setGames(getAllGames())
    setConfigs(getPrincipalConfigs())
  }

  useEffect(() => {
    refreshData()
    const handleUpdate = () => refreshData()
    window.addEventListener('oxonom_games_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('oxonom_games_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  // Toggle school-level active status
  const handleToggleSchoolActive = (gameId: string) => {
    const currentConf = configs[gameId]
    const currentActive = currentConf ? currentConf.schoolActive : true
    const assigned = currentConf?.assignedGrades || ['Tüm Sınıflar']

    const nextActive = !currentActive
    setPrincipalGameConfig(gameId, nextActive, assigned)
    setConfigs(getPrincipalConfigs())

    toast.success(
      nextActive
        ? 'Oyun okuldaki izinli sınıflar için AKTİF edildi.'
        : 'Oyun kurumda PASİF yapıldı (Öğrencilerden gizlendi).',
      { icon: nextActive ? '🟢' : '⚪' }
    )
  }

  // Toggle class assignment
  const handleToggleClass = (gameId: string, className: string) => {
    const currentConf = configs[gameId]
    const schoolActive = currentConf ? currentConf.schoolActive : true
    let assigned = currentConf?.assignedGrades ? [...currentConf.assignedGrades] : ['Tüm Sınıflar']

    if (className === 'Tüm Sınıflar') {
      assigned = ['Tüm Sınıflar']
    } else {
      // Remove 'Tüm Sınıflar' if selecting a specific class
      assigned = assigned.filter((c) => c !== 'Tüm Sınıflar')
      if (assigned.includes(className)) {
        assigned = assigned.filter((c) => c !== className)
        if (assigned.length === 0) assigned = ['Tüm Sınıflar']
      } else {
        assigned.push(className)
      }
    }

    setPrincipalGameConfig(gameId, schoolActive, assigned)
    setConfigs(getPrincipalConfigs())
    toast.success(`Sınıf izinleri güncellendi: ${assigned.join(', ')}`)
  }

  // Quick reset all games to all classes
  const handleAllowAllClasses = (gameId: string) => {
    const currentConf = configs[gameId]
    const schoolActive = currentConf ? currentConf.schoolActive : true
    setPrincipalGameConfig(gameId, schoolActive, ['Tüm Sınıflar'])
    setConfigs(getPrincipalConfigs())
    toast.success('Oyun tüm şube ve sınıflara açıldı!')
  }

  const filteredGames = games.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

    const pConf = configs[g.id]
    const isSchoolActive = pConf ? pConf.schoolActive : true
    const matchesStatus =
      statusFilter === 'all' || (statusFilter === 'active' ? isSchoolActive : !isSchoolActive)

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" />

      {/* ── HEADER BANNER ── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#F7F0FA] via-[#F0D8FA] to-white dark:from-[#211729] dark:via-[#2F143D] dark:to-[#1A0E24] border border-[#E8DFEB] dark:border-[#49364F] p-6 lg:p-8 shadow-sm dark:shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8D49A6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#D914C8] flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Müdürlük İdari Yetkileri
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8D49A6]/15 dark:bg-[#8D49A6]/30 text-[#4B075F] dark:text-[#FCE8FA] border border-[#8D49A6]/30 dark:border-[#8D49A6]/40">
                Sınıf & Oyun Matrisi
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#241329] dark:text-white tracking-tight">
              Game Studio Sınıf İzinleri & Yönetimi
            </h1>
            <p className="text-xs sm:text-sm text-[#716779] dark:text-[#C4B3CD] mt-1 max-w-2xl leading-relaxed">
              Superadmin tarafından yüklenen eğitici oyunların kurumunuzda hangi sınıflarda (örn: 9-A, 10-B veya Tüm Sınıflar)
              görüneceğini belirleyin, okul geneli erişimi anında aktif veya pasif yapın.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-[#17101C]/80 border border-[#E8DFEB] dark:border-[#49364F] text-xs shadow-xs">
              <div className="text-[10px] text-[#716779] dark:text-[#A898B0]">Yetkili Kurum</div>
              <div className="font-bold text-[#241329] dark:text-white flex items-center gap-1.5 mt-0.5">
                <Building2 size={13} className="text-[#D914C8]" />
                <span>Oxonom Okulları</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1426] border border-[#E8DFEB] dark:border-[#3A2942] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-xs">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#716779] dark:text-[#A898B0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Oyun adı, kategori veya ders ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#49364F] text-xs sm:text-sm text-[#241329] dark:text-white placeholder-[#716779] focus:outline-none focus:border-[#D914C8]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#49364F] text-xs text-[#241329] dark:text-[#E0D0E8] focus:outline-none focus:border-[#D914C8]"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Okulda Aktif Oyunlar</option>
            <option value="passive">Okulda Pasif Oyunlar</option>
          </select>
        </div>
      </div>

      {/* ── GAMES PERMISSIONS LIST ── */}
      <div className="space-y-4">
        {filteredGames.map((game) => {
          const pConf = configs[game.id]
          const isSchoolActive = pConf ? pConf.schoolActive : true
          const assignedClasses = pConf?.assignedGrades || ['Tüm Sınıflar']
          const isAllClasses = assignedClasses.includes('Tüm Sınıflar')

          return (
            <motion.div
              key={game.id}
              layout
              className={`rounded-3xl border p-5 transition-all shadow-xs ${
                isSchoolActive
                  ? 'bg-white dark:bg-[#1E1426] border-[#E8DFEB] dark:border-[#3A2942] hover:border-[#8D49A6]'
                  : 'bg-[#F7F0FA]/80 dark:bg-[#17101C]/80 border-[#E8DFEB] dark:border-[#2D2035] opacity-75'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Left: Game Info */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-[#E8DFEB] dark:border-[#49364F] relative group bg-[#F7F0FA] dark:bg-black/20">
                    <img
                      src={game.coverImage}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {!isSchoolActive && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-black text-red-400">
                        PASİF
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-[#F0D8FA] dark:bg-[#4B075F]/40 text-[#4B075F] dark:text-[#FCE8FA] text-[10px] font-bold border border-[#8D49A6]/20 dark:border-[#8D49A6]/40">
                        {game.category}
                      </span>
                      <span className="text-xs text-[#716779] dark:text-[#A898B0]">
                        {game.subjects.join(', ')}
                      </span>
                    </div>

                    <h3 className="font-black text-base sm:text-lg text-[#241329] dark:text-white">
                      {game.title}
                    </h3>
                    <p className="text-xs text-[#716779] dark:text-[#A898B0] line-clamp-1 max-w-xl">
                      {game.shortDescription}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-[#716779] dark:text-[#C4B3CD] pt-1">
                      <span>Önerilen: <strong className="text-[#241329] dark:text-white">{game.targetGrades.join(', ')}</strong></span>
                      <span>•</span>
                      <span>Yaş: <strong className="text-[#241329] dark:text-white">{game.ageRange}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right: Master Active/Passive Switch */}
                <div className="flex items-center gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#E8DFEB] dark:border-[#3A2942] justify-between lg:justify-end">
                  <div className="text-left lg:text-right">
                    <div className="text-xs font-bold text-[#241329] dark:text-white">
                      {isSchoolActive ? 'Okulda Yayında' : 'Okulda Pasif'}
                    </div>
                    <div className="text-[10px] text-[#716779] dark:text-[#A898B0]">
                      {isSchoolActive ? 'Öğrenci & Öğretmen görebilir' : 'Tüm sınıflardan gizlendi'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleSchoolActive(game.id)}
                    className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      isSchoolActive ? 'bg-[#16805D] dark:bg-[#45C7A2]' : 'bg-[#D5C5DC] dark:bg-[#49364F]'
                    }`}
                  >
                    <motion.div
                      animate={{ x: isSchoolActive ? 30 : 2 }}
                      className="w-6 h-6 rounded-full bg-white shadow-md absolute top-0.5"
                    />
                  </button>
                </div>
              </div>

              {/* Class Assignment Selector */}
              {isSchoolActive && (
                <div className="mt-5 pt-4 border-t border-[#E8DFEB] dark:border-[#3A2942]/80 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#4B075F] dark:text-[#E0D0E8]">
                      <GraduationCap size={15} className="text-[#D914C8]" />
                      <span>Bu Oyunu Görebilecek Sınıflar & Şubeler:</span>
                    </div>

                    <button
                      onClick={() => handleAllowAllClasses(game.id)}
                      className="text-[11px] text-[#D914C8] hover:text-[#FFA8D8] font-semibold transition-colors text-left cursor-pointer"
                    >
                      ⚡ Tüm Sınıflara Aç
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {SCHOOL_CLASSES.map((cls) => {
                      const isSelected = isAllClasses
                        ? cls === 'Tüm Sınıflar'
                        : assignedClasses.includes(cls)

                      return (
                        <button
                          key={cls}
                          onClick={() => handleToggleClass(game.id, cls)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#4B075F] to-[#8D49A6] border-[#D914C8] text-white shadow-xs'
                              : 'bg-[#F7F0FA] dark:bg-[#17101C] border-[#E8DFEB] dark:border-[#3A2942] text-[#716779] dark:text-[#A898B0] hover:text-[#241329] dark:hover:text-white hover:border-[#8D49A6]'
                          }`}
                        >
                          {isSelected && <Check size={12} className="text-[#16805D] dark:text-[#45C7A2]" />}
                          <span>{cls}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
