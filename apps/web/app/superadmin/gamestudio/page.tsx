// apps/web/app/superadmin/gamestudio/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import {
  EducationalGame,
  getAllGames,
  saveAllGames,
  upsertGame,
  deleteGame,
  toggleGameStatus,
  ALL_GRADE_OPTIONS,
  ALL_SUBJECT_OPTIONS,
  ALL_CATEGORIES,
} from '@/lib/gamestudio/gameStorage'

const SAMPLE_COVERS = [
  { label: 'Matematik & Uzay', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Fen & Atom', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' },
  { label: 'Kodlama & Siber', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Türkçe & Kitap', url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80' },
  { label: 'İngilizce Dil', url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Tarih & Keşif', url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80' },
  { label: 'Zeka & Nöro', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80' },
]

export default function SuperadminGameStudioPage() {
  const [games, setGames] = useState<EducationalGame[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'passive'>('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<Partial<EducationalGame> | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

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

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingGame(null)
    setFormTitle('')
    setFormCover(SAMPLE_COVERS[0].url)
    setFormDescription('')
    setFormShortDesc('')
    setFormCategory('Matematik')
    setFormGameType('2D Arcade')
    setFormGrades(['5. Sınıf', '6. Sınıf'])
    setFormSubjects(['Matematik'])
    setFormTopics('Dört İşlem, Geometri')
    setFormAgeRange('10 - 14 Yaş')
    setFormDifficulty('Orta')
    setFormIsActive(true)
    setFormGameUrl('/student/gamestudio/play/new-game')
    setFormBadge('Yeni')
    setIsModalOpen(true)
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
      toast.success(
        res.isActive
          ? `"${res.title}" AKTİF edildi (Öğrenci & Öğretmen görebilir).`
          : `"${res.title}" PASİF yapıldı (Mağazadan gizlendi).`,
        { icon: res.isActive ? '🟢' : '⚪' }
      )
      refreshGames()
    }
  }

  // Handle Delete
  const handleDelete = (id: string) => {
    deleteGame(id)
    setDeleteConfirmId(null)
    toast.success('Oyun sistemden ve mağazadan silindi.')
    refreshGames()
  }

  // Filtered games
  const filteredGames = games.filter((g) => {
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

  // Statistics
  const totalGames = games.length
  const activeGames = games.filter((g) => g.isActive).length
  const passiveGames = totalGames - activeGames
  const totalPlays = games.reduce((acc, curr) => acc + (curr.playsCount || 0), 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
                Canlı Katalog
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Game Studio Yönetimi
            </h1>
            <p className="text-xs sm:text-sm text-[#C4B3CD] mt-1 max-w-2xl">
              Öğrenci ve öğretmenlerin oynayabileceği eğitici oyunları yükleyin, kapak görsellerini,
              ders ve sınıf eşleştirmelerini güncelleyin veya anında aktif/pasif yapın.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#D914C8]/30 transition-all cursor-pointer shrink-0"
          >
            <Plus size={18} />
            <span>Yeni Oyun Ekle</span>
          </button>
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
              Aktif Mağazada
            </div>
            <div className="text-2xl font-black text-[#45C7A2] mt-1">{activeGames}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#17101C]/60 border border-[#3A2942]">
            <div className="text-[11px] text-[#A898B0] font-semibold flex items-center gap-1.5">
              <XCircle size={14} className="text-[#B5A5BD]" />
              Pasif / Taslak
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

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div className="p-4 rounded-2xl bg-[#1E1426] border border-[#3A2942] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A898B0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Oyun adı, konu, ders veya açıklama ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#17101C] border border-[#49364F] text-xs sm:text-sm text-white placeholder-[#716779] focus:outline-none focus:border-[#D914C8]"
          />
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
        </div>
      </div>

      {/* ── GAMES CATALOG LISTING (CARDS GRID) ── */}
      {filteredGames.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#1E1426] border border-[#3A2942]">
          <Gamepad2 size={40} className="mx-auto text-[#716779] mb-3" />
          <h3 className="text-base font-bold text-white">Eşleşen oyun bulunamadı</h3>
          <p className="text-xs text-[#A898B0] mt-1">
            Filtreleme kriterlerini temizleyin veya yeni bir oyun yükleyin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGames.map((game) => (
            <motion.div
              key={game.id}
              layout
              className={`rounded-3xl border overflow-hidden transition-all flex flex-col justify-between ${
                game.isActive
                  ? 'bg-[#1E1426] border-[#3A2942] hover:border-[#8D49A6]'
                  : 'bg-[#17101C]/80 border-[#2D2035] opacity-75'
              }`}
            >
              <div>
                {/* Cover Image & Badges */}
                <div className="relative h-44 w-full bg-[#17101C] overflow-hidden group">
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E1426] via-transparent to-black/50" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-[10px] font-black uppercase text-[#FCE8FA] border border-white/10">
                      {game.category}
                    </span>

                    {/* Active/Passive Quick Switch */}
                    <button
                      onClick={() => handleToggleActive(game.id)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer ${
                        game.isActive
                          ? 'bg-[#45C7A2]/20 text-[#45C7A2] border border-[#45C7A2]/40'
                          : 'bg-[#2E1829] text-[#E0D0E8] border border-[#8D2B60]/40'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${game.isActive ? 'bg-[#45C7A2]' : 'bg-gray-500'}`} />
                      <span>{game.isActive ? 'Aktif' : 'Pasif'}</span>
                    </button>
                  </div>

                  {/* Bottom Image Stats */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-1 font-bold bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                      <Star size={13} className="text-yellow-400 fill-yellow-400" />
                      <span>{game.rating}</span>
                      <span className="text-[10px] text-[#C4B3CD]">({game.reviewCount})</span>
                    </div>
                    <div className="text-[11px] font-mono text-[#E0D0E8] bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                      {game.playsCount.toLocaleString('tr-TR')} oynama
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-black text-base text-white line-clamp-1">{game.title}</h3>
                    <p className="text-xs text-[#A898B0] line-clamp-2 mt-1 leading-relaxed">
                      {game.description}
                    </p>
                  </div>

                  {/* Classes & Subjects Tags */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[11px] text-[#C4B3CD]">
                      <GraduationCap size={13} className="text-[#D914C8] shrink-0" />
                      <span className="font-semibold">Hitap Ettiği Sınıflar:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {game.targetGrades.map((grade) => (
                        <span
                          key={grade}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#2B1D36] text-[#E0D0E8] border border-[#49364F]"
                        >
                          {grade}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1 text-[11px] text-[#C4B3CD]">
                      <BookOpen size={13} className="text-[#8D49A6] shrink-0" />
                      <span className="font-semibold">İlgili Dersler & Konular:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {game.subjects.map((subj) => (
                        <span
                          key={subj}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#4B075F]/30 text-[#FCE8FA] border border-[#8D49A6]/40"
                        >
                          {subj}
                        </span>
                      ))}
                      {game.topics.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#17101C] text-[#A898B0] border border-[#3A2942]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-[#17101C]/90 border-t border-[#3A2942] flex items-center justify-between gap-2">
                <a
                  href={`/student/gamestudio/play/${game.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2B1D36] hover:bg-[#3D264E] text-xs font-semibold text-white border border-[#49364F] transition-colors"
                >
                  <Eye size={13} />
                  <span>Önizle</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(game)}
                    className="p-2 rounded-xl bg-[#2B1D36] hover:bg-[#4B075F] text-[#F0D8FA] border border-[#49364F] transition-colors cursor-pointer"
                    title="Oyunu Düzenle"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(game.id)}
                    className="p-2 rounded-xl bg-[#2E1829] hover:bg-red-900/50 text-[#FFA8D8] hover:text-red-300 border border-[#8D2B60]/40 transition-colors cursor-pointer"
                    title="Oyunu Sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── DELETE CONFIRMATION DIALOG ── */}
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
                <h3 className="font-bold text-lg text-white">Oyunu Silmek İstiyor musunuz?</h3>
                <p className="text-xs text-[#A898B0] mt-1">
                  Bu işlem oyunu mağazadan ve öğrenci panellerinden tamamen kaldıracaktır.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2D2035] text-[#D2C5D8] text-xs font-bold hover:bg-[#3D264E] transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-lg shadow-red-600/30"
                >
                  Evet, Sil
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
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-[#A898B0] hover:text-white hover:bg-[#2D2035]"
                >
                  <X size={20} />
                </button>
              </div>

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
                    placeholder="Örn: Oxonom Matematik Şampiyonu"
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
                      type="url"
                      value={formCover}
                      onChange={(e) => setFormCover(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#17101C] border border-[#49364F] text-xs text-white focus:outline-none focus:border-[#D914C8]"
                    />
                    {formCover && (
                      <div className="w-11 h-10 rounded-xl overflow-hidden shrink-0 border border-[#49364F]">
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
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#2B1D36] text-[#E0D0E8] hover:bg-[#4B075F] border border-[#49364F] transition-colors"
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
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
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
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
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
                    <label className="block text-xs font-bold text-[#E0D0E8] mb-1.5">
                      Oyun Başlatma Yolu / URL
                    </label>
                    <input
                      type="text"
                      value={formGameUrl}
                      onChange={(e) => setFormGameUrl(e.target.value)}
                      placeholder="/student/gamestudio/play/math-runner"
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
                    className="px-5 py-2.5 rounded-xl bg-[#2D2035] text-[#D2C5D8] text-xs font-bold hover:bg-[#3D264E] transition-colors"
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
