// apps/web/app/superadmin/gamestudio/page.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gamepad2,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  GraduationCap,
  Users,
  Flame,
  Star,
  ExternalLink,
  Layers,
  Clock,
  Tag,
  AlertTriangle,
  X,
  Save,
  Image as ImageIcon,
  LayoutGrid,
  List,
  RotateCcw,
  CheckSquare,
  Square,
  Broom,
  Globe,
  Code2,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import {
  EducationalGame,
  getAllGames,
  saveAllGames,
  upsertGame,
  deleteGame,
  toggleGameStatus,
  purgeMockupGames,
  resetToDefaultGames,
  OBSOLETE_MOCKUP_IDS,
  ALL_GRADE_OPTIONS,
  ALL_SUBJECT_OPTIONS,
  ALL_CATEGORIES,
} from '@/lib/gamestudio/gameStorage'

const SAMPLE_COVERS = [
  { label: '2048 Mantık', url: '/games/2048-sayi-mantik-bulmacasi.png' },
  { label: 'Hafıza Kartları', url: '/games/hafiza-kartlari-ciftini-bul.png' },
  { label: 'Kelime Avcısı', url: '/games/kelime-avcisi-harf-cozucu.png' },
  { label: 'Orbit Gezegen', url: '/games/orbit.png' },
  { label: 'Matematik & Uzay', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Sayı Kaşifleri', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
  { label: 'Kodlama & Siber', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Zeka & Nöro', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80' },
]

export default function SuperadminGameStudioPage() {
  const [games, setGames] = useState<EducationalGame[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'passive'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modal & Dialog States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<Partial<EducationalGame> | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [purgeConfirmOpen, setPurgeConfirmOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  // Form Fields State
  const [formTitle, setFormTitle] = useState('')
  const [formCover, setFormCover] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formShortDesc, setFormShortDesc] = useState('')
  const [formCategory, setFormCategory] = useState<EducationalGame['category']>('Matematik')
  const [formGameType, setFormGameType] = useState<EducationalGame['gameType']>('2D Arcade')
  const [formGrades, setFormGrades] = useState<string[]>([])
  const [formSubjects, setFormSubjects] = useState<string[]>([])
  const [formTopics, setFormTopics] = useState('')
  const [formAgeRange, setFormAgeRange] = useState('8 - 14 Yaş')
  const [formDifficulty, setFormDifficulty] = useState<EducationalGame['difficulty']>('Orta')
  const [formIsActive, setFormIsActive] = useState(true)
  const [formGameUrl, setFormGameUrl] = useState('')
  const [formBadge, setFormBadge] = useState('Yeni')

  const refreshGames = () => {
    setGames(getAllGames())
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
  }, [])

  // Check how many obsolete mockups exist in current list
  const obsoleteMockupCount = useMemo(() => {
    return games.filter((g) => OBSOLETE_MOCKUP_IDS.includes(g.id)).length
  }, [games])

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingGame(null)
    setFormTitle('')
    setFormCover(SAMPLE_COVERS[0].url)
    setFormDescription('')
    setFormShortDesc('')
    setFormCategory('Zeka & Mantık')
    setFormGameType('Bulmaca')
    setFormGrades(['3. Sınıf', '4. Sınıf', '5. Sınıf'])
    setFormSubjects(['Matematik', 'Mantık & Zeka'])
    setFormTopics('Mantık Yürütme, Strateji')
    setFormAgeRange('8 - 14 Yaş')
    setFormDifficulty('Orta')
    setFormIsActive(true)
    setFormGameUrl('/games/2048-sayi-mantik-bulmacasi.html')
    setFormBadge('Yeni')
    setIsModalOpen(true)
  }

  // Quick Preset Handlers in Modal
  const handleApplyPreset = (type: 'html5' | 'external') => {
    if (type === 'html5') {
      setFormCategory('Zeka & Mantık')
      setFormGameType('Bulmaca')
      setFormGameUrl('/games/hafiza-kartlari-ciftini-bul.html')
      setFormCover('/games/hafiza-kartlari-ciftini-bul.png')
      setFormBadge('HTML5 Oyun')
    } else {
      setFormGameUrl('https://example.com/games/custom-game')
      setFormBadge('Web Oyunu')
    }
    toast.success('Şablon değerleri forma dolduruldu.')
  }

  // Open Edit Modal
  const handleOpenEditModal = (game: EducationalGame) => {
    setEditingGame(game)
    setFormTitle(game.title)
    setFormCover(game.coverImage)
    setFormDescription(game.description)
    setFormShortDesc(game.shortDescription)
    setFormCategory(game.category)
    setFormGameType(game.gameType)
    setFormGrades(game.targetGrades)
    setFormSubjects(game.subjects)
    setFormTopics(game.topics.join(', '))
    setFormAgeRange(game.ageRange)
    setFormDifficulty(game.difficulty)
    setFormIsActive(game.isActive)
    setFormGameUrl(game.gameUrl)
    setFormBadge(game.badge || '')
    setIsModalOpen(true)
  }

  // Save Game
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      toast.error('Lütfen oyun adını giriniz.')
      return
    }

    const topicsArray = formTopics
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload: Partial<EducationalGame> & { title: string } = {
      ...(editingGame?.id ? { id: editingGame.id } : {}),
      title: formTitle,
      coverImage: formCover,
      description: formDescription,
      shortDescription: formShortDesc || formDescription.slice(0, 100),
      category: formCategory,
      gameType: formGameType,
      targetGrades: formGrades.length > 0 ? formGrades : ['5. Sınıf'],
      subjects: formSubjects.length > 0 ? formSubjects : ['Matematik'],
      topics: topicsArray.length > 0 ? topicsArray : ['Genel'],
      ageRange: formAgeRange,
      difficulty: formDifficulty,
      isActive: formIsActive,
      gameUrl: formGameUrl || `/student/gamestudio/play/${editingGame?.id || 'game-custom'}`,
      badge: formBadge,
    }

    upsertGame(payload)
    toast.success(editingGame ? 'Oyun başarıyla güncellendi!' : 'Yeni oyun başarıyla eklendi!')
    setIsModalOpen(false)
    refreshGames()
  }

  // Toggle Grade selection in modal
  const toggleGrade = (grade: string) => {
    if (formGrades.includes(grade)) {
      setFormGrades(formGrades.filter((g) => g !== grade))
    } else {
      setFormGrades([...formGrades, grade])
    }
  }

  // Toggle Subject selection in modal
  const toggleSubject = (subj: string) => {
    if (formSubjects.includes(subj)) {
      setFormSubjects(formSubjects.filter((s) => s !== subj))
    } else {
      setFormSubjects([...formSubjects, subj])
    }
  }

  // Handle Quick Toggle Status
  const handleToggleActive = (id: string) => {
    const res = toggleGameStatus(id)
    if (res) {
      setGames((prev) =>
        prev.map((g) => (g.id === id ? { ...g, isActive: res.isActive } : g))
      )
      toast.success(
        res.isActive
          ? `"${res.title}" AKTİF edildi (Öğrenci & Öğretmen görebilir).`
          : `"${res.title}" PASİF yapıldı (Mağazadan gizlendi).`,
        { icon: res.isActive ? '🟢' : '⚪' }
      )
    }
  }

  // Handle Delete (Permanent & Instant)
  const handleDelete = (id: string) => {
    deleteGame(id)
    setGames((prev) => prev.filter((g) => g.id !== id))
    setSelectedIds((prev) => prev.filter((item) => item !== id))
    setDeleteConfirmId(null)
    toast.success('Oyun sistemden ve mağazadan kalıcı olarak silindi.', { icon: '🗑️' })
  }

  // Handle Bulk Delete
  const handleBulkDelete = () => {
    selectedIds.forEach((id) => deleteGame(id))
    setGames((prev) => prev.filter((g) => !selectedIds.includes(g.id)))
    toast.success(`${selectedIds.length} adet oyun kalıcı olarak silindi.`, { icon: '🗑️' })
    setSelectedIds([])
    setBulkDeleteConfirmOpen(false)
  }

  // Handle Bulk Status Change
  const handleBulkToggleStatus = (active: boolean) => {
    const updated = games.map((g) => {
      if (selectedIds.includes(g.id)) {
        return { ...g, isActive: active }
      }
      return g
    })
    saveAllGames(updated)
    setGames(updated)
    toast.success(`${selectedIds.length} oyun ${active ? 'aktif' : 'pasif'} duruma getirildi.`)
  }

  // Handle Purge All Mockup Games
  const handlePurgeMockups = () => {
    const count = purgeMockupGames()
    setGames(getAllGames())
    setSelectedIds([])
    setPurgeConfirmOpen(false)
    toast.success(
      count > 0
        ? `${count} adet çalışmayan mockup oyun başarıyla temizlendi!`
        : 'Tüm mockup oyunlar zaten temizlenmiş.',
      { icon: '🧹' }
    )
  }

  // Handle Reset to Verified Default Games
  const handleResetDefaults = () => {
    resetToDefaultGames()
    setGames(getAllGames())
    setSelectedIds([])
    setResetConfirmOpen(false)
    toast.success('Katalog doğrulanmış 6 çalışan ana oyuna sıfırlandı.', { icon: '🎮' })
  }

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredGames.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredGames.map((g) => g.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  // Helper to determine game engine badge
  const getGameEngineBadge = (game: EducationalGame) => {
    if (game.id === 'sayi-kasifleri' || game.gameUrl.includes('sayi-kasifleri')) {
      return { label: 'Yerleşik React Motoru', icon: Code2, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
    }
    if (game.gameUrl.includes('.html') || game.gameUrl.startsWith('/games/')) {
      return { label: 'HTML5 Web Oyunu', icon: Globe, color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' }
    }
    return { label: 'Harici URL Bağlantısı', icon: ExternalLink, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
  }

  // Filtered games
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchesSearch =
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = categoryFilter === 'all' || g.category === categoryFilter
      const matchesGrade = gradeFilter === 'all' || g.targetGrades.includes(gradeFilter)
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? g.isActive : !g.isActive)

      return matchesSearch && matchesCategory && matchesGrade && matchesStatus
    })
  }, [games, searchQuery, categoryFilter, gradeFilter, statusFilter])

  // Statistics
  const totalGames = games.length
  const activeGames = games.filter((g) => g.isActive).length
  const passiveGames = totalGames - activeGames
  const totalPlays = games.reduce((acc, curr) => acc + (curr.playsCount || 0), 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 font-jakarta select-none">
      <Toaster position="top-right" />

      {/* ── HEADER BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#211729] via-[#2F143D] to-[#1A0E24] border border-[#49364F] p-6 lg:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D914C8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#D914C8] flex items-center gap-1.5">
                <Sparkles size={14} />
                Süper Admin Paneli
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#45C7A2]/20 text-[#45C7A2] border border-[#45C7A2]/30">
                Canlı Katalog Yönetimi
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Game Studio Yönetim Merkezi
            </h1>
            <p className="text-xs sm:text-sm text-[#C4B3CD] mt-1 max-w-2xl">
              Öğrencilerin oynayabileceği eğitici oyunları yönetin. İstenmeyen veya çalışmayan oyunları
              kalıcı olarak silin, yeni HTML5/Web oyunları ekleyin veya yayın durumlarını anında değiştirin.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {obsoleteMockupCount > 0 && (
              <button
                type="button"
                onClick={() => setPurgeConfirmOpen(true)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer shadow-md"
                title="Çalışmayan eski mockup oyunları sistemden tek tıkla sil"
              >
                <Broom size={16} className="text-amber-300" />
                <span>Mockup&apos;ları Temizle ({obsoleteMockupCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[#2B1D36] hover:bg-[#3D264E] text-[#E0D0E8] border border-[#49364F] text-xs font-bold transition-all cursor-pointer"
              title="Katalogu çalışan 6 ana oyuna sıfırla"
            >
              <RotateCcw size={15} />
              <span>Varsayılanları Geri Yükle</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-[#D914C8]/30 transition-all cursor-pointer shrink-0"
            >
              <Plus size={18} />
              <span>Yeni Oyun Ekle</span>
            </button>
          </div>
        </div>

        {/* ── METRIC STATS TILES ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#49364F]/60">
          <div className="p-3.5 rounded-2xl bg-[#17101C]/60 border border-[#3A2942]">
            <div className="text-[11px] text-[#A898B0] font-semibold flex items-center gap-1.5">
              <Gamepad2 size={14} className="text-[#D914C8]" />
              Toplam Oyun
            </div>
            <div className="text-2xl font-black text-white mt-1">{totalGames}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#17101C]/60 border border-[#3A2942]">
            <div className="text-[11px] text-[#A898B0] font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#45C7A2]" />
              Aktif Yayında
            </div>
            <div className="text-2xl font-black text-[#45C7A2] mt-1">{activeGames}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#17101C]/60 border border-[#3A2942]">
            <div className="text-[11px] text-[#A898B0] font-semibold flex items-center gap-1.5">
              <XCircle size={14} className="text-[#B5A5BD]" />
              Pasif / Gizli
            </div>
            <div className="text-2xl font-black text-[#B5A5BD] mt-1">{passiveGames}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#17101C]/60 border border-[#3A2942]">
            <div className="text-[11px] text-[#A898B0] font-semibold flex items-center gap-1.5">
              <Flame size={14} className="text-[#FF9D42]" />
              Toplam Oynanma
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {totalPlays.toLocaleString('tr-TR')}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOCKUP ALERT NOTICE (IF DETECTED) ── */}
      {obsoleteMockupCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                Sistemde {obsoleteMockupCount} Adet Çalışmayan Mockup Oyun Tespit Edildi
              </h4>
              <p className="text-xs text-amber-300/80">
                Bu oyunlar tıklandığında sahte puan simülasyonu gösterir, gerçek oynanışı yoktur.
                Tek tıkla kalıcı olarak silebilirsiniz.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPurgeConfirmOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors shrink-0 shadow cursor-pointer"
          >
            Hemen Temizle
          </button>
        </div>
      )}

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div className="p-4 rounded-2xl bg-[#1E1426] border border-[#3A2942] flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A898B0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Oyun adı, ders veya konu ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#17101C] border border-[#49364F] text-xs sm:text-sm text-white placeholder-[#716779] focus:outline-none focus:border-[#D914C8]"
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-[#E0D0E8] focus:outline-none focus:border-[#D914C8]"
          >
            <option value="all">Tüm Kategoriler</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-[#E0D0E8] focus:outline-none focus:border-[#D914C8]"
          >
            <option value="all">Tüm Sınıflar</option>
            {ALL_GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-[#E0D0E8] focus:outline-none focus:border-[#D914C8]"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Sadece Aktifler</option>
            <option value="passive">Sadece Pasifler</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-[#17101C] border border-[#49364F] p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Kart (Grid) Görünümü"
              className={`p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white shadow'
                  : 'text-[#A898B0] hover:text-white'
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Tablo Görünümü"
              className={`p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white shadow'
                  : 'text-[#A898B0] hover:text-white'
              }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── SELECT ALL HEADER BAR ── */}
      {filteredGames.length > 0 && (
        <div className="flex items-center justify-between px-2 text-xs text-[#A898B0]">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-2 font-bold hover:text-white transition-colors cursor-pointer"
          >
            {selectedIds.length === filteredGames.length && filteredGames.length > 0 ? (
              <CheckSquare size={16} className="text-[#D914C8]" />
            ) : (
              <Square size={16} />
            )}
            <span>
              {selectedIds.length === filteredGames.length && filteredGames.length > 0
                ? 'Tümünün Seçimini Kaldır'
                : `Tümünü Seç (${filteredGames.length} Oyun)`}
            </span>
          </button>

          <span className="text-[11px] text-[#716779]">
            {filteredGames.length} oyun listeleniyor
          </span>
        </div>
      )}

      {/* ── CATALOG LISTING ── */}
      {filteredGames.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#1E1426] border border-[#3A2942] space-y-3">
          <Gamepad2 size={48} className="mx-auto text-[#716779]" />
          <h3 className="text-base font-bold text-white">Eşleşen oyun bulunamadı</h3>
          <p className="text-xs text-[#A898B0] max-w-sm mx-auto">
            Filtreleme kriterlerini sıfırlayabilir veya üstteki &quot;Yeni Oyun Ekle&quot; düğmesiyle katalogunuza oyun ekleyebilirsiniz.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── GRID CARDS VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGames.map((game) => {
            const engineBadge = getGameEngineBadge(game)
            const isSelected = selectedIds.includes(game.id)
            const EngineIcon = engineBadge.icon

            return (
              <motion.div
                key={game.id}
                layout
                className={`rounded-3xl border overflow-hidden transition-all flex flex-col justify-between shadow-lg relative ${
                  isSelected
                    ? 'bg-[#2A1633] border-[#D914C8] ring-2 ring-[#D914C8]/50'
                    : game.isActive
                    ? 'bg-[#1E1426] border-[#3A2942] hover:border-[#8D49A6]'
                    : 'bg-[#17101C]/80 border-[#2D2035] opacity-75'
                }`}
              >
                <div>
                  {/* Card Cover & Overlays */}
                  <div className="relative h-44 w-full bg-[#17101C] overflow-hidden group">
                    <img
                      src={game.coverImage}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E1426] via-transparent to-black/60" />

                    {/* Top Row: Checkbox + Category + Status */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSelectOne(game.id)
                        }}
                        className="p-1 rounded-lg bg-black/60 backdrop-blur-md text-white hover:text-[#D914C8] transition-colors cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare size={18} className="text-[#D914C8]" />
                        ) : (
                          <Square size={18} className="text-white/80" />
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-black uppercase text-[#FCE8FA] border border-white/15">
                          {game.category}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(game.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer ${
                            game.isActive
                              ? 'bg-[#45C7A2]/20 text-[#45C7A2] border border-[#45C7A2]/40'
                              : 'bg-[#2E1829] text-[#E0D0E8] border border-[#8D2B60]/40'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              game.isActive ? 'bg-[#45C7A2]' : 'bg-gray-500'
                            }`}
                          />
                          <span>{game.isActive ? 'Aktif' : 'Pasif'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Image Info */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-1 font-bold bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-white/10">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span>{game.rating}</span>
                        <span className="text-[10px] text-gray-400">({game.reviewCount})</span>
                      </div>
                      <div className="text-[10px] font-mono text-gray-300 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-white/10">
                        {game.playsCount.toLocaleString('tr-TR')} oynama
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <div>
                      {/* Engine Badge */}
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border mb-1.5 border-opacity-50">
                        <EngineIcon size={12} />
                        <span>{engineBadge.label}</span>
                      </div>

                      <h3 className="font-black text-base text-white line-clamp-1">{game.title}</h3>
                      <p className="text-xs text-[#A898B0] line-clamp-2 mt-1 leading-relaxed">
                        {game.description}
                      </p>
                    </div>

                    {/* Target Grades */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-[#C4B3CD]">
                        <GraduationCap size={13} className="text-[#D914C8] shrink-0" />
                        <span className="font-semibold">Hitap Ettiği Sınıflar:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {game.targetGrades.map((grade) => (
                          <span
                            key={grade}
                            className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[#2B1D36] text-[#E0D0E8] border border-[#49364F]"
                          >
                            {grade}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Target Subjects */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center gap-1 text-[11px] text-[#C4B3CD]">
                        <BookOpen size={13} className="text-[#8D49A6] shrink-0" />
                        <span className="font-semibold">Dersler & Konular:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {game.subjects.map((subj) => (
                          <span
                            key={subj}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#4B075F]/40 text-[#FCE8FA] border border-[#8D49A6]/40"
                          >
                            {subj}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-[#17101C]/90 border-t border-[#3A2942] flex items-center justify-between gap-2">
                  <a
                    href={`/student/gamestudio/play/${game.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2B1D36] hover:bg-[#3D264E] text-xs font-bold text-white border border-[#49364F] transition-colors"
                  >
                    <Eye size={13} />
                    <span>Önizle / Oyna</span>
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(game)}
                      className="p-2 rounded-xl bg-[#2B1D36] hover:bg-[#4B075F] text-[#F0D8FA] border border-[#49364F] transition-colors cursor-pointer"
                      title="Oyunu Düzenle"
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(game.id)}
                      className="p-2 rounded-xl bg-[#2E1829] hover:bg-red-900/50 text-[#FFA8D8] hover:text-red-300 border border-[#8D2B60]/40 transition-colors cursor-pointer"
                      title="Oyunu Kalıcı Olarak Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        /* ── DENSE TABLE VIEW ── */
        <div className="rounded-3xl bg-[#1E1426] border border-[#3A2942] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#E0D0E8]">
              <thead className="bg-[#17101C] text-[11px] font-bold text-[#A898B0] border-b border-[#3A2942]">
                <tr>
                  <th className="p-4 w-10">
                    <button type="button" onClick={toggleSelectAll} className="cursor-pointer">
                      {selectedIds.length === filteredGames.length && filteredGames.length > 0 ? (
                        <CheckSquare size={16} className="text-[#D914C8]" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Oyun</th>
                  <th className="p-4">Kategori & Motor</th>
                  <th className="p-4">Hedef Sınıflar</th>
                  <th className="p-4">Puan & Oynanma</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A2942]/60">
                {filteredGames.map((game) => {
                  const engineBadge = getGameEngineBadge(game)
                  const isSelected = selectedIds.includes(game.id)
                  const EngineIcon = engineBadge.icon

                  return (
                    <tr
                      key={game.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isSelected ? 'bg-[#2A1633]/60' : ''
                      }`}
                    >
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(game.id)}
                          className="cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-[#D914C8]" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>

                      {/* Game Title & Cover */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={game.coverImage}
                            alt={game.title}
                            className="w-12 h-12 rounded-xl object-cover border border-[#49364F] shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-sm text-white">{game.title}</div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {game.slug || game.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Engine */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[#4B075F]/40 text-[#FCE8FA] text-[10px] font-bold border border-[#8D49A6]/40">
                            {game.category}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <EngineIcon size={12} className="shrink-0" />
                            <span>{engineBadge.label}</span>
                          </div>
                        </div>
                      </td>

                      {/* Target Grades */}
                      <td className="p-4 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {game.targetGrades.slice(0, 3).map((tg) => (
                            <span
                              key={tg}
                              className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#2B1D36] text-[#E0D0E8] border border-[#49364F]"
                            >
                              {tg}
                            </span>
                          ))}
                          {game.targetGrades.length > 3 && (
                            <span className="text-[9px] text-gray-400">
                              +{game.targetGrades.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star size={12} fill="currentColor" />
                          <span>{game.rating}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {game.playsCount.toLocaleString('tr-TR')} oynama
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(game.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 cursor-pointer ${
                            game.isActive
                              ? 'bg-[#45C7A2]/20 text-[#45C7A2] border border-[#45C7A2]/40'
                              : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              game.isActive ? 'bg-[#45C7A2]' : 'bg-gray-500'
                            }`}
                          />
                          <span>{game.isActive ? 'Aktif' : 'Pasif'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/student/gamestudio/play/${game.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-[#2B1D36] hover:bg-[#3D264E] text-white border border-[#49364F] transition-colors"
                            title="Önizle"
                          >
                            <Eye size={14} />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(game)}
                            className="p-2 rounded-xl bg-[#2B1D36] hover:bg-[#4B075F] text-[#F0D8FA] border border-[#49364F] transition-colors cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(game.id)}
                            className="p-2 rounded-xl bg-[#2E1829] hover:bg-red-900/50 text-[#FFA8D8] hover:text-red-300 border border-[#8D2B60]/40 transition-colors cursor-pointer"
                            title="Kalıcı Olarak Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── FLOATING BULK ACTIONS BAR ── */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-5 py-3 rounded-2xl bg-[#1E1426]/95 backdrop-blur-md border border-[#D914C8]/60 shadow-2xl flex items-center gap-3 text-xs"
          >
            <span className="font-bold text-white pr-2 border-r border-[#3A2942]">
              {selectedIds.length} oyun seçildi
            </span>

            <button
              type="button"
              onClick={() => handleBulkToggleStatus(true)}
              className="px-3 py-1.5 rounded-xl bg-[#45C7A2]/20 hover:bg-[#45C7A2]/30 text-[#45C7A2] border border-[#45C7A2]/40 font-bold transition-all cursor-pointer"
            >
              Toplu Aktif Yap
            </button>

            <button
              type="button"
              onClick={() => handleBulkToggleStatus(false)}
              className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 font-bold transition-all cursor-pointer"
            >
              Toplu Pasif Yap
            </button>

            <button
              type="button"
              onClick={() => setBulkDeleteConfirmOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-md shadow-red-600/30 cursor-pointer flex items-center gap-1"
            >
              <Trash2 size={14} />
              <span>Seçilenleri Sil ({selectedIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Seçimi İptal Et"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SINGLE DELETE CONFIRMATION DIALOG ── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#211729] border border-red-500/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Oyunu Kalıcı Olarak Sil?</h3>
                <p className="text-xs text-[#A898B0] mt-1">
                  Bu işlem oyunu sistemden, Game Studio mağazasından ve öğrenci/öğretmen ekranlarından kalıcı olarak kaldıracaktır.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2D2035] text-[#D2C5D8] text-xs font-bold hover:bg-[#3D264E] transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  Evet, Kalıcı Sil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── BULK DELETE CONFIRMATION DIALOG ── */}
      <AnimatePresence>
        {bulkDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#211729] border border-red-500/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  {selectedIds.length} Oyunu Silmek İstiyor musunuz?
                </h3>
                <p className="text-xs text-[#A898B0] mt-1">
                  Seçilen tüm oyunlar kalıcı olarak silinecektir.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkDeleteConfirmOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2D2035] text-[#D2C5D8] text-xs font-bold hover:bg-[#3D264E] transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  Hepsini Sil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PURGE MOCKUPS CONFIRMATION DIALOG ── */}
      <AnimatePresence>
        {purgeConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#211729] border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto border border-amber-500/30">
                <Broom size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  Çalışmayan Mockup Oyunları Temizle?
                </h3>
                <p className="text-xs text-[#A898B0] mt-1 leading-relaxed">
                  Gerçek oynanışı olmayan 7 adet eski mockup oyun (Matematik Şampiyonu, Uzay Laboratuvarı, Siber Labirent vb.)
                  sistemden ve öğrenci mağazasından kalıcı olarak temizlenecektir.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPurgeConfirmOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2D2035] text-[#D2C5D8] text-xs font-bold hover:bg-[#3D264E] transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handlePurgeMockups}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-colors shadow-lg cursor-pointer"
                >
                  Temizle & Kaldır
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── RESET TO DEFAULTS CONFIRMATION DIALOG ── */}
      <AnimatePresence>
        {resetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#211729] border border-[#8D49A6] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#D914C8]/20 text-[#D914C8] flex items-center justify-center mx-auto border border-[#D914C8]/30">
                <RotateCcw size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Katalogu Sıfırla?</h3>
                <p className="text-xs text-[#A898B0] mt-1 leading-relaxed">
                  Katalog, doğrulanmış 6 çalışan ana oyuna (Sayı Kaşifleri, 2048, Hafıza Kartları, Kelime Avcısı, Orbit, Uzay Roketi) sıfırlanacaktır.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetConfirmOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2D2035] text-[#D2C5D8] text-xs font-bold hover:bg-[#3D264E] transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white text-xs font-black transition-all shadow-md shadow-[#D914C8]/30 cursor-pointer"
                >
                  Sıfırla
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD / EDIT GAME MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#211729] border border-[#49364F] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl my-8 relative"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#3A2942] mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D914C8] to-[#4B075F] text-white flex items-center justify-center">
                    <Gamepad2 size={20} />
                  </div>
                  <div>
                    <h2 className="font-black text-lg text-white">
                      {editingGame ? 'Oyunu Düzenle' : 'Yeni Oyun Ekle'}
                    </h2>
                    <p className="text-xs text-[#A898B0]">
                      Kapak görseli, sınıf seviyeleri ve ders eşleştirmeleri
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-[#A898B0] hover:text-white hover:bg-[#2D2035] cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick Template Buttons */}
              {!editingGame && (
                <div className="p-3 rounded-2xl bg-[#17101C] border border-[#3A2942] flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] font-bold text-gray-300">Hızlı Şablon Seçimi:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('html5')}
                      className="px-3 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-500/30 text-xs font-bold transition-colors cursor-pointer"
                    >
                      🎮 HTML5 Oyun Şablonu
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('external')}
                      className="px-3 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 text-xs font-bold transition-colors cursor-pointer"
                    >
                      🔗 Harici Web Oyunu
                    </button>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-[#E0D0E8] mb-1.5">
                    Oyun Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Örn: 2048 Mantık Bulmacası"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#17101C] border border-[#49364F] text-xs sm:text-sm text-white focus:outline-none focus:border-[#D914C8]"
                  />
                </div>

                {/* Cover Image URL & Sample Picker */}
                <div>
                  <label className="block text-xs font-bold text-[#E0D0E8] mb-1.5">
                    Kapak Görseli URL&apos;si
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formCover}
                      onChange={(e) => setFormCover(e.target.value)}
                      placeholder="/games/2048-sayi-mantik-bulmacasi.png veya https://..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-white focus:outline-none focus:border-[#D914C8]"
                    />
                    {formCover && (
                      <div className="w-11 h-10 rounded-xl overflow-hidden shrink-0 border border-[#49364F] bg-black/40">
                        <img src={formCover} alt="Önizleme" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  {/* Preset quick chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-[#A898B0]">Hazır Kapaklar:</span>
                    {SAMPLE_COVERS.map((sc) => (
                      <button
                        key={sc.label}
                        type="button"
                        onClick={() => setFormCover(sc.url)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#2B1D36] text-[#E0D0E8] hover:bg-[#4B075F] border border-[#49364F] transition-colors cursor-pointer"
                      >
                        {sc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-[#E0D0E8] mb-1.5">
                    Açıklama (Detaylı Bilgi & Pedagojik Hedef)
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Oyunun hikayesi, oynanışı ve öğrencilere kazandırdığı beceriler..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-white focus:outline-none focus:border-[#D914C8]"
                  />
                </div>

                {/* Category & Game Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#E0D0E8] mb-1.5">Kategori</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-white focus:outline-none focus:border-[#D914C8]"
                    >
                      {ALL_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#E0D0E8] mb-1.5">Oyun Türü</label>
                    <select
                      value={formGameType}
                      onChange={(e) => setFormGameType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-white focus:outline-none focus:border-[#D914C8]"
                    >
                      <option value="2D Arcade">2D Arcade</option>
                      <option value="Bulmaca">Bulmaca</option>
                      <option value="Strateji">Strateji</option>
                      <option value="Simülasyon">Simülasyon</option>
                      <option value="Macera">Macera</option>
                      <option value="Hızlı Refleks">Hızlı Refleks</option>
                    </select>
                  </div>
                </div>

                {/* Target Grades (Multi-select) */}
                <div>
                  <label className="block text-xs font-bold text-[#E0D0E8] mb-1.5">
                    Hitap Ettiği Sınıflar (Birden Fazla Seçilebilir)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {ALL_GRADE_OPTIONS.map((g) => {
                      const isSelected = formGrades.includes(g)
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => toggleGrade(g)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#D914C8]/30 border-[#D914C8] text-white shadow-sm'
                              : 'bg-[#17101C] border-[#3A2942] text-[#A898B0] hover:text-white'
                          }`}
                        >
                          {g}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Related Subjects (Multi-select) */}
                <div>
                  <label className="block text-xs font-bold text-[#E0D0E8] mb-1.5">
                    Hangi Derslerle Alakalı?
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_SUBJECT_OPTIONS.map((s) => {
                      const isSelected = formSubjects.includes(s)
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSubject(s)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#8D49A6] border-[#D914C8] text-white'
                              : 'bg-[#17101C] border-[#3A2942] text-[#A898B0] hover:text-white'
                          }`}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Topics, Age Range & Difficulty */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#E0D0E8] mb-1.5">
                      Konular (Virgülle Ayırın)
                    </label>
                    <input
                      type="text"
                      value={formTopics}
                      onChange={(e) => setFormTopics(e.target.value)}
                      placeholder="Dört İşlem, Geometri"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-white focus:outline-none focus:border-[#D914C8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#E0D0E8] mb-1.5">
                      Yaş Aralığı
                    </label>
                    <input
                      type="text"
                      value={formAgeRange}
                      onChange={(e) => setFormAgeRange(e.target.value)}
                      placeholder="8 - 14 Yaş"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-white focus:outline-none focus:border-[#D914C8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#E0D0E8] mb-1.5">
                      Zorluk Seviyesi
                    </label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-white focus:outline-none focus:border-[#D914C8]"
                    >
                      <option value="Başlangıç">Başlangıç</option>
                      <option value="Orta">Orta</option>
                      <option value="İleri">İleri</option>
                      <option value="Dinamik Adaptif">Dinamik Adaptif</option>
                    </select>
                  </div>
                </div>

                {/* Game Launch URL & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#E0D0E8]">
                        Oyun Başlatma Yolu / URL *
                      </label>
                      {formGameUrl && (
                        <a
                          href={formGameUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-[#D914C8] hover:underline flex items-center gap-1"
                        >
                          <span>Test Et</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={formGameUrl}
                      onChange={(e) => setFormGameUrl(e.target.value)}
                      placeholder="/games/2048-sayi-mantik-bulmacasi.html"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-white focus:outline-none focus:border-[#D914C8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#E0D0E8] mb-1.5">
                      Öne Çıkan Rozet
                    </label>
                    <input
                      type="text"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      placeholder="Editörün Seçimi, Yeni, Popüler..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-white focus:outline-none focus:border-[#D914C8]"
                    />
                  </div>
                </div>

                {/* Active Switch */}
                <div className="p-3.5 rounded-2xl bg-[#17101C] border border-[#3A2942] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Genel Yayın Durumu</div>
                    <div className="text-[11px] text-[#A898B0]">
                      Aktif yapıldığında mağazada ve sınıf yetkisi olan kullanıcılarda görünür
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      formIsActive ? 'bg-[#45C7A2]' : 'bg-[#49364F]'
                    }`}
                  >
                    <motion.div
                      animate={{ x: formIsActive ? 26 : 2 }}
                      className="w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5"
                    />
                  </button>
                </div>

                {/* Buttons */}
                <div className="pt-3 border-t border-[#3A2942] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#2D2035] text-[#D2C5D8] text-xs font-bold hover:bg-[#3D264E] transition-colors cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-[#D914C8]/30 transition-all cursor-pointer"
                  >
                    <Save size={16} />
                    <span>{editingGame ? 'Güncellemeleri Kaydet' : 'Oyunu Sisteme Ekle'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
