'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  BookOpen,
  Search,
  Filter,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { MEB_TEXTBOOKS_CATALOG, type MebBookItem } from '@/lib/student/mebBooksData'
import {
  getHiddenBookIds,
  getClassHiddenBookIds,
  setBookVisibility,
  toggleBookVisibility,
  setMultipleBooksVisibility,
  isDefaultHiddenBook,
} from '@/lib/student/libraryVisibilityStorage'
import MobileBookReader from '@/components/Student/library/MobileBookReader'

const GRADE_OPTIONS = [
  { value: 'all', label: 'Tüm Sınıflar (312 Kitap)' },
  { value: '9. Sınıf', label: '9. Sınıf (9-A Şubesi)' },
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

export default function PrincipalLibraryManagementView() {
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all')

  // Hidden book IDs state
  const [hiddenBookIds, setHiddenBookIds] = useState<number[]>([])

  // Preview reader
  const [previewBook, setPreviewBook] = useState<MebBookItem | null>(null)

  // Load hidden IDs and sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHiddenBookIds(getHiddenBookIds())

      const handleUpdate = () => {
        setHiddenBookIds(getHiddenBookIds())
      }
      window.addEventListener('oxonom_library_visibility_updated', handleUpdate)
      window.addEventListener('storage', handleUpdate)
      return () => {
        window.removeEventListener('oxonom_library_visibility_updated', handleUpdate)
        window.removeEventListener('storage', handleUpdate)
      }
    }
  }, [])

  // Available subjects for selected grade
  const availableSubjects = useMemo(() => {
    const set = new Set<string>()
    MEB_TEXTBOOKS_CATALOG.forEach((book) => {
      if (selectedGrade === 'all' || book.gradeName === selectedGrade) {
        if (book.subject) set.add(book.subject)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr-TR'))
  }, [selectedGrade])

  // Filtered books
  const filteredBooks = useMemo(() => {
    return MEB_TEXTBOOKS_CATALOG.filter((book) => {
      // Grade filter
      if (selectedGrade !== 'all' && book.gradeName !== selectedGrade) {
        return false
      }

      // Subject filter
      if (selectedSubject !== 'all' && book.subject !== selectedSubject) {
        return false
      }

      // Status filter
      const isHidden = hiddenBookIds.includes(book.id)
      if (statusFilter === 'visible' && isHidden) return false
      if (statusFilter === 'hidden' && !isHidden) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = book.title.toLowerCase().includes(q)
        const matchSubject = book.subject.toLowerCase().includes(q)
        const matchGrade = book.gradeName.toLowerCase().includes(q)
        if (!matchTitle && !matchSubject && !matchGrade) return false
      }

      return true
    })
  }, [selectedGrade, selectedSubject, statusFilter, searchQuery, hiddenBookIds])

  // Aggregate stats
  const stats = useMemo(() => {
    const currentGradeBooks = MEB_TEXTBOOKS_CATALOG.filter(
      (b) => selectedGrade === 'all' || b.gradeName === selectedGrade
    )
    const hiddenInScope = currentGradeBooks.filter((b) => hiddenBookIds.includes(b.id)).length
    const visibleInScope = currentGradeBooks.length - hiddenInScope

    const arabicOrQuranHidden = currentGradeBooks.filter(
      (b) => isDefaultHiddenBook(b) && hiddenBookIds.includes(b.id)
    ).length

    return {
      total: currentGradeBooks.length,
      visible: visibleInScope,
      hidden: hiddenInScope,
      arabicOrQuranHidden,
    }
  }, [selectedGrade, hiddenBookIds])

  // Toggle single book visibility
  const handleToggle = (book: MebBookItem) => {
    const nextVisible = toggleBookVisibility(book.id, book.gradeName)
    setHiddenBookIds(getHiddenBookIds())
    if (nextVisible) {
      toast.success(`"${book.title}" öğrencilere görünür yapıldı.`)
    } else {
      toast.error(`"${book.title}" öğrencilerden gizlendi.`)
    }
  }

  // Batch show all currently filtered
  const handleShowAllFiltered = () => {
    const ids = filteredBooks.map((b) => b.id)
    setMultipleBooksVisibility(ids, true, selectedGrade)
    setHiddenBookIds(getHiddenBookIds())
    toast.success(`${ids.length} kitap öğrencilere açıldı.`)
  }

  // Batch hide all currently filtered
  const handleHideAllFiltered = () => {
    const ids = filteredBooks.map((b) => b.id)
    setMultipleBooksVisibility(ids, false, selectedGrade)
    setHiddenBookIds(getHiddenBookIds())
    toast.error(`${ids.length} kitap öğrencilerden gizlendi.`)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── 1. HEADER & IDENTITY ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <ShieldCheck size={14} />
            <span>Müdürlük İdari Müfredat Yetkisi</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Kitaplık ve Ders Kitapları Yönetimi
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Öğrencilerin kitaplığında listelenecek MEB ders kitaplarını sınıf ve ders bazında tik atarak
            hızlıca belirleyin. Gizlenen kitaplar öğrenci portalında asla listelenmez.
          </p>
        </div>
      </div>

      {/* ── 2. METRIC STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
          <div className="text-xs text-gray-400 font-medium">Toplam Müfredat Kitabı</div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {stats.total} <span className="text-xs font-normal text-gray-400">Kitap</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-1">{selectedGrade === 'all' ? 'Tüm Kademeler' : selectedGrade}</div>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 shadow-xs">
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center justify-between">
            <span>Öğrenciye Açık</span>
            <Eye size={15} />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.visible} <span className="text-xs font-normal">Aktif</span>
          </div>
          <div className="text-[10px] text-emerald-600/80 mt-1">Öğrenciler okuyabilir</div>
        </div>

        <div className="p-4 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 shadow-xs">
          <div className="text-xs text-rose-700 dark:text-rose-400 font-medium flex items-center justify-between">
            <span>İdarece Gizlenen</span>
            <EyeOff size={15} />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {stats.hidden} <span className="text-xs font-normal">Gizli</span>
          </div>
          <div className="text-[10px] text-rose-600/80 mt-1">Öğrenci kitaplığında çıkmaz</div>
        </div>
      </div>

      {/* ── 3. FILTER & SEARCH CONTROLS ── */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Kitap veya ders adı ara... (örn: Matematik, Fizik, Arapça)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Sınıf Seçimi */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
          >
            {GRADE_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>

          {/* Ders Seçimi */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
          >
            <option value="all">Tüm Dersler ({availableSubjects.length})</option>
            {availableSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Görünürlük Durumu */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="visible">Yalnızca Açık Olanlar</option>
            <option value="hidden">Yalnızca Gizlenenler</option>
          </select>
        </div>

        {/* Batch Actions & Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Filtreye uyan <strong>{filteredBooks.length}</strong> kitap listeleniyor.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShowAllFiltered}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check size={14} />
              <span>Listelenenlerin Tümünü Aç</span>
            </button>

            <button
              type="button"
              onClick={handleHideAllFiltered}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X size={14} />
              <span>Listelenenlerin Tümünü Gizle</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. BOOKS VISIBILITY LIST / TABLE ── */}
      <div className="bg-white dark:bg-[#0E1526] rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
          {filteredBooks.map((book) => {
            const isHidden = hiddenBookIds.includes(book.id)
            const isVisible = !isHidden
            const isAutoHidden = isDefaultHiddenBook(book)

            return (
              <div
                key={book.id}
                className={`p-3.5 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isHidden
                    ? 'bg-rose-500/[0.02] dark:bg-rose-950/[0.04]'
                    : 'hover:bg-gray-50/80 dark:hover:bg-[#121B32]/60'
                }`}
              >
                {/* Book Details */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Thumbnail */}
                  <div className="relative w-12 sm:w-14 aspect-[3/4] rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 border border-gray-200/50 dark:border-gray-700/50">
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    {isHidden && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white">
                        <EyeOff size={16} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {book.gradeName}
                      </span>
                      <span className="font-bold text-gray-500 dark:text-gray-400">
                        {book.subject}
                      </span>
                      {book.etkilesimliKitapUrl && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold">
                          Flipbook
                        </span>
                      )}
                    </div>

                    <h3 className={`text-xs sm:text-sm font-extrabold line-clamp-1 ${
                      isHidden ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'
                    }`}>
                      {book.title}
                    </h3>

                    <div className="text-[11px] text-gray-400 line-clamp-1">
                      {book.publisher || 'Devlet Kitapları'} · {book.kademeLabel}
                    </div>
                  </div>
                </div>

                {/* Right: Status Toggle Switch + Preview */}
                <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setPreviewBook(book)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title="Kitabı Önizle"
                  >
                    <BookOpen size={14} />
                    <span className="hidden sm:inline">İncele</span>
                  </button>

                  {/* High Contrast Direct Checkbox / Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggle(book)}
                    className={`h-10 px-4 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                      isVisible
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-300/50 dark:border-rose-900/60 hover:bg-rose-200'
                    }`}
                  >
                    {isVisible ? (
                      <>
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span>Öğrenciye Açık</span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
                          <EyeOff size={12} />
                        </div>
                        <span>Gizlendi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filteredBooks.length === 0 && (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <BookOpen size={32} className="mx-auto text-gray-300" />
            <div className="font-bold">Arama kriterlerinize uyan kitap bulunamadı.</div>
          </div>
        )}
      </div>

      {/* Preview Modal for Principal */}
      {previewBook && (
        <MobileBookReader
          book={previewBook}
          onClose={() => setPreviewBook(null)}
        />
      )}
    </div>
  )
}
