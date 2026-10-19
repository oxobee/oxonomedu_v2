'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen,
  Search,
  Filter,
  Star,
  Bookmark,
  Sparkles,
  Layers,
  GraduationCap,
  Clock,
  CheckCircle2,
  BookMarked,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Info,
  X,
  Play,
  Share2,
  FileText,
  Calendar,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  MEB_TEXTBOOKS_CATALOG,
  type MebBookItem,
} from '@/lib/student/mebBooksData'
import {
  getAllReadingProgress,
  getFavoriteBookIds,
  toggleBookFavorite,
  getReadLaterBookIds,
  toggleBookReadLater,
  getBookReadingProgress,
  getBookNotes,
  getBookBookmarks,
  getStoredStudentNotes,
  type BookReadingProgress,
} from '@/lib/student/studentLibraryStorage'
import {
  isBookVisibleForStudent,
  getHiddenBookIds,
} from '@/lib/student/libraryVisibilityStorage'
import { getSynchronizedStudentProfile } from '@/lib/student/studentData'
import MobileBookReader from '@/components/Student/library/MobileBookReader'

interface StudentLibraryViewProps {
  initialTab?: string
  initialBookId?: number
  initialPage?: number
}

// Pre-defined Grade filter options
const GRADE_FILTER_OPTIONS = [
  { value: 'all', label: 'Tüm Sınıflar' },
  { value: '9. Sınıf', label: '9. Sınıf (Mevcut Sınıfım)', isStudentGrade: true },
  { value: '10. Sınıf', label: '10. Sınıf' },
  { value: '11. Sınıf', label: '11. Sınıf' },
  { value: '12. Sınıf', label: '12. Sınıf' },
  { value: '8. Sınıf', label: '8. Sınıf' },
  { value: '7. Sınıf', label: '7. Sınıf' },
  { value: '6. Sınıf', label: '6. Sınıf' },
  { value: '5. Sınıf', label: '5. Sınıf' },
  { value: '4. Sınıf', label: '4. Sınıf' },
  { value: '3. Sınıf', label: '3. Sınıf' },
  { value: '2. Sınıf', label: '2. Sınıf' },
  { value: '1. Sınıf', label: '1. Sınıf' },
]

export default function StudentLibraryView({
  initialTab,
  initialBookId,
  initialPage,
}: StudentLibraryViewProps) {
  // Student Profile & Grade
  const [studentGrade, setStudentGrade] = useState<string>('9. Sınıf')
  const [studentName, setStudentName] = useState<string>('Erçil UĞURLU')

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGrade, setSelectedGrade] = useState<string>('9. Sınıf')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedBookType, setSelectedBookType] = useState<string>('all')
  const [selectedKademe, setSelectedKademe] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'in_progress' | 'completed' | 'not_started' | 'favorites' | 'read_later'
  >('all')
  const [sortBy, setSortBy] = useState<'recommended' | 'alphabetical' | 'recent' | 'progress'>('recommended')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Stored state caches
  const [readingProgress, setReadingProgress] = useState<Record<number, BookReadingProgress>>({})
  const [favorites, setFavorites] = useState<number[]>([])
  const [readLater, setReadLater] = useState<number[]>([])
  const [totalNotesCount, setTotalNotesCount] = useState<number>(0)

  // Reader Modal State
  const [activeReaderBook, setActiveReaderBook] = useState<MebBookItem | null>(null)
  const [activeReaderPage, setActiveReaderPage] = useState<number | undefined>(initialPage)

  // Book Detail Modal State
  const [detailModalBook, setDetailModalBook] = useState<MebBookItem | null>(null)

  // Image load error cache (fallback to stylish placeholder)
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({})

  // Principal hidden book IDs
  const [hiddenBookIds, setHiddenBookIds] = useState<number[]>([])

  // Initialize Student Data & Storage Cache
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const profile = getSynchronizedStudentProfile()
      if (profile) {
        if (profile.gradeLevel) setStudentGrade(`${profile.gradeLevel}. Sınıf`)
        if (profile.name) setStudentName(profile.name)
      }

      setReadingProgress(getAllReadingProgress())
      setFavorites(getFavoriteBookIds())
      setReadLater(getReadLaterBookIds())
      setTotalNotesCount(getStoredStudentNotes().length)
      setHiddenBookIds(getHiddenBookIds())

      // Sync on external updates
      const handleProgressUpdate = () => setReadingProgress(getAllReadingProgress())
      const handleFavUpdate = () => setFavorites(getFavoriteBookIds())
      const handleReadLaterUpdate = () => setReadLater(getReadLaterBookIds())
      const handleNotesUpdate = () => setTotalNotesCount(getStoredStudentNotes().length)
      const handleVisibilityUpdate = () => setHiddenBookIds(getHiddenBookIds())

      window.addEventListener('oxonom_reading_progress_updated', handleProgressUpdate)
      window.addEventListener('oxonom_book_favorites_updated', handleFavUpdate)
      window.addEventListener('oxonom_book_readlater_updated', handleReadLaterUpdate)
      window.addEventListener('oxonom_student_notes_updated', handleNotesUpdate)
      window.addEventListener('oxonom_library_visibility_updated', handleVisibilityUpdate)

      // Query param parsing for direct link from Defterim/Planlayıcım
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const bookIdParam = urlParams.get('bookId')
        const pageParam = urlParams.get('page')
        const statusParam = urlParams.get('status')

        if (statusParam && ['in_progress', 'completed', 'favorites', 'read_later'].includes(statusParam)) {
          setStatusFilter(statusParam as any)
        }

        const targetId = initialBookId || (bookIdParam ? parseInt(bookIdParam, 10) : undefined)
        if (targetId) {
          const found = MEB_TEXTBOOKS_CATALOG.find((b) => b.id === targetId)
          if (found) {
            setActiveReaderBook(found)
            if (pageParam) setActiveReaderPage(parseInt(pageParam, 10))
          }
        }
      } catch (_) {}

      return () => {
        window.removeEventListener('oxonom_reading_progress_updated', handleProgressUpdate)
        window.removeEventListener('oxonom_book_favorites_updated', handleFavUpdate)
        window.removeEventListener('oxonom_book_readlater_updated', handleReadLaterUpdate)
        window.removeEventListener('oxonom_student_notes_updated', handleNotesUpdate)
        window.removeEventListener('oxonom_library_visibility_updated', handleVisibilityUpdate)
      }
    }
  }, [initialBookId, initialPage])

  // Extract unique subjects for the selected grade / catalog
  const availableSubjects = useMemo(() => {
    const set = new Set<string>()
    MEB_TEXTBOOKS_CATALOG.forEach((book) => {
      // Exclude hidden books from subject list
      if (!isBookVisibleForStudent(book.id, book.gradeName)) return
      if (selectedGrade === 'all' || book.gradeName === selectedGrade) {
        if (book.subject) set.add(book.subject)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr-TR'))
  }, [selectedGrade, hiddenBookIds])

  // Filter & Sort Logic
  const filteredBooks = useMemo(() => {
    return MEB_TEXTBOOKS_CATALOG.filter((book) => {
      // 0. Principal Visibility Filter: If hidden by school administration, DO NOT list!
      if (!isBookVisibleForStudent(book.id, book.gradeName)) {
        return false
      }
      // 1. Grade Filter
      if (selectedGrade !== 'all' && book.gradeName !== selectedGrade) {
        return false
      }

      // 2. Kademe Filter
      if (
        selectedKademe !== 'all' &&
        book.kademeLabel !== selectedKademe &&
        book.kademeSlug !== selectedKademe
      ) {
        return false
      }

      // 3. Subject Filter
      if (selectedSubject !== 'all' && book.subject !== selectedSubject) {
        return false
      }

      // 4. Book Type Filter
      if (selectedBookType !== 'all' && book.bookType !== selectedBookType) {
        return false
      }

      // 5. Reading Status Filter
      const progress = readingProgress[book.id]
      const isFav = favorites.includes(book.id)
      const isReadLater = readLater.includes(book.id)

      if (statusFilter === 'in_progress') {
        if (!progress || progress.status !== 'in_progress') return false
      } else if (statusFilter === 'completed') {
        if (!progress || progress.status !== 'completed') return false
      } else if (statusFilter === 'not_started') {
        if (progress && progress.status !== 'not_started') return false
      } else if (statusFilter === 'favorites') {
        if (!isFav) return false
      } else if (statusFilter === 'read_later') {
        if (!isReadLater) return false
      }

      // 6. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = book.title.toLowerCase().includes(q)
        const matchSubject = book.subject.toLowerCase().includes(q)
        const matchGrade = book.gradeName.toLowerCase().includes(q)
        const matchPublisher = book.publisher?.toLowerCase().includes(q) || false
        if (!matchTitle && !matchSubject && !matchGrade && !matchPublisher) {
          return false
        }
      }

      return true
    }).sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title, 'tr-TR')
      }
      if (sortBy === 'progress') {
        const pA = readingProgress[a.id]?.percent || 0
        const pB = readingProgress[b.id]?.percent || 0
        return pB - pA
      }
      if (sortBy === 'recent') {
        const rA = readingProgress[a.id]?.lastReadAt ? new Date(readingProgress[a.id].lastReadAt).getTime() : 0
        const rB = readingProgress[b.id]?.lastReadAt ? new Date(readingProgress[b.id].lastReadAt).getTime() : 0
        return rB - rA
      }
      // 'recommended': Prioritize student's own grade books, then reading in-progress, then interactive
      const aIsCurrentGrade = a.gradeName === studentGrade ? 1 : 0
      const bIsCurrentGrade = b.gradeName === studentGrade ? 1 : 0
      if (aIsCurrentGrade !== bIsCurrentGrade) return bIsCurrentGrade - aIsCurrentGrade

      const aInProgress = readingProgress[a.id]?.status === 'in_progress' ? 1 : 0
      const bInProgress = readingProgress[b.id]?.status === 'in_progress' ? 1 : 0
      if (aInProgress !== bInProgress) return bInProgress - aInProgress

      const aInteractive = a.etkilesimliKitapUrl ? 1 : 0
      const bInteractive = b.etkilesimliKitapUrl ? 1 : 0
      return bInteractive - aInteractive
    })
  }, [
    selectedGrade,
    selectedKademe,
    selectedSubject,
    selectedBookType,
    statusFilter,
    searchQuery,
    sortBy,
    readingProgress,
    favorites,
    readLater,
    studentGrade,
    hiddenBookIds,
  ])

  // Aggregate Stats
  const stats = useMemo(() => {
    let inProg = 0
    let completed = 0
    Object.values(readingProgress).forEach((p) => {
      if (p.status === 'in_progress') inProg++
      if (p.status === 'completed') completed++
    })
    const visibleCatalog = MEB_TEXTBOOKS_CATALOG.filter((b) => isBookVisibleForStudent(b.id, b.gradeName))
    return {
      total: visibleCatalog.length,
      gradeTotal: visibleCatalog.filter((b) => b.gradeName === studentGrade).length,
      inProgress: inProg,
      completed,
      favoritesCount: favorites.length,
      readLaterCount: readLater.length,
    }
  }, [readingProgress, favorites, readLater, studentGrade])

  // Handlers
  const handleOpenReader = (book: MebBookItem, page?: number) => {
    setActiveReaderBook(book)
    setActiveReaderPage(page)
  }

  const handleToggleFavorite = (e: React.MouseEvent, bookId: number) => {
    e.stopPropagation()
    const added = toggleBookFavorite(bookId)
    setFavorites(getFavoriteBookIds())
    toast.success(added ? 'Kitap favorilerinize eklendi.' : 'Kitap favorilerinizden kaldırıldı.')
  }

  const handleToggleReadLater = (e: React.MouseEvent, bookId: number) => {
    e.stopPropagation()
    const added = toggleBookReadLater(bookId)
    setReadLater(getReadLaterBookIds())
    toast.success(added ? 'Daha sonra okumak üzere kaydedildi.' : 'Listeden kaldırıldı.')
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedGrade(studentGrade)
    setSelectedSubject('all')
    setSelectedBookType('all')
    setSelectedKademe('all')
    setStatusFilter('all')
    setSortBy('recommended')
    toast.success('Filtreler sıfırlandı.')
  }

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedGrade !== studentGrade ||
    selectedSubject !== 'all' ||
    selectedBookType !== 'all' ||
    selectedKademe !== 'all' ||
    statusFilter !== 'all' ||
    sortBy !== 'recommended'

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070B14] pb-24">
      {/* ── 1. OXONOM BRAND HERO AREA (Modern, animated patterns, responsive) ── */}
      <div className="relative overflow-hidden bg-brand-gradient-dark text-white">
        {/* Subtle geometric pattern overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)`,
            backgroundSize: '100px 100px',
          }}
        />

        {/* Ambient glow blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D914C8]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#4B075F]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Top badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20">
              <Sparkles size={13} className="text-amber-300" />
              <span>T.C. Millî Eğitim Bakanlığı Onaylı Müfredat</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold border border-emerald-400/30">
              <CheckCircle2 size={12} />
              <span>312 Orijinal Ders Kitabı</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-semibold border border-cyan-400/30">
              <span>9-A · {studentName}</span>
            </span>
          </div>

          {/* Heading */}
          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Kitaplık & Dijital E-Kitap Okuyucu
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-blue-100/90 leading-relaxed font-normal">
              MEB müfredat ders kitaplarını akıllı tahta uyumlu etkileşimli flipbook veya PDF olarak okuyun,
              önemli yerlere notlar alın ve çalışma ajandanıza okuma hedefleri ekleyin.
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mt-6">
            <button
              type="button"
              onClick={() => {
                setSelectedGrade(studentGrade)
                setStatusFilter('all')
              }}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between text-blue-200 text-xs">
                <span>{studentGrade} Kitapları</span>
                <GraduationCap size={15} />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {stats.gradeTotal} <span className="text-xs font-normal text-blue-200">Kitap</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('in_progress')}
              className={`p-3 rounded-2xl backdrop-blur-md border transition-all text-left group cursor-pointer ${
                statusFilter === 'in_progress'
                  ? 'bg-white text-blue-900 border-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
              }`}
            >
              <div className="flex items-center justify-between text-xs opacity-80">
                <span>Okumaya Devam</span>
                <Clock size={15} />
              </div>
              <div className="text-xl sm:text-2xl font-black mt-1">
                {stats.inProgress} <span className="text-xs font-normal opacity-80">Kitap</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('favorites')}
              className={`p-3 rounded-2xl backdrop-blur-md border transition-all text-left group cursor-pointer ${
                statusFilter === 'favorites'
                  ? 'bg-white text-blue-900 border-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
              }`}
            >
              <div className="flex items-center justify-between text-xs opacity-80">
                <span>Favorilerim</span>
                <Star size={15} />
              </div>
              <div className="text-xl sm:text-2xl font-black mt-1">
                {stats.favoritesCount} <span className="text-xs font-normal opacity-80">Kitap</span>
              </div>
            </button>

            <Link
              href="/student/planner?tab=notes"
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 transition-all text-left group"
            >
              <div className="flex items-center justify-between text-blue-200 text-xs">
                <span>Defterimdeki Notlar</span>
                <FileText size={15} />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {totalNotesCount} <span className="text-xs font-normal text-blue-200">Not</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. SEARCH & COMPREHENSIVE FILTER CONTROLS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-4">
        {/* Search Bar + Grade Switcher + View Mode */}
        <div className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Kitap adı, ders, yazar veya MEB yayın no ara... (örn: Matematik, Şiir)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Grade Select Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                aria-label="Sınıf Seçimi"
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                {GRADE_FILTER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Select Dropdown */}
            <div className="relative shrink-0">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                aria-label="Ders Seçimi"
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="all">Tüm Dersler ({availableSubjects.length})</option>
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#0E1526] text-blue-600 shadow-xs'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="Grid Görünümü"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-[#0E1526] text-blue-600 shadow-xs'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="Liste Görünümü"
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Chips + Sort + Reset (Mobile Horizontal Scroll) */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-[#4B075F] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0E1526] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              Tüm Kitaplar ({selectedGrade === 'all' ? stats.total : stats.gradeTotal})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === 'in_progress'
                  ? 'bg-[#4B075F] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0E1526] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              <Clock size={12} />
              <span>Devam Edenler ({stats.inProgress})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === 'completed'
                  ? 'bg-[#4B075F] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0E1526] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              <CheckCircle2 size={12} />
              <span>Tamamlananlar ({stats.completed})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('favorites')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === 'favorites'
                  ? 'bg-[#4B075F] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0E1526] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              <Star size={12} />
              <span>Favorilerim ({stats.favoritesCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('read_later')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === 'read_later'
                  ? 'bg-[#4B075F] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0E1526] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              <Bookmark size={12} />
              <span>Daha Sonra Oku ({stats.readLaterCount})</span>
            </button>
          </div>

          {/* Sort & Reset Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sıralama Ölçütü"
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="recommended">Önerilen Sıralama</option>
              <option value="alphabetical">Alfabetik (A-Z)</option>
              <option value="recent">Son Okunanlar</option>
              <option value="progress">İlerleme Yüzdesi</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1 hover:bg-rose-500/20 transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw size={12} />
                <span>Sıfırla</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. BOOKS LIST / GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Results count & status bar */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div>
            Toplam <span className="font-bold text-gray-900 dark:text-white">{filteredBooks.length}</span> kitap
            listeleniyor
            {selectedGrade !== 'all' && (
              <span className="ml-1">
                (<strong>{selectedGrade}</strong> filtresi aktif)
              </span>
            )}
          </div>
          {filteredBooks.length > 0 && (
            <div className="text-[11px] text-gray-400 hidden sm:block">
              Okumak istediğiniz kitaba tıklayarak e-kitap okuyucusunu başlatabilirsiniz.
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <BookOpen size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Aradığınız kriterde kitap bulunamadı</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Farklı bir arama terimi deneyebilir, sınıf filtresini &quot;Tüm Sınıflar&quot; olarak değiştirebilir veya filtreleri sıfırlayabilirsiniz.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <RotateCcw size={13} />
              <span>Filtreleri Temizle</span>
            </button>
          </div>
        )}

        {/* GRID VIEW */}
        {viewMode === 'grid' && filteredBooks.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
            {filteredBooks.map((book) => {
              const prog = readingProgress[book.id]
              const isFav = favorites.includes(book.id)
              const isLater = readLater.includes(book.id)
              const hasImgErr = imgErrors[book.id]

              return (
                <div
                  key={book.id}
                  onClick={() => handleOpenReader(book)}
                  className="group relative rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 hover:border-blue-500/50 hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  {/* Book Cover Area */}
                  <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
                    {!hasImgErr ? (
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        loading="lazy"
                        onError={() => setImgErrors((prev) => ({ ...prev, [book.id]: true }))}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      // Fallback elegant textbook cover
                      <div className="w-full h-full p-3 flex flex-col justify-between bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">
                            MEB
                          </span>
                          <span className="text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded">
                            {book.gradeName}
                          </span>
                        </div>
                        <div className="space-y-1 my-auto text-center">
                          <BookOpen size={24} className="mx-auto text-blue-200 opacity-80" />
                          <div className="text-xs font-black line-clamp-3 leading-snug">{book.title}</div>
                        </div>
                        <div className="text-[9px] text-blue-200/80 text-center font-medium">
                          {book.subject}
                        </div>
                      </div>
                    )}

                    {/* Gradient Overlay for badges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Top Action Badges: Interactive + Heart + Bookmark */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                      {book.etkilesimliKitapUrl ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500 text-white shadow-xs">
                          <Sparkles size={9} />
                          <span>İnteraktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black/50 text-white backdrop-blur-xs">
                          PDF
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleToggleFavorite(e, book.id)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
                            isFav
                              ? 'bg-rose-500 text-white shadow-md'
                              : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/60'
                          }`}
                          title={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                        >
                          <Star size={13} fill={isFav ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleToggleReadLater(e, book.id)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
                            isLater
                              ? 'bg-[#4B075F] text-white shadow-md'
                              : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/60'
                          }`}
                          title={isLater ? 'Listeden çıkar' : 'Daha sonra oku'}
                        >
                          <Bookmark size={13} fill={isLater ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Badges on Cover */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white font-bold">
                      <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs line-clamp-1">
                        {book.gradeName}
                      </span>
                      {prog && prog.percent > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-[#4B075F]/90 text-white font-extrabold backdrop-blur-xs">
                          %{prog.percent}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Info Area */}
                  <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      <div className="text-[10px] font-extrabold text-[#4B075F] dark:text-[#C58ADB] uppercase tracking-wider line-clamp-1">
                        {book.subject}
                      </div>
                      <h3
                        className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#4B075F] dark:group-hover:text-[#C58ADB] transition-colors"
                        title={book.title}
                      >
                        {book.title}
                      </h3>
                      {book.publisher && (
                        <div className="text-[10px] text-gray-400 line-clamp-1">{book.publisher}</div>
                      )}
                    </div>

                    {/* Reading Progress Indicator */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 space-y-1.5">
                      {prog && prog.percent > 0 ? (
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 font-semibold mb-1">
                            <span>Sayfa {prog.currentPage}</span>
                            <span>%{prog.percent}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-brand-gradient transition-all duration-300"
                              style={{ width: `${prog.percent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-gray-400">Henüz başlanmadı</div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenReader(book, prog?.currentPage)
                          }}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <BookOpen size={12} />
                          <span>{prog && prog.percent > 0 ? 'Devam Et' : 'Oku'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDetailModalBook(book)
                          }}
                          className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Kitap Bilgisi"
                        >
                          <Info size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && filteredBooks.length > 0 && (
          <div className="space-y-3">
            {filteredBooks.map((book) => {
              const prog = readingProgress[book.id]
              const isFav = favorites.includes(book.id)
              const isLater = readLater.includes(book.id)
              const hasImgErr = imgErrors[book.id]

              return (
                <div
                  key={book.id}
                  onClick={() => handleOpenReader(book)}
                  className="group p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 hover:border-blue-500/50 hover:shadow-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  {/* Left: Thumbnail & Titles */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="relative w-14 sm:w-16 aspect-[3/4] rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                      {!hasImgErr ? (
                        <img
                          src={book.imageUrl}
                          alt={book.title}
                          loading="lazy"
                          onError={() => setImgErrors((prev) => ({ ...prev, [book.id]: true }))}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-800 flex items-center justify-center text-white">
                          <BookOpen size={16} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="font-extrabold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          {book.gradeName}
                        </span>
                        <span className="font-extrabold text-gray-500 dark:text-gray-400">
                          {book.subject}
                        </span>
                        {book.etkilesimliKitapUrl && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                            İnteraktif Flipbook
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-extrabold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {book.title}
                      </h3>
                      <div className="text-xs text-gray-400 line-clamp-1">
                        {book.publisher || 'Devlet Kitapları'} · {book.kademeLabel}
                      </div>
                    </div>
                  </div>

                  {/* Right: Progress & Actions */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                    {/* Progress Info */}
                    <div className="text-right sm:w-32">
                      {prog && prog.percent > 0 ? (
                        <div>
                          <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            Sayfa {prog.currentPage} (%{prog.percent})
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mt-1">
                            <div
                              className="h-full rounded-full bg-brand-gradient"
                              style={{ width: `${prog.percent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">Henüz başlanmadı</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(e, book.id)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                          isFav
                            ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                            : 'text-gray-400 hover:text-gray-600 bg-gray-50 dark:bg-[#131C31]'
                        }`}
                        title="Favori"
                      >
                        <Star size={14} fill={isFav ? 'currentColor' : 'none'} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleToggleReadLater(e, book.id)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                          isLater
                            ? 'text-[#4B075F] bg-[#F0D8FA] dark:bg-[#2D2035]'
                            : 'text-gray-400 hover:text-gray-600 bg-gray-50 dark:bg-[#131C31]'
                        }`}
                        title="Daha sonra oku"
                      >
                        <Bookmark size={14} fill={isLater ? 'currentColor' : 'none'} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenReader(book, prog?.currentPage)
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <BookOpen size={13} />
                        <span>{prog && prog.percent > 0 ? 'Devam Et' : 'Kitabı Oku'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── 4. BOOK DETAIL MODAL ── */}
      {detailModalBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setDetailModalBook(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                  <img
                    src={detailModalBook.imageUrl}
                    alt={detailModalBook.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F0D8FA] dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB]">
                    {detailModalBook.gradeName} · {detailModalBook.subject}
                  </span>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white mt-1 leading-snug">
                    {detailModalBook.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalBook(null)}
                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#131C31] p-4 rounded-2xl">
              <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-800/50">
                <span className="text-gray-400">Yayıncı / Kurum:</span>
                <span className="font-bold">{detailModalBook.publisher || 'Millî Eğitim Bakanlığı'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-800/50">
                <span className="text-gray-400">Kademe:</span>
                <span className="font-bold">{detailModalBook.kademeLabel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-800/50">
                <span className="text-gray-400">Kitap Türü:</span>
                <span className="font-bold">{detailModalBook.bookType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-800/50">
                <span className="text-gray-400">Okuma Durumu:</span>
                <span className="font-bold">
                  {readingProgress[detailModalBook.id]?.status === 'completed'
                    ? 'Tamamlandı'
                    : readingProgress[detailModalBook.id]?.status === 'in_progress'
                    ? `Devam Ediyor (%${readingProgress[detailModalBook.id].percent})`
                    : 'Henüz Başlanmadı'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">İnteraktif Özellik:</span>
                <span className="font-bold">
                  {detailModalBook.etkilesimliKitapUrl ? 'Evet (Etkileşimli Flipbook)' : 'PDF Okuyucu'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const target = detailModalBook
                  setDetailModalBook(null)
                  handleOpenReader(target, readingProgress[target.id]?.currentPage)
                }}
                className="flex-1 py-2.5 rounded-2xl bg-[#4B075F] hover:bg-[#620B79] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <BookOpen size={14} />
                <span>Kitabı Aç ve Oku</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailModalBook(null)}
                className="px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. FULL-SCREEN MOBILE-FIRST E-BOOK READER COMPONENT ── */}
      {activeReaderBook && (
        <MobileBookReader
          book={activeReaderBook}
          initialPage={activeReaderPage}
          onClose={() => {
            setActiveReaderBook(null)
            setActiveReaderPage(undefined)
            setReadingProgress(getAllReadingProgress())
          }}
        />
      )}
    </div>
  )
}
